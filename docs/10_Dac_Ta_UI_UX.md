# 10 — Đặc Tả UI/UX

> Nguồn gốc: Report 3 §3.1.2 (44 màn hình / 7 khu vực) + design system frontend. Phiên bản docs_v3, tiếng Việt.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Đặc tả thiết kế UI/UX |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 3 §3.1.2 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; 44 màn hình / 7 khu vực; design token theo shadcn/ui + Tailwind 4 |

---

## 2. Mục đích và phạm vi

Đặc tả trải nghiệm người dùng và cấu trúc 44 màn hình (nhóm 7 khu vực) cùng design token, nguyên tắc UI, trạng thái màn hình. Tài liệu để frontend triển khai đồng bộ và để UAT (file 13).

**Ngoài phạm vi:** ma trận phân quyền màn hình (09), chi tiết từng component code (11).

---

## 3. Tài liệu tham chiếu

- Report 3 §3.1.1–§3.1.2
- `09_Ma_Tran_Phan_Quyen_RBAC.md`
- shadcn/ui + TailwindCSS 4 (frontend)
- `00_INDEX` §3.4

---

## 4. Nguyên tắc UX (rút từ NFR Usability)

| Nguyên tắc | Yêu cầu |
|-----------|---------|
| First-time ease | HR giao khóa học cho 5 nhân viên trong 5 phút, không cần hướng dẫn viết |
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
| System Admin | Đỏ | User Account Management → RBAC → Settings → Audit |
| HR / Training Manager | Xanh dương | Capability Executive Dashboard → 6 khu vực quản trị |
| Department Manager | Xanh lá | Department Capability Dashboard → gap/task/evidence |
| Internal Trainer | Cam | Trainer Dashboard → course/question/assessment |
| Employee | Nâu | My Learning Dashboard → học/thi/task/chứng chỉ |
| Public | Tím | Certificate Verification (dưới ranh giới access control, không đăng nhập) |

---

## 6. Danh mục 44 màn hình / 7 khu vực

| # | Khu vực | Màn hình |
|---|---------|----------|
| 1 | Common & Auth | Login |
| 2 | Common & Auth | Forgot / Reset Password |
| 3 | Common & Auth | Profile & Security Settings |
| 4 | Common & Auth | Notification Center |
| 5 | Common & Auth | 403 Access Denied |
| 6 | Common & Auth | 404 Not Found |
| 7 | Administration | User Account Management |
| 8 | Administration | RBAC Permission Matrix |
| 9 | Administration | System Settings & Level Mapping |
| 10 | Administration | Audit Logs |
| 11 | HR Capability | Capability Executive Dashboard |
| 12 | Job Architecture | Job Families Catalogue |
| 13 | ~~Job Architecture~~ | ~~Career Grades Management~~ (đã gỡ — 3-level) |
| 14 | Job Architecture | Job Positions Management |
| 15 | Job Architecture | Position Requirement Editor |
| 16 | Organization | Departments Management |
| 17 | Organization | Employee Master Roster |
| 18 | Competency | Competency Framework Library |
| 19 | Competency | Competency Detail & Indicators |
| 20 | HR Learning | Course Assignment & Tracking |
| 21 | HR Analytics | Capability Analytics & Gap Heatmap |
| 22 | HR Certificate | Certificate Registry |
| 23 | HR Analytics | Employee Capability History |
| 24 | Manager | Department Capability Dashboard |
| 25 | Manager | Team Skill Gap Matrix |
| 26 | Manager | Practical Task Assignment |
| 27 | Manager | Submission Review & Evidence Approval |
| 28 | Manager | Team Evidence Portfolio |
| 29 | Manager | Practical Task Template Library |
| 30 | Trainer | Trainer Dashboard |
| 31 | Trainer | Course & Lesson Builder |
| 32 | Trainer | Question Bank Management |
| 33 | Trainer | Assessment Setup |
| 34 | Trainer | Learner Results & Grading Review |
| 35 | Employee | My Learning Dashboard |
| 36 | Employee | My Competency Profile & Gap |
| 37 | Employee | My Courses & Learning Path |
| 38 | Employee | Course Player |
| 39 | Employee | Assessment Interface |
| 40 | Employee | My Tasks & Evidence Submission |
| 41 | Employee | My Certificates |
| 42 | Public | Certificate Verification |
| 43 | Public | Invalid / Expired / Revoked State |
| 44 | Public | Rate Limit Notice |

> ⚠️ **Chuyển đổi 3-level:** màn hình 13 "Career Grades Management" bị gỡ. Tổng màn hình hiệu dụng docs_v3 = **43** (44 theo Report 3, trừ màn hình 13). Mô tả màn hình 25/36 bỏ "career grade".

---

## 7. Design tokens (Tailwind 4 + shadcn/ui)

| Token | Giá trị |
|-------|---------|
| Font chính | System font stack (Inter/`font-sans`), 14px base |
| Bán kính | `rounded-md`/`rounded-lg` (shadcn `--radius`) |
| Màu | shadcn theme tokens (`--background`, `--primary`, `--destructive`…), hỗ trợ dark mode |
| Khoảng cách | Spacing 4px grid (Tailwind `space-*`) |
| Breakpoint | Desktop ≥1280px, tablet 768px, mobile 375px |
| Trạng thái | `StatusBadge` cho VALID/EXPIRED/REVOKED, ACTIVE/ARCHIVED… |

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

- Mỗi dòng = một competency: required level (Basic/Intermediate/Advanced), weight, bắt buộc, cần evidence thực hành.
- Banner hiển thị version đang active.
- 9–14 competency mới được kích hoạt (MSG07). Kích hoạt bản mới → xác nhận archive bản cũ (MSG25).

### 9.3 My Competency Profile & Gap (Employee)

- Hiển thị vị trí hiện tại, mỗi competency: required level, current level, trạng thái (met / partial gap / gap) trên **thang 3 mức**.
- Dưới bảng: khóa học xếp hạng theo mức lấp gap, kèm lý do gợi ý.
- Mở rộng từng trạng thái → xem evidence nào xác nhận mức hiện tại, requirement version nào đặt mục tiêu.
- Chưa gán vị trí / chưa có active set → hiển thị ghi chú thay vì bảng trống.

### 9.4 Certificate Verification (Public)

- Nhập mã hoặc quét QR.
- Chỉ trả: holder name, competency/course, issue date, status — không định danh nội bộ (BR-10).
- >20 check/phút → Rate Limit Notice (MSG13).

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
| Trainer | UC-34..38 | 04 |
| Employee | UC-39..45 | 04 |
| Public | UC-46 | 15 |
