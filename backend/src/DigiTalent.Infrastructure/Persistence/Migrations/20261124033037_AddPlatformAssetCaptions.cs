using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformAssetCaptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "platform_asset_captions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    asset_id = table.Column<Guid>(type: "uuid", nullable: false),
                    language = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false, defaultValue: "vi"),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    draft_cues = table.Column<string>(type: "jsonb", nullable: false, defaultValueSql: "'[]'::jsonb"),
                    published_cues = table.Column<string>(type: "jsonb", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    error_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    requested_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_asset_captions", x => x.id);
                    table.CheckConstraint("ck_platform_asset_captions_error", "status = 'FAILED' OR error_code IS NULL");
                    table.CheckConstraint("ck_platform_asset_captions_language", "language IN ('vi')");
                    table.CheckConstraint("ck_platform_asset_captions_published", "(published_cues IS NULL) = (published_at IS NULL)");
                    table.CheckConstraint("ck_platform_asset_captions_source", "source IN ('AI','MANUAL')");
                    table.CheckConstraint("ck_platform_asset_captions_status", "status IN ('PROCESSING','READY','FAILED')");
                    table.ForeignKey(
                        name: "fk_platform_asset_captions_platform_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_asset_captions_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_asset_captions_users_requested_by_user_id",
                        column: x => x.requested_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_platform_asset_captions_processing",
                table: "platform_asset_captions",
                column: "updated_at",
                filter: "status = 'PROCESSING'");

            migrationBuilder.CreateIndex(
                name: "ix_platform_asset_captions_published_by_user_id",
                table: "platform_asset_captions",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_asset_captions_requested_by_user_id",
                table: "platform_asset_captions",
                column: "requested_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_platform_asset_captions_asset_language",
                table: "platform_asset_captions",
                columns: new[] { "asset_id", "language" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "platform_asset_captions");
        }
    }
}
