using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Enrollment với bảng "enrollments". Mỗi nhân viên chỉ có 1 enrollment đang mở / khóa học.
/// </summary>
public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("enrollments", table =>
        {
            table.HasCheckConstraint("ck_enrollments_status", "status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT','COMPLETED','CANCELLED')");
            table.HasCheckConstraint("ck_enrollment_progress", "progress_percent BETWEEN 0 AND 100");
            table.HasCheckConstraint("ck_enrollments_completion_time", "completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.ProgressPercent).HasPrecision(5, 2).HasDefaultValue(0m);

        builder.HasOne<CourseAssignment>().WithMany().HasForeignKey(x => x.CourseAssignmentId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);

        // course_assignment_id UNIQUE (NULL được lặp lại)
        builder.HasIndex(x => x.CourseAssignmentId).IsUnique();

        builder.HasIndex(x => new { x.EmployeeId, x.Status })
            .HasDatabaseName("ix_enrollments_employee_status");
        builder.HasIndex(x => new { x.EmployeeId, x.CourseId })
            .IsUnique()
            .HasFilter("status IN ('NOT_STARTED','IN_PROGRESS','READY_FOR_ASSESSMENT')")
            .HasDatabaseName("ux_enrollments_one_active");
    }
}
