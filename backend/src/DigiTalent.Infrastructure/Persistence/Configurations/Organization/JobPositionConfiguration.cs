using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class JobPositionConfiguration : IEntityTypeConfiguration<JobPosition>
{
    public void Configure(EntityTypeBuilder<JobPosition> builder)
    {
        builder.ToTable("job_positions", table =>
        {
            table.HasCheckConstraint("ck_job_positions_status", "status IN ('ACTIVE','INACTIVE','ARCHIVED')");
            table.HasCheckConstraint("ck_job_positions_job_grade", "job_grade IS NULL OR job_grade IN ('G1','G2','G3')");
        });

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(p => new { p.OrganizationId, p.Code }).IsUnique();

        builder.Property(p => p.Name).IsRequired().HasMaxLength(180);
        builder.Property(p => p.JobGrade).HasMaxLength(10);
        builder.Property(p => p.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(p => p.OrganizationId);
        builder.HasOne<JobFamily>().WithMany().HasForeignKey(p => p.JobFamilyId);
        builder.HasOne<Department>().WithMany().HasForeignKey(p => p.DepartmentId);

        builder.HasIndex(p => p.DepartmentId).HasDatabaseName("ix_job_positions_department");
    }
}
