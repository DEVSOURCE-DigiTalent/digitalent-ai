using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseOutput : PagedList<PlatformUserItem>
{
    /// <summary>Trial counts over every personal account (not limited by the filters).</summary>
    public PlatformTrialSummary Trials { get; set; } = new();
}
