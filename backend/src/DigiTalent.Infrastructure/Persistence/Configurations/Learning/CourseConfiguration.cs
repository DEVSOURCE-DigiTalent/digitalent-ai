using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Map entity Course với bảng "courses" (khóa học có version theo code).
/// </summary>
public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("courses", table =>
        {
            table.HasCheckConstraint("ck_courses_version", "version_no > 0");
            table.HasCheckConstraint("ck_courses_entry_level", "entry_level IS NULL OR entry_level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_courses_duration", "estimated_duration_minutes IS NULL OR estimated_duration_minutes >= 0");
            table.HasCheckConstraint("ck_courses_certificate_validity_days", "certificate_validity_days IS NULL OR certificate_validity_days > 0");
            table.HasCheckConstraint("ck_courses_status", "status IN ('DRAFT','REVIEW','PUBLISHED','ARCHIVED')");
            table.HasCheckConstraint("ck_courses_not_self_supersede", "supersedes_course_id IS NULL OR supersedes_course_id <> id");
            table.HasCheckConstraint("ck_courses_row_version", "row_version > 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(250);
        builder.Property(x => x.ShortName).HasMaxLength(120);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(30).HasDefaultValue("DRAFT");
        // Sentinel = default DB: false vẫn được ghi xuống (tránh bẫy bool + HasDefaultValue(true) của EF)
        builder.Property(x => x.CertificateEnabled).HasDefaultValue(true).HasSentinel(true);
        builder.Property(x => x.RowVersion).HasDefaultValue(1L);

        builder.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.SupersedesCourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId);

        builder.HasIndex(x => new { x.OrganizationId, x.Code, x.VersionNo })
            .IsUnique()
            .HasDatabaseName("uq_courses_org_code_version");
    }
}
