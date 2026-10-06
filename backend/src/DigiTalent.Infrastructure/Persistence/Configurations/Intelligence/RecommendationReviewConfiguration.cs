using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations.Intelligence;

public class RecommendationReviewConfiguration : IEntityTypeConfiguration<RecommendationReview>
{
    public void Configure(EntityTypeBuilder<RecommendationReview> builder)
    {
        builder.ToTable("recommendation_reviews", t => t.ExcludeFromMigrations());

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");
        builder.Property(r => r.OrganizationId).HasColumnName("organization_id").IsRequired();
        builder.Property(r => r.EmployeeId).HasColumnName("employee_id").IsRequired();
        builder.Property(r => r.CourseId).HasColumnName("course_id").IsRequired();
        builder.Property(r => r.SkillGapRunId).HasColumnName("skill_gap_run_id").IsRequired();
        builder.Property(r => r.Score).HasColumnName("score").HasPrecision(8, 4);
        builder.Property(r => r.GapsClosed).HasColumnName("gaps_closed");
        builder.Property(r => r.MandatoryClosed).HasColumnName("mandatory_closed");
        builder.Property(r => r.HighClosed).HasColumnName("high_closed");
        builder.Property(r => r.Explanation).HasColumnName("explanation").HasMaxLength(2000);
        builder.Property(r => r.Status).HasColumnName("status").HasMaxLength(30).IsRequired();
        builder.Property(r => r.DecisionReason).HasColumnName("decision_reason").HasMaxLength(500);
        builder.Property(r => r.DecidedAt).HasColumnName("decided_at");
        builder.Property(r => r.DecidedByUserId).HasColumnName("decided_by_user_id");
        builder.Property(r => r.CourseAssignmentId).HasColumnName("course_assignment_id");
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(r => new { r.OrganizationId, r.EmployeeId, r.CourseId })
            .IsUnique()
            .HasDatabaseName("uq_recommendation_reviews_emp_course");
    }
}
