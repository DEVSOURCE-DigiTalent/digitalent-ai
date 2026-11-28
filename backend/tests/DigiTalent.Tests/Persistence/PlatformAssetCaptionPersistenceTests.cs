using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using CaptionStatus = DigiTalent.Domain.Constants.Statuses.PlatformAssetCaption;

namespace DigiTalent.Tests.Persistence;

/// <summary>
/// platform_asset_captions (schema v3.11) against PostgreSQL: jsonb cues round-trip, one row per video × language and
/// the CHECK constraints InMemory ignores.
/// </summary>
[Collection("PostgresIntegration")]
public class PlatformAssetCaptionPersistenceTests
{
    private static PlatformAsset Video() => new()
    {
        Kind = PlatformCatalog.AssetKind.Video, FileName = "bai.mp4", ContentType = "video/mp4", SizeBytes = 1024,
        StorageKey = $"captions-test/{Guid.NewGuid():N}.mp4",
    };

    private static PlatformAssetCaption Caption(Guid assetId) => new()
    {
        AssetId = assetId, Language = PlatformCatalog.Captions.Vietnamese, Status = CaptionStatus.Ready,
        Source = PlatformCatalog.Captions.SourceManual,
        DraftCues = PlatformCaptionRules.Serialize(new[] { new CaptionCueDto { StartMs = 0, EndMs = 1500, Text = "Xin chào\n\"các bạn\"" } }),
    };

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Cues_RoundTripThroughJsonb_AndTheRulesOfTheTableHold()
    {
        var video = Video();
        await using (var context = PostgresTestDatabase.CreateContext())
        {
            await PostgresTestDatabase.MigrateAsync(context);
            context.PlatformAssets.Add(video);
            var caption = Caption(video.Id);
            caption.PublishedCues = caption.DraftCues;
            caption.PublishedAt = DateTimeOffset.UtcNow;
            context.PlatformAssetCaptions.Add(caption);
            await context.SaveChangesAsync();
        }

        await using (var verify = PostgresTestDatabase.CreateContext())
        {
            var stored = await verify.PlatformAssetCaptions.AsNoTracking().SingleAsync(c => c.AssetId == video.Id);
            var draft = PlatformCaptionRules.Parse(stored.DraftCues);
            draft.Should().ContainSingle().Which.Text.Should().Be("Xin chào\n\"các bạn\"");
            PlatformCaptionRules.SameCues(draft, PlatformCaptionRules.Parse(stored.PublishedCues)).Should().BeTrue("jsonb đổi cách viết nhưng không đổi nội dung");
        }

        await using (var duplicate = PostgresTestDatabase.CreateContext())
        {
            duplicate.PlatformAssetCaptions.Add(Caption(video.Id));
            var act = () => duplicate.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>("một video chỉ có một dòng phụ đề cho mỗi ngôn ngữ");
        }

        foreach (var broken in new Action<PlatformAssetCaption>[]
                 {
                     c => c.PublishedCues = "[]",                       // published without published_at
                     c => c.ErrorCode = "AI_BUSY",                       // an error on a READY draft
                     c => c.Status = "DONE",
                     c => c.Language = "en",
                 })
        {
            var other = Video();
            await using var context = PostgresTestDatabase.CreateContext();
            context.PlatformAssets.Add(other);
            var caption = Caption(other.Id);
            broken(caption);
            context.PlatformAssetCaptions.Add(caption);
            var act = () => context.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>();
        }
    }
}
