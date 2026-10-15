using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Platform.Courses;

/// <summary>
/// Saves the course editor as a draft. Basic courses always stay free.
/// </summary>
public class SavePlatformCourseDraftUseCase : IUseCase<SavePlatformCourseDraftUseCaseInput, PlatformCourseDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IAuditService _auditService;

    public SavePlatformCourseDraftUseCase(IApplicationDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<PlatformCourseDetailOutput> ExecuteAsync(SavePlatformCourseDraftUseCaseInput input)
    {
        var course = await PlatformCatalogReader.FindCourseAsync(_context, input.Code);
        if (course.Level == PlatformCatalog.MinLevel && input.PricePerSeat != 0)
            throw new BadRequestException("Basic courses are always free.", "pricePerSeat", "BASIC_COURSE_IS_FREE");

        course.DraftTitle = input.Title.Trim();
        course.DraftOutcome = input.Outcome.Trim();
        course.DraftPricePerSeat = input.PricePerSeat;
        course.DraftSalesStatus = input.SalesStatus;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_COURSE_DRAFT_SAVED",
            "platform_courses",
            course.Id,
            new { course.Title, course.PricePerSeat, course.SalesStatus },
            new { title = course.DraftTitle, pricePerSeat = course.DraftPricePerSeat, salesStatus = course.DraftSalesStatus },
            course.Code);

        return await PlatformCourseDetailOutput.ReadAsync(_context, course.Code);
    }
}
