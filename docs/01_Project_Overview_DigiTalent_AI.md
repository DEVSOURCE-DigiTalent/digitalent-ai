**DigiTalent AI**

**Project Overview Document**

*Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ*  
*cho nhân viên doanh nghiệp kết hợp giao việc thực hành sau đào tạo*

*Digital Competency Training, Internal Certification and Work-Based Assessment Platform*

Document Code: 01\_Project\_Overview  
Version: 1.0  
Status: Draft for Team Review  
Prepared for: Capstone Project Implementation  
Date: 19/06/2026

# **Document Control**

| Item | Content |
| ----- | ----- |
| Project Name | DigiTalent AI |
| Document Name | Project Overview |
| Document Code | 01\_Project\_Overview |
| Version | 1.0 |
| Status | Draft for team alignment before coding |
| Primary Source | Capstone\_Project\_Register\_DigiTalent\_AI\_Revised\_Scope.docx |
| Supporting Sources | Capstone\_Project\_Register\_DigiTalent\_AI.docx; De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx |
| Main Technology Stack | ReactJS, TypeScript, TailwindCSS, ShadCN/UI, ASP.NET Core/C\#, PostgreSQL, MinIO, Redis optional, SignalR, Docker, Docker Compose, Nginx, GitHub Actions |
| Intended Readers | Project team, mentor, reviewers, developers, testers and stakeholders involved in the Capstone project |

## **Revision History**

| Version | Date | Author/Role | Summary |
| ----- | ----- | ----- | ----- |
| 1.0 | 19/06/2026 | Project Team / Technical Mentor Support | Initial Project Overview based on the revised registered scope and supporting analysis documents. |

# **Purpose of This Document**

Tài liệu Project Overview là tài liệu định hướng cấp cao cho hệ thống DigiTalent AI. Mục tiêu của tài liệu là giúp toàn bộ nhóm thống nhất cùng một cách hiểu trước khi bước vào giai đoạn thiết kế chi tiết và coding. Tài liệu này không thay thế BRD, SRS, ERD hay API Specification, nhưng đóng vai trò là nền móng để các tài liệu đó bám theo một phạm vi sản phẩm rõ ràng.

Vì đây là đồ án tốt nghiệp quan trọng, tài liệu được viết theo hướng thực tế: làm rõ vấn đề doanh nghiệp, phạm vi MVP, actor, luồng nghiệp vụ cốt lõi, giá trị sản phẩm, định hướng kỹ thuật, ràng buộc, rủi ro và tiêu chí thành công. Những nội dung triển khai sau này cần ưu tiên bám sát tài liệu này để tránh code lệch phạm vi.

## **How to Use This Document**

* Dùng làm tài liệu nhập môn cho thành viên mới trong nhóm.  
* Dùng làm cơ sở để viết BRD, SRS, Use Case Specification, ERD và API Specification.  
* Dùng để kiểm soát scope khi chia task và lập sprint backlog.

# **1\. Executive Summary**

DigiTalent AI là nền tảng web dành cho doanh nghiệp nhằm quản lý đào tạo nội bộ, đánh giá năng lực số, cấp chứng chỉ nội bộ có thể xác minh và giao task thực hành sau đào tạo. Trọng tâm của hệ thống không chỉ là quản lý khóa học như một LMS thông thường, mà là quản lý vòng đời phát triển năng lực của nhân viên từ yêu cầu năng lực theo vị trí công việc đến bằng chứng năng lực thực tế.

Hệ thống hỗ trợ HR/Training Manager, Department Manager, Internal Trainer, Employee, System Admin và Certificate Verifier. Mỗi nhóm người dùng có mục tiêu riêng: HR cần nhìn năng lực toàn doanh nghiệp; Manager cần biết đội của mình yếu ở đâu và ai có rủi ro đào tạo; Trainer cần quản lý nội dung học và assessment; Employee cần học, làm bài kiểm tra, nhận chứng chỉ và nộp task thực hành; Verifier cần xác minh chứng chỉ mà không truy cập dữ liệu nhạy cảm.

MVP của DigiTalent AI sẽ tập trung vào core web application với RBAC, quản lý tổ chức và nhân viên, khung năng lực, khóa học, assessment, chứng chỉ QR, phân tích năng lực cơ bản bằng rule-based scoring, WMS-lite task workflow, dashboard mức cơ bản và chuẩn bị triển khai bằng Docker. Các phần AI nâng cao như AI Learning Assistant, semantic knowledge search, custom machine learning hoặc talent marketplace đầy đủ được đưa vào optional/future scope để đảm bảo khả thi cho nhóm 5 thành viên.

| Câu định vị ngắn gọnDigiTalent AI giúp doanh nghiệp biết nhân viên đang có năng lực gì, còn thiếu gì, cần học gì, có nguy cơ không hoàn thành đào tạo hay không, đã đủ sẵn sàng làm việc chưa và có bằng chứng thực tế chứng minh năng lực đó hay chưa. |
| :---- |

# **2\. Background and Business Context**

Trong quá trình chuyển đổi số, doanh nghiệp cần nhân viên có khả năng sử dụng công cụ số, hiểu dữ liệu, nhận thức bảo mật, cộng tác trực tuyến, quản lý tài liệu số và sử dụng AI ở mức phù hợp với công việc. Tuy nhiên, nhiều doanh nghiệp vẫn vận hành đào tạo nội bộ bằng tài liệu rời rạc, email, chat nhóm, bảng tính, bài test thủ công hoặc hệ thống LMS tách biệt.

Cách làm này tạo ra một khoảng trống lớn giữa việc “đã tham gia đào tạo” và việc “đủ năng lực làm việc”. HR có thể biết nhân viên đã hoàn thành khóa học hay chưa, nhưng thường khó xác minh nhân viên đã đạt đúng mức năng lực yêu cầu của vị trí công việc. Manager cũng thiếu công cụ để nhìn nhanh năng lực đội nhóm, người có rủi ro không hoàn thành đào tạo, chứng chỉ sắp hết hạn hoặc kết quả áp dụng sau đào tạo.

## **2.1. Current Problems**

| ID | Problem | Explanation |
| ----- | ----- | ----- |
| P-01 | Training data is fragmented | Tài liệu, khóa học, bài test, chứng chỉ và kết quả đánh giá có thể nằm ở nhiều nơi khác nhau như folder, email, chat hoặc spreadsheet. |
| P-02 | Course completion does not equal competency | Việc học xong khóa học chưa chứng minh nhân viên đã đạt đúng level năng lực mà vị trí công việc yêu cầu. |
| P-03 | Weak competency mapping | Khóa học không phải lúc nào cũng được gắn rõ với competency, level, job position hoặc department requirement. |
| P-04 | Manual and weak certificate verification | Chứng chỉ nội bộ thường thiếu mã xác minh, QR, trạng thái hết hạn/thu hồi và audit trail. |
| P-05 | Limited manager visibility | Manager thiếu dashboard để theo dõi tiến độ, risk, task evidence và readiness của nhân viên trong phòng ban. |
| P-06 | Post-training work evidence is poorly tracked | Task thực hành sau đào tạo nếu có thường xử lý qua email/chat, khó liên kết với hồ sơ năng lực. |

## **2.2. Opportunity for DigiTalent AI**

DigiTalent AI có cơ hội tạo khác biệt bằng cách kết nối ba mảng thường bị tách rời: quản trị năng lực số, đào tạo nội bộ và xác minh năng lực sau đào tạo bằng evidence. Khi kết hợp thêm chứng chỉ QR, dashboard quản trị và scoring có thể giải thích, hệ thống có thể trở thành một nền tảng capability governance gọn nhẹ, phù hợp với đồ án tốt nghiệp nhưng vẫn có tính thực tế doanh nghiệp.

# **3\. Product Vision and Positioning**

## **3.1. Vision Statement**

Xây dựng một nền tảng web giúp doanh nghiệp quản lý vòng đời năng lực số của nhân viên từ yêu cầu vị trí công việc, học tập, assessment, chứng chỉ, task thực hành, evidence đến dashboard readiness. Hệ thống hướng tới sự minh bạch, dễ triển khai, có thể mở rộng và phù hợp với môi trường doanh nghiệp vừa và nhỏ hoặc đơn vị nội bộ cần quản trị đào tạo có kiểm chứng.

## **3.2. Product Positioning**

DigiTalent AI không được định vị là bản clone của Moodle, Docebo, SAP SuccessFactors hoặc một hệ thống HRM đầy đủ. Hệ thống được định vị là Lightweight Workforce Capability Platform: một nền tảng gọn hơn enterprise suite, nhưng có đủ luồng đào tạo \- assessment \- chứng chỉ \- task evidence \- readiness để chứng minh năng lực nhân viên theo dữ liệu.

| Aspect | Traditional LMS | DigiTalent AI |
| ----- | ----- | ----- |
| Main focus | Quản lý khóa học, bài học, quiz và completion. | Quản lý năng lực theo vị trí, skill gap, learning, certificate, task evidence và readiness. |
| Success question | Ai đã học xong? | Ai đã đủ năng lực, còn thiếu gì, cần học gì và có evidence chưa? |
| Certificate | Thường là chứng nhận hoàn thành. | Chứng chỉ có mã, QR, trạng thái hiệu lực, expiry/revocation và verification log. |
| Post-training validation | Không phải trọng tâm hoặc xử lý ngoài hệ thống. | Có WMS-lite task để kiểm chứng khả năng áp dụng vào công việc. |
| AI/Intelligence | Có thể là recommendation hoặc chatbot. | Core score rule-based, AI chỉ hỗ trợ gợi ý/giải thích/task/question dưới human review. |

## **3.3. Product Principles**

* Competency-first: mọi khóa học, assessment, certificate và task nên liên kết được với competency cụ thể.  
* Explainable by design: các điểm số quan trọng như skill gap, risk và readiness phải có công thức/logic minh bạch.  
* Human-in-the-loop: AI hỗ trợ đề xuất và nội dung nháp; quyết định chính thức vẫn do HR, Trainer hoặc Manager kiểm soát.  
* Scope-controlled: ưu tiên hoàn thành MVP có thể demo end-to-end trước khi mở rộng AI nâng cao.  
* Enterprise-ready mindset: thiết kế có RBAC, audit log, file permission, cấu hình threshold và triển khai bằng Docker.

# **4\. Goals, Objectives and Success Criteria**

## **4.1. Business Goals**

* Số hóa quy trình đào tạo năng lực số nội bộ trong doanh nghiệp.  
* Giúp HR và Manager đo được khoảng cách năng lực theo phòng ban/vị trí công việc.  
* Tạo cơ chế cấp chứng chỉ nội bộ có thể xác minh bằng QR/mã chứng chỉ.  
* Liên kết kết quả đào tạo với task thực hành để tạo bằng chứng năng lực.  
* Cung cấp dashboard giúp theo dõi tiến độ, risk, certificate status, task evidence và readiness.

## **4.2. Product Objectives**

| Objective | MVP Direction | Expected Result |
| ----- | ----- | ----- |
| Digital Competency Management | Core | Quản lý competency category, competency, level và requirement theo job position/department. |
| Internal Learning & Assessment | Core | Quản lý course, lesson, material, quiz, assessment attempt và learning progress. |
| Skill Gap Analysis | Core \- rule-based | So sánh required level với current level để xác định năng lực thiếu và mức độ ưu tiên. |
| Learning Recommendation | Core \- rule-based | Đề xuất course/path dựa trên skill gap và course-competency mapping. |
| Training Risk Score | Core \- rule-based | Cảnh báo người học có khả năng trễ hoặc không đạt đào tạo dựa trên progress, score, attempts và deadline. |
| Workforce Readiness Score | Core \- rule-based | Tổng hợp competency, certificate, progress và task performance để đo readiness. |
| Digital Certificate Verification | Core | Cấp chứng chỉ có code, QR URL, trạng thái valid/expired/revoked và verification log. |
| Work-Based Competency Assessment | Core | Giao task thực hành, nộp kết quả, đánh giá và lưu competency evidence. |
| Career & Promotion Readiness | Optional/Bonus | So sánh nhân viên với vị trí mục tiêu nếu core scope hoàn thành sớm. |
| AI Learning Assistant / Knowledge Search | Future | Hỗ trợ học tập và tìm kiếm ngữ nghĩa trong giai đoạn mở rộng, không bắt buộc MVP. |

## **4.3. Success Criteria**

| Category | Criteria |
| ----- | ----- |
| Functional completeness | MVP chạy được end-to-end: tạo position requirement, gán course, employee học/làm assessment, cấp certificate, giao task, manager đánh giá, dashboard cập nhật. |
| Scope control | Không triển khai lan man sang full HRM, full LMS, talent marketplace hoặc microservices phức tạp trước khi core flow hoàn thành. |
| Data integrity | Các dữ liệu nhạy cảm như assessment score, certificate status, competency profile và task evaluation không được sửa trái quyền. |
| Explainability | Skill gap, risk score, readiness score và recommendation có logic hoặc lý do giải thích được. |
| Usability | Mỗi role có dashboard và navigation rõ ràng; người dùng có thể hoàn thành tác vụ chính mà không cần thao tác quá phức tạp. |
| Deployment readiness | Hệ thống có Docker Compose, cấu hình môi trường, Swagger/OpenAPI và hướng dẫn deploy cơ bản. |
| Defense readiness | Có demo scenario rõ ràng chứng minh khác biệt so với LMS thông thường. |

# **5\. Stakeholders and User Roles**

DigiTalent AI phục vụ nhiều vai trò trong doanh nghiệp. Mỗi vai trò cần được thiết kế theo nguyên tắc least privilege: chỉ nhìn và thao tác đúng phạm vi dữ liệu được phân quyền.

| Role | Main Goal | Key Permissions / Responsibilities |
| ----- | ----- | ----- |
| System Admin | Vận hành và cấu hình hệ thống. | Quản lý users, roles, permissions, master data, audit logs, system settings, scoring thresholds và backup/deployment settings. |
| HR / Training Manager | Quản trị đào tạo và năng lực toàn công ty. | Quản lý employee, department, job position, competency framework, course assignment, certificates, dashboards và readiness/risk overview. |
| Department Manager | Theo dõi và phát triển năng lực nhân viên trong phòng ban. | Xem nhân viên thuộc department, xem progress/risk/readiness, giao task thực hành, đánh giá task và xác nhận competency evidence. |
| Internal Trainer | Tạo và quản lý nội dung đào tạo/assessment. | Quản lý course, lesson, material, question bank, assessment, review AI question draft và theo dõi performance học viên. |
| Employee | Học tập, làm assessment, nhận chứng chỉ và nộp task. | Xem course được gán, học lesson, làm quiz/assessment, xem certificate, xem recommendation, nộp task và xem feedback. |
| Certificate Verifier | Xác minh tính hợp lệ của chứng chỉ. | Tra cứu certificate bằng code/QR và chỉ xem thông tin cần thiết để xác minh validity. |
| Company Leadership | Theo dõi năng lực số ở cấp quản trị. | Xem insight tổng quan về readiness, department strengths/weaknesses, risk và training effectiveness nếu được phân quyền. |

## **5.1. Key Access Control Notes**

* Employee không được tự chỉnh sửa assessment score, certificate status hoặc competency level của mình.  
* Department Manager chỉ xem và đánh giá nhân viên thuộc phạm vi phòng ban được phân quyền.  
* Certificate Verifier không được truy cập hồ sơ nhân viên đầy đủ; chỉ xem thông tin cần thiết của certificate.  
* Các thao tác cấp/thu hồi certificate, đánh giá task, thay đổi competency và cấu hình score phải có audit log.

# **6\. Scope Definition**

## **6.1. MVP Scope**

MVP cần đủ để chứng minh vòng đời năng lực từ yêu cầu vị trí đến evidence sau đào tạo. Các module sau được xem là phạm vi chính cần ưu tiên triển khai.

| Module | MVP Coverage |
| ----- | ----- |
| Authentication & Authorization | Login, logout, refresh token, password management cơ bản, RBAC, protected API, role-based navigation. |
| Organization & Employee Management | Department, job position, employee profile, manager assignment, employee status. |
| Competency Framework Management | Competency category, competency, level, position requirement, employee competency profile. |
| Course & Learning Management | Course, module/lesson, learning material, course-competency mapping, course assignment, progress tracking. |
| Assessment & Question Bank | Question bank, quiz/final assessment, attempt, scoring, pass/fail rule. |
| Capability Analysis | Skill gap, learning recommendation, training risk score và workforce readiness score ở mức rule-based. |
| Certificate Management | Certificate generation, certificate code, QR verification URL, valid/expired/revoked status, verification page/log. |
| WMS-lite Practical Task | Task suggestion/manual task, assignment, deadline, expected output, submission, evaluation, feedback và evidence. |
| Dashboard & Analytics | Dashboard cơ bản cho HR, Manager, Trainer và Employee. |
| Notification & Reminder | In-app/SignalR notification cho course assignment, deadlines, certificate expiry, task update và risk alert ở mức cơ bản. |
| Admin & Master Data | Users, roles, permissions, master data, scoring thresholds, certificate expiry rules và audit logs. |

## **6.2. Optional / Bonus Scope**

* AI Question Draft cho Trainer tạo câu hỏi nháp và Trainer duyệt trước khi publish.  
* AI Task Suggestion tạo task thực hành và evaluation criteria dựa trên skill gap hoặc course đã hoàn thành.  
* Career & Promotion Readiness so sánh employee với target position.  
* Competency Heatmap nâng cao theo department/job position.  
* Learning ROI hoặc training improvement analysis nếu có đủ dữ liệu demo.  
* AI Explanation chi tiết cho recommendation, risk và readiness.

## **6.3. Out of Scope for MVP**

* Native mobile application.  
* Full HRM suite như payroll, attendance, leave management hoặc performance review đầy đủ.  
* Full LMS clone với livestream, video call, classroom scheduling hoặc e-commerce course marketplace.  
* Full project management/Kanban như Jira/Trello; WMS-lite chỉ phục vụ task thực hành sau đào tạo.  
* Complex microservices architecture trong giai đoạn đầu.  
* Blockchain certificate verification.  
* Custom machine learning model hoặc training model riêng khi chưa có dữ liệu đủ lớn.  
* Full AI tutor, semantic knowledge search và pgvector ở MVP nếu core flow chưa hoàn thành.  
* Enterprise SSO/LDAP/HRM integration ở MVP.

# **7\. High-Level Business Workflow**

Luồng nghiệp vụ cốt lõi của DigiTalent AI cần được triển khai theo logic dưới đây. Đây cũng nên là demo scenario chính khi bảo vệ.

| Step | Stage | Description |
| ----- | ----- | ----- |
| 1 | Setup Organization | Admin/HR tạo department, job position và employee profile. |
| 2 | Define Competency Requirements | HR tạo competency framework và map required competencies cho từng job position. |
| 3 | Create Training Content | Trainer tạo course, lesson, material, question bank và assessment; course được gắn với competency. |
| 4 | Assign Learning | HR/Manager gán course cho employee, department hoặc job position. |
| 5 | Analyze Skill Gap | System so sánh current competency với required competency để xác định gap. |
| 6 | Recommend Learning Path | System đề xuất course/path phù hợp dựa trên skill gap và course-competency mapping. |
| 7 | Learn and Assess | Employee học lesson, làm quiz/final assessment và hệ thống ghi nhận progress/score. |
| 8 | Issue Certificate | Nếu đạt điều kiện, hệ thống cấp certificate có code, QR và trạng thái hiệu lực. |
| 9 | Assign Practical Task | Manager giao task thực hành để kiểm chứng năng lực sau đào tạo. |
| 10 | Submit Evidence | Employee cập nhật tiến độ và nộp file/link/kết quả task. |
| 11 | Evaluate Task | Manager đánh giá score, feedback và xác nhận competency evidence. |
| 12 | Update Readiness Dashboard | System cập nhật competency profile, evidence portfolio, risk/readiness score và dashboard. |

| Core demo loopPosition Requirement → Skill Gap → Course Recommendation → Learning → Assessment → Certificate → Practical Task → Manager Evaluation → Competency Evidence → Readiness Dashboard |
| :---- |

## **7.1. Certificate Verification Flow**

1. Employee hoàn thành course và đạt final assessment theo điều kiện.  
2. System tạo certificate code duy nhất và QR verification URL.  
3. System sinh PDF certificate và lưu thông tin certificate vào database.  
4. Employee tải hoặc xem certificate.  
5. Verifier quét QR hoặc nhập certificate code để kiểm tra validity.  
6. System hiển thị trạng thái VALID, EXPIRED hoặc REVOKED và ghi verification log nếu cần.

## **7.2. WMS-lite Task Evidence Flow**

7. System/AI hoặc Manager xác định nhân viên cần task thực hành để kiểm chứng competency.  
8. Manager tạo/giao task với mô tả, deadline, expected output và evaluation criteria.  
9. Employee nhận task, cập nhật tiến độ và nộp evidence.  
10. Manager đánh giá task score, ghi feedback và xác nhận competency impact.  
11. System lưu Competency Evidence và tính lại readiness score nếu thỏa điều kiện.

# **8\. High-Level Functional Modules**

| Code | Module | Description |
| ----- | ----- | ----- |
| M01 | Authentication & Authorization | Xác thực, JWT, refresh token, RBAC, permission check, session control, audit log. |
| M02 | Organization & Employee Management | Quản lý phòng ban, vị trí công việc, hồ sơ nhân viên và manager assignment. |
| M03 | Competency Framework | Quản lý nhóm năng lực, năng lực, level, criteria, position requirements và employee competency. |
| M04 | Course & Learning Management | Quản lý khóa học, bài học, tài liệu, course assignment, progress và course-competency mapping. |
| M05 | Assessment & Question Bank | Quản lý câu hỏi, quiz/final assessment, attempt, scoring và pass rule. |
| M06 | Certificate Management | Cấp chứng chỉ, QR verification, expiry/revocation và certificate audit. |
| M07 | Capability Intelligence Engine | Skill gap, recommendation, training risk, readiness score và optional AI explanation. |
| M08 | WMS-lite Task Management | Giao task thực hành, submission, evaluation, feedback và competency evidence. |
| M09 | Dashboard & Analytics | Dashboard theo role: HR, Manager, Trainer, Employee; KPI và overview. |
| M10 | Notification & Reminder | SignalR/in-app notifications cho assignment, deadline, expiry, feedback và risk. |
| M11 | File Storage | Upload/download lesson materials, task evidence files và generated certificate PDFs qua MinIO. |
| M12 | Admin & Configuration | Master data, score threshold, readiness weights, certificate rules, audit log và system settings. |

## **8.1. Module Dependency Notes**

Một số module có dependency rõ ràng và nên được triển khai theo thứ tự để giảm rủi ro: Auth/RBAC → Organization/Employee → Competency Framework → Course/Learning → Assessment → Certificate → WMS-lite Task → Dashboard → Bonus AI. Không nên làm dashboard hoặc AI trước khi dữ liệu lõi chưa ổn định.

# **9\. High-Level Data View**

Tài liệu này chưa thay thế ERD, nhưng cần xác định trước các nhóm dữ liệu chính để team backend/frontend cùng hiểu cấu trúc domain.

| Domain | Representative Entities | Notes |
| ----- | ----- | ----- |
| Auth & Security | User, Role, Permission, UserRole, RefreshToken, AuditLog | Nền tảng bảo mật, phân quyền và truy vết thao tác. |
| Organization | Department, JobPosition, EmployeeProfile, ManagerAssignment | Dùng để giới hạn dữ liệu theo phòng ban/vị trí. |
| Competency | CompetencyCategory, Competency, CompetencyLevel, PositionCompetencyRequirement, EmployeeCompetencyProfile | Nền tảng để tính skill gap và readiness. |
| Learning | Course, CourseModule, Lesson, LearningMaterial, CourseCompetency, Enrollment, LessonProgress | Theo dõi quá trình học và mapping với competency. |
| Assessment | QuestionBank, Question, Option, Assessment, AssessmentQuestion, Attempt, Answer | Lưu câu hỏi, attempt, scoring và pass/fail. |
| Certificate | CertificateTemplate, Certificate, CertificateVerificationLog | Cấp và xác minh certificate bằng code/QR. |
| Task Evidence | PracticalTask, TaskAssignment, TaskSubmission, TaskEvaluation, CompetencyEvidence | Lưu task thực hành và evidence liên quan competency. |
| Intelligence | SkillGapResult, LearningRecommendation, TrainingRiskScore, ReadinessScore, AIExplanationLog | Lưu kết quả tính toán và explanation snapshot. |
| Notification | Notification, NotificationRecipient, ReminderJob | Thông báo assignment, deadline, expiry, feedback và risk. |

## **9.1. Data Governance Principles**

* Không hard delete dữ liệu nghiệp vụ quan trọng như certificate, assessment attempt, task evaluation và competency evidence.  
* Các bảng quan trọng cần có created\_at, updated\_at, created\_by, updated\_by và status nếu phù hợp.  
* Score threshold, readiness weights, certificate expiry rule và risk threshold nên lưu cấu hình, không hard-code trong code.  
* Các thao tác nhạy cảm cần audit log: cấp/thu hồi certificate, thay đổi competency, đánh giá task, chỉnh cấu hình score.  
* File upload cần lưu metadata, owner, permission scope và object path trong MinIO thay vì lưu file trực tiếp vào database.

# **10\. Technical Overview**

## **10.1. Confirmed Technology Stack**

| Layer | Technology | Purpose |
| ----- | ----- | ----- |
| Frontend | ReactJS, TypeScript, TailwindCSS, ShadCN/UI | Xây dựng giao diện enterprise dashboard, forms, tables, role-based portal và responsive UI. |
| Backend | ASP.NET Core / C\# | Triển khai RESTful API, business logic, RBAC, scoring, certificate, learning, assessment và task workflow. |
| Database | PostgreSQL | Lưu dữ liệu quan hệ, competency records, learning metadata, assessment results, certificate records và dashboard queries. |
| File Storage | MinIO hoặc object storage tương thích S3 | Lưu lesson materials, task submission files và generated certificate PDFs. |
| Cache / Background Jobs | Redis optional | Cache dashboard, queue/reminder jobs và performance optimization nếu cần. |
| Realtime | SignalR | In-app notifications cho course assignment, task updates, deadline reminders và risk alerts. |
| API Documentation | Swagger/OpenAPI | Tài liệu hóa API, request/response, auth và validation. |
| Deployment | Docker, Docker Compose, Nginx | Đóng gói và triển khai frontend/backend/database/storage/cache/reverse proxy. |
| CI/CD | GitHub Actions | Build/test/deploy pipeline cơ bản. |

## **10.2. Architecture Direction**

DigiTalent AI nên triển khai theo hướng Modular Monolith trong giai đoạn Capstone. Backend ASP.NET Core được chia theo domain/module rõ ràng thay vì tách microservices sớm. Cách này giúp team kiểm soát scope, giảm chi phí vận hành, dễ debug, dễ triển khai Docker Compose và vẫn có khả năng tách module sau này nếu sản phẩm mở rộng.

| Layer | Responsibility |
| ----- | ----- |
| Presentation/API Layer | Controllers, request validation, authentication/authorization attributes, response mapping. |
| Application/Service Layer | Business use cases, orchestration, scoring rules, transaction handling, permission checks. |
| Domain Layer | Core entities, enums, domain rules, status transitions, validation rules độc lập với infrastructure. |
| Infrastructure Layer | PostgreSQL access, MinIO file service, Redis/cache, SignalR hub, email/notification adapters, external AI adapters. |
| Frontend Layer | Role-based routes, layout, forms, tables, API clients, validation, loading/error states và reusable components. |

## **10.3. Security Direction**

* JWT access token kết hợp refresh token để quản lý phiên đăng nhập.  
* Password hashing an toàn; không lưu password plain text.  
* RBAC kết hợp permission check theo module/action và department-level data access.  
* File upload cần validate extension, size, MIME type và permission trước khi download.  
* Certificate verification endpoint phải giới hạn dữ liệu trả về, tránh lộ thông tin nội bộ.  
* CORS, environment variables, secret management và rate limit cơ bản cần được cấu hình đúng khi deploy.

# **11\. AI and Rule-Based Intelligence Overview**

Để đảm bảo tính khả thi và khả năng giải thích khi bảo vệ, DigiTalent AI sẽ không phụ thuộc hoàn toàn vào AI/LLM cho các quyết định quan trọng. MVP dùng rule-based scoring cho các chỉ số chính; LLM nếu tích hợp sẽ hỗ trợ gợi ý nội dung, giải thích hoặc tạo draft dưới sự duyệt của con người.

| Feature | MVP Level | Implementation Direction |
| ----- | ----- | ----- |
| Skill Gap Analysis | Core \- rule-based | Required Competency Level \- Current Competency Level; ưu tiên gap theo weight/mandatory flag. |
| Learning Recommendation | Core \- rule-based | Map skill gap với course competencies, prerequisite, priority và employee history. |
| Training Risk Score | Core \- rule-based | Tính risk dựa trên inactivity, low score rate, deadline pressure, failed attempts và progress delay. |
| Workforce Readiness Score | Core \- rule-based | Tổng hợp competency, certificate, learning progress, compliance/task performance theo weight cấu hình. |
| AI Task Suggestion | Optional/Bonus | LLM đề xuất task và criteria; Manager duyệt/chỉnh trước khi giao. |
| AI Question Draft | Optional/Bonus | LLM tạo câu hỏi nháp; Trainer duyệt trước khi publish. |
| AI Learning Assistant | Future | Hỏi đáp/tóm tắt bài học/giải thích đáp án sai khi có thời gian và dữ liệu nội dung ổn định. |
| AI Knowledge Search | Future | Semantic search/pgvector nếu core scope hoàn tất và có dữ liệu tài liệu đủ tốt. |

## **11.1. Human-in-the-Loop Rules**

* AI không tự cấp certificate.  
* AI không tự thay đổi competency level nếu không có rule hoặc người duyệt.  
* Trainer phải duyệt AI-generated questions trước khi sử dụng chính thức.  
* Manager/HR phải duyệt task, evaluation hoặc quyết định phát triển nhân sự.  
* Các output AI quan trọng nên lưu explanation/input snapshot để audit và phục vụ bảo vệ.

# **12\. Non-Functional Requirements Direction**

| Quality Attribute | Direction for MVP |
| ----- | ----- |
| Usability | Giao diện rõ role, sidebar dễ hiểu, form/table nhất quán, trạng thái loading/empty/error đầy đủ. |
| Maintainability | Code chia module rõ ràng, đặt tên tiếng Anh, không hard-code business thresholds, có convention cho backend/frontend. |
| Security | JWT, RBAC, password hashing, audit log, file permission và department-level access control. |
| Performance | Pagination/filter/sort cho bảng lớn; dashboard query tối ưu; Redis optional cho cache nếu cần. |
| Reliability | Transaction cho nghiệp vụ quan trọng như submit assessment, issue certificate, evaluate task. |
| Scalability | Modular Monolith có boundary rõ, có thể tách module về sau nếu cần. |
| Observability | Logging cơ bản cho API errors, auth events, certificate/task/competency changes. |
| Deployment Readiness | Docker Compose chạy được local/staging; Nginx reverse proxy; environment variables tách biệt. |
| Documentation | Có Swagger/OpenAPI, README setup, ERD, API spec, RBAC matrix và deployment guide. |

# **13\. Assumptions, Constraints and Dependencies**

## **13.1. Assumptions**

* Doanh nghiệp có cấu trúc phòng ban, vị trí công việc và nhân viên đủ để mô phỏng dữ liệu demo.  
* Mỗi vị trí công việc có thể được mô tả bằng một tập required competencies và level yêu cầu.  
* Course có thể được gắn với một hoặc nhiều competencies để phục vụ recommendation và tracking.  
* Manager có thẩm quyền đánh giá task thực hành của nhân viên thuộc phạm vi quản lý.  
* MVP có thể dùng dữ liệu seed/mock enterprise để demo thay vì tích hợp HRM thật.

## **13.2. Constraints**

* Nhóm có 5 thành viên, cần kiểm soát scope theo sprint và ưu tiên end-to-end flow.  
* Không nên xây custom ML model vì thiếu dữ liệu lớn và thời gian huấn luyện/đánh giá.  
* Không nên triển khai microservices phức tạp ở giai đoạn Capstone.  
* AI API nếu dùng cần có fallback khi hết quota/lỗi mạng, và không được chặn core business flow.  
* Tài liệu, ERD và API contract cần chốt sớm để frontend/backend không phát triển lệch nhau.

## **13.3. External Dependencies**

| Dependency | Usage | Risk / Note |
| ----- | ----- | ----- |
| OpenAI API / Gemini API optional | AI suggestion/explanation/draft nếu triển khai bonus. | Có thể tốn chi phí hoặc lỗi quota; không phụ thuộc cho core scoring. |
| MinIO / S3-compatible storage | File upload/download và certificate PDF. | Cần cấu hình bucket, access key, policy và backup. |
| SignalR | Realtime notification. | Có thể làm polling/in-app notification trước nếu SignalR chưa kịp. |
| Redis optional | Cache/dashboard/background reminder. | Có thể defer nếu MVP chưa cần performance optimization. |
| GitHub Actions | CI/CD. | Cần cấu hình secrets và branch protection. |

# **14\. Key Risks and Mitigation**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| Scope creep do nhiều module và nhiều ý tưởng AI. | Trễ tiến độ, core flow không hoàn thành. | Chốt MVP theo revised scope; AI advanced để optional/future; demo end-to-end trước. |
| Thiết kế database chưa kỹ. | Code backend khó sửa, frontend bị ảnh hưởng, dashboard sai dữ liệu. | Làm ERD và business rules trước khi code; review quan hệ chính. |
| RBAC sai hoặc thiếu kiểm soát department-level. | Rủi ro bảo mật và lỗi nghiệp vụ nghiêm trọng. | Viết permission matrix; test các case Manager/Employee/Verifier. |
| Score formulas hard-code. | Khó giải thích, khó chỉnh khi mentor hỏi. | Đưa threshold/weights vào configuration hoặc bảng settings. |
| Dashboard làm trước khi dữ liệu lõi ổn định. | Hiển thị số liệu giả hoặc khó maintain. | Làm dashboard sau khi course/assessment/certificate/task đã có dữ liệu thật. |
| Frontend/backend lệch API contract. | Mất thời gian tích hợp. | Chốt API spec, Swagger, shared DTO examples và review PR. |
| AI API không ổn định hoặc tốn phí. | Demo lỗi nếu phụ thuộc AI. | Core rule-based luôn chạy độc lập; AI chỉ là bonus có fallback. |
| Deploy phức tạp. | Không demo được bản online/staging. | Docker Compose từ sớm; có local/staging environment và README setup. |

# **15\. Readiness Checklist Before Coding**

Trước khi bắt đầu coding từng module, nhóm nên đảm bảo module đó đã có đủ thông tin tối thiểu theo checklist dưới đây. Đây là cách tránh code theo cảm tính và giảm rủi ro refactor lớn.

| Checklist Item | Required Before Implementation |
| ----- | ----- |
| Business flow | Đã mô tả main flow, alternative flow và exception flow. |
| Actor & permission | Đã xác định role nào được xem/tạo/sửa/xóa/duyệt. |
| Data model | Đã có entity, fields chính, relationships, status và audit requirements. |
| API contract | Đã có endpoint, request, response, validation và error cases. |
| UI states | Đã xác định list/detail/form/loading/empty/error/success states. |
| Business rules | Đã ghi rõ điều kiện pass/fail, issue/revoke, evaluate/update, score/threshold. |
| Test cases | Đã có ít nhất happy path, validation path, permission denied path và edge cases quan trọng. |

## **15.1. Recommended Implementation Order**

12. Foundation: repository setup, Docker Compose local, backend skeleton, frontend skeleton, PostgreSQL, auth base.  
13. Auth/RBAC: user, role, permission, JWT, refresh token, protected routes.  
14. Organization: department, job position, employee profile, manager assignment.  
15. Competency: category, competency, level, position requirement, employee competency profile.  
16. Learning: course, lesson, material upload, course-competency mapping, enrollment/progress.  
17. Assessment: question bank, assessment, attempt, scoring and pass rule.  
18. Certificate: issue certificate, generate PDF/QR, verify by code/QR, revoke/expire.  
19. Capability Analysis: skill gap, recommendation, risk, readiness based on real data.  
20. WMS-lite Task: assign, submit, evaluate, evidence, update readiness.  
21. Dashboard & Notification: role dashboards, SignalR/in-app notifications, final polish.  
22. Bonus AI: question draft, task suggestion, AI explanation, career readiness if core flow is stable.

# **16\. Defense-Oriented Demo Scenario**

Demo nên kể một câu chuyện doanh nghiệp đơn giản, có dữ liệu rõ ràng và đi qua đủ điểm khác biệt của hệ thống.

| Demo Step | What to Show | Value Demonstrated |
| ----- | ----- | ----- |
| 1\. Create position requirement | HR cấu hình vị trí Marketing Executive cần Data Literacy level 3 và AI Productivity level 2\. | Hệ thống quản trị năng lực theo vị trí. |
| 2\. View employee gap | Employee A hiện thiếu Data Literacy. | Skill Gap Analysis trả lời nhân viên thiếu gì. |
| 3\. Recommend course | System đề xuất Data Analytics Basic. | Learning Recommendation có căn cứ từ competency mapping. |
| 4\. Assign and learn | HR/Manager gán course; Employee học và làm assessment. | Internal Learning & Assessment. |
| 5\. Issue certificate | Employee đạt điều kiện và được cấp certificate có QR. | Digital Certificate Verification. |
| 6\. Assign task | Manager giao task tạo báo cáo chiến dịch marketing. | WMS-lite kiểm chứng áp dụng thực tế. |
| 7\. Evaluate evidence | Employee nộp file; Manager đánh giá và xác nhận competency evidence. | Competency Evidence Portfolio. |
| 8\. Dashboard update | Readiness score và dashboard phòng ban cập nhật. | Quản trị năng lực bằng dữ liệu, không chỉ course completion. |

# **17\. Glossary**

| Term | Meaning in DigiTalent AI |
| ----- | ----- |
| Competency | Một năng lực cụ thể mà nhân viên cần có, ví dụ AI Literacy, Data Literacy, Cybersecurity Awareness. |
| Competency Level | Cấp độ thành thạo của competency, ví dụ level 1-5 hoặc beginner/intermediate/advanced. |
| Position Requirement | Bộ competency và level yêu cầu cho một vị trí công việc. |
| Skill Gap | Khoảng cách giữa level yêu cầu và level hiện tại của nhân viên. |
| Learning Recommendation | Đề xuất course/path dựa trên skill gap và mapping giữa course với competency. |
| Training Risk Score | Điểm cảnh báo nguy cơ nhân viên chậm/trượt/không hoàn thành đào tạo. |
| Workforce Readiness Score | Điểm tổng hợp phản ánh mức độ sẵn sàng làm việc dựa trên competency, certificate, progress và task performance. |
| WMS-lite | Luồng giao task thực hành sau đào tạo, không phải hệ thống quản lý công việc đầy đủ. |
| Competency Evidence | Bằng chứng chứng minh năng lực, gồm assessment, certificate, task submission, manager review hoặc manual evidence. |
| Certificate Verifier | Người kiểm tra chứng chỉ bằng code hoặc QR mà không truy cập dữ liệu nội bộ nhạy cảm. |

# **18\. Source Traceability**

Tài liệu này được tổng hợp và chuẩn hóa từ các tài liệu đầu vào nội bộ của đề tài. Bản Revised Scope được ưu tiên làm nguồn chính vì đây là phạm vi đã đăng ký chính thức với hội đồng.

| Source Document | How It Is Used |
| ----- | ----- |
| Capstone\_Project\_Register\_DigiTalent\_AI\_Revised\_Scope.docx | Nguồn chính cho tên đề tài, mô tả, scope MVP, objective, expected deliverables, technology stack và AI integration strategy. |
| Capstone\_Project\_Register\_DigiTalent\_AI.docx | Nguồn tham khảo cho bản scope mở rộng, capability intelligence và một số feature bonus. |
| De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx | Nguồn tham khảo cho định vị sau khảo sát 14 hệ thống, điểm khác biệt, risk, WMS-lite, evidence portfolio và demo script. |

Khi các tài liệu BRD, SRS, ERD, API Specification hoặc UI/UX Specification được tạo tiếp theo, mọi nội dung nên trace ngược được về Project Overview và Revised Scope để đảm bảo thống nhất phạm vi.