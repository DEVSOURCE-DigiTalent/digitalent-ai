# Quản trị nền tảng v2 — khung chuẩn, phiên bản khóa học, trình soạn khóa

Ngày: 2026-10-15 · Nhánh: `feature/DT-platform-admin-v2` · Thay phần "Khung chuẩn" và "Chương trình học" của bảng điều khiển Pulse
(`docs/ui-redesign/16-pulse-product-flow-detailed.md` §12.4/§12.6). Schema: `docs/database/DigiTalent_AI_Canonical_v3_2.sql`
(delta trên v3_1), migration `20261015150234_PlatformCatalogVersions`.

Phạm vi vòng này: **chỉ trong không gian quản trị nền tảng**. Nội dung soạn ở đây (mô đun, khối, câu hỏi) chưa đẩy sang tổ chức
và cổng nhân viên; nhân viên vẫn học theo `courses` / `course_modules` của tổ chức (khớp theo mã khóa).

## Menu (7 mục)

| # | Mục | Màn | Đường dẫn |
|---|-----|-----|-----------|
| 1 | Tổng quan | PA-01 | `/platform/dashboard` |
| 2 | Khung chuẩn | PA-02 | `/platform/frameworks` (khung duy nhất; `/platform/frameworks/:id` cũ chuyển về đây) |
| 3 | Phiên bản khóa học | PA-03, PA-12, PA-04 | `/platform/versions`, `/platform/versions/:versionNo`, `/platform/versions/:versionNo/courses/:courseId` |
| 4 | Tổ chức | PA-05, PA-06 | `/platform/organizations`, `/platform/organizations/:id` |
| 5 | Người dùng | PA-07, PA-08 | `/platform/users`, `/platform/users/:id` |
| 6 | Đơn giá | PA-09 | `/platform/commerce` |
| 7 | Nhật ký kiểm tra | PA-10 | `/platform/audit-log` |

Đường dẫn cũ `/platform/framework`, `/platform/curriculum`, `/platform/curriculum/:code`, `/platform/courses…` chuyển hướng
sang màn mới (`app/routes/platform.routes.tsx`, `legacy-redirects.tsx`).

## Mô hình

- **Khung chuẩn**: nền tảng dùng **một khung** — Thông tư 02/2025 (`TT02_2025`, do `PlatformCatalogSeeder` tạo); không thêm, sửa
  hay xóa khung. Bảng `platform_frameworks` vẫn để được nhiều khung nhưng màn hình mở khung đầu tiên. Lịch sử công bố khung ở
  `platform_framework_releases`.
- **Lĩnh vực** (`platform_framework_domains`) thêm, sửa, xóa được:
  - **Thêm**: tên (không trùng lĩnh vực khác trong khung — `DUPLICATE_DOMAIN_NAME`) và mô tả; mã tự sinh `<mã khung>_D<n>`.
  - **Sửa**: tên đổi ngay; mô tả lưu vào `draft_description` và chỉ hiện với doanh nghiệp khi **công bố khung** (chép sang
    `published_description`, mỗi lĩnh vực ≥ 10 ký tự — `DOMAIN_DESCRIPTION_REQUIRED`).
  - **Xóa** = lưu trữ (`status = ARCHIVED`, không xóa cứng): chỉ khi lĩnh vực không có khóa trong bản đang dùng hoặc bản nháp
    (`DOMAIN_HAS_COURSES`) và khung còn ít nhất một lĩnh vực khác (`LAST_DOMAIN`). Khóa đã công bố luôn ở lại nên lĩnh vực doanh
    nghiệp đang học không xóa được. Lĩnh vực đã xóa ẩn khỏi khung và số liệu, không nhận khóa mới (`DOMAIN_NOT_FOUND`); tên của nó
    dùng lại được.
- **Phiên bản khóa học** (`platform_catalog_versions`): một phiên bản = **toàn bộ chương trình**. Tối đa một `CURRENT` (⚓ neo —
  bản các tổ chức đang dùng) và một `DRAFT`; bản cũ thành `RETIRED`. Tạo bản nháp = **chép sâu** bản `CURRENT` (khóa, mô đun, khối,
  mục slide, câu hỏi, phương án; tệp dùng chung). Chỉ bản nháp sửa được; mọi thay đổi khóa đánh dấu `change_kind` = `EDITED`
  (khóa thêm mới là `NEW`, còn lại `UNCHANGED`).
- **Khóa trong phiên bản** (`platform_catalog_courses`): thông tin, giá, trạng thái bán, bài cuối khóa (tên, đề HTML, tiêu chí).
  `platform_courses` giữ danh tính ổn định (mã) và phản chiếu khóa như trong bản `CURRENT` (đơn giá, cấp suất, cổng doanh nghiệp đọc ở đây).
  Mã khóa sửa được tới khi khóa được công bố lần đầu (`CODE_LOCKED`). Chỉ bỏ được khóa `NEW` (`COURSE_PUBLISHED`); khóa đã công bố
  thì tạm ngưng bán.
- **Nội dung**: mô đun (`platform_course_modules`, kèm tên bài ôn tập) → khối (`platform_module_blocks`): `TEXT` (HTML đã lọc),
  `SLIDE` (`platform_slide_items`: ảnh và video xen kẽ, cuộn ngang, ≤ 30 mục), `IMAGE`, `VIDEO`; câu hỏi ôn tập
  (`platform_module_questions` + `platform_question_options`, 2–5 phương án, đúng một đáp án, gắn với một khối cùng mô đun).
- **Tệp** (`platform_assets`): ảnh JPG/PNG/WebP/GIF ≤ 10 MB, video MP4/WebM/MOV ≤ 500 MB, lưu bằng `IFileStorageService`.
  Thẻ `<img>/<video>` không gửi token nên tệp phục vụ qua **liên kết ký HMAC** (`PlatformAssetUrlSigner`, khóa từ `Jwt:SigningKey`,
  hạn 12 giờ làm tròn theo giờ) và hỗ trợ tua (range request).
- **HTML**: `HtmlContentSanitizer` (Ganss.Xss) chỉ giữ p, h2–h4, đậm, nghiêng, gạch chân, gạch ngang, danh sách, trích dẫn, liên kết
  (http/https/mailto, thêm `rel="noopener noreferrer"`), căn lề. Trình soạn TipTap chỉ tạo đúng các thẻ đó.

## Công bố phiên bản

`GET …/publish-check` chỉ kiểm khóa `NEW`/`EDITED`:

| Mức | Điều kiện |
|-----|-----------|
| Chặn | Bản nháp chưa có khóa thay đổi; thiếu tên khóa; kết quả học < 10 ký tự; thiếu đề bài cuối khóa hoặc tiêu chí chấm; khóa không có mô đun; mô đun không có khối; khối rỗng (chữ trống, slide không mục, ảnh/video chưa tải); mô đun < 2 câu hỏi; câu hỏi thiếu nội dung, phương án hoặc đáp án đúng |
| Nên sửa | Mô đun < 6 câu (mỗi lần làm rút 2 câu, đủ 6 câu thì 3 lần đầu không lặp); câu hỏi chưa gắn khối |

Công bố (`PUBLISH_BLOCKED` nếu còn mục chặn): bản nháp → `CURRENT`, bản đang dùng → `RETIRED`, cập nhật `platform_courses`
theo bản mới, công bố các khung `DRAFT` có khóa trong bản, ghi nhật ký `PLATFORM_CATALOG_PUBLISHED`.

## Tổ chức, người dùng, đơn giá

- **Tổ chức**: gói = `subscriptions` mới nhất của tổ chức (tên gói, chu kỳ, số nhân viên tối đa, ngày gia hạn); giai đoạn TRIAL/PAID
  như cũ (PAID = có suất đã mua). **Khóa đang dùng theo cấp** và **nhân viên tham gia** đếm từ `enrollments` (trừ CANCELLED, nhân viên
  ARCHIVED) của nhân viên tổ chức, khớp `courses.code` với `platform_courses.code`; chi tiết tổ chức có bảng từng khóa (tham gia / hoàn thành).
- **Người dùng thử**: tài khoản cá nhân có `user_subscriptions`. `trial` = `ACTIVE` (TRIALING, chưa hết hạn), `ENDING_SOON`
  (hết hạn trong 2 ngày), `ENDED` (TRIAL_EXPIRED hoặc TRIALING đã quá `trial_ends_at` — tài khoản về gói `IND_FREE`), `ANY`.
  Lọc theo dùng thử thì xếp người hết hạn sớm nhất lên đầu; danh sách trả thêm `trials { active, endingSoon, ended }`.
- **Đơn giá**: bảng giá khóa đã công bố — giá đang dùng (bản ⚓) cạnh giá bản nháp; sửa nhiều khóa một lần
  (`PUT …/versions/{n}/prices`), khóa Cơ bản luôn 0 ₫, khóa đổi giá thành `EDITED`, áp dụng khi công bố bản nháp.
  Khóa mới trong bản nháp đặt giá ở trang soạn khóa.

## API (`PlatformCatalogController`, `PlatformAdminController`, gốc `api/v1/platform`)

| Phương thức | Đường dẫn | Quyền |
|-------------|-----------|-------|
| GET | `frameworks` (khung kèm số khóa theo cấp) | catalog.read |
| GET | `frameworks/{id}` (lĩnh vực, khóa trong bản đang dùng và khóa mới trong bản nháp, lịch sử) | catalog.read |
| POST · PUT · DELETE | `frameworks/{id}/domains` (thêm) · `frameworks/{id}/domains/{domainId}` (sửa `{ name, description? }` / xóa) | catalog.manage |
| PUT · POST | `frameworks/{id}/draft` (mô tả nháp) · `/publish` (công bố khung) | catalog.manage |
| GET / POST | `catalog/versions` (danh sách / tạo bản nháp) | catalog.read / catalog.manage |
| GET | `catalog/versions/{n}` · `/publish-check` | catalog.read |
| POST · PUT | `catalog/versions/{n}/publish` · `/prices` | catalog.manage |
| POST | `catalog/versions/{n}/courses` | catalog.manage |
| GET / PUT / DELETE | `catalog/versions/{n}/courses/{courseId}` | read / manage / manage |
| PUT | `…/courses/{courseId}/final` | catalog.manage |
| POST · PUT · DELETE · POST | `…/modules`, `…/modules/{id}`, `…/modules/{id}/move` | catalog.manage |
| POST · PUT · DELETE · POST | `…/modules/{id}/blocks`, `…/blocks/{id}`, `…/blocks/{id}/move` | catalog.manage |
| POST · PUT · DELETE | `…/modules/{id}/questions`, `…/questions/{id}` | catalog.manage |
| POST | `assets` (multipart, trường `file`) | catalog.manage |
| GET | `assets/{id}/content?exp=&sig=` | liên kết ký, không cần token |
| GET | `organizations` (thêm gói, `coursesInUseByLevel`, `participantCount`), `organizations/{id}` (thêm `coursesInUse`) | organization.read |
| GET | `users?trial=` (thêm `planCode`, `trialState`, `trialEndsAt`, `trials`) | user.read |

Mọi thao tác sửa nội dung trả lại **toàn bộ khóa** (`PlatformCatalogCourseDetail`) để giao diện thay bộ nhớ đệm một lần.
Nhật ký: `PLATFORM_FRAMEWORK_DOMAIN_UPDATED`, `PLATFORM_FRAMEWORK_DOMAIN_ARCHIVED`, `PLATFORM_FRAMEWORK_DOMAIN_ADDED`, `PLATFORM_FRAMEWORK_DRAFT_SAVED`, `PLATFORM_FRAMEWORK_PUBLISHED`,
`PLATFORM_CATALOG_DRAFT_CREATED`, `PLATFORM_CATALOG_COURSE_ADDED`, `PLATFORM_CATALOG_COURSE_REMOVED`, `PLATFORM_CATALOG_PRICES_UPDATED`,
`PLATFORM_CATALOG_PUBLISHED` (sửa từng khối/câu hỏi không ghi nhật ký; mục công bố ghi ghi chú phiên bản làm lý do và số khóa
thêm mới / đã sửa).

## Giao diện (`frontend/src/features/platform/`)

- Trang: `console/PlatformFrameworkPage` (khung duy nhất: lĩnh vực với nút Sửa / Xóa, thêm lĩnh vực, công bố mô tả), `PlatformVersionsPage` (thanh neo ⚓, danh sách phiên bản,
  bảng khóa theo khung, thêm khóa, hộp thoại công bố có kiểm tra), `PlatformCourseBuilderPage` (mục lục: thông tin → mô đun → bài cuối
  khóa; `?s=0..n|final` giữ vị trí khi tải lại), `PlatformOrganizationsPage`, `PlatformUsersPage`, `PlatformCommercePage` (Đơn giá).
- Trình soạn (`builder/`): `ModuleEditor` (tên mô đun, nút "+" giữa các khối mở 4 loại Chữ / Slide / Ảnh / Video), `BlockCard`
  (thẻ xem trước, bấm để sửa; chữ tự lưu 1 giây sau khi dừng gõ; slide/ảnh/video tải lên có thanh tiến độ), `RichTextEditor` (TipTap),
  `QuizEditor`, `FinalEditor`, `CourseInfoForm`, `LearnerPreview` ("Xem như nhân viên").
- Dữ liệu: `services/platform-catalog.service.ts` + `hooks/use-platform-catalog.ts` (`useCourseEdit` cho mọi thao tác soạn khóa).
  CSS: `pulse-catalog.css` (thêm sau `pulse-mock.css` / `pulse-admin.css`, chỉ giao diện sáng như mock).
- Bản đang dùng và bản đã thay chỉ xem; nút "Sửa trong vN" / "Tạo bản nháp để sửa" mở cùng khóa trong bản nháp.

## Kiểm thử

- Backend `tests/DigiTalent.Tests/Platform/PlatformCatalogTests.cs` (seed, chép sâu, soạn nội dung, lọc HTML, kiểm tra công bố, neo,
  bỏ khóa, thêm/sửa/xóa lĩnh vực, tệp và liên kết ký, đơn giá bản nháp) và `PlatformAdminTests.cs` (tổ chức: gói/khóa theo cấp/tham gia; người dùng thử).
- Frontend `features/platform/__tests__/` (tổng quan, khung và thêm/sửa/xóa lĩnh vực, phiên bản, công bố bị chặn, nút "+", bản chỉ xem, tổ chức, người dùng thử,
  đơn giá, điều hướng).
