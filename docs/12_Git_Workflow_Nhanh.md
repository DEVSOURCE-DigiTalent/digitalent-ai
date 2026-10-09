# 12 — Git Workflow & Quy Trình Nhánh

> Nguồn gốc: Report 2 v2.5 §6, repository Git conventions và Master System Overview 09/10/2026. Hướng dẫn quy trình; không xác nhận trạng thái branch protection, CI hay release.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Git workflow & quy trình nhánh |
| Phiên bản | 3.1 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Report 2 v2.5 §6; repository Git conventions; Master System Overview §0, §10, §14 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Chuyển ngữ; nhánh/conventional commits/PR theo repo thực tế |
| 09/10/2026 | 3.1 | Làm rõ hướng dẫn không đồng nghĩa CI/branch protection đã được xác minh |

---

## 2. Mục đích và phạm vi

Quy trình làm việc với Git: mô hình nhánh, chu kỳ làm việc hằng ngày, quy ước commit, quy trình Pull Request. Áp dụng cho toàn team.

**Ngoài phạm vi:** quy ước code (11), CI/CD pipeline (14).

---

## 3. Tài liệu tham chiếu

- Report 2 §6 — Configuration & Process Management
- `CLAUDE.md` — Git Conventions
- `11_Quy_Uoc_Code_Dev.md`

---

## 4. Mô hình nhánh

| Nhánh | Mục đích |
|-------|----------|
| `main` | Nhánh chuẩn/release theo quy ước repo; không suy ra đã deploy hoặc luôn deployable |
| `develop` | Nhánh tích hợp nếu repository/team hiện đang dùng |
| `feature/*` | Tính năng mới |
| `fix/*` | Sửa lỗi |
| `release/*` | Chuẩn bị phát hành |
| `hotfix/*` | Sửa gấp trên production |

Tên nhánh feature: `feature/DT-XXX-kebab-description` (vd `feature/DT-014-position-requirement-editor`).

---

## 5. Chu kỳ làm việc hằng ngày

```bash
# 1. Đầu ngày — đồng bộ
git checkout main
git pull

# 2. Tách nhánh cho mỗi task
git checkout -b feature/DT-014-position-requirement-editor

# 3. Làm việc + commit thường xuyên (nhỏ, gọn)
git add <files>
git commit -m "feat(competency): add position requirement editor"

# 4. Đẩy nhánh lên remote
git push -u origin feature/DT-014-position-requirement-editor

# 5. Mở Pull Request vào main
```

**Quy tắc:** một nhánh = một task; không commit trực tiếp lên `main`/`develop`; không nhét nhiều task vào một nhánh.

---

## 6. Quy ước commit (Conventional Commits)

```
<type>(<scope>): <mô tả ngắn gọn>

<thân tùy chọn>
```

| Type | Dùng khi |
|------|----------|
| `feat` | Tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Tái cấu trúc, không đổi hành vi |
| `docs` | Tài liệu |
| `test` | Test |
| `chore` | Việc vặt (config, dependency) |
| `perf` | Hiệu năng |
| `ci` | CI/CD |

**Ví dụ:**
- `feat(certificate): issue certificate on final assessment pass`
- `fix(auth): lock account after 5 failed logins`
- `docs: add API specification v3`
- `chore(infra): pin postgres 16 image version`

---

## 7. Quy trình Pull Request

| Bước | Nội dung |
|------|----------|
| 1 | Commit đầy đủ, push nhánh `-u origin feature/...` |
| 2 | Mở PR vào `main` (default target) |
| 3 | Điền mô tả: mục đích, thay đổi, test plan, TODO |
| 4 | Chạy các CI checks hiện có trong repository; chỉ ghi pass khi có kết quả của commit/PR đó |
| 5 | Resolve conflict nếu có |
| 6 | Ít nhất 1 reviewer approve |
| 7 | Merge (squash/rebase tùy quy ước team) |

**Mô tả PR chuẩn (Report 2 §6):**
- **Mục đích:** giải quyết vấn đề gì, UC/BR liên quan
- **Thay đổi:** file/endpoint/DB chính
- **Test plan:** đã chạy gì, kết quả
- **TODO:** việc còn lại trước khi merge

---

## 8. Quy tắc nhánh single-owner (phối hợp trước khi sửa)

Các file quan trọng do team lead sở hữu — phải phối hợp trước khi thay đổi:

| File | Lý do |
|------|-------|
| `Api/Program.cs` | Điểm khởi tạo, DI |
| `AppDbContext.cs` / `IApplicationDbContext.cs` | DbSet trung tâm |
| `AppDbContextSeed.cs` | Dữ liệu gốc |
| `PermissionConstants.cs` | 119 permission key, đóng băng trừ khi RBAC đổi |

> Tránh xung đột: khi cần sửa file trên, thông báo team + tách nhánh nhỏ + merge sớm.

---

## 9. Xử lý conflict

1. `git pull origin main` (hoặc rebase) trước khi push.
2. Resolve từng conflict, giữ ý nghĩa cả hai phía.
3. Build lại (`dotnet build` / `tsc --noEmit`) sau khi resolve.
4. Push lại, cập nhật PR.

---

## 10. Quy tắc an toàn

- Không push file nhạy cảm: `.env`, secret, chứng chỉ, credential — chỉ `.env.example`.
- Không commit artifact: `node_modules/`, `bin/`, `obj/`, `output/`, `scratch/` (đã `.gitignore`).
- Không `git push --force` lên nhánh chung.
- Không sửa migration đã push.

---

## 11. Ma trận vết

| Hạng mục | Liên quan | File |
|----------|-----------|------|
| Conventional commits | Quy ước code | 11 |
| CI checks khi được cấu hình | DevOps | 14 |
| File single-owner | Kiến trúc | 06 |
| Quy trình sprint | Report 2 | — |
