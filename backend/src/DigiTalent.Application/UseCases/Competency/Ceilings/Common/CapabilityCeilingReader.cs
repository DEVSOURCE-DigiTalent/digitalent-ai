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
/// Đọc ma trận phạm vi năng lực của một tổ chức: lĩnh vực có khóa chuẩn, phạm vi doanh nghiệp (đã lưu hoặc gợi ý),
/// phạm vi hiệu lực của từng phòng ban và gợi ý từ yêu cầu vị trí.
/// </summary>
public class CapabilityCeilingReader
{
    public static readonly string[] LevelNames = { "Cơ bản", "Trung cấp", "Nâng cao" };

    private readonly IApplicationDbContext _context;
    private readonly PulseCatalogReader _catalog;
    private readonly ReferencePositionMatrixService? _references;

    public CapabilityCeilingReader(IApplicationDbContext context, PulseCatalogReader catalog, ReferencePositionMatrixService? references = null)
    {
        _context = context;
        _catalog = catalog;
        _references = references;
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

        var rows = await _context.CapabilityCeilings
            .AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && domainIds.Contains(c.CompetencyCategoryId))
            .ToListAsync();
        var orgRows = rows.Where(r => r.DepartmentId == null).ToDictionary(r => r.CompetencyCategoryId);
        var deptRows = rows.Where(r => r.DepartmentId != null)
            .GroupBy(r => r.DepartmentId!.Value)
            .ToDictionary(g => g.Key, g => g.ToDictionary(r => r.CompetencyCategoryId, r => (int)r.CeilingLevel));

        var departments = await _context.Departments
            .AsNoTracking()
            .Where(d => d.OrganizationId == organizationId && d.Status == Statuses.MasterData.Active)
            .OrderBy(d => d.Name)
            .Select(d => new { d.Id, d.Code, d.Name })
            .ToListAsync();
        var employees = await _context.Employees
            .AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.Status == Statuses.Employee.Active)
            .Select(e => new { e.DepartmentId, e.JobPositionId })
            .ToListAsync();
        var templateCodes = JobPositionCatalog.Positions.Keys.ToArray();
        var positionsInOrganization = await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active
                && (p.DepartmentId != null || !templateCodes.Contains(p.Code)))
            .Select(p => new { p.Id, p.DepartmentId, p.Code, p.Name })
            .ToListAsync();
        var reference = _references == null ? null : await _references.GetAsync();
        var domainNumbers = domains.Select((domain, index) => new
            { domain.Id, Number = domain.Code.StartsWith("TT02_D", StringComparison.OrdinalIgnoreCase)
                && int.TryParse(domain.Code.AsSpan(6), out var number) && number is >= 1 and <= 6 ? number : index + 1 })
            .ToDictionary(row => row.Id, row => row.Number);
        var referenceByPosition = positionsInOrganization
            .Select(position => new { position.Id, Code = ReferencePositionMatrixService.MatchPosition(position.Code, position.Name) })
            .Where(position => position.Code != null && reference?.Levels.ContainsKey(position.Code) == true)
            .ToDictionary(position => position.Id, position => reference!.Levels[position.Code!]);

        // Mức yêu cầu cao nhất theo (vị trí, lĩnh vực) trong các bộ yêu cầu ACTIVE.
        var requirementRows = await (
                from set in _context.PositionRequirementSets.AsNoTracking()
                join position in _context.JobPositions.AsNoTracking() on set.JobPositionId equals position.Id
                join item in _context.PositionRequirementItems.AsNoTracking() on set.Id equals item.RequirementSetId
                join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                where position.OrganizationId == organizationId
                      && position.Status == Statuses.MasterData.Active
                      && set.Status == Statuses.PositionRequirementSet.Active
                      && domainIds.Contains(competency.CategoryId)
                select new { PositionId = position.Id, position.DepartmentId, competency.CategoryId, item.RequiredLevel })
            .ToListAsync();
        var requirementByPosition = requirementRows
            .GroupBy(r => r.PositionId)
            .ToDictionary(
                g => g.Key,
                g => g.GroupBy(r => r.CategoryId).ToDictionary(c => c.Key, c => Clamp(c.Max(r => (int)r.RequiredLevel))));

        var effectiveTargets = await new PositionTargetsReader(_context).LoadAsync(organizationId, positionsInOrganization.Select(p => p.Id).ToArray());
        int Suggest(IEnumerable<Guid> positionIds, Guid categoryId) => positionIds
            .Select(id => effectiveTargets.TryGetValue(id, out var target) && target.UsesSystemReference && target.Levels.ContainsKey(categoryId)
                ? target.Levels[categoryId]
                : requirementByPosition.TryGetValue(id, out var levels)
                ? levels.GetValueOrDefault(categoryId)
                : referenceByPosition.TryGetValue(id, out var sample) ? sample[domainNumbers[categoryId] - 1] : 0)
            .DefaultIfEmpty(0)
            .Max();

        var allPositions = requirementByPosition.Keys.Concat(referenceByPosition.Keys).Concat(effectiveTargets.Keys).Distinct().ToList();

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
            IsConfigured = orgRows.Count > 0,
            Levels = LevelNames.Select((name, i) => new CeilingLevelDto { Level = i + 1, Name = name }).ToList(),
            PlatformCourseCount = domains.Count * CapabilityCeiling.MaxLevel,
        };

        var organizationCeilings = new Dictionary<Guid, int>();
        foreach (var domain in domains)
        {
            var suggested = Suggest(allPositions, domain.Id);

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
            // Chủ doanh nghiệp không chọn mức chung; chỉ phòng ban mới được đặt mức riêng (không vượt khóa đã mua).
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

        foreach (var department in departments)
        {
            var positions = positionsInOrganization.Where(p => p.DepartmentId == department.Id)
                .Select(p => p.Id)
                .ToList();
            deptRows.TryGetValue(department.Id, out var custom);
            var values = domains.Select(domain =>
            {
                var orgCeiling = organizationCeilings[domain.Id];
                var isCustom = custom != null && custom.ContainsKey(domain.Id);
                // A department may aim above the owned courses (set first, buy later); the suggestion is not capped either.
                return new CeilingValueDto
                {
                    CategoryId = domain.Id,
                    Level = isCustom ? Clamp(custom![domain.Id]) : orgCeiling,
                    Suggested = Suggest(positions, domain.Id),
                    IsCustomized = isCustom,
                };
            }).ToList();

            output.Departments.Add(new CeilingDepartmentDto
            {
                DepartmentId = department.Id,
                Code = department.Code,
                Name = department.Name,
                EmployeeCount = employees.Count(e => e.DepartmentId == department.Id),
                HasSuggestion = domains.All(domain => Suggest(positions, domain.Id) > 0),
                IsCustomized = values.Any(v => v.IsCustomized),
                CourseCount = values.Sum(v => v.Level),
                Ceilings = values,
            });
        }

        var latest = rows.OrderByDescending(r => r.UpdatedAt).FirstOrDefault();
        if (latest != null)
        {
            output.UpdatedAt = latest.UpdatedAt;
            output.UpdatedByName = latest.UpdatedByUserId.HasValue
                ? await _context.Users.AsNoTracking().Where(u => u.Id == latest.UpdatedByUserId).Select(u => u.DisplayName).FirstOrDefaultAsync()
                : null;
        }

        return output;
    }

    /// <summary>
    /// Mức trần của lộ trình nhân viên theo lĩnh vực (Pulse): mức chủ doanh nghiệp đặt cho phòng ban (cũng là đích lộ trình,
    /// <see cref="CapabilityExpectation"/>); phòng ban chưa đặt (hoặc nhân viên chưa có phòng ban) thì theo chuẩn vị trí của
    /// tổ chức (mức cao nhất các vị trí cần, ít nhất Cơ bản). Khóa chưa mua vẫn nằm trên lộ trình và bị khóa bởi quyền học
    /// (<see cref="CourseOwnership"/>).
    /// </summary>
    public async Task<Dictionary<Guid, int>> EffectiveForDepartmentAsync(Guid organizationId, Guid? departmentId, IReadOnlyCollection<Guid> categoryIds)
    {
        var ids = categoryIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        var departmentRows = departmentId == null
            ? new Dictionary<Guid, int>()
            : await _context.CapabilityCeilings
                .AsNoTracking()
                .Where(c => c.OrganizationId == organizationId && c.DepartmentId == departmentId && ids.Contains(c.CompetencyCategoryId))
                .ToDictionaryAsync(c => c.CompetencyCategoryId, c => (int)c.CeilingLevel);

        var unset = ids.Where(id => !departmentRows.ContainsKey(id)).ToList();
        var suggested = new Dictionary<Guid, int>();
        if (unset.Count > 0)
        {
            var templateCodes = JobPositionCatalog.Positions.Keys.ToArray();
            var positionIds = await _context.JobPositions.AsNoTracking()
                .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active
                    && (p.DepartmentId != null || !templateCodes.Contains(p.Code)))
                .Select(p => p.Id).ToListAsync();
            var targets = await new PositionTargetsReader(_context).LoadAsync(organizationId, positionIds);
            suggested = targets.Values.SelectMany(t => t.Levels).Where(t => unset.Contains(t.Key))
                .GroupBy(t => t.Key).ToDictionary(g => g.Key, g => Clamp(g.Max(t => t.Value)));
        }

        return ids.ToDictionary(id => id, id => departmentRows.TryGetValue(id, out var custom)
            ? Clamp(custom)
            : Math.Max(1, suggested.GetValueOrDefault(id)));
    }

    private static int Clamp(int level) => Math.Clamp(level, 0, CapabilityCeiling.MaxLevel);
}
