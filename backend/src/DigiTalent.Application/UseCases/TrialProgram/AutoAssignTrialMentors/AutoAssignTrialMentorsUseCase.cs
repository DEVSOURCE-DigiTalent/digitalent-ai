using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>
/// POST /platform/trials/auto-assign — gives a mentor to every trial organization that sent its request and still has
/// none (oldest request first), with the same choice as the automatic assignment when the owner starts the survey.
/// Organizations stay unassigned when every mentor already has the maximum number of organizations.
/// </summary>
public class AutoAssignTrialMentorsUseCase : IUseCase<AutoAssignTrialMentorsUseCaseInput, AutoAssignTrialMentorsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;
    private readonly IAuditService _audit;

    public AutoAssignTrialMentorsUseCase(IApplicationDbContext context, TrialProgramReader reader, IAuditService audit)
    {
        _context = context;
        _reader = reader;
        _audit = audit;
    }

    public async Task<AutoAssignTrialMentorsUseCaseOutput> ExecuteAsync(AutoAssignTrialMentorsUseCaseInput input)
    {
        var waiting = await _context.TrialWorkspaces
            .Where(t => t.RequestedAt != null && t.MentorUserId == null && t.ConvertedAt == null)
            .OrderBy(t => t.RequestedAt)
            .ToListAsync();

        var output = new AutoAssignTrialMentorsUseCaseOutput();
        var assigned = new List<(Guid TrialId, AutoAssignedTrial Row)>();
        foreach (var trial in waiting)
        {
            // Each pick sees the previous ones through the change tracker only after saving, so save as we go.
            if (await _reader.AutoAssignMentorAsync(trial) is not { } mentor)
            {
                output.Remaining++;
                continue;
            }

            await _context.SaveChangesAsync();
            assigned.Add((trial.Id, new AutoAssignedTrial
            {
                OrganizationId = trial.OrganizationId,
                OrganizationName = await _reader.OrganizationNameAsync(trial.OrganizationId),
                MentorUserId = mentor.Id,
                MentorName = mentor.Name,
            }));
        }

        foreach (var (trialId, row) in assigned)
        {
            await _audit.LogAsync("TRIAL_MENTOR_AUTO_ASSIGNED", "trial_workspaces", trialId,
                oldValues: new { mentorUserId = (Guid?)null }, newValues: new { mentorUserId = row.MentorUserId }, entityLabel: row.OrganizationName);
        }

        output.Assigned = assigned.Select(a => a.Row).ToList();
        return output;
    }
}
