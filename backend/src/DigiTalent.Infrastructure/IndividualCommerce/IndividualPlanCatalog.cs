using DigiTalent.Application.IndividualCommerce;

namespace DigiTalent.Infrastructure.IndividualCommerce;

public class IndividualPlanCatalog : IIndividualPlanCatalog
{
    public const string CurrentPricingVersion = "2026-10-01";
    public const string DefaultCurrency = "VND";

    private static readonly IReadOnlyList<IndividualPlanDto> AvailablePlans = new List<IndividualPlanDto>
    {
        new(
            Code: "IND_FREE",
            Name: "Miễn phí",
            Description: "Trải nghiệm cơ bản sau khi kết thúc dùng thử",
            Purchasable: false,
            Recommended: false,
            Prices: Array.Empty<IndividualPlanPriceDto>(),
            Entitlements: new[] { "personal_profile", "assessment_history" },
            Highlights: new[] { "Lưu trữ lộ trình & kết quả đánh giá", "Xem tổng quan khóa học" }
        ),
        new(
            Code: "IND_PLUS",
            Name: "Cá nhân Plus",
            Description: "Phù hợp cho cá nhân muốn nâng cao năng lực và học tập chuyên sâu",
            Purchasable: true,
            Recommended: true,
            Prices: new[]
            {
                new IndividualPlanPriceDto("MONTH", 149000),
                new IndividualPlanPriceDto("YEAR", 1190000)
            },
            Entitlements: new[]
            {
                "personal_learning_path",
                "unlimited_course_access",
                "ai_skill_gap_analysis",
                "course_certificates"
            },
            Highlights: new[]
            {
                "Không giới hạn số khóa học",
                "Đánh giá & phân tích khoảng cách năng lực bằng AI",
                "Cấp chứng chỉ hoàn thành khóa học",
                "Hỗ trợ học tập cá nhân hóa"
            }
        ),
        new(
            Code: "IND_PRO",
            Name: "Cá nhân Pro",
            Description: "Dành cho chuyên gia và cá nhân hướng tới thăng tiến sự nghiệp vượt bậc",
            Purchasable: true,
            Recommended: false,
            Prices: new[]
            {
                new IndividualPlanPriceDto("MONTH", 299000),
                new IndividualPlanPriceDto("YEAR", 2390000)
            },
            Entitlements: new[]
            {
                "personal_learning_path",
                "unlimited_course_access",
                "ai_skill_gap_analysis",
                "course_certificates",
                "priority_ai_mentoring",
                "advanced_portfolio_review"
            },
            Highlights: new[]
            {
                "Toàn bộ quyền lợi gói Plus",
                "AI Mentoring 1-on-1 theo thời gian thực",
                "Đánh giá portfolio & chuẩn hóa CV theo khung năng lực",
                "Ưu tiên hỗ trợ kỹ thuật và nội dung mới sớm nhất"
            }
        )
    };

    public IndividualPlanCatalogDto GetCatalog()
    {
        return new IndividualPlanCatalogDto(
            PricingVersion: CurrentPricingVersion,
            Currency: DefaultCurrency,
            Plans: AvailablePlans
        );
    }

    public IndividualPlanDto? GetPlan(string planCode)
    {
        return AvailablePlans.FirstOrDefault(p => string.Equals(p.Code, planCode, StringComparison.OrdinalIgnoreCase));
    }

    public bool TryGetPrice(string planCode, string cycle, out long amount, out string pricingVersion)
    {
        pricingVersion = CurrentPricingVersion;
        amount = 0;

        var plan = GetPlan(planCode);
        if (plan == null || !plan.Purchasable)
        {
            return false;
        }

        var price = plan.Prices.FirstOrDefault(p => string.Equals(p.Cycle, cycle, StringComparison.OrdinalIgnoreCase));
        if (price == null)
        {
            return false;
        }

        amount = price.Amount;
        return true;
    }
}
