using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class PositionRequirementItemConfiguration : IEntityTypeConfiguration<PositionRequirementItem>
{
    public void Configure(EntityTypeBuilder<PositionRequirementItem> builder)
    {
        builder.ToTable("position_requirement_items", table =>
        {
            table.HasCheckConstraint("ck_position_required_level", "required_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_position_weight", "weight_percent > 0 AND weight_percent <= 100");
        });

        builder.HasKey(i => i.Id);

        builder.Property(i => i.RequiredLevel).IsRequired();
        builder.Property(i => i.WeightPercent).HasPrecision(5, 2);
        builder.Property(i => i.IsMandatory).HasDefaultValue(true);
        builder.Property(i => i.RequiresPracticalEvidence).HasDefaultValue(true);

        builder.HasIndex(i => new { i.RequirementSetId, i.CompetencyId })
            .IsUnique()
            .HasDatabaseName("uq_position_requirement_items_set_competency");

        builder.HasIndex(i => i.CompetencyId)
            .HasDatabaseName("ix_position_requirement_items_competency");

        builder.HasOne(i => i.RequirementSet)
            .WithMany(s => s.Items)
            .HasForeignKey(i => i.RequirementSetId);

        builder.HasOne(i => i.Competency)
            .WithMany()
            .HasForeignKey(i => i.CompetencyId);
    }
}
