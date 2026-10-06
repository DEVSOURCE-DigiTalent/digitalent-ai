using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Lessons;

public class CompleteLessonUseCase : IUseCase<CompleteLessonInput, CompleteLessonOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CompleteLessonUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CompleteLessonOutput> ExecuteAsync(CompleteLessonInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới hoàn thành bài học.");

        var lesson = await (
            from l in _context.Lessons.AsNoTracking()
            join m in _context.CourseModules.AsNoTracking() on l.ModuleId equals m.Id
            where l.Id == input.LessonId
            select new { l.Id, m.CourseId }
        ).FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Lesson '{input.LessonId}' not found.");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId && e.CourseId == lesson.CourseId
                && e.Status != Statuses.Enrollment.Cancelled)
            ?? throw new BadRequestException("Bạn chưa được ghi danh vào khóa học này.");

        var progress = await _context.LessonProgresses
            .FirstOrDefaultAsync(lp => lp.EnrollmentId == enrollment.Id && lp.LessonId == input.LessonId);

        if (progress == null)
        {
            progress = new LessonProgress
            {
                EnrollmentId = enrollment.Id,
                LessonId = input.LessonId,
                Status = "COMPLETED",
                ProgressPercent = 100,
                LastAccessedAt = DateTimeOffset.UtcNow,
                CompletedAt = DateTimeOffset.UtcNow,
            };
            _context.LessonProgresses.Add(progress);
        }
        else if (progress.Status != "COMPLETED")
        {
            progress.Status = "COMPLETED";
            progress.ProgressPercent = 100;
            progress.CompletedAt = DateTimeOffset.UtcNow;
            progress.LastAccessedAt = DateTimeOffset.UtcNow;
        }

        await _context.SaveChangesAsync();

        var totalLessons = await (
            from l in _context.Lessons.AsNoTracking()
            join m in _context.CourseModules.AsNoTracking() on l.ModuleId equals m.Id
            where m.CourseId == lesson.CourseId
            select l.Id
        ).CountAsync();

        var completedLessons = await _context.LessonProgresses.AsNoTracking()
            .CountAsync(lp => lp.EnrollmentId == enrollment.Id && lp.Status == "COMPLETED");

        var courseProgress = totalLessons > 0
            ? Math.Round((decimal)completedLessons / totalLessons * 100, 1)
            : 0;

        enrollment.ProgressPercent = courseProgress;

        if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt = DateTimeOffset.UtcNow;
        }

        if (courseProgress >= 100 && enrollment.Status != Statuses.Enrollment.Completed)
        {
            enrollment.Status = Statuses.Enrollment.ReadyForAssessment;
        }

        await _context.SaveChangesAsync();

        return new CompleteLessonOutput
        {
            LessonId = input.LessonId,
            Status = progress.Status,
            ProgressPercent = progress.ProgressPercent,
            CourseProgressPercent = courseProgress,
        };
    }
}
