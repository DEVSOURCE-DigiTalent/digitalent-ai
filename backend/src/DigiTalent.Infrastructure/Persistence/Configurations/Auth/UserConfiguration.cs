using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Bảng "users" — khớp SQL v2.3. Tên cột tự đổi sang snake_case (DisplayName → display_name).
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", table =>
        {
            table.HasCheckConstraint("ck_users_status", "status IN ('ACTIVE','INACTIVE','LOCKED')");
            table.HasCheckConstraint("ck_users_failed_login_count", "failed_login_count >= 0");
        });

        builder.HasKey(u => u.Id);

        // Email luôn lưu chữ thường (use case chuẩn hóa) → unique thường = unique không phân biệt hoa/thường
        builder.Property(u => u.Email).IsRequired().HasMaxLength(255);
        builder.HasIndex(u => u.Email).IsUnique().HasDatabaseName("ux_users_email_normalized");

        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(u => u.Status).IsRequired().HasMaxLength(30);
        builder.Property(u => u.FailedLoginCount).HasDefaultValue(0);

        // uint + IsRowVersion → Npgsql dùng cột hệ thống xmin làm concurrency token (không thêm cột)
        builder.Property(u => u.Version).IsRowVersion();

        builder.HasOne<Organization>().WithMany().HasForeignKey(u => u.OrganizationId);
    }
}
