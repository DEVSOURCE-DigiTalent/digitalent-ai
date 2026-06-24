using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class TrainingRiskScoreConfiguration : IEntityTypeConfiguration<TrainingRiskScore>
{
    public void Configure(EntityTypeBuilder<TrainingRiskScore> builder)
    {
        builder.ToTable("training_risk_scores");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EnrollmentId).HasColumnName("enrollment_id");
        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.RiskScore).HasColumnName("risk_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.RiskLevel).HasColumnName("risk_level").HasMaxLength(30);
        builder.Property(x => x.InactivityScore).HasColumnName("inactivity_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.LowScoreRate).HasColumnName("low_score_rate").HasColumnType("numeric(5,2)");
        builder.Property(x => x.DeadlinePressure).HasColumnName("deadline_pressure").HasColumnType("numeric(5,2)");
        builder.Property(x => x.FailedAttemptRate).HasColumnName("failed_attempt_rate").HasColumnType("numeric(5,2)");
        builder.Property(x => x.ProgressDelay).HasColumnName("progress_delay").HasColumnType("numeric(5,2)");
        builder.Property(x => x.GeneratedAt).HasColumnName("generated_at").HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.EnrollmentId, x.GeneratedAt })
            .HasDatabaseName("ix_risk_enrollment_generated");
    }
}
