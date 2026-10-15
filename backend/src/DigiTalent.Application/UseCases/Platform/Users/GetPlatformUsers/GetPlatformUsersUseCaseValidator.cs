using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Users;

public class GetPlatformUsersUseCaseValidator : AbstractValidator<GetPlatformUsersUseCaseInput>
{
    public GetPlatformUsersUseCaseValidator()
    {
        Include(new PaginationRequestValidator());
        RuleFor(x => x.Trial)
            .Must(t => PlatformUserTrials.Filters.Contains(t!.Trim().ToUpperInvariant()))
            .When(x => !string.IsNullOrWhiteSpace(x.Trial))
            .WithMessage("Bộ lọc dùng thử phải là ACTIVE, ENDING_SOON, ENDED hoặc ANY.");
    }
}
