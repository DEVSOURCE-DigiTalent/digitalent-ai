using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

/// <summary>
/// Trang nhân viên Pulse (docs/ui-redesign/16-pulse-product-flow-detailed.md, docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md):
/// Hôm nay / Lộ trình / Thực hành, lộ trình doanh nghiệp đặt (mục tiêu vị trí giới hạn bởi trần phòng ban), bài đánh giá
/// trước khi học, khóa học theo mô đun, bài cuối khóa, bài làm có giám sát (toàn bộ màn hình + camera + micro) và kết quả
/// đã xác nhận. Chỉ dữ liệu của chính người gọi.
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

    // POST api/v1/me/pulse/courses/{courseId}/modules/{moduleId}/pages/{lessonId}/viewed — mở lại một trang (xem lại sau lần ôn tập chưa đạt)
    [HttpPost("courses/{courseId:guid}/modules/{moduleId:guid}/pages/{lessonId:guid}/viewed")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<MarkPulsePageViewedUseCaseOutput>>> MarkPageViewed(
        Guid courseId,
        Guid moduleId,
        Guid lessonId,
        [FromServices] IUseCase<MarkPulsePageViewedUseCaseInput, MarkPulsePageViewedUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new MarkPulsePageViewedUseCaseInput { CourseId = courseId, ModuleId = moduleId, LessonId = lessonId });
        return Ok(ApiResponse<MarkPulsePageViewedUseCaseOutput>.Ok(result));
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

    // GET api/v1/me/pulse/courses/{courseId}/pre-assessment — bài đánh giá trước khi học của khóa
    [HttpGet("courses/{courseId:guid}/pre-assessment")]
    [HasPermission(Permissions.Assessment.Read)]
    public async Task<ActionResult<ApiResponse<GetPulsePreAssessmentUseCaseOutput>>> GetPreAssessment(
        Guid courseId,
        [FromServices] IUseCase<GetPulsePreAssessmentUseCaseInput, GetPulsePreAssessmentUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPulsePreAssessmentUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<GetPulsePreAssessmentUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/courses/{courseId}/pre-assessment — nộp bài đánh giá trước khi học (một lần), { evidenceText, proctoringSessionId }
    [HttpPost("courses/{courseId:guid}/pre-assessment")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitPulsePreAssessmentUseCaseOutput>>> SubmitPreAssessment(
        Guid courseId,
        [FromBody] SubmitPulsePreAssessmentUseCaseInput input,
        [FromServices] IUseCase<SubmitPulsePreAssessmentUseCaseInput, SubmitPulsePreAssessmentUseCaseOutput> useCase)
    {
        input.CourseId = courseId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitPulsePreAssessmentUseCaseOutput>.Ok(result, "Đã gửi bài đánh giá trước khi học cho người chấm."));
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

    // POST api/v1/me/pulse/courses/{courseId}/final — nộp bài cuối khóa (tối đa 2 lần), { evidenceText, proctoringSessionId }
    [HttpPost("courses/{courseId:guid}/final")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitPulseFinalUseCaseOutput>>> SubmitFinal(
        Guid courseId,
        [FromBody] SubmitPulseFinalUseCaseInput input,
        [FromServices] IUseCase<SubmitPulseFinalUseCaseInput, SubmitPulseFinalUseCaseOutput> useCase)
    {
        input.CourseId = courseId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitPulseFinalUseCaseOutput>.Ok(result, "Đã gửi bài cuối khóa cho người chấm."));
    }

    // POST api/v1/me/pulse/courses/{courseId}/proctoring — bắt đầu phiên làm bài có giám sát, { kind: PRE_ASSESSMENT | FINAL }
    [HttpPost("courses/{courseId:guid}/proctoring")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<StartPulseProctoringUseCaseOutput>>> StartProctoring(
        Guid courseId,
        [FromBody] StartPulseProctoringUseCaseInput input,
        [FromServices] IUseCase<StartPulseProctoringUseCaseInput, StartPulseProctoringUseCaseOutput> useCase)
    {
        input.CourseId = courseId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<StartPulseProctoringUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/proctoring/{sessionId}/recordings — mở một đoạn ghi, { track: SCREEN | CAMERA, startOffsetMs, contentType, displaySurface }
    [HttpPost("proctoring/{sessionId:guid}/recordings")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<StartPulseRecordingUseCaseOutput>>> StartRecording(
        Guid sessionId,
        [FromBody] StartPulseRecordingUseCaseInput input,
        [FromServices] IUseCase<StartPulseRecordingUseCaseInput, StartPulseRecordingUseCaseOutput> useCase)
    {
        input.SessionId = sessionId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<StartPulseRecordingUseCaseOutput>.Ok(result));
    }

    // PUT api/v1/me/pulse/proctoring/{sessionId}/recordings/{recordingId}/chunks/{seq} — một mẩu ghi hình (thân request nhị phân)
    [HttpPut("proctoring/{sessionId:guid}/recordings/{recordingId:guid}/chunks/{seq:int}")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    [RequestSizeLimit(PulseRules.MaxRecordingChunkBytes + 64 * 1024)]
    public async Task<ActionResult<ApiResponse<AppendPulseRecordingChunkUseCaseOutput>>> AppendRecordingChunk(
        Guid sessionId,
        Guid recordingId,
        int seq,
        [FromServices] IUseCase<AppendPulseRecordingChunkUseCaseInput, AppendPulseRecordingChunkUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new AppendPulseRecordingChunkUseCaseInput
        {
            SessionId = sessionId,
            RecordingId = recordingId,
            Seq = seq,
            Content = Request.Body,
        });
        return Ok(ApiResponse<AppendPulseRecordingChunkUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/proctoring/{sessionId}/recordings/{recordingId}/end — khép đoạn ghi, { endOffsetMs }
    [HttpPost("proctoring/{sessionId:guid}/recordings/{recordingId:guid}/end")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<EndPulseRecordingUseCaseOutput>>> EndRecording(
        Guid sessionId,
        Guid recordingId,
        [FromBody] EndPulseRecordingUseCaseInput input,
        [FromServices] IUseCase<EndPulseRecordingUseCaseInput, EndPulseRecordingUseCaseOutput> useCase)
    {
        input.SessionId = sessionId;
        input.RecordingId = recordingId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<EndPulseRecordingUseCaseOutput>.Ok(result));
    }

    // POST api/v1/me/pulse/proctoring/{sessionId}/events — nhật ký giám sát, { events: [{ kind, offsetMs, durationMs, detail }] }
    [HttpPost("proctoring/{sessionId:guid}/events")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<RecordPulseProctoringEventsUseCaseOutput>>> RecordProctoringEvents(
        Guid sessionId,
        [FromBody] RecordPulseProctoringEventsUseCaseInput input,
        [FromServices] IUseCase<RecordPulseProctoringEventsUseCaseInput, RecordPulseProctoringEventsUseCaseOutput> useCase)
    {
        input.SessionId = sessionId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<RecordPulseProctoringEventsUseCaseOutput>.Ok(result));
    }

    // GET api/v1/me/pulse/practice — bài cuối khóa của các khóa đang/đã học và bài đánh giá trước khi học đã nộp
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
