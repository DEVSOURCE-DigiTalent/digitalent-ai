namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

public class GetSignGlossMotionsUseCaseInput
{
    public List<Guid> Ids { get; set; } = new();
    /// <summary>Learners only get PUBLISHED signs; the Platform Admin previews drafts too.</summary>
    public bool PublishedOnly { get; set; } = true;
}
