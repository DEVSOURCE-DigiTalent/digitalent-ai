using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class PromotionReadinessResultConfiguration : IEntityTypeConfiguration<PromotionReadinessResult>
{
    public void Configure(EntityTypeBuilder<PromotionReadinessResult> builder)
    {
        builder.ToTable("promotion_readiness_results");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.TargetJobPositionId).HasColumnName("target_job_position_id");
        builder.Property(x => x.ReadinessPercent).HasColumnName("readiness_percent").HasColumnType("numeric(5,2)");
        builder.Property(x => x.MissingWeight).HasColumnName("missing_weight").HasColumnType("numeric(6,2)");
        builder.Property(x => x.RecommendationText).HasColumnName("recommendation_text").HasColumnType("text");
        builder.Property(x => x.GeneratedAt).HasColumnName("generated_at").HasColumnType("timestamptz");
    }
}
