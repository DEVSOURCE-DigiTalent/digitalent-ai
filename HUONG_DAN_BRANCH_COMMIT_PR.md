# HƯỚNG DẪN TẠO BRANCH, COMMIT VÀ MỞ PULL REQUEST (PR)
## Dự án: DigiTalent AI Platform — Chuẩn hóa Git & Đồng bộ Jira Cloud

> **Tài liệu dành cho toàn bộ 5 thành viên nhóm phát triển.**  
> Mục đích: Đảm bảo toàn bộ mã nguồn, nhánh, lịch sử commit và Pull Request được đồng bộ tự động 100% lên hệ thống theo dõi **Jira Software (Board DT)**.

---

## 1. Cấu hình Git cá nhân (Bắt buộc làm 1 lần trên máy)

Để hệ thống Jira và GitHub nhận diện chính xác người thực hiện task, mỗi thành viên **bắt buộc** phải cấu hình Git bằng **Họ tên đầy đủ** và **Email sinh viên FPT**:

```bash
git config --global user.name "Họ và Tên Của Bạn"
git config --global user.email "<ma_sinh_vien>@fpt.edu.vn"
```

### Bảng đối chiếu thông tin 5 thành viên:

| Thành viên | Họ và Tên | Email sinh viên FPT (Git & Jira) | Jira Account ID |
| :--- | :--- | :--- | :--- |
| **LinhTV** | Trần Văn Linh | `linhtvde180719@fpt.edu.vn` | `712020:668497a4...` |
| **HoangNT** | Nguyễn Thiện Hoàng | `hoangntde180649@fpt.edu.vn` | `712020:5425ebf5...` |
| **QuangNV** | Nguyễn Văn Quang | `quangnvde180682@fpt.edu.vn` | `712020:488f9202...` |
| **VietTN** | Trần Ngọc Việt | `viettnde180693@fpt.edu.vn` | `712020:8e64ea0c...` |
| **QuyTD** | Trần Đình Quý | `quytdde180286@fpt.edu.vn` | `712020:053d67e4...` |

---

## 2. Quy tắc đặt tên Branch (Branch Naming)

### Quy tắc cốt lõi:
- **1 PBI Story lớn = 1 Feature Branch.**
- Nhánh luôn được tách ra từ nhánh **`develop`** mới nhất.
- Tên nhánh **phải chứa mã Story trên Jira** (`DT-XXX`) để Jira tự động nhận diện và gắn vào bảng *Development*.

### Cú pháp:
```
feature/DT-<StoryID>-<ten-tinh-nang-viet-tat>
fix/DT-<StoryID>-<mo-ta-loi>
chore/DT-<StoryID>-<mo-ta-cau-hinh>
```

### Ví dụ chuẩn:
- ✅ `feature/DT-189-learning-exam-contracts`
- ✅ `feature/DT-193-exam-engine-crud`
- ✅ `feature/DT-201-skill-gap-radar-chart`
- ✅ `fix/DT-215-fix-token-refresh-expiry`

> ❌ **Tuyệt đối KHÔNG đặt:** `test`, `my-branch`, `linh-code`, `feature-1`, `update-fe`.

---

## 3. Quy ước viết Commit Message (Conventional Commits + Jira Key)

Khi bạn thực hiện một Sub-task (hoặc phần việc trong Story), bạn phải gắn **Mã Sub-task `[DT-XXX]`** ở đầu commit message để Jira tự động liên kết commit đó vào trang chi tiết của Sub-task!

### Cú pháp chuẩn:
```
[DT-<SubtaskID>] <type>(<scope>): <mô tả ngắn gọn bằng tiếng Anh/Việt>

- Chi tiết các file hoặc thay đổi chính
- Ghi chú thêm nếu có
Refs: DT-<StoryID>, DT-<SubtaskID>
```

### Các loại `type` quy định:
| Type | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `feat` | Thêm tính năng mới (BE/FE/API) | `[DT-190] feat(exam): [BE] Implement question bank CRUD API` |
| `fix` | Sửa lỗi, khắc phục bug | `[DT-194] fix(auth): [BE] Handle expired refresh token gracefully` |
| `docs` | Viết tài liệu, báo cáo, SRS, API docs | `[DT-182] docs: Update Report 3 - Org & Competency specs` |
| `test` | Viết unit test, integration test | `[DT-173] test(unit): Add unit test suite for Auth & RBAC filters` |
| `refactor`| Tối ưu cấu trúc code (không đổi logic) | `[DT-198] refactor(service): Split assessment calculation helper` |
| `chore` | Việc cấu hình, setup thư viện, Docker | `[DT-122] chore(ci): Setup GitHub Actions CI build workflow` |
| `style` | Căn chỉnh UI, format CSS, linting | `[DT-178] style(fe): Fix dashboard card padding & dark mode text` |

---

## 4. Quy trình làm việc hàng ngày (Step-by-step Daily Workflow)

### 🔹 Bước 1: Luôn cập nhật `develop` mới nhất từ GitHub
Trước khi bắt đầu code tính năng mới, luôn đồng bộ nhánh `develop`:
```bash
git checkout develop
git pull origin develop
```

### 🔹 Bước 2: Tạo nhánh tính năng cho Story bạn làm
```bash
git checkout -b feature/DT-189-learning-exam-contracts
```

### 🔹 Bước 3: Code và kiểm tra chạy thử tại máy local
- Kiểm tra Backend:
  ```bash
  cd backend && dotnet build
  ```
- Kiểm tra Frontend:
  ```bash
  cd frontend && npm run build
  ```
*(Đảm bảo code không có lỗi cú pháp, compile xanh trước khi commit).*

### 🔹 Bước 4: Thực hiện Commit với mã Sub-task của bạn
```bash
git add .
git commit -m "[DT-190] feat(exam): [BE] Implement question bank CRUD API

- Add Question and Answer entities
- Add QuestionService with paged querying
Refs: DT-189, DT-190"
```

### 🔹 Bước 5: Đồng bộ lại trước khi đẩy lên GitHub (Tránh Conflict)
Trước khi push, kiểm tra xem bạn bè có merge code mới vào `develop` không:
```bash
git fetch origin
git merge origin/develop
```
*(Nếu có conflict thì xử lý giải quyết conflict, sau đó `git commit`).*

### 🔹 Bước 6: Đẩy nhánh lên GitHub
```bash
git push -u origin feature/DT-189-learning-exam-contracts
```

---

## 5. Hướng dẫn mở Pull Request (PR) chuẩn trên GitHub

Sau khi push nhánh lên GitHub:

1. Truy cập vào GitHub repo: [DEVSOURCE-DigiTalent/digitalent-ai](https://github.com/DEVSOURCE-DigiTalent/digitalent-ai).
2. Bạn sẽ thấy thanh thông báo vàng xuất hiện: bấm nút **Compare & pull request**.
3. **Cực kỳ quan trọng về nhánh đích:**
   - **Base branch (Nhánh đích):** Chọn **`develop`** (KHÔNG CHỌN `main`).
   - **Compare branch (Nhánh nguồn):** Nhánh `feature/DT-...` của bạn.
4. **Tiêu đề PR (PR Title):** Ghi rõ mã Story:
   ```
   [DT-189] Sprint 3 Planning - Learning, Exam & Gap Engine Contracts
   ```
5. **Nội dung PR (PR Description):** Sao chép mẫu template dưới đây vào phần mô tả PR:

```markdown
### 📌 Tóm tắt thay đổi (Summary of Changes)
- Triển khai tính năng theo Story [DT-189]
- Xây dựng API và giao diện quản lý ngân hàng câu hỏi và kỳ thi

### 📋 Danh sách Sub-tasks hoàn thành:
- **[DT-190]** [BE] Implement question bank CRUD API — *(Assignee: @hoangntde180649)*
- **[DT-191]** [FE] Build question creation dialog and validation form — *(Assignee: @quangnvde180682)*

### 🧪 Bằng chứng kiểm thử & DoD (Acceptance Criteria):
- [x] Code đã build pass ở máy local (`dotnet build`, `npm run build`)
- [x] Đã test chạy thử trên Swagger / UI Browser đạt yêu cầu
- [x] Không hardcode secret, mật khẩu hay token vào code
- [x] Mã nguồn tuân thủ Clean Architecture và quy ước linting

Closes DT-189, DT-190, DT-191
```

*(Lưu ý: Dòng `Closes DT-...` ở cuối giúp Jira tự động chuyển trạng thái task và liên kết PR vào Jira issue).*

---

## 6. Quy trình Review và Merge PR

1. **Gán Reviewer:** Tại cột bên phải của PR trên GitHub, gán ít nhất **1 thành viên khác** (hoặc Team Leader LinhTV) vào mục **Reviewers**.
2. **Review Code:**
   - Người được gán review kiểm tra code thay đổi ở tab *Files changed*.
   - Nếu đạt yêu cầu, bấm nút **Review changes** -> Chọn **Approve** -> Bấm **Submit review**.
3. **Merge PR:**
   - Sau khi PR có ít nhất 1 Approve và GitHub Actions CI xanh:
   - Bấm nút **Merge pull request** -> Chọn **Confirm merge**.
   - Bấm nút **Delete branch** trên GitHub để dọn dẹp các nhánh đã hoàn thành.
4. **Kiểm tra trên Jira:**
   - Mở issue `DT-XXX` trên Jira Software, kiểm tra cột **Development** bên phải: bạn sẽ thấy ngay mục PR hiển thị trạng thái tím `MERGED` kèm theo danh sách commit!

---

## 7. Bảng tra cứu các lệnh Git xử lý sự cố thường gặp

| Tình huống | Lệnh xử lý |
| :--- | :--- |
| **Muốn xem trạng thái file thay đổi** | `git status -s` |
| **Muốn xem lịch sử commit gần nhất** | `git log -n 5 --oneline` |
| **Lỡ commit nhầm message, muốn sửa lại** | `git commit --amend -m "[DT-XXX] feat: message chuẩn"` |
| **Lỡ chỉnh sửa file nhưng muốn khôi phục lại** | `git restore <duong_dan_file>` |
| **Muốn lưu tạm code đang viết dở để chuyển nhánh** | `git stash` (khi quay lại dùng: `git stash pop`) |
| **Lỡ commit nhầm vào nhánh develop** | Chuyển commit sang nhánh mới: `git branch feature/DT-xxx` rồi `git reset --hard origin/develop` |

---

> 🎯 **Chúc cả nhóm phối hợp hiệu quả, code sạch đẹp và giữ vững tiến độ đồ án!**
