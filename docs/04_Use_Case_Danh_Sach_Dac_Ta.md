# 04 — Danh Sách & Đặc Tả Use Case

> Nguồn: Report 3 — *Software Requirement Specification* v2.3, §§2.1–2.2, 3.1.2–3.1.6. Aligned to `DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md`. Report 3 v2.3’s grade-storage decision is not adopted here; `GRADE-01` remains **PENDING DECISION** per the Master Overview.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Danh sách & đặc tả use case |
| Phiên bản | 3.1 |
| Trạng thái | Bản nháp đã đồng bộ danh mục với Report 3 v2.3 |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 v2.3 §§2.1–2.2, 3.1.2–3.1.6; Master Overview 09/10/2026 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ và đặc tả theo baseline cũ 46 UC. |
| 09/10/2026 | 3.1 | Thay inventory legacy bằng 44 UC entries, 42 screens, package và non-screen functions từ Report 3 v2.3; giữ GRADE-01 pending theo Master Overview. |

---

## 2. Mục đích và phạm vi

Tài liệu liệt kê 44 use case entries theo Report 3 v2.3. Mỗi entry là mục đích người dùng hoặc một internal function được giữ để trace. **UC-24 Recalculate Affected Skill Gap** và **UC-31 Issue Certificate** là internal functions, không có actor người dùng và không được hiểu là user-initiated UML use cases. Report 3 v2.3 đồng thời liệt kê 42 screens; sáu system functions không có màn hình được ghi riêng ở §6.

Các hàng dưới đây ghi tên, actor, Report 1 feature và mô tả theo Report 3. Đây là yêu cầu, không khẳng định trạng thái triển khai. Trạng thái implementation cần được xác minh riêng theo commit và test evidence.

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* v2.3, các bảng Use Cases, Screen Descriptions, Non-Screen Functions và Use Case Traceability.
- `03A_SRS_Yeu_Cau_Chuc_Nang.md` — yêu cầu chức năng.
- `09_Ma_Tran_Phan_Quyen_RBAC.md` — ma trận phân quyền.
- `DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md` — baseline và quyết định mới nhất.

> **Xung đột phiên bản:** Report 3 v2.3 Record of Changes ghi quyết định lưu scale năng lực 1–3. Master Overview vẫn chỉ định `GRADE-01` là **PENDING DECISION**; tài liệu này giữ pending và không dùng kết luận v2.3 để đóng quyết định. Ba Level Basic / Intermediate / Advanced là nhóm Level đào tạo; không suy diễn thành grade-storage decision.

---

## 4. Phân nhóm package

| Package | Use case | Actor chính | Internal functions | Report 3 |
|---------|----------|-------------|--------------------|-----------|
| AUTH | UC-01–06 | Account Holder; tất cả actor đã đăng nhập cho UC-02, UC-04–06 | — | §3.2 |
| MOD-01 — Platform Administration & Standard Content | UC-07–14 | Platform Admin | — | §§3.4, 3.6, 3.7, 3.11 |
| MOD-02 — Organization, Positions & TT02 Requirements | UC-15–19 | Owner; UC-15 cũng có Manager và Employee | — | §§3.3, 3.4 |
| MOD-03 — Skill Gap & Competency | UC-20–24 | Employee, Manager, Owner | UC-24 | §§3.5, 3.9 |
| MOD-04 — Learning | UC-25–28 | Owner, Manager, Employee | — | §3.6 |
| MOD-05 — Assessment & Certificates | UC-29–34 | Employee, Owner, Manager | UC-31 | §3.7 |
| MOD-06 — Practical Task & Evidence | UC-35–39 | Owner, Manager, Employee | — | §3.8 |
| MOD-07 — Dashboards & Notifications | UC-40–44 | Tất cả actor đăng nhập | Notifications function | §3.10 |

---

## 5. Danh sách 44 use case entries

| ID | Use case | Actor | Report 1 | Mô tả |
|----|----------|-------|----------|------|
| UC-01 | Log In | Account Holder (chưa đăng nhập) | FE-01.1 | Xác thực email và mật khẩu, tạo session theo role. |
| UC-02 | Log Out | Tất cả actor đăng nhập | FE-01.2 | Kết thúc session và vô hiệu hóa token. |
| UC-03 | Recover Forgotten Password | Account Holder (chưa đăng nhập) | FE-01.5 | Yêu cầu link reset qua email và đặt mật khẩu mới qua link. |
| UC-04 | Update My Profile | Tất cả actor đăng nhập | FE-01.3 | Xem và sửa thông tin cơ bản của chính mình. |
| UC-05 | Change My Password | Tất cả actor đăng nhập | FE-01.4 | Đổi mật khẩu sau khi xác nhận mật khẩu hiện tại. |
| UC-06 | Manage My Active Sessions | Tất cả actor đăng nhập | FE-01.3 | Xem thiết bị đã đăng nhập và thu hồi session cần thiết. |
| UC-07 | Manage TT02 Framework Version | Platform Admin | FE-03.2 | Tạo, rà soát và publish phiên bản TT02 cùng domains, competencies và level criteria. |
| UC-08 | Manage Standard Curriculum | Platform Admin | FE-06.1 | Tạo và publish standard courses gồm modules, lessons và TT02 mapping. |
| UC-09 | Manage Standard Question Bank | Platform Admin | FE-06.5 | Quản lý câu hỏi chuẩn; AI draft nếu có phải được người duyệt. |
| UC-10 | Set Up Standard Assessment | Platform Admin | FE-06.5 | Tạo standard assessment từ question bank và đặt pass rule. |
| UC-11 | Manage Reference Positions | Platform Admin | FE-03.4 | Duy trì position templates để Owner có thể sao chép. |
| UC-12 | Manage Organizations and Platform Users | Platform Admin | FE-09.1 | Tạo organizations, Owner đầu tiên và quản lý platform accounts. |
| UC-13 | View and Search Audit Logs | Platform Admin | FE-09.3 | Tìm kiếm lịch sử các hành động nhạy cảm trên platform. |
| UC-14 | Manage System Settings | Platform Admin | FE-09.4 | Quản lý cấu hình platform như password rules, session lifetime và file limits. |
| UC-15 | View TT02 Reference Framework | Owner, Manager, Employee | FE-03.1 | Xem TT02 active, domains, competencies và criteria từng level. |
| UC-16 | Manage Members and Invitations | Owner | FE-02.3 | Mời member, gán role/department/position và vô hiệu hóa quyền truy cập. |
| UC-17 | Manage Departments | Owner | FE-02.1 | Quản lý cây department và Manager phụ trách từng department. |
| UC-18 | Manage Job Positions | Owner | FE-02.2 | Quản lý position của organization, có thể bắt đầu từ reference position. |
| UC-19 | Maintain Position Requirement Set | Owner | FE-04 | Định nghĩa và version hóa competency cùng TT02 level cần cho position. |
| UC-20 | View My Competency Profile and Skill Gap | Employee | FE-05.2 | Xem requirement, Confirmed Competency, skill gap, learning và assessment status của mình. |
| UC-21 | View Team Skill Gap Matrix | Manager, Owner | FE-05.3 | So sánh team hoặc organization với position requirements trong data scope. |
| UC-22 | View Workforce Analytics and Gap Heatmap | Owner, Manager | FE-05.3 | Xem competency coverage toàn organization hoặc assigned departments, lọc theo department, position hoặc domain. |
| UC-23 | View Confirmed Competency History | Employee, Manager, Owner | FE-05.1 | Xem thay đổi competency và nguồn evidence/Owner override; Owner có thể ghi override theo rule. |
| UC-24 | Recalculate Affected Skill Gap | Internal function | FE-05.4 | Tính lại gap sau evidence confirmation, requirement activation, position change hoặc request được phép. |
| UC-25 | Assign Course to Employees | Owner | FE-06.3 | Chủ động giao standard course cho một hoặc nhiều employee khi có cập nhật tổ chức/đào tạo lại, kèm due date và reason; đây là assignment tường minh, tách biệt với course recommendation tự động. |
| UC-26 | Monitor Training Progress | Owner, Manager | FE-06.3 | Theo dõi assignment status, progress và overdue trong phạm vi cho phép. |
| UC-27 | View My Courses and Learning Path | Employee | FE-06.4 | Xem course được đề xuất theo Skill Gap và course đã giao, phân biệt recommendation/assignment, tiến độ và deadline; Employee có thể bắt đầu course được đề xuất. |
| UC-28 | Study a Course | Employee | FE-06.4 | Học lesson, knowledge check và practice; lưu tiến độ. |
| UC-29 | Take an Assessment | Employee | FE-06.6 | Làm assessment theo time/attempt limits và xem kết quả. |
| UC-30 | Review Learner Assessment Results | Owner, Manager | FE-06.7 | Xem kết quả assessment và câu hỏi bị trả lời sai nhiều trong scope. |
| UC-31 | Issue Certificate | Internal function | FE-06.8 | Tạo certificate khi course hoàn tất và final assessment đạt, nếu course eligible. |
| UC-32 | View and Download My Certificates | Employee | FE-06.8 | Xem/tải certificate của mình và hiển thị QR. |
| UC-33 | View Organization Certificates | Owner, Manager | FE-06.9 | Xem certificate theo organization/team; Owner có thể revoke kèm reason. |
| UC-34 | Verify Certificate by QR | Owner, Manager | FE-06.9 | Xác minh QR/link; cần đăng nhập trong đúng organization phát hành. |
| UC-35 | Manage Practical Task Templates | Owner, Manager | FE-07.1 | Quản lý template practical task, marking criteria và target competencies. |
| UC-36 | Assign Practical Task to Employee | Owner, Manager | FE-07.2 | Giao task, due date và reviewer cho employee trong scope. |
| UC-37 | Submit Practical Task Evidence | Employee | FE-07.3 | Nộp note/file/link và resubmit phiên bản mới sau feedback. |
| UC-38 | Review Submission and Confirm Evidence | Owner, Manager | FE-07.4 | Review submission và quyết định theo từng target competency. Nếu AI evaluation scope được phê duyệt, xem/điều chỉnh AI đề xuất theo rubric, approve hoặc yêu cầu bổ sung; chỉ human-approved result hợp lệ mới xác nhận evidence/competency. |
| UC-39 | View Team Evidence Portfolio | Owner, Manager | FE-07.5 | Xem evidence đã xác nhận của employee trong scope. |
| UC-40 | View Owner Organization Dashboard | Owner | FE-08.1 | Xem skill gap, training status và pending reviews toàn organization. |
| UC-41 | View Manager Team Dashboard | Manager | FE-08.2 | Xem gap, training status và pending reviews của assigned departments. |
| UC-42 | View My Learning Dashboard | Employee | FE-08.3 | Xem gap, course đang học, task tới hạn và feedback gần đây của mình. |
| UC-43 | View Notifications | Tất cả actor đăng nhập | FE-08.4 | Đọc notification về assignment, feedback, evidence, certificate và invitation. |
| UC-44 | View Platform Dashboard | Platform Admin | FE-09.2 | Xem organizations, users, content status và hoạt động platform gần đây. |

### 5.1 Actors và data scope

| Actor | Quyền theo baseline |
|-------|-------------------|
| Platform Admin (`PLATFORM_ADMIN`) | Quản lý organizations, platform users, TT02, standard content, reference positions, settings và platform audit; không mặc định truy cập evidence riêng của organization. |
| Owner (`OWNER`) | Quản trị organization, members, departments, positions, requirements; chủ động giao course khi cần, giao task, review evidence, xem organization records, revoke certificate và correction grade có kiểm soát. |
| Manager (`MANAGER`, optional) | Chỉ trong assigned departments: theo dõi learning, giao/review task, xác nhận evidence; không giao course, không sửa organization structure, không revoke certificate. |
| Employee (`EMPLOYEE`) | Xem course được đề xuất hoặc giao, tự bắt đầu course đề xuất, làm assessment, nộp task submission và chỉ xem dữ liệu của mình. |

`Account Holder` là actor chưa đăng nhập chỉ cho sign-in/password recovery. `System`/internal functions không phải role. Không có Internal Trainer, HR Manager, Department Manager hoặc Public Visitor trong Enterprise MVP.

### 5.2 Các yêu cầu target cần đồng bộ với Report 3 inventory

Các dòng này làm rõ hành vi yêu cầu mới mà inventory Report 3 v2.3 chưa thể hiện đầy đủ; chúng chưa phải xác nhận triển khai hoặc UC/screen/API ID mới. Giữ inventory gốc 44 entries/42 screens cho đến khi Report 1/2 và Report 3 được rà soát, version hóa chính thức.

| Capability | Use case liên quan | Actor / kết quả cần có |
|---|---|---|
| Tự động gợi ý course | UC-24, UC-27 | Sau khi Skill Gap và competency-course mapping có dữ liệu, hệ thống hiển thị các published standard course bao phủ từng competency đang Gap/Partial Gap, kèm giải thích mapping. Đây là recommendation, không enroll/assign tự động. Employee có thể bấm bắt đầu; nếu đã được giao/đang học, hiển thị trạng thái hiện có. |
| Giao course chủ động | UC-25–27 | Owner có thể tạo assignment cho cập nhật tổ chức/đào tạo lại, với reason, due date nếu có và Course Version. Assignment tồn tại song song với recommendation; Manager chỉ monitor. Chưa chốt yêu cầu retraining có bắt buộc Practical Task sau final assessment hay không. |
| AI hỗ trợ đánh giá Practical Task | UC-38 (scope pending) | Nếu Report 1/2 phê duyệt phạm vi: AI đọc evidence được phép truy cập, đối chiếu rubric version và đưa đề xuất theo tiêu chí, điểm/kết quả, căn cứ tham chiếu và tiêu chí còn thiếu. Owner/Manager review, edit, approve hoặc yêu cầu evidence bổ sung. Chỉ quyết định người duyệt hợp lệ mới tạo/cập nhật Confirmed Competency. |

Điểm số số học của Practical Task và competency level là hai kết quả khác nhau; chỉ rubric/rule được version hóa mới có thể ánh xạ kết quả review sang competency level. Lưu rubric version, AI result, model/version nếu có, reviewer decision và edits. Chỉ mục tiêu yêu cầu ở mức nghiệp vụ; endpoint/API shape, screen detail, quyền truy cập cụ thể và test cases cần được đồng bộ trong các tài liệu thiết kế sau khi scope được phê duyệt.

---

## 6. Danh sách 42 screens và non-screen functions

### 6.1 Screens

| # | Khu vực | Screen | Mô tả / quyền chính |
|---:|---------|--------|--------------------|
| 1 | Common & Auth | Login | Đăng nhập. |
| 2 | Common & Auth | Forgot / Reset Password | Yêu cầu reset và đặt mật khẩu mới. |
| 3 | Common & Auth | Profile & Security Settings | Profile, mật khẩu và active sessions của người dùng. |
| 4 | Common & Auth | Notification Center | Notification của người đăng nhập và read state. |
| 5 | Common & Auth | 403 Access Denied | Ngoài quyền hoặc data scope. |
| 6 | Common & Auth | 404 Not Found | Record không tồn tại hoặc không được phép lộ. |
| 7 | TT02 Reference | TT02 Framework Explorer | Đọc TT02 version active. |
| 8 | TT02 Reference | TT02 Competency Detail | Competency và level criteria. |
| 9 | Platform Admin | Platform Dashboard | Organization, users, content và platform activity. |
| 10 | Platform Admin | Organizations & Users | Organization và platform accounts. |
| 11 | Platform Admin | TT02 Framework Management | Tạo/rà soát/publish TT02 versions. |
| 12 | Standard Content | Standard Curriculum Builder | Courses, modules, lessons và media. |
| 13 | Standard Content | Question Bank Management | Standard questions mapped với TT02. |
| 14 | Standard Content | Assessment Setup | Standard assessment và pass rule. |
| 15 | Platform Admin | Reference Positions | Position templates để Owner sao chép. |
| 16 | Platform Admin | Audit Logs | Sensitive action trail. |
| 17 | Platform Admin | System Settings | Platform settings. |
| 18 | Owner | Owner Dashboard | Organization gap, training, reviews và certificates. |
| 19 | Organization | Members & Invitations | Members, role, department, position, invitations. |
| 20 | Organization | Departments | Department tree và manager assignment. |
| 21 | Organization | Positions | Organization positions và reference copy. |
| 22 | Requirements | Position Requirement Editor | Requirement competency/level và version status. |
| 23 | Competency | Skill Gap Analytics & Heatmap | Gap heatmap theo position/department. |
| 24 | Competency | Employee Competency History | Confirmed Competency history và evidence. |
| 25 | Learning | Course Recommendations, My Courses & Training Monitor | Employee xem/bắt đầu recommendation; Owner giao course tường minh; Owner/Manager theo dõi progress trong scope. |
| 26 | Assessment | Assessment Results | Assessment attempts/results trong scope. |
| 27 | Practical Task | Practical Task Template Library | Task templates. |
| 28 | Practical Task | Practical Task Assignment | Giao task và reviewer. |
| 29 | Practical Task | Submission Review & Evidence Approval | Review, feedback và evidence confirmation; AI advisory panel nếu scope được phê duyệt, human reviewer quyết định. |
| 30 | Practical Task | Team Evidence Portfolio | Confirmed evidence trong scope. |
| 31 | Certificate | Certificate Registry | Certificate; Owner revoke, Manager read-only theo scope. |
| 32 | Manager | Team Dashboard | Assigned department gap, training và reviews. |
| 33 | Manager | My Team | Members thuộc departments được giao. |
| 34 | Manager | Team Skill Gap Matrix | Member so với position requirements. |
| 35 | Employee | My Learning Dashboard | Gap, courses, task và feedback của mình. |
| 36 | Employee | My Competency Profile & Gap | Profile, confirmed competency và gap cá nhân. |
| 37 | Employee | My Courses & Learning Path | Courses được đề xuất hoặc giao, nguồn recommendation/assignment, tiến độ và deadline. |
| 38 | Employee | Course Player | Lesson content và progress. |
| 39 | Employee | Assessment Interface | Assessment, countdown, review và result. |
| 40 | Employee | My Tasks & Evidence Submission | Assigned tasks, submission versions và feedback. |
| 41 | Employee | My Certificates | Certificate cá nhân, PDF và QR. |
| 42 | Certificate | Certificate Verification | QR/link verification; Owner/Manager đã đăng nhập, đúng organization. |

### 6.2 Non-screen functions

| ID | System function | Mô tả |
|----|-----------------|------|
| NS-1 | Recalculate Skill Gap | Tính lại nhân viên bị ảnh hưởng; queued, có Pending/Done/Failed; trigger từ evidence, requirement activation, position change hoặc request được phép. |
| NS-2 | Update Confirmed Competency | Cập nhật competency khi level-confirming evidence được xác nhận và ghi history. |
| NS-3 | Issue Certificate | Sinh certificate code, QR, PDF sau khi course eligible hoàn tất và final assessment đạt. |
| NS-4 | Create Notification | Ghi in-app notifications cho assignment, feedback, confirmations, certificates và invitations; client polling. |
| NS-5 | Send Email | Gửi password reset, invitations và optional assignment notice qua SMTP. |
| NS-6 | Record Audit Entry | Ghi append-only audit entry cho sensitive actions. |

UC-24 map tới NS-1; UC-31 map tới NS-3; NS-2 và NS-4–NS-6 là system functions không được tính thành user-goal UC bổ sung. 403, 404 và My Team là screens không có use case riêng.

---

## 7. Quy tắc đặc tả và các business rules liên quan

- **Scope/authorization:** Platform Admin quản lý platform và standard content; Owner hành động trong organization; Manager chỉ trong assigned departments theo lịch sử assignment; Employee chỉ dữ liệu cá nhân. Backend enforce quyền trên mỗi request.
- **Skill Gap:** chỉ so với Active Requirement Set và Confirmed Competency. `Met` khi đạt/yêu cầu; `Partial Gap` khi có confirmed level thấp hơn; `Gap` khi chưa có confirmed level, nghĩa là thiếu minh chứng xác nhận chứ không kết luận thiếu năng lực; `Not Assessed` nếu không có position hoặc active requirement set.
- **Course/assessment:** standard content do Platform Admin quản lý; system recommendation dùng Skill Gap + competency-course mapping, không tự enroll. Employee có thể bắt đầu recommendation; Owner cũng chủ động giao course cho cập nhật/đào tạo lại. Hai nguồn hiển thị riêng. Assignment giữ Course Version và Assessment Version; attempt dùng assessment version tại thời điểm bắt đầu. Course/assessment results không làm tăng Confirmed Competency.
- **Certificate:** course phải certificate-eligible, hoàn tất required lessons và final assessment đạt. Certificate riêng tư, Valid/Revoked, không expiry. QR verification yêu cầu Owner/Manager đăng nhập cùng organization phát hành; không public registry/visitor.
- **Evidence review:** review theo từng target competency; chỉ target Passed tạo evidence. Chỉ level-confirming evidence làm tăng Confirmed Competency. Owner correction chỉ giảm/reset grade để sửa lỗi, cần reason + audit, no-self-correction; tăng grade không qua manual override thì phải qua evidence được duyệt.
- **AI evaluation target (scope pending):** nếu được duyệt trong Report 1/2, AI đề xuất per-criterion assessment theo rubric version; reviewer Owner/Manager quyết định cuối. Lưu AI result/model version khi có, rubric version, reviewer decision và edits. Task score không phải competency level; chỉ human-approved, valid review mới cập nhật competency.
- **Late submission:** nhận và đánh dấu `IsLate`; vẫn được reviewer xem/chấm, và có thể tạo evidence nếu đạt. Quy tắc này theo Master Overview đã xác nhận, thay cho câu “late submissions are not scored” trong Report 3 v2.3 §3.8.3.
- **GRADE-01:** PENDING DECISION. Report 3 v2.3 Record of Changes và §5.4 nói grade lưu 1–3; Master Overview yêu cầu chưa đóng lựa chọn. Tài liệu này không dùng quyết định v2.3 để chốt grade storage.

---

## 8. Ma trận vết UC → Screen / Internal Function → Feature

| UC | Screen / Internal Function | Report 1 |
|----|----------------------------|----------|
| UC-01 | 1 Login | FE-01.1 |
| UC-02 | Account menu trên mọi screen | FE-01.2 |
| UC-03 | 2 Forgot / Reset Password | FE-01.5 |
| UC-04–06 | 3 Profile & Security Settings | FE-01.3 / FE-01.4 |
| UC-07 | 11 TT02 Framework Management | FE-03.2 |
| UC-08 | 12 Standard Curriculum Builder | FE-06.1 |
| UC-09 | 13 Question Bank Management | FE-06.5 |
| UC-10 | 14 Assessment Setup | FE-06.5 |
| UC-11 | 15 Reference Positions | FE-03.4 |
| UC-12 | 10 Organizations & Users | FE-09.1 |
| UC-13 | 16 Audit Logs | FE-09.3 |
| UC-14 | 17 System Settings | FE-09.4 |
| UC-15 | 7 TT02 Framework Explorer; 8 TT02 Competency Detail | FE-03.1 |
| UC-16 | 19 Members & Invitations | FE-02.3 |
| UC-17 | 20 Departments | FE-02.1 |
| UC-18 | 21 Positions | FE-02.2 |
| UC-19 | 22 Position Requirement Editor | FE-04 |
| UC-20 | 36 My Competency Profile & Gap | FE-05.2 |
| UC-21 | 34 Team Skill Gap Matrix | FE-05.3 |
| UC-22 | 23 Skill Gap Analytics & Heatmap | FE-05.3 |
| UC-23 | 24 Employee Competency History; 36 My Competency Profile & Gap | FE-05.1 |
| UC-24 | NS-1 Recalculate Skill Gap; refresh recommendation target function | FE-05.4 |
| UC-25–26 | 25 Course Recommendations, My Courses & Training Monitor | FE-06.3 |
| UC-27 | 37 My Courses & Learning Path, including recommendation/start action | FE-06.4 |
| UC-28 | 38 Course Player | FE-06.4 |
| UC-29 | 39 Assessment Interface | FE-06.6 |
| UC-30 | 26 Assessment Results | FE-06.7 |
| UC-31 | NS-3 Issue Certificate | FE-06.8 |
| UC-32 | 41 My Certificates | FE-06.8 |
| UC-33 | 31 Certificate Registry | FE-06.9 |
| UC-34 | 42 Certificate Verification | FE-06.9 |
| UC-35 | 27 Practical Task Template Library | FE-07.1 |
| UC-36 | 28 Practical Task Assignment | FE-07.2 |
| UC-37 | 40 My Tasks & Evidence Submission | FE-07.3 |
| UC-38 | 29 Submission Review & Evidence Approval | FE-07.4 |
| UC-39 | 30 Team Evidence Portfolio | FE-07.5 |
| UC-40 | 18 Owner Dashboard | FE-08.1 |
| UC-41 | 32 Team Dashboard | FE-08.2 |
| UC-42 | 35 My Learning Dashboard | FE-08.3 |
| UC-43 | 4 Notification Center | FE-08.4 |
| UC-44 | 9 Platform Dashboard | FE-09.2 |

**Implementation status:** chưa được xác minh trong tài liệu này. Đối chiếu repository và test evidence theo commit trước khi đánh dấu Implemented, Partial hoặc Missing.
