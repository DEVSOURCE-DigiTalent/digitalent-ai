using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// PUT /mentor/trials/{organizationId}/assessments/{assessmentId} — mentor chấm một bài: điểm ba bài tự luận, mức của mọi
/// lĩnh vực và nhận xét.
/// Chấm lại được tới khi công bố kết quả.
/// </summary>
public class ReviewTrialAssessmentUseCase : IUseCase<ReviewTrialAssessmentUseCaseInput, ReviewTrialAssessmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public ReviewTrialAssessmentUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<ReviewTrialAssessmentUseCaseOutput> ExecuteAsync(ReviewTrialAssessmentUseCaseInput input)
    {
        var trial = await _reader.ForMentorAsync(input.OrganizationId);
        if (trial.ReportPublishedAt != null)
        {
            throw new BadRequestException("Kết quả đã được công bố, không chấm lại.", "levels", "TRIAL_REPORTED");
        }

        if (input.EssayScores.Count != TrialProgramRules.Essays.Count
            || input.EssayScores.Any(s => s is < 0 or > TrialProgramRules.EssayMaxScore))
        {
            throw new BadRequestException("Cho điểm 0–10 cả ba bài tự luận.", "essayScores", "TRIAL_ESSAY_SCORES_INCOMPLETE");
        }

        var assessment = await _context.TrialAssessments
                             .FirstOrDefaultAsync(a => a.Id == input.AssessmentId && a.OrganizationId == trial.OrganizationId)
                         ?? throw new NotFoundException("Không tìm thấy bài làm.");
        var domains = await _context.TrialAssessmentDomains.Where(d => d.TrialAssessmentId == assessment.Id).ToListAsync();
        var levels = input.Levels.GroupBy(l => l.CategoryId).ToDictionary(g => g.Key, g => g.Last().Level);
        if (domains.Any(d => !levels.ContainsKey(d.CategoryId)) || levels.Keys.Any(id => domains.All(d => d.CategoryId != id)))
        {
            throw new BadRequestException("Chọn mức cho đủ các lĩnh vực của bài.", "levels", "TRIAL_LEVELS_INCOMPLETE");
        }

        var now = _reader.Now;
        foreach (var domain in domains)
        {
            domain.MentorLevel = (short)levels[domain.CategoryId];
        }

        assessment.EssayBasicScore = (short)input.EssayScores[0];
        assessment.EssayIntermediateScore = (short)input.EssayScores[1];
        assessment.EssayAdvancedScore = (short)input.EssayScores[2];
        assessment.ReviewNote = string.IsNullOrWhiteSpace(input.Note) ? null : input.Note.Trim();
        assessment.ReviewedByUserId = _reader.UserId;
        assessment.ReviewedAt = now;
        await _context.SaveChangesAsync();

        return new ReviewTrialAssessmentUseCaseOutput { AssessmentId = assessment.Id, ReviewedAt = now };
    }
}
