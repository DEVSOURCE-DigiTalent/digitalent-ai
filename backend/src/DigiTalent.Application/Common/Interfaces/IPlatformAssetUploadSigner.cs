namespace DigiTalent.Application.Common.Interfaces;

public sealed record PlatformAssetUploadTicketPayload(
    Guid? UserId,
    string StorageKey,
    string FileName,
    string ContentType,
    string Kind,
    long ExpectedSizeBytes,
    long ExpiresAtUnixSeconds);

/// <summary>
/// Tạo và xác thực vé tải tệp trực tiếp lên Object Storage cho Platform Catalog.
/// Ngăn client tự ý khai báo StorageKey giả mạo khi hoàn tất tải lên.
/// </summary>
public interface IPlatformAssetUploadSigner
{
    string Sign(PlatformAssetUploadTicketPayload payload);
    bool TryVerify(string ticket, out PlatformAssetUploadTicketPayload? payload);
}
