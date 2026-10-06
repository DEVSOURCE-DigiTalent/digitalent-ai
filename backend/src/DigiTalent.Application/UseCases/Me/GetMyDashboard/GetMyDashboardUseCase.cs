using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-01 — Bảng phát triển của tôi: tổng hợp năng lực (độ đáp ứng chuẩn vị trí, khoảng trống ưu tiên),
/// khóa đang học + bài kế tiếp, nhiệm vụ cần làm, bài đánh giá, chứng chỉ và các hạn sắp tới.
/// </summary>
public class GetMyDashboardUseCase : IUseCase<GetMyDashboardUseCaseInput, GetMyDashboardUseCaseOutput>
{
    private const int TopGapCount = 3;
    private const int ActiveTaskCount = 3;
    private const int DeadlineCount = 5;
    private static readonly TimeSpan DeadlineHorizon = TimeSpan.FromDays(30);

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyCompetencySnapshotBuilder _snapshotBuilder;
    private readonly MyCourseReader _courseReader;
    private readonly MyTaskReader _taskReader;
    private readonly MyAssessmentService _assessments;
    private readonly MyLearningProgressService _progress;

    public GetMyDashboardUseCase(
        IApplicationDbContext context,
        MyEmployeeContext me,
        MyCompetencySnapshotBuilder snapshotBuilder,
        MyCourseReader courseReader,
        MyTaskReader taskReader,
        MyAssessmentService assessments,
        MyLearningProgressService progress)
    {
        _context = context;
        _me = me;
        _snapshotBuilder = snapshotBuilder;
        _courseReader = courseReader;
        _taskReader = taskReader;
        _assessments = assessments;
        _progress = progress;
    }

    public async Task<GetMyDashboardUseCaseOutput> ExecuteAsync(GetMyDashboardUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);

        var snapshot = await _snapshotBuilder.BuildAsync(employee);
        var courses = await _courseReader.LoadAsync(employee.Id);
        var tasks = (await _taskReader.LoadAsync(employee.Id)).Select(t => MyTaskCardDto.Map<MyTaskCardDto>(t, now)).ToList();
        var assessmentStates = await _assessments.BuildStatesAsync(await _assessments.LoadVisibleAsync(employee), now);
        var assessmentCards = assessmentStates.Select(MyAssessmentCardDto.From).ToList();

        var output = new GetMyDashboardUseCaseOutput
        {
            Employee = await GetMyCompetencyProfileUseCase.LoadEmployeeInfoAsync(_context, employee),
            Competency = new MyDashboardCompetencyDto
            {
                SkipReason = snapshot.SkipReason,
                Summary = MyCompetencyLineDto.Summary(snapshot),
                AverageCurrentLevel = snapshot.Lines.Count == 0 ? null : Math.Round((decimal)snapshot.Lines.Average(l => (double)(l.CurrentLevel ?? 0)), 1),
                AverageRequiredLevel = snapshot.Lines.Count == 0 ? null : Math.Round((decimal)snapshot.Lines.Average(l => (double)l.RequiredLevel), 1),
                TopGaps = snapshot.Lines.Where(l => l.GapSteps > 0).Take(TopGapCount).Select(MyCompetencyLineDto.From).ToList(),
            },
            Courses = new MyCourseSummaryDto
            {
                Total = courses.Count,
                NotStarted = courses.Count(c => c.Enrollment.Status == Statuses.Enrollment.NotStarted),
                InProgress = courses.Count(c => c.Enrollment.Status == Statuses.Enrollment.InProgress),
                ReadyForAssessment = courses.Count(c => c.Enrollment.Status == Statuses.Enrollment.ReadyForAssessment),
                Completed = courses.Count(c => c.Enrollment.Status == Statuses.Enrollment.Completed),
                Overdue = courses.Count(c => c.IsOverdue(today)),
            },
            ContinueLearning = await ContinueLearningAsync(courses, today),
            Tasks = new MyTaskSummaryDto
            {
                Total = tasks.Count,
                ToDo = tasks.Count(t => t.CanSubmit),
                PendingReview = tasks.Count(t => t.Status == Statuses.TaskAssignment.Submitted),
                NeedsRevision = tasks.Count(t => t.Status == Statuses.TaskAssignment.NeedsRevision),
                Passed = tasks.Count(t => t.Status == Statuses.TaskAssignment.Passed),
                Failed = tasks.Count(t => t.Status == Statuses.TaskAssignment.Failed),
                Overdue = tasks.Count(t => t.IsOverdue),
            },
            ActiveTasks = tasks
                .Where(t => t.CanSubmit)
                .OrderBy(t => t.DueAt ?? DateTimeOffset.MaxValue)
                .Take(ActiveTaskCount)
                .ToList(),
            Assessments = new MyAssessmentSummaryDto
            {
                Total = assessmentCards.Count,
                Available = assessmentCards.Count(a => a.Status == MyAssessmentStatus.Available),
                InProgress = assessmentCards.Count(a => a.Status == MyAssessmentStatus.InProgress),
                Passed = assessmentCards.Count(a => a.Status == MyAssessmentStatus.Passed),
                Retake = assessmentCards.Count(a => a.Status == MyAssessmentStatus.Retake),
                Locked = assessmentCards.Count(a => a.Status is MyAssessmentStatus.Locked or MyAssessmentStatus.NoAttemptsLeft),
            },
            NextAssessment = assessmentCards
                .Where(a => a.CanStart)
                .OrderBy(a => a.Status == MyAssessmentStatus.InProgress ? 0 : 1)
                .ThenBy(a => a.IsFinal ? 0 : 1)
                .FirstOrDefault(),
            ValidCertificates = await _context.Certificates.AsNoTracking().CountAsync(c =>
                c.EmployeeId == employee.Id
                && c.Status == Statuses.Certificate.Valid
                && (c.ExpiresAt == null || c.ExpiresAt > now)),
        };

        output.UpcomingDeadlines = courses
            .Where(c => c.Enrollment.Status != Statuses.Enrollment.Completed && c.Enrollment.DueDate.HasValue)
            .Select(c => new MyDeadlineDto
            {
                Kind = "COURSE",
                TargetId = c.Course.Id,
                Title = c.Course.Title,
                DueAt = new DateTimeOffset(c.Enrollment.DueDate!.Value.ToDateTime(TimeOnly.MaxValue), TimeSpan.Zero),
                IsOverdue = c.IsOverdue(today),
            })
            .Concat(tasks.Where(t => t.CanSubmit && t.DueAt.HasValue).Select(t => new MyDeadlineDto
            {
                Kind = "TASK",
                TargetId = t.AssignmentId,
                Title = t.Title,
                DueAt = t.DueAt!.Value,
                IsOverdue = t.IsOverdue,
            }))
            .Where(d => d.IsOverdue || d.DueAt <= now + DeadlineHorizon)
            .OrderBy(d => d.DueAt)
            .Take(DeadlineCount)
            .ToList();

        return output;
    }

    /// <summary>Khóa nên học tiếp: khóa vừa mở bài gần nhất → khóa đang học hạn gần nhất → khóa chưa bắt đầu.</summary>
    private async Task<MyContinueLearningDto?> ContinueLearningAsync(IReadOnlyList<MyCourseRow> courses, DateOnly today)
    {
        var open = courses
            .Where(c => c.Enrollment.Status is Statuses.Enrollment.InProgress or Statuses.Enrollment.NotStarted or Statuses.Enrollment.ReadyForAssessment)
            .ToList();
        if (open.Count == 0)
        {
            return null;
        }

        var enrollmentIds = open.Select(c => c.Enrollment.Id).ToList();
        var lastAccess = await _context.LessonProgresses
            .AsNoTracking()
            .Where(p => enrollmentIds.Contains(p.EnrollmentId) && p.LastAccessedAt != null)
            .GroupBy(p => p.EnrollmentId)
            .Select(g => new { EnrollmentId = g.Key, LastAccessedAt = g.Max(p => p.LastAccessedAt) })
            .ToDictionaryAsync(x => x.EnrollmentId, x => x.LastAccessedAt);

        var pick = open
            .OrderBy(c => c.Enrollment.Status == Statuses.Enrollment.NotStarted ? 1 : 0)
            .ThenByDescending(c => lastAccess.GetValueOrDefault(c.Enrollment.Id) ?? DateTimeOffset.MinValue)
            .ThenBy(c => c.Enrollment.DueDate ?? DateOnly.MaxValue)
            .First();

        var lessons = await _progress.LoadLessonsAsync(pick.Course.Id);
        var completed = await _progress.LoadCompletedLessonIdsAsync(pick.Enrollment.Id);
        var nextLessonId = GetMyCourseDetailUseCase.NextLesson(lessons, completed);

        return new MyContinueLearningDto
        {
            CourseId = pick.Course.Id,
            CourseCode = pick.Course.Code,
            CourseTitle = pick.Course.Title,
            Status = pick.Enrollment.Status,
            ProgressPercent = pick.Enrollment.ProgressPercent,
            CompletedLessons = pick.CompletedTrackedLessons,
            TotalLessons = pick.TrackedLessons,
            NextLessonId = nextLessonId,
            NextLessonTitle = lessons.FirstOrDefault(l => l.LessonId == nextLessonId)?.Title,
            DueDate = pick.Enrollment.DueDate?.ToString("yyyy-MM-dd"),
            IsOverdue = pick.IsOverdue(today),
        };
    }
}
