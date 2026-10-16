namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Link có hạn tới tệp ghi hình bài làm có giám sát. Thẻ &lt;video&gt; không gửi được bearer token, nên trang chấm bài
/// mở tệp bằng link đã ký thay cho kiểm tra quyền; link chỉ được cấp cho người chấm có quyền với bài làm đó.
/// </summary>
public interface IProctoringRecordingUrlSigner
{
    /// <summary>Đường dẫn tương đối với gốc API (api/v1/), ví dụ "pulse/recordings/{id}/content?exp=…&amp;sig=…".</summary>
    string ContentPath(Guid recordingId);

    bool IsValid(Guid recordingId, long expiresAtUnixSeconds, string? signature);
}
