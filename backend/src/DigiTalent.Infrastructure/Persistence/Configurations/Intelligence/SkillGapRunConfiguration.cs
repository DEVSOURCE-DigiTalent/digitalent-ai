using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity SkillGapRun với bảng "skill_gap_runs".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class SkillGapRunConfiguration : IEntityTypeConfiguration<SkillGapRun>
{
    public void Configure(EntityTypeBuilder<SkillGapRun> builder)
    {
        builder.ToTable("skill_gap_runs");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.SummarySnapshot).HasColumnType("jsonb");
    }
}
