using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /me/trial-assessment — nộp bài đánh giá tổng hợp: đóng phiên giám sát (đã có bản ghi màn hình và camera), chấm
/// trắc nghiệm, lưu số câu đúng theo lĩnh vực × cấp cùng mức gợi ý, ba bài tự luận; báo cho mentor nếu đã được phân công.
/// Phiên mở trước hạn làm bài thì vẫn nộp được sau hạn.
/// </summary>
public class SubmitMyTrialAssessmentUseCase : IUseCase<SubmitMyTrialAssessmentUseCaseInput, SubmitMyTrialAssessmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TrialProgramReader _reader;
    private readonly TrialAssessmentPaper _paper;
    private readonly PulseProctoring _proctoring;

    public SubmitMyTrialAssessmentUseCase(
        IApplicationDbContext context, MyEmployeeContext me, TrialProgramReader reader, TrialAssessmentPaper paper, PulseProctoring proctoring)
    {
        _context = context;
        _me = me;
        _reader = reader;
        _paper = paper;
        _proctoring = proctoring;
    }

    public async Task<SubmitMyTrialAssessmentUseCaseOutput> ExecuteAsync(SubmitMyTrialAssessmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var trial = await _reader.ForEmployeeAsync(employee);
        var now = _reader.Now;
        var startedAt = await _context.ProctoringSessions.AsNoTracking()
            .Where(s => s.Id == input.ProctoringSessionId && s.EmployeeId == employee.Id)
            .Select(s => (DateTimeOffset?)s.StartedAt)
            .FirstOrDefaultAsync();
        var existing = await _context.TrialAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        if (TrialProgramReader.ClosedReason(trial, existing, startedAt ?? now) is { } reason)
        {
            throw new BadRequestException(reason, "proctoringSessionId", StartMyTrialAssessmentUseCase.NotOpen);
        }

        var session = await _proctoring.CloseForSubmitAsync(
            input.ProctoringSessionId, employee.Id, Statuses.ProctoringKind.TrialAssessment, null, now);
        var paper = await _paper.BuildAsync(trial.OrganizationId, employee.Id);
        var grade = PulseExamPaper.Grade(paper.Items.Select(i => i.Question).ToList(), input.Answers)
                    ?? throw new BadRequestException("Đề đánh giá chưa sẵn sàng.", "answers", StartMyTrialAssessmentUseCase.PaperEmpty);

        var assessment = new TrialAssessment
        {
            OrganizationId = trial.OrganizationId,
            EmployeeId = employee.Id,
            ProctoringSessionId = session.Id,
            EssayBasic = input.EssayBasic.Trim(),
            EssayIntermediate = input.EssayIntermediate.Trim(),
            EssayAdvanced = input.EssayAdvanced.Trim(),
            ChoiceScore = grade.Score,
            ChoiceTotal = grade.Total,
            SubmittedAt = now,
        };
        _context.TrialAssessments.Add(assessment);
        foreach (var answer in grade.Answers)
        {
            answer.TrialAssessmentId = assessment.Id;
            _context.ExamChoiceAnswers.Add(answer);
        }

        var isAutoReview = trial.ReportPublishedAt != null;
        if (isAutoReview)
        {
            assessment.ReviewedAt = now;
        }

        var correct = grade.Answers.ToDictionary(a => a.QuestionId, a => a.IsCorrect);
        foreach (var domain in paper.Domains)
        {
            var cells = Enumerable.Range(1, PulseRules.MaxLevel)
                .Select(tier =>
                {
                    var items = paper.Items.Where(i => i.CategoryId == domain.CategoryId && i.Tier == tier).ToList();
                    return (Correct: items.Count(i => correct.GetValueOrDefault(i.Question.QuestionId)), Total: items.Count);
                })
                .ToList();
            var suggested = TrialProgramRules.SuggestedLevel(cells);
            _context.TrialAssessmentDomains.Add(new TrialAssessmentDomain
            {
                TrialAssessmentId = assessment.Id,
                CategoryId = domain.CategoryId,
                BasicCorrect = (short)cells[0].Correct,
                BasicTotal = (short)cells[0].Total,
                IntermediateCorrect = (short)cells[1].Correct,
                IntermediateTotal = (short)cells[1].Total,
                AdvancedCorrect = (short)cells[2].Correct,
                AdvancedTotal = (short)cells[2].Total,
                SuggestedLevel = suggested,
                MentorLevel = isAutoReview ? suggested : null,
            });
        }

        if (trial.MentorUserId is { } mentor)
        {
            _reader.Notify(new[] { mentor }, TrialProgramRules.NotificationSubmitted, "Có bài dùng thử cần chấm",
                $"{employee.FullName} ({await _reader.OrganizationNameAsync(trial.OrganizationId)}) đã nộp bài đánh giá tổng hợp.",
                trial.OrganizationId);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_trial_assessments_employee: bấm "Nộp" hai lần cùng lúc
            throw new ConflictException("Bài đánh giá đang được gửi, vui lòng tải lại trang.");
        }

        return new SubmitMyTrialAssessmentUseCaseOutput
        {
            AssessmentId = assessment.Id,
            SubmittedAt = now,
            DurationMs = session.DurationMs ?? 0,
        };
    }
}
