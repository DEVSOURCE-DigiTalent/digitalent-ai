using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Bảng "departments" — khớp SQL v2.3. Tên cột tự đổi sang snake_case (CreatedAt → created_at).
/// </summary>
public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("departments", table =>
        {
            table.HasCheckConstraint("ck_departments_status", "status IN ('ACTIVE','INACTIVE','ARCHIVED')");
            table.HasCheckConstraint("ck_departments_not_own_parent", "parent_department_id IS NULL OR parent_department_id <> id");
        });

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Code).IsRequired().HasMaxLength(50);
        builder.HasIndex(d => new { d.OrganizationId, d.Code }).IsUnique(); // mã không trùng trong 1 tổ chức

        builder.Property(d => d.Name).IsRequired().HasMaxLength(180);
        builder.Property(d => d.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Organization>().WithMany().HasForeignKey(d => d.OrganizationId);
        builder.HasOne<Department>().WithMany().HasForeignKey(d => d.ParentDepartmentId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(d => d.ManagerEmployeeId);

        builder.HasIndex(d => d.ParentDepartmentId).HasDatabaseName("ix_departments_parent");
    }
}
