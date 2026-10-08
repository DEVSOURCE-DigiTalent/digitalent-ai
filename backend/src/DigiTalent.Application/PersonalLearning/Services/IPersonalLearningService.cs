using DigiTalent.Application.PersonalLearning.Dtos;

namespace DigiTalent.Application.PersonalLearning.Services;

public interface IPersonalLearningService
{
    Task<PersonalOverviewDto> GetOverviewAsync(CancellationToken cancellationToken = default);
    Task<PersonalTargetDto> SetTargetAsync(string positionCode, CancellationToken cancellationToken = default);
    Task<PersonalSkillGapDto> GetSkillGapAsync(CancellationToken cancellationToken = default);
    Task<PersonalDiagnosticDto> GetDiagnosticAsync(CancellationToken cancellationToken = default);
    Task<DiagnosticResultDto> SubmitDiagnosticAsync(Dictionary<string, int> answers, CancellationToken cancellationToken = default);
    Task<PersonalPathDto> GetPathAsync(CancellationToken cancellationToken = default);
    Task<PersonalCourseDetailDto> GetCourseDetailAsync(string courseId, CancellationToken cancellationToken = default);
    Task<PersonalCourseDetailDto> UpdateLessonProgressAsync(string courseId, string lessonId, bool completed, CancellationToken cancellationToken = default);
    Task<CourseNotesDto> SaveCourseNotesAsync(string courseId, string notes, CancellationToken cancellationToken = default);
    Task<CourseAssessmentDto> GetCourseAssessmentAsync(string courseId, CancellationToken cancellationToken = default);
    Task<AssessmentOutcomeDto> SubmitCourseAssessmentAsync(string courseId, Dictionary<string, int> answers, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PersonalTaskDto>> GetTasksAsync(CancellationToken cancellationToken = default);
    Task<PersonalTaskDto> SubmitTaskAsync(string taskId, SubmitTaskRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PersonalCertificateDto>> GetCertificatesAsync(CancellationToken cancellationToken = default);
    Task<PersonalCertificateDto?> VerifyCertificateAsync(string code, CancellationToken cancellationToken = default);
    Task<PersonalProgressDto> GetProgressAsync(CancellationToken cancellationToken = default);
    Task<PersonalAccessDto> GetAccessAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, string>> MarkSeenAsync(string key, CancellationToken cancellationToken = default);
}
