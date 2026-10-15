using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Adds an empty content block — TEXT, SLIDE, IMAGE or VIDEO — to a module of the draft, at a position (0-based) or
/// at the end. The content is filled with UpdatePlatformModuleBlock and the asset upload.
/// </summary>
public class AddPlatformModuleBlockUseCase : IUseCase<AddPlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public AddPlatformModuleBlockUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(AddPlatformModuleBlockUseCaseInput input)
    {
        var (course, module) = await _editor.DraftModuleAsync(input.VersionNo, input.CourseId, input.ModuleId);
        var ordered = await _context.PlatformModuleBlocks.Where(b => b.ModuleId == module.Id).OrderBy(b => b.SortOrder).ToListAsync();
        var type = input.Type.Trim().ToUpperInvariant();
        var block = new PlatformModuleBlock
        {
            ModuleId = module.Id,
            BlockType = type,
            BodyHtml = type == PlatformCatalog.BlockType.Text ? string.Empty : null,
        };
        _context.PlatformModuleBlocks.Add(block);
        ordered.Insert(Math.Clamp(input.Position ?? ordered.Count, 0, ordered.Count), block);
        PlatformCatalogEditor.Renumber(ordered, (b, n) => b.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
