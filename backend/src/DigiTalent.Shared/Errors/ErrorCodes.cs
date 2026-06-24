namespace DigiTalent.Shared.Errors;

public static class ErrorCodes
{
    // Auth
    public const string InvalidCredentials = "AUTH_INVALID_CREDENTIALS";
    public const string AccountLocked = "AUTH_ACCOUNT_LOCKED";
    public const string TokenExpired = "AUTH_TOKEN_EXPIRED";
    public const string InvalidToken = "AUTH_INVALID_TOKEN";
    public const string RefreshTokenRevoked = "AUTH_REFRESH_TOKEN_REVOKED";

    // Validation
    public const string Required = "VALIDATION_REQUIRED";
    public const string InvalidFormat = "VALIDATION_INVALID_FORMAT";
    public const string MaxLength = "VALIDATION_MAX_LENGTH";
    public const string Duplicate = "VALIDATION_DUPLICATE";

    // Business
    public const string NotFound = "BUSINESS_NOT_FOUND";
    public const string Conflict = "BUSINESS_CONFLICT";
    public const string Forbidden = "BUSINESS_FORBIDDEN";
    public const string InvalidState = "BUSINESS_INVALID_STATE";
    public const string CertificateRevoked = "CERTIFICATE_REVOKED";
    public const string AttemptLimitExceeded = "ATTEMPT_LIMIT_EXCEEDED";
}
