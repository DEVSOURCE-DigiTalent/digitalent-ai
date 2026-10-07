using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Organization.Members;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Invitations;

/// <summary>
/// Public lookup of an invitation by its activation token (page /activate/:token, before the invitee has an account).
/// Unknown, revoked, accepted or expired tokens all answer 404 with the same message, so the endpoint does not
/// reveal which invitations exist.
/// </summary>
public class GetInvitationUseCase : IUseCase<GetInvitationUseCaseInput, GetInvitationUseCaseOutput>
{
    public const string InvalidLinkMessage = "The invitation link is invalid or has expired.";

    private readonly IApplicationDbContext _context;

    public GetInvitationUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetInvitationUseCaseOutput> ExecuteAsync(GetInvitationUseCaseInput input)
    {
        var tokenHash = InvitationTokens.Hash(input.Token);
        var row = await (
                from invitation in _context.MemberInvitations
                where invitation.TokenHash == tokenHash
                join organization in _context.Organizations on invitation.OrganizationId equals organization.Id
                join role in _context.Roles on invitation.RoleId equals role.Id
                select new { Invitation = invitation, OrganizationName = organization.Name, RoleCode = role.Code })
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (row == null || !row.Invitation.IsOpenAt(DateTimeOffset.UtcNow))
        {
            throw new NotFoundException(InvalidLinkMessage);
        }

        return new GetInvitationUseCaseOutput
        {
            OrganizationName = row.OrganizationName,
            Email = row.Invitation.Email,
            FullName = row.Invitation.FullName,
            Role = MemberRoles.FromRoleCode(row.RoleCode) ?? MemberRoles.Employee,
            Status = "pending",
            ExpiresAt = row.Invitation.ExpiresAt,
        };
    }
}
