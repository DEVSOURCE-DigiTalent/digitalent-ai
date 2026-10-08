using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Trial;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Trial;

public sealed partial class TrialService
{
    private readonly AppDbContext db;
    private readonly ICurrentUser actor;
    private readonly IPasswordHasher passwords;
    private readonly TrialOptions options;
    private readonly ITrialEmailSender mail;
    private readonly ITrialCatalog catalog;
    private readonly TimeProvider clock;
    private DateTimeOffset Now => clock.GetUtcNow();

    public TrialService(AppDbContext db, ICurrentUser actor, IPasswordHasher passwords, TrialOptions options,
        ITrialEmailSender mail, ITrialCatalog catalog, TimeProvider clock)
    {
        options.Validate();
        this.db = db; this.actor = actor; this.passwords = passwords; this.options = options;
        this.mail = mail; this.catalog = catalog; this.clock = clock;
    }

    public TrialReadinessDto Readiness()
    {
        var missing = new List<string>();
        if (!mail.IsReady) missing.Add("email_sender_unavailable");
        if (!Catalog().Any(x => x.Eligible)) missing.Add("approved_bundle_unavailable");
        var development = options.DevelopmentEnvironment && options.EnableDevelopmentBundle && options.EnableDevelopmentCapture;
        if (!development && !catalog.IsProductionApproved) missing.Add("production_content_not_approved");
        if (!development && (!options.PolicyApproved || string.IsNullOrWhiteSpace(options.DataPolicyNotice))) missing.Add("data_policy_not_approved");
        return new(missing.Count == 0, missing.Count == 0 && !development, development, missing.ToArray());
    }

    public TrialEligiblePositionDto[] Catalog() => catalog.Bundles.Select(bundle =>
    {
        var missing = new List<string>();
        if (!bundle.Active || string.IsNullOrWhiteSpace(bundle.RequirementVersion)) missing.Add("active_requirement_missing");
        if (!bundle.Approved || string.IsNullOrWhiteSpace(bundle.RubricVersion) || string.IsNullOrWhiteSpace(bundle.AssessmentVersion)) missing.Add("approved_diagnostic_missing");
        if (!bundle.Requirements.Any(r => r.MinimumAnswers > 0 && bundle.Questions.Count(q => q.CompetencyId == r.CompetencyId) >= r.MinimumAnswers)) missing.Add("measurement_coverage_missing");
        if (!bundle.Content.Any(c => c.Published && !string.IsNullOrWhiteSpace(c.Body))) missing.Add("published_learning_content_missing");
        return new TrialEligiblePositionDto(bundle.CatalogKey, bundle.Name, bundle.RequirementVersion, bundle.AssessmentVersion,
            bundle.RubricVersion, missing.Count == 0, missing.ToArray(), bundle.Requirements, !catalog.IsProductionApproved);
    }).ToArray();

    public async Task<TrialRegistrationDto> RegisterAsync(TrialRegistrationRequest request)
    {
        if (!Readiness().CanRegister) throw new ForbiddenException("Enterprise trial registration is unavailable until email, content and data policy are ready.");
        var email = NormalizeEmail(request.Email);
        Password(request.Password);
        if (!request.AcceptedTerms) throw new BadRequestException("Accept the terms and data policy before registration.");
        var orgName = Text(request.OrganizationName, 200, "Organization name");
        var ownerName = Text(request.OwnerName, 200, "Owner name");
        var industry = Text(request.Industry, 60, "Industry");
        var size = Text(request.Size, 40, "Size");
        var goal = Text(request.Goal, 60, "Goal");
        if (await db.Users.AnyAsync(x => x.Email == email) || await db.TrialRegistrations.AnyAsync(x => x.Email == email))
            throw new ConflictException("A registration for this email already exists. Check the verification email or contact support.");
        var token = Token();
        var registration = new TrialRegistration
        {
            Email = email, OrganizationName = orgName, OwnerName = ownerName, PasswordHash = passwords.Hash(request.Password),
            Industry = industry, Size = size, Goal = goal, TokenHash = Hash(token), ExpiresAt = Now.AddHours(options.VerificationHours)
        };
        db.TrialRegistrations.Add(registration);
        await db.SaveChangesAsync();
        try
        {
            await mail.SendAsync(email, "verify", token);
        }
        catch
        {
            // A failed delivery must not reserve the unique email or retain a password hash.
            db.TrialRegistrations.Remove(registration);
            await db.SaveChangesAsync();
            throw;
        }
        return new("verification_pending", registration.ExpiresAt, DevelopmentLink("verify", token));
    }

    public async Task<TrialAccountDto> VerifyAsync(string token)
    {
        if (!Readiness().CanRegister) throw new ForbiddenException("Enterprise trial registration is currently unavailable.");
        var hash = TokenHash(token);
        var registration = await db.TrialRegistrations.SingleOrDefaultAsync(x => x.TokenHash == hash);
        if (registration == null || registration.UsedAt != null || Now >= registration.ExpiresAt)
            throw new BadRequestException("This verification link is invalid, expired or already used.");
        if (await db.Users.AnyAsync(x => x.Email == registration.Email)) throw new ConflictException("This email is already registered.");
        var organization = new Organization { Code = "TRIAL-" + Guid.NewGuid().ToString("N"), Name = registration.OrganizationName };
        var owner = new User { Email = registration.Email, DisplayName = registration.OwnerName, PasswordHash = registration.PasswordHash, OrganizationId = organization.Id };
        db.Organizations.Add(organization); db.Users.Add(owner);
        await AssignRole(owner, "OWNER");
        var trial = new TrialWorkspace
        {
            OrganizationId = organization.Id, OwnerUserId = owner.Id, Industry = registration.Industry, Size = registration.Size, Goal = registration.Goal,
            StartedAt = Now, EndsAt = Now.AddDays(options.DurationDays), PolicyJson = Json(options)
        };
        db.TrialWorkspaces.Add(trial);
        registration.UsedAt = Now; registration.OrganizationId = organization.Id; registration.Revision++;
        // A single SaveChanges transaction commits owner, tenant, policy and consumed token together.
        await db.SaveChangesAsync();
        return new(owner.Id, organization.Id, owner.Email, "Owner");
    }

    public async Task<TrialContextDto> SelectPositionAsync(TrialSelectionRequest request)
    {
        var trial = await Workspace(true); EnsureOwner(trial);
        if (trial.PositionId != null) throw new ConflictException("The trial position is already selected and frozen.");
        var eligible = Catalog().SingleOrDefault(x => x.CatalogKey == request.CatalogKey);
        if (eligible is not { Eligible: true }) throw new BadRequestException("This position has no approved trial bundle.");
        var bundle = catalog.Bundles.Single(x => x.CatalogKey == request.CatalogKey);
        var department = new Department { OrganizationId = trial.OrganizationId, Code = "TRIAL", Name = Text(request.DepartmentName, 200, "Department name") };
        var position = new JobPosition { OrganizationId = trial.OrganizationId, Code = "TRIAL", Name = bundle.Name, Description = "Trial standard: " + bundle.RequirementVersion };
        db.Departments.Add(department); db.JobPositions.Add(position);
        trial.DepartmentId = department.Id; trial.PositionId = position.Id; trial.BundleJson = Json(bundle);
        await Save(trial);
        return await ContextAsync();
    }

    public async Task<TrialInvitationDto[]> InvitationsAsync()
    {
        var trial = await Workspace();
        await EnsureReporter(trial);
        var policy = Policy(trial);
        return (await db.TrialInvitations.Where(x => x.OrganizationId == trial.OrganizationId && x.DepartmentId == trial.DepartmentId).ToListAsync())
            .Select(x => Invitation(x, policy)).ToArray();
    }

    public async Task<TrialInvitationDto> InviteAsync(TrialInviteRequest request)
    {
        var trial = await Workspace(true); await EnsureReporter(trial);
        if (trial.PositionId == null || trial.DepartmentId == null) throw new BadRequestException("Select an eligible position first.");
        if (request.Role is not ("Employee" or "Manager")) throw new BadRequestException("Only Employee or Manager may be invited.");
        if (request.Role == "Manager") EnsureOwner(trial);
        var email = NormalizeEmail(request.Email);
        if (await db.Users.AnyAsync(x => x.Email == email) || await db.TrialInvitations.AnyAsync(x => x.OrganizationId == trial.OrganizationId && x.Email == email))
            throw new ConflictException("The email already has an account or an invitation.");
        var usage = await Usage(trial);
        TrialPolicy.EnsureSeat(usage.Accounts, usage.PendingInvitations, Policy(trial).MaxAccounts);
        var token = Token();
        var invitation = new TrialInvitation
        {
            OrganizationId = trial.OrganizationId, DepartmentId = trial.DepartmentId.Value, PositionId = trial.PositionId.Value,
            Name = Text(request.Name, 200, "Participant name"), Email = email, Role = request.Role, TokenHash = Hash(token),
            SentAt = Now, ExpiresAt = Now.AddHours(Policy(trial).InvitationHours), SendCount = 1
        };
        db.TrialInvitations.Add(invitation);
        // Workspace revision is a shared atomic quota guard. Parallel requests cannot both commit the last seat.
        await Save(trial);
        await DeliverInvitation(invitation, token);
        return Invitation(invitation, Policy(trial), token);
    }

    public async Task<TrialInvitationDto> ResendAsync(Guid id)
    {
        var trial = await Workspace(true); await EnsureReporter(trial);
        var invitation = await db.TrialInvitations.SingleOrDefaultAsync(x => x.Id == id && x.OrganizationId == trial.OrganizationId && x.DepartmentId == trial.DepartmentId)
            ?? throw new NotFoundException("Invitation not found.");
        if (invitation.AcceptedAt != null) throw new ConflictException("This invitation was already accepted.");
        var policy = Policy(trial);
        if (invitation.SendCount >= policy.MaxInvitationSends || Now < invitation.SentAt.AddSeconds(policy.ResendCooldownSeconds))
            throw new ConflictException("Invitation resend limit or cooldown reached.");
        if (Now >= invitation.ExpiresAt)
        {
            var usage = await Usage(trial);
            TrialPolicy.EnsureSeat(usage.Accounts, usage.PendingInvitations, policy.MaxAccounts);
        }
        var token = Token();
        invitation.TokenHash = Hash(token); invitation.ExpiresAt = Now.AddHours(policy.InvitationHours);
        invitation.SentAt = Now; invitation.SendCount++; invitation.SendFailed = false;
        await Save(trial);
        await DeliverInvitation(invitation, token);
        return Invitation(invitation, policy, token);
    }

    public async Task<TrialAccountDto> AcceptAsync(TrialAcceptRequest request)
    {
        Password(request.Password);
        var hash = TokenHash(request.Token);
        var invitation = await db.TrialInvitations.SingleOrDefaultAsync(x => x.TokenHash == hash);
        if (invitation == null || invitation.AcceptedAt != null || invitation.SendFailed || Now >= invitation.ExpiresAt)
            throw new BadRequestException("This invitation is invalid, expired or already used.");
        var trial = await db.TrialWorkspaces.SingleOrDefaultAsync(x => x.OrganizationId == invitation.OrganizationId);
        TrialPolicy.EnsureWritable(trial, Now);
        if (trial!.DepartmentId != invitation.DepartmentId || trial.PositionId != invitation.PositionId) throw new ForbiddenException("Invitation scope no longer matches the trial.");
        if (await db.Users.AnyAsync(x => x.Email == invitation.Email)) throw new ConflictException("An account already exists for this email.");
        var user = new User { OrganizationId = invitation.OrganizationId, Email = invitation.Email, DisplayName = invitation.Name, PasswordHash = passwords.Hash(request.Password) };
        var employee = new Employee { OrganizationId = invitation.OrganizationId, DepartmentId = invitation.DepartmentId, JobPositionId = invitation.PositionId,
            UserId = user.Id, FullName = invitation.Name, WorkEmail = invitation.Email, EmployeeCode = "TRIAL-" + Guid.NewGuid().ToString("N") };
        db.Users.Add(user); db.Employees.Add(employee);
        await AssignRole(user, invitation.Role == "Manager" ? "MANAGER" : "EMPLOYEE");
        if (invitation.Role == "Manager")
        {
            var department = await db.Departments.SingleAsync(x => x.Id == invitation.DepartmentId && x.OrganizationId == invitation.OrganizationId);
            if (department.ManagerEmployeeId != null) throw new ConflictException("The trial department already has a manager.");
            department.ManagerEmployeeId = employee.Id;
        }
        invitation.AcceptedAt = Now; invitation.EmployeeId = employee.Id;
        await Save(trial);
        return new(user.Id, trial.OrganizationId, user.Email, invitation.Role);
    }

    private async Task DeliverInvitation(TrialInvitation invitation, string token)
    {
        try { await mail.SendAsync(invitation.Email, "invite", token); }
        catch (Exception) { invitation.SendFailed = true; await db.SaveChangesAsync(); }
    }
    private async Task AssignRole(User user, string code)
    {
        var role = await db.Roles.SingleOrDefaultAsync(x => x.Code == code);
        if (role == null) { role = new Role { Code = code, Name = code, ScopeType = code == "MANAGER" ? "DEPARTMENT" : "ORGANIZATION" }; db.Roles.Add(role); }
        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id, AssignedAt = Now });
    }
    private static string NormalizeEmail(string value)
    {
        var normalized = value?.Trim().ToLowerInvariant() ?? "";
        if (normalized.Length > 255 || !MailAddress.TryCreate(normalized, out var address) || address.Address != normalized)
            throw new BadRequestException("Enter a valid email address.");
        return normalized;
    }
    private static void Password(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 12 || password.Length > 72)
            throw new BadRequestException("Password must contain 12 to 72 characters.");
    }
    private static string Text(string value, int max, string name)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Trim().Length > max) throw new BadRequestException(name + " is required and must fit the allowed length.");
        return value.Trim();
    }
    private static string Token() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
    private static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    private static string TokenHash(string token)
    {
        if (string.IsNullOrWhiteSpace(token) || token.Length != 64 || token.Any(c => !Uri.IsHexDigit(c))) throw new BadRequestException("Invalid link token.");
        return Hash(token);
    }
    private string? DevelopmentLink(string kind, string token) => options.DevelopmentEnvironment && options.EnableDevelopmentCapture
        ? options.PublicAppUrl.TrimEnd('/') + (kind == "verify" ? "/business/try/verify?token=" : "/business/try/accept?token=") + Uri.EscapeDataString(token) : null;
    private static string Json<T>(T value) => JsonSerializer.Serialize(value);
    private static T Read<T>(string json) => JsonSerializer.Deserialize<T>(json) ?? throw new InvalidOperationException("Trial snapshot is invalid.");
    private static TrialOptions Policy(TrialWorkspace trial) => Read<TrialOptions>(trial.PolicyJson);
    private static TrialBundle Bundle(TrialWorkspace trial) => Read<TrialBundle>(trial.BundleJson ?? throw new BadRequestException("Select a position first."));
    private async Task Save(TrialWorkspace trial) { trial.Revision++; await db.SaveChangesAsync(); }

    private async Task<TrialWorkspace> Workspace(bool writable = false)
    {
        if (!actor.IsAuthenticated || actor.UserId == null || actor.OrganizationId == null) throw new ForbiddenException("An authenticated trial account is required.");
        var trial = await db.TrialWorkspaces.SingleOrDefaultAsync(x => x.OrganizationId == actor.OrganizationId)
            ?? throw new ForbiddenException("No enterprise trial is linked to this account.");
        if (!await db.Users.AnyAsync(x => x.Id == actor.UserId && x.OrganizationId == trial.OrganizationId && x.Status == "ACTIVE"))
            throw new ForbiddenException("The account does not belong to this trial organization.");
        if (writable) TrialPolicy.EnsureWritable(trial, Now);
        return trial;
    }
    private void EnsureOwner(TrialWorkspace trial)
    {
        if (actor.UserId != trial.OwnerUserId) throw new ForbiddenException("Only the verified owner may perform this action.");
    }
    private async Task EnsureReporter(TrialWorkspace trial)
    {
        if (actor.UserId == trial.OwnerUserId) return;
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == actor.UserId && x.OrganizationId == trial.OrganizationId && x.Status == "ACTIVE");
        if (employee == null || employee.DepartmentId != trial.DepartmentId ||
            !await db.TrialInvitations.AnyAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id && x.Role == "Manager" && x.AcceptedAt != null) ||
            !await db.Departments.AnyAsync(x => x.OrganizationId == trial.OrganizationId && x.Id == employee.DepartmentId && x.ManagerEmployeeId == employee.Id))
            throw new ForbiddenException("Only the owner or the assigned department manager may read this report.");
    }
    private async Task<Employee> Self(TrialWorkspace trial)
    {
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == actor.UserId && x.OrganizationId == trial.OrganizationId && x.Status == "ACTIVE");
        if (employee == null || employee.DepartmentId != trial.DepartmentId || employee.JobPositionId != trial.PositionId ||
            !await db.TrialInvitations.AnyAsync(x => x.OrganizationId == trial.OrganizationId && x.EmployeeId == employee.Id && x.Role == "Employee" && x.AcceptedAt != null))
            throw new ForbiddenException("Only an accepted employee assigned to this position may access the diagnostic.");
        return employee;
    }
}
