using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// Quy tắc của luồng dùng thử doanh nghiệp (docs/specs/2026-10-31-trial-ai-report-roadmap.md): chủ doanh nghiệp mời nhân
/// viên và đặt hạn làm bài → nhân viên làm bài trắc nghiệm ba cấp trong phòng thi có giám sát, máy chấm ngay khi nộp → bài
/// đóng khi hết hạn, khi mọi người đã nộp hoặc khi chủ doanh nghiệp đóng sớm → báo cáo năng lực tự tạo (số liệu theo luật,
/// AI chỉ viết ưu tiên và lý do ngắn) → nhân viên học thử các khóa Cơ bản.
/// </summary>
public static class TrialProgramRules
{
    /// <summary>Số nhân viên tối đa của một doanh nghiệp dùng thử (không tính chủ doanh nghiệp).</summary>
    public const int MaxParticipants = 30;

    /// <summary>Số câu trắc nghiệm cho mỗi (lĩnh vực, cấp): 6 lĩnh vực × 3 cấp → 18 câu.</summary>
    public const int ChoicePerCell = 1;

    /// <summary>Hạn làm bài xa nhất tính từ lúc đặt hạn.</summary>
    public const int MaxDeadlineDays = 60;

    /// <summary>Hạn làm bài sớm nhất tính từ lúc đặt hạn.</summary>
    public const int MinDeadlineMinutes = 30;

    public const string StageSetup = "SETUP";
    public const string StageOpen = "OPEN";
    public const string StageReported = "REPORTED";

    public const string ParticipantInvited = "INVITED";
    public const string ParticipantInviteExpired = "INVITE_EXPIRED";
    public const string ParticipantActive = "ACTIVE";
    public const string ParticipantSubmitted = "SUBMITTED";

    public const string NotificationReported = "TRIAL_REPORT_PUBLISHED";
    public const string NotificationMentorAssigned = "TRIAL_MENTOR_ASSIGNED";

    /// <summary>Giờ Việt Nam (UTC+7) cho nội dung email / thông báo: "17:00 ngày 30/10/2026".</summary>
    public static string FormatVietnamTime(DateTimeOffset value) =>
        value.ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm 'ngày' dd/MM/yyyy", System.Globalization.CultureInfo.InvariantCulture);

    /// <summary>Bước hiện tại của doanh nghiệp dùng thử, suy ra từ các mốc đã lưu.</summary>
    public static string StageOf(TrialWorkspace trial) =>
        trial.ReportPublishedAt != null ? StageReported
        : trial.TestDeadline != null ? StageOpen
        : StageSetup;

    /// <summary>
    /// Mức gợi ý của một lĩnh vực từ trắc nghiệm: cấp cao nhất mà mọi cấp từ Cơ bản tới đó đều đạt (≥ 70% số câu của cấp).
    /// </summary>
    public static short SuggestedLevel(IReadOnlyList<(int Correct, int Total)> byTier)
    {
        short level = 0;
        foreach (var (correct, total) in byTier)
        {
            if (total == 0 || correct < PulseRules.ChoicePassMark(total))
            {
                break;
            }

            level++;
        }

        return level;
    }

    /// <summary>
    /// Mức của một lĩnh vực trong bài đánh giá: mức máy chấm từ trắc nghiệm. Bài của luồng cũ (mentor chấm) giữ mức mentor đã quyết.
    /// </summary>
    public static int LevelOf(TrialAssessmentDomain result) => result.MentorLevel ?? result.SuggestedLevel;
}
