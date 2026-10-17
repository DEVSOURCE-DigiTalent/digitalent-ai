using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Images illustrate the adjacent text page; video and slide blocks remain independent pages.
/// Authoring keeps every block in its own position. This grouping only controls the learner presentation.</summary>
public static class PlatformLessonPages
{
    public static List<List<PlatformModuleBlock>> Group(IEnumerable<PlatformModuleBlock> source)
    {
        var pages = new List<List<PlatformModuleBlock>>();
        var leadingImages = new List<PlatformModuleBlock>();
        foreach (var block in source.OrderBy(b => b.SortOrder))
        {
            if (block.BlockType == "IMAGE")
            {
                if (pages.Count > 0 && pages[^1].Any(b => b.BlockType == "TEXT")) pages[^1].Add(block);
                else leadingImages.Add(block);
                continue;
            }
            if (block.BlockType == "TEXT")
            {
                pages.Add([.. leadingImages, block]);
                leadingImages.Clear();
            }
            else
            {
                foreach (var image in leadingImages) pages.Add([image]);
                leadingImages.Clear();
                pages.Add([block]);
            }
        }
        foreach (var image in leadingImages) pages.Add([image]);
        return pages;
    }
}
