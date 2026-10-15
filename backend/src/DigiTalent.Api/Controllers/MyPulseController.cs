using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Trang nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md): Hôm nay / Lộ trình / Thực hành,
/// bài kiểm tra đầu vào, khóa học theo mô đun, bài cuối khóa và kết quả đã xác nhận. Chỉ dữ liệu của chính người gọi.
/// </summary>
[ApiController]
[Route("api/v1/me/pulse")]
public class MyPulseController : ControllerBase
{
    // GET api/v1/me/pulse/overview — Hôm nay, Lộ trình, Hồ sơ
    [HttpGet("overview")]
    [HasPermission(Permissions.Competency.ProfileRead)]
    public async Task<ActionResult<ApiResponse<GetPulseOverviewUseCaseOutput>>> GetOverview(
        [FromServices] IUseCase<GetPulseOverviewUseCaseInput, GetPulseOverviewUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        return Ok(ApiResponse<GetPulseOverviewUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/baseline — câu hỏi bài đầu vào hoặc kết quả đã ghi
    [HttpGet("baseline")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetPulseBaselineUseCaseOutput>>> GetBaseline(
        [FromServices] IUseCase<GetPulseBaselineUseCaseInput, GetPulseBaselineUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseBaselineUseCaseInput());
        return Ok(ApiResponse<GetPulseBaselineUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/baseline — nộp bài đầu vào (một lần)
    [HttpPost("baseline")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitPulseBaselineUseCaseOutput>>> SubmitBaseline(
        [FromBody] SubmitPulseBaselineUseCaseInput input,
        [FromServices] IUseCase<SubmitPulseBaselineUseCaseInput, SubmitPulseBaselineUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitPulseBaselineUseCaseOutput>.Ok(result, "Đã ghi nhận mức đầu vào."));
    }

    // GET api/v1/me/pulse/courses/{courseId} — chi tiết khóa
    [HttpGet("courses/{courseId:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetPulseCourseUseCaseOutput>>> GetCourse(
        Guid courseId,
        [FromServices] IUseCase<GetPulseCourseUseCaseInput, GetPulseCourseUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<GetPulseCourseUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/courses/{courseId}/modules/{moduleId} — trang học mô đun
    [HttpGet("courses/{courseId:guid}/modules/{moduleId:guid}")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetPulseModuleUseCaseOutput>>> GetModule(
        Guid courseId,
        Guid moduleId,
        [FromServices] IUseCase<GetPulseModuleUseCaseInput, GetPulseModuleUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseModuleUseCaseInput { CourseId = courseId, ModuleId = moduleId });
        return Ok(ApiResponse<GetPulseModuleUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/courses/{courseId}/modules/{moduleId}/viewed — đã đọc tới trang cuối của mô đun
    [HttpPost("courses/{courseId:guid}/modules/{moduleId:guid}/viewed")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<MarkPulseModuleViewedUseCaseOutput>>> MarkModuleViewed(
        Guid courseId,
        Guid moduleId,
        [FromServices] IUseCase<MarkPulseModuleViewedUseCaseInput, MarkPulseModuleViewedUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new MarkPulseModuleViewedUseCaseInput { CourseId = courseId, ModuleId = moduleId });
        return Ok(ApiResponse<MarkPulseModuleViewedUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/courses/{courseId}/modules/{moduleId}/quiz — câu hỏi ôn tập mô đun
    [HttpPost("courses/{courseId:guid}/modules/{moduleId:guid}/quiz")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitPulseModuleQuizUseCaseOutput>>> SubmitModuleQuiz(
        Guid courseId,
        Guid moduleId,
        [FromBody] SubmitPulseModuleQuizUseCaseInput input,
        [FromServices] IUseCase<SubmitPulseModuleQuizUseCaseInput, SubmitPulseModuleQuizUseCaseOutput> useCase)
    {
        input.CourseId = courseId;
        input.ModuleId = moduleId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitPulseModuleQuizUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/courses/{courseId}/final — bài cuối của khóa
    [HttpGet("courses/{courseId:guid}/final")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetPulseFinalUseCaseOutput>>> GetFinal(
        Guid courseId,
        [FromServices] IUseCase<GetPulseFinalUseCaseInput, GetPulseFinalUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseFinalUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<GetPulseFinalUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/courses/{courseId}/final — nộp bài cuối khóa (tối đa 2 lần)
    [HttpPost("courses/{courseId:guid}/final")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitPulseFinalUseCaseOutput>>> SubmitFinal(
        Guid courseId,
        [FromBody] SubmitPulseFinalUseCaseInput input,
        [FromServices] IUseCase<SubmitPulseFinalUseCaseInput, SubmitPulseFinalUseCaseOutput> useCase)
    {
        input.CourseId = courseId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitPulseFinalUseCaseOutput>.Ok(result, "Đã gửi bài cuối khóa cho quản lý phòng ban."));
    }

    // GET api/v1/me/pulse/practice — bài cuối khóa của các khóa đang/đã học
    [HttpGet("practice")]
    [HasPermission(Permissions.Learning.ReadProgress)]
    public async Task<ActionResult<ApiResponse<GetPulsePracticeUseCaseOutput>>> GetPractice(
        [FromServices] IUseCase<GetPulsePracticeUseCaseInput, GetPulsePracticeUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulsePracticeUseCaseInput());
        return Ok(ApiResponse<GetPulsePracticeUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/outcomes — kết quả đã xác nhận
    [HttpGet("outcomes")]
    [HasPermission(Permissions.Certificate.Read)]
    public async Task<ActionResult<ApiResponse<GetPulseOutcomesUseCaseOutput>>> GetOutcomes(
        [FromServices] IUseCase<GetPulseOutcomesUseCaseInput, GetPulseOutcomesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseOutcomesUseCaseInput());
        return Ok(ApiResponse<GetPulseOutcomesUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/outcomes/{outcomeId} — một kết quả đã xác nhận
    [HttpGet("outcomes/{outcomeId}")]
    [HasPermission(Permissions.Certificate.Read)]
    public async Task<ActionResult<ApiResponse<PulseOutcomeDto>>> GetOutcome(
        string outcomeId,
        [FromServices] IUseCase<GetPulseOutcomeUseCaseInput, PulseOutcomeDto> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulseOutcomeUseCaseInput { OutcomeId = outcomeId });
        return Ok(ApiResponse<PulseOutcomeDto>.Ok(result));
    }
}
