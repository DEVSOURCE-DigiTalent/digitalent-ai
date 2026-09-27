using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyEvaluationResult với bảng "competency_evaluation_results".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyEvaluationResultConfiguration : IEntityTypeConfiguration<CompetencyEvaluationResult>
{
    public void Configure(EntityTypeBuilder<CompetencyEvaluationResult> builder)
    {
        builder.ToTable("competency_evaluation_results");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.Score).HasPrecision(5, 2);
    }
}
