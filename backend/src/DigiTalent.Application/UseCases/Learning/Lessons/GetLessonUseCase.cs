using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.TrialProgram;

namespace DigiTalent.Application.UseCases.Learning.Lessons;

public class GetLessonUseCase : IUseCase<GetLessonInput, LessonContentOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPlatformAssetUrlSigner? _urls;

    public GetLessonUseCase(IApplicationDbContext context, ICurrentUser currentUser, IPlatformAssetUrlSigner? urls = null)
    {
        _context = context;
        _currentUser = currentUser;
        _urls = urls;
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
                ModuleIndex = _context.CourseModules.Count(m => m.CourseId == course.Id && m.SortOrder < module.SortOrder),
            }
        ).FirstOrDefaultAsync();

        if (result == null)
            throw new NotFoundException($"Lesson '{input.Id}' not found.");

        if (!_currentUser.IsAdmin && _currentUser.EmployeeId is { } employeeId
            && await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == employeeId && e.OrganizationId == organizationId) is { } employee)
        {
            await new TrialLearningAccess(_context).EnsureCourseAccessAsync(employee, result.CourseId);
        }

        if (CourseOwnership.IsPaid(result.CourseCode)
            && !await CourseOwnership.IsPurchasedAsync(_context, organizationId, result.CourseCode))
        {
            result.ContentLocked = true;
            result.ContentBody = $"🔒 Nội dung bài học '{result.Title}' thuộc khóa học có phí.\n\nDoanh nghiệp chưa mua khóa học này nên chỉ xem trước mục tiêu và cấu trúc bài giảng. Khi doanh nghiệp mua khóa học, mọi nhân viên đều mở được toàn bộ bài giảng, học liệu và bài tập thực hành.";
        }

        if (!result.ContentLocked)
            result.Media = (await new LearningContentReader(_context, _urls).MediaAsync(new[] { result.Id })).GetValueOrDefault(result.Id) ?? new();
        return result;
    }
}
