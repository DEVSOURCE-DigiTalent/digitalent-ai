using DigiTalent.Application.Common.Authorization;
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

        var employees = new EmployeeScope(_context, _currentUser).VisibleEmployees().AsNoTracking();
        var query =
            from ca in _context.CourseAssignments.AsNoTracking()
            join emp in employees on ca.EmployeeId equals emp.Id
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

        var progress = query.Select(x => new
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
                x.ca.DueDate,
                Status = x.ca.Status,
                ProgressPercent = x.enrollment != null ? (int)x.enrollment.ProgressPercent : 0,
                CompletedAt = x.enrollment != null ? x.enrollment.CompletedAt : null,
                Source = x.ca.AssignmentSource,
                Overdue = x.ca.DueDate != null && x.ca.DueDate < today && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled,
                DueSoon = x.ca.DueDate != null && x.ca.DueDate >= today && x.ca.DueDate <= dueSoonThreshold && x.ca.Status != Statuses.Enrollment.Completed && x.ca.Status != Statuses.Enrollment.Cancelled,
            });

        if (input.IncludeIndependentLearning && input.Overdue != true && input.DueSoon != true)
        {
            var independent =
                from enrollment in _context.Enrollments.AsNoTracking()
                join emp in employees on enrollment.EmployeeId equals emp.Id
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id
                join pos in _context.JobPositions.AsNoTracking() on emp.JobPositionId equals pos.Id into positions
                from pos in positions.DefaultIfEmpty()
                where enrollment.CourseAssignmentId == null && enrollment.Status != Statuses.Enrollment.Cancelled
                      && (input.CourseId == null || enrollment.CourseId == input.CourseId)
                      && (input.EmployeeId == null || emp.Id == input.EmployeeId)
                      && (input.DepartmentId == null || emp.DepartmentId == input.DepartmentId)
                      && (input.JobPositionId == null || emp.JobPositionId == input.JobPositionId)
                      && !_context.CourseAssignments.Any(a => a.EmployeeId == emp.Id
                          && a.CourseId == course.Id && a.Status != Statuses.Enrollment.Cancelled)
                select new { enrollment, emp, course, dept, pos };

            if (!string.IsNullOrWhiteSpace(input.Status))
            {
                var status = input.Status.Trim().ToUpper();
                independent = independent.Where(x => x.enrollment.Status == status);
            }
            if (!string.IsNullOrWhiteSpace(input.Search))
            {
                var search = input.Search.Trim().ToLower();
                independent = independent.Where(x => x.emp.FullName.ToLower().Contains(search)
                    || x.emp.EmployeeCode.ToLower().Contains(search) || x.course.Title.ToLower().Contains(search));
            }

            progress = progress.Concat(independent.Select(x => new
            {
                x.enrollment.Id,
                x.enrollment.EmployeeId,
                EmployeeName = x.emp.FullName,
                x.emp.EmployeeCode,
                DepartmentName = (string?)x.dept.Name,
                PositionName = x.pos != null ? x.pos.Name : null,
                x.enrollment.CourseId,
                CourseCode = x.course.Code,
                CourseTitle = x.course.Title,
                AssignedAt = x.enrollment.CreatedAt,
                AssignedByName = "",
                DueDate = (DateOnly?)null,
                x.enrollment.Status,
                ProgressPercent = (int)x.enrollment.ProgressPercent,
                x.enrollment.CompletedAt,
                Source = "SELF_ENROLLED",
                Overdue = false,
                DueSoon = false,
            }));
        }

        var totalItems = await progress.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);
        var rows = await progress.OrderByDescending(x => x.AssignedAt).ThenBy(x => x.Id)
            .Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = rows.Select(x => new AssignmentRow
        {
            Id = x.Id,
            EmployeeId = x.EmployeeId,
            EmployeeName = x.EmployeeName,
            EmployeeCode = x.EmployeeCode,
            DepartmentName = x.DepartmentName,
            PositionName = x.PositionName,
            CourseId = x.CourseId,
            CourseCode = x.CourseCode,
            CourseTitle = x.CourseTitle,
            AssignedAt = x.AssignedAt,
            AssignedByName = x.AssignedByName,
            DueDate = x.DueDate?.ToString("yyyy-MM-dd"),
            Status = x.Status,
            ProgressPercent = x.ProgressPercent,
            CompletedAt = x.CompletedAt,
            Source = x.Source,
            Overdue = x.Overdue,
            DueSoon = x.DueSoon,
        }).ToList();

        return new GetCourseAssignmentsOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
