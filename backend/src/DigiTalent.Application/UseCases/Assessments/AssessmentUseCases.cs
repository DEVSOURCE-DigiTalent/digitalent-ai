using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessments;

public class GetAssessmentByIdUseCase : IUseCase<GetAssessmentByIdInput, AssessmentDto>
{
    private readonly IApplicationDbContext _context;

    public GetAssessmentByIdUseCase(IApplicationDbContext context) => _context = context;

    public async Task<AssessmentDto> ExecuteAsync(GetAssessmentByIdInput input)
    {
        var assessment = await _context.Assessments.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == input.Id)
            ?? throw new NotFoundException($"Assessment '{input.Id}' not found.");

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == assessment.CourseId)
            .Select(c => new { c.Code, c.Title })
            .FirstOrDefaultAsync();

        var questionIds = await _context.AssessmentQuestions.AsNoTracking()
            .Where(aq => aq.AssessmentId == assessment.Id)
            .OrderBy(aq => aq.SortOrder)
            .Select(aq => aq.QuestionId)
            .ToListAsync();

        var questions = await _context.Questions.AsNoTracking()
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        var allOptions = await _context.QuestionOptions.AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder)
            .ToListAsync();

        var competencyIds = questions.Where(q => q.CompetencyId.HasValue)
            .Select(q => q.CompetencyId!.Value).Distinct().ToList();
        var competencyCodes = await _context.Competencies.AsNoTracking()
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Code);

        var questionDtos = questionIds.Select(qId =>
        {
            var q = questions.FirstOrDefault(x => x.Id == qId);
            if (q == null) return null;
            var opts = allOptions.Where(o => o.QuestionId == qId).ToList();
            return new AssessmentQuestionDto
            {
                Id = q.Id,
                QuestionText = q.Content,
                Options = opts.Select(o => o.Content).ToList(),
                CompetencyCode = q.CompetencyId.HasValue
                    ? competencyCodes.GetValueOrDefault(q.CompetencyId.Value)
                    : null,
            };
        }).Where(x => x != null).ToList()!;

        return new AssessmentDto
        {
            Id = assessment.Id,
            CourseId = assessment.CourseId,
            CourseCode = course?.Code,
            CourseTitle = course?.Title,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            PassPercentage = assessment.PassingScore,
            Questions = questionDtos!,
        };
    }
}

public class SubmitAttemptUseCase : IUseCase<SubmitAttemptInput, AttemptResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public SubmitAttemptUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AttemptResultDto> ExecuteAsync(SubmitAttemptInput input)
    {
        var employeeId = _currentUser.EmployeeId
            ?? throw new ForbiddenException("Chỉ nhân viên mới làm bài đánh giá.");

        var assessment = await _context.Assessments.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == input.AssessmentId)
            ?? throw new NotFoundException($"Assessment '{input.AssessmentId}' not found.");

        var enrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId && e.CourseId == assessment.CourseId
                && e.Status != "CANCELLED")
            ?? throw new BadRequestException("Bạn chưa ghi danh khóa học này.");

        var assessmentQuestions = await _context.AssessmentQuestions.AsNoTracking()
            .Where(aq => aq.AssessmentId == assessment.Id)
            .OrderBy(aq => aq.SortOrder)
            .ToListAsync();

        var questionIds = assessmentQuestions.Select(aq => aq.QuestionId).ToList();
        var questions = await _context.Questions.AsNoTracking()
            .Where(q => questionIds.Contains(q.Id)).ToListAsync();

        var allOptions = await _context.QuestionOptions.AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder).ToListAsync();

        var competencyIds = questions.Where(q => q.CompetencyId.HasValue)
            .Select(q => q.CompetencyId!.Value).Distinct().ToList();
        var competencyCodes = await _context.Competencies.AsNoTracking()
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => c.Code);

        var prevAttempts = await _context.AssessmentAttempts.AsNoTracking()
            .CountAsync(a => a.AssessmentId == assessment.Id && a.EnrollmentId == enrollment.Id);

        var now = DateTimeOffset.UtcNow;
        var startedAt = !string.IsNullOrEmpty(input.StartedAt)
            ? DateTimeOffset.Parse(input.StartedAt)
            : now.AddSeconds(-input.DurationSeconds);

        var attempt = new Domain.Entities.AssessmentAttempt
        {
            AssessmentId = assessment.Id,
            EnrollmentId = enrollment.Id,
            AttemptNo = prevAttempts + 1,
            Status = "SCORED",
            StartedAt = startedAt,
            SubmittedAt = now,
        };
        _context.AssessmentAttempts.Add(attempt);

        var correctCount = 0;
        var gradedQuestions = new List<GradedQuestionDto>();

        foreach (var aq in assessmentQuestions)
        {
            var question = questions.FirstOrDefault(q => q.Id == aq.QuestionId);
            if (question == null) continue;

            var opts = allOptions.Where(o => o.QuestionId == question.Id).ToList();
            var correctIdx = opts.FindIndex(o => o.IsCorrect);
            var selectedIdx = input.Answers.TryGetValue(question.Id.ToString(), out var idx) ? idx : -1;
            var isCorrect = selectedIdx == correctIdx;
            if (isCorrect) correctCount++;

            var selectedOption = selectedIdx >= 0 && selectedIdx < opts.Count ? opts[selectedIdx] : null;

            _context.AssessmentAnswers.Add(new Domain.Entities.AssessmentAnswer
            {
                AttemptId = attempt.Id,
                QuestionId = question.Id,
                SelectedOptionId = selectedOption?.Id,
                IsCorrect = isCorrect,
                PointsAwarded = isCorrect ? aq.Points : 0,
            });

            gradedQuestions.Add(new GradedQuestionDto
            {
                Id = question.Id,
                QuestionText = question.Content,
                Options = opts.Select(o => o.Content).ToList(),
                CorrectOptionIndex = correctIdx,
                Explanation = question.Explanation,
                CompetencyCode = question.CompetencyId.HasValue
                    ? competencyCodes.GetValueOrDefault(question.CompetencyId.Value) : null,
                SelectedOptionIndex = selectedIdx,
                IsCorrect = isCorrect,
            });
        }

        var totalQuestions = assessmentQuestions.Count;
        var score = totalQuestions > 0
            ? Math.Round((decimal)correctCount / totalQuestions * 100, 1)
            : 0;
        var passed = score >= assessment.PassingScore;

        attempt.Score = score;
        attempt.Passed = passed;
        attempt.ScoredAt = now;

        if (passed)
        {
            enrollment.Status = "COMPLETED";
            enrollment.CompletedAt = now;
            enrollment.ProgressPercent = 100;
        }

        await _context.SaveChangesAsync();

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == assessment.CourseId)
            .Select(c => new { c.Title }).FirstOrDefaultAsync();

        var empName = await _context.Employees.AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => e.FullName).FirstOrDefaultAsync() ?? "";

        return new AttemptResultDto
        {
            Attempt = new AttemptSummary
            {
                Id = attempt.Id,
                AssessmentId = assessment.Id,
                CourseId = assessment.CourseId,
                CourseTitle = course?.Title ?? "",
                EmployeeId = employeeId,
                EmployeeName = empName,
                Score = score,
                TotalQuestions = totalQuestions,
                CorrectAnswers = correctCount,
                Passed = passed,
                StartedAt = attempt.StartedAt,
                SubmittedAt = attempt.SubmittedAt,
                DurationSeconds = input.DurationSeconds,
            },
            Passed = passed,
            Score = score,
            PassPercentage = assessment.PassingScore,
            CorrectCount = correctCount,
            TotalQuestions = totalQuestions,
            Questions = gradedQuestions,
        };
    }
}

public class GetAssessmentHistoryUseCase : IUseCase<GetAssessmentHistoryInput, GetAssessmentHistoryOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetAssessmentHistoryUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetAssessmentHistoryOutput> ExecuteAsync(GetAssessmentHistoryInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var query =
            from att in _context.AssessmentAttempts.AsNoTracking()
            join a in _context.Assessments.AsNoTracking() on att.AssessmentId equals a.Id
            join c in _context.Courses.AsNoTracking() on a.CourseId equals c.Id
            join enr in _context.Enrollments.AsNoTracking() on att.EnrollmentId equals enr.Id
            join emp in _context.Employees.AsNoTracking() on enr.EmployeeId equals emp.Id
            where c.OrganizationId == organizationId
            select new { att, a, c, emp };

        if (input.EmployeeId.HasValue)
            query = query.Where(x => x.emp.Id == input.EmployeeId.Value);

        if (input.CourseId.HasValue)
            query = query.Where(x => x.a.CourseId == input.CourseId.Value);

        if (input.Passed.HasValue)
            query = query.Where(x => x.att.Passed == input.Passed.Value);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(x =>
                x.emp.FullName.ToLower().Contains(search) ||
                x.c.Title.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var items = await query
            .OrderByDescending(x => x.att.SubmittedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AssessmentAttemptRowDto
            {
                Id = x.att.Id,
                AssessmentId = x.att.AssessmentId,
                CourseId = x.a.CourseId,
                CourseTitle = x.c.Title,
                EmployeeId = x.emp.Id,
                EmployeeName = x.emp.FullName,
                Score = x.att.Score ?? 0,
                TotalQuestions = _context.AssessmentQuestions.Count(aq => aq.AssessmentId == x.att.AssessmentId),
                CorrectAnswers = _context.AssessmentAnswers.Count(an => an.AttemptId == x.att.Id && an.IsCorrect == true),
                Passed = x.att.Passed ?? false,
                StartedAt = x.att.StartedAt,
                SubmittedAt = x.att.SubmittedAt,
                DurationSeconds = x.att.SubmittedAt.HasValue
                    ? (int)(x.att.SubmittedAt.Value - x.att.StartedAt).TotalSeconds
                    : 0,
            })
            .ToListAsync();

        return new GetAssessmentHistoryOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}
