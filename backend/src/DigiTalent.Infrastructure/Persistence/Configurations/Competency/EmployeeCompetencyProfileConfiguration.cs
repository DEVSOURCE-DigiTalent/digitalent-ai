using DigiTalent.Domain.Entities.Competency;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Competency;

public class EmployeeCompetencyProfileConfiguration : IEntityTypeConfiguration<EmployeeCompetencyProfile>
{
    public void Configure(EntityTypeBuilder<EmployeeCompetencyProfile> builder)
    {
        builder.ToTable("employee_competency_profiles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ConfidenceScore)
            .HasColumnType("numeric(5,2)");

        builder.Property(x => x.LastEvaluatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.EmployeeId, x.CompetencyId })
            .IsUnique()
            .HasDatabaseName("ux_employee_competency");

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Competency)
            .WithMany()
            .HasForeignKey(x => x.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.LastEvidence)
            .WithMany()
            .HasForeignKey(x => x.LastEvidenceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
