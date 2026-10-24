using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class PulseProctoringRiskTests
{
    private static PulseProctoringEventDto Event(string kind, long offsetMs, long? durationMs = null) => new()
    {
        Kind = kind,
        OffsetMs = offsetMs,
        DurationMs = durationMs,
        Flagged = Statuses.ProctoringEvent.Flagged.Contains(kind),
    };

    [Fact]
    public void Analyze_CleanSession_IsLowWithNoMoments()
    {
        var risk = PulseProctoringRisk.Analyze(new[]
        {
            Event(Statuses.ProctoringEvent.Started, 0),
            Event(Statuses.ProctoringEvent.FaceCheckOn, 800),
            Event(Statuses.ProctoringEvent.Submitted, 600_000),
        }, 600_000);

        risk.Score.Should().Be(0);
        risk.Level.Should().Be(PulseProctoringRisk.Low);
        risk.FaceCheck.Should().Be(PulseProctoringRisk.FaceCheckOn);
        risk.Factors.Should().BeEmpty();
        risk.Moments.Should().BeEmpty();
    }

    [Fact]
    public void Analyze_AddsPointsForDuration_UpToThreeTimesTheBaseOfOneEvent()
    {
        PulseProctoringRisk.Analyze(new[] { Event(Statuses.ProctoringEvent.FaceMissing, 10_000, 25_000) }, 60_000)
            .Score.Should().Be(5 + 2 * 2, "5 điểm mỗi lần + 2 điểm mỗi 10 giây vắng mặt");
        PulseProctoringRisk.Analyze(new[] { Event(Statuses.ProctoringEvent.FaceMissing, 10_000, 300_000) }, 400_000)
            .Score.Should().Be(15, "một lần vắng mặt tối đa 3 lần điểm gốc");
    }

    [Fact]
    public void Analyze_CapsEachKind_AndTheTotal()
    {
        var events = Enumerable.Range(0, 10).Select(i => Event(Statuses.ProctoringEvent.MultipleFaces, i * 60_000L, 2_000))
            .Concat(Enumerable.Range(0, 10).Select(i => Event(Statuses.ProctoringEvent.TabHidden, 30_000 + i * 60_000L, 40_000)))
            .Concat(Enumerable.Range(0, 10).Select(i => Event(Statuses.ProctoringEvent.FaceMissing, 45_000 + i * 60_000L, 10_000)))
            .ToList();

        var risk = PulseProctoringRisk.Analyze(events, 700_000);

        risk.Factors.Single(f => f.Kind == Statuses.ProctoringEvent.MultipleFaces).Points.Should().Be(40);
        risk.Factors.Single(f => f.Kind == Statuses.ProctoringEvent.TabHidden).Points.Should().Be(30);
        risk.Score.Should().Be(100);
        risk.Level.Should().Be(PulseProctoringRisk.High);
        risk.Factors.First().Kind.Should().Be(Statuses.ProctoringEvent.MultipleFaces, "yếu tố nặng nhất đứng đầu");
    }

    [Fact]
    public void Analyze_LostSourceLastsUntilItIsResumed_OrTheEndOfTheSession()
    {
        var risk = PulseProctoringRisk.Analyze(new[]
        {
            Event(Statuses.ProctoringEvent.CameraStopped, 60_000),
            Event(Statuses.ProctoringEvent.CameraResumed, 90_000),
            Event(Statuses.ProctoringEvent.ShareStopped, 200_000),
        }, 260_000);

        risk.Factors.Single(f => f.Kind == Statuses.ProctoringEvent.CameraStopped).TotalMs.Should().Be(30_000);
        risk.Factors.Single(f => f.Kind == Statuses.ProctoringEvent.ShareStopped).TotalMs.Should().Be(60_000);
        risk.Score.Should().Be(10 + 2 * 3 + 10 + 2 * 6);
    }

    [Fact]
    public void Analyze_MergesNearbyEventsIntoOneMoment_WithTheWorstSeverity()
    {
        var risk = PulseProctoringRisk.Analyze(new[]
        {
            Event(Statuses.ProctoringEvent.LookingAway, 30_000, 4_000),
            Event(Statuses.ProctoringEvent.MultipleFaces, 40_000, 3_000),
            Event(Statuses.ProctoringEvent.FaceMissing, 200_000, 5_000),
        }, 300_000);

        risk.Moments.Should().HaveCount(2);
        var first = risk.Moments[0];
        first.StartMs.Should().Be(30_000);
        first.EndMs.Should().Be(43_000);
        first.Severity.Should().Be(PulseProctoringRisk.High);
        first.Kinds.Should().Equal(Statuses.ProctoringEvent.LookingAway, Statuses.ProctoringEvent.MultipleFaces);
        first.EventCount.Should().Be(2);
        risk.Moments[1].Severity.Should().Be(PulseProctoringRisk.Medium);
    }

    [Fact]
    public void Analyze_KeepsTheHeaviestMoments_InTimeOrder()
    {
        var events = Enumerable.Range(0, 30)
            .Select(i => Event(i == 25 ? Statuses.ProctoringEvent.MultipleFaces : Statuses.ProctoringEvent.LookingAway, i * 60_000L, 3_000))
            .ToList();

        var risk = PulseProctoringRisk.Analyze(events, 1_900_000);

        risk.Moments.Should().HaveCount(PulseProctoringRisk.MaxMoments);
        risk.Moments.Select(m => m.StartMs).Should().BeInAscendingOrder();
        risk.Moments.Should().Contain(m => m.StartMs == 25 * 60_000L);
    }

    [Theory]
    [InlineData(new string[0], PulseProctoringRisk.FaceCheckNone)]
    [InlineData(new[] { Statuses.ProctoringEvent.FaceCheckOff }, PulseProctoringRisk.FaceCheckOff)]
    [InlineData(new[] { Statuses.ProctoringEvent.FaceCheckOn, Statuses.ProctoringEvent.FaceCheckOff }, PulseProctoringRisk.FaceCheckPartial)]
    public void Analyze_ReportsWhetherTheBrowserRanFaceDetection(string[] kinds, string expected) =>
        PulseProctoringRisk.Analyze(kinds.Select((k, i) => Event(k, i * 1000L)).ToList(), 10_000).FaceCheck.Should().Be(expected);
}
