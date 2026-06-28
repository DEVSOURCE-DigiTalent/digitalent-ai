using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Shared;

public class ScoringConfigConfiguration : IEntityTypeConfiguration<ScoringConfig>
{
    public void Configure(EntityTypeBuilder<ScoringConfig> builder)
    {
        builder.ToTable("scoring_configs");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.ConfigType).HasColumnName("config_type").HasMaxLength(80);
        builder.Property(x => x.Version).HasColumnName("version");
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.Description).HasColumnName("description").HasColumnType("text");
        builder.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id");

        builder.HasMany(sc => sc.Items)
            .WithOne(sci => sci.ScoringConfig)
            .HasForeignKey(sci => sci.ScoringConfigId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
