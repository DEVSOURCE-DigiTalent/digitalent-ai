# 03B — SRS: Tài liệu Đặc Tả Yêu Cầu Phần Mềm (Phi Chức Năng)

> Nguồn gốc: Report 3 — *Software Requirement Specification* §4–§5. Phiên bản docs_v3, tiếng Việt.

> **Baseline alignment 09/10/2026:** Ưu tiên Report 3 v2.2 và `DigiTalent_AI_MASTER_SYSTEM_OVERVIEW_2026-10-09.md`. Nội dung cũ bên dưới về public endpoint, SignalR bắt buộc, grade storage ba mức, risk/readiness hoặc scoring weights không còn là Enterprise MVP baseline. Đây là yêu cầu, không xác nhận implementation. Certificate verification là endpoint/screen đã đăng nhập và chỉ dành cho OWNER/MANAGER của đúng tổ chức phát hành. Hệ thống tự đề xuất khóa học từ Skill Gap và mapping; OWNER cũng có thể giao khóa khi có cập nhật/đào tạo lại. AI đánh giá Practical Task là target requirement chờ xác nhận scope Report 1/2; yêu cầu bảo mật bên dưới chỉ áp dụng nếu được phê duyệt. `GRADE-01` vẫn **PENDING DECISION**.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | SRS — Yêu cầu phi chức năng (Non-Functional Requirements) |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §4, §5.4 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ, căn chỉnh theo Reports |

---

## 2. Mục đích và phạm vi

Đặc tả yêu cầu phi chức năng theo mô hình chất lượng **ISO/IEC 25010:2023**. Mỗi thuộc tính chất lượng đều có **chỉ số đo được** — không dùng mô tả định tính kiểu "hệ thống phải nhanh". Tài liệu cũng liệt kê external interface và các yêu cầu khác.

**Ngoài phạm vi:** yêu cầu chức năng (03A), thiết kế bảo mật chi tiết (15).

---

## 3. Tài liệu tham chiếu

- Report 3 — *Software Requirement Specification* §4
- ISO/IEC 25010:2023 — mô hình chất lượng phần mềm
- OWASP ASVS — kiểm soát bảo mật
- `00_INDEX_Tong_Quan_Tai_Lieu.md`

---

## 4. External Interfaces

DigiTalent AI giao tiếp với 4 bên ngoài. **Không có** payment gateway, SSO công ty, hay tích hợp HRM sẵn có — nằm ngoài phạm vi bản này.

| # | Interface | Chiều | Mục đích | Protocol |
|---|-----------|-------|----------|----------|
| 1 | SMTP mail server | Outbound | Link reset mật khẩu, (tùy chọn) thông báo giao việc | SMTP over TLS |
| 2 | MinIO object storage | Hai chiều | Học liệu, bài nộp task, PDF chứng chỉ. File không vào DB | S3 API over HTTPS |
| 3 | LLM API (tùy chọn; AI evaluation scope pending) | Outbound | Trong scope hiện tại: nháp câu hỏi / ý tưởng task, mọi draft cần người duyệt. Nếu AI-assisted Practical Task evaluation được phê duyệt, có thể gửi evidence được phép truy cập và rubric để lấy đánh giá sơ bộ; hệ thống chạy đủ luồng review nếu LLM thiếu | HTTPS REST |
| 4 | Browser client | Hai chiều | Tương tác người dùng; notification in-app dùng browser polling trong MVP | HTTPS REST; không mặc định SignalR/WebSocket |

---

## 5. Chất lượng (ISO/IEC 25010)

### 5.1 Usability (Khả dụng)

- Người dùng HR lần đầu giao được khóa học cho 5 nhân viên trong **5 phút**, không cần hướng dẫn viết (kiểm chứng bằng walkthrough có giám sát).
- Mọi hành động phá hủy (revoke/archive/delete) phải có bước xác nhận nêu tên record.
- Mọi list có search, sort, pagination (mặc định 20 dòng).
- Mọi màn hình có loading state, empty state, error state — không để vùng trống.

### 5.2 Reliability (Tin cậy)

- Không mất chứng chỉ/evidence/attempt đã xác nhận qua restart (kiểm bằng so sánh số record trước/sau).
- Sẵn sàng xuyên suốt buổi demo đã lên lịch, không downtime ngoài kế hoạch.
- Thao tác đa bảng (cấp chứng chỉ, xác nhận evidence, activate requirement set) thực hiện **trọn vẹn hoặc không**.
- LLM hỏng không chặn luồng lõi.

### 5.3 Performance (Hiệu năng)

- **95%** list, detail và save API responses hoàn tất trong **2 giây** với **50 concurrent users**, đo trong 10 phút sau ramp-up 1 phút.
- Dashboard load ≤ **3 giây** với seed khoảng 200 nhân viên, 20 positions, 6 requirement sets và standard demo content; ghi cấu hình máy và browser trong kết quả đo.
- Skill Gap recalculation sau một confirmation hoàn tất ≤ **5 giây**; recalculation toàn organization với 200 nhân viên hoàn tất ≤ **5 phút**.
- Queued recalculation có trạng thái Pending/Done/Failed và retry theo quy tắc Report 3.
- List paginated trên server; không endpoint trả tập kết quả không giới hạn.

### 5.4 Security (Bảo mật)

- Mật khẩu chỉ lưu dạng salted hash, không xuất hiện trong log/audit.
- Access token hết hạn ≤ **30 phút**, refresh token ≤ **7 ngày**.
- Endpoint QR verification yêu cầu đăng nhập và OWNER/MANAGER của organization phát hành, tối đa **20 requests/phút/user**; chỉ trả holder name, course/competency, issue date và status, không lộ evidence, assessment attempt hoặc internal employee ID.
- File upload kiểm tra extension, size, content type; chỉ phục vụ người có quyền với record cha.
- Mọi hành động nhạy cảm (BR list §9 file 03A) ghi audit log.
- Nếu AI-assisted Practical Task evaluation được đưa vào scope, chỉ gửi evidence tối thiểu mà reviewer được phép truy cập; tenant/organization access scope phải được áp dụng trước khi xử lý. Không dùng evidence của organization cho huấn luyện nhà cung cấp; bảo vệ dữ liệu nhạy cảm khi truyền/lưu và ghi nhận provider/model, rubric version, AI output, reviewer decision/edits. AI response không được tự ghi Confirmed Competency.
- Giữ liên kết evaluation với submission và rubric version; giới hạn quyền xem AI output/reviewer notes theo cùng scope evidence, và log truy cập/thay đổi để truy vết.

### 5.5 Compatibility & Portability (Tương thích & Khả chuyển)

- Render đúng trên 2 phiên bản gần nhất của Chrome, Edge, Firefox.
- Layout dùng được ở desktop (≥1280px), tablet (768px), mobile (375px).
- Toàn bộ hệ thống khởi động từ **một** docker-compose trên máy sạch.

### 5.6 Maintainability (Bảo trì)

- Test tự động phủ ≥ **80%** tầng application + domain.
- Trọng số/level mapping/ngưỡng ở configuration, không phải hằng số trong code.
- API tài liệu bằng OpenAPI, luôn khớp implementation.

---

## 6. Yêu cầu khác (Report 3 §5.4)

### 6.1 Thang mức năng lực

> **GRADE-01 — PENDING DECISION:** Report 3 v2.2 mô tả Grade 1–6 theo TT02; ba Level đào tạo Basic/Intermediate/Advanced là nhóm khóa học, chưa đủ căn cứ để kết luận grade lưu trữ có 3 hay 6 mức. Không tự thay đổi ERD, constraint hoặc phép tính trước quyết định.

### 6.2 Ranh giới phạm vi

Loại trừ khỏi Enterprise Capstone MVP: native mobile app, payroll/attendance, learning marketplace thu phí, project-management board tổng quát, enterprise SSO/LDAP, public certificate verification, certificate expiry/renewal, risk/readiness scoring và scoring weights. Skill Gap là rule-based theo Met / Partial Gap / Gap / Not Assessed; đây không phải risk/readiness score.

> **AI evaluation scope gate:** AI-assisted Practical Task evaluation expands beyond AI content drafting described in Report 1. The functional and security statements about AI evaluation in 03A/03B are proposed target requirements only; reconcile scope, effort, data handling and acceptance criteria in Report 1/2 before implementation. No model/provider is selected here. Course recommendations remain deterministic/explainable mapping rules and do not require AI.

---

## 7. Ma trận vết

| NFR | Tiêu chuẩn | File kiểm chứng |
|-----|-----------|-----------------|
| Usability | ISO 25010 | 10 (UI/UX), 13 (test UAT) |
| Reliability | ISO 25010 | 07 (DB transaction), 14 (deploy) |
| Performance | ISO 25010 | 06 (kiến trúc), 13 (test perf) |
| Security | OWASP ASVS | 15 (bảo mật), 09 (RBAC) |
| Compatibility | ISO 25010 | 10 (responsive) |
| Maintainability | ISO 25010 | 11 (code convention), 13 (coverage) |
