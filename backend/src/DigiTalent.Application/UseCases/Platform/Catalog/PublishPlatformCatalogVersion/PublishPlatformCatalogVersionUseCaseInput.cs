namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class PublishPlatformCatalogVersionUseCaseInput
{
    public int VersionNo { get; set; }
    public string? ReleaseNote { get; set; }

    /// <summary>
    /// True: every organization moves to this version now (a fix), including organizations still on an older one.
    /// False: organizations keep the version they learn from until the admin applies a newer one to them; organizations
    /// that register later get this version.
    /// </summary>
    public bool ApplyToAllOrganizations { get; set; } = true;
}
