using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.Grades;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Shared grade scale G1..G3 of job positions (OW-12 "Cấu hình cấp bậc"). Codes are fixed; names are per organization.
/// </summary>
[ApiController]
[Route("api/v1/job-grades")]
public class JobGradesController : ControllerBase
{
    // GET api/v1/job-grades
    [HttpGet]
    [HasPermission(Permissions.JobGrade.Read)]
    public async Task<ActionResult<ApiResponse<GetJobGradesUseCaseOutput>>> GetAll(
        [FromServices] IUseCase<GetJobGradesUseCaseInput, GetJobGradesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetJobGradesUseCaseInput());
        return Ok(ApiResponse<GetJobGradesUseCaseOutput>.Ok(result));
    }

    // PUT api/v1/job-grades/{code} — body { name, description? }
    [HttpPut("{code}")]
    [HasPermission(Permissions.JobGrade.Manage)]
    public async Task<ActionResult<ApiResponse<UpdateJobGradeUseCaseOutput>>> Update(
        string code,
        [FromBody] UpdateJobGradeUseCaseInput input,
        [FromServices] IUseCase<UpdateJobGradeUseCaseInput, UpdateJobGradeUseCaseOutput> useCase)
    {
        input.Code = code;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<UpdateJobGradeUseCaseOutput>.Ok(result, "Job grade updated."));
    }
}
