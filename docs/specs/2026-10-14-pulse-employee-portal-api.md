# Pulse — cổng nhân viên & API chấm bài cuối khóa

Ngày: 2026-10-14 · Đặc tả gốc: `docs/ui-redesign/16-pulse-product-flow-detailed.md`, mock `docs/ui-redesign/14-pulse-product-site/index.html`.

Cổng nhân viên Pulse thay các màn EM-01..EM-18 cũ (liên kết cũ được chuyển hướng trong `app/routes/legacy-redirects.tsx`).
Màn chấm bài cuối khóa của quản lý **chưa có UI** — tài liệu này là hợp đồng API cho người làm màn đó.

## Màn hình nhân viên (FE)

| ID | Đường dẫn | Trang |
|----|-----------|-------|
| EM-01 | `/enterprise/me` | Hôm nay |
| EM-02 | `/enterprise/me/path` | Lộ trình |
| EM-03 | `/enterprise/me/practice` | Thực hành (bài cuối khóa + nhiệm vụ thực tế) |
| EM-04 | `/enterprise/me/baseline` | Bài kiểm tra đầu vào |
| EM-05 | `/enterprise/me/courses/:courseId` | Tổng quan khóa |
| EM-06 | `/enterprise/me/courses/:courseId/modules/:moduleId` | Trang học mô đun + câu hỏi ôn tập |
| EM-07 | `/enterprise/me/courses/:courseId/final` | Bài cuối khóa |
| EM-08 / EM-09 | `/enterprise/me/outcomes`, `/outcomes/:outcomeId` | Kết quả đã xác nhận |
| EM-10 / EM-11 | `/enterprise/me/activity`, `/profile` | Hoạt động, hồ sơ |

Vai trò: EMPLOYEE và MANAGER (quản lý tự học). Khung `PulseEmployeeLayout`, CSS riêng `features/pulse-employee/pulse.css`.
Dữ liệu: `services/pulse.service.ts` + `hooks/use-pulse.ts` (chưa có mock adapter cho `VITE_USE_MOCK=true`).

## Quy tắc nghiệp vụ (backend `UseCases/Pulse/Common/PulseRules.cs`)

- **Lĩnh vực** = nhóm năng lực có khóa PUBLISHED; **cấp khóa** = max `course_competencies.target_level`; **mục tiêu** = max `RequiredLevel` của bộ yêu cầu ACTIVE của vị trí.
- **Đầu vào** (`capability_baselines`): làm một lần, mức Lk chỉ ghi khi đúng liên tiếp L1..Lk; không đổi về sau.
- **Mức đã xác nhận** = max(đầu vào, cấp khóa được duyệt, mức minh chứng thực tế được xác nhận).
- **Mô đun** = `course_modules`; trang = `lessons`; câu hỏi ôn tập = `assessments` QUIZ có `module_id`, phải đúng 2/2.
- **Suất học**: khóa Cơ bản miễn phí; cấp cao hơn cần suất (enrollment) — không có suất thì chỉ xem trước trang đầu.
- **Bài cuối khóa** (`course_final_submissions`): tối đa 2 lần. Lần 1 NOT_YET → chờ `cooldownHours`, nộp lại trong `deadlineDays`
  (system_settings `pulse.final_retry_policy`, mặc định `{"cooldownHours":48,"deadlineDays":7}`, theo tổ chức hoặc toàn hệ thống;
  chính sách được chụp vào bài nộp lúc chấm). Lần 2 NOT_YET hoặc quá hạn → cờ hỗ trợ.

## API quản lý — `api/v1/pulse/final-reviews`

Quyền: `task.evaluate` (DEPARTMENT_MANAGER; SYSTEM_ADMIN luôn qua). Phạm vi: `EmployeeScope` (quản lý = phòng của mình) **trừ chính mình** —
ngoài phạm vi → 404.

### `GET /pulse/final-reviews`

Hàng chờ: bài chờ chấm, đang trong cửa sổ nộp lại, quá hạn, cần hỗ trợ.

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

`GET overview` · `GET|POST baseline` · `GET courses/{id}` · `GET courses/{id}/modules/{mid}` · `POST …/viewed` · `POST …/quiz`
· `GET|POST courses/{id}/final` · `GET practice` · `GET outcomes` · `GET outcomes/{outcomeId}` (id dạng `final-…`, `cert-…`, `task-…`).

Lỗi nghiệp vụ trả `errors[].message` là mã máy: `NO_POSITION`, `NOT_ASSESSED`, `OUTSIDE_PATH`, `SEAT_REQUIRED`,
`PRIOR_LEVEL_REQUIRED`, `PREVIOUS_MODULE_REQUIRED`, `SLIDES_NOT_VIEWED`.

## Cơ sở dữ liệu

`docs/database/DigiTalent_AI_Canonical_v3_1.sql` (bổ sung v3_0): `assessments.module_id`, `capability_baselines`,
`capability_baseline_answers`, `course_final_submissions`. Migration `20261014141359_AddPulseEmployeeLearning`
(kèm `password_reset_tokens` còn thiếu migration từ PR #62). Seed Development: `PulseContentSeeder` (18 câu đầu vào,
câu hỏi ôn tập cho từng mô đun).
