# Báo cáo hành vi khi làm bài cuối khóa (AI) — trong Khoảng trống năng lực (OW-21)

Ngày: 2026-11-26 · Schema: v3.10 (`docs/database/DigiTalent_AI_Canonical_v3_10.sql`, migration `AddProctoringBehaviorReports`)

## Mục tiêu

1. **Thu sự kiện khi làm Course Final** — ngoài nhật ký giám sát đã có (rời tab / cửa sổ, mất màn hình / camera / micro,
   khuôn mặt bất thường), trình duyệt ghi thêm thao tác trên trang bài làm.
2. **AI phân tích sau khi nộp bài, lưu báo cáo** — báo cáo được lưu cùng bài nộp; AI đọc nhật ký ở nền và ghi kết luận,
   các phát hiện kèm bằng chứng.
3. **Màn hình Owner** — không tách trang riêng: đặt trong Khoảng trống năng lực (OW-21), để vừa thấy mức năng lực của
   nhân viên vừa thấy hành vi khi thi của người đó; xem dòng thời gian, bằng chứng, xem lại video.

## Sự kiện mới (`proctoring_events.kind`)

| Kind | Ghi khi | Detail |
|------|---------|--------|
| `COPY` | sao chép / cắt chữ trên trang bài làm | `NƠI:SỐ_KÝ_TỰ` — `ESSAY` (ô tự luận), `QUESTION` (đề, câu hỏi), `PAGE` |
| `PASTE` | dán chữ | như trên |
| `IDLE` | không gõ phím, không di chuột ≥ 90 giây khi trang đang mở và đang được chọn | — (`duration_ms`) |
| `SECOND_SCREEN` | máy nối thêm màn hình (`screen.isExtended`, Chromium) | `EXTENDED` |

Không ghi nội dung đã sao chép / dán, chỉ số ký tự. Nhân viên được báo trong quy chế bài làm và thấy các sự kiện này
trong nhật ký của mình. Điểm theo luật (`PulseProctoringRisk`): dán ≥ 200 ký tự = nặng (như nhiều người trước camera),
dán ngắn và màn hình phụ = vừa, sao chép và không thao tác = nhẹ.

## Luồng

1. Nhân viên nộp bài cuối khóa → cùng lần lưu: `proctoring_behavior_reports` (status `PENDING`, điểm + mức theo luật,
   số liệu: ký tự dán, số lần rời bài, khuôn mặt bất thường, màn hình phụ, trắc nghiệm…).
2. Sau khi lưu, báo cáo vào hàng đợi nền (`BehaviorAnalysisBackgroundService`, lần lượt từng báo cáo).
3. `ProctoringBehaviorAnalyzer` gửi cho Gemini: bối cảnh bài (khóa, lĩnh vực, cấp, thời gian làm, độ dài bài tự luận,
   trắc nghiệm) và nhật ký **đã đánh số**. Không gửi tên, bài làm hay video.
4. AI trả mức chung (`LOW|MEDIUM|HIGH`), tóm tắt, lời khuyên và các phát hiện, mỗi phát hiện dẫn **số thứ tự sự kiện**.
   Máy chủ bỏ phát hiện không dẫn được sự kiện có thật; khoảng thời gian lấy từ chính các sự kiện (AI không tự đặt mốc).
5. Kết quả: `READY`. Chưa có khóa AI → `FAILED` / `AI_NOT_CONFIGURED`. AI lỗi tạm thời → còn `PENDING`, lần quét sau
   (10 phút) thử lại, quá 3 lần → `FAILED` / `AI_UNAVAILABLE`. Phân tích lại mà lỗi thì giữ kết quả cũ.
6. Bài nộp trước v3.10: mở Khoảng trống năng lực thì báo cáo được lập bù và đưa vào hàng đợi.

Không có kết quả giả: khi AI không phân tích được, báo cáo chỉ có phần tổng hợp từ nhật ký và ghi rõ lý do.

## API (quyền `behavior_report.read`, `behavior_report.analyze` — OWNER)

- `GET /api/v1/behavior-reports` — mọi bài cuối khóa của nhân viên trong phạm vi, gom theo người (mức nặng nhất trước);
  mỗi bài kèm lĩnh vực (số 1–6 như OW-21) và cấp của khóa, mức, dải các đoạn đáng chú ý; `counts` theo mức.
- `GET /api/v1/behavior-reports/{reportId}` — chi tiết: phát hiện + sự kiện bằng chứng, số liệu, bài tự luận, bản ghi
  (link đã ký) và toàn bộ nhật ký.
- `POST /api/v1/behavior-reports/{reportId}/analyze` — AI phân tích lại ở nền (về `PENDING`).

Phạm vi: `EmployeeScope` (chủ doanh nghiệp = cả doanh nghiệp); ngoài phạm vi → 404.

## Màn hình — Khoảng trống năng lực (OW-21)

- **Hành vi khi thi** (dải dưới hàng thẻ đầu, theo phạm vi đang xem): số bài Rủi ro cao / Cần xem lại / Bình thường —
  ba ô rộng bằng nhau, nền trắng với cạnh và con số theo màu mức (không lấn các biểu đồ năng lực), luôn có chữ kể cả trên
  điện thoại; mức không có bài vẫn hiện nhưng không bấm được. Mỗi mức là một nút. Bấm một mức → danh sách người có bài ở mức đó: mức năng lực hiện tại (6 ô mang biểu tượng lĩnh vực:
  xanh = đạt mức cần, cam = chưa đạt, xám = chưa có kết quả, viền đỏ + chấm = có bài thi đáng ngờ; chú thích ở đầu danh sách;
  "Đạt x/y lĩnh vực") và từng bài ở mức đó "lĩnh vực · bài cấp" + "hiện tại …, cần …" kèm các phát hiện của AI (đáng ngờ ở đâu). Bấm một người → mở chi tiết với đúng bài đó.
- **Cần hỗ trợ / Tất cả nhân viên**: thêm dấu "Thi: rủi ro cao" / "Thi: cần xem lại" cạnh khoảng trống của từng người;
  bấm một người mở bảng của họ ngay trên trang. Trong "Cần hỗ trợ" các dấu xếp dọc bên phải, dòng khoảng trống được xuống
  hai dòng, thẻ hẹp (≤ 440 px) đặt dấu dưới tên; khi mọi người cùng "chưa đạt x/y lĩnh vực" câu đó ghi một lần ở đầu thẻ.
- **Bảng nhân viên**:
  - *Năng lực theo lĩnh vực*: mỗi lĩnh vực một thang 0–3 với mức lúc khảo sát, hiện tại và cần đạt; bên phải là bài thi
    cuối khóa của lĩnh vực đó (mức nặng nhất). Lĩnh vực có mức hiện tại đạt qua bài thi rủi ro cao được đánh dấu khiên.
  - *Bài thi cuối khóa*: các bài của người đó (lĩnh vực · cấp, khóa, lần, kết quả chấm) kèm một dòng chữ: phát hiện chính
    của AI (không có thì số đoạn cần xem hoặc "Không có dấu hiệu đáng ngờ") · thời gian làm bài.
  - *Xem lại bài đang chọn*: kết luận (biểu tượng khiên + mức; dòng phụ "điểm rủi ro theo nhật ký x/100 (mức)" — không đặt
    thành con số lớn dễ đọc như điểm bài thi) và lời khuyên của AI, các con số; video màn hình + camera; dòng thời gian nhiều làn
    (AI nhận định, Rời bài làm, Khuôn mặt, Sao chép / dán, Thiết bị); thẻ bằng chứng đánh số trùng số trên dòng thời gian —
    bấm là video tua tới trước 2 giây; bài tự luận (tỉ lệ chữ dán); toàn bộ nhật ký; "Phân tích lại".
  - Đầu bảng: "Đáng ngờ ở" — các bài rủi ro cao / cần xem lại (lĩnh vực · cấp + phát hiện chính), bấm để mở bài đó.
  - Link "Chi tiết khoảng trống" sang OW-22.

Không có menu hay trang riêng. Khoảng trống năng lực bị khóa trong thời gian dùng thử doanh nghiệp như trước.
