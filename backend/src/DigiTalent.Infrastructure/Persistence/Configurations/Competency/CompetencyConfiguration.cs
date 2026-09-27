using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Competency với bảng "competencies".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyConfiguration : IEntityTypeConfiguration<Competency>
{
    public void Configure(EntityTypeBuilder<Competency> builder)
    {
        builder.ToTable("competencies");
        builder.HasKey(x => x.Id);
    }
}
