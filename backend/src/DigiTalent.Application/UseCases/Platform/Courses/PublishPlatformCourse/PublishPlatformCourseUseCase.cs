using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Courses;

/// <summary>
/// Publishes the next course version: applies the draft (if any), publishes draft questions and records
/// the release. Fails when there is nothing new to publish.
/// </summary>
public class PublishPlatformCourseUseCase : IUseCase<PublishPlatformCourseUseCaseInput, PlatformCourseDetailOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly IAuditService _auditService;

    public PublishPlatformCourseUseCase(IApplicationDbContext context, ICurrentUser currentUser, IAuditService auditService)
    {
        _context = context;
        _currentUser = currentUser;
        _auditService = auditService;
    }

    public async Task<PlatformCourseDetailOutput> ExecuteAsync(PublishPlatformCourseUseCaseInput input)
    {
        var course = await PlatformCatalogReader.FindCourseAsync(_context, input.Code);
        var draftQuestions = await _context.PlatformCourseQuestions
            .Where(q => q.CourseId == course.Id && q.Status == Statuses.PlatformCourseQuestion.Draft)
            .ToListAsync();
        if (!course.HasDraft && draftQuestions.Count == 0)
            throw new BadRequestException("There is no draft change to publish.", "code", "NO_DRAFT_CHANGES");

        var oldValues = new { course.VersionNo, course.Title, course.PricePerSeat, course.SalesStatus };
        course.Title = course.DraftTitle ?? course.Title;
        course.Outcome = course.DraftOutcome ?? course.Outcome;
        course.PricePerSeat = course.Level == PlatformCatalog.MinLevel ? 0 : course.DraftPricePerSeat ?? course.PricePerSeat;
        course.SalesStatus = course.DraftSalesStatus ?? course.SalesStatus;
        course.ClearDraft();
        course.VersionNo += 1;
        course.PublishedAt = DateTimeOffset.UtcNow;
        foreach (var question in draftQuestions) question.Status = Statuses.PlatformCourseQuestion.Published;

        _context.PlatformCourseReleases.Add(new PlatformCourseRelease
        {
            CourseId = course.Id,
            VersionNo = course.VersionNo,
            Title = course.Title,
            Outcome = course.Outcome,
            PricePerSeat = course.PricePerSeat,
            SalesStatus = course.SalesStatus,
            PublishedByUserId = _currentUser.UserId,
            PublishedAt = course.PublishedAt.Value,
        });
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(
            "PLATFORM_COURSE_PUBLISHED",
            "platform_courses",
            course.Id,
            oldValues,
            new { course.VersionNo, course.Title, course.PricePerSeat, course.SalesStatus, publishedQuestions = draftQuestions.Count },
            $"{course.Code} v{course.VersionNo}");

        return await PlatformCourseDetailOutput.ReadAsync(_context, course.Code);
    }
}
