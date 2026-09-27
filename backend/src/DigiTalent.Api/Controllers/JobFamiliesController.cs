using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.JobFamilies;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/job-families")]
public class JobFamiliesController : ControllerBase
{
    // GET api/v1/job-families?pageIndex=1&pageSize=20&search=sales&status=ACTIVE
    [HttpGet]
    [HasPermission(Permissions.JobFamily.Read)]
    public async Task<ActionResult<ApiResponse<GetPagedJobFamiliesUseCaseOutput>>> GetPaged(
        [FromQuery] GetPagedJobFamiliesUseCaseInput input,
        [FromServices] IUseCase<GetPagedJobFamiliesUseCaseInput, GetPagedJobFamiliesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedJobFamiliesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/job-families/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.JobFamily.Read)]
    public async Task<ActionResult<ApiResponse<GetJobFamilyByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<Guid, GetJobFamilyByIdUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(id);
        return Ok(ApiResponse<GetJobFamilyByIdUseCaseOutput>.Ok(result));
    }

    // POST api/v1/job-families
    [HttpPost]
    [HasPermission(Permissions.JobFamily.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateJobFamilyUseCaseOutput>>> Create(
        [FromBody] CreateJobFamilyUseCaseInput input,
        [FromServices] IUseCase<CreateJobFamilyUseCaseInput, CreateJobFamilyUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateJobFamilyUseCaseOutput>.Ok(result, "Job family created."));
    }

    // PUT api/v1/job-families/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.JobFamily.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateJobFamilyUseCaseOutput>>> Update(
        Guid id,
        [FromBody] UpdateJobFamilyUseCaseInput input,
        [FromServices] IUseCase<UpdateJobFamilyUseCaseInput, UpdateJobFamilyUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateJobFamilyUseCaseOutput>.Ok(result, "Job family updated."));
    }

    // DELETE api/v1/job-families/{id}
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.JobFamily.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<ArchiveJobFamilyUseCaseOutput>>> Archive(
        Guid id,
        [FromServices] IUseCase<ArchiveJobFamilyUseCaseInput, ArchiveJobFamilyUseCaseOutput> useCase)
    {
        var input = new ArchiveJobFamilyUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ArchiveJobFamilyUseCaseOutput>.Ok(result, "Job family archived."));
    }
}
