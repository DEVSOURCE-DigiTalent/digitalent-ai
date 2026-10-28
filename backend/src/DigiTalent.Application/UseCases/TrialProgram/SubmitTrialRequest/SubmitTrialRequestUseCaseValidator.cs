using FluentValidation;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class SubmitTrialRequestUseCaseValidator : AbstractValidator<SubmitTrialRequestUseCaseInput>
{
    public SubmitTrialRequestUseCaseValidator()
    {
        RuleFor(x => x.TestDeadline).NotEmpty().WithMessage("Chọn hạn làm bài.");
        RuleFor(x => x.PreferredReviewAt)
            .NotEmpty().WithMessage("Chọn giờ mong muốn chấm.")
            .GreaterThanOrEqualTo(x => x.TestDeadline).WithMessage("Giờ chấm phải sau hạn làm bài.");
        RuleFor(x => x.Note).MaximumLength(TrialProgramRules.MaxRequestNoteLength);
    }
}
