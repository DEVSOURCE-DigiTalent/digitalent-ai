using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Courses;

/// <summary>
/// One course with its question bank and release history (Chương trình học / course editor).
/// </summary>
public class PlatformCourseDetailOutput
{
    public PlatformCourseItem Course { get; set; } = new();
    public List<PlatformCourseQuestionItem> Questions { get; set; } = new();
    public List<PlatformCourseReleaseItem> Releases { get; set; } = new();

    public static async Task<PlatformCourseDetailOutput> ReadAsync(IApplicationDbContext context, string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var course = (await PlatformCatalogReader.ReadCoursesAsync(context)).FirstOrDefault(c => c.Code == normalized)
            ?? throw new NotFoundException($"Course '{code}' not found.");

        var questions = await context.PlatformCourseQuestions.AsNoTracking()
            .Where(q => q.CourseId == course.Id && q.Status != Statuses.PlatformCourseQuestion.Archived)
            .OrderBy(q => q.CreatedAt)
            .Select(q => new PlatformCourseQuestionItem
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                CorrectAnswer = q.CorrectAnswer,
                Explanation = q.Explanation,
                Status = q.Status,
                CreatedAt = q.CreatedAt,
            }).ToListAsync();

        var releases = await (
            from release in context.PlatformCourseReleases.AsNoTracking()
            join user in context.Users on release.PublishedByUserId equals user.Id into users
            from user in users.DefaultIfEmpty()
            where release.CourseId == course.Id
            orderby release.VersionNo descending
            select new PlatformCourseReleaseItem
            {
                VersionNo = release.VersionNo,
                Title = release.Title,
                PricePerSeat = release.PricePerSeat,
                SalesStatus = release.SalesStatus,
                PublishedByEmail = user == null ? null : user.Email,
                PublishedAt = release.PublishedAt,
            }).ToListAsync();

        return new PlatformCourseDetailOutput { Course = course, Questions = questions, Releases = releases };
    }
}
