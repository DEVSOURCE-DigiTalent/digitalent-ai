using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity RecommendationDecision với bảng "recommendation_decisions" (duyệt khóa học được gợi ý).
/// </summary>
public class RecommendationDecisionConfiguration : IEntityTypeConfiguration<RecommendationDecision>
{
    public void Configure(EntityTypeBuilder<RecommendationDecision> builder)
    {
        builder.ToTable("recommendation_decisions", table =>
            table.HasCheckConstraint("ck_recommendation_decisions_status", "status IN ('ACCEPTED','DISMISSED','REOPENED')"));
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(30);

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<SkillGapRun>().WithMany().HasForeignKey(x => x.SkillGapRunId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.DecidedByUserId);

        builder.HasIndex(x => new { x.EmployeeId, x.CourseId })
            .IsUnique()
            .HasDatabaseName("uq_recommendation_decisions_employee_course");
    }
}
