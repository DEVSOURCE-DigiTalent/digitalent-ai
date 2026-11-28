using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSignLanguageVideoTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_sign_glosses_normalized_kind",
                table: "sign_glosses");

            migrationBuilder.AddColumn<bool>(
                name: "consent_confirmed",
                table: "sign_glosses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_preferred",
                table: "sign_glosses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<short>(
                name: "priority",
                table: "sign_glosses",
                type: "smallint",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AddColumn<string>(
                name: "region",
                table: "sign_glosses",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "VN");

            migrationBuilder.AddColumn<string>(
                name: "sign_language",
                table: "sign_glosses",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "VSL");

            migrationBuilder.AddColumn<string>(
                name: "signer_name",
                table: "sign_glosses",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "synonyms",
                table: "sign_glosses",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");

            migrationBuilder.AddColumn<string>(
                name: "variant",
                table: "sign_glosses",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "video_duration_ms",
                table: "sign_glosses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "platform_sign_language_tracks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_asset_id = table.Column<Guid>(type: "uuid", nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "vi"),
                    sign_language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "VSL"),
                    region = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false, defaultValue: "VN"),
                    variant = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    caption_source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    caption_fingerprint = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    render_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    renderer = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    settings = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'{}'::jsonb"),
                    progress = table.Column<short>(type: "smallint", nullable: false, defaultValue: (short)0),
                    render_attempts = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    error_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    error_message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    output_asset_id = table.Column<Guid>(type: "uuid", nullable: true),
                    rendered_fingerprint = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    output_duration_ms = table.Column<int>(type: "integer", nullable: true),
                    output_width = table.Column<int>(type: "integer", nullable: true),
                    output_height = table.Column<int>(type: "integer", nullable: true),
                    render_started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    rendered_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    published_output_asset_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_render_mode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    published_snapshot = table.Column<string>(type: "jsonb", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_sign_language_tracks", x => x.id);
                    table.CheckConstraint("ck_platform_sign_language_tracks_caption_source", "caption_source IN ('PUBLISHED','DRAFT')");
                    table.CheckConstraint("ck_platform_sign_language_tracks_error", "status = 'FAILED' OR error_code IS NULL");
                    table.CheckConstraint("ck_platform_sign_language_tracks_language", "language IN ('vi')");
                    table.CheckConstraint("ck_platform_sign_language_tracks_output_meta", "(output_duration_ms IS NULL OR output_duration_ms > 0) AND (output_width IS NULL OR output_width > 0) AND (output_height IS NULL OR output_height > 0)");
                    table.CheckConstraint("ck_platform_sign_language_tracks_progress", "progress BETWEEN 0 AND 100");
                    table.CheckConstraint("ck_platform_sign_language_tracks_published", "(published_output_asset_id IS NULL) = (published_at IS NULL) AND (published_output_asset_id IS NULL) = (published_render_mode IS NULL)");
                    table.CheckConstraint("ck_platform_sign_language_tracks_published_mode", "published_render_mode IS NULL OR published_render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')");
                    table.CheckConstraint("ck_platform_sign_language_tracks_ready", "status NOT IN ('READY','PUBLISHED') OR output_asset_id IS NOT NULL");
                    table.CheckConstraint("ck_platform_sign_language_tracks_region", "region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'");
                    table.CheckConstraint("ck_platform_sign_language_tracks_render_mode", "render_mode IN ('OVERLAY','FULLSCREEN','TRACK_ONLY')");
                    table.CheckConstraint("ck_platform_sign_language_tracks_renderer", "renderer IN ('CLIP','AVATAR')");
                    table.CheckConstraint("ck_platform_sign_language_tracks_settings", "jsonb_typeof(settings) = 'object'");
                    table.CheckConstraint("ck_platform_sign_language_tracks_sign_language", "sign_language ~ '^[A-Z]{2,10}$'");
                    table.CheckConstraint("ck_platform_sign_language_tracks_status", "status IN ('ANALYZING','MISSING_GLOSSES','READY_TO_RENDER','RENDERING','READY','FAILED','PUBLISHED')");
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_platform_assets_output_asset_",
                        column: x => x.output_asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_platform_assets_published_out",
                        column: x => x.published_output_asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_platform_assets_source_asset_",
                        column: x => x.source_asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_tracks_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_sign_language_segments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    track_id = table.Column<Guid>(type: "uuid", nullable: false),
                    segment_index = table.Column<int>(type: "integer", nullable: false),
                    caption_text = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    start_ms = table.Column<int>(type: "integer", nullable: false),
                    end_ms = table.Column<int>(type: "integer", nullable: false),
                    sequence = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    missing = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    confidence = table.Column<decimal>(type: "numeric(4,3)", precision: 4, scale: 3, nullable: false),
                    review_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PENDING"),
                    review_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    reviewed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_sign_language_segments", x => x.id);
                    table.CheckConstraint("ck_platform_sign_language_segments_confidence", "confidence BETWEEN 0 AND 1");
                    table.CheckConstraint("ck_platform_sign_language_segments_index", "segment_index >= 0");
                    table.CheckConstraint("ck_platform_sign_language_segments_review", "review_status IN ('PENDING','APPROVED','SKIPPED')");
                    table.CheckConstraint("ck_platform_sign_language_segments_reviewed", "review_status = 'PENDING' OR reviewed_at IS NOT NULL");
                    table.CheckConstraint("ck_platform_sign_language_segments_sequence", "jsonb_typeof(sequence) = 'array' AND jsonb_typeof(missing) = 'array'");
                    table.CheckConstraint("ck_platform_sign_language_segments_time", "start_ms >= 0 AND end_ms > start_ms");
                    table.ForeignKey(
                        name: "fk_platform_sign_language_segments_platform_sign_language_trac",
                        column: x => x.track_id,
                        principalTable: "platform_sign_language_tracks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_sign_language_segments_users_reviewed_by_user_id",
                        column: x => x.reviewed_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ux_sign_glosses_preferred",
                table: "sign_glosses",
                columns: new[] { "normalized", "kind", "sign_language" },
                unique: true,
                filter: "is_preferred AND status <> 'ARCHIVED'");

            migrationBuilder.CreateIndex(
                name: "ux_sign_glosses_variant",
                table: "sign_glosses",
                columns: new[] { "normalized", "kind", "sign_language", "region", "variant" },
                unique: true,
                filter: "status <> 'ARCHIVED'")
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.AddCheckConstraint(
                name: "ck_sign_glosses_region",
                table: "sign_glosses",
                sql: "region ~ '^[A-Z]{2}(-[A-Z]{2,10})?$'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_sign_glosses_sign_language",
                table: "sign_glosses",
                sql: "sign_language ~ '^[A-Z]{2,10}$'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_sign_glosses_synonyms",
                table: "sign_glosses",
                sql: "jsonb_typeof(synonyms) = 'array'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_sign_glosses_video_duration",
                table: "sign_glosses",
                sql: "video_duration_ms IS NULL OR video_duration_ms > 0");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_segments_reviewed_by_user_id",
                table: "platform_sign_language_segments",
                column: "reviewed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_platform_sign_language_segments_track_index",
                table: "platform_sign_language_segments",
                columns: new[] { "track_id", "segment_index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_created_by_user_id",
                table: "platform_sign_language_tracks",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_output_asset_id",
                table: "platform_sign_language_tracks",
                column: "output_asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_published_by_user_id",
                table: "platform_sign_language_tracks",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_published_output_asset_id",
                table: "platform_sign_language_tracks",
                column: "published_output_asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_rendering",
                table: "platform_sign_language_tracks",
                column: "updated_at",
                filter: "status = 'RENDERING'");

            migrationBuilder.CreateIndex(
                name: "ix_platform_sign_language_tracks_requested_by_user_id",
                table: "platform_sign_language_tracks",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_platform_sign_language_tracks_asset_sign_language",
                table: "platform_sign_language_tracks",
                columns: new[] { "source_asset_id", "sign_language" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // v3.12 allows one sign in use per text × kind: keep the best variant of each word (default sign, then the
            // national one, then the oldest) and archive the others — archived, not deleted, so nothing is lost.
            migrationBuilder.Sql(@"
WITH ranked AS (
    SELECT id, row_number() OVER (
        PARTITION BY normalized, kind
        ORDER BY is_preferred DESC, (region = 'VN') DESC, created_at, id) AS rn
    FROM sign_glosses
    WHERE status <> 'ARCHIVED')
UPDATE sign_glosses SET status = 'ARCHIVED', updated_at = now()
FROM ranked
WHERE sign_glosses.id = ranked.id AND ranked.rn > 1;");

            migrationBuilder.DropTable(
                name: "platform_sign_language_segments");

            migrationBuilder.DropTable(
                name: "platform_sign_language_tracks");

            migrationBuilder.DropIndex(
                name: "ux_sign_glosses_preferred",
                table: "sign_glosses");

            migrationBuilder.DropIndex(
                name: "ux_sign_glosses_variant",
                table: "sign_glosses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_sign_glosses_region",
                table: "sign_glosses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_sign_glosses_sign_language",
                table: "sign_glosses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_sign_glosses_synonyms",
                table: "sign_glosses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_sign_glosses_video_duration",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "consent_confirmed",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "is_preferred",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "region",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "sign_language",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "signer_name",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "synonyms",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "variant",
                table: "sign_glosses");

            migrationBuilder.DropColumn(
                name: "video_duration_ms",
                table: "sign_glosses");

            migrationBuilder.CreateIndex(
                name: "ux_sign_glosses_normalized_kind",
                table: "sign_glosses",
                columns: new[] { "normalized", "kind" },
                unique: true,
                filter: "status <> 'ARCHIVED'");
        }
    }
}
