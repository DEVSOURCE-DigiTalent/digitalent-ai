using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/proctoring/{sessionId}/recordings/{recordingId}/end — khép một đoạn ghi tại vị trí kết thúc (nguồn
/// ngừng: dừng chia sẻ màn hình, mất camera…). Đoạn còn mở khi nộp bài được khép tự động.
/// </summary>
public class EndPulseRecordingUseCase : IUseCase<EndPulseRecordingUseCaseInput, EndPulseRecordingUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseProctoring _proctoring;

    public EndPulseRecordingUseCase(IApplicationDbContext context, PulseProctoring proctoring)
    {
        _context = context;
        _proctoring = proctoring;
    }

    public async Task<EndPulseRecordingUseCaseOutput> ExecuteAsync(EndPulseRecordingUseCaseInput input)
    {
        var session = await _proctoring.LoadOwnOpenAsync(input.SessionId);
        var recording = await _context.ProctoringRecordings.FirstOrDefaultAsync(r => r.Id == input.RecordingId && r.SessionId == session.Id)
                        ?? throw new NotFoundException("Không tìm thấy đoạn ghi của phiên làm bài.");
        recording.EndOffsetMs = Math.Max(recording.StartOffsetMs, input.EndOffsetMs);
        await _context.SaveChangesAsync();

        return new EndPulseRecordingUseCaseOutput
        {
            RecordingId = recording.Id,
            StartOffsetMs = recording.StartOffsetMs,
            EndOffsetMs = recording.EndOffsetMs.Value,
        };
    }
}
