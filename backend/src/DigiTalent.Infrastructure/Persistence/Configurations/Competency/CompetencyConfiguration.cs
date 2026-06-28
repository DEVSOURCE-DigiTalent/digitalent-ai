using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Competency;

public class CompetencyConfiguration : IEntityTypeConfiguration<Domain.Entities.Competency.Competency>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Competency.Competency> builder)
    {
        builder.ToTable("competencies");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(80);

        builder.Property(x => x.Name)
            .HasMaxLength(255);

        builder.Property(x => x.Description)
            .HasColumnType("text");

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(x => x.CreatedAt)
            .HasColumnType("timestamptz");

        builder.Property(x => x.UpdatedAt)
            .HasColumnType("timestamptz");

        builder.HasIndex(x => new { x.CategoryId, x.Code })
            .IsUnique()
            .HasDatabaseName("ux_competencies_category_code");

        builder.HasOne(c => c.Category)
            .WithMany(cat => cat.Competencies)
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
