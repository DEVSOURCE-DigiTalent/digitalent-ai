# Đối chiếu DigComp 3.0 và kế hoạch hoàn thiện DigiTalent

Rà soát ngày 27/09/2026, dựa trên 8 file Word trong `tai lieu`, code FE hiện tại và nguồn chính thức. Hệ thống đã có nền tảng để demo hành trình đào tạo; điểm cần củng cố tiếp theo là tính nhất quán từ khung → đầu ra → chấm minh chứng → ghép khóa → quyền học và báo cáo.

## 1. Kết quả đọc tài liệu

| Tài liệu | Nội dung và phát hiện |
|---|---|
| `khung-chuong-trinh-15-khoa-digcomp.docx` | Tự ghi DigComp 3.0, 5 lĩnh vực, 21 năng lực; 15 khóa, 63 module. Vẫn gọi nhóm 1–2/3–4/5–6 là “Mức DigComp”. Mục đầu nói đã có giáo trình, phụ lục còn nói chưa có; cần chỉnh nhất quán khi phát hành bản tài liệu mới. |
| `giaotrinh-linhvuc1.docx` đến `giaotrinh-linhvuc5.docx` | Tham chiếu Thông tư 02/2025. FE đã dùng nội dung 63 module với mục tiêu, lý thuyết, bài thực hành và câu hỏi. Các phần pháp lý cần được quản lý nguồn và ngày rà soát. |
| `giaotrinh-mien6-AI.docx` | 3 khóa F/I/A, mỗi khóa 3 module về 6.1, 6.2, 6.3. Trước lần cập nhật này chưa có trong catalog FE. Nay đã có khu xem trước nội dung và video minh họa; chưa gắn giao học, chấm điểm hoặc bán khóa. |
| `BÁO CÁO XÂY DỰNG MA TRẬN NĂNG LỰC SỐ THEO VỊ TRÍ.docx` | Mức theo CEO, HR, Marketing, Sales và kế toán là benchmark do nhóm đề xuất. Tài liệu cũng nói rõ DigComp không ấn định “CEO phải Level 5”. Chưa có bằng chứng khảo sát doanh nghiệp để xác nhận các mức này. |

Tệp Word gốc được giữ làm nguồn. Bản trích nội dung nằm trong `docs/source-text`; `src/data/frameworkSourceManifest.json` lưu tên, SHA-256 và phần giáo trình AI. Hash giúp nhận diện tài liệu đổi phiên bản, không chứng minh nội dung đã được thẩm định.

## 2. Quan hệ giữa hai khung

**Dùng DigComp 3.0 làm khung tham chiếu thiết kế; dùng Thông tư 02/2025 làm nguồn đối chiếu trong nước.** Lưu hai hệ mã, hai thang mức và nguồn riêng. Thông tư ban hành 24/01/2025, DigComp 3.0 công bố 27/11/2025; vì vậy không mô tả Thông tư được xây dựng từ DigComp 3.0. Có thể đối chiếu nội dung giữa chúng.

| Nội dung | DigComp 3.0 | Thông tư 02/2025 | Cách áp dụng trong dự án |
|---|---|---|---|
| Cấu trúc | 5 lĩnh vực, 21 năng lực | 6 miền, 24 năng lực | Registry riêng; bảng đối chiếu dự thảo |
| Thành thạo | Basic, Intermediate, Advanced, Highly advanced | 4 trình độ, 8 bậc | Không chuyển số mức tự động |
| AI | Tích hợp xuyên suốt | Miền VI với 6.1–6.3 | Soạn cả bài AI riêng và nội dung AI trong các lĩnh vực khác |
| Vị trí công việc | Khung chung, có thể điều chỉnh | Khung năng lực số cho người học | Benchmark SME cần doanh nghiệp và chuyên gia xác nhận |
| Bản demo | 3 nhóm khóa đang triển khai | Giáo trình đang chia bậc 1–6 | Highly advanced/bậc 7–8 chưa thuộc phạm vi |

Nguồn: [JRC DigComp 3.0](https://publications.jrc.ec.europa.eu/repository/handle/JRC144121), [cấu trúc và thang mức](https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digital-competence-framework-digcomp/digcomp-30_en), [Thông tư chính thức](https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/01/02-bgddt.pdf), [Bộ GDĐT qua Cổng thông tin Chính phủ](https://cms.baochinhphu.vn/bo-giao-duc-va-dao-tao-ban-hanh-khung-nang-luc-so-cho-nguoi-hoc-102250206093701931.htm).

Các liên kết 1.1–5.4 hiện dựa trên chủ đề, mã trong giáo trình và cấu trúc khung. Liên kết AI 6.1–6.3 sang nhiều năng lực DigComp là đề xuất biên soạn của dự án. Chưa liên kết đến toàn bộ learning outcome chính thức của JRC; chưa có xác nhận tương đương. Con số **21/24 chỉ thể hiện mã chủ đề có bài trong catalog**, không phải mức hoàn thành chuẩn, mức năng lực hay tỷ lệ hoàn thành dự án.

## 3. Đã thay đổi trong FE

- Trang **Khung đào tạo**, truy cập được từ landing và thanh điều hướng sau đăng nhập: lọc/tìm 24 năng lực, xem các khóa F/I/A liên quan, đọc nguồn và phân biệt thang mức.
- Khu **Nguồn & giáo trình AI**: 8 nguồn có dấu phiên bản; 3 khóa, 9 module AI có mục tiêu, nội dung, bài thực hành và video mô phỏng.
- Quản trị có mục **Ưu tiên phát triển**, với hiện trạng, điều kiện hoàn thành và bảng dữ liệu liên quan.
- Landing và hướng dẫn chuyển tham chiếu từ 2.2 sang 3.0; sửa phần hướng dẫn cũ gọi 8 bậc là mức DigComp 3.0.
- Catalog hiển thị Cơ bản/Trung cấp/Nâng cao; metadata phân biệt nhóm bậc trong giáo trình Thông tư với trạng thái đối chiếu DigComp.
- Bản yêu cầu vị trí mới lưu `frameworkSnapshot`; lần phân tích khoảng thiếu chụp lại nguồn, phiên bản và thang nội bộ. Bản cũ chưa có nguồn vẫn được nhận diện là legacy, không tự gắn nhãn mới.
- Điểm khảo sát 0–6 tiếp tục phục vụ luồng demo cũ và được ghi rõ là chỉ số nội bộ. Hồ sơ xác nhận vẫn dùng 3 mức vận hành; chưa chuyển thành chứng nhận đạt DigComp/Thông tư.

## 4. Các việc cần làm theo thứ tự

### P0 Trước khi chốt nghiệp vụ

| Việc | Căn cứ từ code/tài liệu | Điều kiện hoàn thành |
|---|---|---|
| Duyệt đầu ra và bảng đối chiếu | Khung nguồn còn trộn thang mức; registry mới là dự thảo | Mỗi đầu ra có nguồn/phiên bản, mức, loại kiến thức–kỹ năng–thái độ, tiêu chí quan sát và người duyệt |
| Ghép khóa theo năng lực đã xác nhận | `calculateGap` trong `trainingOperations.js` tạo gap theo năng lực; `competenceEngine.js` ghép khóa theo khảo sát lĩnh vực. Hai luồng chưa dùng chung đầu vào | Gap ACTIVE → đề xuất có lý do → kiểm tra tiên quyết và quyền học → giao khóa; lưu mỗi vòng để so sánh |
| Rubric và mentor | `systemDemo.js` cho nhập điểm từng năng lực và ngưỡng 70; chưa có rubric chi tiết có phiên bản | Tách tiêu chí, mô tả đạt/chưa đạt, minh chứng bắt buộc, mentor được phân công, hạn phản hồi, nộp lại và khiếu nại |
| Thống nhất nội dung được học và được bán | `draftCourse` lưu snapshot nhưng lớp mặc định đọc `ALL_DIGCOMP_COURSES`; thương mại dựa trên cờ tĩnh | Enrollment và assessment tham chiếu courseVersionId; trạng thái biên soạn, thẩm định, xuất bản và được bán độc lập |

### P1 Trước khi pilot doanh nghiệp

1. **AI:** thẩm định 6.1–6.3, bổ sung danh mục năng lực và khung vị trí, rubric và câu hỏi; tích hợp tình huống AI vào các bài hiện có. Không thêm riêng 3 khóa rồi tuyên bố đã phủ AI của DigComp 3.0.
2. **Vòng đời tài khoản:** quên mật khẩu, đổi email có xác thực, từ chối lời mời, rời/đình chỉ thành viên, chuyển vị trí, bàn giao quản trị; phân biệt khóa do công ty tài trợ và quyền mua riêng khi nhân viên nghỉ việc.
3. **Doanh thu:** hợp nhất đơn hàng mới với báo cáo cũ. `platformService.js` lưu orders riêng, báo cáo mẫu của doanh nghiệp dùng `organization.orders`. Hiện chưa được dùng hai nguồn này để báo một tổng doanh thu thống nhất. Bổ sung hoàn tiền, gia hạn, quyền hết hạn và đối soát; thuế/hóa đơn nằm ngoài FE hiện tại.
4. **Nguồn pháp lý:** tài liệu tự yêu cầu rà riêng phần dữ liệu cá nhân, bản quyền, giao dịch/hóa đơn. Gắn ngày rà soát, người phụ trách, văn bản nguồn và các bài chịu ảnh hưởng; cần người có chuyên môn đối chiếu quy định đang có hiệu lực.
5. **Báo cáo:** chỉ so sánh cùng phiên bản khung, cùng nhóm nhân viên và thang đo; tách “hoàn thành học”, “đạt bài kiểm tra”, “năng lực có minh chứng”. Khi đổi khung, lưu lịch sử và phân tích lại, không so sánh trực tiếp hai điểm khác chuẩn.

### P2 Chuẩn bị triển khai thật

- Thử với 2–3 SME, ưu tiên CEO/trưởng phòng và một nhóm nhân viên; chốt benchmark bằng phỏng vấn công việc và bài thực hành mẫu.
- Chốt ma trận quyền platform admin / chủ doanh nghiệp / HR / trưởng phòng / mentor / nhân viên / cá nhân. Demo đăng ký quản trị chưa xác minh tư cách đại diện pháp nhân.
- BE chịu trách nhiệm xác thực, tenant scope, gửi mail, upload, chống gọi trùng, transaction và webhook thanh toán; FE không là ranh giới bảo mật.
- Kiểm tra thao tác bàn phím, focus trong modal, tương phản tối/sáng, mobile, mất mạng, dữ liệu trống và khôi phục phiên; chia bundle theo trang khi phát hành.
- AI agent cần nêu nguồn và phạm vi dữ liệu doanh nghiệp, cho người học phản hồi; quyết định xác nhận năng lực vẫn thuộc người thẩm định.

## 5. Dữ liệu cần chốt trước khi làm BE

Tận dụng các bảng canonical sẵn có: `competency_frameworks`, `competency_categories`, `competencies`, `competency_framework_mappings`, `competency_level_criteria`, `course_competencies`, `course_learning_outcomes`, `lesson_learning_outcomes`, `position_requirement_sets/items`, `skill_gap_runs/items` và các bảng minh chứng.

Đề xuất trường/quan hệ cần có trong thiết kế chi tiết:

- Framework: mã, phiên bản, đơn vị ban hành, ngày công bố, URL, hash nguồn, thang mức; một năng lực được định danh bằng `(frameworkVersionId, code)`.
- Mapping: source/target competency, quan hệ partial/related/equivalent, mức tương ứng nếu có, lý do, người/ngày duyệt. Không dùng mã `6.1` như năng lực DigComp.
- Learning outcome: loại K/S/A, nguồn/mã chính thức nếu đã đối chiếu, tiêu chí và rubricVersionId; tránh thêm mã JRC tự đặt.
- Course/enrollment/assessment/evidence: tham chiếu phiên bản nội dung và thang chấm đã áp dụng; không đọc “bản mới nhất” để tính lại kết quả lịch sử.
- Bổ sung bảng phiên bản khóa, rubric và tiêu chí rubric, phân công mentor, nguồn tài liệu và lượt rà soát nếu thiết kế hiện có chưa thể biểu diễn vòng đời này. Đây là đề xuất, chưa phải migration đã chạy.
- Các bảng tài khoản/lời mời/gói/quyền học đã đề xuất ở [hướng dẫn B2B/B2C](FE_ONBOARDING_COMMERCE.md) vẫn cần thiết. Không đánh đồng số bảng thiết kế với số nghiệp vụ đã triển khai hoặc % hoàn thành.

## 6. Cách soạn một bài học từ hai khung

Chọn vị trí và nhiệm vụ thực tế → chọn năng lực Thông tư → xem đối chiếu DigComp dự thảo → viết đầu ra K/S/A → chọn mức dựa trên tự chủ/độ khó → đặt bài thực hành và tiêu chí quan sát → chuyên gia duyệt → đóng phiên bản → xuất bản.

Ví dụ đề xuất cho Marketing dùng AI soạn nội dung: tham chiếu Thông tư 6.2 và DigComp 3.1/3.3/4.2; yêu cầu người học lưu prompt, bản nháp, bản chỉnh sửa, căn cứ kiểm chứng và cách xử lý dữ liệu. Rubric phải đánh giá chất lượng sản phẩm, bản quyền, kiểm chứng và bảo vệ dữ liệu. Đây là thiết kế bài học của dự án, chưa phải ánh xạ chính thức được duyệt.

## 7. Kiểm tra và giới hạn

```powershell
node scripts/generateFrameworkSources.mjs
node --test src/utils/*.test.js
node scripts/verifyUi.mjs
node node_modules/vite/bin/vite.js build
```

29 test nghiệp vụ đạt, gồm kiểm tra độ phủ chủ đề không bị hiểu thành thẩm định, 9 module AI và bảo toàn nguồn của dữ liệu cũ. Kiểm tra render SSR đi qua trang đối chiếu, nguồn AI, ưu tiên quản trị và các màn hình cũ. Build thành công; còn cảnh báo bundle lớn.

Trong phiên cập nhật này browser automation lỗi do runtime tham chiếu thư mục plugin không tồn tại, nên chưa chạy kiểm tra click/layout trực quan cho màn hình mới. SSR không thay thế kiểm tra đó.

Khi tài liệu đổi, chạy `scripts/readDocxText.ps1` với từng tệp và xuất JSON vào `docs/source-text`, sau đó chạy script generate. Không sửa trực tiếp nguồn Word hoặc tự đánh dấu APPROVED. Cần thẩm định chuyên môn trước khi công bố đạt toàn bộ khung.
