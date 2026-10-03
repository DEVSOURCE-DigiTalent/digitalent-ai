using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class JobFamilyConfiguration : IEntityTypeConfiguration<JobFamily>
{
    public void Configure(EntityTypeBuilder<JobFamily> builder)
    {
        builder.ToTable("job_families", table =>
            table.HasCheckConstraint("ck_job_families_status", "status IN ('ACTIVE','INACTIVE','ARCHIVED')"));

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(f => new { f.OrganizationId, f.Code }).IsUnique();

        builder.Property(f => f.Name).IsRequired().HasMaxLength(180);
        builder.Property(f => f.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(f => f.OrganizationId);
    }
}
