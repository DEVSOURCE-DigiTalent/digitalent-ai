using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity FileObject với bảng "file_objects".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class FileObjectConfiguration : IEntityTypeConfiguration<FileObject>
{
    public void Configure(EntityTypeBuilder<FileObject> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("file_objects", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);
    }
}
