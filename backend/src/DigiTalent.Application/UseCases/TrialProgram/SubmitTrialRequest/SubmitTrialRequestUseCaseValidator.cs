using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitTrialRequestUseCaseValidator : AbstractValidator<SubmitTrialRequestUseCaseInput>
{
    public SubmitTrialRequestUseCaseValidator()
    {
        RuleFor(x => x.TestDeadline).NotEmpty().WithMessage("Chọn hạn làm bài.");
        RuleFor(x => x.Note).MaximumLength(TrialProgramRules.MaxRequestNoteLength);
    }
}
