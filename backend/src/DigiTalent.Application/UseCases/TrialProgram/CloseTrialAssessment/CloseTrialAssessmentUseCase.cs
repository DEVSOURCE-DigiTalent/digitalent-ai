using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /trial/close — chủ doanh nghiệp "Xem kết quả ngay": đóng bài trước hạn khi đã có ít nhất một bài nộp. Người chưa nộp
/// không vào bài được nữa (phiên đang mở vẫn nộp được và báo cáo cập nhật theo).
/// </summary>
public class CloseTrialAssessmentUseCase : IUseCase<CloseTrialAssessmentUseCaseInput, CloseTrialAssessmentUseCaseOutput>
{
    public const string NoSubmission = "TRIAL_NO_SUBMISSION";
    public const string AlreadyClosed = "TRIAL_ALREADY_CLOSED";

    private readonly TrialProgramReader _reader;
    private readonly TrialCloser _closer;

    public CloseTrialAssessmentUseCase(TrialProgramReader reader, TrialCloser closer)
    {
        _reader = reader;
        _closer = closer;
    }

    public async Task<CloseTrialAssessmentUseCaseOutput> ExecuteAsync(CloseTrialAssessmentUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        if (trial.ReportPublishedAt != null)
        {
            throw new BadRequestException("Bài đánh giá đã đóng.", "trial", AlreadyClosed);
        }

        var submitted = (await _reader.LoadParticipantsAsync(trial)).Count(p => p.Status == TrialProgramRules.ParticipantSubmitted);
        if (submitted == 0)
        {
            throw new BadRequestException("Chưa có bài nào được nộp.", "trial", NoSubmission);
        }

        await _closer.CloseAsync(trial, submitted);
        return new CloseTrialAssessmentUseCaseOutput { ClosedAt = trial.ReportPublishedAt!.Value, Assessed = submitted };
    }
}
