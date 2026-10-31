using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.TrialProgram;

public class AssignTrialMentorUseCaseInput
{
    [JsonIgnore]
    public Guid OrganizationId { get; set; }

    public Guid MentorUserId { get; set; }
}
