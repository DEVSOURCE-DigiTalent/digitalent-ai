# Nhân vật 3D ra dấu ngôn ngữ ký hiệu cho người khiếm thính

Ngày: 2026-11-24 · Nhánh: `feature/DT-ai-hearing-impaired-support` · Schema: `docs/database/DigiTalent_AI_Canonical_v3_12.sql`
(migration `AddSignGlosses`) · Đi sau phụ đề chữ (`docs/specs/2026-11-24-ai-video-captions.md`)

Người khiếm thính bẩm sinh thường dùng ngôn ngữ ký hiệu làm ngôn ngữ chính. Ngoài phụ đề chữ, video bài học có một nhân
vật 3D ra dấu nội dung lời giảng. Không có dịch vụ sẵn cho tiếng Việt → VSL, nên hệ thống tự dựng ba phần:

| Phần | Nội dung | Trạng thái |
|---|---|---|
| A. Từ điển ký hiệu | Video người thật ra dấu cho từng từ → chuyển động → nhân vật xem thử, xuất bản | **Đã làm** |
| B. Phụ đề → chuỗi ký hiệu | Khớp từng câu phụ đề với từ điển thành bản đồ ký hiệu, quản trị viên duyệt, rồi ghép **video người thật ra dấu** đồng bộ phụ đề (`2026-11-24-sign-language-video.md`). Còn lại: AI sắp trật tự VSL, đánh vần từ thiếu | **Đã làm phần khớp + video ghép** |
| C. Nhân vật cho người học | Nút "Ngôn ngữ ký hiệu" cạnh video: nhân vật ra dấu theo giờ từng câu, tự dừng video chờ khi ký hiệu chậm hơn lời | Kế hoạch |

Giới hạn cần biết: ngữ pháp VSL do AI sắp xếp có thể sai (bắt buộc người biết ký hiệu duyệt); thuật ngữ số nhiều từ chưa có
ký hiệu nên phải đánh vần; nhân vật hiện chỉ có khẩu hình và nháy mắt, chưa có nét mặt (nhướn mày…) vốn là một phần ngữ pháp
VSL; chất lượng phụ thuộc video mẫu.

## A. Từ điển ký hiệu (PA-18 `/platform/sign-dictionary`)

- **Nguồn video:** từ điển có sẵn, **chỉ khi bên sở hữu cho phép** (ví dụ kho khoảng 4.000 ký hiệu của dự án QIPEDC – Bộ
  GD&ĐT: trang không ghi giấy phép; từ 2026-11-25 dùng phi thương mại cho học tập, nhập bằng `scripts/import_qipedc_signs.py`,
  chưa có văn bản cho phép dùng thương mại — xem `2026-11-24-sign-language-video.md` §Biến thể và pháp lý). Bảng chữ cái
  ngón tay, chữ số theo Thông tư 17/2020/TT-BGDĐT.
  Mỗi ký hiệu ghi nguồn, đường dẫn và giấy phép; "Nhập video ký hiệu" chỉ chạy khi đã ghi nguồn, giấy phép và tích "bên sở
  hữu đã cho phép".
- **Bảng `sign_glosses`:** chữ (`gloss`, `normalized` = NFC + chữ thường để tra, không trùng chữ × loại trong các ký hiệu đang
  dùng), loại `WORD`/`LETTER`/`DIGIT`/`TONE`, trạng thái `DRAFT`/`PUBLISHED`/`ARCHIVED` ("xóa" = ARCHIVED), video
  (`platform_assets` VIDEO), chuyển động, `mirrored` (video quay kiểu soi gương). Đổi video thì xóa chuyển động cũ và đưa về
  `DRAFT`. Xuất bản cần có chuyển động (`NO_MOTION`); audit `SIGN_GLOSS_PUBLISHED` / `SIGN_GLOSS_ARCHIVED`.
- **Chuyển động lưu toạ độ, không lưu góc khớp** (`motion_data` bytea, `motion_layout` 1): mỗi khung 325 số int16
  little-endian = cờ + 33 điểm thân chuẩn hoá theo ảnh + 33 điểm thân theo mét + 21 điểm mỗi bàn tay theo mét (MediaPipe
  hand world landmarks), giá trị × 10000. Khoảng 25 KB một ký hiệu. Đổi nhân vật hay cách tính góc không cần quét lại video.
  Giới hạn 5–60 khung/giây, tối đa 1.800 khung (`INVALID_MOTION`).
- **API** `PlatformSignDictionaryController` `api/v1/platform/sign-glosses` (đọc `platform.catalog.read`, ghi
  `platform.catalog.manage`): `GET` (tìm, lọc loại / trạng thái / chưa có chuyển động, phân trang), `GET {id}`, `POST`, `PUT {id}`,
  `PUT {id}/motion`, `POST {id}/publish`, `DELETE {id}` (lưu trữ), `GET motions?ids=&publishedOnly=` (tối đa 300; người học
  chỉ nhận ký hiệu đã xuất bản).
- **Lấy chuyển động ngay trên trình duyệt** (`features/sign-language/extract-motion.ts`): MediaPipe Holistic Landmarker
  (`@mediapipe/tasks-vision`, đã có trong dự án; tải mô hình ~14 MB lần đầu), tua video từng khung theo số khung/giây đã chọn
  trong đoạn đã chọn (tối đa 20 giây). Video được tải về thành blob (MediaPipe cần đọc điểm ảnh; `<video>` khác origin không
  cho), không gửi đi đâu. Khung có độ tin cậy hai vai < 0,6 bị bỏ (nhận nhầm người). Sau khi lấy: tỉ lệ khung bắt được thân /
  tay; dưới 80% thân hoặc dưới 50% cả hai tay → cảnh báo.
- **Nhân vật** (`features/sign-language/sign-avatar.ts`, three.js + `@pixiv/three-vrm`, chỉ tải khi mở): người mặc vest
  "Business_Male_02" của thư viện Microsoft Rocketbox, **MIT** (`frontend/public/avatars/README.md`, `LICENSE-rocketbox.txt`),
  chuyển sang VRM 0.x bằng `scripts/avatar-converter/`; 30 xương ngón tay, chớp mắt, ánh sáng studio (đèn chính, đèn phụ, đèn viền).
  *Cập nhật 2026-11-28*: thay Erika (100Avatars, CC0) vì trông không hợp với nền tảng doanh nghiệp. Khung máy quay vừa vùng ra dấu
  (đầu → thắt lưng, đủ rộng cho hai tay).
- **Tính góc khớp** (`features/sign-language/sign-rig.ts`):
  - Cánh tay **không đoán bằng góc**: mỗi xương được xoay để chỉ đúng hướng xương tương ứng của người ra dấu trong toạ độ 3D
    (vai → khuỷu → cổ tay), nên bàn tay đặt đúng chỗ — vị trí là một phần nghĩa của ký hiệu. Hướng bàn tay dựng từ cổ tay,
    khớp ngón trỏ, khớp ngón út. Ngón tay lấy từ Kalidokit.
  - Toạ độ MediaPipe (x sang phải ảnh = tay trái người ra dấu, y xuống, z âm = gần máy quay) đổi sang không gian mô hình VRM 0
    là (−x, −y, z): nhân vật ra dấu **như người ra dấu, không như gương**. Video soi gương (`mirrored`) được lật lại trước.
  - Kalidokit làm cho webcam selfie nên dựng kiểu gương: phần ngón tay đưa bàn tay đã lật x với tên bên kia.
  - Không xoay hông theo video (nhân vật luôn quay về người xem); phần thiếu giữ góc gần nhất; làm mượt theo thời gian.
  - Góc ở quy ước VRM 0 (three-vrm giữ nguyên cho xương chuẩn hoá của mô hình VRM 0); mô hình VRM 1 thì đảo x, z (`toVrm1`).
- **Giao diện** `features/platform/sign-dictionary/` (`SignDictionaryPage`, `SignGlossEditor`, `SignImportDialog`,
  `sign-dictionary.css` lớp `pa-sd-*`), khung nhân vật `SignAvatarView` (`sign-language.css` lớp `sl-*`); dữ liệu
  `services/sign-dictionary.service.ts` + `hooks/use-sign-dictionary.ts`.
- **Đã kiểm tra:** test backend (`SignDictionaryTests`), test frontend (định dạng, hướng tay đúng bên, video soi gương, hộp
  thoại nhập); chạy thật trên trình duyệt với video có người dẫn: bắt được thân 100%, hai tay ~98–100% số khung, nhân vật chắp
  tay đúng như video.

## B. Phụ đề → chuỗi ký hiệu (kế hoạch)

- Mỗi câu phụ đề đã xuất bản thêm chuỗi ký hiệu: `[{glossId}]` hoặc đánh vần `[{letters}]`, lưu cùng câu trong
  `platform_asset_captions` (bản nháp / bản người học thấy như phụ đề).
- Gemini nhận câu phụ đề + danh sách từ có trong từ điển (chỉ các từ xuất hiện trong câu để gọn), trả chuỗi theo trật tự ký
  hiệu; từ không có thì đánh vần bằng chữ cái ngón tay. Quản trị viên sửa chuỗi trong trình soạn phụ đề rồi xuất bản.

## C. Nhân vật cho người học (kế hoạch)

- `CaptionedVideo` thêm nút "Ngôn ngữ ký hiệu": khung nhân vật cạnh video, tải chuyển động của các ký hiệu dùng trong video
  (`GET …/motions`, quyền đọc mới cho người học), ra dấu theo giờ từng câu, nối các ký hiệu bằng chuyển tiếp ngắn, về tư thế
  nghỉ giữa các câu; tự dừng video khi ký hiệu chậm hơn lời (tắt được).
