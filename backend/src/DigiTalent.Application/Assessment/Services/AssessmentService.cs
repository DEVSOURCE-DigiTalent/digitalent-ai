using DigiTalent.Application.Assessment.DTOs;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Assessment.Services;

public class AssessmentService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public AssessmentService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Assessments
    // ═══════════════════════════════════════

    public async Task<PagedList<AssessmentResponse>> SearchAssessmentsAsync(PaginationRequest request)
    {
        var query = _context.Assessments
            .Include(a => a.Course)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(a => a.Title.ToLower().Contains(kw)
                                  || a.Course.Title.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AssessmentResponse
            {
                Id = a.Id,
                CourseId = a.CourseId,
                CourseTitle = a.Course.Title,
                Title = a.Title,
                AssessmentType = a.AssessmentType,
                TimeLimitMinutes = a.TimeLimitMinutes,
                MaxAttempts = a.MaxAttempts,
                PassingScore = a.PassingScore,
                Status = a.Status,
                QuestionCount = a.AssessmentQuestions.Count,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<AssessmentResponse>
        {
            Items = items, PageIndex = request.PageIndex,
            PageSize = request.PageSize, TotalItems = totalItems,
        };
    }

    public async Task<List<AssessmentResponse>> GetAssessmentsByCourseAsync(Guid courseId)
    {
        return await _context.Assessments
            .Include(a => a.Course)
            .Where(a => a.CourseId == courseId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AssessmentResponse
            {
                Id = a.Id,
                CourseId = a.CourseId,
                CourseTitle = a.Course.Title,
                Title = a.Title,
                AssessmentType = a.AssessmentType,
                TimeLimitMinutes = a.TimeLimitMinutes,
                MaxAttempts = a.MaxAttempts,
                PassingScore = a.PassingScore,
                Status = a.Status,
                QuestionCount = a.AssessmentQuestions.Count,
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<AssessmentDetailResponse> GetAssessmentAsync(Guid assessmentId)
    {
        var assessment = await _context.Assessments
            .Include(a => a.Course)
            .Include(a => a.AssessmentQuestions)
                .ThenInclude(aq => aq.Question)
                    .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(a => a.Id == assessmentId)
            ?? throw new KeyNotFoundException("Assessment not found.");

        return new AssessmentDetailResponse
        {
            Id = assessment.Id,
            CourseId = assessment.CourseId,
            CourseTitle = assessment.Course.Title,
            Title = assessment.Title,
            AssessmentType = assessment.AssessmentType,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            MaxAttempts = assessment.MaxAttempts,
            PassingScore = assessment.PassingScore,
            Status = assessment.Status,
            QuestionCount = assessment.AssessmentQuestions.Count,
            CreatedAt = assessment.CreatedAt,
            Questions = assessment.AssessmentQuestions
                .OrderBy(aq => aq.SortOrder)
                .Select(aq => new AssessmentQuestionResponse
                {
                    AssessmentId = aq.AssessmentId,
                    QuestionId = aq.QuestionId,
                    QuestionContent = aq.Question.Content,
                    QuestionType = aq.Question.QuestionType,
                    ScoreWeight = aq.ScoreWeight,
                    SortOrder = aq.SortOrder,
                })
                .ToList(),
        };
    }

    public async Task<AssessmentResponse> CreateAssessmentAsync(CreateAssessmentRequest request)
    {
        var course = await _context.Courses.FindAsync(request.CourseId)
            ?? throw new KeyNotFoundException("Course not found.");

        var entity = new Domain.Entities.Assessment.Assessment
        {
            CourseId = request.CourseId,
            Title = request.Title,
            AssessmentType = request.AssessmentType,
            TimeLimitMinutes = request.TimeLimitMinutes,
            MaxAttempts = request.MaxAttempts,
            PassingScore = request.PassingScore,
            Status = "DRAFT",
        };
        _context.Assessments.Add(entity);
        await _context.SaveChangesAsync(default);

        return new AssessmentResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            CourseTitle = course.Title,
            Title = entity.Title,
            AssessmentType = entity.AssessmentType,
            TimeLimitMinutes = entity.TimeLimitMinutes,
            MaxAttempts = entity.MaxAttempts,
            PassingScore = entity.PassingScore,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<AssessmentResponse> UpdateAssessmentAsync(Guid assessmentId, UpdateAssessmentRequest request)
    {
        var assessment = await _context.Assessments
            .Include(a => a.Course)
            .FirstOrDefaultAsync(a => a.Id == assessmentId)
            ?? throw new KeyNotFoundException("Assessment not found.");

        if (request.Title != null) assessment.Title = request.Title;
        if (request.AssessmentType != null) assessment.AssessmentType = request.AssessmentType;
        if (request.TimeLimitMinutes.HasValue) assessment.TimeLimitMinutes = request.TimeLimitMinutes;
        if (request.MaxAttempts.HasValue) assessment.MaxAttempts = request.MaxAttempts;
        if (request.PassingScore.HasValue) assessment.PassingScore = request.PassingScore.Value;
        await _context.SaveChangesAsync(default);

        return new AssessmentResponse
        {
            Id = assessment.Id,
            CourseId = assessment.CourseId,
            CourseTitle = assessment.Course.Title,
            Title = assessment.Title,
            AssessmentType = assessment.AssessmentType,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            MaxAttempts = assessment.MaxAttempts,
            PassingScore = assessment.PassingScore,
            Status = assessment.Status,
            QuestionCount = assessment.AssessmentQuestions.Count,
            CreatedAt = assessment.CreatedAt,
        };
    }

    public async Task ChangeAssessmentStatusAsync(Guid assessmentId, string status)
    {
        var assessment = await _context.Assessments.FindAsync(assessmentId)
            ?? throw new KeyNotFoundException("Assessment not found.");

        if (status != "DRAFT" && status != "PUBLISHED" && status != "CLOSED")
            throw new InvalidOperationException("Status must be DRAFT, PUBLISHED, or CLOSED.");

        assessment.Status = status;
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════════
    // Assessment Questions (junction)
    // ═══════════════════════════════════════

    public async Task<List<AssessmentQuestionResponse>> GetAssessmentQuestionsAsync(Guid assessmentId)
    {
        return await _context.AssessmentQuestions
            .Include(aq => aq.Question)
            .Where(aq => aq.AssessmentId == assessmentId)
            .OrderBy(aq => aq.SortOrder)
            .Select(aq => new AssessmentQuestionResponse
            {
                AssessmentId = aq.AssessmentId,
                QuestionId = aq.QuestionId,
                QuestionContent = aq.Question.Content,
                QuestionType = aq.Question.QuestionType,
                ScoreWeight = aq.ScoreWeight,
                SortOrder = aq.SortOrder,
            })
            .ToListAsync();
    }

    public async Task<List<AssessmentQuestionResponse>> SaveAssessmentQuestionsAsync(
        Guid assessmentId, SaveAssessmentQuestionsRequest request)
    {
        var assessment = await _context.Assessments.FindAsync(assessmentId)
            ?? throw new KeyNotFoundException("Assessment not found.");

        // Remove existing questions
        var existing = await _context.AssessmentQuestions
            .Where(aq => aq.AssessmentId == assessmentId)
            .ToListAsync();
        _context.AssessmentQuestions.RemoveRange(existing);

        // Add new questions
        foreach (var q in request.Questions)
        {
            var question = await _context.Questions.FindAsync(q.QuestionId)
                ?? throw new KeyNotFoundException($"Question {q.QuestionId} not found.");

            _context.AssessmentQuestions.Add(new Domain.Entities.Assessment.AssessmentQuestion
            {
                AssessmentId = assessmentId,
                QuestionId = q.QuestionId,
                ScoreWeight = q.ScoreWeight,
                SortOrder = q.SortOrder,
            });
        }

        await _context.SaveChangesAsync(default);

        return await GetAssessmentQuestionsAsync(assessmentId);
    }
}
