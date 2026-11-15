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
    private readonly IChunkedFileFinalizer? _finalizer;

    public EndPulseRecordingUseCase(IApplicationDbContext context, PulseProctoring proctoring, IChunkedFileFinalizer? finalizer = null)
    {
        _context = context;
        _proctoring = proctoring;
        _finalizer = finalizer;
    }

    public async Task<EndPulseRecordingUseCaseOutput> ExecuteAsync(EndPulseRecordingUseCaseInput input)
    {
        var session = await _proctoring.LoadOwnOpenAsync(input.SessionId);
        var recording = await _context.ProctoringRecordings.FirstOrDefaultAsync(r => r.Id == input.RecordingId && r.SessionId == session.Id)
                        ?? throw new NotFoundException("Không tìm thấy đoạn ghi của phiên làm bài.");
        recording.EndOffsetMs = Math.Max(recording.StartOffsetMs, input.EndOffsetMs);
        if (_finalizer != null && !string.IsNullOrWhiteSpace(recording.StoragePath) && recording.SizeBytes > 0)
        {
            await _finalizer.FinalizeAsync(recording.StoragePath, recording.ContentType);
        }
        await _context.SaveChangesAsync();

        return new EndPulseRecordingUseCaseOutput
        {
            RecordingId = recording.Id,
            StartOffsetMs = recording.StartOffsetMs,
            EndOffsetMs = recording.EndOffsetMs.Value,
        };
    }
}
