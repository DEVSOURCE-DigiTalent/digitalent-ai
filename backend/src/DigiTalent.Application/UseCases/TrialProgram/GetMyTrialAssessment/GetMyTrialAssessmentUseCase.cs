using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Me;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// GET /me/trial-assessment — bài đánh giá tổng hợp của nhân viên doanh nghiệp dùng thử. Bài đến hạn được đóng lúc đọc, nên
/// nhân viên thấy kết quả và vào học thử ngay khi hết hạn.
/// </summary>
public class GetMyTrialAssessmentUseCase : IUseCase<GetMyTrialAssessmentUseCaseInput, GetMyTrialAssessmentUseCaseOutput>
{
    public const string StatusNotStarted = "NOT_STARTED";

    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly TrialProgramReader _reader;
    private readonly TrialCloser _closer;

    public GetMyTrialAssessmentUseCase(IApplicationDbContext context, MyEmployeeContext me, TrialProgramReader reader, TrialCloser closer)
    {
        _context = context;
        _me = me;
        _reader = reader;
        _closer = closer;
    }

    public async Task<GetMyTrialAssessmentUseCaseOutput> ExecuteAsync(GetMyTrialAssessmentUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var trial = await _reader.ForEmployeeAsync(employee);
        await _closer.CloseIfDueAsync(trial);
        var assessment = await _context.TrialAssessments.AsNoTracking().FirstOrDefaultAsync(a => a.EmployeeId == employee.Id);
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var closed = TrialProgramReader.ClosedReason(trial, assessment, _reader.Now);
        var published = trial.ReportPublishedAt != null;

        List<TrialReportEmployeeDomainDetailDto>? details = null;
        if (published && assessment != null)
        {
            var results = (await _reader.LoadDomainResultsAsync(new[] { assessment.Id })).GetValueOrDefault(assessment.Id) ?? new();
            var byCategory = results.ToDictionary(r => r.CategoryId);
            details = domains.Select(d =>
            {
                byCategory.TryGetValue(d.CategoryId, out var result);
                var level = result != null ? TrialProgramRules.LevelOf(result) : 0;
                var (levelLabel, statusText, gapText, course) = TrialProgramReader.DescribeDomainResult(d.Number, d.Name, level, result);
                return new TrialReportEmployeeDomainDetailDto
                {
                    CategoryId = d.CategoryId,
                    Number = d.Number,
                    Name = d.Name,
                    Level = level,
                    LevelLabel = levelLabel,
                    StatusText = statusText,
                    GapText = gapText,
                    BasicCorrect = result?.BasicCorrect ?? 0,
                    BasicTotal = result?.BasicTotal ?? 0,
                    IntermediateCorrect = result?.IntermediateCorrect ?? 0,
                    IntermediateTotal = result?.IntermediateTotal ?? 0,
                    AdvancedCorrect = result?.AdvancedCorrect ?? 0,
                    AdvancedTotal = result?.AdvancedTotal ?? 0,
                    SuggestedLevel = result?.SuggestedLevel ?? 0,
                    MentorLevel = result?.MentorLevel,
                    RecommendedCourse = course,
                };
            }).ToList();
        }

        return new GetMyTrialAssessmentUseCaseOutput
        {
            OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
            TestDeadline = trial.TestDeadline,
            Status = details != null ? TrialProgramRules.StageReported
                : assessment != null ? TrialProgramRules.ParticipantSubmitted
                : StatusNotStarted,
            CanStart = closed == null,
            ClosedMessage = closed,
            ChoiceCount = domains.Count * 3 * TrialProgramRules.ChoicePerCell,
            Domains = domains.Select(TrialDomainDto.From).ToList(),
            SubmittedAt = assessment?.SubmittedAt,
            ReportPublished = published,
            Levels = details?.Select(d => d.Level).ToList(),
            DomainDetails = details,
        };
    }
}
