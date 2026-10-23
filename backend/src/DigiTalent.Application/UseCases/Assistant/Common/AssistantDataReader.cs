using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assistant;

/// <summary>
/// Dữ liệu chatbot được đọc: chỉ các loại bản ghi trong danh sách trắng, luôn trong tổ chức của người hỏi,
/// dữ liệu cấp nhân viên đi qua <see cref="EmployeeScope"/> (OWNER: cả tổ chức, MANAGER: phòng ban mình,
/// EMPLOYEE: bản thân) và mỗi loại bản ghi đòi đúng quyền đọc của màn hình tương ứng. Không trả mật khẩu,
/// token, số điện thoại hay dữ liệu thanh toán; không có thao tác ghi.
/// </summary>
public sealed class AssistantDataReader
{
    public const int MaxLimit = 50;

    /// <summary>Loại bản ghi → quyền đọc cần có.</summary>
    public static readonly IReadOnlyDictionary<string, string> EntityPermissions = new Dictionary<string, string>
    {
        ["employees"] = Permissions.Employee.Read,
        ["departments"] = Permissions.Department.Read,
        ["job_positions"] = Permissions.JobPosition.Read,
        ["courses"] = Permissions.Learning.ReadCatalog,
        ["enrollments"] = Permissions.Learning.ReadProgress,
        ["certificates"] = Permissions.Certificate.Read,
        ["tasks"] = Permissions.Task.Read,
        ["competencies"] = Permissions.Competency.Read,
        ["competency_profiles"] = Permissions.Competency.ProfileRead,
    };

    /// <summary>Chỉ số thống kê → quyền đọc cần có.</summary>
    public static readonly IReadOnlyDictionary<string, string> MetricPermissions = new Dictionary<string, string>
    {
        ["headcount_by_department"] = Permissions.Employee.Read,
        ["learning_progress"] = Permissions.Learning.ReadProgress,
        ["course_completion"] = Permissions.Learning.ReadProgress,
        ["certificate_status"] = Permissions.Certificate.Read,
        ["task_status"] = Permissions.Task.Read,
        ["competency_levels"] = Permissions.Competency.ProfileRead,
    };

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly IPermissionService _permissionService;
    private readonly TimeProvider _timeProvider;

    public AssistantDataReader(
        IApplicationDbContext context,
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        IPermissionService permissionService,
        TimeProvider timeProvider)
    {
        _context = context;
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _permissionService = permissionService;
        _timeProvider = timeProvider;
    }

    // ───────────────────────── get_current_user ─────────────────────────

    public async Task<object> GetCurrentUserAsync()
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new ForbiddenException("No authenticated user.");

        var user = await _context.Users.AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new { u.DisplayName, u.Email })
            .FirstOrDefaultAsync();
        var organization = await _context.Organizations.AsNoTracking()
            .Where(o => o.Id == organizationId)
            .Select(o => new { o.Name, o.Code })
            .FirstOrDefaultAsync();

        object? employee = null;
        if (_currentUser.EmployeeId is { } employeeId)
        {
            employee = await (
                from e in _context.Employees.AsNoTracking()
                where e.Id == employeeId && e.OrganizationId == organizationId
                join d in _context.Departments on e.DepartmentId equals d.Id
                join p in _context.JobPositions on e.JobPositionId equals p.Id into positions
                from p in positions.DefaultIfEmpty()
                select new
                {
                    id = e.Id,
                    employeeCode = e.EmployeeCode,
                    fullName = e.FullName,
                    departmentId = d.Id,
                    department = d.Name,
                    jobPosition = p != null ? p.Name : null,
                    status = e.Status,
                }).FirstOrDefaultAsync();
        }

        var readable = new List<string>();
        foreach (var (entity, permission) in EntityPermissions)
        {
            if (await HasPermissionAsync(permission)) readable.Add(entity);
        }

        var metrics = new List<string>();
        foreach (var (metric, permission) in MetricPermissions)
        {
            if (await HasPermissionAsync(permission)) metrics.Add(metric);
        }

        return new
        {
            displayName = user?.DisplayName,
            email = user?.Email,
            roles = _currentUser.Roles,
            organization = organization?.Name,
            employee,
            employeeScope = DescribeScope(),
            readableEntities = readable,
            availableMetrics = metrics,
            asOf = Now(),
        };
    }

    // ───────────────────────── search_database ─────────────────────────

    public async Task<object> SearchAsync(string entity, string? query, AssistantFilters filters, int limit)
    {
        await RequireEntityAsync(entity);
        limit = Math.Clamp(limit, 1, MaxLimit);
        var search = string.IsNullOrWhiteSpace(query) ? null : query.Trim().ToLower();

        var (total, items) = entity switch
        {
            "employees" => await SearchEmployeesAsync(search, filters, limit),
            "departments" => await SearchDepartmentsAsync(search, filters, limit),
            "job_positions" => await SearchJobPositionsAsync(search, filters, limit),
            "courses" => await SearchCoursesAsync(search, filters, limit),
            "enrollments" => await SearchEnrollmentsAsync(search, filters, limit),
            "certificates" => await SearchCertificatesAsync(search, filters, limit),
            "tasks" => await SearchTasksAsync(search, filters, limit),
            "competencies" => await SearchCompetenciesAsync(search, filters, limit),
            "competency_profiles" => await SearchCompetencyProfilesAsync(search, filters, limit),
            _ => throw UnknownEntity(entity),
        };

        return new
        {
            entity,
            totalMatches = total,
            returned = items.Count,
            truncated = total > items.Count,
            items,
            scope = DescribeScope(),
            asOf = Now(),
        };
    }

    private async Task<(int, IReadOnlyList<object>)> SearchEmployeesAsync(string? search, AssistantFilters f, int limit)
    {
        var query = _employeeScope.VisibleEmployees().AsNoTracking();
        if (search != null)
            query = query.Where(e => e.FullName.ToLower().Contains(search) || e.EmployeeCode.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(e => e.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(e => e.DepartmentId == departmentId);
        if (f.EmployeeId is { } employeeId) query = query.Where(e => e.Id == employeeId);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(e => e.FullName).Take(limit)
            .Select(e => new { e.Id, e.EmployeeCode, e.FullName, e.DepartmentId, e.JobPositionId, e.Status, e.JoinedAt })
            .ToListAsync();

        var departments = await DepartmentNamesAsync(rows.Select(r => r.DepartmentId));
        var positions = await PositionNamesAsync(rows.Where(r => r.JobPositionId.HasValue).Select(r => r.JobPositionId!.Value));

        return (total, rows.Select(r => (object)new
        {
            id = r.Id,
            employeeCode = r.EmployeeCode,
            fullName = r.FullName,
            department = departments.GetValueOrDefault(r.DepartmentId),
            jobPosition = r.JobPositionId is { } p ? positions.GetValueOrDefault(p) : null,
            status = r.Status,
            joinedAt = r.JoinedAt,
        }).ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchDepartmentsAsync(string? search, AssistantFilters f, int limit)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _context.Departments.AsNoTracking().Where(d => d.OrganizationId == organizationId);
        if (search != null)
            query = query.Where(d => d.Name.ToLower().Contains(search) || d.Code.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(d => d.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(d => d.Id == departmentId);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(d => d.Name).Take(limit)
            .Select(d => new
            {
                id = d.Id,
                code = d.Code,
                name = d.Name,
                status = d.Status,
                activeEmployees = _context.Employees.Count(e =>
                    e.DepartmentId == d.Id && e.Status == Domain.Constants.Statuses.Employee.Active),
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchJobPositionsAsync(string? search, AssistantFilters f, int limit)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _context.JobPositions.AsNoTracking().Where(p => p.OrganizationId == organizationId);
        if (search != null)
            query = query.Where(p => p.Name.ToLower().Contains(search) || p.Code.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(p => p.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(p => p.DepartmentId == departmentId);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(p => p.Name).Take(limit)
            .Select(p => new { id = p.Id, code = p.Code, name = p.Name, jobGrade = p.JobGrade, status = p.Status })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchCoursesAsync(string? search, AssistantFilters f, int limit)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query = _context.Courses.AsNoTracking().Where(c => c.OrganizationId == organizationId);
        if (search != null)
            query = query.Where(c => c.Title.ToLower().Contains(search) || c.Code.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(c => c.Status == f.Status);
        if (f.CourseId is { } courseId) query = query.Where(c => c.Id == courseId);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(c => c.Code).ThenByDescending(c => c.VersionNo).Take(limit)
            .Select(c => new
            {
                id = c.Id,
                code = c.Code,
                versionNo = c.VersionNo,
                title = c.Title,
                entryLevel = c.EntryLevel,
                estimatedDurationMinutes = c.EstimatedDurationMinutes,
                certificateEnabled = c.CertificateEnabled,
                status = c.Status,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchEnrollmentsAsync(string? search, AssistantFilters f, int limit)
    {
        var query =
            from en in VisibleEnrollments()
            join e in _context.Employees on en.EmployeeId equals e.Id
            join c in _context.Courses on en.CourseId equals c.Id
            select new { en, e, c };
        if (search != null)
            query = query.Where(x => x.e.FullName.ToLower().Contains(search) || x.c.Title.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(x => x.en.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(x => x.e.DepartmentId == departmentId);
        if (f.EmployeeId is { } employeeId) query = query.Where(x => x.e.Id == employeeId);
        if (f.CourseId is { } courseId) query = query.Where(x => x.c.Id == courseId);
        if (f.RecordId is { } recordId) query = query.Where(x => x.en.Id == recordId);

        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.en.UpdatedAt).Take(limit)
            .Select(x => new
            {
                id = x.en.Id,
                employeeId = x.e.Id,
                employee = x.e.FullName,
                courseId = x.c.Id,
                course = x.c.Title,
                status = x.en.Status,
                progressPercent = x.en.ProgressPercent,
                startedAt = x.en.StartedAt,
                completedAt = x.en.CompletedAt,
                dueDate = x.en.DueDate,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchCertificatesAsync(string? search, AssistantFilters f, int limit)
    {
        var query =
            from cert in VisibleCertificates()
            join e in _context.Employees on cert.EmployeeId equals e.Id
            select new { cert, e };
        if (search != null)
            query = query.Where(x => x.cert.HolderNameSnapshot.ToLower().Contains(search)
                || x.cert.CourseTitleSnapshot.ToLower().Contains(search)
                || x.cert.CertificateCode.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(x => x.cert.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(x => x.e.DepartmentId == departmentId);
        if (f.EmployeeId is { } employeeId) query = query.Where(x => x.e.Id == employeeId);
        if (f.RecordId is { } recordId) query = query.Where(x => x.cert.Id == recordId);

        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.cert.IssuedAt).Take(limit)
            .Select(x => new
            {
                id = x.cert.Id,
                certificateCode = x.cert.CertificateCode,
                employeeId = x.e.Id,
                holder = x.cert.HolderNameSnapshot,
                course = x.cert.CourseTitleSnapshot,
                competency = x.cert.PrimaryCompetencySnapshot,
                status = x.cert.Status,
                issuedAt = x.cert.IssuedAt,
                expiresAt = x.cert.ExpiresAt,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchTasksAsync(string? search, AssistantFilters f, int limit)
    {
        var query =
            from t in VisibleTasks()
            join e in _context.Employees on t.EmployeeId equals e.Id
            select new { t, e };
        if (search != null)
            query = query.Where(x => x.t.TitleSnapshot.ToLower().Contains(search) || x.e.FullName.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(x => x.t.Status == f.Status);
        if (f.DepartmentId is { } departmentId) query = query.Where(x => x.e.DepartmentId == departmentId);
        if (f.EmployeeId is { } employeeId) query = query.Where(x => x.e.Id == employeeId);
        if (f.CourseId is { } courseId) query = query.Where(x => x.t.PromptingCourseId == courseId);

        var total = await query.CountAsync();
        var rows = await query.OrderByDescending(x => x.t.AssignedAt).Take(limit)
            .Select(x => new
            {
                id = x.t.Id,
                title = x.t.TitleSnapshot,
                employeeId = x.e.Id,
                employee = x.e.FullName,
                status = x.t.Status,
                assignedAt = x.t.AssignedAt,
                dueAt = x.t.DueAt,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchCompetenciesAsync(string? search, AssistantFilters f, int limit)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var query =
            from c in _context.Competencies.AsNoTracking()
            join cat in _context.CompetencyCategories on c.CategoryId equals cat.Id
            where cat.OrganizationId == organizationId
            select new { c, cat };
        if (search != null)
            query = query.Where(x => x.c.Name.ToLower().Contains(search) || x.c.Code.ToLower().Contains(search));
        if (f.Status != null) query = query.Where(x => x.c.Status == f.Status);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(x => x.c.Code).Take(limit)
            .Select(x => new
            {
                id = x.c.Id,
                code = x.c.Code,
                name = x.c.Name,
                category = x.cat.Name,
                competencyType = x.c.CompetencyType,
                status = x.c.Status,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    private async Task<(int, IReadOnlyList<object>)> SearchCompetencyProfilesAsync(string? search, AssistantFilters f, int limit)
    {
        var visibleIds = _employeeScope.VisibleEmployees().Select(e => e.Id);
        var query =
            from p in _context.EmployeeCompetencyProfiles.AsNoTracking()
            where visibleIds.Contains(p.EmployeeId)
            join e in _context.Employees on p.EmployeeId equals e.Id
            join c in _context.Competencies on p.CompetencyId equals c.Id
            select new { p, e, c };
        if (search != null)
            query = query.Where(x => x.e.FullName.ToLower().Contains(search)
                || x.c.Name.ToLower().Contains(search)
                || x.c.Code.ToLower().Contains(search));
        if (f.DepartmentId is { } departmentId) query = query.Where(x => x.e.DepartmentId == departmentId);
        if (f.EmployeeId is { } employeeId) query = query.Where(x => x.e.Id == employeeId);

        var total = await query.CountAsync();
        var rows = await query.OrderBy(x => x.e.FullName).ThenBy(x => x.c.Code).Take(limit)
            .Select(x => new
            {
                employeeId = x.e.Id,
                employee = x.e.FullName,
                competencyCode = x.c.Code,
                competency = x.c.Name,
                confirmedLevel = x.p.ConfirmedLevel,
                confirmedAt = x.p.ConfirmedAt,
            })
            .ToListAsync();
        return (total, rows.Cast<object>().ToList());
    }

    // ───────────────────────── get_record ─────────────────────────

    public async Task<object> GetRecordAsync(string entity, Guid id)
    {
        await RequireEntityAsync(entity);

        object? record = entity switch
        {
            "employees" => await GetEmployeeAsync(id),
            "competency_profiles" => await GetEmployeeCompetenciesAsync(id),
            "courses" => await GetCourseAsync(id),
            _ => await SingleFromSearchAsync(entity, id),
        };

        return record == null
            ? throw new NotFoundException($"{entity} '{id}' not found.")
            : new { entity, record, scope = DescribeScope(), asOf = Now() };
    }

    private async Task<object?> SingleFromSearchAsync(string entity, Guid id)
    {
        // Bản ghi đơn giản: tìm theo id trong đúng truy vấn đã giới hạn phạm vi.
        IReadOnlyList<object> items = entity switch
        {
            "departments" => (await SearchDepartmentsAsync(null, new AssistantFilters(DepartmentId: id), 1)).Item2,
            "job_positions" => await GetJobPositionAsync(id),
            "enrollments" => (await SearchEnrollmentsAsync(null, new AssistantFilters(RecordId: id), 1)).Item2,
            "certificates" => (await SearchCertificatesAsync(null, new AssistantFilters(RecordId: id), 1)).Item2,
            "tasks" => await GetTaskAsync(id),
            "competencies" => await GetCompetencyAsync(id),
            _ => throw UnknownEntity(entity),
        };
        return items.FirstOrDefault();
    }

    private async Task<IReadOnlyList<object>> GetJobPositionAsync(Guid id)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        return await _context.JobPositions.AsNoTracking()
            .Where(p => p.Id == id && p.OrganizationId == organizationId)
            .Select(p => (object)new
            {
                id = p.Id,
                code = p.Code,
                name = p.Name,
                description = p.Description,
                jobGrade = p.JobGrade,
                status = p.Status,
                activeEmployees = _context.Employees.Count(e =>
                    e.JobPositionId == p.Id && e.Status == Domain.Constants.Statuses.Employee.Active),
            })
            .ToListAsync();
    }

    private async Task<object?> GetEmployeeAsync(Guid id)
    {
        var employee = await _employeeScope.VisibleEmployees().AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new { e.Id, e.EmployeeCode, e.FullName, e.DepartmentId, e.JobPositionId, e.DirectManagerId, e.Status, e.JoinedAt })
            .FirstOrDefaultAsync();
        if (employee == null) return null;

        var department = (await DepartmentNamesAsync(new[] { employee.DepartmentId })).GetValueOrDefault(employee.DepartmentId);
        var position = employee.JobPositionId is { } positionId
            ? (await PositionNamesAsync(new[] { positionId })).GetValueOrDefault(positionId)
            : null;
        var manager = employee.DirectManagerId is { } managerId
            ? await _context.Employees.Where(e => e.Id == managerId).Select(e => e.FullName).FirstOrDefaultAsync()
            : null;

        // Tóm tắt các mảng liên quan — chỉ khi người hỏi có quyền đọc mảng đó.
        object? learning = null;
        if (await HasPermissionAsync(Permissions.Learning.ReadProgress))
        {
            var statuses = await VisibleEnrollments().Where(en => en.EmployeeId == id)
                .GroupBy(en => en.Status)
                .Select(g => new { status = g.Key, count = g.Count(), averageProgress = g.Average(en => en.ProgressPercent) })
                .ToListAsync();
            learning = new { enrollmentsByStatus = statuses };
        }

        object? certificates = null;
        if (await HasPermissionAsync(Permissions.Certificate.Read))
        {
            certificates = await VisibleCertificates().Where(c => c.EmployeeId == id)
                .GroupBy(c => c.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync();
        }

        object? tasks = null;
        if (await HasPermissionAsync(Permissions.Task.Read))
        {
            tasks = await VisibleTasks().Where(t => t.EmployeeId == id)
                .GroupBy(t => t.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync();
        }

        return new
        {
            id = employee.Id,
            employeeCode = employee.EmployeeCode,
            fullName = employee.FullName,
            department,
            jobPosition = position,
            directManager = manager,
            status = employee.Status,
            joinedAt = employee.JoinedAt,
            learning,
            certificatesByStatus = certificates,
            tasksByStatus = tasks,
        };
    }

    private async Task<object?> GetEmployeeCompetenciesAsync(Guid employeeId)
    {
        // competency_profiles theo id = id nhân viên: toàn bộ mức năng lực đã xác nhận của người đó.
        var employee = await _employeeScope.VisibleEmployees().AsNoTracking()
            .Where(e => e.Id == employeeId)
            .Select(e => new { e.Id, e.FullName })
            .FirstOrDefaultAsync();
        if (employee == null) return null;

        var levels = await (
            from p in _context.EmployeeCompetencyProfiles.AsNoTracking()
            where p.EmployeeId == employeeId
            join c in _context.Competencies on p.CompetencyId equals c.Id
            orderby c.Code
            select new { competencyCode = c.Code, competency = c.Name, confirmedLevel = p.ConfirmedLevel, confirmedAt = p.ConfirmedAt })
            .ToListAsync();

        return new { employeeId = employee.Id, employee = employee.FullName, competencies = levels };
    }

    private async Task<object?> GetCourseAsync(Guid id)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == id && c.OrganizationId == organizationId)
            .Select(c => new
            {
                id = c.Id,
                code = c.Code,
                versionNo = c.VersionNo,
                title = c.Title,
                description = c.Description,
                purpose = c.Purpose,
                entryLevel = c.EntryLevel,
                estimatedDurationMinutes = c.EstimatedDurationMinutes,
                certificateEnabled = c.CertificateEnabled,
                certificateValidityDays = c.CertificateValidityDays,
                status = c.Status,
                modules = _context.CourseModules.Count(m => m.CourseId == c.Id),
            })
            .FirstOrDefaultAsync();
        if (course == null) return null;

        object? enrollments = null;
        if (await HasPermissionAsync(Permissions.Learning.ReadProgress))
        {
            enrollments = await VisibleEnrollments().Where(en => en.CourseId == id)
                .GroupBy(en => en.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync();
        }

        return new { course, enrollmentsInScopeByStatus = enrollments };
    }

    private async Task<IReadOnlyList<object>> GetTaskAsync(Guid id)
    {
        return await (
            from t in VisibleTasks()
            where t.Id == id
            join e in _context.Employees on t.EmployeeId equals e.Id
            join c in _context.Courses on t.PromptingCourseId equals c.Id into courses
            from c in courses.DefaultIfEmpty()
            select (object)new
            {
                id = t.Id,
                title = t.TitleSnapshot,
                description = t.DescriptionSnapshot,
                expectedOutput = t.ExpectedOutputSnapshot,
                employeeId = e.Id,
                employee = e.FullName,
                course = c != null ? c.Title : null,
                status = t.Status,
                assignedAt = t.AssignedAt,
                dueAt = t.DueAt,
            }).ToListAsync();
    }

    private async Task<IReadOnlyList<object>> GetCompetencyAsync(Guid id)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        return await (
            from c in _context.Competencies.AsNoTracking()
            where c.Id == id
            join cat in _context.CompetencyCategories on c.CategoryId equals cat.Id
            where cat.OrganizationId == organizationId
            select (object)new
            {
                id = c.Id,
                code = c.Code,
                name = c.Name,
                description = c.Description,
                category = cat.Name,
                competencyType = c.CompetencyType,
                status = c.Status,
            }).ToListAsync();
    }

    // ───────────────────────── get_analytics ─────────────────────────

    public async Task<object> GetAnalyticsAsync(string metric, AssistantFilters filters)
    {
        if (!MetricPermissions.TryGetValue(metric, out var permission))
        {
            throw new AssistantToolException("INVALID_INPUT",
                $"Unknown metric '{metric}'. Allowed: {string.Join(", ", MetricPermissions.Keys)}.");
        }

        await RequirePermissionAsync(permission);

        var employees = _employeeScope.VisibleEmployees();
        if (filters.DepartmentId is { } departmentId) employees = employees.Where(e => e.DepartmentId == departmentId);
        var employeeIds = employees.Select(e => e.Id);

        object rows = metric switch
        {
            "headcount_by_department" => await (
                from e in employees
                join d in _context.Departments on e.DepartmentId equals d.Id
                group e by new { d.Id, d.Name } into g
                orderby g.Key.Name
                select new
                {
                    departmentId = g.Key.Id,
                    department = g.Key.Name,
                    total = g.Count(),
                    active = g.Count(e => e.Status == Domain.Constants.Statuses.Employee.Active),
                }).ToListAsync(),

            "learning_progress" => await _context.Enrollments.AsNoTracking()
                .Where(en => employeeIds.Contains(en.EmployeeId))
                .Where(en => filters.CourseId == null || en.CourseId == filters.CourseId)
                .GroupBy(en => en.Status)
                .Select(g => new { status = g.Key, enrollments = g.Count(), averageProgressPercent = g.Average(en => en.ProgressPercent) })
                .ToListAsync(),

            "course_completion" => await (
                from en in _context.Enrollments.AsNoTracking()
                where employeeIds.Contains(en.EmployeeId)
                join c in _context.Courses on en.CourseId equals c.Id
                group en by new { c.Id, c.Code, c.Title } into g
                orderby g.Key.Code
                select new
                {
                    courseId = g.Key.Id,
                    code = g.Key.Code,
                    course = g.Key.Title,
                    enrolled = g.Count(),
                    completed = g.Count(en => en.Status == Domain.Constants.Statuses.Enrollment.Completed),
                    inProgress = g.Count(en => en.Status == Domain.Constants.Statuses.Enrollment.InProgress),
                }).ToListAsync(),

            "certificate_status" => await _context.Certificates.AsNoTracking()
                .Where(c => employeeIds.Contains(c.EmployeeId))
                .GroupBy(c => c.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync(),

            "task_status" => await _context.TaskAssignments.AsNoTracking()
                .Where(t => employeeIds.Contains(t.EmployeeId))
                .GroupBy(t => t.Status)
                .Select(g => new { status = g.Key, count = g.Count() })
                .ToListAsync(),

            "competency_levels" => await (
                from p in _context.EmployeeCompetencyProfiles.AsNoTracking()
                where employeeIds.Contains(p.EmployeeId)
                join c in _context.Competencies on p.CompetencyId equals c.Id
                group p by new { c.Code, c.Name } into g
                orderby g.Key.Code
                select new
                {
                    competencyCode = g.Key.Code,
                    competency = g.Key.Name,
                    employees = g.Count(),
                    averageLevel = g.Average(p => (double)p.ConfirmedLevel),
                    minLevel = g.Min(p => p.ConfirmedLevel),
                    maxLevel = g.Max(p => p.ConfirmedLevel),
                }).ToListAsync(),

            _ => throw new AssistantToolException("INVALID_INPUT", $"Unknown metric '{metric}'."),
        };

        return new
        {
            metric,
            filters = new { departmentId = filters.DepartmentId, courseId = filters.CourseId },
            employeesInScope = await employees.CountAsync(),
            rows,
            scope = DescribeScope(),
            asOf = Now(),
        };
    }

    // ───────────────────────── helpers ─────────────────────────

    private IQueryable<Enrollment> VisibleEnrollments()
    {
        var visibleIds = _employeeScope.VisibleEmployees().Select(e => e.Id);
        return _context.Enrollments.AsNoTracking().Where(en => visibleIds.Contains(en.EmployeeId));
    }

    private IQueryable<Certificate> VisibleCertificates()
    {
        var visibleIds = _employeeScope.VisibleEmployees().Select(e => e.Id);
        return _context.Certificates.AsNoTracking().Where(c => visibleIds.Contains(c.EmployeeId));
    }

    private IQueryable<TaskAssignment> VisibleTasks()
    {
        var visibleIds = _employeeScope.VisibleEmployees().Select(e => e.Id);
        return _context.TaskAssignments.AsNoTracking().Where(t => visibleIds.Contains(t.EmployeeId));
    }

    private async Task<Dictionary<Guid, string>> DepartmentNamesAsync(IEnumerable<Guid> ids)
    {
        var list = ids.Distinct().ToList();
        return await _context.Departments.AsNoTracking()
            .Where(d => list.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Name);
    }

    private async Task<Dictionary<Guid, string>> PositionNamesAsync(IEnumerable<Guid> ids)
    {
        var list = ids.Distinct().ToList();
        return await _context.JobPositions.AsNoTracking()
            .Where(p => list.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name);
    }

    private async Task RequireEntityAsync(string entity)
    {
        if (!EntityPermissions.TryGetValue(entity, out var permission)) throw UnknownEntity(entity);
        await RequirePermissionAsync(permission);
    }

    private async Task RequirePermissionAsync(string permission)
    {
        if (!await HasPermissionAsync(permission))
        {
            throw new AssistantToolException("FORBIDDEN", "The current user is not allowed to read this data.");
        }
    }

    private Task<bool> HasPermissionAsync(string permission) =>
        _permissionService.HasAnyAsync(_currentUser.Roles, new[] { permission });

    private static AssistantToolException UnknownEntity(string entity) =>
        new("INVALID_INPUT", $"Unknown entity '{entity}'. Allowed: {string.Join(", ", EntityPermissions.Keys)}.");

    private string DescribeScope()
    {
        if (_currentUser.IsAdmin) return "ORGANIZATION (toàn tổ chức)";
        if (_currentUser.IsDepartmentManager && _currentUser.DepartmentId.HasValue) return "DEPARTMENT (phòng ban của người hỏi)";
        return "SELF (chỉ bản thân người hỏi)";
    }

    private DateTimeOffset Now() => _timeProvider.GetUtcNow();
}

/// <summary>Bộ lọc chung của search_database / get_analytics (mọi trường đều tùy chọn).</summary>
public sealed record AssistantFilters(
    string? Status = null,
    Guid? DepartmentId = null,
    Guid? EmployeeId = null,
    Guid? CourseId = null,
    Guid? RecordId = null);

/// <summary>Tool từ chối có kiểm soát: Code = FORBIDDEN | NOT_FOUND | INVALID_INPUT.</summary>
public sealed class AssistantToolException : Exception
{
    public AssistantToolException(string code, string message) : base(message) => Code = code;

    public string Code { get; }
}
