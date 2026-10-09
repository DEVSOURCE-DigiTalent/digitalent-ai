# 15 — Thiết Kế Bảo Mật

> Nguồn gốc: Report 3 v2.2 §4.2.4/§5.1 và Master System Overview 09/10/2026 §4, §7. Chưa xác nhận hiện trạng triển khai trong code.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Thiết kế bảo mật |
| Phiên bản | 3.2 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 v2.2 §4.2.4/§5.1; Master System Overview §4, §7 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; chính sách theo NFR Security + BR + code thực tế |
| 09/10/2026 | 3.1 | Bỏ public verification; cập nhật 4 role, same-org QR, correction audit và data scope |
| 09/10/2026 | 3.2 | Thêm quyền truy cập evidence cho AI evaluator, prompt/data boundary và audit proposal/reviewer decisions |

---

## 2. Mục đích và phạm vi

Thiết kế bảo mật bảo vệ dữ liệu nhân sự, evidence và chứng chỉ: xác thực, ủy quyền, tenant/data scope, file access và audit. Certificate QR verification là luồng nội bộ cần đăng nhập; MVP không có public verification page/registry. Các chuẩn tham chiếu cần được đối chiếu với NFR Report 3 khi triển khai.

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
| Availability | Lỗi dịch vụ phụ trợ không được báo thành công giả; bảo đảm luồng lõi có xử lý lỗi phù hợp |

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

| Role | Phạm vi |
|------|--------|
| PLATFORM_ADMIN | Quản trị platform/reference; không mặc định truy cập private evidence/submission của tổ chức |
| OWNER | Dữ liệu trong tổ chức; quản trị member/position/requirement, theo dõi recommendation, giao course riêng khi cần, certificate/revoke, và correction giảm/reset có kiểm soát |
| MANAGER | Chỉ thành viên/phòng ban được phân công; review task trong scope; không revoke hoặc override grade |
| EMPLOYEE | Dữ liệu của chính mình; không dùng chức năng verification dành cho OWNER/MANAGER |

- Mọi role và resource đều phải được kiểm tra ở backend; ẩn menu frontend không phải authorization.
- MANAGER scope dựa trên phân công phòng ban; giữ thông tin lịch sử phân công phù hợp cho audit.
- QR verification yêu cầu người xác minh là OWNER hoặc MANAGER đã đăng nhập và thuộc đúng tổ chức phát hành. Không có public `/verify` hay Public Visitor role.
- Verification chỉ trả holder name, course/competency, issue date và status; không tiết lộ evidence, assessment attempt hoặc internal employee ID.
- No-self verification: người có chứng chỉ không được tự xác minh chứng chỉ của chính mình qua quyền OWNER/MANAGER.
- Recommendation được hệ thống tạo từ Skill Gap/course competency mapping; Employee được truy cập recommendation của mình. OWNER course assignment là thao tác riêng và phải kiểm tra quyền tại backend.
- Với AI-assisted Practical Task evaluation (đề xuất scope expansion, cần cập nhật Report 1/2; implementation chưa xác minh), chỉ gửi evidence mà requester có quyền đọc theo task/organization/department scope. AI không được dùng quyền dịch vụ rộng hơn người yêu cầu.

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
| Evidence prompt injection / unsafe AI input | Xem evidence là dữ liệu không tin cậy, không phải instruction; tách system/developer instruction khỏi evidence, không cho tool/action execution từ nội dung file, giới hạn loại dữ liệu và kích thước trước khi gửi evaluator |
| AI data boundary | Chỉ truy xuất theo quyền đã kiểm tra; truyền tối thiểu evidence cần cho rubric; dùng nhà cung cấp/model đã được tổ chức chấp thuận nếu xử lý bên ngoài; không dùng evidence để train model nếu chưa có căn cứ/consent phù hợp |
| AI output tampering / overreach | Parse output theo schema, gắn với submission và rubric version; AI chỉ tạo proposal, không gọi competency update hoặc tự phê duyệt |

---

## 8. Upload & phục vụ file

- Kiểm tra **extension, size, content type** (NFR §4.2.4).
- Chỉ phục vụ file cho người **có quyền với record cha**.
- File lưu MinIO; DB chỉ lưu metadata (`file_objects`).
- Tên lưu theo `object_key` do server sinh — không dùng tên gốc làm đường dẫn.
- Trước khi AI evaluator đọc file, backend phải xác thực lại quyền trên submission, kiểm tra loại file/nội dung có thể phân tích, và cấp đường dẫn truy cập giới hạn thời gian nếu cần. Không gửi nội dung private evidence qua log hoặc telemetry.
- Nội dung file, URL và mô tả quy trình do người dùng nộp đều là dữ liệu không tin cậy. Không làm theo prompt/instruction nhúng trong đó; nếu evaluator không truy cập được hoặc bằng chứng không đủ, trả trạng thái không thể đánh giá/thiếu evidence để reviewer xử lý.

### 8.1 AI-assisted Practical Task evaluation (đề xuất scope expansion)

AI có thể đối chiếu evidence đã được cấp quyền với rubric version và trả proposal theo từng criterion: điểm đề xuất, lý do, căn cứ cụ thể và thông tin còn thiếu. Đây là mở rộng scope cần được phản ánh trong Report 1/2 trước khi cam kết triển khai; hiện trạng implementation chưa được xác minh.

- Reviewer OWNER/MANAGER đúng scope là người quyết định cuối: có thể sửa proposal, duyệt, từ chối hoặc yêu cầu evidence bổ sung.
- Điểm số task không phải Confirmed Competency level. AI output, kể cả điểm cao, không tự tạo evidence/competency và không được gọi luồng cập nhật competency.
- Lưu rubric version, AI result, model/version nếu provider cung cấp, trạng thái đánh giá, reviewer decision và mọi lần chỉnh sửa; log chỉ metadata cần thiết, không log raw evidence, token hay prompt nhạy cảm.
- Test authorization, private/untrusted evidence, prompt/data boundary, evidence thiếu/mâu thuẫn, reviewer override, audit/history và cấm self-finalization.

---

## 9. QR verification nội bộ (Certificate Verification)

| Quy tắc | Giá trị |
|---------|--------|
| Authentication | OWNER hoặc MANAGER đăng nhập |
| Authorization | Cùng organization phát hành; MANAGER phải nằm trong scope được phân công |
| No-self | Không cho người sở hữu chứng chỉ tự xác minh chứng chỉ của mình |
| Trả về tối thiểu | Holder name, course/competency, issue date, Valid/Revoked |
| Privacy | Không trả evidence, attempt, internal employee ID hoặc dữ liệu ngoài mục đích xác minh |
| Public access | Không có public page/registry hoặc Public Visitor role trong Enterprise MVP |

---

## 10. Audit (ghi nhật ký)

Mọi hành động nhạy cảm ghi `AuditLogService.LogAsync(...)` (NFR §4.2.4, BR-05):

| Hành động |
|-----------|
| Đổi vai trò / quyền |
| Owner correction giảm/reset competency (reason bắt buộc; không self-correction) |
| Cấp / revoke chứng chỉ (không có expiry/renewal trong MVP) |
| Đánh giá task theo từng competency |
| AI evaluation proposal requested/failed (metadata only), reviewer decision/change, request for more evidence |
| Kích hoạt requirement set |

- Log **chỉ-thêm** (không sửa/xóa).
- Correction lưu actor, thời gian, lý do và before/after; reset nghĩa là chưa xác nhận, không phải grade 0.
- `before_value`/`after_value` JSONB; **không ghi mật khẩu**.
- Lưu vết AI proposal và human decision theo submission, rubric version và timestamp; giữ lịch sử reviewer edits, không ghi đè proposal gốc. Không lưu raw file content hoặc prompt hoàn chỉnh trong audit log.

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
| Authenticated same-org QR verification | CERT-01 / BR-VER-01 context | 09 / 13 |
| Upload file | §4.2.4 | 14 |
| AI evaluator access, input boundary, private evidence and human approval | Scope expansion; Report 1/2 update required | 13 / 16 |
| Data scope | BR-12 | 09 |
| Audit | BR-05, §4.2.4 | 07 |
| Owner correction audit/no-self | BR-FIX-01 | 09 / 13 |
