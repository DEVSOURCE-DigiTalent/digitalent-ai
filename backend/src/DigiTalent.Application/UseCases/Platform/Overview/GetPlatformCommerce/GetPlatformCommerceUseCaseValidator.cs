using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformCommerceUseCaseValidator : AbstractValidator<GetPlatformCommerceUseCaseInput>
{
    public GetPlatformCommerceUseCaseValidator()
    {
        Include(new PaginationRequestValidator());
    }
}
