using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-08 — Nội dung bài học (chỉ khi đã ghi danh khóa): nội dung, học liệu, tiến độ, bài trước/sau.</summary>
public class GetMyLessonUseCase : IUseCase<GetMyLessonUseCaseInput, GetMyLessonUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyLearningProgressService _progress;

    public GetMyLessonUseCase(IApplicationDbContext context, MyEmployeeContext me, MyLearningProgressService progress)
    {
        _context = context;
        _me = me;
        _progress = progress;
    }

    public async Task<GetMyLessonUseCaseOutput> ExecuteAsync(GetMyLessonUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var (enrollment, lessons, info) = await _progress.GetEnrolledLessonAsync(employee, input.CourseId, input.LessonId, trackEnrollment: false);

        var course = await _context.Courses.AsNoTracking().FirstAsync(c => c.Id == input.CourseId);
        var lesson = await _context.Lessons.AsNoTracking().FirstAsync(l => l.Id == input.LessonId);
        var progress = await _context.LessonProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.EnrollmentId == enrollment.Id && p.LessonId == input.LessonId);

        var materials = await (
                from material in _context.LearningMaterials.AsNoTracking()
                join file in _context.FileObjects.AsNoTracking() on material.FileObjectId equals file.Id into files
                from file in files.DefaultIfEmpty()
                where material.LessonId == input.LessonId
                orderby material.SortOrder
                select new MyLearningMaterialDto
                {
                    Id = material.Id,
                    Title = material.Title,
                    MaterialType = material.MaterialType,
                    ExternalUrl = material.MaterialType == Statuses.LearningMaterialType.Link ? material.ExternalUrl : null,
                    FileName = file != null ? file.OriginalName : null,
                    SizeBytes = file != null ? file.SizeBytes : null,
                    IsRequired = material.IsRequired,
                })
            .ToListAsync();

        var index = lessons.FindIndex(l => l.LessonId == input.LessonId);
        return new GetMyLessonUseCaseOutput
        {
            CourseId = course.Id,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            ModuleId = info.ModuleId,
            ModuleTitle = info.ModuleTitle,
            Id = lesson.Id,
            Code = lesson.Code,
            Title = lesson.Title,
            LessonType = lesson.LessonType,
            ContentBody = lesson.ContentBody,
            EstimatedMinutes = lesson.EstimatedMinutes,
            IsRequired = lesson.IsRequired,
            CompletionRule = lesson.CompletionRule,
            SelfCompletable = MyLearningProgressService.IsSelfCompletable(lesson.CompletionRule),
            Materials = materials,
            ProgressStatus = progress?.Status ?? Statuses.LessonProgress.NotStarted,
            CompletedAt = progress?.CompletedAt,
            LessonIndex = index + 1,
            TotalLessons = lessons.Count,
            PrevLessonId = index > 0 ? lessons[index - 1].LessonId : null,
            NextLessonId = index >= 0 && index < lessons.Count - 1 ? lessons[index + 1].LessonId : null,
            EnrollmentStatus = enrollment.Status,
            CourseProgressPercent = enrollment.ProgressPercent,
        };
    }
}
