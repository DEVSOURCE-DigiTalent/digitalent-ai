using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class SkillGapResultConfiguration : IEntityTypeConfiguration<SkillGapResult>
{
    public void Configure(EntityTypeBuilder<SkillGapResult> builder)
    {
        builder.ToTable("skill_gap_results");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.JobPositionId).HasColumnName("job_position_id");
        builder.Property(x => x.OverallGapScore).HasColumnName("overall_gap_score").HasColumnType("numeric(6,2)");
        builder.Property(x => x.GeneratedAt).HasColumnName("generated_at").HasColumnType("timestamptz");
        builder.Property(x => x.GeneratedBy).HasColumnName("generated_by").HasMaxLength(30);
        builder.Property(x => x.SnapshotJson).HasColumnName("snapshot_json").HasColumnType("jsonb");

        builder.HasMany(sgr => sgr.Items)
            .WithOne(sgi => sgi.SkillGapResult)
            .HasForeignKey(sgi => sgi.SkillGapResultId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
