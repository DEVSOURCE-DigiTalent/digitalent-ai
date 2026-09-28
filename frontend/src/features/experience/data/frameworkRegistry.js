// Source frameworks remain separate. These links are editorial proposals,
// not equivalence decisions or a conversion of learner results.
export const FRAMEWORK_VERSION = 'digcomp-3.0-tt02-draft-1';
export const FRAMEWORK_SOURCES = {
  digcomp: { id: 'DIGCOMP_3_0', name: 'DigComp 3.0', published: '2025-11-27', areas: 5, competencies: 21,
    url: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC144121',
    detailsUrl: 'https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digital-competence-framework-digcomp/digcomp-30_en' },
  circular: { id: 'TT02_2025', name: 'Thông tư 02/2025/TT-BGDĐT', published: '2025-01-24', areas: 6, competencies: 24,
    url: 'https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/01/02-bgddt.pdf' },
};
export const PROFICIENCY_SCALES = [
  { id: 'DIGCOMP_3_0', name: 'DigComp 3.0', labels: ['Basic — Cơ bản', 'Intermediate — Trung cấp', 'Advanced — Nâng cao', 'Highly advanced — Rất nâng cao'], note: 'Bốn mức thành thạo. AI tích hợp xuyên suốt 21 năng lực. Bản dịch nhãn do dự án diễn giải.' },
  { id: 'TT02_2025', name: 'Thông tư 02/2025', labels: ['Cơ bản · bậc 1–2', 'Trung cấp · bậc 3–4', 'Nâng cao · bậc 5–6', 'Chuyên sâu · bậc 7–8'], note: 'Bốn trình độ, tám bậc; có miền VI về ứng dụng AI.' },
  { id: 'DIGITALENT_OPERATIONAL_3', name: 'Hồ sơ vận hành DigiTalent', labels: ['Cơ bản · 1', 'Trung cấp · 2', 'Nâng cao · 3'], note: 'Phạm vi nội bộ của dự án; cần minh chứng được duyệt. Chưa tự quy đổi sang bậc Thông tư hoặc mức DigComp.' },
  { id: 'DIGITALENT_DIAGNOSTIC_6', name: 'Khảo sát định hướng hiện có', labels: ['Chỉ số nội bộ 0–6'], note: 'Năm câu hỏi để gợi ý học. Không phải tám bậc Thông tư, không phải mức DigComp 3.0 và không tạo hồ sơ xác nhận.' },
];
export const COURSE_LEVELS = { F: 'Cơ bản', I: 'Trung cấp', A: 'Nâng cao' };
export const FRAMEWORK_AREAS = [
  ['1', 'Tìm kiếm, đánh giá, quản lý thông tin', 'Khai thác dữ liệu và thông tin'],
  ['2', 'Giao tiếp và cộng tác', 'Giao tiếp và hợp tác trong môi trường số'],
  ['3', 'Tạo lập nội dung', 'Sáng tạo nội dung số'],
  ['4', 'An toàn, phúc lợi và sử dụng có trách nhiệm', 'An toàn'],
  ['5', 'Nhận diện và giải quyết vấn đề', 'Giải quyết vấn đề'],
  ['6', 'AI xuyên suốt các lĩnh vực', 'Ứng dụng trí tuệ nhân tạo'],
].map(([id,name,circularName])=>({id,name,circularName}));

const labels = [
  ['1.1','Tìm kiếm và lọc thông tin'],['1.2','Đánh giá thông tin'],['1.3','Quản lý thông tin'],
  ['2.1','Tương tác qua và với công nghệ số'],['2.2','Chia sẻ qua công nghệ số'],['2.3','Tham gia xã hội qua công nghệ số'],['2.4','Cộng tác qua công nghệ số'],['2.5','Ứng xử số'],['2.6','Quản lý danh tính số'],
  ['3.1','Phát triển nội dung số'],['3.2','Tích hợp và biên tập nội dung số'],['3.3','Bản quyền và giấy phép'],['3.4','Tư duy tính toán và lập trình'],
  ['4.1','Bảo vệ thiết bị'],['4.2','Bảo vệ dữ liệu cá nhân và quyền riêng tư'],['4.3','Hỗ trợ sức khỏe và phúc lợi'],['4.4','Bảo vệ môi trường'],
  ['5.1','Nhận diện và xử lý vấn đề kỹ thuật'],['5.2','Nhu cầu và giải pháp công nghệ'],['5.3','Giải pháp sáng tạo bằng công nghệ'],['5.4','Nhận diện và phát triển năng lực số'],
];
export const FRAMEWORK_MAPPINGS = [
  ...labels.map(([code,name])=>({id:`tt02:${code}`,circularCode:code,name,area:code[0],digcompCodes:[code],relation:'CANDIDATE',reviewStatus:'PENDING',rationale:'Đối chiếu chủ đề và mã năng lực trong giáo trình; cần rà từng đầu ra và tiêu chí trước khi xác nhận tương đương.',sourceFile:`giaotrinh-linhvuc${code[0]}.docx`})),
  ...[
    ['6.1','Hiểu biết về trí tuệ nhân tạo',['1.2','5.2']],
    ['6.2','Sử dụng trí tuệ nhân tạo',['3.1','3.3','4.2','5.3']],
    ['6.3','Đánh giá trí tuệ nhân tạo',['1.2','4.3','5.2']],
  ].map(([code,name,digcompCodes])=>({id:`tt02:${code}`,circularCode:code,name,area:'6',digcompCodes,relation:'CROSS_CUTTING_PROPOSAL',reviewStatus:'PENDING',rationale:'Liên kết nhiều năng lực do dự án đề xuất để soạn bài; không phải miền thứ sáu của DigComp và chưa bao quát mọi đầu ra AI của DigComp 3.0.',sourceFile:'giaotrinh-mien6-AI.docx'})),
];
export const FRAMEWORK_ADAPTATION_NOTICE = 'DigiTalent diễn giải và đề xuất đối chiếu phục vụ đào tạo SME. Nguồn DigComp 3.0: Cosgrove & Cachia, JRC, 2025, CC BY 4.0. Ủy ban châu Âu không chịu trách nhiệm về bản diễn giải này; không hàm ý được cơ quan ban hành thẩm định hoặc bảo trợ.';

export function courseFrameworkMetadata(courseId, modules = []) {
  const stage=courseId.slice(-1);
  return { version:FRAMEWORK_VERSION, referenceFrameworkId:'DIGCOMP_3_0', sourceFrameworkId:'TT02_2025',
    scaleId:'DIGITALENT_OPERATIONAL_3', level:COURSE_LEVELS[stage],
    sourceBand:({F:'Bậc 1–2',I:'Bậc 3–4',A:'Bậc 5–6'})[stage],
    alignmentStatus:'PENDING_EXPERT_REVIEW', competencies:[...new Set(modules.map(item=>item.competenceCode).filter(Boolean))] };
}
export function getFrameworkCoverage(courses) {
  const lessons=Object.values(courses).flatMap(course=>course.modules);
  const taught=new Set(lessons.map(lesson=>lesson.competenceCode));
  return { courseCount:Object.keys(courses).length, moduleCount:lessons.length,
    mappedTopics:FRAMEWORK_MAPPINGS.filter(item=>taught.has(item.circularCode)).length,
    missingTopics:FRAMEWORK_MAPPINGS.filter(item=>!taught.has(item.circularCode)).map(item=>item.circularCode),
    approvedMappings:FRAMEWORK_MAPPINGS.filter(item=>item.reviewStatus==='APPROVED').length };
}
export const DEVELOPMENT_PRIORITIES = [
  {id:'P0-1',priority:'P0',title:'Chốt bảng đối chiếu và đầu ra có thể kiểm chứng',finding:'Tài liệu ghi DigComp 3.0 nhưng còn gọi thang 1–8 là mức DigComp. Chưa có bản đối chiếu đầu ra được chuyên gia duyệt.',acceptance:'Mỗi đầu ra có khung/phiên bản, mức, kiến thức–kỹ năng–thái độ, bài thực hành, rubric và người duyệt; không dùng mã trùng để suy tương đương.',tables:'competency_frameworks, competency_framework_mappings, competency_level_criteria'},
  {id:'P0-2',priority:'P0',title:'Nối khoảng thiếu đã xác nhận với gợi ý khóa',finding:'Khảo sát 5 lĩnh vực và khung vận hành 9–14 năng lực đang là hai nguồn riêng. Khoảng thiếu vận hành chưa tự tạo đề xuất khóa.',acceptance:'Đề xuất dựa trên khung ACTIVE và minh chứng, giải thích lý do ghép, kiểm tra tiên quyết và quyền học; lưu snapshot của mỗi vòng.',tables:'skill_gap_runs/items, course_competencies, course_prerequisites, course_assignments'},
  {id:'P0-3',priority:'P0',title:'Chuẩn hóa chấm thực hành và vai trò mentor',finding:'Có nộp lại và duyệt từng năng lực nhưng rubric chủ yếu là điểm nhập tay; mentor và phạm vi phòng ban chưa thành luồng độc lập.',acceptance:'Rubric phiên bản hóa theo mức; phân công mentor, hạn phản hồi, lý do đạt/chưa đạt, khiếu nại; người học không duyệt bài của mình.',tables:'task_evaluations, competency_evaluation_results, competency_evidences, user_roles'},
  {id:'P0-4',priority:'P0',title:'Thống nhất phiên bản giáo trình và trạng thái mở bán',finding:'Có bản lưu nội dung trong khu biên tập; trạng thái thương mại và lớp học mặc định vẫn đọc catalog tĩnh.',acceptance:'Lớp học, câu hỏi, giao khóa, quyền mua và xác nhận đều tham chiếu cùng phiên bản đã được duyệt; xuất bản không tự đồng nghĩa được bán.',tables:'courses, course_modules, lessons, learning_materials; bổ sung course_versions'},
  {id:'P1-1',priority:'P1',title:'Đưa miền AI vào đào tạo có đánh giá',finding:'Đã có 3 khóa và 9 module trong file AI; chưa thuộc 15 khóa, kế hoạch giao học và hồ sơ vận hành.',acceptance:'Duyệt 6.1–6.3, tích hợp AI vào các lĩnh vực còn lại, bổ sung đánh giá đầu vào và rubric; rồi mới cấp quyền học và tính tiến bộ.',tables:'competencies, course_competencies, practical_task_targets, assessments'},
  {id:'P1-2',priority:'P1',title:'Hoàn thiện vòng đời tài khoản và thành viên',finding:'Đã có xác thực và lời mời; chưa có quên mật khẩu, từ chối lời mời, rời doanh nghiệp, đình chỉ thành viên hoặc bàn giao quản trị.',acceptance:'Từng trạng thái có quyền và cách khôi phục; dừng tài trợ khi rời công ty, giữ quyền mua cá nhân, bảo toàn lịch sử.',tables:'users, roles, organization_memberships và organization_invitations đề xuất'},
  {id:'P1-3',priority:'P1',title:'Đối soát gói học và báo cáo doanh thu',finding:'Đơn mua mới và báo cáo doanh thu mẫu cũ dùng hai kho dữ liệu. Chưa có hoàn tiền hay phân bổ chi phí thực tế.',acceptance:'Một nguồn đơn hàng; tách giá trị đơn, đã thanh toán, hoàn tiền, chi phí và ROI; có kỳ báo cáo. Thuế/hóa đơn tiếp tục ngoài phạm vi FE.',tables:'orders, order_items, payments, subscriptions, learning_entitlements đề xuất'},
  {id:'P1-4',priority:'P1',title:'Theo dõi hiệu lực tài liệu và thay đổi pháp lý',finding:'Giáo trình có nội dung dữ liệu cá nhân, hóa đơn, chữ ký số và bản quyền cần rà soát định kỳ; file nguồn cũng nêu yêu cầu này.',acceptance:'Mỗi nguồn có ngày rà soát, người chịu trách nhiệm, phạm vi áp dụng và bài học bị ảnh hưởng; không coi bài giảng là tư vấn pháp lý.',tables:'learning_materials, audit_logs; bổ sung source_documents và source_reviews'},
  {id:'P2-1',priority:'P2',title:'Chuẩn bị thử nghiệm SME và triển khai BE',finding:'Toàn bộ quyền, email, thanh toán và minh chứng vẫn lưu/mô phỏng tại trình duyệt; chưa có cổng bảo mật server.',acceptance:'Thử với 2–3 SME và mentor; hoàn thiện API, tenant scope, upload, transaction, webhook; kiểm thử người dùng, bàn phím/mobile và backup trước pilot thật.',tables:'users, refresh_tokens, file_objects, audit_logs và các bảng giao dịch'},
];
