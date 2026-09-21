using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Departments;

public class GetPagedDepartmentsUseCaseValidator : AbstractValidator<GetPagedDepartmentsUseCaseInput>
{
    public GetPagedDepartmentsUseCaseValidator()
    {
        Include(new PaginationRequestValidator()); // dùng lại rule PageIndex/PageSize
    }
}
