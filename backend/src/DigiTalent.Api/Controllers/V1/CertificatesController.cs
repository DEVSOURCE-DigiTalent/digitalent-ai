using DigiTalent.Api.Authorization;
using DigiTalent.Application.Certificate.DTOs;
using DigiTalent.Application.Certificate.Services;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Shared.ApiResponse;
using DigiTalent.Shared.Constants;
using DigiTalent.Shared.Pagination;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1")]
[Produces("application/json")]
public class CertificatesController : ControllerBase
{
    private readonly CertificateService _certificateService;

    public CertificatesController(CertificateService certificateService)
        => _certificateService = certificateService;

    // ═══════════════════════════════════════
    // Certificate Templates
    // ═══════════════════════════════════════

    [HttpGet("certificate-templates")]
    [HasPermission(PermissionConstants.CertificateTemplateManage)]
    public async Task<IActionResult> SearchTemplates([FromQuery] PaginationRequest request)
    {
        if (request.PageIndex <= 1 && request.PageSize >= 1000)
            return Ok(ApiResponse<List<CertificateTemplateResponse>>.Ok(
                await _certificateService.GetAllTemplatesAsync()));

        return Ok(ApiResponse<PagedList<CertificateTemplateResponse>>.Ok(
            await _certificateService.SearchTemplatesAsync(request)));
    }

    [HttpPost("certificate-templates")]
    [HasPermission(PermissionConstants.CertificateTemplateManage)]
    [ProducesResponseType(typeof(ApiResponse<CertificateTemplateResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateCertificateTemplateRequest request)
    {
        var result = await _certificateService.CreateTemplateAsync(request);
        return CreatedAtAction(nameof(SearchTemplates), new { templateId = result.Id },
            ApiResponse<CertificateTemplateResponse>.Ok(result, "Template created"));
    }

    [HttpPut("certificate-templates/{templateId:guid}")]
    [HasPermission(PermissionConstants.CertificateTemplateManage)]
    public async Task<IActionResult> UpdateTemplate(Guid templateId, [FromBody] UpdateCertificateTemplateRequest request)
        => Ok(ApiResponse<CertificateTemplateResponse>.Ok(
            await _certificateService.UpdateTemplateAsync(templateId, request)));

    [HttpPatch("certificate-templates/{templateId:guid}/status")]
    [HasPermission(PermissionConstants.CertificateTemplateManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ChangeTemplateStatus(Guid templateId, [FromBody] StatusChangeRequest request)
    {
        await _certificateService.ChangeTemplateStatusAsync(templateId, request.Status);
        return NoContent();
    }

    // ═══════════════════════════════════════
    // Certificates
    // ═══════════════════════════════════════

    [HttpGet("certificates")]
    [HasPermission(PermissionConstants.CertificateRead)]
    public async Task<IActionResult> SearchCertificates([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<CertificateResponse>>.Ok(
            await _certificateService.SearchCertificatesAsync(request)));

    [HttpGet("certificates/{certificateId:guid}")]
    [HasPermission(PermissionConstants.CertificateRead)]
    public async Task<IActionResult> GetCertificate(Guid certificateId)
        => Ok(ApiResponse<CertificateDetailResponse>.Ok(
            await _certificateService.GetCertificateAsync(certificateId)));

    [HttpPost("certificates/issue")]
    [HasPermission(PermissionConstants.CertificateIssueManual)]
    [ProducesResponseType(typeof(ApiResponse<CertificateDetailResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> IssueCertificate([FromBody] IssueCertificateRequest request)
    {
        var result = await _certificateService.IssueCertificateAsync(request);
        return CreatedAtAction(nameof(GetCertificate), new { certificateId = result.Id },
            ApiResponse<CertificateDetailResponse>.Ok(result, "Certificate issued"));
    }

    [HttpPost("certificates/{certificateId:guid}/revoke")]
    [HasPermission(PermissionConstants.CertificateRevoke)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RevokeCertificate(Guid certificateId, [FromBody] RevokeCertificateRequest request)
    {
        await _certificateService.RevokeCertificateAsync(certificateId, request.Reason);
        return NoContent();
    }

    /// <summary>
    /// GET /api/v1/certificates/my
    /// Current user's certificates.
    /// </summary>
    [HttpGet("certificates/my")]
    [HasPermission(PermissionConstants.CertificateRead)]
    public async Task<IActionResult> GetMyCertificates([FromQuery] PaginationRequest request)
        => Ok(ApiResponse<PagedList<MyCertificateResponse>>.Ok(
            await _certificateService.GetMyCertificatesAsync(request)));

    /// <summary>
    /// POST /api/v1/certificates/{certificateId}/renew
    /// Renew or reissue a certificate.
    /// </summary>
    [HttpPost("certificates/{certificateId:guid}/renew")]
    [HasPermission(PermissionConstants.CertificateRevoke)]
    [ProducesResponseType(typeof(ApiResponse<CertificateDetailResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RenewCertificate(Guid certificateId, [FromBody] RenewCertificateRequest request)
        => Ok(ApiResponse<CertificateDetailResponse>.Ok(
            await _certificateService.RenewCertificateAsync(certificateId, request), "Certificate renewed"));

    // ═══════════════════════════════════════
    // Certificate Verification (Public)
    // ═══════════════════════════════════════

    /// <summary>
    /// GET /api/v1/certificates/verify/{code}
    /// Public endpoint — no authentication required.
    /// Returns minimal certificate validity data.
    /// </summary>
    [HttpGet("certificates/verify/{code}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<CertificateVerificationResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyCertificate(string code)
        => Ok(ApiResponse<CertificateVerificationResponse>.Ok(
            await _certificateService.VerifyCertificateAsync(code)));
}
