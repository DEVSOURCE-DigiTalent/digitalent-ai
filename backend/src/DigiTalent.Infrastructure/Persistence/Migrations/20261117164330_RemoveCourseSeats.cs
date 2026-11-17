using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DigiTalent.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Schema v3.9: a paid course is bought once for the whole organization instead of per seat, and Platform Admin no
    /// longer grants courses. course_seat_orders is renamed course_orders in place, seats / unit_price / kind are
    /// dropped, total_amount becomes amount, and price_per_seat becomes price on the catalog tables.
    /// Seat-era data is first brought to the new model: orders on a historical A-code course move to the M-code course
    /// of the same code, one order per organization and course remains, and it is priced once.
    /// </summary>
    public partial class RemoveCourseSeats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. A1-I and M1-I are the same course (CourseCodes.Aliases): orders follow the current M-code row.
            // 2. One order per organization and course: the earliest purchase is kept (the earliest grant when there
            //    was no purchase); the other orders of that course were extra seats, which no longer exist.
            // 3. The order buys the course once, at its list price of the time (the old per-seat unit price); a former
            //    grant keeps the course open at 0 đ.
            migrationBuilder.Sql("""
                UPDATE course_seat_orders o SET course_id = m.id
                FROM platform_courses a
                JOIN platform_courses m ON m.code = 'M' || substr(a.code, 2)
                WHERE o.course_id = a.id AND a.code ~ '^A[1-6]-[FIA]$';

                WITH ranked AS (
                    SELECT id, row_number() OVER (PARTITION BY organization_id, course_id
                                                  ORDER BY (kind = 'PURCHASE') DESC, created_at, id) AS rn
                    FROM course_seat_orders)
                DELETE FROM course_seat_orders o USING ranked r WHERE o.id = r.id AND r.rn > 1;

                UPDATE course_seat_orders SET total_amount = CASE WHEN kind = 'PURCHASE' THEN unit_price ELSE 0 END;
                """);

            migrationBuilder.DropCheckConstraint(name: "ck_course_seat_orders_seats", table: "course_seat_orders");
            migrationBuilder.DropCheckConstraint(name: "ck_course_seat_orders_amount", table: "course_seat_orders");
            migrationBuilder.DropCheckConstraint(name: "ck_course_seat_orders_kind", table: "course_seat_orders");
            migrationBuilder.DropCheckConstraint(name: "ck_course_seat_orders_grant_reason", table: "course_seat_orders");

            migrationBuilder.RenameTable(name: "course_seat_orders", newName: "course_orders");
            migrationBuilder.DropColumn(name: "seats", table: "course_orders");
            migrationBuilder.DropColumn(name: "unit_price", table: "course_orders");
            migrationBuilder.DropColumn(name: "kind", table: "course_orders");
            migrationBuilder.RenameColumn(name: "total_amount", table: "course_orders", newName: "amount");

            migrationBuilder.Sql("""
                ALTER TABLE course_orders RENAME CONSTRAINT pk_course_seat_orders TO pk_course_orders;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_organizations_organization_id TO fk_course_orders_organizations_organization_id;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_platform_courses_course_id TO fk_course_orders_platform_courses_course_id;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_users_created_by_user_id TO fk_course_orders_users_created_by_user_id;
                UPDATE course_orders SET reason = 'Doanh nghiệp mua khóa học' WHERE reason = 'Doanh nghiệp đăng ký mua suất học';
                """);
            migrationBuilder.RenameIndex(name: "ix_course_seat_orders_course", table: "course_orders", newName: "ix_course_orders_course");
            migrationBuilder.RenameIndex(name: "ix_course_seat_orders_created_by_user_id", table: "course_orders", newName: "ix_course_orders_created_by_user_id");
            migrationBuilder.RenameIndex(name: "ix_course_seat_orders_org_created", table: "course_orders", newName: "ix_course_orders_org_created");
            migrationBuilder.AddCheckConstraint(name: "ck_course_orders_amount", table: "course_orders", sql: "amount >= 0");

            migrationBuilder.DropCheckConstraint(name: "ck_platform_courses_price", table: "platform_courses");
            migrationBuilder.DropCheckConstraint(name: "ck_platform_catalog_courses_price", table: "platform_catalog_courses");
            migrationBuilder.RenameColumn(name: "price_per_seat", table: "platform_courses", newName: "price");
            migrationBuilder.RenameColumn(name: "price_per_seat", table: "platform_catalog_courses", newName: "price");
            migrationBuilder.AddCheckConstraint(name: "ck_platform_courses_price", table: "platform_courses", sql: "price >= 0 AND (level > 1 OR price = 0)");
            migrationBuilder.AddCheckConstraint(name: "ck_platform_catalog_courses_price", table: "platform_catalog_courses", sql: "price >= 0 AND (level > 1 OR price = 0)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_platform_courses_price", table: "platform_courses");
            migrationBuilder.DropCheckConstraint(name: "ck_platform_catalog_courses_price", table: "platform_catalog_courses");
            migrationBuilder.RenameColumn(name: "price", table: "platform_courses", newName: "price_per_seat");
            migrationBuilder.RenameColumn(name: "price", table: "platform_catalog_courses", newName: "price_per_seat");
            migrationBuilder.AddCheckConstraint(name: "ck_platform_courses_price", table: "platform_courses", sql: "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");
            migrationBuilder.AddCheckConstraint(name: "ck_platform_catalog_courses_price", table: "platform_catalog_courses", sql: "price_per_seat >= 0 AND (level > 1 OR price_per_seat = 0)");

            migrationBuilder.DropCheckConstraint(name: "ck_course_orders_amount", table: "course_orders");
            migrationBuilder.RenameIndex(name: "ix_course_orders_course", table: "course_orders", newName: "ix_course_seat_orders_course");
            migrationBuilder.RenameIndex(name: "ix_course_orders_created_by_user_id", table: "course_orders", newName: "ix_course_seat_orders_created_by_user_id");
            migrationBuilder.RenameIndex(name: "ix_course_orders_org_created", table: "course_orders", newName: "ix_course_seat_orders_org_created");
            migrationBuilder.Sql("""
                ALTER TABLE course_orders RENAME CONSTRAINT pk_course_orders TO pk_course_seat_orders;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_orders_organizations_organization_id TO fk_course_seat_orders_organizations_organization_id;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_orders_platform_courses_course_id TO fk_course_seat_orders_platform_courses_course_id;
                ALTER TABLE course_orders RENAME CONSTRAINT fk_course_orders_users_created_by_user_id TO fk_course_seat_orders_users_created_by_user_id;
                UPDATE course_orders SET reason = 'Doanh nghiệp đăng ký mua suất học' WHERE reason = 'Doanh nghiệp mua khóa học';
                """);

            // Each order comes back as one purchased seat at the amount paid. Orders merged by Up (extra seats of the
            // same course, A-code duplicates) are not restored.
            migrationBuilder.RenameColumn(name: "amount", table: "course_orders", newName: "total_amount");
            migrationBuilder.AddColumn<string>(name: "kind", table: "course_orders", type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PURCHASE");
            migrationBuilder.AddColumn<int>(name: "seats", table: "course_orders", type: "integer", nullable: false, defaultValue: 1);
            migrationBuilder.AddColumn<long>(name: "unit_price", table: "course_orders", type: "bigint", nullable: false, defaultValue: 0L);
            migrationBuilder.Sql("UPDATE course_orders SET unit_price = total_amount;");
            migrationBuilder.RenameTable(name: "course_orders", newName: "course_seat_orders");

            migrationBuilder.AddCheckConstraint(name: "ck_course_seat_orders_seats", table: "course_seat_orders", sql: "seats > 0");
            migrationBuilder.AddCheckConstraint(name: "ck_course_seat_orders_amount", table: "course_seat_orders", sql: "unit_price >= 0 AND total_amount >= 0");
            migrationBuilder.AddCheckConstraint(name: "ck_course_seat_orders_kind", table: "course_seat_orders", sql: "kind IN ('PURCHASE','ADMIN_GRANT')");
            migrationBuilder.AddCheckConstraint(name: "ck_course_seat_orders_grant_reason", table: "course_seat_orders", sql: "kind <> 'ADMIN_GRANT' OR reason IS NOT NULL");
        }
    }
}
