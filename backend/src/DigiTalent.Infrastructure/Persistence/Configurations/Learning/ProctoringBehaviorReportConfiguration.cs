using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Map ProctoringBehaviorReport với bảng "proctoring_behavior_reports" (canonical v3.10).</summary>
public class ProctoringBehaviorReportConfiguration : IEntityTypeConfiguration<ProctoringBehaviorReport>
{
    public void Configure(EntityTypeBuilder<ProctoringBehaviorReport> builder)
    {
        builder.ToTable("proctoring_behavior_reports", table =>
        {
            table.HasCheckConstraint("ck_proctoring_behavior_reports_status", "status IN ('PENDING', 'READY', 'FAILED')");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_risk_score", "risk_score BETWEEN 0 AND 100");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_risk_level", "risk_level IN ('LOW', 'MEDIUM', 'HIGH')");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_ai_level", "ai_level IS NULL OR ai_level IN ('LOW', 'MEDIUM', 'HIGH')");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_ready",
                "status <> 'READY' OR (ai_level IS NOT NULL AND analyzed_at IS NOT NULL)");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_failed", "status <> 'FAILED' OR error_code IS NOT NULL");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_input_hash", "input_hash IS NULL OR char_length(input_hash) = 64");
            table.HasCheckConstraint("ck_proctoring_behavior_reports_attempt_count", "attempt_count >= 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.RiskLevel).HasMaxLength(10).IsRequired();
        builder.Property(x => x.AiLevel).HasMaxLength(10);
        builder.Property(x => x.Details).HasColumnType("jsonb").IsRequired();
        builder.Property(x => x.ErrorCode).HasMaxLength(40);
        builder.Property(x => x.Model).HasMaxLength(100);
        builder.Property(x => x.InputHash).HasMaxLength(64);
        builder.Property(x => x.AttemptCount).HasDefaultValue((short)0);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<ProctoringSession>().WithMany().HasForeignKey(x => x.SessionId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<CourseFinalSubmission>().WithMany().HasForeignKey(x => x.FinalSubmissionId);

        builder.HasIndex(x => x.SessionId)
            .IsUnique()
            .HasDatabaseName("uq_proctoring_behavior_reports_session");
        builder.HasIndex(x => new { x.OrganizationId, x.CreatedAt })
            .HasDatabaseName("ix_proctoring_behavior_reports_org_created");
        builder.HasIndex(x => x.EmployeeId)
            .HasDatabaseName("ix_proctoring_behavior_reports_employee_id");
        builder.HasIndex(x => x.CourseId)
            .HasDatabaseName("ix_proctoring_behavior_reports_course_id");
        builder.HasIndex(x => x.FinalSubmissionId)
            .HasDatabaseName("ix_proctoring_behavior_reports_final_submission_id");
        builder.HasIndex(x => x.UpdatedAt)
            .HasFilter("status = 'PENDING'")
            .HasDatabaseName("ix_proctoring_behavior_reports_pending");
    }
}
