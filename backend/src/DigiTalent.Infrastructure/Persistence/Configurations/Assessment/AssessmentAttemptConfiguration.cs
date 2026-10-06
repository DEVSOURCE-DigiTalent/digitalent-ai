using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class AssessmentAttemptConfiguration : IEntityTypeConfiguration<AssessmentAttempt>
{
    public void Configure(EntityTypeBuilder<AssessmentAttempt> builder)
    {
        builder.ToTable("assessment_attempts", table =>
        {
            table.HasCheckConstraint("ck_assessment_attempts_attempt_no", "attempt_no >= 1");
            table.HasCheckConstraint("ck_assessment_attempts_status", "status IN ('STARTED','SUBMITTED','SCORED')");
            table.HasCheckConstraint(
                "ck_assessment_attempts_submitted_after_start",
                "submitted_at IS NULL OR submitted_at >= started_at");
            table.HasCheckConstraint(
                "ck_assessment_attempts_scored_after_start",
                "scored_at IS NULL OR scored_at >= started_at");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("STARTED");
        builder.Property(x => x.Score).HasPrecision(6, 2);

        builder.HasOne<Assessment>().WithMany().HasForeignKey(x => x.AssessmentId);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId);

        builder.HasIndex(x => new { x.AssessmentId, x.EnrollmentId, x.AttemptNo }, "uq_assessment_attempts_assessment_enrollment_attempt")
            .IsUnique()
            .HasDatabaseName("uq_assessment_attempts_assessment_enrollment_attempt");
        builder.HasIndex(x => new { x.EnrollmentId, x.AssessmentId, x.AttemptNo }, "ix_assessment_attempts_enrollment_assessment_attempt")
            .HasDatabaseName("ix_assessment_attempts_enrollment_assessment_attempt");
    }
}
