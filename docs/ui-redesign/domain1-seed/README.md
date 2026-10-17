# Lĩnh vực I · học liệu cho schema hiện tại

Gói `domain1.v1.json` được xuất từ học liệu đã biên soạn trong bản duyệt `14-pulse-product-site`. `manifest.json` giữ SHA-256 để phát hiện thay đổi nguồn. `build-current-sql.cjs` chuyển phần **dùng được ngay với BE hiện tại** thành bản Learning course v2. Không lưu thông tin kết nối DB trong thư mục này.

## Đã nhập vào PostgreSQL ngày 15/10/2026

- Giữ nguyên `M1-F/I/A` v1, tạo thêm `M1-F/I/A` v2, `supersedes_course_id` trỏ v1. Mã Platform vẫn là `A1-F/I/A`; script không tạo khóa A1 trong tổ chức.
- Mỗi khóa v2 có 3 mô đun nội dung, 3 chuẩn đầu ra, 11 lesson/mô đun, quiz 5 câu gắn `module_id`/mô đun, một final assessment và 6 `practical_task_templates` theo `general`, `accounting`, `marketing`, `hr`, `sales`, `ceo`.
- Tổng cộng 3 khóa, 9 mô đun, 9 chuẩn đầu ra, 99 lesson, 9 quiz, 45 câu, 135 lựa chọn, 3 final assessment, 18 đề thực hành. Trường `content_body` chứa nội dung, hình minh họa mô tả bằng chữ, câu hỏi tự kiểm tra và nguồn tham khảo. Không chứa base64 hay đường dẫn ảnh nội bộ.
- 6 enrollment v1 được giữ nguyên: M1-A có 2 `IN_PROGRESS` và 3 `NOT_STARTED`; M1-I có 1 `COMPLETED`. Không chuyển lượt học sang v2 tự động.
- Dry-run toàn bộ trong transaction `ROLLBACK` thành công. Sau khi `COMMIT`, chạy lại dry-run tạo 0 bản ghi mới; truy vấn độc lập xác nhận số lượng, đáp án, năng lực gắn khóa và trạng thái enrollment. Chín chuẩn đầu ra được bổ sung bằng cùng importer sau lượt kiểm thử thứ hai.

## Tổ chức mới dùng mã A1 · 16/10/2026

Tổ chức mới trong database dùng `A1-F/I/A`, nên không áp dụng trực tiếp SQL `M1-*` của bản demo. Nhánh này bổ sung `backend/tools/Domain1SeedRunner`: công cụ dùng chính `SkillGapSeeder` hiện tại để tạo khung 6 lĩnh vực và 19 khóa v1 cho một tổ chức, sau đó importer ánh xạ học liệu M1 sang mã A1 và tạo v2. Cả hai bước đều có chế độ `--dry-run` rollback; không lưu mật khẩu trong repo.

Đã kiểm tra và áp dụng cho tổ chức mới hiện có: 3 khóa A1 v2, 9 mô đun, 99 trang, 9 quiz, 3 bài cuối khóa, 18 đề theo vị trí. Mỗi A1 v2 giữ liên kết `supersedes_course_id` về v1; không chuyển enrollment cũ. Danh mục Owner chỉ hiển thị bản published mới nhất theo mã; nhân viên đang học v1 tiếp tục thấy đúng bản v1.

```powershell
# DIGITALENT_DB_CONNECTION được cấp từ secret manager hoặc môi trường triển khai.
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --dry-run <organization-id>
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --apply <organization-id>
node docs/ui-redesign/domain1-seed/build-current-sql.cjs --dry-run --organization <organization-id> --prefix A1
node docs/ui-redesign/domain1-seed/build-current-sql.cjs --apply --organization <organization-id> --prefix A1
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --import-sql docs/ui-redesign/domain1-seed/domain1-a1-<organization-id>-v2.dry-run.sql
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --import-sql docs/ui-redesign/domain1-seed/domain1-a1-<organization-id>-v2.apply.sql
```

`Domain1SeedRunner` đọc connection string từ biến môi trường và chạy SQL đã sinh; không cần `psql`.

Chạy SQL dry-run trước, kiểm tra kết quả rồi mới chạy SQL apply trong PostgreSQL. Script A1 tự từ chối khi không có đúng ba khóa v1 published của tổ chức chỉ định. Nguồn 135 PNG vẫn ở `docs/ui-redesign/assets`; 99 ảnh slide lõi được Vite đóng gói trực tiếp từ thư mục này, không nhân đôi tệp trong FE. Các ảnh là tài nguyên giao diện, không phải nội dung `learning_materials` trong DB. Nội dung bài, quiz và đề cuối khóa nằm trong DB; đề Kế toán, Marketing, HR, Sales/CRM và CEO được chọn theo vị trí, vị trí chưa khớp dùng đề chung. Các biến thể **nội dung từng slide theo vị trí** còn trong `domain1.v1.json`; schema lesson hiện chưa có track nên chưa đưa chúng vào DB.

## Tạo lại script

```powershell
node docs/ui-redesign/14-pulse-product-site/export-domain1-seed.cjs
node docs/ui-redesign/domain1-seed/build-current-sql.cjs --dry-run
node docs/ui-redesign/domain1-seed/build-current-sql.cjs --apply
```

## Nhập vào bản nháp của Platform Admin

Learning course v2 của một doanh nghiệp và Platform catalog v2 là hai lớp dữ liệu khác nhau. Admin đọc
`platform_catalog_*`, vì vậy cần nhập học liệu vào catalog `DRAFT` trước khi công bố. Script dưới đây chỉ thay nội
dung A1-F/I/A trong đúng một bản nháp, đánh dấu ba khóa là `EDITED` và không sửa phiên bản `CURRENT`.

```powershell
node docs/ui-redesign/domain1-seed/build-platform-draft-sql.cjs --dry-run
node docs/ui-redesign/domain1-seed/build-platform-draft-sql.cjs --apply
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --import-sql docs/ui-redesign/domain1-seed/domain1-platform-draft-v2.dry-run.sql
dotnet run --project backend/tools/Domain1SeedRunner/Domain1SeedRunner.csproj -- --import-sql docs/ui-redesign/domain1-seed/domain1-platform-draft-v2.apply.sql
```

Sau khi import, Admin thấy 3 khóa đã sửa trong bản nháp cùng 9 mô đun, 99 khối nội dung và 45 câu hỏi. Owner vẫn
dùng catalog `CURRENT`; nội dung chỉ đi sang luồng doanh nghiệp khi Admin chủ động công bố bản nháp.

`--dry-run` và `--apply` xuất SQL riêng; script tự từ chối nếu checksum JSON khác manifest, thiếu 3 khóa/3 mô đun hoặc quiz không có đáp án. SQL có ID xác định, kiểm đúng tổ chức/khóa nguồn, kiểm số lượng sau import, dùng một transaction và `ON CONFLICT DO NOTHING`. Không chạy `--apply` trên DB khác trước khi kiểm course code, version và các quyền.

## Đường đọc và giới hạn hiện tại

- `PulseLearnerReader` trong nhánh này giữ tiêu đề, mô đun và quiz v1 của enrollment cũ; người chưa có enrollment dùng v2. Đề theo vị trí ở `practical_task_templates` được `PulseFinalReader` chọn theo vị trí và hiển thị ở Employee Final/Manager Review.
- Nội dung 5 track nghề trên từng slide và 135 PNG còn trong JSON/thư mục `assets`; schema Lesson và API hiện chưa có track/media. Bản v2 trong DB dùng slide lõi chung. Không đưa URL giả vào `learning_materials` và không upload ảnh vào storage khi chưa có endpoint ảnh có quyền truy cập rõ ràng.
- Bài đầu vào, mua suất học Platform A1 → Learning M1 và xác nhận mua trong `CreateCourseAssignmentUseCase` là luồng BE khác; seed này không thay chính sách đó. Rubric trong template hiện là hướng dẫn để Manager đọc, chưa phải máy tính điểm tự động; quyết định duyệt vẫn theo luồng hiện hành.
