using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity RolePermission với bảng "role_permissions".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions");
        // Khóa chính gồm 2 cột
        builder.HasKey(x => new { x.RoleId, x.PermissionId });

        builder.HasOne(x => x.Permission)
            .WithMany()
            .HasForeignKey(x => x.PermissionId);
    }
}
