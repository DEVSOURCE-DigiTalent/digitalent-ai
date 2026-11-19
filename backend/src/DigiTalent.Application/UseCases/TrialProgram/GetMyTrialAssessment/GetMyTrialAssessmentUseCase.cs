using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
using DigiTalent.Application.UseCases.Me;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /me/trial-assessment — bài đánh giá tổng hợp của nhân viên doanh nghiệp dùng thử.</summary>
public class GetMyTrialAssessmentUseCase : IUseCase<GetMyTrialAssessmentUseCaseInput, GetMyTrialAssessmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TrialProgramReader _reader;
    private readonly IGeminiService _ai;
    private readonly ILogger<GetMyTrialAssessmentUseCase> _logger;

    public GetMyTrialAssessmentUseCase(
        IApplicationDbContext context,
        MyEmployeeContext me,
        TrialProgramReader reader,
        IGeminiService ai,
        ILogger<GetMyTrialAssessmentUseCase> logger)
    {
        _context = context;
        _me = me;
        _reader = reader;
        _ai = ai;
        _logger = logger;
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
        List<TrialReportEmployeeDomainDetailDto>? domainDetails = null;
        List<MyTrialEssayResultDto>? essayResults = null;
        string? essaySummary = null;

        var results = assessment == null ? null
            : (await _reader.LoadDomainResultsAsync(new[] { assessment.Id })).GetValueOrDefault(assessment.Id);
        if (TrialAssessmentResults.IsReady(assessment, results))
        {
            var byCategory = (results ?? new()).ToDictionary(r => r.CategoryId);

            var positionId = await EffectiveJobPositions.Resolve(_context,
                    _context.Employees.AsNoTracking().Where(e => e.Id == employee.Id))
                .Select(row => row.PositionId).SingleOrDefaultAsync();
            var standard = positionId is Guid id
                ? (await new PositionTargetsReader(_context).LoadAsync(trial.OrganizationId, [id])).GetValueOrDefault(id)
                : null;

            domainDetails = domains.Select(d =>
            {
                byCategory.TryGetValue(d.CategoryId, out var dResult);
                var lvl = dResult == null ? 0 : TrialAssessmentResults.EffectiveLevelOf(dResult);
                var expected = CapabilityExpectation.ExpectedFor(standard, d.CategoryId);
                var targetLevel = standard?.Levels.GetValueOrDefault(d.CategoryId) ?? 0;
                var (levelLabel, statusText, gapText, recCourse) = TrialProgramReader.DescribeDomainResult(d.Number, d.Name, lvl, targetLevel, expected.HasValue);
                return new TrialReportEmployeeDomainDetailDto
                {
                    CategoryId = d.CategoryId,
                    Number = d.Number,
                    Name = d.Name,
                    Level = lvl,
                    TargetLevel = targetLevel,
                    UsesSystemReference = expected == null && standard?.UsesSystemReference == true,
                    IsExpectation = expected.HasValue,
                    SkillGap = Math.Max(0, targetLevel - lvl),
                    LevelLabel = levelLabel,
                    StatusText = statusText,
                    GapText = gapText,
                    BasicCorrect = dResult?.BasicCorrect ?? 0,
                    BasicTotal = dResult?.BasicTotal ?? 0,
                    IntermediateCorrect = dResult?.IntermediateCorrect ?? 0,
                    IntermediateTotal = dResult?.IntermediateTotal ?? 0,
                    AdvancedCorrect = dResult?.AdvancedCorrect ?? 0,
                    AdvancedTotal = dResult?.AdvancedTotal ?? 0,
                    SuggestedLevel = dResult == null ? 0 : TrialAssessmentResults.SuggestedLevelOf(dResult),
                    MentorLevel = dResult?.MentorLevel,
                    RecommendedCourse = recCourse,
                };
            }).ToList();
            levels = domainDetails.Select(d => d.Level).ToList();

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
            ChoiceScore = levels != null ? assessment?.ChoiceScore : null,
            ChoiceTotal = levels != null ? assessment?.ChoiceTotal : null,
            Domains = domains.Select(TrialDomainDto.From).ToList(),
            Essays = new(),
            SubmittedAt = assessment?.SubmittedAt,
            ReportPublished = published && levels != null,
            Levels = levels,
            DomainDetails = domainDetails,
            EssayResults = essayResults,
            EssaySummary = essaySummary,
            ReviewNote = levels != null ? assessment!.ReviewNote : null,
            MentorName = null,
        };
    }
}
