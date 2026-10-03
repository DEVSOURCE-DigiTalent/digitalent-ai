# 04 — Danh Sách & Đặc Tả Use Case

> Nguồn gốc: Report 3 — *Software Requirement Specification* §2.2. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Danh sách & đặc tả use case |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §2.2 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ, đặc tả đầy đủ 46 UC, căn chỉnh theo 3-level |

---

## 2. Mục đích và phạm vi

Đặc tả toàn bộ **46 use case** ở mức *user-goal* (mỗi UC là một việc actor có thể hoàn thành trong một phiên và nhận diện được là "một nhiệm vụ"). Các bước quá nhỏ (đánh dấu thông báo đã đọc…) được gộp vào UC cha; các tiến trình nền không do con người khởi phát (tính điểm hàng đêm) **không phải use case** — xem 03A §8 (NF-01..06).

**Quy ước mã UC:** giữ nguyên mã UC theo Report 3 (UC-01 … UC-46) để đối chiếu vết, kể cả khi docs_v3 loại bỏ một UC theo chỉ đạo 3-level (xem §6).

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* §2.2
- `03A_SRS_Yeu_Cau_Chuc_Nang.md` — chi tiết chức năng
- `00_INDEX_Tong_Quan_Tai_Lieu.md` — sự kiện chuẩn

---

## 4. Phân nhóm package (8 package)

| Package | UC bao phủ | Actor chính | Actor phụ | Mục SRS |
|---------|-----------|-------------|-----------|---------|
| PKG-01 — Account, Session & Administration | UC-01..06, UC-08..13 | Tất cả actor đã đăng nhập; System Administrator | — | §3.2, §3.11 |
| PKG-02 — Organization & Competency Governance | UC-14..22 | HR / Training Manager | Department Manager (đọc/đề xuất) | §3.3, §3.4 |
| PKG-03 — Competency-Linked Learning | UC-24, 35, 41, 42 | HR, Internal Trainer, Employee | — | §3.5 |
| PKG-04 — Assessment & Question Bank | UC-36, 37, 38, 43 | Internal Trainer, Employee | — | §3.6 |
| PKG-05 — Skill Gap Analysis & Capability Insight | UC-25, 26, 29, 40 | HR, Department Manager, Employee | System Scheduler (nội bộ) | §3.7 |
| PKG-06 — Digital Certificate & Public Verification | UC-27, 45, 46 | HR, Employee, Public Visitor | — | §3.8 |
| PKG-07 — Practical Task & Competency Evidence | UC-30, 31, 32, 33, 44 | Department Manager, Employee | — | §3.9 |
| PKG-08 — Dashboards, Analytics & Notifications | UC-07, 23, 28, 34, 39 | HR, Department Manager, Internal Trainer, Employee | System Scheduler (nội bộ) | §3.10 |

**Luồng liên kết xuyên package (thiết kế end-to-end):** Skill Gap (PKG-05) gợi ý khóa học (PKG-03) → đạt assessment (PKG-04) → tự cấp chứng chỉ (PKG-06) → bằng chứng task được xác nhận (PKG-07) phản hồi lại Skill Gap để tính lại gap.

---

## 5. Danh sách 46 use case (tổng hợp)

| ID | Use case | Actor chính | Package |
|----|----------|-------------|---------|
| UC-01 | Log In | Tất cả actor đã đăng nhập | PKG-01 |
| UC-02 | Log Out | Tất cả actor đã đăng nhập | PKG-01 |
| UC-03 | Recover Forgotten Password | Tất cả actor đã đăng nhập | PKG-01 |
| UC-04 | Update My Profile | Tất cả actor đã đăng nhập | PKG-01 |
| UC-05 | Change My Password | Tất cả actor đã đăng nhập | PKG-01 |
| UC-06 | Manage My Active Sessions | Tất cả actor đã đăng nhập | PKG-01 |
| UC-07 | View Notifications | Tất cả actor đã đăng nhập | PKG-08 |
| UC-08 | Manage User Accounts | System Administrator | PKG-01 |
| UC-09 | Configure RBAC Permission Matrix | System Administrator | PKG-01 |
| UC-10 | Configure Competency Level Display Mapping | System Administrator | PKG-01 |
| UC-11 | Configure Scoring Weights | System Administrator | PKG-01 |
| UC-12 | View and Search Audit Logs | System Administrator | PKG-01 |
| UC-13 | Manage System Settings | System Administrator | PKG-01 |
| UC-14 | Manage Job Families | HR / Training Manager | PKG-02 |
| UC-15 | ~~Manage Career Grades~~ (loại bỏ — xem §6) | — | PKG-02 |
| UC-16 | Manage Job Positions | HR / Training Manager | PKG-02 |
| UC-17 | Maintain Position Requirement Set | HR / Training Manager | PKG-02 |
| UC-18 | Manage Departments | HR / Training Manager | PKG-02 |
| UC-19 | Manage Employee Profiles | HR / Training Manager | PKG-02 |
| UC-20 | Manage Competency Categories | HR / Training Manager | PKG-02 |
| UC-21 | Manage Competencies | HR / Training Manager | PKG-02 |
| UC-22 | Define Competency Level Criteria | HR / Training Manager | PKG-02 |
| UC-23 | View Capability Executive Dashboard | HR / Training Manager | PKG-08 |
| UC-24 | Assign Course to Employees | HR / Training Manager | PKG-03 |
| UC-25 | View Workforce Analytics and Gap Heatmap | HR / Training Manager | PKG-05 |
| UC-26 | View Employee Capability History | HR / Training Manager | PKG-05 |
| UC-27 | Manage Certificate Registry | HR / Training Manager | PKG-06 |
| UC-28 | View Department Capability Dashboard | Department Manager | PKG-08 |
| UC-29 | View Team Skill Gap Matrix | Department Manager | PKG-05 |
| UC-30 | Manage Practical Task Templates | Department Manager | PKG-07 |
| UC-31 | Assign Practical Task to Employee | Department Manager | PKG-07 |
| UC-32 | Review Submission and Confirm Evidence | Department Manager | PKG-07 |
| UC-33 | View Team Evidence Portfolio | Department Manager | PKG-07 |
| UC-34 | View Trainer Dashboard | Internal Trainer | PKG-08 |
| UC-35 | Manage Course and Curriculum | Internal Trainer | PKG-03 |
| UC-36 | Manage Question Bank | Internal Trainer | PKG-04 |
| UC-37 | Set Up an Assessment | Internal Trainer | PKG-04 |
| UC-38 | Review Learner Assessment Results | Internal Trainer | PKG-04 |
| UC-39 | View My Learning Dashboard | Employee | PKG-08 |
| UC-40 | View My Competency Profile and Skill Gap | Employee | PKG-05 |
| UC-41 | View and Enrol in My Courses | Employee | PKG-03 |
| UC-42 | Study a Course | Employee | PKG-03 |
| UC-43 | Take an Assessment | Employee | PKG-04 |
| UC-44 | Submit Practical Task Evidence | Employee | PKG-07 |
| UC-45 | View and Download My Certificates | Employee | PKG-06 |
| UC-46 | Verify a Certificate | Public Visitor | PKG-06 |

---

## 6. Đặc tả chi tiết 46 use case

> Template mỗi UC: **Actor, Điều kiện trước, Luồng chính, Luồng thay thế/ngoại lệ, Điều kiện sau thành công, BR/CR liên quan.**

### PKG-01 — Account, Session & Administration Services

**UC-01 — Log In**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Có tài khoản active; chưa đăng nhập |
| Luồng chính | 1. Nhập email + mật khẩu → 2. Hệ thống xác thực → 3. Cấp access token + refresh token, session gắn vai trò → 4. Điều hướng về dashboard theo vai trò |
| Ngoại lệ | Sai thông tin → MSG lỗi chung (không lộ email tồn tại); tài khoản bị khóa → thông báo khóa; vượt ngưỡng thử → khóa tạm (NIST SP 800-63B) |
| Điều kiện sau | Session hoạt động với scope theo vai trò |
| BR/CR | CR-01, CR-02 |

**UC-02 — Log Out**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Đang có session |
| Luồng chính | 1. Chọn Log Out → 2. Hệ thống vô hiệu hóa token → 3. Trả về màn hình Login |
| Điều kiện sau | Token không còn dùng được |
| BR/CR | CR-02 |

**UC-03 — Recover Forgotten Password**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Có email đã đăng ký |
| Luồng chính | 1. Nhập email → 2. Hệ thống gửi link reset (SMTP) → 3. Mở link, đặt mật khẩu mới → 4. Xác nhận |
| Ngoại lệ | Link hết hạn/đã dùng → yêu cầu gửi lại; email không tồn tại → vẫn trả thông báo trung lập |
| Điều kiện sau | Mật khẩu mới có hiệu lực |
| BR/CR | CR-01, CR-02; Interface SMTP (03B §4) |

**UC-04 — Update My Profile**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Mở Profile → 2. Sửa thông tin cơ bản → 3. Lưu |
| Ngoại lệ | Trường bắt buộc thiếu → validation 400 |
| Điều kiện sau | Thông tin cá nhân được cập nhật |
| BR/CR | CR-03 |

**UC-05 — Change My Password**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Nhập mật khẩu hiện tại + mới → 2. Xác nhận mật khẩu hiện tại → 3. Lưu |
| Ngoại lệ | Mật khẩu hiện tại sai → từ chối; không đạt policy → validation |
| Điều kiện sau | Mật khẩu mới có hiệu lực, session cũ có thể bị thu hồi |
| BR/CR | CR-01 |

**UC-06 — Manage My Active Sessions**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Xem danh sách thiết bị đang đăng nhập → 2. Thu hồi session đáng ngờ |
| Điều kiện sau | Session bị thu hồi hết hiệu lực |
| BR/CR | CR-02 |

**UC-07 — View Notifications**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Tất cả actor đã đăng nhập |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Mở Notification Center → 2. Đọc thông báo (giao việc, phản hồi, hết hạn chứng chỉ, cảnh báo rủi ro) → 3. Đánh dấu đã đọc |
| Ngoại lệ | Realtime qua SignalR (`/hubs/notifications`) |
| Điều kiện sau | Trạng thái đọc được cập nhật |
| BR/CR | CR-04 |

**UC-08 — Manage User Accounts**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Tạo tài khoản / khóa / mở khóa → 2. Gán một trong năm vai trò → 3. Lưu |
| Ngoại lệ | Email trùng → lỗi |
| Điều kiện sau | Tài khoản sẵn sàng đăng nhập theo vai trò |
| BR/CR | BR-12; ghi audit log (nhạy cảm) |

**UC-09 — Configure RBAC Permission Matrix**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Xem ma trận vai trò × module × hành động → 2. Điều chỉnh → 3. Lưu |
| Ngoại lệ | Không thể xóa quyền đang dùng làm ràng buộc bắt buộc |
| Điều kiện sau | Ma trận phân quyền mới có hiệu lực |
| BR/CR | BR-12; chi tiết tại file 09 |

**UC-10 — Configure Competency Level Display Mapping**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Cấu hình ba mức năng lực MVP → 2. Lưu |
| Ngoại lệ | — |
| Điều kiện sau | Thang 3 mức (Basic/Intermediate/Advanced) áp dụng toàn hệ thống |
| BR/CR | — (đây là UC duy nhất giữ thang đo năng lực; xem §7) |

**UC-11 — Configure Scoring Weights**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Điều chỉnh trọng số từng yếu tố trong công thức risk/readiness/recommendation → 2. Lưu (versioned, một bản active mỗi key) |
| Ngoại lệ | — |
| Điều kiện sau | Công thức mới áp dụng từ snapshot tiếp theo |
| BR/CR | BR-08; chi tiết công thức tại file 16 |

**UC-12 — View and Search Audit Logs**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Tìm kiếm theo actor/entity/khoảng thời gian → 2. Xem chi tiết hành động nhạy cảm |
| Điều kiện sau | Truy vết được ai/thay đổi gì/khi nào |
| BR/CR | CR-08 (audit) |

**UC-13 — Manage System Settings**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | System Administrator |
| Điều kiện trước | Có quyền SYSTEM_ADMIN |
| Luồng chính | 1. Sửa cấu hình chung (vd thời hạn chứng chỉ mặc định) → 2. Lưu |
| Điều kiện sau | Cấu hình mới có hiệu lực |
| BR/CR | — |

### PKG-02 — Organization & Competency Governance

**UC-14 — Manage Job Families**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Tạo/sửa/archive năm job family → 2. Lưu |
| Điều kiện sau | Danh mục job family cập nhật |
| BR/CR | BR-11 (archive = đổi status) |

**UC-15 — Manage Career Grades — ⚠️ LOẠI BỎ**

> Theo chỉ đạo 16/09/2026, docs_v3 **bỏ trục Career Grade**, chỉ giữ 3 mức năng lực (Basic/Intermediate/Advanced). UC này (duy trì 5 career grade G1–G5) **bị loại bỏ khỏi phạm vi MVP**. Giữ nguyên mã UC-15 để đối chiếu vết với Report 3. Màn hình tương ứng "Career Grades Management" (màn hình 13) cũng được gỡ. Xem `00_INDEX` §3.1.3.

**UC-16 — Manage Job Positions**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Duy trì bảy vị trí mẫu → 2. Gán job family + tham chiếu khung ngoài (DigComp 3.0) |
| Điều kiện sau | Danh mục vị trí cập nhật |
| BR/CR | BR-11 |

**UC-17 — Maintain Position Requirement Set**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR; đã có vị trí + competency |
| Luồng chính | 1. Nháp yêu cầu năng lực cho **một Job Position** (mức Basic/Intermediate/Advanced cho từng năng lực) → 2. Kích hoạt phiên bản → 3. Bản active cũ tự archive |
| Ngoại lệ | Không nhảy draft → archived (BR-02); kích hoạt mới + archive cũ trong một giao dịch (BR-03) |
| Điều kiện sau | Có một bản requirement set active cho vị trí |
| BR/CR | BR-01, BR-02, BR-03 |

> ⚠️ Report 3 gốc định nghĩa requirement set khóa theo "position + career grade". docs_v3 khóa theo **position** (đã bỏ career grade).

**UC-18 — Manage Departments**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Duy trì cây phòng ban → 2. Gán manager phụ trách từng đơn vị |
| Điều kiện sau | Cấu trúc phòng ban cập nhật |
| BR/CR | BR-11, BR-12 |

**UC-19 — Manage Employee Profiles**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Duy trì hồ sơ nhân viên gồm phòng ban, **vị trí** và quản lý trực tiếp → 2. Lưu |
| Ngoại lệ | Nhân viên chưa gán vị trí → loại khỏi gap/risk/readiness (BR-09) |
| Điều kiện sau | Hồ sơ cập nhật |
| BR/CR | BR-09, BR-11, BR-12 |

> ⚠️ Report 3 gốc ghi hồ sơ gồm "department, job position, career grade and direct manager". docs_v3 bỏ trường career grade.

**UC-20 — Manage Competency Categories**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Nhóm competency để duyệt và báo cáo |
| Điều kiện sau | Danh mục nhóm cập nhật |
| BR/CR | BR-11 |

**UC-21 — Manage Competencies**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Duy trì thư viện năng lực, mỗi mục gắn loại: core digital / professional / internal / behavioural |
| Điều kiện sau | Thư viện năng lực cập nhật |
| BR/CR | BR-11; tham chiếu DigComp 3.0 |

**UC-22 — Define Competency Level Criteria**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR; đã có competency |
| Luồng chính | 1. Viết hành vi quan sát được cho từng năng lực ở **ba mức** (Basic/Intermediate/Advanced) |
| Điều kiện sau | Tiêu chí mức đầy đủ cho từng competency |
| BR/CR | — |

### PKG-03 — Competency-Linked Learning

**UC-24 — Assign Course to Employees**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR; đã có course + employee |
| Luồng chính | 1. Gán khóa học cho một/nhiều nhân viên → 2. Có thể xuất phát từ kết quả skill gap |
| Điều kiện sau | Nhân viên nhận assignment |
| BR/CR | BR-07; gửi notification (CR-04) |

**UC-35 — Manage Course and Curriculum**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Internal Trainer |
| Điều kiện trước | Có quyền trainer |
| Luồng chính | 1. Dựng course (bài học + học liệu) → 2. Gắn competency mục tiêu → 3. Đặt prerequisite |
| Điều kiện sau | Course sẵn sàng để gán |
| BR/CR | BR-07, BR-11 |

**UC-41 — View and Enrol in My Courses**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Xem khóa học được gán, theo dõi tiến độ → 2. Tự ghi danh khóa tự chọn (nếu mở) |
| Điều kiện sau | Trạng thái enrollment cập nhật |
| BR/CR | BR-07 |

**UC-42 — Study a Course**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã enroll |
| Luồng chính | 1. Học qua bài + học liệu → 2. Resume tại chỗ dừng phiên trước → 3. Đánh dấu hoàn thành material |
| Điều kiện sau | Tiến độ học được lưu |
| BR/CR | BR-07 (hoàn thành = đủ material bắt buộc + đạt quiz) |

### PKG-04 — Assessment & Question Bank

**UC-36 — Manage Question Bank**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Internal Trainer |
| Điều kiện trước | Có quyền trainer |
| Luồng chính | 1. Duy trì câu hỏi gắn chủ đề, competency, độ khó |
| Điều kiện sau | Ngân hàng câu hỏi cập nhật |
| BR/CR | — |

**UC-37 — Set Up an Assessment**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Internal Trainer |
| Điều kiện trước | Có quyền trainer; có câu hỏi |
| Luồng chính | 1. Ghép quiz từ ngân hàng câu hỏi → 2. Publish |
| Ngoại lệ | Câu hỏi do AI nháp **phải được trainer duyệt** trước khi dùng (Human-controlled AI) |
| Điều kiện sau | Assessment published |
| BR/CR | BR-06; nguyên tắc Human-controlled AI |

**UC-38 — Review Learner Assessment Results**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Internal Trainer |
| Điều kiện trước | Có quyền trainer |
| Luồng chính | 1. Xem lịch sử attempt → 2. Xem câu hay sai |
| Điều kiện sau | Nắm được kết quả học viên |
| BR/CR | — |

**UC-43 — Take an Assessment**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã enroll; assessment published |
| Luồng chính | 1. Làm quiz trong thời hạn → 2. Nhận kết quả pass/fail (chấm server) |
| Ngoại lệ | Hết giờ → nộp tự động |
| Điều kiện sau | Attempt được lưu; đạt → xét cấp chứng chỉ |
| BR/CR | BR-06, BR-07 |

### PKG-05 — Skill Gap Analysis & Capability Insight

**UC-25 — View Workforce Analytics and Gap Heatmap**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Phân tích nơi năng lực mỏng dưới dạng heatmap |
| Điều kiện sau | Có tầm nhìn năng lực toàn lực lượng |
| BR/CR | BR-01, BR-09; dữ liệu từ snapshot NF-01 |

**UC-26 — View Employee Capability History**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Mở một nhân viên → 2. Xem xu hướng readiness/risk theo thời gian |
| Điều kiện sau | Theo dõi được tiến triển |
| BR/CR | BR-01 |

**UC-29 — View Team Skill Gap Matrix**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có quyền manager (chỉ phòng ban mình) |
| Luồng chính | 1. So sánh từng thành viên với yêu cầu vị trí hiện tại |
| Ngoại lệ | Data scope: chỉ nhân viên trong phòng ban mình quản lý (BR-12) |
| Điều kiện sau | Nắm gap từng thành viên |
| BR/CR | BR-01, BR-09, BR-12 |

> ⚠️ Report 3 gốc so với "career grade". docs_v3 so với **position requirement set**.

**UC-40 — View My Competency Profile and Skill Gap**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. So sánh mức đã xác nhận với yêu cầu vị trí hiện tại |
| Điều kiện sau | Hiểu được gap cá nhân |
| BR/CR | BR-01, BR-09 |

> ⚠️ Report 3 gốc so với "position and career grade". docs_v3 so với **position**.

### PKG-06 — Digital Certificate & Public Verification

**UC-27 — Manage Certificate Registry**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Liệt kê chứng chỉ, lọc sắp hết hạn/hết hạn → 2. Thu hồi kèm lý do |
| Ngoại lệ | Thu hồi = đổi status REVOKED, ghi audit (BR-11, CR-08) |
| Điều kiện sau | Registry cập nhật |
| BR/CR | BR-06, BR-10, BR-11 |

**UC-45 — View and Download My Certificates**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Duyệt chứng chỉ đã đạt → 2. Tải PDF có QR |
| Điều kiện sau | Có PDF xác minh được |
| BR/CR | BR-10 |

**UC-46 — Verify a Certificate**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Public Visitor |
| Điều kiện trước | Không cần tài khoản |
| Luồng chính | 1. Nhập mã hoặc quét QR → 2. Xem holder, competency/course, ngày cấp, trạng thái VALID/EXPIRED/REVOKED |
| Ngoại lệ | Vượt 20 yêu cầu/phút → Rate Limit Notice |
| Điều kiện sau | Kết quả xác minh hiển thị |
| BR/CR | BR-10; giới hạn rate (03B §5.4) |

### PKG-07 — Practical Task & Competency Evidence

**UC-30 — Manage Practical Task Templates**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có quyền manager |
| Luồng chính | 1. Duy trì template tái dùng, mỗi template gắn competency nó chứng minh |
| Điều kiện sau | Template sẵn sàng gán |
| BR/CR | BR-11 |

**UC-31 — Assign Practical Task to Employee**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có quyền manager (chỉ phòng ban mình) |
| Luồng chính | 1. Gán task từ template hoặc viết ad hoc → 2. Đặt due date + evaluator |
| Điều kiện sau | Nhân viên nhận task |
| BR/CR | BR-12; notification (CR-04) |

**UC-32 — Review Submission and Confirm Evidence**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có bài nộp; có quyền evaluator |
| Luồng chính | 1. Xem bài nộp → 2. Chấm theo rubric → 3. Quyết định có tính là bằng chứng năng lực không |
| Ngoại lệ | Confirm cập nhật hồ sơ năng lực nhân viên |
| Điều kiện sau | Evidence Confirmed, mỗi competency một evidence (BR-04) |
| BR/CR | BR-04, BR-05, BR-12; ghi audit (CR-08) |

**UC-33 — View Team Evidence Portfolio**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có quyền manager (chỉ phòng ban mình) |
| Luồng chính | 1. Duyệt bằng chứng tích lũy của đội |
| Điều kiện sau | Truy vết bằng chứng theo competency |
| BR/CR | BR-12 |

**UC-44 — Submit Practical Task Evidence**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Được gán task |
| Luồng chính | 1. Nộp link/file → 2. Nếu evaluator yêu cầu sửa → nộp bản mới |
| Điều kiện sau | Submission được gửi |
| BR/CR | BR-04; file lên MinIO (03B §4) |

### PKG-08 — Dashboards, Analytics & Notifications

**UC-23 — View Capability Executive Dashboard**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | HR / Training Manager |
| Điều kiện trước | Có quyền HR |
| Luồng chính | 1. Xem readiness/risk/gap toàn công ty, lọc theo job family |
| Điều kiện sau | Tầm nhìn tổng thể |
| BR/CR | BR-09 |

**UC-28 — View Department Capability Dashboard**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Department Manager |
| Điều kiện trước | Có quyền manager |
| Luồng chính | 1. Xem readiness/risk **chỉ phòng ban mình** |
| Ngoại lệ | Data scope phòng ban (BR-12) |
| Điều kiện sau | Tầm nhìn phòng ban |
| BR/CR | BR-12 |

**UC-34 — View Trainer Dashboard**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Internal Trainer |
| Điều kiện trước | Có quyền trainer |
| Luồng chính | 1. Xem enrollment, completion, pass-rate cho khóa của mình |
| Điều kiện sau | Nắm hiệu quả khóa học |
| BR/CR | — |

**UC-39 — View My Learning Dashboard**

| Thuộc tính | Giá trị |
|-----------|---------|
| Actor | Employee |
| Điều kiện trước | Đã đăng nhập |
| Luồng chính | 1. Xem readiness, khóa đang học, task đang chờ |
| Điều kiện sau | Nắm trạng thái cá nhân |
| BR/CR | — |

---

## 7. Ghi chú chuyển đổi mô hình (Career Grade → 3 level)

Áp dụng nhất quán theo `00_INDEX` §3.1.3:

| Hạng mục Report 3 | Xử lý docs_v3 |
|-------------------|----------------|
| UC-15 Manage Career Grades (G1–G5) | **Loại bỏ**; màn hình 13 "Career Grades Management" gỡ |
| UC-17 Requirement Set = position + career grade | Requirement Set = **position** |
| UC-19 Employee (career grade field) | Bỏ trường career grade |
| UC-29 / UC-40 so với career grade | So với **position requirement set** |
| Màn hình 25 "Team Skill Gap Matrix" / 36 "My Competency Profile" | Bỏ "grade" khỏi mô tả |
| UC-10 Configure Competency Level Display Mapping | **Giữ** — đây là UC quản trị thang 3 mức duy nhất |

Tổng UC hiệu dụng docs_v3: **45** (46 theo Report 3, trừ UC-15); tổng màn hình hiệu dụng: **43** (44 trừ màn hình 13). Số liệu gốc Report 3 được giữ trong `00_INDEX` §3.3/§3.4 để đối chiếu.

---

## 8. Ma trận vết (UC → Feature → BR)

| UC | Feature (Report 1) | BR liên quan |
|----|--------------------|--------------|
| UC-01..07 | FE-01, FE-09 | BR-12, CR-01..04 |
| UC-08..13 | FE-01 | BR-08, BR-12 |
| UC-14, 16..22 | FE-02, FE-03 | BR-01, BR-02, BR-03, BR-09, BR-11, BR-12 |
| UC-15 | (loại bỏ) | — |
| UC-23, 25, 26 | FE-06, FE-09 | BR-01, BR-09 |
| UC-24, 35, 41, 42 | FE-04 | BR-07 |
| UC-27, 45, 46 | FE-07 | BR-06, BR-10, BR-11 |
| UC-28, 29 | FE-06, FE-09 | BR-01, BR-09, BR-12 |
| UC-30..33, 44 | FE-08 | BR-04, BR-05, BR-12 |
| UC-34, 39 | FE-09 | — |
| UC-36..38, 43 | FE-05 | BR-06, BR-07 |
| UC-40 | FE-06 | BR-01, BR-09 |
