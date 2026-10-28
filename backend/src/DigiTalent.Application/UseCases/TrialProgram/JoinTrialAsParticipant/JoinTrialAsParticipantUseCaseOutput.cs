namespace DigiTalent.Application.UseCases.TrialProgram;

public class JoinTrialAsParticipantUseCaseOutput
{
    public Guid EmployeeId { get; set; }
    /// <summary>Phiên đăng nhập cần làm mới để nhận role Nhân viên vừa thêm.</summary>
    public bool RefreshSession { get; set; } = true;
}
