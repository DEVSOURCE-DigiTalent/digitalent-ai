using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CoursePrerequisite với bảng "course_prerequisites" (khóa -I cần -F, khóa -A cần -I cùng miền).
/// </summary>
public class CoursePrerequisiteConfiguration : IEntityTypeConfiguration<CoursePrerequisite>
{
    public void Configure(EntityTypeBuilder<CoursePrerequisite> builder)
    {
        builder.ToTable("course_prerequisites", table =>
        {
            table.HasCheckConstraint("ck_course_prerequisite_not_self", "course_id <> prerequisite_course_id");
        });
        builder.HasKey(x => new { x.CourseId, x.PrerequisiteCourseId });

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.PrerequisiteCourseId);
    }
}
