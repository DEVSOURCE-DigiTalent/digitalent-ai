using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CertificateVerificationLog với bảng "certificate_verification_logs".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CertificateVerificationLogConfiguration : IEntityTypeConfiguration<CertificateVerificationLog>
{
    public void Configure(EntityTypeBuilder<CertificateVerificationLog> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("certificate_verification_logs", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);
    }
}
