using DigiTalent.Application.Common.Models;
using DigiTalent.Domain.Constants;
using FluentValidation;

namespace DigiTalent.Application.UseCases.Organization.Members;

public class GetPagedMembersUseCaseValidator : AbstractValidator<GetPagedMembersUseCaseInput>
{
    public GetPagedMembersUseCaseValidator()
    {
        Include(new PaginationRequestValidator());

        RuleFor(x => x.Status)
            .Must(status => status is null or MemberStatuses.Active or MemberStatuses.Inactive or MemberStatuses.Pending)
            .WithMessage("Status must be ACTIVE, INACTIVE or PENDING.");

        RuleFor(x => x.JobGrade)
            .Must(grade => grade is null || JobGrades.IsValid(grade))
            .WithMessage("JobGrade must be G1, G2 or G3.");
    }
}
