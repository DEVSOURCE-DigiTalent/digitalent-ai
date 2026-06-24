using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class AssessmentQuestionConfiguration : IEntityTypeConfiguration<AssessmentQuestion>
{
    public void Configure(EntityTypeBuilder<AssessmentQuestion> builder)
    {
        builder.ToTable("assessment_questions");

        builder.HasKey(x => new { x.AssessmentId, x.QuestionId });

        builder.Property(x => x.AssessmentId).HasColumnName("assessment_id");
        builder.Property(x => x.QuestionId).HasColumnName("question_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");
        builder.Property(x => x.ScoreWeight).HasColumnName("score_weight").HasColumnType("numeric(6,2)");
        builder.Property(x => x.SortOrder).HasColumnName("sort_order");

        builder.HasOne(aq => aq.Assessment)
            .WithMany(a => a.AssessmentQuestions)
            .HasForeignKey(aq => aq.AssessmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(aq => aq.Question)
            .WithMany()
            .HasForeignKey(aq => aq.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
