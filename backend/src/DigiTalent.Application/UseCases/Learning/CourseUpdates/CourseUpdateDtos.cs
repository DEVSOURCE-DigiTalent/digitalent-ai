namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>Where the organization stands with the course version DigiTalent published last.</summary>
public static class CourseUpdateStatus
{
    /// <summary>The organization learns from the newest version (or the newest changes nothing it has).</summary>
    public const string UpToDate = "UP_TO_DATE";

    /// <summary>A newer version changes some courses and waits for the organization to apply it or keep its version.</summary>
    public const string Available = "AVAILABLE";

    /// <summary>The organization chose to keep its version for the newest one (it can still apply it later).</summary>
    public const string Kept = "KEPT";
}

/// <summary>A course the newest version changes for the organization.</summary>
public class CourseUpdateCourseDto
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Level { get; set; }

    /// <summary>UPDATED (new content) or ADDED (a course the organization did not have).</summary>
    public string Kind { get; set; } = string.Empty;

    /// <summary>Basic, or bought by the organization: its employees can learn it.</summary>
    public bool Owned { get; set; }

    /// <summary>Employees learning the course now: applying makes them start again from the beginning.</summary>
    public int LearnersInProgress { get; set; }

    /// <summary>Employees who passed it: applying makes them learn it again (the level it gave stops counting; the certificate stays).</summary>
    public int LearnersPassed { get; set; }

    /// <summary>
    /// Employees learn the company version R&D applied: applying gives them DigiTalent's content and puts the company
    /// version back into R&D's draft.
    /// </summary>
    public bool CompanyVersion { get; set; }
}

/// <summary>The organization's decision to keep its version instead of a newer one.</summary>
public class CourseUpdateKeptDto
{
    public int VersionNo { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset KeptAt { get; set; }
    public string? KeptBy { get; set; }
}

public class CourseUpdatesOutput
{
    public string Status { get; set; } = CourseUpdateStatus.UpToDate;

    /// <summary>Version the organization's employees learn from (when they start a course).</summary>
    public int CurrentVersionNo { get; set; }

    /// <summary>Newest version DigiTalent published.</summary>
    public int LatestVersionNo { get; set; }

    public DateTimeOffset? LatestPublishedAt { get; set; }
    public string? ReleaseNote { get; set; }

    /// <summary>Courses the newest version changes (empty when up to date).</summary>
    public List<CourseUpdateCourseDto> Courses { get; set; } = new();

    /// <summary>Set while the organization keeps its version instead of the newest one.</summary>
    public CourseUpdateKeptDto? Kept { get; set; }

    /// <summary>RND when the company's R&amp;D decides, OWNER when it has no R&amp;D (<see cref="CourseUpdateDeciders"/>).</summary>
    public string DecidedBy { get; set; } = CourseUpdateDeciders.Owner;

    /// <summary>Whether the caller may apply or keep (false = read only, e.g. the owner while R&amp;D is in charge).</summary>
    public bool CanDecide { get; set; }
}
