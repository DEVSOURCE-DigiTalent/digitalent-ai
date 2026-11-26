namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class ApplyOrganizationCatalogVersionUseCaseInput
{
    public Guid OrganizationId { get; set; }

    /// <summary>Published version to apply (newer or older than the one in use).</summary>
    public int VersionNo { get; set; }

    /// <summary>Why; required (≥ 10 characters) when going back to an older version.</summary>
    public string? Reason { get; set; }
}
