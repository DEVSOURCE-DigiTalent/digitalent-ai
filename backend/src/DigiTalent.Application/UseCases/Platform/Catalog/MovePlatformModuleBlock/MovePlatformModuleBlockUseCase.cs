using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Moves a block to another position (0-based, clamped) inside its module in the draft.</summary>
public class MovePlatformModuleBlockUseCase : IUseCase<MovePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public MovePlatformModuleBlockUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(MovePlatformModuleBlockUseCaseInput input)
    {
        var (course, block) = await _editor.DraftBlockAsync(input.VersionNo, input.CourseId, input.BlockId);
        var ordered = await _context.PlatformModuleBlocks.Where(b => b.ModuleId == block.ModuleId).OrderBy(b => b.SortOrder).ToListAsync();
        PlatformCatalogEditor.Move(ordered, ordered.Single(b => b.Id == block.Id), input.ToIndex, (b, n) => b.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
