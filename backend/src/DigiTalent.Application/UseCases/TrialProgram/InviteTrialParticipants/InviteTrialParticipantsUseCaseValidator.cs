using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class InviteTrialParticipantsUseCaseValidator : AbstractValidator<InviteTrialParticipantsUseCaseInput>
{
    public InviteTrialParticipantsUseCaseValidator()
    {
        RuleFor(x => x.Rows)
            .NotEmpty().WithMessage("Thêm ít nhất một nhân viên.");
    }
}
