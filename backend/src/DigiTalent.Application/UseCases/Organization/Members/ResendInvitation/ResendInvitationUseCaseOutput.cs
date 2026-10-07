namespace DigiTalent.Application.UseCases.Organization.Members;

public class ResendInvitationUseCaseOutput
{
    public Guid Id { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>Raw activation token — Development only, null elsewhere.</summary>
    public string? Token { get; set; }

    /// <summary>Full activation link — Development only, null elsewhere.</summary>
    public string? DebugLink { get; set; }
}
