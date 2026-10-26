using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.Platform.References;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Đọc ma trận trần nhà của một tổ chức: lĩnh vực có khóa chuẩn, trần doanh nghiệp (đã lưu hoặc gợi ý),
/// trần hiệu lực của từng phòng ban và gợi ý từ yêu cầu vị trí.
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
        var positionsInOrganization = await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.Status == Statuses.MasterData.Active)
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

        int Suggest(IEnumerable<Guid> positionIds, Guid categoryId) => positionIds
            .Select(id => requirementByPosition.TryGetValue(id, out var levels)
                ? levels.GetValueOrDefault(categoryId)
                : referenceByPosition.TryGetValue(id, out var sample) ? sample[domainNumbers[categoryId] - 1] : 0)
            .DefaultIfEmpty(0)
            .Max();

        var allPositions = requirementByPosition.Keys.Concat(referenceByPosition.Keys).Distinct().ToList();

        // Tải các đơn mua suất học của doanh nghiệp để xác định bản quyền đã mở
        var seatOrders = await (
            from o in _context.CourseSeatOrders.AsNoTracking()
            join pc in _context.PlatformCourses.AsNoTracking() on o.CourseId equals pc.Id
            where o.OrganizationId == organizationId
            select new { pc.Code, pc.Level, o.Seats, pc.PricePerSeat }
        ).ToListAsync();

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
            // Chưa lưu: hiển thị gợi ý (ít nhất cấp Cơ bản) để doanh nghiệp xác nhận.
            var ceiling = orgRows.TryGetValue(domain.Id, out var row) ? row.CeilingLevel : Math.Max(1, suggested);
            organizationCeilings[domain.Id] = ceiling;

            var domainCourses = Enumerable.Range(1, CapabilityCeiling.MaxLevel).Select(level =>
            {
                var course = catalog.FirstOrDefault(c => c.CategoryId == domain.Id && c.Tier == level);
                var rawCode = course?.Code;
                // Chuẩn hóa hiển thị tiền tố M (M1-F, M1-I, M1-A...) theo yêu cầu doanh nghiệp
                var displayCode = rawCode;
                if (!string.IsNullOrEmpty(displayCode) && displayCode.StartsWith("A", StringComparison.OrdinalIgnoreCase) && displayCode.Length > 2 && char.IsDigit(displayCode[1]))
                {
                    displayCode = "M" + displayCode[1..];
                }

                // Cấp 1 (Cơ bản) luôn mở miễn phí 100%. Cấp 2 và Cấp 3 mở khi có suất học hoặc đã thiết lập trần.
                var seats = level == 1
                    ? 999
                    : seatOrders.Where(so => so.Level == level && (rawCode == null || so.Code == rawCode || (displayCode != null && so.Code == displayCode))).Sum(so => so.Seats);
                var isUnlocked = level == 1 || seats > 0 || ceiling >= level;
                var price = level == 3 ? 699000L : (level == 2 ? 399000L : 0L);

                return new CeilingCourseDto
                {
                    Level = level,
                    CourseId = course?.CourseId,
                    Code = displayCode,
                    Title = course?.Title,
                    IsUnlocked = isUnlocked,
                    SeatsPurchased = seats == 999 ? 0 : seats,
                    PricePerSeat = price
                };
            }).ToList();

            var maxAllowed = Math.Max(1, Math.Max(ceiling, domainCourses.Where(c => c.IsUnlocked).Select(c => c.Level).DefaultIfEmpty(1).Max()));

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
            var positions = employees
                .Where(e => e.DepartmentId == department.Id && e.JobPositionId.HasValue)
                .Select(e => e.JobPositionId!.Value)
                .Concat(positionsInOrganization.Where(p => p.DepartmentId == department.Id).Select(p => p.Id))
                .Distinct()
                .ToList();
            deptRows.TryGetValue(department.Id, out var custom);
            var values = domains.Select(domain =>
            {
                var orgCeiling = organizationCeilings[domain.Id];
                var isCustom = custom != null && custom.ContainsKey(domain.Id);
                return new CeilingValueDto
                {
                    CategoryId = domain.Id,
                    Level = isCustom ? Math.Min(custom![domain.Id], orgCeiling) : orgCeiling,
                    Suggested = Math.Min(Suggest(positions, domain.Id), orgCeiling),
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
    /// Trần hiệu lực của một phòng ban theo lĩnh vực, cùng quy tắc với ma trận OW-05: trần riêng của phòng ban (không
    /// vượt trần doanh nghiệp) → trần doanh nghiệp đã lưu → chưa lưu thì gợi ý từ yêu cầu vị trí của tổ chức (ít nhất
    /// Cơ bản). Không có phòng ban thì là trần doanh nghiệp. Dùng cho lộ trình của nhân viên (Pulse).
    /// </summary>
    public async Task<Dictionary<Guid, int>> EffectiveForDepartmentAsync(Guid organizationId, Guid? departmentId, IReadOnlyCollection<Guid> categoryIds)
    {
        var ids = categoryIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<Guid, int>();
        }

        var rows = await _context.CapabilityCeilings
            .AsNoTracking()
            .Where(c => c.OrganizationId == organizationId
                        && ids.Contains(c.CompetencyCategoryId)
                        && (c.DepartmentId == null || c.DepartmentId == departmentId))
            .Select(c => new { c.DepartmentId, c.CompetencyCategoryId, c.CeilingLevel })
            .ToListAsync();
        var organizationRows = rows
            .Where(r => r.DepartmentId == null)
            .ToDictionary(r => r.CompetencyCategoryId, r => (int)r.CeilingLevel);
        var departmentRows = departmentId == null
            ? new Dictionary<Guid, int>()
            : rows.Where(r => r.DepartmentId == departmentId).ToDictionary(r => r.CompetencyCategoryId, r => (int)r.CeilingLevel);

        var unsaved = ids.Where(id => !organizationRows.ContainsKey(id)).ToList();
        var suggested = new Dictionary<Guid, int>();
        if (unsaved.Count > 0)
        {
            var requirements = await (
                    from set in _context.PositionRequirementSets.AsNoTracking()
                    join position in _context.JobPositions.AsNoTracking() on set.JobPositionId equals position.Id
                    join item in _context.PositionRequirementItems.AsNoTracking() on set.Id equals item.RequirementSetId
                    join competency in _context.Competencies.AsNoTracking() on item.CompetencyId equals competency.Id
                    where position.OrganizationId == organizationId
                          && set.Status == Statuses.PositionRequirementSet.Active
                          && unsaved.Contains(competency.CategoryId)
                    select new { competency.CategoryId, item.RequiredLevel })
                .ToListAsync();
            suggested = requirements
                .GroupBy(r => r.CategoryId)
                .ToDictionary(g => g.Key, g => Clamp(g.Max(r => (int)r.RequiredLevel)));
        }

        return ids.ToDictionary(id => id, id =>
        {
            var organization = organizationRows.TryGetValue(id, out var saved) ? saved : Math.Max(1, suggested.GetValueOrDefault(id));
            return departmentRows.TryGetValue(id, out var custom) ? Math.Min(custom, organization) : organization;
        });
    }

    private static int Clamp(int level) => Math.Clamp(level, 0, CapabilityCeiling.MaxLevel);
}
