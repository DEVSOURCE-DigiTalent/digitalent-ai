using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

public class LearningNeedCompetency
{
    public Guid CompetencyId { get; set; }
    public string Name { get; set; } = "";
    public int RequiredLevel { get; set; }
    public int? CurrentLevel { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public string? Source { get; set; }
}

public class LearningNeedDomain
{
    public int? AssessmentLevel { get; set; }
    public DateTimeOffset? AssessmentReviewedAt { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = "";
    public int Number { get; set; }
    public int RequiredLevel { get; set; }
    public int? CurrentLevel { get; set; }
    public string State { get; set; } = "WAITING_ASSESSMENT";
    public Guid? CourseId { get; set; }
    public string? CourseCode { get; set; }
    public string? CourseTitle { get; set; }
    public List<string> MissingCompetencies { get; set; } = new();
    public List<LearningNeedCompetency> Competencies { get; set; } = new();
}

public class EmployeeLearningNeeds
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = "";
    public Guid? PositionId { get; set; }
    public string? PositionName { get; set; }
    public string? DepartmentName { get; set; }
    public string State { get; set; } = "WAITING_ASSESSMENT";
    public List<LearningNeedDomain> Domains { get; set; } = new();
}

public class GetLearningNeedsOutput
{
    public LearningNeedsOverview Overview { get; set; } = new();
    public List<EmployeeLearningNeeds> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
}

/// <summary>Actionable training needs: published overall assessment versus the current position standard.
/// Later confirmed evidence can resolve a gap. Buying or completing a course alone cannot resolve it.</summary>
public class GetLearningNeedsUseCase : IUseCase<GetSkillGapRunsUseCaseInput, GetLearningNeedsOutput>
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUser _user;
    private readonly EmployeeScope _scope;
    public GetLearningNeedsUseCase(IApplicationDbContext db, ICurrentUser user, EmployeeScope scope)
    { _db = db; _user = user; _scope = scope; }

    public async Task<GetLearningNeedsOutput> ExecuteAsync(GetSkillGapRunsUseCaseInput input)
    {
        var orgId = _user.GetRequiredOrganizationId();
        var query = _scope.VisibleEmployees().AsNoTracking().Where(e => e.Status == "ACTIVE");
        if (input.EmployeeId.HasValue) query = query.Where(e => e.Id == input.EmployeeId);
        if (input.DepartmentId.HasValue) query = query.Where(e => e.DepartmentId == input.DepartmentId);
        if (input.JobPositionId.HasValue) query = query.Where(e => e.JobPositionId == input.JobPositionId);
        if (!string.IsNullOrWhiteSpace(input.JobGrade)) query = query.Where(e => _db.JobPositions.Any(p => p.Id == e.JobPositionId && p.JobGrade == input.JobGrade));
        if (!string.IsNullOrWhiteSpace(input.Search)) { var search = input.Search.Trim().ToLower(); query = query.Where(e => e.FullName.ToLower().Contains(search) || e.EmployeeCode.ToLower().Contains(search)); }
        var pageSize = Math.Clamp(input.PageSize, 1, 100);
        var output = new GetLearningNeedsOutput { PageIndex = Math.Max(1, input.PageIndex), PageSize = pageSize, TotalItems = await query.CountAsync() };
        // Aggregate the entire visible scope before paging the employee lookup.
        var employees = await query.OrderBy(e => e.FullName).ThenBy(e => e.Id).ToListAsync();
        var employeeIds = employees.Select(e => e.Id).ToList();
        var positionIds = employees.Where(e => e.JobPositionId.HasValue).Select(e => e.JobPositionId!.Value).Distinct().ToList();
        var sets = await _db.PositionRequirementSets.AsNoTracking().Where(s => positionIds.Contains(s.JobPositionId) && s.Status == "ACTIVE").OrderByDescending(s => s.VersionNo).ToListAsync();
        var setIds = sets.Select(s => s.Id).ToList();
        var requirements = await (from item in _db.PositionRequirementItems.AsNoTracking()
            join competency in _db.Competencies on item.CompetencyId equals competency.Id
            join category in _db.CompetencyCategories on competency.CategoryId equals category.Id
            where setIds.Contains(item.RequirementSetId)
            select new { item.RequirementSetId, item.CompetencyId, item.RequiredLevel, competency.Name, CategoryId = category.Id, CategoryName = category.Name, category.SortOrder }).ToListAsync();
        var positions = await _db.JobPositions.AsNoTracking().Where(p => positionIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.Name);
        var departments = await _db.Departments.AsNoTracking().Where(d => d.OrganizationId == orgId).ToDictionaryAsync(d => d.Id, d => d.Name);
        var publishedAt = await _db.TrialWorkspaces.AsNoTracking().Where(w => w.OrganizationId == orgId && w.ReportPublishedAt != null)
            .OrderByDescending(w => w.ReportPublishedAt).Select(w => w.ReportPublishedAt).FirstOrDefaultAsync();
        var assessments = await _db.TrialAssessments.AsNoTracking().Where(a => a.OrganizationId == orgId && employeeIds.Contains(a.EmployeeId) && a.ReviewedAt != null && a.ReviewedAt <= publishedAt).OrderByDescending(a => a.ReviewedAt).ToListAsync();
        var assessmentIds = assessments.Select(a => a.Id).ToList();
        var results = await _db.TrialAssessmentDomains.AsNoTracking().Where(d => assessmentIds.Contains(d.TrialAssessmentId)).ToListAsync();
        var profiles = await _db.EmployeeCompetencyProfiles.AsNoTracking().Where(p => employeeIds.Contains(p.EmployeeId)).ToDictionaryAsync(p => new { p.EmployeeId, p.CompetencyId });
        var catalog = await new PulseCatalogReader(_db).LoadAsync(orgId);
        foreach (var employee in employees)
        {
            var row = new EmployeeLearningNeeds { EmployeeId = employee.Id, EmployeeName = employee.FullName, PositionId = employee.JobPositionId,
                PositionName = employee.JobPositionId.HasValue ? positions.GetValueOrDefault(employee.JobPositionId.Value) : null,
                DepartmentName = departments.GetValueOrDefault(employee.DepartmentId) };
            output.Items.Add(row);
            var standard = sets.FirstOrDefault(s => s.JobPositionId == employee.JobPositionId);
            if (standard == null) { row.State = "NO_STANDARD"; continue; }
            var assessment = assessments.FirstOrDefault(a => a.EmployeeId == employee.Id);
            var domainResults = results.Where(d => d.TrialAssessmentId == assessment?.Id).ToDictionary(d => d.CategoryId);
            foreach (var domain in requirements.Where(r => r.RequirementSetId == standard.Id && r.RequiredLevel > 0).GroupBy(r => r.CategoryId).OrderBy(g => g.First().SortOrder))
            {
                var first = domain.First();
                var target = domain.Max(r => r.RequiredLevel);
                var need = new LearningNeedDomain { CategoryId = first.CategoryId, Name = first.CategoryName, Number = first.SortOrder, RequiredLevel = target };
                row.Domains.Add(need);
                need.Competencies = domain.Select(r => new LearningNeedCompetency { CompetencyId = r.CompetencyId, Name = r.Name, RequiredLevel = target }).ToList();
                if (assessment == null || !domainResults.TryGetValue(domain.Key, out var result)) continue;
                var baseline = result.MentorLevel ?? result.SuggestedLevel;
                need.AssessmentLevel = baseline;
                need.AssessmentReviewedAt = assessment.ReviewedAt;
                var levels = domain.Select(requirement => {
                    var profile = profiles.GetValueOrDefault(new { EmployeeId = employee.Id, requirement.CompetencyId });
                    var newerEvidence = profile != null && profile.ConfirmedAt > assessment.ReviewedAt;
                    var level = newerEvidence ? profile!.ConfirmedLevel : baseline;
                    var competency = need.Competencies.First(c => c.CompetencyId == requirement.CompetencyId);
                    competency.CurrentLevel = level;
                    competency.ConfirmedAt = newerEvidence ? profile!.ConfirmedAt : assessment.ReviewedAt;
                    competency.Source = newerEvidence ? "EVIDENCE" : "ASSESSMENT";
                    if (level < target) need.MissingCompetencies.Add(requirement.Name);
                    return (int)level;
                }).ToList();
                need.CurrentLevel = levels.Min();
                need.State = need.MissingCompetencies.Count == 0 ? "MET" : "NEEDS_LEARNING";
                if (need.State == "MET") continue;
                var course = catalog.FirstOrDefault(c => c.CategoryId == domain.Key && c.Tier == target);
                need.CourseId = course?.CourseId; need.CourseCode = course?.Code; need.CourseTitle = course?.Title;
            }
            row.State = row.Domains.Any(d => d.State == "NEEDS_LEARNING") ? "NEEDS_LEARNING" : row.Domains.Any(d => d.State == "WAITING_ASSESSMENT") ? "WAITING_ASSESSMENT" : row.Domains.Count > 0 ? "MET" : "NO_STANDARD";
        }
        output.Overview = LearningNeedsOverview.From(output.Items);
        output.Items = output.Items.Skip((output.PageIndex - 1) * pageSize).Take(pageSize).ToList();
        return output;
    }
}
