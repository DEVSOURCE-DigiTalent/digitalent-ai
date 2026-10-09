# 10 — Đặc Tả UI/UX

> Nguồn gốc: Report 3 v2.3 §3.1.2–3.1.3 (42 screens and authorization matrix).

> **Baseline 09/10/2026:** Repository copy is Report 3 v2.3, while the Master Overview cites v2.2. The v2.3 §3.1.2–3.1.3 42-screen inventory and authorization below are compatible details. The Master Overview controls conflicts: GRADE-01 remains pending; Owner correction only decreases/resets with reason/audit and no-self; late submissions remain reviewable. The v2.3 statements for 1–3 stored levels, grade-raising Owner override and late submissions not scored are not adopted.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Đặc tả thiết kế UI/UX |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 v2.3 §3.1.2–3.1.3 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 09/10/2026 | 3.1 | Thay inventory legacy bằng 42 screens và screen authorization theo Report 3 v2.3; giữ các quyết định mới hơn trong Master Overview |

---

## 2. Mục đích và phạm vi

Đặc tả trải nghiệm người dùng, screen authorization, design token, nguyên tắc UI và trạng thái màn hình theo baseline Enterprise MVP. Danh mục màn hình theo Report 3 v2.3.

**Ngoài phạm vi:** ma trận phân quyền màn hình (09), chi tiết từng component code (11).

---

## 3. Tài liệu tham chiếu

- Report 3 v2.3 §3.1.1–§3.1.3
- `09_Ma_Tran_Phan_Quyen_RBAC.md`
- shadcn/ui + TailwindCSS 4 (frontend)
- `00_INDEX` §3.4

---

## 4. Nguyên tắc UX (rút từ NFR Usability)

| Nguyên tắc | Yêu cầu |
|-----------|---------|
| First-time ease | OWNER có thể giao khóa học cập nhật/đào tạo lại cho nhóm nhân viên trong 5 phút; nhân viên tự bắt đầu từ Course Recommendation |
| Confirm destructive | Mọi revoke/archive/delete cần bước xác nhận nêu tên record |
| List đầy đủ | Search + sort + pagination (mặc định 20 dòng) |
| Ba trạng thái | Mọi màn hình có loading / empty / error state — không vùng trống |
| Click-through | Mọi con số dashboard dẫn về record gốc, không dead end |
| Thời gian tính | Mọi số liệu ghi rõ thời điểm tính (không lẫn số cũ) |

---

## 5. Cấu trúc điều hướng (Screen Flow)

Mô hình tương tác: **centralized auth gateway** → route theo vai trò → role-specific dashboard. Các vai trò được mã màu để phân biệt workspace:

| Vai trò | Màu | Điểm khởi đầu |
|---------|-----|----------------|
| PLATFORM_ADMIN | Đỏ | Platform administration, TT02/reference and standard content |
| OWNER | Xanh dương | Organization workspace: members, requirements, course recommendations/progress, directed assignments, certificates |
| MANAGER | Xanh lá | Assigned department workspace: team view and practical-task review |
| EMPLOYEE | Nâu | Personal learning, assessment and evidence workspace |

---

## 6. Danh mục 42 screens (Report 3 v2.3 §3.1.2)

| # | Khu vực | Màn hình |
|---|---------|----------|
| 1 | Common & Auth | Login |
| 2 | Common & Auth | Forgot / Reset Password |
| 3 | Common & Auth | Profile & Security Settings |
| 4 | Common & Auth | Notification Center |
| 5 | Common & Auth | 403 Access Denied |
| 6 | Common & Auth | 404 Not Found |
| 7 | TT02 Reference | TT02 Framework Explorer |
| 8 | TT02 Reference | TT02 Competency Detail |
| 9 | Platform Admin | Platform Dashboard |
| 10 | Platform Admin | Organizations & Users |
| 11 | Platform Admin | TT02 Framework Management |
| 12 | Standard Content | Standard Curriculum Builder |
| 13 | Standard Content | Question Bank Management |
| 14 | Standard Content | Assessment Setup |
| 15 | Platform Admin | Reference Positions |
| 16 | Platform Admin | Audit Logs |
| 17 | Platform Admin | System Settings |
| 18 | Owner | Owner Dashboard |
| 19 | Organization | Members & Invitations |
| 20 | Organization | Departments |
| 21 | Organization | Positions |
| 22 | Requirements | Position Requirement Editor |
| 23 | Competency | Skill Gap Analytics & Heatmap |
| 24 | Competency | Employee Competency History |
| 25 | Learning | Course Recommendations & Assignment / Training Monitor |
| 26 | Assessment | Assessment Results |
| 27 | Practical Task | Practical Task Template Library |
| 28 | Practical Task | Practical Task Assignment |
| 29 | Practical Task | Submission Review & Evidence Approval |
| 30 | Practical Task | Team Evidence Portfolio |
| 31 | Certificate | Certificate Registry |
| 32 | Manager | Team Dashboard |
| 33 | Manager | My Team |
| 34 | Manager | Team Skill Gap Matrix |
| 35 | Employee | My Learning Dashboard |
| 36 | Employee | My Competency Profile & Gap |
| 37 | Employee | My Courses & Learning Path |
| 38 | Employee | Course Player |
| 39 | Employee | Assessment Interface |
| 40 | Employee | My Tasks & Evidence Submission |
| 41 | Employee | My Certificates |
| 42 | Certificate | Certificate Verification |

No public section, Trainer screen, Career Grade screen or separate invalid/expired/rate-limit screen is in the 42-screen inventory. Verification is a signed-in Owner/Manager of the issuing organization. Screen access is limited by role and server-enforced data scope.

---

## 7. Design tokens (Tailwind 4 + shadcn/ui)

| Token | Giá trị |
|-------|---------|
| Font chính | System font stack (Inter/`font-sans`), 14px base |
| Bán kính | `rounded-md`/`rounded-lg` (shadcn `--radius`) |
| Màu | shadcn theme tokens (`--background`, `--primary`, `--destructive`…), hỗ trợ dark mode |
| Khoảng cách | Spacing 4px grid (Tailwind `space-*`) |
| Breakpoint | Desktop ≥1280px, tablet 768px, mobile 375px |
| Trạng thái | `StatusBadge` cho VALID/REVOKED, ACTIVE/ARCHIVED… |

---

## 8. Component dùng chung

| Component | Vai trò |
|-----------|---------|
| `PageHeader` | Tiêu đề + action chính |
| `DataTable` | List có search/sort/pagination |
| `StatusBadge` | Trạng thái có màu |
| `EmptyState` | Empty state có giải thích + hành động |
| `ErrorState` | Error state có retry |
| `LoadingState` | Skeleton/spinner |
| `ConfirmDialog` | Xác nhận hành động phá hủy, nêu tên record |
| `AuthGuard` / `RequirePermission` / `RequireRole` | Route guard |
| `Toast` (`sonner`) | Thông báo tức thời |

---

## 9. Mô tả màn hình then chốt

### 9.1 Login (Common & Auth)

- Nhập email + mật khẩu; không ghi nhớ giữa lần truy cập.
- Validate client trước (tốc độ) rồi server quyết định.
- Sai thông tin: chỉ báo "cặp email/mật khẩu không đúng", không nói cái nào sai (chống dò email).
- 5 lần sai → khóa 15 phút (MSG02). Khóa/inactive → từ chối, hướng dẫn liên hệ admin.

### 9.2 Position Requirement Editor (Job Architecture)

- Mỗi dòng = một competency, required training level theo TT02 và mandatory flag. Không có weight hoặc cờ extra-evidence-required trong baseline.
- Banner hiển thị version đang active.
- At least one requirement item is needed before activation; activating the new version archives the previous active version after confirmation.

### 9.3 My Competency Profile & Gap (Employee)

- Hiển thị vị trí hiện tại, competency requirement, confirmed competency và trạng thái Met / Partial Gap / Gap / Not Assessed. GRADE-01 vẫn pending; không chốt cách lưu/so sánh grade từ màn hình.
- Dưới bảng: Recommended Courses được xếp theo competency đang thiếu và mức course coverage; hiển thị lý do gợi ý rõ ràng. Recommendation không phải yêu cầu bắt buộc và không tạo due date.
- Nhân viên có thể mở và bắt đầu học từ recommendation. Course Assignment do OWNER giao phải có nhãn riêng, lý do/yêu cầu tổ chức và due date nếu có; không gộp hai trạng thái này thành một.
- Mở rộng từng trạng thái → xem evidence nào xác nhận mức hiện tại, requirement version nào đặt mục tiêu.
- Chưa gán vị trí / chưa có active set → hiển thị ghi chú thay vì bảng trống.

### 9.4 Certificate Verification (authenticated same-organization)

- OWNER/MANAGER đã đăng nhập cùng tổ chức phát hành mở QR/mã chứng chỉ.
- Chỉ hiển thị holder name, course/competency, issue date, status; không lộ evidence, assessment attempt hoặc internal employee ID.
- Không có public route hoặc Public Visitor role; trạng thái certificate là Valid/Revoked, không expiry.

### 9.5 Course Recommendations and OWNER-directed assignment (screens 25, 37)

- Employee sees system-generated recommendations tied to current Skill Gap. Each item explains the missing competency and how the course covers it; employee can start learning from the item.
- OWNER sees recommendation/progress monitoring and can separately assign a standard course for organizational updates or retraining, with due date and an explicit reason when applicable. OWNER monitors completion; MANAGER does not assign standard courses in this baseline.
- Label the two paths `Recommended` and `Assigned`; a recommendation alone is optional learning, while an assignment is an organizational requirement. Course assessment result and certificate are shown separately from Confirmed Competency.
- Reevaluation after an OWNER-directed update/retraining assignment is **PENDING DECISION**: final course assessment only, or assessment plus Practical Task. Do not show a mandatory Practical Task until this rule is decided.

### 9.6 Practical Task evidence review (screens 28–30, 40)

- Employee submits work evidence and sees submission/review status. Late submissions remain eligible for review under the current baseline.
- If AI-assisted evaluation is enabled under an approved scope, show it as a proposal: rubric version, criterion-level proposed result, numeric task score, rationale, linked evidence references, unmet criteria, and model/version when available. Keep AI proposal visually distinct from reviewer decision.
- OWNER/MANAGER reviewer checks the evidence and context and may approve, edit, reject, or request more evidence within the applicable scope. Show reviewer decision and edits/history separately.
- Explain that the numeric task score is not a competency grade. Only an approved reviewer decision can update Confirmed Competency; then show the updated competency profile and recalculated Skill Gap.
- The UI/API must respect organization and assigned-department scope. Do not expose evidence references or AI results to roles lacking access.

---

## 10. Trạng thái màn hình (bắt buộc)

| Trạng thái | Quy tắc |
|-----------|---------|
| Loading | Spinner/skeleton khi gọi API |
| Empty | Giải thích "chưa có gì" + hành động lấp danh sách (nếu có) |
| Error | Thông báo lỗi + retry |
| Long op | Indicator (vd nộp bài, kích hoạt version) |

---

## 11. Ma trận vết

| Màn hình (nhóm) | UC liên quan | File liên quan |
|-----------------|--------------|----------------|
| Common & Auth | UC-01..07 | 15 |
| Administration | UC-08..13 | 09 |
| HR Capability / Analytics | UC-23, 25, 26 | 16 |
| Job Architecture | UC-14, 16, 17 | 04 |
| Organization | UC-18, 19 | 04 |
| Competency | UC-20, 21, 22 | 04 |
| HR Learning / Certificate | UC-24, 27 | 04, 15 |
| Manager | UC-28..33 | 04 |
| Platform Admin | Platform administration / standard content use cases | Report 3 v2.3 §2.2, §3.11 |
| Owner / Manager | Organization, learning, certificate and evidence use cases | Report 3 v2.3 §3.3–3.10 |
| Employee | Personal learning, assessment and evidence use cases | Report 3 v2.3 §3.5–3.9 |
