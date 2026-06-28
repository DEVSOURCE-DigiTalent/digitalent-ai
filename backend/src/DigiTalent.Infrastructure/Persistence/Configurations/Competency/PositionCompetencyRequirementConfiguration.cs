using DigiTalent.Domain.Entities.Competency;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Competency;

public class PositionCompetencyRequirementConfiguration : IEntityTypeConfiguration<PositionCompetencyRequirement>
{
    public void Configure(EntityTypeBuilder<PositionCompetencyRequirement> builder)
    {
        builder.ToTable("position_competency_requirements");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Weight)
            .HasColumnType("numeric(5,2)");

        builder.Property(x => x.EffectiveFrom)
            .HasColumnType("date");

        builder.Property(x => x.EffectiveTo)
            .HasColumnType("date");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.JobPositionId, x.CompetencyId })
            .IsUnique()
            .HasDatabaseName("ux_position_competency_requirements_position_competency");

        builder.HasOne(x => x.JobPosition)
            .WithMany(jp => jp.CompetencyRequirements)
            .HasForeignKey(x => x.JobPositionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Competency)
            .WithMany()
            .HasForeignKey(x => x.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
