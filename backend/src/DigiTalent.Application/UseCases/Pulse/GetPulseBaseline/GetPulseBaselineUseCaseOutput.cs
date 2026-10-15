namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseBaselineUseCaseOutput
{
    public PulsePersonDto Person { get; set; } = new();
    public bool Assessed { get; set; }
    public DateTimeOffset? AssessedAt { get; set; }
    /// <summary>NO_POSITION | NO_TARGETS | NO_QUESTIONS | null (làm được bài).</summary>
    public string? BlockReason { get; set; }
    public List<PulseBaselineDomainDto> Domains { get; set; } = new();
}

public class PulseBaselineDomainDto
{
    public Guid CategoryId { get; set; }
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Target { get; set; }
    /// <summary>Mức đầu vào đã ghi nhận (chỉ khi đã làm bài).</summary>
    public int? Baseline { get; set; }
    /// <summary>Câu hỏi L1..mục tiêu (chỉ khi chưa làm bài). Không kèm đáp án đúng.</summary>
    public List<PulseBaselineQuestionDto> Questions { get; set; } = new();
}

public class PulseBaselineQuestionDto
{
    public Guid QuestionId { get; set; }
    public int Level { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<PulseOptionDto> Options { get; set; } = new();
}

public class PulseOptionDto
{
    public Guid OptionId { get; set; }
    public string Content { get; set; } = string.Empty;
}
