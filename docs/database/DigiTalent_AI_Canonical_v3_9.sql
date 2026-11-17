-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.9
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_8.sql + mua khóa học theo doanh nghiệp (bỏ suất học)
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.9.
-- EF Core configurations and migrations are written to match it (migration RemoveCourseSeats).
--
-- Changes v3.8 -> v3.9:
--   * Khóa có phí (Trung cấp, Nâng cao) được mua một lần cho cả doanh nghiệp: có một đơn mua là mọi nhân viên đều học
--     được. Không còn suất học, không còn đếm số nhân viên đã được giao. Platform Admin không còn cấp khóa (cấp suất).
--   * course_seat_orders đổi tên thành course_orders. Bỏ cột seats, unit_price và kind (chỉ còn một loại đơn: doanh
--     nghiệp mua khóa); total_amount đổi tên thành amount. Khóa chính, khóa ngoại và chỉ mục đổi tiền tố theo tên bảng.
--   * platform_courses.price_per_seat và platform_catalog_courses.price_per_seat đổi tên thành price: giá mua khóa cho
--     cả doanh nghiệp (khóa Cơ bản luôn 0).
--   * Dữ liệu thời suất học được quy về mô hình mới trước khi bỏ cột:
--       - A1-I và M1-I là cùng một khóa (mã A là bí danh cũ): đơn trên khóa mã A chuyển sang khóa mã M cùng mã.
--       - Mỗi tổ chức × khóa chỉ còn một đơn: giữ đơn mua sớm nhất (không có đơn mua thì giữ lần cấp sớm nhất); các đơn
--         khác của cùng khóa là suất mua thêm, không còn ý nghĩa.
--       - Đơn tính tiền một lần theo giá niêm yết lúc đó (đơn giá mỗi suất cũ); lần cấp cũ giữ khóa mở với 0 đ.
--   * Lý do mặc định của đơn mua cũ 'Doanh nghiệp đăng ký mua suất học' đổi thành 'Doanh nghiệp mua khóa học'.
--   * Không thêm ràng buộc duy nhất (organization_id, course_id) vì mã A và mã M là hai dòng platform_courses khác nhau;
--     mua lại khóa đã mua bị chặn ở use case (409) theo mọi bí danh của mã.
-- ============================================================================

BEGIN;

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

ALTER TABLE course_seat_orders
    DROP CONSTRAINT ck_course_seat_orders_seats,
    DROP CONSTRAINT ck_course_seat_orders_amount,
    DROP CONSTRAINT ck_course_seat_orders_kind,
    DROP CONSTRAINT ck_course_seat_orders_grant_reason;

ALTER TABLE course_seat_orders RENAME TO course_orders;
ALTER TABLE course_orders DROP COLUMN seats, DROP COLUMN unit_price, DROP COLUMN kind;
ALTER TABLE course_orders RENAME COLUMN total_amount TO amount;

ALTER TABLE course_orders RENAME CONSTRAINT pk_course_seat_orders TO pk_course_orders;
ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_organizations_organization_id TO fk_course_orders_organizations_organization_id;
ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_platform_courses_course_id TO fk_course_orders_platform_courses_course_id;
ALTER TABLE course_orders RENAME CONSTRAINT fk_course_seat_orders_users_created_by_user_id TO fk_course_orders_users_created_by_user_id;
ALTER INDEX ix_course_seat_orders_course RENAME TO ix_course_orders_course;
ALTER INDEX ix_course_seat_orders_created_by_user_id RENAME TO ix_course_orders_created_by_user_id;
ALTER INDEX ix_course_seat_orders_org_created RENAME TO ix_course_orders_org_created;

ALTER TABLE course_orders ADD CONSTRAINT ck_course_orders_amount CHECK (amount >= 0);

UPDATE course_orders SET reason = 'Doanh nghiệp mua khóa học' WHERE reason = 'Doanh nghiệp đăng ký mua suất học';

COMMENT ON TABLE course_orders IS
    'Khóa có phí doanh nghiệp đã mua: một đơn mở khóa cho mọi nhân viên của tổ chức. reason giữ ghi chú đơn (mã hợp đồng điện tử, người ký).';
COMMENT ON COLUMN course_orders.amount IS 'Số tiền của đơn (VND).';

ALTER TABLE platform_courses DROP CONSTRAINT ck_platform_courses_price;
ALTER TABLE platform_courses RENAME COLUMN price_per_seat TO price;
ALTER TABLE platform_courses
    ADD CONSTRAINT ck_platform_courses_price CHECK (price >= 0 AND (level > 1 OR price = 0));

ALTER TABLE platform_catalog_courses DROP CONSTRAINT ck_platform_catalog_courses_price;
ALTER TABLE platform_catalog_courses RENAME COLUMN price_per_seat TO price;
ALTER TABLE platform_catalog_courses
    ADD CONSTRAINT ck_platform_catalog_courses_price CHECK (price >= 0 AND (level > 1 OR price = 0));

COMMENT ON COLUMN platform_courses.price IS 'Giá mua khóa cho cả doanh nghiệp (VND); khóa Cơ bản luôn 0.';
COMMENT ON COLUMN platform_catalog_courses.price IS 'Giá mua khóa cho cả doanh nghiệp trong bản catalog (VND).';

COMMIT;
