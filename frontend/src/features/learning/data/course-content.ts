import { CURRICULUM_DATA } from './standard-curriculum';

export interface LessonItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  lessonNo: number;
  title: string;
  durationMinutes: number;
  objective: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  practiceTask?: string;
}

export interface CourseModuleContent {
  id: string;
  moduleNo: number;
  title: string;
  description: string;
  lessons: LessonItem[];
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  competencyCode: string;
}

export interface CourseAssessmentData {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  timeLimitMinutes: number;
  passPercentage: number;
  questions: AssessmentQuestion[];
}

/** Generates realistic modules and lessons for any standard course, using authentic curriculum data when available. */
export function getCourseModules(courseId: string, courseCode: string, courseTitle: string, moduleCount = 3): CourseModuleContent[] {
  const curr = CURRICULUM_DATA[courseCode];
  if (curr && curr.modules.length > 0) {
    return curr.modules.map((m) => {
      const moduleId = `mod-${courseId}-${m.moduleIndex}`;
      const moduleTitle = `Học phần ${m.moduleIndex}: ${m.title} (TT02-${m.competencyCode})`;
      const lessons: LessonItem[] = [
        {
          id: `les-${courseId}-${m.moduleIndex}-1`,
          moduleId,
          moduleTitle,
          lessonNo: 1,
          title: `Bài 1: ${m.title} — Lý thuyết & Quy chuẩn`,
          durationMinutes: 20,
          objective: `Nắm vững chuẩn năng lực ${m.competencyCode}: ${m.objectives.join('; ')}`,
          summary: `Khung kiến thức chuẩn năng lực số cho năng lực ${m.competencyCode}.`,
          content: [
            `Mục tiêu học tập: ${m.objectives.join('; ')}.`,
            ...(m.definitions.length > 0 ? [`Quy chuẩn thuật ngữ chuyên môn:`, ...m.definitions] : []),
            ...m.body,
          ],
          keyTakeaways: m.objectives.length > 0 ? m.objectives.slice(0, 3) : ['Hiểu rõ quy chuẩn năng lực.', 'Nắm vững khái niệm cốt lõi.'],
          practiceTask: `Tự kiểm tra các khái niệm cốt lõi của năng lực ${m.competencyCode} tại doanh nghiệp của bạn.`,
        },
        {
          id: `les-${courseId}-${m.moduleIndex}-2`,
          moduleId,
          moduleTitle,
          lessonNo: 2,
          title: `Bài 2: Tác nghiệp thực tế & Hoàn thiện sản phẩm (${m.competencyCode})`,
          durationMinutes: 25,
          objective: `Ứng dụng năng lực ${m.competencyCode} giải quyết tình huống thực tế và bàn giao sản phẩm đạt chuẩn.`,
          summary: `Phân tích tình huống công sở, các lỗi thường gặp và bài tập thực hành.`,
          content: [
            ...(m.examples.length > 0 ? m.examples : [`Tình huống thực tế ứng dụng trong môi trường doanh nghiệp:`]),
            `Đề bài thực hành: ${m.practice}`,
            `Sản phẩm nộp: ${m.deliverable || 'Bản ghi kết quả thực hiện theo hướng dẫn.'}`,
            'Lưu ý: Luôn tuân thủ quy định bảo vệ an toàn dữ liệu và đạo đức số.',
          ],
          keyTakeaways: [
            `Giải quyết trọn vẹn tình huống nghiệp vụ cho năng lực ${m.competencyCode}.`,
            'Bàn giao sản phẩm công việc đúng hạn và đúng quy chuẩn.',
          ],
          practiceTask: `${m.practice} (Sản phẩm nộp: ${m.deliverable || 'Báo cáo/kết quả thực hiện'}).`,
        },
      ];

      return {
        id: moduleId,
        moduleNo: m.moduleIndex,
        title: moduleTitle,
        description: `Cung cấp kiến thức và kỹ năng thực hành cho năng lực ${m.competencyCode} (${m.title}).`,
        lessons,
      };
    });
  }

  const modules: CourseModuleContent[] = [];
  for (let m = 1; m <= moduleCount; m++) {
    const moduleId = `mod-${courseId}-${m}`;
    const lessons: LessonItem[] = [
      {
        id: `les-${courseId}-${m}-1`,
        moduleId,
        moduleTitle: `Học phần ${m}: Nền tảng và nguyên lý vận hành`,
        lessonNo: 1,
        title: `Bài 1: Tổng quan và mục tiêu năng lực ${m}.1`,
        durationMinutes: 20,
        objective: 'Nắm vững khái niệm cốt lõi, quy chuẩn an toàn và yêu cầu thực tiễn trong môi trường doanh nghiệp.',
        summary: 'Bài học mở đầu giúp học viên định hình bối cảnh ứng dụng và các tiêu chuẩn tuân thủ.',
        content: [
          'Trong kỷ nguyên số, việc chuẩn hóa năng lực theo Khung chuẩn năng lực số là tiêu chuẩn cần thiết cho mọi vị trí công việc.',
          'Học viên cần nhận diện rõ trách nhiệm, các rủi ro tiềm ẩn về an toàn dữ liệu và các công cụ số được tổ chức phê duyệt sử dụng.',
          'Mỗi thao tác xử lý dữ liệu cần tuân thủ nguyên tắc tối thiểu hóa quyền truy cập và kiểm tra xác thực nhiều lớp.',
        ],
        keyTakeaways: [
          'Hiểu rõ phạm vi và mục tiêu năng lực cần đạt được.',
          'Áp dụng quy trình chuẩn khi thao tác trên hệ sinh thái phần mềm doanh nghiệp.',
          'Chủ động phát hiện và báo cáo bất thường về an toàn thông tin.',
        ],
        practiceTask: 'Tự kiểm tra cấu hình bảo mật tài khoản cá nhân và liệt kê các công cụ bạn đang dùng hàng ngày.',
      },
      {
        id: `les-${courseId}-${m}-2`,
        moduleId,
        moduleTitle: `Học phần ${m}: Nền tảng và nguyên lý vận hành`,
        lessonNo: 2,
        title: `Bài 2: Thực hành quy trình và xử lý tình huống thực tế`,
        durationMinutes: 25,
        objective: 'Thực hiện thuần thục các bước tác nghiệp theo kịch bản mẫu và xử lý lỗi thường gặp.',
        summary: 'Bài học thực hành với các tình huống giả định sát với công việc thực tế hàng ngày.',
        content: [
          'Khi phát sinh vấn đề kỹ thuật hoặc yêu cầu chia sẻ dữ liệu liên phòng ban, cần thực hiện theo luồng phê duyệt chuẩn.',
          'Sử dụng các kênh liên lạc được mã hóa và lưu trữ biên bản làm việc trên kho lưu trữ đám mây của tổ chức.',
          'Luôn tạo bản sao lưu định kỳ và kiểm tra tính toàn vẹn của tệp tin trước khi gửi đối tác.',
        ],
        keyTakeaways: [
          'Tuân thủ quy trình phối hợp liên phòng ban.',
          'Bảo vệ dữ liệu nhạy cảm bằng mật khẩu và phân quyền xem/chỉnh sửa.',
          'Ghi nhận nhật ký xử lý công việc đầy đủ.',
        ],
        practiceTask: 'Thực hiện thao tác chia sẻ tệp tài liệu giả lập với quyền Chỉ xem (View Only) và có mật khẩu bảo vệ.',
      },
    ];

    modules.push({
      id: moduleId,
      moduleNo: m,
      title: `Học phần ${m}: ${m === 1 ? 'Kiến thức cốt lõi & Quy chuẩn' : m === 2 ? 'Kỹ năng tác nghiệp & Xử lý tình huống' : 'Tối ưu hóa & Ứng dụng nâng cao'}`,
      description: `Cung cấp kỹ năng thực hành cho học phần ${m} của khóa học ${courseTitle} (${courseCode}).`,
      lessons,
    });
  }
  return modules;
}

/** Generates standard assessment questions for a course, using authentic questions from curriculum data when available. */
export function getCourseAssessment(courseId: string, courseCode: string, courseTitle: string): CourseAssessmentData {
  const curr = CURRICULUM_DATA[courseCode];
  if (curr && curr.modules.length > 0) {
    const rawQuestions = curr.modules.flatMap((m) => m.questions);
    if (rawQuestions.length > 0) {
      const selected = rawQuestions.slice(0, 10);
      return {
        id: `asm-${courseId.replace('crs-', '')}`,
        courseId,
        courseCode,
        courseTitle,
        timeLimitMinutes: 20,
        passPercentage: 70,
        questions: selected.map((q, idx) => ({
          id: `q-${idx + 1}`,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctIndex,
          explanation: q.explanation,
          competencyCode: q.competencyCode,
        })),
      };
    }
  }

  return {
    id: `asm-${courseId.replace('crs-', '')}`,
    courseId,
    courseCode,
    courseTitle,
    timeLimitMinutes: 20,
    passPercentage: 70,
    questions: [

      {
        id: 'q-1',
        questionText: 'Theo Khung chuẩn năng lực số, hành động nào sau đây thể hiện đúng chuẩn mực bảo vệ dữ liệu cá nhân (CMP-4.2)?',
        options: [
          'Lưu trữ danh sách khách hàng chứa số điện thoại trên máy tính cá nhân không cài mật khẩu.',
          'Chia sẻ liên kết truy cập công khai không giới hạn người xem để tiện làm việc nhóm.',
          'Phân quyền truy cập theo vai trò công việc và đặt xác thực 2 yếu tố cho tài khoản lưu trữ.',
          'Gửi toàn bộ dữ liệu khách hàng qua nhóm chat mạng xã hội công cộng.',
        ],
        correctOptionIndex: 2,
        explanation: 'Bảo vệ dữ liệu cá nhân yêu cầu áp dụng nguyên tắc đặc quyền tối thiểu (least privilege) và xác thực an toàn.',
        competencyCode: '4.2',
      },
      {
        id: 'q-2',
        questionText: 'Khi phát hiện một email nghi ngờ lừa đảo (phishing) mạo danh Ban giám đốc yêu cầu chuyển tiền hoặc gửi mật khẩu, bạn cần làm gì trước tiên?',
        options: [
          'Lập tức phản hồi email để hỏi lại người gửi cho chắc chắn.',
          'Nhấn vào đường link trong email để kiểm tra trang đích là gì.',
          'Không nhấp vào bất kỳ liên kết hay tệp đính kèm nào; báo ngay cho bộ phận an ninh thông tin / IT.',
          'Chuyển tiếp email cho toàn bộ đồng nghiệp trong công ty để cảnh báo.',
        ],
        correctOptionIndex: 2,
        explanation: 'Quy tắc an toàn số cơ bản: Tuyệt đối không tương tác với email khả nghi và báo ngay cho IT để xử lý chặn lọc.',
        competencyCode: '4.1',
      },
      {
        id: 'q-3',
        questionText: 'Trong quản lý dữ liệu và thông tin số (TT02-1.3), phương pháp nào giúp tối ưu hóa việc tìm kiếm và lưu trữ dài hạn?',
        options: [
          'Đặt tên tệp tùy ý theo ngày tải về mà không có tiền tố dự án.',
          'Đặt tên tệp theo quy chuẩn thống nhất (YYYYMMDD_TênDuAn_PhienBan) và lưu đúng thư mục quy định.',
          'Lưu tất cả tài liệu ra màn hình chính (Desktop) để tiện bấm mở.',
          'Chỉ lưu trong hòm thư điện tử cá nhân.',
        ],
        correctOptionIndex: 1,
        explanation: 'Quy chuẩn đặt tên có cấu trúc và phân cấp thư mục khoa học giúp truy xuất dữ liệu nhanh chóng và tránh thất lạc.',
        competencyCode: '1.3',
      },
      {
        id: 'q-4',
        questionText: 'Khi sử dụng các công cụ Generative AI (như ChatGPT, Claude) trong công việc hàng ngày (TT02-6.2), điều cấm kỵ là gì?',
        options: [
          'Dùng AI để tóm tắt các văn bản quy phạm pháp luật đã công khai.',
          'Nhập trực tiếp mã nguồn bí mật, dữ liệu định danh khách hàng (PII) hoặc bí mật kinh doanh chưa công bố.',
          'Dùng AI để sửa lỗi chính tả và ngữ pháp tiếng Anh trong email.',
          'Nhờ AI gợi ý ý tưởng xây dựng dàn bài thuyết trình.',
        ],
        correctOptionIndex: 1,
        explanation: 'Đạo đức và an toàn AI cấm tuyệt đối việc đưa dữ liệu mật/nội bộ chưa qua che chắn lên các mô hình AI công cộng.',
        competencyCode: '6.2',
      },
      {
        id: 'q-5',
        questionText: 'Quy tắc ứng xử trên môi trường số (TT02-2.5) đòi hỏi nhân viên khi giao tiếp qua email hoặc kênh chat công việc phải:',
        options: [
          'Sử dụng ngôn từ tôn trọng, rõ ràng, đúng thẩm quyền và tránh viết hoa toàn bộ câu (gây cảm giác quát tháo).',
          'Viết tắt tối đa để tiết kiệm thời gian.',
          'Sử dụng cảm xúc cá nhân và bày tỏ sự tức giận công khai trên nhóm chat chung.',
          'Gửi email không có tiêu đề để người nhận tự mở ra xem.',
        ],
        correctOptionIndex: 0,
        explanation: 'Văn hóa giao tiếp số chuyên nghiệp đề cao sự chuẩn mực, tôn trọng và minh bạch thông tin.',
        competencyCode: '2.5',
      },
      {
        id: 'q-6',
        questionText: 'Để giải quyết một sự cố phần mềm văn phòng bị treo không phản hồi (TT02-5.1), bước xử lý cơ bản đầu tiên nên là:',
        options: [
          'Cài đặt lại toàn bộ hệ điều hành máy tính.',
          'Mở Task Manager (Trình quản lý tác vụ) để kiểm tra mức tài nguyên CPU/RAM và buộc dừng tác vụ bị treo.',
          'Đập mạnh bàn phím hoặc rút phích cắm nguồn điện đột ngột.',
          'Bỏ máy đó và xin công ty cấp máy tính mới.',
        ],
        correctOptionIndex: 1,
        explanation: 'Sử dụng Task Manager để tắt tiến trình treo an toàn là kỹ năng xử lý sự cố công nghệ cơ bản.',
        competencyCode: '5.1',
      },
      {
        id: 'q-7',
        questionText: 'Khi chia sẻ tệp dữ liệu báo cáo tài chính cho phòng ban khác xem tham khảo, tùy chọn quyền nào là an toàn nhất?',
        options: [
          'Quyền Chỉnh sửa (Editor) cho tất cả mọi người có liên kết.',
          'Quyền Chỉ xem (Viewer) cho các tài khoản email cụ thể được cấp quyền.',
          'Tải lên một trang web lưu trữ tệp miễn phí công cộng.',
          'Gửi tệp đính kèm không mã hóa cho bất cứ ai yêu cầu.',
        ],
        correctOptionIndex: 1,
        explanation: 'Chỉ cấp quyền Xem cho đích danh tài khoản có thẩm quyền để tránh rủi ro sửa đổi ngoài ý muốn.',
        competencyCode: '2.2',
      },
      {
        id: 'q-8',
        questionText: 'Thế nào là một mật khẩu mạnh đáp ứng yêu cầu an toàn thông tin doanh nghiệp?',
        options: [
          'Mật khẩu là ngày tháng năm sinh hoặc số điện thoại của bạn.',
          'Dãy số 12345678 hoặc qwerty.',
          'Tối thiểu 8-12 ký tự, bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt, không chứa từ dễ đoán.',
          'Từ "admin123" dễ nhớ cho cả phòng cùng dùng chung.',
        ],
        correctOptionIndex: 2,
        explanation: 'Mật khẩu mạnh cần có độ dài và độ phức tạp cao, không trùng lặp thông tin cá nhân.',
        competencyCode: '4.1',
      },
      {
        id: 'q-9',
        questionText: 'Khi tìm kiếm dữ liệu phục vụ nghiên cứu thị trường (TT02-1.1), cách làm nào cho kết quả chính xác nhất trên Google Search?',
        options: [
          'Chỉ gõ 1 từ chung chung như "báo cáo".',
          'Sử dụng cú pháp tìm kiếm nâng cao: đặt cụm từ trong dấu ngoặc kép "...", toán tử filetype:pdf, site:...',
          'Chỉ bấm vào kết quả đầu tiên bất kể nguồn uy tín hay không.',
          'Xem thông tin từ các bài đăng trên mạng xã hội không có trích dẫn nguồn.',
        ],
        correctOptionIndex: 1,
        explanation: 'Cú pháp tìm kiếm nâng cao giúp lọc chính xác tài liệu uy tín và định dạng cần tìm.',
        competencyCode: '1.1',
      },
      {
        id: 'q-10',
        questionText: 'Việc hợp tác trong môi trường số (TT02-2.4) đạt hiệu quả cao nhất khi các thành viên:',
        options: [
          'Mỗi người dùng một phần mềm riêng và không đồng bộ dữ liệu.',
          'Sử dụng công cụ cộng tác trực tuyến chung, cập nhật tiến độ minh bạch và phản hồi kịp thời trên tài liệu số.',
          'Chỉ trao đổi qua lời nói và không lưu trữ bất kỳ tài liệu nào trên hệ thống.',
          'Ẩn công việc của mình và không cho ai biết tiến độ cho đến ngày cuối cùng.',
        ],
        correctOptionIndex: 1,
        explanation: 'Cộng tác số hiệu quả dựa trên nền tảng dùng chung và tính minh bạch thông tin trong nhóm.',
        competencyCode: '2.4',
      },
    ],
  };
}
