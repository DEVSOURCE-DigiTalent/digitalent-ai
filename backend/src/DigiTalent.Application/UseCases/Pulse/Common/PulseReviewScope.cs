using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Phạm vi chấm bài cuối khóa (§10.1): quản lý chỉ thấy nhân viên phòng ban mình, chủ doanh nghiệp thấy toàn tổ chức
/// (EmployeeScope); không ai tự chấm bài của chính mình. Ngoài phạm vi → 404.
/// </summary>
public class PulseReviewScope
{
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _scope;
    private readonly ICurrentUser _currentUser;

    public PulseReviewScope(IApplicationDbContext context, EmployeeScope scope, ICurrentUser currentUser)
    {
        _context = context;
        _scope = scope;
        _currentUser = currentUser;
    }

    public Guid ReviewerUserId => _currentUser.UserId ?? throw new ForbiddenException("Không xác định được người chấm.");

    public IQueryable<Employee> ReviewableEmployees()
    {
        var reviewerUserId = ReviewerUserId;
        return _scope.VisibleEmployees().Where(e => e.UserId == null || e.UserId != reviewerUserId);
    }

    /// <summary>Lần nộp (được theo dõi) + lượt học + nhân viên, nếu nhân viên nằm trong phạm vi chấm.</summary>
    public async Task<(CourseFinalSubmission Submission, Enrollment Enrollment, Employee Employee)> LoadAsync(Guid submissionId)
    {
        var row = await (
                from submission in _context.CourseFinalSubmissions
                join enrollment in _context.Enrollments on submission.EnrollmentId equals enrollment.Id
                join employee in ReviewableEmployees() on enrollment.EmployeeId equals employee.Id
                where submission.Id == submissionId
                select new { submission, enrollment, employee })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Không tìm thấy bài cuối khóa trong phạm vi chấm của bạn.");
        return (row.submission, row.enrollment, row.employee);
    }

    /// <summary>Bài đánh giá trước khi học (được theo dõi) + nhân viên, nếu nhân viên nằm trong phạm vi chấm.</summary>
    public async Task<(CoursePreAssessment PreAssessment, Employee Employee)> LoadPreAssessmentAsync(Guid preAssessmentId)
    {
        var row = await (
                from preAssessment in _context.CoursePreAssessments
                join employee in ReviewableEmployees() on preAssessment.EmployeeId equals employee.Id
                where preAssessment.Id == preAssessmentId
                select new { preAssessment, employee })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Không tìm thấy bài đánh giá trước khi học trong phạm vi chấm của bạn.");
        return (row.preAssessment, row.employee);
    }

    public Task<List<CourseFinalSubmission>> AttemptsAsync(Guid enrollmentId) =>
        _context.CourseFinalSubmissions
            .Where(s => s.EnrollmentId == enrollmentId)
            .OrderBy(s => s.AttemptNo)
            .ToListAsync();
}
