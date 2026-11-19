using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.GetCapabilityProgress;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using DigiTalent.Tests.TestSupport;

namespace DigiTalent.Tests.Intelligence;

/// <summary>"Khoảng trống năng lực" in real use: gaps now versus at the survey, per domain, department and employee.</summary>
public class CapabilityProgressTests
{
    [Fact]
    public async Task ComparesTheSurveyWithTheLevelNow_ByDomainDepartmentAndEmployee()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var org = Guid.NewGuid();
        var accounting = new Department { OrganizationId = org, Code = "KT", Name = "Kế toán" };
        var marketing = new Department { OrganizationId = org, Code = "MK", Name = "Marketing" };
        var accountant = new JobPosition { OrganizationId = org, Code = "ACCOUNTANT", Name = "Kế toán viên" };
        var marketer = new JobPosition { OrganizationId = org, Code = "MARKETING", Name = "Chuyên viên Marketing" };
        var data = new CompetencyCategory { OrganizationId = org, Code = "TT02_D1", Name = "Khai thác dữ liệu và thông tin", SortOrder = 1 };
        var talk = new CompetencyCategory { OrganizationId = org, Code = "TT02_D2", Name = "Giao tiếp và hợp tác", SortOrder = 2 };
        var search = new DigiTalent.Domain.Entities.Competency { CategoryId = data.Id, Code = "TT02-1.1", Name = "Tìm kiếm" };
        var share = new DigiTalent.Domain.Entities.Competency { CategoryId = talk.Id, Code = "TT02-2.1", Name = "Chia sẻ" };
        var an = new Employee { OrganizationId = org, DepartmentId = accounting.Id, JobPositionId = accountant.Id, FullName = "An", EmployeeCode = "NV1", Status = "ACTIVE" };
        var binh = new Employee { OrganizationId = org, DepartmentId = accounting.Id, JobPositionId = accountant.Id, FullName = "Bình", EmployeeCode = "NV2", Status = "ACTIVE" };
        var chi = new Employee { OrganizationId = org, DepartmentId = marketing.Id, JobPositionId = marketer.Id, FullName = "Chi", EmployeeCode = "NV3", Status = "ACTIVE" };
        db.AddRange(accounting, marketing, accountant, marketer, data, talk, search, share, an, binh, chi);
        var surveyed = DateTimeOffset.UtcNow.AddDays(-10);
        Survey(db, org, an, surveyed, (data, 1), (talk, 2));   // gaps: 2 + 0
        Survey(db, org, binh, surveyed, (data, 3), (talk, 1)); // gaps: 0 + 1
        // An learned since: confirmed practical work at Intermediate in data.
        db.CompetencyEvidences.Add(new CompetencyEvidence
        {
            EmployeeId = an.Id, CompetencyId = search.Id, SourceType = Statuses.EvidenceSourceType.PracticalTask,
            Status = Statuses.EvidenceStatus.Confirmed, IsLevelConfirming = true, ConfirmedLevel = 2, ConfirmedAt = DateTimeOffset.UtcNow,
        });
        await db.SaveChangesAsync();
        // The levels the owner set for each position are what everyone holding it must reach.
        await PositionLevels.SetAsync(db, org, "ACCOUNTANT", (data.Id, 3), (talk.Id, 2));
        await PositionLevels.SetAsync(db, org, "MARKETING", (data.Id, 2), (talk.Id, 1));

        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(org);
        user.SetupGet(u => u.IsAdmin).Returns(true);
        var useCase = new GetCapabilityProgressUseCase(db, user.Object, new EmployeeScope(db, user.Object), new PulseCatalogReader(db));

        var result = await useCase.ExecuteAsync(new GetCapabilityProgressInput());

        result.Employees.Should().Be(3);
        result.Assessed.Should().Be(2);
        result.SurveyedAt.Should().Be(surveyed);
        result.Totals.Should().Be(new CapabilityProgressTotals(GapsAtSurvey: 3, GapsNow: 2, PeopleBelowAtSurvey: 2, PeopleBelowNow: 2, PeopleMet: 0));

        var dataDomain = result.Domains.Single(d => d.Number == 1);
        dataDomain.Required.Should().Be(3);
        dataDomain.AtSurvey.Should().Be(2);
        dataDomain.Now.Should().Be(2.5m);
        dataDomain.BelowAtSurvey.Should().Be(1);
        dataDomain.BelowNow.Should().Be(1);

        var kt = result.Departments.Single(d => d.DepartmentId == accounting.Id);
        kt.Should().Match<CapabilityProgressDepartment>(d => d.Employees == 2 && d.Assessed == 2 && d.GapsAtSurvey == 3 && d.GapsNow == 2 && d.PeopleBelowNow == 2);
        result.Departments.Single(d => d.DepartmentId == marketing.Id).Assessed.Should().Be(0);

        result.People.Select(p => p.Name).Should().Equal("An", "Bình", "Chi");
        var first = result.People[0];
        first.LevelsGained.Should().Be(1);
        first.GapsAtSurvey.Should().Be(2);
        first.GapsNow.Should().Be(1);
        first.Domains.Single(d => d.Number == 1).Should().Match<CapabilityProgressEmployeeDomain>(d => d.Required == 3 && d.AtSurvey == 1 && d.Now == 2);
        result.People[2].Assessed.Should().BeFalse();
        result.People[2].Domains.Should().OnlyContain(d => d.AtSurvey == null && d.Now == null);

        // One department only.
        var onlyMarketing = await useCase.ExecuteAsync(new GetCapabilityProgressInput { DepartmentId = marketing.Id });
        onlyMarketing.Employees.Should().Be(1);
        onlyMarketing.Totals.GapsNow.Should().Be(0);
    }

    private static void Survey(AppDbContext db, Guid org, Employee employee, DateTimeOffset at, params (CompetencyCategory Category, short Level)[] results)
    {
        var assessment = new TrialAssessment { OrganizationId = org, EmployeeId = employee.Id, SubmittedAt = at, ReviewedAt = at };
        db.TrialAssessments.Add(assessment);
        foreach (var (category, level) in results)
            db.TrialAssessmentDomains.Add(new TrialAssessmentDomain { TrialAssessmentId = assessment.Id, CategoryId = category.Id, SuggestedLevel = level, MentorLevel = level });
    }
}
