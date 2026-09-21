using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Cấu hình bảng "departments". Tên cột tự đổi sang snake_case (CreatedAt → created_at).
/// </summary>
public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("departments");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(d => d.Code).IsUnique(); // database cũng chặn trùng mã

        builder.Property(d => d.Name).IsRequired().HasMaxLength(255);
        builder.Property(d => d.Description).HasMaxLength(1000);
    }
}
