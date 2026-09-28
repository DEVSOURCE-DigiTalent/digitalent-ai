using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity AssignedTaskTarget với bảng "assigned_task_targets".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class AssignedTaskTargetConfiguration : IEntityTypeConfiguration<AssignedTaskTarget>
{
    public void Configure(EntityTypeBuilder<AssignedTaskTarget> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("assigned_task_targets", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.RubricSnapshot).HasColumnType("jsonb");
    }
}
