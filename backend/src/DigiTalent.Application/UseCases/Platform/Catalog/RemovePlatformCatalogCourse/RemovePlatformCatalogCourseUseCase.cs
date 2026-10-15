using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Takes a course added in this draft out of it again, with its content and its (never published) identity.
/// Published courses stay in every later version; they can be paused for sale instead.
/// </summary>
public class RemovePlatformCatalogCourseUseCase : IUseCase<RemovePlatformCatalogCourseUseCaseInput, PlatformCatalogVersionDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly IAuditService _auditService;

    public RemovePlatformCatalogCourseUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogVersionDetail> ExecuteAsync(RemovePlatformCatalogCourseUseCaseInput input)
    {
        var course = await _editor.DraftCourseAsync(input.VersionNo, input.CourseId);
        var identity = await _context.PlatformCourses.FirstAsync(c => c.Id == course.CourseId);
        if (course.ChangeKind != PlatformCatalog.ChangeKind.New || identity.PublishedAt != null)
        {
            throw new BadRequestException(
                "Chỉ bỏ được khóa vừa thêm trong bản nháp. Khóa đã công bố thì chuyển sang tạm ngưng bán.", "courseId", "COURSE_PUBLISHED");
        }

        var moduleIds = await _context.PlatformCourseModules.Where(m => m.CatalogCourseId == course.Id).Select(m => m.Id).ToListAsync();
        await _editor.RemoveModulesAsync(moduleIds);
        _context.PlatformCatalogCourses.Remove(course);
        _context.PlatformCourses.Remove(identity);
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_CATALOG_COURSE_REMOVED",
            "platform_courses",
            identity.Id,
            oldValues: new { versionNo = input.VersionNo, code = identity.Code, title = course.Title },
            entityLabel: $"{identity.Code} · {course.Title}");

        return await PlatformCatalogVersionReader.ReadDetailAsync(_context, input.VersionNo);
    }
}
