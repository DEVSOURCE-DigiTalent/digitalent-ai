# 13 — Chiến Lược Kiểm Thử

> Nguồn gốc: Report 2 v2.5 §1.2/§2.2, Report 3 v2.2 và Master System Overview 09/10/2026. Đây là chiến lược/tiêu chí kiểm thử; không xác nhận trạng thái test hoặc coverage thực tế.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Chiến lược kiểm thử |
| Phiên bản | 3.2 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 2 v2.5 §1.2/§2.2; Report 3 v2.2; Master System Overview §5, §7, §10 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; 3 tầng test + UAT theo màn hình |
| 09/10/2026 | 3.1 | Đồng bộ Enterprise MVP, TT02, 4 role và business rules hiện hành; giữ GRADE-01 pending |
| 09/10/2026 | 3.2 | Thêm kiểm thử riêng recommendation/assignment và guardrails AI evaluation; giữ retraining assessment pending |

---

## 2. Mục đích và phạm vi

Chiến lược kiểm thử bảo đảm chất lượng xuyên suốt: **unit → integration → E2E/UAT**. Dùng mục tiêu coverage theo Report 3 NFR; đo coverage thực tế riêng và không ghi nhận là đạt nếu chưa có báo cáo test. Ưu tiên logic Skill Gap, recommendation/assignment, RBAC/data scope, version snapshots và review evidence. AI hỗ trợ đánh giá Practical Task là đề xuất mở rộng scope; cần cập nhật Report 1/2 trước khi xem là cam kết MVP hoặc triển khai. Tài liệu này không xác nhận chức năng đó đã có trong code.

**Ngoài phạm vi:** CI/CD pipeline chi tiết (14), checklist code trước push (11).

---

## 3. Tài liệu tham chiếu

- Report 2 §1.2 — Quality Objectives, §2.2 — Test Plan
- Backend test projects và kết quả chạy tương ứng (cần ghi nhận theo commit; chưa xác minh trong tài liệu này)
- `10_Dac_Ta_UI_UX.md` (danh sách màn hình cho UAT)
- `16_Thiet_Ke_Cham_Diem_AI_Rule.md` (công thức cần test)

---

## 4. Chiến lược tổng quan

| Tầng | Công cụ | Mục tiêu | Bao phủ |
|------|---------|----------|---------|
| Unit | Theo test framework được xác nhận trong repo | Hàm, service, quy tắc nghiệp vụ | Logic thuần |
| Integration | Theo framework/DB test được xác nhận trong repo | Endpoint, DB, RBAC, middleware | Luồng API |
| E2E/UAT | Browser automation nếu được cấu hình; UAT theo checklist | Luồng người dùng chính | Hành trình |

> Trạng thái test runner, test hiện có, coverage và E2E chưa được xác minh tại một commit cụ thể. Không trình bày các công cụ hoặc kết quả dự kiến như trạng thái đã triển khai.

---

## 5. Mục tiêu chất lượng (Report 2 §1.2)

| Mục tiêu | Ngưỡng |
|----------|--------|
| Backend application/domain unit-test coverage | Mục tiêu ≥ 80% theo Report 3; cần đo để xác nhận |
| Critical/High defect lúc release | 0 |
| Defect reopen | < 5% |
| Thời gian phản hồi API (P95) | Đo dưới tải cụ thể theo Report 3; không đặt ngưỡng thay thế từ tài liệu này |

---

## 6. Chiến lược unit test

| Đối tượng | Trọng tâm |
|-----------|-----------|
| Service (Competency/Course/Assessment/Certificate/Task/Intelligence) | Business rule, validation |
| Quy tắc nghiệp vụ | Skill Gap (file 16), certificate eligibility, correction và evidence review |
| Recommendation/assignment | Mapping gap → khóa học phải giải thích được; recommendation tự sinh và nhân viên có thể bắt đầu; OWNER assignment là một luồng riêng |
| AI Practical Task evaluation | Validate rubric version, từng tiêu chí, score đề xuất, lý do/căn cứ, phần thiếu; output không được tự chốt competency |
| RBAC helper | `can()`, `HasPermission`, data scope |
| Middleware | `ExceptionHandlingMiddleware` map HTTP |

**Kỹ thuật:** AAA (Arrange-Act-Assert), mock `IApplicationDbContext`, test đặt tên mô tả hành vi. Ví dụ:

Ví dụ hành vi cần kiểm tra: khi có confirmed grade thấp hơn requirement thì trạng thái là `Partial Gap`; không mã hóa con số 3 hay 6 vào test cho đến khi GRADE-01 được quyết định.

---

## 7. Chiến lược integration test

| Luồng | Kiểm tra |
|-------|----------|
| Auth | Luồng xác thực theo Report 3; kiểm tra quyền và scope ở backend |
| RBAC | PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE; tenant/org scope và manager department assignment |
| Competency | Tạo requirement set → kích hoạt → archive bản cũ (BR-03) |
| Learning recommendation and assignment | Gap/mapping tạo hoặc cập nhật recommendation; Employee có thể bắt đầu; OWNER có thể tạo assignment riêng cho cập nhật/đào tạo lại; kiểm tra hai luồng không ghi đè nhau |
| Certificate | Eligible course + required lessons complete + final assessment passed cấp certificate; non-eligible course không cấp; revoke cập nhật trạng thái/registry |
| QR verification | OWNER/MANAGER phải đăng nhập vào đúng tổ chức phát hành; no-self verification; wrong organization bị từ chối; kiểm tra trường dữ liệu tối thiểu |
| Owner correction | OWNER giảm grade hoặc reset về chưa xác nhận chỉ để sửa lỗi; reason/audit/history bắt buộc; no-self correction; không cho correction tăng grade |
| Task | Nộp đúng hạn và trễ hạn; submission trễ vẫn được review; AI proposal theo rubric nếu scope được duyệt; reviewer có thể sửa/duyệt/yêu cầu bổ sung; chỉ approved valid level-confirming evidence làm thay đổi confirmed competency |
| AI evaluator security | Chỉ đọc evidence mà requester/reviewer được phép truy cập; dữ liệu evidence là input không tin cậy; không thực thi chỉ dẫn trong evidence; prompt/data boundary và masking/logging được kiểm tra |
| AI evaluator edge cases | Evidence private/unauthorized, không đủ hoặc mâu thuẫn, model lỗi, reviewer override, audit/history, và ngăn AI tự finalise |
| Version snapshots | Assignment giữ Course Version/Assessment Version; attempt dùng snapshot câu hỏi, options, đáp án, điểm và pass rule tại thời điểm bắt đầu |
| Skill Gap | Met / Partial Gap / Gap / Not Assessed; chưa có position/active requirement là Not Assessed |

**Chú ý:** dùng transaction/rollback hoặc DB test riêng; không test trên dữ liệu production.

---

## 8. UAT theo màn hình (Report 3 §3.1.2)

Chạy UAT theo **42 screens** của Report 3 v2.2 (file 10). Mỗi màn hình: actor đúng, action đúng, trạng thái loading/empty/error đúng, scope dữ liệu đúng. Hai internal functions UC-24/UC-31 không tính là user-initiated screens.

| Khu vực | Màn hình | Actor |
|---------|----------|-------|
| Common & Auth | Login → 404 | Tất cả |
| Platform administration | TT02, standard curriculum, question bank, assessment, audit | PLATFORM_ADMIN |
| Organization management | Members, departments, positions, requirements, course recommendations/monitoring, optional course assignment, certificates | OWNER |
| Team oversight | Assigned department scope, task review, competency/learning monitoring | MANAGER |
| Employee | Recommended and assigned learning, assessment results, certificates, own competency/gap, evidence submission | EMPLOYEE |
| Certificate verification | Authenticated verification in issuing organization | OWNER / MANAGER |

---

## 9. Các luồng nghiệp vụ ưu tiên (critical path)

1. **Requirement → Skill Gap → automatic course recommendation → Employee starts learning; optional OWNER course assignment → assessment → certificate nếu eligible** (FE-04..06)
2. **Internal certificate**: eligible và non-eligible; QR same-org authenticated verification, no-self, wrong-org denial và revoked certificate (FE-06.8/06.9)
3. **Task → đúng hạn/trễ hạn submission → (nếu được scope duyệt) AI rubric proposal → OWNER/MANAGER review/edit/approve/request evidence → evidence**; late submission vẫn được review (FE-07)
4. **Owner correction**: giảm/reset để sửa lỗi, reason/audit/history, no-self; không tăng thủ công (FE-05)
5. **Version stability**: course/assessment version và attempt snapshots; thay đổi phiên bản không đổi assignment/attempt cũ (FE-06)
6. **Skill Gap states**: Met / Partial Gap / Gap / Not Assessed và recalculation sau các sự kiện nghiệp vụ (FE-05)

7. **AI evaluation guardrails (scope expansion, pending Report 1/2 update)**: test criterion-level proposal and evidence citations, insufficient/private/untrusted evidence, unauthorized access, reviewer override and audit history; verify AI output/score alone never updates Confirmed Competency. Do not claim implementation until verified.

**PENDING DECISION — retraining:** Khi OWNER giao khóa học do cập nhật nội dung/chính sách, chưa chốt chỉ cần final course assessment hay còn bắt buộc Practical Task. Giữ đây là quyết định mở; không mã hóa một nhánh thành acceptance criteria.

---

## 10. Dữ liệu kiểm thử

- Dùng tài khoản seed riêng cho môi trường test; không ghi credential mặc định vào tài liệu hoặc log.
- Bộ dữ liệu demo: TT02 reference; 3 training tiers (Basic, Intermediate, Advanced); vị trí/competency theo requirement set mẫu đã được xác nhận. Số lượng seed phải lấy từ bộ dữ liệu demo thực tế, không mặc định 5 job family/7 position/21 competency.
- Không dùng dữ liệu cá nhân thật; nhân viên mẫu là dữ liệu giả.

---

## 11. Tiêu chí hoàn thành (Definition of Done)

- [ ] Coverage đạt mục tiêu Report 3 và có báo cáo gắn với commit
- [ ] Unit/integration test pass và lưu kết quả gắn với commit
- [ ] Static/type checks nếu có trong pipeline thực tế pass
- [ ] Không CRITICAL/HIGH defect
- [ ] UAT từng màn hình pass

---

## 12. Ma trận vết

| Hạng mục test | UC/BR | File |
|---------------|-------|------|
| Skill Gap rules | FE-05, BR liên quan | 16 |
| RBAC & scope | UC-08..13, BR-12 | 09 |
| Requirement set version | UC-16, BR-02/03 | 07 |
| Certificate eligibility / internal QR | FE-06.8/06.9, CERT-01 | 15 |
| Task, late submission & evidence | FE-07, BR-LATE-01 | 04 |
| Course/assessment snapshots | BR-VER-01 | 04 / Report 4 |
| Owner correction | BR-FIX-01 | 09 / 16 |
