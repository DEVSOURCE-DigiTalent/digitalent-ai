# BẢNG ĐẶC TẢ CHI TIẾT TẤT CẢ CÁC TASK CỦA TRẦN VĂN LINH (LINHTV)
## Dự án: DigiTalent AI Platform — Toàn bộ chu kỳ phát triển (Sprint 1 đến Sprint 6)

---

### 👤 Thông tin cá nhân & Vai trò dự án:
- **Họ và tên:** Trần Văn Linh
- **Mã sinh viên:** DE180719
- **Email sinh viên FPT:** `linhtvde180719@fpt.edu.vn`
- **Tài khoản Git/GitHub:** `linhtv1209-fudn` / `vanbi12092004@gmail.com`
- **Vai trò trong đồ án:** **Trưởng nhóm (Team Leader / Fullstack & Architecture Lead)**
- **Jira Account ID:** `712020:668497a4-9360-4c92-bcde-90abb65a9586`

---

### 📊 Thống kê khối lượng công số (Effort Metrics):
- **Tổng số task phụ trách chính (In-charge):** **37 tasks** — **499.0 giờ**
- **Tổng số task kiểm tra & review chéo:** **30 tasks** — **88.0 giờ**
- **Tổng thời lượng đóng góp:** **587.0 giờ** *(Khớp chính xác 100% với file tracking `DigiTalent_AI_Project_Tracking.xlsx`)*
- **Tỷ trọng phân bổ:** Cân bằng toàn diện giữa **Backend Kỹ thuật cao (32%)**, **Frontend Nghiệp vụ phức tạp (24%)**, **Thiết kế Giải thuật & Bảo mật (18%)**, **Tài liệu Báo cáo Đồ án (14%)** và **Quản trị Sprint/Review (12%)**.

---

### 🏛️ Bản đồ Kiến trúc Kỹ thuật & Hạ tầng Nền tảng (System Architecture Blueprint):
Nhằm đảm bảo các task kỹ thuật được triển khai chuẩn chỉnh và thống nhất 100%, toàn bộ công việc của LinhTV tuân thủ kiến trúc đã thiết lập:
- **Kiến trúc Backend (.NET 8):** Clean Architecture kết hợp UseCase Pattern:
  - `DigiTalent.Domain`: 59 thực thể (Entities), Enums, Constants (`Permissions` 114 mã, `RolePermissions`, `Roles`, `Statuses`, `Policies`).
  - `DigiTalent.Application`: Các UseCase độc lập (`IUseCase<TInput, TOutput>`), `IApplicationDbContext`, `ICurrentUser` (hỗ trợ `EmployeeId`, `DepartmentId`, `GetRequiredDepartmentId()`), `IFileStorageService`, `IAuditService`, `INotificationSender`.
  - `DigiTalent.Infrastructure`: `AppDbContext` (59 DbSets, SnakeCase, Restrict FK), `JwtTokenService` (Access/Refresh Token, HMAC-SHA256, SHA256 Hash), `LocalFileStorageService`, `AuditService`, `DbSeeder`.
  - `DigiTalent.Api`: Controllers RESTful (`/api/v1/...`), `NotificationHub` (SignalR WebSocket `/hubs/notifications`), `FilesController`, `ExceptionHandlingMiddleware`, `[HasPermission]`.
- **Cơ sở dữ liệu (Database):** PostgreSQL 16 gồm 59 bảng theo chuẩn `DigiTalent_AI_Canonical_v2_3.sql`, quản lý bằng EF Core Migrations.
- **Bảo mật & Phân quyền (RBAC):** Token JWT 8 giờ, Refresh Token 7 ngày với cơ chế Token Rotation và Token Reuse Detection chống tấn công; 114 permissions bao phủ 11 phân hệ; phân quyền dữ liệu cấp phòng ban (Department Data Scoping).
- **Lưu trữ tệp tin & Chứng chỉ:** Tích hợp `IFileStorageService` hỗ trợ lưu trữ phân mục bài giảng, bài nộp thực hành và xuất bản chứng chỉ PDF kèm mã QR xác thực công khai (`/verify/{code}`).
- **Thuật toán & Trí tuệ Năng lực (Intelligence Engine):** Vận hành theo luật toán học tường minh (Explainable by Design), không dùng mô hình hộp đen: tính toán Skill Gap, xếp hạng khóa học gợi ý, dự báo rủi ro đào tạo (Training Risk) và đo lường độ sẵn sàng làm việc (Workforce Readiness).
- **Kiến trúc Frontend 2 Tuyến Giao diện (Dual-Track Frontend on Unified Backend):**
  - **Tuyến Doanh nghiệp (`/enterprise/*`):** Giao diện `EnterpriseLayout` với thanh điều hướng nghiệp vụ quản trị, phục vụ các vai trò B2B (`HR_MANAGER`, `DEPARTMENT_MANAGER`, `TRAINER`, `EMPLOYEE`), hỗ trợ quản lý cơ cấu tổ chức phân cấp, thiết lập tiêu chuẩn năng lực chức danh, giao khóa học theo phòng ban, chấm điểm bài tập thực hành theo Rubric (WMS-Lite) và Dashboard phân tích độ sẵn sàng nguồn nhân lực.
  - **Tuyến Người học Cá nhân (`/learn/*`):** Giao diện `LearnerLayout` tinh giản, tập trung vào trải nghiệm học tập tự chủ (B2C / Self-directed Learner): Đăng ký tài khoản tự do, chọn mục tiêu nghề nghiệp (`Target Role`), làm bài tự đánh giá năng lực đầu vào (Diagnostic Test), nhận lộ trình học tập bù đắp khoảng trống kỹ năng, học bài giảng đa phương tiện, nộp bài thực hành và nhận bộ sưu tập chứng chỉ số QR.
  - **Cổng Dịch vụ Công khai (`/`):** Landing page chuyển đổi kép, tra cứu danh mục nghề nghiệp số (`/careers`) và cổng xác thực chứng chỉ số công khai (`/verify/{code}`).
  - **Cơ chế Phục vụ Dùng chung trên 1 Backend:** Hệ thống sử dụng duy nhất một nhân Backend .NET 8 phục vụ cả 2 luồng. Ngữ cảnh dữ liệu phân định tự động qua `ICurrentUser.DepartmentId` (nếu có: tự động áp dụng Department Data Scoping; nếu `null`: người học cá nhân tự do chỉ truy xuất và quản lý dữ liệu học tập cá nhân của mình).

---

### 📑 Mục lục tra cứu nhanh theo Sprint:
- [Sprint 1: Khởi tạo dự án, Quản trị & Nền tảng (5 tasks - 35h - Done)](#sprint-1)
- [Sprint 2: Tiêu chuẩn Vị trí, Khung Năng lực & Nhân sự (5 tasks - 79h - Done)](#sprint-2)
- [Sprint 3: Engine Phân tích Khoảng cách Năng lực & Gợi ý (9 tasks - 140h - To Do)](#sprint-3)
- [Sprint 4: Chấm bài Thực hành & Bằng chứng Năng lực (8 tasks - 110h - To Do)](#sprint-4)
- [Sprint 5: Phân quyền Đa phòng ban, Bảo mật & Dữ liệu Lớn (5 tasks - 68h - To Do)](#sprint-5)
- [Sprint 6: Triển khai Production, Kiểm thử UAT & Bảo vệ Đồ án (5 tasks - 67h - To Do)](#sprint-6)
- [Phụ lục: Danh sách 30 Task Review chéo của Trần Văn Linh](#phu-luc-review)

---

<a id="sprint-1"></a>
## 🌟 SPRINT 1 (5 tasks — Tổng công: 35h)

### 1.1. [DT-111] S1-T001 — Plan Sprint 1 backlog, setup tracking rules & Git workflow

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-111**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-111) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S1-PBI-01] Project Setup & Team Governance` |
| **Phân hệ (Module)** | Hạ tầng, Quản trị Dự án & Khởi tạo Nền tảng (Infrastructure & Project Foundations) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 1h) |
| **Giờ công dự tính** | **6 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 19/08/2026 ➔ 21/08/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là nhóm phát triển, chúng tôi cần thiết lập môi trường Docker, quy chuẩn Git, CI/CD pipeline và kiến trúc khung .NET 8 / React 19 để toàn đội ngũ làm việc đồng bộ.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thực hiện công tác quản trị dự án Agile/Scrum: lập kế hoạch phân rã Sprint Backlog, chuẩn hóa quy trình phân chia task BE/FE cho 5 thành viên theo mô hình WBS, thiết lập quy chuẩn rẽ nhánh Git/PR, tổ chức các buổi demo nghiệm thu sản phẩm thực tế với giảng viên hướng dẫn (Mentor) và điều phối họp cải tiến quy trình (Retrospective).

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Project Governance:** Jira Software Cloud, WBS Matrix, Scrum Board
- **Version Control:** Git, GitHub Flow, Conventional Commits, Pull Request Template
- **Documentation:** Markdown, Microsoft Word (Capstone Report Package 1-7)

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Mã nguồn hoặc tài liệu hoàn thành 100%, tuân thủ tiêu chuẩn code clean và quy ước dự án.
- [x] Đã kiểm thử hoạt động đạt yêu cầu trên môi trường local (chạy pass API Swagger / giao diện UI / kịch bản test).
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S1-T001` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 1.2. [DT-113] S1-T002 — Analyze committee feedback & confirm 3-level MVP scope

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-113**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-113) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S1-PBI-02] Analyze requirement` |
| **Phân hệ (Module)** | Phát triển Tính năng Nền tảng (Platform Core Development) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 3h) |
| **Giờ công dự tính** | **15 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 21/08/2026 ➔ 27/08/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần phân tích ý kiến đóng góp của Hội đồng bảo vệ đề cương tốt nghiệp để chuẩn hóa lại phạm vi sản phẩm (MVP Scope), đặc biệt là chuyển đổi mô hình đánh giá sang thang 3 mức (Basic / Intermediate / Advanced) thay vì thang 5 mức phức tạp, đảm bảo tính khả thi triển khai.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thực hiện rà soát và điều chỉnh phạm vi nghiệp vụ dự án theo phản biện của Hội đồng:
1. **Phân tích phản biện:** Đánh giá các điểm nghẽn nghiệp vụ và kỹ thuật do Hội đồng chỉ ra (thuật toán AI quá phức tạp, thang 5 mức khó chuẩn hóa bằng chứng trong thực tế doanh nghiệp vừa và nhỏ).
2. **Chuẩn hóa phạm vi MVP:**
   - Chốt thang đo năng lực 3 mức thống nhất: Cấp độ 1 (Basic), Cấp độ 2 (Intermediate), Cấp độ 3 (Advanced).
   - Tinh gọn phạm vi AI: Tập trung vào Rule-based Intelligence Engine giải thích được (Explainable), không dùng mô hình Black-box ML để phục vụ chấm điểm và gợi ý đào tạo.
3. **Biên bản xác nhận phạm vi:** Cập nhật lại tài liệu đặc tả yêu cầu và được Mentor xác nhận thông qua.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Scope Management:** MoSCoW Prioritization (Must have, Should have, Could have, Won't have)
- **Standard:** DigComp 3.0 Competency Framework, FPT Capstone Scope Regulations
- **Documentation:** Markdown, Meeting Minutes

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bản phân tích ý kiến Hội đồng và phạm vi MVP 3-level được hoàn thành 100%.
- [x] Được Giảng viên hướng dẫn (Mentor) duyệt và ký xác nhận phạm vi chính thức.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S1-T002` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 1.3. [DT-138] S1-T018 — Update Report 1 - Project introduction, problem gap & business requirements

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-138**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-138) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S1-PBI-11] Update report 1, 2, 3` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 31/08/2026 ➔ 02/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là nhóm thực hiện đồ án, chúng tôi cần hoàn thiện tập tài liệu Báo cáo 1 (Report 1 - Project Introduction & Business Requirements) theo đúng biểu mẫu học thuật của Đại học FPT, làm rõ bài toán thực tế và giải pháp nền tảng DigiTalent AI.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Biên soạn và hoàn thiện nội dung Báo cáo 1:
1. **Đặt vấn đề & Thực trạng:** Phân tích bài toán thiếu hụt kỹ năng số trong doanh nghiệp, sự phân mảnh giữa đào tạo lý thuyết và thực hành, khó khăn trong việc đo lường độ sẵn sàng (Readiness) của nhân sự.
2. **Mục tiêu dự án & Phạm vi:** Trình bày giải pháp DigiTalent AI kết hợp giữa Đào tạo số, Khảo thí tự động, Quản lý bài tập thực hành (WMS-Lite) và Cấp chứng chỉ số xác thực bằng mã QR.
3. **Phân tích các bên liên quan (Stakeholder Analysis):** Xác định chân dung người dùng và bài toán giá trị cho Admin, HR Manager, Department Manager, Trainer, Employee.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Academic Writing:** FPT University Capstone Project Guidelines, Business Case Study Format
- **Documentation:** Microsoft Word, Mendeley Citation

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 1 hoàn thành 100%, đúng quy chuẩn định dạng bìa, mục lục và nội dung.
- [x] Được Mentor duyệt và xác nhận đạt yêu cầu giai đoạn Sprint 1.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S1-T018` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 1.4. [DT-139] S1-T019 — Update Report 2 - Project management plan, WBS matrix & risk registry

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-139**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-139) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S1-PBI-11] Update report 1, 2, 3` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 02/09/2026 ➔ 03/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm dự án, tôi cần xây dựng Báo cáo 2 (Report 2 - Project Management Plan) thiết lập quy trình quản trị Scrum, ma trận phân rã công việc WBS chi tiết cho 5 thành viên và sổ tay quản trị rủi ro dự án.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Biên soạn và chuẩn hóa toàn bộ nội dung quản trị dự án trong Report 2:
1. **Kế hoạch quản trị Agile/Scrum:** Quy định chu kỳ 6 Sprint (mỗi Sprint 2 tuần), các sự kiện Scrum (Planning, Daily, Review, Retrospective) và bảng tiêu chí hoàn thành Definition of Done (DoD).
2. **Ma trận phân rã công việc (WBS Matrix):** Thiết lập bảng WBS phân chia 167 tasks chi tiết cho 5 thành viên, cân đối tỷ trọng kỹ thuật, nghiệp vụ và kiểm thử.
3. **Sổ theo dõi rủi ro (Risk Registry):** Nhận diện 8 rủi ro chính (chậm tiến độ, thay đổi yêu cầu, xung đột Git, quá tải backend) và kế hoạch phòng ngừa, giảm thiểu.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Project Management:** Scrum Framework, WBS (Work Breakdown Structure), Risk Matrix
- **Tools:** Jira Software Cloud, Microsoft Excel tracking template, Microsoft Word

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 2 hoàn thiện 100%, số liệu công số khớp chính xác với Jira và file tracking.
- [x] Toàn bộ nhóm thống nhất quy trình làm việc và cam kết trách nhiệm.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S1-T019` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 1.5. [DT-146] S1-T023 — Conduct Sprint 1 review, deliverable demo to mentor & team retrospective

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-146**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-146) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S1-PBI-14] Sprint Review & Retrospective` |
| **Phân hệ (Module)** | Đánh giá & Nghiệm thu Sprint (Sprint Review & Retrospective) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 1h) |
| **Giờ công dự tính** | **4 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 04/09/2026 ➔ 04/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là nhóm phát triển Agile, chúng tôi cần tiến hành demo sản phẩm thực tế của Sprint 1 (hạ tầng Docker, khung kiến trúc .NET 8 / React 19 và tài liệu nền tảng) cho Mentor nghiệm thu và tổ chức họp rút kinh nghiệm cải tiến quy trình.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Tổ chức và điều phối phiên đánh giá nghiệm thu Sprint 1:
1. **Demo nghiệm thu với Mentor:** Trình chiếu kiến trúc Monorepo, pipeline CI/CD GitHub Actions, khởi chạy Docker Compose thành công với PostgreSQL/MinIO, và giải trình tài liệu Report 1, 2.
2. **Đo lường chỉ số Sprint:** Tính toán Velocity Sprint 1 (đạt 100% kế hoạch), đánh giá chất lượng pull request và tuân thủ commit convention.
3. **Họp cải tiến quy trình (Retrospective):** Áp dụng mô hình Mad-Sad-Glad / Start-Stop-Continue, thống nhất giải pháp phối hợp nhịp nhàng giữa BE và FE trước khi bước vào Sprint 2.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Scrum Events:** Sprint Review, Sprint Retrospective, Velocity Tracking
- **Documentation:** Sprint 1 Review Minutes, Retrospective Action Items

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Buổi demo với Mentor thành công tốt đẹp, Mentor ký chấp thuận nghiệm thu kết quả Sprint 1.
- [x] Biên bản Retrospective được lưu trữ vào kho tài liệu dự án.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S1-T023` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---


<a id="sprint-2"></a>
## 🌟 SPRINT 2 (5 tasks — Tổng công: 79h)

### 2.1. [DT-148] S2-T001 — Plan Sprint 2 backlog & assign vertical slice feature ownership

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-148**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-148) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S2-PBI-01] Sprint Planning & Backlog Refinement` |
| **Phân hệ (Module)** | Phát triển Tính năng Nền tảng (Platform Core Development) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 05/09/2026 ➔ 07/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần lập kế hoạch phân bổ Sprint 2 Backlog và giao quyền sở hữu tính năng dọc (Vertical Slice Ownership) cho 2 phân hệ trọng tâm: Quản trị cơ cấu tổ chức & Khung năng lực / Tiêu chuẩn vị trí.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Lập kế hoạch và phân rã kỹ thuật Sprint 2:
1. **Phân rã backlog theo Vertical Slice:** Chia các PBI thành các luồng hoàn chỉnh từ Database ➔ Backend UseCase ➔ Frontend UI Component ➔ Unit Test, đảm bảo mỗi tính năng hoàn thành có thể chạy thử độc lập.
2. **Phân công trách nhiệm:**
   - Phân hệ Tổ chức & Nhân sự: Giao cho HoangNT (BE) và VietTN (FE).
   - Phân hệ Khung năng lực & Bộ tiêu chuẩn chức danh: LinhTV trực tiếp phụ trách thiết kế kiến trúc, code BE cốt lõi và dựng trang Editor.
3. **Thống nhất API Contracts:** Soạn thảo trước đặc tả Request/Response DTO cho các endpoint Quản trị vị trí và Tiêu chuẩn năng lực trước khi lập trình.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Agile Architecture:** Vertical Slice Architecture, Contract-First API Design
- **Management:** Jira Software Cloud, WBS Sprint 2

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Kế hoạch Sprint 2 được kích hoạt trên Jira, 100% task được gán đúng PIC và Reviewer.
- [x] Bản hợp đồng API (API Contracts) được BE và FE thống nhất.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S2-T001` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 2.2. [DT-166] S2-T014 — [BE] Implement Position Requirement Set API (Competency mapping & versioning)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-166**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-166) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S2-PBI-06] Code Job Architecture Management` |
| **Phân hệ (Module)** | Quản trị Năng lực & Khung Tiêu chuẩn (Competency Framework & Job Architecture) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 7h) |
| **Giờ công dự tính** | **32 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 09/09/2026 ➔ 17/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là HR / Chuyên viên đào tạo, tôi muốn định nghĩa bộ tiêu chuẩn năng lực cho từng vị trí công việc (Position Requirement Set) gồm danh sách kỹ năng, cấp độ yêu cầu (1-3), trọng số và cờ bắt buộc, hỗ trợ tạo bản nháp và kích hoạt phiên bản chính thức (Versioning).

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng cụm RESTful API endpoints trong backend .NET 8 theo Clean Architecture & UseCase Pattern:
1. **API Endpoints:**
   - `GET /api/v1/position-requirements`: Lấy bộ tiêu chuẩn của một vị trí theo `positionId` và `versionNo`.
   - `POST /api/v1/position-requirements`: Tạo bản nháp (`DRAFT`) bộ tiêu chuẩn với danh sách các năng lực con (`PositionRequirementItem`).
   - `PUT /api/v1/position-requirements/{id}`: Cập nhật nội dung bản nháp (thêm/bớt năng lực, sửa cấp độ yêu cầu, trọng số).
   - `POST /api/v1/position-requirements/{id}/activate`: Kích hoạt bộ tiêu chuẩn thành `ACTIVE`, tự động chuyển phiên bản active cũ thành `ARCHIVED`.
2. **Triển khai kỹ thuật:**
   - Thư mục: `backend/src/DigiTalent.Application/UseCases/Competency/` (`CreateDraftPositionRequirementSetUseCase`, `ActivatePositionRequirementSetUseCase`).
   - Ràng buộc toàn vẹn: Kiểm tra tổng trọng số các năng lực thành phần bằng 100%, cấp độ yêu cầu nằm trong thang 1-3, kiểm soát đồng thời lạc quan.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend Framework:** .NET 8 (C# 12), ASP.NET Core Web API, UseCase pattern
- **Database ORM:** EF Core 8, Npgsql, PostgreSQL 16 (Bảng `position_requirement_sets`, `position_requirement_items`)
- **Security:** `[HasPermission(Permissions.PositionRequirement.CreateUpdate)]`

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Mã nguồn hoàn thành 100%, tuân thủ tiêu chuẩn Clean Architecture và UseCase Pattern.
- [x] Swagger UI chạy pass toàn bộ các luồng: Tạo nháp ➔ Sửa nháp ➔ Kích hoạt phiên bản mới ➔ Kiểm tra phiên bản cũ bị archived.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S2-T014` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 2.3. [DT-168] S2-T016 — [FE] Build Position Requirement Editor page (Competency matrix & level picker)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-168**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-168) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S2-PBI-06] Code Job Architecture Management` |
| **Phân hệ (Module)** | Quản trị Năng lực & Khung Tiêu chuẩn (Competency Framework & Job Architecture) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **VietTN** (Công số review: 5h) |
| **Giờ công dự tính** | **30 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 18/09/2026 ➔ 23/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là HR / Chuyên viên đào tạo, tôi muốn có trang giao diện trực quan để thiết lập tiêu chuẩn năng lực cho chức danh vị trí: chọn kỹ năng từ khung năng lực, chọn cấp độ thành thạo yêu cầu (Basic / Intermediate / Advanced), điều chỉnh trọng số và ấn nút kích hoạt.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Phát triển giao diện người dùng tương tác cao bằng React 19, TypeScript và Tailwind CSS 4:
1. **Trang thiết lập tiêu chuẩn (`features/competency/pages/PositionRequirementsPage.tsx`):**
   - Bộ chọn Vị trí công việc (`JobPosition Select`) và danh sách phiên bản lịch sử (Version History Tabs).
   - Bảng ma trận năng lực: Cột Tên năng lực, Nhóm năng lực, Cấp độ yêu cầu (Level Picker 1-3 với mô tả chi tiết tiêu chí), Trọng số (% Weight), Cờ bắt buộc (Mandatory Switch).
2. **Trải nghiệm tương tác & Validate:**
   - Tính toán động tổng trọng số theo thời gian thực (hiển thị màu đỏ nếu $\ne 100\%$, màu xanh lá nếu $= 100\%$).
   - Nút "Lưu bản nháp" và nút "Kích hoạt phiên bản chính thức" kèm modal xác nhận.
   - Kết nối API qua `competency.service.ts` bằng Axios client, tích hợp thông báo Sonner Toast.
3. **Khả năng tái sử dụng liên tuyến (Dual-route Component Reusability):**
   - Thiết kế bảng ma trận năng lực theo dạng component độc lập (`CompetencyMatrixGrid`), cho phép tái sử dụng trong tuyến Người học cá nhân (`/learn/target`) làm trình khám phá tiêu chuẩn kỹ năng nghề nghiệp (Target Role Competency Inspector) giúp học viên tự do tra cứu chuẩn đầu ra.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Frontend Framework:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Shadcn/UI
- **State & Networking:** TanStack React Query v5, Axios `apiClient`, React Hook Form + Zod
- **UI Components:** Select, Dialog, Switch, Badge, Table, Tooltip

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Giao diện hoàn thành 100%, responsive, kết nối thành công với backend API và lưu đúng dữ liệu vào database.
- [x] Xử lý mượt mà validation tổng trọng số 100% và trạng thái loading khi lưu/kích hoạt.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S2-T016` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **VietTN**) review và chấp thuận nghiệm thu (Approved).

---

### 2.4. [DT-184] S2-T026 — Update Report 4 - Document Phase 1 database schema dictionary & RBAC matrix

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-184**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-184) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S2-PBI-12] Update report 4` |
| **Phân hệ (Module)** | Xác thực & Phân quyền (Authentication & RBAC) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 2h) |
| **Giờ công dự tính** | **8 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 23/09/2026 ➔ 24/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Kiến trúc sư hệ thống, tôi cần văn bản hóa chi tiết từ điển cơ sở dữ liệu Phase 1 và ma trận phân quyền RBAC 5 vai trò vào Báo cáo thiết kế phần mềm (Report 4) để làm thước đo đối chiếu chuẩn cho toàn dự án.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Biên soạn và hoàn thiện nội dung kỹ thuật trong Report 4 (SDD):
1. **Từ điển cơ sở dữ liệu Phase 1 & Cấu trúc Canonical Schema:**
   - Đặc tả chuẩn hóa cấu trúc 59 bảng theo `DigiTalent_AI_Canonical_v2_3.sql`, trọng tâm Phase 1 là các nhóm bảng Tổ chức & Khung năng lực: `departments`, `job_families`, `job_positions`, `employees`, `competencies`, `competency_categories`, `competency_levels`, `position_requirement_sets`, `position_requirement_items`.
   - Chuẩn hóa quy ước đặt tên SnakeCase, khóa chính UUID v4, ràng buộc khóa ngoại `ON DELETE RESTRICT` để bảo toàn dữ liệu kiểm toán.
2. **Ma trận phân quyền RBAC toàn diện (114 Permissions across 11 Modules):**
   - Xây dựng ma trận phân quyền chi tiết cho 5 vai trò hệ thống (`SYSTEM_ADMIN`, `HR_MANAGER`, `DEPARTMENT_MANAGER`, `TRAINER`, `EMPLOYEE`) ánh xạ chính xác qua 11 phân hệ chức năng: Identity (13), Organization (10), JobRole (10), Competency (12), Learning (14), Assessment (16), Practical Task (11), Certificate (10), Intelligence Engine (8), Analytics (6), System (4).
   - Quy định rõ quyền Đọc/Tạo/Sửa/Lưu trữ/Kích hoạt và phạm vi kiểm soát dữ liệu theo cấp phòng ban (`DepartmentId`).
3. **Đặc tả luồng bảo mật & Xác thực hai lớp (RFC 6749 Token Rotation):**
   - Cấp phát Access Token JWT (8 giờ, HMAC-SHA256) chứa các Claims: `nameid`, `email`, `role`, `department_id`, `employee_id`, `permissions`.
   - Cơ chế Refresh Token (7 ngày) lưu trong bảng `refresh_tokens`, áp dụng kỹ thuật băm SHA256, tự động xoay vòng token (Token Rotation) và phát hiện tái sử dụng token xâm phạm (Compromised Token Reuse Detection) để vô hiệu hóa toàn bộ phiên làm việc của người dùng.
   - Chính sách băm mật khẩu một chiều BCrypt và khóa tài khoản khi đăng nhập thất bại vượt quá 5 lần liên tiếp trong 15 phút.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Architecture Documentation:** IEEE 1016 SDD, RBAC Security Matrix (114 Permissions / 5 Roles)
- **Database Modeling:** SQL DDL Canonical v2.3 (59 Tables), Data Dictionary Format
- **Security Standards:** RFC 6749 / RFC 7519 JWT Security, OWASP Authorization Cheat Sheet

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 4 phần CSDL Phase 1 và ma trận RBAC được cập nhật đầy đủ, chính xác 100%.
- [x] Không còn mâu thuẫn giữa mã nguồn thực tế và mô tả tài liệu.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S2-T026` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 2.5. [DT-188] S2-T028 — Conduct Sprint 2 review, demo Org & Competency features to mentor & retrospective

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-188**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-188) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S2-PBI-14] Sprint Review & Retrospective` |
| **Phân hệ (Module)** | Quản trị Cơ cấu Tổ chức & Nhân sự (Organization & Employee Management) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 1h) |
| **Giờ công dự tính** | **4 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 25/09/2026 ➔ 25/09/2026 |
| **Trạng thái hiện tại** | **✅ Done** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm Scrum, tôi cần điều phối buổi demo sản phẩm thực tế Sprint 2 cho Giảng viên hướng dẫn (Mentor), nghiệm thu tính năng Quản lý cơ cấu tổ chức, Hồ sơ nhân sự và Khung tiêu chuẩn vị trí, đồng thời tổ chức họp cải tiến quy trình.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Tổ chức và điều phối phiên đánh giá nghiệm thu Sprint 2:
1. **Demo sản phẩm trực tiếp với Mentor:**
   - Đăng nhập với quyền HR Manager: Thêm mới phòng ban phân cấp, tạo chức danh công việc, tạo hồ sơ nhân viên.
   - Thao tác trên trang Position Requirement Editor: Gán khung năng lực DigComp 3.0 cho vị trí "Data Analyst", chọn mức độ yêu cầu, lưu nháp và kích hoạt phiên bản chính thức.
2. **Nghiệm thu kết quả kỹ thuật:** Mentor kiểm tra Swagger UI, mã nguồn Clean Architecture trên GitHub và xác nhận đạt yêu cầu chất lượng.
3. **Họp Sprint Retrospective:** Tổng kết công số 79 giờ của LinhTV và toàn đội, rút kinh nghiệm về tối ưu form validation để chuẩn bị bước vào Sprint 3 (trọng tâm là Skill Gap Engine).

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Scrum Framework:** Sprint Review, Sprint Retrospective, Sprint Burndown Chart
- **Documentation:** Sprint 2 Review Minutes, Mentor Sign-off Sheet

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Buổi demo tính năng Sprint 2 diễn ra trơn tru, được Mentor đánh giá cao và ký duyệt nghiệm thu.
- [x] Biên bản nghiệm thu và kế hoạch cải tiến Sprint 3 được ghi nhận đầy đủ.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S2-T028` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---


<a id="sprint-3"></a>
## 🌟 SPRINT 3 (9 tasks — Tổng công: 140h)

### 3.1. [DT-192] S3-T002 — Refine acceptance criteria - Learning Management, Quiz Engine & Skill Gap math

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-192**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-192) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-02] Analyze Requirement - Learning & Skill Gap` |
| **Phân hệ (Module)** | Quản lý Khóa học & Lộ trình Học tập (Learning & Course Management) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuyTD** (Công số review: 3h) |
| **Giờ công dự tính** | **13 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 26/09/2026 ➔ 28/09/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Giảng viên, Chuyên viên đào tạo và Nhân viên, chúng tôi cần đặc tả chi tiết bộ tiêu chí chấp nhận (AC) cho phân hệ Khóa học (Course Catalog), Ngân hàng đề & Khảo thí (Quiz Engine), cùng mô hình toán tính độ lệch năng lực (Skill Gap Math) theo thang 3 mức (Basic / Intermediate / Advanced) nhằm làm cơ sở phát triển thống nhất giữa FE và BE.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Nghiên cứu và chuẩn hóa toàn bộ Acceptance Criteria (AC) theo định dạng Given-When-Then cho Sprint 3:
1. **Khóa học & Bài giảng:** Quy tắc xuất bản (`DRAFT` ➔ `PUBLISHED`), điều kiện tiên quyết (`CoursePrerequisites`), tỷ lệ hoàn thành bài giảng để mở khóa bài thi cuối khóa.
2. **Khảo thí & Quiz Engine:** Cơ chế tính giờ, trộn câu hỏi ngẫu nhiên từ `QuestionBank`, quy tắc số lần thi tối đa (`MaxAttempts`) và điểm đạt tối thiểu (`PassingScore`).
3. **Mô hình toán Skill Gap (NF-01):** Thống nhất công thức tính độ lệch năng lực: $gap = required\_level - confirmed\_level$, quy tắc xếp mức nghiêm trọng (`LOW`, `MEDIUM`, `HIGH`) và chỉ số ưu tiên $priorityScore$.
4. **Quy tắc gợi ý khóa học:** Tiêu chí ghép nối khoảng trống năng lực với `CourseCompetency` để đề xuất khóa học phù hợp nhất.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Requirement Engineering:** Given-When-Then BDD, Acceptance Criteria Matrix
- **Standards:** DigComp 3.0 Competency Framework, SCORM/Learning Activity Lifecycle
- **Documentation:** Markdown, Microsoft Word (Capstone Report Package 3 §3.1.4, §3.7)

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu đặc tả AC và bộ quy tắc nghiệp vụ hoàn thành 100%, được team review và thống nhất.
- [x] Ma trận kiểm thử (Test Matrix) cho Quiz Engine và Skill Gap math được phê duyệt.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T002` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuyTD**) review và chấp thuận nghiệm thu (Approved).

---

### 3.2. [DT-194] S3-T003 — Design Skill Gap calculation algorithms & competency-based recommendation logic

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-194**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-194) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-03] Design Assessment & Gap Engine` |
| **Phân hệ (Module)** | Quản trị Năng lực & Khung Tiêu chuẩn (Competency Framework & Job Architecture) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 3h) |
| **Giờ công dự tính** | **11 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 28/09/2026 ➔ 30/09/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Kiến trúc sư hệ thống, tôi cần thiết kế thuật toán tính toán khoảng trống năng lực (Skill Gap Engine) và giải thuật xếp hạng gợi ý khóa học (Recommendation Engine) đảm bảo tính minh bạch, giải thích được (explainable AI/rule-based), không phụ thuộc mô hình hộp đen.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thiết kế chi tiết giải thuật và pseudo-code cho 2 engine cốt lõi:
1. **Thuật toán Skill Gap Calculation (NF-01):**
   - Đầu vào: `EmployeeId`, đối chiếu `PositionRequirementSet` (active của vị trí hiện tại) với `EmployeeCompetencyProfile` (thang 1: Basic, 2: Intermediate, 3: Advanced).
   - Công thức độ lệch: $gap = required\_level - confirmed\_level$ (nếu chưa có confirmed: coi như $confirmed = 0 \Rightarrow gap = required$).
   - Điểm ưu tiên: $priorityScore = gap \times weightPercent \times (mandatory ? 1.5 : 1.0)$.
   - Phân loại mức độ nghiêm trọng: `HIGH` (khi $gap \ge 2$ hoặc $mandatory = true$), `MEDIUM` ($gap = 1$), `LOW` ($gap \le 0$, đã đạt).
2. **Thuật toán Gợi ý Khóa học (Course Recommendation Logic):**
   - Quét danh sách khoảng trống năng lực có $gap > 0$, sắp xếp theo $priorityScore$ giảm dần.
   - Tìm kiếm khóa học `PUBLISHED` trong `course_competencies` có dạy kỹ năng này với cấp độ đầu ra $\ge required\_level$.
   - Tính điểm phù hợp: $matchScore = \sum (gap\_covered \times competency\_weight)$. Sinh trường giải thích lý do gợi ý (`Explanation`).

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Algorithm Design:** Pseudo-code, Flowchart Diagram, Decision Tree
- **Rule-based Intelligence:** Deterministic Scoring, Explainable AI principles (docs 16)
- **Database Mapping:** Bảng `skill_gap_runs`, `skill_gap_items`, `scoring_configs`

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bản thiết kế thuật toán chi tiết và pseudo-code hoàn chỉnh, bao phủ đầy đủ các trường hợp biên.
- [x] Sơ đồ luồng xử lý và tài liệu thiết kế giải thích được (Explainability spec) được duyệt.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T003` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 3.3. [DT-210] S3-T015 — [BE] Implement Skill Gap Calculation Engine API (Required vs Confirmed level)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-210**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-210) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-07] Code Skill Gap Engine & Recommendation` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 6h) |
| **Giờ công dự tính** | **30 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 30/09/2026 ➔ 03/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Nhân viên và Quản lý phòng ban / HR, tôi muốn hệ thống có API tự động phân tích và lưu vết snapshot khoảng trống năng lực giữa yêu cầu vị trí và hồ sơ thực tế của nhân viên.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng cụm RESTful API endpoints trong backend .NET 8 theo Clean Architecture & UseCase Pattern:
1. **API Endpoints & Phân quyền bảo mật:**
   - `POST /api/v1/intelligence/skill-gaps/calculate`: Nhận DTO `{ employeeId, requirementSetId? }`, thực thi phân tích độ lệch năng lực và lưu snapshot vào DB. Phân quyền chặt chẽ với attribute `[HasPermission(Permissions.Intelligence.SkillGapCalculate)]`.
   - `GET /api/v1/intelligence/skill-gaps`: Truy vấn lịch sử các lần chạy (`skill_gap_runs`) hỗ trợ phân trang, lọc theo `departmentId` hoặc `employeeId`. Phân quyền `[HasPermission(Permissions.Intelligence.SkillGapRead)]`.
   - `GET /api/v1/intelligence/skill-gaps/{runId}`: Trả về chi tiết các mục khoảng trống (`skill_gap_items`) gồm mã năng lực, tên, cấp độ yêu cầu, cấp độ đạt được, số bước lệch và điểm ưu tiên.
2. **Triển khai kỹ thuật & Mô hình toán học:**
   - Thư mục: `backend/src/DigiTalent.Application/UseCases/Intelligence/SkillGap/` (`CalculateSkillGapUseCase`, `GetSkillGapHistoryUseCase`).
   - Thang đo 3 cấp độ chuẩn DigComp 2.2/3.0: Cấp độ 1 (Basic), Cấp độ 2 (Intermediate), Cấp độ 3 (Advanced). Nếu nhân viên chưa có bằng chứng xác nhận: $confirmed\_level = 0$.
   - Công thức tính độ lệch: $gap = \max(0, required\_level - confirmed\_level)$.
   - Công thức điểm ưu tiên: $priorityScore = gap \times \frac{weightPercent}{100} \times (isMandatory ? 1.5 : 1.0)$.
   - Phân loại mức độ nghiêm trọng: `CRITICAL` ($gap \ge 2$ hoặc $isMandatory = true$ khi $gap > 0$), `HIGH` ($gap = 1$ có trọng số $\ge 20\%$), `MEDIUM` ($gap = 1$ thông thường), `MET` ($gap = 0$).
   - Lưu trữ `summary_snapshot` JSON trong bảng `skill_gap_runs` bao gồm: `{ total_required, total_met, total_gap, average_gap, readiness_index }` để FE render tức thì không cần tính toán lại.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend Framework:** .NET 8 (C# 12), ASP.NET Core Web API, UseCase pattern
- **Database ORM:** EF Core 8, Npgsql, PostgreSQL 16 (Bảng `skill_gap_runs`, `skill_gap_items`, `position_requirement_sets`)
- **Security:** `Permissions.Intelligence.SkillGapCalculate`, `Permissions.Intelligence.SkillGapRead`
- **Validation & Response:** FluentValidation, `ApiResponse<SkillGapRunResponse>`, ISO-8601 Audit Timestamps

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Mã nguồn hoàn thành 100%, tuân thủ Clean Architecture và UseCase Pattern của dự án.
- [x] Kiểm thử Swagger UI chạy thành công: tính đúng gap, lưu snapshot và trả kết quả chính xác theo DTO.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T015` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 3.4. [DT-211] S3-T016 — [FE] Build My Skill Gap & Team Skill Gap pages (Interactive Radar Chart & badges)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-211**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-211) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-07] Code Skill Gap Engine & Recommendation` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **VietTN** (Công số review: 6h) |
| **Giờ công dự tính** | **27 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 30/09/2026 ➔ 03/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Nhân viên và Quản lý phòng ban, tôi muốn có trang giao diện trực quan thể hiện biểu đồ mạng nhện (Radar Chart) so sánh năng lực hiện tại với chuẩn vị trí, cùng danh sách huy hiệu cảnh báo năng lực còn thiếu để lập kế hoạch đào tạo.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Phát triển 2 trang giao diện bằng React 19, TypeScript, Tailwind CSS 4 và Shadcn/UI:
1. **Trang My Skill Gap (`features/employee/pages/MyCompetencyProfilePage.tsx` / `SkillGapTab`):**
   - Biểu đồ đa giác Recharts (Radar Chart) với 2 lớp: Đường viền Xanh dương nét đứt (Cấp độ Yêu cầu vị trí) và Vùng phủ Xanh ngọc mờ (Cấp độ Đã xác nhận).
   - Thẻ KPI tổng quan: Tổng năng lực yêu cầu, Năng lực đã đạt (`Met`), Năng lực hụt (`Gap`), Chỉ số sẵn sàng công việc (`Readiness Index %`).
   - Bảng phân tích chi tiết: Tên năng lực, Nhóm năng lực DigComp, Cấp độ Yêu cầu (1-3) vs Thực tế, Bước lệch (`GapSteps`), Trọng số, Huy hiệu cảnh báo (`CRITICAL` đỏ, `HIGH` cam, `MEDIUM` vàng, `MET` xanh lục).
2. **Trang Team Skill Gap (`features/intelligence/pages/SkillGapPage.tsx`):**
   - Dành cho Department Manager & HR Manager: Bộ lọc đa năng theo Phòng ban (`DepartmentSelect`), Chức danh vị trí (`PositionSelect`), Tìm kiếm nhân viên.
   - Heatmap phân bổ năng lực toàn đội và danh sách nhân sự có độ lệch lớn nhất cần ưu tiên đào tạo.
   - Nút hành động tương tác "Phân tích lại (Recalculate Gap)" gọi endpoint `POST /api/v1/intelligence/skill-gaps/calculate` kèm hiệu ứng loading spinner và thông báo toast realtime.
3. **Phục vụ đa tuyến (Dual-Track Deployment):**
   - Tuyến Người học cá nhân (`/learn/dashboard` & `/learn/progress`): Component Radar Chart thể hiện khoảng trống năng lực cá nhân so với vị trí nghề nghiệp mục tiêu (`Target Role`) để tự học.
   - Tuyến Doanh nghiệp (`/enterprise/intelligence/skill-gap`): Mở rộng thêm bộ lọc phòng ban và so sánh đa nhân sự cho cấp quản lý.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Frontend Framework:** React 19, TypeScript, Vite 8, Tailwind CSS 4
- **Visualization:** Recharts (RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip)
- **State & Networking:** TanStack React Query v5, Axios `apiClient`, Sonner Toasts
- **Design Tokens:** Indigo/Cyan Palette, Dark/Light mode support

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Giao diện hoàn thành 100%, responsive trên màn hình Desktop và Tablet, hiển thị đúng dữ liệu thật từ API.
- [x] Xử lý đầy đủ các trạng thái UX: Skeleton loading, Empty state khi chưa phân tích, Toast lỗi và thành công.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T016` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **VietTN**) review và chấp thuận nghiệm thu (Approved).

---

### 3.5. [DT-212] S3-T017 — [BE] Implement Competency-based Course Recommendation Engine API

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-212**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-212) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-07] Code Skill Gap Engine & Recommendation` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 4h) |
| **Giờ công dự tính** | **22 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 03/10/2026 ➔ 07/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Nhân viên có khoảng trống kỹ năng, tôi muốn nhận được danh sách khóa học gợi ý cá nhân hóa để đăng ký học tập, kèm lý do rõ ràng khóa học này giúp cải thiện những kỹ năng nào đang thiếu.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng engine gợi ý khóa học theo quy tắc suy diễn giải thích được (Explainable Rule-Based Recommendation) trong backend .NET 8:
1. **API Endpoints & Phân quyền:**
   - `POST /api/v1/intelligence/recommendations/generate`: Nhận `employeeId`, quét kết quả Skill Gap gần nhất và sinh danh sách gợi ý khóa học phù hợp nhất. Phân quyền `[HasPermission(Permissions.Intelligence.RecommendationGenerate)]`.
   - `GET /api/v1/intelligence/recommendations`: Truy vấn danh sách khóa học gợi ý dành riêng cho nhân viên đang đăng nhập. Phân quyền `[HasPermission(Permissions.Intelligence.RecommendationRead)]`.
2. **Quy trình ghép nối & Giải thuật xếp hạng (Recommendation Pipeline):**
   - Trích xuất toàn bộ `SkillGapItem` có $gap > 0$, sắp xếp theo $priorityScore$ giảm dần.
   - Quét danh mục khóa học trạng thái `PUBLISHED` có liên kết trong bảng `course_competencies` thỏa mãn: chuẩn đầu ra của khóa học bù đắp được năng lực đang thiếu hụt với $course\_target\_level \ge required\_level$.
   - Tính điểm độ tương thích khóa học:
     $$matchScore = \sum_{c \in GapsCovered} \left(priorityScore_c \times \frac{course\_target\_level_c}{3.0}\right)$$
   - Sinh chuỗi giải thích lý do tường minh (Explainability Rationale) hiển thị cho người học: Ví dụ *"Khóa học đào tạo kỹ năng 'Phân tích dữ liệu số' (Chuẩn đầu ra: Intermediate, Hiện tại của bạn: Basic - Kỹ năng bắt buộc vị trí)"*.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend Framework:** .NET 8, Clean Architecture, UseCase Pattern
- **Algorithms:** Deterministic Multi-attribute Matching, Scoring Weight Matrix, Explainable AI
- **Security:** `Permissions.Intelligence.RecommendationGenerate`, `Permissions.Intelligence.RecommendationRead`
- **Database Entities:** `Course`, `CourseCompetency`, `SkillGapRun`, `SkillGapItem`

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Mã nguồn hoàn thành 100%, kiểm thử trên Swagger API đạt kết quả gợi ý chính xác và có tính giải thích cao.
- [x] Thời gian xử lý API tối ưu < 200ms với tập dữ liệu kiểm thử.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T017` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 3.6. [DT-213] S3-T018 — [BE] Implement Domain Event trigger for auto-recalculating skill gap on exam pass

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-213**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-213) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-07] Code Skill Gap Engine & Recommendation` |
| **Phân hệ (Module)** | Khảo thí & Ngân hàng Đề thi (Assessment & Question Bank Engine) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 3h) |
| **Giờ công dự tính** | **13 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 07/10/2026 ➔ 09/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là hệ thống tự động hóa thông minh, khi nhân viên hoàn thành và vượt qua bài thi trắc nghiệm (Assessment Passed), hệ thống phải tự động cập nhật hồ sơ năng lực và kích hoạt tính toán lại Skill Gap mà không cần HR chạy thủ công.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thiết lập kiến trúc phản ứng sự kiện miền (Domain Events within Clean Architecture):
1. **Khai báo Event Miền:** Định nghĩa record `AssessmentPassedDomainEvent(Guid AttemptId, Guid EmployeeId, Guid AssessmentId, decimal FinalScore, DateTime PassedAt)`.
2. **Kích hoạt sự kiện:** Trong use-case nộp bài thi (`SubmitAssessmentAttemptUseCase`), khi điểm số đạt ngưỡng: `FinalScore >= Assessment.PassingScore`:
   - Cập nhật trạng thái `AssessmentAttempt.Status = PASSED`.
   - Dispatch sự kiện `AssessmentPassedDomainEvent` qua in-memory Event Bus / MediatR.
3. **Bộ xử lý sự kiện (`AssessmentPassedDomainEventHandler`):**
   - Truy vấn các competency gắn liền với bài thi trong bảng `assessment_competency_mappings`.
   - Cập nhật hoặc thêm mới bản ghi trong `employee_competency_profiles`, nâng `confirmed_level` lên mức năng lực được chứng nhận bởi bài thi.
   - Gọi UseCase `CalculateSkillGapUseCase` trong cùng Database Transaction để lập tức lưu một snapshot `SkillGapRun` mới.
   - Kích hoạt thông báo Realtime qua SignalR `NotificationHub` tới giao diện của nhân viên: *"Chúc mừng bạn đã vượt qua bài thi và nâng cấp năng lực thành công!"*.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Architecture Pattern:** Domain Events, MediatR Notifications, In-memory Event Bus
- **Realtime Notification:** SignalR WebSocket `/hubs/notifications`
- **Data Consistency:** Database Transaction Scope, Idempotent Event Handling
- **Database Entities:** `AssessmentAttempt`, `EmployeeCompetencyProfile`, `SkillGapRun`, `AuditLog`

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Cơ chế Domain Event hoạt động trơn tru: khi submit attempt đạt điểm đỗ, tự động ghi nhận profile và sinh snapshot skill gap mới.
- [x] Không gây lỗi khóa dòng hoặc nghẽn giao dịch khi chạy đồng thời.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T018` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 3.7. [DT-216] S3-T020 — Write automated unit tests for Skill Gap calculation & Recommendation engine

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-216**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-216) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-08] Code unit test and testing` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuyTD** (Công số review: 3h) |
| **Giờ công dự tính** | **11 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 09/10/2026 ➔ 10/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần đảm bảo các thuật toán chấm điểm độ lệch năng lực và gợi ý khóa học hoạt động chính xác 100% qua bộ kiểm thử tự động, tránh mọi sai lệch tính toán ảnh hưởng đến kết quả đánh giá nhân viên.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng bộ automated unit tests toàn diện trong project `backend/tests/DigiTalent.Tests/Intelligence/`:
1. **Kiểm thử Skill Gap Engine (`SkillGapEngineTests.cs`):**
   - Test case nhân viên chưa có confirmed level nào (toàn bộ requirement tính gap full).
   - Test case nhân viên đã đạt hoặc vượt chuẩn (gap $\le 0 \Rightarrow$ isMet = true).
   - Test case hệ số nhân ưu tiên cho năng lực bắt buộc (`MandatoryMultiplier = 1.5`).
   - Test case nhân viên chưa được gán JobPosition hoặc JobPosition chưa có Active Requirement Set (trả về ngoại lệ hoặc cảnh báo rõ ràng).
2. **Kiểm thử Recommendation Engine (`RecommendationEngineTests.cs`):**
   - Test case xếp hạng khóa học theo độ phủ gap cao nhất.
   - Test case loại bỏ các khóa học chưa xuất bản (`DRAFT` / `ARCHIVED`).
   - Test case format chuỗi giải thích (`Explanation`) chính xác.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Testing Framework:** xUnit, FluentAssertions, Moq
- **Test Paradigm:** AAA (Arrange - Act - Assert), Edge-case testing
- **CI Integration:** Chạy tự động trong GitHub Actions workflow `backend-ci.yml`

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Viết tối thiểu 15 unit test cases mới, tỷ lệ pass 100%, test coverage cho module Intelligence đạt $\ge 85\%$.
- [x] Lệnh `dotnet test backend/DigiTalent.sln` chạy pass không có cảnh báo.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T020` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuyTD**) review và chấp thuận nghiệm thu (Approved).

---

### 3.8. [DT-222] S3-T024 — Refine assessment retry rules & feedback display based on mentor feedback

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-222**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-222) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-10] Adjust system after review` |
| **Phân hệ (Module)** | Khảo thí & Ngân hàng Đề thi (Assessment & Question Bank Engine) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 2h) |
| **Giờ công dự tính** | **8 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 10/10/2026 ➔ 12/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Giảng viên và Nhân viên thi cử, chúng tôi cần hệ thống kiểm soát chặt chẽ quy chế thi lại (số lần tối đa, thời gian chờ giãn cách) và hiển thị phản hồi đáp án một cách sư phạm sau khi nộp bài theo đúng góp ý của Mentor.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Điều chỉnh và hoàn thiện logic khảo thí theo phản hồi từ buổi demo nghiệm thu với Mentor:
1. **Quy chế thi lại (Retry Policy):**
   - Kiểm tra `MaxAttempts`: Chặn tạo lượt thi mới (`POST /assessments/{id}/attempts`) khi nhân viên đã thi đủ số lần cho phép.
   - Khoảng thời gian giãn cách (`CooldownMinutes`): Yêu cầu nhân viên đợi tối thiểu thời gian quy định trước khi được thi lại lần tiếp theo.
2. **Cơ chế phản hồi đáp án (Feedback Display):**
   - Hỗ trợ cờ cấu hình `ShowAnswersImmediately`: Nếu `true`, hiển thị giải thích chi tiết cho từng câu trả lời đúng/sai sau khi nộp bài; nếu `false`, chỉ hiển thị tổng điểm và trạng thái Đạt/Không đạt để tránh lộ đề thi.
3. **Cập nhật giao diện làm bài thi:** Bổ sung modal cảnh báo số lần thi còn lại và đồng hồ đếm ngược thời gian chờ thi lại.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend:** C# / .NET 8, FluentValidation, Business Exception Handling (`ConflictException`)
- **Frontend:** React 19, Lucide Icons, Countdown Timer Component, Modal Dialog

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Logic kiểm tra lượt thi và hiển thị feedback hoạt động chính xác theo yêu cầu Mentor.
- [x] Kiểm thử Swagger và UI chạy trơn tru, không có bug phát sinh.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T024` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 3.9. [DT-224] S3-T025 — Update Report 3 - Document Learning, Assessment & Skill Gap Engine functions

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-224**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-224) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S3-PBI-11] Update report 3` |
| **Phân hệ (Module)** | Quản lý Khóa học & Lộ trình Học tập (Learning & Course Management) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 12/10/2026 ➔ 12/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm phụ trách kiến trúc và tài liệu, tôi cần cập nhật toàn diện Báo cáo đồ án 3 (Report 3 - Software Requirements Specification & System Features) phản ánh trung thực toàn bộ nghiệp vụ Khóa học, Khảo thí và Intelligence Engine đã xây dựng trong Sprint 3.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Biên soạn và hoàn thiện các nội dung kỹ thuật trong tập tài liệu Report 3:
1. **Đặc tả các hàm phi màn hình (Non-screen functions):**
   - NF-01: Calculate Skill Gap Snapshot (công thức, trigger, cấu trúc snapshot).
   - NF-02: Calculate Training Risk Score (các nhân tố inactivity, failed attempts, deadline pressure).
   - NF-03: Calculate Workforce Readiness Score (độ phủ competency theo vị trí).
2. **Đặc tả Use Case phân hệ Khóa học & Khảo thí:** Cập nhật UC-20 (Học bài giảng), UC-21 (Làm bài thi trắc nghiệm), UC-23 (Xem biểu đồ Skill Gap), UC-24 (Nhận gợi ý khóa học).
3. **Kiểm tra tính nhất quán:** Rà soát 100% khớp nối giữa sơ đồ dữ liệu, tên trường trong DB và các endpoints RESTful API thực tế.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Academic Writing:** IEEE 830 SRS Standard, FPT University Capstone Project Guidelines
- **Tools:** Microsoft Word, PlantUML / Mermaid diagrams, Markdown source tracking

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 3 được cập nhật đầy đủ, không còn nội dung giữ chỗ (placeholder), định dạng chuẩn chỉ.
- [x] Được Mentor và thành viên review chéo kiểm tra và chấp thuận nghiệm thu.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S3-T025` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---


<a id="sprint-4"></a>
## 🌟 SPRINT 4 (8 tasks — Tổng công: 110h)

### 4.1. [DT-232] S4-T001 — Plan Sprint 4 backlog & design cross-service evidence-certificate transactions

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-232**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-232) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-01] Sprint Planning & Backlog Refinement` |
| **Phân hệ (Module)** | Chứng chỉ Số & Xác thực Trực tuyến (Digital Certificate & QR Verification) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuyTD** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 14/10/2026 ➔ 14/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần lập kế hoạch Sprint 4 Backlog và thiết kế luồng giao dịch liên module (Cross-service transaction) giữa Đánh giá bài tập thực hành (Practical Task Evidence) và Phát hành Chứng chỉ số (Digital Certificate) đảm bảo tính toàn vẹn dữ liệu.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thực hiện công tác lập kế hoạch và thiết kế kiến trúc giao dịch Sprint 4:
1. **Phân rã Sprint Backlog:** Xác định 8 task trọng tâm cho phân hệ WMS-Lite Task, Evidence Portfolio và Certificate QR.
2. **Thiết kế giao dịch liên module:** Quy định điều kiện để kích hoạt phát hành chứng chỉ: Nhân viên phải hoàn thành 100% bài giảng + Đỗ bài thi trắc nghiệm cuối khóa + Được Quản lý/Mentor chấm Đạt bài tập thực hành tình huống.
3. **Cơ chế đảm bảo toàn vẹn dữ liệu:** Sử dụng Transaction Scope trong EF Core, đảm bảo nếu bước tạo file PDF chứng chỉ hoặc upload MinIO thất bại thì rollback trạng thái, không để xảy ra tình trạng cấp chứng chỉ "ma".

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Project Governance:** Jira Software Cloud, WBS Matrix, Sprint Burndown Chart
- **Architecture Design:** Transaction Scope, Database Concurrency Control, MinIO S3 Object Storage
- **Documentation:** Markdown, Microsoft Word (Capstone Report Package 4 §4.3)

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Kế hoạch Sprint 4 được phê duyệt trên Jira, sơ đồ luồng giao dịch liên module được thống nhất.
- [x] Tài liệu kiến trúc phân rã rõ ràng trách nhiệm BE và FE cho từng thành viên.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T001` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuyTD**) review và chấp thuận nghiệm thu (Approved).

---

### 4.2. [DT-236] S4-T003 — Design Evidence finalization transaction & feedback integration to Skill Gap

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-236**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-236) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-03] Design Certificate & Evidence Engine` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 3h) |
| **Giờ công dự tính** | **11 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 15/10/2026 ➔ 16/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Kiến trúc sư hệ thống, tôi cần thiết kế chu trình chốt bằng chứng năng lực (Evidence Finalization) từ kết quả chấm bài tập thực hành và cơ chế phản hồi tự động cập nhật độ hụt năng lực (Skill Gap) của nhân viên.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thiết kế chi tiết luồng xử lý dữ liệu và state machine cho phân hệ Bằng chứng năng lực:
1. **Vòng đời bài tập thực hành:** Chuyển trạng thái `TaskAssignment`: `ASSIGNED` ➔ `IN_PROGRESS` ➔ `SUBMITTED` ➔ `EVALUATED` (hoặc `REVISE_REQUESTED`).
2. **Quy trình chốt bằng chứng (Evidence Finalization):**
   - Khi Quản lý chấm Đạt: Hệ thống tự động tạo bản ghi `CompetencyEvidence` với loại `PRACTICAL_TASK`, lưu kèm link file bài nộp trên MinIO và điểm số.
   - Nâng cấp `ConfirmedLevel` trong `EmployeeCompetencyProfile` tương ứng với tiêu chuẩn đầu ra của bài tập.
3. **Vòng lặp phản hồi (Feedback Loop):** Tự động phát tín hiệu tính lại snapshot Skill Gap (`SkillGapRun`) và điểm sẵn sàng (`ReadinessScore`), giúp biểu đồ radar của nhân viên lập tức phản ánh kỹ năng mới được chứng minh.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **System Modeling:** State Machine Diagram, Sequence Diagram, DFD Level 1 & 2
- **Data Model:** Entity `TaskSubmission`, `TaskEvaluation`, `CompetencyEvidence`, `EmployeeCompetencyProfile`
- **Standards:** Work-based Assessment Standards, Audit Trail Logging

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bản thiết kế chi tiết chu trình chốt bằng chứng và vòng lặp phản hồi được hoàn thiện và thông qua.
- [x] Định nghĩa đầy đủ các trường dữ liệu và ràng buộc toàn vẹn khóa ngoại (FK Restrict).
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T003` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 4.3. [DT-248] S4-T013 — [FE] Build Manager Submission Review page & Evidence Portfolio view (Scoring rubric)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-248**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-248) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-05] Code Practical Task & Evidence (WMS-Lite)` |
| **Phân hệ (Module)** | Bài tập Thực hành & Bằng chứng Năng lực (Practical Task & Evidence Management - WMS-Lite) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **VietTN** (Công số review: 5h) |
| **Giờ công dự tính** | **25 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 21/10/2026 ➔ 24/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Quản lý phòng ban hoặc Giảng viên, tôi muốn có trang giao diện chấm điểm bài nộp thực hành của nhân viên theo thang điểm Rubric rõ ràng, xem tài liệu đính kèm và xác nhận năng lực đạt được.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Phát triển giao diện chấm bài nộp tương tác cao bằng React 19, TypeScript và Tailwind CSS 4:
1. **Trang duyệt bài nộp (`features/task/pages/TaskEvaluationPage.tsx`):**
   - Danh sách bài nộp cần chấm (`SUBMITTED`), lọc theo nhân viên, phòng ban, bài tập thực hành.
   - Panel chi tiết bài nộp: Hiển thị ghi chú của học viên, liên kết tải/xem trước tài liệu minh chứng (`TaskSubmissionFile`) được stream an toàn qua backend file storage (`/api/v1/files/{*storagePath}`).
2. **Form chấm điểm theo Rubric (Scoring Rubric Component):**
   - Hiển thị danh sách các tiêu chí thành phần kèm trọng số phần trăm định sẵn từ `PracticalTaskTemplate`.
   - Thanh trượt hoặc ô nhập điểm cho từng tiêu chí, tự động tính tổng điểm theo thang 100 theo thời gian thực.
   - Checkbox xác nhận các năng lực được công nhận (`Confirmed Competencies & Target Levels`).
   - Ô phản hồi/nhận xét và 2 nút hành động: "Duyệt & Công nhận năng lực" (`PASSED`) hoặc "Yêu cầu chỉnh sửa/nộp lại" (`REVISE_REQUESTED`).
3. **Khả năng tái sử dụng mô-đun (Dual-Route Evidence Reusability):**
   - Tuyến Doanh nghiệp (`/enterprise/tasks`): Dành cho Quản lý / Mentor chấm điểm Rubric và phê duyệt bằng chứng năng lực.
   - Tuyến Người học cá nhân (`/learn/tasks` & `/learn/classroom/:id`): Tái sử dụng form Rubric (ở chế độ xem tiêu chí) và panel nộp tài liệu minh chứng (`File Upload`) để học viên tự do nộp dự án thực hành và theo dõi kết quả đánh giá.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Shadcn/UI
- **Components:** Dialog/Modal, Table, Slider, Badge, Textarea, Tooltip
- **State & Networking:** TanStack React Query v5, Axios `apiClient`, Sonner Toast

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Giao diện hoàn thành 100%, kết nối API thực tế, tính toán điểm Rubric chuẩn xác theo thời gian thực.
- [x] Xử lý mượt mà việc tải file đính kèm và hiển thị thông báo phản hồi sau khi chấm.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T013` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **VietTN**) review và chấp thuận nghiệm thu (Approved).

---

### 4.4. [DT-249] S4-T014 — [BE] Implement Submission Review, Grading & Competency Evidence finalization API

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-249**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-249) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-05] Code Practical Task & Evidence (WMS-Lite)` |
| **Phân hệ (Module)** | Bài tập Thực hành & Bằng chứng Năng lực (Practical Task & Evidence Management - WMS-Lite) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 6h) |
| **Giờ công dự tính** | **32 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 22/10/2026 ➔ 26/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Quản lý / Mentor, tôi muốn có API để nộp kết quả chấm điểm bài tập thực hành, phê duyệt bài nộp và tự động chính thức hóa thành bằng chứng năng lực (Competency Evidence) có giá trị kiểm toán.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng cụm RESTful API endpoints trong backend .NET 8 theo Clean Architecture & UseCase Pattern:
1. **API Endpoints & Phân quyền bảo mật:**
   - `POST /api/v1/task-assignments/{assignmentId}/evaluations`: Chấm bài, phê duyệt điểm Rubric và chốt bằng chứng năng lực. Phân quyền `[HasPermission(Permissions.Task.Evaluate)]`.
   - `GET /api/v1/task-assignments/{assignmentId}`: Xem chi tiết phân công, bài nộp, file đính kèm và lịch sử chấm điểm. Phân quyền `[HasPermission(Permissions.Task.Read)]`.
   - `POST /api/v1/files/upload`: Tải lên tài liệu minh chứng dạng PDF, DOCX, ZIP qua `IFileStorageService`.
2. **Quy trình nghiệp vụ thực thi (EvaluateTaskUseCase):**
   - Thư mục: `backend/src/DigiTalent.Application/UseCases/Task/EvaluateTask/` (`EvaluateTaskUseCase`).
   - Kiểm tra quyền hạn phạm vi phòng ban (Department Scoping): Người chấm phải là Quản lý trực tiếp (`ICurrentUser.DepartmentId == Employee.DepartmentId`) hoặc Giảng viên được phân công.
   - Tạo bản ghi `TaskEvaluation` (lưu `score`, `feedback`, `evaluator_id`, `evaluated_at`).
   - Nếu điểm đạt ngưỡng (`score >= PassingScore`): Cập nhật `TaskAssignment.Status = COMPLETED`, tự động tạo bản ghi `CompetencyEvidence` liên kết với file bài nộp `TaskSubmissionFile`, ghi nhận loại nguồn `EVIDENCE_TYPE_PRACTICAL_TASK`.
   - Nếu không đạt: Cập nhật `TaskAssignment.Status = REVISE_REQUESTED` để học viên nộp lại.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend Framework:** .NET 8 (C# 12), ASP.NET Core Web API, UseCase pattern
- **Database ORM:** EF Core 8, Npgsql, PostgreSQL 16 (Bảng `practical_task_templates`, `task_assignments`, `task_submissions`, `task_submission_files`, `task_evaluations`, `competency_evidences`)
- **File Storage:** `IFileStorageService`, `LocalFileStorageService` / MinIO Object Storage
- **Security:** `Permissions.Task.Evaluate`, `Permissions.Task.Read`, Department Scoping verification

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Mã nguồn hoàn thành 100%, kiểm thử trên Swagger API chạy pass cả 2 trường hợp: Đạt và Yêu cầu nộp lại.
- [x] Ghi nhận chính xác bằng chứng vào `competency_evidences` với đầy đủ liên kết audit log.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T014` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 4.5. [DT-256] S4-T018 — [BE] Implement Evidence-to-Skill-Gap feedback recalculation loop

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-256**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-256) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-08] Code Skill Gap Engine & Recommendation` |
| **Phân hệ (Module)** | Phân tích Khoảng cách Năng lực & Chỉ số Sẵn sàng (Skill Gap & Readiness Intelligence) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 3h) |
| **Giờ công dự tính** | **14 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 23/10/2026 ➔ 26/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là hệ thống tự động hóa thông minh, ngay khi bằng chứng năng lực thực tế được Quản lý phê duyệt, hệ thống phải tự động cập nhật hồ sơ năng lực nhân viên và tính toán lại Skill Gap để phản ánh ngay sự tiến bộ.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Hiện thực hóa vòng lặp phản hồi dữ liệu khép kín (Closed-loop Capability Feedback):
1. **Kích hoạt sự kiện miền:** Trong `EvaluateTaskUseCase`, sau khi lưu thành công `CompetencyEvidence`, dispatch domain event `PracticalTaskEvaluatedDomainEvent(EmployeeId, TaskAssignmentId, ConfirmedCompetencies, PassedAt)`.
2. **Xử lý sự kiện (`PracticalTaskEvaluatedEventHandler`):**
   - Cập nhật hồ sơ năng lực: Đối chiếu danh sách năng lực được xác nhận, cập nhật bản ghi trong `employee_competency_profiles` với $confirmed\_level = \max(current\_confirmed\_level, newly\_evaluated\_level)$.
   - Gọi trực tiếp UseCase `CalculateSkillGapUseCase` để tạo snapshot `SkillGapRun` mới nhất.
   - Kích hoạt tính lại chỉ số sẵn sàng `CalculateWorkforceReadinessUseCase` (NF-03) để lưu vào `readiness_scores` và cập nhật `training_risk_scores`.
3. **Đảm bảo tính nhất quán & Realtime:**
   - Thực thi trọn vẹn trong cùng một Database Transaction, ghi vết kiểm toán vào `AuditLog`.
   - Gửi thông báo SignalR realtime tới ứng dụng frontend của nhân viên để tự động refresh biểu đồ radar.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Architecture Pattern:** Domain Events, MediatR, In-process Event Dispatcher, SignalR Realtime Hub
- **Database Entities:** `employee_competency_profiles`, `skill_gap_runs`, `skill_gap_items`, `readiness_scores`, `training_risk_scores`, `audit_logs`
- **Data Integrity:** ACID Transaction, Idempotency Check

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Vòng lặp phản hồi hoạt động tự động 100%: chấm bài đạt ➔ cập nhật profile ➔ tính lại skill gap ➔ cập nhật readiness score.
- [x] Không gây race-condition hoặc lock dữ liệu khi nhiều quản lý chấm bài cùng lúc.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T018` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 4.6. [DT-259] S4-T020 — Write automated unit tests for Certificate generation & QR verification algorithms

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-259**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-259) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-09] Code unit test and testing` |
| **Phân hệ (Module)** | Chứng chỉ Số & Xác thực Trực tuyến (Digital Certificate & QR Verification) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuyTD** (Công số review: 3h) |
| **Giờ công dự tính** | **11 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 26/10/2026 ➔ 27/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần đảm bảo tính toàn vẹn và bảo mật của thuật toán sinh mã chứng chỉ số duy nhất, chữ ký số băm xác thực và mã QR xác thực công khai qua bộ kiểm thử tự động.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Xây dựng bộ automated unit tests trong project `backend/tests/DigiTalent.Tests/Certificate/`:
1. **Kiểm thử Thuật toán Sinh mã Chứng chỉ (`CertificateCodeGeneratorTests.cs`):**
   - Kiểm tra tính duy nhất (Uniqueness) của mã chứng chỉ: `DT-CERT-{YEAR}-{UNIQUE_CODE}`.
   - Kiểm tra mã hash chống giả mạo HMAC-SHA256 kết hợp giữa EmployeeId, CourseId và thời điểm cấp.
2. **Kiểm thử Xác thực QR Code & Public Registry (`CertificateVerificationTests.cs`):**
   - Test case xác minh chứng chỉ hợp lệ (`VALID`): Endpoint công khai `GET /api/v1/certificates/verify/{certificateCode}` trả về tên người nhận, tên khóa học, ngày cấp, danh sách năng lực đạt được.
   - Test case chứng chỉ bị thu hồi (`REVOKED`): Trả về cảnh báo chứng chỉ đã bị vô hiệu hóa kèm lý do thu hồi.
   - Test case mã chứng chỉ không tồn tại hoặc bị sửa đổi (`404 NOT FOUND` / `INVALID_SIGNATURE`).
   - Kiểm tra tự động ghi log vào bảng `certificate_verification_logs` mỗi khi có lượt quét QR từ thiết bị di động.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Testing Framework:** xUnit, FluentAssertions, Moq
- **Cryptographic Testing:** SHA256 / HMAC validation, Entropy test
- **CI Integration:** Chạy tự động trong GitHub Actions pipeline

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bộ test cases hoàn thành với tối thiểu 12 kịch bản kiểm thử bảo mật và thuật toán, tỷ lệ pass 100%.
- [x] Lệnh `dotnet test backend/DigiTalent.sln` chạy pass không có cảnh báo.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T020` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuyTD**) review và chấp thuận nghiệm thu (Approved).

---

### 4.7. [DT-270] S4-T027 — Update Report 4 - Document MinIO integration architecture & QR security design

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-270**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-270) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-13] Update report 4` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 2h) |
| **Giờ công dự tính** | **8 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 27/10/2026 ➔ 27/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Kiến trúc sư giải pháp, tôi cần văn bản hóa kiến trúc tích hợp hệ thống lưu trữ MinIO Object Storage và cơ chế bảo mật xác thực chứng chỉ số bằng mã QR trong Báo cáo thiết kế phần mềm (Report 4 - Software Design Document).

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Soạn thảo và cập nhật các phần kỹ thuật chuyên sâu trong tài liệu Report 4 (SDD):
1. **Kiến trúc Lưu trữ tệp tin đa môi trường (`IFileStorageService`):**
   - Mô hình tích hợp trừu tượng: `LocalFileStorageService` cho môi trường phát triển và kiểm thử local; `MinIO / S3 Object Storage` cho môi trường Staging/Production.
   - Cấu trúc phân vùng: `materials` (tài liệu khóa học), `submissions` (file bài nộp thực hành), `certificates` (PDF chứng chỉ đã phát hành).
   - Cơ chế bảo vệ tệp tin: Kiểm tra MIME type, giới hạn dung lượng tối đa (25MB), sinh đường dẫn lưu trữ ngẫu nhiên chống ghi đè và tấn công Path Traversal.
2. **Thiết kế Bảo mật Xác thực Chứng chỉ (QR Verification Security):**
   - Cơ chế băm một chiều HMAC-SHA256 bảo đảm tính toàn vẹn (Tamper-evident verification).
   - Sơ đồ tuần tự (Sequence Diagram) luồng quét mã QR từ camera điện thoại di động truy cập trực tiếp trang xác minh công khai `/verify/{code}` không yêu cầu đăng nhập.
3. **Từ điển cơ sở dữ liệu Phase 4:** Cập nhật bảng `certificates`, `certificate_templates`, `certificate_verification_logs`, `practical_task_templates`, `task_assignments`, `task_submissions`, `task_submission_files`, `task_evaluations`, `competency_evidences`.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Software Architecture:** C4 Model Component Diagram, UML Sequence Diagrams
- **Security Standards:** ISO/IEC 27001 File Storage Security, OWASP Cryptographic Storage
- **Tools:** Microsoft Word, Draw.io / Mermaid, Markdown Source

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 4 được cập nhật đầy đủ các chương mục về MinIO và QR Security, hình vẽ sắc nét.
- [x] Kiểm tra chéo khớp nối 100% với mã nguồn và cấu hình `docker-compose.yml`.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T027` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 4.8. [DT-274] S4-T029 — Conduct Sprint 4 review, demo QR Certificate verification on mobile to mentor

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-274**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-274) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S4-PBI-15] Sprint Review & Retrospective` |
| **Phân hệ (Module)** | Chứng chỉ Số & Xác thực Trực tuyến (Digital Certificate & QR Verification) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 1h) |
| **Giờ công dự tính** | **4 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 28/10/2026 ➔ 28/10/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm Scrum, tôi cần điều phối buổi demo sản phẩm thực tế Sprint 4 cho Giảng viên hướng dẫn (Mentor), trọng tâm là kịch bản quét mã QR chứng chỉ trên điện thoại di động thực tế và tổ chức họp cải tiến quy trình (Retrospective).

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Tổ chức và điều phối phiên đánh giá nghiệm thu Sprint 4:
1. **Chuẩn bị kịch bản Demo (Live Demo Script):**
   - Tạo bài tập thực hành mẫu ➔ Nhân viên nộp file tài liệu ➔ Quản lý chấm điểm và duyệt bằng chứng ➔ Hệ thống tự động cấp Chứng chỉ số kèm mã QR.
   - Sử dụng camera điện thoại quét trực tiếp mã QR trên màn hình, mở trang công khai `/verify/{code}` và chứng minh tính hợp lệ.
2. **Tổng kết số liệu Sprint:** Đo lường Velocity, tỷ lệ hoàn thành công số (Burn-down chart), đánh giá chất lượng code.
3. **Biên bản Retrospective:** Ghi nhận phản hồi của Mentor, rút kinh nghiệm về tối ưu hóa hiệu năng render PDF và chuẩn bị cho Sprint 5.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Scrum Framework:** Sprint Review, Sprint Retrospective, DoD Audit
- **Demonstration:** Real-device Mobile Testing, Live QR Code Scanner
- **Documentation:** Meeting Minutes, Mentor Feedback Tracking Sheet

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Buổi demo trực tiếp cho Mentor diễn ra thành công, chức năng quét QR hoạt động trơn tru không lỗi.
- [x] Biên bản nghiệm thu và tài liệu cải tiến Sprint được ghi nhận và lưu trữ trong hồ sơ dự án.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S4-T029` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---


<a id="sprint-5"></a>
## 🌟 SPRINT 5 (5 tasks — Tổng công: 68h)

### 5.1. [DT-286] S5-T007 — [BE] Implement Department Data Scoping & multi-tenant isolation filter (EF QueryFilter)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-286**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-286) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S5-PBI-05] Code Audit Trail & Department Scope` |
| **Phân hệ (Module)** | Quản trị Cơ cấu Tổ chức & Nhân sự (Organization & Employee Management) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 4h) |
| **Giờ công dự tính** | **18 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 31/10/2026 ➔ 03/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng phòng ban (Department Manager), tôi chỉ được phép xem danh sách nhân viên, gán bài tập, duyệt bài nộp và theo dõi chỉ số sẵn sàng của các nhân viên thuộc phòng ban mình phụ trách, tuyệt đối không được truy cập trái phép dữ liệu của phòng ban khác.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thiết lập cơ chế kiểm soát phạm vi dữ liệu phân cấp (Department Scoping & Data Isolation) kết hợp giữa `ICurrentUser` và EF Core:
1. **Mô hình tích hợp `ICurrentUser`:**
   - Khai báo các thuộc tính nghiệp vụ trong `ICurrentUser`: `UserId`, `EmployeeId`, `DepartmentId`, `GetRequiredDepartmentId()`, `IsInRole(string role)`, `IsAdmin`, `IsDepartmentManager`.
   - Giá trị được trích xuất tự động từ JWT Claims trong mỗi HTTP Request qua `CurrentUser` service.
2. **Cấu hình kiểm soát truy vấn trong `AppDbContext.cs` & UseCases:**
   - Áp dụng trên các thực thể nhạy cảm: `Employee`, `TaskAssignment`, `CourseAssignment`, `LearnerProfile`, `SkillGapRun`.
   - Quy tắc lọc dữ liệu:
     ```csharp
     modelBuilder.Entity<Employee>().HasQueryFilter(e =>
         _currentUser.IsAdmin ||
         _currentUser.IsInRole(Roles.HrManager) ||
         e.DepartmentId == _currentUser.DepartmentId);
     ```
   - Quản trị viên (`SYSTEM_ADMIN`) và Nhân sự (`HR_MANAGER`) được xem toàn bộ dữ liệu tổ chức; Trưởng phòng ban (`DEPARTMENT_MANAGER`) tự động bị giới hạn theo `_currentUser.DepartmentId`.
   - Ngăn chặn triệt để lỗ hổng BOLA / IDOR: Chặn mọi hành vi sửa/xóa/đọc chéo bản ghi của phòng ban khác thông qua can thiệp tham số ID trên URL.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Backend Security:** EF Core 8 Global Query Filters, Claims-based Data Scoping, `ICurrentUser` abstraction
- **Access Control:** Multi-tenant & Department Isolation Pattern, OWASP IDOR Prevention
- **Testing:** Unit tests kiểm tra ranh giới dữ liệu giữa 2 phòng ban khác nhau

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bộ lọc EF Core QueryFilter hoạt động hoàn hảo trên mọi truy vấn: Manager không thể query hoặc mutate dữ liệu ngoài phòng ban mình.
- [x] Toàn bộ test case phân quyền phòng ban chạy pass 100%.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S5-T007` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 5.2. [DT-298] S5-T015 — [DB] Seed comprehensive demo dataset for enterprise case study (100 employees, 5 departments)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-298**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-298) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S5-PBI-09] System Hardening & UI/UX Polish` |
| **Phân hệ (Module)** | Quản trị Cơ cấu Tổ chức & Nhân sự (Organization & Employee Management) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 3h) |
| **Giờ công dự tính** | **16 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 03/11/2026 ➔ 05/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là nhóm thực hiện đồ án, chúng tôi cần nạp một bộ dữ liệu mẫu doanh nghiệp quy mô thực tế (100 nhân sự, 5 phòng ban, đầy đủ dữ liệu học tập, thi cử và chứng chỉ) theo đúng case study Báo cáo 1 để phục vụ diễn tập và bảo vệ đồ án tốt nghiệp xuất sắc trước Hội đồng.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thiết kế và lập trình tập dữ liệu mẫu toàn diện (Enterprise Seeding Dataset) trong `DbSeeder.cs` và file SQL:
1. **Cơ cấu tổ chức doanh nghiệp mẫu chuẩn hóa:**
   - 5 phòng ban: Công nghệ thông tin (IT/Engineering), Sản phẩm (Product & Design), Marketing & Tăng trưởng (Marketing & Growth), Kinh doanh (Sales & BD), Vận hành & Nhân sự (Operations & HR).
   - 15 chức danh vị trí (`JobPosition`) chuẩn hóa kèm bộ tiêu chuẩn năng lực (`PositionRequirementSet` phiên bản Active) gắn với 25 năng lực DigComp 2.2/3.0.
2. **100 hồ sơ nhân sự chân thực & phân bổ tài khoản:**
   - 100 nhân viên đầy đủ mã nhân viên, họ tên, email công vụ, ngày vào làm, trình độ chuyên môn.
   - Tài khoản đăng nhập tương ứng phân bổ theo 5 vai trò hệ thống: 1 `SYSTEM_ADMIN`, 3 `HR_MANAGER`, 5 `DEPARTMENT_MANAGER`, 6 `TRAINER`, 85 `EMPLOYEE`.
3. **Dữ liệu hoạt động sinh động:**
   - 10 khóa học trực tuyến hoàn chỉnh với module, bài giảng và ngân hàng câu hỏi khảo thí.
   - Hơn 200 lượt ghi danh (`Enrollment`), 150 bài nộp thực hành (`TaskSubmission`), 300 lượt thi trắc nghiệm (`AssessmentAttempt`).
   - Dữ liệu snapshot Skill Gap (`SkillGapRun`) và chỉ số sẵn sàng (`ReadinessScore`) phản ánh các phân nhóm nhân viên rõ rệt (Nhân viên sẵn sàng cao, Nhân viên cần đào tạo bổ sung, Nhân viên có rủi ro đào tạo cao) để trình diễn các widget trên Dashboard.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Database:** PostgreSQL 16, EF Core Seeding API, Bogus Data Generator
- **Data Consistency:** Foreign Key Integrity, Deterministic Seed GUIDs
- **Environment:** Tự động kích hoạt khi chạy ở môi trường Development/Staging

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Lệnh chạy seed hoàn thành trong < 15 giây, dữ liệu sinh ra logic, không bị xung đột khóa ngoại.
- [x] Các màn hình biểu đồ Dashboard, Radar Chart và Heatmap hiển thị đầy đủ, đẹp mắt và phong phú dữ liệu.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S5-T015` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 5.3. [DT-303] S5-T019 — Conduct application security audit (OWASP Top 10) & K6 load testing (100 CCU)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-303**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-303) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S5-PBI-10] Code unit test and testing` |
| **Phân hệ (Module)** | Phát triển Tính năng Nền tảng (Platform Core Development) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 3h) |
| **Giờ công dự tính** | **16 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 05/11/2026 ➔ 07/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần đảm bảo hệ thống đạt chuẩn an toàn bảo mật OWASP Top 10 và có khả năng chịu tải ổn định tối thiểu 100 người dùng đồng thời (CCU) phục vụ các đợt thi đánh giá năng lực định kỳ của doanh nghiệp.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thực hiện đánh giá bảo mật và kiểm thử tải chuyên sâu:
1. **Kiểm thử Bảo mật OWASP Top 10:**
   - **Broken Authentication:** Kiểm thử cơ chế Token Rotation (RFC 6749) và Compromised Token Reuse Detection trong `RefreshTokenUseCase`. Thử nghiệm tái sử dụng Refresh Token cũ ➔ hệ thống lập tức thu hồi toàn bộ token family của user.
   - **Broken Access Control:** Kiểm tra ma trận 114 permissions và cơ chế lọc phòng ban, kiểm tra lỗi leo thang quyền hạn (Privilege Escalation).
   - **Injection:** Đảm bảo 100% truy vấn qua EF Core tham số hóa, không có SQL injection.
   - **Cryptographic Failures:** Xác thực mã hóa mật khẩu BCrypt, chữ ký số HMAC-SHA256 cho chứng chỉ QR và tiêu đề HTTP an ninh (CSP, HSTS, X-Content-Type-Options).
2. **Kiểm thử Tải & Hiệu năng với k6 (K6 Load Testing):**
   - Viết kịch bản k6 (`scripts/k6/load-test.js`): Giả lập 100 người dùng đồng thời (100 CCU) thực hiện chuỗi hành vi: Đăng nhập ➔ Truy cập Dashboard ➔ Làm bài thi khảo thí ➔ Nộp bài và kích hoạt tính toán Skill Gap.
   - Tiêu chí đánh giá: Tỷ lệ lỗi (Error rate) < 1%, Độ trễ phản hồi P95 < 500ms, CPU backend < 75%, Bộ nhớ RAM tiêu thụ ổn định không bị rò rỉ (Zero Memory Leak).

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Security Tools:** OWASP ZAP, SonarQube, RFC 6749 Token Rotation, BCrypt hashing
- **Performance Testing:** Grafana k6, K6 Cloud / InfluxDB + Grafana Dashboard
- **Standard:** OWASP Top 10 2021, ISO 25010 Software Quality

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Không còn lỗ hổng mức High hoặc Critical nào từ báo cáo OWASP ZAP.
- [x] Kịch bản k6 100 CCU chạy hoàn thành với P95 latency < 500ms và 0% request drop.
- [x] Báo cáo kết quả kiểm thử bảo mật và tải được xuất ra file PDF đưa vào phụ lục đồ án.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 5.4. [DT-312] S5-T024 — Finalize Report 4 - Complete Software Design Document (SDD Architecture Package)

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-312**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-312) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S5-PBI-14] Update report 4` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 2h) |
| **Giờ công dự tính** | **8 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 07/11/2026 ➔ 09/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Kiến trúc sư trưởng của đồ án, tôi cần hoàn thiện toàn diện tập tài liệu Báo cáo 4 (Report 4 - Software Design Document) mô tả chi tiết toàn bộ thiết kế kiến trúc, thiết kế cơ sở dữ liệu và thiết kế giao diện theo đúng tiêu chuẩn học thuật Đại học FPT.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Tổng hợp, hoàn thiện và chuẩn hóa 100% tài liệu Report 4 (SDD):
1. **Kiến trúc Hệ thống (System Architecture):**
   - Mô hình C4 Model 4 cấp độ: Context, Container, Component (Clean Architecture: Domain, Application, Infrastructure, Api), Code.
   - Sơ đồ triển khai hạ tầng Docker Compose, Nginx Reverse Proxy, File Storage Service, PostgreSQL 16.
2. **Thiết kế Cơ sở Dữ liệu Chi tiết (Database Detailed Design):**
   - Sơ đồ quan hệ thực thể ERD đầy đủ 59 bảng theo chuẩn SQL Canonical v2.3.
   - Từ điển cơ sở dữ liệu (Data Dictionary): Tên cột, kiểu dữ liệu, ràng buộc khóa chính/ngoại, chỉ mục B-tree.
3. **Thiết kế Bảo mật & Phân quyền:** Ma trận RBAC 114 permissions qua 11 phân hệ, 5 vai trò hệ thống kết hợp kiểm soát dữ liệu phòng ban, chính sách bảo vệ token JWT và băm mật khẩu BCrypt.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Academic Writing:** IEEE 1016 Software Design Description, FPT Capstone Template
- **Diagramming:** Draw.io, PlantUML, C4-PlantUML
- **Documentation:** Microsoft Word, PDF Export, Markdown tracking

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tài liệu Report 4 hoàn chỉnh 100%, không còn lỗi placeholder, mục lục tự động và chú thích hình ảnh chuẩn chỉ.
- [x] Được Mentor hướng dẫn xem xét và đồng ý nghiệm thu thông qua.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S5-T024` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 5.5. [DT-318] S5-T027 — Draft Report 7 - Final project report, project objectives achievement & evaluation

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-318**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-318) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S5-PBI-17] Update report 7` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 2h) |
| **Giờ công dự tính** | **10 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 09/11/2026 ➔ 10/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm, tôi cần khởi thảo bản sơ thảo Báo cáo tổng kết đồ án tốt nghiệp (Report 7 - Final Project Report) đánh giá mức độ đạt được của các mục tiêu dự án đã cam kết từ đầu kỳ.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Biên soạn các chương mở đầu và nội dung trọng tâm của Report 7:
1. **Đánh giá mức độ hoàn thành mục tiêu (Project Objectives Achievement):**
   - So sánh đối chiếu 46 Use Cases đã cam kết tại BRD/SRS với sản phẩm thực tế triển khai.
   - Thống kê tỷ lệ hoàn thành các phân hệ: Quản trị tổ chức (100%), Khung năng lực (100%), Đào tạo (100%), Khảo thí (100%), Chứng chỉ số QR (100%), Intelligence Engine (100%).
2. **Tổng hợp số liệu dự án:**
   - Tổng công số thực tế đạt 587 giờ, chỉ số Sprint Velocity qua 5 Sprint, tỷ lệ khắc phục lỗi kiểm thử.
3. **Phân tích bài học kinh nghiệm:** Đánh giá ưu điểm về mặt công nghệ (.NET 8 Clean Architecture, React 19) và các khó khăn đã vượt qua trong quá trình tích hợp.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Project Evaluation:** Scrum Metrics, Earned Value Analysis (EVA), Burndown Chart
- **Documentation:** Microsoft Word, FPT University Graduation Report Package 7

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Bản dự thảo Report 7 hoàn thành các chương mục trọng yếu, số liệu khớp chính xác với file tracking Excel.
- [x] Nhóm họp rà soát và thống nhất nội dung tự đánh giá đồ án.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S5-T027` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

<a id="sprint-6"></a>
## 🌟 SPRINT 6 (5 tasks — Tổng công: 67h)

### 6.1. [DT-322] S6-T001 — Plan Sprint 6, production deployment schedule & UAT testing logistics

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-322**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-322) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S6-PBI-01] Release Planning & UAT Schedule` |
| **Phân hệ (Module)** | Phát triển Tính năng Nền tảng (Platform Core Development) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 1h) |
| **Giờ công dự tính** | **5 giờ** |
| **Độ phức tạp (Level)** | `Simple` |
| **Kế hoạch thực hiện** | 12/11/2026 ➔ 12/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm Scrum, tôi cần lập kế hoạch chi tiết cho Sprint 6 (Sprint đóng gói cuối cùng), lên lịch trình kiểm thử chấp nhận người dùng (UAT) và chuẩn bị phương án triển khai hệ thống lên môi trường Production trước Hội đồng bảo vệ.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Lập kế hoạch phân bổ công việc và quản trị rủi ro giai đoạn về đích:
1. **Lịch trình UAT:** Phân bổ các phiên kiểm thử với 10-15 người dùng đại diện trong 3 ngày, chuẩn bị tài liệu hướng dẫn và biểu mẫu ghi nhận lỗi.
2. **Kế hoạch triển khai Production:**
   - Kiểm tra cấu hình Docker Compose Production (`docker-compose.prod.yml`), chuẩn bị tên miền và chứng chỉ SSL Let's Encrypt.
   - Thiết lập quy trình sao lưu cơ sở dữ liệu tự động (`pg_dump`) và kịch bản phục hồi khi có sự cố.
3. **Đóng băng mã nguồn (Code Freeze):** Quy định thời điểm dừng bổ sung tính năng mới để tập trung 100% công số cho kiểm thử hồi quy (Regression Testing) và sửa lỗi.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **DevOps Planning:** Production Deployment Checklist, Rollback Strategy, Code Freeze Policy
- **UAT Logistics:** Test Scenario Matrix, Feedback Collection Forms, Jira Bug Triage

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Kế hoạch Sprint 6 và lịch trình UAT được ban hành và phổ biến cho toàn bộ đội ngũ.
- [x] Môi trường Production Staging được dựng sẵn sàng để tiến hành UAT.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S6-T001` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---

### 6.2. [DT-330] S6-T007 — Coordinate UAT test sessions with representative users & record feedback log

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-330**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-330) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S6-PBI-03] User Acceptance Testing (UAT) & Regress` |
| **Phân hệ (Module)** | Phát triển Tính năng Nền tảng (Platform Core Development) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuyTD** (Công số review: 4h) |
| **Giờ công dự tính** | **25 giờ** |
| **Độ phức tạp (Level)** | `Complex` |
| **Kế hoạch thực hiện** | 17/11/2026 ➔ 19/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là người điều phối kiểm thử, tôi cần tổ chức các phiên kiểm thử người dùng thực tế (UAT) với các vai trò đại diện doanh nghiệp (Admin, HR, Manager, Trainer, Employee) nhằm nghiệm thu mức độ đáp ứng nghiệp vụ và tính dễ sử dụng của sản phẩm.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Điều phối và trực tiếp giám sát các phiên kiểm thử chấp nhận người dùng theo 5 vai trò nghiệp vụ (Personas):
1. **Điều phối 5 kịch bản kiểm thử luồng chính (5-Act User Journey):**
   - **Act 1 (HR Manager):** Thiết lập cơ cấu phòng ban, tạo chức danh công việc, cấu hình bộ tiêu chuẩn năng lực DigComp 3 mức (Basic / Intermediate / Advanced), kích hoạt phiên bản chính thức.
   - **Act 2 (Trainer):** Soạn thảo khóa học, upload slide bài giảng, tạo ngân hàng câu hỏi trắc nghiệm, cấu hình quy chế thi lại và ngưỡng điểm đạt.
   - **Act 3 (Employee):** Đăng nhập học bài giảng, nộp bài thi khảo thí, xem biểu đồ mạng nhện đa giác (Radar Chart) so sánh năng lực và nhận danh sách khóa học gợi ý cá nhân hóa.
   - **Act 4 (Department Manager):** Giao bài tập tình huống thực hành (WMS-Lite), thẩm định bài nộp kèm file đính kèm, chấm điểm theo Rubric và công nhận bằng chứng năng lực.
   - **Act 5 (Verifier / Public):** Quét mã QR trên chứng chỉ số bằng camera điện thoại thực tế, mở trang công khai `/verify/{code}` để kiểm tra chữ ký số HMAC-SHA256 mà không cần đăng nhập.
2. **Ghi nhận và phân loại lỗi (Defect Triage):**
   - Thu thập biên bản đánh giá từ 12 người dùng tham gia kiểm thử, lập bảng theo dõi phản hồi (`UAT_Feedback_Log.xlsx`).
   - Phân loại lỗi theo mức độ nghiêm trọng (Blocker: 0, Critical: 0, Major: 2, Minor: 5) và phân công xử lý nhanh trong 24 giờ.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Testing Methodology:** User Acceptance Testing (UAT), Black-box Testing, Exploratory Testing
- **Management:** Jira Issue Tracking, Defect Severity Matrix, UAT Sign-off Protocol
- **Evaluation Matrix:** System Usability Scale (SUS $\ge 80$), Task Completion Rate ($100\%$)

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Hoàn thành 100% các phiên kiểm thử UAT với đầy đủ 5 vai trò người dùng đại diện.
- [x] Bảng nhật ký phản hồi UAT Feedback Log được hoàn thiện, các lỗi nghiêm trọng được đưa vào backlog xử lý ngay.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S6-T007` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuyTD**) review và chấp thuận nghiệm thu (Approved).

---

### 6.3. [DT-339] S6-T014 — Adjust system features & demo data based on pre-defense mentor dry-run

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-339**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-339) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S6-PBI-05] Adjust System Based on UAT Feedback` |
| **Phân hệ (Module)** | Đánh giá & Nghiệm thu Sprint (Sprint Review & Retrospective) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 4h) |
| **Giờ công dự tính** | **19 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 21/11/2026 ➔ 24/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm kỹ thuật, tôi cần trực tiếp khắc phục các lỗi phát hiện qua phiên UAT và buổi tổng duyệt thử (Dry-run) với Mentor, tinh chỉnh dữ liệu demo để đảm bảo buổi trình chiếu trước Hội đồng diễn ra hoàn hảo nhất.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Thực hiện các tinh chỉnh hệ thống và tối ưu trải nghiệm phục vụ buổi bảo vệ chính thức:
1. **Khắc phục các khiếm khuyết UI/UX & Hiệu năng:**
   - Tối ưu hóa thời gian render biểu đồ Radar Chart và Heatmap phân tích năng lực (giảm thời gian vẽ từ 1.2s xuống < 200ms bằng `useMemo` và xử lý cache React Query).
   - Tinh chỉnh giao diện hiển thị thông báo SignalR Toast, responsive trên máy chiếu màn hình lớn độ phân giải Full HD / 4K.
   - Hoàn thiện xử lý lỗi nhập liệu form xác thực và cơ chế tự động chuyển hướng khi hết hạn token.
2. **Chuẩn hóa kịch bản Demo "Vàng" (Golden Demo Path):**
   - Thiết lập tài khoản demo sẵn có dữ liệu 100 nhân viên 5 phòng ban, cấu hình sẵn bài nộp thực hành mẫu và chứng chỉ PDF để trình diễn thông suốt 10 phút demo không bị nghẽn mạng.
   - Thử nghiệm dự phòng ngoại tuyến (Offline Demo Backup) với Docker Compose Localhost đề phòng rủi ro mất kết nối Internet trong phòng bảo vệ.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Optimization:** React Component Memoization, Database Query Optimization, Bundle Size Reduction
- **UI/UX Polish:** Tailwind CSS 4 Transitions, Accessibility (a11y) Contrast Tuning
- **Quality Assurance:** Regression Smoke Testing before Defense, Golden Path Checklist

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Toàn bộ lỗi phát hiện từ buổi tổng duyệt với Mentor được sửa dứt điểm, hệ thống chạy trơn tru 100%.
- [x] Kịch bản demo vàng được thử nghiệm chạy thông suốt từ đầu đến cuối không phát sinh lỗi bất ngờ.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S6-T014` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 6.4. [DT-345] S6-T017 — Finalize Report 7 - Complete Capstone graduation project report package

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-345**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-345) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S6-PBI-08] Update Report 7 - Final Project Report` |
| **Phân hệ (Module)** | Hồ sơ Tài liệu Đồ án Tốt nghiệp (Capstone Documentation & Reports) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **QuangNV** (Công số review: 2h) |
| **Giờ công dự tính** | **10 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 24/11/2026 ➔ 24/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm chịu trách nhiệm bàn giao đồ án, tôi cần hoàn thiện 100% tập Báo cáo tổng kết đồ án tốt nghiệp Report 7 cùng toàn bộ hồ sơ nghiệm thu chính thức nộp lên Phòng Đào tạo và Hội đồng chấm Đồ án Đại học FPT.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Hoàn thiện trọn vẹn và đóng gói gói tài liệu tốt nghiệp Report 7:
1. **Nội dung hoàn chỉnh của Report 7:**
   - Tổng kết toàn bộ chu kỳ phát triển 6 Sprint theo mô hình Agile/Scrum.
   - Bảng tổng hợp công số đóng góp của từng thành viên: LinhTV (587h: 499h chính + 88h review), HoangNT, QuangNV, QuyTD, VietTN khớp 100% file tracking Excel.
   - Minh chứng kết quả kiểm thử tự động (.NET tests pass 100%), kết quả đo tải k6 (100 CCU P95 < 500ms) và biên bản nghiệm thu người dùng UAT.
2. **Kiểm tra quy chuẩn định dạng học thuật:**
   - Kiểm tra chuẩn trích dẫn tài liệu tham khảo (IEEE), đánh số bảng biểu, sơ đồ và mục lục tự động.
   - Xuất file PDF chất lượng cao, đóng bìa và chuẩn bị đĩa USB mã nguồn nộp nhà trường theo đúng quy chế.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Academic Standard:** FPT University Capstone Project Submission Regulations
- **Documentation Package:** Report 1 to Report 7, Project Submission Archive Bundle

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Tập tài liệu Report 7 và toàn bộ gói hồ sơ bàn giao hoàn tất 100%, có chữ ký chấp thuận của Mentor.
- [x] Mã nguồn được đóng gói tag release `v1.0.0-final` trên GitHub repository.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S6-T017` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **QuangNV**) review và chấp thuận nghiệm thu (Approved).

---

### 6.5. [DT-349] S6-T019 — Conduct defense dry-run rehearsals, committee Q&A preparation & final retrospective

| Thuộc tính | Giá trị chi tiết |
| :--- | :--- |
| **Jira Issue** | [**DT-349**](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-349) (Loại: Sub-task) |
| **Thuộc PBI / Story** | `[S6-PBI-10] Defense Rehearsal & Final Retrospective` |
| **Phân hệ (Module)** | Đánh giá & Nghiệm thu Sprint (Sprint Review & Retrospective) |
| **Người thực hiện (PIC)** | **Trần Văn Linh (LinhTV)** |
| **Người kiểm tra (Reviewer)** | **HoangNT** (Công số review: 2h) |
| **Giờ công dự tính** | **8 giờ** |
| **Độ phức tạp (Level)** | `Medium` |
| **Kế hoạch thực hiện** | 25/11/2026 ➔ 25/11/2026 |
| **Trạng thái hiện tại** | **⏳ To Do / Pending** |

#### 🎯 Mục tiêu & Bối cảnh nghiệp vụ:
> Là Trưởng nhóm và người dẫn dắt bảo vệ đồ án, tôi cần tổ chức các buổi diễn tập bảo vệ thử (Dry-run Rehearsals), chuẩn bị ngân hàng câu hỏi phản biện chuyên sâu của Hội đồng và điều phối họp tổng kết toàn diện dự án.

#### 📋 Mô tả chi tiết kỹ thuật (Description trên Jira):
Chuẩn bị tâm thế và tài liệu sẵn sàng cho buổi bảo vệ chính thức trước Hội đồng theo kịch bản 22 slides (`DigiTalent_AI_Script_Final_Combined.docx`):
1. **Diễn tập thuyết trình (Slide Deck & Timing):**
   - Khớp nối chính xác Slide thuyết trình 22 slides trong khung thời gian 20 phút bảo vệ:
     - *Phần 1 (5 phút):* Bối cảnh thực trạng, Khoảng cách bài toán & Kiến trúc giải pháp DigiTalent AI.
     - *Phần 2 (10 phút):* Trình diễn trực tiếp sản phẩm (Live Demo) 5 Acts luân phiên giữa các tài khoản: HR Manager ➔ Trainer ➔ Employee ➔ Dept Manager ➔ Mobile QR Scanning.
     - *Phần 3 (5 phút):* Kết quả kỹ thuật (.NET 8 Clean Architecture, 59 bảng Canonical, 114 permissions, Explainable AI, kiểm thử k6 tải 100 CCU) & Đánh giá dự án.
   - Phân chia vai trò nói rõ ràng cho 5 thành viên trong nhóm, phối hợp nhịp nhàng giữa người thuyết trình và người thao tác demo trực tiếp.
2. **Bộ câu hỏi phản biện chuyên sâu của Hội đồng (Committee Q&A Bank):**
   - Soạn thảo ngân hàng 30 câu hỏi trọng tâm của Hội đồng:
     - *Kiến trúc & Bảo mật:* Vì sao chọn Clean Architecture? Cơ chế Refresh Token Rotation (RFC 6749) và Token Reuse Detection xử lý như thế nào? Cách hệ thống ngăn ngừa IDOR qua Department Data Scoping?
     - *Giải thuật & AI:* Tại sao lựa chọn Rule-based Intelligence Engine giải thích được (Explainable by Design) thay vì Deep Learning / LLM Black-box? Công thức tính Skill Gap, Priority Score và Course Match Score?
     - *Tính mở rộng:* Khả năng mở rộng chịu tải khi dữ liệu doanh nghiệp tăng lên 10.000 nhân viên?
3. **Họp Final Retrospective & Đóng dự án:** Đánh giá hành trình 3 tháng làm đồ án, ghi nhận đóng góp xuất sắc của toàn bộ 5 thành viên và lưu trữ hồ sơ dự án.

#### 🛠️ Công nghệ & Tiêu chuẩn áp dụng:
- **Presentation:** Microsoft PowerPoint (22 Slides Deck), High-contrast Modern Design, Video Demo Backup
- **Q&A Preparation:** Software Architecture Defense, Algorithm Defense, Security Defense
- **Teamwork:** Scrum Final Retrospective, Project Closure Sign-off

#### 🏁 Sản phẩm bàn giao & Tiêu chí hoàn thành (Definition of Done - DoD):
- [x] Slide deck và kịch bản thuyết trình được Mentor duyệt thông qua.
- [x] Nhóm hoàn thành tối thiểu 2 buổi diễn tập bảo vệ thử trôi chảy trong khung thời gian 20 phút.
- [x] Feature branch được push lên GitHub với commit chuẩn gắn mã `S6-T019` và mở Pull Request.
- [x] Được người kiểm tra (Reviewer: **HoangNT**) review và chấp thuận nghiệm thu (Approved).

---


<a id="phu-luc-review"></a>
## 🔍 PHỤ LỤC: DANH SÁCH 30 TASKS REVIEW CHÉO CỦA TRẦN VĂN LINH (88.0 giờ)

Trần Văn Linh đảm nhận vai trò Trưởng nhóm (Leader) chịu trách nhiệm kiểm tra, review code (PR Review) và nghiệm thu chất lượng công việc cho các thành viên trong đội ngũ:

| STT | Sprint | Jira Key | Task ID | Tên công việc review | PIC thực hiện | Reviewer | Giờ Review | Kế hoạch |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| 1 | Sprint 1 | [DT-114](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-114) | `S1-T003` | Define system actors, 46 use cases & 12 core business rules | **QuangNV** | **LinhTV** | 4h | 19/08/2026 – 24/08/2026 |
| 2 | Sprint 1 | [DT-117](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-117) | `S1-T005` | Design screen flow, design system & Figma interactive mockups | **VietTN** | **LinhTV** | 5h | 21/08/2026 – 28/08/2026 |
| 3 | Sprint 1 | [DT-131](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-131) | `S1-T014` | Write master test plan & configure automated testing frameworks | **QuyTD** | **LinhTV** | 2h | 29/08/2026 – 01/09/2026 |
| 4 | Sprint 1 | [DT-140](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-140) | `S1-T020` | Update Report 3 - SRS functional specifications, 46 UCs & screen catalogs | **QuangNV** | **LinhTV** | 2h | 01/09/2026 – 03/09/2026 |
| 5 | Sprint 1 | [DT-144](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-144) | `S1-T022` | Update Report 5 - Test strategy, acceptance criteria & environment plan | **QuyTD** | **LinhTV** | 1h | 03/09/2026 – 03/09/2026 |
| 6 | Sprint 2 | [DT-150](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-150) | `S2-T002` | Refine acceptance criteria - Org, Employee, Job Architecture & Competencies | **QuangNV** | **LinhTV** | 3h | 05/09/2026 – 08/09/2026 |
| 7 | Sprint 2 | [DT-156](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-156) | `S2-T006` | [BE] Implement authentication endpoints (/login, /me, /logout) & session revocation | **HoangNT** | **LinhTV** | 6h | 14/09/2026 – 17/09/2026 |
| 8 | Sprint 2 | [DT-165](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-165) | `S2-T013` | [BE] Implement Job Families & Job Positions management CRUD API | **QuyTD** | **LinhTV** | 4h | 18/09/2026 – 22/09/2026 |
| 9 | Sprint 2 | [DT-175](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-175) | `S2-T021` | Execute integration & regression test suite for Sprint 2 deliverables | **QuyTD** | **LinhTV** | 4h | 17/09/2026 – 23/09/2026 |
| 10 | Sprint 2 | [DT-182](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-182) | `S2-T025` | Update Report 3 - Document Sprint 2 Org, Employee & Competency functions | **QuangNV** | **LinhTV** | 1h | 24/09/2026 – 24/09/2026 |
| 11 | Sprint 3 | [DT-197](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-197) | `S3-T005` | [BE] Implement Employee Competency Profile read API & capability history log | **QuangNV** | **LinhTV** | 4h | 30/09/2026 – 02/10/2026 |
| 12 | Sprint 3 | [DT-208](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-208) | `S3-T014` | [BE] Implement Assessment Session, Auto-Grading & Result persistence API | **QuyTD** | **LinhTV** | 5h | 07/10/2026 – 12/10/2026 |
| 13 | Sprint 3 | [DT-215](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-215) | `S3-T019` | Execute integration test suite: Course -> Quiz -> Auto-Grading -> Skill Gap update | **QuyTD** | **LinhTV** | 4h | 08/10/2026 – 12/10/2026 |
| 14 | Sprint 3 | [DT-230](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-230) | `S3-T028` | Conduct Sprint 3 review, demo Skill Gap lifecycle to mentor & team retrospective | **QuangNV** | **LinhTV** | 1h | 13/10/2026 – 13/10/2026 |
| 15 | Sprint 4 | [DT-239](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-239) | `S4-T005` | [BE] Implement Digital Certificate generation API (SHA256 Hash, PDF & QR Code) | **HoangNT** | **LinhTV** | 5h | 16/10/2026 – 20/10/2026 |
| 16 | Sprint 4 | [DT-241](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-241) | `S4-T007` | [BE] Implement Certificate Public Registry & verification API (No-Auth endpoint) | **VietTN** | **LinhTV** | 4h | 20/10/2026 – 22/10/2026 |
| 17 | Sprint 4 | [DT-242](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-242) | `S4-T008` | [BE] Implement background worker for Certificate Expiration & verification audit logs | **HoangNT** | **LinhTV** | 3h | 22/10/2026 – 23/10/2026 |
| 18 | Sprint 4 | [DT-244](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-244) | `S4-T009` | [BE] Implement Practical Task Template & Task Assignment API (Due dates & rubrics) | **QuangNV** | **LinhTV** | 5h | 16/10/2026 – 20/10/2026 |
| 19 | Sprint 4 | [DT-258](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-258) | `S4-T019` | Execute integration test suite for WMS-lite, Evidence workflow & Certificate issuance | **QuyTD** | **LinhTV** | 4h | 22/10/2026 – 26/10/2026 |
| 20 | Sprint 4 | [DT-261](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-261) | `S4-T022` | Implement automated E2E test script for full Competency Feedback Loop | **QuyTD** | **LinhTV** | 3h | 26/10/2026 – 27/10/2026 |
| 21 | Sprint 4 | [DT-266](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-266) | `S4-T025` | Refine evidence review flow: Add Request Resubmission option per mentor feedback | **QuangNV** | **LinhTV** | 2h | 27/10/2026 – 27/10/2026 |
| 22 | Sprint 5 | [DT-280](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-280) | `S5-T003` | Design Executive Dashboard aggregation queries & Audit Log database partitioning | **VietTN** | **LinhTV** | 3h | 30/10/2026 – 31/10/2026 |
| 23 | Sprint 5 | [DT-290](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-290) | `S5-T009` | [BE] Implement Executive & Department Analytics aggregation API (Readiness & Gap metrics) | **QuangNV** | **LinhTV** | 5h | 31/10/2026 – 04/11/2026 |
| 24 | Sprint 5 | [DT-302](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-302) | `S5-T018` | Execute full system integration test suite across all 8 functional packages | **QuyTD** | **LinhTV** | 5h | 06/11/2026 – 10/11/2026 |
| 25 | Sprint 5 | [DT-308](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-308) | `S5-T022` | Adjust permission matrix & dashboard layout widgets based on mentor review | **HoangNT** | **LinhTV** | 2h | 10/11/2026 – 10/11/2026 |
| 26 | Sprint 5 | [DT-310](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-310) | `S5-T023` | Finalize Report 3 - Complete Software Requirement Specification (SRS Package) | **VietTN** | **LinhTV** | 1h | 09/11/2026 – 10/11/2026 |
| 27 | Sprint 5 | [DT-320](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-320) | `S5-T028` | Conduct Sprint 5 review, demo completed system to mentor & freeze feature scope | **QuangNV** | **LinhTV** | 1h | 11/11/2026 – 11/11/2026 |
| 28 | Sprint 6 | [DT-329](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-329) | `S6-T006` | Prepare User Acceptance Testing (UAT) test scenarios, guides & test datasets | **QuyTD** | **LinhTV** | 4h | 17/11/2026 – 19/11/2026 |
| 29 | Sprint 6 | [DT-333](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-333) | `S6-T010` | Retest resolved UAT defects & obtain official UAT acceptance sign-off certificate | **QuyTD** | **LinhTV** | 4h | 21/11/2026 – 24/11/2026 |
| 30 | Sprint 6 | [DT-335](https://fpt-team-fgc0cs95.atlassian.net/browse/DT-335) | `S6-T011` | [BE] Fix UAT defects & polish Skill Gap scoring precision and edge case handling | **QuangNV** | **LinhTV** | 4h | 19/11/2026 – 21/11/2026 |

---
*Tài liệu được trích xuất tự động từ hệ thống Jira Software Cloud và ma trận WBS dự án DigiTalent AI.*
