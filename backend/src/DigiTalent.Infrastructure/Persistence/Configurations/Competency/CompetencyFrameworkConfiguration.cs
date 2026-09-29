using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyFramework với bảng "competency_frameworks" (khung năng lực bên ngoài, ví dụ Thông tư 02/2025).
/// Database là gốc: tên cột tự đổi sang snake_case, không khai báo lại ở đây.
/// </summary>
public class CompetencyFrameworkConfiguration : IEntityTypeConfiguration<CompetencyFramework>
{
    public void Configure(EntityTypeBuilder<CompetencyFramework> builder)
    {
        builder.ToTable("competency_frameworks");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(60);
        builder.Property(x => x.Version).IsRequired().HasMaxLength(60);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(250);
        builder.Property(x => x.Authority).HasMaxLength(200);
        builder.Property(x => x.Jurisdiction).HasMaxLength(40);
        // DEFAULT true trong SQL; entity luôn gán giá trị nên sentinel = true để EF vẫn gửi false khi cần.
        builder.Property(x => x.IsActive).HasDefaultValue(true).HasSentinel(true);

        builder.HasIndex(x => new { x.Code, x.Version })
            .IsUnique()
            .HasDatabaseName("uq_competency_frameworks_code_version");
    }
}
