using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Table "member_invitations" — matches SQL v2.3 (addendum 2026-10-06b).
/// </summary>
public class MemberInvitationConfiguration : IEntityTypeConfiguration<MemberInvitation>
{
    public void Configure(EntityTypeBuilder<MemberInvitation> builder)
    {
        builder.ToTable("member_invitations", table =>
            table.HasCheckConstraint("ck_member_invitations_status", "status IN ('PENDING','ACCEPTED','REVOKED')"));

        builder.HasKey(i => i.Id);

        // Email is stored lower-case by the use cases, so a plain unique index is case-insensitive
        builder.Property(i => i.Email).IsRequired().HasMaxLength(255);
        builder.Property(i => i.FullName).IsRequired().HasMaxLength(200);
        builder.Property(i => i.EmployeeCode).HasMaxLength(50);
        builder.Property(i => i.TokenHash).IsRequired().HasMaxLength(128);
        builder.Property(i => i.Status).IsRequired().HasMaxLength(30);

        builder.HasIndex(i => i.TokenHash).IsUnique();
        builder.HasIndex(i => new { i.OrganizationId, i.Email })
            .IsUnique()
            .HasFilter("status = 'PENDING'")
            .HasDatabaseName("ux_member_invitations_pending_email");

        builder.HasOne<Organization>().WithMany().HasForeignKey(i => i.OrganizationId);
        builder.HasOne<Role>().WithMany().HasForeignKey(i => i.RoleId);
        builder.HasOne<Department>().WithMany().HasForeignKey(i => i.DepartmentId);
        builder.HasOne<JobPosition>().WithMany().HasForeignKey(i => i.JobPositionId);
        builder.HasOne<User>().WithMany().HasForeignKey(i => i.InvitedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(i => i.AcceptedUserId);
    }
}
