using System.Text.Json;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Domain.Entities.Learner;
using DigiTalent.Infrastructure.PersonalLearning;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Seed dữ liệu chi tiết cho Course Content:
///   1. CourseModules: Mỗi khóa học có các chương tương ứng từng năng lực TT02 của miền đó.
///   2. Lessons: Mỗi module có 3 bài học chuẩn (Lý thuyết nền tảng & Quy chuẩn - VIDEO;
///      Tình huống công việc & Tác nghiệp - CASE_STUDY; Thực hành có hướng dẫn & Sản phẩm đầu ra - GUIDED_PRACTICE).
///   3. CourseLearningOutcomes: Chuẩn đầu ra (SKILL / KNOWLEDGE) cho từng năng lực.
///   4. PracticalTaskTemplates & PracticalTaskTargets: Đề bài thực hành tình huống thực tế kèm Rubric.
///   5. Demo Individual Learner Profile: Tài khoản cá nhân có sẵn dữ liệu và chứng nhận thật để Admin/Learner kiểm thử.
/// </summary>
public static class CourseContentSeeder
{
    private static readonly string[] LevelSuffixes = { "F", "I", "A" };
    private static readonly string[] LevelNamesVi = { "Cơ bản", "Trung cấp", "Nâng cao" };

    public static async Task SeedCourseContentAsync(AppDbContext db, Guid organizationId, Guid authorUserId)
    {
        var publishedCourses = await db.Courses
            .Where(c => c.OrganizationId == organizationId)
            .ToListAsync();

        if (publishedCourses.Count == 0) return;

        var competencies = await db.Competencies
            .ToDictionaryAsync(c => c.Code, c => c);

        var now = DateTimeOffset.UtcNow;

        foreach (var course in publishedCourses)
        {
            // Kiểm tra xem khóa học đã có module chưa (tránh seed trùng)
            var hasModules = await db.CourseModules.AnyAsync(m => m.CourseId == course.Id);
            if (hasModules) continue;

            // Xác định miền và các năng lực của khóa học
            // Mã khóa học dạng "A1-F", "A2-I", v.v.
            var prefix = course.Code.Split('-')[0];
            var domainDef = PersonalLearningCatalog.Domains.FirstOrDefault(d => d.CoursePrefix.Equals(prefix, StringComparison.OrdinalIgnoreCase));
            if (domainDef == null) continue;

            var courseLevel = (short)(course.EntryLevel.HasValue ? Math.Min(3, course.EntryLevel.Value + 1) : 1);
            if (course.Code.EndsWith("-F", StringComparison.OrdinalIgnoreCase)) courseLevel = 1;
            else if (course.Code.EndsWith("-I", StringComparison.OrdinalIgnoreCase)) courseLevel = 2;
            else if (course.Code.EndsWith("-A", StringComparison.OrdinalIgnoreCase)) courseLevel = 3;

            var levelName = LevelNamesVi[Math.Clamp(courseLevel - 1, 0, 2)];

            // 1. Tạo CourseModules và Lessons
            var modSort = 1;
            foreach (var compCode in domainDef.CompetencyCodes)
            {
                var compSourceCode = $"TT02-{compCode}";
                if (!competencies.TryGetValue(compSourceCode, out var competency))
                {
                    // Fallback thử tìm theo code không có prefix
                    competencies.TryGetValue(compCode, out competency);
                }

                var compName = PersonalLearningCatalog.CompetencyNames.GetValueOrDefault(compCode, $"Năng lực số {compCode}");
                var modMinutes = Math.Max(30, (course.EstimatedDurationMinutes ?? 120) / domainDef.CompetencyCodes.Length);

                var module = new CourseModule
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    Code = $"MOD-{course.Code}-{compCode.Replace(".", "")}",
                    Title = $"Chương {modSort}: {compName}",
                    Description = $"Trang bị kiến thức và kỹ năng thực hành năng lực số {compCode} ở mức {levelName} theo Khung chuẩn TT02/2025/TT-BGDĐT.",
                    Purpose = $"Giúp người học tự tin vận dụng {compName} vào xử lý công việc thực tế.",
                    EstimatedMinutes = modMinutes,
                    SortOrder = modSort,
                    IsRequired = true,
                    Status = "ACTIVE",
                    CreatedAt = now,
                    UpdatedAt = now,
                };
                db.CourseModules.Add(module);

                // 2. Tạo 3 bài học chuẩn cho từng module
                var lesMinutesVideo = Math.Max(10, (int)Math.Round(modMinutes * 0.35));
                var lesMinutesCase = Math.Max(10, (int)Math.Round(modMinutes * 0.35));
                var lesMinutesPractice = Math.Max(10, modMinutes - lesMinutesVideo - lesMinutesCase);

                var lesson1 = new Lesson
                {
                    Id = Guid.NewGuid(),
                    ModuleId = module.Id,
                    Code = $"LES-{module.Code}-01",
                    Title = $"Lý thuyết nền tảng & Quy chuẩn số: {compName}",
                    LessonType = "VIDEO",
                    ContentBody = $"""
                    # Mục tiêu học tập cốt lõi
                    - Hiểu đúng định nghĩa và yêu cầu của năng lực {compCode} ({compName}) ở mức {levelName}.
                    - Nắm vững các quy chuẩn thuật ngữ và công cụ số thông dụng theo Thông tư 02/2025/TT-BGDĐT.
                    - Nhận diện các nguyên tắc an toàn, đạo đức và bảo mật dữ liệu liên quan.

                    ## Quy chuẩn chuyên môn
                    Ở mức {levelName}, người học cần nắm chắc phương pháp luận, các tiêu chuẩn vận hành và quy trình tác nghiệp chuẩn hóa trên các nền tảng số của doanh nghiệp.
                    """,
                    EstimatedMinutes = lesMinutesVideo,
                    SortOrder = 1,
                    IsRequired = true,
                    CompletionRule = "VIEW",
                    Status = "ACTIVE",
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                var lesson2 = new Lesson
                {
                    Id = Guid.NewGuid(),
                    ModuleId = module.Id,
                    Code = $"LES-{module.Code}-02",
                    Title = $"Tình huống thực tế & Tác nghiệp nơi làm việc ({compCode})",
                    LessonType = "CASE_STUDY",
                    ContentBody = $"""
                    # Tình huống công sở thực tế
                    Phân tích tình huống điển hình ứng dụng năng lực {compCode} trong bối cảnh văn phòng và làm việc nhóm tại doanh nghiệp hiện đại.

                    ## Kịch bản xử lý
                    1. Nhận diện vấn đề và đánh giá rủi ro thông tin/dữ liệu.
                    2. Lựa chọn phương án xử lý phù hợp với quy định nội bộ và chuẩn mực số.
                    3. Ghi chép tài liệu và phối hợp liên phòng ban thông suốt.

                    ## Lưu ý nghiệp vụ
                    Tránh các sai sót thường gặp như chia sẻ sai quyền tài liệu, sử dụng mật khẩu yếu hoặc vi phạm bản quyền nội dung.
                    """,
                    EstimatedMinutes = lesMinutesCase,
                    SortOrder = 2,
                    IsRequired = true,
                    CompletionRule = "VIEW",
                    Status = "ACTIVE",
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                var lesson3 = new Lesson
                {
                    Id = Guid.NewGuid(),
                    ModuleId = module.Id,
                    Code = $"LES-{module.Code}-03",
                    Title = $"Thực hành có hướng dẫn & Sản phẩm đầu ra ({compCode})",
                    LessonType = "GUIDED_PRACTICE",
                    ContentBody = $"""
                    # Đề bài thực hành
                    Áp dụng năng lực {compCode} ({compName}) vào thực hiện tác vụ mẫu theo các bước chỉ dẫn chi tiết.

                    ## Các bước tiến hành
                    - Bước 1: Chuẩn bị dữ liệu và môi trường công cụ tương ứng.
                    - Bước 2: Thực hiện các thao tác kỹ thuật và hoàn thiện sản phẩm theo quy chuẩn.
                    - Bước 3: Tự kiểm định sản phẩm theo tiêu chí nghiệm thu trước khi chuyển sang chương tiếp theo.

                    ## Sản phẩm nộp
                    Bản kết quả thực hiện, liên kết sản phẩm số hoặc tài liệu tóm tắt thao tác đã hoàn thành.
                    """,
                    EstimatedMinutes = lesMinutesPractice,
                    SortOrder = 3,
                    IsRequired = true,
                    CompletionRule = "VIEW",
                    Status = "ACTIVE",
                    CreatedAt = now,
                    UpdatedAt = now,
                };

                db.Lessons.AddRange(lesson1, lesson2, lesson3);

                // 3. Tạo CourseLearningOutcome nếu có Competency
                if (competency != null)
                {
                    var clo = new CourseLearningOutcome
                    {
                        Id = Guid.NewGuid(),
                        CourseId = course.Id,
                        Code = $"CLO-{course.Code}-{compCode.Replace(".", "")}",
                        CompetencyId = competency.Id,
                        TargetLevel = courseLevel,
                        OutcomeType = "SKILL",
                        Statement = $"Người học có khả năng thực hiện thành thạo và tự chủ năng lực {compCode} ({compName}) ở mức {levelName}.",
                        SourceType = "OFFICIAL_FRAMEWORK",
                        SourceRef = "TT02/2025/TT-BGDĐT",
                        AssessmentMethod = "Bài kiểm tra trắc nghiệm cuối khóa và bài tập thực hành tình huống",
                        SortOrder = modSort,
                        CreatedAt = now,
                        UpdatedAt = now,
                    };
                    db.CourseLearningOutcomes.Add(clo);
                }

                modSort++;
            }

            // 4. Tạo PracticalTaskTemplate cho khóa học
            var taskRubric = new[]
            {
                new { criterion = "Tính chính xác và đầy đủ của kết quả", weightPercent = 40, description = "Hoàn thành đầy đủ các yêu cầu đề bài, kết quả chính xác theo quy chuẩn TT02" },
                new { criterion = "Quy trình thực hiện và kỹ năng số", weightPercent = 40, description = "Vận dụng đúng các công cụ, tuân thủ an toàn dữ liệu và tối ưu thời gian" },
                new { criterion = "Hình thức và khả năng ứng dụng thực tế", weightPercent = 20, description = "Trình bày rõ ràng, có tính khả thi áp dụng trực tiếp vào công việc hàng ngày" }
            };

            var taskTemplate = new PracticalTaskTemplate
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                RelatedCourseId = course.Id,
                Title = $"Bài thực hành dự án: Ứng dụng {course.Title} vào công việc thực tế",
                Description = $"Xây dựng tài liệu tác nghiệp hoặc sản phẩm số hoàn chỉnh giải quyết một bài toán cụ thể tại phòng ban của bạn, áp dụng toàn bộ các năng lực số thuộc miền {domainDef.Name}.",
                ExpectedOutput = "Bản báo cáo PDF, bảng tính dữ liệu hoặc liên kết tài liệu chia sẻ kèm mô tả chi tiết quy trình thực hiện.",
                GeneralMarkingCriteria = JsonSerializer.Serialize(taskRubric),
                SourceType = "MANUAL",
                Status = "ACTIVE",
                CreatedByUserId = authorUserId,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.PracticalTaskTemplates.Add(taskTemplate);

            // Gắn PracticalTaskTarget với các năng lực của miền
            var targetSort = 1;
            foreach (var compCode in domainDef.CompetencyCodes)
            {
                var compSourceCode = $"TT02-{compCode}";
                if (competencies.TryGetValue(compSourceCode, out var compEntity) || competencies.TryGetValue(compCode, out compEntity))
                {
                    db.PracticalTaskTargets.Add(new PracticalTaskTarget
                    {
                        Id = Guid.NewGuid(),
                        TaskTemplateId = taskTemplate.Id,
                        CompetencyId = compEntity.Id,
                        TargetLevel = courseLevel,
                        RubricCriteria = $"Đánh giá mức độ thành thạo năng lực {compCode} ở cấp độ {levelName}.",
                        SortOrder = targetSort++,
                        CreatedAt = now,
                        UpdatedAt = now,
                    });
                }
            }
        }

        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Seed tài khoản cá nhân mẫu cho kiểm thử và hiển thị demo:
    ///   - personal@digitalent.ai: Đã học xong khóa A1-F, A2-I, có chứng nhận thật đã phát hành.
    ///   - trial@digitalent.ai: Đang trong thời gian 7 ngày dùng thử.
    ///   - free@digitalent.ai: Gói Free (hết hạn dùng thử).
    /// </summary>
    public static async Task SeedDemoLearnerProfilesAsync(AppDbContext db, Guid organizationId)
    {
        var personalUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "personal@digitalent.ai");
        if (personalUser == null) return;

        var existingProfile = await db.LearnerProfiles.FirstOrDefaultAsync(p => p.UserId == personalUser.Id);
        if (existingProfile != null && !string.IsNullOrWhiteSpace(existingProfile.WorkspaceStateJson))
        {
            return; // Đã có dữ liệu
        }

        var now = DateTimeOffset.UtcNow;
        var passedDate = now.AddDays(-3);

        // Giả lập trạng thái đã pass khóa A1-F và A2-I
        var state = new PersonalLearningService.LearnerWorkspaceState
        {
            TargetCode = "ACCOUNTANT",
            TargetSetAt = now.AddDays(-14),
            TargetChangeCount = 1,
            Diagnostic = new PersonalLearningService.StoredDiagnostic
            {
                CompletedAt = now.AddDays(-14),
                DomainLevels = new[] { 2, 2, 1, 1, 1, 1 },
                Answers = new Dictionary<string, int>
                {
                    ["pq-1-1"] = 1, ["pq-1-2"] = 1, ["pq-2-1"] = 1, ["pq-2-2"] = 1,
                    ["pq-3-1"] = 1, ["pq-4-1"] = 1, ["pq-5-1"] = 1, ["pq-6-1"] = 1
                }
            },
            Attempts = new List<PersonalLearningService.StoredAttempt>
            {
                new()
                {
                    CourseId = "crs-a1-f",
                    At = passedDate.AddDays(-5),
                    Correct = 4,
                    Total = 4,
                    Passed = true
                },
                new()
                {
                    CourseId = "crs-a2-i",
                    At = passedDate,
                    Correct = 4,
                    Total = 4,
                    Passed = true
                }
            },
            Lessons = new Dictionary<string, Dictionary<string, DateTimeOffset>>
            {
                ["crs-a1-f"] = new()
                {
                    ["crs-a1-f-11-1"] = passedDate.AddDays(-6),
                    ["crs-a1-f-11-2"] = passedDate.AddDays(-6),
                    ["crs-a1-f-11-3"] = passedDate.AddDays(-6),
                    ["crs-a1-f-12-1"] = passedDate.AddDays(-5),
                    ["crs-a1-f-12-2"] = passedDate.AddDays(-5),
                    ["crs-a1-f-12-3"] = passedDate.AddDays(-5),
                    ["crs-a1-f-13-1"] = passedDate.AddDays(-5),
                    ["crs-a1-f-13-2"] = passedDate.AddDays(-5),
                    ["crs-a1-f-13-3"] = passedDate.AddDays(-5),
                },
                ["crs-a2-i"] = new()
                {
                    ["crs-a2-i-21-1"] = passedDate.AddDays(-4),
                    ["crs-a2-i-21-2"] = passedDate.AddDays(-4),
                    ["crs-a2-i-21-3"] = passedDate.AddDays(-4),
                    ["crs-a2-i-22-1"] = passedDate.AddDays(-3),
                    ["crs-a2-i-22-2"] = passedDate.AddDays(-3),
                    ["crs-a2-i-22-3"] = passedDate.AddDays(-3),
                }
            },
            TrialCourseIds = new List<string> { "crs-a1-f", "crs-a2-i" },
            Seen = new Dictionary<string, string>
            {
                ["target"] = passedDate.ToString("O"),
                ["diagnostic"] = passedDate.ToString("O"),
            }
        };

        if (existingProfile == null)
        {
            existingProfile = new LearnerProfile
            {
                Id = Guid.NewGuid(),
                UserId = personalUser.Id,
                TargetPositionCode = "ACCOUNTANT",
                TargetSetAt = now.AddDays(-14),
                TargetChangeCount = 1,
                WorkspaceStateJson = JsonSerializer.Serialize(state),
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.LearnerProfiles.Add(existingProfile);
        }
        else
        {
            existingProfile.TargetPositionCode = "ACCOUNTANT";
            existingProfile.TargetSetAt = now.AddDays(-14);
            existingProfile.TargetChangeCount = 1;
            existingProfile.WorkspaceStateJson = JsonSerializer.Serialize(state);
            existingProfile.UpdatedAt = now;
        }

        await db.SaveChangesAsync();
    }
}
