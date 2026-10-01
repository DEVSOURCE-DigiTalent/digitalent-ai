using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity PracticalTaskTarget với bảng "practical_task_targets".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class PracticalTaskTargetConfiguration : IEntityTypeConfiguration<PracticalTaskTarget>
{
    public void Configure(EntityTypeBuilder<PracticalTaskTarget> builder)
    {
        builder.ToTable("practical_task_targets");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.RubricCriteria).HasColumnType("jsonb");
    }
}
