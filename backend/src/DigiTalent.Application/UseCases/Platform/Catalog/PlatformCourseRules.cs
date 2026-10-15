using System.Text.RegularExpressions;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Input rules shared by the course builder validators.</summary>
public static class PlatformCourseRules
{
    /// <summary>Longest stored rich text (characters of sanitized HTML).</summary>
    public const int MaxHtmlLength = 100_000;

    /// <summary>Course codes: upper-case letters, digits and dashes, e.g. A1-F or AI1-F.</summary>
    public static bool IsValidCode(string? code) =>
        !string.IsNullOrWhiteSpace(code) && Regex.IsMatch(code.Trim().ToUpperInvariant(), "^[A-Z0-9][A-Z0-9-]{1,29}$");
}
