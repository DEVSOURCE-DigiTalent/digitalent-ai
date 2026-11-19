using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Common;

/// <summary>
/// Levels of employees per domain (competency category), before and after learning:
///   - <see cref="Baseline"/> = the first ready result of the survey (trial assessment) — the level "before learning";
///   - <see cref="Current"/> = the highest of that result, the tier of every course completed (final approved) and the
///     level confirmed by practical evidence — the level "now".
/// <see cref="SurveyedAt"/> = when the result counted as the baseline was reviewed (or submitted when scored at once).
/// </summary>
internal sealed record EmployeeDomainLevels(
    IReadOnlyDictionary<(Guid EmployeeId, Guid CategoryId), int> Baseline,
    IReadOnlyDictionary<(Guid EmployeeId, Guid CategoryId), int> Current,
    IReadOnlyDictionary<Guid, DateTimeOffset> SurveyedAt);

internal sealed class EmployeeDomainLevelsReader(IApplicationDbContext context, PulseCatalogReader catalog)
{
    public async Task<EmployeeDomainLevels> LoadAsync(
        Guid organizationId, IReadOnlyCollection<Guid> employeeIds, IReadOnlyCollection<Guid> categoryIds)
    {
        var baseline = new Dictionary<(Guid EmployeeId, Guid CategoryId), int>();
        var current = new Dictionary<(Guid EmployeeId, Guid CategoryId), int>();
        var surveyedAt = new Dictionary<Guid, DateTimeOffset>();
        if (employeeIds.Count == 0) return new(baseline, current, surveyedAt);

        var assessments = await context.TrialAssessments.AsNoTracking()
            .Where(a => employeeIds.Contains(a.EmployeeId)).OrderBy(a => a.SubmittedAt).ThenBy(a => a.Id).ToListAsync();
        var assessmentIds = assessments.Select(a => a.Id).ToList();
        var details = (await context.TrialAssessmentDomains.AsNoTracking()
            .Where(d => assessmentIds.Contains(d.TrialAssessmentId)).ToListAsync()).ToLookup(d => d.TrialAssessmentId);
        foreach (var assessment in assessments)
        {
            var domains = details[assessment.Id].ToList();
            if (!TrialAssessmentResults.IsReady(assessment, domains)) continue;
            foreach (var domain in domains)
            {
                var key = (assessment.EmployeeId, domain.CategoryId);
                var level = TrialAssessmentResults.EffectiveLevelOf(domain);
                if (baseline.TryAdd(key, level) && (assessment.ReviewedAt ?? assessment.SubmittedAt) is DateTimeOffset at)
                    surveyedAt.TryAdd(assessment.EmployeeId, at);
                Confirm(key, level);
            }
        }

        var completed = await (
            from enrollment in context.Enrollments.AsNoTracking()
            join course in context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
            where employeeIds.Contains(enrollment.EmployeeId) && course.OrganizationId == organizationId
                && enrollment.Status == Statuses.Enrollment.Completed
            select new { enrollment.EmployeeId, course.Code }).Distinct().ToListAsync();
        if (completed.Count > 0)
        {
            var courses = (await catalog.LoadAsync(organizationId))
                .SelectMany(course => CourseCodes.Aliases(course.Code).Select(code => (Code: code, Course: course)))
                .ToLookup(row => row.Code, row => row.Course, StringComparer.OrdinalIgnoreCase);
            foreach (var row in completed)
            foreach (var course in courses[row.Code])
                Confirm((row.EmployeeId, course.CategoryId), course.Tier);
        }

        var evidence = await (
            from item in context.CompetencyEvidences.AsNoTracking()
            join competency in context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
            where employeeIds.Contains(item.EmployeeId) && categoryIds.Contains(competency.CategoryId)
                && item.SourceType == Statuses.EvidenceSourceType.PracticalTask && item.Status == Statuses.EvidenceStatus.Confirmed
                && item.IsLevelConfirming && item.ConfirmedLevel != null
            select new { item.EmployeeId, competency.CategoryId, Level = item.ConfirmedLevel!.Value }).ToListAsync();
        foreach (var item in evidence)
            Confirm((item.EmployeeId, item.CategoryId), item.Level);

        return new(baseline, current, surveyedAt);

        void Confirm((Guid EmployeeId, Guid CategoryId) key, int level) =>
            current[key] = Math.Max(current.GetValueOrDefault(key), Math.Clamp(level, 0, PulseRules.MaxLevel));
    }
}
