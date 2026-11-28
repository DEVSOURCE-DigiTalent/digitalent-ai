using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// Phân tích một báo cáo hành vi đang chờ (PENDING): tính lại phần tổng hợp từ nhật ký, gửi nhật ký đã đánh số cho AI và lưu
/// các phát hiện đã đối chiếu với sự kiện thật. Chạy ngoài request (hàng đợi nền) nên không dùng người dùng hiện tại.
/// AI chưa cấu hình → FAILED AI_NOT_CONFIGURED ngay; AI lỗi tạm thời → còn PENDING để thử lại, quá
/// <see cref="MaxAutoAttempts"/> lần thì FAILED. Không có kết quả giả thay cho AI.
/// </summary>
public class ProctoringBehaviorAnalyzer
{
    public const string NotConfigured = "AI_NOT_CONFIGURED";
    public const string Unavailable = "AI_UNAVAILABLE";
    public const string InvalidAnswer = "AI_INVALID_ANSWER";
    public const int MaxAutoAttempts = 3;

    private readonly IApplicationDbContext _context;
    private readonly IGeminiService _gemini;
    private readonly TimeProvider _clock;
    private readonly ILogger<ProctoringBehaviorAnalyzer> _logger;

    public ProctoringBehaviorAnalyzer(
        IApplicationDbContext context,
        IGeminiService gemini,
        TimeProvider clock,
        ILogger<ProctoringBehaviorAnalyzer>? logger = null)
    {
        _context = context;
        _gemini = gemini;
        _clock = clock;
        _logger = logger ?? NullLogger<ProctoringBehaviorAnalyzer>.Instance;
    }

    /// <returns>false khi không có báo cáo đang chờ với id này.</returns>
    public async Task<bool> AnalyzeAsync(Guid reportId, CancellationToken cancellationToken = default)
    {
        var report = await _context.ProctoringBehaviorReports.FirstOrDefaultAsync(r => r.Id == reportId, cancellationToken);
        if (report == null || report.Status != Statuses.BehaviorReport.Pending)
        {
            return false;
        }

        var session = await _context.ProctoringSessions.AsNoTracking().FirstAsync(s => s.Id == report.SessionId, cancellationToken);
        var events = (await BehaviorReportStore.EventsAsync(_context, new[] { session.Id })).GetValueOrDefault(session.Id) ?? new();
        var submission = report.FinalSubmissionId is { } submissionId
            ? await _context.CourseFinalSubmissions.AsNoTracking().FirstOrDefaultAsync(s => s.Id == submissionId, cancellationToken)
            : null;
        var course = report.CourseId is { } courseId
            ? await _context.Courses.AsNoTracking().Where(c => c.Id == courseId).Select(c => new { c.Title }).FirstOrDefaultAsync(cancellationToken)
            : null;
        var (domainName, tier) = await CourseContextAsync(report.CourseId, cancellationToken);

        var duration = BehaviorReportComposer.DurationOf(session, events);
        var stats = BehaviorReportComposer.Stats(
            events,
            submission?.AttemptNo ?? 1,
            submission?.EvidenceText.Length ?? 0,
            submission?.ChoiceScore,
            submission?.ChoiceTotal);
        var details = BehaviorReportComposer.Compose(events, duration, stats);
        var previous = BehaviorReportComposer.Deserialize(report.Details);
        report.RiskScore = (short)details.Risk.Score;
        report.RiskLevel = details.Risk.Level;

        if (!_gemini.IsConfigured)
        {
            Fail(report, details, previous, NotConfigured);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        var (aiEvents, truncated) = BehaviorReportComposer.AiEvents(events);
        var input = new BehaviorAiInput(
            course?.Title ?? "Bài cuối khóa",
            domainName,
            tier,
            stats.AttemptNo,
            duration,
            stats.EssayChars,
            stats.ChoiceScore,
            stats.ChoiceTotal,
            details.Risk.FaceCheck,
            details.Risk.Score,
            details.Risk.Level,
            aiEvents,
            truncated);
        report.AttemptCount++;

        BehaviorAiResult? result;
        try
        {
            result = await _gemini.AnalyzeExamBehaviorAsync(input, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(ex, "Behavior analysis of report {ReportId} failed.", report.Id);
            result = null;
        }

        var level = BehaviorReportComposer.NormalizeLevel(result?.Level);
        if (result == null || level == null)
        {
            var code = result == null ? Unavailable : InvalidAnswer;
            if (code == Unavailable && report.AttemptCount < MaxAutoAttempts)
            {
                // Lỗi tạm thời (quá tải, mạng): còn PENDING, lần quét sau thử lại.
                report.ErrorCode = code;
                report.Details = BehaviorReportComposer.Serialize(Keep(details, previous));
            }
            else
            {
                Fail(report, details, previous, code);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        details.Findings = BehaviorReportComposer.Findings(result, aiEvents);
        details.Advice = string.IsNullOrWhiteSpace(result.Advice) ? null : BehaviorReportComposer.Clip(result.Advice, BehaviorReportComposer.MaxAdviceChars);
        details.EventsTruncated = truncated;
        report.Status = Statuses.BehaviorReport.Ready;
        report.AiLevel = level;
        report.Summary = BehaviorReportComposer.Clip(result.Summary, BehaviorReportComposer.MaxSummaryChars);
        report.Details = BehaviorReportComposer.Serialize(details);
        report.Model = BehaviorReportComposer.Clip(result.Model, 100);
        report.InputHash = BehaviorReportComposer.InputHash(input);
        report.AnalyzedAt = _clock.GetUtcNow();
        report.ErrorCode = null;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <summary>
    /// AI không phân tích được. Báo cáo đã có kết quả AI từ trước (đang phân tích lại) thì giữ kết quả cũ (READY) kèm mã lỗi;
    /// chưa có thì FAILED — phần tổng hợp từ nhật ký vẫn được lưu.
    /// </summary>
    private static void Fail(ProctoringBehaviorReport report, BehaviorReportDetails details, BehaviorReportDetails previous, string code)
    {
        report.ErrorCode = code;
        report.Details = BehaviorReportComposer.Serialize(Keep(details, previous));
        report.Status = report.AnalyzedAt != null && report.AiLevel != null
            ? Statuses.BehaviorReport.Ready
            : Statuses.BehaviorReport.Failed;
    }

    /// <summary>Phần mới tính từ nhật ký + phát hiện và lời khuyên của lần AI phân tích trước (nếu có).</summary>
    private static BehaviorReportDetails Keep(BehaviorReportDetails details, BehaviorReportDetails previous)
    {
        details.Findings = previous.Findings;
        details.Advice = previous.Advice;
        details.EventsTruncated = previous.EventsTruncated;
        return details;
    }

    /// <summary>Lĩnh vực (nhóm năng lực có nhiều năng lực của khóa nhất) và cấp của khóa.</summary>
    private async Task<(string? DomainName, int? Tier)> CourseContextAsync(Guid? courseId, CancellationToken cancellationToken)
    {
        if (courseId == null)
        {
            return (null, null);
        }

        var teaching = await (
                from link in _context.CourseCompetencies.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on link.CompetencyId equals competency.Id
                join category in _context.CompetencyCategories.AsNoTracking() on competency.CategoryId equals category.Id
                where link.CourseId == courseId
                select new { category.Id, category.Name, link.TargetLevel })
            .ToListAsync(cancellationToken);
        if (teaching.Count == 0)
        {
            return (null, null);
        }

        var domain = teaching.GroupBy(t => new { t.Id, t.Name }).OrderByDescending(g => g.Count()).ThenBy(g => g.Key.Id).First().Key.Name;
        return (PulseLearnerReader.DisplayName(domain), Math.Clamp((int)teaching.Max(t => t.TargetLevel), 1, PulseRules.MaxLevel));
    }
}
