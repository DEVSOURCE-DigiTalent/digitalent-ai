import { DIGCOMP_15_COURSES } from './digcomp15Courses.js';
import CURRICULUM_LESSONS from './curriculumLessons.json' with { type: 'json' };

const outlines = [
  ['A2-F', 'Giao tiếp số cơ bản nơi công sở', '12 giờ', '', [
    'Công cụ giao tiếp cơ bản', 'Chia sẻ tài liệu và thông tin', 'Dịch vụ công trực tuyến',
    'Làm việc nhóm trên công cụ số', 'Ứng xử trên môi trường số', 'Danh tính số cá nhân',
  ]],
  ['A2-I', 'Giao tiếp và cộng tác chuyên nghiệp', '15 giờ', 'A2-F', [
    'Giao tiếp hiệu quả theo tình huống', 'Chia sẻ thông tin có kiểm soát',
    'Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp', 'Điều phối công việc nhóm',
    'Chuẩn mực ứng xử và xử lý tình huống khó', 'Quản lý danh tính nghề nghiệp',
  ]],
  ['A3-F', 'Tạo lập nội dung số cơ bản', '8 giờ', '', [
    'Tạo tài liệu công việc cơ bản', 'Chỉnh sửa và tái sử dụng nội dung',
    'Nguyên tắc bản quyền cơ bản', 'Làm quen tư duy tính toán',
  ]],
  ['A3-I', 'Tạo lập nội dung chuyên nghiệp', '10 giờ', 'A3-F', [
    'Sản xuất nội dung đa định dạng', 'Tích hợp và chuyển đổi nội dung',
    'Bản quyền, giấy phép và sử dụng hợp pháp', 'Tự động hóa công việc lặp lại',
  ]],
  ['A4-F', 'An toàn số cơ bản', '8 giờ', '', [
    'Bảo vệ thiết bị và tài khoản', 'Bảo vệ thông tin cá nhân',
    'Sức khỏe khi làm việc với thiết bị số', 'Sử dụng công nghệ có ý thức môi trường',
  ]],
  ['A4-A', 'Quản trị an toàn và trách nhiệm số', '12 giờ', 'A4-I', [
    'Quản trị an toàn thông tin doanh nghiệp', 'Tuân thủ bảo vệ dữ liệu cá nhân',
    'Chính sách phúc lợi số của tổ chức', 'Chiến lược bền vững số',
  ]],
  ['A5-F', 'Xử lý sự cố và tự học công nghệ', '8 giờ', '', [
    'Xử lý sự cố thường gặp', 'Chọn công cụ phù hợp với công việc',
    'Cải tiến công việc bằng công cụ số', 'Nhận biết và bù đắp khoảng trống năng lực',
  ]],
  ['A5-I', 'Giải quyết vấn đề trong công việc số', '10 giờ', 'A5-F', [
    'Chẩn đoán và xử lý vấn đề kỹ thuật', 'Đánh giá và lựa chọn giải pháp công nghệ',
    'Cải tiến quy trình bằng công cụ số', 'Phát triển năng lực số cho bản thân và nhóm',
  ]],
];

const levelName = { F: 'Cơ bản (Level 1-2)', I: 'Trung cấp (Level 3-4)', A: 'Nâng cao (Level 5-6)' };

export const COURSE_OUTLINES = Object.fromEntries(outlines.map(([id, title, duration, prerequisite, moduleTitles]) => [id, {
  id,
  areaId: `area_${id[1]}`,
  level: levelName[id[3]],
  title,
  duration,
  prerequisite: prerequisite || 'Không',
  objective: `Đề cương gồm ${moduleTitles.length} chủ đề. Nội dung chi tiết và bài đánh giá sẽ được biên soạn từ giáo trình lĩnh vực ${id[1]}.`,
  isOutlineOnly: true,
  modules: moduleTitles.map((name, index) => ({
    id: `${id}-M${index + 1}`,
    code: `${id}-M${index + 1}`,
    title: `Module ${index + 1}: ${name}`,
    description: name,
  })),
}]));

const metadata = { ...DIGCOMP_15_COURSES, ...COURSE_OUTLINES };

export const ALL_DIGCOMP_COURSES = Object.fromEntries(Object.entries(metadata).map(([id, course]) => {
  const textbook = CURRICULUM_LESSONS[id];
  if (!textbook) throw new Error(`Thiếu giáo trình cho khóa ${id}`);
  const modules = textbook.modules.map((lesson, index) => {
    const existing = course.modules[index] || {};
    return {
      ...existing,
      ...lesson,
      code: lesson.id,
      competenceCode: lesson.competence?.match(/\d+\.\d+/)?.[0] || existing.competenceCode,
      title: `Module ${index + 1}: ${lesson.title}`,
      duration: existing.duration || (id.endsWith('-F') ? '2 giờ' : id.endsWith('-I') ? '2,5 giờ' : '3 giờ'),
      description: lesson.theory[0] || existing.description,
    };
  });
  return [id, {
    ...course,
    modules,
    objective: course.isOutlineOnly ? textbook.introduction : course.objective,
    introduction: textbook.introduction,
    finalAssessment: textbook.finalAssessment,
    source: textbook.source,
    isOutlineOnly: false,
    isCommerciallyReady: !course.isOutlineOnly,
    reviewStatus: course.isOutlineOnly ? 'draft_review' : 'demo_ready',
  }];
}));
