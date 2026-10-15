using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Renames a module and its review quiz in the draft.</summary>
public class UpdatePlatformCourseModuleUseCase : IUseCase<UpdatePlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformCourseModuleUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformCourseModuleUseCaseInput input)
    {
        var (course, module) = await _editor.DraftModuleAsync(input.VersionNo, input.CourseId, input.ModuleId);
        module.Title = input.Title.Trim();
        if (!string.IsNullOrWhiteSpace(input.QuizTitle))
        {
            module.QuizTitle = input.QuizTitle.Trim();
        }

        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
