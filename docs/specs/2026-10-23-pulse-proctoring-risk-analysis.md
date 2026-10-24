# Pulse — Phân tích rủi ro gian lận trong thi

Ngày: 2026-10-23 · Bổ sung cho `2026-10-16-pulse-employee-roadmap-proctoring.md` · Schema: `docs/database/DigiTalent_AI_Canonical_v3_4.sql`

## Mục tiêu

Bài làm có giám sát (đánh giá trước khi học, bài cuối khóa) đã ghi màn hình, camera, micro và nhật ký rời tab / mất nguồn ghi.
Tính năng này thêm hai lớp:

1. **Nhận diện khuôn mặt trên trình duyệt** (thị giác máy tính, MediaPipe Face Landmarker): phát hiện vắng mặt, nhiều người,
   nhìn ra ngoài màn hình. Chạy trên máy người thi — khung hình camera không bị gửi đi chỉ để phân tích, chỉ các khoảng đáng
   ngờ (thời điểm + thời lượng) được ghi vào `proctoring_events`.
2. **Điểm rủi ro phía máy chủ**: tổng hợp nhật ký thành điểm 0–100, các yếu tố đóng góp và dòng thời gian các điểm đáng ngờ.
   Người chấm (MG-13) bấm một điểm để `RecordingPlayer` tua tới đúng đoạn.

Điểm chỉ gợi ý đoạn nên xem; quyết định Đạt / Chưa đạt vẫn do người chấm.

## Sự kiện mới (`proctoring_events.kind`)

| Kind | Ý nghĩa | duration_ms | detail |
|------|---------|-------------|--------|
| `FACE_MISSING` | Không thấy khuôn mặt liên tục ≥ 3 s | thời gian vắng | — |
| `MULTIPLE_FACES` | ≥ 2 khuôn mặt liên tục ≥ 1,5 s | thời lượng | "2 khuôn mặt" |
| `LOOKING_AWAY` | Một khuôn mặt, quay ngang hoặc cúi / ngẩng > 35° liên tục ≥ 4 s | thời lượng | hướng |
| `FACE_CHECK_ON` | Mô hình tải xong, bắt đầu nhận diện | — | — |
| `FACE_CHECK_OFF` | Không tải / chạy được mô hình (bài vẫn làm tiếp) | — | lý do |

Mất khung hình ngắn hơn 1 s không khép khoảng đang theo dõi; khi camera mất, nhận diện tạm dừng (không tính thêm là vắng mặt).
Tối đa 300 sự kiện khuôn mặt mỗi phiên (máy chủ giới hạn 2000 sự kiện).

## Điểm rủi ro (`PulseProctoringRisk`)

Mỗi sự kiện: điểm gốc + điểm theo mỗi 10 giây kéo dài (phần cộng thêm tối đa 2 lần điểm gốc); tổng một loại không vượt trần.
Khoảng mất nguồn (`*_STOPPED`) kéo dài tới `*_RESUMED` tương ứng hoặc hết phiên.

| Kind | Gốc | / 10 s | Trần | Mức |
|------|-----|--------|------|-----|
| MULTIPLE_FACES | 15 | 3 | 40 | HIGH |
| SHARE_STOPPED, CAMERA_STOPPED | 10 | 2 | 25 | HIGH |
| TAB_HIDDEN | 6 | 2 | 30 | MEDIUM |
| FACE_MISSING | 5 | 2 | 30 | MEDIUM |
| MIC_STOPPED | 5 | 1 | 15 | MEDIUM |
| FOCUS_LOST | 3 | 1 | 15 | LOW |
| LOOKING_AWAY | 3 | 1 | 20 | LOW |

Điểm = min(100, tổng); `LOW` < 20 ≤ `MEDIUM` < 50 ≤ `HIGH`. Các sự kiện cách nhau ≤ 10 s gộp thành một điểm đáng ngờ (mức nặng
nhất trong đoạn); trả tối đa 20 điểm nặng nhất, theo thứ tự thời gian. `faceCheck`: `ON` / `OFF` / `PARTIAL` / `NONE` (bài cũ).

Không lưu bảng mới: điểm được tính khi đọc (`PulseRecordingReader` → `PulseRecordingDto.risk`, trả trong `GET /pulse/final-reviews`).

## Frontend

- `features/pulse-employee/exam/face-signals.ts` — `FaceSignalTracker` (khung hình → khoảng đáng ngờ, thuần TS), `headPose`.
- `exam/face-detector.ts` — nạp động `@mediapipe/tasks-vision` (GPU, lùi về CPU). WASM / mô hình: `VITE_FACE_WASM_URL`,
  `VITE_FACE_MODEL_URL` (mặc định jsDelivr cùng phiên bản gói và Google Storage).
- `exam/face-monitor.ts` — vòng lấy mẫu 500 ms trên thẻ `<video>` ẩn; `ProctorController` ghi sự kiện, hiện lời nhắc
  (`faceAlert`) và trạng thái (`faceCheck`) trong bảng giám sát của người thi.
- `features/pulse-manager/components/ProctoringRiskPanel.tsx` — điểm, yếu tố, danh sách điểm đáng ngờ; `RecordingPlayer` vẽ dải
  đáng ngờ trên dòng thời gian; thẻ bài trong hàng chờ có nhãn mức rủi ro.
