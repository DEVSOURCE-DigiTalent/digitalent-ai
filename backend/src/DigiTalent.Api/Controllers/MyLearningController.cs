using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.MyLearning;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/my/learning")]
public class MyLearningController : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.Learning.ReadProgress)]
    public async Task<ActionResult<ApiResponse<GetMyLearningOutput>>> GetMyLearning(
        [FromQuery] GetMyLearningInput input,
        [FromServices] IUseCase<GetMyLearningInput, GetMyLearningOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetMyLearningOutput>.Ok(result));
    }
}
