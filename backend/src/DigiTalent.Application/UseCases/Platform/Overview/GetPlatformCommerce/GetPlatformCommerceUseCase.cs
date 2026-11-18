using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Models;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Overview;

public class GetPlatformCommerceUseCase : IUseCase<GetPlatformCommerceUseCaseInput, GetPlatformCommerceUseCaseOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformCommerceUseCase(IApplicationDbContext context) => _context = context;

    public async Task<GetPlatformCommerceUseCaseOutput> ExecuteAsync(GetPlatformCommerceUseCaseInput input)
    {
        var courses = await PlatformCatalogReader.ReadCoursesAsync(_context);
        var orders = PlatformCatalogReader.QueryOrders(_context);
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            orders = orders.Where(o => o.OrganizationName.ToLower().Contains(search) || o.CourseTitle.ToLower().Contains(search));
        }

        return new GetPlatformCommerceUseCaseOutput
        {
            Courses = courses,
            PurchaseCount = courses.Sum(c => c.PurchaseCount),
            BuyerCount = await _context.CourseOrders.AsNoTracking().Select(o => o.OrganizationId).Distinct().CountAsync(),
            Revenue = courses.Sum(c => c.Revenue),
            Orders = new PagedList<PlatformCourseOrderItem>
            {
                TotalItems = await orders.CountAsync(),
                Items = await orders.Skip((input.PageIndex - 1) * input.PageSize).Take(input.PageSize).ToListAsync(),
                PageIndex = input.PageIndex,
                PageSize = input.PageSize,
            },
        };
    }
}
