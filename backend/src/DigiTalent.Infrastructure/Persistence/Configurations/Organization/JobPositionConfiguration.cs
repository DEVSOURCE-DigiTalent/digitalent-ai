using DigiTalent.Domain.Entities.Organization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Organization;

public class JobPositionConfiguration : IEntityTypeConfiguration<JobPosition>
{
    public void Configure(EntityTypeBuilder<JobPosition> builder)
    {
        builder.ToTable("job_positions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(80);

        builder.Property(x => x.Title)
            .HasMaxLength(255);

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.LevelName)
            .HasMaxLength(80);

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.OrganizationId, x.Code })
            .IsUnique()
            .HasDatabaseName("ux_positions_org_code");

        builder.HasMany(jp => jp.CompetencyRequirements)
            .WithOne(cr => cr.JobPosition)
            .HasForeignKey(cr => cr.JobPositionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
