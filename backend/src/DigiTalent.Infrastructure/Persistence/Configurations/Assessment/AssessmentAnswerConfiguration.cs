using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class AssessmentAnswerConfiguration : IEntityTypeConfiguration<AssessmentAnswer>
{
    public void Configure(EntityTypeBuilder<AssessmentAnswer> builder)
    {
        builder.ToTable("assessment_answers");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.AttemptId).HasColumnName("attempt_id");
        builder.Property(x => x.QuestionId).HasColumnName("question_id");
        builder.Property(x => x.SelectedOptionId).HasColumnName("selected_option_id");
        builder.Property(x => x.AnswerText).HasColumnName("answer_text").HasColumnType("text");
        builder.Property(x => x.IsCorrect).HasColumnName("is_correct");
        builder.Property(x => x.ScoreAwarded).HasColumnName("score_awarded").HasColumnType("numeric(6,2)");
        builder.Property(x => x.GradedByUserId).HasColumnName("graded_by_user_id");

        builder.HasOne(a => a.Attempt)
            .WithMany(at => at.Answers)
            .HasForeignKey(a => a.AttemptId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
