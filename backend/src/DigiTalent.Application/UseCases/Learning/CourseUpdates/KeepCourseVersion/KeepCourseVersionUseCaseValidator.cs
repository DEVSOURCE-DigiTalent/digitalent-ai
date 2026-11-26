using FluentValidation;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

public class KeepCourseVersionUseCaseValidator : AbstractValidator<KeepCourseVersionUseCaseInput>
{
    public KeepCourseVersionUseCaseValidator()
    {
        RuleFor(x => (x.Reason ?? string.Empty).Trim().Length)
            .GreaterThanOrEqualTo(CourseUpdateRules.MinReasonLength)
            .WithMessage($"Ghi lý do giữ bản hiện tại (ít nhất {CourseUpdateRules.MinReasonLength} ký tự).")
            .LessThanOrEqualTo(CourseUpdateRules.MaxReasonLength)
            .WithMessage($"Lý do tối đa {CourseUpdateRules.MaxReasonLength} ký tự.")
            .OverridePropertyName(nameof(KeepCourseVersionUseCaseInput.Reason));
    }
}
