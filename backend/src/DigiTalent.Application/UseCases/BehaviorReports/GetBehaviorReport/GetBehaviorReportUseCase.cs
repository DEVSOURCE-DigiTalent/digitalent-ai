using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.BehaviorReports;

/// <summary>
/// GET /behavior-reports/{reportId} — một báo cáo hành vi (mở trong bảng nhân viên của OW-21): kết luận và các phát hiện của AI kèm sự kiện làm bằng
/// chứng, phần tổng hợp từ nhật ký, số liệu của bài, bài tự luận đã nộp và bản ghi màn hình / camera (link đã ký) cùng
/// toàn bộ nhật ký giám sát để xem lại. Ngoài phạm vi → 404.
/// </summary>
public class GetBehaviorReportUseCase : IUseCase<GetBehaviorReportUseCaseInput, BehaviorReportDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly BehaviorReportReader _reader;
    private readonly PulseRecordingReader _recordings;

    public GetBehaviorReportUseCase(IApplicationDbContext context, BehaviorReportReader reader, PulseRecordingReader recordings)
    {
        _context = context;
        _reader = reader;
        _recordings = recordings;
    }

    public async Task<BehaviorReportDetailDto> ExecuteAsync(GetBehaviorReportUseCaseInput input)
    {
        var row = await _reader.Query().FirstOrDefaultAsync(x => x.Report.Id == input.ReportId)
                  ?? throw new NotFoundException("Không tìm thấy báo cáo hành vi.");
        var report = row.Report;
        var details = BehaviorReportComposer.Deserialize(report.Details);
        var essay = report.FinalSubmissionId is { } submissionId
            ? await _context.CourseFinalSubmissions.AsNoTracking()
                .Where(s => s.Id == submissionId)
                .Select(s => s.EvidenceText)
                .FirstOrDefaultAsync()
            : null;
        var recording = (await _recordings.LoadAsync(new[] { report.SessionId })).GetValueOrDefault(report.SessionId);

        var dto = BehaviorReportReader.Fill(new BehaviorReportDetailDto(), row, details, await _reader.CourseDomainsAsync());
        dto.Stats = details.Stats;
        dto.Risk = details.Risk;
        dto.Findings = details.Findings;
        dto.Advice = details.Advice;
        dto.EventsTruncated = details.EventsTruncated;
        dto.Model = report.Model;
        dto.AnalyzedAt = report.AnalyzedAt;
        dto.ErrorCode = report.ErrorCode;
        dto.EssayText = essay;
        dto.Recording = recording;
        return dto;
    }
}
