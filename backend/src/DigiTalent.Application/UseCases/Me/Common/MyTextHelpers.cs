using System.Text.Json;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>Nhãn cấp độ năng lực (SMALLINT 1..3 theo schema v2.3) hiển thị cho nhân viên.</summary>
public static class MyLevelLabels
{
    public static string For(short? level) => level switch
    {
        1 => "Cơ bản",
        2 => "Trung cấp",
        3 => "Nâng cao",
        null or 0 => "Chưa xác nhận",
        _ => $"Mức {level}",
    };
}

/// <summary>1 tiêu chí chấm của nhiệm vụ thực tế.</summary>
public class RubricCriterionDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal MaxPoints { get; set; }
}

/// <summary>
/// Đọc rubric lưu ở cột jsonb (practical_task_templates.general_marking_criteria, assigned_task_targets.rubric_snapshot).
/// Chấp nhận: mảng [{id,label,description,maxPoints}], object {criteria:[...]}, hoặc văn bản thường (→ 1 tiêu chí chung).
/// </summary>
public static class TaskRubricParser
{
    public static List<RubricCriterionDto> Parse(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return new List<RubricCriterionDto>();
        }

        try
        {
            using var document = JsonDocument.Parse(raw);
            var root = document.RootElement;
            if (root.ValueKind == JsonValueKind.Object && TryGet(root, "criteria", out var nested))
            {
                root = nested;
            }

            return root.ValueKind switch
            {
                JsonValueKind.Array => root.EnumerateArray()
                    .Where(e => e.ValueKind == JsonValueKind.Object)
                    .Select((e, index) => ToCriterion(e, index))
                    .Where(c => !string.IsNullOrWhiteSpace(c.Label))
                    .ToList(),
                JsonValueKind.String => FromText(root.GetString()),
                _ => new List<RubricCriterionDto>(),
            };
        }
        catch (JsonException)
        {
            return FromText(raw);
        }
    }

    private static List<RubricCriterionDto> FromText(string? text) =>
        string.IsNullOrWhiteSpace(text)
            ? new List<RubricCriterionDto>()
            : new List<RubricCriterionDto> { new() { Id = "general", Label = "Tiêu chí chung", Description = text.Trim(), MaxPoints = 100 } };

    private static RubricCriterionDto ToCriterion(JsonElement element, int index) => new()
    {
        Id = ReadString(element, "id") ?? $"rc-{index + 1}",
        Label = ReadString(element, "label") ?? ReadString(element, "name") ?? ReadString(element, "title") ?? string.Empty,
        Description = ReadString(element, "description"),
        MaxPoints = TryGet(element, "maxPoints", out var points) && points.ValueKind == JsonValueKind.Number ? points.GetDecimal()
            : TryGet(element, "maxPoints", out var text) && text.ValueKind == JsonValueKind.String && decimal.TryParse(text.GetString(), out var parsed) ? parsed
            : 0m,
    };

    private static string? ReadString(JsonElement element, string name) =>
        TryGet(element, name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;

    private static bool TryGet(JsonElement element, string name, out JsonElement value)
    {
        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }
}

/// <summary>
/// task_submissions.submission_url chỉ có 1 cột text: nhiều link được nối bằng ';' (giữ đúng quy ước
/// của SubmitTaskEvidenceUseCase để màn chấm bài của Manager vẫn đọc được).
/// </summary>
public static class SubmissionLinks
{
    public const char Separator = ';';

    public static string? Join(IEnumerable<string> links)
    {
        var cleaned = links.Select(l => l.Trim()).Where(l => l.Length > 0).ToList();
        return cleaned.Count == 0 ? null : string.Join(Separator, cleaned);
    }

    public static List<string> Split(string? stored) =>
        string.IsNullOrWhiteSpace(stored)
            ? new List<string>()
            : stored.Split(Separator, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
}
