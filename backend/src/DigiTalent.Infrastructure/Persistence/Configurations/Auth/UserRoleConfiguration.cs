using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Bảng nối "user_roles" — khóa kép (user_id, role_id).
/// </summary>
public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("user_roles");

        builder.HasKey(ur => new { ur.UserId, ur.RoleId });

        builder.HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        builder.HasOne(ur => ur.Role).WithMany().HasForeignKey(ur => ur.RoleId);
        builder.HasOne<User>().WithMany().HasForeignKey(ur => ur.AssignedByUserId);

        builder.HasIndex(ur => ur.RoleId).HasDatabaseName("ix_user_roles_role");
    }
}
