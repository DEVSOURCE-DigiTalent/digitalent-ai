using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>
/// Table "platform_frameworks" — SQL v3.2 section 12A.
/// </summary>
public class PlatformFrameworkConfiguration : IEntityTypeConfiguration<PlatformFramework>
{
    public void Configure(EntityTypeBuilder<PlatformFramework> builder)
    {
        builder.ToTable("platform_frameworks", table =>
        {
            table.HasCheckConstraint("ck_platform_frameworks_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
            table.HasCheckConstraint("ck_platform_frameworks_version", "current_version_no >= 0");
            table.HasCheckConstraint("ck_platform_frameworks_published", "status <> 'PUBLISHED' OR current_version_no >= 1");
        });
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Code).IsRequired().HasMaxLength(30);
        builder.HasIndex(f => f.Code).IsUnique();
        builder.Property(f => f.Name).IsRequired().HasMaxLength(250);
        builder.Property(f => f.Description).IsRequired();
        builder.Property(f => f.Status).IsRequired().HasMaxLength(20);
        builder.Property(f => f.CurrentVersionNo).HasDefaultValue(0);
        builder.HasOne<User>().WithMany().HasForeignKey(f => f.CreatedByUserId);
    }
}

/// <summary>
/// Table "platform_framework_domains".
/// </summary>
public class PlatformFrameworkDomainConfiguration : IEntityTypeConfiguration<PlatformFrameworkDomain>
{
    public void Configure(EntityTypeBuilder<PlatformFrameworkDomain> builder)
    {
        builder.ToTable("platform_framework_domains", table =>
            table.HasCheckConstraint("ck_platform_framework_domains_status", "status IN ('ACTIVE','ARCHIVED')"));
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Code).IsRequired().HasMaxLength(40);
        builder.HasIndex(d => d.Code).IsUnique();
        builder.Property(d => d.Name).IsRequired().HasMaxLength(150);
        builder.Property(d => d.PublishedDescription).IsRequired();
        builder.Property(d => d.DraftDescription).IsRequired();
        builder.Property(d => d.Status).IsRequired().HasMaxLength(20).HasDefaultValue("ACTIVE");
        builder.HasIndex(d => new { d.FrameworkId, d.SortOrder }).HasDatabaseName("ix_platform_framework_domains_framework");
        builder.HasOne<PlatformFramework>().WithMany().HasForeignKey(d => d.FrameworkId);
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
        builder.HasIndex(r => new { r.FrameworkId, r.VersionNo }).IsUnique()
            .HasDatabaseName("uq_platform_framework_releases_framework_version");
        builder.Property(r => r.Snapshot).IsRequired().HasColumnType("jsonb");
        builder.Property(r => r.ReleaseNote).HasMaxLength(1000);
        builder.HasOne<PlatformFramework>().WithMany().HasForeignKey(r => r.FrameworkId);
        builder.HasOne<User>().WithMany().HasForeignKey(r => r.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_courses" — identity + mirror of the CURRENT catalog version.
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
            table.HasCheckConstraint("ck_platform_courses_sales_status", "sales_status IN ('OPEN','PAUSED')");
        });
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Code).IsRequired().HasMaxLength(30);
        builder.HasIndex(c => c.Code).IsUnique();
        builder.HasIndex(c => new { c.DomainId, c.Level }).HasDatabaseName("ix_platform_courses_domain_level");
        builder.Property(c => c.Title).IsRequired().HasMaxLength(250);
        builder.Property(c => c.Outcome).IsRequired();
        builder.Property(c => c.SalesStatus).IsRequired().HasMaxLength(20);
        builder.HasOne(c => c.Domain).WithMany().HasForeignKey(c => c.DomainId);
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

/// <summary>
/// Table "platform_catalog_versions" — SQL v3.2 section 19.
/// </summary>
public class PlatformCatalogVersionConfiguration : IEntityTypeConfiguration<PlatformCatalogVersion>
{
    public void Configure(EntityTypeBuilder<PlatformCatalogVersion> builder)
    {
        builder.ToTable("platform_catalog_versions", table =>
        {
            table.HasCheckConstraint("ck_platform_catalog_versions_version", "version_no >= 1");
            table.HasCheckConstraint("ck_platform_catalog_versions_status", "status IN ('DRAFT','CURRENT','RETIRED')");
            table.HasCheckConstraint("ck_platform_catalog_versions_published", "status = 'DRAFT' OR published_at IS NOT NULL");
        });
        builder.HasKey(v => v.Id);
        builder.HasIndex(v => v.VersionNo).IsUnique();
        builder.Property(v => v.Status).IsRequired().HasMaxLength(20);
        // At most one draft and one version in use (the anchor).
        builder.HasIndex(v => v.Status, "ux_platform_catalog_versions_draft").IsUnique().HasFilter("status = 'DRAFT'");
        builder.HasIndex(v => v.Status, "ux_platform_catalog_versions_current").IsUnique().HasFilter("status = 'CURRENT'");
        builder.Property(v => v.ReleaseNote).HasMaxLength(1000);
        builder.HasOne<PlatformCatalogVersion>().WithMany().HasForeignKey(v => v.BasedOnVersionId);
        builder.HasOne<User>().WithMany().HasForeignKey(v => v.CreatedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(v => v.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_catalog_courses".
/// </summary>
public class PlatformCatalogCourseConfiguration : IEntityTypeConfiguration<PlatformCatalogCourse>
{
    public void Configure(EntityTypeBuilder<PlatformCatalogCourse> builder)
    {
        builder.ToTable("platform_catalog_courses", table =>
        {
            table.HasCheckConstraint("ck_platform_catalog_courses_change", "change_kind IN ('NEW','EDITED','UNCHANGED')");
            table.HasCheckConstraint("ck_platform_catalog_courses_level", "level BETWEEN 1 AND 3");
            table.HasCheckConstraint("ck_platform_catalog_courses_price", "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");
            table.HasCheckConstraint("ck_platform_catalog_courses_sales_status", "sales_status IN ('OPEN','PAUSED')");
        });
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => new { c.VersionId, c.CourseId }).IsUnique().HasDatabaseName("uq_platform_catalog_courses_version_course");
        builder.HasIndex(c => c.CourseId).HasDatabaseName("ix_platform_catalog_courses_course");
        builder.Property(c => c.ChangeKind).IsRequired().HasMaxLength(20);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(250);
        builder.Property(c => c.Outcome).IsRequired();
        builder.Property(c => c.SalesStatus).IsRequired().HasMaxLength(20);
        builder.Property(c => c.FinalTitle).IsRequired().HasMaxLength(250);
        builder.Property(c => c.FinalPrompt).IsRequired();
        builder.Property(c => c.FinalCriteria).IsRequired().HasColumnType("jsonb");
        builder.HasOne<PlatformCatalogVersion>().WithMany().HasForeignKey(c => c.VersionId);
        builder.HasOne<PlatformCourse>().WithMany().HasForeignKey(c => c.CourseId);
        builder.HasOne<PlatformFrameworkDomain>().WithMany().HasForeignKey(c => c.DomainId);
    }
}

/// <summary>
/// Table "platform_course_modules".
/// </summary>
public class PlatformCourseModuleConfiguration : IEntityTypeConfiguration<PlatformCourseModule>
{
    public void Configure(EntityTypeBuilder<PlatformCourseModule> builder)
    {
        builder.ToTable("platform_course_modules");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Title).IsRequired().HasMaxLength(250);
        builder.Property(m => m.QuizTitle).IsRequired().HasMaxLength(250);
        builder.HasIndex(m => new { m.CatalogCourseId, m.SortOrder }).HasDatabaseName("ix_platform_course_modules_course");
        builder.HasOne<PlatformCatalogCourse>().WithMany().HasForeignKey(m => m.CatalogCourseId);
    }
}

/// <summary>
/// Table "platform_assets".
/// </summary>
public class PlatformAssetConfiguration : IEntityTypeConfiguration<PlatformAsset>
{
    public void Configure(EntityTypeBuilder<PlatformAsset> builder)
    {
        builder.ToTable("platform_assets", table =>
        {
            table.HasCheckConstraint("ck_platform_assets_kind", "kind IN ('IMAGE','VIDEO')");
            table.HasCheckConstraint(
                "ck_platform_assets_size",
                "size_bytes > 0 AND (kind <> 'IMAGE' OR size_bytes <= 10485760) AND (kind <> 'VIDEO' OR size_bytes <= 524288000)");
        });
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Kind).IsRequired().HasMaxLength(10);
        builder.Property(a => a.FileName).IsRequired().HasMaxLength(255);
        builder.Property(a => a.ContentType).IsRequired().HasMaxLength(100);
        builder.Property(a => a.StorageKey).IsRequired().HasMaxLength(500);
        builder.HasIndex(a => a.StorageKey).IsUnique();
        builder.HasOne<User>().WithMany().HasForeignKey(a => a.UploadedByUserId);
    }
}

/// <summary>
/// Table "platform_module_blocks".
/// </summary>
public class PlatformModuleBlockConfiguration : IEntityTypeConfiguration<PlatformModuleBlock>
{
    public void Configure(EntityTypeBuilder<PlatformModuleBlock> builder)
    {
        builder.ToTable("platform_module_blocks", table =>
        {
            table.HasCheckConstraint("ck_platform_module_blocks_type", "block_type IN ('TEXT','SLIDE','IMAGE','VIDEO')");
            table.HasCheckConstraint("ck_platform_module_blocks_text", "(block_type = 'TEXT') = (body_html IS NOT NULL)");
            table.HasCheckConstraint("ck_platform_module_blocks_asset", "asset_id IS NULL OR block_type IN ('IMAGE','VIDEO')");
        });
        builder.HasKey(b => b.Id);
        builder.Property(b => b.BlockType).IsRequired().HasMaxLength(10);
        builder.Property(b => b.Caption).HasMaxLength(500);
        builder.Property(b => b.AltText).HasMaxLength(500);
        builder.HasIndex(b => new { b.ModuleId, b.SortOrder }).HasDatabaseName("ix_platform_module_blocks_module");
        builder.HasOne<PlatformCourseModule>().WithMany().HasForeignKey(b => b.ModuleId);
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(b => b.AssetId);
    }
}

/// <summary>
/// Table "platform_slide_items".
/// </summary>
public class PlatformSlideItemConfiguration : IEntityTypeConfiguration<PlatformSlideItem>
{
    public void Configure(EntityTypeBuilder<PlatformSlideItem> builder)
    {
        builder.ToTable("platform_slide_items");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Caption).HasMaxLength(500);
        builder.HasIndex(i => new { i.BlockId, i.SortOrder }).HasDatabaseName("ix_platform_slide_items_block");
        builder.HasOne<PlatformModuleBlock>().WithMany().HasForeignKey(i => i.BlockId);
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(i => i.AssetId);
    }
}

/// <summary>
/// Table "platform_module_questions".
/// </summary>
public class PlatformModuleQuestionConfiguration : IEntityTypeConfiguration<PlatformModuleQuestion>
{
    public void Configure(EntityTypeBuilder<PlatformModuleQuestion> builder)
    {
        builder.ToTable("platform_module_questions");
        builder.HasKey(q => q.Id);
        builder.Property(q => q.QuestionText).IsRequired().HasMaxLength(1000);
        builder.Property(q => q.Explanation).HasMaxLength(1000);
        builder.HasIndex(q => new { q.ModuleId, q.SortOrder }).HasDatabaseName("ix_platform_module_questions_module");
        builder.HasOne<PlatformCourseModule>().WithMany().HasForeignKey(q => q.ModuleId);
        builder.HasOne<PlatformModuleBlock>().WithMany().HasForeignKey(q => q.BlockId);
    }
}

/// <summary>
/// Table "platform_question_options".
/// </summary>
public class PlatformQuestionOptionConfiguration : IEntityTypeConfiguration<PlatformQuestionOption>
{
    public void Configure(EntityTypeBuilder<PlatformQuestionOption> builder)
    {
        builder.ToTable("platform_question_options");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OptionText).IsRequired().HasMaxLength(500);
        builder.HasIndex(o => new { o.QuestionId, o.SortOrder }).HasDatabaseName("ix_platform_question_options_question");
        builder.HasIndex(o => o.QuestionId).IsUnique().HasFilter("is_correct").HasDatabaseName("ux_platform_question_options_correct");
        builder.HasOne<PlatformModuleQuestion>().WithMany().HasForeignKey(o => o.QuestionId);
    }
}
