using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Courses;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Application.UseCases.Platform.Organizations;
using DigiTalent.Application.UseCases.Platform.Overview;
using DigiTalent.Application.UseCases.Platform.Users;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Platform Admin console (Pulse redesign, docs/ui-redesign/16 §12.4 and §12.6): overview, the six-domain Digital AI
/// standard, the 18 standard courses, organizations, users, seat orders and the audit log, across every organization.
/// </summary>
[ApiController]
[Route("api/v1/platform")]
public class PlatformAdminController : ControllerBase
{
    // GET api/v1/platform/overview
    [HttpGet("overview")]
    [HasPermission(Permissions.Platform.OrganizationRead)]
    public async Task<ActionResult<ApiResponse<GetPlatformOverviewUseCaseOutput>>> GetOverview(
        [FromServices] IUseCase<GetPlatformOverviewUseCaseInput, GetPlatformOverviewUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformOverviewUseCaseInput());
        return Ok(ApiResponse<GetPlatformOverviewUseCaseOutput>.Ok(result));
    }

    // ----- Framework ---------------------------------------------------------------------------

    // GET api/v1/platform/framework
    [HttpGet("framework")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkOutput>>> GetFramework(
        [FromServices] IUseCase<GetPlatformFrameworkUseCaseInput, PlatformFrameworkOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformFrameworkUseCaseInput());
        return Ok(ApiResponse<PlatformFrameworkOutput>.Ok(result));
    }

    // PUT api/v1/platform/framework/draft — body { domains: [{ code, description }] }
    [HttpPut("framework/draft")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkOutput>>> SaveFrameworkDraft(
        [FromBody] SavePlatformFrameworkDraftUseCaseInput input,
        [FromServices] IUseCase<SavePlatformFrameworkDraftUseCaseInput, PlatformFrameworkOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformFrameworkOutput>.Ok(result, "Framework draft saved."));
    }

    // POST api/v1/platform/framework/publish — body { releaseNote? }
    [HttpPost("framework/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkOutput>>> PublishFramework(
        [FromBody] PublishPlatformFrameworkUseCaseInput input,
        [FromServices] IUseCase<PublishPlatformFrameworkUseCaseInput, PlatformFrameworkOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformFrameworkOutput>.Ok(result, "Framework published."));
    }

    // ----- Courses -----------------------------------------------------------------------------

    // GET api/v1/platform/courses
    [HttpGet("courses")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<GetPlatformCoursesUseCaseOutput>>> GetCourses(
        [FromServices] IUseCase<GetPlatformCoursesUseCaseInput, GetPlatformCoursesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformCoursesUseCaseInput());
        return Ok(ApiResponse<GetPlatformCoursesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/platform/courses/{code}
    [HttpGet("courses/{code}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformCourseDetailOutput>>> GetCourse(
        string code,
        [FromServices] IUseCase<GetPlatformCourseDetailUseCaseInput, PlatformCourseDetailOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformCourseDetailUseCaseInput { Code = code });
        return Ok(ApiResponse<PlatformCourseDetailOutput>.Ok(result));
    }

    // PUT api/v1/platform/courses/{code}/draft — body { title, outcome, pricePerSeat, salesStatus }
    [HttpPut("courses/{code}/draft")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCourseDetailOutput>>> SaveCourseDraft(
        string code,
        [FromBody] SavePlatformCourseDraftUseCaseInput input,
        [FromServices] IUseCase<SavePlatformCourseDraftUseCaseInput, PlatformCourseDetailOutput> useCase)
    {
        input.Code = code;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformCourseDetailOutput>.Ok(result, "Course draft saved."));
    }

    // POST api/v1/platform/courses/{code}/publish
    [HttpPost("courses/{code}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCourseDetailOutput>>> PublishCourse(
        string code,
        [FromServices] IUseCase<PublishPlatformCourseUseCaseInput, PlatformCourseDetailOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new PublishPlatformCourseUseCaseInput { Code = code });
        return Ok(ApiResponse<PlatformCourseDetailOutput>.Ok(result, "Course published."));
    }

    // POST api/v1/platform/courses/{code}/questions — body { questionText, correctAnswer, explanation }
    [HttpPost("courses/{code}/questions")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCourseDetailOutput>>> AddCourseQuestion(
        string code,
        [FromBody] AddPlatformCourseQuestionUseCaseInput input,
        [FromServices] IUseCase<AddPlatformCourseQuestionUseCaseInput, PlatformCourseDetailOutput> useCase)
    {
        input.Code = code;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformCourseDetailOutput>.Ok(result, "Question added to the draft."));
    }

    // ----- Organizations -----------------------------------------------------------------------

    // GET api/v1/platform/organizations?search=&status=&stage=&pageIndex=&pageSize=
    [HttpGet("organizations")]
    [HasPermission(Permissions.Platform.OrganizationRead)]
    public async Task<ActionResult<ApiResponse<GetPlatformOrganizationsUseCaseOutput>>> GetOrganizations(
        [FromQuery] GetPlatformOrganizationsUseCaseInput input,
        [FromServices] IUseCase<GetPlatformOrganizationsUseCaseInput, GetPlatformOrganizationsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPlatformOrganizationsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/platform/organizations/{id}
    [HttpGet("organizations/{id:guid}")]
    [HasPermission(Permissions.Platform.OrganizationRead)]
    public async Task<ActionResult<ApiResponse<PlatformOrganizationDetailOutput>>> GetOrganization(
        Guid id,
        [FromServices] IUseCase<GetPlatformOrganizationDetailUseCaseInput, PlatformOrganizationDetailOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformOrganizationDetailUseCaseInput { Id = id });
        return Ok(ApiResponse<PlatformOrganizationDetailOutput>.Ok(result));
    }

    // POST api/v1/platform/organizations/{id}/seat-grants — body { courseCode, seats, reason }
    [HttpPost("organizations/{id:guid}/seat-grants")]
    [HasPermission(Permissions.Platform.OrganizationManage)]
    public async Task<ActionResult<ApiResponse<PlatformOrganizationDetailOutput>>> GrantSeats(
        Guid id,
        [FromBody] GrantPlatformCourseSeatsUseCaseInput input,
        [FromServices] IUseCase<GrantPlatformCourseSeatsUseCaseInput, PlatformOrganizationDetailOutput> useCase)
    {
        input.OrganizationId = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformOrganizationDetailOutput>.Ok(result, "Seats granted."));
    }

    // POST api/v1/platform/organizations/{id}/suspend — body { reason }
    [HttpPost("organizations/{id:guid}/suspend")]
    [HasPermission(Permissions.Platform.OrganizationManage)]
    public Task<ActionResult<ApiResponse<PlatformOrganizationDetailOutput>>> SuspendOrganization(
        Guid id,
        [FromBody] ChangePlatformOrganizationStatusUseCaseInput input,
        [FromServices] IUseCase<ChangePlatformOrganizationStatusUseCaseInput, PlatformOrganizationDetailOutput> useCase) =>
        ChangeOrganizationStatus(id, true, input, useCase, "Organization suspended.");

    // POST api/v1/platform/organizations/{id}/restore — body { reason }
    [HttpPost("organizations/{id:guid}/restore")]
    [HasPermission(Permissions.Platform.OrganizationManage)]
    public Task<ActionResult<ApiResponse<PlatformOrganizationDetailOutput>>> RestoreOrganization(
        Guid id,
        [FromBody] ChangePlatformOrganizationStatusUseCaseInput input,
        [FromServices] IUseCase<ChangePlatformOrganizationStatusUseCaseInput, PlatformOrganizationDetailOutput> useCase) =>
        ChangeOrganizationStatus(id, false, input, useCase, "Organization restored.");

    private async Task<ActionResult<ApiResponse<PlatformOrganizationDetailOutput>>> ChangeOrganizationStatus(
        Guid id,
        bool suspend,
        ChangePlatformOrganizationStatusUseCaseInput input,
        IUseCase<ChangePlatformOrganizationStatusUseCaseInput, PlatformOrganizationDetailOutput> useCase,
        string message)
    {
        input.OrganizationId = id;
        input.Suspend = suspend;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformOrganizationDetailOutput>.Ok(result, message));
    }

    // ----- Users -------------------------------------------------------------------------------

    // GET api/v1/platform/users?search=&role=&status=&organizationId=&pageIndex=&pageSize=
    [HttpGet("users")]
    [HasPermission(Permissions.Platform.UserRead)]
    public async Task<ActionResult<ApiResponse<GetPlatformUsersUseCaseOutput>>> GetUsers(
        [FromQuery] GetPlatformUsersUseCaseInput input,
        [FromServices] IUseCase<GetPlatformUsersUseCaseInput, GetPlatformUsersUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPlatformUsersUseCaseOutput>.Ok(result));
    }

    // GET api/v1/platform/users/{id}
    [HttpGet("users/{id:guid}")]
    [HasPermission(Permissions.Platform.UserRead)]
    public async Task<ActionResult<ApiResponse<PlatformUserDetailOutput>>> GetUser(
        Guid id,
        [FromServices] IUseCase<GetPlatformUserDetailUseCaseInput, PlatformUserDetailOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformUserDetailUseCaseInput { Id = id });
        return Ok(ApiResponse<PlatformUserDetailOutput>.Ok(result));
    }

    // POST api/v1/platform/users/{id}/lock — body { reason }
    [HttpPost("users/{id:guid}/lock")]
    [HasPermission(Permissions.Platform.UserManage)]
    public Task<ActionResult<ApiResponse<PlatformUserDetailOutput>>> LockUser(
        Guid id,
        [FromBody] ChangePlatformUserLockUseCaseInput input,
        [FromServices] IUseCase<ChangePlatformUserLockUseCaseInput, PlatformUserDetailOutput> useCase) =>
        ChangeUserLock(id, true, input, useCase, "User locked.");

    // POST api/v1/platform/users/{id}/unlock — body { reason }
    [HttpPost("users/{id:guid}/unlock")]
    [HasPermission(Permissions.Platform.UserManage)]
    public Task<ActionResult<ApiResponse<PlatformUserDetailOutput>>> UnlockUser(
        Guid id,
        [FromBody] ChangePlatformUserLockUseCaseInput input,
        [FromServices] IUseCase<ChangePlatformUserLockUseCaseInput, PlatformUserDetailOutput> useCase) =>
        ChangeUserLock(id, false, input, useCase, "User unlocked.");

    private async Task<ActionResult<ApiResponse<PlatformUserDetailOutput>>> ChangeUserLock(
        Guid id,
        bool lockUser,
        ChangePlatformUserLockUseCaseInput input,
        IUseCase<ChangePlatformUserLockUseCaseInput, PlatformUserDetailOutput> useCase,
        string message)
    {
        input.UserId = id;
        input.Lock = lockUser;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<PlatformUserDetailOutput>.Ok(result, message));
    }

    // ----- Commerce and audit ------------------------------------------------------------------

    // GET api/v1/platform/commerce?kind=&search=&pageIndex=&pageSize=
    [HttpGet("commerce")]
    [HasPermission(Permissions.Platform.CommerceRead)]
    public async Task<ActionResult<ApiResponse<GetPlatformCommerceUseCaseOutput>>> GetCommerce(
        [FromQuery] GetPlatformCommerceUseCaseInput input,
        [FromServices] IUseCase<GetPlatformCommerceUseCaseInput, GetPlatformCommerceUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPlatformCommerceUseCaseOutput>.Ok(result));
    }

    // GET api/v1/platform/audit-logs?scope=platform|all&action=&search=&pageIndex=&pageSize=
    [HttpGet("audit-logs")]
    [HasPermission(Permissions.System.AuditLogReadSystem)]
    public async Task<ActionResult<ApiResponse<GetPlatformAuditLogsUseCaseOutput>>> GetAuditLogs(
        [FromQuery] GetPlatformAuditLogsUseCaseInput input,
        [FromServices] IUseCase<GetPlatformAuditLogsUseCaseInput, GetPlatformAuditLogsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPlatformAuditLogsUseCaseOutput>.Ok(result));
    }
}
