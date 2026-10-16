using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourseSeats;

public class PurchaseCourseSeatsInput
{
    public Guid CourseId { get; set; }
    public int Seats { get; set; }
    public string? Note { get; set; }
}

public class PurchaseCourseSeatsOutput
{
    public Guid OrderId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int Seats { get; set; }
    public long UnitPrice { get; set; }
    public long TotalAmount { get; set; }
    public int TotalSeatsPurchased { get; set; }
    public int TotalSeatsAvailable { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class PurchaseCourseSeatsUseCase : IUseCase<PurchaseCourseSeatsInput, PurchaseCourseSeatsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public PurchaseCourseSeatsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PurchaseCourseSeatsOutput> ExecuteAsync(PurchaseCourseSeatsInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId;

        if (input.Seats <= 0)
        {
            throw new BadRequestException("Số lượng suất học phải lớn hơn 0.");
        }

        var course = await _context.Courses.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == input.CourseId && c.OrganizationId == organizationId)
            ?? throw new NotFoundException($"Course '{input.CourseId}' not found.");

        if (course.Code.EndsWith("-F", StringComparison.OrdinalIgnoreCase))
        {
            throw new BadRequestException("Khóa học Cơ bản được mở miễn phí toàn bộ trong gói dùng thử, không cần mua suất.");
        }

        var platformCourse = await _context.PlatformCourses.AsNoTracking()
            .FirstOrDefaultAsync(pc => pc.Code == course.Code)
            ?? throw new NotFoundException($"Khóa học chuẩn '{course.Code}' chưa được niêm yết trên nền tảng.");

        var unitPrice = platformCourse.PricePerSeat > 0
            ? platformCourse.PricePerSeat
            : (platformCourse.Level == 3 ? 699000L : 399000L);
        var totalAmount = (long)input.Seats * unitPrice;

        var order = new CourseSeatOrder
        {
            OrganizationId = organizationId,
            CourseId = platformCourse.Id,
            Seats = input.Seats,
            Kind = PlatformCatalog.SeatOrderKind.Purchase,
            UnitPrice = unitPrice,
            TotalAmount = totalAmount,
            Reason = string.IsNullOrWhiteSpace(input.Note) ? "Doanh nghiệp đăng ký mua suất học" : input.Note.Trim(),
            CreatedByUserId = userId,
        };

        _context.CourseSeatOrders.Add(order);
        await _context.SaveChangesAsync();

        var totalPurchased = await (
            from o in _context.CourseSeatOrders.AsNoTracking()
            where o.OrganizationId == organizationId && o.CourseId == platformCourse.Id
            select o.Seats
        ).SumAsync();

        var versionIds = await _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.Code == course.Code)
            .Select(c => c.Id).ToListAsync();
        var assignedCount = await _context.CourseAssignments.AsNoTracking()
            .Where(ca => versionIds.Contains(ca.CourseId) && ca.Status == Statuses.CourseAssignment.Active)
            .Select(ca => ca.EmployeeId).Distinct().CountAsync();

        return new PurchaseCourseSeatsOutput
        {
            OrderId = order.Id,
            CourseCode = course.Code,
            CourseTitle = course.Title,
            Seats = input.Seats,
            UnitPrice = unitPrice,
            TotalAmount = totalAmount,
            TotalSeatsPurchased = totalPurchased,
            TotalSeatsAvailable = Math.Max(0, totalPurchased - assignedCount),
            CreatedAt = order.CreatedAt,
        };
    }
}
