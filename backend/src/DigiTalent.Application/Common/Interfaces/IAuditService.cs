namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Ghi nhật ký các thao tác nhạy cảm (Security & Compliance Audit Logging):
/// cấp/thu hồi chứng chỉ, ghi nhận bằng chứng năng lực, chỉnh sửa ma trận phân quyền, v.v.
/// </summary>
public interface IAuditService
{
    Task LogAsync(string action, string entityType, Guid? entityId = null, object? oldValues = null, object? newValues = null, string? entityLabel = null, CancellationToken cancellationToken = default);
}
