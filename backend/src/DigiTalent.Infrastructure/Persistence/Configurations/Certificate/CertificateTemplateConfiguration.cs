using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CertificateTemplate với bảng "certificate_templates".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CertificateTemplateConfiguration : IEntityTypeConfiguration<CertificateTemplate>
{
    public void Configure(EntityTypeBuilder<CertificateTemplate> builder)
    {
        builder.ToTable("certificate_templates");
        builder.HasKey(x => x.Id);
    }
}
