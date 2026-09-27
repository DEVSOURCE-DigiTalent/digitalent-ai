using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity UserRole với bảng "user_roles".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");
        // Khóa chính gồm 2 cột
        builder.HasKey(x => new { x.UserId, x.RoleId });
    }
}
