using System.Text.Json;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Một bài tự luận gửi cho AI chấm gợi ý: cấp (1 Cơ bản … 3 Nâng cao), đề và bài làm.</summary>
public sealed record TrialEssayAiInput(int Tier, string Title, string Prompt, string Answer);

/// <summary>Điểm AI gợi ý cho một bài tự luận (thang 0–10, đạt khi ≥ <see cref="TrialProgramRules.EssayPassScore"/>).</summary>
public sealed class TrialEssayAiScoreDto
{
    public int Tier { get; set; }
    public int Score { get; set; }
    public bool Passed { get; set; }
    public string Feedback { get; set; } = string.Empty;
}

/// <summary>
/// Gợi ý chấm tự luận của AI cho một bài dùng thử — chỉ để mentor tham khảo, mentor vẫn tự cho điểm. Lưu ở
/// trial_assessments.ai_essay_review (jsonb) để không gọi lại AI mỗi lần mở bài.
/// </summary>
public sealed class TrialEssayAiReviewDto
{
    public List<TrialEssayAiScoreDto> Essays { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DateTimeOffset ReviewedAt { get; set; }

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public string ToJson() => JsonSerializer.Serialize(this, Json);

    /// <summary>Đọc gợi ý đã lưu; null khi chưa có hoặc nội dung hỏng.</summary>
    public static TrialEssayAiReviewDto? FromJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<TrialEssayAiReviewDto>(json, Json);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
