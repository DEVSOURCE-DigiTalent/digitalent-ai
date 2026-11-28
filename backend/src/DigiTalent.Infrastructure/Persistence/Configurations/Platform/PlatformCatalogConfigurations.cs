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
            table.HasCheckConstraint("ck_platform_courses_price", "price >= 0 AND (level > 1 OR price = 0)");
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
/// Table "course_orders" (schema v3.9): one row per paid course an organization bought.
/// </summary>
public class CourseOrderConfiguration : IEntityTypeConfiguration<CourseOrder>
{
    public void Configure(EntityTypeBuilder<CourseOrder> builder)
    {
        builder.ToTable("course_orders", table =>
        {
            table.HasCheckConstraint("ck_course_orders_amount", "amount >= 0");
        });
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Reason).HasMaxLength(1000);
        builder.HasIndex(o => new { o.OrganizationId, o.CreatedAt }).IsDescending(false, true)
            .HasDatabaseName("ix_course_orders_org_created");
        builder.HasIndex(o => o.CourseId).HasDatabaseName("ix_course_orders_course");
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
            table.HasCheckConstraint("ck_platform_catalog_courses_price", "price >= 0 AND (level > 1 OR price = 0)");
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
            table.HasCheckConstraint("ck_platform_assets_kind", "kind IN ('IMAGE','VIDEO','PDF')");
            table.HasCheckConstraint(
                "ck_platform_assets_size",
                "size_bytes > 0 AND (kind <> 'IMAGE' OR size_bytes <= 10485760) AND (kind <> 'VIDEO' OR size_bytes <= 524288000) AND (kind <> 'PDF' OR size_bytes <= 52428800)");
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
/// Table "platform_asset_captions" — SQL v3.11: captions of a video (draft + what learners see).
/// </summary>
public class PlatformAssetCaptionConfiguration : IEntityTypeConfiguration<PlatformAssetCaption>
{
    public void Configure(EntityTypeBuilder<PlatformAssetCaption> builder)
    {
        builder.ToTable("platform_asset_captions", table =>
        {
            table.HasCheckConstraint("ck_platform_asset_captions_language", "language IN ('vi')");
            table.HasCheckConstraint("ck_platform_asset_captions_status", "status IN ('PROCESSING','READY','FAILED')");
            table.HasCheckConstraint("ck_platform_asset_captions_source", "source IN ('AI','MANUAL')");
            table.HasCheckConstraint("ck_platform_asset_captions_published", "(published_cues IS NULL) = (published_at IS NULL)");
            table.HasCheckConstraint("ck_platform_asset_captions_error", "status = 'FAILED' OR error_code IS NULL");
        });
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Language).IsRequired().HasMaxLength(10).HasDefaultValue("vi");
        builder.Property(c => c.Status).IsRequired().HasMaxLength(20);
        builder.Property(c => c.Source).IsRequired().HasMaxLength(20);
        builder.Property(c => c.DraftCues).IsRequired().HasColumnType("jsonb").HasDefaultValueSql("'[]'::jsonb");
        builder.Property(c => c.PublishedCues).HasColumnType("jsonb");
        builder.Property(c => c.Model).HasMaxLength(100);
        builder.Property(c => c.ErrorCode).HasMaxLength(50);
        builder.HasIndex(c => new { c.AssetId, c.Language }).IsUnique().HasDatabaseName("uq_platform_asset_captions_asset_language");
        builder.HasIndex(c => c.UpdatedAt).HasDatabaseName("ix_platform_asset_captions_processing").HasFilter("status = 'PROCESSING'");
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(c => c.AssetId);
        builder.HasOne<User>().WithMany().HasForeignKey(c => c.PublishedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(c => c.RequestedByUserId);
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
            table.HasCheckConstraint("ck_platform_module_blocks_type", "block_type IN ('TEXT','SLIDE','IMAGE','VIDEO','PDF')");
            table.HasCheckConstraint("ck_platform_module_blocks_text", "(block_type = 'TEXT') = (body_html IS NOT NULL)");
            table.HasCheckConstraint("ck_platform_module_blocks_asset", "asset_id IS NULL OR block_type IN ('IMAGE','VIDEO','PDF')");
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
        builder.Property(q => q.IsFinalQuiz).IsRequired();
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

/// <summary>
/// Table "sign_glosses" — SQL v3.12: the sign-language dictionary of the 3D signing avatar.
/// </summary>
public class SignGlossConfiguration : IEntityTypeConfiguration<SignGloss>
{
    public void Configure(EntityTypeBuilder<SignGloss> builder)
    {
        builder.ToTable("sign_glosses", table =>
        {
            table.HasCheckConstraint("ck_sign_glosses_kind", "kind IN ('WORD','LETTER','DIGIT','TONE')");
            table.HasCheckConstraint("ck_sign_glosses_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
            table.HasCheckConstraint(
                "ck_sign_glosses_motion",
                "(motion_data IS NULL) = (motion_layout IS NULL) AND (motion_data IS NULL) = (motion_fps IS NULL) AND (motion_data IS NULL) = (motion_frames IS NULL)");
            table.HasCheckConstraint("ck_sign_glosses_fps", "motion_fps IS NULL OR motion_fps BETWEEN 5 AND 60");
            table.HasCheckConstraint("ck_sign_glosses_frames", "motion_frames IS NULL OR motion_frames BETWEEN 1 AND 1800");
            table.HasCheckConstraint("ck_sign_glosses_trim", "motion_start_ms IS NULL OR motion_end_ms IS NULL OR motion_end_ms > motion_start_ms");
            table.HasCheckConstraint("ck_sign_glosses_published", "status <> 'PUBLISHED' OR (motion_data IS NOT NULL AND published_at IS NOT NULL)");
            // v3.13: variants and rights
            table.HasCheckConstraint("ck_sign_glosses_sign_language", "sign_language ~ '^[A-Z]{2,10}$'");
            table.HasCheckConstraint("ck_sign_glosses_region", "region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'");
            table.HasCheckConstraint("ck_sign_glosses_synonyms", "jsonb_typeof(synonyms) = 'array'");
            table.HasCheckConstraint("ck_sign_glosses_video_duration", "video_duration_ms IS NULL OR video_duration_ms > 0");
        });
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Gloss).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Normalized).IsRequired().HasMaxLength(100);
        builder.Property(g => g.Kind).IsRequired().HasMaxLength(20);
        builder.Property(g => g.Status).IsRequired().HasMaxLength(20);
        builder.Property(g => g.SourceName).HasMaxLength(200);
        builder.Property(g => g.SourceUrl).HasMaxLength(500);
        builder.Property(g => g.LicenseNote).HasMaxLength(500);
        builder.Property(g => g.MotionData).HasColumnType("bytea");
        builder.Property(g => g.Mirrored).HasDefaultValue(false);
        builder.Property(g => g.SignLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("VSL");
        builder.Property(g => g.Region).IsRequired().HasMaxLength(13).HasDefaultValue("VN");
        builder.Property(g => g.Variant).HasMaxLength(50);
        builder.Property(g => g.IsPreferred).HasDefaultValue(false);
        builder.Property(g => g.Priority).HasDefaultValue((short)0);
        builder.Property(g => g.Synonyms).IsRequired().HasColumnType("jsonb").HasDefaultValueSql("'[]'::jsonb");
        builder.Property(g => g.ConsentConfirmed).HasDefaultValue(false);
        builder.Property(g => g.SignerName).HasMaxLength(200);
        // One sign in use per text × kind × sign language × region × variant (a missing variant counts as one value).
        builder.HasIndex(g => new { g.Normalized, g.Kind, g.SignLanguage, g.Region, g.Variant })
            .IsUnique()
            .AreNullsDistinct(false)
            .HasDatabaseName("ux_sign_glosses_variant")
            .HasFilter("status <> 'ARCHIVED'");
        // At most one default sign per text × kind × sign language.
        builder.HasIndex(g => new { g.Normalized, g.Kind, g.SignLanguage })
            .IsUnique()
            .HasDatabaseName("ux_sign_glosses_preferred")
            .HasFilter("is_preferred AND status <> 'ARCHIVED'");
        builder.HasIndex(g => g.Status).HasDatabaseName("ix_sign_glosses_status");
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(g => g.VideoAssetId);
        builder.HasOne<User>().WithMany().HasForeignKey(g => g.CreatedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(g => g.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_sign_language_tracks" — SQL v3.13: the sign-language video of a lesson video (draft + published output).
/// </summary>
public class PlatformSignLanguageTrackConfiguration : IEntityTypeConfiguration<PlatformSignLanguageTrack>
{
    public void Configure(EntityTypeBuilder<PlatformSignLanguageTrack> builder)
    {
        builder.ToTable("platform_sign_language_tracks", table =>
        {
            table.HasCheckConstraint("ck_platform_sign_language_tracks_language", "language IN ('vi')");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_sign_language", "sign_language ~ '^[A-Z]{2,10}$'");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_region", "region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_caption_source", "caption_source IN ('PUBLISHED','DRAFT')");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_render_mode", "render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_renderer", "renderer IN ('CLIP','AVATAR')");
            table.HasCheckConstraint(
                "ck_platform_sign_language_tracks_status",
                "status IN ('ANALYZING','MISSING_GLOSSES','READY_TO_RENDER','RENDERING','READY','FAILED','PUBLISHED')");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_progress", "progress BETWEEN 0 AND 100");
            table.HasCheckConstraint(
                "ck_platform_sign_language_tracks_progress_stage",
                "progress_stage IS NULL OR progress_stage IN ('QUEUED','DOWNLOADING','PREPARING_CLIPS','JOINING','COMPOSING','CHECKING','SAVING')");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_error", "status = 'FAILED' OR error_code IS NULL");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_ready", "status NOT IN ('READY','PUBLISHED') OR output_asset_id IS NOT NULL");
            table.HasCheckConstraint(
                "ck_platform_sign_language_tracks_published",
                "(published_output_asset_id IS NULL) = (published_at IS NULL) AND (published_output_asset_id IS NULL) = (published_render_mode IS NULL)");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_published_mode", "published_render_mode IS NULL OR published_render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')");
            table.HasCheckConstraint(
                "ck_platform_sign_language_tracks_output_meta",
                "(output_duration_ms IS NULL OR output_duration_ms > 0) AND (output_width IS NULL OR output_width > 0) AND (output_height IS NULL OR output_height > 0)");
            table.HasCheckConstraint("ck_platform_sign_language_tracks_settings", "jsonb_typeof(settings) = 'object'");
        });
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Language).IsRequired().HasMaxLength(10).HasDefaultValue("vi");
        builder.Property(t => t.SignLanguage).IsRequired().HasMaxLength(10).HasDefaultValue("VSL");
        builder.Property(t => t.Region).IsRequired().HasMaxLength(13).HasDefaultValue("VN");
        builder.Property(t => t.Variant).HasMaxLength(50);
        builder.Property(t => t.CaptionSource).IsRequired().HasMaxLength(20);
        builder.Property(t => t.CaptionFingerprint).IsRequired().HasMaxLength(64);
        builder.Property(t => t.RenderMode).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Renderer).IsRequired().HasMaxLength(20);
        builder.Property(t => t.Status).IsRequired().HasMaxLength(30);
        builder.Property(t => t.Settings).IsRequired().HasColumnType("jsonb").HasDefaultValueSql("'{}'::jsonb");
        builder.Property(t => t.Progress).HasDefaultValue((short)0);
        builder.Property(t => t.ProgressStage).HasMaxLength(30);
        builder.Property(t => t.ProgressDetail).HasMaxLength(200);
        builder.Property(t => t.RenderAttempts).HasDefaultValue(0);
        builder.Property(t => t.ErrorCode).HasMaxLength(50);
        builder.Property(t => t.ErrorMessage).HasMaxLength(500);
        builder.Property(t => t.RenderedFingerprint).HasMaxLength(64);
        builder.Property(t => t.PublishedRenderMode).HasMaxLength(20);
        builder.Property(t => t.PublishedSnapshot).HasColumnType("jsonb");
        builder.HasIndex(t => new { t.SourceAssetId, t.SignLanguage }).IsUnique().HasDatabaseName("uq_platform_sign_language_tracks_asset_sign_language");
        builder.HasIndex(t => t.UpdatedAt).HasDatabaseName("ix_platform_sign_language_tracks_rendering").HasFilter("status = 'RENDERING'");
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(t => t.SourceAssetId);
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(t => t.OutputAssetId);
        builder.HasOne<PlatformAsset>().WithMany().HasForeignKey(t => t.PublishedOutputAssetId);
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.CreatedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.RequestedByUserId);
        builder.HasOne<User>().WithMany().HasForeignKey(t => t.PublishedByUserId);
    }
}

/// <summary>
/// Table "platform_sign_language_segments" — SQL v3.13: one caption sentence of a sign-language track and its signs.
/// </summary>
public class PlatformSignLanguageSegmentConfiguration : IEntityTypeConfiguration<PlatformSignLanguageSegment>
{
    public void Configure(EntityTypeBuilder<PlatformSignLanguageSegment> builder)
    {
        builder.ToTable("platform_sign_language_segments", table =>
        {
            table.HasCheckConstraint("ck_platform_sign_language_segments_index", "segment_index >= 0");
            table.HasCheckConstraint("ck_platform_sign_language_segments_time", "start_ms >= 0 AND end_ms > start_ms");
            table.HasCheckConstraint("ck_platform_sign_language_segments_review", "review_status IN ('PENDING','APPROVED','SKIPPED')");
            table.HasCheckConstraint("ck_platform_sign_language_segments_reviewed", "review_status = 'PENDING' OR reviewed_at IS NOT NULL");
            table.HasCheckConstraint("ck_platform_sign_language_segments_confidence", "confidence BETWEEN 0 AND 1");
            table.HasCheckConstraint("ck_platform_sign_language_segments_sequence", "jsonb_typeof(sequence) = 'array' AND jsonb_typeof(missing) = 'array'");
        });
        builder.HasKey(s => s.Id);
        builder.Property(s => s.CaptionText).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Sequence).IsRequired().HasColumnType("jsonb").HasDefaultValueSql("'[]'::jsonb");
        builder.Property(s => s.Missing).IsRequired().HasColumnType("jsonb").HasDefaultValueSql("'[]'::jsonb");
        builder.Property(s => s.Confidence).HasPrecision(4, 3);
        builder.Property(s => s.ReviewStatus).IsRequired().HasMaxLength(20).HasDefaultValue("PENDING");
        builder.Property(s => s.ReviewNote).HasMaxLength(500);
        builder.HasIndex(s => new { s.TrackId, s.SegmentIndex }).IsUnique().HasDatabaseName("uq_platform_sign_language_segments_track_index");
        builder.HasOne<PlatformSignLanguageTrack>().WithMany().HasForeignKey(s => s.TrackId);
        builder.HasOne<User>().WithMany().HasForeignKey(s => s.ReviewedByUserId);
    }
}
