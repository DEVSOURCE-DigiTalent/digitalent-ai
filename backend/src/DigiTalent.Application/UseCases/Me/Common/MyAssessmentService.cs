using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>Bài đánh giá nhân viên được thấy: PUBLISHED, bản mới nhất, thuộc khóa mình đang ghi danh.</summary>
public sealed record VisibleAssessment(Assessment Assessment, Course Course, Enrollment Enrollment, int QuestionCount);

/// <summary>Kết quả chấm 1 câu.</summary>
public sealed record GradedQuestion(
    Question Question,
    decimal MaxPoints,
    IReadOnlyList<QuestionOption> Options,
    Guid? SelectedOptionId,
    Guid? CorrectOptionId,
    bool IsCorrect,
    decimal PointsAwarded);

/// <summary>Trạng thái bài đánh giá đối với nhân viên (hiển thị ở EM-07, EM-09, EM-10).</summary>
public static class MyAssessmentStatus
{
    public const string Available = "AVAILABLE";
    public const string InProgress = "IN_PROGRESS";
    public const string Passed = "PASSED";
    public const string Retake = "RETAKE";
    public const string Locked = "LOCKED";
    public const string NoAttemptsLeft = "NO_ATTEMPTS_LEFT";
}

public sealed record MyAssessmentState(
    VisibleAssessment Visible,
    IReadOnlyList<AssessmentAttempt> Attempts,
    int AttemptsUsed,
    int? AttemptsRemaining,
    decimal? BestScore,
    AssessmentAttempt? LatestScored,
    bool Passed,
    AssessmentAttempt? InProgress,
    bool InProgressExpired,
    string Status,
    string? LockedReason)
{
    public bool CanStart => Status is MyAssessmentStatus.Available or MyAssessmentStatus.Retake or MyAssessmentStatus.InProgress;
}

public sealed record AttemptGradeResult(
    AssessmentAttempt Attempt,
    IReadOnlyList<GradedQuestion> Questions,
    decimal EarnedPoints,
    decimal TotalPoints,
    Certificate? IssuedCertificate,
    bool CompletedCourse,
    bool GradedFromSavedAnswersOnly);

/// <summary>
/// Quy tắc làm bài (SRS 7.5.3, ASSESS-09):
///   - Kiểm tra số lần làm TRƯỚC khi bắt đầu; deadline tính trên server lúc bắt đầu (StartedAt + time_limit).
///   - Hết giờ → chấm tự động bằng đáp án đã lưu, câu chưa trả lời = 0 điểm.
///   - Điểm = tổng điểm câu đúng / tổng điểm × 100; đạt khi ≥ passing_score (0..100).
///   - Đạt bài FINAL → enrollment COMPLETED + cấp chứng chỉ (nếu khóa bật chứng chỉ và có mẫu ACTIVE).
///   - Không bao giờ nâng cấp độ năng lực trực tiếp (quy tắc D trong schema v2.3).
/// </summary>
public class MyAssessmentService
{
    /// <summary>Cho phép nộp trễ vài giây do độ trễ mạng trước khi coi là hết giờ.</summary>
    public static readonly TimeSpan SubmitGracePeriod = TimeSpan.FromSeconds(30);

    private readonly IApplicationDbContext _context;
    private readonly MyLearningProgressService _progress;
    private readonly MyCertificateIssuer _certificateIssuer;

    public MyAssessmentService(IApplicationDbContext context, MyLearningProgressService progress, MyCertificateIssuer certificateIssuer)
    {
        _context = context;
        _progress = progress;
        _certificateIssuer = certificateIssuer;
    }

    public static DateTimeOffset? DeadlineOf(AssessmentAttempt attempt, Assessment assessment) =>
        assessment.TimeLimitMinutes is { } minutes ? attempt.StartedAt.AddMinutes(minutes) : null;

    public static bool IsExpired(AssessmentAttempt attempt, Assessment assessment, DateTimeOffset now) =>
        DeadlineOf(attempt, assessment) is { } deadline && now > deadline + SubmitGracePeriod;

    /// <summary>
    /// Các bài đánh giá nhân viên thấy. Enrollment trả về là enrollment còn hiệu lực mới nhất của khóa.
    /// </summary>
    public async Task<List<VisibleAssessment>> LoadVisibleAsync(Employee employee, Guid? assessmentId = null)
    {
        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(e => e.EmployeeId == employee.Id && e.Status != Statuses.Enrollment.Cancelled)
            .ToListAsync();
        if (enrollments.Count == 0)
        {
            return new List<VisibleAssessment>();
        }

        var enrollmentByCourse = enrollments
            .GroupBy(e => e.CourseId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(e => e.CreatedAt).First());
        var courseIds = enrollmentByCourse.Keys.ToList();

        var assessments = _context.Assessments.AsNoTracking();
        var query =
            from assessment in assessments
            join course in _context.Courses.AsNoTracking() on assessment.CourseId equals course.Id
            where courseIds.Contains(assessment.CourseId)
                  && course.OrganizationId == employee.OrganizationId
                  && assessment.Status == Statuses.Assessment.Published
                  && !assessments.Any(newer => newer.CourseId == assessment.CourseId
                                               && newer.Code == assessment.Code
                                               && newer.Status == Statuses.Assessment.Published
                                               && newer.VersionNo > assessment.VersionNo)
            select new
            {
                Assessment = assessment,
                Course = course,
                QuestionCount = _context.AssessmentQuestions.Count(q => q.AssessmentId == assessment.Id),
            };

        if (assessmentId.HasValue)
        {
            query = query.Where(x => x.Assessment.Id == assessmentId.Value);
        }

        var rows = await query.ToListAsync();
        return rows
            .Select(r => new VisibleAssessment(r.Assessment, r.Course, enrollmentByCourse[r.Course.Id], r.QuestionCount))
            .OrderBy(v => v.Course.Code, StringComparer.OrdinalIgnoreCase)
            .ThenBy(v => v.Assessment.IsFinal)
            .ThenBy(v => v.Assessment.Title, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public async Task<VisibleAssessment> GetVisibleAsync(Employee employee, Guid assessmentId) =>
        (await LoadVisibleAsync(employee, assessmentId)).FirstOrDefault()
        ?? throw new NotFoundException("Không tìm thấy bài đánh giá hoặc bạn chưa ghi danh khóa học của bài này.");

    /// <summary>Câu hỏi của bài (thứ tự theo assessment_questions) kèm phương án.</summary>
    public async Task<List<(AssessmentQuestion Link, Question Question, List<QuestionOption> Options)>> LoadQuestionsAsync(Guid assessmentId)
    {
        var links = await _context.AssessmentQuestions
            .AsNoTracking()
            .Where(aq => aq.AssessmentId == assessmentId)
            .OrderBy(aq => aq.SortOrder)
            .ToListAsync();
        var questionIds = links.Select(l => l.QuestionId).ToList();

        var questions = await _context.Questions
            .AsNoTracking()
            .Where(q => questionIds.Contains(q.Id))
            .ToDictionaryAsync(q => q.Id);
        var options = await _context.QuestionOptions
            .AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId))
            .OrderBy(o => o.SortOrder)
            .ToListAsync();
        var optionsByQuestion = options.GroupBy(o => o.QuestionId).ToDictionary(g => g.Key, g => g.ToList());

        return links
            .Where(l => questions.ContainsKey(l.QuestionId))
            .Select(l => (l, questions[l.QuestionId], optionsByQuestion.GetValueOrDefault(l.QuestionId) ?? new List<QuestionOption>()))
            .ToList();
    }

    /// <summary>
    /// Lưu (upsert) đáp án đã chọn — dùng cho tự động lưu và khi nộp bài. Bỏ qua câu không thuộc bài
    /// hoặc phương án không thuộc câu. Không chấm điểm ở bước này.
    /// </summary>
    public async Task SaveAnswersAsync(Guid attemptId, Guid assessmentId, IReadOnlyDictionary<Guid, Guid?> answers)
    {
        if (answers.Count == 0)
        {
            return;
        }

        var questionIds = await _context.AssessmentQuestions
            .AsNoTracking()
            .Where(aq => aq.AssessmentId == assessmentId)
            .Select(aq => aq.QuestionId)
            .ToListAsync();
        var validOptions = await _context.QuestionOptions
            .AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId))
            .Select(o => new { o.Id, o.QuestionId })
            .ToListAsync();
        var optionToQuestion = validOptions.ToDictionary(o => o.Id, o => o.QuestionId);

        var existing = await _context.AssessmentAnswers
            .Where(a => a.AttemptId == attemptId)
            .ToDictionaryAsync(a => a.QuestionId);

        foreach (var (questionId, optionId) in answers)
        {
            if (!questionIds.Contains(questionId))
            {
                continue;
            }

            if (optionId.HasValue && (!optionToQuestion.TryGetValue(optionId.Value, out var owner) || owner != questionId))
            {
                throw new BadRequestException("Phương án trả lời không thuộc câu hỏi của bài đánh giá.");
            }

            if (existing.TryGetValue(questionId, out var answer))
            {
                answer.SelectedOptionId = optionId;
            }
            else
            {
                var created = new AssessmentAnswer { AttemptId = attemptId, QuestionId = questionId, SelectedOptionId = optionId };
                _context.AssessmentAnswers.Add(created);
                existing[questionId] = created;
            }
        }
    }

    /// <summary>
    /// Chấm bài đang STARTED (attempt + enrollment đang được track). Gọi trong ExecuteInTransactionAsync.
    /// Hết giờ → bỏ qua đáp án gửi kèm, chấm theo đáp án đã lưu trước đó.
    /// </summary>
    public async Task<AttemptGradeResult> FinalizeAsync(
        Employee employee,
        Course course,
        Assessment assessment,
        Enrollment enrollment,
        AssessmentAttempt attempt,
        IReadOnlyDictionary<Guid, Guid?>? submittedAnswers,
        DateTimeOffset now)
    {
        // Chốt trạng thái nguyên tử: 2 request nộp cùng lúc → chỉ 1 request được chấm
        var claimed = await _context.AssessmentAttempts
            .Where(a => a.Id == attempt.Id && a.Status == Statuses.AssessmentAttempt.Started)
            .ExecuteUpdateAsync(set => set
                .SetProperty(a => a.Status, Statuses.AssessmentAttempt.Submitted)
                .SetProperty(a => a.UpdatedAt, now));
        if (claimed == 0)
        {
            throw new ConflictException("Bài làm này đã được nộp trước đó.");
        }

        var expired = IsExpired(attempt, assessment, now);
        if (!expired && submittedAnswers != null)
        {
            await SaveAnswersAsync(attempt.Id, assessment.Id, submittedAnswers);
            await _context.SaveChangesAsync();
        }

        var questions = await LoadQuestionsAsync(assessment.Id);
        var answers = await _context.AssessmentAnswers
            .Where(a => a.AttemptId == attempt.Id)
            .ToDictionaryAsync(a => a.QuestionId);

        var graded = new List<GradedQuestion>();
        foreach (var (link, question, options) in questions)
        {
            var correctOptionId = options.FirstOrDefault(o => o.IsCorrect)?.Id;
            var selected = answers.TryGetValue(question.Id, out var answer) ? answer.SelectedOptionId : null;
            var isCorrect = selected.HasValue && selected == correctOptionId;
            var points = isCorrect ? link.Points : 0m;

            if (answer == null)
            {
                answer = new AssessmentAnswer { AttemptId = attempt.Id, QuestionId = question.Id };
                _context.AssessmentAnswers.Add(answer);
            }

            answer.IsCorrect = isCorrect;
            answer.PointsAwarded = points;
            graded.Add(new GradedQuestion(question, link.Points, options, selected, correctOptionId, isCorrect, points));
        }

        var totalPoints = graded.Sum(g => g.MaxPoints);
        var earnedPoints = graded.Sum(g => g.PointsAwarded);
        var score = totalPoints == 0 ? 0m : Math.Round(earnedPoints / totalPoints * 100m, 2, MidpointRounding.AwayFromZero);
        var passed = score >= assessment.PassingScore;

        // submitted_at >= started_at (CHECK); hết giờ thì ghi nhận tại thời điểm deadline
        var submittedAt = expired && DeadlineOf(attempt, assessment) is { } deadline ? deadline : now;
        attempt.Status = Statuses.AssessmentAttempt.Scored;
        attempt.SubmittedAt = submittedAt;
        attempt.ScoredAt = now;
        attempt.Score = score;
        attempt.Passed = passed;

        Certificate? certificate = null;
        var completedCourse = false;
        if (passed && assessment.IsFinal && enrollment.Status != Statuses.Enrollment.Completed)
        {
            enrollment.StartedAt ??= attempt.StartedAt;
            enrollment.Status = Statuses.Enrollment.Completed;
            enrollment.CompletedAt = now;
            enrollment.ProgressPercent = 100m;
            completedCourse = true;
            certificate = await _certificateIssuer.IssueAsync(employee, course, enrollment, attempt, now);
        }
        else if (enrollment.Status == Statuses.Enrollment.NotStarted)
        {
            enrollment.Status = Statuses.Enrollment.InProgress;
            enrollment.StartedAt ??= attempt.StartedAt;
        }

        await _context.SaveChangesAsync();

        return new AttemptGradeResult(attempt, graded, earnedPoints, totalPoints, certificate, completedCourse, expired);
    }

    public const string FinalLockedReason = "Hoàn thành các bài học bắt buộc của khóa để mở bài đánh giá cuối khóa.";
    public const string NoAttemptsLeftMessage = "Bạn đã dùng hết số lần làm bài cho phép của bài đánh giá này.";

    /// <summary>Tính trạng thái (đã đạt / đang làm / làm lại / khóa / hết lượt) cho danh sách bài, theo lô.</summary>
    public async Task<List<MyAssessmentState>> BuildStatesAsync(IReadOnlyList<VisibleAssessment> visible, DateTimeOffset now)
    {
        if (visible.Count == 0)
        {
            return new List<MyAssessmentState>();
        }

        var assessmentIds = visible.Select(v => v.Assessment.Id).ToList();
        var enrollmentIds = visible.Select(v => v.Enrollment.Id).Distinct().ToList();
        var attempts = await _context.AssessmentAttempts
            .AsNoTracking()
            .Where(a => assessmentIds.Contains(a.AssessmentId) && enrollmentIds.Contains(a.EnrollmentId))
            .OrderByDescending(a => a.AttemptNo)
            .ToListAsync();

        var readiness = new Dictionary<Guid, bool>();
        foreach (var enrollment in visible.Where(v => v.Assessment.IsFinal).Select(v => v.Enrollment).DistinctBy(e => e.Id))
        {
            readiness[enrollment.Id] = await IsReadyForFinalAsync(enrollment);
        }

        return visible.Select(v =>
        {
            var mine = attempts.Where(a => a.AssessmentId == v.Assessment.Id && a.EnrollmentId == v.Enrollment.Id).ToList();
            var scored = mine.Where(a => a.Status == Statuses.AssessmentAttempt.Scored).ToList();
            var inProgress = mine.FirstOrDefault(a => a.Status == Statuses.AssessmentAttempt.Started);
            var passed = scored.Any(a => a.Passed == true);
            int? remaining = v.Assessment.MaxAttempts is { } max ? Math.Max(0, max - mine.Count) : null;

            string status;
            string? lockedReason = null;
            if (passed)
            {
                status = MyAssessmentStatus.Passed;
            }
            else if (inProgress != null)
            {
                status = MyAssessmentStatus.InProgress;
            }
            else if (v.Assessment.IsFinal && !readiness.GetValueOrDefault(v.Enrollment.Id))
            {
                status = MyAssessmentStatus.Locked;
                lockedReason = FinalLockedReason;
            }
            else if (remaining == 0)
            {
                status = MyAssessmentStatus.NoAttemptsLeft;
                lockedReason = NoAttemptsLeftMessage;
            }
            else
            {
                status = scored.Count > 0 ? MyAssessmentStatus.Retake : MyAssessmentStatus.Available;
            }

            return new MyAssessmentState(
                v,
                mine,
                mine.Count,
                remaining,
                scored.Count == 0 ? null : scored.Max(a => a.Score ?? 0m),
                scored.FirstOrDefault(),
                passed,
                inProgress,
                inProgress != null && IsExpired(inProgress, v.Assessment, now),
                status,
                lockedReason);
        }).ToList();
    }

    /// <summary>Đủ điều kiện làm bài FINAL: đã học xong bài bắt buộc (hoặc enrollment đã sẵn sàng / hoàn thành).</summary>
    public async Task<bool> IsReadyForFinalAsync(Enrollment enrollment)
    {
        if (enrollment.Status is Statuses.Enrollment.ReadyForAssessment or Statuses.Enrollment.Completed)
        {
            return true;
        }

        var lessons = await _progress.LoadLessonsAsync(enrollment.CourseId);
        var completed = await _progress.LoadCompletedLessonIdsAsync(enrollment.Id);
        return MyLearningProgressService.IsLessonWorkDone(lessons, completed);
    }
}
