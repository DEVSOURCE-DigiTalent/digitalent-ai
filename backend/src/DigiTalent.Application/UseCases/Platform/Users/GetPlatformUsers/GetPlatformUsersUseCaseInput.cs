using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseInput : PaginationRequest
{
    public string? Role { get; set; }
    public string? Status { get; set; }
    public Guid? OrganizationId { get; set; }
    /// <summary>ACTIVE, ENDING_SOON (ends within 2 days), ENDED or ANY — personal accounts by trial state.</summary>
    public string? Trial { get; set; }
}
