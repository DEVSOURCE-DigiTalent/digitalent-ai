using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map CourseFinalSubmission với bảng "course_final_submissions" (canonical v3.1 §17.3).
/// </summary>
public class CourseFinalSubmissionConfiguration : IEntityTypeConfiguration<CourseFinalSubmission>
{
    public void Configure(EntityTypeBuilder<CourseFinalSubmission> builder)
    {
        builder.ToTable("course_final_submissions", table =>
        {
            table.HasCheckConstraint("ck_course_final_submissions_attempt_no", "attempt_no BETWEEN 1 AND 2");
            table.HasCheckConstraint("ck_course_final_submissions_evidence", "char_length(evidence_text) BETWEEN 30 AND 8000");
            table.HasCheckConstraint("ck_course_final_submissions_decision", "decision IS NULL OR decision IN ('PASSED','NOT_YET')");
            table.HasCheckConstraint("ck_course_final_submissions_review_complete",
                "(decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL) " +
                "OR (decision IS NOT NULL AND char_length(decision_reason) >= 10 AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)");
            table.HasCheckConstraint("ck_course_final_submissions_reviewed_after_submit", "reviewed_at IS NULL OR reviewed_at >= submitted_at");
            table.HasCheckConstraint("ck_course_final_submissions_retry_window",
                "(retry_opens_at IS NULL AND retry_due_at IS NULL) " +
                "OR (attempt_no = 1 AND decision = 'NOT_YET' AND retry_due_at > retry_opens_at)");
            table.HasCheckConstraint("ck_course_final_submissions_support_action",
                "support_action IS NULL OR support_action IN ('COACHING','FRESH_CYCLE','PAUSE')");
            table.HasCheckConstraint("ck_course_final_submissions_support_complete",
                "(support_action IS NULL AND support_note IS NULL AND support_recorded_by_user_id IS NULL AND support_recorded_at IS NULL) " +
                "OR (support_action IS NOT NULL AND decision = 'NOT_YET' AND support_recorded_by_user_id IS NOT NULL AND support_recorded_at IS NOT NULL)");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EvidenceText).IsRequired();
        builder.Property(x => x.Decision).HasMaxLength(20);
        builder.Property(x => x.SupportAction).HasMaxLength(30);

        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.SupportRecordedByUserId);

        builder.HasIndex(x => new { x.EnrollmentId, x.AttemptNo })
            .IsUnique()
            .HasDatabaseName("uq_course_final_submissions_enrollment_attempt");
        builder.HasIndex(x => x.SubmittedAt)
            .HasFilter("decision IS NULL")
            .HasDatabaseName("ix_course_final_submissions_pending");
    }
}
