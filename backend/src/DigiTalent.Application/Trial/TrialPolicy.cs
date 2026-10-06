using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.Trial;

public sealed record TrialOptions
{
    public int DurationDays { get; init; } = 14;
    public int MaxAccounts { get; init; } = 5;
    public int MaxDiagnosticAttempts { get; init; } = 1;
    public int VerificationHours { get; init; } = 24;
    public int InvitationHours { get; init; } = 72;
    public int MaxInvitationSends { get; init; } = 3;
    public int ResendCooldownSeconds { get; init; } = 60;
    public string PolicyVersion { get; init; } = "enterprise-trial-v1";
    public bool PolicyApproved { get; init; }
    public string? DataPolicyNotice { get; init; }
    public bool EnableDevelopmentCapture { get; init; }
    public bool EnableDevelopmentBundle { get; init; }
    public string PublicAppUrl { get; init; } = "http://localhost:5173";
    public bool DevelopmentEnvironment { get; init; }

    public void Validate()
    {
        if (DurationDays is < 1 or > 90 || MaxAccounts is < 2 or > 100 || MaxDiagnosticAttempts != 1 ||
            VerificationHours is < 1 or > 168 || InvitationHours is < 1 or > 168 || MaxInvitationSends is < 1 or > 10 ||
            ResendCooldownSeconds is < 1 or > 86400 || string.IsNullOrWhiteSpace(PolicyVersion) ||
            !Uri.TryCreate(PublicAppUrl, UriKind.Absolute, out var uri) || uri.Scheme is not ("https" or "http"))
            throw new InvalidOperationException("Invalid enterprise trial policy configuration.");
    }
}

public static class TrialPolicy
{
    public static void EnsureWritable(TrialWorkspace? trial, DateTimeOffset now)
    {
        if (trial == null) throw new ForbiddenException("No enterprise trial is linked to this account.");
        if (trial.ConvertedAt == null && now >= trial.EndsAt)
            throw new ForbiddenException("The trial has ended. Your data remains available in read-only mode.");
    }
    public static void EnsureSeat(int activeAccounts, int pendingSeats, int limit)
    {
        if (activeAccounts + pendingSeats >= limit) throw new ConflictException("The trial account limit includes the owner and pending invitations.");
    }
}
