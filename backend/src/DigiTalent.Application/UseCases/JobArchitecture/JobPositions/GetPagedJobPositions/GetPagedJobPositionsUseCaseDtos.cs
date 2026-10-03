namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class GetPagedJobPositionsUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? JobFamilyId { get; set; }
}

public class JobPositionListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid? JobFamilyId { get; set; }
    public string? JobFamilyName { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class GetPagedJobPositionsUseCaseOutput
{
    public List<JobPositionListItem> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}
