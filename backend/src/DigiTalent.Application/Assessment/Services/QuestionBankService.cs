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

    /// <summary>
    /// Delete a question bank. Only banks with no questions can be removed
    /// to avoid orphaning question records referenced elsewhere.
    /// </summary>
    public async Task DeleteBankAsync(Guid bankId)
    {
        var bank = await _context.QuestionBanks
            .Include(b => b.Questions)
            .FirstOrDefaultAsync(b => b.Id == bankId)
            ?? throw new KeyNotFoundException("Question bank not found.");

        if (bank.Questions.Count > 0)
            throw new InvalidOperationException("Cannot delete a question bank that still contains questions.");

        _context.QuestionBanks.Remove(bank);
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════════
    // Taxonomy Tags
    // ═══════════════════════════════════════

    public async Task<List<QuestionTagResponse>> GetAllTagsAsync()
    {
        return await _context.QuestionTags
            .OrderBy(t => t.Category).ThenBy(t => t.Name)
            .Select(t => new QuestionTagResponse { Id = t.Id, Name = t.Name, Category = t.Category })
            .ToListAsync();
    }

    public async Task<QuestionTagResponse> CreateTagAsync(CreateQuestionTagRequest request)
    {
        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var exists = await _context.QuestionTags
            .AnyAsync(t => t.OrganizationId == orgId && t.Name.ToLower() == request.Name.ToLower());
        if (exists)
            throw new InvalidOperationException($"Tag '{request.Name}' already exists.");

        var entity = new Domain.Entities.Assessment.QuestionTag
        {
            OrganizationId = orgId,
            Name = request.Name,
            Category = request.Category,
        };
        _context.QuestionTags.Add(entity);
        await _context.SaveChangesAsync(default);

        return new QuestionTagResponse { Id = entity.Id, Name = entity.Name, Category = entity.Category };
    }

    // ═══════════════════════════════════════
    // Questions
    // ═══════════════════════════════════════

    public async Task<PagedList<QuestionResponse>> SearchQuestionsAsync(Guid bankId, PaginationRequest request, Guid? tagId = null)
    {
        var query = _context.Questions
            .Include(q => q.Options)
            .Include(q => q.TagAssignments).ThenInclude(a => a.Tag)
            .Where(q => q.BankId == bankId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(q => q.Content.ToLower().Contains(kw));
        }

        if (tagId.HasValue)
        {
            query = query.Where(q => q.TagAssignments.Any(a => a.TagId == tagId.Value));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(q => q.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return new PagedList<QuestionResponse>
        {
            Items = items.Select(q => (QuestionResponse)MapQuestionDetail(q)).ToList(),
            PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<QuestionDetailResponse> GetQuestionAsync(Guid questionId)
    {
        var question = await _context.Questions
            .Include(q => q.Options)
            .Include(q => q.TagAssignments).ThenInclude(a => a.Tag)
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

        if (request.TagIds.Count > 0)
            await AttachTagsAsync(entity, request.TagIds);

        _context.Questions.Add(entity);
        await _context.SaveChangesAsync(default);

        return MapQuestionDetail(entity);
    }

    public async Task<QuestionDetailResponse> UpdateQuestionAsync(Guid questionId, UpdateQuestionRequest request)
    {
        var question = await _context.Questions
            .Include(q => q.Options)
            .Include(q => q.TagAssignments).ThenInclude(a => a.Tag)
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

        // Replace tags if provided
        if (request.TagIds != null)
        {
            _context.QuestionTagAssignments.RemoveRange(question.TagAssignments);
            question.TagAssignments.Clear();
            if (request.TagIds.Count > 0)
                await AttachTagsAsync(question, request.TagIds);
        }

        await _context.SaveChangesAsync(default);

        return MapQuestionDetail(question);
    }

    /// <summary>
    /// Delete a question. Only DRAFT questions with no assessment usage can be removed
    /// so published exam content and historical attempts stay intact.
    /// </summary>
    public async Task DeleteQuestionAsync(Guid questionId)
    {
        var question = await _context.Questions.FindAsync(questionId)
            ?? throw new KeyNotFoundException("Question not found.");

        if (question.Status != "DRAFT")
            throw new InvalidOperationException("Only DRAFT questions can be deleted.");

        var isUsedInAssessment = await _context.AssessmentQuestions.AnyAsync(aq => aq.QuestionId == questionId);
        if (isUsedInAssessment)
            throw new InvalidOperationException("Cannot delete a question that is already attached to an assessment.");

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync(default);
    }

    private async Task AttachTagsAsync(Domain.Entities.Assessment.Question question, List<Guid> tagIds)
    {
        var distinctTagIds = tagIds.Distinct().ToList();
        var validTagCount = await _context.QuestionTags.CountAsync(t => distinctTagIds.Contains(t.Id));
        if (validTagCount != distinctTagIds.Count)
            throw new InvalidOperationException("One or more tag ids do not exist.");

        foreach (var tagId in distinctTagIds)
        {
            question.TagAssignments.Add(new Domain.Entities.Assessment.QuestionTagAssignment { TagId = tagId });
        }
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
            .Include(q => q.TagAssignments).ThenInclude(a => a.Tag)
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
            Tags = question.TagAssignments
                .Where(a => a.Tag != null)
                .Select(a => new QuestionTagResponse { Id = a.Tag.Id, Name = a.Tag.Name, Category = a.Tag.Category })
                .ToList(),
        };
    }
}
