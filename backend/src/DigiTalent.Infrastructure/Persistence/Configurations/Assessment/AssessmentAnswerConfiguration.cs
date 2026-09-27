using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity AssessmentAnswer với bảng "assessment_answers".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class AssessmentAnswerConfiguration : IEntityTypeConfiguration<AssessmentAnswer>
{
    public void Configure(EntityTypeBuilder<AssessmentAnswer> builder)
    {
        builder.ToTable("assessment_answers");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.PointsAwarded).HasPrecision(7, 2);
    }
}
