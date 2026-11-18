using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map CompetencyMilestone với bảng "competency_milestones" (canonical v3.10).
/// </summary>
public class CompetencyMilestoneConfiguration : IEntityTypeConfiguration<CompetencyMilestone>
{
    public void Configure(EntityTypeBuilder<CompetencyMilestone> builder)
    {
        builder.ToTable("competency_milestones", table =>
        {
            table.HasCheckConstraint("ck_competency_milestones_level", "milestone_level BETWEEN 0 AND 3");
        });
        builder.HasKey(x => x.Id);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<CompetencyCategory>().WithMany().HasForeignKey(x => x.CompetencyCategoryId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.UpdatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.CompetencyCategoryId })
            .IsUnique()
            .HasDatabaseName("uq_competency_milestones_organization_category");
        builder.HasIndex(x => x.CompetencyCategoryId)
            .HasDatabaseName("ix_competency_milestones_competency_category_id");
        builder.HasIndex(x => x.UpdatedByUserId)
            .HasDatabaseName("ix_competency_milestones_updated_by_user_id");
    }
}
