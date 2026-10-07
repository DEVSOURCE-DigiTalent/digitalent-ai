using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationStructureAndInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "deactivated_reason",
                table: "users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "department_id",
                table: "job_positions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "job_grade",
                table: "job_positions",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "job_grades",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_job_grades", x => x.id);
                    table.CheckConstraint("ck_job_grades_code", "code IN ('G1','G2','G3')");
                    table.ForeignKey(
                        name: "fk_job_grades_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "member_invitations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    employee_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    role_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    job_position_id = table.Column<Guid>(type: "uuid", nullable: true),
                    token_hash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    invited_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    invited_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    accepted_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    accepted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_member_invitations", x => x.id);
                    table.CheckConstraint("ck_member_invitations_status", "status IN ('PENDING','ACCEPTED','REVOKED')");
                    table.ForeignKey(
                        name: "fk_member_invitations_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_member_invitations_job_positions_job_position_id",
                        column: x => x.job_position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_member_invitations_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_member_invitations_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_member_invitations_users_accepted_user_id",
                        column: x => x.accepted_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_member_invitations_users_invited_by_user_id",
                        column: x => x.invited_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_job_positions_department",
                table: "job_positions",
                column: "department_id");

            migrationBuilder.AddCheckConstraint(
                name: "ck_job_positions_job_grade",
                table: "job_positions",
                sql: "job_grade IS NULL OR job_grade IN ('G1','G2','G3')");

            migrationBuilder.CreateIndex(
                name: "ix_job_grades_organization_id_code",
                table: "job_grades",
                columns: new[] { "organization_id", "code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_accepted_user_id",
                table: "member_invitations",
                column: "accepted_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_department_id",
                table: "member_invitations",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_invited_by_user_id",
                table: "member_invitations",
                column: "invited_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_job_position_id",
                table: "member_invitations",
                column: "job_position_id");

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_role_id",
                table: "member_invitations",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "ix_member_invitations_token_hash",
                table: "member_invitations",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_member_invitations_pending_email",
                table: "member_invitations",
                columns: new[] { "organization_id", "email" },
                unique: true,
                filter: "status = 'PENDING'");

            migrationBuilder.AddForeignKey(
                name: "fk_job_positions_departments_department_id",
                table: "job_positions",
                column: "department_id",
                principalTable: "departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_job_positions_departments_department_id",
                table: "job_positions");

            migrationBuilder.DropTable(
                name: "job_grades");

            migrationBuilder.DropTable(
                name: "member_invitations");

            migrationBuilder.DropIndex(
                name: "ix_job_positions_department",
                table: "job_positions");

            migrationBuilder.DropCheckConstraint(
                name: "ck_job_positions_job_grade",
                table: "job_positions");

            migrationBuilder.DropColumn(
                name: "deactivated_reason",
                table: "users");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "job_positions");

            migrationBuilder.DropColumn(
                name: "job_grade",
                table: "job_positions");
        }
    }
}
