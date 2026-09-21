using FluentValidation;

namespace DigiTalent.Application.Common.Models;

/// <summary>
/// Dùng lại trong validator của use case "GetPaged...": Include(new PaginationRequestValidator());
/// </summary>
public class PaginationRequestValidator : AbstractValidator<PaginationRequest>
{
    public PaginationRequestValidator()
    {
        RuleFor(x => x.PageIndex).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
