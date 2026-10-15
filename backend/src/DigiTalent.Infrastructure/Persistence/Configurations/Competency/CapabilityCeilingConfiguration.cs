using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map CapabilityCeiling với bảng "capability_ceilings" (canonical v3.2 §18.1).
/// </summary>
public class CapabilityCeilingConfiguration : IEntityTypeConfiguration<CapabilityCeiling>
{
    public void Configure(EntityTypeBuilder<CapabilityCeiling> builder)
    {
        builder.ToTable("capability_ceilings", table =>
        {
            table.HasCheckConstraint("ck_capability_ceilings_level", "ceiling_level BETWEEN 0 AND 3");
        });
        builder.HasKey(x => x.Id);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        builder.HasOne<CompetencyCategory>().WithMany().HasForeignKey(x => x.CompetencyCategoryId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.CompetencyCategoryId })
            .IsUnique()
            .HasFilter("department_id IS NULL")
            .HasDatabaseName("uq_capability_ceilings_organization_category");
        builder.HasIndex(x => new { x.DepartmentId, x.CompetencyCategoryId })
            .IsUnique()
            .HasFilter("department_id IS NOT NULL")
            .HasDatabaseName("uq_capability_ceilings_department_category");
        builder.HasIndex(x => x.CompetencyCategoryId)
            .HasDatabaseName("ix_capability_ceilings_competency_category_id");
        builder.HasIndex(x => x.UpdatedByUserId)
            .HasDatabaseName("ix_capability_ceilings_updated_by_user_id");
    }
}
