# 15 — Thiết Kế Bảo Mật

> Nguồn gốc: Report 3 §4.2.4 (Security NFR) + §5.1 BR + code thực tế (JWT, RBAC, middleware). Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Thiết kế bảo mật |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §4.2.4 + OWASP ASVS/Top 10 + NIST SP 800-63B |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; chính sách theo NFR Security + BR + code thực tế |

---

## 2. Mục đích và phạm vi

Thiết kế bảo mật bảo vệ dữ liệu nhân sự và chứng chỉ: xác thực, ủy quyền, dữ liệu, endpoint công khai, audit. Tuân thủ **OWASP ASVS/Top 10** và **NIST SP 800-63B** cho mật khẩu.

**Ngoài phạm vi:** ma trận quyền chi tiết (09), kiến trúc bảo mật tổng quan (06 §11).

---

## 3. Tài liệu tham chiếu

- Report 3 §4.2.4 — Security NFR, §5.1 — BR-09..12
- OWASP Top 10, OWASP ASVS, NIST SP 800-63B
- `09_Ma_Tran_Phan_Quyen_RBAC.md`
- `06_Kien_Truc_He_Thong.md` §11

---

## 4. Mục tiêu bảo mật (CIA)

| Mục tiêu | Diễn giải |
|----------|-----------|
| Confidentiality | Dữ liệu nhân sự chỉ lộ cho người có quyền (scope server-side) |
| Integrity | Không thay đổi trái phép; audit mọi hành động nhạy cảm |
| Availability | Rate limit endpoint công khai; LLM lỗi không chặn luồng chính |

---

## 5. Xác thực (Authentication)

| Hạng mục | Chính sách |
|----------|-----------|
| Mật khẩu | **Salted hash** — không lưu plaintext, không xuất hiện trong log/audit (NFR §4.2.4) |
| Độ dài tối thiểu | Theo system setting; reset yêu cầu khớp 2 lần |
| Khóa tài khoản | 5 lần sai → khóa 15 phút (MSG02); không tính lần đổi mật khẩu khi đã đăng nhập |
| Tạo tài khoản | Gửi **link kích hoạt**, không gửi mật khẩu — admin không biết mật khẩu người dùng |
| Token | Access ≤ 30 phút, refresh ≤ 7 ngày (NFR §4.2.4) |
| Refresh token | Lưu hash, rotation, revoke khi đổi mật khẩu/reset |

**Chống dò email:** login sai chỉ báo "cặp email/mật khẩu không đúng", không nói cái nào sai.

---

## 6. Ủy quyền (Authorization) — RBAC + Data Scope

| Tầng | Cơ chế |
|------|--------|
| Endpoint | `[HasPermission(PermissionConstants.X)]` trên mọi endpoint |
| Data scope | `ResourceScopeAuthorizationService`: `EnsureGlobalAccess` / `EnsureDepartmentAccess` / `EnsureOwnership` / `EnsureTrainerAccess` |
| Nguyên tắc | Scope áp **ở server**, không phải ẩn menu (BR-12) |

- `SYSTEM_ADMIN` luôn vượt qua `can()`.
- Department Manager chỉ tác động nhân viên phòng mình quản lý hiện tại (BR-12).
- Endpoint công khai: `/verify`, `/health` — không cần auth.

> Ma trận đầy đủ tại `09`.

---

## 7. Bảo vệ dữ liệu & input

| Mối đe dọa (OWASP) | Biện pháp |
|--------------------|-----------|
| SQL Injection | EF Core parameterized query, không nối chuỗi SQL |
| XSS | Không render HTML từ dữ liệu người dùng; React escape mặc định |
| CSRF | JWT Bearer (không dùng cookie session) |
| Broken Access Control | RBAC + data scope server-side |
| Path Traversal | Upload kiểm tra extension/size/content-type, lưu theo object key server-generated |
| Sensitive Data Exposure | Không lộ stack trace/SQL/đường dẫn file; log chi tiết server-side |

---

## 8. Upload & phục vụ file

- Kiểm tra **extension, size, content type** (NFR §4.2.4).
- Chỉ phục vụ file cho người **có quyền với record cha**.
- File lưu MinIO; DB chỉ lưu metadata (`file_objects`).
- Tên lưu theo `object_key` do server sinh — không dùng tên gốc làm đường dẫn.

---

## 9. Endpoint công khai (Certificate Verification)

| Quy tắc | Giá trị |
|---------|--------|
| Rate limit | 20 request/phút/requester (NFR §4.2.4, MSG13) |
| Không định danh | Không lộ internal id (BR-10) |
| Trả về tối thiểu | Holder name, competency/course, issue date, status (BR-10) |
| Audit | Ghi log kèm **hashed address** — để phát hiện lạm dụng, không để định danh |

---

## 10. Audit (ghi nhật ký)

Mọi hành động nhạy cảm ghi `AuditLogService.LogAsync(...)` (NFR §4.2.4, BR-05):

| Hành động |
|-----------|
| Đổi vai trò / quyền |
| Override điểm / competency |
| Cấp / revoke / gia hạn chứng chỉ |
| Đánh giá task |
| Kích hoạt requirement set |

- Log **chỉ-thêm** (không sửa/xóa).
- `before_value`/`after_value` JSONB; **không ghi mật khẩu**.

---

## 11. Quản lý secret & cấu hình

- Không hardcode secret; dùng env var / secret manager.
- JWT key, DB password, MinIO access key không vào repo (chỉ `.env.example`).
- Rotate khi nghi ngờ lộ.

---

## 12. Ma trận vết

| Hạng mục bảo mật | NFR/BR | File |
|------------------|--------|------|
| Mật khẩu & khóa tài khoản | §4.2.4, MSG02 | 10 |
| Token hết hạn | §4.2.4 | 08 |
| Public verify rate limit | §4.2.4, BR-10 | 04 |
| Upload file | §4.2.4 | 14 |
| Data scope | BR-12 | 09 |
| Audit | BR-05, §4.2.4 | 07 |
| Not Graded → bỏ khỏi tính | BR-09 | 16 |
