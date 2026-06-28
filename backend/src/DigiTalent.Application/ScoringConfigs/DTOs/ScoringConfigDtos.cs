namespace DigiTalent.Application.ScoringConfigs.DTOs;

public class ScoringConfigResponse
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string ConfigType { get; set; } = string.Empty;
    public int Version { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }
    public List<ScoringConfigItemResponse> Items { get; set; } = new();
}

public class ScoringConfigItemResponse
{
    public Guid Id { get; set; }
    public string ComponentCode { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public string? Notes { get; set; }
}

public class UpdateScoringConfigRequest
{
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public List<UpdateScoringConfigItem> Items { get; set; } = new();
}

public class UpdateScoringConfigItem
{
    public Guid? Id { get; set; }
    public string ComponentCode { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public string? Notes { get; set; }
}
