namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class CreateJobPositionUseCaseInput
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? JobFamilyId { get; set; }
    public Guid? DepartmentId { get; set; } // ignored: positions are shared by every department (kept for older clients)
    public string? JobGrade { get; set; }   // G1 | G2 | G3 (optional)
}

public class CreateJobPositionUseCaseOutput
{
    public Guid Id { get; set; }
}
