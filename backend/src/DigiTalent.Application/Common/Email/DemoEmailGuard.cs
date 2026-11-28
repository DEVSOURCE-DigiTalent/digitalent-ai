namespace DigiTalent.Application.Common.Email;

/// <summary>
/// Chặn gửi email / thông báo SMTP ra ngoài đối với địa chỉ thuộc domain demo (@demo.nanglucso.pro.vn).
/// </summary>
public static class DemoEmailGuard
{
    public const string DemoDomainSuffix = "@demo.nanglucso.pro.vn";

    public static bool IsDemoAddress(string? email) =>
        !string.IsNullOrWhiteSpace(email) &&
        email.Trim().EndsWith(DemoDomainSuffix, StringComparison.OrdinalIgnoreCase);
}
