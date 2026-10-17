using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;
using DigiTalent.Application.UseCases.Learning.Content;

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

        var isPaidCourse = result.CourseCode.EndsWith("-I", StringComparison.OrdinalIgnoreCase) ||
                           result.CourseCode.EndsWith("-A", StringComparison.OrdinalIgnoreCase);
        if (isPaidCourse)
        {
            var hasLicense = await (
                from o in _context.CourseSeatOrders.AsNoTracking()
                join pc in _context.PlatformCourses.AsNoTracking() on o.CourseId equals pc.Id
                where o.OrganizationId == organizationId && pc.Code == result.CourseCode && o.Seats > 0
                select o.Id
            ).AnyAsync();
            if (!hasLicense)
            {
                result.ContentLocked = true;
                var price = result.CourseCode.EndsWith("-A", StringComparison.OrdinalIgnoreCase) ? "699.000 ₫" : "399.000 ₫";
                result.ContentBody = $"🔒 Nội dung bài học '{result.Title}' thuộc gói bản quyền có phí ({price}/suất).\n\nTài khoản dùng thử của doanh nghiệp chỉ xem trước mục tiêu và cấu trúc bài giảng. Vui lòng liên hệ mua suất học cho tổ chức để mở toàn bộ bài giảng, học liệu chi tiết và bài tập thực hành.";
            }
        }

        if (!result.ContentLocked)
            result.Media = (await new LearningContentReader(_context, _urls).MediaAsync(new[] { result.Id })).GetValueOrDefault(result.Id) ?? new();
        return result;
    }
}
