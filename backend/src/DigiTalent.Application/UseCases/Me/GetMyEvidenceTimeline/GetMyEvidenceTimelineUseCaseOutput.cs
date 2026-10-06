namespace DigiTalent.Application.UseCases.Me;

public class GetMyEvidenceTimelineUseCaseOutput
{
    public List<MyEvidenceItemDto> Items { get; set; } = new();
    public MyEvidenceCountsDto Counts { get; set; } = new();
}

public class MyEvidenceCountsDto
{
    public int Total { get; set; }
    public int Approved { get; set; }
    public int Pending { get; set; }
    public int NeedsRevision { get; set; }
    public int Rejected { get; set; }
}

public class MyEvidenceItemDto
{
    public Guid Id { get; set; }

    /// <summary>TASK_SUBMISSION (bài nộp nhiệm vụ) | COMPETENCY_EVIDENCE (minh chứng năng lực đã ghi nhận)</summary>
    public string Kind { get; set; } = string.Empty;

    public DateTimeOffset OccurredAt { get; set; }
    public string Title { get; set; } = string.Empty;

    /// <summary>APPROVED | PENDING | NEEDS_REVISION | REJECTED | SUPERSEDED</summary>
    public string Status { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Bài nộp nhiệm vụ
    public Guid? AssignmentId { get; set; }
    public int? VersionNo { get; set; }
    public List<string> Links { get; set; } = new();
    public List<MyTaskFileDto> Files { get; set; } = new();
    public MyTaskEvaluationDto? Evaluation { get; set; }

    // Minh chứng năng lực
    /// <summary>PRACTICAL_TASK | MANUAL_OVERRIDE | MIGRATION</summary>
    public string? SourceType { get; set; }

    public short? ConfirmedLevel { get; set; }
    public decimal? Score { get; set; }
    public string? ConfirmedByName { get; set; }

    public List<MyCompetencyRefDto> Competencies { get; set; } = new();
}
