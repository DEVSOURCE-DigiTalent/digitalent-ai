using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.RecommendationReviews;

// ── GET list ──
public class GetRecommendationReviewsUseCase : IUseCase<GetRecommendationReviewsInput, GetRecommendationReviewsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetRecommendationReviewsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetRecommendationReviewsOutput> ExecuteAsync(GetRecommendationReviewsInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var query =
            from rr in _context.RecommendationReviews.AsNoTracking()
            join emp in _context.Employees.AsNoTracking() on rr.EmployeeId equals emp.Id
            join course in _context.Courses.AsNoTracking() on rr.CourseId equals course.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            join pos in _context.JobPositions.AsNoTracking() on emp.JobPositionId equals pos.Id into posJoin
            from pos in posJoin.DefaultIfEmpty()
            join decidedBy in _context.Users.AsNoTracking() on rr.DecidedByUserId equals decidedBy.Id into userJoin
            from decidedBy in userJoin.DefaultIfEmpty()
            where rr.OrganizationId == orgId
            select new { rr, emp, course, dept, pos, decidedBy };

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(x => x.rr.Status == input.Status.Trim().ToUpper());

        if (input.DepartmentId.HasValue)
            query = query.Where(x => x.emp.DepartmentId == input.DepartmentId.Value);

        if (input.JobPositionId.HasValue)
            query = query.Where(x => x.emp.JobPositionId == input.JobPositionId.Value);

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var items = await query
            .OrderByDescending(x => x.rr.Score)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new RecommendationReviewRow
            {
                EmployeeId = x.rr.EmployeeId,
                EmployeeName = x.emp.FullName,
                EmployeeCode = x.emp.EmployeeCode,
                DepartmentName = x.dept != null ? x.dept.Name : null,
                PositionName = x.pos != null ? x.pos.Name : null,
                CourseId = x.rr.CourseId,
                CourseCode = x.course.Code,
                Title = x.course.Title,
                Score = x.rr.Score,
                GapsClosed = x.rr.GapsClosed,
                MandatoryClosed = x.rr.MandatoryClosed,
                HighClosed = x.rr.HighClosed,
                Explanation = x.rr.Explanation,
                EnrollmentStatus = null,
                Status = x.rr.Status,
                DecisionReason = x.rr.DecisionReason,
                DecidedAt = x.rr.DecidedAt,
                DecidedByName = x.decidedBy != null ? x.decidedBy.DisplayName : null,
            })
            .ToListAsync();

        return new GetRecommendationReviewsOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

// ── Accept ──
public class AcceptReviewUseCase : IUseCase<AcceptReviewInput, ReviewActionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public AcceptReviewUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ReviewActionOutput> ExecuteAsync(AcceptReviewInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new ForbiddenException("User not authenticated.");

        var review = await _context.RecommendationReviews
            .FirstOrDefaultAsync(r => r.OrganizationId == orgId
                && r.EmployeeId == input.EmployeeId
                && r.CourseId == input.CourseId)
            ?? throw new NotFoundException("Recommendation review not found.");

        if (review.Status is "ACCEPTED" or "ASSIGNED")
            throw new BadRequestException("Review already accepted.");

        var alreadyAssigned = await _context.CourseAssignments.AsNoTracking()
            .AnyAsync(ca => ca.EmployeeId == input.EmployeeId && ca.CourseId == input.CourseId
                && ca.Status != "CANCELLED");

        if (alreadyAssigned)
            throw new ConflictException("Employee already has this course assigned.");

        DateOnly? dueDate = null;
        if (!string.IsNullOrWhiteSpace(input.DueDate) && DateOnly.TryParse(input.DueDate, out var parsed))
            dueDate = parsed;

        var assignment = new CourseAssignment
        {
            EmployeeId = input.EmployeeId,
            CourseId = input.CourseId,
            AssignedByUserId = userId,
            AssignedAt = DateTimeOffset.UtcNow,
            DueDate = dueDate,
            Status = "ACTIVE",
            AssignmentSource = "RECOMMENDATION",
        };

        _context.CourseAssignments.Add(assignment);

        review.Status = "ACCEPTED";
        review.DecidedAt = DateTimeOffset.UtcNow;
        review.DecidedByUserId = userId;
        review.CourseAssignmentId = assignment.Id;

        await _context.SaveChangesAsync();

        return new ReviewActionOutput { Status = "ACCEPTED" };
    }
}

// ── Dismiss ──
public class DismissReviewUseCase : IUseCase<DismissReviewInput, ReviewActionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DismissReviewUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ReviewActionOutput> ExecuteAsync(DismissReviewInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new ForbiddenException("User not authenticated.");

        var review = await _context.RecommendationReviews
            .FirstOrDefaultAsync(r => r.OrganizationId == orgId
                && r.EmployeeId == input.EmployeeId
                && r.CourseId == input.CourseId)
            ?? throw new NotFoundException("Recommendation review not found.");

        if (review.Status == "DISMISSED")
            throw new BadRequestException("Review already dismissed.");

        review.Status = "DISMISSED";
        review.DecisionReason = input.Reason;
        review.DecidedAt = DateTimeOffset.UtcNow;
        review.DecidedByUserId = userId;

        await _context.SaveChangesAsync();

        return new ReviewActionOutput { Status = "DISMISSED" };
    }
}

// ── Reopen ──
public class ReopenReviewUseCase : IUseCase<ReopenReviewInput, ReviewActionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ReopenReviewUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ReviewActionOutput> ExecuteAsync(ReopenReviewInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var review = await _context.RecommendationReviews
            .FirstOrDefaultAsync(r => r.OrganizationId == orgId
                && r.EmployeeId == input.EmployeeId
                && r.CourseId == input.CourseId)
            ?? throw new NotFoundException("Recommendation review not found.");

        if (review.Status == "PENDING")
            throw new BadRequestException("Review is already pending.");

        review.Status = "PENDING";
        review.DecisionReason = null;
        review.DecidedAt = null;
        review.DecidedByUserId = null;

        await _context.SaveChangesAsync();

        return new ReviewActionOutput { Status = "PENDING" };
    }
}
