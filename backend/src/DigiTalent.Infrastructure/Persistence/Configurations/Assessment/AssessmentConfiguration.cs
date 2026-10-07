using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Assessment với bảng "assessments". Khóa phiên bản = (course_id, code, version_no);
/// mỗi khóa chỉ 1 bài FINAL đang PUBLISHED (partial unique index).
/// </summary>
public class AssessmentConfiguration : IEntityTypeConfiguration<Assessment>
{
    public void Configure(EntityTypeBuilder<Assessment> builder)
    {
        builder.ToTable("assessments", table =>
        {
            table.HasCheckConstraint("ck_assessments_version", "version_no > 0");
            table.HasCheckConstraint("ck_assessments_type", "assessment_type IN ('PRACTICE','QUIZ','FINAL')");
            table.HasCheckConstraint("ck_assessments_time_limit", "time_limit_minutes IS NULL OR time_limit_minutes > 0");
            table.HasCheckConstraint("ck_assessments_max_attempts", "max_attempts IS NULL OR max_attempts > 0");
            table.HasCheckConstraint("ck_assessments_passing_score", "passing_score BETWEEN 0 AND 100");
            table.HasCheckConstraint("ck_assessments_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
            table.HasCheckConstraint("ck_assessments_final_type", "NOT is_final OR assessment_type = 'FINAL'");
            table.HasCheckConstraint(
                "ck_assessments_not_self_supersede",
                "supersedes_assessment_id IS NULL OR supersedes_assessment_id <> id");
            table.HasCheckConstraint("ck_assessments_row_version", "row_version > 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.AssessmentType).IsRequired().HasMaxLength(30);
        builder.Property(x => x.IsFinal).HasDefaultValue(false);
        builder.Property(x => x.PassingScore).HasPrecision(5, 2);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("DRAFT");
        builder.Property(x => x.RowVersion).HasDefaultValue(1L);

        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<Assessment>().WithMany().HasForeignKey(x => x.SupersedesAssessmentId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.CourseId, x.Code, x.VersionNo }, "uq_assessments_course_code_version")
            .IsUnique()
            .HasDatabaseName("uq_assessments_course_code_version");
        builder.HasIndex(x => x.CourseId, "ux_assessments_one_published_final")
            .IsUnique()
            .HasFilter("is_final = true AND status = 'PUBLISHED'")
            .HasDatabaseName("ux_assessments_one_published_final");
    }
}
