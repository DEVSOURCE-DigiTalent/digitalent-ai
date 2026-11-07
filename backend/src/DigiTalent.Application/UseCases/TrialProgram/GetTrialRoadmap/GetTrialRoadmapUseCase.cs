using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Competency.Ceilings;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /trial/roadmap — đề xuất phạm vi đào tạo (3 phương án) và mức của từng người, sau khi bài dùng thử đóng.</summary>
public class GetTrialRoadmapUseCase : IUseCase<GetTrialRoadmapUseCaseInput, GetTrialRoadmapUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly TrialReportBuilder _builder;

    public GetTrialRoadmapUseCase(IApplicationDbContext context, ICurrentUser currentUser, TrialReportBuilder builder)
    {
        _context = context;
        _currentUser = currentUser;
        _builder = builder;
    }

    public async Task<GetTrialRoadmapUseCaseOutput> ExecuteAsync(GetTrialRoadmapUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var closed = await _context.TrialWorkspaces.AsNoTracking()
            .AnyAsync(t => t.OrganizationId == organizationId && t.ReportPublishedAt != null);
        if (!closed)
        {
            return new GetTrialRoadmapUseCaseOutput();
        }

        var snapshot = await _builder.BuildAsync(organizationId);
        var saved = await _context.TrialReports.AsNoTracking().FirstOrDefaultAsync(r => r.OrganizationId == organizationId);
        var insights = TrialReportBuilder.InsightsOf(saved, snapshot.Facts);

        return new GetTrialRoadmapUseCaseOutput
        {
            Available = true,
            Domains = snapshot.Domains.Select(TrialDomainDto.From).ToList(),
            Departments = snapshot.Departments.Select(d => new TrialRoadmapDepartmentDto { Id = d.DepartmentId, Name = d.Name, People = d.People }).ToList(),
            People = snapshot.Employees.Select(e => new TrialRoadmapPersonDto { DepartmentId = e.DepartmentId, Levels = e.Levels }).ToList(),
            Options = snapshot.Plan.Options,
            Reasons = insights.CeilingReasons,
            InsightStatus = insights.Status,
            Prices = Enumerable.Range(0, PulseRules.MaxLevel + 1).Select(level => CapabilityCeilingReader.PricePerSeat(level)).ToList(),
        };
    }
}
