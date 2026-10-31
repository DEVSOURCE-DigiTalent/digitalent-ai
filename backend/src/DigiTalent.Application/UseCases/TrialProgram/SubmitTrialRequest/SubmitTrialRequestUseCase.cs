using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// PUT /trial/request — chủ doanh nghiệp đặt hạn làm bài và giờ mong muốn chấm rồi gửi yêu cầu chấm cho quản trị nền tảng
/// (lần đầu: thông báo tới quản trị nền tảng; lần sau: cập nhật, báo cho mentor nếu đã phân công). Cần ít nhất một nhân viên.
/// </summary>
public class SubmitTrialRequestUseCase : IUseCase<SubmitTrialRequestUseCaseInput, SubmitTrialRequestUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public SubmitTrialRequestUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<SubmitTrialRequestUseCaseOutput> ExecuteAsync(SubmitTrialRequestUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        var now = _reader.Now;
        if (trial.ReportPublishedAt != null)
        {
            throw new BadRequestException("Kết quả dùng thử đã được công bố.", "testDeadline", "TRIAL_REPORTED");
        }

        if (input.TestDeadline <= now.AddMinutes(30) || input.TestDeadline > now.AddDays(TrialProgramRules.MaxDeadlineDays))
        {
            throw new BadRequestException(
                $"Hạn làm bài cần sau ít nhất 30 phút và trong vòng {TrialProgramRules.MaxDeadlineDays} ngày.", "testDeadline", "TRIAL_DEADLINE_INVALID");
        }

        if ((await _reader.LoadParticipantsAsync(trial)).Count == 0)
        {
            throw new BadRequestException("Mời ít nhất một nhân viên trước khi gửi yêu cầu chấm.", "testDeadline", "TRIAL_NO_PARTICIPANTS");
        }

        var first = trial.RequestedAt == null;
        trial.TestDeadline = input.TestDeadline;
        trial.PreferredReviewAt = input.PreferredReviewAt;
        trial.RequestNote = string.IsNullOrWhiteSpace(input.Note) ? null : input.Note.Trim();
        trial.RequestedAt ??= now;

        var organizationName = await _reader.OrganizationNameAsync(trial.OrganizationId);
        var when = $"hạn làm bài {TrialProgramRules.FormatVietnamTime(input.TestDeadline)}, mong muốn chấm {TrialProgramRules.FormatVietnamTime(input.PreferredReviewAt)}";
        if (first)
        {
            _reader.Notify(await _reader.PlatformAdminUserIdsAsync(), TrialProgramRules.NotificationRequested,
                "Yêu cầu chấm bài dùng thử mới", $"{organizationName}: {when}. Hãy phân công mentor.", trial.OrganizationId);
        }
        else if (trial.MentorUserId is { } mentor)
        {
            _reader.Notify(new[] { mentor }, TrialProgramRules.NotificationRequested,
                "Doanh nghiệp đổi lịch dùng thử", $"{organizationName}: {when}.", trial.OrganizationId);
        }

        trial.Revision++;
        await _context.SaveChangesAsync();

        return new SubmitTrialRequestUseCaseOutput
        {
            Stage = TrialProgramRules.StageOf(trial),
            TestDeadline = input.TestDeadline,
            PreferredReviewAt = input.PreferredReviewAt,
            RequestedAt = trial.RequestedAt.Value,
        };
    }
}
