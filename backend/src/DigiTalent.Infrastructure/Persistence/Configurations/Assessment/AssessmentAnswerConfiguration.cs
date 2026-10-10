using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class AssessmentAnswerConfiguration : IEntityTypeConfiguration<AssessmentAnswer>
{
    public void Configure(EntityTypeBuilder<AssessmentAnswer> builder)
    {
        builder.ToTable("assessment_answers", table =>
        {
            table.HasCheckConstraint("ck_assessment_answers_points_awarded",
                "points_awarded IS NULL OR points_awarded >= 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PointsAwarded).HasPrecision(7, 2);

        builder.HasIndex(x => new { x.AttemptId, x.QuestionId })
            .IsUnique()
            .HasDatabaseName("uq_assessment_answers_attempt_question");

        builder.HasOne<AssessmentAttempt>().WithMany().HasForeignKey(x => x.AttemptId);
        builder.HasOne<Question>().WithMany().HasForeignKey(x => x.QuestionId);
        builder.HasOne<QuestionOption>().WithMany().HasForeignKey(x => x.SelectedOptionId);
    }
}
