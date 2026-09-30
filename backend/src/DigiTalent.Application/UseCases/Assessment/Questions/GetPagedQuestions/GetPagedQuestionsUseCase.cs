using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class GetPagedQuestionsUseCase : IUseCase<GetPagedQuestionsUseCaseInput, GetPagedQuestionsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPagedQuestionsUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<GetPagedQuestionsUseCaseOutput> ExecuteAsync(GetPagedQuestionsUseCaseInput input)
    {
        var query = _context.Questions
            .AsNoTracking()
            .Where(q => q.BankId == input.BankId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(q => q.Content.ToLower().Contains(search));
        }

        if (input.TagId.HasValue)
        {
            var tagId = input.TagId.Value;
            var questionIdsWithTag = _context.QuestionTagAssignments
                .Where(a => a.TagId == tagId)
                .Select(a => a.QuestionId);
            query = query.Where(q => questionIdsWithTag.Contains(q.Id));
        }

        var totalItems = await query.CountAsync();

        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var questions = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new QuestionListItemDto
            {
                Id = q.Id,
                BankId = q.BankId,
                CompetencyId = q.CompetencyId,
                QuestionType = q.QuestionType,
                Difficulty = q.Difficulty,
                Content = q.Content,
                Explanation = q.Explanation,
                AiGeneratedFlag = q.AiGeneratedFlag,
                Status = q.Status,
                CreatedAt = q.CreatedAt
            })
            .ToListAsync();

        var questionIds = questions.Select(q => q.Id).ToList();

        var options = await _context.QuestionOptions
            .Where(o => questionIds.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder)
            .ToListAsync();

        var tagAssignments = await _context.QuestionTagAssignments
            .Where(a => questionIds.Contains(a.QuestionId))
            .ToListAsync();
        var tagIds = tagAssignments.Select(a => a.TagId).Distinct().ToList();
        var tags = await _context.QuestionTags
            .Where(t => tagIds.Contains(t.Id))
            .ToListAsync();

        foreach (var question in questions)
        {
            question.Options = options
                .Where(o => o.QuestionId == question.Id)
                .Select(o => new QuestionOptionDto { Id = o.Id, Content = o.Content, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder })
                .ToList();

            var questionTagIds = tagAssignments.Where(a => a.QuestionId == question.Id).Select(a => a.TagId).ToList();
            question.Tags = tags
                .Where(t => questionTagIds.Contains(t.Id))
                .Select(t => new QuestionTagRefDto { Id = t.Id, Name = t.Name, Category = t.Category })
                .ToList();
        }

        return new GetPagedQuestionsUseCaseOutput
        {
            Items = questions,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize
        };
    }
}
