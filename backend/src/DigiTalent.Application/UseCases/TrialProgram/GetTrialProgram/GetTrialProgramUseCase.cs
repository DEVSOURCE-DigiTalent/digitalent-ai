using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.JobArchitecture.JobPositions;
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
        // positions are the 5 standard ones, open in every department
        var positions = StandardPositions.Choices(await _context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == trial.OrganizationId).ToListAsync());

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
            Positions = positions,
            Report = trial.RequestedAt != null ? await _reader.BuildReportAsync(trial) : null,
        };
    }
}
