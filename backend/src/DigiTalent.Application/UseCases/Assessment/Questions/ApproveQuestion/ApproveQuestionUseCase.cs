using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

/// <summary>Duyệt câu hỏi DRAFT để đưa vào sử dụng chính thức (chuyển sang PUBLISHED).</summary>
public class ApproveQuestionUseCase : IUseCase<ApproveQuestionUseCaseInput, ApproveQuestionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public ApproveQuestionUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApproveQuestionUseCaseOutput> ExecuteAsync(ApproveQuestionUseCaseInput input)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == input.Id);
        if (question == null)
        {
            throw new NotFoundException($"Question with Id '{input.Id}' not found.");
        }

        if (question.Status != Statuses.Question.Draft)
        {
            throw new ConflictException("Only DRAFT questions can be approved.");
        }

        question.Status = Statuses.Question.Published;
        await _context.SaveChangesAsync();

        return new ApproveQuestionUseCaseOutput { Id = question.Id, Status = question.Status };
    }
}
