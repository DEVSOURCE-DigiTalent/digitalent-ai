using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.CourseAssignments;

public class GetCourseAssignmentsUseCase : IUseCase<GetCourseAssignmentsInput, GetCourseAssignmentsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCourseAssignmentsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetCourseAssignmentsOutput> ExecuteAsync(GetCourseAssignmentsInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueSoonThreshold = today.AddDays(7);

        var query =
            from ca in _context.CourseAssignments.AsNoTracking()
            join emp in _context.Employees.AsNoTracking() on ca.EmployeeId equals emp.Id
            join course in _context.Courses.AsNoTracking() on ca.CourseId equals course.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            join pos in _context.JobPositions.AsNoTracking() on emp.JobPositionId equals pos.Id into posJoin
            from pos in posJoin.DefaultIfEmpty()
            join assignedBy in _context.Users.AsNoTracking() on ca.AssignedByUserId equals assignedBy.Id into userJoin
            from assignedBy in userJoin.DefaultIfEmpty()
            join enrollment in _context.Enrollments.AsNoTracking() on ca.Id equals enrollment.CourseAssignmentId into enrollJoin
            from enrollment in enrollJoin.DefaultIfEmpty()
            where course.OrganizationId == organizationId
            select new { ca, emp, course, dept, pos, assignedBy, enrollment };

        if (input.CourseId.HasValue)
            query = query.Where(x => x.ca.CourseId == input.CourseId.Value);

        if (input.EmployeeId.HasValue)
            query = query.Where(x => x.ca.EmployeeId == input.EmployeeId.Value);

        if (input.DepartmentId.HasValue)
            query = query.Where(x => x.emp.DepartmentId == input.DepartmentId.Value);

        if (input.JobPositionId.HasValue)
            query = query.Where(x => x.emp.JobPositionId == input.JobPositionId.Value);

        if (!string.IsNullOrWhiteSpace(input.Status))
        {
            var status = input.Status.Trim().ToUpper();
            query = query.Where(x => x.ca.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x =>
                x.emp.FullName.ToLower().Contains(search) ||
                x.emp.EmployeeCode.ToLower().Contains(search) ||
                x.course.Title.ToLower().Contains(search));
        }

        if (input.Overdue == true)
            query = query.Where(x => x.ca.DueDate != null && x.ca.DueDate < today && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled);

        if (input.DueSoon == true)
            query = query.Where(x => x.ca.DueDate != null && x.ca.DueDate >= today && x.ca.DueDate <= dueSoonThreshold && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled);

        var totalItems = await query.CountAsync();

        var pageIndex = input.PageIndex < 1 ? 1 : input.PageIndex;
        var pageSize = input.PageSize < 1 ? 20 : input.PageSize;

        var items = await query
            .OrderByDescending(x => x.ca.AssignedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AssignmentRow
            {
                Id = x.ca.Id,
                EmployeeId = x.ca.EmployeeId,
                EmployeeName = x.emp.FullName,
                EmployeeCode = x.emp.EmployeeCode,
                DepartmentName = x.dept != null ? x.dept.Name : null,
                PositionName = x.pos != null ? x.pos.Name : null,
                CourseId = x.ca.CourseId,
                CourseCode = x.course.Code,
                CourseTitle = x.course.Title,
                AssignedAt = x.ca.AssignedAt,
                AssignedByName = x.assignedBy != null ? x.assignedBy.DisplayName : "",
                DueDate = x.ca.DueDate != null ? x.ca.DueDate.Value.ToString("yyyy-MM-dd") : null,
                Status = x.ca.Status,
                ProgressPercent = x.enrollment != null ? (int)x.enrollment.ProgressPercent : 0,
                CompletedAt = x.enrollment != null ? x.enrollment.CompletedAt : null,
                Source = x.ca.AssignmentSource,
                Overdue = x.ca.DueDate != null && x.ca.DueDate < today && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled,
                DueSoon = x.ca.DueDate != null && x.ca.DueDate >= today && x.ca.DueDate <= dueSoonThreshold && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled,
            })
            .ToListAsync();

        return new GetCourseAssignmentsOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
