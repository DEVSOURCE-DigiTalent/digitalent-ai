using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyFrameworkMapping với bảng "competency_framework_mappings".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyFrameworkMappingConfiguration : IEntityTypeConfiguration<CompetencyFrameworkMapping>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkMapping> builder)
    {
        builder.ToTable("competency_framework_mappings");
        builder.HasKey(x => x.Id);
    }
}
