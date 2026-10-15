using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class GrantPlatformCourseSeatsUseCaseInput
{
    [JsonIgnore]
    public Guid OrganizationId { get; set; }

    public string CourseCode { get; set; } = string.Empty;
    public int Seats { get; set; } = 1;
    public string Reason { get; set; } = string.Empty;
}
