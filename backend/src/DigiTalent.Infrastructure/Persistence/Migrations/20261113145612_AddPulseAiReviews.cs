using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPulseAiReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "pulse_ai_reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    submission_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    submission_id = table.Column<Guid>(type: "uuid", nullable: false),
                    input_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    result = table.Column<string>(type: "jsonb", nullable: false),
                    model = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_pulse_ai_reviews", x => x.id);
                    table.CheckConstraint("ck_pulse_ai_reviews_input_hash", "char_length(input_hash) = 64");
                    table.CheckConstraint("ck_pulse_ai_reviews_kind", "submission_kind IN ('FINAL', 'PRE_ASSESSMENT')");
                    table.ForeignKey(
                        name: "fk_pulse_ai_reviews_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_pulse_ai_reviews_organization_id",
                table: "pulse_ai_reviews",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "uq_pulse_ai_reviews_submission",
                table: "pulse_ai_reviews",
                columns: new[] { "submission_kind", "submission_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pulse_ai_reviews");
        }
    }
}
