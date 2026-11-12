using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>Mentor: danh sách doanh nghiệp thuộc phạm vi phụ trách kèm tổng hợp bài cuối cấp.</summary>
[ApiController]
[Route("api/v1/mentor/enterprises")]
public class MentorEnterprisesController : ControllerBase
{
    // GET api/v1/mentor/enterprises
    [HttpGet]
    [HasPermission(Permissions.Trial.Review)]
    public async Task<ActionResult<ApiResponse<GetMentorEnterprisesUseCaseOutput>>> GetList(
        [FromServices] IUseCase<GetMentorEnterprisesUseCaseInput, GetMentorEnterprisesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMentorEnterprisesUseCaseInput());
        return Ok(ApiResponse<GetMentorEnterprisesUseCaseOutput>.Ok(result));
    }
}
