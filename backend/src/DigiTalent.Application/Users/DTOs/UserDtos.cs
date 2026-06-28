namespace DigiTalent.Application.Users.DTOs;

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public List<string> Roles { get; set; } = new();
}

public class UpdateUserRequest
{
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Status { get; set; }
}

public class UserSummaryResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
}

public class UserDetailResponse : UserSummaryResponse
{
    public Guid? EmployeeId { get; set; }
    public List<string> Permissions { get; set; } = new();
    public int FailedLoginCount { get; set; }
    public DateTimeOffset? EmailVerifiedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}

public class AssignUserRolesRequest
{
    public List<string> RoleCodes { get; set; } = new();
}

public class LockUserRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class RoleResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ScopeType { get; set; } = string.Empty;
    public bool IsSystemRole { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

public class PermissionResponse
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? Description { get; set; }
}
