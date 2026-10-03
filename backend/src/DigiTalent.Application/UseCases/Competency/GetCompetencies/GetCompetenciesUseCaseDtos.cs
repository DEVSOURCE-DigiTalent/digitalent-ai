namespace DigiTalent.Application.UseCases.Competency;

public class GetCompetenciesUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CompetencyType { get; set; }
    public string? Status { get; set; }
}

public class CompetencyListItem
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    /// <summary>Thứ tự nhóm (miền 1–6 với khung Thông tư 02/2025).</summary>
    public int CategorySortOrder { get; set; }
    /// <summary>Mã năng lực trong Thông tư 02/2025 (ví dụ "4.2"); null nếu năng lực nội bộ không mapping.</summary>
    public string? FrameworkCode { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CompetencyType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CriteriaCount { get; set; }
}

public class GetCompetenciesUseCaseOutput
{
    public List<CompetencyListItem> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}
