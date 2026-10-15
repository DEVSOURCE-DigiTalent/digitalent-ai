using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/courses/{courseId}/modules/{moduleId}/viewed — nhân viên đã đọc tới trang cuối của mô đun (§9.2):
/// đánh dấu các trang hoàn thành; mở câu hỏi ôn tập. Khóa Cơ bản tự mở lượt học ở thao tác đầu tiên.
/// </summary>
public class MarkPulseModuleViewedUseCase : IUseCase<MarkPulseModuleViewedUseCaseInput, MarkPulseModuleViewedUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;

    public MarkPulseModuleViewedUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace)
    {
        _context = context;
        _workspace = workspace;
    }

    public async Task<MarkPulseModuleViewedUseCaseOutput> ExecuteAsync(MarkPulseModuleViewedUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var module = PulseCourseWorkspace.FindModule(state, input.ModuleId);
        if (module.Slides.Count == 0)
        {
            throw new BadRequestException("Mô đun chưa có trang nội dung.", "moduleId", "MODULE_EMPTY");
        }

        var enrollment = await _workspace.EnsureEnrollmentAsync(snapshot, state);
        var now = _workspace.Now;
        var lessonIds = module.Slides.Select(s => s.LessonId).ToList();
        var existing = await _context.LessonProgresses
            .Where(p => p.EnrollmentId == enrollment.Id && lessonIds.Contains(p.LessonId))
            .ToListAsync();
        foreach (var lessonId in lessonIds)
        {
            var progress = existing.FirstOrDefault(p => p.LessonId == lessonId);
            if (progress == null)
            {
                progress = new LessonProgress { EnrollmentId = enrollment.Id, LessonId = lessonId };
                _context.LessonProgresses.Add(progress);
            }

            progress.LastAccessedAt = now;
            if (progress.Status != Statuses.LessonProgress.Completed)
            {
                progress.Status = Statuses.LessonProgress.Completed;
                progress.ProgressPercent = 100;
                progress.CompletedAt = now;
            }
        }

        var modulePassed = !module.QuizAssessmentId.HasValue
                           || (state.Progress?.GetValueOrDefault(module.ModuleId)?.QuizPassed ?? false);
        var passedCount = state.Modules.Count(m => m.ModuleId == module.ModuleId
            ? modulePassed
            : state.Progress?.GetValueOrDefault(m.ModuleId)?.Passed(m) ?? false);
        PulseCourseWorkspace.UpdateProgressPercent(enrollment, passedCount, state.Modules.Count);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // ux_enrollments_one_active / uq lesson_progress: hai thao tác cùng lúc
            throw new ConflictException("Tiến độ đang được lưu, vui lòng tải lại trang.");
        }

        return new MarkPulseModuleViewedUseCaseOutput { EnrollmentId = enrollment.Id, Viewed = true, ModulePassed = modulePassed };
    }
}
