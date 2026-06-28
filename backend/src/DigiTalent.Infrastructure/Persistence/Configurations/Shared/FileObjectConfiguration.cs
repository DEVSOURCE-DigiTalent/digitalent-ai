using DigiTalent.Domain.Entities.Shared;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Shared;

public class FileObjectConfiguration : IEntityTypeConfiguration<FileObject>
{
    public void Configure(EntityTypeBuilder<FileObject> builder)
    {
        builder.ToTable("file_objects");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.BucketName).HasColumnName("bucket_name").HasMaxLength(120);
        builder.Property(x => x.ObjectKey).HasColumnName("object_key").HasColumnType("text");
        builder.Property(x => x.OriginalFileName).HasColumnName("original_file_name").HasMaxLength(255);
        builder.Property(x => x.ContentType).HasColumnName("content_type").HasMaxLength(120);
        builder.Property(x => x.FileSizeBytes).HasColumnName("file_size_bytes");
        builder.Property(x => x.ChecksumSha256).HasColumnName("checksum_sha256").HasMaxLength(128);
        builder.Property(x => x.AccessLevel).HasColumnName("access_level").HasMaxLength(30);
        builder.Property(x => x.RelatedEntityType).HasColumnName("related_entity_type").HasMaxLength(80);
        builder.Property(x => x.RelatedEntityId).HasColumnName("related_entity_id");
        builder.Property(x => x.UploadedByUserId).HasColumnName("uploaded_by_user_id");

        builder.HasIndex(x => x.ObjectKey)
            .IsUnique()
            .HasDatabaseName("ux_file_objects_object_key");
    }
}
