using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

public class CourseLearningOutcomeConfiguration : IEntityTypeConfiguration<CourseLearningOutcome>
{
    public void Configure(EntityTypeBuilder<CourseLearningOutcome> builder)
    {
        builder.ToTable("course_learning_outcomes", table =>
        {
            table.HasCheckConstraint("ck_course_learning_outcomes_level", "target_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_course_learning_outcomes_type", "outcome_type IN ('KNOWLEDGE','SKILL','ATTITUDE')");
            table.HasCheckConstraint(
                "ck_course_learning_outcomes_source_type",
                "source_type IN ('OFFICIAL_FRAMEWORK','DIGITALENT_ADAPTATION','LOCAL_CONTEXT')");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(80);
        builder.Property(x => x.OutcomeType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.Statement).IsRequired();
        builder.Property(x => x.SourceType).IsRequired().HasMaxLength(40);
        builder.Property(x => x.SourceRef).HasMaxLength(150);
        builder.Property(x => x.AssessmentMethod).HasMaxLength(80);

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.CourseId, x.Code }, "uq_course_learning_outcomes_course_code")
            .IsUnique()
            .HasDatabaseName("uq_course_learning_outcomes_course_code");
    }
}
