using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Edits of the draft catalog version. Every edit goes through the course it belongs to, checked against the
/// draft: published versions are never changed. A course copied unchanged becomes EDITED on its first edit.
/// </summary>
public class PlatformCatalogEditor
{
    private readonly IApplicationDbContext _context;
    private readonly IHtmlContentSanitizer _sanitizer;
    private readonly ICurrentUser _currentUser;
    private readonly TimeProvider _clock;

    public PlatformCatalogEditor(IApplicationDbContext context, IHtmlContentSanitizer sanitizer, ICurrentUser currentUser, TimeProvider clock)
    {
        _context = context;
        _sanitizer = sanitizer;
        _currentUser = currentUser;
        _clock = clock;
    }

    public DateTimeOffset Now => _clock.GetUtcNow();
    public Guid? UserId => _currentUser.UserId;

    public string Sanitize(string? html) => _sanitizer.Sanitize(html);

    public async Task<PlatformCatalogVersion> VersionAsync(int versionNo) =>
        await _context.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.VersionNo == versionNo)
        ?? throw new NotFoundException($"Không tìm thấy phiên bản v{versionNo}.");

    /// <summary>The version, which must be the draft (published versions are read-only).</summary>
    public async Task<PlatformCatalogVersion> DraftAsync(int versionNo)
    {
        var version = await VersionAsync(versionNo);
        if (version.Status != Statuses.PlatformCatalogVersion.Draft)
        {
            throw new ConflictException($"Phiên bản v{versionNo} đã công bố nên không sửa được. Hãy sửa trong bản nháp.");
        }

        return version;
    }

    public async Task<PlatformCatalogCourse> DraftCourseAsync(int versionNo, Guid courseId)
    {
        var version = await DraftAsync(versionNo);
        return await _context.PlatformCatalogCourses.FirstOrDefaultAsync(c => c.VersionId == version.Id && c.CourseId == courseId)
               ?? throw new NotFoundException("Khóa học không có trong phiên bản này.");
    }

    public async Task<(PlatformCatalogCourse Course, PlatformCourseModule Module)> DraftModuleAsync(int versionNo, Guid courseId, Guid moduleId)
    {
        var course = await DraftCourseAsync(versionNo, courseId);
        var module = await _context.PlatformCourseModules.FirstOrDefaultAsync(m => m.Id == moduleId && m.CatalogCourseId == course.Id)
                     ?? throw new NotFoundException("Không tìm thấy mô đun trong khóa học này.");
        return (course, module);
    }

    public async Task<(PlatformCatalogCourse Course, PlatformModuleBlock Block)> DraftBlockAsync(int versionNo, Guid courseId, Guid blockId)
    {
        var course = await DraftCourseAsync(versionNo, courseId);
        var block = await (
                        from b in _context.PlatformModuleBlocks
                        join m in _context.PlatformCourseModules on b.ModuleId equals m.Id
                        where b.Id == blockId && m.CatalogCourseId == course.Id
                        select b)
                    .FirstOrDefaultAsync()
                    ?? throw new NotFoundException("Không tìm thấy khối nội dung trong khóa học này.");
        return (course, block);
    }

    public async Task<(PlatformCatalogCourse Course, PlatformModuleQuestion Question)> DraftQuestionAsync(int versionNo, Guid courseId, Guid questionId)
    {
        var course = await DraftCourseAsync(versionNo, courseId);
        var question = await (
                           from q in _context.PlatformModuleQuestions
                           join m in _context.PlatformCourseModules on q.ModuleId equals m.Id
                           where q.Id == questionId && m.CatalogCourseId == course.Id
                           select q)
                       .FirstOrDefaultAsync()
                       ?? throw new NotFoundException("Không tìm thấy câu hỏi trong khóa học này.");
        return (course, question);
    }

    public static void MarkEdited(PlatformCatalogCourse course)
    {
        if (course.ChangeKind == PlatformCatalog.ChangeKind.Unchanged)
        {
            course.ChangeKind = PlatformCatalog.ChangeKind.Edited;
        }
    }

    /// <summary>Moves <paramref name="item"/> to <paramref name="toIndex"/> (clamped) and renumbers sort orders 1..n.</summary>
    public static void Move<T>(List<T> ordered, T item, int toIndex, Action<T, int> setSortOrder)
    {
        ordered.Remove(item);
        ordered.Insert(Math.Clamp(toIndex, 0, ordered.Count), item);
        Renumber(ordered, setSortOrder);
    }

    public static void Renumber<T>(IEnumerable<T> ordered, Action<T, int> setSortOrder)
    {
        var n = 1;
        foreach (var item in ordered)
        {
            setSortOrder(item, n++);
        }
    }

    /// <summary>Removes modules with their blocks, slide items, questions and options (draft content only).</summary>
    public async Task RemoveModulesAsync(IReadOnlyCollection<Guid> moduleIds)
    {
        var blocks = await _context.PlatformModuleBlocks.Where(b => moduleIds.Contains(b.ModuleId)).ToListAsync();
        var blockIds = blocks.Select(b => b.Id).ToList();
        var questions = await _context.PlatformModuleQuestions.Where(q => moduleIds.Contains(q.ModuleId)).ToListAsync();
        var questionIds = questions.Select(q => q.Id).ToList();
        _context.PlatformQuestionOptions.RemoveRange(await _context.PlatformQuestionOptions.Where(o => questionIds.Contains(o.QuestionId)).ToListAsync());
        _context.PlatformModuleQuestions.RemoveRange(questions);
        _context.PlatformSlideItems.RemoveRange(await _context.PlatformSlideItems.Where(i => blockIds.Contains(i.BlockId)).ToListAsync());
        _context.PlatformModuleBlocks.RemoveRange(blocks);
        _context.PlatformCourseModules.RemoveRange(await _context.PlatformCourseModules.Where(m => moduleIds.Contains(m.Id)).ToListAsync());
    }

    /// <summary>
    /// Creates the draft version as a deep copy of the version in use: every course, module, block, slide item,
    /// question and option gets a new row (assets are shared — files never change). All courses start UNCHANGED.
    /// </summary>
    public async Task<PlatformCatalogVersion> CreateDraftAsync()
    {
        var current = await _context.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.Status == Statuses.PlatformCatalogVersion.Current)
                      ?? throw new BadRequestException("Chưa có phiên bản đang dùng để chép.", "version", "NO_CURRENT_VERSION");
        var existing = await _context.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.Status == Statuses.PlatformCatalogVersion.Draft);
        if (existing != null)
        {
            throw new ConflictException($"Đã có bản nháp v{existing.VersionNo}. Mở bản nháp đó để sửa.");
        }

        var draft = new PlatformCatalogVersion
        {
            VersionNo = await _context.PlatformCatalogVersions.MaxAsync(v => v.VersionNo) + 1,
            Status = Statuses.PlatformCatalogVersion.Draft,
            BasedOnVersionId = current.Id,
            CreatedByUserId = UserId,
        };
        _context.PlatformCatalogVersions.Add(draft);

        var courses = await _context.PlatformCatalogCourses.AsNoTracking().Where(c => c.VersionId == current.Id).ToListAsync();
        var courseIds = courses.Select(c => c.Id).ToList();
        var modules = await _context.PlatformCourseModules.AsNoTracking().Where(m => courseIds.Contains(m.CatalogCourseId)).ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var blocks = await _context.PlatformModuleBlocks.AsNoTracking().Where(b => moduleIds.Contains(b.ModuleId)).ToListAsync();
        var blockIds = blocks.Select(b => b.Id).ToList();
        var items = await _context.PlatformSlideItems.AsNoTracking().Where(i => blockIds.Contains(i.BlockId)).ToListAsync();
        var questions = await _context.PlatformModuleQuestions.AsNoTracking().Where(q => moduleIds.Contains(q.ModuleId)).ToListAsync();
        var questionIds = questions.Select(q => q.Id).ToList();
        var options = await _context.PlatformQuestionOptions.AsNoTracking().Where(o => questionIds.Contains(o.QuestionId)).ToListAsync();

        var courseMap = new Dictionary<Guid, Guid>();
        var moduleMap = new Dictionary<Guid, Guid>();
        var blockMap = new Dictionary<Guid, Guid>();
        var questionMap = new Dictionary<Guid, Guid>();
        foreach (var c in courses)
        {
            var copy = new PlatformCatalogCourse
            {
                VersionId = draft.Id,
                CourseId = c.CourseId,
                ChangeKind = PlatformCatalog.ChangeKind.Unchanged,
                DomainId = c.DomainId,
                Level = c.Level,
                Title = c.Title,
                Outcome = c.Outcome,
                PricePerSeat = c.PricePerSeat,
                SalesStatus = c.SalesStatus,
                FinalTitle = c.FinalTitle,
                FinalPrompt = c.FinalPrompt,
                FinalCriteria = c.FinalCriteria,
            };
            courseMap[c.Id] = copy.Id;
            _context.PlatformCatalogCourses.Add(copy);
        }

        foreach (var m in modules)
        {
            var copy = new PlatformCourseModule { CatalogCourseId = courseMap[m.CatalogCourseId], SortOrder = m.SortOrder, Title = m.Title, QuizTitle = m.QuizTitle };
            moduleMap[m.Id] = copy.Id;
            _context.PlatformCourseModules.Add(copy);
        }

        foreach (var b in blocks)
        {
            var copy = new PlatformModuleBlock
            {
                ModuleId = moduleMap[b.ModuleId], SortOrder = b.SortOrder,
                BlockType = string.IsNullOrWhiteSpace(b.BlockType) ? PlatformCatalog.BlockType.Text : b.BlockType.Trim().ToUpperInvariant(),
                BodyHtml = b.BodyHtml,
                AssetId = b.AssetId, Caption = b.Caption, AltText = b.AltText,
            };
            blockMap[b.Id] = copy.Id;
            _context.PlatformModuleBlocks.Add(copy);
        }

        foreach (var i in items)
        {
            _context.PlatformSlideItems.Add(new PlatformSlideItem { BlockId = blockMap[i.BlockId], SortOrder = i.SortOrder, AssetId = i.AssetId, Caption = i.Caption });
        }

        foreach (var q in questions)
        {
            var copy = new PlatformModuleQuestion
            {
                ModuleId = moduleMap[q.ModuleId], SortOrder = q.SortOrder, QuestionText = q.QuestionText, Explanation = q.Explanation,
                BlockId = q.BlockId is { } blockId && blockMap.TryGetValue(blockId, out var mapped) ? mapped : null,
            };
            questionMap[q.Id] = copy.Id;
            _context.PlatformModuleQuestions.Add(copy);
        }

        foreach (var o in options)
        {
            _context.PlatformQuestionOptions.Add(new PlatformQuestionOption { QuestionId = questionMap[o.QuestionId], SortOrder = o.SortOrder, OptionText = o.OptionText, IsCorrect = o.IsCorrect });
        }

        return draft;
    }
}
