using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Moves a module to another position (0-based, clamped) in the draft.</summary>
public class MovePlatformCourseModuleUseCase : IUseCase<MovePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public MovePlatformCourseModuleUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(MovePlatformCourseModuleUseCaseInput input)
    {
        var (course, module) = await _editor.DraftModuleAsync(input.VersionNo, input.CourseId, input.ModuleId);
        var ordered = await _context.PlatformCourseModules.Where(m => m.CatalogCourseId == course.Id).OrderBy(m => m.SortOrder).ToListAsync();
        PlatformCatalogEditor.Move(ordered, ordered.Single(m => m.Id == module.Id), input.ToIndex, (m, n) => m.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
