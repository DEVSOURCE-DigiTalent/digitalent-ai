using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>EM-06..08, EM-14..17 trên PostgreSQL thật: nhiệm vụ của chính mình, nộp lại, tệp đính kèm, tự ghi danh.</summary>
[Collection("PostgresIntegration")]
public class MyTaskAndCourseTests
{
    private static SubmitMyTaskUseCase Submit(MeTestWorld world, MeTestWorld.Services s) => new(world.Context, s.Me);

    [Fact]
    [Trait("Category", "Integration")]
    public async Task MyTasks_OnlyContainOwnAssignments()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var tasks = await new GetMyTasksUseCase(s.Me, s.Tasks).ExecuteAsync(new GetMyTasksUseCaseInput());

        tasks.Items.Select(t => t.AssignmentId).Should().Equal(world.MyTask.Id);
        tasks.Items.Single().Targets.Single().TargetLevel.Should().Be(2);
        var peerTask = () => new GetMyTaskDetailUseCase(s.Me, s.Tasks)
            .ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = world.PeerTask.Id });
        await peerTask.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Submit_MovesTaskToSubmitted_NotifiesReviewer_AndBlocksResubmitUntilReviewed()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var output = await Submit(world, s).ExecuteAsync(new SubmitMyTaskUseCaseInput
        {
            AssignmentId = world.MyTask.Id,
            Content = "Rà soát xong quyền truy cập thư mục chứng từ.",
            LinkUrls = new() { "https://example.com/a", "https://example.com/b" },
        });

        output.VersionNo.Should().Be(1);
        output.AssignmentStatus.Should().Be(Statuses.TaskAssignment.Submitted);
        var detail = await new GetMyTaskDetailUseCase(s.Me, s.Tasks).ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = world.MyTask.Id });
        detail.Submissions.Single().Links.Should().Equal("https://example.com/a", "https://example.com/b");
        detail.Submissions.Single().Status.Should().Be("PENDING_REVIEW");
        (await world.Context.Notifications.AnyAsync(n => n.RecipientUserId == world.Reviewer.Id && n.RelatedEntityId == output.SubmissionId))
            .Should().BeTrue();

        var resubmit = () => Submit(world, s).ExecuteAsync(new SubmitMyTaskUseCaseInput
        {
            AssignmentId = world.MyTask.Id,
            Content = "Nộp lại khi chưa được chấm điểm.",
        });
        await resubmit.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Resubmit_AfterRevisionRequest_SupersedesPreviousVersion()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var first = await Submit(world, s).ExecuteAsync(new SubmitMyTaskUseCaseInput { AssignmentId = world.MyTask.Id, Content = "Phiên bản đầu tiên của bài nộp." });

        // Reviewer yêu cầu chỉnh sửa
        await world.Context.TaskAssignments.Where(a => a.Id == world.MyTask.Id)
            .ExecuteUpdateAsync(set => set.SetProperty(a => a.Status, Statuses.TaskAssignment.NeedsRevision));
        world.Context.TaskEvaluations.Add(new TaskEvaluation
        {
            TaskSubmissionId = first.SubmissionId,
            ReviewerUserId = world.Reviewer.Id,
            OverallScore = 50,
            Verdict = Statuses.TaskVerdict.NeedsRevision,
            Feedback = "Bổ sung ảnh chụp cấu hình.",
            EvaluatedAt = DateTimeOffset.UtcNow,
            RowVersion = 1,
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var second = await Submit(world, s).ExecuteAsync(new SubmitMyTaskUseCaseInput { AssignmentId = world.MyTask.Id, Content = "Phiên bản thứ hai đã bổ sung ảnh." });

        second.VersionNo.Should().Be(2);
        var detail = await new GetMyTaskDetailUseCase(s.Me, s.Tasks).ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = world.MyTask.Id });
        detail.Submissions.Select(x => (x.VersionNo, x.Status)).Should().Equal((2, "PENDING_REVIEW"), (1, "NEEDS_REVISION"));
        detail.Submissions[1].Evaluation!.Feedback.Should().Be("Bổ sung ảnh chụp cấu hình.");
        (await world.Context.TaskSubmissions.AsNoTracking().SingleAsync(x => x.Id == first.SubmissionId)).Status
            .Should().Be(Statuses.TaskSubmission.Superseded);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Submit_RejectsAttachmentUploadedForAnotherTask()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var foreignFile = new FileObject
        {
            OrganizationId = world.Organization.Id,
            Bucket = MyTaskAttachmentRules.Bucket,
            ObjectKey = $"{MyTaskAttachmentRules.FolderFor(world.PeerTask.Id)}/202610/{Guid.NewGuid():N}.pdf",
            OriginalName = "other.pdf",
            SizeBytes = 10,
            AccessLevel = Statuses.FileAccessLevel.Private,
            UploadedByUserId = world.MeUser.Id,
        };
        world.Context.FileObjects.Add(foreignFile);
        await world.Context.SaveChangesAsync();

        var act = () => Submit(world, s).ExecuteAsync(new SubmitMyTaskUseCaseInput
        {
            AssignmentId = world.MyTask.Id,
            Content = "Đính kèm tệp của nhiệm vụ khác.",
            AttachmentIds = new() { foreignFile.Id },
        });

        await act.Should().ThrowAsync<BadRequestException>();
        (await world.Context.TaskAssignments.AsNoTracking().SingleAsync(a => a.Id == world.MyTask.Id)).Status
            .Should().Be(Statuses.TaskAssignment.Assigned, "a rejected submission must not change the task");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task SelfEnroll_RequiresCompletedPrerequisite()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var advanced = new Course
        {
            OrganizationId = world.Organization.Id,
            Code = world.Course.Code + "-ADV",
            VersionNo = 1,
            Title = "Advanced security",
            CertificateEnabled = true,
            Status = Statuses.Course.Published,
            CreatedByUserId = world.Reviewer.Id,
            RowVersion = 1,
        };
        world.Context.Courses.Add(advanced);
        world.Context.CourseCompetencies.Add(new CourseCompetency
        {
            CourseId = advanced.Id,
            CompetencyId = world.Competency.Id,
            TargetLevel = 3,
            CoverageType = Statuses.CourseCoverageType.Primary,
        });
        world.Context.CoursePrerequisites.Add(new CoursePrerequisite { CourseId = advanced.Id, PrerequisiteCourseId = world.Course.Id });
        await world.Context.SaveChangesAsync();
        var enroll = new EnrollInCourseUseCase(world.Context, s.Me, s.EnrollmentRules);

        var blocked = () => enroll.ExecuteAsync(new EnrollInCourseUseCaseInput { CourseId = advanced.Id });
        await blocked.Should().ThrowAsync<ConflictException>().WithMessage($"*{world.Course.Code}*");

        await world.Context.Enrollments.Where(e => e.Id == world.MyEnrollment.Id).ExecuteUpdateAsync(set => set
            .SetProperty(e => e.Status, Statuses.Enrollment.Completed)
            .SetProperty(e => e.StartedAt, DateTimeOffset.UtcNow.AddDays(-2))
            .SetProperty(e => e.CompletedAt, DateTimeOffset.UtcNow.AddDays(-1)));

        var output = await enroll.ExecuteAsync(new EnrollInCourseUseCaseInput { CourseId = advanced.Id });
        output.Status.Should().Be(Statuses.Enrollment.NotStarted);

        var again = () => enroll.ExecuteAsync(new EnrollInCourseUseCaseInput { CourseId = advanced.Id });
        await again.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Lesson_RequiresEnrollment()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await world.Context.Enrollments.Where(e => e.Id == world.MyEnrollment.Id)
            .ExecuteUpdateAsync(set => set.SetProperty(e => e.Status, Statuses.Enrollment.Cancelled));

        var act = () => new GetMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new GetMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });

        await act.Should().ThrowAsync<ForbiddenException>();
    }
}
