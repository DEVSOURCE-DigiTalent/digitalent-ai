using DigiTalent.Domain.Common;

namespace DigiTalent.Application.Common.Events;

/// <summary>
/// Xử lý một loại domain event. Nhận cả lô event cùng loại phát ra trong một lần SaveChanges.
/// Handler chỉ THÊM/SỬA dữ liệu vào DbContext — KHÔNG gọi SaveChangesAsync (DbContext tự lưu trong cùng transaction).
/// Tác vụ ra ngoài hệ thống (SignalR, email) phải đưa vào IAfterCommitQueue.
/// Đăng ký tự động (Scrutor) — không cần sửa DependencyInjection.
/// </summary>
public interface IDomainEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task HandleAsync(IReadOnlyList<TEvent> events, CancellationToken cancellationToken);
}

/// <summary>Gọi các handler tương ứng với từng loại event (Infrastructure cài đặt).</summary>
public interface IDomainEventDispatcher
{
    Task DispatchAsync(IReadOnlyList<IDomainEvent> events, CancellationToken cancellationToken);
}

/// <summary>
/// Tác vụ chỉ chạy SAU khi transaction commit thành công (VD: push SignalR).
/// Lỗi của tác vụ được ghi log, không làm request thất bại.
/// </summary>
public interface IAfterCommitQueue
{
    void Enqueue(string description, Func<CancellationToken, Task> action);
}
