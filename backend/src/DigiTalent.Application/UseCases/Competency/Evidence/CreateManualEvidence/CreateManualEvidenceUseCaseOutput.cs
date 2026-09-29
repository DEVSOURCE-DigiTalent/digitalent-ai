namespace DigiTalent.Application.UseCases.Competency;

public class CreateManualEvidenceUseCaseOutput
{
    public Guid EvidenceId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid CompetencyId { get; set; }
    public short? PreviousLevel { get; set; }
    public short ConfirmedLevel { get; set; }
    public Guid? SupersededEvidenceId { get; set; }
}
