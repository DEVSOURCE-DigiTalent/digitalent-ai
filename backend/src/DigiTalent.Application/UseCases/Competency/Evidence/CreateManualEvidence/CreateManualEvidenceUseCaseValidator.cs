using FluentValidation;

namespace DigiTalent.Application.UseCases.Competency;

public class CreateManualEvidenceUseCaseValidator : AbstractValidator<CreateManualEvidenceUseCaseInput>
{
    public const int MaxReviewNoteLength = 2000;

    public CreateManualEvidenceUseCaseValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.CompetencyId).NotEmpty();
        RuleFor(x => x.ConfirmedLevel).InclusiveBetween((short)1, (short)3);
        RuleFor(x => x.ReviewNote).NotEmpty().MaximumLength(MaxReviewNoteLength);
    }
}
