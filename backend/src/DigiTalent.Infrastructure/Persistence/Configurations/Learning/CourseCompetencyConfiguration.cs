using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CourseCompetency với bảng "course_competencies".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CourseCompetencyConfiguration : IEntityTypeConfiguration<CourseCompetency>
{
    public void Configure(EntityTypeBuilder<CourseCompetency> builder)
    {
        builder.ToTable("course_competencies");
        builder.HasKey(x => new { x.CourseId, x.CompetencyId });

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.CoverageWeight).HasPrecision(5, 2);
    }
}
