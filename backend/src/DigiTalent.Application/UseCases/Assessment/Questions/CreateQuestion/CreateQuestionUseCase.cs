using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using QuestionEntity = DigiTalent.Domain.Entities.Question;
using QuestionOptionEntity = DigiTalent.Domain.Entities.QuestionOption;
using QuestionTagAssignmentEntity = DigiTalent.Domain.Entities.QuestionTagAssignment;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class CreateQuestionUseCase : IUseCase<CreateQuestionUseCaseInput, CreateQuestionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateQuestionUseCaseOutput> ExecuteAsync(CreateQuestionUseCaseInput input)
    {
        var bankExists = await _context.QuestionBanks.AnyAsync(b => b.Id == input.BankId);
        if (!bankExists)
        {
            throw new NotFoundException($"Question bank with Id '{input.BankId}' not found.");
        }

        var distinctTagIds = input.TagIds.Distinct().ToList();
        if (distinctTagIds.Count > 0)
        {
            var validTagCount = await _context.QuestionTags.CountAsync(t => distinctTagIds.Contains(t.Id));
            if (validTagCount != distinctTagIds.Count)
            {
                throw new BadRequestException("One or more tag ids do not exist.");
            }
        }

        var question = new QuestionEntity
        {
            Id = Guid.NewGuid(),
            BankId = input.BankId,
            CompetencyId = input.CompetencyId,
            QuestionType = input.QuestionType,
            Difficulty = input.Difficulty,
            Content = input.Content.Trim(),
            Explanation = input.Explanation,
            AiGeneratedFlag = input.AiGeneratedFlag,
            Status = Statuses.Question.Draft,
            CreatedByUserId = _currentUser.UserId ?? Guid.Empty
        };
        _context.Questions.Add(question);

        var options = input.Options.Select(o => new QuestionOptionEntity
        {
            Id = Guid.NewGuid(),
            QuestionId = question.Id,
            Content = o.Content,
            IsCorrect = o.IsCorrect,
            SortOrder = o.SortOrder
        }).ToList();
        foreach (var option in options)
        {
            _context.QuestionOptions.Add(option);
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

        await _context.SaveChangesAsync();

        var tags = distinctTagIds.Count == 0
            ? new List<QuestionTagRefDto>()
            : await _context.QuestionTags
                .Where(t => distinctTagIds.Contains(t.Id))
                .Select(t => new QuestionTagRefDto { Id = t.Id, Name = t.Name, Category = t.Category })
                .ToListAsync();

        return new CreateQuestionUseCaseOutput
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
            Options = options.Select(o => new QuestionOptionDto
            {
                Id = o.Id, Content = o.Content, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder
            }).ToList(),
            Tags = tags
        };
    }
}
