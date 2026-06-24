using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class AssessmentAttemptConfiguration : IEntityTypeConfiguration<AssessmentAttempt>
{
    public void Configure(EntityTypeBuilder<AssessmentAttempt> builder)
    {
        builder.ToTable("assessment_attempts");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.AssessmentId).HasColumnName("assessment_id");
        builder.Property(x => x.EnrollmentId).HasColumnName("enrollment_id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.AttemptNo).HasColumnName("attempt_no");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
        builder.Property(x => x.StartedAt).HasColumnName("started_at").HasColumnType("timestamptz");
        builder.Property(x => x.SubmittedAt).HasColumnName("submitted_at").HasColumnType("timestamptz");
        builder.Property(x => x.Score).HasColumnName("score").HasColumnType("numeric(6,2)");
        builder.Property(x => x.Passed).HasColumnName("passed");

        builder.HasIndex(x => new { x.EmployeeId, x.AssessmentId })
            .HasDatabaseName("ix_attempts_employee_assessment");

        builder.HasMany(at => at.Answers)
            .WithOne(a => a.Attempt)
            .HasForeignKey(a => a.AttemptId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
