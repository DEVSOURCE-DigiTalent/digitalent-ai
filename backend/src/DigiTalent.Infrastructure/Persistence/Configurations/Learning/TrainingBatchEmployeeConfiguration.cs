using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class TrainingBatchEmployeeConfiguration : IEntityTypeConfiguration<TrainingBatchEmployee>
{
    public void Configure(EntityTypeBuilder<TrainingBatchEmployee> builder)
    {
        builder.ToTable("training_batch_employees", table =>
        {
            table.ExcludeFromMigrations();
            table.HasCheckConstraint("ck_training_batch_employees_status", "status IN ('ENROLLED','IN_PROGRESS','COMPLETED','DROPPED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<TrainingBatch>().WithMany().HasForeignKey(x => x.TrainingBatchId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<CourseAssignment>().WithMany().HasForeignKey(x => x.CourseAssignmentId);

        builder.HasIndex(x => new { x.TrainingBatchId, x.EmployeeId })
            .IsUnique()
            .HasDatabaseName("ux_training_batch_employees_batch_emp");
    }
}
