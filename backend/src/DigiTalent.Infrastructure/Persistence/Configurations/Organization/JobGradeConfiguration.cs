using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Table "job_grades" — matches SQL v2.3 (addendum 2026-10-06b).
/// </summary>
public class JobGradeConfiguration : IEntityTypeConfiguration<JobGrade>
{
    public void Configure(EntityTypeBuilder<JobGrade> builder)
    {
        builder.ToTable("job_grades", table =>
            table.HasCheckConstraint("ck_job_grades_code", "code IN ('G1','G2','G3')"));

        builder.HasKey(g => g.Id);

        builder.Property(g => g.Code).IsRequired().HasMaxLength(10);
        builder.HasIndex(g => new { g.OrganizationId, g.Code }).IsUnique(); // one row per grade per organization

        builder.Property(g => g.Name).IsRequired().HasMaxLength(120);

        builder.HasOne<Organization>().WithMany().HasForeignKey(g => g.OrganizationId);
    }
}
