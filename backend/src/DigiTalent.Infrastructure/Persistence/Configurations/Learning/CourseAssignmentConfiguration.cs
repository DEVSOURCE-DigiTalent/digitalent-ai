using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CourseAssignment với bảng "course_assignments" (giao khóa học cho nhân viên).
/// </summary>
public class CourseAssignmentConfiguration : IEntityTypeConfiguration<CourseAssignment>
{
    public void Configure(EntityTypeBuilder<CourseAssignment> builder)
    {
        builder.ToTable("course_assignments", table =>
        {
            table.HasCheckConstraint("ck_course_assignments_source", "assignment_source IN ('MANUAL','SKILL_GAP','DEPARTMENT','POSITION')");
            table.HasCheckConstraint("ck_course_assignments_status", "status IN ('ACTIVE','CANCELLED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.AssignmentSource).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Department>().WithMany().HasForeignKey(x => x.SourceDepartmentId);
        builder.HasOne<JobPosition>().WithMany().HasForeignKey(x => x.SourceJobPositionId);
        builder.HasOne<SkillGapRun>().WithMany().HasForeignKey(x => x.SourceSkillGapRunId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.AssignedByUserId);

        builder.HasIndex(x => new { x.EmployeeId, x.Status })
            .HasDatabaseName("ix_course_assignments_employee");
    }
}
