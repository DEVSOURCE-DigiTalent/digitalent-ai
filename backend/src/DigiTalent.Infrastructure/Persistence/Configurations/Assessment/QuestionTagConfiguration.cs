using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class QuestionTagConfiguration : IEntityTypeConfiguration<QuestionTag>
{
    public void Configure(EntityTypeBuilder<QuestionTag> builder)
    {
        builder.ToTable("question_tags");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.OrganizationId).HasColumnName("organization_id");
        builder.Property(x => x.Name).HasColumnName("name").HasMaxLength(100);
        builder.Property(x => x.Category).HasColumnName("category").HasMaxLength(30);

        builder.HasIndex(x => new { x.OrganizationId, x.Name }).IsUnique();
    }
}
