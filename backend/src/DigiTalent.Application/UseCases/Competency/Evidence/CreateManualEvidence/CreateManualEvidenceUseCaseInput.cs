namespace DigiTalent.Application.UseCases.Competency;

public class CreateManualEvidenceUseCaseInput
{
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }

    /// <summary>1 = Basic, 2 = Intermediate, 3 = Advanced.</summary>
    public short ConfirmedLevel { get; set; }

    /// <summary>Căn cứ ghi nhận (bắt buộc) — lưu vào competency_evidences.review_note và audit log.</summary>
    public string ReviewNote { get; set; } = string.Empty;
}
