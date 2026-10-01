using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity TaskEvaluation với bảng "task_evaluations".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class TaskEvaluationConfiguration : IEntityTypeConfiguration<TaskEvaluation>
{
    public void Configure(EntityTypeBuilder<TaskEvaluation> builder)
    {
        builder.ToTable("task_evaluations");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.OverallScore).HasPrecision(5, 2);
    }
}
