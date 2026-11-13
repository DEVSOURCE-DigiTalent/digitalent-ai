using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// PUT /trial/request — đặt hạn nộp bài và bắt đầu đợt khảo sát trắc nghiệm. Cần ít nhất một nhân viên.
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
            throw new BadRequestException("Thêm ít nhất một nhân viên trước khi bắt đầu đánh giá.", "testDeadline", "TRIAL_NO_PARTICIPANTS");
        }

        var first = trial.RequestedAt == null;
        trial.TestDeadline = input.TestDeadline;
        // Survey grading is automatic; legacy mentor scheduling fields are no longer used.
        trial.PreferredReviewAt = null;
        trial.RequestNote = null;
        trial.RequestedAt ??= now;

        var organizationName = await _reader.OrganizationNameAsync(trial.OrganizationId);
        var when = $"hạn làm bài {TrialProgramRules.FormatVietnamTime(input.TestDeadline)}";
        if (first)
        {
            _reader.Notify(await _reader.PlatformAdminUserIdsAsync(), TrialProgramRules.NotificationRequested,
                "Đợt khảo sát đã bắt đầu", $"{organizationName}: {when}. Bài trắc nghiệm được chấm tự động.", trial.OrganizationId);
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
