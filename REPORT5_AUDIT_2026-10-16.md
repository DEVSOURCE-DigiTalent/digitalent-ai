# Rà soát Report 5 (v1.1) so với hệ thống và Report 1–4

Ngày: 16/10/2026. Phạm vi: `Report5_Software_Test_Documentation_v1.1.docx`, `Report5_Test_Report_v1.1.xlsx`, `Report5_Unit_Test_v1.1.xlsx`, đối chiếu với Report 2 v2.12, Report 3 v2.14, Report 4 v4.4 và nhánh `feature/test-e2e`.

## 0. Kết quả chạy thật hôm nay (không chỉnh sửa gì)

| Bộ test | Kết quả | Ghi chú |
|---|---|---|
| Backend `dotnet test` | 420 test: 303 pass, 117 fail | Cả 117 lỗi cùng một thông báo: thiếu biến `DIGITALENT_TEST_POSTGRES_CONNECTION`. Đây là lỗi môi trường, không phải lỗi mã. Chưa chạy lại với PostgreSQL. |
| Frontend `vitest run` | 988 test: 948 pass, 40 fail (13/107 file) | Chưa điều tra nguyên nhân. |
| Độ phủ dòng (Coverlet) | Chưa đo | `backend-ci.yml` không có bước thu độ phủ. |

## 1. Lỗi nghiêm trọng: số liệu và kết quả không có căn cứ

| # | Vị trí trong Report 5 | Vấn đề | Căn cứ |
|---|---|---|---|
| S1 | Docx 5.3 và Test Report: "32 lỗi, đóng 100%, sinh ra ở Sprint 2 (24) và Sprint 3 (8)" | Report 2 §2.2.7 ghi rõ Sprint 1–3 không có sổ lỗi chung, chỉ được liệt kê lỗi có bằng chứng (commit, PR, ghi chú). Ghi chú của nhóm: kiểm tra repo cho 32 ứng viên lỗi, nhưng chia S2: 1, S3: 31, trái với 24/8. Số "Round 1 fail" đều đúng 50% ở mọi FE (7/16, 6/12, 5/10, 6/12, 8/16), trông như số được sinh ra, không phải kết quả đo. | Report 2 §2.2.7; MASTER_CONTEXT §12 |
| S2 | Docx 5.5 mục 4: "Domain và Application đạt ≥ 80% line coverage" | Report 2 §2.2.3 nói chưa có phép đo nào, lần đo đầu là Sprint 4. CI không thu độ phủ (không có `--collect`). Chưa có số đo nào để dẫn. | `.github/workflows/backend-ci.yml`; Report 2 §2.2.3 |
| S3 | Docx 5.5 mục 1, 2: "đo trên Staging: login/competencies/departments trung bình dưới 180 ms; container restart trong 18 giây, đạt mục tiêu 30 giây" | Không có file kết quả đo nào trong repo. Mục tiêu "30 giây" không có trong Report 3 (NFR-RE-05 là 15 phút). Report 2 không có "Section 3.2 k6" và không nhắc k6. NFR-PE của Report 3: p95 trong 2 giây với 50 người dùng, không phải p95 < 500 ms. | Report 3 §4.2; Report 2 |
| S4 | Docx 5.5 mục 3: "JWT access token hết hạn 30 phút, đã xác minh" | Code đang cấu hình `ExpiresInMinutes: 480` (8 giờ), refresh 7 ngày. Report 4 v4.4 quyết định 30 phút nhưng code chưa sửa. IT-FE01-001 tự mâu thuẫn: mô tả "30-minute", kết quả mong đợi "480-minute", trạng thái Passed. | `appsettings.json`, `JwtTokenService.cs`, Report 4 §4 |
| S5 | Unit Test xlsx: trạng thái từng test case | Sheet UTC01 dòng "Passed/Failed" ghi `Untested` ở cả 5 case, nhưng dòng kết quả phía trên ghi P và ô tổng ghi 5 Passed; sheet Statistics lấy số từ ô tổng nên báo 34/34 Passed. Ngoài ra UTC04 và UTC08 có ô `Untested` thừa ở cột thứ 5 trong khi chỉ có 4 test case. | `UTC01_Login`, `UTC04_ArchiveDept`, `UTC08_OverrideComp` |
| S6 | Unit Test xlsx: các lớp được thử | 8 trong 12 lớp/hàm không tồn tại trong mã nguồn: `SetPasswordFromLinkUseCase`, `InviteMemberUseCase`, `ActivateRequirementSetUseCase`, `OverrideConfirmedCompetencyUseCase`, `AssignCourseUseCase`, `AssessmentScoringService`, `StartAttemptUseCase`, `EvidenceFinalizationService`, `VerifyCertificateUseCase`. Không có test xUnit nào mang các tên UTC đó. Bảng quyết định là thiết kế, không phải test đã chạy. Test case "đã Passed" ngày 24/09 cho UTC02–UTC08 không có test tương ứng trong repo. | grep `backend/src`, `backend/tests` |

## 2. Lỗi sai/lệch số liệu giữa các phần của Report 5

| # | Vị trí | Hiện tại | Đúng |
|---|---|---|---|
| T1 | Docx §1 | "45 use case (UC-01–UC-45) theo Report 1 v2.9 và Report 3 v2.6" | 48 UC theo Report 1 v2.10, Report 3 v2.14 |
| T2 | Docx §2.1 | "BR-01 đến BR-22"; "45 use case" | BR-01–BR-27; 48 UC |
| T3 | Docx §1, FE-03 | "6 miền, 25 năng lực" | 24 năng lực (TT02) |
| T4 | Docx §2.1 | Trạng thái skill gap "Achieved, Shortfall, Unassessed" | Met, Partial Gap, Gap, Not Assessed (BR-01, BR-17) |
| T5 | Docx §1, §2.1 | Vai trò "Tenant Owner", "Department Manager"; lỗi truy cập trái quyền trả 403 | OWNER, MANAGER, EMPLOYEE, PLATFORM_ADMIN; truy cập bản ghi tổ chức khác trả 404 theo NFR-SE-05 |
| T6 | Docx §4, §5.2 | Tên file `Report5_Unit Test.xls`, `Report5_Test Report.xlsx` | `Report5_Unit_Test_v1.1.xlsx`, `Report5_Test_Report_v1.1.xlsx` |
| T7 | Docx Mục lục | Không có 5.5 trong mục lục; mục 5.5 xuất hiện ngoài TOC, mục 5.2 và 4 lặp lại nguyên đoạn | Cập nhật TOC, bỏ đoạn lặp |
| T8 | Docx Record of Changes | Dòng v1.0 ghi ngày 15/10 nhưng nằm trước các dòng 04/09, 25/09; nội dung v1.1 nói "Section 5.5 đã căn theo staging, k6 Sprint 5" | Sắp xếp theo ngày, bỏ nội dung không có căn cứ |
| T9 | Docx §5.1 / §5.4 | "Total 130 TC, 50.8%" | Giữ 130, nhưng bảng "Test Cases" (37 dòng) cộng lại 126, lệch ở FE-06 (14 vs 18), FE-07 (12 vs 16), FE-08 (12 vs 13), Acceptance (10 vs 5) |
| T10 | Docx §4 | "AT-01 đến AT-05" nhưng bảng Test Cases liệt kê AT-01 (3), AT-02 (3), AT-03 (4) | Thống nhất 5 AT với tên theo sheet Acceptance |
| T11 | Unit Test xlsx Statistics | Tỷ lệ Normal/Abnormal/Boundary tính trên 34 (70,6% + 47,1% + 32,4% = 150%) | Mẫu số là tổng 51 hoặc 34 với cùng một tập tử số |
| T12 | Unit Test xlsx Cover | Mã tài liệu `SE46_Unit Test_v1.0`, issue `v1.1`, version `v1.0` | Thống nhất v1.1; "Project Code" đang là SE46 nhưng Test Report ghi DIGITALENT_AI |
| T13 | Test Report xlsx FE-05 và Unit Test UTC07/08 | Ngày kiểm là số 46244 và 46366 (Excel hiểu thành 10/08/2026 và 10/12/2026): nhầm tháng/ngày (đúng là 08/10 và 12/10/2026) | Sửa thành dữ liệu ngày thật |
| T14 | Docx §5.1 | Cột Test date của FE-01…FE-04 đều chỉ 20/09 và 24/09/2026 | Mỗi vòng cần ngày chạy thật; Report 2 xếp Sprint 3 kết thúc 13/10 |
| T15 | Test Report | Trường Note ghi 32 `DEF-xxx (Closed)` nhưng không có sheet Defects nào trong Report 5; sổ lỗi nằm ở file Tracking | Dẫn sang Defects sheet của Tracking hoặc đưa bảng lỗi vào Report 5 |

## 3. Truy vết yêu cầu sai với Report 3 v2.14

- **Ánh xạ UC–FE sai.** Test Report gán FE-06 = UC-24…UC-30, FE-07 = UC-31…UC-33, FE-08 = UC-34…UC-37, FE-09 = UC-38…UC-45. Trong Report 3, UC-24 là *Request Skill Gap Recalculation* (FE-05), UC-31 là *Revoke Certificate*, UC-34 là *Verify Certificate by QR*, UC-38 là *Review Submission*. Báo cáo cũng xếp "Certificate generation/verification" vào FE-09, trong khi Report 1 đặt ở FE-06.8/06.9 và FE-09 là Platform Admin.
- **UC chưa có test nào:** UC-06, 09, 10, 11, 12, 13, 14, 15, 45, 46, 47, 48 (12/48). UC-46 (Owner Override) và UC-47/48 (kích hoạt/đặt mật khẩu qua email) chỉ có trong Unit Test, không có trong Test Report.
- **BR chưa có test nào:** BR-13, 15, 16, 18, 23, 24, 25, 26, 27 (9/27). Unit Test có nhắc BR-23, 24, 26, 27, nhưng như đã nói ở S6, các test đó không chạy thật.
- **Thông báo:** chỉ 6 mã MSG được dẫn (MSG01, 02, 12, 13, 27, 29); Report 3 có 49.
- **Không có test cho các màn hình mới SC-44…SC-54** (đăng ký doanh nghiệp, Setup Wizard, ma trận quyền, soạn khóa nội bộ, training batch, gợi ý khóa, subscription, audit log tổ chức, tiến độ đào tạo, lịch sử học, Organization 360).

## 4. Sai khác giữa test case và hệ thống hiện tại

| Test case | Nội dung | Thực tế |
|---|---|---|
| IT-FE06-003 | Mô tả "chặn gán khóa ngoài danh mục được cấp (BR-22, MSG29)", nhưng bước và kết quả lại là `POST /me/courses/{id}/enroll` trả 200, status IN_PROGRESS | Mô tả và bước không khớp nhau. |
| IT-FE06-005 | Tiêu đề "→ READY_FOR_ASSESSMENT", kết quả "→ COMPLETED" | Thống nhất theo trạng thái `enrollments` thực. |
| IT-FE06-009 | Kiểm tra bảng `confirmed_competencies` | Bảng này không tồn tại; bảng là `employee_competency_profiles`. |
| FE-09 / UC-34 | Xác minh chứng chỉ (MSG12, MSG13, 20 lần/phút) | `CertificatesController` hiện chỉ có `GET /certificates`; chưa có API xác minh QR hay giới hạn 20 lần/phút. Hai case này không thể Passed trước khi hoàn thiện. |
| Unit UTC08 | "records competency_history with MANUAL_OVERRIDE" | Bảng `competency_history` chưa có trong code (là Target trong DBML chốt). |
| Unit UTC02 | "link hết hạn 24h" | BR-26 nói thời hạn theo cài đặt; cần đối chiếu cấu hình thật. |
| Docx §2.3 / §5.4 | "deploy staging qua SSH, nginx:80", "Linux Staging Host" | `deploy.yml` triển khai lên AWS EC2; không có tài liệu nào gọi đó là môi trường staging. |
| Docx §2.3 | `smoke_api.py` ghi "Py 3.x" | File nằm ở `backend/scripts/smoke_api.py`, chạy trong `backend-ci.yml`: đúng. |
| Docx §2.3 | Công cụ khác: xUnit 2.7.0, FluentAssertions 6.12.0, Moq 4.20.70, InMemory 8.0.3, coverlet 6.0.2, Vitest ^1.6, RTL ^16, oxlint | Khớp với `csproj` và `package.json`. |
| Docx §5.4 | `check:no-mock` | Có trong `frontend-ci.yml`: đúng. |

## 5. Đề xuất sửa (chưa làm gì, chờ bạn chọn)

1. **Trung thực về trạng thái.** Với FE-01…FE-05 và 8 hàm Unit "Passed": nếu nhóm không có minh chứng chạy thật, đổi về `Untested/Planned`, hoặc chạy lại và ghi kết quả thật. Review 2 là ngày 17/10, nên nên chốt hướng này trước.
2. **Chạy test thật để lấy số liệu:** bật PostgreSQL test DB, chạy `dotnet test` có `--collect:"XPlat Code Coverage"`, ghi số pass/fail và độ phủ thật vào 5.2 và 5.5; bỏ phần "staging 180 ms / 18 giây" nếu chưa đo.
3. **Làm lại Unit Test workbook theo mã thật:** map 12 sheet sang use case/service có thật (ví dụ `ActivatePositionRequirementSetUseCase`, `InviteMembersUseCase`, `CreateCourseAssignmentUseCase`, `SubmitMyAttemptUseCase`, `CreateManualEvidenceUseCase`, `SkillGapCalculator`, `LoginUseCase`, `ArchiveDepartmentUseCase`); với hàm chưa có (xác minh chứng chỉ, override) ghi `Not implemented`.
4. **Sửa truy vết theo Report 3 v2.14:** 48 UC, 27 BR, 49 MSG, FE-06…FE-09 đúng ranh giới; thêm test case cho 12 UC và 9 BR còn thiếu, và cho SC-44…SC-54.
5. **Sửa toàn bộ lỗi nhỏ ở bảng T1–T15** (số UC, 24 năng lực, tên vai trò, tên file, TOC, ngày, công thức thống kê).
6. **Sửa token:** hoặc đổi code về 30 phút theo Report 4, hoặc sửa Report 4 và Report 5 về 480 phút. Hiện ba nơi nói ba cách.

## 6. Đã xử lý (16/10/2026) — bản v1.2

Tạo bản mới, giữ nguyên file v1.1:
- `Report5_Software_Test_Documentation_v1.2.docx` (11 trang, mục lục đã cập nhật bằng Word).
- `Report5_Test_Report_v1.2.xlsx`: 172 test case (106 IT, 61 ST, 5 AT), truy vết đủ 48/48 UC và 27/27 BR (sheet Traceability), tất cả Pending; 19 case ghi "Known gap".
- `Report5_Unit_Test_v1.2.xlsx`: 12 hàm dựng lại theo mã thật, 72 test case (18 N / 43 A / 11 B), tất cả Untested; thêm cột trạng thái cài đặt và file xUnit liên quan.

Số liệu chạy thật đưa vào mục 5.2: backend 420 test (303 pass, 117 lỗi do thiếu PostgreSQL), frontend 988 test (948 pass, 40 fail ở 13 file), coverage không có PostgreSQL: Application 37,4%, Domain 79,8%.

### Bổ sung: sheet Defects (16/10/2026)
- `DigiTalent_AI_Project_Tracking_1_3.xlsx` (bản 1_2 giữ nguyên): sheet Defects dựng lại theo Report 2 §2.2.7 với 61 lỗi có bằng chứng (commit fix, báo cáo kiểm tra 29/09 F-01..F-14, báo cáo E2E 03/10, kết quả chạy test 16/10); 18 cột theo Report 2, danh sách chọn cho Severity / Testing Level / Status / Root Cause, bảng tổng hợp tự tính. Các sheet WBS, Issues, Estimate rule không đổi.
- 55 Fixed (chưa retest chéo nên chưa Closed), 6 New; 35 lỗi chưa rõ giai đoạn phát hiện ("Not recorded").
- Report 5 v1.2 mục 5.3 cập nhật theo số liệu này (System test 14 lỗi > giới hạn 8).
