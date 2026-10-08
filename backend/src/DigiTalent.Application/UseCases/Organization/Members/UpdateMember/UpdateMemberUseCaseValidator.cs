using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Members;

public class UpdateMemberUseCaseValidator : AbstractValidator<UpdateMemberUseCaseInput>
{
    public UpdateMemberUseCaseValidator()
    {
        RuleFor(x => x.Roles!)
            .NotEmpty().WithMessage("Roles must contain at least one role.")
            .Must(roles => roles.All(role => MemberRoles.ToRoleCode(role) != null))
            .WithMessage("Roles must be OWNER, MANAGER or EMPLOYEE.")
            .When(x => x.Roles != null);

        RuleFor(x => x.JobPositionId)
            .Must(value => value == string.Empty || Guid.TryParse(value, out _))
            .WithMessage("JobPositionId must be a GUID or an empty string.")
            .When(x => x.JobPositionId != null);
    }
}
