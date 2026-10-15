using DigiTalent.Application.UseCases.Platform.Organizations;

namespace DigiTalent.Application.UseCases.Platform.Overview;

/// <summary>
/// Platform Admin / Tổng quan: customers (trial vs paid), the catalog version in use and the draft, trial users and
/// recent support activity.
/// </summary>
public class GetPlatformOverviewUseCaseOutput
{
    public int OrganizationCount { get; set; }
    public int TrialOrganizationCount { get; set; }
    public int PaidOrganizationCount { get; set; }
    public int SuspendedOrganizationCount { get; set; }
    /// <summary>Paid / all organizations, 0..100 (one decimal).</summary>
    public double ConversionRate { get; set; }
    public int UserCount { get; set; }
    public int EmployeeCount { get; set; }
    public int LockedUserCount { get; set; }
    /// <summary>Individual learners in their trial now, and those whose trial ends within 2 days.</summary>
    public int TrialUserCount { get; set; }
    public int TrialEndingSoonCount { get; set; }
    public int FrameworkCount { get; set; }
    public int DraftFrameworkCount { get; set; }
    /// <summary>A framework has unpublished domain descriptions.</summary>
    public bool FrameworkHasDraft { get; set; }
    public int DomainCount { get; set; }
    /// <summary>Catalog version in use (the anchor) and when it was published.</summary>
    public int? CurrentVersionNo { get; set; }
    public DateTimeOffset? CurrentVersionPublishedAt { get; set; }
    public int? DraftVersionNo { get; set; }
    public int DraftNewCourseCount { get; set; }
    public int DraftEditedCourseCount { get; set; }
    public int CourseCount { get; set; }
    public int PausedCourseCount { get; set; }
    public int QuestionCount { get; set; }
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
    public long Revenue { get; set; }
    public List<PlatformOrganizationItem> RecentOrganizations { get; set; } = new();
    public List<PlatformAuditLogItem> RecentActivity { get; set; } = new();
}
