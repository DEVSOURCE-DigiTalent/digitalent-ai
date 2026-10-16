using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/overview — Hôm nay, Lộ trình, Hồ sơ của nhân viên: vị trí, người đánh giá, lộ trình doanh nghiệp đặt
/// (mục tiêu vị trí giới hạn bởi trần phòng ban), các năng lực vị trí yêu cầu, trạng thái từng khóa và việc nên làm tiếp.
/// </summary>
public class GetPulseOverviewUseCase : IUseCase<GetPulseOverviewUseCaseInput, GetPulseOverviewUseCaseOutput>
{
    private readonly PulseLearnerReader _reader;

    public GetPulseOverviewUseCase(PulseLearnerReader reader)
    {
        _reader = reader;
    }

    public async Task<GetPulseOverviewUseCaseOutput> ExecuteAsync(GetPulseOverviewUseCaseInput input)
    {
        var snapshot = await _reader.LoadAsync();
        var next = snapshot.NextSteps();
        var path = snapshot.Courses.Where(c => c.InPath).ToList();

        return new GetPulseOverviewUseCaseOutput
        {
            Person = PulseMapping.Person(snapshot),
            Reviewer = PulseMapping.Reviewer(snapshot),
            HasPosition = snapshot.HasPosition,
            HasTargets = snapshot.HasTargets,
            Domains = snapshot.Domains.Select(PulseMapping.Domain).ToList(),
            Courses = snapshot.Courses.Select(PulseMapping.Course).ToList(),
            NextCourse = next.Count == 0 ? null : PulseMapping.Course(next[0]),
            NextSteps = next.Select(PulseMapping.Course).ToList(),
            LatestOutcome = LatestOutcome(snapshot),
            Stats = new PulseOverviewStatsDto
            {
                GapCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Gap),
                PendingCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Pending),
                TargetDomainCount = snapshot.Domains.Count(d => d.PathTop > 0),
                MetCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Met),
                RequiredCompetencies = snapshot.Domains.Sum(d => d.Competencies.Count),
                PathCourses = path.Count,
                ApprovedPathCourses = path.Count(c => c.Approved),
                OptionalCourses = snapshot.Courses.Count(c => c.Zone == PulseCourseZone.Optional),
                AboveCeilingCourses = snapshot.Courses.Count(c => c.Zone == PulseCourseZone.AboveCeiling && c.Domain.Target > 0),
                LearningCourses = path.Count(c => c.SlotStatus is PulseSlotStatus.InProgress or PulseSlotStatus.FinalReady),
                PreAssessmentsOpen = path.Count(c => c.SlotStatus == PulseSlotStatus.PreAssessment),
                AssignedCourses = snapshot.Courses.Count(c => c.Enrollment != null),
                ApprovedCourses = snapshot.Courses.Count(c => c.Approved),
                InReview = snapshot.Courses.Count(c => c.SlotStatus is PulseSlotStatus.InReview or PulseSlotStatus.PreReview),
            },
        };
    }

    /// <summary>Khóa được công nhận gần nhất qua bài đánh giá trước khi học hoặc bài cuối khóa.</summary>
    private static PulseLatestOutcomeDto? LatestOutcome(PulseLearnerSnapshot snapshot)
    {
        var finals = snapshot.Courses.SelectMany(c => c.Submissions
            .Where(s => s.Decision == Statuses.FinalSubmissionDecision.Passed && s.ReviewedAt.HasValue)
            .Select(s => (Course: c, ReviewedAt: s.ReviewedAt!.Value, Via: PulseApprovedVia.Final)));
        var preAssessments = snapshot.Courses
            .Where(c => c.PreAssessment is { Decision: Statuses.FinalSubmissionDecision.Passed, ReviewedAt: not null })
            .Select(c => (Course: c, ReviewedAt: c.PreAssessment!.ReviewedAt!.Value, Via: PulseApprovedVia.PreAssessment));
        var latest = finals.Concat(preAssessments).OrderByDescending(x => x.ReviewedAt).FirstOrDefault();
        if (latest.Course == null)
        {
            return null;
        }

        var domain = latest.Course.Domain;
        return new PulseLatestOutcomeDto
        {
            CourseId = latest.Course.Course.CourseId,
            CourseTitle = latest.Course.Course.Title,
            CategoryId = domain.CategoryId,
            DomainName = domain.Name,
            Tier = latest.Course.Course.Tier,
            Verified = domain.Verified,
            Target = domain.PathTop,
            Via = latest.Via,
            ReviewedAt = latest.ReviewedAt,
        };
    }
}
