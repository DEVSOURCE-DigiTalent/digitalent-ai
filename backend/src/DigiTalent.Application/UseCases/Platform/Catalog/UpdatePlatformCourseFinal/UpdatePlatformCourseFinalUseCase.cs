using System.Text.Json;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves the course final in the draft: its title, the prompt (rich text, sanitized) and the criteria the department
/// manager grades. The final is manager-graded evidence, two attempts at most (Pulse §9.3).
/// </summary>
public class UpdatePlatformCourseFinalUseCase : IUseCase<UpdatePlatformCourseFinalUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformCourseFinalUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformCourseFinalUseCaseInput input)
    {
        var course = await _editor.DraftCourseAsync(input.VersionNo, input.CourseId);
        course.FinalTitle = input.Title.Trim();
        course.FinalPrompt = _editor.Sanitize(input.PromptHtml);
        course.FinalCriteria = JsonSerializer.Serialize(input.Criteria.Select(c => c.Trim()).ToList());
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
