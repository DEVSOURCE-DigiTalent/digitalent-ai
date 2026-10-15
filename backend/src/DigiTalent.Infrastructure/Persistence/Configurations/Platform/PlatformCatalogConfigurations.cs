using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Table "platform_framework_domains" — matches SQL v2.3 section 12A (addendum 2026-10-14).
/// </summary>
public class PlatformFrameworkDomainConfiguration : IEntityTypeConfiguration<PlatformFrameworkDomain>
{
    public void Configure(EntityTypeBuilder<PlatformFrameworkDomain> builder)
    {
        builder.ToTable("platform_framework_domains");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Code).IsRequired().HasMaxLength(10);
        builder.HasIndex(d => d.Code).IsUnique();
        builder.Property(d => d.Name).IsRequired().HasMaxLength(150);
        builder.Property(d => d.PublishedDescription).IsRequired();
        builder.Property(d => d.DraftDescription).IsRequired();
    }
}

/// <summary>
/// Table "platform_framework_releases".
/// </summary>
public class PlatformFrameworkReleaseConfiguration : IEntityTypeConfiguration<PlatformFrameworkRelease>
{
    public void Configure(EntityTypeBuilder<PlatformFrameworkRelease> builder)
    {
        builder.ToTable("platform_framework_releases", table =>
            table.HasCheckConstraint("ck_platform_framework_releases_version", "version_no >= 1"));
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => r.VersionNo).IsUnique();
        builder.Property(r => r.Snapshot).IsRequired().HasColumnType("jsonb");
        builder.Property(r => r.ReleaseNote).HasMaxLength(1000);
        builder.HasOne<User>().WithMany().HasForeignKey(r => r.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_courses".
/// </summary>
public class PlatformCourseConfiguration : IEntityTypeConfiguration<PlatformCourse>
{
    public void Configure(EntityTypeBuilder<PlatformCourse> builder)
    {
        builder.ToTable("platform_courses", table =>
        {
            table.HasCheckConstraint("ck_platform_courses_level", "level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_platform_courses_version", "version_no >= 1");
            table.HasCheckConstraint("ck_platform_courses_price", "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");
            table.HasCheckConstraint(
                "ck_platform_courses_draft_price",
                "draft_price_per_seat IS NULL OR (draft_price_per_seat >= 0 AND (level > 1 OR draft_price_per_seat = 0))");
            table.HasCheckConstraint("ck_platform_courses_sales_status", "sales_status IN ('OPEN','PAUSED')");
            table.HasCheckConstraint(
                "ck_platform_courses_draft_sales_status",
                "draft_sales_status IS NULL OR draft_sales_status IN ('OPEN','PAUSED')");
        });
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(20);
        builder.HasIndex(c => c.Code).IsUnique();
        builder.HasIndex(c => new { c.DomainId, c.Level }).IsUnique().HasDatabaseName("uq_platform_courses_domain_level");
        builder.Property(c => c.Title).IsRequired().HasMaxLength(250);
        builder.Property(c => c.Outcome).IsRequired();
        builder.Property(c => c.SalesStatus).IsRequired().HasMaxLength(20);
        builder.Property(c => c.DraftTitle).HasMaxLength(250);
        builder.Property(c => c.DraftSalesStatus).HasMaxLength(20);
        builder.Ignore(c => c.HasDraft);
        builder.HasOne(c => c.Domain).WithMany().HasForeignKey(c => c.DomainId);
    }
}

/// <summary>
/// Table "platform_course_releases".
/// </summary>
public class PlatformCourseReleaseConfiguration : IEntityTypeConfiguration<PlatformCourseRelease>
{
    public void Configure(EntityTypeBuilder<PlatformCourseRelease> builder)
    {
        builder.ToTable("platform_course_releases", table =>
            table.HasCheckConstraint("ck_platform_course_releases_sales_status", "sales_status IN ('OPEN','PAUSED')"));
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => new { r.CourseId, r.VersionNo }).IsUnique()
            .HasDatabaseName("uq_platform_course_releases_course_version");
        builder.Property(r => r.Title).IsRequired().HasMaxLength(250);
        builder.Property(r => r.Outcome).IsRequired();
        builder.Property(r => r.SalesStatus).IsRequired().HasMaxLength(20);
        builder.HasOne<PlatformCourse>().WithMany().HasForeignKey(r => r.CourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(r => r.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_course_questions".
/// </summary>
public class PlatformCourseQuestionConfiguration : IEntityTypeConfiguration<PlatformCourseQuestion>
{
    public void Configure(EntityTypeBuilder<PlatformCourseQuestion> builder)
    {
        builder.ToTable("platform_course_questions", table =>
            table.HasCheckConstraint("ck_platform_course_questions_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')"));
        builder.HasKey(q => q.Id);
        builder.Property(q => q.QuestionText).IsRequired().HasMaxLength(1000);
        builder.Property(q => q.CorrectAnswer).IsRequired().HasMaxLength(1000);
        builder.Property(q => q.Explanation).IsRequired().HasMaxLength(1000);
        builder.Property(q => q.Status).IsRequired().HasMaxLength(20);
        builder.HasIndex(q => new { q.CourseId, q.Status }).HasDatabaseName("ix_platform_course_questions_course");
        builder.HasOne<PlatformCourse>().WithMany().HasForeignKey(q => q.CourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(q => q.CreatedByUserId);
    }
}

/// <summary>
/// Table "course_seat_orders".
/// </summary>
public class CourseSeatOrderConfiguration : IEntityTypeConfiguration<CourseSeatOrder>
{
    public void Configure(EntityTypeBuilder<CourseSeatOrder> builder)
    {
        builder.ToTable("course_seat_orders", table =>
        {
            table.HasCheckConstraint("ck_course_seat_orders_seats", "seats > 0");
            table.HasCheckConstraint("ck_course_seat_orders_kind", "kind IN ('PURCHASE','ADMIN_GRANT')");
            table.HasCheckConstraint("ck_course_seat_orders_amount", "unit_price >= 0 AND total_amount >= 0");
            table.HasCheckConstraint("ck_course_seat_orders_grant_reason", "kind <> 'ADMIN_GRANT' OR reason IS NOT NULL");
        });
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Kind).IsRequired().HasMaxLength(20);
        builder.Property(o => o.Reason).HasMaxLength(1000);
        builder.HasIndex(o => new { o.OrganizationId, o.CreatedAt }).IsDescending(false, true)
            .HasDatabaseName("ix_course_seat_orders_org_created");
        builder.HasIndex(o => o.CourseId).HasDatabaseName("ix_course_seat_orders_course");
        builder.HasOne<Organization>().WithMany().HasForeignKey(o => o.OrganizationId);
        builder.HasOne<PlatformCourse>().WithMany().HasForeignKey(o => o.CourseId);
        builder.HasOne<User>().WithMany().HasForeignKey(o => o.CreatedByUserId);
    }
}
