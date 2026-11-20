using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.IndividualCommerce;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace DigiTalent.Application.UseCases.Learning.Courses.PurchaseCourse;

public class PurchaseCourseInput
{
    public Guid CourseId { get; set; }
    public string? Note { get; set; }
}

public class PurchaseCourseOutput
{
    public Guid OrderId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    /// <summary>Total of this purchase, the Intermediate course bought with an Advanced one included.</summary>
    public long Amount { get; set; }
    /// <summary>Canonical codes bought by this call, lower level first (M1-I, M1-A when an Advanced course brings its Intermediate one).</summary>
    public List<string> PurchasedCodes { get; set; } = new();
    public string? CheckoutUrl { get; set; }
    public string? QrCode { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

/// <summary>
/// The organization buys a paid course once: every employee may then learn it. Basic courses are free;
/// buying a course the organization already unlocked is refused (COURSE_ALREADY_PURCHASED). An Advanced course is
/// bought with the Intermediate course of its domain: when the organization does not have that one yet, both orders
/// are created together and the amount covers both.
/// </summary>
public class PurchaseCourseUseCase : IUseCase<PurchaseCourseInput, PurchaseCourseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IPayOSService? _payOSService;
    private readonly ILogger<PurchaseCourseUseCase>? _logger;
    private readonly string _appUrl;

    public PurchaseCourseUseCase(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        IPayOSService? payOSService = null,
        ILogger<PurchaseCourseUseCase>? logger = null,
        IOptions<IndividualCommerceOptions>? options = null)
    {
        _context = context;
        _currentUser = currentUser;
        _payOSService = payOSService;
        _logger = logger;
        _appUrl = (options?.Value.Security.PublicAppUrl ?? "http://localhost:5173").TrimEnd('/');
    }

    public async Task<PurchaseCourseOutput> ExecuteAsync(PurchaseCourseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId;

        var course = await _context.Courses.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == input.CourseId && c.OrganizationId == organizationId)
            ?? throw new NotFoundException($"Course '{input.CourseId}' not found.");

        if (!CourseOwnership.IsPaid(course.Code))
        {
            throw new BadRequestException("Khóa học Cơ bản được mở miễn phí, không cần mua.", "courseId", "BASIC_COURSE_IS_FREE");
        }
        if (await CourseOwnership.IsPurchasedAsync(_context, organizationId, course.Code))
        {
            throw new ConflictException("Doanh nghiệp đã mua khóa học này, mọi nhân viên đều học được.");
        }

        var normalizedCode = CourseCodes.Canonical(course.Code);
        var platformCourse = await ListedCourseAsync(normalizedCode);

        // Same price as the course list shows: the published catalog price of the code (or its A-alias).
        var lines = new List<(PlatformCourse Course, string Code, long Amount)>();
        // An Advanced course comes with the Intermediate course of its domain when the organization does not have it yet.
        var lowerCode = CourseOwnership.BoughtWith(normalizedCode);
        if (lowerCode != null && !await CourseOwnership.IsPurchasedAsync(_context, organizationId, lowerCode))
        {
            lines.Add((await ListedCourseAsync(lowerCode), lowerCode, await CourseOwnership.PriceAsync(_context, lowerCode)));
        }
        lines.Add((platformCourse, normalizedCode, await CourseOwnership.PriceAsync(_context, course.Code)));
        var amount = lines.Sum(line => line.Amount);

        var reason = string.IsNullOrWhiteSpace(input.Note) ? "Doanh nghiệp mua khóa học" : input.Note.Trim();
        var orders = lines.Select(line => new CourseOrder
        {
            OrganizationId = organizationId,
            CourseId = line.Course.Id,
            Amount = line.Amount,
            Reason = line.Code == normalizedCode ? reason : $"{reason} (mua kèm khóa Nâng cao {normalizedCode})",
            CreatedByUserId = userId,
        }).ToList();
        var order = orders[^1];

        _context.CourseOrders.AddRange(orders);
        await _context.SaveChangesAsync();

        // 1. Tự động nâng phạm vi năng lực của doanh nghiệp ứng với khóa học vừa mua (nếu cấp độ cao hơn)
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
            _logger?.LogWarning(ex, "Failed to auto-elevate capability ceiling on course purchase.");
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
                    amount: amount,
                    description: $"DT {string.Join(' ', lines.Select(line => line.Code))}",
                    returnUrl: _appUrl + "/enterprise/courses",
                    cancelUrl: _appUrl + "/enterprise/courses"
                );
                checkoutUrl = payResult.CheckoutUrl;
                qrCode = payResult.QrCode;
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to create PayOS link for enterprise course order.");
            }
        }

        return new PurchaseCourseOutput
        {
            OrderId = order.Id,
            CourseCode = normalizedCode,
            CourseTitle = course.Title,
            Amount = amount,
            PurchasedCodes = lines.Select(line => line.Code).ToList(),
            CheckoutUrl = checkoutUrl,
            QrCode = qrCode,
            CreatedAt = order.CreatedAt,
        };
    }

    /// <summary>The platform course listed under a standard code (the M-code row over a historical A-code row).</summary>
    private async Task<PlatformCourse> ListedCourseAsync(string code)
    {
        var canonical = CourseCodes.Canonical(code);
        var codes = CourseCodes.Aliases(canonical);
        return await _context.PlatformCourses.AsNoTracking()
            .Where(pc => codes.Contains(pc.Code))
            .OrderByDescending(pc => pc.Code == canonical)
            .ThenBy(pc => pc.Id)
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException($"Khóa học chuẩn '{canonical}' chưa được niêm yết trên nền tảng.");
    }
}
