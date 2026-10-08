# Việc còn thiếu để khép luồng BE1–FE1–BE2–FE2

Ngày rà soát: 08/10/2026. Cơ sở: nhánh `develop` sau khi pull, `docs/BE1_API_GUIDE.md`, `docs/BE2_API_GUIDE.md`, `docs/03A_SRS_Yeu_Cau_Chuc_Nang.md` và `docs/BE2_FE2_WORKFLOW_HANDOFF_2026-10-07.md`. Đây là **bản kiểm tra code và đề xuất bàn giao**, không phải danh sách API/bảng đã triển khai. Các đường dẫn API ở mục “Hợp đồng cần chốt” là đề xuất; tên cuối cùng do các nhóm thống nhất trước khi code.

## 1. Kết luận và thứ tự làm

Luồng mục tiêu: Owner/HR mời nhân viên hoặc Manager kèm phòng ban, vị trí và khóa học → người được mời nhận link, kích hoạt → tài khoản có `employees.user_id` → học viên làm đánh giá đầu vào theo chuẩn vị trí, kết quả và **mức tạm** được lưu → khóa được giao và khóa gợi ý xuất hiện trong `/me/learning-path` → Owner/Manager giao nhiệm vụ thực tế trong phạm vi quyền → học viên nộp bài và tệp → người duyệt xem đủ tệp, chấm → nếu đủ điều kiện, hồ sơ năng lực và skill gap cập nhật. Manager cũng là học viên ở `/me/*`; quyền xem nhóm là quyền bổ sung. Manager **được xem giao khóa, không được tạo giao khóa** theo quyền mặc định; Manager **được tạo và chấm nhiệm vụ thực tế** trong phạm vi được giao.

| Ưu tiên | Việc phải chốt | Nhóm dẫn dắt | Phụ thuộc |
| --- | --- | --- | --- |
| P0 | Gửi được lời mời thật; kích hoạt xong có hồ sơ nhân viên hợp lệ hoặc trạng thái cần xếp vị trí rõ ràng | BE1, FE1 | Cấu hình gửi mail; chính sách bắt buộc phòng ban/vị trí |
| P0 | Lưu khóa chọn lúc mời và giao đúng một lần sau kích hoạt | BE1, BE2; FE1 hiển thị, FE2 hiển thị kết quả | Hợp đồng sự kiện/trạng thái giao khóa |
| P0 | Chặn Manager đọc/tạo/chấm dữ liệu ngoài phạm vi tại BE | BE1 chốt phạm vi; BE2 áp dụng; FE1/FE2 hiển thị | Quy tắc phòng ban được quản lý |
| P0 | Sửa form giao nhiệm vụ FE2 dùng GUID năng lực thật; người duyệt xem được tệp; chấm bài không tự nhận đã xác nhận năng lực | FE2, BE2 | API competency BE1; API tệp BE2 |
| P1 | Đánh giá đầu vào lưu attempt và mức tạm, không nhầm với mức đã xác nhận | BE2, FE1; BE1 cung cấp chuẩn vị trí | Schema/luật mức tạm cần duyệt |
| P1 | Lộ trình dùng mức tạm đúng chính sách, giữ khóa được giao và khóa gợi ý | BE2, FE1/FE2 | Placement P1 |
| P1 | Chấm bài đạt → kết quả từng năng lực → minh chứng → hồ sơ/skill gap nếu có quyết định xác nhận | BE2, BE1; FE2 hiển thị | Quy tắc xác nhận cấp độ và service chung |

## 2. BE1 — tài khoản, tổ chức, vị trí và phạm vi Manager

### BE1-01. Lời mời phải đến được người nhận (P0)

- **Đang có:** `InviteMembersUseCase` tạo `member_invitations`; `ActivateInvitationUseCase` tạo `users`, `user_roles`, liên kết/tạo `employees`. API public `GET /invitations/{token}` và `POST /invitations/activate` có sẵn.
- **Chỗ sửa:** `backend/src/DigiTalent.Infrastructure/Invitations/LoggingInvitationSender.cs`, `DependencyInjection.cs`, `backend/src/DigiTalent.Application/UseCases/Organization/Members/InviteMembers/InviteMembersUseCase.cs` và `ResendInvitationUseCase.cs`. Hiện DI chỉ dùng `LoggingInvitationSender`: Development ghi link vào log, môi trường khác không gửi email. Tạo sender thật và cấu hình qua secret môi trường; có trạng thái gửi/lỗi, retry và kiểm tra gửi lại. Không trả token/link thật ở Production.
- **Nghiệm thu:** email nhận được link dùng được; token cũ sau resend/revoke hoặc sau khi kích hoạt không dùng lại; lỗi gửi mail không bị báo nhầm là “đã gửi”. Thử bằng email mới, không dùng tài khoản seed.

### BE1-02. Liên kết hồ sơ và xếp vị trí trước khi đi học (P0)

- **Chỗ sửa:** `backend/src/DigiTalent.Application/UseCases/Organization/Invitations/ActivateInvitation/ActivateInvitationUseCase.cs`, `Members/InviteMembers/InviteMembersUseCaseInput.cs`, `Members/UpdateMember/UpdateMemberUseCase.cs`, `Me/Common/MyEmployeeContext.cs`.
- **Vấn đề hiện tại:** nếu tổ chức không có phòng ban ACTIVE, `CreateEmployeeAsync` trả `null` nhưng kích hoạt tài khoản vẫn thành công. `/me/*` sau đó không dùng được. Nếu chưa có `jobPositionId` hoặc bộ yêu cầu ACTIVE, không có chuẩn để đánh giá đầu vào và gợi ý học.
- **Quyết định cần chốt:** với tài khoản EMPLOYEE/MANAGER đi vào luồng học ngay sau kích hoạt, yêu cầu phòng ban + vị trí hợp lệ và bộ yêu cầu ACTIVE trước khi mời/kích hoạt; hoặc trả trạng thái `NEEDS_PLACEMENT` có hướng dẫn Owner xếp vị trí, chưa chuyển thẳng tới bài test. Khi liên kết hồ sơ đã tồn tại theo email, kiểm tra sự khác biệt phòng ban/vị trí với lời mời và báo rõ chính sách lấy dữ liệu nào; tránh tạo hai hồ sơ.
- **Nghiệm thu:** sau kích hoạt, `/auth/me` và `/me/learning-path` xác định cùng một `employeeId`; tài khoản thiếu vị trí nhận lý do cụ thể và Owner có thể hoàn tất xếp vị trí; không có tài khoản “ACTIVE nhưng không thể học” mà không có bước xử lý.

### BE1-03. Lưu lựa chọn khóa trong lời mời (P0, hợp đồng chung với BE2)

- **Chỗ sửa:** `InviteMemberRow`, `MemberInvitation`, cấu hình/migration của invitation và API xem chi tiết lời mời. Hiện không có `selectedCourseIds`.
- **Đề xuất:** thêm danh sách khóa đã chọn cho từng lời mời, lưu bền vững bằng bảng liên kết `member_invitation_courses` hoặc cấu trúc khác có ràng buộc rõ. Xác thực khóa cùng tổ chức và `PUBLISHED` khi nhận lời mời; xác định hành vi nếu khóa bị archive trước lúc kích hoạt. BE1 phát sự kiện sau khi `users`, `employees`, role và invitation đã commit; BE2 xử lý giao khóa. Nếu BE1/BE2 cùng transaction trong monolith, dùng application service chung; nếu async, dùng outbox/retry. Không gọi HTTP nội bộ tới chính API.
- **Nghiệm thu:** xem lại lời mời biết khóa đã chọn; kích hoạt lại/retry không tạo giao khóa trùng; trạng thái từng khóa (`CREATED`, `SKIPPED`, lý do) có thể tra cứu.

### BE1-04. Chốt một nguồn phạm vi quản lý (P0)

- **Chỗ sửa:** `backend/src/DigiTalent.Application/Common/Authorization/EmployeeScope.cs`; dữ liệu đã có `departments.manager_employee_id`, `employees.direct_manager_id`. FE1 hiện có `AssignManagerDepartmentsModal` cho phép gán Manager vào nhiều phòng ban, nhưng `EmployeeScope` chỉ lọc theo **phòng ban của chính Manager** (`currentUser.DepartmentId`).
- **Cần chốt:** Manager thấy nhân viên trong những phòng ban mà mình được giao quản lý, nhân viên báo cáo trực tiếp, phòng con hay tổ hợp nào? Công bố một truy vấn scope dùng chung và quy tắc khi Manager đổi phòng/được thu hồi quản lý; các use case BE2 dùng đúng truy vấn này. Trả 404 cho ID ngoài phạm vi.
- **Nghiệm thu:** Manager quản lý hai phòng vẫn thấy đúng hai phòng dù hồ sơ cá nhân ở một phòng thứ ba; không thấy phòng không được giao; Owner/HR xem toàn tổ chức; Employee chỉ xem mình.

## 3. FE1 — lời mời và trải nghiệm Employee

### FE1-01. Mời kèm khóa và kích hoạt có điều hướng đúng (P0)

- **Chỗ sửa:** `frontend/src/features/members/components/InviteMembersModal.tsx`, `frontend/src/features/auth/pages/ActivateInvitationPage.tsx`, `frontend/src/services/member.service.ts`, các kiểu `InviteRow` trong `frontend/src/types/commerce.ts`.
- **Làm:** thêm chọn khóa `PUBLISHED` theo từng người/lô mời sau khi BE1 nhận `selectedCourseIds`; hiển thị đây là “khóa sẽ giao sau kích hoạt”, không báo đã giao ngay khi gửi lời mời. Khi kích hoạt, dùng dữ liệu hồ sơ/trạng thái onboarding từ BE để quyết định đi tới test, trang chờ xếp vị trí hay `/me`; hiện trang kích hoạt luôn điều hướng tới `/enterprise/initial-assessment`. Với cấu hình Development, chỉ hiển thị `debugLink` khi BE trả về và người dùng có quyền kiểm thử; Production phụ thuộc email thật.
- **Nghiệm thu:** người vừa kích hoạt thấy đúng vai trò, phòng ban, vị trí và khóa đã được giao; thiếu vị trí có thông điệp và lối xử lý cụ thể.

### FE1-02. Thay bài test cục bộ bằng placement thật (P1)

- **Chỗ sửa:** `frontend/src/features/employee/pages/EmployeeInitialAssessmentPage.tsx`, `frontend/src/app/routes/onboarding.routes.tsx`, trang kết quả và dashboard Employee. Bài 6 câu hiện là dữ liệu cố định, lưu `localStorage` (`dt_initial_assessment_*`), không tạo attempt hay mức tạm ở BE. Manager hiện vào `ManagerAssessmentPage` tính skill gap, không làm cùng bài đầu vào.
- **Làm:** dùng API placement BE2 đã chốt; lấy bộ câu hỏi theo vị trí và phiên bản requirement set, nộp đáp án, đọc kết quả bền vững; phân biệt nhãn **mức tạm** và **mức đã xác nhận**. Khi chưa có API, không hiển thị điểm local như kết quả năng lực đã được hệ thống ghi nhận. Cho Manager làm lại đúng trang người học này qua `/me/*`, sau đó mới dùng quyền theo dõi nhóm.
- **Nghiệm thu:** đăng xuất/đăng nhập vẫn thấy kết quả; đổi vị trí/phiên bản chuẩn không áp nhầm kết quả cũ; người học chỉ thấy bài của chính mình.

### FE1-03. Giữ một luồng `/me/*` cho Employee và Manager (P1)

- **Chỗ sửa:** `frontend/src/features/employee/pages/MyLearningPathPage.tsx`, `MyPracticalTasksPage.tsx`, `SubmitEvidencePage.tsx`, `TaskFeedbackPage.tsx`; Manager đang tái sử dụng `MyLearningPathPage` qua `features/manager/pages/ManagerLearningPathPage.tsx`.
- **Làm:** đọc trạng thái nguồn năng lực `CONFIRMED`/`PLACEMENT`/`UNKNOWN` từ BE2; giữ các khóa `ASSIGNED`, `SELF_ENROLLED`, `RECOMMENDED` tách biệt; không suy ra “đã xác nhận” từ placement. Luồng nộp hiện dùng `/me/tasks/{assignmentId}` và upload/tạo bài nộp có thật; sau khi BE2 thêm tệp vào response, hiển thị danh sách tệp đã nộp và phản hồi chấm.
- **Nghiệm thu:** Manager có thể học, làm quiz, nộp nhiệm vụ của chính mình như Employee; quyền xem/chấm nhóm không làm dữ liệu `/me/*` lẫn với nhân viên khác.

### FE1-04. Màn gán phòng ban Manager phải phản ánh dữ liệu thật (P1)

- **Chỗ sửa:** `frontend/src/features/members/components/AssignManagerDepartmentsModal.tsx`. Danh sách hiện chỉ lấy 100 phòng ban; state chọn ban đầu được tạo từ danh sách trước khi API trả về nên có nguy cơ hiển thị sai lựa chọn. Payload cập nhật từng phòng cần giữ `parentDepartmentId` hiện có, không làm mất cây phòng ban.
- **Nghiệm thu:** mở modal sau khi API tải xong thấy đúng các phòng đang quản lý; bấm lưu khi không đổi gì không thu hồi phòng ban hoặc đổi cha phòng; sau lưu, BE1 scope và màn Manager khớp nhau.

## 4. BE2 — khóa học, placement, nhiệm vụ và minh chứng

### BE2-01. Giao khóa đúng một lần sau kích hoạt (P0)

- **Chỗ sửa:** `backend/src/DigiTalent.Application/UseCases/Learning/CourseAssignments/CreateCourseAssignmentUseCase.cs` và use case/handler mới nhận sự kiện BE1. Use case giao thủ công hiện đã tạo `CourseAssignment` + `Enrollment` cho nhân viên ACTIVE nhưng chưa được gọi từ lời mời.
- **Làm:** dùng cùng quy tắc kiểm tra khóa `PUBLISHED`, cùng tổ chức, nhân viên ACTIVE và chống trùng. Ghi `assignmentSource = INVITATION` (hoặc mã thống nhất), `invitationId/eventId` để truy vết; trả `created/skipped/reason` ổn định. Không đổi quyền: Manager chỉ `learning.read_assignment`, Owner/HR mới `learning.create_assignment`.
- **Nghiệm thu:** một lời mời chọn hai khóa tạo hai enrollment sau kích hoạt; retry không nhân đôi; khóa không hợp lệ có lý do để Owner xử lý.

### BE2-02. Placement có attempt và mức tạm riêng (P1)

- **Chỗ bắt đầu:** `backend/src/DigiTalent.Domain/Entities/Assessment/Assessment.cs` hiện buộc `CourseId`; các use case `/me/assessments` là bài trong khóa. Đặc tả `docs/03A_SRS_Yeu_Cau_Chuc_Nang.md` mục O-8 xác nhận placement cần schema mới, không coi quiz khóa học là placement.
- **Làm:** thiết kế migration/bảng placement riêng (ví dụ bài, attempt, câu trả lời, mức tạm từng competency, gắn `jobPositionId` và `requirementSetId/versionNo`); API chỉ cho chính học viên lấy bài, bắt đầu, nộp và đọc kết quả. Không trả đáp án đúng trước khi nộp. Mức tạm **không tự ghi** `employee_competency_profiles` hoặc minh chứng CONFIRMED. Chốt thang điểm → mức tạm cùng BE1 trước khi code; cập nhật `docs/BE2_API_GUIDE.md`.
- **Nghiệm thu:** lưu kết quả qua phiên đăng nhập, có lịch sử/version; không lấy được bài/kết quả của người khác; thiếu chuẩn vị trí trả lý do có cấu trúc.

### BE2-03. Đưa mức tạm vào lộ trình (P1)

- **Chỗ sửa:** `backend/src/DigiTalent.Application/UseCases/Me/GetMyLearningPath/GetMyLearningPathUseCase.cs`, `MyCompetencySnapshotBuilder.cs`, DTO lộ trình, recommender. Hiện `confirmedLevels` chỉ lấy `employee_competency_profiles`.
- **Quy tắc:** cấp đã xác nhận ưu tiên hơn mức tạm; nếu cả hai chưa có thì nguồn là `UNKNOWN`. `GET /me/skill-gap` vẫn là khoảng trống theo mức đã xác nhận; lộ trình có thể dùng mức tạm để xếp gợi ý, và phải trả `levelSource`/lý do cho FE. Giữ khóa đã được giao trong lộ trình kể cả khi không tính được gap.
- **Nghiệm thu:** sau placement, gợi ý phản ánh kết quả; sau xác nhận năng lực thật, gợi ý tính lại theo mức xác nhận; khóa được Owner giao không tự biến mất.

### BE2-04. Áp scope vào mọi API nhóm (P0)

- **Chỗ sửa:** `Learning/CourseAssignments/{GetCourseAssignmentsUseCase,GetCourseAssignmentByIdUseCase,GetAssignmentSummaryUseCase}.cs`, `Reports/ReportUseCases.cs`, `Tasks/{GetTasksUseCase,GetTaskByIdUseCase,CreateTaskUseCase,GetSubmissionDetailUseCase,EvaluateSubmissionUseCase}.cs`. Các use case này hiện phần lớn chỉ kiểm tra cùng tổ chức. `GetReviewQueueUseCase` đã lọc theo `ReviewerUserId`, nhưng API chi tiết/chấm chưa áp cùng điều kiện.
- **Làm:** dùng `EmployeeScope` BE1, lọc trước `Count/Skip/Take` và KPI; ID ngoài phạm vi trả 404. Tạo nhiệm vụ phải xác thực **toàn bộ** người nhận là ACTIVE, cùng tổ chức, trong scope; nếu một ID sai, từ chối toàn bộ thay vì âm thầm bỏ qua. Chấm bài phải kiểm tra người duyệt được giao, scope và chống tự duyệt; chỉ Owner/HR được nới quyền theo chính sách đã chốt. Mẫu nhiệm vụ giao nhiều phòng ban cần bộ đếm theo phần Manager được nhìn thấy.
- **Nghiệm thu:** Manager A không xem, tạo hay chấm dữ liệu B qua URL/ID tự đoán; tổng số/trang/KPI không bao gồm B; Owner/HR vẫn xem toàn tổ chức.

### BE2-05. Hoàn thiện nộp tệp → người duyệt xem tệp → kết quả năng lực (P0/P1)

- **Chỗ sửa:** `Me/UploadMyTaskAttachment`, `Me/SubmitMyTask`, `Tasks/GetSubmissionDetailUseCase.cs`, `GetTaskByIdUseCase.cs`, `EvaluateSubmissionUseCase.cs`, `Tasks/TaskDtos.cs`, `Tasks/SubmitTaskEvidenceUseCase.cs` và `TasksController.cs`.
- **Hiện có:** học viên upload và nộp tệp qua `/me/tasks/{assignmentId}/attachments` + `/submissions`. Nhưng DTO chi tiết cho người duyệt chưa điền `FileUrls`/metadata tệp, chưa có đường tải tệp dành cho người duyệt được ủy quyền. API cũ `POST /tasks/{taskId}/submit` dùng đường xử lý khác (URL tự khai báo), cần bỏ/ủy quyền vào cùng service để không có hai quy tắc nộp.
- **Làm trước P0:** trả tệp theo ID/tên/size, endpoint tải tệp kiểm tra org + scope + reviewer; FE2 hiển thị/tải được. Validate điểm 0–100, trạng thái và quyền ở server. **Làm tiếp P1:** khi PASSED và có quyết định xác nhận từng năng lực, ghi `CompetencyEvaluationResult` → `CompetencyEvidence` nguồn `PRACTICAL_TASK` → cập nhật profile qua service/quy tắc BE1 → phát sự kiện tính lại gap; transaction và idempotency. `CountsAsEvidence = true` hiện chưa đủ để nói năng lực đã được xác nhận. Không nâng cấp độ với NEEDS_REVISION/FAILED.
- **Nghiệm thu:** người duyệt xem được đúng tệp của bài nộp; người ngoài phạm vi không tải được; duyệt đạt có/không xác nhận năng lực hiển thị khác nhau; gửi đánh giá lại không tạo hai minh chứng.

## 5. FE2 — màn Owner/Manager và kết nối API

### FE2-01. Giao nhiệm vụ thực tế bằng dữ liệu thật (P0)

- **Chỗ sửa:** `frontend/src/features/tasks/pages/CreatePracticalTaskPage.tsx`, `frontend/src/hooks/use-tasks.ts`, `frontend/src/services/task.service.ts`.
- **Lỗi chặn:** danh sách `COMMON_COMPETENCIES` và lựa chọn mặc định đang dùng ID `cmp-...`, nhưng `CreateTaskInput.CompetencyIds` của BE2 là `Guid`. Thay bằng `GET /competencies`/hook sẵn có, dùng GUID và chỉ chọn competency ACTIVE. Form đang gọi `useEmployees()` không truyền phân trang, BE1 mặc định trả 20 người; thêm tìm kiếm/phân trang hoặc hook tải đầy đủ trong phạm vi BE trả. Không cho chọn ngoài scope; BE vẫn là lớp kiểm tra cuối. Hiển thị lỗi API thực thay cho toast chung.
- **Nghiệm thu:** tạo nhiệm vụ thành công bằng một competency GUID và nhân viên thật; người thứ 21 vẫn tìm/chọn được; Manager không thấy/chọn người ngoài nhóm.

### FE2-02. Chấm bài trung thực và đủ tệp (P0/P1)

- **Chỗ sửa:** `frontend/src/features/tasks/pages/EvaluateEvidencePage.tsx`, `TaskDetailPage.tsx`, `ReviewQueuePage.tsx`, `frontend/src/services/task.service.ts`.
- **Làm:** hiển thị các tệp BE2 trả và nút tải tệp có kiểm quyền; phân biệt điểm bài thực hành, quyết định PASSED và quyết định **xác nhận cấp năng lực**. Hiện toast “công nhận đạt chuẩn năng lực” sau mọi APPROVED là sai với BE hiện tại; đổi nội dung ngay, chỉ dùng câu đó khi API trả xác nhận thật. Giữ thao tác chấm/chi tiết trong scope do BE bảo vệ, không client lọc thay BE.
- **Nghiệm thu:** Manager mở hàng đợi, đọc nội dung/link/tệp của người thuộc nhóm, chấm, người học thấy phản hồi; không có thông báo xác nhận năng lực khi profile chưa cập nhật.

### FE2-03. Màn theo dõi Manager sau khi BE2 giới hạn scope (P0)

- **Chỗ sửa:** `frontend/src/features/assignments/pages/CourseAssignmentPage.tsx`, các trang `features/manager/pages/team`, trang nhiệm vụ và dashboard/report dùng BE2. Chỉ dùng dữ liệu đã scope từ server; không gọi API toàn tổ chức rồi lọc cục bộ để “sửa” lộ dữ liệu.
- **Làm:** kiểm tra lại KPI, `totalItems`, trang chi tiết và trạng thái rỗng bằng hai Manager; không hiện nút tạo giao khóa cho Manager. Các trang `/me/*` của Manager tiếp tục dùng component/hook người học chung.
- **Nghiệm thu:** Manager xem giao khóa/tiến độ đúng nhóm, tạo/chấm task trong nhóm, học và nộp task của chính mình; không tạo giao khóa.

### FE2-04. Cập nhật hợp đồng placement/lộ trình sau khi BE2 merge (P1)

- **Chỗ sửa:** types/services cho `/me/learning-path`, trang `features/manager/pages/ManagerAssessmentPage.tsx`, `ManagerLearningPathPage.tsx`, các trang Owner theo dõi kết quả. Manager phải dùng bài placement Employee của FE1, không coi nút “tính skill gap” là bài test đầu vào. Khi BE trả `levelSource`, hiển thị nhãn mức tạm/mức xác nhận đúng.
- **Nghiệm thu:** cùng một Manager có kết quả placement, lộ trình cá nhân và bảng theo dõi nhóm độc lập, không lẫn dữ liệu.

## 6. Hợp đồng giữa nhóm cần ký trước khi merge

| Hợp đồng | Bên cung cấp | Bên dùng | Chốt tối thiểu |
| --- | --- | --- | --- |
| Lời mời có khóa | BE1 + FE1 | BE2 + FE2 | `invitationId`, `organizationId`, `employeeId`, `userId`, role, department/position, `selectedCourseIds`; thời điểm phát sau khi hồ sơ ACTIVE đã commit; kết quả từng khóa và khóa chống lặp |
| Phạm vi Manager | BE1 | BE2, FE1, FE2 | Nguồn phòng ban được quản lý (`manager_employee_id` và/hoặc trực tiếp), phòng con, nhân viên chuyển phòng, 404 ngoài scope |
| Chuẩn vị trí cho placement | BE1 | BE2 + FE1 | active `requirementSetId/versionNo`, competency, required level; trạng thái thiếu chuẩn |
| Kết quả placement | BE2 | FE1 + FE2 | attempt ID, position/set version, điểm, mức tạm từng competency, nguồn `PLACEMENT`, thời gian, lỗi có cấu trúc |
| Lộ trình | BE2 | FE1 + FE2 | khóa giao/tự đăng ký/gợi ý, lý do, tiên quyết, `levelSource = CONFIRMED/PLACEMENT/UNKNOWN`; không coi mức tạm là hồ sơ xác nhận |
| Duyệt nhiệm vụ | BE2 + BE1 profile service | FE1 + FE2 | file IDs/metadata và tải tệp có kiểm quyền; feedback/verdict; kết quả từng competency; trạng thái đã xác nhận hay chỉ đạt bài |

Mỗi thay đổi DTO/endpoint phải cập nhật `docs/BE1_API_GUIDE.md` hoặc `docs/BE2_API_GUIDE.md`, types/service FE tương ứng và test contract trong cùng PR. Không tạo hai nguồn sự thật cho lộ trình hoặc hai cách cập nhật `employee_competency_profiles`.

## 7. Ca nghiệm thu bắt buộc sau khi bốn nhóm hoàn tất

1. Tạo tổ chức có hai phòng A/B, vị trí và requirement set ACTIVE; Owner, HR, Manager A/B, nhân viên A/B là **tài khoản mới**, không dùng dữ liệu seed đã có.
2. Owner mời Manager A và nhân viên A vào phòng A, chọn khóa PUBLISHED; nhận email, kích hoạt, đăng nhập. Kiểm tra `users`, `user_roles`, `employees.user_id`, vị trí, khóa giao và enrollment; retry kích hoạt/sự kiện không nhân đôi.
3. Nhân viên và Manager làm placement; kiểm tra attempt và mức tạm tồn tại sau đăng xuất/đăng nhập. `/me/skill-gap` vẫn phân biệt mức xác nhận; `/me/learning-path` có khóa giao và gợi ý phù hợp mức tạm.
4. Manager A tự xem `/me/*`, học và nộp bài của mình; chỉ thấy giao khóa/tiến độ của nhóm A. Gọi danh sách, tổng hợp và ID của phòng B phải bị từ chối/ẩn ngay tại BE.
5. Manager A (hoặc Owner nếu đã được cấp `task.create`) giao task gắn competency GUID thật cho nhân viên A; nhân viên A upload tệp, nộp, nhận yêu cầu sửa và nộp lại; người duyệt mở được tệp và chấm. Manager B không xem/tải/chấm bài này.
6. Nếu quyết định xác nhận năng lực: kiểm tra chuỗi `task_evaluations` → `competency_evaluation_results` → `competency_evidences` → `employee_competency_profiles`, skill gap và lộ trình cập nhật; nếu chỉ PASSED bài học, hồ sơ năng lực không tự tăng. Lặp request không tạo bản ghi trùng.

**Trạng thái kiểm chứng tại ngày lập tài liệu:** FE build thành công và 35 test FE của các trang task/Employee/Manager đạt. Đây chưa phải ca end-to-end trên database thật. Không dùng kết quả build hoặc test mock để kết luận những luồng P0/P1 trên đã hoàn tất.

## 8. Cập nhật triển khai FE2 trên nhánh `feat/fe2-task-evidence-manager-integration`

- **FE2-01 — phần FE đã làm:** màn giao nhiệm vụ dùng toàn bộ competency ACTIVE từ `GET /competencies` và toàn bộ employee ACTIVE từ `/employees` qua phân trang; gửi GUID do API trả về, không còn ID `cmp-*`; tìm nhân viên theo tên/mã/email, phòng ban lấy từ danh sách nhân viên đã được BE1 scope; mức mục tiêu theo thang hệ thống 1–3 (bậc TT02 1–2/3–4/5–6); yêu cầu chọn nhân viên, năng lực và rubric tổng 100 điểm; lỗi tạo nhiệm vụ hiển thị thông điệp API. **Còn phụ thuộc BE2-04:** `CreateTaskUseCase` phải xác thực toàn bộ người nhận và scope Manager trước khi ghi.
- **FE2-02 — phần FE đã làm:** điểm rubric khởi đầu bằng 0, chặn chấm lại bài có kết quả, hiển thị phản hồi và trạng thái bài; thông báo duyệt chỉ nói đạt bài thực hành, không nói xác nhận cấp năng lực; hiển thị `fileUrls` HTTPS nếu DTO cung cấp và thông báo rõ khi thiếu tệp. Xóa hook/service FE2 không dùng của đường nộp cũ `/tasks/{taskId}/submit`; trang người học tiếp tục dùng `/me/tasks/{assignmentId}/submissions` thuộc FE1. **Còn phụ thuộc BE2-05:** DTO reviewer hiện không trả file ID/metadata và chưa có API tải tệp có kiểm quyền; FE chưa thể cho người duyệt tải tệp riêng tư, chưa thể hiển thị xác nhận cấp năng lực vì BE chưa ghi kết quả đó.
- **FE2-03 — phần FE đã làm:** trang giao khóa đã ẩn thao tác tạo/hủy theo quyền hiện có; danh sách task chỉ hiện nút tạo khi có `task.create`; các danh sách giao khóa/task/review báo lỗi API thay vì coi là rỗng. **Còn phụ thuộc BE2-04:** scope danh sách/chi tiết/KPI/duyệt phải thực thi trên server; không thể nghiệm thu hai Manager chỉ bằng lọc FE. Quyền mặc định `HR_MANAGER` (Owner doanh nghiệp) hiện có `task.read` nhưng không có `task.create`; vì vậy ca nghiệm thu Owner giao task ở mục 7 cần chốt lại ma trận quyền hoặc để Manager giao.
- **FE2-04 — chưa thể nối placement thật:** BE2 chưa có hợp đồng placement và `levelSource`; FE1 đang giữ bài test 6 câu trong localStorage. Manager hiện dùng `/me/*` cho học cá nhân và màn phân tích khoảng trống hiển thị đúng chức năng có thật. Sau khi BE2/FE1 merge placement, FE2 cần cập nhật nhãn mức tạm/mức xác nhận và luồng Manager dùng chung bài placement.

Không có file BE1, BE2 hoặc FE1 nào được sửa trong lượt triển khai FE2 này. Đã kiểm tra `npm run build`, `npm run check:no-mock` và 15 test FE2/Manager liên quan. Các kiểm thử đơn vị dùng mock không thay thế nghiệm thu với tài khoản mới và database thật ở mục 7.
