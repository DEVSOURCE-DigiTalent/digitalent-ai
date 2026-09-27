using DigiTalent.Application.Common.Models;
using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

public class GetPagedDepartmentsUseCaseValidator : AbstractValidator<GetPagedDepartmentsUseCaseInput>
{
    public GetPagedDepartmentsUseCaseValidator()
    {
        Include(new PaginationRequestValidator()); // dùng lại rule PageIndex/PageSize

        RuleFor(x => x.Status)
            .Must(status => status is null
                or Statuses.MasterData.Active
                or Statuses.MasterData.Inactive
                or Statuses.MasterData.Archived)
            .WithMessage("Status must be ACTIVE, INACTIVE or ARCHIVED.");
    }
}
