using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Viết gợi ý của một báo cáo đang chờ (chạy trong dịch vụ nền): số liệu ẩn danh → AI → rào chắn → lưu. AI lỗi → câu mẫu
/// (FALLBACK); báo cáo không bao giờ thiếu nội dung.
/// </summary>
public class TrialInsightWriter
{
    private readonly IApplicationDbContext _context;
    private readonly TrialReportBuilder _builder;
    private readonly IGeminiService _ai;
    private readonly TimeProvider _clock;
    private readonly ILogger<TrialInsightWriter> _logger;

    public TrialInsightWriter(
        IApplicationDbContext context, TrialReportBuilder builder, IGeminiService ai, TimeProvider clock, ILogger<TrialInsightWriter> logger)
    {
        _context = context;
        _builder = builder;
        _ai = ai;
        _clock = clock;
        _logger = logger;
    }

    /// <summary>Báo cáo còn chờ AI (để quét lại sau khi khởi động).</summary>
    public Task<List<Guid>> PendingAsync(CancellationToken cancellationToken) =>
        _context.TrialReports.AsNoTracking()
            .Where(r => r.AiStatus == Statuses.TrialReportAi.Pending)
            .OrderBy(r => r.GeneratedAt)
            .Select(r => r.Id)
            .ToListAsync(cancellationToken);

    public async Task WriteAsync(Guid reportId, CancellationToken cancellationToken)
    {
        var report = await _context.TrialReports.FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken);
        if (report is not { AiStatus: Statuses.TrialReportAi.Pending })
        {
            return;
        }

        var facts = (await _builder.BuildAsync(report.OrganizationId)).Facts;
        var draft = facts.Assessed > 0 && _ai.IsConfigured ? await _ai.DraftTrialInsightsAsync(facts, cancellationToken) : null;

        if (draft == null)
        {
            report.Insights = TrialInsightTemplate.Build(facts).ToJson();
            report.AiStatus = Statuses.TrialReportAi.Fallback;
            report.AiModel = null;
            report.AiReplaced = 0;
        }
        else
        {
            var (insights, rejected) = TrialInsightGuard.Apply(draft, facts);
            report.Insights = insights.ToJson();
            report.AiStatus = Statuses.TrialReportAi.Done;
            report.AiModel = string.IsNullOrWhiteSpace(draft.Model) ? "gemini" : draft.Model;
            report.AiReplaced = (short)rejected.Count;
            foreach (var item in rejected)
            {
                // Câu AI chỉ chứa số liệu ẩn danh của doanh nghiệp — ghi lại để đo hiệu quả (checklist §7 ai_validator_replaced).
                _logger.LogInformation("Trial insights {ReportId}: {Field} M{Domain} replaced ({Rule}): {Text}", report.Id, item.Field, item.Domain, item.Rule, item.Text);
            }
        }

        report.AssessedCount = (short)facts.Assessed;
        report.AiCompletedAt = _clock.GetUtcNow();
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Báo cáo vừa được đặt lại (bài nộp muộn / "Tạo lại") — lần chạy sau sẽ viết theo số liệu mới.
            _logger.LogInformation("Trial insights {ReportId} changed while writing; skipped.", report.Id);
        }
    }
}
