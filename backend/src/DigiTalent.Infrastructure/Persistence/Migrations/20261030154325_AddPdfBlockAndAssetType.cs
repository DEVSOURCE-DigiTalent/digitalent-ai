using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPdfBlockAndAssetType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_module_blocks_asset",
                table: "platform_module_blocks");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_module_blocks_type",
                table: "platform_module_blocks");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_assets_kind",
                table: "platform_assets");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_assets_size",
                table: "platform_assets");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_module_blocks_asset",
                table: "platform_module_blocks",
                sql: "asset_id IS NULL OR block_type IN ('IMAGE','VIDEO','PDF')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_module_blocks_type",
                table: "platform_module_blocks",
                sql: "block_type IN ('TEXT','SLIDE','IMAGE','VIDEO','PDF')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_assets_kind",
                table: "platform_assets",
                sql: "kind IN ('IMAGE','VIDEO','PDF')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_assets_size",
                table: "platform_assets",
                sql: "size_bytes > 0 AND (kind <> 'IMAGE' OR size_bytes <= 10485760) AND (kind <> 'VIDEO' OR size_bytes <= 524288000) AND (kind <> 'PDF' OR size_bytes <= 52428800)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_module_blocks_asset",
                table: "platform_module_blocks");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_module_blocks_type",
                table: "platform_module_blocks");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_assets_kind",
                table: "platform_assets");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_assets_size",
                table: "platform_assets");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_module_blocks_asset",
                table: "platform_module_blocks",
                sql: "asset_id IS NULL OR block_type IN ('IMAGE','VIDEO')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_module_blocks_type",
                table: "platform_module_blocks",
                sql: "block_type IN ('TEXT','SLIDE','IMAGE','VIDEO')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_assets_kind",
                table: "platform_assets",
                sql: "kind IN ('IMAGE','VIDEO')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_assets_size",
                table: "platform_assets",
                sql: "size_bytes > 0 AND (kind <> 'IMAGE' OR size_bytes <= 10485760) AND (kind <> 'VIDEO' OR size_bytes <= 524288000)");
        }
    }
}
