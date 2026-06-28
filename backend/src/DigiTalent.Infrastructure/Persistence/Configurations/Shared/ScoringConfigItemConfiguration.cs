using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Shared;

public class ScoringConfigItemConfiguration : IEntityTypeConfiguration<ScoringConfigItem>
{
    public void Configure(EntityTypeBuilder<ScoringConfigItem> builder)
    {
        builder.ToTable("scoring_config_items");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.ScoringConfigId).HasColumnName("scoring_config_id");
        builder.Property(x => x.ComponentCode).HasColumnName("component_code").HasMaxLength(120);
        builder.Property(x => x.Weight).HasColumnName("weight").HasColumnType("numeric(6,4)");
        builder.Property(x => x.MinValue).HasColumnName("min_value").HasColumnType("numeric(8,2)");
        builder.Property(x => x.MaxValue).HasColumnName("max_value").HasColumnType("numeric(8,2)");
        builder.Property(x => x.Notes).HasColumnName("notes").HasColumnType("text");
    }
}
