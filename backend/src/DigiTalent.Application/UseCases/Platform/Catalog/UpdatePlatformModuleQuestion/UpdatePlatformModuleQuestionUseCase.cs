using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves a review question in the draft: text, explanation (shown after the module is passed), linked block and
/// the ordered options with exactly one correct. Existing option rows are reused by position.
/// </summary>
public class UpdatePlatformModuleQuestionUseCase : IUseCase<UpdatePlatformModuleQuestionUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformModuleQuestionUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformModuleQuestionUseCaseInput input)
    {
        var (course, question) = await _editor.DraftQuestionAsync(input.VersionNo, input.CourseId, input.QuestionId);
        if (input.BlockId is { } blockId
            && !await _context.PlatformModuleBlocks.AnyAsync(b => b.Id == blockId && b.ModuleId == question.ModuleId))
        {
            throw new BadRequestException("Khối gắn với câu hỏi phải thuộc cùng mô đun.", "blockId", "BLOCK_NOT_IN_MODULE");
        }

        if (input.Text != null) question.QuestionText = input.Text.Trim();
        if (input.Explanation != null) question.Explanation = string.IsNullOrWhiteSpace(input.Explanation) ? null : input.Explanation.Trim();
        if (input.BlockId != null) question.BlockId = input.BlockId;
        PlatformCatalogEditor.MarkEdited(course);

        await _context.ExecuteInTransactionAsync(async () =>
        {
            if (input.Options != null)
            {
                var existing = await _context.PlatformQuestionOptions.Where(o => o.QuestionId == question.Id).OrderBy(o => o.SortOrder).ToListAsync();
                // At most one correct option per question (partial unique index): clear the flag first.
                if (existing.Any(o => o.IsCorrect))
                {
                    foreach (var option in existing) option.IsCorrect = false;
                    await _context.SaveChangesAsync();
                }

                for (var i = 0; i < input.Options.Count; i++)
                {
                    var option = i < existing.Count ? existing[i] : null;
                    if (option == null)
                    {
                        option = new PlatformQuestionOption { QuestionId = question.Id };
                        _context.PlatformQuestionOptions.Add(option);
                    }

                    option.SortOrder = i + 1;
                    option.OptionText = input.Options[i].Text?.Trim() ?? string.Empty;
                    option.IsCorrect = input.Options[i].IsCorrect;
                }

                _context.PlatformQuestionOptions.RemoveRange(existing.Skip(input.Options.Count));
            }

            await _context.SaveChangesAsync();
        });

        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
