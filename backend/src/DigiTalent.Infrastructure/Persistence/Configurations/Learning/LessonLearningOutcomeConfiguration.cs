using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity LessonLearningOutcome với bảng "lesson_learning_outcomes".
/// </summary>
public class LessonLearningOutcomeConfiguration : IEntityTypeConfiguration<LessonLearningOutcome>
{
    public void Configure(EntityTypeBuilder<LessonLearningOutcome> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("lesson_learning_outcomes", table => table.ExcludeFromMigrations());
        builder.HasKey(x => new { x.LessonId, x.LearningOutcomeId });
    }
}
