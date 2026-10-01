using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyFramework với bảng "competency_frameworks".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyFrameworkConfiguration : IEntityTypeConfiguration<CompetencyFramework>
{
    public void Configure(EntityTypeBuilder<CompetencyFramework> builder)
    {
        builder.ToTable("competency_frameworks");
        builder.HasKey(x => x.Id);
    }
}
