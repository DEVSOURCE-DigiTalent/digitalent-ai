using System.Text.Json;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Assistant;
using DigiTalent.Application.UseCases.Assistant.Chat;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Tests.Intelligence;
using DigiTalent.Tests.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Assistant;

/// <summary>
/// Tool chỉ đọc của chatbot: luôn trong tổ chức + phạm vi nhân viên của người hỏi, đúng quyền đọc, đầu vào sai bị từ chối.
/// </summary>
[Collection("PostgresIntegration")]
public class AssistantToolboxTests
{
    private static async Task<SkillGapTestWorld> CreateWorldAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        return await SkillGapTestWorld.CreateAsync(context);
    }

    private static AssistantToolbox Toolbox(SkillGapTestWorld world, ICurrentUser user, params string[] granted)
    {
        var permissions = new Mock<IPermissionService>();
        permissions
            .Setup(p => p.HasAnyAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyCollection<string> _, IReadOnlyCollection<string> wanted) => wanted.Any(granted.Contains));
        var reader = new AssistantDataReader(world.Context, user, world.Scope(user), permissions.Object, TimeProvider.System);
        return new AssistantToolbox(reader);
    }

    private static JsonElement Json(object value) => JsonSerializer.SerializeToElement(value);

    private static JsonElement Parse(AssistantToolOutcome outcome) => JsonDocument.Parse(outcome.Content).RootElement;

    private static IEnumerable<string> Names(JsonElement result) =>
        result.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("fullName").GetString()!);

    [Fact]
    public async Task Search_ManagerSeesOnlyOwnDepartment()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.ManagerOf(world.DepartmentA), Permissions.Employee.Read);

        var outcome = await toolbox.ExecuteAsync("search_database", Json(new { entity = "employees" }));

        outcome.IsError.Should().BeFalse();
        Names(Parse(outcome)).Should().BeEquivalentTo(world.Analyst.FullName, world.Unassigned.FullName, world.Inactive.FullName)
            .And.NotContain(world.AnalystInDepartmentB.FullName);
        outcome.Source.Should().Be("employees");
    }

    [Fact]
    public async Task Search_WithoutReadPermission_IsForbidden()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.EmployeeSelf(world.Analyst), Permissions.Learning.ReadProgress);

        var outcome = await toolbox.ExecuteAsync("search_database", Json(new { entity = "employees" }));

        outcome.IsError.Should().BeTrue();
        Parse(outcome).GetProperty("error").GetString().Should().Be("FORBIDDEN");
    }

    [Fact]
    public async Task GetRecord_OutsideScope_IsNotFound()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.ManagerOf(world.DepartmentA), Permissions.Employee.Read);

        var outcome = await toolbox.ExecuteAsync("get_record",
            Json(new { entity = "employees", id = world.AnalystInDepartmentB.Id.ToString() }));

        outcome.IsError.Should().BeTrue();
        Parse(outcome).GetProperty("error").GetString().Should().Be("NOT_FOUND");
    }

    [Fact]
    public async Task GetRecord_EmployeeDetail_OmitsSectionsWithoutPermission()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.HrManager(), Permissions.Employee.Read);

        var outcome = await toolbox.ExecuteAsync("get_record",
            Json(new { entity = "employees", id = world.Analyst.Id.ToString() }));

        outcome.IsError.Should().BeFalse();
        var record = Parse(outcome).GetProperty("record");
        record.GetProperty("fullName").GetString().Should().Be(world.Analyst.FullName);
        record.GetProperty("department").GetString().Should().Be(world.DepartmentA.Name);
        record.GetProperty("learning").ValueKind.Should().Be(JsonValueKind.Null, "learning_progress.read was not granted");
        outcome.Content.Should().NotContain("phone", "contact details are never returned");
    }

    [Fact]
    public async Task Analytics_HeadcountStaysInScope()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.ManagerOf(world.DepartmentB), Permissions.Employee.Read);

        var outcome = await toolbox.ExecuteAsync("get_analytics", Json(new { metric = "headcount_by_department" }));

        outcome.IsError.Should().BeFalse();
        var rows = Parse(outcome).GetProperty("rows").EnumerateArray().ToList();
        rows.Should().ContainSingle();
        rows[0].GetProperty("department").GetString().Should().Be(world.DepartmentB.Name);
        rows[0].GetProperty("total").GetInt32().Should().Be(2, "department B has the clerk and analyst B");
    }

    [Theory]
    [InlineData("search_database", "{\"entity\":\"users\"}")]
    [InlineData("search_database", "{\"entity\":\"employees\",\"filters\":{\"department_id\":\"1; DROP TABLE users\"}}")]
    [InlineData("get_record", "{\"entity\":\"employees\"}")]
    [InlineData("get_analytics", "{\"metric\":\"salaries\"}")]
    [InlineData("run_sql", "{}")]
    public async Task InvalidInput_IsRejected(string tool, string input)
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.HrManager(), Permissions.Employee.Read);

        var outcome = await toolbox.ExecuteAsync(tool, JsonDocument.Parse(input).RootElement);

        outcome.IsError.Should().BeTrue();
        Parse(outcome).GetProperty("error").GetString().Should().Be("INVALID_INPUT");
    }

    [Fact]
    public async Task CurrentUser_ListsOnlyGrantedEntities()
    {
        var world = await CreateWorldAsync();
        var toolbox = Toolbox(world, world.EmployeeSelf(world.Analyst), Permissions.Learning.ReadProgress, Permissions.Certificate.Read);

        var outcome = await toolbox.ExecuteAsync("get_current_user", Json(new { }));

        var result = Parse(outcome);
        result.GetProperty("readableEntities").EnumerateArray().Select(e => e.GetString())
            .Should().BeEquivalentTo("enrollments", "certificates");
        result.GetProperty("employee").GetProperty("fullName").GetString().Should().Be(world.Analyst.FullName);
        result.GetProperty("employeeScope").GetString().Should().StartWith("SELF");
    }

    [Fact]
    public async Task ChatUseCase_ReturnsReplyAndSourcesOfSuccessfulTools()
    {
        var world = await CreateWorldAsync();
        var user = world.HrManager();
        var toolbox = Toolbox(world, user, Permissions.Employee.Read);
        var model = new ScriptedModel(
            ("search_database", Json(new { entity = "employees" })),
            ("search_database", Json(new { entity = "certificates" })));

        var output = await new ChatWithAssistantUseCase(model, toolbox, user).ExecuteAsync(new ChatWithAssistantUseCaseInput
        {
            Messages = { new ChatWithAssistantMessage { Role = "user", Content = "Có bao nhiêu nhân viên?" } },
        });

        output.Reply.Should().Be("ok");
        output.Sources.Should().Equal("employees");
        output.ToolCalls.Select(c => c.Succeeded).Should().Equal(true, false);
        model.Request!.Turns.Should().ContainSingle(t => t.Role == "user");
    }

    [Theory]
    [InlineData("assistant")]
    [InlineData("system")]
    public void Validator_RequiresAlternatingTurnsEndingWithUser(string lastRole)
    {
        var validator = new ChatWithAssistantUseCaseValidator();
        var input = new ChatWithAssistantUseCaseInput
        {
            Messages =
            {
                new ChatWithAssistantMessage { Role = "user", Content = "a" },
                new ChatWithAssistantMessage { Role = lastRole, Content = "b" },
            },
        };

        validator.Validate(input).IsValid.Should().BeFalse();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Postgres_EveryEntityAndMetricTranslatesToSql()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);
        var world = await SkillGapTestWorld.CreateAsync(context);
        var all = AssistantDataReader.EntityPermissions.Values.Concat(AssistantDataReader.MetricPermissions.Values).Distinct().ToArray();
        var toolbox = Toolbox(world, world.HrManager(), all);

        foreach (var entity in AssistantDataReader.EntityPermissions.Keys)
        {
            var search = await toolbox.ExecuteAsync("search_database",
                Json(new { entity, query = "a", filters = new { department_id = world.DepartmentA.Id.ToString() } }));
            search.IsError.Should().BeFalse($"search {entity}: {search.Content}");

            var id = entity is "competency_profiles" or "employees" ? world.Analyst.Id
                : entity == "departments" ? world.DepartmentA.Id
                : entity == "job_positions" ? world.DataAnalyst.Id
                : entity == "competencies" ? world.Competencies["DATA_LITERACY"].Id
                : Guid.NewGuid();
            var record = await toolbox.ExecuteAsync("get_record", Json(new { entity, id = id.ToString() }));
            var error = record.IsError ? Parse(record).GetProperty("error").GetString() : null;
            error.Should().BeOneOf(new string?[] { null, "NOT_FOUND" }, $"get_record {entity}: {record.Content}");
        }

        foreach (var metric in AssistantDataReader.MetricPermissions.Keys)
        {
            var outcome = await toolbox.ExecuteAsync("get_analytics", Json(new { metric }));
            outcome.IsError.Should().BeFalse($"metric {metric}: {outcome.Content}");
        }

        var profiles = await toolbox.ExecuteAsync("get_record",
            Json(new { entity = "competency_profiles", id = world.Analyst.Id.ToString() }));
        Parse(profiles).GetProperty("record").GetProperty("competencies").GetArrayLength().Should().BeGreaterThan(0);
    }

    /// <summary>Mô hình giả: gọi lần lượt các tool đã định rồi trả "ok".</summary>
    private sealed class ScriptedModel : IAssistantChatModel
    {
        private readonly (string Name, JsonElement Input)[] _calls;

        public ScriptedModel(params (string, JsonElement)[] calls) => _calls = calls;

        public AssistantModelRequest? Request { get; private set; }

        public bool IsConfigured => true;

        public async Task<AssistantModelReply> CompleteAsync(AssistantModelRequest request, CancellationToken cancellationToken = default)
        {
            Request = request;
            var calls = new List<AssistantToolCall>();
            foreach (var (name, input) in _calls)
            {
                var outcome = await request.ExecuteToolAsync(name, input);
                calls.Add(new AssistantToolCall(name, !outcome.IsError, outcome.Source));
            }

            return new AssistantModelReply("ok", calls);
        }
    }
}
