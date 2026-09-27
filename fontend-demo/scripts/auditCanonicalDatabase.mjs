import fs from 'node:fs';
const [dbmlPath, reportPath] = process.argv.slice(2);
if (!dbmlPath || !reportPath) throw new Error('Usage: node scripts/auditCanonicalDatabase.mjs <dbml.txt> <design-report.txt>');
const dbml = fs.readFileSync(dbmlPath,'utf8');
const design = fs.readFileSync(reportPath,'utf8');
const names = [...dbml.matchAll(/^Table (\w+) \{/gm)].map(match=>match[1]);
const inventory = {};
function add(status, names, feature, remaining) { names.split(' ').forEach(name=>{ if(inventory[name]) throw new Error(`Duplicate ${name}`); inventory[name]={status,feature,remaining}; }); }
add('partial','organizations users job_positions employees job_families','Doanh nghiệp, vị trí, nhân sự và tài khoản demo','Dữ liệu lồng nhau; cần chuẩn hóa FK, email, trạng thái và phân quyền máy chủ.');
add('partial','roles','Vai trò mẫu và điều hướng theo vai trò','Chưa có RBAC lưu trữ đúng schema.');
add('backend','permissions user_roles role_permissions refresh_tokens','Phân quyền và vòng đời phiên đăng nhập','Cần API kiểm quyền, token băm, thu hồi phiên; không mô phỏng token bảo mật bằng localStorage.');
add('next','departments','Cơ cấu phòng ban và quản lý trực tiếp','Thêm màn hình phòng ban, phân công trưởng phòng, chặn chu trình quản lý.');
add('next','competency_frameworks competency_framework_mappings competency_level_criteria','Nguồn khung và tiêu chí xác nhận','Thêm registry phiên bản, nguồn tham chiếu, crosswalk do chuyên gia duyệt và tiêu chí hành vi từng mức.');
add('partial','competency_categories competencies','5 nhóm / 21 năng lực thành phần có trong dữ liệu FE','Cần ID, phân loại, trạng thái và quản trị danh mục; không tuyên bố tương đương khung chính thức.');
add('demo','position_requirement_sets position_requirement_items','Soạn nháp, sao chép, kích hoạt, lưu trữ phiên bản khung 9–14 năng lực / 3 mức / tổng 100%','Mô phỏng một lần ghi localStorage; backend cần transaction và unique partial index, kiểm soát cạnh tranh.');
add('next','employee_competency_profiles competency_evidences','Hồ sơ mức đã xác nhận và minh chứng','Chưa có giao dịch xác nhận đa năng lực; không nhập điểm khảo sát hoặc kết quả học làm profile.');
add('partial','courses course_competencies course_prerequisites course_modules lessons learning_materials','15 khóa, 63 module, video liên kết và lộ trình theo lĩnh vực','Chưa tách Module/Lesson đầy đủ; thiếu quản trị publish/version/outcomes và lưu học liệu lên MinIO.');
add('next','course_learning_outcomes lesson_learning_outcomes','Đầu ra K/S/A và ma trận bài học','Cần biên soạn K/S/A có mức mục tiêu và ánh xạ lesson, duyệt trước khi xuất bản.');
add('demo','course_assignments enrollments','Giao khóa theo nhân viên, hạn học và theo dõi trạng thái','Giao thủ công; chưa giao hàng loạt phòng ban, chưa tạo lượt học lại sau hoàn thành.');
add('partial','lesson_progress','Tiến độ module và xem video được lưu theo người học; đồng bộ bảng theo dõi','Cần lesson ID riêng; vị trí phát video không phải thời lượng xem đã xác minh.');
add('partial','question_banks questions question_options assessments assessment_questions assessment_attempts assessment_answers','315 câu hỏi theo giáo trình và kiểm tra trong lớp','Câu hỏi tĩnh, chưa có phiên bản đề bất biến; thiếu lịch sử đầy đủ từng lượt và đáp án đã nộp.');
add('next','certificate_templates certificate_verification_logs','Mẫu chứng chỉ phiên bản và lịch sử tra cứu','Cần template đã duyệt, log tối thiểu và kiểm soát truy cập.');
add('partial','certificates','Xác nhận hoàn thành DEMO và tra cứu trong trình duyệt','Chưa có certificate liên kết qualifying final attempt, PDF, hết hạn hoặc thu hồi.');
add('partial','practical_task_templates task_assignments task_submissions task_evaluations','Đề bài theo khóa, nộp liên kết, màn hình chấm demo','Bài nộp hiện còn một bản gần nhất theo người; cần nhiều phiên bản, người duyệt và scope phòng ban thật.');
add('next','practical_task_targets assigned_task_targets task_submission_files competency_evaluation_results','Nhiệm vụ đa năng lực, snapshot mục tiêu, tệp đính kèm, kết quả từng năng lực','Cần luồng all-target PASSED; không có minh chứng xác nhận nếu một mục tiêu chưa đạt.');
add('demo','skill_gap_runs skill_gap_items','Lưu lần phân tích và snapshot theo khung ACTIVE, level 1–3, priority có trọng số','Profile chưa xác nhận để NULL; tính 0 chỉ trong phép tính. Hệ số bắt buộc 1.5 là giả định demo cần phê duyệt.');
add('next','file_objects system_settings','Kho tệp và cấu hình tổ chức','Cần upload riêng tư/metadata/checksum và cấu hình có phạm vi, lịch sử.');
add('demo','notifications audit_logs','Thông báo giao khóa/đánh dấu đã đọc và nhật ký nghiệp vụ đào tạo mới','Chỉ local demo, không bất biến/bảo mật, chưa email hoặc realtime máy chủ; chưa audit toàn bộ chức năng cũ.');
add('optional','scoring_configs scoring_config_items training_risk_scores readiness_scores','Cấu hình điểm, cảnh báo rủi ro học, chỉ số sẵn sàng','4 bảng mở rộng không chặn vòng đào tạo; cần dữ liệu thực và hiệu chỉnh trước khi hiển thị điểm.');
if (names.length!==59 || new Set(names).size!==59 || names.some(name=>!inventory[name]) || Object.keys(inventory).length!==59) throw new Error('Inventory does not cover exactly 59 tables.');
if (!design.includes('55 required core tables') || !design.includes('BASIC=1')) throw new Error('Unexpected source version');
const labels={demo:'Có thao tác FE mới',partial:'FE mô phỏng một phần',backend:'Hạ tầng backend',next:'Chưa có luồng tương ứng',optional:'Mở rộng tùy chọn'};
const counts=Object.fromEntries(Object.keys(labels).map(status=>[status,names.filter(name=>inventory[name].status===status).length]));
const clean=dbml.split(/\r?\n/).filter(line=>!/^Ref: "scoring_config_items"\."(max_value|min_value)"/.test(line)).join('\n');
const removed=dbml.split(/\r?\n/).length-clean.split('\n').length;
if(removed!==2) throw new Error(`Expected two misleading refs, found ${removed}`);
fs.mkdirSync('docs',{recursive:true});
fs.writeFileSync('docs/DigiTalent_v2_2_reviewed.dbml',clean);
fs.writeFileSync('docs/database-coverage.json',JSON.stringify({sourceVersion:'2.2',date:'2026-09-26',connectedDatabaseTables:0,core:55,optional:4,counts,tables:names.map(name=>({name,...inventory[name]}))},null,2));
const report=`# Kiểm tra database và kế hoạch chức năng DigiTalent AI

Ngày đối chiếu: 26/09/2026. Nguồn: hai tệp Canonical Database Design v2.2 do người dùng cung cấp. Không chạy migration hoặc kiểm thử PostgreSQL.

## 1. Dự án dùng bao nhiêu bảng?

- **55 bảng cốt lõi** phù hợp với vòng vận hành đầy đủ: vị trí → yêu cầu → hồ sơ đã xác nhận → khoảng thiếu → khóa học → bài thi → chứng chỉ học → thực hành → thẩm định → cập nhật hồ sơ.
- **4 bảng mở rộng** về scoring/risk/readiness: có thể dùng khi có dữ liệu, không bắt buộc để chạy vòng cốt lõi.
- Tổng **59 bảng** đang khai báo trong DBML. Bảng password_reset_tokens chỉ được chú thích, không tính; nếu lựa chọn cơ chế reset cần lưu token thì thành 60.
- **0 bảng đã kết nối cơ sở dữ liệu thật** trong repository FE này. React/localStorage và mảng dữ liệu không phải PostgreSQL.
- Mức phủ giao diện dưới đây là phân loại công việc, không phải tỷ lệ hoàn thành migration hoặc số bảng đã triển khai đủ.

| Trạng thái đối chiếu | Số bảng |
|---|---:|
${Object.entries(counts).map(([status,count])=>`| ${labels[status]} | ${count} |`).join('\n')}
| Tổng | 59 |

## 2. Những điểm cần xử lý

1. **Thang mức:** báo cáo mới quy định BASIC=1, INTERMEDIATE=2, ADVANCED=3. FE cũ khảo sát theo 5 lĩnh vực và mức 0–6. Không tự chuyển điểm khảo sát sang confirmed profile; cần crosswalk được chuyên gia duyệt. Khu quản lý đào tạo mới dùng 3 mức; khảo sát cũ được ghi rõ giới hạn.
2. **Độ chi tiết khung:** 5 lĩnh vực không thay cho 9–14 năng lực thành phần. Editor mới chọn từ 21 năng lực hiện có, chặn kích hoạt nếu ngoài 9–14, trùng năng lực, mức sai hoặc tổng trọng số khác 100%.
3. **Hai quan hệ sai ở cuối DBML:** max_value → weight và min_value → component_code trong scoring_config_items không phải quan hệ thực thể, kiểu/ý nghĩa không phù hợp. Bản reviewed.dbml chỉ bỏ hai dòng đó, giữ nguyên 59 bảng còn lại. Chưa xác nhận bằng parser dbdiagram.
4. **DBML chưa là migration:** CHECK level 1–3, giới hạn score, UNIQUE lower(email), unique partial cho ACTIVE khung/FINAL đề/active enrollment, tổng trọng số và 9–14 items phải được triển khai ở EF/PostgreSQL và giao dịch nghiệp vụ. Không chỉ dựa vào UI.
5. **Đào tạo không xác nhận năng lực:** kết quả ôn tập, tiến độ và xác nhận DEMO không được ghi thành hồ sơ năng lực. Module mới không tạo profile khi học xong.
6. **Thẩm định hiện chưa đủ canonical:** màn hình cũ chấm tổng điểm, chưa all-target, snapshot rubric, append-only submission, idempotency hoặc scope reviewer. Đây là phần cần làm tiếp trước khi có confirmed profile thật.
7. **Module/Lesson và bài thi:** dữ liệu FE coi mỗi module như một bài; phải tách hierarchy, K/S/A, phiên bản khóa/đề/câu hỏi và lịch sử từng attempt trước backend.
8. **Tổ chức và phân quyền:** ba công ty trong demo không chứng minh multi-tenant. Tài liệu chỉ seed một tổ chức MVP. Backend cần ràng buộc cùng tổ chức/phòng ban, chống chu trình quản lý và bảo vệ file theo entity cha.
9. **Doanh thu/mentor/AI:** 59 bảng chưa có orders/payments, lịch mentor hoặc hội thoại AI. Không gán audit_logs/system_settings làm nơi lưu các nghiệp vụ đó. Các đề xuất mở rộng trước đây trong RP1 vẫn nằm ngoài baseline.

## 3. Chức năng đã bổ sung trong lần này

### Quản trị doanh nghiệp → Quản lý đào tạo

- Giao khóa theo nhân viên và hạn hoàn thành; ngăn giao trùng khóa trong phạm vi demo; tạo enrollment và thông báo cùng lần lưu dữ liệu cục bộ.
- Xem lượt chưa bắt đầu/đang học/hoàn thành và tiến độ đồng bộ từ lớp học của chính tài khoản nhân viên.
- Soạn phiên bản khung theo 3 mức; sao chép để soạn mới; kích hoạt chỉ khi hợp lệ; lưu trữ ACTIVE trước đó; không sửa nội dung ACTIVE tại chỗ.
- Phân tích khoảng thiếu theo đúng phiên bản khung ACTIVE; lưu snapshot mức hiện tại/đích/trọng số/hệ số, lịch sử phân tích. Chưa có minh chứng xác nhận thì hiển thị “Chưa xác nhận”.
- Nhật ký tạo khung, kích hoạt, tính gap, giao khóa và cập nhật hoàn thành. Nhật ký trình duyệt chưa phải audit bảo mật.

### Nhân viên → Không gian học

- Danh sách khóa doanh nghiệp giao, hạn học, trạng thái và nút vào lớp.
- Hộp thông báo giao khóa, đếm chưa đọc và đánh dấu đã đọc riêng người nhận.
- Tiến độ và hoàn thành lớp cập nhật enrollment để doanh nghiệp theo dõi; không tự tăng confirmed competency.

Giới hạn: chưa giao hàng loạt, chưa có lượt học lại riêng sau hoàn thành, chưa lịch sử mọi attempt, không bảo đảm transaction/concurrency giữa nhiều thiết bị. Khóa chưa thẩm định có nhãn học thử; chưa có publish gate chính thức. Profile xác nhận trong module mới đang trống, chờ bổ sung chuỗi review/evidence thật. Không gọi gợi ý từ khảo sát cũ là canonical recommendation từ confirmed profile.

## 4. Đối chiếu từng bảng (đủ 59)

| Bảng | Hiện trạng FE | Chức năng tương ứng | Còn thiếu |
|---|---|---|---|
${names.map(name=>{const row=inventory[name];return `| \`${name}\` | ${labels[row.status]} | ${row.feature} | ${row.remaining} |`;}).join('\n')}

## 5. Thứ tự thiết kế tiếp theo

| Ưu tiên | Màn hình / luồng | Điều kiện nghiệm thu |
|---|---|---|
| P1 | Phòng ban, vị trí, quản lý trực tiếp và quyền truy cập | Nhân viên thuộc đúng phòng/vị trí; manager chỉ duyệt trong phạm vi; backend chặn truy cập ngoài quyền |
| P1 | Giao bài đa năng lực → nộp v1/v2 → review từng mục tiêu | Một mục tiêu chưa đạt thì không phát sinh level-confirming evidence; tất cả đạt mới cập nhật hồ sơ trong transaction, retry không tạo trùng |
| P1 | Kho học liệu và biên tập khóa/đề thi có phiên bản | Publish khi đủ mapping/KSA/lessons/final assessment; lịch sử người học vẫn truy về bản đã dùng |
| P1 | Gap → đề xuất khóa đã xuất bản → kiểm tra tiên quyết → giao khóa | Giải thích được competency, mức hiện tại/yêu cầu/đầu ra khóa; không ánh xạ cứng Position→Course |
| P2 | Thi cuối khóa, chứng chỉ, hết hạn/thu hồi, tra cứu công khai | Certificate truy vết đúng enrollment/final attempt; public không lộ lý do thu hồi hoặc dữ liệu nội bộ |
| P2 | Upload file riêng tư, cấu hình tổ chức, thông báo và nhật ký | Metadata PostgreSQL; bytes MinIO; thông báo sau commit, không mất đồng bộ khi upload lỗi |
| P3 | Training risk và readiness | Có dữ liệu hoạt động/điểm/hạn học; phiên bản scoring rõ; không chặn vòng học hoặc thay quyết định chuyên gia |

## 6. Cách thử luồng mới

1. Đăng nhập doanh nghiệp → Quản lý đào tạo → Khung vị trí.
2. Chọn vị trí, dùng mẫu để soạn thử hoặc tự chọn năng lực, chỉnh mức/trọng số; lưu nháp và kích hoạt.
3. Sang Khoảng thiếu, chọn nhân viên thuộc vị trí đó, phân tích để xem mức chưa xác nhận và lịch sử theo phiên bản.
4. Sang Giao & theo dõi, giao một khóa và hạn học.
5. Cấp tài khoản trong Cấu hình doanh nghiệp nếu chưa có; đăng xuất và đăng nhập nhân viên đó.
6. Xem khóa được giao và thông báo, vào lớp, hoàn thành module; đăng nhập doanh nghiệp để xem tiến độ.

Thực hiện trong cùng trình duyệt. Không nhập dữ liệu thật hoặc mật khẩu thật vào bản demo.
`;
fs.writeFileSync('docs/DATABASE_FUNCTIONAL_REVIEW.md',report);
console.log(JSON.stringify({tables:names.length,core:55,extensions:4,connectedDatabaseTables:0,counts,removedInvalidRefs:removed},null,2));
