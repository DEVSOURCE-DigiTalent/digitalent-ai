using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class PlatformOrganizationDetailOutput
{
    public PlatformOrganizationItem Organization { get; set; } = new();
    public List<PlatformOrganizationDepartmentItem> Departments { get; set; } = new();
    public List<PlatformOrganizationPersonItem> People { get; set; } = new();
    public List<PlatformOrganizationSeatItem> Seats { get; set; } = new();
    public List<PlatformSeatOrderItem> Orders { get; set; } = new();
}
