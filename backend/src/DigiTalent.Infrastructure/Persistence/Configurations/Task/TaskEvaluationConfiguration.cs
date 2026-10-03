using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TaskEvaluation với bảng "task_evaluations" (1 lần chấm / 1 bài nộp).
/// </summary>
public class TaskEvaluationConfiguration : IEntityTypeConfiguration<TaskEvaluation>
{
    public void Configure(EntityTypeBuilder<TaskEvaluation> builder)
    {
        builder.ToTable("task_evaluations", table =>
        {
            table.HasCheckConstraint("ck_task_evaluations_score", "overall_score IS NULL OR overall_score BETWEEN 0 AND 100");
            table.HasCheckConstraint("ck_task_evaluations_verdict", "verdict IN ('PASSED','NEEDS_REVISION','FAILED')");
            table.HasCheckConstraint("ck_task_evaluations_evidence_requires_pass", "NOT counts_as_evidence OR verdict = 'PASSED'");
            table.HasCheckConstraint("ck_task_evaluations_row_version", "row_version > 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.OverallScore).HasPrecision(5, 2);
        builder.Property(x => x.Verdict).IsRequired().HasMaxLength(30);
        builder.Property(x => x.CountsAsEvidence).HasDefaultValue(false);
        builder.Property(x => x.RowVersion).HasDefaultValue(1L);

        builder.HasOne<TaskSubmission>().WithMany().HasForeignKey(x => x.TaskSubmissionId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewerUserId);

        builder.HasIndex(x => x.TaskSubmissionId).IsUnique();
        builder.HasIndex(x => x.FinalizationKey).IsUnique();
    }
}
