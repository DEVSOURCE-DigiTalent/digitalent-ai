namespace DigiTalent.Application.UseCases.TrialProgram;

public class InviteTrialParticipantsUseCaseOutput
{
    public List<TrialInvitedDto> Invited { get; set; } = new();
    public List<TrialRejectedDto> Rejected { get; set; } = new();
}

public class TrialInvitedDto
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    /// <summary>Link kích hoạt — chỉ khi môi trường cho phép hiện (Invitations:ExposeDebugLink).</summary>
    public string? DebugLink { get; set; }
}

public class TrialRejectedDto
{
    public string Email { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
