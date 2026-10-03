using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity SkillGapItem với bảng "skill_gap_items".
/// current_level NULL = chưa có cấp độ xác nhận; severity NULL = đã đạt yêu cầu.
/// </summary>
public class SkillGapItemConfiguration : IEntityTypeConfiguration<SkillGapItem>
{
    public void Configure(EntityTypeBuilder<SkillGapItem> builder)
    {
        builder.ToTable("skill_gap_items", table =>
        {
            table.HasCheckConstraint("ck_gap_required_level", "required_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_gap_current_level", "current_level IS NULL OR current_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_gap_steps_nonnegative", "gap_steps >= 0");
            table.HasCheckConstraint("ck_skill_gap_items_weight", "weight_percent > 0 AND weight_percent <= 100");
            table.HasCheckConstraint("ck_skill_gap_items_multiplier", "mandatory_multiplier >= 0");
            table.HasCheckConstraint("ck_skill_gap_items_severity", "severity IS NULL OR severity IN ('LOW','MEDIUM','HIGH')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.WeightPercent).HasPrecision(5, 2);
        builder.Property(x => x.MandatoryMultiplier).HasPrecision(4, 2).HasDefaultValue(1.00m);
        builder.Property(x => x.PriorityScore).HasPrecision(8, 2);
        builder.Property(x => x.Severity).HasMaxLength(20);

        builder.HasOne<SkillGapRun>().WithMany().HasForeignKey(x => x.SkillGapRunId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.SkillGapRunId, x.CompetencyId })
            .IsUnique()
            .HasDatabaseName("uq_skill_gap_items_run_competency");
    }
}
