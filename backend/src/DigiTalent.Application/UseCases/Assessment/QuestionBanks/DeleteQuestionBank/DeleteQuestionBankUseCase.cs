using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

/// <summary>
/// Xóa ngân hàng câu hỏi. Chỉ cho phép khi bank không còn câu hỏi nào,
/// tránh mất dữ liệu câu hỏi đã được tham chiếu ở nơi khác.
/// </summary>
public class DeleteQuestionBankUseCase : IUseCase<DeleteQuestionBankUseCaseInput, DeleteQuestionBankUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteQuestionBankUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<DeleteQuestionBankUseCaseOutput> ExecuteAsync(DeleteQuestionBankUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var bank = await _context.QuestionBanks
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == organizationId);

        if (bank == null)
        {
            throw new NotFoundException($"Question bank with Id '{input.Id}' not found.");
        }

        var hasQuestions = await _context.Questions.AnyAsync(q => q.BankId == bank.Id);
        if (hasQuestions)
        {
            throw new ConflictException($"Cannot delete question bank '{bank.Title}' because it still contains questions.");
        }

        _context.QuestionBanks.Remove(bank);
        await _context.SaveChangesAsync();

        return new DeleteQuestionBankUseCaseOutput { Id = bank.Id };
    }
}
