using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.Organization.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Organization.Services;

public class OrganizationService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;

    public OrganizationService(IApplicationDbContext context, ICurrentUserService currentUser, AuditLogService auditLog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
    }

    // ═══════════════════════════════════
    // Departments
    // ═══════════════════════════════════

    public async Task<PagedList<DepartmentResponse>> SearchDepartmentsAsync(PaginationRequest request)
    {
        var query = _context.Departments.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(d => d.Name.ToLower().Contains(kw) || d.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(d => d.Name)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(d => new DepartmentResponse
            {
                Id = d.Id, Code = d.Code, Name = d.Name,
                Description = d.Description, ParentDepartmentId = d.ParentDepartmentId,
                ManagerEmployeeId = d.ManagerEmployeeId, Status = d.Status,
                EmployeeCount = d.Employees.Count, CreatedAt = d.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<DepartmentResponse> { Items = items, PageIndex = request.PageIndex, PageSize = request.PageSize, TotalItems = totalItems };
    }

    public async Task<DepartmentResponse> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        if (await _context.Departments.AnyAsync(d => d.Code == request.Code.ToUpper()))
            throw new InvalidOperationException("Department code already exists.");

        var entity = new Domain.Entities.Organization.Department
        {
            OrganizationId = (await _context.Organizations.FirstAsync()).Id,
            Code = request.Code.ToUpper(), Name = request.Name,
            Description = request.Description, ParentDepartmentId = request.ParentDepartmentId,
            Status = "ACTIVE",
        };
        _context.Departments.Add(entity);
        await _context.SaveChangesAsync(default);

        return new DepartmentResponse { Id = entity.Id, Code = entity.Code, Name = entity.Name,
            Description = entity.Description, ParentDepartmentId = entity.ParentDepartmentId,
            Status = entity.Status, CreatedAt = entity.CreatedAt };
    }

    public async Task<DepartmentResponse> UpdateDepartmentAsync(Guid departmentId, UpdateDepartmentRequest request)
    {
        var dept = await _context.Departments.Include(d => d.Employees).FirstOrDefaultAsync(d => d.Id == departmentId)
            ?? throw new KeyNotFoundException("Department not found.");
        if (request.Name != null) dept.Name = request.Name;
        if (request.Description != null) dept.Description = request.Description;
        await _context.SaveChangesAsync(default);

        return new DepartmentResponse { Id = dept.Id, Code = dept.Code, Name = dept.Name,
            Description = dept.Description, ParentDepartmentId = dept.ParentDepartmentId,
            ManagerEmployeeId = dept.ManagerEmployeeId, Status = dept.Status,
            EmployeeCount = dept.Employees.Count, CreatedAt = dept.CreatedAt };
    }

    public async Task ChangeDepartmentStatusAsync(Guid departmentId, StatusChangeRequest request)
    {
        var dept = await _context.Departments.FindAsync(departmentId)
            ?? throw new KeyNotFoundException("Department not found.");
        dept.Status = request.Status;
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════
    // Job Positions
    // ═══════════════════════════════════

    public async Task<PagedList<JobPositionResponse>> SearchJobPositionsAsync(PaginationRequest request)
    {
        var query = _context.JobPositions.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(j => j.Title.ToLower().Contains(kw) || j.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(j => j.Title)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(j => new JobPositionResponse
            {
                Id = j.Id, Code = j.Code, Title = j.Title,
                Description = j.Description, LevelName = j.LevelName, Status = j.Status,
                CompetencyRequirementCount = j.CompetencyRequirements.Count, CreatedAt = j.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<JobPositionResponse> { Items = items, PageIndex = request.PageIndex, PageSize = request.PageSize, TotalItems = totalItems };
    }

    public async Task<JobPositionResponse> CreateJobPositionAsync(CreateJobPositionRequest request)
    {
        if (await _context.JobPositions.AnyAsync(j => j.Code == request.Code.ToUpper()))
            throw new InvalidOperationException("Job position code already exists.");

        var entity = new Domain.Entities.Organization.JobPosition
        {
            OrganizationId = (await _context.Organizations.FirstAsync()).Id,
            Code = request.Code.ToUpper(), Title = request.Title,
            Description = request.Description, LevelName = request.LevelName,
            DepartmentId = request.DepartmentId, Status = "ACTIVE",
        };
        _context.JobPositions.Add(entity);
        await _context.SaveChangesAsync(default);

        return new JobPositionResponse { Id = entity.Id, Code = entity.Code, Title = entity.Title,
            Description = entity.Description, LevelName = entity.LevelName, Status = entity.Status, CreatedAt = entity.CreatedAt };
    }

    public async Task<JobPositionResponse> UpdateJobPositionAsync(Guid positionId, UpdateJobPositionRequest request)
    {
        var pos = await _context.JobPositions.Include(j => j.CompetencyRequirements).FirstOrDefaultAsync(j => j.Id == positionId)
            ?? throw new KeyNotFoundException("Job position not found.");
        if (request.Title != null) pos.Title = request.Title;
        if (request.Description != null) pos.Description = request.Description;
        if (request.LevelName != null) pos.LevelName = request.LevelName;
        await _context.SaveChangesAsync(default);

        return new JobPositionResponse { Id = pos.Id, Code = pos.Code, Title = pos.Title,
            Description = pos.Description, LevelName = pos.LevelName, Status = pos.Status,
            CompetencyRequirementCount = pos.CompetencyRequirements.Count, CreatedAt = pos.CreatedAt };
    }

    // ═══════════════════════════════════
    // Employees
    // ═══════════════════════════════════

    public async Task<PagedList<EmployeeSummaryResponse>> SearchEmployeesAsync(PaginationRequest request)
    {
        var query = _context.Employees.Include(e => e.Department).Include(e => e.JobPosition).AsQueryable();

        // Data scope filter per RBAC matrix (Section 6.3)
        if (_currentUser.Roles.Any(r => r is "DEPARTMENT_MANAGER" or "EMPLOYEE"))
        {
            if (_currentUser.ManagedDepartmentIds.Count != 0)
                query = query.Where(e => _currentUser.ManagedDepartmentIds.Contains(e.DepartmentId));
            else if (_currentUser.EmployeeId.HasValue)
                query = query.Where(e => e.Id == _currentUser.EmployeeId.Value);
        }
        else if (_currentUser.Roles.Any(r => r == "TRAINER"))
        {
            // Trainer: see assigned learners only — show all employees for now
            // Future enhancement: filter by course assignment
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(e => e.FullName.ToLower().Contains(kw) || e.Email.Contains(kw) || e.EmployeeCode.ToLower().Contains(kw));
        }
        var totalItems = await query.CountAsync();
        var items = await query
            .OrderBy(e => e.FullName)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EmployeeSummaryResponse
            {
                Id = e.Id, EmployeeCode = e.EmployeeCode, FullName = e.FullName, Email = e.Email,
                DepartmentName = e.Department.Name, PositionTitle = e.JobPosition.Title,
                EmploymentStatus = e.EmploymentStatus, JoinedAt = e.JoinedAt,
            })
            .ToListAsync();

        return new PagedList<EmployeeSummaryResponse> { Items = items, PageIndex = request.PageIndex, PageSize = request.PageSize, TotalItems = totalItems };
    }

    public async Task<EmployeeDetailResponse> GetEmployeeAsync(Guid employeeId)
    {
        var emp = await _context.Employees
            .Include(e => e.Department).Include(e => e.JobPosition).Include(e => e.DirectManager)
            .FirstOrDefaultAsync(e => e.Id == employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");

        // Data scope check per RBAC
        var isGlobal = _currentUser.Roles.Any(r => r is "SYSTEM_ADMIN" or "HR_MANAGER");
        var isManagerOfDept = _currentUser.ManagedDepartmentIds.Contains(emp.DepartmentId);
        var isOwnProfile = _currentUser.EmployeeId == emp.Id;

        if (!isGlobal && !isManagerOfDept && !isOwnProfile)
            throw new UnauthorizedAccessException("You do not have access to this employee profile.");

        return new EmployeeDetailResponse
        {
            Id = emp.Id, EmployeeCode = emp.EmployeeCode, FullName = emp.FullName, Email = emp.Email,
            Phone = emp.Phone, UserId = emp.UserId, DepartmentId = emp.DepartmentId,
            DepartmentName = emp.Department.Name, JobPositionId = emp.JobPositionId,
            PositionTitle = emp.JobPosition.Title, DirectManagerId = emp.DirectManagerId,
            ManagerName = emp.DirectManager?.FullName, EmploymentStatus = emp.EmploymentStatus,
            JoinedAt = emp.JoinedAt, CreatedAt = emp.CreatedAt, UpdatedAt = emp.UpdatedAt,
        };
    }

    public async Task<EmployeeDetailResponse> CreateEmployeeAsync(CreateEmployeeRequest request)
    {
        if (await _context.Employees.AnyAsync(e => e.EmployeeCode == request.EmployeeCode.ToUpper()))
            throw new InvalidOperationException("Employee code already exists.");

        var entity = new Domain.Entities.Organization.Employee
        {
            OrganizationId = (await _context.Organizations.FirstAsync()).Id,
            EmployeeCode = request.EmployeeCode.ToUpper(), FullName = request.FullName,
            Email = request.Email.ToLowerInvariant().Trim(), Phone = request.Phone,
            DepartmentId = request.DepartmentId, JobPositionId = request.JobPositionId,
            DirectManagerId = request.DirectManagerId, JoinedAt = request.JoinedAt,
            EmploymentStatus = "ACTIVE",
        };
        _context.Employees.Add(entity);
        await _context.SaveChangesAsync(default);
        return await GetEmployeeAsync(entity.Id);
    }

    public async Task<EmployeeDetailResponse> UpdateEmployeeAsync(Guid employeeId, UpdateEmployeeRequest request)
    {
        var emp = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");
        if (request.FullName != null) emp.FullName = request.FullName;
        if (request.Phone != null) emp.Phone = request.Phone;
        if (request.EmploymentStatus != null) emp.EmploymentStatus = request.EmploymentStatus.ToUpper();
        await _context.SaveChangesAsync(default);
        return await GetEmployeeAsync(employeeId);
    }

    public async Task TransferEmployeeAsync(Guid employeeId, EmployeeAssignmentRequest request)
    {
        var emp = await _context.Employees.FindAsync(employeeId)
            ?? throw new KeyNotFoundException("Employee not found.");
        var oldDept = emp.DepartmentId;
        if (request.DepartmentId.HasValue) emp.DepartmentId = request.DepartmentId.Value;
        if (request.JobPositionId.HasValue) emp.JobPositionId = request.JobPositionId.Value;
        if (request.DirectManagerId.HasValue) emp.DirectManagerId = request.DirectManagerId;
        await _context.SaveChangesAsync(default);

        // Audit: log employee transfer
        await _auditLog.LogAsync(
            action: "EMPLOYEE_TRANSFERRED",
            entityType: "Employee",
            entityId: employeeId,
            newValuesJson: $"DepartmentId={request.DepartmentId}, PositionId={request.JobPositionId}");
    }
}
