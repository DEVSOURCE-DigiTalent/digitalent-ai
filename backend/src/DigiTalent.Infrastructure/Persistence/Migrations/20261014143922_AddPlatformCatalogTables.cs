using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformCatalogTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_organizations_status",
                table: "organizations");

            migrationBuilder.CreateTable(
                name: "platform_framework_domains",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    published_description = table.Column<string>(type: "text", nullable: false),
                    draft_description = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_framework_domains", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "platform_framework_releases",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    snapshot = table.Column<string>(type: "jsonb", nullable: false),
                    release_note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_framework_releases", x => x.id);
                    table.CheckConstraint("ck_platform_framework_releases_version", "version_no >= 1");
                    table.ForeignKey(
                        name: "fk_platform_framework_releases_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    domain_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<short>(type: "smallint", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    outcome = table.Column<string>(type: "text", nullable: false),
                    price_per_seat = table.Column<long>(type: "bigint", nullable: false),
                    sales_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    draft_title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    draft_outcome = table.Column<string>(type: "text", nullable: true),
                    draft_price_per_seat = table.Column<long>(type: "bigint", nullable: true),
                    draft_sales_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_courses", x => x.id);
                    table.CheckConstraint("ck_platform_courses_draft_price", "draft_price_per_seat IS NULL OR (draft_price_per_seat >= 0 AND (level > 1 OR draft_price_per_seat = 0))");
                    table.CheckConstraint("ck_platform_courses_draft_sales_status", "draft_sales_status IS NULL OR draft_sales_status IN ('OPEN','PAUSED')");
                    table.CheckConstraint("ck_platform_courses_level", "level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_platform_courses_price", "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");
                    table.CheckConstraint("ck_platform_courses_sales_status", "sales_status IN ('OPEN','PAUSED')");
                    table.CheckConstraint("ck_platform_courses_version", "version_no >= 1");
                    table.ForeignKey(
                        name: "fk_platform_courses_platform_framework_domains_domain_id",
                        column: x => x.domain_id,
                        principalTable: "platform_framework_domains",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "course_seat_orders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    seats = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    unit_price = table.Column<long>(type: "bigint", nullable: false),
                    total_amount = table.Column<long>(type: "bigint", nullable: false),
                    reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_course_seat_orders", x => x.id);
                    table.CheckConstraint("ck_course_seat_orders_amount", "unit_price >= 0 AND total_amount >= 0");
                    table.CheckConstraint("ck_course_seat_orders_grant_reason", "kind <> 'ADMIN_GRANT' OR reason IS NOT NULL");
                    table.CheckConstraint("ck_course_seat_orders_kind", "kind IN ('PURCHASE','ADMIN_GRANT')");
                    table.CheckConstraint("ck_course_seat_orders_seats", "seats > 0");
                    table.ForeignKey(
                        name: "fk_course_seat_orders_organizations_organization_id",
                        column: x => x.organization_id,
                        principalTable: "organizations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_seat_orders_platform_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "platform_courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_course_seat_orders_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_course_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    correct_answer = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    explanation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_course_questions", x => x.id);
                    table.CheckConstraint("ck_platform_course_questions_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
                    table.ForeignKey(
                        name: "fk_platform_course_questions_platform_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "platform_courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_course_questions_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_course_releases",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    outcome = table.Column<string>(type: "text", nullable: false),
                    price_per_seat = table.Column<long>(type: "bigint", nullable: false),
                    sales_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_course_releases", x => x.id);
                    table.CheckConstraint("ck_platform_course_releases_sales_status", "sales_status IN ('OPEN','PAUSED')");
                    table.ForeignKey(
                        name: "fk_platform_course_releases_platform_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "platform_courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_course_releases_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.AddCheckConstraint(
                name: "ck_organizations_status",
                table: "organizations",
                sql: "status IN ('ACTIVE','INACTIVE','SUSPENDED')");

            migrationBuilder.CreateIndex(
                name: "ix_course_seat_orders_course",
                table: "course_seat_orders",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_seat_orders_created_by_user_id",
                table: "course_seat_orders",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_course_seat_orders_org_created",
                table: "course_seat_orders",
                columns: new[] { "organization_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_platform_course_questions_course",
                table: "platform_course_questions",
                columns: new[] { "course_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_course_questions_created_by_user_id",
                table: "platform_course_questions",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_course_releases_published_by_user_id",
                table: "platform_course_releases",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_platform_course_releases_course_version",
                table: "platform_course_releases",
                columns: new[] { "course_id", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_courses_code",
                table: "platform_courses",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_platform_courses_domain_level",
                table: "platform_courses",
                columns: new[] { "domain_id", "level" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_framework_domains_code",
                table: "platform_framework_domains",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_framework_releases_published_by_user_id",
                table: "platform_framework_releases",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_framework_releases_version_no",
                table: "platform_framework_releases",
                column: "version_no",
                unique: true);


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "course_seat_orders");

            migrationBuilder.DropTable(
                name: "platform_course_questions");

            migrationBuilder.DropTable(
                name: "platform_course_releases");

            migrationBuilder.DropTable(
                name: "platform_framework_releases");

            migrationBuilder.DropTable(
                name: "platform_courses");

            migrationBuilder.DropTable(
                name: "platform_framework_domains");

            migrationBuilder.DropCheckConstraint(
                name: "ck_organizations_status",
                table: "organizations");

            migrationBuilder.AddCheckConstraint(
                name: "ck_organizations_status",
                table: "organizations",
                sql: "status IN ('ACTIVE','INACTIVE')");
        }
    }
}
