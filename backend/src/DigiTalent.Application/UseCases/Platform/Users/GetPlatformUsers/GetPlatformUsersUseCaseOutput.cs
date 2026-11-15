using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseOutput : PagedList<PlatformUserItem>
{
    /// <summary>Trial counts over every personal account (not limited by the filters).</summary>
    public PlatformTrialSummary Trials { get; set; } = new();
    public PlatformUsersRoleStats Stats { get; set; } = new();
}

public class PlatformUsersRoleStats
{
    public int Total { get; set; }
    public int Owners { get; set; }
    public int Managers { get; set; }
    public int Employees { get; set; }
    public int Mentors { get; set; }
    public int Admins { get; set; }
    public int Learners { get; set; }
    public int Locked { get; set; }
    public int Active { get; set; }
}
