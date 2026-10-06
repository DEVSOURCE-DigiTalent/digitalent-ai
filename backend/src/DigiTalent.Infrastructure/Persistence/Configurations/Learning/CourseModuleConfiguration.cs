using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CourseModuleConfiguration : IEntityTypeConfiguration<CourseModule>
{
    public void Configure(EntityTypeBuilder<CourseModule> builder)
    {
        builder.ToTable("course_modules", table =>
        {
            table.HasCheckConstraint("ck_course_modules_estimated_minutes",
                "estimated_minutes IS NULL OR estimated_minutes >= 0");
            table.HasCheckConstraint("ck_course_modules_status",
                "status IN ('ACTIVE','ARCHIVED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(80);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("ACTIVE");
        builder.Property(x => x.IsRequired).HasDefaultValue(false);

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);

        builder.HasIndex(x => new { x.CourseId, x.SortOrder })
            .HasDatabaseName("ix_course_modules_course_sort_order");
    }
}
