using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class GetAssignmentSummaryUseCase : IUseCase<GetAssignmentSummaryInput, AssignmentSummaryOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAssignmentSummaryUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AssignmentSummaryOutput> ExecuteAsync(GetAssignmentSummaryInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoonThreshold = today.AddDays(7);

        var assignments = await (
            from ca in _context.CourseAssignments.AsNoTracking()
            join course in _context.Courses.AsNoTracking() on ca.CourseId equals course.Id
            join emp in _context.Employees.AsNoTracking() on ca.EmployeeId equals emp.Id
            join enrollment in _context.Enrollments.AsNoTracking() on ca.Id equals enrollment.CourseAssignmentId into enrollJoin
            from enrollment in enrollJoin.DefaultIfEmpty()
            where course.OrganizationId == organizationId && ca.Status == "ACTIVE"
            select new
            {
                EnrollmentStatus = enrollment != null ? enrollment.Status : Statuses.Enrollment.NotStarted,
                ca.DueDate,
                emp.DepartmentId,
                Progress = enrollment != null ? (int)enrollment.ProgressPercent : 0,
            }
        ).ToListAsync();

        var total = assignments.Count;
        var notStarted = assignments.Count(a => a.EnrollmentStatus == Statuses.Enrollment.NotStarted);
        var inProgress = assignments.Count(a => a.EnrollmentStatus == Statuses.Enrollment.InProgress);
        var readyForAssessment = assignments.Count(a => a.EnrollmentStatus == Statuses.Enrollment.ReadyForAssessment);
        var completed = assignments.Count(a => a.EnrollmentStatus == Statuses.Enrollment.Completed);
        var active = assignments.Where(a => a.EnrollmentStatus != Statuses.Enrollment.Completed).ToList();
        var overdue = active.Count(a => a.DueDate != null && a.DueDate < today);
        var dueSoon = active.Count(a => a.DueDate != null && a.DueDate >= today && a.DueDate <= dueSoonThreshold);

        var departments = await _context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == organizationId)
            .Select(d => new { d.Id, d.Name })
            .ToListAsync();

        var byDepartment = departments.Select(dept =>
        {
            var deptAssignments = assignments.Where(a => a.DepartmentId == dept.Id).ToList();
            return new DepartmentSummary
            {
                DepartmentId = dept.Id,
                Name = dept.Name,
                Total = deptAssignments.Count,
                Completed = deptAssignments.Count(a => a.EnrollmentStatus == Statuses.Enrollment.Completed),
                Overdue = deptAssignments.Count(a => a.DueDate != null && a.DueDate < today && a.EnrollmentStatus != Statuses.Enrollment.Completed),
                AverageProgress = deptAssignments.Count > 0 ? (int)deptAssignments.Average(a => a.Progress) : 0,
            };
        }).Where(d => d.Total > 0).ToList();

        return new AssignmentSummaryOutput
        {
            Total = total,
            NotStarted = notStarted,
            InProgress = inProgress,
            ReadyForAssessment = readyForAssessment,
            Completed = completed,
            Overdue = overdue,
            DueSoon = dueSoon,
            CompletionRate = total > 0 ? Math.Round((decimal)completed / total * 100, 1) : 0,
            ByDepartment = byDepartment,
        };
    }
}
