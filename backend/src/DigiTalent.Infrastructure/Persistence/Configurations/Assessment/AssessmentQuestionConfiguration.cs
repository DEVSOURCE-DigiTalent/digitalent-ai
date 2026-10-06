using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class AssessmentQuestionConfiguration : IEntityTypeConfiguration<AssessmentQuestion>
{
    public void Configure(EntityTypeBuilder<AssessmentQuestion> builder)
    {
        builder.ToTable("assessment_questions", table =>
        {
            table.HasCheckConstraint("ck_assessment_questions_points", "points > 0");
        });
        builder.HasKey(x => new { x.AssessmentId, x.QuestionId });

        builder.Property(x => x.Points).HasPrecision(7, 2);

        builder.HasOne<Assessment>().WithMany().HasForeignKey(x => x.AssessmentId);
        builder.HasOne<Question>().WithMany().HasForeignKey(x => x.QuestionId);
    }
}
