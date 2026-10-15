using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /pulse/final-reviews/{submissionId}/support — quản lý ghi hướng hỗ trợ cho ca cần hỗ trợ (§10.2): lần 2 chưa
/// đạt (cờ) hoặc quá hạn nộp lần cuối. Chỉ ghi nhận; không mở cấp tiếp và không tự tạo lượt học mới.
/// </summary>
public class RecordPulseFinalSupportUseCase : IUseCase<RecordPulseFinalSupportUseCaseInput, RecordPulseFinalSupportUseCaseOutput>
{
    public const string NotificationType = "PULSE_FINAL_SUPPORT";

    private static readonly Dictionary<string, string> ActionLabels = new()
    {
        [Statuses.FinalSupportAction.Coaching] = "Sắp xếp kèm cặp",
        [Statuses.FinalSupportAction.FreshCycle] = "Đề xuất chu kỳ học mới",
        [Statuses.FinalSupportAction.Pause] = "Tạm dừng lộ trình",
    };

    private readonly IApplicationDbContext _context;
    private readonly PulseReviewScope _scope;
    private readonly TimeProvider _clock;

    public RecordPulseFinalSupportUseCase(IApplicationDbContext context, PulseReviewScope scope, TimeProvider clock)
    {
        _context = context;
        _scope = scope;
        _clock = clock;
    }

    public async Task<RecordPulseFinalSupportUseCaseOutput> ExecuteAsync(RecordPulseFinalSupportUseCaseInput input)
    {
        var (submission, enrollment, employee) = await _scope.LoadAsync(input.SubmissionId);
        var attempts = await _scope.AttemptsAsync(enrollment.Id);
        var now = _clock.GetUtcNow();
        var status = PulseRules.FinalStatusOf(enrollment, attempts, true, now);
        if (status is not (PulseFinalStatus.Flagged or PulseFinalStatus.DeadlineMissed) || attempts[^1].Id != submission.Id)
        {
            throw new BadRequestException("Chỉ ghi hướng hỗ trợ cho bài đã chưa đạt hai lần hoặc đã quá hạn nộp lần cuối.", "submissionId", "NOT_SUPPORT_CASE");
        }

        submission.SupportAction = input.Action;
        submission.SupportNote = string.IsNullOrWhiteSpace(input.Note) ? null : input.Note.Trim();
        submission.SupportRecordedByUserId = _scope.ReviewerUserId;
        submission.SupportRecordedAt = now;

        if (employee.UserId is { } employeeUserId)
        {
            _context.Notifications.Add(new Notification
            {
                RecipientUserId = employeeUserId,
                Type = NotificationType,
                Title = "Quản lý đã ghi nhận hướng hỗ trợ",
                Message = submission.SupportNote == null
                    ? ActionLabels[input.Action]
                    : $"{ActionLabels[input.Action]}: {submission.SupportNote}",
                RelatedEntityType = "course_final_submissions",
                RelatedEntityId = submission.Id,
            });
        }

        await _context.SaveChangesAsync();
        return new RecordPulseFinalSupportUseCaseOutput { SubmissionId = submission.Id, Action = input.Action, RecordedAt = now };
    }
}
