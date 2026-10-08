using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Học liệu của bài học: đúng 1 nguồn — tệp (FILE) hoặc đường dẫn (LINK).</summary>
public class LearningMaterialConfiguration : IEntityTypeConfiguration<LearningMaterial>
{
    public void Configure(EntityTypeBuilder<LearningMaterial> builder)
    {
        builder.ToTable("learning_materials", table =>
        {
            table.HasCheckConstraint("ck_learning_materials_type", "material_type IN ('FILE','LINK')");
            table.HasCheckConstraint(
                "ck_learning_materials_exactly_one_source",
                "(material_type = 'FILE' AND file_object_id IS NOT NULL AND external_url IS NULL) OR " +
                "(material_type = 'LINK' AND external_url IS NOT NULL AND file_object_id IS NULL)");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.MaterialType).IsRequired().HasMaxLength(30);

        builder.HasOne<Lesson>().WithMany().HasForeignKey(x => x.LessonId);
        builder.HasOne<FileObject>().WithMany().HasForeignKey(x => x.FileObjectId);
    }
}
