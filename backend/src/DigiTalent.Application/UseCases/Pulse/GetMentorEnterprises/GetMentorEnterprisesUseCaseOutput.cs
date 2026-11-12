namespace DigiTalent.Application.UseCases.Pulse;

public class GetMentorEnterprisesUseCaseOutput
{
    public int TotalEnterprises { get; set; }
    public int PendingCount { get; set; }
    public int AttentionCount { get; set; }
    public int ReviewedCount { get; set; }
    public List<MentorEnterpriseItemDto> Items { get; set; } = new();
}

public class MentorEnterpriseItemDto
{
    public Guid OrganizationId { get; set; }
    public string OrganizationCode { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    /// <summary>TRIAL | OFFICIAL.</summary>
    public string Stage { get; set; } = "OFFICIAL";
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public int DepartmentCount { get; set; }
    public int EmployeeCount { get; set; }
    public int PendingCount { get; set; }
    public int RetryCount { get; set; }
    public int FlaggedCount { get; set; }
    public int ReviewedCount { get; set; }
    public int TotalSubmissions { get; set; }
    public DateTimeOffset? LatestSubmittedAt { get; set; }
    public DateTimeOffset? AssignedAt { get; set; }
}
