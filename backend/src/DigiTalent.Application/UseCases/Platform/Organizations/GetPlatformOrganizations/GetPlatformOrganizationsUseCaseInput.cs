using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class GetPlatformOrganizationsUseCaseInput : PaginationRequest
{
    public string? Status { get; set; }
    public string? Stage { get; set; }
}
