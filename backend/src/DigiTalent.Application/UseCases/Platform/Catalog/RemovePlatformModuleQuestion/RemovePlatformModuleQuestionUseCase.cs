using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>Removes a review question and its options from the draft; the other questions are renumbered.</summary>
public class RemovePlatformModuleQuestionUseCase : IUseCase<RemovePlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public RemovePlatformModuleQuestionUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(RemovePlatformModuleQuestionUseCaseInput input)
    {
        var (course, question) = await _editor.DraftQuestionAsync(input.VersionNo, input.CourseId, input.QuestionId);
        _context.PlatformQuestionOptions.RemoveRange(await _context.PlatformQuestionOptions.Where(o => o.QuestionId == question.Id).ToListAsync());
        _context.PlatformModuleQuestions.Remove(question);
        var others = await _context.PlatformModuleQuestions
            .Where(q => q.ModuleId == question.ModuleId && q.Id != question.Id)
            .OrderBy(q => q.SortOrder)
            .ToListAsync();
        PlatformCatalogEditor.Renumber(others, (q, n) => q.SortOrder = n);
        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
