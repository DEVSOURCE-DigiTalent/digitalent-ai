using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>Trạng thái bài kiểm tra vượt học của một khóa đối với nhân viên.</summary>
public static class PulseSkipTestStatus
{
    /// <summary>Có thể bắt đầu.</summary>
    public const string Available = "AVAILABLE";
    /// <summary>Đang làm (còn giờ).</summary>
    public const string InProgress = "IN_PROGRESS";
    /// <summary>Đã đạt: mọi mô đun được tính là đã qua, bài cuối khóa đã mở.</summary>
    public const string Passed = "PASSED";
    /// <summary>Đã dùng hết số lần làm mà chưa đạt: học tuần tự từng mô đun.</summary>
    public const string Exhausted = "EXHAUSTED";
    /// <summary>Không cần: khóa đã được công nhận hoặc đã qua mọi mô đun bằng cách học.</summary>
    public const string NotNeeded = "NOT_NEEDED";
    /// <summary>Chưa mở: khóa chưa học được (doanh nghiệp chưa mua khóa, bài đánh giá trước khi học chưa xong, ngoài lộ trình…).</summary>
    public const string Locked = "LOCKED";
    /// <summary>Ngân hàng ôn tập của khóa chưa đủ câu để ra đề.</summary>
    public const string Unavailable = "UNAVAILABLE";
}

/// <summary>Một câu của ngân hàng ôn tập, kèm mô đun chứa câu và cờ câu trắc nghiệm cuối khóa của giáo trình.</summary>
public sealed record PulseSkipPoolQuestion(PulseQuizQuestion Question, int ModuleIndex, bool IsFinalQuiz);

/// <summary>Một lần làm bài kiểm tra vượt học (assessment_attempts).</summary>
public sealed record PulseSkipAttemptRow(
    Guid Id,
    int AttemptNo,
    string Status,
    DateTimeOffset StartedAt,
    DateTimeOffset? SubmittedAt,
    decimal? Score,
    bool? Passed);

/// <summary>
/// Bài kiểm tra vượt học của một khóa: <see cref="PulseRules.SkipTestQuestionCount"/> câu trắc nghiệm rút từ ngân hàng ôn tập
/// các mô đun của khóa (câu ôn tập, xen kẽ đều các mô đun; câu cuối khóa của giáo trình để dành cho bài cuối khóa), làm trong
/// <see cref="PulseRules.SkipTestTimeLimitMinutes"/> phút, tối đa <see cref="PulseRules.SkipTestMaxAttempts"/> lần. Đúng từ
/// <see cref="PulseRules.SkipTestPassPercent"/>% thì mọi mô đun được tính là đã qua (<see cref="PulseModuleReader.LoadProgressAsync"/>)
/// và bài cuối khóa có giám sát mở ra như khi học xong. Bài kiểm tra không công nhận khóa: chỉ bài cuối khóa mới làm việc đó.
/// Mỗi khóa (bản nhân viên đang học) có một dòng assessments PRACTICE mã <see cref="PulseRules.SkipTestCode"/>, tạo khi nhân
/// viên đầu tiên bắt đầu; mỗi lần làm là một assessment_attempt (STARTED lúc phát đề, SCORED lúc nộp) với từng câu trả lời
/// trong assessment_answers. Đề không lưu: cùng nhân viên × khóa × lần làm luôn rút ra cùng một đề.
/// </summary>
public class PulseSkipTest
{
    private const int SeedSalt = 15485863;

    private readonly IApplicationDbContext _context;

    public PulseSkipTest(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Khóa chứa bài kiểm tra: bản nhân viên đang học (lượt học giữ nguyên phiên bản khóa), nếu chưa học thì bản trong danh mục.</summary>
    public static Guid CourseIdOf(PulseCourseState state) => state.Enrollment?.CourseId ?? state.Course.CourseId;

    public static DateTimeOffset DeadlineOf(DateTimeOffset startedAt) => startedAt.AddMinutes(PulseRules.SkipTestTimeLimitMinutes);

    /// <summary>Lần làm đang mở đã quá giờ (kể cả thời gian trễ cho phép) — coi như đã nộp và chưa đạt.</summary>
    public static bool Expired(PulseSkipAttemptRow attempt, DateTimeOffset now) =>
        attempt.Status == Statuses.AssessmentAttempt.Started
        && now > DeadlineOf(attempt.StartedAt).AddSeconds(PulseRules.SkipTestGraceSeconds);

    public async Task<Guid?> FindAssessmentIdAsync(Guid courseId) =>
        await _context.Assessments.AsNoTracking()
            .Where(a => a.CourseId == courseId && a.Code == PulseRules.SkipTestCode && a.ModuleId == null)
            .OrderByDescending(a => a.VersionNo)
            .Select(a => (Guid?)a.Id)
            .FirstOrDefaultAsync();

    /// <summary>Bài kiểm tra của khóa; tạo khi chưa có (gọi SaveChangesAsync sau đó, cùng lần lưu với lần làm).</summary>
    public async Task<Guid> EnsureAssessmentAsync(Guid courseId, DateTimeOffset now)
    {
        if (await FindAssessmentIdAsync(courseId) is { } existing)
        {
            return existing;
        }

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == courseId)
            .Select(c => new { c.Code, c.CreatedByUserId })
            .FirstAsync();
        var assessment = new Assessment
        {
            CourseId = courseId,
            Code = PulseRules.SkipTestCode,
            VersionNo = 1,
            Title = $"Kiểm tra vượt học · {course.Code}",
            AssessmentType = Statuses.AssessmentType.Practice,
            IsFinal = false,
            TimeLimitMinutes = PulseRules.SkipTestTimeLimitMinutes,
            MaxAttempts = PulseRules.SkipTestMaxAttempts,
            PassingScore = PulseRules.SkipTestPassPercent,
            Status = Statuses.Assessment.Published,
            CreatedByUserId = course.CreatedByUserId,
            RowVersion = 1,
            CreatedAt = now,
            UpdatedAt = now,
        };
        _context.Assessments.Add(assessment);
        return assessment.Id;
    }

    public async Task<List<PulseSkipAttemptRow>> LoadAttemptsAsync(Guid? assessmentId, Guid? enrollmentId)
    {
        if (assessmentId is not { } aid || enrollmentId is not { } eid)
        {
            return new List<PulseSkipAttemptRow>();
        }

        return await _context.AssessmentAttempts.AsNoTracking()
            .Where(a => a.AssessmentId == aid && a.EnrollmentId == eid)
            .OrderBy(a => a.AttemptNo)
            .Select(a => new PulseSkipAttemptRow(a.Id, a.AttemptNo, a.Status, a.StartedAt, a.SubmittedAt, a.Score, a.Passed))
            .ToListAsync();
    }

    /// <summary>Ngân hàng ôn tập của các mô đun (câu có ít nhất hai phương án), theo mô đun.</summary>
    public async Task<List<PulseSkipPoolQuestion>> LoadPoolAsync(IReadOnlyList<PulseModuleInfo> modules)
    {
        var moduleOfQuiz = modules
            .Where(m => m.QuizAssessmentId.HasValue)
            .ToDictionary(m => m.QuizAssessmentId!.Value, m => m.Index);
        if (moduleOfQuiz.Count == 0)
        {
            return new List<PulseSkipPoolQuestion>();
        }

        var quizIds = moduleOfQuiz.Keys.ToList();
        var questions = await (
                from link in _context.AssessmentQuestions.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                where quizIds.Contains(link.AssessmentId)
                select new { link.AssessmentId, question.Id, question.Content, question.Explanation, question.IsFinalQuiz, link.SortOrder })
            .ToListAsync();
        var ids = questions.Select(q => q.Id).Distinct().ToList();
        var options = (await _context.QuestionOptions.AsNoTracking()
                .Where(o => ids.Contains(o.QuestionId))
                .OrderBy(o => o.SortOrder)
                .Select(o => new { o.Id, o.QuestionId, o.Content, o.IsCorrect })
                .ToListAsync())
            .GroupBy(o => o.QuestionId)
            .ToDictionary(g => g.Key, g => g.Select(o => new PulseQuizOption(o.Id, o.Content, o.IsCorrect)).ToList());

        return questions
            .Select(q => new PulseSkipPoolQuestion(
                new PulseQuizQuestion(q.Id, q.Content, q.Explanation, q.SortOrder, options.GetValueOrDefault(q.Id) ?? new List<PulseQuizOption>()),
                moduleOfQuiz[q.AssessmentId],
                q.IsFinalQuiz))
            .Where(p => p.Question.Options.Count > 1 && p.Question.Options.Any(o => o.IsCorrect))
            .OrderBy(p => p.ModuleIndex).ThenBy(p => p.Question.SortOrder).ThenBy(p => p.Question.QuestionId)
            .ToList();
    }

    /// <summary>Số câu của đề với ngân hàng này (câu trùng nội dung chỉ tính một lần).</summary>
    public static int SizeOf(IReadOnlyList<PulseSkipPoolQuestion> pool) =>
        Math.Min(PulseRules.SkipTestQuestionCount, Sequence(pool, new Random(0)).Count);

    /// <summary>
    /// Đề của lần làm thứ <paramref name="attemptNo"/>: dãy câu cố định cho nhân viên × khóa (câu ôn tập xen kẽ đều các mô
    /// đun, bỏ câu trùng nội dung; câu cuối khóa chỉ bù vào khi khóa có ít hơn <see cref="PulseRules.SkipTestMinQuestions"/> câu
    /// ôn), lần làm thứ k lấy đoạn thứ k của dãy (vòng lại khi hết câu). Thứ tự câu và phương án trộn theo lần làm.
    /// </summary>
    public static IReadOnlyList<PulseSkipPoolQuestion> Draw(IReadOnlyList<PulseSkipPoolQuestion> pool, Guid employeeId, Guid courseId, int attemptNo)
    {
        var order = Sequence(pool, new Random(PulseQuizReader.Seed(employeeId, courseId, SeedSalt)));
        if (order.Count == 0)
        {
            return order;
        }

        var size = Math.Min(PulseRules.SkipTestQuestionCount, order.Count);
        var start = (Math.Max(attemptNo, 1) - 1) * size;
        var random = new Random(PulseQuizReader.Seed(employeeId, courseId, SeedSalt + Math.Max(attemptNo, 1)));
        var picked = Enumerable.Range(0, size).Select(i => order[(start + i) % order.Count]).ToList();
        return PulseQuizReader.Shuffle(picked, random)
            .Select(p => p with { Question = p.Question with { Options = PulseQuizReader.Shuffle(p.Question.Options.ToList(), random) } })
            .ToList();
    }

    private static List<PulseSkipPoolQuestion> Sequence(IReadOnlyList<PulseSkipPoolQuestion> pool, Random random)
    {
        var order = new List<PulseSkipPoolQuestion>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var finalQuiz in new[] { false, true })
        {
            // Câu cuối khóa dành cho bài cuối khóa: chỉ dùng ở đây khi khóa thiếu câu ôn để ra đề.
            if (finalQuiz && order.Count >= PulseRules.SkipTestMinQuestions)
            {
                break;
            }

            var queues = pool
                .Where(p => p.IsFinalQuiz == finalQuiz)
                .GroupBy(p => p.ModuleIndex)
                .OrderBy(g => g.Key)
                .Select(g => PulseQuizReader.Shuffle(g.ToList(), random))
                .ToList();
            for (var round = 0; queues.Any(q => round < q.Count); round++)
            {
                order.AddRange(queues.Where(q => round < q.Count).Select(q => q[round]).Where(p => seen.Add(p.Question.Content.Trim())));
            }
        }

        return order;
    }

    /// <summary>Câu trả lời đã chấm của các lần làm: id lần làm → (câu, đúng?).</summary>
    public async Task<Dictionary<Guid, List<(Guid QuestionId, bool Correct)>>> LoadAnswersAsync(IReadOnlyCollection<Guid> attemptIds)
    {
        if (attemptIds.Count == 0)
        {
            return new Dictionary<Guid, List<(Guid, bool)>>();
        }

        var rows = await _context.AssessmentAnswers.AsNoTracking()
            .Where(a => attemptIds.Contains(a.AttemptId))
            .Select(a => new { a.AttemptId, a.QuestionId, a.IsCorrect })
            .ToListAsync();
        return rows
            .GroupBy(r => r.AttemptId)
            .ToDictionary(g => g.Key, g => g.Select(r => (r.QuestionId, r.IsCorrect == true)).ToList());
    }

    /// <summary>Trạng thái bài kiểm tra vượt học của khóa cho nhân viên hiện tại (đọc, không ghi).</summary>
    public async Task<T> ReadAsync<T>(PulseLearnerSnapshot snapshot, PulseCourseState state, DateTimeOffset now)
        where T : PulseSkipTestDto, new()
    {
        var courseId = CourseIdOf(state);
        var pool = await LoadPoolAsync(state.Modules);
        var attempts = await LoadAttemptsAsync(await FindAssessmentIdAsync(courseId), state.Enrollment?.Id);
        var answers = await LoadAnswersAsync(attempts.Select(a => a.Id).ToList());
        return Build<T>(snapshot, state, pool, attempts, answers, now);
    }

    /// <summary>Khóa có đủ câu ôn tập (theo cỡ ngân hàng của các mô đun) để ra bài kiểm tra đầu vào.</summary>
    public static bool Offered(IReadOnlyList<PulseModuleInfo> modules) =>
        modules.Where(m => m.QuizAssessmentId.HasValue).Sum(m => m.QuizTotalQuestionCount) >= PulseRules.SkipTestMinQuestions;

    /// <summary>
    /// Có thể làm bài lúc này: khóa học được, hoặc chỉ còn chờ chính bài đầu vào này (bắt buộc trước khi học), và đã có quyền
    /// học đầy đủ (khóa có phí cần doanh nghiệp đã mua).
    /// </summary>
    public static bool CanTake(PulseCourseState state) =>
        (state.BlockReason is null or PulseBlockReason.PreAssessmentRequired)
        && state.Access != PulseCourseAccess.Preview;

    public static string StatusOf(PulseCourseState state, int paperSize, IReadOnlyList<PulseSkipAttemptRow> attempts, DateTimeOffset now)
    {
        if (attempts.Any(a => a.Passed == true))
        {
            return PulseSkipTestStatus.Passed;
        }

        if (state.Approved || state.AllModulesPassed)
        {
            return PulseSkipTestStatus.NotNeeded;
        }

        if (attempts.Any(a => a.Status == Statuses.AssessmentAttempt.Started && !Expired(a, now)))
        {
            return PulseSkipTestStatus.InProgress;
        }

        if (attempts.Count >= PulseRules.SkipTestMaxAttempts)
        {
            return PulseSkipTestStatus.Exhausted;
        }

        // Bài đánh giá đầu vào cũ (có tự luận, người chấm) đã có kết luận: không làm thêm bài đầu vào.
        if (state.PreAssessment is { Decision: not null })
        {
            return PulseSkipTestStatus.NotNeeded;
        }

        if (!CanTake(state))
        {
            return PulseSkipTestStatus.Locked;
        }

        return !Offered(state.Modules) || paperSize == 0 ? PulseSkipTestStatus.Unavailable : PulseSkipTestStatus.Available;
    }

    public static string? MessageOf(string status, PulseCourseState state) => status switch
    {
        PulseSkipTestStatus.Passed => "Bạn đã đạt bài kiểm tra đầu vào nên được bỏ qua phần học. Hãy làm bài đánh giá cuối khóa để hoàn thành khóa học.",
        PulseSkipTestStatus.NotNeeded => state.Approved
            ? "Khóa học đã được công nhận nên không cần bài kiểm tra đầu vào."
            : state.PreAssessment != null
            ? "Bạn đã làm bài đánh giá đầu vào của khóa này. Hãy học tuần tự từng mô-đun để mở bài đánh giá cuối khóa."
            : "Bạn đã hoàn thành mọi mô-đun nên không cần bài kiểm tra đầu vào.",
        PulseSkipTestStatus.Locked => state.BlockReason is { } reason and not PulseBlockReason.PreAssessmentRequired
            ? PulseCourseWorkspace.BlockMessage(reason)
            : PulseCourseWorkspace.BlockMessage(PulseBlockReason.PurchaseRequired),
        PulseSkipTestStatus.Unavailable => "Ngân hàng câu hỏi của khóa chưa đủ câu để ra bài kiểm tra đầu vào. Hãy học tuần tự từng mô-đun.",
        PulseSkipTestStatus.Exhausted => PulseRules.SkipTestMaxAttempts == 1
            ? "Bài kiểm tra đầu vào chỉ được làm một lần và bạn đã làm nhưng chưa đạt. Hãy học tuần tự từng mô-đun để mở bài đánh giá cuối khóa."
            : $"Bạn đã dùng hết {PulseRules.SkipTestMaxAttempts} lần làm bài kiểm tra đầu vào. Hãy học tuần tự từng mô-đun để mở bài đánh giá cuối khóa.",
        _ => null,
    };

    public static T Build<T>(
        PulseLearnerSnapshot snapshot,
        PulseCourseState state,
        IReadOnlyList<PulseSkipPoolQuestion> pool,
        IReadOnlyList<PulseSkipAttemptRow> attempts,
        IReadOnlyDictionary<Guid, List<(Guid QuestionId, bool Correct)>> answers,
        DateTimeOffset now)
        where T : PulseSkipTestDto, new()
    {
        var size = SizeOf(pool);
        var status = StatusOf(state, size, attempts, now);
        var moduleOfQuestion = pool
            .GroupBy(p => p.Question.QuestionId)
            .ToDictionary(g => g.Key, g => g.First().ModuleIndex);

        PulseSkipTestAttemptDto? open = null;
        if (status == PulseSkipTestStatus.InProgress)
        {
            var row = attempts.Last(a => a.Status == Statuses.AssessmentAttempt.Started && !Expired(a, now));
            var paper = Draw(pool, snapshot.Employee.Id, CourseIdOf(state), row.AttemptNo);
            open = new PulseSkipTestAttemptDto
            {
                AttemptNo = row.AttemptNo,
                StartedAt = row.StartedAt,
                DeadlineAt = DeadlineOf(row.StartedAt),
                Questions = PulseExamPaper.ToDto(paper.Select(p => p.Question).ToList()),
            };
        }

        var results = attempts
            .Where(a => a.Status != Statuses.AssessmentAttempt.Started || Expired(a, now))
            .Select(a => Result(a, answers.GetValueOrDefault(a.Id), moduleOfQuestion, state.Modules, size, now))
            .ToList();

        return new T
        {
            Course = PulseMapping.Course(state),
            Status = status,
            Message = MessageOf(status, state),
            QuestionCount = size,
            PassPercent = PulseRules.SkipTestPassPercent,
            PassMark = PulseRules.SkipTestPassMark(size),
            TimeLimitMinutes = PulseRules.SkipTestTimeLimitMinutes,
            MaxAttempts = PulseRules.SkipTestMaxAttempts,
            AttemptsUsed = attempts.Count,
            AttemptsLeft = Math.Max(0, PulseRules.SkipTestMaxAttempts - attempts.Count),
            ModuleCount = state.Modules.Count,
            Attempt = open,
            Results = results,
        };
    }

    /// <summary>Kết quả một lần làm, kèm số câu đúng theo mô-đun (không lộ đáp án).</summary>
    public static PulseSkipTestResultDto Result(
        PulseSkipAttemptRow attempt,
        IReadOnlyList<(Guid QuestionId, bool Correct)>? answers,
        IReadOnlyDictionary<Guid, int> moduleOfQuestion,
        IReadOnlyList<PulseModuleInfo> modules,
        int paperSize,
        DateTimeOffset now)
    {
        var expired = attempt.Status == Statuses.AssessmentAttempt.Started && Expired(attempt, now);
        var rows = answers ?? (IReadOnlyList<(Guid, bool)>)Array.Empty<(Guid, bool)>();
        var total = rows.Count > 0 ? rows.Count : paperSize;
        var correct = rows.Count(r => r.Correct);
        return new PulseSkipTestResultDto
        {
            AttemptNo = attempt.AttemptNo,
            Score = correct,
            Total = total,
            Percent = expired ? 0 : attempt.Score ?? 0,
            PassMark = PulseRules.SkipTestPassMark(total),
            Passed = attempt.Passed == true,
            Expired = expired,
            StartedAt = attempt.StartedAt,
            SubmittedAt = attempt.SubmittedAt ?? DeadlineOf(attempt.StartedAt),
            Modules = rows
                .Where(r => moduleOfQuestion.ContainsKey(r.QuestionId))
                .GroupBy(r => moduleOfQuestion[r.QuestionId])
                .OrderBy(g => g.Key)
                .Select(g => new PulseSkipTestModuleScoreDto
                {
                    Index = g.Key,
                    Title = g.Key < modules.Count ? modules[g.Key].Title : $"Mô-đun {g.Key + 1}",
                    Correct = g.Count(r => r.Correct),
                    Total = g.Count(),
                })
                .ToList(),
        };
    }
}

/// <summary>Bài kiểm tra vượt học của một khóa (GET/POST /me/pulse/courses/{courseId}/skip-test).</summary>
public class PulseSkipTestDto
{
    public PulseCourseSummaryDto Course { get; set; } = new();
    /// <summary>AVAILABLE | IN_PROGRESS | PASSED | EXHAUSTED | NOT_NEEDED | LOCKED | UNAVAILABLE — xem PulseSkipTestStatus.</summary>
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    /// <summary>Số câu của đề.</summary>
    public int QuestionCount { get; set; }
    public int PassPercent { get; set; }
    /// <summary>Số câu đúng tối thiểu để đạt.</summary>
    public int PassMark { get; set; }
    public int TimeLimitMinutes { get; set; }
    public int MaxAttempts { get; set; }
    public int AttemptsUsed { get; set; }
    public int AttemptsLeft { get; set; }
    public int ModuleCount { get; set; }
    /// <summary>Lần làm đang mở (chỉ khi IN_PROGRESS): đề không kèm đáp án và hạn nộp.</summary>
    public PulseSkipTestAttemptDto? Attempt { get; set; }
    /// <summary>Kết quả các lần đã nộp (hoặc quá giờ), theo thứ tự lần làm.</summary>
    public List<PulseSkipTestResultDto> Results { get; set; } = new();
}

public class PulseSkipTestAttemptDto
{
    public int AttemptNo { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset DeadlineAt { get; set; }
    public List<PulseExamQuestionDto> Questions { get; set; } = new();
}

public class PulseSkipTestResultDto
{
    public int AttemptNo { get; set; }
    public int Score { get; set; }
    public int Total { get; set; }
    public decimal Percent { get; set; }
    public int PassMark { get; set; }
    public bool Passed { get; set; }
    /// <summary>Quá giờ mà chưa nộp: tính là chưa đạt.</summary>
    public bool Expired { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset SubmittedAt { get; set; }
    /// <summary>Số câu đúng theo mô-đun — gợi ý phần nên học lại, không lộ đáp án.</summary>
    public List<PulseSkipTestModuleScoreDto> Modules { get; set; } = new();
}

public class PulseSkipTestModuleScoreDto
{
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Correct { get; set; }
    public int Total { get; set; }
}
