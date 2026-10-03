using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity CourseCompetency với bảng "course_competencies" (khóa học nâng năng lực nào lên cấp nào).
/// </summary>
public class CourseCompetencyConfiguration : IEntityTypeConfiguration<CourseCompetency>
{
    public void Configure(EntityTypeBuilder<CourseCompetency> builder)
    {
        builder.ToTable("course_competencies", table =>
        {
            table.HasCheckConstraint("ck_course_target_level", "target_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_course_coverage_type", "coverage_type IN ('PRIMARY','SECONDARY','SUPPORTING')");
            table.HasCheckConstraint("ck_course_coverage_weight", "coverage_weight IS NULL OR coverage_weight BETWEEN 0 AND 100");
        });
        builder.HasKey(x => new { x.CourseId, x.CompetencyId });

        builder.Property(x => x.CoverageType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.CoverageWeight).HasPrecision(5, 2);

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Competency>().WithMany().HasForeignKey(x => x.CompetencyId);

        builder.HasIndex(x => new { x.CompetencyId, x.TargetLevel })
            .HasDatabaseName("ix_course_competencies_competency_target_level");
    }
}
