using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity SkillGapRun với bảng "skill_gap_runs" (snapshot 1 lần tính skill gap — không ghi đè).
/// </summary>
public class SkillGapRunConfiguration : IEntityTypeConfiguration<SkillGapRun>
{
    public void Configure(EntityTypeBuilder<SkillGapRun> builder)
    {
        builder.ToTable("skill_gap_runs", table =>
        {
            table.HasCheckConstraint("ck_skill_gap_runs_generated_by", "generated_by IN ('SYSTEM','USER_REQUEST')");
            table.HasCheckConstraint("ck_skill_gap_runs_gap_count", "gap_count >= 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.GeneratedBy).IsRequired().HasMaxLength(30);
        builder.Property(x => x.CalculationVersion).IsRequired().HasMaxLength(30);
        builder.Property(x => x.SummarySnapshot).HasColumnType("jsonb");

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<PositionRequirementSet>().WithMany().HasForeignKey(x => x.RequirementSetId);

        builder.HasIndex(x => new { x.EmployeeId, x.GeneratedAt })
            .IsDescending(false, true)
            .HasDatabaseName("ix_skill_gap_runs_employee_generated_desc");
    }
}
