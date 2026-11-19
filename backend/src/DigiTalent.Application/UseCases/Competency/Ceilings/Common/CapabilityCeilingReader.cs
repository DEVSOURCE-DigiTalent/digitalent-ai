using DigiTalent.Application.Common;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.Competency.Common;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Đọc Khung năng lực số của một tổ chức: lĩnh vực có khóa chuẩn, khóa doanh nghiệp đã có, mức cần đạt của 5 vị trí chuẩn
/// (mức chủ doanh nghiệp đặt, chưa đặt thì đề xuất của hệ thống).
/// </summary>
public class CapabilityCeilingReader
{
    public static readonly string[] LevelNames = { "Cơ bản", "Trung cấp", "Nâng cao" };

    private readonly IApplicationDbContext _context;
    private readonly PulseCatalogReader _catalog;

    // The platform reference matrix is read straight from the settings (ReferencePositionMatrixService.ReadAsync).
    public CapabilityCeilingReader(IApplicationDbContext context, PulseCatalogReader catalog, ReferencePositionMatrixService? references = null)
    {
        _context = context;
        _catalog = catalog;
    }

    /// <summary>Lĩnh vực của ma trận: lĩnh vực có khóa chuẩn đã xuất bản, không có thì mọi lĩnh vực ACTIVE.</summary>
    public async Task<List<CompetencyCategory>> LoadDomainsAsync(Guid organizationId, IReadOnlyCollection<Guid>? withCourses = null)
    {
        var categories = await _context.CompetencyCategories
            .AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.Status == Statuses.MasterData.Active)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .ToListAsync();
        if (withCourses == null)
        {
            withCourses = (await _catalog.LoadAsync(organizationId)).Select(c => c.CategoryId).ToHashSet();
        }

        var covered = categories.Where(c => withCourses.Contains(c.Id)).ToList();
        return covered.Count > 0 ? covered : categories;
    }

    public async Task<T> ReadAsync<T>(Guid organizationId)
        where T : CapabilityCeilingsDto, new()
    {
        var catalog = await _catalog.LoadAsync(organizationId);
        var catalogCourseIds = catalog.Select(c => c.CourseId).ToList();
        var courseCompetencies = await _context.CourseCompetencies.AsNoTracking()
            .Where(item => catalogCourseIds.Contains(item.CourseId))
            .Select(item => new { item.CourseId, item.CompetencyId, item.TargetLevel })
            .ToListAsync();
        var competenciesByCourse = courseCompetencies
            .GroupBy(item => item.CourseId)
            .ToDictionary(group => group.Key, group => group.Select(item => new CeilingCourseCompetencyDto
            {
                CompetencyId = item.CompetencyId,
                TargetLevel = item.TargetLevel,
            }).ToList());
        var domains = await LoadDomainsAsync(organizationId, catalog.Select(c => c.CategoryId).ToHashSet());
        var domainIds = domains.Select(d => d.Id).ToList();

        var domainNumbers = domains.Select((domain, index) => new
            { domain.Id, Number = domain.Code.StartsWith("TT02_D", StringComparison.OrdinalIgnoreCase)
                && int.TryParse(domain.Code.AsSpan(6), out var number) && number is >= 1 and <= 6 ? number : index + 1 })
            .ToDictionary(row => row.Id, row => row.Number);
        var employees = await _context.Employees
            .AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.Status == Statuses.Employee.Active)
            .Select(e => new { e.DepartmentId, e.JobPositionId })
            .ToListAsync();
        var departmentNames = await _context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == organizationId)
            .ToDictionaryAsync(d => d.Id, d => d.Name);

        // Khung năng lực số theo vị trí: 5 vị trí chuẩn, dùng chung mọi phòng ban. Mức cần đạt = mức chủ doanh nghiệp đặt
        // (ghi trong chuẩn vị trí, PositionLevelWriter), chưa đặt thì đề xuất của hệ thống (mẫu TT02 của vị trí).
        var organizationPositions = await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.Status != Statuses.MasterData.Archived)
            .Select(p => new { p.Id, p.Code, p.Name, p.Status })
            .ToListAsync();
        // the row with the catalog code, else an older row that names the same position (e.g. "SALES", "Kế toán viên")
        var standard = JobPositionCatalog.Positions
            .Select(entry => (Code: entry.Key, Label: entry.Value,
                Row: organizationPositions.FirstOrDefault(p => p.Code.Equals(entry.Key, StringComparison.OrdinalIgnoreCase))
                    ?? organizationPositions.FirstOrDefault(p => !JobPositionCatalog.Positions.ContainsKey(p.Code)
                        && ReferencePositionMatrixService.MatchPosition(p.Code, p.Name) == entry.Key)))
            .Where(entry => entry.Row == null || entry.Row.Status == Statuses.MasterData.Active)
            .ToList();
        var targets = await new PositionTargetsReader(_context).LoadAsync(organizationId,
            standard.Where(entry => entry.Row != null).Select(entry => entry.Row!.Id).ToArray());
        var matrix = await ReferencePositionMatrixService.ReadAsync(_context);
        int SuggestedFor(string code, Guid categoryId) =>
            matrix.Levels.TryGetValue(code, out var sample) && domainNumbers.TryGetValue(categoryId, out var number) && number is >= 1 and <= 6
                ? Clamp(sample[number - 1]) : 0;
        PositionTargets? TargetsOf(Guid? positionId) => positionId is Guid id ? targets.GetValueOrDefault(id) : null;
        int LevelFor(string code, Guid? positionId, Guid categoryId) =>
            TargetsOf(positionId)?.Levels.TryGetValue(categoryId, out var level) == true && level > 0
                ? Clamp(level) : SuggestedFor(code, categoryId);
        bool OwnerSet(Guid? positionId, Guid categoryId) => TargetsOf(positionId)?.OwnerDomains.Contains(categoryId) == true;
        // Whole company: the positions held in the organization, else all 5.
        var held = employees.Where(e => e.JobPositionId != null).Select(e => e.JobPositionId!.Value).ToHashSet();
        var companyPositions = standard.Where(entry => entry.Row != null && held.Contains(entry.Row.Id)).ToList();
        if (companyPositions.Count == 0) companyPositions = standard;
        // Khóa có phí doanh nghiệp đã mua (hoặc được cấp) và giá bán hiện tại của từng khóa chuẩn
        var unlockedCodes = await CourseOwnership.PurchasedCodesAsync(_context, organizationId);
        var prices = (await _context.PlatformCourses.AsNoTracking()
                .Where(pc => pc.PublishedAt != null)
                .Select(pc => new { pc.Code, pc.Price })
                .ToListAsync())
            .GroupBy(pc => CourseCodes.Canonical(pc.Code), StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Max(pc => pc.Price), StringComparer.OrdinalIgnoreCase);

        var output = new T
        {
            PlatformMaxLevel = CapabilityCeiling.MaxLevel,
            IsConfigured = targets.Values.Any(t => t.OwnerDomains.Count > 0),
            Levels = LevelNames.Select((name, i) => new CeilingLevelDto { Level = i + 1, Name = name }).ToList(),
            PlatformCourseCount = domains.Count * CapabilityCeiling.MaxLevel,
        };

        var organizationCeilings = new Dictionary<Guid, int>();
        foreach (var domain in domains)
        {
            var suggested = companyPositions.Select(entry => LevelFor(entry.Code, entry.Row?.Id, domain.Id)).DefaultIfEmpty(0).Max();

            var domainCourses = Enumerable.Range(1, CapabilityCeiling.MaxLevel).Select(level =>
            {
                var course = catalog.FirstOrDefault(c => c.CategoryId == domain.Id && c.Tier == level);
                var rawCode = course?.Code;
                var domainNum = domainNumbers.TryGetValue(domain.Id, out var dn) ? dn : 0;
                var levelSuffix = level switch { 1 => "F", 2 => "I", 3 => "A", _ => "" };
                var fallbackCode = domainNum > 0 ? $"M{domainNum}-{levelSuffix}" : null;

                // Chuẩn hóa hiển thị tiền tố M (M1-F, M1-I, M1-A...) theo yêu cầu doanh nghiệp
                var displayCode = CourseCodes.Canonical(rawCode ?? fallbackCode);
                if (string.IsNullOrEmpty(displayCode))
                {
                    displayCode = rawCode ?? fallbackCode;
                }

                var expectedCanonical = CourseCodes.Canonical(displayCode);

                // Cấp 1 (Cơ bản) luôn mở miễn phí. Cấp 2 và Cấp 3 mở cho cả doanh nghiệp khi đã mua khóa.
                var isUnlocked = level == 1 || unlockedCodes.Contains(expectedCanonical);
                var price = level == 1 ? 0L
                    : prices.TryGetValue(expectedCanonical, out var listed) && listed > 0 ? listed
                    : PlatformCatalog.DefaultPrice(level);

                return new CeilingCourseDto
                {
                    Level = level,
                    CourseId = course?.CourseId,
                    Code = displayCode,
                    Title = course?.Title,
                    Competencies = course != null && competenciesByCourse.TryGetValue(course.CourseId, out var taught)
                        ? taught : new List<CeilingCourseCompetencyDto>(),
                    IsUnlocked = isUnlocked,
                    Price = price
                };
            }).ToList();

            var maxAllowed = domainCourses.Where(c => c.IsUnlocked).Select(c => c.Level).DefaultIfEmpty(1).Max();
            // Toàn doanh nghiệp = mọi khóa doanh nghiệp đã có (Cơ bản miễn phí + khóa đã mua), dùng được ở mọi phòng ban.
            // Chủ doanh nghiệp không chọn mức chung; mức cần đạt đặt theo vị trí (có thể cao hơn khóa đã mua).
            var ceiling = maxAllowed;
            organizationCeilings[domain.Id] = ceiling;

            output.Domains.Add(new CeilingDomainDto
            {
                CategoryId = domain.Id,
                Code = domain.Code,
                Name = PulseLearnerReader.DisplayName(domain.Name),
                SortOrder = domain.SortOrder,
                OrganizationCeiling = ceiling,
                MaxAllowedCeiling = maxAllowed,
                SuggestedCeiling = suggested,
                Courses = domainCourses,
            });
        }

        output.OrganizationCourseCount = organizationCeilings.Values.Sum();

        foreach (var (code, label, row) in standard)
        {
            var values = domains.Select(domain => new CeilingValueDto
            {
                CategoryId = domain.Id,
                Level = LevelFor(code, row?.Id, domain.Id),
                Suggested = SuggestedFor(code, domain.Id),
                IsCustomized = OwnerSet(row?.Id, domain.Id),
            }).ToList();
            var holders = employees.Where(e => row != null && e.JobPositionId == row.Id).ToList();
            output.Positions.Add(new CeilingPositionDto
            {
                PositionId = row?.Id,
                Code = code,
                Name = row?.Name ?? label,
                EmployeeCount = holders.Count,
                Departments = holders.Select(e => departmentNames.GetValueOrDefault(e.DepartmentId)).OfType<string>()
                    .Distinct().OrderBy(name => name).ToList(),
                HasSuggestion = values.All(v => v.Suggested > 0),
                IsCustomized = values.Any(v => v.IsCustomized),
                CourseCount = values.Sum(v => v.Level),
                Ceilings = values,
            });
        }

        // Lần lưu gần nhất = phiên bản chuẩn vị trí mới nhất có mức chủ doanh nghiệp đặt.
        var ownerSetIds = standard.Where(entry => TargetsOf(entry.Row?.Id)?.OwnerDomains.Count > 0).Select(entry => entry.Row!.Id).ToList();
        var latest = await _context.PositionRequirementSets.AsNoTracking()
            .Where(s => ownerSetIds.Contains(s.JobPositionId) && s.Status == Statuses.PositionRequirementSet.Active)
            .OrderByDescending(s => s.ActivatedAt)
            .Select(s => new { s.ActivatedAt, s.ActivatedByUserId })
            .FirstOrDefaultAsync();
        if (latest != null)
        {
            output.UpdatedAt = latest.ActivatedAt;
            output.UpdatedByName = latest.ActivatedByUserId.HasValue
                ? await _context.Users.AsNoTracking().Where(u => u.Id == latest.ActivatedByUserId).Select(u => u.DisplayName).FirstOrDefaultAsync()
                : null;
        }
        return output;
    }

    /// <summary>
    /// Mức cần đạt của một vị trí theo lĩnh vực (lộ trình Pulse): mức chủ doanh nghiệp đặt cho vị trí ở Khung năng lực số
    /// (IsCustom), chưa đặt thì chuẩn vị trí (đề xuất của hệ thống); người chưa có vị trí theo các vị trí trong tổ chức (mức
    /// cao nhất các vị trí cần). Ít nhất Cơ bản. Khóa chưa mua vẫn nằm trên lộ trình và bị khóa bởi quyền học
    /// (<see cref="CourseOwnership"/>).
    /// </summary>
    public async Task<Dictionary<Guid, RequiredDomainLevel>> ForPositionAsync(Guid organizationId, Guid? positionId, IReadOnlyCollection<Guid> categoryIds)
    {
        var ids = categoryIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, RequiredDomainLevel>();
        }

        var own = positionId is Guid id
            ? (await new PositionTargetsReader(_context).LoadAsync(organizationId, [id])).GetValueOrDefault(id)
            : null;
        var fallback = ids.Any(category => own?.Levels.GetValueOrDefault(category) is not > 0)
            ? await HeldLevelsAsync(organizationId, null)
            : new Dictionary<Guid, int>();
        return ids.ToDictionary(category => category, category => own?.Levels.GetValueOrDefault(category) is > 0 and var level
            ? new RequiredDomainLevel(Clamp(level), IsCustom: own.OwnerDomains.Contains(category))
            : new RequiredDomainLevel(Math.Max(1, fallback.GetValueOrDefault(category)), IsCustom: false));
    }

    /// <summary>
    /// Mức cần đạt của một phòng ban theo lĩnh vực (trang trưởng phòng): mức cao nhất của các vị trí nhân viên phòng ban đang
    /// giữ (mức chủ doanh nghiệp đặt cho vị trí, chưa đặt thì chuẩn vị trí), không có thì các vị trí trong tổ chức; ít nhất Cơ bản.
    /// </summary>
    public async Task<Dictionary<Guid, int>> EffectiveForDepartmentAsync(Guid organizationId, Guid? departmentId, IReadOnlyCollection<Guid> categoryIds)
    {
        var levels = await HeldLevelsAsync(organizationId, departmentId);
        return categoryIds.Distinct().ToDictionary(category => category, category => Math.Max(1, levels.GetValueOrDefault(category)));
    }

    /// <summary>Highest level per domain of the positions held in the department, else in the organization.</summary>
    private async Task<Dictionary<Guid, int>> HeldLevelsAsync(Guid organizationId, Guid? departmentId)
    {
        var held = await (
                from employee in _context.Employees.AsNoTracking()
                join position in _context.JobPositions.AsNoTracking() on employee.JobPositionId equals position.Id
                where employee.OrganizationId == organizationId && employee.Status == Statuses.Employee.Active
                    && position.Status == Statuses.MasterData.Active
                select new { employee.DepartmentId, PositionId = position.Id })
            .Distinct().ToListAsync();
        var inDepartment = held.Where(h => departmentId != null && h.DepartmentId == departmentId).Select(h => h.PositionId).Distinct().ToList();
        var positionIds = inDepartment.Count > 0 ? inDepartment : held.Select(h => h.PositionId).Distinct().ToList();
        var targets = await new PositionTargetsReader(_context).LoadAsync(organizationId, positionIds);
        return targets.Values.SelectMany(t => t.Levels)
            .GroupBy(t => t.Key).ToDictionary(g => g.Key, g => Clamp(g.Max(t => t.Value)));
    }

    private static int Clamp(int level) => Math.Clamp(level, 0, CapabilityCeiling.MaxLevel);
}

/// <summary>Mức cần đạt của một lĩnh vực; <paramref name="IsCustom"/> = chủ doanh nghiệp đã đặt cho vị trí ở Khung năng lực số.</summary>
public sealed record RequiredDomainLevel(int Level, bool IsCustom);
