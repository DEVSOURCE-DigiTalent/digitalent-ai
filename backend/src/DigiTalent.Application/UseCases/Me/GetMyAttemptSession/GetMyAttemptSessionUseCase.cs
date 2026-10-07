using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-11 — Mở lại lần làm bài (tải lại trang / đổi thiết bị): câu hỏi + đáp án đã lưu + deadline server.
/// Đã quá giờ → chấm tự động (câu chưa trả lời = 0) và trả Status = SCORED để FE chuyển sang kết quả.
/// </summary>
public class GetMyAttemptSessionUseCase : IUseCase<GetMyAttemptSessionUseCaseInput, MyAttemptSessionDto>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;
    private readonly MyAttemptPresenter _presenter;

    public GetMyAttemptSessionUseCase(
        IApplicationDbContext context, MyEmployeeContext me, MyAssessmentService assessments, MyAttemptPresenter presenter)
    {
        _context = context;
        _me = me;
        _assessments = assessments;
        _presenter = presenter;
    }

    public async Task<MyAttemptSessionDto> ExecuteAsync(GetMyAttemptSessionUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        var (attempt, assessment, course, _) = await _presenter.GetMyAttemptAsync(employee, input.AttemptId, track: false);

        if (attempt.Status == Statuses.AssessmentAttempt.Started && MyAssessmentService.IsExpired(attempt, assessment, now))
        {
            await _context.ExecuteInTransactionAsync(async () =>
            {
                var tracked = await _presenter.GetMyAttemptAsync(employee, input.AttemptId, track: true);
                await _assessments.FinalizeAsync(employee, tracked.Course, tracked.Assessment, tracked.Enrollment, tracked.Attempt, submittedAnswers: null, now);
                attempt = tracked.Attempt;
            });
        }

        return await _presenter.SessionAsync(attempt, assessment, course, now);
    }
}
