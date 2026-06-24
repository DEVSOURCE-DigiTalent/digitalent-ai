using DigiTalent.Domain.Entities.Learning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Learning;

public class LearningMaterialConfiguration : IEntityTypeConfiguration<LearningMaterial>
{
    public void Configure(EntityTypeBuilder<LearningMaterial> builder)
    {
        builder.ToTable("learning_materials");

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.CourseId)
            .HasColumnName("course_id");

        builder.Property(x => x.LessonId)
            .HasColumnName("lesson_id");

        builder.Property(x => x.FileObjectId)
            .HasColumnName("file_object_id");

        builder.Property(x => x.MaterialType)
            .HasMaxLength(30)
            .HasColumnName("material_type");

        builder.Property(x => x.ExternalUrl)
            .HasColumnType("text")
            .HasColumnName("external_url");

        builder.Property(x => x.Title)
            .HasMaxLength(255)
            .HasColumnName("title");

        builder.Property(x => x.SortOrder)
            .HasColumnName("sort_order");

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
