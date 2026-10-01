using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity SkillGapItem với bảng "skill_gap_items".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class SkillGapItemConfiguration : IEntityTypeConfiguration<SkillGapItem>
{
    public void Configure(EntityTypeBuilder<SkillGapItem> builder)
    {
        builder.ToTable("skill_gap_items");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.MandatoryMultiplier).HasPrecision(4, 2);
        builder.Property(x => x.PriorityScore).HasPrecision(8, 2);
        builder.Property(x => x.WeightPercent).HasPrecision(5, 2);
    }
}
