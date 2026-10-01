using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CompetencyCategoryConfiguration : IEntityTypeConfiguration<CompetencyCategory>
{
    public void Configure(EntityTypeBuilder<CompetencyCategory> builder)
    {
        builder.ToTable("competency_categories", table =>
            table.HasCheckConstraint("ck_competency_categories_status", "status IN ('ACTIVE','INACTIVE','ARCHIVED')"));

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(180);
        builder.Property(c => c.Status).IsRequired().HasMaxLength(30);
        builder.Property(c => c.SortOrder).HasDefaultValue(0);

        builder.HasIndex(c => new { c.OrganizationId, c.Code })
            .IsUnique()
            .HasDatabaseName("uq_competency_categories_org_code");

        builder.HasOne<Organization>()
            .WithMany()
            .HasForeignKey(c => c.OrganizationId);
    }
}
