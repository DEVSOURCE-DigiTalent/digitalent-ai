using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Tasks;

public class GetReviewQueueUseCase : IUseCase<GetReviewQueueInput, GetReviewQueueOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetReviewQueueUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetReviewQueueOutput> ExecuteAsync(GetReviewQueueInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new Common.Exceptions.ForbiddenException("Chưa xác thực.");

        var query =
            from s in _context.TaskSubmissions.AsNoTracking()
            join a in _context.TaskAssignments.AsNoTracking() on s.TaskAssignmentId equals a.Id
            join emp in _context.Employees.AsNoTracking() on a.EmployeeId equals emp.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            where s.Status == "SUBMITTED" && a.Status == "SUBMITTED"
            select new { s, a, emp, dept };

        if (!_currentUser.IsAdmin)
            query = query.Where(x => x.a.ReviewerUserId == userId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x =>
                x.emp.FullName.ToLower().Contains(search) ||
                x.a.TitleSnapshot.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var targets = _context.PracticalTaskTargets.AsNoTracking();

        var items = await query
            .OrderByDescending(x => x.s.SubmittedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ReviewQueueItemDto
            {
                Id = x.s.Id,
                TaskId = x.a.TaskTemplateId ?? Guid.Empty,
                TaskTitle = x.a.TitleSnapshot,
                TaskDueDate = x.a.DueAt != null ? x.a.DueAt.Value.ToString("yyyy-MM-dd") : null,
                TargetLevel = targets
                    .Where(tg => tg.TaskTemplateId == x.a.TaskTemplateId)
                    .OrderBy(tg => tg.SortOrder)
                    .Select(tg => tg.TargetLevel)
                    .FirstOrDefault(),
                EmployeeId = x.emp.Id,
                EmployeeName = x.emp.FullName,
                EmployeeCode = x.emp.EmployeeCode,
                DepartmentName = x.dept != null ? x.dept.Name : null,
                SubmittedAt = x.s.SubmittedAt,
                Content = x.s.SubmissionNote ?? "",
                LinkUrls = string.IsNullOrEmpty(x.s.SubmissionUrl) ? new List<string>() : new List<string> { x.s.SubmissionUrl },
                Status = "PENDING_REVIEW",
            })
            .ToListAsync();

        return new GetReviewQueueOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
