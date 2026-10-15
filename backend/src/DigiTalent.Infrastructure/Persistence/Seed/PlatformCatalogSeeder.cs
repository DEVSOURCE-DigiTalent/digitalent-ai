using System.Text.Json;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Reference data of the platform catalog (SQL section 12A): the six-domain Digital AI standard published as
/// v1, and its 18 standard courses (6 domains x Basic / Intermediate / Advanced) published as v1 with one
/// question each. Domains and courses come from <see cref="Tt02Catalog"/>, so a platform domain has the code of
/// the organizations' competency category (TT02_D1…) and a platform course the code of their course (A1-F…).
/// Runs in every environment and only inserts what is missing.
/// </summary>
public static class PlatformCatalogSeeder
{
    public const long DefaultIntermediatePrice = 399_000;
    public const long DefaultAdvancedPrice = 699_000;

    /// <summary>Published description of each domain, by Tt02Catalog domain number.</summary>
    public static readonly IReadOnlyDictionary<int, string> DomainDescriptions = new Dictionary<int, string>
    {
        [1] = "Duyệt, tìm kiếm, đánh giá và quản lý dữ liệu, thông tin phục vụ công việc; nêu được nguồn và độ tin cậy.",
        [2] = "Tương tác, chia sẻ và phối hợp qua công nghệ số; giữ thông tin rõ ràng cho người cùng làm.",
        [3] = "Tạo, chỉnh sửa và tái sử dụng nội dung số đúng mục đích, đúng bản quyền và dễ kiểm tra lại.",
        [4] = "Bảo vệ thiết bị, dữ liệu cá nhân, sức khỏe và môi trường trước rủi ro trên môi trường số.",
        [5] = "Nhận diện vấn đề, chọn công cụ số phù hợp và đưa ra giải pháp có căn cứ kiểm tra được.",
        [6] = "Dùng công cụ AI có trách nhiệm: đặt yêu cầu rõ, kiểm chứng kết quả và nêu giới hạn khi bàn giao.",
    };

    public static async Task SeedAsync(AppDbContext db)
    {
        var now = DateTimeOffset.UtcNow;

        // 1. Six domains + framework release v1
        var domains = await db.PlatformFrameworkDomains.ToListAsync();
        foreach (var definition in Tt02Catalog.Domains)
        {
            if (domains.Any(d => d.Code == definition.CategoryCode)) continue;
            var description = DomainDescriptions[definition.Number];
            var domain = new PlatformFrameworkDomain
            {
                Code = definition.CategoryCode,
                Name = definition.Name,
                SortOrder = definition.Number,
                PublishedDescription = description,
                DraftDescription = description,
            };
            db.PlatformFrameworkDomains.Add(domain);
            domains.Add(domain);
        }

        if (!await db.PlatformFrameworkReleases.AnyAsync())
        {
            db.PlatformFrameworkReleases.Add(new PlatformFrameworkRelease
            {
                VersionNo = 1,
                Snapshot = JsonSerializer.Serialize(domains.OrderBy(d => d.SortOrder)
                    .Select(d => new { code = d.Code, name = d.Name, description = d.PublishedDescription })),
                ReleaseNote = "Phiên bản đầu tiên của khung chuẩn Digital AI.",
                PublishedAt = now,
            });
        }

        await db.SaveChangesAsync();

        // 2. Eighteen standard courses, each published as v1 with one question
        var existingCodes = await db.PlatformCourses.Select(c => c.Code).ToListAsync();
        foreach (var definition in Tt02Catalog.Domains)
        {
            var domain = domains.Single(d => d.Code == definition.CategoryCode);
            for (short level = PlatformCatalog.MinLevel; level <= PlatformCatalog.MaxLevel; level++)
            {
                var code = definition.CourseCode(level);
                if (existingCodes.Contains(code)) continue;

                var levelName = PlatformCatalog.LevelName(level).ToLowerInvariant();
                var competencies = string.Join(", ", definition.Competencies.Select(c => c.SourceCode));
                var course = new PlatformCourse
                {
                    Code = code,
                    DomainId = domain.Id,
                    Level = level,
                    VersionNo = 1,
                    Title = definition.CourseTitles[level - 1],
                    Outcome = $"Vận dụng các năng lực {competencies} của lĩnh vực {definition.Name.ToLowerInvariant()} ở mức {levelName} với minh chứng truy vết được.",
                    PricePerSeat = level switch { 2 => DefaultIntermediatePrice, 3 => DefaultAdvancedPrice, _ => 0 },
                    SalesStatus = Statuses.PlatformCourseSales.Open,
                    PublishedAt = now,
                };
                db.PlatformCourses.Add(course);
                db.PlatformCourseReleases.Add(new PlatformCourseRelease
                {
                    CourseId = course.Id,
                    VersionNo = 1,
                    Title = course.Title,
                    Outcome = course.Outcome,
                    PricePerSeat = course.PricePerSeat,
                    SalesStatus = course.SalesStatus,
                    PublishedAt = now,
                });
                db.PlatformCourseQuestions.Add(new PlatformCourseQuestion
                {
                    CourseId = course.Id,
                    QuestionText = $"Hành động nào chứng minh được năng lực {definition.Name.ToLowerInvariant()} ở mức {levelName} và người khác kiểm tra lại được?",
                    CorrectAnswer = "Nêu nguồn, hành động đã làm và kết luận có căn cứ.",
                    Explanation = "Minh chứng phải cho phép người khác kiểm tra lại kết quả.",
                    Status = Statuses.PlatformCourseQuestion.Published,
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
