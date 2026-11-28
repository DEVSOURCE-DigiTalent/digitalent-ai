# Video ngôn ngữ ký hiệu cho video bài học

Ngày: 2026-11-24 · Nhánh: `feature/DT-ai-hearing-impaired-support` · Schema: `docs/database/DigiTalent_AI_Canonical_v3_13.sql`
(migration `AddSignLanguageVideoTracks`) · Đi sau phụ đề chữ (`2026-11-24-ai-video-captions.md`) và từ điển ký hiệu
(`2026-11-24-sign-language-avatar.md`, phần A).

Người khiếm thính bẩm sinh thường đọc ngôn ngữ ký hiệu dễ hơn đọc chữ. Tính năng này dựng **video người ra dấu** đồng bộ
với phụ đề tiếng Việt của video bài học, từ các video ký hiệu trong Từ điển ký hiệu. **Phụ đề chữ và video ký hiệu là hai
việc riêng**: tạo phụ đề không bao giờ được tính là đã tạo video ký hiệu; video ký hiệu chỉ "có" khi máy chủ đã dựng ra một
tệp video thật.

## Phạm vi

| | Nội dung | Trạng thái |
|---|---|---|
| MVP | Khớp phụ đề với từ điển → bản đồ ký hiệu → người duyệt sửa → **ghép video người thật ra dấu bằng FFmpeg** (`ClipSequenceRenderer`) → xem trước → xuất bản → người học bật/tắt | **Đã làm** |
| Mặc định (2026-11-26) | **Một nhân vật 3D cho cả video**: trình duyệt dựng track nhân vật theo lưới khung hình của video bài giảng, máy chủ ghép (`AvatarMotionRenderer`) — xem "Cập nhật 2026-11-26 (2)" | **Đã làm** |
| Mở rộng | AI sắp trật tự câu theo ngữ pháp VSL (trạng thái `ANALYZING` dành cho bước này); đánh vần bằng chữ cái ngón tay cho từ thiếu | Kế hoạch |
| Mở rộng | Xoá tệp video nháp cũ khi dựng lại; nhiều instance API (hàng đợi dùng chung) | Kế hoạch |

## Luồng

| Bước | Màn hình (khối Video → "Video ngôn ngữ ký hiệu", dưới "Phụ đề tiếng Việt") | API |
|---|---|---|
| 1. Chọn nguồn | "Tạo video ký hiệu": phụ đề đã xuất bản (mặc định) / bản nháp | — |
| 2. Chọn kiểu đầu ra | Nhân vật 3D (mặc định) / video của một người ra dấu; cửa sổ góc trái dưới (khuyên dùng) / toàn màn hình / chỉ track ký hiệu; vùng miền ưu tiên | — |
| 3. Phân tích | "Phân tích phụ đề" hoặc "Xem bản đồ ký hiệu" (chạy ngay trong request, không gọi AI) | `POST /platform/assets/{assetId}/sign-language/analyze` |
| 4. Duyệt bản đồ | Bảng Thời gian / Nội dung / Ký hiệu được chọn / Trạng thái: chọn biến thể khác, tìm trong từ điển, gộp, tách, đổi chỗ, thời lượng, bỏ qua từ / câu, thêm ký hiệu, ghi chú, duyệt từng câu, "Thêm vào Từ điển ký hiệu" | `PUT /platform/sign-language/{trackId}/segments`, `GET /platform/sign-glosses/match` |
| 5. Dựng video | "Tạo video ký hiệu" (202) → thanh tiến trình | `POST …/{trackId}/render`, `GET …/{trackId}/status` |
| 6. Xem trước | Video đầu ra + phụ đề (dời sang trái khỏi cửa sổ ký hiệu), "Tải video xuống" | `GET …/{trackId}/preview` |
| 7. Xuất bản | "Xuất bản video ký hiệu" (người học thấy ngay) | `POST …/{trackId}/publish` |
| — | "Thử lại" sau lỗi / việc treo; "Hủy bản nháp" | `POST …/{trackId}/retry`, `DELETE …/{trackId}/draft` |
| Người học | Nút "Ngôn ngữ ký hiệu: Bật/Tắt" và "Phụ đề: Bật/Tắt" cạnh video | `LessonMediaDto.signLanguage` |

Mọi API ở `api/v1/platform/…`; đọc `platform.catalog.read`, ghi `platform.catalog.manage` (người sửa nội dung khóa học).
Chỉ video đang dùng trong bài học (khối Video hoặc Slide) mới tạo được (`SIGN_NOT_A_LESSON_VIDEO`).

## Điều kiện

- **Tạo video ký hiệu** chỉ bật khi: video gốc có trong kho, có phụ đề (đã lưu hoặc xuất bản), từ điển có ít nhất một ký
  hiệu dùng được (có video + nguồn + giấy phép + xác nhận cho phép), máy chủ có bộ dựng, người dùng có quyền sửa. Thiếu
  phụ đề: "Hãy tạo và xuất bản phụ đề tiếng Việt trước khi tạo video ngôn ngữ ký hiệu." Từ điển chưa có video: "Từ điển
  hiện chưa có video hoặc chuyển động cho các ký hiệu này. Vui lòng bổ sung dữ liệu trong Từ điển ký hiệu."
- **Dựng** bị từ chối (400, không tạo việc) khi còn ký hiệu thiếu / ngang nhau / đã xoá / chưa có video / thiếu giấy phép,
  với câu cụ thể, ví dụ "Không thể tạo video ký hiệu vì câu số 4 chưa có ký hiệu cho “marketing”." Không có từ nào bị
  bỏ qua âm thầm: từ thiếu hiện trong bản đồ và danh sách "Ký hiệu còn thiếu" đến khi người duyệt chọn ký hiệu hoặc bỏ qua.
- **Xuất bản** cần: tệp đầu ra có trong kho, `video/mp4|webm`, dung lượng > 0, đọc được thời lượng / kích thước, không có
  việc đang chạy, lần dựng gần nhất không lỗi, bản đồ không đổi sau lần dựng, mọi ký hiệu bắt buộc có video, **mọi câu có
  lời đã được duyệt hoặc bỏ qua** (`SIGN_REVIEW_PENDING`). Xuất bản không đụng tới video gốc và phụ đề; ghi
  `audit_logs` (`PLATFORM_SIGN_VIDEO_PUBLISHED`).

## Khớp phụ đề với từ điển (`ISignGlossMatcher`)

- Chuẩn hoá: Unicode NFC, chữ thường, bỏ dấu câu và khoảng trắng thừa, bỏ phần không phải lời nói trong ngoặc vuông
  (`[nhạc nền]`). Khoá tra của ký hiệu bỏ phần chú thích trong ngoặc tròn (`cạnh (môn Toán)` → `cạnh`).
- Tại mỗi vị trí của câu, theo thứ tự: **cả câu** → **cụm dài nhất** → **từ đơn** (khớp chính xác) → **không dấu** (ký
  hiệu được gõ không dấu, hoặc phụ đề không dấu; ký hiệu có dấu không bao giờ khớp từ có dấu khác: "bán" ≠ "bàn") → **từ
  đồng nghĩa** khai báo trên ký hiệu → số ít của từ nước ngoài ("emails" → "email") / số đọc từng chữ số → **thiếu**.
- Nhiều ký hiệu cho cùng từ: **ký hiệu dựng được** (có video + nguồn + giấy phép + đã cho phép) trước ký hiệu chưa có video
  (ví dụ từ của Thông tư 17 mới nạp tên) → vùng của track → biến thể → ký hiệu mặc định (`is_preferred`) → `priority`.
  **Ngang nhau thì không chọn** (`AMBIGUOUS`), người duyệt chọn. Hư từ còn thiếu (là, của, về, các, đã…) được gợi ý "thường
  được lược", chỉ bỏ qua khi người duyệt bấm "Bỏ qua N hư từ còn thiếu".
- Chữ viết hoa từ hai chữ cái trở lên (`AI`, `CRM`) là chữ viết tắt: chỉ khớp ký hiệu viết y hệt, và ký hiệu viết hoa chỉ
  khớp đúng cách viết đó ("AI" ≠ đại từ "ai", "Ai biết?" ≠ ký hiệu "AI"); áp dụng ở bước khớp chính xác và không dấu, không
  áp dụng cho từ đồng nghĩa; câu viết hoa toàn bộ (≥ 3 từ) được đọc như chữ thường.
- Mỗi ký hiệu lưu `sourceText, normalizedText, glossId (matchedGloss), assetId (matchedAssetId), matchType, confidence,
  isManualOverride, isMissing, skipped, durationMs, startMs, endMs, note, hint, candidateIds`. Phân tích lại giữ lựa chọn
  tay và kết quả duyệt của câu không đổi chữ, tìm lại ký hiệu còn thiếu.
- Kết quả chỉ là gợi ý: ngôn ngữ ký hiệu có ngữ pháp và trật tự riêng. Giao diện luôn nhắc "Bản đồ ký hiệu được tạo tự
  động. Vui lòng nhờ người biết ngôn ngữ ký hiệu kiểm tra trước khi xuất bản."; mỗi câu lưu người duyệt, lúc duyệt, ghi chú.

## Xếp thời gian (`SignTimelinePlanner`) và dựng (`ClipSequenceRenderer`)

- Ký hiệu của một câu bắt đầu khi phụ đề hiện, nối nhau theo thứ tự; được tràn sang khoảng nghỉ nhưng **không bao giờ lấn
  sang câu sau** (không chồng thời gian). Dài hơn chỗ có: phát nhanh tối đa ×1,5, rồi cắt bớt cuối mỗi ký hiệu (kèm cảnh
  báo). Ngắn hơn: người ra dấu nghỉ (nền trơn) đến câu sau. Thời lượng người duyệt đặt dài hơn clip: giữ khung cuối. Câu
  chỉ có âm thanh không giới hạn câu trước.
- FFmpeg (không qua shell, mọi tham số qua `ArgumentList`, tên tệp do hệ thống sinh): mỗi việc một thư mục tạm riêng
  `{WorkDirectory}/{trackId}-{guid}` (xoá khi xong / lỗi); tải video gốc và video ký hiệu từ `IFileStorageService`; chuẩn
  hoá mỗi clip một lần (cắt đúng đoạn ký hiệu đã chọn trong từ điển, lật video soi gương, **bỏ âm thanh**, khung 480×540,
  25 khung/giây); đặt lên lưới khung hình (không trôi giờ); ghép; dựng đầu ra H.264 + AAC MP4 `+faststart` (phát được trên
  trình duyệt), **giữ nguyên âm thanh bài giảng**:
  - `OVERLAY`: video bài giảng + cửa sổ người ra dấu cao 50% ở góc trái dưới (viền sáng 2 px); phụ đề của người học
    được dời sang phải (`position:66% size:62%`) nên không bị che;
  - `FULLSCREEN`: người ra dấu đủ khung, âm thanh bài giảng;
  - `TRACK_ONLY`: chỉ người ra dấu (không tiếng), trình phát đặt nó lên góc video bài giảng và chạy cùng (lệch > 0,25 s
    thì chỉnh lại).
- Kiểm tra đầu ra bằng ffprobe (thời lượng, kích thước) rồi lưu thành **một `platform_assets` VIDEO mới**
  (`platform-assets/sign-language/…`, tối đa 500 MB). Không có tệp = không thành công.

## Chạy nền (`SignVideoWorker`)

- Hàng đợi trong tiến trình, không giữ trùng một track; tối đa `SignVideo:MaxConcurrentJobs` việc cùng lúc (mặc định 1).
- Khởi động lại máy chủ: các track còn `RENDERING` được chạy lại. Việc quá `SignVideo:JobTimeoutMinutes` (mặc định 120)
  dừng với `SIGN_JOB_TIMEOUT`; track `RENDERING` không tiến triển 3 giờ được coi là treo (hiện "Tạo thất bại", "Thử lại").
- Nhật ký: mỗi bước ghi `Sign video job {TrackId}` (bắt đầu, số câu/ký hiệu/clip, thời lượng, kích thước, lỗi + mã), lỗi
  FFmpeg ghi kèm phần cuối stderr. Người dùng chỉ thấy thông báo tiếng Việt và mã việc (8 ký tự đầu của track id).
- Thiết kế cho **một** instance API (như phụ đề AI).

## Mã lỗi

`SIGN_CAPTION_NOT_FOUND`, `SIGN_CAPTION_NOT_PUBLISHED`, `SIGN_GLOSS_NOT_FOUND`, `SIGN_MEDIA_MISSING`, `SIGN_MOTION_MISSING`,
`SIGN_LICENSE_MISSING`, `SIGN_RENDERER_NOT_CONFIGURED`, `SIGN_VIDEO_UNREADABLE`, `SIGN_RENDER_FAILED`,
`SIGN_STORAGE_UPLOAD_FAILED`, `SIGN_OUTPUT_INVALID`, `SIGN_NOT_RENDERED`, `SIGN_REVIEW_PENDING`, `SIGN_JOB_ALREADY_RUNNING`
(409, cũng trả về khi sửa bản đồ lúc đang dựng), `SIGN_JOB_TIMEOUT`, `SIGN_NOT_A_LESSON_VIDEO`, `SIGN_INVALID_SEGMENTS`,
`SIGN_PERMISSION_DENIED` (403 do bộ lọc quyền trả, giao diện hiển thị tiếng Việt). Thông điệp ở `SignVideoRules.ErrorMessage`.

## Biến thể và pháp lý

- Ký hiệu có `sign_language` (VSL), `region` (VN / VN-BAC / VN-TRUNG / VN-NAM; mã khác hợp lệ cũng được nhận), `variant`,
  `is_preferred`, `priority`, `synonyms`. Bản đồ hiện vùng/biến thể của ký hiệu đã dùng.
- Mỗi video ký hiệu cần **nguồn, giấy phép và xác nhận bên sở hữu + người ra dấu đã cho phép** (`consent_confirmed`), tên
  người ra dấu chỉ ghi khi được phép. Thiếu thì không thêm được video (`SIGN_LICENSE_MISSING`) và không dùng để dựng. Ký
  hiệu có từ trước v3.13 phải tích lại "đã cho phép" mới dùng được cho video. Hệ thống không tự tải video từ Internet.
- **Thông tư 17/2020/TT-BGDĐT** (chuẩn quốc gia): 408 từ, mỗi từ là hình vẽ + mô tả, **không có video**; tên các từ đã nạp
  ở trạng thái nháp bằng `scripts/seed_sign_dictionary_tt17.sql`. Vốn từ là từ thông dụng cấp tiểu học, gần như không có
  từ của bài giảng nghề nghiệp.
- **QIPEDC** (`https://qipedc.moet.gov.vn/dictionary`, Ban QLDA Bộ GD&ĐT): 4.362 video (từ, cụm từ, bảng chữ cái ngón tay
  gồm Ă Â Ê Ô Ơ Ư Đ và F J W Z, 5 dấu thanh, số), mã đuôi `B`/`N`/`T` = miền Bắc/Nam/Trung. Trang **không ghi giấy phép hay
  điều khoản sử dụng**. Chủ dự án quyết định (2026-11-25) dùng **phi thương mại cho học tập**; dùng thương mại phải có văn
  bản cho phép (`qipedc.pmb@moet.gov.vn`). Nhập bằng `scripts/import_qipedc_signs.py` (chạy tay, ngoài máy chủ; Python
  thư viện chuẩn, qua API với tài khoản Platform Admin): chỉ tải **những ký hiệu phụ đề cần** (`--asset <id video>`,
  `--text`, `--words-file`; cụm dài nhất trước, chữ viết hoa như bộ khớp) và tuỳ chọn `--alphabet` (chữ cái, dấu thanh,
  số), từng tệp một, có bộ nhớ đệm; mỗi ký hiệu: vùng theo mã, biến thể `QIPEDC <mã>`, nguồn + liên kết video + ghi chú
  giấy phép nói rõ phạm vi, ký hiệu mặc định = biến thể của `--preferred-region` (mặc định miền Bắc) khi từ chưa có mặc
  định và chỉ có một nghĩa; "a / b" → ký hiệu `a`, từ đồng nghĩa `b`; `--skip` bỏ từ/mã sai nghĩa; chạy lại bỏ qua ký hiệu
  đã có; chỉ ghi khi có `--confirm-noncommercial-use`, `--dry-run` để xem trước. Bộ khớp vẫn có thể chọn sai nghĩa
  ("hiệu (Toán học)" + "quả" cho "hiệu quả"): người duyệt kiểm tra.

## Cài đặt và cấu hình

### FFmpeg

- **Docker** (`backend/src/DigiTalent.Api/Dockerfile`): image runtime cài sẵn `ffmpeg` (Debian, có libx264 / AAC). Build
  lại image `backend-api`.
- **Chạy trực tiếp**: cài FFmpeg ≥ 4.4 có `libx264`, đặt `ffmpeg` và `ffprobe` trên PATH, hoặc ghi đường dẫn đầy đủ vào
  `SignVideo:FfmpegPath` / `SignVideo:FfprobePath` (biến môi trường `SignVideo__FfmpegPath`). Windows: bản build của
  gyan.dev hoặc BtbN; macOS: `brew install ffmpeg`; Ubuntu/Debian: `apt install ffmpeg`.
- Kiểm tra: `GET /platform/assets/{id}/sign-language` trả `prerequisites.rendererAvailable = true`; nếu false,
  `rendererMessage` nói lý do (chưa cài, thiếu libx264, đang tắt).

### Mục `SignVideo` (appsettings / biến môi trường `SignVideo__…`)

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `Enabled` | true | false = bộ dựng báo `SIGN_RENDERER_NOT_CONFIGURED` |
| `FfmpegPath`, `FfprobePath` | `ffmpeg`, `ffprobe` | lệnh hoặc đường dẫn đầy đủ |
| `WorkDirectory` | trống = `{temp}/digitalent-sign-video` | thư mục tạm của các việc (cần chỗ trống ~3× video) |
| `Fps`, `SignWidth`, `SignHeight` | 25, 480, 540 | khung hình người ra dấu |
| `WindowWidthPercent`, `MarginPercent` | 28, 3 | cửa sổ OVERLAY |
| `BackgroundColor` | `#1E293B` | nền khi người ra dấu nghỉ |
| `Crf`, `Preset` | 23, `veryfast` | chất lượng / tốc độ H.264 |
| `MaxSpeedup` | 1,5 | tốc độ phát nhanh nhất của một ký hiệu |
| `ProcessTimeoutMinutes`, `JobTimeoutMinutes` | 30, 120 | giới hạn một lệnh FFmpeg / một việc |
| `MaxConcurrentJobs` | 1 | số việc dựng cùng lúc (1–4) |

Giá trị sai được thay bằng mặc định. Không cần khóa API nào.

### Lưu trữ

Dùng `FileStorage` hiện có (Local hoặc MinIO). Tệp video ký hiệu lưu ở `platform-assets/sign-language/{yyyyMM}/…` và phát
qua liên kết ký HMAC như mọi tệp của khóa học. Docker: thư mục `uploads` đã nằm trên volume.

### Migration

`dotnet ef database update` (Development tự chạy khi khởi động). Quay lui:
`dotnet ef database update AddSignGlosses --project src/DigiTalent.Infrastructure --startup-project src/DigiTalent.Api`
(xoá hai bảng mới; biến thể thừa của từ điển chuyển sang ARCHIVED).

## Giao diện

- Trình soạn: `features/platform/builder/SignLanguageVideoEditor.tsx` (+ `SignMapEditor`, `SignVideoSettingsDialog`,
  `SignGlossPicker`, `sign-video.css` lớp `pa-sv-*`), dữ liệu `services/sign-language-video.service.ts` +
  `hooks/use-sign-language-video.ts` (hỏi trạng thái mỗi 3 giây khi đang dựng), quy tắc hiển thị `lib/sign-video.ts`.
  Nhãn trạng thái: Chưa tạo / Đang phân tích / Thiếu ký hiệu / Chưa dựng video / Đang dựng video / Chờ kiểm duyệt / Đã sẵn
  sàng / Đã xuất bản / Tạo thất bại.
- Từ điển (PA-18): thêm vùng miền, biến thể, ký hiệu mặc định, ưu tiên, từ đồng nghĩa, người ra dấu, "đã cho phép";
  `?new=<chữ>` mở sẵn ký hiệu mới (liên kết "Thêm vào Từ điển ký hiệu" trong bản đồ).
- Người học: `CaptionedVideo` (nút "Ngôn ngữ ký hiệu: Bật/Tắt" nhớ lựa chọn trong `localStorage` `dt-sign-video`, đổi
  nguồn video giữ nguyên thời điểm và trạng thái phát; "Phụ đề: Bật/Tắt").

## Kiểm thử

- Backend: `SignGlossMatcherTests`, `SignTimelinePlannerTests`, `SignLanguageVideoFlowTests` (use case + worker với bộ dựng
  chỉ dùng trong test và kho tệp trong bộ nhớ), `SignDictionaryTests`, `ClipSequenceRendererTests` (FFmpeg thật, nhóm
  `Ffmpeg`, tự bỏ qua khi máy không có FFmpeg — kiểm cả màu điểm ảnh trong cửa sổ ký hiệu), `SignLanguageVideoPersistenceTests`
  (PostgreSQL, nhóm `Integration`).
- Frontend: `lib/__tests__/sign-video.test.ts`, `features/platform/__tests__/SignLanguageVideoEditor.test.tsx`,
  `features/pulse-employee/__tests__/CaptionedVideo.test.tsx`.

## Hạn chế

- Ghép từng ký hiệu rời không thể hiện nét mặt, vị trí không gian và chuyển tiếp như người phiên dịch thật; chất lượng phụ
  thuộc video mẫu và người duyệt.
- Mỗi lần dựng lại tạo một tệp mới; tệp nháp cũ chưa được dọn.
- Hàng đợi trong tiến trình: chỉ một instance API.

## Cập nhật 2026-11-26

- **Nhãn người nói không được ra dấu**: phụ đề AI ghi vai trò trong ngoặc tròn đầu câu, ví dụ `(Giảng viên)`; phần trong
  ngoặc tròn (như ngoặc vuông `[nhạc nền]`) không phải lời nói nên bị bỏ khi tách từ.
- **Không dấu**: một ký hiệu **một từ** không dấu ("to", "ba", "con") không bao giờ thay cho từ có dấu ("tổ", "bà"); chỉ
  cụm nhiều từ gõ không dấu ("xin chao") mới khớp với phụ đề có dấu.
- **Ký hiệu mang nghĩa riêng** (có chú thích trong ngoặc, ví dụ `hiệu (môn Toán)`) không được tự chọn: mục được đánh dấu
  "Cần chọn" (`AMBIGUOUS`, gợi ý `SENSE_CHECK`) và ký hiệu được đưa ra làm ứng viên để người duyệt xác nhận đúng nghĩa —
  trừ khi đó là ký hiệu mặc định của từ, từ đồng nghĩa đã khai báo, hoặc chữ viết tắt viết hoa khớp đúng cách viết
  (`AI (trí tuệ nhân tạo)` cho "AI").
- **Phân tích lại**: câu chưa bị người duyệt đụng tới được khớp lại từ đầu (áp dụng ký hiệu và quy tắc mới); câu đã sửa
  tay giữ cấu trúc, khớp lại các ký hiệu không chọn tay, giữ kết quả duyệt nếu ký hiệu không đổi.
- **"Bỏ qua N từ chưa có ký hiệu và dựng video"**: người quản trị chủ động chọn (có bước xác nhận) dựng video với các ký
  hiệu đã có; mọi từ chặn việc dựng (thiếu, cần chọn, chưa có video, thiếu giấy phép) được đánh dấu bỏ qua — vẫn hiện
  gạch ngang trong bản đồ, dùng lại được; câu đã duyệt mà bị đổi quay về "Chờ duyệt"; lưu rồi dựng ngay.
- **Tiến trình rõ từng bước** (migration `AddSignVideoProgressStage`, cột `progress_stage` + `progress_detail`):
  - Thanh 5 bước của cả quy trình: Phân tích phụ đề → Đủ ký hiệu → Dựng video → Duyệt từng câu → Xuất bản (đã xong /
    đang ở / lỗi / chưa tới, kèm số liệu: số câu, số từ thiếu, %, số câu chờ duyệt).
  - Khi dựng: Chờ đến lượt → Đọc video bài giảng → Chuẩn hóa video ký hiệu (từng clip, kèm tên ký hiệu) → Xếp và ghép
    theo giờ phụ đề → Dựng video đầu ra (đã xong x/y giây) → Kiểm tra video → Lưu vào kho; phần trăm, thời gian đã
    chạy, trình soạn hỏi lại mỗi 2 giây. Lỗi thì giữ bước bị lỗi: "Lỗi ở bước “…”".
- **Đã kiểm tra trên máy thật (Windows, FFmpeg 9.1, DB Docker cục bộ)**: video bài học 4 câu, 6 ký hiệu có video, 27 từ
  bỏ qua → dựng trong ~4 giây, MP4 H.264 1280×720 + AAC dài đúng 10 giây, cửa sổ người ra dấu đúng lúc câu được nói.

## Cập nhật 2026-11-26 (2): một nhân vật 3D, khớp lời nói

Phản hồi khi thử video ghép clip: người ra dấu **đổi liên tục** (mỗi ký hiệu một người, mỗi clip một khung hình) và
động tác **không khớp** lời nói (clip có đoạn đứng chờ đầu/cuối, bị nén hoặc cắt vào khung câu). Quy tắc mới:
**một video ký hiệu chỉ có một nhân vật từ đầu đến cuối**, chuyển cảnh liền mạch, đúng nhịp lời nói.

- **Mặc định `AVATAR` — nhân vật 3D (Erika, CC0)** ra dấu cả video từ chuyển động trong Từ điển ký hiệu:
  1. `GET /platform/sign-language/{trackId}/avatar-job` (`platform.catalog.manage`): kiểm tra bản đồ (mọi ký hiệu có
     chuyển động **lấy từ video đã ghi nguồn, giấy phép và sự đồng ý**, nếu không → `NO_LICENSE`), FFmpeg sẵn sàng, rồi
     trả **lưới khung hình của video bài giảng** (ffprobe: `frameRate` "30000/1001", số khung, thời lượng), ô 480×540,
     nền `#E9EEF5`, các câu với mọi từ (kể cả từ bỏ qua — chúng chiếm thời gian nói), các ký hiệu và `fingerprint`.
  2. Trình duyệt của quản trị viên (`features/sign-language/avatar-track-render.ts`): lấy chuyển động
     (`GET sign-glosses/motions`), **bỏ đoạn đứng chờ và chỉ lấy lần ra dấu đầu tiên** của mỗi chuyển động (`activeRange`: tay nâng trên eo ≥ 0,28 thân; video từ điển hay ra dấu hai lần, hạ tay > 0,5 s là hết lần đầu),
     **xếp lịch theo lời nói** (`planAvatarTimeline`: từ được nói ở thời điểm tỉ lệ với số âm tiết trong câu; ký hiệu bắt
     đầu sớm 120 ms, cách ký hiệu trước ≥ 180 ms; thiếu chỗ thì tăng tốc đều tới 1,5× và kéo lùi khỏi câu sau; vẫn thiếu
     thì ra dấu nối sang câu sau kèm cảnh báo — **không bao giờ cắt ngang một ký hiệu**; ký hiệu mà cuối video cắt mất quá nửa thì bỏ, có cảnh báo), tính tư thế từng khung
     (`createPoseSampler`: trong ký hiệu = chuyển động; hai ký hiệu gần nhau (≤ 900 ms) = chuyển mượt (easing bậc 5) từ
     tư thế cuối sang tư thế đầu; nghỉ lâu = hạ tay về tư thế nghỉ 380 ms rồi nâng lên kịp 420 ms trước ký hiệu sau;
     **luôn thở và chớp mắt** nên không có lúc "đứng hình"), vẽ **từng khung** (không theo đồng hồ, không phụ thuộc màn
     hình, nhanh hơn thời gian thực) và mã hoá bằng **WebCodecs**: H.264 Annex B (`avc1.42E01F`…) hoặc VP9/VP8 trong IVF.
  3. `POST /platform/sign-language/{trackId}/avatar-track` (multipart `file`, `fingerprint`, `format` H264|IVF,
     `frameRate`, `frameCount`, `placements` JSON; 202): bản đồ đã đổi → 409 `SIGN_AVATAR_TRACK_OUTDATED`; sai tốc độ
     khung / số khung (±2) / đầu tệp / vị trí trùng, ký hiệu đã bỏ qua → 400 `SIGN_AVATAR_TRACK_INVALID`. Track được lưu
     tạm ở `{WorkDirectory}/avatar-tracks/{trackId}.track|.json` (`SignAvatarTrackStore`) rồi xếp hàng dựng.
  4. `AvatarMotionRenderer` (máy chủ, FFmpeg): ghép track **khung đổi khung** với video bài giảng (cùng tốc độ khung nên
     không lặp / rơi khung, không giật), kiểm tra, lưu thành `platform_assets` mới; vị trí từng ký hiệu ghi vào bản đồ;
     track tạm xoá sau khi xong. Không có track của đúng bản đồ → `SIGN_AVATAR_TRACK_MISSING` / `_OUTDATED`, không video.
  - Fingerprint của `AVATAR` gồm cả chuyển động (fps × số khung): lấy lại chuyển động → video cần dựng lại.
  - Tiến trình: trong trình duyệt "Kiểm tra bản đồ, đọc chuyển động → Dựng nhân vật 3D từng khung hình (khung x/y ·
    m:ss/m:ss) → Tải track lên (x%) → Máy chủ ghép" + nút **Dừng**; trên máy chủ các bước như cũ, "Chuẩn hóa video ký
    hiệu" / "Xếp và ghép" đổi thành "Đọc track nhân vật 3D" / "Khớp nhân vật với video bài giảng".
  - **Lấy chuyển động hàng loạt** (`features/sign-language/batch-motion.ts`, MediaPipe trong trình duyệt, 20 khung/giây,
    chỉ video có nguồn + giấy phép + sự đồng ý): nút "Lấy chuyển động cho N ký hiệu" trong bản đồ (ký hiệu `NO_MOTION`)
    và "Lấy chuyển động cho mọi ký hiệu có video" ở Từ điển ký hiệu.
- **`CLIP` chỉ khi một người ra dấu**: mọi video ký hiệu được dùng phải cùng `signer_name` (không phân biệt hoa thường);
  nhiều người, hoặc chưa ghi người ra dấu khi dùng hơn một video → chặn dựng `SIGN_SIGNER_MIXED` ("Một video ký hiệu chỉ
  được có một nhân vật…").
- **Khung ra dấu ở góc trái dưới, cao nửa khung hình** (`SignComposer`, chung cho hai cách dựng; cài đặt
  `WindowHeightPercent` 50, `WindowWidthPercent` 36 = rộng tối đa, `WindowSide` LEFT|RIGHT, `MarginPercent` 3): video
  1280×720 → khung 320×360 tại (22, 338); 1920×1080 → 480×540 (đúng kích thước dựng); vị trí làm chẵn (mặt phẳng màu
  yuv420p) và viền sáng 2 px tách khỏi bài giảng. Phụ đề của người học dời sang **phải** (`VTT_BESIDE_SIGN_WINDOW` =
  `position:66% size:62% align:center`, hộp 35–97% để tránh cả nhân vật 3D vuông sát góc); track `TRACK_ONLY` của trình phát cũng ở góc trái dưới, cao 50%.
- **Nhân vật 3D ở OVERLAY: không nền, sát góc** (2026-11-26, thay khung nền sáng ở trên cho cách dựng `AVATAR`): chỗ của
  nhân vật là ô vuông cao `AvatarWindowHeightPercent` (60) % video, sát mép dưới và mép trái (`WindowSide`), không lề,
  không viền (`SignComposer.AvatarWindowFor`: 1280×720 → 432×432 tại (0, 288)); nhân vật bị mép dưới cắt ngang hông như
  người dẫn, đầu tới mép dưới ≈ 45 % chiều cao video. H.264 không có kênh alpha nên trình duyệt dựng đúng kích thước đó
  (`AvatarTile`, khung đôi ≤ 3600 macroblock = level 3.1) với khung rộng gấp đôi: trái = màu nhân với alpha trên nền đen,
  phải = alpha (trắng = nhân vật); mép trên và mép phía giữa video mờ dần 6 % để tay vươn xa nhạt đi thay vì bị cắt thẳng.
  FFmpeg tách lại: nhánh alpha để ở RGB (nhánh xám bị tự đổi dải tv/pc), vùng chết 10/255 chống nhiễu nén, màu chia cho
  alpha bằng `lut2` (bộ lọc `unpremultiply` của FFmpeg 8+ bỏ qua khung không gắn cờ premultiplied), `alphamerge`, overlay.
  Job trả `transparent` + `side`, upload gửi lại `transparent` (lệch → `SIGN_AVATAR_TRACK_INVALID`, "Tải lại trang…");
  track cũ có nền gặp OVERLAY → `SIGN_AVATAR_TRACK_OUTDATED` (dựng lại). FULLSCREEN / TRACK_ONLY vẫn nền màu, khung `signing`.
- Mã lỗi mới: `SIGN_SIGNER_MIXED`, `SIGN_AVATAR_TRACK_MISSING`, `SIGN_AVATAR_TRACK_OUTDATED`, `SIGN_AVATAR_TRACK_INVALID`,
  `SIGN_NOT_AVATAR`. Không đổi schema (track tạm nằm ở thư mục dựng; một instance API như hàng đợi dựng).
- Máy quay của track: từ trên đầu tới hông, rộng một tầm tay mỗi bên (`framing: 'signing'`), để tay và mặt rõ trong khung nhỏ.
- **Đã kiểm tra trên trang thật** (Edge không giao diện qua Playwright, API + DB Docker cục bộ, FFmpeg 9.1): "Chỉnh sửa" → "Nhân vật 3D" →
  "Lấy chuyển động cho 5 ký hiệu" (~75 giây) → 3/3 câu đủ ký hiệu → trình duyệt dựng 240 khung (24 khung/giây, H.264) trong ~2 giây →
  tải lên → máy chủ ghép trong ~2 giây → READY, MP4 1280×720 dài 10 giây; ký hiệu đặt tại 0,28 / 1,69 / 3,17 / 4,32 / 6,07 / 7,45 s
  (từ "tìm hiểu" được nói ở 4,27 s); một nhân vật ở góc trái dưới suốt video.
- Giới hạn: trình duyệt cần WebGL + WebCodecs (Chrome/Edge mới); trang phải mở đến khi tải lên xong; nhân vật chưa có
  nét mặt (ngữ pháp mặt của VSL) và chỉ ra dấu được các từ đã có chuyển động — từ thiếu vẫn bỏ qua như trước.
