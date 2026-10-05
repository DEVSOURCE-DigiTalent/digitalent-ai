using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationOverviewSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "setup_completed_at",
                table: "organizations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "entity_label",
                table: "audit_logs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "organization_subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    seat_limit = table.Column<int>(type: "integer", nullable: true),
                    renews_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_organization_subscriptions", x => x.id);
                    table.CheckConstraint("ck_organization_subscriptions_seat_limit", "seat_limit IS NULL OR seat_limit > 0");
                    table.CheckConstraint("ck_organization_subscriptions_status", "status IN ('ACTIVE','EXPIRED','PAYMENT_REQUIRED')");
                    table.ForeignKey(
                        name: "fk_organization_subscriptions_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "recommendation_decisions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    skill_gap_run_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    decided_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    decided_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recommendation_decisions", x => x.id);
                    table.CheckConstraint("ck_recommendation_decisions_status", "status IN ('ACCEPTED','DISMISSED','REOPENED')");
                    table.ForeignKey(
                        name: "fk_recommendation_decisions_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_decisions_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_decisions_skill_gap_runs_skill_gap_run_id",
                        column: x => x.skill_gap_run_id,
                        principalTable: "skill_gap_runs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_decisions_users_decided_by_user_id",
                        column: x => x.decided_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "training_batches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: true),
                    end_date = table.Column<DateOnly>(type: "date", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_training_batches", x => x.id);
                    table.CheckConstraint("ck_training_batches_dates", "start_date IS NULL OR end_date IS NULL OR end_date >= start_date");
                    table.CheckConstraint("ck_training_batches_status", "status IN ('DRAFT','RUNNING','COMPLETED','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_training_batches_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_training_batches_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_organization_subscriptions_organization_id",
                table: "organization_subscriptions",
                column: "organization_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_decisions_course_id",
                table: "recommendation_decisions",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_decisions_decided_by_user_id",
                table: "recommendation_decisions",
                column: "decided_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_decisions_skill_gap_run_id",
                table: "recommendation_decisions",
                column: "skill_gap_run_id");

            migrationBuilder.CreateIndex(
                name: "uq_recommendation_decisions_employee_course",
                table: "recommendation_decisions",
                columns: new[] { "employee_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_created_by_user_id",
                table: "training_batches",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_org_status",
                table: "training_batches",
                columns: new[] { "organization_id", "status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "organization_subscriptions");

            migrationBuilder.DropTable(
                name: "recommendation_decisions");

            migrationBuilder.DropTable(
                name: "training_batches");

            migrationBuilder.DropColumn(
                name: "setup_completed_at",
                table: "organizations");

            migrationBuilder.DropColumn(
                name: "entity_label",
                table: "audit_logs");
        }
    }
}
