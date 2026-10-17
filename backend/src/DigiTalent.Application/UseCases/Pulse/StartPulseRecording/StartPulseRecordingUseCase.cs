using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/proctoring/{sessionId}/recordings — mở một đoạn ghi mới của phiên: SCREEN (phải là toàn bộ màn hình)
/// hoặc CAMERA (camera kèm micro). Đoạn trước của cùng nguồn còn mở thì được khép tại vị trí bắt đầu của đoạn mới
/// (ngừng chia sẻ rồi chia sẻ lại).
/// </summary>
public class StartPulseRecordingUseCase : IUseCase<StartPulseRecordingUseCaseInput, StartPulseRecordingUseCaseOutput>
{
    public const string ScreenNotEntire = "SCREEN_NOT_ENTIRE";
    public const string TooManySegments = "TOO_MANY_SEGMENTS";
    public const string EntireScreenSurface = "monitor";

    private readonly IApplicationDbContext _context;
    private readonly PulseProctoring _proctoring;

    public StartPulseRecordingUseCase(IApplicationDbContext context, PulseProctoring proctoring)
    {
        _context = context;
        _proctoring = proctoring;
    }

    public async Task<StartPulseRecordingUseCaseOutput> ExecuteAsync(StartPulseRecordingUseCaseInput input)
    {
        var session = await _proctoring.LoadOwnOpenAsync(input.SessionId);
        var surface = string.IsNullOrWhiteSpace(input.DisplaySurface) ? null : input.DisplaySurface.Trim().ToLowerInvariant();
        if (input.Track == Statuses.ProctoringTrack.Screen && surface != null && surface != EntireScreenSurface)
        {
            throw new BadRequestException("Hãy chia sẻ toàn bộ màn hình, không phải một cửa sổ hay một tab.", "displaySurface", ScreenNotEntire);
        }

        var segments = await _context.ProctoringRecordings
            .Where(r => r.SessionId == session.Id && r.Track == input.Track)
            .ToListAsync();
        if (segments.Count >= PulseRules.MaxRecordingSegments)
        {
            throw new BadRequestException("Phiên làm bài đã bị gián đoạn quá nhiều lần. Hãy bắt đầu lại bài làm.", "track", TooManySegments);
        }

        foreach (var open in segments.Where(r => r.EndOffsetMs == null))
        {
            open.EndOffsetMs = Math.Max(open.StartOffsetMs, input.StartOffsetMs);
        }

        var recording = new ProctoringRecording
        {
            SessionId = session.Id,
            Track = input.Track,
            SegmentNo = (short)(segments.Count + 1),
            ContentType = input.ContentType.Trim(),
            DisplaySurface = input.Track == Statuses.ProctoringTrack.Screen ? surface : null,
            StartOffsetMs = input.StartOffsetMs,
        };
        _context.ProctoringRecordings.Add(recording);
        await _context.SaveChangesAsync();

        return new StartPulseRecordingUseCaseOutput { RecordingId = recording.Id, Track = recording.Track, SegmentNo = recording.SegmentNo };
    }
}
