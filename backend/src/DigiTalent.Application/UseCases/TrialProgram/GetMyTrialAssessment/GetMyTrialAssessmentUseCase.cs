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

        if (published && assessment?.ReviewedAt != null)
        {
            var results = (await _reader.LoadDomainResultsAsync(new[] { assessment.Id })).GetValueOrDefault(assessment.Id) ?? new();
            var byCategory = results.ToDictionary(r => r.CategoryId);
            domainDetails = domains.Select(d =>
            {
                byCategory.TryGetValue(d.CategoryId, out var dResult);
                var lvl = (int)(dResult?.MentorLevel ?? dResult?.SuggestedLevel ?? 0);
                var (levelLabel, statusText, gapText, recCourse) = TrialProgramReader.DescribeDomainResult(d.Number, d.Name, lvl, dResult);
                return new TrialReportEmployeeDomainDetailDto
                {
                    CategoryId = d.CategoryId,
                    Number = d.Number,
                    Name = d.Name,
                    Level = lvl,
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

            TrialEssayAiReviewDto? aiReview = TrialEssayAiReviewDto.FromJson(assessment.AiEssayReview);

            // Nếu chưa có AI review và Gemini đã được cấu hình key, tự động gọi AI đánh giá 3 bài tự luận
            if (aiReview == null && _ai.IsConfigured &&
                (!string.IsNullOrWhiteSpace(assessment.EssayBasic) ||
                 !string.IsNullOrWhiteSpace(assessment.EssayIntermediate) ||
                 !string.IsNullOrWhiteSpace(assessment.EssayAdvanced)))
            {
                try
                {
                    var essayInputs = TrialProgramRules.Essays
                        .Select(e => new TrialEssayAiInput(
                            e.Tier,
                            e.Title,
                            e.Prompt,
                            e.Tier switch { 1 => assessment.EssayBasic, 2 => assessment.EssayIntermediate, _ => assessment.EssayAdvanced }))
                        .ToList();

                    aiReview = await _ai.EvaluateTrialEssaysAsync(essayInputs);
                    if (aiReview != null)
                    {
                        aiReview.ReviewedAt = _reader.Now;
                        var trackableAssessment = await _context.TrialAssessments.FirstOrDefaultAsync(a => a.Id == assessment.Id);
                        if (trackableAssessment != null)
                        {
                            trackableAssessment.AiEssayReview = aiReview.ToJson();
                            trackableAssessment.AiEssayReviewedAt = aiReview.ReviewedAt;
                            await _context.SaveChangesAsync();
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không thể tự động gọi AI Gemini đánh giá bài tự luận dùng thử.");
                }
            }

            essaySummary = aiReview?.Summary;
            essayResults = TrialProgramRules.Essays.Select(e =>
            {
                var answer = e.Tier switch
                {
                    1 => assessment.EssayBasic,
                    2 => assessment.EssayIntermediate,
                    _ => assessment.EssayAdvanced
                };
                var aiScore = aiReview?.Essays.FirstOrDefault(x => x.Tier == e.Tier);
                var mentorScore = e.Tier switch
                {
                    1 => assessment.EssayBasicScore,
                    2 => assessment.EssayIntermediateScore,
                    _ => assessment.EssayAdvancedScore
                };
                var score = mentorScore.HasValue ? (int)mentorScore.Value : aiScore?.Score;
                var passed = score.HasValue ? score.Value >= TrialProgramRules.EssayPassScore : (bool?)null;

                return new MyTrialEssayResultDto
                {
                    Tier = e.Tier,
                    Title = e.Title,
                    Prompt = e.Prompt,
                    Answer = answer,
                    Score = score,
                    Passed = passed,
                    Feedback = aiScore?.Feedback ?? (score.HasValue && score.Value >= 5 ? "Bài viết đạt yêu cầu thực hành." : "Bài viết chưa đạt đủ tiêu chí yêu cầu.")
                };
            }).ToList();
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
            DomainDetails = domainDetails,
            EssayResults = essayResults,
            EssaySummary = essaySummary,
            ReviewNote = levels != null ? assessment!.ReviewNote : null,
            MentorName = await _reader.UserNameAsync(trial.MentorUserId),
        };
    }
}
