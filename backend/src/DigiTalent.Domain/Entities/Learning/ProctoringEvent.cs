using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng proctoring_events (canonical v3.3 §20.3). Một sự kiện giám sát của phiên làm bài: bắt đầu, rời tab, rời cửa
/// sổ, ngừng / chia sẻ lại màn hình, mất / bật lại camera hoặc micro, nộp bài. OffsetMs tính từ lúc bắt đầu phiên.
/// </summary>
public class ProctoringEvent : BaseEntity
{
    public Guid SessionId { get; set; }
    public string Kind { get; set; } = string.Empty;
    public long OffsetMs { get; set; }
    public long? DurationMs { get; set; }
    public string? Detail { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
}
