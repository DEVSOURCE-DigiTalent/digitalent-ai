using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu cho Skill Gap Engine & gợi ý khóa học. Chạy lại nhiều lần vẫn an toàn.
///   - Reference (mọi môi trường): tham số skill gap + trọng số gợi ý khóa học v1 cho mỗi tổ chức.
///   - Demo (chỉ Development): Khung năng lực số Thông tư 02/2025 (6 miền, 24 năng lực, mapping),
///     5 vị trí theo ma trận vị trí × năng lực (mỗi vị trí chọn năng lực phù hợp, D-B7), 18 khóa học F/I/A có tiên quyết,
///     employee@ là Kế toán đã có mức Cơ bản ở mọi năng lực (giả lập kết quả đánh giá đầu vào) — docs/specs/2026-09-29-tt02-position-competency-matrix.md §3–§8.
/// </summary>
public static class SkillGapSeeder
{
    public const string SkillGapSettingKey = SkillGapSettingsProvider.SettingKey;
    private const string SkillGapSettingValue = """{"mandatoryMultiplier":1.5}""";

    private static readonly (string Code, decimal Weight, string Notes)[] RecommendationWeights =
    {
        ("GAP_PRIORITY_COVERAGE", 70m, "Tỷ lệ tổng priority của các gap mà khóa học lấp được"),
        ("MANDATORY_COVERAGE", 20m, "Tỷ lệ năng lực bắt buộc đang thiếu mà khóa học dạy"),
        ("ENTRY_LEVEL_FIT", 10m, "Nhân viên đủ trình độ đầu vào của khóa học"),
    };

    private const string DemoEmployeeEmail = "employee@digitalent.ai";
    private const string DemoEmployeePosition = "ACCOUNTANT";

    /// <summary>manager@ trưởng phòng Operations: chọn Sales / CRM (gần nghiệp vụ vận hành, khách hàng nhất).</summary>
    private const string DemoManagerEmail = "manager@digitalent.ai";
    private const string DemoManagerPosition = "SALES_CRM";

    public static async Task SeedReferenceAsync(AppDbContext db)
    {
        var hasSetting = await db.SystemSettings.AnyAsync(s => s.OrganizationId == null && s.Key == SkillGapSettingKey);
        if (!hasSetting)
        {
            db.SystemSettings.Add(new SystemSetting
            {
                Key = SkillGapSettingKey,
                Value = SkillGapSettingValue,
                Description = "Skill gap: hệ số nhân priority của năng lực bắt buộc",
            });
        }

        var organizationIds = await db.Organizations.Select(o => o.Id).ToListAsync();
        var configuredOrganizationIds = await db.ScoringConfigs
            .Where(c => c.ConfigType == Statuses.ScoringConfigType.RecommendationWeights)
            .Select(c => c.OrganizationId)
            .Distinct()
            .ToListAsync();

        foreach (var organizationId in organizationIds.Except(configuredOrganizationIds))
        {
            var config = new ScoringConfig
            {
                OrganizationId = organizationId,
                ConfigType = Statuses.ScoringConfigType.RecommendationWeights,
                Version = 1,
                IsActive = true,
                Description = "Trọng số xếp hạng gợi ý khóa học mặc định (tổng = 100)",
            };
            db.ScoringConfigs.Add(config);
            db.ScoringConfigItems.AddRange(RecommendationWeights.Select(w => new ScoringConfigItem
            {
                ScoringConfigId = config.Id,
                ComponentCode = w.Code,
                Weight = w.Weight,
                Notes = w.Notes,
            }));
        }

        await db.SaveChangesAsync();
    }

    public static async Task SeedDemoAsync(AppDbContext db, Guid organizationId)
    {
        var firstCategoryCode = Tt02Catalog.Domains[0].CategoryCode;
        if (await db.CompetencyCategories.AnyAsync(c => c.OrganizationId == organizationId && c.Code == firstCategoryCode)
            || await db.Courses.AnyAsync(c => c.OrganizationId == organizationId))
        {
            return;
        }

        var users = await db.Users
            .Where(u => u.OrganizationId == organizationId)
            .ToDictionaryAsync(u => u.Email, u => u.Id);
        if (!users.TryGetValue("hr@digitalent.ai", out var hrUserId))
        {
            return; // Demo cần tài khoản HR để ghi người xác nhận năng lực
        }
        var authorUserId = users.GetValueOrDefault("trainer@digitalent.ai", hrUserId);

        var competencies = SeedFramework(db, organizationId);
        var positions = SeedPositions(db, organizationId, hrUserId, competencies);
        await AssignDemoEmployeeAsync(db, organizationId, DemoEmployeeEmail, positions[DemoEmployeePosition].Id);
        await AssignDemoEmployeeAsync(db, organizationId, DemoManagerEmail, positions[DemoManagerPosition].Id);
        await SeedEmployeeProfileAsync(db, organizationId, hrUserId, competencies);
        SeedCourses(db, organizationId, authorUserId, competencies);

        await db.SaveChangesAsync();
    }

    /// <summary>Khung TT02_2025, 6 nhóm = 6 miền, 24 năng lực (3 tiêu chí/mức) và 24 mapping DIRECT. Key = mã Thông tư ("4.2").</summary>
    private static Dictionary<string, Competency> SeedFramework(AppDbContext db, Guid organizationId)
    {
        var framework = new CompetencyFramework
        {
            Code = Tt02Catalog.FrameworkCode,
            Version = Tt02Catalog.FrameworkVersion,
            Name = Tt02Catalog.FrameworkName,
            Authority = Tt02Catalog.FrameworkAuthority,
            Jurisdiction = "VN",
            SourceUrl = Tt02Catalog.FrameworkSourceUrl,
            IsActive = true,
        };
        db.CompetencyFrameworks.Add(framework);

        var result = new Dictionary<string, Competency>();
        foreach (var domain in Tt02Catalog.Domains)
        {
            var category = new CompetencyCategory
            {
                OrganizationId = organizationId,
                Code = domain.CategoryCode,
                Name = $"{domain.Number}. {domain.Name}",
                Description = $"Miền {domain.Number} — Khung năng lực số, Thông tư 02/2025/TT-BGDĐT",
                SortOrder = domain.Number,
            };
            db.CompetencyCategories.Add(category);

            foreach (var definition in domain.Competencies)
            {
                var competency = NewCompetency(category.Id, domain, definition);
                db.Competencies.Add(competency);
                db.CompetencyFrameworkMappings.Add(new CompetencyFrameworkMapping
                {
                    CompetencyId = competency.Id,
                    FrameworkId = framework.Id,
                    SourceAreaCode = domain.Number.ToString(),
                    SourceCode = definition.SourceCode,
                    SourceName = definition.Name,
                    SourceLevelText = Tt02Catalog.SourceLevelText,
                    Relationship = "DIRECT",
                    IsPrimary = true,
                    MappingNote = Tt02Catalog.MappingNote,
                    SourceUrl = Tt02Catalog.FrameworkSourceUrl,
                });
                result[definition.SourceCode] = competency;
            }
        }

        return result;
    }

    /// <summary>Tiêu chí mỗi mức lấy từ tên module tương ứng của khóa F / I / A (khung chương trình, bảng C2).</summary>
    private static Competency NewCompetency(Guid categoryId, Tt02Catalog.DomainDefinition domain, Tt02Catalog.CompetencyDefinition definition)
    {
        var code = Tt02Catalog.CompetencyCode(definition.SourceCode);
        var competency = new Competency
        {
            CategoryId = categoryId,
            Code = code,
            Name = definition.Name,
            Description = $"Năng lực thành phần {definition.SourceCode} — miền {domain.Number}. {domain.Name}",
            CompetencyType = Statuses.CompetencyType.CoreDigital,
            Status = Statuses.Competency.Active,
        };
        for (var level = 1; level <= 3; level++)
        {
            competency.Criteria.Add(new CompetencyLevelCriterion
            {
                CompetencyId = competency.Id,
                Level = level,
                IndicatorCode = $"{code}-L{level}",
                BehaviorIndicator = $"{Tt02Catalog.LevelNames[level - 1]}: {definition.ModuleTitles[level - 1]} "
                                    + $"(module {domain.CourseCode(level)}-M{Array.IndexOf(domain.Competencies, definition) + 1})",
                SortOrder = level,
            });
        }

        return competency;
    }

    private static Dictionary<string, JobPosition> SeedPositions(
        AppDbContext db, Guid organizationId, Guid hrUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        var family = new JobFamily { OrganizationId = organizationId, Code = "OFFICE", Name = "Khối văn phòng" };
        db.JobFamilies.Add(family);

        var now = DateTimeOffset.UtcNow;
        var result = new Dictionary<string, JobPosition>();
        foreach (var definition in Tt02Catalog.Positions)
        {
            var position = new JobPosition
            {
                OrganizationId = organizationId,
                JobFamilyId = family.Id,
                Code = definition.Code,
                Name = definition.Name,
            };
            db.JobPositions.Add(position);

            var set = new PositionRequirementSet
            {
                JobPositionId = position.Id,
                VersionNo = 1,
                Status = Statuses.PositionRequirementSet.Active,
                EffectiveFrom = DateOnly.FromDateTime(now.UtcDateTime),
                CreatedByUserId = hrUserId,
                ActivatedByUserId = hrUserId,
                ActivatedAt = now,
            };
            foreach (var line in Tt02Catalog.RequirementsFor(definition))
            {
                set.Items.Add(new PositionRequirementItem
                {
                    RequirementSetId = set.Id,
                    CompetencyId = competencies[line.SourceCode].Id,
                    RequiredLevel = line.RequiredLevel,
                    WeightPercent = line.WeightPercent,
                    IsMandatory = line.Mandatory,
                });
            }
            db.PositionRequirementSets.Add(set);
            result[definition.Code] = position;
        }

        return result;
    }

    private static async Task AssignDemoEmployeeAsync(AppDbContext db, Guid organizationId, string email, Guid positionId)
    {
        var employee = await db.Employees
            .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.JobPositionId == null && e.WorkEmail == email);
        if (employee != null)
        {
            employee.JobPositionId = positionId;
        }
    }

    /// <summary>employee@ (Kế toán): mọi năng lực đã xác nhận ở mức Cơ bản — kịch bản demo §8 bước 2.</summary>
    private static async Task SeedEmployeeProfileAsync(
        AppDbContext db, Guid organizationId, Guid hrUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        var employee = await db.Employees
            .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.WorkEmail == DemoEmployeeEmail);
        if (employee == null)
        {
            return;
        }

        const short basicLevel = 1;
        var now = DateTimeOffset.UtcNow;
        foreach (var competency in competencies.Values)
        {
            var evidence = new CompetencyEvidence
            {
                EmployeeId = employee.Id,
                CompetencyId = competency.Id,
                SourceType = Statuses.EvidenceSourceType.Migration,
                Status = Statuses.EvidenceStatus.Confirmed,
                IsLevelConfirming = true,
                ConfirmedLevel = basicLevel,
                ConfirmedByUserId = hrUserId,
                ConfirmedAt = now,
                ReviewNote = "Dữ liệu năng lực ban đầu (demo seed)",
            };
            db.CompetencyEvidences.Add(evidence);
            db.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
            {
                EmployeeId = employee.Id,
                CompetencyId = competency.Id,
                ConfirmedLevel = basicLevel,
                LatestConfirmingEvidenceId = evidence.Id,
                ConfirmedAt = now,
                RowVersion = 1,
            });
        }
    }

    /// <summary>
    /// 18 khóa PUBLISHED (3 mức × 6 miền): mỗi khóa phủ mọi năng lực của miền ở mức khóa, entry_level = mức − 1
    /// (tối thiểu 1), tiên quyết F → I → A. Thêm 1 khóa DRAFT để kiểm "không gợi ý khóa nháp".
    /// </summary>
    private static void SeedCourses(
        AppDbContext db, Guid organizationId, Guid authorUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        foreach (var domain in Tt02Catalog.Domains)
        {
            Course? previous = null;
            for (short level = 1; level <= 3; level++)
            {
                var course = AddCourse(db, organizationId, authorUserId, domain.CourseCode(level), domain.CourseTitles[level - 1],
                    Math.Max((short)1, (short)(level - 1)), domain.CourseMinutes(level), Statuses.Course.Published,
                    domain.Competencies.Select(c => competencies[c.SourceCode]), level);
                if (previous != null)
                {
                    db.CoursePrerequisites.Add(new CoursePrerequisite { CourseId = course.Id, PrerequisiteCourseId = previous.Id });
                }
                previous = course;
            }
        }

        var aiDomain = Tt02Catalog.Domains[^1];
        AddCourse(db, organizationId, authorUserId, "AI-OFFICE", "AI cho công việc văn phòng (bản nháp)", 1, 300,
            Statuses.Course.Draft, aiDomain.Competencies.Select(c => competencies[c.SourceCode]), 2);
    }

    private static Course AddCourse(
        AppDbContext db, Guid organizationId, Guid authorUserId, string code, string title, short entryLevel, int minutes,
        string status, IEnumerable<Competency> teaches, short targetLevel)
    {
        var course = new Course
        {
            OrganizationId = organizationId,
            Code = code,
            VersionNo = 1,
            Title = title,
            EntryLevel = entryLevel,
            EstimatedDurationMinutes = minutes,
            CertificateEnabled = true,
            Status = status,
            CreatedByUserId = authorUserId,
            RowVersion = 1,
        };
        db.Courses.Add(course);
        db.CourseCompetencies.AddRange(teaches.Select(c => new CourseCompetency
        {
            CourseId = course.Id,
            CompetencyId = c.Id,
            TargetLevel = targetLevel,
            CoverageType = Statuses.CourseCoverageType.Primary,
        }));
        return course;
    }
}
