using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees", table =>
        {
            table.HasCheckConstraint("ck_employees_status", "status IN ('ACTIVE','INACTIVE','TRANSFERRED','ARCHIVED')");
            table.HasCheckConstraint("ck_employees_not_own_manager", "direct_manager_id IS NULL OR direct_manager_id <> id");
        });

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EmployeeCode).IsRequired().HasMaxLength(50);
        builder.HasIndex(e => new { e.OrganizationId, e.EmployeeCode }).IsUnique();

        builder.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Phone).HasMaxLength(50);
        builder.Property(e => e.Status).IsRequired().HasMaxLength(30);

        // Work email lưu chữ thường; không trùng trong 1 tổ chức (bỏ qua dòng NULL)
        builder.Property(e => e.WorkEmail).HasMaxLength(255);
        builder.HasIndex(e => new { e.OrganizationId, e.WorkEmail })
            .IsUnique()
            .HasFilter("work_email IS NOT NULL")
            .HasDatabaseName("ux_employees_work_email_per_org");

        // 1 tài khoản đăng nhập gắn tối đa 1 hồ sơ nhân sự
        builder.HasIndex(e => e.UserId).IsUnique();

        builder.HasOne<Organization>().WithMany().HasForeignKey(e => e.OrganizationId);
        builder.HasOne<User>().WithMany().HasForeignKey(e => e.UserId);
        builder.HasOne<Department>().WithMany().HasForeignKey(e => e.DepartmentId);
        builder.HasOne<JobPosition>().WithMany().HasForeignKey(e => e.JobPositionId);
        builder.HasOne<Employee>().WithMany().HasForeignKey(e => e.DirectManagerId);

        builder.HasIndex(e => new { e.DepartmentId, e.Status }).HasDatabaseName("ix_employees_department_status");
        builder.HasIndex(e => e.JobPositionId).HasDatabaseName("ix_employees_job_position");
        builder.HasIndex(e => e.DirectManagerId).HasDatabaseName("ix_employees_direct_manager");
    }
}
