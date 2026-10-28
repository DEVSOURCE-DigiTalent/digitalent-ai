# Dùng thử doanh nghiệp: đánh giá năng lực có mentor chấm

Ngày: 2026-10-27 · Nhánh: `feature/DT-trial-assessment-flow` · Schema: `docs/database/DigiTalent_AI_Canonical_v3_5.sql`

## Luồng

| Bước | Ai | Màn hình | API |
|---|---|---|---|
| 1. Thông tin doanh nghiệp | Khách | `/business/try` → `/business/try/verify` (mã 6 số) | `/enterprise-trial/register`, `/verify-code` (giữ nguyên) |
| 2. Mời nhân viên, đặt hạn | Chủ DN | OW-T1 `/enterprise/trial` | `POST /trial/participants`, `PUT /trial/request` |
| 3. Phân công mentor | Quản trị nền tảng | PA-14 `/platform/trials` | `GET /platform/trials`, `PUT /platform/trials/{orgId}/mentor`, `GET/POST /platform/mentors` |
| 4. Làm bài có giám sát | Nhân viên | EM-T1 `/enterprise/me/trial-test`, EM-T2 `…/exam` | `GET /me/trial-assessment`, `POST …/proctoring`, `POST /me/trial-assessment` (+ `/me/pulse/proctoring/{sid}/…` để tải bản ghi) |
| 5. Chấm, công bố | Mentor | MT-01 `/platform/reviews`, MT-02 `/platform/reviews/{orgId}` | `GET /mentor/trials[/{orgId}]`, `PUT …/assessments/{id}`, `POST …/publish` |
| 6. Bảng năng lực, học thử | Chủ DN / nhân viên | OW-T1 (bảng), EM-T1 (mức của mình) → lộ trình Pulse | — |

Bước của doanh nghiệp suy ra từ `trial_workspaces`: `SETUP` (chưa gửi) → `REQUESTED` → `ASSIGNED` (có mentor) → `REPORTED`.

## Quy tắc

- **Nhân viên**: tối đa 30 / doanh nghiệp. Mỗi dòng = họ tên, email, phòng ban, vị trí (nhập tay hoặc file `.xlsx` / `.csv`).
  Phòng ban / vị trí tìm theo tên, chưa có thì tạo (`PB01…`, `VT01…`). Lời mời dùng cơ chế mời thành viên
  (`member_invitations`, email có link `/activate/{token}`, kèm dòng hạn làm bài).
- **Yêu cầu chấm**: hạn làm bài sau ít nhất 30 phút, trong 60 ngày; giờ mong muốn chấm ≥ hạn làm bài; cần ít nhất một
  nhân viên. Lần gửi đầu báo cho quản trị nền tảng; đổi lịch sau đó báo cho mentor (nếu có).
- **Đề tổng hợp**: với mỗi cấp (Cơ bản → Trung cấp → Nâng cao) × mỗi lĩnh vực, 1 câu trắc nghiệm rút từ ngân hàng ôn tập
  của khóa chuẩn ở ô đó (18 câu với dữ liệu đủ), cố định theo nhân viên; 3 bài tự luận (một bài mỗi cấp, ≥ 30 ký tự).
  Một lần làm. Phòng thi như bài Pulse: toàn bộ màn hình + camera + micro, nhật ký và nhận diện khuôn mặt trên máy.
- **Chấm tự luận**: mentor cho mỗi bài tự luận 0–10 điểm (đạt từ 5; `trial_assessments.essay_*_score`), bắt buộc đủ ba
  bài mới lưu được (`TRIAL_ESSAY_SCORES_INCOMPLETE`). **AI hỗ trợ** (Gemini, `POST /mentor/trials/{org}/assessments/{id}/ai-review`):
  mở bài chưa có gợi ý thì AI tự đọc ba bài một lần, trả điểm 0–10 + nhận xét từng bài + một câu chung, lưu ở
  `ai_essay_review` (jsonb); mentor bấm "Dùng điểm AI" hoặc tự chọn điểm. Không có khóa → `AI_NOT_CONFIGURED`, trang ghi
  "AI chưa được cấu hình", không có điểm giả. Khóa: `Gemini:ApiKey`, không có thì `Assistant:ApiKey` (= `ASSISTANT_API_KEY`
  trong .env) khi trợ lý chạy Gemini, rồi `GEMINI_API_KEY` / `GOOGLE_API_KEY`; gửi qua header `x-goog-api-key`.
- **Mức gợi ý** mỗi lĩnh vực = min(cấp đạt liên tiếp từ Cơ bản ở trắc nghiệm (≥ 70% số câu của cấp), số bài tự luận đạt
  liên tiếp từ Cơ bản) — chưa chấm đủ tự luận thì chỉ theo trắc nghiệm; cập nhật ngay khi mentor cho điểm. Mentor quyết
  định mức 0–3 (0 = chưa đạt Cơ bản) cho mọi lĩnh vực, kèm nhận xét; chấm lại được tới khi công bố.
- **Công bố**: khi có ≥ 1 bài và mọi bài đã nộp đều đã chấm. Bài chưa nộp đóng lại. Chủ DN thấy phân bố mức theo lĩnh vực
  và mức từng nhân viên; nhân viên thấy mức của mình.
- **Học thử**: sau công bố, mọi lĩnh vực mở cấp Cơ bản (mục tiêu = trần = 1), bài đánh giá tổng hợp thay cho bài đánh
  giá trước khi học. Trang **Học thử** (`TrialLearning`, ở EM-02 `/enterprise/me/path`; EM-01 chuyển về đây) chỉ có tiêu
  đề "6 khóa Cơ bản để trải nghiệm", số khóa đã xong và 6 thẻ khóa (lĩnh vực, tên, số mô-đun / % đã học, nút học) —
  không có bản vẽ lộ trình. Menu nhân viên dùng thử: Học thử / Bài test ("Kết quả test" khi đã công bố) / Thực hành.
- **Cảnh báo trước khi có kết quả** (`trialGateOf`: `todo` / `waiting` / `closed`): trang Học thử hiện 6 khóa "Chưa mở"
  kèm thẻ "Làm bài test trước khi học" (nút Làm bài test, hạn nộp) hoặc "Đang chờ mentor chấm bài" (lúc nộp) hoặc "Bài
  test đã đóng" (quá hạn, chưa nộp). Các trang học khác (khóa học, thực hành, kết quả) hiện thẻ cảnh báo đó thay nội dung;
  vào cổng `/enterprise/me` tới thẳng bài test; hồ sơ, hoạt động vẫn mở.
- **Menu chủ DN khi dùng thử**: chỉ "Dùng thử" (OW-T1: mời nhân viên, hạn làm bài, bảng năng lực) và "Học thử". Chưa tham
  gia → OW-T2 `/enterprise/trial/learning`: cảnh báo "Làm bài test trước khi học" + ô Phòng ban / Vị trí + "Tham gia làm
  bài test" (sau công bố: "Tham gia học thử"), 6 khóa đang khóa, dải mua khóa. Đã tham gia → EM-02 như nhân viên (bài
  test, khóa học, trang mua khóa đều sáng mục Học thử).
- **Mua khóa** (chỉ chủ DN): nút "Mua khóa học" → OW-23 `/enterprise/courses?level=2` (danh mục khóa chuẩn lọc sẵn
  Trung cấp, mua suất từng khóa). Nằm ở hai chỗ: thẻ nổi bật trên OW-T1 ngay khi có bảng năng lực (gợi ý hai lĩnh vực
  thấp nhất dưới Trung cấp) và dải cuối trang Học thử. Nhân viên chỉ thấy "Trung cấp, Nâng cao mở khi doanh nghiệp mua khóa".

## Ai chấm, ai làm bài

- **Chỉ mentor DigiTalent được phân công chấm** mọi bài của doanh nghiệp dùng thử: bài đánh giá tổng hợp (MT-02) và bài
  cuối khóa khi nhân viên học thử (MT-03 `/platform/course-reviews`, dùng lại màn "Chấm bài" với `audience="mentor"`).
  `PulseReviewScope`: mentor thấy nhân viên của doanh nghiệp được giao; chủ doanh nghiệp / quản lý trong doanh nghiệp dùng
  thử không thấy bài nào. Thông báo bài nộp và "người chấm" hiển thị cho nhân viên đều là mentor (chưa phân công → không ai).
- **Chủ doanh nghiệp tùy chọn tham gia** (`POST /trial/me/join` {department, position}): tạo hồ sơ nhân viên + thêm role
  EMPLOYEE cho chính tài khoản đó (FE làm mới token rồi `/auth/me`). Chủ doanh nghiệp làm bài như nhân viên, được mentor
  chấm, có tên trong bảng năng lực ("(bạn)"), rồi học thử khóa Cơ bản; menu có thêm "Bài test & học thử". Một lần.

## Role MENTOR

Nhân sự nền tảng, không thuộc tổ chức (`/auth/me` workspace = `platform`), quyền `trial.review` + tài khoản cá nhân.
Chỉ thấy doanh nghiệp được phân công. Quản trị nền tảng tạo tài khoản mentor ở PA-14 (`platform.trial.manage`).
Demo: `mentor@digitalent.ai` / `Admin@1234`. Chủ DN có `trial.manage`.

## Dữ liệu (v3.5)

`trial_workspaces` + `test_deadline`, `preferred_review_at`, `request_note`, `requested_at`, `mentor_user_id`,
`mentor_assigned_at`, `report_published_at`; `trial_assessments` (một bài / nhân viên); `trial_assessment_domains`
(đúng / tổng theo cấp, mức gợi ý, mức mentor); `proctoring_sessions.course_id` NULL với kind `TRIAL_ASSESSMENT`;
`exam_choice_answers.trial_assessment_id`. Migration `AddTrialAssessmentFlow`.

## Còn lại

- Luồng dùng thử cũ (`TrialService`: chọn vị trí, chẩn đoán, lộ trình, chuyển đổi) vẫn còn API nhưng không còn giao diện.
- Giới hạn 14 ngày (`trial_workspaces.ends_at`) không chặn luồng mới.
- Trang lộ trình Pulse vẫn dùng chữ của luồng thường (ví dụ "0 năng lực yêu cầu" vì vị trí dùng thử chưa có bộ yêu cầu).
