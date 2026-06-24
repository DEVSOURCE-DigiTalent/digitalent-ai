namespace DigiTalent.Shared.Constants;

public static class AppConstants
{
    public const string ApiVersion = "v1";
    public const string ApiBasePath = $"api/{ApiVersion}";
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;
    public const int AccessTokenExpirationMinutes = 15;
    public const int RefreshTokenExpirationDays = 7;
    public const int DefaultCertificateValidityMonths = 12;
    public const int MaxFileSizeBytes = 20 * 1024 * 1024; // 20 MB
}
