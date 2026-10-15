using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Common;

/// <summary>
/// Sensitive Platform Admin actions require a specific reason (stored in the audit log).
/// </summary>
public static class PlatformReasonRules
{
    public const int MinLength = 10;
    public const int MaxLength = 1000;

    public static IRuleBuilderOptions<T, string> ValidReason<T>(this IRuleBuilder<T, string> rule) =>
        rule.Must(r => !string.IsNullOrWhiteSpace(r) && r.Trim().Length >= MinLength)
            .WithMessage($"Reason must have at least {MinLength} characters.")
            .MaximumLength(MaxLength);
}
