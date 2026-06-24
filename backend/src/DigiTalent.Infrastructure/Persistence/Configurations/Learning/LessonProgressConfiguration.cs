using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        builder.ToTable("lesson_progress");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.EnrollmentId)
            .HasColumnName("enrollment_id");

        builder.Property(x => x.LessonId)
            .HasColumnName("lesson_id");

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasColumnName("status");

        builder.Property(x => x.ProgressPercent)
            .HasColumnType("numeric(5,2)")
            .HasColumnName("progress_percent");

        builder.Property(x => x.LastAccessedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("last_accessed_at");

        builder.Property(x => x.CompletedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("completed_at");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("created_at");

        builder.Property(x => x.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz")
            .HasColumnName("updated_at");

        builder.Property(x => x.UpdatedBy)
            .HasColumnName("updated_by");

        builder.HasIndex(x => new { x.EnrollmentId, x.LessonId })
            .IsUnique()
            .HasDatabaseName("ux_lesson_progress");
    }
}
