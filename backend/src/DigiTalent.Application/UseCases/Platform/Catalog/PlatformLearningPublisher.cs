using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Projects a published catalog into the existing organization Learning schema. Each publication creates an
/// immutable course revision; enrollments, submitted answers and certificates keep their original course ids.
/// Called inside the catalog publication transaction (or when a version is applied to one organization), never from a
/// read endpoint or while editing a draft.
/// </summary>
public sealed class PlatformLearningPublisher(IApplicationDbContext context)
{
    /// <param name="onlyCourseIds">Project only these courses (platform course ids), whatever their change kind.</param>
    /// <param name="reapply">
    /// A version applied again (an organization going back to an older version, then forward) gets a new revision even
    /// though the row was projected before; otherwise a row already projected is skipped (idempotent publication).
    /// </param>
    public async Task PublishAsync(Guid versionId, Guid? authorId, DateTimeOffset now, Guid? organizationId = null, bool includeUnchanged = false,
        IReadOnlyCollection<Guid>? onlyCourseIds = null, bool reapply = false)
    {
        var only = onlyCourseIds?.ToList();
        var published = await (from row in context.PlatformCatalogCourses.AsNoTracking()
                               join identity in context.PlatformCourses.AsNoTracking() on row.CourseId equals identity.Id
                               where row.VersionId == versionId
                                     && (only == null ? includeUnchanged || row.ChangeKind != PlatformCatalog.ChangeKind.Unchanged : only.Contains(row.CourseId))
                               select new { Row = row, identity.Code }).ToListAsync();
        foreach (var item in published)
        {
            var code = item.Code;
            var aliases = CourseCodes.Aliases(code);
            var targets = await context.Courses.AsNoTracking()
                .Where(c => aliases.Contains(c.Code) && c.Status == Statuses.Course.Published && (organizationId == null || c.OrganizationId == organizationId))
                .ToListAsync();
            // A newly added course inherits the existing domain mapping in each provisioned organization.
            var siblingCodes = await context.PlatformCourses.AsNoTracking().Where(c => c.DomainId == item.Row.DomainId)
                .Select(c => c.Code).ToListAsync();
            siblingCodes = siblingCodes.SelectMany(CourseCodes.Aliases).Distinct().ToList();
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
            var content = new CourseRevisionContent(item.Row.Title, item.Row.Outcome, item.Row.Level, item.Row.FinalTitle, item.Row.FinalPrompt,
                PlatformCourseContentReader.Criteria(item.Row.FinalCriteria),
                modules.Select(module =>
                {
                    var own = blocks.Where(b => b.ModuleId == module.Id).ToList();
                    var ownIds = own.Select(b => b.Id).ToHashSet();
                    return new CourseRevisionModule(module.Title, module.QuizTitle, own, slides.Where(s => ownIds.Contains(s.BlockId)).ToList(),
                        questions.Where(q => q.ModuleId == module.Id).Select(q => new CourseRevisionQuestion(q.QuestionText, q.Explanation, q.IsFinalQuiz, q.BlockId,
                            options.Where(o => o.QuestionId == q.Id).Select(o => new CourseRevisionOption(o.OptionText, o.IsCorrect, o.SortOrder)).ToList())).ToList());
                }).ToList(), item.Row.Id);

            foreach (var group in targets.GroupBy(c => (c.OrganizationId, c.Code)))
            {
                var previous = group.OrderByDescending(c => c.VersionNo).First();
                var isNew = !aliases.Contains(previous.Code);
                var targetCode = isNew ? CourseCodes.Canonical(code) : previous.Code;
                var versionNo = isNew ? 1 : await context.Courses.Where(c => c.OrganizationId == previous.OrganizationId && c.Code == previous.Code).MaxAsync(c => c.VersionNo) + 1;
                var seed = $"catalog-learning:{item.Row.Id}:{previous.OrganizationId}:{targetCode}";
                var id = Id(seed);
                if (await context.Courses.AnyAsync(c => c.Id == id))
                {
                    // Already the revision in use, or a plain re-run of a publication: nothing to do.
                    if (!reapply || previous.Id == id) continue;
                    id = Id($"{seed}:r{versionNo}");
                    if (await context.Courses.AnyAsync(c => c.Id == id)) continue;
                }
                await CourseRevisionWriter.WriteAsync(context, previous, id, targetCode, versionNo, isNew, content, authorId, now);
                // DigiTalent content replaces a company version R&D applied to this course; R&D keeps it as a draft.
                await DigiTalent.Application.UseCases.Organization.Research.EnterpriseResearch.ReleaseCompanyVersionAsync(
                    context, previous.OrganizationId, targetCode);
            }
        }
    }

    private static Guid Id(string value) => CourseRevisionWriter.Id(value);
}
