using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// POST /behavior-reports/{reportId}/analyze — yêu cầu AI phân tích lại (sau khi AI lỗi, chưa cấu hình khóa lúc nộp bài,
/// hoặc muốn một nhận định mới). Báo cáo về PENDING và vào hàng đợi nền; kết quả cũ vẫn hiện tới khi có kết quả mới, AI
/// lỗi thì giữ kết quả cũ.
/// </summary>
public class AnalyzeBehaviorReportUseCase : IUseCase<AnalyzeBehaviorReportUseCaseInput, AnalyzeBehaviorReportUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly BehaviorReportReader _reader;
    private readonly IBehaviorAnalysisQueue _queue;

    public AnalyzeBehaviorReportUseCase(IApplicationDbContext context, BehaviorReportReader reader, IBehaviorAnalysisQueue queue)
    {
        _context = context;
        _reader = reader;
        _queue = queue;
    }

    public async Task<AnalyzeBehaviorReportUseCaseOutput> ExecuteAsync(AnalyzeBehaviorReportUseCaseInput input)
    {
        var visible = await _reader.Query().AnyAsync(x => x.Report.Id == input.ReportId);
        if (!visible)
        {
            throw new NotFoundException("Không tìm thấy báo cáo hành vi.");
        }

        var report = await _context.ProctoringBehaviorReports.FirstAsync(r => r.Id == input.ReportId);
        if (report.Status != Statuses.BehaviorReport.Pending)
        {
            report.Status = Statuses.BehaviorReport.Pending;
            report.AttemptCount = 0;
            report.ErrorCode = null;
            await _context.SaveChangesAsync();
        }

        _queue.Enqueue(report.Id);
        return new AnalyzeBehaviorReportUseCaseOutput { ReportId = report.Id, Status = report.Status };
    }
}
