using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformAuditLogsUseCaseInput : PaginationRequest
{
    /// <summary>"platform" (default) = actions without an organization (Platform Admin work); "all" = every entry.</summary>
    public string? Scope { get; set; }
    public string? Action { get; set; }
}
