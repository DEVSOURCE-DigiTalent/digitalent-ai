using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity ReadinessScore với bảng "readiness_scores".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class ReadinessScoreConfiguration : IEntityTypeConfiguration<ReadinessScore>
{
    public void Configure(EntityTypeBuilder<ReadinessScore> builder)
    {
        builder.ToTable("readiness_scores");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.CertificateScore).HasPrecision(5, 2);
        builder.Property(x => x.CompetencyScore).HasPrecision(5, 2);
        builder.Property(x => x.ComplianceScore).HasPrecision(5, 2);
        builder.Property(x => x.LearningProgressScore).HasPrecision(5, 2);
        builder.Property(x => x.SnapshotJson).HasColumnType("jsonb");
        builder.Property(x => x.TaskPerformanceScore).HasPrecision(5, 2);
        builder.Property(x => x.TotalScore).HasPrecision(5, 2);
    }
}
