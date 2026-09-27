using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CourseAssignment với bảng "course_assignments".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CourseAssignmentConfiguration : IEntityTypeConfiguration<CourseAssignment>
{
    public void Configure(EntityTypeBuilder<CourseAssignment> builder)
    {
        builder.ToTable("course_assignments");
        builder.HasKey(x => x.Id);
    }
}
