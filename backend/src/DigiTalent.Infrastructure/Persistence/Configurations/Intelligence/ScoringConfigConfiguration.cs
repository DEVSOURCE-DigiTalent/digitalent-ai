using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity ScoringConfig với bảng "scoring_configs" (bộ trọng số có version, đúng 1 bản active / loại / tổ chức).
/// </summary>
public class ScoringConfigConfiguration : IEntityTypeConfiguration<ScoringConfig>
{
    public void Configure(EntityTypeBuilder<ScoringConfig> builder)
    {
        builder.ToTable("scoring_configs", table =>
        {
            table.HasCheckConstraint("ck_scoring_configs_version", "version > 0");
            table.HasCheckConstraint("ck_scoring_configs_type", "config_type IN ('RECOMMENDATION_WEIGHTS','TRAINING_RISK','READINESS')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ConfigType).IsRequired().HasMaxLength(80);
        builder.Property(x => x.IsActive).HasDefaultValue(false);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.ConfigType, x.Version })
            .IsUnique()
            .HasDatabaseName("uq_scoring_configs_org_type_version");
        builder.HasIndex(x => new { x.OrganizationId, x.ConfigType })
            .IsUnique()
            .HasFilter("is_active = true")
            .HasDatabaseName("ux_scoring_configs_active");
    }
}
