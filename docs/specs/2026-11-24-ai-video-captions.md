# Phụ đề video bằng AI cho người khiếm thính

Ngày: 2026-11-24 · Nhánh: `feature/DT-ai-hearing-impaired-support` · Schema: `docs/database/DigiTalent_AI_Canonical_v3_11.sql`
(migration `AddPlatformAssetCaptions`)

> **Cập nhật 2026-11-28 — phụ đề chữ đã bỏ, chỉ còn là lời thoại cho video ký hiệu.** Người học không còn thấy phụ đề
> chữ (không `<track>`, không "Phụ đề: Bật/Tắt", không khung "Xem lời thoại"; `LessonMediaDto` không còn `captions`).
> Bảng `platform_asset_captions`, AI tạo và "Lưu lời thoại" vẫn giữ: đó là **bước 1 "Lời thoại"** bên trong khối
> "Video ngôn ngữ ký hiệu" (`TranscriptEditor`), đầu vào của bản đồ ký hiệu. Bỏ "Xuất bản phụ đề" (endpoint `…/captions/publish`)
> và cảnh báo "video chưa có phụ đề" khi xuất bản khóa học; video ký hiệu luôn phân tích bản lời thoại đã lưu
> (`captionSource = DRAFT`), `published_cues` chỉ còn cho các track đã phân tích trước đó. Phần dưới đây mô tả thiết kế ban đầu.

Người khiếm thính không nghe được lời giảng trong video bài học. Tính năng này làm phụ đề tiếng Việt cho video do quản trị
nền tảng tải lên: AI viết bản nháp khi được yêu cầu, quản trị viên duyệt và sửa, người học thấy phụ đề trên video và toàn
bộ lời thoại bên dưới. Làm thẳng trong web (không làm tiện ích trình duyệt): âm thanh cần hỗ trợ nằm trong nền tảng, phụ đề
làm một lần dùng cho mọi người, có bước duyệt, chạy được trên điện thoại và không đụng tới bài thi có giám sát.

## Luồng

| Bước | Ai | Màn hình | API |
|---|---|---|---|
| 1. Yêu cầu AI tạo phụ đề | Quản trị nền tảng | Trình soạn khóa học, khối Video → mục "Phụ đề tiếng Việt" | `POST /platform/assets/{assetId}/captions/generate` (202) |
| 2. AI làm nền | Máy chủ | Trình soạn hỏi lại mỗi 4 giây khi đang `PROCESSING` | `GET /platform/assets/{assetId}/captions` |
| 3. Duyệt, sửa (hoặc tự nhập) | Quản trị nền tảng | Danh sách câu: giờ bắt đầu/kết thúc, chữ, "Lấy giờ đang phát", "Phát từ câu này" | `PUT /platform/assets/{assetId}/captions` |
| 4. Xuất bản phụ đề | Quản trị nền tảng | "Xuất bản phụ đề" (lưu nháp trước nếu còn thay đổi) | `POST /platform/assets/{assetId}/captions/publish` |
| 5. Xem | Nhân viên, quản lý, chủ DN | Trang học (`LessonSlide`): phụ đề bật sẵn + "Xem lời thoại" | `LessonMediaDto.captions` trong nội dung bài học |

Quyền: đọc `platform.catalog.read`, ghi `platform.catalog.manage` (không thêm quyền mới). Người học nhận phụ đề cùng nội
dung bài học, không cần quyền riêng.

## Quy tắc

- **AI chỉ chạy khi quản trị viên bấm nút**, để chỉ tốn tiền cho video cần phụ đề. Không có khóa Gemini → 400
  `AI_NOT_CONFIGURED` (vẫn tự nhập được). Đang có việc AI cho video đó → 409; việc treo quá 1 giờ được chạy lại.
- **Phụ đề gắn với tệp video** (`platform_assets`), không gắn với phiên bản chương trình học: tệp video dùng chung cho mọi
  phiên bản, nên video đã có phụ đề thì phiên bản nào hiển thị video đó cũng có. Muốn mở trình soạn vẫn cần một bản nháp.
- **Hai bản**: `draft_cues` (AI tạo hoặc tự nhập, quản trị viên sửa) và `published_cues` (người học thấy). Xuất bản chép
  bản nháp sang, có hiệu lực ngay, không cần xuất bản lại phiên bản chương trình. Tạo lại bằng AI chỉ ghi đè bản nháp
  (trình soạn hỏi xác nhận). AI lỗi → `FAILED` + `error_code`, bản nháp trước đó được giữ.
- **Một câu** = `{startMs, endMs, text}`. Lưu được khi: có chữ, tối đa 200 ký tự, `endMs > startMs`, hiện tối đa 60 giây,
  kết thúc trước 6 giờ, không bắt đầu trước khi câu trước kết thúc, tối đa 2000 câu (`PlatformCaptionRules.CheckSaved`,
  lỗi 400 `INVALID_CAPTIONS` "Câu N: …"; FE `lib/captions.ts` `captionProblem` báo trước cùng câu chữ).
- **Kết quả AI được chuẩn hóa** (`PlatformCaptionRules.Normalize`): bỏ câu rỗng, xếp theo thời gian, thiếu giờ kết thúc thì
  đoán theo độ dài chữ (1–7 giây), cắt chỗ chồng lên câu sau, gộp câu bắt đầu cùng lúc, tách câu dài hơn 84 ký tự (hai
  dòng) thành nhiều câu chia thời gian theo số chữ.
- **Kiểm tra trước khi xuất bản phiên bản**: video (khối Video và video trong Slide) chưa có phụ đề đã xuất bản → cảnh báo
  (WARN) "Mô đun N: x video chưa có phụ đề…", **không chặn** xuất bản.
- Mỗi lần xuất bản phụ đề ghi `audit_logs` (`PLATFORM_CAPTIONS_PUBLISHED`).

## AI (Gemini)

- `ICaptionTranscriber` (Application) → `Infrastructure/AI/GeminiCaptionTranscriber`; đổi sang dịch vụ chuyển giọng nói
  khác thì chỉ thay lớp này.
- Video tới 500 MB nên đi qua **Files API**: tải lên kiểu resumable → chờ tệp `ACTIVE` → `generateContent` với tệp + JSON
  schema (`hasSpeech`, `cues[{start, end, text}]`), `mediaResolution: MEDIA_RESOLUTION_LOW` để giảm token khung hình (model
  không nhận tham số này thì hỏi lại không có nó) → xóa tệp trên Gemini (Gemini cũng tự xóa sau 48 giờ).
- Khóa: như các tính năng Gemini khác (`Gemini:ApiKey`, rồi `Assistant:ApiKey` khi trợ lý chạy Gemini, rồi
  `GEMINI_API_KEY`). Model thử lần lượt: `Gemini:CaptionModel` → `Gemini:Model` → `Assistant:Model` (khi trợ lý chạy Gemini) → `gemini-3.5-flash` → `gemini-2.5-flash`; model trả 404 (Google ngừng cấp cho khóa mới) thì chuyển ngay model sau, hết model → `AI_MODEL_UNAVAILABLE`.
- Lời nhắc: chép đúng lời (không tóm tắt), giữ thuật ngữ, bỏ từ đệm; ≤ 2 dòng / ~84 ký tự / 1–7 giây; **âm thanh không phải
  lời nói trong ngoặc vuông** (`[nhạc nền]`, `[tiếng chuông điện thoại]`); có từ hai người nói thì ghi vai trò khi đổi
  lượt; câu tiếng nước ngoài dịch sang tiếng Việt; không mô tả hình ảnh.
- Giới hạn thời gian: tải lên 30 phút, chờ xử lý 15 phút, mỗi lần gọi model 10 phút. Mã lỗi: `AI_KEY_REJECTED`,
  `AI_UPLOAD_FAILED`, `AI_VIDEO_UNREADABLE`, `AI_BUSY`, `AI_MODEL_UNAVAILABLE`, `AI_TIMEOUT`, `AI_BAD_RESPONSE`, `VIDEO_FILE_MISSING`, `AI_FAILED`
  (thông điệp tiếng Việt ở `PlatformCaptionRules.ErrorMessage`).
- Chạy nền: `CaptionJobQueue` (Channel trong tiến trình) + `CaptionWorker` (BackgroundService), **mỗi lần một video**; khi
  máy chủ khởi động, các dòng còn `PROCESSING` được chạy lại. Thiết kế cho **một** instance API (docker-compose chạy một);
  nhiều instance thì mỗi instance sẽ chạy lại cùng việc.

## Giao diện

- Trình soạn: `features/platform/builder/CaptionEditor.tsx` (lớp `pa-cap-*` trong `pulse-catalog.css`), gắn dưới video
  trong `MediaEditor` của `BlockCard.tsx`. Nhãn trạng thái: Chưa có phụ đề / AI đang tạo phụ đề / Lần tạo gần nhất bị lỗi /
  Bản nháp chưa xuất bản / Có thay đổi chưa xuất bản / Đang hiển thị cho người học. Câu đang phát trong video được tô.
- Người học: `features/pulse-employee/components/CaptionedVideo.tsx` (lớp `pu-cv-*` trong `pulse-lesson.css`), dùng ở
  `LessonSlide` (trang học EM và xem trước bài học của chủ DN; bản xem trước trong trình soạn tự dựng media từ các khối nên
  chưa có phụ đề). `<track kind="captions" srclang="vi" default>`
  tạo từ WebVTT (`cuesToVtt`, Blob URL) — phụ đề gốc của trình duyệt nên chạy cả khi toàn màn hình và theo cài đặt phụ đề
  của người xem (không tự đổi kiểu chữ). "Xem lời thoại" mở toàn bộ lời thoại: câu đang nói được tô và giữ trong khung
  (không cuộn cả trang; người học tự cuộn thì ngừng theo 4 giây), bấm câu nào video tua tới đó.
- Chế độ demo (mock) chưa giả lập tải video lên, nên không có trình soạn phụ đề ở đó.

## Chưa làm

- Video nhúng từ YouTube (iframe): dựa vào phụ đề của YouTube.
- Trình soạn phụ đề cho video trong khối Slide (người học đã nhận phụ đề nếu video đó có phụ đề xuất bản ở khối Video).
- Nhập/xuất tệp `.vtt` / `.srt`; tùy chọn "luôn bật phụ đề" trong hồ sơ người dùng; nút "Viết lại dễ hiểu" cho nội dung bài.
- Chỉ gửi âm thanh cho AI (cần ffmpeg trên máy chủ) để giảm thêm chi phí.
