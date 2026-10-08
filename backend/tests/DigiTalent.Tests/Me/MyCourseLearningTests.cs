using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>EM-06 Khóa học của tôi, EM-07 Chi tiết khóa học, EM-08 Nội dung bài học — trên PostgreSQL thật.</summary>
[Collection("PostgresIntegration")]
public class MyCourseLearningTests
{
    private static GetMyCourseDetailUseCase Detail(MeTestWorld world, MeTestWorld.Services s) =>
        new(world.Context, s.Me, s.Progress, s.Assessments, s.EnrollmentRules);

    [Fact]
    [Trait("Category", "Integration")]
    public async Task MyCourses_ListOwnEnrollmentWithLessonCounts()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var courses = await new GetMyCoursesUseCase(s.Me, s.Courses).ExecuteAsync(new GetMyCoursesUseCaseInput());

        var card = courses.Items.Should().ContainSingle().Subject;
        card.CourseId.Should().Be(world.Course.Id);
        card.Status.Should().Be(Statuses.Enrollment.NotStarted);
        card.TotalLessons.Should().Be(1, "only required self-completable lessons count; PASS_CHECK is completed by passing its check");
        card.CompletedLessons.Should().Be(0);
        courses.Summary.Total.Should().Be(1);
        courses.Summary.NotStarted.Should().Be(1);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task CourseDetail_ShowsLessons_SelfCompletionRules_AndTheLockedFinal()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var course = await Detail(world, s).ExecuteAsync(new GetMyCourseDetailUseCaseInput { CourseId = world.Course.Id });

        course.Enrollment!.Status.Should().Be(Statuses.Enrollment.NotStarted);
        course.CanEnroll.Should().BeFalse("the employee is already enrolled");
        course.TotalLessons.Should().Be(1, "progress counts required self-completable lessons only");
        course.NextLessonId.Should().Be(world.ViewLesson.Id);
        var lessons = course.Modules.Should().ContainSingle().Subject.Lessons;
        lessons.Should().HaveCount(2, "the syllabus still lists every lesson");
        lessons.Single(l => l.Id == world.ViewLesson.Id).SelfCompletable.Should().BeTrue();
        lessons.Single(l => l.Id == world.PassCheckLesson.Id).SelfCompletable.Should().BeFalse();
        var final = course.Assessments.Should().ContainSingle().Subject;
        final.Id.Should().Be(world.Final.Id);
        final.Status.Should().Be("LOCKED");
        final.CanStart.Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task OpeningALesson_StartsTheCourse_AndShowsNavigation()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var lesson = await new GetMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new GetMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });
        var started = await new StartMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new StartMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });

        lesson.LessonIndex.Should().Be(1);
        lesson.TotalLessons.Should().Be(2);
        lesson.PrevLessonId.Should().BeNull();
        lesson.NextLessonId.Should().Be(world.PassCheckLesson.Id);
        lesson.ContentBody.Should().Be("Content");
        started.LessonStatus.Should().Be(Statuses.LessonProgress.InProgress);
        started.EnrollmentStatus.Should().Be(Statuses.Enrollment.InProgress);
        (await world.Context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == world.MyEnrollment.Id)).StartedAt.Should().NotBeNull();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task CompletingTheOnlyCountedLesson_MakesTheCourseReadyForTheFinal_AndIsIdempotent()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var complete = new CompleteMyLessonUseCase(world.Context, s.Me, s.Progress);
        var input = new CompleteMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id };

        var first = await complete.ExecuteAsync(input);
        var again = await complete.ExecuteAsync(input);

        first.LessonStatus.Should().Be(Statuses.LessonProgress.Completed);
        first.CourseProgressPercent.Should().Be(100);
        first.ReadyForAssessment.Should().BeTrue();
        first.FinalAssessmentId.Should().Be(world.Final.Id);
        first.EnrollmentStatus.Should().Be(Statuses.Enrollment.ReadyForAssessment);
        again.CourseProgressPercent.Should().Be(100);
        (await world.Context.LessonProgresses.CountAsync(p => p.EnrollmentId == world.MyEnrollment.Id && p.LessonId == world.ViewLesson.Id))
            .Should().Be(1);

        var courses = await new GetMyCoursesUseCase(s.Me, s.Courses).ExecuteAsync(new GetMyCoursesUseCaseInput());
        courses.Items.Single().CompletedLessons.Should().Be(1);
        courses.Items.Single().Status.Should().Be(Statuses.Enrollment.ReadyForAssessment);
        var detail = await Detail(world, s).ExecuteAsync(new GetMyCourseDetailUseCaseInput { CourseId = world.Course.Id });
        detail.Assessments.Single().Status.Should().Be("AVAILABLE", "the final unlocks once the counted lessons are done");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task AColleagueCannotOpenMyEnrollmentsLessonsThroughTheirOwnAccount()
    {
        var world = await MeTestWorld.CreateAsync();
        var peer = world.For(world.PeerUser);
        var complete = new CompleteMyLessonUseCase(world.Context, peer.Me, peer.Progress);

        await complete.ExecuteAsync(new CompleteMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });

        var mine = await world.Context.LessonProgresses.CountAsync(p => p.EnrollmentId == world.MyEnrollment.Id);
        mine.Should().Be(0, "the peer's progress is written to the peer's own enrollment");
    }
}
