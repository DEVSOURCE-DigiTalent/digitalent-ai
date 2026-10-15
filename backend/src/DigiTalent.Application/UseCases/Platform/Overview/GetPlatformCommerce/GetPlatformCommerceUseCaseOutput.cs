using DigiTalent.Application.Common.Models;
using DigiTalent.Application.UseCases.Platform.Common;

namespace DigiTalent.Application.UseCases.Platform.Overview;

/// <summary>
/// Platform Admin / Đơn hàng và giá: price list of the 18 courses with seat totals, plus the paged order history.
/// </summary>
public class GetPlatformCommerceUseCaseOutput
{
    public List<PlatformCourseItem> Courses { get; set; } = new();
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
    public long Revenue { get; set; }
    public PagedList<PlatformSeatOrderItem> Orders { get; set; } = new();
}
