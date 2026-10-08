namespace DigiTalent.Application.IndividualCommerce;

public class IndividualCommerceOptions
{
    public const string SectionName = "IndividualCommerce";

    public SmtpOptions Smtp { get; set; } = new();
    public PayOSOptions PayOS { get; set; } = new();
    public SecurityOptions Security { get; set; } = new();
}

public class SmtpOptions
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "DigiTalent AI";
    public bool EnableSsl { get; set; } = true;
}

public class PayOSOptions
{
    public string ClientId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ChecksumKey { get; set; } = string.Empty;
    public string ApiUrl { get; set; } = "https://api-merchant.payos.vn";
    public string ReturnUrl { get; set; } = "http://localhost:5173/payment/success";
    public string CancelUrl { get; set; } = "http://localhost:5173/payment/cancel";
}

public class SecurityOptions
{
    public string EmailVerificationPepper { get; set; } = "DigiTalent-Individual-Email-Pepper-Secure-2026";
    public string OtpPepper { get; set; } = "DigiTalent-Individual-OTP-Pepper-Secure-2026";
    public int OtpExpiresInMinutes { get; set; } = 15;
    public int RegistrationExpiresInHours { get; set; } = 24;
    public int DraftExpiresInHours { get; set; } = 168; // 7 days per spec
    public int OrderExpiresInMinutes { get; set; } = 15;
    public int MaxVerificationAttempts { get; set; } = 5;
    public int ResendCooldownSeconds { get; set; } = 60;
    public int TrialDurationDays { get; set; } = 7;
    public int TrialCourseLimit { get; set; } = 3;
    public int TrialAssessmentLimit { get; set; } = 3;
    public string PublicAppUrl { get; set; } = "http://localhost:5173";
    public bool IsDevelopment { get; set; } = false;
}
