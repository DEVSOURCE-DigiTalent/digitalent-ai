namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Phòng ban và vị trí (theo tên) của chủ doanh nghiệp khi tự tham gia làm bài và học thử.</summary>
public class JoinTrialAsParticipantUseCaseInput
{
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
}
