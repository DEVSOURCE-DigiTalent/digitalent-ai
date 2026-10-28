using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /mentor/trials/{organizationId}/assessments/{assessmentId}/ai-review — AI (Gemini) đọc ba bài tự luận và gợi ý
/// điểm 0–10 + nhận xét cho mentor. Lưu lại để mở bài lần sau không gọi AI; mentor vẫn tự cho điểm khi chấm.
/// </summary>
public class ReviewTrialEssaysWithAiUseCase : IUseCase<ReviewTrialEssaysWithAiUseCaseInput, TrialEssayAiReviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly IGeminiService _ai;

    public ReviewTrialEssaysWithAiUseCase(IApplicationDbContext context, TrialProgramReader reader, IGeminiService ai)
    {
        _context = context;
        _reader = reader;
        _ai = ai;
    }

    public async Task<TrialEssayAiReviewDto> ExecuteAsync(ReviewTrialEssaysWithAiUseCaseInput input)
    {
        var trial = await _reader.ForMentorAsync(input.OrganizationId);
        if (trial.ReportPublishedAt != null)
        {
            throw new BadRequestException("Kết quả đã được công bố.", "assessment", "TRIAL_REPORTED");
        }

        if (!_ai.IsConfigured)
        {
            throw new BadRequestException("Chưa cấu hình khóa AI (Gemini).", "ai", "AI_NOT_CONFIGURED");
        }

        var assessment = await _context.TrialAssessments
                             .FirstOrDefaultAsync(a => a.Id == input.AssessmentId && a.OrganizationId == trial.OrganizationId)
                         ?? throw new NotFoundException("Không tìm thấy bài làm.");

        var essays = TrialProgramRules.Essays
            .Select(e => new TrialEssayAiInput(
                e.Tier,
                e.Title,
                e.Prompt,
                e.Tier switch { 1 => assessment.EssayBasic, 2 => assessment.EssayIntermediate, _ => assessment.EssayAdvanced }))
            .ToList();
        var review = await _ai.EvaluateTrialEssaysAsync(essays)
                     ?? throw new BadRequestException("AI chưa trả lời được, thử lại sau.", "ai", "AI_UNAVAILABLE");

        review.ReviewedAt = _reader.Now;
        assessment.AiEssayReview = review.ToJson();
        assessment.AiEssayReviewedAt = review.ReviewedAt;
        await _context.SaveChangesAsync();
        return review;
    }
}
