using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;
using QuestionOptionEntity = DigiTalent.Domain.Entities.QuestionOption;
using QuestionTagAssignmentEntity = DigiTalent.Domain.Entities.QuestionTagAssignment;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class UpdateQuestionUseCase : IUseCase<UpdateQuestionUseCaseInput, UpdateQuestionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public UpdateQuestionUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UpdateQuestionUseCaseOutput> ExecuteAsync(UpdateQuestionUseCaseInput input)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == input.Id);
        if (question == null)
        {
            throw new NotFoundException($"Question with Id '{input.Id}' not found.");
        }

        if (input.Content != null) question.Content = input.Content;
        if (input.Explanation != null) question.Explanation = input.Explanation;
        if (input.Difficulty != null) question.Difficulty = input.Difficulty;
        if (input.Status != null) question.Status = input.Status;

        if (input.Options != null)
        {
            var existingOptions = await _context.QuestionOptions.Where(o => o.QuestionId == question.Id).ToListAsync();
            _context.QuestionOptions.RemoveRange(existingOptions);

            foreach (var opt in input.Options)
            {
                _context.QuestionOptions.Add(new QuestionOptionEntity
                {
                    Id = Guid.NewGuid(),
                    QuestionId = question.Id,
                    Content = opt.Content,
                    IsCorrect = opt.IsCorrect,
                    SortOrder = opt.SortOrder
                });
            }
        }

        if (input.TagIds != null)
        {
            var existingAssignments = await _context.QuestionTagAssignments.Where(a => a.QuestionId == question.Id).ToListAsync();
            _context.QuestionTagAssignments.RemoveRange(existingAssignments);

            var distinctTagIds = input.TagIds.Distinct().ToList();
            if (distinctTagIds.Count > 0)
            {
                var validTagCount = await _context.QuestionTags.CountAsync(t => distinctTagIds.Contains(t.Id));
                if (validTagCount != distinctTagIds.Count)
                {
                    throw new BadRequestException("One or more tag ids do not exist.");
                }

                foreach (var tagId in distinctTagIds)
                {
                    _context.QuestionTagAssignments.Add(new QuestionTagAssignmentEntity
                    {
                        Id = Guid.NewGuid(),
                        QuestionId = question.Id,
                        TagId = tagId
                    });
                }
            }
        }

        await _context.SaveChangesAsync();

        var options = await _context.QuestionOptions
            .Where(o => o.QuestionId == question.Id)
            .OrderBy(o => o.SortOrder)
            .Select(o => new QuestionOptionDto { Id = o.Id, Content = o.Content, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder })
            .ToListAsync();

        var tagIdsForQuestion = await _context.QuestionTagAssignments
            .Where(a => a.QuestionId == question.Id)
            .Select(a => a.TagId)
            .ToListAsync();
        var tags = await _context.QuestionTags
            .Where(t => tagIdsForQuestion.Contains(t.Id))
            .Select(t => new QuestionTagRefDto { Id = t.Id, Name = t.Name, Category = t.Category })
            .ToListAsync();

        return new UpdateQuestionUseCaseOutput
        {
            Id = question.Id,
            BankId = question.BankId,
            CompetencyId = question.CompetencyId,
            QuestionType = question.QuestionType,
            Difficulty = question.Difficulty,
            Content = question.Content,
            Explanation = question.Explanation,
            AiGeneratedFlag = question.AiGeneratedFlag,
            Status = question.Status,
            CreatedAt = question.CreatedAt,
            Options = options,
            Tags = tags
        };
    }
}
