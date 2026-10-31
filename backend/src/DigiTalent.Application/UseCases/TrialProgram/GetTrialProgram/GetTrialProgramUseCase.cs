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
        var domains = await _reader.LoadDomainsAsync(trial.OrganizationId);
        var stage = TrialProgramRules.StageOf(trial);

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
            MaxParticipants = TrialProgramRules.MaxParticipants,
            ChoiceCount = domains.Count * 3 * TrialProgramRules.ChoicePerCell,
            EssayCount = TrialProgramRules.Essays.Count,
            Participants = await _reader.LoadParticipantsAsync(trial),
            Departments = await _context.Departments.AsNoTracking()
                .Where(d => d.OrganizationId == trial.OrganizationId && d.Status == Statuses.MasterData.Active)
                .OrderBy(d => d.Name).Select(d => d.Name).ToListAsync(),
            Positions = await _context.JobPositions.AsNoTracking()
                .Where(p => p.OrganizationId == trial.OrganizationId && p.Status == Statuses.MasterData.Active)
                .OrderBy(p => p.Name).Select(p => p.Name).ToListAsync(),
            Report = stage == TrialProgramRules.StageReported ? await _reader.BuildReportAsync(trial) : null,
        };
    }
}
