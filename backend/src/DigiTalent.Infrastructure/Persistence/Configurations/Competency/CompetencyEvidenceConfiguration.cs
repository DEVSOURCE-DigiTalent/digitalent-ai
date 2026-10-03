using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyEvidence với bảng "competency_evidences".
/// Nguồn xác nhận cấp độ: PRACTICAL_TASK, MANUAL_OVERRIDE, MIGRATION (bài thi trắc nghiệm KHÔNG xác nhận — D-S3-08).
/// </summary>
public class CompetencyEvidenceConfiguration : IEntityTypeConfiguration<CompetencyEvidence>
{
    public void Configure(EntityTypeBuilder<CompetencyEvidence> builder)
    {
        builder.ToTable("competency_evidences", table =>
        {
            table.HasCheckConstraint("ck_competency_evidences_source_type", "source_type IN ('PRACTICAL_TASK','MANUAL_OVERRIDE','MIGRATION')");
            table.HasCheckConstraint("ck_competency_evidences_status", "status IN ('PENDING','CONFIRMED','REJECTED','SUPERSEDED')");
            table.HasCheckConstraint("ck_competency_evidences_confirmed_level", "confirmed_level IS NULL OR confirmed_level BETWEEN 1 AND 3");
            table.HasCheckConstraint(
                "ck_competency_evidences_level_confirming_rule",
                "NOT is_level_confirming OR (status = 'CONFIRMED' AND confirmed_level IS NOT NULL AND confirmed_at IS NOT NULL AND confirmed_by_user_id IS NOT NULL)");
            table.HasCheckConstraint(
                "ck_competency_evidences_practical_task_result",
                "source_type <> 'PRACTICAL_TASK' OR competency_evaluation_result_id IS NOT NULL");
            table.HasCheckConstraint(
                "ck_competency_evidences_not_self_supersede",
                "supersedes_evidence_id IS NULL OR supersedes_evidence_id <> id");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.IsLevelConfirming).HasDefaultValue(false);
        builder.Property(x => x.Score).HasPrecision(5, 2);

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);
        builder.HasOne<CompetencyEvaluationResult>().WithMany().HasForeignKey(x => x.CompetencyEvaluationResultId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ConfirmedByUserId);
        builder.HasOne<CompetencyEvidence>().WithMany().HasForeignKey(x => x.SupersedesEvidenceId);

        // competency_evaluation_result_id UNIQUE (NULL được lặp lại)
        builder.HasIndex(x => x.CompetencyEvaluationResultId).IsUnique();

        builder.HasIndex(x => new { x.EmployeeId, x.CompetencyId, x.Status, x.CreatedAt })
            .IsDescending(false, false, false, true)
            .HasDatabaseName("ix_competency_evidences_employee_competency_status_created");
    }
}
