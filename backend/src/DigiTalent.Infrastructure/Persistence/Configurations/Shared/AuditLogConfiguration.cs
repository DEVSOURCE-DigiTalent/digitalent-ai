using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action).IsRequired().HasMaxLength(120);
        builder.Property(a => a.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(a => a.OldValues).HasColumnType("jsonb");
        builder.Property(a => a.NewValues).HasColumnType("jsonb");
        builder.Property(a => a.IpHash).HasMaxLength(128);

        builder.HasOne<Organization>().WithMany().HasForeignKey(a => a.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(a => a.ActorUserId);

        builder.HasIndex(a => new { a.EntityType, a.EntityId, a.CreatedAt })
            .IsDescending(false, false, true)
            .HasDatabaseName("ix_audit_logs_entity_created_desc");
    }
}
