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
                name: "recommendation_reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    skill_gap_run_id = table.Column<Guid>(type: "uuid", nullable: false),
                    score = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    gaps_closed = table.Column<int>(type: "integer", nullable: false),
                    mandatory_closed = table.Column<int>(type: "integer", nullable: false),
                    high_closed = table.Column<int>(type: "integer", nullable: false),
                    explanation = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    decision_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    decided_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    decided_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    course_assignment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_recommendation_reviews", x => x.id);
                    table.CheckConstraint("ck_recommendation_reviews_status", "status IN ('PENDING','ACCEPTED','DISMISSED')");
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_course_assignments_course_assignment",
                        column: x => x.course_assignment_id,
                        principalTable: "course_assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_skill_gap_runs_skill_gap_run_id",
                        column: x => x.skill_gap_run_id,
                        principalTable: "skill_gap_runs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_recommendation_reviews_users_decided_by_user_id",
                        column: x => x.decided_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    plan_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    plan_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    cycle = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    seat_limit = table.Column<int>(type: "integer", nullable: true),
                    seats_used = table.Column<int>(type: "integer", nullable: false),
                    amount_per_period = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    cancel_at_period_end = table.Column<bool>(type: "boolean", nullable: false),
                    renews_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscriptions", x => x.id);
                    table.CheckConstraint("ck_subscriptions_cycle", "cycle IN ('month','year')");
                    table.CheckConstraint("ck_subscriptions_status", "status IN ('ACTIVE','EXPIRED','PAYMENT_REQUIRED','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_subscriptions_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "training_batches",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    department_id = table.Column<Guid>(type: "uuid", nullable: true),
                    job_position_id = table.Column<Guid>(type: "uuid", nullable: true),
                    start_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    due_date = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_training_batches", x => x.id);
                    table.CheckConstraint("ck_training_batches_status", "status IN ('DRAFT','ACTIVE','COMPLETED','CANCELLED')");
                    table.ForeignKey(
                        name: "fk_training_batches_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_training_batches_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_training_batches_job_positions_job_position_id",
                        column: x => x.job_position_id,
                        principalTable: "job_positions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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

            migrationBuilder.CreateTable(
                name: "invoices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    issued_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invoices", x => x.id);
                    table.CheckConstraint("ck_invoices_status", "status IN ('PAID','PENDING','FAILED','REFUNDED')");
                    table.ForeignKey(
                        name: "fk_invoices_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_invoices_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subscription_entitlements",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subscription_id = table.Column<Guid>(type: "uuid", nullable: false),
                    entitlement_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_entitlements", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscription_entitlements_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "training_batch_employees",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    training_batch_id = table.Column<Guid>(type: "uuid", nullable: false),
                    employee_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_assignment_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_training_batch_employees", x => x.id);
                    table.CheckConstraint("ck_training_batch_employees_status", "status IN ('ENROLLED','IN_PROGRESS','COMPLETED','DROPPED')");
                    table.ForeignKey(
                        name: "fk_training_batch_employees_course_assignments_course_assignme",
                        column: x => x.course_assignment_id,
                        principalTable: "course_assignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_training_batch_employees_employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_training_batch_employees_training_batches_training_batch_id",
                        column: x => x.training_batch_id,
                        principalTable: "training_batches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_invoices_org",
                table: "invoices",
                column: "organization_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_subscription_id",
                table: "invoices",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_reviews_course_assignment_id",
                table: "recommendation_reviews",
                column: "course_assignment_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_reviews_course_id",
                table: "recommendation_reviews",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_reviews_decided_by_user_id",
                table: "recommendation_reviews",
                column: "decided_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_reviews_employee_id",
                table: "recommendation_reviews",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_recommendation_reviews_skill_gap_run_id",
                table: "recommendation_reviews",
                column: "skill_gap_run_id");

            migrationBuilder.CreateIndex(
                name: "uq_recommendation_reviews_emp_course",
                table: "recommendation_reviews",
                columns: new[] { "organization_id", "employee_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_subscription_entitlements_sub_key",
                table: "subscription_entitlements",
                columns: new[] { "subscription_id", "entitlement_key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_subscriptions_org",
                table: "subscriptions",
                column: "organization_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_training_batch_employees_course_assignment_id",
                table: "training_batch_employees",
                column: "course_assignment_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batch_employees_employee_id",
                table: "training_batch_employees",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ux_training_batch_employees_batch_emp",
                table: "training_batch_employees",
                columns: new[] { "training_batch_id", "employee_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_course_id",
                table: "training_batches",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_created_by_user_id",
                table: "training_batches",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_department_id",
                table: "training_batches",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_job_position_id",
                table: "training_batches",
                column: "job_position_id");

            migrationBuilder.CreateIndex(
                name: "ix_training_batches_org_status",
                table: "training_batches",
                columns: new[] { "organization_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ux_training_batches_org_code",
                table: "training_batches",
                columns: new[] { "organization_id", "code" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "invoices");

            migrationBuilder.DropTable(
                name: "recommendation_reviews");

            migrationBuilder.DropTable(
                name: "subscription_entitlements");

            migrationBuilder.DropTable(
                name: "training_batch_employees");

            migrationBuilder.DropTable(
                name: "subscriptions");

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
