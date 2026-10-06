using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-02 — Hồ sơ năng lực của tôi: thông tin nhân sự + từng năng lực theo chuẩn vị trí (mức yêu cầu,
/// mức đã xác nhận, số minh chứng) + năng lực đã xác nhận ngoài chuẩn vị trí.
/// </summary>
public class GetMyCompetencyProfileUseCase : IUseCase<GetMyCompetencyProfileUseCaseInput, GetMyCompetencyProfileUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly MyEmployeeContext _me;
    private readonly MyCompetencySnapshotBuilder _snapshotBuilder;

    public GetMyCompetencyProfileUseCase(IApplicationDbContext context, MyEmployeeContext me, MyCompetencySnapshotBuilder snapshotBuilder)
    {
        _context = context;
        _me = me;
        _snapshotBuilder = snapshotBuilder;
    }

    public async Task<GetMyCompetencyProfileUseCaseOutput> ExecuteAsync(GetMyCompetencyProfileUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var snapshot = await _snapshotBuilder.BuildAsync(employee);

        var evidenceCounts = await _context.CompetencyEvidences
            .AsNoTracking()
            .Where(e => e.EmployeeId == employee.Id)
            .GroupBy(e => new { e.CompetencyId, e.Status })
            .Select(g => new { g.Key.CompetencyId, g.Key.Status, Count = g.Count() })
            .ToListAsync();
        int CountOf(Guid competencyId, string status) =>
            evidenceCounts.Where(c => c.CompetencyId == competencyId && c.Status == status).Sum(c => c.Count);

        var requiredIds = snapshot.Lines.Select(l => l.CompetencyId).ToHashSet();

        return new GetMyCompetencyProfileUseCaseOutput
        {
            Employee = await LoadEmployeeInfoAsync(_context, employee),
            RequirementSet = snapshot.RequirementSet == null
                ? null
                : new MyRequirementSetDto
                {
                    Id = snapshot.RequirementSet.Id,
                    VersionNo = snapshot.RequirementSet.VersionNo,
                    EffectiveFrom = snapshot.RequirementSet.EffectiveFrom?.ToString("yyyy-MM-dd"),
                    ActivatedAt = snapshot.RequirementSet.ActivatedAt,
                },
            SkipReason = snapshot.SkipReason,
            Summary = MyCompetencyLineDto.Summary(snapshot),
            Items = snapshot.Lines.Select(line =>
            {
                var dto = MyCompetencyLineDto.Map<MyProfileCompetencyDto>(line);
                dto.ConfirmedEvidenceCount = CountOf(line.CompetencyId, Statuses.EvidenceStatus.Confirmed);
                dto.PendingEvidenceCount = CountOf(line.CompetencyId, Statuses.EvidenceStatus.Pending);
                return dto;
            }).ToList(),
            OtherConfirmed = snapshot.Confirmed
                .Where(c => !requiredIds.Contains(c.CompetencyId))
                .Select(MyConfirmedCompetencyDto.From)
                .ToList(),
        };
    }

    /// <summary>Phòng ban, vị trí, nhóm nghề, quản lý trực tiếp — dùng chung cho EM-01.</summary>
    internal static async Task<MyEmployeeInfoDto> LoadEmployeeInfoAsync(IApplicationDbContext context, Employee employee)
    {
        var info = await (
                from e in context.Employees.AsNoTracking()
                where e.Id == employee.Id
                select new MyEmployeeInfoDto
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    EmployeeCode = e.EmployeeCode,
                    WorkEmail = e.WorkEmail,
                    DepartmentName = context.Departments.Where(d => d.Id == e.DepartmentId).Select(d => d.Name).FirstOrDefault(),
                    JobPositionName = context.JobPositions.Where(p => p.Id == e.JobPositionId).Select(p => p.Name).FirstOrDefault(),
                    JobFamilyName = (
                        from p in context.JobPositions
                        join f in context.JobFamilies on p.JobFamilyId equals f.Id
                        where p.Id == e.JobPositionId
                        select f.Name).FirstOrDefault(),
                    ManagerName = context.Employees.Where(m => m.Id == e.DirectManagerId).Select(m => m.FullName).FirstOrDefault(),
                })
            .FirstAsync();

        info.JoinedAt = employee.JoinedAt?.ToString("yyyy-MM-dd");
        return info;
    }
}
