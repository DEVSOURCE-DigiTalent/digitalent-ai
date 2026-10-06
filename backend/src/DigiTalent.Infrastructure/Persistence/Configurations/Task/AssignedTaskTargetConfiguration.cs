using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Bản chụp mục tiêu năng lực + rubric tại thời điểm giao nhiệm vụ (không đổi khi mẫu nhiệm vụ đổi).</summary>
public class AssignedTaskTargetConfiguration : IEntityTypeConfiguration<AssignedTaskTarget>
{
    public void Configure(EntityTypeBuilder<AssignedTaskTarget> builder)
    {
        builder.ToTable("assigned_task_targets", table =>
        {
            table.HasCheckConstraint("ck_assigned_task_targets_level", "target_level BETWEEN 1 AND 3");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RubricSnapshot).HasColumnType("jsonb");

        builder.HasOne<TaskAssignment>().WithMany().HasForeignKey(x => x.TaskAssignmentId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.TaskAssignmentId, x.CompetencyId }, "uq_assigned_task_targets_assignment_competency")
            .IsUnique()
            .HasDatabaseName("uq_assigned_task_targets_assignment_competency");
    }
}
