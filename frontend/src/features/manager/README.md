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
| `/enterprise/me` | `GET /my/learning`, `/intelligence/skill-gaps/me/latest` |
| `/enterprise/me/learning-path` | `GET /my/learning`, `/intelligence/recommendations` |
| `/enterprise/me/courses` | `GET /my/learning` |
| `/enterprise/me/courses/:id` | `GET /courses/{guid}` |
| `/enterprise/me/courses/:id/lessons/:lessonId` | `GET /courses/{guid}`, `/lessons/{guid}` |
| `/enterprise/initial-assessment` | `GET /intelligence/skill-gaps/me/latest`, `POST /intelligence/skill-gaps/calculate` |

BE2 không có API ghi bài test đầu vào 6 câu; kết quả localStorage cũ không tạo skill gap, gợi ý hay ghi danh. Gợi ý từ `/intelligence/recommendations` chỉ xuất hiện sau khi BE2 có snapshot skill gap; gợi ý không phải phân công đào tạo. `DEPARTMENT_MANAGER` có quyền xem bài học nhưng mặc định không có `lesson.complete`, `attempt.start` và `attempt.submit`.

Các endpoint FE cũ `/workforce`, `/competency-profiles/matrix`, `/intelligence/analytics/*` không có controller tương ứng trong BE2. Manager pages không còn gọi các endpoint đó. `/enterprise/me/learning` là route FE cũ, được chuyển về `/enterprise/me/courses`.
