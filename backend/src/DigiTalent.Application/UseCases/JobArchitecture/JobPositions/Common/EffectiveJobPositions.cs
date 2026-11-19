using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.JobArchitecture.JobPositions;

internal static class EffectiveJobPositions
{
    internal sealed class Placement
    {
        public Employee Employee { get; init; } = null!;
        public Guid? PositionId { get; init; }
    }

    // The employee's own position while it is active in the organization. Positions are shared by every department
    // (StandardPositions), so the department plays no part.
    public static IQueryable<Placement> Resolve(IApplicationDbContext context, IQueryable<Employee> employees)
    {
        var active = context.JobPositions.AsNoTracking().Where(p => p.Status == Statuses.MasterData.Active);
        return employees.Select(employee => new Placement
        {
            Employee = employee,
            PositionId = active.Where(p => p.OrganizationId == employee.OrganizationId && p.Id == employee.JobPositionId)
                .Select(p => (Guid?)p.Id).FirstOrDefault(),
        });
    }
}
