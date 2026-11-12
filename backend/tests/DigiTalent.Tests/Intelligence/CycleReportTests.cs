using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Reports;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Intelligence;

public class CycleReportTests
{
    [Fact]
    public async Task TrainingIncludesSharedCoursesAndOnlyEnrollmentsInTheSelectedPosition()
    {
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var org = Guid.NewGuid(); var otherOrg = Guid.NewGuid(); var department = Guid.NewGuid(); var position = Guid.NewGuid();
        var user = new Mock<ICurrentUser>();
        user.Setup(u => u.GetRequiredOrganizationId()).Returns(org);
        var employees = new[] {
            new Employee { OrganizationId = org, DepartmentId = department, JobPositionId = position, EmployeeCode = "E1", FullName = "Selected", Status = "ACTIVE" },
            new Employee { OrganizationId = org, DepartmentId = department, JobPositionId = Guid.NewGuid(), EmployeeCode = "E2", FullName = "Other position", Status = "ACTIVE" },
            new Employee { OrganizationId = otherOrg, EmployeeCode = "E3", FullName = "Other company", Status = "ACTIVE" },
        };
        db.Employees.AddRange(employees);
        var course = new Course { OrganizationId = otherOrg, Code = "A1-I", Title = "Shared course", Status = "PUBLISHED", VersionNo = 1 };
        db.Courses.Add(course);
        for (var index = 0; index < employees.Length; index++)
        {
            var assignment = new CourseAssignment { CourseId = course.Id, EmployeeId = employees[index].Id, Status = "ACTIVE", AssignmentSource = "MANUAL" };
            db.CourseAssignments.Add(assignment);
            db.Enrollments.Add(new Enrollment { CourseAssignmentId = assignment.Id, CourseId = course.Id, EmployeeId = employees[index].Id, Status = index == 0 ? "IN_PROGRESS" : "COMPLETED", ProgressPercent = index == 0 ? 20 : 100 });
        }
        await db.SaveChangesAsync();
        var report = await new GetReportsOverviewUseCase(db, user.Object).ExecuteAsync(new GetReportsOverviewInput { DepartmentId = department, JobPositionId = position });
        report.Training.TotalAssignments.Should().Be(1);
        report.Training.CompletedAssignments.Should().Be(0);
        report.Training.InProgressAssignments.Should().Be(1);
        var row = report.Training.Courses.Should().ContainSingle().Subject;
        row.Id.Should().Be(course.Id.ToString());
        row.LearnerCount.Should().Be(1);
        row.AverageProgress.Should().Be(20);
    }
}
