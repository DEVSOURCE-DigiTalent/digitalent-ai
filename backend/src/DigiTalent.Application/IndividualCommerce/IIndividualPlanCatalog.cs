namespace DigiTalent.Application.IndividualCommerce;

public interface IIndividualPlanCatalog
{
    IndividualPlanCatalogDto GetCatalog();
    IndividualPlanDto? GetPlan(string planCode);
    bool TryGetPrice(string planCode, string cycle, out long amount, out string pricingVersion);
}
