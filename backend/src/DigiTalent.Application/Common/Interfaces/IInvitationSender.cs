namespace DigiTalent.Application.Common.Interfaces;

/// <summary>
/// Delivers the activation link of a member invitation (OW-02). The implementation lives in Infrastructure.
/// No e-mail provider is wired yet: the current implementation logs the link and, in Development only,
/// returns it so the inviter (or a tester) can open it.
/// </summary>
public interface IInvitationSender
{
    /// <returns>The activation link when it may be shown to the caller (Development), otherwise null.</returns>
    Task<string?> SendAsync(InvitationMessage message, CancellationToken cancellationToken = default);
}

/// <summary>What the invitee receives. <paramref name="Token"/> is the raw activation token (never stored).</summary>
public sealed record InvitationMessage(string Email, string FullName, string OrganizationName, string Token);
