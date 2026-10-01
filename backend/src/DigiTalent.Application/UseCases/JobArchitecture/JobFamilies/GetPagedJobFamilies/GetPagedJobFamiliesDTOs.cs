namespace DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;

public class GetPagedJobFamiliesUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
}

public class JobFamilyListItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class GetPagedJobFamiliesUseCaseOutput
{
    public List<JobFamilyListItemDto> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
}
