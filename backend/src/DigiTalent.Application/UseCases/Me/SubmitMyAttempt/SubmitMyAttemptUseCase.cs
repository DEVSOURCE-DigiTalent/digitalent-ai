using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-11 → EM-12 — Nộp bài: chấm trên server (1 transaction: chấm + hoàn thành khóa + cấp chứng chỉ, NFR-REL-01).
/// Nộp lại lần làm đã chấm (bấm 2 lần) → trả lại kết quả cũ, không chấm lần 2.
/// </summary>
public class SubmitMyAttemptUseCase : IUseCase<SubmitMyAttemptUseCaseInput, MyAttemptResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;
    private readonly MyAttemptPresenter _presenter;

    public SubmitMyAttemptUseCase(
        IApplicationDbContext context, MyEmployeeContext me, MyAssessmentService assessments, MyAttemptPresenter presenter)
    {
        _context = context;
        _me = me;
        _assessments = assessments;
        _presenter = presenter;
    }

    public async Task<MyAttemptResultDto> ExecuteAsync(SubmitMyAttemptUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var (current, _, _, _) = await _presenter.GetMyAttemptAsync(employee, input.AttemptId, track: false);

        if (current.Status == Statuses.AssessmentAttempt.Started)
        {
            var now = DateTimeOffset.UtcNow;
            try
            {
                await _context.ExecuteInTransactionAsync(async () =>
                {
                    var (attempt, assessment, course, enrollment) = await _presenter.GetMyAttemptAsync(employee, input.AttemptId, track: true);
                    await _assessments.FinalizeAsync(employee, course, assessment, enrollment, attempt, input.Answers, now);
                });
            }
            catch (ConflictException)
            {
                // Request nộp song song đã chấm lần làm này — trả kết quả của request đó
            }
        }

        return await _presenter.ResultAsync(employee, input.AttemptId);
    }
}
