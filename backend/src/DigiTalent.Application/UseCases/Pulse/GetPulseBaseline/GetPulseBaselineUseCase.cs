using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// GET /me/pulse/baseline — bài kiểm tra đầu vào (§7.1). Chưa làm: trả câu hỏi tình huống theo đúng mục tiêu vị trí
/// (không kèm đáp án). Đã làm: trả mức đầu vào từng lĩnh vực.
/// </summary>
public class GetPulseBaselineUseCase : IUseCase<GetPulseBaselineUseCaseInput, GetPulseBaselineUseCaseOutput>
{
    public const string NoTargets = "NO_TARGETS";
    public const string NoQuestions = "NO_QUESTIONS";

    private readonly PulseLearnerReader _learner;
    private readonly PulseBaselineReader _questions;

    public GetPulseBaselineUseCase(PulseLearnerReader learner, PulseBaselineReader questions)
    {
        _learner = learner;
        _questions = questions;
    }

    public async Task<GetPulseBaselineUseCaseOutput> ExecuteAsync(GetPulseBaselineUseCaseInput input)
    {
        var snapshot = await _learner.LoadAsync();
        var output = new GetPulseBaselineUseCaseOutput
        {
            Person = PulseMapping.Person(snapshot),
            Assessed = snapshot.Assessed,
            AssessedAt = snapshot.AssessedAt,
        };
        var targetDomains = snapshot.Domains.Where(d => d.Target > 0).ToList();

        if (snapshot.Assessed)
        {
            output.Domains = targetDomains.Select(d => Domain(d, d.Baseline ?? 0)).ToList();
            return output;
        }

        if (!snapshot.HasPosition)
        {
            output.BlockReason = PulseBlockReason.NoPosition;
            return output;
        }

        if (targetDomains.Count == 0)
        {
            output.BlockReason = NoTargets;
            return output;
        }

        var questions = await _questions.LoadAsync(snapshot.Employee.OrganizationId, targetDomains.ToDictionary(d => d.CategoryId, d => d.Target));
        output.Domains = targetDomains.Select(d =>
        {
            var dto = Domain(d, null);
            dto.Questions = questions[d.CategoryId].Select(q => new PulseBaselineQuestionDto
            {
                QuestionId = q.QuestionId,
                Level = q.Level,
                Content = q.Content,
                Options = q.Options.Select(o => new PulseOptionDto { OptionId = o.OptionId, Content = o.Content }).ToList(),
            }).ToList();
            return dto;
        }).ToList();
        if (output.Domains.All(d => d.Questions.Count == 0))
        {
            output.BlockReason = NoQuestions;
        }

        return output;
    }

    private static PulseBaselineDomainDto Domain(PulseDomainState d, int? baseline) => new()
    {
        CategoryId = d.CategoryId,
        Number = d.Number,
        Name = d.Name,
        Target = d.Target,
        Baseline = baseline,
    };
}
