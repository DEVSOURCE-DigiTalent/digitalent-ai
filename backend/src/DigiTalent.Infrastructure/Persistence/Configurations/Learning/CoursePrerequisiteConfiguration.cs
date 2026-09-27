using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CoursePrerequisite với bảng "course_prerequisites".
/// </summary>
public class CoursePrerequisiteConfiguration : IEntityTypeConfiguration<CoursePrerequisite>
{
    public void Configure(EntityTypeBuilder<CoursePrerequisite> builder)
    {
        builder.ToTable("course_prerequisites");
        builder.HasKey(x => new { x.CourseId, x.PrerequisiteCourseId });
    }
}
