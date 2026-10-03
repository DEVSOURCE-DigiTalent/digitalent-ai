# Trạng thái Agent 2 (Platform, Manager, Employee, Nhiệm vụ)

Cập nhật lần cuối: 2026-10-02 21:20 (GMT+7)

---

## 1. Trạng thái hiện tại: ĐẠT MỐC S4 (HOÀN THÀNH TOÀN DIỆN & VÁ TRIỆT ĐỂ RBAC/SCOPING)

> [!NOTE]
> **CÔNG BỐ MỐC S4**: Toàn bộ các yêu cầu của giai đoạn E (Employee), F (Nhiệm vụ & Minh chứng), G (Manager), I (Platform) đã hoàn thành xuất sắc.
> Đặc biệt, đã khắc phục triệt để toàn bộ 5 nhóm vấn đề phân quyền RBAC và lọc phạm vi scoping trên mock server được chỉ ra từ đợt kiểm tra độc lập.
> 
> Đã nghiệm thu chất lượng kỹ thuật 4/4 tiêu chí:
> - `npx tsc -b`: **0 lỗi**
> - `npx vitest run`: **55/55 test files, 653/653 tests XANH 2 LẦN LIÊN TIẾP**
> - `npm run lint`: **0 lỗi (74 warnings thuộc legacy experience)**
> - `VITE_USE_MOCK=false npx vite build && npm run check:no-mock`: **OK (không có mock code trong production build)**
> - Sẵn sàng bàn giao cho Agent 1 thực hiện giai đoạn **J**.

---

## 2. Kết quả kiểm tra chất lượng kỹ thuật

### 2.1. TypeScript Compiler (`npx tsc -b`) — 0 LỖI
```text
D:\digitalent-ai\frontend> npx tsc -b
Exit code: 0
Stdout: (Trống - không có bất kỳ lỗi nào)
```

### 2.2. Linter (`npm run lint` / Oxlint) — 0 LỖI
```text
D:\digitalent-ai\frontend> npm run lint

Found 74 warnings and 0 errors.
Finished in 327ms on 545 files with 103 rules using 8 threads.
Exit code: 0
```
*(74 warnings thuộc về code trải nghiệm demo cũ trong features/experience - không có lỗi trong code mới).*

### 2.3. Vitest (`npx vitest run`) — 100% XANH LIÊN TIẾP 2 LẦN (653/653 tests)

- **Lần 1**:
```text
 Test Files  55 passed (55)
      Tests  653 passed (653)
   Start at  21:11:03
   Duration  178.46s (transform 110.47s, setup 92.69s, collect 563.60s, tests 205.90s, environment 191.13s, prepare 53.16s)
Exit code: 0
```

- **Lần 2**:
```text
 Test Files  55 passed (55)
      Tests  653 passed (653)
   Start at  21:14:46
   Duration  125.57s (transform 55.05s, setup 67.40s, collect 357.80s, tests 142.29s, environment 153.28s, prepare 43.70s)
Exit code: 0
```

### 2.4. Build Production & Check No-Mock (`VITE_USE_MOCK=false npx vite build && npm run check:no-mock`) — ĐẠT CHUẨN
```text
vite v8.1.0 building client environment for production...
transforming...✓ 1208 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               0.91 kB │ gzip:   0.50 kB
dist/assets/LandingPage-Coyxaioh.css          4.94 kB │ gzip:   1.50 kB
dist/assets/ExperienceRoute-DcFFrFiB.css    109.81 kB │ gzip:  18.64 kB
dist/assets/index-BBWFgEz7.css              143.49 kB │ gzip:  22.37 kB
dist/assets/LandingPage-B31dFV_k.js          99.59 kB │ gzip:  25.32 kB
dist/assets/ExperienceRoute-KGSyYXSJ.js     633.84 kB │ gzip: 154.84 kB
dist/assets/index-LJDDSp3p.js             2,108.01 kB │ gzip: 517.36 kB

✓ built in 11.23s

> frontend@0.0.0 check:no-mock
> node scripts/check-no-mock.mjs

OK: no mock code in the production build.
Exit code: 0
```

---

## 3. Khắc phục triệt để lỗi phân quyền (RBAC) & Scoping theo yêu cầu kiểm tra độc lập

### 3.1. Phân quyền và Lọc phạm vi trong `services/mock/server/handlers/tasks.ts`
1. **Gắn quyền và role cho toàn bộ 9 route**:
   - `POST /tasks`: `permission: P.TASK_CREATE`, `roles: [ROLES.OWNER, ROLES.MANAGER]`, status 201. Manager chỉ được giao nhiệm vụ cho nhân sự thuộc phạm vi quản lý (`inScopeIds`), giao ngoài phạm vi trả về **403 Forbidden**.
   - `GET /tasks`: `roles: [ROLES.OWNER, ROLES.MANAGER]`. Chặn Employee với mã **403 Forbidden**. Manager chỉ thấy các nhiệm vụ trong phạm vi hoặc do chính mình tạo.
   - `GET /tasks/:id`: Owner xem toàn tổ chức; Manager xem nhiệm vụ trong phạm vi (ngoài phạm vi trả về **404 Not Found**); Employee chỉ xem nhiệm vụ được phân công cho mình (ngoài phạm vi trả về **404 Not Found**).
   - `GET /review-queue`: `permission: P.TASK_EVALUATE`, `roles: [ROLES.OWNER, ROLES.MANAGER]`. Chặn Employee với mã **403 Forbidden**. Manager chỉ thấy bài nộp của nhân sự trong phạm vi.
   - `GET /submissions/:id`: Owner xem toàn tổ chức; Manager xem bài nộp trong phạm vi (ngoài phạm vi trả về **404 Not Found**); Employee chỉ xem bài nộp của mình (ngoài phạm vi trả về **404 Not Found**).
   - `POST /submissions/:id/evaluate`:
     - `permission: P.TASK_EVALUATE`, `roles: [ROLES.OWNER, ROLES.MANAGER]`.
     - **Cấm tự duyệt**: Trả về **403 Forbidden** nếu người đánh giá tự duyệt bài nộp của chính mình (`sub.employeeId === callerEmp.id`).
     - **Manager scoping**: Manager duyệt bài ngoài phạm vi trả về **403 Forbidden**.
     - **Conflict check**: Chỉ đánh giá bài đang ở trạng thái `PENDING_REVIEW`, trạng thái khác trả về **409 Conflict**.
   - `GET /me/tasks`: `permission: P.TASK_READ`. Lấy đúng nhiệm vụ được giao cho nhân viên theo session; xóa bỏ hoàn toàn hardcode `emp-01`.
   - `POST /tasks/:id/submit`: `permission: P.TASK_SUBMIT`. Chỉ nhân viên được phân công mới được nộp bài (không được phân công trả về **403 Forbidden**); bỏ hardcode `emp-01` / `Đỗ Minh Quân`.
   - `GET /me/evidence`: `permission: P.EVIDENCE_READ`. Lấy danh sách minh chứng của nhân viên theo session `callerEmp.id`; bỏ hardcode.
2. **Loại bỏ triệt để hardcode**:
   - Xóa bỏ toàn bộ fallback gán cứng `'emp-02'` / `'Phạm Thị Quản Lý'`.
   - Viết helper `findCallerEmployee(data, session)` và `getManagerInScopeEmployeeIds(data, callerEmp)` phân giải chính xác nhân sự và phạm vi từ session đăng nhập. Nếu không tìm thấy bản ghi nhân viên của tài khoản trong tổ chức thì trả lỗi rõ ràng.

### 3.2. Rà soát và vá lỗi các handler khác trong vùng sở hữu
1. **`services/mock/server/handlers/learning.ts`**:
   - `POST /course-assignments` & `DELETE /course-assignments/:id`: Gắn `roles: [ROLES.OWNER]` (chặn triệt để Manager giao khóa học theo spec).
   - `GET /internal-courses`, `GET /internal-courses/:id`: Gắn `permission: P.COURSE_READ_CATALOG`.
   - `POST /internal-courses`: Gắn `permission: P.COURSE_CREATE`, `roles: [ROLES.OWNER]`, status 201.
2. **`services/mock/server/handlers/platform.ts`**:
   - Tự động bọc kiểm tra role `ROLES.PLATFORM_ADMIN` cho toàn bộ 42 route bắt đầu bằng `/platform/*`.
   - Các route self-service dùng chung SHR-01..03 (`/account/profile`, `/account/change-password`, `/account/login-history`, `/notifications`, `/notifications/:id/read`, `/notifications/read-all`) được gắn quyền self-service tương ứng (`ACCOUNT_VIEW_OWN`, `ACCOUNT_UPDATE_OWN_PROFILE`, `ACCOUNT_CHANGE_OWN_PASSWORD`, `NOTIFICATION_READ_OWN`, `NOTIFICATION_MARK_READ`).

### 3.3. Bộ test ma trận tự động `tasks-scoping-rbac.test.ts` (16 test cases, PASS 100%)
File test `src/services/mock/server/__tests__/tasks-scoping-rbac.test.ts`:
- **Employee role**:
  - 403 khi gọi `GET /tasks` và `GET /review-queue`.
  - 403 khi gọi `POST /tasks` và `POST /submissions/:id/evaluate`.
  - Xem đúng `GET /me/tasks`, `POST /tasks/:id/submit`, `GET /me/evidence`.
  - 404 khi truy cập chi tiết task không được phân công cho mình.
  - 403 khi cố nộp bài cho task không được phân công cho mình.
  - 404 khi xem chi tiết bài nộp của người khác.
- **Manager role**:
  - Chỉ xem nhiệm vụ và bài nộp trong phòng ban phụ trách (dep-kd).
  - 404 khi xem nhiệm vụ/bài nộp ngoài phạm vi quản lý (dep-kt).
  - 403 khi cố giao bài cho nhân viên ngoài phạm vi.
  - 403 khi cố duyệt bài nộp ngoài phạm vi.
  - 403 khi cố tự duyệt bài nộp của chính mình.
  - 409 Conflict khi duyệt bài không ở trạng thái `PENDING_REVIEW`.
  - Duyệt bài thành công trong phạm vi, lưu tên người chấm `Phạm Thị Quản Lý`.
- **Owner & Owner2 role**:
  - Xem danh sách và hàng chờ bài nộp trên toàn tổ chức.
  - Luồng End-to-end: Owner tạo task yêu cầu `cmp-4-2` Level 2 -> Employee nộp bài -> Owner duyệt APPROVED -> Hồ sơ năng lực cập nhật Level 2 nguồn `TASK` -> Skill gap tính toán lại.

---

## 4. Nhật ký kiểm tra trình duyệt thực tế (E2E)

1. **Manager (`manager@digitalent.demo` - Phạm Thị Quản Lý)**:
   - **MG-01 (Tổng quan nhóm)**: Hiển thị headcount 4 nhân sự, tỷ lệ đạt chuẩn TT02 76%, số lượng nhân sự có Gap lớn, bài thực hành & chờ chấm, phân bố Job Grade G1-G3, đào tạo đang chạy và sắp hết hạn.
   - **MG-02 (Thành viên nhóm)**: Danh sách nhân sự thuộc phòng Kinh doanh, lọc theo vị trí và cấp bậc.
   - **MG-03 (Chi tiết thành viên)**: Tích hợp đầy đủ các tab `employee-tabs` ở chế độ chỉ đọc.
   - **MG-04 (Năng lực nhóm)**: Hiển thị ma trận năng lực `WorkforceCompetencyMatrix` cho 6 miền TT02-D1..D6.
   - **MG-05 (Khoảng trống năng lực)**: Tích hợp `SkillGapAnalyticsView` phân tích mức độ gap Cao / TB / Thấp.
   - **MG-06 (Tiến độ đào tạo)**: Tích hợp `TrainingMonitorPage` chỉ đọc trong phạm vi nhóm, **tuyệt đối không có nút giao khóa học**.
   - **Nhiệm vụ & Chấm điểm**:
     - Giao nhiệm vụ thực tế cho nhân sự trong nhóm thành công.
     - Duyệt bài nộp trong phạm vi thành công, điểm số và năng lực được tính lại ngay lập tức.

2. **Employee (`employee@digitalent.demo` - Hoàng Văn Nhân Viên)**:
   - **EM-01 (Bảng phát triển)**: Hiển thị KPIs năng lực cá nhân, tiến độ học tập, bài tập thực hành.
   - **EM-02 (Hồ sơ năng lực)**: Hiển thị đúng metadata Phòng ban (Kế toán), Vị trí (Kế toán), Cấp bậc G1 (Nhân viên), tỷ lệ đáp ứng 6/21 năng lực (62.03%), bảng năng lực TT02 với chuẩn 3 trình độ: Cơ bản / Trung cấp / Nâng cao.
   - **EM-05 (Lộ trình học tập)**: Hiển thị chuỗi học phần theo đúng thứ tự tiên quyết, trạng thái hoàn thành, tỷ lệ tiến độ và rationale giải thích lý do giao/đề xuất.
   - **EM-06 (Khóa học của tôi)**: Phân loại 4 nhóm khóa học (Được giao, Đề xuất, Đang học, Đã xong).
   - **EM-09 (Bài đánh giá)**: Hiển thị danh sách bài thi với điểm số, thời gian, kết quả Đạt / Chưa đạt / Làm dở.
   - **EM-11 (Nhiệm vụ thực tế)**: Hiển thị bài tập thực tế, trạng thái "Đã duyệt" và xem phản hồi của Manager.

3. **Owner tổ chức nhỏ (`owner2@digitalent.demo` - Trần Văn Chủ Nhỏ, Công ty TNHH Giải Pháp Trẻ)**:
   - Đăng nhập kiểm tra giao diện Owner: Kiểm soát toàn bộ tổ chức, quản lý thành viên, năng lực, đào tạo và nhiệm vụ thực tế.
   - Menu không có mục "Cá nhân" (đúng theo spec v2.1 §9.2).

---

## 5. Yêu cầu gửi Agent 1
- Agent 2 đã **HOÀN THÀNH TOÀN BỘ VÀ CÔNG BỐ CHÍNH THỨC MỐC S4**.
- Toàn bộ test suite 55 test files / 653 tests đều xanh 100%, 0 lỗi TypeScript, 0 lỗi lint, build production thành công.
- Agent 1 có thể tiến hành **Giai đoạn J** (xóa các file legacy, dọn dẹp các đường dẫn tạm thời, hoàn tất tài liệu nghiệm thu chung).
