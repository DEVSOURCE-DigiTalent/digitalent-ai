import { levelLabelVi } from '../../../../lib/competency-levels';
import { TT02_COMPETENCY_NAMES } from '../../../../lib/reference-positions';
import { CATEGORY_BY_ID, type CatalogCourse } from '../catalog';

/**
 * Content of the 18 standard courses as the personal track shows them. A course of domain N has one module per
 * competency of that domain (A2-I: modules 2.1 … 2.6), each with three lessons: concept, workplace case, guided
 * practice. Each course also carries one practical task.
 */

export type LessonKind = 'VIDEO' | 'READING' | 'PRACTICE';

export interface LessonContent {
  id: string;
  title: string;
  kind: LessonKind;
  durationMinutes: number;
  summary: string;
  body: string[];
  takeaways: string[];
  practice?: string;
}

export interface ModuleContent {
  id: string;
  competencyCode: string;
  title: string;
  lessons: LessonContent[];
}

export interface TaskTemplate {
  title: string;
  brief: string;
  deliverable: string;
  rubric: string[];
}

/** What each competency is about at work, in one phrase. */
const FOCUS: Record<string, string> = {
  '1.1': 'tìm đúng thông tin bằng từ khóa, bộ lọc và nguồn đáng tin',
  '1.2': 'kiểm tra nguồn gốc, thời điểm và độ tin cậy của thông tin',
  '1.3': 'đặt tên, lưu trữ và chia sẻ dữ liệu có tổ chức',
  '2.1': 'chọn kênh liên lạc số phù hợp với người nhận và mức độ gấp',
  '2.2': 'chia sẻ tài liệu đúng người, đúng quyền, đúng phiên bản',
  '2.3': 'dùng dịch vụ công trực tuyến và thực hiện trách nhiệm công dân số',
  '2.4': 'cộng tác trên tài liệu, bảng công việc và cuộc họp trực tuyến',
  '2.5': 'ứng xử chuyên nghiệp, tôn trọng trên các kênh số',
  '2.6': 'quản lý hồ sơ, tài khoản và hình ảnh của bạn trên mạng',
  '3.1': 'soạn văn bản, trình chiếu và nội dung số rõ ràng cho người đọc',
  '3.2': 'chỉnh sửa, kết hợp và chuyển thể nội dung có sẵn',
  '3.3': 'dùng hình ảnh, tài liệu đúng giấy phép và ghi nguồn',
  '3.4': 'mô tả quy trình thành các bước để công cụ tự động hóa thực hiện',
  '4.1': 'bảo vệ thiết bị và tài khoản trước mã độc, lừa đảo',
  '4.2': 'bảo vệ dữ liệu cá nhân của bạn và của khách hàng',
  '4.3': 'giữ sức khỏe và cân bằng khi làm việc với thiết bị số',
  '4.4': 'dùng thiết bị số tiết kiệm năng lượng và xử lý rác điện tử đúng cách',
  '5.1': 'tự chẩn đoán và xử lý sự cố kỹ thuật thường gặp',
  '5.2': 'xác định nhu cầu và chọn công cụ số phù hợp',
  '5.3': 'dùng công nghệ để đổi mới cách làm việc',
  '5.4': 'nhận ra kỹ năng số còn thiếu và tự lập kế hoạch học',
  '6.1': 'hiểu AI tạo sinh làm được gì, không làm được gì và cách ra lệnh hiệu quả',
  '6.2': 'dùng AI có đạo đức, bảo mật dữ liệu và minh bạch',
  '6.3': 'đánh giá chất lượng, rủi ro và chi phí của công cụ AI',
};

/** What a learner does at each level, completing "Ở mức …, bạn …". */
const LEVEL_DOING: Record<number, string> = {
  1: 'thực hiện được với hướng dẫn trong tình huống quen thuộc, đơn giản',
  2: 'tự thực hiện và chọn cách làm phù hợp cho tình huống thường gặp trong công việc',
  3: 'xử lý tình huống phức tạp, hướng dẫn người khác và đề xuất cải tiến cho tổ chức',
};

const DOMAIN_PITCH: Record<number, string> = {
  1: 'Tìm, đánh giá và quản lý thông tin là nền tảng của mọi công việc văn phòng hiện đại.',
  2: 'Làm việc nhóm ngày nay diễn ra phần lớn trên các kênh số: nhắn tin, tài liệu chung, họp trực tuyến.',
  3: 'Ai cũng tạo nội dung số mỗi ngày: email, báo cáo, bài đăng, bảng tính.',
  4: 'Một cú bấm nhầm có thể làm lộ dữ liệu của cả công ty.',
  5: 'Công nghệ thay đổi liên tục; người giỏi là người tự gỡ được vướng mắc và chọn đúng công cụ.',
  6: 'AI tạo sinh đã có mặt trong công việc hằng ngày; dùng đúng cách giúp tiết kiệm hàng giờ mỗi tuần.',
};

const LEVEL_PITCH: Record<number, string> = {
  1: 'Khóa Cơ bản giúp bạn làm đúng các thao tác cốt lõi, có ví dụ từng bước.',
  2: 'Khóa Trung cấp giúp bạn tự xử lý các tình huống thường gặp và chọn cách làm phù hợp.',
  3: 'Khóa Nâng cao giúp bạn xử lý tình huống phức tạp, hướng dẫn đồng nghiệp và đề xuất cải tiến.',
};

const domainOf = (course: CatalogCourse) => Number(course.categoryId.split('-')[1]);

export function competencyCodesOf(course: CatalogCourse): string[] {
  const domain = domainOf(course);
  return Object.keys(TT02_COMPETENCY_NAMES).filter((code) => code.startsWith(`${domain}.`));
}

export function courseDomain(course: CatalogCourse): { number: number; name: string } {
  return { number: domainOf(course), name: CATEGORY_BY_ID.get(course.categoryId)?.name ?? '' };
}

export function courseDescription(course: CatalogCourse): string {
  return `${DOMAIN_PITCH[domainOf(course)]} ${LEVEL_PITCH[course.level]}`;
}

export function courseOutcomes(course: CatalogCourse): string[] {
  return competencyCodesOf(course).map((code) => {
    const focus = FOCUS[code];
    return `${code} · ${focus.charAt(0).toUpperCase()}${focus.slice(1)} ở mức ${levelLabelVi(course.level)}.`;
  });
}

function lessonsFor(course: CatalogCourse, code: string, minutes: number): LessonContent[] {
  const name = TT02_COMPETENCY_NAMES[code];
  const focus = FOCUS[code];
  const label = levelLabelVi(course.level);
  const id = (n: number) => `${course.id}-${code.replace('.', '')}-${n}`;
  return [
    {
      id: id(1),
      title: `${name}: hiểu đúng yêu cầu`,
      kind: 'VIDEO',
      durationMinutes: minutes,
      summary: `Năng lực ${code} ở mức ${label}: ${focus}.`,
      body: [
        `Thông tư 02/2025/TT-BGDĐT mô tả năng lực ${code} "${name}". Ở mức ${label}, bạn ${LEVEL_DOING[course.level]}.`,
        `Bài này giải thích yêu cầu đó bằng ví dụ ở nơi làm việc: ${focus}.`,
        'Cuối bài, bạn tự kiểm tra bằng ba câu hỏi nhanh trước khi sang phần tình huống.',
      ],
      takeaways: [
        `Biết năng lực ${code} yêu cầu gì ở mức ${label}.`,
        'Nhận ra hành vi đạt và chưa đạt trong công việc hằng ngày.',
      ],
    },
    {
      id: id(2),
      title: 'Tình huống tại nơi làm việc',
      kind: 'READING',
      durationMinutes: minutes,
      summary: `Ba tình huống thường gặp và cách xử lý ở mức ${label}.`,
      body: [
        `Mỗi tình huống đặt bạn vào vai một nhân viên văn phòng cần ${focus}.`,
        'Đọc tình huống, tự chọn cách làm, rồi so với lời giải và lý do.',
        'Ghi lại cách làm bạn sẽ áp dụng vào công việc của mình trong phần ghi chú.',
      ],
      takeaways: ['Áp dụng được vào tình huống thật.', 'Biết các lỗi thường gặp và cách tránh.'],
    },
    {
      id: id(3),
      title: 'Thực hành có hướng dẫn',
      kind: 'PRACTICE',
      durationMinutes: minutes,
      summary: 'Làm theo từng bước trên tài liệu hoặc công cụ mẫu.',
      body: [
        'Bài thực hành dùng dữ liệu mẫu, không cần tài khoản công ty.',
        'Làm xong, bạn đánh dấu hoàn thành và chuyển sang năng lực tiếp theo của khóa.',
      ],
      takeaways: ['Tự làm được ít nhất một lần từ đầu đến cuối.'],
      practice: `Thực hiện một việc thật của bạn liên quan đến: ${focus}. Ghi lại các bước bạn đã làm.`,
    },
  ];
}

export function courseModules(course: CatalogCourse): ModuleContent[] {
  const codes = competencyCodesOf(course);
  const lessonMinutes = Math.max(10, Math.round(course.estimatedDurationMinutes / (codes.length * 3)));
  return codes.map((code) => ({
    id: `${course.id}-m${code.replace('.', '')}`,
    competencyCode: code,
    title: `${code} · ${TT02_COMPETENCY_NAMES[code]}`,
    lessons: lessonsFor(course, code, lessonMinutes),
  }));
}

/** One practical task per domain and level. */
const TASKS: Record<number, Record<number, TaskTemplate>> = {
  1: {
    1: {
      title: 'Lập thư mục tài liệu cá nhân theo quy tắc đặt tên',
      brief: 'Sắp xếp lại 20 tệp công việc gần đây vào cấu trúc thư mục rõ ràng và đổi tên theo quy tắc ngày_nội dung_phiên bản.',
      deliverable: 'Ảnh chụp cấu trúc thư mục và bảng quy tắc đặt tên (1 trang).',
      rubric: ['Cấu trúc thư mục theo chủ đề hoặc dự án', 'Tên tệp theo một quy tắc thống nhất', 'Không còn tệp trùng lặp'],
    },
    2: {
      title: 'Kiểm chứng một số liệu thị trường',
      brief: 'Chọn một số liệu được dùng trong báo cáo của phòng, truy về nguồn gốc và đánh giá độ tin cậy.',
      deliverable: 'Bản đánh giá 1 trang: nguồn gốc, phương pháp, thời điểm, kết luận dùng hay không.',
      rubric: ['Tìm được nguồn gốc', 'Đánh giá phương pháp và thời điểm', 'Kết luận có lý do'],
    },
    3: {
      title: 'Thiết kế quy trình quản lý dữ liệu cho nhóm',
      brief: 'Đề xuất cách tổ chức một nguồn dữ liệu chung cho nhóm: phân quyền, quy tắc trường, lịch sử phiên bản.',
      deliverable: 'Tài liệu quy trình 2 trang và sơ đồ luồng dữ liệu.',
      rubric: ['Một nguồn dữ liệu duy nhất', 'Phân quyền theo vai trò', 'Người chịu trách nhiệm và lịch rà soát'],
    },
  },
  2: {
    1: {
      title: 'Thiết lập kênh liên lạc của nhóm',
      brief: 'Liệt kê các loại thông tin nhóm bạn trao đổi và chọn kênh phù hợp cho từng loại.',
      deliverable: 'Bảng "loại thông tin – kênh – thời gian phản hồi".',
      rubric: ['Phân loại thông tin hợp lý', 'Kênh phù hợp mức độ gấp', 'Có quy ước thời gian phản hồi'],
    },
    2: {
      title: 'Tổ chức một buổi làm việc trực tuyến hiệu quả',
      brief: 'Chuẩn bị và điều phối một cuộc họp trực tuyến 30 phút với tài liệu chung và biên bản.',
      deliverable: 'Chương trình họp, liên kết tài liệu chung và biên bản có phân công việc.',
      rubric: ['Chương trình gửi trước', 'Tài liệu soạn chung có phân quyền', 'Biên bản có người phụ trách và hạn'],
    },
    3: {
      title: 'Xây quy tắc ứng xử số cho phòng ban',
      brief: 'Soạn bộ quy tắc ứng xử trên các kênh số của phòng, gồm cách xử lý phản hồi tiêu cực.',
      deliverable: 'Bộ quy tắc 1–2 trang và ví dụ áp dụng.',
      rubric: ['Bao quát kênh nội bộ và bên ngoài', 'Có quy trình xử lý tình huống', 'Dễ hiểu, áp dụng được'],
    },
  },
  3: {
    1: {
      title: 'Soạn một trang giới thiệu sản phẩm',
      brief: 'Viết một trang giới thiệu sản phẩm hoặc dịch vụ của bạn cho khách hàng mới.',
      deliverable: 'Tệp trang giới thiệu (tài liệu hoặc trình chiếu 1–3 trang).',
      rubric: ['Thông điệp chính rõ ràng', 'Bố cục dễ đọc', 'Hình ảnh đúng giấy phép'],
    },
    2: {
      title: 'Chuyển thể một nội dung sang định dạng mới',
      brief: 'Chọn một bài viết hoặc báo cáo cũ, cập nhật số liệu và chuyển thể sang infographic hoặc video ngắn.',
      deliverable: 'Sản phẩm chuyển thể và ghi chú nguồn, giấy phép.',
      rubric: ['Cập nhật số liệu', 'Phù hợp kênh đăng', 'Ghi nguồn và giấy phép đầy đủ'],
    },
    3: {
      title: 'Lập kế hoạch nội dung một quý',
      brief: 'Xây kế hoạch nội dung số cho một quý: chủ đề, định dạng, kênh, quy trình duyệt và tái sử dụng.',
      deliverable: 'Lịch nội dung và quy trình duyệt.',
      rubric: ['Gắn mục tiêu kinh doanh', 'Có quy trình duyệt và bản quyền', 'Có kế hoạch tái sử dụng'],
    },
  },
  4: {
    1: {
      title: 'Rà soát an toàn tài khoản cá nhân',
      brief: 'Kiểm tra mật khẩu, xác thực hai yếu tố và quyền ứng dụng của các tài khoản công việc bạn dùng.',
      deliverable: 'Bảng tự kiểm tra trước và sau khi điều chỉnh (không ghi mật khẩu).',
      rubric: ['Bật xác thực hai yếu tố', 'Mật khẩu riêng cho từng tài khoản', 'Gỡ quyền ứng dụng không cần thiết'],
    },
    2: {
      title: 'Chia sẻ dữ liệu khách hàng an toàn',
      brief: 'Mô phỏng việc gửi danh sách khách hàng cho đối tác: tối thiểu hóa dữ liệu và kiểm soát quyền.',
      deliverable: 'Mô tả các bước đã làm và ảnh chụp thiết lập chia sẻ (đã che dữ liệu).',
      rubric: ['Chỉ gửi trường cần thiết', 'Giới hạn người xem và thời hạn', 'Ghi nhận theo Nghị định 13/2023'],
    },
    3: {
      title: 'Kế hoạch ứng phó khi lộ dữ liệu',
      brief: 'Soạn quy trình xử lý khi phát hiện dữ liệu khách hàng bị lộ: ai làm gì, trong bao lâu.',
      deliverable: 'Quy trình ứng phó 1–2 trang.',
      rubric: ['Các bước theo thời gian', 'Phân vai rõ ràng', 'Có bước thông báo theo quy định'],
    },
  },
  5: {
    1: {
      title: 'Sổ tay xử lý sự cố thường gặp',
      brief: 'Ghi lại 5 sự cố kỹ thuật bạn hay gặp và cách tự xử lý từng sự cố.',
      deliverable: 'Sổ tay 1 trang dạng "triệu chứng – kiểm tra – cách xử lý".',
      rubric: ['Đủ 5 sự cố thật', 'Các bước kiểm tra theo thứ tự', 'Biết khi nào cần gọi kỹ thuật'],
    },
    2: {
      title: 'So sánh và chọn một công cụ số',
      brief: 'Chọn một nhu cầu của nhóm, so sánh 2–3 công cụ theo tiêu chí và đề xuất một lựa chọn.',
      deliverable: 'Bảng so sánh và đề xuất có lý do.',
      rubric: ['Nhu cầu mô tả rõ', 'Tiêu chí gồm chi phí và bảo mật', 'Có kế hoạch dùng thử'],
    },
    3: {
      title: 'Đề xuất cải tiến quy trình bằng công nghệ',
      brief: 'Chọn một quy trình tốn thời gian của phòng, đề xuất cách số hóa và đo hiệu quả.',
      deliverable: 'Đề xuất 2 trang: hiện trạng, giải pháp, chỉ số đo, kế hoạch đào tạo.',
      rubric: ['Đo được hiện trạng', 'Giải pháp khả thi', 'Có chỉ số và kế hoạch hướng dẫn đồng nghiệp'],
    },
  },
  6: {
    1: {
      title: 'Viết câu lệnh AI cho một việc hằng ngày',
      brief: 'Chọn một việc lặp lại (email, tóm tắt), viết câu lệnh cho AI và kiểm tra lại kết quả.',
      deliverable: 'Câu lệnh, kết quả của AI và những chỗ bạn đã sửa.',
      rubric: ['Câu lệnh nêu rõ mục đích và định dạng', 'Đã kiểm tra thông tin', 'Không đưa dữ liệu nhạy cảm'],
    },
    2: {
      title: 'Quy trình dùng AI an toàn cho nhóm',
      brief: 'Soạn hướng dẫn dùng AI cho một việc của nhóm, gồm cách ẩn dữ liệu và kiểm tra kết quả.',
      deliverable: 'Hướng dẫn 1 trang và 3 câu lệnh mẫu.',
      rubric: ['Quy tắc dữ liệu rõ ràng', 'Bước kiểm tra kết quả', 'Câu lệnh mẫu dùng được ngay'],
    },
    3: {
      title: 'Đánh giá một công cụ AI cho doanh nghiệp',
      brief: 'Thử một công cụ AI trên bộ đề của công ty và đánh giá chất lượng, rủi ro, chi phí.',
      deliverable: 'Báo cáo đánh giá 2 trang và đề xuất dùng hay không.',
      rubric: ['Bộ đề thử sát công việc', 'Đánh giá rủi ro dữ liệu và bản quyền', 'Kết luận có số liệu'],
    },
  },
};

export function taskTemplate(course: CatalogCourse): TaskTemplate {
  return TASKS[domainOf(course)][course.level];
}

export const taskIdOf = (courseId: string) => `tsk-${courseId.replace('crs-', '')}`;
export const courseIdOfTask = (taskId: string) => `crs-${taskId.replace('tsk-', '')}`;
