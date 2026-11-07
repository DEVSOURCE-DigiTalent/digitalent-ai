using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Đóng bài đánh giá dùng thử và tạo báo cáo: khi hết hạn hoặc mọi người đã nộp (kiểm tra lúc đọc, như hạn dùng thử cá nhân),
/// hoặc khi chủ doanh nghiệp bấm "Xem kết quả ngay". Báo cáo hiện ngay bằng số liệu và câu mẫu; gợi ý AI viết nền rồi thay vào.
/// </summary>
public class TrialCloser
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly IGeminiService _ai;
    private readonly ITrialInsightQueue _queue;

    public TrialCloser(IApplicationDbContext context, TrialProgramReader reader, IGeminiService ai, ITrialInsightQueue queue)
    {
        _context = context;
        _reader = reader;
        _ai = ai;
        _queue = queue;
    }

    /// <summary>Đóng nếu đã hết hạn hoặc mọi người đã nộp (cần ít nhất một bài). true = vừa đóng.</summary>
    public async Task<bool> CloseIfDueAsync(TrialWorkspace trial)
    {
        if (trial.ReportPublishedAt != null || trial.TestDeadline is not { } deadline)
        {
            return false;
        }

        var participants = await _reader.LoadParticipantsAsync(trial);
        var submitted = participants.Count(p => p.Status == TrialProgramRules.ParticipantSubmitted);
        var everyone = participants.Count > 0 && submitted == participants.Count;
        if (submitted == 0 || (_reader.Now < deadline && !everyone))
        {
            return false;
        }

        await CloseAsync(trial, submitted);
        return true;
    }

    /// <summary>Đóng bài ngay (người gọi đã kiểm tra quyền và số bài). Bài chưa nộp không vào được nữa.</summary>
    public async Task CloseAsync(TrialWorkspace trial, int submitted)
    {
        var now = _reader.Now;
        trial.ReportPublishedAt = now;
        trial.Revision++;

        var report = await _context.TrialReports.FirstOrDefaultAsync(r => r.OrganizationId == trial.OrganizationId);
        if (report == null)
        {
            report = new TrialReport { OrganizationId = trial.OrganizationId };
            _context.TrialReports.Add(report);
        }

        report.GeneratedAt = now;
        Reset(report, (short)submitted, now);

        var participants = await _context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == trial.OrganizationId && e.UserId != null && e.UserId != trial.OwnerUserId)
            .Select(e => e.UserId!.Value)
            .ToListAsync();
        _reader.Notify(new[] { trial.OwnerUserId }, TrialProgramRules.NotificationReported, "Đã có báo cáo năng lực",
            $"Báo cáo từ {submitted} bài đánh giá. Xem ở trang Đánh giá đội ngũ.", trial.OrganizationId);
        _reader.Notify(participants, TrialProgramRules.NotificationReported, "Đã có kết quả đánh giá",
            "Xem mức năng lực của bạn và bắt đầu học thử các khóa Cơ bản.", trial.OrganizationId);

        await _context.SaveChangesAsync();
        EnqueueIfPending(report);
    }

    /// <summary>
    /// Viết lại gợi ý (bài nộp muộn từ phiên mở trước khi đóng, hoặc quản trị nền tảng bấm "Tạo lại"). Không có báo cáo → bỏ qua.
    /// </summary>
    public async Task RefreshInsightsAsync(Guid organizationId)
    {
        var report = await _context.TrialReports.FirstOrDefaultAsync(r => r.OrganizationId == organizationId);
        if (report == null)
        {
            return;
        }

        var submitted = await _context.TrialAssessments.CountAsync(a => a.OrganizationId == organizationId);
        Reset(report, (short)submitted, _reader.Now);
        await _context.SaveChangesAsync();
        EnqueueIfPending(report);
    }

    /// <summary>Gợi ý về câu mẫu (tính lúc đọc); có khóa AI thì chờ AI viết, không có thì dừng ở câu mẫu.</summary>
    private void Reset(TrialReport report, short assessed, DateTimeOffset now)
    {
        var withAi = _ai.IsConfigured;
        report.AssessedCount = assessed;
        report.Insights = new TrialInsightsDto().ToJson();
        report.AiStatus = withAi ? Statuses.TrialReportAi.Pending : Statuses.TrialReportAi.Fallback;
        report.AiModel = null;
        report.AiReplaced = 0;
        report.AiCompletedAt = withAi ? null : now;
    }

    private void EnqueueIfPending(TrialReport report)
    {
        if (report.AiStatus == Statuses.TrialReportAi.Pending)
        {
            _queue.Enqueue(report.Id);
        }
    }
}
