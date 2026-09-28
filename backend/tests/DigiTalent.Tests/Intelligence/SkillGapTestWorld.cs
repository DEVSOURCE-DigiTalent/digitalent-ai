using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace DigiTalent.Tests.Intelligence;

/// <summary>
/// Dữ liệu test Skill Gap: 1 tổ chức riêng (không đụng dữ liệu test khác), vị trí Data Analyst theo ví dụ §4.5 của spec,
/// phòng A (analyst đầy đủ + nhân viên chưa gán vị trí + nhân viên INACTIVE) và phòng B (1 analyst).
/// </summary>
internal sealed class SkillGapTestWorld
{
    public required AppDbContext Context { get; init; }
    public required Domain.Entities.Organization Organization { get; init; }
    public required Department DepartmentA { get; init; }
    public required Department DepartmentB { get; init; }
    public required JobPosition DataAnalyst { get; init; }
    public required JobPosition PositionWithoutActiveSet { get; init; }
    public required PositionRequirementSet ActiveSet { get; init; }
    public required Employee Analyst { get; init; }
    public required Employee Unassigned { get; init; }
    public required Employee Inactive { get; init; }
    public required Employee AnalystInDepartmentB { get; init; }
    public required Employee NoActiveSetEmployee { get; init; }
    public required Dictionary<string, Domain.Entities.Competency> Competencies { get; init; }

    public static async Task<SkillGapTestWorld> CreateAsync(AppDbContext context)
    {
        var suffix = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var organization = new Domain.Entities.Organization { Code = $"SG_{suffix}", Name = "Skill Gap Test Org", Status = Statuses.Simple.Active };
        var user = new User { OrganizationId = organization.Id, Email = $"sg_{suffix}@test.local", PasswordHash = "x", DisplayName = "HR" };
        var departmentA = new Department { OrganizationId = organization.Id, Code = $"A_{suffix}", Name = "Analytics" };
        var departmentB = new Department { OrganizationId = organization.Id, Code = $"B_{suffix}", Name = "Finance" };
        var dataAnalyst = new JobPosition { OrganizationId = organization.Id, Code = $"DA_{suffix}", Name = "Data Analyst" };
        var noSetPosition = new JobPosition { OrganizationId = organization.Id, Code = $"NS_{suffix}", Name = "Office Clerk" };
        var category = new CompetencyCategory { OrganizationId = organization.Id, Code = $"CAT_{suffix}", Name = "Digital core" };

        var definitions = new (string Code, int Required, decimal Weight, bool Mandatory)[]
        {
            ("DATA_LITERACY", 3, 30m, true),
            ("DIGITAL_COMMUNICATION", 2, 20m, false),
            ("INFORMATION_SECURITY", 2, 25m, true),
            ("AI_LITERACY", 2, 15m, false),
            ("PROBLEM_SOLVING", 1, 10m, false),
        };
        var competencies = definitions.ToDictionary(
            d => d.Code,
            d => new Domain.Entities.Competency { CategoryId = category.Id, Code = d.Code, Name = d.Code.Replace('_', ' '), Status = Statuses.Competency.Active });

        var activeSet = new PositionRequirementSet
        {
            JobPositionId = dataAnalyst.Id,
            VersionNo = 1,
            Status = Statuses.PositionRequirementSet.Active,
            CreatedByUserId = user.Id,
        };
        foreach (var d in definitions)
        {
            activeSet.Items.Add(new PositionRequirementItem
            {
                RequirementSetId = activeSet.Id,
                CompetencyId = competencies[d.Code].Id,
                RequiredLevel = d.Required,
                WeightPercent = d.Weight,
                IsMandatory = d.Mandatory,
            });
        }

        Employee NewEmployee(string code, Department department, JobPosition? position, string status = Statuses.Employee.Active) => new()
        {
            OrganizationId = organization.Id,
            DepartmentId = department.Id,
            JobPositionId = position?.Id,
            EmployeeCode = $"{code}_{suffix}",
            FullName = $"{code} {suffix}",
            Status = status,
        };

        var analyst = NewEmployee("ANALYST", departmentA, dataAnalyst);
        var unassigned = NewEmployee("NEWJOINER", departmentA, null);
        var inactive = NewEmployee("INACTIVE", departmentA, dataAnalyst, Statuses.Employee.Inactive);
        var noActiveSetEmployee = NewEmployee("CLERK", departmentB, noSetPosition);
        var analystB = NewEmployee("ANALYST_B", departmentB, dataAnalyst);

        context.Organizations.Add(organization);
        context.Users.Add(user);
        context.Departments.AddRange(departmentA, departmentB);
        context.JobPositions.AddRange(dataAnalyst, noSetPosition);
        context.CompetencyCategories.Add(category);
        context.Competencies.AddRange(competencies.Values);
        context.PositionRequirementSets.Add(activeSet);
        context.Employees.AddRange(analyst, unassigned, inactive, noActiveSetEmployee, analystB);

        // Hồ sơ năng lực của analyst theo §4.5 (INFORMATION_SECURITY chưa có)
        var confirmed = new (string Code, short Level)[] { ("DATA_LITERACY", 1), ("DIGITAL_COMMUNICATION", 2), ("AI_LITERACY", 1), ("PROBLEM_SOLVING", 3) };
        foreach (var (code, level) in confirmed)
        {
            context.EmployeeCompetencyProfiles.Add(new EmployeeCompetencyProfile
            {
                EmployeeId = analyst.Id,
                CompetencyId = competencies[code].Id,
                ConfirmedLevel = level,
                ConfirmedAt = DateTimeOffset.UtcNow,
                RowVersion = 1,
            });
        }

        await context.SaveChangesAsync();

        return new SkillGapTestWorld
        {
            Context = context,
            Organization = organization,
            DepartmentA = departmentA,
            DepartmentB = departmentB,
            DataAnalyst = dataAnalyst,
            PositionWithoutActiveSet = noSetPosition,
            ActiveSet = activeSet,
            Analyst = analyst,
            Unassigned = unassigned,
            Inactive = inactive,
            AnalystInDepartmentB = analystB,
            NoActiveSetEmployee = noActiveSetEmployee,
            Competencies = competencies,
        };
    }

    public ICurrentUser HrManager() => CurrentUser(isAdmin: true);

    public ICurrentUser ManagerOf(Department department) => CurrentUser(isDepartmentManager: true, departmentId: department.Id);

    public ICurrentUser EmployeeSelf(Employee employee) => CurrentUser(employeeId: employee.Id, departmentId: employee.DepartmentId);

    private ICurrentUser CurrentUser(bool isAdmin = false, bool isDepartmentManager = false, Guid? departmentId = null, Guid? employeeId = null)
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(c => c.GetRequiredOrganizationId()).Returns(Organization.Id);
        mock.Setup(c => c.OrganizationId).Returns(Organization.Id);
        mock.Setup(c => c.UserId).Returns(Guid.NewGuid());
        mock.Setup(c => c.IsAuthenticated).Returns(true);
        mock.Setup(c => c.IsAdmin).Returns(isAdmin);
        mock.Setup(c => c.IsDepartmentManager).Returns(isDepartmentManager);
        mock.Setup(c => c.DepartmentId).Returns(departmentId);
        mock.Setup(c => c.EmployeeId).Returns(employeeId);
        return mock.Object;
    }

    public EmployeeScope Scope(ICurrentUser user) => new(Context, user);

    public SkillGapRunService RunService() =>
        new(Context, new SkillGapSettingsProvider(Context, NullLogger<SkillGapSettingsProvider>.Instance));

    public SkillGapRunReader Reader() => new(Context, NullLogger<SkillGapRunReader>.Instance);
}
