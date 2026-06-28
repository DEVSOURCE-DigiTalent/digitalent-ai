using DigiTalent.Domain.Entities.Assessment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AssessmentEntity = DigiTalent.Domain.Entities.Assessment.Assessment;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Assessment;

public class AssessmentConfiguration : IEntityTypeConfiguration<AssessmentEntity>
{
    public void Configure(EntityTypeBuilder<AssessmentEntity> builder)
    {
        builder.ToTable("assessments");

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamptz");
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamptz");
        builder.Property(x => x.UpdatedBy).HasColumnName("updated_by");

        builder.Property(x => x.CourseId).HasColumnName("course_id");
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(255);
        builder.Property(x => x.AssessmentType).HasColumnName("assessment_type").HasMaxLength(30);
        builder.Property(x => x.TimeLimitMinutes).HasColumnName("time_limit_minutes");
        builder.Property(x => x.MaxAttempts).HasColumnName("max_attempts");
        builder.Property(x => x.PassingScore).HasColumnName("passing_score").HasColumnType("numeric(5,2)");
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30);

        builder.HasOne(a => a.Course)
            .WithMany()
            .HasForeignKey(a => a.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.AssessmentQuestions)
            .WithOne(aq => aq.Assessment)
            .HasForeignKey(aq => aq.AssessmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(a => a.Attempts)
            .WithOne(at => at.Assessment)
            .HasForeignKey(at => at.AssessmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
