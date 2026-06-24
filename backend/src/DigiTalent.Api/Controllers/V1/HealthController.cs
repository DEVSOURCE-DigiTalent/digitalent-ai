using DigiTalent.Shared.ApiResponse;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers.V1;

[ApiController]
[Route("api/v1/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(ApiResponse.Ok(new
        {
            status = "Healthy",
            service = "DigiTalent AI API",
            version = "v1",
            timestamp = DateTimeOffset.UtcNow
        }));
    }
}
