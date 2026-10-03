using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Employees;

public class CreateEmployeeUseCaseValidator : AbstractValidator<CreateEmployeeUseCaseInput>
{
    private static readonly string[] AllowedStatuses =
    [
        Statuses.Employee.Active,
        Statuses.Employee.Inactive,
        Statuses.Employee.Transferred,
        Statuses.Employee.Archived
    ];

    public CreateEmployeeUseCaseValidator()
    {
        RuleFor(x => x.EmployeeCode)
            .NotEmpty().WithMessage("Employee code is required.")
            .MaximumLength(50).WithMessage("Employee code cannot exceed 50 characters.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200).WithMessage("Full name cannot exceed 200 characters.");

        RuleFor(x => x.DepartmentId)
            .NotEmpty().WithMessage("Department is required.");

        RuleFor(x => x.WorkEmail)
            .EmailAddress().WithMessage("Work email must be a valid email address.")
            .When(x => !string.IsNullOrWhiteSpace(x.WorkEmail))
            .MaximumLength(255).WithMessage("Work email cannot exceed 255 characters.");

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("Phone cannot exceed 50 characters.");

        RuleFor(x => x.Status)
            .Must(status => string.IsNullOrWhiteSpace(status) || AllowedStatuses.Contains(status.Trim().ToUpper()))
            .WithMessage("Status is invalid.");
    }
}
