# Pulse — cổng nhân viên & API chấm bài cuối khóa

Ngày: 2026-10-14 · Đặc tả gốc: `docs/ui-redesign/16-pulse-product-flow-detailed.md`, mock `docs/ui-redesign/14-pulse-product-site/index.html`.

> **Cập nhật 2026-10-16:** bài kiểm tra đầu vào đã bỏ; mỗi khóa có bài đánh giá trước khi học, bài cuối khóa và bài đánh giá
> đều có giám sát (màn hình + camera + micro), lộ trình bị giới hạn bởi trần năng lực của phòng ban. Xem
> `docs/specs/2026-10-16-pulse-employee-roadmap-proctoring.md` — phần đó thay các mục đầu vào bên dưới.

Cổng nhân viên Pulse thay các màn EM-01..EM-18 cũ (liên kết cũ được chuyển hướng trong `app/routes/legacy-redirects.tsx`).
Màn chấm bài cuối khóa của quản lý là **MG-13** `/enterprise/team/final-reviews` (`features/pulse-manager/pages/PulseFinalReviewsPage.tsx`, mock `#/review`); tài liệu này là hợp đồng API của màn đó.

## Màn hình nhân viên (FE)

| ID | Đường dẫn | Trang |
|----|-----------|-------|
| EM-01 | `/enterprise/me` | Hôm nay |
| EM-02 | `/enterprise/me/path` | Lộ trình |
| EM-03 | `/enterprise/me/practice` | Thực hành (bài đánh giá trước khi học, bài cuối khóa + nhiệm vụ thực tế) |
| EM-05 | `/enterprise/me/courses/:courseId` | Tổng quan khóa |
| EM-06 | `/enterprise/me/courses/:courseId/modules/:moduleId` | Trang học mô đun + câu hỏi ôn tập |
| EM-07 | `/enterprise/me/courses/:courseId/final` | Bài cuối khóa (có giám sát) |
| EM-12 | `/enterprise/me/courses/:courseId/pre-assessment` | Đánh giá trước khi học (có giám sát) |
| EM-08 / EM-09 | `/enterprise/me/outcomes`, `/outcomes/:outcomeId` | Kết quả đã xác nhận |
| EM-10 / EM-11 | `/enterprise/me/activity`, `/profile` | Hoạt động, hồ sơ |

Vai trò: EMPLOYEE và MANAGER (quản lý tự học). Khung `PulseEmployeeLayout`, CSS riêng `features/pulse-employee/pulse.css`.
Dữ liệu: `services/pulse.service.ts` + `hooks/use-pulse.ts` (chưa có mock adapter cho `VITE_USE_MOCK=true`).

## Quy tắc nghiệp vụ (backend `UseCases/Pulse/Common/PulseRules.cs`)

- **Lĩnh vực** = nhóm năng lực có khóa PUBLISHED; **cấp khóa** = max `course_competencies.target_level`; **mục tiêu** = max `RequiredLevel` của bộ yêu cầu ACTIVE của vị trí.
- **Đánh giá trước khi học** (`course_pre_assessments`, thay bài đầu vào `capability_baselines`): xem đặc tả 2026-10-16.
- **Mức đã xác nhận** = max(cấp khóa được công nhận — qua bài đánh giá trước khi học hoặc bài cuối khóa, mức minh chứng thực tế được xác nhận).
- **Mô đun** = `course_modules`; trang = `lessons`; câu hỏi ôn tập = `assessments` QUIZ có `module_id`, phải đúng 2/2.
- **Câu hỏi ôn tập**: ngân hàng của mô đun gắn câu với trang theo `assessment_questions.sort_order` (câu 2k-1, 2k ↔ trang k).
  Mỗi lần làm rút 2 câu (`PulseQuizReader.Draw`: xếp ngẫu nhiên một lần theo nhân viên + bài, lần thứ n lấy nhóm câu kế tiếp,
  phương án trộn theo lần làm), nên `GET …/modules/{mid}` và lúc chấm thấy cùng một bộ câu. Chưa đạt: kết quả chỉ trả câu
  sai + trang liên quan (không có lời giải); lần tiếp theo chỉ mở khi mọi trang đó có `lesson_progress.last_accessed_at`
  sau thời điểm nộp (`POST …/pages/{lessonId}/viewed`). `GET` mô đun trả `quiz: null`, `review` và `quizBlockReason = REVIEW_REQUIRED`.
- **Suất học**: khóa Cơ bản miễn phí; cấp cao hơn cần suất (enrollment) — không có suất thì chỉ xem trước trang đầu.
- **Bài cuối khóa** (`course_final_submissions`): tối đa 2 lần. Lần 1 NOT_YET → chờ `cooldownHours`, nộp lại trong `deadlineDays`
  (system_settings `pulse.final_retry_policy`, mặc định `{"cooldownHours":48,"deadlineDays":7}`, theo tổ chức hoặc toàn hệ thống;
  chính sách được chụp vào bài nộp lúc chấm). Lần 2 NOT_YET hoặc quá hạn → cờ hỗ trợ.

## API quản lý — `api/v1/pulse/final-reviews`

Quyền: `task.evaluate` (DEPARTMENT_MANAGER; SYSTEM_ADMIN luôn qua). Phạm vi: `EmployeeScope` (quản lý = phòng của mình) **trừ chính mình** —
ngoài phạm vi → 404.

### `GET /pulse/final-reviews`

Hàng chờ: bài chờ chấm, đang trong cửa sổ nộp lại, quá hạn, cần hỗ trợ. Từ 2026-10-16 có cả bài đánh giá trước khi học
(`kind`, `recording`, `preAssessmentCount` — xem đặc tả 2026-10-16).

```jsonc
{
  "pendingCount": 1, "retryCount": 0, "deadlineMissedCount": 0, "flaggedCount": 1,
  "criteria": [{ "number": "01", "title": "Nguồn có thể truy vết", "description": "…" }],
  "items": [{
    "submissionId": "…",            // lần nộp mới nhất — dùng cho POST decision / support
    "status": "PENDING",            // PENDING | RETRY_WAIT | RETRY_READY | DEADLINE_MISSED | FLAGGED
    "employeeId": "…", "employeeName": "…", "departmentName": "…", "positionName": "…",
    "courseId": "…", "courseCode": "A1-F", "courseTitle": "…", "domainName": "…", "tier": 1,
    "attemptNo": 1, "maxAttempts": 2,
    "attempts": [{ "submissionId": "…", "attemptNo": 1, "evidenceText": "…", "submittedAt": "…",
                   "decision": null, "decisionReason": null, "reviewerName": null, "reviewedAt": null,
                   "retryOpensAt": null, "retryDueAt": null, "supportAction": null, "supportNote": null }],
    "aiHint": { "checks": [true, false, true], "summary": "…" }   // chỉ với PENDING; minh họa, chỉ tham khảo
  }]
}
```

### `POST /pulse/final-reviews/{submissionId}/decision`

```json
{ "decision": "PASSED", "reason": "Đạt đủ ba tiêu chí, nguồn rõ ràng." }
```

- `decision`: `PASSED` | `NOT_YET`; `reason` ≥ 10 ký tự (gửi cho nhân viên) → 400 nếu sai.
- Trả về `{ submissionId, decision, status: APPROVED | RETRY_WAIT | FLAGGED, enrollmentStatus, retryOpensAt, retryDueAt }`.
- PASSED: enrollment COMPLETED, mức đã xác nhận của lĩnh vực có thể tăng, cấp kế tiếp mở khi có suất.
- 409: bài đã có quyết định / không phải lần nộp mới nhất / vừa bị người khác cập nhật (tải lại hàng chờ).
- Ghi audit và gửi thông báo `PULSE_FINAL_DECIDED` cho nhân viên.

### `POST /pulse/final-reviews/{submissionId}/support`

```json
{ "action": "COACHING", "note": "Kèm cặp 2 buổi với kế toán trưởng." }
```

- `action`: `COACHING` (kèm cặp) | `FRESH_CYCLE` (chu kỳ học mới) | `PAUSE` (tạm dừng lộ trình); `note` tùy chọn.
- Chỉ cho bài FLAGGED hoặc DEADLINE_MISSED → nếu không 400 (`field: submissionId`).
- Trả về `{ submissionId, action, recordedAt }`; nhân viên thấy hướng hỗ trợ ở trang bài cuối khóa.

## API nhân viên — `api/v1/me/pulse` (tham khảo)

`GET overview` · `GET courses/{id}` · `GET courses/{id}/modules/{mid}` · `POST …/viewed`
· `POST …/modules/{mid}/pages/{lessonId}/viewed` · `POST …/quiz` (body `{ attemptNo, answers }`)
· `GET|POST courses/{id}/pre-assessment` · `GET|POST courses/{id}/final` · `POST courses/{id}/proctoring` + `proctoring/{sid}/…`
· `GET practice` · `GET outcomes` · `GET outcomes/{outcomeId}` (id dạng `pre-…`, `final-…`, `cert-…`, `task-…`).

Lỗi nghiệp vụ trả `errors[].message` là mã máy: `NO_POSITION`, `OUTSIDE_PATH`, `ABOVE_CEILING`, `SEAT_REQUIRED`,
`PRIOR_LEVEL_REQUIRED`, `PRE_ASSESSMENT_REQUIRED`, `PRE_ASSESSMENT_PENDING`, `PREVIOUS_MODULE_REQUIRED`, `SLIDES_NOT_VIEWED`, `REVIEW_REQUIRED` (chưa mở lại trang sau lần ôn tập
chưa đạt), `QUIZ_CHANGED` (câu trả lời thuộc bộ câu của lần làm khác — tải lại mô đun).

## Cơ sở dữ liệu

`docs/database/DigiTalent_AI_Canonical_v3_1.sql` (bổ sung v3_0): `assessments.module_id`, `capability_baselines`,
`capability_baseline_answers`, `course_final_submissions`. Migration `20261014141359_AddPulseEmployeeLearning`
(kèm `password_reset_tokens` còn thiếu migration từ PR #62). Seed Development: `PulseContentSeeder` (ngân hàng 6 câu ôn tập
cho từng mô đun; bài ôn tập cũ 2 câu được bổ sung đủ khi khởi động Development; ngân hàng 18 câu đầu vào không còn được tạo).
v3.3 (`DigiTalent_AI_Canonical_v3_3.sql`, migration `20261015205317_PulsePreAssessmentProctoring`): `proctoring_sessions`,
`proctoring_recordings`, `proctoring_events`, `course_pre_assessments`, `course_final_submissions.proctoring_session_id`.
