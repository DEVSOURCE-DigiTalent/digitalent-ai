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
/// Projects a published catalog into the existing organization Learning schema. Each publication creates an
/// immutable course revision; enrollments, submitted answers and certificates keep their original course ids.
/// Called inside the catalog publication transaction, never from a read endpoint or while editing a draft.
/// </summary>
public sealed class PlatformLearningPublisher(IApplicationDbContext context)
{
    public async Task PublishAsync(Guid versionId, Guid? authorId, DateTimeOffset now, Guid? organizationId = null, bool includeUnchanged = false)
    {
        var published = await (from row in context.PlatformCatalogCourses.AsNoTracking()
                               join identity in context.PlatformCourses.AsNoTracking() on row.CourseId equals identity.Id
                               where row.VersionId == versionId && (includeUnchanged || row.ChangeKind != PlatformCatalog.ChangeKind.Unchanged)
                               select new { Row = row, identity.Code }).ToListAsync();
        foreach (var item in published)
        {
            var code = item.Code;
            // Legacy organizations use M1; map only the known historical alias, without adding duplicate A1 courses.
            var alias = code.StartsWith("A1-", StringComparison.Ordinal) ? code.Replace("A1-", "M1-") : code;
            var targets = await context.Courses.AsNoTracking()
                .Where(c => (c.Code == code || c.Code == alias) && c.Status == Statuses.Course.Published && (organizationId == null || c.OrganizationId == organizationId))
                .ToListAsync();
            // A newly added course inherits the existing domain mapping in each provisioned organization.
            var siblingCodes = await context.PlatformCourses.AsNoTracking().Where(c => c.DomainId == item.Row.DomainId)
                .Select(c => c.Code).ToListAsync();
            siblingCodes.AddRange(siblingCodes.Where(c => c.StartsWith("A1-", StringComparison.Ordinal)).Select(c => c.Replace("A1-", "M1-")).ToList());
            var mappedOrganizations = targets.Select(c => c.OrganizationId).ToList();
            var siblings = await context.Courses.AsNoTracking()
                .Where(c => siblingCodes.Contains(c.Code) && c.Status == Statuses.Course.Published && !mappedOrganizations.Contains(c.OrganizationId) && (organizationId == null || c.OrganizationId == organizationId)).ToListAsync();
            targets.AddRange(siblings.GroupBy(c => c.OrganizationId).Select(g => g.OrderByDescending(c => c.VersionNo).First()));
            var modules = await context.PlatformCourseModules.AsNoTracking()
                .Where(m => m.CatalogCourseId == item.Row.Id).OrderBy(m => m.SortOrder).ToListAsync();
            var moduleIds = modules.Select(m => m.Id).ToList();
            var blocks = await context.PlatformModuleBlocks.AsNoTracking().Where(b => moduleIds.Contains(b.ModuleId)).OrderBy(b => b.SortOrder).ToListAsync();
            var blockIds = blocks.Select(b => b.Id).ToList();
            var slides = await context.PlatformSlideItems.AsNoTracking().Where(s => blockIds.Contains(s.BlockId)).OrderBy(s => s.SortOrder).ToListAsync();
            var questions = await context.PlatformModuleQuestions.AsNoTracking().Where(q => moduleIds.Contains(q.ModuleId)).OrderBy(q => q.SortOrder).ToListAsync();
            var questionIds = questions.Select(q => q.Id).ToList();
            var options = await context.PlatformQuestionOptions.AsNoTracking().Where(o => questionIds.Contains(o.QuestionId)).OrderBy(o => o.SortOrder).ToListAsync();

            foreach (var group in targets.GroupBy(c => (c.OrganizationId, c.Code)))
            {
                var previous = group.OrderByDescending(c => c.VersionNo).First();
                var isNew = previous.Code != code && previous.Code != alias;
                var targetCode = isNew ? code : previous.Code;
                var id = Id($"catalog-learning:{item.Row.Id}:{previous.OrganizationId}:{targetCode}");
                if (await context.Courses.AnyAsync(c => c.Id == id)) continue;
                var course = new Course
                {
                    Id = id, OrganizationId = previous.OrganizationId, Code = targetCode,
                    VersionNo = isNew ? 1 : await context.Courses.Where(c => c.OrganizationId == previous.OrganizationId && c.Code == previous.Code).MaxAsync(c => c.VersionNo) + 1,
                    SupersedesCourseId = isNew ? null : previous.Id, Title = item.Row.Title, ShortName = previous.ShortName,
                    Description = item.Row.Outcome, Purpose = previous.Purpose, EntryLevel = previous.EntryLevel,
                    EstimatedDurationMinutes = previous.EstimatedDurationMinutes, CertificateEnabled = previous.CertificateEnabled,
                    CertificateValidityDays = previous.CertificateValidityDays, Status = Statuses.Course.Published,
                    CreatedByUserId = authorId ?? previous.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1,
                };
                context.Courses.Add(course);
                var teaching = await context.CourseCompetencies.AsNoTracking().Where(c => c.CourseId == previous.Id).ToListAsync();
                context.CourseCompetencies.AddRange(teaching.Select(c => new CourseCompetency
                {
                    CourseId = id, CompetencyId = c.CompetencyId, TargetLevel = (short)item.Row.Level,
                    CoverageType = c.CoverageType, CoverageWeight = c.CoverageWeight, Note = c.Note,
                }));
                var prerequisites = await context.CoursePrerequisites.AsNoTracking().Where(p => p.CourseId == previous.Id).ToListAsync();
                context.CoursePrerequisites.AddRange(prerequisites.Select(p => new CoursePrerequisite { CourseId = id, PrerequisiteCourseId = p.PrerequisiteCourseId }));
                var outcomes = await context.CourseLearningOutcomes.AsNoTracking().Where(o => o.CourseId == previous.Id).ToListAsync();
                context.CourseLearningOutcomes.AddRange(outcomes.Select(o => new CourseLearningOutcome
                {
                    CourseId = id, Code = o.Code, CompetencyId = o.CompetencyId, TargetLevel = (short)item.Row.Level,
                    OutcomeType = o.OutcomeType, Statement = o.Statement, SourceType = o.SourceType, SourceRef = o.SourceRef,
                    AssessmentMethod = o.AssessmentMethod, SortOrder = o.SortOrder, CreatedAt = now, UpdatedAt = now,
                }));
                var bank = new QuestionBank { OrganizationId = previous.OrganizationId, Title = $"{item.Row.Title} · v{course.VersionNo}", Status = "ACTIVE", OwnerUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now };
                context.QuestionBanks.Add(bank);
                foreach (var (module, moduleIndex) in modules.Select((m, i) => (m, i)))
                {
                    var mapped = new CourseModule { CourseId = id, Code = $"{course.Code}-CH{moduleIndex + 1}", Title = module.Title, SortOrder = moduleIndex + 1, IsRequired = true, Status = Statuses.CourseContent.Active, CreatedAt = now, UpdatedAt = now };
                    context.CourseModules.Add(mapped);
                    var lessonIds = new Dictionary<Guid, (Guid Id, int Order)>();
                    var order = 0;
                    foreach (var page in PlatformLessonPages.Group(blocks.Where(b => b.ModuleId == module.Id)))
                    {
                        var block = page.FirstOrDefault(b => b.BlockType == PlatformCatalog.BlockType.Text) ?? page[0];
                        var content = block.BodyHtml;
                        var titleMatch = Regex.Match(content ?? "", @"<h[234]\b[^>]*>(.*?)</h[234]>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
                        var lesson = new Lesson
                        {
                            ModuleId = mapped.Id, Code = $"{course.Code}-CH{moduleIndex + 1}-S{++order:00}",
                            Title = titleMatch.Success ? WebUtility.HtmlDecode(Regex.Replace(titleMatch.Groups[1].Value, "<[^>]*>", "")) : block.Caption ?? $"{module.Title} · {order}",
                            LessonType = block.BlockType == PlatformCatalog.BlockType.Video ? "VIDEO" : "TEXT",
                            ContentBody = content, SortOrder = order, IsRequired = true, CompletionRule = "VIEW", Status = Statuses.CourseContent.Active,
                            CreatedAt = now, UpdatedAt = now,
                        };
                        context.Lessons.Add(lesson);
                        var media = new List<(Guid AssetId, string? Caption)>();
                        foreach (var part in page)
                        {
                            lessonIds[part.Id] = (lesson.Id, order);
                            if (part.AssetId is { } assetId) media.Add((assetId, part.AltText ?? part.Caption));
                            media.AddRange(slides.Where(s => s.BlockId == part.Id).Select(s => (s.AssetId, s.Caption)));
                        }
                        foreach (var (entry, mediaIndex) in media.Select((entry, i) => (entry, i)))
                            context.LearningMaterials.Add(new LearningMaterial { LessonId = lesson.Id, Title = (entry.Caption ?? lesson.Title)[..Math.Min(250, (entry.Caption ?? lesson.Title).Length)], MaterialType = "LINK", ExternalUrl = $"platform-asset:{entry.AssetId:D}", SortOrder = mediaIndex + 1, CreatedAt = now, UpdatedAt = now });
                    }
                    var assessment = new Assessment { CourseId = id, ModuleId = mapped.Id, Code = $"{course.Code}-CH{moduleIndex + 1}-QUIZ", VersionNo = 1, Title = module.QuizTitle, AssessmentType = Statuses.AssessmentType.Quiz, PassingScore = 100, Status = Statuses.Assessment.Published, CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1 };
                    context.Assessments.Add(assessment);
                    foreach (var (question, index) in questions.Where(q => q.ModuleId == module.Id).Select((q, i) => (q, i)))
                    {
                        var mappedQuestion = new Question { BankId = bank.Id, QuestionType = "MULTIPLE_CHOICE", Difficulty = $"L{item.Row.Level}", Content = question.QuestionText, Explanation = question.Explanation, Status = "APPROVED", CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now };
                        context.Questions.Add(mappedQuestion);
                        // Keep the authored page association. Older unlinked quizzes retain their existing fallback.
                        var sort = question.BlockId is { } blockId && lessonIds.TryGetValue(blockId, out var linked) ? (linked.Order - 1) * 2 + 1 : index + 1;
                        context.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = assessment.Id, QuestionId = mappedQuestion.Id, Points = 1, SortOrder = sort });
                        context.QuestionOptions.AddRange(options.Where(o => o.QuestionId == question.Id).Select(o => new QuestionOption { QuestionId = mappedQuestion.Id, Content = o.OptionText, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder, CreatedAt = now, UpdatedAt = now }));
                    }
                }
                context.PracticalTaskTemplates.Add(new PracticalTaskTemplate
                {
                    OrganizationId = previous.OrganizationId, RelatedCourseId = id, Title = item.Row.FinalTitle,
                    Description = item.Row.FinalPrompt, ExpectedOutput = item.Row.Outcome,
                    GeneralMarkingCriteria = JsonSerializer.Serialize(new { track = "general", criteria = PlatformCourseContentReader.Criteria(item.Row.FinalCriteria), catalogCourseId = item.Row.Id }),
                    SourceType = "MANUAL", Status = "ACTIVE", CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now,
                });
                context.Assessments.Add(new Assessment { CourseId = id, Code = $"{course.Code}-FINAL", VersionNo = 1, Title = item.Row.FinalTitle, AssessmentType = "FINAL", IsFinal = true, PassingScore = 70, Status = Statuses.Assessment.Published, CreatedByUserId = course.CreatedByUserId, CreatedAt = now, UpdatedAt = now, RowVersion = 1 });
            }
        }
    }

    private static Guid Id(string value) => new(MD5.HashData(Encoding.UTF8.GetBytes(value)));
}
