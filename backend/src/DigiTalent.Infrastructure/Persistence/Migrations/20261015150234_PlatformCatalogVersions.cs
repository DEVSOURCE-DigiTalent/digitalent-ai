using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PlatformCatalogVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "platform_course_questions");

            migrationBuilder.DropTable(
                name: "platform_course_releases");

            migrationBuilder.DropIndex(
                name: "ix_platform_framework_releases_version_no",
                table: "platform_framework_releases");

            migrationBuilder.DropIndex(
                name: "uq_platform_courses_domain_level",
                table: "platform_courses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_courses_draft_price",
                table: "platform_courses");

            migrationBuilder.DropCheckConstraint(
                name: "ck_platform_courses_draft_sales_status",
                table: "platform_courses");

            migrationBuilder.DropColumn(
                name: "draft_outcome",
                table: "platform_courses");

            migrationBuilder.DropColumn(
                name: "draft_price_per_seat",
                table: "platform_courses");

            migrationBuilder.DropColumn(
                name: "draft_sales_status",
                table: "platform_courses");

            migrationBuilder.DropColumn(
                name: "draft_title",
                table: "platform_courses");

            migrationBuilder.AddColumn<Guid>(
                name: "framework_id",
                table: "platform_framework_releases",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "platform_framework_domains",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<Guid>(
                name: "framework_id",
                table: "platform_framework_domains",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "platform_courses",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.CreateTable(
                name: "platform_assets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    uploaded_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_assets", x => x.id);
                    table.CheckConstraint("ck_platform_assets_kind", "kind IN ('IMAGE','VIDEO')");
                    table.CheckConstraint("ck_platform_assets_size", "size_bytes > 0 AND (kind <> 'IMAGE' OR size_bytes <= 10485760) AND (kind <> 'VIDEO' OR size_bytes <= 524288000)");
                    table.ForeignKey(
                        name: "fk_platform_assets_users_uploaded_by_user_id",
                        column: x => x.uploaded_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_catalog_versions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    based_on_version_id = table.Column<Guid>(type: "uuid", nullable: true),
                    release_note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_catalog_versions", x => x.id);
                    table.CheckConstraint("ck_platform_catalog_versions_published", "status = 'DRAFT' OR published_at IS NOT NULL");
                    table.CheckConstraint("ck_platform_catalog_versions_status", "status IN ('DRAFT','CURRENT','RETIRED')");
                    table.CheckConstraint("ck_platform_catalog_versions_version", "version_no >= 1");
                    table.ForeignKey(
                        name: "fk_platform_catalog_versions_platform_catalog_versions_based_o",
                        column: x => x.based_on_version_id,
                        principalTable: "platform_catalog_versions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_catalog_versions_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_catalog_versions_users_published_by_user_id",
                        column: x => x.published_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_frameworks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    current_version_no = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_frameworks", x => x.id);
                    table.CheckConstraint("ck_platform_frameworks_published", "status <> 'PUBLISHED' OR current_version_no >= 1");
                    table.CheckConstraint("ck_platform_frameworks_status", "status IN ('DRAFT','PUBLISHED','ARCHIVED')");
                    table.CheckConstraint("ck_platform_frameworks_version", "current_version_no >= 0");
                    table.ForeignKey(
                        name: "fk_platform_frameworks_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_catalog_courses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_id = table.Column<Guid>(type: "uuid", nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    change_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    domain_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<short>(type: "smallint", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    outcome = table.Column<string>(type: "text", nullable: false),
                    price_per_seat = table.Column<long>(type: "bigint", nullable: false),
                    sales_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    final_title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    final_prompt = table.Column<string>(type: "text", nullable: false),
                    final_criteria = table.Column<string>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_catalog_courses", x => x.id);
                    table.CheckConstraint("ck_platform_catalog_courses_change", "change_kind IN ('NEW','EDITED','UNCHANGED')");
                    table.CheckConstraint("ck_platform_catalog_courses_level", "level BETWEEN 1 AND 3");
                    table.CheckConstraint("ck_platform_catalog_courses_price", "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");
                    table.CheckConstraint("ck_platform_catalog_courses_sales_status", "sales_status IN ('OPEN','PAUSED')");
                    table.ForeignKey(
                        name: "fk_platform_catalog_courses_platform_catalog_versions_version_",
                        column: x => x.version_id,
                        principalTable: "platform_catalog_versions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_catalog_courses_platform_courses_course_id",
                        column: x => x.course_id,
                        principalTable: "platform_courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_catalog_courses_platform_framework_domains_domain_",
                        column: x => x.domain_id,
                        principalTable: "platform_framework_domains",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_course_modules",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    catalog_course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    quiz_title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_course_modules", x => x.id);
                    table.ForeignKey(
                        name: "fk_platform_course_modules_platform_catalog_courses_catalog_co",
                        column: x => x.catalog_course_id,
                        principalTable: "platform_catalog_courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_module_blocks",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    block_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    body_html = table.Column<string>(type: "text", nullable: true),
                    asset_id = table.Column<Guid>(type: "uuid", nullable: true),
                    caption = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    alt_text = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_module_blocks", x => x.id);
                    table.CheckConstraint("ck_platform_module_blocks_asset", "asset_id IS NULL OR block_type IN ('IMAGE','VIDEO')");
                    table.CheckConstraint("ck_platform_module_blocks_text", "(block_type = 'TEXT') = (body_html IS NOT NULL)");
                    table.CheckConstraint("ck_platform_module_blocks_type", "block_type IN ('TEXT','SLIDE','IMAGE','VIDEO')");
                    table.ForeignKey(
                        name: "fk_platform_module_blocks_platform_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_module_blocks_platform_course_modules_module_id",
                        column: x => x.module_id,
                        principalTable: "platform_course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_module_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    module_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    question_text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    explanation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    block_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_module_questions", x => x.id);
                    table.ForeignKey(
                        name: "fk_platform_module_questions_platform_course_modules_module_id",
                        column: x => x.module_id,
                        principalTable: "platform_course_modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_module_questions_platform_module_blocks_block_id",
                        column: x => x.block_id,
                        principalTable: "platform_module_blocks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_slide_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    block_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    asset_id = table.Column<Guid>(type: "uuid", nullable: false),
                    caption = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_slide_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_platform_slide_items_platform_assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "platform_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_platform_slide_items_platform_module_blocks_block_id",
                        column: x => x.block_id,
                        principalTable: "platform_module_blocks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "platform_question_options",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    question_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    option_text = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_correct = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_platform_question_options", x => x.id);
                    table.ForeignKey(
                        name: "fk_platform_question_options_platform_module_questions_questio",
                        column: x => x.question_id,
                        principalTable: "platform_module_questions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "uq_platform_framework_releases_framework_version",
                table: "platform_framework_releases",
                columns: new[] { "framework_id", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_framework_domains_framework",
                table: "platform_framework_domains",
                columns: new[] { "framework_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_courses_domain_level",
                table: "platform_courses",
                columns: new[] { "domain_id", "level" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_assets_storage_key",
                table: "platform_assets",
                column: "storage_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_assets_uploaded_by_user_id",
                table: "platform_assets",
                column: "uploaded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_courses_course",
                table: "platform_catalog_courses",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_courses_domain_id",
                table: "platform_catalog_courses",
                column: "domain_id");

            migrationBuilder.CreateIndex(
                name: "uq_platform_catalog_courses_version_course",
                table: "platform_catalog_courses",
                columns: new[] { "version_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_based_on_version_id",
                table: "platform_catalog_versions",
                column: "based_on_version_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_created_by_user_id",
                table: "platform_catalog_versions",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_published_by_user_id",
                table: "platform_catalog_versions",
                column: "published_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_status",
                table: "platform_catalog_versions",
                column: "status",
                unique: true,
                filter: "status = 'CURRENT'");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_status1",
                table: "platform_catalog_versions",
                column: "status",
                unique: true,
                filter: "status = 'DRAFT'");

            migrationBuilder.CreateIndex(
                name: "ix_platform_catalog_versions_version_no",
                table: "platform_catalog_versions",
                column: "version_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_course_modules_course",
                table: "platform_course_modules",
                columns: new[] { "catalog_course_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_frameworks_code",
                table: "platform_frameworks",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_frameworks_created_by_user_id",
                table: "platform_frameworks",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_module_blocks_asset_id",
                table: "platform_module_blocks",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_module_blocks_module",
                table: "platform_module_blocks",
                columns: new[] { "module_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_module_questions_block_id",
                table: "platform_module_questions",
                column: "block_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_module_questions_module",
                table: "platform_module_questions",
                columns: new[] { "module_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ix_platform_question_options_question",
                table: "platform_question_options",
                columns: new[] { "question_id", "sort_order" });

            migrationBuilder.CreateIndex(
                name: "ux_platform_question_options_correct",
                table: "platform_question_options",
                column: "question_id",
                unique: true,
                filter: "is_correct");

            migrationBuilder.CreateIndex(
                name: "ix_platform_slide_items_asset_id",
                table: "platform_slide_items",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "ix_platform_slide_items_block",
                table: "platform_slide_items",
                columns: new[] { "block_id", "sort_order" });

            // Existing data (hand-written, SQL v3.2): the six domains and their releases belong to the Circular 02/2025
            // framework; the published courses become catalog version v1, in use. A fresh database has none of these
            // rows — PlatformCatalogSeeder creates them. Module content of v1 is filled in by the seeder.
            migrationBuilder.Sql("""
                INSERT INTO platform_frameworks (id, code, name, description, status, current_version_no, sort_order, created_at, updated_at)
                SELECT gen_random_uuid(), 'TT02_2025', 'Thông tư 02/2025 · Năng lực số',
                       'Khung năng lực số theo Thông tư 02/2025: 6 lĩnh vực, mỗi lĩnh vực có khóa Cơ bản, Trung cấp và Nâng cao.',
                       'PUBLISHED', GREATEST(1, COALESCE((SELECT max(version_no) FROM platform_framework_releases), 1)), 1, now(), now()
                WHERE EXISTS (SELECT 1 FROM platform_framework_domains);

                UPDATE platform_framework_domains
                SET framework_id = (SELECT id FROM platform_frameworks WHERE code = 'TT02_2025')
                WHERE framework_id = '00000000-0000-0000-0000-000000000000';

                UPDATE platform_framework_releases
                SET framework_id = (SELECT id FROM platform_frameworks WHERE code = 'TT02_2025')
                WHERE framework_id = '00000000-0000-0000-0000-000000000000';

                UPDATE platform_courses SET version_no = 1;

                INSERT INTO platform_catalog_versions (id, version_no, status, release_note, published_at, created_at, updated_at)
                SELECT gen_random_uuid(), 1, 'CURRENT', 'Phiên bản đầu tiên: các khóa chuẩn đang dùng trước khi có phiên bản chương trình.', now(), now(), now()
                WHERE EXISTS (SELECT 1 FROM platform_courses);

                INSERT INTO platform_catalog_courses (id, version_id, course_id, change_kind, domain_id, level, title, outcome,
                                                      price_per_seat, sales_status, final_title, final_prompt, final_criteria,
                                                      created_at, updated_at)
                SELECT gen_random_uuid(), v.id, c.id, 'UNCHANGED', c.domain_id, c.level, c.title, c.outcome,
                       c.price_per_seat, c.sales_status, 'Bài cuối khóa', '',
                       '["Nguồn có thể truy vết","Hành động có thể kiểm tra","Kết luận có căn cứ"]'::jsonb, now(), now()
                FROM platform_courses c
                CROSS JOIN platform_catalog_versions v
                WHERE v.version_no = 1 AND c.published_at IS NOT NULL;
                """);

            migrationBuilder.AddForeignKey(
                name: "fk_platform_framework_domains_platform_frameworks_framework_id",
                table: "platform_framework_domains",
                column: "framework_id",
                principalTable: "platform_frameworks",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_platform_framework_releases_platform_frameworks_framework_id",
                table: "platform_framework_releases",
                column: "framework_id",
                principalTable: "platform_frameworks",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_platform_framework_domains_platform_frameworks_framework_id",
                table: "platform_framework_domains");

            migrationBuilder.DropForeignKey(
                name: "fk_platform_framework_releases_platform_frameworks_framework_id",
                table: "platform_framework_releases");

            migrationBuilder.DropTable(
                name: "platform_frameworks");

            migrationBuilder.DropTable(
                name: "platform_question_options");

            migrationBuilder.DropTable(
                name: "platform_slide_items");

            migrationBuilder.DropTable(
                name: "platform_module_questions");

            migrationBuilder.DropTable(
                name: "platform_module_blocks");

            migrationBuilder.DropTable(
                name: "platform_assets");

            migrationBuilder.DropTable(
                name: "platform_course_modules");

            migrationBuilder.DropTable(
                name: "platform_catalog_courses");

            migrationBuilder.DropTable(
                name: "platform_catalog_versions");

            migrationBuilder.DropIndex(
                name: "uq_platform_framework_releases_framework_version",
                table: "platform_framework_releases");

            migrationBuilder.DropIndex(
                name: "ix_platform_framework_domains_framework",
                table: "platform_framework_domains");

            migrationBuilder.DropIndex(
                name: "ix_platform_courses_domain_level",
                table: "platform_courses");

            migrationBuilder.DropColumn(
                name: "framework_id",
                table: "platform_framework_releases");

            migrationBuilder.DropColumn(
                name: "framework_id",
                table: "platform_framework_domains");

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "platform_framework_domains",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(40)",
                oldMaxLength: 40);

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "platform_courses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AddColumn<string>(
                name: "draft_outcome",
                table: "platform_courses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "draft_price_per_seat",
                table: "platform_courses",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "draft_sales_status",
                table: "platform_courses",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "draft_title",
                table: "platform_courses",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "platform_course_questions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    correct_answer = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    course_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    explanation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    question_text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    outcome = table.Column<string>(type: "text", nullable: false),
                    price_per_seat = table.Column<long>(type: "bigint", nullable: false),
                    published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    published_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sales_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "ix_platform_framework_releases_version_no",
                table: "platform_framework_releases",
                column: "version_no",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_platform_courses_domain_level",
                table: "platform_courses",
                columns: new[] { "domain_id", "level" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_courses_draft_price",
                table: "platform_courses",
                sql: "draft_price_per_seat IS NULL OR (draft_price_per_seat >= 0 AND (level > 1 OR draft_price_per_seat = 0))");

            migrationBuilder.AddCheckConstraint(
                name: "ck_platform_courses_draft_sales_status",
                table: "platform_courses",
                sql: "draft_sales_status IS NULL OR draft_sales_status IN ('OPEN','PAUSED')");

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
        }
    }
}
