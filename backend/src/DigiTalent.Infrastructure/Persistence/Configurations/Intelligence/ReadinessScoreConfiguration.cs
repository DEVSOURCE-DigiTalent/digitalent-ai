using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class ReadinessScoreConfiguration : IEntityTypeConfiguration<ReadinessScore>
{
    public void Configure(EntityTypeBuilder<ReadinessScore> builder)
    {
        builder.ToTable("readiness_scores");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.JobPositionId).HasColumnName("job_position_id");
        builder.Property(x => x.CompetencyScore).HasColumnName("competency_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.CertificateScore).HasColumnName("certificate_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.LearningProgressScore).HasColumnName("learning_progress_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.ComplianceScore).HasColumnName("compliance_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.TaskPerformanceScore).HasColumnName("task_performance_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.TotalScore).HasColumnName("total_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.ReadinessLevel).HasColumnName("readiness_level").HasMaxLength(30);
        builder.Property(x => x.GeneratedAt).HasColumnName("generated_at").HasColumnType("timestamptz");
        builder.Property(x => x.SnapshotJson).HasColumnName("snapshot_json").HasColumnType("jsonb");

        builder.HasIndex(x => new { x.EmployeeId, x.GeneratedAt })
            .HasDatabaseName("ix_readiness_employee_generated");
    }
}
