using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>
/// EM-10 Giới thiệu bài, EM-11 tự lưu / làm tiếp, EM-12 kết quả, EM-13 lịch sử — bổ sung cho MyAssessmentFlowTests.
/// </summary>
[Collection("PostgresIntegration")]
public class MyAttemptSessionTests
{
    private static async Task<MyAttemptSessionDto> StartReadyAttemptAsync(MeTestWorld world, MeTestWorld.Services s)
    {
        await new CompleteMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new CompleteMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });
        return await new StartMyAssessmentAttemptUseCase(world.Context, s.Me, s.Assessments, s.Presenter)
            .ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
    }

    private static SaveMyAttemptAnswersUseCase Save(MeTestWorld world, MeTestWorld.Services s) =>
        new(world.Context, s.Me, s.Assessments, s.Presenter);

    private static SubmitMyAttemptUseCase Submit(MeTestWorld world, MeTestWorld.Services s) =>
        new(world.Context, s.Me, s.Assessments, s.Presenter);

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Autosave_KeepsTheLatestChoice_AndReloadingTheSessionRestoresIt()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var session = await StartReadyAttemptAsync(world, s);
        var (q1, correct1, wrong1) = world.Questions[0];
        var (q2, correct2, _) = world.Questions[1];

        await Save(world, s).ExecuteAsync(new SaveMyAttemptAnswersUseCaseInput { AttemptId = session.AttemptId, Answers = new() { [q1.Id] = wrong1.Id } });
        var saved = await Save(world, s).ExecuteAsync(new SaveMyAttemptAnswersUseCaseInput
        {
            AttemptId = session.AttemptId,
            Answers = new() { [q1.Id] = correct1.Id, [q2.Id] = correct2.Id },
        });
        world.Context.ChangeTracker.Clear();
        var reloaded = await new GetMyAttemptSessionUseCase(world.Context, s.Me, s.Assessments, s.Presenter)
            .ExecuteAsync(new GetMyAttemptSessionUseCaseInput { AttemptId = session.AttemptId });

        saved.SavedCount.Should().Be(2);
        saved.Deadline.Should().BeCloseTo(session.Deadline!.Value, TimeSpan.FromMilliseconds(1), "PostgreSQL keeps microseconds");
        reloaded.Status.Should().Be(Statuses.AssessmentAttempt.Started);
        reloaded.Answers.Should().Contain(q1.Id, correct1.Id).And.Contain(q2.Id, correct2.Id);
        reloaded.Answers.GetValueOrDefault(world.Questions[2].Question.Id).Should().BeNull("question 3 was never answered");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Autosave_AfterSubmitting_IsRejected()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var session = await StartReadyAttemptAsync(world, s);
        await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(3) });

        var late = () => Save(world, s).ExecuteAsync(new SaveMyAttemptAnswersUseCaseInput
        {
            AttemptId = session.AttemptId,
            Answers = new() { [world.Questions[0].Question.Id] = world.Questions[0].Wrong.Id },
        });

        await late.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Result_OfAnUnsubmittedAttempt_IsNotAvailableYet()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var session = await StartReadyAttemptAsync(world, s);

        var act = () => new GetMyAttemptResultUseCase(s.Me, s.Presenter)
            .ExecuteAsync(new GetMyAttemptResultUseCaseInput { AttemptId = session.AttemptId });

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task AssessmentDetail_ListsOwnAttempts_WithBestScoreAndRemainingTries()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var session = await StartReadyAttemptAsync(world, s);
        await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(1) });

        var detail = await new GetMyAssessmentByIdUseCase(world.Context, s.Me, s.Assessments)
            .ExecuteAsync(new GetMyAssessmentByIdUseCaseInput { AssessmentId = world.Final.Id });

        detail.Status.Should().Be(MyAssessmentStatus.Retake);
        detail.AttemptsUsed.Should().Be(1);
        detail.AttemptsRemaining.Should().Be(1);
        detail.BestScore.Should().Be(33.33m);
        detail.TotalPoints.Should().Be(3);
        detail.Attempts.Should().ContainSingle().Which.Passed.Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task History_ListsNewestFirst_FiltersByResult_AndPaginates()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var failed = await StartReadyAttemptAsync(world, s);
        await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = failed.AttemptId, Answers = world.Answers(1) });
        var passed = await new StartMyAssessmentAttemptUseCase(world.Context, s.Me, s.Assessments, s.Presenter)
            .ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
        await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = passed.AttemptId, Answers = world.Answers(3) });
        var history = new GetMyAttemptHistoryUseCase(world.Context, s.Me);

        var all = await history.ExecuteAsync(new GetMyAttemptHistoryUseCaseInput());
        var onlyPassed = await history.ExecuteAsync(new GetMyAttemptHistoryUseCaseInput { Passed = true });
        var firstPage = await history.ExecuteAsync(new GetMyAttemptHistoryUseCaseInput { PageSize = 1 });

        all.Items.Select(a => a.AttemptId).Should().Equal(passed.AttemptId, failed.AttemptId);
        all.Items.Select(a => a.AttemptNo).Should().Equal(2, 1);
        onlyPassed.Items.Should().ContainSingle().Which.Score.Should().Be(100m);
        firstPage.Items.Should().HaveCount(1);
        firstPage.TotalItems.Should().Be(2);
        firstPage.TotalPages.Should().Be(2);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task History_NeverShowsAColleaguesAttempts()
    {
        var world = await MeTestWorld.CreateAsync();
        var mine = world.For(world.MeUser);
        var session = await StartReadyAttemptAsync(world, mine);
        await Submit(world, mine).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(2) });
        var peer = world.For(world.PeerUser);

        var peerHistory = await new GetMyAttemptHistoryUseCase(world.Context, peer.Me).ExecuteAsync(new GetMyAttemptHistoryUseCaseInput());

        peerHistory.Items.Should().BeEmpty();
    }
}
