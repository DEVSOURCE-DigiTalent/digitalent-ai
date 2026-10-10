using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.ToTable("lesson_progress", table =>
        {
            table.HasCheckConstraint("ck_lesson_progress_status",
                $"status IN ('{Statuses.LessonProgress.NotStarted}','{Statuses.LessonProgress.InProgress}','{Statuses.LessonProgress.Completed}')");
            table.HasCheckConstraint("ck_lesson_progress_percent",
                "progress_percent BETWEEN 0 AND 100");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
        builder.Property(x => x.ProgressPercent).HasPrecision(5, 2).HasDefaultValue(0m);

        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId);
        builder.HasOne<Lesson>().WithMany().HasForeignKey(x => x.LessonId);

        builder.HasIndex(x => new { x.EnrollmentId, x.LessonId })
            .IsUnique()
            .HasDatabaseName("uq_lesson_progress_enrollment_lesson");
    }
}
