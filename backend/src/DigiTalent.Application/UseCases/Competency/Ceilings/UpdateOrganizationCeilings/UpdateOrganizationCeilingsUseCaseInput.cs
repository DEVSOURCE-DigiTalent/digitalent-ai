namespace DigiTalent.Application.UseCases.Competency.Ceilings;

public class UpdateOrganizationCeilingsUseCaseInput
{
    /// <summary>Trần doanh nghiệp cho mọi lĩnh vực của ma trận (một dòng mỗi lĩnh vực).</summary>
    public List<CeilingInputItem> Ceilings { get; set; } = new();
}
