using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Invitations;

public class GetInvitationUseCaseValidator : AbstractValidator<GetInvitationUseCaseInput>
{
    public GetInvitationUseCaseValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(200);
    }
}
