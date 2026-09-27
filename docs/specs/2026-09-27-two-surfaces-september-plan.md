# DigiTalent AI — đặc tả điều chỉnh cấu trúc và kế hoạch chốt tháng 9

**Trạng thái:** Đề xuất để triển khai, chưa phải mô tả tính năng đã hoàn thành
**Ngày đánh giá:** 27/09/2026
**Mốc kế hoạch:** 30/09/2026
**Phạm vi:** Mã nguồn hiện tại trong `backend/`, `frontend/`, `fontend-demo/` và cấu hình chạy/CI. File theo dõi tiến độ chỉ dùng làm bối cảnh lịch tháng 9; trạng thái triển khai xác nhận bằng mã. Tài liệu thiết kế cũ không được dùng để xác nhận trạng thái triển khai.

## 1. Mục tiêu và quyết định chính

DigiTalent cần phục vụ hai hành trình có giao diện khác nhau trên **cùng một backend, một cơ sở dữ liệu và một nguồn sự thật về nội dung/kết quả học**:

| Hành trình | Đối tượng | Việc cần làm | Kiểu giao diện |
| --- | --- | --- | --- |
| Doanh nghiệp | Admin, HR, quản lý, trainer | Quản lý tổ chức/vị trí; định nghĩa yêu cầu năng lực; xây và giao đào tạo; theo dõi nhân viên | Dashboard, bảng, form, báo cáo; ưu tiên mật độ thông tin và thao tác lặp lại |
| Học theo vị trí | Nhân viên và người chuẩn bị đi làm | Khám phá vị trí; chọn mục tiêu; khảo sát năng lực; theo lộ trình; học, làm bài và xem tiến độ | Landing, khám phá, lớp học, lộ trình trực quan theo tinh thần `fontend-demo` |

**Quyết định kiến trúc đề xuất:** trong giai đoạn này dùng **một ứng dụng React production (`frontend/`) với hai route tree và hai layout**, không tạo thêm frontend production hoặc backend thứ hai. Hai trải nghiệm có thể khác hẳn về bố cục và CSS, nhưng chia sẻ session, API client, kiểu dữ liệu, các component học tập cần dùng ở cả hai nơi và một pipeline build/deploy. Giữ `fontend-demo/` như prototype để đối chiếu UX trong thời gian chuyển đổi; không tiếp tục phát triển nghiệp vụ thật trong đó.

Lý do chọn phương án này: repo đang có router/auth/API client trong `frontend/`, Nginx đang phục vụ một build từ `frontend/dist`, còn demo không có router và lưu trạng thái trong trình duyệt. Tách hai production app ngay lúc này sẽ nhân đôi auth, dependency, CI và triển khai trong khi API học tập còn chưa tồn tại. Nếu sau này hai nhóm cần phát hành độc lập, có thể tách build mà vẫn giữ API/domain contract của đặc tả này.

## 2. Hiện trạng đã kiểm chứng từ mã

| Phần | Có trong mã hiện tại | Chưa có hoặc chưa nối |
| --- | --- | --- |
| Backend | Bốn project `Domain`, `Application`, `Infrastructure`, `Api`; use case/validator; EF Core PostgreSQL; JWT; permission theo role trong DB; seed dev; `AuthController` và `DepartmentsController` | API Job Family/Position/Employee, Competency, Course, Assessment, Assignment, Progress, Certificate; refresh/password reset thật |
| Database runtime | 13 `DbSet` nền tảng; migration `InitialFoundation` | Entity/migration runtime cho năng lực, nội dung học, ghi danh và tiến độ; bảng `RefreshToken` có nhưng chưa có luồng refresh |
| Frontend chính | Router, dashboard shell, role/permission guard, login, API client, hook/service phòng ban | Phần lớn trang nghiệp vụ là placeholder; trang phòng ban chưa gọi service sẵn có; không có landing/learner shell công khai |
| Demo | Có landing, lựa chọn vị trí, khảo sát, lộ trình, lớp học và workspace doanh nghiệp để tham khảo tương tác | Dùng mock và `localStorage`; login demo không xác thực server; chưa có URL route hay API dùng chung |
| QA/triển khai | Backend và frontend chính build được; 12 test utility của demo chạy được bằng `node --test` | Backend solution không có test project thật; demo chưa có npm test script/CI và thiếu dependency cài tại checkout để build; CI `dotnet test` có thể trả thành công dù không chạy test; Docker production chưa có bước migrate schema |

Các vị trí mã để kiểm chứng: `backend/src/DigiTalent.Api/Program.cs`, `backend/src/DigiTalent.Api/Controllers/`, `backend/src/DigiTalent.Infrastructure/Persistence/AppDbContext.cs`, `frontend/src/app/router.tsx`, `frontend/src/services/`, `frontend/src/features/organization/pages/DepartmentListPage.tsx`, `fontend-demo/src/App.jsx`, `fontend-demo/src/utils/demoAccess.js`.

**Lệch contract cần sửa sớm:** `frontend/src/features/auth/pages/LoginPage.tsx` lưu `refreshToken`, còn `LoginUseCaseOutput` backend chỉ trả `accessToken` và `expiresAt`; frontend có service `/auth/change-password`, backend chưa có endpoint đó. Route `/verify` nằm dưới `AuthGuard` dù là màn hình công khai. Các service `/users` và `/employees` đã được viết ở frontend nhưng backend chưa có controller tương ứng. Các nút Google/Quên mật khẩu ở login hiện chưa có luồng thực thi.

## 3. Cấu trúc đích

```text
Browser
  └─ frontend/ (một React app production)
      ├─ Public routes: landing, danh mục vị trí/khóa học, xác minh chứng chỉ
      ├─ Learner routes: mục tiêu, khảo sát, lộ trình, lớp học, tiến độ
      └─ Enterprise routes: dashboard, tổ chức, năng lực, đào tạo, báo cáo
              │
              └─ một API client /api/v1
                     └─ DigiTalent.Api
                          ├─ Identity & Access
                          ├─ Organization & Job Architecture
                          ├─ Competency & Target Position
                          ├─ Learning Catalog & Delivery
                          └─ Assessment, Evidence, Certificate, Analytics
                                   └─ một PostgreSQL database
```

### 3.1. Frontend: route, layout và ownership

**Route đề xuất** (route cũ chuyển bằng redirect có kiểm soát, không xóa đột ngột):

| Route | Layout | Quyền vào | Trách nhiệm |
| --- | --- | --- | --- |
| `/` | `PublicLayout` | Công khai | Landing, chọn hướng doanh nghiệp hoặc học theo vị trí |
| `/careers`, `/careers/:slug` | `PublicLayout` | Công khai, chỉ nội dung đã publish | Danh mục và chi tiết vị trí nghề nghiệp |
| `/verify` | `PublicLayout` | Công khai | Tra cứu chứng chỉ, không nằm trong `AuthGuard` |
| `/login?returnTo=...` | `AuthLayout` | Công khai | Một login server; điều hướng đúng nơi người dùng định vào |
| `/learn/*` | `LearnerLayout` | Xem catalog công khai; đăng nhập cho thao tác lưu dữ liệu | Chọn mục tiêu, khảo sát, lộ trình, bài học, kết quả, chứng chỉ |
| `/enterprise/*` | `EnterpriseLayout` | Có org và quyền phù hợp | Admin/HR/manager/trainer quản lý doanh nghiệp |

Nhân viên doanh nghiệp dùng `LearnerLayout` khi học, nhưng dữ liệu được lọc theo tổ chức và assignment của họ. Người học tự do dùng cùng layout và cùng API học, nhưng chỉ thấy nội dung công khai. **`role` phân quyền (`HR_MANAGER`, `EMPLOYEE`...) khác với `targetJobPosition` mà người dùng chọn để học.** Không dùng một trường để biểu diễn cả hai khái niệm.

```text
frontend/src/
  app/routes/{public,learner,enterprise}.routes.tsx
  app/layouts/{Public,Learner,Enterprise,Auth}Layout.tsx
  features/public/{landing,career-catalog,verification}/
  features/learner/{target,diagnostic,path,classroom,progress}/
  features/enterprise/{dashboard,organization,competency,training,analytics}/
  features/shared-learning/{course,assessment,certificate}/
  shared/{api,auth,types,ui}/
```

Đây là **cấu trúc mục tiêu**, không phải lệnh di chuyển toàn bộ file trong một PR. Di chuyển từng luồng theo chiều dọc. Giữ component chung khi thật sự dùng lại; không đưa sidebar/dashboard CSS vào learner shell. CSS của demo cần được scope theo layout/component vì hiện có nhiều selector toàn cục. API gọi qua service/hook dùng chung; component không gọi trực tiếp `localStorage` để lưu kết quả học.

### 3.2. Backend: một hệ thống, ranh giới theo nghiệp vụ

Giữ bốn project và pattern `Controller → UseCase → interface → EF`. Trong `Application/UseCases` và `Infrastructure/Persistence`, nhóm theo capability thay vì tạo tầng mới cho từng giao diện:

1. **IdentityAccess:** đăng nhập, session/token, tài khoản, role/permission.
2. **Organization:** phòng ban, nhân viên, quyền truy cập theo tổ chức/phòng ban.
3. **JobArchitecture:** job family, job position của doanh nghiệp, danh mục vị trí nghề nghiệp công khai và ánh xạ giữa chúng.
4. **Competency:** thư viện năng lực, requirement set theo vị trí, hồ sơ năng lực, bài khảo sát đầu vào.
5. **LearningCatalog:** khóa học, bài học, học liệu, trạng thái publish, phạm vi công khai/doanh nghiệp.
6. **LearningDelivery:** assignment, enrollment, lesson progress, lộ trình theo vị trí.
7. **AssessmentEvidence:** đề, lần làm bài, chấm điểm, task và bằng chứng.
8. **CertificateAnalytics:** chứng chỉ/xác minh, skill gap, báo cáo.

Tên module là ranh giới sở hữu code và API, **không có nghĩa tách microservice**. Mỗi endpoint ghi rõ `anonymous`, `learner` hay `enterprise + permission`; mọi truy vấn enterprise lấy `OrganizationId` từ server context, không tin `organizationId` client gửi lên. Permission cho phép gọi action; use case vẫn phải giới hạn dữ liệu theo org, phòng ban hoặc chính người học. Public API chỉ trả bản ghi `PUBLISHED` được đánh dấu công khai.

**Nhóm contract cần thiết kế, chưa phải endpoint đang tồn tại:**

| Nhóm | Đọc/ghi tối thiểu | Quy tắc truy cập |
| --- | --- | --- |
| Public catalog | Liệt kê/chi tiết career role, course/path công khai | Anonymous GET, chỉ bản publish |
| Learner | Hồ sơ, vị trí mục tiêu, diagnostic, enrollment, progress | User hiện tại; không nhận learner ID tùy ý để sửa dữ liệu người khác |
| Enterprise | Job position, employee, requirement, course authoring, assignment, report | JWT + permission + tenant/data scope |
| Auth | login/me/logout; quyết định refresh và tạo tài khoản người học | Contract thống nhất giữa FE và BE |

Giữ `ApiResponse` hiện có làm envelope chung. Phân tách nhóm bằng route/tag và quyền, nhưng không đổi toàn bộ route đang chạy chỉ để tên API trông đều hơn. `api/v1/departments` tiếp tục hoạt động trong giai đoạn chuyển đổi.

**Contract gợi ý cho các lát tiếp theo** (đường dẫn mới chỉ là đề xuất, cần chốt trước khi FE gọi):

| Contract | Phương thức / dữ liệu chính | Trạng thái |
| --- | --- | --- |
| `/api/v1/auth/login`, `/api/v1/auth/me` | Token, thời điểm hết hạn; `me` trả user, roles, permissions, employeeId | Đã có, cần đồng bộ DTO và redirect |
| `/api/v1/departments` | CRUD/archive, phân trang, tenant từ token | Đã có API; thiếu UI và kiểm thử tích hợp |
| `/api/v1/public/career-roles` | GET danh sách/chi tiết `slug`, tên, mô tả, mức yêu cầu; chỉ `PUBLISHED` | Đề xuất |
| `/api/v1/public/courses` | GET preview nội dung đã public; không trả học liệu riêng của org | Đề xuất |
| `/api/v1/learner/me/targets` | GET/PUT mục tiêu của chính người gọi; phân biệt template công khai với vị trí org | Đề xuất |
| `/api/v1/learner/me/diagnostics` | POST câu trả lời; server chấm và lưu rule/version/result | Đề xuất |
| `/api/v1/learner/me/enrollments` | GET/POST ghi danh; GET/PATCH tiến độ bài học của chính người gọi | Đề xuất |
| `/api/v1/enterprise/job-positions`, `/course-assignments` | CRUD vị trí; giao học cho employee; org/permission/owner kiểm tra trên server | Đề xuất |

Mọi endpoint ghi dữ liệu cần validator, idempotency hoặc kiểm tra trùng hợp lý, lỗi 400/401/403/404/409 theo envelope hiện có. Danh sách cần phân trang. Contract phải thống nhất quy ước thời gian, trạng thái và ID trước khi tạo service frontend; không viết service trỏ vào route chưa tồn tại rồi xem như tính năng đã xong.

### 3.3. Dữ liệu: phần bắt buộc phải giải quyết trước khi học thật

Mã runtime hiện có `User.OrganizationId` nullable, còn `Employee` luôn thuộc doanh nghiệp; chưa có bản ghi tiến độ học. Mô hình học tập dự kiến đang xoay quanh nhân viên. Tạo người học tự do thành “nhân viên của doanh nghiệp giả” sẽ làm sai ngữ nghĩa, phân quyền và báo cáo. Đề xuất:

- **LearnerProfile** gắn một `User`, có thể liên kết một `Employee` khi là nhân viên doanh nghiệp; người học tự do không cần employee record. Enrollment/progress/assessment thuộc learner profile. Enterprise assignment vẫn trỏ tới Employee và liên kết enrollment của người đó.
- **Tài khoản người học tự do** là `User` không có `OrganizationId`, có role/permission giới hạn cho học tập cá nhân. Cần chốt đăng ký tự phục vụ, xác minh email, giới hạn đăng nhập và khôi phục tài khoản trước khi mở ghi danh công khai. `/auth/me` phải trả đủ thông tin để FE biết người đó được vào enterprise shell hay chỉ learner shell.
- **CareerRoleTemplate** là danh mục vị trí công khai do nền tảng publish. `JobPosition` là vị trí riêng của doanh nghiệp, có thể ánh xạ đến template nhưng giữ requirement riêng. `TargetPosition` lưu lựa chọn mục tiêu của người học, tách khỏi vị trí hiện tại của nhân viên.
- **Course ownership/visibility** phân biệt khóa học nền tảng công khai với khóa học riêng của doanh nghiệp. Một catalog read model có thể phục vụ cả hai UI nhưng phải kiểm tra visibility ở query server.
- Chốt schema và migration theo từng lát nhỏ trước khi tạo UI có ghi dữ liệu. Không coi các bảng mô tả trong file SQL rộng hơn là đã tồn tại trong database runtime; EF migration hiện mới có foundation.

Ràng buộc dữ liệu cần có khi thiết kế migration: `LearnerProfile.UserId` duy nhất; learner gắn Employee phải cùng tài khoản và tổ chức; target công khai tham chiếu template được publish, target doanh nghiệp tham chiếu vị trí thuộc đúng org; course private không được truy vấn qua public catalog; enrollment/progress không được sửa bằng một `userId` do client tự truyền. Nếu một nhân viên vừa học theo assignment vừa theo mục tiêu cá nhân, hai nguồn lộ trình phải được gắn nhãn và lịch sử tiến độ không bị ghi đè.

**Quyết định mặc định cần kiểm chứng với chủ sản phẩm:** khách xem danh mục công khai trước đăng nhập; đăng nhập khi bắt đầu khảo sát hoặc cần lưu tiến độ. Nhân viên được xem vị trí mục tiêu, nhưng quyền chọn/đổi mục tiêu và việc doanh nghiệp có phải duyệt hay không cần chốt trước endpoint ghi.

## 4. Hành trình cần chứng minh bằng cùng một backend

| Luồng | Bước kiểm chứng | Kết quả server phải lưu |
| --- | --- | --- |
| Doanh nghiệp giao đào tạo | HR tạo/chọn vị trí → xác định năng lực yêu cầu → chọn nhân viên → giao khóa/lộ trình | Requirement version, assignment, người giao, thời điểm, org scope |
| Nhân viên học | Nhân viên đăng nhập → thấy assignment/vị trí hiện tại hoặc mục tiêu → làm bài học → tiếp tục trên thiết bị khác | Enrollment, lesson progress, attempt, evidence theo learner profile |
| Người chuẩn bị đi làm | Vào landing → xem vị trí công khai → chọn mục tiêu → đăng nhập → khảo sát → nhận lộ trình → học | Target position, diagnostic result, path snapshot, progress theo tài khoản độc lập |
| Xác minh chứng chỉ | Khách nhập mã từ `/verify` | Chỉ kết quả xác minh được phép công khai; không lộ hồ sơ nội bộ |

Hai giao diện **không được duy trì hai bản logic chấm điểm hoặc gợi ý độc lập**. `fontend-demo/src/utils/competenceEngine.js` là nguồn tham khảo quy tắc và test case. Quy tắc được chuyển thành use case/service server có version và test; frontend chỉ render kết quả và giải thích.

## 5. Kế hoạch đến 30/09/2026

### 5.1. Cơ sở để lập lại mốc

Workbook theo dõi vẫn ghi snapshot 18/09. Các dòng WBS có hạn không muộn hơn 30/09 cộng 978,4 giờ ước tính, trong đó 187,2 giờ được đánh dấu `Done`, 79,3 giờ `In Progress`, 711,9 giờ `Not Started`. Những số này là **tổng giờ ước tính của dòng phân công/review**, không phải giờ làm thực tế hay tỷ lệ chức năng chạy được. Worktree hiện còn nhiều thay đổi chưa commit; phải xác nhận trạng thái của từng lát code trước khi đổi `Status` trong tracker. Với bốn ngày lịch còn lại, không nên báo cáo rằng mọi việc của Sprint 2 và các việc Course/Assessment đầu Sprint 3 sẽ xong đúng hạn.

### 5.2. Ma trận phạm vi tháng 9 từ code và WBS

| Hạng mục trong kế hoạch tháng 9 | Bằng chứng hiện tại | Kết luận và hướng xử lý |
| --- | --- | --- |
| Nền repo, API, DB, auth | Có solution, migration foundation, seed, login/me, permission | Cập nhật tracker từ `Not Started` sang trạng thái có bằng chứng; không đánh dấu toàn bộ auth `Done` vì refresh/reset còn thiếu |
| Organization | Backend Department CRUD/archive có; FE page placeholder; Employee entity có nhưng chưa API | Chốt lát Department FE–API–DB trong tháng 9; Employee API/UI đưa vào backlog ưu tiên tiếp theo |
| Job Architecture | JobFamily/JobPosition entity + EF config có; không thấy API/UI thực | Ưu tiên hợp đồng và CRUD JobPosition sau Department; không đánh dấu hoàn thành vì mới có model |
| Competency | Frontend là khung; runtime EF chưa có module | Chốt schema/contract trước; triển khai sau khi JobPosition rõ |
| Course/Learning, Assessment | `fontend-demo` mô phỏng; frontend chính placeholder; backend không có entity/controller runtime | Các task ghi hạn 28–30/09 phải lập lại mốc sang đợt sau, trừ khi chỉ bàn giao prototype được ghi nhãn rõ |
| QA/Integration | Build qua; backend chưa có test project thật; chưa xác minh end-to-end DB/browser | Là điều kiện đóng mốc tháng 9, không được suy từ build xanh |

### 5.3. Các task chốt tháng 9 có thể kiểm chứng

`P0` là điều kiện để gọi bản hiện tại là **foundation tích hợp** vào 30/09. `P1` là việc bắt đầu nếu còn năng lực sau P0; không gắn nhãn hoàn thành tháng 9 trước khi qua tiêu chí. Mỗi task có owner theo vai trò, nhóm tự gán người cụ thể.

| ID | Ưu tiên / owner | Task và phụ thuộc | Tiêu chí hoàn thành |
| --- | --- | --- | --- |
| SEP-01 | P0 · Tech lead | Kiểm kê thay đổi chưa commit; chọn một migration chain foundation; giữ lại dữ liệu/nhánh đang làm. Làm trước các task DB. | Fresh PostgreSQL migrate thành công; seed dev chạy lặp lại không nhân bản; trạng thái Git/migration được ghi rõ để team không làm trên hai baseline |
| SEP-02 | P0 · BE + FE | Thống nhất login contract: trước mắt bỏ xử lý `refreshToken` giả ở FE hoặc triển khai refresh thật trọn luồng; loại link/nút auth chưa có backend hoặc ghi rõ chưa hỗ trợ. Phụ thuộc SEP-01 để test runtime. | Login → `/auth/me` → reload → logout/401 nhất quán; không lưu chuỗi `undefined` làm token; API/type/UI khớp nhau |
| SEP-03 | P0 · FE | Hoàn thành Department list/detail/create/update/archive bằng service/hook đã có; kiểm tra loading/empty/error và quyền nút. Phụ thuộc SEP-02. | HR/admin thao tác từ UI và thấy dữ liệu sau reload; user không có quyền không thấy thao tác và BE trả 403 nếu gọi trực tiếp |
| SEP-04 | P0 · BE + QA | Tạo test project thật trong solution; unit test validator/use case auth/department, integration test permission + tenant isolation. Phụ thuộc SEP-01/02. | `dotnet test` chạy test count > 0; test hai tổ chức không đọc/sửa dữ liệu chéo; CI fail khi test hỏng; đo coverage của phần code chốt mốc, hướng tới mức tối thiểu 80% theo quy ước nhóm |
| SEP-05 | P0 · FE + QA | Tách public `/verify` khỏi guard; xác định public/learner/enterprise route ownership, tạo layout boundary và redirect cho route cũ. Không cần port toàn bộ demo. | Public mở được route công khai; route enterprise vẫn yêu cầu auth/role; build frontend qua; CSS learner không làm vỡ dashboard |
| SEP-06 | P0 · DevOps | Đồng bộ `VITE_API_BASE_URL`; sửa workflow path filters từ `docker-compose.yml` ở root sang `docker/**`; thêm bước áp migration cho môi trường production/test và kiểm tra secrets bắt buộc. Phụ thuộc SEP-01. | Quy trình deploy trên DB trắng có schema trước API; FE gọi đúng `/api/v1`; CI thực sự chạy khi `docker/docker-compose.yml` đổi; không dùng mật khẩu/JWT fallback mặc định ở production |
| SEP-07 | P0 · QA + PM | Chạy smoke test FE–API–DB cho login/RBAC/Department, cập nhật tracking theo bằng chứng và ghi issue/defect thật. Phụ thuộc SEP-01 đến SEP-06. | Có log test, các lỗi còn mở và quyết định go/no-go; không dùng build thành công thay cho kiểm thử luồng |
| SEP-08 | P1 · BE + FE | Thiết kế và bắt đầu CRUD JobFamily/JobPosition, form quản lý và tenant tests. Phụ thuộc SEP-01/04. | Chỉ ghi `Done` khi API, UI, quyền và test có đủ; entity/config riêng lẻ là `In Progress` |
| SEP-09 | P1 · Product + BE | Chốt identity/catalog schema cho người học tự do, mapping vị trí và phạm vi public course. Phụ thuộc quyết định ở §3.3. | Có migration/API contract được review và ít nhất một luồng dữ liệu mẫu được xác định; chưa gọi là learner flow production nếu vẫn dùng mock |

**Giao hàng tháng 9 đề xuất:** nền auth/RBAC/Department chạy xuyên suốt, route boundary cho hai giao diện, kế hoạch schema/API cho luồng học công khai và một tracker đã đối chiếu. Đây là mốc trung thực với code hiện tại. Nếu P0 chưa qua, trạng thái nên là “foundation đang tích hợp”, không công bố MVP học tập đã hoàn tất.

### 5.4. Việc phải lập lại mốc sau 30/09

Thứ tự phụ thuộc: `JobPosition/Employee → Competency/Requirement → Catalog/Course → Assignment/Enrollment/Progress → Diagnostic/Recommendation → Assessment/Evidence/Certificate/Analytics`. Các task Course/Assessment ghi hạn cuối tháng 9 trong tracker cần dời sang mốc sau khi model, API và test của các bước trước được chốt. Không đưa một trang placeholder hoặc demo lưu localStorage vào cột `Done` của tính năng production.

## 6. Cổng chất lượng và rủi ro

### Điều kiện đóng một lát chức năng

1. Contract FE/BE và migration đã được cập nhật, không còn endpoint hoặc DTO giả trong luồng đó.
2. Backend kiểm tra quyền **và** giới hạn tenant/owner tại truy vấn; FE guard chỉ hỗ trợ UX.
3. Có trạng thái loading, empty, error, unauthorized; đường đi quan trọng chạy sau reload và trên DB mới.
4. Có test có ý nghĩa cho rule, quyền và một đường đi tích hợp; CI thực sự chạy các test đó.
5. Dữ liệu demo được đánh dấu demo hoặc seed dev; kết quả production không chỉ nằm ở `localStorage`.

### Rủi ro đang thấy

- **Lẫn trạng thái tài liệu/code:** tracker cũ đánh dấu nhiều nền tảng `Not Started` dù đã có mã, và một số mục `Done` mới là đặc tả. Cần bằng chứng theo acceptance, không cộng số dòng Done thành số tính năng.
- **Schema/migration lệch:** migration foundation mới đang trong trạng thái Git chưa ổn định; production compose mặc định không auto migrate. Cần chốt chain trước khi thêm module.
- **CI xanh giả:** backend solution chưa có test project; lệnh `dotnet test` có thể exit 0 mà không chạy test.
- **Hai nguồn dữ liệu:** demo localStorage và API thật sẽ cho kết quả học khác nhau nếu port UI trước khi có contract/server state.
- **Rò dữ liệu tenant:** learner public phải có catalog publish riêng; không mở API tenant cho anonymous chỉ vì frontend có landing.
- **Bảo mật cấu hình:** compose có giá trị fallback cho mật khẩu và JWT key; production phải yêu cầu secret thực và có bước kiểm tra môi trường.

## 7. Các quyết định còn mở, với mặc định đề xuất

| Câu hỏi | Mặc định để thiết kế tiếp | Khi nào phải chốt |
| --- | --- | --- |
| Khách xem vị trí trước đăng nhập? | Có; đăng nhập khi bắt đầu khảo sát hoặc cần lưu tiến độ | Trước public catalog API và route guard learner |
| Ai sở hữu nội dung công khai? | Nền tảng sở hữu, doanh nghiệp có thể dùng lại/ánh xạ nhưng nội dung riêng mặc định không công khai | Trước Course schema |
| Nhân viên được tự chọn vị trí mục tiêu? | Có lựa chọn cá nhân; assignment bắt buộc của doanh nghiệp vẫn tách riêng | Trước TargetPosition/Assignment API |
| Một người dùng có thể vừa là nhân viên vừa học công khai? | Có; một `User`/`LearnerProfile`, dữ liệu assignment theo org tách khỏi mục tiêu cá nhân | Trước migration enrollment/progress |
| Hai frontend build độc lập? | Chưa; một React app với hai layout cho mốc hiện tại | Chỉ xem lại khi cần deploy/team release độc lập |

## 8. Giới hạn của bản đánh giá

Đặc tả dựa trên mã có trong working tree ngày 27/09 và snapshot workbook đề ngày 18/09; chưa xác nhận runtime với PostgreSQL/Docker trên máy này. Lệnh build không chứng minh migration, seed, auth và các luồng UI hoạt động cùng nhau. Các task/endpoint trong tài liệu này được ghi là **đề xuất** trừ khi §2 nói rõ đã có trong mã.
