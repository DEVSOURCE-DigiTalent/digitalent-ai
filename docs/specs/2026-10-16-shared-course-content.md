# Đồng bộ học liệu giữa các role

## Nguồn và phiên bản

- Admin soạn trong `platform_catalog_versions` / `platform_catalog_courses` và các bảng mô đun, khối, câu hỏi Platform.
- Bản `DRAFT` chỉ dùng để soạn và xem trước. `PublishPlatformCatalogVersionUseCase` gọi `PlatformLearningPublisher` trong cùng transaction công bố.
- Publisher chuyển nội dung thật sang `courses`, `course_modules`, `lessons`, `assessments`, `questions`, `question_options`, `assessment_questions`, `learning_materials` và `practical_task_templates` của doanh nghiệp.
- Mỗi lần công bố tạo phiên bản Learning mới, liên kết `supersedes_course_id`; không thay ID khóa, trang, câu hỏi, đáp án hay kết quả của lượt học trước.
- Danh mục Owner và lượt học mới chọn phiên bản published mới nhất. Employee đang có enrollment đọc đúng bản của enrollment, bao gồm tên khóa, bài học và quiz. Manager đọc đề và minh chứng của đúng khóa đã nộp.
- Giữ mã M1 ở doanh nghiệp cũ khi nguồn Platform là A1. Không thêm một mã A1 trùng ô lĩnh vực/cấp vào doanh nghiệp đó.
- Khi tạo doanh nghiệp mới, bước cấp khung/khóa lấy nội dung của catalog CURRENT hiện tại. Bản nháp không được cấp.

## Slide, ảnh và đề

- Admin soạn các khối TEXT, IMAGE, VIDEO, SLIDE theo thứ tự từ trên xuống; mỗi khối có nút sửa và đổi thứ tự. Video có thể phát ngay trong phần soạn. Không dùng bố cục đọc bài của Employee trong trình soạn.
- `LessonSlide` chỉ dùng cho Employee, Admin **Xem như nhân viên** và Owner xem bài. Các khối ảnh cạnh khối chữ được ghép vào cùng trang đọc; video và SLIDE độc lập vẫn là trang riêng. `PlatformLessonPages` và `catalogPages` thực hiện cùng quy tắc. Số bước hoàn thành không tăng chỉ vì thêm ảnh minh họa.
- Chữ và media hiển thị đều lấy từ API; không suy đoán ảnh theo vị trí mô đun trên giao diện. Manifest chỉ là đầu vào chuyển bộ ảnh đã soạn sang asset thật, ánh xạ theo mã khóa + tên mô đun + tiêu đề (hoặc chú thích duy nhất), nên đổi thứ tự mô đun không làm mất ảnh.
- Ảnh/video do Admin tải lên là `platform_assets`. Khi công bố, Learning lưu tham chiếu ổn định `platform-asset:<uuid>` trong LINK `learning_materials`; API tạo URL ký mới khi đọc. Không lưu URL ký có hạn vào DB.
- Khối SLIDE có nhiều ảnh/video giữ đầy đủ danh sách media; các role dùng cùng tệp.
- Owner chưa có quyền học nội dung nâng cao vẫn nhận nội dung đã khóa từ API; FE không dựng ảnh của học liệu bị khóa.
- Đề cuối khóa hiển thị từ template theo khóa; rubric và prompt không còn chỉ là chữ cố định trên giao diện. Bộ tiêu chí ra quyết định, quyền chấm và quy tắc đạt của develop giữ nguyên.

## Quiz và bài thi

- Quiz lấy assessment QUIZ published mới nhất của đúng module; pool câu hỏi và đáp án lấy từ DB.
- Phân biệt `quizBankQuestionCount` (tổng ngân hàng) và `quizQuestionCount` (số câu mỗi lượt). Quy tắc develop giữ nguyên: rút tối đa 2 câu mỗi lượt; ngân hàng 5 câu không có nghĩa mỗi lượt phải làm 5 câu. Admin và Employee đều có nhãn giải thích hai con số.
- Trắc nghiệm trước khóa/cuối khóa tiếp tục rút từ cùng pool mô đun qua `PulseExamPaper`. Không thay số câu mỗi lượt, điều kiện đạt, thời gian chờ/hạn nộp hay quyền Manager.
- Liên kết câu hỏi Platform với block được chuyển thành liên kết trang của quiz Learning khi công bố. Câu chưa được tác giả liên kết giữ quy tắc fallback hiện tại.
- Sau công bố, cache catalog, khóa doanh nghiệp và Pulse được đánh dấu cần tải lại. Các tab khác tải lại theo cơ chế refetch khi trở lại trang của React Query.

## Kiểm tra dữ liệu thật

```powershell
# DIGITALENT_DB_CONNECTION do môi trường cung cấp; không ghi mật khẩu vào repository.
dotnet run --project backend/tools/Domain1SeedRunner -- --check-platform-content 2
```

Lệnh kiểm tra chuyển catalog v2 sang schema Learning trong transaction, chạy SaveChanges để PostgreSQL kiểm FK/CHECK/unique,
rồi rollback. Không tự công bố bản nháp và không chuyển enrollment đang tồn tại.

## Chuyển ảnh đã soạn thành media có thể sửa

```powershell
node frontend/scripts/sync-domain1-slide-art.cjs
# Trỏ đúng thư mục uploads của API đang chạy, không trỏ thư mục riêng của seed runner.
$env:DIGITALENT_ASSET_ROOT = '<absolute-api-uploads-directory>'
dotnet run --project backend/tools/Domain1SeedRunner -- --check-slide-images frontend/src/features/pulse-employee/lib/domain1-slide-art.json
dotnet run --project backend/tools/Domain1SeedRunner -- --import-slide-images frontend/src/features/pulse-employee/lib/domain1-slide-art.json
```

- Check ghi thử FK/thứ tự trong transaction rồi rollback, không sao chép file. Import sao chép PNG vào storage trước khi commit.
- Thêm IMAGE riêng sau TEXT tương ứng trong **bản nháp** Domain I; giữ ID khối chữ và liên kết quiz, giữ thứ tự mô đun Admin đã sắp xếp. Không thay ảnh/video đã có bên cạnh khối chữ.
- Bổ sung media cho đúng các bài Learning **v2 đã seed trước đó**, không sửa chữ, quiz, đáp án, enrollment, tiến độ hoặc công bố bản nháp. Mã asset theo hash nội dung; chạy lại không tạo thêm khối/media.
- File ở storage Local phải được triển khai cùng metadata database. Khi chạy API từ thư mục build khác hoặc trên máy chủ khác, cấu hình cùng storage hoặc chuyển đủ các file `platform-assets/domain1` sang thư mục uploads của API đó.
- Nếu Admin thay nội dung bản nháp, chỉ sau công bố mới áp dụng cho lượt học mới. Lượt học đang có vẫn giữ phiên bản của mình để bảo toàn kết quả đã làm.
