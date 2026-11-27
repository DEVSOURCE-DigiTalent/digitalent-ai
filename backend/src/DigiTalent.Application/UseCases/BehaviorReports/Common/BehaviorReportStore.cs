using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// Lập báo cáo hành vi (status PENDING) cho bài cuối khóa đã nộp: phần tổng hợp từ nhật ký được lưu ngay, AI phân tích sau.
/// </summary>
public static class BehaviorReportStore
{
    /// <summary>Số bài cũ lập báo cáo bù tối đa mỗi lần mở danh sách.</summary>
    public const int BackfillBatch = 200;

    /// <summary>
    /// Thêm (chưa lưu) báo cáo của một lần nộp bài cuối khóa. Gọi trong cùng lần lưu với bài nộp; nhật ký đã gửi đủ trước
    /// khi nộp nên phần tổng hợp không đổi về sau.
    /// </summary>
    public static async Task<ProctoringBehaviorReport> AddForFinalAsync(
        IApplicationDbContext context,
        Guid organizationId,
        Guid employeeId,
        Guid courseId,
        ProctoringSession session,
        CourseFinalSubmission submission)
    {
        var events = await EventsAsync(context, new[] { session.Id });
        var report = Create(organizationId, employeeId, courseId, session, submission, events.GetValueOrDefault(session.Id) ?? new());
        context.ProctoringBehaviorReports.Add(report);
        return report;
    }

    /// <summary>
    /// Lập báo cáo bù cho các bài cuối khóa đã nộp của doanh nghiệp mà chưa có báo cáo (nộp trước khi có tính năng này).
    /// Trả về id các báo cáo mới để đưa vào hàng đợi phân tích.
    /// </summary>
    public static async Task<List<Guid>> EnsureForOrganizationAsync(IApplicationDbContext context, Guid organizationId)
    {
        var missing = await (
                from submission in context.CourseFinalSubmissions.AsNoTracking()
                join enrollment in context.Enrollments.AsNoTracking() on submission.EnrollmentId equals enrollment.Id
                join employee in context.Employees.AsNoTracking() on enrollment.EmployeeId equals employee.Id
                join session in context.ProctoringSessions.AsNoTracking() on submission.ProctoringSessionId equals (Guid?)session.Id
                where employee.OrganizationId == organizationId
                      && session.Status == Statuses.ProctoringSession.Submitted
                      && !context.ProctoringBehaviorReports.Any(r => r.SessionId == session.Id)
                orderby submission.SubmittedAt descending
                select new { Submission = submission, Session = session, EmployeeId = employee.Id, enrollment.CourseId })
            .Take(BackfillBatch)
            .ToListAsync();
        if (missing.Count == 0)
        {
            return new List<Guid>();
        }

        var events = await EventsAsync(context, missing.Select(m => m.Session.Id).ToList());
        var reports = missing
            .Select(m => Create(organizationId, m.EmployeeId, m.CourseId, m.Session, m.Submission, events.GetValueOrDefault(m.Session.Id) ?? new()))
            .ToList();
        context.ProctoringBehaviorReports.AddRange(reports);
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Hai người mở danh sách cùng lúc: uq_proctoring_behavior_reports_session giữ một báo cáo mỗi phiên.
            return new List<Guid>();
        }

        return reports.Select(r => r.Id).ToList();
    }

    public static ProctoringBehaviorReport Create(
        Guid organizationId,
        Guid employeeId,
        Guid courseId,
        ProctoringSession session,
        CourseFinalSubmission submission,
        IReadOnlyList<PulseProctoringEventDto> events)
    {
        var duration = BehaviorReportComposer.DurationOf(session, events);
        var stats = BehaviorReportComposer.Stats(
            events, submission.AttemptNo, submission.EvidenceText.Length, submission.ChoiceScore, submission.ChoiceTotal);
        var details = BehaviorReportComposer.Compose(events, duration, stats);
        return new ProctoringBehaviorReport
        {
            OrganizationId = organizationId,
            SessionId = session.Id,
            EmployeeId = employeeId,
            CourseId = courseId,
            FinalSubmissionId = submission.Id,
            Status = Statuses.BehaviorReport.Pending,
            RiskScore = (short)details.Risk.Score,
            RiskLevel = details.Risk.Level,
            Details = BehaviorReportComposer.Serialize(details),
        };
    }

    /// <summary>Nhật ký của các phiên, theo thời gian.</summary>
    public static async Task<Dictionary<Guid, List<PulseProctoringEventDto>>> EventsAsync(IApplicationDbContext context, IReadOnlyCollection<Guid> sessionIds)
    {
        var rows = await context.ProctoringEvents.AsNoTracking()
            .Where(e => sessionIds.Contains(e.SessionId))
            .OrderBy(e => e.OffsetMs).ThenBy(e => e.CreatedAt)
            .ToListAsync();
        return rows
            .GroupBy(e => e.SessionId)
            .ToDictionary(g => g.Key, g => g.Select(BehaviorReportComposer.ToDto).ToList());
    }
}
