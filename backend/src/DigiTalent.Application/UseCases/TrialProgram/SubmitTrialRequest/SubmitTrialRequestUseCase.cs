using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// PUT /trial/request — chủ doanh nghiệp đặt (hoặc đổi) hạn làm bài; bài mở cho nhân viên đã mời. Cần ít nhất một nhân viên;
/// sau khi bài đóng không đổi được nữa.
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
            throw new BadRequestException("Bài đánh giá đã đóng.", "testDeadline", CloseTrialAssessmentUseCase.AlreadyClosed);
        }

        if (input.TestDeadline <= now.AddMinutes(TrialProgramRules.MinDeadlineMinutes)
            || input.TestDeadline > now.AddDays(TrialProgramRules.MaxDeadlineDays))
        {
            throw new BadRequestException(
                $"Hạn làm bài cần sau ít nhất {TrialProgramRules.MinDeadlineMinutes} phút và trong vòng {TrialProgramRules.MaxDeadlineDays} ngày.",
                "testDeadline", "TRIAL_DEADLINE_INVALID");
        }

        if ((await _reader.LoadParticipantsAsync(trial)).Count == 0)
        {
            throw new BadRequestException("Mời ít nhất một nhân viên trước khi đặt hạn.", "testDeadline", "TRIAL_NO_PARTICIPANTS");
        }

        trial.TestDeadline = input.TestDeadline;
        trial.RequestedAt ??= now;
        trial.Revision++;
        await _context.SaveChangesAsync();

        return new SubmitTrialRequestUseCaseOutput
        {
            Stage = TrialProgramRules.StageOf(trial),
            TestDeadline = input.TestDeadline,
        };
    }
}
