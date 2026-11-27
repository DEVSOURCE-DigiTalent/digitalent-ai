using DigiTalent.Application;
using DigiTalent.Application.Common.Events;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Events;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using DigiTalent.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

public class DemoCaseStudySeederTests : IDisposable
{
    private readonly List<string> _tempFiles = new();

    public void Dispose()
    {
        foreach (var path in _tempFiles)
        {
            if (File.Exists(path))
            {
                File.Delete(path);
            }
        }
    }

    private string CreateTempCsvPath()
    {
        var path = Path.Combine(Path.GetTempPath(), $"demo-accounts-{Guid.NewGuid():N}.csv");
        _tempFiles.Add(path);
        return path;
    }

    private static ServiceProvider BuildServiceProvider(string dbName, IPasswordHasher? customHasher = null)
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.UserId).Returns((Guid?)null);
        currentUser.Setup(c => c.OrganizationId).Returns((Guid?)null);
        currentUser.Setup(c => c.IsAuthenticated).Returns(false);

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
        if (customHasher != null)
            services.AddSingleton(customHasher);
        else
            services.AddScoped<IPasswordHasher, PasswordHasher>();

        return services.BuildServiceProvider();
    }

    [Fact]
    public async Task SeedAsync_MainOnly_SeedsFullCaseStudy_PassedFinalIssuesCertificateAndClearsGap_AndIsIdempotent()
    {
        var dbName = $"demo-main-{Guid.NewGuid():N}";
        await using var provider = BuildServiceProvider(dbName);
        var csvPath = CreateTempCsvPath();

        DemoSeedResult firstResult;
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

            firstResult = await DemoCaseStudySeeder.SeedAsync(db, hasher, csvPath, trialOrgCount: 0);

            firstResult.OrganizationsSeeded.Should().Be(1);
            firstResult.UsersCreated.Should().BeGreaterThanOrEqualTo(37); // Admin, Mentor, Owner, RND, 3 Managers, 30 Employees
            firstResult.EmployeesCreated.Should().Be(33); // 3 Managers + 30 Employees
            File.Exists(csvPath).Should().BeTrue();

            var org = await db.Organizations.AsNoTracking().SingleAsync(o => o.Code == DemoCaseStudySeeder.MainOrgCode);
            org.Name.Should().Be(DemoCaseStudySeeder.MainOrgName);

            // Departments & Job Positions
            var depts = await db.Departments.AsNoTracking().Where(d => d.OrganizationId == org.Id).ToListAsync();
            depts.Should().HaveCount(3);

            var positions = await db.JobPositions.AsNoTracking().Where(p => p.OrganizationId == org.Id).ToListAsync();
            positions.Should().HaveCount(5);

            var positionIds = positions.Select(p => p.Id).ToList();
            var reqSets = await db.PositionRequirementSets.AsNoTracking()
                .Include(r => r.Items)
                .ThenInclude(i => i.Competency)
                .Where(r => positionIds.Contains(r.JobPositionId) && r.Status == Statuses.PositionRequirementSet.Active)
                .ToListAsync();
            reqSets.Should().HaveCount(5);
            foreach (var rs in reqSets)
            {
                rs.Items.Should().HaveCountGreaterThanOrEqualTo(9);
                rs.Items.Should().HaveCountLessThanOrEqualTo(24);
                rs.Items.Select(i => i.Competency!.Code).Should().Contain(new[] { "TT02-4.1", "TT02-4.2" });
                rs.Items.Sum(i => i.WeightPercent).Should().Be(100.00m);
            }

            // Ceilings: org + 3 departments
            var ceilings = await db.CapabilityCeilings.AsNoTracking().Where(c => c.OrganizationId == org.Id).ToListAsync();
            ceilings.Count(c => c.DepartmentId == null).Should().Be(6);
            ceilings.Count(c => c.DepartmentId != null).Should().Be(18);

            // Purchased Intermediate courses: M1-I, M2-I, M4-I paid; M3-I, M5-I, M6-I unpurchased
            var orders = await (
                from o in db.CourseOrders.AsNoTracking()
                join pc in db.PlatformCourses.AsNoTracking() on o.CourseId equals pc.Id
                where o.OrganizationId == org.Id
                select pc.Code
            ).ToListAsync();
            orders.Should().BeEquivalentTo(new[] { "M1-I", "M2-I", "M4-I" });

            // Organization accounts: Owner, RND, 3 Managers (also Employees), 30 Employees
            var orgUsers = await db.Users.AsNoTracking()
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Where(u => u.OrganizationId == org.Id)
                .ToListAsync();
            orgUsers.Should().HaveCount(35);
            orgUsers.Should().OnlyContain(u => u.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain));
            var exportedByEmail = firstResult.ExportedAccounts.ToDictionary(a => a.Email, StringComparer.OrdinalIgnoreCase);
            orgUsers.Should().OnlyContain(u => !exportedByEmail.ContainsKey(u.Email)
                                             || hasher.Verify(exportedByEmail[u.Email].Password, u.PasswordHash));
            orgUsers.Count(u => u.UserRoles.Any(r => r.Role.Code == Roles.Owner)).Should().Be(1);
            orgUsers.Count(u => u.UserRoles.Any(r => r.Role.Code == Roles.Research)).Should().Be(1);
            orgUsers.Count(u => u.UserRoles.Any(r => r.Role.Code == Roles.Manager && u.UserRoles.Any(r2 => r2.Role.Code == Roles.Employee))).Should().Be(3);

            // 90-question baseline survey for all 33 employees (3 managers + 30 staff)
            var assessments = await db.TrialAssessments.AsNoTracking()
                .Where(a => a.OrganizationId == org.Id)
                .ToListAsync();
            assessments.Should().HaveCount(33);
            assessments.Should().OnlyContain(a => a.ChoiceTotal == 90);

            var empIds = await db.Employees.AsNoTracking()
                .Where(e => e.OrganizationId == org.Id)
                .Select(e => e.Id)
                .ToListAsync();

            // Final submissions breakdown: 8 Approved (Group A), 3 Pending (Group B), 1 Rejected attemptNo 1 (Group B)
            var finals = await (
                from f in db.CourseFinalSubmissions.AsNoTracking()
                join en in db.Enrollments.AsNoTracking() on f.EnrollmentId equals en.Id
                where empIds.Contains(en.EmployeeId)
                select f
            ).ToListAsync();
            finals.Count(f => f.Decision == Statuses.FinalSubmissionDecision.Passed).Should().Be(8);
            finals.Count(f => f.Decision == null).Should().Be(3);
            finals.Count(f => f.Decision == Statuses.FinalSubmissionDecision.NotYet).Should().Be(1);

            // Certificates issued via DecidePulseFinalUseCase -> MyCertificateIssuer for all 8 Group A employees
            var certs = await db.Certificates.AsNoTracking()
                .Where(c => empIds.Contains(c.EmployeeId) && c.Status == Statuses.Certificate.Valid)
                .ToListAsync();
            certs.Should().HaveCount(8);

            // Group A employees must now have latest SkillGapRun.GapCount == 0 (transitioned GAP -> MET)
            var groupACertEmpIds = certs.Select(c => c.EmployeeId).Distinct().ToList();
            foreach (var empId in groupACertEmpIds)
            {
                var runs = await db.SkillGapRuns.AsNoTracking()
                    .Where(r => r.EmployeeId == empId)
                    .OrderByDescending(r => r.GeneratedAt)
                    .ToListAsync();
                runs.Count.Should().BeGreaterThanOrEqualTo(2);
                runs.First().GapCount.Should().Be(0);
                runs.Last().GapCount.Should().BeGreaterThan(0);
            }

            // Mentor CSV export must include Admin, Mentor, Owner, RND, 3 Managers, plus 5 representative A/B(pending+failed_once)/C/D employees (12 rows)
            firstResult.ExportedAccounts.Should().HaveCount(12);
            firstResult.ExportedAccounts.Should().OnlyContain(a => a.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain));
            var mentorUser = firstResult.ExportedAccounts.Single(a => a.Role == Roles.Mentor);
            var dbMentor = await db.Users.AsNoTracking().SingleAsync(u => u.Email == mentorUser.Email);
            hasher.Verify(mentorUser.Password, dbMentor.PasswordHash).Should().BeTrue();
        }

        // Second run must be 100% idempotent and preserve passwords already written in CSV
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

            var secondResult = await DemoCaseStudySeeder.SeedAsync(db, hasher, csvPath, trialOrgCount: 0);
            secondResult.OrganizationsSeeded.Should().Be(0);
            secondResult.UsersCreated.Should().Be(0);
            secondResult.EmployeesCreated.Should().Be(0);

            (await db.Organizations.CountAsync()).Should().Be(1);
            (await db.Users.CountAsync()).Should().Be(37);
            (await db.Certificates.CountAsync()).Should().Be(8);

            foreach (var firstAcc in firstResult.ExportedAccounts)
            {
                var matched = secondResult.ExportedAccounts.Single(a => a.Email == firstAcc.Email);
                matched.Password.Should().Be(firstAcc.Password);
            }
        }
    }

    [Fact]
    public async Task ResetAndReseedAsync_OnlyDeletesDemoOrgsAndDemoDomainUsers_PreservingNonDemoData()
    {
        var dbName = $"demo-reset-{Guid.NewGuid():N}";
        await using var provider = BuildServiceProvider(dbName);
        var csvPath = CreateTempCsvPath();
        var logs = new List<string>();

        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

            // Non-demo production-like organization and user that MUST NOT be deleted
            await DbSeeder.SeedAsync(db, hasher);
            var nonDemoOrgCountBefore = await db.Organizations.CountAsync(o => !o.Code.StartsWith(DemoCaseStudySeeder.DemoOrgPrefix));
            var nonDemoUserCountBefore = await db.Users.CountAsync(u => !u.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain));
            nonDemoOrgCountBefore.Should().BeGreaterThan(0);
            nonDemoUserCountBefore.Should().BeGreaterThan(0);

            await DemoCaseStudySeeder.SeedAsync(db, hasher, csvPath, trialOrgCount: 0);
            (await db.Organizations.CountAsync(o => o.Code.StartsWith(DemoCaseStudySeeder.DemoOrgPrefix))).Should().Be(1);

            var resetResult = await DemoCaseStudySeeder.ResetAndReseedAsync(db, hasher, csvPath, trialOrgCount: 0, msg => logs.Add(msg));

            resetResult.OrganizationsSeeded.Should().Be(1);
            logs.Should().Contain(l => l.Contains("organizations: 1", StringComparison.OrdinalIgnoreCase));
            (await db.Organizations.CountAsync(o => !o.Code.StartsWith(DemoCaseStudySeeder.DemoOrgPrefix))).Should().Be(nonDemoOrgCountBefore);
            (await db.Users.CountAsync(u => !u.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain))).Should().Be(nonDemoUserCountBefore);
            (await db.Organizations.CountAsync(o => o.Code.StartsWith(DemoCaseStudySeeder.DemoOrgPrefix))).Should().Be(1);
            (await db.Users.CountAsync(u => u.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain))).Should().Be(37);
        }
    }

    [Fact]
    public async Task SeedAsync_WithMultipleTrialOrgs_SeedsIsolatedDemoOrganizations_AndExportsCsv()
    {
        var dbName = $"demo-multiorgs-{Guid.NewGuid():N}";
        // Dùng hasher nhanh cho kịch bản nhiều tổ chức trong test InMemory; test DEMO-MAIN phía trên đã kiểm chứng PasswordHasher (BCrypt) thật.
        // Dùng trialOrgCount = 2 để kiểm chứng vòng lặp DEMO-DN-01..N, tính cô lập organization_id, tên khác nhau và CSV (12 + 2*5 = 22 dòng)
        // mà không làm chậm EF Core InMemory (không có index cho ~40k QuestionOptions).
        var fastHasher = new Mock<IPasswordHasher>();
        fastHasher.Setup(h => h.Hash(It.IsAny<string>())).Returns<string>(p => $"fast:{p}");
        fastHasher.Setup(h => h.Verify(It.IsAny<string>(), It.IsAny<string>())).Returns<string, string>((p, hash) => hash == $"fast:{p}");

        await using var provider = BuildServiceProvider(dbName, fastHasher.Object);
        var csvPath = CreateTempCsvPath();

        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var result = await DemoCaseStudySeeder.SeedAsync(db, hasher, csvPath, trialOrgCount: 2);

        result.OrganizationsSeeded.Should().Be(3); // DEMO-MAIN + DEMO-DN-01..DEMO-DN-02
        (await db.Organizations.CountAsync(o => o.Code.StartsWith(DemoCaseStudySeeder.DemoOrgPrefix))).Should().Be(3);
        (await db.Users.CountAsync(u => u.Email.EndsWith(DemoCaseStudySeeder.DemoEmailDomain))).Should().Be(2 + 3 * 35); // Admin + Mentor + 3*35 = 107
        (await db.Employees.CountAsync()).Should().Be(3 * 33); // 99
        (await db.Certificates.CountAsync()).Should().Be(3 * 8); // 24

        // Distinct fictional employee names between DEMO-DN-01 and DEMO-DN-02
        var dn01Id = (await db.Organizations.AsNoTracking().SingleAsync(o => o.Code == "DEMO-DN-01")).Id;
        var dn02Id = (await db.Organizations.AsNoTracking().SingleAsync(o => o.Code == "DEMO-DN-02")).Id;
        var dn01Names = await db.Employees.AsNoTracking().Where(e => e.OrganizationId == dn01Id).Select(e => e.FullName).ToListAsync();
        var dn02Names = await db.Employees.AsNoTracking().Where(e => e.OrganizationId == dn02Id).Select(e => e.FullName).ToListAsync();
        dn01Names.Should().NotBeEquivalentTo(dn02Names);

        // CSV should contain 12 mentor/main rows + 2 * 5 = 10 enterprise trial rows = 22 rows
        result.ExportedAccounts.Should().HaveCount(22);
        var csvLines = await File.ReadAllLinesAsync(csvPath);
        csvLines.Should().HaveCount(23); // Header + 22 accounts
    }
}
