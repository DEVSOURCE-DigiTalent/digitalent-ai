using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Reads the whole content of a course in a catalog version (the course builder's model).</summary>
public class PlatformCourseContentReader
{
    private readonly IApplicationDbContext _context;
    private readonly IPlatformAssetUrlSigner _urls;

    public PlatformCourseContentReader(IApplicationDbContext context, IPlatformAssetUrlSigner urls)
    {
        _context = context;
        _urls = urls;
    }

    public async Task<PlatformCatalogCourseDetail> ReadAsync(int versionNo, Guid courseId)
    {
        var version = await _context.PlatformCatalogVersions.AsNoTracking().FirstOrDefaultAsync(v => v.VersionNo == versionNo)
                      ?? throw new NotFoundException($"Không tìm thấy phiên bản v{versionNo}.");
        var row = await (
                      from catalogCourse in _context.PlatformCatalogCourses.AsNoTracking()
                      join course in _context.PlatformCourses on catalogCourse.CourseId equals course.Id
                      join domain in _context.PlatformFrameworkDomains on catalogCourse.DomainId equals domain.Id
                      join framework in _context.PlatformFrameworks on domain.FrameworkId equals framework.Id
                      where catalogCourse.VersionId == version.Id && catalogCourse.CourseId == courseId
                      select new { CatalogCourse = catalogCourse, course.Code, course.PublishedAt, Domain = domain, Framework = framework })
                  .FirstOrDefaultAsync()
                  ?? throw new NotFoundException("Khóa học không có trong phiên bản này.");

        var c = row.CatalogCourse;
        var modules = await _context.PlatformCourseModules.AsNoTracking()
            .Where(m => m.CatalogCourseId == c.Id).OrderBy(m => m.SortOrder).ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var blocks = await _context.PlatformModuleBlocks.AsNoTracking()
            .Where(b => moduleIds.Contains(b.ModuleId)).OrderBy(b => b.SortOrder).ToListAsync();
        var blockIds = blocks.Select(b => b.Id).ToList();
        var items = await _context.PlatformSlideItems.AsNoTracking()
            .Where(i => blockIds.Contains(i.BlockId)).OrderBy(i => i.SortOrder).ToListAsync();
        var questions = await _context.PlatformModuleQuestions.AsNoTracking()
            .Where(q => moduleIds.Contains(q.ModuleId)).OrderBy(q => q.SortOrder).ToListAsync();
        var questionIds = questions.Select(q => q.Id).ToList();
        var options = await _context.PlatformQuestionOptions.AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId)).OrderBy(o => o.SortOrder).ToListAsync();
        var assetIds = blocks.Where(b => b.AssetId != null).Select(b => b.AssetId!.Value).Concat(items.Select(i => i.AssetId)).Distinct().ToList();
        var assets = await _context.PlatformAssets.AsNoTracking().Where(a => assetIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id);

        var editable = version.Status == Statuses.PlatformCatalogVersion.Draft;
        return new PlatformCatalogCourseDetail
        {
            VersionNo = version.VersionNo,
            VersionStatus = version.Status,
            Editable = editable,
            CourseId = c.CourseId,
            Code = row.Code,
            CodeEditable = editable && row.PublishedAt == null,
            ChangeKind = c.ChangeKind,
            FrameworkId = row.Framework.Id,
            FrameworkName = row.Framework.Name,
            DomainId = row.Domain.Id,
            DomainName = row.Domain.Name,
            Level = c.Level,
            LevelName = PlatformCatalog.LevelName(c.Level),
            Title = c.Title,
            Outcome = c.Outcome,
            PricePerSeat = c.PricePerSeat,
            SalesStatus = c.SalesStatus,
            Final = new PlatformCourseFinalDto
            {
                Title = c.FinalTitle,
                PromptHtml = c.FinalPrompt,
                Criteria = Criteria(c.FinalCriteria),
            },
            Modules = modules.Select((m, index) => new PlatformModuleDto
            {
                ModuleId = m.Id,
                Index = index,
                Title = m.Title,
                QuizTitle = m.QuizTitle,
                Blocks = blocks.Where(b => b.ModuleId == m.Id).Select((b, i) => new PlatformBlockDto
                {
                    BlockId = b.Id,
                    Index = i,
                    Type = string.IsNullOrWhiteSpace(b.BlockType) ? PlatformCatalog.BlockType.Text : b.BlockType.Trim().ToUpperInvariant(),
                    BodyHtml = b.BodyHtml,
                    Asset = b.AssetId is { } assetId && assets.TryGetValue(assetId, out var asset) ? Asset(asset) : null,
                    Caption = b.Caption,
                    AltText = b.AltText,
                    Items = items.Where(it => it.BlockId == b.Id && assets.ContainsKey(it.AssetId)).Select(it => new PlatformSlideItemDto
                    {
                        ItemId = it.Id,
                        Asset = Asset(assets[it.AssetId]),
                        Caption = it.Caption,
                    }).ToList(),
                }).ToList(),
                Questions = questions.Where(q => q.ModuleId == m.Id).Select((q, i) => new PlatformQuestionDto
                {
                    QuestionId = q.Id,
                    Index = i,
                    Text = q.QuestionText,
                    Explanation = q.Explanation,
                    BlockId = q.BlockId,
                    Options = options.Where(o => o.QuestionId == q.Id).Select(o => new PlatformOptionDto
                    {
                        OptionId = o.Id,
                        Text = o.OptionText,
                        IsCorrect = o.IsCorrect,
                    }).ToList(),
                }).ToList(),
            }).ToList(),
        };
    }

    public PlatformAssetDto Asset(PlatformAsset asset) => new()
    {
        AssetId = asset.Id,
        Kind = asset.Kind,
        FileName = asset.FileName,
        ContentType = asset.ContentType,
        SizeBytes = asset.SizeBytes,
        Url = _urls.ContentPath(asset.Id),
    };

    public static List<string> Criteria(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }
        catch (JsonException)
        {
            return new List<string>();
        }
    }
}
