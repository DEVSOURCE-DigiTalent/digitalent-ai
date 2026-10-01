using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity LearningMaterial với bảng "learning_materials".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class LearningMaterialConfiguration : IEntityTypeConfiguration<LearningMaterial>
{
    public void Configure(EntityTypeBuilder<LearningMaterial> builder)
    {
        builder.ToTable("learning_materials");
        builder.HasKey(x => x.Id);
    }
}
