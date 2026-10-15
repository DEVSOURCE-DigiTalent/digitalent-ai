using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Adds a module, without content yet, at the end of a course in the draft.</summary>
public class AddPlatformCourseModuleUseCase : IUseCase<AddPlatformCourseModuleUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public AddPlatformCourseModuleUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(AddPlatformCourseModuleUseCaseInput input)
    {
        var course = await _editor.DraftCourseAsync(input.VersionNo, input.CourseId);
        var last = await _context.PlatformCourseModules.Where(m => m.CatalogCourseId == course.Id).MaxAsync(m => (int?)m.SortOrder) ?? 0;
        var title = input.Title.Trim();
        _context.PlatformCourseModules.Add(new PlatformCourseModule
        {
            CatalogCourseId = course.Id,
            SortOrder = last + 1,
            Title = title,
            QuizTitle = $"Câu hỏi ôn tập · {title}",
        });
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
