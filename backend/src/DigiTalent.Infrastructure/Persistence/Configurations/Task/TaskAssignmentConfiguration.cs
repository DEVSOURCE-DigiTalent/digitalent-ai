using DigiTalent.Domain.Entities.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Task;

public class TaskAssignmentConfiguration : IEntityTypeConfiguration<TaskAssignment>
{
    public void Configure(EntityTypeBuilder<TaskAssignment> builder)
    {
        builder.ToTable("task_assignments");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.TaskId).HasColumnName("task_id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.AssignedByUserId).HasColumnName("assigned_by_user_id");
        builder.Property(x => x.ManagerEmployeeId).HasColumnName("manager_employee_id");
        builder.Property(x => x.Deadline).HasColumnName("deadline").HasColumnType("timestamptz");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
        builder.Property(x => x.ProgressPercent).HasColumnName("progress_percent").HasColumnType("numeric(5,2)");
        builder.Property(x => x.AssignedAt).HasColumnName("assigned_at").HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.EmployeeId, x.Status })
            .HasDatabaseName("ix_task_assign_employee_status");

        builder.HasMany(ta => ta.Submissions)
            .WithOne(ts => ts.TaskAssignment)
            .HasForeignKey(ts => ts.TaskAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(ta => ta.Evaluations)
            .WithOne(te => te.TaskAssignment)
            .HasForeignKey(te => te.TaskAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
