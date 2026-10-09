**DigiTalent AI**

**Project Overview Document**

*Nền tảng đào tạo, đánh giá năng lực số và cấp chứng chỉ nội bộ*  
*cho nhân viên doanh nghiệp kết hợp giao việc thực hành sau đào tạo*

*Digital Competency Training, Internal Certification and Work-Based Assessment Platform*

Document Code: 01\_Project\_Overview  
Version: 1.0  
Status: Working baseline aligned to Master System Overview
Prepared for: Capstone Project Implementation  
Date: 09/10/2026

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
| Main Technology Stack | React + TypeScript, ASP.NET Core/C#, PostgreSQL; responsive UI; local file storage for development and S3-compatible/MinIO when integrated; Docker Compose/OpenAPI as deployment and documentation directions. Redis and SignalR are not required MVP dependencies. |
| Intended Readers | Project team, mentor, reviewers, developers, testers and stakeholders involved in the Capstone project |

## **Revision History**

| Version | Date | Author/Role | Summary |
| ----- | ----- | ----- | ----- |
| 1.0 | 19/06/2026 | Project Team / Technical Mentor Support | Initial Project Overview based on the revised registered scope and supporting analysis documents. |
| 1.1 | 09/10/2026 | Project Team | Aligned Enterprise Capstone scope, roles, competency framework, certificate rules and evidence review with the Master System Overview; unresolved GRADE-01 remains pending. |

# **Purpose of This Document**

Tài liệu Project Overview là tài liệu định hướng cấp cao cho hệ thống DigiTalent AI. Mục tiêu của tài liệu là giúp toàn bộ nhóm thống nhất cùng một cách hiểu trước khi bước vào giai đoạn thiết kế chi tiết và coding. Tài liệu này không thay thế BRD, SRS, ERD hay API Specification, nhưng đóng vai trò là nền móng để các tài liệu đó bám theo một phạm vi sản phẩm rõ ràng.

Vì đây là đồ án tốt nghiệp quan trọng, tài liệu được viết theo hướng thực tế: làm rõ vấn đề doanh nghiệp, phạm vi MVP, actor, luồng nghiệp vụ cốt lõi, giá trị sản phẩm, định hướng kỹ thuật, ràng buộc, rủi ro và tiêu chí thành công. Những nội dung triển khai sau này cần ưu tiên bám sát tài liệu này để tránh code lệch phạm vi.

## **How to Use This Document**

* Dùng làm tài liệu nhập môn cho thành viên mới trong nhóm.  
* Dùng làm cơ sở để viết BRD, SRS, Use Case Specification, ERD và API Specification.  
* Dùng để kiểm soát scope khi chia task và lập sprint backlog.

# **1\. Executive Summary**

DigiTalent AI là nền tảng web Enterprise Capstone giúp doanh nghiệp quản lý yêu cầu năng lực theo vị trí, khoảng cách năng lực đã được xác nhận, đào tạo, đánh giá học tập, chứng chỉ nội bộ và minh chứng công việc được con người duyệt. Hoàn thành khóa học, điểm assessment hay chứng chỉ là Learning Achievement, không tự xác nhận Confirmed Workplace Competency.

MVP có bốn role nghiệp vụ: PLATFORM_ADMIN, OWNER, MANAGER (optional) và EMPLOYEE. PLATFORM_ADMIN quản lý framework TT02 và nội dung học chuẩn; OWNER quản trị tổ chức và toàn bộ phạm vi doanh nghiệp; MANAGER chỉ thao tác trong phòng ban được phân công; EMPLOYEE dùng các chức năng học tập và hồ sơ của chính mình. Không có Internal Trainer hoặc Public Visitor role trong baseline này.

Enterprise MVP gồm FE-01 đến FE-09: authentication/workspace/RBAC; tổ chức, phòng ban, vị trí và thành viên; framework TT02; position requirements; confirmed competency và skill gap; learning/assessment; practical task/evidence review; dashboard/thông báo; platform administration. Risk/readiness scoring, Individual/B2C, public certificate verification và các role ngoài bốn role trên không thuộc baseline Capstone. Không suy ra trạng thái triển khai từ mô tả yêu cầu trong tài liệu này.

| Câu định vị ngắn gọnDigiTalent AI giúp doanh nghiệp quản lý năng lực theo vị trí, nhận biết Skill Gap, tự đề xuất khóa học phù hợp và hỗ trợ review evidence áp dụng thực tế dưới quyết định của người có thẩm quyền. |
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
| P-05 | Limited manager visibility | Manager thiếu dashboard để theo dõi tiến độ, certificate status, task evidence và competency gap của nhân viên trong phạm vi. |
| P-06 | Post-training work evidence is poorly tracked | Task thực hành sau đào tạo nếu có thường xử lý qua email/chat, khó liên kết với hồ sơ năng lực. |

## **2.2. Opportunity for DigiTalent AI**

DigiTalent AI có cơ hội tạo khác biệt bằng cách kết nối quản trị năng lực số, đào tạo nội bộ và review evidence sau đào tạo. Chứng chỉ QR nội bộ, dashboard theo quyền và Skill Gap minh bạch giúp doanh nghiệp tách learning achievement khỏi năng lực công việc đã được xác nhận.

# **3\. Product Vision and Positioning**

## **3.1. Vision Statement**

Xây dựng nền tảng web giúp doanh nghiệp quản lý năng lực số từ yêu cầu vị trí đến học tập, assessment, chứng chỉ nội bộ và review evidence công việc. Dashboard tập trung vào requirement, learning, certificate và Skill Gap theo phạm vi quyền.

## **3.2. Product Positioning**

DigiTalent AI không được định vị là bản clone của LMS hoặc HRM đầy đủ. Hệ thống kết nối position requirement, Skill Gap, học tập, chứng chỉ nội bộ và evidence review để phân biệt learning achievement với workplace competency đã xác nhận.

| Aspect | Traditional LMS | DigiTalent AI |
| ----- | ----- | ----- |
| Main focus | Quản lý khóa học, bài học, quiz và completion. | Quản lý requirement theo vị trí, confirmed competency, skill gap, learning, certificate và task evidence. |
| Success question | Ai đã học xong? | Ai đã đủ năng lực, còn thiếu gì, cần học gì và có evidence chưa? |
| Certificate | Thường là chứng nhận hoàn thành. | Chứng chỉ nội bộ cho course eligible, có code/QR nội bộ, Valid/Revoked; không expiry. |
| Post-training validation | Không phải trọng tâm hoặc xử lý ngoài hệ thống. | Có WMS-lite task để kiểm chứng khả năng áp dụng vào công việc. |
| AI/Intelligence | Có thể gồm recommendation hoặc chatbot. | Course recommendation và Skill Gap dùng quy tắc giải thích được; AI có thể hỗ trợ phân tích Practical Task evidence theo rubric, nhưng OWNER/MANAGER quyết định cuối; risk/readiness scoring không thuộc Enterprise MVP. |

## **3.3. Product Principles**

* Competency-first: mọi khóa học, assessment, certificate và task nên liên kết được với competency cụ thể.  
* Explainable by design: Skill Gap và course recommendation phải có logic minh bạch; không có risk/readiness score trong Enterprise MVP.
* Human review: OWNER/MANAGER review evidence trong phạm vi; AI evaluator chỉ đề xuất, không quyết định competency; nội dung học chuẩn do PLATFORM_ADMIN quản lý.
* Explainable learning: hệ thống tự đề xuất khóa học theo Skill Gap và competency-course mapping; OWNER cũng có thể chủ động giao khóa học khi tổ chức cập nhật hoặc yêu cầu đào tạo lại.
* Scope-controlled: AI-assisted Practical Task Evaluation là mở rộng scope/effort cần được ghi nhận trong Report 1/2; tài liệu yêu cầu không xác nhận tính năng đã được triển khai.
* Enterprise-ready mindset: thiết kế có RBAC, audit log, file permission, version history và triển khai bằng Docker.

# **4\. Goals, Objectives and Success Criteria**

## **4.1. Business Goals**

* Số hóa quy trình đào tạo năng lực số nội bộ trong doanh nghiệp.  
* Giúp HR và Manager đo được khoảng cách năng lực theo phòng ban/vị trí công việc.  
* Tạo cơ chế cấp chứng chỉ nội bộ có thể xác minh bằng QR/mã chứng chỉ.  
* Liên kết kết quả đào tạo với task thực hành để tạo bằng chứng năng lực.  
* Cung cấp dashboard theo dõi requirement, Skill Gap, learning, certificate và task evidence theo quyền.

## **4.2. Product Objectives**

| Objective | MVP Direction | Expected Result |
| ----- | ----- | ----- |
| Digital Competency Management | Core | Framework TT02 gồm 6 miền/24 năng lực; đào tạo nhóm bậc 1–6 thành 3 Training Level. GRADE-01 về lưu Grade 1–6 so với Level 1–3 vẫn pending. |
| Internal Learning & Assessment | Core | Quản lý course, lesson, material, quiz, assessment attempt và learning progress. |
| Skill Gap Analysis | Core \- rule-based | So sánh required level với current level để xác định năng lực thiếu và mức độ ưu tiên. |
| Learning Recommendation | Core \- rule-based | Đề xuất course/path dựa trên skill gap và course-competency mapping. |
| Training Risk Score | Out of Enterprise Capstone MVP | Không thuộc baseline hiện tại. |
| Workforce Readiness Score | Out of Enterprise Capstone MVP | Không thuộc baseline hiện tại. |
| Digital Certificate Verification | Core | Course eligible + required lessons + đỗ final assessment; QR verification nội bộ yêu cầu OWNER/MANAGER cùng tổ chức đăng nhập; Valid/Revoked, không expiry. |
| Work-Based Competency Assessment | Core workflow; AI evaluator expansion pending scope alignment | Giao task, nộp evidence; OWNER/MANAGER review theo rubric. Nếu được duyệt, AI-assisted evaluation đề xuất điểm theo tiêu chí, rationale, căn cứ và gaps; chỉ reviewer approval hợp lệ mới có thể cập nhật Confirmed Competency. Điểm task tách biệt Competency Level. |
| Individual/B2C workspace, trial, payment | Out of Enterprise Capstone MVP | Roadmap sản phẩm riêng, không gộp vào Capstone baseline. |
| AI Learning Assistant / Knowledge Search | Future | Hỗ trợ học tập và tìm kiếm ngữ nghĩa trong giai đoạn mở rộng, không bắt buộc MVP. |

## **4.3. Success Criteria**

| Category | Criteria |
| ----- | ----- |
| Functional completeness | MVP chạy được end-to-end: tạo position requirement, tự đề xuất course và OWNER có thể giao course, employee học/làm assessment, cấp certificate, giao task, AI hỗ trợ nếu nằm trong scope được duyệt, manager review, dashboard cập nhật. |
| Scope control | Không triển khai lan man sang full HRM, full LMS, talent marketplace hoặc microservices phức tạp trước khi core flow hoàn thành. |
| Data integrity | Các dữ liệu nhạy cảm như assessment score, certificate status, competency profile và task evaluation không được sửa trái quyền. |
| Explainability | Skill Gap và course recommendation có logic/lý do giải thích được. |
| Usability | Mỗi role có dashboard và navigation rõ ràng; người dùng có thể hoàn thành tác vụ chính mà không cần thao tác quá phức tạp. |
| Deployment readiness | Hệ thống có Docker Compose, cấu hình môi trường, Swagger/OpenAPI và hướng dẫn deploy cơ bản. |
| Defense readiness | Có demo scenario rõ ràng chứng minh khác biệt so với LMS thông thường. |

# **5\. Stakeholders and User Roles**

DigiTalent AI phục vụ nhiều vai trò trong doanh nghiệp. Mỗi vai trò cần được thiết kế theo nguyên tắc least privilege: chỉ nhìn và thao tác đúng phạm vi dữ liệu được phân quyền.

| Role | Main Goal | Key Permissions / Responsibilities |
| ----- | ----- | ----- |
| PLATFORM_ADMIN | Quản trị cấu hình nền tảng và nội dung tham chiếu. | Quản lý tổ chức/platform users; TT02 version, grade criteria; standard course/lesson, question bank, assessment và reference positions. Không mặc định xem private evidence của doanh nghiệp. |
| OWNER | Quản trị tổ chức. | Quản lý thành viên, phòng ban, vị trí, requirement set; theo dõi đề xuất và tiến độ khóa học; chủ động giao course khi có cập nhật/đào tạo lại; giao task, review/duyệt AI-assisted task evaluation trong phạm vi; quản lý và thu hồi chứng chỉ. Không sửa standard content và không tự sửa grade của mình. |
| MANAGER (optional) | Theo dõi nhân viên trong phòng ban được phân công. | Xem gap, learning và certificate trong phạm vi; giao Practical Task và review/chỉnh sửa/duyệt AI-assisted evaluation. Không quản lý standard content, organization setup, requirement hoặc revoke certificate. |
| EMPLOYEE | Học, thi, xem kết quả/chứng chỉ và nộp evidence. | Chỉ truy cập dữ liệu của chính mình; không tự xác nhận workplace competency. |

## **5.1. Key Access Control Notes**

* Backend phải thực thi role và data scope; MANAGER chỉ truy cập phòng ban được phân công.
* Chỉ OWNER/MANAGER trong đúng tổ chức được đăng nhập để xác minh QR chứng chỉ. Verification chỉ trả holder name, course/competency, issue date và status.
* Evidence Passed, được reviewer duyệt theo từng competency và đánh dấu level-confirming mới có thể tăng Confirmed Competency. Correction có kiểm soát có thể giảm/reset grade. Learning score/chứng chỉ không tự đổi grade.
* OWNER Override chỉ giảm/reset grade để sửa lỗi dữ liệu, có reason/audit, không cho OWNER tự sửa grade của mình.

# **6\. Scope Definition**

## **6.1. MVP Scope**

MVP cần đủ để chứng minh vòng đời năng lực từ yêu cầu vị trí đến evidence sau đào tạo. Các module sau được xem là phạm vi chính cần ưu tiên triển khai.

| Module | MVP Coverage |
| ----- | ----- |
| Authentication & Authorization | Login, logout, refresh token, password management cơ bản, RBAC, protected API, role-based navigation. |
| Organization & Employee Management | Department, job position, employee profile, manager assignment, employee status. |
| Competency Framework Management | Competency category, competency, level, position requirement, employee competency profile. |
| Course & Learning Management | Standard course, module/lesson, learning material, competency mapping, tự đề xuất theo gap, OWNER assignment và progress tracking. |
| Assessment & Question Bank | Question bank, quiz/final assessment, attempt, scoring, pass/fail rule. |
| Capability Analysis & Learning Recommendation | Tính Confirmed Competency/Skill Gap; tự đề xuất standard course theo competency thiếu và course mapping; EMPLOYEE có thể bắt đầu từ đề xuất. OWNER có thể giao course riêng khi có cập nhật/đào tạo lại. Khi chưa có Position/Active Requirement Set, trạng thái là Not Assessed. |
| Certificate Management | Chỉ cấp cho course đánh dấu certificate-eligible khi hoàn thành required lessons và đỗ final assessment; trạng thái Valid/Revoked, không expiry. |
| WMS-lite Practical Task | OWNER/MANAGER giao task, gắn competency và rubric; submission, feedback, AI-assisted per-criterion evaluation proposal (nếu nằm trong scope được duyệt), reviewer edit/approval, evidence và audit history. Chỉ review hợp lệ được duyệt mới có thể cập nhật Confirmed Competency; task score không đồng nhất với competency level. |
| Dashboard & Analytics | Dashboard theo PLATFORM_ADMIN, OWNER, MANAGER và EMPLOYEE trong đúng data scope. |
| Notification & Reminder | Thông báo assignment, deadline, task update và các sự kiện MVP phù hợp; không có nhắc expiry chứng chỉ. |
| Admin & Master Data | Quản lý reference data, audit và cấu hình theo FE-09; không đưa risk/readiness score hay certificate expiry rules thành scope mặc định. |

## **6.2. Optional / Bonus Scope**

* AI Question Draft và AI Task Suggestion chưa thuộc Enterprise Capstone MVP; chỉ xem xét ở roadmap riêng sau khi có quyết định phạm vi.
* AI-assisted Practical Task Evaluation là mở rộng AI scope so với baseline Reports 1/2 cần được cập nhật scope, estimate/effort, use case, data/security controls và test coverage trước khi coi là cam kết MVP. Không suy ra rằng source code hiện có đã triển khai chức năng này.
* Career & Promotion Readiness, Competency Heatmap và Learning ROI là roadmap tương lai, cần quyết định phạm vi riêng.
* AI Explanation cho risk/readiness là roadmap tương lai; không tạo giải thích cho hai điểm số này vì chúng ngoài scope. AI hỗ trợ đánh giá evidence theo rubric được mô tả riêng tại §11 và không tự ra quyết định competency.

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
| 1 | Setup Organization | OWNER tạo organization structure, position và member records. |
| 2 | Define Competency Requirements | PLATFORM_ADMIN quản lý TT02/reference data; OWNER tạo và kích hoạt versioned position requirement set. |
| 3 | Maintain Standard Learning | PLATFORM_ADMIN quản lý standard course, lesson, question bank và assessment. |
| 4 | Analyze Skill Gap | System so sánh Confirmed Competency với Active Requirement; khi chưa đủ cấu hình là Not Assessed. |
| 5 | Recommend Learning | System tự đề xuất standard course theo competency gap và course-competency mapping; EMPLOYEE có thể mở/bắt đầu khóa học từ danh sách này. |
| 6 | Assign Course When Needed | OWNER có thể giao course chủ động khi tổ chức cập nhật nội dung/yêu cầu hoặc yêu cầu đào tạo lại; cơ chế này tồn tại cùng course recommendation. OWNER theo dõi tiến độ. |
| 7 | Learn and Assess | Employee học lesson, làm quiz/final assessment và hệ thống ghi nhận progress/score. Course assessment/certificate không tự xác nhận workplace competency. |
| 8 | Issue Certificate | Nếu course eligible, required lessons hoàn tất và final assessment đỗ, hệ thống cấp certificate Valid có code và QR nội bộ. |
| 9 | Assign Practical Task | OWNER hoặc MANAGER trong phạm vi giao task gắn với một hay nhiều competency cần chứng minh và rubric tương ứng. |
| 10 | Submit Evidence | Employee cập nhật tiến độ và nộp file/link/kết quả task. |
| 11 | AI-Assisted Evaluation and Human Review | AI có thể đề xuất điểm theo rubric, rationale, evidence citations và gaps. OWNER/MANAGER kiểm tra, chỉnh sửa hoặc yêu cầu bổ sung; người review quyết định cuối. |
| 12 | Confirm Competency and Recalculate Gap | Chỉ review hợp lệ đã được duyệt, được đánh dấu level-confirming, mới có thể cập nhật Confirmed Competency. Task score khác Competency Level; system ghi audit rồi tính lại Skill Gap. |

| Core demo loopPosition Requirement → Skill Gap → Course Suggestion → Learning → Assessment → Eligible Certificate → Practical Task → Human Review → Confirmed Competency → Recalculated Skill Gap |
| :---- |

## **7.1. Certificate Verification Flow**

1. EMPLOYEE hoàn thành required lessons và đỗ final assessment của course certificate-eligible.
2. System tạo certificate code duy nhất và QR verification URL.  
3. System sinh PDF certificate và lưu thông tin certificate vào database.  
4. Employee tải hoặc xem certificate.  
5. OWNER/MANAGER của đúng tổ chức phát hành đăng nhập rồi quét QR để kiểm tra.
6. System hiển thị trạng thái Valid hoặc Revoked; certificate không có expiry và verification không tiết lộ hồ sơ nội bộ.

## **7.2. WMS-lite Task Evidence Flow**

7. OWNER/MANAGER xác định task thực hành cần giao cho nhân viên trong phạm vi.
8. OWNER/MANAGER tạo/giao task với mô tả, deadline, expected output và evaluation criteria.
9. Employee nhận task, cập nhật tiến độ và nộp evidence.  
10. Nếu nằm trong scope được duyệt, AI đề xuất đánh giá từng rubric criterion kèm lý do, căn cứ evidence và gaps; OWNER/MANAGER review, chỉnh sửa, duyệt hoặc yêu cầu bổ sung.
11. Chỉ kết quả review hợp lệ được duyệt và đánh dấu level-confirming mới cập nhật Confirmed Competency. Điểm task lưu riêng với Competency Level; rubric/AI/model version (nếu có), reviewer decision và edit history được truy vết.
12. System lưu Competency Evidence/Review History và tính lại Skill Gap nếu evidence level-confirming được duyệt.

# **8\. High-Level Functional Modules**

| Code | Module | Description |
| ----- | ----- | ----- |
| M01 | Authentication & Authorization | Xác thực, JWT, refresh token, RBAC, permission check, session control, audit log. |
| M02 | Organization & Employee Management | Quản lý phòng ban, vị trí công việc, hồ sơ nhân viên và manager assignment. |
| M03 | Competency Framework | Quản lý nhóm năng lực, năng lực, level, criteria, position requirements và employee competency. |
| M04 | Course & Learning Management | Quản lý khóa học, bài học, tài liệu, course-competency mapping, tự đề xuất theo gap, OWNER assignment và progress. |
| M05 | Assessment & Question Bank | Quản lý câu hỏi, quiz/final assessment, attempt, scoring và pass rule. |
| M06 | Certificate Management | Cấp certificate-eligible internal certificate; QR verification yêu cầu đăng nhập OWNER/MANAGER cùng tổ chức; Valid/Revoked, không expiry. |
| M07 | Competency Analysis | Confirmed Competency, Skill Gap và course suggestion theo quy tắc; không có risk/readiness scoring trong Enterprise MVP. |
| M08 | WMS-lite Task Management | Giao task/rubric, submission, AI evaluation proposal nếu được scope duyệt, reviewer decision/edit, feedback, evidence và audit. Task score tách biệt competency level. |
| M09 | Dashboard & Analytics | Dashboard theo PLATFORM_ADMIN, OWNER, MANAGER và EMPLOYEE trong đúng data scope. |
| M10 | Notification & Reminder | In-app notifications cho assignment, deadline và feedback; không có expiry/risk alert. |
| M11 | File Storage | Upload/download lesson materials, task evidence and certificate PDFs through local storage in development or S3-compatible storage when integrated. |
| M12 | Platform Administration | TT02/reference content, platform users, audit và settings theo FE-09; không cấu hình risk/readiness weights hoặc certificate expiry. |

## **8.1. Module Dependency Notes**

Một số module có dependency rõ ràng và nên được triển khai theo thứ tự để giảm rủi ro: Auth/RBAC → Organization/Employee → Competency Framework → Course/Learning → Assessment → Certificate → WMS-lite Task → Dashboard → Bonus AI. Không nên làm dashboard hoặc AI trước khi dữ liệu lõi chưa ổn định.

# **9\. High-Level Data View**

Tài liệu này chưa thay thế ERD, nhưng cần xác định trước các nhóm dữ liệu chính để team backend/frontend cùng hiểu cấu trúc domain.

| Domain | Representative Entities | Notes |
| ----- | ----- | ----- |
| Auth & Security | User, Role, Permission, UserRole, RefreshToken, AuditLog | Nền tảng bảo mật, phân quyền và truy vết thao tác. |
| Organization | Department, JobPosition, EmployeeProfile, ManagerAssignment | Dùng để giới hạn dữ liệu theo phòng ban/vị trí. |
| Competency | TT02 version/criteria, RequirementSet, ConfirmedCompetency, Evidence/Review History | Nền tảng để tính Skill Gap và lưu lịch sử xác nhận/correction. |
| Learning | Course, CourseModule, Lesson, LearningMaterial, CourseCompetency, Enrollment, LessonProgress | Theo dõi quá trình học và mapping với competency. |
| Assessment | QuestionBank, Question, Option, Assessment, AssessmentQuestion, Attempt, Answer | Lưu câu hỏi, attempt, scoring và pass/fail. |
| Certificate | Certificate, code, internal QR, issue date, status and revocation reason | Cấp và xác minh nội bộ; không lưu expiry theo baseline. |
| Task Evidence | PracticalTask, TaskAssignment, TaskSubmission, RubricVersion, AIEvaluation, ReviewerDecision/Edit, CompetencyEvidence | Lưu task/evidence và đầy đủ lịch sử đánh giá; AI/model version khi áp dụng; task score tách competency level. |
| Competency Analysis | RequirementSet version, ConfirmedCompetency, SkillGapResult, LearningRecommendation, CourseAssignment | Lưu requirement, evidence-confirmed competency, kết quả gap/recommendation và course assignment/reason. |
| Notification | Notification, NotificationRecipient | Thông báo assignment, deadline và feedback. |

## **9.1. Data Governance Principles**

* Không hard delete dữ liệu nghiệp vụ quan trọng như certificate, assessment attempt, task evaluation và competency evidence.  
* Các bảng quan trọng cần có created\_at, updated\_at, created\_by, updated\_by và status nếu phù hợp.  
* Không xác định readiness weights, risk threshold hoặc certificate expiry rule trong Enterprise MVP.
* Các thao tác nhạy cảm cần audit log: cấp/thu hồi certificate, thay đổi competency, đánh giá task, chỉnh cấu hình score và AI/reviewer evaluation history.
* File upload metadata includes owner, permission scope and object path; use local development storage or the configured S3-compatible provider rather than assuming MinIO is already deployed.

# **10\. Technical Overview**

## **10.1. Confirmed Technology Stack**

| Layer | Technology | Purpose |
| ----- | ----- | ----- |
| Frontend | ReactJS, TypeScript, TailwindCSS, ShadCN/UI | Xây dựng giao diện enterprise dashboard, forms, tables, role-based portal và responsive UI. |
| Backend | ASP.NET Core / C# | REST API, business logic, RBAC, explainable Skill Gap, certificate, learning, assessment and task workflow. |
| Database | PostgreSQL | Lưu dữ liệu quan hệ, competency records, learning metadata, assessment results, certificate records và dashboard queries. |
| File Storage | Local for development; S3-compatible/MinIO when integrated | Lesson materials, task evidence and certificate PDFs; verify the configured provider separately. |
| Cache / Background Jobs | No dedicated cache provider required | Recalculation queue/job follows the approved design; Redis is not an assumed dependency. |
| Notifications | In-app + browser polling | Assignment, deadline and task feedback notices; SignalR/WebSocket is not required in the MVP. |
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
| Infrastructure Layer | PostgreSQL access, configured file storage, email/notification adapters, queued recalculation and optional external AI adapters. |
| Frontend Layer | Role-based routes, layout, forms, tables, API clients, validation, loading/error states và reusable components. |

## **10.3. Security Direction**

* JWT access token kết hợp refresh token để quản lý phiên đăng nhập.  
* Password hashing an toàn; không lưu password plain text.  
* RBAC kết hợp permission check theo module/action và department-level data access.  
* File upload metadata includes owner, permission scope and object path; use local development storage or the configured S3-compatible provider rather than assuming MinIO is already deployed.
* Certificate verification endpoint phải giới hạn dữ liệu trả về, tránh lộ thông tin nội bộ.  
* CORS, environment variables, secret management và rate limit cơ bản cần được cấu hình đúng khi deploy.

# **11\. AI and Rule-Based Intelligence Overview**

Skill Gap và course recommendation là các quyết định rule-based có thể giải thích. AI-assisted Practical Task Evaluation là vai trò trợ lý đánh giá: đọc evidence được phép truy cập, đối chiếu rubric và đề xuất điểm theo từng tiêu chí, lý do, căn cứ evidence và tiêu chí còn thiếu. AI không quyết định cuối và không cập nhật Confirmed Competency. Đây là phần mở rộng AI scope/effort so với Reports 1/2; cần cập nhật các report và đặc tả liên quan trước khi xem là cam kết MVP. Tài liệu này không xác nhận source code đã triển khai chức năng.

| Feature | MVP Level | Implementation Direction |
| ----- | ----- | ----- |
| Skill Gap Analysis | Core \- rule-based | So sánh confirmed grade với required grade; trạng thái Met/Partial Gap/Gap; Not Assessed khi chưa có position hoặc Active Requirement Set. Không có requirement weight. |
| Learning Recommendation | Core \- rule-based | Map skill gap với course competencies, prerequisite, priority và employee history. |
| OWNER Course Assignment | Core business capability | OWNER có thể chủ động giao standard course khi tổ chức cập nhật hoặc yêu cầu đào tạo lại; coexist với đề xuất tự động; theo dõi progress theo quyền. |
| AI-assisted Practical Task Evaluation | Scope expansion requiring Report 1/2 update | Đề xuất per-criterion score, rationale, evidence citations và missing criteria theo rubric; OWNER/MANAGER review/edit/approve. Ghi rubric version, AI result và model/version nếu có, reviewer decision và edit history. Task score tách biệt competency level. |
| Training Risk Score | Out of Enterprise Capstone MVP | Không đưa risk scoring vào scope/acceptance của baseline này. |
| Workforce Readiness Score | Out of Enterprise Capstone MVP | Không đưa readiness scoring vào scope/acceptance của baseline này; competency confirmation dựa trên evidence review. |
| AI Task Suggestion | Optional/Bonus | LLM đề xuất task và criteria; Manager duyệt/chỉnh trước khi giao. Đây là khác với AI evaluation của submission. |
| AI Question Draft | Out of Enterprise Capstone MVP | Chỉ xem xét theo quyết định phạm vi riêng; PLATFORM_ADMIN chịu trách nhiệm nội dung chuẩn. |
| AI Learning Assistant | Future | Hỏi đáp/tóm tắt bài học/giải thích đáp án sai khi có thời gian và dữ liệu nội dung ổn định. |
| AI Knowledge Search | Future | Semantic search/pgvector nếu core scope hoàn tất và có dữ liệu tài liệu đủ tốt. |

## **11.1. Human-in-the-Loop Rules**

* AI không tự cấp certificate.  
* AI không tự thay đổi competency level nếu không có rule hoặc người duyệt.  
* Nội dung chuẩn do PLATFORM_ADMIN quản lý.
* OWNER/MANAGER duyệt evidence theo từng target competency; Passed, level-confirming evidence mới có thể tăng confirmed grade. Correction có kiểm soát có thể giảm/reset.
* Điểm Practical Task là đánh giá theo tiêu chí của task, không tự ánh xạ thành Competency Level. Chỉ reviewer approval hợp lệ và business rule level-confirming mới cập nhật Confirmed Competency.
* Lưu rubric version, AI evaluation result, model/version (nếu có), căn cứ evidence, reviewer decision và mọi edit để audit; bảo vệ evidence theo tổ chức/phòng ban và chỉ gửi cho AI provider đã được cấu hình/cho phép.
* **PENDING DECISION:** Khi OWNER giao course do cập nhật/đào tạo lại, required reevaluation là final course assessment hay phải thêm Practical Task? Quy tắc có thể khác giữa content update và thay đổi competency requirement.

# **12\. Non-Functional Requirements Direction**

| Quality Attribute | Direction for MVP |
| ----- | ----- |
| Usability | Giao diện rõ role, sidebar dễ hiểu, form/table nhất quán, trạng thái loading/empty/error đầy đủ. |
| Maintainability | Code chia module rõ ràng, đặt tên tiếng Anh, không hard-code business thresholds, có convention cho backend/frontend. |
| Security | JWT, RBAC, password hashing, audit log, file permission và department-level access control. |
| Performance | Server pagination/filter/sort and measured dashboard queries; use cache only when the measured need and provider are verified. |
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
| External AI provider (optional, if approved) | AI-assisted task evidence evaluation proposal after Report 1/2 scope/effort alignment. | Cost, reliability and evidence privacy must be assessed; rule-based Skill Gap/course recommendation works independently. |
| S3-compatible storage | File upload/download and certificate PDF when integrated. | Configure bucket, credentials, access policy and backup for the selected provider. |
| Browser polling | In-app notification delivery in the MVP. | Verify implementation separately; SignalR is not required. |
| Redis | Not a required MVP dependency. | Consider only after measuring a need and confirming the deployment choice. |
| GitHub Actions | CI/CD. | Cần cấu hình secrets và branch protection. |

# **14\. Key Risks and Mitigation**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| Scope creep do nhiều module và nhiều ý tưởng AI. | Trễ tiến độ, core flow không hoàn thành. | Chốt MVP theo revised scope; AI advanced để optional/future; demo end-to-end trước. |
| Thiết kế database chưa kỹ. | Code backend khó sửa, frontend bị ảnh hưởng, dashboard sai dữ liệu. | Làm ERD và business rules trước khi code; review quan hệ chính. |
| RBAC sai hoặc thiếu kiểm soát organization/department scope. | Rủi ro bảo mật và lỗi nghiệp vụ nghiêm trọng. | Xác định permission matrix và kiểm tra scope PLATFORM_ADMIN/OWNER/MANAGER/EMPLOYEE. |
| GRADE-01 chưa được quyết định. | Có thể lệch giữa báo cáo và biểu diễn grade trong thiết kế. | Giữ pending; không tự sửa schema, constraint, thuật toán hoặc migration. |
| Dashboard làm trước khi dữ liệu lõi ổn định. | Hiển thị số liệu giả hoặc khó maintain. | Làm dashboard sau khi course/assessment/certificate/task đã có dữ liệu thật. |
| Frontend/backend lệch API contract. | Mất thời gian tích hợp. | Chốt API spec, Swagger, shared DTO examples và review PR. |
| AI evaluation is unreliable, costly or exposes evidence. | Incorrect proposed assessment, privacy impact or demo failure. | AI evaluation remains optional until Report 1/2 alignment; constrain evidence access, show rationale/citations, require human decision, retain audit trail and provide fallback. Core Skill Gap/recommendation remains rule-based. |
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
18. Certificate: issue eligible-course certificate, generate PDF/QR, verify internally after same-organization login, revoke.
19. Competency Analysis: Confirmed Competency, Skill Gap and rule-based course suggestion.
20. WMS-lite Task: assign, submit, review evidence per competency, update confirmed grade only when level-confirming.
21. Dashboard & Notification: role dashboards and in-app notifications delivered by browser polling.
22. AI-assisted Practical Task Evaluation requires Report 1/2 scope and effort alignment; AI content drafting and Individual/B2C features remain subject to separate scope decisions.

# **16\. Defense-Oriented Demo Scenario**

Demo nên kể một câu chuyện doanh nghiệp đơn giản, có dữ liệu rõ ràng và đi qua đủ điểm khác biệt của hệ thống.

| Demo Step | What to Show | Value Demonstrated |
| ----- | ----- | ----- |
| 1\. Create position requirement | OWNER kích hoạt requirement set của Marketing Executive theo TT02; dải grade tuân theo GRADE-01 sau khi được quyết định. | Hệ thống quản trị năng lực theo vị trí. |
| 2\. View employee gap | Employee A hiện thiếu Data Literacy. | Skill Gap Analysis trả lời nhân viên thiếu gì. |
| 3\. Recommend course | System đề xuất Data Analytics Basic. | Learning Recommendation có căn cứ từ competency mapping. |
| 4\. Learn from recommendation or assignment | EMPLOYEE bắt đầu khóa được hệ thống đề xuất theo gap; OWNER cũng có thể giao course khi có cập nhật/đào tạo lại và theo dõi tiến độ. Reassessment requirement remains PENDING DECISION. | Automatic course recommendation and OWNER course assignment coexist. |
| 5\. Issue certificate | Employee đạt điều kiện và được cấp certificate có QR. | Digital Certificate Verification. |
| 6\. Assign task | OWNER/assigned MANAGER giao task tạo báo cáo chiến dịch marketing, gắn competency và rubric. | WMS-lite kiểm chứng áp dụng thực tế. |
| 7\. Evaluate and review evidence | Nếu nằm trong scope được duyệt, AI đề xuất điểm từng tiêu chí, lý do, căn cứ và thiếu sót; OWNER/MANAGER quyết định sau khi review/edit. Task score không đồng nhất competency level. | Competency Evidence History records rubric, AI and reviewer history. |
| 8\. Dashboard update | Scoped learning, certificate, evidence và Skill Gap views cập nhật sau khi review hợp lệ được duyệt. | Theo dõi năng lực đã xác nhận, không nhầm course completion hoặc task score với competency. |

# **17\. Glossary**

| Term | Meaning in DigiTalent AI |
| ----- | ----- |
| Competency | Một năng lực cụ thể mà nhân viên cần có, ví dụ AI Literacy, Data Literacy, Cybersecurity Awareness. |
| Competency Grade | Grade theo tiêu chí TT02 được Report 3 mô tả ở dải 1–6; cách lưu grade so với 3 Level đào tạo đang là PENDING DECISION GRADE-01. |
| Position Requirement | Bộ competency và level yêu cầu cho một vị trí công việc. |
| Skill Gap | Khoảng cách giữa level yêu cầu và level hiện tại của nhân viên. |
| Learning Recommendation | Hệ thống tự đề xuất course/path dựa trên skill gap và competency mapping; employee có thể bắt đầu học. OWNER có thể đồng thời giao course. |
| AI-assisted Practical Task Evaluation | AI đề xuất đánh giá rubric/evidence, còn OWNER/MANAGER review và quyết định; cần được ghi nhận trong scope/effort Report 1/2 trước khi cam kết MVP. |
| Practical Task Score | Điểm task theo rubric; không phải competency level đã xác nhận. |
| Learning Achievement | Course completion, assessment result hoặc certificate; không tự xác nhận workplace competency. |
| Confirmed Workplace Competency | Năng lực được xác nhận từ minh chứng thực tế được người có quyền review; không đồng nhất với learning completion hay certificate. |
| WMS-lite | Luồng giao task thực hành sau đào tạo, không phải hệ thống quản lý công việc đầy đủ. |
| Competency Evidence | Minh chứng được review theo competency; certificate và learning score là Learning Achievement, không tự xác nhận workplace competency. |
| Internal QR Verification | Xác minh QR yêu cầu OWNER/MANAGER của đúng tổ chức phát hành đăng nhập; hiển thị thông tin giới hạn và trạng thái Valid/Revoked. |

# **18\. Source Traceability**

Tài liệu này được căn chỉnh theo Master System Overview ngày 09/10/2026 cho Enterprise Capstone MVP. Reports 1–3 là baseline theo thứ tự ưu tiên trong Overview; Capstone Project Register là hồ sơ lịch sử, không tự thay thế scope hiện tại. Tài liệu này mô tả yêu cầu, không xác nhận trạng thái triển khai của source code.

| Source Document | How It Is Used |
| ----- | ----- |
| DigiTalent\_AI\_MASTER\_SYSTEM\_OVERVIEW\_2026-10-09.md | Working baseline hiện tại và hướng dẫn xử lý xung đột tài liệu; điểm GRADE-01 vẫn pending. |
| Reports 1 v2.5, 2 v2.5, 3 v2.2 | Baseline về phạm vi, kế hoạch và chi tiết yêu cầu theo thứ tự ưu tiên nêu trong Master System Overview. |
| Capstone\_Project\_Register | Hồ sơ đăng ký lịch sử; khác biệt với scope hiện tại cần minh bạch với mentor. |
| Capstone\_Project\_Register\_DigiTalent\_AI.docx | Nguồn tham khảo cho bản scope mở rộng, capability intelligence và một số feature bonus. |
| De\_tai\_DigiTalent\_AI\_Mo\_ta\_cap\_nhat\_14\_he\_thong.docx | Nguồn tham khảo cho định vị sau khảo sát 14 hệ thống, điểm khác biệt, risk, WMS-lite, evidence portfolio và demo script. |

Các tài liệu chi tiết cần trace về Enterprise Capstone baseline trong Master System Overview và Reports 1–3; các điểm pending phải được giữ nguyên nhãn chờ quyết định.
