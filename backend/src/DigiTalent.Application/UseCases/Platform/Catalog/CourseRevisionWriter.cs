using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// The content of a course revision, whoever wrote it: a DigiTalent catalog version or the company's R&D. Blocks and
/// slide items reuse the catalog entity shapes (kept in memory, never saved) so the lesson pages group the same way.
/// </summary>
public sealed record CourseRevisionContent(
    string Title, string Outcome, int Level, string FinalTitle, string FinalPrompt, IReadOnlyList<string> FinalCriteria,
    IReadOnlyList<CourseRevisionModule> Modules, Guid? CatalogCourseId = null);

public sealed record CourseRevisionModule(string Title, string QuizTitle, IReadOnlyList<PlatformModuleBlock> Blocks,
    IReadOnlyList<PlatformSlideItem> Slides, IReadOnlyList<CourseRevisionQuestion> Questions);

public sealed record CourseRevisionQuestion(string Text, string? Explanation, bool IsFinalQuiz, Guid? BlockId,
    IReadOnlyList<CourseRevisionOption> Options);

public sealed record CourseRevisionOption(string Text, bool IsCorrect, int SortOrder);

/// <summary>
/// Writes one immutable course revision in an organization (same code, version + 1, superseding the previous one):
/// modules, lesson pages, media, review quizzes with their questions and the course final. Enrollments, answers and
/// certificates keep the revision they started on. Changes are tracked; the caller saves.
/// </summary>
public static class CourseRevisionWriter
{
    public static Guid Id(string value) => new(MD5.HashData(Encoding.UTF8.GetBytes(value)));

    public static async Task<Course> WriteAsync(IApplicationDbContext context, Course previous, Guid id, string code, int versionNo,
        bool isNew, CourseRevisionContent content, Guid? authorId, DateTimeOffset now)
    {
        var course = new Course
        {
            Id = id, OrganizationId = previous.OrganizationId, Code = code,
            VersionNo = versionNo,
            SupersedesCourseId = isNew ? null : previous.Id, Title = content.Title, ShortName = previous.ShortName,
            Description = content.Outcome, Purpose = previous.Purpose, EntryLevel = previous.EntryLevel,
            EstimatedDurationMinutes = previous.EstimatedDurationMinutes, CertificateEnabled = previous.CertificateEnabled,
            CertificateValidityDays = previous.CertificateValidityDays, Status = Statuses.Course.Published,
            CreatedByUserId = authorId ?? previous.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1,
        };
        context.Courses.Add(course);
        var level = (short)content.Level;
        var teaching = await context.CourseCompetencies.AsNoTracking().Where(c => c.CourseId == previous.Id).ToListAsync();
        context.CourseCompetencies.AddRange(teaching.Select(c => new CourseCompetency
        {
            CourseId = id, CompetencyId = c.CompetencyId, TargetLevel = level,
            CoverageType = c.CoverageType, CoverageWeight = c.CoverageWeight, Note = c.Note,
        }));
        var prerequisites = await context.CoursePrerequisites.AsNoTracking().Where(p => p.CourseId == previous.Id).ToListAsync();
        context.CoursePrerequisites.AddRange(prerequisites.Select(p => new CoursePrerequisite { CourseId = id, PrerequisiteCourseId = p.PrerequisiteCourseId }));
        var outcomes = await context.CourseLearningOutcomes.AsNoTracking().Where(o => o.CourseId == previous.Id).ToListAsync();
        context.CourseLearningOutcomes.AddRange(outcomes.Select(o => new CourseLearningOutcome
        {
            CourseId = id, Code = o.Code, CompetencyId = o.CompetencyId, TargetLevel = level,
            OutcomeType = o.OutcomeType, Statement = o.Statement, SourceType = o.SourceType, SourceRef = o.SourceRef,
            AssessmentMethod = o.AssessmentMethod, SortOrder = o.SortOrder, CreatedAt = now, UpdatedAt = now,
        }));
        var bank = new QuestionBank { OrganizationId = previous.OrganizationId, Title = $"{content.Title} · v{versionNo}", Status = "ACTIVE", OwnerUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now };
        context.QuestionBanks.Add(bank);
        foreach (var (module, moduleIndex) in content.Modules.Select((m, i) => (m, i)))
        {
            var mapped = new CourseModule { CourseId = id, Code = $"{code}-CH{moduleIndex + 1}", Title = module.Title, SortOrder = moduleIndex + 1, IsRequired = true, Status = Statuses.CourseContent.Active, CreatedAt = now, UpdatedAt = now };
            context.CourseModules.Add(mapped);
            var lessonIds = new Dictionary<Guid, (Guid Id, int Order)>();
            var order = 0;
            foreach (var page in PlatformLessonPages.Group(module.Blocks))
            {
                var block = page.FirstOrDefault(b => b.BlockType == PlatformCatalog.BlockType.Text) ?? page[0];
                var body = block.BodyHtml;
                var titleMatch = Regex.Match(body ?? "", @"<h[234]\b[^>]*>(.*?)</h[234]>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
                var lesson = new Lesson
                {
                    ModuleId = mapped.Id, Code = $"{code}-CH{moduleIndex + 1}-S{++order:00}",
                    Title = titleMatch.Success ? WebUtility.HtmlDecode(Regex.Replace(titleMatch.Groups[1].Value, "<[^>]*>", "")) : block.Caption ?? $"{module.Title} · {order}",
                    LessonType = block.BlockType == PlatformCatalog.BlockType.Video ? "VIDEO" : "TEXT",
                    ContentBody = body, SortOrder = order, IsRequired = true, CompletionRule = "VIEW", Status = Statuses.CourseContent.Active,
                    CreatedAt = now, UpdatedAt = now,
                };
                context.Lessons.Add(lesson);
                var media = new List<(Guid AssetId, string? Caption)>();
                foreach (var part in page)
                {
                    lessonIds[part.Id] = (lesson.Id, order);
                    if (part.AssetId is { } assetId) media.Add((assetId, part.AltText ?? part.Caption));
                    media.AddRange(module.Slides.Where(s => s.BlockId == part.Id).OrderBy(s => s.SortOrder).Select(s => (s.AssetId, s.Caption)));
                }
                foreach (var (entry, mediaIndex) in media.Select((entry, i) => (entry, i)))
                {
                    var title = entry.Caption ?? lesson.Title;
                    context.LearningMaterials.Add(new LearningMaterial { LessonId = lesson.Id, Title = title[..Math.Min(250, title.Length)], MaterialType = "LINK", ExternalUrl = $"platform-asset:{entry.AssetId:D}", SortOrder = mediaIndex + 1, CreatedAt = now, UpdatedAt = now });
                }
            }
            var assessment = new Assessment { CourseId = id, ModuleId = mapped.Id, Code = $"{code}-CH{moduleIndex + 1}-QUIZ", VersionNo = 1, Title = module.QuizTitle, AssessmentType = Statuses.AssessmentType.Quiz, PassingScore = DigiTalent.Application.UseCases.Pulse.PulseRules.ModuleQuizPassPercent, Status = Statuses.Assessment.Published, CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1 };
            context.Assessments.Add(assessment);
            foreach (var (question, index) in module.Questions.Select((q, i) => (q, i)))
            {
                var mappedQuestion = new Question { BankId = bank.Id, QuestionType = "MULTIPLE_CHOICE", Difficulty = $"L{content.Level}", Content = question.Text, Explanation = question.Explanation, IsFinalQuiz = question.IsFinalQuiz, Status = "APPROVED", CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now };
                context.Questions.Add(mappedQuestion);
                // Keep the authored page association. Older unlinked quizzes retain their existing fallback.
                var sort = question.BlockId is { } blockId && lessonIds.TryGetValue(blockId, out var linked) ? (linked.Order - 1) * 2 + 1 : index + 1;
                context.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = assessment.Id, QuestionId = mappedQuestion.Id, Points = 1, SortOrder = sort });
                context.QuestionOptions.AddRange(question.Options.Select(o => new QuestionOption { QuestionId = mappedQuestion.Id, Content = o.Text, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder, CreatedAt = now, UpdatedAt = now }));
            }
        }
        context.PracticalTaskTemplates.Add(new PracticalTaskTemplate
        {
            OrganizationId = previous.OrganizationId, RelatedCourseId = id, Title = content.FinalTitle,
            Description = content.FinalPrompt, ExpectedOutput = content.Outcome,
            GeneralMarkingCriteria = JsonSerializer.Serialize(new { track = "general", criteria = content.FinalCriteria, catalogCourseId = content.CatalogCourseId }),
            SourceType = "MANUAL", Status = "ACTIVE", CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now,
        });
        context.Assessments.Add(new Assessment { CourseId = id, Code = $"{code}-FINAL", VersionNo = 1, Title = content.FinalTitle, AssessmentType = "FINAL", IsFinal = true, PassingScore = 70, Status = Statuses.Assessment.Published, CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1 });
        return course;
    }
}
