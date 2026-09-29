using Microsoft.AspNetCore.SignalR;

namespace DigiTalent.Api.Hubs;

/// <summary>
/// SignalR mặc định lấy user id từ claim NameIdentifier, nhưng JWT của hệ thống giữ nguyên tên claim
/// (MapInboundClaims = false) nên user id nằm ở "sub". Không có provider này, Context.UserIdentifier = null
/// → hub không gom kết nối vào group user_{id} → push tới từng người dùng không bao giờ đến.
/// </summary>
public class SubClaimUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection) => connection.User?.FindFirst("sub")?.Value;
}
