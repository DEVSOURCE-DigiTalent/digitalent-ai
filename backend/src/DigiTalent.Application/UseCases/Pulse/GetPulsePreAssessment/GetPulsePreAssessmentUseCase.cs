using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/courses/{courseId}/pre-assessment — bài đánh giá trước khi học của một khóa: đề và ba tiêu chí như bài
/// cuối khóa, trạng thái (cần làm / chờ chấm / đạt / chưa đạt / chưa mở), bài đã nộp và nhận xét của người chấm.
/// </summary>
public class GetPulsePreAssessmentUseCase : IUseCase<GetPulsePreAssessmentUseCaseInput, GetPulsePreAssessmentUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseCourseWorkspace _workspace;

    public GetPulsePreAssessmentUseCase(IApplicationDbContext context, PulseCourseWorkspace workspace)
    {
        _context = context;
        _workspace = workspace;
    }

    public async Task<GetPulsePreAssessmentUseCaseOutput> ExecuteAsync(GetPulsePreAssessmentUseCaseInput input)
    {
        var (snapshot, state) = await _workspace.ResolveAsync(input.CourseId);
        var pre = state.PreAssessment;
        string? reviewerName = null;
        if (pre?.ReviewedByUserId is { } reviewerId)
        {
            reviewerName = await _context.Users.AsNoTracking().Where(u => u.Id == reviewerId).Select(u => u.DisplayName).FirstOrDefaultAsync();
        }

        return new GetPulsePreAssessmentUseCaseOutput
        {
            Course = PulseMapping.Course(state),
            Domain = PulseMapping.Domain(state.Domain),
            PositionName = snapshot.PositionName,
            Reviewer = PulseMapping.Reviewer(snapshot),
            Criteria = PulseRules.FinalCriteria.ToList(),
            Status = state.PreStatus,
            CanStart = state.CanStartPreAssessment,
            ClosedMessage = state.CanStartPreAssessment ? null : PulseCourseWorkspace.PreAssessmentClosedMessage(state),
            Submission = pre == null ? null : new PulsePreAssessmentSubmissionDto
            {
                PreAssessmentId = pre.Id,
                EvidenceText = pre.EvidenceText,
                SubmittedAt = pre.SubmittedAt,
                Decision = pre.Decision,
                DecisionReason = pre.DecisionReason,
                ReviewerName = reviewerName,
                ReviewedAt = pre.ReviewedAt,
                ProctoringSessionId = pre.ProctoringSessionId,
            },
        };
    }
}
