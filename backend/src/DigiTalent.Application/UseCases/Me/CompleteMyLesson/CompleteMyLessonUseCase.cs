using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-08 — Đánh dấu hoàn thành bài học rồi tính lại tiến độ khóa (MyLearningProgressService).
/// Bài PASS_CHECK / SUBMIT_ACTIVITY không tự đánh dấu được (COURSE-09).
/// </summary>
public class CompleteMyLessonUseCase : IUseCase<CompleteMyLessonUseCaseInput, CompleteMyLessonUseCaseOutput>
{
    public const string NotSelfCompletableMessage =
        "Bài học này được tính hoàn thành khi bạn đạt bài kiểm tra hoặc nộp bài thực hành tương ứng.";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyLearningProgressService _progress;

    public CompleteMyLessonUseCase(IApplicationDbContext context, MyEmployeeContext me, MyLearningProgressService progress)
    {
        _context = context;
        _me = me;
        _progress = progress;
    }

    public async Task<CompleteMyLessonUseCaseOutput> ExecuteAsync(CompleteMyLessonUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        Enrollment? enrollment = null;
        List<CourseLessonInfo> lessons = new();

        try
        {
            await _context.ExecuteInTransactionAsync(async () =>
            {
                CourseLessonInfo lesson;
                (enrollment, lessons, lesson) = await _progress.GetEnrolledLessonAsync(employee, input.CourseId, input.LessonId, trackEnrollment: true);
                if (!MyLearningProgressService.IsSelfCompletable(lesson.CompletionRule))
                {
                    throw new BadRequestException(NotSelfCompletableMessage);
                }

                var progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.LessonId == input.LessonId);
                if (progress == null)
                {
                    progress = new LessonProgress { EnrollmentId = enrollment.Id, LessonId = input.LessonId };
                    _context.LessonProgresses.Add(progress);
                }

                if (progress.Status != Statuses.LessonProgress.Completed)
                {
                    progress.Status = Statuses.LessonProgress.Completed;
                    progress.ProgressPercent = 100m;
                    progress.CompletedAt = now;
                }

                progress.LastAccessedAt = now;
                await _context.SaveChangesAsync();

                await _progress.RecalculateAsync(enrollment, now);
                await _context.SaveChangesAsync();
            });
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Tiến độ bài học đang được cập nhật, vui lòng thử lại.");
        }

        var index = lessons.FindIndex(l => l.LessonId == input.LessonId);
        var finalAssessmentId = await _context.Assessments
            .AsNoTracking()
            .Where(a => a.CourseId == input.CourseId && a.IsFinal && a.Status == Statuses.Assessment.Published)
            .OrderByDescending(a => a.VersionNo)
            .Select(a => (Guid?)a.Id)
            .FirstOrDefaultAsync();

        return new CompleteMyLessonUseCaseOutput
        {
            LessonId = input.LessonId,
            LessonStatus = Statuses.LessonProgress.Completed,
            CourseProgressPercent = enrollment!.ProgressPercent,
            EnrollmentStatus = enrollment.Status,
            NextLessonId = index >= 0 && index < lessons.Count - 1 ? lessons[index + 1].LessonId : null,
            ReadyForAssessment = enrollment.Status is Statuses.Enrollment.ReadyForAssessment or Statuses.Enrollment.Completed,
            FinalAssessmentId = finalAssessmentId,
        };
    }
}
