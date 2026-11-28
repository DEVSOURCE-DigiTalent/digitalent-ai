using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSignVideoProgressStage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "progress_detail",
                table: "platform_sign_language_tracks",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "progress_stage",
                table: "platform_sign_language_tracks",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_sign_language_tracks_progress_stage",
                table: "platform_sign_language_tracks",
                sql: "progress_stage IS NULL OR progress_stage IN ('QUEUED','DOWNLOADING','PREPARING_CLIPS','JOINING','COMPOSING','CHECKING','SAVING')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_sign_language_tracks_progress_stage",
                table: "platform_sign_language_tracks");

            migrationBuilder.DropColumn(
                name: "progress_detail",
                table: "platform_sign_language_tracks");

            migrationBuilder.DropColumn(
                name: "progress_stage",
                table: "platform_sign_language_tracks");
        }
    }
}
