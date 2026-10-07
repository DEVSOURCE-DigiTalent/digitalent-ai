# Bàn giao hoàn thiện luồng BE2/FE2 với BE1/FE1

Ngày rà soát: 07/10/2026. Tài liệu này mô tả việc cần làm trên mã nguồn hiện có; hợp đồng ở các mục 4–5 là đề xuất để hai nhóm chốt, chưa phải API đã triển khai.

## 1. Ranh giới trách nhiệm

Theo `Phan_cong_BE_FE_DigiTalent.xlsx` (tab `Tong quan`, hàng 15–23; tab `Phan cong chi tiet`, hàng 48–76):

- **BE1/FE1** sở hữu lời mời, tài khoản, thành viên, phòng ban, vị trí, chuẩn vị trí, hồ sơ năng lực và các màn Employee.
- **BE2/FE2** sở hữu khóa học, phân công đào tạo, bài đánh giá, nhiệm vụ, minh chứng, báo cáo và các màn Manager. Menu Cá nhân của Manager dùng chung các trang Employee.
- Mã hiện tại có một chỗ giao thoa: `GetMyLearningPathUseCase` và các API `/me/*` đang nằm trong backend BE2, dù bảng phân công ghi màn lộ trình Employee thuộc BE1/FE1. Hai nhóm cần chốt một chủ sở hữu API, giữ **một nguồn dữ liệu**, rồi cập nhật API guide. Không tạo lộ trình thứ hai.

Luồng nghiệm thu chung: Owner chọn vị trí và khóa học khi mời → BE1 kích hoạt tài khoản và liên kết `employees.user_id` → BE2 giao khóa và ghi danh → người học làm đánh giá đầu vào theo chuẩn vị trí → lộ trình gồm khóa được giao và khóa gợi ý → Manager chỉ theo dõi nhóm được phép → duyệt bài thực hành → hồ sơ năng lực, skill gap, lộ trình và báo cáo cập nhật.

## 2. BE2-01 — Giới hạn phạm vi Manager ở phía máy chủ (P0)

### Hiện trạng

`EmployeeScope.VisibleEmployees()` đã có nhưng Manager hiện chỉ được lọc theo `currentUser.DepartmentId`. BE1 cần xác nhận đây có phải đúng phạm vi phòng ban được giao quản lý theo nghiệp vụ hay không. Các use case dưới đây hiện chủ yếu lọc theo `organizationId`, chưa dùng tập nhân viên nhìn thấy của Manager:

- `Learning/CourseAssignments/GetCourseAssignmentsUseCase.cs`, `GetCourseAssignmentByIdUseCase.cs`, `GetAssignmentSummaryUseCase.cs`.
- `Reports/ReportUseCases.cs` (`GET /intelligence/dashboard`). Một số chỉ số năng lực ở đây cũng đang trả `0` cố định.
- `Tasks/GetTasksUseCase.cs`, `GetTaskByIdUseCase.cs`, `CreateTaskUseCase.cs`, `GetSubmissionDetailUseCase.cs`, `EvaluateSubmissionUseCase.cs`.
- `GetReviewQueueUseCase.cs` đã lọc `ReviewerUserId` cho người không phải Admin; hai API lấy chi tiết và chấm bài cần áp cùng quy tắc, không tin rằng người dùng chỉ truy cập ID từ hàng đợi.

### Yêu cầu triển khai

1. Dùng một hàm phạm vi nhân viên được BE1/BE2 thống nhất: Owner/HR xem tổ chức; Manager xem đúng nhân viên thuộc phạm vi quản lý; Employee chỉ xem chính mình. Nếu nghiệp vụ dùng lịch sử người quản lý/phòng ban, sửa `EmployeeScope` tại một chỗ và cho mọi use case dùng chung.
2. Lọc theo phạm vi **trước** `Count`, `Skip`, `Take`, tính KPI và nhóm theo phòng ban. `departmentId`/`employeeId` do client gửi chỉ là bộ lọc *bên trong* phạm vi đã được máy chủ xác định.
   Nếu một mẫu nhiệm vụ được giao cho nhiều phòng ban, chỉ trả người nhận, bài nộp và các bộ đếm thuộc phạm vi Manager; không dùng một `DepartmentId` lấy từ người nhận đầu tiên để đại diện cho cả mẫu.
3. API lấy chi tiết bằng ID phải trả 404 khi ngoài phạm vi, nhất quán với `EmployeeScope.GetVisibleEmployeeAsync`. Tạo nhiệm vụ cho người ngoài phạm vi phải bị từ chối toàn bộ yêu cầu; không âm thầm bỏ người ngoài phạm vi rồi vẫn tạo nhiệm vụ.
4. `POST /submissions/{id}/evaluate` phải kiểm tra cùng tổ chức, nhân viên trong phạm vi và người duyệt được giao (`TaskAssignment.ReviewerUserId`), trừ vai trò Owner/HR có quyền xử lý toàn tổ chức theo chính sách đã chốt. Không được tự duyệt bài của mình.
5. Giữ quyền `learning.create_assignment` hiện tại cho Owner/HR. Manager cần `learning.read_assignment` để theo dõi nhóm; không cấp thêm quyền tạo khóa chỉ để họ có thể học trong `/me/*`.

### Kiểm thử chấp nhận

- Tạo hai phòng ban, hai Manager và nhân viên thuộc mỗi phòng: Manager A không thấy assignment/task/submission và KPI của B; thêm `departmentId` của B hoặc đoán ID chi tiết cũng không vượt quyền.
- Manager A không thể tạo task cho nhân viên B hay chấm submission do B hoặc người duyệt khác phụ trách. Owner/HR vẫn thấy toàn tổ chức. Phân trang và tổng số khớp số bản ghi trong phạm vi.

## 3. BE2-02 — Khép vòng duyệt bài thực hành → minh chứng → năng lực (P0)

### Hiện trạng

`EvaluateSubmissionUseCase` hiện tạo `TaskEvaluation`, đặt `CountsAsEvidence` khi PASSED và đổi trạng thái assignment, nhưng chưa tạo `CompetencyEvaluationResult`, `CompetencyEvidence` hoặc cập nhật `EmployeeCompetencyProfile`. Schema v2.3 đã có các bảng này. Với nguồn `PRACTICAL_TASK`, `competency_evidences.competency_evaluation_result_id` là bắt buộc. `CreateManualEvidenceUseCase` có sẵn mẫu cập nhật profile và phát `EmployeeCompetencyLevelConfirmed`; `SkillGapRecalculationHandler` nghe sự kiện đó.

### Yêu cầu triển khai

1. Chốt tiêu chí chấm **từng năng lực** thuộc `PracticalTaskTargets`: `competencyId`, `targetLevel`, `score`, `verdict`, `feedback`; quyết định có xác nhận cấp độ hay không và `confirmedLevel` 1–3. Không suy ra cấp độ đã xác nhận chỉ từ điểm tổng hoặc một câu quiz.
2. Khi đánh giá được chốt: ghi `TaskEvaluation` và `CompetencyEvaluationResult` cho từng năng lực. Với kết quả đủ điều kiện xác nhận, tạo `CompetencyEvidence` nguồn `PRACTICAL_TASK` liên kết đúng `CompetencyEvaluationResult`; cập nhật/supersede hồ sơ năng lực theo quy tắc BE1, ghi audit và phát `EmployeeCompetencyLevelConfirmed` để tính lại skill gap. Thực hiện nhất quán trong một transaction/domain service dùng chung, không có hai cách cập nhật profile.
3. Với `NEEDS_REVISION`/`FAILED`, lưu đánh giá và phản hồi nhưng không nâng cấp độ năng lực. Với `PASSED` nhưng không có quyết định xác nhận cấp độ, có thể lưu kết quả học tập mà chưa đổi profile; thể hiện rõ trạng thái cho FE.
4. Kiểm tra thang điểm 0–100, cấp độ 1–3, quyền người duyệt, chống tự duyệt, đánh giá trùng và yêu cầu đồng thời. Dùng ràng buộc unique hiện có (`task_evaluations.task_submission_id`, `competency_evaluation_results` theo evaluation + competency, `finalization_key`) để bảo đảm gửi lại không sinh minh chứng/profile trùng.

### Kiểm thử chấp nhận

- Duyệt PASSED kèm xác nhận cấp độ: có một chuỗi evaluation → competency result → evidence → profile; skill gap của nhân viên tính lại và `/me/competency-profile`, `/me/learning-path` phản ánh dữ liệu mới.
- Yêu cầu sửa/chấm không đạt không nâng năng lực. Gửi cùng yêu cầu hai lần không tạo hai minh chứng. Người không được giao duyệt hoặc ngoài nhóm không thể đọc/chấm bài bằng ID trực tiếp.

## 4. BE2-03 — Giao khóa sau khi BE1 kích hoạt lời mời (P1, cần hợp đồng chung)

`POST /course-assignments` hiện đã tạo `CourseAssignment` và `Enrollment` cho nhân viên ACTIVE, đồng thời bỏ qua bản ghi đã giao hoặc đã hoàn thành. BE2 **không** xây lại lời mời, token, mail hay tài khoản của BE1.

**Đề xuất hợp đồng sự kiện nội bộ** `EmployeeInvitationActivated` (tên cuối cùng do hai nhóm chốt): `organizationId`, `employeeId`, `userId`, `roleCodes`, `departmentId`, `jobPositionId`, `selectedCourseIds`, `actorUserId`, `invitationId`/`eventId`. BE1 bảo đảm tài khoản, vai trò, hồ sơ nhân viên và trạng thái ACTIVE đã lưu trước khi phát sự kiện; BE2 kiểm tra khóa thuộc tổ chức và đã PUBLISHED rồi tạo assignment/enrollment. Nếu gửi mail hoặc xử lý bất đồng bộ, dùng outbox/retry và khóa chống lặp theo `eventId` hoặc cặp `(employeeId, courseId)`; không gọi HTTP từ backend sang chính backend.

Chốt với FE1 cách lưu khóa được chọn trong lời mời. Nếu chưa có API lời mời thật, Owner vẫn có thể giao khóa thủ công sau khi nhân viên ACTIVE; giao diện không được báo “đã giao” khi chỉ mới gửi lời mời. BE2 cần trả `created`/`skipped` và lý do ổn định để FE2 hiển thị.

**Kiểm thử:** kích hoạt một lần tạo đúng một assignment + enrollment cho mỗi khóa; phát lại sự kiện không tạo trùng; khóa DRAFT/khác tổ chức bị từ chối; Manager được mời vừa có khóa cá nhân vừa có quyền xem nhóm, không mặc nhiên có quyền tạo phân công khóa.

## 5. BE2-04 — Đánh giá đầu vào và mức tạm (P1, phải chốt schema với BE1)

Đặc tả `03A_SRS_Yeu_Cau_Chuc_Nang.md` mục O-8 ghi placement chưa hiện thực, kết quả là **mức tạm tách khỏi mức đã xác nhận**, và cần thay đổi schema v2.4. Các `Assessment` hiện tại bắt buộc có `CourseId`; `AssessmentAttempt` phục vụ bài kiểm tra trong khóa. Không đổi `assessment_type` thành `PLACEMENT` trên schema cũ chỉ để tái sử dụng màn quiz.

**Đề xuất hợp đồng BE2:** API của chính người học để lấy bài đầu vào phù hợp `jobPositionId`/`requirementSetId`, bắt đầu lượt làm, nộp đáp án và lấy kết quả gần nhất. Kết quả tối thiểu chứa `employeeId`, phiên bản bộ yêu cầu, `assessmentAttemptId`, thời điểm, điểm tổng và `[{competencyId, estimatedLevel}]`. BE2 lưu lượt làm và mức tạm; BE1 sở hữu chuẩn vị trí và mức đã xác nhận. Chỉ cung cấp bài của chính tài khoản, không trả đáp án đúng trước khi nộp. Thiếu vị trí/bộ yêu cầu thì trả lý do có cấu trúc.

**Quy tắc phải chốt trước khi code:** `GET /me/skill-gap` vẫn dựa trên mức **đã xác nhận**; mức tạm chỉ dùng để cá nhân hóa gợi ý/độ phù hợp khóa. Khi đã có mức xác nhận, mức đó ưu tiên hơn mức tạm. `GET /me/learning-path` nên cho FE biết nguồn mức đang dùng (`CONFIRMED`, `PLACEMENT`, `UNKNOWN`) để nhãn giao diện trung thực. FE1 làm màn Employee; FE2 cho Manager dùng lại màn và API đó.

**Kiểm thử:** hoàn thành placement rồi đăng xuất/đăng nhập vẫn thấy kết quả và lộ trình tương ứng; bài test không tự tạo `EmployeeCompetencyProfile` hay minh chứng CONFIRMED; đổi vị trí hoặc phiên bản chuẩn không âm thầm áp lại điểm cũ.

## 6. FE2 và các chỉ số BE2 cần hoàn thiện song song (P1)

- `frontend/src/features/assignments/components/AssignCourseModal.tsx`: FE2 đã tải đủ các trang khóa học/nhân viên và chỉ cho chọn ba đích BE2 thực sự xử lý trong chế độ API: nhân viên, phòng ban, vị trí. Tạm ẩn “theo cấp bậc” vì `CreateCourseAssignmentUseCase` chưa xử lý `JobGrade`; tạm ẩn “theo khoảng trống” vì lọc mọi nhân viên có `gapCount > 0` sẽ giao sai khóa khi khoảng trống không liên quan năng lực của khóa. Nếu cần mở lại hai lựa chọn này, BE2 phải triển khai đích cấp bậc và API ứng viên theo `courseId` dựa trên `course_competencies` + skill gap tương ứng, có phân trang và cùng quyền Owner/HR. FE2 chỉ bật lại sau khi hợp đồng được chốt và kiểm thử bằng dữ liệu thật.
- Các trang Manager tiếp tục dùng component/hook `/me/*` chung với Employee, không copy thành bộ API cá nhân thứ hai. Khi chưa có `employees.user_id`, vị trí hoặc chuẩn năng lực, hiển thị lý do thiếu dữ liệu cụ thể; không hiển thị 0% như kết quả đánh giá thật.
- `GET /intelligence/dashboard` hiện có `AverageCoverage`, `AverageRequired`, `AverageCurrent` và một số trường khác bằng 0 cố định. Tính từ tập nhân viên/snapshot hợp lệ, phân biệt “chưa có dữ liệu” với giá trị đo bằng 0, và áp đúng phạm vi Manager trước khi trả KPI.

## 7. Hợp đồng bàn giao cần hai nhóm xác nhận

| Chủ đề | BE1/FE1 bàn giao | BE2/FE2 sử dụng/trả lại |
| --- | --- | --- |
| Kích hoạt tài khoản | `organizationId`, `employeeId`, `userId`, role, phòng ban, vị trí, trạng thái ACTIVE, ID sự kiện; danh sách khóa đã chọn nếu mời kèm khóa | Tạo assignment/enrollment đúng một lần; trả trạng thái từng khóa |
| Chuẩn vị trí | Vị trí hiện tại, active requirement set/version, các competency và mức yêu cầu | Tạo placement theo đúng phiên bản; giải thích khóa gợi ý theo competency |
| Đánh giá đầu vào | FE1 hiển thị trải nghiệm Employee; BE1 xác định nguồn chuẩn vị trí và chính sách mức đã xác nhận | BE2 lưu attempt và mức tạm; lộ trình dùng mức tạm theo chính sách đã chốt |
| Bài thực hành được duyệt | BE1 sở hữu logic ghi profile/skill gap hoặc công bố service dùng chung | BE2 ghi kết quả từng năng lực + evidence, gọi service/phát event; không ghi profile qua đường thứ hai |
| Phạm vi Manager | BE1 xác định đúng nhóm/phòng ban được giao quản lý và cấp hàm scope dùng chung | BE2 áp scope cho mọi danh sách, chi tiết, tổng hợp và thao tác ghi |

## 8. Điều kiện nhận bàn giao

Một ca kiểm thử tự động và một ca chạy thật với Owner, Manager A, Manager B, Employee A/B của hai nhóm: mời và kích hoạt → giao khóa → làm placement → xem lộ trình sau đăng nhập lại → học và nộp bài → Manager A duyệt Employee A → năng lực/gap/lộ trình cập nhật → Manager A không thấy hoặc thao tác được dữ liệu của B bằng cả danh sách lẫn URL/API ID trực tiếp. Giữ response contract cũ khi có thể; nếu đổi DTO/API, cập nhật `docs/BE2_API_GUIDE.md` cùng FE service/types và thông báo BE1/FE1 trước khi merge.
