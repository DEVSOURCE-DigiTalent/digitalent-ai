using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Lessons;

public class GetLessonUseCase : IUseCase<GetLessonInput, LessonContentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetLessonUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<LessonContentOutput> ExecuteAsync(GetLessonInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var result = await (
            from lesson in _context.Lessons.AsNoTracking()
            join module in _context.CourseModules.AsNoTracking() on lesson.ModuleId equals module.Id
            join course in _context.Courses.AsNoTracking() on module.CourseId equals course.Id
            where lesson.Id == input.Id && course.OrganizationId == organizationId
            select new LessonContentOutput
            {
                Id = lesson.Id,
                ModuleId = lesson.ModuleId,
                Code = lesson.Code,
                Title = lesson.Title,
                LessonType = lesson.LessonType,
                ContentBody = lesson.ContentBody,
                EstimatedMinutes = lesson.EstimatedMinutes,
                SortOrder = lesson.SortOrder,
                IsRequired = lesson.IsRequired,
                CompletionRule = lesson.CompletionRule,
                Status = lesson.Status,
                ModuleTitle = module.Title,
                CourseId = course.Id,
                CourseCode = course.Code,
                CourseTitle = course.Title,
            }
        ).FirstOrDefaultAsync();

        if (result == null)
            throw new NotFoundException($"Lesson '{input.Id}' not found.");

        return result;
    }
}
