using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Bảng proctoring_recordings (canonical v3.3 §20.2). Một đoạn ghi của phiên có giám sát: một lần trình duyệt ghi một
/// nguồn (SCREEN = toàn bộ màn hình, CAMERA = camera kèm âm thanh micro) là một tệp. Các mẩu tải lên được ghép dần vào
/// tệp theo thứ tự (ChunkCount là số mẩu đã nhận, cũng là concurrency token chống ghép trùng).
/// StartOffsetMs / EndOffsetMs đặt đoạn trên dòng thời gian của phiên.
/// </summary>
public class ProctoringRecording : BaseEntity
{
    public Guid SessionId { get; set; }
    public string Track { get; set; } = string.Empty;
    public short SegmentNo { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string? DisplaySurface { get; set; }
    public string? StoragePath { get; set; }
    public long StartOffsetMs { get; set; }
    public long? EndOffsetMs { get; set; }
    public int ChunkCount { get; set; }
    public long SizeBytes { get; set; }
}
