using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu cho Skill Gap Engine & gợi ý khóa học (Sprint 3 —
/// docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md §11). Chạy lại nhiều lần vẫn an toàn.
///   - Reference (mọi môi trường): tham số skill gap + trọng số gợi ý khóa học v1 cho mỗi tổ chức.
///   - Demo (chỉ Development): vị trí Data Analyst, 5 năng lực, hồ sơ năng lực của employee@, 4 khóa học
///     — đúng ví dụ tính tay §4.5 / §5.3 của spec.
/// </summary>
public static class SkillGapSeeder
{
    public const string SkillGapSettingKey = SkillGapSettingsProvider.SettingKey;
    private const string SkillGapSettingValue = """{"mandatoryMultiplier":1.5,"mediumWeightThreshold":20}""";

    private static readonly (string Code, decimal Weight, string Notes)[] RecommendationWeights =
    {
        ("GAP_PRIORITY_COVERAGE", 70m, "Tỷ lệ tổng priority của các gap mà khóa học lấp được"),
        ("MANDATORY_COVERAGE", 20m, "Tỷ lệ năng lực bắt buộc đang thiếu mà khóa học dạy"),
        ("ENTRY_LEVEL_FIT", 10m, "Nhân viên đủ trình độ đầu vào của khóa học"),
    };

    private const string DemoCategoryCode = "DIGITAL_CORE";

    public static async Task SeedReferenceAsync(AppDbContext db)
    {
        var hasSetting = await db.SystemSettings.AnyAsync(s => s.OrganizationId == null && s.Key == SkillGapSettingKey);
        if (!hasSetting)
        {
            db.SystemSettings.Add(new SystemSetting
            {
                Key = SkillGapSettingKey,
                Value = SkillGapSettingValue,
                Description = "Skill gap: hệ số nhân năng lực bắt buộc và ngưỡng trọng số (%) để xếp mức MEDIUM",
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
        if (await db.CompetencyCategories.AnyAsync(c => c.OrganizationId == organizationId && c.Code == DemoCategoryCode))
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

        var competencies = SeedCompetencies(db, organizationId);
        var position = SeedDataAnalystPosition(db, organizationId, hrUserId, competencies);
        await AssignDemoEmployeesAsync(db, organizationId, position.Id);
        await SeedEmployeeProfileAsync(db, organizationId, hrUserId, competencies);
        SeedCourses(db, organizationId, authorUserId, competencies);

        await db.SaveChangesAsync();
    }

    private static Dictionary<string, Competency> SeedCompetencies(AppDbContext db, Guid organizationId)
    {
        var category = new CompetencyCategory
        {
            OrganizationId = organizationId,
            Code = DemoCategoryCode,
            Name = "Năng lực số cốt lõi",
            Description = "Nhóm năng lực số dùng cho demo Skill Gap (DigComp 3.0)",
        };
        db.CompetencyCategories.Add(category);

        var definitions = new[]
        {
            ("DATA_LITERACY", "Data literacy", "Đọc, làm sạch, phân tích và trình bày dữ liệu"),
            ("DIGITAL_COMMUNICATION", "Digital communication", "Giao tiếp và cộng tác qua công cụ số"),
            ("INFORMATION_SECURITY", "Information security", "Bảo vệ thiết bị, dữ liệu và danh tính số"),
            ("AI_LITERACY", "AI literacy", "Sử dụng công cụ AI hiệu quả và có trách nhiệm"),
            ("PROBLEM_SOLVING", "Digital problem solving", "Xác định và giải quyết vấn đề bằng công cụ số"),
        };
        var levelNames = new[] { "Cơ bản", "Trung cấp", "Nâng cao" };

        var result = new Dictionary<string, Competency>();
        foreach (var (code, name, description) in definitions)
        {
            var competency = new Competency
            {
                CategoryId = category.Id,
                Code = code,
                Name = name,
                Description = description,
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
                    BehaviorIndicator = $"{name} ở mức {levelNames[level - 1]}: {description.ToLowerInvariant()}.",
                    SortOrder = level,
                });
            }
            db.Competencies.Add(competency);
            result[code] = competency;
        }

        return result;
    }

    private static JobPosition SeedDataAnalystPosition(
        AppDbContext db, Guid organizationId, Guid hrUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        var family = new JobFamily { OrganizationId = organizationId, Code = "DATA_ANALYTICS", Name = "Data & Analytics" };
        var position = new JobPosition
        {
            OrganizationId = organizationId,
            JobFamilyId = family.Id,
            Code = "DATA_ANALYST",
            Name = "Data Analyst",
        };
        db.JobFamilies.Add(family);
        db.JobPositions.Add(position);

        var now = DateTimeOffset.UtcNow;
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

        // Bảng ví dụ §4.5 của spec — tổng trọng số = 100
        var requirements = new (string Code, int Level, decimal Weight, bool Mandatory)[]
        {
            ("DATA_LITERACY", 3, 30m, true),
            ("DIGITAL_COMMUNICATION", 2, 20m, false),
            ("INFORMATION_SECURITY", 2, 25m, true),
            ("AI_LITERACY", 2, 15m, false),
            ("PROBLEM_SOLVING", 1, 10m, false),
        };
        foreach (var (code, level, weight, mandatory) in requirements)
        {
            set.Items.Add(new PositionRequirementItem
            {
                RequirementSetId = set.Id,
                CompetencyId = competencies[code].Id,
                RequiredLevel = level,
                WeightPercent = weight,
                IsMandatory = mandatory,
            });
        }
        db.PositionRequirementSets.Add(set);

        return position;
    }

    private static async Task AssignDemoEmployeesAsync(AppDbContext db, Guid organizationId, Guid positionId)
    {
        var demoEmails = new[] { "employee@digitalent.ai", "manager@digitalent.ai" };
        var employees = await db.Employees
            .Where(e => e.OrganizationId == organizationId && e.JobPositionId == null && demoEmails.Contains(e.WorkEmail!))
            .ToListAsync();

        foreach (var employee in employees)
        {
            employee.JobPositionId = positionId;
        }
    }

    private static async Task SeedEmployeeProfileAsync(
        AppDbContext db, Guid organizationId, Guid hrUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        var employee = await db.Employees
            .FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.WorkEmail == "employee@digitalent.ai");
        if (employee == null)
        {
            return;
        }

        // INFORMATION_SECURITY cố ý chưa có → current_level NULL trong ví dụ §4.5
        var confirmedLevels = new (string Code, short Level)[]
        {
            ("DATA_LITERACY", 1),
            ("DIGITAL_COMMUNICATION", 2),
            ("AI_LITERACY", 1),
            ("PROBLEM_SOLVING", 3),
        };
        var now = DateTimeOffset.UtcNow;
        foreach (var (code, level) in confirmedLevels)
        {
            var evidence = new CompetencyEvidence
            {
                EmployeeId = employee.Id,
                CompetencyId = competencies[code].Id,
                SourceType = Statuses.EvidenceSourceType.Migration,
                Status = Statuses.EvidenceStatus.Confirmed,
                IsLevelConfirming = true,
                ConfirmedLevel = level,
                ConfirmedByUserId = hrUserId,
                ConfirmedAt = now,
                ReviewNote = "Dữ liệu năng lực ban đầu (demo seed)",
            };
            db.CompetencyEvidences.Add(evidence);
            db.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
            {
                EmployeeId = employee.Id,
                CompetencyId = competencies[code].Id,
                ConfirmedLevel = level,
                LatestConfirmingEvidenceId = evidence.Id,
                ConfirmedAt = now,
                RowVersion = 1,
            });
        }
    }

    private static void SeedCourses(
        AppDbContext db, Guid organizationId, Guid authorUserId, IReadOnlyDictionary<string, Competency> competencies)
    {
        // Ví dụ §5.3 của spec: kỳ vọng xếp hạng K3 > K2 > K1, K4 (DRAFT) bị loại
        var courses = new (string Code, string Title, short? EntryLevel, int Minutes, string Status, (string Competency, short Target, string Coverage)[] Teaches)[]
        {
            ("DA-EXCEL-PBI", "Excel & Power BI cho phân tích dữ liệu", 1, 480, Statuses.Course.Published,
                new[] { ("DATA_LITERACY", (short)2, Statuses.CourseCoverageType.Primary), ("AI_LITERACY", (short)2, Statuses.CourseCoverageType.Supporting) }),
            ("SEC-BASIC", "An toàn thông tin cơ bản", null, 240, Statuses.Course.Published,
                new[] { ("INFORMATION_SECURITY", (short)2, Statuses.CourseCoverageType.Primary) }),
            ("DA-ADVANCED", "Phân tích dữ liệu nâng cao", 2, 720, Statuses.Course.Published,
                new[] { ("DATA_LITERACY", (short)3, Statuses.CourseCoverageType.Primary) }),
            ("AI-OFFICE", "AI cho công việc văn phòng", 1, 300, Statuses.Course.Draft,
                new[] { ("AI_LITERACY", (short)2, Statuses.CourseCoverageType.Primary) }),
        };

        foreach (var (code, title, entryLevel, minutes, status, teaches) in courses)
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
            db.CourseCompetencies.AddRange(teaches.Select(t => new CourseCompetency
            {
                CourseId = course.Id,
                CompetencyId = competencies[t.Competency].Id,
                TargetLevel = t.Target,
                CoverageType = t.Coverage,
            }));
        }
    }
}
