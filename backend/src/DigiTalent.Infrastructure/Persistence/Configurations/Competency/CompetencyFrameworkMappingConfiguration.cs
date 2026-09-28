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
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("competency_framework_mappings", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);
    }
}
