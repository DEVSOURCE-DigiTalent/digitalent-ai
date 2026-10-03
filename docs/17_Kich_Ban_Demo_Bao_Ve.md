# 17 — Kịch Bản Demo & Bảo Vệ

> Nguồn gốc: `DigiTalent_AI_Script_Final_Combined` (22 slide) + số liệu docs_v3. Đây là tài liệu **nói** (giữ nguyên tiếng Việt, không dịch). Phiên bản docs_v3.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Kịch bản demo & bảo vệ đồ án |
| Phiên bản | 3.0 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Script 22 slide + số liệu docs_v3 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Căn chỉnh số liệu: DigComp 3.0, 3 level, 17 entity, 45 UC hiệu dụng |

---

## 2. Mục đích và phạm vi

Kịch bản nói cho buổi bảo vệ: 22 slide theo thứ tự deck PPTX, kèm **timing**, **ghi chú chỉ tay**, **câu hỏi hội đồng dự kiến** và **kịch bản demo** end-to-end.

**Lưu ý số liệu docs_v3 (đã căn chỉnh so với script gốc):**

| Mục | Script gốc | docs_v3 (dùng khi nói) |
|-----|-----------|------------------------|
| Khung năng lực | DigComp 2.2 | **DigComp 3.0** |
| Mức năng lực | 5 career grade + 3 level | **3 level (Basic/Intermediate/Advanced)** |
| Thực thể cốt lõi | 18 | **17** (bỏ Career Grade) |
| Use case | 46 | **45 hiệu dụng** (46 − UC-15 Manage Career Grades) |

---

## 3. Tài liệu tham chiếu

- `DigiTalent_AI_Script_Final_Combined` (bản gốc 22 slide)
- `00_INDEX` §3 (số liệu chuẩn)
- `01_Tong_Quan_Du_An.md`, `04_Use_Case_Danh_Sach_Dac_Ta.md`

---

## 4. Kịch bản 22 slide

> Thời gian tổng ≈ 18 phút. Đọc thử 1–2 lần rồi nói theo ý, không học thuộc từng chữ.

### Slide 1 — Title (~35s)

Em chào thầy cô. Hôm nay nhóm chúng em xin trình bày về đề tài **DigiTalent AI** — một hệ thống giúp đánh giá và đào tạo năng lực số cho các vị trí công việc trong doanh nghiệp, đặc biệt hướng tới các doanh nghiệp vừa và nhỏ. Để thầy cô hiểu rõ hơn, trước tiên em xin trình bày về bối cảnh và lý do nhóm chọn đề tài này.

### Slide 2 — Agenda (~25s)

Em xin đi qua nhanh cấu trúc bài trình bày: bối cảnh và khoảng trống → giải pháp và chuẩn tham chiếu → kiến trúc vị trí công việc và tính năng chính → thiết kế hệ thống → kế hoạch thực hiện và kết quả kỳ vọng.

### Slide 3 — Context & Urgency (~70s)

Chuyển đổi số đang diễn ra rất mạnh, đặc biệt là sự phát triển của AI, kéo theo yêu cầu với người lao động ngày càng cao. *(Chỉ tay: 3 thẻ Yesterday / Today / The risk.)* Trước đây nhân viên văn phòng chỉ cần Word, Excel, Email. Nay còn phải biết khai thác dữ liệu, làm việc môi trường số và ứng dụng AI vào công việc. Vì vậy cả nhân viên lẫn doanh nghiệp đều phải liên tục đào tạo và nâng cao năng lực.

### Slide 4 — Current Landscape & Gap (~110s)

*(Chèn ảnh thật: screenshot Coursera/Udemy/edX + ảnh buổi đào tạo nội bộ.)* Khi muốn học, mọi người tìm đến Coursera, Udemy, edX — nhiều khóa chất lượng. Nhưng các khóa này tổ chức theo chủ đề chung. Một nhân viên Sales muốn học AI thì tìm được rất nhiều khóa, nhưng hệ thống không trả lời: **đúng vị trí Sales cần năng lực số nào, đang thiếu gì, khóa nào phù hợp**. Phía doanh nghiệp, đào tạo nội bộ còn tự phát: thuê chuyên gia dạy một buổi rồi kết thúc, khó trả lời nhân viên tiếp thu được gì, ở mức nào, có cải thiện chưa. Đây chính là khoảng trống nhóm muốn giải quyết. Với Việt Nam, chuẩn kỹ năng CNTT 2014 của Bộ TT&TT đã cũ, chưa bao quát AI hay phân tích dữ liệu; chưa có chuẩn năng lực số cho người lao động.

**Hội đồng hỏi "vấn đề có thật không?"** — Dạ em đã tra cứu nguồn chính thống (Báo Nhân Dân, Cổng thông tin Bộ KHCN): Việt Nam chưa có chuẩn kỹ năng số quốc gia cho lao động, chuẩn 2014 chưa cập nhật AI/data analytics. Đây là căn cứ thực.

### Slide 5 — Existing Systems Compared (~45s)

*(Chỉ tay: bảng 4 hàng.)* Bên cạnh MOOC như Coursera, còn Enterprise LMS như Docebo, HRM Suite như SAP SuccessFactors — mỗi giải pháp đều mạnh riêng, nhưng chung một điểm thiếu: **không đo năng lực theo đúng yêu cầu của một vị trí cụ thể**.

### Slide 6 — Our Solution (~60s)

*(Chỉ tay: chuỗi 6 ô Job Position → … → Certificate.)* DigiTalent AI hoạt động theo vòng: xác định vị trí → xác định năng lực số cần và mức yêu cầu → đánh giá năng lực hiện tại → xác định **Skill Gap** → đề xuất đào tạo → đánh giá lại → cấp chứng chỉ nội bộ. Vòng lặp cốt lõi: **Job Position → Competency → Skill Gap → Training → Assessment → Certificate**. Điểm khác biệt: không chỉ cho IT, dùng chuẩn quốc tế, đánh giá đúng vị trí thực tế.

### Slide 7 — What Is Digital Competence + Why Assess (~100s)

Năng lực số không chỉ là biết dùng máy tính. Theo định nghĩa nhóm tham chiếu, năng lực số là khả năng dùng công nghệ số một cách tự tin và có trách nhiệm để làm việc, học tập, tham gia xã hội. DigiTalent AI không chỉ hỏi "có biết dùng công cụ không" mà trả lời "có đủ năng lực số đáp ứng vị trí hay chưa". Vì sao phải đánh giá? Vì "đã tham gia khóa học" chưa chứng minh "đã có năng lực". *(Chỉ tay: Required level vs Confirmed level = Skill Gap.)* Hệ thống so sánh **Required Level** (mức vị trí yêu cầu) với **Confirmed Level** (mức đã xác nhận qua đánh giá + minh chứng thực hành) trên thang **3 mức: Basic / Intermediate / Advanced**. Khoảng cách đó là Skill Gap.

### Slide 8 — Standards Landscape (~75s)

*(Chỉ tay: bảng 4 hàng chuẩn.)* Nhóm khảo sát: **DigComp** (EU, dành cho công dân, 5 nhóm năng lực), **DigCompEdu / ISTE / UNESCO ICT-CFT** (tập trung giáo dục, giáo viên — không hợp bài toán doanh nghiệp), **Chuẩn CNTT 2014** của Bộ TT&TT (đã cũ, chưa có AI/data), và **Thông tư 02/2025** của Bộ GD&ĐT (đối tượng là học sinh).

### Slide 9 — Why DigComp (~115s)

Nhóm chọn **DigComp** làm khung tham chiếu chính. DigComp chia năng lực số thành 5 nhóm: Information & Data Literacy, Communication & Collaboration, Digital Content Creation, Safety, Problem Solving. Lý do chọn (4 lý do): (1) thiết kế cho công dân nói chung, không giới hạn nghề — hợp CEO, HR, kế toán, Sales, vận hành; (2) cơ sở tham chiếu quốc tế rõ ràng; (3) **phiên bản DigComp 3.0 (2025)** đã cập nhật nội dung mới về AI và dữ liệu; (4) giải quyết vấn đề cơ sở khoa học — giải thích được năng lực tham chiếu từ đâu. Nhóm dùng DigComp làm nền tảng, ánh xạ thêm năng lực cụ thể (AI Literacy) vào 5 nhóm, không tự tạo khung mới.

**Hội đồng hỏi "sao không tự xây khung cho hợp Việt Nam?"** — Dạ mentor nhắc rõ không được tự bịa khung năng lực, phải có căn cứ khoa học. DigComp là nền tảng; nhóm ánh xạ thêm AI Literacy vào đúng 5 nhóm của DigComp.

> ⚠️ **Ghi chú:** script gốc viết "DigComp 2.2" — docs_v3 dùng **DigComp 3.0** theo chỉ đạo.

### Slide 10 — Vision & Principles (~40s)

Tầm nhìn: giúp SME **Định nghĩa → Đào tạo → Đánh giá → Xác minh** đúng năng lực số từng vị trí cần. 4 nguyên tắc: (1) lấy vị trí làm gốc, không lấy khóa học; (2) mọi năng lực có căn cứ DigComp; (3) điểm số giải thích được; (4) AI chỉ hỗ trợ, con người quyết định.

### Slide 11 — Job Architecture (~45s)

*(Chỉ tay: sơ đồ 5 cột CEO, HR Manager/Admin, Accountant, Marketing/Sales, Operations.)* Nhóm chọn 5 nhóm chức năng phổ biến ở SME, triển khai **7 vị trí mẫu** trong MVP. Cấu trúc thiết kế mở, sau thêm vị trí mới không cần đổi toàn hệ thống.

### Slide 12 — MVP Feature Set (1/2) (~30s)

Module: (1) xác thực và phân quyền với 5 role; (2) quản lý tổ chức và nhân viên; (3) quản lý khung năng lực DigComp, mỗi vị trí có yêu cầu năng lực riêng; (4) đào tạo — gắn khóa học với năng lực cần cải thiện.

### Slide 13 — MVP Feature Set (2/2) (~35s)

4 module hoàn thiện vòng đánh giá: (5) đánh giá + ngân hàng câu hỏi; (6) Skill Gap và gợi ý khóa học theo luật; (7) chứng chỉ số xác minh qua QR; (8) Task thực hành — nhân viên nộp bằng chứng chứng minh năng lực. Hệ thống không chỉ đánh giá lý thuyết mà kết hợp minh chứng thực hành.

### Slide 14 — Scope Discipline (~55s)

Kiểm soát phạm vi: không app mobile, không HRM đầy đủ, không marketplace giảng viên, không tự train ML, chưa multi-tenant. Đây là quyết định có chủ đích để dự án khả thi với 5 thành viên trong một học kỳ.

**Hội đồng hỏi "chợ giảng viên mentor gợi ý thì sao?"** — Đây là hướng phát triển tương lai; đưa vào MVP sẽ phát sinh thanh toán + multi-tenant, tăng phạm vi, ảnh hưởng tiến độ.

### Slide 15 — Actors (~25s)

6 actor chính: Administrator, HR/Training Manager, Department Manager, Internal Trainer, Employee, Public Visitor. Public Visitor xác minh chứng chỉ không cần tài khoản.

### Slide 16 — Use Case Diagram (~20s)

Toàn bộ hệ thống có **46 use case** chia 8 package (theo Report 3); docs_v3 hiệu dụng **45** (bỏ UC-15 Manage Career Grades). Ở slide này chỉ trình bày bức tranh tổng quan; đặc tả chi tiết nằm trong tài liệu SRS.

### Slide 17 — Database Diagram (~20s)

Sơ đồ thực thể ở mức khái niệm gồm **17 thực thể cốt lõi** (docs_v3; Report 3 gốc ghi 18 vì có Career Grade). Schema vật lý đầy đủ khoảng 50 bảng ở tài liệu riêng. Mục đích: cho thấy đối tượng dữ liệu chính và quan hệ giữa chúng.

### Slide 18 — Technology (~20s)

Frontend **React + TypeScript**; backend **ASP.NET Core**; CSDL **PostgreSQL**; lưu trữ file **MinIO**; triển khai **Docker Compose**.

### Slide 19 — Project Plan (~25s)

5 sprint, tổng ~170 ngày-công, 12 module, 5 thành viên, khoảng 11 tuần. Chia sprint giúp theo dõi tiến độ và kiểm soát phạm vi.

### Slide 20 — Team & Risk (~45s)

*(Chỉ tay: trái phân công, phải rủi ro.)* Rủi ro chính: (1) số vị trí tăng vượt phạm vi → khóa ở 7 vị trí; (2) phân quyền theo phòng ban; (3) version của Position Requirement; (4) frontend/backend không thống nhất hợp đồng API → theo dõi xuyên suốt.

### Slide 21 — Expected Results (~70s)

Kết quả kỳ vọng: (1) hoàn thiện luồng end-to-end từ vị trí → năng lực → đánh giá → Skill Gap → đào tạo → chứng chỉ; (2) kiểm soát đúng 7 vị trí; (3) mọi năng lực có căn cứ DigComp; (4) mọi điểm giải thích được; (5) kịch bản demo hoàn chỉnh đã tập dượt.

### Slide 22 — Thank You / Q&A (~45s)

Điểm nhấn mạnh: DigiTalent AI không chỉ là thêm một LMS. Nó bắt đầu từ vị trí công việc, xác định năng lực cần có, đo khoảng thiếu hụt, đưa ra đào tạo phù hợp, và xác minh kết quả. Nhóm không chỉ trả lời "đã học khóa nào" mà trả lời **"có đủ năng lực số đáp ứng vị trí của mình hay chưa"**. Em xin cảm ơn thầy cô và hội đồng; nhóm sẵn sàng nhận câu hỏi.

---

## 5. Kịch bản demo (end-to-end, ~4 phút)

Một luồng demo duy nhất minh họa vòng lặp cốt lõi:

| Bước | Vai trò | Thao tác | Màn hình |
|------|---------|----------|----------|
| 1 | HR | Đăng nhập, mở Job Architecture | Job Families Catalogue |
| 2 | HR | Mở vị trí "Sales Executive", cấu hình yêu cầu năng lực (mỗi competency: level Basic/Intermediate/Advanced + weight) | Position Requirement Editor |
| 3 | HR | Kích hoạt requirement set (archive bản cũ) | Position Requirement Editor |
| 4 | Employee | Đăng nhập, mở profile năng lực — thấy Required vs Confirmed → Skill Gap | My Competency Profile & Gap |
| 5 | Hệ thống | Đề xuất khóa học theo gap (kèm lý do) | My Competency Profile & Gap |
| 6 | Employee | Enroll khóa, học, thi final assessment | Course Player → Assessment Interface |
| 7 | Hệ thống | Attempt PASSED → tự cấp chứng chỉ | My Certificates |
| 8 | Employee | Mở chứng chỉ, xem QR | My Certificates |
| 9 | Public | Quét QR / nhập mã → xác minh VALID | Certificate Verification |
| 10 | Manager | Giao task thực hành cho competency còn thiếu | Practical Task Assignment |
| 11 | Employee | Nộp bằng chứng (file/URL) | My Tasks & Evidence Submission |
| 12 | Manager | Duyệt, confirm → tạo evidence, cập nhật năng lực | Submission Review & Evidence Approval |
| 13 | HR | Mở dashboard — readiness/risk/gap toàn công ty | Capability Executive Dashboard |

**Chuẩn bị demo:** seed dữ liệu trước (5 job family, 7 position, competency, 1 nhân viên mẫu có gap rõ), tập dượt để không bị vấp, dự phòng nếu LLM/Mạng lỗi (LLM không chặn luồng chính).

---

## 6. Ngân hàng câu hỏi hội đồng dự kiến

| Chủ đề | Câu hỏi | Trả lời gợi ý |
|--------|---------|---------------|
| DigComp | Vì sao DigComp 3.0, không phải 2.2? | 3.0 là bản 2025, cập nhật AI/dữ liệu; giữ nguyên cấu trúc 5 nhóm |
| 3 level | Sao bỏ career grade, chỉ còn 3 level? | Đơn giản hóa cho SME; 3 mức Basic/Intermediate/Advanced đủ phân biệt năng lực, bớt phức tạp quản trị |
| Tính điểm | Điểm risk/readiness tính sao? | Rule-based, trọng số trong config (Σ=100%), lưu version, giải thích được từng yếu tố |
| Bảo mật | Chứng chỉ công khai có bị dò? | Rate limit 20 req/phút, không lộ internal id, log hashed address |
| Phân quyền | Manager có thấy phòng khác không? | Data scope server-side (BR-12), không chỉ ẩn menu |
| Phạm vi | Vì sao không ML? | MVP rule-based giải thích được; ML là hướng tương lai |

---

## 7. Ma trận vết

| Phần trình bày | Số liệu docs_v3 | File |
|----------------|-----------------|------|
| Vòng lặp cốt lõi | F00 | 05 |
| 5 job family / 7 position | §3 | 00, 01 |
| 46 UC / 8 package | UC-01..46 | 04 |
| 17 entity | §3.5 | 07 |
| 3 level | Basic/Intermediate/Advanced | 16 |
| DigComp 3.0 | JRC 2025 | 01, 03B |
