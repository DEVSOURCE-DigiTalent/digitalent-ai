using DigiTalent.Domain.Entities.Competency;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Competency;

public class CompetencyLevelConfiguration : IEntityTypeConfiguration<CompetencyLevel>
{
    public void Configure(EntityTypeBuilder<CompetencyLevel> builder)
    {
        builder.ToTable("competency_levels");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(120);

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.AchievementCriteria)
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");
    }
}
