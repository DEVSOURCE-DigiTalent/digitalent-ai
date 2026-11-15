using System.Net;
using System.Text;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.AI;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class MentorReviewEnhancementTests
{
    [Fact]
    public async Task FinalsAsync_ResolvesLegacyMCodeViaCurrentPlatformCatalog_WithoutLeadingDomainNumber()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"learning-content-{Guid.NewGuid():N}")
            .Options);
        await PlatformCatalogSeeder.SeedAsync(db);

        var orgCourse = new Course
        {
            OrganizationId = Guid.NewGuid(),
            Code = "M1-A",
            VersionNo = 1,
            Title = "Phân tích thông tin và quản trị dữ liệu",
            Status = Statuses.Course.Published,
            CreatedByUserId = Guid.NewGuid(),
        };
        var customCourse = new Course
        {
            OrganizationId = orgCourse.OrganizationId,
            Code = "CUSTOM-01",
            VersionNo = 1,
            Title = "Khóa tùy chỉnh nội bộ",
            Status = Statuses.Course.Published,
            CreatedByUserId = orgCourse.CreatedByUserId,
        };
        db.Courses.AddRange(orgCourse, customCourse);
        db.PracticalTaskTemplates.Add(new PracticalTaskTemplate
        {
            OrganizationId = orgCourse.OrganizationId,
            RelatedCourseId = customCourse.Id,
            Title = "Bài thực hành nội bộ",
            Description = "Mô tả bài thực hành riêng cho phòng ban.",
            ExpectedOutput = "Bảng tính kiểm chứng đối soát",
            GeneralMarkingCriteria = """[{"criterion":"Số liệu chính xác"},{"criterion":"Bước làm rõ ràng"}]""",
            SourceType = "MANUAL",
            Status = "ACTIVE",
            CreatedByUserId = orgCourse.CreatedByUserId,
        });
        await db.SaveChangesAsync();

        var finals = await new LearningContentReader(db).FinalsAsync(new[] { orgCourse.Id, customCourse.Id });

        finals.Should().ContainKey(orgCourse.Id);
        var m1a = finals[orgCourse.Id];
        m1a.Title.Should().Be("Bài cuối khóa");
        var decodedPrompt = WebUtility.HtmlDecode(m1a.PromptHtml);
        decodedPrompt.Should().Contain("khai thác dữ liệu và thông tin");
        decodedPrompt.Should().NotContain("1. khai thác dữ liệu");
        m1a.Criteria.Should().Equal(PlatformCatalog.DefaultFinalCriteria);

        finals.Should().ContainKey(customCourse.Id);
        var custom = finals[customCourse.Id];
        custom.Title.Should().Be("Bài thực hành nội bộ");
        custom.PromptHtml.Should().Contain("Bảng tính kiểm chứng đối soát");
        custom.Criteria.Should().Equal("Số liệu chính xác", "Bước làm rõ ràng");
    }

    [Fact]
    public async Task GeminiService_EvaluatesEvidenceWithCriterionNotes_AndFailsOverOnNotFound()
    {
        var jsonPayload = """
            ```json
            {
              "checks": [true, false, true],
              "criterion_notes": [
                "Đã nêu tệp CRM doanh thu Q3.",
                "Chưa đưa công thức kiểm tra cụ thể.",
                "Có đề xuất rà soát dữ liệu tuần tới."
              ],
              "summary": "Bài nêu được nguồn và hướng hành động nhưng thiếu phép kiểm chứng.",
              "detail": {
                "plagiarism_score": 10,
                "plagiarism_note": "Viết theo tình huống riêng.",
                "ai_generated_score": 15,
                "ai_generated_note": "Văn phong tự nhiên.",
                "relevance_score": 78,
                "relevance_note": "Bám sát bối cảnh công việc.",
                "depth_score": 52,
                "depth_note": "Cần thêm số liệu đối chiếu.",
                "clarity_score": 80,
                "clarity_note": "Trình bày dễ theo dõi.",
                "verdict": "Đề nghị bổ sung bước đối chiếu số liệu."
              },
              "fraud": { "level": "LOW", "summary": "Không thấy bất thường.", "items": [] }
            }
            ```
            """;
        var geminiBody = System.Text.Json.JsonSerializer.Serialize(new
        {
            candidates = new[] { new { content = new { parts = new[] { new { text = jsonPayload } } } } },
        });

        var handler = new RecordingHttpHandler(
            (HttpStatusCode.NotFound, """{"error":{"message":"model missing"}}"""),
            (HttpStatusCode.OK, geminiBody));

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Gemini:ApiKey"] = "unit-test-key",
                ["Gemini:Model"] = "gemini-primary-test",
                ["Gemini:FallbackModels:0"] = "gemini-backup-test",
            })
            .Build();

        var service = new GeminiService(new HttpClient(handler), config, NullLogger<GeminiService>.Instance);
        service.IsConfigured.Should().BeTrue();

        var result = await service.EvaluateEvidenceAsync(
            "Tôi lấy báo cáo doanh thu Q3 từ CRM và đề xuất kiểm tra định kỳ hàng tuần.",
            "<p>Nêu nguồn, thao tác kiểm tra và bước tiếp theo.</p>",
            new[] { "Nguồn có thể truy vết", "Hành động có thể kiểm tra", "Kết luận có căn cứ" });

        handler.RequestedPaths.Should().Equal(
            "/v1beta/models/gemini-primary-test:generateContent",
            "/v1beta/models/gemini-backup-test:generateContent");
        result.Source.Should().Be("GEMINI");
        result.Model.Should().Be("gemini-backup-test");
        result.Checks.Should().Equal(true, false, true);
        result.CriterionNotes.Should().Equal(
            "Đã nêu tệp CRM doanh thu Q3.",
            "Chưa đưa công thức kiểm tra cụ thể.",
            "Có đề xuất rà soát dữ liệu tuần tới.");
        result.Detail.Should().NotBeNull();
        result.Detail!.DepthScore.Should().Be(52);
    }

    [Fact]
    public async Task GeminiService_WithoutApiKey_ReturnsKeywordFallback()
    {
        var prevGemini = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var prevGoogle = Environment.GetEnvironmentVariable("GOOGLE_API_KEY");
        Environment.SetEnvironmentVariable("GEMINI_API_KEY", null);
        Environment.SetEnvironmentVariable("GOOGLE_API_KEY", null);
        try
        {
            var config = new ConfigurationBuilder().Build();
            var service = new GeminiService(new HttpClient(), config, NullLogger<GeminiService>.Instance);
            service.IsConfigured.Should().BeFalse();

            var hint = await service.EvaluateEvidenceAsync(
                "Nguồn sổ cái đối chiếu kết luận bước tiếp theo.",
                "Đề bài",
                new[] { "Tiêu chí 1", "Tiêu chí 2", "Tiêu chí 3" });

            hint.Source.Should().Be("KEYWORD_FALLBACK");
            hint.Model.Should().BeNull();
            hint.Detail.Should().BeNull();
        }
        finally
        {
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", prevGemini);
            Environment.SetEnvironmentVariable("GOOGLE_API_KEY", prevGoogle);
        }
    }

    [Fact]
    public async Task GetPulseFinalReviewsUseCase_StoresGeminiResults_AndDoesNotStoreKeywordFallback()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var overview = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var targetCode = overview.Courses.First(c => c.CanStartPreAssessment).Code;
        var course = await world.OpenForLearningAsync(employee, targetCode);
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);

        var managerUser = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var managerEmp = await world.EmployeeAsync(PulseTestWorld.OwnerEmail);
        var current = new Mock<ICurrentUser>();
        current.Setup(c => c.UserId).Returns(managerUser.Id);
        current.Setup(c => c.OrganizationId).Returns(managerUser.OrganizationId);
        current.Setup(c => c.GetRequiredOrganizationId()).Returns(managerUser.OrganizationId!.Value);
        current.Setup(c => c.DepartmentId).Returns(managerEmp.DepartmentId);
        current.Setup(c => c.Roles).Returns(new List<string> { Roles.Owner });
        current.Setup(c => c.IsAdmin).Returns(true);
        current.Setup(c => c.IsAuthenticated).Returns(true);

        var scope = new PulseReviewScope(world.Context, new EmployeeScope(world.Context, current.Object), current.Object);
        var catalog = new PulseCatalogReader(world.Context);
        var paper = new PulseExamPaper(world.Context, new PulseQuizReader(world.Context));
        var final = new PulseFinalReader(world.Context, paper);
        var signer = new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "pulse-test-signing-key-0123456789abcdef" }, world.Clock);
        var recordings = new PulseRecordingReader(world.Context, signer);

        // 1. KEYWORD_FALLBACK is never stored -> calls AI twice.
        var fallbackGemini = new CountingGeminiService("KEYWORD_FALLBACK");
        var ucFallback = new GetPulseFinalReviewsUseCase(
            world.Context, scope, catalog, final, recordings, paper, current.Object, world.Clock, fallbackGemini);

        var r1 = await ucFallback.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var r2 = await ucFallback.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        fallbackGemini.CallCount.Should().Be(2);
        r1.Items.Single().AiHint!.Source.Should().Be("KEYWORD_FALLBACK");
        r2.Items.Single().AiHint!.Source.Should().Be("KEYWORD_FALLBACK");

        // 2. GEMINI is stored (pulse_ai_reviews) and reused across repeated GETs, bypassed when RefreshAi + RefreshSubmissionId match.
        var realGemini = new CountingGeminiService("GEMINI");
        var ucReal = new GetPulseFinalReviewsUseCase(
            world.Context, scope, catalog, final, recordings, paper, current.Object, world.Clock, realGemini);

        var g1 = await ucReal.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var g2 = await ucReal.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        realGemini.CallCount.Should().Be(1);
        g1.Items.Single().AiHint!.Source.Should().Be("GEMINI");
        g2.Items.Single().AiHint!.Source.Should().Be("GEMINI");

        await ucReal.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput
        {
            RefreshAi = true,
            RefreshSubmissionId = submitted.SubmissionId,
        });
        realGemini.CallCount.Should().Be(2);
    }

    [Fact]
    public async Task DecidePulseFinal_ValidatesAndAuditsCriterionEvaluations()
    {
        var validator = new DecidePulseFinalUseCaseValidator();
        var validInput = new DecidePulseFinalUseCaseInput
        {
            SubmissionId = Guid.NewGuid(),
            Decision = Statuses.FinalSubmissionDecision.NotYet,
            Reason = "Thiếu minh chứng đối chiếu số liệu theo tiêu chí 2.",
            CriterionEvaluations = new List<PulseCriterionEvaluationInput>
            {
                new() { Number = "01", Title = "Nguồn có thể truy vết", Status = "PASS", Note = "Đã nêu tệp CRM." },
                new() { Number = "02", Title = "Hành động có thể kiểm tra", Status = "FAIL", Note = "Chưa có phép tính đối chiếu." },
            },
        };
        (await validator.ValidateAsync(validInput)).IsValid.Should().BeTrue();

        var badInput = new DecidePulseFinalUseCaseInput
        {
            SubmissionId = Guid.NewGuid(),
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Đủ độ dài nhận xét tối thiểu.",
            CriterionEvaluations = new List<PulseCriterionEvaluationInput>
            {
                new() { Number = "01", Title = "", Status = "UNKNOWN" },
            },
        };
        (await validator.ValidateAsync(badInput)).IsValid.Should().BeFalse();

        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var overview = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var targetCode = overview.Courses.First(c => c.CanStartPreAssessment).Code;
        var course = await world.OpenForLearningAsync(employee, targetCode);
        await world.PassAllModulesAsync(employee, course.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);

        var managerUser = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var managerEmp = await world.EmployeeAsync(PulseTestWorld.OwnerEmail);
        var current = new Mock<ICurrentUser>();
        current.Setup(c => c.UserId).Returns(managerUser.Id);
        current.Setup(c => c.OrganizationId).Returns(managerUser.OrganizationId);
        current.Setup(c => c.GetRequiredOrganizationId()).Returns(managerUser.OrganizationId!.Value);
        current.Setup(c => c.DepartmentId).Returns(managerEmp.DepartmentId);
        current.Setup(c => c.Roles).Returns(new List<string> { Roles.Owner });
        current.Setup(c => c.IsAdmin).Returns(true);
        current.Setup(c => c.IsAuthenticated).Returns(true);

        var audit = new Mock<IAuditService>();
        object? capturedNewValues = null;
        audit.Setup(a => a.LogAsync(
                "PULSE_FINAL_DECIDED",
                "course_final_submissions",
                submitted.SubmissionId,
                null,
                It.IsAny<object?>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()))
            .Callback<string, string, Guid?, object?, object?, string?, CancellationToken>((_, _, _, _, nv, _, _) => capturedNewValues = nv)
            .Returns(Task.CompletedTask);

        var scope = new PulseReviewScope(world.Context, new EmployeeScope(world.Context, current.Object), current.Object);
        var policy = new PulseRetryPolicyProvider(world.Context, NullLogger<PulseRetryPolicyProvider>.Instance);
        var decide = new DecidePulseFinalUseCase(world.Context, scope, policy, audit.Object, world.Clock);

        await decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = submitted.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.NotYet,
            Reason = validInput.Reason,
            CriterionEvaluations = validInput.CriterionEvaluations,
        });

        capturedNewValues.Should().NotBeNull();
        var serialized = System.Text.Json.JsonSerializer.Serialize(
            capturedNewValues,
            new System.Text.Json.JsonSerializerOptions
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            });
        serialized.Should().Contain("CriterionEvaluations");
        serialized.Should().Contain("FAIL");
        serialized.Should().Contain("Chưa có phép tính đối chiếu.");
        serialized.Should().Contain("EssayScorePercent");
    }

    [Fact]
    public void PulseEssayRubric_BuildsDomainAndTierWeightedCriteria_AndPreservesCustomCriteria()
    {
        var d1Tier3 = PulseEssayRubric.Build(1, "Khai thác dữ liệu và thông tin", 3, PlatformCatalog.DefaultFinalCriteria, "M1-A");
        d1Tier3.Should().HaveCount(4);
        d1Tier3.Sum(c => c.WeightPercent).Should().Be(100);
        d1Tier3.Where(c => c.IsRequired).Should().ContainSingle(c => c.Number == "04" && c.WeightPercent == 40);
        d1Tier3[3].Title.Should().Contain("Độ tin cậy nguồn");
        d1Tier3[0].Description.Should().Contain("liên bộ phận");

        var d4Tier1 = PulseEssayRubric.Build(4, "An toàn", 1, null, "A4-F");
        d4Tier1.Should().HaveCount(4);
        d4Tier1[3].IsRequired.Should().BeTrue();
        d4Tier1[3].Title.Should().Contain("An toàn thiết bị");

        var custom = PulseEssayRubric.Build(1, "Khai thác dữ liệu", 2, new[] { "Số liệu chính xác", "Bước làm rõ ràng" }, "CUSTOM-01");
        custom.Should().HaveCount(2);
        custom.Sum(c => c.WeightPercent).Should().Be(100);
        custom.Should().OnlyContain(c => !c.IsRequired && c.WeightPercent == 50);
    }

    [Fact]
    public void PulseEssayRubric_RejectsCopiedPrompt_AndAllowsGenuineWorkEssay()
    {
        const string promptCopyText =
            "Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: "
            + "nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.";

        var copyCheck = PulseEssayRubric.AnalyzePromptCopy(
            promptCopyText,
            "<p>Mô tả một nhiệm vụ thực tế trong vị trí của bạn có dùng năng lực khai thác dữ liệu và thông tin ở mức nâng cao.</p>");
        copyCheck.IsPromptCopy.Should().BeTrue();

        var rubric = PulseEssayRubric.Build(1, "Khai thác dữ liệu và thông tin", 3, null, "M1-A");
        var hint = PulseRules.AiHint(promptCopyText, null, rubric, 1, 3);
        hint.Checks.Should().Equal(false, false, false, false);
        hint.Summary.Should().Contain("lặp lại câu chữ của đề bài");

        const string genuineEssay =
            "Từ báo cáo doanh thu Q3 xuất ra từ hệ thống CRM công ty, tôi dùng Excel đối chiếu 420 mã đơn hàng với sổ cái kế toán, "
            + "lọc 5 dòng trùng lặp bằng COUNTIF, phân quyền chỉ đọc cho nhóm kinh doanh để tránh sửa nhầm công thức và bàn giao báo cáo chốt số tuần tới.";
        PulseEssayRubric.AnalyzePromptCopy(genuineEssay, null).IsPromptCopy.Should().BeFalse();
        var goodHint = PulseRules.AiHint(genuineEssay, null, rubric, 1, 3);
        goodHint.Checks.Should().Equal(true, true, true, true);
    }

    [Fact]
    public async Task SubmitPulseFinal_RejectsPromptCopy_AndDecidePulseFinal_BlocksPassOnFailedGate()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var overview = await employee.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput());
        var targetCode = overview.Courses.First(c => c.CanStartFinal || c.Zone == PulseCourseZone.Path).Code;
        var course = await world.OpenForLearningAsync(employee, targetCode);
        await world.PassAllModulesAsync(employee, course.CourseId);

        const string copiedPrompt =
            "Mô tả một nhiệm vụ thực tế của vị trí Kế toán thuộc lĩnh vực khai thác dữ liệu và thông tin: "
            + "nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.";

        var submitCopied = () => employee.SubmitFinal.ExecuteAsync(new SubmitPulseFinalUseCaseInput
        {
            CourseId = course.CourseId,
            EvidenceText = copiedPrompt,
            ProctoringSessionId = Guid.NewGuid(),
        });
        (await submitCopied.Should().ThrowAsync<DigiTalent.Application.Common.Exceptions.BadRequestException>())
            .Which.Errors.Single().Code.Should().Be("EVIDENCE_COPIES_PROMPT");
        world.Context.ChangeTracker.Clear();

        var submitted = await world.SubmitFinalAsync(employee, course.CourseId);
        var manager = await world.AsAsync(PulseTestWorld.OwnerEmail, Roles.Owner);
        var gateFailPass = () => manager.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = submitted.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Thử công nhận khi tiêu chí Gate chưa đạt.",
            CriterionEvaluations = new List<PulseCriterionEvaluationInput>
            {
                new() { Number = "01", Title = "Nguồn", Status = "PASS", WeightPercent = 20, IsRequired = false },
                new() { Number = "02", Title = "Quy trình", Status = "PASS", WeightPercent = 20, IsRequired = false },
                new() { Number = "03", Title = "Kết luận", Status = "PASS", WeightPercent = 20, IsRequired = false },
                new() { Number = "04", Title = "Độ tin cậy nguồn & phân quyền", Status = "FAIL", WeightPercent = 40, IsRequired = true },
            },
        });
        (await gateFailPass.Should().ThrowAsync<DigiTalent.Application.Common.Exceptions.BadRequestException>())
            .Which.Errors.Single().Code.Should().Be("RUBRIC_GATE_FAILED");
    }

    [Fact]
    public async Task GeminiService_PromptCarriesDomainTierWeights_AndOverridesFalsePositivesOnCopiedPrompt()
    {
        var rubric = PulseEssayRubric.Build(1, "Khai thác dữ liệu và thông tin", 3, null, "M1-A");
        var prompt = GeminiService.EvidencePrompt(
            "Bài làm mẫu",
            "<p>Đề bài</p>",
            rubric.Select(r => r.Title).ToList(),
            null,
            null,
            "Khai thác dữ liệu và thông tin",
            3,
            rubric);
        prompt.Should().Contain("LĨNH VỰC NĂNG LỰC (TT02): Khai thác dữ liệu và thông tin");
        prompt.Should().Contain("CẤP ĐỘ KHÓA HỌC: Nâng cao");
        prompt.Should().Contain("TIÊU CHÍ BẮT BUỘC (GATE)");
        prompt.Should().Contain("Trọng số 40%");

        var generousJson = """
            {"checks":[true,true,true,true],"criterion_notes":["OK","OK","OK","OK"],"summary":"Đạt hết.","detail":{"plagiarism_score":5,"ai_generated_score":5,"relevance_score":90,"depth_score":80,"clarity_score":85,"verdict":"Đạt."}}
            """;
        var geminiBody = System.Text.Json.JsonSerializer.Serialize(new
        {
            candidates = new[] { new { content = new { parts = new[] { new { text = generousJson } } } } },
        });
        var handler = new RecordingHttpHandler((HttpStatusCode.OK, geminiBody));
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Gemini:ApiKey"] = "unit-key" })
            .Build();
        var service = new GeminiService(new HttpClient(handler), config, NullLogger<GeminiService>.Instance);

        var evaluated = await service.EvaluateEvidenceAsync(
            "Mô tả một nhiệm vụ thực tế của vị trí Sales / CRM thuộc lĩnh vực khai thác dữ liệu và thông tin: nêu nguồn, hành động hoặc phép tính người khác kiểm tra lại được, kết luận và bước tiếp theo.",
            "<p>Đề bài chuẩn</p>",
            rubric.Select(r => r.Title).ToList(),
            null,
            null,
            "Khai thác dữ liệu và thông tin",
            3,
            rubric);
        evaluated.Checks.Should().Equal(false, false, false, false);
        evaluated.Detail!.PlagiarismScore.Should().BeGreaterThanOrEqualTo(90);
        evaluated.Detail.RelevanceScore.Should().BeLessThanOrEqualTo(20);
    }

    private sealed class RecordingHttpHandler(params (HttpStatusCode Status, string Body)[] responses) : HttpMessageHandler
    {
        private readonly Queue<(HttpStatusCode Status, string Body)> _queue = new(responses);
        public List<string> RequestedPaths { get; } = new();

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestedPaths.Add(request.RequestUri!.AbsolutePath);
            var (status, body) = _queue.Count > 0 ? _queue.Dequeue() : (HttpStatusCode.OK, "{}");
            return Task.FromResult(new HttpResponseMessage(status)
            {
                Content = new StringContent(body, Encoding.UTF8, "application/json"),
            });
        }
    }

    private sealed class CountingGeminiService(string source) : IGeminiService
    {
        public int CallCount { get; private set; }
        public bool IsConfigured => source == "GEMINI";

        public Task<PulseAiHintDto> EvaluateEvidenceAsync(
            string evidenceText,
            string finalPrompt,
            IReadOnlyList<string> criteria,
            IReadOnlyList<ProctoringEventInfo>? proctoringEvents = null,
            string? courseContent = null,
            string? domainName = null,
            int? tier = null,
            IReadOnlyList<PulseCriterionDto>? rubric = null,
            CancellationToken cancellationToken = default)
        {
            CallCount++;
            return Task.FromResult(new PulseAiHintDto(criteria.Select(_ => true).ToList(), $"Eval #{CallCount}")
            {
                Source = source,
                Model = source == "GEMINI" ? "gemini-2.5-flash" : null,
                CriterionNotes = criteria.Select(c => $"Ghi chú cho {c}").ToList(),
            });
        }

        public Task<Application.UseCases.TrialProgram.TrialEssayAiReviewDto?> EvaluateTrialEssaysAsync(
            IReadOnlyList<Application.UseCases.TrialProgram.TrialEssayAiInput> essays,
            CancellationToken cancellationToken = default) => Task.FromResult<Application.UseCases.TrialProgram.TrialEssayAiReviewDto?>(null);
    }
}
