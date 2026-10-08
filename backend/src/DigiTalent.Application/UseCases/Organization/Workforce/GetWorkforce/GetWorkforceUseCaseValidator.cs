using DigiTalent.Application.Common.Models;
using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Workforce;

public class GetWorkforceUseCaseValidator : AbstractValidator<GetWorkforceUseCaseInput>
{
    public static readonly string[] GapFilters = { "HIGH", "ANY", "NONE", "UNKNOWN" };
    public static readonly string[] LearningFilters = { "OVERDUE", "ACTIVE", "NONE" };

    private static readonly string[] EmployeeStatuses =
    {
        Statuses.Employee.Active, Statuses.Employee.Inactive, Statuses.Employee.Transferred, Statuses.Employee.Archived,
    };

    public GetWorkforceUseCaseValidator()
    {
        Include(new PaginationRequestValidator());

        RuleFor(x => x.Status)
            .Must(status => status is null || EmployeeStatuses.Contains(status.ToUpperInvariant()))
            .WithMessage("Status must be ACTIVE, INACTIVE, TRANSFERRED or ARCHIVED.");

        RuleFor(x => x.Gap)
            .Must(gap => gap is null || GapFilters.Contains(gap.ToUpperInvariant()))
            .WithMessage("Gap must be HIGH, ANY, NONE or UNKNOWN.");

        RuleFor(x => x.Learning)
            .Must(learning => learning is null || LearningFilters.Contains(learning.ToUpperInvariant()))
            .WithMessage("Learning must be OVERDUE, ACTIVE or NONE.");
    }
}
