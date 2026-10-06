using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-08 — Ghi nhận mở bài học: lesson_progress IN_PROGRESS + last_accessed_at (để "học tiếp" đúng chỗ),
/// enrollment NOT_STARTED → IN_PROGRESS.
/// </summary>
public class StartMyLessonUseCase : IUseCase<StartMyLessonUseCaseInput, StartMyLessonUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyLearningProgressService _progress;

    public StartMyLessonUseCase(IApplicationDbContext context, MyEmployeeContext me, MyLearningProgressService progress)
    {
        _context = context;
        _me = me;
        _progress = progress;
    }

    public async Task<StartMyLessonUseCaseOutput> ExecuteAsync(StartMyLessonUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        LessonProgress? progress = null;
        Enrollment? enrollment = null;

        try
        {
            await _context.ExecuteInTransactionAsync(async () =>
            {
                (enrollment, _, _) = await _progress.GetEnrolledLessonAsync(employee, input.CourseId, input.LessonId, trackEnrollment: true);

                progress = await _context.LessonProgresses
                    .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.LessonId == input.LessonId);
                if (progress == null)
                {
                    progress = new LessonProgress
                    {
                        EnrollmentId = enrollment.Id,
                        LessonId = input.LessonId,
                        Status = Statuses.LessonProgress.InProgress,
                    };
                    _context.LessonProgresses.Add(progress);
                }

                progress.LastAccessedAt = now;
                if (enrollment.Status == Statuses.Enrollment.NotStarted)
                {
                    enrollment.Status = Statuses.Enrollment.InProgress;
                    enrollment.StartedAt ??= now;
                }

                await _context.SaveChangesAsync();
            });
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("Tiến độ bài học đang được cập nhật, vui lòng thử lại.");
        }

        return new StartMyLessonUseCaseOutput
        {
            LessonId = input.LessonId,
            LessonStatus = progress!.Status,
            EnrollmentStatus = enrollment!.Status,
        };
    }
}
