using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Revokes a pending invitation (OW-02): the link stops working and the seat is released.
/// The row is kept with status REVOKED (no hard delete).
/// </summary>
public class RevokeInvitationUseCase : IUseCase<RevokeInvitationUseCaseInput, RevokeInvitationUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public RevokeInvitationUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<RevokeInvitationUseCaseOutput> ExecuteAsync(RevokeInvitationUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var invitation = await _context.MemberInvitations
            .FirstOrDefaultAsync(i => i.Id == input.Id && i.OrganizationId == organizationId)
            ?? throw new NotFoundException($"Invitation '{input.Id}' not found.");

        if (invitation.Status == Statuses.MemberInvitation.Revoked)
        {
            return new RevokeInvitationUseCaseOutput { Id = invitation.Id }; // idempotent
        }

        if (invitation.Status != Statuses.MemberInvitation.Pending)
        {
            throw new ConflictException("The invitation has already been accepted.");
        }

        invitation.Status = Statuses.MemberInvitation.Revoked;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync("INVITATION_REVOKED", "member_invitations", invitation.Id, entityLabel: invitation.FullName);

        return new RevokeInvitationUseCaseOutput { Id = invitation.Id };
    }
}
