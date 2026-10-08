using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessments;

public class GetQuestionsUseCase : IUseCase<GetQuestionsInput, GetQuestionsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetQuestionsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetQuestionsOutput> ExecuteAsync(GetQuestionsInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var bankExists = await _context.QuestionBanks.AsNoTracking()
            .AnyAsync(b => b.Id == input.BankId && b.OrganizationId == organizationId);
        if (!bankExists)
            throw new NotFoundException($"QuestionBank '{input.BankId}' not found.");

        var query = _context.Questions.AsNoTracking()
            .Where(q => q.BankId == input.BankId);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(q => q.Content.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var options = _context.QuestionOptions.AsNoTracking();

        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new QuestionDto
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
                CreatedAt = q.CreatedAt,
                Options = options.Where(o => o.QuestionId == q.Id)
                    .OrderBy(o => o.SortOrder)
                    .Select(o => new QuestionOptionDto
                    {
                        Id = o.Id,
                        Content = o.Content,
                        IsCorrect = o.IsCorrect,
                        SortOrder = o.SortOrder,
                    }).ToList(),
            })
            .ToListAsync();

        return new GetQuestionsOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

public class GetQuestionByIdUseCase : IUseCase<GetQuestionByIdInput, QuestionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetQuestionByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionDto> ExecuteAsync(GetQuestionByIdInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var q = await _context.Questions.AsNoTracking()
            .Where(q => q.Id == input.Id)
            .Where(q => _context.QuestionBanks.Any(b => b.Id == q.BankId && b.OrganizationId == organizationId))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Question '{input.Id}' not found.");

        var opts = await _context.QuestionOptions.AsNoTracking()
            .Where(o => o.QuestionId == q.Id)
            .OrderBy(o => o.SortOrder)
            .Select(o => new QuestionOptionDto
            {
                Id = o.Id,
                Content = o.Content,
                IsCorrect = o.IsCorrect,
                SortOrder = o.SortOrder,
            })
            .ToListAsync();

        return new QuestionDto
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
            CreatedAt = q.CreatedAt,
            Options = opts,
        };
    }
}

public class CreateQuestionUseCase : IUseCase<CreateQuestionInput, QuestionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionDto> ExecuteAsync(CreateQuestionInput input)
    {
        var userId = _currentUser.UserId
            ?? throw new ForbiddenException("Chưa xác thực.");
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var bankExists = await _context.QuestionBanks.AsNoTracking()
            .AnyAsync(b => b.Id == input.BankId && b.OrganizationId == organizationId);
        if (!bankExists)
            throw new NotFoundException($"QuestionBank '{input.BankId}' not found.");

        var question = new Question
        {
            BankId = input.BankId,
            CompetencyId = input.CompetencyId,
            QuestionType = input.QuestionType,
            Difficulty = input.Difficulty,
            Content = input.Content.Trim(),
            Explanation = input.Explanation?.Trim(),
            AiGeneratedFlag = input.AiGeneratedFlag,
            Status = input.Status ?? "DRAFT",
            CreatedByUserId = userId,
        };
        _context.Questions.Add(question);

        var optDtos = new List<QuestionOptionDto>();
        var sortOrder = 0;
        foreach (var opt in input.Options)
        {
            var option = new QuestionOption
            {
                QuestionId = question.Id,
                Content = opt.Content,
                IsCorrect = opt.IsCorrect,
                SortOrder = sortOrder++,
            };
            _context.QuestionOptions.Add(option);
            optDtos.Add(new QuestionOptionDto
            {
                Id = option.Id,
                Content = option.Content,
                IsCorrect = option.IsCorrect,
                SortOrder = option.SortOrder,
            });
        }

        await _context.SaveChangesAsync();

        return new QuestionDto
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
            Options = optDtos,
        };
    }
}

public class UpdateQuestionUseCase : IUseCase<UpdateQuestionInput, QuestionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionDto> ExecuteAsync(UpdateQuestionInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var question = await _context.Questions
            .Where(q => q.Id == input.Id)
            .Where(q => _context.QuestionBanks.Any(b => b.Id == q.BankId && b.OrganizationId == organizationId))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Question '{input.Id}' not found.");

        if (input.CompetencyId.HasValue) question.CompetencyId = input.CompetencyId;
        if (input.QuestionType != null) question.QuestionType = input.QuestionType;
        if (input.Difficulty != null) question.Difficulty = input.Difficulty;
        if (input.Content != null) question.Content = input.Content.Trim();
        if (input.Explanation != null) question.Explanation = input.Explanation.Trim();

        if (input.Options != null)
        {
            var existing = await _context.QuestionOptions
                .Where(o => o.QuestionId == question.Id).ToListAsync();
            foreach (var old in existing)
                _context.QuestionOptions.Remove(old);

            var sortOrder = 0;
            foreach (var opt in input.Options)
            {
                _context.QuestionOptions.Add(new QuestionOption
                {
                    QuestionId = question.Id,
                    Content = opt.Content,
                    IsCorrect = opt.IsCorrect,
                    SortOrder = sortOrder++,
                });
            }
        }

        await _context.SaveChangesAsync();

        var opts = await _context.QuestionOptions.AsNoTracking()
            .Where(o => o.QuestionId == question.Id)
            .OrderBy(o => o.SortOrder)
            .Select(o => new QuestionOptionDto
            {
                Id = o.Id, Content = o.Content, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder,
            }).ToListAsync();

        return new QuestionDto
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
            Options = opts,
        };
    }
}

public class DeleteQuestionUseCase : IUseCase<DeleteQuestionInput, DeleteQuestionOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<DeleteQuestionOutput> ExecuteAsync(DeleteQuestionInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var q = await _context.Questions
            .Where(q => q.Id == input.Id)
            .Where(q => _context.QuestionBanks.Any(b => b.Id == q.BankId && b.OrganizationId == organizationId))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Question '{input.Id}' not found.");

        q.Status = "ARCHIVED";
        await _context.SaveChangesAsync();
        return new DeleteQuestionOutput { Success = true };
    }
}

public class ChangeQuestionStatusUseCase : IUseCase<ChangeQuestionStatusInput, ChangeQuestionStatusOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ChangeQuestionStatusUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ChangeQuestionStatusOutput> ExecuteAsync(ChangeQuestionStatusInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var q = await _context.Questions
            .Where(q => q.Id == input.Id)
            .Where(q => _context.QuestionBanks.Any(b => b.Id == q.BankId && b.OrganizationId == organizationId))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Question '{input.Id}' not found.");

        var status = input.Status.Trim().ToUpper();
        if (status is not ("DRAFT" or "APPROVED" or "ARCHIVED"))
            throw new BadRequestException($"Status '{status}' không hợp lệ. Chỉ cho phép: DRAFT, APPROVED, ARCHIVED.");
        q.Status = status;
        await _context.SaveChangesAsync();
        return new ChangeQuestionStatusOutput { Success = true };
    }
}

public class ApproveQuestionUseCase : IUseCase<ApproveQuestionInput, QuestionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ApproveQuestionUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<QuestionDto> ExecuteAsync(ApproveQuestionInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var q = await _context.Questions
            .Where(q => q.Id == input.Id)
            .Where(q => _context.QuestionBanks.Any(b => b.Id == q.BankId && b.OrganizationId == organizationId))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Question '{input.Id}' not found.");

        q.Status = "APPROVED";
        await _context.SaveChangesAsync();

        var opts = await _context.QuestionOptions.AsNoTracking()
            .Where(o => o.QuestionId == q.Id).OrderBy(o => o.SortOrder)
            .Select(o => new QuestionOptionDto { Id = o.Id, Content = o.Content, IsCorrect = o.IsCorrect, SortOrder = o.SortOrder })
            .ToListAsync();

        return new QuestionDto
        {
            Id = q.Id, BankId = q.BankId, CompetencyId = q.CompetencyId,
            QuestionType = q.QuestionType, Difficulty = q.Difficulty,
            Content = q.Content, Explanation = q.Explanation,
            AiGeneratedFlag = q.AiGeneratedFlag, Status = q.Status,
            CreatedAt = q.CreatedAt, Options = opts,
        };
    }
}
