using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Removes a module with its content and questions from the draft; the other modules are renumbered.</summary>
public class RemovePlatformCourseModuleUseCase : IUseCase<RemovePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public RemovePlatformCourseModuleUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(RemovePlatformCourseModuleUseCaseInput input)
    {
        var (course, module) = await _editor.DraftModuleAsync(input.VersionNo, input.CourseId, input.ModuleId);
        await _editor.RemoveModulesAsync(new[] { module.Id });
        var others = await _context.PlatformCourseModules
            .Where(m => m.CatalogCourseId == course.Id && m.Id != module.Id)
            .OrderBy(m => m.SortOrder)
            .ToListAsync();
        PlatformCatalogEditor.Renumber(others, (m, n) => m.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
