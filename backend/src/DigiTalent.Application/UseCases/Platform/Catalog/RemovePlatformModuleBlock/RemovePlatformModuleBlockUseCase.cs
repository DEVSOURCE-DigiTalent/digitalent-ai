using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Removes a block (and the images of a slide) from the draft. Questions linked to it are relinked to the first
/// remaining block of the module, or left unlinked.
/// </summary>
public class RemovePlatformModuleBlockUseCase : IUseCase<RemovePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public RemovePlatformModuleBlockUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(RemovePlatformModuleBlockUseCaseInput input)
    {
        var (course, block) = await _editor.DraftBlockAsync(input.VersionNo, input.CourseId, input.BlockId);
        var others = await _context.PlatformModuleBlocks
            .Where(b => b.ModuleId == block.ModuleId && b.Id != block.Id)
            .OrderBy(b => b.SortOrder)
            .ToListAsync();
        var linked = await _context.PlatformModuleQuestions.Where(q => q.BlockId == block.Id).ToListAsync();
        foreach (var question in linked)
        {
            question.BlockId = others.FirstOrDefault()?.Id;
        }

        _context.PlatformSlideItems.RemoveRange(await _context.PlatformSlideItems.Where(i => i.BlockId == block.Id).ToListAsync());
        _context.PlatformModuleBlocks.Remove(block);
        PlatformCatalogEditor.Renumber(others, (b, n) => b.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
