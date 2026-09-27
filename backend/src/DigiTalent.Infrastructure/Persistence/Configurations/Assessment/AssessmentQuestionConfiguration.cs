using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity AssessmentQuestion với bảng "assessment_questions".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class AssessmentQuestionConfiguration : IEntityTypeConfiguration<AssessmentQuestion>
{
    public void Configure(EntityTypeBuilder<AssessmentQuestion> builder)
    {
        builder.ToTable("assessment_questions");
        builder.HasKey(x => new { x.AssessmentId, x.QuestionId });

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.Points).HasPrecision(7, 2);
    }
}
