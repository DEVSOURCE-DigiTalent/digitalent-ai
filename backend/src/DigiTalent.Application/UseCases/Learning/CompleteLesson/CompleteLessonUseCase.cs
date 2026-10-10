using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning;

public class CompleteLessonUseCase : IUseCase<CompleteLessonUseCaseInput, CompleteLessonUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CompleteLessonUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CompleteLessonUseCaseOutput> ExecuteAsync(CompleteLessonUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Employee profile required.");

        var lesson = await _context.Lessons
            .AsNoTracking()
            .Where(l => l.Id == input.LessonId)
            .Select(l => new { l.Id, l.ModuleId })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Lesson '{input.LessonId}' not found.");

        var courseModule = await _context.CourseModules
            .AsNoTracking()
            .Where(m => m.Id == lesson.ModuleId)
            .Select(m => new { m.Id, m.CourseId })
            .FirstAsync();

        var enrollment = await _context.Enrollments
            .Where(e => e.EmployeeId == employeeId && e.CourseId == courseModule.CourseId)
            .FirstOrDefaultAsync()
            ?? throw new BadRequestException("Not enrolled in this course.", "LessonId", "NOT_ENROLLED");

        if (enrollment.Status == Statuses.Enrollment.Completed ||
            enrollment.Status == Statuses.Enrollment.Cancelled)
            throw new BadRequestException("Enrollment is not active.", "LessonId", "ENROLLMENT_NOT_ACTIVE");

        var lessonProgress = await _context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == input.LessonId);

        if (lessonProgress is not null && lessonProgress.Status == Statuses.LessonProgress.Completed)
        {
            return new CompleteLessonUseCaseOutput
            {
                LessonProgressId = lessonProgress.Id,
                Status = lessonProgress.Status,
                ProgressPercent = 100,
                CourseProgressPercent = enrollment.ProgressPercent
            };
        }

        var now = DateTimeOffset.UtcNow;
        if (lessonProgress is null)
        {
            lessonProgress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = input.LessonId,
                Status = Statuses.LessonProgress.Completed,
                ProgressPercent = 100,
                LastAccessedAt = now,
                CompletedAt = now
            };
            _context.LessonProgresses.Add(lessonProgress);
        }
        else
        {
            lessonProgress.Status = Statuses.LessonProgress.Completed;
            lessonProgress.ProgressPercent = 100;
            lessonProgress.LastAccessedAt = now;
            lessonProgress.CompletedAt = now;
        }

        if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt = now;
        }

        var totalLessons = await _context.Lessons
            .CountAsync(l => _context.CourseModules
                .Where(m => m.CourseId == courseModule.CourseId)
                .Select(m => m.Id)
                .Contains(l.ModuleId));

        var completedLessons = await _context.LessonProgresses
            .CountAsync(lp => lp.EnrollmentId == enrollment.Id
                && lp.Status == Statuses.LessonProgress.Completed
                && lp.LessonId != input.LessonId) + 1;

        enrollment.ProgressPercent = totalLessons > 0
            ? Math.Round((decimal)completedLessons / totalLessons * 100, 2)
            : 0;

        await _context.SaveChangesAsync();

        return new CompleteLessonUseCaseOutput
        {
            LessonProgressId = lessonProgress.Id,
            Status = lessonProgress.Status,
            ProgressPercent = 100,
            CourseProgressPercent = enrollment.ProgressPercent
        };
    }
}
