using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.ToTable("lessons", table =>
        {
            table.HasCheckConstraint("ck_lessons_type",
                "lesson_type IN ('TEXT','VIDEO','CASE_STUDY','GUIDED_PRACTICE','WORKPLACE_SCENARIO','QUIZ','REFLECTION','ASSIGNMENT')");
            table.HasCheckConstraint("ck_lessons_completion_rule",
                "completion_rule IN ('VIEW','MANUAL_COMPLETE','PASS_CHECK','SUBMIT_ACTIVITY')");
            table.HasCheckConstraint("ck_lessons_estimated_minutes",
                "estimated_minutes IS NULL OR estimated_minutes >= 0");
            table.HasCheckConstraint("ck_lessons_status",
                "status IN ('ACTIVE','ARCHIVED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).HasMaxLength(80);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.LessonType).IsRequired().HasMaxLength(30).HasDefaultValue("TEXT");
        builder.Property(x => x.CompletionRule).IsRequired().HasMaxLength(50).HasDefaultValue("VIEW");
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("ACTIVE");
        builder.Property(x => x.IsRequired).HasDefaultValue(false);

        builder.HasOne<CourseModule>().WithMany().HasForeignKey(x => x.ModuleId);

        builder.HasIndex(x => new { x.ModuleId, x.SortOrder })
            .HasDatabaseName("ix_lessons_module_sort_order");
    }
}
