using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.Lessons;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/lessons")]
public class LessonsController : ControllerBase
{
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<LessonContentOutput>>> GetLesson(
        Guid id,
        [FromServices] IUseCase<GetLessonInput, LessonContentOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetLessonInput { Id = id });
        return Ok(ApiResponse<LessonContentOutput>.Ok(result));
    }

    [HttpPost("{id:guid}/complete")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<CompleteLessonOutput>>> CompleteLesson(
        Guid id,
        [FromServices] IUseCase<CompleteLessonInput, CompleteLessonOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CompleteLessonInput { LessonId = id });
        return Ok(ApiResponse<CompleteLessonOutput>.Ok(result));
    }
}
