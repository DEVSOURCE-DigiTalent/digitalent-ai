using DigiTalent.Domain.Entities.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Task;

public class TaskEvaluationConfiguration : IEntityTypeConfiguration<TaskEvaluation>
{
    public void Configure(EntityTypeBuilder<TaskEvaluation> builder)
    {
        builder.ToTable("task_evaluations");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.TaskAssignmentId).HasColumnName("task_assignment_id");
        builder.Property(x => x.EvaluatorUserId).HasColumnName("evaluator_user_id");
        builder.Property(x => x.TaskScore).HasColumnName("task_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.Feedback).HasColumnName("feedback").HasColumnType("text");
        builder.Property(x => x.ConfirmedCompetencyId).HasColumnName("confirmed_competency_id");
        builder.Property(x => x.ConfirmedLevelValue).HasColumnName("confirmed_level_value");
        builder.Property(x => x.EvaluationStatus).HasColumnName("evaluation_status").HasMaxLength(30);
        builder.Property(x => x.EvaluatedAt).HasColumnName("evaluated_at").HasColumnType("timestamptz");
    }
}
