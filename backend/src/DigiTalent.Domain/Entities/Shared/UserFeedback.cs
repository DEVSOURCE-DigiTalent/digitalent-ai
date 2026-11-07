using DigiTalent.Domain.Common;

namespace DigiTalent.Domain.Entities;

public class UserFeedback : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PageUrl { get; set; }
    public string Status { get; set; } = "OPEN";
    public int? Rating { get; set; }
    public List<string>? Screenshots { get; set; }
    public string? AdminNote { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}
