using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// What must be fixed before a draft version is published (BLOCK) and what is advised (WARN). Only courses added or
/// edited in the draft are checked; unchanged courses were checked when their version was published.
/// </summary>
public class PlatformPublishChecker
{
    private readonly IApplicationDbContext _context;
    private readonly IHtmlContentSanitizer _sanitizer;

    public PlatformPublishChecker(IApplicationDbContext context, IHtmlContentSanitizer sanitizer)
    {
        _context = context;
        _sanitizer = sanitizer;
    }

    public async Task<PlatformPublishCheck> CheckAsync(PlatformCatalogVersion version)
    {
        var check = new PlatformPublishCheck { VersionNo = version.VersionNo };
        var changed = await (
                from catalogCourse in _context.PlatformCatalogCourses.AsNoTracking()
                join course in _context.PlatformCourses on catalogCourse.CourseId equals course.Id
                where catalogCourse.VersionId == version.Id && catalogCourse.ChangeKind != PlatformCatalog.ChangeKind.Unchanged
                orderby course.Code
                select new { CatalogCourse = catalogCourse, course.Code })
            .ToListAsync();
        check.ChangedCount = changed.Count;
        if (changed.Count == 0)
        {
            check.Items.Add(new PlatformPublishCheckItem { Level = PlatformPublishCheck.Block, Message = "Bản nháp chưa có khóa nào được thêm hay sửa." });
        }

        var courseIds = changed.Select(c => c.CatalogCourse.Id).ToList();
        var modules = await _context.PlatformCourseModules.AsNoTracking().Where(m => courseIds.Contains(m.CatalogCourseId)).OrderBy(m => m.SortOrder).ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var blocks = await _context.PlatformModuleBlocks.AsNoTracking().Where(b => moduleIds.Contains(b.ModuleId)).ToListAsync();
        var blockIds = blocks.Select(b => b.Id).ToList();
        var slideCounts = await _context.PlatformSlideItems.AsNoTracking().Where(i => blockIds.Contains(i.BlockId))
            .GroupBy(i => i.BlockId).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count);
        var questions = await _context.PlatformModuleQuestions.AsNoTracking().Where(q => moduleIds.Contains(q.ModuleId)).ToListAsync();
        var questionIds = questions.Select(q => q.Id).ToList();
        var options = await _context.PlatformQuestionOptions.AsNoTracking().Where(o => questionIds.Contains(o.QuestionId)).ToListAsync();

        foreach (var row in changed)
        {
            var c = row.CatalogCourse;
            void Add(string level, string message, Guid? moduleId = null) =>
                check.Items.Add(new PlatformPublishCheckItem { Level = level, CourseId = c.CourseId, CourseCode = row.Code, ModuleId = moduleId, Message = message });

            if (string.IsNullOrWhiteSpace(c.Title)) Add(PlatformPublishCheck.Block, "Chưa có tên khóa học.");
            if (c.Outcome.Trim().Length < 10) Add(PlatformPublishCheck.Block, "Chưa có kết quả học (ít nhất 10 ký tự).");
            if (string.IsNullOrWhiteSpace(_sanitizer.PlainText(c.FinalPrompt))) Add(PlatformPublishCheck.Block, "Chưa có đề bài cuối khóa.");
            if (PlatformCourseContentReader.Criteria(c.FinalCriteria).Count(x => !string.IsNullOrWhiteSpace(x)) == 0)
                Add(PlatformPublishCheck.Block, "Bài cuối khóa cần ít nhất một tiêu chí chấm.");

            var own = modules.Where(m => m.CatalogCourseId == c.Id).ToList();
            if (own.Count == 0) Add(PlatformPublishCheck.Block, "Khóa học chưa có mô đun nào.");
            foreach (var (module, index) in own.Select((m, i) => (m, i + 1)))
            {
                var label = $"Mô đun {index}";
                var moduleBlocks = blocks.Where(b => b.ModuleId == module.Id).ToList();
                if (moduleBlocks.Count == 0) Add(PlatformPublishCheck.Block, $"{label}: chưa có nội dung.", module.Id);
                foreach (var block in moduleBlocks)
                {
                    var empty = block.BlockType switch
                    {
                        PlatformCatalog.BlockType.Text => string.IsNullOrWhiteSpace(_sanitizer.PlainText(block.BodyHtml)),
                        PlatformCatalog.BlockType.Slide => slideCounts.GetValueOrDefault(block.Id) == 0,
                        _ => block.AssetId == null,
                    };
                    if (empty)
                    {
                        var what = block.BlockType switch
                        {
                            PlatformCatalog.BlockType.Text => "một khối chữ đang trống",
                            PlatformCatalog.BlockType.Slide => "một slide chưa có ảnh hoặc video",
                            PlatformCatalog.BlockType.Image => "một khối ảnh chưa tải ảnh",
                            _ => "một khối video chưa tải video",
                        };
                        Add(PlatformPublishCheck.Block, $"{label}: {what}.", module.Id);
                    }
                }

                var moduleQuestions = questions.Where(q => q.ModuleId == module.Id).ToList();
                if (moduleQuestions.Count < PlatformCatalog.MinQuestionsPerModule)
                    Add(PlatformPublishCheck.Block, $"{label}: cần ít nhất {PlatformCatalog.MinQuestionsPerModule} câu hỏi (đang có {moduleQuestions.Count}).", module.Id);
                else if (moduleQuestions.Count < PlatformCatalog.RecommendedQuestionsPerModule)
                    Add(PlatformPublishCheck.Warn, $"{label}: nên có {PlatformCatalog.RecommendedQuestionsPerModule} câu để mỗi lần làm là câu khác (đang có {moduleQuestions.Count}).", module.Id);

                foreach (var question in moduleQuestions)
                {
                    var questionOptions = options.Where(o => o.QuestionId == question.Id).ToList();
                    if (string.IsNullOrWhiteSpace(question.QuestionText)
                        || questionOptions.Count < PlatformCatalog.MinOptionsPerQuestion
                        || questionOptions.Any(o => string.IsNullOrWhiteSpace(o.OptionText))
                        || questionOptions.Count(o => o.IsCorrect) != 1)
                    {
                        Add(PlatformPublishCheck.Block, $"{label}: có câu hỏi chưa đủ nội dung, phương án hoặc đáp án đúng.", module.Id);
                        break;
                    }
                }

                if (moduleQuestions.Any(q => q.BlockId == null))
                    Add(PlatformPublishCheck.Warn, $"{label}: có câu hỏi chưa gắn với khối nội dung.", module.Id);
            }
        }

        check.CanPublish = check.Items.All(i => i.Level != PlatformPublishCheck.Block);
        return check;
    }
}
