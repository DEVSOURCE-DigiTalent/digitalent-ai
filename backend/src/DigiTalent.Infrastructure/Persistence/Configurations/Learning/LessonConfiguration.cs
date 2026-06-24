using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.ToTable("lessons");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.ModuleId)
            .HasColumnName("module_id");

        builder.Property(x => x.Title)
            .HasMaxLength(255)
            .HasColumnName("title");

        builder.Property(x => x.ContentType)
            .HasMaxLength(30)
            .HasColumnName("content_type");

        builder.Property(x => x.ContentBody)
            .HasColumnType("text")
            .HasColumnName("content_body");

        builder.Property(x => x.EstimatedMinutes)
            .HasColumnName("estimated_minutes");

        builder.Property(x => x.SortOrder)
            .HasColumnName("sort_order");

        builder.Property(x => x.IsRequired)
            .HasColumnName("is_required");

        builder.Property(x => x.Status)
            .HasMaxLength(30)
            .HasColumnName("status");

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
    }
}
