using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Persistence;

/// <summary>Seed demo cho các trang cá nhân EM-*: đúng kịch bản và chạy lại không nhân đôi.</summary>
public class EmployeeJourneySeederTests
{
    private static async Task<AppDbContext> SeededTwiceAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        var hasher = new Mock<IPasswordHasher>();
        hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns("hashed");
        await DbSeeder.SeedAsync(context, hasher.Object);
        await DbSeeder.SeedAsync(context, hasher.Object);
        return context;
    }

    [Fact]
    public async Task DevelopmentSeed_GivesDemoEmployeeACompletedAnInProgressAndANewCourse()
    {
        using var context = await SeededTwiceAsync();
        var employee = await context.Employees.SingleAsync(e => e.WorkEmail == "employee@digitalent.ai");

        var enrollments = await (
                from enrollment in context.Enrollments
                join course in context.Courses on enrollment.CourseId equals course.Id
                where enrollment.EmployeeId == employee.Id
                select new { course.Code, enrollment.Status })
            .ToListAsync();
        enrollments.Should().BeEquivalentTo(new[]
        {
            new { Code = "A2-F", Status = Statuses.Enrollment.Completed },
            new { Code = "A4-I", Status = Statuses.Enrollment.InProgress },
            new { Code = "A1-I", Status = Statuses.Enrollment.NotStarted },
        });

        (await context.Certificates.CountAsync(c => c.EmployeeId == employee.Id)).Should().Be(1);
        (await context.Assessments.CountAsync(a => a.Status == Statuses.Assessment.Published)).Should().Be(4);
        (await context.Assessments.CountAsync(a => a.IsFinal)).Should().Be(3, "one published final per course");
        (await context.CertificateTemplates.CountAsync(t => t.Status == Statuses.CertificateTemplate.Active)).Should().Be(1);
    }

    [Fact]
    public async Task DevelopmentSeed_GivesDemoEmployeeTasksInEveryReviewState()
    {
        using var context = await SeededTwiceAsync();
        var employee = await context.Employees.SingleAsync(e => e.WorkEmail == "employee@digitalent.ai");

        var statuses = await context.TaskAssignments.Where(t => t.EmployeeId == employee.Id).Select(t => t.Status).ToListAsync();
        statuses.Should().BeEquivalentTo(new[]
        {
            Statuses.TaskAssignment.Assigned,
            Statuses.TaskAssignment.NeedsRevision,
            Statuses.TaskAssignment.Passed,
        });
        (await context.AssignedTaskTargets.CountAsync()).Should().BeGreaterThanOrEqualTo(3);
    }
}
