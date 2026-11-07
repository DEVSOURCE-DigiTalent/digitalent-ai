# Evidence — Báo cáo năng lực dùng thử có AI

Nhánh `feature/DT-trial-ai-report-roadmap` · chạy ngày 05/11/2026 · 32 ảnh chụp từ hệ thống thật (backend + PostgreSQL + Gemini), không dùng dữ liệu mock.

## 1. Luồng được kiểm thử

1. Chủ doanh nghiệp mời nhân viên, đặt hạn và mở bài test.
2. Nhân viên làm bài trắc nghiệm có giám sát: 18 câu = 6 lĩnh vực × 3 cấp. Máy chấm ngay khi nộp. Không có tự luận, không có mentor chấm.
3. Chủ doanh nghiệp đóng sớm ("Xem kết quả ngay"). Báo cáo hiện ngay bằng số liệu và câu mẫu, trong khi AI viết ở nền. AI viết ưu tiên học và lý do của từng mức tối đa; rào chắn kiểm từng câu.
4. Bài nộp muộn (phiên mở trước khi đóng) vẫn được nhận, và AI viết lại.
5. Chủ doanh nghiệp chọn phạm vi đào tạo theo kết quả (OW-05) rồi thanh toán các khóa cần mua.
6. Nhân viên xem mức của mình và lộ trình.
7. Quản trị nền tảng tạo lại gợi ý (PA-14).

## 2. Môi trường và dữ liệu

| Mục | Giá trị |
|---|---|
| Backend | ASP.NET Core 8, `Development` (tự migrate + seed) |
| Database | PostgreSQL 16 trong Docker (`digitalent-postgres`, cổng 5434), DB riêng `digitalent_trialai` tạo trống trước khi chạy |
| Frontend | Vite `http://localhost:5173`, gọi API thật qua proxy `/api` → `localhost:5000` |
| AI | Gemini `gemini-3-flash-preview`, temperature 0,2, khóa thật |
| Trình duyệt | Chrome headless điều khiển qua DevTools Protocol. Máy tính: 1440×900 @1,5x; ảnh toàn trang được chụp bằng cách kéo dài khung nhìn. Di động: 390×844 @2x |
| Thiết bị giám sát | Camera và micro giả của Chrome (`--use-fake-device-for-media-stream`). Màn hình giả lập bằng canvas báo `displaySurface = monitor`, vì Chrome headless không có "Toàn bộ màn hình" để chia sẻ |
| Doanh nghiệp | DigiTalent Demo Company, được đặt làm doanh nghiệp dùng thử (`trial_workspaces`) |
| Người tham gia | 12 người: 9 người được mời qua OW-T1 (Kế toán 4, Marketing 3, Kinh doanh 2), employee@ và manager@ (Operations), và chủ doanh nghiệp (có hồ sơ nhân viên ở Operations nên được tính, nhưng không làm bài) |

Cách làm bài. Mỗi người có một mức định trước cho từng lĩnh vực: trả lời đúng mọi câu có cấp ≤ mức đó và sai các câu cao hơn, nhờ vậy kiểm được máy chấm.

- **employee@** làm qua giao diện (ảnh 03–09), mức định trước `[1,1,1,0,1,0]`.
- **7 người được mời và manager@** nộp qua API. Huy có thêm 11 lần rời tab (`TAB_HIDDEN`) để thử chấm rủi ro.
- **Khoa** mở phiên trước khi đóng và nộp sau khi đóng (thử bài nộp muộn).
- **Minh** không mở phiên (thử chặn sau khi đóng).

## 3. Tóm tắt kết quả

| Kiểm tra | Kết quả |
|---|---|
| Máy chấm khớp mức định trước | ✅ 60/60 ô (10 người × 6 lĩnh vực) |
| Đóng sớm có xác nhận; báo cáo hiện ngay bằng câu mẫu khi AI đang viết | ✅ ảnh 11–12 |
| Rào chắn câu AI | ✅ 5 lần gọi, 45/45 câu AI đạt, 0 câu bị thay |
| Lý do mức tối đa bám số liệu | ✅ vd. "Trung vị Cơ bản, 33% đúng Trung cấp", "5/9 chưa đạt Cơ bản, giữ Cơ bản" |
| Ổn định của ưu tiên | ✅ top-3 = M4 → M6 → M3 ở cả 4 lần có lưu nội dung (lần 1, 2, 3, 5) |
| Bài nộp muộn | ✅ được nhận; báo cáo về PENDING rồi DONE với 10 bài (ảnh 21–22) |
| Người chưa mở phiên bị chặn sau khi đóng | ✅ `canStart = false`, "Bài đánh giá đã đóng."; `POST /me/trial-assessment/proctoring` → 400 `TRIAL_ASSESSMENT_NOT_OPEN` |
| Phạm vi đề xuất → giỏ mua → checkout | ✅ 5 khóa · 29 suất · 13.671.000 đ |
| Độ trễ AI | Mức suy nghĩ mặc định: 52,6 s và 22,2 s. Với `thinkingLevel = low`: 2,76 s · 2,41 s · 2,42 s |

## 4. Ảnh theo luồng

### A. Chủ doanh nghiệp mở bài test — OW-T1 `/enterprise/trial`, owner@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 01 | [01-ow-t1-setup](01-ow-t1-setup.png) | Vào "Đánh giá đội ngũ" sau khi mời 9 người | Bước "1 · Nhân viên tham gia" có danh sách người được mời. Thẻ hạn làm bài chứa luôn nút "Gửi lời mời & mở bài test" |
| 02 | [02-ow-t1-open-0](02-ow-t1-open-0.png) | Bấm "Gửi lời mời & mở bài test" | Trạng thái "Bài test đang mở", đóng lúc 17:00 08/11/2026, chưa ai nộp |

### B. Nhân viên làm bài — EM-T1 `/enterprise/me/trial-test`, employee@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 03 | [03-em-t1-intro](03-em-t1-intro.png) | Mở cổng nhân viên | "Bài đánh giá năng lực", hạn 17:00 08/11/2026. Ba phần Cơ bản / Trung cấp / Nâng cao, mỗi phần 6 câu trắc nghiệm. Cần chia sẻ màn hình, camera, micro; làm một lần. Nút "Vào phòng thi" |
| 04 | [04-em-gate-todo](04-em-gate-todo.png) | Bấm "Khảo thí & Đánh giá" khi chưa làm bài | Trang học bị chặn: "Làm bài test trước khi học · Học thử mở sau khi bài test đóng · Hạn nộp 17:00 08/11/2026", kèm nút "Làm bài test" |
| 05 | [05-em-exam-ready](05-em-exam-ready.png) | Vào phòng thi, bật màn hình, camera, micro, tích cam kết | Ba thiết bị hiện "Đang chia sẻ" / "Đang bật" kèm khung xem trước. Thẻ đề bài: "3 phần · Cơ bản → Nâng cao, Trắc nghiệm 6 lĩnh vực, Một lần, Tự động khi nộp". Nút "Bắt đầu" bấm được |
| 06 | [06-em-exam-part1](06-em-exam-part1.png) | Bắt đầu, trả lời Phần 1 | Đang ghi 00:05. Tab Phần 1 có ✓, 6/6 câu, mỗi câu một lĩnh vực với nhãn "Mức 1: Cơ bản"; M4 và M6 chọn sai theo mức định trước. Cột phải: camera, micro, màn hình đang chia sẻ, cảnh báo "Không thấy khuôn mặt" (camera giả không có mặt người), nhật ký giám sát 2 sự kiện. Chân trang: "Còn 12 câu chưa trả lời", nút Nộp bài bị khóa |
| 07 | [07-em-exam-submit](07-em-exam-submit.png) | Làm hết 3 phần, bấm "Nộp bài" | Cả 3 tab có ✓, "Đã làm đủ ba phần". Hộp xác nhận "Nộp bài và dừng ghi hình? Sau khi nộp không sửa được." |
| 08 | [08-em-exam-done](08-em-exam-done.png) | Xác nhận nộp | "Đã nộp bài. Bài đã được chấm. Kết quả hiện khi bài test đóng (hết hạn hoặc đủ bài)." |
| 09 | [09-em-t1-waiting](09-em-t1-waiting.png) | Quay lại EM-T1 | "Đã nộp lúc 08:36 05/11/2026. Bài đã được chấm. Kết quả hiện tại đây khi bài test đóng (chậm nhất 17:00 08/11/2026)." Không có bước tự luận hay chờ mentor |

### C. Đóng sớm và báo cáo AI — OW-T1, owner@, 9 bài

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 10 | [10-ow-t1-open-9](10-ow-t1-open-9.png) | Mở lại OW-T1 khi 9 người đã nộp | Bước 3 "Làm bài": Đã nộp 9/12, Chưa nộp 3, Chưa kích hoạt 0, Đề 18 câu. Theo phòng ban: Kinh doanh 0/2, Kế toán 4/4, Marketing 3/3, Operations 2/3. Dòng "Kết quả tự tạo khi hết hạn hoặc đủ 12 bài", nút "Xem kết quả ngay (9 bài)". Bảng nhân viên có trạng thái và giờ nộp |
| 11 | [11-ow-t1-close-confirm](11-ow-t1-close-confirm.png) | Bấm "Xem kết quả ngay (9 bài)" | Xác nhận ngay trong thẻ: người chưa nộp sẽ không làm được nữa; nút "Đóng bài" |
| 12 | [12-report-ai-pending](12-report-ai-pending.png) | Bấm "Đóng bài" | Báo cáo hiện ngay: "Cơ bản · TB 6 lĩnh vực · 9 người"; đạt Cơ bản cả 6 lĩnh vực 33% (3/9); mạnh nhất M2 1,9. Khối Ưu tiên dùng câu mẫu (M4 "5/9 chưa đạt Cơ bản", M6 "4/9…", M3 "1/9…") với nhãn "✦ AI đang viết…". *Số 1,1 trên vòng là khung hình giữa hiệu ứng đếm 1,1 giây; giá trị cuối là 1,2 (ảnh 14)* |
| 13 | [13-report-full](13-report-full.png) | Chờ AI viết xong (trang tự đọc lại mỗi 5 giây) | Toàn trang báo cáo sau khi AI xong |
| 14 | [14-report-hero-ai](14-report-hero-ai.png) | Phần đầu báo cáo | 1,2/3; nhãn "✦ AI · 9 bài". Ưu tiên: ① M4 An toàn "✦ 5/9 chưa đạt Cơ bản, đúng 44%"; ② M6 "✦ 4/9 chưa đạt Cơ bản, đúng 56%"; ③ M3 "✦ 6/9 sai câu Trung cấp, đúng 33%". Chip "1 câu mỗi cấp" |
| 15 | [15-map-tooltip](15-map-tooltip.png) | Rê chuột vào hàng M4 của bản đồ năng lực | Mỗi lĩnh vực có điểm hiện tại, cờ mức tối đa, đoạn cần học theo cấp và "còn x"; ①②③ là ưu tiên AI. Tooltip: "Hiện tại 0,4 · Tối đa Cơ bản · 5/9 người cần học · Chưa đạt 5 · Cơ bản 4 · ✦ 5/9 chưa đạt Cơ bản, giữ Cơ bản". Ba giai đoạn: Cơ bản miễn phí 10 suất (3 khóa), Trung cấp 8,8tr (22 suất, 5 khóa), Nâng cao 6,3tr (9 suất, 2 khóa) |
| 16 | [16-map-priority-focus](16-map-priority-focus.png) | Bấm ưu tiên ① | Hàng M4 nổi lên, các hàng khác mờ đi |
| 17 | [17-map-department](17-map-department.png) | Chọn tab "Kế toán" | Bản đồ tính riêng cho phòng Kế toán (4 người) |
| 18 | [18-map-full-option](18-map-full-option.png) | Chọn phương án "Đầy đủ" | Mức tối đa là Nâng cao ở cả 6 lĩnh vực; giai đoạn và chi phí tính lại |
| 19 | [19-report-details](19-report-details.png) | Mở "Chi tiết theo cấp" | Số người ở từng mức và % đúng từng cấp, theo lĩnh vực |
| 20 | [20-report-missed-heatmap](20-report-missed-heatmap.png) | Cuộn xuống phần dưới | "Câu sai nhiều nhất" trong phạm vi đề xuất (vd. M1 câu Nâng cao 9/9 sai) và bản đồ nhiệt mức trung bình theo phòng ban |

### D. Bài nộp muộn — OW-T1, owner@

Khoa mở phiên lúc 08:36, trước khi đóng bài (08:36:47), và nộp lúc 08:38:41.

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 21 | [21-report-late-pending](21-report-late-pending.png) | Mở báo cáo ngay sau khi Khoa nộp | Báo cáo tính lại: 10 người, 1,1/3, 30% (3/10). Ưu tiên tạm dùng câu mẫu, nhãn "✦ AI đang viết…" |
| 22 | [22-report-after-late](22-report-after-late.png) | Chờ AI viết lại | "✦ AI · 10 bài": ① M4 "✦ 5 người sai câu Cơ bản, 50% đúng"; ② M6 "✦ 5/10 thiếu Cơ bản, 50% đúng Cơ bản"; ③ M3 "✦ 7 người sai câu Trung cấp, 30% đúng" |
| 23 | [23-report-employees](23-report-employees.png) | Xem bảng nhân viên | 10 người, mỗi người kèm mức của 6 lĩnh vực. Không bài nào rủi ro cao nên không có dấu rủi ro (dấu chỉ hiện với mức HIGH; Huy ở MEDIUM) |

### E. Phạm vi đào tạo và thanh toán — OW-05 `/enterprise/setup?plan=BALANCED`, owner@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 24 | [24-ow05-trial-scope](24-ow05-trial-scope.png) | Mở "Phạm vi đào tạo" từ báo cáo | Khối "Theo kết quả test · 10 người đã làm bài" với 3 phương án: Tiết kiệm 6,0tr (2 khóa · 15 suất), ✦ Đề xuất 13,7tr (5 khóa · 29 suất), Đầy đủ 58,0tr (12 khóa · 101 suất). Chi phí theo lĩnh vực. Ma trận có lý do ✦ AI dưới từng lĩnh vực, vd. M1 "Trung vị Cơ bản, 50% đúng Trung cấp", M4 "Trung vị chưa đạt, 5/10 thiếu Cơ bản" |
| 25 | [25-ow05-selected](25-ow05-selected.png) | Bấm "Chọn 5 khóa cần mua" | Đánh dấu chọn mua M1-I, M2-I, M2-A, M3-I, M5-I. Giỏ: M1-I 5 suất, M2-I 2, M2-A 7, M3-I 7, M5-I 8 (= số người dưới mức tối đa; Operations giữ M2 ở Trung cấp nên không tính vào M2-A). Trạng thái "Gợi ý · Chưa lưu" |
| 26 | [26-checkout](26-checkout.png) | Bấm "Thanh toán & Ký online (5)" | Checkout nhận `?courses=…`: 5 khóa đúng số suất, tạm tính 29 suất = 13.671.000 đ (Trung cấp 399.000 đ/suất, Nâng cao 699.000 đ/suất), "Ưu đãi dùng thử doanh nghiệp: Cấp 1 miễn phí". Các bước: Hợp đồng & Ký online → Thanh toán VietQR → Mở khóa học |

### F. Nhân viên sau khi có kết quả — employee@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 27 | [27-em-t1-result](27-em-t1-result.png) | Mở EM-T1 | "Kết quả 6 lĩnh vực": M1, M2, M3, M5 Cơ bản; M4, M6 Chưa đạt (đúng mức định trước). Khối "Lộ trình học tập của bạn đã sẵn sàng" |
| 28 | [28-em-path-after](28-em-path-after.png) | Mở "Lộ trình năng lực" | Mức từ bài test được công nhận: M1-F, M2-F, M3-F, M5-F "Đã đạt" (4/15 khóa); M4-F và M6-F vẫn phải học hoặc làm test |

### G. Quản trị nền tảng — PA-14 `/platform/trials`, platform@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 29 | [29-pa14-trials](29-pa14-trials.png) | Tab "Đã có kết quả" | DigiTalent Demo Company: 10/12 đã nộp, hạn 17:00 08/11/2026. Cột gợi ý báo cáo "✦ AI" kèm nút "Tạo lại"; chọn mentor học thử; trạng thái "Đã có kết quả" |
| 30 | [30-pa14-regenerate](30-pa14-regenerate.png) | Bấm "Tạo lại" | Ô gợi ý chuyển sang "AI đang viết…". AI viết lại trong 2,76 s, 0 câu bị thay |

### H. Giao diện tối và di động — owner@

| # | Ảnh | Thao tác | Kết quả |
|---|---|---|---|
| 31 | [31-report-dark](31-report-dark.png) | Chuyển chủ đề tối | Toàn bộ báo cáo hiển thị đúng ở chủ đề tối |
| 32 | [32-report-mobile](32-report-mobile.png) | Mở ở khung 390×844 | Báo cáo xếp một cột |

## 5. Số liệu AI (bảng `trial_reports` và log backend)

| Lần | Kích hoạt | Số bài | Mức suy nghĩ | Thời gian gọi Gemini | Câu AI / bị thay |
|---|---|---|---|---|---|
| 1 | Đóng sớm (ảnh 12–14) | 9 | mặc định của model | 52,6 s | 9 / 0 |
| 2 | Bài nộp muộn (ảnh 21–22) | 10 | mặc định của model | 22,2 s | 9 / 0 |
| 3 | PA-14 "Tạo lại" (ảnh 30) | 10 | `low` | 2,76 s | 9 / 0 |
| 4 | Tạo lại qua API | 10 | `low` | 2,41 s | 9 / 0 |
| 5 | Tạo lại qua API | 10 | `low` | 2,42 s | 9 / 0 |

Nội dung AI viết ở lần 1 (9 bài):

- **Ưu tiên:**
  - M4 "5/9 chưa đạt Cơ bản, đúng 44%"
  - M6 "4/9 chưa đạt Cơ bản, đúng 56%"
  - M3 "6/9 sai câu Trung cấp, đúng 33%"
- **Lý do mức tối đa:**
  - M1 "Trung vị Trung cấp, 0% đúng Nâng cao"
  - M2 "Trung vị Trung cấp, 11% đúng Nâng cao"
  - M3 "Trung vị Cơ bản, 33% đúng Trung cấp"
  - M4 "5/9 chưa đạt Cơ bản, giữ Cơ bản"
  - M5 "Trung vị Cơ bản, 22% đúng Trung cấp"
  - M6 "Trung vị Cơ bản, 0% đúng Trung cấp"

Nội dung AI viết ở lần 5 (10 bài, sau khi đặt `thinkingLevel = low`):

- **Ưu tiên:**
  - M4 "5/10 chưa đạt Cơ bản, đúng 50% Cơ bản"
  - M6 "5/10 chưa đạt Cơ bản, đúng 50% Cơ bản"
  - M3 "7/10 chưa đạt Trung cấp, đúng 30% Trung cấp"
- **Lý do mức tối đa:** cùng dạng "Trung vị … , x% đúng …".

Mọi con số trong các câu trên đều có trong số liệu đầu vào; rào chắn kiểm việc này cho từng câu.

## 6. Kiểm thử tự động

- **Backend `dotnet test`:** 516 test, 359 qua, 157 đỏ. Cả 157 test đỏ này cũng đỏ trên `develop` (so theo tên); không có test đỏ mới.
  - Nhóm dùng thử (`~Trial`): 66 qua, 3 đỏ, cả 3 cũng đỏ trên develop: 2 `PlatformAdminTests`, và 1 `TrialPostgresTests` cần biến `DIGITALENT_TEST_POSTGRES_CONNECTION`.
- **Test mới cho rào chắn:**
  - `Ceiling_reasons_must_cite_the_rule_data` (6 trường hợp);
  - `Missing_reasons_fall_back_to_templates`;
  - luật `NO_DATA` trong `Invalid_ai_items_are_replaced_by_templates_and_counted`.
- **Frontend:**
  - `tsc -b` sạch.
  - `npm run lint` 0 lỗi; các cảnh báo đều ở file khác, có sẵn.
  - Các test đỏ trong `trial-program`, `organization`, `pulse-employee` trùng với danh sách đỏ của develop (vd. `owner-learning-shell`: "React is not defined"); không có test đỏ mới.

## 7. Thay đổi so với lượt chụp trước

1. **Lý do mức tối đa phải dẫn số liệu.**
   - Lượt trước AI viết câu chung chung như "Nâng cao giúp cộng tác bền vững".
   - Prompt nay gửi luật của từng lĩnh vực (`BELOW_BASIC`, `MEDIAN_ZERO`, `RAISE`, `AT_MAX`) kèm ví dụ đúng và sai.
   - Rào chắn có thêm luật `NO_DATA`: câu phải có con số, "trung vị" hoặc "quá nửa", không thì thay bằng câu mẫu.
2. **Mức suy nghĩ thấp cho lời gọi gợi ý.**
   - Cấu hình `Gemini:TrialInsightsThinkingLevel`, mặc định `low`; chuỗi rỗng = dùng mặc định của model.
   - Model không nhận tham số này (lỗi 400) thì tự gọi lại không kèm.
   - Độ trễ giảm từ 22–53 s xuống khoảng 2,5 s.
3. **Tooltip bản đồ.** "5/9 người cần học · Chưa đạt 5 · Cơ bản 4" thay cho "5/9 người chưa tới · 0 5 · CB 4 · TC 0 · NC 0".

## 8. Ghi chú

- **Ảnh 12:** số trên vòng được chụp khi hiệu ứng đếm chưa chạy xong (xem dòng 12 ở trên).
- **Rủi ro giám sát:**
  - employee@ làm bài khoảng 11 giây (tự động). Nhật ký giám sát chỉ có 2 sự kiện (bắt đầu ghi, bật nhận diện khuôn mặt), nên rủi ro là LOW dù giao diện có hiện cảnh báo "Không thấy khuôn mặt".
  - Huy ở mức MEDIUM.
  - Không có bài nào HIGH, nên báo cáo không hiện "bài rủi ro cao". Đúng thiết kế.
- **Trang "Lộ trình năng lực":**
  - Vẫn xem được khi bài test còn mở (thiết kế sẵn của `TrialGate`); các trang học khác bị chặn (ảnh 04).
  - employee@ của doanh nghiệp demo có vị trí Kế toán, nên lộ trình hiện đủ 3 cấp.
  - Mức từ bài test chỉ được tính sau khi đóng bài (ảnh 28).
- **Dữ liệu:** tên người và email `@trial.test` là dữ liệu thử nghiệm.
