using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Platform Admin — frameworks, catalog versions and the course builder (docs/specs/2026-10-15-platform-admin-v2.md).
/// Courses are added and edited only in the draft version; publishing it moves the anchor (the version in use).
/// Removing modules, blocks or questions edits the draft's working copy; published versions are never changed.
/// </summary>
[ApiController]
[Route("api/v1/platform")]
public class PlatformCatalogController : ControllerBase
{
    /// <summary>Largest upload accepted (a 500 MB video plus multipart overhead).</summary>
    private const long MaxUploadBytes = 520L * 1024 * 1024;

    // ----- Frameworks --------------------------------------------------------------------------

    // GET api/v1/platform/frameworks
    [HttpGet("frameworks")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworksOutput>>> GetFrameworks(
        [FromServices] IUseCase<GetPlatformFrameworksUseCaseInput, PlatformFrameworksOutput> useCase) =>
        Ok(ApiResponse<PlatformFrameworksOutput>.Ok(await useCase.ExecuteAsync(new GetPlatformFrameworksUseCaseInput())));

    // GET api/v1/platform/frameworks/{id}
    [HttpGet("frameworks/{id:guid}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> GetFramework(
        Guid id,
        [FromServices] IUseCase<GetPlatformFrameworkDetailUseCaseInput, PlatformFrameworkDetail> useCase) =>
        Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(new GetPlatformFrameworkDetailUseCaseInput { FrameworkId = id })));

    // PUT api/v1/platform/frameworks/{id}/draft — body { domains: [{ domainId, description }] }
    [HttpPut("frameworks/{id:guid}/draft")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> SaveFrameworkDraft(
        Guid id,
        [FromBody] SavePlatformFrameworkDraftUseCaseInput input,
        [FromServices] IUseCase<SavePlatformFrameworkDraftUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Framework draft saved."));
    }

    // POST api/v1/platform/frameworks/{id}/publish — body { releaseNote? }
    [HttpPost("frameworks/{id:guid}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> PublishFramework(
        Guid id,
        [FromBody] PublishPlatformFrameworkUseCaseInput input,
        [FromServices] IUseCase<PublishPlatformFrameworkUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Framework published."));
    }

    // POST api/v1/platform/frameworks/{id}/domains — body { name, description? }
    [HttpPost("frameworks/{id:guid}/domains")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> AddFrameworkDomain(
        Guid id,
        [FromBody] AddPlatformFrameworkDomainUseCaseInput input,
        [FromServices] IUseCase<AddPlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Domain added."));
    }

    // PUT api/v1/platform/frameworks/{id}/domains/{domainId} — body { name, description? } (sửa lĩnh vực)
    [HttpPut("frameworks/{id:guid}/domains/{domainId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> UpdateFrameworkDomain(
        Guid id,
        Guid domainId,
        [FromBody] UpdatePlatformFrameworkDomainUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase)
    {
        input.FrameworkId = id;
        input.DomainId = domainId;
        return Ok(ApiResponse<PlatformFrameworkDetail>.Ok(await useCase.ExecuteAsync(input), "Domain updated."));
    }

    // DELETE api/v1/platform/frameworks/{id}/domains/{domainId} — xóa lĩnh vực = archive; only without courses
    [HttpDelete("frameworks/{id:guid}/domains/{domainId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformFrameworkDetail>>> ArchiveFrameworkDomain(
        Guid id,
        Guid domainId,
        [FromServices] IUseCase<ArchivePlatformFrameworkDomainUseCaseInput, PlatformFrameworkDetail> useCase) =>
        Ok(ApiResponse<PlatformFrameworkDetail>.Ok(
            await useCase.ExecuteAsync(new ArchivePlatformFrameworkDomainUseCaseInput { FrameworkId = id, DomainId = domainId }),
            "Domain archived."));

    // ----- Catalog versions --------------------------------------------------------------------

    // GET api/v1/platform/catalog/versions
    [HttpGet("catalog/versions")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionsOutput>>> GetVersions(
        [FromServices] IUseCase<GetPlatformCatalogVersionsUseCaseInput, PlatformCatalogVersionsOutput> useCase) =>
        Ok(ApiResponse<PlatformCatalogVersionsOutput>.Ok(await useCase.ExecuteAsync(new GetPlatformCatalogVersionsUseCaseInput())));

    // POST api/v1/platform/catalog/versions — creates the draft from the version in use
    [HttpPost("catalog/versions")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionDetail>>> CreateDraft(
        [FromServices] IUseCase<CreatePlatformCatalogDraftUseCaseInput, PlatformCatalogVersionDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogVersionDetail>.Ok(await useCase.ExecuteAsync(new CreatePlatformCatalogDraftUseCaseInput()), "Draft created."));

    // GET api/v1/platform/catalog/versions/{versionNo}
    [HttpGet("catalog/versions/{versionNo:int}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionDetail>>> GetVersion(
        int versionNo,
        [FromServices] IUseCase<GetPlatformCatalogVersionUseCaseInput, PlatformCatalogVersionDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogVersionDetail>.Ok(await useCase.ExecuteAsync(new GetPlatformCatalogVersionUseCaseInput { VersionNo = versionNo })));

    // GET api/v1/platform/catalog/versions/{versionNo}/publish-check
    [HttpGet("catalog/versions/{versionNo:int}/publish-check")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformPublishCheck>>> GetPublishCheck(
        int versionNo,
        [FromServices] IUseCase<GetPlatformCatalogPublishCheckUseCaseInput, PlatformPublishCheck> useCase) =>
        Ok(ApiResponse<PlatformPublishCheck>.Ok(await useCase.ExecuteAsync(new GetPlatformCatalogPublishCheckUseCaseInput { VersionNo = versionNo })));

    // POST api/v1/platform/catalog/versions/{versionNo}/publish — body { releaseNote? }
    [HttpPost("catalog/versions/{versionNo:int}/publish")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionDetail>>> PublishVersion(
        int versionNo,
        [FromBody] PublishPlatformCatalogVersionUseCaseInput input,
        [FromServices] IUseCase<PublishPlatformCatalogVersionUseCaseInput, PlatformCatalogVersionDetail> useCase)
    {
        input.VersionNo = versionNo;
        return Ok(ApiResponse<PlatformCatalogVersionDetail>.Ok(await useCase.ExecuteAsync(input), "Version published."));
    }

    // PUT api/v1/platform/catalog/versions/{versionNo}/prices — body { items: [{ courseId, pricePerSeat, salesStatus }] }
    [HttpPut("catalog/versions/{versionNo:int}/prices")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionDetail>>> UpdatePrices(
        int versionNo,
        [FromBody] UpdatePlatformCatalogPricesUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformCatalogPricesUseCaseInput, PlatformCatalogVersionDetail> useCase)
    {
        input.VersionNo = versionNo;
        return Ok(ApiResponse<PlatformCatalogVersionDetail>.Ok(await useCase.ExecuteAsync(input), "Draft prices saved."));
    }

    // ----- Courses in a version ----------------------------------------------------------------

    // POST api/v1/platform/catalog/versions/{versionNo}/courses — body { code, title, domainId, level }
    [HttpPost("catalog/versions/{versionNo:int}/courses")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> CreateCourse(
        int versionNo,
        [FromBody] CreatePlatformCatalogCourseUseCaseInput input,
        [FromServices] IUseCase<CreatePlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input), "Course added to the draft."));
    }

    // GET api/v1/platform/catalog/versions/{versionNo}/courses/{courseId}
    [HttpGet("catalog/versions/{versionNo:int}/courses/{courseId:guid}")]
    [HasPermission(Permissions.Platform.CatalogRead)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> GetCourse(
        int versionNo,
        Guid courseId,
        [FromServices] IUseCase<GetPlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(new GetPlatformCatalogCourseUseCaseInput { VersionNo = versionNo, CourseId = courseId })));

    // PUT api/v1/platform/catalog/versions/{versionNo}/courses/{courseId} — body { code?, title, outcome, domainId, level, pricePerSeat, salesStatus }
    [HttpPut("catalog/versions/{versionNo:int}/courses/{courseId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> UpdateCourse(
        int versionNo,
        Guid courseId,
        [FromBody] UpdatePlatformCatalogCourseUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // DELETE api/v1/platform/catalog/versions/{versionNo}/courses/{courseId} — only a course added in this draft
    [HttpDelete("catalog/versions/{versionNo:int}/courses/{courseId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogVersionDetail>>> RemoveCourse(
        int versionNo,
        Guid courseId,
        [FromServices] IUseCase<RemovePlatformCatalogCourseUseCaseInput, PlatformCatalogVersionDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogVersionDetail>.Ok(
            await useCase.ExecuteAsync(new RemovePlatformCatalogCourseUseCaseInput { VersionNo = versionNo, CourseId = courseId }), "Course removed from the draft."));

    // PUT api/v1/platform/catalog/versions/{versionNo}/courses/{courseId}/final — body { title, promptHtml, criteria: [] }
    [HttpPut("catalog/versions/{versionNo:int}/courses/{courseId:guid}/final")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> UpdateFinal(
        int versionNo,
        Guid courseId,
        [FromBody] UpdatePlatformCourseFinalUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformCourseFinalUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // ----- Modules -----------------------------------------------------------------------------

    // POST …/courses/{courseId}/modules — body { title }
    [HttpPost("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> AddModule(
        int versionNo,
        Guid courseId,
        [FromBody] AddPlatformCourseModuleUseCaseInput input,
        [FromServices] IUseCase<AddPlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // PUT …/courses/{courseId}/modules/{moduleId} — body { title, quizTitle? }
    [HttpPut("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules/{moduleId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> UpdateModule(
        int versionNo,
        Guid courseId,
        Guid moduleId,
        [FromBody] UpdatePlatformCourseModuleUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.ModuleId = moduleId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // DELETE …/courses/{courseId}/modules/{moduleId}
    [HttpDelete("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules/{moduleId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> RemoveModule(
        int versionNo,
        Guid courseId,
        Guid moduleId,
        [FromServices] IUseCase<RemovePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(
            await useCase.ExecuteAsync(new RemovePlatformCourseModuleUseCaseInput { VersionNo = versionNo, CourseId = courseId, ModuleId = moduleId })));

    // POST …/courses/{courseId}/modules/{moduleId}/move — body { toIndex }
    [HttpPost("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules/{moduleId:guid}/move")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> MoveModule(
        int versionNo,
        Guid courseId,
        Guid moduleId,
        [FromBody] MovePlatformCourseModuleUseCaseInput input,
        [FromServices] IUseCase<MovePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.ModuleId = moduleId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // ----- Blocks ------------------------------------------------------------------------------

    // POST …/courses/{courseId}/modules/{moduleId}/blocks — body { type: TEXT|SLIDE|IMAGE|VIDEO, position? }
    [HttpPost("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules/{moduleId:guid}/blocks")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> AddBlock(
        int versionNo,
        Guid courseId,
        Guid moduleId,
        [FromBody] AddPlatformModuleBlockUseCaseInput input,
        [FromServices] IUseCase<AddPlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.ModuleId = moduleId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // PUT …/courses/{courseId}/blocks/{blockId} — body { bodyHtml?, assetId?, caption?, altText?, items?: [{ assetId, caption }] }
    [HttpPut("catalog/versions/{versionNo:int}/courses/{courseId:guid}/blocks/{blockId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> UpdateBlock(
        int versionNo,
        Guid courseId,
        Guid blockId,
        [FromBody] UpdatePlatformModuleBlockUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.BlockId = blockId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // DELETE …/courses/{courseId}/blocks/{blockId}
    [HttpDelete("catalog/versions/{versionNo:int}/courses/{courseId:guid}/blocks/{blockId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> RemoveBlock(
        int versionNo,
        Guid courseId,
        Guid blockId,
        [FromServices] IUseCase<RemovePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(
            await useCase.ExecuteAsync(new RemovePlatformModuleBlockUseCaseInput { VersionNo = versionNo, CourseId = courseId, BlockId = blockId })));

    // POST …/courses/{courseId}/blocks/{blockId}/move — body { toIndex }
    [HttpPost("catalog/versions/{versionNo:int}/courses/{courseId:guid}/blocks/{blockId:guid}/move")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> MoveBlock(
        int versionNo,
        Guid courseId,
        Guid blockId,
        [FromBody] MovePlatformModuleBlockUseCaseInput input,
        [FromServices] IUseCase<MovePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.BlockId = blockId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // ----- Review questions --------------------------------------------------------------------

    // POST …/courses/{courseId}/modules/{moduleId}/questions — body { text?, explanation?, blockId?, options? }
    [HttpPost("catalog/versions/{versionNo:int}/courses/{courseId:guid}/modules/{moduleId:guid}/questions")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> AddQuestion(
        int versionNo,
        Guid courseId,
        Guid moduleId,
        [FromBody] AddPlatformModuleQuestionUseCaseInput input,
        [FromServices] IUseCase<AddPlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.ModuleId = moduleId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // PUT …/courses/{courseId}/questions/{questionId} — body { text, explanation, blockId, options: [{ text, isCorrect }] }
    [HttpPut("catalog/versions/{versionNo:int}/courses/{courseId:guid}/questions/{questionId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> UpdateQuestion(
        int versionNo,
        Guid courseId,
        Guid questionId,
        [FromBody] UpdatePlatformModuleQuestionUseCaseInput input,
        [FromServices] IUseCase<UpdatePlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail> useCase)
    {
        input.VersionNo = versionNo;
        input.CourseId = courseId;
        input.QuestionId = questionId;
        return Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(await useCase.ExecuteAsync(input)));
    }

    // DELETE …/courses/{courseId}/questions/{questionId}
    [HttpDelete("catalog/versions/{versionNo:int}/courses/{courseId:guid}/questions/{questionId:guid}")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    public async Task<ActionResult<ApiResponse<PlatformCatalogCourseDetail>>> RemoveQuestion(
        int versionNo,
        Guid courseId,
        Guid questionId,
        [FromServices] IUseCase<RemovePlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail> useCase) =>
        Ok(ApiResponse<PlatformCatalogCourseDetail>.Ok(
            await useCase.ExecuteAsync(new RemovePlatformModuleQuestionUseCaseInput { VersionNo = versionNo, CourseId = courseId, QuestionId = questionId })));

    // ----- Media -------------------------------------------------------------------------------

    // POST api/v1/platform/assets — multipart/form-data, field "file" (image ≤ 10 MB, video ≤ 500 MB)
    [HttpPost("assets")]
    [HasPermission(Permissions.Platform.CatalogManage)]
    [RequestSizeLimit(MaxUploadBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadBytes)]
    public async Task<ActionResult<ApiResponse<PlatformAssetDto>>> UploadAsset(
        IFormFile file,
        [FromServices] IUseCase<UploadPlatformAssetUseCaseInput, PlatformAssetDto> useCase)
    {
        await using var stream = file.OpenReadStream();
        var result = await useCase.ExecuteAsync(new UploadPlatformAssetUseCaseInput
        {
            Content = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
        });
        return Ok(ApiResponse<PlatformAssetDto>.Ok(result, "File uploaded."));
    }

    // GET api/v1/platform/assets/{id}/content?exp=&sig= — signed link (no permission check: <img>/<video> send no token)
    [HttpGet("assets/{id:guid}/content")]
    public async Task<IActionResult> GetAssetContent(
        Guid id,
        [FromQuery] long exp,
        [FromQuery] string? sig,
        [FromServices] IUseCase<GetPlatformAssetContentUseCaseInput, GetPlatformAssetContentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPlatformAssetContentUseCaseInput { AssetId = id, ExpiresAt = exp, Signature = sig });
        Response.Headers.CacheControl = "private, max-age=3600";
        return File(result.Content, result.ContentType, enableRangeProcessing: true);
    }
}
