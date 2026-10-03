# 03B — SRS: Tài liệu Đặc Tả Yêu Cầu Phần Mềm (Phi Chức Năng)

> Nguồn gốc: Report 3 — *Software Requirement Specification* §4–§5. Phiên bản docs_v3, tiếng Việt.

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
| 3 | LLM API (tùy chọn) | Outbound | Nháp câu hỏi / ý tưởng task. Hệ thống chạy đủ nếu thiếu; mọi draft cần người duyệt | HTTPS REST |
| 4 | Browser client | Hai chiều | Toàn bộ tương tác người dùng, gồm notification realtime | HTTPS REST + WebSocket (SignalR) |

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

- **95%** API response ≤ **2 giây** với 50 user đồng thời.
- Dashboard load ≤ **3 giây** ở khối lượng seed ~200 nhân viên.
- Snapshot tính đêm cho toàn bộ nhân viên ≤ **5 phút**.
- List paginated trên server; không endpoint trả tập kết quả không giới hạn.

### 5.4 Security (Bảo mật)

- Mật khẩu chỉ lưu dạng salted hash, không xuất hiện trong log/audit.
- Access token hết hạn ≤ **30 phút**, refresh token ≤ **7 ngày**.
- Endpoint xác minh công khai giới hạn **20 yêu cầu/phút/requester**, không lộ định danh nội bộ.
- File upload kiểm tra extension, size, content type; chỉ phục vụ người có quyền với record cha.
- Mọi hành động nhạy cảm (BR list §9 file 03A) ghi audit log.

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

> **docs_v3:** Dùng **một thang 3 mức duy nhất** — Basic / Intermediate / Advanced (tham chiếu DigComp 3.0). Report 3 gốc đề cập một thang nghiên cứu 5 mức và một thang hiển thị 3 mức; theo chỉ đạo 16/09/2026, bộ tài liệu chuẩn hóa về **một thang 3 mức** cho cả lưu trữ lẫn hiển thị, loại bỏ trục Career Grade. Xem `00_INDEX` §3.1.3.

### 6.2 Ranh giới phạm vi

Loại trừ khỏi bản này (đã cân nhắc có chủ đích): native mobile app, payroll/attendance, learning marketplace thu phí, project-management board tổng quát, SSO corporate directory, và mọi mô hình ML train trên dữ liệu công ty. Scoring là **rule-based xuyên suốt** — mọi con số giải thích được cho người nó mô tả.

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
