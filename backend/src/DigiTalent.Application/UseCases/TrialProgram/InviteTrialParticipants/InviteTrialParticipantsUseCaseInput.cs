namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Nhân viên dùng thử nhập tay hoặc từ file Excel: họ tên, email, phòng ban, vị trí (theo tên).</summary>
public class InviteTrialParticipantsUseCaseInput
{
    public List<TrialParticipantRow> Rows { get; set; } = new();
}

public class TrialParticipantRow
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
}
