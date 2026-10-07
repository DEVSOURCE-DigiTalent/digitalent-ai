using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Length matches users.deactivated_reason varchar(500).
/// </summary>
public class DeactivateMemberUseCaseValidator : AbstractValidator<DeactivateMemberUseCaseInput>
{
    public DeactivateMemberUseCaseValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}
