using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>
/// EM-09..EM-13 trên PostgreSQL thật: mở khóa bài cuối khóa, deadline server, tự lưu, chấm, hết giờ,
/// giới hạn số lần, cấp chứng chỉ và không lộ dữ liệu của người khác.
/// </summary>
[Collection("PostgresIntegration")]
public class MyAssessmentFlowTests
{
    private static StartMyAssessmentAttemptUseCase Start(MeTestWorld world, MeTestWorld.Services s) =>
        new(world.Context, s.Me, s.Assessments, s.Presenter);

    private static SubmitMyAttemptUseCase Submit(MeTestWorld world, MeTestWorld.Services s) =>
        new(world.Context, s.Me, s.Assessments, s.Presenter);

    private static async Task CompleteViewLessonAsync(MeTestWorld world, MeTestWorld.Services s) =>
        await new CompleteMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new CompleteMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.ViewLesson.Id });

    [Fact]
    [Trait("Category", "Integration")]
    public async Task FinalAssessment_IsLockedUntilRequiredLessonsAreCompleted()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var before = await new GetMyAssessmentsUseCase(s.Me, s.Assessments).ExecuteAsync(new GetMyAssessmentsUseCaseInput());
        before.Items.Single().Status.Should().Be(MyAssessmentStatus.Locked);
        var locked = () => Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
        await locked.Should().ThrowAsync<ConflictException>();

        await CompleteViewLessonAsync(world, s);

        var enrollment = await world.Context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == world.MyEnrollment.Id);
        enrollment.Status.Should().Be(Statuses.Enrollment.ReadyForAssessment);
        enrollment.ProgressPercent.Should().Be(100m, "the PASS_CHECK lesson is completed through the quiz, not counted as self-completable");
        var after = await new GetMyAssessmentsUseCase(s.Me, s.Assessments).ExecuteAsync(new GetMyAssessmentsUseCaseInput());
        after.Items.Single().Status.Should().Be(MyAssessmentStatus.Available);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task PassCheckLesson_CannotBeSelfCompleted()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var act = () => new CompleteMyLessonUseCase(world.Context, s.Me, s.Progress)
            .ExecuteAsync(new CompleteMyLessonUseCaseInput { CourseId = world.Course.Id, LessonId = world.PassCheckLesson.Id });

        await act.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task StartTwice_ResumesTheSameAttempt_AndNeverSendsCorrectAnswers()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await CompleteViewLessonAsync(world, s);

        var first = await Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
        var second = await Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });

        second.AttemptId.Should().Be(first.AttemptId);
        first.Deadline.Should().Be(first.StartedAt.AddMinutes(15));
        first.Questions.Should().HaveCount(3);
        typeof(MyQuestionOptionDto).GetProperties().Select(p => p.Name).Should().NotContain("IsCorrect");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task SubmitPassingFinal_CompletesCourse_IssuesCertificate_AndRevealsAnswers()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await CompleteViewLessonAsync(world, s);
        var session = await Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });

        var result = await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(3) });

        result.Score.Should().Be(100m);
        result.Passed.Should().BeTrue();
        result.CourseCompleted.Should().BeTrue();
        result.RevealAnswers.Should().BeTrue();
        result.Questions.Should().OnlyContain(q => q.CorrectOptionId != null && q.IsCorrect);
        result.Certificate.Should().NotBeNull();
        result.Certificate!.Code.Should().StartWith("DT-");

        var certificate = await world.Context.Certificates.AsNoTracking().SingleAsync(c => c.AssessmentAttemptId == session.AttemptId);
        certificate.HolderNameSnapshot.Should().Be(world.Me.FullName);
        certificate.ExpiresAt.Should().BeCloseTo(certificate.IssuedAt.AddDays(365), TimeSpan.FromSeconds(1));

        // Nộp lại lần làm đã chấm → trả lại kết quả cũ, không chấm / cấp chứng chỉ lần 2
        var again = await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(0) });
        again.Score.Should().Be(100m);
        (await world.Context.Certificates.CountAsync(c => c.EmployeeId == world.Me.Id)).Should().Be(1);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task FailedAttempt_HidesCorrectAnswers_AndAttemptLimitIsEnforced()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await CompleteViewLessonAsync(world, s);

        for (var attempt = 1; attempt <= 2; attempt++)
        {
            var session = await Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
            var result = await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(1) });

            result.Passed.Should().BeFalse();
            result.Score.Should().Be(33.33m);
            result.AttemptsRemaining.Should().Be(2 - attempt);
            // Còn lượt làm lại → chưa lộ đáp án; hết lượt → được xem
            result.RevealAnswers.Should().Be(attempt == 2);
        }

        var third = () => Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
        await third.Should().ThrowAsync<ConflictException>().WithMessage(MyAssessmentService.NoAttemptsLeftMessage);
        (await world.Context.Certificates.AnyAsync(c => c.EmployeeId == world.Me.Id)).Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task ExpiredAttempt_IsAutoScoredWithSavedAnswersOnly()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await CompleteViewLessonAsync(world, s);
        var session = await Start(world, s).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });

        // Tự lưu 1 câu đúng, rồi để quá giờ
        await new SaveMyAttemptAnswersUseCase(world.Context, s.Me, s.Assessments, s.Presenter).ExecuteAsync(new SaveMyAttemptAnswersUseCaseInput
        {
            AttemptId = session.AttemptId,
            Answers = world.Answers(3).Take(1).ToDictionary(x => x.Key, x => x.Value),
        });
        await world.Context.AssessmentAttempts
            .Where(a => a.Id == session.AttemptId)
            .ExecuteUpdateAsync(set => set.SetProperty(a => a.StartedAt, DateTimeOffset.UtcNow.AddMinutes(-30)));
        world.Context.ChangeTracker.Clear();

        // Gửi kèm đủ 3 đáp án đúng sau giờ → bị bỏ qua, chỉ tính đáp án đã lưu
        var result = await Submit(world, s).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(3) });

        result.AutoSubmitted.Should().BeTrue();
        result.CorrectCount.Should().Be(1);
        result.Passed.Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task OtherEmployeesAttempts_AreInvisible()
    {
        var world = await MeTestWorld.CreateAsync();
        var me = world.For(world.MeUser);
        await CompleteViewLessonAsync(world, me);
        var session = await Start(world, me).ExecuteAsync(new StartMyAssessmentAttemptUseCaseInput { AssessmentId = world.Final.Id });
        await Submit(world, me).ExecuteAsync(new SubmitMyAttemptUseCaseInput { AttemptId = session.AttemptId, Answers = world.Answers(3) });

        var peer = world.For(world.PeerUser);
        var readResult = () => new GetMyAttemptResultUseCase(peer.Me, peer.Presenter)
            .ExecuteAsync(new GetMyAttemptResultUseCaseInput { AttemptId = session.AttemptId });
        await readResult.Should().ThrowAsync<NotFoundException>();

        var history = await new GetMyAttemptHistoryUseCase(world.Context, peer.Me)
            .ExecuteAsync(new GetMyAttemptHistoryUseCaseInput { PageIndex = 1, PageSize = 10 });
        history.TotalItems.Should().Be(0);
    }
}
