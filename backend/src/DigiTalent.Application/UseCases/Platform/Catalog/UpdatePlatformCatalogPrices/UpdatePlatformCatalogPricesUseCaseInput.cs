namespace DigiTalent.Application.UseCases.Platform.Catalog;

public class UpdatePlatformCatalogPricesUseCaseInput
{
    public int VersionNo { get; set; }
    public List<PlatformCoursePriceInput> Items { get; set; } = new();
}

public class PlatformCoursePriceInput
{
    public Guid CourseId { get; set; }
    public long Price { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
}
