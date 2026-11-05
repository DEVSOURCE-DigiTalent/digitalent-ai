using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFeedbacks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_feedbacks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    page_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    admin_note = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    resolved_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    resolved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_feedbacks", x => x.id);
                    table.CheckConstraint("ck_user_feedbacks_description_length", "char_length(description) BETWEEN 10 AND 5000");
                    table.CheckConstraint("ck_user_feedbacks_status", "status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')");
                    table.CheckConstraint("ck_user_feedbacks_title_length", "char_length(title) BETWEEN 5 AND 200");
                    table.CheckConstraint("ck_user_feedbacks_type", "type IN ('BUG', 'FEEDBACK', 'SUGGESTION')");
                    table.ForeignKey(
                        name: "fk_user_feedbacks_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_feedbacks_users_resolved_by_user_id",
                        column: x => x.resolved_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_user_feedbacks_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_user_feedbacks_org",
                table: "user_feedbacks",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_feedbacks_resolved_by_user_id",
                table: "user_feedbacks",
                column: "resolved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_user_feedbacks_status",
                table: "user_feedbacks",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_user_feedbacks_user",
                table: "user_feedbacks",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_feedbacks");
        }
    }
}
