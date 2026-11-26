namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class GetOrganizationCatalogVersionUseCaseInput
{
    public Guid OrganizationId { get; set; }

    /// <summary>Version to compare with; null = the newest published version.</summary>
    public int? VersionNo { get; set; }
}
