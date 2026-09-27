using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CourseLearningOutcome với bảng "course_learning_outcomes".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CourseLearningOutcomeConfiguration : IEntityTypeConfiguration<CourseLearningOutcome>
{
    public void Configure(EntityTypeBuilder<CourseLearningOutcome> builder)
    {
        builder.ToTable("course_learning_outcomes");
        builder.HasKey(x => x.Id);
    }
}
