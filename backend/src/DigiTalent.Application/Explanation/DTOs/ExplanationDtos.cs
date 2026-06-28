namespace DigiTalent.Application.Explanation.DTOs;

public class AiExplanationResponse
{
    public Guid Id { get; set; }
    public string FeatureType { get; set; } = string.Empty;
    public string? SourceEntityType { get; set; }
    public Guid? SourceEntityId { get; set; }
    public string InputSnapshotJson { get; set; } = string.Empty;
    public string OutputText { get; set; } = string.Empty;
    public string? ModelProvider { get; set; }
    public string? ModelName { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
