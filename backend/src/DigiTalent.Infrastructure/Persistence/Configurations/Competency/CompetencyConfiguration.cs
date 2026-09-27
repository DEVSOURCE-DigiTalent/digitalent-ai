using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CompetencyConfiguration : IEntityTypeConfiguration<Competency>
{
    public void Configure(EntityTypeBuilder<Competency> builder)
    {
        builder.ToTable("competencies", table =>
        {
            table.HasCheckConstraint("ck_competencies_type", "competency_type IN ('CORE_DIGITAL','PROFESSIONAL','INTERNAL','BEHAVIOURAL')");
            table.HasCheckConstraint("ck_competencies_status", "status IN ('DRAFT','ACTIVE','ARCHIVED')");
        });

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code).IsRequired().HasMaxLength(80);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
        builder.Property(c => c.CompetencyType).IsRequired().HasMaxLength(30);
        builder.Property(c => c.Status).IsRequired().HasMaxLength(30);

        builder.HasIndex(c => new { c.CategoryId, c.Code })
            .IsUnique()
            .HasDatabaseName("uq_competencies_category_code");

        builder.HasOne(c => c.Category)
            .WithMany(cat => cat.Competencies)
            .HasForeignKey(c => c.CategoryId);
    }
}
