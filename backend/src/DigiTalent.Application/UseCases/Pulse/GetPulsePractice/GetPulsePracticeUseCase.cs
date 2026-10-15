using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/practice — mục "Thực hành": bài cuối của mọi khóa nhân viên đang/đã học, việc cần làm trước
/// (nộp được, nộp lại, chờ chấm, cần hỗ trợ, đã duyệt). Nhiệm vụ thực tế là nhánh riêng (GET /me/tasks).
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

        return new GetPulsePracticeUseCaseOutput { Finals = finals, Criteria = PulseRules.FinalCriteria.ToList() };
    }

    private static int Rank(string status)
    {
        var index = Array.IndexOf(StatusOrder, status);
        return index < 0 ? StatusOrder.Length : index;
    }
}
