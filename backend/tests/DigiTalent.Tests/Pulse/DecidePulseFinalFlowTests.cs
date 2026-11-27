using DigiTalent.Application;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Events;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using DigiTalent.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class DecidePulseFinalFlowTests
{
    [Fact]
    public async Task DecidePulseFinal_Passed_ConfirmsCompetencyLevel_IssuesCertificate_AndLogsAudit()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var employeeEntity = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var reviewerUser = await world.UserAsync(PulseTestWorld.OwnerEmail);

        // Open and pass M4-I (TargetLevel = 2; employee@ starts at level 1 from SkillGapSeeder).
        var course = await world.CourseAsync(employee, "M4-I");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);

        var current = new Mock<ICurrentUser>();
        current.Setup(c => c.UserId).Returns(reviewerUser.Id);
        current.Setup(c => c.OrganizationId).Returns(reviewerUser.OrganizationId);
        current.Setup(c => c.GetRequiredOrganizationId()).Returns(reviewerUser.OrganizationId!.Value);
        current.Setup(c => c.IsAuthenticated).Returns(true);
        current.Setup(c => c.IsAdmin).Returns(true);
        current.Setup(c => c.Roles).Returns(new List<string> { Roles.Owner });

        var audit = new AuditService(world.Context, current.Object, Microsoft.Extensions.Logging.Abstractions.NullLogger<AuditService>.Instance);
        var scope = new PulseReviewScope(world.Context, new EmployeeScope(world.Context, current.Object), current.Object);
        var policy = new PulseRetryPolicyProvider(world.Context, Microsoft.Extensions.Logging.Abstractions.NullLogger<PulseRetryPolicyProvider>.Instance);
        var decide = new DecidePulseFinalUseCase(world.Context, scope, policy, audit, world.Clock);

        var result = await decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = submitted.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Đạt đầy đủ 3 tiêu chí, nguồn số liệu và kiểm chứng chính xác.",
        });

        result.Status.Should().Be(PulseFinalStatus.Approved);
        result.EnrollmentStatus.Should().Be(Statuses.Enrollment.Completed);
        result.CertificateCode.Should().NotBeNullOrWhiteSpace();

        // Certificate issued and linked to a scored PASSED AssessmentAttempt.
        var certificate = await world.Context.Certificates.AsNoTracking()
            .SingleAsync(c => c.CertificateCode == result.CertificateCode);
        certificate.EmployeeId.Should().Be(employeeEntity.Id);
        certificate.Status.Should().Be(Statuses.Certificate.Valid);
        var attempt = await world.Context.AssessmentAttempts.AsNoTracking()
            .SingleAsync(a => a.Id == certificate.AssessmentAttemptId);
        attempt.Passed.Should().BeTrue();
        attempt.Status.Should().Be(Statuses.AssessmentAttempt.Scored);

        // CompetencyEvidence and EmployeeCompetencyProfile upgraded to level 2 for domain 4 competencies.
        var domain4CompetencyIds = await (
                from cc in world.Context.CourseCompetencies.AsNoTracking()
                where cc.CourseId == course.CourseId
                select cc.CompetencyId)
            .ToListAsync();
        domain4CompetencyIds.Should().NotBeEmpty();

        var profiles = await world.Context.EmployeeCompetencyProfiles.AsNoTracking()
            .Where(p => p.EmployeeId == employeeEntity.Id && domain4CompetencyIds.Contains(p.CompetencyId))
            .ToListAsync();
        profiles.Should().HaveCount(domain4CompetencyIds.Count);
        profiles.Should().OnlyContain(p => p.ConfirmedLevel == 2);

        var evidences = await world.Context.CompetencyEvidences.AsNoTracking()
            .Where(e => e.EmployeeId == employeeEntity.Id
                        && domain4CompetencyIds.Contains(e.CompetencyId)
                        && e.Status == Statuses.EvidenceStatus.Confirmed
                        && e.IsLevelConfirming)
            .ToListAsync();
        evidences.Should().HaveCount(domain4CompetencyIds.Count);
        evidences.Should().OnlyContain(e => e.ConfirmedLevel == 2 && e.ConfirmedByUserId == reviewerUser.Id);

        // Audit logs recorded for final decision, certificate issuance, and competency confirmation.
        (await world.Context.AuditLogs.AnyAsync(a => a.Action == "PULSE_FINAL_DECIDED" && a.EntityId == submitted.SubmissionId)).Should().BeTrue();
        (await world.Context.AuditLogs.AnyAsync(a => a.Action == "CERTIFICATE_ISSUED" && a.EntityId == certificate.Id)).Should().BeTrue();
        (await world.Context.AuditLogs.CountAsync(a => a.Action == "COMPETENCY_LEVEL_CONFIRMED")).Should().Be(domain4CompetencyIds.Count);
    }

    [Fact]
    public async Task DecidePulseFinal_NotYet_DoesNotUpgradeLevelOrIssueCertificate()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var employeeEntity = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var reviewerUser = await world.UserAsync(PulseTestWorld.OwnerEmail);

        var course = await world.CourseAsync(employee, "M4-I");
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);

        var certCountBefore = await world.Context.Certificates.CountAsync(c => c.EmployeeId == employeeEntity.Id);
        var result = await (await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner)).Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = submitted.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.NotYet,
            Reason = "Cần bổ sung phép tính đối chiếu nguồn dữ liệu.",
        });

        result.Status.Should().Be(PulseFinalStatus.RetryWait);
        result.CertificateCode.Should().BeNull();
        (await world.Context.Certificates.CountAsync(c => c.EmployeeId == employeeEntity.Id)).Should().Be(certCountBefore);

        var domain4Ids = await world.Context.CourseCompetencies.AsNoTracking()
            .Where(cc => cc.CourseId == course.CourseId)
            .Select(cc => cc.CompetencyId)
            .ToListAsync();
        var profiles = await world.Context.EmployeeCompetencyProfiles.AsNoTracking()
            .Where(p => p.EmployeeId == employeeEntity.Id && domain4Ids.Contains(p.CompetencyId))
            .ToListAsync();
        profiles.Should().OnlyContain(p => p.ConfirmedLevel == 1, "NOT_YET must never upgrade confirmed levels");
    }

    [Fact]
    public async Task DecidePulseFinal_Passed_WithDomainEventDispatcher_RecalculatesSkillGap_AndIssuesCertificate()
    {
        var dbName = $"pulse-di-{Guid.NewGuid():N}";
        var currentUser = new Mock<ICurrentUser>();
        var notificationSender = new Mock<INotificationSender>();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplication();
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<AfterCommitQueue>();
        services.AddScoped<IAfterCommitQueue>(sp => sp.GetRequiredService<AfterCommitQueue>());
        services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase(dbName));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddSingleton(currentUser.Object);
        services.AddSingleton(notificationSender.Object);
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<IPasswordHasher, DigiTalent.Infrastructure.Auth.PasswordHasher>();

        await using var provider = services.BuildServiceProvider();

        Guid orgId;
        Guid mentorUserId;
        Guid employeeId;
        Guid courseId;
        Guid submissionId;

        using (var seedScope = provider.CreateScope())
        {
            var db = seedScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = seedScope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            await DbSeeder.SeedAsync(db, hasher);

            var empUser = await db.Users.SingleAsync(u => u.Email == PulseTestWorld.EmployeeEmail);
            var emp = await db.Employees.SingleAsync(e => e.UserId == empUser.Id);
            var mentor = await db.Users.SingleAsync(u => u.Email == "mentor@digitalent.ai");
            var course = await db.Courses.SingleAsync(c => c.OrganizationId == emp.OrganizationId && c.Code == "M2-I");

            orgId = emp.OrganizationId;
            mentorUserId = mentor.Id;
            employeeId = emp.Id;
            courseId = course.Id;

            // Initial Skill Gap run shows GAP on domain 2 (level 1 vs required 2).
            var runService = seedScope.ServiceProvider.GetRequiredService<SkillGapRunService>();
            await runService.StageRunsAsync(new[] { emp }, orgId, Statuses.SkillGapGeneratedBy.UserRequest);
            await db.SaveChangesAsync();

            // Prepare enrollment + pending final submission for M2-I.
            var enrollment = new Enrollment
            {
                EmployeeId = emp.Id,
                CourseId = course.Id,
                Status = Statuses.Enrollment.ReadyForAssessment,
                ProgressPercent = 100,
                StartedAt = DateTimeOffset.UtcNow.AddDays(-2),
            };
            db.Enrollments.Add(enrollment);
            var submission = new CourseFinalSubmission
            {
                EnrollmentId = enrollment.Id,
                AttemptNo = 1,
                EvidenceText = PulseTestWorld.Evidence,
                ChoiceScore = 9,
                ChoiceTotal = 10,
                SubmittedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
            };
            db.CourseFinalSubmissions.Add(submission);
            await db.SaveChangesAsync();
            submissionId = submission.Id;
        }

        currentUser.Setup(c => c.UserId).Returns(mentorUserId);
        currentUser.Setup(c => c.OrganizationId).Returns((Guid?)null);
        currentUser.Setup(c => c.IsAuthenticated).Returns(true);
        currentUser.Setup(c => c.IsAdmin).Returns(false);
        currentUser.Setup(c => c.IsDepartmentManager).Returns(false);
        currentUser.Setup(c => c.Roles).Returns(new List<string> { Roles.Mentor });

        SkillGapRun initialRun;
        using (var readScope = provider.CreateScope())
        {
            var db = readScope.ServiceProvider.GetRequiredService<AppDbContext>();
            initialRun = await db.SkillGapRuns.AsNoTracking()
                .Where(r => r.EmployeeId == employeeId)
                .OrderByDescending(r => r.GeneratedAt)
                .FirstAsync();
        }

        using (var actScope = provider.CreateScope())
        {
            var decide = actScope.ServiceProvider.GetRequiredService<IUseCase<DecidePulseFinalUseCaseInput, DecidePulseFinalUseCaseOutput>>();
            var output = await decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
            {
                SubmissionId = submissionId,
                Decision = Statuses.FinalSubmissionDecision.Passed,
                Reason = "Bài làm đạt chuẩn, minh chứng và kết luận rõ ràng.",
            });
            output.CertificateCode.Should().NotBeNullOrWhiteSpace();
        }

        using (var verifyScope = provider.CreateScope())
        {
            var db = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();
            var latestRun = await db.SkillGapRuns.AsNoTracking()
                .Where(r => r.EmployeeId == employeeId)
                .OrderByDescending(r => r.GeneratedAt)
                .FirstAsync();
            latestRun.Id.Should().NotBe(initialRun.Id);
            latestRun.GeneratedBy.Should().Be(Statuses.SkillGapGeneratedBy.System);
            latestRun.GapCount.Should().BeLessThan(initialRun.GapCount, "completing M2-I raises domain 2 competencies to level 2 and closes those gaps");
            (await db.Certificates.AnyAsync(c => c.EmployeeId == employeeId && c.Status == Statuses.Certificate.Valid)).Should().BeTrue();
        }
    }
}
