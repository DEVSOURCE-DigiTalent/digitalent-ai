using FluentValidation;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class UpdateQuestionUseCaseValidator : AbstractValidator<UpdateQuestionUseCaseInput>
{
    public UpdateQuestionUseCaseValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.Status)
            .Must(s => s == null || s == "DRAFT" || s == "PUBLISHED" || s == "ARCHIVED")
            .WithMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED.");
    }
}
