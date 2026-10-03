using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CompetencyLevelCriterionConfiguration : IEntityTypeConfiguration<CompetencyLevelCriterion>
{
    public void Configure(EntityTypeBuilder<CompetencyLevelCriterion> builder)
    {
        builder.ToTable("competency_level_criteria", table =>
            table.HasCheckConstraint("ck_competency_level_criteria_level", "level BETWEEN 1 AND 3"));

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Level).IsRequired();
        builder.Property(c => c.IndicatorCode).IsRequired().HasMaxLength(60);
        builder.Property(c => c.BehaviorIndicator).IsRequired();
        builder.Property(c => c.SortOrder).HasDefaultValue(0);

        builder.HasIndex(c => new { c.CompetencyId, c.Level, c.IndicatorCode })
            .IsUnique()
            .HasDatabaseName("uq_competency_level_criteria");

        builder.HasOne(c => c.Competency)
            .WithMany(comp => comp.Criteria)
            .HasForeignKey(c => c.CompetencyId);
    }
}
