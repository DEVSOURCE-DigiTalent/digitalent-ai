using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Mức mentor quyết định cho từng lĩnh vực của một bài (0 = chưa đạt Cơ bản … 3 = Nâng cao), điểm ba bài tự luận theo thứ
/// tự cấp [Cơ bản, Trung cấp, Nâng cao] (0–10, đạt từ 5) và nhận xét.
/// </summary>
public class ReviewTrialAssessmentUseCaseInput
{
    [JsonIgnore]
    public Guid OrganizationId { get; set; }

    [JsonIgnore]
    public Guid AssessmentId { get; set; }

    public List<TrialDomainLevelInput> Levels { get; set; } = new();
    public List<int> EssayScores { get; set; } = new();
    public string? Note { get; set; }
}

public class TrialDomainLevelInput
{
    public Guid CategoryId { get; set; }
    public int Level { get; set; }
}
