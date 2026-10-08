using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Only the batch itself is validated here; each row is checked by the use case and rejected on its own.
/// </summary>
public class InviteMembersUseCaseValidator : AbstractValidator<InviteMembersUseCaseInput>
{
    public const int MaxRows = 200;

    public InviteMembersUseCaseValidator()
    {
        RuleFor(x => x.Rows)
            .NotEmpty().WithMessage("Rows must contain at least one invitee.")
            .Must(rows => rows.Count <= MaxRows).WithMessage($"At most {MaxRows} invitations can be sent at once.");
    }
}
