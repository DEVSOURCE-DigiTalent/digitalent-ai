using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map CapabilityBaseline với bảng "capability_baselines" (canonical v3.1 §17.1).
/// </summary>
public class CapabilityBaselineConfiguration : IEntityTypeConfiguration<CapabilityBaseline>
{
    public void Configure(EntityTypeBuilder<CapabilityBaseline> builder)
    {
        builder.ToTable("capability_baselines", table =>
        {
            table.HasCheckConstraint("ck_capability_baselines_target_level", "target_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_capability_baselines_baseline_level", "baseline_level BETWEEN 0 AND target_level");
        });
        builder.HasKey(x => x.Id);

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<CompetencyCategory>().WithMany().HasForeignKey(x => x.CompetencyCategoryId);

        builder.HasIndex(x => new { x.EmployeeId, x.CompetencyCategoryId })
            .IsUnique()
            .HasDatabaseName("uq_capability_baselines_employee_category");
    }
}
