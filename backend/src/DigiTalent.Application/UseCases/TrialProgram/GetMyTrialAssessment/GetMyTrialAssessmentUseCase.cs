using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /me/trial-assessment — bài đánh giá tổng hợp của nhân viên doanh nghiệp dùng thử.</summary>
public class GetMyTrialAssessmentUseCase : IUseCase<GetMyTrialAssessmentUseCaseInput, GetMyTrialAssessmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TrialProgramReader _reader;

    public GetMyTrialAssessmentUseCase(IApplicationDbContext context, MyEmployeeContext me, TrialProgramReader reader)
    {
        _context = context;
        _me = me;
        _reader = reader;
    }

    public async Task<GetMyTrialAssessmentUseCaseOutput> ExecuteAsync(GetMyTrialAssessmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var trial = await _reader.ForEmployeeAsync(employee);
        var assessment = await _context.TrialAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var closed = TrialProgramReader.ClosedReason(trial, assessment, _reader.Now);
        var published = trial.ReportPublishedAt != null;

        List<int>? levels = null;
        if (published && assessment?.ReviewedAt != null)
        {
            var results = (await _reader.LoadDomainResultsAsync(new[] { assessment.Id })).GetValueOrDefault(assessment.Id) ?? new();
            levels = domains.Select(d => (int)(results.FirstOrDefault(r => r.CategoryId == d.CategoryId)?.MentorLevel ?? 0)).ToList();
        }

        return new GetMyTrialAssessmentUseCaseOutput
        {
            OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
            TestDeadline = trial.TestDeadline,
            Status = levels != null ? TrialProgramRules.ParticipantReviewed
                : assessment != null ? TrialProgramRules.ParticipantSubmitted
                : "NOT_STARTED",
            CanStart = closed == null,
            ClosedMessage = closed,
            ChoiceCount = domains.Count * 3 * TrialProgramRules.ChoicePerCell,
            Domains = domains.Select(TrialDomainDto.From).ToList(),
            Essays = TrialProgramRules.Essays.ToList(),
            SubmittedAt = assessment?.SubmittedAt,
            ReportPublished = published,
            Levels = levels,
            ReviewNote = levels != null ? assessment!.ReviewNote : null,
            MentorName = await _reader.UserNameAsync(trial.MentorUserId),
        };
    }
}
