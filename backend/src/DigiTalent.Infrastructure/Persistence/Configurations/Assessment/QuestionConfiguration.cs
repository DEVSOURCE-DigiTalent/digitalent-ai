using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.BankId).HasColumnName("bank_id");
        builder.Property(x => x.CompetencyId).HasColumnName("competency_id");
        builder.Property(x => x.QuestionType).HasColumnName("question_type").HasMaxLength(30);
        builder.Property(x => x.Difficulty).HasColumnName("difficulty").HasMaxLength(30);
        builder.Property(x => x.Content).HasColumnName("content").HasColumnType("text");
        builder.Property(x => x.Explanation).HasColumnName("explanation").HasColumnType("text");
        builder.Property(x => x.AiGeneratedFlag).HasColumnName("ai_generated_flag");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);

        builder.HasMany(q => q.Options)
            .WithOne(o => o.Question)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
