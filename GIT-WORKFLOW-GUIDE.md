# DigiTalent AI — Git Workflow Guide

> Hướng dẫn nhanh cách tạo branch, commit, push và tạo Pull Request.
> Chi tiết: [docs/12_Git_Workflow_Branching_Strategy_DigiTalent_AI](docs/12_Git_Workflow_Branching_Strategy_DigiTalent_AI)

---

## 1. Quy tắc cơ bản

| Rule | Mô tả |
|------|-------|
| **Không push thẳng** vào `main` hoặc `develop` | Luôn tạo Pull Request |
| **Branch phải có issue/task ID** | Giúp trace được công việc |
| **Commit nhỏ, có ý nghĩa** | Mỗi commit là một thay đổi logic hoàn chỉnh |
| **Luôn pull develop mới nhất** trước khi tạo branch | Tránh conflict không đáng có |
| **Chạy build/test local** trước khi mở PR | CI sẽ kiểm tra, nhưng chạy trước cho chắc |

---

## 2. Branch naming

| Loại | Pattern | Ví dụ |
|------|---------|-------|
| **Feature mới** | `feature/DT-<issue>-<short-name>` | `feature/DT-101-auth-login-api` |
| **Sửa lỗi** | `fix/DT-<issue>-<short-name>` | `fix/DT-142-certificate-qr-expired` |
| **Tài liệu** | `docs/DT-<issue>-<short-name>` | `docs/DT-050-update-api-spec` |
| **Refactor** | `refactor/DT-<issue>-<short-name>` | `refactor/DT-211-split-assessment-service` |
| **Test** | `test/DT-<issue>-<short-name>` | `test/DT-305-add-rbac-api-tests` |
| **DevOps/CI** | `chore/DT-<issue>-<short-name>` | `chore/DT-401-add-docker-compose` |
| **Release** | `release/v<major>.<minor>.<patch>` | `release/v1.0.0` |
| **Hotfix** | `hotfix/v<version>-<short-name>` | `hotfix/v1.0.1-refresh-token` |

> ⚠️ **Không dùng:** `linh-code`, `final-update`, `test2`, `new-branch`, `demo-fix`

---

## 3. Commit message (Conventional Commits)

```
<type>(<scope>): <short summary>
```

| Type | Khi nào dùng | Ví dụ |
|------|--------------|-------|
| `feat` | Tính năng mới | `feat(auth): implement login with refresh token` |
| `fix` | Sửa lỗi | `fix(certificate): reject revoked certificate in verifier API` |
| `docs` | Tài liệu | `docs(api): update assessment submit endpoint` |
| `style` | Format code (ko đổi logic) | `style(ui): align dashboard card spacing` |
| `refactor` | Tái cấu trúc code | `refactor(task): split task evaluation service` |
| `test` | Thêm/sửa test | `test(rbac): add manager department scope tests` |
| `chore` | Build, config, CI, dependencies | `chore(ci): add backend test workflow` |
| `perf` | Tối ưu hiệu năng | `perf(dashboard): optimize readiness query` |
| `security` | Thay đổi bảo mật | `security(auth): rotate refresh token on reuse detection` |

> ❌ **Không dùng:** `update code`, `fix bug`, `final version`, `linh changes`, `working now`

---

## 4. Quy trình làm việc hàng ngày

### Bước 1: Cập nhật develop mới nhất

```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo feature branch

```bash
git checkout -b feature/DT-101-auth-login-api
```

### Bước 3: Code và commit

```bash
git add backend/src/DigiTalent.Auth/
git commit -m "feat(auth): implement login API"

git add frontend/src/pages/Login.tsx
git commit -m "feat(auth): add login page UI"
```

### Bước 4: Push lên GitHub

```bash
git push -u origin feature/DT-101-auth-login-api
```

> **Mỗi ngày push ít nhất 1 lần** để tránh mất code.

---

## 5. Giữ branch luôn cập nhật với develop

```bash
# Cách an toàn (dùng merge):
git fetch origin
git merge origin/develop
# Nếu conflict → resolve, git add, git commit, git push

# Cách sạch history (dùng rebase):
git fetch origin
git rebase origin/develop
# Nếu conflict → resolve, git add, git rebase --continue
git push --force-with-lease
```

> ⚠️ **`--force-with-lease`** chỉ dùng trên feature branch của bạn.

---

## 6. Tạo Pull Request

### Qua GitHub CLI

```bash
gh pr create \
  --base develop \
  --title "[Auth] Implement JWT login and refresh token" \
  --body "Closes #101

## Summary
- Implement login API with JWT + refresh token
- Add login page UI with form validation

## Test Evidence
- [x] Local build passed
- [x] Manual test completed

## Risk Notes
- RBAC/security impact: Requires role check after login"
```

### Qua GitHub Web

1. Push branch → lên GitHub thấy banner → Click **Compare & pull request**
2. Chọn **base: develop** ← **compare: feature/DT-xxx**
3. Điền PR template (summary, issue link, test evidence)
4. Assign reviewer → **Create pull request**

### Checklist trước khi mở PR

- [ ] Pull develop mới nhất và merge vào branch
- [ ] Build/test local OK (`dotnet build`, `npm run build`)
- [ ] Không có secret/credentials trong code
- [ ] Link đúng issue (`Closes #issue-number`)

---

## 7. Review & Merge

1. **Reviewer** comment với tag:
   - `[blocking]` — Phải sửa trước khi merge
   - `[question]` — Cần giải thích thêm
   - `[suggestion]` — Gợi ý cải thiện
   - `[nit]` — Ý kiến nhỏ
2. **Developer** sửa theo review, push thêm commit
3. Được **approve** + CI **pass** → bấm **Squash merge**
4. **Xoá branch** sau merge

---

## 8. Các lệnh thường gặp

| Tình huống | Lệnh |
|------------|------|
| Lỡ commit nhầm vào develop | `git branch feature/DT-xxx-correct` + `git reset --hard HEAD~1` |
| Tạm dừng code giữa chừng | `git stash push -m "WIP message"` + sau đó `git stash pop` |
| Merge xong phát hiện lỗi | `git revert <commit-hash>` (trên develop, ko dùng reset) |
| Sửa commit message cuối | `git commit --amend -m "feat(auth): new message"` |
| Bỏ file đã stage | `git restore --staged <file>` |
| Bỏ thay đổi local chưa stage | `git restore <file>` |

---

## 9. Tóm tắt nhanh

```bash
# 1. Mỗi ngày bắt đầu
git checkout develop && git pull origin develop

# 2. Tạo branch mới
git checkout -b feature/DT-101-auth-login-api

# 3. Code → Commit
git add <files> && git commit -m "feat(auth): message"

# 4. Push
git push -u origin feature/DT-101-auth-login-api

# 5. Mở PR
gh pr create --base develop --title "[Module] Title" --body "Closes #101"
```

---

> 📖 **Chi tiết:** [docs/12_Git_Workflow_Branching_Strategy_DigiTalent_AI](docs/12_Git_Workflow_Branching_Strategy_DigiTalent_AI)
