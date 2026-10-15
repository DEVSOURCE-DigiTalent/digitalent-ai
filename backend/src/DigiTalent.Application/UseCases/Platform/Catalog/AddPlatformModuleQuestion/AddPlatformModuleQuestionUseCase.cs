using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Adds a review question at the end of a module in the draft, linked to a block of the module (by default its first
/// block). Without options it starts with three empty options, the first one correct.
/// </summary>
public class AddPlatformModuleQuestionUseCase : IUseCase<AddPlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public AddPlatformModuleQuestionUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(AddPlatformModuleQuestionUseCaseInput input)
    {
        var (course, module) = await _editor.DraftModuleAsync(input.VersionNo, input.CourseId, input.ModuleId);
        var blocks = await _context.PlatformModuleBlocks.Where(b => b.ModuleId == module.Id).OrderBy(b => b.SortOrder).Select(b => b.Id).ToListAsync();
        if (input.BlockId is { } blockId && !blocks.Contains(blockId))
            throw new BadRequestException("Khối gắn với câu hỏi phải thuộc cùng mô đun.", "blockId", "BLOCK_NOT_IN_MODULE");

        var last = await _context.PlatformModuleQuestions.Where(q => q.ModuleId == module.Id).MaxAsync(q => (int?)q.SortOrder) ?? 0;
        var question = new PlatformModuleQuestion
        {
            ModuleId = module.Id,
            SortOrder = last + 1,
            QuestionText = input.Text?.Trim() ?? string.Empty,
            Explanation = string.IsNullOrWhiteSpace(input.Explanation) ? null : input.Explanation.Trim(),
            BlockId = input.BlockId ?? (blocks.Count > 0 ? blocks[0] : null),
        };
        _context.PlatformModuleQuestions.Add(question);
        var options = input.Options ?? new List<PlatformOptionInput> { new() { IsCorrect = true }, new(), new() };
        foreach (var (option, index) in options.Select((o, i) => (o, i)))
        {
            _context.PlatformQuestionOptions.Add(new PlatformQuestionOption
            {
                QuestionId = question.Id,
                SortOrder = index + 1,
                OptionText = option.Text?.Trim() ?? string.Empty,
                IsCorrect = option.IsCorrect,
            });
        }

        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
