using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity ScoringConfigItem với bảng "scoring_config_items".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class ScoringConfigItemConfiguration : IEntityTypeConfiguration<ScoringConfigItem>
{
    public void Configure(EntityTypeBuilder<ScoringConfigItem> builder)
    {
        builder.ToTable("scoring_config_items");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.MaxValue).HasPrecision(8, 2);
        builder.Property(x => x.MinValue).HasPrecision(8, 2);
        builder.Property(x => x.Weight).HasPrecision(6, 4);
    }
}
