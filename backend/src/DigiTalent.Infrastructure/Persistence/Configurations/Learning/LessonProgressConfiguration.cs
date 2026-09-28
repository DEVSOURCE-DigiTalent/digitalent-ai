using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity LessonProgress với bảng "lesson_progress".
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class LessonProgressConfiguration : IEntityTypeConfiguration<LessonProgress>
{
    public void Configure(EntityTypeBuilder<LessonProgress> builder)
    {
        // Chưa có config đầy đủ theo SQL v2.3 → chưa tạo bảng. Người phụ trách module viết config rồi bỏ ExcludeFromMigrations.
        builder.ToTable("lesson_progress", table => table.ExcludeFromMigrations());
        builder.HasKey(x => x.Id);

        // Cột đặc biệt (jsonb / số thập phân): phải khai báo đúng kiểu
        builder.Property(x => x.ProgressPercent).HasPrecision(5, 2);
    }
}
