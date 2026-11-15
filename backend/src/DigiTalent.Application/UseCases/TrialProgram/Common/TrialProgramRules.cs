using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Quy tắc của luồng dùng thử doanh nghiệp (docs/specs/2026-10-27-enterprise-trial-assessment.md):
/// chủ doanh nghiệp mời nhân viên và đặt hạn làm bài → gửi yêu cầu chấm (kèm giờ mong muốn) → quản trị nền tảng phân công
/// mentor → nhân viên làm bài đánh giá tổng hợp ba cấp trong phòng thi có giám sát → mentor chấm mức từng lĩnh vực và công bố
/// bảng năng lực → nhân viên được học thử các khóa Cơ bản.
/// </summary>
public static class TrialProgramRules
{
    /// <summary>Số nhân viên tối đa của một doanh nghiệp dùng thử (không tính chủ doanh nghiệp).</summary>
    public const int MaxParticipants = 30;

    /// <summary>Số câu trắc nghiệm cho mỗi (lĩnh vực, cấp): 6 lĩnh vực × 3 cấp × 5 câu → 90 câu (15 câu mỗi lĩnh vực).</summary>
    public const int ChoicePerCell = 5;

    public const int MinEssayLength = 30;
    public const int MaxEssayLength = 6000;
    public const int MaxRequestNoteLength = 500;
    public const int MaxReviewNoteLength = 2000;

    /// <summary>Điểm tự luận: mentor cho 0–10 mỗi bài, đạt khi từ 5 điểm.</summary>
    public const int EssayMaxScore = 10;
    public const int EssayPassScore = 5;

    /// <summary>Hạn làm bài xa nhất tính từ lúc gửi yêu cầu.</summary>
    public const int MaxDeadlineDays = 60;

    public const string StageSetup = "SETUP";
    public const string StageRequested = "REQUESTED";
    public const string StageAssigned = "ASSIGNED";
    public const string StageReported = "REPORTED";

    public const string ParticipantInvited = "INVITED";
    public const string ParticipantInviteExpired = "INVITE_EXPIRED";
    public const string ParticipantActive = "ACTIVE";
    public const string ParticipantSubmitted = "SUBMITTED";
    public const string ParticipantReviewed = "REVIEWED";

    public const string NotificationRequested = "TRIAL_REVIEW_REQUESTED";
    public const string NotificationMentorAssigned = "TRIAL_MENTOR_ASSIGNED";
    public const string NotificationSubmitted = "TRIAL_ASSESSMENT_SUBMITTED";
    public const string NotificationReported = "TRIAL_REPORT_PUBLISHED";

    /// <summary>Giờ Việt Nam (UTC+7) cho nội dung email / thông báo: "17:00 ngày 30/10/2026".</summary>
    public static string FormatVietnamTime(DateTimeOffset value) =>
        value.ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm 'ngày' dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture);

    /// <summary>Bước hiện tại của doanh nghiệp dùng thử, suy ra từ các mốc đã lưu.</summary>
    public static string StageOf(TrialWorkspace trial) =>
        trial.ReportPublishedAt != null ? StageReported
        : trial.MentorUserId != null ? StageAssigned
        : trial.RequestedAt != null ? StageRequested
        : StageSetup;

    /// <summary>Đề tự luận của mỗi cấp (một bài mỗi cấp).</summary>
    public static readonly IReadOnlyList<TrialEssayPromptDto> Essays = new[]
    {
        new TrialEssayPromptDto(1, "Công việc số hằng ngày",
            "Mô tả một việc bạn làm trên máy tính hoặc điện thoại mỗi ngày: công cụ, các bước, cách bạn kiểm tra kết quả."),
        new TrialEssayPromptDto(2, "Giải quyết một vấn đề",
            "Kể một lần bạn dùng công cụ số để xử lý vấn đề của nhóm: dữ liệu lấy từ đâu, bạn làm gì, kết quả ra sao."),
        new TrialEssayPromptDto(3, "Cải tiến quy trình",
            "Đề xuất số hóa hoặc tự động hóa một quy trình của bộ phận: hiện trạng, giải pháp, rủi ro dữ liệu và cách đo hiệu quả."),
    };

    /// <summary>
    /// Ma trận đề của một ô (lĩnh vực, cấp): rút <paramref name="count"/> câu lần lượt từng mô đun theo vòng tròn, bắt đầu ở
    /// mô đun <paramref name="start"/> (chia lấy dư cho số mô đun). Mô đun k của ba khóa Cơ bản / Trung cấp / Nâng cao cùng
    /// một năng lực TT02 (x.k), nên khi cấp sau nối tiếp vòng của cấp trước (start = (cấp − 1) × <see cref="ChoicePerCell"/>)
    /// mỗi năng lực của lĩnh vực được hỏi đều nhau: 3 mô đun → 5/5/5, 4 → 4/4/4/3, 6 → 3/3/3/2/2/2 câu.
    /// Mô đun hết câu thì bỏ qua; câu bị <paramref name="accept"/> từ chối (trùng nội dung) được thay bằng câu kế tiếp của
    /// chính mô đun đó.
    /// </summary>
    public static List<T> SpreadOverModules<T>(IReadOnlyList<Queue<T>> modules, int start, int count, Func<T, bool> accept)
    {
        var picked = new List<T>();
        if (modules.Count == 0)
        {
            return picked;
        }

        var index = ((start % modules.Count) + modules.Count) % modules.Count;
        while (picked.Count < count && modules.Any(m => m.Count > 0))
        {
            var queue = modules[index];
            index = (index + 1) % modules.Count;
            while (queue.Count > 0)
            {
                var next = queue.Dequeue();
                if (accept(next))
                {
                    picked.Add(next);
                    break;
                }
            }
        }

        return picked;
    }

    /// <summary>
    /// Tỷ lệ câu đúng của cả lĩnh vực (%) cần để đạt mức 1 Cơ bản / 2 Trung cấp / 3 Nâng cao. Với 15 câu: 6 / 9 / 12 câu.
    /// Giao diện báo cáo dùng cùng mốc (trial-format.ts LEVEL_SHARE_PERCENTS).
    /// </summary>
    public static readonly IReadOnlyList<int> LevelSharePercents = new[] { 40, 60, 80 };

    /// <summary>
    /// Mức gợi ý của một lĩnh vực từ trắc nghiệm: tỷ lệ câu đúng trên tổng số câu đã phát của lĩnh vực, mọi cấp cộng lại
    /// (<see cref="LevelFromShare"/>). Số câu từng cấp chỉ để hiển thị.
    /// </summary>
    public static short SuggestedLevel(IReadOnlyList<(int Correct, int Total)> byTier) =>
        LevelFromShare(byTier.Sum(t => t.Correct), byTier.Sum(t => t.Total));

    /// <summary>
    /// Dưới 40% → 0 (chưa đạt cấp nào), từ 40% → 1, từ 60% → 2, từ 80% → 3. Chia cho số câu thật đã phát, nên một lĩnh vực
    /// thiếu câu (khóa có ít câu ôn tập) vẫn tính đúng tỷ lệ.
    /// </summary>
    public static short LevelFromShare(int correct, int total)
    {
        if (total <= 0)
        {
            return 0;
        }

        short level = 0;
        foreach (var percent in LevelSharePercents)
        {
            if (correct * 100 < total * percent)
            {
                break;
            }

            level++;
        }

        return level;
    }

    /// <summary>Mức theo tự luận: số cấp đạt liên tiếp từ Cơ bản (điểm của bài cấp đó ≥ 5). Điểm theo thứ tự cấp.</summary>
    public static short EssayLevel(IReadOnlyList<int?> scoresByTier)
    {
        short level = 0;
        foreach (var score in scoresByTier)
        {
            if (score is not >= EssayPassScore)
            {
                break;
            }

            level++;
        }

        return level;
    }
}

/// <summary>Đề tự luận của một cấp: 1 = Cơ bản, 2 = Trung cấp, 3 = Nâng cao.</summary>
public sealed record TrialEssayPromptDto(int Tier, string Title, string Prompt);
