using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class CourseAssignmentConfiguration : IEntityTypeConfiguration<CourseAssignment>
{
    public void Configure(EntityTypeBuilder<CourseAssignment> builder)
    {
        builder.ToTable("course_assignments");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.CourseId)
            .HasColumnName("course_id");

        builder.Property(x => x.AssignmentType)
            .HasMaxLength(30)
            .HasColumnName("assignment_type");

        builder.Property(x => x.TargetEmployeeId)
            .HasColumnName("target_employee_id");

        builder.Property(x => x.TargetDepartmentId)
            .HasColumnName("target_department_id");

        builder.Property(x => x.TargetJobPositionId)
            .HasColumnName("target_job_position_id");

        builder.Property(x => x.AssignedByUserId)
            .HasColumnName("assigned_by_user_id");

        builder.Property(x => x.DueDate)
            .HasColumnType("date")
            .HasColumnName("due_date");

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasColumnName("status");

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
    }
}
