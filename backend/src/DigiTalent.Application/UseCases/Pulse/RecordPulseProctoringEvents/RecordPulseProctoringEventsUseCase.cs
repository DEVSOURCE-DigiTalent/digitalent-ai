using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/proctoring/{sessionId}/events — ghi nhật ký giám sát của phiên đang làm: rời tab, rời cửa sổ, ngừng /
/// chia sẻ lại màn hình, mất / bật lại camera hoặc micro. Mỗi sự kiện tính theo ms từ lúc bắt đầu phiên; người chấm tua
/// bản ghi tới đúng chỗ.
/// </summary>
public class RecordPulseProctoringEventsUseCase : IUseCase<RecordPulseProctoringEventsUseCaseInput, RecordPulseProctoringEventsUseCaseOutput>
{
    public const string TooManyEvents = "TOO_MANY_EVENTS";

    private readonly IApplicationDbContext _context;
    private readonly PulseProctoring _proctoring;

    public RecordPulseProctoringEventsUseCase(IApplicationDbContext context, PulseProctoring proctoring)
    {
        _context = context;
        _proctoring = proctoring;
    }

    public async Task<RecordPulseProctoringEventsUseCaseOutput> ExecuteAsync(RecordPulseProctoringEventsUseCaseInput input)
    {
        var session = await _proctoring.LoadOwnOpenAsync(input.SessionId);
        var existing = await _context.ProctoringEvents.CountAsync(e => e.SessionId == session.Id);
        if (existing + input.Events.Count > PulseRules.MaxEventsPerSession)
        {
            throw new BadRequestException("Nhật ký giám sát của phiên đã quá dài. Hãy bắt đầu lại bài làm.", "events", TooManyEvents);
        }

        foreach (var item in input.Events)
        {
            _context.ProctoringEvents.Add(new ProctoringEvent
            {
                SessionId = session.Id,
                Kind = item.Kind,
                OffsetMs = item.OffsetMs,
                DurationMs = item.DurationMs,
                Detail = string.IsNullOrWhiteSpace(item.Detail) ? null : item.Detail.Trim(),
                OccurredAt = session.StartedAt.AddMilliseconds(item.OffsetMs),
            });
        }

        await _context.SaveChangesAsync();
        return new RecordPulseProctoringEventsUseCaseOutput { Recorded = input.Events.Count, Total = existing + input.Events.Count };
    }
}
