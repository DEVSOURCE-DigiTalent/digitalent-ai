using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using QuestionBankEntity = DigiTalent.Domain.Entities.QuestionBank;

namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

public class CreateQuestionBankUseCase : IUseCase<CreateQuestionBankUseCaseInput, CreateQuestionBankUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateQuestionBankUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateQuestionBankUseCaseOutput> ExecuteAsync(CreateQuestionBankUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var bank = new QuestionBankEntity
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Title = input.Title.Trim(),
            Description = input.Description?.Trim(),
            OwnerUserId = input.OwnerUserId,
            Status = Statuses.QuestionBank.Active
        };

        _context.QuestionBanks.Add(bank);
        await _context.SaveChangesAsync();

        return new CreateQuestionBankUseCaseOutput
        {
            Id = bank.Id,
            Title = bank.Title,
            Status = bank.Status
        };
    }
}
