using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseInput : PaginationRequest
{
    public string? Role { get; set; }
    public string? Status { get; set; }
    public Guid? OrganizationId { get; set; }
}
