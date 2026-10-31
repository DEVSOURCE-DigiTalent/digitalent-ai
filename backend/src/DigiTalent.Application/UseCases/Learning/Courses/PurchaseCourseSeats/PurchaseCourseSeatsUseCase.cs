using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
    public string? CheckoutUrl { get; set; }
    public string? QrCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class PurchaseCourseSeatsUseCase : IUseCase<PurchaseCourseSeatsInput, PurchaseCourseSeatsOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPayOSService? _payOSService;
    private readonly ILogger<PurchaseCourseSeatsUseCase>? _logger;

    public PurchaseCourseSeatsUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPayOSService? payOSService = null,
        ILogger<PurchaseCourseSeatsUseCase>? logger = null)
    {
        _context = context;
        _currentUser = currentUser;
        _payOSService = payOSService;
        _logger = logger;
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

        // Chuẩn hóa mã tìm kiếm: hỗ trợ cả tiền tố M (M1..M6) và tiền tố di sản A (A1..A5)
        var rawCode = course.Code.Trim();
        var normalizedCode = rawCode.StartsWith("A", StringComparison.OrdinalIgnoreCase) && rawCode.Length > 2 && char.IsDigit(rawCode[1])
            ? "M" + rawCode[1..]
            : rawCode;
        var legacyCode = normalizedCode.StartsWith("M", StringComparison.OrdinalIgnoreCase) && normalizedCode.Length > 2 && char.IsDigit(normalizedCode[1])
            ? "A" + normalizedCode[1..]
            : normalizedCode;

        var platformCourse = await _context.PlatformCourses.AsNoTracking()
            .FirstOrDefaultAsync(pc => pc.Code == rawCode || pc.Code == normalizedCode || pc.Code == legacyCode)
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

        // 1. Tự động nâng trần năng lực của doanh nghiệp ứng với khóa học vừa mua (nếu cấp độ cao hơn)
        try
        {
            var categoryId = await (
                from cc in _context.CourseCompetencies.AsNoTracking()
                join comp in _context.Competencies.AsNoTracking() on cc.CompetencyId equals comp.Id
                where cc.CourseId == course.Id
                select comp.CategoryId
            ).FirstOrDefaultAsync();

            if (categoryId == Guid.Empty)
            {
                // Fallback: tìm category theo domain number từ mã khóa học chuẩn (ví dụ M1-I / A1-I -> Miền 1)
                var domainNum = normalizedCode.Length > 2 && char.IsDigit(normalizedCode[1])
                    ? int.Parse(normalizedCode[1].ToString())
                    : 0;
                if (domainNum > 0)
                {
                    categoryId = await _context.CompetencyCategories.AsNoTracking()
                        .Where(c => c.OrganizationId == organizationId && (c.SortOrder == domainNum || c.Code == $"TT02_D{domainNum}"))
                        .Select(c => c.Id)
                        .FirstOrDefaultAsync();
                }
            }

            if (categoryId != Guid.Empty)
            {
                var existingCeiling = await _context.CapabilityCeilings
                    .FirstOrDefaultAsync(c => c.OrganizationId == organizationId && c.DepartmentId == null && c.CompetencyCategoryId == categoryId);

                var targetCeilingLevel = (short)platformCourse.Level;
                if (existingCeiling == null)
                {
                    _context.CapabilityCeilings.Add(new CapabilityCeiling
                    {
                        OrganizationId = organizationId,
                        CompetencyCategoryId = categoryId,
                        CeilingLevel = targetCeilingLevel,
                        UpdatedByUserId = userId
                    });
                }
                else if (existingCeiling.CeilingLevel < targetCeilingLevel)
                {
                    existingCeiling.CeilingLevel = targetCeilingLevel;
                    existingCeiling.UpdatedByUserId = userId;
                }
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Failed to auto-elevate capability ceiling on seat purchase.");
        }

        // 2. Tạo liên kết thanh toán PayOS VietQR
        string? checkoutUrl = null;
        string? qrCode = null;
        if (_payOSService != null)
        {
            try
            {
                long orderCode = (DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 100000000) * 1000 + System.Security.Cryptography.RandomNumberGenerator.GetInt32(100, 999);
                var payResult = await _payOSService.CreatePaymentLinkAsync(
                    orderCode: orderCode,
                    amount: totalAmount,
                    description: $"DT {normalizedCode} {input.Seats}suat",
                    returnUrl: "http://localhost:5173/enterprise/courses",
                    cancelUrl: "http://localhost:5173/enterprise/courses"
                );
                checkoutUrl = payResult.CheckoutUrl;
                qrCode = payResult.QrCode;
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to create PayOS link for enterprise seat order.");
            }
        }

        var totalPurchased = await (
            from o in _context.CourseSeatOrders.AsNoTracking()
            where o.OrganizationId == organizationId && o.CourseId == platformCourse.Id
            select o.Seats
        ).SumAsync();

        var versionIds = await _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && (c.Code == rawCode || c.Code == normalizedCode || c.Code == legacyCode))
            .Select(c => c.Id).ToListAsync();
        var assignedCount = await _context.CourseAssignments.AsNoTracking()
            .Where(ca => versionIds.Contains(ca.CourseId) && ca.Status == Statuses.CourseAssignment.Active)
            .Select(ca => ca.EmployeeId).Distinct().CountAsync();

        return new PurchaseCourseSeatsOutput
        {
            OrderId = order.Id,
            CourseCode = normalizedCode,
            CourseTitle = course.Title,
            Seats = input.Seats,
            UnitPrice = unitPrice,
            TotalAmount = totalAmount,
            TotalSeatsPurchased = totalPurchased,
            TotalSeatsAvailable = Math.Max(0, totalPurchased - assignedCount),
            CheckoutUrl = checkoutUrl,
            QrCode = qrCode,
            CreatedAt = order.CreatedAt,
        };
    }
}
