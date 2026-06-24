using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class AiExplanationLogConfiguration : IEntityTypeConfiguration<AiExplanationLog>
{
    public void Configure(EntityTypeBuilder<AiExplanationLog> builder)
    {
        builder.ToTable("ai_explanation_logs");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.FeatureType).HasColumnName("feature_type").HasMaxLength(80);
        builder.Property(x => x.SourceEntityType).HasColumnName("source_entity_type").HasMaxLength(80);
        builder.Property(x => x.SourceEntityId).HasColumnName("source_entity_id");
        builder.Property(x => x.InputSnapshotJson).HasColumnName("input_snapshot_json").HasColumnType("jsonb");
        builder.Property(x => x.OutputText).HasColumnName("output_text").HasColumnType("text");
        builder.Property(x => x.ModelProvider).HasColumnName("model_provider").HasMaxLength(80);
        builder.Property(x => x.ModelName).HasColumnName("model_name").HasMaxLength(120);
        builder.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id");
    }
}
