using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEnterpriseGuidedTrial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "position_diagnostic_attempts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position_id = table.Column<Guid>(type: "uuid", nullable: false),
                    bundle_json = table.Column<string>(type: "text", nullable: false),
                    answers_json = table.Column<string>(type: "text", nullable: false),
                    answer_revision = table.Column<int>(type: "integer", nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    result_json = table.Column<string>(type: "text", nullable: true),
                    path_json = table.Column<string>(type: "text", nullable: true),
                    path_viewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_position_diagnostic_attempts", x => x.id);
                    table.ForeignKey(
                        name: "fk_position_diagnostic_attempts_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_position_diagnostic_attempts_job_positions_position_id",
                        column: x => x.position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_position_diagnostic_attempts_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trial_invitations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: false),
                    position_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "text", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    accepted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: true),
                    send_failed = table.Column<bool>(type: "boolean", nullable: false),
                    send_count = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_invitations", x => x.id);
                    table.ForeignKey(
                        name: "fk_trial_invitations_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_invitations_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_invitations_job_positions_position_id",
                        column: x => x.position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_invitations_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trial_registrations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    organization_name = table.Column<string>(type: "text", nullable: false),
                    owner_name = table.Column<string>(type: "text", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    industry = table.Column<string>(type: "text", nullable: false),
                    size = table.Column<string>(type: "text", nullable: false),
                    goal = table.Column<string>(type: "text", nullable: false),
                    token_hash = table.Column<string>(type: "text", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    used_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                    revision = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_registrations", x => x.id);
                    table.ForeignKey(
                        name: "fk_trial_registrations_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "trial_workspaces",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    position_id = table.Column<Guid>(type: "uuid", nullable: true),
                    industry = table.Column<string>(type: "text", nullable: false),
                    size = table.Column<string>(type: "text", nullable: false),
                    goal = table.Column<string>(type: "text", nullable: false),
                    started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ends_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    policy_json = table.Column<string>(type: "text", nullable: false),
                    bundle_json = table.Column<string>(type: "text", nullable: true),
                    results_viewed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    conversion_requested_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    converted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    conversion_reference = table.Column<string>(type: "text", nullable: true),
                    revision = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_trial_workspaces", x => x.id);
                    table.ForeignKey(
                        name: "fk_trial_workspaces_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_workspaces_job_positions_position_id",
                        column: x => x.position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_workspaces_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_trial_workspaces_users_owner_user_id",
                        column: x => x.owner_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_position_diagnostic_attempts_employee_id",
                table: "position_diagnostic_attempts",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_position_diagnostic_attempts_organization_id_employee_id",
                table: "position_diagnostic_attempts",
                columns: new[] { "organization_id", "employee_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_position_diagnostic_attempts_position_id",
                table: "position_diagnostic_attempts",
                column: "position_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_invitations_department_id",
                table: "trial_invitations",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_invitations_employee_id",
                table: "trial_invitations",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_invitations_organization_id_email",
                table: "trial_invitations",
                columns: new[] { "organization_id", "email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_invitations_position_id",
                table: "trial_invitations",
                column: "position_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_invitations_token_hash",
                table: "trial_invitations",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_registrations_email",
                table: "trial_registrations",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_registrations_organization_id",
                table: "trial_registrations",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_registrations_token_hash",
                table: "trial_registrations",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_workspaces_department_id",
                table: "trial_workspaces",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_trial_workspaces_organization_id",
                table: "trial_workspaces",
                column: "organization_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_workspaces_owner_user_id",
                table: "trial_workspaces",
                column: "owner_user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_trial_workspaces_position_id",
                table: "trial_workspaces",
                column: "position_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "position_diagnostic_attempts");

            migrationBuilder.DropTable(
                name: "trial_invitations");

            migrationBuilder.DropTable(
                name: "trial_registrations");

            migrationBuilder.DropTable(
                name: "trial_workspaces");
        }
    }
}
