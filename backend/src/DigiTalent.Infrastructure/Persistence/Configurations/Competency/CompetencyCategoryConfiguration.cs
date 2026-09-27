using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyCategory với bảng "competency_categories".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyCategoryConfiguration : IEntityTypeConfiguration<CompetencyCategory>
{
    public void Configure(EntityTypeBuilder<CompetencyCategory> builder)
    {
        builder.ToTable("competency_categories");
        builder.HasKey(x => x.Id);
    }
}
