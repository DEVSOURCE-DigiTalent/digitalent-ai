using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.Recommendation;
using DigiTalent.Application.UseCases.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Gợi ý khóa học trên PostgreSQL thật — ví dụ §5.3 và quy tắc §5.6 của spec Sprint 3.
/// </summary>
[Collection("PostgresIntegration")]
public class RecommendationUseCaseTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static GetCourseRecommendationsUseCase Recommendations(SkillGapTestWorld world, ICurrentUser user) =>
        new(world.Context, user, world.Scope(user),
            new RecommendationWeightsProvider(world.Context, NullLogger<RecommendationWeightsProvider>.Instance));

    private static Task CalculateGapAsync(SkillGapTestWorld world, Employee employee)
    {
        var hr = world.HrManager();
        return new CalculateSkillGapUseCase(world.Context, hr, world.Scope(hr), world.RunService(), world.Reader())
            .ExecuteAsync(new CalculateSkillGapUseCaseInput { EmployeeId = employee.Id });
    }

    private static async Task<Course> AddCourseAsync(
        SkillGapTestWorld world,
        string code,
        short? entryLevel,
        string status = Statuses.Course.Published,
        int version = 1,
        params (string Competency, short Target, string Coverage)[] teaches)
    {
        var authorId = await world.Context.Users.Where(u => u.OrganizationId == world.Organization.Id).Select(u => u.Id).FirstAsync();
        var course = new Course
        {
            OrganizationId = world.Organization.Id,
            Code = code,
            VersionNo = version,
            Title = $"Course {code} v{version}",
            EntryLevel = entryLevel,
            EstimatedDurationMinutes = 60,
            CertificateEnabled = true,
            Status = status,
            CreatedByUserId = authorId,
            RowVersion = 1,
        };
        world.Context.Courses.Add(course);
        world.Context.CourseCompetencies.AddRange(teaches.Select(t => new CourseCompetency
        {
            CourseId = course.Id,
            CompetencyId = world.Competencies[t.Competency].Id,
            TargetLevel = t.Target,
            CoverageType = t.Coverage,
        }));
        await world.Context.SaveChangesAsync();
        return course;
    }

    /// <summary>K1–K4 của ví dụ §5.3.</summary>
    private static async Task<Dictionary<string, Course>> AddSpecCoursesAsync(SkillGapTestWorld world) => new()
    {
        ["K1"] = await AddCourseAsync(world, "K1", 1, teaches: new[] { ("DATA_LITERACY", (short)2, "PRIMARY"), ("AI_LITERACY", (short)2, "SUPPORTING") }),
        ["K2"] = await AddCourseAsync(world, "K2", null, teaches: new[] { ("INFORMATION_SECURITY", (short)2, "PRIMARY") }),
        ["K3"] = await AddCourseAsync(world, "K3", 2, teaches: new[] { ("DATA_LITERACY", (short)3, "PRIMARY") }),
        ["K4"] = await AddCourseAsync(world, "K4", 1, Statuses.Course.Draft, teaches: new[] { ("AI_LITERACY", (short)2, "PRIMARY") }),
    };

    private static async Task AddEnrollmentAsync(SkillGapTestWorld world, Employee employee, Course course, string status)
    {
        world.Context.Enrollments.Add(new Enrollment { EmployeeId = employee.Id, CourseId = course.Id, Status = status });
        await world.Context.SaveChangesAsync();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_HidesCourseUntilItsPrerequisiteIsCompleted()
    {
        // B7: DATA_LITERACY đang ở mức 1, K3 dạy lên mức 3 → cần xong K1 (tiên quyết) hoặc đã đạt mức 2
        var world = await CreateWorldAsync();
        var courses = await AddSpecCoursesAsync(world);
        world.Context.CoursePrerequisites.Add(new CoursePrerequisite { CourseId = courses["K3"].Id, PrerequisiteCourseId = courses["K1"].Id });
        await world.Context.SaveChangesAsync();
        await CalculateGapAsync(world, world.Analyst);

        var before = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });
        await AddEnrollmentAsync(world, world.Analyst, courses["K1"], Statuses.Enrollment.Completed);
        var after = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        before.Items.Select(i => i.CourseCode).Should().Equal("K2", "K1");
        after.Items.Select(i => i.CourseCode).Should().Equal("K3", "K2");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_CourseEntryIgnoresCompetenciesThePositionDoesNotRequire()
    {
        // D-B7: vị trí không yêu cầu mọi năng lực của miền. K1 dạy DATA_LITERACY (vị trí cần, đang mức 1) và một năng lực
        // vị trí không yêu cầu (chưa có mức nào). K1 có tiên quyết chưa học → chỉ còn xét theo mức; năng lực ngoài bộ
        // tiêu chuẩn không được kéo mức thấp nhất xuống 0.
        var world = await CreateWorldAsync();
        var courses = await AddSpecCoursesAsync(world);
        var notRequired = new Domain.Entities.Competency
        {
            CategoryId = world.Competencies["DATA_LITERACY"].CategoryId,
            Code = $"EXTRA_{Guid.NewGuid():N}"[..20],
            Name = "Not required by the position",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active,
        };
        world.Context.Competencies.Add(notRequired);
        world.Context.CourseCompetencies.Add(new CourseCompetency
        {
            CourseId = courses["K1"].Id,
            CompetencyId = notRequired.Id,
            TargetLevel = 2,
            CoverageType = Statuses.CourseCoverageType.Primary,
        });
        world.Context.CoursePrerequisites.Add(new CoursePrerequisite { CourseId = courses["K1"].Id, PrerequisiteCourseId = courses["K2"].Id });
        await world.Context.SaveChangesAsync();
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        result.Items.Select(i => i.CourseCode).Should().Contain("K1");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_GoldenExample_RanksK3K2K1AndExcludesDraft()
    {
        var world = await CreateWorldAsync();
        await AddSpecCoursesAsync(world);
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        result.Reason.Should().BeNull();
        result.ScoringConfigVersion.Should().Be(RecommendationWeights.DefaultVersion);
        result.SkillGapRunId.Should().NotBeNull();
        result.Items.Select(i => i.CourseCode).Should().Equal("K3", "K2", "K1");
        result.Items.Select(i => i.Score).Should().Equal(55.00m, 49.17m, 39.25m);
        var k1 = result.Items[2];
        k1.Breakdown.GapPriorityCoverage.Should().Be(19.25m);
        k1.Reasons.Select(r => r.CompetencyName).Should().Equal("DATA LITERACY", "AI LITERACY");
        k1.Explanation.Should().StartWith("Raises DATA LITERACY from Basic to Intermediate (required: Advanced, mandatory).");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_DefaultsToCallerOwnEmployeeProfile()
    {
        var world = await CreateWorldAsync();
        await AddSpecCoursesAsync(world);
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.EmployeeSelf(world.Analyst))
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput());

        result.EmployeeId.Should().Be(world.Analyst.Id);
        result.Items.Should().HaveCount(3);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_UsesOnlyLatestPublishedVersionOfEachCode()
    {
        var world = await CreateWorldAsync();
        // X: v1 dạy năng lực đang thiếu nhưng v2 (mới hơn, PUBLISHED) thì không → không gợi ý X (R1)
        await AddCourseAsync(world, "X", null, version: 1, teaches: new[] { ("INFORMATION_SECURITY", (short)2, "PRIMARY") });
        await AddCourseAsync(world, "X", null, version: 2, teaches: new[] { ("PROBLEM_SOLVING", (short)3, "PRIMARY") });
        // Y: v1 ARCHIVED, v2 PUBLISHED dạy năng lực đang thiếu → gợi ý Y v2
        await AddCourseAsync(world, "Y", null, Statuses.Course.Archived, version: 1, teaches: new[] { ("INFORMATION_SECURITY", (short)2, "PRIMARY") });
        var yV2 = await AddCourseAsync(world, "Y", null, version: 2, teaches: new[] { ("INFORMATION_SECURITY", (short)2, "PRIMARY") });
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        result.Items.Should().ContainSingle().Which.CourseId.Should().Be(yV2.Id);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_ExcludesCompletedAndReportsOpenEnrollment()
    {
        var world = await CreateWorldAsync();
        var courses = await AddSpecCoursesAsync(world);
        await AddEnrollmentAsync(world, world.Analyst, courses["K3"], Statuses.Enrollment.Completed);
        await AddEnrollmentAsync(world, world.Analyst, courses["K2"], Statuses.Enrollment.InProgress);
        await AddEnrollmentAsync(world, world.Analyst, courses["K1"], Statuses.Enrollment.Cancelled);
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        result.Items.Select(i => i.CourseCode).Should().Equal("K2", "K1");
        result.Items[0].EnrollmentStatus.Should().Be(Statuses.Enrollment.InProgress);
        result.Items[1].EnrollmentStatus.Should().BeNull("a cancelled enrollment can be recommended again");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_ReturnsReason_WhenNothingToRecommend()
    {
        var world = await CreateWorldAsync();
        var useCase = Recommendations(world, world.HrManager()); // mock HR không gắn hồ sơ nhân viên

        var noProfile = await useCase.ExecuteAsync(new GetCourseRecommendationsUseCaseInput());
        var noRun = await useCase.ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });
        await CalculateGapAsync(world, world.Analyst);
        var noCourse = await useCase.ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        noProfile.Reason.Should().Be(RecommendationEmptyReasons.NoEmployeeProfile);
        noRun.Reason.Should().Be(RecommendationEmptyReasons.NoSkillGapRun);
        noCourse.Reason.Should().Be(RecommendationEmptyReasons.NoMatchingCourse);
        noCourse.SkillGapRunId.Should().NotBeNull();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_ReturnsNoGap_WhenEmployeeMeetsTheStandard()
    {
        var world = await CreateWorldAsync();
        await AddSpecCoursesAsync(world);
        foreach (var item in world.ActiveSet.Items)
        {
            world.Context.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
            {
                EmployeeId = world.AnalystInDepartmentB.Id,
                CompetencyId = item.CompetencyId,
                ConfirmedLevel = (short)item.RequiredLevel,
                ConfirmedAt = DateTimeOffset.UtcNow,
                RowVersion = 1,
            });
        }
        await world.Context.SaveChangesAsync();
        await CalculateGapAsync(world, world.AnalystInDepartmentB);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });

        result.Reason.Should().Be(RecommendationEmptyReasons.NoGap);
        result.Items.Should().BeEmpty();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Get_DepartmentManagerCannotSeeOtherDepartment()
    {
        var world = await CreateWorldAsync();

        var act = () => Recommendations(world, world.ManagerOf(world.DepartmentA))
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.AnalystInDepartmentB.Id });

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Theory]
    [Trait("Category", "Integration")]
    [InlineData(50, 50, 0, "3", 50.00)]   // cấu hình hợp lệ: K3 = 0.5×50 + 0.5×50 + 1×0
    [InlineData(50, 30, 10, "DEFAULT", 55.00)] // tổng 90 → cấu hình hỏng → mặc định 70/20/10
    public async Task Get_UsesActiveScoringConfigOrFallsBackToDefault(
        int gapWeight, int mandatoryWeight, int entryWeight, string expectedVersion, double expectedK3Score)
    {
        var world = await CreateWorldAsync();
        var config = new ScoringConfig
        {
            OrganizationId = world.Organization.Id,
            ConfigType = Statuses.ScoringConfigType.RecommendationWeights,
            Version = 3,
            IsActive = true,
        };
        world.Context.ScoringConfigs.Add(config);
        world.Context.ScoringConfigItems.AddRange(
            new ScoringConfigItem { ScoringConfigId = config.Id, ComponentCode = RecommendationComponents.GapPriorityCoverage, Weight = gapWeight },
            new ScoringConfigItem { ScoringConfigId = config.Id, ComponentCode = RecommendationComponents.MandatoryCoverage, Weight = mandatoryWeight },
            new ScoringConfigItem { ScoringConfigId = config.Id, ComponentCode = RecommendationComponents.EntryLevelFit, Weight = entryWeight });
        await world.Context.SaveChangesAsync();
        await AddSpecCoursesAsync(world);
        await CalculateGapAsync(world, world.Analyst);

        var result = await Recommendations(world, world.HrManager())
            .ExecuteAsync(new GetCourseRecommendationsUseCaseInput { EmployeeId = world.Analyst.Id });

        result.ScoringConfigVersion.Should().Be(expectedVersion);
        result.Items.Single(i => i.CourseCode == "K3").Score.Should().Be((decimal)expectedK3Score);
    }
}
