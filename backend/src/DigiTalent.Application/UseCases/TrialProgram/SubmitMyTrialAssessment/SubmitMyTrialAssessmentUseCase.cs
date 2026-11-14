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
/// trắc nghiệm, lưu số câu đúng theo lĩnh vực × cấp và cập nhật kết quả tự động.
/// Hạn nộp áp dụng cả các phiên đã bắt đầu để kết quả chốt không tiếp tục thay đổi.
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
        var existing = await _context.TrialAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        if (TrialProgramReader.ClosedReason(trial, existing, now) is { } reason)
        {
            throw new BadRequestException(reason, "proctoringSessionId", StartMyTrialAssessmentUseCase.NotOpen);
        }


        var paper = await _paper.BuildAsync(trial.OrganizationId, employee.Id);
        var grade = PulseExamPaper.Grade(paper.Items.Select(i => i.Question).ToList(), input.Answers)
                    ?? throw new BadRequestException("Đề đánh giá chưa sẵn sàng.", "answers", StartMyTrialAssessmentUseCase.PaperEmpty);

        var session = await _proctoring.CloseForSubmitAsync(
            input.ProctoringSessionId, employee.Id, Statuses.ProctoringKind.TrialAssessment, null, now);

        var assessment = new TrialAssessment
        {
            OrganizationId = trial.OrganizationId,
            EmployeeId = employee.Id,
            ProctoringSessionId = session.Id,
            EssayBasic = string.Empty,
            EssayIntermediate = string.Empty,
            EssayAdvanced = string.Empty,
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
                MentorLevel = null,
            });
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

        await _reader.FinalizeSurveyAsync(trial);
        return new SubmitMyTrialAssessmentUseCaseOutput
        {
            AssessmentId = assessment.Id,
            SubmittedAt = now,
            DurationMs = session.DurationMs ?? 0,
        };
    }
}
