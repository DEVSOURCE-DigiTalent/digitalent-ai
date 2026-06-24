using DigiTalent.Domain.Entities.Competency;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Competency;

public class CompetencyEvidenceConfiguration : IEntityTypeConfiguration<CompetencyEvidence>
{
    public void Configure(EntityTypeBuilder<CompetencyEvidence> builder)
    {
        builder.ToTable("competency_evidences");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EvidenceType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.SourceEntityType)
            .HasMaxLength(80);

        builder.Property(x => x.EvidenceScore)
            .HasColumnType("numeric(5,2)");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.Notes)
            .HasColumnType("text");

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.EmployeeId, x.CompetencyId })
            .HasDatabaseName("ix_evidence_employee_competency");

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Competency)
            .WithMany()
            .HasForeignKey(x => x.CompetencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
