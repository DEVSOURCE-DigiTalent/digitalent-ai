using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Trial;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Trial;

public sealed partial class TrialService
{
    public async Task<TrialContextDto> ContextAsync()
    {
        var trial = await Workspace();
        var policy = Policy(trial); var writable = trial.ConvertedAt != null || Now < trial.EndsAt;
        var isOwner = trial.OwnerUserId == actor.UserId;
        var invitations = await db.TrialInvitations.Where(x => x.OrganizationId == trial.OrganizationId).ToListAsync();
        var submitted = await db.PositionDiagnosticAttempts.AnyAsync(x => x.OrganizationId == trial.OrganizationId && x.SubmittedAt != null && x.ResultJson != null && x.PathJson != null);
        var bundle = trial.BundleJson == null ? null : Bundle(trial);
        return new(trial.OrganizationId, trial.ConvertedAt != null ? "converted" : writable ? "trial_active" : "trial_read_only",
            trial.StartedAt, trial.EndsAt, policy.PolicyVersion, policy with { EnableDevelopmentCapture = false, EnableDevelopmentBundle = false },
            await Usage(trial), writable ? (isOwner ? ["select_position", "invite", "view_results", "request_conversion"] : ["diagnostic", "learning", "read"]) : ["read", "request_conversion"],
            bundle == null ? null : new(trial.PositionId!.Value, trial.DepartmentId!.Value, bundle.Name, bundle.RequirementVersion),
            [new("position", trial.PositionId != null, "select_position"), new("invite", invitations.Any(x => !x.SendFailed), "invite"),
             new("assessment", submitted, "await_assessment"), new("results", submitted && trial.ResultsViewedAt != null, "view_results")], Readiness());
    }

    public async Task<TrialResultRowDto[]> ResultsAsync()
    {
        var trial = await Workspace(); await EnsureReporter(trial);
        var invitations = await db.TrialInvitations.Where(x => x.OrganizationId == trial.OrganizationId && x.DepartmentId == trial.DepartmentId).ToListAsync();
        var attempts = await db.PositionDiagnosticAttempts.Where(x => x.OrganizationId == trial.OrganizationId).ToListAsync();
        var rows = invitations.Select(invitation =>
        {
            var attempt = attempts.SingleOrDefault(x => x.EmployeeId == invitation.EmployeeId);
            var path = attempt?.PathJson == null ? null : Read<TrialLearningPathDto>(attempt.PathJson);
            var state = invitation.AcceptedAt == null ? "pending_invitation" : attempt == null ? "not_started" : attempt.SubmittedAt == null ? "in_progress" :
                path?.Items.Any(x => x.Status != "not_started") == true ? "learning_in_progress" : "result_available";
            if (invitation.AcceptedAt == null && invitation.SendFailed) state = "send_failed";
            else if (invitation.AcceptedAt == null && Now >= invitation.ExpiresAt) state = "expired_invitation";
            return new TrialResultRowDto(invitation.Id, invitation.EmployeeId, invitation.Name, invitation.Role, state,
                attempt?.ResultJson == null ? null : Read<TrialGapResultDto>(attempt.ResultJson), path);
        }).ToArray();
        if (rows.Any(x => x.Result != null) && trial.ResultsViewedAt == null && (trial.ConvertedAt != null || Now < trial.EndsAt))
        { trial.ResultsViewedAt = Now; await Save(trial); }
        return rows;
    }

    public async Task<TrialContextDto> RequestConversionAsync()
    {
        var trial = await Workspace(); EnsureOwner(trial);
        // A request is not a paid entitlement, including after expiry. It never changes mutation rights.
        if (trial.ConversionRequestedAt == null) { trial.ConversionRequestedAt = Now; await Save(trial); }
        return await ContextAsync();
    }

    public async Task ConvertAsync(Guid organizationId, string approvedReference)
    {
        if (!actor.IsAuthenticated || !(actor.IsInRole("SYSTEM_ADMIN") || actor.IsInRole("SystemAdmin")))
            throw new ForbiddenException("Only a trusted platform administrator may confirm an approved conversion.");
        var reference = Text(approvedReference, 200, "Approved entitlement reference");
        var trial = await db.TrialWorkspaces.SingleOrDefaultAsync(x => x.OrganizationId == organizationId)
            ?? throw new NotFoundException("Trial organization not found.");
        if (trial.ConvertedAt != null) return;
        trial.ConvertedAt = Now; trial.ConversionReference = reference;
        await Save(trial);
    }

    private async Task<TrialUsageDto> Usage(TrialWorkspace trial) => new(
        await db.Users.CountAsync(x => x.OrganizationId == trial.OrganizationId && x.Status == "ACTIVE"),
        await db.TrialInvitations.CountAsync(x => x.OrganizationId == trial.OrganizationId && x.AcceptedAt == null && x.ExpiresAt > Now));

    private TrialInvitationDto Invitation(TrialInvitation x, string? token = null) => new(x.Id, x.Name, x.Email, x.Role, x.DepartmentId, x.PositionId,
        x.AcceptedAt != null ? "accepted" : x.SendFailed ? "send_failed" : Now >= x.ExpiresAt ? "expired" : "pending", x.SentAt, x.ExpiresAt,
        x.AcceptedAt == null && x.SendCount < options.MaxInvitationSends && Now >= x.SentAt.AddSeconds(options.ResendCooldownSeconds),
        token == null || x.SendFailed ? null : DevelopmentLink("invite", token));
}
