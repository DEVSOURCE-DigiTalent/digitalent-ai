# Manager FE2

Các trang chỉ dùng cho role `DEPARTMENT_MANAGER` nằm trong `pages/`. Trang nhóm ở `pages/team/`; hook tổng hợp skill gap ở `hooks/`. Các thành phần dùng chung cho employee/manager (chi tiết khóa học, bài học, danh sách ghi danh) tiếp tục ở `features/learning`, `features/employee` và `services` để không tạo hai bản API khác nhau.

## Route giao diện

| Route | Nguồn dữ liệu BE2 |
| --- | --- |
| `/enterprise/team` | `GET /intelligence/dashboard`, `/employees`, `/tasks`, `/review-queue`, `/course-assignments/summary` |
| `/enterprise/team/members` | `GET /employees` |
| `/enterprise/team/members/:id` | `GET /employees/{guid}`, `/intelligence/skill-gaps?employeeId=`, `/course-assignments?employeeId=` |
| `/enterprise/team/competency` | `GET /intelligence/skill-gaps` và `GET /intelligence/skill-gaps/{runId}` |
| `/enterprise/team/skill-gap` | `GET /intelligence/skill-gaps` |
| `/enterprise/team/training` | `GET /course-assignments`, `/course-assignments/summary` |
| `/enterprise/team/training/:assignmentId` | `GET /course-assignments/{guid}` |
| `/enterprise/me` | `GET /me/dashboard` |
| `/enterprise/me/competency`, `/skill-gap`, `/evidence` | `GET /me/competency-profile`, `/me/skill-gap`, `/me/evidence` |
| `/enterprise/me/learning-path` | `GET /me/learning-path`; tự ghi danh qua `POST /me/courses/{guid}/enroll` |
| `/enterprise/me/courses` | `GET /me/courses` |
| `/enterprise/me/courses/:id` | `GET /me/courses/{guid}` |
| `/enterprise/me/courses/:id/lessons/:lessonId` | `GET /me/courses/{guid}/lessons/{guid}`; bắt đầu và hoàn thành bài qua `/start`, `/complete` |
| `/enterprise/me/assessments*` | `GET /me/assessments`, các endpoint `/me/assessment-attempts` |
| `/enterprise/me/tasks*` | `GET /me/tasks`; nộp bài qua `/submissions` và `/attachments` |
| `/enterprise/me/achievements` | `GET /me/achievements` |
| `/enterprise/initial-assessment` | `GET /intelligence/skill-gaps/me/latest`, `POST /intelligence/skill-gaps/calculate` |

Menu Cá nhân của Manager dùng lại giao diện, hook và API `/me/*` của Employee; các truy vấn này được BE giới hạn theo hồ sơ nhân viên liên kết với chính tài khoản đang đăng nhập. Cần có bản ghi `employees.user_id` tương ứng với Manager trong cùng tổ chức để các trang cá nhân tải được dữ liệu. Quyền mặc định của `DEPARTMENT_MANAGER` đã gồm `lesson.complete`, `attempt.start`, `attempt.submit` và `task.submit`; quyền thực tế vẫn lấy từ bảng `role_permissions`.

Bài test đầu vào 6 câu cũ chỉ lưu ở trình duyệt nên không tự tạo skill gap, gợi ý hoặc ghi danh trên BE. Trang `/enterprise/initial-assessment` của Manager dùng phân tích skill gap của BE2.

`GET /course-assignments` và `/course-assignments/summary` hiện lọc theo tổ chức trong BE2, chưa lọc theo phòng ban của Manager. FE hiển thị kết quả API và không thể bảo đảm phạm vi nhóm bằng bộ lọc trên một trang phân trang.

Các endpoint FE cũ `/workforce`, `/competency-profiles/matrix`, `/intelligence/analytics/*` không có controller tương ứng trong BE2. Manager pages không còn gọi các endpoint đó. `/enterprise/me/learning` là route FE cũ, được chuyển về `/enterprise/me/courses`.
