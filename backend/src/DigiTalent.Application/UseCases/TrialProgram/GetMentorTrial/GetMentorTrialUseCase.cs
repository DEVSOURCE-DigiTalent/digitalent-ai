using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// GET /mentor/trials/{organizationId} — mentor được phân công xem nhân viên tham gia và từng bài đã nộp: bản ghi phòng thi
/// (kèm điểm rủi ro gian lận), trắc nghiệm theo lĩnh vực × cấp, ba bài tự luận (điểm đã cho, gợi ý của AI), mức gợi ý và
/// mức đã chấm.
/// </summary>
public class GetMentorTrialUseCase : IUseCase<GetMentorTrialUseCaseInput, GetMentorTrialUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly PulseExamPaper _paper;
    private readonly PulseRecordingReader _recordings;
    private readonly IGeminiService _ai;

    public GetMentorTrialUseCase(
        IApplicationDbContext context,
        TrialProgramReader reader,
        PulseExamPaper paper,
        PulseRecordingReader recordings,
        IGeminiService ai)
    {
        _context = context;
        _reader = reader;
        _paper = paper;
        _recordings = recordings;
        _ai = ai;
    }

    public async Task<GetMentorTrialUseCaseOutput> ExecuteAsync(GetMentorTrialUseCaseInput input)
    {
        var trial = await _reader.ForMentorAsync(input.OrganizationId);
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var participants = await _reader.LoadParticipantsAsync(trial);

        var assessments = await _context.TrialAssessments.AsNoTracking()
            .Where(a => a.OrganizationId == trial.OrganizationId)
            .OrderBy(a => a.SubmittedAt)
            .ToListAsync();
        var ids = assessments.Select(a => a.Id).ToList();
        var results = await _reader.LoadDomainResultsAsync(ids);
        var items = await _paper.LoadItemsAsync(ids);
        var recordings = await _recordings.LoadAsync(assessments.Select(a => a.ProctoringSessionId).ToList());
        var people = participants.Where(p => p.EmployeeId.HasValue).ToDictionary(p => p.EmployeeId!.Value);

        return new GetMentorTrialUseCaseOutput
        {
            OrganizationId = trial.OrganizationId,
            OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
            Stage = TrialProgramRules.StageOf(trial),
            TestDeadline = trial.TestDeadline,
            PreferredReviewAt = trial.PreferredReviewAt,
            RequestNote = trial.RequestNote,
            ReportPublishedAt = trial.ReportPublishedAt,
            Domains = domains.Select(TrialDomainDto.From).ToList(),
            Participants = participants,
            CanPublish = trial.ReportPublishedAt == null && assessments.Count > 0 && assessments.All(a => a.ReviewedAt != null),
            AiAvailable = _ai.IsConfigured,
            Assessments = assessments.Select(a =>
            {
                var person = people.GetValueOrDefault(a.EmployeeId);
                var byCategory = (results.GetValueOrDefault(a.Id) ?? new()).ToDictionary(r => r.CategoryId);
                return new MentorAssessmentDto
                {
                    AssessmentId = a.Id,
                    EmployeeId = a.EmployeeId,
                    FullName = person?.FullName ?? string.Empty,
                    DepartmentName = person?.DepartmentName,
                    PositionName = person?.PositionName,
                    SubmittedAt = a.SubmittedAt,
                    ReviewedAt = a.ReviewedAt,
                    ReviewNote = a.ReviewNote,
                    ChoiceScore = a.ChoiceScore,
                    ChoiceTotal = a.ChoiceTotal,
                    Domains = domains.Where(d => byCategory.ContainsKey(d.CategoryId)).Select(d =>
                    {
                        var r = byCategory[d.CategoryId];
                        return new MentorDomainResultDto
                        {
                            CategoryId = d.CategoryId,
                            Number = d.Number,
                            Name = d.Name,
                            Correct = new List<int> { r.BasicCorrect, r.IntermediateCorrect, r.AdvancedCorrect },
                            Total = new List<int> { r.BasicTotal, r.IntermediateTotal, r.AdvancedTotal },
                            SuggestedLevel = r.SuggestedLevel,
                            MentorLevel = r.MentorLevel,
                        };
                    }).ToList(),
                    Essays = TrialProgramRules.Essays.Select(e => new MentorEssayDto
                    {
                        Tier = e.Tier,
                        Title = e.Title,
                        Prompt = e.Prompt,
                        Text = e.Tier switch { 1 => a.EssayBasic, 2 => a.EssayIntermediate, _ => a.EssayAdvanced },
                        Score = (e.Tier switch { 1 => a.EssayBasicScore, 2 => a.EssayIntermediateScore, _ => a.EssayAdvancedScore }) is { } score
                            ? score
                            : null,
                    }).ToList(),
                    ChoiceItems = items.GetValueOrDefault(a.Id) ?? new(),
                    Recording = recordings.GetValueOrDefault(a.ProctoringSessionId),
                    AiReview = TrialEssayAiReviewDto.FromJson(a.AiEssayReview),
                };
            }).ToList(),
        };
    }
}
