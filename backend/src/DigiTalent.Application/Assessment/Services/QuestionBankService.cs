using DigiTalent.Application.Assessment.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Assessment.Services;

public class QuestionBankService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public QuestionBankService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Question Banks
    // ═══════════════════════════════════════

    public async Task<PagedList<QuestionBankResponse>> SearchBanksAsync(PaginationRequest request)
    {
        var query = _context.QuestionBanks.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new QuestionBankResponse
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Status = b.Status,
                QuestionCount = b.Questions.Count,
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<QuestionBankResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<List<QuestionBankResponse>> GetAllBanksAsync()
    {
        return await _context.QuestionBanks
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new QuestionBankResponse
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Status = b.Status,
                QuestionCount = b.Questions.Count,
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<QuestionBankResponse> GetBankAsync(Guid bankId)
    {
        var bank = await _context.QuestionBanks
            .Include(b => b.Questions)
            .FirstOrDefaultAsync(b => b.Id == bankId)
            ?? throw new KeyNotFoundException("Question bank not found.");

        return new QuestionBankResponse
        {
            Id = bank.Id,
            Title = bank.Title,
            Description = bank.Description,
            Status = bank.Status,
            QuestionCount = bank.Questions.Count,
            CreatedAt = bank.CreatedAt,
        };
    }

    public async Task<QuestionBankResponse> CreateBankAsync(CreateQuestionBankRequest request)
    {
        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Assessment.QuestionBank
        {
            OrganizationId = orgId,
            Title = request.Title,
            Description = request.Description,
            OwnerTrainerId = request.OwnerTrainerId,
            Status = "ACTIVE",
        };
        _context.QuestionBanks.Add(entity);
        await _context.SaveChangesAsync(default);

        return new QuestionBankResponse
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<QuestionBankResponse> UpdateBankAsync(Guid bankId, UpdateQuestionBankRequest request)
    {
        var bank = await _context.QuestionBanks
            .Include(b => b.Questions)
            .FirstOrDefaultAsync(b => b.Id == bankId)
            ?? throw new KeyNotFoundException("Question bank not found.");

        if (request.Title != null) bank.Title = request.Title;
        if (request.Description != null) bank.Description = request.Description;
        await _context.SaveChangesAsync(default);

        return new QuestionBankResponse
        {
            Id = bank.Id,
            Title = bank.Title,
            Description = bank.Description,
            Status = bank.Status,
            QuestionCount = bank.Questions.Count,
            CreatedAt = bank.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Questions
    // ═══════════════════════════════════════

    public async Task<PagedList<QuestionResponse>> SearchQuestionsAsync(Guid bankId, PaginationRequest request)
    {
        var query = _context.Questions
            .Include(q => q.Options)
            .Where(q => q.BankId == bankId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(q => q.Content.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(q => new QuestionResponse
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
                Options = q.Options.OrderBy(o => o.SortOrder)
                    .Select(o => new QuestionOptionResponse
                    {
                        Id = o.Id, Content = o.Content,
                        IsCorrect = o.IsCorrect, SortOrder = o.SortOrder,
                    }).ToList(),
            })
            .ToListAsync();

        return new PagedList<QuestionResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<QuestionDetailResponse> GetQuestionAsync(Guid questionId)
    {
        var question = await _context.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == questionId)
            ?? throw new KeyNotFoundException("Question not found.");

        return MapQuestionDetail(question);
    }

    public async Task<QuestionDetailResponse> CreateQuestionAsync(Guid bankId, CreateQuestionRequest request)
    {
        var bank = await _context.QuestionBanks.FindAsync(bankId)
            ?? throw new KeyNotFoundException("Question bank not found.");

        if (request.QuestionType != "ESSAY" && (request.Options == null || request.Options.Count == 0))
            throw new InvalidOperationException("MCQ questions must have at least one option.");

        var entity = new Domain.Entities.Assessment.Question
        {
            BankId = bankId,
            CompetencyId = request.CompetencyId == default ? null : request.CompetencyId,
            QuestionType = request.QuestionType,
            Difficulty = request.Difficulty,
            Content = request.Content,
            Explanation = request.Explanation,
            AiGeneratedFlag = request.AiGeneratedFlag,
            Status = "DRAFT",
        };

        if (request.Options.Count > 0)
        {
            foreach (var opt in request.Options)
            {
                entity.Options.Add(new Domain.Entities.Assessment.QuestionOption
                {
                    Content = opt.Content,
                    IsCorrect = opt.IsCorrect,
                    SortOrder = opt.SortOrder,
                });
            }
        }

        _context.Questions.Add(entity);
        await _context.SaveChangesAsync(default);

        return MapQuestionDetail(entity);
    }

    public async Task<QuestionDetailResponse> UpdateQuestionAsync(Guid questionId, UpdateQuestionRequest request)
    {
        var question = await _context.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == questionId)
            ?? throw new KeyNotFoundException("Question not found.");

        if (request.Content != null) question.Content = request.Content;
        if (request.Explanation != null) question.Explanation = request.Explanation;
        if (request.Difficulty != null) question.Difficulty = request.Difficulty;
        if (request.Status != null) question.Status = request.Status;

        // Replace options if provided
        if (request.Options != null)
        {
            _context.QuestionOptions.RemoveRange(question.Options);
            foreach (var opt in request.Options)
            {
                question.Options.Add(new Domain.Entities.Assessment.QuestionOption
                {
                    Content = opt.Content,
                    IsCorrect = opt.IsCorrect,
                    SortOrder = opt.SortOrder,
                });
            }
        }

        await _context.SaveChangesAsync(default);

        return MapQuestionDetail(question);
    }

    public async Task ChangeQuestionStatusAsync(Guid questionId, string status)
    {
        var question = await _context.Questions.FindAsync(questionId)
            ?? throw new KeyNotFoundException("Question not found.");

        if (status != "DRAFT" && status != "PUBLISHED" && status != "ARCHIVED")
            throw new InvalidOperationException("Status must be DRAFT, PUBLISHED, or ARCHIVED.");

        question.Status = status;
        await _context.SaveChangesAsync(default);
    }

    /// <summary>
    /// Approve question for official use (sets status to PUBLISHED).
    /// </summary>
    public async Task<QuestionDetailResponse> ApproveQuestionAsync(Guid questionId, ApprovalRequest request)
    {
        var question = await _context.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == questionId)
            ?? throw new KeyNotFoundException("Question not found.");

        if (question.Status != "DRAFT")
            throw new InvalidOperationException("Only DRAFT questions can be approved.");

        question.Status = "PUBLISHED";
        await _context.SaveChangesAsync(default);

        return MapQuestionDetail(question);
    }

    // ═══════════════════════════════════════
    // AI Generate Draft (placeholder)
    // ═══════════════════════════════════════

    public async Task<List<QuestionDetailResponse>> GenerateAiDraftAsync(Guid bankId, Guid competencyId, int count = 5)
    {
        // Placeholder — sẽ tích hợp AI service sau
        var generated = new List<QuestionDetailResponse>();
        for (int i = 0; i < count; i++)
        {
            var entity = new Domain.Entities.Assessment.Question
            {
                BankId = bankId,
                CompetencyId = competencyId,
                QuestionType = "SINGLE_CHOICE",
                Difficulty = "MEDIUM",
                Content = $"[AI Draft #{i + 1}] Auto-generated question for competency",
                Explanation = "Auto-generated explanation",
                AiGeneratedFlag = true,
                Status = "DRAFT",
            };
            entity.Options.Add(new Domain.Entities.Assessment.QuestionOption
            {
                Content = "Option A", IsCorrect = true, SortOrder = 1,
            });
            entity.Options.Add(new Domain.Entities.Assessment.QuestionOption
            {
                Content = "Option B", IsCorrect = false, SortOrder = 2,
            });
            _context.Questions.Add(entity);
        }
        await _context.SaveChangesAsync(default);

        // Reload to get IDs
        var questions = await _context.Questions
            .Include(q => q.Options)
            .Where(q => q.BankId == bankId && q.CompetencyId == competencyId && q.AiGeneratedFlag)
            .OrderByDescending(q => q.CreatedAt)
            .Take(count)
            .ToListAsync();

        return questions.Select(MapQuestionDetail).ToList();
    }

    // ═══════════════════════════════════════
    // Private Mappers
    // ═══════════════════════════════════════

    private static QuestionDetailResponse MapQuestionDetail(Domain.Entities.Assessment.Question question)
    {
        return new QuestionDetailResponse
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
            Options = question.Options.OrderBy(o => o.SortOrder)
                .Select(o => new QuestionOptionResponse
                {
                    Id = o.Id, Content = o.Content,
                    IsCorrect = o.IsCorrect, SortOrder = o.SortOrder,
                }).ToList(),
        };
    }
}
