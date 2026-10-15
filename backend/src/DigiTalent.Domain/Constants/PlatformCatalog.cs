namespace DigiTalent.Domain.Constants;

/// <summary>
/// Values of the platform catalog tables (SQL sections 12A and 18, v3.2). Must match their CHECK constraints.
/// Status values live in <see cref="Statuses"/> (PlatformFramework, PlatformCatalogVersion, PlatformCourseSales,
/// Organization).
/// </summary>
public static class PlatformCatalog
{
    /// <summary>platform_courses.level: Basic / Intermediate / Advanced.</summary>
    public const short MinLevel = 1;
    public const short MaxLevel = 3;

    /// <summary>Framework of the Circular 02/2025 standard (the six TT02 domains).</summary>
    public const string Tt02FrameworkCode = "TT02_2025";

    /// <summary>course_seat_orders.kind</summary>
    public static class SeatOrderKind
    {
        public const string Purchase = "PURCHASE";
        public const string AdminGrant = "ADMIN_GRANT";
    }

    /// <summary>platform_catalog_courses.change_kind</summary>
    public static class ChangeKind
    {
        public const string New = "NEW";
        public const string Edited = "EDITED";
        public const string Unchanged = "UNCHANGED";
    }

    /// <summary>platform_module_blocks.block_type</summary>
    public static class BlockType
    {
        public const string Text = "TEXT";
        public const string Slide = "SLIDE";
        public const string Image = "IMAGE";
        public const string Video = "VIDEO";

        public static readonly string[] All = { Text, Slide, Image, Video };

        public static bool IsValid(string? value) => value is Text or Slide or Image or Video;
    }

    /// <summary>platform_assets.kind and its size limits (ck_platform_assets_size).</summary>
    public static class AssetKind
    {
        public const string Image = "IMAGE";
        public const string Video = "VIDEO";

        public const long MaxImageBytes = 10L * 1024 * 1024;
        public const long MaxVideoBytes = 500L * 1024 * 1024;

        public static long MaxBytes(string kind) => kind == Video ? MaxVideoBytes : MaxImageBytes;
    }

    /// <summary>Review questions of a module: a learner draws 2 per attempt, so 6 gives three different attempts.</summary>
    public const int MinQuestionsPerModule = 2;
    public const int RecommendedQuestionsPerModule = 6;
    public const int MinOptionsPerQuestion = 2;
    public const int MaxOptionsPerQuestion = 5;

    /// <summary>The three default criteria of a course final (manager-graded evidence).</summary>
    public static readonly string[] DefaultFinalCriteria =
    {
        "Nguồn có thể truy vết",
        "Hành động có thể kiểm tra",
        "Kết luận có căn cứ",
    };

    /// <summary>Default price per seat of a new course (VND); Basic is always free.</summary>
    public const long DefaultIntermediatePrice = 399_000;
    public const long DefaultAdvancedPrice = 699_000;

    public static long DefaultPrice(int level) => level switch
    {
        2 => DefaultIntermediatePrice,
        3 => DefaultAdvancedPrice,
        _ => 0,
    };

    public static string LevelName(int level) => level switch
    {
        1 => "Cơ bản",
        2 => "Trung cấp",
        3 => "Nâng cao",
        _ => $"Cấp {level}",
    };
}
