using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class QuestionTagAssignmentConfiguration : IEntityTypeConfiguration<QuestionTagAssignment>
{
    public void Configure(EntityTypeBuilder<QuestionTagAssignment> builder)
    {
        builder.ToTable("question_tag_assignments");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.QuestionId).HasColumnName("question_id");
        builder.Property(x => x.TagId).HasColumnName("tag_id");

        builder.HasOne(x => x.Question)
            .WithMany(q => q.TagAssignments)
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Tag)
            .WithMany(t => t.TagAssignments)
            .HasForeignKey(x => x.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.QuestionId, x.TagId }).IsUnique();
    }
}
