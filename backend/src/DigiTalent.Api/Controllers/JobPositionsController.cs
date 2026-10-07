using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/job-positions")]
public class JobPositionsController : ControllerBase
{
    // GET api/v1/job-positions?pageIndex=1&pageSize=20&search=dev&status=ACTIVE&jobFamilyId=...&departmentId=...&jobGrade=G1
    [HttpGet]
    [HasPermission(Permissions.JobPosition.Read)]
    public async Task<ActionResult<ApiResponse<GetPagedJobPositionsUseCaseOutput>>> GetPaged(
        [FromQuery] GetPagedJobPositionsUseCaseInput input,
        [FromServices] IUseCase<GetPagedJobPositionsUseCaseInput, GetPagedJobPositionsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetPagedJobPositionsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/job-positions/{id}
    [HttpGet("{id:guid}")]
    [HasPermission(Permissions.JobPosition.Read)]
    public async Task<ActionResult<ApiResponse<GetJobPositionByIdUseCaseOutput>>> GetById(
        Guid id,
        [FromServices] IUseCase<GetJobPositionByIdUseCaseInput, GetJobPositionByIdUseCaseOutput> useCase)
    {
        var input = new GetJobPositionByIdUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<GetJobPositionByIdUseCaseOutput>.Ok(result));
    }

    // POST api/v1/job-positions
    [HttpPost]
    [HasPermission(Permissions.JobPosition.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<CreateJobPositionUseCaseOutput>>> Create(
        [FromBody] CreateJobPositionUseCaseInput input,
        [FromServices] IUseCase<CreateJobPositionUseCaseInput, CreateJobPositionUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<CreateJobPositionUseCaseOutput>.Ok(result, "Job position created."));
    }

    // PUT api/v1/job-positions/{id}
    [HttpPut("{id:guid}")]
    [HasPermission(Permissions.JobPosition.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<UpdateJobPositionUseCaseOutput>>> Update(
        Guid id,
        [FromBody] UpdateJobPositionUseCaseInput input,
        [FromServices] IUseCase<UpdateJobPositionUseCaseInput, UpdateJobPositionUseCaseOutput> useCase)
    {
        input.Id = id;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateJobPositionUseCaseOutput>.Ok(result, "Job position updated."));
    }

    // DELETE api/v1/job-positions/{id}
    [HttpDelete("{id:guid}")]
    [HasPermission(Permissions.JobPosition.CreateUpdate)]
    public async Task<ActionResult<ApiResponse<ArchiveJobPositionUseCaseOutput>>> Archive(
        Guid id,
        [FromServices] IUseCase<ArchiveJobPositionUseCaseInput, ArchiveJobPositionUseCaseOutput> useCase)
    {
        var input = new ArchiveJobPositionUseCaseInput { Id = id };
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<ArchiveJobPositionUseCaseOutput>.Ok(result, "Job position archived."));
    }
}
