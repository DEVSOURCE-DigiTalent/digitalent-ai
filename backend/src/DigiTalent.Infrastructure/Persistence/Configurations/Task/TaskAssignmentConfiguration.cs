using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TaskAssignment với bảng "task_assignments" (giao bài thực hành, lưu snapshot nội dung).
/// </summary>
public class TaskAssignmentConfiguration : IEntityTypeConfiguration<TaskAssignment>
{
    public void Configure(EntityTypeBuilder<TaskAssignment> builder)
    {
        builder.ToTable("task_assignments", table =>
        {
            table.HasCheckConstraint(
                "ck_task_assignments_status",
                "status IN ('ASSIGNED','SUBMITTED','NEEDS_REVISION','PASSED','FAILED','CANCELLED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.TitleSnapshot).IsRequired().HasMaxLength(250);
        builder.Property(x => x.DescriptionSnapshot).IsRequired();
        builder.Property(x => x.ExpectedOutputSnapshot).IsRequired();

        builder.HasOne<PracticalTaskTemplate>().WithMany().HasForeignKey(x => x.TaskTemplateId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.PromptingCourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.AssignedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewerUserId);

        builder.HasIndex(x => new { x.EmployeeId, x.Status })
            .HasDatabaseName("ix_task_assignments_employee_status");
        builder.HasIndex(x => new { x.ReviewerUserId, x.Status, x.DueAt })
            .HasDatabaseName("ix_task_assignments_reviewer_status_due");
    }
}
