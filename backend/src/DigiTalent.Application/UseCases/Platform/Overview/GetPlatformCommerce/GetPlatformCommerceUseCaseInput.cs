using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformCommerceUseCaseInput : PaginationRequest
{
    public string? Kind { get; set; }
}
