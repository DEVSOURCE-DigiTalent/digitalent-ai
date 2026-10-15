using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseValidator : AbstractValidator<GetPlatformUsersUseCaseInput>
{
    public GetPlatformUsersUseCaseValidator()
    {
        Include(new PaginationRequestValidator());
    }
}
