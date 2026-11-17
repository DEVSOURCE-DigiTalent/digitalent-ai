namespace DigiTalent.Application.UseCases.Competency.Ceilings;

public class UpdateCompetencyMilestonesUseCaseInput
{
    /// <summary>Mốc của các lĩnh vực cần đổi (lĩnh vực không có trong danh sách giữ nguyên); 0 = bỏ mốc.</summary>
    public List<CeilingInputItem> Milestones { get; set; } = new();
}
