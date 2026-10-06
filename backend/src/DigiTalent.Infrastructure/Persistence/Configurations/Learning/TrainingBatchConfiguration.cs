using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class TrainingBatchConfiguration : IEntityTypeConfiguration<TrainingBatch>
{
    public void Configure(EntityTypeBuilder<TrainingBatch> builder)
    {
        builder.ToTable("training_batches", table =>
        {
            table.ExcludeFromMigrations();
            table.HasCheckConstraint("ck_training_batches_status", "status IN ('DRAFT','ACTIVE','COMPLETED','CANCELLED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Department>().WithMany().HasForeignKey(x => x.DepartmentId);
        builder.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.JobPositionId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.Status })
            .HasDatabaseName("ix_training_batches_org_status");
        builder.HasIndex(x => new { x.OrganizationId, x.Code })
            .IsUnique()
            .HasDatabaseName("ux_training_batches_org_code");
    }
}
