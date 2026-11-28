namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>One catalog version in the list: status, dates and what changed relative to the version it was copied from.</summary>
public class PlatformCatalogVersionSummary
{
    public int VersionNo { get; set; }
    /// <summary>DRAFT, CURRENT (in use — the anchor) or RETIRED.</summary>
    public string Status { get; set; } = string.Empty;
    public int? BasedOnVersionNo { get; set; }
    public string? ReleaseNote { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public string? PublishedByEmail { get; set; }
    public int CourseCount { get; set; }
    public int FrameworkCount { get; set; }
    public int NewCount { get; set; }
    public int EditedCount { get; set; }
    /// <summary>Organizations whose employees learn from this version (it was applied to them).</summary>
    public int OrganizationCount { get; set; }
}

public class PlatformCatalogVersionsOutput
{
    public List<PlatformCatalogVersionSummary> Items { get; set; } = new();
    public int? CurrentVersionNo { get; set; }
    public int? DraftVersionNo { get; set; }
}

/// <summary>A course row in a version: where it sits (framework, domain, level), its size, price and change.</summary>
public class PlatformCatalogCourseRow
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public Guid DomainId { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public int ModuleCount { get; set; }
    public int QuestionCount { get; set; }
    public long Price { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    /// <summary>NEW, EDITED or UNCHANGED relative to the version it was copied from.</summary>
    public string ChangeKind { get; set; } = string.Empty;
}

public class PlatformCatalogVersionDetail
{
    public PlatformCatalogVersionSummary Version { get; set; } = new();
    public bool Editable { get; set; }
    public List<PlatformCatalogCourseRow> Courses { get; set; } = new();
}

/// <summary>A problem found before publishing: BLOCK stops the publish, WARN is advice.</summary>
public class PlatformPublishCheckItem
{
    public string Level { get; set; } = string.Empty;
    public Guid? CourseId { get; set; }
    public string? CourseCode { get; set; }
    public Guid? ModuleId { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class PlatformPublishCheck
{
    public int VersionNo { get; set; }
    public bool CanPublish { get; set; }
    public int ChangedCount { get; set; }
    public List<PlatformPublishCheckItem> Items { get; set; } = new();

    public const string Block = "BLOCK";
    public const string Warn = "WARN";
}

/// <summary>The whole content of a course in a version, as the course builder edits it.</summary>
public class PlatformCatalogCourseDetail
{
    public int VersionNo { get; set; }
    public string VersionStatus { get; set; } = string.Empty;
    /// <summary>Only courses of the draft version can be edited.</summary>
    public bool Editable { get; set; }
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    /// <summary>The code of a course added in this draft can still change; published codes never change.</summary>
    public bool CodeEditable { get; set; }
    public string ChangeKind { get; set; } = string.Empty;
    public Guid FrameworkId { get; set; }
    public string FrameworkName { get; set; } = string.Empty;
    public Guid DomainId { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public int Level { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long Price { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
    public PlatformCourseFinalDto Final { get; set; } = new();
    public List<PlatformModuleDto> Modules { get; set; } = new();
}

public class PlatformCourseFinalDto
{
    public string Title { get; set; } = string.Empty;
    public string PromptHtml { get; set; } = string.Empty;
    public List<string> Criteria { get; set; } = new();
}

public class PlatformModuleDto
{
    public Guid ModuleId { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public string QuizTitle { get; set; } = string.Empty;
    public List<PlatformBlockDto> Blocks { get; set; } = new();
    public List<PlatformQuestionDto> Questions { get; set; } = new();
}

public class PlatformBlockDto
{
    public Guid BlockId { get; set; }
    public int Index { get; set; }
    /// <summary>TEXT, SLIDE, IMAGE or VIDEO.</summary>
    public string Type { get; set; } = string.Empty;
    public string? BodyHtml { get; set; }
    public PlatformAssetDto? Asset { get; set; }
    public string? Caption { get; set; }
    public string? AltText { get; set; }
    /// <summary>Images and videos of a SLIDE block, in order.</summary>
    public List<PlatformSlideItemDto> Items { get; set; } = new();
}

public class PlatformSlideItemDto
{
    public Guid ItemId { get; set; }
    public PlatformAssetDto Asset { get; set; } = new();
    public string? Caption { get; set; }
}

public class PlatformAssetDto
{
    public Guid AssetId { get; set; }
    /// <summary>IMAGE or VIDEO.</summary>
    public string Kind { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    /// <summary>Signed path relative to the API root (api/v1/), valid for 12 hours.</summary>
    public string Url { get; set; } = string.Empty;
}

public class PlatformQuestionDto
{
    public Guid QuestionId { get; set; }
    public int Index { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    /// <summary>The block the learner reopens after answering this question wrong.</summary>
    public Guid? BlockId { get; set; }
    /// <summary>The question belongs to the course's final multiple-choice test of the curriculum.</summary>
    public bool IsFinalQuiz { get; set; }
    public List<PlatformOptionDto> Options { get; set; } = new();
}

public class PlatformOptionDto
{
    public Guid OptionId { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

/// <summary>A course that changes when a version is applied to an organization.</summary>
public class PlatformCatalogApplyChange
{
    public const string Updated = "UPDATED";
    public const string Added = "ADDED";

    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Level { get; set; }
    /// <summary>UPDATED (new content) or ADDED (a course the organization did not have yet).</summary>
    public string Kind { get; set; } = string.Empty;
}

/// <summary>A published version an organization can be moved to.</summary>
public class PlatformCatalogVersionOption
{
    public int VersionNo { get; set; }
    /// <summary>CURRENT (the newest) or RETIRED.</summary>
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset? PublishedAt { get; set; }
    public string? ReleaseNote { get; set; }
}

/// <summary>The version an organization learns from, the versions it can move to and what a move changes.</summary>
public class OrganizationCatalogVersionOutput
{
    public Guid OrganizationId { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    /// <summary>False when the organization has no standard courses yet (they are added when it registers).</summary>
    public bool Provisioned { get; set; }
    /// <summary>Version applied to the organization.</summary>
    public int VersionNo { get; set; }
    /// <summary>The newest published version (the one in use for new organizations).</summary>
    public int LatestVersionNo { get; set; }
    public List<PlatformCatalogVersionOption> Versions { get; set; } = new();
    /// <summary>The version the changes below lead to (after an apply: the version just applied).</summary>
    public int TargetVersionNo { get; set; }
    public List<PlatformCatalogApplyChange> Changes { get; set; } = new();

    /// <summary>Set when the organization chose to keep its version instead of the newest one (with its reason).</summary>
    public DigiTalent.Application.UseCases.Learning.CourseUpdates.CourseUpdateKeptDto? Kept { get; set; }
}
