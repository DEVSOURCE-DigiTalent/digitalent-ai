using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/practice — mục "Thực hành": bài cuối của mọi khóa nhân viên đang/đã học, việc cần làm trước
/// (nộp được, nộp lại, chờ chấm, cần hỗ trợ, đã duyệt), và các bài đánh giá trước khi học đã nộp.
/// Nhiệm vụ thực tế là nhánh riêng (GET /me/tasks).
/// </summary>
public class GetPulsePracticeUseCase : IUseCase<GetPulsePracticeUseCaseInput, GetPulsePracticeUseCaseOutput>
{
    private static readonly string[] StatusOrder =
    {
        PulseFinalStatus.RetryReady, PulseFinalStatus.Ready, PulseFinalStatus.Learning, PulseFinalStatus.RetryWait,
        PulseFinalStatus.Pending, PulseFinalStatus.DeadlineMissed, PulseFinalStatus.Flagged, PulseFinalStatus.Approved,
    };

    private readonly PulseLearnerReader _reader;

    public GetPulsePracticeUseCase(PulseLearnerReader reader)
    {
        _reader = reader;
    }

    public async Task<GetPulsePracticeUseCaseOutput> ExecuteAsync(GetPulsePracticeUseCaseInput input)
    {
        var snapshot = await _reader.LoadAsync();
        var finals = snapshot.Courses
            // Suất đang giữ (chưa đủ điều kiện học) nằm ở Lộ trình, không phải việc cần làm ở Thực hành.
            .Where(c => c.Enrollment != null && (c.CanWork || c.Approved || c.Submissions.Count > 0))
            .OrderBy(c => Rank(c.FinalStatus))
            .ThenBy(c => c.Domain.Number).ThenBy(c => c.Course.Tier)
            .Select(c =>
            {
                var last = c.Submissions.OrderBy(s => s.AttemptNo).LastOrDefault();
                var first = c.Submissions.FirstOrDefault(s => s.AttemptNo == 1);
                return new PulsePracticeItemDto
                {
                    Course = PulseMapping.Course(c),
                    LastSubmittedAt = last?.SubmittedAt,
                    LastDecision = last?.Decision,
                    LastDecisionReason = last?.DecisionReason,
                    LastReviewedAt = last?.ReviewedAt,
                    RetryOpensAt = first?.RetryOpensAt,
                    RetryDueAt = first?.RetryDueAt,
                    SupportAction = last?.SupportAction,
                };
            })
            .ToList();

        var preAssessments = snapshot.Courses
            .Where(c => c.PreAssessment != null)
            .OrderBy(c => c.PreAssessment!.Decision == null ? 0 : 1)
            .ThenByDescending(c => c.PreAssessment!.SubmittedAt)
            .Select(c => new PulsePracticeItemDto
            {
                Course = PulseMapping.Course(c),
                LastSubmittedAt = c.PreAssessment!.SubmittedAt,
                LastDecision = c.PreAssessment.Decision,
                LastDecisionReason = c.PreAssessment.DecisionReason,
                LastReviewedAt = c.PreAssessment.ReviewedAt,
            })
            .ToList();

        return new GetPulsePracticeUseCaseOutput { Finals = finals, PreAssessments = preAssessments, Criteria = PulseRules.FinalCriteria.ToList() };
    }

    private static int Rank(string status)
    {
        var index = Array.IndexOf(StatusOrder, status);
        return index < 0 ? StatusOrder.Length : index;
    }
}
