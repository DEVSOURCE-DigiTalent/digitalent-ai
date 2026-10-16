using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Pulse;

public class StartPulseProctoringUseCaseValidator : AbstractValidator<StartPulseProctoringUseCaseInput>
{
    public StartPulseProctoringUseCaseValidator()
    {
        RuleFor(x => x.Kind)
            .Must(kind => Statuses.ProctoringKind.All.Contains(kind))
            .WithMessage("Loại bài phải là PRE_ASSESSMENT hoặc FINAL.");
    }
}
