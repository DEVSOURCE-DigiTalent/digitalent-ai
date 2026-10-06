using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetTasksUseCase : IUseCase<GetTasksInput, GetTasksOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetTasksUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetTasksOutput> ExecuteAsync(GetTasksInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query = _context.PracticalTaskTemplates.AsNoTracking()
            .Where(t => t.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(t => t.Status == input.Status.Trim().ToUpper());
        else
            query = query.Where(t => t.Status != "DRAFT");

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(search));
        }

        var assignments = _context.TaskAssignments.AsNoTracking();
        var submissions = _context.TaskSubmissions.AsNoTracking();
        var evaluations = _context.TaskEvaluations.AsNoTracking();
        var employees = _context.Employees.AsNoTracking();
        var departments = _context.Departments.AsNoTracking();
        var targets = _context.PracticalTaskTargets.AsNoTracking();
        var users = _context.Users.AsNoTracking();

        if (input.DepartmentId.HasValue)
        {
            var empIds = employees.Where(e => e.DepartmentId == input.DepartmentId.Value).Select(e => e.Id);
            var templateIds = assignments.Where(a => empIds.Contains(a.EmployeeId)).Select(a => a.TaskTemplateId).Distinct();
            query = query.Where(t => templateIds.Contains(t.Id));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new PracticalTaskListItem
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                ExpectedOutput = t.ExpectedOutput,
                CompetencyIds = targets.Where(tg => tg.TaskTemplateId == t.Id).Select(tg => tg.CompetencyId).ToList(),
                TargetLevel = targets.Where(tg => tg.TaskTemplateId == t.Id).OrderBy(tg => tg.SortOrder).Select(tg => tg.TargetLevel).FirstOrDefault(),
                DepartmentId = assignments.Where(a => a.TaskTemplateId == t.Id)
                    .Join(employees, a => a.EmployeeId, e => e.Id, (a, e) => e.DepartmentId)
                    .FirstOrDefault(),
                DepartmentName = assignments.Where(a => a.TaskTemplateId == t.Id)
                    .Join(employees, a => a.EmployeeId, e => e.Id, (a, e) => e.DepartmentId)
                    .Join(departments, did => did, d => d.Id, (did, d) => d.Name)
                    .FirstOrDefault(),
                AssignedEmployeesCount = assignments.Count(a => a.TaskTemplateId == t.Id),
                AssignedByName = users.Where(u => u.Id == t.CreatedByUserId).Select(u => u.DisplayName).FirstOrDefault(),
                AssignedAt = assignments.Where(a => a.TaskTemplateId == t.Id).OrderBy(a => a.AssignedAt).Select(a => a.AssignedAt).FirstOrDefault(),
                DueDate = assignments.Where(a => a.TaskTemplateId == t.Id).Select(a => a.DueAt).FirstOrDefault() != null
                    ? assignments.Where(a => a.TaskTemplateId == t.Id).Select(a => a.DueAt).FirstOrDefault()!.Value.ToString("yyyy-MM-dd")
                    : null,
                RubricCriteria = t.GeneralMarkingCriteria,
                Status = t.Status,
                SubmissionsCount = assignments.Where(a => a.TaskTemplateId == t.Id)
                    .Join(submissions, a => a.Id, s => s.TaskAssignmentId, (a, s) => s)
                    .Count(s => s.Status != "SUPERSEDED"),
                PendingReviewCount = assignments.Where(a => a.TaskTemplateId == t.Id)
                    .Count(a => a.Status == "SUBMITTED"),
                ApprovedCount = assignments.Where(a => a.TaskTemplateId == t.Id)
                    .Count(a => a.Status == "PASSED"),
            })
            .ToListAsync();

        return new GetTasksOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
