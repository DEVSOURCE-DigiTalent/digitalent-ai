using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-11 — Tự động lưu đáp án trong lúc làm bài (không chấm). Hết giờ → 409, FE gọi nộp/mở lại để chấm.</summary>
public class SaveMyAttemptAnswersUseCase : IUseCase<SaveMyAttemptAnswersUseCaseInput, SaveMyAttemptAnswersUseCaseOutput>
{
    public const string TimeUpMessage = "Đã hết thời gian làm bài. Bài làm sẽ được chấm theo các đáp án đã lưu.";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;
    private readonly MyAttemptPresenter _presenter;

    public SaveMyAttemptAnswersUseCase(
        IApplicationDbContext context, MyEmployeeContext me, MyAssessmentService assessments, MyAttemptPresenter presenter)
    {
        _context = context;
        _me = me;
        _assessments = assessments;
        _presenter = presenter;
    }

    public async Task<SaveMyAttemptAnswersUseCaseOutput> ExecuteAsync(SaveMyAttemptAnswersUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var now = DateTimeOffset.UtcNow;
        var (attempt, assessment, _, _) = await _presenter.GetMyAttemptAsync(employee, input.AttemptId, track: false);

        if (attempt.Status != Statuses.AssessmentAttempt.Started)
        {
            throw new ConflictException("Bài làm này đã được nộp.");
        }

        if (MyAssessmentService.IsExpired(attempt, assessment, now))
        {
            throw new ConflictException(TimeUpMessage);
        }

        await _assessments.SaveAnswersAsync(attempt.Id, assessment.Id, input.Answers);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_assessment_answers_attempt_question: 2 lần tự lưu chạy song song — lần sau sẽ ghi đè
            throw new ConflictException("Đáp án đang được lưu, vui lòng thử lại.");
        }

        return new SaveMyAttemptAnswersUseCaseOutput
        {
            SavedCount = input.Answers.Count,
            Deadline = MyAssessmentService.DeadlineOf(attempt, assessment),
            ServerNow = now,
        };
    }
}
