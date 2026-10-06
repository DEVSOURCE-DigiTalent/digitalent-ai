# Đối chiếu Owner / Manager: server và local (06-10-2026)

## Phạm vi và cách kiểm tra

- Đọc HTML công khai của `https://digitalent-ai.duckdns.org/enterprise/me`: HTTP 200, ứng dụng Vite trả về shell; nội dung trang sau đăng nhập không quan sát trực tiếp qua HTTP công khai. Đối chiếu phần giao diện với ảnh người dùng cung cấp và mã FE local.
- Dùng SSH và `psql` trong container `digitalent-postgres` để chạy **SELECT chỉ đọc** trên database server. Không sửa bản ghi, migration, container hoặc code BE.
- Đối chiếu controller, use case, cấu hình EF và seed trong repository. Máy local trong phiên kiểm tra không có PostgreSQL/API/Vite lắng nghe các cổng 5432/5000/5173; chưa thể kiểm tra database local độc lập. DBeaver trong ảnh trước kết nối PostgreSQL server qua SSH tunnel, không chứng minh có database local khác.

## Dữ liệu BE2 hiện có trên server

Schema `public` trên server có 57 bảng; source local có 6 file migration EF. Các số bản ghi bên dưới là `count(*)` thật, không phải ước lượng `pg_stat_user_tables`.

| Nhóm dữ liệu | Bảng / số bản ghi | Tác động |
| --- | --- | --- |
| Tài khoản và tổ chức | `users` 6, `employees` 5, `departments` 1 | Có thể đăng nhập và xem nhân sự cơ bản. Cả 5 nhân viên có phòng ban và user. |
| Vị trí và khung năng lực | `job_positions` 0, `competency_frameworks` 0, `competency_categories` 0, `competencies` 0, `position_requirement_sets` 0, `position_requirement_items` 0, `employee_competency_profiles` 0 | Cả 5 nhân viên chưa có `job_position_id`. Không thể tính gap theo vị trí hoặc hiển thị ma trận năng lực thật. |
| Khóa học | `courses` 18, `course_modules` 72, `lessons` 369 | Catalog và nội dung văn bản có dữ liệu. Riêng `M1-F` có 3 chương và 15 bài. |
| Liên kết khóa học với năng lực | `course_competencies` 0, `course_prerequisites` 0 | BE không thể đề xuất khóa theo gap dù có snapshot; thông tin năng lực và điều kiện tiên quyết trong chi tiết khóa còn trống. |
| Lộ trình và tiến độ | `course_assignments` 0, `enrollments` 0, `skill_gap_runs` 0, `skill_gap_items` 0 | `/my/learning` chưa có khóa ghi danh; gợi ý từ `/intelligence/recommendations` chưa có snapshot đầu vào. |
| Bài kiểm tra, nhiệm vụ, chứng chỉ | `assessments` 0, `assessment_attempts` 0, `practical_task_templates` 0, `task_assignments` 0, `task_submissions` 0, `certificates` 0 | Các màn đánh giá, nhiệm vụ, chứng chỉ không có kết quả nghiệp vụ để hiển thị. |

Tất cả 369 bài học hiện là `TEXT` (225), `GUIDED_PRACTICE` (72) hoặc `QUIZ` (72); **không có bài `VIDEO`**. `content_body` có nội dung ở cả 369 bài nhưng BE chưa có URL video riêng trong DTO `GET /lessons/{id}`.

## Bảng còn thiếu ở schema, không chỉ thiếu bản ghi

Những bảng sau có entity/config trong source nhưng **không có bảng thực** trong PostgreSQL server:

| Bảng | Chức năng bị ảnh hưởng | Căn cứ code |
| --- | --- | --- |
| `lesson_progress` | `GET /my/learning` tính số bài đã học và `POST /lessons/{id}/complete` ghi tiến độ. Với use case hiện tại, truy vấn có thể lỗi khi bảng chưa tồn tại, kể cả `enrollments` rỗng. | `GetMyLearningUseCase`, `CompleteLessonUseCase`, `LessonProgressConfiguration` (`ExcludeFromMigrations`). |
| `learning_materials` | Lưu file/link/video theo bài học. FE hiện chỉ có khung xem trước nếu thiếu URL. | `LearningMaterialConfiguration` (`ExcludeFromMigrations`); `GetLessonUseCase` hiện chưa trả material/video URL. |
| `subscriptions`, `subscription_entitlements`, `invoices` | Trang gói dịch vụ, hạn mức và hóa đơn của Owner. Use case `/subscription` đang truy vấn các bảng này. | `SubscriptionConfiguration` (`ExcludeFromMigrations`), `SubscriptionUseCases`. |
| `course_learning_outcomes`, `lesson_learning_outcomes` | Chuẩn đầu ra khóa/bài nếu muốn lưu đúng dữ liệu thay vì mô tả tĩnh. | Cấu hình EF hiện `ExcludeFromMigrations`; cần xác định nghiệp vụ trước khi triển khai. |

Không tạo bảng thủ công riêng lẻ trên production. Nếu dùng các chức năng này, người phụ trách BE phải hoàn thiện cấu hình EF, migration, API/DTO và kiểm thử rồi mới migrate có backup. Chỉ thêm bảng sẽ không tự làm FE nhận URL video hoặc hiện tiến độ.

## Chênh lệch với bản demo trên web

- Ảnh demo Owner dùng `/enterprise/courses/crs-A1-F` và hiển thị 3 chương/6 bài. Dữ liệu BE server là khóa `M1-F` (GUID ở API), 3 chương/15 bài; không có mã `A1-F`. Đây là hai bộ dữ liệu khác nhau. FE thật phải dùng ID GUID từ `GET /courses`, không dựng URL bằng mã demo.
- `StandardCourseDetailPage` của FE local tách hai chế độ: `VITE_USE_MOCK=true` dùng `CoursePathwayManager`, curriculum tĩnh và cấu hình trong `localStorage`; `VITE_USE_MOCK=false` dùng `ApiCoursePathway` từ `GET /courses/{id}` và `GET /lessons/{id}`. Muốn hai giao diện giống nhau cần đưa thiết kế mock vào thành phần API và chọn **một** bộ mã/dữ liệu chuẩn. `localStorage` không đồng bộ giữa máy hoặc tài khoản.
- Ảnh demo người dùng cung cấp dùng nền tối; `ApiCoursePathway` và `ManagerDevelopmentDashboardPage` ở local hiện dùng lớp màu nền sáng/khối xanh. Đây là chênh lệch CSS và bố cục, không được giải quyết bằng seed database. Chưa thể đo pixel trực tiếp trên trang sau đăng nhập vì HTTP công khai chỉ trả app shell.
- Bài test đầu vào 6 câu ở FE employee cũ chỉ lưu `localStorage`; BE2 không có API nộp bài test đó để sinh skill gap. Manager đã chuyển sang dữ liệu BE2, nhưng database hiện chưa có vị trí, yêu cầu hay snapshot.
- `VITE_USE_MOCK=false` cần BE local hoặc URL API thật. `frontend/vite.config.ts` proxy `/api` tới `localhost:5000`; `frontend/.env.example` cũng mặc định API local. Không có server local chạy trong phiên kiểm tra, nên không thể suy ra local có database khác hay thiếu bảng khác server.

## Thứ tự đưa dữ liệu thật vào hệ thống

1. **Chốt nguồn dữ liệu chuẩn.** Nếu dùng bộ `M1-F`…`M6-A` đã có thì cập nhật nội dung/giao diện demo theo bộ đó. Nếu bắt buộc giữ bộ `A1-F`, cần nhập dữ liệu đầy đủ cho bộ A và chuyển mọi liên kết FE sang GUID của bộ được chọn. Tránh dùng lẫn hai bộ mã.
2. **Hoàn thiện schema cần cho tính năng đã dùng.** Ưu tiên migration cho `lesson_progress` và các bảng billing khi Owner cần gói dịch vụ. Video/tài liệu cần `learning_materials` + API trả URL và quy trình nhập link; chuẩn đầu ra cần bảng tương ứng nếu là dữ liệu nghiệp vụ.
3. **Nhập năng lực và vị trí.** Tạo khung TT02, miền, năng lực, mapping; tạo vị trí và bộ yêu cầu ACTIVE; gán `job_position_id` cho manager và các nhân viên; nhập/xác nhận mức năng lực của nhân viên. Liên kết khóa học với năng lực ở `course_competencies`.
4. **Tạo snapshot thật.** Gọi `POST /intelligence/skill-gaps/calculate` cho nhân viên đủ dữ liệu. Sau đó kiểm tra `GET /intelligence/skill-gaps/me/latest` và `GET /intelligence/recommendations`. Gợi ý được tính từ snapshot, không tự ghi danh.
5. **Phân công khóa học.** Owner dùng `POST /course-assignments` để tạo `course_assignments` và `enrollments` cùng lúc. Sau đó manager/employee xem `GET /my/learning`; khi BE đã có `lesson_progress` và quyền phù hợp mới ghi hoàn thành bài học thật.
6. **Nhập dữ liệu các trang phụ khi cần demo đầy đủ.** Tạo assessment/câu hỏi, nhiệm vụ thực hành, đợt đào tạo, chứng chỉ, gói dịch vụ và hóa đơn bằng API/quy trình nghiệp vụ tương ứng. Không gán số liệu mẫu trong FE để che bảng rỗng.

`Program.cs` chỉ chạy demo seeder trong môi trường `Development`; container server là `Production`, nên production chỉ seed dữ liệu tham chiếu. Ngay cả khi chạy Development trên database đã có 18 khóa, `SkillGapSeeder.SeedDemoAsync` sẽ thoát sớm khi phát hiện `courses` đã có bản ghi. Vì vậy không nên kỳ vọng khởi động lại BE sẽ tự thêm năng lực/vị trí còn thiếu. Không chạy demo seeder trực tiếp trên production có dữ liệu thật; dùng bộ import có kiểm tra, backup và phương án rollback riêng.

Manager hiện có `learning_progress.read` nhưng mặc định **không có** `lesson.complete` trong `RolePermissions.Defaults`. Nếu nghiệp vụ yêu cầu manager học và tự đánh dấu hoàn thành bài, BE/RBAC cần quyết định cấp quyền đó (hoặc một luồng hoàn thành khác) sau khi bảng `lesson_progress` được triển khai. FE không thể tự tạo tiến độ thật bằng localStorage.

## SQL kiểm tra lại (chỉ đọc)

```sql
SELECT 'courses' AS area, count(*) FROM courses
UNION ALL SELECT 'course_modules', count(*) FROM course_modules
UNION ALL SELECT 'lessons', count(*) FROM lessons
UNION ALL SELECT 'job_positions', count(*) FROM job_positions
UNION ALL SELECT 'competencies', count(*) FROM competencies
UNION ALL SELECT 'position_requirement_sets', count(*) FROM position_requirement_sets
UNION ALL SELECT 'employee_competency_profiles', count(*) FROM employee_competency_profiles
UNION ALL SELECT 'course_competencies', count(*) FROM course_competencies
UNION ALL SELECT 'skill_gap_runs', count(*) FROM skill_gap_runs
UNION ALL SELECT 'course_assignments', count(*) FROM course_assignments
UNION ALL SELECT 'enrollments', count(*) FROM enrollments;

SELECT name, to_regclass('public.' || name) AS relation
FROM (VALUES ('lesson_progress'), ('learning_materials'), ('subscriptions'),
             ('subscription_entitlements'), ('invoices')) AS required(name);

SELECT code, estimated_duration_minutes, status FROM courses ORDER BY code;
SELECT lesson_type, count(*) FROM lessons GROUP BY lesson_type ORDER BY lesson_type;
```

Kết luận: phần lộ trình Owner/Manager hiện thiếu **dữ liệu quan hệ** trước tiên; một số chức năng học tập và billing còn thiếu **bảng + API hoàn chỉnh**. Không thể đạt đúng giao diện và số liệu demo chỉ bằng cách thêm vài hàng vào `courses`.
