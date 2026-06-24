**DIGITAL TALENT AI**

**SOFTWARE REQUIREMENT SPECIFICATION (SRS)**

*Volume 1 - Functional Requirements and User-Facing System Behavior*



|**Field**|**Information**|
|:---|:---|
|Document Code|03A_SRS_Functional_Requirements_DigiTalent_AI|
|Document Type|Software Requirement Specification (SRS)|
|Project|DigiTalent AI - Digital Competency Training, Internal Certification and Work-Based Assessment Platform|
|Technology Baseline|ReactJS, TypeScript, TailwindCSS, ShadCN/UI; ASP.NET Core/C#; PostgreSQL; MinIO; Redis optional; SignalR; Docker; Nginx; GitHub Actions|
|Version|1.0|
|Status|Draft for team review before implementation|
|Prepared For|Capstone Project Implementation|
|Scope Priority|Revised registered scope is the main MVP baseline; optional AI features are treated as bonus/future unless explicitly prioritized.|


*Important: This SRS translates business requirements into software requirements. It must be reviewed before ERD, API implementation, UI coding and testing. Any change after approval should be tracked through a requirement change log.*



# Document Control

|Version|Date|Author/Owner|Description|
|:---|:---|:---|:---|
|1.0|19/06/2026|Project Team / Technical Mentor Support|Initial Volume 1 SRS draft prepared from Project Overview, BRD, revised capstone registration and extended analysis documents.|


## Input Documents and Scope Priority

|**Priority**|**Document**|**Usage in this SRS**|
|:---|:---|:---|
|1|Capstone_Project_Register_DigiTalent_AI_Revised_Scope.docx|Main registered scope. Highest priority when deciding MVP scope and commitments.|
|2|02_BRD_Business_Requirement_DigiTalent_AI.docx|Business requirements, business rules, stakeholder goals and acceptance direction.|
|3|01_Project_Overview_DigiTalent_AI.docx|High-level product vision, system positioning, MVP boundary and demo direction.|
|4|De_tai_DigiTalent_AI_Mo_ta_cap_nhat_14_he_thong.docx|Extended analysis and optional/bonus ideas, used carefully to avoid scope creep.|
|5|Capstone_Project_Register_DigiTalent_AI.docx|Earlier broader scope, used only for context and bonus planning.|


## Requirement Language

|**Keyword**|**Meaning**|
|:---|:---|
|MUST|Required for MVP. Team should implement unless explicitly descoped and approved.|
|SHOULD|Strongly recommended for production quality; may be simplified if time is limited.|
|COULD|Optional/bonus enhancement after MVP is stable.|
|WON'T|Out of current MVP scope; may be future scope.|




# Table of Contents

|**Section**|**Title**|
|:---|:---|
|1|Introduction and Purpose|
|2|Project Scope and Product Boundary|
|3|Overall Product Description|
|4|User Classes and Role Summary|
|5|Requirement Identification Standard|
|6|Functional Requirement Overview|
|7|Detailed Functional Requirements by Module|
|8|Main User Flows and System Behavior|
|9|MVP Functional Acceptance Baseline|
|10|Appendix: Functional Requirement Checklist|




# 1. Introduction and Purpose

This document defines the software functional requirements for DigiTalent AI. The goal is to give the development team a clear, reviewable and testable baseline before coding. The document is written from a production-oriented perspective: every feature should have a clear actor, permission boundary, acceptance condition and MVP priority.

DigiTalent AI is a web-based platform for enterprise internal digital competency training, assessment, certificate verification and work-based competency evidence. The system is not only a Learning Management System. It connects job position requirements, competency framework, learning progress, assessment results, certificates, practical task evidence and readiness dashboards into one coherent workflow.

# 2. Project Scope and Product Boundary

|**Category**|**Definition**|
|:---|:---|
|In MVP Scope|RBAC, organization/employee management, competency framework, course/learning, assessment/question bank, digital certificate QR verification, rule-based skill gap/recommendation/risk/readiness, WMS-lite practical task, competency evidence, role-based dashboards, basic notification, audit log.|
|Optional / Bonus|AI task suggestion, AI question draft, AI explanation text, career & promotion readiness, competency heatmap visualization, advanced notification, export reports.|
|Future Scope|Full AI tutor, semantic knowledge search, custom machine learning models, HRM/SSO integration, full talent marketplace, full WMS/project management, mobile app.|
|Out of Scope for MVP|Livestream class, video call, blockchain certificate, microservices, full Moodle/Jira/Trello clone, real enterprise HR suite replacement.|


# 3. Overall Product Description

The product supports an enterprise training cycle where HR defines digital competencies and job position requirements; trainers prepare learning content and assessments; employees learn and complete assessments; the system issues verifiable certificates; managers assign practical tasks; task evaluation becomes competency evidence; dashboards show skill gap, training risk and workforce readiness.

|**Aspect**|**Description**|
|:---|:---|
|Product Perspective|Modular monolith web application with REST API backend, relational database, object storage and optional realtime notifications.|
|Primary Value|Help HR/Managers know not only who completed training, but who has evidence of competency and readiness for work.|
|Core Differentiation|Competency-first design, verifiable certificate, work-based evidence, explainable scoring and human-in-the-loop AI support.|
|Implementation Priority|Build stable core workflow first; integrate optional AI after data model, assessment, certificate and task evidence work correctly.|


# 4. User Classes and Role Summary

|**Role**|**Purpose**|**Permission Boundary**|
|:---|:---|:---|
|System Admin|Owns technical governance, user/role/permission, master data seed, audit log and system settings.|Full system administration; should not directly change learning result without audit reason.|
|HR / Training Manager|Plans and monitors internal training and workforce capability.|Manage employees, departments, positions, competencies, course assignment, certificates, dashboards.|
|Department Manager|Manages competency and task validation for employees in their department/team.|View scoped employees, assign/evaluate practical tasks, view readiness/risk for team.|
|Internal Trainer|Creates learning content, assessments and question banks.|Manage course/lesson/material/question/assessment; review AI question draft if implemented.|
|Employee|Learns, takes assessments, receives certificates and submits practical tasks.|View assigned learning, complete lessons, take quiz, view own profile/evidence/certificates/tasks.|
|Certificate Verifier|Checks if a certificate is valid.|Search/scan certificate code/QR; view limited verification information only.|


# 5. Requirement Identification Standard

|**Item**|**Rule**|
|:---|:---|
|Format|MODULE-XX, for example AUTH-01 or CERT-05.|
|Priority|MVP = required; Should-have = recommended; Bonus = implemented after MVP; Future/Out of scope = not committed.|
|Acceptance Criteria|Each requirement should be testable by manual test, API test, UI test or database verification.|
|Change Control|Changing or removing an MVP requirement must be reviewed because it may affect ERD, API, UI and test cases.|


# 6. Functional Requirement Overview

|**Module Code**|**Module Name**|**Purpose**|**No. Req.**|
|:---|:---|:---|:---|
|AUTH|Authentication & Authorization|Module xác thực và phân quyền dùng cho toàn bộ hệ thống. Đây là lớp bảo vệ đầu tiên cho dữ liệu nhân viên, chứng chỉ, điểm assessment, task evidence và dashboard.|12|
|ORG|Organization & Employee Management|Module quản lý cấu trúc doanh nghiệp, phòng ban, vị trí công việc, nhân viên và quan hệ quản lý trực tiếp.|10|
|COMP|Competency Framework Management|Module lõi để mô hình hóa năng lực số, level năng lực, yêu cầu theo vị trí và hồ sơ năng lực hiện tại của nhân viên.|12|
|COURSE|Course & Learning Management|Module quản lý khóa học nội bộ, cấu trúc bài học, tài liệu, gán khóa học và theo dõi tiến độ học tập.|12|
|ASSESS|Assessment & Question Bank|Module đánh giá kiến thức/năng lực thông qua ngân hàng câu hỏi, quiz, assessment đầu vào/đầu ra và final assessment.|12|
|CERT|Digital Certificate Management & Verification|Module cấp chứng chỉ nội bộ, sinh mã chứng chỉ, QR verification, PDF và quản lý vòng đời valid/expired/revoked.|11|
|INTEL|Capability Intelligence Engine|Module phân tích năng lực ở mức MVP bằng rule-based/explainable formulas, có thể dùng LLM cho gợi ý và giải thích nhưng không thay thế quyết định chính thức.|12|
|WMS|WMS-lite Practical Task Management|Module giao việc thực hành sau đào tạo để xác minh nhân viên áp dụng kiến thức vào công việc thực tế và tạo competency evidence.|12|
|EVID|Competency Evidence Portfolio|Module lưu nguồn bằng chứng năng lực từ assessment, certificate, task, manager review và manual evidence.|7|
|DASH|Dashboard & Analytics|Module hiển thị dữ liệu quản trị cho HR, Manager, Trainer và Employee, tập trung vào câu hỏi năng lực thay vì chỉ hoàn thành khóa học.|10|
|NOTIF|Notification & Reminder|Module thông báo trong hệ thống và nhắc hạn, có thể dùng SignalR cho realtime notification.|5|
|AUDIT|Audit Log & Governance|Module ghi dấu các thao tác quan trọng để hệ thống có tính minh bạch, truy vết và bảo vệ được khi demo.|5|
|SEARCH|Search, Filter and Data Listing|Các yêu cầu chung cho danh sách dữ liệu, tìm kiếm, lọc, sort và phân trang để UI vận hành tốt với dữ liệu tăng dần.|4|
|CONFIG|System Configuration|Module cấu hình threshold, trọng số và các giá trị thay đổi theo doanh nghiệp để tránh hard-code logic quan trọng.|4|


# 7. Detailed Functional Requirements by Module

## 7.1. AUTH - Authentication & Authorization

Module xác thực và phân quyền dùng cho toàn bộ hệ thống. Đây là lớp bảo vệ đầu tiên cho dữ liệu nhân viên, chứng chỉ, điểm assessment, task evidence và dashboard.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|AUTH-01|Hệ thống MUST cho phép người dùng đăng nhập bằng email và mật khẩu hợp lệ.|Actor/Scope: All users   
Priority: MVP |Trả về access token, refresh token và thông tin role/permission tối thiểu; từ chối tài khoản inactive/archived.|
|AUTH-02|Hệ thống MUST lưu mật khẩu dưới dạng hash an toàn, không lưu plain text.|Actor/Scope: System   
Priority: MVP |Tạo user hoặc đổi mật khẩu không bao giờ ghi mật khẩu gốc vào database/log.|
|AUTH-03|Hệ thống MUST phát hành JWT access token có thời hạn ngắn và refresh token có kiểm soát phiên.|Actor/Scope: All users   
Priority: MVP |Access token dùng cho protected API; refresh token có expiry, revoked flag và device/session metadata.|
|AUTH-04|Hệ thống MUST hỗ trợ logout bằng cách revoke refresh token hiện tại.|Actor/Scope: All users   
Priority: MVP |Sau logout, refresh token không thể dùng để lấy access token mới.|
|AUTH-05|Hệ thống MUST kiểm tra role/permission ở backend, không chỉ ẩn menu trên frontend.|Actor/Scope: System   
Priority: MVP |API trả về 403 khi user gọi endpoint không có quyền.|
|AUTH-06|Hệ thống MUST hỗ trợ các role chính: System Admin, HR/Training Manager, Department Manager, Internal Trainer, Employee, Certificate Verifier.|Actor/Scope: Admin   
Priority: MVP |Role được gán vào user và quyết định dashboard/menu/API access.|
|AUTH-07|Hệ thống SHOULD hỗ trợ permission matrix để cấu hình quyền theo module và hành động.|Actor/Scope: Admin   
Priority: MVP |Permission dạng module.action hoặc resource.action; có seed data ban đầu.|
|AUTH-08|Hệ thống MUST cho phép người dùng xem và cập nhật thông tin profile cá nhân ở mức được phép.|Actor/Scope: All users   
Priority: MVP |User không được tự sửa role, department, position, competency, certificate hoặc score.|
|AUTH-09|Hệ thống SHOULD hỗ trợ đổi mật khẩu cho user đang đăng nhập.|Actor/Scope: All users   
Priority: MVP |Yêu cầu mật khẩu hiện tại đúng; sau đổi mật khẩu revoke refresh token cũ nếu cần.|
|AUTH-10|Hệ thống MUST ghi audit log cho các sự kiện đăng nhập thất bại, đăng nhập thành công, đổi mật khẩu, đổi role/quyền.|Actor/Scope: System/Admin   
Priority: MVP |Audit log có actor, action, time, status, IP/device nếu có.|
|AUTH-11|Hệ thống SHOULD khóa tạm hoặc rate limit khi có nhiều lần đăng nhập sai.|Actor/Scope: System   
Priority: Should-have |Có cấu hình số lần fail và thời gian lock/rate limit.|
|AUTH-12|Hệ thống MUST cho phép route xác minh chứng chỉ hoạt động với anonymous verifier ở phạm vi dữ liệu hạn chế.|Actor/Scope: Verifier/Public   
Priority: MVP |Verifier chỉ xem trạng thái chứng chỉ, không xem hồ sơ năng lực đầy đủ.|


## 7.2. ORG - Organization & Employee Management

Module quản lý cấu trúc doanh nghiệp, phòng ban, vị trí công việc, nhân viên và quan hệ quản lý trực tiếp.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|ORG-01|Hệ thống MUST cho phép Admin/HR tạo, cập nhật và vô hiệu hóa phòng ban.|Actor/Scope: Admin/HR   
Priority: MVP |Department có code/name/status; không hard delete nếu đã có nhân viên hoặc dữ liệu học tập.|
|ORG-02|Hệ thống MUST cho phép tạo và quản lý vị trí công việc.|Actor/Scope: Admin/HR   
Priority: MVP |Job position có name/code/description/department optional/status.|
|ORG-03|Hệ thống MUST cho phép tạo hồ sơ nhân viên và liên kết với tài khoản người dùng.|Actor/Scope: Admin/HR   
Priority: MVP |Employee có employee code, full name, email, department, job position, status.|
|ORG-04|Hệ thống MUST cho phép gán nhân viên vào phòng ban, vị trí và manager trực tiếp.|Actor/Scope: Admin/HR   
Priority: MVP |Cập nhật mapping phải ghi lịch sử hoặc audit log.|
|ORG-05|Hệ thống MUST hỗ trợ trạng thái nhân viên: active, inactive, transferred, archived.|Actor/Scope: Admin/HR   
Priority: MVP |Inactive/archived không được nhận assignment mới theo mặc định.|
|ORG-06|Department Manager MUST chỉ xem nhân viên thuộc phòng ban/phạm vi mình quản lý.|Actor/Scope: Manager   
Priority: MVP |API lọc dữ liệu theo department/manager scope ở backend.|
|ORG-07|HR/Training Manager MUST xem được dữ liệu nhân viên toàn công ty ở phạm vi đào tạo và năng lực.|Actor/Scope: HR   
Priority: MVP |HR có filter theo department, position, status.|
|ORG-08|Hệ thống SHOULD hỗ trợ tìm kiếm, lọc, sort và phân trang danh sách nhân viên.|Actor/Scope: Admin/HR/Manager   
Priority: MVP |Filter theo keyword, department, position, status.|
|ORG-09|Hệ thống COULD hỗ trợ import nhân viên bằng CSV/Excel sau khi core ổn định.|Actor/Scope: Admin/HR   
Priority: Bonus |Có preview, validate lỗi và không ghi dữ liệu sai.|
|ORG-10|Hệ thống MUST ngăn xóa dữ liệu master đang được tham chiếu bởi course, competency, certificate hoặc task.|Actor/Scope: System   
Priority: MVP |Chuyển sang inactive/archived thay vì hard delete.|


## 7.3. COMP - Competency Framework Management

Module lõi để mô hình hóa năng lực số, level năng lực, yêu cầu theo vị trí và hồ sơ năng lực hiện tại của nhân viên.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|COMP-01|Hệ thống MUST cho phép HR tạo competency category như AI Literacy, Data Literacy, Cybersecurity, Digital Collaboration, Digital Document Management.|Actor/Scope: HR   
Priority: MVP |Category có name, description, status và display order.|
|COMP-02|Hệ thống MUST cho phép tạo competency cụ thể dưới category.|Actor/Scope: HR   
Priority: MVP |Competency có code, name, category, description, status.|
|COMP-03|Hệ thống MUST định nghĩa competency levels rõ ràng, ví dụ Level 1-5 hoặc Beginner-Advanced.|Actor/Scope: HR   
Priority: MVP |Mỗi level có numeric value, label, description và achievement criteria.|
|COMP-04|Hệ thống MUST cho phép gắn required competency vào job position.|Actor/Scope: HR   
Priority: MVP |Gồm required level, weight, mandatory flag và priority.|
|COMP-05|Hệ thống MUST đảm bảo mỗi job position dùng trong đào tạo có ít nhất một required competency.|Actor/Scope: System/HR   
Priority: MVP |Không publish/activate position requirement nếu rỗng.|
|COMP-06|Hệ thống MUST cho phép xem competency matrix theo position.|Actor/Scope: HR/Manager   
Priority: MVP |Hiển thị năng lực, required level, weight và mandatory flag.|
|COMP-07|Hệ thống MUST lưu employee competency profile theo từng competency.|Actor/Scope: System/HR/Manager   
Priority: MVP |Có current level, evidence source, last evaluated date, confidence/status.|
|COMP-08|Employee MUST chỉ xem hồ sơ năng lực của chính mình, không được tự cập nhật level chính thức.|Actor/Scope: Employee   
Priority: MVP |Nút update level không có hoặc API từ chối 403.|
|COMP-09|Manager/Trainer/HR MUST có quyền xác nhận hoặc cập nhật competency theo rule/phạm vi phù hợp.|Actor/Scope: Manager/Trainer/HR   
Priority: MVP |Cập nhật cần reason/evidence và audit log.|
|COMP-10|Hệ thống MUST liên kết competency update với evidence nếu update đến từ assessment, certificate hoặc practical task.|Actor/Scope: System   
Priority: MVP |Employee competency profile trỏ về evidence record/source.|
|COMP-11|Hệ thống SHOULD lưu lịch sử thay đổi competency level.|Actor/Scope: System   
Priority: Should-have |Có old level, new level, actor, source, reason, time.|
|COMP-12|Hệ thống MUST không hard-code danh sách competency; dữ liệu phải quản lý được từ UI hoặc seed config.|Actor/Scope: System   
Priority: MVP |Có thể thêm nhóm năng lực mới mà không sửa code.|


## 7.4. COURSE - Course & Learning Management

Module quản lý khóa học nội bộ, cấu trúc bài học, tài liệu, gán khóa học và theo dõi tiến độ học tập.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|COURSE-01|Trainer/HR MUST tạo và quản lý khóa học với metadata cơ bản.|Actor/Scope: Trainer/HR   
Priority: MVP |Course có title, code, description, level, duration, status, owner, visibility.|
|COURSE-02|Course MUST có trạng thái draft, published, archived.|Actor/Scope: Trainer/HR   
Priority: MVP |Employee chỉ thấy course published và được assign hoặc được phép truy cập.|
|COURSE-03|Trainer MUST tạo module/chapter và lesson trong course.|Actor/Scope: Trainer   
Priority: MVP |Lesson có title, content type, order, completion rule.|
|COURSE-04|Hệ thống MUST hỗ trợ tài liệu học tập gồm text/content, PDF/slide/file link hoặc video link.|Actor/Scope: Trainer   
Priority: MVP |File upload lưu qua MinIO/object storage; URL không lộ bucket private nếu không cần.|
|COURSE-05|Mỗi course MUST gắn với ít nhất một competency để phục vụ skill tracking và recommendation.|Actor/Scope: Trainer/HR   
Priority: MVP |Không publish course nếu chưa mapping competency.|
|COURSE-06|HR/Manager MUST gán course cho cá nhân, phòng ban hoặc vị trí công việc.|Actor/Scope: HR/Manager   
Priority: MVP |Assignment lưu target type, target id, deadline và reason nếu có.|
|COURSE-07|Employee MUST xem danh sách khóa học được gán và trạng thái học tập.|Actor/Scope: Employee   
Priority: MVP |Hiển thị not started, in progress, completed, overdue.|
|COURSE-08|Hệ thống MUST theo dõi lesson progress và course progress theo phần trăm.|Actor/Scope: System   
Priority: MVP |Progress cập nhật khi hoàn thành lesson/quiz theo completion rule.|
|COURSE-09|Hệ thống MUST ngăn Employee tự đánh dấu completed nếu lesson yêu cầu quiz/final assessment.|Actor/Scope: System   
Priority: MVP |Completion rule phải được backend kiểm soát.|
|COURSE-10|Hệ thống SHOULD hỗ trợ course prerequisite hoặc recommended order.|Actor/Scope: Trainer/HR   
Priority: Should-have |Nếu có prerequisite chưa đạt, hệ thống cảnh báo hoặc khóa course.|
|COURSE-11|Hệ thống MUST hỗ trợ phân trang/tìm kiếm/lọc course theo category, competency, status, owner.|Actor/Scope: Trainer/HR/Employee   
Priority: MVP |Danh sách không tải toàn bộ dữ liệu lớn một lần.|
|COURSE-12|Hệ thống MUST ghi audit log khi publish/archive course hoặc thay đổi điều kiện hoàn thành.|Actor/Scope: System   
Priority: MVP |Audit có actor, course id, old/new status hoặc config.|


## 7.5. ASSESS - Assessment & Question Bank

Module đánh giá kiến thức/năng lực thông qua ngân hàng câu hỏi, quiz, assessment đầu vào/đầu ra và final assessment.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|ASSESS-01|Trainer MUST tạo question bank theo course/competency/category.|Actor/Scope: Trainer   
Priority: MVP |Question bank có owner, status, linked competency hoặc course.|
|ASSESS-02|Hệ thống MUST hỗ trợ các loại câu hỏi tối thiểu: single choice, multiple choice, true/false.|Actor/Scope: Trainer   
Priority: MVP |Mỗi question lưu correct answer và explanation ở backend.|
|ASSESS-03|Hệ thống SHOULD hỗ trợ scenario-based question hoặc short answer ở mức bonus nếu có thời gian.|Actor/Scope: Trainer   
Priority: Bonus |Short answer cần manual grading hoặc không dùng cho auto-score MVP.|
|ASSESS-04|Trainer MUST tạo assessment/quiz và gắn câu hỏi vào assessment.|Actor/Scope: Trainer   
Priority: MVP |Assessment có type, pass score, time limit, attempt limit, status.|
|ASSESS-05|Hệ thống MUST hỗ trợ pre-assessment, lesson quiz, final assessment/post-assessment ở mức cấu hình.|Actor/Scope: Trainer/HR   
Priority: MVP |Assessment type ảnh hưởng progress, certificate condition và score report.|
|ASSESS-06|Employee MUST làm assessment được assign hoặc thuộc course của mình.|Actor/Scope: Employee   
Priority: MVP |Backend kiểm tra enrollment/assignment trước khi tạo attempt.|
|ASSESS-07|Hệ thống MUST lưu attempt, answer, score, submitted time và result status.|Actor/Scope: System   
Priority: MVP |Attempt có in progress/submitted/graded/passed/failed.|
|ASSESS-08|Hệ thống MUST tự chấm điểm câu hỏi objective.|Actor/Scope: System   
Priority: MVP |Score calculation nhất quán; correct answer không gửi cho client trước khi submit.|
|ASSESS-09|Hệ thống MUST kiểm tra attempt limit và time limit ở backend.|Actor/Scope: System   
Priority: MVP |Quá thời gian hoặc quá số lần làm phải bị từ chối/auto-submit theo rule.|
|ASSESS-10|Employee SHOULD xem kết quả, feedback và explanation sau khi submit theo cấu hình của Trainer.|Actor/Scope: Employee   
Priority: MVP |Có thể ẩn đáp án đúng nếu Trainer cấu hình.|
|ASSESS-11|Assessment result MUST có thể cập nhật employee competency evidence khi đạt điều kiện.|Actor/Scope: System   
Priority: MVP |Nếu assessment mapped competency và đạt pass score, tạo evidence ASSESSMENT.|
|ASSESS-12|AI-generated question MUST chỉ là draft; Trainer phải review trước khi publish.|Actor/Scope: Trainer/AI   
Priority: Bonus |Câu hỏi AI có status draft/reviewed/published/rejected và log prompt/output.|


## 7.6. CERT - Digital Certificate Management & Verification

Module cấp chứng chỉ nội bộ, sinh mã chứng chỉ, QR verification, PDF và quản lý vòng đời valid/expired/revoked.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|CERT-01|Hệ thống MUST định nghĩa điều kiện cấp chứng chỉ theo course/assessment.|Actor/Scope: HR/Trainer   
Priority: MVP |Điều kiện gồm completion, final assessment pass score, expiry policy nếu có.|
|CERT-02|Hệ thống MUST tự động hoặc bán tự động cấp certificate khi Employee đạt điều kiện.|Actor/Scope: System/HR   
Priority: MVP |Tùy config auto issue hoặc HR approve; certificate code unique.|
|CERT-03|Certificate MUST có code duy nhất, employee, course/competency, issue date, expiry date, status.|Actor/Scope: System   
Priority: MVP |Status gồm valid, expired, revoked; pending renewal optional.|
|CERT-04|Hệ thống MUST sinh QR code hoặc verification URL cho certificate.|Actor/Scope: System   
Priority: MVP |QR dẫn đến trang verify theo certificate code/token.|
|CERT-05|Hệ thống SHOULD sinh PDF certificate từ template.|Actor/Scope: System   
Priority: MVP |PDF lưu object storage; có code/QR/employee/course/issue date.|
|CERT-06|Verifier MUST xác minh certificate bằng code hoặc QR URL.|Actor/Scope: Verifier/Public   
Priority: MVP |Hiển thị valid/expired/revoked, tên người nhận, tên chứng chỉ, ngày cấp/hết hạn; không lộ dữ liệu nhạy cảm.|
|CERT-07|HR/Admin MUST revoke certificate với lý do bắt buộc.|Actor/Scope: HR/Admin   
Priority: MVP |Revoked certificate không tính vào Certificate Score và có audit log.|
|CERT-08|Expired certificate MUST không được tính là valid trong readiness score.|Actor/Scope: System   
Priority: MVP |Background job hoặc query logic kiểm tra expiry date.|
|CERT-09|Employee MUST xem và tải certificate của chính mình.|Actor/Scope: Employee   
Priority: MVP |Không xem/tải certificate của người khác nếu không có quyền.|
|CERT-10|Hệ thống MUST ghi verification log ở mức tối thiểu.|Actor/Scope: System   
Priority: Should-have |Lưu certificate id/code, time, result; IP optional.|
|CERT-11|Certificate template COULD được quản lý từ UI sau MVP.|Actor/Scope: Admin/HR   
Priority: Bonus |MVP có thể dùng template cố định nhưng không hard-code dữ liệu certificate.|


## 7.7. INTEL - Capability Intelligence Engine

Module phân tích năng lực ở mức MVP bằng rule-based/explainable formulas, có thể dùng LLM cho gợi ý và giải thích nhưng không thay thế quyết định chính thức.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|INTEL-01|Hệ thống MUST tính Skill Gap bằng cách so sánh required competency level với current employee competency level.|Actor/Scope: System/HR/Manager   
Priority: MVP |Output gồm competency, required level, current level, gap value, priority.|
|INTEL-02|Skill Gap MUST được tính theo job position hiện tại hoặc target position được chọn.|Actor/Scope: System   
Priority: MVP |Current position dùng cho training gap; target position dùng cho career readiness optional.|
|INTEL-03|Hệ thống MUST đề xuất course dựa trên skill gap và course-competency mapping.|Actor/Scope: System/Employee/HR/Manager   
Priority: MVP |Recommendation có reason: thiếu competency nào, course nào bù gap.|
|INTEL-04|Learning Recommendation SHOULD ưu tiên course phù hợp nhất theo gap severity, mandatory competency và course level.|Actor/Scope: System   
Priority: MVP |Có ranking score hoặc priority label.|
|INTEL-05|Hệ thống MUST tính Training Risk Score theo progress, low score, deadline pressure, failed attempts và inactivity.|Actor/Scope: System/HR/Manager   
Priority: MVP |Output gồm risk score, risk level, reasons, last calculated time.|
|INTEL-06|Risk thresholds MUST không hard-code trong service logic; nên lưu ở configuration.|Actor/Scope: Admin/System   
Priority: MVP |Có default threshold Low/Medium/High/Critical.|
|INTEL-07|Hệ thống MUST tính Workforce Readiness Score từ competency, certificate, learning progress, compliance và task performance.|Actor/Scope: System/HR/Manager   
Priority: MVP |Công thức có trọng số rõ và explanation.|
|INTEL-08|Readiness calculation MUST chạy lại khi có thay đổi competency, certificate, progress hoặc task evaluation.|Actor/Scope: System   
Priority: MVP |Có trigger service hoặc recalculation endpoint/job.|
|INTEL-09|Hệ thống MUST lưu explanation cho score quan trọng để HR/Manager hiểu vì sao có kết quả.|Actor/Scope: System   
Priority: MVP |Explanation có input summary, formula factors, output, generated time.|
|INTEL-10|LLM nếu dùng MUST chỉ tạo nội dung hỗ trợ như explanation text, task suggestion hoặc question draft.|Actor/Scope: System/AI   
Priority: Bonus |Không dùng LLM làm nguồn quyết định duy nhất cho certificate/score chính thức.|
|INTEL-11|Career & Promotion Readiness COULD so sánh nhân viên với target position nếu core MVP hoàn thành.|Actor/Scope: HR/Manager   
Priority: Bonus |Output gồm readiness %, missing competencies, course/task suggestion.|
|INTEL-12|AI Learning Assistant và Semantic Knowledge Search WON'T nằm trong MVP bắt buộc.|Actor/Scope: Employee/AI   
Priority: Future |Có thể mô tả future scope, không cam kết trong core sprint.|


## 7.8. WMS - WMS-lite Practical Task Management

Module giao việc thực hành sau đào tạo để xác minh nhân viên áp dụng kiến thức vào công việc thực tế và tạo competency evidence.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|WMS-01|Manager/Trainer/HR MUST tạo practical task với description, expected output, deadline và evaluation criteria.|Actor/Scope: Manager/Trainer/HR   
Priority: MVP |Task không được assign nếu thiếu deadline hoặc criteria.|
|WMS-02|Task SHOULD được gắn với một hoặc nhiều competency để biết task kiểm chứng năng lực nào.|Actor/Scope: Manager/Trainer   
Priority: MVP |Mapping competency bắt buộc nếu task ảnh hưởng readiness/competency.|
|WMS-03|AI Task Suggestion COULD tạo task draft từ skill gap/course nhưng phải có human review.|Actor/Scope: AI/Manager   
Priority: Bonus |Draft chưa assign cho Employee cho đến khi Manager duyệt/chỉnh sửa.|
|WMS-04|Manager MUST chỉ assign task cho nhân viên thuộc phạm vi quản lý của mình.|Actor/Scope: Manager   
Priority: MVP |Backend enforce department/manager scope.|
|WMS-05|Employee MUST xem danh sách task được giao và trạng thái task.|Actor/Scope: Employee   
Priority: MVP |Status: assigned, in progress, submitted, evaluated, rejected/revision required, overdue.|
|WMS-06|Employee MUST nộp kết quả task bằng text, link hoặc file attachment.|Actor/Scope: Employee   
Priority: MVP |Attachment lưu MinIO; kiểm tra loại file/kích thước.|
|WMS-07|Employee SHOULD cập nhật tiến độ task trước khi nộp.|Actor/Scope: Employee   
Priority: Should-have |Progress note optional nhưng hữu ích cho dashboard.|
|WMS-08|Manager/Trainer MUST đánh giá task bằng score, feedback và competency confirmation.|Actor/Scope: Manager/Trainer   
Priority: MVP |Evaluation có score, pass/fail, feedback, confirmed competency/level nếu có.|
|WMS-09|Task evaluation MUST tạo Competency Evidence loại TASK khi hợp lệ.|Actor/Scope: System   
Priority: MVP |Evidence liên kết task assignment, evaluator, score, feedback, competency impact.|
|WMS-10|Task score MUST chỉ ảnh hưởng readiness sau khi được evaluator hợp lệ đánh giá.|Actor/Scope: System   
Priority: MVP |Submitted nhưng chưa evaluated không tính vào task performance score.|
|WMS-11|Hệ thống MUST ghi audit log khi assign, submit, evaluate hoặc thay đổi deadline task.|Actor/Scope: System   
Priority: MVP |Audit có old/new deadline nếu thay đổi.|
|WMS-12|Hệ thống WON'T triển khai full project management/Kanban/Jira trong MVP.|Actor/Scope: All   
Priority: Out of scope |Chỉ tập trung task sau đào tạo và competency evidence.|


## 7.9. EVID - Competency Evidence Portfolio

Module lưu nguồn bằng chứng năng lực từ assessment, certificate, task, manager review và manual evidence.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|EVID-01|Hệ thống MUST lưu competency evidence theo employee và competency.|Actor/Scope: System/HR/Manager   
Priority: MVP |Evidence có source type, source id, score/level, status, created by/time.|
|EVID-02|Evidence source type MUST gồm ASSESSMENT, CERTIFICATE, TASK, MANAGER_REVIEW, MANUAL.|Actor/Scope: System   
Priority: MVP |MVP tối thiểu hỗ trợ assessment, certificate và task; manual là should-have.|
|EVID-03|Evidence MUST có trạng thái verified, pending, rejected hoặc revoked nếu phù hợp.|Actor/Scope: System/HR/Manager   
Priority: MVP |Chỉ verified evidence mới ảnh hưởng chính thức đến competency/readiness.|
|EVID-04|Employee SHOULD xem evidence portfolio của chính mình.|Actor/Scope: Employee   
Priority: MVP |Chỉ đọc, không tự xác nhận hoặc sửa evidence.|
|EVID-05|HR/Manager MUST xem evidence của nhân viên theo phạm vi quyền.|Actor/Scope: HR/Manager   
Priority: MVP |HR toàn công ty; Manager theo phòng ban/nhân viên quản lý.|
|EVID-06|Hệ thống MUST ghi audit log khi evidence được xác nhận, reject hoặc revoke.|Actor/Scope: System   
Priority: MVP |Có reason nếu reject/revoke.|
|EVID-07|Evidence MUST có thể truy vết về nguồn gốc như attempt, certificate hoặc task evaluation.|Actor/Scope: System   
Priority: MVP |Không tạo evidence mồ côi không có source hoặc reason.|


## 7.10. DASH - Dashboard & Analytics

Module hiển thị dữ liệu quản trị cho HR, Manager, Trainer và Employee, tập trung vào câu hỏi năng lực thay vì chỉ hoàn thành khóa học.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|DASH-01|HR Dashboard MUST hiển thị tổng quan employee, course progress, certificate status, risk list và readiness.|Actor/Scope: HR   
Priority: MVP |Có filter department, position, course, time range nếu khả thi.|
|DASH-02|Manager Dashboard MUST hiển thị dữ liệu nhân viên thuộc phạm vi quản lý.|Actor/Scope: Manager   
Priority: MVP |Không lộ dữ liệu ngoài department/scope.|
|DASH-03|Trainer Dashboard SHOULD hiển thị course performance, assessment pass rate và question quality overview.|Actor/Scope: Trainer   
Priority: MVP |Có danh sách course và assessment cần chú ý.|
|DASH-04|Employee Dashboard MUST hiển thị assigned courses, learning progress, certificates, tasks và competency profile.|Actor/Scope: Employee   
Priority: MVP |Không hiển thị dữ liệu của người khác.|
|DASH-05|Certificate Tracking MUST cho phép HR theo dõi valid/expired/revoked/upcoming expiry.|Actor/Scope: HR   
Priority: MVP |Có filter theo status, department, course.|
|DASH-06|Competency Heatmap SHOULD hiển thị mức độ năng lực theo department/position/competency.|Actor/Scope: HR/Manager   
Priority: Bonus/MVP-lite |MVP có thể dùng bảng/matrix đơn giản nếu chart phức tạp.|
|DASH-07|Training Risk List MUST hiển thị nhân viên có risk cao và lý do chính.|Actor/Scope: HR/Manager   
Priority: MVP |Có risk level, deadline, progress, failed attempts, suggested action.|
|DASH-08|Readiness Dashboard MUST hiển thị score và explanation ở mức dễ hiểu.|Actor/Scope: HR/Manager   
Priority: MVP |Không chỉ hiển thị số; phải có breakdown thành phần.|
|DASH-09|Dashboard queries SHOULD dùng phân trang/cache nếu dữ liệu lớn.|Actor/Scope: System   
Priority: Should-have |Redis optional cho cache dashboard nếu cần.|
|DASH-10|Hệ thống SHOULD hỗ trợ export báo cáo CSV/PDF ở mức bonus.|Actor/Scope: HR/Admin   
Priority: Bonus |Không bắt buộc MVP nếu ảnh hưởng tiến độ.|


## 7.11. NOTIF - Notification & Reminder

Module thông báo trong hệ thống và nhắc hạn, có thể dùng SignalR cho realtime notification.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|NOTIF-01|Hệ thống SHOULD gửi notification khi employee được gán course mới.|Actor/Scope: System/Employee   
Priority: MVP-lite |Employee thấy thông báo trong app; email là optional.|
|NOTIF-02|Hệ thống SHOULD gửi reminder khi course/assessment/task gần deadline.|Actor/Scope: System   
Priority: MVP-lite |Reminder dựa trên cấu hình thời gian trước deadline.|
|NOTIF-03|Hệ thống SHOULD cảnh báo Manager/HR khi employee có training risk cao.|Actor/Scope: System/HR/Manager   
Priority: MVP-lite |Thông báo có link đến risk detail.|
|NOTIF-04|Hệ thống SHOULD cảnh báo certificate sắp hết hạn.|Actor/Scope: System/Employee/HR   
Priority: Should-have |Rule theo expiry date và renewal window.|
|NOTIF-05|SignalR COULD được dùng cho in-app realtime notification.|Actor/Scope: System   
Priority: Bonus/Tech-ready |Nếu chưa kịp realtime, có thể dùng notification list polling.|


## 7.12. AUDIT - Audit Log & Governance

Module ghi dấu các thao tác quan trọng để hệ thống có tính minh bạch, truy vết và bảo vệ được khi demo.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|AUDIT-01|Hệ thống MUST ghi audit log cho thay đổi role/permission, employee assignment, competency update, certificate issue/revoke, task evaluation.|Actor/Scope: System   
Priority: MVP |Log có actor, action, target, timestamp, before/after summary nếu có.|
|AUDIT-02|Admin MUST xem được audit log và filter theo actor/action/date/module.|Actor/Scope: Admin   
Priority: MVP |Danh sách audit có phân trang.|
|AUDIT-03|Audit log MUST không bị sửa/xóa từ UI thông thường.|Actor/Scope: System/Admin   
Priority: MVP |Chỉ retention/maintenance qua admin/system process nếu cần.|
|AUDIT-04|AI explanation log SHOULD lưu input/output snapshot cho đề xuất AI quan trọng.|Actor/Scope: System/AI   
Priority: Bonus |Không lưu dữ liệu nhạy cảm không cần thiết.|
|AUDIT-05|Hệ thống SHOULD log file upload/download quan trọng như certificate PDF và task attachment.|Actor/Scope: System   
Priority: Should-have |Giúp truy vết evidence.|


## 7.13. SEARCH - Search, Filter and Data Listing

Các yêu cầu chung cho danh sách dữ liệu, tìm kiếm, lọc, sort và phân trang để UI vận hành tốt với dữ liệu tăng dần.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|SEARCH-01|Các danh sách chính MUST hỗ trợ phân trang ở backend.|Actor/Scope: All modules   
Priority: MVP |Không trả toàn bộ employees/courses/tasks/certificates nếu dữ liệu lớn.|
|SEARCH-02|Các danh sách chính SHOULD hỗ trợ keyword search và filter phù hợp.|Actor/Scope: All users   
Priority: MVP |Employee, course, certificate, task có filter theo status/time/department.|
|SEARCH-03|Hệ thống SHOULD chuẩn hóa query parameter cho list API.|Actor/Scope: Backend   
Priority: MVP |Dùng page, pageSize, sortBy, sortDirection, keyword, filters.|
|SEARCH-04|PostgreSQL full-text/trigram COULD dùng sau MVP cho search tốt hơn.|Actor/Scope: System   
Priority: Future/Bonus |Không bắt buộc nếu search cơ bản đã đủ demo.|


## 7.14. CONFIG - System Configuration

Module cấu hình threshold, trọng số và các giá trị thay đổi theo doanh nghiệp để tránh hard-code logic quan trọng.

|**ID**|**Software Requirement**|**Actor / Priority**|**Acceptance Criteria**|
|:---|:---|:---|:---|
|CONFIG-01|Hệ thống MUST không hard-code trọng số readiness/risk trong nhiều vị trí code.|Actor/Scope: System/Admin   
Priority: MVP |Dùng configuration table/file hoặc constants tập trung có thể chỉnh rõ.|
|CONFIG-02|Admin/HR SHOULD quản lý threshold risk/readiness qua UI sau MVP.|Actor/Scope: Admin/HR   
Priority: Should-have |MVP có thể seed mặc định trong database.|
|CONFIG-03|Hệ thống MUST có seed data cho role, permissions, competency category mẫu và scoring config mặc định.|Actor/Scope: System   
Priority: MVP |Local setup chạy được sau migration/seed.|
|CONFIG-04|System settings SHOULD có audit log khi thay đổi config ảnh hưởng score/certificate.|Actor/Scope: Admin/System   
Priority: Should-have |Lưu old/new config.|


# 8. Main User Flows and System Behavior

|**Flow ID**|**System Behavior**|
|:---|:---|
|F-01 Core Capability Training Flow|Admin/HR creates organization data -> HR defines competency framework -> HR maps required competencies to job positions -> Trainer creates course and assessment -> HR/Manager assigns course -> Employee learns and takes assessment -> System calculates progress/score -> Certificate is issued if conditions are met.|
|F-02 Skill Gap and Recommendation Flow|System loads job position requirements -> loads employee current competency profile -> calculates gap -> ranks missing competencies -> maps gaps to courses -> returns learning recommendations with explanation.|
|F-03 Certificate Verification Flow|Employee receives certificate -> system generates certificate code and QR URL -> verifier opens URL or enters code -> system returns limited verification result: valid/expired/revoked and basic certificate metadata.|
|F-04 WMS-lite Evidence Flow|System/Manager detects need for practical validation -> Manager creates/approves task -> Employee submits evidence -> Manager evaluates task -> system creates competency evidence -> readiness score is recalculated.|
|F-05 Training Risk Flow|System collects progress, attempts, score, inactivity and deadline -> calculates risk score -> classifies risk level -> notifies Employee/Manager/HR -> dashboard displays reason and suggested action.|
|F-06 Career/Promotion Optional Flow|HR/Manager selects target position -> system compares current competency profile with target requirements -> calculates readiness percentage -> recommends missing courses/tasks.|


# 9. MVP Functional Acceptance Baseline