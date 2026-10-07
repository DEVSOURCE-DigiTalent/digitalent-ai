namespace DigiTalent.Infrastructure.Invitations;

/// <summary>
/// Section "Invitations" of appsettings.json.
/// </summary>
public class InvitationSettings
{
    /// <summary>Frontend origin used to build the activation link ({FrontendBaseUrl}/activate/{token}).</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";

    /// <summary>Return the activation link in API responses. Enable in Development only (no e-mail provider yet).</summary>
    public bool ExposeDebugLink { get; set; }
}
