using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public sealed class TrialRegistrationConfiguration : IEntityTypeConfiguration<TrialRegistration>
{
    public void Configure(EntityTypeBuilder<TrialRegistration> b)
    {
        b.ToTable("trial_registrations"); b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255);
        b.HasIndex(x => x.Email).IsUnique(); b.HasIndex(x => x.TokenHash).IsUnique();
        b.Property(x => x.Revision).IsConcurrencyToken();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
    }
}
public sealed class TrialWorkspaceConfiguration : IEntityTypeConfiguration<TrialWorkspace>
{
    public void Configure(EntityTypeBuilder<TrialWorkspace> b)
    {
        b.ToTable("trial_workspaces"); b.HasKey(x => x.Id);
        b.HasIndex(x => x.OrganizationId).IsUnique(); b.HasIndex(x => x.OwnerUserId).IsUnique();
        b.Property(x => x.Revision).IsConcurrencyToken();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.OwnerUserId);
        b.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
    }
}
public sealed class TrialInvitationConfiguration : IEntityTypeConfiguration<TrialInvitation>
{
    public void Configure(EntityTypeBuilder<TrialInvitation> b)
    {
        b.ToTable("trial_invitations"); b.HasKey(x => x.Id);
        b.Property(x => x.Email).HasMaxLength(255);
        b.HasIndex(x => new { x.OrganizationId, x.Email }).IsUnique();
        b.HasIndex(x => x.TokenHash).IsUnique();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
        b.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
    }
}
public sealed class PositionDiagnosticAttemptConfiguration : IEntityTypeConfiguration<PositionDiagnosticAttempt>
{
    public void Configure(EntityTypeBuilder<PositionDiagnosticAttempt> b)
    {
        b.ToTable("position_diagnostic_attempts"); b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.OrganizationId, x.EmployeeId }).IsUnique();
        b.Property(x => x.AnswerRevision).IsConcurrencyToken();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        b.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        b.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.PositionId);
    }
}
