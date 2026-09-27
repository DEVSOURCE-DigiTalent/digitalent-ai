using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyLevelCriterion với bảng "competency_level_criteria".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyLevelCriterionConfiguration : IEntityTypeConfiguration<CompetencyLevelCriterion>
{
    public void Configure(EntityTypeBuilder<CompetencyLevelCriterion> builder)
    {
        builder.ToTable("competency_level_criteria");
        builder.HasKey(x => x.Id);
    }
}
