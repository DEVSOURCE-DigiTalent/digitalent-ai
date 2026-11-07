# Dùng thử doanh nghiệp: báo cáo tự động từ trắc nghiệm + AI tóm tắt + đề xuất trần năng lực

> **Trạng thái 2026-11-05: đã triển khai trên nhánh `feature/DT-trial-ai-report-roadmap`** (chưa commit). Khác với bản kế hoạch:
> - Schema thật ở `docs/database/DigiTalent_AI_Canonical_v3_6.sql`: `trial_reports` chỉ giữ gợi ý (`insights` jsonb, `ai_status`
>   PENDING/DONE/FALLBACK, `ai_model`, `ai_replaced`, `assessed_count`); số liệu và đề xuất phạm vi luôn tính lại. Bỏ
>   `ck_trial_workspaces_report`. Chưa làm `ai_variant` / `trial_report_events` (checklist §5, §7 — Q9).
> - AI chạy nền (hàng đợi trong tiến trình + quét lại), FE tự đọc lại khi PENDING. Chỉ A1 (ưu tiên) + A2 (lý do); A3–A6 chưa làm (Q10).
> - Mentor giữ việc chấm bài cuối khóa học thử (MT-03, PA-14 phân công); bỏ MT-01/MT-02 và mọi API chấm bài đánh giá.
> - Q1 giữ 1 câu mỗi ô. Ô chưa có câu ôn tập dùng câu chuẩn có id cố định, lưu vào DB (sửa lỗi bài không nộp được).
> - Chưa làm: nhập nhân sự thực tế (Q7), cập nhật đề xuất theo học thử (`POST /trial/roadmap/refresh`).

Ngày: 2026-11-04 · Nhánh: `feature/DT-trial-ai-report-roadmap` (theo `develop` 264aadc1) · Trạng thái: **KẾ HOẠCH v5 — chờ review, chưa code**
Workflow + mẫu UI: `docs/specs/mockups/2026-10-31-trial-ai-report-roadmap.html` (trang “Workflow” → bấm bước → “Mở mẫu”)
Nguồn nghiệp vụ: `QuyTD13/Luồng vận hành Digital AI.html` (GĐ I, II, phần III “Lý thuyết trần nhà”)
Nối tiếp: `docs/specs/2026-10-27-enterprise-trial-assessment.md` · Schema mới: `docs/database/DigiTalent_AI_Canonical_v3_6.sql`

---

## 0. Thay đổi v4 → v5

**Quyết định sản phẩm:** luồng dùng thử **bỏ bài tự luận (assignment)** → **không còn mentor** trong giai đoạn này. Vị trí năng lực và lộ
trình của doanh nghiệp chỉ dựa trên **kết quả bài test trắc nghiệm**.

| Trước (v4) | v5 |
|---|---|
| Mentor chấm 3 tự luận, chốt mức, AI soạn nháp → mentor sửa → công bố (MT-01/MT-02) | **Chấm tự động khi nộp** (`SuggestedLevel`); báo cáo **tự tạo khi đóng bài**; AI viết tóm tắt, **không người duyệt** |
| Stage `SETUP → REQUESTED → ASSIGNED → REPORTED` (chờ phân công mentor) | `SETUP → OPEN → REPORTED` (đóng bài = hết hạn · đủ bài · chủ DN bấm “Xem kết quả ngay”) |
| PA-14 phân công mentor | PA-14 chỉ theo dõi + xem / tạo lại tóm tắt AI |
| Đề 18 câu (1 câu / lĩnh vực × cấp) + 3 tự luận | Đề trắc nghiệm, đề xuất **3 câu / ô = 54 câu** (Q1) |

**Code hiện tại vẫn còn tự luận + mentor** (`TrialProgramRules.Essays`, `EssayLevel`, `ReviewTrialEssaysWithAi`, `MentorTrialsController`,
MT-01/02, PA-14 phân công, `trial_assessments.essay_*`). Việc gỡ chúng nằm trong kế hoạch này (§8 bước 0), xem Q3.

Nguyên tắc giữ nguyên: **con số do luật** (mức, trần đề xuất, suất, chi phí); **AI chỉ viết chữ**; **chủ DN quyết** trần ở OW-05; mua xong
`PurchaseCourseSeats` tự nâng trần.

**Thuật ngữ trên UI:** chữ “trần” chỉ dùng trong tài liệu và code (`capability_ceilings`, “Lý thuyết trần nhà”). Giao diện dùng:

| Khái niệm | Trên UI |
|---|---|
| Trần của 1 lĩnh vực | **Mức tối đa** (cờ / vạch cam; tooltip “Tối đa Trung cấp · 5/12 người chưa tới”) |
| Bảng 6 × 3 ô trong trần (OW-05, tên khối) | **Phạm vi đào tạo** |
| Nút OW-T1 → OW-05 | **Chọn phạm vi đào tạo →** · trên bản đồ: **Chỉnh phạm vi →** |
| Phương án | Phạm vi Tiết kiệm / Đề xuất / Đầy đủ |
| Phòng ban kế thừa / trần riêng | **↳ Theo doanh nghiệp** / **Phạm vi riêng** |
| `CEILING_ABOVE_ORGANIZATION` | “… vượt mức tối đa của doanh nghiệp” |
| Bước workflow / checkout | **Chọn phạm vi** · **Mở khóa học** |

Không dùng “mục tiêu” (đã chỉ mức yêu cầu theo vị trí, ~400 chỗ) và “chuẩn” (trùng Khung chuẩn TT02).

---

## 1. Workflow (5 làn × 9 bước — chi tiết từng bước trong file HTML)

| # | Bước | Chủ DN | Nhân viên | AI (Gemini) | Hệ thống | Quản trị nền tảng |
|---|---|---|---|---|---|---|
| 1 | Đăng ký | `/business/try` | | | | |
| 2 | Mời & hạn | OW-T1 *(sửa: bỏ giờ muốn chấm)* | | | email mời | PA-14 theo dõi *(sửa)* |
| 3 | Làm bài | | **EM-T1 trắc nghiệm** *(sửa: bỏ tự luận)* | | điểm rủi ro giám sát | |
| 4 | Chấm tự động | **OW-T1 theo dõi · Xem kết quả ngay** *(mới)* | | | **mức = cấp đạt liên tiếp ≥ 70 %** · **đóng bài** *(mới)* | |
| 5 | Báo cáo | **OW-T1 báo cáo phân tích** *(sửa)* | kết quả của mình | **✦ tóm tắt** *(mới)* | **Planner** *(mới)* | xem / tạo lại *(mới)* |
| 6 | Học thử | | EM-02 | **✦ cập nhật đề xuất** *(mới)* | tiến độ, quiz mô-đun | |
| 7 | Chọn phạm vi | **OW-05** *(sửa)* | | | luật phạm vi (PB ≤ DN ≤ 3) | |
| 8 | Ký & trả | **OW-CHECKOUT** *(sửa)* | | | | theo dõi chuyển đổi |
| 9 | Kích hoạt | | EM-02 học TC/NC | | `PurchaseCourseSeats` nâng trần | |

---

## 2. Bản đồ tích hợp: màn → file → thay đổi

| Màn | File | Thay đổi | Mức |
|---|---|---|---|
| **EM-T1** Bài test | `trial-program/pages/TrialTestPage.tsx`, `components/TrialExam.tsx`; BE `TrialAssessmentPaper`, `SubmitMyTrialAssessment` | Bỏ phần 3 bài tự luận; đề = `ChoicePerCell` câu mỗi ô (Q1); trang kết quả chỉ còn trắc nghiệm theo lĩnh vực × cấp | vừa |
| **OW-T1** Đánh giá đội ngũ | `TrialProgramPage.tsx`, `components/TrialUi.tsx` + mới `components/report/{ReportKpis,CompetencyMap,CorrectByTier,MissedQuestions,LevelStack,DeptHeatmap,SubmitProgress}.tsx` | **Đang làm bài:** thẻ theo dõi (đã nộp / đang làm / chưa bắt đầu, hạn) + **biểu đồ tiến độ theo phòng ban** + **“Xem kết quả ngay”** (≥ 1 bài); bỏ “giờ mong muốn chấm”. **Có kết quả:** đầu trang nền tối (vòng điểm, cấp hiện tại, 2 số) + **✦ Ưu tiên** (3 lĩnh vực, lý do ≤ 8 từ, nhãn “AI · N bài”, dữ liệu mỏng, bài rủi ro cao) · **Bản đồ năng lực** (hiện tại → mức tối đa, 3 giai đoạn, số ưu tiên, phạm vi DN/phòng ban, phương án Tiết kiệm/Đề xuất/Đầy đủ) · **Câu sai nhiều nhất** · Mức TB theo phòng ban · *Chi tiết theo cấp* (đóng sẵn: Tỷ lệ câu đúng, Số người theo mức) · dải `SetupFramework` có 3 số + “Chọn phạm vi đào tạo →” OW-05. Chuyển động khi mở báo cáo (1 lần, tôn trọng `prefers-reduced-motion`). Thay radar + câu mẫu | lớn |
| **OW-05** Kiến trúc năng lực số | `organization/components/CapabilityCeilingMatrix.tsx` | Nguồn gợi ý **[✦ Theo test] [Theo vị trí]**, đổi tên khối “Trần năng lực số” → **Phạm vi đào tạo**, 3 phương án, bộ chọn mức tối đa mỗi dòng + vạch cam, suất + tiền trong ô, panel ai cần học, nhân sự thực tế, **biểu đồ chi phí theo lĩnh vực** (TC/NC, đổi ngay khi chỉnh), “Cập nhật theo học thử”, thanh mua có chênh lệch + ↺ | lớn |
| **OW-CHECKOUT** | `organization/pages/CourseCheckoutPage.tsx` | `?courses=M1-I:8,M2-A:11` (suất riêng từng khóa) + thanh tỷ trọng chi phí Trung cấp / Nâng cao | nhỏ |
| PA-14 | `PlatformTrialsPage.tsx` | Bỏ phân công mentor; cột Đã nộp / Báo cáo / Lộ trình; xem tóm tắt AI, nút “Tạo lại” | vừa |
| MT-01, MT-02, MT-03 (phần dùng thử) | `MentorTrials*`, `PulseReviewScope` | **Gỡ khỏi luồng dùng thử** (Q3, Q4) | vừa |

---

## 3. Luật (thuần, unit test)

**Mức lĩnh vực** (có sẵn, `TrialProgramRules.SuggestedLevel`): cấp cao nhất mà mọi cấp từ CB tới đó đều đúng ≥ 70 % số câu của cấp. Là **mức
cuối cùng** (bỏ `mentor_level`, `EssayLevel`). Với 1 câu/ô thì một câu sai là rớt cấp → Q1 đề xuất 3 câu/ô (đạt = ≥ 3/3? hay ≥ 2/3, Q1).

**`TrialCeilingPlanner`** (`Application/UseCases/TrialProgram/Common/`):
1. Trần đề xuất DN: > 50 % chưa đạt CB hoặc trung vị = 0 → 1; còn lại `min(3, trung vị + 1)`; max với yêu cầu vị trí nếu có. Trần PB chỉ khi lệch DN ≥ 1; **PB ≤ DN ≤ 3**.
2. Ô lộ trình: `mức < k ≤ trần hiệu lực`; ô đã đạt không tính suất.
3. Suất (+ ước tính nhân sự chưa làm bài, học từ CB) × đơn giá catalog − suất đã mua; CB miễn phí.
4. Phương án Tiết kiệm / Đề xuất / Đầy đủ. Độ tin cậy: TC/NC = ◔.
5. Bài có rủi ro giám sát HIGH: **vẫn tính**, đánh dấu trong báo cáo (Q5).

**Đóng bài** (`TrialProgramRules`): hết `test_deadline`, hoặc mọi người được mời đã nộp, hoặc chủ DN đóng sớm. Kiểm tra khi đọc `GET /trial`
(lazy, như hạn dùng thử cá nhân), không cần job nền. Đóng → `report_published_at = now`, tạo `trial_reports`, thông báo chủ DN + nhân viên.

---

## 4. AI (không có người duyệt → rào chắn chặt hơn)

| Lời gọi | Khi nào | Vào (ẩn danh) | Ra |
|---|---|---|---|
| `GenerateTrialSummaryAsync` | ngay khi đóng bài (trong use case đóng bài; lỗi AI không chặn đóng bài) | % đúng theo cấp × lĩnh vực × phòng ban, phân bố mức, **câu sai nhiều nhất** mỗi lĩnh vực (nội dung câu, không đáp án), số bài rủi ro cao, kết quả planner | JSON ngắn, **không đoạn văn**: `priorities[3]{domain, why}`, `ceilingReasons[6]` (mỗi chuỗi ≤ 8 từ) |
| `RefreshTrialRoadmapAsync` | OW-05 “Cập nhật theo học thử” (1 lần/24 h) | + tiến độ, điểm quiz mô-đun 6 khóa CB | trần đề xuất mới + lý do (hiện ▲▼, chủ DN bấm Áp dụng) |

Hiện trong UI, không có khối chữ: `priorities` → khối **✦ Ưu tiên** cạnh KPI (bấm = làm nổi hàng trên bản đồ) + số ①②③ trên bản đồ;
`ceilingReasons` → 1 dòng ✦ trong tooltip bản đồ và trong ô chọn ở OW-05. Bỏ `overview` / nhận xét 6 lĩnh vực.

Rào chắn: (0) prompt yêu cầu ≤ 8 từ, chuỗi > 10 từ (âm tiết) → câu mẫu; (1) **mọi con số** trong câu AI (%, x/y, mức) phải có trong ngữ cảnh — không khớp → thay câu đó bằng câu mẫu; (2) thiếu lĩnh vực → câu
mẫu; (2b) lý do mức tối đa không dẫn số liệu của luật (con số, “trung vị”, “quá nửa”) → câu mẫu (`NO_DATA`); (3) không có khóa / AI lỗi → toàn bộ câu mẫu (`content_source = TEMPLATE`), báo cáo vẫn hiện đủ số liệu + biểu đồ; (4) nhãn “✦ AI · từ N
bài trắc nghiệm” luôn hiện; (5) PA-14 “Tạo lại”.

**Đo hiệu quả:** checklist 4 cổng (an toàn → chất lượng so với câu mẫu → hiệu quả trên người dùng → vận hành) ở
`docs/specs/2026-11-05-trial-ai-effectiveness-checklist.md`. Mỗi đầu ra AI bật / tắt riêng (`Assistant:TrialReport:*`); câu mẫu là nhóm đối chứng.

---

## 5. API

| Method · Route | Quyền | Use case |
|---|---|---|
| `GET /trial` *(sửa)* | `trial.manage` | + đóng bài lazy; `stage` OPEN/REPORTED; `submitted/active/notStarted` + theo phòng ban; `report.ai` (`priorities`, `ceilingReasons`, `source` AI|TEMPLATE), `report.suggestionSummary`, `report.correctByTier` (% đúng lĩnh vực × cấp), `report.mostMissed` (1 câu / lĩnh vực: nội dung, số người sai) |
| `POST /trial/close` | `trial.manage` | `CloseTrialAssessment` — `TRIAL_NO_SUBMISSION`, `TRIAL_ALREADY_CLOSED` |
| `PUT /trial/request` *(sửa)* | `trial.manage` | bỏ `preferredReviewAt`; không báo nền tảng / mentor |
| `GET /trial/roadmap` | `trial.manage` | trần đề xuất DN/PB + lý do, 3 phương án, suất/chi phí từng ô, độ tin cậy, nhân sự |
| `PUT /trial/roadmap/headcounts` | `trial.manage` | nhân sự thực tế |
| `POST /trial/roadmap/refresh` | `trial.manage` | `ROADMAP_REFRESH_TOO_SOON`, `ROADMAP_NO_LEARNING_YET` |
| `POST /platform/trials/{org}/report/regenerate` | `platform.trial.manage` | tạo lại tóm tắt AI |
| `GET /me/trial-assessment`, `POST …` *(sửa)* | | bỏ tự luận |
| Gỡ: `PUT /platform/trials/{org}/mentor`, `/mentor/trials/*` (dùng thử) | | Q3 |
| `PUT /capability-ceilings/*`, mua suất | có sẵn | không đổi |

---

## 6. Dữ liệu — schema v3.6

```sql
-- 23.1. Báo cáo dùng thử tự tạo khi đóng bài. Một dòng / DN.
CREATE TABLE trial_reports (
    id                   uuid PRIMARY KEY,
    organization_id      uuid NOT NULL REFERENCES organizations(id),
    content              jsonb NOT NULL,          -- priorities[3]{domain,why}, ceilingReasons[6]
    content_source       varchar(20) NOT NULL,    -- AI | TEMPLATE (thực tế đã hiện)
    ai_variant           varchar(20) NOT NULL,    -- AI | TEMPLATE: nhóm thử, gán ngẫu nhiên 1 lần (checklist §5)
    ai_model             varchar(100),
    assessed_count       smallint NOT NULL,       -- số bài dùng để tạo
    suggested_ceilings   jsonb NOT NULL,          -- [{departmentId|null, categoryId, level}] từ planner
    refreshed_ceilings   jsonb,                   -- AI cập nhật sau học thử
    refreshed_at         timestamptz,
    headcounts           jsonb,                   -- {departmentId: n}
    generated_at         timestamptz NOT NULL,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_trial_reports_source  CHECK (content_source IN ('AI', 'TEMPLATE')),
    CONSTRAINT ck_trial_reports_variant CHECK (ai_variant IN ('AI', 'TEMPLATE')),
    CONSTRAINT ck_trial_reports_tpl     CHECK (ai_variant = 'AI' OR content_source = 'TEMPLATE'),
    CONSTRAINT ck_trial_reports_model   CHECK ((content_source = 'AI') = (ai_model IS NOT NULL)),
    CONSTRAINT ck_trial_reports_refresh CHECK ((refreshed_ceilings IS NULL) = (refreshed_at IS NULL))
);
CREATE UNIQUE INDEX uq_trial_reports_organization ON trial_reports(organization_id);

-- 23.1b. Sự kiện đo hiệu quả AI (checklist §7). Không chứa câu trả lời, tên, email.
CREATE TABLE trial_report_events (
    id                   uuid PRIMARY KEY,
    organization_id      uuid NOT NULL REFERENCES organizations(id),
    report_id            uuid NOT NULL REFERENCES trial_reports(id),
    variant              varchar(20) NOT NULL,
    event                varchar(40) NOT NULL,
    payload              jsonb,
    created_at           timestamptz NOT NULL DEFAULT now(),
    updated_at           timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_trial_report_events_variant CHECK (variant IN ('AI', 'TEMPLATE'))
);
CREATE INDEX ix_trial_report_events_report ON trial_report_events(report_id, event, created_at);

-- 23.2. trial_workspaces: preferred_review_at, mentor_user_id, mentor_assigned_at không còn dùng cho luồng mới (giữ cột, Q3).
-- 23.3. trial_assessments: essay_* , review_*, ai_essay_review không còn ghi cho bài mới (giữ cột để không mất dữ liệu cũ).
--       trial_assessment_domains.mentor_level không còn ghi; mức = suggested_level.
```

Trần thật chỉ ở `capability_ceilings`. Entity `TrialReport`, `TrialReportEvent`, DbSet ở 2 file, migration `AddTrialReports`. Ghi sự kiện: `POST /trial/report/events` (quyền `trial.manage`, chỉ nhận tên sự kiện trong danh sách).

---

## 7. Mã lỗi

`TRIAL_NO_SUBMISSION` · `TRIAL_ALREADY_CLOSED` · `ROADMAP_REFRESH_TOO_SOON` · `ROADMAP_NO_LEARNING_YET` · `CEILING_ABOVE_ORGANIZATION` (có).

---

## 8. Thứ tự làm

| # | Việc | Ước lượng |
|---|---|---|
| 0 | Gỡ tự luận + mentor khỏi luồng dùng thử (BE paper/submit/stage, FE EM-T1, PA-14, ẩn MT cho dùng thử); `ChoicePerCell` theo Q1; sửa test | 0,75 ngày |
| 1 | SQL v3.6 + entity + migration `AddTrialReports` | 0,25 |
| 2 | Đóng bài (lazy + `POST /trial/close`) + `TrialCeilingPlanner` + đơn giá catalog (Q6) + unit test | 0,75 |
| 3 | `TrialReportContextBuilder` + Gemini (tóm tắt, refresh) + rào chắn số liệu | 0,5 |
| 4 | Use cases roadmap + regenerate + sửa `GET /trial` + test | 0,5 |
| 5 | FE OW-T1 (theo dõi + báo cáo phân tích: KPI + ✦ Ưu tiên, bản đồ, 2 biểu đồ, chi tiết đóng sẵn) | 1 |
| 6 | FE OW-05 phần dùng thử, OW-CHECKOUT `:n`, PA-14, mock | 1 |
| 6b | **Đổi chữ “trần” toàn sản phẩm** theo bảng thuật ngữ §0 (Q8 đã chốt). Chỉ chữ người dùng thấy; tên code, API, bảng `capability_ceilings`, mã lỗi giữ nguyên. Danh sách ở §8.1 | 0,5 |
| 6c | Đo hiệu quả AI: bộ vàng 30 DN + script `tools/trial-ai-eval` + test Cổng 1 (xUnit) + ghi sự kiện + chia nhóm + cờ bật/tắt từng đầu ra (checklist) | 0,75 |
| 7 | Cập nhật spec 2026-10-27, `CLAUDE.md`; build/test hai phía; chạy luồng owner@ → nhân viên làm bài → báo cáo → OW-05 → checkout | 0,25 |

Tổng ≈ 6,25 ngày (chưa tính thời gian chuyên gia chấm bộ vàng).

### 8.1 Bước 6b — chỗ cần đổi chữ (quét develop, ~44 file có chữ “trần”)

| Nhóm | File | Ghi chú |
|---|---|---|
| OW-05 | `organization/components/CapabilityCeilingMatrix.tsx` (28), `capability-ceiling.css` (1, chỉ chú thích) | tên khối, cột, chú giải, nút kế thừa |
| Mua khóa | `organization/pages/CourseCheckoutPage.tsx` (4), `OwnerCourseCatalogPage.tsx` (1) | “Kích hoạt trần” → “Mở khóa học” |
| Chủ DN khác | `OwnerSetupBlueprintPage.tsx`, `OwnerProcessTrack.tsx`, `OwnerOverviewHero.tsx`, `PositionMapping.tsx` | bước “③ Phạm vi đào tạo” |
| Thông báo lỗi | `lib/organization-errors.ts` (3) | xem câu mới bên dưới |
| Cổng nhân viên | `pulse-employee/components/roadmap.tsx` (3), `lib/course-state.ts` (3), `services/pulse.service.ts` (2) | huy hiệu “🔒 Trần” → “🔒 Ngoài phạm vi”; “Giới hạn trần năng lực của phòng ban” → “Ngoài phạm vi đào tạo của phòng ban” |
| Hướng dẫn | `onboarding-tutorial/tutorial-configs.ts` (2) | |
| Trang giới thiệu | `public/pulse-landing/PulseBusinessLandingPage.tsx` (2), `PulseBusinessSolutionPage.tsx` (1) | “trần năng lực” → “phạm vi đào tạo”, “Trần Năng lực Doanh nghiệp” → “Phạm vi đào tạo doanh nghiệp” |
| Mock | `services/mock/server/handlers/ceilings.ts` (10), `types.ts`, `handlers/platform.ts`, `services/capability-ceiling.service.ts` | thông báo của mock |
| Backend | `UpdateOrganizationCeilingsUseCase.cs:115`, `UpdateDepartmentCeilingsUseCase.cs:108` | nhãn nhật ký kiểm tra: “Phạm vi đào tạo doanh nghiệp / phòng ban …”. Các chỗ còn lại là chú thích `///`, giữ |
| Test | `PulseEmployeePortal.test.tsx` (2), `BusinessLandingPage.test.tsx` (1), `ceilings-api.test.ts` (1) | sửa chữ mong đợi |

Câu mới cho thông báo lỗi (`lib/organization-errors.ts`):

| Mã | Câu mới |
|---|---|
| `CEILING_ABOVE_ORGANIZATION` | Mức tối đa của phòng ban không được cao hơn của doanh nghiệp. |
| `ORGANIZATION_CEILING_REQUIRED` | Lưu phạm vi đào tạo của doanh nghiệp trước, rồi mới chỉnh phòng ban. |
| `CEILINGS_INCOMPLETE` | Chọn mức tối đa cho cả 6 lĩnh vực. |
| `CATEGORY_NOT_IN_MATRIX` | Lĩnh vực không thuộc phạm vi đào tạo. |

Kiểm tra xong bước: `grep -rn "[Tt]rần" frontend/src` chỉ còn tên người mẫu (vd. “Trần Thị B”) và chú thích code.

---

## 9. Cần quyết

1. **Q1 — Số câu:** mỗi ô lĩnh vực × cấp 1 câu (18 câu, hiện tại) hay **3 câu (54 câu, đề xuất)**? Ngưỡng đạt một cấp với 3 câu: ≥ 2/3 (≈ 70 %) hay 3/3?
2. **Q2 — AI không người duyệt:** hiện thẳng tóm tắt AI cho chủ DN (có rào chắn số liệu + nhãn ✦ AI + PA-14 tạo lại) — đồng ý?
3. **Q3 — Gỡ code mentor/tự luận** làm luôn trong nhánh này (đề xuất, bước 0) hay một nhánh riêng trước? Giữ role MENTOR cho việc khác không?
4. **Q4 — Bài cuối khóa khi học thử 6 khóa CB** (hiện mentor chấm ở MT-03): bỏ bài cuối khóa trong học thử, hay quản lý DN chấm như học chính thức? Bước “cập nhật theo học thử” hiện chỉ dùng tiến độ + quiz mô-đun.
5. **Q5 — Bài rủi ro giám sát cao:** vẫn tính + đánh dấu (đề xuất), hay cho chủ DN bấm loại khỏi thống kê?
6. **Q6 — Đơn giá:** thay số cứng 399 000 / 699 000 bằng `PricePerSeat` của catalog?
7. **Q7 — Nhân sự chưa làm bài:** cho nhập số thực tế (tính học từ CB)?
8. ~~Q8 — Phạm vi đổi chữ “trần”~~ → **Đã chốt: toàn sản phẩm** (bước 6b, §8.1).
9. **Q9 — Đo hiệu quả AI:** ai là 2 người chấm bộ vàng? Chốt ngưỡng ở checklist (đề xuất) và chỉ số chính “bấm Chọn phạm vi đào tạo trong 7 ngày”?
10. **Q10 — Đầu ra AI:** đổi A3 thành “luật tính số, AI chỉ giải thích”; thêm A4 (gom câu sai thành chủ đề), A5 (“Học trước” mô-đun), A6 (đánh dấu bất thường)?
