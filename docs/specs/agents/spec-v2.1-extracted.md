DIGITALENT AI
MÔ TẢ CHI TIẾT ROLE, SIDEBAR VÀ HỆ THỐNG PAGE
Enterprise scope - 4 role | Job Grade G1-G3 | Version 2.0
| Phạm vi tài liệu | Tài liệu này cập nhật sitemap cũ sang mô hình 4 role đã chốt: PLATFORM_ADMIN, OWNER, MANAGER và EMPLOYEE. ORG_ADMIN và LEARNING_ADMIN được loại bỏ; nghiệp vụ của hai role này được gom vào OWNER. MANAGER là role tùy chọn theo quy mô doanh nghiệp. Tài liệu mô tả chi tiết sidebar, page chính, page/detail nhỏ và quyền truy cập phù hợp. Các trang của INDIVIDUAL WORKSPACE chưa được mô tả trong phiên bản này. |
| Quyết định mới cần phản ánh xuyên suốt UI | Hệ thống có thêm Job Grade G1-G3 để mô tả cấp bậc vị trí trong doanh nghiệp. Job Grade KHÔNG phải System Role và cũng KHÔNG phải Competency Level. Trong UI, thuật ngữ 'Grade' chỉ dùng cho G1/G2/G3; phần năng lực phải dùng 'Bậc năng lực yêu cầu / Required Competency Level' để tránh nhập nhằng. |
# 1. MÔ HÌNH PHÂN QUYỀN ĐÃ CHỐT
| DIGITALENT AI | ├── PLATFORM_ADMIN | │   └── Quản trị toàn bộ nền tảng | │ | └── ENTERPRISE ORGANIZATION |     ├── OWNER |     │   └── Quản trị toàn doanh nghiệp + năng lực + đào tạo + subscription |     ├── MANAGER  (optional) |     │   └── Quản lý team/phòng ban được giao + review evidence |     └── EMPLOYEE |         └── Học tập, assessment, task, competency profile của bản thân |
| Role | Bắt buộc? | Scope dữ liệu | Vai trò nghiệp vụ |
| PLATFORM_ADMIN | Có ở cấp platform | GLOBAL | Quản lý DigiTalent AI, customer organizations, framework, curriculum chuẩn, gói và cấu hình. |
| OWNER | Có ở mỗi doanh nghiệp | ORGANIZATION | Chủ doanh nghiệp; quản trị tổ chức, nhân sự, vị trí, yêu cầu năng lực, đào tạo, báo cáo và gói dịch vụ. |
| MANAGER | Không | TEAM / DEPARTMENT | Được Owner gán khi cần; quản lý nhân viên trong scope, theo dõi tiến độ, giao/review practical task. |
| EMPLOYEE | Có với nhân viên sử dụng hệ thống | SELF | Xem năng lực/skill gap cá nhân, học, assessment, thực hiện task và xem feedback. |
# 2. TÁCH RÕ ROLE - JOB GRADE - COMPETENCY LEVEL
| Khái niệm | Ví dụ | Dùng để làm gì | Không dùng để làm gì |
| System Role | OWNER / MANAGER / EMPLOYEE | Xác định quyền truy cập và hành động trong hệ thống. | Không biểu diễn chức danh/cấp bậc nhân sự. |
| Job Grade | G1 / G2 / G3 | Mô tả cấp bậc vị trí trong cơ cấu doanh nghiệp; dùng cho filter/report/training targeting. | Không tự động cấp quyền Manager. |
| Competency Level | Bậc năng lực theo framework / tầng đào tạo | Xác định năng lực hiện tại và mức yêu cầu. | Không dùng thay Job Grade. |
| Mapping gợi ý ban đầu | G1 = Nhân viên; G2 = Phó phòng; G3 = Trưởng phòng. Đây là display mapping dành cho SME, có thể áp dụng theo phòng ban/vị trí. Một nhân sự G2 không bắt buộc phải có role MANAGER; role vẫn do OWNER gán theo nhu cầu quản lý. |
## 2.1 Quan hệ Department - Position - Job Grade
| Department |    ↓ | Position |    ├── Job Grade: G1 / G2 / G3 |    └── Position Competency Requirements |             ↓ |      Required Competency Level |  | Employee -> assigned Department + Position -> suy ra Job Grade |
Không nên cho người dùng nhập Job Grade độc lập ở Employee nếu Grade đã được gắn với Position; như vậy giảm dữ liệu mâu thuẫn.
Nếu sau này cùng một Position có nhiều Grade thì có thể mở rộng sang Position + Grade Requirement Set; chưa cần ở MVP.
# 3. KIẾN TRÚC NAVIGATION TỔNG THỂ
| Khu vực | Navigation chính |
| Public / Authentication | Portal / Landing / Pricing / Register / Login / Activation / Reset Password. |
| PLATFORM_ADMIN | Quản trị nền tảng, framework, curriculum, organizations, plans, audit. |
| OWNER | Tổ chức, năng lực, đào tạo, đánh giá & minh chứng, báo cáo, subscription, cài đặt. |
| MANAGER | Team, năng lực nhóm, tiến độ đào tạo, practical task, review evidence, learning cá nhân. |
| EMPLOYEE | Năng lực của tôi, learning path, courses, assessment, practical task, achievements. |
# 4. PUBLIC / AUTHENTICATION / ENTERPRISE ONBOARDING
Nhóm page này không thuộc sidebar sau đăng nhập nhưng là flow bắt buộc để đưa doanh nghiệp vào hệ thống.
| ID | Page | Đối tượng | Chi tiết / Trang con |
| PUB-01 | Portal Selector | Visitor | Chọn Dành cho doanh nghiệp / Dành cho cá nhân. Individual chỉ được nhắc ở entry; không mô tả workspace trong tài liệu này. |
| PUB-02 | Enterprise Landing | Khách B2B | Value proposition, competency-first flow, CTA xem gói / đăng nhập. |
| PUB-03 | Enterprise Pricing | Khách B2B | Gói, số seats, entitlement, feature/limit, CTA chọn gói. |
| AUTH-01 | Enterprise Register | Buyer | Tạo Owner account ban đầu. |
| AUTH-02 | Checkout / Payment | Buyer | Plan summary, seats, billing, điều khoản, thanh toán. |
| AUTH-03 | Payment Result | Buyer / OWNER | Success / Pending / Failed. |
| AUTH-04 | Create Organization | OWNER | Tên DN, ngành, quy mô, logo, timezone. |
| AUTH-05 | Organization Setup Wizard | OWNER | Thiết lập cơ cấu tối thiểu: department, positions, grades, members. |
| AUTH-06 | Employee Activation | EMPLOYEE / MANAGER | Nhân viên nhận invitation, xác nhận và tự thiết lập password. |
| AUTH-07 | Login | All authenticated roles | Một component, redirect theo role/context. |
| AUTH-08 | Forgot / Reset Password | All | Khôi phục quyền truy cập. |
# 5. PLATFORM_ADMIN - SIDEBAR VÀ PAGE CHI TIẾT
| TỔNG QUAN |  | DOANH NGHIỆP |   ├── Doanh nghiệp |   └── Người dùng |  | NỘI DUNG NỀN TẢNG |   ├── Khung năng lực TT02 |   ├── Chương trình đào tạo chuẩn |   ├── Ngân hàng đánh giá |   └── Vị trí tham chiếu |  | THƯƠNG MẠI |   ├── Gói dịch vụ |   └── Subscription |  | HỆ THỐNG |   ├── Audit Log |   └── Cấu hình |
| ID | Sidebar | Page | Mô tả / Trang nhỏ |
| PA-01 | Tổng quan | Platform Dashboard | KPI organizations, active subscriptions, seat usage, users, content status, alerts. Có quick links tới organization pending/support và subscription issues. |
| PA-02 | Doanh nghiệp | Organization List | Search/filter theo plan, status, created date, usage. Action: view detail, suspend/activate có audit. |
| PA-03 | Doanh nghiệp | Organization Detail | Tabs: Overview / Subscription / Usage / Contacts / Support History. Không hiển thị business data nhạy cảm không cần thiết. |
| PA-04 | Người dùng | User Account List | Search theo email, type/context, organization, status. Action support: lock/unlock/reset assistance theo policy. |
| PA-05 | Người dùng | User Detail | Identity status, memberships, account events, security/support actions. |
| PA-06 | Khung năng lực TT02 | Framework Explorer | 6 miền -> danh sách competency. Platform source-of-truth. |
| PA-07 | Khung năng lực TT02 | Competency Detail | Descriptor, levels, mappings, reference positions, curriculum coverage. Chỉ Platform Admin được sửa source-of-truth. |
| PA-08 | Chương trình chuẩn | Curriculum List | Theo domain / tier / status. Hiển thị số modules, competency coverage. |
| PA-09 | Chương trình chuẩn | Standard Course Detail | Overview / Competencies / Modules / Assessment / Version. |
| PA-10 | Chương trình chuẩn | Course Editor | Course metadata, modules, lessons, material; publish/version workflow. |
| PA-11 | Ngân hàng đánh giá | Question Bank | Search/filter question theo competency, course, difficulty, status. |
| PA-12 | Ngân hàng đánh giá | Question Detail / Editor | Stem, options, answer, explanation, competency mapping. |
| PA-13 | Ngân hàng đánh giá | Assessment Template | Cấu hình assessment chuẩn: question set, time, pass criteria, attempts. |
| PA-14 | Vị trí tham chiếu | Reference Position List | Danh mục vị trí tham chiếu dùng cho product; không phải job marketplace. |
| PA-15 | Vị trí tham chiếu | Reference Position Detail | Position -> digital activities -> competency requirements -> rationale/source. |
| PA-16 | Gói dịch vụ | Plan List | Enterprise plans, entitlements, seat/storage limits, internal learning feature. |
| PA-17 | Gói dịch vụ | Plan Detail / Edit | Feature flags, limit, billing metadata. |
| PA-18 | Subscription | Subscription List | Organization, plan, status, renewal date, usage. |
| PA-19 | Subscription | Subscription Detail | Lifecycle, payments summary, plan changes, support actions. |
| PA-20 | Audit Log | Platform Audit | Actor/action/resource/time/result; filters và detail. |
| PA-21 | Cấu hình | System Settings | Global config, security defaults, file/storage limits, feature config. |
# 6. OWNER - SIDEBAR VÀ PAGE CHI TIẾT
| Vai trò trung tâm của doanh nghiệp | OWNER gộp các trách nhiệm từng thuộc ORG_ADMIN và LEARNING_ADMIN trong sitemap cũ. Với doanh nghiệp nhỏ không dùng MANAGER, OWNER cũng có quyền giao practical task, review evidence và xác nhận năng lực trong toàn organization. |
| TỔNG QUAN |  | TỔ CHỨC |   ├── Thành viên |   ├── Phòng ban |   ├── Vị trí & Cấp bậc |   └── Phân quyền |  | NĂNG LỰC |   ├── Khung năng lực |   ├── Yêu cầu theo vị trí |   ├── Hồ sơ năng lực |   └── Khoảng trống năng lực |  | ĐÀO TẠO |   ├── Chương trình chuẩn |   ├── Đợt đào tạo |   ├── Phân công đào tạo |   ├── Theo dõi tiến độ |   └── Khóa nội bộ |  | ĐÁNH GIÁ & MINH CHỨNG |   ├── Kết quả đánh giá |   ├── Nhiệm vụ thực tế |   └── Chờ duyệt |  | BÁO CÁO | GÓI DỊCH VỤ | CÀI ĐẶT |
| ID | Sidebar | Page | Mô tả / Trang nhỏ |
| OW-01 | Tổng quan | Organization Dashboard | KPI: employees, G1/G2/G3 distribution, departments, major skill gaps, active training batches, pending evidence, overdue learning, seat usage. |
| OW-02 | Thành viên | Employee List | Filter Department / Position / Job Grade / Role / Learning Status / Gap / Account Status. Bulk invite/import có thể là action. |
| OW-03 | Thành viên | Employee Detail | Tabs: Overview / Competency / Skill Gap / Learning / Assessment / Tasks / Evidence / Achievements. |
| OW-04 | Thành viên | Invite / Add Employee | Form/Drawer: name, work email, employee code, department, position, role; tạo pending membership và gửi activation. |
| OW-05 | Thành viên | Edit Employee Assignment | Đổi department/position/manager/role/status; Grade suy ra từ Position nếu đã cấu hình. |
| OW-06 | Phòng ban | Department List | Card/list: headcount, manager, grade distribution, training/gap summary. |
| OW-07 | Phòng ban | Department Detail | Tabs: Overview / Members / Positions / Competency Summary / Training Progress. |
| OW-08 | Phòng ban | Create / Edit Department | Tên, code, description, manager optional, status. |
| OW-09 | Vị trí & Cấp bậc | Position List | Filter Department / Job Grade / status. Hiển thị employee count và requirement status. |
| OW-10 | Vị trí & Cấp bậc | Position Detail | Tabs: Overview / Competency Requirements / Employees / Learning Coverage / Requirement History. |
| OW-11 | Vị trí & Cấp bậc | Create / Edit Position | Name, department, Job Grade G1-G3, description, status. |
| OW-12 | Vị trí & Cấp bậc | Job Grade Configuration | G1/G2/G3 display name + description. Không tạo quyền hệ thống. MVP nên giữ code cố định. |
| OW-13 | Phân quyền | Role & Access | 3 role enterprise: OWNER / MANAGER / EMPLOYEE. Assign/remove MANAGER; scope manager theo department/team. |
| OW-14 | Khung năng lực | TT02 Framework Explorer | Read-only 6 domains -> competencies -> descriptors/levels. |
| OW-15 | Khung năng lực | Competency Detail | Descriptor, courses, positions requiring competency, employees with gaps. |
| OW-16 | Yêu cầu theo vị trí | Requirement Set List | Theo Position; trạng thái Draft / Active / Retired; effective date và version. |
| OW-17 | Yêu cầu theo vị trí | Position Requirement Builder | Position -> competencies -> Required Competency Level -> mandatory/weight/rationale; Save Draft / Activate. |
| OW-18 | Yêu cầu theo vị trí | Requirement History | Version timeline, change reason, who changed, comparison. |
| OW-19 | Hồ sơ năng lực | Workforce Competency Matrix | Employee x Competency với current/confirmed level, required level, gap, evidence status. |
| OW-20 | Hồ sơ năng lực | Employee Competency Detail | Evidence timeline, assessment evidence, manager-reviewed practical evidence, current/confirmed state. |
| OW-21 | Khoảng trống năng lực | Skill Gap Dashboard | Views: By Department / Position / Job Grade / Competency / Employee. |
| OW-22 | Khoảng trống năng lực | Skill Gap Detail | Required vs current, gap, evidence source, recommended action/course; explainable rationale. |
| OW-23 | Chương trình chuẩn | Standard Course Catalog | Browse/preview/assign platform courses. Owner không sửa lesson chuẩn. |
| OW-24 | Chương trình chuẩn | Course Detail | Overview / Competencies / Modules / Assessment / assigned employees. |
| OW-25 | Đợt đào tạo | Training Batch List | Draft / Scheduled / Running / Completed / Cancelled. |
| OW-26 | Đợt đào tạo | Create Training Batch | Name, dates, target selector (Department/Position/Grade/Employees), courses, deadline. |
| OW-27 | Đợt đào tạo | Training Batch Detail | Overview / Participants / Courses / Progress / Results. |
| OW-28 | Phân công đào tạo | Training Assignment | Assign course theo employee/team/position/grade hoặc theo skill gap/recommendation. |
| OW-29 | Phân công đào tạo | Recommendation Review | Rule-based recommendation; owner xem rationale và accept/override. |
| OW-30 | Theo dõi tiến độ | Training Monitor | Progress, completion, overdue, assessment status; filter theo dept/position/grade. |
| OW-31 | Khóa nội bộ | Internal Course List | Company culture, onboarding, policies, SOP; nếu plan có feature. |
| OW-32 | Khóa nội bộ | Internal Course Editor | Nội dung nội bộ đơn giản: sections/material/quiz; không chỉnh curriculum chuẩn. |
| OW-33 | Khóa nội bộ | Internal Course Detail / Assignment | Publish, assign, completion tracking. Không tự động tăng TT02 competency. |
| OW-34 | Kết quả đánh giá | Assessment Results | Employee, course, score, pass/fail, attempts, date. Drill-down attempt detail. |
| OW-35 | Nhiệm vụ thực tế | Practical Task List | Draft / Assigned / In Progress / Submitted / Revision / Approved / Rejected. |
| OW-36 | Nhiệm vụ thực tế | Create / Assign Practical Task | Target competency, expected output, employee(s), deadline, evidence type. |
| OW-37 | Nhiệm vụ thực tế | Task Detail | Requirements, competency target, assignee, timeline, submissions, evaluation. |
| OW-38 | Chờ duyệt | Review Queue | Pending submissions theo due date/department/manager. |
| OW-39 | Chờ duyệt | Evidence Evaluation | Submission + criteria/rubric + feedback + requested competency level + approve/revision/reject. |
| OW-40 | Báo cáo | Reports & Analytics | Tabs: Workforce / Competency / Training / Assessment / Evidence; filter Department / Position / Grade / Date. |
| OW-41 | Gói dịch vụ | Subscription Overview | Current plan, seats, storage, entitlements, renewal. |
| OW-42 | Gói dịch vụ | Plan & Usage | Seat usage, feature limits, internal learning entitlement, upgrade impact. |
| OW-43 | Gói dịch vụ | Billing / Payment History | Invoices/payments/renewal history; Owner only. |
| OW-44 | Cài đặt | Organization Settings | Company name/logo/industry/timezone/contact/default policies. |
| OW-45 | Cài đặt | Organization Audit Log | Sensitive role/member/requirement/subscription actions. |
# 7. MANAGER - SIDEBAR VÀ PAGE CHI TIẾT
| Manager là role tùy chọn | Doanh nghiệp nhỏ có thể không tạo MANAGER; OWNER thực hiện các chức năng quản lý và review ở scope toàn organization. Khi có MANAGER, quyền của họ chỉ áp dụng cho department/team được OWNER gán. |
| TỔNG QUAN |  | NHÓM CỦA TÔI |   ├── Thành viên |   ├── Năng lực nhóm |   └── Tiến độ đào tạo |  | ĐÁNH GIÁ THỰC TẾ |   ├── Nhiệm vụ |   └── Chờ đánh giá |  | CÁ NHÂN |   ├── Học tập của tôi |   └── Năng lực của tôi |
| ID | Sidebar | Page | Mô tả / Trang nhỏ |
| MG-01 | Tổng quan | Team Dashboard | Headcount, grade distribution, major gaps, active training, overdue, pending submissions/reviews. |
| MG-02 | Thành viên | My Team | Chỉ employees trong assigned scope; filter position/grade/status. |
| MG-03 | Thành viên | Member Detail | Tabs: Overview / Competency / Gap / Learning / Tasks / Evidence. Không sửa organization master data. |
| MG-04 | Năng lực nhóm | Team Competency Matrix | Employee x competency; current/required/gap; group view. |
| MG-05 | Năng lực nhóm | Team Skill Gap | Gap by competency / position / grade; drill-down member list. |
| MG-06 | Tiến độ đào tạo | Team Training | Assigned/running/completed/overdue của team. |
| MG-07 | Tiến độ đào tạo | Training Assignment Detail | Participants, progress, assessment result. Manager read/monitor; assignment quyền tùy business rule. |
| MG-08 | Nhiệm vụ | Practical Task List | Tasks trong team scope. |
| MG-09 | Nhiệm vụ | Create / Assign Task | Tạo/giao task cho employee trong scope; target competency + expected output. |
| MG-10 | Nhiệm vụ | Task Detail | Submission timeline, attachments, status. |
| MG-11 | Chờ đánh giá | Review Queue | Submitted items cần review. |
| MG-12 | Chờ đánh giá | Evidence Evaluation | Approve/revision/reject; feedback; competency evidence result. |
| MG-13 | Cá nhân | My Learning | Dùng chung component với Employee: learning path/courses. |
| MG-14 | Cá nhân | My Competency | Competency profile + skill gap của chính Manager. |
| MG-15 | Cá nhân | My Tasks / Assessments | Nếu Manager cũng được assign learning/task như employee. |
# 8. EMPLOYEE - SIDEBAR VÀ PAGE CHI TIẾT
| TỔNG QUAN |  | NĂNG LỰC CỦA TÔI |  | HỌC TẬP |   ├── Lộ trình của tôi |   └── Khóa học của tôi |  | ĐÁNH GIÁ |  | NHIỆM VỤ THỰC TẾ |  | THÀNH TỰU |
| ID | Sidebar | Page | Mô tả / Trang nhỏ |
| EM-01 | Tổng quan | My Development Dashboard | Current gap summary, active learning, pending assessments/tasks, progress, recent feedback. |
| EM-02 | Năng lực của tôi | My Competency Profile | Competencies, current/confirmed level, source/evidence, Department/Position/Job Grade display. |
| EM-03 | Năng lực của tôi | My Skill Gap | Required Competency Level vs Current vs Gap; explain why requirement exists. |
| EM-04 | Năng lực của tôi | Evidence Timeline | Assessment/course/practical evidence theo competency; read-only. |
| EM-05 | Lộ trình của tôi | Learning Path | Course order, prerequisite, priority, reason recommended/assigned. |
| EM-06 | Khóa học của tôi | My Learning | Assigned / Recommended / In Progress / Completed. |
| EM-07 | Khóa học của tôi | Course Detail | Outcomes, mapped competencies, modules, progress, assessment. |
| EM-08 | Khóa học của tôi | Lesson Viewer | Objective / content / examples / practice / materials / progress. |
| EM-09 | Đánh giá | Assessment List | Available / In Progress / Completed / Retake eligibility. |
| EM-10 | Đánh giá | Assessment Introduction | Rules, duration, attempts, pass criteria. |
| EM-11 | Đánh giá | Assessment Attempt | Timer, autosave, question navigation, answer states, submit confirmation. |
| EM-12 | Đánh giá | Assessment Result | Score/pass-fail, coverage, next action. Không tự động coi pass = confirmed workplace competency. |
| EM-13 | Đánh giá | Assessment History | Previous attempts, date, score, status. |
| EM-14 | Nhiệm vụ thực tế | My Tasks | Assigned tasks, due date, status, competency target. |
| EM-15 | Nhiệm vụ thực tế | Task Detail | Expected output, instructions, evidence types, deadline. |
| EM-16 | Nhiệm vụ thực tế | Submit Evidence | File/link/text; validation; submit/resubmit if revision. |
| EM-17 | Nhiệm vụ thực tế | Feedback / Revision | Manager/Owner feedback, evaluation result, revision request. |
| EM-18 | Thành tựu | Achievements / Certificates | Learning achievements/internal certificates as applicable; không thay thế workplace confirmation. |
# 9. TOPBAR VÀ CÁC PAGE DÙNG CHUNG
Không nên đưa tất cả chức năng phụ vào sidebar. Các chức năng cá nhân và trạng thái hệ thống nên đặt ở topbar/avatar hoặc dùng shared pages.
| Vị trí | Page / Action | Ghi chú |
| Topbar | Notifications | Bell icon; task/training/evidence/subscription notifications theo role/context. |
| Avatar menu | My Profile | Thông tin cá nhân cơ bản. |
| Avatar menu | Security / Change Password | Session/password/security settings. |
| Avatar menu | Logout | Kết thúc session. |
| Shared state | 403 Access Denied | Không đủ permission/data scope. |
| Shared state | 404 Not Found | Resource không tồn tại. |
| Shared state | Feature Unavailable | Plan không có entitlement; OWNER có CTA xem gói. |
| Shared state | Subscription Expired | Read-only/blocked state theo policy, không xóa dữ liệu. |
| Shared state | Empty State | No members / no assignment / no evidence / no training. |
# 10. MA TRẬN QUYỀN CẤP CAO
| Chức năng | PLATFORM_ADMIN | OWNER | MANAGER | EMPLOYEE |
| Platform framework / curriculum | Manage | Read | Read | Read |
| Organizations / subscriptions | Manage all | Own org / own plan | - | - |
| Departments / positions / grades | Support view | Manage | Read scope | Read own |
| Members / role assignment | Support only | Manage | Read scope | Self |
| Position requirements | Platform reference | Manage | Read scope | Read own requirement |
| Workforce competency / skill gap | Support limited | Org-wide | Team scope | Self |
| Course assignment | Platform content | Org-wide | Optional team scope | Receive |
| Practical task | - | Org-wide | Team scope | Receive / submit |
| Evidence evaluation | - | Org-wide | Team scope | Read result |
| Reports | Platform | Org-wide | Team | Self summary |
| Billing | Platform oversight | Manage own org | - | - |
# 11. CÁC LUỒNG NGHIỆP VỤ CHÍNH
## 11.1 Enterprise onboarding
| Enterprise Landing |  -> Pricing / Plan |  -> Register OWNER |  -> Checkout / Payment |  -> Create Organization |  -> Setup Departments / Positions / Grades |  -> Add Employees |  -> Assign MANAGER if needed |  -> Ready |
## 11.2 Organization structure
| OWNER |  -> Department |  -> Position |  -> Job Grade G1/G2/G3 |  -> Employee assigned Position |  -> Employee gets Grade from Position |
## 11.3 Position competency requirement
| Position |  -> Select TT02 Competencies |  -> Set Required Competency Level |  -> Add rationale / source |  -> Save Draft |  -> Activate Requirement Set |  -> Recalculate employee Skill Gap |
## 11.4 Training deployment
| Skill Gap / Position Need |  -> Course Recommendation |  -> OWNER accepts / overrides |  -> Create Training Batch or direct Assignment |  -> Employee learns |  -> Assessment |  -> Practical Task if required |  -> OWNER/MANAGER evaluates evidence |  -> Competency Profile updated |  -> Skill Gap recalculated |
## 11.5 SME without Manager
| OWNER |  -> manages organization |  -> assigns training |  -> monitors employees |  -> creates practical tasks |  -> reviews evidence |  -> confirms competency |  | EMPLOYEE |  -> learn / assess / submit evidence |
# 12. PAGE VS TAB / DRAWER / MODAL
| Pattern | Nên dùng cho | Ví dụ trong hệ thống |
| Page | Luồng phức tạp, cần URL/state riêng | Employee Detail, Position Requirement Builder, Lesson Viewer, Assessment Attempt, Evidence Evaluation. |
| Tabs | Nhiều góc nhìn của cùng entity | Employee Detail, Department Detail, Position Detail, Training Batch Detail. |
| Drawer | Xem/sửa nhanh mà không rời context | Assign training, edit employee assignment, quick member detail. |
| Modal | Action ngắn/confirm | Invite employee, assign manager, activate/retire requirement, deactivate account. |
| Wizard | Setup nhiều bước có thứ tự | Organization setup, create training batch nếu flow dài. |
# 13. CÁC ĐIỀU CHỈNH CẦN ÁP DỤNG SO VỚI SITEMAP CŨ
| Sitemap cũ | Điều chỉnh mới |
| ORG_ADMIN | Loại bỏ. Page quản lý member/department/role/settings chuyển sang OWNER. |
| LEARNING_ADMIN | Loại bỏ. Page position requirement/skill gap/training/course assignment/report chuyển sang OWNER. |
| LEARNER | Đổi naming role thành EMPLOYEE ở Enterprise UI/code nếu đã chốt như vậy. |
| Required Grade | Đổi thành Required Competency Level / Bậc năng lực yêu cầu vì Grade nay dùng cho G1-G3. |
| MANAGER bắt buộc trong workflow practical task | Không. OWNER có thể thực hiện toàn bộ review flow khi organization không dùng MANAGER. |
| Create Training Room | Không nên dùng. Đề xuất 'Đợt đào tạo / Training Batch' hoặc 'Nhóm đào tạo / Training Cohort'. |
| Notification / Profile ở sidebar | Đưa lên topbar/avatar để sidebar tập trung nghiệp vụ. |
| Job Grade gắn trực tiếp Employee | Ưu tiên Grade thuộc Position; Employee nhận Grade qua Position để giảm dữ liệu mâu thuẫn. |
# 14. ƯU TIÊN THIẾT KẾ / TRIỂN KHAI
| Mức | Page / Flow ưu tiên |
| P0 - Core | Enterprise onboarding; Owner Dashboard; Members; Departments; Positions & Job Grades; Role & Access; TT02 Explorer; Requirement Builder; Skill Gap; Standard Course Catalog; Training Assignment/Batch; Employee Learning; Assessment; Practical Task; Evidence Evaluation. |
| P1 - Operational | Training Monitor; Reports; Internal Course; Notifications; Audit; Billing history; advanced filters/analytics. |
| P2 - Future/Polish | Custom role builder, multi-org workspace switching, SSO, SCORM/xAPI, complex LMS authoring, advanced AI. |
# 15. KẾT LUẬN CHỐT
| Enterprise UI/UX baseline mới | Mô hình 4 role phù hợp với định hướng SME: PLATFORM_ADMIN quản trị platform; OWNER gộp toàn bộ quản trị tổ chức, năng lực và đào tạo; MANAGER là tùy chọn theo quy mô; EMPLOYEE tập trung vào học tập và phát triển năng lực cá nhân trong doanh nghiệp. Job Grade G1-G3 là cấp bậc vị trí, không phải role. Sidebar được tổ chức theo nhiệm vụ nghiệp vụ thay vì theo CRUD table, và các page detail dùng tabs/drawer/modal để tránh phình navigation. |