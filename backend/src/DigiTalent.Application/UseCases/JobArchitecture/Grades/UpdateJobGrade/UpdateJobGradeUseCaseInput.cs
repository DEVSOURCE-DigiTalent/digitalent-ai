using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

public class UpdateJobGradeUseCaseInput
{
    // Code comes from the URL (PUT api/v1/job-grades/{code})
    [JsonIgnore]
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
