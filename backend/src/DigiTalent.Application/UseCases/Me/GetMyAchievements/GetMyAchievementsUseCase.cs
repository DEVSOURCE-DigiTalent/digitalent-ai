using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-18 — Thành tựu & Chứng nhận: chứng chỉ của mình (trạng thái hiệu lực tính theo expires_at),
/// năng lực đã xác nhận, thống kê và dòng thời gian các mốc đã đạt.
/// </summary>
public class GetMyAchievementsUseCase : IUseCase<GetMyAchievementsUseCaseInput, GetMyAchievementsUseCaseOutput>
{
    private const int MaxMilestones = 30;

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyCompetencySnapshotBuilder _snapshotBuilder;

    public GetMyAchievementsUseCase(IApplicationDbContext context, MyEmployeeContext me, MyCompetencySnapshotBuilder snapshotBuilder)
    {
        _context = context;
        _me = me;
        _snapshotBuilder = snapshotBuilder;
    }

    public async Task<GetMyAchievementsUseCaseOutput> ExecuteAsync(GetMyAchievementsUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;

        var certificates = await (
                from certificate in _context.Certificates.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on certificate.EnrollmentId equals enrollment.Id
                join attempt in _context.AssessmentAttempts.AsNoTracking() on certificate.AssessmentAttemptId equals attempt.Id
                where certificate.EmployeeId == employee.Id
                orderby certificate.IssuedAt descending
                select new { certificate, enrollment.CourseId, attempt.Score })
            .ToListAsync();

        var completedCourses = await (
                from enrollment in _context.Enrollments.AsNoTracking()
                join course in _context.Courses.AsNoTracking() on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employee.Id && enrollment.Status == Statuses.Enrollment.Completed
                select new { course.Title, enrollment.CompletedAt })
            .ToListAsync();

        var passedAttempts = await (
                from attempt in _context.AssessmentAttempts.AsNoTracking()
                join enrollment in _context.Enrollments.AsNoTracking() on attempt.EnrollmentId equals enrollment.Id
                join assessment in _context.Assessments.AsNoTracking() on attempt.AssessmentId equals assessment.Id
                where enrollment.EmployeeId == employee.Id && attempt.Passed == true && attempt.Status == Statuses.AssessmentAttempt.Scored
                select new { assessment.Title, attempt.Score, attempt.ScoredAt })
            .ToListAsync();

        var approvedTasks = await (
                from evaluation in _context.TaskEvaluations.AsNoTracking()
                join submission in _context.TaskSubmissions.AsNoTracking() on evaluation.TaskSubmissionId equals submission.Id
                join assignment in _context.TaskAssignments.AsNoTracking() on submission.TaskAssignmentId equals assignment.Id
                where assignment.EmployeeId == employee.Id && evaluation.Verdict == Statuses.TaskVerdict.Passed
                select new { assignment.TitleSnapshot, evaluation.OverallScore, evaluation.EvaluatedAt })
            .ToListAsync();

        var confirmed = (await _snapshotBuilder.BuildAsync(employee)).Confirmed;

        // Mốc xác nhận năng lực: bỏ dữ liệu nhập ban đầu (MIGRATION) — không phải thành tựu mới
        var earnedConfirmations = await (
                from profile in _context.EmployeeCompetencyProfiles.AsNoTracking()
                join evidence in _context.CompetencyEvidences.AsNoTracking() on profile.LatestConfirmingEvidenceId equals (Guid?)evidence.Id
                join competency in _context.Competencies.AsNoTracking() on profile.CompetencyId equals competency.Id
                where profile.EmployeeId == employee.Id && evidence.SourceType != Statuses.EvidenceSourceType.Migration
                select new { competency.Code, competency.Name, profile.ConfirmedLevel, profile.ConfirmedAt })
            .ToListAsync();

        var milestones = new List<MyMilestoneDto>();
        milestones.AddRange(certificates.Select(c => new MyMilestoneDto
        {
            Kind = "CERTIFICATE_ISSUED",
            Title = $"Nhận chứng chỉ {c.certificate.CertificateCode}",
            Detail = c.certificate.CourseTitleSnapshot,
            OccurredAt = c.certificate.IssuedAt,
        }));
        milestones.AddRange(completedCourses.Where(c => c.CompletedAt.HasValue).Select(c => new MyMilestoneDto
        {
            Kind = "COURSE_COMPLETED",
            Title = $"Hoàn thành khóa \"{c.Title}\"",
            OccurredAt = c.CompletedAt!.Value,
        }));
        milestones.AddRange(passedAttempts.Where(a => a.ScoredAt.HasValue).Select(a => new MyMilestoneDto
        {
            Kind = "ASSESSMENT_PASSED",
            Title = $"Đạt bài đánh giá \"{a.Title}\"",
            Detail = a.Score.HasValue ? $"{a.Score.Value:0.##} điểm" : null,
            OccurredAt = a.ScoredAt!.Value,
        }));
        milestones.AddRange(approvedTasks.Select(t => new MyMilestoneDto
        {
            Kind = "TASK_APPROVED",
            Title = $"Nhiệm vụ \"{t.TitleSnapshot}\" được duyệt đạt",
            Detail = t.OverallScore.HasValue ? $"{t.OverallScore.Value:0.##}/100 điểm" : null,
            OccurredAt = t.EvaluatedAt,
        }));
        milestones.AddRange(earnedConfirmations.Select(c => new MyMilestoneDto
        {
            Kind = "COMPETENCY_CONFIRMED",
            Title = $"Xác nhận năng lực {c.Code} {c.Name}",
            Detail = MyLevelLabels.For(c.ConfirmedLevel),
            OccurredAt = c.ConfirmedAt,
        }));

        var certificateDtos = certificates.Select(c => new MyCertificateDto
        {
            Id = c.certificate.Id,
            CertificateCode = c.certificate.CertificateCode,
            HolderName = c.certificate.HolderNameSnapshot,
            CourseId = c.CourseId,
            CourseTitle = c.certificate.CourseTitleSnapshot,
            PrimaryCompetency = c.certificate.PrimaryCompetencySnapshot,
            IssuedAt = c.certificate.IssuedAt,
            ExpiresAt = c.certificate.ExpiresAt,
            Status = c.certificate.Status == Statuses.Certificate.Valid && c.certificate.ExpiresAt.HasValue && c.certificate.ExpiresAt.Value < now
                ? Statuses.Certificate.Expired
                : c.certificate.Status,
            RevocationReason = c.certificate.RevocationReason,
            Score = c.Score,
        }).ToList();

        return new GetMyAchievementsUseCaseOutput
        {
            Stats = new MyAchievementStatsDto
            {
                ValidCertificates = certificateDtos.Count(c => c.Status == Statuses.Certificate.Valid),
                CompletedCourses = completedCourses.Count,
                PassedAssessments = passedAttempts.Count,
                ApprovedTasks = approvedTasks.Count,
                ConfirmedCompetencies = confirmed.Count,
            },
            Certificates = certificateDtos,
            ConfirmedCompetencies = confirmed.Select(MyConfirmedCompetencyDto.From).ToList(),
            Milestones = milestones.OrderByDescending(m => m.OccurredAt).Take(MaxMilestones).ToList(),
        };
    }
}
