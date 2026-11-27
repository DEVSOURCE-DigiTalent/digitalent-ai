using System.Security.Cryptography;
using System.Text;
using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Email;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public sealed record DemoSeedAccountRecord(
    string OrganizationName,
    string OrganizationCode,
    string Role,
    string FullName,
    string DepartmentName,
    string PositionName,
    string StatusGroup,
    string Email,
    string Password,
    bool ExportToCsv);

public sealed record DemoSeedResult(
    int OrganizationsSeeded,
    int UsersCreated,
    int EmployeesCreated,
    string CsvPath,
    IReadOnlyList<DemoSeedAccountRecord> ExportedAccounts);

/// <summary>
/// Seeder dữ liệu demo và tài khoản dùng thử chuẩn cho Mentor & Doanh nghiệp:
///   - Idempotent (`seed-demo`): tổ chức đã có được giữ nguyên, không nhân đôi dữ liệu.
///   - Reset an toàn (`reset-seed-demo`): chỉ xóa tổ chức mã `DEMO-*` và user `@demo.nanglucso.pro.vn`,
///     in thống kê số bản ghi sẽ xóa trước khi xóa, rồi seed lại từ đầu.
///   - Sử dụng trực tiếp các entity & service sẵn có (TrialAssessmentPaper, PulseQuizReader, PulseExamPaper,
///     DecidePulseFinalUseCase, MyCertificateIssuer, SkillGapRunService, AuditService).
/// </summary>
public static class DemoCaseStudySeeder
{
    public const string DemoOrgPrefix = "DEMO-";
    public const string MainOrgCode = "DEMO-MAIN";
    public const string MainOrgName = "Công ty Demo Dịch vụ Văn phòng";
    public const string DemoEmailDomain = DemoEmailGuard.DemoDomainSuffix; // @demo.nanglucso.pro.vn
    public const string PlatformAdminEmail = "platform-admin" + DemoEmailDomain;
    public const string MentorEmail = "mentor" + DemoEmailDomain;

    private static readonly string[] PurchasedIntermediateCodes = { "M1-I", "M2-I", "M4-I" };

    private sealed record DepartmentSpec(string Code, string Name, int[] DomainCeilings, string ManagerPositionCode);
    private sealed record PositionSpec(string Code, string Name, string[] CompetencyCodes, Dictionary<int, int> DomainLevels);
    private sealed record EmployeeTemplate(int Index, string DepartmentCode, string PositionCode, string StatusGroup, string SubState);

    private static readonly DepartmentSpec[] DepartmentSpecs =
    {
        new("ACC", "Kế toán", new[] { 2, 2, 1, 2, 1, 1 }, "CEO"),
        new("BIZ_OPS", "Kinh doanh / Vận hành", new[] { 2, 2, 1, 2, 1, 1 }, "SALES_CRM"),
        new("HR_ADMIN", "Hành chính – Nhân sự", new[] { 1, 2, 1, 2, 1, 1 }, "HR"),
    };

    // 5 vị trí cốt lõi: mã chuẩn hệ thống + tên hiển thị tiếng Việt theo case study; mỗi vị trí 15–18 năng lực (9..24),
    // bắt buộc có 4.1 và 4.2, tổng trọng số đúng 100.00%.
    private static readonly PositionSpec[] PositionSpecs =
    {
        new("ACCOUNTANT", "Kế toán viên",
            new[] { "1.1", "1.2", "1.3", "2.1", "2.2", "2.4", "3.1", "3.2", "4.1", "4.2", "4.3", "5.1", "5.2", "6.1", "6.2", "6.3" },
            new Dictionary<int, int> { [1] = 2, [2] = 2, [3] = 1, [4] = 2, [5] = 1, [6] = 1 }),
        new("CEO", "Kế toán trưởng",
            new[] { "1.1", "1.2", "1.3", "2.1", "2.2", "2.4", "2.5", "3.1", "3.3", "4.1", "4.2", "4.3", "5.1", "5.2", "5.3", "6.1", "6.2", "6.3" },
            new Dictionary<int, int> { [1] = 2, [2] = 2, [3] = 1, [4] = 2, [5] = 2, [6] = 2 }),
        new("SALES_CRM", "Nhân viên kinh doanh",
            new[] { "1.1", "1.2", "2.1", "2.2", "2.4", "2.5", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2", "6.1", "6.2", "6.3" },
            new Dictionary<int, int> { [1] = 2, [2] = 2, [3] = 1, [4] = 2, [5] = 1, [6] = 1 }),
        new("MARKETING", "Nhân viên vận hành",
            new[] { "1.1", "1.2", "1.3", "2.1", "2.2", "2.4", "3.1", "3.2", "4.1", "4.2", "5.1", "5.2", "6.1", "6.2", "6.3" },
            new Dictionary<int, int> { [1] = 2, [2] = 2, [3] = 1, [4] = 2, [5] = 1, [6] = 1 }),
        new("HR", "Nhân viên hành chính – nhân sự",
            new[] { "1.1", "1.2", "1.3", "2.1", "2.2", "2.4", "2.5", "3.1", "3.3", "4.1", "4.2", "4.3", "5.1", "5.2", "6.1", "6.2", "6.3" },
            new Dictionary<int, int> { [1] = 1, [2] = 2, [3] = 1, [4] = 2, [5] = 1, [6] = 1 }),
    };

    // 30 nhân viên mỗi tổ chức: 8 Nhóm A, 8 Nhóm B (3 chờ chấm, 1 trượt lần 1, 4 đang học), 8 Nhóm C, 6 Nhóm D.
    private static readonly EmployeeTemplate[] EmployeeTemplates =
    {
        // Nhóm A (8): hoàn thành toàn bộ luồng → Mentor PASSED → chứng chỉ + MET
        new(1,  "ACC",      "ACCOUNTANT", "A", "PASSED_M1_I"),
        new(2,  "ACC",      "ACCOUNTANT", "A", "PASSED_M4_I"),
        new(3,  "ACC",      "CEO",        "A", "PASSED_M2_I"),
        new(4,  "BIZ_OPS",  "SALES_CRM",  "A", "PASSED_M1_I"),
        new(5,  "BIZ_OPS",  "MARKETING",  "A", "PASSED_M2_I"),
        new(6,  "BIZ_OPS",  "SALES_CRM",  "A", "PASSED_M4_I"),
        new(7,  "HR_ADMIN", "HR",         "A", "PASSED_M2_I"),
        new(8,  "HR_ADMIN", "HR",         "A", "PASSED_M4_I"),

        // Nhóm B (8): 3 chờ chấm (LOW / MEDIUM / HIGH risk), 1 trượt lần 1 chờ thi lại, 4 đang học dở
        new(9,  "ACC",      "ACCOUNTANT", "B", "PENDING_LOW"),
        new(10, "BIZ_OPS",  "SALES_CRM",  "B", "PENDING_MEDIUM"),
        new(11, "HR_ADMIN", "HR",         "B", "PENDING_HIGH"),
        new(12, "ACC",      "ACCOUNTANT", "B", "FAILED_ONCE"),
        new(13, "ACC",      "CEO",        "B", "IN_PROGRESS_75"),
        new(14, "BIZ_OPS",  "MARKETING",  "B", "IN_PROGRESS_50"),
        new(15, "BIZ_OPS",  "MARKETING",  "B", "IN_PROGRESS_25"),
        new(16, "HR_ADMIN", "HR",         "B", "IN_PROGRESS_50"),

        // Nhóm C (8): có GAP, chưa bắt đầu học
        new(17, "ACC",      "ACCOUNTANT", "C", "NOT_STARTED"),
        new(18, "ACC",      "ACCOUNTANT", "C", "NOT_STARTED"),
        new(19, "ACC",      "CEO",        "C", "NOT_STARTED"),
        new(20, "BIZ_OPS",  "SALES_CRM",  "C", "NOT_STARTED"),
        new(21, "BIZ_OPS",  "MARKETING",  "C", "NOT_STARTED"),
        new(22, "BIZ_OPS",  "MARKETING",  "C", "NOT_STARTED"),
        new(23, "HR_ADMIN", "HR",         "C", "NOT_STARTED"),
        new(24, "HR_ADMIN", "HR",         "C", "NOT_STARTED"),

        // Nhóm D (6): đạt chuẩn ngay từ khảo sát 90 câu (MET, không cần học)
        new(25, "ACC",      "ACCOUNTANT", "D", "MET_BASELINE"),
        new(26, "ACC",      "ACCOUNTANT", "D", "MET_BASELINE"),
        new(27, "BIZ_OPS",  "SALES_CRM",  "D", "MET_BASELINE"),
        new(28, "BIZ_OPS",  "MARKETING",  "D", "MET_BASELINE"),
        new(29, "HR_ADMIN", "HR",         "D", "MET_BASELINE"),
        new(30, "HR_ADMIN", "HR",         "D", "MET_BASELINE"),
    };

    private static readonly string[] LastNames =
        { "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý" };
    private static readonly string[] MiddleNames =
        { "Minh", "Thị Thu", "Quốc", "Thị Lan", "Gia", "Ngọc", "Văn", "Thị Mai", "Đức", "Thị Hương", "Hoài", "Thị Thanh", "Anh", "Khánh" };
    private static readonly string[] FirstNames =
        { "An", "Bình", "Châu", "Dũng", "Giang", "Hà", "Hải", "Hiếu", "Hùng", "Khang", "Khánh", "Linh", "Long", "My", "Nam", "Ngân", "Nhung", "Phúc", "Phương", "Quân", "Quỳnh", "Sơn", "Tâm", "Thảo", "Thịnh", "Trang", "Trí", "Trung", "Tú", "Vy", "Yến" };

    public static async Task<DemoSeedResult> SeedAsync(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        string csvOutputPath,
        int trialOrgCount = 10,
        CancellationToken cancellationToken = default)
    {
        if (trialOrgCount < 0) throw new ArgumentOutOfRangeException(nameof(trialOrgCount));

        await DbSeeder.SeedReferenceDataAsync(db);
        await SkillGapSeeder.SeedReferenceAsync(db);

        var previousPasswords = LoadExistingCsvPasswords(csvOutputPath);
        var accounts = new List<DemoSeedAccountRecord>();
        var usersCreated = 0;
        var employeesCreated = 0;
        var orgsSeeded = 0;

        // 1. Tài khoản dùng chung cấp Platform (PLATFORM_ADMIN & MENTOR)
        var (platformAdmin, adminCreated, adminPwd) = await EnsurePlatformUserAsync(
            db, passwordHasher, PlatformAdminEmail, "Quản trị Nền tảng Demo", Roles.PlatformAdmin);
        if (adminCreated) usersCreated++;
        accounts.Add(new DemoSeedAccountRecord(
            "DigiTalent Platform", "PLATFORM", Roles.PlatformAdmin, platformAdmin.DisplayName,
            "—", "—", "—", platformAdmin.Email, adminPwd, ExportToCsv: true));

        var (mentor, mentorCreated, mentorPwd) = await EnsurePlatformUserAsync(
            db, passwordHasher, MentorEmail, "Mentor Thẩm định Demo", Roles.Mentor);
        if (mentorCreated) usersCreated++;
        accounts.Add(new DemoSeedAccountRecord(
            "DigiTalent Platform", "PLATFORM", Roles.Mentor, mentor.DisplayName,
            "—", "—", "—", mentor.Email, mentorPwd, ExportToCsv: true));

        // 2. Tổ chức chính cho Mentor / Cô (DEMO-MAIN)
        var mainStats = await SeedOrganizationCaseStudyAsync(
            db, passwordHasher, mentor, orgIndex: 0, MainOrgCode, MainOrgName, "main", isMainOrg: true, accounts, cancellationToken);
        orgsSeeded += mainStats.Seeded ? 1 : 0;
        usersCreated += mainStats.UsersCreated;
        employeesCreated += mainStats.EmployeesCreated;
        db.ChangeTracker.Clear();

        // 3. 10 tổ chức doanh nghiệp dùng thử độc lập (DEMO-DN-01 .. DEMO-DN-10)
        for (var i = 1; i <= trialOrgCount; i++)
        {
            var code = $"{DemoOrgPrefix}DN-{i:00}";
            var name = $"Demo DN {i:00}";
            var slug = $"dn{i:00}";
            var stats = await SeedOrganizationCaseStudyAsync(
                db, passwordHasher, mentor, orgIndex: i, code, name, slug, isMainOrg: false, accounts, cancellationToken);
            orgsSeeded += stats.Seeded ? 1 : 0;
            usersCreated += stats.UsersCreated;
            employeesCreated += stats.EmployeesCreated;
            db.ChangeTracker.Clear();
        }

        var mergedAccounts = accounts
            .Where(a => a.ExportToCsv)
            .Select(a => a.Password.StartsWith("(đã tồn tại", StringComparison.Ordinal) && previousPasswords.TryGetValue(a.Email, out var prevPwd)
                ? a with { Password = prevPwd }
                : a)
            .ToList();

        WriteCsv(csvOutputPath, mergedAccounts);
        return new DemoSeedResult(orgsSeeded, usersCreated, employeesCreated, Path.GetFullPath(csvOutputPath), mergedAccounts);
    }

    /// <summary>
    /// Sinh lại mật khẩu dễ đọc (DemoXXX-xxxx-xxxx) cho toàn bộ user @demo.nanglucso.pro.vn,
    /// cập nhật hash trong DB và xuất lại demo-accounts.csv mà không xóa/seed lại dữ liệu nghiệp vụ.
    /// </summary>
    public static async Task<DemoSeedResult> ResetDemoPasswordsAsync(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        string csvOutputPath,
        int trialOrgCount = 10,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        var demoUsers = await db.Users
            .Where(u => u.Email.EndsWith(DemoEmailDomain))
            .OrderBy(u => u.Email)
            .ToListAsync(cancellationToken);

        var newPasswords = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var user in demoUsers)
        {
            var password = GenerateStrongPassword();
            user.PasswordHash = passwordHasher.Hash(password);
            user.EmailVerifiedAt ??= now;
            user.LastLoginAt ??= now.AddDays(-2);
            newPasswords[user.Email] = password;
        }

        await db.SaveChangesAsync(cancellationToken);

        var accounts = new List<DemoSeedAccountRecord>();
        var platformAdmin = demoUsers.FirstOrDefault(u => u.Email.Equals(PlatformAdminEmail, StringComparison.OrdinalIgnoreCase));
        if (platformAdmin != null)
        {
            accounts.Add(new DemoSeedAccountRecord(
                "DigiTalent Platform", "PLATFORM", Roles.PlatformAdmin, platformAdmin.DisplayName,
                "—", "—", "—", platformAdmin.Email, newPasswords[platformAdmin.Email], ExportToCsv: true));
        }

        var mentor = demoUsers.FirstOrDefault(u => u.Email.Equals(MentorEmail, StringComparison.OrdinalIgnoreCase));
        if (mentor != null)
        {
            accounts.Add(new DemoSeedAccountRecord(
                "DigiTalent Platform", "PLATFORM", Roles.Mentor, mentor.DisplayName,
                "—", "—", "—", mentor.Email, newPasswords[mentor.Email], ExportToCsv: true));
        }

        var mainOrg = await db.Organizations.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Code == MainOrgCode, cancellationToken);
        if (mainOrg != null)
        {
            await CollectExistingAccountsForCsvAsync(db, mainOrg, MainOrgName, "main", isMainOrg: true, accounts, cancellationToken);
        }

        var orgsFound = mainOrg != null ? 1 : 0;
        for (var i = 1; i <= trialOrgCount; i++)
        {
            var code = $"{DemoOrgPrefix}DN-{i:00}";
            var org = await db.Organizations.AsNoTracking()
                .FirstOrDefaultAsync(o => o.Code == code, cancellationToken);
            if (org == null) continue;

            orgsFound++;
            await CollectExistingAccountsForCsvAsync(db, org, $"Demo DN {i:00}", $"dn{i:00}", isMainOrg: false, accounts, cancellationToken);
        }

        var exported = accounts
            .Where(a => a.ExportToCsv)
            .Select(a => newPasswords.TryGetValue(a.Email, out var freshPwd) ? a with { Password = freshPwd } : a)
            .ToList();

        WriteCsv(csvOutputPath, exported);
        return new DemoSeedResult(orgsFound, demoUsers.Count, 0, Path.GetFullPath(csvOutputPath), exported);
    }

    private static Dictionary<string, string> LoadExistingCsvPasswords(string path)
    {
        var map = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (!File.Exists(path)) return map;

        foreach (var line in File.ReadLines(path).Skip(1))
        {
            var cols = ParseCsvLine(line);
            if (cols.Count >= 8 && !string.IsNullOrWhiteSpace(cols[6]) && !string.IsNullOrWhiteSpace(cols[7]) && !cols[7].StartsWith("(đã tồn tại", StringComparison.Ordinal))
            {
                map[cols[6].Trim().ToLowerInvariant()] = cols[7];
            }
        }
        return map;
    }

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var current = new StringBuilder();
        var inQuotes = false;
        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"') { current.Append('"'); i++; }
                else inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else current.Append(c);
        }
        result.Add(current.ToString());
        return result;
    }

    public static async Task<DemoSeedResult> ResetAndReseedAsync(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        string csvOutputPath,
        int trialOrgCount = 10,
        Action<string>? log = null,
        CancellationToken cancellationToken = default)
    {
        await DeleteDemoDataAsync(db, log, cancellationToken);
        db.ChangeTracker.Clear();
        return await SeedAsync(db, passwordHasher, csvOutputPath, trialOrgCount, cancellationToken);
    }

    public static async Task DeleteDemoDataAsync(AppDbContext db, Action<string>? log = null, CancellationToken cancellationToken = default)
    {
        var demoOrgs = await db.Organizations.AsNoTracking()
            .Where(o => o.Code.StartsWith(DemoOrgPrefix))
            .Select(o => new { o.Id, o.Code })
            .ToListAsync(cancellationToken);
        var demoUsers = await db.Users.AsNoTracking()
            .Where(u => u.Email.ToLower().EndsWith(DemoEmailDomain))
            .Select(u => new { u.Id, u.Email })
            .ToListAsync(cancellationToken);

        // Guard kép bắt buộc trước khi xóa: tuyệt đối không chạm dữ liệu ngoài DEMO-* và @demo.nanglucso.pro.vn
        if (demoOrgs.Any(o => !o.Code.StartsWith(DemoOrgPrefix, StringComparison.Ordinal)))
        {
            throw new InvalidOperationException("Safety check failed: non-DEMO organization matched.");
        }
        if (demoUsers.Any(u => !DemoEmailGuard.IsDemoAddress(u.Email)))
        {
            throw new InvalidOperationException("Safety check failed: non-demo email matched.");
        }

        var orgIds = demoOrgs.Select(o => o.Id).ToList();
        var userIds = demoUsers.Select(u => u.Id).ToList();
        if (orgIds.Count == 0 && userIds.Count == 0)
        {
            log?.Invoke("[reset-seed-demo] Không có dữ liệu DEMO-* hoặc @demo.nanglucso.pro.vn cần xóa.");
            return;
        }

        var empIds = await db.Employees.AsNoTracking()
            .Where(e => orgIds.Contains(e.OrganizationId) || (e.UserId != null && userIds.Contains(e.UserId.Value)))
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);
        var deptIds = await db.Departments.AsNoTracking()
            .Where(d => orgIds.Contains(d.OrganizationId))
            .Select(d => d.Id)
            .ToListAsync(cancellationToken);
        var posIds = await db.JobPositions.AsNoTracking()
            .Where(p => orgIds.Contains(p.OrganizationId))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);
        var courseIds = await db.Courses.AsNoTracking()
            .Where(c => orgIds.Contains(c.OrganizationId))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);
        var enrollmentIds = await db.Enrollments.AsNoTracking()
            .Where(e => empIds.Contains(e.EmployeeId) || courseIds.Contains(e.CourseId))
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);
        var finalSubIds = await db.CourseFinalSubmissions.AsNoTracking()
            .Where(s => enrollmentIds.Contains(s.EnrollmentId))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);
        var preIds = await db.CoursePreAssessments.AsNoTracking()
            .Where(p => empIds.Contains(p.EmployeeId) || courseIds.Contains(p.CourseId))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);
        var trialAssessmentIds = await db.TrialAssessments.AsNoTracking()
            .Where(t => orgIds.Contains(t.OrganizationId) || empIds.Contains(t.EmployeeId))
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);
        var proctoringSessionIds = await db.ProctoringSessions.AsNoTracking()
            .Where(s => empIds.Contains(s.EmployeeId))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);
        var assessmentIds = await db.Assessments.AsNoTracking()
            .Where(a => courseIds.Contains(a.CourseId))
            .Select(a => a.Id)
            .ToListAsync(cancellationToken);
        var attemptIds = await db.AssessmentAttempts.AsNoTracking()
            .Where(a => enrollmentIds.Contains(a.EnrollmentId) || assessmentIds.Contains(a.AssessmentId))
            .Select(a => a.Id)
            .ToListAsync(cancellationToken);
        var bankIds = await db.QuestionBanks.AsNoTracking()
            .Where(b => orgIds.Contains(b.OrganizationId))
            .Select(b => b.Id)
            .ToListAsync(cancellationToken);
        var questionIds = await db.Questions.AsNoTracking()
            .Where(q => bankIds.Contains(q.BankId))
            .Select(q => q.Id)
            .ToListAsync(cancellationToken);
        var moduleIds = await db.CourseModules.AsNoTracking()
            .Where(m => courseIds.Contains(m.CourseId))
            .Select(m => m.Id)
            .ToListAsync(cancellationToken);
        var lessonIds = await db.Lessons.AsNoTracking()
            .Where(l => moduleIds.Contains(l.ModuleId))
            .Select(l => l.Id)
            .ToListAsync(cancellationToken);
        var certIds = await db.Certificates.AsNoTracking()
            .Where(c => empIds.Contains(c.EmployeeId) || enrollmentIds.Contains(c.EnrollmentId))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);
        var skillGapRunIds = await db.SkillGapRuns.AsNoTracking()
            .Where(r => empIds.Contains(r.EmployeeId))
            .Select(r => r.Id)
            .ToListAsync(cancellationToken);
        var categoryIds = await db.CompetencyCategories.AsNoTracking()
            .Where(c => orgIds.Contains(c.OrganizationId))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);
        var competencyIds = await db.Competencies.AsNoTracking()
            .Where(c => categoryIds.Contains(c.CategoryId))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);
        var reqSetIds = await db.PositionRequirementSets.AsNoTracking()
            .Where(s => posIds.Contains(s.JobPositionId))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);
        var taskTemplateIds = await db.PracticalTaskTemplates.AsNoTracking()
            .Where(t => orgIds.Contains(t.OrganizationId))
            .Select(t => t.Id)
            .ToListAsync(cancellationToken);
        var taskAssignmentIds = await db.TaskAssignments.AsNoTracking()
            .Where(a => empIds.Contains(a.EmployeeId))
            .Select(a => a.Id)
            .ToListAsync(cancellationToken);
        var taskSubIds = await db.TaskSubmissions.AsNoTracking()
            .Where(s => taskAssignmentIds.Contains(s.TaskAssignmentId))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);
        var taskEvalIds = await db.TaskEvaluations.AsNoTracking()
            .Where(e => taskSubIds.Contains(e.TaskSubmissionId))
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);
        var scoringConfigIds = await db.ScoringConfigs.AsNoTracking()
            .Where(c => orgIds.Contains(c.OrganizationId))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken);
        var batchIds = await db.TrainingBatches.AsNoTracking()
            .Where(b => orgIds.Contains(b.OrganizationId))
            .Select(b => b.Id)
            .ToListAsync(cancellationToken);
        var subscriptionIds = await db.Subscriptions.AsNoTracking()
            .Where(s => orgIds.Contains(s.OrganizationId))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        // In số bản ghi sẽ xóa trước khi xóa
        var summary = new StringBuilder();
        summary.AppendLine("[reset-seed-demo] Thống kê bản ghi demo chuẩn bị xóa (chỉ DEMO-* và *@demo.nanglucso.pro.vn):");
        summary.AppendLine($"  - organizations: {orgIds.Count}");
        summary.AppendLine($"  - users: {userIds.Count}");
        summary.AppendLine($"  - employees: {empIds.Count}");
        summary.AppendLine($"  - departments: {deptIds.Count}");
        summary.AppendLine($"  - job_positions: {posIds.Count}");
        summary.AppendLine($"  - courses: {courseIds.Count}");
        summary.AppendLine($"  - enrollments: {enrollmentIds.Count}");
        summary.AppendLine($"  - trial_assessments: {trialAssessmentIds.Count}");
        summary.AppendLine($"  - course_final_submissions: {finalSubIds.Count}");
        summary.AppendLine($"  - certificates: {certIds.Count}");
        summary.AppendLine($"  - skill_gap_runs: {skillGapRunIds.Count}");
        log?.Invoke(summary.ToString().TrimEnd());

        HashSet<string>? existingTables = null;
        if (db.Database.IsRelational())
        {
            var tableNames = await db.Database
                .SqlQueryRaw<string>("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
                .ToListAsync(cancellationToken);
            existingTables = tableNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        await db.ExecuteInTransactionAsync(async () =>
        {
            if (existingTables != null && existingTables.Contains("proctoring_behavior_reports") && (orgIds.Count > 0 || proctoringSessionIds.Count > 0 || finalSubIds.Count > 0 || empIds.Count > 0))
            {
                var orgArr = orgIds.ToArray();
                var sessArr = proctoringSessionIds.ToArray();
                var finalArr = finalSubIds.ToArray();
                var empArr = empIds.ToArray();
                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM proctoring_behavior_reports WHERE organization_id = ANY({orgArr}) OR session_id = ANY({sessArr}) OR final_submission_id = ANY({finalArr}) OR employee_id = ANY({empArr})",
                    cancellationToken);
            }

            if (existingTables != null && existingTables.Contains("enterprise_placement_attempts") && (orgIds.Count > 0 || empIds.Count > 0))
            {
                var orgArr = orgIds.ToArray();
                var empArr = empIds.ToArray();
                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM enterprise_placement_attempts WHERE organization_id = ANY({orgArr}) OR employee_id = ANY({empArr})",
                    cancellationToken);
            }

            if (existingTables != null && existingTables.Contains("competency_milestones") && (orgIds.Count > 0 || userIds.Count > 0))
            {
                var orgArr = orgIds.ToArray();
                var usrArr = userIds.ToArray();
                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"DELETE FROM competency_milestones WHERE organization_id = ANY({orgArr}) OR updated_by_user_id = ANY({usrArr})",
                    cancellationToken);
            }

            await DeleteWhereAsync(db, db.AuditLogs, a => (a.OrganizationId != null && orgIds.Contains(a.OrganizationId.Value)) || (a.ActorUserId != null && userIds.Contains(a.ActorUserId.Value)), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Notifications, n => userIds.Contains(n.RecipientUserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.UserFeedbacks, f => userIds.Contains(f.UserId) || (f.OrganizationId != null && orgIds.Contains(f.OrganizationId.Value)), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.RecommendationReviews, r => orgIds.Contains(r.OrganizationId) || (r.DecidedByUserId != null && userIds.Contains(r.DecidedByUserId.Value)), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.TrainingRiskScores, r => empIds.Contains(r.EmployeeId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.ReadinessScores, r => empIds.Contains(r.EmployeeId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.SkillGapItems, i => skillGapRunIds.Contains(i.SkillGapRunId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.SkillGapRuns, r => empIds.Contains(r.EmployeeId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.CertificateVerificationLogs, l => l.CertificateId != null && certIds.Contains(l.CertificateId.Value), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Certificates, c => certIds.Contains(c.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CertificateTemplates, t => orgIds.Contains(t.OrganizationId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.ExamChoiceAnswers, a =>
                (a.FinalSubmissionId != null && finalSubIds.Contains(a.FinalSubmissionId.Value))
                || (a.PreAssessmentId != null && preIds.Contains(a.PreAssessmentId.Value))
                || (a.TrialAssessmentId != null && trialAssessmentIds.Contains(a.TrialAssessmentId.Value)), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PulseAiReviews, r => orgIds.Contains(r.OrganizationId) || finalSubIds.Contains(r.SubmissionId) || preIds.Contains(r.SubmissionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CourseFinalSubmissions, s => finalSubIds.Contains(s.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CoursePreAssessments, p => preIds.Contains(p.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.ProctoringEvents, e => proctoringSessionIds.Contains(e.SessionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.ProctoringRecordings, r => proctoringSessionIds.Contains(r.SessionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.ProctoringSessions, s => proctoringSessionIds.Contains(s.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.TrialAssessmentDomains, d => trialAssessmentIds.Contains(d.TrialAssessmentId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrialAssessments, t => trialAssessmentIds.Contains(t.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PositionDiagnosticAttempts, p => orgIds.Contains(p.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrialInvitations, i => orgIds.Contains(i.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrialRegistrations, r => r.OrganizationId != null && orgIds.Contains(r.OrganizationId.Value), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrialWorkspaces, t => orgIds.Contains(t.OrganizationId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.AssessmentAnswers, a => attemptIds.Contains(a.AttemptId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.AssessmentAttempts, a => attemptIds.Contains(a.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.AssessmentQuestions, q => assessmentIds.Contains(q.AssessmentId) || questionIds.Contains(q.QuestionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Assessments, a => assessmentIds.Contains(a.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.QuestionOptions, o => questionIds.Contains(o.QuestionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Questions, q => questionIds.Contains(q.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.QuestionBanks, b => bankIds.Contains(b.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.CompetencyEvaluationResults, r => taskEvalIds.Contains(r.TaskEvaluationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TaskEvaluations, e => taskEvalIds.Contains(e.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TaskSubmissionFiles, f => taskSubIds.Contains(f.SubmissionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TaskSubmissions, s => taskSubIds.Contains(s.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.AssignedTaskTargets, t => taskAssignmentIds.Contains(t.TaskAssignmentId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TaskAssignments, a => taskAssignmentIds.Contains(a.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PracticalTaskTargets, t => taskTemplateIds.Contains(t.TaskTemplateId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PracticalTaskTemplates, t => taskTemplateIds.Contains(t.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.EmployeeCompetencyProfiles, p => empIds.Contains(p.EmployeeId), existingTables, cancellationToken);
            // Xóa tự tham chiếu supersedes_evidence_id trước khi xóa competency_evidences
            foreach (var ev in await db.CompetencyEvidences.Where(e => empIds.Contains(e.EmployeeId) && e.SupersedesEvidenceId != null).ToListAsync(cancellationToken))
            {
                ev.SupersedesEvidenceId = null;
            }
            await db.SaveChangesAsync(cancellationToken);
            await DeleteWhereAsync(db, db.CompetencyEvidences, e => empIds.Contains(e.EmployeeId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.CapabilityBaselineAnswers, a => empIds.Contains(a.EmployeeId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CapabilityBaselines, b => empIds.Contains(b.EmployeeId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.LessonProgresses, p => enrollmentIds.Contains(p.EnrollmentId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Enrollments, e => enrollmentIds.Contains(e.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrainingBatchEmployees, e => batchIds.Contains(e.TrainingBatchId) || empIds.Contains(e.EmployeeId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.TrainingBatches, b => batchIds.Contains(b.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CourseAssignments, a => empIds.Contains(a.EmployeeId) || courseIds.Contains(a.CourseId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.LearningMaterials, m => lessonIds.Contains(m.LessonId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.LessonLearningOutcomes, o => lessonIds.Contains(o.LessonId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Lessons, l => lessonIds.Contains(l.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CourseModules, m => moduleIds.Contains(m.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CourseLearningOutcomes, o => courseIds.Contains(o.CourseId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CourseCompetencies, c => courseIds.Contains(c.CourseId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CoursePrerequisites, p => courseIds.Contains(p.CourseId) || courseIds.Contains(p.PrerequisiteCourseId), existingTables, cancellationToken);

            foreach (var c in await db.Courses.Where(c => courseIds.Contains(c.Id) && c.SupersedesCourseId != null).ToListAsync(cancellationToken))
            {
                c.SupersedesCourseId = null;
            }
            await db.SaveChangesAsync(cancellationToken);
            await DeleteWhereAsync(db, db.Courses, c => courseIds.Contains(c.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.CourseOrders, o => orgIds.Contains(o.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CapabilityCeilings, c => orgIds.Contains(c.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PositionRequirementItems, i => reqSetIds.Contains(i.RequirementSetId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PositionRequirementSets, s => reqSetIds.Contains(s.Id), existingTables, cancellationToken);

            // Gỡ liên kết trưởng phòng trước khi xóa nhân viên
            foreach (var d in await db.Departments.Where(d => deptIds.Contains(d.Id) && d.ManagerEmployeeId != null).ToListAsync(cancellationToken))
            {
                d.ManagerEmployeeId = null;
            }
            foreach (var e in await db.Employees.Where(e => empIds.Contains(e.Id) && e.DirectManagerId != null).ToListAsync(cancellationToken))
            {
                e.DirectManagerId = null;
            }
            await db.SaveChangesAsync(cancellationToken);

            await DeleteWhereAsync(db, db.Employees, e => empIds.Contains(e.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.MemberInvitations, i => orgIds.Contains(i.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Departments, d => deptIds.Contains(d.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.JobPositions, p => posIds.Contains(p.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.JobFamilies, f => orgIds.Contains(f.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.JobGrades, g => orgIds.Contains(g.OrganizationId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.CompetencyLevelCriteria, c => competencyIds.Contains(c.CompetencyId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CompetencyFrameworkMappings, m => competencyIds.Contains(m.CompetencyId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Competencies, c => competencyIds.Contains(c.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.CompetencyCategories, c => categoryIds.Contains(c.Id), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.ScoringConfigItems, i => scoringConfigIds.Contains(i.ScoringConfigId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.ScoringConfigs, c => scoringConfigIds.Contains(c.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.SystemSettings, s => s.OrganizationId != null && orgIds.Contains(s.OrganizationId.Value), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Invoices, i => orgIds.Contains(i.OrganizationId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.SubscriptionEntitlements, e => subscriptionIds.Contains(e.SubscriptionId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Subscriptions, s => orgIds.Contains(s.OrganizationId), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.Orders, o => userIds.Contains(o.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PurchaseDrafts, d => userIds.Contains(d.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.IndividualTrialRedemptions, r => userIds.Contains(r.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.LearnerProfiles, p => userIds.Contains(p.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.RefreshTokens, t => userIds.Contains(t.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.PasswordResetTokens, t => userIds.Contains(t.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.UserRoles, ur => userIds.Contains(ur.UserId), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.FileObjects, f => (f.OrganizationId != null && orgIds.Contains(f.OrganizationId.Value)) || (f.UploadedByUserId != null && userIds.Contains(f.UploadedByUserId.Value)), existingTables, cancellationToken);

            await DeleteWhereAsync(db, db.Users, u => userIds.Contains(u.Id), existingTables, cancellationToken);
            await DeleteWhereAsync(db, db.Organizations, o => orgIds.Contains(o.Id), existingTables, cancellationToken);
        }, cancellationToken);
    }

    private static async Task DeleteWhereAsync<TEntity>(
        AppDbContext db,
        DbSet<TEntity> set,
        System.Linq.Expressions.Expression<Func<TEntity, bool>> predicate,
        HashSet<string>? existingTables,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        if (db.Database.IsRelational())
        {
            if (existingTables != null)
            {
                var tableName = db.Model.FindEntityType(typeof(TEntity))?.GetTableName();
                if (!string.IsNullOrEmpty(tableName) && !existingTables.Contains(tableName))
                {
                    return;
                }
            }

            await set.Where(predicate).ExecuteDeleteAsync(cancellationToken);
            return;
        }

        var rows = await set.Where(predicate).ToListAsync(cancellationToken);
        if (rows.Count > 0)
        {
            set.RemoveRange(rows);
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private static async Task<(bool Seeded, int UsersCreated, int EmployeesCreated)> SeedOrganizationCaseStudyAsync(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        User mentor,
        int orgIndex,
        string orgCode,
        string orgName,
        string slug,
        bool isMainOrg,
        List<DemoSeedAccountRecord> accounts,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var existingOrg = await db.Organizations.FirstOrDefaultAsync(o => o.Code == orgCode, cancellationToken);
        if (existingOrg != null)
        {
            await CollectExistingAccountsForCsvAsync(db, existingOrg, orgName, slug, isMainOrg, accounts, cancellationToken);
            return (false, 0, 0);
        }

        var usersCreated = 0;
        var employeesCreated = 0;

        var org = new Organization
        {
            Code = orgCode,
            Name = orgName,
            Status = Statuses.Organization.Active,
            SetupCompletedAt = now.AddDays(-20),
        };
        db.Organizations.Add(org);
        await db.SaveChangesAsync(cancellationToken);

        // Owner & R&D
        var (owner, ownerCreated, ownerPwd) = await EnsureOrgUserAsync(
            db, passwordHasher, org.Id, $"owner.{slug}{DemoEmailDomain}", FictionalName(orgIndex, 100), Roles.Owner);
        if (ownerCreated) usersCreated++;
        accounts.Add(new DemoSeedAccountRecord(orgName, orgCode, Roles.Owner, owner.DisplayName, "Ban Giám đốc", "Chủ doanh nghiệp", "—", owner.Email, ownerPwd, ExportToCsv: true));

        var (rndUser, rndCreated, rndPwd) = await EnsureOrgUserAsync(
            db, passwordHasher, org.Id, $"rnd.{slug}{DemoEmailDomain}", FictionalName(orgIndex, 101), Roles.Research);
        if (rndCreated) usersCreated++;
        accounts.Add(new DemoSeedAccountRecord(orgName, orgCode, Roles.Research, rndUser.DisplayName, "Khối Nghiên cứu & Đào tạo", "Chuyên viên R&D", "—", rndUser.Email, rndPwd, ExportToCsv: true));

        // Subscription & Certificate Template & TrialWorkspace (gắn đúng 1 Mentor cho tổ chức)
        db.Subscriptions.Add(new Subscription
        {
            OrganizationId = org.Id,
            PlanCode = "BUSINESS",
            PlanName = "Gói Doanh nghiệp",
            Status = Statuses.Subscription.Active,
            Cycle = "year",
            SeatLimit = 100,
            RenewsAt = now.AddYears(1),
        });
        db.CertificateTemplates.Add(new CertificateTemplate
        {
            OrganizationId = org.Id,
            Name = "Chứng chỉ hoàn thành khóa học DigiTalent",
            VersionNo = 1,
            TemplateHtml = "<h1>{{holderName}}</h1><p>Hoàn thành khóa {{courseTitle}}</p><p>Mã: {{certificateCode}}</p>",
            Status = Statuses.CertificateTemplate.Active,
            CreatedByUserId = owner.Id,
        });
        db.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = org.Id,
            OwnerUserId = owner.Id,
            MentorUserId = mentor.Id,
            MentorAssignedAt = now.AddDays(-20),
            RequestedAt = now.AddDays(-22),
            TestDeadline = now.AddDays(30),
            ReportPublishedAt = now.AddDays(-18),
            Industry = "Dịch vụ văn phòng",
            Size = "100",
            Goal = "Chuẩn hóa năng lực số toàn doanh nghiệp",
            StartedAt = now.AddDays(-25),
            EndsAt = now.AddDays(35),
            PolicyJson = "{}",
        });

        // Khung TT02 (24 năng lực) + 5 vị trí + 18 khóa học chuẩn
        var competencies = SkillGapSeeder.SeedFramework(db, org.Id);
        await db.SaveChangesAsync(cancellationToken);

        var departments = await SeedDepartmentsAsync(db, org.Id);
        var positions = await SeedPositionsAndRequirementsAsync(db, org.Id, owner.Id, competencies);

        await SkillGapSeeder.EnsureOrganizationFrameworkAndCoursesAsync(db, org.Id, owner.Id);
        await PulseContentSeeder.SeedAsync(db, org.Id, owner.Id);

        // Mua sẵn các khóa Intermediate (M1-I, M2-I, M4-I), KHÔNG gọi PayOS; giữ M3-I, M5-I, M6-I và *-A ở trạng thái "To buy"
        await SeedPurchasedCoursesAndCeilingsAsync(db, org.Id, owner.Id, departments);

        // Tạo 3 Manager (vừa là MANAGER vừa là EMPLOYEE)
        var managersByDept = new Dictionary<string, Employee>();
        for (var d = 0; d < DepartmentSpecs.Length; d++)
        {
            var deptSpec = DepartmentSpecs[d];
            var dept = departments[deptSpec.Code];
            var pos = positions[deptSpec.ManagerPositionCode];
            var deptSlug = deptSpec.Code.ToLowerInvariant().Replace("_", "");
            var email = $"manager.{deptSlug}.{slug}{DemoEmailDomain}";
            var fullName = FictionalName(orgIndex, 110 + d);
            var (mgrUser, mgrUserCreated, mgrPwd) = await EnsureOrgUserAsync(db, passwordHasher, org.Id, email, fullName, Roles.Manager);
            if (mgrUserCreated) usersCreated++;

            var mgrEmp = new Employee
            {
                OrganizationId = org.Id,
                DepartmentId = dept.Id,
                JobPositionId = pos.Id,
                UserId = mgrUser.Id,
                EmployeeCode = $"MGR-{d + 1:00}",
                FullName = fullName,
                WorkEmail = email,
                Status = Statuses.Employee.Active,
            };
            db.Employees.Add(mgrEmp);
            employeesCreated++;
            await db.SaveChangesAsync(cancellationToken);

            dept.ManagerEmployeeId = mgrEmp.Id;
            managersByDept[deptSpec.Code] = mgrEmp;

            var exportManager = isMainOrg || deptSpec.Code == "ACC";
            accounts.Add(new DemoSeedAccountRecord(
                orgName, orgCode, Roles.Manager, fullName, dept.Name, pos.Name, "—", email, mgrPwd, ExportToCsv: exportManager));
        }
        await db.SaveChangesAsync(cancellationToken);

        // Tạo 30 Employee theo kịch bản A/B/C/D
        var employees = new List<(EmployeeTemplate Template, Employee Employee, PositionSpec Position, Department Department)>();
        foreach (var tpl in EmployeeTemplates)
        {
            var dept = departments[tpl.DepartmentCode];
            var pos = positions[tpl.PositionCode];
            var posSpec = PositionSpecs.Single(p => p.Code == tpl.PositionCode);
            var mgr = managersByDept[tpl.DepartmentCode];
            var email = $"emp{tpl.Index:00}.{slug}{DemoEmailDomain}";
            var fullName = FictionalName(orgIndex, tpl.Index);
            var (empUser, empUserCreated, empPwd) = await EnsureOrgUserAsync(db, passwordHasher, org.Id, email, fullName, Roles.Employee);
            if (empUserCreated) usersCreated++;

            var emp = new Employee
            {
                OrganizationId = org.Id,
                DepartmentId = dept.Id,
                JobPositionId = pos.Id,
                DirectManagerId = mgr.Id,
                UserId = empUser.Id,
                EmployeeCode = $"EMP-{tpl.Index:000}",
                FullName = fullName,
                WorkEmail = email,
                Status = Statuses.Employee.Active,
            };
            db.Employees.Add(emp);
            employeesCreated++;
            employees.Add((tpl, emp, posSpec, dept));

            var exportEmployee = isMainOrg
                ? tpl.Index is 1 or 9 or 12 or 17 or 25
                : tpl.Index is 1 or 17;
            accounts.Add(new DemoSeedAccountRecord(
                orgName, orgCode, Roles.Employee, fullName, dept.Name, pos.Name, tpl.StatusGroup, email, empPwd, ExportToCsv: exportEmployee));
        }
        await db.SaveChangesAsync(cancellationToken);

        // Training batch tổng quan cho Owner dashboard
        var catalog = new PulseCatalogReader(db);
        var publishedCourses = (await catalog.LoadAsync(org.Id)).ToDictionary(c => c.Code, StringComparer.OrdinalIgnoreCase);
        var batchCourseId = publishedCourses["M4-I"].CourseId;
        db.TrainingBatches.Add(new TrainingBatch
        {
            OrganizationId = org.Id,
            Code = $"BATCH-{slug.ToUpperInvariant()}-2026",
            Title = $"Đợt đào tạo năng lực số {orgName}",
            CourseId = batchCourseId,
            Status = Statuses.TrainingBatch.Active,
            StartDate = now.AddDays(-15),
            CreatedByUserId = owner.Id,
        });
        await db.SaveChangesAsync(cancellationToken);

        // Khởi tạo services sẵn có để chạy đúng nghiệp vụ khảo sát 90 câu, Skill Gap, Module Quiz, Course Final & DecidePulseFinal
        var modulesReader = new PulseModuleReader(db);
        var quizReader = new PulseQuizReader(db);
        var examPaper = new PulseExamPaper(db, quizReader);
        var trialPaper = new TrialAssessmentPaper(db, catalog, modulesReader);
        var skillGapRunService = new SkillGapRunService(db, new SkillGapSettingsProvider(db, NullLogger<SkillGapSettingsProvider>.Instance));

        var mentorActor = new DemoMentorCurrentUser(mentor.Id);
        var mentorScope = new PulseReviewScope(db, new EmployeeScope(db, mentorActor), mentorActor);
        var retryPolicy = new PulseRetryPolicyProvider(db, NullLogger<PulseRetryPolicyProvider>.Instance);
        var mentorAudit = new AuditService(db, mentorActor, NullLogger<AuditService>.Instance);
        var certIssuer = new MyCertificateIssuer(db, mentorAudit);
        var decideFinal = new DecidePulseFinalUseCase(db, mentorScope, retryPolicy, mentorAudit, TimeProvider.System, certIssuer);

        var domains = await trialPaper.LoadDomainsAsync(org.Id);
        var modulesByCourse = await modulesReader.LoadModulesAsync(publishedCourses.Values.Select(c => c.CourseId).ToList(), includeContent: false);

        // Khảo sát 90 câu cho 3 Manager + 1 khóa tự học cho mỗi Manager
        foreach (var (deptCode, mgrEmp) in managersByDept)
        {
            var mgrPos = PositionSpecs.Single(p => p.Code == DepartmentSpecs.Single(d => d.Code == deptCode).ManagerPositionCode);
            var targetLevels = mgrPos.DomainLevels;
            await SeedBaselineSurvey90Async(db, trialPaper, org.Id, mgrEmp, domains, targetLevels, isMetBaseline: true, gapDomains: Array.Empty<int>(), now.AddDays(-20));
            await SeedBaselineEvidencesFromTargetsAsync(db, mgrEmp, owner.Id, competencies, mgrPos, gapDomains: Array.Empty<int>(), now.AddDays(-20));
            await skillGapRunService.StageRunsAsync(new[] { mgrEmp }, org.Id, Statuses.SkillGapGeneratedBy.UserRequest);

            var mgrCourse = publishedCourses["M4-F"];
            var mgrEnroll = new Enrollment
            {
                EmployeeId = mgrEmp.Id,
                CourseId = mgrCourse.CourseId,
                Status = Statuses.Enrollment.InProgress,
                ProgressPercent = 25,
                StartedAt = now.AddDays(-5),
            };
            db.Enrollments.Add(mgrEnroll);
        }
        await db.SaveChangesAsync(cancellationToken);

        // Kịch bản trạng thái A / B / C / D cho 30 Employee
        foreach (var (tpl, emp, posSpec, _) in employees)
        {
            var gapDomains = GapDomainsForTemplate(tpl);
            var isMet = tpl.StatusGroup == "D";

            // 1. Khảo sát đầu vào 90 câu (TrialAssessment + TrialAssessmentDomain + ExamChoiceAnswer)
            await SeedBaselineSurvey90Async(db, trialPaper, org.Id, emp, domains, posSpec.DomainLevels, isMet, gapDomains, now.AddDays(-20));

            // 2. Hồ sơ ban đầu (EmployeeCompetencyProfile + CompetencyEvidence) & SkillGapRun ban đầu
            await SeedBaselineEvidencesFromTargetsAsync(db, emp, owner.Id, competencies, posSpec, gapDomains, now.AddDays(-20));
            await skillGapRunService.StageRunsAsync(new[] { emp }, org.Id, Statuses.SkillGapGeneratedBy.UserRequest);
            await db.SaveChangesAsync(cancellationToken);

            // 3. Kịch bản học & thi theo từng nhóm
            switch (tpl.StatusGroup)
            {
                case "A":
                    await SeedGroupAFlowAsync(db, emp, posSpec, gapDomains, publishedCourses, modulesByCourse, quizReader, examPaper, decideFinal, owner.Id, now);
                    break;
                case "B":
                    await SeedGroupBFlowAsync(db, emp, tpl, gapDomains, publishedCourses, modulesByCourse, quizReader, examPaper, decideFinal, owner.Id, now);
                    break;
                case "C":
                    await SeedGroupCFlowAsync(db, emp, posSpec, gapDomains, publishedCourses, owner.Id, now);
                    break;
                case "D":
                    // Đạt chuẩn ngay từ khảo sát 90 câu (MET, GapCount == 0), không cần học
                    break;
            }

            // Giải phóng change-tracker sau mỗi nhân viên để tránh phình bộ nhớ và chi phí DetectChanges O(N^2) khi seed nhiều tổ chức
            db.ChangeTracker.Clear();
        }

        return (true, usersCreated, employeesCreated);
    }

    private static int[] GapDomainsForTemplate(EmployeeTemplate tpl)
    {
        if (tpl.StatusGroup == "D") return Array.Empty<int>();
        if (tpl.SubState == "PASSED_M1_I") return new[] { 1 };
        if (tpl.SubState == "PASSED_M2_I") return new[] { 2 };
        if (tpl.SubState == "PASSED_M4_I") return new[] { 4 };
        if (tpl.SubState == "PENDING_LOW") return new[] { 2 };
        if (tpl.SubState == "PENDING_MEDIUM") return new[] { 4 };
        if (tpl.SubState == "PENDING_HIGH") return new[] { 4 };
        if (tpl.SubState == "FAILED_ONCE") return new[] { 1 };

        return (tpl.Index % 3) switch
        {
            0 => new[] { 1, 4 },
            1 => new[] { 2, 4 },
            _ => new[] { 1, 2 },
        };
    }

    /// <summary>
    /// Seed bài khảo sát đầu vào 90 câu (6 lĩnh vực × 3 cấp × 5 câu) sao cho tỷ lệ đúng từng miền
    /// tự chấm ra đúng mức mong muốn (&lt;40% = 0, ≥40% = 1, ≥60% = 2, ≥80% = 3) qua TrialProgramRules.SuggestedLevel.
    /// </summary>
    private static async Task SeedBaselineSurvey90Async(
        AppDbContext db,
        TrialAssessmentPaper trialPaper,
        Guid organizationId,
        Employee employee,
        IReadOnlyList<TrialDomainInfo> domains,
        IReadOnlyDictionary<int, int> requiredDomainLevels,
        bool isMetBaseline,
        IReadOnlyCollection<int> gapDomains,
        DateTimeOffset submittedAt)
    {
        var paper = await trialPaper.BuildAsync(organizationId, employee.Id);
        var byCategory = paper.Items.GroupBy(i => i.CategoryId).ToDictionary(g => g.Key, g => g.ToList());

        var answers = new List<ExamChoiceAnswer>();
        var totalCorrect = 0;
        var totalQuestions = paper.Items.Count;
        var domainRows = new List<TrialAssessmentDomain>();

        foreach (var domain in domains)
        {
            var req = requiredDomainLevels.GetValueOrDefault(domain.Number, 1);
            int targetLevel;
            if (isMetBaseline || !gapDomains.Contains(domain.Number))
            {
                targetLevel = req;
            }
            else
            {
                // Có GAP ở lĩnh vực này: nếu req >= 2 → baseline = 1; nếu req == 1 → baseline = 0
                targetLevel = Math.Max(0, req - 1);
            }

            // Số câu đúng mục tiêu trên 15 câu của miền:
            // lv0 -> 4/15 (26.7% < 40%), lv1 -> 7/15 (46.7% ≥ 40%), lv2 -> 10/15 (66.7% ≥ 60%), lv3 -> 13/15 (86.7% ≥ 80%)
            var targetCorrectInDomain = targetLevel switch
            {
                0 => 4,
                1 => 7,
                2 => 10,
                _ => 13,
            };

            var domainItems = byCategory.GetValueOrDefault(domain.CategoryId) ?? new List<TrialPaperItem>();
            var remainingCorrect = Math.Min(targetCorrectInDomain, domainItems.Count);
            var correctFlags = new Dictionary<Guid, bool>();

            // Phân bổ đúng ưu tiên từ tier thấp lên cao để hợp lý với trình độ
            foreach (var item in domainItems.OrderBy(i => i.Tier).ThenBy(i => i.Question.SortOrder))
            {
                var makeCorrect = remainingCorrect > 0;
                if (makeCorrect) remainingCorrect--;
                correctFlags[item.Question.QuestionId] = makeCorrect;
            }

            short sort = 1;
            foreach (var item in domainItems)
            {
                var q = item.Question;
                var shouldBeCorrect = correctFlags[q.QuestionId];
                var opt = shouldBeCorrect
                    ? q.Options.First(o => o.IsCorrect)
                    : q.Options.First(o => !o.IsCorrect);
                if (opt.IsCorrect) totalCorrect++;

                answers.Add(new ExamChoiceAnswer
                {
                    QuestionId = q.QuestionId,
                    SelectedOptionId = opt.OptionId,
                    IsCorrect = opt.IsCorrect,
                    SortOrder = sort++,
                });
            }

            var cells = Enumerable.Range(1, PulseRules.MaxLevel)
                .Select(tier =>
                {
                    var tierItems = domainItems.Where(i => i.Tier == tier).ToList();
                    return (Correct: tierItems.Count(i => correctFlags[i.Question.QuestionId]), Total: tierItems.Count);
                })
                .ToList();

            var suggested = TrialProgramRules.SuggestedLevel(cells);
            domainRows.Add(new TrialAssessmentDomain
            {
                CategoryId = domain.CategoryId,
                BasicCorrect = (short)cells[0].Correct,
                BasicTotal = (short)cells[0].Total,
                IntermediateCorrect = (short)cells[1].Correct,
                IntermediateTotal = (short)cells[1].Total,
                AdvancedCorrect = (short)cells[2].Correct,
                AdvancedTotal = (short)cells[2].Total,
                SuggestedLevel = suggested,
                MentorLevel = null,
            });
        }

        var trialSession = new ProctoringSession
        {
            EmployeeId = employee.Id,
            CourseId = null,
            Kind = Statuses.ProctoringKind.TrialAssessment,
            Status = Statuses.ProctoringSession.Submitted,
            StartedAt = submittedAt.AddMinutes(-20),
            EndedAt = submittedAt,
            DurationMs = 20 * 60_000L,
        };
        db.ProctoringSessions.Add(trialSession);

        var assessment = new TrialAssessment
        {
            OrganizationId = organizationId,
            EmployeeId = employee.Id,
            ProctoringSessionId = trialSession.Id,
            EssayBasic = "Khảo sát đầu vào tự động qua bộ câu hỏi chuẩn 90 câu theo Thông tư 02/2025.",
            EssayIntermediate = string.Empty,
            EssayAdvanced = string.Empty,
            ChoiceScore = (short)totalCorrect,
            ChoiceTotal = (short)totalQuestions,
            SubmittedAt = submittedAt,
        };
        db.TrialAssessments.Add(assessment);
        foreach (var row in domainRows)
        {
            row.TrialAssessmentId = assessment.Id;
            db.TrialAssessmentDomains.Add(row);
        }
        foreach (var ans in answers)
        {
            ans.TrialAssessmentId = assessment.Id;
            db.ExamChoiceAnswers.Add(ans);
        }
        await db.SaveChangesAsync();
    }

    private static Task SeedBaselineEvidencesFromTargetsAsync(
        AppDbContext db,
        Employee employee,
        Guid ownerUserId,
        IReadOnlyDictionary<string, Competency> competencies,
        PositionSpec position,
        IReadOnlyCollection<int> gapDomains,
        DateTimeOffset assessedAt)
    {
        foreach (var compCode in position.CompetencyCodes)
        {
            var domainNum = int.Parse(compCode.Split('.')[0]);
            var req = position.DomainLevels[domainNum];
            var baselineLevel = gapDomains.Contains(domainNum) ? Math.Max(0, req - 1) : req;
            if (baselineLevel <= 0) continue; // CHECK constraint confirmed_level BETWEEN 1 AND 3

            var comp = competencies[compCode];
            var evidence = new CompetencyEvidence
            {
                EmployeeId = employee.Id,
                CompetencyId = comp.Id,
                SourceType = Statuses.EvidenceSourceType.Migration,
                Status = Statuses.EvidenceStatus.Confirmed,
                IsLevelConfirming = true,
                ConfirmedLevel = (short)baselineLevel,
                ConfirmedByUserId = ownerUserId,
                ConfirmedAt = assessedAt,
                ReviewNote = "Kết quả khảo sát đầu vào 90 câu (TT02/2025)",
            };
            db.CompetencyEvidences.Add(evidence);
            db.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
            {
                EmployeeId = employee.Id,
                CompetencyId = comp.Id,
                ConfirmedLevel = (short)baselineLevel,
                LatestConfirmingEvidenceId = evidence.Id,
                ConfirmedAt = assessedAt,
                RowVersion = 1,
            });
        }

        return Task.CompletedTask;
    }

    private static async Task SeedGroupAFlowAsync(
        AppDbContext db,
        Employee emp,
        PositionSpec posSpec,
        int[] gapDomains,
        IReadOnlyDictionary<string, PulseCourseRef> courses,
        IReadOnlyDictionary<Guid, List<PulseModuleInfo>> modulesByCourse,
        PulseQuizReader quizReader,
        PulseExamPaper examPaper,
        DecidePulseFinalUseCase decideFinal,
        Guid ownerUserId,
        DateTimeOffset now)
    {
        foreach (var domainNum in gapDomains)
        {
            var reqLevel = posSpec.DomainLevels[domainNum];
            var tierSuffix = reqLevel switch { 1 => "F", 2 => "I", _ => "A" };
            var courseCode = $"M{domainNum}-{tierSuffix}";
            var course = courses[courseCode];

            // Nếu vị trí yêu cầu mức 2 và khóa Cơ bản M{d}-F chưa hoàn thành ở baseline (đang lv1 từ survey, cần học M{d}-I):
            // vẫn có thể hoàn thành nhanh khóa F nếu baseline=0, ở đây baseline=1 nên học thẳng khóa I (M{d}-I).
            await CompleteCourseAndPassFinalAsync(
                db, emp, course, modulesByCourse, quizReader, examPaper, decideFinal, ownerUserId, now.AddDays(-7), "LOW");
        }
    }

    private static async Task SeedGroupBFlowAsync(
        AppDbContext db,
        Employee emp,
        EmployeeTemplate tpl,
        int[] gapDomains,
        IReadOnlyDictionary<string, PulseCourseRef> courses,
        IReadOnlyDictionary<Guid, List<PulseModuleInfo>> modulesByCourse,
        PulseQuizReader quizReader,
        PulseExamPaper examPaper,
        DecidePulseFinalUseCase decideFinal,
        Guid ownerUserId,
        DateTimeOffset now)
    {
        var domainNum = gapDomains[0];
        var courseCode = $"M{domainNum}-I";
        if (!courses.TryGetValue(courseCode, out var course)) course = courses[$"M{domainNum}-F"];

        var modules = modulesByCourse.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>();
        var assignment = new CourseAssignment
        {
            CourseId = course.CourseId,
            EmployeeId = emp.Id,
            AssignmentSource = Statuses.CourseAssignmentSource.SkillGap,
            SourceDepartmentId = emp.DepartmentId,
            AssignedByUserId = ownerUserId,
            AssignedAt = now.AddDays(-12),
            DueDate = DateOnly.FromDateTime(now.AddDays(18).UtcDateTime),
            Status = Statuses.CourseAssignment.Active,
        };
        db.CourseAssignments.Add(assignment);

        var enrollment = new Enrollment
        {
            CourseAssignmentId = assignment.Id,
            EmployeeId = emp.Id,
            CourseId = course.CourseId,
            Status = Statuses.Enrollment.InProgress,
            ProgressPercent = 0,
            StartedAt = now.AddDays(-10),
            DueDate = assignment.DueDate,
        };
        db.Enrollments.Add(enrollment);
        await db.SaveChangesAsync();

        if (tpl.SubState.StartsWith("PENDING_", StringComparison.Ordinal))
        {
            await CompleteAllModulesAsync(db, emp.Id, enrollment, modules, quizReader, now.AddDays(-2));
            var riskProfile = tpl.SubState switch
            {
                "PENDING_HIGH" => "HIGH",
                "PENDING_MEDIUM" => "MEDIUM",
                _ => "LOW",
            };
            await SubmitCourseFinalAsync(db, emp, enrollment, course, modules, examPaper, attemptNo: 1, passChoice: true, riskProfile, now.AddHours(-6));
            return;
        }

        if (tpl.SubState == "FAILED_ONCE")
        {
            await CompleteAllModulesAsync(db, emp.Id, enrollment, modules, quizReader, now.AddDays(-4));
            var failedSubmission = await SubmitCourseFinalAsync(
                db, emp, enrollment, course, modules, examPaper, attemptNo: 1, passChoice: false, "LOW", now.AddDays(-3));

            await decideFinal.ExecuteAsync(new DecidePulseFinalUseCaseInput
            {
                SubmissionId = failedSubmission.Id,
                Decision = Statuses.FinalSubmissionDecision.NotYet,
                Reason = "Phần trắc nghiệm chưa đạt 70% và phần tự luận cần bổ sung số liệu đối chiếu từ chứng từ gốc.",
                CriterionEvaluations = new List<PulseCriterionEvaluationInput>
                {
                    new() { Number = "01", Title = "Nguồn có thể truy vết", Status = "PASS", Note = "Đã nêu tên hệ thống nguồn." },
                    new() { Number = "02", Title = "Hành động có thể kiểm tra", Status = "FAIL", Note = "Chưa có phép tính đối chiếu cụ thể." },
                    new() { Number = "03", Title = "Kết luận có căn cứ", Status = "FAIL", Note = "Kết luận chưa bám số liệu." },
                },
            });

            // Đặt cửa sổ thi lại đã mở để học viên có thể vào làm lại ngay khi demo
            failedSubmission.RetryOpensAt = now.AddHours(-2);
            failedSubmission.RetryDueAt = now.AddDays(5);
            await db.SaveChangesAsync();
            return;
        }

        // Đang học dở (25% / 50% / 75%)
        var ratio = tpl.SubState switch
        {
            "IN_PROGRESS_75" => 0.75,
            "IN_PROGRESS_50" => 0.50,
            _ => 0.25,
        };
        var modulesToComplete = Math.Max(1, (int)Math.Floor(modules.Count * ratio));
        if (modulesToComplete >= modules.Count && modules.Count > 1) modulesToComplete = modules.Count - 1;

        await CompleteModulesRangeAsync(db, emp.Id, enrollment, modules.Take(modulesToComplete).ToList(), quizReader, now.AddDays(-3), modules.Count);
    }

    private static async Task SeedGroupCFlowAsync(
        AppDbContext db,
        Employee emp,
        PositionSpec posSpec,
        int[] gapDomains,
        IReadOnlyDictionary<string, PulseCourseRef> courses,
        Guid ownerUserId,
        DateTimeOffset now)
    {
        var domainNum = gapDomains[0];
        var req = posSpec.DomainLevels[domainNum];
        var courseCode = $"M{domainNum}-{(req >= 2 ? "I" : "F")}";
        var course = courses[courseCode];

        var assignment = new CourseAssignment
        {
            CourseId = course.CourseId,
            EmployeeId = emp.Id,
            AssignmentSource = Statuses.CourseAssignmentSource.SkillGap,
            SourceDepartmentId = emp.DepartmentId,
            AssignedByUserId = ownerUserId,
            AssignedAt = now.AddDays(-5),
            DueDate = DateOnly.FromDateTime(now.AddDays(21).UtcDateTime),
            Status = Statuses.CourseAssignment.Active,
        };
        db.CourseAssignments.Add(assignment);
        db.Enrollments.Add(new Enrollment
        {
            CourseAssignmentId = assignment.Id,
            EmployeeId = emp.Id,
            CourseId = course.CourseId,
            Status = Statuses.Enrollment.NotStarted,
            ProgressPercent = 0,
            DueDate = assignment.DueDate,
        });
        await db.SaveChangesAsync();
    }

    private static async Task CompleteCourseAndPassFinalAsync(
        AppDbContext db,
        Employee emp,
        PulseCourseRef course,
        IReadOnlyDictionary<Guid, List<PulseModuleInfo>> modulesByCourse,
        PulseQuizReader quizReader,
        PulseExamPaper examPaper,
        DecidePulseFinalUseCase decideFinal,
        Guid ownerUserId,
        DateTimeOffset completedAt,
        string riskProfile)
    {
        var modules = modulesByCourse.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>();
        var assignment = new CourseAssignment
        {
            CourseId = course.CourseId,
            EmployeeId = emp.Id,
            AssignmentSource = Statuses.CourseAssignmentSource.SkillGap,
            SourceDepartmentId = emp.DepartmentId,
            AssignedByUserId = ownerUserId,
            AssignedAt = completedAt.AddDays(-10),
            DueDate = DateOnly.FromDateTime(completedAt.AddDays(14).UtcDateTime),
            Status = Statuses.CourseAssignment.Active,
        };
        db.CourseAssignments.Add(assignment);

        var enrollment = new Enrollment
        {
            CourseAssignmentId = assignment.Id,
            EmployeeId = emp.Id,
            CourseId = course.CourseId,
            Status = Statuses.Enrollment.InProgress,
            ProgressPercent = 0,
            StartedAt = completedAt.AddDays(-8),
            DueDate = assignment.DueDate,
        };
        db.Enrollments.Add(enrollment);
        await db.SaveChangesAsync();

        await CompleteAllModulesAsync(db, emp.Id, enrollment, modules, quizReader, completedAt.AddDays(-1));
        var submission = await SubmitCourseFinalAsync(
            db, emp, enrollment, course, modules, examPaper, attemptNo: 1, passChoice: true, riskProfile, completedAt.AddHours(-2));

        // Đi qua chính DecidePulseFinalUseCase để nâng EmployeeCompetencyProfile, cấp Certificate, tính lại Skill Gap & ghi AuditLog
        await decideFinal.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = submission.Id,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Hoàn thành đầy đủ các học phần, trắc nghiệm đạt chuẩn và bài tự luận nêu rõ nguồn kiểm chứng.",
            CriterionEvaluations = new List<PulseCriterionEvaluationInput>
            {
                new() { Number = "01", Title = "Nguồn có thể truy vết", Status = "PASS", Note = "Nêu rõ báo cáo và chứng từ gốc." },
                new() { Number = "02", Title = "Hành động có thể kiểm tra", Status = "PASS", Note = "Có phép đối chiếu và bước thao tác kiểm tra lại được." },
                new() { Number = "03", Title = "Kết luận có căn cứ", Status = "PASS", Note = "Kết luận bám số liệu đã đối chiếu." },
            },
        });
    }

    private static Task CompleteAllModulesAsync(
        AppDbContext db,
        Guid employeeId,
        Enrollment enrollment,
        IReadOnlyList<PulseModuleInfo> modules,
        PulseQuizReader quizReader,
        DateTimeOffset when) =>
        CompleteModulesRangeAsync(db, employeeId, enrollment, modules, quizReader, when, modules.Count);

    private static async Task CompleteModulesRangeAsync(
        AppDbContext db,
        Guid employeeId,
        Enrollment enrollment,
        IReadOnlyList<PulseModuleInfo> modulesToComplete,
        PulseQuizReader quizReader,
        DateTimeOffset when,
        int totalModulesInCourse)
    {
        foreach (var module in modulesToComplete)
        {
            foreach (var slide in module.Slides)
            {
                db.LessonProgresses.Add(new LessonProgress
                {
                    EnrollmentId = enrollment.Id,
                    LessonId = slide.LessonId,
                    Status = Statuses.LessonProgress.Completed,
                    ProgressPercent = 100,
                    CompletedAt = when,
                    LastAccessedAt = when,
                });
            }

            if (module.QuizAssessmentId is { } quizId)
            {
                var pool = await quizReader.LoadQuestionsAsync(quizId);
                var drawn = PulseQuizReader.Draw(pool, employeeId, quizId, attemptNo: 1);
                if (drawn.Count > 0)
                {
                    var attempt = new AssessmentAttempt
                    {
                        AssessmentId = quizId,
                        EnrollmentId = enrollment.Id,
                        AttemptNo = 1,
                        Status = Statuses.AssessmentAttempt.Scored,
                        StartedAt = when.AddMinutes(-5),
                        SubmittedAt = when,
                        ScoredAt = when,
                        Score = 100m,
                        Passed = true,
                    };
                    db.AssessmentAttempts.Add(attempt);

                    foreach (var q in drawn)
                    {
                        var correctOpt = q.Options.First(o => o.IsCorrect);
                        db.AssessmentAnswers.Add(new AssessmentAnswer
                        {
                            AttemptId = attempt.Id,
                            QuestionId = q.QuestionId,
                            SelectedOptionId = correctOpt.OptionId,
                            IsCorrect = true,
                            PointsAwarded = 1,
                        });
                    }
                }
            }
        }

        var pct = totalModulesInCourse == 0 ? 0 : Math.Round(modulesToComplete.Count * 100m / totalModulesInCourse, 0, MidpointRounding.AwayFromZero);
        enrollment.ProgressPercent = pct;
        enrollment.Status = modulesToComplete.Count >= totalModulesInCourse
            ? Statuses.Enrollment.ReadyForAssessment
            : Statuses.Enrollment.InProgress;
        await db.SaveChangesAsync();
    }

    private static async Task<CourseFinalSubmission> SubmitCourseFinalAsync(
        AppDbContext db,
        Employee emp,
        Enrollment enrollment,
        PulseCourseRef course,
        IReadOnlyList<PulseModuleInfo> modules,
        PulseExamPaper examPaper,
        short attemptNo,
        bool passChoice,
        string riskProfile,
        DateTimeOffset submittedAt)
    {
        var durationMs = 14 * 60_000L;
        var session = new ProctoringSession
        {
            EmployeeId = emp.Id,
            CourseId = course.CourseId,
            Kind = Statuses.ProctoringKind.Final,
            Status = Statuses.ProctoringSession.Submitted,
            StartedAt = submittedAt.AddMilliseconds(-durationMs),
            EndedAt = submittedAt,
            DurationMs = durationMs,
        };
        db.ProctoringSessions.Add(session);

        // Không cần file video thật: tạo nhật ký sự kiện giám sát để màn hình chấm có điểm rủi ro LOW / MEDIUM / HIGH rõ ràng
        db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.Started, OffsetMs = 0, OccurredAt = session.StartedAt });
        db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.FaceCheckOn, OffsetMs = 1_500, OccurredAt = session.StartedAt.AddMilliseconds(1_500) });
        if (riskProfile == "MEDIUM")
        {
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.TabHidden, OffsetMs = 120_000, DurationMs = 12_000, Detail = "Chuyển sang cửa sổ tài liệu tham khảo", OccurredAt = session.StartedAt.AddMinutes(2) });
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.FaceMissing, OffsetMs = 360_000, DurationMs = 15_000, Detail = "Khuôn mặt rời khung hình camera", OccurredAt = session.StartedAt.AddMinutes(6) });
        }
        else if (riskProfile == "HIGH")
        {
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.MultipleFaces, OffsetMs = 95_000, DurationMs = 18_000, Detail = "Phát hiện 2 khuôn mặt trước camera", OccurredAt = session.StartedAt.AddSeconds(95) });
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.ShareStopped, OffsetMs = 240_000, DurationMs = 25_000, Detail = "Ngừng chia sẻ màn hình", OccurredAt = session.StartedAt.AddMinutes(4) });
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.ShareResumed, OffsetMs = 265_000, OccurredAt = session.StartedAt.AddMilliseconds(265_000) });
            db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.TabHidden, OffsetMs = 420_000, DurationMs = 22_000, Detail = "Rời tab thi", OccurredAt = session.StartedAt.AddMinutes(7) });
        }
        db.ProctoringEvents.Add(new ProctoringEvent { SessionId = session.Id, Kind = Statuses.ProctoringEvent.Submitted, OffsetMs = durationMs, OccurredAt = submittedAt });

        var paper = await examPaper.DrawAsync(modules, emp.Id, course.CourseId, PulseExamPaper.SlotOf(Statuses.ProctoringKind.Final, attemptNo));
        var targetCorrect = paper.Count == 0
            ? 0
            : passChoice
                ? Math.Max(PulseRules.ChoicePassMark(paper.Count), (int)Math.Ceiling(paper.Count * 0.85))
                : Math.Max(0, PulseRules.ChoicePassMark(paper.Count) - 3);

        var inputs = paper.Select((q, idx) =>
        {
            var opt = idx < targetCorrect ? q.Options.First(o => o.IsCorrect) : q.Options.First(o => !o.IsCorrect);
            return new PulseAnswerInput { QuestionId = q.QuestionId, OptionId = opt.OptionId };
        }).ToList();

        var grade = PulseExamPaper.Grade(paper, inputs);
        var essay = passChoice
            ? $"Nguồn: báo cáo tổng hợp và tệp chứng từ gốc của khóa {course.Code}. Tôi đã đối chiếu từng số liệu với hồ sơ nguồn, kiểm tra lại phép tính chênh lệch và phân quyền chia sẻ đúng quy định. Kết luận: dữ liệu khớp 100%, đề xuất lưu trữ bản đối soát theo quy chuẩn phòng ban và áp dụng cho kỳ tiếp theo."
            : "Tôi đã kiểm tra lại tài liệu công việc hằng ngày và ghi nhận một số bước xử lý theo thói quen của nhóm.";

        var submission = new CourseFinalSubmission
        {
            EnrollmentId = enrollment.Id,
            ProctoringSessionId = session.Id,
            AttemptNo = attemptNo,
            EvidenceText = essay,
            ChoiceScore = grade?.Score,
            ChoiceTotal = grade?.Total,
            SubmittedAt = submittedAt,
        };
        db.CourseFinalSubmissions.Add(submission);
        foreach (var ans in grade?.Answers ?? Array.Empty<ExamChoiceAnswer>())
        {
            ans.FinalSubmissionId = submission.Id;
            db.ExamChoiceAnswers.Add(ans);
        }

        enrollment.Status = Statuses.Enrollment.ReadyForAssessment;
        enrollment.ProgressPercent = 100;
        await db.SaveChangesAsync();
        return submission;
    }

    private static async Task<Dictionary<string, Department>> SeedDepartmentsAsync(AppDbContext db, Guid organizationId)
    {
        var result = new Dictionary<string, Department>();
        foreach (var spec in DepartmentSpecs)
        {
            var dept = new Department
            {
                OrganizationId = organizationId,
                Code = spec.Code,
                Name = spec.Name,
                Status = Statuses.MasterData.Active,
            };
            db.Departments.Add(dept);
            result[spec.Code] = dept;
        }
        await db.SaveChangesAsync();
        return result;
    }

    private static async Task<Dictionary<string, JobPosition>> SeedPositionsAndRequirementsAsync(
        AppDbContext db,
        Guid organizationId,
        Guid ownerUserId,
        IReadOnlyDictionary<string, Competency> competencies)
    {
        var family = new JobFamily { OrganizationId = organizationId, Code = "OFFICE", Name = "Khối văn phòng" };
        db.JobFamilies.Add(family);
        var now = DateTimeOffset.UtcNow;

        var result = new Dictionary<string, JobPosition>();
        foreach (var spec in PositionSpecs)
        {
            var position = new JobPosition
            {
                OrganizationId = organizationId,
                JobFamilyId = family.Id,
                Code = spec.Code,
                Name = spec.Name,
                Status = Statuses.MasterData.Active,
            };
            db.JobPositions.Add(position);

            var set = new PositionRequirementSet
            {
                JobPositionId = position.Id,
                VersionNo = 1,
                Status = Statuses.PositionRequirementSet.Active,
                EffectiveFrom = DateOnly.FromDateTime(now.UtcDateTime),
                CreatedByUserId = ownerUserId,
                ActivatedByUserId = ownerUserId,
                ActivatedAt = now,
            };

            var weights = SplitWeightsTo100(spec.CompetencyCodes.Length);
            for (var i = 0; i < spec.CompetencyCodes.Length; i++)
            {
                var compCode = spec.CompetencyCodes[i];
                var domainNum = int.Parse(compCode.Split('.')[0]);
                var reqLevel = spec.DomainLevels[domainNum];
                var isMandatory = reqLevel == 3 || CompetencyFrameworks.Tt02.CoreCompetencyCodes.Contains(compCode);

                set.Items.Add(new PositionRequirementItem
                {
                    RequirementSetId = set.Id,
                    CompetencyId = competencies[compCode].Id,
                    RequiredLevel = reqLevel,
                    WeightPercent = weights[i],
                    IsMandatory = isMandatory,
                    Note = "DEMO_POSITION_STANDARD",
                });
            }
            db.PositionRequirementSets.Add(set);
            result[spec.Code] = position;
        }

        await db.SaveChangesAsync();
        return result;
    }

    private static async Task SeedPurchasedCoursesAndCeilingsAsync(
        AppDbContext db,
        Guid organizationId,
        Guid ownerUserId,
        IReadOnlyDictionary<string, Department> departments)
    {
        var platformCourses = await db.PlatformCourses.AsNoTracking()
            .Where(c => c.PublishedAt != null)
            .ToListAsync();

        foreach (var code in PurchasedIntermediateCodes)
        {
            var pc = platformCourses
                .Where(c => CourseCodes.Canonical(c.Code).Equals(code, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(c => c.Code.Equals(code, StringComparison.OrdinalIgnoreCase))
                .ThenByDescending(c => c.VersionNo)
                .First();
            db.CourseOrders.Add(new CourseOrder
            {
                OrganizationId = organizationId,
                CourseId = pc.Id,
                Amount = pc.Price > 0 ? pc.Price : PlatformCatalog.DefaultPrice(2),
                Reason = $"Khởi tạo gói khóa học demo ({code})",
                CreatedByUserId = ownerUserId,
            });
        }

        var categories = await db.CompetencyCategories.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        // Trần cấp doanh nghiệp (DepartmentId = null): khớp với các khóa đã mua (D1=2, D2=2, D3=1, D4=2, D5=1, D6=1)
        var orgCeilings = new[] { 2, 2, 1, 2, 1, 1 };
        for (var i = 0; i < categories.Count && i < orgCeilings.Length; i++)
        {
            db.CapabilityCeilings.Add(new CapabilityCeiling
            {
                OrganizationId = organizationId,
                DepartmentId = null,
                CompetencyCategoryId = categories[i].Id,
                CeilingLevel = (short)orgCeilings[i],
                UpdatedByUserId = ownerUserId,
            });
        }

        // Trần năng lực theo 3 phòng ban do Owner đặt
        foreach (var spec in DepartmentSpecs)
        {
            var dept = departments[spec.Code];
            for (var i = 0; i < categories.Count && i < spec.DomainCeilings.Length; i++)
            {
                db.CapabilityCeilings.Add(new CapabilityCeiling
                {
                    OrganizationId = organizationId,
                    DepartmentId = dept.Id,
                    CompetencyCategoryId = categories[i].Id,
                    CeilingLevel = (short)spec.DomainCeilings[i],
                    UpdatedByUserId = ownerUserId,
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task<(User User, bool Created, string Password)> EnsurePlatformUserAsync(
        AppDbContext db, IPasswordHasher hasher, string email, string displayName, string roleCode) =>
        await EnsureOrgUserAsync(db, hasher, organizationId: null, email, displayName, roleCode);

    private static async Task<(User User, bool Created, string Password)> EnsureOrgUserAsync(
        AppDbContext db, IPasswordHasher hasher, Guid? organizationId, string email, string displayName, string roleCode)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var existing = await db.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == normalized);
        if (existing != null)
        {
            if (existing.LastLoginAt == null)
            {
                existing.LastLoginAt = DateTimeOffset.UtcNow.AddDays(-2);
                await db.SaveChangesAsync();
            }
            return (existing, false, "(đã tồn tại — giữ nguyên mật khẩu cũ; chạy reset-seed-demo để cấp lại)");
        }

        var now = DateTimeOffset.UtcNow;
        var password = GenerateStrongPassword();
        var user = new User
        {
            OrganizationId = organizationId,
            Email = normalized,
            DisplayName = displayName,
            PasswordHash = hasher.Hash(password),
            EmailVerifiedAt = now,
            LastLoginAt = now.AddDays(-2),
            Status = Statuses.User.Active,
        };
        db.Users.Add(user);

        var roleCodes = roleCode == Roles.Manager ? new[] { Roles.Manager, Roles.Employee } : new[] { roleCode };
        var roles = await db.Roles.Where(r => roleCodes.Contains(r.Code)).ToListAsync();
        foreach (var role in roles)
        {
            user.UserRoles.Add(new UserRole { RoleId = role.Id, AssignedAt = now });
        }

        await db.SaveChangesAsync();
        return (user, true, password);
    }

    private static async Task CollectExistingAccountsForCsvAsync(
        AppDbContext db,
        Organization org,
        string orgName,
        string slug,
        bool isMainOrg,
        List<DemoSeedAccountRecord> accounts,
        CancellationToken cancellationToken)
    {
        var users = await db.Users.AsNoTracking()
            .Where(u => u.OrganizationId == org.Id)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .ToListAsync(cancellationToken);
        var employees = await db.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == org.Id)
            .ToDictionaryAsync(e => e.UserId ?? Guid.Empty, cancellationToken);
        var departments = await db.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == org.Id)
            .ToDictionaryAsync(d => d.Id, d => d.Name, cancellationToken);
        var positions = await db.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == org.Id)
            .ToDictionaryAsync(p => p.Id, p => p.Name, cancellationToken);

        foreach (var u in users.OrderBy(u => u.Email))
        {
            var role = u.UserRoles.Select(ur => ur.Role?.Code).FirstOrDefault(c => c != Roles.Employee)
                ?? u.UserRoles.Select(ur => ur.Role?.Code).FirstOrDefault()
                ?? Roles.Employee;
            employees.TryGetValue(u.Id, out var emp);
            var deptName = emp != null && departments.TryGetValue(emp.DepartmentId, out var dn) ? dn : "—";
            var posName = emp?.JobPositionId is { } pid && positions.TryGetValue(pid, out var pn) ? pn : "—";

            var group = "—";
            var export = role is Roles.Owner or Roles.Research;
            if (role == Roles.Manager)
            {
                export = isMainOrg || u.Email.StartsWith("manager.acc.", StringComparison.OrdinalIgnoreCase);
            }
            else if (role == Roles.Employee && emp != null && int.TryParse(emp.EmployeeCode.Replace("EMP-", ""), out var idx))
            {
                var tpl = EmployeeTemplates.FirstOrDefault(t => t.Index == idx);
                if (tpl != null)
                {
                    group = tpl.StatusGroup;
                    export = isMainOrg ? idx is 1 or 9 or 12 or 17 or 25 : idx is 1 or 17;
                }
            }

            if (export)
            {
                accounts.Add(new DemoSeedAccountRecord(
                    orgName, org.Code, role, u.DisplayName, deptName, posName, group, u.Email,
                    "(đã tồn tại — giữ nguyên mật khẩu cũ; chạy reset-seed-demo để cấp lại)", ExportToCsv: true));
            }
        }
    }

    private static decimal[] SplitWeightsTo100(int count)
    {
        var cents = 10_000 / count;
        var weights = Enumerable.Repeat(cents / 100m, count).ToArray();
        weights[^1] += (10_000 - cents * count) / 100m;
        return weights;
    }

    private static string FictionalName(int orgIndex, int personIndex)
    {
        var seed = orgIndex * 43 + personIndex * 17;
        var last = LastNames[(seed + orgIndex) % LastNames.Length];
        var mid = MiddleNames[(seed * 3 + personIndex) % MiddleNames.Length];
        var first = FirstNames[(seed * 5 + orgIndex * 7 + personIndex) % FirstNames.Length];
        return $"{last} {mid} {first}";
    }

    public static string GenerateStrongPassword()
    {
        // Dạng dễ đọc DemoXXX-xxxx-xxxx: không dùng l, I, 1, O, 0 và không dùng ký tự đặc biệt ngoài dấu gạch '-'.
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string upperDigits = upper + digits;
        const string lowerDigits = lower + digits;

        var xxx = new[]
        {
            upper[RandomNumberGenerator.GetInt32(upper.Length)],
            digits[RandomNumberGenerator.GetInt32(digits.Length)],
            upperDigits[RandomNumberGenerator.GetInt32(upperDigits.Length)],
        };
        var part1 = new[]
        {
            lower[RandomNumberGenerator.GetInt32(lower.Length)],
            digits[RandomNumberGenerator.GetInt32(digits.Length)],
            lowerDigits[RandomNumberGenerator.GetInt32(lowerDigits.Length)],
            lowerDigits[RandomNumberGenerator.GetInt32(lowerDigits.Length)],
        };
        var part2 = new[]
        {
            lower[RandomNumberGenerator.GetInt32(lower.Length)],
            lowerDigits[RandomNumberGenerator.GetInt32(lowerDigits.Length)],
            digits[RandomNumberGenerator.GetInt32(digits.Length)],
            lowerDigits[RandomNumberGenerator.GetInt32(lowerDigits.Length)],
        };

        return $"Demo{new string(xxx)}-{new string(part1)}-{new string(part2)}";
    }

    private static void WriteCsv(string path, IReadOnlyList<DemoSeedAccountRecord> rows)
    {
        var fullPath = Path.GetFullPath(path);
        var dir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrWhiteSpace(dir)) Directory.CreateDirectory(dir);

        static string Escape(string value) =>
            value.Contains(',') || value.Contains('"') || value.Contains('\n')
                ? $"\"{value.Replace("\"", "\"\"")}\""
                : value;

        var sb = new StringBuilder();
        sb.AppendLine("Tổ chức,Vai trò,Họ tên,Phòng ban,Vị trí,Nhóm trạng thái (A/B/C/D),Email đăng nhập,Mật khẩu");
        foreach (var r in rows)
        {
            sb.AppendLine(string.Join(",",
                Escape(r.OrganizationName),
                Escape(r.Role),
                Escape(r.FullName),
                Escape(r.DepartmentName),
                Escape(r.PositionName),
                Escape(r.StatusGroup),
                Escape(r.Email),
                Escape(r.Password)));
        }
        File.WriteAllText(fullPath, sb.ToString(), new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));
    }

    private sealed class DemoMentorCurrentUser(Guid mentorUserId) : ICurrentUser
    {
        public Guid? UserId => mentorUserId;
        public Guid? EmployeeId => null;
        public Guid? OrganizationId => null;
        public Guid? DepartmentId => null;
        public bool IsAuthenticated => true;
        public bool IsAdmin => false;
        public bool IsDepartmentManager => false;
        public List<string> Roles { get; } = new() { DigiTalent.Domain.Constants.Authorization.Roles.Mentor };
        public string? IpAddress => "127.0.0.1";
        public bool IsInRole(string roleCode) => Roles.Contains(roleCode, StringComparer.OrdinalIgnoreCase);
        public Guid GetRequiredOrganizationId() => throw new InvalidOperationException("Mentor has no organization.");
        public Guid GetRequiredDepartmentId() => throw new InvalidOperationException("Mentor has no department.");
    }
}
