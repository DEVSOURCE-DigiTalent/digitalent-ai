namespace DigiTalent.Domain.Constants;

/// <summary>
/// Values of the platform catalog tables (SQL section 12A). Must match their CHECK constraints.
/// Status values live in <see cref="Statuses"/> (PlatformCourseSales, PlatformCourseQuestion, Organization).
/// </summary>
public static class PlatformCatalog
{
    /// <summary>platform_courses.level: Basic / Intermediate / Advanced.</summary>
    public const short MinLevel = 1;
    public const short MaxLevel = 3;

    /// <summary>course_seat_orders.kind</summary>
    public static class SeatOrderKind
    {
        public const string Purchase = "PURCHASE";
        public const string AdminGrant = "ADMIN_GRANT";
    }

    public static string LevelName(int level) => level switch
    {
        1 => "Cơ bản",
        2 => "Trung cấp",
        3 => "Nâng cao",
        _ => $"Cấp {level}",
    };
}
