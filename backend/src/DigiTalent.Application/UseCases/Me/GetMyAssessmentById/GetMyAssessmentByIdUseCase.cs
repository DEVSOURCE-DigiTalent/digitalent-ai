using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>EM-10 — Giới thiệu bài đánh giá: quy chế, số câu, thời gian, số lần làm còn lại, các lần làm trước.</summary>
public class GetMyAssessmentByIdUseCase : IUseCase<GetMyAssessmentByIdUseCaseInput, GetMyAssessmentByIdUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;

    public GetMyAssessmentByIdUseCase(IApplicationDbContext context, MyEmployeeContext me, MyAssessmentService assessments)
    {
        _context = context;
        _me = me;
        _assessments = assessments;
    }

    public async Task<GetMyAssessmentByIdUseCaseOutput> ExecuteAsync(GetMyAssessmentByIdUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var visible = await _assessments.GetVisibleAsync(employee, input.AssessmentId);
        var state = (await _assessments.BuildStatesAsync(new[] { visible }, DateTimeOffset.UtcNow)).Single();

        var questionLinks = await _context.AssessmentQuestions
            .AsNoTracking()
            .Where(aq => aq.AssessmentId == input.AssessmentId)
            .Select(aq => new { aq.QuestionId, aq.Points })
            .ToListAsync();
        var questionIds = questionLinks.Select(q => q.QuestionId).ToList();
        var competencies = await (
                from question in _context.Questions.AsNoTracking()
                join competency in _context.Competencies.AsNoTracking() on question.CompetencyId equals competency.Id
                where questionIds.Contains(question.Id)
                select new { competency.Id, competency.Code, competency.Name })
            .Distinct()
            .OrderBy(c => c.Code)
            .ToListAsync();

        var output = MyAssessmentCardDto.Map<GetMyAssessmentByIdUseCaseOutput>(state);
        output.TotalPoints = questionLinks.Sum(q => q.Points);
        output.Competencies = competencies.Select(c => new MyCompetencyRefDto { CompetencyId = c.Id, Code = c.Code, Name = c.Name }).ToList();
        output.Attempts = state.Attempts
            .OrderByDescending(a => a.AttemptNo)
            .Select(a => new MyAttemptSummaryDto
            {
                Id = a.Id,
                AttemptNo = a.AttemptNo,
                Status = a.Status,
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                Score = a.Score,
                Passed = a.Passed,
            })
            .ToList();
        return output;
    }
}
