using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

/// <summary>
/// Table platform_catalog_versions: one version of the whole curriculum. At most one DRAFT (being edited) and one
/// CURRENT (the version organizations use — the "anchor"); published versions become RETIRED when replaced.
/// </summary>
public class PlatformCatalogVersion : BaseEntity
{
    public int VersionNo { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? BasedOnVersionId { get; set; }
    public string? ReleaseNote { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? PublishedByUserId { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
}

/// <summary>
/// Table platform_catalog_courses: a course as it is in one catalog version — info, price, final assessment.
/// ChangeKind is relative to the version the draft was copied from (NEW / EDITED / UNCHANGED).
/// </summary>
public class PlatformCatalogCourse : BaseEntity
{
    public Guid VersionId { get; set; }
    public Guid CourseId { get; set; }
    public string ChangeKind { get; set; } = string.Empty;
    public Guid DomainId { get; set; }
    public short Level { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public string FinalTitle { get; set; } = string.Empty;
    /// <summary>Sanitized HTML.</summary>
    public string FinalPrompt { get; set; } = string.Empty;
    /// <summary>JSON array of criterion titles (jsonb).</summary>
    public string FinalCriteria { get; set; } = "[]";
}

/// <summary>Table platform_course_modules: a module of a course in a version, with the title of its review quiz.</summary>
public class PlatformCourseModule : BaseEntity
{
    public Guid CatalogCourseId { get; set; }
    public int SortOrder { get; set; }
    public string Title { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
}

/// <summary>
/// Table platform_module_blocks: one content block of a module — TEXT (sanitized HTML), SLIDE (items in
/// platform_slide_items), IMAGE or VIDEO (one asset, null until uploaded).
/// </summary>
public class PlatformModuleBlock : BaseEntity
{
    public Guid ModuleId { get; set; }
    public int SortOrder { get; set; }
    public string BlockType { get; set; } = string.Empty;
    public string? BodyHtml { get; set; }
    public Guid? AssetId { get; set; }
    public string? Caption { get; set; }
    public string? AltText { get; set; }
}

/// <summary>Table platform_slide_items: an image or video of a SLIDE block, in order.</summary>
public class PlatformSlideItem : BaseEntity
{
    public Guid BlockId { get; set; }
    public int SortOrder { get; set; }
    public Guid AssetId { get; set; }
    public string? Caption { get; set; }
}

/// <summary>
/// Table platform_module_questions: a review question of a module. BlockId = the block the learner reopens after
/// answering it wrong.
/// </summary>
public class PlatformModuleQuestion : BaseEntity
{
    public Guid ModuleId { get; set; }
    public int SortOrder { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public Guid? BlockId { get; set; }
}

/// <summary>Table platform_question_options: an option of a review question; exactly one is correct.</summary>
public class PlatformQuestionOption : BaseEntity
{
    public Guid QuestionId { get; set; }
    public int SortOrder { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

/// <summary>
/// Table platform_assets: an uploaded image (≤ 10 MB) or video (≤ 500 MB). Files are immutable and shared by
/// every version that references them.
/// </summary>
public class PlatformAsset : BaseEntity
{
    public string Kind { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public Guid? UploadedByUserId { get; set; }
}
