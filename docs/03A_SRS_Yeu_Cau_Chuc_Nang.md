# 03A — SRS: Tài liệu Đặc Tả Yêu Cầu Phần Mềm (Chức Năng)

> Nguồn gốc: Report 3 — *Software Requirement Specification* §2–§3, §5. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Software Requirements Specification — Yêu cầu chức năng |
| Phiên bản | 3.1 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §1–§3, §5 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ, căn chỉnh theo Reports, bỏ trục Career Grade (chỉ 3 mức năng lực) |
| 29/09/2026 | 3.1 | Sprint 3 (S3-T025): chi tiết hóa §7.6 theo phần đã hiện thực (công thức skill gap, gợi ý khóa học, tính lại tự động, ghi nhận năng lực thủ công), sửa §7.8.5 theo D-S3-08, bổ sung NF-01, MSG27–MSG34, §13 trạng thái hiện thực & điểm mở. Nguồn: `docs/specs/2026-09-28-sprint3-skill-gap-recommendation-spec.md` |

---

## 2. Mục đích và phạm vi

Đặc tả yêu cầu **chức năng** của DigiTalent AI theo chuẩn IEEE 29148:2018. Tài liệu trả lời "hệ thống làm gì" ở mức chi tiết đủ để triển khai và kiểm thử. Yêu cầu phi chức năng (NFR) nằm ở file `03B`.

**Ngoài phạm vi:** NFR/chất lượng (03B), thiết kế kỹ thuật (06–08), phân quyền chi tiết (09).

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* (08/2026)
- Report 1 — *Project Introduction* (FE-01..09, AI scope)
- `00_INDEX_Tong_Quan_Tai_Lieu.md` — sự kiện chuẩn
- `02_BRD_Yeu_Cau_Nghiep_Vu.md` — yêu cầu nghiệp vụ

---

## 4. Tổng quan sản phẩm

DigiTalent AI là nền tảng web nội bộ giúp doanh nghiệp IT vừa và nhỏ (~80–200 nhân sự) trả lời câu hỏi: **nhân viên có thực sự đủ năng lực mà vị trí công việc yêu cầu không, và có bằng chứng chứng minh điều đó không.** Hệ thống khép vòng 4 mảnh thường bị quản lý rời rạc: kiến trúc công việc, khung năng lực số, học tập–đánh giá nội bộ, và task thực hành sau đào tạo — thành một luồng duy nhất từ "vị trí này cần gì" đến "đây là sản phẩm công việc chứng minh nhân viên làm được".

**Vòng lặp nghiệp vụ lõi:**

1. **Position Requirement Set** định nghĩa năng lực + mức yêu cầu cho một vị trí.
2. Hệ thống so sánh yêu cầu với hồ sơ năng lực đã xác nhận → **Skill Gap**.
3. Gap thúc đẩy **gợi ý khóa học** (HR chấp nhận/override).
4. Nhân viên học → **thi cuối** → đạt → cấp **chứng chỉ QR** xác minh công khai.
5. Quản lý giao **task thực hành** → nhân viên nộp → duyệt → xác nhận **bằng chứng năng lực**.
6. Bằng chứng cập nhật hồ sơ → phản hồi lại gap, risk, readiness.

Mọi điểm số đều **rule-based và giải thích được**; trọng số lưu ở cấu hình, không ghi cứng trong code.

> **Mô hình mức năng lực (docs_v3):** dùng duy nhất **3 mức Basic / Intermediate / Advanced** (tham chiếu DigComp 3.0). Không dùng trục Career Grade (G1–G5) — xem `00_INDEX` §3.1.3. `Position Requirement Set` khóa theo **Job Position**, không còn "Position + Career Grade".

---

## 5. Actor hệ thống

| # | Actor | Loại | Mô tả |
|---|-------|------|-------|
| 1 | System Administrator | Primary | Quản lý tài khoản, phân quyền, cấu hình trọng số/level mapping, audit |
| 2 | HR / Training Manager | Primary | Sở hữu quản trị năng lực: job architecture, requirement set, competency library, giao khóa học, chứng chỉ, analytics |
| 3 | Department Manager | Primary | Theo dõi gap đội, giao task, duyệt bằng chứng — chỉ trong phòng ban mình quản lý |
| 4 | Internal Trainer | Primary | Xây khóa học/bài học, ngân hàng câu hỏi, assessment, xem kết quả |
| 5 | Employee | Primary | Học, thi, nộp bằng chứng, giữ chứng chỉ |
| 6 | Public Visitor | Primary | Xác minh chứng chỉ công khai, không đăng nhập |
| 7 | Scheduled system process | Supporting (không phải actor) | Tính gap/risk/readiness, hết hạn chứng chỉ, gửi nhắc/alert |

---

## 6. Bản đồ chức năng — 8 package, 46 use case, 44 màn hình

### 6.1 Gộp nhóm use case theo package

| Package | Use case | Primary actor | Mục SRS |
|---------|----------|---------------|---------|
| PKG-01 Account, Session & Administration | UC-01..06, UC-08..13 | Tất cả + System Administrator | §3.2, §3.11 |
| PKG-02 Organization & Competency Governance | UC-14..22 | HR / Training Manager (+ Dept Manager read) | §3.3, §3.4 |
| PKG-03 Competency-Linked Learning | UC-24, 35, 41, 42 | HR, Trainer, Employee | §3.5 |
| PKG-04 Assessment & Question Bank | UC-36, 37, 38, 43 | Trainer, Employee | §3.6 |
| PKG-05 Skill Gap Analysis & Capability Insight | UC-25, 26, 29, 40 | HR, Dept Manager, Employee (+ Scheduler) | §3.7 |
| PKG-06 Digital Certificate & Public Verification | UC-27, 45, 46 | HR, Employee, Public Visitor | §3.8 |
| PKG-07 Practical Task & Competency Evidence | UC-30..33, 44 | Dept Manager, Employee | §3.9 |
| PKG-08 Dashboards, Analytics & Notifications | UC-07, 23, 28, 34, 39 | HR, Dept Manager, Trainer, Employee | §3.10 |

### 6.2 Danh sách 46 use case (user-goal level)

| # | Use case | Actor | Mô tả |
|---|----------|-------|-------|
| UC-01 | Log In | Tất cả signed-in | Xác thực email + password, nhận session theo role |
| UC-02 | Log Out | Tất cả | Kết thúc session, hủy token |
| UC-03 | Recover Forgotten Password | Tất cả | Gửi link reset qua email, đặt mật khẩu mới |
| UC-04 | Update My Profile | Tất cả | Xem/sửa thông tin cơ bản của bản thân |
| UC-05 | Change My Password | Tất cả | Đổi mật khẩu sau khi xác nhận mật khẩu cũ |
| UC-06 | Manage My Active Sessions | Tất cả | Xem thiết bị đăng nhập, thu hồi session lạ |
| UC-07 | View Notifications | Tất cả | Đọc thông báo về giao việc, feedback, hết hạn, risk |
| UC-08 | Manage User Accounts | System Administrator | Tạo/khóa/mở tài khoản, gán 1 trong 5 role |
| UC-09 | Configure RBAC Permission Matrix | System Administrator | Xem/chỉnh quyền theo role-module |
| UC-10 | Configure Competency Level Display Mapping | System Administrator | Cấu hình 3 mức hiển thị Basic/Intermediate/Advanced |
| UC-11 | Configure Scoring Weights | System Administrator | Chỉnh trọng số risk/readiness/recommendation không đổi code |
| UC-12 | View and Search Audit Logs | System Administrator | Truy vết ai đổi gì, khi nào |
| UC-13 | Manage System Settings | System Administrator | Chỉnh cấu hình chung (vd thời hạn chứng chỉ mặc định) |
| UC-14 | Manage Job Families | HR | Tạo/sửa/archive 5 job family |
| UC-15 | Manage Job Positions | HR | Duy trì 7 vị trí, gắn job family + external reference |
| UC-16 | Maintain Position Requirement Set | HR | Nháp yêu cầu năng lực cho vị trí, kích hoạt phiên bản |
| UC-17 | Manage Departments | HR | Cây phòng ban + người quản lý |
| UC-18 | Manage Employee Profiles | HR | Hồ sơ nhân viên: phòng ban, vị trí, quản lý trực tiếp |
| UC-19 | Manage Competency Categories | HR | Nhóm năng lực để duyệt/báo cáo |
| UC-20 | Manage Competencies | HR | Competency library (~40), 4 loại |
| UC-21 | Define Competency Level Criteria | HR | Viết hành vi quan sát được cho 3 mức |
| UC-22 | View Capability Executive Dashboard | HR | Readiness/risk/gap toàn công ty theo job family |
| UC-23 | View Workforce Analytics and Gap Heatmap | HR | Heatmap nơi năng lực mỏng |
| UC-24 | Assign Course to Employees | HR | Giao khóa học cho 1/nhiều nhân viên |
| UC-25 | View Employee Capability History | HR | Diễn biến readiness/risk theo thời gian |
| UC-26 | Manage Certificate Registry | HR | Liệt kê/lọc/thu hồi chứng chỉ |
| UC-27 | View Department Capability Dashboard | Dept Manager | Readiness/risk phòng ban mình |
| UC-28 | View Team Skill Gap Matrix | Dept Manager | So từng thành viên với yêu cầu vị trí |
| UC-29 | Manage Practical Task Templates | Dept Manager | Template task tái sử dụng, gắn năng lực |
| UC-30 | Assign Practical Task to Employee | Dept Manager | Giao task từ template/ad hoc, hạn + người duyệt |
| UC-31 | Review Submission and Confirm Evidence | Dept Manager | Chấm theo rubric, quyết định có là bằng chứng |
| UC-32 | View Team Evidence Portfolio | Dept Manager | Bằng chứng tích lũy của đội |
| UC-33 | View Trainer Dashboard | Trainer | Enrolment/completion/pass rate khóa của mình |
| UC-34 | Manage Course and Curriculum | Trainer | Xây khóa học, gắn năng lực, prerequisite |
| UC-35 | Manage Question Bank | Trainer | Câu hỏi theo topic/competency/difficulty |
| UC-36 | Set Up an Assessment | Trainer | Lắp quiz từ bank, publish (AI draft phải duyệt) |
| UC-37 | Review Learner Assessment Results | Trainer | Lịch sử attempt + câu hay sai |
| UC-38 | View My Learning Dashboard | Employee | Readiness, khóa đang học, task chờ |
| UC-39 | View My Competency Profile and Skill Gap | Employee | So mức đã xác nhận với yêu cầu vị trí |
| UC-40 | View and Enrol in My Courses | Employee | Khóa được giao, tiến độ, tự đăng ký (nếu cho phép) |
| UC-41 | Study a Course | Employee | Học lesson/material, resume đúng chỗ |
| UC-42 | Take an Assessment | Employee | Làm quiz trong giới hạn thời gian, nhận đạt/trượt |
| UC-43 | Submit Practical Task Evidence | Employee | Nộp file/link, nộp lại khi cần sửa |
| UC-44 | View and Download My Certificates | Employee | Xem/tải PDF chứng chỉ QR |
| UC-45 | Verify a Certificate | Public Visitor | Nhập mã/QR → holder, competency/course, ngày cấp, trạng thái |

> **Ghi chú đánh số:** Report 3 đánh UC không liên tục theo thứ tự liệt kê (vd UC-22, 23 thuộc mục §3.4 nhưng mô tả dashboard thuộc §3.10). File này giữ nguyên **mã UC theo Report 3** (UC-01..46) và dùng §6.1 làm nguồn gộp package chuẩn; danh sách trên đã sắp lại theo thứ tự nghiệp vụ để dễ đọc.

### 6.3 Bốn mươi bốn màn hình — 7 khu vực

| Khu vực | Số màn hình | Màn hình |
|---------|-------------|----------|
| Common & Auth | 6 | Login, Forgot/Reset Password, Profile & Security Settings, Notification Center, 403 Access Denied, 404 Not Found |
| Administration | 4 | User Account Management, RBAC Permission Matrix, System Settings & Level Mapping, Audit Logs |
| Job Architecture | 5 | Job Families Catalogue, Job Positions Management, Position Requirement Editor, Competency Framework Library, Competency Detail & Indicators |
| Organization | 2 | Departments Management, Employee Master Roster |
| HR | 5 | Capability Executive Dashboard, Course Assignment & Tracking, Capability Analytics & Gap Heatmap, Employee Capability History, Certificate Registry |
| Manager | 6 | Department Capability Dashboard, Team Skill Gap Matrix, Practical Task Assignment, Submission Review & Evidence Approval, Team Evidence Portfolio, Practical Task Template Library |
| Trainer | 5 | Trainer Dashboard, Course & Lesson Builder, Question Bank Management, Assessment Setup, Learner Results & Grading Review |
| Employee | 7 | My Learning Dashboard, My Competency Profile & Gap, My Courses & Learning Path, Course Player, Assessment Interface, My Tasks & Evidence Submission, My Certificates |
| Public | 3 | Certificate Verification, Invalid/Expired/Revoked State, Rate Limit Notice |

> Chi tiết từng màn hình, mô tả và phân quyền: file `10_Dac_Ta_UI_UX.md` và `09_Ma_Tran_Phan_Quyen_RBAC.md`.

---

## 7. Đặc tả chức năng theo nhóm

### 7.1 Authentication & Authorization (§3.2)

**7.1.1 Sign In** (UC-01)
- Dữ liệu: email + password; không lưu giữa các lần truy cập.
- Validation: bắt buộc, email đúng định dạng; client kiểm tra trước, server là nguồn quyết định.
- Thành công: cấp access token + refresh token, ghi nhận đăng nhập, mở dashboard theo role.
- Sai credentials: chỉ báo "email hoặc mật khẩu không đúng", không tiết lộ cái nào sai.
- 5 lần sai liên tiếp → khóa 15 phút; đăng nhập đúng reset bộ đếm.
- Tài khoản khóa/inactive: từ chối kể cả đúng mật khẩu.
- Liên quan: BR-12.

**7.1.2 Recover Forgotten Password** (UC-03)
- Hai trạng thái: yêu cầu link reset / đặt mật khẩu mới.
- Link dùng một lần, hết hạn theo cấu hình.
- Trạng thái yêu cầu **luôn báo thành công** (không tiết lộ email nào tồn tại).
- Đặt mật khẩu mới → kết thúc mọi session hiện có.
- Link hết hạn/đã dùng → từ chối, có nút xin link mới.

**7.1.3 Manage My Profile and Sessions** (UC-04, 05, 06)
- Hiển thị: tên, email, phòng ban, vị trí. Chỉ tên hiển thị sửa được; còn lại HR duy trì (read-only).
- Đổi mật khẩu cần mật khẩu hiện tại; giữ thiết bị hiện tại, kết thúc session khác.
- Danh sách session: thiết bị, địa chỉ, hoạt động cuối; thu hồi được mọi session trừ session hiện tại.

### 7.2 Organization & Employee (§3.3)

**7.2.1 Manage Departments** (UC-17)
- Dữ liệu: code, name, parent, description, status, manager.
- Code duy nhất; không đặt phòng ban dưới chính nó/con của nó.
- Xóa phòng ban còn nhân viên → từ chối, gợi ý archive.
- Đổi manager → đóng assignment cũ bằng end-date (giữ lịch sử).
- Liên quan: BR-11, BR-12.

**7.2.2 Manage Employee Profiles** (UC-18)
- Dữ liệu: code, họ tên, email, phòng ban, vị trí, quản lý trực tiếp, ngày vào, status.
- Code + email duy nhất; phòng ban, vị trí, quản lý bắt buộc.
- Nhân viên chưa gán vị trí (hoặc vị trí chưa có requirement set active) → hiển thị "Chưa có yêu cầu" với ghi chú rằng gap/readiness chưa tính được.
- Chống vòng lặp quản lý (tự làm manager của mình, trực tiếp/gián tiếp).
- Liên quan: BR-09.

### 7.3 Competency Framework & Position Requirements (§3.4)

**7.3.1 Manage Job Families** (UC-14)
- 5 job family: Leadership, HR/Admin, Finance, Sales & Marketing, Operations.
- Code duy nhất, name không rỗng.
- Archive family còn position active → từ chối kèm danh sách phải di chuyển.

**7.3.2 Manage Job Positions** (UC-15)
- 7 vị trí tham chiếu; mỗi vị trí gắn job family + external reference (ESCO/SFIA — chỉ để tham khảo, không thay thế thang nội bộ).
- Job family bắt buộc; code duy nhất.

**7.3.3 Maintain Position Requirement Set** (UC-16) — màn hình cốt lõi
- Dữ liệu theo phiên bản: position, version, status, effective date, review date. Mỗi dòng: competency, required level, weight, mandatory?, cần evidence thực hành?
- Validation *(đổi 30/09/2026 theo Thông tư 02/2025, D-B7 — thay D-B4 "đủ 24" của ngày 29/09)*: mỗi vị trí **chọn 9–24 năng lực của Khung năng lực số (Thông tư 02/2025/TT-BGDĐT) phù hợp công việc, mỗi năng lực một mức yêu cầu riêng**. Mọi dòng phải là năng lực có mapping tới khung `TT02_2025` đang active (nếu không: 400 `COMPETENCY_NOT_IN_FRAMEWORK`); dưới 9 năng lực → 400 `REQUIREMENT_COUNT_OUT_OF_RANGE` (MSG07); thiếu năng lực lõi 4.1 hoặc 4.2 → 400 `CORE_COMPETENCY_MISSING` kèm mã thiếu (MSG07b); tổng trọng số = 100%. Màn hình luôn liệt kê đủ 24 năng lực theo 6 miền; mỗi dòng chọn mức Basic / Intermediate / Advanced hoặc **Not required**; có thể đặt mức cho cả miền; chỉ lưu các dòng được chọn. Thay quy tắc "9–14 competency" cũ.
- Draft: sửa tự do, vô hình với gap cho đến khi activate.
- Activate: draft → active, version cũ → archived trong cùng bước; DB chỉ cho 1 active version mỗi vị trí.
- Archive không đụng kết quả gap đã tính (mỗi kết quả ghi version đã dùng).
- Liên quan: BR-01, 02, 03.

**7.3.4 Manage the Competency Library** (UC-19, 20)
- ~40 competency, 4 loại: **core digital, professional, internal, behavioural**.
- Quy tắc đặt tên: competency gọi tên **năng lực**, không gọi tên công cụ (vd "Secure software development", không phải "React").
- Name duy nhất trong category.
- Archive competency đang dùng bởi active requirement set → từ chối.

**7.3.5 Define Competency Level Criteria** (UC-21)
- Mỗi mức ghi: behaviour indicator, cách đánh giá, bằng chứng xác nhận.
- 3 mức Basic/Intermediate/Advanced; mức nào chưa viết hiển thị rõ.
- Indicator hiện làm tham chiếu ở màn hình duyệt bằng chứng.

### 7.4 Competency-Linked Learning (§3.5)

**7.4.1 Build a Course and Curriculum** (UC-34)
- Dữ liệu: code, title, description, difficulty, completion rule, thời hạn chứng chỉ, status. Material: title, type (file/link/text), order, required?
- Bắt buộc ≥1 competency mapping trước khi publish.
- Prerequisite: 0..n khóa; file lưu ngoài DB (chỉ giữ reference).
- Publish thiếu competency mapping → từ chối kèm giải thích.

**7.4.2 Assign a Course to Employees** (UC-24)
- Dữ liệu: course, danh sách nhân viên, due date, lý do (manual / skill gap / department-wide / position-wide).
- Validation: ≥1 nhân viên, due date tương lai.
- Mỗi người → enrollment "Not Started" + notification.
- Đã enroll → hiển thị & bỏ qua.
- Thiếu prerequisite → cảnh báo (không chặn).

**7.4.3 View My Courses and Learning Path** (UC-40)
- Hiển thị: title, competency đích, progress, status, due date, có cấp chứng chỉ?
- Thứ tự: In Progress → Not Started → Completed; overdue đánh dấu rõ.
- Chưa có gì → empty state có giải thích.

**7.4.4 Study a Course** (UC-41)
- Layout: danh sách material trái + nội dung phải; quiz cuối là item cuối sau khi đủ material.
- Progress chỉ tính material bắt buộc.
- Resume ở material chưa xong đầu tiên.
- Material lỗi load → trạng thái lỗi + retry / download link.
- Liên quan: BR-07.

### 7.5 Assessment & Question Bank (§3.6)

**7.5.1 Manage the Question Bank** (UC-35)
- Dữ liệu: type (MC/True-False), câu hỏi, options + đáp án đúng, giải thích, competency, difficulty, status.
- MC cần ≥2 option, đúng 1 đáp án đúng.
- Câu AI-drafted: gắn cờ, chỉ vào assessment sau khi trainer duyệt; cờ giữ nguyên sau duyệt (minh bạch nguồn gốc).

**7.5.2 Set Up an Assessment** (UC-36)
- Dữ liệu: title, final?, pass score, time limit, max attempts, danh sách câu hỏi + điểm + thứ tự.
- Validation: ≥1 câu trước publish; pass score trong [0, tổng điểm].
- Không đặt max attempts = không giới hạn.
- Sửa assessment đã có attempt → từ chối đổi câu hỏi, gợi ý tạo version mới.
- Liên quan: BR-06.

**7.5.3 Take an Assessment** (UC-42)
- Một câu mỗi lần, progress bar, đếm ngược, bước review câu chưa trả lời.
- Kiểm tra attempt limit **trước khi bắt đầu**.
- Deadline tính trên server lúc bắt đầu (chống reload/đổi thiết bị).
- Hết giờ → nộp tự động, câu chưa trả lời = 0.
- Mất kết nối → giữ đáp án, resume đúng attempt.
- Đạt quiz cuối của khóa hoàn thành → cấp chứng chỉ (§7.6.1).

**7.5.4 Review Learner Results** (UC-37)
- Lịch sử attempt + thống kê câu hay sai.
- Trainer chỉ xem khóa của mình; phân tích toàn công ty thuộc HR.

### 7.6 Skill Gap & Course Recommendation (§3.7)

**7.6.1 Calculate Skill Gap** (NF-01 — on-demand + tự động theo sự kiện; job hằng đêm: xem §13)
- Input: active requirement set của vị trí hiện tại (hoặc một active set khác được chọn để so sánh) + hồ sơ năng lực đã xác nhận (`employee_competency_profiles`).
- Tính cho từng năng lực yêu cầu:
  - `gap = max(0, required − confirmed)`; chưa có mức xác nhận → `confirmed = 0` (full gap, không coi là lỗi), lưu `current_level = NULL`.
  - `priority = gap × weight_percent × (mandatory ? k : 1)`, k mặc định 1.5 (cấu hình `system_settings`), làm tròn 2 chữ số (AwayFromZero).
  - Mức nghiêm trọng: đạt → không xếp mức; `gap ≥ 2` hoặc năng lực bắt buộc → **High**; `gap = 1` và trọng số ≥ 20% → **Medium**; còn lại **Low**.
  - Mức đáp ứng chuẩn vị trí: `coverage = Σ(weight × min(current, required)/required) / Σ weight × 100%`.
- Nhân viên không ACTIVE / chưa có vị trí / vị trí chưa có active set → không tính, trả lý do (`EMPLOYEE_NOT_ACTIVE`, `NO_JOB_POSITION`, `NO_ACTIVE_REQUIREMENT_SET`); tính hàng loạt thì liệt kê người bị bỏ qua, không làm fail cả đợt.
- Output: 1 snapshot (`skill_gap_runs`) + 1 dòng mỗi năng lực (`skill_gap_items`), ghi version công thức (`SG-1.0`), tham số đã dùng, thời điểm và nguồn (`USER_REQUEST` / `SYSTEM`); **không ghi đè** snapshot cũ.
- Tính hàng loạt tối đa 500 nhân viên mỗi lần (lọc theo phòng ban/vị trí).
- **Tự tính lại** (nguồn `SYSTEM`) khi: một cấp độ năng lực được xác nhận, kích hoạt bộ tiêu chuẩn mới cho vị trí, nhân viên đổi vị trí. Chạy cùng transaction với thay đổi gốc; người được tính lại nhận thông báo in-app + realtime.
- Ví dụ kiểm chứng: vị trí Data Analyst (5 năng lực) → gap 3, priority 90/75/15, coverage 47.5%.
- Liên quan: BR-01, 08, 09.

**7.6.2 View My Competency Profile and Gap** (UC-39)
- Thẻ KPI: số năng lực yêu cầu, đã đạt, còn thiếu (theo mức High/Medium/Low), mức đáp ứng chuẩn vị trí.
- Biểu đồ radar mức yêu cầu vs mức đã xác nhận (dưới 3 năng lực → biểu đồ cột).
- Bảng: năng lực, bắt buộc?, required level, current level (hoặc "Not confirmed"), số bậc thiếu, trọng số, priority, mức nghiêm trọng; sắp theo priority giảm dần.
- Hiển thị trên thang 3 mức (Basic/Intermediate/Advanced).
- Tab "Recommended courses": khóa học xếp theo độ lấp gap, kèm lý do (§7.6.4).
- Chưa có snapshot → ghi chú rõ ràng (HR/quản lý chạy phân tích; tự làm mới khi năng lực được xác nhận).
- Nhân viên chỉ xem được snapshot của chính mình (server-enforced); không tự bấm tính lại.

**7.6.3 View Team Skill Gap** (UC-28)
- Danh sách snapshot mới nhất của từng nhân viên trong phạm vi: HR toàn tổ chức; Dept Manager chỉ phòng ban mình (server-enforced, ngoài phạm vi → 404).
- Lọc phòng ban (ẩn với Dept Manager), vị trí, tìm theo tên/mã; sắp theo số năng lực còn thiếu.
- Mở một nhân viên → panel chi tiết (như §7.6.2) + khóa học gợi ý + "Recalculate"; HR có thêm "Confirm level" (§7.6.5).
- "Recalculate all" tính lại cả phạm vi đang lọc; hiện danh sách người bị bỏ qua kèm lý do.
- Lưới người × competency tô màu (heatmap) **chưa hiện thực** — xem §13.
- Liên quan: BR-12.

**7.6.4 Recommend Courses** (UC-39, UC-28 — non-screen API, tính trực tiếp)
- Dựa trên snapshot mới nhất; ứng viên: khóa **PUBLISHED**, **version PUBLISHED mới nhất** của mỗi mã khóa, dạy năng lực đang thiếu với cấp đích > cấp hiện tại; loại khóa nhân viên đã **COMPLETED** (khóa đang học vẫn hiện, kèm trạng thái).
- Điểm 0–100 = 70 × độ lấp tổng priority + 20 × tỉ lệ năng lực bắt buộc được lấp + 10 × phù hợp trình độ đầu vào (trọng số cấu hình `scoring_configs` RECOMMENDATION_WEIGHTS, tổng 100; cấu hình hỏng → mặc định).
- Mỗi gợi ý kèm điểm từng thành phần, lý do theo từng năng lực (từ → đến, yêu cầu, bắt buộc?) và cảnh báo khi trình độ đầu vào cao hơn mức hiện tại.
- Danh sách rỗng luôn có lý do: chưa có snapshot / không còn gap / không khóa nào phù hợp / tài khoản không gắn nhân viên.
- Ví dụ kiểm chứng: DA-ADVANCED 55.00 > SEC-BASIC 49.17 > DA-EXCEL-PBI 39.25; khóa DRAFT bị loại.

**7.6.5 Confirm Competency Level Manually** (HR override — BR-05)
- HR xác nhận cấp độ cho một năng lực của nhân viên từ căn cứ ngoài bài thực hành (dự án, chứng chỉ ngoài…): chọn năng lực, cấp độ 1–3, **ghi chú căn cứ bắt buộc** (≤ 2000 ký tự).
- Tạo bằng chứng `MANUAL_OVERRIDE` đã xác nhận; bằng chứng xác nhận cũ chuyển **superseded** (giữ lịch sử); cập nhật hồ sơ năng lực; ghi audit log; skill gap tự tính lại (§7.6.1).
- Không cho tự xác nhận năng lực của chính mình (nguyên tắc 4 mắt); nhân viên phải ACTIVE; năng lực phải ACTIVE và thuộc tổ chức.
- Hai người sửa cùng lúc → người sau nhận thông báo xung đột (409), không ghi đè âm thầm.

**7.6.4 View Analytics and Capability History** (UC-22, 23, 25)
- Heatmap: competency × job family, % đạt yêu cầu.
- Filter: job family, department, competency type.
- History: readiness/risk theo thời gian + sự kiện làm thay đổi (cert, evidence, trễ hạn).
- Mỗi biểu đồ ghi thời điểm tính.

### 7.7 Digital Certificate & Public Verification (§3.8)

**7.7.1 Issue a Certificate** (non-screen)
- Điều kiện: khóa hoàn thành + quiz cuối đạt. Task evidence riêng lẻ không tự cấp.
- Sinh: mã duy nhất, link xác minh, QR, ngày cấp, ngày hết hạn (nếu khóa cấu hình).
- Chép holder name/course/competency tại thời điểm cấp (đổi tên sau không ảnh hưởng chứng chỉ đã cấp).
- PDF ghi vào storage; fail PDF không hủy chứng chỉ (sinh lại khi cần).
- Liên quan: BR-06.

**7.7.2 View My Certificates** (UC-44)
- Mỗi cert: course, competency, ngày cấp, hết hạn, status valid/expired/revoked.
- Download PDF, copy link, hiện QR toàn màn hình.
- Expired/revoked vẫn hiện rõ status.
- Download chỉ holder + HR.

**7.7.3 Manage the Certificate Registry** (UC-26)
- Filter: status, sắp hết hạn (30 ngày), course, department.
- Thu hồi: chỉ HR + Admin, cần lý do + xác nhận.
- Revoked → public check trả revoked ngay; ghi audit.
- Thu hồi không undo được từ màn hình này.

**7.7.4 Verify a Certificate Publicly** (UC-45)
- Input: mã (gõ tay hoặc từ QR).
- Trả về **chỉ**: holder name, competency/course, ngày cấp, status. Không thông tin nội bộ.
- Unknown code → thông báo không phơi bày mã nào tồn tại.
- Expired/revoked → nêu status, không nêu lý do thu hồi.
- Rate limit: 20 yêu cầu/phút/requester.
- Log mọi lần check với địa chỉ **đã hash**.
- Liên quan: BR-10.

### 7.8 Practical Task & Competency Evidence (§3.9)

**7.8.1 Manage Practical Task Templates** (UC-29)
- Dữ liệu: title, description, expected output, marking criteria, competency đích + mức đích, status.
- Một template gắn nhiều competency (công việc thật hiếm khi chỉ dùng 1 kỹ năng).
- Validation: ≥1 competency đích.
- AI-drafted template = draft, phải duyệt trước khi dùng.

**7.8.2 Assign a Practical Task** (UC-30)
- Dữ liệu: task (template/ad hoc), nhân viên, due date, reviewer, khóa gợi ý (tùy chọn).
- Reviewer mặc định = manager giao, có thể đổi.
- Danh sách nhân viên chỉ trong phòng ban manager.
- Giao ngoài phòng ban → server từ chối.
- Liên quan: BR-12.

**7.8.3 Submit Task Evidence** (UC-43)
- Nộp: note + file +/hoặc link (PR/repo cho engineering).
- Validation: có file hoặc link; note riêng không là bằng chứng.
- Nộp lại → giữ version cũ (superseded).
- Nộp trễ → cho phép, đánh dấu late, đưa vào risk.

**7.8.4 Review a Submission and Confirm Evidence** (UC-31) — điểm quyết định
- Hiển thị: brief + output kỳ vọng, bài nộp, competency đích + level criteria, version trước.
- Chấm: score, verdict (passed / needs revision / failed), có là evidence?, level xác nhận, feedback.
- Confirmed → tạo **1 evidence cho mỗi competency** task nhắm tới; profile nâng level.
- Needs revision → trả về, không tạo evidence.
- Không tự hạ level; hạ cần HR override + audit.
- Liên quan: BR-04, 05, 12.

**7.8.5 View Team Evidence Portfolio** (UC-32)
- Mỗi record: employee, competency, level, nguồn (bài thực hành / ghi nhận thủ công của HR / dữ liệu chuyển đổi ban đầu), ai xác nhận, khi nào.
- **Bài thi trắc nghiệm không phải nguồn xác nhận cấp độ năng lực** (quyết định D-S3-08, 28/09/2026): quiz đo hiểu biết và là điều kiện hoàn thành khóa/cấp chứng chỉ (BR-06, 07); cấp độ năng lực chỉ được xác nhận qua bài thực hành được chấm hoặc ghi nhận thủ công có căn cứ (khớp `competency_evidences.source_type` trong schema v2.3).
- Evidence cũ bị thay thế → giữ, đánh dấu superseded.
- Liên quan: BR-11.

### 7.9 Dashboards, Analytics & Notifications (§3.10)

**7.9.1 Calculate Risk and Readiness Scores** (non-screen)
- Training risk: inactivity, tỷ lệ điểm thấp, áp lực deadline, lần trượt, chậm tiến độ.
- Workforce readiness: competency coverage, certificates, learning progress, task performance.
- Cả hai là weighted sum; trọng số ở settings, mỗi kết quả ghi version trọng số.
- Nhân viên không có yêu cầu → bỏ qua.
- Risk chuyển high → alert manager.
- Liên quan: BR-09.

**7.9.2 View Role Dashboards** (UC-22, 27, 33, 38)
- HR: readiness toàn công ty, số người risk cao, gap sâu nhất theo family, cert sắp hết hạn.
- Dept Manager: tương tự cho phòng ban mình + submission chờ duyệt.
- Trainer: enrolment/completion/pass rate khóa của mình.
- Employee: readiness bản thân, khóa đang học, task tới hạn, feedback gần đây.
- Mọi số gắn thời điểm tính; click xuyên vào record gốc.
- Trước run đầu: card giải thích thay vì hiện 0.

**7.9.3 Receive and Read Notifications** (UC-07)
- Nguồn: giao khóa/task/assessment, feedback, cấp chứng chỉ, sắp hết hạn, risk high (tới manager).
- Hiển thị type, message, record, thời gian; click mở record + đánh dấu đã đọc.
- Chỉ thấy notification gửi cho mình.

### 7.10 Administration & Master Data (§3.11)

**7.10.1 Manage User Accounts** (UC-08)
- Tài khoản có thể tồn tại độc lập với hồ sơ nhân viên.
- Tạo tài khoản → gửi activation link (không gửi mật khẩu).
- Khóa tài khoản hiệu lực ngay, kết thúc mọi session.
- Admin không tự gỡ role admin của chính mình.

**7.10.2 Configure the Permission Matrix** (UC-09)
- Lưới role × module, mỗi ô liệt kê action.
- Data scope hiển thị cạnh permission nhưng không sửa theo role (là cấu trúc).
- Đổi hiệu lực ở request kế tiếp + ghi audit.
- Không gỡ quyền admin khỏi role admin.

**7.10.3 Configure Scoring and Level Mapping** (UC-10, 11, 13)
- 4 nhóm chỉnh: risk weights, readiness weights, recommendation weights, 3 mức hiển thị.
- Lưu → version mới + archive cũ; 1 version active mỗi group.
- Weights trong nhóm phải cộng đủ 100%.
- Áp dụng từ run kế tiếp; level mapping đổi hiển thị tức thời không đụng dữ liệu gốc.
- Liên quan: BR-08.

**7.10.4 Search the Audit Log** (UC-12)
- Luôn ghi: đổi job architecture, activate/archive requirement set, đổi scoring, cấp/thu hồi chứng chỉ, xác nhận evidence, đổi role/permission.
- Mật khẩu không bao giờ xuất hiện.
- Log chỉ được thêm, không sửa/xóa.

---

## 8. Non-screen functions (tổng hợp)

| # | System function | Mô tả |
|---|-----------------|-------|
| NF-01 | Calculate Skill Gap Snapshot | So active requirement set với confirmed profile, lưu snapshot/competency (không ghi đè). Kích hoạt: on-demand (HR/Dept Manager, đơn lẻ hoặc hàng loạt ≤ 500) và tự động khi xác nhận cấp độ / kích hoạt bộ tiêu chuẩn / đổi vị trí. Chi tiết §7.6.1 |
| NF-02 | Calculate Training Risk Score | Tổ hợp inactivity, low score, deadline, failed attempts, delay theo trọng số |
| NF-03 | Calculate Workforce Readiness Score | Tổ hợp coverage, certificates, learning progress, task performance |
| NF-04 | Expire Certificates | Đặt expired khi hết hạn |
| NF-05 | Send Certificate Expiry Reminder | Nhắc holder 30 ngày trước hết hạn |
| NF-06 | Send Training Risk Alert | Alert manager khi risk chuyển high |

---

## 9. Business Rules (BR)

| ID | Quy tắc |
|----|---------|
| BR-01 | Skill gap luôn đo theo **active requirement set** của vị trí hiện tại; không có active set → bỏ qua và báo cáo, không đoán |
| BR-02 | Requirement set chỉ chuyển draft → active → archived; không nhảy draft → archived |
| BR-03 | Activate set mới tự archive set cũ cùng vị trí trong cùng transaction |
| BR-04 | Xác nhận task tạo **một evidence cho mỗi competency** task nhắm tới |
| BR-05 | Level đã xác nhận chỉ đổi qua evidence level-confirming; không tự hạ nếu không có override ghi audit |
| BR-06 | Chứng chỉ cần **đạt quiz cuối**; task evidence riêng lẻ không tự cấp |
| BR-07 | Hoàn thành khóa = đủ material bắt buộc **và** đạt quiz cuối |
| BR-08 | Cấu hình scoring: một version active mỗi key |
| BR-09 | Nhân viên không có vị trí (hoặc vị trí chưa có active requirement set) → báo "Chưa có yêu cầu", loại khỏi gap/risk/readiness, không làm fail đợt tính |
| BR-10 | Xác minh công khai không cần tài khoản, chỉ trả holder + competency/course + ngày cấp + status |
| BR-11 | Bản ghi nghiệp vụ "nghỉ hưu" bằng đổi status, không xóa cứng |
| BR-12 | Dept Manager chỉ thao tác nhân viên trong phòng ban mình đang quản lý (theo lịch sử assignment) |

---

## 10. Common Requirements (CR)

| ID | Yêu cầu chung |
|----|---------------|
| CR-01 | Mọi list có search, sort, server-side pagination (mặc định 20 dòng/trang) |
| CR-02 | Mọi form validate client + server; server là thẩm quyền cuối |
| CR-03 | Field bắt buộc đánh dấu trước khi submit |
| CR-04 | Xóa/thu hồi/archive hỏi xác nhận và nêu tên record |
| CR-05 | Ngày hiển thị dd/mm/yyyy, lưu UTC |
| CR-06 | Màn hình không được phép → trang access denied; API phía sau cũng chặn |
| CR-07 | Thao tác dài hiện loading; empty state có giải thích + hành động gợi ý |
| CR-08 | Giao diện dùng tiếng Anh (phạm vi demo) |

---

## 11. Application Messages (MSG)

| Mã | Loại | Ngữ cảnh | Nội dung |
|----|------|----------|----------|
| MSG01 | Error | Sai credentials | The email or password is incorrect. |
| MSG02 | Error | Khóa sau 5 lần sai | This account is temporarily locked after five failed attempts. Try again in 15 minutes. |
| MSG03 | Error | Session hết hạn | Your session has ended. Please sign in again. |
| MSG04 | Error | Ngoài quyền | You do not have permission to view this page. |
| MSG05 | Error | Thiếu field bắt buộc | This field is required. |
| MSG06 | Error | Trùng code/email | This value is already in use. Please enter a different one. |
| MSG07 | Error | Bộ tiêu chuẩn có dưới 9 (hoặc trên 24) năng lực của khung Thông tư 02/2025 | A requirement set needs between 9 and 24 competencies of the national digital competence framework (Circular 02/2025) before it can be activated (current: {count}). |
| MSG07b | Error | Bộ tiêu chuẩn thiếu năng lực lõi 4.1 / 4.2 | A requirement set must include the core safety competencies 4.1 (protecting devices) and 4.2 (protecting personal data and privacy). Missing: {codes}. |
| MSG08 | Error | Assessment không câu hỏi | Add at least one question before publishing this assessment. |
| MSG09 | Error | Task thiếu file/link | Attach a file or provide a link before submitting. |
| MSG10 | Error | Vượt attempt limit | You have used all attempts allowed for this assessment. |
| MSG11 | Error | File không hợp lệ | This file type or size is not accepted. Allowed types are listed beside the upload button. |
| MSG12 | Error | Mã xác minh không tồn tại | No certificate matches this code. Please check the code and try again. |
| MSG13 | Error | Vượt rate limit | Too many verification requests. Please wait a minute and try again. |
| MSG14 | Warning | Thiếu prerequisite | This employee has not completed the prerequisite course. You may continue, but the recommendation was based on completing it first. |
| MSG15 | Warning | Chưa có yêu cầu vị trí | This employee has no active position requirement, so gap and readiness figures cannot be calculated yet. |
| MSG16 | Warning | Chứng chỉ sắp hết hạn | This certificate expires in 30 days. |
| MSG17 | Warning | Risk chuyển high | Training risk for this employee is now high. |
| MSG18 | Information | Đã lưu | Your changes have been saved. |
| MSG19 | Information | Đã giao khóa | The course has been assigned and the employees have been notified. |
| MSG20 | Information | Đã cấp chứng chỉ | The certificate has been issued and is now available to the employee. |
| MSG21 | Information | Đã xác nhận evidence | The evidence has been confirmed and the competency profile has been updated. |
| MSG22 | Information | Danh sách rỗng | There is nothing to show here yet. |
| MSG23 | Confirm | Archive | Archive this record? It will no longer appear in active lists. |
| MSG24 | Confirm | Thu hồi chứng chỉ | Revoke this certificate? Anyone verifying it will see that it is no longer valid. A reason is required. |
| MSG25 | Confirm | Activate version mới | Activate this version? The current active version will be archived. |
| MSG26 | Confirm | Nộp bài | Submit your answers? You cannot change them afterwards. |
| MSG27 | Error | Tính gap: chưa có vị trí | The employee has no job position assigned. |
| MSG28 | Error | Tính gap: vị trí chưa có tiêu chuẩn | The employee's position has no active requirement set yet. |
| MSG29 | Error | Tính gap: nhân viên không active | Skill gap can only be calculated for active employees. |
| MSG30 | Error | Tính hàng loạt quá lớn | Too many employees in one batch — filter by department or position. |
| MSG31 | Error | Tự xác nhận năng lực | You cannot confirm your own competency level. |
| MSG32 | Error | Xung đột ghi đồng thời | The record was changed by someone else. Reload it and try again. |
| MSG33 | Information | Đã xác nhận cấp độ | {Level} confirmed — skill gap recalculated. |
| MSG34 | Information | Thông báo skill gap (in-app + realtime) | Your skill gap analysis was updated: {n} competency gap(s) remaining. |

---

## 12. Ma trận vết (Traceability)

| Feature (Report 1) | Mục SRS | UC | BR | CR |
|--------------------|---------|-----|-----|-----|
| FE-01 Auth & RBAC | §3.2, §3.11 | UC-01..13 | BR-12 | CR-02, 04, 06 |
| FE-02 Org & Employee | §3.3 | UC-17, 18 | BR-09, 11, 12 | CR-01..05 |
| FE-03 Competency & Requirement | §3.4 | UC-14..16, 19..21 | BR-01, 02, 03, 11 | CR-04 |
| FE-04 Learning | §3.5 | UC-24, 34, 40, 41 | BR-07 | CR-07 |
| FE-05 Assessment & Quiz | §3.6 | UC-35..37, 42 | BR-06, 07 | CR-02, 05 |
| FE-06 Skill Gap & Recommend | §3.7 | UC-22, 23, 25, 28, 39 | BR-01, 05, 08, 09, 12 | CR-01, 06, 07 |
| FE-07 Certificate & QR | §3.8 | UC-26, 44, 45 | BR-06, 10, 11 | CR-04, 06 |
| FE-08 Task & Evidence | §3.9 | UC-29..32, 43 | BR-04, 05, 12 | CR-02, 04 |
| FE-09 Dashboard & Notify | §3.10 | UC-07, 22, 27, 33, 38 | BR-09 | CR-07 |

---

## 13. Trạng thái hiện thực sau Sprint 3 & điểm mở

**Đã hiện thực (Sprint 3, 29/09/2026):**

| Chức năng | Mục SRS | API / màn hình | Kiểm chứng |
|-----------|---------|----------------|------------|
| Tính skill gap (NF-01) đơn lẻ, hàng loạt, lịch sử | §7.6.1 | `POST /intelligence/skill-gaps/calculate`, `/calculate-batch`, `GET /intelligence/skill-gaps`, `/{runId}`, `/me/latest` | Test tự động trên PostgreSQL + gọi API thật khớp ví dụ tính tay |
| My Competency Profile & Gap | §7.6.2 (UC-39) | `/enterprise/my-competency-profile` | Test FE + kiểm tra trên trình duyệt |
| Team Skill Gap (danh sách + panel chi tiết) | §7.6.3 (UC-28) | `/enterprise/intelligence/skill-gap` | Test FE + kiểm tra trên trình duyệt |
| Gợi ý khóa học có giải thích | §7.6.4 | `GET /intelligence/recommendations` | Test + p95 36 ms trên dữ liệu seed |
| Ghi nhận cấp độ thủ công (HR) + tự tính lại + thông báo realtime | §7.6.5 | `POST /competency-evidences/manual`, dialog "Confirm level", SignalR `/hubs/notifications` | Test PostgreSQL (rollback, supersede, xung đột) + kịch bản demo trên trình duyệt |
| Activate bộ tiêu chuẩn: tổng trọng số = 100% | §7.3.3 | `POST /position-requirements/{id}/activate` | Test |

**Điểm mở cần quyết định / chưa hiện thực:**

| # | Nội dung | Hiện trạng | Đề xuất |
|---|----------|-----------|---------|
| O-1 | §7.3.3 & MSG07: bộ tiêu chuẩn cần **9–14 năng lực** mới được activate | **Đã đóng 30/09/2026** — thay bằng quy tắc "9–24 năng lực của Thông tư 02/2025, mỗi năng lực một mức, luôn có lõi 4.1 và 4.2" (D-B7), đã hiện thực và có test; seed demo 5 vị trí, mỗi vị trí 20–23 năng lực | Leader / chuyên gia rà từng ô của ma trận (`docs/specs/2026-09-29-tt02-position-competency-matrix.md` §4.1) |
| O-2 | §7.6.1 job tính skill gap **hằng đêm** | Chưa có; thay đổi dữ liệu đã tự tính lại theo sự kiện | Đánh giá lại nhu cầu ở Sprint 5 (cùng NF-02/03 chạy theo lịch) |
| O-3 | §7.6.3 **heatmap** người × năng lực, giao khóa/task từ ô | Chưa hiện thực (đã cắt khỏi Sprint 3) | Sprint 4–5 cùng UC-23 (Workforce Analytics) |
| O-4 | §7.6.2 xem bằng chứng / version tạo nên mức hiện tại | Chưa có màn hình bằng chứng (dữ liệu đã lưu đủ) | Sprint 4 cùng Evidence Portfolio (UC-32) |
| O-5 | Tuyến người học cá nhân `/learn`: skill gap thật | **Đã đóng phần hiển thị 29/09/2026** (D-B5): mọi nhãn learner/public hiển thị 3 mức Cơ bản / Trung cấp / Nâng cao (bậc 1–2 / 3–4 / 5–6); dữ liệu demo vẫn lưu thang 1–6 và được quy đổi khi hiển thị | Skill gap thật cho learner và danh mục nghề theo 5 vị trí Thông tư: Sprint 4 |
| O-6 | Quy chế thi lại (cooldown, hiển thị đáp án) — S3-T024 | Chờ Mentor duyệt SQL v2.4 (D-S3-13) và engine thi của module Assessment | Chuyển phần tích hợp sang Sprint 4 |
| O-7 | Bỏ vị trí của nhân viên không tạo snapshot mới | Snapshot cũ vẫn hiển thị kèm tên vị trí cũ | Chấp nhận (giới hạn đã biết, spec E15) |
| O-8 | **Đánh giá đầu vào** (placement) cho cả nhân viên doanh nghiệp và người học tự do | Chưa hiện thực. Hiện mức năng lực chỉ có khi HR / quản lý xác nhận; nhân viên mới chưa có hồ sơ thì mọi năng lực tính là thiếu toàn bộ | Sprint 4 cùng module Assessment (D-B8): bài đánh giá đầu vào theo năng lực vị trí yêu cầu, kết quả là **mức tạm** tách khỏi mức đã xác nhận. Cần thay đổi SQL (v2.4) → chờ Mentor duyệt. Thiết kế: tài liệu ma trận §10 |
