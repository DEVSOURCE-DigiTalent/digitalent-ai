# 17 — Kịch Bản Demo & Bảo Vệ

> Nguồn gốc: `DigiTalent_AI_Script_Final_Combined` (22 slide) và Master System Overview 09/10/2026. Đây là kịch bản làm việc cần rà lại với slide/demo thực tế; không xác nhận chức năng đã triển khai.

---

## 1. Kiểm soát tài liệu

| Mục | Giá trị |
|-----|---------|
| Tên tài liệu | Kịch bản demo & bảo vệ đồ án |
| Phiên bản | 3.2 |
| Trạng thái | Bản nháp |
| Chủ sở hữu | Trần Văn Linh (Leader) |
| Căn cứ | Script 22 slide; Master System Overview §3–7, §10–16 |

**Lịch sử chỉnh sửa**

| Ngày | Phiên bản | Mô tả |
|------|-----------|-------|
| 16/09/2026 | 3.0 | Căn chỉnh số liệu theo baseline cũ |
| 09/10/2026 | 3.1 | Đồng bộ TT02, Enterprise MVP, 4 role, internal certificate và các business rule đã xác nhận |
| 09/10/2026 | 3.2 | Tách recommendation khỏi Owner assignment; đánh dấu AI evaluator là scope expansion chưa xác minh |

---

## 2. Mục đích và phạm vi

Kịch bản nói cho buổi bảo vệ: 22 slide theo thứ tự deck PPTX, kèm **timing**, **ghi chú chỉ tay**, **câu hỏi hội đồng dự kiến** và **kịch bản demo** end-to-end.

**Lưu ý cập nhật baseline:**

| Mục | Script gốc | docs_v3 (dùng khi nói) |
|-----|-----------|------------------------|
| Khung năng lực | DigComp / các bản docs_v3 | **TT02/2025/TT-BGDĐT**, 6 miền và 24 năng lực thành phần theo baseline Report |
| Phạm vi role | 5–6 role trong script cũ | **4 role**: PLATFORM_ADMIN, OWNER, MANAGER, EMPLOYEE |
| Phân tầng đào tạo | Chưa rõ | **3 training tiers**: Basic (TT02 1–2), Intermediate (3–4), Advanced (5–6) |
| Grade lưu trữ | Script cũ khẳng định 3 mức | **GRADE-01 pending**: chưa chốt thang lưu/so sánh; không suy ra từ 3 training tiers |
| Use case/screens | Số liệu legacy | Report 3 v2.2: **44 use-case entries** (UC-24/UC-31 là internal functions), **42 screens** |

---

## 3. Tài liệu tham chiếu

- `DigiTalent_AI_Script_Final_Combined` (bản gốc 22 slide)
- `00_INDEX` §3 (số liệu chuẩn)
- `01_Tong_Quan_Du_An.md`, `04_Use_Case_Danh_Sach_Dac_Ta.md`

---

## 4. Kịch bản 22 slide

> Thời gian tổng ≈ 18 phút. Đọc thử 1–2 lần rồi nói theo ý, không học thuộc từng chữ.

### Slide 1 — Title (~35s)

Em chào thầy cô. Hôm nay nhóm chúng em xin trình bày về đề tài **DigiTalent AI** — nền tảng Enterprise giúp doanh nghiệp xác định năng lực số theo vị trí, nhận biết khoảng cách so với năng lực đã được xác nhận, giao đào tạo phù hợp và review minh chứng năng lực công việc. Để thầy cô hiểu rõ hơn, trước tiên em xin trình bày về bối cảnh và lý do nhóm chọn đề tài này.

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

*(Chỉ tay: chuỗi Job Position → Requirement → Skill Gap → Recommended/Assigned Learning → Practical Evidence.)* DigiTalent AI bắt đầu từ yêu cầu năng lực của vị trí, tự đề xuất khóa học phù hợp với competency còn thiếu, đồng thời cho phép OWNER giao riêng khóa học khi có cập nhật hoặc yêu cầu đào tạo lại. Hoàn thành khóa học, bài thi hoặc chứng chỉ là **Learning Achievement**; các mục này không tự xác nhận **Workplace Competency**. Vòng cốt lõi: **Position Requirement → Skill Gap → Course Recommendation and/or Owner Assignment → Learning/Assessment → Practical Task → (AI proposal, if approved and available) Human Review → Confirmed Competency → Recalculated Gap**.

### Slide 7 — What Is Digital Competence + Why Assess (~100s)

Năng lực số không chỉ là biết dùng máy tính. DigiTalent AI dùng **TT02/2025/TT-BGDĐT** làm khung tham chiếu. Vì "đã tham gia khóa học" hoặc "đã đỗ bài thi" chưa tự chứng minh năng lực làm việc. *(Chỉ tay: Position Requirement vs Confirmed Competency.)* Hệ thống xác định Skill Gap từ yêu cầu vị trí và năng lực được xác nhận qua evidence review. Trong đào tạo, nội dung được phân thành 3 tiers: Basic (TT02 bậc 1–2), Intermediate (3–4), Advanced (5–6). Đây là phân tầng khóa học; cách lưu và so sánh grade vẫn đang chờ quyết định GRADE-01.

### Slide 8 — Standards Landscape (~75s)

*(Chỉ tay: khung tham chiếu.)* Baseline hiện tại của dự án sử dụng **Thông tư 02/2025/TT-BGDĐT**, gồm 6 miền và 24 năng lực thành phần theo Report. DigiTalent AI áp dụng khung này cho Enterprise MVP và giới hạn nội dung đào tạo ở các bậc TT02 1–6, được nhóm thành 3 training tiers.

### Slide 9 — Why TT02 (~115s)

Khung tham chiếu của Enterprise MVP là **TT02/2025/TT-BGDĐT**. Nền tảng cho phép đối chiếu yêu cầu năng lực của vị trí với năng lực đã được xác nhận theo các tiêu chí tham chiếu; không thay thế khung bằng DigComp trong baseline hiện tại.

**Hội đồng hỏi "sao không tự xây khung năng lực?"** — Dạ nhóm dựa trên TT02/2025/TT-BGDĐT làm khung tham chiếu theo baseline dự án, thay vì tự đặt một khung không có căn cứ.

> GRADE-01 vẫn pending: 3 training tiers không quyết định thang grade được lưu hoặc so sánh trong dữ liệu năng lực.

### Slide 10 — Vision & Principles (~40s)

Tầm nhìn: giúp SME **Định nghĩa → Đào tạo → Đánh giá → Xác minh** đúng năng lực số từng vị trí cần. 4 nguyên tắc: (1) lấy vị trí làm gốc, không lấy khóa học; (2) dùng TT02 làm khung tham chiếu; (3) phân biệt learning achievement với workplace competency; (4) con người review evidence và quyết định.

### Slide 11 — Job Architecture (~45s)

*(Chỉ tay: sơ đồ vị trí mẫu trong deck đã được xác nhận.)* Enterprise MVP gắn competency requirements với các position của tổ chức. Số lượng job family/position đưa lên slide phải lấy từ Report 1 và demo seed hiện hành, không dùng các số liệu legacy.

### Slide 12 — MVP Feature Set (1/2) (~30s)

Module: (1) authentication/RBAC với 4 role; (2) tổ chức, phòng ban, vị trí và thành viên; (3) TT02 reference framework và position requirements; (4) standard learning catalog do PLATFORM_ADMIN quản lý, tự động đề xuất theo Skill Gap và OWNER có thể giao riêng khóa học cho nhu cầu cập nhật/đào tạo lại.

### Slide 13 — MVP Feature Set (2/2) (~35s)

Các module tiếp nối: (5) assessment và question bank chuẩn; (6) rule-based Skill Gap; (7) internal employee certificate cho khóa học eligible, QR verification yêu cầu OWNER/MANAGER đăng nhập cùng tổ chức; (8) practical task và evidence review. Certificate không tự xác nhận workplace competency.

### Slide 14 — Scope Discipline (~55s)

Enterprise Capstone MVP tập trung authentication/RBAC, organization, TT02, requirements, Skill Gap, rule-based course recommendations, standard learning/assessment, internal certificate và practical evidence review. AI-assisted Practical Task evaluation là **scope expansion** cần được cập nhật trong Report 1/2 và xác nhận effort trước khi coi là cam kết; code hiện tại chưa được xác minh có chức năng này. Individual/B2C, subscription/payment, public certificate verification, certificate expiry, Trainer role, risk/readiness scoring và custom ML nằm ngoài phạm vi MVP.

Các chức năng ngoài scope có thể được xem xét ở roadmap riêng; không trình bày như cam kết hoặc kết quả của Enterprise MVP.

### Slide 15 — Actors (~25s)

Có 4 role nghiệp vụ: **PLATFORM_ADMIN**, **OWNER**, **MANAGER** (phạm vi phòng ban được phân công) và **EMPLOYEE**. Verification chứng chỉ yêu cầu OWNER/MANAGER đăng nhập vào đúng tổ chức phát hành; không có Public Visitor.

### Slide 16 — Use Case Diagram (~20s)

Report 3 v2.2 có **44 use-case entries**; UC-24 và UC-31 là internal functions được giữ để trace, không phải use case do actor khởi tạo. Ở slide này chỉ trình bày bức tranh tổng quan; đặc tả chi tiết nằm trong SRS.

### Slide 17 — Database Diagram (~20s)

Report 3 có conceptual ERD; logical/physical schema và số lượng bảng phải lấy từ Report 4 đã được rà soát. Cần thể hiện Course Version, Assessment Version và snapshot behavior. GRADE-01 vẫn pending nên không tuyên bố grade storage đã chốt.

### Slide 18 — Technology (~20s)

Stack theo Report 3: frontend **React + TypeScript**, backend **ASP.NET Core/C#**, database **PostgreSQL**. File storage dùng local trong development và S3-compatible/MinIO khi tích hợp; Docker Compose là deployment approach trong tài liệu, không phải xác nhận trạng thái đã triển khai.

### Slide 19 — Project Plan (~25s)

Report 2 v2.5 lập kế hoạch 6 sprint từ 19/08/2026 đến 25/11/2026. Đây là kế hoạch; effort đã thực hiện, mức hoàn thành và kết quả kiểm thử phải dựa trên Project Tracking và evidence theo commit, không suy ra từ kế hoạch.

### Slide 20 — Team & Risk (~45s)

*(Chỉ tay: trái phân công, phải rủi ro.)* Rủi ro chính cần quản lý: scope theo tenant/role; version Position Requirement; giữ Course/Assessment snapshots cho lịch sử; và đồng bộ API giữa frontend/backend. Effort/trạng thái cần báo cáo theo tracking hiện hành.

### Slide 21 — Expected Results (~70s)

Mục tiêu demo: minh họa luồng từ position requirement → Skill Gap → tự động recommendation và/hoặc OWNER assignment riêng → learning/assessment → eligible certificate nếu đủ điều kiện → practical task/evidence → (nếu AI evaluator được duyệt, cập nhật và xác minh) AI proposal → OWNER/MANAGER review → confirmed competency → recalculated gap. Không trình bày AI evaluation như một chức năng hiện có cho đến khi scope Report 1/2 và môi trường demo được xác minh. Điểm task không tương đương competency level; chỉ kết quả review hợp lệ đã duyệt mới có thể tác động Confirmed Competency.

### Slide 22 — Thank You / Q&A (~45s)

Điểm nhấn mạnh: DigiTalent AI kết nối yêu cầu năng lực theo vị trí với đào tạo và minh chứng công việc. Học xong hoặc có certificate là learning achievement; workplace competency chỉ được xác nhận qua evidence review phù hợp. Em xin cảm ơn thầy cô và hội đồng; nhóm sẵn sàng nhận câu hỏi.

---

## 5. Kịch bản demo (end-to-end, ~4 phút)

Một luồng demo duy nhất minh họa vòng lặp cốt lõi:

| Bước | Vai trò | Thao tác | Màn hình |
|------|---------|----------|----------|
| 1 | OWNER | Đăng nhập, mở danh sách vị trí và requirement | Organization / Positions |
| 2 | OWNER | Mở vị trí mẫu, cấu hình competency, required grade và mandatory flag (không có weight) | Position Requirement Editor |
| 3 | OWNER | Kích hoạt requirement set (lưu version cũ) | Position Requirement Editor |
| 4 | Employee | Đăng nhập, mở profile năng lực — thấy Required vs Confirmed → Skill Gap | My Competency Profile & Gap |
| 5 | Hệ thống / OWNER | Hệ thống tạo/cập nhật recommendation theo gap/mapping, nêu lý do; OWNER có thể giao course riêng cho cập nhật/đào tạo lại, kèm hạn nếu cần | Recommended Learning / Assigned Learning |
| 6 | Employee | Bắt đầu học từ recommendation hoặc assignment riêng, hoàn thành lesson và final assessment | Course Player → Assessment Interface |
| 7 | Hệ thống | Chỉ cấp nếu course certificate-eligible, required lessons hoàn tất và final assessment passed | My Certificates |
| 8 | Employee | Mở chứng chỉ, xem QR | My Certificates |
| 9 | OWNER/MANAGER | Quét QR; đăng nhập và xác minh trong đúng tổ chức; thử no-self, wrong-org và revoked outcomes | Authenticated Certificate Verification |
| 10 | Manager | Giao task thực hành cho competency còn thiếu | Practical Task Assignment |
| 11 | Employee | Nộp evidence file/link đúng hạn hoặc trễ hạn; submission trễ vẫn vào review | My Tasks & Evidence Submission |
| 12 | MANAGER/OWNER | **Nếu AI evaluation đã được thêm vào scope và xác minh trên demo:** xem per-criterion proposal, căn cứ và evidence còn thiếu; sửa/duyệt/yêu cầu bổ sung. Proposal score không tự cập nhật competency; chỉ review hợp lệ đã duyệt có thể làm vậy | AI Proposal + Submission Review & Evidence *(planned until verified)* |
| 13 | OWNER | Xem Skill Gap; nếu có lỗi dữ liệu, giảm/reset grade với reason và audit; không tự sửa grade của mình | Scoped competency view/history |

**Chuẩn bị demo:** dùng seed giả lập; chốt requirement, mapping, course eligibility, assessment result và evidence trước khi demo; chuẩn bị case recommendation/assignment riêng, eligible/non-eligible, QR đúng/sai tổ chức, revoke, late submission và Skill Gap states. Nếu AI evaluator chưa có trong build được xác minh, trình bày ở phần đề xuất scope, không giả lập như kết quả đang chạy. Nếu đã được duyệt và triển khai, chuẩn bị case unauthorized/private evidence, prompt injection, evidence thiếu, reviewer override, audit trail và no self-finalization.

---

## 6. Ngân hàng câu hỏi hội đồng dự kiến

| Chủ đề | Câu hỏi | Trả lời gợi ý |
|--------|---------|---------------|
| TT02 | Khung nào làm căn cứ? | Enterprise MVP dùng TT02/2025/TT-BGDĐT theo baseline Report; có 6 miền, 24 năng lực thành phần |
| 3 training tiers | 3 tiers có nghĩa grade lưu cũng chỉ 1–3? | Không. Basic/Intermediate/Advanced nhóm nội dung đào tạo theo TT02 bậc 1–2/3–4/5–6; GRADE-01 về lưu/so sánh vẫn pending |
| Skill Gap | Gap có nghĩa nhân viên không có năng lực? | Không. Gap nghĩa là chưa có confirmed evidence cho competency yêu cầu; Not Assessed khi thiếu position hoặc active requirement |
| Certificate | Có phải hoàn thành khóa nào cũng được cấp? | Không. Chỉ course eligible, required lessons hoàn tất và final assessment passed; certificate không tự xác nhận workplace competency |
| QR | Ai xác minh certificate? | OWNER/MANAGER đăng nhập và thuộc đúng tổ chức phát hành; có no-self check, không có public verification |
| Correction | OWNER có thể tăng grade thủ công? | Không. Chỉ giảm/reset để sửa lỗi dữ liệu, có reason và audit; không tự sửa grade của chính mình |
| Evidence | Nộp trễ có được review? | Có. Late submission vẫn được review và có thể tạo evidence nếu Passed; chỉ level-confirming evidence làm tăng confirmed competency |
| Learning | Recommendation có tự động đăng ký khóa không? | Hệ thống tự đề xuất từ Skill Gap; Employee có thể bắt đầu từ danh sách. OWNER assignment là luồng riêng cho cập nhật/đào tạo lại; hai cơ chế cùng tồn tại |
| Retraining | Giao khóa do cập nhật có bắt buộc Practical Task không? | Chưa chốt. Cần quyết định theo loại cập nhật trước khi ghi acceptance criteria; chưa khẳng định final course assessment hoặc task là bắt buộc |
| AI evaluation | AI có tự chấm và cập nhật competency không? | Nếu được duyệt trong scope, AI chỉ đề xuất per-criterion score, căn cứ và phần thiếu; OWNER/MANAGER review cuối. Điểm task khác competency level và không tự cập nhật năng lực |
| AI scope | Đây đã là chức năng của MVP chưa? | Chưa thể khẳng định; đây là scope expansion cần phản ánh trong Report 1/2 và phải xác minh implementation trước khi demo như tính năng có thật |
| Versioning | Assignment cũ bị ảnh hưởng khi course/test đổi? | Không. Assignment/attempt giữ version và snapshot nội dung áp dụng tại thời điểm tương ứng |
| Phân quyền | MANAGER có thấy phòng khác không? | Không; data scope được áp ở backend theo phòng ban được phân công |

---

## 7. Ma trận vết

| Phần trình bày | Baseline | File |
|----------------|----------|------|
| Vòng lặp cốt lõi | F00 | 05 |
| 4 roles / scope | §4 | 09 |
| 44 use-case entries / 42 screens | Report 3 v2.2 | 04, 10, 13 |
| 3 training tiers under TT02 | §3 | 16 |
| Grade storage | GRADE-01 pending | Master Overview §13 |
| Certificate, QR, evidence rules | §5, §7 | 13, 15, 16 |
