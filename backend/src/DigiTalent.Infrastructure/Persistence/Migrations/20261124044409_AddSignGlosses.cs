using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSignGlosses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "sign_glosses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    gloss = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    normalized = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    video_asset_id = table.Column<Guid>(type: "uuid", nullable: true),
                    source_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    source_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    license_note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    motion_data = table.Column<byte[]>(type: "bytea", nullable: true),
                    motion_layout = table.Column<short>(type: "smallint", nullable: true),
                    motion_fps = table.Column<short>(type: "smallint", nullable: true),
                    motion_frames = table.Column<int>(type: "integer", nullable: true),
                    motion_start_ms = table.Column<int>(type: "integer", nullable: true),
                    motion_end_ms = table.Column<int>(type: "integer", nullable: true),
                    mirrored = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sign_glosses", x => x.id);
                    table.CheckConstraint("ck_sign_glosses_fps", "motion_fps IS NULL OR motion_fps BETWEEN 5 AND 60");
                    table.CheckConstraint("ck_sign_glosses_frames", "motion_frames IS NULL OR motion_frames BETWEEN 1 AND 1800");
                    table.CheckConstraint("ck_sign_glosses_kind", "kind IN ('WORD','LETTER','DIGIT','TONE')");
                    table.CheckConstraint("ck_sign_glosses_motion", "(motion_data IS NULL) = (motion_layout IS NULL) AND (motion_data IS NULL) = (motion_fps IS NULL) AND (motion_data IS NULL) = (motion_frames IS NULL)");
                    table.CheckConstraint("ck_sign_glosses_published", "status <> 'PUBLISHED' OR (motion_data IS NOT NULL AND published_at IS NOT NULL)");
                    table.CheckConstraint("ck_sign_glosses_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
                    table.CheckConstraint("ck_sign_glosses_trim", "motion_start_ms IS NULL OR motion_end_ms IS NULL OR motion_end_ms > motion_start_ms");
                    table.ForeignKey(
                        name: "fk_sign_glosses_platform_assets_video_asset_id",
                        column: x => x.video_asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sign_glosses_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_sign_glosses_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_sign_glosses_created_by_user_id",
                table: "sign_glosses",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_sign_glosses_published_by_user_id",
                table: "sign_glosses",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_sign_glosses_status",
                table: "sign_glosses",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_sign_glosses_video_asset_id",
                table: "sign_glosses",
                column: "video_asset_id");

            migrationBuilder.CreateIndex(
                name: "ux_sign_glosses_normalized_kind",
                table: "sign_glosses",
                columns: new[] { "normalized", "kind" },
                unique: true,
                filter: "status <> 'ARCHIVED'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sign_glosses");
        }
    }
}
