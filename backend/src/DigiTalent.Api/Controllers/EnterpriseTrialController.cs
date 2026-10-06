using DigiTalent.Api.Common;
using DigiTalent.Application.Trial;
using DigiTalent.Infrastructure.Trial;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/enterprise-trial")]
[Authorize]
[EnableRateLimiting("enterprise-trial")]
public sealed class EnterpriseTrialController(TrialService trial) : ControllerBase
{
    [HttpGet("readiness"), AllowAnonymous]
    public IActionResult Readiness() => Ok(ApiResponse<TrialReadinessDto>.Ok(trial.Readiness()));

    [HttpGet("catalog"), AllowAnonymous]
    public IActionResult Catalog() => Ok(ApiResponse<TrialEligiblePositionDto[]>.Ok(trial.Catalog()));

    [HttpPost("register"), AllowAnonymous]
    public async Task<IActionResult> Register(TrialRegistrationRequest request) => Ok(ApiResponse<TrialRegistrationDto>.Ok(await trial.RegisterAsync(request)));

    [HttpPost("verify"), AllowAnonymous]
    public async Task<IActionResult> Verify(TrialTokenRequest request) => Ok(ApiResponse<TrialAccountDto>.Ok(await trial.VerifyAsync(request.Token)));

    [HttpPost("accept"), AllowAnonymous]
    public async Task<IActionResult> Accept(TrialAcceptRequest request) => Ok(ApiResponse<TrialAccountDto>.Ok(await trial.AcceptAsync(request)));

    [HttpGet("context")]
    public async Task<IActionResult> Context() => Ok(ApiResponse<TrialContextDto>.Ok(await trial.ContextAsync()));

    [HttpPost("position")]
    public async Task<IActionResult> Position(TrialSelectionRequest request) => Ok(ApiResponse<TrialContextDto>.Ok(await trial.SelectPositionAsync(request)));

    [HttpGet("invitations")]
    public async Task<IActionResult> Invitations() => Ok(ApiResponse<TrialInvitationDto[]>.Ok(await trial.InvitationsAsync()));

    [HttpPost("invitations")]
    public async Task<IActionResult> Invite(TrialInviteRequest request) => Ok(ApiResponse<TrialInvitationDto>.Ok(await trial.InviteAsync(request)));

    [HttpPost("invitations/{id:guid}/resend")]
    public async Task<IActionResult> Resend(Guid id) => Ok(ApiResponse<TrialInvitationDto>.Ok(await trial.ResendAsync(id)));

    [HttpGet("diagnostic")]
    public async Task<IActionResult> Diagnostic() => Ok(ApiResponse<TrialDiagnosticDto?>.Ok(await trial.DiagnosticAsync()));

    [HttpPost("diagnostic")]
    public async Task<IActionResult> Start() => Ok(ApiResponse<TrialDiagnosticDto>.Ok(await trial.StartAsync()));

    [HttpPut("diagnostic/{id:guid}/answers")]
    public async Task<IActionResult> Answers(Guid id, TrialSaveAnswersRequest request) => Ok(ApiResponse<TrialDiagnosticDto>.Ok(await trial.SaveAnswersAsync(id, request)));

    [HttpPost("diagnostic/{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id) => Ok(ApiResponse<TrialGapResultDto>.Ok(await trial.SubmitAsync(id)));

    [HttpGet("result")]
    public async Task<IActionResult> Result() => Ok(ApiResponse<TrialGapResultDto?>.Ok(await trial.ResultAsync()));

    [HttpGet("path")]
    public async Task<IActionResult> Path() => Ok(ApiResponse<TrialLearningPathDto?>.Ok(await trial.PathAsync()));

    [HttpPost("path/items/{id}/start")]
    public async Task<IActionResult> StartItem(string id) => Ok(ApiResponse<TrialLearningPathDto>.Ok(await trial.StartItemAsync(id)));

    [HttpPut("path/items/{id}/progress")]
    public async Task<IActionResult> Progress(string id, TrialProgressRequest request) => Ok(ApiResponse<TrialLearningPathDto>.Ok(await trial.ProgressAsync(id, request)));

    [HttpGet("path/items/{id}/content")]
    public async Task<IActionResult> LearningContent(string id) => Ok(ApiResponse<TrialLearningContentDto>.Ok(await trial.ContentAsync(id)));

    [HttpGet("results")]
    public async Task<IActionResult> Results() => Ok(ApiResponse<TrialResultRowDto[]>.Ok(await trial.ResultsAsync()));

    [HttpPost("conversion/request")]
    public async Task<IActionResult> RequestConversion() => Ok(ApiResponse<TrialContextDto>.Ok(await trial.RequestConversionAsync()));

    [HttpPost("organizations/{organizationId:guid}/convert")]
    public async Task<IActionResult> Convert(Guid organizationId, TrialConversionRequest request)
    { await trial.ConvertAsync(organizationId, request.Reference); return Ok(ApiResponse<object>.Ok(new { organizationId, status = "converted" })); }
}
