using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.BehaviorReports;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Infrastructure.AI;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Tests.Pulse;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.BehaviorReports;

/// <summary>
/// Báo cáo hành vi khi làm bài cuối khóa (canonical v3.10): lập cùng lần nộp bài, AI phân tích nhật ký ở nền, chủ doanh
/// nghiệp xem danh sách / chi tiết và yêu cầu phân tích lại.
/// </summary>
public class BehaviorReportTests
{
    /// <summary>AI giả: trả <see cref="Result"/> (null = AI không trả lời được) và ghi lại dữ liệu đã nhận.</summary>
    private sealed class FakeBehaviorAi : IGeminiService
    {
        public bool IsConfigured { get; init; } = true;
        public Func<BehaviorAiInput, BehaviorAiResult?> Result { get; init; } = _ => null;
        public List<BehaviorAiInput> Calls { get; } = new();

        public Task<BehaviorAiResult?> AnalyzeExamBehaviorAsync(BehaviorAiInput input, CancellationToken cancellationToken = default)
        {
            Calls.Add(input);
            return Task.FromResult(Result(input));
        }

        public Task<PulseAiHintDto> EvaluateEvidenceAsync(
            string evidenceText, string finalPrompt, IReadOnlyList<string> criteria, IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
            string? courseContent = null, string? domainName = null, int? tier = null, IReadOnlyList<PulseCriterionDto>? rubric = null,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(IReadOnlyList<TrialEssayAiInput> essays, CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();
    }

    private static PulseRecordingReader Recordings(PulseTestWorld world) =>
        new(world.Context, new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "pulse-test-signing-key-0123456789abcdef" }, world.Clock));

    private sealed record Owner(
        GetBehaviorReportsUseCase List,
        GetBehaviorReportUseCase Detail,
        AnalyzeBehaviorReportUseCase Analyze,
        RecordingBehaviorQueue Queue);

    private static async Task<Owner> OwnerAsync(PulseTestWorld world, string email = PulseTestWorld.OwnerEmail, string role = Roles.Owner)
    {
        var current = await world.CurrentUserAsync(email, role);
        var reader = new BehaviorReportReader(world.Context, new EmployeeScope(world.Context, current.Object), current.Object, new PulseCatalogReader(world.Context));
        var queue = new RecordingBehaviorQueue();
        return new Owner(
            new GetBehaviorReportsUseCase(world.Context, reader, queue),
            new GetBehaviorReportUseCase(world.Context, reader, Recordings(world)),
            new AnalyzeBehaviorReportUseCase(world.Context, reader, queue),
            queue);
    }

    private static ProctoringBehaviorAnalyzer Analyzer(PulseTestWorld world, IGeminiService ai) => new(world.Context, ai, world.Clock);

    /// <summary>
    /// employee@ làm bài cuối khóa M1-F (đã đạt bài kiểm tra đầu vào) với nhật ký: màn hình phụ, sao chép đề, rời tab 45 giây,
    /// dán 640 ký tự vào ô tự luận, không thấy khuôn mặt 20 giây; rồi nộp.
    /// </summary>
    private static async Task<(Guid SessionId, SubmitPulseFinalUseCaseOutput Submitted)> SubmitWithEventsAsync(PulseTestWorld world, string evidence = PulseTestWorld.Evidence)
    {
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await world.PassEntryTestAsync(employee, "M1-F");
        var sessionId = await world.ProctorAsync(employee, course.CourseId, Statuses.ProctoringKind.Final);
        await employee.RecordEvents.ExecuteAsync(new RecordPulseProctoringEventsUseCaseInput
        {
            SessionId = sessionId,
            Events = new List<PulseProctoringEventInput>
            {
                new() { Kind = Statuses.ProctoringEvent.SecondScreen, OffsetMs = 1_000, Detail = "EXTENDED" },
                new() { Kind = Statuses.ProctoringEvent.Copy, OffsetMs = 30_000, Detail = "QUESTION:180" },
                new() { Kind = Statuses.ProctoringEvent.TabHidden, OffsetMs = 40_000, DurationMs = 45_000 },
                new() { Kind = Statuses.ProctoringEvent.Paste, OffsetMs = 90_000, Detail = "ESSAY:640" },
                new() { Kind = Statuses.ProctoringEvent.FaceMissing, OffsetMs = 120_000, DurationMs = 20_000 },
            },
        });
        world.Context.ChangeTracker.Clear();
        var submitted = await employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput
        {
            CourseId = course.CourseId,
            EvidenceText = evidence,
            ProctoringSessionId = sessionId,
            Answers = await world.AnswersAsync(world.LastPaper),
        });
        world.Context.ChangeTracker.Clear();
        return (sessionId, submitted);
    }

    private static BehaviorAiResult Suspicious(BehaviorAiInput input) => new(
        "high",
        "Nhân viên sao chép đề, rời tab gần một phút rồi dán đoạn dài vào bài tự luận.",
        "Xem đoạn 00:30–01:30 của bản ghi màn hình.",
        new List<BehaviorAiFinding>
        {
            new("HIGH", "Sao chép đề, rời tab rồi dán bài", "Chuỗi sao chép → rời tab 45 giây → dán 640 ký tự.", new[] { 2, 3, 4, 99 }),
            new("MEDIUM", "Vắng mặt trước camera", "Không thấy khuôn mặt 20 giây.", new[] { 5 }),
            new("LOW", "Phát hiện bịa", "Không có sự kiện nào như vậy.", new[] { 42 }),
        },
        "gemini-test");

    [Fact]
    public async Task SubmittingFinal_StoresPendingReport_WithTheLogTotals_AndQueuesIt()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var (sessionId, submitted) = await SubmitWithEventsAsync(world);

        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        report.SessionId.Should().Be(sessionId);
        report.FinalSubmissionId.Should().Be(submitted.SubmissionId);
        report.Status.Should().Be(Statuses.BehaviorReport.Pending);
        report.AiLevel.Should().BeNull();
        world.BehaviorQueue.Queued.Should().Equal(report.Id);

        var details = BehaviorReportComposer.Deserialize(report.Details);
        details.Stats.PastedIntoEssayChars.Should().Be(640);
        details.Stats.LargePasteCount.Should().Be(1);
        details.Stats.CopyCount.Should().Be(1);
        (details.Stats.AwayCount, details.Stats.AwayMs).Should().Be((1, 45_000L));
        details.Stats.SecondScreen.Should().BeTrue();
        details.Stats.EssayChars.Should().Be(PulseTestWorld.Evidence.Length);
        details.Risk.Factors.Select(f => f.Kind).Should().Contain(new[] { Statuses.ProctoringEvent.Paste, Statuses.ProctoringEvent.SecondScreen });
        report.RiskScore.Should().Be((short)details.Risk.Score).And.BeGreaterThan(0);
        report.RiskLevel.Should().Be(details.Risk.Level);
    }

    [Fact]
    public async Task Analyzer_KeepsOnlyFindingsBackedByLoggedEvents()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        var ai = new FakeBehaviorAi { Result = Suspicious };

        (await Analyzer(world, ai).AnalyzeAsync(report.Id)).Should().BeTrue();
        world.Context.ChangeTracker.Clear();

        var sent = ai.Calls.Single();
        sent.Events.Select(e => e.Kind).Should().Equal(
            Statuses.ProctoringEvent.SecondScreen, Statuses.ProctoringEvent.Copy, Statuses.ProctoringEvent.TabHidden,
            Statuses.ProctoringEvent.Paste, Statuses.ProctoringEvent.FaceMissing);
        sent.Events.Select(e => e.Number).Should().Equal(1, 2, 3, 4, 5);
        sent.CourseTitle.Should().NotBeNullOrWhiteSpace();
        sent.EssayChars.Should().Be(PulseTestWorld.Evidence.Length);

        var stored = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        stored.Status.Should().Be(Statuses.BehaviorReport.Ready);
        stored.AiLevel.Should().Be(Statuses.RiskLevel.High);
        stored.Model.Should().Be("gemini-test");
        stored.InputHash.Should().HaveLength(64);
        stored.AnalyzedAt.Should().Be(world.Clock.Now);
        stored.AttemptCount.Should().Be(1);
        stored.Summary.Should().StartWith("Nhân viên sao chép đề");

        var details = BehaviorReportComposer.Deserialize(stored.Details);
        details.Findings.Should().HaveCount(2, "a finding that cites no logged event is dropped");
        var chain = details.Findings[0];
        chain.Events.Select(e => e.Kind).Should().Equal(Statuses.ProctoringEvent.Copy, Statuses.ProctoringEvent.TabHidden, Statuses.ProctoringEvent.Paste);
        (chain.StartMs, chain.EndMs).Should().Be((30_000L, 90_000L), "the range comes from the events themselves, not from the AI");
        details.Findings[1].Severity.Should().Be(Statuses.RiskLevel.Medium);
        (details.Findings[1].StartMs, details.Findings[1].EndMs).Should().Be((120_000L, 140_000L));
        details.Advice.Should().Contain("00:30");
    }

    [Fact]
    public async Task Analyzer_WithoutAnAiKey_FailsWithNotConfigured_AndKeepsTheLogTotals()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        var ai = new FakeBehaviorAi { IsConfigured = false, Result = Suspicious };

        await Analyzer(world, ai).AnalyzeAsync(report.Id);

        ai.Calls.Should().BeEmpty();
        var stored = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        (stored.Status, stored.ErrorCode, stored.AiLevel).Should().Be((Statuses.BehaviorReport.Failed, ProctoringBehaviorAnalyzer.NotConfigured, (string?)null));
        BehaviorReportComposer.Deserialize(stored.Details).Risk.Score.Should().Be(stored.RiskScore);
    }

    [Fact]
    public async Task Analyzer_RetriesATransientFailure_ThenFails()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        var ai = new FakeBehaviorAi { Result = _ => null };

        for (var attempt = 1; attempt < ProctoringBehaviorAnalyzer.MaxAutoAttempts; attempt++)
        {
            await Analyzer(world, ai).AnalyzeAsync(report.Id);
            world.Context.ChangeTracker.Clear();
            var pending = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
            (pending.Status, pending.ErrorCode, pending.AttemptCount).Should().Be((Statuses.BehaviorReport.Pending, ProctoringBehaviorAnalyzer.Unavailable, (short)attempt));
        }

        await Analyzer(world, ai).AnalyzeAsync(report.Id);
        world.Context.ChangeTracker.Clear();
        var failed = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        (failed.Status, failed.ErrorCode).Should().Be((Statuses.BehaviorReport.Failed, ProctoringBehaviorAnalyzer.Unavailable));

        (await Analyzer(world, ai).AnalyzeAsync(report.Id)).Should().BeFalse("only pending reports are analyzed");
    }

    [Fact]
    public async Task Analyzer_ReadsAnAnswerWithAnUnknownLevel_AsInvalid()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        var ai = new FakeBehaviorAi { Result = input => Suspicious(input) with { Level = "SEVERE" } };

        await Analyzer(world, ai).AnalyzeAsync(report.Id);

        var stored = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        (stored.Status, stored.ErrorCode).Should().Be((Statuses.BehaviorReport.Failed, ProctoringBehaviorAnalyzer.InvalidAnswer));
    }

    [Fact]
    public async Task OwnerList_GroupsReportsByEmployee_WithTheCourseDomain_AndBackfillsOlderFinals()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        await Analyzer(world, new FakeBehaviorAi { Result = Suspicious }).AnalyzeAsync(report.Id);
        world.Context.ChangeTracker.Clear();
        var owner = await OwnerAsync(world);

        var employee = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var list = await owner.List.ExecuteAsync(new GetBehaviorReportsUseCaseInput());
        var person = list.Employees.Single();
        (person.EmployeeId, person.Level, person.High).Should().Be((employee.Id, Statuses.RiskLevel.High, 1));
        var item = person.Reports.Single();
        item.ReportId.Should().Be(report.Id);
        item.EmployeeName.Should().Be(employee.FullName);
        item.CourseCode.Should().Be("M1-F");
        (item.DomainNumber, item.Tier).Should().Be(((int?)1, (int?)1), "M1-F is the Basic course of domain 1, as on the capability gap page");
        item.DomainName.Should().NotBeNullOrWhiteSpace();
        (item.Status, item.Level, item.AttemptNo, item.FindingCount).Should().Be((Statuses.BehaviorReport.Ready, Statuses.RiskLevel.High, 1, 2));
        item.Marks.Should().HaveCount(2);
        item.FindingTitles.Should().Equal("Sao chép đề, rời tab rồi dán bài", "Vắng mặt trước camera");
        item.Decision.Should().BeNull();
        (list.Counts.All, list.Counts.High, list.Counts.Analyzing, list.Counts.PeopleHigh).Should().Be((1, 1, 0, 1));
        owner.Queue.Queued.Should().BeEmpty("the report already exists");

        // A final submitted before the feature has no report: opening the list writes one and queues it.
        world.Context.ProctoringBehaviorReports.Remove(await world.Context.ProctoringBehaviorReports.SingleAsync());
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        var backfilled = await owner.List.ExecuteAsync(new GetBehaviorReportsUseCaseInput());
        var again = backfilled.Employees.Single().Reports.Single();
        (again.Status, again.Level).Should().Be((Statuses.BehaviorReport.Pending, again.RiskLevel));
        backfilled.Counts.Analyzing.Should().Be(1);
        owner.Queue.Queued.Should().Equal(again.ReportId);
    }

    [Fact]
    public async Task OwnerDetail_HasEvidence_TheEssay_AndTheRecording_AndReanalyzeKeepsTheOldResultOnFailure()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var (sessionId, _) = await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        await Analyzer(world, new FakeBehaviorAi { Result = Suspicious }).AnalyzeAsync(report.Id);
        world.Context.ChangeTracker.Clear();
        var owner = await OwnerAsync(world);

        var detail = await owner.Detail.ExecuteAsync(new GetBehaviorReportUseCaseInput { ReportId = report.Id });
        detail.Findings.Should().HaveCount(2);
        detail.Findings[0].Events.Should().HaveCount(3);
        detail.EssayText.Should().Be(PulseTestWorld.Evidence);
        detail.Recording!.SessionId.Should().Be(sessionId);
        detail.Recording.Segments.Should().HaveCount(2).And.OnlyContain(s => s.ContentPath != null);
        detail.Recording.Events.Select(e => e.Kind).Should().Contain(Statuses.ProctoringEvent.Paste);
        detail.Stats.PastedIntoEssayChars.Should().Be(640);
        detail.Advice.Should().NotBeNullOrWhiteSpace();
        detail.DomainNumber.Should().Be(1);

        var started = await owner.Analyze.ExecuteAsync(new AnalyzeBehaviorReportUseCaseInput { ReportId = report.Id });
        world.Context.ChangeTracker.Clear();
        started.Status.Should().Be(Statuses.BehaviorReport.Pending);
        owner.Queue.Queued.Should().Equal(report.Id);

        await Analyzer(world, new FakeBehaviorAi { IsConfigured = true, Result = _ => null }).AnalyzeAsync(report.Id);
        world.Context.ChangeTracker.Clear();
        await Analyzer(world, new FakeBehaviorAi { Result = input => Suspicious(input) with { Level = "?" } }).AnalyzeAsync(report.Id);
        world.Context.ChangeTracker.Clear();
        var kept = await owner.Detail.ExecuteAsync(new GetBehaviorReportUseCaseInput { ReportId = report.Id });
        (kept.Status, kept.AiLevel, kept.ErrorCode).Should().Be((Statuses.BehaviorReport.Ready, Statuses.RiskLevel.High, ProctoringBehaviorAnalyzer.InvalidAnswer));
        kept.Findings.Should().HaveCount(2, "a failed re-analysis keeps the previous findings");

        var missing = () => owner.Detail.ExecuteAsync(new GetBehaviorReportUseCaseInput { ReportId = Guid.NewGuid() });
        await missing.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AnEmployee_SeesNoReportOfOthers()
    {
        using var world = await PulseTestWorld.CreateAsync();
        await SubmitWithEventsAsync(world);
        var report = await world.Context.ProctoringBehaviorReports.AsNoTracking().SingleAsync();
        var manager = await OwnerAsync(world, PulseTestWorld.ManagerEmail, Roles.Employee);

        (await manager.List.ExecuteAsync(new GetBehaviorReportsUseCaseInput())).Employees.Should().BeEmpty();
        var detail = () => manager.Detail.ExecuteAsync(new GetBehaviorReportUseCaseInput { ReportId = report.Id });
        await detail.Should().ThrowAsync<NotFoundException>();
        var analyze = () => manager.Analyze.ExecuteAsync(new AnalyzeBehaviorReportUseCaseInput { ReportId = report.Id });
        await analyze.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public void Risk_ALargePasteWeighsLikeAStrongSignal()
    {
        var small = PulseProctoringRisk.Analyze(new List<PulseProctoringEventDto>
        {
            new() { Kind = Statuses.ProctoringEvent.Paste, OffsetMs = 1_000, Detail = "ESSAY:40" },
        }, 60_000);
        var large = PulseProctoringRisk.Analyze(new List<PulseProctoringEventDto>
        {
            new() { Kind = Statuses.ProctoringEvent.Paste, OffsetMs = 1_000, Detail = $"ESSAY:{PulseProctoringRisk.LargePasteChars}" },
        }, 60_000);

        large.Score.Should().BeGreaterThan(small.Score);
        large.Moments.Single().Severity.Should().Be(PulseProctoringRisk.High);
        small.Moments.Single().Severity.Should().Be(PulseProctoringRisk.Medium);
    }

    [Fact]
    public void AiEvents_SkipSessionMarkers_AndKeepFlaggedEventsWhenTheLogIsLong()
    {
        var events = new List<PulseProctoringEventDto>
        {
            new() { Kind = Statuses.ProctoringEvent.Started, OffsetMs = 0 },
            new() { Kind = Statuses.ProctoringEvent.FaceCheckOn, OffsetMs = 500 },
        };
        events.AddRange(Enumerable.Range(1, BehaviorReportComposer.MaxAiEvents).Select(i =>
            new PulseProctoringEventDto { Kind = Statuses.ProctoringEvent.Idle, OffsetMs = i * 1000, DurationMs = 90_000 }));
        events.Add(new PulseProctoringEventDto { Kind = Statuses.ProctoringEvent.MultipleFaces, OffsetMs = 999_000, Flagged = true });

        var (sent, truncated) = BehaviorReportComposer.AiEvents(events);

        truncated.Should().BeTrue();
        sent.Should().ContainSingle().Which.Kind.Should().Be(Statuses.ProctoringEvent.MultipleFaces);
        BehaviorReportComposer.AiEvents(events.Take(10).ToList()).Events.Select(e => e.Kind)
            .Should().OnlyContain(kind => kind == Statuses.ProctoringEvent.Idle);
    }

    [Theory]
    [InlineData(Statuses.ProctoringEvent.Paste, "ESSAY:640", true)]
    [InlineData(Statuses.ProctoringEvent.Copy, "QUESTION:12", true)]
    [InlineData(Statuses.ProctoringEvent.Paste, "640 ký tự", false)]
    [InlineData(Statuses.ProctoringEvent.Paste, null, false)]
    [InlineData(Statuses.ProctoringEvent.Idle, null, true)]
    [InlineData(Statuses.ProctoringEvent.SecondScreen, "EXTENDED", true)]
    public void Validator_ClipboardEventsNeedThePlaceAndTheCount(string kind, string? detail, bool valid)
    {
        var result = new RecordPulseProctoringEventsUseCaseValidator().Validate(new RecordPulseProctoringEventsUseCaseInput
        {
            SessionId = Guid.NewGuid(),
            Events = new List<PulseProctoringEventInput> { new() { Kind = kind, OffsetMs = 1000, DurationMs = 1000, Detail = detail } },
        });

        result.IsValid.Should().Be(valid);
    }

    [Fact]
    public void Gemini_PromptNumbersTheLog_AndTheParserReadsBothReferenceStyles()
    {
        var input = new BehaviorAiInput(
            "Dữ liệu cơ bản", "Dữ liệu và thông tin số", 1, 1, 600_000, 420, 18, 20, "ON", 46, "MEDIUM",
            new List<BehaviorAiEvent>
            {
                new(1, Statuses.ProctoringEvent.Copy, 30_000, null, "QUESTION:180"),
                new(2, Statuses.ProctoringEvent.TabHidden, 40_000, 45_000, null),
            },
            false);

        var prompt = GeminiService.BehaviorPrompt(input);
        prompt.Should().Contain("#1 | 00:30 | COPY |  | QUESTION:180").And.Contain("#2 | 00:40 | TAB_HIDDEN | 45 giây |");
        prompt.Should().Contain("Dữ liệu cơ bản").And.Contain("420 ký tự (chưa chấm)").And.Contain("18/20 câu");
        // the rule score is never read as the exam grade, and rearranging one's own essay is not pasting from outside
        prompt.Should().Contain("KHÔNG phải điểm bài thi): 46/100 (trung bình)").And.Contain("sắp xếp lại chữ của mình");
        // findings are read by the owner: Vietnamese names only, no event codes such as "(Focus Lost)"
        prompt.Should().Contain("không chèn mã sự kiện");

        var parsed = GeminiService.ParseBehavior(
            """{"level":"MEDIUM","summary":"S","advice":"","findings":[{"severity":"HIGH","title":"T","explanation":"E","events":[1,"#2","x"]}]}""",
            "gemini-x")!;
        parsed.Level.Should().Be("MEDIUM");
        parsed.Advice.Should().BeNull();
        parsed.Findings.Single().EventNumbers.Should().Equal(1, 2);
        parsed.Model.Should().Be("gemini-x");
    }
}
