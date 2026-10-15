using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/overview — Hôm nay, Lộ trình, Hồ sơ của nhân viên (§3, §7.2, §8).
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
        var next = snapshot.NextCourse();

        return new GetPulseOverviewUseCaseOutput
        {
            Person = PulseMapping.Person(snapshot),
            HasPosition = snapshot.HasPosition,
            HasTargets = snapshot.HasTargets,
            Assessed = snapshot.Assessed,
            AssessedAt = snapshot.AssessedAt,
            Domains = snapshot.Domains.Select(PulseMapping.Domain).ToList(),
            Courses = snapshot.Courses.Select(PulseMapping.Course).ToList(),
            NextCourse = next == null ? null : PulseMapping.Course(next),
            LatestOutcome = LatestOutcome(snapshot),
            Stats = new PulseOverviewStatsDto
            {
                GapCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Gap),
                PendingCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Pending),
                TargetDomainCount = snapshot.Domains.Count(d => d.Target > 0),
                MetCount = snapshot.Domains.Count(d => d.Status == PulseDomainStatus.Met),
                AssignedCourses = snapshot.Courses.Count(c => c.Enrollment != null),
                ApprovedCourses = snapshot.Courses.Count(c => c.Approved),
                InReview = snapshot.Courses.Count(c => c.FinalStatus == PulseFinalStatus.Pending),
            },
        };
    }

    private static PulseLatestOutcomeDto? LatestOutcome(PulseLearnerSnapshot snapshot)
    {
        if (!snapshot.Assessed)
        {
            return null;
        }

        var latest = snapshot.Courses
            .SelectMany(c => c.Submissions
                .Where(s => s.Decision == Statuses.FinalSubmissionDecision.Passed && s.ReviewedAt.HasValue)
                .Select(s => (Course: c, ReviewedAt: s.ReviewedAt!.Value)))
            .OrderByDescending(x => x.ReviewedAt)
            .FirstOrDefault();
        if (latest.Course == null)
        {
            return null;
        }

        var domain = latest.Course.Domain;
        var baseline = domain.Baseline ?? 0;
        return new PulseLatestOutcomeDto
        {
            CourseId = latest.Course.Course.CourseId,
            CourseTitle = latest.Course.Course.Title,
            CategoryId = domain.CategoryId,
            DomainName = domain.Name,
            Tier = latest.Course.Course.Tier,
            Baseline = baseline,
            Verified = domain.Verified,
            Target = domain.Target,
            Gained = latest.Course.Course.Tier > baseline && domain.Verified >= latest.Course.Course.Tier,
            ReviewedAt = latest.ReviewedAt,
        };
    }
}
