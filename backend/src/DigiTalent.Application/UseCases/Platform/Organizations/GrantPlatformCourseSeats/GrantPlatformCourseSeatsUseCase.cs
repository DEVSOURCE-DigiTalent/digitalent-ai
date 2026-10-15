using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

/// <summary>
/// Grants paid course seats to an organization (support action, reason required, audited).
/// Basic courses are free, so only Intermediate / Advanced seats can be granted.
/// </summary>
public class GrantPlatformCourseSeatsUseCase : IUseCase<GrantPlatformCourseSeatsUseCaseInput, PlatformOrganizationDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public GrantPlatformCourseSeatsUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<PlatformOrganizationDetailOutput> ExecuteAsync(GrantPlatformCourseSeatsUseCaseInput input)
    {
        var organization = await _context.Organizations.FirstOrDefaultAsync(o => o.Id == input.OrganizationId)
            ?? throw new NotFoundException($"Organization '{input.OrganizationId}' not found.");
        var course = await PlatformCatalogReader.FindCourseAsync(_context, input.CourseCode);
        if (course.Level == PlatformCatalog.MinLevel)
            throw new BadRequestException("Basic courses are free and need no seat.", "courseCode", "BASIC_COURSE_IS_FREE");

        var order = new CourseSeatOrder
        {
            OrganizationId = organization.Id,
            CourseId = course.Id,
            Seats = input.Seats,
            Kind = PlatformCatalog.SeatOrderKind.AdminGrant,
            UnitPrice = 0,
            TotalAmount = 0,
            Reason = input.Reason.Trim(),
            CreatedByUserId = _currentUser.UserId,
        };
        _context.CourseSeatOrders.Add(order);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_SEATS_GRANTED",
            "organizations",
            organization.Id,
            newValues: new { courseCode = course.Code, seats = input.Seats, reason = order.Reason },
            entityLabel: organization.Name);

        return await PlatformOrganizationReader.ReadDetailAsync(_context, organization.Id);
    }
}
