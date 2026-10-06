using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Certificates;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/certificates")]
public class CertificatesController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Certificate.Read)]
    public async Task<ActionResult<ApiResponse<GetCertificatesOutput>>> GetCertificates(
        [FromQuery] GetCertificatesInput input,
        [FromServices] IUseCase<GetCertificatesInput, GetCertificatesOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCertificatesOutput>.Ok(result));
    }
}
