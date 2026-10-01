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
        builder.ToTable("lesson_learning_outcomes");
        builder.HasKey(x => new { x.LessonId, x.LearningOutcomeId });
    }
}
