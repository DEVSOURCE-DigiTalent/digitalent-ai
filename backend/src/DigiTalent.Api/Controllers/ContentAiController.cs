using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning.ContentAi;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// AI help in the course builder, shared by the platform admin (catalog draft) and the company R&amp;D (company draft):
/// suggest a module's content and check it against Circular 02/2025. The builder sends the module; nothing is saved.
/// </summary>
[ApiController]
[Route("api/v1/content-ai")]
public class ContentAiController : ControllerBase
{
    // POST api/v1/content-ai/module/suggest — body { courseCode, moduleIndex, competencyCode?, moduleTitle?, lessons[], questions[] }
    [HttpPost("module/suggest")]
    [HasPermission(Permissions.Platform.CatalogManage, Permissions.Research.ManageCourses)]
    public async Task<ActionResult<ApiResponse<ModuleContentSuggestionOutput>>> Suggest(
        [FromBody] SuggestModuleContentUseCaseInput input,
        [FromServices] IUseCase<SuggestModuleContentUseCaseInput, ModuleContentSuggestionOutput> useCase) =>
        Ok(ApiResponse<ModuleContentSuggestionOutput>.Ok(await useCase.ExecuteAsync(input)));

    // POST api/v1/content-ai/module/rewrite-page — same body + { pageNumber, notes[] }
    [HttpPost("module/rewrite-page")]
    [HasPermission(Permissions.Platform.CatalogManage, Permissions.Research.ManageCourses)]
    public async Task<ActionResult<ApiResponse<RewrittenPageOutput>>> RewritePage(
        [FromBody] RewriteModulePageUseCaseInput input,
        [FromServices] IUseCase<RewriteModulePageUseCaseInput, RewrittenPageOutput> useCase) =>
        Ok(ApiResponse<RewrittenPageOutput>.Ok(await useCase.ExecuteAsync(input)));

    // POST api/v1/content-ai/module/check — same body
    [HttpPost("module/check")]
    [HasPermission(Permissions.Platform.CatalogManage, Permissions.Research.ManageCourses)]
    public async Task<ActionResult<ApiResponse<ModuleContentCheckOutput>>> Check(
        [FromBody] CheckModuleContentUseCaseInput input,
        [FromServices] IUseCase<CheckModuleContentUseCaseInput, ModuleContentCheckOutput> useCase) =>
        Ok(ApiResponse<ModuleContentCheckOutput>.Ok(await useCase.ExecuteAsync(input)));
}
