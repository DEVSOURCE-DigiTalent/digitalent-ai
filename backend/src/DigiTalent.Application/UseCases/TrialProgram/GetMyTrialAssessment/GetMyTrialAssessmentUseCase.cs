using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
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

        if (assessment?.ReviewedAt != null)
        {
            var results = (await _reader.LoadDomainResultsAsync(new[] { assessment.Id })).GetValueOrDefault(assessment.Id) ?? new();
            var byCategory = results.ToDictionary(r => r.CategoryId);

            var categoryIds = domains.Select(d => d.CategoryId).ToList();
            var ceilingRows = await _context.CapabilityCeilings.AsNoTracking()
                .Where(c => c.OrganizationId == trial.OrganizationId && categoryIds.Contains(c.CompetencyCategoryId))
                .ToListAsync();
            var orgCeilings = ceilingRows.Where(c => c.DepartmentId == null)
                .ToDictionary(c => c.CompetencyCategoryId, c => (int)c.CeilingLevel);
            var deptCeilings = employee.DepartmentId != Guid.Empty
                ? ceilingRows.Where(c => c.DepartmentId == employee.DepartmentId)
                    .ToDictionary(c => c.CompetencyCategoryId, c => (int)c.CeilingLevel)
                : new Dictionary<Guid, int>();

            domainDetails = domains.Select(d =>
            {
                byCategory.TryGetValue(d.CategoryId, out var dResult);
                var lvl = (int)(dResult?.MentorLevel ?? dResult?.SuggestedLevel ?? 0);
                var targetLevel = deptCeilings.TryGetValue(d.CategoryId, out var dl) && dl > 0
                    ? dl
                    : orgCeilings.TryGetValue(d.CategoryId, out var ol) && ol > 0 ? ol : 3;
                var (levelLabel, statusText, gapText, recCourse) = TrialProgramReader.DescribeDomainResult(d.Number, d.Name, lvl, targetLevel, dResult);
                return new TrialReportEmployeeDomainDetailDto
                {
                    CategoryId = d.CategoryId,
                    Number = d.Number,
                    Name = d.Name,
                    Level = lvl,
                    TargetLevel = targetLevel,
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
                    SuggestedLevel = dResult?.SuggestedLevel ?? 0,
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
