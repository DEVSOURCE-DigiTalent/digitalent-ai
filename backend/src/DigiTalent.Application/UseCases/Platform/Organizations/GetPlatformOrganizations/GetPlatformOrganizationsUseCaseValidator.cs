using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class GetPlatformOrganizationsUseCaseValidator : AbstractValidator<GetPlatformOrganizationsUseCaseInput>
{
    public GetPlatformOrganizationsUseCaseValidator()
    {
        Include(new PaginationRequestValidator());
    }
}
