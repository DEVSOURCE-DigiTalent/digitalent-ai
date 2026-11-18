using System.Collections.Concurrent;
using System.Net.Mail;

namespace DigiTalent.Infrastructure.Email;

/// <summary>
/// Gửi email qua <see cref="SmtpClient"/> với thời gian chờ có giới hạn.
/// <para>
/// <c>SmtpClient.Timeout</c> chỉ áp dụng cho <c>Send</c> đồng bộ; <c>SendMailAsync</c> có thể chờ mãi khi mạng
/// nhận kết nối TCP nhưng máy chủ không bao giờ trả lời (ví dụ cổng 587 bị chặn), làm treo request đang gửi mail.
/// </para>
/// <para>
/// Khi một máy chủ không phản hồi kịp, các lần gửi tới máy chủ đó trong <see cref="PauseAfterTimeout"/> tiếp theo
/// báo lỗi ngay, để một lượt mời nhiều người không phải chờ từng email một.
/// </para>
/// </summary>
internal static class SmtpSending
{
    public static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(15);
    public static readonly TimeSpan PauseAfterTimeout = TimeSpan.FromMinutes(1);

    private static readonly ConcurrentDictionary<string, DateTimeOffset> UnreachableUntil = new(StringComparer.OrdinalIgnoreCase);

    /// <exception cref="SmtpException">Máy chủ không trả lời trong <paramref name="timeout"/>, hoặc vừa không trả lời gần đây.</exception>
    public static async Task SendWithTimeoutAsync(
        this SmtpClient client,
        MailMessage message,
        CancellationToken cancellationToken = default,
        TimeSpan? timeout = null)
    {
        var limit = timeout ?? DefaultTimeout;
        var server = $"{client.Host}:{client.Port}";
        if (UnreachableUntil.TryGetValue(server, out var until) && until > DateTimeOffset.UtcNow)
        {
            throw new SmtpException($"Máy chủ email {server} vừa không phản hồi; tạm dừng gửi tới {until.ToLocalTime():HH:mm:ss}.");
        }

        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        deadline.CancelAfter(limit);
        try
        {
            // WaitAsync guarantees the caller is released even if the socket ignores the cancellation.
            await client.SendMailAsync(message, deadline.Token).WaitAsync(limit + TimeSpan.FromSeconds(2), cancellationToken);
            UnreachableUntil.TryRemove(server, out _);
        }
        catch (Exception ex) when ((ex is OperationCanceledException or TimeoutException) && !cancellationToken.IsCancellationRequested)
        {
            UnreachableUntil[server] = DateTimeOffset.UtcNow.Add(PauseAfterTimeout);
            throw new SmtpException($"Máy chủ email {server} không phản hồi sau {limit.TotalSeconds:0} giây.", ex);
        }
    }
}
