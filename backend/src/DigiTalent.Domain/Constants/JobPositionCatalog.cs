namespace DigiTalent.Domain.Constants;

public static class JobPositionCatalog
{
    public static readonly IReadOnlyDictionary<string, string> Positions = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["CEO"] = "CEO / Giám đốc",
        ["HR"] = "Nhân sự (HR)",
        ["MARKETING"] = "Marketing",
        ["SALES_CRM"] = "Sales / CRM",
        ["ACCOUNTANT"] = "Kế toán",
    };

    public static string? ResolveCode(string? value)
    {
        var label = value?.Trim();
        if (string.IsNullOrEmpty(label))
            return null;

        var match = Positions.FirstOrDefault(p => p.Key.Equals(label, StringComparison.OrdinalIgnoreCase)
            || p.Value.Equals(label, StringComparison.OrdinalIgnoreCase));
        if (match.Key != null)
            return match.Key;

        return label.ToUpperInvariant() switch
        {
            "GIÁM ĐỐC" => "CEO",
            "NHÂN SỰ" => "HR",
            "KINH DOANH" or "SALES" => "SALES_CRM",
            _ => null,
        };
    }
}
