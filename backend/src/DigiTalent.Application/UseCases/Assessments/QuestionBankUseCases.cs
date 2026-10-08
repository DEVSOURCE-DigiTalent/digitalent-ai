using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessments;

public class GetQuestionBanksUseCase : IUseCase<GetQuestionBanksInput, GetQuestionBanksOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetQuestionBanksUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetQuestionBanksOutput> ExecuteAsync(GetQuestionBanksInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _context.QuestionBanks.AsNoTracking()
            .Where(b => b.OrganizationId == organizationId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var questions = _context.Questions.AsNoTracking();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new QuestionBankDto
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Status = b.Status,
                QuestionCount = questions.Count(q => q.BankId == b.Id),
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync();

        return new GetQuestionBanksOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

public class GetQuestionBankByIdUseCase : IUseCase<GetQuestionBankByIdInput, QuestionBankDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetQuestionBankByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionBankDto> ExecuteAsync(GetQuestionBankByIdInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var bank = await _context.QuestionBanks.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == organizationId)
            ?? throw new NotFoundException($"QuestionBank '{input.Id}' not found.");

        var questionCount = await _context.Questions.AsNoTracking()
            .CountAsync(q => q.BankId == bank.Id);

        return new QuestionBankDto
        {
            Id = bank.Id,
            Title = bank.Title,
            Description = bank.Description,
            Status = bank.Status,
            QuestionCount = questionCount,
            CreatedAt = bank.CreatedAt,
        };
    }
}

public class CreateQuestionBankUseCase : IUseCase<CreateQuestionBankInput, QuestionBankDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateQuestionBankUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionBankDto> ExecuteAsync(CreateQuestionBankInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var bank = new QuestionBank
        {
            OrganizationId = organizationId,
            Title = input.Title.Trim(),
            Description = input.Description?.Trim(),
            OwnerUserId = input.OwnerTrainerId ?? _currentUser.UserId,
            Status = "ACTIVE",
        };
        _context.QuestionBanks.Add(bank);
        await _context.SaveChangesAsync();

        return new QuestionBankDto
        {
            Id = bank.Id,
            Title = bank.Title,
            Description = bank.Description,
            Status = bank.Status,
            QuestionCount = 0,
            CreatedAt = bank.CreatedAt,
        };
    }
}

public class UpdateQuestionBankUseCase : IUseCase<UpdateQuestionBankInput, QuestionBankDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateQuestionBankUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionBankDto> ExecuteAsync(UpdateQuestionBankInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var bank = await _context.QuestionBanks
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == organizationId)
            ?? throw new NotFoundException($"QuestionBank '{input.Id}' not found.");

        if (!string.IsNullOrWhiteSpace(input.Title))
            bank.Title = input.Title.Trim();
        if (input.Description != null)
            bank.Description = input.Description.Trim();

        await _context.SaveChangesAsync();

        var questionCount = await _context.Questions.AsNoTracking()
            .CountAsync(q => q.BankId == bank.Id);

        return new QuestionBankDto
        {
            Id = bank.Id,
            Title = bank.Title,
            Description = bank.Description,
            Status = bank.Status,
            QuestionCount = questionCount,
            CreatedAt = bank.CreatedAt,
        };
    }
}

public class DeleteQuestionBankUseCase : IUseCase<DeleteQuestionBankInput, DeleteQuestionBankOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteQuestionBankUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<DeleteQuestionBankOutput> ExecuteAsync(DeleteQuestionBankInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var bank = await _context.QuestionBanks
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == organizationId)
            ?? throw new NotFoundException($"QuestionBank '{input.Id}' not found.");

        bank.Status = "ARCHIVED";
        await _context.SaveChangesAsync();

        return new DeleteQuestionBankOutput { Success = true };
    }
}
