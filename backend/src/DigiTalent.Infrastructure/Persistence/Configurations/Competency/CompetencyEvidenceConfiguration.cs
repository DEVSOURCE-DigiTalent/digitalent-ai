using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyEvidence với bảng "competency_evidences".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyEvidenceConfiguration : IEntityTypeConfiguration<CompetencyEvidence>
{
    public void Configure(EntityTypeBuilder<CompetencyEvidence> builder)
    {
        builder.ToTable("competency_evidences");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.Score).HasPrecision(5, 2);
    }
}
