using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Organization.Members;

/// <summary>
/// Sends a pending invitation again (OW-02/OW-03): issues a new token — the previous link stops working — and
/// restarts the validity period.
/// </summary>
public class ResendInvitationUseCase : IUseCase<ResendInvitationUseCaseInput, ResendInvitationUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IInvitationSender _invitationSender;
    private readonly IAuditService _auditService;

    public ResendInvitationUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IInvitationSender invitationSender,
        IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _invitationSender = invitationSender;
        _auditService = auditService;
    }

    public async Task<ResendInvitationUseCaseOutput> ExecuteAsync(ResendInvitationUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var invitation = await _context.MemberInvitations
            .FirstOrDefaultAsync(i => i.Id == input.Id && i.OrganizationId == organizationId)
            ?? throw new NotFoundException($"Invitation '{input.Id}' not found.");

        if (invitation.Status != Statuses.MemberInvitation.Pending)
        {
            throw new ConflictException("Only a pending invitation can be resent.");
        }

        // New token + new expiry; only the hash is stored
        var now = DateTimeOffset.UtcNow;
        var token = InvitationTokens.NewToken();
        invitation.TokenHash = InvitationTokens.Hash(token);
        invitation.InvitedAt = now;
        invitation.ExpiresAt = now.Add(InvitationTokens.Lifetime);
        await _context.SaveChangesAsync();

        var organizationName = await _context.Organizations
            .Where(o => o.Id == organizationId)
            .Select(o => o.Name)
            .FirstOrDefaultAsync() ?? string.Empty;
        var link = await _invitationSender.SendAsync(new InvitationMessage(invitation.Email, invitation.FullName, organizationName, token));

        await _auditService.LogAsync("INVITATION_RESENT", "member_invitations", invitation.Id, entityLabel: invitation.FullName);

        return new ResendInvitationUseCaseOutput
        {
            Id = invitation.Id,
            ExpiresAt = invitation.ExpiresAt,
            Token = link == null ? null : token,
            DebugLink = link,
        };
    }
}
