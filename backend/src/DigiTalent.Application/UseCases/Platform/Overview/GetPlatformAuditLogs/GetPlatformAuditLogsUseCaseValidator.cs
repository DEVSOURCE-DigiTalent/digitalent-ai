using DigiTalent.Application.Common.Models;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformAuditLogsUseCaseValidator : AbstractValidator<GetPlatformAuditLogsUseCaseInput>
{
    public GetPlatformAuditLogsUseCaseValidator()
    {
        Include(new PaginationRequestValidator());
        RuleFor(x => x.Scope).Must(s => s is null or "" or "platform" or "all").WithMessage("Scope must be platform or all.");
    }
}
