using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Certificate với bảng "certificates".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CertificateConfiguration : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("certificates", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);
    }
}
