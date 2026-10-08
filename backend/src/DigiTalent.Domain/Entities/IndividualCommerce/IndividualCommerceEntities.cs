using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public static class IndividualRegistrationIntents
{
    public const string Trial = "TRIAL";
    public const string Purchase = "PURCHASE";
}

public static class IndividualRegistrationStates
{
    public const string Pending = "PENDING";
    public const string Verified = "VERIFIED";
    public const string Expired = "EXPIRED";
    public const string Cancelled = "CANCELLED";
}

public static class UserSubscriptionStatuses
{
    public const string Trialing = "TRIALING";
    public const string Active = "ACTIVE";
    public const string TrialExpired = "TRIAL_EXPIRED";
    public const string Expired = "EXPIRED";
}

public static class PurchaseDraftStatuses
{
    public const string Draft = "DRAFT";
    public const string PaymentPending = "PAYMENT_PENDING";
    public const string Paid = "PAID";
    public const string Expired = "EXPIRED";
    public const string Cancelled = "CANCELLED";
}

public static class OrderStatuses
{
    public const string Pending = "PENDING";
    public const string Paid = "PAID";
    public const string Failed = "FAILED";
    public const string Expired = "EXPIRED";
    public const string Cancelled = "CANCELLED";
}

public static class EmailOutboxStatuses
{
    public const string Queued = "QUEUED";
    public const string Sent = "SENT";
    public const string Failed = "FAILED";
}

public sealed class IndividualRegistration : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string AccessTokenHash { get; set; } = string.Empty;
    public string Intent { get; set; } = IndividualRegistrationIntents.Trial;
    public string? SelectedPlanCode { get; set; }
    public string? SelectedCycle { get; set; }
    public string? PricingVersion { get; set; }
    public string? PositionCode { get; set; }
    public string? TryOrientationJson { get; set; }
    public string Source { get; set; } = "landing";
    public DateTimeOffset AcceptedTermsAt { get; set; }
    public string State { get; set; } = IndividualRegistrationStates.Pending;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
}

public sealed class IndividualEmailVerificationChallenge : BaseEntity
{
    public Guid RegistrationId { get; set; }
    public IndividualRegistration? Registration { get; set; }
    public string CodeHash { get; set; } = string.Empty;
    public string MagicTokenHash { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public DateTimeOffset SentAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public DateTimeOffset? InvalidatedAt { get; set; }
}

public sealed class IndividualTrialRedemption : BaseEntity
{
    public string NormalizedEmailHmac { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid? RegistrationId { get; set; }
    public DateTimeOffset RedeemedAt { get; set; }
}

public sealed class UserSubscription : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string PlanCode { get; set; } = string.Empty; // IND_PLUS, IND_PRO
    public string Status { get; set; } = UserSubscriptionStatuses.Trialing;
    public string? BillingCycle { get; set; } // MONTH, YEAR
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CurrentPeriodStart { get; set; }
    public DateTimeOffset? CurrentPeriodEnd { get; set; }
    public DateTimeOffset? TrialStartedAt { get; set; }
    public DateTimeOffset? TrialEndsAt { get; set; }
    public int TrialCourseLimit { get; set; } = 3;
    public string RenewalMode { get; set; } = "MANUAL";
    public bool AutoRenew { get; set; }
    public bool CancelAtPeriodEnd { get; set; }
}

public sealed class PurchaseDraft : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string PlanCode { get; set; } = string.Empty;
    public string Cycle { get; set; } = "MONTH"; // MONTH, YEAR
    public long Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public string PricingVersion { get; set; } = string.Empty;
    public string Status { get; set; } = PurchaseDraftStatuses.Draft;
    public DateTimeOffset ExpiresAt { get; set; }
}

public sealed class Order : BaseEntity
{
    public long OrderCode { get; set; } // PayOS integer orderCode
    public string PublicCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid PurchaseDraftId { get; set; }
    public PurchaseDraft? PurchaseDraft { get; set; }
    public long Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public string Status { get; set; } = OrderStatuses.Pending;
    public string PaymentMethod { get; set; } = "BANK_QR";
    public string? PayosPaymentLinkId { get; set; }
    public string? PayosCheckoutUrl { get; set; }
    public string? PayosQrCode { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
}

public sealed class PaymentEvent : BaseEntity
{
    public string Provider { get; set; } = "payos";
    public string? ProviderEventId { get; set; }
    public long OrderCode { get; set; }
    public long Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public string RawPayload { get; set; } = string.Empty;
    public bool SignatureValid { get; set; }
    public string ProcessingStatus { get; set; } = string.Empty;
    public DateTimeOffset ProcessedAt { get; set; }
}

public sealed class EmailOutboxItem : BaseEntity
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string Status { get; set; } = EmailOutboxStatuses.Queued;
    public int AttemptCount { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
}
