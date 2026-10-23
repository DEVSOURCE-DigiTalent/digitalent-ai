using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Assistant;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace DigiTalent.Tests.Assistant;

public class GeminiAssistantChatModelTests
{
    private static readonly AssistantToolDefinition SearchTool = new(
        "search_database",
        "Search.",
        JsonSerializer.SerializeToElement(new
        {
            type = "object",
            properties = new { entity = new { type = "string", @enum = new[] { "courses" } } },
            required = new[] { "entity" },
            additionalProperties = false,
        }));

    [Fact]
    public async Task ToolLoop_RunsToolEchoesModelTurnAndReturnsFinalText()
    {
        var handler = new QueueHandler(
            """
            {"candidates":[{"finishReason":"STOP","content":{"role":"model","parts":[
              {"functionCall":{"id":"call-1","name":"search_database","args":{"entity":"courses"}},"thoughtSignature":"sig-1"}]}}]}
            """,
            """
            {"candidates":[{"finishReason":"STOP","content":{"role":"model","parts":[
              {"text":"thinking","thought":true},{"text":"Có 2 khóa học."}]}}]}
            """);
        var model = CreateModel(handler);
        JsonElement? receivedArgs = null;

        var reply = await model.CompleteAsync(new AssistantModelRequest(
            "system",
            [new AssistantChatTurn("user", "Có bao nhiêu khóa học?")],
            [SearchTool],
            (name, args) =>
            {
                receivedArgs = args;
                return Task.FromResult(new AssistantToolOutcome("""{"totalMatches":2}""", false, "courses"));
            }));

        reply.Text.Should().Be("Có 2 khóa học.");
        reply.ToolCalls.Should().ContainSingle().Which.Should().Be(new AssistantToolCall("search_database", true, "courses"));
        receivedArgs!.Value.GetProperty("entity").GetString().Should().Be("courses");

        handler.ApiKeys.Should().AllBe("test-key");
        var first = handler.Bodies[0];
        first["systemInstruction"]!["parts"]![0]!["text"]!.GetValue<string>().Should().Be("system");
        first["tools"]![0]!["functionDeclarations"]![0]!["parametersJsonSchema"]!["required"]![0]!.GetValue<string>().Should().Be("entity");
        first["toolConfig"]!["functionCallingConfig"]!["mode"]!.GetValue<string>().Should().Be("AUTO");

        var contents = handler.Bodies[1]["contents"]!.AsArray();
        contents.Should().HaveCount(3);
        contents[1]!["role"]!.GetValue<string>().Should().Be("model");
        contents[1]!["parts"]![0]!["thoughtSignature"]!.GetValue<string>().Should().Be("sig-1");
        var response = contents[2]!["parts"]![0]!["functionResponse"]!;
        response["id"]!.GetValue<string>().Should().Be("call-1");
        response["response"]!["result"]!["totalMatches"]!.GetValue<int>().Should().Be(2);
    }

    [Fact]
    public async Task LastRound_DisablesFunctionCalling()
    {
        var call = """
            {"candidates":[{"content":{"role":"model","parts":[{"functionCall":{"name":"search_database","args":{"entity":"courses"}}}]}}]}
            """;
        var handler = new QueueHandler(call, """{"candidates":[{"finishReason":"STOP","content":{"parts":[{"text":"Xong."}]}}]}""");
        var model = CreateModel(handler, maxToolRounds: 1);

        var reply = await model.CompleteAsync(Request());

        reply.Text.Should().Be("Xong.");
        handler.Bodies[1]["toolConfig"]!["functionCallingConfig"]!["mode"]!.GetValue<string>().Should().Be("NONE");
    }

    [Fact]
    public async Task SafetyBlock_ReturnsRefusalMessage()
    {
        var model = CreateModel(new QueueHandler("""{"candidates":[{"finishReason":"SAFETY"}]}"""));

        var reply = await model.CompleteAsync(Request());

        reply.Text.Should().Be("Xin lỗi, tôi không thể hỗ trợ yêu cầu này.");
    }

    [Theory]
    [InlineData(HttpStatusCode.TooManyRequests, "{}", "ASSISTANT_BUSY")]
    [InlineData(HttpStatusCode.BadRequest, """{"error":{"details":[{"reason":"API_KEY_INVALID"}]}}""", "ASSISTANT_NOT_CONFIGURED")]
    [InlineData(HttpStatusCode.ServiceUnavailable, "{}", "ASSISTANT_UNAVAILABLE")]
    [InlineData(HttpStatusCode.NotFound, "{}", "ASSISTANT_ERROR")]
    public async Task HttpErrors_MapToAssistantCodes(HttpStatusCode status, string body, string code)
    {
        var model = CreateModel(new QueueHandler((status, body)));

        var act = () => model.CompleteAsync(Request());

        (await act.Should().ThrowAsync<BadRequestException>()).Which.Errors.Should().ContainSingle()
            .Which.Should().Be(new BadRequestError("assistant", code));
    }

    [Fact]
    public async Task OverloadedModel_FallsBackOnFirstRound()
    {
        var handler = new QueueHandler(
            (HttpStatusCode.ServiceUnavailable, "{}"),
            (HttpStatusCode.OK, """{"candidates":[{"finishReason":"STOP","content":{"parts":[{"text":"Chào bạn."}]}}]}"""));
        var model = CreateModel(handler, fallbackModels: ["backup-model"]);

        var reply = await model.CompleteAsync(Request());

        reply.Text.Should().Be("Chào bạn.");
        handler.Paths.Should().Equal("/v1beta/models/primary-model:generateContent", "/v1beta/models/backup-model:generateContent");
    }

    [Fact]
    public async Task OverloadedModel_AfterToolCall_DoesNotSwitchModel()
    {
        var call = """
            {"candidates":[{"content":{"role":"model","parts":[{"functionCall":{"name":"search_database","args":{"entity":"courses"}},"thoughtSignature":"sig"}]}}]}
            """;
        var handler = new QueueHandler((HttpStatusCode.OK, call), (HttpStatusCode.ServiceUnavailable, "{}"));
        var model = CreateModel(handler, fallbackModels: ["backup-model"]);

        var act = () => model.CompleteAsync(Request());

        (await act.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("ASSISTANT_UNAVAILABLE");
        handler.Paths.Should().AllBe("/v1beta/models/primary-model:generateContent");
    }

    [Fact]
    public async Task EmptyReplyAfterMalformedCall_AsksToRetry()
    {
        var model = CreateModel(new QueueHandler("""{"candidates":[{"finishReason":"MALFORMED_FUNCTION_CALL","content":{"parts":[]}}]}"""));

        var reply = await model.CompleteAsync(Request());

        reply.Text.Should().StartWith("Xin lỗi, tôi chưa trả lời được câu này.");
    }

    [Fact]
    public void MissingKey_IsNotConfigured()
    {
        var settings = new AssistantSettings { Provider = "Gemini", ApiKey = null };
        var previous = (Environment.GetEnvironmentVariable("GEMINI_API_KEY"), Environment.GetEnvironmentVariable("GOOGLE_API_KEY"));
        Environment.SetEnvironmentVariable("GEMINI_API_KEY", null);
        Environment.SetEnvironmentVariable("GOOGLE_API_KEY", null);
        try
        {
            new GeminiAssistantChatModel(new HttpClient(), settings, NullLogger<GeminiAssistantChatModel>.Instance)
                .IsConfigured.Should().BeFalse();
        }
        finally
        {
            Environment.SetEnvironmentVariable("GEMINI_API_KEY", previous.Item1);
            Environment.SetEnvironmentVariable("GOOGLE_API_KEY", previous.Item2);
        }
    }

    private static AssistantModelRequest Request() => new(
        "system",
        [new AssistantChatTurn("user", "Xin chào")],
        [SearchTool],
        (_, _) => Task.FromResult(new AssistantToolOutcome("{}", false)));

    private static GeminiAssistantChatModel CreateModel(
        QueueHandler handler, int maxToolRounds = 8, List<string>? fallbackModels = null) => new(
        new HttpClient(handler),
        new AssistantSettings
        {
            Provider = "Gemini",
            ApiKey = "test-key",
            Model = "primary-model",
            FallbackModels = fallbackModels ?? [],
            MaxToolRounds = maxToolRounds,
        },
        NullLogger<GeminiAssistantChatModel>.Instance);

    private sealed class QueueHandler : HttpMessageHandler
    {
        private readonly Queue<(HttpStatusCode Status, string Body)> _responses;

        public QueueHandler(params string[] okBodies)
            : this(okBodies.Select(b => (HttpStatusCode.OK, b)).ToArray())
        {
        }

        public QueueHandler(params (HttpStatusCode Status, string Body)[] responses) => _responses = new(responses);

        public List<JsonNode> Bodies { get; } = [];

        public List<string> ApiKeys { get; } = [];

        public List<string> Paths { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Paths.Add(request.RequestUri!.AbsolutePath);
            Bodies.Add(JsonNode.Parse(await request.Content!.ReadAsStringAsync(cancellationToken))!);
            ApiKeys.Add(request.Headers.GetValues("x-goog-api-key").Single());
            var (status, body) = _responses.Count > 0 ? _responses.Dequeue() : (HttpStatusCode.OK, "{}");
            return new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
        }
    }
}
