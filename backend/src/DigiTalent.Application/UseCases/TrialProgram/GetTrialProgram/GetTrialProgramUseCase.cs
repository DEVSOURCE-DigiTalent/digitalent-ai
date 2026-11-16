using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /trial — tình trạng dùng thử của doanh nghiệp cho chủ doanh nghiệp.</summary>
public class GetTrialProgramUseCase : IUseCase<GetTrialProgramUseCaseInput, GetTrialProgramUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public GetTrialProgramUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<GetTrialProgramUseCaseOutput> ExecuteAsync(GetTrialProgramUseCaseInput input)
    {
        var trial = await _reader.ForOwnerAsync();
        await _reader.FinalizeSurveyAsync(trial);
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var stage = TrialProgramRules.StageOf(trial);

        var departments = await _context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == trial.OrganizationId && d.Status == Statuses.MasterData.Active)
            .OrderBy(d => d.Name).Select(d => new { d.Id, d.Name }).ToListAsync();
        var positions = await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == trial.OrganizationId && p.Status == Statuses.MasterData.Active)
            .OrderBy(p => p.Name).Select(p => new { p.DepartmentId, p.Name }).ToListAsync();
        var positionsByDepartment = positions.ToLookup(p => p.DepartmentId, p => p.Name);

        return new GetTrialProgramUseCaseOutput
        {
            OrganizationId = trial.OrganizationId,
            OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
            Stage = stage,
            TestDeadline = trial.TestDeadline,
            PreferredReviewAt = trial.PreferredReviewAt,
            RequestNote = trial.RequestNote,
            RequestedAt = trial.RequestedAt,
            MentorName = await _reader.UserNameAsync(trial.MentorUserId),
            MentorAssignedAt = trial.MentorAssignedAt,
            ReportPublishedAt = trial.ReportPublishedAt,
            ChoiceCount = domains.Count * 3 * TrialProgramRules.ChoicePerCell,
            EssayCount = 0,
            Participants = await _reader.LoadParticipantsAsync(trial),
            Departments = departments.Select(d => d.Name).ToList(),
            Positions = positions.Select(p => p.Name).ToList(),
            PositionsByDepartment = departments.GroupBy(d => d.Name).ToDictionary(
                group => group.Key, group => group.SelectMany(d => positionsByDepartment[d.Id]).Distinct().ToList()),
            Report = trial.RequestedAt != null ? await _reader.BuildReportAsync(trial) : null,
        };
    }
}
