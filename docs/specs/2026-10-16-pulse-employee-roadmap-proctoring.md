# Pulse — lộ trình nhân viên, đánh giá trước khi học và bài làm có giám sát

Ngày: 2026-10-16 · Thay phần "bài kiểm tra đầu vào" của `docs/specs/2026-10-14-pulse-employee-portal-api.md`.
Thiết kế đã duyệt: canvas "Pulse employee" (bảng Main / Roadmap / Exam / Review). Schema: `docs/database/DigiTalent_AI_Canonical_v3_3.sql`,
migration `20261015205317_PulsePreAssessmentProctoring`.

## 1. Thay đổi so với bản 2026-10-14

| Trước | Bây giờ |
|-------|---------|
| Bài kiểm tra đầu vào 18 câu (EM-04 `/enterprise/me/baseline`) đặt mức khởi điểm | Bỏ. Mỗi khóa có **bài đánh giá trước khi học** (EM-12), chấm bởi quản lý |
| Lộ trình = Cơ bản → mục tiêu vị trí | Lộ trình = Cơ bản → min(mục tiêu vị trí, **trần năng lực** của phòng ban) |
| Bài cuối khóa là ô văn bản trong trang khóa | Bài cuối khóa ở trang riêng, **có giám sát**: chia sẻ toàn bộ màn hình + camera + micro, ghi hình |
| Mức đã xác nhận = max(đầu vào, khóa được duyệt, minh chứng thực tế) | = max(cấp khóa được duyệt, minh chứng thực tế) |
| MG-13 chỉ chấm bài cuối khóa | MG-13 "Chấm bài": bài đánh giá trước khi học + bài cuối khóa, kèm trình phát bản ghi |

`/enterprise/me/baseline` và `/enterprise/me/assessments/*` chuyển về `/enterprise/me`. Bảng `capability_baselines`,
`capability_baseline_answers` còn trong schema nhưng không còn được đọc hay ghi.

## 2. Lộ trình doanh nghiệp đặt

Với mỗi lĩnh vực (nhóm năng lực có khóa PUBLISHED):

- **Mục tiêu** = max `RequiredLevel` của bộ yêu cầu ACTIVE của vị trí (0 = vị trí không yêu cầu).
- **Trần** (`CapabilityCeilingReader.EffectiveForDepartmentAsync`) = trần riêng của phòng ban (≤ trần tổ chức) ?? trần tổ chức
  ?? max(1, gợi ý từ các bộ yêu cầu ACTIVE của tổ chức) khi doanh nghiệp chưa lưu trần.
- **Đỉnh lộ trình** `pathTop` = min(mục tiêu, trần).
- **Vùng** của từng khóa (`PulseRules.ZoneOf`): mục tiêu 0 → `OUTSIDE_PATH`; cấp > trần → `ABOVE_CEILING`; cấp > mục tiêu →
  `OPTIONAL` (học được, nằm trong trần); còn lại → `PATH`.

**Hiển thị (theo phản hồi duyệt thiết kế):** bảng lộ trình ở Hôm nay (EM-01) và bản vẽ ở Lộ trình (EM-02) chỉ có **tên khóa và cấp
độ** của các khóa `PATH` (thẻ "Mục tiêu" hoặc "Trần phòng ban" ở ô cuối). Trạng thái, % đã học và đạt / chưa đạt chỉ nằm trong
danh sách khóa bên dưới (accordion lĩnh vực ở EM-01, năng lực → khóa ở EM-02). Khóa `OPTIONAL` hiện nhạt hơn, khóa
`ABOVE_CEILING` viền đứt.

## 3. Đánh giá trước khi học (`course_pre_assessments`)

- Một bài cho mỗi nhân viên × khóa (theo mã khóa), làm một lần, **không cần suất học**. Đề, tiêu chí và độ dài minh chứng
  (30–8000 ký tự) giống bài cuối khóa.
- Mở khi khóa không bị chặn: có vị trí, khóa trong lộ trình hoặc tùy chọn, khóa cấp trước của lĩnh vực đã được công nhận.
- Quản lý (người đánh giá) quyết định kèm lý do ≥ 10 ký tự:
  - `PASSED` → khóa được công nhận (`approvedVia = PRE_ASSESSMENT`): enrollment COMPLETED (tạo nếu chưa có), khóa cấp sau mở.
  - `NOT_YET` → nhân viên học khóa (cấp 2–3 vẫn cần suất học), rồi làm bài cuối khóa như cũ (tối đa 2 lần nộp).
- Chặn học trước khi có kết quả: mô đun / câu ôn tập / bài cuối trả `PRE_ASSESSMENT_REQUIRED` hoặc `PRE_ASSESSMENT_PENDING`.
- **Dữ liệu cũ:** khóa đã có enrollment bắt đầu học, đã có bài cuối khóa hoặc đã được duyệt → `preStatus = NOT_NEEDED`.

`preStatus`: `REQUIRED` | `LOCKED` | `PENDING` | `PASSED` | `NOT_YET` | `NOT_NEEDED`.
`slotStatus` của khóa: `COMPLETED`, `PRE_ASSESSMENT`, `PRE_REVIEW`, `TO_LEARN`, `IN_PROGRESS`, `FINAL_READY`, `IN_REVIEW`,
`RETRY_WAIT`, `NEEDS_SUPPORT`, `SEAT_NEEDED`, `AFTER_PRIOR_LEVEL`, `ABOVE_CEILING`, `OUTSIDE_PATH`, `NO_POSITION`.
`progressPercent` = phần đã học (đọc trang + đạt câu ôn tập của từng mô đun).

**Người đánh giá** hiển thị cho nhân viên: quản lý phòng ban (trừ khi chính nhân viên là quản lý), nếu không thì chủ doanh nghiệp
đầu tiên.

## 4. Bài làm có giám sát (đánh giá trước khi học và bài cuối khóa)

Luồng trên trình duyệt (`features/pulse-employee/exam/proctor.ts`, `ProctoredExam.tsx`):

1. **Chuẩn bị:** nhân viên chọn chia sẻ **toàn bộ màn hình** (`displaySurface = monitor`; cửa sổ / tab bị từ chối), bật camera,
   bật micro và tích cam kết. Trình duyệt không có `getDisplayMedia` / `MediaRecorder` → không cho bắt đầu.
2. **Bắt đầu:** `POST courses/{id}/proctoring` mở phiên (phiên đang ghi trước đó của cùng bài bị đánh dấu ABANDONED), rồi mở
   hai đoạn ghi: `SCREEN` (chỉ hình) và `CAMERA` (hình camera + tiếng micro).
3. **Ghi:** `MediaRecorder` cắt mẩu mỗi 5 giây; mẩu được `PUT` lần lượt theo `seq` (0, 1, 2…) và thử lại khi lỗi mạng hoặc 409.
   Gửi lại một mẩu đã nhận → thành công (`duplicate: true`); mẩu nhảy cóc → 400 `CHUNK_OUT_OF_ORDER`.
4. **Giám sát:** rời tab (`TAB_HIDDEN`, kèm thời lượng), rời cửa sổ ≥ 1 giây (`FOCUS_LOST`), ngừng chia sẻ / tắt camera /
   tắt micro (`SHARE_STOPPED`, `CAMERA_STOPPED`, `MIC_STOPPED`) được ghi và gửi mỗi 4 giây. Mất một nguồn → **bài bị khóa**
   (lớp phủ che bài làm) và đoạn ghi đó đóng; bật lại → sự kiện `*_RESUMED` và một đoạn ghi mới.
5. **Nộp:** dừng mọi đoạn, chờ tải hết mẩu, rồi nộp bài kèm `proctoringSessionId`. Máy chủ đóng phiên (SUBMITTED), ghi sự kiện
   `SUBMITTED` và từ chối nếu thiếu bản ghi màn hình hoặc camera (`PROCTORING_RECORDING_MISSING`).

Rời trang khi đang làm: cảnh báo `beforeunload` và hộp xác nhận "Thoát". Trang làm bài không có thanh điều hướng chính.

**Người chấm** (MG-13, `RecordingPlayer`): phát màn hình và camera trên một đồng hồ phiên; khoảng không chia sẻ hiện "Màn hình
không được chia sẻ"; mốc sự kiện trên thanh thời gian và danh sách nhật ký để tua tới. Sự kiện cần xem (`flagged`):
`TAB_HIDDEN`, `FOCUS_LOST`, `SHARE_STOPPED`, `CAMERA_STOPPED`, `MIC_STOPPED`.

Giới hạn (`PulseRules`): mẩu ≤ 16 MB, ≤ 50 đoạn mỗi nguồn, ≤ 200 sự kiện mỗi lần gửi, ≤ 2000 sự kiện mỗi phiên.

## 5. API nhân viên — `api/v1/me/pulse`

| Phương thức | Đường dẫn | Quyền | Ghi chú |
|-------------|-----------|-------|---------|
| GET | `overview` | `employee_competency_profile.read` | `person`, `reviewer`, `domains[]` (target, ceiling, pathTop, competencies), `courses[]`, `nextSteps[]` (≤ 3), `stats` |
| GET | `courses/{id}/pre-assessment` | `assessment.read` | `status`, `canStart`, `closedMessage`, `criteria`, `submission` |
| POST | `courses/{id}/pre-assessment` | `attempt.submit` | `{ evidenceText, proctoringSessionId }` → `{ preAssessmentId, status, submittedAt, durationMs }` |
| GET / POST | `courses/{id}/final` | như trên | POST bắt buộc `proctoringSessionId`; trả thêm `durationMs` |
| POST | `courses/{id}/proctoring` | `attempt.submit` | `{ kind: PRE_ASSESSMENT \| FINAL }` → `{ sessionId, kind, startedAt, maxChunkBytes }`; chưa mở → 400 `ASSESSMENT_NOT_OPEN` |
| POST | `proctoring/{sid}/recordings` | như trên | `{ track, startOffsetMs, contentType, displaySurface }` → `{ recordingId, track, segmentNo }`; màn hình không phải `monitor` → `SCREEN_NOT_ENTIRE`; quá 50 đoạn → `TOO_MANY_SEGMENTS` |
| PUT | `proctoring/{sid}/recordings/{rid}/chunks/{seq}` | như trên | thân = byte của mẩu (`application/octet-stream`); `CHUNK_OUT_OF_ORDER`, `CHUNK_TOO_LARGE`, `CHUNK_EMPTY` |
| POST | `proctoring/{sid}/recordings/{rid}/end` | như trên | `{ endOffsetMs }` |
| POST | `proctoring/{sid}/events` | như trên | `{ events: [{ kind, offsetMs, durationMs?, detail? }] }`; `STARTED` / `SUBMITTED` chỉ máy chủ ghi; quá giới hạn → `TOO_MANY_EVENTS` |

Phiên đã đóng (nộp hoặc bị thay bằng phiên mới) → 400 `PROCTORING_SESSION_CLOSED` cho mọi lệnh ghi; phiên của người khác → 404.
Nộp bài với phiên sai loại / sai khóa → 400 `PROCTORING_SESSION_MISMATCH`.

`GET courses/{id}` trả `nextAction`: `PRE_ASSESSMENT` | `PRE_REVIEW` | `MODULE` | `FINAL` | `PREVIEW` | `LOCKED` | `DONE`.
`GET practice` có thêm `preAssessments[]`. `GET outcomes` có thêm kết quả `PRE_ASSESSMENT` (id `pre-…`).

## 6. API quản lý — `api/v1/pulse/final-reviews` (quyền `task.evaluate`)

- `GET` — mỗi mục có `kind` (`PRE_ASSESSMENT` | `FINAL`), `proctoringSessionId` và `recording`
  `{ sessionId, kind, status, startedAt, endedAt, durationMs, flaggedCount, segments[], events[] }`; mỗi đoạn có `contentPath`
  (link đã ký, hạn 6 giờ). Hàng chờ có thêm `preAssessmentCount`. Bài đánh giá trước khi học có `attemptNo = maxAttempts = 1`.
- `POST pre-assessments/{preAssessmentId}/decision` — `{ decision, reason }` → `{ preAssessmentId, decision, status, enrollmentId }`;
  đã chấm → 409. Ghi audit, thông báo `PULSE_PRE_ASSESSMENT_DECIDED` cho nhân viên.
- `POST {submissionId}/decision` và `…/support` giữ nguyên.

Thông báo cho người chấm khi nhân viên nộp: `PULSE_PRE_ASSESSMENT_SUBMITTED`, `PULSE_FINAL_SUBMITTED`.

**Tệp ghi hình:** `GET api/v1/pulse/recordings/{recordingId}/content?exp=&sig=` — không cần token (thẻ `<video>` không gửi
được), chữ ký HMAC (`IProctoringRecordingUrlSigner`) chỉ phát cho người chấm có quyền xem bài; hỗ trợ range request.
Tệp lưu qua `IFileStorageService` (hiện là `LocalFileStorageService`, ghi nối bằng `AppendAsync`).

## 7. Màn hình

| ID | Đường dẫn | Trang |
|----|-----------|-------|
| EM-01 | `/enterprise/me` | Hôm nay: vị trí + người đánh giá, lộ trình (tên khóa, cấp độ), việc tiếp theo, lĩnh vực → khóa |
| EM-02 | `/enterprise/me/path` | Lộ trình: giới thiệu vị trí, bản vẽ lộ trình, cách công nhận khóa, năng lực → khóa |
| EM-05 | `/enterprise/me/courses/:courseId` | Tổng quan khóa: bước đánh giá trước khi học, % đã học |
| EM-07 | `/enterprise/me/courses/:courseId/final` | Bài cuối khóa (có giám sát) |
| EM-12 | `/enterprise/me/courses/:courseId/pre-assessment` | Đánh giá trước khi học (có giám sát) |
| MG-13 | `/enterprise/team/final-reviews` | Chấm bài: lọc theo loại bài và trạng thái, trình phát bản ghi |
