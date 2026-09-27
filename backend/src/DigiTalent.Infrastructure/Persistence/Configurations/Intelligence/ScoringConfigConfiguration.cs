using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity ScoringConfig với bảng "scoring_configs".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class ScoringConfigConfiguration : IEntityTypeConfiguration<ScoringConfig>
{
    public void Configure(EntityTypeBuilder<ScoringConfig> builder)
    {
        builder.ToTable("scoring_configs");
        builder.HasKey(x => x.Id);
    }
}
