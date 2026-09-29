using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CompetencyFrameworkMapping với bảng "competency_framework_mappings"
/// (năng lực nội bộ ↔ mã năng lực của khung bên ngoài, ví dụ 4.2 của Thông tư 02/2025).
/// </summary>
public class CompetencyFrameworkMappingConfiguration : IEntityTypeConfiguration<CompetencyFrameworkMapping>
{
    public void Configure(EntityTypeBuilder<CompetencyFrameworkMapping> builder)
    {
        builder.ToTable("competency_framework_mappings", table =>
        {
            table.HasCheckConstraint("ck_competency_framework_mapping_relationship",
                "relationship IN ('DIRECT','STRONG_OVERLAP','PARTIAL_OVERLAP')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceAreaCode).HasMaxLength(50);
        builder.Property(x => x.SourceCode).IsRequired().HasMaxLength(100);
        builder.Property(x => x.SourceName).HasMaxLength(250);
        builder.Property(x => x.SourceLevelText).HasMaxLength(100);
        builder.Property(x => x.Relationship).IsRequired().HasMaxLength(30);
        builder.Property(x => x.IsPrimary).HasDefaultValue(false);

        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);
        builder.HasOne<CompetencyFramework>().WithMany().HasForeignKey(x => x.FrameworkId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewedByUserId);

        builder.HasIndex(x => new { x.CompetencyId, x.FrameworkId, x.SourceCode })
            .IsUnique()
            .HasDatabaseName("uq_competency_framework_mapping");
    }
}
