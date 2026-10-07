using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Map entity FileObject với bảng "file_objects": metadata tệp, object_key = đường dẫn trong kho lưu trữ.</summary>
public class FileObjectConfiguration : IEntityTypeConfiguration<FileObject>
{
    public void Configure(EntityTypeBuilder<FileObject> builder)
    {
        builder.ToTable("file_objects", table =>
        {
            table.HasCheckConstraint("ck_file_objects_size", "size_bytes >= 0");
            table.HasCheckConstraint("ck_file_objects_access_level", "access_level IN ('PRIVATE','INTERNAL','PUBLIC_VERIFY')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Bucket).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ObjectKey).IsRequired().HasMaxLength(500);
        builder.Property(x => x.OriginalName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.MimeType).HasMaxLength(150);
        builder.Property(x => x.Checksum).HasMaxLength(128);
        builder.Property(x => x.AccessLevel).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.UploadedByUserId);

        builder.HasIndex(x => x.ObjectKey).IsUnique();
    }
}
