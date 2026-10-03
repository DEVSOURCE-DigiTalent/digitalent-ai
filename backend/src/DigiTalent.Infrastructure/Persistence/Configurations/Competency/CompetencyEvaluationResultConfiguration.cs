using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyEvaluationResult với bảng "competency_evaluation_results" (kết quả chấm từng năng lực của 1 task).
/// </summary>
public class CompetencyEvaluationResultConfiguration : IEntityTypeConfiguration<CompetencyEvaluationResult>
{
    public void Configure(EntityTypeBuilder<CompetencyEvaluationResult> builder)
    {
        builder.ToTable("competency_evaluation_results", table =>
        {
            table.HasCheckConstraint("ck_competency_evaluation_results_target_level", "target_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_competency_evaluation_results_verdict", "verdict IN ('PASSED','NEEDS_REVISION','FAILED')");
            table.HasCheckConstraint("ck_competency_evaluation_results_confirmed_level", "confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3");
            table.HasCheckConstraint(
                "ck_competency_evaluation_results_confirm_rule",
                "NOT level_confirming OR (verdict = 'PASSED' AND confirmed_level IS NOT NULL)");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Score).HasPrecision(5, 2);
        builder.Property(x => x.Verdict).IsRequired().HasMaxLength(30);
        builder.Property(x => x.LevelConfirming).HasDefaultValue(false);

        builder.HasOne<TaskEvaluation>().WithMany().HasForeignKey(x => x.TaskEvaluationId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.TaskEvaluationId, x.CompetencyId })
            .IsUnique()
            .HasDatabaseName("uq_competency_evaluation_results_eval_competency");
    }
}
