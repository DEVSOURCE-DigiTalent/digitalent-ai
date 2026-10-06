using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Courses;

public class GetCourseByIdUseCase : IUseCase<GetCourseByIdUseCaseInput, CourseDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCourseByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CourseDetailDto> ExecuteAsync(GetCourseByIdUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == input.Id && x.OrganizationId == organizationId);

        if (course == null)
        {
            throw new NotFoundException($"Course '{input.Id}' not found.");
        }

        var modules = await _context.CourseModules
            .AsNoTracking()
            .Where(x => x.CourseId == input.Id)
            .OrderBy(x => x.SortOrder)
            .Select(x => new CourseModuleDto
            {
                Id = x.Id,
                Code = x.Code,
                Title = x.Title,
                Description = x.Description,
                EstimatedMinutes = x.EstimatedMinutes,
                SortOrder = x.SortOrder,
                IsRequired = x.IsRequired,
                LessonsCount = _context.Lessons.Count(l => l.ModuleId == x.Id),
                Lessons = _context.Lessons
                    .Where(l => l.ModuleId == x.Id)
                    .OrderBy(l => l.SortOrder)
                    .Select(l => new LessonDto
                    {
                        Id = l.Id,
                        Code = l.Code,
                        Title = l.Title,
                        LessonType = l.LessonType,
                        EstimatedMinutes = l.EstimatedMinutes,
                        SortOrder = l.SortOrder,
                        IsRequired = l.IsRequired,
                        CompletionRule = l.CompletionRule,
                    })
                    .ToList()
            })
            .ToListAsync();

        var level = await _context.CourseCompetencies
            .AsNoTracking()
            .Where(cc => cc.CourseId == input.Id)
            .Select(cc => (int)cc.TargetLevel)
            .OrderByDescending(t => t)
            .FirstOrDefaultAsync();

        var categoryInfo = await (
            from cc in _context.CourseCompetencies.AsNoTracking()
            where cc.CourseId == input.Id
            join comp in _context.Competencies.AsNoTracking() on cc.CompetencyId equals comp.Id
            join cat in _context.CompetencyCategories.AsNoTracking() on comp.CategoryId equals cat.Id
            select new { cat.Id, cat.Name }
        ).FirstOrDefaultAsync();

        var prerequisite = await (
            from p in _context.CoursePrerequisites.AsNoTracking()
            where p.CourseId == input.Id
            join pc in _context.Courses.AsNoTracking() on p.PrerequisiteCourseId equals pc.Id
            select new { pc.Id, pc.Title }
        ).FirstOrDefaultAsync();

        return new CourseDetailDto
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description,
            Purpose = course.Purpose,
            Level = level > 0 ? level : (course.EntryLevel.HasValue ? course.EntryLevel.Value + 1 : 1),
            EntryLevel = course.EntryLevel,
            EstimatedDurationMinutes = course.EstimatedDurationMinutes,
            CertificateEnabled = course.CertificateEnabled,
            CertificateValidityDays = course.CertificateValidityDays,
            Status = course.Status,
            CategoryId = categoryInfo?.Id,
            CategoryName = categoryInfo?.Name,
            PrerequisiteCourseId = prerequisite?.Id,
            PrerequisiteTitle = prerequisite?.Title,
            CreatedAt = course.CreatedAt,
            Modules = modules
        };
    }
}
