using DigiTalent.Api.Authorization;
using DigiTalent.Application.AuditLogs.DTOs;
using DigiTalent.Application.AuditLogs.Services;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1/audit-logs")]
[Produces("application/json")]
public class AuditLogsController : ControllerBase
{
    private readonly AuditLogSearchService _auditLogSearchService;

    public AuditLogsController(AuditLogSearchService auditLogSearchService)
    {
        _auditLogSearchService = auditLogSearchService;
    }

    /// <summary>
    /// Search audit logs. SYS_ADMIN sees all; HR_MANAGER sees organization-scoped.
    /// </summary>
    [HttpGet]
    [HasPermission(PermissionConstants.AuditLogReadSystem)]
    public async Task<IActionResult> Search([FromQuery] AuditLogSearchRequest request)
        => Ok(ApiResponse<PagedList<AuditLogResponse>>.Ok(
            await _auditLogSearchService.SearchAsync(request)));
}
