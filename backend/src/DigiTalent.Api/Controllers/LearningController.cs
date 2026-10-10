using DigiTalent.Api.Authorization;
using DigiTalent.Api.Common;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Learning;
using DigiTalent.Domain.Constants.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigiTalent.Api.Controllers;

[ApiController]
[Route("api/v1/learning")]
public class LearningController : ControllerBase
{
    [HttpPost("lessons/{lessonId}/complete")]
    [HasPermission(Permissions.Learning.CompleteLesson)]
    public async Task<ActionResult<ApiResponse<CompleteLessonUseCaseOutput>>> CompleteLesson(
        Guid lessonId,
        [FromServices] IUseCase<CompleteLessonUseCaseInput, CompleteLessonUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new CompleteLessonUseCaseInput { LessonId = lessonId });
        return Ok(ApiResponse<CompleteLessonUseCaseOutput>.Ok(result, "Lesson completed."));
    }

    [HttpPost("assessments/{assessmentId}/start")]
    [HasPermission(Permissions.Assessment.AttemptStart)]
    public async Task<ActionResult<ApiResponse<StartQuizAttemptUseCaseOutput>>> StartQuizAttempt(
        Guid assessmentId,
        [FromServices] IUseCase<StartQuizAttemptUseCaseInput, StartQuizAttemptUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new StartQuizAttemptUseCaseInput { AssessmentId = assessmentId });
        return Ok(ApiResponse<StartQuizAttemptUseCaseOutput>.Ok(result, "Quiz started."));
    }

    [HttpPost("attempts/{attemptId}/submit")]
    [HasPermission(Permissions.Assessment.AttemptSubmit)]
    public async Task<ActionResult<ApiResponse<SubmitQuizAttemptUseCaseOutput>>> SubmitQuizAttempt(
        Guid attemptId,
        [FromBody] SubmitQuizAttemptUseCaseInput input,
        [FromServices] IUseCase<SubmitQuizAttemptUseCaseInput, SubmitQuizAttemptUseCaseOutput> useCase)
    {
        input.AttemptId = attemptId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<SubmitQuizAttemptUseCaseOutput>.Ok(result, "Quiz submitted and graded."));
    }

    [HttpGet("courses/{courseId}/structure")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<GetCourseStructureUseCaseOutput>>> GetCourseStructure(
        Guid courseId,
        [FromServices] IUseCase<GetCourseStructureUseCaseInput, GetCourseStructureUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetCourseStructureUseCaseInput { CourseId = courseId });
        return Ok(ApiResponse<GetCourseStructureUseCaseOutput>.Ok(result));
    }

    [HttpGet("my-enrollments")]
    [HasPermission(Permissions.Learning.ReadProgress)]
    public async Task<ActionResult<ApiResponse<GetMyEnrollmentsUseCaseOutput>>> GetMyEnrollments(
        [FromServices] IUseCase<GetMyEnrollmentsUseCaseInput, GetMyEnrollmentsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetMyEnrollmentsUseCaseInput());
        return Ok(ApiResponse<GetMyEnrollmentsUseCaseOutput>.Ok(result));
    }

    [HttpGet("courses")]
    [HasPermission(Permissions.Learning.ReadCatalog)]
    public async Task<ActionResult<ApiResponse<ListCoursesUseCaseOutput>>> ListCourses(
        [FromServices] IUseCase<ListCoursesUseCaseInput, ListCoursesUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new ListCoursesUseCaseInput());
        return Ok(ApiResponse<ListCoursesUseCaseOutput>.Ok(result));
    }

    [HttpPost("courses/{courseId}/enroll")]
    [HasPermission(Permissions.Learning.SelfEnroll)]
    public async Task<ActionResult<ApiResponse<EnrollInCourseUseCaseOutput>>> EnrollInCourse(
        Guid courseId,
        [FromServices] IUseCase<EnrollInCourseUseCaseInput, EnrollInCourseUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new EnrollInCourseUseCaseInput { CourseId = courseId });
        return CreatedAtAction(nameof(GetCourseStructure), new { courseId }, ApiResponse<EnrollInCourseUseCaseOutput>.Ok(result, "Enrolled successfully."));
    }

    [HttpGet("pending-evaluations")]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<GetPendingEvaluationsUseCaseOutput>>> GetPendingEvaluations(
        [FromServices] IUseCase<GetPendingEvaluationsUseCaseInput, GetPendingEvaluationsUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new GetPendingEvaluationsUseCaseInput());
        return Ok(ApiResponse<GetPendingEvaluationsUseCaseOutput>.Ok(result));
    }

    [HttpPost("enrollments/{enrollmentId}/submit")]
    [HasPermission(Permissions.Task.Submit)]
    public async Task<ActionResult<ApiResponse<SubmitForEvaluationUseCaseOutput>>> SubmitForEvaluation(
        Guid enrollmentId,
        [FromServices] IUseCase<SubmitForEvaluationUseCaseInput, SubmitForEvaluationUseCaseOutput> useCase)
    {
        var result = await useCase.ExecuteAsync(new SubmitForEvaluationUseCaseInput { EnrollmentId = enrollmentId });
        return Ok(ApiResponse<SubmitForEvaluationUseCaseOutput>.Ok(result, "Submitted for manager evaluation."));
    }

    [HttpPost("enrollments/{enrollmentId}/evaluate")]
    [HasPermission(Permissions.Task.Evaluate)]
    public async Task<ActionResult<ApiResponse<EvaluateEnrollmentUseCaseOutput>>> EvaluateEnrollment(
        Guid enrollmentId,
        [FromBody] EvaluateEnrollmentUseCaseInput input,
        [FromServices] IUseCase<EvaluateEnrollmentUseCaseInput, EvaluateEnrollmentUseCaseOutput> useCase)
    {
        input.EnrollmentId = enrollmentId;
        var result = await useCase.ExecuteAsync(input);
        return Ok(ApiResponse<EvaluateEnrollmentUseCaseOutput>.Ok(result, "Enrollment evaluated."));
    }
}
