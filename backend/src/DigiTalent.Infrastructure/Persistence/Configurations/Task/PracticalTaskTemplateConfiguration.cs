using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity PracticalTaskTemplate với bảng "practical_task_templates".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class PracticalTaskTemplateConfiguration : IEntityTypeConfiguration<PracticalTaskTemplate>
{
    public void Configure(EntityTypeBuilder<PracticalTaskTemplate> builder)
    {
        builder.ToTable("practical_task_templates");
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.GeneralMarkingCriteria).HasColumnType("jsonb");
    }
}
