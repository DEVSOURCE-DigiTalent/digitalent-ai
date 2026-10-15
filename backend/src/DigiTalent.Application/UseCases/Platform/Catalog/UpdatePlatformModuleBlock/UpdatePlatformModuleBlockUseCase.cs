using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves the content of a block in the draft. TEXT: sanitized HTML. IMAGE / VIDEO: an uploaded asset of the same
/// kind, caption and alt text. SLIDE: the whole ordered list of images and videos with captions (replaces the old
/// list). Fields left null are unchanged.
/// </summary>
public class UpdatePlatformModuleBlockUseCase : IUseCase<UpdatePlatformModuleBlockUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformModuleBlockUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformModuleBlockUseCaseInput input)
    {
        var (course, block) = await _editor.DraftBlockAsync(input.VersionNo, input.CourseId, input.BlockId);
        switch (block.BlockType)
        {
            case PlatformCatalog.BlockType.Text:
                if (input.BodyHtml != null) block.BodyHtml = _editor.Sanitize(input.BodyHtml);
                break;
            case PlatformCatalog.BlockType.Image:
            case PlatformCatalog.BlockType.Video:
                if (input.AssetId is { } assetId)
                {
                    var asset = await _context.PlatformAssets.AsNoTracking().FirstOrDefaultAsync(a => a.Id == assetId)
                                ?? throw new BadRequestException("Không tìm thấy tệp đã tải lên.", "assetId", "ASSET_NOT_FOUND");
                    if (asset.Kind != block.BlockType)
                        throw new BadRequestException(
                            block.BlockType == PlatformCatalog.BlockType.Image ? "Khối ảnh cần một tệp ảnh." : "Khối video cần một tệp video.",
                            "assetId", "ASSET_KIND_MISMATCH");
                    block.AssetId = asset.Id;
                }

                if (input.AltText != null) block.AltText = Clean(input.AltText);
                break;
            case PlatformCatalog.BlockType.Slide:
                if (input.Items != null) await ReplaceItemsAsync(block, input.Items);
                break;
        }

        if (input.Caption != null) block.Caption = Clean(input.Caption);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }

    private async Task ReplaceItemsAsync(PlatformModuleBlock block, List<PlatformSlideItemInput> items)
    {
        var assetIds = items.Select(i => i.AssetId).Distinct().ToList();
        var known = await _context.PlatformAssets.AsNoTracking().Where(a => assetIds.Contains(a.Id)).Select(a => a.Id).ToListAsync();
        if (known.Count != assetIds.Count)
            throw new BadRequestException("Có ảnh hoặc video trong slide chưa được tải lên.", "items", "ASSET_NOT_FOUND");

        _context.PlatformSlideItems.RemoveRange(await _context.PlatformSlideItems.Where(i => i.BlockId == block.Id).ToListAsync());
        foreach (var (item, index) in items.Select((item, index) => (item, index)))
        {
            _context.PlatformSlideItems.Add(new PlatformSlideItem
            {
                BlockId = block.Id,
                SortOrder = index + 1,
                AssetId = item.AssetId,
                Caption = Clean(item.Caption),
            });
        }
    }

    private static string? Clean(string? text) => string.IsNullOrWhiteSpace(text) ? null : text.Trim();
}
