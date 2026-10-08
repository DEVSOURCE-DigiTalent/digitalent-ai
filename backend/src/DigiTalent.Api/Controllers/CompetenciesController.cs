using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/competencies")]
public class CompetenciesController : ControllerBase
{
    // GET api/v1/competencies?pageIndex=1&pageSize=10&search=cloud&categoryId=...&competencyType=CORE_DIGITAL
    [HttpGet]
    [HasPermission(Permissions.Competency.Read)]
    public async Task<ActionResult<ApiResponse<GetCompetenciesUseCaseOutput>>> GetCompetencies(
        [FromQuery] GetCompetenciesUseCaseInput input,
        [FromServices] IUseCase<GetCompetenciesUseCaseInput, GetCompetenciesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCompetenciesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/competencies/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.Competency.Read)]
    public async Task<ActionResult<ApiResponse<GetCompetencyByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetCompetencyByIdUseCaseInput, GetCompetencyByIdUseCaseOutput> useCase)
    {
        var input = new GetCompetencyByIdUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetCompetencyByIdUseCaseOutput>.Ok(result));
    }

    // GET api/v1/competencies/{id}/usage
    [HttpGet("{id:guid}/usage")]
    [HasPermission(Permissions.Competency.Read)]
    public async Task<ActionResult<ApiResponse<GetCompetencyUsageUseCaseOutput>>> GetUsage(
        Guid id,
        [FromServices] IUseCase<GetCompetencyUsageUseCaseInput, GetCompetencyUsageUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetCompetencyUsageUseCaseInput { CompetencyId = id });
        return Ok(ApiResponse<GetCompetencyUsageUseCaseOutput>.Ok(result));
    }

    // POST api/v1/competencies
    [HttpPost]
    [HasPermission(Permissions.Competency.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateCompetencyUseCaseOutput>>> Create(
        [FromBody] CreateCompetencyUseCaseInput input,
        [FromServices] IUseCase<CreateCompetencyUseCaseInput, CreateCompetencyUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateCompetencyUseCaseOutput>.Ok(result, "Competency created successfully."));
    }

    // PUT api/v1/competencies/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.Competency.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateCompetencyUseCaseOutput>>> Update(
        Guid id,
        [FromBody] UpdateCompetencyUseCaseInput input,
        [FromServices] IUseCase<UpdateCompetencyUseCaseInput, UpdateCompetencyUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateCompetencyUseCaseOutput>.Ok(result, "Competency updated successfully."));
    }

    // DELETE api/v1/competencies/{id}
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.Competency.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<ArchiveCompetencyUseCaseOutput>>> Archive(
        Guid id,
        [FromServices] IUseCase<ArchiveCompetencyUseCaseInput, ArchiveCompetencyUseCaseOutput> useCase)
    {
        var input = new ArchiveCompetencyUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ArchiveCompetencyUseCaseOutput>.Ok(result, "Competency archived successfully."));
    }
}
