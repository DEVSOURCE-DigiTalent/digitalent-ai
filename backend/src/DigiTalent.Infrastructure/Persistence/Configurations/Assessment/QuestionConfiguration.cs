using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("questions", table =>
        {
            table.HasCheckConstraint("ck_questions_type",
                "question_type IN ('MULTIPLE_CHOICE','TRUE_FALSE')");
            table.HasCheckConstraint("ck_questions_status",
                "status IN ('DRAFT','APPROVED','ARCHIVED')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.QuestionType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Difficulty).HasMaxLength(30);
        builder.Property(x => x.Content).IsRequired();
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<QuestionBank>().WithMany().HasForeignKey(x => x.BankId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);
    }
}
