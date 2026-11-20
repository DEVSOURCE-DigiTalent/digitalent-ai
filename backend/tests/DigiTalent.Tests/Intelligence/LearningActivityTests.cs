using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.Reports.GetLearningActivity;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

/// <summary>The owner's overview of learning (OW-01): who learns now, what was finished, week by week.</summary>
public class LearningActivityTests
{
    // Wednesday 18/11/2026: the current week starts on Monday 16/11.
    private static readonly DateTimeOffset Now = new(2026, 11, 18, 10, 0, 0, TimeSpan.Zero);

    private sealed class FixedClock(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }

    [Fact]
    public async Task CountsOpenAndFinishedCourses_OfActiveEmployeesInScope_WeekByWeek()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var org = Guid.NewGuid();
        var department = new Department { OrganizationId = org, Code = "KT", Name = "Kế toán" };
        var data = new CompetencyCategory { OrganizationId = org, Code = "TT02_D1", Name = "Khai thác dữ liệu và thông tin", SortOrder = 1 };
        var search = new DigiTalent.Domain.Entities.Competency { CategoryId = data.Id, Code = "TT02-1.1", Name = "Tìm kiếm" };
        // M1-F is a standard course (domain 1, Basic); INT-1 is an internal course outside the 18.
        var basic = new Course { OrganizationId = org, Code = "M1-F", VersionNo = 1, Title = "Tìm kiếm thông tin cơ bản", Status = Statuses.Course.Published, CreatedByUserId = Guid.NewGuid() };
        var internalCourse = new Course { OrganizationId = org, Code = "INT-1", VersionNo = 1, Title = "Quy trình nội bộ", Status = Statuses.Course.Published, CreatedByUserId = Guid.NewGuid() };
        var an = new Employee { OrganizationId = org, DepartmentId = department.Id, FullName = "An", EmployeeCode = "NV1", Status = Statuses.Employee.Active };
        var binh = new Employee { OrganizationId = org, DepartmentId = department.Id, FullName = "Bình", EmployeeCode = "NV2", Status = Statuses.Employee.Active };
        var left = new Employee { OrganizationId = org, DepartmentId = department.Id, FullName = "Cường", EmployeeCode = "NV3", Status = Statuses.Employee.Inactive };
        var other = new Employee { OrganizationId = Guid.NewGuid(), DepartmentId = Guid.NewGuid(), FullName = "Dũng", EmployeeCode = "X1", Status = Statuses.Employee.Active };
        db.AddRange(department, data, search, basic, internalCourse, an, binh, left, other);
        db.CourseCompetencies.Add(new CourseCompetency { CourseId = basic.Id, CompetencyId = search.Id, TargetLevel = 1, CoverageType = "PRIMARY" });
        db.Enrollments.AddRange(
            Enroll(an, basic, Statuses.Enrollment.Completed, started: new(2026, 11, 10, 8, 0, 0, TimeSpan.Zero), completed: new(2026, 11, 17, 9, 0, 0, TimeSpan.Zero)),
            Enroll(an, internalCourse, Statuses.Enrollment.InProgress, started: new(2026, 11, 17, 8, 0, 0, TimeSpan.Zero)),
            Enroll(an, internalCourse, Statuses.Enrollment.Cancelled, started: new(2026, 11, 17, 8, 0, 0, TimeSpan.Zero)),
            Enroll(binh, basic, Statuses.Enrollment.ReadyForAssessment, started: new(2026, 11, 3, 8, 0, 0, TimeSpan.Zero)),
            Enroll(binh, internalCourse, Statuses.Enrollment.Completed, started: new(2026, 8, 20, 8, 0, 0, TimeSpan.Zero), completed: new(2026, 9, 1, 8, 0, 0, TimeSpan.Zero)),
            Enroll(left, basic, Statuses.Enrollment.Completed, started: new(2026, 11, 16, 8, 0, 0, TimeSpan.Zero), completed: new(2026, 11, 16, 9, 0, 0, TimeSpan.Zero)),
            Enroll(other, basic, Statuses.Enrollment.InProgress, started: new(2026, 11, 16, 8, 0, 0, TimeSpan.Zero)));
        await db.SaveChangesAsync();

        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(org);
        user.SetupGet(u => u.OrganizationId).Returns(org);
        user.SetupGet(u => u.IsAdmin).Returns(true);
        var useCase = new GetLearningActivityUseCase(db, user.Object, new EmployeeScope(db, user.Object), new PulseCatalogReader(db), new FixedClock(Now));

        var result = await useCase.ExecuteAsync(new GetLearningActivityInput());

        // the inactive employee, the other organization and the cancelled enrollment are left out
        result.Employees.Should().Be(2);
        result.Learners.Should().Be(2);          // An in progress, Bình waiting for the final
        result.InProgress.Should().Be(2);
        result.Completed.Should().Be(2);
        result.CompletedLast30Days.Should().Be(1);

        result.Weeks.Should().HaveCount(8);
        result.Weeks[0].WeekStart.Should().Be(new DateOnly(2026, 9, 28));
        result.Weeks[^1].Should().Be(new LearningActivityWeek(new DateOnly(2026, 11, 16), Started: 1, Completed: 1));
        result.Weeks[^2].Should().Be(new LearningActivityWeek(new DateOnly(2026, 11, 9), Started: 1, Completed: 0));
        result.Weeks[^3].Should().Be(new LearningActivityWeek(new DateOnly(2026, 11, 2), Started: 1, Completed: 0));

        result.Recent.Select(r => (r.EmployeeName, r.CourseTitle, r.DomainNumber, r.Level)).Should().Equal(
            ("An", "Tìm kiếm thông tin cơ bản", 1, 1),
            ("Bình", "Quy trình nội bộ", (int?)null, (int?)null));
    }

    private static Enrollment Enroll(Employee employee, Course course, string status, DateTimeOffset started, DateTimeOffset? completed = null) => new()
    {
        EmployeeId = employee.Id, CourseId = course.Id, Status = status, StartedAt = started, CompletedAt = completed,
        ProgressPercent = completed == null ? 40 : 100,
    };
}
