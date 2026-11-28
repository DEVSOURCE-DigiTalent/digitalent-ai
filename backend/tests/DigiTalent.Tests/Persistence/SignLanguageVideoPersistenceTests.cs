using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;
using TrackStatus = DigiTalent.Domain.Constants.Statuses.SignLanguageTrack;

namespace DigiTalent.Tests.Persistence;

/// <summary>
/// Schema v3.13 against PostgreSQL: sign-language tracks and sentences (jsonb round-trip, one track per video × sign
/// language, CHECK constraints) and the sign variants (one sign per region × variant, one default per word).
/// </summary>
[Collection("PostgresIntegration")]
public class SignLanguageVideoPersistenceTests
{
    private static PlatformAsset Video() => new()
    {
        Kind = PlatformCatalog.AssetKind.Video, FileName = "bai.mp4", ContentType = "video/mp4", SizeBytes = 1024,
        StorageKey = $"sign-video-test/{Guid.NewGuid():N}.mp4",
    };

    private static PlatformSignLanguageTrack Track(Guid assetId) => new()
    {
        SourceAssetId = assetId, Language = "vi", SignLanguage = SignLanguage.Code.Vsl, Region = SignLanguage.Region.National,
        CaptionSource = SignVideo.CaptionSource.Published, CaptionFingerprint = new string('a', 64), RenderMode = SignVideo.RenderMode.Overlay,
        Renderer = SignVideo.Renderer.Clip, Status = TrackStatus.ReadyToRender, Settings = "{}",
    };

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Tracks_AndSentences_RoundTrip_AndTheRulesOfTheTablesHold()
    {
        var video = Video();
        var track = Track(video.Id);
        var items = new List<SignSequenceItem>
        {
            new() { SourceText = "Chào mừng", NormalizedText = "chào mừng", GlossId = Guid.NewGuid(), Gloss = "chào mừng", MatchType = SignVideo.Match.ExactSentence, Confidence = 1, StartMs = 0, EndMs = 900 },
            new() { SourceText = "về", NormalizedText = "về", MatchType = SignVideo.Match.Missing, IsMissing = true, Hint = "FUNCTION_WORD" },
        };
        await using (var context = PostgresTestDatabase.CreateContext())
        {
            await PostgresTestDatabase.MigrateAsync(context);
            context.PlatformAssets.Add(video);
            context.PlatformSignLanguageTracks.Add(track);
            var segment = new PlatformSignLanguageSegment
            {
                TrackId = track.Id, SegmentIndex = 0, CaptionText = "Chào mừng về", StartMs = 0, EndMs = 2000, ReviewStatus = SignVideo.Review.Pending,
            };
            SignVideoRules.Store(new SignSegmentState(segment, items));
            context.PlatformSignLanguageSegments.Add(segment);
            await context.SaveChangesAsync();
        }

        await using (var verify = PostgresTestDatabase.CreateContext())
        {
            var stored = await verify.PlatformSignLanguageSegments.AsNoTracking().SingleAsync(s => s.TrackId == track.Id);
            var read = SignVideoRules.Parse(stored.Sequence);
            read.Select(i => (i.SourceText, i.GlossId, i.MatchType)).Should().Equal(items.Select(i => (i.SourceText, i.GlossId, i.MatchType)));
            read[1].Hint.Should().Be("FUNCTION_WORD");
            stored.Missing.Should().Contain("về");
            stored.Confidence.Should().Be(0.5m);
        }

        await using (var duplicate = PostgresTestDatabase.CreateContext())
        {
            duplicate.PlatformSignLanguageTracks.Add(Track(video.Id));
            var act = () => duplicate.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>("một video chỉ có một video ký hiệu cho mỗi ngôn ngữ ký hiệu");
        }

        foreach (var broken in new Action<PlatformSignLanguageTrack>[]
                 {
                     t => t.Status = "DONE",
                     t => t.Status = TrackStatus.Ready,                 // READY without an output
                     t => t.ErrorCode = SignVideo.Errors.RenderFailed,  // an error on a track that did not fail
                     t => t.RenderMode = "PIP",
                     t => t.Region = "Miền Bắc",
                     t => t.Progress = 101,
                     t => { t.PublishedAt = DateTimeOffset.UtcNow; },   // published without an output
                 })
        {
            var other = Video();
            await using var context = PostgresTestDatabase.CreateContext();
            context.PlatformAssets.Add(other);
            var candidate = Track(other.Id);
            broken(candidate);
            context.PlatformSignLanguageTracks.Add(candidate);
            var act = () => context.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>();
        }

        await using (var badSentence = PostgresTestDatabase.CreateContext())
        {
            badSentence.PlatformSignLanguageSegments.Add(new PlatformSignLanguageSegment
            {
                TrackId = track.Id, SegmentIndex = 1, CaptionText = "x", StartMs = 500, EndMs = 400, ReviewStatus = SignVideo.Review.Pending,
            });
            var act = () => badSentence.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>("kết thúc trước khi bắt đầu");
        }
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task SignVariants_AreUniquePerRegionAndVariant_WithOneDefaultPerWord()
    {
        var word = $"từ thử {Guid.NewGuid():N}";
        SignGloss Sign(string region, string? variant = null, bool preferred = false) => new()
        {
            Gloss = word, Normalized = word, Kind = SignLanguage.Kind.Word, Status = Statuses.SignGloss.Draft, Region = region, Variant = variant, IsPreferred = preferred,
        };

        await using (var context = PostgresTestDatabase.CreateContext())
        {
            await PostgresTestDatabase.MigrateAsync(context);
            context.SignGlosses.AddRange(Sign(SignLanguage.Region.North, preferred: true), Sign(SignLanguage.Region.South), Sign(SignLanguage.Region.South, "B"));
            await context.SaveChangesAsync();
            var stored = await context.SignGlosses.AsNoTracking().Where(g => g.Normalized == word).ToListAsync();
            stored.Should().OnlyContain(g => g.SignLanguage == SignLanguage.Code.Vsl && g.Synonyms == "[]" && !g.ConsentConfirmed);
        }

        foreach (var duplicate in new[] { Sign(SignLanguage.Region.South), Sign(SignLanguage.Region.South, "B"), Sign(SignLanguage.Region.National, "C", preferred: true) })
        {
            await using var context = PostgresTestDatabase.CreateContext();
            context.SignGlosses.Add(duplicate);
            var act = () => context.SaveChangesAsync();
            await act.Should().ThrowAsync<DbUpdateException>("trùng vùng + biến thể (biến thể trống cũng tính là trùng), hoặc hai ký hiệu mặc định");
        }
    }
}
