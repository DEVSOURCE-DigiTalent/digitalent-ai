using DigiTalent.Domain.Entities.Organization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Organization;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("employees");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeCode)
            .HasMaxLength(80);

        builder.Property(x => x.FullName)
            .HasMaxLength(255);

        builder.Property(x => x.Email)
            .HasMaxLength(255);

        builder.Property(x => x.Phone)
            .HasMaxLength(50);

        builder.Property(x => x.EmploymentStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.JoinedAt)
            .HasColumnType("date");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.OrganizationId, x.EmployeeCode })
            .IsUnique()
            .HasDatabaseName("ux_employees_org_code");

        builder.HasIndex(x => x.DepartmentId)
            .HasDatabaseName("ix_employees_department");

        builder.HasIndex(x => x.UserId)
            .IsUnique()
            .HasDatabaseName("ix_employees_user_id");

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.JobPosition)
            .WithMany()
            .HasForeignKey(e => e.JobPositionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.DirectManager)
            .WithMany()
            .HasForeignKey(e => e.DirectManagerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
