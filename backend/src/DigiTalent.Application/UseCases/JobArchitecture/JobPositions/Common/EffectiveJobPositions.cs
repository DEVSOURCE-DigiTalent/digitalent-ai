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

    // Preserve a valid assignment. A legacy mismatch can only fall back to an unambiguous position in the same department.
    public static IQueryable<Placement> Resolve(IApplicationDbContext context, IQueryable<Employee> employees)
    {
        var active = context.JobPositions.AsNoTracking().Where(p => p.Status == Statuses.MasterData.Active);
        return employees.Select(employee => new Placement
        {
            Employee = employee,
            PositionId = active.Where(p => p.OrganizationId == employee.OrganizationId
                && p.DepartmentId == employee.DepartmentId
                && (p.Id == employee.JobPositionId || !active.Any(other => other.OrganizationId == p.OrganizationId
                    && other.DepartmentId == p.DepartmentId && other.Id != p.Id)))
                .Select(p => (Guid?)p.Id).FirstOrDefault(),
        });
    }
}
