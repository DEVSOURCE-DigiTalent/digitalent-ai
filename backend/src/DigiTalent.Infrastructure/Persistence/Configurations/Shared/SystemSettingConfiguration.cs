using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.ToTable("system_settings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Key).IsRequired().HasMaxLength(150);
        builder.Property(s => s.Value).IsRequired().HasColumnType("jsonb");

        // Key không trùng: 1 bộ cho cấu hình toàn cục, 1 bộ cho từng tổ chức
        builder.HasIndex(s => s.Key)
            .IsUnique()
            .HasFilter("organization_id IS NULL")
            .HasDatabaseName("ux_system_settings_global");
        builder.HasIndex(s => new { s.OrganizationId, s.Key })
            .IsUnique()
            .HasFilter("organization_id IS NOT NULL")
            .HasDatabaseName("ux_system_settings_per_org");

        builder.HasOne<Organization>().WithMany().HasForeignKey(s => s.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(s => s.UpdatedByUserId);
    }
}
