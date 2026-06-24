using DigiTalent.Domain.Entities.Organization;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public static class SeedOrganizationData
{
    public static readonly Guid OrgDevsourceId = Guid.Parse("30000000-0000-0000-0000-000000000001");
    public static readonly Guid DeptITId = Guid.Parse("30000000-0000-0000-0000-000000000010");
    public static readonly Guid DeptHRId = Guid.Parse("30000000-0000-0000-0000-000000000011");
    public static readonly Guid DeptMarketingId = Guid.Parse("30000000-0000-0000-0000-000000000012");
    public static readonly Guid DeptFinanceId = Guid.Parse("30000000-0000-0000-0000-000000000013");
    public static readonly Guid DeptOperationsId = Guid.Parse("30000000-0000-0000-0000-000000000014");
    public static readonly Guid PosSEId = Guid.Parse("30000000-0000-0000-0000-000000000020");
    public static readonly Guid PosHRSId = Guid.Parse("30000000-0000-0000-0000-000000000021");
    public static readonly Guid PosMktExId = Guid.Parse("30000000-0000-0000-0000-000000000022");
    public static readonly Guid PosFAId = Guid.Parse("30000000-0000-0000-0000-000000000023");
    public static readonly Guid PosOpsExId = Guid.Parse("30000000-0000-0000-0000-000000000024");
    public static readonly Guid PosTeamLeadId = Guid.Parse("30000000-0000-0000-0000-000000000025");

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Organizations.AnyAsync()) return;

        var org = new Organization
        {
            Id = OrgDevsourceId,
            Code = "DEVSOURCE",
            Name = "DEVSOURCE Corporation",
            Domain = "devsource.com",
            Status = "ACTIVE"
        };
        context.Organizations.Add(org);

        var departments = new List<Department>
        {
            new() { Id = DeptITId, OrganizationId = OrgDevsourceId, Code = "IT", Name = "Information Technology", Status = "ACTIVE" },
            new() { Id = DeptHRId, OrganizationId = OrgDevsourceId, Code = "HR", Name = "Human Resources", Status = "ACTIVE" },
            new() { Id = DeptMarketingId, OrganizationId = OrgDevsourceId, Code = "MKT", Name = "Marketing", Status = "ACTIVE" },
            new() { Id = DeptFinanceId, OrganizationId = OrgDevsourceId, Code = "FIN", Name = "Finance", Status = "ACTIVE" },
            new() { Id = DeptOperationsId, OrganizationId = OrgDevsourceId, Code = "OPS", Name = "Operations", Status = "ACTIVE" },
        };
        context.Departments.AddRange(departments);

        var positions = new List<JobPosition>
        {
            new() { Id = PosSEId, OrganizationId = OrgDevsourceId, DepartmentId = DeptITId, Code = "SE", Title = "Software Engineer", LevelName = "Junior/Middle/Senior", Status = "ACTIVE" },
            new() { Id = PosTeamLeadId, OrganizationId = OrgDevsourceId, DepartmentId = DeptITId, Code = "TL", Title = "Team Lead", LevelName = "Lead", Status = "ACTIVE" },
            new() { Id = PosHRSId, OrganizationId = OrgDevsourceId, DepartmentId = DeptHRId, Code = "HRS", Title = "HR Specialist", Status = "ACTIVE" },
            new() { Id = PosMktExId, OrganizationId = OrgDevsourceId, DepartmentId = DeptMarketingId, Code = "MKE", Title = "Marketing Executive", Status = "ACTIVE" },
            new() { Id = PosFAId, OrganizationId = OrgDevsourceId, DepartmentId = DeptFinanceId, Code = "FA", Title = "Finance Analyst", Status = "ACTIVE" },
            new() { Id = PosOpsExId, OrganizationId = OrgDevsourceId, DepartmentId = DeptOperationsId, Code = "OPSE", Title = "Operations Executive", Status = "ACTIVE" },
        };
        context.JobPositions.AddRange(positions);

        await context.SaveChangesAsync();
    }
}
