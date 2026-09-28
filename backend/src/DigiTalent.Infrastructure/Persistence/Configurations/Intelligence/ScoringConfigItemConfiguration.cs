using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity ScoringConfigItem với bảng "scoring_config_items".
/// </summary>
public class ScoringConfigItemConfiguration : IEntityTypeConfiguration<ScoringConfigItem>
{
    public void Configure(EntityTypeBuilder<ScoringConfigItem> builder)
    {
        builder.ToTable("scoring_config_items", table =>
        {
            table.HasCheckConstraint("ck_scoring_config_items_range", "max_value IS NULL OR min_value IS NULL OR max_value >= min_value");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ComponentCode).IsRequired().HasMaxLength(120);
        builder.Property(x => x.Weight).HasPrecision(6, 4);
        builder.Property(x => x.MinValue).HasPrecision(8, 2);
        builder.Property(x => x.MaxValue).HasPrecision(8, 2);

        builder.HasOne<ScoringConfig>().WithMany().HasForeignKey(x => x.ScoringConfigId);

        builder.HasIndex(x => new { x.ScoringConfigId, x.ComponentCode })
            .IsUnique()
            .HasDatabaseName("uq_scoring_config_items_config_component");
    }
}
