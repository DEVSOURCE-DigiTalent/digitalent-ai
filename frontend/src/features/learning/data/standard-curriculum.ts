/**
 * Standard TT02 & DigComp Curriculum Dataset (Authentic Courseware).
 * Generated from comprehensive training documents in 'tai lieu/':
 * - giaotrinh-linhvuc1.docx to giaotrinh-mien6-AI.docx
 * - khung-chuong-trinh-15-khoa-digcomp (1).docx
 * 
 * Contains 18 courses, 72 modules, 216 lessons, 360 workplace assessment questions,
 * and 18 capstone final tasks with evaluation rubrics.
 */

export interface CurriculumQuestion {
  number: number;
  questionText: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  competencyCode: string;
  level: number;
}

export interface CurriculumModule {
  moduleIndex: number;
  title: string;
  competencyCode: string;
  levelRange: string;
  objectives: string[];
  definitions: string[];
  body: string[];
  examples: string[];
  practice: string;
  deliverable: string;
  questions: CurriculumQuestion[];
  rawQuestions?: string[];
}


export interface CurriculumFinalTask {
  title: string;
  brief: string;
  deliverable: string;
  rubric: string[];
}

export interface CurriculumCourse {
  code: string;
  title: string;
  domainNumber: number;
  level: number;
  description: string;
  modules: CurriculumModule[];
  finalTask: CurriculumFinalTask;
}

export const CURRICULUM_DATA: Record<string, CurriculumCourse> = {
  "A1-F": {
    "code": "A1-F",
    "title": "TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN",
    "domainNumber": 1,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 3 module · 6 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Tìm kiếm thông tin bằng từ khóa",
        "competencyCode": "1.1",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được nhu cầu thông tin",
          "Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số",
          "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng",
          "Xác định được các chiến lược tìm kiếm đơn giản"
        ],
        "definitions": [
          "Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến",
          "Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn",
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Công cụ tìm kiếm: dịch vụ khớp từ khóa người dùng nhập với chỉ mục các trang web đã thu thập sẵn, rồi xếp hạng kết quả theo mức độ liên quan",
          "Từ khóa: các từ mang ý nghĩa chính được dùng để tìm kiếm, thường là danh từ, số, hoặc tên riêng",
          "Kết quả tự nhiên (organic): kết quả được xếp hạng theo mức độ liên quan, không phải trả tiền",
          "Kết quả được tài trợ (sponsored): kết quả xuất hiện do đơn vị trả phí quảng cáo"
        ],
        "body": [
          "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số nghĩa là xác định được nhu cầu thông tin và tìm kiếm được chúng trong môi trường số — không gian ảo nơi dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi qua Internet, phần mềm và nền tảng trực tuyến.",
          "Công cụ tìm kiếm khớp từ khóa người dùng nhập với chỉ mục các trang đã thu thập sẵn, rồi xếp hạng theo mức độ liên quan — nó khớp CHỮ, không hiểu CÂU HỎI như con người. Vì vậy cần rút gọn câu hỏi thành 2–4 từ khóa mang nghĩa chính, thường là danh từ, số, hoặc tên riêng.",
          "Điều hướng — quá trình định hướng và di chuyển trong không gian kỹ thuật số để tìm ra đường đi đến đích mong muốn — thể hiện qua việc đọc tiêu đề, đường dẫn, đoạn trích trên trang kết quả trước khi bấm vào. Kết quả tự nhiên khác với kết quả được tài trợ (quảng cáo trả phí). Khi lượt tìm đầu không ra kết quả phù hợp, cần biết cách đổi từ khóa — đây chính là chiến lược tìm kiếm đơn giản mà Thông tư 02/2025 yêu cầu người học xác định được ở bậc cơ bản."
        ],
        "examples": [],
        "practice": "Cấp trên nhắn bạn: “Tìm giúp anh mức lương tối thiểu vùng hiện tại, khu vực mình đang ở.” Hãy thực hiện: Viết từ khóa sẽ dùng Thực hiện tìm kiếm thật Nếu không ra kết quả tốt trong lần đầu, ghi lại đã đổi từ khóa như thế nào Ghi lại đường dẫn của trang chính thức (cơ quan nhà nước) tìm được Giới hạn: tối đa 3 lượt tìm",
        "deliverable": "Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn chính thức tìm được.",
        "questions": [
          {
            "number": 1,
            "questionText": "Công cụ tìm kiếm hoạt động bằng cách nào?",
            "options": [
              "Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm",
              "Tìm trong mục lục đã được xây dựng từ trước",
              "Hỏi trực tiếp các trang web",
              "Chỉ tìm trong các trang đã được xác minh"
            ],
            "correctIndex": 1,
            "explanation": "Công cụ tìm kiếm khớp từ khóa với chỉ mục đã thu thập trước đó, không quét trực tiếp Internet theo thời gian thực.",
            "competencyCode": "1.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm?",
            "options": [
              "Làm sao để xin nghỉ phép cho đúng",
              "quy định nghỉ phép năm người lao động",
              "nghỉ phép",
              "tôi muốn biết về nghỉ phép năm"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các danh từ và cụm từ chuyên ngành cụ thể, không có từ thừa.",
            "competencyCode": "1.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Kết quả có nhãn “Được tài trợ” nghĩa là gì?",
            "options": [
              "Đây là kết quả chính xác nhất",
              "Trang này đã được kiểm chứng",
              "Đơn vị đó trả tiền để xuất hiện ở vị trí này",
              "Đây là kết quả mới nhất"
            ],
            "correctIndex": 2,
            "explanation": "Quảng cáo trả phí không đồng nghĩa với độ tin cậy hay độ liên quan cao hơn.",
            "competencyCode": "1.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Tìm kiếm “dịch vụ ăn uống” chỉ ra toàn nhà hàng, trong khi bạn cần số liệu ngành ăn uống. Bạn nên làm gì?",
            "options": [
              "Tìm lại y hệt vào ngày khác",
              "Thêm từ như “báo cáo”, “thống kê” vào từ khóa",
              "Thêm nhiều từ nhỏ như “và”, “của”",
              "Bỏ cuộc và hỏi đồng nghiệp"
            ],
            "correctIndex": 1,
            "explanation": "Thêm từ chỉ loại tài liệu định hướng công cụ tìm kiếm sang nhóm nguồn khác.",
            "competencyCode": "1.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Đường dẫn (URL) của một kết quả cho bạn biết điều gì?",
            "options": [
              "Trang đó có bao nhiêu lượt xem",
              "Ai là người/đơn vị đăng nội dung đó",
              "Trang đó có bao nhiêu quảng cáo",
              "Ngày trang được tạo"
            ],
            "correctIndex": 1,
            "explanation": "URL chứa tên miền, cho biết đơn vị chịu trách nhiệm xuất bản trang.",
            "competencyCode": "1.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Công cụ tìm kiếm hoạt động bằng cách nào? A. Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm B. Tìm trong mục lục đã được xây dựng từ trước C. Hỏi trực tiếp các trang web D. Chỉ tìm trong các trang đã được xác minh Đáp án: B — Công cụ tìm kiếm khớp từ khóa với chỉ mục đã thu thập trước đó, không quét trực tiếp Internet theo thời gian thực.",
          "2. Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm? A. Làm sao để xin nghỉ phép cho đúng B. quy định nghỉ phép năm người lao động C. nghỉ phép D. tôi muốn biết về nghỉ phép năm Đáp án: B — Đây là các danh từ và cụm từ chuyên ngành cụ thể, không có từ thừa.",
          "3. Kết quả có nhãn “Được tài trợ” nghĩa là gì? A. Đây là kết quả chính xác nhất B. Trang này đã được kiểm chứng C. Đơn vị đó trả tiền để xuất hiện ở vị trí này D. Đây là kết quả mới nhất Đáp án: C — Quảng cáo trả phí không đồng nghĩa với độ tin cậy hay độ liên quan cao hơn.",
          "4. Tìm kiếm “dịch vụ ăn uống” chỉ ra toàn nhà hàng, trong khi bạn cần số liệu ngành ăn uống. Bạn nên làm gì? A. Tìm lại y hệt vào ngày khác B. Thêm từ như “báo cáo”, “thống kê” vào từ khóa C. Thêm nhiều từ nhỏ như “và”, “của” D. Bỏ cuộc và hỏi đồng nghiệp Đáp án: B — Thêm từ chỉ loại tài liệu định hướng công cụ tìm kiếm sang nhóm nguồn khác.",
          "5. Đường dẫn (URL) của một kết quả cho bạn biết điều gì? A. Trang đó có bao nhiêu lượt xem B. Ai là người/đơn vị đăng nội dung đó C. Trang đó có bao nhiêu quảng cáo D. Ngày trang được tạo Đáp án: B — URL chứa tên miền, cho biết đơn vị chịu trách nhiệm xuất bản trang."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Nhận biết nguồn tin đáng tin cậy",
        "competencyCode": "1.2",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Tên miền (domain): phần địa chỉ chính của một trang web, cho biết ai là đơn vị đứng sau trang đó",
          "Đuôi tên miền: phần cuối của tên miền (.gov.vn, .com, .org…) thường gợi ý loại hình đơn vị sở hữu",
          "Ngày công bố: thời điểm nội dung được đăng tải hoặc cập nhật lần gần nhất"
        ],
        "body": [
          "Đánh giá dữ liệu, thông tin và nội dung số nghĩa là phát hiện được độ tin cậy và độ chính xác của các nguồn chung. Thông tin là dữ liệu đã được tổ chức, xử lý để trở nên có ý nghĩa và dùng để ra quyết định — nhưng không phải thông tin nào tìm được cũng đáng tin.",
          "Đường dẫn cho biết ai là đơn vị công bố. Đuôi tên miền như .gov.vn, .edu.vn, .org, .com mang ý nghĩa khác nhau về mức độ chính thức. Ngày công bố quan trọng vì thông tin có thể đã lỗi thời. Ba dấu hiệu cơ bản của tin không đáng tin: giật tít gây sốc, không có tác giả rõ ràng, không dẫn nguồn kiểm chứng được. Nhiều trang cùng nói một điều không có nghĩa là điều đó đúng — có thể tất cả cùng sao chép từ một nguồn sai."
        ],
        "examples": [],
        "practice": "Cho năm kết quả tìm kiếm về cùng một chủ đề (ví dụ quy mô thị trường bán lẻ Việt Nam), hãy xếp hạng theo độ tin cậy (1 là tin cậy nhất) và giải thích mỗi lựa chọn bằng một câu.",
        "deliverable": "Bảng xếp hạng 5 nguồn kèm lý do.",
        "questions": [
          {
            "number": 1,
            "questionText": "Đuôi tên miền nào thường gắn với cơ quan nhà nước Việt Nam?",
            "options": [
              ".com",
              ".gov.vn",
              ".net",
              ".info"
            ],
            "correctIndex": 1,
            "explanation": ".gov.vn được cấp riêng cho cơ quan nhà nước.",
            "competencyCode": "1.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Một bài viết không ghi tên tác giả hay đơn vị xuất bản. Điều này có nghĩa gì?",
            "options": [
              "Bài viết chắc chắn sai",
              "Không ai chịu trách nhiệm nếu thông tin sai, nên cần thận trọng",
              "Bài viết được viết bởi chuyên gia ẩn danh",
              "Không quan trọng, miễn nội dung đúng"
            ],
            "correctIndex": 1,
            "explanation": "Thiếu trách nhiệm giải trình là dấu hiệu cảnh báo, không phải bằng chứng bài viết sai, nhưng cần thận trọng hơn.",
            "competencyCode": "1.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Với thông tin về mức giá hiện tại, yếu tố nào quan trọng nhất cần kiểm tra?",
            "options": [
              "Độ dài bài viết",
              "Ngày công bố",
              "Số lượt chia sẻ",
              "Màu sắc trang web"
            ],
            "correctIndex": 1,
            "explanation": "Giá cả thay đổi theo thời gian; bài viết cũ có thể đã lỗi thời.",
            "competencyCode": "1.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Tiêu đề “Sốc: Giá tăng gấp 10 lần chỉ sau một đêm!” là dấu hiệu của điều gì?",
            "options": [
              "Tin chính xác, cần hành động ngay",
              "Tiêu đề giật gân, cần kiểm tra kỹ nội dung trước khi tin",
              "Bài viết khoa học",
              "Nguồn chính phủ"
            ],
            "correctIndex": 1,
            "explanation": "Ngôn ngữ cảm xúc mạnh thường nhằm câu view hơn là truyền tải chính xác.",
            "competencyCode": "1.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": ".com có nghĩa là trang đó không đáng tin không?",
            "options": [
              "Đúng, luôn luôn không đáng tin",
              "Sai, .com chỉ có nghĩa là doanh nghiệp/cá nhân đăng ký, cần đánh giá thêm",
              "Đúng, chỉ .gov.vn mới đáng tin",
              ".com chỉ dùng cho trang nước ngoài"
            ],
            "correctIndex": 1,
            "explanation": "Đuôi tên miền là một tín hiệu, không phải kết luận cuối cùng.",
            "competencyCode": "1.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Đuôi tên miền nào thường gắn với cơ quan nhà nước Việt Nam? A. .com B. .gov.vn C. .net D. .info Đáp án: B — .gov.vn được cấp riêng cho cơ quan nhà nước.",
          "2. Một bài viết không ghi tên tác giả hay đơn vị xuất bản. Điều này có nghĩa gì? A. Bài viết chắc chắn sai B. Không ai chịu trách nhiệm nếu thông tin sai, nên cần thận trọng C. Bài viết được viết bởi chuyên gia ẩn danh D. Không quan trọng, miễn nội dung đúng Đáp án: B — Thiếu trách nhiệm giải trình là dấu hiệu cảnh báo, không phải bằng chứng bài viết sai, nhưng cần thận trọng hơn.",
          "3. Với thông tin về mức giá hiện tại, yếu tố nào quan trọng nhất cần kiểm tra? A. Độ dài bài viết B. Ngày công bố C. Số lượt chia sẻ D. Màu sắc trang web Đáp án: B — Giá cả thay đổi theo thời gian; bài viết cũ có thể đã lỗi thời.",
          "4. Tiêu đề “Sốc: Giá tăng gấp 10 lần chỉ sau một đêm!” là dấu hiệu của điều gì? A. Tin chính xác, cần hành động ngay B. Tiêu đề giật gân, cần kiểm tra kỹ nội dung trước khi tin C. Bài viết khoa học D. Nguồn chính phủ Đáp án: B — Ngôn ngữ cảm xúc mạnh thường nhằm câu view hơn là truyền tải chính xác.",
          "5. .com có nghĩa là trang đó không đáng tin không? A. Đúng, luôn luôn không đáng tin B. Sai, .com chỉ có nghĩa là doanh nghiệp/cá nhân đăng ký, cần đánh giá thêm C. Đúng, chỉ .gov.vn mới đáng tin D. .com chỉ dùng cho trang nước ngoài Đáp án: B — Đuôi tên miền là một tín hiệu, không phải kết luận cuối cùng."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Lưu trữ và sắp xếp tài liệu",
        "competencyCode": "1.3",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số",
          "Nhận biết được nơi để sắp xếp chúng một cách đơn giản trong môi trường có cấu trúc"
        ],
        "definitions": [
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý",
          "Định dạng tệp: loại tệp được xác định bởi phần đuôi sau dấu chấm trong tên tệp (.pdf, .xlsx…), quyết định phần mềm nào mở được và có sửa được không",
          "Thư mục: nơi chứa và tổ chức các tệp theo một cấu trúc nhất định",
          "Quy tắc đặt tên: cách thống nhất đặt tên tệp để dễ tìm và sắp xếp đúng thứ tự"
        ],
        "body": [
          "Quản lý dữ liệu, thông tin và nội dung số nghĩa là xác định được cách tổ chức, lưu trữ và truy xuất chúng một cách đơn giản, và nhận biết nơi sắp xếp trong môi trường có cấu trúc — không gian mà các thành phần dữ liệu được tổ chức theo quy tắc rõ ràng, giúp dễ tìm kiếm và xử lý.",
          "Các định dạng phổ biến — văn bản, bảng tính, trình chiếu, PDF, ảnh — mỗi loại phù hợp một mục đích khác nhau. Nên tải tệp có chủ đích thay vì để mặc định. Quy tắc đặt tên nhất quán (ngày trước, không dấu, không ký tự đặc biệt) giúp dễ tìm lại. Thư mục cơ bản nên phân theo chủ đề hoặc dự án. Cần phân biệt giữa lưu (ghi đè bản cũ) và lưu thành bản mới (tạo phiên bản riêng) để tránh mất dữ liệu gốc."
        ],
        "examples": [],
        "practice": "Tìm và tải ba tài liệu (PDF hoặc Excel) về một chủ đề công việc tự chọn. Tạo một thư mục mới đặt tên rõ ràng, đổi tên cả ba tệp theo công thức trên, và chụp ảnh màn hình thư mục hoàn chỉnh.",
        "deliverable": "Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bạn nhận được số liệu cần chỉnh sử",
            "options": [
              "Bạn nên yêu cầu định dạng nào? A. .pdf",
              ".jpg",
              ".xlsx",
              ".pptx"
            ],
            "correctIndex": 2,
            "explanation": "File Excel cho phép chỉnh sửa số liệu trực tiếp.",
            "competencyCode": "1.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Mặc định, trình duyệt lưu file tải về ở đâu?",
            "options": [
              "Thư mục Documents",
              "Thư mục Downloads",
              "Màn hình chính",
              "Ngẫu nhiên"
            ],
            "correctIndex": 1,
            "explanation": "Downloads là thư mục mặc định trừ khi được cấu hình khác.",
            "competencyCode": "1.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Tên tệp nào đúng quy tắc nhất?",
            "options": [
              "bao-cao-final-v2-that.docx",
              "2026-04-09_bao-cao-thang4.docx",
              "document1.docx",
              "BÁO CÁO MỚI!!.docx"
            ],
            "correctIndex": 1,
            "explanation": "Bắt đầu bằng ngày theo định dạng năm-tháng-ngày, không dấu cách, không ký tự đặc biệt.",
            "competencyCode": "1.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Vì sao nên đặt ngày ở đầu tên tệp theo định dạng năm-tháng-ngày?",
            "options": [
              "Để tên ngắn hơn",
              "Để khi sắp xếp theo tên, tệp tự xếp theo thứ tự thời gian",
              "Vì máy tính yêu cầu",
              "Không có lý do đặc biệt"
            ],
            "correctIndex": 1,
            "explanation": "Định dạng năm-tháng-ngày sắp xếp đúng theo thời gian khi liệt kê theo bảng chữ cái.",
            "competencyCode": "1.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "File PDF phù hợp nhất cho mục đích nào?",
            "options": [
              "Tính toán số liệu",
              "Chia sẻ tài liệu giữ nguyên bố cục để in hoặc gửi",
              "Vẽ biểu đồ",
              "Soạn thảo cần chỉnh sửa nhiều"
            ],
            "correctIndex": 1,
            "explanation": "PDF cố định bố cục, phù hợp chia sẻ/in nhưng khó chỉnh sửa.",
            "competencyCode": "1.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Bạn nhận được số liệu cần chỉnh sửa. Bạn nên yêu cầu định dạng nào? A. .pdf B. .jpg C. .xlsx D. .pptx Đáp án: C — File Excel cho phép chỉnh sửa số liệu trực tiếp.",
          "2. Mặc định, trình duyệt lưu file tải về ở đâu? A. Thư mục Documents B. Thư mục Downloads C. Màn hình chính D. Ngẫu nhiên Đáp án: B — Downloads là thư mục mặc định trừ khi được cấu hình khác.",
          "3. Tên tệp nào đúng quy tắc nhất? A. bao-cao-final-v2-that.docx B. 2026-04-09_bao-cao-thang4.docx C. document1.docx D. BÁO CÁO MỚI!!.docx Đáp án: B — Bắt đầu bằng ngày theo định dạng năm-tháng-ngày, không dấu cách, không ký tự đặc biệt.",
          "4. Vì sao nên đặt ngày ở đầu tên tệp theo định dạng năm-tháng-ngày? A. Để tên ngắn hơn B. Để khi sắp xếp theo tên, tệp tự xếp theo thứ tự thời gian C. Vì máy tính yêu cầu D. Không có lý do đặc biệt Đáp án: B — Định dạng năm-tháng-ngày sắp xếp đúng theo thời gian khi liệt kê theo bảng chữ cái.",
          "5. File PDF phù hợp nhất cho mục đích nào? A. Tính toán số liệu B. Chia sẻ tài liệu giữ nguyên bố cục để in hoặc gửi C. Vẽ biểu đồ D. Soạn thảo cần chỉnh sửa nhiều Đáp án: B — PDF cố định bố cục, phù hợp chia sẻ/in nhưng khó chỉnh sửa."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M1-F",
      "brief": "Quản lý nhắn: “Em tìm giúp anh vài thông tin cơ bản về [chủ đề công việc], anh cần trước cuối ngày.” Hãy hoàn thành:\nViết từ khóa sẽ dùng để tìm\nTìm 3 nguồn, đánh giá sơ bộ độ tin cậy mỗi nguồn bằng 1 câu\nTải 1 tệp về, lưu vào thư mục đặt tên đúng quy ước\nViết 5 gạch đầu dòng tóm tắt thông tin tìm được, mỗi gạch đầu dòng ghi rõ lấy từ nguồn nào\nTiêu chí chấm:\nTừ khóa hợp lý, không phải câu hỏi nguyên văn\n3 nguồn có đánh giá độ tin cậy hợp lý\nTệp lưu đúng thư mục, đặt tên đúng quy ước\nTóm tắt có dẫn nguồn cho từng ý\nTrình bày rõ ràng, đúng thời hạn\nĐiểm đạt: ≥70/100.",
      "deliverable": "Hình thức nộp: 1 tài liệu tổng hợp (tối đa 1 trang) và ảnh chụp thư mục.",
      "rubric": []
    }
  },
  "A1-I": {
    "code": "A1-I",
    "title": "CHIẾN LƯỢC TÌM KIẾM VÀ QUẢN LÝ THÔNG TIN",
    "domainNumber": 1,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 3 module · 7,5 giờ · Tiên quyết: M1-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Chiến lược tìm kiếm và toán tử",
        "competencyCode": "1.1",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Minh họa được nhu cầu thông tin",
          "Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số",
          "Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng",
          "Tổ chức được các chiến lược tìm kiếm"
        ],
        "definitions": [
          "Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến",
          "Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn",
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Nhu cầu thông tin: mô tả cụ thể về phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra cần có trước khi bắt đầu tìm kiếm",
          "Ma trận từ khóa: bảng liệt kê từ khóa lõi cùng các từ đồng nghĩa, từ thu hẹp, từ mở rộng liên quan",
          "Toán tử tìm kiếm: ký hiệu đặc biệt (\" \", site:, filetype:…) giúp thu hẹp hoặc mở rộng kết quả tìm kiếm theo ý muốn"
        ],
        "body": [
          "Ở mức trung cấp, việc tổ chức tìm kiếm dữ liệu và mô tả cách truy cập, điều hướng đòi hỏi trước tiên minh họa rõ nhu cầu thông tin: phạm vi, thời gian, mức chi tiết, và sản phẩm đầu ra mong muốn trước khi bắt đầu tìm kiếm.",
          "Ma trận từ khóa — bảng liệt kê từ khóa lõi cùng từ đồng nghĩa, từ thu hẹp, từ mở rộng — giúp tổ chức chiến lược tìm kiếm có hệ thống thay vì tìm ngẫu nhiên. Toán tử tìm kiếm (dấu ngoặc kép để khóa cụm từ, site: để giới hạn nguồn, filetype: để lọc định dạng, dấu trừ để loại trừ) giúp thu hẹp hoặc mở rộng kết quả theo ý muốn. Chọn công cụ tìm kiếm phù hợp với loại nguồn cần tìm, và biết quy tắc dừng tìm kiếm khi đã đủ thông tin cần thiết."
        ],
        "examples": [],
        "practice": "Tìm văn bản quy định chính thức về một chủ đề (ví dụ an toàn thực phẩm, bảo vệ dữ liệu cá nhân), dạng PDF, ban hành trong ba năm gần nhất. Không được duyệt menu trang web — chỉ dùng toán tử. Ghi lại từng bước tinh chỉnh câu truy vấn (tối thiểu năm bước) và nộp đường dẫn văn bản gốc tìm được.",
        "deliverable": "Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc.",
        "questions": [
          {
            "number": 1,
            "questionText": "site:gov.vn \"an toàn thực phẩm\" filetype:pdf sẽ trả về kết quả nào?",
            "options": [
              "Tất cả trang nói về an toàn thực phẩm",
              "Chỉ file PDF trên các trang chính phủ có đúng cụm từ này",
              "Chỉ tin tức",
              "Không ra kết quả nào"
            ],
            "correctIndex": 1,
            "explanation": "Ba toán tử kết hợp: giới hạn miền, cụm từ chính xác, định dạng file.",
            "competencyCode": "1.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Để loại bỏ kết quả về tuyển sinh khi tìm về đào tạo nhân viên, dùng cú pháp nào?",
            "options": [
              "+tuyển sinh",
              "-tuyển-sinh",
              "\"tuyển sinh\"",
              "site:tuyensinh"
            ],
            "correctIndex": 1,
            "explanation": "Dấu trừ loại trừ từ khỏi kết quả.",
            "competencyCode": "1.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao cần xây nhiều vựng từ đồng nghĩa thay vì chỉ một bộ từ khóa?",
            "options": [
              "Để tìm nhanh hơn",
              "Vì các đơn vị khác nhau dùng từ ngữ khác nhau cho cùng khái niệm",
              "Vì công cụ yêu cầu",
              "Để tránh trùng lặp"
            ],
            "correctIndex": 1,
            "explanation": "Từ vựng khác nhau chạm tới nhóm nguồn xuất bản khác nhau.",
            "competencyCode": "1.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "OR phải viết như thế nào để có tác dụng?",
            "options": [
              "Viết thường “or”",
              "Viết hoa “OR”",
              "Không quan trọng",
              "Phải có dấu ngoặc"
            ],
            "correctIndex": 1,
            "explanation": "Google chỉ nhận diện toán tử OR khi viết hoa.",
            "competencyCode": "1.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Trước khi tìm kiếm, bước đầu tiên nên làm là gì?",
            "options": [
              "Gõ ngay câu hỏi vào công cụ tìm kiếm",
              "Xác định rõ phạm vi, thời gian, mức chi tiết, sản phẩm cần có",
              "Mở nhiều tab cùng lúc",
              "Hỏi đồng nghiệp trước"
            ],
            "correctIndex": 1,
            "explanation": "Định nghĩa nhu cầu rõ ràng trước khi tìm giúp tránh lãng phí thời gian.",
            "competencyCode": "1.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. site:gov.vn \"an toàn thực phẩm\" filetype:pdf sẽ trả về kết quả nào? A. Tất cả trang nói về an toàn thực phẩm B. Chỉ file PDF trên các trang chính phủ có đúng cụm từ này C. Chỉ tin tức D. Không ra kết quả nào Đáp án: B — Ba toán tử kết hợp: giới hạn miền, cụm từ chính xác, định dạng file.",
          "2. Để loại bỏ kết quả về tuyển sinh khi tìm về đào tạo nhân viên, dùng cú pháp nào? A. +tuyển sinh B. -tuyển-sinh C. \"tuyển sinh\" D. site:tuyensinh Đáp án: B — Dấu trừ loại trừ từ khỏi kết quả.",
          "3. Vì sao cần xây nhiều vựng từ đồng nghĩa thay vì chỉ một bộ từ khóa? A. Để tìm nhanh hơn B. Vì các đơn vị khác nhau dùng từ ngữ khác nhau cho cùng khái niệm C. Vì công cụ yêu cầu D. Để tránh trùng lặp Đáp án: B — Từ vựng khác nhau chạm tới nhóm nguồn xuất bản khác nhau.",
          "4. OR phải viết như thế nào để có tác dụng? A. Viết thường “or” B. Viết hoa “OR” C. Không quan trọng D. Phải có dấu ngoặc Đáp án: B — Google chỉ nhận diện toán tử OR khi viết hoa.",
          "5. Trước khi tìm kiếm, bước đầu tiên nên làm là gì? A. Gõ ngay câu hỏi vào công cụ tìm kiếm B. Xác định rõ phạm vi, thời gian, mức chi tiết, sản phẩm cần có C. Mở nhiều tab cùng lúc D. Hỏi đồng nghiệp trước Đáp án: B — Định nghĩa nhu cầu rõ ràng trước khi tìm giúp tránh lãng phí thời gian."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Đánh giá và so sánh nguồn tin",
        "competencyCode": "1.2",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số",
          "Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Tiêu chí đánh giá nguồn tin: các yếu tố dùng để xét độ tin cậy của một nguồn — tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng",
          "Nguồn sơ cấp: nơi số liệu hoặc thông tin được tạo ra lần đầu tiên",
          "Nguồn thứ cấp: nơi trích dẫn hoặc tổng hợp lại từ nguồn sơ cấp",
          "Trích dẫn vòng: hiện tượng nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng"
        ],
        "body": [
          "Ở mức trung cấp, việc thực hiện phân tích, so sánh và đánh giá độ tin cậy của nguồn dữ liệu đã được tổ chức rõ ràng đòi hỏi áp dụng năm tiêu chí: tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng.",
          "Cần phân biệt nguồn sơ cấp (nơi thông tin được tạo ra lần đầu) và nguồn thứ cấp (nơi trích dẫn hoặc tổng hợp lại). Hiện tượng trích dẫn vòng xảy ra khi nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng. Khi các nguồn uy tín đưa ra số liệu khác nhau, thường do khác biệt về định nghĩa hoặc phương pháp đo lường — nên báo cáo khoảng giá trị thay vì một con số duy nhất khi các nguồn còn mâu thuẫn."
        ],
        "examples": [],
        "practice": "Cấp trên cần một con số cho slide, ví dụ “số lượng doanh nghiệp vừa và nhỏ tại Việt Nam.” Tìm ba nguồn khác nhau, lập bảng so sánh năm cột như trên, chỉ ra ít nhất một điểm khác biệt về định nghĩa hoặc phương pháp, và viết hai câu khuyến nghị nên dùng con số nào và vì sao.",
        "deliverable": "Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn.",
        "questions": [
          {
            "number": 1,
            "questionText": "Nguồn sơ cấp là gì?",
            "options": [
              "Nguồn được xuất bản đầu tiên trên Google",
              "Nơi số liệu được tạo ra ban đầu",
              "Trang có nhiều lượt xem nhất",
              "Trang chính phủ"
            ],
            "correctIndex": 1,
            "explanation": "Sơ cấp là nơi gốc tạo ra dữ liệu, không phụ thuộc kênh xuất bản.",
            "competencyCode": "1.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Năm trang web cùng trích “theo một nghiên cứu” nhưng đều dẫn về một bài blog gốc chưa kiểm chứng. Đây là hiện tượng gì?",
            "options": [
              "Bằng chứng đáng tin vì nhiều nguồn xác nhận",
              "Hiện tượng trích dẫn vòng — không phải xác nhận độc lập",
              "Dấu hiệu thông tin chính xác",
              "Không có vấn đề gì"
            ],
            "correctIndex": 1,
            "explanation": "Năm nguồn nhưng chỉ một gốc; sự lặp lại không tạo thêm bằng chứng.",
            "competencyCode": "1.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Hai nguồn uy tín đưa số liệu khác nhau về cùng một chỉ tiêu. Nguyên nhân phổ biến nhất là gì?",
            "options": [
              "Một trong hai chắc chắn sai",
              "Khác biệt về định nghĩa, kỳ báo cáo hoặc phương pháp đo",
              "Lỗi đánh máy",
              "Không có nguyên nhân hợp lý"
            ],
            "correctIndex": 1,
            "explanation": "Khác biệt phương pháp luận là nguyên nhân phổ biến nhất, không phải sai sót.",
            "competencyCode": "1.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Tiêu chí nào trong năm tiêu chí đánh giá kiểm tra xem trang có mục đích bán hàng hay không?",
            "options": [
              "Tác giả",
              "Mục đích",
              "Bằng chứng",
              "Khả năng kiểm chứng"
            ],
            "correctIndex": 1,
            "explanation": "Tiêu chí “mục đích” hỏi trang tồn tại để làm gì.",
            "competencyCode": "1.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Khi so sánh hai nguồn có số liệu khác nhau, bước đầu tiên nên làm là gì?",
            "options": [
              "Chọn số liệu cao hơn",
              "So sánh định nghĩa và phương pháp trước khi so sánh con số",
              "Lấy trung bình cộng",
              "Bỏ qua cả hai"
            ],
            "correctIndex": 1,
            "explanation": "Hiểu đúng điều đang được đo trước khi kết luận về sự khác biệt.",
            "competencyCode": "1.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Nguồn sơ cấp là gì? A. Nguồn được xuất bản đầu tiên trên Google B. Nơi số liệu được tạo ra ban đầu C. Trang có nhiều lượt xem nhất D. Trang chính phủ Đáp án: B — Sơ cấp là nơi gốc tạo ra dữ liệu, không phụ thuộc kênh xuất bản.",
          "2. Năm trang web cùng trích “theo một nghiên cứu” nhưng đều dẫn về một bài blog gốc chưa kiểm chứng. Đây là hiện tượng gì? A. Bằng chứng đáng tin vì nhiều nguồn xác nhận B. Hiện tượng trích dẫn vòng — không phải xác nhận độc lập C. Dấu hiệu thông tin chính xác D. Không có vấn đề gì Đáp án: B — Năm nguồn nhưng chỉ một gốc; sự lặp lại không tạo thêm bằng chứng.",
          "3. Hai nguồn uy tín đưa số liệu khác nhau về cùng một chỉ tiêu. Nguyên nhân phổ biến nhất là gì? A. Một trong hai chắc chắn sai B. Khác biệt về định nghĩa, kỳ báo cáo hoặc phương pháp đo C. Lỗi đánh máy D. Không có nguyên nhân hợp lý Đáp án: B — Khác biệt phương pháp luận là nguyên nhân phổ biến nhất, không phải sai sót.",
          "4. Tiêu chí nào trong năm tiêu chí đánh giá kiểm tra xem trang có mục đích bán hàng hay không? A. Tác giả B. Mục đích C. Bằng chứng D. Khả năng kiểm chứng Đáp án: B — Tiêu chí “mục đích” hỏi trang tồn tại để làm gì.",
          "5. Khi so sánh hai nguồn có số liệu khác nhau, bước đầu tiên nên làm là gì? A. Chọn số liệu cao hơn B. So sánh định nghĩa và phương pháp trước khi so sánh con số C. Lấy trung bình cộng D. Bỏ qua cả hai Đáp án: B — Hiểu đúng điều đang được đo trước khi kết luận về sự khác biệt."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Tổ chức và quản lý khối lượng thông tin lớn",
        "competencyCode": "1.3",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất",
          "Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc"
        ],
        "definitions": [
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý",
          "Kiến trúc thông tin: cách tổ chức, phân nhóm và đặt tên tài liệu theo một logic nhất quán",
          "Sổ đăng ký tài liệu: bảng liệt kê thông tin về mọi tài liệu trong một dự án để dễ tìm và báo cáo",
          "Nguyên tắc quyền tối thiểu: chỉ cấp mức quyền truy cập thấp nhất đủ để hoàn thành công việc"
        ],
        "body": [
          "Ở mức trung cấp, việc sắp xếp thông tin để dễ lưu trữ và tổ chức trong môi trường có cấu trúc mở rộng sang quản lý khối lượng thông tin lớn cho cả một dự án nhiều luồng công việc.",
          "Kiến trúc thông tin cần phân nhóm loại trừ lẫn nhau và giới hạn độ sâu thư mục để không quá phức tạp. Sổ đăng ký tài liệu ghi lại các trường bắt buộc (tên, chủ đề, phiên bản, người phụ trách) giúp tra cứu nhanh. Cần phân biệt lưu trữ cục bộ, đám mây, và thư mục dùng chung — đồng bộ không phải là sao lưu, vì thay đổi sai ở một nơi sẽ lan sang nơi khác. Nguyên tắc quyền tối thiểu áp dụng khi chia sẻ: chỉ cấp quyền cần thiết cho từng người."
        ],
        "examples": [],
        "practice": "Cho một thư mục hỗn độn gồm nhiều loại tài liệu (hợp đồng, hóa đơn, ghi chú họp, báo cáo, hình ảnh). Thiết kế cấu trúc thư mục (tối đa bốn cấp), lập sổ đăng ký với tối thiểu 20 dòng, và viết quy tắc phân loại thành văn bản.",
        "deliverable": "Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao nên giới hạn độ sâu thư mục ở khoảng bốn cấp?",
            "options": [
              "Do giới hạn kỹ thuật của máy tính",
              "Vượt quá mức đó người dùng thường không lưu đúng chỗ nữa",
              "Để tiết kiệm dung lượng",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Cấu trúc quá sâu khiến việc lưu đúng chỗ trở nên khó khăn, dẫn đến sai lệch.",
            "competencyCode": "1.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Sổ đăng ký tài liệu dùng để làm gì?",
            "options": [
              "Thay thế thư mục",
              "Giúp tìm và báo cáo theo thuộc tính tài liệu",
              "Chỉ để trang trí",
              "Không cần thiết nếu đã có thư mục"
            ],
            "correctIndex": 1,
            "explanation": "Sổ đăng ký cho phép lọc/tìm theo thuộc tính, việc thư mục đơn thuần không làm được.",
            "competencyCode": "1.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Nguyên tắc quyền tối thiểu nghĩa là gì?",
            "options": [
              "Cấp quyền cao nhất cho tất cả để tiện lợi",
              "Cấp mức quyền thấp nhất đủ để hoàn thành công việc",
              "Không cấp quyền cho ai",
              "Chỉ quản lý mới có quyền"
            ],
            "correctIndex": 1,
            "explanation": "Bắt đầu từ mức thấp nhất, chỉ nâng khi thực sự cần.",
            "competencyCode": "1.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Tài liệu nhạy cảm nên được chia sẻ bằng cách nào?",
            "options": [
              "Bất kỳ ai có liên kết, quyền chỉnh sửa",
              "Chia sẻ với người cụ thể theo tên, quyền hạn chế",
              "Đăng công khai để minh bạch",
              "Gửi qua email cho toàn công ty"
            ],
            "correctIndex": 1,
            "explanation": "Chia sẻ theo tên người cụ thể với quyền tối thiểu giảm rủi ro rò rỉ.",
            "competencyCode": "1.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Trộn hai cách phân loại (theo dự án và theo loại tài liệu) ở cùng một cấp thư mục gây ra vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Gây khó khăn khi quyết định lưu tệp vào đâu",
              "Tăng tốc độ tìm kiếm",
              "Giảm dung lượng lưu trữ"
            ],
            "correctIndex": 1,
            "explanation": "Hai tiêu chí phân loại cạnh tranh nhau tạo ra sự mơ hồ khi lưu trữ.",
            "competencyCode": "1.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Vì sao nên giới hạn độ sâu thư mục ở khoảng bốn cấp? A. Do giới hạn kỹ thuật của máy tính B. Vượt quá mức đó người dùng thường không lưu đúng chỗ nữa C. Để tiết kiệm dung lượng D. Không có lý do cụ thể Đáp án: B — Cấu trúc quá sâu khiến việc lưu đúng chỗ trở nên khó khăn, dẫn đến sai lệch.",
          "2. Sổ đăng ký tài liệu dùng để làm gì? A. Thay thế thư mục B. Giúp tìm và báo cáo theo thuộc tính tài liệu C. Chỉ để trang trí D. Không cần thiết nếu đã có thư mục Đáp án: B — Sổ đăng ký cho phép lọc/tìm theo thuộc tính, việc thư mục đơn thuần không làm được.",
          "3. Nguyên tắc quyền tối thiểu nghĩa là gì? A. Cấp quyền cao nhất cho tất cả để tiện lợi B. Cấp mức quyền thấp nhất đủ để hoàn thành công việc C. Không cấp quyền cho ai D. Chỉ quản lý mới có quyền Đáp án: B — Bắt đầu từ mức thấp nhất, chỉ nâng khi thực sự cần.",
          "4. Tài liệu nhạy cảm nên được chia sẻ bằng cách nào? A. Bất kỳ ai có liên kết, quyền chỉnh sửa B. Chia sẻ với người cụ thể theo tên, quyền hạn chế C. Đăng công khai để minh bạch D. Gửi qua email cho toàn công ty Đáp án: B — Chia sẻ theo tên người cụ thể với quyền tối thiểu giảm rủi ro rò rỉ.",
          "5. Trộn hai cách phân loại (theo dự án và theo loại tài liệu) ở cùng một cấp thư mục gây ra vấn đề gì? A. Không có vấn đề gì B. Gây khó khăn khi quyết định lưu tệp vào đâu C. Tăng tốc độ tìm kiếm D. Giảm dung lượng lưu trữ Đáp án: B — Hai tiêu chí phân loại cạnh tranh nhau tạo ra sự mơ hồ khi lưu trữ."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M1-I — “Bản tóm tắt tình báo cạnh tranh”",
      "brief": "Ban giám đốc cân nhắc một quyết định kinh doanh và yêu cầu “một bản tóm tắt đúng nghĩa, không phải đống link.” Hãy hoàn thành:\nViết nhu cầu thông tin đầy đủ (phạm vi, thời gian, mức chi tiết, sản phẩm)\nXây ma trận từ khóa, chạy tối thiểu 8 truy vấn có toán tử, ghi log\nThu thập 5 nguồn (tối thiểu 2 sơ cấp)\nLập bảng so sánh cho chỉ số quan trọng nhất\nViết bản tóm tắt 1 trang: điều đã biết, điều còn tranh cãi, con số khuyến nghị và lý do\nTiêu chí chấm:\nNhu cầu thông tin đầy đủ, cụ thể\nChiến lược tìm kiếm (≥8 truy vấn, ≥4 toán tử)\nChất lượng nguồn (≥2 sơ cấp, đánh giá đầy đủ)\nBảng so sánh đầy đủ, phát hiện khác biệt\nKhuyến nghị rõ ràng, có căn cứ\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A1-A": {
    "code": "A1-A",
    "title": "PHÂN TÍCH THÔNG TIN VÀ QUẢN TRỊ DỮ LIỆU",
    "domainNumber": 1,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 3 module · 9 giờ · Tiên quyết: M1-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Nghiên cứu phức hợp đa nguồn",
        "competencyCode": "1.1",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Đánh giá được nhu cầu thông tin",
          "Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số",
          "Giải thích được cách truy cập những dữ liệu, thông tin và nội dung thích hợp nhất và điều hướng giữa chúng",
          "Sử dụng linh hoạt và đa dạng chiến lược tìm kiếm"
        ],
        "definitions": [
          "Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến",
          "Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn",
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Tam giác hóa: phương pháp dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy",
          "Khoảng trống thông tin: phần dữ liệu cần thiết nhưng không có sẵn, cần được ước lượng có căn cứ hoặc thu thập thêm"
        ],
        "body": [
          "Ở mức nâng cao, việc đánh giá nhu cầu thông tin và điều chỉnh chiến lược tìm kiếm phù hợp nhất trong bối cảnh phức tạp đòi hỏi thiết kế cả một phương pháp nghiên cứu, không chỉ một lượt tìm kiếm đơn lẻ.",
          "Từ một câu hỏi kinh doanh mơ hồ, cần xây dựng kế hoạch nghiên cứu rõ ràng, phối hợp nguồn bên ngoài (báo cáo ngành, số liệu chính thức) với dữ liệu nội bộ của doanh nghiệp. Tam giác hóa — dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy — giúp tăng độ tin cậy của kết luận. Khi dữ liệu không tồn tại, cần nhận diện khoảng trống thông tin và đưa ra ước lượng có căn cứ thay vì bỏ qua. Ở mức này, người học còn cần hướng dẫn được đồng nghiệp cách tìm kiếm hiệu quả — đúng như Thông tư mô tả “hướng dẫn người khác” ở bậc 5."
        ],
        "examples": [],
        "practice": "Doanh nghiệp cân nhắc một quyết định kinh doanh quan trọng. Xây kế hoạch nghiên cứu theo khung bốn bước, thu thập bằng chứng từ tối thiểu hai loại nguồn (bên ngoài và nội bộ), xác định rõ phần nào còn là khoảng trống thông tin và đề xuất cách ước lượng, rồi trình bày phần bằng chứng thu được và phần còn thiếu cho nhóm.",
        "deliverable": "Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bước đầu tiên khi đối mặt với một vấn đề nghiên cứu chưa rõ ràng là gì?",
            "options": [
              "Tìm kiếm ngay trên Google",
              "Xác định quyết định nào đang cần được đưa ra",
              "Hỏi ý kiến đồng nghiệp",
              "Thu thập càng nhiều dữ liệu càng tốt"
            ],
            "correctIndex": 1,
            "explanation": "Xác định quyết định cần hỗ trợ giúp định hướng toàn bộ quá trình nghiên cứu.",
            "competencyCode": "1.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao cần phối hợp cả nguồn bên ngoài và nội bộ khi nghiên cứu mở rộng thị trường?",
            "options": [
              "Để có nhiều số liệu hơn",
              "Nguồn bên ngoài cho biết thị trường, nguồn nội bộ cho biết vị trí thực tế của doanh nghiệp",
              "Vì quy định yêu cầu",
              "Không cần thiết, một loại là đủ"
            ],
            "correctIndex": 1,
            "explanation": "Hai loại nguồn trả lời hai câu hỏi khác nhau, cần kết hợp để có bức tranh đầy đủ.",
            "competencyCode": "1.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì?",
            "options": [
              "Bỏ qua vấn đề đó",
              "Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng",
              "Giả định một con số bất kỳ",
              "Trì hoãn toàn bộ nghiên cứu"
            ],
            "correctIndex": 1,
            "explanation": "Minh bạch về khoảng trống và ước lượng có căn cứ tốt hơn giả định ngầm hoặc bỏ qua.",
            "competencyCode": "1.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Tam giác hóa trong nghiên cứu nghĩa là gì?",
            "options": [
              "Vẽ biểu đồ hình tam giác",
              "Dùng ít nhất ba nguồn độc lập để xác lập khoảng giá trị đáng tin",
              "Chia dữ liệu thành ba phần",
              "Kiểm tra dữ liệu ba lần"
            ],
            "correctIndex": 1,
            "explanation": "Ba nguồn độc lập giúp xác lập độ tin cậy cao hơn một nguồn đơn lẻ.",
            "competencyCode": "1.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Hướng dẫn đồng nghiệp tìm kiếm hiệu quả bao gồm việc gì?",
            "options": [
              "Tự làm hết thay họ",
              "Chia sẻ mẫu chiến lược tìm kiếm và review cách đặt câu hỏi",
              "Không can thiệp",
              "Chỉ giao việc mà không hướng dẫn"
            ],
            "correctIndex": 1,
            "explanation": "Chuẩn hóa và chia sẻ phương pháp giúp nâng cao năng lực chung của nhóm.",
            "competencyCode": "1.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Bước đầu tiên khi đối mặt với một vấn đề nghiên cứu chưa rõ ràng là gì? A. Tìm kiếm ngay trên Google B. Xác định quyết định nào đang cần được đưa ra C. Hỏi ý kiến đồng nghiệp D. Thu thập càng nhiều dữ liệu càng tốt Đáp án: B — Xác định quyết định cần hỗ trợ giúp định hướng toàn bộ quá trình nghiên cứu.",
          "2. Vì sao cần phối hợp cả nguồn bên ngoài và nội bộ khi nghiên cứu mở rộng thị trường? A. Để có nhiều số liệu hơn B. Nguồn bên ngoài cho biết thị trường, nguồn nội bộ cho biết vị trí thực tế của doanh nghiệp C. Vì quy định yêu cầu D. Không cần thiết, một loại là đủ Đáp án: B — Hai loại nguồn trả lời hai câu hỏi khác nhau, cần kết hợp để có bức tranh đầy đủ.",
          "3. Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì? A. Bỏ qua vấn đề đó B. Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng C. Giả định một con số bất kỳ D. Trì hoãn toàn bộ nghiên cứu Đáp án: B — Minh bạch về khoảng trống và ước lượng có căn cứ tốt hơn giả định ngầm hoặc bỏ qua.",
          "4. Tam giác hóa trong nghiên cứu nghĩa là gì? A. Vẽ biểu đồ hình tam giác B. Dùng ít nhất ba nguồn độc lập để xác lập khoảng giá trị đáng tin C. Chia dữ liệu thành ba phần D. Kiểm tra dữ liệu ba lần Đáp án: B — Ba nguồn độc lập giúp xác lập độ tin cậy cao hơn một nguồn đơn lẻ.",
          "5. Hướng dẫn đồng nghiệp tìm kiếm hiệu quả bao gồm việc gì? A. Tự làm hết thay họ B. Chia sẻ mẫu chiến lược tìm kiếm và review cách đặt câu hỏi C. Không can thiệp D. Chỉ giao việc mà không hướng dẫn Đáp án: B — Chuẩn hóa và chia sẻ phương pháp giúp nâng cao năng lực chung của nhóm."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Đánh giá chất lượng dữ liệu",
        "competencyCode": "1.2",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số",
          "Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng",
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Chất lượng dữ liệu: mức độ dữ liệu đáp ứng được sáu tiêu chí — chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất",
          "Biện pháp phòng ngừa: hành động chặn dữ liệu sai ngay tại điểm nhập liệu",
          "Biện pháp phát hiện: hành động tìm ra dữ liệu sai sau khi đã được nhập vào hệ thống"
        ],
        "body": [
          "Ở mức nâng cao, việc đánh giá có tính phê phán độ tin cậy và độ chính xác của nguồn dữ liệu mở rộng thành đánh giá chất lượng dữ liệu một cách hệ thống theo sáu chiều: chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất.",
          "Cần viết được quy tắc kiểm tra dữ liệu có thể áp dụng máy móc (ví dụ: số điện thoại phải đủ 10 chữ số). Biện pháp phòng ngừa được đặt tại điểm nhập liệu để chặn lỗi từ đầu; biện pháp phát hiện dùng báo cáo ngoại lệ và đối chiếu để tìm lỗi đã lọt qua. Xây bảng điểm chất lượng dữ liệu có ngưỡng cụ thể và người chịu trách nhiệm giúp duy trì chất lượng theo thời gian, đồng thời cần phân biệt dữ liệu sai với dữ liệu chỉ đơn thuần bất thường."
        ],
        "examples": [],
        "practice": "Cho một tập dữ liệu khách hàng thật của doanh nghiệp, hãy chấm điểm cả sáu chiều bằng số liệu cụ thể (ví dụ tính phần trăm trường trống), đề xuất tối thiểu sáu quy tắc kiểm tra, và với mỗi biện pháp cải thiện đề xuất, phân loại là phòng ngừa hay phát hiện, gán người phụ trách.",
        "deliverable": "Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát.",
        "questions": [
          {
            "number": 1,
            "questionText": "Một email đúng định dạng nhưng gán sai cho khách hàng khác là vi phạm chiều nào?",
            "options": [
              "Hợp lệ",
              "Chính xác",
              "Đầy đủ",
              "Duy nhất"
            ],
            "correctIndex": 1,
            "explanation": "Định dạng đúng (hợp lệ) nhưng không phản ánh đúng thực tế (không chính xác).",
            "competencyCode": "1.2",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Biện pháp nào sau đây là biện pháp phòng ngừa?",
            "options": [
              "Báo cáo ngoại lệ hàng tuần",
              "Danh sách chọn sẵn bắt buộc khi nhập liệu",
              "Đối chiếu dữ liệu định kỳ",
              "Rà soát thủ công cuối tháng"
            ],
            "correctIndex": 1,
            "explanation": "Danh sách chọn sẵn chặn lỗi ngay tại điểm nhập liệu, trước khi lỗi xảy ra.",
            "competencyCode": "1.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Một khách hàng có ba mã khách hàng khác nhau trong hệ thống là vấn đề của chiều nào?",
            "options": [
              "Kịp thời",
              "Duy nhất",
              "Hợp lệ",
              "Chính xác"
            ],
            "correctIndex": 1,
            "explanation": "Một thực thể được ghi nhận nhiều lần vi phạm tính duy nhất.",
            "competencyCode": "1.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao nên ưu tiên biện pháp phòng ngừa hơn phát hiện?",
            "options": [
              "Phòng ngừa rẻ hơn luôn luôn",
              "Phòng ngừa giải quyết tận gốc, giảm nhu cầu dọn dẹp lặp lại",
              "Phát hiện không hiệu quả",
              "Không có sự khác biệt"
            ],
            "correctIndex": 1,
            "explanation": "Ngăn lỗi xảy ra tốt hơn liên tục phải sửa lỗi sau khi đã phát sinh.",
            "competencyCode": "1.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Bảng điểm chất lượng dữ liệu cần có yếu tố nào để thực sự thúc đẩy cải thiện?",
            "options": [
              "Chỉ cần con số phần trăm",
              "Ngưỡng mục tiêu và người chịu trách nhiệm cụ thể",
              "Màu sắc đẹp",
              "Càng nhiều chiều đo càng tốt"
            ],
            "correctIndex": 1,
            "explanation": "Không có người chịu trách nhiệm, bảng điểm không tạo ra hành động cải thiện.",
            "competencyCode": "1.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Một email đúng định dạng nhưng gán sai cho khách hàng khác là vi phạm chiều nào? A. Hợp lệ B. Chính xác C. Đầy đủ D. Duy nhất Đáp án: B — Định dạng đúng (hợp lệ) nhưng không phản ánh đúng thực tế (không chính xác).",
          "2. Biện pháp nào sau đây là biện pháp phòng ngừa? A. Báo cáo ngoại lệ hàng tuần B. Danh sách chọn sẵn bắt buộc khi nhập liệu C. Đối chiếu dữ liệu định kỳ D. Rà soát thủ công cuối tháng Đáp án: B — Danh sách chọn sẵn chặn lỗi ngay tại điểm nhập liệu, trước khi lỗi xảy ra.",
          "3. Một khách hàng có ba mã khách hàng khác nhau trong hệ thống là vấn đề của chiều nào? A. Kịp thời B. Duy nhất C. Hợp lệ D. Chính xác Đáp án: B — Một thực thể được ghi nhận nhiều lần vi phạm tính duy nhất.",
          "4. Vì sao nên ưu tiên biện pháp phòng ngừa hơn phát hiện? A. Phòng ngừa rẻ hơn luôn luôn B. Phòng ngừa giải quyết tận gốc, giảm nhu cầu dọn dẹp lặp lại C. Phát hiện không hiệu quả D. Không có sự khác biệt Đáp án: B — Ngăn lỗi xảy ra tốt hơn liên tục phải sửa lỗi sau khi đã phát sinh.",
          "5. Bảng điểm chất lượng dữ liệu cần có yếu tố nào để thực sự thúc đẩy cải thiện? A. Chỉ cần con số phần trăm B. Ngưỡng mục tiêu và người chịu trách nhiệm cụ thể C. Màu sắc đẹp D. Càng nhiều chiều đo càng tốt Đáp án: B — Không có người chịu trách nhiệm, bảng điểm không tạo ra hành động cải thiện."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Quản trị dữ liệu và vòng đời thông tin",
        "competencyCode": "1.3",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ",
          "Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất"
        ],
        "definitions": [
          "Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá",
          "Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý",
          "Quản trị dữ liệu: hệ thống các quy tắc, vai trò và quy trình đảm bảo dữ liệu được định nghĩa, sử dụng và bảo vệ nhất quán trong tổ chức",
          "Từ điển dữ liệu: bảng mô tả chi tiết từng trường dữ liệu — định nghĩa, kiểu, giá trị hợp lệ, nguồn, chủ sở hữu",
          "Nguồn chân lý duy nhất: hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, mọi bản sao khác chỉ mang tính tham khảo"
        ],
        "body": [
          "Ở mức nâng cao, việc điều chỉnh quản lý thông tin và tổ chức môi trường có cấu trúc phù hợp nhất trong bối cảnh phức tạp mở rộng thành quản trị dữ liệu và vòng đời thông tin cấp tổ chức.",
          "Ba vai trò cần được phân định rõ: chủ sở hữu dữ liệu (chịu trách nhiệm cuối cùng), người quản lý dữ liệu (duy trì chất lượng hàng ngày), người vận hành (sử dụng dữ liệu trong công việc). Từ điển dữ liệu ghi lại tên trường, định nghĩa, kiểu dữ liệu, giá trị hợp lệ, nguồn gốc và mức nhạy cảm cho một tập dữ liệu cốt lõi. Khái niệm dữ liệu chủ và nguồn chân lý duy nhất giúp chấm dứt tình trạng các bộ phận báo cáo số liệu khác nhau cho cùng một chỉ tiêu. Lịch lưu trữ và hủy dữ liệu cần tuân theo yêu cầu pháp lý và nghiệp vụ."
        ],
        "examples": [],
        "practice": "Hai bộ phận trong doanh nghiệp báo cáo số khách hàng khác nhau mỗi tháng, gây tranh cãi liên tục. Xây từ điển dữ liệu tối thiểu 10 trường, phân định ba vai trò cho tập dữ liệu này, thống nhất một định nghĩa cho chỉ tiêu đang gây tranh cãi, và lập lịch lưu trữ cho ba loại dữ liệu khác nhau trong doanh nghiệp.",
        "deliverable": "Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịch lưu trữ.",
        "questions": [
          {
            "number": 1,
            "questionText": "Hai bộ phận báo cáo số khách hàng khác nhau. Cách xử lý đúng theo quản trị dữ liệu là gì?",
            "options": [
              "Tính lại số liệu",
              "Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu",
              "Dùng số liệu cao hơn",
              "Lấy trung bình cộng"
            ],
            "correctIndex": 1,
            "explanation": "Vấn đề nằm ở định nghĩa, không phải phép tính; cần thống nhất và ghi chép lại.",
            "competencyCode": "1.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Người quản lý dữ liệu (data steward) có vai trò gì?",
            "options": [
              "Chịu trách nhiệm cuối cùng và phê duyệt quyền truy cập",
              "Duy trì chất lượng và định nghĩa dữ liệu hàng ngày",
              "Vận hành hạ tầng kỹ thuật",
              "Không có vai trò cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Chủ sở hữu chịu trách nhiệm cuối; người quản lý duy trì vận hành hàng ngày.",
            "competencyCode": "1.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "“Nguồn chân lý duy nhất” nghĩa là gì?",
            "options": [
              "Nguồn dữ liệu duy nhất tồn tại",
              "Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ là bản sao",
              "Chỉ có một người được xem dữ liệu",
              "Dữ liệu không bao giờ thay đổi"
            ],
            "correctIndex": 1,
            "explanation": "Chỉ định một nguồn chính thức tránh nhầm lẫn giữa nhiều bản sao.",
            "competencyCode": "1.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Lịch lưu trữ và hủy dữ liệu nên được quyết định dựa trên điều gì?",
            "options": [
              "Dung lượng lưu trữ còn trống",
              "Yêu cầu pháp lý và nhu cầu nghiệp vụ",
              "Sở thích cá nhân của quản lý",
              "Không cần quyết định, giữ mãi mãi là an toàn nhất"
            ],
            "correctIndex": 1,
            "explanation": "Giữ dữ liệu vô thời hạn không phải an toàn, mà là rủi ro pháp lý và bảo mật.",
            "competencyCode": "1.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề gì?",
            "options": [
              "Tăng tốc độ xử lý dữ liệu",
              "Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận",
              "Giảm dung lượng lưu trữ",
              "Mã hóa dữ liệu"
            ],
            "correctIndex": 1,
            "explanation": "Định nghĩa thống nhất, được ghi chép, loại bỏ nguyên nhân phổ biến nhất của tranh cãi số liệu.",
            "competencyCode": "1.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Hai bộ phận báo cáo số khách hàng khác nhau. Cách xử lý đúng theo quản trị dữ liệu là gì? A. Tính lại số liệu B. Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu C. Dùng số liệu cao hơn D. Lấy trung bình cộng Đáp án: B — Vấn đề nằm ở định nghĩa, không phải phép tính; cần thống nhất và ghi chép lại.",
          "2. Người quản lý dữ liệu (data steward) có vai trò gì? A. Chịu trách nhiệm cuối cùng và phê duyệt quyền truy cập B. Duy trì chất lượng và định nghĩa dữ liệu hàng ngày C. Vận hành hạ tầng kỹ thuật D. Không có vai trò cụ thể Đáp án: B — Chủ sở hữu chịu trách nhiệm cuối; người quản lý duy trì vận hành hàng ngày.",
          "3. “Nguồn chân lý duy nhất” nghĩa là gì? A. Nguồn dữ liệu duy nhất tồn tại B. Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ là bản sao C. Chỉ có một người được xem dữ liệu D. Dữ liệu không bao giờ thay đổi Đáp án: B — Chỉ định một nguồn chính thức tránh nhầm lẫn giữa nhiều bản sao.",
          "4. Lịch lưu trữ và hủy dữ liệu nên được quyết định dựa trên điều gì? A. Dung lượng lưu trữ còn trống B. Yêu cầu pháp lý và nhu cầu nghiệp vụ C. Sở thích cá nhân của quản lý D. Không cần quyết định, giữ mãi mãi là an toàn nhất Đáp án: B — Giữ dữ liệu vô thời hạn không phải an toàn, mà là rủi ro pháp lý và bảo mật.",
          "5. Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề gì? A. Tăng tốc độ xử lý dữ liệu B. Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận C. Giảm dung lượng lưu trữ D. Mã hóa dữ liệu Đáp án: B — Định nghĩa thống nhất, được ghi chép, loại bỏ nguyên nhân phổ biến nhất của tranh cãi số liệu."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M1-A",
      "brief": "Ban giám đốc cần ra một quyết định kinh doanh quan trọng, nhưng dữ liệu nội bộ đang bị nghi ngờ về độ tin cậy. Hãy hoàn thành:\nThực hiện nghiên cứu đa nguồn theo khung bốn bước\nĐánh giá chất lượng một tập dữ liệu nội bộ liên quan theo sáu chiều\nXây bộ tài liệu quản trị: từ điển dữ liệu, phân vai, định nghĩa thống nhất\nViết báo cáo tổng hợp: khuyến nghị quyết định, mức độ tin cậy, giới hạn của phân tích\nTiêu chí chấm:\nKế hoạch và thực hiện nghiên cứu đa nguồn\nĐánh giá chất lượng dữ liệu đầy đủ, định lượng\nBộ tài liệu quản trị hoàn chỉnh\nBáo cáo có khuyến nghị rõ ràng, nêu giới hạn\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A2-F": {
    "code": "A2-F",
    "title": "GIAO TIẾP SỐ CƠ BẢN NƠI CÔNG SỞ",
    "domainNumber": 2,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 6 module · 12 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Công cụ giao tiếp cơ bản",
        "competencyCode": "2.1",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Lựa chọn được các công nghệ số đơn giản để tương tác",
          "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể"
        ],
        "definitions": [
          "Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử",
          "Đến (To): người nhận chính, người cần hành động",
          "CC (Carbon Copy): người được thông báo để biết, không cần hành động",
          "BCC (Blind Carbon Copy): người nhận ẩn, các người nhận khác không thấy nhau",
          "Kênh giao tiếp: phương tiện dùng để truyền thông điệp — email, tin nhắn, họp trực tuyến, gọi điện"
        ],
        "body": [
          "Tương tác thông qua công nghệ số nghĩa là dùng các công cụ số (email, ứng dụng nhắn tin, họp trực tuyến) để trao đổi với người khác. Mỗi loại phương tiện giao tiếp số phù hợp với một bối cảnh khác nhau — việc gấp cần công cụ tức thời như gọi điện hoặc nhắn tin trực tiếp; việc cần lưu vết lâu dài nên dùng email; việc cần nhiều người cùng thảo luận phù hợp với họp trực tuyến hoặc nhóm chat.",
          "Một email công việc cơ bản có bốn phần: tiêu đề rõ ràng, lời chào, nội dung chính, và chữ ký. Về việc dùng Đến, CC và BCC: đặt người cần hành động vào ô Đến, người chỉ cần biết vào ô CC.",
          "Khi tham gia họp trực tuyến, cần kiểm tra âm thanh và hình ảnh trước khi họp bắt đầu, và tắt tiếng khi không phát biểu để tránh tạp âm ảnh hưởng người khác."
        ],
        "examples": [],
        "practice": "Soạn ba email cho ba tình huống khác nhau: xin thông tin từ đồng nghiệp, báo cáo tiến độ công việc cho cấp trên, và xin lỗi vì trễ hạn công việc. Sau đó tham gia thử một cuộc họp trực tuyến và ghi chú lại nội dung.",
        "deliverable": "3 email mẫu và ghi chú cuộc họp.",
        "questions": [
          {
            "number": 1,
            "questionText": "Người cần hành động với nội dung email nên được đặt ở đâu?",
            "options": [
              "CC",
              "BCC",
              "Đến (To)",
              "Không quan trọng"
            ],
            "correctIndex": 2,
            "explanation": "Đến (To) dành cho người cần thực hiện hành động.",
            "competencyCode": "2.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "BCC được dùng khi nào?",
            "options": [
              "Khi muốn tất cả người nhận biết nhau",
              "Khi gửi cho nhiều người không cần lộ thông tin liên hệ của nhau",
              "Khi chỉ gửi cho một người",
              "Không bao giờ nên dùng"
            ],
            "correctIndex": 1,
            "explanation": "BCC ẩn danh sách người nhận với nhau.",
            "competencyCode": "2.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Việc gấp cần xử lý ngay nên chọn kênh nào?",
            "options": [
              "Email",
              "Gọi điện hoặc nhắn tin trực tiếp",
              "Ghi chú giấy",
              "Gửi thư"
            ],
            "correctIndex": 1,
            "explanation": "Kênh tức thời phù hợp với việc cần phản hồi nhanh.",
            "competencyCode": "2.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến?",
            "options": [
              "Để tiết kiệm pin",
              "Để tránh tạp âm ảnh hưởng người khác",
              "Vì bắt buộc theo quy định",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Tạp âm nền gây khó chịu và làm gián đoạn cuộc họp.",
            "competencyCode": "2.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Tiêu đề email nên có đặc điểm gì?",
            "options": [
              "Càng ngắn càng tốt, không cần rõ nghĩa",
              "Nói rõ nội dung để người nhận biết mức ưu tiên",
              "Chỉ cần viết “Quan trọng”",
              "Không cần thiết"
            ],
            "correctIndex": 1,
            "explanation": "Tiêu đề rõ ràng giúp người nhận đánh giá và xử lý phù hợp.",
            "competencyCode": "2.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Người cần hành động với nội dung email nên được đặt ở đâu? A. CC B. BCC C. Đến (To) D. Không quan trọng Đáp án: C — Đến (To) dành cho người cần thực hiện hành động.",
          "2. BCC được dùng khi nào? A. Khi muốn tất cả người nhận biết nhau B. Khi gửi cho nhiều người không cần lộ thông tin liên hệ của nhau C. Khi chỉ gửi cho một người D. Không bao giờ nên dùng Đáp án: B — BCC ẩn danh sách người nhận với nhau.",
          "3. Việc gấp cần xử lý ngay nên chọn kênh nào? A. Email B. Gọi điện hoặc nhắn tin trực tiếp C. Ghi chú giấy D. Gửi thư Đáp án: B — Kênh tức thời phù hợp với việc cần phản hồi nhanh.",
          "4. Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến? A. Để tiết kiệm pin B. Để tránh tạp âm ảnh hưởng người khác C. Vì bắt buộc theo quy định D. Không có lý do cụ thể Đáp án: B — Tạp âm nền gây khó chịu và làm gián đoạn cuộc họp.",
          "5. Tiêu đề email nên có đặc điểm gì? A. Càng ngắn càng tốt, không cần rõ nghĩa B. Nói rõ nội dung để người nhận biết mức ưu tiên C. Chỉ cần viết “Quan trọng” D. Không cần thiết Đáp án: B — Tiêu đề rõ ràng giúp người nhận đánh giá và xử lý phù hợp."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Chia sẻ tài liệu và thông tin",
        "competencyCode": "2.2",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Nhận biết được tham chiếu và ghi chú nguồn cơ bản"
        ],
        "definitions": [],
        "body": [
          "Quyền xem: chỉ đọc, không thể thay đổi nội dung",
          "Quyền bình luận: đọc và để lại nhận xét, không sửa nội dung gốc",
          "Quyền chỉnh sửa: có thể thay đổi trực tiếp nội dung",
          "Liên kết chia sẻ: đường dẫn cho phép truy cập tệp mà không cần gửi trực tiếp",
          "Chia sẻ thông tin và nội dung số nghĩa là gửi hoặc cấp quyền truy cập tài liệu cho người khác thông qua các công nghệ số phù hợp. Khi tệp quá lớn để đính kèm qua email, nên chia sẻ qua đường dẫn đám mây thay vì cố nén và gửi trực tiếp.",
          "Ba mức quyền phổ biến là xem, bình luận, và chỉnh sửa — nên cấp mức thấp nhất phù hợp với nhu cầu người nhận. Tùy chọn “Bất kỳ ai có liên kết” tiềm ẩn rủi ro: đường dẫn có thể bị chuyển tiếp ngoài ý muốn tới người không nên xem.",
          "Trước khi chuyển tiếp một email, cần kiểm tra xem nội dung phía trên (các email trước đó trong chuỗi) có thông tin không nên gửi cho người nhận mới hay không."
        ],
        "examples": [],
        "practice": "Chia sẻ một thư mục với một đồng nghiệp ở mức chỉ xem, và chụp lại màn hình cài đặt chia sẻ.",
        "deliverable": "Ảnh chụp cài đặt chia sẻ đúng nguyên tắc.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khi tệp quá lớn để đính kèm, nên làm gì?",
            "options": [
              "Nén thật nhỏ và gửi",
              "Chia sẻ qua đường dẫn đám mây",
              "Gửi qua nhiều email",
              "Bỏ bớt nội dung"
            ],
            "correctIndex": 1,
            "explanation": "Chia sẻ đường dẫn đám mây phù hợp cho tệp lớn.",
            "competencyCode": "2.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Mức quyền nào nên cấp mặc định khi chưa rõ nhu cầu người nhận?",
            "options": [
              "Chỉnh sửa",
              "Xem",
              "Quản trị",
              "Xóa"
            ],
            "correctIndex": 1,
            "explanation": "Bắt đầu từ mức thấp nhất, chỉ nâng khi cần.",
            "competencyCode": "2.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "“Bất kỳ ai có liên kết” tiềm ẩn rủi ro gì?",
            "options": [
              "Không có rủi ro nào",
              "Liên kết có thể bị chuyển tiếp tới người không nên xem",
              "Tốc độ tải chậm hơn",
              "Tốn dung lượng hơn"
            ],
            "correctIndex": 1,
            "explanation": "Liên kết mở dễ lan truyền ngoài kiểm soát.",
            "competencyCode": "2.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Trước khi chuyển tiếp một chuỗi email, nên kiểm tra điều gì?",
            "options": [
              "Độ dài email",
              "Nội dung phía trên có thông tin không nên gửi cho người nhận mới không",
              "Ngày gửi ban đầu",
              "Không cần kiểm tra gì"
            ],
            "correctIndex": 1,
            "explanation": "Chuỗi email cũ có thể chứa thông tin nhạy cảm không phù hợp chuyển tiếp.",
            "competencyCode": "2.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Quyền “bình luận” khác quyền “chỉnh sửa” ở điểm nào?",
            "options": [
              "Không có khác biệt",
              "Bình luận chỉ để lại nhận xét, không sửa nội dung gốc",
              "Bình luận có quyền cao hơn",
              "Chỉnh sửa không được lưu lại"
            ],
            "correctIndex": 1,
            "explanation": "Bình luận giữ nguyên nội dung gốc, chỉ thêm ghi chú.",
            "competencyCode": "2.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Khi tệp quá lớn để đính kèm, nên làm gì? A. Nén thật nhỏ và gửi B. Chia sẻ qua đường dẫn đám mây C. Gửi qua nhiều email D. Bỏ bớt nội dung Đáp án: B — Chia sẻ đường dẫn đám mây phù hợp cho tệp lớn.",
          "2. Mức quyền nào nên cấp mặc định khi chưa rõ nhu cầu người nhận? A. Chỉnh sửa B. Xem C. Quản trị D. Xóa Đáp án: B — Bắt đầu từ mức thấp nhất, chỉ nâng khi cần.",
          "3. “Bất kỳ ai có liên kết” tiềm ẩn rủi ro gì? A. Không có rủi ro nào B. Liên kết có thể bị chuyển tiếp tới người không nên xem C. Tốc độ tải chậm hơn D. Tốn dung lượng hơn Đáp án: B — Liên kết mở dễ lan truyền ngoài kiểm soát.",
          "4. Trước khi chuyển tiếp một chuỗi email, nên kiểm tra điều gì? A. Độ dài email B. Nội dung phía trên có thông tin không nên gửi cho người nhận mới không C. Ngày gửi ban đầu D. Không cần kiểm tra gì Đáp án: B — Chuỗi email cũ có thể chứa thông tin nhạy cảm không phù hợp chuyển tiếp.",
          "5. Quyền “bình luận” khác quyền “chỉnh sửa” ở điểm nào? A. Không có khác biệt B. Bình luận chỉ để lại nhận xét, không sửa nội dung gốc C. Bình luận có quyền cao hơn D. Chỉnh sửa không được lưu lại Đáp án: B — Bình luận giữ nguyên nội dung gốc, chỉ thêm ghi chú."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Dịch vụ công trực tuyến",
        "competencyCode": "2.3",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội",
          "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân"
        ],
        "definitions": [
          "Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Cổng dịch vụ công: trang web chính thức của cơ quan nhà nước cho phép thực hiện thủ tục hành chính trực tuyến",
          "Định danh điện tử: phương thức xác thực danh tính một cá nhân hoặc tổ chức trên môi trường số",
          "Chữ ký số: hình thức xác nhận điện tử có giá trị pháp lý tương đương chữ ký tay"
        ],
        "body": [
          "Sử dụng công nghệ số để thực hiện trách nhiệm công dân nghĩa là tham gia vào xã hội thông qua các dịch vụ số công cộng và tư nhân — ví dụ cổng dịch vụ công trực tuyến cho phép thực hiện nhiều thủ tục hành chính mà không cần đến trực tiếp cơ quan nhà nước.",
          "Khi tra cứu thông tin chính thức, cần xác nhận đang ở đúng trang của cơ quan nhà nước. Trang giả mạo thường có tên miền gần giống nhưng sai khác nhỏ, và thường yêu cầu cung cấp thông tin cá nhân qua kênh không chính thức. Cơ quan nhà nước không bao giờ yêu cầu mật khẩu hoặc mã xác thực qua điện thoại hoặc tin nhắn."
        ],
        "examples": [],
        "practice": "Tra cứu một thủ tục hành chính liên quan đến doanh nghiệp trên cổng chính thức và ghi lại các bước cùng giấy tờ cần có.",
        "deliverable": "Bảng tóm tắt thủ tục kèm đường dẫn chính thức.",
        "questions": [
          {
            "number": 1,
            "questionText": "Cổng dịch vụ công dùng để làm gì?",
            "options": [
              "Mua sắm trực tuyến",
              "Thực hiện thủ tục hành chính không cần đến trực tiếp",
              "Giải trí",
              "Tìm việc làm"
            ],
            "correctIndex": 1,
            "explanation": "Đây là chức năng chính của cổng dịch vụ công.",
            "competencyCode": "2.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước?",
            "options": [
              "Có đuôi .gov.vn",
              "Tên miền gần giống nhưng sai khác nhỏ, yêu cầu thông tin bất thường",
              "Giao diện đơn giản",
              "Có nhiều thông tin liên hệ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các dấu hiệu cảnh báo phổ biến của trang giả mạo.",
            "competencyCode": "2.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Cơ quan nhà nước có bao giờ yêu cầu cung cấp mật khẩu qua điện thoại không?",
            "options": [
              "Có, đây là quy trình bình thường",
              "Không, đây là dấu hiệu lừa đảo",
              "Chỉ trong trường hợp khẩn cấp",
              "Tùy từng cơ quan"
            ],
            "correctIndex": 1,
            "explanation": "Yêu cầu mật khẩu/mã OTP qua điện thoại là dấu hiệu lừa đảo, không phải quy trình chính thức.",
            "competencyCode": "2.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Định danh điện tử dùng để làm gì?",
            "options": [
              "Trang trí hồ sơ",
              "Xác thực danh tính trên môi trường số",
              "Tăng tốc độ mạng",
              "Không có tác dụng cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là mục đích chính của định danh điện tử.",
            "competencyCode": "2.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Chữ ký số có giá trị pháp lý như thế nào?",
            "options": [
              "Không có giá trị pháp lý",
              "Tương đương chữ ký tay",
              "Chỉ dùng cho mục đích nội bộ",
              "Chỉ có giá trị ở nước ngoài"
            ],
            "correctIndex": 1,
            "explanation": "Chữ ký số có giá trị pháp lý tương đương chữ ký tay theo quy định.",
            "competencyCode": "2.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Cổng dịch vụ công dùng để làm gì? A. Mua sắm trực tuyến B. Thực hiện thủ tục hành chính không cần đến trực tiếp C. Giải trí D. Tìm việc làm Đáp án: B — Đây là chức năng chính của cổng dịch vụ công.",
          "2. Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước? A. Có đuôi .gov.vn B. Tên miền gần giống nhưng sai khác nhỏ, yêu cầu thông tin bất thường C. Giao diện đơn giản D. Có nhiều thông tin liên hệ Đáp án: B — Đây là các dấu hiệu cảnh báo phổ biến của trang giả mạo.",
          "3. Cơ quan nhà nước có bao giờ yêu cầu cung cấp mật khẩu qua điện thoại không? A. Có, đây là quy trình bình thường B. Không, đây là dấu hiệu lừa đảo C. Chỉ trong trường hợp khẩn cấp D. Tùy từng cơ quan Đáp án: B — Yêu cầu mật khẩu/mã OTP qua điện thoại là dấu hiệu lừa đảo, không phải quy trình chính thức.",
          "4. Định danh điện tử dùng để làm gì? A. Trang trí hồ sơ B. Xác thực danh tính trên môi trường số C. Tăng tốc độ mạng D. Không có tác dụng cụ thể Đáp án: B — Đây là mục đích chính của định danh điện tử.",
          "5. Chữ ký số có giá trị pháp lý như thế nào? A. Không có giá trị pháp lý B. Tương đương chữ ký tay C. Chỉ dùng cho mục đích nội bộ D. Chỉ có giá trị ở nước ngoài Đáp án: B — Chữ ký số có giá trị pháp lý tương đương chữ ký tay theo quy định."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Làm việc nhóm trên công cụ số",
        "competencyCode": "2.4",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác"
        ],
        "definitions": [
          "Tài liệu dùng chung: tài liệu trực tuyến nhiều người có thể xem hoặc chỉnh sửa đồng thời",
          "Bình luận (comment): ghi chú gắn vào một phần cụ thể của tài liệu, không thay đổi nội dung gốc",
          "Bảng công việc (task board): công cụ hiển thị công việc theo trạng thái (chưa làm, đang làm, hoàn thành)"
        ],
        "body": [
          "Hợp tác thông qua công nghệ số nghĩa là dùng các công cụ số cho quá trình làm việc chung — tài liệu dùng chung cho phép nhiều người chỉnh sửa cùng lúc và tự động lưu thay đổi. Khi cần góp ý mà không muốn thay đổi trực tiếp nội dung, dùng tính năng bình luận.",
          "Trên bảng công việc, mỗi thẻ công việc thường có người phụ trách, hạn hoàn thành, và trạng thái hiện tại. Một lưu ý quan trọng: không nên tạo bản sao riêng của tài liệu nhóm để chỉnh sửa cá nhân — điều này tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn cho cả nhóm."
        ],
        "examples": [],
        "practice": "Cùng một hoặc hai người khác hoàn thành một tài liệu dùng chung, mỗi người phụ trách một phần, sử dụng bình luận để trao đổi.",
        "deliverable": "Tài liệu nhóm có lịch sử chỉnh sửa và bình luận.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao không nên tạo bản sao riêng của tài liệu nhóm?",
            "options": [
              "Tốn dung lượng",
              "Tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn",
              "Không có lý do gì",
              "Vì quy định cấm"
            ],
            "correctIndex": 1,
            "explanation": "Nhiều bản sao khiến khó xác định phiên bản nào là chính thức.",
            "competencyCode": "2.4",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Tính năng bình luận khác gì so với chỉnh sửa trực tiếp?",
            "options": [
              "Không có khác biệt",
              "Bình luận không thay đổi nội dung gốc, chỉ thêm ghi chú",
              "Bình luận nhanh hơn",
              "Chỉnh sửa không thể hoàn tác"
            ],
            "correctIndex": 1,
            "explanation": "Bình luận là góp ý riêng biệt, giữ nguyên nội dung chính.",
            "competencyCode": "2.4",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Lịch dùng chung giúp ích gì cho nhóm?",
            "options": [
              "Trang trí",
              "Thấy được thời gian rảnh của nhau để đặt lịch họp",
              "Tính lương",
              "Không có tác dụng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công dụng chính của lịch dùng chung.",
            "competencyCode": "2.4",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Trên bảng công việc, thông tin nào cần được cập nhật thường xuyên?",
            "options": [
              "Tên công việc",
              "Trạng thái hiện tại",
              "Ngày tạo công việc",
              "Không cần cập nhật gì"
            ],
            "correctIndex": 1,
            "explanation": "Cập nhật trạng thái giúp cả nhóm nắm tiến độ.",
            "competencyCode": "2.4",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Gắn thẻ (@) một người trong bình luận có tác dụng gì?",
            "options": [
              "Xóa bình luận đó",
              "Gửi thông báo để người đó biết",
              "Ẩn bình luận",
              "Không có tác dụng"
            ],
            "correctIndex": 1,
            "explanation": "Gắn thẻ thông báo trực tiếp tới người được nhắc đến.",
            "competencyCode": "2.4",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Vì sao không nên tạo bản sao riêng của tài liệu nhóm? A. Tốn dung lượng B. Tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn C. Không có lý do gì D. Vì quy định cấm Đáp án: B — Nhiều bản sao khiến khó xác định phiên bản nào là chính thức.",
          "2. Tính năng bình luận khác gì so với chỉnh sửa trực tiếp? A. Không có khác biệt B. Bình luận không thay đổi nội dung gốc, chỉ thêm ghi chú C. Bình luận nhanh hơn D. Chỉnh sửa không thể hoàn tác Đáp án: B — Bình luận là góp ý riêng biệt, giữ nguyên nội dung chính.",
          "3. Lịch dùng chung giúp ích gì cho nhóm? A. Trang trí B. Thấy được thời gian rảnh của nhau để đặt lịch họp C. Tính lương D. Không có tác dụng Đáp án: B — Đây là công dụng chính của lịch dùng chung.",
          "4. Trên bảng công việc, thông tin nào cần được cập nhật thường xuyên? A. Tên công việc B. Trạng thái hiện tại C. Ngày tạo công việc D. Không cần cập nhật gì Đáp án: B — Cập nhật trạng thái giúp cả nhóm nắm tiến độ.",
          "5. Gắn thẻ (@) một người trong bình luận có tác dụng gì? A. Xóa bình luận đó B. Gửi thông báo để người đó biết C. Ẩn bình luận D. Không có tác dụng Đáp án: B — Gắn thẻ thông báo trực tiếp tới người được nhắc đến."
        ]
      },
      {
        "moduleIndex": 5,
        "title": "Ứng xử trên môi trường số",
        "competencyCode": "2.5",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số",
          "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số",
          "Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ"
        ],
        "definitions": [
          "Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến",
          "Văn phong: cách diễn đạt, mức độ trang trọng trong giao tiếp",
          "Quấy rối trên môi trường số: hành vi lặp lại gây khó chịu, đe dọa hoặc xúc phạm qua kênh số"
        ],
        "body": [
          "Nghi thức số là tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến. Cách giao tiếp với đồng nghiệp, cấp trên và khách hàng nên khác nhau về mức độ trang trọng.",
          "Việc dùng biểu tượng cảm xúc hay viết hoa toàn bộ câu cần cân nhắc theo ngữ cảnh — viết hoa toàn bộ thường được hiểu là đang hét lên. Thời điểm gửi tin nhắn cũng là một phần của nghi thức số: gửi tin nhắn công việc ngoài giờ có thể tạo áp lực không cần thiết.",
          "Khi nhận được tin nhắn mang tính công kích, nên lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp thay vì tự giải quyết bằng cách đáp trả tương tự.",
          "Đồng nghiệp trong một công ty có thể khác nhau về văn hóa (người miền Bắc/Nam/Trung, người nước ngoài) và về thế hệ (Gen Z mới đi làm, người đã đi làm 20 năm) — mỗi nhóm có thể quen với cách giao tiếp khác nhau. Ví dụ: một số người lớn tuổi thấy nhắn tin quá ngắn gọn là thiếu lễ độ, trong khi một số người trẻ thấy email dài dòng là mất thời gian. Nhận biết được sự khác biệt đơn giản này giúp chọn cách giao tiếp phù hợp hơn với từng người, thay vì áp dụng một kiểu duy nhất cho tất cả."
        ],
        "examples": [],
        "practice": "Cho năm tin nhắn công việc có vấn đề về văn phong, viết lại cho phù hợp và giải thích điều chỉnh.",
        "deliverable": "Bảng 5 tin nhắn trước và sau kèm giải thích.",
        "questions": [
          {
            "number": 1,
            "questionText": "Viết hoa toàn bộ câu trong tin nhắn thường được hiểu là gì?",
            "options": [
              "Nhấn mạnh lịch sự",
              "Đang hét lên, có thể gây hiểu lầm",
              "Không có ý nghĩa gì",
              "Thể hiện sự trang trọng"
            ],
            "correctIndex": 1,
            "explanation": "Viết hoa toàn bộ thường bị hiểu là ngữ điệu gay gắt.",
            "competencyCode": "2.5",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Gửi tin nhắn công việc ngoài giờ có thể gây ra điều gì?",
            "options": [
              "Không ảnh hưởng gì",
              "Tạo áp lực không cần thiết cho người nhận",
              "Luôn được hoan nghênh",
              "Tăng hiệu suất làm việc"
            ],
            "correctIndex": 1,
            "explanation": "Trừ trường hợp khẩn cấp, nên tôn trọng thời gian nghỉ của người nhận.",
            "competencyCode": "2.5",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Khi nhận tin nhắn mang tính công kích, nên làm gì đầu tiên?",
            "options": [
              "Đáp trả ngay lập tức bằng lời lẽ tương tự",
              "Lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp",
              "Xóa ngay tin nhắn",
              "Phớt lờ hoàn toàn"
            ],
            "correctIndex": 1,
            "explanation": "Lưu bằng chứng và báo cáo là cách xử lý phù hợp, tránh leo thang xung đột.",
            "competencyCode": "2.5",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Văn phong khi giao tiếp với khách hàng nên như thế nào?",
            "options": [
              "Giống hệt như với bạn bè",
              "Lịch sự, đầy đủ câu",
              "Ngắn gọn tối đa, không cần lịch sự",
              "Không quan trọng"
            ],
            "correctIndex": 1,
            "explanation": "Giao tiếp với khách hàng cần giữ sự chuyên nghiệp và lịch sự.",
            "competencyCode": "2.5",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Vì sao cần lưu ý sự khác biệt văn hóa và thế hệ khi giao tiếp với đồng nghiệp?",
            "options": [
              "Không cần thiết, giao tiếp giống nhau với tất cả mọi người",
              "Mỗi nhóm có thể quen với cách giao tiếp khác nhau, cần điều chỉnh phù hợp",
              "Chỉ áp dụng với đối tác nước ngoài",
              "Chỉ người lớn tuổi cần được lưu ý"
            ],
            "correctIndex": 1,
            "explanation": "Nhận biết sự khác biệt giúp chọn cách giao tiếp phù hợp hơn với từng người thay vì áp dụng một kiểu cho tất cả.",
            "competencyCode": "2.5",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Viết hoa toàn bộ câu trong tin nhắn thường được hiểu là gì? A. Nhấn mạnh lịch sự B. Đang hét lên, có thể gây hiểu lầm C. Không có ý nghĩa gì D. Thể hiện sự trang trọng Đáp án: B — Viết hoa toàn bộ thường bị hiểu là ngữ điệu gay gắt.",
          "2. Gửi tin nhắn công việc ngoài giờ có thể gây ra điều gì? A. Không ảnh hưởng gì B. Tạo áp lực không cần thiết cho người nhận C. Luôn được hoan nghênh D. Tăng hiệu suất làm việc Đáp án: B — Trừ trường hợp khẩn cấp, nên tôn trọng thời gian nghỉ của người nhận.",
          "3. Khi nhận tin nhắn mang tính công kích, nên làm gì đầu tiên? A. Đáp trả ngay lập tức bằng lời lẽ tương tự B. Lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp C. Xóa ngay tin nhắn D. Phớt lờ hoàn toàn Đáp án: B — Lưu bằng chứng và báo cáo là cách xử lý phù hợp, tránh leo thang xung đột.",
          "4. Văn phong khi giao tiếp với khách hàng nên như thế nào? A. Giống hệt như với bạn bè B. Lịch sự, đầy đủ câu C. Ngắn gọn tối đa, không cần lịch sự D. Không quan trọng Đáp án: B — Giao tiếp với khách hàng cần giữ sự chuyên nghiệp và lịch sự.",
          "5. Vì sao cần lưu ý sự khác biệt văn hóa và thế hệ khi giao tiếp với đồng nghiệp? A. Không cần thiết, giao tiếp giống nhau với tất cả mọi người B. Mỗi nhóm có thể quen với cách giao tiếp khác nhau, cần điều chỉnh phù hợp C. Chỉ áp dụng với đối tác nước ngoài D. Chỉ người lớn tuổi cần được lưu ý Đáp án: B — Nhận biết sự khác biệt giúp chọn cách giao tiếp phù hợp hơn với từng người thay vì áp dụng một kiểu cho tất cả."
        ]
      },
      {
        "moduleIndex": 6,
        "title": "Danh tính số cá nhân",
        "competencyCode": "2.6",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được danh tính số",
          "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân",
          "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số"
        ],
        "definitions": [
          "Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác",
          "Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến",
          "Dấu vết số (digital footprint): toàn bộ thông tin về một người còn lại trên môi trường số qua các hoạt động trực tuyến"
        ],
        "body": [
          "Danh tính số là tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác. Mọi hoạt động trực tuyến đều để lại dấu vết có thể tồn tại rất lâu, kể cả sau khi nội dung gốc đã bị xóa.",
          "Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp biết được người khác nhìn thấy gì về mình. Cài đặt quyền riêng tư trên mạng xã hội nên được rà soát định kỳ. Nên tách bạch tài khoản cá nhân và tài khoản dùng cho công việc khi có thể, để bảo vệ danh tiếng trực tuyến của bản thân."
        ],
        "examples": [],
        "practice": "Tự tra cứu tên mình trên công cụ tìm kiếm, liệt kê những gì công khai, rà soát và điều chỉnh cài đặt riêng tư của một tài khoản.",
        "deliverable": "Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh.",
        "questions": [
          {
            "number": 1,
            "questionText": "Dấu vết số là gì?",
            "options": [
              "Chữ ký điện tử",
              "Toàn bộ thông tin về một người còn lại trên môi trường số",
              "Mật khẩu tài khoản",
              "Địa chỉ IP"
            ],
            "correctIndex": 1,
            "explanation": "Đây là định nghĩa của dấu vết số.",
            "competencyCode": "2.6",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Nội dung đã xóa trên mạng có thể vẫn tồn tại vì sao?",
            "options": [
              "Không thể nào tồn tại được nữa",
              "Người khác có thể đã lưu hoặc chia sẻ lại trước khi xóa",
              "Máy chủ luôn giữ vĩnh viễn",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Việc sao chép hoặc chia sẻ trước khi xóa khiến nội dung vẫn tồn tại ở nơi khác.",
            "competencyCode": "2.6",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Vì sao nên tách bạch tài khoản cá nhân và công việc?",
            "options": [
              "Không cần thiết",
              "Tránh nội dung cá nhân ảnh hưởng hình ảnh nghề nghiệp và ngược lại",
              "Chỉ để tiết kiệm dung lượng",
              "Vì quy định pháp luật bắt buộc"
            ],
            "correctIndex": 1,
            "explanation": "Tách bạch giúp bảo vệ cả đời sống cá nhân và hình ảnh nghề nghiệp.",
            "competencyCode": "2.6",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp ích gì?",
            "options": [
              "Không có tác dụng gì",
              "Biết được người khác nhìn thấy gì về mình trên mạng",
              "Tăng thứ hạng tìm kiếm",
              "Xóa dấu vết số"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cách đơn giản để kiểm tra hình ảnh công khai của bản thân.",
            "competencyCode": "2.6",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Đăng hình ảnh đồng nghiệp lên tài khoản cá nhân mà không xin phép có vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Có thể vi phạm quyền riêng tư của người khác",
              "Luôn được khuyến khích",
              "Chỉ có vấn đề nếu đăng công khai"
            ],
            "correctIndex": 1,
            "explanation": "Cần có sự đồng ý trước khi đăng tải hình ảnh hoặc thông tin của người khác.",
            "competencyCode": "2.6",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Dấu vết số là gì? A. Chữ ký điện tử B. Toàn bộ thông tin về một người còn lại trên môi trường số C. Mật khẩu tài khoản D. Địa chỉ IP Đáp án: B — Đây là định nghĩa của dấu vết số.",
          "2. Nội dung đã xóa trên mạng có thể vẫn tồn tại vì sao? A. Không thể nào tồn tại được nữa B. Người khác có thể đã lưu hoặc chia sẻ lại trước khi xóa C. Máy chủ luôn giữ vĩnh viễn D. Không có lý do cụ thể Đáp án: B — Việc sao chép hoặc chia sẻ trước khi xóa khiến nội dung vẫn tồn tại ở nơi khác.",
          "3. Vì sao nên tách bạch tài khoản cá nhân và công việc? A. Không cần thiết B. Tránh nội dung cá nhân ảnh hưởng hình ảnh nghề nghiệp và ngược lại C. Chỉ để tiết kiệm dung lượng D. Vì quy định pháp luật bắt buộc Đáp án: B — Tách bạch giúp bảo vệ cả đời sống cá nhân và hình ảnh nghề nghiệp.",
          "4. Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp ích gì? A. Không có tác dụng gì B. Biết được người khác nhìn thấy gì về mình trên mạng C. Tăng thứ hạng tìm kiếm D. Xóa dấu vết số Đáp án: B — Đây là cách đơn giản để kiểm tra hình ảnh công khai của bản thân.",
          "5. Đăng hình ảnh đồng nghiệp lên tài khoản cá nhân mà không xin phép có vấn đề gì? A. Không có vấn đề gì B. Có thể vi phạm quyền riêng tư của người khác C. Luôn được khuyến khích D. Chỉ có vấn đề nếu đăng công khai Đáp án: B — Cần có sự đồng ý trước khi đăng tải hình ảnh hoặc thông tin của người khác."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M2-F",
      "brief": "Trong một ngày làm việc, bạn gặp chuỗi tình huống sau: nhận yêu cầu công việc qua email, cần chia sẻ một tài liệu với đồng nghiệp, nhận được một tin nhắn khó chịu từ đối tác, và cần cập nhật tiến độ công việc nhóm. Hãy xử lý từng tình huống, thể hiện rõ cách áp dụng kiến thức đã học.\nTiêu chí chấm:\nEmail phản hồi đúng cấu trúc, chọn đúng người nhận (Đến/CC)\nChia sẻ tài liệu đúng quyền, đúng nguyên tắc tối thiểu\nXử lý tin nhắn khó chịu đúng cách (không đáp trả cảm tính)\nCập nhật công việc nhóm rõ ràng, đúng trạng thái\nVăn phong phù hợp trong toàn bộ các tình huống\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A2-I": {
    "code": "A2-I",
    "title": "GIAO TIẾP VÀ CỘNG TÁC CHUYÊN NGHIỆP",
    "domainNumber": 2,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 6 module · 15 giờ · Tiên quyết: M2-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Giao tiếp hiệu quả theo tình huống",
        "competencyCode": "2.1",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Lựa chọn được nhiều công nghệ số để tương tác",
          "Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể"
        ],
        "definitions": [
          "Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử",
          "Giao tiếp bất đồng bộ: giao tiếp không yêu cầu phản hồi ngay lập tức (email, bình luận)",
          "Giao tiếp đồng bộ: giao tiếp yêu cầu phản hồi tức thời (gọi điện, họp trực tuyến, chat trực tiếp)",
          "Biên bản họp: văn bản ghi lại nội dung, quyết định và việc cần làm sau cuộc họp"
        ],
        "body": [
          "Ở mức trung cấp, việc chọn phương tiện giao tiếp số cần dựa trên ba yếu tố: độ khẩn (cần trả lời ngay hay có thể chờ), độ phức tạp (câu trả lời đơn giản hay cần thảo luận qua lại), và nhu cầu lưu vết (có cần bằng chứng văn bản không).",
          "Một email đạt mục đích trong một lần gửi cần nêu rõ ngay từ đầu: mục đích của email, thông tin cần thiết để người nhận hiểu bối cảnh, và hành động cụ thể mong muốn kèm thời hạn. Với email từ chối, nên nêu quyết định rõ ràng trước, sau đó mới giải thích lý do.",
          "Khi điều hành họp trực tuyến, cần có chương trình họp gửi trước, phân công người ghi biên bản, và kết thúc bằng việc tóm tắt quyết định cùng việc cần làm cho từng người. Khi làm việc với người ở múi giờ khác, nên ưu tiên giao tiếp bất đồng bộ và ghi rõ thời hạn phản hồi mong muốn."
        ],
        "examples": [],
        "practice": "Viết ba email khó: từ chối yêu cầu của cấp trên, thúc tiến độ đối tác, và thông báo tin không tốt cho khách hàng. Với mỗi email, nêu rõ mục tiêu và lý do chọn cách viết như vậy.",
        "deliverable": "3 email kèm giải trình chiến lược giao tiếp.",
        "questions": [
          {
            "number": 1,
            "questionText": "Việc nào nên dùng kênh giao tiếp đồng bộ (họp, gọi điện)?",
            "options": [
              "Thông báo lịch nghỉ lễ",
              "Thảo luận phức tạp cần trao đổi qua lại",
              "Gửi tài liệu tham khảo",
              "Nhắc lịch hẹn"
            ],
            "correctIndex": 1,
            "explanation": "Giao tiếp đồng bộ phù hợp cho nội dung cần thảo luận trực tiếp.",
            "competencyCode": "2.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Email từ chối nên bắt đầu bằng gì?",
            "options": [
              "Lời xin lỗi dài dòng",
              "Nêu quyết định rõ ràng trước, sau đó giải thích",
              "Kể chuyện dẫn dắt",
              "Không cần cấu trúc rõ ràng"
            ],
            "correctIndex": 1,
            "explanation": "Nêu rõ quyết định trước giúp người đọc không mất kiên nhẫn chờ đợi.",
            "competencyCode": "2.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Khi làm việc với người ở múi giờ khác, nên làm gì?",
            "options": [
              "Yêu cầu phản hồi tức thời",
              "Ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn mong muốn",
              "Chỉ liên lạc khi cùng múi giờ",
              "Không cần điều chỉnh gì"
            ],
            "correctIndex": 1,
            "explanation": "Giao tiếp bất đồng bộ phù hợp hơn khi có chênh lệch múi giờ.",
            "competencyCode": "2.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi nào nên chuyển từ chat sang gọi điện để giải quyết bất đồng?",
            "options": [
              "Ngay từ tin nhắn đầu tiên",
              "Sau hai đến ba lượt trao đổi chưa thống nhất được",
              "Không bao giờ cần chuyển",
              "Chỉ khi được yêu cầu"
            ],
            "correctIndex": 1,
            "explanation": "Văn bản dễ hiểu sai giọng điệu; chuyển kênh sớm giúp tránh kéo dài tranh luận.",
            "competencyCode": "2.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Một cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì?",
            "options": [
              "Kết thúc đột ngột không tổng kết",
              "Tóm tắt quyết định và việc cần làm cho từng người",
              "Chỉ chào tạm biệt",
              "Không cần kết luận gì"
            ],
            "correctIndex": 1,
            "explanation": "Tóm tắt cuối họp đảm bảo mọi người hiểu rõ hành động tiếp theo.",
            "competencyCode": "2.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Việc nào nên dùng kênh giao tiếp đồng bộ (họp, gọi điện)? A. Thông báo lịch nghỉ lễ B. Thảo luận phức tạp cần trao đổi qua lại C. Gửi tài liệu tham khảo D. Nhắc lịch hẹn Đáp án: B — Giao tiếp đồng bộ phù hợp cho nội dung cần thảo luận trực tiếp.",
          "2. Email từ chối nên bắt đầu bằng gì? A. Lời xin lỗi dài dòng B. Nêu quyết định rõ ràng trước, sau đó giải thích C. Kể chuyện dẫn dắt D. Không cần cấu trúc rõ ràng Đáp án: B — Nêu rõ quyết định trước giúp người đọc không mất kiên nhẫn chờ đợi.",
          "3. Khi làm việc với người ở múi giờ khác, nên làm gì? A. Yêu cầu phản hồi tức thời B. Ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn mong muốn C. Chỉ liên lạc khi cùng múi giờ D. Không cần điều chỉnh gì Đáp án: B — Giao tiếp bất đồng bộ phù hợp hơn khi có chênh lệch múi giờ.",
          "4. Khi nào nên chuyển từ chat sang gọi điện để giải quyết bất đồng? A. Ngay từ tin nhắn đầu tiên B. Sau hai đến ba lượt trao đổi chưa thống nhất được C. Không bao giờ cần chuyển D. Chỉ khi được yêu cầu Đáp án: B — Văn bản dễ hiểu sai giọng điệu; chuyển kênh sớm giúp tránh kéo dài tranh luận.",
          "5. Một cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì? A. Kết thúc đột ngột không tổng kết B. Tóm tắt quyết định và việc cần làm cho từng người C. Chỉ chào tạm biệt D. Không cần kết luận gì Đáp án: B — Tóm tắt cuối họp đảm bảo mọi người hiểu rõ hành động tiếp theo."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Chia sẻ thông tin có kiểm soát",
        "competencyCode": "2.2",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung",
          "Áp dụng được các phương pháp tham chiếu và ghi chú nguồn"
        ],
        "definitions": [],
        "body": [
          "Phân loại thông tin: việc gán một tài liệu vào một trong các mức nhạy cảm để xác định cách xử lý phù hợp",
          "Bốn mức phân loại phổ biến: công khai, nội bộ, hạn chế, mật",
          "Ở mức trung cấp, việc chia sẻ thông tin và nội dung số cần thêm vai trò đóng làm người trung gian — lựa chọn công nghệ số phù hợp để trao đổi dữ liệu, đồng thời hiểu biết về thực hành trích dẫn và ghi chú nguồn khi chia sẻ nội dung không phải do mình tạo ra.",
          "Bốn mức phân loại thông tin giúp xác định cách chia sẻ phù hợp: công khai (ai cũng xem được), nội bộ (chỉ nhân viên công ty), hạn chế (chỉ nhóm/bộ phận liên quan), mật (chỉ người được chỉ định cụ thể). Thông tin mật không bao giờ dùng liên kết chia sẻ mở, luôn chỉ định người nhận cụ thể.",
          "Quyền truy cập cần được rà soát định kỳ, đặc biệt khi có nhân sự nghỉ việc hoặc chuyển vị trí. Khi phát hiện đã chia sẻ nhầm thông tin nhạy cảm, cần thu hồi quyền truy cập ngay lập tức."
        ],
        "examples": [],
        "practice": "Phân loại 10 loại tài liệu của doanh nghiệp theo bốn mức, thiết lập quyền tương ứng cho từng mức và lập lịch rà soát.",
        "deliverable": "Bảng phân loại tài liệu, bảng quyền, lịch rà soát.",
        "questions": [
          {
            "number": 1,
            "questionText": "Thông tin mật nên được chia sẻ như thế nào?",
            "options": [
              "Bằng liên kết mở cho tiện lợi",
              "Chỉ định người nhận cụ thể, có thể giới hạn thời hạn và quyền tải xuống",
              "Đăng công khai để minh bạch",
              "Gửi cho toàn công ty"
            ],
            "correctIndex": 1,
            "explanation": "Thông tin mật cần kiểm soát chặt chẽ về người nhận và thời hạn.",
            "competencyCode": "2.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Vì sao cần rà soát quyền truy cập định kỳ?",
            "options": [
              "Không cần thiết nếu không có sự cố",
              "Quyền cũ không tự động mất khi nhân sự nghỉ việc hoặc chuyển vị trí",
              "Chỉ để kiểm tra dung lượng",
              "Theo yêu cầu ngẫu nhiên"
            ],
            "correctIndex": 1,
            "explanation": "Quyền truy cập tồn tại cho đến khi bị chủ động thu hồi.",
            "competencyCode": "2.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Khi phát hiện chia sẻ nhầm thông tin nhạy cảm, bước đầu tiên nên làm là gì?",
            "options": [
              "Im lặng chờ xem có ai phát hiện không",
              "Thu hồi quyền truy cập ngay lập tức",
              "Xóa toàn bộ tài liệu",
              "Đợi cuối tuần mới xử lý"
            ],
            "correctIndex": 1,
            "explanation": "Thu hồi quyền ngay giúp hạn chế phạm vi ảnh hưởng.",
            "competencyCode": "2.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Bốn mức phân loại thông tin phổ biến là gì?",
            "options": [
              "Cao, trung bình, thấp, không có",
              "Công khai, nội bộ, hạn chế, mật",
              "Quan trọng, không quan trọng",
              "Mới, cũ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bốn mức phân loại phổ biến trong quản lý thông tin doanh nghiệp.",
            "competencyCode": "2.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Thông tin “nội bộ” nghĩa là gì?",
            "options": [
              "Chỉ một người được xem",
              "Chỉ nhân viên công ty được xem, không chia sẻ ra ngoài",
              "Ai cũng có thể xem",
              "Chỉ ban giám đốc được xem"
            ],
            "correctIndex": 1,
            "explanation": "Nội bộ là mức dành cho nhân viên trong công ty, không công khai ra ngoài.",
            "competencyCode": "2.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Thông tin mật nên được chia sẻ như thế nào? A. Bằng liên kết mở cho tiện lợi B. Chỉ định người nhận cụ thể, có thể giới hạn thời hạn và quyền tải xuống C. Đăng công khai để minh bạch D. Gửi cho toàn công ty Đáp án: B — Thông tin mật cần kiểm soát chặt chẽ về người nhận và thời hạn.",
          "2. Vì sao cần rà soát quyền truy cập định kỳ? A. Không cần thiết nếu không có sự cố B. Quyền cũ không tự động mất khi nhân sự nghỉ việc hoặc chuyển vị trí C. Chỉ để kiểm tra dung lượng D. Theo yêu cầu ngẫu nhiên Đáp án: B — Quyền truy cập tồn tại cho đến khi bị chủ động thu hồi.",
          "3. Khi phát hiện chia sẻ nhầm thông tin nhạy cảm, bước đầu tiên nên làm là gì? A. Im lặng chờ xem có ai phát hiện không B. Thu hồi quyền truy cập ngay lập tức C. Xóa toàn bộ tài liệu D. Đợi cuối tuần mới xử lý Đáp án: B — Thu hồi quyền ngay giúp hạn chế phạm vi ảnh hưởng.",
          "4. Bốn mức phân loại thông tin phổ biến là gì? A. Cao, trung bình, thấp, không có B. Công khai, nội bộ, hạn chế, mật C. Quan trọng, không quan trọng D. Mới, cũ Đáp án: B — Đây là bốn mức phân loại phổ biến trong quản lý thông tin doanh nghiệp.",
          "5. Thông tin “nội bộ” nghĩa là gì? A. Chỉ một người được xem B. Chỉ nhân viên công ty được xem, không chia sẻ ra ngoài C. Ai cũng có thể xem D. Chỉ ban giám đốc được xem Đáp án: B — Nội bộ là mức dành cho nhân viên trong công ty, không công khai ra ngoài."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp",
        "competencyCode": "2.3",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Lựa chọn được các dịch vụ số để tham gia vào xã hội",
          "Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân"
        ],
        "definitions": [
          "Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Hóa đơn điện tử: hóa đơn được lập, gửi và lưu trữ dưới dạng dữ liệu điện tử, có giá trị pháp lý như hóa đơn giấy",
          "Mã số hồ sơ: mã định danh dùng để tra cứu trạng thái xử lý của một hồ sơ đã nộp"
        ],
        "body": [
          "Ở mức trung cấp, việc sử dụng dịch vụ số để tham gia xã hội mở rộng sang phạm vi công việc — thực hiện thủ tục hành chính trực tuyến cho doanh nghiệp như khai thuế, đóng bảo hiểm xã hội, đăng ký thay đổi thông tin doanh nghiệp.",
          "Mỗi thủ tục thường yêu cầu chữ ký số để xác nhận tính hợp lệ của hồ sơ. Hóa đơn điện tử đã thay thế phần lớn hóa đơn giấy trong giao dịch doanh nghiệp. Sau khi nộp hồ sơ trực tuyến, nên lưu lại mã số hồ sơ để theo dõi trạng thái xử lý.",
          "Lừa đảo mạo danh cơ quan thuế, bảo hiểm xã hội là hình thức phổ biến — cách xác minh là luôn kiểm tra lại qua kênh chính thức thay vì làm theo hướng dẫn trong tin nhắn/cuộc gọi đáng ngờ."
        ],
        "examples": [],
        "practice": "Lập quy trình chi tiết cho một thủ tục trực tuyến mà bộ phận thường xuyên thực hiện, kèm danh mục hồ sơ cần có và các điểm dễ sai sót.",
        "deliverable": "Quy trình thủ tục dạng các bước và danh mục kiểm tra.",
        "questions": [
          {
            "number": 1,
            "questionText": "Chữ ký số dùng để làm gì trong thủ tục hành chính trực tuyến?",
            "options": [
              "Trang trí hồ sơ",
              "Xác nhận tính hợp lệ của hồ sơ, thay thế chữ ký tay",
              "Tăng tốc độ xử lý",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Chữ ký số xác thực tính hợp lệ và có giá trị pháp lý.",
            "competencyCode": "2.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Sau khi nộp hồ sơ trực tuyến, nên lưu lại gì để theo dõi?",
            "options": [
              "Không cần lưu gì",
              "Mã số hồ sơ",
              "Ảnh chụp màn hình bất kỳ",
              "Không cần thiết vì hệ thống tự động thông báo"
            ],
            "correctIndex": 1,
            "explanation": "Mã số hồ sơ là căn cứ để tra cứu trạng thái xử lý.",
            "competencyCode": "2.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Nhận được tin nhắn yêu cầu “nộp phạt gấp” mạo danh cơ quan thuế, nên làm gì?",
            "options": [
              "Chuyển tiền ngay theo hướng dẫn",
              "Xác minh lại qua kênh chính thức trước khi hành động",
              "Xóa tin nhắn và không làm gì",
              "Trả lời tin nhắn để hỏi thêm"
            ],
            "correctIndex": 1,
            "explanation": "Luôn xác minh qua kênh chính thức trước khi thực hiện bất kỳ yêu cầu tài chính nào.",
            "competencyCode": "2.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Hóa đơn điện tử có giá trị pháp lý như thế nào so với hóa đơn giấy?",
            "options": [
              "Không có giá trị pháp lý",
              "Có giá trị pháp lý tương đương",
              "Chỉ có giá trị tham khảo",
              "Chỉ dùng nội bộ"
            ],
            "correctIndex": 1,
            "explanation": "Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy theo quy định.",
            "competencyCode": "2.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Khi hồ sơ bị trả về do thiếu sót, nên làm gì?",
            "options": [
              "Nộp lại từ đầu hoàn toàn mới",
              "Xử lý theo đúng hướng dẫn trong thông báo",
              "Bỏ qua và nộp lại y hệt",
              "Liên hệ người quen để “chạy” hồ sơ"
            ],
            "correctIndex": 1,
            "explanation": "Xử lý đúng theo hướng dẫn cụ thể trong thông báo trả hồ sơ là cách hiệu quả nhất.",
            "competencyCode": "2.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Chữ ký số dùng để làm gì trong thủ tục hành chính trực tuyến? A. Trang trí hồ sơ B. Xác nhận tính hợp lệ của hồ sơ, thay thế chữ ký tay C. Tăng tốc độ xử lý D. Không có tác dụng thực tế Đáp án: B — Chữ ký số xác thực tính hợp lệ và có giá trị pháp lý.",
          "2. Sau khi nộp hồ sơ trực tuyến, nên lưu lại gì để theo dõi? A. Không cần lưu gì B. Mã số hồ sơ C. Ảnh chụp màn hình bất kỳ D. Không cần thiết vì hệ thống tự động thông báo Đáp án: B — Mã số hồ sơ là căn cứ để tra cứu trạng thái xử lý.",
          "3. Nhận được tin nhắn yêu cầu “nộp phạt gấp” mạo danh cơ quan thuế, nên làm gì? A. Chuyển tiền ngay theo hướng dẫn B. Xác minh lại qua kênh chính thức trước khi hành động C. Xóa tin nhắn và không làm gì D. Trả lời tin nhắn để hỏi thêm Đáp án: B — Luôn xác minh qua kênh chính thức trước khi thực hiện bất kỳ yêu cầu tài chính nào.",
          "4. Hóa đơn điện tử có giá trị pháp lý như thế nào so với hóa đơn giấy? A. Không có giá trị pháp lý B. Có giá trị pháp lý tương đương C. Chỉ có giá trị tham khảo D. Chỉ dùng nội bộ Đáp án: B — Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy theo quy định.",
          "5. Khi hồ sơ bị trả về do thiếu sót, nên làm gì? A. Nộp lại từ đầu hoàn toàn mới B. Xử lý theo đúng hướng dẫn trong thông báo C. Bỏ qua và nộp lại y hệt D. Liên hệ người quen để “chạy” hồ sơ Đáp án: B — Xử lý đúng theo hướng dẫn cụ thể trong thông báo trả hồ sơ là cách hiệu quả nhất."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Điều phối công việc nhóm",
        "competencyCode": "2.4",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác"
        ],
        "definitions": [
          "Quy ước nhóm (team norms): các thỏa thuận chung về cách thức làm việc, kênh giao tiếp, thời gian phản hồi trong nhóm",
          "Vi quản lý (micromanagement): việc kiểm soát quá chi tiết công việc của người khác, gây cản trở thay vì hỗ trợ"
        ],
        "body": [
          "Ở mức trung cấp, việc hợp tác qua công nghệ số cần lựa chọn công cụ phù hợp một cách có chủ đích hơn cho từng quy trình cụ thể của nhóm, không chỉ dùng công cụ mặc định.",
          "Khi phân công công việc, cần nói rõ ba điều: ai làm, làm xong khi nào, và thế nào được coi là hoàn thành. Theo dõi tiến độ nên dựa trên cập nhật trạng thái trên bảng công việc, tránh việc liên tục hỏi han trực tiếp gây cảm giác bị vi quản lý.",
          "Quy ước nhóm nên xác định rõ: kênh nào dùng cho loại việc gì, thời gian phản hồi kỳ vọng là bao lâu. Khi bàn giao công việc, cần có tài liệu bàn giao rõ ràng thay vì trao đổi miệng."
        ],
        "examples": [],
        "practice": "Thiết lập không gian làm việc cho một dự án thật của bộ phận: bảng công việc, cấu trúc tài liệu, và quy ước nhóm bằng văn bản.",
        "deliverable": "Không gian làm việc nhóm và bản quy ước nhóm.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khi phân công công việc, ba điều cần nói rõ là gì?",
            "options": [
              "Ai làm, ở đâu, khi nào",
              "Ai làm, làm xong khi nào, thế nào là hoàn thành",
              "Ai làm, làm gì, tại sao",
              "Không cần nói rõ gì"
            ],
            "correctIndex": 1,
            "explanation": "Thiếu tiêu chí “thế nào là xong” thường gây tranh cãi về chất lượng sau này.",
            "competencyCode": "2.4",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Vi quản lý là gì?",
            "options": [
              "Quản lý một nhóm nhỏ",
              "Kiểm soát quá chi tiết công việc người khác, gây cản trở",
              "Quản lý từ xa",
              "Không giao việc cho ai"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hành vi kiểm soát thái quá, phản tác dụng.",
            "competencyCode": "2.4",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Cách tốt để theo dõi tiến độ mà không gây cảm giác vi quản lý là gì?",
            "options": [
              "Hỏi han liên tục trực tiếp",
              "Dựa trên cập nhật trạng thái trên bảng công việc",
              "Không theo dõi gì cả",
              "Yêu cầu báo cáo mỗi giờ"
            ],
            "correctIndex": 1,
            "explanation": "Cập nhật trạng thái minh bạch giúp theo dõi mà không cần giám sát trực tiếp liên tục.",
            "competencyCode": "2.4",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Quy ước nhóm nên bao gồm nội dung gì?",
            "options": [
              "Chỉ cần tên các thành viên",
              "Kênh nào dùng cho việc gì, thời gian phản hồi kỳ vọng",
              "Không cần thiết lập quy ước",
              "Chỉ áp dụng cho nhóm lớn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là những nội dung cốt lõi giúp nhóm làm việc hiệu quả và nhất quán.",
            "competencyCode": "2.4",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Khi bàn giao công việc, nên làm gì?",
            "options": [
              "Trao đổi miệng là đủ",
              "Có tài liệu bàn giao rõ ràng bằng văn bản",
              "Không cần bàn giao nếu công việc đơn giản",
              "Chỉ cần gửi email ngắn gọn “bàn giao xong”"
            ],
            "correctIndex": 1,
            "explanation": "Tài liệu bàn giao rõ ràng giúp người tiếp nhận nắm được đầy đủ thông tin cần thiết.",
            "competencyCode": "2.4",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Khi phân công công việc, ba điều cần nói rõ là gì? A. Ai làm, ở đâu, khi nào B. Ai làm, làm xong khi nào, thế nào là hoàn thành C. Ai làm, làm gì, tại sao D. Không cần nói rõ gì Đáp án: B — Thiếu tiêu chí “thế nào là xong” thường gây tranh cãi về chất lượng sau này.",
          "2. Vi quản lý là gì? A. Quản lý một nhóm nhỏ B. Kiểm soát quá chi tiết công việc người khác, gây cản trở C. Quản lý từ xa D. Không giao việc cho ai Đáp án: B — Đây là hành vi kiểm soát thái quá, phản tác dụng.",
          "3. Cách tốt để theo dõi tiến độ mà không gây cảm giác vi quản lý là gì? A. Hỏi han liên tục trực tiếp B. Dựa trên cập nhật trạng thái trên bảng công việc C. Không theo dõi gì cả D. Yêu cầu báo cáo mỗi giờ Đáp án: B — Cập nhật trạng thái minh bạch giúp theo dõi mà không cần giám sát trực tiếp liên tục.",
          "4. Quy ước nhóm nên bao gồm nội dung gì? A. Chỉ cần tên các thành viên B. Kênh nào dùng cho việc gì, thời gian phản hồi kỳ vọng C. Không cần thiết lập quy ước D. Chỉ áp dụng cho nhóm lớn Đáp án: B — Đây là những nội dung cốt lõi giúp nhóm làm việc hiệu quả và nhất quán.",
          "5. Khi bàn giao công việc, nên làm gì? A. Trao đổi miệng là đủ B. Có tài liệu bàn giao rõ ràng bằng văn bản C. Không cần bàn giao nếu công việc đơn giản D. Chỉ cần gửi email ngắn gọn “bàn giao xong” Đáp án: B — Tài liệu bàn giao rõ ràng giúp người tiếp nhận nắm được đầy đủ thông tin cần thiết."
        ]
      },
      {
        "moduleIndex": 5,
        "title": "Chuẩn mực ứng xử và xử lý tình huống khó",
        "competencyCode": "2.5",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số",
          "Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số",
          "Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số"
        ],
        "definitions": [
          "Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến",
          "Giao tiếp trực tiếp/gián tiếp: phong cách nói thẳng vấn đề (trực tiếp) so với diễn đạt vòng vo, ngụ ý (gián tiếp), khác nhau tùy văn hóa",
          "Vai trò người chứng kiến (bystander): người nhìn thấy hành vi không phù hợp nhưng không phải là người bị ảnh hưởng trực tiếp"
        ],
        "body": [
          "Ở mức trung cấp, việc thực hiện nghi thức số cần mở rộng sang bối cảnh đa văn hóa và tình huống khó xử lý hơn. Khi giao tiếp với đối tác nước ngoài, cần lưu ý sự khác biệt văn hóa về mức độ trực tiếp trong cách nói, thái độ với thứ bậc, và kỳ vọng về thời gian phản hồi.",
          "Khi khách hàng để lại phản hồi tiêu cực trên kênh công khai, nguyên tắc xử lý là phản hồi công khai một cách chuyên nghiệp và mời chuyển sang kênh riêng để giải quyết chi tiết.",
          "Trong nhóm chat công việc, nếu phát hiện hành vi bắt nạt trên mạng, loại trừ hoặc quấy rối, người chứng kiến có vai trò quan trọng — có thể lên tiếng trực tiếp hoặc báo cáo cho người quản lý. Xây quy tắc ứng xử số cho bộ phận giúp thiết lập chuẩn mực chung."
        ],
        "examples": [],
        "practice": "Soạn phản hồi công khai cho một đánh giá tiêu cực của khách hàng, và soạn dự thảo quy tắc ứng xử số 1 trang cho bộ phận.",
        "deliverable": "Bản phản hồi khách hàng và dự thảo quy tắc ứng xử.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khi khách hàng để lại phản hồi tiêu cực công khai, nên làm gì?",
            "options": [
              "Tranh luận công khai để bảo vệ danh dự công ty",
              "Phản hồi chuyên nghiệp, mời chuyển sang kênh riêng để giải quyết",
              "Xóa bình luận ngay lập tức",
              "Phớt lờ hoàn toàn"
            ],
            "correctIndex": 1,
            "explanation": "Phản hồi chuyên nghiệp và chuyển sang kênh riêng giúp giải quyết hiệu quả mà không leo thang công khai.",
            "competencyCode": "2.5",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Vai trò của người chứng kiến khi thấy hành vi bắt nạt trong nhóm chat là gì?",
            "options": [
              "Không có vai trò gì vì không bị ảnh hưởng trực tiếp",
              "Có thể lên tiếng hoặc báo cáo cho người quản lý",
              "Chỉ nên xem và không làm gì",
              "Rời khỏi nhóm ngay"
            ],
            "correctIndex": 1,
            "explanation": "Người chứng kiến có thể đóng vai trò quan trọng trong việc ngăn chặn hành vi không phù hợp.",
            "competencyCode": "2.5",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Khi giao tiếp với đối tác từ văn hóa coi trọng cách nói gián tiếp, nên lưu ý gì?",
            "options": [
              "Nói thẳng mọi vấn đề không cần cân nhắc",
              "Chú ý cách diễn đạt tế nhị hơn, hiểu ý ngụ ý",
              "Không cần điều chỉnh gì",
              "Luôn dùng văn phong trang trọng nhất"
            ],
            "correctIndex": 1,
            "explanation": "Cần điều chỉnh cách diễn đạt phù hợp với phong cách giao tiếp của đối tác.",
            "competencyCode": "2.5",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Quy tắc ứng xử số cho bộ phận nên bao gồm nội dung gì?",
            "options": [
              "Chỉ cần danh sách thành viên",
              "Giờ giấc nhắn tin, cách xử lý bất đồng, quy trình khi có vi phạm",
              "Không cần thiết lập",
              "Chỉ áp dụng cho nhân viên mới"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các nội dung cốt lõi để thiết lập chuẩn mực chung cho bộ phận.",
            "competencyCode": "2.5",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Kỳ vọng về thời gian phản hồi có giống nhau giữa các nền văn hóa không?",
            "options": [
              "Luôn giống nhau ở mọi nơi",
              "Khác nhau tùy văn hóa, cần tìm hiểu trước khi làm việc với đối tác",
              "Không quan trọng",
              "Chỉ phụ thuộc vào cấp bậc"
            ],
            "correctIndex": 1,
            "explanation": "Kỳ vọng phản hồi khác nhau tùy văn hóa, cần lưu ý khi làm việc xuyên quốc gia.",
            "competencyCode": "2.5",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Khi khách hàng để lại phản hồi tiêu cực công khai, nên làm gì? A. Tranh luận công khai để bảo vệ danh dự công ty B. Phản hồi chuyên nghiệp, mời chuyển sang kênh riêng để giải quyết C. Xóa bình luận ngay lập tức D. Phớt lờ hoàn toàn Đáp án: B — Phản hồi chuyên nghiệp và chuyển sang kênh riêng giúp giải quyết hiệu quả mà không leo thang công khai.",
          "2. Vai trò của người chứng kiến khi thấy hành vi bắt nạt trong nhóm chat là gì? A. Không có vai trò gì vì không bị ảnh hưởng trực tiếp B. Có thể lên tiếng hoặc báo cáo cho người quản lý C. Chỉ nên xem và không làm gì D. Rời khỏi nhóm ngay Đáp án: B — Người chứng kiến có thể đóng vai trò quan trọng trong việc ngăn chặn hành vi không phù hợp.",
          "3. Khi giao tiếp với đối tác từ văn hóa coi trọng cách nói gián tiếp, nên lưu ý gì? A. Nói thẳng mọi vấn đề không cần cân nhắc B. Chú ý cách diễn đạt tế nhị hơn, hiểu ý ngụ ý C. Không cần điều chỉnh gì D. Luôn dùng văn phong trang trọng nhất Đáp án: B — Cần điều chỉnh cách diễn đạt phù hợp với phong cách giao tiếp của đối tác.",
          "4. Quy tắc ứng xử số cho bộ phận nên bao gồm nội dung gì? A. Chỉ cần danh sách thành viên B. Giờ giấc nhắn tin, cách xử lý bất đồng, quy trình khi có vi phạm C. Không cần thiết lập D. Chỉ áp dụng cho nhân viên mới Đáp án: B — Đây là các nội dung cốt lõi để thiết lập chuẩn mực chung cho bộ phận.",
          "5. Kỳ vọng về thời gian phản hồi có giống nhau giữa các nền văn hóa không? A. Luôn giống nhau ở mọi nơi B. Khác nhau tùy văn hóa, cần tìm hiểu trước khi làm việc với đối tác C. Không quan trọng D. Chỉ phụ thuộc vào cấp bậc Đáp án: B — Kỳ vọng phản hồi khác nhau tùy văn hóa, cần lưu ý khi làm việc xuyên quốc gia."
        ]
      },
      {
        "moduleIndex": 6,
        "title": "Quản lý danh tính nghề nghiệp",
        "competencyCode": "2.6",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Hiển thị được nhiều danh tính số cụ thể",
          "Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân",
          "Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số"
        ],
        "definitions": [
          "Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác",
          "Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến",
          "Hồ sơ nghề nghiệp trực tuyến: thông tin về quá trình làm việc, kỹ năng, thành tích được thể hiện công khai trên môi trường số",
          "Phát ngôn nhân danh doanh nghiệp: phát biểu được hiểu là đại diện cho quan điểm chính thức của tổ chức, không chỉ là ý kiến cá nhân"
        ],
        "body": [
          "Ở mức trung cấp, việc quản lý danh tính số mở rộng sang hình ảnh nghề nghiệp — xây dựng hồ sơ nghề nghiệp trực tuyến nhất quán tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn.",
          "Ranh giới giữa phát ngôn cá nhân và phát ngôn nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ cá nhân có ghi rõ nơi làm việc — một bình luận về ngành nghề, dù với ý định cá nhân, có thể bị hiểu là quan điểm của công ty.",
          "Khi quản lý nhiều tài khoản, cần có quy tắc rõ ràng để tránh đăng nhầm nội dung. Rà soát nội dung cũ định kỳ giúp phát hiện những bài đăng không còn phù hợp, ảnh hưởng đến danh tiếng trực tuyến hiện tại."
        ],
        "examples": [],
        "practice": "Rà soát toàn bộ hiện diện trực tuyến của bản thân, lập danh sách nội dung cần điều chỉnh, và cập nhật hồ sơ nghề nghiệp chính.",
        "deliverable": "Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao một hồ sơ nghề nghiệp trực tuyến nhất quán lại quan trọng?",
            "options": [
              "Không quan trọng",
              "Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn",
              "Chỉ để trang trí",
              "Không ảnh hưởng đến công việc"
            ],
            "correctIndex": 1,
            "explanation": "Tính nhất quán tạo dựng uy tín và sự chuyên nghiệp.",
            "competencyCode": "2.6",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Một bình luận cá nhân về đối thủ cạnh tranh trên mạng xã hội có rủi ro gì?",
            "options": [
              "Không có rủi ro vì là ý kiến cá nhân",
              "Có thể bị hiểu là quan điểm của công ty, gây rủi ro uy tín hoặc pháp lý",
              "Luôn được khuyến khích",
              "Chỉ có vấn đề nếu đăng công khai"
            ],
            "correctIndex": 1,
            "explanation": "Ranh giới cá nhân và nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ có ghi nơi làm việc.",
            "competencyCode": "2.6",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ?",
            "options": [
              "Không cần thiết",
              "Phát hiện nội dung không còn phù hợp với hình ảnh nghề nghiệp hiện tại",
              "Chỉ để tăng lượt theo dõi",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Nội dung cũ có thể không còn phù hợp và ảnh hưởng đến hình ảnh hiện tại.",
            "competencyCode": "2.6",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi quản lý nhiều tài khoản (cá nhân, công việc), cần lưu ý điều gì?",
            "options": [
              "Không cần phân biệt gì",
              "Có quy tắc rõ ràng để tránh đăng nhầm nội dung vào sai tài khoản",
              "Dùng chung một mật khẩu cho tiện",
              "Không cần nhiều tài khoản"
            ],
            "correctIndex": 1,
            "explanation": "Quy tắc rõ ràng giúp tránh sai sót gây ảnh hưởng không mong muốn.",
            "competencyCode": "2.6",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Quyền yêu cầu gỡ bỏ thông tin cá nhân tồn tại nhằm mục đích gì?",
            "options": [
              "Không có mục đích cụ thể",
              "Cho phép cá nhân kiểm soát thông tin của mình trên một số nền tảng trong trường hợp nhất định",
              "Chỉ áp dụng cho người nổi tiếng",
              "Không có quyền này trong thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Đây là một quyền được quy định nhằm bảo vệ quyền kiểm soát thông tin cá nhân.",
            "competencyCode": "2.6",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Vì sao một hồ sơ nghề nghiệp trực tuyến nhất quán lại quan trọng? A. Không quan trọng B. Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn C. Chỉ để trang trí D. Không ảnh hưởng đến công việc Đáp án: B — Tính nhất quán tạo dựng uy tín và sự chuyên nghiệp.",
          "2. Một bình luận cá nhân về đối thủ cạnh tranh trên mạng xã hội có rủi ro gì? A. Không có rủi ro vì là ý kiến cá nhân B. Có thể bị hiểu là quan điểm của công ty, gây rủi ro uy tín hoặc pháp lý C. Luôn được khuyến khích D. Chỉ có vấn đề nếu đăng công khai Đáp án: B — Ranh giới cá nhân và nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ có ghi nơi làm việc.",
          "3. Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ? A. Không cần thiết B. Phát hiện nội dung không còn phù hợp với hình ảnh nghề nghiệp hiện tại C. Chỉ để tăng lượt theo dõi D. Không có lý do cụ thể Đáp án: B — Nội dung cũ có thể không còn phù hợp và ảnh hưởng đến hình ảnh hiện tại.",
          "4. Khi quản lý nhiều tài khoản (cá nhân, công việc), cần lưu ý điều gì? A. Không cần phân biệt gì B. Có quy tắc rõ ràng để tránh đăng nhầm nội dung vào sai tài khoản C. Dùng chung một mật khẩu cho tiện D. Không cần nhiều tài khoản Đáp án: B — Quy tắc rõ ràng giúp tránh sai sót gây ảnh hưởng không mong muốn.",
          "5. Quyền yêu cầu gỡ bỏ thông tin cá nhân tồn tại nhằm mục đích gì? A. Không có mục đích cụ thể B. Cho phép cá nhân kiểm soát thông tin của mình trên một số nền tảng trong trường hợp nhất định C. Chỉ áp dụng cho người nổi tiếng D. Không có quyền này trong thực tế Đáp án: B — Đây là một quyền được quy định nhằm bảo vệ quyền kiểm soát thông tin cá nhân."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M2-I",
      "brief": "Thiết lập toàn bộ hệ thống giao tiếp và cộng tác cho một dự án liên bộ phận: chọn kênh giao tiếp phù hợp cho từng loại thông tin, phân loại và phân quyền tài liệu, xây bảng công việc, viết quy ước nhóm, và soạn quy tắc ứng xử.\nTiêu chí chấm:\nLựa chọn kênh giao tiếp hợp lý cho từng loại thông tin\nPhân loại và phân quyền tài liệu đúng nguyên tắc\nBảng công việc và phân công rõ ràng\nQuy ước nhóm đầy đủ, khả thi\nQuy tắc ứng xử phù hợp bối cảnh doanh nghiệp\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A2-A": {
    "code": "A2-A",
    "title": "LÃNH ĐẠO GIAO TIẾP VÀ CỘNG TÁC SỐ",
    "domainNumber": 2,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 6 module · 18 giờ · Tiên quyết: M2-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Chiến lược giao tiếp tổ chức",
        "competencyCode": "2.1",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất",
          "Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể"
        ],
        "definitions": [
          "Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử",
          "Kiến trúc kênh giao tiếp: hệ thống các kênh được xác định rõ mục đích sử dụng cho từng loại thông điệp trong tổ chức",
          "Phân tầng thông điệp: việc điều chỉnh cùng một nội dung theo cách phù hợp với từng nhóm đối tượng khác nhau"
        ],
        "body": [
          "Ở mức nâng cao, việc thích nghi công nghệ số và phương tiện giao tiếp không còn chỉ ở phạm vi cá nhân mà mở rộng ra cấp tổ chức. Cần thiết kế kiến trúc kênh giao tiếp cho cả tổ chức: xác định rõ kênh nào dùng cho loại thông điệp nào — thông báo chính thức toàn công ty, trao đổi công việc hàng ngày, phản hồi khẩn cấp.",
          "Khi truyền đạt một thay đổi lớn, trình tự thông báo cần được lên kế hoạch: thông báo cho quản lý trực tiếp trước, sau đó đến toàn thể nhân viên liên quan, tránh để nhân viên nghe tin qua kênh không chính thức trước.",
          "Cùng một thông điệp có thể cần trình bày khác nhau cho các nhóm đối tượng khác nhau. Đo lường hiệu quả giao tiếp nội bộ có thể qua tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp."
        ],
        "examples": [],
        "practice": "Xây kế hoạch truyền thông nội bộ cho một thay đổi lớn trong doanh nghiệp (đổi quy trình, sáp nhập bộ phận, hoặc triển khai hệ thống mới), gồm kênh sử dụng, trình tự thông báo, và thông điệp riêng cho từng nhóm đối tượng.",
        "deliverable": "Kế hoạch truyền thông thay đổi.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cần có trình tự thông báo rõ ràng khi truyền đạt thay đổi lớn?",
            "options": [
              "Không quan trọng, thông báo đồng thời là đủ",
              "Tránh nhân viên nghe tin qua kênh không chính thức trước, gây tin đồn",
              "Chỉ để tiết kiệm thời gian",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Trình tự hợp lý giúp kiểm soát thông tin và tránh mất lòng tin.",
            "competencyCode": "2.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao cùng một thông điệp cần trình bày khác nhau cho các nhóm đối tượng khác nhau?",
            "options": [
              "Không cần thiết, nội dung giống nhau là đủ",
              "Mỗi nhóm cần loại thông tin và mức độ chi tiết khác nhau để hiểu và hành động đúng",
              "Chỉ để tạo sự khác biệt",
              "Không có lý do thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Phân tầng thông điệp giúp mỗi nhóm nhận được thông tin phù hợp với vai trò của họ.",
            "competencyCode": "2.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Dấu hiệu quá tải giao tiếp trong tổ chức bao gồm gì?",
            "options": [
              "Không có cuộc họp nào",
              "Quá nhiều cuộc họp không cần thiết, thông báo dồn dập ngoài giờ",
              "Giao tiếp quá ít",
              "Không có dấu hiệu cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các dấu hiệu phổ biến của quá tải giao tiếp trong tổ chức.",
            "competencyCode": "2.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Đo lường hiệu quả giao tiếp nội bộ nên dựa vào điều gì?",
            "options": [
              "Chỉ cảm nhận chủ quan",
              "Tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp",
              "Số lượng email gửi đi",
              "Không cần đo lường"
            ],
            "correctIndex": 1,
            "explanation": "Dữ liệu định lượng cho phép đánh giá khách quan hơn cảm nhận chủ quan.",
            "competencyCode": "2.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Kiến trúc kênh giao tiếp trong tổ chức nhằm mục đích gì?",
            "options": [
              "Tăng số lượng kênh sử dụng",
              "Xác định rõ kênh nào dùng cho loại thông điệp nào, tránh lẫn lộn thông tin quan trọng",
              "Không có mục đích cụ thể",
              "Chỉ để trang trí hệ thống"
            ],
            "correctIndex": 1,
            "explanation": "Kiến trúc rõ ràng giúp thông tin quan trọng không bị chìm trong khối lượng lớn tin nhắn không quan trọng.",
            "competencyCode": "2.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Vì sao cần có trình tự thông báo rõ ràng khi truyền đạt thay đổi lớn? A. Không quan trọng, thông báo đồng thời là đủ B. Tránh nhân viên nghe tin qua kênh không chính thức trước, gây tin đồn C. Chỉ để tiết kiệm thời gian D. Không có lý do cụ thể Đáp án: B — Trình tự hợp lý giúp kiểm soát thông tin và tránh mất lòng tin.",
          "2. Vì sao cùng một thông điệp cần trình bày khác nhau cho các nhóm đối tượng khác nhau? A. Không cần thiết, nội dung giống nhau là đủ B. Mỗi nhóm cần loại thông tin và mức độ chi tiết khác nhau để hiểu và hành động đúng C. Chỉ để tạo sự khác biệt D. Không có lý do thực tế Đáp án: B — Phân tầng thông điệp giúp mỗi nhóm nhận được thông tin phù hợp với vai trò của họ.",
          "3. Dấu hiệu quá tải giao tiếp trong tổ chức bao gồm gì? A. Không có cuộc họp nào B. Quá nhiều cuộc họp không cần thiết, thông báo dồn dập ngoài giờ C. Giao tiếp quá ít D. Không có dấu hiệu cụ thể Đáp án: B — Đây là các dấu hiệu phổ biến của quá tải giao tiếp trong tổ chức.",
          "4. Đo lường hiệu quả giao tiếp nội bộ nên dựa vào điều gì? A. Chỉ cảm nhận chủ quan B. Tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp C. Số lượng email gửi đi D. Không cần đo lường Đáp án: B — Dữ liệu định lượng cho phép đánh giá khách quan hơn cảm nhận chủ quan.",
          "5. Kiến trúc kênh giao tiếp trong tổ chức nhằm mục đích gì? A. Tăng số lượng kênh sử dụng B. Xác định rõ kênh nào dùng cho loại thông điệp nào, tránh lẫn lộn thông tin quan trọng C. Không có mục đích cụ thể D. Chỉ để trang trí hệ thống Đáp án: B — Kiến trúc rõ ràng giúp thông tin quan trọng không bị chìm trong khối lượng lớn tin nhắn không quan trọng."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Quản trị luồng chia sẻ thông tin",
        "competencyCode": "2.2",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung",
          "Thích ứng được vai trò trung gian của mình",
          "Thay đổi được cách sử dụng các phương pháp tham chiếu và ghi chú phù hợp hơn"
        ],
        "definitions": [],
        "body": [
          "Phân quyền theo vai trò (role-based access): cấp quyền truy cập dựa trên chức năng công việc của một vai trò, thay vì cấp riêng lẻ cho từng cá nhân",
          "Phân tách nhiệm vụ: nguyên tắc không để một người kiểm soát toàn bộ một quy trình nhạy cảm từ đầu đến cuối",
          "Ở mức nâng cao, việc chia sẻ thông tin và nội dung số đòi hỏi đánh giá công nghệ số phù hợp nhất và thích ứng vai trò trung gian của mình trong bối cảnh phức tạp — tức là xây dựng chính sách chia sẻ thông tin cấp tổ chức, không còn là quyết định cá nhân từng lần.",
          "Chính sách này cần nêu rõ nguyên tắc chung, phạm vi áp dụng, và ngoại lệ được phép. Nên phân quyền theo vai trò (ai giữ vai trò nào sẽ có quyền tương ứng) thay vì cấp quyền riêng lẻ cho từng người, kèm nguyên tắc quyền tối thiểu và phân tách nhiệm vụ cho quy trình có rủi ro cao.",
          "Quy trình ứng phó sự cố lộ dữ liệu cần được viết sẵn theo năm bước: khoanh vùng, đánh giá, thông báo, khắc phục, rà soát."
        ],
        "examples": [],
        "practice": "Xây mô hình phân quyền theo vai trò cho doanh nghiệp (tối thiểu bốn vai trò × năm nhóm dữ liệu), một sổ rủi ro sáu mục, và một quy trình ứng phó sự cố.",
        "deliverable": "Ma trận phân quyền, sổ rủi ro, quy trình ứng phó.",
        "questions": [
          {
            "number": 1,
            "questionText": "Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân?",
            "options": [
              "Không có ưu điểm gì",
              "Dễ quản lý hơn, không phụ thuộc vào việc nhớ cấp quyền cho từng người",
              "Chậm hơn",
              "Tốn nhiều tài nguyên hơn"
            ],
            "correctIndex": 1,
            "explanation": "Phân quyền theo vai trò tự động và nhất quán hơn khi số lượng nhân sự tăng.",
            "competencyCode": "2.2",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Phân tách nhiệm vụ nhằm mục đích gì?",
            "options": [
              "Tăng khối lượng công việc",
              "Đảm bảo không ai một mình kiểm soát toàn bộ quy trình nhạy cảm",
              "Giảm số người tham gia công việc",
              "Không có mục đích cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là biện pháp kiểm soát rủi ro trong các quy trình nhạy cảm.",
            "competencyCode": "2.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì?",
            "options": [
              "Thông báo ngay cho cơ quan quản lý",
              "Khoanh vùng để ngăn chặn lan rộng",
              "Tìm người chịu trách nhiệm",
              "Viết báo cáo chi tiết"
            ],
            "correctIndex": 1,
            "explanation": "Khoanh vùng ngay lập tức giúp hạn chế phạm vi thiệt hại trước khi thực hiện các bước tiếp theo.",
            "competencyCode": "2.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Khi chia sẻ thông tin với bên thứ ba, cần có gì?",
            "options": [
              "Không cần ràng buộc gì đặc biệt",
              "Ràng buộc hợp đồng rõ ràng về cách sử dụng và bảo vệ thông tin",
              "Chỉ cần thỏa thuận miệng",
              "Chỉ cần gửi email xác nhận"
            ],
            "correctIndex": 1,
            "explanation": "Ràng buộc hợp đồng bảo vệ tổ chức khi thông tin được chia sẻ ra bên ngoài.",
            "competencyCode": "2.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Sổ rủi ro thông tin nên bao gồm những gì?",
            "options": [
              "Chỉ cần liệt kê tên rủi ro",
              "Rủi ro, khả năng xảy ra, mức tác động, biện pháp giảm thiểu, người chịu trách nhiệm",
              "Chỉ cần ngày phát hiện",
              "Không cần lập sổ rủi ro"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các thành phần cần thiết để sổ rủi ro thực sự hữu ích cho quản lý.",
            "competencyCode": "2.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân? A. Không có ưu điểm gì B. Dễ quản lý hơn, không phụ thuộc vào việc nhớ cấp quyền cho từng người C. Chậm hơn D. Tốn nhiều tài nguyên hơn Đáp án: B — Phân quyền theo vai trò tự động và nhất quán hơn khi số lượng nhân sự tăng.",
          "2. Phân tách nhiệm vụ nhằm mục đích gì? A. Tăng khối lượng công việc B. Đảm bảo không ai một mình kiểm soát toàn bộ quy trình nhạy cảm C. Giảm số người tham gia công việc D. Không có mục đích cụ thể Đáp án: B — Đây là biện pháp kiểm soát rủi ro trong các quy trình nhạy cảm.",
          "3. Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì? A. Thông báo ngay cho cơ quan quản lý B. Khoanh vùng để ngăn chặn lan rộng C. Tìm người chịu trách nhiệm D. Viết báo cáo chi tiết Đáp án: B — Khoanh vùng ngay lập tức giúp hạn chế phạm vi thiệt hại trước khi thực hiện các bước tiếp theo.",
          "4. Khi chia sẻ thông tin với bên thứ ba, cần có gì? A. Không cần ràng buộc gì đặc biệt B. Ràng buộc hợp đồng rõ ràng về cách sử dụng và bảo vệ thông tin C. Chỉ cần thỏa thuận miệng D. Chỉ cần gửi email xác nhận Đáp án: B — Ràng buộc hợp đồng bảo vệ tổ chức khi thông tin được chia sẻ ra bên ngoài.",
          "5. Sổ rủi ro thông tin nên bao gồm những gì? A. Chỉ cần liệt kê tên rủi ro B. Rủi ro, khả năng xảy ra, mức tác động, biện pháp giảm thiểu, người chịu trách nhiệm C. Chỉ cần ngày phát hiện D. Không cần lập sổ rủi ro Đáp án: B — Đây là các thành phần cần thiết để sổ rủi ro thực sự hữu ích cho quản lý."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Doanh nghiệp trong môi trường số công cộng",
        "competencyCode": "2.3",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội",
          "Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân"
        ],
        "definitions": [
          "Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Nghĩa vụ tuân thủ số: các yêu cầu pháp lý liên quan đến hoạt động số mà doanh nghiệp phải thực hiện (khai báo, báo cáo, lưu trữ)",
          "Đánh giá tác động quy định: quá trình phân tích một quy định mới sẽ ảnh hưởng thế nào đến hoạt động và quy trình hiện tại của doanh nghiệp"
        ],
        "body": [
          "Ở mức nâng cao, việc tham gia xã hội qua công nghệ số mở rộng thành trách nhiệm của cả doanh nghiệp trong môi trường số công cộng — cần lập bản đồ nghĩa vụ số của doanh nghiệp theo lĩnh vực hoạt động và theo dõi thay đổi quy định từ nguồn cập nhật chính thức.",
          "Xây dựng quy trình chuẩn cho giao dịch với cơ quan quản lý giúp đảm bảo tính nhất quán: ai chịu trách nhiệm chuẩn bị hồ sơ, ai phê duyệt trước khi nộp, lưu trữ hồ sơ ở đâu để phục vụ thanh kiểm tra.",
          "Khi có quy định mới, cần đánh giá tác động: quy trình nào cần thay đổi, hệ thống nào cần cập nhật, nhân sự nào cần được đào tạo lại."
        ],
        "examples": [],
        "practice": "Lập bản đồ nghĩa vụ số của doanh nghiệp, xác định ba rủi ro tuân thủ lớn nhất và đề xuất biện pháp.",
        "deliverable": "Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cần lập bản đồ đầy đủ các nghĩa vụ tuân thủ số?",
            "options": [
              "Không cần thiết",
              "Giúp tránh bỏ sót nghĩa vụ nào đó theo lĩnh vực hoạt động",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Bản đồ đầy đủ giúp đảm bảo doanh nghiệp không bỏ sót nghĩa vụ pháp lý nào.",
            "competencyCode": "2.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Nguồn cập nhật quy định nên dựa vào đâu?",
            "options": [
              "Tin đồn trên mạng xã hội",
              "Cổng thông tin chính thức của cơ quan quản lý",
              "Ý kiến cá nhân của đồng nghiệp",
              "Không cần cập nhật thường xuyên"
            ],
            "correctIndex": 1,
            "explanation": "Nguồn chính thức đảm bảo thông tin chính xác và kịp thời.",
            "competencyCode": "2.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi có quy định mới, bước quan trọng cần làm là gì?",
            "options": [
              "Bỏ qua cho đến khi bị kiểm tra",
              "Đánh giá tác động lên quy trình, hệ thống và đào tạo nhân sự",
              "Chỉ thông báo bằng miệng cho nhân viên",
              "Đợi cơ quan quản lý nhắc nhở"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá tác động sớm giúp doanh nghiệp tuân thủ kịp thời và tránh sai sót.",
            "competencyCode": "2.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý?",
            "options": [
              "Không cần thiết nếu doanh nghiệp nhỏ",
              "Đảm bảo tính nhất quán, giảm rủi ro sai sót",
              "Chỉ để tạo thủ tục rườm rà",
              "Không có lợi ích cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Quy trình chuẩn giúp đảm bảo mọi giao dịch được xử lý đúng cách và nhất quán.",
            "competencyCode": "2.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Lưu trữ hồ sơ điện tử phục vụ mục đích gì?",
            "options": [
              "Chỉ để tiết kiệm giấy",
              "Phục vụ tra cứu và chứng minh tuân thủ khi có thanh kiểm tra",
              "Không có mục đích cụ thể",
              "Chỉ cần lưu trong một tháng"
            ],
            "correctIndex": 1,
            "explanation": "Hồ sơ lưu trữ đầy đủ là bằng chứng quan trọng khi có yêu cầu thanh kiểm tra.",
            "competencyCode": "2.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Vì sao cần lập bản đồ đầy đủ các nghĩa vụ tuân thủ số? A. Không cần thiết B. Giúp tránh bỏ sót nghĩa vụ nào đó theo lĩnh vực hoạt động C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Bản đồ đầy đủ giúp đảm bảo doanh nghiệp không bỏ sót nghĩa vụ pháp lý nào.",
          "2. Nguồn cập nhật quy định nên dựa vào đâu? A. Tin đồn trên mạng xã hội B. Cổng thông tin chính thức của cơ quan quản lý C. Ý kiến cá nhân của đồng nghiệp D. Không cần cập nhật thường xuyên Đáp án: B — Nguồn chính thức đảm bảo thông tin chính xác và kịp thời.",
          "3. Khi có quy định mới, bước quan trọng cần làm là gì? A. Bỏ qua cho đến khi bị kiểm tra B. Đánh giá tác động lên quy trình, hệ thống và đào tạo nhân sự C. Chỉ thông báo bằng miệng cho nhân viên D. Đợi cơ quan quản lý nhắc nhở Đáp án: B — Đánh giá tác động sớm giúp doanh nghiệp tuân thủ kịp thời và tránh sai sót.",
          "4. Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý? A. Không cần thiết nếu doanh nghiệp nhỏ B. Đảm bảo tính nhất quán, giảm rủi ro sai sót C. Chỉ để tạo thủ tục rườm rà D. Không có lợi ích cụ thể Đáp án: B — Quy trình chuẩn giúp đảm bảo mọi giao dịch được xử lý đúng cách và nhất quán.",
          "5. Lưu trữ hồ sơ điện tử phục vụ mục đích gì? A. Chỉ để tiết kiệm giấy B. Phục vụ tra cứu và chứng minh tuân thủ khi có thanh kiểm tra C. Không có mục đích cụ thể D. Chỉ cần lưu trong một tháng Đáp án: B — Hồ sơ lưu trữ đầy đủ là bằng chứng quan trọng khi có yêu cầu thanh kiểm tra."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Dẫn dắt cộng tác nhóm phân tán",
        "competencyCode": "2.4",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác",
          "Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức"
        ],
        "definitions": [
          "Nhóm phân tán: nhóm làm việc mà các thành viên không cùng một địa điểm, có thể khác múi giờ",
          "Điểm bàn giao (handoff point): thời điểm công việc chuyển từ người/bộ phận này sang người/bộ phận khác trong một quy trình"
        ],
        "body": [
          "Ở mức nâng cao, việc hợp tác qua công nghệ số cần chọn công cụ thích hợp nhất để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức ở quy mô nhóm phân tán và liên bộ phận.",
          "Mô hình làm việc cho nhóm phân tán cần cân bằng giữa đồng bộ (họp trực tiếp định kỳ) và bất đồng bộ (phần lớn công việc hàng ngày). Khi thiết kế quy trình liên bộ phận, cần xác định rõ các điểm bàn giao — nơi công việc chuyển từ bộ phận này sang bộ phận khác thường là nơi thông tin dễ bị thất lạc nhất.",
          "Xung đột trong nhóm làm việc từ xa thường xuất phát từ hiểu lầm qua văn bản nhiều hơn là bất đồng thực chất — khi phát hiện dấu hiệu căng thẳng qua chat, nên chủ động chuyển sang gọi video để làm rõ, vì kênh giao tiếp phong phú hơn (thấy được nét mặt, giọng điệu) giúp giảm hiểu lầm nhanh hơn tiếp tục trao đổi qua văn bản.",
          "Xây dựng văn hóa nhóm khi làm việc từ xa đòi hỏi nỗ lực có chủ đích hơn so với làm việc tại văn phòng — vì thiếu sự kết nối tự nhiên như gặp mặt trực tiếp, cần chủ động tạo ra qua các hoạt động kết nối định kỳ. Hiệu quả cộng tác liên bộ phận có thể đo lường qua thời gian hoàn thành các điểm bàn giao và tỷ lệ công việc phải làm lại do hiểu sai — hai chỉ số này phản ánh trực tiếp chất lượng phối hợp giữa các bộ phận."
        ],
        "examples": [],
        "practice": "Thiết kế lại một quy trình liên bộ phận đang có vấn đề, chỉ ra điểm mất thông tin và đề xuất cơ chế khắc phục.",
        "deliverable": "Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn.",
        "questions": [
          {
            "number": 1,
            "questionText": "Điểm bàn giao trong quy trình liên bộ phận thường là nơi gì?",
            "options": [
              "Nơi công việc luôn suôn sẻ",
              "Nơi thông tin dễ bị thất lạc hoặc hiểu sai nhất",
              "Không có ý nghĩa đặc biệt",
              "Chỉ liên quan đến IT"
            ],
            "correctIndex": 1,
            "explanation": "Điểm chuyển giao giữa các bộ phận là nơi dễ xảy ra sai sót thông tin nhất.",
            "competencyCode": "2.4",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Xung đột trong nhóm làm việc từ xa thường xuất phát từ đâu?",
            "options": [
              "Luôn từ bất đồng thực chất về công việc",
              "Thường từ hiểu lầm qua văn bản do thiếu ngữ điệu, cử chỉ",
              "Không có nguyên nhân cụ thể",
              "Chỉ do lỗi kỹ thuật"
            ],
            "correctIndex": 1,
            "explanation": "Giao tiếp qua văn bản dễ dẫn đến hiểu lầm hơn giao tiếp trực tiếp.",
            "competencyCode": "2.4",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi phát hiện căng thẳng qua chat, nên làm gì?",
            "options": [
              "Tiếp tục trao đổi qua chat để có bằng chứng",
              "Chủ động chuyển sang gọi video để làm rõ",
              "Phớt lờ và chờ tự hết",
              "Báo cáo ngay cho cấp trên"
            ],
            "correctIndex": 1,
            "explanation": "Chuyển kênh giao tiếp phong phú hơn giúp làm rõ và giảm hiểu lầm.",
            "competencyCode": "2.4",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao cần nỗ lực có chủ đích để xây dựng văn hóa nhóm khi làm việc từ xa?",
            "options": [
              "Không cần thiết vì tự nhiên sẽ hình thành",
              "Vì thiếu tương tác trực tiếp nên cần các hoạt động kết nối chủ động",
              "Chỉ cần cho nhóm lớn",
              "Không có lợi ích rõ ràng"
            ],
            "correctIndex": 1,
            "explanation": "Kết nối tự nhiên như gặp mặt trực tiếp không có sẵn, cần chủ động tạo ra.",
            "competencyCode": "2.4",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Chỉ số nào có thể dùng để đo lường hiệu quả cộng tác liên bộ phận?",
            "options": [
              "Số lượng email gửi đi",
              "Thời gian hoàn thành các điểm bàn giao, tỷ lệ làm lại do hiểu sai",
              "Số cuộc họp tổ chức",
              "Không thể đo lường được"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các chỉ số phản ánh trực tiếp chất lượng cộng tác giữa các bộ phận.",
            "competencyCode": "2.4",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Điểm bàn giao trong quy trình liên bộ phận thường là nơi gì? A. Nơi công việc luôn suôn sẻ B. Nơi thông tin dễ bị thất lạc hoặc hiểu sai nhất C. Không có ý nghĩa đặc biệt D. Chỉ liên quan đến IT Đáp án: B — Điểm chuyển giao giữa các bộ phận là nơi dễ xảy ra sai sót thông tin nhất.",
          "2. Xung đột trong nhóm làm việc từ xa thường xuất phát từ đâu? A. Luôn từ bất đồng thực chất về công việc B. Thường từ hiểu lầm qua văn bản do thiếu ngữ điệu, cử chỉ C. Không có nguyên nhân cụ thể D. Chỉ do lỗi kỹ thuật Đáp án: B — Giao tiếp qua văn bản dễ dẫn đến hiểu lầm hơn giao tiếp trực tiếp.",
          "3. Khi phát hiện căng thẳng qua chat, nên làm gì? A. Tiếp tục trao đổi qua chat để có bằng chứng B. Chủ động chuyển sang gọi video để làm rõ C. Phớt lờ và chờ tự hết D. Báo cáo ngay cho cấp trên Đáp án: B — Chuyển kênh giao tiếp phong phú hơn giúp làm rõ và giảm hiểu lầm.",
          "4. Vì sao cần nỗ lực có chủ đích để xây dựng văn hóa nhóm khi làm việc từ xa? A. Không cần thiết vì tự nhiên sẽ hình thành B. Vì thiếu tương tác trực tiếp nên cần các hoạt động kết nối chủ động C. Chỉ cần cho nhóm lớn D. Không có lợi ích rõ ràng Đáp án: B — Kết nối tự nhiên như gặp mặt trực tiếp không có sẵn, cần chủ động tạo ra.",
          "5. Chỉ số nào có thể dùng để đo lường hiệu quả cộng tác liên bộ phận? A. Số lượng email gửi đi B. Thời gian hoàn thành các điểm bàn giao, tỷ lệ làm lại do hiểu sai C. Số cuộc họp tổ chức D. Không thể đo lường được Đáp án: B — Đây là các chỉ số phản ánh trực tiếp chất lượng cộng tác giữa các bộ phận."
        ]
      },
      {
        "moduleIndex": 5,
        "title": "Văn hóa ứng xử số và xử lý khủng hoảng",
        "competencyCode": "2.5",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số",
          "Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số",
          "Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau trong môi trường số"
        ],
        "definitions": [
          "Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến",
          "Khủng hoảng truyền thông: tình huống một sự việc lan truyền nhanh và rộng, gây ảnh hưởng tiêu cực đến uy tín tổ chức",
          "Ngưỡng leo thang: mức độ nghiêm trọng mà tại đó một vấn đề cần được chuyển lên cấp quản lý cao hơn xử lý"
        ],
        "body": [
          "Ở mức nâng cao, nghi thức số cần được điều chỉnh phù hợp nhất trong bối cảnh phức tạp — tức là trở thành văn hóa thực hành của cả tổ chức, không chỉ nằm trên văn bản, đòi hỏi sự nhất quán giữa lời nói và hành động của cấp quản lý.",
          "Khi xử lý khủng hoảng truyền thông, 24 giờ đầu tiên là quan trọng nhất: xác nhận sự việc, tránh phản ứng vội vàng, chuẩn bị thông điệp nhất quán. Nguyên tắc phản hồi là thừa nhận vấn đề nếu có, tránh đổ lỗi hoặc bao biện, và tuyệt đối không im lặng hoàn toàn hoặc xóa bằng chứng.",
          "Cơ chế khiếu nại nội bộ cần đảm bảo người khiếu nại được bảo vệ khỏi trả đũa, có kênh báo cáo độc lập với người bị khiếu nại.",
          "Ở mức lãnh đạo, việc áp dụng khía cạnh đa dạng văn hóa và thế hệ không còn dừng ở việc “lưu ý” như mức cơ bản, mà cần chủ động điều chỉnh chính sách ứng xử cho phù hợp với đội ngũ đa dạng — ví dụ khi soạn quy tắc ứng xử số cho một công ty có cả nhân viên Việt Nam và chuyên gia nước ngoài, cần cân nhắc để quy tắc không áp đặt một chuẩn mực văn hóa duy nhất lên mọi người, đồng thời vẫn đảm bảo tính nhất quán. Khi xử lý khủng hoảng truyền thông với đối tượng công chúng đa dạng, thông điệp cũng cần được điều chỉnh cách truyền tải (không phải nội dung cốt lõi) cho phù hợp với từng nhóm văn hóa, thế hệ tiếp nhận."
        ],
        "examples": [],
        "practice": "Diễn tập xử lý một khủng hoảng truyền thông: xây kịch bản phản ứng 24 giờ đầu, phân vai xử lý, soạn thông điệp cho từng nhóm đối tượng.",
        "deliverable": "Kịch bản ứng phó khủng hoảng và bộ thông điệp.",
        "questions": [
          {
            "number": 1,
            "questionText": "Trong 24 giờ đầu của khủng hoảng truyền thông, điều quan trọng nhất là gì?",
            "options": [
              "Phản ứng vội vàng để có mặt sớm nhất",
              "Xác nhận sự việc, chuẩn bị thông điệp nhất quán, tránh phản ứng thiếu thông tin",
              "Im lặng hoàn toàn",
              "Xóa mọi bằng chứng liên quan"
            ],
            "correctIndex": 1,
            "explanation": "Phản ứng có kiểm soát dựa trên thông tin xác thực quan trọng hơn tốc độ.",
            "competencyCode": "2.5",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Điều gì KHÔNG nên làm khi xử lý khủng hoảng truyền thông?",
            "options": [
              "Thừa nhận vấn đề nếu có",
              "Im lặng hoàn toàn hoặc xóa bằng chứng",
              "Chuẩn bị thông điệp nhất quán",
              "Xác nhận sự việc trước khi phản hồi"
            ],
            "correctIndex": 1,
            "explanation": "Im lặng hoặc xóa bằng chứng thường làm tình hình xấu hơn khi bị phát hiện.",
            "competencyCode": "2.5",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Ngưỡng leo thang trong xử lý khủng hoảng dùng để làm gì?",
            "options": [
              "Xác định khi nào cần chuyển vấn đề lên cấp quản lý cao hơn",
              "Không có tác dụng thực tế",
              "Chỉ áp dụng cho vấn đề nhỏ",
              "Để trì hoãn xử lý"
            ],
            "correctIndex": 0,
            "explanation": "Phân loại mức độ nghiêm trọng giúp xác định cấp độ xử lý phù hợp.",
            "competencyCode": "2.5",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Cơ chế khiếu nại nội bộ cần đảm bảo điều gì?",
            "options": [
              "Người khiếu nại được bảo vệ khỏi trả đũa",
              "Chỉ quản lý mới được khiếu nại",
              "Không cần kênh độc lập",
              "Khiếu nại phải công khai danh tính ngay từ đầu"
            ],
            "correctIndex": 0,
            "explanation": "Bảo vệ người khiếu nại là yếu tố then chốt để cơ chế hoạt động hiệu quả.",
            "competencyCode": "2.5",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Khi soạn quy tắc ứng xử số cho đội ngũ đa văn hóa, cần lưu ý điều gì?",
            "options": [
              "Áp đặt một chuẩn mực văn hóa duy nhất cho tất cả",
              "Điều chỉnh phù hợp với sự đa dạng nhưng vẫn đảm bảo tính nhất quán chung",
              "Không cần quy tắc chung, mỗi người tự do",
              "Chỉ áp dụng quy tắc cho nhân viên nước ngoài"
            ],
            "correctIndex": 1,
            "explanation": "Cần cân bằng giữa tôn trọng đa dạng văn hóa/thế hệ và duy trì tính nhất quán của tổ chức.",
            "competencyCode": "2.5",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Trong 24 giờ đầu của khủng hoảng truyền thông, điều quan trọng nhất là gì? A. Phản ứng vội vàng để có mặt sớm nhất B. Xác nhận sự việc, chuẩn bị thông điệp nhất quán, tránh phản ứng thiếu thông tin C. Im lặng hoàn toàn D. Xóa mọi bằng chứng liên quan Đáp án: B — Phản ứng có kiểm soát dựa trên thông tin xác thực quan trọng hơn tốc độ.",
          "2. Điều gì KHÔNG nên làm khi xử lý khủng hoảng truyền thông? A. Thừa nhận vấn đề nếu có B. Im lặng hoàn toàn hoặc xóa bằng chứng C. Chuẩn bị thông điệp nhất quán D. Xác nhận sự việc trước khi phản hồi Đáp án: B — Im lặng hoặc xóa bằng chứng thường làm tình hình xấu hơn khi bị phát hiện.",
          "3. Ngưỡng leo thang trong xử lý khủng hoảng dùng để làm gì? A. Xác định khi nào cần chuyển vấn đề lên cấp quản lý cao hơn B. Không có tác dụng thực tế C. Chỉ áp dụng cho vấn đề nhỏ D. Để trì hoãn xử lý Đáp án: A — Phân loại mức độ nghiêm trọng giúp xác định cấp độ xử lý phù hợp.",
          "4. Cơ chế khiếu nại nội bộ cần đảm bảo điều gì? A. Người khiếu nại được bảo vệ khỏi trả đũa B. Chỉ quản lý mới được khiếu nại C. Không cần kênh độc lập D. Khiếu nại phải công khai danh tính ngay từ đầu Đáp án: A — Bảo vệ người khiếu nại là yếu tố then chốt để cơ chế hoạt động hiệu quả.",
          "5. Khi soạn quy tắc ứng xử số cho đội ngũ đa văn hóa, cần lưu ý điều gì? A. Áp đặt một chuẩn mực văn hóa duy nhất cho tất cả B. Điều chỉnh phù hợp với sự đa dạng nhưng vẫn đảm bảo tính nhất quán chung C. Không cần quy tắc chung, mỗi người tự do D. Chỉ áp dụng quy tắc cho nhân viên nước ngoài Đáp án: B — Cần cân bằng giữa tôn trọng đa dạng văn hóa/thế hệ và duy trì tính nhất quán của tổ chức."
        ]
      },
      {
        "moduleIndex": 6,
        "title": "Danh tính số của tổ chức",
        "competencyCode": "2.6",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Phân biệt được nhiều danh tính số",
          "Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân",
          "Thay đổi được dữ liệu được tạo ra thông qua một số công cụ, môi trường và dịch vụ"
        ],
        "definitions": [
          "Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác",
          "Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến",
          "Hiện diện số của doanh nghiệp: tổng thể các kênh và nội dung mà doanh nghiệp xuất hiện trên môi trường số (website, mạng xã hội, đánh giá trực tuyến)",
          "Uy tín số (digital reputation): nhận thức và đánh giá chung của công chúng về doanh nghiệp trên môi trường số"
        ],
        "body": [
          "Ở mức nâng cao, việc quản lý danh tính số mở rộng thành quản lý danh tính số của cả tổ chức — kiểm kê hiện diện số của doanh nghiệp là bước đầu để quản lý: liệt kê toàn bộ kênh chính thức, xác định kênh nào đang hoạt động, kênh nào bị bỏ hoang.",
          "Chính sách phát ngôn cho nhân viên nên xác định rõ ai được phép phát ngôn chính thức thay mặt công ty, ở kênh nào, về chủ đề gì. Mạo danh doanh nghiệp là rủi ro cần được giám sát chủ động — khi phát hiện, cần có quy trình báo cáo tới nền tảng liên quan.",
          "Sự nhất quán về thông tin liên hệ (số điện thoại, địa chỉ, email chính thức) giữa các kênh là một phần quan trọng của hiện diện số đáng tin cậy — khi thông tin liên hệ khác nhau giữa website, mạng xã hội, và các nền tảng khác, khách hàng dễ nghi ngờ đâu là kênh chính thức thật sự, tạo cơ hội cho các kênh mạo danh trà trộn.",
          "Theo dõi danh tiếng trực tuyến có thể qua việc giám sát các đề cập đến thương hiệu trên mạng và phân tích cảm xúc của các đánh giá."
        ],
        "examples": [],
        "practice": "Kiểm kê toàn bộ hiện diện số của doanh nghiệp, phát hiện điểm không nhất quán hoặc rủi ro, và soạn chính sách phát ngôn cho nhân viên.",
        "deliverable": "Báo cáo kiểm kê hiện diện số và chính sách phát ngôn.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ?",
            "options": [
              "Không cần thiết",
              "Phát hiện kênh bị bỏ hoang có thể là điểm yếu bị lợi dụng",
              "Chỉ để trang trí báo cáo",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Kênh bị bỏ hoang hoặc quên quản lý là rủi ro tiềm ẩn cho danh tính thương hiệu.",
            "competencyCode": "2.6",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Chính sách phát ngôn cho nhân viên nhằm mục đích gì?",
            "options": [
              "Cấm nhân viên nói về công ty",
              "Xác định rõ ai được phát ngôn chính thức, tránh thông tin mâu thuẫn",
              "Không có mục đích cụ thể",
              "Chỉ áp dụng cho quản lý cấp cao"
            ],
            "correctIndex": 1,
            "explanation": "Chính sách rõ ràng giúp tránh tình trạng thông tin không chính xác lan truyền.",
            "competencyCode": "2.6",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi phát hiện tài khoản mạo danh doanh nghiệp, nên làm gì?",
            "options": [
              "Không cần làm gì",
              "Báo cáo tới nền tảng liên quan và thông báo khách hàng nếu cần",
              "Chờ khách hàng tự phát hiện",
              "Chỉ theo dõi mà không hành động"
            ],
            "correctIndex": 1,
            "explanation": "Xử lý chủ động giúp giảm thiểu thiệt hại từ hành vi mạo danh.",
            "competencyCode": "2.6",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Sự thiếu nhất quán thông tin liên hệ giữa các kênh gây ra vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Có thể khiến khách hàng nghi ngờ tính xác thực",
              "Chỉ ảnh hưởng đến thẩm mỹ",
              "Không liên quan đến uy tín"
            ],
            "correctIndex": 1,
            "explanation": "Thiếu nhất quán làm giảm độ tin cậy trong mắt khách hàng.",
            "competencyCode": "2.6",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Theo dõi uy tín số bao gồm hoạt động nào?",
            "options": [
              "Chỉ đếm số lượt theo dõi",
              "Giám sát đề cập thương hiệu, phân tích cảm xúc đánh giá, có kế hoạch phản ứng",
              "Không cần theo dõi gì",
              "Chỉ quan tâm khi có khủng hoảng xảy ra"
            ],
            "correctIndex": 1,
            "explanation": "Theo dõi chủ động giúp phát hiện sớm vấn đề trước khi trở thành khủng hoảng lớn.",
            "competencyCode": "2.6",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ? A. Không cần thiết B. Phát hiện kênh bị bỏ hoang có thể là điểm yếu bị lợi dụng C. Chỉ để trang trí báo cáo D. Không có tác dụng thực tế Đáp án: B — Kênh bị bỏ hoang hoặc quên quản lý là rủi ro tiềm ẩn cho danh tính thương hiệu.",
          "2. Chính sách phát ngôn cho nhân viên nhằm mục đích gì? A. Cấm nhân viên nói về công ty B. Xác định rõ ai được phát ngôn chính thức, tránh thông tin mâu thuẫn C. Không có mục đích cụ thể D. Chỉ áp dụng cho quản lý cấp cao Đáp án: B — Chính sách rõ ràng giúp tránh tình trạng thông tin không chính xác lan truyền.",
          "3. Khi phát hiện tài khoản mạo danh doanh nghiệp, nên làm gì? A. Không cần làm gì B. Báo cáo tới nền tảng liên quan và thông báo khách hàng nếu cần C. Chờ khách hàng tự phát hiện D. Chỉ theo dõi mà không hành động Đáp án: B — Xử lý chủ động giúp giảm thiểu thiệt hại từ hành vi mạo danh.",
          "4. Sự thiếu nhất quán thông tin liên hệ giữa các kênh gây ra vấn đề gì? A. Không có vấn đề gì B. Có thể khiến khách hàng nghi ngờ tính xác thực C. Chỉ ảnh hưởng đến thẩm mỹ D. Không liên quan đến uy tín Đáp án: B — Thiếu nhất quán làm giảm độ tin cậy trong mắt khách hàng.",
          "5. Theo dõi uy tín số bao gồm hoạt động nào? A. Chỉ đếm số lượt theo dõi B. Giám sát đề cập thương hiệu, phân tích cảm xúc đánh giá, có kế hoạch phản ứng C. Không cần theo dõi gì D. Chỉ quan tâm khi có khủng hoảng xảy ra Đáp án: B — Theo dõi chủ động giúp phát hiện sớm vấn đề trước khi trở thành khủng hoảng lớn."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M2-A",
      "brief": "Xây dựng bộ khung giao tiếp và cộng tác số hoàn chỉnh cho doanh nghiệp: kiến trúc kênh giao tiếp, chính sách chia sẻ và phân quyền, quy trình liên bộ phận, quy tắc ứng xử, kịch bản khủng hoảng, và chính sách phát ngôn.\nTiêu chí chấm:\nKiến trúc kênh giao tiếp tổ chức\nChính sách chia sẻ và mô hình phân quyền\nQuy trình liên bộ phận và điểm bàn giao\nQuy tắc ứng xử và kịch bản khủng hoảng\nChính sách phát ngôn và quản lý danh tính tổ chức\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A3-F": {
    "code": "A3-F",
    "title": "TẠO LẬP NỘI DUNG SỐ CƠ BẢN",
    "domainNumber": 3,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 4 module · 8 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Tạo tài liệu công việc cơ bản",
        "competencyCode": "3.1",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản",
          "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản"
        ],
        "definitions": [],
        "body": [
          "Định dạng văn bản: cách trình bày chữ (tiêu đề, đoạn, danh sách, in đậm) giúp người đọc dễ theo dõi nội dung",
          "Ô, hàng, cột: đơn vị cơ bản trong bảng tính — ô là giao điểm của một hàng và một cột",
          "Phát triển nội dung số nghĩa là tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau. Định dạng văn bản cơ bản gồm tiêu đề, đoạn, danh sách, in đậm. Bảng tính tổ chức dữ liệu theo ô, hàng và cột. Trình chiếu nên tuân theo nguyên tắc đơn giản: mỗi slide truyền tải một ý chính.",
          "Khi chọn định dạng, cần dựa vào mục đích sử dụng: báo cáo chi tiết dùng văn bản, số liệu cần tính toán dùng bảng tính, thuyết trình dùng trình chiếu. Khi cần gửi tài liệu để người khác không chỉnh sửa được, nên xuất ra định dạng PDF — đây chính là ví dụ cụ thể của khái niệm nội dung số: nội dung tồn tại dưới dạng dữ liệu được mã hóa, có thể tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính."
        ],
        "examples": [],
        "practice": "Tạo ba tài liệu cho cùng một nội dung công việc: một văn bản, một bảng tính, một trình chiếu — và giải thích khi nào dùng loại nào.",
        "deliverable": "3 tệp kèm giải thích lựa chọn định dạng.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khi cần trình bày số liệu để tính toán, nên dùng định dạng nào?",
            "options": [
              "Văn bản",
              "Bảng tính",
              "Trình chiếu",
              "Hình ảnh"
            ],
            "correctIndex": 1,
            "explanation": "Bảng tính hỗ trợ tính toán và tổ chức dữ liệu theo ô, hàng, cột.",
            "competencyCode": "3.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Một slide trình chiếu hiệu quả nên có đặc điểm gì?",
            "options": [
              "Càng nhiều chữ càng tốt",
              "Mỗi slide truyền tải một ý chính, chữ đủ lớn",
              "Dùng nhiều màu sắc sặc sỡ",
              "Không cần hình ảnh minh họa"
            ],
            "correctIndex": 1,
            "explanation": "Slide đơn giản, tập trung một ý chính giúp người xem dễ tiếp thu.",
            "competencyCode": "3.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Vì sao nên xuất tài liệu ra PDF trước khi gửi cho người khác?",
            "options": [
              "Để giảm dung lượng",
              "Để người nhận không chỉnh sửa được nội dung",
              "Để tăng tốc độ tải",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "PDF cố định định dạng, tránh nội dung bị chỉnh sửa ngoài ý muốn.",
            "competencyCode": "3.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Trong bảng tính, mỗi hàng thường đại diện cho điều gì?",
            "options": [
              "Một thuộc tính",
              "Một bản ghi (ví dụ một khách hàng)",
              "Một công thức",
              "Không có ý nghĩa cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Hàng thường thể hiện một bản ghi, cột thể hiện thuộc tính.",
            "competencyCode": "3.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "In đậm trong văn bản nên dùng khi nào?",
            "options": [
              "Cho toàn bộ đoạn văn",
              "Để nhấn mạnh từ khóa quan trọng, không lạm dụng",
              "Không bao giờ nên dùng",
              "Chỉ dùng cho tiêu đề"
            ],
            "correctIndex": 1,
            "explanation": "In đậm hiệu quả nhất khi dùng có chọn lọc để nhấn mạnh.",
            "competencyCode": "3.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Khi cần trình bày số liệu để tính toán, nên dùng định dạng nào? A. Văn bản B. Bảng tính C. Trình chiếu D. Hình ảnh Đáp án: B — Bảng tính hỗ trợ tính toán và tổ chức dữ liệu theo ô, hàng, cột.",
          "2. Một slide trình chiếu hiệu quả nên có đặc điểm gì? A. Càng nhiều chữ càng tốt B. Mỗi slide truyền tải một ý chính, chữ đủ lớn C. Dùng nhiều màu sắc sặc sỡ D. Không cần hình ảnh minh họa Đáp án: B — Slide đơn giản, tập trung một ý chính giúp người xem dễ tiếp thu.",
          "3. Vì sao nên xuất tài liệu ra PDF trước khi gửi cho người khác? A. Để giảm dung lượng B. Để người nhận không chỉnh sửa được nội dung C. Để tăng tốc độ tải D. Không có lý do cụ thể Đáp án: B — PDF cố định định dạng, tránh nội dung bị chỉnh sửa ngoài ý muốn.",
          "4. Trong bảng tính, mỗi hàng thường đại diện cho điều gì? A. Một thuộc tính B. Một bản ghi (ví dụ một khách hàng) C. Một công thức D. Không có ý nghĩa cụ thể Đáp án: B — Hàng thường thể hiện một bản ghi, cột thể hiện thuộc tính.",
          "5. In đậm trong văn bản nên dùng khi nào? A. Cho toàn bộ đoạn văn B. Để nhấn mạnh từ khóa quan trọng, không lạm dụng C. Không bao giờ nên dùng D. Chỉ dùng cho tiêu đề Đáp án: B — In đậm hiệu quả nhất khi dùng có chọn lọc để nhấn mạnh."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Chỉnh sửa và tái sử dụng nội dung",
        "competencyCode": "3.2",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo"
        ],
        "definitions": [
          "Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Dán giữ định dạng: sao chép nội dung và giữ nguyên kiểu chữ, màu sắc gốc",
          "Dán văn bản thuần: sao chép chỉ lấy nội dung chữ, bỏ toàn bộ định dạng gốc",
          "Mẫu tài liệu (template): tài liệu có sẵn cấu trúc và định dạng để tái sử dụng nhiều lần"
        ],
        "body": [
          "Tích hợp và tạo lập lại nội dung số nghĩa là sửa đổi, tinh chỉnh nội dung có sẵn để tạo ra nội dung mới. Khi nhận một tài liệu từ người khác để chỉnh sửa, cần thao tác cẩn thận để không làm hỏng định dạng đã có.",
          "Khi sao chép nội dung từ nguồn khác, có hai lựa chọn: dán giữ định dạng hoặc dán văn bản thuần — dán văn bản thuần thường an toàn hơn khi muốn giữ tài liệu nhất quán. Mẫu tài liệu của doanh nghiệp giúp tiết kiệm thời gian và đảm bảo tính nhất quán. Trước khi gửi bất kỳ tài liệu nào, nên đọc lại toàn bộ một lượt để phát hiện lỗi."
        ],
        "examples": [],
        "practice": "Nhận một tài liệu thô, chỉnh sửa theo mẫu của doanh nghiệp, chèn một bảng số liệu và một hình ảnh, rồi xuất PDF.",
        "deliverable": "Tài liệu hoàn chỉnh theo mẫu và bản PDF.",
        "questions": [
          {
            "number": 1,
            "questionText": "Dán văn bản thuần khác dán giữ định dạng như thế nào?",
            "options": [
              "Không có khác biệt",
              "Dán văn bản thuần bỏ định dạng gốc, dán giữ định dạng thì giữ nguyên",
              "Dán văn bản thuần nhanh hơn",
              "Dán giữ định dạng luôn tốt hơn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là điểm khác biệt cốt lõi giữa hai cách dán.",
            "competencyCode": "3.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Vì sao nên dùng mẫu tài liệu có sẵn của doanh nghiệp?",
            "options": [
              "Không có lý do gì đặc biệt",
              "Tiết kiệm thời gian và đảm bảo tính nhất quán",
              "Chỉ để tuân thủ quy định",
              "Mẫu luôn đẹp hơn tự thiết kế"
            ],
            "correctIndex": 1,
            "explanation": "Mẫu có sẵn giúp tiết kiệm công sức và giữ hình ảnh chuyên nghiệp thống nhất.",
            "competencyCode": "3.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Khi nào nên chọn dán văn bản thuần thay vì dán giữ định dạng?",
            "options": [
              "Không bao giờ",
              "Khi muốn giữ tài liệu đích nhất quán về định dạng",
              "Khi cần giữ nguyên màu sắc gốc",
              "Không có sự khác biệt về khi nào nên dùng"
            ],
            "correctIndex": 1,
            "explanation": "Dán văn bản thuần giúp tránh xung đột định dạng với tài liệu đích.",
            "competencyCode": "3.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Trước khi gửi tài liệu, bước cuối cùng nên làm là gì?",
            "options": [
              "Không cần kiểm tra lại",
              "Đọc lại toàn bộ để phát hiện lỗi chính tả và định dạng",
              "Gửi ngay để tiết kiệm thời gian",
              "Chỉ cần kiểm tra tiêu đề"
            ],
            "correctIndex": 1,
            "explanation": "Rà soát lại giúp phát hiện lỗi trước khi tài liệu đến tay người nhận.",
            "competencyCode": "3.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Khi chèn bảng số liệu từ bảng tính vào văn bản, cần chú ý điều gì?",
            "options": [
              "Không cần chú ý gì đặc biệt",
              "Kiểm tra định dạng số và đơn vị hiển thị đúng",
              "Chỉ cần chèn càng nhanh càng tốt",
              "Luôn phải vẽ lại bảng thủ công"
            ],
            "correctIndex": 1,
            "explanation": "Định dạng số có thể thay đổi khi chuyển giữa các ứng dụng, cần kiểm tra lại.",
            "competencyCode": "3.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Dán văn bản thuần khác dán giữ định dạng như thế nào? A. Không có khác biệt B. Dán văn bản thuần bỏ định dạng gốc, dán giữ định dạng thì giữ nguyên C. Dán văn bản thuần nhanh hơn D. Dán giữ định dạng luôn tốt hơn Đáp án: B — Đây là điểm khác biệt cốt lõi giữa hai cách dán.",
          "2. Vì sao nên dùng mẫu tài liệu có sẵn của doanh nghiệp? A. Không có lý do gì đặc biệt B. Tiết kiệm thời gian và đảm bảo tính nhất quán C. Chỉ để tuân thủ quy định D. Mẫu luôn đẹp hơn tự thiết kế Đáp án: B — Mẫu có sẵn giúp tiết kiệm công sức và giữ hình ảnh chuyên nghiệp thống nhất.",
          "3. Khi nào nên chọn dán văn bản thuần thay vì dán giữ định dạng? A. Không bao giờ B. Khi muốn giữ tài liệu đích nhất quán về định dạng C. Khi cần giữ nguyên màu sắc gốc D. Không có sự khác biệt về khi nào nên dùng Đáp án: B — Dán văn bản thuần giúp tránh xung đột định dạng với tài liệu đích.",
          "4. Trước khi gửi tài liệu, bước cuối cùng nên làm là gì? A. Không cần kiểm tra lại B. Đọc lại toàn bộ để phát hiện lỗi chính tả và định dạng C. Gửi ngay để tiết kiệm thời gian D. Chỉ cần kiểm tra tiêu đề Đáp án: B — Rà soát lại giúp phát hiện lỗi trước khi tài liệu đến tay người nhận.",
          "5. Khi chèn bảng số liệu từ bảng tính vào văn bản, cần chú ý điều gì? A. Không cần chú ý gì đặc biệt B. Kiểm tra định dạng số và đơn vị hiển thị đúng C. Chỉ cần chèn càng nhanh càng tốt D. Luôn phải vẽ lại bảng thủ công Đáp án: B — Định dạng số có thể thay đổi khi chuyển giữa các ứng dụng, cần kiểm tra lại."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Nguyên tắc bản quyền cơ bản",
        "competencyCode": "3.3",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Bản quyền: quyền pháp lý bảo vệ tác phẩm sáng tạo (hình ảnh, văn bản, âm nhạc) khỏi việc sử dụng trái phép",
          "Giấy phép sử dụng: điều kiện mà chủ sở hữu tác phẩm cho phép người khác sử dụng tác phẩm của mình"
        ],
        "body": [
          "Thực thi bản quyền và giấy phép nghĩa là hiểu được cách áp dụng bản quyền cho nội dung số. Bản quyền bảo vệ hầu hết các loại tác phẩm sáng tạo: hình ảnh, văn bản, âm nhạc, video. Một hiểu lầm phổ biến là nghĩ rằng bất cứ thứ gì tìm được trên mạng đều có thể tự do sử dụng.",
          "Nhiều nền tảng cung cấp hình ảnh, nhạc, phông chữ miễn phí nhưng đi kèm điều kiện sử dụng cụ thể. Khi sử dụng nội dung của người khác được phép, cần ghi nguồn đầy đủ theo yêu cầu của giấy phép."
        ],
        "examples": [],
        "practice": "Tìm năm hình ảnh phù hợp cho một tài liệu công việc từ nguồn được phép sử dụng thương mại, ghi rõ giấy phép của từng hình.",
        "deliverable": "Bảng 5 hình ảnh kèm nguồn và loại giấy phép.",
        "questions": [
          {
            "number": 1,
            "questionText": "Tìm được một hình ảnh trên mạng có nghĩa là được tự do sử dụng không?",
            "options": [
              "Đúng, tìm được là được dùng",
              "Sai, cần kiểm tra điều kiện giấy phép trước khi sử dụng",
              "Chỉ đúng với hình ảnh cũ",
              "Chỉ đúng nếu không ghi tên tác giả"
            ],
            "correctIndex": 1,
            "explanation": "Tìm được không đồng nghĩa với việc được phép sử dụng, đặc biệt cho mục đích thương mại.",
            "competencyCode": "3.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Khi sử dụng nội dung có giấy phép yêu cầu ghi nguồn, cần làm gì?",
            "options": [
              "Không cần ghi gì cả",
              "Ghi tên tác giả và đường dẫn tới nguồn gốc theo yêu cầu giấy phép",
              "Chỉ cần ghi tên trang tải về",
              "Ghi nguồn là tùy chọn"
            ],
            "correctIndex": 1,
            "explanation": "Ghi nguồn đúng yêu cầu giấy phép là điều kiện bắt buộc để sử dụng hợp pháp.",
            "competencyCode": "3.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Nội dung “miễn phí” trên mạng có luôn được dùng cho mục đích thương mại không?",
            "options": [
              "Luôn được phép",
              "Không nhất thiết, cần đọc điều kiện giấy phép cụ thể",
              "Miễn phí nghĩa là không có điều kiện gì",
              "Chỉ áp dụng cho hình ảnh"
            ],
            "correctIndex": 1,
            "explanation": "“Miễn phí” có thể đi kèm điều kiện hạn chế mục đích sử dụng.",
            "competencyCode": "3.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Bản quyền bảo vệ những loại tác phẩm nào?",
            "options": [
              "Chỉ văn bản",
              "Hình ảnh, văn bản, âm nhạc, video, phông chữ thiết kế riêng",
              "Chỉ hình ảnh",
              "Chỉ nội dung có đăng ký chính thức"
            ],
            "correctIndex": 1,
            "explanation": "Bản quyền bảo vệ đa dạng các loại tác phẩm sáng tạo.",
            "competencyCode": "3.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Vi phạm bản quyền vô ý có gây rủi ro không?",
            "options": [
              "Không, chỉ vi phạm cố ý mới có rủi ro",
              "Có, vi phạm dù vô ý vẫn tạo ra rủi ro pháp lý và uy tín",
              "Chỉ có rủi ro với doanh nghiệp lớn",
              "Không có rủi ro thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Rủi ro pháp lý tồn tại kể cả khi vi phạm không cố ý, do đó cần kiểm tra trước khi sử dụng.",
            "competencyCode": "3.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Tìm được một hình ảnh trên mạng có nghĩa là được tự do sử dụng không? A. Đúng, tìm được là được dùng B. Sai, cần kiểm tra điều kiện giấy phép trước khi sử dụng C. Chỉ đúng với hình ảnh cũ D. Chỉ đúng nếu không ghi tên tác giả Đáp án: B — Tìm được không đồng nghĩa với việc được phép sử dụng, đặc biệt cho mục đích thương mại.",
          "2. Khi sử dụng nội dung có giấy phép yêu cầu ghi nguồn, cần làm gì? A. Không cần ghi gì cả B. Ghi tên tác giả và đường dẫn tới nguồn gốc theo yêu cầu giấy phép C. Chỉ cần ghi tên trang tải về D. Ghi nguồn là tùy chọn Đáp án: B — Ghi nguồn đúng yêu cầu giấy phép là điều kiện bắt buộc để sử dụng hợp pháp.",
          "3. Nội dung “miễn phí” trên mạng có luôn được dùng cho mục đích thương mại không? A. Luôn được phép B. Không nhất thiết, cần đọc điều kiện giấy phép cụ thể C. Miễn phí nghĩa là không có điều kiện gì D. Chỉ áp dụng cho hình ảnh Đáp án: B — “Miễn phí” có thể đi kèm điều kiện hạn chế mục đích sử dụng.",
          "4. Bản quyền bảo vệ những loại tác phẩm nào? A. Chỉ văn bản B. Hình ảnh, văn bản, âm nhạc, video, phông chữ thiết kế riêng C. Chỉ hình ảnh D. Chỉ nội dung có đăng ký chính thức Đáp án: B — Bản quyền bảo vệ đa dạng các loại tác phẩm sáng tạo.",
          "5. Vi phạm bản quyền vô ý có gây rủi ro không? A. Không, chỉ vi phạm cố ý mới có rủi ro B. Có, vi phạm dù vô ý vẫn tạo ra rủi ro pháp lý và uy tín C. Chỉ có rủi ro với doanh nghiệp lớn D. Không có rủi ro thực tế Đáp án: B — Rủi ro pháp lý tồn tại kể cả khi vi phạm không cố ý, do đó cần kiểm tra trước khi sử dụng."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Làm quen tư duy tính toán",
        "competencyCode": "3.4",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản"
        ],
        "definitions": [
          "Bước tuần tự: các hành động được thực hiện theo thứ tự cố định để hoàn thành một công việc",
          "Điều kiện nếu-thì: cấu trúc logic trong đó một hành động chỉ xảy ra khi một điều kiện cụ thể được thỏa mãn",
          "Công thức bảng tính: biểu thức tính toán tự động dựa trên giá trị trong các ô"
        ],
        "body": [
          "Lập trình ở mức cơ bản nghĩa là liệt kê được các hướng dẫn đơn giản cho hệ thống máy tính. Chia một công việc thành các bước tuần tự rõ ràng là nền tảng của tư duy này. Nhiều công việc có chứa điều kiện nếu-thì, ví dụ “nếu đơn hàng trên 5 triệu thì áp dụng giảm giá 5%”.",
          "Công thức bảng tính cơ bản như tính tổng, tính trung bình, đếm số lượng giúp xử lý số liệu nhanh hơn. Một nguyên tắc quan trọng: máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người."
        ],
        "examples": [],
        "practice": "Viết ra quy trình một công việc hàng ngày của mình thành các bước rõ ràng, chỉ ra bước nào có điều kiện và bước nào lặp lại.",
        "deliverable": "Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cần diễn đạt công việc thành các bước cụ thể, không mơ hồ?",
            "options": [
              "Không quan trọng",
              "Máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người",
              "Chỉ để trình bày đẹp",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc nền tảng của tư duy tính toán.",
            "competencyCode": "3.4",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "“Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc gì?",
            "options": [
              "Bước tuần tự",
              "Điều kiện nếu-thì",
              "Công thức tổng",
              "Vòng lặp"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cấu trúc logic điều kiện, hành động chỉ xảy ra khi điều kiện được thỏa mãn.",
            "competencyCode": "3.4",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Hàm điều kiện trong bảng tính có tác dụng gì?",
            "options": [
              "Chỉ để trang trí",
              "Tự động đưa ra kết quả khác nhau tùy giá trị đầu vào",
              "Không có tác dụng thực tế",
              "Chỉ dùng để đếm số"
            ],
            "correctIndex": 1,
            "explanation": "Hàm điều kiện thực hiện logic nếu-thì một cách tự động.",
            "competencyCode": "3.4",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Nhận biết công việc lặp đi lặp lại thủ công có ích gì?",
            "options": [
              "Không có ích gì",
              "Là bước đầu để nghĩ đến khả năng tự động hóa",
              "Chỉ để phàn nàn về khối lượng công việc",
              "Không liên quan đến tư duy tính toán"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bước chuẩn bị quan trọng cho việc tự động hóa ở mức cao hơn.",
            "competencyCode": "3.4",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Điều gì KHÔNG đúng về máy tính khi thực hiện chỉ dẫn?",
            "options": [
              "Cần chỉ dẫn chính xác",
              "Có thể tự “hiểu ý” khi chỉ dẫn mơ hồ",
              "Thực hiện đúng theo logic được lập trình",
              "Không tự suy luận ngoài chỉ dẫn đã cho"
            ],
            "correctIndex": 1,
            "explanation": "Máy tính không thể tự suy luận ý định khi chỉ dẫn không rõ ràng, khác với con người.",
            "competencyCode": "3.4",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Vì sao cần diễn đạt công việc thành các bước cụ thể, không mơ hồ? A. Không quan trọng B. Máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người C. Chỉ để trình bày đẹp D. Không có lý do cụ thể Đáp án: B — Đây là nguyên tắc nền tảng của tư duy tính toán.",
          "2. “Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc gì? A. Bước tuần tự B. Điều kiện nếu-thì C. Công thức tổng D. Vòng lặp Đáp án: B — Đây là cấu trúc logic điều kiện, hành động chỉ xảy ra khi điều kiện được thỏa mãn.",
          "3. Hàm điều kiện trong bảng tính có tác dụng gì? A. Chỉ để trang trí B. Tự động đưa ra kết quả khác nhau tùy giá trị đầu vào C. Không có tác dụng thực tế D. Chỉ dùng để đếm số Đáp án: B — Hàm điều kiện thực hiện logic nếu-thì một cách tự động.",
          "4. Nhận biết công việc lặp đi lặp lại thủ công có ích gì? A. Không có ích gì B. Là bước đầu để nghĩ đến khả năng tự động hóa C. Chỉ để phàn nàn về khối lượng công việc D. Không liên quan đến tư duy tính toán Đáp án: B — Đây là bước chuẩn bị quan trọng cho việc tự động hóa ở mức cao hơn.",
          "5. Điều gì KHÔNG đúng về máy tính khi thực hiện chỉ dẫn? A. Cần chỉ dẫn chính xác B. Có thể tự “hiểu ý” khi chỉ dẫn mơ hồ C. Thực hiện đúng theo logic được lập trình D. Không tự suy luận ngoài chỉ dẫn đã cho Đáp án: B — Máy tính không thể tự suy luận ý định khi chỉ dẫn không rõ ràng, khác với con người."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M3-F",
      "brief": "Tạo một bộ tài liệu công việc hoàn chỉnh (báo cáo, bảng số liệu, slide tóm tắt), dùng hình ảnh có bản quyền hợp lệ, kèm quy trình các bước đã thực hiện.\nTiêu chí chấm:\nBa định dạng tài liệu đúng mục đích, trình bày rõ ràng\nHình ảnh sử dụng có nguồn và giấy phép hợp lệ\nQuy trình các bước rõ ràng, cụ thể\nTrình bày tổng thể chuyên nghiệp\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A3-I": {
    "code": "A3-I",
    "title": "TẠO LẬP NỘI DUNG CHUYÊN NGHIỆP",
    "domainNumber": 3,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 4 module · 10 giờ · Tiên quyết: M3-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Sản xuất nội dung đa định dạng",
        "competencyCode": "3.1",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau",
          "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số"
        ],
        "definitions": [],
        "body": [
          "Bộ nhận diện (brand identity): tập hợp các yếu tố hình ảnh (màu sắc, phông chữ, logo) tạo nên sự nhất quán cho thương hiệu",
          "Phân cấp thông tin: cách sắp xếp nội dung theo mức độ quan trọng để người xem dễ nắm bắt ý chính trước",
          "Ở mức trung cấp, việc phát triển nội dung số cần đạt chuẩn chuyên nghiệp hơn — tạo tài liệu theo bộ nhận diện thống nhất (cùng bảng màu, phông chữ, bố trí logo) giúp mọi tài liệu doanh nghiệp phát hành đều dễ nhận diện.",
          "Nguyên tắc trình bày cơ bản gồm: sử dụng khoảng trắng hợp lý, phân cấp thông tin rõ ràng, tạo độ tương phản đủ để dễ đọc. Nội dung cần được điều chỉnh theo từng kênh: tài liệu in cần bố cục trang trọng, mạng xã hội cần ngắn gọn và bắt mắt.",
          "Các công cụ thiết kế trực tuyến hiện nay cho phép người không chuyên tạo ra nội dung hình ảnh chuyên nghiệp thông qua mẫu có sẵn."
        ],
        "examples": [],
        "practice": "Chuyển một nội dung công việc thành ba định dạng cho ba kênh khác nhau, giữ nhất quán về nhận diện.",
        "deliverable": "Bộ 3 sản phẩm nội dung cho 3 kênh.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bộ nhận diện thống nhất mang lại lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Giúp tài liệu dễ nhận diện, tạo cảm giác chuyên nghiệp",
              "Chỉ để làm đẹp",
              "Tốn thời gian không cần thiết"
            ],
            "correctIndex": 1,
            "explanation": "Nhận diện nhất quán xây dựng uy tín và sự chuyên nghiệp cho thương hiệu.",
            "competencyCode": "3.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Nội dung cho mạng xã hội nên có đặc điểm gì so với tài liệu in?",
            "options": [
              "Giống hệt nhau",
              "Ngắn gọn, bắt mắt ngay từ đầu",
              "Cần nhiều chữ hơn",
              "Không cần điều chỉnh gì"
            ],
            "correctIndex": 1,
            "explanation": "Mỗi kênh có đặc điểm tiêu thụ nội dung khác nhau, cần điều chỉnh phù hợp.",
            "competencyCode": "3.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao cần cung cấp phụ đề cho video?",
            "options": [
              "Không cần thiết",
              "Giúp người xem trong môi trường ồn hoặc khiếm thính tiếp cận nội dung",
              "Chỉ để trang trí",
              "Làm video chậm hơn"
            ],
            "correctIndex": 1,
            "explanation": "Phụ đề mở rộng khả năng tiếp cận nội dung cho nhiều đối tượng người xem.",
            "competencyCode": "3.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Phân cấp thông tin trong thiết kế nghĩa là gì?",
            "options": [
              "Không có ý nghĩa cụ thể",
              "Sắp xếp nội dung theo mức độ quan trọng để dễ nắm bắt",
              "Chỉ dùng màu sắc khác nhau",
              "Chỉ áp dụng cho văn bản dài"
            ],
            "correctIndex": 1,
            "explanation": "Phân cấp giúp người xem nhanh chóng nhận ra ý chính trước các chi tiết phụ.",
            "competencyCode": "3.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì cho người không chuyên?",
            "options": [
              "Không có ích gì",
              "Cho phép tạo nội dung hình ảnh chuyên nghiệp không cần kiến thức thiết kế sâu",
              "Chỉ dùng được cho chuyên gia",
              "Tốn nhiều thời gian hơn thiết kế thủ công"
            ],
            "correctIndex": 1,
            "explanation": "Mẫu có sẵn giúp người không chuyên vẫn tạo ra sản phẩm đạt chuẩn thẩm mỹ cơ bản.",
            "competencyCode": "3.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Bộ nhận diện thống nhất mang lại lợi ích gì? A. Không có lợi ích cụ thể B. Giúp tài liệu dễ nhận diện, tạo cảm giác chuyên nghiệp C. Chỉ để làm đẹp D. Tốn thời gian không cần thiết Đáp án: B — Nhận diện nhất quán xây dựng uy tín và sự chuyên nghiệp cho thương hiệu.",
          "2. Nội dung cho mạng xã hội nên có đặc điểm gì so với tài liệu in? A. Giống hệt nhau B. Ngắn gọn, bắt mắt ngay từ đầu C. Cần nhiều chữ hơn D. Không cần điều chỉnh gì Đáp án: B — Mỗi kênh có đặc điểm tiêu thụ nội dung khác nhau, cần điều chỉnh phù hợp.",
          "3. Vì sao cần cung cấp phụ đề cho video? A. Không cần thiết B. Giúp người xem trong môi trường ồn hoặc khiếm thính tiếp cận nội dung C. Chỉ để trang trí D. Làm video chậm hơn Đáp án: B — Phụ đề mở rộng khả năng tiếp cận nội dung cho nhiều đối tượng người xem.",
          "4. Phân cấp thông tin trong thiết kế nghĩa là gì? A. Không có ý nghĩa cụ thể B. Sắp xếp nội dung theo mức độ quan trọng để dễ nắm bắt C. Chỉ dùng màu sắc khác nhau D. Chỉ áp dụng cho văn bản dài Đáp án: B — Phân cấp giúp người xem nhanh chóng nhận ra ý chính trước các chi tiết phụ.",
          "5. Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì cho người không chuyên? A. Không có ích gì B. Cho phép tạo nội dung hình ảnh chuyên nghiệp không cần kiến thức thiết kế sâu C. Chỉ dùng được cho chuyên gia D. Tốn nhiều thời gian hơn thiết kế thủ công Đáp án: B — Mẫu có sẵn giúp người không chuyên vẫn tạo ra sản phẩm đạt chuẩn thẩm mỹ cơ bản."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Tích hợp và chuyển đổi nội dung",
        "competencyCode": "3.2",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo"
        ],
        "definitions": [
          "Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Trộn thư (mail merge): kỹ thuật tạo hàng loạt tài liệu cá nhân hóa từ một mẫu chung kết hợp với danh sách dữ liệu",
          "Liên kết dữ liệu: việc kết nối một bảng số liệu với văn bản để khi số liệu thay đổi, văn bản tự động cập nhật theo"
        ],
        "body": [
          "Ở mức trung cấp, việc tích hợp và tạo lập lại nội dung cần tổng hợp từ nhiều nguồn thành sản phẩm mới, đưa tri thức (sự hiểu biết, kinh nghiệm tích lũy) vào nội dung mới một cách nhất quán, tránh tình trạng “chắp vá” giữa các đoạn.",
          "Xây dựng bộ mẫu tài liệu chuẩn giúp toàn bộ phận tiết kiệm thời gian khi nhiều người cùng tạo tài liệu. Liên kết dữ liệu giữa bảng tính và văn bản cho phép biểu đồ tự động cập nhật khi số liệu gốc thay đổi. Trộn thư là kỹ thuật hữu ích khi cần tạo nhiều tài liệu cá nhân hóa cùng lúc. Quản lý phiên bản nội dung là kỹ năng quan trọng khi nhiều người tham gia chỉnh sửa."
        ],
        "examples": [],
        "practice": "Xây một bộ mẫu tài liệu cho bộ phận (tối thiểu 3 mẫu) và tạo tài liệu hàng loạt từ một danh sách dữ liệu.",
        "deliverable": "Bộ mẫu tài liệu và sản phẩm tạo hàng loạt.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cần giữ mạch nhất quán khi tổng hợp nội dung từ nhiều nguồn?",
            "options": [
              "Không quan trọng",
              "Tránh cảm giác “chắp vá” khiến người đọc mất tin tưởng",
              "Chỉ để tiết kiệm thời gian",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Sự thiếu nhất quán dễ bị người đọc nhận ra, ảnh hưởng đến tính chuyên nghiệp.",
            "competencyCode": "3.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Trộn thư (mail merge) hữu ích trong trường hợp nào?",
            "options": [
              "Chỉ dùng cho một người nhận",
              "Tạo nhiều tài liệu cá nhân hóa cùng lúc từ mẫu chung và danh sách dữ liệu",
              "Không có ứng dụng thực tế",
              "Chỉ dùng cho hình ảnh"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công dụng chính của kỹ thuật trộn thư.",
            "competencyCode": "3.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Liên kết dữ liệu giữa bảng tính và văn bản mang lại lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Báo cáo tự động cập nhật khi số liệu gốc thay đổi",
              "Chỉ làm tài liệu nặng hơn",
              "Không thể thực hiện được"
            ],
            "correctIndex": 1,
            "explanation": "Liên kết giúp tránh việc phải copy thủ công lại số liệu mỗi lần thay đổi.",
            "competencyCode": "3.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi chuyển đổi định dạng tệp, cần kiểm tra điều gì sau khi chuyển?",
            "options": [
              "Không cần kiểm tra gì",
              "Định dạng số, ký tự đặc biệt, cấu trúc bảng có bị mất không",
              "Chỉ cần kiểm tra dung lượng",
              "Chỉ cần kiểm tra tên tệp"
            ],
            "correctIndex": 1,
            "explanation": "Chuyển đổi định dạng có thể làm mất hoặc thay đổi một số yếu tố cần được xác nhận lại.",
            "competencyCode": "3.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Quản lý phiên bản nội dung quan trọng khi nào?",
            "options": [
              "Không bao giờ quan trọng",
              "Khi nội dung được chỉnh sửa qua nhiều vòng, nhiều người tham gia",
              "Chỉ quan trọng với tài liệu ngắn",
              "Chỉ áp dụng cho hình ảnh"
            ],
            "correctIndex": 1,
            "explanation": "Nhiều người cùng chỉnh sửa dễ gây nhầm lẫn về phiên bản nào là chính thức.",
            "competencyCode": "3.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Vì sao cần giữ mạch nhất quán khi tổng hợp nội dung từ nhiều nguồn? A. Không quan trọng B. Tránh cảm giác “chắp vá” khiến người đọc mất tin tưởng C. Chỉ để tiết kiệm thời gian D. Không có lý do cụ thể Đáp án: B — Sự thiếu nhất quán dễ bị người đọc nhận ra, ảnh hưởng đến tính chuyên nghiệp.",
          "2. Trộn thư (mail merge) hữu ích trong trường hợp nào? A. Chỉ dùng cho một người nhận B. Tạo nhiều tài liệu cá nhân hóa cùng lúc từ mẫu chung và danh sách dữ liệu C. Không có ứng dụng thực tế D. Chỉ dùng cho hình ảnh Đáp án: B — Đây là công dụng chính của kỹ thuật trộn thư.",
          "3. Liên kết dữ liệu giữa bảng tính và văn bản mang lại lợi ích gì? A. Không có lợi ích cụ thể B. Báo cáo tự động cập nhật khi số liệu gốc thay đổi C. Chỉ làm tài liệu nặng hơn D. Không thể thực hiện được Đáp án: B — Liên kết giúp tránh việc phải copy thủ công lại số liệu mỗi lần thay đổi.",
          "4. Khi chuyển đổi định dạng tệp, cần kiểm tra điều gì sau khi chuyển? A. Không cần kiểm tra gì B. Định dạng số, ký tự đặc biệt, cấu trúc bảng có bị mất không C. Chỉ cần kiểm tra dung lượng D. Chỉ cần kiểm tra tên tệp Đáp án: B — Chuyển đổi định dạng có thể làm mất hoặc thay đổi một số yếu tố cần được xác nhận lại.",
          "5. Quản lý phiên bản nội dung quan trọng khi nào? A. Không bao giờ quan trọng B. Khi nội dung được chỉnh sửa qua nhiều vòng, nhiều người tham gia C. Chỉ quan trọng với tài liệu ngắn D. Chỉ áp dụng cho hình ảnh Đáp án: B — Nhiều người cùng chỉnh sửa dễ gây nhầm lẫn về phiên bản nào là chính thức."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Bản quyền, giấy phép và sử dụng hợp pháp",
        "competencyCode": "3.3",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số"
        ],
        "definitions": [
          "Miền công cộng (public domain): tác phẩm không còn hoặc chưa từng thuộc bản quyền của riêng ai, có thể tự do sử dụng"
        ],
        "body": [
          "Ở mức trung cấp, việc áp dụng quy tắc bản quyền và giấy phép cần chi tiết hơn — phân biệt các loại giấy phép phổ biến khác nhau về mức độ tự do sử dụng, và xác định quyền sở hữu nội dung do nhân viên tạo ra trong quá trình làm việc (thường thuộc quyền sở hữu của công ty theo hợp đồng lao động).",
          "Khi sử dụng nội dung có yếu tố bên thứ ba — ví dụ hình ảnh có người thật xuất hiện — cần có sự đồng ý của người đó. Nội dung do công cụ AI tạo ra đang là vùng pháp lý chưa hoàn toàn rõ ràng, cần thận trọng khi dùng cho mục đích thương mại. Xây dựng quy trình kiểm tra bản quyền trước khi công bố giúp giảm rủi ro."
        ],
        "examples": [],
        "practice": "Xây danh mục kiểm tra bản quyền cho quy trình xuất bản nội dung của bộ phận, áp dụng thử lên ba sản phẩm nội dung đã có.",
        "deliverable": "Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm.",
        "questions": [
          {
            "number": 1,
            "questionText": "Nội dung do nhân viên tạo ra trong giờ làm việc thường thuộc quyền sở hữu của ai?",
            "options": [
              "Luôn thuộc về nhân viên",
              "Thường thuộc công ty theo hợp đồng lao động",
              "Không thuộc về ai",
              "Luôn cần thỏa thuận riêng mỗi lần"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc phổ biến, nên được nêu rõ trong hợp đồng để tránh tranh chấp.",
            "competencyCode": "3.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Khi hình ảnh có người thật xuất hiện được dùng cho mục đích thương mại, cần gì?",
            "options": [
              "Không cần gì đặc biệt",
              "Cần sự đồng ý của người đó",
              "Chỉ cần làm mờ mặt là đủ",
              "Chỉ cần ghi chú nguồn ảnh"
            ],
            "correctIndex": 1,
            "explanation": "Sử dụng hình ảnh cá nhân cho mục đích thương mại cần có sự đồng ý rõ ràng.",
            "competencyCode": "3.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Nội dung do AI tạo ra hiện nay có vấn đề pháp lý gì?",
            "options": [
              "Hoàn toàn rõ ràng về quyền sở hữu",
              "Chưa hoàn toàn rõ ràng về ai sở hữu bản quyền ở nhiều nơi",
              "Không có vấn đề gì",
              "Luôn thuộc về người dùng công cụ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là vùng pháp lý còn đang phát triển, cần thận trọng khi sử dụng cho mục đích quan trọng.",
            "competencyCode": "3.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Miền công cộng (public domain) nghĩa là gì?",
            "options": [
              "Nội dung phải trả phí để sử dụng",
              "Tác phẩm không thuộc bản quyền riêng của ai, có thể tự do sử dụng",
              "Chỉ dành cho cơ quan nhà nước",
              "Nội dung bị cấm sử dụng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là định nghĩa của miền công cộng.",
            "competencyCode": "3.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Quy trình kiểm tra bản quyền trước khi công bố nên bao gồm gì?",
            "options": [
              "Không cần quy trình gì",
              "Xác nhận nguồn gốc nội dung sử dụng và lưu hồ sơ chứng minh quyền sử dụng",
              "Chỉ cần hỏi miệng đồng nghiệp",
              "Chỉ áp dụng cho nội dung lớn"
            ],
            "correctIndex": 1,
            "explanation": "Quy trình có hệ thống giúp giảm rủi ro vi phạm bản quyền một cách nhất quán.",
            "competencyCode": "3.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Nội dung do nhân viên tạo ra trong giờ làm việc thường thuộc quyền sở hữu của ai? A. Luôn thuộc về nhân viên B. Thường thuộc công ty theo hợp đồng lao động C. Không thuộc về ai D. Luôn cần thỏa thuận riêng mỗi lần Đáp án: B — Đây là nguyên tắc phổ biến, nên được nêu rõ trong hợp đồng để tránh tranh chấp.",
          "2. Khi hình ảnh có người thật xuất hiện được dùng cho mục đích thương mại, cần gì? A. Không cần gì đặc biệt B. Cần sự đồng ý của người đó C. Chỉ cần làm mờ mặt là đủ D. Chỉ cần ghi chú nguồn ảnh Đáp án: B — Sử dụng hình ảnh cá nhân cho mục đích thương mại cần có sự đồng ý rõ ràng.",
          "3. Nội dung do AI tạo ra hiện nay có vấn đề pháp lý gì? A. Hoàn toàn rõ ràng về quyền sở hữu B. Chưa hoàn toàn rõ ràng về ai sở hữu bản quyền ở nhiều nơi C. Không có vấn đề gì D. Luôn thuộc về người dùng công cụ Đáp án: B — Đây là vùng pháp lý còn đang phát triển, cần thận trọng khi sử dụng cho mục đích quan trọng.",
          "4. Miền công cộng (public domain) nghĩa là gì? A. Nội dung phải trả phí để sử dụng B. Tác phẩm không thuộc bản quyền riêng của ai, có thể tự do sử dụng C. Chỉ dành cho cơ quan nhà nước D. Nội dung bị cấm sử dụng Đáp án: B — Đây là định nghĩa của miền công cộng.",
          "5. Quy trình kiểm tra bản quyền trước khi công bố nên bao gồm gì? A. Không cần quy trình gì B. Xác nhận nguồn gốc nội dung sử dụng và lưu hồ sơ chứng minh quyền sử dụng C. Chỉ cần hỏi miệng đồng nghiệp D. Chỉ áp dụng cho nội dung lớn Đáp án: B — Quy trình có hệ thống giúp giảm rủi ro vi phạm bản quyền một cách nhất quán."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Tự động hóa công việc lặp lại",
        "competencyCode": "3.4",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể"
        ],
        "definitions": [
          "Hàm tra cứu (lookup function): công thức bảng tính tự động tìm và lấy giá trị tương ứng từ một bảng dữ liệu khác",
          "Công cụ nối ứng dụng (no-code automation): công cụ cho phép kết nối và tự động hóa quy trình giữa các ứng dụng mà không cần viết mã lập trình"
        ],
        "body": [
          "Ở mức trung cấp, việc liệt kê hướng dẫn cho hệ thống máy tính giải quyết vấn đề cụ thể mở rộng sang tự động hóa công việc lặp lại — phân rã quy trình để xác định điểm có thể tự động hóa, thường là những bước lặp lại có quy tắc cố định.",
          "Hàm điều kiện, hàm tra cứu, hàm xử lý văn bản trong bảng tính giúp xử lý khối lượng dữ liệu lớn nhanh hơn nhiều. Công cụ nối ứng dụng không cần lập trình cho phép kết nối các ứng dụng khác nhau. Không phải công việc lặp lại nào cũng đáng để tự động hóa — cần cân nhắc tần suất và mức độ ổn định của quy tắc."
        ],
        "examples": [],
        "practice": "Chọn một công việc lặp lại trong bộ phận, phân rã thành các bước, tự động hóa ít nhất một bước và đo thời gian tiết kiệm được.",
        "deliverable": "Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bước nào trong quy trình phù hợp nhất để tự động hóa?",
            "options": [
              "Bước cần phán đoán chủ quan",
              "Bước lặp lại có quy tắc cố định",
              "Bước chỉ làm một lần",
              "Bước không có quy tắc rõ ràng"
            ],
            "correctIndex": 1,
            "explanation": "Các bước lặp lại theo quy tắc cố định dễ tự động hóa và mang lại hiệu quả cao nhất.",
            "competencyCode": "3.4",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Hàm tra cứu trong bảng tính dùng để làm gì?",
            "options": [
              "Tính tổng số liệu",
              "Tự động tìm và lấy giá trị tương ứng từ bảng dữ liệu khác",
              "Định dạng chữ",
              "Xóa dữ liệu trùng lặp"
            ],
            "correctIndex": 1,
            "explanation": "Đây là chức năng chính của hàm tra cứu.",
            "competencyCode": "3.4",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Khi nào KHÔNG nên đầu tư công sức tự động hóa một công việc?",
            "options": [
              "Khi công việc lặp lại hàng ngày",
              "Khi tần suất thấp và quy tắc hay thay đổi",
              "Khi quy tắc rất ổn định",
              "Khi khối lượng công việc lớn"
            ],
            "correctIndex": 1,
            "explanation": "Tần suất thấp và quy tắc không ổn định khiến chi phí duy trì tự động hóa không đáng công sức bỏ ra.",
            "competencyCode": "3.4",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Rủi ro của việc tự động hóa sai là gì?",
            "options": [
              "Không có rủi ro gì đặc biệt",
              "Lỗi có thể lan rộng nhanh hơn lỗi thủ công",
              "Chỉ ảnh hưởng đến một trường hợp",
              "Dễ phát hiện hơn lỗi thủ công"
            ],
            "correctIndex": 1,
            "explanation": "Hệ thống tự động xử lý số lượng lớn nên lỗi có thể nhân rộng nhanh chóng nếu không được kiểm soát.",
            "competencyCode": "3.4",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Công cụ nối ứng dụng không cần lập trình cho phép làm gì?",
            "options": [
              "Chỉ dùng được bởi lập trình viên",
              "Kết nối và tự động hóa giữa các ứng dụng mà không cần viết mã",
              "Không có ứng dụng thực tế",
              "Chỉ dùng cho một ứng dụng duy nhất"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công dụng chính, giúp người không chuyên về lập trình vẫn có thể tự động hóa quy trình.",
            "competencyCode": "3.4",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Bước nào trong quy trình phù hợp nhất để tự động hóa? A. Bước cần phán đoán chủ quan B. Bước lặp lại có quy tắc cố định C. Bước chỉ làm một lần D. Bước không có quy tắc rõ ràng Đáp án: B — Các bước lặp lại theo quy tắc cố định dễ tự động hóa và mang lại hiệu quả cao nhất.",
          "2. Hàm tra cứu trong bảng tính dùng để làm gì? A. Tính tổng số liệu B. Tự động tìm và lấy giá trị tương ứng từ bảng dữ liệu khác C. Định dạng chữ D. Xóa dữ liệu trùng lặp Đáp án: B — Đây là chức năng chính của hàm tra cứu.",
          "3. Khi nào KHÔNG nên đầu tư công sức tự động hóa một công việc? A. Khi công việc lặp lại hàng ngày B. Khi tần suất thấp và quy tắc hay thay đổi C. Khi quy tắc rất ổn định D. Khi khối lượng công việc lớn Đáp án: B — Tần suất thấp và quy tắc không ổn định khiến chi phí duy trì tự động hóa không đáng công sức bỏ ra.",
          "4. Rủi ro của việc tự động hóa sai là gì? A. Không có rủi ro gì đặc biệt B. Lỗi có thể lan rộng nhanh hơn lỗi thủ công C. Chỉ ảnh hưởng đến một trường hợp D. Dễ phát hiện hơn lỗi thủ công Đáp án: B — Hệ thống tự động xử lý số lượng lớn nên lỗi có thể nhân rộng nhanh chóng nếu không được kiểm soát.",
          "5. Công cụ nối ứng dụng không cần lập trình cho phép làm gì? A. Chỉ dùng được bởi lập trình viên B. Kết nối và tự động hóa giữa các ứng dụng mà không cần viết mã C. Không có ứng dụng thực tế D. Chỉ dùng cho một ứng dụng duy nhất Đáp án: B — Đây là công dụng chính, giúp người không chuyên về lập trình vẫn có thể tự động hóa quy trình."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M3-I",
      "brief": "Sản xuất một chiến dịch nội dung nhỏ: bộ mẫu tài liệu, ba sản phẩm nội dung đa kênh, hồ sơ kiểm tra bản quyền, và một quy trình tự động hóa hỗ trợ.\nTiêu chí chấm:\nBộ mẫu tài liệu nhất quán, chuyên nghiệp\nBa sản phẩm nội dung phù hợp từng kênh\nHồ sơ kiểm tra bản quyền đầy đủ\nGiải pháp tự động hóa khả thi, có đo lường hiệu quả\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A3-A": {
    "code": "A3-A",
    "title": "CHIẾN LƯỢC NỘI DUNG VÀ GIẢI PHÁP SỐ",
    "domainNumber": 3,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 4 module · 12 giờ · Tiên quyết: M3-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Chiến lược và hệ thống sản xuất nội dung",
        "competencyCode": "3.1",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Thay đổi được nội dung bằng các định dạng phù hợp nhất",
          "Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất"
        ],
        "definitions": [],
        "body": [
          "Chân dung đối tượng (persona): hồ sơ mô tả đặc điểm, nhu cầu của một nhóm khách hàng hoặc đối tượng mục tiêu điển hình",
          "Hành trình khách hàng: các giai đoạn một khách hàng trải qua từ khi biết đến sản phẩm đến khi mua và sử dụng",
          "Ở mức nâng cao, việc thể hiện bản thân qua các phương tiện số phù hợp nhất đòi hỏi một chiến lược sản xuất nội dung gắn với mục tiêu kinh doanh, không chỉ dừng ở từng sản phẩm đơn lẻ.",
          "Xây dựng chân dung đối tượng giúp định hướng nội dung phù hợp với nhu cầu thực tế. Bản đồ nội dung theo hành trình khách hàng giúp nội dung phát huy đúng vai trò ở đúng thời điểm. Quy trình sản xuất nội dung có thể mở rộng cần các bước rõ ràng: lên ý tưởng, duyệt đề cương, sản xuất, duyệt nội dung cuối, xuất bản, đánh giá hiệu quả.",
          "Khi khối lượng sản xuất nội dung tăng lên, một người không thể tự làm hết mà cần hướng dẫn người khác cùng tạo nội dung theo đúng chuẩn — vai trò này không phải là kiểm tra từng chi tiết mọi lúc (dễ sa vào vi quản lý), mà là thiết lập tiêu chuẩn chất lượng rõ ràng ngay từ đầu và chỉ duyệt kỹ ở các điểm kiểm soát quan trọng trong quy trình."
        ],
        "examples": [],
        "practice": "Xây chiến lược nội dung một quý cho doanh nghiệp: mục tiêu, đối tượng, chủ đề, kênh, lịch sản xuất, chỉ số đo lường.",
        "deliverable": "Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số.",
        "questions": [
          {
            "number": 1,
            "questionText": "Chiến lược nội dung nên bắt đầu từ đâu?",
            "options": [
              "Từ việc chọn kênh trước",
              "Từ mục tiêu kinh doanh cụ thể",
              "Từ xu hướng thịnh hành",
              "Từ ngân sách có sẵn"
            ],
            "correctIndex": 1,
            "explanation": "Mục tiêu kinh doanh định hướng toàn bộ chiến lược nội dung phía sau.",
            "competencyCode": "3.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Chân dung đối tượng dùng để làm gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Định hướng nội dung phù hợp với nhu cầu thực tế của khách hàng",
              "Chỉ để trang trí báo cáo",
              "Chỉ áp dụng cho quảng cáo"
            ],
            "correctIndex": 1,
            "explanation": "Hiểu rõ đối tượng giúp tạo nội dung đúng nhu cầu thay vì đoán mò.",
            "competencyCode": "3.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Vì sao lượt xem không phải lúc nào cũng là chỉ số quan trọng nhất?",
            "options": [
              "Lượt xem luôn là chỉ số quan trọng nhất",
              "Tỷ lệ chuyển đổi mới phản ánh hiệu quả kinh doanh thực sự",
              "Không nên đo lường lượt xem",
              "Lượt xem không có ý nghĩa gì"
            ],
            "correctIndex": 1,
            "explanation": "Lượt xem chỉ cho biết tiếp cận, chuyển đổi mới cho biết hiệu quả thực chất.",
            "competencyCode": "3.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Quy trình sản xuất nội dung có thể mở rộng cần điều gì?",
            "options": [
              "Không cần quy trình rõ ràng",
              "Các bước rõ ràng với người chịu trách nhiệm cụ thể ở mỗi bước",
              "Chỉ cần một người làm tất cả",
              "Không cần duyệt nội dung"
            ],
            "correctIndex": 1,
            "explanation": "Quy trình rõ ràng đảm bảo chất lượng đồng đều khi khối lượng sản xuất tăng.",
            "competencyCode": "3.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Vai trò hướng dẫn người khác trong sản xuất nội dung bao gồm gì?",
            "options": [
              "Kiểm tra toàn bộ chi tiết mọi lúc",
              "Thiết lập tiêu chuẩn rõ ràng và duyệt ở các điểm kiểm soát quan trọng",
              "Không can thiệp gì",
              "Tự làm hết thay vì hướng dẫn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cách quản lý chất lượng hiệu quả mà không sa vào vi quản lý.",
            "competencyCode": "3.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Chiến lược nội dung nên bắt đầu từ đâu? A. Từ việc chọn kênh trước B. Từ mục tiêu kinh doanh cụ thể C. Từ xu hướng thịnh hành D. Từ ngân sách có sẵn Đáp án: B — Mục tiêu kinh doanh định hướng toàn bộ chiến lược nội dung phía sau.",
          "2. Chân dung đối tượng dùng để làm gì? A. Không có tác dụng thực tế B. Định hướng nội dung phù hợp với nhu cầu thực tế của khách hàng C. Chỉ để trang trí báo cáo D. Chỉ áp dụng cho quảng cáo Đáp án: B — Hiểu rõ đối tượng giúp tạo nội dung đúng nhu cầu thay vì đoán mò.",
          "3. Vì sao lượt xem không phải lúc nào cũng là chỉ số quan trọng nhất? A. Lượt xem luôn là chỉ số quan trọng nhất B. Tỷ lệ chuyển đổi mới phản ánh hiệu quả kinh doanh thực sự C. Không nên đo lường lượt xem D. Lượt xem không có ý nghĩa gì Đáp án: B — Lượt xem chỉ cho biết tiếp cận, chuyển đổi mới cho biết hiệu quả thực chất.",
          "4. Quy trình sản xuất nội dung có thể mở rộng cần điều gì? A. Không cần quy trình rõ ràng B. Các bước rõ ràng với người chịu trách nhiệm cụ thể ở mỗi bước C. Chỉ cần một người làm tất cả D. Không cần duyệt nội dung Đáp án: B — Quy trình rõ ràng đảm bảo chất lượng đồng đều khi khối lượng sản xuất tăng.",
          "5. Vai trò hướng dẫn người khác trong sản xuất nội dung bao gồm gì? A. Kiểm tra toàn bộ chi tiết mọi lúc B. Thiết lập tiêu chuẩn rõ ràng và duyệt ở các điểm kiểm soát quan trọng C. Không can thiệp gì D. Tự làm hết thay vì hướng dẫn Đáp án: B — Đây là cách quản lý chất lượng hiệu quả mà không sa vào vi quản lý."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Quản trị và tái sử dụng tài sản nội dung",
        "competencyCode": "3.2",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo"
        ],
        "definitions": [
          "Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Tài sản nội dung: toàn bộ nội dung đã sản xuất (hình ảnh, văn bản, video) mà tổ chức sở hữu và có thể tái sử dụng"
        ],
        "body": [
          "Ở mức nâng cao, việc đánh giá cách phù hợp nhất để tích hợp nội dung mới vào tri thức hiện có đòi hỏi xây dựng hệ thống quản trị tài sản nội dung cấp tổ chức.",
          "Một thư viện tài sản nội dung có tổ chức — phân loại theo chủ đề, loại nội dung, chiến dịch — giúp toàn bộ phận dễ tìm và tái sử dụng. Thiết kế nội dung theo hướng mô-đun (tách thành khối nhỏ độc lập) cho phép kết hợp linh hoạt cho nhiều mục đích khác nhau. Nội dung cần có chu kỳ rà soát định kỳ để phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ."
        ],
        "examples": [],
        "practice": "Thiết kế thư viện tài sản nội dung cho doanh nghiệp, gồm cấu trúc phân loại, quy ước gắn thẻ và quy trình rà soát định kỳ.",
        "deliverable": "Thiết kế thư viện nội dung và quy trình vận hành.",
        "questions": [
          {
            "number": 1,
            "questionText": "Nội dung mô-đun là gì?",
            "options": [
              "Nội dung dài không thể chỉnh sửa",
              "Nội dung được thiết kế thành khối nhỏ độc lập, có thể kết hợp linh hoạt",
              "Nội dung chỉ dùng một lần",
              "Nội dung không cần phân loại"
            ],
            "correctIndex": 1,
            "explanation": "Đây là định nghĩa của thiết kế nội dung mô-đun.",
            "competencyCode": "3.2",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao cần chu kỳ rà soát nội dung định kỳ?",
            "options": [
              "Không cần thiết nếu nội dung đã xuất bản",
              "Phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ",
              "Chỉ để tăng số lượng nội dung",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Nội dung lỗi thời còn tồn tại có thể gây hiểu lầm hoặc tổn hại uy tín.",
            "competencyCode": "3.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Bản địa hóa nội dung khi mở rộng thị trường bao gồm điều gì?",
            "options": [
              "Chỉ cần dịch ngôn ngữ",
              "Điều chỉnh cả ví dụ, hình ảnh cho phù hợp văn hóa địa phương",
              "Không cần điều chỉnh gì",
              "Chỉ áp dụng cho video"
            ],
            "correctIndex": 1,
            "explanation": "Bản địa hóa toàn diện hơn việc dịch thuật đơn thuần.",
            "competencyCode": "3.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Hệ thống gắn thẻ trong thư viện nội dung có vai trò gì?",
            "options": [
              "Không có vai trò cụ thể",
              "Quyết định khả năng tìm kiếm hiệu quả của thư viện",
              "Chỉ để trang trí",
              "Làm chậm quá trình lưu trữ"
            ],
            "correctIndex": 1,
            "explanation": "Gắn thẻ nhất quán là yếu tố then chốt giúp tìm kiếm và tái sử dụng hiệu quả.",
            "competencyCode": "3.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Đo lường hiệu quả tái sử dụng nội dung có thể dựa trên chỉ số nào?",
            "options": [
              "Chỉ số lượt thích",
              "So sánh chi phí sản xuất mới với tái sử dụng, tỷ lệ nội dung được dùng lại",
              "Không thể đo lường được",
              "Chỉ dựa vào cảm nhận"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các chỉ số định lượng phản ánh hiệu quả của việc tái sử dụng.",
            "competencyCode": "3.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Nội dung mô-đun là gì? A. Nội dung dài không thể chỉnh sửa B. Nội dung được thiết kế thành khối nhỏ độc lập, có thể kết hợp linh hoạt C. Nội dung chỉ dùng một lần D. Nội dung không cần phân loại Đáp án: B — Đây là định nghĩa của thiết kế nội dung mô-đun.",
          "2. Vì sao cần chu kỳ rà soát nội dung định kỳ? A. Không cần thiết nếu nội dung đã xuất bản B. Phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ C. Chỉ để tăng số lượng nội dung D. Không có tác dụng thực tế Đáp án: B — Nội dung lỗi thời còn tồn tại có thể gây hiểu lầm hoặc tổn hại uy tín.",
          "3. Bản địa hóa nội dung khi mở rộng thị trường bao gồm điều gì? A. Chỉ cần dịch ngôn ngữ B. Điều chỉnh cả ví dụ, hình ảnh cho phù hợp văn hóa địa phương C. Không cần điều chỉnh gì D. Chỉ áp dụng cho video Đáp án: B — Bản địa hóa toàn diện hơn việc dịch thuật đơn thuần.",
          "4. Hệ thống gắn thẻ trong thư viện nội dung có vai trò gì? A. Không có vai trò cụ thể B. Quyết định khả năng tìm kiếm hiệu quả của thư viện C. Chỉ để trang trí D. Làm chậm quá trình lưu trữ Đáp án: B — Gắn thẻ nhất quán là yếu tố then chốt giúp tìm kiếm và tái sử dụng hiệu quả.",
          "5. Đo lường hiệu quả tái sử dụng nội dung có thể dựa trên chỉ số nào? A. Chỉ số lượt thích B. So sánh chi phí sản xuất mới với tái sử dụng, tỷ lệ nội dung được dùng lại C. Không thể đo lường được D. Chỉ dựa vào cảm nhận Đáp án: B — Đây là các chỉ số định lượng phản ánh hiệu quả của việc tái sử dụng."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Quản trị rủi ro pháp lý về nội dung",
        "competencyCode": "3.3",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Sở hữu trí tuệ: quyền pháp lý đối với các sáng tạo trí tuệ như tác phẩm, thiết kế, nhãn hiệu",
          "Hồ sơ chứng minh quyền sử dụng: tài liệu lưu trữ chứng minh doanh nghiệp có quyền hợp pháp sử dụng một nội dung cụ thể"
        ],
        "body": [
          "Ở mức nâng cao, việc chọn quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép mở rộng thành quản trị rủi ro pháp lý cấp tổ chức — bản đồ rủi ro nội dung cần bao quát: hình ảnh không rõ nguồn gốc, nhạc nền chưa có bản quyền, phông chữ thương mại dùng trái phép, dữ liệu cá nhân trong nội dung marketing.",
          "Chính sách sở hữu trí tuệ nội bộ nên quy định rõ ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép khi cần sử dụng tài sản trí tuệ bên ngoài. Khi làm việc với đơn vị sản xuất bên ngoài, hợp đồng cần có điều khoản rõ ràng về việc chuyển giao bản quyền."
        ],
        "examples": [],
        "practice": "Rà soát rủi ro pháp lý cho toàn bộ kho nội dung đang sử dụng, soạn chính sách sở hữu trí tuệ nội bộ và điều khoản mẫu cho hợp đồng sản xuất.",
        "deliverable": "Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khi thuê người làm tự do sản xuất nội dung mà không có điều khoản chuyển giao bản quyền, quyền sở hữu thuộc về ai?",
            "options": [
              "Luôn thuộc về bên thuê",
              "Có thể vẫn thuộc về người sáng tạo theo mặc định",
              "Không thuộc về ai",
              "Tự động thuộc về công chúng"
            ],
            "correctIndex": 1,
            "explanation": "Không có điều khoản rõ ràng, quyền sở hữu mặc định có thể vẫn ở người tạo ra tác phẩm.",
            "competencyCode": "3.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao cần lưu hồ sơ chứng minh quyền sử dụng nội dung?",
            "options": [
              "Không cần thiết",
              "Là bằng chứng cần thiết khi có tranh chấp phát sinh",
              "Chỉ để lưu trữ hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Hồ sơ đầy đủ bảo vệ doanh nghiệp khi bị khiếu nại hoặc tranh chấp bản quyền.",
            "competencyCode": "3.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi nhận được khiếu nại bản quyền, bước đầu tiên nên làm là gì?",
            "options": [
              "Phớt lờ khiếu nại",
              "Xác minh tính hợp lệ của khiếu nại trước khi phản hồi",
              "Ngay lập tức thừa nhận sai",
              "Xóa toàn bộ nội dung liên quan ngay lập tức"
            ],
            "correctIndex": 1,
            "explanation": "Xác minh trước giúp có phản ứng phù hợp, tránh hành động vội vàng không cần thiết.",
            "competencyCode": "3.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Chính sách sở hữu trí tuệ nội bộ nên quy định điều gì?",
            "options": [
              "Không cần quy định gì cụ thể",
              "Ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép sử dụng tài sản bên ngoài",
              "Chỉ áp dụng cho quản lý cấp cao",
              "Chỉ liên quan đến IT"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các nội dung cốt lõi cần có trong chính sách sở hữu trí tuệ.",
            "competencyCode": "3.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Bản đồ rủi ro nội dung nên bao quát những nguồn rủi ro nào?",
            "options": [
              "Chỉ hình ảnh",
              "Hình ảnh, nhạc, phông chữ, dữ liệu cá nhân, phát ngôn gây tranh cãi",
              "Chỉ văn bản",
              "Chỉ liên quan đến video"
            ],
            "correctIndex": 1,
            "explanation": "Rủi ro nội dung đến từ nhiều nguồn khác nhau, cần được rà soát toàn diện.",
            "competencyCode": "3.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Khi thuê người làm tự do sản xuất nội dung mà không có điều khoản chuyển giao bản quyền, quyền sở hữu thuộc về ai? A. Luôn thuộc về bên thuê B. Có thể vẫn thuộc về người sáng tạo theo mặc định C. Không thuộc về ai D. Tự động thuộc về công chúng Đáp án: B — Không có điều khoản rõ ràng, quyền sở hữu mặc định có thể vẫn ở người tạo ra tác phẩm.",
          "2. Vì sao cần lưu hồ sơ chứng minh quyền sử dụng nội dung? A. Không cần thiết B. Là bằng chứng cần thiết khi có tranh chấp phát sinh C. Chỉ để lưu trữ hình thức D. Không có tác dụng thực tế Đáp án: B — Hồ sơ đầy đủ bảo vệ doanh nghiệp khi bị khiếu nại hoặc tranh chấp bản quyền.",
          "3. Khi nhận được khiếu nại bản quyền, bước đầu tiên nên làm là gì? A. Phớt lờ khiếu nại B. Xác minh tính hợp lệ của khiếu nại trước khi phản hồi C. Ngay lập tức thừa nhận sai D. Xóa toàn bộ nội dung liên quan ngay lập tức Đáp án: B — Xác minh trước giúp có phản ứng phù hợp, tránh hành động vội vàng không cần thiết.",
          "4. Chính sách sở hữu trí tuệ nội bộ nên quy định điều gì? A. Không cần quy định gì cụ thể B. Ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép sử dụng tài sản bên ngoài C. Chỉ áp dụng cho quản lý cấp cao D. Chỉ liên quan đến IT Đáp án: B — Đây là các nội dung cốt lõi cần có trong chính sách sở hữu trí tuệ.",
          "5. Bản đồ rủi ro nội dung nên bao quát những nguồn rủi ro nào? A. Chỉ hình ảnh B. Hình ảnh, nhạc, phông chữ, dữ liệu cá nhân, phát ngôn gây tranh cãi C. Chỉ văn bản D. Chỉ liên quan đến video Đáp án: B — Rủi ro nội dung đến từ nhiều nguồn khác nhau, cần được rà soát toàn diện."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Thiết kế giải pháp số cho nghiệp vụ",
        "competencyCode": "3.4",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể"
        ],
        "definitions": [
          "Mô hình hóa dữ liệu: việc xác định các thực thể, thuộc tính và mối quan hệ giữa chúng để tổ chức dữ liệu một cách logic",
          "Sơ đồ luồng xử lý: biểu diễn trực quan các bước và điểm quyết định trong một quy trình"
        ],
        "body": [
          "Ở mức nâng cao, việc xác định hướng dẫn thích hợp nhất cho hệ thống máy tính mở rộng thành thiết kế giải pháp số cho nghiệp vụ — từ một vấn đề nghiệp vụ cụ thể, chuyển hóa thành yêu cầu giải pháp rõ ràng.",
          "Mô hình hóa dữ liệu bắt đầu bằng việc xác định các thực thể chính, thuộc tính, và mối quan hệ giữa chúng. Sơ đồ luồng xử lý giúp hình dung các bước và điểm quyết định, cần chú ý xử lý cả trường hợp ngoại lệ. Khi vấn đề vượt quá khả năng của công cụ không cần lập trình, cần chuyển sang giải pháp công nghệ chuyên nghiệp — tập hợp công cụ kỹ thuật (phần mềm, phần cứng) hoặc dịch vụ để giải quyết vấn đề đặt ra.",
          "Khi giải pháp nối nhiều bước tự động hóa với nhau (đầu ra của bước này là đầu vào của bước sau), cần lường trước rủi ro phụ thuộc: nếu một ứng dụng trong chuỗi ngừng hoạt động hoặc thay đổi cách vận hành, toàn bộ quy trình phía sau có thể bị gián đoạn theo — nên có phương án dự phòng hoặc cảnh báo sớm cho các bước quan trọng nhất trong chuỗi."
        ],
        "examples": [],
        "practice": "Chọn một vấn đề nghiệp vụ thật, mô hình hóa dữ liệu và luồng xử lý, xây giải pháp tự động hóa và đánh giá hiệu quả.",
        "deliverable": "Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai.",
        "questions": [
          {
            "number": 1,
            "questionText": "Mô hình hóa dữ liệu bắt đầu từ việc gì?",
            "options": [
              "Viết mã lập trình ngay",
              "Xác định các thực thể, thuộc tính và mối quan hệ giữa chúng",
              "Chọn công cụ tự động hóa",
              "Tính chi phí thực hiện"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bước nền tảng trước khi xây dựng bất kỳ giải pháp dữ liệu nào.",
            "competencyCode": "3.4",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Sơ đồ luồng xử lý cần chú ý điều gì ngoài luồng chính?",
            "options": [
              "Chỉ cần luồng chính là đủ",
              "Cần xử lý các trường hợp ngoại lệ như dữ liệu thiếu, lỗi hệ thống",
              "Không cần quan tâm đến ngoại lệ",
              "Ngoại lệ không quan trọng bằng tốc độ xử lý"
            ],
            "correctIndex": 1,
            "explanation": "Bỏ qua ngoại lệ khiến giải pháp dễ gặp lỗi khi vận hành thực tế.",
            "competencyCode": "3.4",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Rủi ro phụ thuộc trong tự động hóa nhiều bước là gì?",
            "options": [
              "Không có rủi ro gì",
              "Nếu một ứng dụng trong chuỗi ngừng hoạt động, toàn bộ quy trình có thể gián đoạn",
              "Chỉ ảnh hưởng đến tốc độ",
              "Không liên quan đến vận hành"
            ],
            "correctIndex": 1,
            "explanation": "Chuỗi tự động hóa phụ thuộc lẫn nhau, một điểm lỗi có thể ảnh hưởng toàn bộ.",
            "competencyCode": "3.4",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Khi nào nên chuyển từ công cụ không cần lập trình sang giải pháp lập trình chuyên nghiệp?",
            "options": [
              "Luôn nên dùng lập trình ngay từ đầu",
              "Khi vấn đề đòi hỏi logic phức tạp hoặc tích hợp sâu vượt khả năng công cụ hiện có",
              "Không bao giờ cần chuyển",
              "Khi chi phí thấp"
            ],
            "correctIndex": 1,
            "explanation": "Công cụ không cần lập trình có giới hạn về độ phức tạp có thể xử lý.",
            "competencyCode": "3.4",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Khi mô tả yêu cầu cho đơn vị phát triển phần mềm, điều gì quan trọng hơn?",
            "options": [
              "Chỉ định công nghệ cụ thể cần dùng",
              "Mô tả rõ vấn đề cần giải quyết, kết quả mong muốn, ràng buộc",
              "Không cần mô tả chi tiết",
              "Chỉ cần đưa ngân sách"
            ],
            "correctIndex": 1,
            "explanation": "Mô tả rõ vấn đề và kết quả mong muốn giúp đơn vị phát triển đề xuất giải pháp phù hợp nhất.",
            "competencyCode": "3.4",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Mô hình hóa dữ liệu bắt đầu từ việc gì? A. Viết mã lập trình ngay B. Xác định các thực thể, thuộc tính và mối quan hệ giữa chúng C. Chọn công cụ tự động hóa D. Tính chi phí thực hiện Đáp án: B — Đây là bước nền tảng trước khi xây dựng bất kỳ giải pháp dữ liệu nào.",
          "2. Sơ đồ luồng xử lý cần chú ý điều gì ngoài luồng chính? A. Chỉ cần luồng chính là đủ B. Cần xử lý các trường hợp ngoại lệ như dữ liệu thiếu, lỗi hệ thống C. Không cần quan tâm đến ngoại lệ D. Ngoại lệ không quan trọng bằng tốc độ xử lý Đáp án: B — Bỏ qua ngoại lệ khiến giải pháp dễ gặp lỗi khi vận hành thực tế.",
          "3. Rủi ro phụ thuộc trong tự động hóa nhiều bước là gì? A. Không có rủi ro gì B. Nếu một ứng dụng trong chuỗi ngừng hoạt động, toàn bộ quy trình có thể gián đoạn C. Chỉ ảnh hưởng đến tốc độ D. Không liên quan đến vận hành Đáp án: B — Chuỗi tự động hóa phụ thuộc lẫn nhau, một điểm lỗi có thể ảnh hưởng toàn bộ.",
          "4. Khi nào nên chuyển từ công cụ không cần lập trình sang giải pháp lập trình chuyên nghiệp? A. Luôn nên dùng lập trình ngay từ đầu B. Khi vấn đề đòi hỏi logic phức tạp hoặc tích hợp sâu vượt khả năng công cụ hiện có C. Không bao giờ cần chuyển D. Khi chi phí thấp Đáp án: B — Công cụ không cần lập trình có giới hạn về độ phức tạp có thể xử lý.",
          "5. Khi mô tả yêu cầu cho đơn vị phát triển phần mềm, điều gì quan trọng hơn? A. Chỉ định công nghệ cụ thể cần dùng B. Mô tả rõ vấn đề cần giải quyết, kết quả mong muốn, ràng buộc C. Không cần mô tả chi tiết D. Chỉ cần đưa ngân sách Đáp án: B — Mô tả rõ vấn đề và kết quả mong muốn giúp đơn vị phát triển đề xuất giải pháp phù hợp nhất."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M3-A",
      "brief": "Xây dựng hệ thống nội dung hoàn chỉnh cho doanh nghiệp: chiến lược một quý, thư viện tài sản, chính sách pháp lý, và một giải pháp số hỗ trợ quy trình sản xuất nội dung.\nTiêu chí chấm:\nChiến lược nội dung gắn với mục tiêu kinh doanh\nThiết kế thư viện tài sản nội dung\nChính sách và quản trị rủi ro pháp lý\nGiải pháp số hỗ trợ quy trình, có đánh giá hiệu quả\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A4-F": {
    "code": "A4-F",
    "title": "AN TOÀN SỐ CƠ BẢN",
    "domainNumber": 4,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 4 module · 8 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Bảo vệ thiết bị và tài khoản",
        "competencyCode": "4.1",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản",
          "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số",
          "Tuân theo được các biện pháp an toàn và bảo mật đơn giản",
          "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư"
        ],
        "definitions": [
          "Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số",
          "Mật khẩu mạnh: mật khẩu đủ dài (tối thiểu 12 ký tự), kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không trùng với mật khẩu dùng ở nơi khác",
          "Xác thực hai lớp (2FA): phương thức bảo mật yêu cầu thêm một bước xác nhận ngoài mật khẩu (mã gửi về điện thoại, ứng dụng xác thực)",
          "Trình quản lý mật khẩu: phần mềm lưu trữ và tự động điền mật khẩu an toàn, giúp không cần nhớ nhiều mật khẩu phức tạp"
        ],
        "body": [
          "Bảo vệ thiết bị nghĩa là bảo vệ các thiết bị số — thiết bị điện tử, máy tính, viễn thông và thiết bị tích hợp khác dùng để xử lý, lưu trữ và trao đổi thông tin số. Mật khẩu mạnh cần đủ dài, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không dùng lại ở nhiều nơi.",
          "Xác thực hai lớp bổ sung một lớp bảo vệ: kể cả khi mật khẩu bị lộ, kẻ xấu vẫn cần thêm mã xác thực mới đăng nhập được. Cập nhật hệ điều hành và ứng dụng thường xuyên vá các lỗ hổng bảo mật đã biết. Dấu hiệu thiết bị bất thường bao gồm pin hết nhanh, thiết bị nóng hoặc chạy chậm không rõ nguyên nhân."
        ],
        "examples": [],
        "practice": "Rà soát các tài khoản công việc đang dùng (liệt kê tối thiểu 5 tài khoản: email, hệ thống nội bộ, mạng xã hội công ty…), bật xác thực hai lớp cho tối thiểu 3 tài khoản quan trọng nhất, và kiểm tra tình trạng cập nhật của thiết bị đang dùng.",
        "deliverable": "Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiết bị.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao không nên dùng lại cùng một mật khẩu cho nhiều tài khoản?",
            "options": [
              "Vì mất nhiều thời gian gõ hơn",
              "Nếu một dịch vụ bị lộ dữ liệu, các tài khoản khác dùng chung mật khẩu cũng gặp rủi ro",
              "Vì hệ thống sẽ báo lỗi",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Lộ mật khẩu ở một nơi có thể kéo theo rủi ro cho toàn bộ tài khoản dùng chung mật khẩu đó.",
            "competencyCode": "4.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Xác thực hai lớp bổ sung điều gì so với chỉ dùng mật khẩu?",
            "options": [
              "Không có gì khác biệt",
              "Yêu cầu thêm một bước xác nhận, bảo vệ tài khoản kể cả khi mật khẩu bị lộ",
              "Làm chậm quá trình đăng nhập không cần thiết",
              "Chỉ dùng cho tài khoản ngân hàng"
            ],
            "correctIndex": 1,
            "explanation": "2FA là lớp bảo vệ bổ sung, hữu ích ngay cả khi mật khẩu đã bị lộ.",
            "competencyCode": "4.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Vì sao nên cập nhật thiết bị và phần mềm thường xuyên?",
            "options": [
              "Chỉ để có giao diện mới",
              "Các bản cập nhật thường vá lỗ hổng bảo mật đã biết",
              "Không có lý do liên quan bảo mật",
              "Chỉ để tăng dung lượng lưu trữ"
            ],
            "correctIndex": 1,
            "explanation": "Cập nhật là cách chính để đóng các lỗ hổng bảo mật đã được phát hiện.",
            "competencyCode": "4.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Dấu hiệu nào sau đây có thể cho thấy thiết bị bị xâm nhập?",
            "options": [
              "Pin hết nhanh bất thường, xuất hiện ứng dụng lạ",
              "Thiết bị đang sạc pin bình thường",
              "Có bản cập nhật mới",
              "Wifi kết nối chậm do mạng yếu"
            ],
            "correctIndex": 0,
            "explanation": "Đây là các dấu hiệu bất thường cần lưu ý kiểm tra thêm.",
            "competencyCode": "4.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Trình quản lý mật khẩu giúp ích gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Tạo và lưu mật khẩu riêng biệt, đủ mạnh cho từng tài khoản",
              "Chỉ dùng để ghi chú",
              "Làm chậm máy tính"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công dụng chính, giúp người dùng không cần nhớ nhiều mật khẩu phức tạp.",
            "competencyCode": "4.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Vì sao không nên dùng lại cùng một mật khẩu cho nhiều tài khoản? A. Vì mất nhiều thời gian gõ hơn B. Nếu một dịch vụ bị lộ dữ liệu, các tài khoản khác dùng chung mật khẩu cũng gặp rủi ro C. Vì hệ thống sẽ báo lỗi D. Không có lý do cụ thể Đáp án: B — Lộ mật khẩu ở một nơi có thể kéo theo rủi ro cho toàn bộ tài khoản dùng chung mật khẩu đó.",
          "2. Xác thực hai lớp bổ sung điều gì so với chỉ dùng mật khẩu? A. Không có gì khác biệt B. Yêu cầu thêm một bước xác nhận, bảo vệ tài khoản kể cả khi mật khẩu bị lộ C. Làm chậm quá trình đăng nhập không cần thiết D. Chỉ dùng cho tài khoản ngân hàng Đáp án: B — 2FA là lớp bảo vệ bổ sung, hữu ích ngay cả khi mật khẩu đã bị lộ.",
          "3. Vì sao nên cập nhật thiết bị và phần mềm thường xuyên? A. Chỉ để có giao diện mới B. Các bản cập nhật thường vá lỗ hổng bảo mật đã biết C. Không có lý do liên quan bảo mật D. Chỉ để tăng dung lượng lưu trữ Đáp án: B — Cập nhật là cách chính để đóng các lỗ hổng bảo mật đã được phát hiện.",
          "4. Dấu hiệu nào sau đây có thể cho thấy thiết bị bị xâm nhập? A. Pin hết nhanh bất thường, xuất hiện ứng dụng lạ B. Thiết bị đang sạc pin bình thường C. Có bản cập nhật mới D. Wifi kết nối chậm do mạng yếu Đáp án: A — Đây là các dấu hiệu bất thường cần lưu ý kiểm tra thêm.",
          "5. Trình quản lý mật khẩu giúp ích gì? A. Không có tác dụng thực tế B. Tạo và lưu mật khẩu riêng biệt, đủ mạnh cho từng tài khoản C. Chỉ dùng để ghi chú D. Làm chậm máy tính Đáp án: B — Đây là công dụng chính, giúp người dùng không cần nhớ nhiều mật khẩu phức tạp."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Bảo vệ thông tin cá nhân",
        "competencyCode": "4.2",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn",
          "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân"
        ],
        "definitions": [
          "Thông tin cá nhân: thông tin gắn liền hoặc giúp xác định một người cụ thể — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước",
          "Lừa đảo giả mạo (phishing): hình thức lừa đảo qua email, tin nhắn hoặc cuộc gọi giả danh một tổ chức đáng tin để lấy thông tin hoặc tiền",
          "Quyền ứng dụng: các loại dữ liệu hoặc chức năng thiết bị mà một ứng dụng được phép truy cập (camera, vị trí, danh bạ)"
        ],
        "body": [
          "Bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số bắt đầu từ việc nhận biết thông tin cá nhân — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước. Lừa đảo giả mạo thường tạo cảm giác khẩn cấp và yêu cầu cung cấp thông tin nhạy cảm qua liên kết.",
          "Nguyên tắc an toàn cơ bản: không bấm vào liên kết lạ, không bao giờ cung cấp mã xác thực cho bất kỳ ai qua điện thoại. Trên điện thoại, nên rà soát định kỳ và thu hồi quyền truy cập ứng dụng không cần thiết. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân loại thành dữ liệu cơ bản và dữ liệu nhạy cảm, cần mức độ bảo vệ khác nhau."
        ],
        "examples": [],
        "practice": "Phân tích 5 email/tin nhắn mẫu (tự tìm hoặc dùng email lạ từng nhận được), xác định cái nào là lừa đảo và chỉ ra dấu hiệu; rà soát quyền ứng dụng trên điện thoại cá nhân.",
        "deliverable": "Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng.",
        "questions": [
          {
            "number": 1,
            "questionText": "Dấu hiệu điển hình của một email lừa đảo là gì?",
            "options": [
              "Địa chỉ gửi chính xác 100%",
              "Tạo cảm giác khẩn cấp, yêu cầu cung cấp thông tin qua liên kết",
              "Không có yêu cầu hành động gì",
              "Gửi từ đồng nghiệp quen biết"
            ],
            "correctIndex": 1,
            "explanation": "Tạo áp lực thời gian và yêu cầu hành động ngay là chiến thuật phổ biến của lừa đảo.",
            "competencyCode": "4.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Khi nhận được yêu cầu cung cấp mã OTP qua điện thoại, nên làm gì?",
            "options": [
              "Cung cấp ngay nếu người gọi tự xưng là ngân hàng",
              "Từ chối — không tổ chức hợp pháp nào yêu cầu mã OTP qua điện thoại",
              "Cung cấp nếu họ biết tên mình",
              "Tùy vào giọng điệu người gọi"
            ],
            "correctIndex": 1,
            "explanation": "Mã OTP không bao giờ nên được chia sẻ qua điện thoại với bất kỳ ai.",
            "competencyCode": "4.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Một ứng dụng đèn pin xin quyền truy cập danh bạ. Đây có phải dấu hiệu đáng ngờ không?",
            "options": [
              "Không, đây là điều bình thường",
              "Có, ứng dụng đèn pin không có lý do chính đáng cần quyền này",
              "Chỉ đáng ngờ nếu ứng dụng miễn phí",
              "Không cần quan tâm đến quyền ứng dụng"
            ],
            "correctIndex": 1,
            "explanation": "Quyền yêu cầu không liên quan đến chức năng ứng dụng là dấu hiệu cần cảnh giác.",
            "competencyCode": "4.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Khi nghi ngờ thông tin cá nhân bị lộ, bước đầu tiên nên làm là gì?",
            "options": [
              "Không làm gì, chờ xem có vấn đề gì xảy ra không",
              "Đổi mật khẩu tài khoản liên quan và bật xác thực hai lớp",
              "Xóa toàn bộ tài khoản",
              "Đổi số điện thoại ngay lập tức"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hành động phòng ngừa nhanh và hiệu quả nhất khi nghi ngờ có sự cố.",
            "competencyCode": "4.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Thông tin nào sau đây được coi là thông tin cá nhân?",
            "options": [
              "Giá sản phẩm của công ty",
              "Số điện thoại và địa chỉ nhà",
              "Tỷ giá ngoại tệ",
              "Thời tiết hôm nay"
            ],
            "correctIndex": 1,
            "explanation": "Đây là thông tin gắn liền và giúp xác định một cá nhân cụ thể.",
            "competencyCode": "4.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Dấu hiệu điển hình của một email lừa đảo là gì? A. Địa chỉ gửi chính xác 100% B. Tạo cảm giác khẩn cấp, yêu cầu cung cấp thông tin qua liên kết C. Không có yêu cầu hành động gì D. Gửi từ đồng nghiệp quen biết Đáp án: B — Tạo áp lực thời gian và yêu cầu hành động ngay là chiến thuật phổ biến của lừa đảo.",
          "2. Khi nhận được yêu cầu cung cấp mã OTP qua điện thoại, nên làm gì? A. Cung cấp ngay nếu người gọi tự xưng là ngân hàng B. Từ chối — không tổ chức hợp pháp nào yêu cầu mã OTP qua điện thoại C. Cung cấp nếu họ biết tên mình D. Tùy vào giọng điệu người gọi Đáp án: B — Mã OTP không bao giờ nên được chia sẻ qua điện thoại với bất kỳ ai.",
          "3. Một ứng dụng đèn pin xin quyền truy cập danh bạ. Đây có phải dấu hiệu đáng ngờ không? A. Không, đây là điều bình thường B. Có, ứng dụng đèn pin không có lý do chính đáng cần quyền này C. Chỉ đáng ngờ nếu ứng dụng miễn phí D. Không cần quan tâm đến quyền ứng dụng Đáp án: B — Quyền yêu cầu không liên quan đến chức năng ứng dụng là dấu hiệu cần cảnh giác.",
          "4. Khi nghi ngờ thông tin cá nhân bị lộ, bước đầu tiên nên làm là gì? A. Không làm gì, chờ xem có vấn đề gì xảy ra không B. Đổi mật khẩu tài khoản liên quan và bật xác thực hai lớp C. Xóa toàn bộ tài khoản D. Đổi số điện thoại ngay lập tức Đáp án: B — Đây là hành động phòng ngừa nhanh và hiệu quả nhất khi nghi ngờ có sự cố.",
          "5. Thông tin nào sau đây được coi là thông tin cá nhân? A. Giá sản phẩm của công ty B. Số điện thoại và địa chỉ nhà C. Tỷ giá ngoại tệ D. Thời tiết hôm nay Đáp án: B — Đây là thông tin gắn liền và giúp xác định một cá nhân cụ thể."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Sức khỏe khi làm việc với thiết bị số",
        "competencyCode": "4.3",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số",
          "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số",
          "Nhận biết được những công nghệ số đơn giản giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội"
        ],
        "definitions": [
          "An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số",
          "Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử",
          "Tư thế làm việc đúng: cách bố trí màn hình, ghế, bàn phím giúp giảm căng thẳng cơ thể khi làm việc lâu với máy tính",
          "Quá tải thông tin: trạng thái tiếp nhận quá nhiều thông báo, tin nhắn, email cùng lúc gây khó tập trung và căng thẳng"
        ],
        "body": [
          "Bảo vệ sức khỏe và an sinh số nghĩa là tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số — an sinh số là trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng.",
          "Tư thế làm việc đúng bắt đầu từ vị trí màn hình ngang tầm mắt, khoảng cách 50–70cm. Quy tắc 20-20-20 giúp giảm mỏi mắt: mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây. Bắt nạt trên mạng là hành vi có chủ đích xấu đe dọa, xúc phạm qua tin nhắn, mạng xã hội — cần nhận biết và bảo vệ bản thân khỏi nguy cơ này.",
          "Bên cạnh việc phòng tránh rủi ro, công nghệ số cũng có thể được dùng theo hướng tích cực để tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội — ví dụ các ứng dụng theo dõi giấc ngủ và vận động giúp duy trì thói quen lành mạnh, các nền tảng kết nối cộng đồng giúp người dùng tìm được nhóm hỗ trợ phù hợp, hoặc các công cụ thiền định/thư giãn trực tuyến giúp giảm căng thẳng. Nhận biết được những công nghệ này giúp người dùng chủ động sử dụng công nghệ số theo hướng có lợi cho sức khỏe tinh thần, không chỉ dừng ở việc phòng thủ trước rủi ro."
        ],
        "examples": [],
        "practice": "Chụp ảnh và đánh giá chỗ làm việc hiện tại theo danh mục kiểm tra dưới đây, thực hiện điều chỉnh và ghi lại. Danh mục kiểm tra chỗ làm việc: Tiêu chí Đạt (✓/✗) Mép trên màn hình ngang hoặc thấp hơn tầm mắt Khoảng cách mắt-màn hình 50–70cm Lưng được ghế hỗ trợ, không cúi gập Chân đặt phẳng trên sàn hoặc kệ Có đủ ánh sáng, không bị chói màn hình",
        "deliverable": "Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên).",
        "questions": [
          {
            "number": 1,
            "questionText": "Quy tắc 20-20-20 nghĩa là gì?",
            "options": [
              "Làm việc 20 phút nghỉ 20 giờ",
              "Mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây",
              "Nghỉ 20 phút mỗi 20 giờ làm việc",
              "Không có quy tắc như vậy"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc giúp giảm mỏi mắt khi làm việc lâu với màn hình.",
            "competencyCode": "4.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Vị trí màn hình đúng nên như thế nào?",
            "options": [
              "Cao hơn tầm mắt nhiều",
              "Mép trên ngang hoặc thấp hơn tầm mắt một chút",
              "Không quan trọng vị trí",
              "Càng gần mắt càng tốt"
            ],
            "correctIndex": 1,
            "explanation": "Vị trí này giúp giảm căng thẳng cổ và mắt khi làm việc lâu.",
            "competencyCode": "4.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Dấu hiệu nào cho thấy quá tải thông tin?",
            "options": [
              "Cảm thấy thư giãn khi kiểm tra điện thoại",
              "Khó tập trung vì liên tục bị gián đoạn bởi thông báo",
              "Không có thông báo nào",
              "Làm việc hiệu quả hơn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là dấu hiệu điển hình của quá tải thông tin.",
            "competencyCode": "4.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Vì sao nên tắt thông báo công việc ngoài giờ?",
            "options": [
              "Không cần thiết",
              "Giúp thiết lập ranh giới rõ ràng giữa làm việc và nghỉ ngơi",
              "Sẽ bị đánh giá là thiếu trách nhiệm",
              "Không có lợi ích gì"
            ],
            "correctIndex": 1,
            "explanation": "Ranh giới rõ ràng giúp bảo vệ thời gian nghỉ ngơi cần thiết.",
            "competencyCode": "4.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Khi căng thẳng công việc kéo dài, nên làm gì?",
            "options": [
              "Tự chịu đựng một mình",
              "Tìm đến sự hỗ trợ chuyên môn khi cần thiết",
              "Bỏ qua vì đây là chuyện bình thường",
              "Không nên chia sẻ với ai"
            ],
            "correctIndex": 1,
            "explanation": "Tìm hỗ trợ chuyên môn khi cần là hành động phù hợp và nên được khuyến khích.",
            "competencyCode": "4.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Quy tắc 20-20-20 nghĩa là gì? A. Làm việc 20 phút nghỉ 20 giờ B. Mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây C. Nghỉ 20 phút mỗi 20 giờ làm việc D. Không có quy tắc như vậy Đáp án: B — Đây là nguyên tắc giúp giảm mỏi mắt khi làm việc lâu với màn hình.",
          "2. Vị trí màn hình đúng nên như thế nào? A. Cao hơn tầm mắt nhiều B. Mép trên ngang hoặc thấp hơn tầm mắt một chút C. Không quan trọng vị trí D. Càng gần mắt càng tốt Đáp án: B — Vị trí này giúp giảm căng thẳng cổ và mắt khi làm việc lâu.",
          "3. Dấu hiệu nào cho thấy quá tải thông tin? A. Cảm thấy thư giãn khi kiểm tra điện thoại B. Khó tập trung vì liên tục bị gián đoạn bởi thông báo C. Không có thông báo nào D. Làm việc hiệu quả hơn Đáp án: B — Đây là dấu hiệu điển hình của quá tải thông tin.",
          "4. Vì sao nên tắt thông báo công việc ngoài giờ? A. Không cần thiết B. Giúp thiết lập ranh giới rõ ràng giữa làm việc và nghỉ ngơi C. Sẽ bị đánh giá là thiếu trách nhiệm D. Không có lợi ích gì Đáp án: B — Ranh giới rõ ràng giúp bảo vệ thời gian nghỉ ngơi cần thiết.",
          "5. Khi căng thẳng công việc kéo dài, nên làm gì? A. Tự chịu đựng một mình B. Tìm đến sự hỗ trợ chuyên môn khi cần thiết C. Bỏ qua vì đây là chuyện bình thường D. Không nên chia sẻ với ai Đáp án: B — Tìm hỗ trợ chuyên môn khi cần là hành động phù hợp và nên được khuyến khích."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Sử dụng công nghệ có ý thức môi trường",
        "competencyCode": "4.4",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường"
        ],
        "definitions": [
          "Vòng đời thiết bị: toàn bộ quá trình từ sản xuất, sử dụng đến thải bỏ một thiết bị điện tử",
          "Rác thải điện tử: thiết bị điện tử đã hỏng hoặc không còn sử dụng, cần được xử lý đúng cách để tránh ô nhiễm"
        ],
        "body": [
          "Bảo vệ môi trường nghĩa là nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Mỗi thiết bị điện tử đều có tác động môi trường trong suốt vòng đời: khai thác nguyên liệu, tiêu thụ năng lượng khi sử dụng, trở thành rác thải khi loại bỏ.",
          "Thói quen tiết kiệm năng lượng đơn giản gồm tắt máy tính khi không dùng, bật chế độ tiết kiệm năng lượng. Khi thiết bị cần thải bỏ, cần đưa đến điểm thu gom rác thải điện tử chuyên biệt và xóa sạch dữ liệu cá nhân trước khi thải bỏ."
        ],
        "examples": [],
        "practice": "Đánh giá thói quen sử dụng công nghệ của bản thân hoặc bộ phận trong một tuần, đề xuất 5 thay đổi khả thi và ước tính tác động.",
        "deliverable": "Bảng đánh giá thói quen và 5 đề xuất cải thiện.",
        "questions": [
          {
            "number": 1,
            "questionText": "Dịch vụ lưu trữ đám mây có tác động môi trường không?",
            "options": [
              "Không, vì không dùng thiết bị vật lý",
              "Có, vì trung tâm dữ liệu tiêu thụ năng lượng thực tế",
              "Chỉ có tác động nếu dùng miễn phí",
              "Không có cách nào đo lường được"
            ],
            "correctIndex": 1,
            "explanation": "Trung tâm dữ liệu vận hành đám mây vẫn tiêu thụ điện năng đáng kể trong thực tế.",
            "competencyCode": "4.4",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Vì sao nên xóa dữ liệu cá nhân trước khi thải bỏ thiết bị điện tử?",
            "options": [
              "Không cần thiết",
              "Để tránh rủi ro rò rỉ thông tin cá nhân",
              "Chỉ để tiết kiệm dung lượng",
              "Không có lý do liên quan bảo mật"
            ],
            "correctIndex": 1,
            "explanation": "Thiết bị thải bỏ có thể vẫn chứa dữ liệu nhạy cảm nếu không được xóa đúng cách.",
            "competencyCode": "4.4",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Rác thải điện tử nên được xử lý như thế nào?",
            "options": [
              "Bỏ chung với rác sinh hoạt",
              "Đưa đến điểm thu gom rác thải điện tử chuyên biệt",
              "Đốt tại nhà",
              "Không cần xử lý đặc biệt"
            ],
            "correctIndex": 1,
            "explanation": "Xử lý đúng cách giúp giảm ô nhiễm môi trường từ các chất độc hại trong thiết bị điện tử.",
            "competencyCode": "4.4",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Kéo dài tuổi thọ thiết bị bằng cách nào?",
            "options": [
              "Thay mới ngay khi có phiên bản mới",
              "Sửa chữa khi có thể thay vì thay mới ngay",
              "Không bảo trì thiết bị",
              "Sử dụng liên tục không nghỉ"
            ],
            "correctIndex": 1,
            "explanation": "Sửa chữa và bảo trì giúp kéo dài vòng đời thiết bị, giảm rác thải điện tử.",
            "competencyCode": "4.4",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì?",
            "options": [
              "Không có lợi ích gì",
              "Giảm phát thải gián tiếp từ việc đi lại",
              "Chỉ tiết kiệm thời gian",
              "Không liên quan đến môi trường"
            ],
            "correctIndex": 1,
            "explanation": "Giảm nhu cầu di chuyển góp phần giảm phát thải khí nhà kính gián tiếp.",
            "competencyCode": "4.4",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Dịch vụ lưu trữ đám mây có tác động môi trường không? A. Không, vì không dùng thiết bị vật lý B. Có, vì trung tâm dữ liệu tiêu thụ năng lượng thực tế C. Chỉ có tác động nếu dùng miễn phí D. Không có cách nào đo lường được Đáp án: B — Trung tâm dữ liệu vận hành đám mây vẫn tiêu thụ điện năng đáng kể trong thực tế.",
          "2. Vì sao nên xóa dữ liệu cá nhân trước khi thải bỏ thiết bị điện tử? A. Không cần thiết B. Để tránh rủi ro rò rỉ thông tin cá nhân C. Chỉ để tiết kiệm dung lượng D. Không có lý do liên quan bảo mật Đáp án: B — Thiết bị thải bỏ có thể vẫn chứa dữ liệu nhạy cảm nếu không được xóa đúng cách.",
          "3. Rác thải điện tử nên được xử lý như thế nào? A. Bỏ chung với rác sinh hoạt B. Đưa đến điểm thu gom rác thải điện tử chuyên biệt C. Đốt tại nhà D. Không cần xử lý đặc biệt Đáp án: B — Xử lý đúng cách giúp giảm ô nhiễm môi trường từ các chất độc hại trong thiết bị điện tử.",
          "4. Kéo dài tuổi thọ thiết bị bằng cách nào? A. Thay mới ngay khi có phiên bản mới B. Sửa chữa khi có thể thay vì thay mới ngay C. Không bảo trì thiết bị D. Sử dụng liên tục không nghỉ Đáp án: B — Sửa chữa và bảo trì giúp kéo dài vòng đời thiết bị, giảm rác thải điện tử.",
          "5. Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì? A. Không có lợi ích gì B. Giảm phát thải gián tiếp từ việc đi lại C. Chỉ tiết kiệm thời gian D. Không liên quan đến môi trường Đáp án: B — Giảm nhu cầu di chuyển góp phần giảm phát thải khí nhà kính gián tiếp."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M4-F",
      "brief": "Hoàn thành bộ kiểm tra an toàn số cá nhân: tài khoản, thiết bị, quyền ứng dụng, chỗ làm việc, thói quen sử dụng — kèm kế hoạch cải thiện.\nTiêu chí chấm:\nBảo mật tài khoản (mật khẩu, 2FA) được rà soát đầy đủ\nNhận diện đúng dấu hiệu lừa đảo trong bài tập\nĐánh giá chỗ làm việc và đề xuất cải thiện hợp lý\nThói quen sử dụng công nghệ có ý thức môi trường\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A4-I": {
    "code": "A4-I",
    "title": "AN TOÀN THÔNG TIN TRONG CÔNG VIỆC",
    "domainNumber": 4,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 4 module · 10 giờ · Tiên quyết: M4-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Bảo mật trong môi trường làm việc",
        "competencyCode": "4.1",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thiết lập được những cách thức bảo vệ thiết bị và nội dung số",
          "Phân biệt được rủi ro và mối đe dọa trong môi trường số",
          "Chọn lựa được các biện pháp an toàn và bảo mật",
          "Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư"
        ],
        "definitions": [
          "Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số",
          "Chính sách bảo mật doanh nghiệp: bộ quy định về cách nhân viên phải bảo vệ thông tin và hệ thống của công ty",
          "Sao lưu (backup): bản sao dữ liệu độc lập, không thay đổi theo bản gốc, dùng để khôi phục khi có sự cố",
          "Tấn công lừa đảo có chủ đích (spear phishing): hình thức lừa đảo được cá nhân hóa nhắm vào một người hoặc tổ chức cụ thể, thường có thông tin chính xác khiến nạn nhân dễ tin hơn"
        ],
        "body": [
          "Ở mức trung cấp, việc bảo vệ thiết bị và nội dung số mở rộng sang môi trường làm việc — áp dụng chính sách bảo mật doanh nghiệp: không chia sẻ tài khoản đăng nhập, không cài phần mềm ngoài danh sách được phê duyệt.",
          "Khi làm việc ngoài văn phòng, cần tránh dùng wifi công cộng không có mật khẩu để truy cập hệ thống công ty. Sự khác biệt quan trọng giữa đồng bộ và sao lưu: đồng bộ sẽ lan truyền cả những thay đổi không mong muốn, trong khi sao lưu là một bản sao độc lập. Tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường vì được cá nhân hóa — cách phòng vệ tốt nhất là luôn xác minh qua kênh khác khi nhận yêu cầu bất thường."
        ],
        "examples": [],
        "practice": "Lập danh mục kiểm tra bảo mật cho công việc của bộ phận mình, tự đánh giá và xác định 3 điểm yếu lớn nhất.",
        "deliverable": "Danh mục kiểm tra bảo mật và báo cáo tự đánh giá.",
        "questions": [
          {
            "number": 1,
            "questionText": "Sự khác biệt cốt lõi giữa đồng bộ và sao lưu là gì?",
            "options": [
              "Không có khác biệt",
              "Đồng bộ lan truyền cả thay đổi không mong muốn, sao lưu là bản sao độc lập",
              "Sao lưu nhanh hơn đồng bộ",
              "Đồng bộ an toàn hơn sao lưu"
            ],
            "correctIndex": 1,
            "explanation": "Đây là điểm khác biệt quan trọng cần hiểu để bảo vệ dữ liệu đúng cách.",
            "competencyCode": "4.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Khi nhận yêu cầu chuyển tiền gấp qua email từ “giám đốc”, dù nội dung rất thuyết phục, nên làm gì?",
            "options": [
              "Chuyển ngay để không trễ hạn",
              "Xác minh qua kênh khác (gọi điện trực tiếp) trước khi hành động",
              "Trả lời email hỏi thêm chi tiết",
              "Chuyển tiền một phần để giảm rủi ro"
            ],
            "correctIndex": 1,
            "explanation": "Xác minh qua kênh độc lập là biện pháp phòng vệ hiệu quả nhất với lừa đảo có chủ đích.",
            "competencyCode": "4.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường?",
            "options": [
              "Không nguy hiểm hơn",
              "Được cá nhân hóa với thông tin chính xác, khiến nạn nhân dễ tin hơn",
              "Chỉ nhắm vào doanh nghiệp lớn",
              "Dễ nhận biết hơn lừa đảo thông thường"
            ],
            "correctIndex": 1,
            "explanation": "Tính cá nhân hóa cao làm giảm khả năng nạn nhân nghi ngờ.",
            "competencyCode": "4.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi làm việc ở nơi công cộng với wifi không rõ nguồn gốc, nên làm gì?",
            "options": [
              "Kết nối bình thường để tiết kiệm dữ liệu di động",
              "Tránh truy cập hệ thống công ty, hoặc dùng VPN nếu bắt buộc",
              "Không có vấn đề gì cần lưu ý",
              "Chỉ cần tắt camera laptop"
            ],
            "correctIndex": 1,
            "explanation": "Wifi công cộng không an toàn có thể bị lợi dụng để đánh cắp dữ liệu truyền qua đó.",
            "competencyCode": "4.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Khi phát hiện sự cố bảo mật, nên làm gì?",
            "options": [
              "Tự xử lý một mình để tránh phiền phức",
              "Báo cáo ngay cho bộ phận phụ trách theo quy trình nội bộ",
              "Im lặng vì sợ bị trách",
              "Chỉ kể cho đồng nghiệp thân thiết"
            ],
            "correctIndex": 1,
            "explanation": "Báo cáo kịp thời giúp hạn chế thiệt hại và xử lý đúng quy trình.",
            "competencyCode": "4.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Sự khác biệt cốt lõi giữa đồng bộ và sao lưu là gì? A. Không có khác biệt B. Đồng bộ lan truyền cả thay đổi không mong muốn, sao lưu là bản sao độc lập C. Sao lưu nhanh hơn đồng bộ D. Đồng bộ an toàn hơn sao lưu Đáp án: B — Đây là điểm khác biệt quan trọng cần hiểu để bảo vệ dữ liệu đúng cách.",
          "2. Khi nhận yêu cầu chuyển tiền gấp qua email từ “giám đốc”, dù nội dung rất thuyết phục, nên làm gì? A. Chuyển ngay để không trễ hạn B. Xác minh qua kênh khác (gọi điện trực tiếp) trước khi hành động C. Trả lời email hỏi thêm chi tiết D. Chuyển tiền một phần để giảm rủi ro Đáp án: B — Xác minh qua kênh độc lập là biện pháp phòng vệ hiệu quả nhất với lừa đảo có chủ đích.",
          "3. Vì sao tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường? A. Không nguy hiểm hơn B. Được cá nhân hóa với thông tin chính xác, khiến nạn nhân dễ tin hơn C. Chỉ nhắm vào doanh nghiệp lớn D. Dễ nhận biết hơn lừa đảo thông thường Đáp án: B — Tính cá nhân hóa cao làm giảm khả năng nạn nhân nghi ngờ.",
          "4. Khi làm việc ở nơi công cộng với wifi không rõ nguồn gốc, nên làm gì? A. Kết nối bình thường để tiết kiệm dữ liệu di động B. Tránh truy cập hệ thống công ty, hoặc dùng VPN nếu bắt buộc C. Không có vấn đề gì cần lưu ý D. Chỉ cần tắt camera laptop Đáp án: B — Wifi công cộng không an toàn có thể bị lợi dụng để đánh cắp dữ liệu truyền qua đó.",
          "5. Khi phát hiện sự cố bảo mật, nên làm gì? A. Tự xử lý một mình để tránh phiền phức B. Báo cáo ngay cho bộ phận phụ trách theo quy trình nội bộ C. Im lặng vì sợ bị trách D. Chỉ kể cho đồng nghiệp thân thiết Đáp án: B — Báo cáo kịp thời giúp hạn chế thiệt hại và xử lý đúng quy trình."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Xử lý dữ liệu cá nhân trong công việc",
        "competencyCode": "4.2",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn",
          "Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân"
        ],
        "definitions": [
          "Dữ liệu cá nhân cơ bản: thông tin gắn liền hoặc giúp xác định một người, ví dụ họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ, hình ảnh (theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân)",
          "Dữ liệu cá nhân nhạy cảm: dữ liệu gắn liền với quyền riêng tư, khi bị xâm phạm sẽ ảnh hưởng trực tiếp đến quyền và lợi ích hợp pháp của cá nhân — ví dụ tình trạng sức khỏe, quan điểm chính trị, dữ liệu tài chính, dữ liệu sinh trắc học",
          "Sự đồng ý của chủ thể dữ liệu: việc chủ thể dữ liệu tự nguyện xác nhận đồng ý cho một hoặc nhiều mục đích xử lý dữ liệu cụ thể của mình"
        ],
        "body": [
          "Ở mức trung cấp, việc bảo vệ dữ liệu cá nhân mở rộng sang xử lý dữ liệu khách hàng trong công việc. Nguyên tắc thu thập tối thiểu là chỉ thu thập dữ liệu cá nhân thực sự cần thiết cho mục đích cụ thể, không thu thập “phòng khi cần”.",
          "Phân quyền truy cập theo mức nhạy cảm: dữ liệu cơ bản có thể được nhiều bộ phận truy cập theo nhu cầu, dữ liệu nhạy cảm cần giới hạn nghiêm ngặt hơn. Nên ẩn danh hoặc giả danh hóa khi phân tích để giảm rủi ro. Khách hàng có quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu cá nhân của họ — doanh nghiệp cần có quy trình xử lý các yêu cầu này."
        ],
        "examples": [],
        "practice": "Rà soát một tập dữ liệu công việc thật (hoặc dùng bảng mẫu ở trên làm điểm khởi đầu, bổ sung thêm 5–10 trường của dữ liệu thật bộ phận đang dùng), phân loại từng trường theo mức nhạy cảm, tạo bản trích xuất tối thiểu cho một mục đích phân tích cụ thể.",
        "deliverable": "Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình.",
        "questions": [
          {
            "number": 1,
            "questionText": "Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân thành mấy loại chính?",
            "options": [
              "Một loại duy nhất",
              "Hai loại: cơ bản và nhạy cảm",
              "Ba loại",
              "Không phân loại"
            ],
            "correctIndex": 1,
            "explanation": "Nghị định 13 phân dữ liệu cá nhân thành dữ liệu cơ bản và dữ liệu nhạy cảm.",
            "competencyCode": "4.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Nguyên tắc thu thập tối thiểu nghĩa là gì?",
            "options": [
              "Thu thập càng nhiều dữ liệu càng tốt",
              "Chỉ thu thập dữ liệu thực sự cần thiết cho mục đích cụ thể",
              "Không thu thập dữ liệu nào",
              "Chỉ áp dụng cho doanh nghiệp lớn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc cốt lõi trong bảo vệ dữ liệu cá nhân.",
            "competencyCode": "4.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Dán danh sách khách hàng vào một công cụ trực tuyến miễn phí chưa được phê duyệt có vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Là hình thức chuyển giao dữ liệu ra ngoài kiểm soát, tiềm ẩn rủi ro vi phạm",
              "Chỉ có vấn đề nếu công cụ đó tính phí",
              "Luôn an toàn nếu công cụ có tên tuổi"
            ],
            "correctIndex": 1,
            "explanation": "Dữ liệu cá nhân được đưa ra ngoài hệ thống được kiểm soát là rủi ro tuân thủ nghiêm trọng.",
            "competencyCode": "4.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khách hàng có quyền gì đối với dữ liệu cá nhân của họ?",
            "options": [
              "Không có quyền gì",
              "Quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu",
              "Chỉ có quyền xem, không được yêu cầu sửa",
              "Chỉ áp dụng cho khách hàng VIP"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các quyền cơ bản của chủ thể dữ liệu.",
            "competencyCode": "4.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Sự đồng ý của chủ thể dữ liệu cần có đặc điểm gì?",
            "options": [
              "Có thể dùng một lần đồng ý chung cho mọi mục đích mãi mãi",
              "Rõ ràng, cụ thể cho từng mục đích sử dụng",
              "Không cần thiết nếu doanh nghiệp nhỏ",
              "Chỉ cần đồng ý bằng miệng"
            ],
            "correctIndex": 1,
            "explanation": "Đồng ý chung chung không đáp ứng yêu cầu về tính cụ thể cho từng mục đích.",
            "competencyCode": "4.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân thành mấy loại chính? A. Một loại duy nhất B. Hai loại: cơ bản và nhạy cảm C. Ba loại D. Không phân loại Đáp án: B — Nghị định 13 phân dữ liệu cá nhân thành dữ liệu cơ bản và dữ liệu nhạy cảm.",
          "2. Nguyên tắc thu thập tối thiểu nghĩa là gì? A. Thu thập càng nhiều dữ liệu càng tốt B. Chỉ thu thập dữ liệu thực sự cần thiết cho mục đích cụ thể C. Không thu thập dữ liệu nào D. Chỉ áp dụng cho doanh nghiệp lớn Đáp án: B — Đây là nguyên tắc cốt lõi trong bảo vệ dữ liệu cá nhân.",
          "3. Dán danh sách khách hàng vào một công cụ trực tuyến miễn phí chưa được phê duyệt có vấn đề gì? A. Không có vấn đề gì B. Là hình thức chuyển giao dữ liệu ra ngoài kiểm soát, tiềm ẩn rủi ro vi phạm C. Chỉ có vấn đề nếu công cụ đó tính phí D. Luôn an toàn nếu công cụ có tên tuổi Đáp án: B — Dữ liệu cá nhân được đưa ra ngoài hệ thống được kiểm soát là rủi ro tuân thủ nghiêm trọng.",
          "4. Khách hàng có quyền gì đối với dữ liệu cá nhân của họ? A. Không có quyền gì B. Quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu C. Chỉ có quyền xem, không được yêu cầu sửa D. Chỉ áp dụng cho khách hàng VIP Đáp án: B — Đây là các quyền cơ bản của chủ thể dữ liệu.",
          "5. Sự đồng ý của chủ thể dữ liệu cần có đặc điểm gì? A. Có thể dùng một lần đồng ý chung cho mọi mục đích mãi mãi B. Rõ ràng, cụ thể cho từng mục đích sử dụng C. Không cần thiết nếu doanh nghiệp nhỏ D. Chỉ cần đồng ý bằng miệng Đáp án: B — Đồng ý chung chung không đáp ứng yêu cầu về tính cụ thể cho từng mục đích."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Cân bằng số và sức khỏe nghề nghiệp",
        "competencyCode": "4.3",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần",
          "Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số",
          "Thảo luận về những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội"
        ],
        "definitions": [
          "An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số",
          "Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử",
          "Làm việc theo khối thời gian (time blocking): kỹ thuật dành các khoảng thời gian cố định trong lịch cho từng loại công việc cụ thể, giảm việc chuyển đổi liên tục giữa các nhiệm vụ",
          "Chi phí chuyển đổi ngữ cảnh: thời gian và năng lượng tinh thần bị mất khi chuyển đổi qua lại giữa các công việc khác nhau",
          "Kiệt sức nghề nghiệp (burnout): trạng thái kiệt quệ về thể chất và tinh thần do căng thẳng công việc kéo dài"
        ],
        "body": [
          "Ở mức trung cấp, việc bảo vệ sức khỏe và an sinh số mở rộng sang quản lý thói quen làm việc bền vững. Quản lý thông báo hiệu quả bắt đầu từ việc phân loại: thông báo nào cần phản hồi ngay, thông báo nào có thể gộp lại kiểm tra theo khung giờ cố định.",
          "Làm việc theo khối thời gian giúp tránh chi phí chuyển đổi ngữ cảnh — năng suất giảm mỗi lần bị gián đoạn. Dấu hiệu kiệt sức cần được nhận biết sớm: mệt mỏi kéo dài, mất hứng thú với công việc, dễ cáu gắt. Xây dựng quy ước nhóm rõ ràng về thời gian phản hồi kỳ vọng giúp giảm áp lực ngầm về việc phải phản hồi ngay lập tức ngoài giờ.",
          "Đa nhiệm liên tục — cố gắng làm nhiều việc cùng lúc như vừa họp vừa trả lời email vừa nhắn tin — tạo cảm giác bận rộn nhưng thực chất làm giảm chất lượng và tốc độ hoàn thành công việc so với làm tuần tự từng việc, vì mỗi lần chuyển đổi đều phát sinh chi phí chuyển đổi ngữ cảnh nêu trên.",
          "Ở mức này, việc thảo luận về công nghệ số giúp tăng cường thịnh vượng xã hội cần gắn với bối cảnh công việc cụ thể hơn — ví dụ đánh giá xem công cụ theo dõi khối lượng công việc nhóm có giúp phát hiện sớm dấu hiệu quá tải của đồng nghiệp không, hoặc kênh giao tiếp nội bộ có tạo không gian để nhân viên chia sẻ khó khăn và nhận hỗ trợ kịp thời không. Việc chọn lựa công cụ số có chủ đích cho mục đích này khác với việc chỉ dùng công nghệ theo thói quen."
        ],
        "examples": [],
        "practice": "Theo dõi thói quen số trong 3 ngày làm việc (ghi lại: số lần bị ngắt quãng bởi thông báo, thời gian phản hồi công việc ngoài giờ nếu có), phân tích và đề xuất quy ước cho nhóm.",
        "deliverable": "Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm.",
        "questions": [
          {
            "number": 1,
            "questionText": "Chi phí chuyển đổi ngữ cảnh là gì?",
            "options": [
              "Chi phí mua phần mềm mới",
              "Thời gian và năng lượng mất khi chuyển đổi qua lại giữa các công việc khác nhau",
              "Chi phí đào tạo nhân viên",
              "Không có khái niệm này"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hiện tượng năng suất giảm mỗi khi phải chuyển đổi sự tập trung giữa các nhiệm vụ.",
            "competencyCode": "4.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Làm việc theo khối thời gian có lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Giảm chi phí chuyển đổi ngữ cảnh, tăng khả năng tập trung sâu",
              "Chỉ phù hợp với công việc đơn giản",
              "Làm chậm tiến độ công việc"
            ],
            "correctIndex": 1,
            "explanation": "Dành thời gian liên tục cho một việc giúp tránh gián đoạn và tăng hiệu quả.",
            "competencyCode": "4.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Dấu hiệu nào có thể cho thấy một người đang kiệt sức nghề nghiệp?",
            "options": [
              "Năng suất làm việc tăng đều",
              "Mệt mỏi kéo dài không hồi phục, mất hứng thú với công việc",
              "Luôn vui vẻ và năng động",
              "Không có dấu hiệu cụ thể nào"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các dấu hiệu điển hình cần được chú ý và can thiệp sớm.",
            "competencyCode": "4.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Vì sao nên xây dựng quy ước nhóm về thời gian phản hồi?",
            "options": [
              "Không cần thiết",
              "Giảm áp lực ngầm về kỳ vọng phản hồi tức thời ngoài giờ",
              "Chỉ để có văn bản chính thức",
              "Làm chậm công việc nhóm"
            ],
            "correctIndex": 1,
            "explanation": "Quy ước rõ ràng giúp mọi người không cảm thấy áp lực phải phản hồi ngay lập tức mọi lúc.",
            "competencyCode": "4.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Đa nhiệm liên tục (làm nhiều việc cùng lúc) thường dẫn đến điều gì?",
            "options": [
              "Tăng chất lượng công việc",
              "Giảm chất lượng và tốc độ hoàn thành so với làm tuần tự",
              "Không ảnh hưởng gì đến hiệu suất",
              "Luôn hiệu quả hơn làm từng việc"
            ],
            "correctIndex": 1,
            "explanation": "Nghiên cứu về năng suất cho thấy đa nhiệm liên tục thường làm giảm hiệu quả thực tế dù tạo cảm giác bận rộn.",
            "competencyCode": "4.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Chi phí chuyển đổi ngữ cảnh là gì? A. Chi phí mua phần mềm mới B. Thời gian và năng lượng mất khi chuyển đổi qua lại giữa các công việc khác nhau C. Chi phí đào tạo nhân viên D. Không có khái niệm này Đáp án: B — Đây là hiện tượng năng suất giảm mỗi khi phải chuyển đổi sự tập trung giữa các nhiệm vụ.",
          "2. Làm việc theo khối thời gian có lợi ích gì? A. Không có lợi ích cụ thể B. Giảm chi phí chuyển đổi ngữ cảnh, tăng khả năng tập trung sâu C. Chỉ phù hợp với công việc đơn giản D. Làm chậm tiến độ công việc Đáp án: B — Dành thời gian liên tục cho một việc giúp tránh gián đoạn và tăng hiệu quả.",
          "3. Dấu hiệu nào có thể cho thấy một người đang kiệt sức nghề nghiệp? A. Năng suất làm việc tăng đều B. Mệt mỏi kéo dài không hồi phục, mất hứng thú với công việc C. Luôn vui vẻ và năng động D. Không có dấu hiệu cụ thể nào Đáp án: B — Đây là các dấu hiệu điển hình cần được chú ý và can thiệp sớm.",
          "4. Vì sao nên xây dựng quy ước nhóm về thời gian phản hồi? A. Không cần thiết B. Giảm áp lực ngầm về kỳ vọng phản hồi tức thời ngoài giờ C. Chỉ để có văn bản chính thức D. Làm chậm công việc nhóm Đáp án: B — Quy ước rõ ràng giúp mọi người không cảm thấy áp lực phải phản hồi ngay lập tức mọi lúc.",
          "5. Đa nhiệm liên tục (làm nhiều việc cùng lúc) thường dẫn đến điều gì? A. Tăng chất lượng công việc B. Giảm chất lượng và tốc độ hoàn thành so với làm tuần tự C. Không ảnh hưởng gì đến hiệu suất D. Luôn hiệu quả hơn làm từng việc Đáp án: B — Nghiên cứu về năng suất cho thấy đa nhiệm liên tục thường làm giảm hiệu quả thực tế dù tạo cảm giác bận rộn."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Vận hành số bền vững",
        "competencyCode": "4.4",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số"
        ],
        "definitions": [
          "Kiểm kê tác động số: quá trình liệt kê và đánh giá mức độ tiêu thụ tài nguyên số (lưu trữ, thiết bị, in ấn) của một bộ phận hoặc tổ chức",
          "Dữ liệu quá hạn: dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ, gây lãng phí tài nguyên"
        ],
        "body": [
          "Ở mức trung cấp, việc bảo vệ môi trường khỏi tác động công nghệ số mở rộng sang vận hành số bền vững ở cấp bộ phận. Kiểm kê tác động số của bộ phận là bước đầu để tối ưu: xác định dung lượng lưu trữ, số lượng thiết bị, khối lượng in ấn.",
          "Tối ưu lưu trữ bao gồm loại bỏ dữ liệu trùng lặp, các bản sao không cần thiết, và dữ liệu quá hạn. Xây dựng quy trình ít giấy đòi hỏi ưu tiên ký số thay vì in ra ký tay. Khi mua sắm thiết bị mới, tiêu chí bền vững có thể bao gồm độ bền, khả năng nâng cấp, và chính sách thu hồi tái chế của nhà sản xuất."
        ],
        "examples": [],
        "practice": "Kiểm kê tài nguyên số của bộ phận (dung lượng lưu trữ, tài liệu trùng lặp, lượng in ấn trong một tháng), đề xuất kế hoạch tối ưu và ước tính tác động.",
        "deliverable": "Báo cáo kiểm kê và kế hoạch tối ưu.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bước đầu tiên để tối ưu tài nguyên số của một bộ phận là gì?",
            "options": [
              "Mua thiết bị mới ngay",
              "Kiểm kê hiện trạng để có cơ sở đặt mục tiêu cụ thể",
              "Xóa toàn bộ dữ liệu cũ ngay lập tức",
              "Không cần bước chuẩn bị nào"
            ],
            "correctIndex": 1,
            "explanation": "Kiểm kê cho dữ liệu cụ thể để đặt mục tiêu cải thiện, thay vì hành động chung chung.",
            "competencyCode": "4.4",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Dữ liệu quá hạn là gì?",
            "options": [
              "Dữ liệu mới được tạo",
              "Dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ",
              "Dữ liệu đang được sử dụng tích cực",
              "Dữ liệu đã được sao lưu"
            ],
            "correctIndex": 1,
            "explanation": "Đây là loại dữ liệu cần được rà soát và loại bỏ để tối ưu tài nguyên lưu trữ.",
            "competencyCode": "4.4",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Tiêu chí bền vững khi mua sắm thiết bị mới có thể bao gồm gì?",
            "options": [
              "Chỉ quan tâm giá rẻ nhất",
              "Độ bền, khả năng nâng cấp, hiệu suất năng lượng, chính sách tái chế",
              "Chỉ quan tâm thương hiệu nổi tiếng",
              "Không có tiêu chí đặc biệt nào"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các yếu tố giúp đánh giá tính bền vững của việc mua sắm thiết bị.",
            "competencyCode": "4.4",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Vì sao nên ưu tiên ký số thay vì in ra ký tay khi có thể?",
            "options": [
              "Không có lý do cụ thể",
              "Giảm nhu cầu in ấn, góp phần vận hành ít giấy hơn",
              "Ký số luôn có giá trị pháp lý cao hơn",
              "Chỉ để tiết kiệm thời gian"
            ],
            "correctIndex": 1,
            "explanation": "Đây là một cách thực hành cụ thể để giảm sử dụng giấy trong công việc hàng ngày.",
            "competencyCode": "4.4",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Truyền thông nội bộ về thực hành bền vững có tác dụng gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Duy trì động lực thay đổi thói quen lâu dài",
              "Chỉ để báo cáo hình thức",
              "Làm chậm công việc của bộ phận"
            ],
            "correctIndex": 1,
            "explanation": "Chia sẻ kết quả và ghi nhận nỗ lực giúp duy trì sự thay đổi bền vững thay vì chỉ là hoạt động một lần.",
            "competencyCode": "4.4",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Bước đầu tiên để tối ưu tài nguyên số của một bộ phận là gì? A. Mua thiết bị mới ngay B. Kiểm kê hiện trạng để có cơ sở đặt mục tiêu cụ thể C. Xóa toàn bộ dữ liệu cũ ngay lập tức D. Không cần bước chuẩn bị nào Đáp án: B — Kiểm kê cho dữ liệu cụ thể để đặt mục tiêu cải thiện, thay vì hành động chung chung.",
          "2. Dữ liệu quá hạn là gì? A. Dữ liệu mới được tạo B. Dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ C. Dữ liệu đang được sử dụng tích cực D. Dữ liệu đã được sao lưu Đáp án: B — Đây là loại dữ liệu cần được rà soát và loại bỏ để tối ưu tài nguyên lưu trữ.",
          "3. Tiêu chí bền vững khi mua sắm thiết bị mới có thể bao gồm gì? A. Chỉ quan tâm giá rẻ nhất B. Độ bền, khả năng nâng cấp, hiệu suất năng lượng, chính sách tái chế C. Chỉ quan tâm thương hiệu nổi tiếng D. Không có tiêu chí đặc biệt nào Đáp án: B — Đây là các yếu tố giúp đánh giá tính bền vững của việc mua sắm thiết bị.",
          "4. Vì sao nên ưu tiên ký số thay vì in ra ký tay khi có thể? A. Không có lý do cụ thể B. Giảm nhu cầu in ấn, góp phần vận hành ít giấy hơn C. Ký số luôn có giá trị pháp lý cao hơn D. Chỉ để tiết kiệm thời gian Đáp án: B — Đây là một cách thực hành cụ thể để giảm sử dụng giấy trong công việc hàng ngày.",
          "5. Truyền thông nội bộ về thực hành bền vững có tác dụng gì? A. Không có tác dụng thực tế B. Duy trì động lực thay đổi thói quen lâu dài C. Chỉ để báo cáo hình thức D. Làm chậm công việc của bộ phận Đáp án: B — Chia sẻ kết quả và ghi nhận nỗ lực giúp duy trì sự thay đổi bền vững thay vì chỉ là hoạt động một lần."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M4-I",
      "brief": "Xây dựng bộ thực hành an toàn và bền vững cho bộ phận: danh mục kiểm tra bảo mật, quy trình xử lý dữ liệu cá nhân, quy ước làm việc, kế hoạch tối ưu tài nguyên.\nTiêu chí chấm:\nDanh mục kiểm tra bảo mật đầy đủ, thực tế\nPhân loại và xử lý dữ liệu cá nhân đúng nguyên tắc\nQuy ước làm việc tôn trọng cân bằng số\nKế hoạch tối ưu tài nguyên khả thi\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A4-A": {
    "code": "A4-A",
    "title": "QUẢN TRỊ AN TOÀN VÀ TRÁCH NHIỆM SỐ",
    "domainNumber": 4,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 4 module · 12 giờ · Tiên quyết: M4-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Quản trị an toàn thông tin doanh nghiệp",
        "competencyCode": "4.1",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số",
          "Phân biệt được rủi ro và mối đe dọa trong môi trường số",
          "Chọn lựa được các biện pháp an toàn và bảo mật phù hợp nhất",
          "Đánh giá được các biện pháp để quan tâm đến mức độ tin cậy và quyền riêng tư một cách phù hợp nhất"
        ],
        "definitions": [
          "Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số",
          "Đánh giá rủi ro an toàn thông tin: quá trình xác định các mối đe dọa, khả năng xảy ra và mức độ tác động lên hệ thống thông tin của tổ chức",
          "Kế hoạch khôi phục hoạt động: kế hoạch xác định cách tổ chức tiếp tục hoạt động và khôi phục hệ thống sau một sự cố nghiêm trọng"
        ],
        "body": [
          "Ở mức nâng cao, việc chọn lựa cách bảo vệ phù hợp nhất cho thiết bị và nội dung số mở rộng thành quản trị an toàn thông tin cấp doanh nghiệp — đánh giá rủi ro cần xem xét toàn diện: hệ thống nào quan trọng nhất, mối đe dọa nào có khả năng xảy ra cao.",
          "Sổ rủi ro tổng hợp các rủi ro đã xác định, với bốn lựa chọn xử lý: tránh, giảm, chuyển, chấp nhận. Chính sách an toàn thông tin cấp tổ chức cần nêu rõ phạm vi, vai trò trách nhiệm, và chế tài khi vi phạm. Rủi ro từ nhà cung cấp và bên thứ ba cần được đánh giá riêng vì an toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan.",
          "Phần lớn sự cố bảo mật trong thực tế bắt nguồn từ lỗi con người — bấm nhầm liên kết lừa đảo, dùng mật khẩu yếu, cấu hình sai quyền truy cập — nhiều hơn là từ tấn công kỹ thuật tinh vi. Đây là lý do chương trình đào tạo nhận thức an toàn định kỳ cho toàn thể nhân viên là một biện pháp phòng ngừa quan trọng ngang với đầu tư công nghệ."
        ],
        "examples": [],
        "practice": "Xây bộ hồ sơ quản trị an toàn cho doanh nghiệp: sổ rủi ro tối thiểu 8 mục có chấm điểm (dùng bảng mẫu dưới), ma trận phân quyền, quy trình ứng phó sự cố. Bảng mẫu sổ rủi ro (điền theo tình huống thật của doanh nghiệp): Rủi ro Khả năng (1-5) Tác động (1-5) Điểm Biện pháp Người phụ trách Ví dụ: Nhân viên nghỉ việc vẫn còn quyền truy cập hệ thống 4 4 16 Giảm — quy trình thu hồi quyền ngay ngày nghỉ việc Trưởng phòng Nhân sự",
        "deliverable": "Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo.",
        "questions": [
          {
            "number": 1,
            "questionText": "Bốn lựa chọn xử lý rủi ro trong quản trị an toàn thông tin là gì?",
            "options": [
              "Tránh, giảm, chuyển, chấp nhận",
              "Xóa, sửa, thêm, giữ nguyên",
              "Cao, trung bình, thấp, không có",
              "Nhanh, chậm, tức thời, định kỳ"
            ],
            "correctIndex": 0,
            "explanation": "Đây là bốn cách tiếp cận chuẩn để xử lý một rủi ro đã xác định.",
            "competencyCode": "4.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Điểm hở bảo mật phổ biến nhất trong thực tế thường liên quan đến điều gì?",
            "options": [
              "Lỗi phần cứng",
              "Quyền truy cập không được thu hồi khi nhân sự rời đi",
              "Lỗi mạng",
              "Thiết bị quá mới"
            ],
            "correctIndex": 1,
            "explanation": "Đây là một trong những nguyên nhân phổ biến nhất gây rò rỉ an toàn thông tin trong tổ chức.",
            "competencyCode": "4.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Vì sao cần đánh giá rủi ro từ nhà cung cấp và bên thứ ba?",
            "options": [
              "Không cần thiết",
              "An toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan",
              "Chỉ cần quan tâm hệ thống nội bộ",
              "Nhà cung cấp luôn an toàn tuyệt đối"
            ],
            "correctIndex": 1,
            "explanation": "Bên thứ ba có quyền truy cập hệ thống cũng là một nguồn rủi ro cần được quản lý.",
            "competencyCode": "4.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Phần lớn sự cố bảo mật bắt nguồn từ đâu?",
            "options": [
              "Chỉ từ lỗi kỹ thuật thuần túy",
              "Lỗi con người, như bấm nhầm liên kết hoặc dùng mật khẩu yếu",
              "Luôn từ tấn công có chủ đích tinh vi",
              "Không có nguyên nhân cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là lý do đào tạo nhận thức an toàn cho nhân viên là biện pháp phòng ngừa quan trọng.",
            "competencyCode": "4.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "“Chấp nhận rủi ro” trong quản trị an toàn thông tin nghĩa là gì?",
            "options": [
              "Bỏ qua rủi ro mà không xem xét",
              "Quyết định có chủ đích không hành động khi chi phí phòng ngừa vượt lợi ích, được ghi nhận rõ ràng",
              "Luôn là lựa chọn sai",
              "Không áp dụng được trong thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Chấp nhận là một lựa chọn hợp lý khi được cân nhắc và ghi nhận có chủ đích, khác với việc bỏ qua không xem xét.",
            "competencyCode": "4.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Bốn lựa chọn xử lý rủi ro trong quản trị an toàn thông tin là gì? A. Tránh, giảm, chuyển, chấp nhận B. Xóa, sửa, thêm, giữ nguyên C. Cao, trung bình, thấp, không có D. Nhanh, chậm, tức thời, định kỳ Đáp án: A — Đây là bốn cách tiếp cận chuẩn để xử lý một rủi ro đã xác định.",
          "2. Điểm hở bảo mật phổ biến nhất trong thực tế thường liên quan đến điều gì? A. Lỗi phần cứng B. Quyền truy cập không được thu hồi khi nhân sự rời đi C. Lỗi mạng D. Thiết bị quá mới Đáp án: B — Đây là một trong những nguyên nhân phổ biến nhất gây rò rỉ an toàn thông tin trong tổ chức.",
          "3. Vì sao cần đánh giá rủi ro từ nhà cung cấp và bên thứ ba? A. Không cần thiết B. An toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan C. Chỉ cần quan tâm hệ thống nội bộ D. Nhà cung cấp luôn an toàn tuyệt đối Đáp án: B — Bên thứ ba có quyền truy cập hệ thống cũng là một nguồn rủi ro cần được quản lý.",
          "4. Phần lớn sự cố bảo mật bắt nguồn từ đâu? A. Chỉ từ lỗi kỹ thuật thuần túy B. Lỗi con người, như bấm nhầm liên kết hoặc dùng mật khẩu yếu C. Luôn từ tấn công có chủ đích tinh vi D. Không có nguyên nhân cụ thể Đáp án: B — Đây là lý do đào tạo nhận thức an toàn cho nhân viên là biện pháp phòng ngừa quan trọng.",
          "5. “Chấp nhận rủi ro” trong quản trị an toàn thông tin nghĩa là gì? A. Bỏ qua rủi ro mà không xem xét B. Quyết định có chủ đích không hành động khi chi phí phòng ngừa vượt lợi ích, được ghi nhận rõ ràng C. Luôn là lựa chọn sai D. Không áp dụng được trong thực tế Đáp án: B — Chấp nhận là một lựa chọn hợp lý khi được cân nhắc và ghi nhận có chủ đích, khác với việc bỏ qua không xem xét."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Tuân thủ bảo vệ dữ liệu cá nhân",
        "competencyCode": "4.2",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân",
          "Đánh giá mức độ phù hợp của các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân"
        ],
        "definitions": [
          "Bản đồ luồng dữ liệu: tài liệu mô tả dữ liệu cá nhân được thu thập ở đâu, lưu trữ ở đâu, ai truy cập, và được chuyển giao cho ai",
          "Đánh giá tác động xử lý dữ liệu cá nhân: quá trình phân tích rủi ro khi xử lý dữ liệu cá nhân quy mô lớn hoặc dữ liệu nhạy cảm, nhằm giảm thiểu rủi ro trước khi triển khai",
          "Bên xử lý dữ liệu: tổ chức hoặc cá nhân xử lý dữ liệu cá nhân thay mặt cho bên kiểm soát dữ liệu theo hợp đồng hoặc thỏa thuận"
        ],
        "body": [
          "Ở mức nâng cao, việc bảo vệ dữ liệu cá nhân mở rộng thành chương trình tuân thủ cấp tổ chức, căn cứ theo cả Nghị định 13/2023/NĐ-CP (có hiệu lực từ 1/7/2023) và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực từ 1/1/2026). Lập bản đồ luồng dữ liệu cá nhân là bước nền tảng: xác định dữ liệu thu thập ở đâu, lưu trữ ở đâu, ai có quyền truy cập, có chuyển giao cho bên thứ ba nào không.",
          "Đánh giá tác động xử lý dữ liệu cá nhân nên được thực hiện khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm. Quy trình tiếp nhận và xử lý yêu cầu của chủ thể dữ liệu cần có kênh tiếp nhận rõ ràng và thời hạn xử lý xác định, cùng nghĩa vụ thông báo sự cố trong 72 giờ theo quy định."
        ],
        "examples": [],
        "practice": "Lập bản đồ luồng dữ liệu cá nhân cho một quy trình nghiệp vụ thật của doanh nghiệp (ví dụ: quy trình từ khách hàng đăng ký đến hoàn tất đơn hàng), xác định các điểm rủi ro tuân thủ và đề xuất biện pháp khắc phục.",
        "deliverable": "Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục.",
        "questions": [
          {
            "number": 1,
            "questionText": "Nghị định 13/2023/NĐ-CP có hiệu lực từ khi nào?",
            "options": [
              "1/1/2023",
              "1/7/2023",
              "1/1/2024",
              "1/7/2024"
            ],
            "correctIndex": 1,
            "explanation": "Nghị định 13/2023/NĐ-CP có hiệu lực thi hành từ ngày 1/7/",
            "competencyCode": "4.2",
            "level": 3
          },
          {
            "number": 2023,
            "questionText": "2. Bản đồ luồng dữ liệu cần thể hiện những thông tin gì?",
            "options": [
              "Chỉ cần biết dữ liệu tồn tại",
              "Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển giao cho ai",
              "Chỉ cần biết số lượng bản ghi",
              "Chỉ cần biết định dạng tệp"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các thông tin cốt lõi cần có trong một bản đồ luồng dữ liệu đầy đủ.",
            "competencyCode": "4.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu cá nhân?",
            "options": [
              "Không bao giờ cần thiết",
              "Khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm",
              "Chỉ khi có sự cố xảy ra",
              "Chỉ áp dụng cho doanh nghiệp nước ngoài"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá trước khi triển khai giúp giảm thiểu rủi ro chủ động thay vì xử lý sau sự cố.",
            "competencyCode": "4.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao cần có hợp đồng rõ ràng với bên xử lý dữ liệu bên ngoài?",
            "options": [
              "Không cần thiết nếu tin tưởng đối tác",
              "Quy định rõ trách nhiệm bảo vệ dữ liệu, không chỉ dựa vào lòng tin",
              "Chỉ để tăng chi phí hợp đồng",
              "Chỉ cần thỏa thuận miệng"
            ],
            "correctIndex": 1,
            "explanation": "Hợp đồng rõ ràng là căn cứ pháp lý và thực tiễn để đảm bảo bên xử lý tuân thủ đúng yêu cầu.",
            "competencyCode": "4.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Chuyển dữ liệu cá nhân ra nước ngoài (ví dụ lưu trên máy chủ đám mây quốc tế) cần lưu ý điều gì?",
            "options": [
              "Không cần lưu ý gì đặc biệt",
              "Có yêu cầu riêng theo quy định hiện hành tại Việt Nam, nên tham vấn pháp lý cụ thể",
              "Luôn bị cấm hoàn toàn",
              "Chỉ áp dụng cho dữ liệu công khai"
            ],
            "correctIndex": 1,
            "explanation": "Đây là điểm có yêu cầu riêng biệt cần được tư vấn pháp lý cụ thể trước khi triển khai.",
            "competencyCode": "4.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Nghị định 13/2023/NĐ-CP có hiệu lực từ khi nào? A. 1/1/2023 B. 1/7/2023 C. 1/1/2024 D. 1/7/2024 Đáp án: B — Nghị định 13/2023/NĐ-CP có hiệu lực thi hành từ ngày 1/7/2023.",
          "2. Bản đồ luồng dữ liệu cần thể hiện những thông tin gì? A. Chỉ cần biết dữ liệu tồn tại B. Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển giao cho ai C. Chỉ cần biết số lượng bản ghi D. Chỉ cần biết định dạng tệp Đáp án: B — Đây là các thông tin cốt lõi cần có trong một bản đồ luồng dữ liệu đầy đủ.",
          "3. Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu cá nhân? A. Không bao giờ cần thiết B. Khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm C. Chỉ khi có sự cố xảy ra D. Chỉ áp dụng cho doanh nghiệp nước ngoài Đáp án: B — Đánh giá trước khi triển khai giúp giảm thiểu rủi ro chủ động thay vì xử lý sau sự cố.",
          "4. Vì sao cần có hợp đồng rõ ràng với bên xử lý dữ liệu bên ngoài? A. Không cần thiết nếu tin tưởng đối tác B. Quy định rõ trách nhiệm bảo vệ dữ liệu, không chỉ dựa vào lòng tin C. Chỉ để tăng chi phí hợp đồng D. Chỉ cần thỏa thuận miệng Đáp án: B — Hợp đồng rõ ràng là căn cứ pháp lý và thực tiễn để đảm bảo bên xử lý tuân thủ đúng yêu cầu.",
          "5. Chuyển dữ liệu cá nhân ra nước ngoài (ví dụ lưu trên máy chủ đám mây quốc tế) cần lưu ý điều gì? A. Không cần lưu ý gì đặc biệt B. Có yêu cầu riêng theo quy định hiện hành tại Việt Nam, nên tham vấn pháp lý cụ thể C. Luôn bị cấm hoàn toàn D. Chỉ áp dụng cho dữ liệu công khai Đáp án: B — Đây là điểm có yêu cầu riêng biệt cần được tư vấn pháp lý cụ thể trước khi triển khai."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Chính sách phúc lợi số của tổ chức",
        "competencyCode": "4.3",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số",
          "Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số",
          "Linh hoạt trong cách sử dụng những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội"
        ],
        "definitions": [
          "An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số",
          "Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử",
          "Quyền ngắt kết nối: khái niệm về quyền của nhân viên được không phải phản hồi công việc ngoài giờ làm việc đã thỏa thuận",
          "Khả năng tiếp cận (accessibility): mức độ công cụ và tài liệu số có thể được sử dụng bởi người có những khả năng khác nhau, bao gồm người khuyết tật"
        ],
        "body": [
          "Ở mức nâng cao, việc bảo vệ sức khỏe và an sinh số mở rộng thành chính sách an sinh số cấp tổ chức. Khảo sát trải nghiệm làm việc số của nhân viên định kỳ giúp tổ chức nắm bắt vấn đề trước khi trở nên nghiêm trọng.",
          "Nguyên nhân quá tải có tính hệ thống thường không nằm ở cá nhân mà ở cách tổ chức vận hành: quá nhiều kênh giao tiếp, quá nhiều cuộc họp. Chính sách về thời gian phản hồi và quyền ngắt kết nối nên được văn bản hóa chính thức. Khả năng tiếp cận trong công cụ và tài liệu số đảm bảo mọi nhân viên, bao gồm người khuyết tật, đều có thể tham gia công việc số một cách bình đẳng.",
          "Chính sách chỉ có tác dụng thực tế khi cấp quản lý làm gương — nếu quản lý vẫn nhắn tin công việc ngoài giờ hoặc trả lời email lúc nửa đêm, chính sách “tôn trọng ranh giới thời gian” trên văn bản sẽ mất hiệu lực, vì nhân viên quan sát và học theo hành vi thực tế của cấp trên nhiều hơn là đọc quy định trên giấy.",
          "Ở mức lãnh đạo, việc linh hoạt sử dụng công nghệ số để tăng cường thịnh vượng xã hội đòi hỏi chủ động tích hợp các công cụ hỗ trợ sức khỏe tinh thần vào chính sách nhân sự — ví dụ cung cấp quyền truy cập ứng dụng chăm sóc sức khỏe tinh thần cho nhân viên, xây kênh nội bộ ẩn danh để nhân viên chia sẻ khó khăn, hoặc tổ chức các hoạt động kết nối trực tuyến cho đội ngũ làm việc từ xa. Đây là phần bổ sung cho các chính sách phòng ngừa rủi ro đã nêu ở trên, thể hiện vai trò chủ động thay vì chỉ đối phó khi có vấn đề phát sinh."
        ],
        "examples": [],
        "practice": "Khảo sát trải nghiệm làm việc số trong doanh nghiệp (thiết kế bộ câu hỏi ngắn 8–10 câu về quá tải thông tin, chất lượng họp, ranh giới thời gian), phân tích kết quả và soạn dự thảo chính sách phúc lợi số.",
        "deliverable": "Kết quả khảo sát, phân tích, dự thảo chính sách.",
        "questions": [
          {
            "number": 1,
            "questionText": "Nguyên nhân quá tải có tính hệ thống thường xuất phát từ đâu?",
            "options": [
              "Chỉ từ năng lực cá nhân của từng nhân viên",
              "Cách tổ chức vận hành: quá nhiều kênh, quá nhiều họp, kỳ vọng phản hồi tức thời",
              "Không có nguyên nhân hệ thống nào",
              "Chỉ do thiết bị lỗi thời"
            ],
            "correctIndex": 1,
            "explanation": "Vấn đề quá tải thường mang tính hệ thống hơn là vấn đề cá nhân.",
            "competencyCode": "4.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao chính sách về quyền ngắt kết nối nên được văn bản hóa chính thức?",
            "options": [
              "Không cần thiết, thỏa thuận ngầm là đủ",
              "Giúp nhân viên có căn cứ rõ ràng để bảo vệ thời gian nghỉ ngơi",
              "Chỉ để tuân thủ hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Văn bản chính thức tạo căn cứ vững chắc hơn thỏa thuận ngầm không rõ ràng.",
            "competencyCode": "4.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Khả năng tiếp cận (accessibility) trong công cụ số liên quan đến điều gì?",
            "options": [
              "Chỉ liên quan đến tốc độ tải trang",
              "Mức độ công cụ có thể được sử dụng bởi người có khả năng khác nhau, bao gồm người khuyết tật",
              "Chỉ liên quan đến giao diện đẹp",
              "Không quan trọng trong môi trường doanh nghiệp"
            ],
            "correctIndex": 1,
            "explanation": "Đây là yếu tố đảm bảo tính bình đẳng trong tiếp cận công cụ số.",
            "competencyCode": "4.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vai trò làm gương của cấp quản lý ảnh hưởng thế nào đến chính sách phúc lợi số?",
            "options": [
              "Không ảnh hưởng gì",
              "Quyết định hiệu quả thực tế của chính sách — hành vi thực tế quan trọng hơn văn bản",
              "Chỉ ảnh hưởng đến nhân viên mới",
              "Không liên quan đến phúc lợi số"
            ],
            "correctIndex": 1,
            "explanation": "Nếu quản lý không tuân thủ chính sách, chính sách sẽ mất hiệu lực thực tế dù có trên giấy.",
            "competencyCode": "4.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Cuộc họp nào nên được cân nhắc thay bằng email hoặc kênh khác?",
            "options": [
              "Cuộc họp cần thảo luận, trao đổi ý kiến qua lại",
              "Cuộc họp chỉ nhằm thông báo một chiều không cần trao đổi",
              "Cuộc họp ra quyết định quan trọng",
              "Cuộc họp giải quyết xung đột"
            ],
            "correctIndex": 1,
            "explanation": "Thông báo một chiều có thể truyền đạt hiệu quả qua kênh không đồng bộ như email, tiết kiệm thời gian họp.",
            "competencyCode": "4.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Nguyên nhân quá tải có tính hệ thống thường xuất phát từ đâu? A. Chỉ từ năng lực cá nhân của từng nhân viên B. Cách tổ chức vận hành: quá nhiều kênh, quá nhiều họp, kỳ vọng phản hồi tức thời C. Không có nguyên nhân hệ thống nào D. Chỉ do thiết bị lỗi thời Đáp án: B — Vấn đề quá tải thường mang tính hệ thống hơn là vấn đề cá nhân.",
          "2. Vì sao chính sách về quyền ngắt kết nối nên được văn bản hóa chính thức? A. Không cần thiết, thỏa thuận ngầm là đủ B. Giúp nhân viên có căn cứ rõ ràng để bảo vệ thời gian nghỉ ngơi C. Chỉ để tuân thủ hình thức D. Không có tác dụng thực tế Đáp án: B — Văn bản chính thức tạo căn cứ vững chắc hơn thỏa thuận ngầm không rõ ràng.",
          "3. Khả năng tiếp cận (accessibility) trong công cụ số liên quan đến điều gì? A. Chỉ liên quan đến tốc độ tải trang B. Mức độ công cụ có thể được sử dụng bởi người có khả năng khác nhau, bao gồm người khuyết tật C. Chỉ liên quan đến giao diện đẹp D. Không quan trọng trong môi trường doanh nghiệp Đáp án: B — Đây là yếu tố đảm bảo tính bình đẳng trong tiếp cận công cụ số.",
          "4. Vai trò làm gương của cấp quản lý ảnh hưởng thế nào đến chính sách phúc lợi số? A. Không ảnh hưởng gì B. Quyết định hiệu quả thực tế của chính sách — hành vi thực tế quan trọng hơn văn bản C. Chỉ ảnh hưởng đến nhân viên mới D. Không liên quan đến phúc lợi số Đáp án: B — Nếu quản lý không tuân thủ chính sách, chính sách sẽ mất hiệu lực thực tế dù có trên giấy.",
          "5. Cuộc họp nào nên được cân nhắc thay bằng email hoặc kênh khác? A. Cuộc họp cần thảo luận, trao đổi ý kiến qua lại B. Cuộc họp chỉ nhằm thông báo một chiều không cần trao đổi C. Cuộc họp ra quyết định quan trọng D. Cuộc họp giải quyết xung đột Đáp án: B — Thông báo một chiều có thể truyền đạt hiệu quả qua kênh không đồng bộ như email, tiết kiệm thời gian họp."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Chiến lược bền vững số",
        "competencyCode": "4.4",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ"
        ],
        "definitions": [
          "Chỉ tiêu bền vững: thước đo cụ thể, đo lường được, dùng để theo dõi tiến độ hướng tới mục tiêu bền vững đã đặt ra",
          "Vòng đời thiết bị (từ góc độ chính sách): chu trình mua, sử dụng, sửa chữa, và thanh lý thiết bị được quản lý có chủ đích ở cấp tổ chức"
        ],
        "body": [
          "Ở mức nâng cao, việc chọn giải pháp phù hợp nhất để bảo vệ môi trường mở rộng thành chiến lược bền vững số cấp toàn doanh nghiệp. Kiểm kê tác động số toàn doanh nghiệp bao gồm tổng dung lượng lưu trữ, tuổi thọ trung bình thiết bị, mức tiêu thụ năng lượng hạ tầng công nghệ thông tin.",
          "Chỉ tiêu bền vững cần cụ thể và đo lường được, ví dụ “giảm 20% khối lượng in ấn trong năm tới”. Tiêu chí bền vững trong mua sắm nên được đưa vào chính thức trong quy trình lựa chọn nhà cung cấp. Báo cáo kết quả bền vững cần dựa trên số liệu thực tế đã đo lường, tránh công bố phóng đại."
        ],
        "examples": [],
        "practice": "Xây chiến lược bền vững số cho doanh nghiệp: kiểm kê hiện trạng, ba mục tiêu có chỉ tiêu đo được, kế hoạch triển khai, và khung báo cáo.",
        "deliverable": "Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo.",
        "questions": [
          {
            "number": 1,
            "questionText": "Chỉ tiêu bền vững tốt cần có đặc điểm gì?",
            "options": [
              "Chung chung, dễ đạt được",
              "Cụ thể và đo lường được",
              "Không cần đo lường",
              "Chỉ cần có ý định tốt"
            ],
            "correctIndex": 1,
            "explanation": "Chỉ tiêu cụ thể, đo lường được mới giúp theo dõi tiến độ hiệu quả.",
            "competencyCode": "4.4",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Xác định điểm can thiệp có tác động lớn nhất giúp ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Tập trung nguồn lực vào nơi mang lại hiệu quả cao nhất",
              "Chỉ để báo cáo đẹp hơn",
              "Làm phức tạp thêm quy trình"
            ],
            "correctIndex": 1,
            "explanation": "Tập trung vào điểm có tác động lớn giúp sử dụng nguồn lực hiệu quả hơn dàn trải.",
            "competencyCode": "4.4",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Vì sao không nên công bố kết quả bền vững phóng đại?",
            "options": [
              "Không có vấn đề gì nếu không ai phát hiện",
              "Là rủi ro uy tín nếu bị phát hiện không đúng thực tế, ngoài vấn đề đạo đức",
              "Không liên quan đến uy tín doanh nghiệp",
              "Luôn được chấp nhận trong marketing"
            ],
            "correctIndex": 1,
            "explanation": "Công bố sai lệch có thể gây tổn hại nghiêm trọng đến uy tín khi bị phát hiện.",
            "competencyCode": "4.4",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Chính sách vòng đời thiết bị ở cấp tổ chức nên ưu tiên điều gì trước khi thay mới?",
            "options": [
              "Thay mới ngay khi có phiên bản mới hơn",
              "Ưu tiên sửa chữa trước khi thay mới",
              "Không cần chính sách cụ thể",
              "Thay mới toàn bộ đồng loạt mỗi năm"
            ],
            "correctIndex": 1,
            "explanation": "Ưu tiên sửa chữa giúp kéo dài vòng đời thiết bị và giảm rác thải điện tử.",
            "competencyCode": "4.4",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Tiêu chí bền vững khi chọn nhà cung cấp dịch vụ đám mây có thể bao gồm gì?",
            "options": [
              "Chỉ quan tâm giá rẻ nhất",
              "Cam kết năng lượng tái tạo và hiệu suất năng lượng của trung tâm dữ liệu",
              "Không có tiêu chí liên quan đến bền vững",
              "Chỉ quan tâm tốc độ truy cập"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các yếu tố phản ánh mức độ bền vững của nhà cung cấp dịch vụ đám mây.",
            "competencyCode": "4.4",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Chỉ tiêu bền vững tốt cần có đặc điểm gì? A. Chung chung, dễ đạt được B. Cụ thể và đo lường được C. Không cần đo lường D. Chỉ cần có ý định tốt Đáp án: B — Chỉ tiêu cụ thể, đo lường được mới giúp theo dõi tiến độ hiệu quả.",
          "2. Xác định điểm can thiệp có tác động lớn nhất giúp ích gì? A. Không có lợi ích cụ thể B. Tập trung nguồn lực vào nơi mang lại hiệu quả cao nhất C. Chỉ để báo cáo đẹp hơn D. Làm phức tạp thêm quy trình Đáp án: B — Tập trung vào điểm có tác động lớn giúp sử dụng nguồn lực hiệu quả hơn dàn trải.",
          "3. Vì sao không nên công bố kết quả bền vững phóng đại? A. Không có vấn đề gì nếu không ai phát hiện B. Là rủi ro uy tín nếu bị phát hiện không đúng thực tế, ngoài vấn đề đạo đức C. Không liên quan đến uy tín doanh nghiệp D. Luôn được chấp nhận trong marketing Đáp án: B — Công bố sai lệch có thể gây tổn hại nghiêm trọng đến uy tín khi bị phát hiện.",
          "4. Chính sách vòng đời thiết bị ở cấp tổ chức nên ưu tiên điều gì trước khi thay mới? A. Thay mới ngay khi có phiên bản mới hơn B. Ưu tiên sửa chữa trước khi thay mới C. Không cần chính sách cụ thể D. Thay mới toàn bộ đồng loạt mỗi năm Đáp án: B — Ưu tiên sửa chữa giúp kéo dài vòng đời thiết bị và giảm rác thải điện tử.",
          "5. Tiêu chí bền vững khi chọn nhà cung cấp dịch vụ đám mây có thể bao gồm gì? A. Chỉ quan tâm giá rẻ nhất B. Cam kết năng lượng tái tạo và hiệu suất năng lượng của trung tâm dữ liệu C. Không có tiêu chí liên quan đến bền vững D. Chỉ quan tâm tốc độ truy cập Đáp án: B — Đây là các yếu tố phản ánh mức độ bền vững của nhà cung cấp dịch vụ đám mây."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M4-A",
      "brief": "Xây dựng bộ khung quản trị an toàn và trách nhiệm số cho doanh nghiệp: hồ sơ rủi ro và phân quyền, chương trình tuân thủ dữ liệu cá nhân, chính sách phúc lợi số, chiến lược bền vững.\nTiêu chí chấm:\nHồ sơ quản trị an toàn thông tin (rủi ro, phân quyền, ứng phó sự cố)\nChương trình tuân thủ bảo vệ dữ liệu cá nhân, đúng căn cứ pháp lý\nChính sách phúc lợi số\nChiến lược bền vững số, có chỉ tiêu đo được\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.\nLưu ý quan trọng gửi người triển khai: Toàn bộ nội dung liên quan đến Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân trong khóa M4-I (Module 2) và M4-A (Module 2) đã được đối chiếu với thông tin tra cứu tại thời điểm biên soạn. Tuy nhiên, đây là lĩnh vực pháp lý có thể thay đổi (Luật Bảo vệ dữ liệu cá nhân dự kiến hiệu lực 1/1/2026), và nội dung này cần được bộ phận pháp lý hoặc chuyên gia tư vấn rà soát trước khi đưa vào giảng dạy chính thức, đặc biệt các nội dung liên quan đến chuyển dữ liệu ra nước ngoài, báo cáo đánh giá tác động, và các nghĩa vụ thông báo sự cố cụ thể — đây là những điểm dễ thay đổi hoặc cần diễn giải chuyên sâu hơn phạm vi một khóa đào tạo kỹ năng số phổ thông.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A5-F": {
    "code": "A5-F",
    "title": "XỬ LÝ SỰ CỐ VÀ TỰ HỌC CÔNG NGHỆ",
    "domainNumber": 5,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 4 module · 8 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Xử lý sự cố thường gặp",
        "competencyCode": "5.1",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số",
          "Xác định được các giải pháp đơn giản để giải quyết chúng"
        ],
        "definitions": [
          "Sự cố kỹ thuật: tình huống một thiết bị hoặc phần mềm không hoạt động như mong đợi",
          "Thông báo lỗi: dòng chữ hệ thống hiển thị khi có sự cố, thường gợi ý nguyên nhân hoặc mã lỗi cụ thể"
        ],
        "body": [
          "Giải quyết các vấn đề kỹ thuật nghĩa là xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị số và sử dụng môi trường số. Mô tả sự cố chính xác là bước đầu tiên: đang làm gì khi sự cố xảy ra, điều gì đã xảy ra khác với mong đợi, có thông báo lỗi cụ thể nào không.",
          "Các bước xử lý cơ bản theo thứ tự nên thử: khởi động lại ứng dụng hoặc thiết bị, kiểm tra kết nối mạng, kiểm tra bản cập nhật. Khi đã thử các bước cơ bản mà không giải quyết được, nên dừng tự xử lý và báo bộ phận kỹ thuật, cung cấp đầy đủ mô tả sự cố và các bước đã thử."
        ],
        "examples": [],
        "practice": "Với 5 tình huống sự cố mô phỏng dưới đây, viết mô tả sự cố đúng chuẩn và liệt kê các bước sẽ thử theo thứ tự. 5 tình huống mẫu: Máy in không in được, đèn báo nhấp nháy màu vàng Không mở được một file PDF, hiện thông báo “file bị hỏng” Không kết nối được wifi công ty dù các thiết bị khác vẫn kết nối bình thường Trình duyệt web chạy rất chậm khi mở nhiều tab Không đăng nhập được vào hệ thống email công ty, báo sai mật khẩu dù chắc chắn gõ đúng",
        "deliverable": "Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự.",
        "questions": [
          {
            "number": 1,
            "questionText": "Một mô tả sự cố tốt cần trả lời những câu hỏi nào?",
            "options": [
              "Chỉ cần nói “bị lỗi” là đủ",
              "Đang làm gì, điều gì xảy ra khác mong đợi, có thông báo lỗi cụ thể không",
              "Chỉ cần biết tên thiết bị",
              "Không cần mô tả gì, chỉ cần gọi hỗ trợ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là ba yếu tố giúp mô tả sự cố đủ thông tin để xử lý hiệu quả.",
            "competencyCode": "5.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Bước xử lý cơ bản nào thường giải quyết được nhiều sự cố đơn giản nhất?",
            "options": [
              "Mua thiết bị mới",
              "Khởi động lại ứng dụng hoặc thiết bị",
              "Gọi ngay bộ phận kỹ thuật",
              "Không làm gì và chờ tự hết"
            ],
            "correctIndex": 1,
            "explanation": "Khởi động lại giải quyết được rất nhiều sự cố phổ biến do lỗi tạm thời.",
            "competencyCode": "5.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Khi gặp thông báo lỗi cụ thể, cách hiệu quả để tìm giải pháp là gì?",
            "options": [
              "Bỏ qua thông báo lỗi",
              "Tra cứu nguyên văn thông báo lỗi đó",
              "Khởi động lại máy nhiều lần",
              "Không có cách nào hiệu quả"
            ],
            "correctIndex": 1,
            "explanation": "Thông báo lỗi cụ thể thường đã được nhiều người khác gặp và có hướng dẫn xử lý sẵn.",
            "competencyCode": "5.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Khi báo cáo sự cố cho bộ phận kỹ thuật, thông tin nào nên cung cấp?",
            "options": [
              "Chỉ cần nói “máy bị lỗi”",
              "Mô tả sự cố, các bước đã thử, thông báo lỗi cụ thể nếu có",
              "Không cần cung cấp thông tin gì",
              "Chỉ cần tên người dùng"
            ],
            "correctIndex": 1,
            "explanation": "Thông tin đầy đủ giúp bộ phận hỗ trợ xử lý nhanh và chính xác hơn.",
            "competencyCode": "5.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Vì sao nên ghi lại cách đã xử lý thành công một sự cố?",
            "options": [
              "Không cần thiết",
              "Để lần sau gặp lại có thể tự xử lý nhanh hơn",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Ghi chép giúp xây dựng kinh nghiệm cá nhân, tiết kiệm thời gian về sau.",
            "competencyCode": "5.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Một mô tả sự cố tốt cần trả lời những câu hỏi nào? A. Chỉ cần nói “bị lỗi” là đủ B. Đang làm gì, điều gì xảy ra khác mong đợi, có thông báo lỗi cụ thể không C. Chỉ cần biết tên thiết bị D. Không cần mô tả gì, chỉ cần gọi hỗ trợ Đáp án: B — Đây là ba yếu tố giúp mô tả sự cố đủ thông tin để xử lý hiệu quả.",
          "2. Bước xử lý cơ bản nào thường giải quyết được nhiều sự cố đơn giản nhất? A. Mua thiết bị mới B. Khởi động lại ứng dụng hoặc thiết bị C. Gọi ngay bộ phận kỹ thuật D. Không làm gì và chờ tự hết Đáp án: B — Khởi động lại giải quyết được rất nhiều sự cố phổ biến do lỗi tạm thời.",
          "3. Khi gặp thông báo lỗi cụ thể, cách hiệu quả để tìm giải pháp là gì? A. Bỏ qua thông báo lỗi B. Tra cứu nguyên văn thông báo lỗi đó C. Khởi động lại máy nhiều lần D. Không có cách nào hiệu quả Đáp án: B — Thông báo lỗi cụ thể thường đã được nhiều người khác gặp và có hướng dẫn xử lý sẵn.",
          "4. Khi báo cáo sự cố cho bộ phận kỹ thuật, thông tin nào nên cung cấp? A. Chỉ cần nói “máy bị lỗi” B. Mô tả sự cố, các bước đã thử, thông báo lỗi cụ thể nếu có C. Không cần cung cấp thông tin gì D. Chỉ cần tên người dùng Đáp án: B — Thông tin đầy đủ giúp bộ phận hỗ trợ xử lý nhanh và chính xác hơn.",
          "5. Vì sao nên ghi lại cách đã xử lý thành công một sự cố? A. Không cần thiết B. Để lần sau gặp lại có thể tự xử lý nhanh hơn C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi chép giúp xây dựng kinh nghiệm cá nhân, tiết kiệm thời gian về sau."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Chọn công cụ phù hợp với công việc",
        "competencyCode": "5.2",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được nhu cầu cá nhân",
          "Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó",
          "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân"
        ],
        "definitions": [
          "Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra",
          "Nhu cầu công việc: mô tả cụ thể về việc cần làm, kết quả mong muốn, và ai sẽ sử dụng kết quả đó",
          "Công cụ có sẵn của doanh nghiệp: phần mềm hoặc dịch vụ đã được doanh nghiệp cấp phép và phê duyệt sử dụng"
        ],
        "body": [
          "Xác định nhu cầu và giải pháp công nghệ ở mức cơ bản nghĩa là xác định được nhu cầu cá nhân và nhận ra các công cụ số đơn giản có thể giải quyết nhu cầu đó. Trước khi chọn công cụ, cần xác định rõ: cần làm gì cụ thể, kết quả sẽ được dùng bởi ai.",
          "Nên ưu tiên dùng công cụ có sẵn của doanh nghiệp trước khi tìm công cụ mới. Dấu hiệu công cụ không còn phù hợp bao gồm phải thực hiện nhiều thao tác thủ công để bù đắp, hoặc thường xuyên xảy ra sai sót. Trước khi đưa dữ liệu công việc lên bất kỳ công cụ mới nào, nên hỏi ý kiến người phụ trách hoặc bộ phận IT."
        ],
        "examples": [],
        "practice": "Liệt kê 5 công việc thường làm trong tuần, xác định công cụ đang dùng cho mỗi việc và đánh giá mức độ phù hợp. Bảng mẫu: Công việc Công cụ đang dùng Mức phù hợp (Tốt/Tạm/Không phù hợp) Lý do Ví dụ: Tổng hợp báo cáo doanh số hàng tuần Ghi tay rồi gõ lại vào Word Không phù hợp Mất thời gian, dễ sai sót khi chép tay",
        "deliverable": "Bảng công việc – công cụ – đánh giá phù hợp (5 dòng).",
        "questions": [
          {
            "number": 1,
            "questionText": "Bước đầu tiên trước khi chọn công cụ cho một công việc là gì?",
            "options": [
              "Chọn công cụ phổ biến nhất",
              "Xác định rõ nhu cầu: cần làm gì, kết quả dùng bởi ai",
              "Hỏi đồng nghiệp dùng gì",
              "Không cần bước chuẩn bị nào"
            ],
            "correctIndex": 1,
            "explanation": "Hiểu rõ nhu cầu giúp chọn đúng công cụ, tránh phải làm lại.",
            "competencyCode": "5.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Vì sao nên ưu tiên công cụ có sẵn của doanh nghiệp?",
            "options": [
              "Không có lý do đặc biệt",
              "Đã được phê duyệt về bảo mật, dễ hợp tác với đồng nghiệp",
              "Luôn miễn phí",
              "Không cần lý do gì"
            ],
            "correctIndex": 1,
            "explanation": "Công cụ có sẵn đảm bảo tính nhất quán và an toàn hơn công cụ tự tìm bên ngoài.",
            "competencyCode": "5.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Dấu hiệu nào cho thấy công cụ đang dùng không còn phù hợp?",
            "options": [
              "Công việc hoàn thành nhanh chóng, chính xác",
              "Phải thực hiện nhiều thao tác thủ công lặp lại để bù đắp thiếu sót của công cụ",
              "Không có vấn đề gì",
              "Đồng nghiệp cũng dùng công cụ đó"
            ],
            "correctIndex": 1,
            "explanation": "Đây là dấu hiệu công cụ không đáp ứng đủ nhu cầu công việc thực tế.",
            "competencyCode": "5.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Trước khi đưa dữ liệu công việc lên một công cụ mới chưa được phê duyệt, nên làm gì?",
            "options": [
              "Cứ dùng thử trước, hỏi sau",
              "Hỏi ý kiến người phụ trách hoặc bộ phận IT trước",
              "Không cần hỏi ai",
              "Chỉ cần thông báo sau khi đã dùng"
            ],
            "correctIndex": 1,
            "explanation": "Xin phê duyệt trước giúp tránh rủi ro bảo mật và vi phạm chính sách công ty.",
            "competencyCode": "5.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Rủi ro của việc tự ý cài công cụ ngoài không qua phê duyệt là gì?",
            "options": [
              "Không có rủi ro gì",
              "Có thể vi phạm chính sách bảo mật, đưa dữ liệu ra ngoài kiểm soát",
              "Chỉ tốn thêm dung lượng",
              "Chỉ ảnh hưởng đến tốc độ máy"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các rủi ro thực tế cần cân nhắc trước khi tự ý dùng công cụ mới.",
            "competencyCode": "5.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Bước đầu tiên trước khi chọn công cụ cho một công việc là gì? A. Chọn công cụ phổ biến nhất B. Xác định rõ nhu cầu: cần làm gì, kết quả dùng bởi ai C. Hỏi đồng nghiệp dùng gì D. Không cần bước chuẩn bị nào Đáp án: B — Hiểu rõ nhu cầu giúp chọn đúng công cụ, tránh phải làm lại.",
          "2. Vì sao nên ưu tiên công cụ có sẵn của doanh nghiệp? A. Không có lý do đặc biệt B. Đã được phê duyệt về bảo mật, dễ hợp tác với đồng nghiệp C. Luôn miễn phí D. Không cần lý do gì Đáp án: B — Công cụ có sẵn đảm bảo tính nhất quán và an toàn hơn công cụ tự tìm bên ngoài.",
          "3. Dấu hiệu nào cho thấy công cụ đang dùng không còn phù hợp? A. Công việc hoàn thành nhanh chóng, chính xác B. Phải thực hiện nhiều thao tác thủ công lặp lại để bù đắp thiếu sót của công cụ C. Không có vấn đề gì D. Đồng nghiệp cũng dùng công cụ đó Đáp án: B — Đây là dấu hiệu công cụ không đáp ứng đủ nhu cầu công việc thực tế.",
          "4. Trước khi đưa dữ liệu công việc lên một công cụ mới chưa được phê duyệt, nên làm gì? A. Cứ dùng thử trước, hỏi sau B. Hỏi ý kiến người phụ trách hoặc bộ phận IT trước C. Không cần hỏi ai D. Chỉ cần thông báo sau khi đã dùng Đáp án: B — Xin phê duyệt trước giúp tránh rủi ro bảo mật và vi phạm chính sách công ty.",
          "5. Rủi ro của việc tự ý cài công cụ ngoài không qua phê duyệt là gì? A. Không có rủi ro gì B. Có thể vi phạm chính sách bảo mật, đưa dữ liệu ra ngoài kiểm soát C. Chỉ tốn thêm dung lượng D. Chỉ ảnh hưởng đến tốc độ máy Đáp án: B — Đây là các rủi ro thực tế cần cân nhắc trước khi tự ý dùng công cụ mới."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Cải tiến công việc bằng công cụ số",
        "competencyCode": "5.3",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm",
          "Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và tình huống có vấn đề trong môi trường số"
        ],
        "definitions": [
          "Điểm mất thời gian: công đoạn trong quy trình làm việc tốn nhiều thời gian hơn mức cần thiết so với cách làm khác hiệu quả hơn",
          "Phím tắt: tổ hợp phím giúp thực hiện một thao tác nhanh hơn so với dùng chuột"
        ],
        "body": [
          "Sử dụng sáng tạo công nghệ số ở mức cơ bản nghĩa là xác định được các công cụ và công nghệ số đơn giản có thể dùng để tạo ra kiến thức và đổi mới quy trình. Nhận diện điểm mất thời gian trong công việc hàng ngày là bước đầu tiên.",
          "Nhiều tính năng ít được để ý nhưng tiết kiệm đáng kể thời gian: phím tắt, mẫu tài liệu có sẵn, tìm kiếm nâng cao. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho nhiều tình huống. Khi đề xuất cải tiến với cấp trên, nên trình bày cụ thể với số liệu ước tính."
        ],
        "examples": [],
        "practice": "Chọn một công việc lặp lại hàng tuần, đo thời gian hiện tại đang mất, áp dụng một cải tiến (phím tắt, mẫu có sẵn, tính năng lọc/sắp xếp…) và đo lại thời gian sau khi cải tiến.",
        "deliverable": "Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổng hợp báo cáo bằng cách chép tay từng dòng. Sau khi dùng tính năng lọc và công thức tổng trong Excel: 5 phút/tuần”).",
        "questions": [
          {
            "number": 1,
            "questionText": "Phím tắt Ctrl+F thường dùng để làm gì?",
            "options": [
              "Lưu tài liệu",
              "Tìm kiếm nhanh trong tài liệu",
              "In tài liệu",
              "Đóng tài liệu"
            ],
            "correctIndex": 1,
            "explanation": "Đây là phím tắt tìm kiếm phổ biến trong hầu hết ứng dụng văn phòng.",
            "competencyCode": "5.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho tình huống nào?",
            "options": [
              "Chỉ áp dụng cho công việc làm một lần duy nhất",
              "Tạo mẫu tài liệu hoặc danh mục kiểm tra dùng lại cho công việc hay lặp lại",
              "Không áp dụng được trong thực tế",
              "Chỉ áp dụng cho công việc phức tạp"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc tiết kiệm thời gian cho các công việc có tính lặp lại.",
            "competencyCode": "5.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Khi đề xuất cải tiến với cấp trên, điều gì giúp đề xuất dễ được chấp thuận hơn?",
            "options": [
              "Trình bày chung chung không cần số liệu",
              "Có số liệu cụ thể về lợi ích ước tính (ví dụ thời gian tiết kiệm)",
              "Không cần giải thích gì",
              "Chỉ cần nói “cách này tốt hơn”"
            ],
            "correctIndex": 1,
            "explanation": "Số liệu cụ thể giúp cấp trên đánh giá và ra quyết định dễ dàng hơn.",
            "competencyCode": "5.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Vì sao nên ghi lại cách làm hiệu quả đã tìm ra?",
            "options": [
              "Không cần thiết",
              "Để bản thân dùng lại và có thể chia sẻ cho đồng nghiệp",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Ghi chép giúp lan tỏa cách làm hiệu quả trong nhóm, không chỉ dừng lại ở cá nhân.",
            "competencyCode": "5.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Điểm mất thời gian trong công việc thường được nhận diện qua đâu?",
            "options": [
              "Không thể nhận diện được",
              "Công việc lặp lại thường xuyên, tốn công khó chịu, hay gây sai sót",
              "Chỉ qua báo cáo của cấp trên",
              "Chỉ qua phần mềm đo lường chuyên dụng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các dấu hiệu thực tế giúp nhận diện điểm cần cải tiến trong công việc hàng ngày.",
            "competencyCode": "5.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Phím tắt Ctrl+F thường dùng để làm gì? A. Lưu tài liệu B. Tìm kiếm nhanh trong tài liệu C. In tài liệu D. Đóng tài liệu Đáp án: B — Đây là phím tắt tìm kiếm phổ biến trong hầu hết ứng dụng văn phòng.",
          "2. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho tình huống nào? A. Chỉ áp dụng cho công việc làm một lần duy nhất B. Tạo mẫu tài liệu hoặc danh mục kiểm tra dùng lại cho công việc hay lặp lại C. Không áp dụng được trong thực tế D. Chỉ áp dụng cho công việc phức tạp Đáp án: B — Đây là nguyên tắc tiết kiệm thời gian cho các công việc có tính lặp lại.",
          "3. Khi đề xuất cải tiến với cấp trên, điều gì giúp đề xuất dễ được chấp thuận hơn? A. Trình bày chung chung không cần số liệu B. Có số liệu cụ thể về lợi ích ước tính (ví dụ thời gian tiết kiệm) C. Không cần giải thích gì D. Chỉ cần nói “cách này tốt hơn” Đáp án: B — Số liệu cụ thể giúp cấp trên đánh giá và ra quyết định dễ dàng hơn.",
          "4. Vì sao nên ghi lại cách làm hiệu quả đã tìm ra? A. Không cần thiết B. Để bản thân dùng lại và có thể chia sẻ cho đồng nghiệp C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi chép giúp lan tỏa cách làm hiệu quả trong nhóm, không chỉ dừng lại ở cá nhân.",
          "5. Điểm mất thời gian trong công việc thường được nhận diện qua đâu? A. Không thể nhận diện được B. Công việc lặp lại thường xuyên, tốn công khó chịu, hay gây sai sót C. Chỉ qua báo cáo của cấp trên D. Chỉ qua phần mềm đo lường chuyên dụng Đáp án: B — Đây là các dấu hiệu thực tế giúp nhận diện điểm cần cải tiến trong công việc hàng ngày."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Nhận biết và bù đắp khoảng trống năng lực",
        "competencyCode": "5.4",
        "levelRange": "Mức 1–2",
        "objectives": [
          "Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu",
          "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số"
        ],
        "definitions": [
          "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Khoảng trống năng lực: sự chênh lệch giữa năng lực hiện tại của một người và năng lực yêu cầu cho vị trí công việc",
          "Kế hoạch học tập cá nhân: lộ trình cụ thể xác định kỹ năng cần học, nguồn học, và thời gian hoàn thành"
        ],
        "body": [
          "Xác định các vấn đề cần cải thiện về năng lực số ở mức cơ bản nghĩa là nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu. Năng lực số là khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc giải quyết vấn đề trong thực tiễn.",
          "Tự đánh giá theo khung năng lực chính thức giúp có cái nhìn khách quan hơn cảm giác chủ quan. So sánh với yêu cầu của vị trí công việc cho ra khoảng trống năng lực cụ thể. Cách học hiệu quả với người đi làm: học ít nhưng đều, gắn với công việc thực tế."
        ],
        "examples": [],
        "practice": "Hoàn thành bản tự đánh giá năng lực số theo 6 miền (dùng bảng mẫu dưới), so với yêu cầu vị trí công việc của mình, lập kế hoạch học tập 3 tháng. Bảng tự đánh giá mẫu: Miền Mức hiện tại (tự đánh giá bậc 1-8) Mức yêu cầu vị trí Khoảng trống Ưu tiên học (Cao/TB/Thấp) I. Khai thác dữ liệu và thông tin II. Giao tiếp và hợp tác trong môi trường số III. Sáng tạo nội dung số IV. An toàn V. Giải quyết vấn đề VI. Ứng dụng trí tuệ nhân tạo",
        "deliverable": "Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng.",
        "questions": [
          {
            "number": 1,
            "questionText": "Khoảng trống năng lực được xác định như thế nào?",
            "options": [
              "Không thể xác định được",
              "So sánh năng lực hiện tại với năng lực yêu cầu của vị trí công việc",
              "Chỉ dựa vào cảm giác chủ quan",
              "Không cần xác định cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cách xác định khoảng trống năng lực một cách có căn cứ.",
            "competencyCode": "5.4",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Cách học hiệu quả với người đi làm nên như thế nào?",
            "options": [
              "Dồn cả ngày cuối tuần để học",
              "Học ít nhưng đều đặn, gắn với công việc thực tế",
              "Không cần lịch trình cụ thể",
              "Chỉ học lý thuyết tách rời công việc"
            ],
            "correctIndex": 1,
            "explanation": "Học đều đặn và áp dụng ngay giúp ghi nhớ tốt hơn và phù hợp với lịch trình người đi làm.",
            "competencyCode": "5.4",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Câu hỏi nào khi nhờ đồng nghiệp hướng dẫn sẽ hiệu quả hơn?",
            "options": [
              "“Chỉ em cách dùng Excel với”",
              "“Làm sao để lọc dữ liệu theo điều kiện cụ thể này trong Excel?”",
              "Không cần đặt câu hỏi cụ thể",
              "Hỏi càng chung chung càng tốt"
            ],
            "correctIndex": 1,
            "explanation": "Câu hỏi cụ thể giúp người hướng dẫn trả lời trực tiếp và hiệu quả hơn.",
            "competencyCode": "5.4",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Vì sao nên theo dõi tiến bộ học tập của bản thân?",
            "options": [
              "Không cần thiết",
              "Giúp duy trì động lực học tập lâu dài",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Ghi nhận tiến bộ giúp nhận thấy kết quả, đặc biệt khi tiến bộ khó nhận thấy trong ngắn hạn.",
            "competencyCode": "5.4",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Nguồn học nào phù hợp cho người đi làm?",
            "options": [
              "Chỉ có khóa học chính quy dài hạn",
              "Tài liệu nội bộ, khóa học trực tuyến, học hỏi từ đồng nghiệp",
              "Không có nguồn học nào phù hợp",
              "Chỉ có thể tự học một mình"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các nguồn học đa dạng, linh hoạt phù hợp với lịch trình người đi làm.",
            "competencyCode": "5.4",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Khoảng trống năng lực được xác định như thế nào? A. Không thể xác định được B. So sánh năng lực hiện tại với năng lực yêu cầu của vị trí công việc C. Chỉ dựa vào cảm giác chủ quan D. Không cần xác định cụ thể Đáp án: B — Đây là cách xác định khoảng trống năng lực một cách có căn cứ.",
          "2. Cách học hiệu quả với người đi làm nên như thế nào? A. Dồn cả ngày cuối tuần để học B. Học ít nhưng đều đặn, gắn với công việc thực tế C. Không cần lịch trình cụ thể D. Chỉ học lý thuyết tách rời công việc Đáp án: B — Học đều đặn và áp dụng ngay giúp ghi nhớ tốt hơn và phù hợp với lịch trình người đi làm.",
          "3. Câu hỏi nào khi nhờ đồng nghiệp hướng dẫn sẽ hiệu quả hơn? A. “Chỉ em cách dùng Excel với” B. “Làm sao để lọc dữ liệu theo điều kiện cụ thể này trong Excel?” C. Không cần đặt câu hỏi cụ thể D. Hỏi càng chung chung càng tốt Đáp án: B — Câu hỏi cụ thể giúp người hướng dẫn trả lời trực tiếp và hiệu quả hơn.",
          "4. Vì sao nên theo dõi tiến bộ học tập của bản thân? A. Không cần thiết B. Giúp duy trì động lực học tập lâu dài C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi nhận tiến bộ giúp nhận thấy kết quả, đặc biệt khi tiến bộ khó nhận thấy trong ngắn hạn.",
          "5. Nguồn học nào phù hợp cho người đi làm? A. Chỉ có khóa học chính quy dài hạn B. Tài liệu nội bộ, khóa học trực tuyến, học hỏi từ đồng nghiệp C. Không có nguồn học nào phù hợp D. Chỉ có thể tự học một mình Đáp án: B — Đây là các nguồn học đa dạng, linh hoạt phù hợp với lịch trình người đi làm."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M5-F",
      "brief": "Xử lý một chuỗi tình huống trong ngày làm việc: gặp sự cố kỹ thuật, chọn công cụ cho một nhiệm vụ mới, đề xuất một cải tiến, và lập kế hoạch học kỹ năng còn thiếu.\nTiêu chí chấm:\nMô tả và xử lý sự cố kỹ thuật đúng phương pháp\nLựa chọn công cụ hợp lý, có căn cứ\nĐề xuất cải tiến cụ thể, có số liệu\nKế hoạch học tập cá nhân rõ ràng, khả thi\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A5-I": {
    "code": "A5-I",
    "title": "GIẢI QUYẾT VẤN ĐỀ TRONG CÔNG VIỆC SỐ",
    "domainNumber": 5,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 4 module · 10 giờ · Tiên quyết: M5-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Chẩn đoán và xử lý vấn đề kỹ thuật",
        "competencyCode": "5.1",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số",
          "Chọn được giải pháp cho chúng"
        ],
        "definitions": [
          "Chẩn đoán có hệ thống: phương pháp xác định nguyên nhân sự cố bằng cách loại trừ dần các khả năng, thay vì đoán ngẫu nhiên",
          "Sự cố cục bộ: sự cố chỉ ảnh hưởng đến một người hoặc một máy, khác với sự cố hệ thống ảnh hưởng nhiều người"
        ],
        "body": [
          "Ở mức trung cấp, việc phân biệt vấn đề kỹ thuật và chọn giải pháp cho chúng đòi hỏi phương pháp chẩn đoán có hệ thống gồm ba bước: tái hiện lại sự cố, thu hẹp phạm vi, loại trừ.",
          "Phân biệt nguồn gốc vấn đề giúp xử lý đúng hướng: lỗi do thao tác, lỗi dữ liệu, lỗi phần mềm, lỗi kết nối, hoặc lỗi quyền truy cập. Phân biệt sự cố cục bộ (chỉ một người gặp) và sự cố hệ thống (nhiều người cùng gặp) là bước chẩn đoán quan trọng. Xây dựng tài liệu hướng dẫn xử lý sự cố thường gặp cho bộ phận giúp đồng nghiệp tự xử lý được các sự cố lặp lại."
        ],
        "examples": [],
        "practice": "Chẩn đoán 3 tình huống sự cố phức tạp dưới đây, ghi lại quá trình loại trừ; xây tài liệu hướng dẫn xử lý cho 5 sự cố hay gặp nhất của bộ phận. 3 tình huống mẫu để thực hành chẩn đoán: Một nhân viên báo không mở được file chia sẻ chung, nhưng đồng nghiệp khác vẫn mở bình thường Hệ thống quản lý công việc chạy rất chậm vào buổi sáng, nhưng bình thường vào buổi chiều Một báo cáo tự động hàng tuần đột nhiên không còn gửi email như trước",
        "deliverable": "Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố.",
        "questions": [
          {
            "number": 1,
            "questionText": "Ba bước của phương pháp chẩn đoán có hệ thống là gì?",
            "options": [
              "Đoán, thử, hy vọng",
              "Tái hiện, thu hẹp phạm vi, loại trừ",
              "Báo cáo, chờ đợi, kiểm tra",
              "Khởi động lại, chờ, thử lại"
            ],
            "correctIndex": 1,
            "explanation": "Đây là quy trình chẩn đoán có hệ thống giúp xác định nguyên nhân chính xác.",
            "competencyCode": "5.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Một sự cố chỉ xảy ra với một người trong khi đồng nghiệp khác vẫn dùng bình thường gợi ý điều gì?",
            "options": [
              "Đây chắc chắn là sự cố hệ thống",
              "Nguyên nhân thường liên quan đến máy hoặc tài khoản của riêng người đó",
              "Không thể suy luận được gì",
              "Cần báo động toàn công ty ngay"
            ],
            "correctIndex": 1,
            "explanation": "Sự cố cục bộ (một người) thường có nguyên nhân riêng biệt khác với sự cố hệ thống.",
            "competencyCode": "5.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao nên ghi nhận và theo dõi các sự cố lặp lại?",
            "options": [
              "Không cần thiết",
              "Giúp tìm nguyên nhân gốc thay vì chỉ xử lý triệu chứng mỗi lần",
              "Chỉ để có báo cáo đẹp",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Sự cố lặp lại nhiều lần là dấu hiệu cần tìm và giải quyết nguyên nhân gốc.",
            "competencyCode": "5.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi trao đổi với bộ phận kỹ thuật, điều gì giúp tiết kiệm thời gian?",
            "options": [
              "Chỉ nói “bị lỗi, sửa giúp em”",
              "Cung cấp thông tin đã chẩn đoán được và đã loại trừ những gì",
              "Không cần cung cấp thông tin gì",
              "Chỉ cần gọi điện thoại nhiều lần"
            ],
            "correctIndex": 1,
            "explanation": "Thông tin đầy đủ giúp bộ phận kỹ thuật không phải lặp lại các bước cơ bản đã thử.",
            "competencyCode": "5.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Tài liệu hướng dẫn xử lý sự cố cho bộ phận có tác dụng gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Giúp đồng nghiệp tự xử lý sự cố lặp lại mà không cần chờ hỗ trợ mỗi lần",
              "Chỉ để trang trí",
              "Làm phức tạp thêm quy trình"
            ],
            "correctIndex": 1,
            "explanation": "Tài liệu hướng dẫn giúp tăng khả năng tự xử lý của cả bộ phận, giảm phụ thuộc vào hỗ trợ bên ngoài.",
            "competencyCode": "5.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Ba bước của phương pháp chẩn đoán có hệ thống là gì? A. Đoán, thử, hy vọng B. Tái hiện, thu hẹp phạm vi, loại trừ C. Báo cáo, chờ đợi, kiểm tra D. Khởi động lại, chờ, thử lại Đáp án: B — Đây là quy trình chẩn đoán có hệ thống giúp xác định nguyên nhân chính xác.",
          "2. Một sự cố chỉ xảy ra với một người trong khi đồng nghiệp khác vẫn dùng bình thường gợi ý điều gì? A. Đây chắc chắn là sự cố hệ thống B. Nguyên nhân thường liên quan đến máy hoặc tài khoản của riêng người đó C. Không thể suy luận được gì D. Cần báo động toàn công ty ngay Đáp án: B — Sự cố cục bộ (một người) thường có nguyên nhân riêng biệt khác với sự cố hệ thống.",
          "3. Vì sao nên ghi nhận và theo dõi các sự cố lặp lại? A. Không cần thiết B. Giúp tìm nguyên nhân gốc thay vì chỉ xử lý triệu chứng mỗi lần C. Chỉ để có báo cáo đẹp D. Không có tác dụng thực tế Đáp án: B — Sự cố lặp lại nhiều lần là dấu hiệu cần tìm và giải quyết nguyên nhân gốc.",
          "4. Khi trao đổi với bộ phận kỹ thuật, điều gì giúp tiết kiệm thời gian? A. Chỉ nói “bị lỗi, sửa giúp em” B. Cung cấp thông tin đã chẩn đoán được và đã loại trừ những gì C. Không cần cung cấp thông tin gì D. Chỉ cần gọi điện thoại nhiều lần Đáp án: B — Thông tin đầy đủ giúp bộ phận kỹ thuật không phải lặp lại các bước cơ bản đã thử.",
          "5. Tài liệu hướng dẫn xử lý sự cố cho bộ phận có tác dụng gì? A. Không có tác dụng thực tế B. Giúp đồng nghiệp tự xử lý sự cố lặp lại mà không cần chờ hỗ trợ mỗi lần C. Chỉ để trang trí D. Làm phức tạp thêm quy trình Đáp án: B — Tài liệu hướng dẫn giúp tăng khả năng tự xử lý của cả bộ phận, giảm phụ thuộc vào hỗ trợ bên ngoài."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Đánh giá và lựa chọn giải pháp công nghệ",
        "competencyCode": "5.2",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Giải thích nhu cầu cá nhân",
          "Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó",
          "Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân"
        ],
        "definitions": [
          "Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra",
          "Chi phí toàn phần (total cost of ownership): tổng chi phí thực tế của một giải pháp công nghệ, bao gồm giá mua, đào tạo, chuyển đổi dữ liệu, không chỉ giá niêm yết",
          "Rủi ro phụ thuộc nhà cung cấp: rủi ro khi một tổ chức phụ thuộc quá nhiều vào một nhà cung cấp, khó chuyển sang giải pháp khác nếu cần"
        ],
        "body": [
          "Ở mức trung cấp, việc lựa chọn công cụ số và giải pháp công nghệ có thể có cho nhu cầu cụ thể cần phân tích sâu hơn — phân biệt nhu cầu bắt buộc và nhu cầu mong muốn, tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết.",
          "Bảng so sánh giải pháp theo tiêu chí có trọng số giúp so sánh khách quan. Chi phí toàn phần không chỉ là giá mua mà còn gồm chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen. Rủi ro phụ thuộc nhà cung cấp cần được cân nhắc — nên ưu tiên giải pháp cho phép xuất dữ liệu dễ dàng. Thử nghiệm quy mô nhỏ trước khi triển khai rộng giúp giảm rủi ro."
        ],
        "examples": [],
        "practice": "Chọn một nhu cầu công nghệ thật của bộ phận, so sánh tối thiểu 3 giải pháp theo bảng tiêu chí có trọng số, viết đề xuất 1 trang. Bảng so sánh mẫu: Tiêu chí Trọng số Giải pháp A Giải pháp B Giải pháp C Chi phí 30% Dễ sử dụng 25% Tích hợp hệ thống hiện có 25% Hỗ trợ kỹ thuật 20% Tổng điểm có trọng số",
        "deliverable": "Bảng so sánh giải pháp và đề xuất công nghệ 1 trang.",
        "questions": [
          {
            "number": 1,
            "questionText": "Chi phí toàn phần của một giải pháp công nghệ bao gồm những gì?",
            "options": [
              "Chỉ giá mua hoặc phí đăng ký",
              "Giá mua, chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen",
              "Chỉ chi phí bảo trì",
              "Không thể tính được chi phí toàn phần"
            ],
            "correctIndex": 1,
            "explanation": "Chi phí toàn phần phản ánh đầy đủ hơn giá niêm yết ban đầu.",
            "competencyCode": "5.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Vì sao nên phân biệt nhu cầu bắt buộc và nhu cầu mong muốn khi chọn giải pháp công nghệ?",
            "options": [
              "Không cần phân biệt",
              "Tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết",
              "Chỉ để làm phức tạp thêm quyết định",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Phân biệt rõ giúp tập trung vào giải pháp thực sự giải quyết vấn đề.",
            "competencyCode": "5.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Rủi ro phụ thuộc nhà cung cấp là gì?",
            "options": [
              "Không có rủi ro gì đặc biệt",
              "Khó chuyển sang giải pháp khác nếu dữ liệu bị “khóa” trong hệ thống hiện tại",
              "Chỉ liên quan đến giá cả",
              "Không liên quan đến việc chọn công nghệ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là rủi ro cần cân nhắc, đặc biệt về khả năng xuất dữ liệu khi cần chuyển đổi.",
            "competencyCode": "5.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Vì sao nên thử nghiệm quy mô nhỏ trước khi triển khai rộng?",
            "options": [
              "Không cần thiết, triển khai toàn bộ ngay là tốt nhất",
              "Giúp phát hiện vấn đề trước khi đầu tư toàn bộ, giảm rủi ro",
              "Chỉ làm chậm quá trình triển khai",
              "Không có lợi ích thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Thử nghiệm nhỏ giúp giảm thiểu rủi ro nếu giải pháp không phù hợp như kỳ vọng.",
            "competencyCode": "5.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Bảng so sánh giải pháp theo tiêu chí có trọng số giúp ích gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Cung cấp cơ sở so sánh khách quan hơn là chỉ dựa vào cảm tính",
              "Chỉ để trình bày đẹp mắt",
              "Làm chậm quá trình ra quyết định không cần thiết"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công cụ giúp ra quyết định có căn cứ, khách quan hơn.",
            "competencyCode": "5.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Chi phí toàn phần của một giải pháp công nghệ bao gồm những gì? A. Chỉ giá mua hoặc phí đăng ký B. Giá mua, chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen C. Chỉ chi phí bảo trì D. Không thể tính được chi phí toàn phần Đáp án: B — Chi phí toàn phần phản ánh đầy đủ hơn giá niêm yết ban đầu.",
          "2. Vì sao nên phân biệt nhu cầu bắt buộc và nhu cầu mong muốn khi chọn giải pháp công nghệ? A. Không cần phân biệt B. Tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết C. Chỉ để làm phức tạp thêm quyết định D. Không có tác dụng thực tế Đáp án: B — Phân biệt rõ giúp tập trung vào giải pháp thực sự giải quyết vấn đề.",
          "3. Rủi ro phụ thuộc nhà cung cấp là gì? A. Không có rủi ro gì đặc biệt B. Khó chuyển sang giải pháp khác nếu dữ liệu bị “khóa” trong hệ thống hiện tại C. Chỉ liên quan đến giá cả D. Không liên quan đến việc chọn công nghệ Đáp án: B — Đây là rủi ro cần cân nhắc, đặc biệt về khả năng xuất dữ liệu khi cần chuyển đổi.",
          "4. Vì sao nên thử nghiệm quy mô nhỏ trước khi triển khai rộng? A. Không cần thiết, triển khai toàn bộ ngay là tốt nhất B. Giúp phát hiện vấn đề trước khi đầu tư toàn bộ, giảm rủi ro C. Chỉ làm chậm quá trình triển khai D. Không có lợi ích thực tế Đáp án: B — Thử nghiệm nhỏ giúp giảm thiểu rủi ro nếu giải pháp không phù hợp như kỳ vọng.",
          "5. Bảng so sánh giải pháp theo tiêu chí có trọng số giúp ích gì? A. Không có tác dụng thực tế B. Cung cấp cơ sở so sánh khách quan hơn là chỉ dựa vào cảm tính C. Chỉ để trình bày đẹp mắt D. Làm chậm quá trình ra quyết định không cần thiết Đáp án: B — Đây là công cụ giúp ra quyết định có căn cứ, khách quan hơn."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Cải tiến quy trình bằng công cụ số",
        "competencyCode": "5.3",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm",
          "Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số"
        ],
        "definitions": [
          "Sơ đồ quy trình: biểu diễn trực quan các bước, người thực hiện, đầu vào và đầu ra của một quy trình công việc",
          "Điểm nghẽn (bottleneck): bước trong quy trình gây chậm trễ hoặc tắc nghẽn, ảnh hưởng đến tốc độ hoàn thành toàn bộ quy trình",
          "Điểm bàn giao: thời điểm công việc chuyển từ người này sang người khác trong quy trình"
        ],
        "body": [
          "Ở mức trung cấp, việc gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để giải quyết vấn đề mở rộng thành cải tiến quy trình bằng công nghệ số. Vẽ sơ đồ quy trình hiện tại giúp nhìn thấy toàn cảnh mà mô tả bằng lời dễ bỏ sót.",
          "Nhận diện lãng phí theo các dạng phổ biến: chờ đợi, nhập liệu trùng lặp, phê duyệt thừa, thao tác thủ công lặp lại. Điểm bàn giao giữa người và giữa bộ phận thường là nơi dễ xảy ra chậm trễ nhất. Đo lường hiệu quả trước và sau cải tiến cần dựa trên số liệu cụ thể: thời gian hoàn thành, số lỗi phát sinh."
        ],
        "examples": [],
        "practice": "Chọn một quy trình đang có vấn đề trong bộ phận, vẽ sơ đồ hiện trạng, xác định điểm nghẽn, thiết kế phương án cải tiến và đo thử.",
        "deliverable": "Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường.",
        "questions": [
          {
            "number": 1,
            "questionText": "Điểm bàn giao giữa người hoặc bộ phận trong quy trình thường có đặc điểm gì?",
            "options": [
              "Luôn diễn ra suôn sẻ",
              "Dễ xảy ra chậm trễ hoặc mất thông tin nhất",
              "Không quan trọng bằng các bước khác",
              "Không cần phân tích riêng"
            ],
            "correctIndex": 1,
            "explanation": "Điểm chuyển giao là nơi thường xảy ra vấn đề nhất trong một quy trình.",
            "competencyCode": "5.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "“Nhập liệu trùng lặp” là loại lãng phí nào trong quy trình?",
            "options": [
              "Chờ đợi",
              "Cùng một thông tin phải nhập lại nhiều lần ở các bước khác nhau",
              "Phê duyệt thừa",
              "Không phải là lãng phí"
            ],
            "correctIndex": 1,
            "explanation": "Đây là dạng lãng phí phổ biến khi quy trình không được thiết kế liên kết dữ liệu hợp lý.",
            "competencyCode": "5.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao nên thử nghiệm thay đổi quy trình ở quy mô nhỏ trước?",
            "options": [
              "Không cần thiết",
              "Phát hiện vấn đề chưa lường trước trước khi áp dụng toàn bộ",
              "Chỉ để làm chậm quá trình thay đổi",
              "Không có lợi ích thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Thử nghiệm nhỏ giúp giảm rủi ro khi triển khai thay đổi ở quy mô lớn.",
            "competencyCode": "5.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Đo lường hiệu quả cải tiến nên dựa trên điều gì?",
            "options": [
              "Cảm nhận chủ quan là đủ",
              "Số liệu cụ thể: thời gian hoàn thành, số lỗi, số bước thực hiện",
              "Không cần đo lường",
              "Chỉ cần ý kiến của một người"
            ],
            "correctIndex": 1,
            "explanation": "Số liệu định lượng chứng minh giá trị cải tiến thuyết phục hơn cảm nhận chủ quan.",
            "competencyCode": "5.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Cách hiệu quả để thuyết phục đồng nghiệp chấp nhận thay đổi quy trình là gì?",
            "options": [
              "Áp đặt từ trên xuống không cần giải thích",
              "Giải thích lợi ích cụ thể cho họ và cho họ tham gia thiết kế",
              "Không cần thuyết phục, chỉ cần ra lệnh",
              "Thay đổi âm thầm không thông báo"
            ],
            "correctIndex": 1,
            "explanation": "Sự tham gia và hiểu rõ lợi ích giúp tăng khả năng chấp nhận thay đổi.",
            "competencyCode": "5.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Điểm bàn giao giữa người hoặc bộ phận trong quy trình thường có đặc điểm gì? A. Luôn diễn ra suôn sẻ B. Dễ xảy ra chậm trễ hoặc mất thông tin nhất C. Không quan trọng bằng các bước khác D. Không cần phân tích riêng Đáp án: B — Điểm chuyển giao là nơi thường xảy ra vấn đề nhất trong một quy trình.",
          "2. “Nhập liệu trùng lặp” là loại lãng phí nào trong quy trình? A. Chờ đợi B. Cùng một thông tin phải nhập lại nhiều lần ở các bước khác nhau C. Phê duyệt thừa D. Không phải là lãng phí Đáp án: B — Đây là dạng lãng phí phổ biến khi quy trình không được thiết kế liên kết dữ liệu hợp lý.",
          "3. Vì sao nên thử nghiệm thay đổi quy trình ở quy mô nhỏ trước? A. Không cần thiết B. Phát hiện vấn đề chưa lường trước trước khi áp dụng toàn bộ C. Chỉ để làm chậm quá trình thay đổi D. Không có lợi ích thực tế Đáp án: B — Thử nghiệm nhỏ giúp giảm rủi ro khi triển khai thay đổi ở quy mô lớn.",
          "4. Đo lường hiệu quả cải tiến nên dựa trên điều gì? A. Cảm nhận chủ quan là đủ B. Số liệu cụ thể: thời gian hoàn thành, số lỗi, số bước thực hiện C. Không cần đo lường D. Chỉ cần ý kiến của một người Đáp án: B — Số liệu định lượng chứng minh giá trị cải tiến thuyết phục hơn cảm nhận chủ quan.",
          "5. Cách hiệu quả để thuyết phục đồng nghiệp chấp nhận thay đổi quy trình là gì? A. Áp đặt từ trên xuống không cần giải thích B. Giải thích lợi ích cụ thể cho họ và cho họ tham gia thiết kế C. Không cần thuyết phục, chỉ cần ra lệnh D. Thay đổi âm thầm không thông báo Đáp án: B — Sự tham gia và hiểu rõ lợi ích giúp tăng khả năng chấp nhận thay đổi."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Phát triển năng lực số cho bản thân và nhóm",
        "competencyCode": "5.4",
        "levelRange": "Mức 3–4",
        "objectives": [
          "Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật",
          "Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ",
          "Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số"
        ],
        "definitions": [
          "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Bản đồ năng lực nhóm: tổng hợp mức năng lực số hiện tại của tất cả thành viên trong nhóm theo từng lĩnh vực",
          "Học qua việc: phương thức phát triển năng lực thông qua thực hành trực tiếp trong công việc, thay vì đào tạo tách rời"
        ],
        "body": [
          "Ở mức trung cấp, việc thảo luận về lĩnh vực năng lực số cần cải thiện và hỗ trợ người khác phát triển mở rộng sang phát triển năng lực cho cả nhóm. Đánh giá năng lực nhóm theo khung chuẩn cho phép nhìn thấy bức tranh chung: nhóm mạnh ở đâu, yếu ở đâu.",
          "Các phương thức phát triển năng lực khác nhau phù hợp với tình huống khác nhau: đào tạo chính thức, kèm cặp một-một, học qua việc, chia sẻ nội bộ. Kỹ năng hướng dẫn người khác hiệu quả gồm ba bước: chia nhỏ, làm mẫu, để người học tự làm có quan sát."
        ],
        "examples": [],
        "practice": "Đánh giá năng lực số của nhóm mình theo 6 miền, lập bản đồ khoảng trống và kế hoạch phát triển 6 tháng; thiết kế và thực hiện một buổi chia sẻ nội bộ 30 phút về một kỹ năng cụ thể.",
        "deliverable": "Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ.",
        "questions": [
          {
            "number": 1,
            "questionText": "Phương thức phát triển năng lực nào phù hợp khi cần hướng dẫn sâu một kỹ năng cụ thể cho một người?",
            "options": [
              "Đào tạo chính thức cho nhóm lớn",
              "Kèm cặp một-một",
              "Không cần phương thức đặc biệt",
              "Chỉ cần gửi tài liệu đọc"
            ],
            "correctIndex": 1,
            "explanation": "Kèm cặp một-một phù hợp cho việc hướng dẫn sâu, cá nhân hóa theo nhu cầu cụ thể.",
            "competencyCode": "5.4",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Ba bước của kỹ năng hướng dẫn người khác hiệu quả là gì?",
            "options": [
              "Nói, viết, kiểm tra",
              "Chia nhỏ, làm mẫu, để người học tự làm có quan sát",
              "Ra lệnh, chờ đợi, đánh giá",
              "Không có quy trình cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là quy trình hướng dẫn hiệu quả giúp người học tiếp thu và thực hành đúng cách.",
            "competencyCode": "5.4",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao cần cơ chế duy trì kỹ năng sau đào tạo?",
            "options": [
              "Không cần thiết",
              "Kỹ năng không được sử dụng thường xuyên dễ bị quên đi nhanh chóng",
              "Chỉ để có thêm hoạt động",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Thực hành lặp lại giúp củng cố và duy trì kỹ năng đã học được.",
            "competencyCode": "5.4",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Bản đồ khoảng trống năng lực nhóm giúp ích gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Xác định ai thiếu kỹ năng gì và mức độ ưu tiên xử lý",
              "Chỉ để đánh giá cá nhân",
              "Không liên quan đến kế hoạch phát triển"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cơ sở để lập kế hoạch phát triển năng lực có trọng tâm, ưu tiên đúng.",
            "competencyCode": "5.4",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "“Học qua việc” phù hợp nhất khi nào?",
            "options": [
              "Khi cần kiến thức nền tảng cho nhiều người",
              "Khi kỹ năng cần được thực hành trực tiếp trong bối cảnh công việc thật",
              "Không bao giờ phù hợp",
              "Chỉ phù hợp với nhân viên mới"
            ],
            "correctIndex": 1,
            "explanation": "Học qua việc hiệu quả khi kỹ năng gắn liền với bối cảnh thực tế của công việc.",
            "competencyCode": "5.4",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Phương thức phát triển năng lực nào phù hợp khi cần hướng dẫn sâu một kỹ năng cụ thể cho một người? A. Đào tạo chính thức cho nhóm lớn B. Kèm cặp một-một C. Không cần phương thức đặc biệt D. Chỉ cần gửi tài liệu đọc Đáp án: B — Kèm cặp một-một phù hợp cho việc hướng dẫn sâu, cá nhân hóa theo nhu cầu cụ thể.",
          "2. Ba bước của kỹ năng hướng dẫn người khác hiệu quả là gì? A. Nói, viết, kiểm tra B. Chia nhỏ, làm mẫu, để người học tự làm có quan sát C. Ra lệnh, chờ đợi, đánh giá D. Không có quy trình cụ thể Đáp án: B — Đây là quy trình hướng dẫn hiệu quả giúp người học tiếp thu và thực hành đúng cách.",
          "3. Vì sao cần cơ chế duy trì kỹ năng sau đào tạo? A. Không cần thiết B. Kỹ năng không được sử dụng thường xuyên dễ bị quên đi nhanh chóng C. Chỉ để có thêm hoạt động D. Không có tác dụng thực tế Đáp án: B — Thực hành lặp lại giúp củng cố và duy trì kỹ năng đã học được.",
          "4. Bản đồ khoảng trống năng lực nhóm giúp ích gì? A. Không có tác dụng thực tế B. Xác định ai thiếu kỹ năng gì và mức độ ưu tiên xử lý C. Chỉ để đánh giá cá nhân D. Không liên quan đến kế hoạch phát triển Đáp án: B — Đây là cơ sở để lập kế hoạch phát triển năng lực có trọng tâm, ưu tiên đúng.",
          "5. “Học qua việc” phù hợp nhất khi nào? A. Khi cần kiến thức nền tảng cho nhiều người B. Khi kỹ năng cần được thực hành trực tiếp trong bối cảnh công việc thật C. Không bao giờ phù hợp D. Chỉ phù hợp với nhân viên mới Đáp án: B — Học qua việc hiệu quả khi kỹ năng gắn liền với bối cảnh thực tế của công việc."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M5-I",
      "brief": "Chọn một vấn đề thật của bộ phận, chẩn đoán nguyên nhân, đánh giá giải pháp công nghệ, thiết kế quy trình cải tiến, và lập kế hoạch nâng năng lực nhóm để vận hành quy trình mới.\nTiêu chí chấm:\nChẩn đoán vấn đề có phương pháp, rõ ràng\nĐánh giá và lựa chọn giải pháp công nghệ có căn cứ\nThiết kế quy trình cải tiến, đo lường hiệu quả\nKế hoạch phát triển năng lực nhóm khả thi\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "A5-A": {
    "code": "A5-A",
    "title": "ĐỔI MỚI VÀ DẪN DẮT CHUYỂN ĐỔI SỐ",
    "domainNumber": 5,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 4 module · 12 giờ · Tiên quyết: M5-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Xây dựng năng lực xử lý vấn đề của tổ chức",
        "competencyCode": "5.1",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số",
          "Giải quyết chúng bằng những giải pháp phù hợp nhất"
        ],
        "definitions": [
          "Phân tích nguyên nhân gốc: phương pháp tìm ra nguyên nhân sâu xa thực sự gây ra vấn đề, thay vì chỉ xử lý triệu chứng bề mặt",
          "Kho tri thức nội bộ: hệ thống lưu trữ tập trung các giải pháp, hướng dẫn đã được tích lũy, giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp"
        ],
        "body": [
          "Ở mức nâng cao, việc thẩm định vấn đề kỹ thuật và giải quyết bằng giải pháp phù hợp nhất mở rộng thành xây dựng năng lực xử lý vấn đề của cả tổ chức. Mô hình hỗ trợ nội bộ theo cấp giúp phân bổ nguồn lực hợp lý, với ngưỡng chuyển cấp được xác định rõ.",
          "Phân tích nguyên nhân gốc đi xa hơn việc chỉ xử lý triệu chứng — ví dụ một lỗi nhập liệu lặp lại có thể do giao diện thiết kế dễ gây nhầm lẫn, không phải do nhân viên bất cẩn. Kho tri thức nội bộ có cấu trúc rõ ràng giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp.",
          "Rủi ro phụ thuộc cá nhân xảy ra khi chỉ một người trong tổ chức nắm rõ cách vận hành một hệ thống quan trọng — khi người đó nghỉ phép hoặc rời đi, tổ chức gặp khó khăn nghiêm trọng; giảm rủi ro này đòi hỏi văn bản hóa quy trình và đào tạo dự phòng cho ít nhất một người khác. Khi làm việc với nhà cung cấp dịch vụ hỗ trợ bên ngoài, hợp đồng dịch vụ (SLA) nên quy định rõ thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố, làm cơ sở đánh giá chất lượng dịch vụ nhận được."
        ],
        "examples": [],
        "practice": "Phân tích dữ liệu sự cố của doanh nghiệp trong một giai đoạn (có thể dùng dữ liệu mẫu dưới đây làm điểm khởi đầu, bổ sung dữ liệu thật nếu có), tìm 3 nguyên nhân gốc lặp lại, đề xuất mô hình hỗ trợ và kho tri thức. Dữ liệu mẫu — Nhật ký sự cố 3 tháng (rút gọn): Tháng Loại sự cố Số lần Ghi chú Tháng 1 Không đăng nhập được hệ thống CRM 12 Chủ yếu vào sáng thứ Hai Tháng 1 Lỗi nhập sai định dạng ngày trong báo cáo 8 Nhiều nhân viên khác nhau mắc cùng lỗi Tháng 2 Không đăng nhập được hệ thống CRM 15 Vẫn tập trung sáng thứ Hai Tháng 2 Lỗi nhập sai định dạng ngày 10 Tiếp tục xảy ra Tháng 3 Không đăng nhập được hệ thống CRM 18 Tăng dần theo tháng Tháng 3 Lỗi nhập sai định dạng ngày 9 Không giảm dù đã nhắc nhở nhiều lần (Gợi ý phân tích: sự cố đăng nhập tập trung sáng thứ Hai có thể liên quan đến việc hệ thống bảo trì cuối tuần hoặc quá tải đăng nhập đồng loạt; lỗi định dạng ngày lặp lại dù đã nhắc nhở gợi ý nguyên nhân gốc nằm ở thiết kế biểu mẫu chứ không phải ý thức nhân viên.)",
        "deliverable": "Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức.",
        "questions": [
          {
            "number": 1,
            "questionText": "Phân tích nguyên nhân gốc khác gì so với xử lý triệu chứng?",
            "options": [
              "Không có khác biệt",
              "Tìm nguyên nhân sâu xa thực sự, thay vì chỉ xử lý biểu hiện bề mặt",
              "Nguyên nhân gốc luôn khó tìm hơn",
              "Chỉ áp dụng cho vấn đề kỹ thuật"
            ],
            "correctIndex": 1,
            "explanation": "Giải quyết nguyên nhân gốc mang lại hiệu quả bền vững hơn xử lý triệu chứng lặp lại.",
            "competencyCode": "5.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc nhở nhiều lần gợi ý điều gì?",
            "options": [
              "Nhân viên không đủ năng lực",
              "Nguyên nhân gốc có thể nằm ở thiết kế biểu mẫu, không phải ý thức cá nhân",
              "Cần sa thải nhân viên vi phạm",
              "Không có nguyên nhân cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Lỗi lặp lại ở nhiều người khác nhau thường gợi ý vấn đề hệ thống hơn là vấn đề cá nhân.",
            "competencyCode": "5.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Rủi ro phụ thuộc cá nhân trong vận hành là gì?",
            "options": [
              "Không có rủi ro gì",
              "Khi chỉ một người nắm rõ cách vận hành, tổ chức gặp khó khăn nếu người đó vắng mặt",
              "Chỉ liên quan đến lương thưởng",
              "Không thể giảm thiểu được"
            ],
            "correctIndex": 1,
            "explanation": "Đây là rủi ro thực tế cần được giảm thiểu bằng văn bản hóa và đào tạo dự phòng.",
            "competencyCode": "5.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Kho tri thức nội bộ mang lại lợi ích gì khi có nhân sự rời đi?",
            "options": [
              "Không có lợi ích gì",
              "Kiến thức không bị mất theo cá nhân, tổ chức không phải giải quyết lại từ đầu",
              "Chỉ giúp nhân sự mới làm quen nhanh hơn",
              "Không liên quan đến nhân sự rời đi"
            ],
            "correctIndex": 1,
            "explanation": "Đây là lợi ích cốt lõi của việc xây dựng kho tri thức có hệ thống.",
            "competencyCode": "5.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Hợp đồng dịch vụ (SLA) với nhà cung cấp hỗ trợ bên ngoài nên quy định gì?",
            "options": [
              "Không cần quy định gì cụ thể",
              "Thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố",
              "Chỉ cần quy định giá dịch vụ",
              "Chỉ áp dụng cho hợp đồng lớn"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cơ sở để đánh giá chất lượng dịch vụ hỗ trợ nhận được từ nhà cung cấp.",
            "competencyCode": "5.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Phân tích nguyên nhân gốc khác gì so với xử lý triệu chứng? A. Không có khác biệt B. Tìm nguyên nhân sâu xa thực sự, thay vì chỉ xử lý biểu hiện bề mặt C. Nguyên nhân gốc luôn khó tìm hơn D. Chỉ áp dụng cho vấn đề kỹ thuật Đáp án: B — Giải quyết nguyên nhân gốc mang lại hiệu quả bền vững hơn xử lý triệu chứng lặp lại.",
          "2. Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc nhở nhiều lần gợi ý điều gì? A. Nhân viên không đủ năng lực B. Nguyên nhân gốc có thể nằm ở thiết kế biểu mẫu, không phải ý thức cá nhân C. Cần sa thải nhân viên vi phạm D. Không có nguyên nhân cụ thể Đáp án: B — Lỗi lặp lại ở nhiều người khác nhau thường gợi ý vấn đề hệ thống hơn là vấn đề cá nhân.",
          "3. Rủi ro phụ thuộc cá nhân trong vận hành là gì? A. Không có rủi ro gì B. Khi chỉ một người nắm rõ cách vận hành, tổ chức gặp khó khăn nếu người đó vắng mặt C. Chỉ liên quan đến lương thưởng D. Không thể giảm thiểu được Đáp án: B — Đây là rủi ro thực tế cần được giảm thiểu bằng văn bản hóa và đào tạo dự phòng.",
          "4. Kho tri thức nội bộ mang lại lợi ích gì khi có nhân sự rời đi? A. Không có lợi ích gì B. Kiến thức không bị mất theo cá nhân, tổ chức không phải giải quyết lại từ đầu C. Chỉ giúp nhân sự mới làm quen nhanh hơn D. Không liên quan đến nhân sự rời đi Đáp án: B — Đây là lợi ích cốt lõi của việc xây dựng kho tri thức có hệ thống.",
          "5. Hợp đồng dịch vụ (SLA) với nhà cung cấp hỗ trợ bên ngoài nên quy định gì? A. Không cần quy định gì cụ thể B. Thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố C. Chỉ cần quy định giá dịch vụ D. Chỉ áp dụng cho hợp đồng lớn Đáp án: B — Đây là cơ sở để đánh giá chất lượng dịch vụ hỗ trợ nhận được từ nhà cung cấp."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Chiến lược công nghệ và triển khai thay đổi",
        "competencyCode": "5.2",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Đánh giá được nhu cầu cá nhân",
          "Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó",
          "Quyết định được những cách thích hợp nhất để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân"
        ],
        "definitions": [
          "Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra",
          "Lộ trình công nghệ: kế hoạch có thứ tự ưu tiên về các khoản đầu tư và thay đổi công nghệ trong một khoảng thời gian, gắn với mục tiêu kinh doanh",
          "Mức độ sẵn sàng của tổ chức: khả năng của tổ chức (về hạ tầng, năng lực nhân sự, văn hóa) trong việc tiếp nhận một thay đổi công nghệ mới"
        ],
        "body": [
          "Ở mức nâng cao, việc quyết định cách thích hợp nhất để điều chỉnh môi trường số theo nhu cầu mở rộng thành chiến lược công nghệ cấp tổ chức. Lộ trình công nghệ hiệu quả bắt đầu từ mục tiêu kinh doanh, không phải từ công nghệ đang thịnh hành.",
          "Mức độ sẵn sàng của tổ chức không chỉ là vấn đề kỹ thuật mà còn là vấn đề con người — nhân viên có sẵn sàng thay đổi thói quen làm việc không. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo."
        ],
        "examples": [],
        "practice": "Xây lộ trình công nghệ 12 tháng cho doanh nghiệp: đánh giá hiện trạng, xác định ưu tiên, kế hoạch triển khai cho hạng mục ưu tiên nhất.",
        "deliverable": "Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả.",
        "questions": [
          {
            "number": 1,
            "questionText": "Lộ trình công nghệ nên bắt đầu từ đâu?",
            "options": [
              "Từ công nghệ đang thịnh hành",
              "Từ mục tiêu kinh doanh cụ thể",
              "Từ ngân sách có sẵn",
              "Từ sở thích cá nhân của lãnh đạo"
            ],
            "correctIndex": 1,
            "explanation": "Mục tiêu kinh doanh phải là căn cứ chính để lựa chọn đầu tư công nghệ, không phải xu hướng.",
            "competencyCode": "5.2",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là gì?",
            "options": [
              "Luôn do công nghệ kém chất lượng",
              "Thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo",
              "Không có nguyên nhân phổ biến nào",
              "Chỉ do thiếu ngân sách"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các nguyên nhân thường gặp hơn là vấn đề kỹ thuật thuần túy.",
            "competencyCode": "5.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Mức độ sẵn sàng của tổ chức bao gồm yếu tố nào ngoài kỹ thuật?",
            "options": [
              "Chỉ có yếu tố kỹ thuật là quan trọng",
              "Sự sẵn sàng thay đổi thói quen làm việc và rào cản văn hóa",
              "Không có yếu tố nào khác",
              "Chỉ liên quan đến ngân sách"
            ],
            "correctIndex": 1,
            "explanation": "Yếu tố con người và văn hóa tổ chức quan trọng không kém yếu tố kỹ thuật.",
            "competencyCode": "5.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Ma trận tác động và khả thi dùng để làm gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Ưu tiên đầu tư vào hạng mục vừa có tác động lớn vừa khả thi thực hiện",
              "Chỉ để trình bày báo cáo",
              "Chỉ áp dụng cho dự án nhỏ"
            ],
            "correctIndex": 1,
            "explanation": "Đây là công cụ giúp phân bổ nguồn lực đầu tư một cách hợp lý.",
            "competencyCode": "5.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Đánh giá hiệu quả sau triển khai nên dựa trên điều gì?",
            "options": [
              "Cảm nhận chủ quan sau khi triển khai",
              "Các chỉ số đã đặt ra từ đầu, so sánh với mục tiêu ban đầu",
              "Chỉ tiêu tự đặt ra sau khi biết kết quả",
              "Không cần đánh giá hiệu quả"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá dựa trên chỉ số đặt trước đảm bảo tính khách quan, tránh điều chỉnh tiêu chí sau khi biết kết quả.",
            "competencyCode": "5.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Lộ trình công nghệ nên bắt đầu từ đâu? A. Từ công nghệ đang thịnh hành B. Từ mục tiêu kinh doanh cụ thể C. Từ ngân sách có sẵn D. Từ sở thích cá nhân của lãnh đạo Đáp án: B — Mục tiêu kinh doanh phải là căn cứ chính để lựa chọn đầu tư công nghệ, không phải xu hướng.",
          "2. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là gì? A. Luôn do công nghệ kém chất lượng B. Thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo C. Không có nguyên nhân phổ biến nào D. Chỉ do thiếu ngân sách Đáp án: B — Đây là các nguyên nhân thường gặp hơn là vấn đề kỹ thuật thuần túy.",
          "3. Mức độ sẵn sàng của tổ chức bao gồm yếu tố nào ngoài kỹ thuật? A. Chỉ có yếu tố kỹ thuật là quan trọng B. Sự sẵn sàng thay đổi thói quen làm việc và rào cản văn hóa C. Không có yếu tố nào khác D. Chỉ liên quan đến ngân sách Đáp án: B — Yếu tố con người và văn hóa tổ chức quan trọng không kém yếu tố kỹ thuật.",
          "4. Ma trận tác động và khả thi dùng để làm gì? A. Không có tác dụng thực tế B. Ưu tiên đầu tư vào hạng mục vừa có tác động lớn vừa khả thi thực hiện C. Chỉ để trình bày báo cáo D. Chỉ áp dụng cho dự án nhỏ Đáp án: B — Đây là công cụ giúp phân bổ nguồn lực đầu tư một cách hợp lý.",
          "5. Đánh giá hiệu quả sau triển khai nên dựa trên điều gì? A. Cảm nhận chủ quan sau khi triển khai B. Các chỉ số đã đặt ra từ đầu, so sánh với mục tiêu ban đầu C. Chỉ tiêu tự đặt ra sau khi biết kết quả D. Không cần đánh giá hiệu quả Đáp án: B — Đánh giá dựa trên chỉ số đặt trước đảm bảo tính khách quan, tránh điều chỉnh tiêu chí sau khi biết kết quả."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Đổi mới sáng tạo bằng công nghệ số",
        "competencyCode": "5.3",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm",
          "Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số"
        ],
        "definitions": [
          "Giả thuyết kiểm chứng được: một dự đoán cụ thể có thể được xác nhận đúng hoặc sai thông qua thử nghiệm thực tế",
          "Thử nghiệm quy mô nhỏ (pilot): việc áp dụng một ý tưởng mới ở phạm vi hạn chế để kiểm tra tính khả thi trước khi mở rộng"
        ],
        "body": [
          "Ở mức nâng cao, việc điều chỉnh công cụ và công nghệ số phù hợp nhất để tạo kiến thức mở rộng thành đổi mới sáng tạo cấp tổ chức. Cơ hội đổi mới thường xuất hiện từ ba nguồn: điểm đau của khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng.",
          "Từ ý tưởng ban đầu, cần chuyển hóa thành giả thuyết kiểm chứng được với tiêu chí thành công xác định trước khi chạy thử nghiệm. Thiết kế thử nghiệm nhỏ, chi phí thấp giúp kiểm chứng giả thuyết mà không cần đầu tư lớn ngay từ đầu. Xây dựng văn hóa cho phép thử và sai có kiểm soát đòi hỏi lãnh đạo không trừng phạt thử nghiệm thất bại có phương pháp."
        ],
        "examples": [],
        "practice": "Nhận diện một cơ hội đổi mới trong doanh nghiệp, thiết kế thử nghiệm với giả thuyết và tiêu chí thành công rõ ràng, trình bày phương án.",
        "deliverable": "Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá.",
        "questions": [
          {
            "number": 1,
            "questionText": "Ba nguồn phổ biến của cơ hội đổi mới là gì?",
            "options": [
              "Chỉ có công nghệ mới",
              "Điểm đau khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng",
              "Chỉ từ ý tưởng của lãnh đạo",
              "Không có nguồn cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là ba nguồn cơ hội đổi mới phổ biến trong thực tế doanh nghiệp.",
            "competencyCode": "5.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Vì sao cần chuyển ý tưởng thành giả thuyết kiểm chứng được?",
            "options": [
              "Không cần thiết",
              "Để có thể đo lường kết quả thử nghiệm một cách cụ thể",
              "Chỉ để làm phức tạp thêm ý tưởng",
              "Không có tác dụng thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Giả thuyết cụ thể mới cho phép đánh giá thử nghiệm thành công hay không một cách khách quan.",
            "competencyCode": "5.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Tiêu chí thành công của thử nghiệm nên được xác định khi nào?",
            "options": [
              "Sau khi có kết quả",
              "Trước khi chạy thử nghiệm",
              "Không cần xác định",
              "Tùy ý điều chỉnh trong quá trình"
            ],
            "correctIndex": 1,
            "explanation": "Xác định trước tránh việc diễn giải kết quả theo hướng có lợi sau khi đã biết số liệu.",
            "competencyCode": "5.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp?",
            "options": [
              "Nên trừng phạt để răn đe",
              "Sợ thất bại khiến nhân viên ngại đề xuất ý tưởng mới",
              "Không liên quan đến văn hóa tổ chức",
              "Thất bại luôn nên được khen thưởng"
            ],
            "correctIndex": 1,
            "explanation": "Văn hóa trừng phạt thất bại làm giảm động lực đổi mới trong tổ chức.",
            "competencyCode": "5.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Cách phân biệt cơ hội công nghệ thật với sự cường điệu là gì?",
            "options": [
              "Chạy theo vì nhiều người đang nói về nó",
              "Đặt câu hỏi cụ thể công nghệ đó giải quyết vấn đề gì của tổ chức",
              "Không thể phân biệt được",
              "Luôn tin vào xu hướng truyền thông"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá dựa trên vấn đề cụ thể cần giải quyết giúp tránh chạy theo xu hướng không thực chất.",
            "competencyCode": "5.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Ba nguồn phổ biến của cơ hội đổi mới là gì? A. Chỉ có công nghệ mới B. Điểm đau khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng C. Chỉ từ ý tưởng của lãnh đạo D. Không có nguồn cụ thể Đáp án: B — Đây là ba nguồn cơ hội đổi mới phổ biến trong thực tế doanh nghiệp.",
          "2. Vì sao cần chuyển ý tưởng thành giả thuyết kiểm chứng được? A. Không cần thiết B. Để có thể đo lường kết quả thử nghiệm một cách cụ thể C. Chỉ để làm phức tạp thêm ý tưởng D. Không có tác dụng thực tế Đáp án: B — Giả thuyết cụ thể mới cho phép đánh giá thử nghiệm thành công hay không một cách khách quan.",
          "3. Tiêu chí thành công của thử nghiệm nên được xác định khi nào? A. Sau khi có kết quả B. Trước khi chạy thử nghiệm C. Không cần xác định D. Tùy ý điều chỉnh trong quá trình Đáp án: B — Xác định trước tránh việc diễn giải kết quả theo hướng có lợi sau khi đã biết số liệu.",
          "4. Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp? A. Nên trừng phạt để răn đe B. Sợ thất bại khiến nhân viên ngại đề xuất ý tưởng mới C. Không liên quan đến văn hóa tổ chức D. Thất bại luôn nên được khen thưởng Đáp án: B — Văn hóa trừng phạt thất bại làm giảm động lực đổi mới trong tổ chức.",
          "5. Cách phân biệt cơ hội công nghệ thật với sự cường điệu là gì? A. Chạy theo vì nhiều người đang nói về nó B. Đặt câu hỏi cụ thể công nghệ đó giải quyết vấn đề gì của tổ chức C. Không thể phân biệt được D. Luôn tin vào xu hướng truyền thông Đáp án: B — Đánh giá dựa trên vấn đề cụ thể cần giải quyết giúp tránh chạy theo xu hướng không thực chất."
        ]
      },
      {
        "moduleIndex": 4,
        "title": "Phát triển năng lực số toàn tổ chức",
        "competencyCode": "5.4",
        "levelRange": "Mức 5–6",
        "objectives": [
          "Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình",
          "Đánh giá được sự phát triển năng lực số của người khác",
          "Lựa chọn được những cơ hội thích hợp nhất để phát triển bản thân và cập nhật những phát triển mới"
        ],
        "definitions": [
          "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Đội ngũ nòng cốt: nhóm nhân sự được đào tạo chuyên sâu trước, đóng vai trò lan tỏa kiến thức và hỗ trợ đồng nghiệp trong tổ chức",
          "Lộ trình nghề nghiệp gắn với năng lực số: việc đưa yêu cầu và kết quả phát triển năng lực số vào quá trình đánh giá và thăng tiến của nhân viên"
        ],
        "body": [
          "Ở mức nâng cao, việc quyết định cách thích hợp nhất để cải thiện năng lực số và đánh giá sự phát triển của người khác mở rộng thành phát triển năng lực số toàn tổ chức. Khảo sát và lập bản đồ năng lực số toàn tổ chức cho phép nhìn thấy bức tranh tổng thể.",
          "Chiến lược phát triển năng lực số cấp tổ chức cần cân nhắc ba hướng: tuyển mới, đào tạo lại nhân sự hiện có, thuê ngoài. Xây dựng đội ngũ nòng cốt — đào tạo trước một nhóm nhỏ để lan tỏa kiến thức — là cách mở rộng đào tạo hiệu quả về chi phí. Đo lường hiệu quả đào tạo không nên chỉ dừng ở điểm số mà cần theo dõi thay đổi hành vi thực tế."
        ],
        "examples": [],
        "practice": "Xây chiến lược phát triển năng lực số cho doanh nghiệp: bản đồ hiện trạng theo vị trí, ma trận yêu cầu, phân tích khoảng trống, chương trình đào tạo ưu tiên và bộ chỉ số đo lường.",
        "deliverable": "Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ chỉ số.",
        "questions": [
          {
            "number": 1,
            "questionText": "Ba hướng chiến lược phát triển năng lực số cấp tổ chức là gì?",
            "options": [
              "Chỉ có đào tạo là lựa chọn duy nhất",
              "Tuyển mới, đào tạo lại, thuê ngoài",
              "Chỉ có thuê ngoài",
              "Không có chiến lược cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là ba hướng tiếp cận phù hợp với các tình huống khác nhau về nhu cầu năng lực.",
            "competencyCode": "5.4",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Đội ngũ nòng cốt có vai trò gì trong phát triển năng lực số?",
            "options": [
              "Không có vai trò cụ thể",
              "Được đào tạo trước, sau đó lan tỏa kiến thức cho đồng nghiệp",
              "Chỉ để quản lý hành chính",
              "Chỉ dành cho cấp lãnh đạo"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cách tiếp cận hiệu quả về chi phí để mở rộng phạm vi đào tạo trong tổ chức.",
            "competencyCode": "5.4",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Đo lường hiệu quả đào tạo nên dựa vào điều gì thay vì chỉ điểm số bài kiểm tra?",
            "options": [
              "Chỉ cần điểm số là đủ",
              "Thay đổi hành vi thực tế trong công việc sau đào tạo",
              "Không cần đo lường gì thêm",
              "Chỉ cần số lượng người tham gia"
            ],
            "correctIndex": 1,
            "explanation": "Thay đổi hành vi thực tế phản ánh đào tạo có thực sự tạo ra giá trị hay không.",
            "competencyCode": "5.4",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao nên gắn năng lực số vào lộ trình thăng tiến của nhân viên?",
            "options": [
              "Không có lý do cụ thể",
              "Tạo động lực thực chất cho việc học tập, thay vì đào tạo mang tính hình thức",
              "Chỉ để tăng thêm thủ tục hành chính",
              "Không liên quan đến hiệu quả đào tạo"
            ],
            "correctIndex": 1,
            "explanation": "Gắn kết với sự nghiệp cá nhân tạo động lực học tập mạnh mẽ hơn đào tạo không có hệ quả thực tế.",
            "competencyCode": "5.4",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Khi nào nên chọn hướng “thuê ngoài” thay vì đào tạo nội bộ?",
            "options": [
              "Luôn nên thuê ngoài",
              "Khi nhu cầu không thường xuyên, không đáng đầu tư xây năng lực nội bộ",
              "Không bao giờ nên thuê ngoài",
              "Chỉ khi không có ngân sách"
            ],
            "correctIndex": 1,
            "explanation": "Thuê ngoài phù hợp khi đầu tư xây dựng năng lực nội bộ không hiệu quả về chi phí so với nhu cầu thực tế.",
            "competencyCode": "5.4",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Ba hướng chiến lược phát triển năng lực số cấp tổ chức là gì? A. Chỉ có đào tạo là lựa chọn duy nhất B. Tuyển mới, đào tạo lại, thuê ngoài C. Chỉ có thuê ngoài D. Không có chiến lược cụ thể Đáp án: B — Đây là ba hướng tiếp cận phù hợp với các tình huống khác nhau về nhu cầu năng lực.",
          "2. Đội ngũ nòng cốt có vai trò gì trong phát triển năng lực số? A. Không có vai trò cụ thể B. Được đào tạo trước, sau đó lan tỏa kiến thức cho đồng nghiệp C. Chỉ để quản lý hành chính D. Chỉ dành cho cấp lãnh đạo Đáp án: B — Đây là cách tiếp cận hiệu quả về chi phí để mở rộng phạm vi đào tạo trong tổ chức.",
          "3. Đo lường hiệu quả đào tạo nên dựa vào điều gì thay vì chỉ điểm số bài kiểm tra? A. Chỉ cần điểm số là đủ B. Thay đổi hành vi thực tế trong công việc sau đào tạo C. Không cần đo lường gì thêm D. Chỉ cần số lượng người tham gia Đáp án: B — Thay đổi hành vi thực tế phản ánh đào tạo có thực sự tạo ra giá trị hay không.",
          "4. Vì sao nên gắn năng lực số vào lộ trình thăng tiến của nhân viên? A. Không có lý do cụ thể B. Tạo động lực thực chất cho việc học tập, thay vì đào tạo mang tính hình thức C. Chỉ để tăng thêm thủ tục hành chính D. Không liên quan đến hiệu quả đào tạo Đáp án: B — Gắn kết với sự nghiệp cá nhân tạo động lực học tập mạnh mẽ hơn đào tạo không có hệ quả thực tế.",
          "5. Khi nào nên chọn hướng “thuê ngoài” thay vì đào tạo nội bộ? A. Luôn nên thuê ngoài B. Khi nhu cầu không thường xuyên, không đáng đầu tư xây năng lực nội bộ C. Không bao giờ nên thuê ngoài D. Chỉ khi không có ngân sách Đáp án: B — Thuê ngoài phù hợp khi đầu tư xây dựng năng lực nội bộ không hiệu quả về chi phí so với nhu cầu thực tế."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M5-A",
      "brief": "Xây dựng đề án chuyển đổi số cho doanh nghiệp: đánh giá hiện trạng, lộ trình công nghệ, một đề xuất đổi mới có thiết kế thử nghiệm, và chiến lược phát triển năng lực số đi kèm.\nTiêu chí chấm:\nĐánh giá hiện trạng và năng lực xử lý vấn đề tổ chức\nLộ trình công nghệ gắn với mục tiêu kinh doanh\nĐề xuất đổi mới có thiết kế thử nghiệm rõ ràng\nChiến lược phát triển năng lực số toàn tổ chức\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.",
      "deliverable": "",
      "rubric": []
    }
  },
  "M6-F": {
    "code": "M6-F",
    "title": "ỨNG DỤNG AI CƠ BẢN",
    "domainNumber": 6,
    "level": 1,
    "description": "Mức Cơ bản (Bậc 1–2) · 3 module · 6 giờ",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Hiểu biết cơ bản về AI",
        "competencyCode": "6.1",
        "levelRange": "Bậc 1–2",
        "objectives": [
          "Xác định được khái niệm cơ bản của AI",
          "Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày",
          "Giải thích được nguyên tắc hoạt động cơ bản của AI",
          "Diễn giải được các thuật ngữ liên quan đến AI"
        ],
        "definitions": [
          "Trí tuệ nhân tạo (AI): theo Thông tư 02/2025/TT-BGDĐT, là việc phát triển các hệ thống máy móc có khả năng thực hiện các nhiệm vụ đòi hỏi trí tuệ con người như học tập, suy luận và giải quyết vấn đề",
          "Trí tuệ nhân tạo tạo sinh (Gen AI): một lĩnh vực thuộc AI tập trung vào việc tạo ra dữ liệu mới — văn bản, hình ảnh, âm thanh, video, mã nguồn — dựa trên dữ liệu đầu vào đã được huấn luyện trước đó",
          "Mô hình AI: hệ thống đã được huấn luyện trên một khối lượng lớn dữ liệu để nhận diện quy luật và đưa ra dự đoán hoặc tạo nội dung mới"
        ],
        "body": [
          "AI, nói một cách đơn giản, là các chương trình máy tính được “huấn luyện” từ một khối lượng dữ liệu khổng lồ để nhận diện quy luật, sau đó áp dụng quy luật đó vào tình huống mới. Khác với phần mềm truyền thống được lập trình sẵn từng bước cụ thể, AI học từ ví dụ — giống như một người học nói tiếng Việt bằng cách nghe hàng ngàn câu nói, không phải học thuộc lòng từng quy tắc ngữ pháp.",
          "Gen AI (trí tuệ nhân tạo tạo sinh) là nhóm công cụ AI phổ biến nhất hiện nay mà người đi làm hay gặp: các công cụ trò chuyện dạng văn bản (trả lời câu hỏi, viết nháp email), công cụ tạo hình ảnh từ mô tả bằng chữ, hoặc công cụ chuyển giọng nói thành văn bản.",
          "Trong đời sống và công việc hằng ngày, AI đã hiện diện ở nhiều nơi tưởng chừng không liên quan đến “công nghệ cao”: gợi ý sản phẩm khi mua sắm trực tuyến, bộ lọc thư rác trong email, tính năng tự động hoàn thành khi gõ tin nhắn, ứng dụng dịch thuật, hay hệ thống nhận diện khuôn mặt để mở khóa điện thoại.",
          "Nguyên tắc hoạt động cơ bản của AI có thể hình dung qua ba bước: (1) AI được “cho xem” một lượng lớn dữ liệu mẫu trong quá trình huấn luyện, (2) từ đó AI tự nhận diện các quy luật thống kê trong dữ liệu, (3) khi gặp dữ liệu mới, AI áp dụng quy luật đã học để đưa ra dự đoán hoặc tạo ra nội dung. Điều quan trọng cần hiểu: AI không “hiểu” theo nghĩa con người hiểu — nó dự đoán dựa trên xác suất và mẫu hình đã học, điều này giải thích vì sao đôi khi AI đưa ra câu trả lời nghe rất tự tin nhưng lại sai."
        ],
        "examples": [
          "Chị Mai làm ở bộ phận hành chính, mỗi ngày dùng tính năng gợi ý từ khi gõ tin nhắn trên điện thoại — đây là một dạng AI đơn giản. Cùng lúc đó, công ty chị dùng một hệ thống lọc email tự động phân loại email rác — cũng là AI, nhưng “huấn luyện” trên hàng triệu email đã được đánh dấu là rác/không rác trước đó. Cả hai ví dụ đều là AI, dù một cái chị dùng mỗi ngày mà không để ý, một cái công ty đầu tư triển khai riêng."
        ],
        "practice": "Liệt kê 5 công cụ hoặc ứng dụng có dùng AI mà bản thân từng gặp trong công việc hoặc đời sống hằng ngày (có thể là những thứ rất quen thuộc, không cần “cao siêu”), với mỗi công cụ, giải thích ngắn gọn AI đóng vai trò gì ở đó.",
        "deliverable": "Bảng 5 ứng dụng AI đã gặp kèm giải thích.",
        "questions": [
          {
            "number": 1,
            "questionText": "Theo Thông tư 02/2025/TT-BGDĐT, AI được định nghĩa là gì?",
            "options": [
              "Một loại phần mềm diệt virus",
              "Hệ thống máy móc có khả năng thực hiện nhiệm vụ đòi hỏi trí tuệ con người",
              "Một loại mạng xã hội",
              "Thiết bị lưu trữ dữ liệu"
            ],
            "correctIndex": 1,
            "explanation": "Đây là định nghĩa chính thức theo Thông tư.",
            "competencyCode": "6.1",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Gen AI (trí tuệ nhân tạo tạo sinh) tập trung vào việc gì?",
            "options": [
              "Lưu trữ dữ liệu",
              "Tạo ra dữ liệu mới như văn bản, hình ảnh, âm thanh dựa trên dữ liệu đã huấn luyện",
              "Sửa lỗi phần cứng",
              "Quản lý mạng máy tính"
            ],
            "correctIndex": 1,
            "explanation": "Đây là đặc trưng phân biệt Gen AI với các dạng AI khác.",
            "competencyCode": "6.1",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Vì sao AI đôi khi đưa ra câu trả lời sai dù nghe rất tự tin?",
            "options": [
              "AI luôn cố ý nói sai",
              "AI dự đoán dựa trên xác suất và mẫu hình đã học, không thực sự “hiểu” như con người",
              "AI không có khả năng trả lời",
              "Do lỗi kết nối mạng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bản chất của cách AI hoạt động, khác với suy luận logic của con người.",
            "competencyCode": "6.1",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Đâu là ví dụ về AI trong đời sống hằng ngày?",
            "options": [
              "Chỉ có robot công nghiệp mới là AI",
              "Gợi ý tự động hoàn thành khi gõ tin nhắn cũng là một dạng AI",
              "AI chỉ tồn tại trong phim khoa học viễn tưởng",
              "AI chỉ dùng trong nghiên cứu khoa học"
            ],
            "correctIndex": 1,
            "explanation": "AI đã hiện diện trong nhiều công cụ quen thuộc hằng ngày.",
            "competencyCode": "6.1",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "AI học từ dữ liệu theo cách nào?",
            "options": [
              "Được lập trình sẵn từng bước cụ thể như phần mềm truyền thống",
              "Nhận diện quy luật từ khối lượng lớn dữ liệu mẫu trong quá trình huấn luyện",
              "Không cần dữ liệu để hoạt động",
              "Chỉ hoạt động khi có kết nối Internet"
            ],
            "correctIndex": 1,
            "explanation": "Đây là điểm khác biệt cốt lõi giữa AI và phần mềm truyền thống.",
            "competencyCode": "6.1",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Theo Thông tư 02/2025/TT-BGDĐT, AI được định nghĩa là gì? A. Một loại phần mềm diệt virus B. Hệ thống máy móc có khả năng thực hiện nhiệm vụ đòi hỏi trí tuệ con người C. Một loại mạng xã hội D. Thiết bị lưu trữ dữ liệu Đáp án: B — Đây là định nghĩa chính thức theo Thông tư.",
          "2. Gen AI (trí tuệ nhân tạo tạo sinh) tập trung vào việc gì? A. Lưu trữ dữ liệu B. Tạo ra dữ liệu mới như văn bản, hình ảnh, âm thanh dựa trên dữ liệu đã huấn luyện C. Sửa lỗi phần cứng D. Quản lý mạng máy tính Đáp án: B — Đây là đặc trưng phân biệt Gen AI với các dạng AI khác.",
          "3. Vì sao AI đôi khi đưa ra câu trả lời sai dù nghe rất tự tin? A. AI luôn cố ý nói sai B. AI dự đoán dựa trên xác suất và mẫu hình đã học, không thực sự “hiểu” như con người C. AI không có khả năng trả lời D. Do lỗi kết nối mạng Đáp án: B — Đây là bản chất của cách AI hoạt động, khác với suy luận logic của con người.",
          "4. Đâu là ví dụ về AI trong đời sống hằng ngày? A. Chỉ có robot công nghiệp mới là AI B. Gợi ý tự động hoàn thành khi gõ tin nhắn cũng là một dạng AI C. AI chỉ tồn tại trong phim khoa học viễn tưởng D. AI chỉ dùng trong nghiên cứu khoa học Đáp án: B — AI đã hiện diện trong nhiều công cụ quen thuộc hằng ngày.",
          "5. AI học từ dữ liệu theo cách nào? A. Được lập trình sẵn từng bước cụ thể như phần mềm truyền thống B. Nhận diện quy luật từ khối lượng lớn dữ liệu mẫu trong quá trình huấn luyện C. Không cần dữ liệu để hoạt động D. Chỉ hoạt động khi có kết nối Internet Đáp án: B — Đây là điểm khác biệt cốt lõi giữa AI và phần mềm truyền thống."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Sử dụng công cụ AI cơ bản",
        "competencyCode": "6.2",
        "levelRange": "Bậc 1–2",
        "objectives": [
          "Nhận diện được các công cụ AI đơn giản",
          "Thực hiện được các thao tác cơ bản với công cụ AI",
          "Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI",
          "Áp dụng được công cụ AI để giải quyết vấn đề đơn giản"
        ],
        "definitions": [
          "Yêu cầu (prompt): câu lệnh hoặc câu hỏi mà người dùng nhập vào công cụ AI để nhận được kết quả mong muốn",
          "Công cụ AI công cộng: dịch vụ AI trực tuyến miễn phí hoặc trả phí, không thuộc quyền kiểm soát của doanh nghiệp, dữ liệu nhập vào có thể được lưu trữ hoặc dùng để huấn luyện thêm"
        ],
        "body": [
          "Làm quen với một công cụ AI tạo sinh dạng trò chuyện (chatbot văn bản) là bước khởi đầu phổ biến nhất. Các công cụ này nhận yêu cầu bằng ngôn ngữ tự nhiên (viết như nói chuyện bình thường) và trả về văn bản, có thể là câu trả lời, bản tóm tắt, hoặc bản nháp.",
          "Cách đặt yêu cầu (prompt) cơ bản ảnh hưởng lớn đến chất lượng kết quả. Một yêu cầu mơ hồ (“viết cho tôi cái gì đó về báo cáo”) thường cho kết quả chung chung không dùng được; một yêu cầu cụ thể (nêu rõ chủ đề, độ dài mong muốn, đối tượng đọc) thường cho kết quả sát nhu cầu hơn nhiều.",
          "Nguyên tắc an toàn quan trọng nhất ở mức cơ bản: không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ AI công cộng chưa được doanh nghiệp phê duyệt. Dữ liệu nhập vào các công cụ AI miễn phí trên mạng có thể được lưu trữ trên máy chủ bên ngoài, thậm chí được dùng để huấn luyện lại mô hình — nghĩa là thông tin đó có thể “rò rỉ” ra ngoài phạm vi kiểm soát của doanh nghiệp theo cách không thể thu hồi lại."
        ],
        "examples": [
          "Anh Tuấn cần tóm tắt một bản báo cáo dài 10 trang cho cuộc họp chiều nay. Thay vì đọc và tóm tắt thủ công mất một giờ, anh dùng công cụ AI: dán nội dung báo cáo (đã loại bỏ tên khách hàng và số liệu tài chính nhạy cảm) và yêu cầu “tóm tắt thành 5 gạch đầu dòng, tập trung vào các con số quan trọng”. Anh nhận được bản tóm tắt trong 10 giây, đọc lại để kiểm tra có đúng ý báo cáo gốc không, rồi mới dùng cho cuộc họp. Anh đã làm đúng hai việc: đặt yêu cầu cụ thể, và ẩn thông tin nhạy cảm trước khi dán vào công cụ công cộng."
        ],
        "practice": "Dùng một công cụ AI để hỗ trợ một việc công việc đơn giản (ví dụ: tóm tắt một văn bản, soạn nháp một email, dịch một đoạn văn bản ngắn). Ghi lại yêu cầu (prompt) đã đặt và đánh giá kết quả nhận được có đạt yêu cầu không, cần chỉnh sửa gì.",
        "deliverable": "Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao cách đặt yêu cầu (prompt) ảnh hưởng đến chất lượng kết quả AI?",
            "options": [
              "Không có ảnh hưởng gì",
              "Yêu cầu càng cụ thể, kết quả càng sát nhu cầu thực tế",
              "AI luôn cho kết quả giống nhau bất kể yêu cầu gì",
              "Chỉ ảnh hưởng đến tốc độ trả lời"
            ],
            "correctIndex": 1,
            "explanation": "Yêu cầu mơ hồ thường cho kết quả chung chung, không dùng được.",
            "competencyCode": "6.2",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Nguyên tắc an toàn quan trọng nhất khi dùng công cụ AI công cộng là gì?",
            "options": [
              "Luôn dùng công cụ miễn phí",
              "Không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ chưa được phê duyệt",
              "Chỉ dùng vào buổi sáng",
              "Luôn dùng tiếng Anh khi đặt yêu cầu"
            ],
            "correctIndex": 1,
            "explanation": "Dữ liệu nhập vào công cụ công cộng có thể bị lưu trữ hoặc dùng để huấn luyện ngoài kiểm soát.",
            "competencyCode": "6.2",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Vì sao dữ liệu nhập vào công cụ AI công cộng có thể là rủi ro?",
            "options": [
              "Không có rủi ro gì",
              "Có thể được lưu trữ hoặc dùng để huấn luyện lại mô hình ngoài kiểm soát của doanh nghiệp",
              "Chỉ tốn thêm thời gian",
              "Chỉ ảnh hưởng đến tốc độ xử lý"
            ],
            "correctIndex": 1,
            "explanation": "Đây là rủi ro thực tế cần lưu ý khi dùng công cụ AI chưa được phê duyệt.",
            "competencyCode": "6.2",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Yêu cầu (prompt) nào sau đây hiệu quả hơn?",
            "options": [
              "“Viết cho tôi cái gì đó”",
              "“Tóm tắt báo cáo này thành 5 gạch đầu dòng, tập trung vào số liệu quan trọng”",
              "“Giúp tôi với”",
              "“Làm việc gì đó hay ho”"
            ],
            "correctIndex": 1,
            "explanation": "Yêu cầu cụ thể về định dạng, độ dài và trọng tâm cho kết quả sát nhu cầu hơn.",
            "competencyCode": "6.2",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Trước khi dán một văn bản công việc vào công cụ AI công cộng, nên làm gì?",
            "options": [
              "Không cần làm gì cả",
              "Loại bỏ thông tin nhạy cảm như tên khách hàng, số liệu tài chính",
              "Dịch sang tiếng Anh trước",
              "Chụp ảnh màn hình lại"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bước bảo vệ dữ liệu cần thiết trước khi dùng công cụ công cộng.",
            "competencyCode": "6.2",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. Vì sao cách đặt yêu cầu (prompt) ảnh hưởng đến chất lượng kết quả AI? A. Không có ảnh hưởng gì B. Yêu cầu càng cụ thể, kết quả càng sát nhu cầu thực tế C. AI luôn cho kết quả giống nhau bất kể yêu cầu gì D. Chỉ ảnh hưởng đến tốc độ trả lời Đáp án: B — Yêu cầu mơ hồ thường cho kết quả chung chung, không dùng được.",
          "2. Nguyên tắc an toàn quan trọng nhất khi dùng công cụ AI công cộng là gì? A. Luôn dùng công cụ miễn phí B. Không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ chưa được phê duyệt C. Chỉ dùng vào buổi sáng D. Luôn dùng tiếng Anh khi đặt yêu cầu Đáp án: B — Dữ liệu nhập vào công cụ công cộng có thể bị lưu trữ hoặc dùng để huấn luyện ngoài kiểm soát.",
          "3. Vì sao dữ liệu nhập vào công cụ AI công cộng có thể là rủi ro? A. Không có rủi ro gì B. Có thể được lưu trữ hoặc dùng để huấn luyện lại mô hình ngoài kiểm soát của doanh nghiệp C. Chỉ tốn thêm thời gian D. Chỉ ảnh hưởng đến tốc độ xử lý Đáp án: B — Đây là rủi ro thực tế cần lưu ý khi dùng công cụ AI chưa được phê duyệt.",
          "4. Yêu cầu (prompt) nào sau đây hiệu quả hơn? A. “Viết cho tôi cái gì đó” B. “Tóm tắt báo cáo này thành 5 gạch đầu dòng, tập trung vào số liệu quan trọng” C. “Giúp tôi với” D. “Làm việc gì đó hay ho” Đáp án: B — Yêu cầu cụ thể về định dạng, độ dài và trọng tâm cho kết quả sát nhu cầu hơn.",
          "5. Trước khi dán một văn bản công việc vào công cụ AI công cộng, nên làm gì? A. Không cần làm gì cả B. Loại bỏ thông tin nhạy cảm như tên khách hàng, số liệu tài chính C. Dịch sang tiếng Anh trước D. Chụp ảnh màn hình lại Đáp án: B — Đây là bước bảo vệ dữ liệu cần thiết trước khi dùng công cụ công cộng."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Nhận biết cơ bản về đánh giá AI",
        "competencyCode": "6.3",
        "levelRange": "Bậc 1–2",
        "objectives": [
          "Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá",
          "Mô tả được các chức năng chính của hệ thống AI",
          "Giải thích được cách hoạt động của các hệ thống AI đơn giản",
          "Tóm tắt được đặc điểm và ứng dụng của hệ thống AI"
        ],
        "definitions": [
          "Ảo giác AI (AI hallucination): hiện tượng công cụ AI tạo ra thông tin nghe có vẻ hợp lý, tự tin, nhưng thực chất sai hoặc không có căn cứ thật",
          "Kiểm tra chéo: việc đối chiếu kết quả AI đưa ra với một nguồn khác đáng tin cậy trước khi sử dụng"
        ],
        "body": [
          "Một trong những hiểu lầm phổ biến nhất về AI tạo sinh là tin rằng nó luôn đúng vì trả lời rất tự tin và trôi chảy. Thực tế, các công cụ AI tạo sinh có thể tạo ra thông tin sai lệch — gọi là hiện tượng “ảo giác AI” — mà không hề có dấu hiệu báo trước nào trong cách trình bày. AI có thể bịa ra một con số thống kê, một trích dẫn không tồn tại, hoặc một sự kiện chưa từng xảy ra, tất cả đều được viết với giọng văn chắc chắn như thể đó là sự thật đã kiểm chứng.",
          "Nguyên nhân của hiện tượng này bắt nguồn từ chính cách AI hoạt động: nó dự đoán từ tiếp theo có khả năng xuất hiện cao nhất dựa trên mẫu hình đã học, không phải tra cứu một cơ sở dữ liệu sự thật đã được xác minh. Vì vậy, với các câu hỏi mà AI “không chắc chắn”, nó vẫn có xu hướng tạo ra một câu trả lời nghe hợp lý thay vì nói “tôi không biết”.",
          "Kiểm tra chéo là biện pháp phòng vệ cơ bản nhất: với bất kỳ thông tin quan trọng nào AI đưa ra — đặc biệt số liệu, tên riêng, sự kiện cụ thể — nên tìm một nguồn độc lập khác để xác nhận trước khi sử dụng, đặc biệt khi thông tin đó sẽ được dùng trong công việc hoặc chia sẻ cho người khác."
        ],
        "examples": [
          "Chị Hương hỏi một công cụ AI về quy định nghỉ phép năm theo luật lao động hiện hành. Công cụ trả lời rất chi tiết và tự tin, trích dẫn cả số điều luật cụ thể. Vì đây là thông tin quan trọng sẽ dùng để tư vấn cho đồng nghiệp, chị tra cứu lại trên cổng thông tin chính thức của cơ quan quản lý lao động — và phát hiện số điều luật AI trích dẫn không khớp với văn bản thật, dù nội dung tổng quát là gần đúng. Nếu chị dùng thẳng câu trả lời của AI mà không kiểm tra chéo, thông tin sai lệch đó có thể đã được truyền đi."
        ],
        "practice": "Yêu cầu một công cụ AI trả lời một câu hỏi mà bản thân đã biết đáp án chính xác từ trước (ví dụ một sự kiện lịch sử công ty, một quy định nội bộ, hoặc một kiến thức chuyên môn quen thuộc). So sánh câu trả lời của AI với đáp án đã biết và nhận xét về độ chính xác.",
        "deliverable": "Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có.",
        "questions": [
          {
            "number": 1,
            "questionText": "“Ảo giác AI” (AI hallucination) là hiện tượng gì?",
            "options": [
              "AI bị lỗi kỹ thuật không hoạt động được",
              "AI tạo ra thông tin nghe hợp lý, tự tin nhưng thực chất sai hoặc không có căn cứ",
              "AI hiển thị hình ảnh sai định dạng",
              "AI phản hồi chậm hơn bình thường"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hiện tượng thông tin sai được trình bày một cách tự tin, không có dấu hiệu cảnh báo.",
            "competencyCode": "6.3",
            "level": 1
          },
          {
            "number": 2,
            "questionText": "Vì sao AI có thể tạo ra thông tin sai mà không có dấu hiệu báo trước?",
            "options": [
              "AI luôn cố tình lừa dối",
              "AI dự đoán từ tiếp theo có khả năng cao nhất, không tra cứu cơ sở dữ liệu đã xác minh",
              "AI không có khả năng ngôn ngữ",
              "AI chỉ hoạt động khi có lỗi"
            ],
            "correctIndex": 1,
            "explanation": "Đây là bản chất cách AI tạo sinh hoạt động, dựa trên dự đoán mẫu hình chứ không phải tra cứu sự thật.",
            "competencyCode": "6.3",
            "level": 1
          },
          {
            "number": 3,
            "questionText": "Kiểm tra chéo kết quả AI có ý nghĩa gì?",
            "options": [
              "Không cần thiết nếu AI trả lời tự tin",
              "Đối chiếu kết quả AI với nguồn độc lập khác trước khi sử dụng",
              "Chỉ cần hỏi lại AI một lần nữa",
              "Chỉ áp dụng cho câu hỏi đơn giản"
            ],
            "correctIndex": 1,
            "explanation": "Đây là biện pháp phòng vệ cơ bản với thông tin quan trọng từ AI.",
            "competencyCode": "6.3",
            "level": 1
          },
          {
            "number": 4,
            "questionText": "Khi nào đặc biệt cần kiểm tra chéo kết quả AI?",
            "options": [
              "Không bao giờ cần thiết",
              "Với thông tin quan trọng như số liệu, tên riêng, sự kiện cụ thể sẽ dùng trong công việc",
              "Chỉ khi AI trả lời chậm",
              "Chỉ khi dùng công cụ AI miễn phí"
            ],
            "correctIndex": 1,
            "explanation": "Thông tin quan trọng có tác động lớn nếu sai nên cần được xác minh trước khi sử dụng.",
            "competencyCode": "6.3",
            "level": 1
          },
          {
            "number": 5,
            "questionText": "Vì sao không nên tin tưởng tuyệt đối vào giọng văn tự tin của AI?",
            "options": [
              "AI luôn nói giọng không chắc chắn",
              "Giọng văn tự tin không đồng nghĩa với thông tin chính xác",
              "AI không có khả năng viết tự tin",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hiểu lầm phổ biến cần tránh; độ tự tin trong văn phong không phản ánh độ chính xác thực tế.",
            "competencyCode": "6.3",
            "level": 1
          }
        ],
        "rawQuestions": [
          "1. “Ảo giác AI” (AI hallucination) là hiện tượng gì? A. AI bị lỗi kỹ thuật không hoạt động được B. AI tạo ra thông tin nghe hợp lý, tự tin nhưng thực chất sai hoặc không có căn cứ C. AI hiển thị hình ảnh sai định dạng D. AI phản hồi chậm hơn bình thường Đáp án: B — Đây là hiện tượng thông tin sai được trình bày một cách tự tin, không có dấu hiệu cảnh báo.",
          "2. Vì sao AI có thể tạo ra thông tin sai mà không có dấu hiệu báo trước? A. AI luôn cố tình lừa dối B. AI dự đoán từ tiếp theo có khả năng cao nhất, không tra cứu cơ sở dữ liệu đã xác minh C. AI không có khả năng ngôn ngữ D. AI chỉ hoạt động khi có lỗi Đáp án: B — Đây là bản chất cách AI tạo sinh hoạt động, dựa trên dự đoán mẫu hình chứ không phải tra cứu sự thật.",
          "3. Kiểm tra chéo kết quả AI có ý nghĩa gì? A. Không cần thiết nếu AI trả lời tự tin B. Đối chiếu kết quả AI với nguồn độc lập khác trước khi sử dụng C. Chỉ cần hỏi lại AI một lần nữa D. Chỉ áp dụng cho câu hỏi đơn giản Đáp án: B — Đây là biện pháp phòng vệ cơ bản với thông tin quan trọng từ AI.",
          "4. Khi nào đặc biệt cần kiểm tra chéo kết quả AI? A. Không bao giờ cần thiết B. Với thông tin quan trọng như số liệu, tên riêng, sự kiện cụ thể sẽ dùng trong công việc C. Chỉ khi AI trả lời chậm D. Chỉ khi dùng công cụ AI miễn phí Đáp án: B — Thông tin quan trọng có tác động lớn nếu sai nên cần được xác minh trước khi sử dụng.",
          "5. Vì sao không nên tin tưởng tuyệt đối vào giọng văn tự tin của AI? A. AI luôn nói giọng không chắc chắn B. Giọng văn tự tin không đồng nghĩa với thông tin chính xác C. AI không có khả năng viết tự tin D. Không có lý do cụ thể Đáp án: B — Đây là hiểu lầm phổ biến cần tránh; độ tự tin trong văn phong không phản ánh độ chính xác thực tế."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M6-F",
      "brief": "Sử dụng một công cụ AI để hỗ trợ một việc công việc thật, có kiểm tra chéo kết quả trước khi dùng chính thức.\nYêu cầu:\nXác định công việc cần hỗ trợ và công cụ AI sẽ dùng\nĐặt yêu cầu (prompt) cụ thể, ghi lại yêu cầu đã đặt\nĐảm bảo không đưa thông tin nhạy cảm vào công cụ (nếu có, phải ẩn/loại bỏ trước)\nKiểm tra chéo ít nhất một thông tin quan trọng trong kết quả AI đưa ra\nViết nhận xét: kết quả AI có dùng được không, cần chỉnh sửa gì, có phát hiện sai lệch nào không\nTiêu chí chấm:\nYêu cầu (prompt) đặt ra cụ thể, rõ ràng\nCó ý thức bảo vệ thông tin nhạy cảm trước khi dùng công cụ\nThực hiện kiểm tra chéo ít nhất một thông tin quan trọng\nNhận xét kết quả hợp lý, có căn cứ\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "M6-I": {
    "code": "M6-I",
    "title": "ỨNG DỤNG AI TRUNG CẤP",
    "domainNumber": 6,
    "level": 2,
    "description": "Mức Trung cấp (Bậc 3–4) · 3 module · 7,5 giờ · Tiên quyết: M6-F",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Hiểu biết AI ứng dụng vào công việc",
        "competencyCode": "6.1",
        "levelRange": "Bậc 3–4",
        "objectives": [
          "Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản",
          "Thực hiện được thao tác cơ bản trên các công cụ AI",
          "Phân tích được cách AI hoạt động trong các ứng dụng cụ thể",
          "So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu"
        ],
        "definitions": [
          "Công cụ AI chuyên biệt: công cụ AI được thiết kế tối ưu cho một loại tác vụ cụ thể (viết, thiết kế hình ảnh, phân tích dữ liệu, dịch thuật), khác với công cụ AI đa năng",
          "Đầu vào đa phương tiện (multimodal input): khả năng một số công cụ AI nhận nhiều loại dữ liệu đầu vào — văn bản, hình ảnh, âm thanh — cùng lúc"
        ],
        "body": [
          "Công cụ AI hiện nay không còn là một loại duy nhất — có công cụ chuyên viết văn bản, công cụ chuyên tạo hình ảnh từ mô tả, công cụ chuyên phân tích số liệu trong bảng tính, công cụ chuyên tạo bản trình chiếu, công cụ chuyên dịch thuật. Việc chọn đúng công cụ cho đúng loại việc quan trọng hơn việc chọn công cụ “nổi tiếng nhất” — một công cụ giỏi viết văn bản không nhất thiết giỏi phân tích số liệu.",
          "So sánh các công cụ AI khác nhau cho cùng một loại việc là kỹ năng thực tế cần có: một số công cụ xử lý tiếng Việt tốt hơn công cụ khác, một số có giới hạn về độ dài văn bản đầu vào, một số miễn phí có giới hạn số lượt dùng trong ngày. Không có công cụ nào “tốt nhất tuyệt đối” cho mọi việc — chỉ có công cụ phù hợp hơn cho từng loại nhu cầu cụ thể.",
          "Phân tích cách một công cụ AI hoạt động trong một ứng dụng cụ thể giúp hiểu rõ giới hạn của nó: ví dụ một công cụ tóm tắt văn bản có thể xử lý tốt văn bản dưới một độ dài nhất định, nhưng bắt đầu bỏ sót thông tin khi văn bản quá dài — hiểu được giới hạn này giúp dùng công cụ hiệu quả hơn thay vì kỳ vọng sai."
        ],
        "examples": [
          "Phòng kế toán cần hỗ trợ hai việc khác nhau: viết email nhắc nợ khách hàng (việc văn bản) và tìm quy luật bất thường trong một bảng 2.000 dòng giao dịch (việc phân tích dữ liệu). Dùng cùng một công cụ AI trò chuyện văn bản cho cả hai việc sẽ cho kết quả tốt ở việc đầu nhưng rất hạn chế ở việc sau — công cụ này không được tối ưu để xử lý bảng dữ liệu lớn. Chọn đúng công cụ phân tích dữ liệu chuyên biệt (có thể đọc file bảng tính trực tiếp) cho việc thứ hai sẽ hiệu quả hơn nhiều."
        ],
        "practice": "So sánh 2-3 công cụ AI khác nhau cho cùng một tác vụ công việc cụ thể (ví dụ: tóm tắt văn bản, dịch thuật, hoặc tạo nội dung). Nhận xét công cụ nào phù hợp hơn và vì sao.",
        "deliverable": "Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét).",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao không nên dùng cùng một công cụ AI cho mọi loại việc?",
            "options": [
              "Không có sự khác biệt giữa các công cụ AI",
              "Mỗi công cụ được tối ưu cho loại tác vụ khác nhau, không có công cụ nào tốt nhất tuyệt đối",
              "Chỉ nên dùng công cụ đắt tiền nhất",
              "Công cụ miễn phí luôn kém hơn công cụ trả phí"
            ],
            "correctIndex": 1,
            "explanation": "Mỗi công cụ AI có điểm mạnh riêng phù hợp với loại tác vụ khác nhau.",
            "competencyCode": "6.1",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Hiểu giới hạn của một công cụ AI (ví dụ giới hạn độ dài văn bản xử lý) có ích gì?",
            "options": [
              "Không có ích gì thực tế",
              "Giúp dùng công cụ hiệu quả hơn, tránh kỳ vọng sai",
              "Chỉ để biết thông tin kỹ thuật",
              "Không liên quan đến công việc thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Hiểu giới hạn giúp sử dụng công cụ đúng cách và đạt kết quả tốt hơn.",
            "competencyCode": "6.1",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Công cụ AI chuyên biệt khác công cụ AI đa năng như thế nào?",
            "options": [
              "Không có khác biệt gì",
              "Công cụ chuyên biệt được tối ưu cho một loại tác vụ cụ thể",
              "Công cụ chuyên biệt luôn đắt hơn",
              "Công cụ đa năng luôn tốt hơn công cụ chuyên biệt"
            ],
            "correctIndex": 1,
            "explanation": "Đây là điểm khác biệt giúp lựa chọn công cụ phù hợp với nhu cầu.",
            "competencyCode": "6.1",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Khi cần phân tích một bảng dữ liệu lớn, nên ưu tiên loại công cụ AI nào?",
            "options": [
              "Công cụ AI chuyên viết văn bản thông thường",
              "Công cụ AI chuyên phân tích dữ liệu, có thể đọc trực tiếp file bảng tính",
              "Bất kỳ công cụ nào cũng được",
              "Không nên dùng AI cho việc này"
            ],
            "correctIndex": 1,
            "explanation": "Công cụ chuyên biệt cho phân tích dữ liệu sẽ xử lý hiệu quả hơn công cụ đa năng.",
            "competencyCode": "6.1",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì?",
            "options": [
              "Không có lợi ích thực tế",
              "Giúp nhận biết công cụ nào phù hợp hơn với nhu cầu cụ thể",
              "Chỉ để tốn thời gian",
              "Luôn cho kết quả giống nhau nên không cần so sánh"
            ],
            "correctIndex": 1,
            "explanation": "So sánh giúp đưa ra lựa chọn công cụ có căn cứ, phù hợp nhu cầu thực tế.",
            "competencyCode": "6.1",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Vì sao không nên dùng cùng một công cụ AI cho mọi loại việc? A. Không có sự khác biệt giữa các công cụ AI B. Mỗi công cụ được tối ưu cho loại tác vụ khác nhau, không có công cụ nào tốt nhất tuyệt đối C. Chỉ nên dùng công cụ đắt tiền nhất D. Công cụ miễn phí luôn kém hơn công cụ trả phí Đáp án: B — Mỗi công cụ AI có điểm mạnh riêng phù hợp với loại tác vụ khác nhau.",
          "2. Hiểu giới hạn của một công cụ AI (ví dụ giới hạn độ dài văn bản xử lý) có ích gì? A. Không có ích gì thực tế B. Giúp dùng công cụ hiệu quả hơn, tránh kỳ vọng sai C. Chỉ để biết thông tin kỹ thuật D. Không liên quan đến công việc thực tế Đáp án: B — Hiểu giới hạn giúp sử dụng công cụ đúng cách và đạt kết quả tốt hơn.",
          "3. Công cụ AI chuyên biệt khác công cụ AI đa năng như thế nào? A. Không có khác biệt gì B. Công cụ chuyên biệt được tối ưu cho một loại tác vụ cụ thể C. Công cụ chuyên biệt luôn đắt hơn D. Công cụ đa năng luôn tốt hơn công cụ chuyên biệt Đáp án: B — Đây là điểm khác biệt giúp lựa chọn công cụ phù hợp với nhu cầu.",
          "4. Khi cần phân tích một bảng dữ liệu lớn, nên ưu tiên loại công cụ AI nào? A. Công cụ AI chuyên viết văn bản thông thường B. Công cụ AI chuyên phân tích dữ liệu, có thể đọc trực tiếp file bảng tính C. Bất kỳ công cụ nào cũng được D. Không nên dùng AI cho việc này Đáp án: B — Công cụ chuyên biệt cho phân tích dữ liệu sẽ xử lý hiệu quả hơn công cụ đa năng.",
          "5. So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì? A. Không có lợi ích thực tế B. Giúp nhận biết công cụ nào phù hợp hơn với nhu cầu cụ thể C. Chỉ để tốn thời gian D. Luôn cho kết quả giống nhau nên không cần so sánh Đáp án: B — So sánh giúp đưa ra lựa chọn công cụ có căn cứ, phù hợp nhu cầu thực tế."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Sử dụng AI có đạo đức và trách nhiệm trong công việc",
        "competencyCode": "6.2",
        "levelRange": "Bậc 3–4",
        "objectives": [
          "Sử dụng được công cụ AI trong công việc hằng ngày",
          "Thực hành được kỹ năng sử dụng AI qua bài tập, dự án nhỏ",
          "Xem xét được khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư",
          "Tối ưu hóa được việc sử dụng công cụ AI để đạt hiệu quả cao hơn"
        ],
        "definitions": [
          "Sử dụng AI có trách nhiệm: việc áp dụng AI vào công việc có cân nhắc đến quyền riêng tư, tính chính xác, và ghi nhận rõ phần nào do AI hỗ trợ tạo ra",
          "Kỹ thuật đặt yêu cầu nâng cao (prompt engineering cơ bản): cách xây dựng yêu cầu có ngữ cảnh, ví dụ mẫu, và tiêu chí rõ ràng để cải thiện chất lượng kết quả AI"
        ],
        "body": [
          "Ở mức trung cấp, việc đặt yêu cầu (prompt) cần tinh chỉnh hơn mức cơ bản: cung cấp ngữ cảnh đầy đủ (ai là đối tượng đọc, mục đích sử dụng), đưa ra ví dụ mẫu nếu có (giúp AI hiểu đúng định dạng mong muốn), và chia nhỏ yêu cầu phức tạp thành các bước thay vì yêu cầu AI làm mọi thứ trong một lần.",
          "Quy tắc bảo vệ dữ liệu khi dùng AI trong dự án cần cụ thể hơn mức cơ bản: xác định rõ loại dữ liệu nào tuyệt đối không được đưa vào công cụ AI (thông tin định danh khách hàng, số liệu tài chính chưa công bố, thông tin hợp đồng), và loại dữ liệu nào có thể dùng sau khi đã được ẩn danh hoặc tổng quát hóa.",
          "Ghi nguồn khi dùng nội dung do AI tạo là thực hành có trách nhiệm cần hình thành: khi một phần đáng kể của tài liệu (báo cáo, bài viết, bản trình bày) được AI hỗ trợ tạo ra, nên ghi chú rõ ràng — điều này không chỉ minh bạch mà còn giúp người đọc biết cần kiểm tra kỹ hơn phần nào.",
          "Tối ưu hóa việc sử dụng công cụ AI bao gồm việc học các tính năng nâng cao của công cụ đang dùng (lưu lại các yêu cầu hay dùng, tạo mẫu yêu cầu chuẩn cho công việc lặp lại), giúp tiết kiệm thời gian đáng kể so với việc gõ lại yêu cầu từ đầu mỗi lần."
        ],
        "examples": [
          "Phòng marketing cần viết mười bài giới thiệu sản phẩm ngắn cho mười sản phẩm khác nhau. Thay vì đặt riêng lẻ mười yêu cầu khác nhau, nhân viên xây một mẫu yêu cầu chuẩn (nêu rõ cấu trúc: mở đầu gây chú ý, ba điểm nổi bật, lời kêu gọi hành động, giới hạn 100 từ) và chỉ thay tên/đặc điểm sản phẩm cho mỗi lần dùng. Kết quả đồng đều hơn, thời gian rút ngắn đáng kể. Tất cả các bài đều được ghi chú nội bộ “có hỗ trợ AI trong khâu viết nháp” trước khi chuyển cho người duyệt nội dung kiểm tra lại."
        ],
        "practice": "Dùng AI hỗ trợ một dự án nhỏ của bộ phận (ví dụ: viết loạt nội dung, tổng hợp thông tin từ nhiều nguồn, soạn thảo tài liệu). Áp dụng quy tắc bảo vệ dữ liệu phù hợp trong quá trình thao tác, và ghi chú rõ phần nào có sự hỗ trợ của AI.",
        "deliverable": "Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh dùng, phần nào AI hỗ trợ).",
        "questions": [
          {
            "number": 1,
            "questionText": "Kỹ thuật đặt yêu cầu nâng cao ở mức trung cấp khác gì so với mức cơ bản?",
            "options": [
              "Không có gì khác biệt",
              "Cung cấp ngữ cảnh, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành các bước",
              "Chỉ cần viết ngắn gọn hơn",
              "Không cần nêu rõ mục đích sử dụng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các kỹ thuật giúp cải thiện chất lượng kết quả AI ở mức nâng cao hơn.",
            "competencyCode": "6.2",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Vì sao nên ghi nguồn khi một phần đáng kể tài liệu được AI hỗ trợ tạo ra?",
            "options": [
              "Không cần thiết",
              "Minh bạch và giúp người đọc biết cần kiểm tra kỹ hơn phần nào",
              "Chỉ để tuân thủ hình thức",
              "Làm chậm quá trình làm việc"
            ],
            "correctIndex": 1,
            "explanation": "Đây là thực hành có trách nhiệm, hỗ trợ việc kiểm tra chất lượng sau này.",
            "competencyCode": "6.2",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Tạo mẫu yêu cầu chuẩn cho công việc lặp lại mang lại lợi ích gì?",
            "options": [
              "Không có lợi ích gì",
              "Tiết kiệm thời gian và cho kết quả đồng đều hơn so với gõ lại từ đầu mỗi lần",
              "Chỉ làm phức tạp thêm quy trình",
              "Chỉ phù hợp với công việc một lần"
            ],
            "correctIndex": 1,
            "explanation": "Mẫu chuẩn giúp tăng hiệu quả cho các công việc có tính lặp lại.",
            "competencyCode": "6.2",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Loại dữ liệu nào tuyệt đối không nên đưa vào công cụ AI công cộng khi làm dự án?",
            "options": [
              "Nội dung đã công khai trên website công ty",
              "Thông tin định danh khách hàng, số liệu tài chính chưa công bố",
              "Tiêu đề bài viết chung chung",
              "Cấu trúc một bài viết mẫu"
            ],
            "correctIndex": 1,
            "explanation": "Đây là dữ liệu nhạy cảm cần được bảo vệ nghiêm ngặt.",
            "competencyCode": "6.2",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Sử dụng AI có trách nhiệm bao gồm điều gì?",
            "options": [
              "Chỉ cần dùng AI càng nhiều càng tốt",
              "Cân nhắc quyền riêng tư, tính chính xác, và ghi nhận rõ phần AI hỗ trợ tạo ra",
              "Không cần quan tâm đến quyền riêng tư",
              "Chỉ áp dụng khi có yêu cầu từ cấp trên"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các yếu tố cốt lõi của việc sử dụng AI có trách nhiệm trong công việc.",
            "competencyCode": "6.2",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Kỹ thuật đặt yêu cầu nâng cao ở mức trung cấp khác gì so với mức cơ bản? A. Không có gì khác biệt B. Cung cấp ngữ cảnh, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành các bước C. Chỉ cần viết ngắn gọn hơn D. Không cần nêu rõ mục đích sử dụng Đáp án: B — Đây là các kỹ thuật giúp cải thiện chất lượng kết quả AI ở mức nâng cao hơn.",
          "2. Vì sao nên ghi nguồn khi một phần đáng kể tài liệu được AI hỗ trợ tạo ra? A. Không cần thiết B. Minh bạch và giúp người đọc biết cần kiểm tra kỹ hơn phần nào C. Chỉ để tuân thủ hình thức D. Làm chậm quá trình làm việc Đáp án: B — Đây là thực hành có trách nhiệm, hỗ trợ việc kiểm tra chất lượng sau này.",
          "3. Tạo mẫu yêu cầu chuẩn cho công việc lặp lại mang lại lợi ích gì? A. Không có lợi ích gì B. Tiết kiệm thời gian và cho kết quả đồng đều hơn so với gõ lại từ đầu mỗi lần C. Chỉ làm phức tạp thêm quy trình D. Chỉ phù hợp với công việc một lần Đáp án: B — Mẫu chuẩn giúp tăng hiệu quả cho các công việc có tính lặp lại.",
          "4. Loại dữ liệu nào tuyệt đối không nên đưa vào công cụ AI công cộng khi làm dự án? A. Nội dung đã công khai trên website công ty B. Thông tin định danh khách hàng, số liệu tài chính chưa công bố C. Tiêu đề bài viết chung chung D. Cấu trúc một bài viết mẫu Đáp án: B — Đây là dữ liệu nhạy cảm cần được bảo vệ nghiêm ngặt.",
          "5. Sử dụng AI có trách nhiệm bao gồm điều gì? A. Chỉ cần dùng AI càng nhiều càng tốt B. Cân nhắc quyền riêng tư, tính chính xác, và ghi nhận rõ phần AI hỗ trợ tạo ra C. Không cần quan tâm đến quyền riêng tư D. Chỉ áp dụng khi có yêu cầu từ cấp trên Đáp án: B — Đây là các yếu tố cốt lõi của việc sử dụng AI có trách nhiệm trong công việc."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Đánh giá công cụ AI trong công việc",
        "competencyCode": "6.3",
        "levelRange": "Bậc 3–4",
        "objectives": [
          "Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể",
          "So sánh được hiệu suất của các hệ thống AI khác nhau",
          "Đánh giá được độ chính xác và tin cậy của các hệ thống AI",
          "Xem xét được kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI"
        ],
        "definitions": [
          "Độ chính xác (accuracy) của AI: mức độ kết quả AI đưa ra khớp với thực tế hoặc kỳ vọng đúng",
          "Thiên lệch (bias) trong AI: xu hướng hệ thống AI cho kết quả lệch theo một hướng nhất định do dữ liệu huấn luyện không đại diện đầy đủ"
        ],
        "body": [
          "Đánh giá hiệu quả của một hệ thống AI trong công việc cần dựa trên tiêu chí cụ thể, không chỉ cảm nhận chung chung “thấy hay” hay “thấy dở”. Các tiêu chí thực tế bao gồm: độ chính xác của kết quả so với việc tự làm thủ công, thời gian tiết kiệm được, mức độ cần chỉnh sửa lại trước khi dùng, và tính nhất quán khi lặp lại nhiều lần cho cùng loại việc.",
          "So sánh hiệu suất giữa các hệ thống AI khác nhau cho cùng một loại việc giúp xác định công cụ nào thực sự phù hợp với nhu cầu của bộ phận, thay vì chọn theo cảm tính hoặc theo công cụ đang được nhắc đến nhiều.",
          "Thiên lệch (bias) là vấn đề cần lưu ý khi đánh giá AI: nếu dữ liệu huấn luyện của một hệ thống AI không đại diện đầy đủ (ví dụ chủ yếu dữ liệu tiếng Anh, ít dữ liệu tiếng Việt hoặc bối cảnh Việt Nam), kết quả có thể kém chính xác hoặc kém phù hợp hơn khi áp dụng vào bối cảnh trong nước — đây là điều cần kiểm tra khi đánh giá độ tin cậy của một công cụ trước khi áp dụng rộng rãi.",
          "Đưa ra nhận xét có căn cứ về hiệu quả AI đòi hỏi ghi lại số liệu cụ thể (không chỉ ấn tượng chủ quan): ví dụ “công cụ A tiết kiệm khoảng 30% thời gian so với làm thủ công, nhưng cần chỉnh sửa lại khoảng 20% nội dung trước khi dùng” là nhận xét có căn cứ hơn nhiều so với “công cụ A dùng khá ổn”."
        ],
        "examples": [
          "Phòng nhân sự thử nghiệm dùng AI để sàng lọc sơ yếu lý lịch ứng viên. Sau một tháng thử nghiệm, họ ghi nhận: AI tiết kiệm được khoảng 40% thời gian đọc sơ bộ, nhưng có xu hướng đánh giá thấp hơn các ứng viên có cách trình bày sơ yếu lý lịch không theo mẫu chuẩn phổ biến — một dạng thiên lệch do dữ liệu huấn luyện. Nhận ra điều này, phòng nhân sự quyết định dùng AI như bước sàng lọc sơ bộ hỗ trợ, không phải công cụ quyết định cuối cùng, và vẫn có người xem lại toàn bộ hồ sơ bị AI đánh giá thấp trước khi loại."
        ],
        "practice": "Đánh giá độ chính xác/tin cậy của một kết quả AI tạo ra cho một việc công việc cụ thể. Chỉ ra điểm cần kiểm tra lại hoặc chỉnh sửa trước khi dùng chính thức.",
        "deliverable": "Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa).",
        "questions": [
          {
            "number": 1,
            "questionText": "Đánh giá hiệu quả AI nên dựa trên điều gì?",
            "options": [
              "Chỉ cần cảm nhận chung chung",
              "Tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần chỉnh sửa, tính nhất quán",
              "Chỉ dựa vào độ nổi tiếng của công cụ",
              "Không cần đánh giá, cứ dùng là được"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá có căn cứ cần dựa trên các tiêu chí đo lường được.",
            "competencyCode": "6.3",
            "level": 2
          },
          {
            "number": 2,
            "questionText": "Thiên lệch (bias) trong AI xuất phát từ đâu?",
            "options": [
              "Không có nguyên nhân cụ thể",
              "Dữ liệu huấn luyện không đại diện đầy đủ cho các nhóm hoặc bối cảnh khác nhau",
              "Chỉ do lỗi kỹ thuật ngẫu nhiên",
              "Chỉ xảy ra với công cụ miễn phí"
            ],
            "correctIndex": 1,
            "explanation": "Thiên lệch phản ánh sự thiếu đại diện trong dữ liệu dùng để huấn luyện hệ thống.",
            "competencyCode": "6.3",
            "level": 2
          },
          {
            "number": 3,
            "questionText": "Vì sao cần kiểm tra thiên lệch khi áp dụng AI cho bối cảnh Việt Nam?",
            "options": [
              "Không cần thiết",
              "Nhiều hệ thống AI huấn luyện chủ yếu trên dữ liệu tiếng Anh, có thể kém phù hợp với bối cảnh trong nước",
              "Chỉ cần dùng công cụ tiếng Việt là đủ",
              "Thiên lệch không ảnh hưởng đến kết quả thực tế"
            ],
            "correctIndex": 1,
            "explanation": "Sự thiếu đại diện trong dữ liệu huấn luyện có thể ảnh hưởng đến độ phù hợp khi áp dụng vào bối cảnh cụ thể.",
            "competencyCode": "6.3",
            "level": 2
          },
          {
            "number": 4,
            "questionText": "Nhận xét nào sau đây có căn cứ hơn khi đánh giá AI?",
            "options": [
              "“Công cụ này dùng khá ổn”",
              "“Công cụ tiết kiệm 30% thời gian nhưng cần chỉnh sửa lại 20% nội dung”",
              "“Công cụ này rất tốt”",
              "“Không có ý kiến gì đặc biệt”"
            ],
            "correctIndex": 1,
            "explanation": "Nhận xét có số liệu cụ thể mang tính căn cứ, có thể so sánh và ra quyết định dựa trên đó.",
            "competencyCode": "6.3",
            "level": 2
          },
          {
            "number": 5,
            "questionText": "Trong ví dụ sàng lọc sơ yếu lý lịch bằng AI, cách xử lý thiên lệch phù hợp là gì?",
            "options": [
              "Ngừng hoàn toàn việc dùng AI",
              "Dùng AI như bước sàng lọc sơ bộ hỗ trợ, vẫn có người xem lại các trường hợp bị đánh giá thấp",
              "Tin tưởng hoàn toàn kết quả AI",
              "Không cần điều chỉnh gì"
            ],
            "correctIndex": 1,
            "explanation": "Đây là cách cân bằng giữa tận dụng hiệu quả của AI và kiểm soát rủi ro thiên lệch.",
            "competencyCode": "6.3",
            "level": 2
          }
        ],
        "rawQuestions": [
          "1. Đánh giá hiệu quả AI nên dựa trên điều gì? A. Chỉ cần cảm nhận chung chung B. Tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần chỉnh sửa, tính nhất quán C. Chỉ dựa vào độ nổi tiếng của công cụ D. Không cần đánh giá, cứ dùng là được Đáp án: B — Đánh giá có căn cứ cần dựa trên các tiêu chí đo lường được.",
          "2. Thiên lệch (bias) trong AI xuất phát từ đâu? A. Không có nguyên nhân cụ thể B. Dữ liệu huấn luyện không đại diện đầy đủ cho các nhóm hoặc bối cảnh khác nhau C. Chỉ do lỗi kỹ thuật ngẫu nhiên D. Chỉ xảy ra với công cụ miễn phí Đáp án: B — Thiên lệch phản ánh sự thiếu đại diện trong dữ liệu dùng để huấn luyện hệ thống.",
          "3. Vì sao cần kiểm tra thiên lệch khi áp dụng AI cho bối cảnh Việt Nam? A. Không cần thiết B. Nhiều hệ thống AI huấn luyện chủ yếu trên dữ liệu tiếng Anh, có thể kém phù hợp với bối cảnh trong nước C. Chỉ cần dùng công cụ tiếng Việt là đủ D. Thiên lệch không ảnh hưởng đến kết quả thực tế Đáp án: B — Sự thiếu đại diện trong dữ liệu huấn luyện có thể ảnh hưởng đến độ phù hợp khi áp dụng vào bối cảnh cụ thể.",
          "4. Nhận xét nào sau đây có căn cứ hơn khi đánh giá AI? A. “Công cụ này dùng khá ổn” B. “Công cụ tiết kiệm 30% thời gian nhưng cần chỉnh sửa lại 20% nội dung” C. “Công cụ này rất tốt” D. “Không có ý kiến gì đặc biệt” Đáp án: B — Nhận xét có số liệu cụ thể mang tính căn cứ, có thể so sánh và ra quyết định dựa trên đó.",
          "5. Trong ví dụ sàng lọc sơ yếu lý lịch bằng AI, cách xử lý thiên lệch phù hợp là gì? A. Ngừng hoàn toàn việc dùng AI B. Dùng AI như bước sàng lọc sơ bộ hỗ trợ, vẫn có người xem lại các trường hợp bị đánh giá thấp C. Tin tưởng hoàn toàn kết quả AI D. Không cần điều chỉnh gì Đáp án: B — Đây là cách cân bằng giữa tận dụng hiệu quả của AI và kiểm soát rủi ro thiên lệch."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M6-I",
      "brief": "Hoàn thành một dự án nhỏ của bộ phận có ứng dụng AI, kèm đánh giá độ tin cậy kết quả và tuân thủ quy tắc bảo vệ dữ liệu.\nYêu cầu:\nChọn một dự án nhỏ thật của bộ phận, xác định công cụ AI phù hợp\nSo sánh tối thiểu 2 công cụ AI trước khi chọn (áp dụng Module 1)\nThực hiện dự án với AI hỗ trợ, tuân thủ quy tắc bảo vệ dữ liệu, ghi chú phần AI hỗ trợ (áp dụng Module 2)\nĐánh giá độ chính xác/tin cậy kết quả, chỉ ra điểm cần chỉnh sửa (áp dụng Module 3)\nTiêu chí chấm:\nSo sánh và lựa chọn công cụ có căn cứ\nTuân thủ quy tắc bảo vệ dữ liệu trong quá trình thực hiện\nĐánh giá kết quả AI có tiêu chí cụ thể, không chỉ cảm tính\nSản phẩm dự án hoàn chỉnh, khả dụng\nĐiểm đạt: ≥70/100.",
      "deliverable": "",
      "rubric": []
    }
  },
  "M6-A": {
    "code": "M6-A",
    "title": "ỨNG DỤNG AI NÂNG CAO",
    "domainNumber": 6,
    "level": 3,
    "description": "Mức Nâng cao (Bậc 5–6) · 3 module · 9 giờ · Tiên quyết: M6-I",
    "modules": [
      {
        "moduleIndex": 1,
        "title": "Đánh giá và định hướng ứng dụng AI",
        "competencyCode": "6.1",
        "levelRange": "Bậc 5–6",
        "objectives": [
          "Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể",
          "Kiểm tra được giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau",
          "Tổng hợp được kiến thức để đề xuất cải tiến cho các hệ thống AI",
          "Thiết kế được giải pháp AI phù hợp cho vấn đề phức tạp của tổ chức"
        ],
        "definitions": [
          "Cường điệu công nghệ (hype): hiện tượng một công nghệ được truyền thông và thị trường thổi phồng vượt quá khả năng thực tế của nó tại thời điểm hiện tại",
          "Điểm phù hợp ứng dụng (use-case fit): mức độ một công nghệ AI cụ thể thực sự giải quyết đúng vấn đề của tổ chức, không chỉ vì đang là xu hướng"
        ],
        "body": [
          "Đánh giá cơ hội ứng dụng AI ở cấp tổ chức đòi hỏi phân biệt rõ giữa cường điệu công nghệ và giá trị thực tế. Không phải mọi quy trình đều cần hoặc nên tích hợp AI — câu hỏi cốt lõi cần trả lời trước tiên là “AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp hay không”, chứ không phải “mọi người đang nói về AI nên chúng ta cũng nên dùng”.",
          "Xu hướng ứng dụng AI theo ngành khác nhau đáng kể: một số ngành (nội dung, marketing) có nhiều điểm ứng dụng AI trưởng thành và dễ tiếp cận; một số ngành khác (sản xuất, hậu cần) cần đầu tư hạ tầng lớn hơn để ứng dụng AI hiệu quả. Hiểu rõ vị trí ngành của doanh nghiệp mình trong bức tranh này giúp đặt kỳ vọng thực tế.",
          "Kiểm tra giới hạn và tiềm năng của AI trong một lĩnh vực cụ thể của doanh nghiệp cần dựa trên bằng chứng — thử nghiệm thực tế, không chỉ dựa vào lời quảng cáo của nhà cung cấp công nghệ. Một cách tiếp cận có kỷ luật là: xác định rõ vấn đề, thử nghiệm AI trên quy mô nhỏ, đo lường kết quả bằng số liệu cụ thể, rồi mới quyết định mở rộng."
        ],
        "examples": [
          "Ban giám đốc một công ty thương mại nghe nhiều về AI tạo hình ảnh và cân nhắc đầu tư lớn để tự động hóa toàn bộ khâu thiết kế hình ảnh sản phẩm. Trước khi quyết định, bộ phận phụ trách đánh giá thực tế: thử nghiệm AI tạo hình ảnh cho 20 sản phẩm trong một tháng, đo lường tỷ lệ hình ảnh dùng được ngay (45%), tỷ lệ cần chỉnh sửa nhiều (35%), tỷ lệ không dùng được (20%), và thời gian tiết kiệm thực tế so với thuê thiết kế ngoài. Kết quả cho thấy AI phù hợp làm bước tạo bản nháp ban đầu, không thể thay thế hoàn toàn công đoạn thiết kế — một kết luận thực tế hơn nhiều so với kỳ vọng ban đầu dựa trên cường điệu công nghệ."
        ],
        "practice": "Đánh giá một cơ hội ứng dụng AI cụ thể cho một quy trình của doanh nghiệp. Xác định rõ vấn đề cần giải quyết, đánh giá điểm phù hợp ứng dụng, và đề xuất cách thử nghiệm quy mô nhỏ trước khi mở rộng.",
        "deliverable": "Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm).",
        "questions": [
          {
            "number": 1,
            "questionText": "Câu hỏi cốt lõi cần trả lời trước khi ứng dụng AI vào một quy trình là gì?",
            "options": [
              "“Mọi người đang dùng AI nên chúng ta cũng nên dùng”",
              "“AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp không”",
              "“Công cụ AI nào đắt tiền nhất”",
              "“Đối thủ cạnh tranh có dùng AI không”"
            ],
            "correctIndex": 1,
            "explanation": "Đây là câu hỏi cốt lõi giúp tránh đầu tư theo cường điệu công nghệ.",
            "competencyCode": "6.1",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Cường điệu công nghệ (hype) là gì?",
            "options": [
              "Một loại công nghệ AI mới",
              "Hiện tượng một công nghệ được thổi phồng vượt quá khả năng thực tế",
              "Một phương pháp đánh giá hiệu quả",
              "Một loại dữ liệu huấn luyện"
            ],
            "correctIndex": 1,
            "explanation": "Đây là hiện tượng cần nhận biết để tránh quyết định đầu tư sai lệch.",
            "competencyCode": "6.1",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI là gì?",
            "options": [
              "Đầu tư ngay lập tức vào quy mô lớn",
              "Xác định vấn đề, thử nghiệm quy mô nhỏ, đo lường bằng số liệu, rồi mới quyết định mở rộng",
              "Chỉ dựa vào lời quảng cáo của nhà cung cấp",
              "Không cần đánh giá, cứ triển khai"
            ],
            "correctIndex": 1,
            "explanation": "Đây là quy trình đánh giá có bằng chứng, giảm rủi ro đầu tư sai.",
            "competencyCode": "6.1",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Trong ví dụ về AI tạo hình ảnh sản phẩm, kết luận thực tế sau thử nghiệm là gì?",
            "options": [
              "AI hoàn toàn thay thế được thiết kế viên",
              "AI phù hợp làm bước tạo bản nháp ban đầu, không thay thế hoàn toàn công đoạn thiết kế",
              "AI hoàn toàn không có giá trị",
              "Không có kết luận rõ ràng"
            ],
            "correctIndex": 1,
            "explanation": "Đây là kết luận thực tế, cân bằng dựa trên số liệu thử nghiệm, khác với kỳ vọng ban đầu.",
            "competencyCode": "6.1",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành?",
            "options": [
              "Không có sự khác biệt nào",
              "Mức độ trưởng thành và dễ tiếp cận của điểm ứng dụng AI khác nhau theo ngành",
              "Chỉ do sở thích của lãnh đạo doanh nghiệp",
              "AI chỉ áp dụng được cho một ngành duy nhất"
            ],
            "correctIndex": 1,
            "explanation": "Sự khác biệt về đặc thù ngành ảnh hưởng đến mức độ và cách ứng dụng AI phù hợp.",
            "competencyCode": "6.1",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Câu hỏi cốt lõi cần trả lời trước khi ứng dụng AI vào một quy trình là gì? A. “Mọi người đang dùng AI nên chúng ta cũng nên dùng” B. “AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp không” C. “Công cụ AI nào đắt tiền nhất” D. “Đối thủ cạnh tranh có dùng AI không” Đáp án: B — Đây là câu hỏi cốt lõi giúp tránh đầu tư theo cường điệu công nghệ.",
          "2. Cường điệu công nghệ (hype) là gì? A. Một loại công nghệ AI mới B. Hiện tượng một công nghệ được thổi phồng vượt quá khả năng thực tế C. Một phương pháp đánh giá hiệu quả D. Một loại dữ liệu huấn luyện Đáp án: B — Đây là hiện tượng cần nhận biết để tránh quyết định đầu tư sai lệch.",
          "3. Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI là gì? A. Đầu tư ngay lập tức vào quy mô lớn B. Xác định vấn đề, thử nghiệm quy mô nhỏ, đo lường bằng số liệu, rồi mới quyết định mở rộng C. Chỉ dựa vào lời quảng cáo của nhà cung cấp D. Không cần đánh giá, cứ triển khai Đáp án: B — Đây là quy trình đánh giá có bằng chứng, giảm rủi ro đầu tư sai.",
          "4. Trong ví dụ về AI tạo hình ảnh sản phẩm, kết luận thực tế sau thử nghiệm là gì? A. AI hoàn toàn thay thế được thiết kế viên B. AI phù hợp làm bước tạo bản nháp ban đầu, không thay thế hoàn toàn công đoạn thiết kế C. AI hoàn toàn không có giá trị D. Không có kết luận rõ ràng Đáp án: B — Đây là kết luận thực tế, cân bằng dựa trên số liệu thử nghiệm, khác với kỳ vọng ban đầu.",
          "5. Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành? A. Không có sự khác biệt nào B. Mức độ trưởng thành và dễ tiếp cận của điểm ứng dụng AI khác nhau theo ngành C. Chỉ do sở thích của lãnh đạo doanh nghiệp D. AI chỉ áp dụng được cho một ngành duy nhất Đáp án: B — Sự khác biệt về đặc thù ngành ảnh hưởng đến mức độ và cách ứng dụng AI phù hợp."
        ]
      },
      {
        "moduleIndex": 2,
        "title": "Lãnh đạo ứng dụng AI có trách nhiệm",
        "competencyCode": "6.2",
        "levelRange": "Bậc 5–6",
        "objectives": [
          "Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể",
          "Điều chỉnh được hệ thống AI để phù hợp với nhu cầu cụ thể",
          "Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI",
          "Tích hợp được công cụ AI vào quy trình làm việc hiện có"
        ],
        "definitions": [
          "Quy tắc sử dụng AI nội bộ: văn bản do doanh nghiệp ban hành quy định rõ ai được dùng AI cho việc gì, dữ liệu nào không được đưa vào, và trách nhiệm khi có sai sót",
          "Trách nhiệm giải trình (accountability): nguyên tắc con người vẫn phải chịu trách nhiệm cuối cùng về quyết định, kể cả khi quyết định đó có sự hỗ trợ của AI"
        ],
        "body": [
          "Xây quy tắc sử dụng AI cho bộ phận hoặc toàn doanh nghiệp là bước cần thiết khi việc dùng AI trở nên phổ biến, không còn là hoạt động cá nhân tự phát. Quy tắc này cần nêu rõ: những công cụ AI nào đã được phê duyệt sử dụng, loại dữ liệu nào tuyệt đối không được đưa vào bất kỳ công cụ AI nào, quy trình phê duyệt khi muốn dùng một công cụ AI mới, và ai chịu trách nhiệm khi có sai sót phát sinh từ việc dùng AI.",
          "Nguyên tắc trách nhiệm giải trình cần được khẳng định rõ ràng: dù một quyết định có sự hỗ trợ hoặc gợi ý từ AI, người ra quyết định cuối cùng vẫn là con người và vẫn phải chịu trách nhiệm về quyết định đó. “AI gợi ý như vậy” không phải là lý do biện minh hợp lệ khi có sai sót xảy ra — đây là nguyên tắc quan trọng cần được quán triệt trong văn hóa sử dụng AI của tổ chức.",
          "Rủi ro pháp lý khi dùng nội dung AI tạo cho mục đích thương mại cần được đánh giá cẩn trọng: vấn đề quyền sở hữu nội dung do AI tạo ra hiện vẫn là vùng pháp lý chưa hoàn toàn rõ ràng ở nhiều nơi, và một số công cụ AI có thể tạo ra nội dung gần giống với tài liệu có bản quyền đã tồn tại mà không có cảnh báo. Doanh nghiệp nên thận trọng khi dùng nội dung AI tạo cho các mục đích thương mại quan trọng (logo, khẩu hiệu thương hiệu chính thức) và có bước rà soát trước khi công bố chính thức."
        ],
        "examples": [
          "Sau vài tháng nhân viên các phòng ban tự phát dùng nhiều công cụ AI khác nhau không kiểm soát, ban giám đốc một doanh nghiệp nhận thấy rủi ro: có trường hợp một nhân viên đã dán một phần hợp đồng khách hàng vào công cụ AI công cộng để “tóm tắt cho nhanh”. Doanh nghiệp ban hành quy tắc sử dụng AI nội bộ: chỉ định hai công cụ AI đã được phê duyệt và đánh giá an toàn dữ liệu, cấm tuyệt đối đưa hợp đồng/thông tin tài chính khách hàng vào bất kỳ công cụ AI nào chưa được phê duyệt, và yêu cầu mọi nội dung công khai ra bên ngoài (bài đăng, tài liệu marketing) có hỗ trợ AI phải qua một người kiểm duyệt trước khi công bố."
        ],
        "practice": "Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho bộ phận hoặc doanh nghiệp, bao gồm: công cụ được phê duyệt, dữ liệu cấm đưa vào AI, quy trình phê duyệt công cụ mới, và trách nhiệm giải trình.",
        "deliverable": "Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên).",
        "questions": [
          {
            "number": 1,
            "questionText": "Nguyên tắc trách nhiệm giải trình trong sử dụng AI nghĩa là gì?",
            "options": [
              "AI chịu trách nhiệm hoàn toàn về quyết định",
              "Con người vẫn chịu trách nhiệm cuối cùng về quyết định, dù có sự hỗ trợ từ AI",
              "Không ai chịu trách nhiệm khi có sai sót",
              "Trách nhiệm thuộc về nhà cung cấp công cụ AI"
            ],
            "correctIndex": 1,
            "explanation": "Đây là nguyên tắc quan trọng, “AI gợi ý vậy” không phải lý do biện minh hợp lệ.",
            "competencyCode": "6.2",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Quy tắc sử dụng AI nội bộ cần nêu rõ những gì?",
            "options": [
              "Chỉ cần nêu tên công cụ AI",
              "Công cụ được phê duyệt, dữ liệu cấm đưa vào, quy trình phê duyệt, trách nhiệm khi sai sót",
              "Không cần văn bản chính thức",
              "Chỉ áp dụng cho cấp quản lý"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các nội dung cốt lõi cần có trong quy tắc sử dụng AI nội bộ.",
            "competencyCode": "6.2",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Vì sao cần thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng?",
            "options": [
              "Không cần thận trọng gì",
              "Vấn đề quyền sở hữu nội dung AI tạo ra còn chưa hoàn toàn rõ ràng về pháp lý",
              "Nội dung AI tạo luôn có bản quyền rõ ràng",
              "Chỉ cần thận trọng với nội dung miễn phí"
            ],
            "correctIndex": 1,
            "explanation": "Đây là vùng pháp lý còn đang phát triển, cần thận trọng để tránh rủi ro.",
            "competencyCode": "6.2",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Trong ví dụ về hợp đồng khách hàng bị dán vào công cụ AI công cộng, bài học rút ra là gì?",
            "options": [
              "Không nên dùng AI nữa",
              "Cần có quy tắc rõ ràng về công cụ được phép dùng và dữ liệu cấm đưa vào",
              "Chỉ cần nhắc nhở nhân viên bằng miệng",
              "Không có bài học gì đặc biệt"
            ],
            "correctIndex": 1,
            "explanation": "Sự cố này cho thấy cần có quy tắc chính thức thay vì để nhân viên tự phát quyết định.",
            "competencyCode": "6.2",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Nội dung công khai ra bên ngoài có hỗ trợ AI nên được xử lý như thế nào trước khi công bố?",
            "options": [
              "Công bố ngay không cần kiểm tra",
              "Qua một người kiểm duyệt trước khi công bố chính thức",
              "Chỉ cần AI tự kiểm tra",
              "Không cần quy trình gì đặc biệt"
            ],
            "correctIndex": 1,
            "explanation": "Bước kiểm duyệt con người giúp giảm rủi ro về nội dung sai lệch hoặc vi phạm bản quyền.",
            "competencyCode": "6.2",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Nguyên tắc trách nhiệm giải trình trong sử dụng AI nghĩa là gì? A. AI chịu trách nhiệm hoàn toàn về quyết định B. Con người vẫn chịu trách nhiệm cuối cùng về quyết định, dù có sự hỗ trợ từ AI C. Không ai chịu trách nhiệm khi có sai sót D. Trách nhiệm thuộc về nhà cung cấp công cụ AI Đáp án: B — Đây là nguyên tắc quan trọng, “AI gợi ý vậy” không phải lý do biện minh hợp lệ.",
          "2. Quy tắc sử dụng AI nội bộ cần nêu rõ những gì? A. Chỉ cần nêu tên công cụ AI B. Công cụ được phê duyệt, dữ liệu cấm đưa vào, quy trình phê duyệt, trách nhiệm khi sai sót C. Không cần văn bản chính thức D. Chỉ áp dụng cho cấp quản lý Đáp án: B — Đây là các nội dung cốt lõi cần có trong quy tắc sử dụng AI nội bộ.",
          "3. Vì sao cần thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng? A. Không cần thận trọng gì B. Vấn đề quyền sở hữu nội dung AI tạo ra còn chưa hoàn toàn rõ ràng về pháp lý C. Nội dung AI tạo luôn có bản quyền rõ ràng D. Chỉ cần thận trọng với nội dung miễn phí Đáp án: B — Đây là vùng pháp lý còn đang phát triển, cần thận trọng để tránh rủi ro.",
          "4. Trong ví dụ về hợp đồng khách hàng bị dán vào công cụ AI công cộng, bài học rút ra là gì? A. Không nên dùng AI nữa B. Cần có quy tắc rõ ràng về công cụ được phép dùng và dữ liệu cấm đưa vào C. Chỉ cần nhắc nhở nhân viên bằng miệng D. Không có bài học gì đặc biệt Đáp án: B — Sự cố này cho thấy cần có quy tắc chính thức thay vì để nhân viên tự phát quyết định.",
          "5. Nội dung công khai ra bên ngoài có hỗ trợ AI nên được xử lý như thế nào trước khi công bố? A. Công bố ngay không cần kiểm tra B. Qua một người kiểm duyệt trước khi công bố chính thức C. Chỉ cần AI tự kiểm tra D. Không cần quy trình gì đặc biệt Đáp án: B — Bước kiểm duyệt con người giúp giảm rủi ro về nội dung sai lệch hoặc vi phạm bản quyền."
        ]
      },
      {
        "moduleIndex": 3,
        "title": "Xây dựng năng lực đánh giá AI cho tổ chức",
        "competencyCode": "6.3",
        "levelRange": "Bậc 5–6",
        "objectives": [
          "Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI",
          "Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra",
          "Đưa ra được khuyến nghị cải tiến cho hệ thống AI dựa trên kết quả đánh giá",
          "Phát triển được tiêu chuẩn và hướng dẫn đánh giá hệ thống AI cho tổ chức"
        ],
        "definitions": [
          "Tiêu chí đánh giá công cụ AI: bộ tiêu chuẩn có hệ thống dùng để so sánh và lựa chọn công cụ AI trước khi đưa vào sử dụng chính thức trong tổ chức",
          "Thử nghiệm có kiểm soát (pilot): việc áp dụng một công cụ AI ở phạm vi hạn chế, có đo lường kết quả, trước khi quyết định mở rộng toàn tổ chức"
        ],
        "body": [
          "Xây bộ tiêu chí đánh giá có hệ thống để lựa chọn công cụ AI cho tổ chức giúp tránh quyết định theo cảm tính hoặc theo quảng cáo của nhà cung cấp. Các tiêu chí nên bao gồm: độ chính xác trên bài kiểm tra thử với dữ liệu thật của tổ chức, mức độ bảo mật dữ liệu của nhà cung cấp (dữ liệu có được dùng để huấn luyện lại không, có được lưu trữ ở đâu), chi phí và mô hình tính phí, khả năng tích hợp với hệ thống hiện có, và chất lượng hỗ trợ kỹ thuật.",
          "Quy trình thử nghiệm có kiểm soát trước khi áp dụng rộng là bước không thể bỏ qua: chọn một nhóm nhỏ người dùng, một phạm vi công việc giới hạn, chạy thử trong một khoảng thời gian xác định, thu thập phản hồi và số liệu cụ thể, rồi mới quyết định có mở rộng hay không. Cách làm này giảm thiểu rủi ro nếu công cụ không phù hợp như kỳ vọng, đồng thời tạo ra bằng chứng cụ thể để thuyết phục các bên liên quan khi cần mở rộng đầu tư.",
          "Phát triển hướng dẫn đánh giá không chỉ dừng ở việc chọn công cụ ban đầu — cần có cơ chế đánh giá định kỳ sau khi đã triển khai, vì cả nhu cầu của tổ chức và bản thân công nghệ AI đều thay đổi nhanh, một công cụ phù hợp hôm nay có thể không còn là lựa chọn tốt nhất sau một năm."
        ],
        "examples": [
          "Một doanh nghiệp cân nhắc giữa ba công cụ AI hỗ trợ chăm sóc khách hàng qua chat. Thay vì chọn theo tên tuổi thương hiệu, bộ phận phụ trách xây bảng tiêu chí có trọng số: độ chính xác khi trả lời 50 câu hỏi thường gặp thực tế của khách hàng (30%), chính sách bảo mật dữ liệu hội thoại khách hàng (30%), chi phí theo số lượng hội thoại (20%), khả năng tích hợp với hệ thống quản lý khách hàng hiện có (20%). Sau khi chấm điểm khách quan theo bảng này, họ chọn công cụ xếp thứ hai về độ chính xác nhưng có chính sách bảo mật dữ liệu rõ ràng và minh bạch nhất — một quyết định có căn cứ, không chỉ dựa vào một tiêu chí duy nhất."
        ],
        "practice": "Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI áp dụng cho một nhu cầu cụ thể của doanh nghiệp, và thiết kế kế hoạch thử nghiệm có kiểm soát trước khi mở rộng.",
        "deliverable": "Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát.",
        "questions": [
          {
            "number": 1,
            "questionText": "Vì sao nên xây bộ tiêu chí đánh giá có hệ thống thay vì chọn công cụ AI theo cảm tính?",
            "options": [
              "Không có sự khác biệt về kết quả",
              "Tránh quyết định theo quảng cáo, đảm bảo lựa chọn có căn cứ khách quan",
              "Chỉ để tốn thêm thời gian",
              "Không cần thiết nếu công cụ nổi tiếng"
            ],
            "correctIndex": 1,
            "explanation": "Tiêu chí có hệ thống giúp đưa ra quyết định khách quan, có thể giải trình được.",
            "competencyCode": "6.3",
            "level": 3
          },
          {
            "number": 2,
            "questionText": "Thử nghiệm có kiểm soát (pilot) trước khi áp dụng rộng có lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Giảm rủi ro nếu công cụ không phù hợp, tạo bằng chứng cụ thể để quyết định mở rộng",
              "Chỉ làm chậm quá trình triển khai",
              "Không cần thiết nếu đã có tiêu chí đánh giá"
            ],
            "correctIndex": 1,
            "explanation": "Thử nghiệm nhỏ cung cấp bằng chứng thực tế trước khi đầu tư quy mô lớn.",
            "competencyCode": "6.3",
            "level": 3
          },
          {
            "number": 3,
            "questionText": "Trong ví dụ chọn công cụ AI chăm sóc khách hàng, vì sao doanh nghiệp không chọn công cụ có độ chính xác cao nhất?",
            "options": [
              "Do nhầm lẫn trong đánh giá",
              "Vì đánh giá tổng thể theo nhiều tiêu chí có trọng số, không chỉ dựa vào một tiêu chí duy nhất",
              "Vì công cụ đó đắt hơn",
              "Không có lý do cụ thể"
            ],
            "correctIndex": 1,
            "explanation": "Quyết định dựa trên đánh giá đa tiêu chí, cân bằng giữa độ chính xác và bảo mật dữ liệu.",
            "competencyCode": "6.3",
            "level": 3
          },
          {
            "number": 4,
            "questionText": "Vì sao cần đánh giá định kỳ công cụ AI sau khi đã triển khai, không chỉ đánh giá một lần ban đầu?",
            "options": [
              "Không cần thiết một khi đã chọn xong",
              "Nhu cầu tổ chức và công nghệ AI đều thay đổi nhanh, công cụ phù hợp hôm nay có thể không còn tốt nhất sau này",
              "Chỉ để tăng thêm công việc",
              "Không có lý do liên quan đến hiệu quả"
            ],
            "correctIndex": 1,
            "explanation": "Đánh giá định kỳ đảm bảo công cụ đang dùng vẫn là lựa chọn phù hợp nhất theo thời gian.",
            "competencyCode": "6.3",
            "level": 3
          },
          {
            "number": 5,
            "questionText": "Tiêu chí nào sau đây nên có trong bộ đánh giá công cụ AI cho tổ chức?",
            "options": [
              "Chỉ cần xem giá cả",
              "Độ chính xác, bảo mật dữ liệu, chi phí, khả năng tích hợp, chất lượng hỗ trợ kỹ thuật",
              "Chỉ cần độ nổi tiếng của thương hiệu",
              "Chỉ cần ý kiến của một người quyết định"
            ],
            "correctIndex": 1,
            "explanation": "Đây là các tiêu chí toàn diện giúp đánh giá công cụ AI một cách khách quan và đầy đủ.",
            "competencyCode": "6.3",
            "level": 3
          }
        ],
        "rawQuestions": [
          "1. Vì sao nên xây bộ tiêu chí đánh giá có hệ thống thay vì chọn công cụ AI theo cảm tính? A. Không có sự khác biệt về kết quả B. Tránh quyết định theo quảng cáo, đảm bảo lựa chọn có căn cứ khách quan C. Chỉ để tốn thêm thời gian D. Không cần thiết nếu công cụ nổi tiếng Đáp án: B — Tiêu chí có hệ thống giúp đưa ra quyết định khách quan, có thể giải trình được.",
          "2. Thử nghiệm có kiểm soát (pilot) trước khi áp dụng rộng có lợi ích gì? A. Không có lợi ích cụ thể B. Giảm rủi ro nếu công cụ không phù hợp, tạo bằng chứng cụ thể để quyết định mở rộng C. Chỉ làm chậm quá trình triển khai D. Không cần thiết nếu đã có tiêu chí đánh giá Đáp án: B — Thử nghiệm nhỏ cung cấp bằng chứng thực tế trước khi đầu tư quy mô lớn.",
          "3. Trong ví dụ chọn công cụ AI chăm sóc khách hàng, vì sao doanh nghiệp không chọn công cụ có độ chính xác cao nhất? A. Do nhầm lẫn trong đánh giá B. Vì đánh giá tổng thể theo nhiều tiêu chí có trọng số, không chỉ dựa vào một tiêu chí duy nhất C. Vì công cụ đó đắt hơn D. Không có lý do cụ thể Đáp án: B — Quyết định dựa trên đánh giá đa tiêu chí, cân bằng giữa độ chính xác và bảo mật dữ liệu.",
          "4. Vì sao cần đánh giá định kỳ công cụ AI sau khi đã triển khai, không chỉ đánh giá một lần ban đầu? A. Không cần thiết một khi đã chọn xong B. Nhu cầu tổ chức và công nghệ AI đều thay đổi nhanh, công cụ phù hợp hôm nay có thể không còn tốt nhất sau này C. Chỉ để tăng thêm công việc D. Không có lý do liên quan đến hiệu quả Đáp án: B — Đánh giá định kỳ đảm bảo công cụ đang dùng vẫn là lựa chọn phù hợp nhất theo thời gian.",
          "5. Tiêu chí nào sau đây nên có trong bộ đánh giá công cụ AI cho tổ chức? A. Chỉ cần xem giá cả B. Độ chính xác, bảo mật dữ liệu, chi phí, khả năng tích hợp, chất lượng hỗ trợ kỹ thuật C. Chỉ cần độ nổi tiếng của thương hiệu D. Chỉ cần ý kiến của một người quyết định Đáp án: B — Đây là các tiêu chí toàn diện giúp đánh giá công cụ AI một cách khách quan và đầy đủ."
        ]
      }
    ],
    "finalTask": {
      "title": "ĐÁNH GIÁ CUỐI KHÓA M6-A",
      "brief": "Xây dựng bộ quy tắc và tiêu chí ứng dụng AI có trách nhiệm cho doanh nghiệp.\nYêu cầu:\nĐánh giá một cơ hội ứng dụng AI cụ thể cho doanh nghiệp, có đề xuất thử nghiệm quy mô nhỏ (áp dụng Module 1)\nSoạn dự thảo quy tắc sử dụng AI có trách nhiệm cho doanh nghiệp (áp dụng Module 2)\nXây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI (áp dụng Module 3)\nTiêu chí chấm:\nĐánh giá cơ hội ứng dụng AI có căn cứ, tránh cường điệu công nghệ\nQuy tắc sử dụng AI đầy đủ, khả thi áp dụng thực tế\nBộ tiêu chí đánh giá công cụ AI có hệ thống, có trọng số\nĐiểm đạt: ≥70/100, không tiêu chí nào dưới 50%.\nLưu ý gửi người triển khai: Toàn bộ nội dung Miền VI (Ứng dụng AI) là nội dung mới, chưa qua thẩm định chuyên môn. Đây là lĩnh vực công nghệ biến động nhanh — nội dung cần được rà soát và cập nhật định kỳ (đề xuất tối thiểu 6 tháng/lần), đặc biệt các ví dụ về công cụ cụ thể có thể nhanh chóng lỗi thời. Nội dung về rủi ro pháp lý liên quan bản quyền nội dung AI tạo ra (Module M6-A-2) nên được rà soát bởi chuyên gia pháp lý, vì đây là vùng pháp lý chưa ổn định tại nhiều quốc gia, bao gồm Việt Nam.",
      "deliverable": "",
      "rubric": []
    }
  }
};

export function getCurriculumCourse(courseCode: string): CurriculumCourse | undefined {
  return CURRICULUM_DATA[courseCode];
}
