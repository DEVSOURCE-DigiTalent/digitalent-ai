using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// Adds a NEW course to the draft: its identity (code) in platform_courses — unpublished until the draft is — and
/// its row in the draft with the default price of its level and the three default final criteria.
/// </summary>
public class CreatePlatformCatalogCourseUseCase : IUseCase<CreatePlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly IApplicationDbContext _context;
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformCourseContentReader _reader;
    private readonly IAuditService _auditService;

    public CreatePlatformCatalogCourseUseCase(
        IApplicationDbContext context, PlatformCatalogEditor editor, PlatformCourseContentReader reader, IAuditService auditService)
    {
        _context = context;
        _editor = editor;
        _reader = reader;
        _auditService = auditService;
    }

    public async Task<PlatformCatalogCourseDetail> ExecuteAsync(CreatePlatformCatalogCourseUseCaseInput input)
    {
        var draft = await _editor.DraftAsync(input.VersionNo);
        var code = input.Code.Trim().ToUpperInvariant();
        if (await _context.PlatformCourses.AnyAsync(c => c.Code == code))
        {
            throw new ConflictException($"Mã khóa học '{code}' đã được dùng.");
        }

        if (!await PlatformFrameworkGuard.IsUsableDomainAsync(_context, input.DomainId))
        {
            throw new BadRequestException("Lĩnh vực không tồn tại.", "domainId", "DOMAIN_NOT_FOUND");
        }

        var level = (short)input.Level;
        var title = input.Title.Trim();
        var price = PlatformCatalog.DefaultPrice(level);
        var course = new PlatformCourse
        {
            Code = code,
            DomainId = input.DomainId,
            Level = level,
            VersionNo = draft.VersionNo,
            Title = title,
            Outcome = string.Empty,
            PricePerSeat = price,
            SalesStatus = Statuses.PlatformCourseSales.Open,
            PublishedAt = null,
        };
        _context.PlatformCourses.Add(course);
        _context.PlatformCatalogCourses.Add(new PlatformCatalogCourse
        {
            VersionId = draft.Id,
            CourseId = course.Id,
            ChangeKind = PlatformCatalog.ChangeKind.New,
            DomainId = input.DomainId,
            Level = level,
            Title = title,
            Outcome = string.Empty,
            PricePerSeat = price,
            SalesStatus = Statuses.PlatformCourseSales.Open,
            FinalTitle = "Bài cuối khóa",
            FinalPrompt = string.Empty,
            FinalCriteria = JsonSerializer.Serialize(PlatformCatalog.DefaultFinalCriteria),
        });
        await _context.SaveChangesAsync();
        await _auditService.LogAsync(
            "PLATFORM_CATALOG_COURSE_ADDED",
            "platform_courses",
            course.Id,
            newValues: new { versionNo = draft.VersionNo, code, title, level },
            entityLabel: $"{code} · {title}");

        return await _reader.ReadAsync(draft.VersionNo, course.Id);
    }
}
