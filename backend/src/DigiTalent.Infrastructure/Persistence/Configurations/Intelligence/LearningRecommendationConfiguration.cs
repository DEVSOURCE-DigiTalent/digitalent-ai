using DigiTalent.Domain.Entities.Intelligence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class LearningRecommendationConfiguration : IEntityTypeConfiguration<LearningRecommendation>
{
    public void Configure(EntityTypeBuilder<LearningRecommendation> builder)
    {
        builder.ToTable("learning_recommendations");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.EmployeeId).HasColumnName("employee_id");
        builder.Property(x => x.SourceSkillGapResultId).HasColumnName("source_skill_gap_result_id");
        builder.Property(x => x.CourseId).HasColumnName("course_id");
        builder.Property(x => x.PriorityScore).HasColumnName("priority_score").HasColumnType("numeric(6,2)");
        builder.Property(x => x.Reason).HasColumnName("reason").HasColumnType("text");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);
    }
}
