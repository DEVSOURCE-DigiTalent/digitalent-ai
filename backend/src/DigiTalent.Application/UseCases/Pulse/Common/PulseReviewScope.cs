using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Phạm vi bài cuối khóa: quản lý xem kết quả trong phòng ban được giao, chủ doanh nghiệp thấy toàn tổ chức
/// (EmployeeScope); không ai tự chấm bài của chính mình.
/// Với mentor DigiTalent: chấm bài dùng thử của doanh nghiệp được phân công (khi doanh nghiệp đang dùng thử) VÀ bài
/// nộp hoàn thành từng cấp/miền của nhân viên thuộc các doanh nghiệp chính thức / đã chuyển gói.
/// Doanh nghiệp dùng thử chưa phân công hoặc đã giao mentor khác nằm ngoài phạm vi của mentor → 404.
/// Riêng mentor demo (@demo.nanglucso.pro.vn) chỉ thấy các tổ chức DEMO-* để không lẫn với tổ chức thật.
/// </summary>
public class PulseReviewScope
{
    private const string DemoOrgPrefix = "DEMO-";
    private readonly IApplicationDbContext _context;
    private readonly EmployeeScope _scope;
    private readonly ICurrentUser _currentUser;
    private bool? _isDemoReviewer;

    public PulseReviewScope(IApplicationDbContext context, EmployeeScope scope, ICurrentUser currentUser)
    {
        _context = context;
        _scope = scope;
        _currentUser = currentUser;
    }

    public Guid ReviewerUserId => _currentUser.UserId ?? throw new ForbiddenException("Không xác định được người chấm.");

    private bool IsDemoReviewer()
    {
        if (_isDemoReviewer.HasValue)
        {
            return _isDemoReviewer.Value;
        }

        var email = _context.Users.AsNoTracking()
            .Where(u => u.Id == ReviewerUserId)
            .Select(u => u.Email)
            .FirstOrDefault();
        _isDemoReviewer = DemoEmailGuard.IsDemoAddress(email);
        return _isDemoReviewer.Value;
    }

    public IQueryable<Employee> ResultEmployees() =>
        _currentUser.IsDepartmentManager && !_currentUser.IsAdmin && !_currentUser.Roles.Contains(Roles.Mentor)
            ? _scope.VisibleEmployees()
            : ReviewableEmployees();

    public IQueryable<Employee> ReviewableEmployees()
    {
        var reviewerUserId = ReviewerUserId;
        var openTrials = _context.TrialWorkspaces.Where(t => t.ConvertedAt == null);
        if (_currentUser.Roles.Contains(Roles.Mentor))
        {
            var isDemo = IsDemoReviewer();
            var excludedTrials = openTrials
                .Where(t => t.MentorUserId == null || t.MentorUserId != reviewerUserId)
                .Select(t => t.OrganizationId);
            return _context.Employees.Where(e =>
                (e.UserId == null || e.UserId != reviewerUserId)
                && !excludedTrials.Contains(e.OrganizationId)
                && (!isDemo || _context.Organizations.Any(o => o.Id == e.OrganizationId && o.Code.StartsWith(DemoOrgPrefix))));
        }

        if (_currentUser.IsDepartmentManager && !_currentUser.IsAdmin)
        {
            throw new ForbiddenException("Tài khoản không có quyền chấm bài.");
        }

        var trialOrganizations = openTrials.Select(t => t.OrganizationId);
        return _scope.VisibleEmployees()
            .Where(e => (e.UserId == null || e.UserId != reviewerUserId) && !trialOrganizations.Contains(e.OrganizationId));
    }

    public IQueryable<DigiTalent.Domain.Entities.Organization> ReviewableOrganizations()
    {
        var reviewerUserId = ReviewerUserId;
        var openTrials = _context.TrialWorkspaces.Where(t => t.ConvertedAt == null);
        if (_currentUser.Roles.Contains(Roles.Mentor))
        {
            var isDemo = IsDemoReviewer();
            var excludedTrials = openTrials
                .Where(t => t.MentorUserId == null || t.MentorUserId != reviewerUserId)
                .Select(t => t.OrganizationId);
            return _context.Organizations.Where(o =>
                o.Status == Statuses.Simple.Active
                && !excludedTrials.Contains(o.Id)
                && (!isDemo || o.Code.StartsWith(DemoOrgPrefix)));
        }

        var trialOrganizations = openTrials.Select(t => t.OrganizationId);
        var organizationId = _currentUser.OrganizationId;
        return _context.Organizations.Where(o =>
            organizationId != null
            && o.Id == organizationId.Value
            && o.Status == Statuses.Simple.Active
            && !trialOrganizations.Contains(o.Id));
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
