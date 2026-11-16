namespace DigiTalent.Application.Common;

/// <summary>Standard course codes use M. A is accepted as a historical alias for the same course.</summary>
public static class CourseCodes
{
    public static string Canonical(string? code)
    {
        var value = code?.Trim() ?? string.Empty;
        var upper = value.ToUpperInvariant();
        return IsStandard(upper) ? $"M{upper[1..]}" : value;
    }

    public static string[] Aliases(string code)
    {
        var canonical = Canonical(code);
        return IsStandard(canonical)
            ? new[] { code, canonical, $"A{canonical[1..]}" }.Distinct(StringComparer.Ordinal).ToArray()
            : new[] { code };
    }

    private static bool IsStandard(string code) => code.Length == 4
        && code[0] is 'A' or 'M' && code[1] is >= '1' and <= '6'
        && code[2] == '-' && code[3] is 'F' or 'I' or 'A';
}
