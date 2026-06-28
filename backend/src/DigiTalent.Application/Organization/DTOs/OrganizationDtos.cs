namespace DigiTalent.Application.Organization.DTOs;

public class CreateDepartmentRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentDepartmentId { get; set; }
}

public class UpdateDepartmentRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}

public class DepartmentResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int EmployeeCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateJobPositionRequest
{
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LevelName { get; set; }
    public Guid? DepartmentId { get; set; }
}

public class UpdateJobPositionRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? LevelName { get; set; }
}

public class JobPositionResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LevelName { get; set; }
    public string Status { get; set; } = string.Empty;
    public int CompetencyRequirementCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class CreateEmployeeRequest
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid JobPositionId { get; set; }
    public Guid? DirectManagerId { get; set; }
    public DateOnly? JoinedAt { get; set; }
}

public class UpdateEmployeeRequest
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? EmploymentStatus { get; set; }
}

public class EmployeeAssignmentRequest
{
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
    public Guid? DirectManagerId { get; set; }
}

public class EmployeeSummaryResponse
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionTitle { get; set; }
    public string EmploymentStatus { get; set; } = string.Empty;
    public DateOnly? JoinedAt { get; set; }
}

public class EmployeeDetailResponse : EmployeeSummaryResponse
{
    public Guid? UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid JobPositionId { get; set; }
    public Guid? DirectManagerId { get; set; }
    public string? ManagerName { get; set; }
    public string? Phone { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class StatusChangeRequest
{
    public string Status { get; set; } = string.Empty;
}
