using System.Globalization;

namespace DigiTalent.Application.Common.Models;

/// <summary>Order of people's names in lists built in memory.</summary>
public static class NameOrder
{
    /// <summary>Vietnamese collation, case-insensitive.</summary>
    public static readonly StringComparer Vietnamese = StringComparer.Create(CultureInfo.GetCultureInfo("vi-VN"), ignoreCase: true);
}
