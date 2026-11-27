using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.BehaviorReports;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Báo cáo hành vi khi làm bài cuối khóa (canonical v3.10) cho chủ doanh nghiệp, xem trong Khoảng trống năng lực (OW-21)
/// cạnh mức năng lực của từng nhân viên: dòng thời gian, bằng chứng và bản ghi. Báo cáo được lập khi nhân viên nộp bài; AI
/// phân tích nhật ký giám sát ở nền.
/// </summary>
[ApiController]
[Route("api/v1/behavior-reports")]
public class BehaviorReportsController : ControllerBase
{
    // GET api/v1/behavior-reports — bài cuối khóa của mọi nhân viên trong phạm vi, gom theo người
    [HttpGet]
    [HasPermission(Permissions.BehaviorReport.Read)]
    public async Task<ActionResult<ApiResponse<GetBehaviorReportsUseCaseOutput>>> GetList(
        [FromServices] IUseCase<GetBehaviorReportsUseCaseInput, GetBehaviorReportsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetBehaviorReportsUseCaseInput());
        return Ok(ApiResponse<GetBehaviorReportsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/behavior-reports/{reportId}
    [HttpGet("{reportId:guid}")]
    [HasPermission(Permissions.BehaviorReport.Read)]
    public async Task<ActionResult<ApiResponse<BehaviorReportDetailDto>>> GetById(
        Guid reportId,
        [FromServices] IUseCase<GetBehaviorReportUseCaseInput, BehaviorReportDetailDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetBehaviorReportUseCaseInput { ReportId = reportId });
        return Ok(ApiResponse<BehaviorReportDetailDto>.Ok(result));
    }

    // POST api/v1/behavior-reports/{reportId}/analyze — AI phân tích lại ở nền
    [HttpPost("{reportId:guid}/analyze")]
    [HasPermission(Permissions.BehaviorReport.Analyze)]
    public async Task<ActionResult<ApiResponse<AnalyzeBehaviorReportUseCaseOutput>>> Analyze(
        Guid reportId,
        [FromServices] IUseCase<AnalyzeBehaviorReportUseCaseInput, AnalyzeBehaviorReportUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new AnalyzeBehaviorReportUseCaseInput { ReportId = reportId });
        return Ok(ApiResponse<AnalyzeBehaviorReportUseCaseOutput>.Ok(result, "AI đang phân tích lại."));
    }
}
