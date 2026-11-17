using DigiTalent.Application.Common.Models;
using DigiTalent.Application.UseCases.Platform.Common;

namespace DigiTalent.Application.UseCases.Platform.Overview;

/// <summary>
/// Platform Admin / Đơn hàng và giá: price list of the courses with purchase counts, plus the paged order history.
/// </summary>
public class GetPlatformCommerceUseCaseOutput
{
    public List<PlatformCourseItem> Courses { get; set; } = new();
    /// <summary>Course purchases (one organization buying one course).</summary>
    public int PurchaseCount { get; set; }
    /// <summary>Organizations that bought at least one course.</summary>
    public int BuyerCount { get; set; }
    public long Revenue { get; set; }
    public PagedList<PlatformCourseOrderItem> Orders { get; set; } = new();
}
