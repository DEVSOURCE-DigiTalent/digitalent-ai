using System.Text.Encodings.Web;
using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;

namespace DigiTalent.Application.UseCases.Assistant;

/// <summary>
/// Bốn tool chỉ đọc của chatbot: get_current_user, search_database, get_record, get_analytics.
/// Đầu vào do mô hình sinh nên được kiểm tra lại ở đây (danh sách trắng, Guid hợp lệ, giới hạn số dòng);
/// không có SQL tự do — mỗi loại bản ghi là một truy vấn LINQ cố định trong <see cref="AssistantDataReader"/>.
/// </summary>
public sealed class AssistantToolbox
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping, // giữ tiếng Việt dễ đọc, ít token hơn
    };

    private readonly AssistantDataReader _reader;

    public AssistantToolbox(AssistantDataReader reader)
    {
        _reader = reader;
    }

    public static IReadOnlyList<AssistantToolDefinition> Definitions { get; } = BuildDefinitions();

    public async Task<AssistantToolOutcome> ExecuteAsync(string name, JsonElement input)
    {
        try
        {
            var (result, source) = name switch
            {
                // Ngữ cảnh người hỏi, không phải nguồn dữ liệu của câu trả lời: không báo về giao diện.
                "get_current_user" => ((object)await _reader.GetCurrentUserAsync(), (string?)null),
                "search_database" => await SearchAsync(input),
                "get_record" => await GetRecordAsync(input),
                "get_analytics" => await GetAnalyticsAsync(input),
                _ => throw new AssistantToolException("INVALID_INPUT", $"Unknown tool '{name}'."),
            };
            return new AssistantToolOutcome(JsonSerializer.Serialize(result, JsonOptions), false, source);
        }
        catch (AssistantToolException ex)
        {
            return Error(ex.Code, ex.Message);
        }
        catch (ForbiddenException)
        {
            return Error("FORBIDDEN", "The current user is not allowed to read this data.");
        }
        catch (NotFoundException)
        {
            // Ngoài phạm vi cũng trả NOT_FOUND (như EmployeeScope) để không lộ sự tồn tại của bản ghi.
            return Error("NOT_FOUND", "No matching record in the caller's scope.");
        }
    }

    private async Task<(object, string?)> SearchAsync(JsonElement input)
    {
        var entity = RequiredString(input, "entity");
        var query = OptionalString(input, "query");
        var limit = input.TryGetProperty("limit", out var l) && l.ValueKind == JsonValueKind.Number && l.TryGetInt32(out var n)
            ? n
            : 20;
        var filters = ReadFilters(input);
        return (await _reader.SearchAsync(entity, query, filters, limit), entity);
    }

    private async Task<(object, string?)> GetRecordAsync(JsonElement input)
    {
        var entity = RequiredString(input, "entity");
        var id = ParseGuid(RequiredString(input, "id"), "id")
            ?? throw new AssistantToolException("INVALID_INPUT", "'id' is required.");
        return (await _reader.GetRecordAsync(entity, id), entity);
    }

    private async Task<(object, string?)> GetAnalyticsAsync(JsonElement input)
    {
        var metric = RequiredString(input, "metric");
        return (await _reader.GetAnalyticsAsync(metric, ReadFilters(input)), $"analytics:{metric}");
    }

    private static AssistantFilters ReadFilters(JsonElement input)
    {
        if (!input.TryGetProperty("filters", out var f) || f.ValueKind != JsonValueKind.Object)
        {
            return new AssistantFilters();
        }

        var status = OptionalString(f, "status");
        return new AssistantFilters(
            Status: status?.Trim().ToUpperInvariant(),
            DepartmentId: ParseGuid(OptionalString(f, "department_id"), "filters.department_id"),
            EmployeeId: ParseGuid(OptionalString(f, "employee_id"), "filters.employee_id"),
            CourseId: ParseGuid(OptionalString(f, "course_id"), "filters.course_id"));
    }

    private static string RequiredString(JsonElement input, string property) =>
        OptionalString(input, property) is { Length: > 0 } value
            ? value
            : throw new AssistantToolException("INVALID_INPUT", $"'{property}' is required.");

    private static string? OptionalString(JsonElement input, string property) =>
        input.ValueKind == JsonValueKind.Object
        && input.TryGetProperty(property, out var value)
        && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static Guid? ParseGuid(string? value, string field)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return Guid.TryParse(value, out var id)
            ? id
            : throw new AssistantToolException("INVALID_INPUT", $"'{field}' must be a UUID taken from an earlier tool result.");
    }

    private static AssistantToolOutcome Error(string code, string message) =>
        new(JsonSerializer.Serialize(new { error = code, message }, JsonOptions), true);

    private static IReadOnlyList<AssistantToolDefinition> BuildDefinitions()
    {
        var entities = AssistantDataReader.EntityPermissions.Keys.ToArray();
        var metrics = AssistantDataReader.MetricPermissions.Keys.ToArray();

        var filters = new
        {
            type = "object",
            description = "Optional filters. IDs are UUIDs copied from earlier tool results.",
            properties = new
            {
                status = new { type = "string", description = "Status code, e.g. ACTIVE, IN_PROGRESS, COMPLETED, VALID, EXPIRED, ASSIGNED, SUBMITTED, PASSED." },
                department_id = new { type = "string" },
                employee_id = new { type = "string" },
                course_id = new { type = "string" },
            },
            additionalProperties = false,
        };

        return new[]
        {
            Define(
                "get_current_user",
                "Returns who is asking: display name, roles, organization, own employee profile (department, position), "
                + "the employee scope they may see (ORGANIZATION / DEPARTMENT / SELF), and which entities and metrics they are allowed to read. "
                + "Call this first in a conversation, and whenever the question says 'tôi', 'của tôi', 'phòng tôi'.",
                new { type = "object", properties = new { }, additionalProperties = false }),

            Define(
                "search_database",
                "Searches one type of record in the caller's organization, already limited to the caller's scope. "
                + "entity: employees (staff), departments, job_positions, courses, enrollments (who learns which course, status, progress), "
                + "certificates, tasks (practical work assignments), competencies (the competency framework), competency_profiles "
                + "(confirmed level per employee × competency). query is a free-text keyword matched against names, titles and codes. "
                + "Returns totalMatches, the first `limit` items and truncated=true when more exist.",
                new
                {
                    type = "object",
                    properties = new
                    {
                        entity = new { type = "string", @enum = entities },
                        query = new { type = "string", description = "Keyword (name, title or code). Omit to list everything." },
                        filters,
                        limit = new { type = "integer", minimum = 1, maximum = AssistantDataReader.MaxLimit, description = "Default 20." },
                    },
                    required = new[] { "entity" },
                    additionalProperties = false,
                }),

            Define(
                "get_record",
                "Returns the details of one record by its UUID. For employees it adds learning, certificate and task summaries; "
                + "for courses it adds enrollments by status; for competency_profiles pass the EMPLOYEE id to get all of that employee's competency levels.",
                new
                {
                    type = "object",
                    properties = new
                    {
                        entity = new { type = "string", @enum = entities },
                        id = new { type = "string", description = "UUID from an earlier tool result." },
                    },
                    required = new[] { "entity", "id" },
                    additionalProperties = false,
                }),

            Define(
                "get_analytics",
                "Aggregated statistics over the employees in the caller's scope (optionally one department). "
                + "headcount_by_department: total/active staff per department. learning_progress: enrollments per status with average progress "
                + "(filters.course_id narrows to one course). course_completion: enrolled/completed/in progress per course. "
                + "certificate_status: certificates per status. task_status: task assignments per status. "
                + "competency_levels: average/min/max confirmed level per competency.",
                new
                {
                    type = "object",
                    properties = new
                    {
                        metric = new { type = "string", @enum = metrics },
                        filters,
                    },
                    required = new[] { "metric" },
                    additionalProperties = false,
                }),
        };
    }

    private static AssistantToolDefinition Define(string name, string description, object schema) =>
        new(name, description, JsonSerializer.SerializeToElement(schema, JsonOptions));
}
