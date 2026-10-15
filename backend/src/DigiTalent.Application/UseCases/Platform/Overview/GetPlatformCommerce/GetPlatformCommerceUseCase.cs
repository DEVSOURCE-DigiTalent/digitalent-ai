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
        if (!string.IsNullOrWhiteSpace(input.Kind)) orders = orders.Where(o => o.Kind == input.Kind.Trim().ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            orders = orders.Where(o => o.OrganizationName.ToLower().Contains(search) || o.CourseTitle.ToLower().Contains(search));
        }

        return new GetPlatformCommerceUseCaseOutput
        {
            Courses = courses,
            SeatsPurchased = courses.Sum(c => c.SeatsPurchased),
            SeatsGranted = courses.Sum(c => c.SeatsGranted),
            Revenue = courses.Sum(c => c.Revenue),
            Orders = new PagedList<PlatformSeatOrderItem>
            {
                TotalItems = await orders.CountAsync(),
                Items = await orders.Skip((input.PageIndex - 1) * input.PageSize).Take(input.PageSize).ToListAsync(),
                PageIndex = input.PageIndex,
                PageSize = input.PageSize,
            },
        };
    }
}
