using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TrainingRiskScore với bảng "training_risk_scores".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class TrainingRiskScoreConfiguration : IEntityTypeConfiguration<TrainingRiskScore>
{
    public void Configure(EntityTypeBuilder<TrainingRiskScore> builder)
    {
        builder.ToTable("training_risk_scores");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.DeadlinePressure).HasPrecision(5, 2);
        builder.Property(x => x.FailedAttemptRate).HasPrecision(5, 2);
        builder.Property(x => x.InactivityScore).HasPrecision(5, 2);
        builder.Property(x => x.LowScoreRate).HasPrecision(5, 2);
        builder.Property(x => x.ProgressDelay).HasPrecision(5, 2);
        builder.Property(x => x.RiskScore).HasPrecision(5, 2);
    }
}
