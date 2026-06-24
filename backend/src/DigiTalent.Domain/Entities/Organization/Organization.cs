using DigiTalent.Domain.Entities.Common;

namespace DigiTalent.Domain.Entities.Organization;

public class Organization : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Domain { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<Department> Departments { get; set; } = new List<Department>();
    public ICollection<JobPosition> JobPositions { get; set; } = new List<JobPosition>();
    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
}

public class Department : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    public Guid? ParentDepartmentId { get; set; }
    public Guid? ManagerEmployeeId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "ACTIVE";
}

public class JobPosition : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    public Guid? DepartmentId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LevelName { get; set; }
    public string Status { get; set; } = "ACTIVE";

    public ICollection<Competency.PositionCompetencyRequirement> CompetencyRequirements { get; set; } = new List<Competency.PositionCompetencyRequirement>();
}

public class Employee : AuditableEntity
{
    public Guid OrganizationId { get; set; }
    public Organization Organization { get; set; } = null!;
    public Guid? UserId { get; set; }
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    public Guid JobPositionId { get; set; }
    public JobPosition JobPosition { get; set; } = null!;
    public Guid? DirectManagerId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string EmploymentStatus { get; set; } = "ACTIVE";
    public DateOnly? JoinedAt { get; set; }
}
