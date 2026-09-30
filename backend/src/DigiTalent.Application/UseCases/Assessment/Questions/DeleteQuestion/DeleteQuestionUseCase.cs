using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

/// <summary>
/// Xóa câu hỏi. Chỉ cho phép khi câu hỏi đang DRAFT và chưa được gắn vào bài kiểm tra nào,
/// tránh làm hỏng đề thi đã publish hoặc lịch sử làm bài.
/// </summary>
public class DeleteQuestionUseCase : IUseCase<DeleteQuestionUseCaseInput, DeleteQuestionUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public DeleteQuestionUseCase(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DeleteQuestionUseCaseOutput> ExecuteAsync(DeleteQuestionUseCaseInput input)
    {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == input.Id);
        if (question == null)
        {
            throw new NotFoundException($"Question with Id '{input.Id}' not found.");
        }

        if (question.Status != Statuses.Question.Draft)
        {
            throw new ConflictException("Only DRAFT questions can be deleted.");
        }

        var isUsedInAssessment = await _context.AssessmentQuestions.AnyAsync(aq => aq.QuestionId == question.Id);
        if (isUsedInAssessment)
        {
            throw new ConflictException("Cannot delete a question that is already attached to an assessment.");
        }

        var options = await _context.QuestionOptions.Where(o => o.QuestionId == question.Id).ToListAsync();
        _context.QuestionOptions.RemoveRange(options);

        var tagAssignments = await _context.QuestionTagAssignments.Where(a => a.QuestionId == question.Id).ToListAsync();
        _context.QuestionTagAssignments.RemoveRange(tagAssignments);

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();

        return new DeleteQuestionUseCaseOutput { Id = question.Id };
    }
}
