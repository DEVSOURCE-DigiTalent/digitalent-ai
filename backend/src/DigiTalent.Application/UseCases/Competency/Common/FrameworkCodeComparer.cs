namespace DigiTalent.Application.UseCases.Competency.Common;

/// <summary>
/// Natural order of Circular 02/2025 codes ("1.2" before "1.10"); codes that are not numeric go last, by text.
/// </summary>
public sealed class FrameworkCodeComparer : IComparer<string?>
{
    public static readonly FrameworkCodeComparer Instance = new();

    public int Compare(string? x, string? y)
    {
        var left = Parts(x);
        var right = Parts(y);
        if (left == null || right == null)
        {
            return left != null ? -1 : right != null ? 1 : string.CompareOrdinal(x, y);
        }

        for (var i = 0; i < Math.Min(left.Length, right.Length); i++)
        {
            var order = left[i].CompareTo(right[i]);
            if (order != 0)
            {
                return order;
            }
        }

        return left.Length.CompareTo(right.Length);
    }

    private static int[]? Parts(string? code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return null;
        }

        var parts = code.Split('.');
        var numbers = new int[parts.Length];
        for (var i = 0; i < parts.Length; i++)
        {
            if (!int.TryParse(parts[i], out numbers[i]))
            {
                return null;
            }
        }

        return numbers;
    }
}
