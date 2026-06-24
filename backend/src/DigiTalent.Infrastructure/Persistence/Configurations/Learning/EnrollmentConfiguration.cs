using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollments");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.CourseId)
            .HasColumnName("course_id");

        builder.Property(x => x.EmployeeId)
            .HasColumnName("employee_id");

        builder.Property(x => x.CourseAssignmentId)
            .HasColumnName("course_assignment_id");

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasColumnName("status");

        builder.Property(x => x.ProgressPercentage)
            .HasColumnType("numeric(5,2)")
            .HasColumnName("progress_percentage");

        builder.Property(x => x.StartedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("started_at");

        builder.Property(x => x.CompletedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("completed_at");

        builder.Property(x => x.DueDate)
            .HasColumnType("date")
            .HasColumnName("due_date");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("created_at");

        builder.Property(x => x.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("updated_at");

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("updated_by");

        builder.HasIndex(x => new { x.CourseId, x.EmployeeId })
            .IsUnique()
            .HasDatabaseName("ux_enrollment_course_employee");

        builder.HasMany(e => e.LessonProgresses)
            .WithOne(lp => lp.Enrollment)
            .HasForeignKey(lp => lp.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
