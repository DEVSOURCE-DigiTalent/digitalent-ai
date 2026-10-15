using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/modules/{moduleId}/pages/{lessonId}/viewed — nhân viên mở một trang nội dung của
/// mô đun (§9.2). Dùng để xem lại sau lần ôn tập chưa đạt: lần làm tiếp theo chỉ mở khi mọi trang của câu chưa đúng đã
/// được mở sau thời điểm nộp. Ghi last_accessed_at của trang; không đổi trạng thái hoàn thành đã có.
/// </summary>
public class MarkPulsePageViewedUseCase : IUseCase<MarkPulsePageViewedUseCaseInput, MarkPulsePageViewedUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;
    private readonly PulseQuizReader _quiz;

    public MarkPulsePageViewedUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace, PulseQuizReader quiz)
    {
        _context = context;
        _workspace = workspace;
        _quiz = quiz;
    }

    public async Task<MarkPulsePageViewedUseCaseOutput> ExecuteAsync(MarkPulsePageViewedUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var module = PulseCourseWorkspace.FindModule(state, input.ModuleId);
        if (module.Slides.All(s => s.LessonId != input.LessonId))
        {
            throw new NotFoundException("Không tìm thấy trang nội dung trong mô đun này.");
        }

        PulseCourseWorkspace.EnsureCanWork(state);
        var enrollment = await _workspace.EnsureEnrollmentAsync(snapshot, state);
        var now = _workspace.Now;
        var progress = await _context.LessonProgresses
            .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.LessonId == input.LessonId);
        if (progress == null)
        {
            progress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = input.LessonId,
                Status = Statuses.LessonProgress.InProgress,
                ProgressPercent = 0,
            };
            _context.LessonProgresses.Add(progress);
        }

        progress.LastAccessedAt = now;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_lesson_progress_enrollment_lesson / ux_enrollments_one_active: hai thao tác cùng lúc
            throw new ConflictException("Tiến độ đang được lưu, vui lòng tải lại trang.");
        }

        var review = module.QuizAssessmentId is { } assessmentId
            ? await _quiz.ReviewAsync(enrollment.Id, module, await _quiz.LoadQuestionsAsync(assessmentId))
            : null;
        return new MarkPulsePageViewedUseCaseOutput { LessonId = input.LessonId, ViewedAt = now, Review = review };
    }
}
