using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Infrastructure.IndividualCommerce;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace DigiTalent.Tests.IndividualCommerce;

public sealed class IndividualCatalogAndPaymentTests
{
    [Fact]
    public void IndividualPlanCatalog_ReturnsAuthoritativeCatalogAndPricing()
    {
        var catalog = new IndividualPlanCatalog();
        var catalogDto = catalog.GetCatalog();

        Assert.Equal("2026-10-01", catalogDto.PricingVersion);
        Assert.Equal("VND", catalogDto.Currency);

        var plusPlan = catalogDto.Plans.Single(p => p.Code == "IND_PLUS");
        Assert.True(plusPlan.Purchasable);
        Assert.True(plusPlan.Recommended);

        var monthPrice = plusPlan.Prices.Single(p => p.Cycle == "MONTH");
        Assert.Equal(149000, monthPrice.Amount);

        var yearPrice = plusPlan.Prices.Single(p => p.Cycle == "YEAR");
        Assert.Equal(1190000, yearPrice.Amount);

        var proPlan = catalogDto.Plans.Single(p => p.Code == "IND_PRO");
        var proMonth = proPlan.Prices.Single(p => p.Cycle == "MONTH");
        Assert.Equal(299000, proMonth.Amount);

        var proYear = proPlan.Prices.Single(p => p.Cycle == "YEAR");
        Assert.Equal(2390000, proYear.Amount);

        // TryGetPrice
        Assert.True(catalog.TryGetPrice("IND_PLUS", "MONTH", out var price, out var ver));
        Assert.Equal(149000, price);
        Assert.Equal("2026-10-01", ver);

        Assert.False(catalog.TryGetPrice("IND_FREE", "MONTH", out _, out _));
        Assert.False(catalog.TryGetPrice("IND_PLUS", "INVALID_CYCLE", out _, out _));
    }

    [Fact]
    public void PayOSService_VerifySignature_AccuratelyValidatesPayload()
    {
        var options = Options.Create(new IndividualCommerceOptions
        {
            PayOS = new PayOSOptions
            {
                ChecksumKey = "b21cf331acf43b34b5ba29ce52694e34c721f7cbbdb97d219d98c26f7bd3ef05"
            }
        });

        var service = new PayOSService(new HttpClient(), options, NullLogger<PayOSService>.Instance);

        // Reject random or empty signature
        Assert.False(service.VerifyWebhookSignature("{}", ""));
        Assert.False(service.VerifyWebhookSignature("", "fake_signature"));
    }
}
