using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

public class UpdateJobPositionUseCaseInput
{
    // Id comes from the URL (PUT api/v1/job-positions/{id})
    [JsonIgnore]
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? JobFamilyId { get; set; }
    public Guid? DepartmentId { get; set; } // null = no owning department
    public string? JobGrade { get; set; }   // G1 | G2 | G3; null = not graded
    public string Status { get; set; } = string.Empty;
}

public class UpdateJobPositionUseCaseOutput
{
    public Guid Id { get; set; }
}
