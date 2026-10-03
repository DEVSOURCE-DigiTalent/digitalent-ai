using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class PositionRequirementSetConfiguration : IEntityTypeConfiguration<PositionRequirementSet>
{
    public void Configure(EntityTypeBuilder<PositionRequirementSet> builder)
    {
        builder.ToTable("position_requirement_sets", table =>
        {
            table.HasCheckConstraint("ck_position_requirement_sets_version", "version_no > 0");
            table.HasCheckConstraint("ck_position_requirement_sets_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
            table.HasCheckConstraint("ck_position_requirement_sets_dates", "effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from");
            table.HasCheckConstraint("ck_position_requirement_sets_row_version", "row_version > 0");
        });

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Status).IsRequired().HasMaxLength(30);
        builder.Property(s => s.RowVersion).HasDefaultValue(1L);

        builder.HasIndex(s => new { s.JobPositionId, s.VersionNo })
            .IsUnique()
            .HasDatabaseName("uq_position_requirement_sets_position_version");

        builder.HasIndex(s => s.JobPositionId)
            .IsUnique()
            .HasFilter("status = 'ACTIVE'")
            .HasDatabaseName("ux_requirement_sets_one_active");

        builder.HasOne(s => s.JobPosition)
            .WithMany()
            .HasForeignKey(s => s.JobPositionId);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.CreatedByUserId);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(s => s.ActivatedByUserId)
            .IsRequired(false);
    }
}
