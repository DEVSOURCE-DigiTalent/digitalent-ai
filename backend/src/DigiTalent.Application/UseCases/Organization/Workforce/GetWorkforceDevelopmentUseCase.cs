using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

public sealed record GetWorkforceDevelopmentInput(Guid? DepartmentId, Guid? EmployeeId);

public sealed record WorkforceDevelopmentLevelCounts(int BelowBasic, int Basic, int Intermediate, int Advanced, int NoData);

public sealed record WorkforceDevelopmentDomain(
    string Code, string Name, decimal? Baseline, decimal? Current, int? Target,
    int BaselineCount, int CurrentCount, WorkforceDevelopmentLevelCounts CurrentLevels);

public sealed record GetWorkforceDevelopmentOutput(int EmployeeCount, IReadOnlyList<WorkforceDevelopmentDomain> Domains);

public sealed class GetWorkforceDevelopmentUseCase(
    IApplicationDbContext context,
    EmployeeScope scope,
    CapabilityCeilingReader ceilings,
    PulseCatalogReader catalog) : IUseCase<GetWorkforceDevelopmentInput, GetWorkforceDevelopmentOutput>
{
    private static readonly string[] DomainCodes = ["TT02_D1", "TT02_D2", "TT02_D3", "TT02_D4", "TT02_D5", "TT02_D6"];

    public async Task<GetWorkforceDevelopmentOutput> ExecuteAsync(GetWorkforceDevelopmentInput input)
    {
        var member = input.EmployeeId is Guid employeeId ? await scope.GetVisibleEmployeeAsync(employeeId) : null;
        var departmentId = member?.DepartmentId ?? input.DepartmentId;
        var department = await scope.VisibleDepartments().AsNoTracking().FirstOrDefaultAsync(d => d.Id == departmentId)
            ?? throw new NotFoundException("Không tìm thấy phòng ban trong phạm vi quản lý.");
        var employees = scope.VisibleEmployees().AsNoTracking().Where(e => e.DepartmentId == department.Id);
        employees = member == null ? employees.Where(e => e.Status == Statuses.Employee.Active) : employees.Where(e => e.Id == member.Id);
        var employeeIds = await employees.Select(e => e.Id).ToListAsync();

        var categories = await context.CompetencyCategories.AsNoTracking()
            .Where(c => c.OrganizationId == department.OrganizationId && DomainCodes.Contains(c.Code))
            .OrderBy(c => c.Code)
            .Select(c => new { c.Id, c.Code, c.Name }).ToListAsync();
        var categoryIds = categories.Select(c => c.Id).ToList();
        var limits = await ceilings.EffectiveForDepartmentAsync(department.OrganizationId, department.Id, categoryIds);
        var positionId = member == null ? null : await EffectiveJobPositions.Resolve(context, employees)
            .Select(row => row.PositionId).FirstOrDefaultAsync();
        var position = positionId is Guid id
            ? (await new PositionTargetsReader(context).LoadAsync(department.OrganizationId, [id])).GetValueOrDefault(id)
            : null;

        var assessments = await context.TrialAssessments.AsNoTracking()
            .Where(a => employeeIds.Contains(a.EmployeeId)).OrderBy(a => a.SubmittedAt).ThenBy(a => a.Id).ToListAsync();
        var assessmentIds = assessments.Select(a => a.Id).ToList();
        var details = (await context.TrialAssessmentDomains.AsNoTracking()
            .Where(d => assessmentIds.Contains(d.TrialAssessmentId)).ToListAsync()).ToLookup(d => d.TrialAssessmentId);
        var baseline = new Dictionary<(Guid EmployeeId, Guid CategoryId), int>();
        var current = new Dictionary<(Guid EmployeeId, Guid CategoryId), int>();

        foreach (var assessment in assessments)
        {
            var domains = details[assessment.Id].ToList();
            if (!TrialAssessmentResults.IsReady(assessment, domains)) continue;
            foreach (var domain in domains)
            {
                var key = (assessment.EmployeeId, domain.CategoryId);
                var level = TrialAssessmentResults.EffectiveLevelOf(domain);
                baseline.TryAdd(key, level);
                ConfirmLevel(key, level);
            }
        }

        if (employeeIds.Count > 0)
        {
            var completed = await (
                from enrollment in context.Enrollments.AsNoTracking()
                join course in context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where employeeIds.Contains(enrollment.EmployeeId) && course.OrganizationId == department.OrganizationId
                    && enrollment.Status == Statuses.Enrollment.Completed
                select new { enrollment.EmployeeId, course.Code }).Distinct().ToListAsync();
            if (completed.Count > 0)
            {
                var courses = (await catalog.LoadAsync(department.OrganizationId))
                    .SelectMany(course => CourseCodes.Aliases(course.Code).Select(code => (Code: code, Course: course)))
                    .ToLookup(row => row.Code, row => row.Course, StringComparer.OrdinalIgnoreCase);
                foreach (var row in completed)
                foreach (var course in courses[row.Code])
                    ConfirmLevel((row.EmployeeId, course.CategoryId), course.Tier);
            }

            var evidence = await (
                from item in context.CompetencyEvidences.AsNoTracking()
                join competency in context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                where employeeIds.Contains(item.EmployeeId) && categoryIds.Contains(competency.CategoryId)
                    && item.SourceType == Statuses.EvidenceSourceType.PracticalTask && item.Status == Statuses.EvidenceStatus.Confirmed
                    && item.IsLevelConfirming && item.ConfirmedLevel != null
                select new { item.EmployeeId, competency.CategoryId, Level = item.ConfirmedLevel!.Value }).ToListAsync();
            foreach (var item in evidence)
                ConfirmLevel((item.EmployeeId, item.CategoryId), item.Level);
        }

        return new GetWorkforceDevelopmentOutput(employeeIds.Count, categories.Select(category =>
        {
            var initial = baseline.Where(row => row.Key.CategoryId == category.Id).Select(row => row.Value).ToList();
            var verified = current.Where(row => row.Key.CategoryId == category.Id).Select(row => row.Value).ToList();
            var limit = limits[category.Id];
            var positionTarget = position?.Levels.GetValueOrDefault(category.Id) ?? 0;
            int? target = member == null ? limit : positionId == null ? null : Math.Min(positionTarget > 0 ? positionTarget : limit, limit);
            return new WorkforceDevelopmentDomain(category.Code, PulseLearnerReader.DisplayName(category.Name),
                Average(initial), Average(verified), target, initial.Count, verified.Count,
                new WorkforceDevelopmentLevelCounts(
                    verified.Count(level => level == 0), verified.Count(level => level == 1),
                    verified.Count(level => level == 2), verified.Count(level => level == 3),
                    employeeIds.Count - verified.Count));
        }).ToList());

        void ConfirmLevel((Guid EmployeeId, Guid CategoryId) key, int level) =>
            current[key] = Math.Max(current.GetValueOrDefault(key), Math.Clamp(level, 0, PulseRules.MaxLevel));
    }

    private static decimal? Average(List<int> levels) =>
        levels.Count == 0 ? null : Math.Round(levels.Average(level => (decimal)level), 2);
}
