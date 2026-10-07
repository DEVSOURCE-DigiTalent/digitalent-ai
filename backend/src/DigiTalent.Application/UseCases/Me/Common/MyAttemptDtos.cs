using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

public class MyQuestionOptionDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class MyAttemptQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string QuestionType { get; set; } = string.Empty;
    public decimal Points { get; set; }
    public List<MyQuestionOptionDto> Options { get; set; } = new();
}

/// <summary>Phiên làm bài (EM-11): câu hỏi KHÔNG kèm đáp án đúng, đáp án đã lưu, deadline do server tính.</summary>
public class MyAttemptSessionDto
{
    public Guid AttemptId { get; set; }
    public Guid AssessmentId { get; set; }
    public string AssessmentTitle { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int AttemptNo { get; set; }

    /// <summary>STARTED = đang làm; SCORED = đã chấm (VD hết giờ được chấm tự động) → FE chuyển sang trang kết quả.</summary>
    public string Status { get; set; } = string.Empty;

    public DateTimeOffset StartedAt { get; set; }

    /// <summary>null = không giới hạn thời gian.</summary>
    public DateTimeOffset? Deadline { get; set; }

    /// <summary>Giờ server lúc trả về — FE dùng để bù lệch đồng hồ máy người dùng.</summary>
    public DateTimeOffset ServerNow { get; set; }

    public int? TimeLimitMinutes { get; set; }
    public decimal PassingScore { get; set; }
    public List<MyAttemptQuestionDto> Questions { get; set; } = new();

    /// <summary>questionId → optionId đã chọn (đã lưu trên server).</summary>
    public Dictionary<Guid, Guid?> Answers { get; set; } = new();
}

public class MyGradedQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<MyQuestionOptionDto> Options { get; set; } = new();
    public Guid? SelectedOptionId { get; set; }

    /// <summary>Chỉ trả khi RevealAnswers = true (đạt / bài luyện tập / hết lượt làm).</summary>
    public Guid? CorrectOptionId { get; set; }

    public bool IsCorrect { get; set; }
    public decimal Points { get; set; }
    public decimal PointsAwarded { get; set; }

    /// <summary>Chỉ trả khi RevealAnswers = true.</summary>
    public string? Explanation { get; set; }

    public string? CompetencyCode { get; set; }
    public string? CompetencyName { get; set; }
}

/// <summary>Kết quả 1 lần làm bài (EM-12).</summary>
public class MyAttemptResultDto
{
    public Guid AttemptId { get; set; }
    public Guid AssessmentId { get; set; }
    public string AssessmentTitle { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int AttemptNo { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public int DurationSeconds { get; set; }

    /// <summary>Hết giờ → hệ thống tự nộp bằng đáp án đã lưu.</summary>
    public bool AutoSubmitted { get; set; }

    public decimal Score { get; set; }
    public decimal PassingScore { get; set; }
    public bool Passed { get; set; }
    public decimal EarnedPoints { get; set; }
    public decimal TotalPoints { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }

    public int? AttemptsRemaining { get; set; }
    public bool CanRetake { get; set; }
    public bool RevealAnswers { get; set; }

    /// <summary>Khóa đã hoàn thành (đạt bài FINAL).</summary>
    public bool CourseCompleted { get; set; }

    public MyCertificateRefDto? Certificate { get; set; }
    public List<MyGradedQuestionDto> Questions { get; set; } = new();
}

/// <summary>Dựng phiên làm bài / kết quả từ DB — dùng chung cho start, resume, submit, xem lại.</summary>
public class MyAttemptPresenter
{
    private readonly IApplicationDbContext _context;
    private readonly MyAssessmentService _assessments;

    public MyAttemptPresenter(IApplicationDbContext context, MyAssessmentService assessments)
    {
        _context = context;
        _assessments = assessments;
    }

    /// <summary>Lần làm bài của chính nhân viên (qua enrollment). track = true khi sẽ cập nhật attempt / enrollment.</summary>
    public async Task<(AssessmentAttempt Attempt, Assessment Assessment, Course Course, Enrollment Enrollment)> GetMyAttemptAsync(
        Employee employee, Guid attemptId, bool track)
    {
        var attempts = track ? _context.AssessmentAttempts : _context.AssessmentAttempts.AsNoTracking();
        var attempt = await attempts.FirstOrDefaultAsync(a => a.Id == attemptId)
            ?? throw new NotFoundException("Không tìm thấy lần làm bài.");

        var enrollments = track ? _context.Enrollments : _context.Enrollments.AsNoTracking();
        var enrollment = await enrollments.FirstOrDefaultAsync(e => e.Id == attempt.EnrollmentId && e.EmployeeId == employee.Id)
            ?? throw new NotFoundException("Không tìm thấy lần làm bài.");

        var assessment = await _context.Assessments.AsNoTracking().FirstAsync(a => a.Id == attempt.AssessmentId);
        var course = await _context.Courses.AsNoTracking().FirstAsync(c => c.Id == assessment.CourseId);
        return (attempt, assessment, course, enrollment);
    }

    public async Task<MyAttemptSessionDto> SessionAsync(AssessmentAttempt attempt, Assessment assessment, Course course, DateTimeOffset now)
    {
        var session = new MyAttemptSessionDto
        {
            AttemptId = attempt.Id,
            AssessmentId = assessment.Id,
            AssessmentTitle = assessment.Title,
            AssessmentType = assessment.AssessmentType,
            IsFinal = assessment.IsFinal,
            CourseId = course.Id,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            AttemptNo = attempt.AttemptNo,
            Status = attempt.Status,
            StartedAt = attempt.StartedAt,
            Deadline = MyAssessmentService.DeadlineOf(attempt, assessment),
            ServerNow = now,
            TimeLimitMinutes = assessment.TimeLimitMinutes,
            PassingScore = assessment.PassingScore,
        };

        if (attempt.Status != Statuses.AssessmentAttempt.Started)
        {
            return session;
        }

        var questions = await _assessments.LoadQuestionsAsync(assessment.Id);
        session.Questions = questions.Select(q => new MyAttemptQuestionDto
        {
            Id = q.Question.Id,
            Text = q.Question.Content,
            QuestionType = q.Question.QuestionType,
            Points = q.Link.Points,
            Options = q.Options.Select(o => new MyQuestionOptionDto { Id = o.Id, Content = o.Content }).ToList(),
        }).ToList();
        session.Answers = await _context.AssessmentAnswers
            .AsNoTracking()
            .Where(a => a.AttemptId == attempt.Id)
            .ToDictionaryAsync(a => a.QuestionId, a => a.SelectedOptionId);
        return session;
    }

    public async Task<MyAttemptResultDto> ResultAsync(Employee employee, Guid attemptId)
    {
        var (attempt, assessment, course, enrollment) = await GetMyAttemptAsync(employee, attemptId, track: false);
        if (attempt.Status != Statuses.AssessmentAttempt.Scored)
        {
            throw new ConflictException("Lần làm bài này chưa được chấm điểm.");
        }

        var questions = await _assessments.LoadQuestionsAsync(assessment.Id);
        var answers = await _context.AssessmentAnswers
            .AsNoTracking()
            .Where(a => a.AttemptId == attempt.Id)
            .ToDictionaryAsync(a => a.QuestionId);
        var competencyIds = questions.Where(q => q.Question.CompetencyId.HasValue).Select(q => q.Question.CompetencyId!.Value).Distinct().ToList();
        var competencies = await _context.Competencies
            .AsNoTracking()
            .Where(c => competencyIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, c => new { c.Code, c.Name });

        var attemptsUsed = await _context.AssessmentAttempts
            .AsNoTracking()
            .CountAsync(a => a.AssessmentId == assessment.Id && a.EnrollmentId == enrollment.Id);
        int? remaining = assessment.MaxAttempts is { } max ? Math.Max(0, max - attemptsUsed) : null;
        var passed = attempt.Passed == true;
        var reveal = passed || assessment.AssessmentType == Statuses.AssessmentType.Practice || remaining == 0;

        var certificate = await _context.Certificates
            .AsNoTracking()
            .Where(c => c.AssessmentAttemptId == attempt.Id)
            .Select(c => new MyCertificateRefDto { Id = c.Id, Code = c.CertificateCode, IssuedAt = c.IssuedAt, ExpiresAt = c.ExpiresAt, Status = c.Status })
            .FirstOrDefaultAsync();

        var graded = questions.Select(q =>
        {
            var answer = answers.GetValueOrDefault(q.Question.Id);
            var competency = q.Question.CompetencyId.HasValue ? competencies.GetValueOrDefault(q.Question.CompetencyId.Value) : null;
            return new MyGradedQuestionDto
            {
                Id = q.Question.Id,
                Text = q.Question.Content,
                Options = q.Options.Select(o => new MyQuestionOptionDto { Id = o.Id, Content = o.Content }).ToList(),
                SelectedOptionId = answer?.SelectedOptionId,
                CorrectOptionId = reveal ? q.Options.FirstOrDefault(o => o.IsCorrect)?.Id : null,
                IsCorrect = answer?.IsCorrect == true,
                Points = q.Link.Points,
                PointsAwarded = answer?.PointsAwarded ?? 0m,
                Explanation = reveal ? q.Question.Explanation : null,
                CompetencyCode = competency?.Code,
                CompetencyName = competency?.Name,
            };
        }).ToList();

        var deadline = MyAssessmentService.DeadlineOf(attempt, assessment);
        var retakeAllowed = !passed || !assessment.IsFinal;
        return new MyAttemptResultDto
        {
            AttemptId = attempt.Id,
            AssessmentId = assessment.Id,
            AssessmentTitle = assessment.Title,
            AssessmentType = assessment.AssessmentType,
            IsFinal = assessment.IsFinal,
            CourseId = course.Id,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            AttemptNo = attempt.AttemptNo,
            StartedAt = attempt.StartedAt,
            SubmittedAt = attempt.SubmittedAt,
            DurationSeconds = attempt.SubmittedAt.HasValue ? Math.Max(0, (int)(attempt.SubmittedAt.Value - attempt.StartedAt).TotalSeconds) : 0,
            AutoSubmitted = deadline.HasValue && attempt.SubmittedAt == deadline,
            Score = attempt.Score ?? 0m,
            PassingScore = assessment.PassingScore,
            Passed = passed,
            EarnedPoints = graded.Sum(g => g.PointsAwarded),
            TotalPoints = graded.Sum(g => g.Points),
            CorrectCount = graded.Count(g => g.IsCorrect),
            TotalQuestions = graded.Count,
            AttemptsRemaining = remaining,
            CanRetake = retakeAllowed && remaining != 0 && enrollment.Status != Statuses.Enrollment.Cancelled,
            RevealAnswers = reveal,
            CourseCompleted = enrollment.Status == Statuses.Enrollment.Completed,
            Certificate = certificate,
            Questions = graded,
        };
    }
}
