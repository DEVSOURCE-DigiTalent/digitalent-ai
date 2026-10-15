using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Saves the course info in the draft: title, outcome, domain (any framework), level, price and sales status.
/// Basic courses are always free. The code can change only while the course has never been published.
/// </summary>
public class UpdatePlatformCatalogCourseUseCase : IUseCase<UpdatePlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;

    public UpdatePlatformCatalogCourseUseCase(IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(UpdatePlatformCatalogCourseUseCaseInput input)
    {
        var course = await _editor.DraftCourseAsync(input.VersionNo, input.CourseId);
        if (!await PlatformFrameworkGuard.IsUsableDomainAsync(_context, input.DomainId))
        {
            throw new BadRequestException("Lĩnh vực không tồn tại.", "domainId", "DOMAIN_NOT_FOUND");
        }

        var identity = await _context.PlatformCourses.FirstAsync(c => c.Id == course.CourseId);
        if (!string.IsNullOrWhiteSpace(input.Code))
        {
            var code = input.Code.Trim().ToUpperInvariant();
            if (code != identity.Code)
            {
                if (identity.PublishedAt != null)
                    throw new BadRequestException("Mã của khóa đã công bố không đổi được.", "code", "CODE_LOCKED");
                if (await _context.PlatformCourses.AnyAsync(c => c.Code == code && c.Id != identity.Id))
                    throw new ConflictException($"Mã khóa học '{code}' đã được dùng.");
                identity.Code = code;
            }
        }

        course.Title = input.Title.Trim();
        course.Outcome = input.Outcome?.Trim() ?? string.Empty;
        course.DomainId = input.DomainId;
        course.Level = (short)input.Level;
        course.PricePerSeat = course.Level == PlatformCatalog.MinLevel ? 0 : input.PricePerSeat;
        course.SalesStatus = input.SalesStatus;
        if (identity.PublishedAt == null)
        {
            // An unpublished course has no version in use: keep its identity in step with the draft.
            identity.Title = course.Title;
            identity.DomainId = course.DomainId;
            identity.Level = course.Level;
            identity.PricePerSeat = course.PricePerSeat;
        }

        PlatformCatalogEditor.MarkEdited(course);
        await _context.SaveChangesAsync();
        return await _reader.ReadAsync(input.VersionNo, input.CourseId);
    }
}
