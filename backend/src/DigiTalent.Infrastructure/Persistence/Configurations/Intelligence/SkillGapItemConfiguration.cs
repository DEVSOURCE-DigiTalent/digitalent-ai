using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class SkillGapItemConfiguration : IEntityTypeConfiguration<SkillGapItem>
{
    public void Configure(EntityTypeBuilder<SkillGapItem> builder)
    {
        builder.ToTable("skill_gap_items");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.SkillGapResultId).HasColumnName("skill_gap_result_id");
        builder.Property(x => x.CompetencyId).HasColumnName("competency_id");
        builder.Property(x => x.RequiredLevelValue).HasColumnName("required_level_value");
        builder.Property(x => x.CurrentLevelValue).HasColumnName("current_level_value");
        builder.Property(x => x.GapLevel).HasColumnName("gap_level");
        builder.Property(x => x.Priority).HasColumnName("priority").HasMaxLength(30);
        builder.Property(x => x.RecommendedAction).HasColumnName("recommended_action").HasColumnType("text");
    }
}
