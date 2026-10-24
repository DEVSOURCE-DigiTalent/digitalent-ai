using static DigiTalent.Infrastructure.PersonalLearning.PersonalLearningService;

namespace DigiTalent.Infrastructure.PersonalLearning;

/// <summary>
/// Pure rules of the personal track decided on 2026-10-09 (plan docs/specs/2026-10-09-personal-flow-review-plan.md):
/// adaptive entry assessment (B1), course completion that needs an approved practice task from Trung cấp up (B2),
/// and the rubric review of practice tasks (B3). Mirrors the frontend mock (services/mock/server/personal).
/// </summary>
public static class PersonalLearningRules
{
    public const int TaskExplanationMinLength = 150;
    public const int TaskAttemptsPerDay = 3;
    public const string ReviewerAiRubric = "AI_RUBRIC";

    public sealed record EntryPlan(IReadOnlyList<string> AskedIds, bool Done, int[] Levels, int DomainsDone);

    /// <summary>
    /// Domain by domain, from Cơ bản up: a level is passed when both of its questions are right; the first level
    /// missed ends the domain. Returns the questions to ask given the answers so far (answered ones that still count,
    /// then the next pair) and the level reached in each domain.
    /// </summary>
    public static EntryPlan PlanEntry(IReadOnlyDictionary<string, int> answers)
    {
        var asked = new List<string>();
        var levels = new List<int>();
        foreach (var domain in PersonalLearningCatalog.Domains)
        {
            var level = 0;
            for (var next = 1; next <= 3; next++)
            {
                var pair = PersonalLearningCatalog.EntryPair(domain.Number, next).Select(q => q.Id).ToList();
                asked.AddRange(pair);
                if (pair.Any(id => !answers.ContainsKey(id)))
                {
                    var partial = levels.Append(level).Concat(Enumerable.Repeat(0, PersonalLearningCatalog.Domains.Count - levels.Count - 1)).ToArray();
                    return new EntryPlan(asked, false, partial, levels.Count);
                }
                if (!pair.All(id => IsRight(answers, id))) break;
                level = next;
            }
            levels.Add(level);
        }
        return new EntryPlan(asked, true, levels.ToArray(), PersonalLearningCatalog.Domains.Count);
    }

    public static bool IsRight(IReadOnlyDictionary<string, int> answers, string questionId) =>
        answers.TryGetValue(questionId, out var chosen)
        && PersonalLearningCatalog.QuestionById.TryGetValue(questionId, out var question)
        && chosen == question.CorrectIndex;

    // ── Course completion ──

    /// <summary>Cơ bản courses complete with their assessment; Trung cấp and Nâng cao also need the task approved.</summary>
    public static bool NeedsApprovedTask(PersonalLearningCatalog.CourseDef course) => course.Level > 1;

    public static string TaskIdOf(string courseId) => $"task-{courseId}";

    public static StoredAttempt? FirstPassedAttempt(LearnerWorkspaceState state, string courseId) =>
        state.Attempts.Where(a => a.CourseId == courseId && a.Passed).OrderBy(a => a.At).FirstOrDefault();

    /// <summary>When the course was completed, or null when it is not completed yet.</summary>
    public static DateTimeOffset? CompletedAt(LearnerWorkspaceState state, PersonalLearningCatalog.CourseDef course)
    {
        var passed = FirstPassedAttempt(state, course.Id);
        if (passed == null) return null;
        if (!NeedsApprovedTask(course)) return passed.At;
        if (!state.Submissions.TryGetValue(TaskIdOf(course.Id), out var submission) || submission.Status != "APPROVED") return null;
        var approvedAt = submission.ReviewedAt ?? submission.SubmittedAt;
        return approvedAt > passed.At ? approvedAt : passed.At;
    }

    public static bool IsCompleted(LearnerWorkspaceState state, PersonalLearningCatalog.CourseDef course) =>
        CompletedAt(state, course) != null;

    public static bool IsCompleted(LearnerWorkspaceState state, string courseId)
    {
        var course = PersonalLearningCatalog.Courses.FirstOrDefault(c => c.Id == courseId);
        return course != null && IsCompleted(state, course);
    }

    /// <summary>Assessment passed, practice task not approved yet.</summary>
    public static bool AwaitingTask(LearnerWorkspaceState state, PersonalLearningCatalog.CourseDef course) =>
        FirstPassedAttempt(state, course.Id) != null && !IsCompleted(state, course);

    // ── Practice task review ──

    public sealed record TaskReview(string Status, int Score, string Feedback, IReadOnlyList<(string Label, bool Met)> Criteria);

    /// <summary>
    /// Review of a practice task against its rubric. The real product sends the work to an AI reviewer that reads
    /// the linked document; this rule stands in for it: a link to the work, every criterion self-checked, and an
    /// explanation long enough to say how each criterion is met. Swap the body for the AI call; the result stays.
    /// </summary>
    public static TaskReview GradeTask(IReadOnlyList<string> rubric, string linkUrl, string content, IReadOnlyCollection<int> checks)
    {
        var criteria = rubric.Select((label, index) => (Label: label, Met: checks.Contains(index))).ToList();
        var missing = criteria.Where(c => !c.Met).Select(c => c.Label).ToList();
        var problems = new List<string>();
        if (string.IsNullOrWhiteSpace(linkUrl)) problems.Add("Chưa có liên kết tới sản phẩm, nên chưa xem được bài làm.");
        if (missing.Count > 0) problems.Add($"Chưa đạt: {string.Join("; ", missing)}.");
        if (content.Length < TaskExplanationMinLength)
            problems.Add($"Phần giải thích cần nói rõ bài làm đáp ứng từng tiêu chí ra sao (ít nhất {TaskExplanationMinLength} ký tự).");

        if (problems.Count == 0)
        {
            var score = (int)Math.Round(80 + 20 * Math.Min(1.0, (content.Length - TaskExplanationMinLength) / 450.0));
            return new TaskReview("APPROVED", score,
                $"Đạt cả {criteria.Count} tiêu chí. Bài làm có sản phẩm kèm theo và giải thích rõ cách đáp ứng từng tiêu chí.", criteria);
        }
        var met = criteria.Count - missing.Count;
        return new TaskReview("REVISION_REQUESTED", (int)Math.Round(60.0 * met / Math.Max(1, criteria.Count)),
            $"Cần chỉnh sửa. {string.Join(" ", problems)}", criteria);
    }

    /// <summary>Submissions left in the last 24 hours, given the times of earlier submissions.</summary>
    public static int AttemptsLeft(IEnumerable<DateTimeOffset> history, DateTimeOffset now) =>
        Math.Max(0, TaskAttemptsPerDay - history.Count(at => now - at < TimeSpan.FromDays(1)));
}
