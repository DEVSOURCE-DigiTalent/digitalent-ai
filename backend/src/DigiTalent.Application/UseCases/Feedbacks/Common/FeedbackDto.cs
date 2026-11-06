namespace DigiTalent.Application.UseCases.Feedbacks;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? Rating { get; set; }
    public List<string>? Screenshots { get; set; }
    public string? AdminNote { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }

    // Only for admin list
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? OrganizationName { get; set; }
}
