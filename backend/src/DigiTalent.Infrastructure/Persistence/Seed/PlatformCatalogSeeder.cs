using System.Net;
using System.Text.Json;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Reference data of the platform catalog (SQL v3.2 sections 12A and 19): the Circular 02/2025 framework with its
/// six domains (published as v1), its 18 standard courses (6 domains x Basic / Intermediate / Advanced) and catalog
/// version v1 in use. Each v1 course gets illustrative content: one module per TT02 competency of its domain, three
/// text blocks (foundations, workplace case, guided practice) and six review questions, two per block.
/// Domains and courses come from <see cref="Tt02Catalog"/>, so a platform domain has the code of the organizations'
/// competency category (TT02_D1…) and a platform course the code of their course (A1-F…).
/// Runs in every environment and only inserts what is missing.
/// </summary>
public static class PlatformCatalogSeeder
{
    public const long DefaultIntermediatePrice = PlatformCatalog.DefaultIntermediatePrice;
    public const long DefaultAdvancedPrice = PlatformCatalog.DefaultAdvancedPrice;

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

    public const string Tt02FrameworkName = "Thông tư 02/2025 · Năng lực số";

    public const string Tt02FrameworkDescription =
        "Khung năng lực số theo Thông tư 02/2025: 6 lĩnh vực, mỗi lĩnh vực có khóa Cơ bản, Trung cấp và Nâng cao.";

    public static async Task SeedAsync(AppDbContext db)
    {
        var now = DateTimeOffset.UtcNow;

        // 1. The Circular 02/2025 framework, its six domains and framework release v1
        var framework = await db.PlatformFrameworks.FirstOrDefaultAsync(f => f.Code == PlatformCatalog.Tt02FrameworkCode);
        if (framework == null)
        {
            framework = new PlatformFramework
            {
                Code = PlatformCatalog.Tt02FrameworkCode,
                Name = Tt02FrameworkName,
                Description = Tt02FrameworkDescription,
                Status = Statuses.PlatformFramework.Published,
                CurrentVersionNo = 1,
                SortOrder = 1,
            };
            db.PlatformFrameworks.Add(framework);
        }

        var domains = await db.PlatformFrameworkDomains.Where(d => d.FrameworkId == framework.Id).ToListAsync();
        foreach (var definition in Tt02Catalog.Domains)
        {
            if (domains.Any(d => d.Code == definition.CategoryCode)) continue;
            var description = DomainDescriptions[definition.Number];
            var domain = new PlatformFrameworkDomain
            {
                FrameworkId = framework.Id,
                Code = definition.CategoryCode,
                Name = definition.Name,
                SortOrder = definition.Number,
                PublishedDescription = description,
                DraftDescription = description,
            };
            db.PlatformFrameworkDomains.Add(domain);
            domains.Add(domain);
        }

        if (!await db.PlatformFrameworkReleases.AnyAsync(r => r.FrameworkId == framework.Id))
        {
            db.PlatformFrameworkReleases.Add(new PlatformFrameworkRelease
            {
                FrameworkId = framework.Id,
                VersionNo = 1,
                Snapshot = JsonSerializer.Serialize(domains.OrderBy(d => d.SortOrder)
                    .Select(d => new { code = d.Code, name = d.Name, description = d.PublishedDescription })),
                ReleaseNote = "Phiên bản đầu tiên của khung Thông tư 02/2025.",
                PublishedAt = now,
            });
        }

        await db.SaveChangesAsync();

        // 2. Eighteen standard courses (identity + mirror of the version in use)
        var courses = await db.PlatformCourses.ToListAsync();
        foreach (var c in courses)
        {
            if (c.Code.StartsWith("A", StringComparison.OrdinalIgnoreCase) && c.Code.Length > 2 && char.IsDigit(c.Code[1]))
            {
                c.Code = "M" + c.Code[1..];
            }
            else if (c.Code.StartsWith("AI1-", StringComparison.OrdinalIgnoreCase))
            {
                c.Code = "M6-" + c.Code[4..];
            }
        }

        var tenantCourses = await db.Courses.ToListAsync();
        foreach (var tc in tenantCourses)
        {
            if (tc.Code.StartsWith("A", StringComparison.OrdinalIgnoreCase) && tc.Code.Length > 2 && char.IsDigit(tc.Code[1]))
            {
                tc.Code = "M" + tc.Code[1..];
            }
            else if (tc.Code.StartsWith("AI1-", StringComparison.OrdinalIgnoreCase))
            {
                tc.Code = "M6-" + tc.Code[4..];
            }
        }

        foreach (var definition in Tt02Catalog.Domains)
        {
            var domain = domains.Single(d => d.Code == definition.CategoryCode);
            for (short level = PlatformCatalog.MinLevel; level <= PlatformCatalog.MaxLevel; level++)
            {
                var code = definition.CourseCode(level);
                if (courses.Any(c => c.Code == code)) continue;

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
                    PricePerSeat = PlatformCatalog.DefaultPrice(level),
                    SalesStatus = Statuses.PlatformCourseSales.Open,
                    PublishedAt = now,
                };
                db.PlatformCourses.Add(course);
                courses.Add(course);
            }
        }

        await db.SaveChangesAsync();

        // 3. Catalog version v1 in use, with every published course
        if (!await db.PlatformCatalogVersions.AnyAsync())
        {
            var version = new PlatformCatalogVersion
            {
                VersionNo = 1,
                Status = Statuses.PlatformCatalogVersion.Current,
                ReleaseNote = "Phiên bản đầu tiên: 18 khóa theo Thông tư 02/2025.",
                PublishedAt = now,
            };
            db.PlatformCatalogVersions.Add(version);
            foreach (var course in courses.Where(c => c.PublishedAt != null))
            {
                course.VersionNo = 1;
                db.PlatformCatalogCourses.Add(new PlatformCatalogCourse
                {
                    VersionId = version.Id,
                    CourseId = course.Id,
                    ChangeKind = PlatformCatalog.ChangeKind.Unchanged,
                    DomainId = course.DomainId,
                    Level = course.Level,
                    Title = course.Title,
                    Outcome = course.Outcome,
                    PricePerSeat = course.PricePerSeat,
                    SalesStatus = course.SalesStatus,
                    FinalTitle = "Bài cuối khóa",
                    FinalPrompt = string.Empty,
                    FinalCriteria = JsonSerializer.Serialize(PlatformCatalog.DefaultFinalCriteria),
                });
            }

            await db.SaveChangesAsync();
        }

        // 4. Illustrative content for the TT02 courses of v1 that have none yet
        await SeedV1ContentAsync(db, domains);
    }

    private static async Task SeedV1ContentAsync(AppDbContext db, List<PlatformFrameworkDomain> domains)
    {
        var v1 = await db.PlatformCatalogVersions.FirstOrDefaultAsync(v => v.VersionNo == 1);
        if (v1 == null) return;

        var rows = await (
                from catalogCourse in db.PlatformCatalogCourses
                join course in db.PlatformCourses on catalogCourse.CourseId equals course.Id
                where catalogCourse.VersionId == v1.Id && !db.PlatformCourseModules.Any(m => m.CatalogCourseId == catalogCourse.Id)
                select new { CatalogCourse = catalogCourse, course.Code })
            .ToListAsync();
        foreach (var row in rows)
        {
            var definition = Tt02Catalog.Domains.FirstOrDefault(d => Enumerable.Range(1, 3).Any(l => d.CourseCode(l) == row.Code));
            if (definition == null) continue;

            var level = row.CatalogCourse.Level;
            var levelName = PlatformCatalog.LevelName(level);
            var c = row.CatalogCourse;
            if (string.IsNullOrWhiteSpace(c.FinalPrompt))
            {
                c.FinalPrompt =
                    $"<p>Mô tả một nhiệm vụ thực tế trong vị trí của bạn có dùng năng lực {Html(definition.Name.ToLowerInvariant())} ở mức {Html(levelName.ToLowerInvariant())}: " +
                    "nêu <b>nguồn</b>, <b>hành động hoặc phép tính</b> người khác kiểm tra lại được, <b>kết luận</b> và bước tiếp theo.</p>";
            }

            foreach (var (competency, index) in definition.Competencies.Select((x, i) => (x, i)))
            {
                var moduleTitle = competency.ModuleTitles[Math.Clamp(level - 1, 0, competency.ModuleTitles.Length - 1)];
                var module = new PlatformCourseModule
                {
                    CatalogCourseId = c.Id,
                    SortOrder = index + 1,
                    Title = moduleTitle,
                    QuizTitle = $"Câu hỏi ôn tập · {moduleTitle}",
                };
                db.PlatformCourseModules.Add(module);

                var blocks = Pages(competency.SourceCode, competency.Name, moduleTitle, levelName)
                    .Select((html, i) => new PlatformModuleBlock
                    {
                        ModuleId = module.Id,
                        SortOrder = i + 1,
                        BlockType = PlatformCatalog.BlockType.Text,
                        BodyHtml = html,
                    })
                    .ToList();
                db.PlatformModuleBlocks.AddRange(blocks);

                foreach (var (template, q) in Questions(competency.Name, moduleTitle, levelName).Select((t, i) => (t, i)))
                {
                    var question = new PlatformModuleQuestion
                    {
                        ModuleId = module.Id,
                        SortOrder = q + 1,
                        QuestionText = template.Question,
                        Explanation = template.Explanation,
                        BlockId = blocks[q / 2].Id,
                    };
                    db.PlatformModuleQuestions.Add(question);
                    // The right answer moves between positions so it is not always the first option.
                    var rotation = (index + q) % template.Options.Length;
                    for (var o = 0; o < template.Options.Length; o++)
                    {
                        db.PlatformQuestionOptions.Add(new PlatformQuestionOption
                        {
                            QuestionId = question.Id,
                            SortOrder = (o + rotation) % template.Options.Length + 1,
                            OptionText = template.Options[o],
                            IsCorrect = o == 0,
                        });
                    }
                }
            }
        }

        await db.SaveChangesAsync();
    }

    private sealed record QuestionTemplate(string Question, string[] Options, string Explanation);

    /// <summary>The three text pages of a module: foundations, workplace case, guided practice.</summary>
    private static string[] Pages(string code, string competency, string moduleTitle, string levelName) => new[]
    {
        $"<h3>Lý thuyết nền tảng và quy chuẩn</h3><p>Năng lực {Html(code)} — {Html(competency)} ở mức {Html(levelName.ToLowerInvariant())}: hiểu đúng yêu cầu, thuật ngữ và quy chuẩn trước khi áp dụng vào công việc.</p>" +
        $"<ul><li>Mục tiêu của mô đun: {Html(moduleTitle)}</li><li>Quy chuẩn và công cụ số thường dùng</li><li>Nguyên tắc an toàn, đạo đức và bảo mật dữ liệu</li></ul>",
        $"<h3>Tình huống thực tế nơi làm việc</h3><p>Phân tích một tình huống điển hình dùng năng lực {Html(code)} trong công việc văn phòng và làm việc nhóm.</p>" +
        "<ol><li>Nhận diện vấn đề và rủi ro thông tin, dữ liệu.</li><li>Chọn cách xử lý phù hợp quy định nội bộ và chuẩn mực số.</li><li>Ghi lại cách làm và phối hợp với người liên quan.</li></ol>" +
        "<p>Tránh các sai sót thường gặp: chia sẻ sai quyền, dùng nguồn không rõ ràng, không kiểm tra lại kết quả.</p>",
        $"<h3>Thực hành có hướng dẫn và sản phẩm đầu ra</h3><p>Áp dụng {Html(competency.ToLowerInvariant())} vào một tác vụ mẫu theo các bước dưới đây.</p>" +
        "<ul><li>Chuẩn bị dữ liệu và công cụ.</li><li>Thực hiện và hoàn thiện sản phẩm theo quy chuẩn.</li><li>Tự kiểm tra theo tiêu chí trước khi nộp.</li></ul>" +
        "<p><b>Sản phẩm nộp:</b> kết quả thực hiện kèm nguồn và cách làm người khác kiểm tra lại được.</p>",
    };

    /// <summary>Six review questions, two per page; the first option is the right one before rotation.</summary>
    private static QuestionTemplate[] Questions(string competency, string moduleTitle, string levelName) => new[]
    {
        new QuestionTemplate($"Trong \"{moduleTitle}\", vì sao cần nắm quy chuẩn trước khi bắt tay vào việc?",
            new[] { "Để người khác kiểm tra lại được cách làm", "Để làm nhanh mà không cần ghi chú", "Vì quy chuẩn thay cho kết quả" },
            "Làm theo quy chuẩn giúp cách làm kiểm tra được."),
        new QuestionTemplate($"Năng lực \"{competency}\" ở mức {levelName.ToLowerInvariant()} đòi hỏi điều gì?",
            new[] { "Vận dụng vào việc thật và nêu được căn cứ", "Chỉ ghi nhớ định nghĩa", "Dùng công cụ khi chưa có mục đích" },
            "Năng lực được thể hiện qua việc thật có căn cứ."),
        new QuestionTemplate($"Gặp tình huống trong \"{moduleTitle}\", bước nào nên làm trước?",
            new[] { "Xác định vấn đề và nguồn liên quan", "Chọn ngay cách làm quen thuộc", "Chờ người khác quyết định" },
            "Hiểu đúng vấn đề và nguồn trước khi chọn cách làm."),
        new QuestionTemplate("Sai sót nào cần tránh khi xử lý tình huống trên môi trường số?",
            new[] { "Chia sẻ sai quyền hoặc dùng nguồn không rõ ràng", "Ghi lại cách làm", "Hỏi lại người giao việc khi chưa rõ" },
            "Chia sẻ sai quyền và nguồn không rõ ràng là lỗi thường gặp."),
        new QuestionTemplate($"Sản phẩm thực hành của \"{moduleTitle}\" cần cho người duyệt thấy gì?",
            new[] { "Nguồn, cách làm và kết quả kiểm tra được", "Chỉ hình thức trình bày", "Thời gian đã làm" },
            "Người duyệt cần kiểm tra lại được sản phẩm."),
        new QuestionTemplate($"Trước khi nộp sản phẩm của \"{moduleTitle}\", bạn tự kiểm tra gì?",
            new[] { "Đối chiếu với yêu cầu và nguồn đã dùng", "Chỉ lỗi chính tả", "Không cần kiểm tra" },
            "Tự đối chiếu với yêu cầu và nguồn trước khi nộp."),
    };

    private static string Html(string text) => WebUtility.HtmlEncode(text);
}
