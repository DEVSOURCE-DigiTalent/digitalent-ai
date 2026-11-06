/**
 * Standard TT02 & DigComp Curriculum Dataset (Authentic Courseware).
 * Generated from comprehensive training documents in 'D:\digitalent-ai\giaotrinh':
 * - giaotrinh-linhvuc1.docx to giaotrinh-mien6-AI.docx
 * 
 * Contains 18 courses, 72 modules, 216 lessons, 720 module quiz questions,
 * 360 final exam questions (1,080 questions total), and 18 capstone final tasks with evaluation rubrics.
 */

export interface CurriculumQuestion {
  number: number;
  question: string;
  options: [string, string, string, string];
  answer_letter: string;
  correct_index: number;
  explanation: string;
  questionText?: string;
  correctIndex?: number;
  competencyCode?: string;
  level?: number;
}

export interface CurriculumModule {
  module_number: number;
  title: string;
  competency_line: string;
  objectives: string[];
  definitions: string[];
  body: string[];
  examples: string[];
  steps?: string[];
  mistakes?: string[];
  practice: string | string[];
  deliverable: string;
  quiz_questions: CurriculumQuestion[];
  rawQuestions?: string[];
  moduleIndex?: number;
  competencyCode?: string;
  levelRange?: string;
  questions?: CurriculumQuestion[];
}

export interface CurriculumFinalTask {
  title: string;
  brief?: string;
  deliverable?: string;
  rubric: string[];
  context?: string;
  requirements?: string;
  deliverables?: string;
}

export interface CurriculumCourse {
  code: string;
  title: string;
  domain_number: number;
  level: number;
  modules: CurriculumModule[];
  final_task: CurriculumFinalTask;
  final_exam_questions: CurriculumQuestion[];
  description?: string;
  finalTask?: CurriculumFinalTask;
  finalExamQuestions?: CurriculumQuestion[];
}

export const CURRICULUM_DATA: Record<string, CurriculumCourse> = {
  "M1-F": {
    "code": "M1-F",
    "title": "TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN",
    "domain_number": 1,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Tìm kiếm thông tin bằng từ khóa",
        "competency_line": "Năng lực 1.1 · Mức 1–2",
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
        "examples": [
          "Ví dụ trong công việc. Nhân viên nhân sự cần quy định về thời giờ làm việc, nhân viên kế toán cần mức thuế suất hiện hành, nhân viên marketing cần quy mô một thị trường. Ở cả ba tình huống, câu hỏi nói ra miệng đều dài, nhưng từ khóa hiệu quả chỉ gồm vài chữ: “quy định thời giờ làm việc”, “thuế suất thuế giá trị gia tăng”, “quy mô thị trường bán lẻ Việt Nam”."
        ],
        "steps": [
          "Các bước thực hiện. 1. Viết ra điều bạn cần biết bằng một câu đầy đủ. Đây chính là nhu cầu thông tin của bạn. 2. Gạch chân các danh từ, con số, tên riêng trong câu đó; bỏ các từ như “làm sao”, “tôi muốn biết”, “cho đúng”. 3. Tìm với 2–4 từ khóa, rồi đọc tiêu đề, đường dẫn và đoạn trích của vài kết quả đầu trước khi bấm vào. 4. Nếu chưa phù hợp, đổi từ khóa: thêm từ chỉ loại tài liệu (“báo cáo”, “thống kê”, “quy định”), thêm năm hoặc địa danh, hoặc thay bằng cách gọi khác của cùng một khái niệm. 5. Khi tìm được trang phù hợp, ghi lại đường dẫn để quay lại được."
        ],
        "mistakes": [
          "Lỗi thường gặp. Gõ nguyên câu hỏi vào ô tìm kiếm; bấm vào kết quả đầu tiên mà không nhìn nhãn “Được tài trợ”; tìm đi tìm lại với cùng một từ khóa; không ghi lại đường dẫn nên phải tìm lại từ đầu."
        ],
        "practice": [
          "Cấp trên nhắn bạn: “Tìm giúp anh mức lương tối thiểu vùng hiện tại, khu vực mình đang ở.” Hãy thực hiện: 1. Viết từ khóa sẽ dùng 2. Thực hiện tìm kiếm thật 3. Nếu không ra kết quả tốt trong lần đầu, ghi lại đã đổi từ khóa như thế nào 4. Ghi lại đường dẫn của trang chính thức (cơ quan nhà nước) tìm được 5. Giới hạn: tối đa 3 lượt tìm"
        ],
        "deliverable": "Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn chính thức tìm được.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Công cụ tìm kiếm hoạt động bằng cách nào?",
            "options": [
              "Tìm trong mục lục đã được xây dựng từ trước",
              "Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm",
              "Hỏi trực tiếp các trang web",
              "Chỉ tìm trong các trang đã được xác minh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Công cụ tìm kiếm khớp từ khóa với chỉ mục đã thu thập trước đó, không quét trực tiếp Internet theo thời gian thực."
          },
          {
            "number": 2,
            "question": "Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm?",
            "options": [
              "Làm sao để xin nghỉ phép cho đúng",
              "quy định nghỉ phép năm người lao động",
              "nghỉ phép",
              "tôi muốn biết về nghỉ phép năm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các danh từ và cụm từ chuyên ngành cụ thể, không có từ thừa."
          },
          {
            "number": 3,
            "question": "Kết quả có nhãn “Được tài trợ” nghĩa là gì?",
            "options": [
              "Đơn vị đó trả tiền để xuất hiện ở vị trí này",
              "Đây là kết quả chính xác nhất",
              "Trang này đã được kiểm chứng",
              "Đây là kết quả mới nhất"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quảng cáo trả phí không đồng nghĩa với độ tin cậy hay độ liên quan cao hơn."
          },
          {
            "number": 4,
            "question": "Tìm kiếm “dịch vụ ăn uống” chỉ ra toàn nhà hàng, trong khi bạn cần số liệu ngành ăn uống. Bạn nên làm gì?",
            "options": [
              "Tìm lại y hệt vào ngày khác",
              "Thêm từ như “báo cáo”, “thống kê” vào từ khóa",
              "Thêm nhiều từ nhỏ như “và”, “của”",
              "Bỏ cuộc và hỏi đồng nghiệp"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thêm từ chỉ loại tài liệu định hướng công cụ tìm kiếm sang nhóm nguồn khác."
          },
          {
            "number": 5,
            "question": "Đường dẫn (URL) của một kết quả cho bạn biết điều gì?",
            "options": [
              "Trang đó có bao nhiêu lượt xem",
              "Trang đó có bao nhiêu quảng cáo",
              "Ai là người/đơn vị đăng nội dung đó",
              "Ngày trang được tạo"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "URL chứa tên miền, cho biết đơn vị chịu trách nhiệm xuất bản trang."
          },
          {
            "number": 6,
            "question": "Bạn cần biết mức thuế suất thuế giá trị gia tăng hiện hành. Bộ từ khóa nào phù hợp nhất?",
            "options": [
              "thuế gì mà phải đóng nhiều vậy",
              "thuế",
              "tôi cần biết về thuế",
              "thuế suất thuế giá trị gia tăng hiện hành"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Gồm các danh từ và cụm từ cụ thể mô tả đúng điều cần tìm, không có từ thừa."
          },
          {
            "number": 7,
            "question": "Việc nào giúp bạn xác định nhu cầu thông tin trước khi tìm kiếm?",
            "options": [
              "Mở ngay công cụ tìm kiếm và gõ thử nhiều lần",
              "Sao chép nguyên tin nhắn của cấp trên làm từ khóa",
              "Hỏi đồng nghiệp rồi dùng luôn câu trả lời",
              "Viết ra bằng một câu điều cần biết rồi dùng câu đó để chọn từ khóa"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Nhu cầu thông tin rõ ràng là cơ sở để chọn từ khóa đúng và đánh giá kết quả."
          },
          {
            "number": 8,
            "question": "Lần tìm đầu cho toàn tin tức cũ, trong khi bạn cần quy định hiện hành. Chiến lược đơn giản nào hợp lý?",
            "options": [
              "Tìm lại y như cũ nhưng sang trang 10",
              "Đổi từ khóa: thêm từ “quy định” và năm hiện hành",
              "Chấp nhận dùng tin tức cũ vì xuất hiện đầu tiên",
              "Xóa bớt từ khóa, chỉ để lại một chữ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thêm từ chỉ loại tài liệu và thời điểm định hướng công cụ tìm kiếm sang nhóm kết quả phù hợp."
          },
          {
            "number": 9,
            "question": "Trên trang kết quả, thông tin nào giúp bạn quyết định có nên bấm vào một kết quả hay không?",
            "options": [
              "Chỉ cần tiêu đề vì tiêu đề luôn đúng",
              "Thứ tự xuất hiện, vì càng đầu càng đáng tin",
              "Tiêu đề, đường dẫn và đoạn trích",
              "Số lượng quảng cáo trên trang"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đọc tiêu đề, đường dẫn, đoạn trích là cách điều hướng cơ bản trên trang kết quả."
          },
          {
            "number": 10,
            "question": "Theo Thông tư 02/2025/TT-BGDĐT, thuật ngữ nào chỉ quá trình định hướng, di chuyển để tìm ra đường đi đến đích mong muốn trong không gian kỹ thuật số?",
            "options": [
              "Điều hướng",
              "Mã hóa",
              "Chỉ mục",
              "Quảng cáo trả phí"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Điều 2 định nghĩa điều hướng là quá trình định hướng và di chuyển nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Nhận biết nguồn tin đáng tin cậy",
        "competency_line": "Năng lực 1.2 · Mức 1–2",
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
          "Đường dẫn cho biết ai là đơn vị công bố. Đuôi tên miền như .gov.vn, .edu.vn, .org, .com mang ý nghĩa khác nhau về mức độ chính thức. Ngày công bố quan trọng vì thông tin có thể đã lỗi thời. Ba dấu hiệu cơ bản của tin không đáng tin: giật tít gây sốc, không có tác giả rõ ràng, không dẫn nguồn kiểm chứng được. Nhiều trang cùng nói một điều không có nghĩa là điều đó đúng — có thể tất cả cùng sao chép từ một nguồn sai.",
          "Bốn câu hỏi nhanh cho mỗi nguồn. 1. Ai công bố? Nhìn tên miền và phần giới thiệu trang. 2. Công bố khi nào? Xem ngày đăng hoặc ngày cập nhật. 3. Có tên tác giả và có dẫn nguồn để kiểm tra lại không? 4. Tiêu đề và giọng văn có nhằm giật gân hay thúc giục bạn tin ngay không?",
          "Lưu ý. Câu trả lời cho từng câu hỏi chỉ là tín hiệu, chưa phải kết luận. Nguồn thiếu tác giả chưa chắc sai nhưng cần thận trọng hơn; trang .com chưa chắc kém tin cậy nhưng cần đánh giá thêm. Với số liệu quan trọng, nên ưu tiên trang do chính cơ quan hoặc đơn vị tạo ra số liệu công bố."
        ],
        "examples": [
          "Ví dụ trong công việc. Cấp trên nhờ lấy số liệu doanh thu bán lẻ để đưa vào bản trình bày. Bạn tìm được bốn kết quả: một báo cáo trên trang cơ quan thống kê, một bài báo điện tử có tên tác giả và dẫn nguồn, một bài đăng không rõ tác giả, và một video có tiêu đề “Sự thật kinh hoàng…”. Việc của bạn lúc này không phải chứng minh ngay điều gì đúng hay sai, mà là xếp các nguồn theo độ tin cậy để biết nên dùng nguồn nào trước."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tin vì nhiều trang cùng nói một điều; chỉ nhìn đuôi tên miền rồi kết luận; dùng số liệu cũ vì không nhìn ngày công bố."
        ],
        "practice": [
          "Cho năm kết quả tìm kiếm về cùng một chủ đề (ví dụ quy mô thị trường bán lẻ Việt Nam), hãy xếp hạng theo độ tin cậy (1 là tin cậy nhất) và giải thích mỗi lựa chọn bằng một câu."
        ],
        "deliverable": "Bảng xếp hạng 5 nguồn kèm lý do.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Đuôi tên miền nào thường gắn với cơ quan nhà nước Việt Nam?",
            "options": [
              ".com",
              ".gov.vn",
              ".net",
              ".info"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": ".gov.vn được cấp riêng cho cơ quan nhà nước."
          },
          {
            "number": 2,
            "question": "Một bài viết không ghi tên tác giả hay đơn vị xuất bản. Điều này có nghĩa gì?",
            "options": [
              "Bài viết chắc chắn sai",
              "Bài viết được viết bởi chuyên gia ẩn danh",
              "Không quan trọng, miễn nội dung đúng",
              "Không ai chịu trách nhiệm nếu thông tin sai, nên cần thận trọng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thiếu trách nhiệm giải trình là dấu hiệu cảnh báo, không phải bằng chứng bài viết sai, nhưng cần thận trọng hơn."
          },
          {
            "number": 3,
            "question": "Với thông tin về mức giá hiện tại, yếu tố nào quan trọng nhất cần kiểm tra?",
            "options": [
              "Độ dài bài viết",
              "Ngày công bố",
              "Số lượt chia sẻ",
              "Màu sắc trang web"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giá cả thay đổi theo thời gian; bài viết cũ có thể đã lỗi thời."
          },
          {
            "number": 4,
            "question": "Tiêu đề “Sốc: Giá tăng gấp 10 lần chỉ sau một đêm!” là dấu hiệu của điều gì?",
            "options": [
              "Tiêu đề giật gân, cần kiểm tra kỹ nội dung trước khi tin",
              "Tin chính xác, cần hành động ngay",
              "Bài viết khoa học",
              "Nguồn chính phủ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ngôn ngữ cảm xúc mạnh thường nhằm câu view hơn là truyền tải chính xác."
          },
          {
            "number": 5,
            "question": ".com có nghĩa là trang đó không đáng tin không?",
            "options": [
              "Đúng, luôn luôn không đáng tin",
              "Đúng, chỉ .gov.vn mới đáng tin",
              "Sai, .com chỉ có nghĩa là doanh nghiệp/cá nhân đăng ký, cần đánh giá thêm",
              ".com chỉ dùng cho trang nước ngoài"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đuôi tên miền là một tín hiệu, không phải kết luận cuối cùng."
          },
          {
            "number": 6,
            "question": "Nguồn A đăng năm 2019, nguồn B đăng tháng này, cùng nói về giá xăng hiện tại. Nên ưu tiên nguồn nào?",
            "options": [
              "Nguồn B, vì giá cả thay đổi theo thời gian",
              "Nguồn A, vì đã tồn tại lâu hơn nên đáng tin hơn",
              "Cả hai như nhau vì cùng chủ đề",
              "Nguồn nào có nhiều chữ hơn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Với thông tin về giá hiện tại, ngày công bố là yếu tố quan trọng nhất cần kiểm tra."
          },
          {
            "number": 7,
            "question": "Bài viết có tên tác giả và liệt kê các nguồn tham khảo. Điều này cho biết gì?",
            "options": [
              "Bài viết chắc chắn đúng hoàn toàn",
              "Bài viết do cơ quan nhà nước viết",
              "Thông tin có thể được kiểm chứng và có người chịu trách nhiệm, đây là dấu hiệu tích cực",
              "Không có ý nghĩa gì khi đánh giá nguồn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tác giả rõ ràng và nguồn dẫn kiểm chứng được là tín hiệu tốt, nhưng vẫn chưa đủ để kết luận tuyệt đối."
          },
          {
            "number": 8,
            "question": "Sáu trang cùng đăng một con số, đều viết “theo một nghiên cứu”. Bạn nên làm gì?",
            "options": [
              "Tìm xem nghiên cứu đó do ai thực hiện và có kiểm tra lại được không",
              "Tin vì đã có sáu trang xác nhận",
              "Chọn trang có nhiều lượt chia sẻ nhất",
              "Bỏ qua con số mà không giải thích"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nhiều trang cùng nói một điều không có nghĩa là đúng; có thể tất cả sao chép từ một nguồn."
          },
          {
            "number": 9,
            "question": "Mô tả nào đúng về dữ liệu và thông tin theo Thông tư 02/2025/TT-BGDĐT?",
            "options": [
              "Dữ liệu và thông tin luôn là một",
              "Thông tin là các con số rời rạc, dữ liệu là bài viết hoàn chỉnh",
              "Dữ liệu chỉ tồn tại trong bảng tính",
              "Dữ liệu là con số hoặc dữ kiện rời rạc; thông tin là dữ liệu đã được tổ chức, xử lý để có ý nghĩa"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Điều 2 phân biệt: dữ liệu chưa cần ngữ cảnh, thông tin là dữ liệu đã có ý nghĩa để ra quyết định."
          },
          {
            "number": 10,
            "question": "Câu nào dưới đây là dấu hiệu cảnh báo rõ nhất của tin không đáng tin?",
            "options": [
              "“Báo cáo thường niên năm 2025 của đơn vị”",
              "“Bạn không đọc sẽ hối hận! Chia sẻ ngay trước khi bị xóa!”",
              "“Thông báo mức lương tối thiểu vùng, ban hành ngày 01/01”",
              "“Bài phân tích có ghi rõ nguồn số liệu”"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ngôn ngữ cảm xúc mạnh, thúc giục chia sẻ là dấu hiệu của nội dung nhằm lan truyền hơn là cung cấp thông tin chính xác."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Lưu trữ và sắp xếp tài liệu",
        "competency_line": "Năng lực 1.3 · Mức 1–2",
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
          "Các định dạng phổ biến — văn bản, bảng tính, trình chiếu, PDF, ảnh — mỗi loại phù hợp một mục đích khác nhau. Nên tải tệp có chủ đích thay vì để mặc định. Quy tắc đặt tên nhất quán (ngày trước, không dấu, không ký tự đặc biệt) giúp dễ tìm lại. Thư mục cơ bản nên phân theo chủ đề hoặc dự án. Cần phân biệt giữa lưu (ghi đè bản cũ) và lưu thành bản mới (tạo phiên bản riêng) để tránh mất dữ liệu gốc.",
          "Quy trình lưu một tài liệu. 1. Tải tệp có chủ đích: chọn đúng định dạng cần dùng. Muốn sửa số liệu thì lấy .xlsx; muốn giữ nguyên bố cục để in hoặc gửi thì lấy .pdf. 2. Mở thư mục của dự án hoặc chủ đề liên quan, tạo thư mục mới nếu chưa có. 3. Đặt tên: ngày theo dạng năm-tháng-ngày, rồi nội dung, không dấu cách, không ký tự đặc biệt (ví dụ 2026-04-09_bao-cao-thang4.docx). 4. Khi chỉnh sửa tệp có sẵn, dùng “Lưu thành” để tạo bản mới nếu muốn giữ bản gốc; chỉ dùng “Lưu” khi chắc chắn muốn ghi đè. 5. Kiểm tra lại: mở thư mục, sắp xếp theo tên, xem các tệp có xếp đúng thứ tự thời gian không."
        ],
        "examples": [
          "Ví dụ trong công việc. Cuối tuần, bạn tải về ba báo cáo và hai bảng số liệu cho một dự án. Nếu để nguyên tên do hệ thống đặt (như document1.pdf, Book1.xlsx) trong thư mục Downloads, vài tuần sau gần như không thể biết tệp nào là tệp nào. Nếu đặt tên theo quy tắc và cho vào thư mục dự án ngay khi tải, bạn tìm lại được trong vài giây."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Để mọi thứ trong thư mục Downloads; đặt tên chung chung (document1, bao-cao-moi); ghi đè bản gốc rồi không lấy lại được; dùng ký tự đặc biệt hoặc dấu cách trong tên tệp."
        ],
        "practice": [
          "Tìm và tải ba tài liệu (PDF hoặc Excel) về một chủ đề công việc tự chọn. Tạo một thư mục mới đặt tên rõ ràng, đổi tên cả ba tệp theo công thức trên, và chụp ảnh màn hình thư mục hoàn chỉnh."
        ],
        "deliverable": "Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bạn nhận được số liệu cần chỉnh sửa. Bạn nên yêu cầu định dạng nào?",
            "options": [
              ".pdf",
              ".xlsx",
              ".jpg",
              ".pptx"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "File Excel cho phép chỉnh sửa số liệu trực tiếp."
          },
          {
            "number": 2,
            "question": "Mặc định, trình duyệt lưu file tải về ở đâu?",
            "options": [
              "Thư mục Documents",
              "Màn hình chính",
              "Thư mục Downloads",
              "Ngẫu nhiên"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Downloads là thư mục mặc định trừ khi được cấu hình khác."
          },
          {
            "number": 3,
            "question": "Tên tệp nào đúng quy tắc nhất?",
            "options": [
              "bao-cao-final-v2-that.docx",
              "2026-04-09_bao-cao-thang4.docx",
              "document1.docx",
              "BÁO CÁO MỚI!!.docx"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bắt đầu bằng ngày theo định dạng năm-tháng-ngày, không dấu cách, không ký tự đặc biệt."
          },
          {
            "number": 4,
            "question": "Vì sao nên đặt ngày ở đầu tên tệp theo định dạng năm-tháng-ngày?",
            "options": [
              "Để tên ngắn hơn",
              "Vì máy tính yêu cầu",
              "Không có lý do đặc biệt",
              "Để khi sắp xếp theo tên, tệp tự xếp theo thứ tự thời gian"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Định dạng năm-tháng-ngày sắp xếp đúng theo thời gian khi liệt kê theo bảng chữ cái."
          },
          {
            "number": 5,
            "question": "File PDF phù hợp nhất cho mục đích nào?",
            "options": [
              "Tính toán số liệu",
              "Vẽ biểu đồ",
              "Soạn thảo cần chỉnh sửa nhiều",
              "Chia sẻ tài liệu giữ nguyên bố cục để in hoặc gửi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "PDF cố định bố cục, phù hợp chia sẻ/in nhưng khó chỉnh sửa."
          },
          {
            "number": 6,
            "question": "Bạn cần gửi bảng giá cho đối tác để họ xem và in, không muốn họ vô tình sửa số. Định dạng nào phù hợp?",
            "options": [
              ".pdf",
              ".xlsx",
              ".docx",
              ".pptx"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "PDF cố định bố cục, phù hợp để chia sẻ và in nhưng khó chỉnh sửa."
          },
          {
            "number": 7,
            "question": "Bạn sửa một báo cáo nhưng muốn giữ nguyên bản gốc. Nên làm gì?",
            "options": [
              "Dùng “Lưu” để ghi đè",
              "Xóa bản gốc rồi lưu lại",
              "Dùng “Lưu thành” và đặt tên cho bản mới",
              "Không cần làm gì vì máy tự giữ bản cũ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Lưu thành tạo phiên bản riêng nên bản gốc không bị mất."
          },
          {
            "number": 8,
            "question": "Thư mục cơ bản nên được sắp xếp theo cách nào?",
            "options": [
              "Theo chủ đề hoặc dự án",
              "Theo màu biểu tượng của tệp",
              "Theo thứ tự ngẫu nhiên khi tải",
              "Gom tất cả vào một thư mục duy nhất"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phân theo chủ đề hoặc dự án giúp người lưu và người tìm cùng đoán được tệp nằm ở đâu."
          },
          {
            "number": 9,
            "question": "Một thư mục có ba tệp: 2026-01-15_ke-hoach.xlsx, 2026-03-02_ke-hoach.xlsx, 2025-12-20_ke-hoach.xlsx. Khi sắp xếp theo tên, tệp nào đứng đầu?",
            "options": [
              "2026-01-15_ke-hoach.xlsx",
              "2025-12-20_ke-hoach.xlsx",
              "2026-03-02_ke-hoach.xlsx",
              "Thứ tự ngẫu nhiên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Định dạng năm-tháng-ngày làm cho thứ tự theo tên trùng với thứ tự thời gian."
          },
          {
            "number": 10,
            "question": "Theo Thông tư 02/2025/TT-BGDĐT, môi trường có cấu trúc là gì?",
            "options": [
              "Không gian hoặc hệ thống trong đó dữ liệu được tổ chức theo cách rõ ràng và có quy tắc, giúp dễ tìm kiếm, truy cập và xử lý",
              "Nơi lưu mọi tệp theo thứ tự tải về",
              "Chỉ là thư mục trên màn hình chính",
              "Hệ thống không có quy tắc nào"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là nội dung Điều 2 của Thông tư."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M1-F — “Tìm nhanh, tin được, lưu gọn” (Assignment)",
      "context": "Quản lý nhắn: “Em tìm giúp anh vài thông tin cơ bản về [chủ đề công việc], anh cần trước cuối ngày.” Bạn tự chọn một chủ đề gắn với công việc của mình, ví dụ quy định về làm thêm giờ, quy mô thị trường một ngành, hoặc mức lương tối thiểu vùng.",
      "requirements": "1. Viết nhu cầu thông tin bằng một câu: bạn cần biết điều gì, để làm gì. 2. Viết bộ từ khóa (2–4 từ mỗi lượt) và thực hiện tìm kiếm thật. Ghi lại tối đa 5 lượt tìm, nêu lý do nếu phải đổi từ khóa. 3. Chọn 3 nguồn. Với mỗi nguồn ghi: đường dẫn, đơn vị công bố, ngày công bố, có tác giả hay không, và một câu đánh giá sơ bộ độ tin cậy. 4. Tải 1 tệp về (PDF hoặc Excel), tạo thư mục đúng chủ đề, đặt tên tệp theo quy tắc đã học. 5. Viết 5 gạch đầu dòng tóm tắt thông tin tìm được, mỗi gạch ghi rõ lấy từ nguồn nào. 6. Viết 2–3 câu cho biết thông tin nào bạn còn chưa chắc chắn và vì sao.",
      "deliverables": "(a) 1 tài liệu tổng hợp tối đa 1 trang gồm các mục 1, 2, 3, 5, 6; (b) 1 ảnh chụp màn hình thư mục có tệp đã đặt tên đúng.\nHình thức nộp. Tệp văn bản hoặc PDF kèm ảnh; nộp đúng thời hạn người hướng dẫn quy định.",
      "rubric": [
        "Gợi ý. Đừng gõ nguyên câu hỏi vào công cụ tìm kiếm. Nếu cả 3 nguồn cùng một đơn vị công bố, hãy tìm thêm để có nguồn độc lập. Ghi nguồn ngay khi tìm được, không để đến cuối mới ghi.",
        "Tiêu chí",
        "Điểm",
        "Nhu cầu thông tin rõ ràng, từ khóa hợp lý, không phải câu hỏi nguyên văn",
        "20",
        "3 nguồn có đánh giá độ tin cậy hợp lý (tên miền, ngày, tác giả)",
        "25",
        "Tệp lưu đúng thư mục, đặt tên đúng quy ước",
        "20",
        "Tóm tắt có dẫn nguồn cho từng ý, nêu được điểm chưa chắc chắn",
        "20",
        "Trình bày rõ ràng, đúng thời hạn",
        "15"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Cấp trên nhờ bạn tìm quy định về làm thêm giờ. Từ khóa nào phù hợp nhất?",
        "options": [
          "làm thêm giờ có được không",
          "giờ",
          "quy định làm thêm giờ người lao động",
          "tôi muốn biết làm thêm"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Danh từ và cụm từ chuyên ngành cụ thể, không có từ thừa."
      },
      {
        "number": 2,
        "question": "Vì sao công cụ tìm kiếm không “hiểu” câu hỏi như con người?",
        "options": [
          "Nó đọc ý định trong đầu người dùng",
          "Nó khớp chữ bạn nhập với chỉ mục có sẵn rồi xếp hạng theo mức độ liên quan",
          "Nó hỏi từng trang web xem có phù hợp không",
          "Nó chỉ trả về các trang đã được kiểm duyệt"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Công cụ tìm kiếm khớp chữ, không hiểu ngữ cảnh như người."
      },
      {
        "number": 3,
        "question": "Kết quả đứng đầu có nhãn “Được tài trợ”. Cách xử lý đúng là gì?",
        "options": [
          "Bấm ngay vì được ưu tiên là đáng tin",
          "Bỏ qua tất cả các kết quả còn lại",
          "Nhận biết đó là quảng cáo trả phí và đánh giá nó như mọi nguồn khác",
          "Tin vì được tài trợ nghĩa là đã được kiểm chứng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Quảng cáo trả phí không đồng nghĩa với độ tin cậy hay độ liên quan cao hơn."
      },
      {
        "number": 4,
        "question": "Lần tìm đầu không cho kết quả phù hợp. Bạn nên làm gì?",
        "options": [
          "Gõ lại y hệt nhiều lần",
          "Đổi hoặc bổ sung từ khóa, ví dụ thêm loại tài liệu hoặc năm",
          "Thêm các từ nối như “và”, “của”",
          "Dừng lại và báo là không tìm được"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đổi từ khóa là chiến lược tìm kiếm đơn giản ở mức cơ bản."
      },
      {
        "number": 5,
        "question": "Đọc đường dẫn của một kết quả trước khi bấm có tác dụng gì?",
        "options": [
          "Biết trang có bao nhiêu hình ảnh",
          "Biết tốc độ tải của trang",
          "Biết trang có miễn phí hay không",
          "Biết đơn vị nào chịu trách nhiệm xuất bản trang"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đường dẫn chứa tên miền, cho biết ai đứng sau trang."
      },
      {
        "number": 6,
        "question": "Bạn được nhờ “tìm giúp anh thông tin về thị trường”. Nên làm gì trước tiên?",
        "options": [
          "Tìm ngay với từ khóa “thị trường”",
          "Gửi cấp trên toàn bộ kết quả đầu tiên",
          "Làm rõ điều cần biết rồi mới chọn từ khóa",
          "Chọn đại một chủ đề"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Nhu cầu thông tin rõ ràng giúp tìm đúng và tránh lãng phí thời gian."
      },
      {
        "number": 7,
        "question": "Ghi lại đường dẫn của trang tìm được có lợi gì?",
        "options": [
          "Làm trang tải nhanh hơn",
          "Tự động xác minh trang",
          "Quay lại đúng nguồn và dẫn nguồn khi cần",
          "Không có lợi gì thêm"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Ghi nguồn giúp truy xuất lại và chứng minh thông tin đến từ đâu."
      },
      {
        "number": 8,
        "question": "Một trang không có ngày công bố, không có tên tác giả, tiêu đề giật gân. Nhận định nào hợp lý?",
        "options": [
          "Chắc chắn sai nên không cần xem",
          "Có nhiều dấu hiệu cảnh báo, nên thận trọng và tìm nguồn khác để đối chiếu",
          "Đáng tin vì tiêu đề thu hút",
          "Đáng tin vì xuất hiện trên Internet"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Dấu hiệu cảnh báo chưa phải bằng chứng sai, nhưng cần đối chiếu thêm."
      },
      {
        "number": 9,
        "question": "Đuôi tên miền .gov.vn cho bạn biết điều gì?",
        "options": [
          "Thường gắn với cơ quan nhà nước Việt Nam, là tín hiệu về nguồn chính thức",
          "Đảm bảo mọi nội dung luôn đúng",
          "Trang chỉ dành cho người nước ngoài",
          "Trang có nhiều quảng cáo"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": ".gov.vn được cấp riêng cho cơ quan nhà nước."
      },
      {
        "number": 10,
        "question": "Bạn thấy một bài hướng dẫn về thuế đăng cách đây hai năm. Nên làm gì?",
        "options": [
          "Dùng luôn vì đã từng đúng",
          "Dùng nếu bài được chia sẻ nhiều",
          "Bỏ qua chủ đề này",
          "Kiểm tra ngày công bố và tìm bản cập nhật vì quy định có thể đã thay đổi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Ngày công bố rất quan trọng với thông tin có thể thay đổi theo thời gian."
      },
      {
        "number": 11,
        "question": "Bốn trang cùng đăng một con số gây sốc. Điều nên làm?",
        "options": [
          "Tin vì nhiều trang cùng đăng",
          "Chia sẻ để người khác kiểm tra",
          "Tìm nguồn gốc của con số và đối chiếu với nguồn chính thức",
          "Bỏ qua mọi nguồn"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Nhiều trang giống nhau có thể cùng sao chép từ một nguồn sai."
      },
      {
        "number": 12,
        "question": "Bảng doanh thu từng ngày, sau khi được tổ chức, tính tổng và đặt trong ngữ cảnh so sánh thì trở thành gì?",
        "options": [
          "Vẫn chỉ là dữ liệu rời rạc",
          "Thông tin, vì dữ liệu đã được xử lý để có ý nghĩa",
          "Nội dung số, không phải thông tin",
          "Không thể gọi tên"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Dữ liệu trở thành thông tin khi được thêm ngữ cảnh, phân loại, tính toán, đánh giá."
      },
      {
        "number": 13,
        "question": "Để quyết định có dùng một bài viết làm nguồn cho báo cáo, tiêu chí nào quan trọng nhất?",
        "options": [
          "Khả năng kiểm tra lại nguồn gốc và có người chịu trách nhiệm",
          "Số lượt bình luận",
          "Số lượng ảnh minh họa",
          "Độ dài bài viết"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Khả năng kiểm chứng và trách nhiệm giải trình là nền tảng của độ tin cậy."
      },
      {
        "number": 14,
        "question": "Một trang .com của doanh nghiệp có tác giả rõ, ghi ngày cập nhật, dẫn nguồn. Nhận định nào hợp lý?",
        "options": [
          "Không dùng được vì là .com",
          "Chính xác tuyệt đối vì có tác giả",
          "Chỉ dùng được khi là trang nhà nước",
          "Có thể là nguồn tham khảo khá tốt nhưng vẫn cần cân nhắc mục đích của trang"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đuôi tên miền chỉ là một tín hiệu, không phải kết luận."
      },
      {
        "number": 15,
        "question": "Đối tác gửi bảng số liệu dạng ảnh chụp màn hình, bạn cần tính tổng. Nên yêu cầu họ gửi lại dạng nào?",
        "options": [
          "Tệp bảng tính (.xlsx)",
          "Ảnh chụp lớn hơn",
          "Tệp PDF của ảnh đó",
          "Tệp trình chiếu"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bảng tính cho phép chỉnh sửa và tính toán trực tiếp."
      },
      {
        "number": 16,
        "question": "Tên tệp nào đúng quy tắc nhất?",
        "options": [
          "Hợp đồng ABC mới nhất!!.pdf",
          "hop dong abc (2).pdf",
          "scan0001.pdf",
          "2026-05-12_hop-dong-abc.pdf"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bắt đầu bằng ngày năm-tháng-ngày, không dấu cách, không ký tự đặc biệt, mô tả được nội dung."
      },
      {
        "number": 17,
        "question": "Thư mục của một dự án nên được tổ chức thế nào?",
        "options": [
          "Một thư mục mang tên dự án, bên trong chia theo nhóm tài liệu dễ hiểu",
          "Một thư mục chung cho mọi dự án",
          "Đặt tên thư mục theo ngày tải về",
          "Không dùng thư mục, để tệp trên màn hình"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Phân theo dự án và nhóm tài liệu giúp tìm lại nhanh."
      },
      {
        "number": 18,
        "question": "Bạn mở bảng giá gốc, muốn thử một phương án mới nhưng chưa chắc sẽ dùng. Nên làm gì?",
        "options": [
          "Lưu thành bản mới để giữ nguyên bảng giá gốc",
          "Lưu ghi đè rồi sửa lại nếu sai",
          "Đóng và không lưu",
          "Xóa bảng giá gốc"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Lưu thành tạo bản riêng, tránh mất dữ liệu gốc."
      },
      {
        "number": 19,
        "question": "Tệp tải về mặc định nằm ở đâu và sau đó nên làm gì?",
        "options": [
          "Ở màn hình chính; để nguyên",
          "Thường ở thư mục Downloads; nên chuyển vào thư mục dự án và đặt tên đúng",
          "Ở thư mục Documents; không cần làm gì",
          "Ở đám mây; tự sắp xếp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Để tệp trong Downloads lâu ngày khiến việc truy xuất rất khó."
      },
      {
        "number": 20,
        "question": "Vì sao quy tắc thư mục và đặt tên giúp truy xuất dữ liệu nhanh hơn?",
        "options": [
          "Vì máy tự đọc nội dung từng tệp",
          "Vì tệp trở nên nhỏ hơn",
          "Vì không còn cần tìm kiếm nữa",
          "Vì dữ liệu được sắp xếp theo cách rõ ràng, có quy tắc nên dễ tìm, truy cập và xử lý"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đây là đặc trưng của môi trường có cấu trúc theo Thông tư 02/2025/TT-BGDĐT."
      }
    ]
  },
  "M1-I": {
    "code": "M1-I",
    "title": "CHIẾN LƯỢC TÌM KIẾM VÀ QUẢN LÝ THÔNG TIN",
    "domain_number": 1,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Chiến lược tìm kiếm và toán tử",
        "competency_line": "Năng lực 1.1 · Mức 3–4",
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
          "Ma trận từ khóa — bảng liệt kê từ khóa lõi cùng từ đồng nghĩa, từ thu hẹp, từ mở rộng — giúp tổ chức chiến lược tìm kiếm có hệ thống thay vì tìm ngẫu nhiên. Toán tử tìm kiếm (dấu ngoặc kép để khóa cụm từ, site: để giới hạn nguồn, filetype: để lọc định dạng, dấu trừ để loại trừ) giúp thu hẹp hoặc mở rộng kết quả theo ý muốn. Chọn công cụ tìm kiếm phù hợp với loại nguồn cần tìm, và biết quy tắc dừng tìm kiếm khi đã đủ thông tin cần thiết.",
          "Quy trình. 1. Viết nhu cầu thông tin với bốn yếu tố: phạm vi, thời gian, mức chi tiết, sản phẩm đầu ra. 2. Lập ma trận từ khóa: từ lõi, từ đồng nghĩa, từ thu hẹp, từ mở rộng. 3. Ghép với toán tử: dấu ngoặc kép khóa cụm từ; site: giới hạn nguồn; filetype: lọc định dạng; dấu trừ loại trừ; OR (viết hoa) cho phép lựa chọn. 4. Chạy, ghi nhật ký từng truy vấn và kết quả, rồi tinh chỉnh. 5. Đặt quy tắc dừng trước khi bắt đầu, ví dụ đã có ít nhất ba nguồn phù hợp cho mỗi chỉ tiêu cần có."
        ],
        "examples": [
          "Ví dụ trong công việc. Giám đốc kinh doanh nhờ: “Tìm hiểu giúp tôi các đối thủ trong ngành đồ uống đóng chai tại Việt Nam.” Câu này còn mơ hồ. Trước khi tìm, hãy chuyển nó thành nhu cầu thông tin cụ thể: phạm vi (phân khúc nước ép, thị trường miền Nam), thời gian (hai năm gần nhất), mức chi tiết (năm đối thủ lớn nhất, thị phần và giá), sản phẩm đầu ra (một bảng một trang)."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Dùng quá nhiều toán tử cùng lúc nên không ra kết quả; không ghi nhật ký nên không lặp lại được; không có quy tắc dừng nên tìm mãi; chỉ dùng một cách gọi cho một khái niệm."
        ],
        "practice": [
          "Tìm văn bản quy định chính thức về một chủ đề (ví dụ an toàn thực phẩm, bảo vệ dữ liệu cá nhân), dạng PDF, ban hành trong ba năm gần nhất. Không được duyệt menu trang web — chỉ dùng toán tử. Ghi lại từng bước tinh chỉnh câu truy vấn (tối thiểu năm bước) và nộp đường dẫn văn bản gốc tìm được."
        ],
        "deliverable": "Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "site:gov.vn \"an toàn thực phẩm\" filetype:pdf sẽ trả về kết quả nào?",
            "options": [
              "Tất cả trang nói về an toàn thực phẩm",
              "Chỉ file PDF trên các trang chính phủ có đúng cụm từ này",
              "Chỉ tin tức",
              "Không ra kết quả nào"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ba toán tử kết hợp: giới hạn miền, cụm từ chính xác, định dạng file."
          },
          {
            "number": 2,
            "question": "Để loại bỏ kết quả về tuyển sinh khi tìm về đào tạo nhân viên, dùng cú pháp nào?",
            "options": [
              "+tuyển sinh",
              "\"tuyển sinh\"",
              "site:tuyensinh",
              "-tuyển-sinh"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dấu trừ loại trừ từ khỏi kết quả."
          },
          {
            "number": 3,
            "question": "Vì sao cần xây nhiều vựng từ đồng nghĩa thay vì chỉ một bộ từ khóa?",
            "options": [
              "Để tìm nhanh hơn",
              "Vì công cụ yêu cầu",
              "Để tránh trùng lặp",
              "Vì các đơn vị khác nhau dùng từ ngữ khác nhau cho cùng khái niệm"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Từ vựng khác nhau chạm tới nhóm nguồn xuất bản khác nhau."
          },
          {
            "number": 4,
            "question": "OR phải viết như thế nào để có tác dụng?",
            "options": [
              "Viết hoa “OR”",
              "Viết thường “or”",
              "Không quan trọng",
              "Phải có dấu ngoặc"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Google chỉ nhận diện toán tử OR khi viết hoa."
          },
          {
            "number": 5,
            "question": "Trước khi tìm kiếm, bước đầu tiên nên làm là gì?",
            "options": [
              "Gõ ngay câu hỏi vào công cụ tìm kiếm",
              "Xác định rõ phạm vi, thời gian, mức chi tiết, sản phẩm cần có",
              "Mở nhiều tab cùng lúc",
              "Hỏi đồng nghiệp trước"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Định nghĩa nhu cầu rõ ràng trước khi tìm giúp tránh lãng phí thời gian."
          },
          {
            "number": 6,
            "question": "Truy vấn \"báo cáo thường niên\" site:gov.vn filetype:pdf 2025 trả về kết quả nào?",
            "options": [
              "Mọi trang ở mọi miền có chữ “báo cáo”",
              "Chỉ tin tức năm 2025",
              "Tệp PDF trên các trang đuôi gov.vn có đúng cụm “báo cáo thường niên” và liên quan đến 2025",
              "Không trả về gì vì dùng quá nhiều toán tử"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Các toán tử kết hợp: cụm từ chính xác, giới hạn miền, lọc định dạng, thêm từ khóa năm."
          },
          {
            "number": 7,
            "question": "Bạn tìm “nước ép đóng chai” nhưng không muốn kết quả về công thức tự làm. Cú pháp nào đúng?",
            "options": [
              "nước ép đóng chai -\"công thức\"",
              "nước ép đóng chai +\"công thức\"",
              "nước ép đóng chai site:congthuc",
              "nước ép đóng chai filetype:công-thức"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Dấu trừ đặt ngay trước từ hoặc cụm từ để loại trừ khỏi kết quả."
          },
          {
            "number": 8,
            "question": "Ma trận từ khóa mang lại lợi ích chính nào?",
            "options": [
              "Giảm số lượt tìm xuống đúng một",
              "Phủ nhiều cách gọi khác nhau của cùng một khái niệm để chạm tới nhiều nhóm nguồn",
              "Thay thế việc đánh giá nguồn",
              "Tự động xếp hạng độ tin cậy"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Các đơn vị dùng từ ngữ khác nhau cho cùng một khái niệm; từ đồng nghĩa mở rộng phạm vi nguồn."
          },
          {
            "number": 9,
            "question": "Quy tắc dừng tìm kiếm nào là tốt nhất?",
            "options": [
              "Xác định ngay từ đầu: đã đủ số nguồn phù hợp cho từng chỉ tiêu cần có",
              "Dừng khi thấy mỏi",
              "Dừng khi kết quả đầu tiên xuất hiện",
              "Không dừng cho đến khi hết kết quả"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quy tắc dừng đặt trước giúp tránh tìm vô hạn và biết khi nào đã đủ."
          },
          {
            "number": 10,
            "question": "Nhu cầu “Tìm thông tin về đối thủ” còn thiếu gì?",
            "options": [
              "Không thiếu gì, đã rõ ràng",
              "Chỉ thiếu từ khóa",
              "Thiếu phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra",
              "Chỉ thiếu nguồn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nhu cầu thông tin đầy đủ gồm bốn yếu tố này."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Đánh giá và so sánh nguồn tin",
        "competency_line": "Năng lực 1.2 · Mức 3–4",
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
          "Cần phân biệt nguồn sơ cấp (nơi thông tin được tạo ra lần đầu) và nguồn thứ cấp (nơi trích dẫn hoặc tổng hợp lại). Hiện tượng trích dẫn vòng xảy ra khi nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng. Khi các nguồn uy tín đưa ra số liệu khác nhau, thường do khác biệt về định nghĩa hoặc phương pháp đo lường — nên báo cáo khoảng giá trị thay vì một con số duy nhất khi các nguồn còn mâu thuẫn.",
          "Quy trình đánh giá. 1. Lập bảng năm cột theo năm tiêu chí cho từng nguồn. 2. Xác định nguồn sơ cấp: lần theo trích dẫn đến nơi số liệu được tạo ra lần đầu. 3. Kiểm tra trích dẫn vòng: các nguồn có cùng dẫn về một gốc không? 4. So sánh định nghĩa, kỳ báo cáo, phương pháp đo trước khi so sánh con số. 5. Báo cáo kết quả: nếu còn mâu thuẫn, nêu khoảng giá trị và lý do chênh lệch, không ép thành một con số duy nhất."
        ],
        "examples": [
          "Ví dụ trong công việc. Hai báo cáo cho hai con số khác nhau về số doanh nghiệp vừa và nhỏ: một của cơ quan thống kê, một của hiệp hội. Thay vì chọn ngay số “nghe hợp lý”, bạn lập bảng so sánh theo năm tiêu chí (tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng), rồi đối chiếu định nghĩa doanh nghiệp vừa và nhỏ và kỳ báo cáo của mỗi nguồn. Chênh lệch thường đến từ định nghĩa hoặc phương pháp, không phải từ sai sót."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. So sánh con số khi định nghĩa khác nhau; coi số lượng nguồn là bằng chứng; chọn con số thuận tiện cho bài thuyết trình; không ghi chú nguồn nào là sơ cấp."
        ],
        "practice": [
          "Cấp trên cần một con số cho slide, ví dụ “số lượng doanh nghiệp vừa và nhỏ tại Việt Nam.” Tìm ba nguồn khác nhau, lập bảng so sánh năm cột như trên, chỉ ra ít nhất một điểm khác biệt về định nghĩa hoặc phương pháp, và viết hai câu khuyến nghị nên dùng con số nào và vì sao."
        ],
        "deliverable": "Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nguồn sơ cấp là gì?",
            "options": [
              "Nơi số liệu được tạo ra ban đầu",
              "Nguồn được xuất bản đầu tiên trên Google",
              "Trang có nhiều lượt xem nhất",
              "Trang chính phủ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Sơ cấp là nơi gốc tạo ra dữ liệu, không phụ thuộc kênh xuất bản."
          },
          {
            "number": 2,
            "question": "Năm trang web cùng trích “theo một nghiên cứu” nhưng đều dẫn về một bài blog gốc chưa kiểm chứng. Đây là hiện tượng gì?",
            "options": [
              "Bằng chứng đáng tin vì nhiều nguồn xác nhận",
              "Dấu hiệu thông tin chính xác",
              "Hiện tượng trích dẫn vòng — không phải xác nhận độc lập",
              "Không có vấn đề gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Năm nguồn nhưng chỉ một gốc; sự lặp lại không tạo thêm bằng chứng."
          },
          {
            "number": 3,
            "question": "Hai nguồn uy tín đưa số liệu khác nhau về cùng một chỉ tiêu. Nguyên nhân phổ biến nhất là gì?",
            "options": [
              "Khác biệt về định nghĩa, kỳ báo cáo hoặc phương pháp đo",
              "Một trong hai chắc chắn sai",
              "Lỗi đánh máy",
              "Không có nguyên nhân hợp lý"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Khác biệt phương pháp luận là nguyên nhân phổ biến nhất, không phải sai sót."
          },
          {
            "number": 4,
            "question": "Tiêu chí nào trong năm tiêu chí đánh giá kiểm tra xem trang có mục đích bán hàng hay không?",
            "options": [
              "Tác giả",
              "Bằng chứng",
              "Khả năng kiểm chứng",
              "Mục đích"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tiêu chí “mục đích” hỏi trang tồn tại để làm gì."
          },
          {
            "number": 5,
            "question": "Khi so sánh hai nguồn có số liệu khác nhau, bước đầu tiên nên làm là gì?",
            "options": [
              "Chọn số liệu cao hơn",
              "So sánh định nghĩa và phương pháp trước khi so sánh con số",
              "Lấy trung bình cộng",
              "Bỏ qua cả hai"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hiểu đúng điều đang được đo trước khi kết luận về sự khác biệt."
          },
          {
            "number": 6,
            "question": "Bạn truy ngược trích dẫn của một bài báo và đến báo cáo của cơ quan thống kê, nơi số liệu được thu thập. Báo cáo đó là loại nguồn nào?",
            "options": [
              "Nguồn thứ cấp",
              "Nguồn sơ cấp",
              "Nguồn trích dẫn vòng",
              "Nguồn quảng cáo"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nguồn sơ cấp là nơi số liệu được tạo ra lần đầu."
          },
          {
            "number": 7,
            "question": "Hai nguồn uy tín đưa ra hai con số chênh lệch lớn về cùng một chỉ tiêu. Bước hợp lý nhất là gì?",
            "options": [
              "Lấy trung bình cộng",
              "Chọn con số lớn hơn cho ấn tượng",
              "So sánh định nghĩa, kỳ báo cáo và phương pháp đo của hai nguồn",
              "Kết luận một trong hai nguồn sai"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Hiểu đúng điều được đo trước khi kết luận về sự khác biệt."
          },
          {
            "number": 8,
            "question": "Sau khi so sánh, các nguồn vẫn còn mâu thuẫn. Cách báo cáo đúng là gì?",
            "options": [
              "Chọn một con số và giấu con số còn lại",
              "Nêu khoảng giá trị và lý do chênh lệch",
              "Bỏ chỉ tiêu đó ra khỏi báo cáo",
              "Tự đưa ra một con số mới không có căn cứ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Minh bạch về mâu thuẫn tốt hơn một con số duy nhất thiếu căn cứ."
          },
          {
            "number": 9,
            "question": "Tiêu chí “khả năng kiểm chứng” hỏi điều gì?",
            "options": [
              "Người khác có thể truy ra dữ liệu gốc và kiểm tra lại không",
              "Trang tải nhanh hay chậm",
              "Bài viết dài hay ngắn",
              "Có bao nhiêu lượt xem"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Khả năng kiểm chứng là nền tảng của độ tin cậy."
          },
          {
            "number": 10,
            "question": "Làm thế nào để phát hiện trích dẫn vòng?",
            "options": [
              "Đếm số nguồn xuất hiện",
              "Chọn nguồn xuất hiện đầu tiên",
              "Quan sát màu sắc của trang",
              "Truy ngược từng trích dẫn xem các nguồn có cùng dẫn về một gốc không"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Trích dẫn vòng chỉ lộ ra khi lần theo chuỗi trích dẫn đến gốc."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Tổ chức và quản lý khối lượng thông tin lớn",
        "competency_line": "Năng lực 1.3 · Mức 3–4",
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
          "Kiến trúc thông tin cần phân nhóm loại trừ lẫn nhau và giới hạn độ sâu thư mục để không quá phức tạp. Sổ đăng ký tài liệu ghi lại các trường bắt buộc (tên, chủ đề, phiên bản, người phụ trách) giúp tra cứu nhanh. Cần phân biệt lưu trữ cục bộ, đám mây, và thư mục dùng chung — đồng bộ không phải là sao lưu, vì thay đổi sai ở một nơi sẽ lan sang nơi khác. Nguyên tắc quyền tối thiểu áp dụng khi chia sẻ: chỉ cấp quyền cần thiết cho từng người.",
          "Quy trình tổ chức. 1. Chọn một tiêu chí phân nhóm duy nhất cho mỗi cấp thư mục (cấp 1 theo dự án, cấp 2 theo loại tài liệu); các nhóm phải loại trừ lẫn nhau. 2. Giới hạn tối đa khoảng bốn cấp thư mục. 3. Lập sổ đăng ký tài liệu với các trường bắt buộc: tên, chủ đề, phiên bản, người phụ trách. 4. Chọn nơi lưu: cục bộ, đám mây hay thư mục dùng chung; nhớ rằng đồng bộ không phải là sao lưu. 5. Chia sẻ theo nguyên tắc quyền tối thiểu: theo tên người cụ thể, quyền thấp nhất đủ dùng."
        ],
        "examples": [
          "Ví dụ trong công việc. Một dự án ra mắt sản phẩm có hợp đồng, hóa đơn, ghi chú họp, báo cáo và hình ảnh đến từ nhiều người. Sau sáu tháng đã có vài trăm tệp, nhiều bản “final” khác nhau. Cần thiết kế kiến trúc thông tin trước khi số tệp quá lớn, và lập sổ đăng ký để tìm theo thuộc tính."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Trộn hai cách phân loại ở cùng một cấp; thư mục quá sâu; coi đồng bộ là sao lưu; chia sẻ kiểu “ai có liên kết cũng sửa được”; không ghi người phụ trách trong sổ đăng ký."
        ],
        "practice": [
          "Cho một thư mục hỗn độn gồm nhiều loại tài liệu (hợp đồng, hóa đơn, ghi chú họp, báo cáo, hình ảnh). Thiết kế cấu trúc thư mục (tối đa bốn cấp), lập sổ đăng ký với tối thiểu 20 dòng, và viết quy tắc phân loại thành văn bản."
        ],
        "deliverable": "Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao nên giới hạn độ sâu thư mục ở khoảng bốn cấp?",
            "options": [
              "Vượt quá mức đó người dùng thường không lưu đúng chỗ nữa",
              "Do giới hạn kỹ thuật của máy tính",
              "Để tiết kiệm dung lượng",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cấu trúc quá sâu khiến việc lưu đúng chỗ trở nên khó khăn, dẫn đến sai lệch."
          },
          {
            "number": 2,
            "question": "Sổ đăng ký tài liệu dùng để làm gì?",
            "options": [
              "Thay thế thư mục",
              "Chỉ để trang trí",
              "Giúp tìm và báo cáo theo thuộc tính tài liệu",
              "Không cần thiết nếu đã có thư mục"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Sổ đăng ký cho phép lọc/tìm theo thuộc tính, việc thư mục đơn thuần không làm được."
          },
          {
            "number": 3,
            "question": "Nguyên tắc quyền tối thiểu nghĩa là gì?",
            "options": [
              "Cấp quyền cao nhất cho tất cả để tiện lợi",
              "Cấp mức quyền thấp nhất đủ để hoàn thành công việc",
              "Không cấp quyền cho ai",
              "Chỉ quản lý mới có quyền"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bắt đầu từ mức thấp nhất, chỉ nâng khi thực sự cần."
          },
          {
            "number": 4,
            "question": "Tài liệu nhạy cảm nên được chia sẻ bằng cách nào?",
            "options": [
              "Chia sẻ với người cụ thể theo tên, quyền hạn chế",
              "Bất kỳ ai có liên kết, quyền chỉnh sửa",
              "Đăng công khai để minh bạch",
              "Gửi qua email cho toàn công ty"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chia sẻ theo tên người cụ thể với quyền tối thiểu giảm rủi ro rò rỉ."
          },
          {
            "number": 5,
            "question": "Trộn hai cách phân loại (theo dự án và theo loại tài liệu) ở cùng một cấp thư mục gây ra vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Gây khó khăn khi quyết định lưu tệp vào đâu",
              "Tăng tốc độ tìm kiếm",
              "Giảm dung lượng lưu trữ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hai tiêu chí phân loại cạnh tranh nhau tạo ra sự mơ hồ khi lưu trữ."
          },
          {
            "number": 6,
            "question": "Bạn xóa nhầm một tệp trong thư mục đồng bộ và tệp biến mất trên mọi máy. Bài học đúng là gì?",
            "options": [
              "Đồng bộ không phải là sao lưu: thay đổi sai ở một nơi lan sang mọi nơi",
              "Đồng bộ luôn giữ lại bản cũ",
              "Đám mây không bao giờ mất dữ liệu",
              "Chỉ cần đồng bộ thêm nhiều máy hơn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Sao lưu giữ bản riêng để khôi phục; đồng bộ chỉ làm các nơi giống nhau."
          },
          {
            "number": 7,
            "question": "Sổ đăng ký tài liệu nên có những trường bắt buộc nào?",
            "options": [
              "Chỉ màu sắc và kích thước",
              "Mật khẩu của tệp",
              "Chỉ tên tệp",
              "Tên, chủ đề, phiên bản, người phụ trách"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Các trường này cho phép tìm và báo cáo theo thuộc tính."
          },
          {
            "number": 8,
            "question": "Cấu trúc nào đúng nguyên tắc phân nhóm loại trừ lẫn nhau?",
            "options": [
              "Cấp 1 vừa có thư mục theo dự án vừa có thư mục theo loại tài liệu",
              "Cấp 1 xen lẫn thư mục theo năm và theo người",
              "Mọi tệp để chung ở cấp 1",
              "Cấp 1 theo tên dự án, cấp 2 theo loại tài liệu"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mỗi cấp chỉ nên dùng một tiêu chí phân loại."
          },
          {
            "number": 9,
            "question": "Có 3 người cần xem kế hoạch, 1 trong số đó cần sửa. Cách chia sẻ đúng?",
            "options": [
              "Ai có liên kết cũng sửa được",
              "Cấp quyền sửa cho cả ba cho tiện",
              "Chia sẻ theo tên từng người: hai người quyền xem, một người quyền sửa",
              "Gửi bản sao qua email toàn công ty"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nguyên tắc quyền tối thiểu: mức thấp nhất đủ để hoàn thành công việc."
          },
          {
            "number": 10,
            "question": "Quản lý cần xem tình trạng phiên bản của 200 hợp đồng trong dự án. Công cụ phù hợp nhất là gì?",
            "options": [
              "Mở từng tệp để đọc",
              "Sổ đăng ký tài liệu có cột phiên bản",
              "Đếm số thư mục",
              "Nhờ mỗi người tự nhớ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Sổ đăng ký cho phép lọc và báo cáo theo thuộc tính."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M1-I — “Bản tóm tắt tình báo cạnh tranh” (Assignment)",
      "context": "Ban giám đốc cân nhắc một quyết định kinh doanh (ví dụ mở rộng sang phân khúc mới, hoặc định giá sản phẩm mới) và yêu cầu “một bản tóm tắt đúng nghĩa, không phải đống link.” Bạn tự chọn ngành và quyết định cụ thể, nhưng phải ghi rõ ngay từ đầu.",
      "requirements": "1. Viết nhu cầu thông tin đầy đủ gồm bốn yếu tố: phạm vi, thời gian, mức chi tiết, sản phẩm đầu ra. 2. Xây ma trận từ khóa (từ lõi, đồng nghĩa, thu hẹp, mở rộng). Chạy tối thiểu 8 truy vấn, dùng ít nhất 4 loại toán tử khác nhau, ghi nhật ký từng truy vấn và kết quả. 3. Đặt quy tắc dừng trước khi tìm, và nói rõ bạn đã dừng theo quy tắc đó thế nào. 4. Thu thập 5 nguồn, trong đó tối thiểu 2 nguồn sơ cấp. Lập bảng đánh giá năm tiêu chí cho cả 5 nguồn. 5. Chọn chỉ số quan trọng nhất, lập bảng so sánh các nguồn cho chỉ số đó, chỉ ra tối thiểu một khác biệt về định nghĩa hoặc phương pháp. 6. Viết bản tóm tắt 1 trang gồm: điều đã biết, điều còn tranh cãi, con số khuyến nghị và lý do. 7. Tổ chức tài liệu thu thập: sơ đồ thư mục không quá bốn cấp và sổ đăng ký tối thiểu 10 dòng.",
      "deliverables": "Nhu cầu thông tin; ma trận từ khóa và nhật ký truy vấn; bảng đánh giá nguồn; bảng so sánh; bản tóm tắt 1 trang; sơ đồ thư mục và sổ đăng ký.\nHình thức nộp. Một tệp tổng hợp (Word hoặc PDF) kèm ảnh chụp thư mục và tệp sổ đăng ký.",
      "rubric": [
        "Gợi ý. Đừng trộn lẫn “nguồn nhiều” với “nguồn độc lập”. Nếu các nguồn mâu thuẫn, hãy trình bày khoảng giá trị thay vì giấu đi một số. Tránh nhồi toán tử vào mọi truy vấn; mỗi truy vấn nên có lý do.",
        "Tiêu chí",
        "Điểm",
        "Nhu cầu thông tin đầy đủ, cụ thể",
        "15",
        "Chiến lược tìm kiếm (≥8 truy vấn, ≥4 toán tử, có quy tắc dừng)",
        "20",
        "Chất lượng nguồn (≥2 sơ cấp, đánh giá đầy đủ)",
        "20",
        "Bảng so sánh đầy đủ, phát hiện khác biệt",
        "20",
        "Khuyến nghị rõ ràng, có căn cứ",
        "15",
        "Tổ chức tài liệu (thư mục, sổ đăng ký)",
        "10"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Truy vấn site:edu.vn \"chuyển đổi số\" filetype:pdf trả về kết quả nào?",
        "options": [
          "Mọi trang nói về chuyển đổi số",
          "Tệp PDF trên các trang đuôi edu.vn có đúng cụm “chuyển đổi số”",
          "Chỉ bài đăng mạng xã hội",
          "Chỉ tệp Word"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Ba toán tử giới hạn miền, cụm từ chính xác và định dạng tệp."
      },
      {
        "number": 2,
        "question": "Muốn tìm tài liệu có “báo cáo” hoặc “thống kê”, cách viết nào đúng?",
        "options": [
          "báo cáo OR thống kê",
          "báo cáo or thống kê",
          "báo cáo -thống kê",
          "site:báo cáo thống kê"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Toán tử OR chỉ có tác dụng khi viết hoa."
      },
      {
        "number": 3,
        "question": "Vì sao ma trận từ khóa cho “nhân viên nghỉ việc” nên có thêm “thôi việc”, “biến động nhân sự”?",
        "options": [
          "Để kết quả ít đi",
          "Mỗi đơn vị dùng từ khác nhau và mỗi từ chạm tới nhóm nguồn khác nhau",
          "Công cụ tìm kiếm bắt buộc dùng nhiều từ",
          "Để khỏi phải đánh giá nguồn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Từ vựng khác nhau chạm tới các nhóm nguồn xuất bản khác nhau."
      },
      {
        "number": 4,
        "question": "Nhu cầu thông tin nào đủ cụ thể nhất?",
        "options": [
          "Tìm hiểu về đối thủ",
          "Tìm thật nhiều thông tin về thị trường",
          "Số liệu thị phần của 5 đối thủ lớn nhất ngành nước ép đóng chai tại miền Nam trong hai năm gần nhất, trình bày thành bảng một trang",
          "Tìm báo cáo"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Có phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra."
      },
      {
        "number": 5,
        "question": "Quy tắc dừng tìm kiếm giúp ích gì?",
        "options": [
          "Tránh tìm vô hạn và biết khi nào đã đủ thông tin",
          "Tránh phải ghi nhật ký",
          "Đảm bảo mọi nguồn đều chính xác",
          "Thay thế việc đánh giá nguồn"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Quy tắc dừng đặt trước giữ cho nghiên cứu có điểm kết thúc rõ ràng."
      },
      {
        "number": 6,
        "question": "Một truy vấn có quá nhiều toán tử và không ra kết quả. Nên làm gì?",
        "options": [
          "Thêm một toán tử khác",
          "Xóa hết rồi gõ nguyên câu hỏi",
          "Nới dần từng toán tử và ghi lại ảnh hưởng của từng bước",
          "Bỏ cuộc"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tinh chỉnh từng bước và ghi nhật ký giúp hiểu truy vấn nào gây thu hẹp quá mức."
      },
      {
        "number": 7,
        "question": "Cần tìm bài nghiên cứu học thuật về một chủ đề. Cách chọn công cụ hợp lý là gì?",
        "options": [
          "Chọn công cụ hoặc cơ sở dữ liệu chuyên cho loại nguồn đó, không chỉ dùng một công cụ chung",
          "Luôn dùng một công cụ cho mọi nhu cầu",
          "Chọn công cụ có nhiều quảng cáo nhất",
          "Chọn công cụ có giao diện đẹp nhất"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Công cụ tìm kiếm cần phù hợp với loại nguồn cần tìm."
      },
      {
        "number": 8,
        "question": "Một bài báo trích lại số liệu từ báo cáo của cơ quan thống kê. Bài báo là loại nguồn nào?",
        "options": [
          "Nguồn thứ cấp",
          "Nguồn sơ cấp",
          "Nguồn trích dẫn vòng",
          "Nguồn không dùng được"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Nguồn thứ cấp trích dẫn hoặc tổng hợp từ nguồn sơ cấp."
      },
      {
        "number": 9,
        "question": "Năm tiêu chí đánh giá nguồn tin là gì?",
        "options": [
          "Tốc độ tải, giao diện, lượt xem, bình luận, quảng cáo",
          "Tiêu đề, hình ảnh, video, âm thanh, bố cục",
          "Tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng",
          "Ngôn ngữ, màu sắc, độ dài, số trang, định dạng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Đây là năm tiêu chí của khóa."
      },
      {
        "number": 10,
        "question": "Ba báo cáo đều ghi “theo báo cáo X”, và X lại dẫn lại một trong ba báo cáo đó. Đây là hiện tượng gì?",
        "options": [
          "Bằng chứng mạnh nhờ có ba nguồn",
          "Trích dẫn vòng, không tạo thêm bằng chứng độc lập",
          "Nguồn sơ cấp",
          "Tam giác hóa"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nhiều nguồn nhưng chung một gốc thì không phải bằng chứng độc lập."
      },
      {
        "number": 11,
        "question": "Hai nguồn đưa số liệu theo hai kỳ báo cáo khác nhau. Việc nên làm là gì?",
        "options": [
          "Lấy số mới hơn mà không ghi chú",
          "Cộng hai con số",
          "Bỏ cả hai nguồn",
          "Đưa về cùng kỳ báo cáo hoặc nêu rõ khác biệt trước khi so sánh"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "So sánh định nghĩa và phạm vi đo trước khi so sánh con số."
      },
      {
        "number": 12,
        "question": "Tiêu chí “mục đích” giúp phát hiện điều gì?",
        "options": [
          "Trang cập nhật ngày nào",
          "Có bao nhiêu tác giả",
          "Trang tồn tại để thông tin, bán hàng hay thuyết phục, từ đó nhận ra rủi ro thiên lệch",
          "Có bao nhiêu liên kết ra ngoài"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Mục đích của trang ảnh hưởng đến cách trình bày số liệu."
      },
      {
        "number": 13,
        "question": "Hai nguồn uy tín cho hai giá trị khác nhau cho một chỉ tiêu. Cách báo cáo tốt nhất?",
        "options": [
          "Chỉ nêu con số lớn hơn",
          "Chỉ nêu trung bình cộng mà không giải thích",
          "Không báo cáo vì còn mâu thuẫn",
          "Nêu khoảng giá trị, giải thích nguyên nhân chênh lệch và khuyến nghị con số dùng kèm lý do"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Minh bạch và có khuyến nghị là cách báo cáo hữu ích nhất."
      },
      {
        "number": 14,
        "question": "“Phân tích, diễn giải và đánh giá dữ liệu” ở mức trung cấp nghĩa là gì?",
        "options": [
          "Không chỉ đọc con số mà hiểu ý nghĩa, nguyên nhân khác biệt và đánh giá độ tin cậy",
          "Sao chép con số vào báo cáo",
          "Chỉ làm đẹp bảng số liệu",
          "Chọn con số thuận lợi nhất"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Đây là yêu cầu cần đạt của năng lực 1.2 ở bậc 3–4."
      },
      {
        "number": 15,
        "question": "Thực tập sinh cần xem bảng chi phí để nhập báo cáo. Nên cấp quyền nào?",
        "options": [
          "Quyền sửa trên toàn bộ thư mục",
          "Quyền quản trị",
          "Không cấp quyền nào",
          "Quyền xem trên đúng tệp cần thiết"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nguyên tắc quyền tối thiểu."
      },
      {
        "number": 16,
        "question": "Điều nào đúng về đồng bộ và sao lưu?",
        "options": [
          "Đồng bộ và sao lưu hoàn toàn giống nhau",
          "Sao lưu giữ bản riêng để khôi phục khi sai; đồng bộ làm các nơi giống nhau kể cả khi sai",
          "Đồng bộ luôn giữ bản cũ",
          "Sao lưu làm lỗi lan sang mọi nơi"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đồng bộ không thay thế sao lưu."
      },
      {
        "number": 17,
        "question": "Thư mục sâu chín cấp. Hậu quả điển hình là gì?",
        "options": [
          "Máy tính chạy nhanh hơn",
          "Dung lượng lưu trữ giảm",
          "Không có hậu quả nào",
          "Người dùng ngại tìm và thường lưu sai chỗ"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cấu trúc quá sâu khiến việc lưu đúng chỗ trở nên khó."
      },
      {
        "number": 18,
        "question": "Trường nào trong sổ đăng ký giúp xác định bản mới nhất của tài liệu?",
        "options": [
          "Màu sắc",
          "Kích thước màn hình",
          "Phiên bản",
          "Tên máy in"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Trường phiên bản là một trong các trường bắt buộc."
      },
      {
        "number": 19,
        "question": "Thư mục cấp 1 chứa lẫn “Hợp đồng”, “Dự án A”, “Dự án B”. Vấn đề là gì?",
        "options": [
          "Có quá ít thư mục",
          "Tên thư mục quá ngắn",
          "Không có vấn đề gì",
          "Trộn hai tiêu chí phân loại cùng một cấp nên khó quyết định lưu ở đâu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Hai tiêu chí cạnh tranh nhau tạo sự mơ hồ."
      },
      {
        "number": 20,
        "question": "Cách chia sẻ tài liệu nhạy cảm đúng là gì?",
        "options": [
          "Ai có liên kết đều xem được",
          "Chia sẻ theo tên người cụ thể với quyền hạn chế",
          "Đăng lên nhóm chung toàn công ty",
          "Gửi qua mạng xã hội"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giảm rủi ro rò rỉ bằng quyền tối thiểu."
      }
    ]
  },
  "M1-A": {
    "code": "M1-A",
    "title": "PHÂN TÍCH THÔNG TIN VÀ QUẢN TRỊ DỮ LIỆU",
    "domain_number": 1,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Nghiên cứu phức hợp đa nguồn",
        "competency_line": "Năng lực 1.1 · Mức 5–6",
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
          "Từ một câu hỏi kinh doanh mơ hồ, cần xây dựng kế hoạch nghiên cứu rõ ràng, phối hợp nguồn bên ngoài (báo cáo ngành, số liệu chính thức) với dữ liệu nội bộ của doanh nghiệp. Tam giác hóa — dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy — giúp tăng độ tin cậy của kết luận. Khi dữ liệu không tồn tại, cần nhận diện khoảng trống thông tin và đưa ra ước lượng có căn cứ thay vì bỏ qua. Ở mức này, người học còn cần hướng dẫn được đồng nghiệp cách tìm kiếm hiệu quả — đúng như Thông tư mô tả “hướng dẫn người khác” ở bậc 5.",
          "Khung bốn bước. 1. Xác định quyết định cần hỗ trợ và các câu hỏi con cần trả lời. 2. Lập kế hoạch nguồn: nguồn bên ngoài nào, dữ liệu nội bộ nào, ai nắm giữ. 3. Thu thập và tam giác hóa: dùng từ ba nguồn độc lập trở lên cho các chỉ tiêu then chốt, ghi rõ khoảng giá trị. 4. Nhận diện khoảng trống thông tin và đề xuất ước lượng có căn cứ, ghi rõ đó là ước lượng.",
          "Hướng dẫn đồng nghiệp. Ở mức nâng cao, bạn còn giúp người khác làm tốt hơn: chia sẻ mẫu kế hoạch nghiên cứu và mẫu ma trận từ khóa, góp ý cách đặt câu hỏi, rà soát nhật ký tìm kiếm của đồng nghiệp."
        ],
        "examples": [
          "Ví dụ trong công việc. Ban giám đốc hỏi: “Có nên mở thêm chi nhánh ở miền Trung không?” Đây không phải một câu hỏi tìm kiếm mà là một quyết định. Bạn phải chia nó thành các câu hỏi nghiên cứu nhỏ hơn: quy mô và tốc độ tăng của thị trường (nguồn bên ngoài), doanh thu và chi phí hiện tại của doanh nghiệp ở khu vực lân cận (dữ liệu nội bộ), đối thủ và rủi ro."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Bắt đầu thu thập trước khi biết quyết định cần gì; chỉ dùng nguồn bên ngoài hoặc chỉ dùng dữ liệu nội bộ; coi ba nguồn cùng gốc là tam giác hóa; để trống khoảng trống thay vì nêu rõ."
        ],
        "practice": [
          "Doanh nghiệp cân nhắc một quyết định kinh doanh quan trọng. Xây kế hoạch nghiên cứu theo khung bốn bước, thu thập bằng chứng từ tối thiểu hai loại nguồn (bên ngoài và nội bộ), xác định rõ phần nào còn là khoảng trống thông tin và đề xuất cách ước lượng, rồi trình bày phần bằng chứng thu được và phần còn thiếu cho nhóm."
        ],
        "deliverable": "Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bước đầu tiên khi đối mặt với một vấn đề nghiên cứu chưa rõ ràng là gì?",
            "options": [
              "Tìm kiếm ngay trên Google",
              "Hỏi ý kiến đồng nghiệp",
              "Xác định quyết định nào đang cần được đưa ra",
              "Thu thập càng nhiều dữ liệu càng tốt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xác định quyết định cần hỗ trợ giúp định hướng toàn bộ quá trình nghiên cứu."
          },
          {
            "number": 2,
            "question": "Vì sao cần phối hợp cả nguồn bên ngoài và nội bộ khi nghiên cứu mở rộng thị trường?",
            "options": [
              "Để có nhiều số liệu hơn",
              "Vì quy định yêu cầu",
              "Không cần thiết, một loại là đủ",
              "Nguồn bên ngoài cho biết thị trường, nguồn nội bộ cho biết vị trí thực tế của doanh nghiệp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Hai loại nguồn trả lời hai câu hỏi khác nhau, cần kết hợp để có bức tranh đầy đủ."
          },
          {
            "number": 3,
            "question": "Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì?",
            "options": [
              "Bỏ qua vấn đề đó",
              "Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng",
              "Giả định một con số bất kỳ",
              "Trì hoãn toàn bộ nghiên cứu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Minh bạch về khoảng trống và ước lượng có căn cứ tốt hơn giả định ngầm hoặc bỏ qua."
          },
          {
            "number": 4,
            "question": "Tam giác hóa trong nghiên cứu nghĩa là gì?",
            "options": [
              "Vẽ biểu đồ hình tam giác",
              "Dùng ít nhất ba nguồn độc lập để xác lập khoảng giá trị đáng tin",
              "Chia dữ liệu thành ba phần",
              "Kiểm tra dữ liệu ba lần"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ba nguồn độc lập giúp xác lập độ tin cậy cao hơn một nguồn đơn lẻ."
          },
          {
            "number": 5,
            "question": "Hướng dẫn đồng nghiệp tìm kiếm hiệu quả bao gồm việc gì?",
            "options": [
              "Tự làm hết thay họ",
              "Không can thiệp",
              "Chỉ giao việc mà không hướng dẫn",
              "Chia sẻ mẫu chiến lược tìm kiếm và review cách đặt câu hỏi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chuẩn hóa và chia sẻ phương pháp giúp nâng cao năng lực chung của nhóm."
          },
          {
            "number": 6,
            "question": "Câu hỏi “Có nên mở chi nhánh ở miền Trung không?” nên được xử lý trước hết bằng cách nào?",
            "options": [
              "Chia thành các câu hỏi nghiên cứu con gắn với quyết định cần đưa ra",
              "Tìm ngay với từ khóa “mở chi nhánh”",
              "Thu thập mọi báo cáo ngành có thể tìm thấy",
              "Trả lời theo cảm nhận của ban giám đốc"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Xác định quyết định và câu hỏi con định hướng toàn bộ quá trình nghiên cứu."
          },
          {
            "number": 7,
            "question": "Ba nguồn đều lấy số từ cùng một khảo sát gốc. Có phải tam giác hóa không?",
            "options": [
              "Không, vì ba nguồn không độc lập với nhau",
              "Có, vì đã có ba nguồn",
              "Có, nếu ba nguồn khác tên",
              "Chỉ khi nguồn là .gov.vn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tam giác hóa đòi hỏi từ ba nguồn độc lập trở lên."
          },
          {
            "number": 8,
            "question": "Dữ liệu về nhu cầu khách hàng ở khu vực mới chưa tồn tại. Cách xử lý đúng là gì?",
            "options": [
              "Bỏ chỉ tiêu đó khỏi nghiên cứu",
              "Nêu khoảng trống, ước lượng có căn cứ từ dữ liệu gần nhất và ghi rõ đó là ước lượng",
              "Giả định một con số bất kỳ",
              "Hoãn quyết định vô thời hạn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Minh bạch về khoảng trống thông tin và ước lượng có căn cứ."
          },
          {
            "number": 9,
            "question": "Dữ liệu doanh thu nội bộ chủ yếu trả lời câu hỏi nào?",
            "options": [
              "Quy mô tổng thị trường",
              "Chính sách của cơ quan nhà nước",
              "Vị trí thực tế của doanh nghiệp",
              "Xu hướng toàn cầu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nguồn nội bộ cho biết doanh nghiệp đang ở đâu; nguồn ngoài cho biết thị trường."
          },
          {
            "number": 10,
            "question": "Trưởng nhóm muốn nâng năng lực tìm kiếm cho cả nhóm. Việc làm hiệu quả nhất là gì?",
            "options": [
              "Chia sẻ mẫu kế hoạch nghiên cứu và ma trận từ khóa, rồi góp ý cách đặt câu hỏi của đồng nghiệp",
              "Tự làm hết các truy vấn",
              "Cấm đồng nghiệp tự tìm kiếm",
              "Chỉ gửi đường dẫn kết quả"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chuẩn hóa và chia sẻ phương pháp giúp nâng năng lực chung."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Đánh giá chất lượng dữ liệu",
        "competency_line": "Năng lực 1.2 · Mức 5–6",
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
          "Cần viết được quy tắc kiểm tra dữ liệu có thể áp dụng máy móc (ví dụ: số điện thoại phải đủ 10 chữ số). Biện pháp phòng ngừa được đặt tại điểm nhập liệu để chặn lỗi từ đầu; biện pháp phát hiện dùng báo cáo ngoại lệ và đối chiếu để tìm lỗi đã lọt qua. Xây bảng điểm chất lượng dữ liệu có ngưỡng cụ thể và người chịu trách nhiệm giúp duy trì chất lượng theo thời gian, đồng thời cần phân biệt dữ liệu sai với dữ liệu chỉ đơn thuần bất thường.",
          "Quy trình đánh giá. 1. Với từng chiều trong sáu chiều (chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất), chọn một phép đo cụ thể. Ví dụ: đầy đủ là tỉ lệ trường trống; duy nhất là tỉ lệ bản ghi trùng; hợp lệ là tỉ lệ số điện thoại đủ 10 chữ số. 2. Viết quy tắc kiểm tra có thể áp dụng máy móc. 3. Phân biệt dữ liệu sai với dữ liệu chỉ bất thường: một đơn hàng giá trị rất lớn có thể vẫn hợp lệ. 4. Với mỗi biện pháp cải thiện, phân loại phòng ngừa (chặn tại điểm nhập) hay phát hiện (báo cáo ngoại lệ, đối chiếu) và gán người phụ trách. 5. Lập bảng điểm có ngưỡng mục tiêu và theo dõi theo thời gian."
        ],
        "examples": [
          "Ví dụ trong công việc. Dữ liệu khách hàng nội bộ có số điện thoại thiếu chữ số, hai bản ghi cùng một người, địa chỉ đã cũ. Trước khi đưa vào một quyết định, cần chấm điểm chất lượng bằng số liệu cụ thể thay vì cảm giác “dữ liệu có vẻ ổn”."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chỉ kiểm tra một chiều; đo bằng cảm giác; xóa dữ liệu bất thường mà không xác minh; chỉ làm biện pháp phát hiện; có bảng điểm nhưng không có người chịu trách nhiệm."
        ],
        "practice": [
          "Cho một tập dữ liệu khách hàng thật của doanh nghiệp, hãy chấm điểm cả sáu chiều bằng số liệu cụ thể (ví dụ tính phần trăm trường trống), đề xuất tối thiểu sáu quy tắc kiểm tra, và với mỗi biện pháp cải thiện đề xuất, phân loại là phòng ngừa hay phát hiện, gán người phụ trách."
        ],
        "deliverable": "Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Một email đúng định dạng nhưng gán sai cho khách hàng khác là vi phạm chiều nào?",
            "options": [
              "Chính xác",
              "Hợp lệ",
              "Đầy đủ",
              "Duy nhất"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Định dạng đúng (hợp lệ) nhưng không phản ánh đúng thực tế (không chính xác)."
          },
          {
            "number": 2,
            "question": "Biện pháp nào sau đây là biện pháp phòng ngừa?",
            "options": [
              "Báo cáo ngoại lệ hàng tuần",
              "Danh sách chọn sẵn bắt buộc khi nhập liệu",
              "Đối chiếu dữ liệu định kỳ",
              "Rà soát thủ công cuối tháng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Danh sách chọn sẵn chặn lỗi ngay tại điểm nhập liệu, trước khi lỗi xảy ra."
          },
          {
            "number": 3,
            "question": "Một khách hàng có ba mã khách hàng khác nhau trong hệ thống là vấn đề của chiều nào?",
            "options": [
              "Kịp thời",
              "Hợp lệ",
              "Chính xác",
              "Duy nhất"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Một thực thể được ghi nhận nhiều lần vi phạm tính duy nhất."
          },
          {
            "number": 4,
            "question": "Vì sao nên ưu tiên biện pháp phòng ngừa hơn phát hiện?",
            "options": [
              "Phòng ngừa rẻ hơn luôn luôn",
              "Phát hiện không hiệu quả",
              "Phòng ngừa giải quyết tận gốc, giảm nhu cầu dọn dẹp lặp lại",
              "Không có sự khác biệt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ngăn lỗi xảy ra tốt hơn liên tục phải sửa lỗi sau khi đã phát sinh."
          },
          {
            "number": 5,
            "question": "Bảng điểm chất lượng dữ liệu cần có yếu tố nào để thực sự thúc đẩy cải thiện?",
            "options": [
              "Chỉ cần con số phần trăm",
              "Màu sắc đẹp",
              "Càng nhiều chiều đo càng tốt",
              "Ngưỡng mục tiêu và người chịu trách nhiệm cụ thể"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Không có người chịu trách nhiệm, bảng điểm không tạo ra hành động cải thiện."
          },
          {
            "number": 6,
            "question": "Tỉ lệ ô trống trong cột email là 18%. Phép đo này thuộc chiều chất lượng nào?",
            "options": [
              "Chính xác",
              "Đầy đủ",
              "Hợp lệ",
              "Duy nhất"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tỉ lệ trường trống là phép đo của chiều đầy đủ."
          },
          {
            "number": 7,
            "question": "Dữ liệu tồn kho chỉ cập nhật hàng tuần trong khi quyết định cần số liệu theo ngày. Chiều nào chưa đáp ứng?",
            "options": [
              "Kịp thời",
              "Duy nhất",
              "Hợp lệ",
              "Đầy đủ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chiều kịp thời đo việc dữ liệu có đủ mới cho nhu cầu sử dụng hay không."
          },
          {
            "number": 8,
            "question": "Một đơn hàng có giá trị gấp 50 lần mức trung bình. Cách xử lý đúng là gì?",
            "options": [
              "Xác minh với người phụ trách trước khi kết luận sai, vì có thể chỉ là bất thường",
              "Xóa ngay vì chắc chắn sai",
              "Giữ nguyên, không kiểm tra",
              "Giảm giá trị xuống mức trung bình"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần phân biệt dữ liệu sai với dữ liệu chỉ bất thường."
          },
          {
            "number": 9,
            "question": "Quy tắc kiểm tra nào có thể áp dụng máy móc?",
            "options": [
              "Dữ liệu phải đẹp",
              "Số điện thoại phải gồm đúng 10 chữ số",
              "Khách hàng phải hài lòng",
              "Báo cáo phải dễ hiểu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quy tắc máy móc phải đo được và có kết quả đúng hoặc sai rõ ràng."
          },
          {
            "number": 10,
            "question": "Ví dụ nào là biện pháp phát hiện?",
            "options": [
              "Danh sách chọn sẵn tại điểm nhập liệu",
              "Ô bắt buộc không cho để trống",
              "Báo cáo ngoại lệ hàng tuần liệt kê các bản ghi vi phạm quy tắc",
              "Định dạng tự động chặn ký tự lạ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Biện pháp phát hiện tìm ra lỗi sau khi dữ liệu đã được nhập vào hệ thống."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Quản trị dữ liệu và vòng đời thông tin",
        "competency_line": "Năng lực 1.3 · Mức 5–6",
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
          "Ba vai trò cần được phân định rõ: chủ sở hữu dữ liệu (chịu trách nhiệm cuối cùng), người quản lý dữ liệu (duy trì chất lượng hàng ngày), người vận hành (sử dụng dữ liệu trong công việc). Từ điển dữ liệu ghi lại tên trường, định nghĩa, kiểu dữ liệu, giá trị hợp lệ, nguồn gốc và mức nhạy cảm cho một tập dữ liệu cốt lõi. Khái niệm dữ liệu chủ và nguồn chân lý duy nhất giúp chấm dứt tình trạng các bộ phận báo cáo số liệu khác nhau cho cùng một chỉ tiêu. Lịch lưu trữ và hủy dữ liệu cần tuân theo yêu cầu pháp lý và nghiệp vụ.",
          "Quy trình. 1. Phân vai ba cấp: chủ sở hữu dữ liệu (trách nhiệm cuối cùng), người quản lý dữ liệu (duy trì chất lượng và định nghĩa hàng ngày), người vận hành (sử dụng trong công việc). 2. Xây từ điển dữ liệu cho tập dữ liệu cốt lõi: tên trường, định nghĩa, kiểu, giá trị hợp lệ, nguồn gốc, mức nhạy cảm, chủ sở hữu. 3. Chỉ định nguồn chân lý duy nhất cho từng chỉ tiêu; mọi bản sao khác chỉ mang tính tham khảo. 4. Lập lịch lưu trữ và hủy dữ liệu dựa trên yêu cầu pháp lý và nghiệp vụ, ghi rõ ai phê duyệt việc hủy. 5. Rà soát định kỳ và cập nhật từ điển khi nghiệp vụ thay đổi."
        ],
        "examples": [
          "Ví dụ trong công việc (giả định). Bộ phận bán hàng báo 12.000 khách hàng, bộ phận chăm sóc khách hàng báo 15.000. Không bên nào tính sai: bên đầu đếm người đã mua trong 12 tháng, bên sau đếm mọi người từng liên hệ. Giải pháp là thống nhất và ghi một định nghĩa vào từ điển dữ liệu, chỉ định một nguồn chân lý và phân vai rõ ràng."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tranh cãi con số mà không bàn đến định nghĩa; có nhiều “nguồn chân lý”; lập từ điển một lần rồi bỏ; giữ dữ liệu vô thời hạn “cho chắc”; không biết ai là chủ sở hữu của một tập dữ liệu."
        ],
        "practice": [
          "Hai bộ phận trong doanh nghiệp báo cáo số khách hàng khác nhau mỗi tháng, gây tranh cãi liên tục. Xây từ điển dữ liệu tối thiểu 10 trường, phân định ba vai trò cho tập dữ liệu này, thống nhất một định nghĩa cho chỉ tiêu đang gây tranh cãi, và lập lịch lưu trữ cho ba loại dữ liệu khác nhau trong doanh nghiệp."
        ],
        "deliverable": "Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịch lưu trữ.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Hai bộ phận báo cáo số khách hàng khác nhau. Cách xử lý đúng theo quản trị dữ liệu là gì?",
            "options": [
              "Tính lại số liệu",
              "Dùng số liệu cao hơn",
              "Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu",
              "Lấy trung bình cộng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Vấn đề nằm ở định nghĩa, không phải phép tính; cần thống nhất và ghi chép lại."
          },
          {
            "number": 2,
            "question": "Người quản lý dữ liệu (data steward) có vai trò gì?",
            "options": [
              "Chịu trách nhiệm cuối cùng và phê duyệt quyền truy cập",
              "Duy trì chất lượng và định nghĩa dữ liệu hàng ngày",
              "Vận hành hạ tầng kỹ thuật",
              "Không có vai trò cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chủ sở hữu chịu trách nhiệm cuối; người quản lý duy trì vận hành hàng ngày."
          },
          {
            "number": 3,
            "question": "“Nguồn chân lý duy nhất” nghĩa là gì?",
            "options": [
              "Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ là bản sao",
              "Nguồn dữ liệu duy nhất tồn tại",
              "Chỉ có một người được xem dữ liệu",
              "Dữ liệu không bao giờ thay đổi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chỉ định một nguồn chính thức tránh nhầm lẫn giữa nhiều bản sao."
          },
          {
            "number": 4,
            "question": "Lịch lưu trữ và hủy dữ liệu nên được quyết định dựa trên điều gì?",
            "options": [
              "Dung lượng lưu trữ còn trống",
              "Sở thích cá nhân của quản lý",
              "Không cần quyết định, giữ mãi mãi là an toàn nhất",
              "Yêu cầu pháp lý và nhu cầu nghiệp vụ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Giữ dữ liệu vô thời hạn không phải an toàn, mà là rủi ro pháp lý và bảo mật."
          },
          {
            "number": 5,
            "question": "Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề gì?",
            "options": [
              "Tăng tốc độ xử lý dữ liệu",
              "Giảm dung lượng lưu trữ",
              "Mã hóa dữ liệu",
              "Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Định nghĩa thống nhất, được ghi chép, loại bỏ nguyên nhân phổ biến nhất của tranh cãi số liệu."
          },
          {
            "number": 6,
            "question": "Chủ sở hữu dữ liệu khác người quản lý dữ liệu ở điểm nào?",
            "options": [
              "Hai vai trò hoàn toàn giống nhau",
              "Chủ sở hữu chịu trách nhiệm cuối cùng; người quản lý duy trì chất lượng và định nghĩa hàng ngày",
              "Chủ sở hữu vận hành hạ tầng; người quản lý duyệt chi",
              "Người quản lý chịu trách nhiệm cuối cùng; chủ sở hữu nhập liệu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ba vai trò cần phân định rõ: chủ sở hữu, người quản lý, người vận hành."
          },
          {
            "number": 7,
            "question": "Mỗi trường dữ liệu trong từ điển dữ liệu cần ghi những thông tin nào?",
            "options": [
              "Định nghĩa, kiểu dữ liệu, giá trị hợp lệ, nguồn gốc, mức nhạy cảm, chủ sở hữu",
              "Chỉ tên trường",
              "Chỉ kiểu dữ liệu",
              "Chỉ ngày tạo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Từ điển dữ liệu mô tả chi tiết từng trường để mọi người hiểu thống nhất."
          },
          {
            "number": 8,
            "question": "Hai hệ thống cùng có thông tin khách hàng và số liệu lệch nhau. Giải pháp phù hợp là gì?",
            "options": [
              "Dùng cả hai và lấy trung bình",
              "Xóa một trong hai hệ thống",
              "Chỉ định một hệ thống là nguồn chân lý duy nhất cho chỉ tiêu đó",
              "Để mỗi bộ phận tự chọn hệ thống mình thích"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nguồn chân lý duy nhất chấm dứt tình trạng báo cáo số liệu khác nhau."
          },
          {
            "number": 9,
            "question": "Dữ liệu cá nhân đã hết thời hạn lưu theo lịch nhưng “có thể cần sau này”. Cách đúng là gì?",
            "options": [
              "Hủy theo lịch đã được phê duyệt, trừ khi có yêu cầu pháp lý hoặc nghiệp vụ cần giữ",
              "Giữ mãi cho chắc",
              "Chuyển sang máy cá nhân",
              "Chờ đến khi hết dung lượng lưu trữ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giữ dữ liệu vô thời hạn là rủi ro pháp lý và bảo mật, không phải an toàn."
          },
          {
            "number": 10,
            "question": "Từ điển dữ liệu cần được xem xét lại khi nào?",
            "options": [
              "Không bao giờ vì đã hoàn tất",
              "Khi nghiệp vụ hoặc định nghĩa chỉ tiêu thay đổi",
              "Chỉ khi đổi màu giao diện",
              "Chỉ khi đổi nhà cung cấp internet"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Từ điển phải được cập nhật để luôn phản ánh đúng thực tế."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M1-A — “Quyết định dựa trên dữ liệu đáng ngờ” (Assignment)",
      "context": "Ban giám đốc cần ra một quyết định kinh doanh quan trọng (ví dụ mở rộng thị trường, thay đổi chính sách giá) nhưng dữ liệu nội bộ đang bị nghi ngờ về độ tin cậy. Bạn tự chọn bối cảnh, ghi rõ quyết định cần hỗ trợ, và làm việc như người được giao dẫn dắt toàn bộ phần phân tích.",
      "requirements": "1. Thực hiện nghiên cứu đa nguồn theo khung bốn bước: xác định quyết định và câu hỏi con; kế hoạch nguồn; thu thập và tam giác hóa; khoảng trống thông tin và ước lượng. 2. Lập hồ sơ bằng chứng: tối thiểu hai loại nguồn (bên ngoài và nội bộ), với các chỉ tiêu then chốt có từ ba nguồn độc lập. 3. Đánh giá chất lượng một tập dữ liệu nội bộ liên quan theo sáu chiều, bằng số liệu cụ thể; viết tối thiểu sáu quy tắc kiểm tra. 4. Với mỗi biện pháp cải thiện, phân loại phòng ngừa hay phát hiện và gán người phụ trách. 5. Xây bộ tài liệu quản trị: từ điển dữ liệu (tối thiểu 10 trường), bảng phân vai ba cấp, một định nghĩa thống nhất cho chỉ tiêu đang gây tranh cãi, lịch lưu trữ cho ba loại dữ liệu. 6. Viết báo cáo tổng hợp tối đa 3 trang: khuyến nghị quyết định, mức độ tin cậy, giới hạn của phân tích. 7. Soạn một trang hướng dẫn cho đồng nghiệp: cách tìm kiếm và kiểm tra nguồn theo phương pháp bạn vừa dùng.",
      "deliverables": "Kế hoạch nghiên cứu; hồ sơ bằng chứng; danh mục khoảng trống thông tin; bảng điểm chất lượng dữ liệu và bộ quy tắc; từ điển dữ liệu, bảng phân vai, định nghĩa thống nhất, lịch lưu trữ; báo cáo tổng hợp; trang hướng dẫn đồng nghiệp.\nHình thức nộp. Một bộ hồ sơ (Word, PDF và Excel nếu có) theo thứ tự các mục trên.",
      "rubric": [
        "Gợi ý. Đừng che giấu khoảng trống thông tin. Phân biệt rõ dữ liệu sai và dữ liệu bất thường. Báo cáo nên ghi rõ phần nào là bằng chứng, phần nào là ước lượng.",
        "Tiêu chí",
        "Điểm",
        "Kế hoạch và thực hiện nghiên cứu đa nguồn, có tam giác hóa",
        "20",
        "Đánh giá chất lượng dữ liệu đầy đủ sáu chiều, định lượng",
        "20",
        "Bộ quy tắc kiểm tra và kế hoạch kiểm soát (phòng ngừa/phát hiện, người phụ trách)",
        "10",
        "Bộ tài liệu quản trị: từ điển, phân vai, định nghĩa, lịch lưu trữ",
        "20",
        "Báo cáo tổng hợp: khuyến nghị, mức tin cậy, giới hạn",
        "20",
        "Trang hướng dẫn đồng nghiệp",
        "10"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Bước đầu tiên khi nhận một câu hỏi kinh doanh mơ hồ là gì?",
        "options": [
          "Tìm ngay trên công cụ tìm kiếm",
          "Xác định quyết định cần hỗ trợ và các câu hỏi con cần trả lời",
          "Thu thập thật nhiều dữ liệu",
          "Hỏi đồng nghiệp rồi dùng luôn câu trả lời"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Xác định quyết định giúp định hướng toàn bộ nghiên cứu."
      },
      {
        "number": 2,
        "question": "Vì sao cần cả nguồn bên ngoài và dữ liệu nội bộ khi nghiên cứu mở rộng thị trường?",
        "options": [
          "Để có nhiều con số hơn",
          "Nguồn ngoài cho biết thị trường, dữ liệu nội bộ cho biết vị trí thực tế của doanh nghiệp",
          "Vì quy định bắt buộc",
          "Một loại nguồn là đủ"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Hai loại nguồn trả lời hai câu hỏi khác nhau."
      },
      {
        "number": 3,
        "question": "Tam giác hóa nghĩa là gì?",
        "options": [
          "Vẽ biểu đồ hình tam giác",
          "Chia dữ liệu thành ba phần",
          "Dùng từ ba nguồn độc lập trở lên để xác lập khoảng giá trị đáng tin cậy",
          "Kiểm tra dữ liệu ba lần"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Độc lập là điều kiện then chốt."
      },
      {
        "number": 4,
        "question": "Ba bài báo đều dẫn về cùng một báo cáo gốc chưa kiểm chứng. Có thể coi đó là tam giác hóa không?",
        "options": [
          "Có, vì có ba nguồn",
          "Không, vì ba bài báo không độc lập với nhau",
          "Có, nếu bài báo khác tên",
          "Chỉ khi báo cáo gốc dài"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nguồn không độc lập thì không tăng độ tin cậy."
      },
      {
        "number": 5,
        "question": "Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì?",
        "options": [
          "Bỏ qua vấn đề",
          "Giả định một con số bất kỳ",
          "Hoãn toàn bộ nghiên cứu",
          "Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Minh bạch và có căn cứ."
      },
      {
        "number": 6,
        "question": "Điều nào thể hiện đúng vai trò hướng dẫn người khác ở bậc 5?",
        "options": [
          "Tự làm hết thay đồng nghiệp",
          "Không can thiệp",
          "Chia sẻ mẫu phương pháp và góp ý cách đặt câu hỏi cho đồng nghiệp",
          "Chỉ giao việc không hướng dẫn"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Chuẩn hóa và chia sẻ phương pháp giúp nâng năng lực chung."
      },
      {
        "number": 7,
        "question": "Kế hoạch nghiên cứu tốt nên bắt đầu bằng mục nào?",
        "options": [
          "Danh sách trang web sẽ đọc",
          "Danh sách công cụ tìm kiếm",
          "Mẫu báo cáo cuối",
          "Quyết định cần hỗ trợ và các câu hỏi con"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Mục tiêu quyết định dẫn dắt các bước sau."
      },
      {
        "number": 8,
        "question": "Email đúng định dạng nhưng gán sai cho khách hàng khác vi phạm chiều nào?",
        "options": [
          "Chính xác",
          "Hợp lệ",
          "Đầy đủ",
          "Duy nhất"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Định dạng đúng (hợp lệ) nhưng không phản ánh thực tế (không chính xác)."
      },
      {
        "number": 9,
        "question": "Một khách hàng có ba mã khác nhau trong hệ thống. Chiều nào bị vi phạm?",
        "options": [
          "Kịp thời",
          "Hợp lệ",
          "Chính xác",
          "Duy nhất"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Một thực thể bị ghi nhận nhiều lần vi phạm tính duy nhất."
      },
      {
        "number": 10,
        "question": "Biện pháp nào là biện pháp phòng ngừa?",
        "options": [
          "Danh sách chọn sẵn bắt buộc tại điểm nhập liệu",
          "Báo cáo ngoại lệ hàng tuần",
          "Đối chiếu dữ liệu định kỳ",
          "Rà soát thủ công cuối tháng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Phòng ngừa chặn lỗi ngay khi nhập."
      },
      {
        "number": 11,
        "question": "Vì sao nên ưu tiên biện pháp phòng ngừa?",
        "options": [
          "Giải quyết tận gốc, giảm việc dọn dẹp lặp lại",
          "Luôn rẻ hơn mọi trường hợp",
          "Biện pháp phát hiện không có tác dụng",
          "Không có khác biệt"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ngăn lỗi tốt hơn sửa lỗi sau."
      },
      {
        "number": 12,
        "question": "Điều kiện để bảng điểm chất lượng dữ liệu thực sự thúc đẩy cải thiện là gì?",
        "options": [
          "Chỉ cần con số phần trăm",
          "Màu sắc đẹp",
          "Có ngưỡng mục tiêu và người chịu trách nhiệm cụ thể",
          "Càng nhiều chiều đo càng tốt"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Không có người chịu trách nhiệm thì không có hành động cải thiện."
      },
      {
        "number": 13,
        "question": "Tỉ lệ ô trống trong cột số điện thoại là 25%. Đây là phép đo chiều nào?",
        "options": [
          "Duy nhất",
          "Kịp thời",
          "Đầy đủ",
          "Hợp lệ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Trường trống thuộc chiều đầy đủ."
      },
      {
        "number": 14,
        "question": "Một đơn hàng giá trị rất lớn xuất hiện. Cách làm đúng?",
        "options": [
          "Xác minh trước khi kết luận là sai",
          "Xóa ngay",
          "Sửa về mức trung bình",
          "Bỏ qua mọi quy tắc kiểm tra"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bất thường không đồng nghĩa với sai."
      },
      {
        "number": 15,
        "question": "Hai bộ phận báo cáo số khách hàng khác nhau. Giải pháp theo quản trị dữ liệu?",
        "options": [
          "Tính lại phép cộng",
          "Dùng số cao hơn",
          "Lấy trung bình cộng",
          "Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Vấn đề nằm ở định nghĩa."
      },
      {
        "number": 16,
        "question": "Người quản lý dữ liệu có vai trò gì?",
        "options": [
          "Duy trì chất lượng và định nghĩa dữ liệu hàng ngày",
          "Chịu trách nhiệm cuối cùng và duyệt quyền truy cập",
          "Vận hành hạ tầng kỹ thuật",
          "Không có vai trò cụ thể"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Chủ sở hữu chịu trách nhiệm cuối; người quản lý duy trì hàng ngày."
      },
      {
        "number": 17,
        "question": "“Nguồn chân lý duy nhất” nghĩa là gì?",
        "options": [
          "Dữ liệu chỉ có một nguồn tồn tại",
          "Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ tham khảo",
          "Chỉ một người được xem dữ liệu",
          "Dữ liệu không bao giờ thay đổi"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giúp tránh nhầm lẫn giữa nhiều bản sao."
      },
      {
        "number": 18,
        "question": "Lịch lưu trữ và hủy dữ liệu nên dựa trên điều gì?",
        "options": [
          "Dung lượng còn trống",
          "Yêu cầu pháp lý và nhu cầu nghiệp vụ",
          "Sở thích cá nhân của quản lý",
          "Giữ vô thời hạn cho an toàn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giữ vô thời hạn là rủi ro."
      },
      {
        "number": 19,
        "question": "Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề nào?",
        "options": [
          "Tăng tốc độ xử lý",
          "Giảm dung lượng lưu trữ",
          "Mã hóa dữ liệu",
          "Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Định nghĩa thống nhất loại bỏ nguyên nhân phổ biến của tranh cãi."
      },
      {
        "number": 20,
        "question": "Điều nào là lỗi thường gặp trong quản trị dữ liệu?",
        "options": [
          "Chỉ định rõ chủ sở hữu từng tập dữ liệu",
          "Ghi rõ nguồn chân lý",
          "Lập từ điển một lần rồi không cập nhật khi nghiệp vụ thay đổi",
          "Lập lịch hủy dữ liệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Từ điển cần được cập nhật định kỳ."
      }
    ]
  },
  "M2-F": {
    "code": "M2-F",
    "title": "GIAO TIẾP SỐ CƠ BẢN NƠI CÔNG SỞ",
    "domain_number": 2,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Công cụ giao tiếp cơ bản",
        "competency_line": "Năng lực 2.1 · Mức 1–2",
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
          "Khi tham gia họp trực tuyến, cần kiểm tra âm thanh và hình ảnh trước khi họp bắt đầu, và tắt tiếng khi không phát biểu để tránh tạp âm ảnh hưởng người khác.",
          "Các bước soạn một email công việc. 1. Xác định mục đích: bạn cần người nhận làm gì, hay chỉ cần họ biết? 2. Chọn người nhận: người cần hành động vào ô Đến, người chỉ cần biết vào ô CC. 3. Viết tiêu đề cụ thể, ví dụ “[Báo cáo] Tiến độ dự án A – tuần 12”. 4. Viết lời chào, nội dung chính ngắn gọn (bối cảnh, điều cần làm, thời hạn) và chữ ký. 5. Đọc lại trước khi gửi, kiểm tra ô Đến, CC, BCC và tệp đính kèm.",
          "Trước và trong cuộc họp trực tuyến. Kiểm tra âm thanh và hình ảnh trước giờ họp; tắt tiếng khi không phát biểu; ghi chú nội dung và việc cần làm sau họp."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên kho cần báo ngay một lô hàng bị trễ trong một giờ tới: nhắn tin trực tiếp hoặc gọi điện. Cũng nhân viên đó cần gửi báo cáo tồn kho hằng tuần cho quản lý: dùng email để lưu vết. Còn khi cả nhóm sáu người cần chốt phương án giao hàng, họp trực tuyến hoặc nhóm chat phù hợp hơn."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tiêu đề chung chung như “Hỏi chút”; cho tất cả mọi người vào ô Đến; dùng tin nhắn cho việc cần lưu vết; vào họp mà chưa kiểm tra âm thanh."
        ],
        "practice": [
          "Soạn ba email cho ba tình huống khác nhau: xin thông tin từ đồng nghiệp, báo cáo tiến độ công việc cho cấp trên, và xin lỗi vì trễ hạn công việc. Sau đó tham gia thử một cuộc họp trực tuyến và ghi chú lại nội dung."
        ],
        "deliverable": "3 email mẫu và ghi chú cuộc họp.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Người cần hành động với nội dung email nên được đặt ở đâu?",
            "options": [
              "CC",
              "Đến (To)",
              "BCC",
              "Không quan trọng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đến (To) dành cho người cần thực hiện hành động."
          },
          {
            "number": 2,
            "question": "BCC được dùng khi nào?",
            "options": [
              "Khi muốn tất cả người nhận biết nhau",
              "Khi chỉ gửi cho một người",
              "Không bao giờ nên dùng",
              "Khi gửi cho nhiều người không cần lộ thông tin liên hệ của nhau"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "BCC ẩn danh sách người nhận với nhau."
          },
          {
            "number": 3,
            "question": "Việc gấp cần xử lý ngay nên chọn kênh nào?",
            "options": [
              "Email",
              "Ghi chú giấy",
              "Gọi điện hoặc nhắn tin trực tiếp",
              "Gửi thư"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Kênh tức thời phù hợp với việc cần phản hồi nhanh."
          },
          {
            "number": 4,
            "question": "Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến?",
            "options": [
              "Để tránh tạp âm ảnh hưởng người khác",
              "Để tiết kiệm pin",
              "Vì bắt buộc theo quy định",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tạp âm nền gây khó chịu và làm gián đoạn cuộc họp."
          },
          {
            "number": 5,
            "question": "Tiêu đề email nên có đặc điểm gì?",
            "options": [
              "Càng ngắn càng tốt, không cần rõ nghĩa",
              "Chỉ cần viết “Quan trọng”",
              "Không cần thiết",
              "Nói rõ nội dung để người nhận biết mức ưu tiên"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tiêu đề rõ ràng giúp người nhận đánh giá và xử lý phù hợp."
          },
          {
            "number": 6,
            "question": "Giám đốc cần đồng nghiệp xác nhận một số liệu trước 15 giờ, việc gấp. Nên chọn kênh nào?",
            "options": [
              "Nhắn tin trực tiếp hoặc gọi điện vì cần phản hồi ngay",
              "Gửi email rồi chờ trả lời",
              "Đăng lên nhóm chat toàn công ty",
              "Gửi thư giấy"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Việc gấp cần công cụ tức thời."
          },
          {
            "number": 7,
            "question": "Tiêu đề email nào rõ ràng nhất?",
            "options": [
              "Hỏi chút",
              "Gửi anh",
              "[Báo cáo] Tiến độ dự án A – tuần 12",
              "Quan trọng!!!"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tiêu đề cần nêu loại nội dung và chủ đề."
          },
          {
            "number": 8,
            "question": "Bạn gửi email cho trưởng phòng (cần duyệt) và cho kế toán (chỉ cần biết). Đặt người nhận thế nào?",
            "options": [
              "Cả hai ở ô Đến",
              "Trưởng phòng ở ô Đến, kế toán ở ô CC",
              "Trưởng phòng ở CC, kế toán ở Đến",
              "Cả hai ở ô BCC"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Người cần hành động ở Đến, người chỉ cần biết ở CC."
          },
          {
            "number": 9,
            "question": "Trước giờ họp trực tuyến, việc nên làm là gì?",
            "options": [
              "Kiểm tra âm thanh và hình ảnh",
              "Bật nhạc nền cho vui",
              "Mời toàn bộ công ty vào họp",
              "Mở nhiều ứng dụng khác song song"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Kiểm tra trước giúp cuộc họp không bị gián đoạn."
          },
          {
            "number": 10,
            "question": "Một email công việc cơ bản gồm những phần nào?",
            "options": [
              "Chỉ nội dung chính",
              "Tiêu đề, lời chào, nội dung chính, chữ ký",
              "Biểu tượng cảm xúc, nội dung, hình nền",
              "Chỉ chữ ký"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là bốn phần cơ bản của email công việc."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Chia sẻ tài liệu và thông tin",
        "competency_line": "Năng lực 2.2 · Mức 1–2",
        "objectives": [
          "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Nhận biết được tham chiếu và ghi chú nguồn cơ bản"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Quyền xem: chỉ đọc, không thể thay đổi nội dung",
          "Quyền bình luận: đọc và để lại nhận xét, không sửa nội dung gốc",
          "Quyền chỉnh sửa: có thể thay đổi trực tiếp nội dung",
          "Liên kết chia sẻ: đường dẫn cho phép truy cập tệp mà không cần gửi trực tiếp"
        ],
        "body": [
          "Chia sẻ thông tin và nội dung số nghĩa là gửi hoặc cấp quyền truy cập tài liệu cho người khác thông qua các công nghệ số phù hợp. Khi tệp quá lớn để đính kèm qua email, nên chia sẻ qua đường dẫn đám mây thay vì cố nén và gửi trực tiếp.",
          "Ba mức quyền phổ biến là xem, bình luận, và chỉnh sửa — nên cấp mức thấp nhất phù hợp với nhu cầu người nhận. Tùy chọn “Bất kỳ ai có liên kết” tiềm ẩn rủi ro: đường dẫn có thể bị chuyển tiếp ngoài ý muốn tới người không nên xem.",
          "Trước khi chuyển tiếp một email, cần kiểm tra xem nội dung phía trên (các email trước đó trong chuỗi) có thông tin không nên gửi cho người nhận mới hay không.",
          "Các bước chia sẻ một tài liệu. 1. Quyết định gửi trực tiếp (đính kèm) hay chia sẻ liên kết đám mây, tùy dung lượng. 2. Chọn người nhận cụ thể theo địa chỉ email, tránh “Bất kỳ ai có liên kết”. 3. Chọn mức quyền thấp nhất đủ dùng: xem, bình luận hoặc chỉnh sửa. 4. Kiểm tra lại cài đặt chia sẻ trước khi gửi. 5. Khi dùng thông tin của người khác trong báo cáo, ghi chú nguồn: tên tài liệu, đơn vị công bố, ngày, đường dẫn.",
          "Trước khi chuyển tiếp email. Cuộn xuống đọc các email cũ trong chuỗi, vì chúng có thể chứa thông tin không nên gửi cho người nhận mới."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên kinh doanh cần gửi bảng báo giá nặng 80 MB cho khách; kế toán cần cho kiểm toán viên xem thư mục hóa đơn nhưng không được sửa. Trường hợp đầu nên tải lên đám mây và gửi liên kết; trường hợp sau cấp quyền xem cho đúng người."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chia sẻ công khai cho tiện; cấp quyền sửa cho mọi người; chuyển tiếp cả chuỗi email mà không đọc; dùng số liệu của người khác không ghi nguồn."
        ],
        "practice": [
          "Chia sẻ một thư mục với một đồng nghiệp ở mức chỉ xem, và chụp lại màn hình cài đặt chia sẻ."
        ],
        "deliverable": "Ảnh chụp cài đặt chia sẻ đúng nguyên tắc.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khi tệp quá lớn để đính kèm, nên làm gì?",
            "options": [
              "Nén thật nhỏ và gửi",
              "Gửi qua nhiều email",
              "Bỏ bớt nội dung",
              "Chia sẻ qua đường dẫn đám mây"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chia sẻ đường dẫn đám mây phù hợp cho tệp lớn."
          },
          {
            "number": 2,
            "question": "Mức quyền nào nên cấp mặc định khi chưa rõ nhu cầu người nhận?",
            "options": [
              "Chỉnh sửa",
              "Quản trị",
              "Xóa",
              "Xem"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Bắt đầu từ mức thấp nhất, chỉ nâng khi cần."
          },
          {
            "number": 3,
            "question": "“Bất kỳ ai có liên kết” tiềm ẩn rủi ro gì?",
            "options": [
              "Liên kết có thể bị chuyển tiếp tới người không nên xem",
              "Không có rủi ro nào",
              "Tốc độ tải chậm hơn",
              "Tốn dung lượng hơn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Liên kết mở dễ lan truyền ngoài kiểm soát."
          },
          {
            "number": 4,
            "question": "Trước khi chuyển tiếp một chuỗi email, nên kiểm tra điều gì?",
            "options": [
              "Độ dài email",
              "Nội dung phía trên có thông tin không nên gửi cho người nhận mới không",
              "Ngày gửi ban đầu",
              "Không cần kiểm tra gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chuỗi email cũ có thể chứa thông tin nhạy cảm không phù hợp chuyển tiếp."
          },
          {
            "number": 5,
            "question": "Quyền “bình luận” khác quyền “chỉnh sửa” ở điểm nào?",
            "options": [
              "Bình luận chỉ để lại nhận xét, không sửa nội dung gốc",
              "Không có khác biệt",
              "Bình luận có quyền cao hơn",
              "Chỉnh sửa không được lưu lại"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bình luận giữ nguyên nội dung gốc, chỉ thêm ghi chú."
          },
          {
            "number": 6,
            "question": "Bạn gửi bản hợp đồng để đối tác chỉ cần đọc. Nên cấp quyền nào?",
            "options": [
              "Chỉnh sửa",
              "Xem",
              "Chủ sở hữu",
              "Bình luận và chỉnh sửa"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cấp mức thấp nhất phù hợp với nhu cầu."
          },
          {
            "number": 7,
            "question": "Bạn cần gửi một tệp 80 MB cho khách. Cách phù hợp là gì?",
            "options": [
              "Cố nén nhiều lần rồi đính kèm",
              "Chia nhỏ thành nhiều email",
              "Tải lên đám mây và gửi liên kết chia sẻ với quyền phù hợp",
              "Gửi qua tin nhắn mạng xã hội cá nhân"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tệp quá lớn nên chia sẻ qua đường dẫn đám mây."
          },
          {
            "number": 8,
            "question": "Bạn trích số liệu của một báo cáo bên ngoài vào bản trình bày. Việc cần làm là gì?",
            "options": [
              "Không cần vì số liệu công khai",
              "Ghi tên mình là tác giả",
              "Ghi chú nguồn: tên tài liệu, đơn vị, ngày, đường dẫn",
              "Chỉ ghi “theo Internet”"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ghi chú nguồn cơ bản là yêu cầu của năng lực 2.2."
          },
          {
            "number": 9,
            "question": "Bạn chuyển tiếp một chuỗi email cho đối tác mới. Rủi ro chính là gì?",
            "options": [
              "Các email trước trong chuỗi có thể chứa thông tin không nên gửi",
              "Email sẽ tự bị xóa",
              "Đối tác không đọc được",
              "Không có rủi ro nào"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần kiểm tra phần nội dung phía dưới trước khi chuyển tiếp."
          },
          {
            "number": 10,
            "question": "Vì sao nên chọn người nhận cụ thể thay vì “Bất kỳ ai có liên kết”?",
            "options": [
              "Để tệp nhẹ hơn",
              "Kiểm soát chính xác ai truy cập được tài liệu",
              "Để khỏi phải đặt tên tệp",
              "Để đường truyền nhanh hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Liên kết mở có thể bị chuyển tiếp ngoài ý muốn."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Dịch vụ công trực tuyến",
        "competency_line": "Năng lực 2.3 · Mức 1–2",
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
          "Khi tra cứu thông tin chính thức, cần xác nhận đang ở đúng trang của cơ quan nhà nước. Trang giả mạo thường có tên miền gần giống nhưng sai khác nhỏ, và thường yêu cầu cung cấp thông tin cá nhân qua kênh không chính thức. Cơ quan nhà nước không bao giờ yêu cầu mật khẩu hoặc mã xác thực qua điện thoại hoặc tin nhắn.",
          "Các bước tra cứu an toàn. 1. Vào cổng chính thức bằng cách gõ địa chỉ hoặc từ trang của cơ quan nhà nước, không bấm vào quảng cáo hoặc đường dẫn lạ. 2. Kiểm tra tên miền: trang giả mạo thường gần giống nhưng sai khác nhỏ. 3. Tìm thủ tục, ghi lại hồ sơ cần chuẩn bị, thời hạn, phí và nơi nộp. 4. Không cung cấp mật khẩu hoặc mã xác thực qua điện thoại, tin nhắn hay kênh không chính thức. 5. Lưu đường dẫn chính thức để kiểm tra lại khi quy định thay đổi.",
          "Định danh điện tử và chữ ký số là những công cụ giúp xác nhận người thực hiện thủ tục trên môi trường số."
        ],
        "examples": [
          "Ví dụ trong công việc. Chủ doanh nghiệp nhỏ cần biết hồ sơ, thời hạn và nơi nộp của một thủ tục hành chính liên quan đến doanh nghiệp. Thay vì đến trực tiếp để hỏi, có thể tra cứu và thực hiện nhiều bước qua cổng dịch vụ công trực tuyến, miễn là vào đúng trang chính thức."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tìm thủ tục qua quảng cáo rồi nhập thông tin cá nhân; không kiểm tra tên miền; gửi mã xác thực cho người tự xưng là cán bộ."
        ],
        "practice": [
          "Tra cứu một thủ tục hành chính liên quan đến doanh nghiệp trên cổng chính thức và ghi lại các bước cùng giấy tờ cần có."
        ],
        "deliverable": "Bảng tóm tắt thủ tục kèm đường dẫn chính thức.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Cổng dịch vụ công dùng để làm gì?",
            "options": [
              "Thực hiện thủ tục hành chính không cần đến trực tiếp",
              "Mua sắm trực tuyến",
              "Giải trí",
              "Tìm việc làm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là chức năng chính của cổng dịch vụ công."
          },
          {
            "number": 2,
            "question": "Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước?",
            "options": [
              "Có đuôi .gov.vn",
              "Tên miền gần giống nhưng sai khác nhỏ, yêu cầu thông tin bất thường",
              "Giao diện đơn giản",
              "Có nhiều thông tin liên hệ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các dấu hiệu cảnh báo phổ biến của trang giả mạo."
          },
          {
            "number": 3,
            "question": "Cơ quan nhà nước có bao giờ yêu cầu cung cấp mật khẩu qua điện thoại không?",
            "options": [
              "Có, đây là quy trình bình thường",
              "Chỉ trong trường hợp khẩn cấp",
              "Không, đây là dấu hiệu lừa đảo",
              "Tùy từng cơ quan"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Yêu cầu mật khẩu/mã OTP qua điện thoại là dấu hiệu lừa đảo, không phải quy trình chính thức."
          },
          {
            "number": 4,
            "question": "Định danh điện tử dùng để làm gì?",
            "options": [
              "Trang trí hồ sơ",
              "Xác thực danh tính trên môi trường số",
              "Tăng tốc độ mạng",
              "Không có tác dụng cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là mục đích chính của định danh điện tử."
          },
          {
            "number": 5,
            "question": "Chữ ký số có giá trị pháp lý như thế nào?",
            "options": [
              "Không có giá trị pháp lý",
              "Chỉ dùng cho mục đích nội bộ",
              "Chỉ có giá trị ở nước ngoài",
              "Tương đương chữ ký tay"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chữ ký số có giá trị pháp lý tương đương chữ ký tay theo quy định."
          },
          {
            "number": 6,
            "question": "Bạn nhận tin nhắn: “Cơ quan thuế yêu cầu gửi mã OTP để xác minh”. Nên làm gì?",
            "options": [
              "Không cung cấp và xác minh lại qua kênh chính thức của cơ quan đó",
              "Cung cấp ngay để tránh bị phạt",
              "Chuyển tiếp cho đồng nghiệp",
              "Trả lời bằng mật khẩu"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cơ quan nhà nước không yêu cầu mã xác thực qua tin nhắn hay điện thoại."
          },
          {
            "number": 7,
            "question": "Trang nào có dấu hiệu giả mạo cổng dịch vụ công?",
            "options": [
              "Tên miền gần giống cổng chính thức nhưng sai khác nhỏ và đòi thông tin cá nhân",
              "Tên miền đuôi gov.vn",
              "Trang có tiêu đề rõ ràng",
              "Trang tải nhanh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tên miền sai khác nhỏ là dấu hiệu thường gặp của trang giả mạo."
          },
          {
            "number": 8,
            "question": "Lợi ích chính của dịch vụ công trực tuyến là gì?",
            "options": [
              "Thay thế mọi thủ tục hành chính",
              "Thực hiện nhiều thủ tục hành chính mà không cần đến trực tiếp cơ quan",
              "Miễn mọi loại phí",
              "Không cần giấy tờ nào"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cổng dịch vụ công giúp thực hiện thủ tục từ xa."
          },
          {
            "number": 9,
            "question": "Trước khi làm thủ tục trên cổng, bước đầu tiên nên là gì?",
            "options": [
              "Nhập mật khẩu ngay",
              "Bấm vào quảng cáo đầu tiên",
              "Xác nhận đang ở đúng trang chính thức của cơ quan nhà nước",
              "Tải ứng dụng bất kỳ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xác nhận đúng trang trước khi cung cấp bất kỳ thông tin nào."
          },
          {
            "number": 10,
            "question": "Vì sao nên ghi lại đường dẫn chính thức kèm bảng tóm tắt thủ tục?",
            "options": [
              "Để khỏi phải đọc lại",
              "Để tăng lượt truy cập",
              "Không có lợi ích gì",
              "Để kiểm tra và cập nhật lại đúng nguồn khi quy định thay đổi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Ghi nguồn giúp quay lại kiểm tra thông tin chính thức."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Làm việc nhóm trên công cụ số",
        "competency_line": "Năng lực 2.4 · Mức 1–2",
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
          "Trên bảng công việc, mỗi thẻ công việc thường có người phụ trách, hạn hoàn thành, và trạng thái hiện tại. Một lưu ý quan trọng: không nên tạo bản sao riêng của tài liệu nhóm để chỉnh sửa cá nhân — điều này tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn cho cả nhóm.",
          "Các bước làm việc nhóm trên công cụ số. 1. Tạo một tài liệu dùng chung và chia sẻ cho cả nhóm với quyền phù hợp. 2. Phân công: mỗi người một phần, ghi tên người phụ trách. 3. Góp ý bằng bình luận, gắn thẻ @ người cần trả lời. 4. Cập nhật thẻ công việc: người phụ trách, hạn hoàn thành, trạng thái. 5. Khi cần biết ai đã sửa gì, xem lịch sử chỉnh sửa thay vì hỏi từng người."
        ],
        "examples": [
          "Ví dụ trong công việc. Ba nhân viên cùng soạn kế hoạch sự kiện: mỗi người phụ trách một phần trong một tài liệu dùng chung, theo dõi tiến độ trên bảng công việc và hẹn họp bằng lịch dùng chung. Không ai phải gửi tệp qua lại hay nhớ bản nào mới nhất."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tạo bản sao riêng để sửa; sửa thẳng vào phần của người khác khi chỉ muốn góp ý; không cập nhật trạng thái công việc; đặt tên tệp “final”, “final-2”, “final-that”."
        ],
        "practice": [
          "Cùng một hoặc hai người khác hoàn thành một tài liệu dùng chung, mỗi người phụ trách một phần, sử dụng bình luận để trao đổi."
        ],
        "deliverable": "Tài liệu nhóm có lịch sử chỉnh sửa và bình luận.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao không nên tạo bản sao riêng của tài liệu nhóm?",
            "options": [
              "Tốn dung lượng",
              "Tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn",
              "Không có lý do gì",
              "Vì quy định cấm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhiều bản sao khiến khó xác định phiên bản nào là chính thức."
          },
          {
            "number": 2,
            "question": "Tính năng bình luận khác gì so với chỉnh sửa trực tiếp?",
            "options": [
              "Không có khác biệt",
              "Bình luận không thay đổi nội dung gốc, chỉ thêm ghi chú",
              "Bình luận nhanh hơn",
              "Chỉnh sửa không thể hoàn tác"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bình luận là góp ý riêng biệt, giữ nguyên nội dung chính."
          },
          {
            "number": 3,
            "question": "Lịch dùng chung giúp ích gì cho nhóm?",
            "options": [
              "Thấy được thời gian rảnh của nhau để đặt lịch họp",
              "Trang trí",
              "Tính lương",
              "Không có tác dụng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là công dụng chính của lịch dùng chung."
          },
          {
            "number": 4,
            "question": "Trên bảng công việc, thông tin nào cần được cập nhật thường xuyên?",
            "options": [
              "Tên công việc",
              "Ngày tạo công việc",
              "Không cần cập nhật gì",
              "Trạng thái hiện tại"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cập nhật trạng thái giúp cả nhóm nắm tiến độ."
          },
          {
            "number": 5,
            "question": "Gắn thẻ (@) một người trong bình luận có tác dụng gì?",
            "options": [
              "Xóa bình luận đó",
              "Ẩn bình luận",
              "Không có tác dụng",
              "Gửi thông báo để người đó biết"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Gắn thẻ thông báo trực tiếp tới người được nhắc đến."
          },
          {
            "number": 6,
            "question": "Bạn muốn biết ai đã thay đổi gì trong tài liệu nhóm. Dùng chức năng nào?",
            "options": [
              "Lịch sử chỉnh sửa",
              "Thùng rác",
              "Danh bạ",
              "Cài đặt ngôn ngữ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tài liệu dùng chung lưu lịch sử chỉnh sửa."
          },
          {
            "number": 7,
            "question": "Một thẻ công việc tốt cần có những thông tin nào?",
            "options": [
              "Chỉ tiêu đề",
              "Chỉ màu thẻ",
              "Người phụ trách, hạn hoàn thành, trạng thái",
              "Chỉ ảnh đại diện"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ba thông tin này giúp cả nhóm nắm tiến độ."
          },
          {
            "number": 8,
            "question": "Công cụ nào phù hợp để nhiều người cùng chỉnh một kế hoạch và tự động lưu thay đổi?",
            "options": [
              "Tệp gửi qua email qua lại",
              "Tài liệu dùng chung trực tuyến",
              "Bản in giấy",
              "Ảnh chụp màn hình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tài liệu dùng chung cho phép chỉnh sửa đồng thời và tự lưu."
          },
          {
            "number": 9,
            "question": "Nhóm có ba tệp “ke-hoach-final”, “ke-hoach-final-2”, “ke-hoach-final-that”. Vấn đề là gì?",
            "options": [
              "Không có vấn đề",
              "Tên tệp quá dài",
              "Nhiều phiên bản không đồng bộ gây nhầm lẫn; nên dùng một tài liệu chung",
              "Cần tạo thêm bản sao nữa"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nhiều bản sao riêng làm mất đồng bộ."
          },
          {
            "number": 10,
            "question": "Mục đích của công nghệ số trong hợp tác là gì?",
            "options": [
              "Phục vụ quá trình làm việc chung của nhiều người",
              "Chỉ để giải trí",
              "Chỉ để lưu ảnh cá nhân",
              "Thay thế hoàn toàn việc gặp mặt"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hợp tác thông qua công nghệ số nghĩa là dùng công cụ số cho quá trình làm việc chung."
          }
        ]
      },
      {
        "module_number": 5,
        "title": "Ứng xử trên môi trường số",
        "competency_line": "Năng lực 2.5 · Mức 1–2",
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
          "Đồng nghiệp trong một công ty có thể khác nhau về văn hóa (người miền Bắc/Nam/Trung, người nước ngoài) và về thế hệ (Gen Z mới đi làm, người đã đi làm 20 năm) — mỗi nhóm có thể quen với cách giao tiếp khác nhau. Ví dụ: một số người lớn tuổi thấy nhắn tin quá ngắn gọn là thiếu lễ độ, trong khi một số người trẻ thấy email dài dòng là mất thời gian. Nhận biết được sự khác biệt đơn giản này giúp chọn cách giao tiếp phù hợp hơn với từng người, thay vì áp dụng một kiểu duy nhất cho tất cả.",
          "Các bước chọn cách giao tiếp. 1. Xác định người nhận: đồng nghiệp, cấp trên hay khách hàng, từ đó chọn mức trang trọng. 2. Chọn kênh và thời điểm gửi. Việc không gấp nên gửi trong giờ làm việc. 3. Viết ngắn gọn nhưng đủ chào hỏi, tránh viết hoa toàn bộ câu, dùng biểu tượng cảm xúc có cân nhắc. 4. Đọc lại trước khi gửi. 5. Nếu nhận tin nhắn công kích: lưu bằng chứng, báo cáo cho người phụ trách, không đáp trả bằng cách tương tự.",
          "Điều chỉnh theo người đối diện. Người lớn tuổi có thể quen tin nhắn có chào hỏi đầy đủ; người trẻ có thể thích ngắn gọn. Nhận ra khác biệt đơn giản này giúp bạn chọn cách giao tiếp phù hợp hơn."
        ],
        "examples": [
          "Ví dụ trong công việc. Khách hàng nhắn: “GIAO HÀNG CHẬM QUÁ!!!”. Nếu đáp “Đợi đi”, bạn làm tình hình tệ hơn. Cách phù hợp là chào, xin lỗi vì sự bất tiện, nêu rõ thời gian dự kiến giao hàng và kênh liên hệ khi cần."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Viết hoa toàn bộ; nhắn việc công lúc đêm khuya; đáp trả khi đang giận; dùng một kiểu giao tiếp cho mọi người."
        ],
        "practice": [
          "Cho năm tin nhắn công việc có vấn đề về văn phong, viết lại cho phù hợp và giải thích điều chỉnh."
        ],
        "deliverable": "Bảng 5 tin nhắn trước và sau kèm giải thích.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Viết hoa toàn bộ câu trong tin nhắn thường được hiểu là gì?",
            "options": [
              "Đang hét lên, có thể gây hiểu lầm",
              "Nhấn mạnh lịch sự",
              "Không có ý nghĩa gì",
              "Thể hiện sự trang trọng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Viết hoa toàn bộ thường bị hiểu là ngữ điệu gay gắt."
          },
          {
            "number": 2,
            "question": "Gửi tin nhắn công việc ngoài giờ có thể gây ra điều gì?",
            "options": [
              "Không ảnh hưởng gì",
              "Luôn được hoan nghênh",
              "Tăng hiệu suất làm việc",
              "Tạo áp lực không cần thiết cho người nhận"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Trừ trường hợp khẩn cấp, nên tôn trọng thời gian nghỉ của người nhận."
          },
          {
            "number": 3,
            "question": "Khi nhận tin nhắn mang tính công kích, nên làm gì đầu tiên?",
            "options": [
              "Đáp trả ngay lập tức bằng lời lẽ tương tự",
              "Xóa ngay tin nhắn",
              "Phớt lờ hoàn toàn",
              "Lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Lưu bằng chứng và báo cáo là cách xử lý phù hợp, tránh leo thang xung đột."
          },
          {
            "number": 4,
            "question": "Văn phong khi giao tiếp với khách hàng nên như thế nào?",
            "options": [
              "Giống hệt như với bạn bè",
              "Lịch sự, đầy đủ câu",
              "Ngắn gọn tối đa, không cần lịch sự",
              "Không quan trọng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giao tiếp với khách hàng cần giữ sự chuyên nghiệp và lịch sự."
          },
          {
            "number": 5,
            "question": "Vì sao cần lưu ý sự khác biệt văn hóa và thế hệ khi giao tiếp với đồng nghiệp?",
            "options": [
              "Không cần thiết, giao tiếp giống nhau với tất cả mọi người",
              "Chỉ áp dụng với đối tác nước ngoài",
              "Mỗi nhóm có thể quen với cách giao tiếp khác nhau, cần điều chỉnh phù hợp",
              "Chỉ người lớn tuổi cần được lưu ý"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nhận biết sự khác biệt giúp chọn cách giao tiếp phù hợp hơn với từng người thay vì áp dụng một kiểu cho tất cả."
          },
          {
            "number": 6,
            "question": "Bạn muốn nhắn cho cấp trên lúc 23 giờ về một việc không gấp. Cách tốt hơn là gì?",
            "options": [
              "Soạn sẵn và gửi vào giờ làm việc hôm sau",
              "Gửi ngay rồi gọi điện nhắc",
              "Đăng vào nhóm chung toàn công ty",
              "Gửi nhiều tin liên tiếp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Thời điểm gửi là một phần của nghi thức số."
          },
          {
            "number": 7,
            "question": "Bạn định trả lời khách: “Hàng trễ rồi, đợi đi.” Vấn đề là gì?",
            "options": [
              "Phù hợp vì ngắn gọn",
              "Thiếu lịch sự và không đáp ứng nhu cầu thông tin của khách; nên viết lại trang trọng và nêu giải pháp",
              "Phù hợp với mọi đối tượng",
              "Chỉ cần thêm biểu tượng cảm xúc"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giao tiếp với khách hàng cần trang trọng và có thông tin hữu ích."
          },
          {
            "number": 8,
            "question": "Đồng nghiệp lớn tuổi thích tin nhắn có chào hỏi đầy đủ, đồng nghiệp trẻ thích ngắn gọn. Cách tốt nhất là gì?",
            "options": [
              "Dùng một kiểu cho mọi người",
              "Điều chỉnh cách giao tiếp theo từng người",
              "Chỉ giao tiếp với người cùng thế hệ",
              "Tránh giao tiếp với người khác thế hệ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhận biết khác biệt thế hệ giúp chọn cách giao tiếp phù hợp."
          },
          {
            "number": 9,
            "question": "Sau khi lưu lại bằng chứng một tin nhắn công kích, bước tiếp theo là gì?",
            "options": [
              "Báo cáo cho người phụ trách phù hợp",
              "Đáp trả tương tự",
              "Xóa nhóm chat",
              "Đăng lên mạng xã hội"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Lưu bằng chứng rồi báo cáo thay vì tự giải quyết bằng cách đáp trả."
          },
          {
            "number": 10,
            "question": "Theo Thông tư 02/2025/TT-BGDĐT, nghi thức số là gì?",
            "options": [
              "Phần mềm bảo mật",
              "Thủ tục hành chính trực tuyến",
              "Quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số",
              "Một loại tệp"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là định nghĩa ở Điều 2."
          }
        ]
      },
      {
        "module_number": 6,
        "title": "Danh tính số cá nhân",
        "competency_line": "Năng lực 2.6 · Mức 1–2",
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
          "Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp biết được người khác nhìn thấy gì về mình. Cài đặt quyền riêng tư trên mạng xã hội nên được rà soát định kỳ. Nên tách bạch tài khoản cá nhân và tài khoản dùng cho công việc khi có thể, để bảo vệ danh tiếng trực tuyến của bản thân.",
          "Các bước kiểm tra dấu vết số. 1. Tra cứu tên mình (và tên kèm nơi làm việc) trên công cụ tìm kiếm. 2. Liệt kê những gì đang công khai: ảnh, bài đăng, thông tin liên hệ. 3. Rà soát cài đặt riêng tư của từng tài khoản mạng xã hội. 4. Tách tài khoản cá nhân và tài khoản công việc khi có thể. 5. Nhận biết dữ liệu bạn tạo ra: bài đăng, bình luận, hình ảnh tải lên, lịch sử sử dụng dịch vụ. 6. Đặt lịch rà soát định kỳ."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhà tuyển dụng gõ tên bạn lên công cụ tìm kiếm trước khi mời phỏng vấn. Ảnh, bài đăng cũ, thông tin liên hệ công khai đều có thể được nhìn thấy. Việc tự tra cứu trước giúp bạn biết người khác thấy gì về mình."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Nghĩ rằng xóa bài là biến mất hoàn toàn; để mọi bài đăng công khai; dùng chung một tài khoản cho việc riêng và việc công; đăng ảnh người khác khi chưa xin phép."
        ],
        "practice": [
          "Tự tra cứu tên mình trên công cụ tìm kiếm, liệt kê những gì công khai, rà soát và điều chỉnh cài đặt riêng tư của một tài khoản."
        ],
        "deliverable": "Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Dấu vết số là gì?",
            "options": [
              "Chữ ký điện tử",
              "Toàn bộ thông tin về một người còn lại trên môi trường số",
              "Mật khẩu tài khoản",
              "Địa chỉ IP"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là định nghĩa của dấu vết số."
          },
          {
            "number": 2,
            "question": "Nội dung đã xóa trên mạng có thể vẫn tồn tại vì sao?",
            "options": [
              "Người khác có thể đã lưu hoặc chia sẻ lại trước khi xóa",
              "Không thể nào tồn tại được nữa",
              "Máy chủ luôn giữ vĩnh viễn",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Việc sao chép hoặc chia sẻ trước khi xóa khiến nội dung vẫn tồn tại ở nơi khác."
          },
          {
            "number": 3,
            "question": "Vì sao nên tách bạch tài khoản cá nhân và công việc?",
            "options": [
              "Không cần thiết",
              "Chỉ để tiết kiệm dung lượng",
              "Tránh nội dung cá nhân ảnh hưởng hình ảnh nghề nghiệp và ngược lại",
              "Vì quy định pháp luật bắt buộc"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tách bạch giúp bảo vệ cả đời sống cá nhân và hình ảnh nghề nghiệp."
          },
          {
            "number": 4,
            "question": "Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp ích gì?",
            "options": [
              "Không có tác dụng gì",
              "Tăng thứ hạng tìm kiếm",
              "Xóa dấu vết số",
              "Biết được người khác nhìn thấy gì về mình trên mạng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là cách đơn giản để kiểm tra hình ảnh công khai của bản thân."
          },
          {
            "number": 5,
            "question": "Đăng hình ảnh đồng nghiệp lên tài khoản cá nhân mà không xin phép có vấn đề gì?",
            "options": [
              "Có thể vi phạm quyền riêng tư của người khác",
              "Không có vấn đề gì",
              "Luôn được khuyến khích",
              "Chỉ có vấn đề nếu đăng công khai"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần có sự đồng ý trước khi đăng tải hình ảnh hoặc thông tin của người khác."
          },
          {
            "number": 6,
            "question": "Dữ liệu nào là dữ liệu đơn giản do bạn tạo ra qua dịch vụ số?",
            "options": [
              "Chỉ phần cứng của máy tính",
              "Chỉ mật khẩu",
              "Không có dữ liệu nào",
              "Bài đăng, bình luận và hình ảnh bạn tải lên"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mọi hoạt động trực tuyến đều tạo ra dữ liệu."
          },
          {
            "number": 7,
            "question": "Theo Thông tư 02/2025/TT-BGDĐT, danh tính số là gì?",
            "options": [
              "Chỉ là ảnh đại diện",
              "Tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với người khác",
              "Chỉ là địa chỉ nhà",
              "Một số điện thoại duy nhất"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là định nghĩa ở Điều 2."
          },
          {
            "number": 8,
            "question": "Cách đơn giản để bảo vệ danh tiếng trực tuyến là gì?",
            "options": [
              "Rà soát cài đặt riêng tư và nội dung công khai định kỳ",
              "Đặt mọi bài đăng ở chế độ công khai",
              "Chia sẻ mật khẩu với bạn thân",
              "Không bao giờ kiểm tra"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Rà soát định kỳ giúp kiểm soát điều người khác nhìn thấy."
          },
          {
            "number": 9,
            "question": "Bạn đăng bài phàn nàn gay gắt về công ty lên tài khoản công khai. Rủi ro nào đúng?",
            "options": [
              "Bài tự biến mất sau một ngày",
              "Dấu vết có thể tồn tại lâu và ảnh hưởng đến danh tiếng nghề nghiệp",
              "Không ai nhìn thấy được",
              "Chỉ ảnh hưởng nếu có nhiều bình luận"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hoạt động trực tuyến để lại dấu vết có thể tồn tại rất lâu."
          },
          {
            "number": 10,
            "question": "Vì sao nên rà soát cài đặt riêng tư định kỳ thay vì chỉ một lần?",
            "options": [
              "Vì mặc định luôn an toàn",
              "Vì chỉ cần làm một lần khi tạo tài khoản",
              "Vì dữ liệu mới liên tục phát sinh và cài đặt có thể thay đổi",
              "Vì chỉ cần khi đã bị lộ thông tin"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Việc kiểm soát danh tính số là việc làm thường xuyên."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M2-F — “Một ngày làm việc số” (Assignment)",
      "context": "Trong một ngày làm việc, bạn gặp chuỗi tình huống sau: (1) nhận yêu cầu công việc qua email từ cấp trên, kèm một người cần biết ở CC; (2) cần chia sẻ một tài liệu cho đồng nghiệp ở bộ phận khác; (3) nhận một tin nhắn khó chịu từ đối tác; (4) cần cập nhật tiến độ công việc nhóm trên công cụ chung. Bạn tự đặt tên công ty, vai trò và nội dung công việc cụ thể, nhưng nội dung phải hợp lý.",
      "requirements": "1. Soạn email phản hồi yêu cầu của cấp trên: tiêu đề rõ, đủ bốn phần, chọn đúng người ở ô Đến và CC, giải thích ngắn lý do chọn kênh email. 2. Chia sẻ một tài liệu (có thể là tài liệu mẫu do bạn tạo) cho đồng nghiệp với mức quyền thấp nhất phù hợp. Chụp ảnh màn hình cài đặt chia sẻ và nêu lý do chọn quyền. 3. Viết lại lời phản hồi tin nhắn khó chịu của đối tác: bình tĩnh, lịch sự, không đáp trả cảm tính; nêu bạn sẽ lưu bằng chứng và báo cáo cho ai nếu tin nhắn mang tính công kích. 4. Cập nhật một thẻ công việc trên bảng công việc (hoặc bảng mô phỏng): người phụ trách, hạn, trạng thái, và một bình luận gắn thẻ người cần phản hồi. 5. Viết 5–7 dòng tự đánh giá: cách giao tiếp của bạn phù hợp với từng người nhận thế nào, và bạn đã tránh những lỗi thường gặp nào.",
      "deliverables": "Bản email, ảnh chụp cài đặt chia sẻ, văn bản phản hồi đối tác, ảnh chụp thẻ công việc, đoạn tự đánh giá.\nHình thức nộp. Một tài liệu tổng hợp (Word hoặc PDF) kèm các ảnh chụp, nộp đúng thời hạn.",
      "rubric": [
        "Gợi ý. Không đưa thông tin thật của người khác vào bài. Văn phong ở mỗi tình huống nên khác nhau: cấp trên, đồng nghiệp, đối tác.",
        "Tiêu chí",
        "Điểm",
        "Email phản hồi đúng cấu trúc, chọn đúng người nhận (Đến/CC)",
        "20",
        "Chia sẻ tài liệu đúng quyền, đúng nguyên tắc tối thiểu",
        "20",
        "Xử lý tin nhắn khó chịu đúng cách (không đáp trả cảm tính)",
        "25",
        "Cập nhật công việc nhóm rõ ràng, đúng trạng thái",
        "20",
        "Văn phong phù hợp trong toàn bộ các tình huống, có tự đánh giá",
        "15"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Bạn cần thảo luận nhanh với sáu người trong dự án. Công cụ phù hợp nhất là gì?",
        "options": [
          "Một email thật dài",
          "Thư giấy",
          "Họp trực tuyến hoặc nhóm chat",
          "Gọi lần lượt từng người"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Việc cần nhiều người cùng thảo luận phù hợp với họp trực tuyến hoặc nhóm chat."
      },
      {
        "number": 2,
        "question": "Bạn cần lưu vết một thỏa thuận để tra cứu sau vài tháng. Kênh nào phù hợp nhất?",
        "options": [
          "Tin nhắn thoại",
          "Cuộc gọi điện thoại",
          "Email",
          "Lời hứa miệng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Việc cần lưu vết lâu dài nên dùng email."
      },
      {
        "number": 3,
        "question": "Trong email, người chỉ cần biết nội dung nên được đặt ở đâu?",
        "options": [
          "Ô CC",
          "Ô Đến",
          "Không cần gửi",
          "Chỉ đặt trong chữ ký"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Người cần hành động ở Đến, người chỉ cần biết ở CC."
      },
      {
        "number": 4,
        "question": "Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến?",
        "options": [
          "Để tiết kiệm pin",
          "Để hình ảnh rõ hơn",
          "Để tránh tạp âm ảnh hưởng người khác",
          "Vì luật bắt buộc"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tạp âm làm gián đoạn cuộc họp."
      },
      {
        "number": 5,
        "question": "Tệp quá lớn để đính kèm email. Bạn nên làm gì?",
        "options": [
          "Cố nén rồi gửi nhiều lần",
          "Chia thành nhiều email nhỏ",
          "Gửi bằng tin nhắn mạng xã hội cá nhân",
          "Chia sẻ qua đường dẫn đám mây"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Chia sẻ liên kết đám mây là cách phù hợp cho tệp lớn."
      },
      {
        "number": 6,
        "question": "Khi chưa rõ nhu cầu của người nhận, nên cấp quyền mặc định nào?",
        "options": [
          "Chỉnh sửa",
          "Chủ sở hữu",
          "Bất kỳ ai có liên kết cũng sửa được",
          "Mức thấp nhất phù hợp, thường là chỉ xem"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cấp mức thấp nhất đủ để người nhận làm việc."
      },
      {
        "number": 7,
        "question": "Khi đưa số liệu của đơn vị khác vào báo cáo, bạn cần làm gì?",
        "options": [
          "Không cần ghi vì số liệu công khai",
          "Ghi tên tài liệu, đơn vị, ngày và đường dẫn",
          "Ghi tên mình là tác giả",
          "Ghi “theo mạng”"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Ghi chú nguồn cơ bản là yêu cầu của năng lực 2.2."
      },
      {
        "number": 8,
        "question": "Có người gọi điện tự xưng là cán bộ cơ quan nhà nước và xin mật khẩu của bạn. Bạn nên làm gì?",
        "options": [
          "Cung cấp nếu họ nói khẩn cấp",
          "Không cung cấp và xác minh qua kênh chính thức",
          "Cung cấp nếu họ gọi nhiều lần",
          "Cung cấp nếu bạn là doanh nghiệp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cơ quan nhà nước không yêu cầu mật khẩu qua điện thoại."
      },
      {
        "number": 9,
        "question": "Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước?",
        "options": [
          "Tên miền gần giống nhưng sai khác nhỏ",
          "Tên miền chính xác của cơ quan",
          "Giao diện rõ ràng",
          "Tốc độ tải nhanh"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Trang giả mạo thường có tên miền gần giống."
      },
      {
        "number": 10,
        "question": "Cổng dịch vụ công trực tuyến chủ yếu giúp điều gì?",
        "options": [
          "Thay thế mọi thủ tục",
          "Miễn mọi loại phí",
          "Bỏ hoàn toàn giấy tờ",
          "Thực hiện nhiều thủ tục hành chính mà không cần đến trực tiếp"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Giúp thực hiện thủ tục từ xa qua kênh chính thức."
      },
      {
        "number": 11,
        "question": "Vì sao không nên tạo bản sao riêng của tài liệu nhóm để sửa cá nhân?",
        "options": [
          "Làm tệp nặng hơn",
          "Làm mất quyền truy cập",
          "Không có lý do nào",
          "Tạo nhiều phiên bản không đồng bộ, gây nhầm lẫn"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Một tài liệu chung giúp mọi người luôn nhìn cùng một bản."
      },
      {
        "number": 12,
        "question": "Bạn muốn góp ý cho phần của đồng nghiệp nhưng không đổi nội dung. Nên làm gì?",
        "options": [
          "Thêm bình luận vào đoạn đó",
          "Sửa thẳng vào nội dung",
          "Xóa đoạn đó",
          "Tạo bản sao riêng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bình luận dùng để góp ý mà không thay đổi trực tiếp nội dung."
      },
      {
        "number": 13,
        "question": "Gắn thẻ @ một người trong bình luận có tác dụng gì?",
        "options": [
          "Thông báo cho đúng người cần phản hồi",
          "Khóa tài liệu",
          "Xóa bình luận cũ",
          "Ẩn tài liệu với người khác"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Gắn thẻ giúp đúng người nhận được thông báo."
      },
      {
        "number": 14,
        "question": "Viết hoa toàn bộ câu trong tin nhắn công việc thường bị hiểu là gì?",
        "options": [
          "Nhấn mạnh lịch sự",
          "Đang hét lên",
          "Dùng thể thức trang trọng",
          "Không có ý nghĩa gì"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Viết hoa toàn bộ thường được hiểu là đang hét."
      },
      {
        "number": 15,
        "question": "Bạn nhận tin nhắn công kích trong nhóm công việc. Cách xử lý đúng là gì?",
        "options": [
          "Đáp trả tương tự",
          "Phớt lờ và xóa nhóm",
          "Lưu bằng chứng và báo cáo cho người phụ trách",
          "Đăng lên mạng xã hội"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Không tự giải quyết bằng cách đáp trả."
      },
      {
        "number": 16,
        "question": "Vì sao cần lưu ý khác biệt văn hóa và thế hệ khi giao tiếp?",
        "options": [
          "Để tránh phải giao tiếp",
          "Để giao tiếp ngắn nhất có thể",
          "Không cần lưu ý",
          "Để chọn cách giao tiếp phù hợp với từng người thay vì một kiểu cho tất cả"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nhận biết khác biệt đơn giản giúp giao tiếp hiệu quả hơn."
      },
      {
        "number": 17,
        "question": "Gửi tin nhắn công việc không gấp ngoài giờ có thể gây ra điều gì?",
        "options": [
          "Tạo áp lực không cần thiết cho người nhận",
          "Làm người nhận làm việc tốt hơn",
          "Không ảnh hưởng gì",
          "Giúp bảo mật tin nhắn"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Thời điểm gửi là một phần của nghi thức số."
      },
      {
        "number": 18,
        "question": "Dấu vết số là gì?",
        "options": [
          "Chỉ là lịch sử trình duyệt",
          "Dấu vết để lại từ mọi hoạt động trực tuyến, có thể tồn tại rất lâu",
          "Chỉ là mật khẩu",
          "Chỉ là tên đăng nhập"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nội dung đã xóa vẫn có thể tồn tại ở nơi khác."
      },
      {
        "number": 19,
        "question": "Vì sao nên tách tài khoản cá nhân và tài khoản công việc?",
        "options": [
          "Để dùng nhiều mật khẩu hơn",
          "Để máy chạy nhanh hơn",
          "Bảo vệ danh tiếng và tránh lẫn lộn thông tin riêng với công việc",
          "Không có lý do nào"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tách bạch giúp quản lý danh tính số tốt hơn."
      },
      {
        "number": 20,
        "question": "Bạn muốn đăng ảnh một đồng nghiệp lên tài khoản cá nhân. Nên làm gì?",
        "options": [
          "Đăng luôn vì là ảnh chung",
          "Xin phép trước vì ảnh liên quan đến danh tính và quyền riêng tư của họ",
          "Đăng nếu ảnh đẹp",
          "Chỉ xin phép nếu họ phản đối"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Danh tính số của người khác cũng cần được tôn trọng."
      }
    ]
  },
  "M2-I": {
    "code": "M2-I",
    "title": "GIAO TIẾP VÀ CỘNG TÁC CHUYÊN NGHIỆP",
    "domain_number": 2,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Giao tiếp hiệu quả theo tình huống",
        "competency_line": "Năng lực 2.1 · Mức 3–4",
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
          "Khi điều hành họp trực tuyến, cần có chương trình họp gửi trước, phân công người ghi biên bản, và kết thúc bằng việc tóm tắt quyết định cùng việc cần làm cho từng người. Khi làm việc với người ở múi giờ khác, nên ưu tiên giao tiếp bất đồng bộ và ghi rõ thời hạn phản hồi mong muốn.",
          "Các bước. 1. Chọn kênh theo ba yếu tố: độ khẩn, độ phức tạp, nhu cầu lưu vết. 2. Với email, nêu ngay mục đích, bối cảnh cần thiết, hành động mong muốn kèm thời hạn. 3. Với email từ chối, nêu quyết định trước, sau đó giải thích lý do. 4. Với họp trực tuyến: gửi chương trình trước, phân công người ghi biên bản, kết thúc bằng tóm tắt quyết định và việc cần làm của từng người. 5. Khác múi giờ: ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn phản hồi mong muốn."
        ],
        "examples": [
          "Ví dụ trong công việc. Trưởng nhóm cần từ chối yêu cầu tăng ngân sách của một đồng nghiệp, thúc tiến độ một đối tác ở múi giờ khác, rồi báo tin giao hàng chậm cho khách. Ba việc, ba kênh và ba cách viết khác nhau: chọn kênh theo độ khẩn, độ phức tạp và nhu cầu lưu vết; viết sao cho người nhận hiểu và làm được ngay trong một lần đọc."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tranh luận phức tạp qua chat từng câu; email từ chối vòng vo đến cuối mới nêu quyết định; họp không có chương trình; không ghi thời hạn phản hồi."
        ],
        "practice": [
          "Viết ba email khó: từ chối yêu cầu của cấp trên, thúc tiến độ đối tác, và thông báo tin không tốt cho khách hàng. Với mỗi email, nêu rõ mục tiêu và lý do chọn cách viết như vậy."
        ],
        "deliverable": "3 email kèm giải trình chiến lược giao tiếp.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Việc nào nên dùng kênh giao tiếp đồng bộ (họp, gọi điện)?",
            "options": [
              "Thông báo lịch nghỉ lễ",
              "Gửi tài liệu tham khảo",
              "Thảo luận phức tạp cần trao đổi qua lại",
              "Nhắc lịch hẹn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Giao tiếp đồng bộ phù hợp cho nội dung cần thảo luận trực tiếp."
          },
          {
            "number": 2,
            "question": "Email từ chối nên bắt đầu bằng gì?",
            "options": [
              "Lời xin lỗi dài dòng",
              "Nêu quyết định rõ ràng trước, sau đó giải thích",
              "Kể chuyện dẫn dắt",
              "Không cần cấu trúc rõ ràng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nêu rõ quyết định trước giúp người đọc không mất kiên nhẫn chờ đợi."
          },
          {
            "number": 3,
            "question": "Khi làm việc với người ở múi giờ khác, nên làm gì?",
            "options": [
              "Ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn mong muốn",
              "Yêu cầu phản hồi tức thời",
              "Chỉ liên lạc khi cùng múi giờ",
              "Không cần điều chỉnh gì"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giao tiếp bất đồng bộ phù hợp hơn khi có chênh lệch múi giờ."
          },
          {
            "number": 4,
            "question": "Khi nào nên chuyển từ chat sang gọi điện để giải quyết bất đồng?",
            "options": [
              "Ngay từ tin nhắn đầu tiên",
              "Sau hai đến ba lượt trao đổi chưa thống nhất được",
              "Không bao giờ cần chuyển",
              "Chỉ khi được yêu cầu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Văn bản dễ hiểu sai giọng điệu; chuyển kênh sớm giúp tránh kéo dài tranh luận."
          },
          {
            "number": 5,
            "question": "Một cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì?",
            "options": [
              "Kết thúc đột ngột không tổng kết",
              "Chỉ chào tạm biệt",
              "Tóm tắt quyết định và việc cần làm cho từng người",
              "Không cần kết luận gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tóm tắt cuối họp đảm bảo mọi người hiểu rõ hành động tiếp theo."
          },
          {
            "number": 6,
            "question": "Một vấn đề phức tạp cần nhiều lượt trao đổi nhưng không gấp. Cách phối hợp kênh hợp lý là gì?",
            "options": [
              "Họp hoặc gọi điện đã hẹn trước, sau đó gửi email tóm tắt để lưu vết",
              "Chỉ nhắn chat từng câu",
              "Gửi một email thật dài rồi chờ",
              "Không cần trao đổi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Việc phức tạp cần trao đổi qua lại; email tóm tắt giữ vết."
          },
          {
            "number": 7,
            "question": "Ba yếu tố để chọn phương tiện giao tiếp số ở mức trung cấp là gì?",
            "options": [
              "Màu sắc, giá, kích thước",
              "Độ khẩn, độ phức tạp, nhu cầu lưu vết",
              "Số người trong danh bạ, thời tiết, giờ",
              "Tên ứng dụng, biểu tượng, phiên bản"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là ba yếu tố của khóa."
          },
          {
            "number": 8,
            "question": "Bạn từ chối đề nghị tăng ngân sách của đồng nghiệp bằng email. Cấu trúc đúng là gì?",
            "options": [
              "Giải thích dài rồi mới nêu quyết định ở cuối",
              "Chỉ nêu lý do, không nêu quyết định",
              "Chỉ viết “Không”",
              "Nêu quyết định trước, rồi giải thích lý do và gợi ý bước tiếp theo"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Email từ chối nên nêu quyết định rõ ràng trước."
          },
          {
            "number": 9,
            "question": "Cuộc họp tám người ở ba múi giờ. Cách tổ chức hợp lý nhất là gì?",
            "options": [
              "Gửi chương trình trước, cập nhật bất đồng bộ phần không cần thảo luận, ghi rõ thời hạn phản hồi",
              "Luôn họp lúc nửa đêm của một nhóm",
              "Không gửi chương trình",
              "Chỉ họp khi mọi người rảnh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ưu tiên bất đồng bộ với người khác múi giờ."
          },
          {
            "number": 10,
            "question": "Một email đạt mục đích trong một lần gửi cần có gì?",
            "options": [
              "Chỉ lời chào dài",
              "Chỉ tệp đính kèm",
              "Chỉ câu hỏi “anh thấy sao?”",
              "Mục đích, bối cảnh cần thiết, hành động mong muốn kèm thời hạn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Người nhận cần đủ thông tin để hành động."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Chia sẻ thông tin có kiểm soát",
        "competency_line": "Năng lực 2.2 · Mức 3–4",
        "objectives": [
          "Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung",
          "Áp dụng được các phương pháp tham chiếu và ghi chú nguồn"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Phân loại thông tin: việc gán một tài liệu vào một trong các mức nhạy cảm để xác định cách xử lý phù hợp",
          "Bốn mức phân loại phổ biến: công khai, nội bộ, hạn chế, mật"
        ],
        "body": [
          "Ở mức trung cấp, việc chia sẻ thông tin và nội dung số cần thêm vai trò đóng làm người trung gian — lựa chọn công nghệ số phù hợp để trao đổi dữ liệu, đồng thời hiểu biết về thực hành trích dẫn và ghi chú nguồn khi chia sẻ nội dung không phải do mình tạo ra.",
          "Bốn mức phân loại thông tin giúp xác định cách chia sẻ phù hợp: công khai (ai cũng xem được), nội bộ (chỉ nhân viên công ty), hạn chế (chỉ nhóm/bộ phận liên quan), mật (chỉ người được chỉ định cụ thể). Thông tin mật không bao giờ dùng liên kết chia sẻ mở, luôn chỉ định người nhận cụ thể.",
          "Quyền truy cập cần được rà soát định kỳ, đặc biệt khi có nhân sự nghỉ việc hoặc chuyển vị trí. Khi phát hiện đã chia sẻ nhầm thông tin nhạy cảm, cần thu hồi quyền truy cập ngay lập tức.",
          "Các bước. 1. Phân loại thông tin theo bốn mức: công khai, nội bộ, hạn chế, mật. 2. Chọn công nghệ chia sẻ phù hợp với mức phân loại. Thông tin mật luôn chỉ định người nhận cụ thể, không dùng liên kết mở. 3. Phân quyền theo nguyên tắc tối thiểu. 4. Khi chia sẻ lại nội dung của người khác, ghi chú nguồn và dẫn về nơi gốc. 5. Rà soát quyền định kỳ, nhất là khi có người nghỉ việc hoặc chuyển vị trí. 6. Khi chia sẻ nhầm thông tin nhạy cảm, thu hồi quyền truy cập ngay."
        ],
        "examples": [
          "Ví dụ trong công việc. Phòng kinh doanh cần chia sẻ báo cáo doanh thu cho phòng kế toán, bảng giá cho đối tác, và biên bản đàm phán chưa công bố cho ba người lãnh đạo. Cùng là “chia sẻ tài liệu” nhưng mỗi loại cần cách khác nhau, và người chia sẻ đóng vai trò trung gian chịu trách nhiệm về lựa chọn đó."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không phân loại; dùng liên kết mở cho tài liệu nội bộ; quên thu hồi quyền khi nhân sự chuyển vị trí; chia sẻ lại nội dung mà không ghi nguồn."
        ],
        "practice": [
          "Phân loại 10 loại tài liệu của doanh nghiệp theo bốn mức, thiết lập quyền tương ứng cho từng mức và lập lịch rà soát."
        ],
        "deliverable": "Bảng phân loại tài liệu, bảng quyền, lịch rà soát.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Thông tin mật nên được chia sẻ như thế nào?",
            "options": [
              "Chỉ định người nhận cụ thể, có thể giới hạn thời hạn và quyền tải xuống",
              "Bằng liên kết mở cho tiện lợi",
              "Đăng công khai để minh bạch",
              "Gửi cho toàn công ty"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Thông tin mật cần kiểm soát chặt chẽ về người nhận và thời hạn."
          },
          {
            "number": 2,
            "question": "Vì sao cần rà soát quyền truy cập định kỳ?",
            "options": [
              "Không cần thiết nếu không có sự cố",
              "Quyền cũ không tự động mất khi nhân sự nghỉ việc hoặc chuyển vị trí",
              "Chỉ để kiểm tra dung lượng",
              "Theo yêu cầu ngẫu nhiên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quyền truy cập tồn tại cho đến khi bị chủ động thu hồi."
          },
          {
            "number": 3,
            "question": "Khi phát hiện chia sẻ nhầm thông tin nhạy cảm, bước đầu tiên nên làm là gì?",
            "options": [
              "Im lặng chờ xem có ai phát hiện không",
              "Xóa toàn bộ tài liệu",
              "Thu hồi quyền truy cập ngay lập tức",
              "Đợi cuối tuần mới xử lý"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thu hồi quyền ngay giúp hạn chế phạm vi ảnh hưởng."
          },
          {
            "number": 4,
            "question": "Bốn mức phân loại thông tin phổ biến là gì?",
            "options": [
              "Công khai, nội bộ, hạn chế, mật",
              "Cao, trung bình, thấp, không có",
              "Quan trọng, không quan trọng",
              "Mới, cũ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là bốn mức phân loại phổ biến trong quản lý thông tin doanh nghiệp."
          },
          {
            "number": 5,
            "question": "Thông tin “nội bộ” nghĩa là gì?",
            "options": [
              "Chỉ một người được xem",
              "Chỉ nhân viên công ty được xem, không chia sẻ ra ngoài",
              "Ai cũng có thể xem",
              "Chỉ ban giám đốc được xem"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nội bộ là mức dành cho nhân viên trong công ty, không công khai ra ngoài."
          },
          {
            "number": 6,
            "question": "Biên bản đàm phán hợp đồng chưa công bố, chỉ ba người được chỉ định biết. Nên phân loại ở mức nào?",
            "options": [
              "Công khai",
              "Nội bộ",
              "Hạn chế theo bộ phận",
              "Mật"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thông tin mật chỉ dành cho người được chỉ định cụ thể."
          },
          {
            "number": 7,
            "question": "Một nhân viên chuyển sang phòng khác. Việc nên làm với quyền truy cập của người đó là gì?",
            "options": [
              "Giữ nguyên toàn bộ quyền cũ",
              "Rà soát và điều chỉnh quyền theo vị trí mới",
              "Cấp thêm quyền cho tiện",
              "Xóa mọi tài khoản của họ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quyền cần được rà soát khi có thay đổi vị trí."
          },
          {
            "number": 8,
            "question": "Bạn đăng lại bài phân tích của đồng nghiệp lên kênh nội bộ. Cần làm gì?",
            "options": [
              "Xóa tên tác giả cho gọn",
              "Không cần ghi gì",
              "Ghi “sưu tầm”",
              "Ghi chú nguồn và dẫn về nơi gốc"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Vai trò trung gian đòi hỏi trích dẫn và ghi chú nguồn."
          },
          {
            "number": 9,
            "question": "Tài liệu mức “hạn chế” nên được chia sẻ như thế nào?",
            "options": [
              "Theo nhóm hoặc bộ phận liên quan",
              "Công khai cho mọi người",
              "Chỉ một người duy nhất",
              "Cho bất kỳ ai có liên kết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Mức hạn chế dành cho nhóm hoặc bộ phận liên quan."
          },
          {
            "number": 10,
            "question": "Bạn phát hiện đã gửi nhầm bảng giá nội bộ cho đối tác. Bước đầu tiên là gì?",
            "options": [
              "Chờ xem đối tác có mở không",
              "Xóa email của mình và coi như xong",
              "Thu hồi quyền truy cập ngay rồi báo người phụ trách",
              "Gửi thêm email xin lỗi mà không thu hồi"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Cần thu hồi quyền truy cập ngay lập tức."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp",
        "competency_line": "Năng lực 2.3 · Mức 3–4",
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
          "Lừa đảo mạo danh cơ quan thuế, bảo hiểm xã hội là hình thức phổ biến — cách xác minh là luôn kiểm tra lại qua kênh chính thức thay vì làm theo hướng dẫn trong tin nhắn/cuộc gọi đáng ngờ.",
          "Các bước chuẩn hóa một thủ tục trực tuyến. 1. Liệt kê các bước, hồ sơ cần có, hạn nộp và người chịu trách nhiệm. 2. Lập danh mục kiểm tra trước khi nộp: thông tin, tệp đính kèm, chữ ký số. 3. Nộp qua cổng chính thức, ký bằng chữ ký số. 4. Lưu mã số hồ sơ và biên nhận để theo dõi trạng thái. 5. Khi hồ sơ bị trả về, ghi lại lý do và cập nhật danh mục kiểm tra. 6. Đào tạo nhân viên nhận biết lừa đảo mạo danh cơ quan thuế, bảo hiểm xã hội: luôn xác minh qua kênh chính thức."
        ],
        "examples": [
          "Ví dụ trong công việc. Bộ phận kế toán của một doanh nghiệp nhỏ hằng tháng khai thuế, hằng quý đóng bảo hiểm xã hội, thỉnh thoảng đăng ký thay đổi thông tin doanh nghiệp. Cả ba đều thực hiện được trực tuyến, nhưng chỉ khi hồ sơ đủ, chữ ký số còn hiệu lực và đúng cổng chính thức."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Nhập sai thông tin; thiếu tệp; chữ ký số hết hạn; không lưu mã hồ sơ; làm theo hướng dẫn trong tin nhắn lạ."
        ],
        "practice": [
          "Lập quy trình chi tiết cho một thủ tục trực tuyến mà bộ phận thường xuyên thực hiện, kèm danh mục hồ sơ cần có và các điểm dễ sai sót."
        ],
        "deliverable": "Quy trình thủ tục dạng các bước và danh mục kiểm tra.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Chữ ký số dùng để làm gì trong thủ tục hành chính trực tuyến?",
            "options": [
              "Trang trí hồ sơ",
              "Tăng tốc độ xử lý",
              "Xác nhận tính hợp lệ của hồ sơ, thay thế chữ ký tay",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chữ ký số xác thực tính hợp lệ và có giá trị pháp lý."
          },
          {
            "number": 2,
            "question": "Sau khi nộp hồ sơ trực tuyến, nên lưu lại gì để theo dõi?",
            "options": [
              "Không cần lưu gì",
              "Mã số hồ sơ",
              "Ảnh chụp màn hình bất kỳ",
              "Không cần thiết vì hệ thống tự động thông báo"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mã số hồ sơ là căn cứ để tra cứu trạng thái xử lý."
          },
          {
            "number": 3,
            "question": "Nhận được tin nhắn yêu cầu “nộp phạt gấp” mạo danh cơ quan thuế, nên làm gì?",
            "options": [
              "Xác minh lại qua kênh chính thức trước khi hành động",
              "Chuyển tiền ngay theo hướng dẫn",
              "Xóa tin nhắn và không làm gì",
              "Trả lời tin nhắn để hỏi thêm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Luôn xác minh qua kênh chính thức trước khi thực hiện bất kỳ yêu cầu tài chính nào."
          },
          {
            "number": 4,
            "question": "Hóa đơn điện tử có giá trị pháp lý như thế nào so với hóa đơn giấy?",
            "options": [
              "Không có giá trị pháp lý",
              "Có giá trị pháp lý tương đương",
              "Chỉ có giá trị tham khảo",
              "Chỉ dùng nội bộ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy theo quy định."
          },
          {
            "number": 5,
            "question": "Khi hồ sơ bị trả về do thiếu sót, nên làm gì?",
            "options": [
              "Xử lý theo đúng hướng dẫn trong thông báo",
              "Nộp lại từ đầu hoàn toàn mới",
              "Bỏ qua và nộp lại y hệt",
              "Liên hệ người quen để “chạy” hồ sơ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Xử lý đúng theo hướng dẫn cụ thể trong thông báo trả hồ sơ là cách hiệu quả nhất."
          },
          {
            "number": 6,
            "question": "Vì sao nên lập danh mục kiểm tra hồ sơ trước khi nộp?",
            "options": [
              "Để nộp chậm hơn",
              "Để bỏ qua bước ký",
              "Giảm sai sót và hạn chế việc bị trả hồ sơ",
              "Không có lợi ích gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Danh mục kiểm tra giúp hồ sơ đầy đủ ngay từ lần đầu."
          },
          {
            "number": 7,
            "question": "Có cuộc gọi tự xưng cơ quan bảo hiểm xã hội yêu cầu chuyển tiền gấp. Bạn nên làm gì?",
            "options": [
              "Không làm theo, kiểm tra qua kênh chính thức của cơ quan đó",
              "Chuyển tiền ngay để tránh bị phạt",
              "Đọc mã xác thực cho họ",
              "Chuyển cuộc gọi cho đồng nghiệp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Luôn xác minh qua kênh chính thức."
          },
          {
            "number": 8,
            "question": "Sau khi nộp hồ sơ thuế trực tuyến thành công, kế toán nên lưu gì?",
            "options": [
              "Chỉ ghi nhớ trong đầu",
              "Mật khẩu tài khoản",
              "Không cần lưu gì",
              "Mã số hồ sơ và biên nhận điện tử"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Lưu mã số hồ sơ để theo dõi trạng thái xử lý."
          },
          {
            "number": 9,
            "question": "Điểm nào thường gây sai sót khi thực hiện thủ tục trực tuyến?",
            "options": [
              "Quá nhiều lần kiểm tra",
              "Dùng cổng chính thức",
              "Lưu mã hồ sơ",
              "Nhập sai thông tin, thiếu tệp, chữ ký số hết hạn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là những điểm cần đưa vào danh mục kiểm tra."
          },
          {
            "number": 10,
            "question": "Doanh nghiệp chuyển sang hóa đơn điện tử. Việc cần làm là gì?",
            "options": [
              "Hủy mọi hóa đơn cũ",
              "Thiết lập quy trình phát hành, lưu trữ và đối chiếu hóa đơn điện tử",
              "Chỉ dùng hóa đơn giấy",
              "Không cần quy trình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hóa đơn điện tử đã thay thế phần lớn hóa đơn giấy trong giao dịch doanh nghiệp."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Điều phối công việc nhóm",
        "competency_line": "Năng lực 2.4 · Mức 3–4",
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
          "Quy ước nhóm nên xác định rõ: kênh nào dùng cho loại việc gì, thời gian phản hồi kỳ vọng là bao lâu. Khi bàn giao công việc, cần có tài liệu bàn giao rõ ràng thay vì trao đổi miệng.",
          "Các bước. 1. Chọn công cụ theo đúng quy trình của nhóm (bảng công việc, tài liệu dùng chung, lịch), không chỉ dùng mặc định. 2. Khi phân công, nói rõ ba điều: ai làm, làm xong khi nào, thế nào là hoàn thành. 3. Theo dõi tiến độ qua trạng thái trên bảng công việc thay vì hỏi từng người. 4. Viết quy ước nhóm: kênh nào dùng cho loại việc nào, thời gian phản hồi kỳ vọng. 5. Khi bàn giao, có tài liệu: tiến độ, việc còn lại, liên hệ, nơi lưu tệp."
        ],
        "examples": [
          "Ví dụ trong công việc. Một nhóm sáu người chuẩn bị chiến dịch ra mắt sản phẩm. Nếu chỉ nhắn “anh làm giúp phần báo cáo nhé”, ba ngày sau không ai biết ai làm gì, khi nào xong, thế nào là xong. Một không gian làm việc rõ ràng có bảng công việc, thư mục tài liệu và bản quy ước nhóm."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Phân công mơ hồ; hỏi tiến độ liên tục khiến đồng nghiệp thấy bị vi quản lý; không có quy ước kênh; bàn giao bằng lời."
        ],
        "practice": [
          "Thiết lập không gian làm việc cho một dự án thật của bộ phận: bảng công việc, cấu trúc tài liệu, và quy ước nhóm bằng văn bản."
        ],
        "deliverable": "Không gian làm việc nhóm và bản quy ước nhóm.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khi phân công công việc, ba điều cần nói rõ là gì?",
            "options": [
              "Ai làm, ở đâu, khi nào",
              "Ai làm, làm gì, tại sao",
              "Ai làm, làm xong khi nào, thế nào là hoàn thành",
              "Không cần nói rõ gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thiếu tiêu chí “thế nào là xong” thường gây tranh cãi về chất lượng sau này."
          },
          {
            "number": 2,
            "question": "Vi quản lý là gì?",
            "options": [
              "Quản lý một nhóm nhỏ",
              "Quản lý từ xa",
              "Kiểm soát quá chi tiết công việc người khác, gây cản trở",
              "Không giao việc cho ai"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là hành vi kiểm soát thái quá, phản tác dụng."
          },
          {
            "number": 3,
            "question": "Cách tốt để theo dõi tiến độ mà không gây cảm giác vi quản lý là gì?",
            "options": [
              "Hỏi han liên tục trực tiếp",
              "Không theo dõi gì cả",
              "Yêu cầu báo cáo mỗi giờ",
              "Dựa trên cập nhật trạng thái trên bảng công việc"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cập nhật trạng thái minh bạch giúp theo dõi mà không cần giám sát trực tiếp liên tục."
          },
          {
            "number": 4,
            "question": "Quy ước nhóm nên bao gồm nội dung gì?",
            "options": [
              "Chỉ cần tên các thành viên",
              "Kênh nào dùng cho việc gì, thời gian phản hồi kỳ vọng",
              "Không cần thiết lập quy ước",
              "Chỉ áp dụng cho nhóm lớn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là những nội dung cốt lõi giúp nhóm làm việc hiệu quả và nhất quán."
          },
          {
            "number": 5,
            "question": "Khi bàn giao công việc, nên làm gì?",
            "options": [
              "Trao đổi miệng là đủ",
              "Có tài liệu bàn giao rõ ràng bằng văn bản",
              "Không cần bàn giao nếu công việc đơn giản",
              "Chỉ cần gửi email ngắn gọn “bàn giao xong”"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tài liệu bàn giao rõ ràng giúp người tiếp nhận nắm được đầy đủ thông tin cần thiết."
          },
          {
            "number": 6,
            "question": "Giao việc “làm giúp anh cái báo cáo” còn thiếu gì?",
            "options": [
              "Ai làm, xong khi nào, thế nào là hoàn thành",
              "Chỉ tên công việc",
              "Chỉ hạn chót",
              "Chỉ tên người giao"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phân công cần nói rõ ba điều này."
          },
          {
            "number": 7,
            "question": "Nhóm hay lẫn lộn kênh và chậm phản hồi. Giải pháp phù hợp là gì?",
            "options": [
              "Cấm dùng chat",
              "Viết quy ước: kênh nào dùng cho loại việc nào, thời gian phản hồi kỳ vọng",
              "Phạt người phản hồi chậm",
              "Họp mỗi giờ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quy ước nhóm làm rõ kỳ vọng chung."
          },
          {
            "number": 8,
            "question": "Người phụ trách sắp nghỉ phép dài. Cách bàn giao tốt là gì?",
            "options": [
              "Tài liệu bàn giao ghi tiến độ, việc còn lại, liên hệ và nơi lưu tệp",
              "Dặn miệng lúc ra về",
              "Nhắn “nhờ anh lo giúp”",
              "Không bàn giao"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bàn giao cần có tài liệu rõ ràng."
          },
          {
            "number": 9,
            "question": "Trưởng nhóm muốn theo dõi tiến độ mà không gây cảm giác vi quản lý. Nên làm gì?",
            "options": [
              "Dựa vào cập nhật trạng thái trên bảng công việc",
              "Hỏi từng người mỗi giờ",
              "Yêu cầu báo cáo bằng miệng mỗi sáng",
              "Không theo dõi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bảng công việc thay thế việc hỏi han liên tục."
          },
          {
            "number": 10,
            "question": "Cách chọn công cụ hợp tác ở mức trung cấp là gì?",
            "options": [
              "Dùng công cụ mặc định cho mọi việc",
              "Dùng càng nhiều công cụ càng tốt",
              "Mỗi người tự chọn công cụ riêng",
              "Chọn theo quy trình cụ thể của nhóm, không chỉ dùng công cụ mặc định"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Lựa chọn có chủ đích cho từng quy trình."
          }
        ]
      },
      {
        "module_number": 5,
        "title": "Chuẩn mực ứng xử và xử lý tình huống khó",
        "competency_line": "Năng lực 2.5 · Mức 3–4",
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
          "Trong nhóm chat công việc, nếu phát hiện hành vi bắt nạt trên mạng, loại trừ hoặc quấy rối, người chứng kiến có vai trò quan trọng — có thể lên tiếng trực tiếp hoặc báo cáo cho người quản lý. Xây quy tắc ứng xử số cho bộ phận giúp thiết lập chuẩn mực chung.",
          "Các bước. 1. Với phản hồi tiêu cực công khai: phản hồi chuyên nghiệp, ngắn gọn, mời chuyển kênh riêng. 2. Với đối tác từ văn hóa khác: tìm hiểu và thống nhất kỳ vọng về cách nói, thời gian phản hồi; hỏi lại để xác nhận khi chưa chắc ý của họ. 3. Khi chứng kiến bắt nạt, loại trừ hoặc quấy rối trong nhóm chat: lên tiếng trực tiếp hoặc báo cáo cho người quản lý. 4. Soạn quy tắc ứng xử số cho bộ phận: kênh, giờ giấc, văn phong, cách xử lý khi vi phạm."
        ],
        "examples": [
          "Ví dụ trong công việc. Một khách hàng đăng đánh giá một sao trên trang công khai của công ty. Cách xử lý cho thấy văn hóa của công ty với cả người xem: cảm ơn phản hồi, xin lỗi vì trải nghiệm chưa tốt, và mời chuyển sang kênh riêng để giải quyết chi tiết. Bên cạnh đó là đối tác nước ngoài, nơi cách nói trực tiếp hay gián tiếp, thái độ với thứ bậc và kỳ vọng về thời gian phản hồi có thể khác bạn."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tranh cãi với khách công khai; suy đoán ý đối tác; im lặng khi thấy đồng nghiệp bị loại trừ; quy tắc quá chung chung, không có cách xử lý vi phạm."
        ],
        "practice": [
          "Soạn phản hồi công khai cho một đánh giá tiêu cực của khách hàng, và soạn dự thảo quy tắc ứng xử số 1 trang cho bộ phận."
        ],
        "deliverable": "Bản phản hồi khách hàng và dự thảo quy tắc ứng xử.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khi khách hàng để lại phản hồi tiêu cực công khai, nên làm gì?",
            "options": [
              "Tranh luận công khai để bảo vệ danh dự công ty",
              "Xóa bình luận ngay lập tức",
              "Phản hồi chuyên nghiệp, mời chuyển sang kênh riêng để giải quyết",
              "Phớt lờ hoàn toàn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Phản hồi chuyên nghiệp và chuyển sang kênh riêng giúp giải quyết hiệu quả mà không leo thang công khai."
          },
          {
            "number": 2,
            "question": "Vai trò của người chứng kiến khi thấy hành vi bắt nạt trong nhóm chat là gì?",
            "options": [
              "Không có vai trò gì vì không bị ảnh hưởng trực tiếp",
              "Chỉ nên xem và không làm gì",
              "Rời khỏi nhóm ngay",
              "Có thể lên tiếng hoặc báo cáo cho người quản lý"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Người chứng kiến có thể đóng vai trò quan trọng trong việc ngăn chặn hành vi không phù hợp."
          },
          {
            "number": 3,
            "question": "Khi giao tiếp với đối tác từ văn hóa coi trọng cách nói gián tiếp, nên lưu ý gì?",
            "options": [
              "Nói thẳng mọi vấn đề không cần cân nhắc",
              "Không cần điều chỉnh gì",
              "Luôn dùng văn phong trang trọng nhất",
              "Chú ý cách diễn đạt tế nhị hơn, hiểu ý ngụ ý"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cần điều chỉnh cách diễn đạt phù hợp với phong cách giao tiếp của đối tác."
          },
          {
            "number": 4,
            "question": "Quy tắc ứng xử số cho bộ phận nên bao gồm nội dung gì?",
            "options": [
              "Giờ giấc nhắn tin, cách xử lý bất đồng, quy trình khi có vi phạm",
              "Chỉ cần danh sách thành viên",
              "Không cần thiết lập",
              "Chỉ áp dụng cho nhân viên mới"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các nội dung cốt lõi để thiết lập chuẩn mực chung cho bộ phận."
          },
          {
            "number": 5,
            "question": "Kỳ vọng về thời gian phản hồi có giống nhau giữa các nền văn hóa không?",
            "options": [
              "Luôn giống nhau ở mọi nơi",
              "Khác nhau tùy văn hóa, cần tìm hiểu trước khi làm việc với đối tác",
              "Không quan trọng",
              "Chỉ phụ thuộc vào cấp bậc"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kỳ vọng phản hồi khác nhau tùy văn hóa, cần lưu ý khi làm việc xuyên quốc gia."
          },
          {
            "number": 6,
            "question": "Khách đăng đánh giá một sao kèm lời lẽ nặng. Cách phản hồi công khai phù hợp là gì?",
            "options": [
              "Cảm ơn phản hồi, xin lỗi vì trải nghiệm chưa tốt và mời liên hệ kênh riêng để giải quyết",
              "Tranh luận từng điểm công khai",
              "Xóa đánh giá",
              "Không phản hồi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phản hồi công khai chuyên nghiệp rồi chuyển sang kênh riêng."
          },
          {
            "number": 7,
            "question": "Đối tác nước ngoài kỳ vọng phản hồi trong 24 giờ, trong khi nhóm bạn quen vài ngày. Bạn nên làm gì?",
            "options": [
              "Phớt lờ kỳ vọng của họ",
              "Trao đổi và thống nhất kỳ vọng thời gian phản hồi",
              "Phản hồi bất kỳ lúc nào",
              "Bắt họ theo thói quen của mình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kỳ vọng về thời gian phản hồi khác nhau giữa các văn hóa."
          },
          {
            "number": 8,
            "question": "Bạn thấy một đồng nghiệp bị cố ý loại khỏi cuộc trò chuyện của nhóm. Vai trò của người chứng kiến là gì?",
            "options": [
              "Lên tiếng hoặc báo cáo cho người quản lý",
              "Im lặng vì không liên quan",
              "Chia sẻ lại tin nhắn cho nhiều người",
              "Tham gia loại trừ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Người chứng kiến có vai trò quan trọng."
          },
          {
            "number": 9,
            "question": "Quy tắc ứng xử số của bộ phận giúp ích điều gì?",
            "options": [
              "Thay thế pháp luật",
              "Chỉ để trang trí",
              "Thiết lập chuẩn mực chung và cơ sở xử lý khi vi phạm",
              "Giảm số người trong nhóm"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy tắc ứng xử là chuẩn mực chung của bộ phận."
          },
          {
            "number": 10,
            "question": "Đối tác nói “chúng tôi có thể xem xét thêm” trong khi có thể đó là từ chối nhẹ. Bạn nên làm gì?",
            "options": [
              "Coi như đã đồng ý",
              "Hỏi lại để xác nhận ý, tránh suy đoán một chiều",
              "Bỏ qua",
              "Gửi mười email liên tiếp"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cách nói gián tiếp cần được xác nhận."
          }
        ]
      },
      {
        "module_number": 6,
        "title": "Quản lý danh tính nghề nghiệp",
        "competency_line": "Năng lực 2.6 · Mức 3–4",
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
          "Khi quản lý nhiều tài khoản, cần có quy tắc rõ ràng để tránh đăng nhầm nội dung. Rà soát nội dung cũ định kỳ giúp phát hiện những bài đăng không còn phù hợp, ảnh hưởng đến danh tiếng trực tuyến hiện tại.",
          "Các bước. 1. Thống nhất hồ sơ nghề nghiệp trên các nền tảng: chức danh, kinh nghiệm, ảnh, giới thiệu. 2. Xác định ranh giới giữa phát ngôn cá nhân và phát ngôn nhân danh công ty; ghi chú rõ khi là ý kiến cá nhân. 3. Với nhiều tài khoản, đặt quy tắc loại nội dung nào đăng ở tài khoản nào và kiểm tra trước khi đăng. 4. Rà soát nội dung cũ định kỳ, ẩn hoặc xóa nội dung không còn phù hợp. 5. Biết cách tải xuống, chỉnh sửa hoặc xóa dữ liệu cá nhân mình đã tạo khi dịch vụ cho phép."
        ],
        "examples": [
          "Ví dụ trong công việc. Một chuyên viên marketing có hồ sơ ghi rõ nơi làm việc và đăng bình luận chê một chính sách của ngành. Dù ý định cá nhân, bình luận đó có thể bị hiểu là quan điểm của công ty. Cùng lúc, hồ sơ nghề nghiệp ghi mỗi nơi một chức danh khiến nhà tuyển dụng thấy thiếu nhất quán."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Hồ sơ mâu thuẫn giữa các nền tảng; đăng nhầm nội dung công việc lên tài khoản cá nhân; không rà soát bài cũ; để quan điểm cá nhân bị hiểu thành quan điểm công ty."
        ],
        "practice": [
          "Rà soát toàn bộ hiện diện trực tuyến của bản thân, lập danh sách nội dung cần điều chỉnh, và cập nhật hồ sơ nghề nghiệp chính."
        ],
        "deliverable": "Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao một hồ sơ nghề nghiệp trực tuyến nhất quán lại quan trọng?",
            "options": [
              "Không quan trọng",
              "Chỉ để trang trí",
              "Không ảnh hưởng đến công việc",
              "Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tính nhất quán tạo dựng uy tín và sự chuyên nghiệp."
          },
          {
            "number": 2,
            "question": "Một bình luận cá nhân về đối thủ cạnh tranh trên mạng xã hội có rủi ro gì?",
            "options": [
              "Có thể bị hiểu là quan điểm của công ty, gây rủi ro uy tín hoặc pháp lý",
              "Không có rủi ro vì là ý kiến cá nhân",
              "Luôn được khuyến khích",
              "Chỉ có vấn đề nếu đăng công khai"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ranh giới cá nhân và nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ có ghi nơi làm việc."
          },
          {
            "number": 3,
            "question": "Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ?",
            "options": [
              "Không cần thiết",
              "Phát hiện nội dung không còn phù hợp với hình ảnh nghề nghiệp hiện tại",
              "Chỉ để tăng lượt theo dõi",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nội dung cũ có thể không còn phù hợp và ảnh hưởng đến hình ảnh hiện tại."
          },
          {
            "number": 4,
            "question": "Khi quản lý nhiều tài khoản (cá nhân, công việc), cần lưu ý điều gì?",
            "options": [
              "Không cần phân biệt gì",
              "Dùng chung một mật khẩu cho tiện",
              "Có quy tắc rõ ràng để tránh đăng nhầm nội dung vào sai tài khoản",
              "Không cần nhiều tài khoản"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy tắc rõ ràng giúp tránh sai sót gây ảnh hưởng không mong muốn."
          },
          {
            "number": 5,
            "question": "Quyền yêu cầu gỡ bỏ thông tin cá nhân tồn tại nhằm mục đích gì?",
            "options": [
              "Không có mục đích cụ thể",
              "Cho phép cá nhân kiểm soát thông tin của mình trên một số nền tảng trong trường hợp nhất định",
              "Chỉ áp dụng cho người nổi tiếng",
              "Không có quyền này trong thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là một quyền được quy định nhằm bảo vệ quyền kiểm soát thông tin cá nhân."
          },
          {
            "number": 6,
            "question": "Hồ sơ của bạn ghi nơi làm việc và bạn muốn bình luận chê một chính sách ngành. Nên lưu ý điều gì?",
            "options": [
              "Không ai liên hệ bình luận với công ty",
              "Có thể bị hiểu là quan điểm của công ty; nên ghi rõ ý kiến cá nhân hoặc tránh phát ngôn nhạy cảm",
              "Bình luận cá nhân luôn tách biệt hoàn toàn",
              "Chỉ cần xóa sau một ngày"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ranh giới phát ngôn cá nhân và nhân danh công ty không phải lúc nào cũng rõ ràng."
          },
          {
            "number": 7,
            "question": "Chức danh của bạn khác nhau trên ba nền tảng nghề nghiệp. Nên làm gì?",
            "options": [
              "Giữ nguyên vì mỗi nền tảng khác nhau",
              "Xóa hết hồ sơ",
              "Thống nhất để hồ sơ nhất quán và đáng tin hơn",
              "Thêm nhiều chức danh nữa"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Hồ sơ nhất quán tạo ấn tượng đáng tin cậy hơn."
          },
          {
            "number": 8,
            "question": "Làm sao để tránh đăng nhầm nội dung giữa tài khoản cá nhân và tài khoản công việc?",
            "options": [
              "Đặt quy tắc nội dung cho từng tài khoản và kiểm tra trước khi đăng",
              "Dùng chung một mật khẩu",
              "Đăng tất cả lên cả hai tài khoản",
              "Không kiểm tra, tin vào trí nhớ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quy tắc rõ ràng giúp tránh sai sót."
          },
          {
            "number": 9,
            "question": "Bạn chuẩn bị xin việc mới. Việc nên làm với nội dung cũ trên mạng xã hội là gì?",
            "options": [
              "Không làm gì",
              "Đặt mọi thứ ở chế độ công khai",
              "Chỉ xóa bài mới",
              "Rà soát, ẩn hoặc xóa nội dung không còn phù hợp và cập nhật hồ sơ chính"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Rà soát nội dung cũ giúp bảo vệ danh tiếng hiện tại."
          },
          {
            "number": 10,
            "question": "Thao tác dữ liệu cá nhân tạo ra qua dịch vụ số nghĩa là gì?",
            "options": [
              "Tải xuống, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình khi dịch vụ cho phép",
              "Chỉ nhà cung cấp mới được thao tác",
              "Không thể thao tác",
              "Phải nhờ người khác làm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Người dùng chủ động quản lý dữ liệu do mình tạo ra."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M2-I — “Hệ thống giao tiếp và cộng tác cho dự án liên bộ phận” (Assignment)",
      "context": "Công ty triển khai một dự án có ít nhất ba bộ phận (ví dụ kinh doanh, kế toán, vận hành) và một đối tác bên ngoài. Bạn được giao thiết lập toàn bộ cách giao tiếp và cộng tác cho dự án. Bạn tự chọn loại dự án, ghi rõ giả định.",
      "requirements": "1. Lập bảng chọn kênh giao tiếp cho ít nhất 8 loại thông tin, mỗi dòng nêu độ khẩn, độ phức tạp, nhu cầu lưu vết và kênh được chọn. 2. Soạn một email khó (từ chối hoặc thúc tiến độ) theo cấu trúc đã học, kèm giải trình chiến lược. 3. Phân loại ít nhất 10 loại tài liệu theo bốn mức (công khai, nội bộ, hạn chế, mật), thiết lập quyền tương ứng và lập lịch rà soát quyền. 4. Dựng bảng công việc với tối thiểu 12 thẻ, mỗi thẻ có người phụ trách, hạn, tiêu chí hoàn thành. 5. Viết bản quy ước nhóm: kênh theo loại việc, thời gian phản hồi, cách bàn giao. 6. Viết quy tắc ứng xử số 1 trang phù hợp bối cảnh doanh nghiệp, gồm cách phản hồi đánh giá tiêu cực công khai và cách xử lý hành vi bắt nạt trong nhóm chat. 7. Viết ngắn gọn cách bạn xử lý khác biệt múi giờ hoặc văn hóa với đối tác.",
      "deliverables": "Bảng chọn kênh; email khó; bảng phân loại tài liệu và lịch rà soát; ảnh chụp hoặc tệp bảng công việc; bản quy ước nhóm; quy tắc ứng xử số; đoạn xử lý khác biệt văn hóa/múi giờ.\nHình thức nộp. Một bộ hồ sơ Word/PDF kèm ảnh chụp bảng công việc.",
      "rubric": [
        "Gợi ý. Chỉ dùng thông tin giả định, không đưa thông tin thật của tổ chức. Quy ước cần cụ thể (kênh, thời gian) để người khác làm theo được.",
        "Tiêu chí",
        "Điểm",
        "Lựa chọn kênh giao tiếp hợp lý cho từng loại thông tin",
        "20",
        "Phân loại và phân quyền tài liệu đúng nguyên tắc",
        "20",
        "Bảng công việc và phân công rõ ràng",
        "20",
        "Quy ước nhóm đầy đủ, khả thi",
        "20",
        "Quy tắc ứng xử phù hợp bối cảnh doanh nghiệp",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Việc nào nên dùng kênh đồng bộ như họp hoặc gọi điện?",
        "options": [
          "Việc phức tạp, cần trao đổi qua lại và quyết định nhanh",
          "Việc đơn giản chỉ cần xác nhận",
          "Thông báo chung không cần phản hồi",
          "Gửi tài liệu tham khảo"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Độ phức tạp và độ khẩn quyết định việc cần kênh đồng bộ."
      },
      {
        "number": 2,
        "question": "Email từ chối nên bắt đầu như thế nào?",
        "options": [
          "Giải thích dài rồi mới nêu quyết định",
          "Nêu quyết định rõ ràng trước rồi giải thích lý do",
          "Chỉ nêu lý do",
          "Không cần email"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Quyết định được nêu trước để người nhận không phải đoán."
      },
      {
        "number": 3,
        "question": "Làm việc với đối tác ở múi giờ khác, cách phù hợp là gì?",
        "options": [
          "Luôn gọi lúc nửa đêm",
          "Không đặt thời hạn",
          "Chỉ liên lạc qua điện thoại",
          "Ưu tiên giao tiếp bất đồng bộ và ghi rõ thời hạn phản hồi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Giao tiếp bất đồng bộ giảm gánh nặng về giờ giấc."
      },
      {
        "number": 4,
        "question": "Cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì?",
        "options": [
          "Một câu chào",
          "Một cuộc bỏ phiếu mới",
          "Tóm tắt quyết định và việc cần làm của từng người",
          "Không cần kết thúc rõ ràng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Kết thúc rõ ràng giúp mọi người biết phải làm gì."
      },
      {
        "number": 5,
        "question": "Thông tin mật nên được chia sẻ như thế nào?",
        "options": [
          "Bất kỳ ai có liên kết cũng xem được",
          "Đăng lên nhóm chung",
          "Chỉ định người nhận cụ thể, không dùng liên kết mở",
          "Gửi cho cả phòng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Thông tin mật chỉ dành cho người được chỉ định."
      },
      {
        "number": 6,
        "question": "Vì sao cần rà soát quyền truy cập định kỳ?",
        "options": [
          "Để tăng dung lượng lưu trữ",
          "Vì nhân sự nghỉ việc hoặc chuyển vị trí có thể vẫn còn quyền cũ",
          "Để đổi tên tệp",
          "Không cần rà soát"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Quyền cần được cập nhật theo thay đổi nhân sự."
      },
      {
        "number": 7,
        "question": "Bốn mức phân loại thông tin phổ biến là gì?",
        "options": [
          "Mới, cũ, lớn, nhỏ",
          "Đỏ, vàng, xanh, tím",
          "Công khai, nội bộ, hạn chế, mật",
          "Nhanh, chậm, vừa, rất chậm"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Đây là bốn mức của khóa."
      },
      {
        "number": 8,
        "question": "Chữ ký số dùng để làm gì trong thủ tục trực tuyến?",
        "options": [
          "Xác nhận tính hợp lệ của hồ sơ",
          "Làm đẹp hồ sơ",
          "Tăng dung lượng tệp",
          "Thay thế mật khẩu email"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Chữ ký số xác nhận người thực hiện và tính hợp lệ của hồ sơ."
      },
      {
        "number": 9,
        "question": "Nhận tin nhắn mạo danh cơ quan thuế yêu cầu nộp phạt gấp. Bạn nên làm gì?",
        "options": [
          "Kiểm tra lại qua kênh chính thức, không làm theo tin nhắn",
          "Nộp ngay",
          "Chuyển tiếp cho đồng nghiệp",
          "Trả lời kèm thông tin cá nhân"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Lừa đảo mạo danh cơ quan nhà nước rất phổ biến."
      },
      {
        "number": 10,
        "question": "Sau khi nộp hồ sơ trực tuyến, nên lưu gì?",
        "options": [
          "Không cần lưu gì",
          "Chỉ ghi nhớ",
          "Chỉ lưu mật khẩu",
          "Mã số hồ sơ để theo dõi trạng thái"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Mã số hồ sơ dùng để theo dõi xử lý."
      },
      {
        "number": 11,
        "question": "Khi phân công công việc, ba điều cần nói rõ là gì?",
        "options": [
          "Chỉ tên và hạn",
          "Ai làm, xong khi nào, thế nào là hoàn thành",
          "Chỉ người giao",
          "Chỉ tên công việc"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đây là ba điều của khóa."
      },
      {
        "number": 12,
        "question": "Cách theo dõi tiến độ tốt mà không gây cảm giác vi quản lý là gì?",
        "options": [
          "Hỏi từng người mỗi giờ",
          "Yêu cầu báo cáo miệng liên tục",
          "Dựa vào trạng thái trên bảng công việc",
          "Không theo dõi"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Cập nhật trạng thái thay cho hỏi han trực tiếp."
      },
      {
        "number": 13,
        "question": "Khi bàn giao công việc, nên làm gì?",
        "options": [
          "Dặn miệng",
          "Nhắn một câu",
          "Không bàn giao",
          "Có tài liệu bàn giao rõ ràng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bàn giao cần tài liệu."
      },
      {
        "number": 14,
        "question": "Phản hồi công khai cho đánh giá tiêu cực nên như thế nào?",
        "options": [
          "Tranh luận từng câu",
          "Xóa đánh giá",
          "Phớt lờ",
          "Chuyên nghiệp và mời chuyển sang kênh riêng để giải quyết chi tiết"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đây là nguyên tắc xử lý phản hồi tiêu cực công khai."
      },
      {
        "number": 15,
        "question": "Khi thấy hành vi bắt nạt trong nhóm chat, người chứng kiến nên làm gì?",
        "options": [
          "Lên tiếng trực tiếp hoặc báo cáo cho người quản lý",
          "Im lặng",
          "Chia sẻ lại cho người khác",
          "Tham gia trêu chọc"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Người chứng kiến có vai trò quan trọng."
      },
      {
        "number": 16,
        "question": "Với đối tác có văn hóa nói gián tiếp, bạn nên làm gì?",
        "options": [
          "Hiểu theo nghĩa đen mọi lúc",
          "Hỏi lại để xác nhận ý của họ",
          "Bỏ qua mọi phản hồi",
          "Ép họ nói trực tiếp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cách nói trực tiếp hay gián tiếp khác nhau giữa các văn hóa."
      },
      {
        "number": 17,
        "question": "Quy tắc ứng xử số cho bộ phận cần có nội dung nào?",
        "options": [
          "Chỉ danh sách thành viên",
          "Chỉ mật khẩu chung",
          "Chỉ lịch nghỉ lễ",
          "Kênh sử dụng, văn phong, giờ giấc và cách xử lý khi vi phạm"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Quy tắc cần cụ thể để thực hiện được."
      },
      {
        "number": 18,
        "question": "Vì sao hồ sơ nghề nghiệp trực tuyến nhất quán quan trọng?",
        "options": [
          "Để có nhiều người theo dõi",
          "Để tiết kiệm thời gian đăng bài",
          "Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn",
          "Không quan trọng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Thông tin mâu thuẫn làm giảm độ tin cậy."
      },
      {
        "number": 19,
        "question": "Bình luận cá nhân về đối thủ cạnh tranh khi hồ sơ ghi rõ nơi làm việc có rủi ro gì?",
        "options": [
          "Có thể bị hiểu là quan điểm của công ty",
          "Không có rủi ro",
          "Luôn được bảo vệ",
          "Chỉ ảnh hưởng người lạ"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ranh giới phát ngôn cá nhân và nhân danh công ty không luôn rõ."
      },
      {
        "number": 20,
        "question": "Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ?",
        "options": [
          "Để có thêm lượt xem",
          "Phát hiện nội dung không còn phù hợp, ảnh hưởng đến danh tiếng hiện tại",
          "Để xóa mọi bài đăng",
          "Không cần thiết"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nội dung cũ vẫn có thể ảnh hưởng danh tiếng hiện tại."
      }
    ]
  },
  "M2-A": {
    "code": "M2-A",
    "title": "LÃNH ĐẠO GIAO TIẾP VÀ CỘNG TÁC SỐ",
    "domain_number": 2,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Chiến lược giao tiếp tổ chức",
        "competency_line": "Năng lực 2.1 · Mức 5–6",
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
          "Cùng một thông điệp có thể cần trình bày khác nhau cho các nhóm đối tượng khác nhau. Đo lường hiệu quả giao tiếp nội bộ có thể qua tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp.",
          "Các bước. 1. Thiết kế kiến trúc kênh: kênh nào cho loại thông điệp nào (thông báo chính thức, trao đổi hằng ngày, khẩn cấp). 2. Lập trình tự thông báo cho thay đổi lớn: quản lý trực tiếp trước, sau đó nhân viên liên quan. 3. Điều chỉnh thông điệp theo từng nhóm đối tượng: điều họ cần biết, điều họ lo ngại. 4. Đo hiệu quả: tỉ lệ mở và đọc thông báo, khảo sát mức độ hiểu đúng. 5. Theo dõi dấu hiệu quá tải giao tiếp và điều chỉnh kênh."
        ],
        "examples": [
          "Ví dụ trong công việc. Công ty chuẩn bị sáp nhập hai phòng. Nếu thông báo chung vào nhóm chat toàn công ty, trưởng phòng sẽ nghe tin cùng lúc với nhân viên và không kịp giải đáp. Kế hoạch tốt: thông báo cho quản lý trực tiếp trước, rồi toàn bộ nhân viên liên quan, mỗi nhóm có thông điệp riêng."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Để nhân viên nghe tin qua kênh không chính thức; một thông điệp cho mọi người; tạo thêm kênh mới thay vì chuẩn hóa kênh hiện có; không đo hiệu quả."
        ],
        "practice": [
          "Xây kế hoạch truyền thông nội bộ cho một thay đổi lớn trong doanh nghiệp (đổi quy trình, sáp nhập bộ phận, hoặc triển khai hệ thống mới), gồm kênh sử dụng, trình tự thông báo, và thông điệp riêng cho từng nhóm đối tượng."
        ],
        "deliverable": "Kế hoạch truyền thông thay đổi.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cần có trình tự thông báo rõ ràng khi truyền đạt thay đổi lớn?",
            "options": [
              "Tránh nhân viên nghe tin qua kênh không chính thức trước, gây tin đồn",
              "Không quan trọng, thông báo đồng thời là đủ",
              "Chỉ để tiết kiệm thời gian",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Trình tự hợp lý giúp kiểm soát thông tin và tránh mất lòng tin."
          },
          {
            "number": 2,
            "question": "Vì sao cùng một thông điệp cần trình bày khác nhau cho các nhóm đối tượng khác nhau?",
            "options": [
              "Không cần thiết, nội dung giống nhau là đủ",
              "Chỉ để tạo sự khác biệt",
              "Mỗi nhóm cần loại thông tin và mức độ chi tiết khác nhau để hiểu và hành động đúng",
              "Không có lý do thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Phân tầng thông điệp giúp mỗi nhóm nhận được thông tin phù hợp với vai trò của họ."
          },
          {
            "number": 3,
            "question": "Dấu hiệu quá tải giao tiếp trong tổ chức bao gồm gì?",
            "options": [
              "Quá nhiều cuộc họp không cần thiết, thông báo dồn dập ngoài giờ",
              "Không có cuộc họp nào",
              "Giao tiếp quá ít",
              "Không có dấu hiệu cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các dấu hiệu phổ biến của quá tải giao tiếp trong tổ chức."
          },
          {
            "number": 4,
            "question": "Đo lường hiệu quả giao tiếp nội bộ nên dựa vào điều gì?",
            "options": [
              "Chỉ cảm nhận chủ quan",
              "Số lượng email gửi đi",
              "Không cần đo lường",
              "Tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dữ liệu định lượng cho phép đánh giá khách quan hơn cảm nhận chủ quan."
          },
          {
            "number": 5,
            "question": "Kiến trúc kênh giao tiếp trong tổ chức nhằm mục đích gì?",
            "options": [
              "Tăng số lượng kênh sử dụng",
              "Xác định rõ kênh nào dùng cho loại thông điệp nào, tránh lẫn lộn thông tin quan trọng",
              "Không có mục đích cụ thể",
              "Chỉ để trang trí hệ thống"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kiến trúc rõ ràng giúp thông tin quan trọng không bị chìm trong khối lượng lớn tin nhắn không quan trọng."
          },
          {
            "number": 6,
            "question": "Công ty sắp thay hệ thống làm việc. Trình tự thông báo hợp lý nhất là gì?",
            "options": [
              "Đăng chung toàn công ty cùng lúc",
              "Để tin lan truyền tự nhiên",
              "Chỉ thông báo cho nhân viên, không báo quản lý",
              "Quản lý trực tiếp trước, sau đó toàn thể nhân viên liên quan, mỗi nhóm có thông điệp phù hợp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Quản lý cần được chuẩn bị trước để hỗ trợ nhân viên."
          },
          {
            "number": 7,
            "question": "Thông báo toàn công ty có tỉ lệ mở thấp. Điều nên làm là gì?",
            "options": [
              "Tìm nguyên nhân, điều chỉnh kênh và cách trình bày, rồi đo lại",
              "Gửi lại y hệt nhiều lần",
              "Cho rằng nhân viên không quan tâm",
              "Bỏ thông báo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đo lường dùng để điều chỉnh cách giao tiếp."
          },
          {
            "number": 8,
            "question": "Kiến trúc kênh giao tiếp của tổ chức nên xác định điều gì?",
            "options": [
              "Màu sắc của từng kênh",
              "Kênh nào dùng cho loại thông điệp nào",
              "Số lượng tin nhắn tối đa mỗi ngày",
              "Tên của người quản lý kênh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kiến trúc kênh làm rõ vai trò từng kênh để tránh quá tải."
          },
          {
            "number": 9,
            "question": "Dấu hiệu nào cho thấy tổ chức đang quá tải giao tiếp?",
            "options": [
              "Mọi người đều đọc kịp mọi tin",
              "Chỉ có một kênh duy nhất",
              "Thông báo bị bỏ sót, thông tin trùng lặp ở nhiều kênh, nhân viên không biết đâu là kênh chính thức",
              "Không có tin nào bị bỏ sót"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là dấu hiệu cần chuẩn hóa kênh."
          },
          {
            "number": 10,
            "question": "Cùng một thông điệp cho kỹ sư và cho nhân viên bán hàng nên như thế nào?",
            "options": [
              "Giữ y nguyên cho cả hai",
              "Điều chỉnh nội dung và cách trình bày theo mối quan tâm của từng nhóm",
              "Chỉ gửi cho nhóm lớn hơn",
              "Không cần thông điệp riêng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mỗi nhóm đối tượng có mối quan tâm khác nhau."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Quản trị luồng chia sẻ thông tin",
        "competency_line": "Năng lực 2.2 · Mức 5–6",
        "objectives": [
          "Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung",
          "Thích ứng được vai trò trung gian của mình",
          "Thay đổi được cách sử dụng các phương pháp tham chiếu và ghi chú phù hợp hơn"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Phân quyền theo vai trò (role-based access): cấp quyền truy cập dựa trên chức năng công việc của một vai trò, thay vì cấp riêng lẻ cho từng cá nhân",
          "Phân tách nhiệm vụ: nguyên tắc không để một người kiểm soát toàn bộ một quy trình nhạy cảm từ đầu đến cuối"
        ],
        "body": [
          "Ở mức nâng cao, việc chia sẻ thông tin và nội dung số đòi hỏi đánh giá công nghệ số phù hợp nhất và thích ứng vai trò trung gian của mình trong bối cảnh phức tạp — tức là xây dựng chính sách chia sẻ thông tin cấp tổ chức, không còn là quyết định cá nhân từng lần.",
          "Chính sách này cần nêu rõ nguyên tắc chung, phạm vi áp dụng, và ngoại lệ được phép. Nên phân quyền theo vai trò (ai giữ vai trò nào sẽ có quyền tương ứng) thay vì cấp quyền riêng lẻ cho từng người, kèm nguyên tắc quyền tối thiểu và phân tách nhiệm vụ cho quy trình có rủi ro cao.",
          "Quy trình ứng phó sự cố lộ dữ liệu cần được viết sẵn theo năm bước: khoanh vùng, đánh giá, thông báo, khắc phục, rà soát.",
          "Các bước. 1. Viết chính sách chia sẻ: nguyên tắc chung, phạm vi, ngoại lệ được phép. 2. Xây ma trận phân quyền theo vai trò × nhóm dữ liệu, áp dụng quyền tối thiểu và phân tách nhiệm vụ. 3. Lập sổ rủi ro thông tin: rủi ro, khả năng xảy ra, tác động, biện pháp, người phụ trách. 4. Viết sẵn quy trình ứng phó sự cố lộ dữ liệu: khoanh vùng, đánh giá, thông báo, khắc phục, rà soát. 5. Khi chia sẻ với bên thứ ba, có thỏa thuận bằng văn bản về mục đích và phạm vi sử dụng."
        ],
        "examples": [
          "Ví dụ trong công việc. Một doanh nghiệp có bốn vai trò (quản lý, kế toán, kinh doanh, nhân sự) và năm nhóm dữ liệu (tài chính, khách hàng, nhân sự, hợp đồng, kỹ thuật). Cấp quyền riêng cho từng người khiến mỗi lần có người chuyển vị trí lại phải sửa hàng chục chỗ. Phân quyền theo vai trò giúp quản lý gọn và kiểm soát được."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Cấp quyền theo từng cá nhân; một người vừa soạn vừa duyệt giao dịch quan trọng; không diễn tập quy trình ứng phó; chia sẻ với bên thứ ba mà không có thỏa thuận."
        ],
        "practice": [
          "Xây mô hình phân quyền theo vai trò cho doanh nghiệp (tối thiểu bốn vai trò × năm nhóm dữ liệu), một sổ rủi ro sáu mục, và một quy trình ứng phó sự cố."
        ],
        "deliverable": "Ma trận phân quyền, sổ rủi ro, quy trình ứng phó.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân?",
            "options": [
              "Không có ưu điểm gì",
              "Dễ quản lý hơn, không phụ thuộc vào việc nhớ cấp quyền cho từng người",
              "Chậm hơn",
              "Tốn nhiều tài nguyên hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Phân quyền theo vai trò tự động và nhất quán hơn khi số lượng nhân sự tăng."
          },
          {
            "number": 2,
            "question": "Phân tách nhiệm vụ nhằm mục đích gì?",
            "options": [
              "Đảm bảo không ai một mình kiểm soát toàn bộ quy trình nhạy cảm",
              "Tăng khối lượng công việc",
              "Giảm số người tham gia công việc",
              "Không có mục đích cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là biện pháp kiểm soát rủi ro trong các quy trình nhạy cảm."
          },
          {
            "number": 3,
            "question": "Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì?",
            "options": [
              "Thông báo ngay cho cơ quan quản lý",
              "Tìm người chịu trách nhiệm",
              "Khoanh vùng để ngăn chặn lan rộng",
              "Viết báo cáo chi tiết"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Khoanh vùng ngay lập tức giúp hạn chế phạm vi thiệt hại trước khi thực hiện các bước tiếp theo."
          },
          {
            "number": 4,
            "question": "Khi chia sẻ thông tin với bên thứ ba, cần có gì?",
            "options": [
              "Ràng buộc hợp đồng rõ ràng về cách sử dụng và bảo vệ thông tin",
              "Không cần ràng buộc gì đặc biệt",
              "Chỉ cần thỏa thuận miệng",
              "Chỉ cần gửi email xác nhận"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ràng buộc hợp đồng bảo vệ tổ chức khi thông tin được chia sẻ ra bên ngoài."
          },
          {
            "number": 5,
            "question": "Sổ rủi ro thông tin nên bao gồm những gì?",
            "options": [
              "Chỉ cần liệt kê tên rủi ro",
              "Rủi ro, khả năng xảy ra, mức tác động, biện pháp giảm thiểu, người chịu trách nhiệm",
              "Chỉ cần ngày phát hiện",
              "Không cần lập sổ rủi ro"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các thành phần cần thiết để sổ rủi ro thực sự hữu ích cho quản lý."
          },
          {
            "number": 6,
            "question": "Nhân viên chuyển từ kế toán sang kinh doanh. Cách quản lý quyền hiệu quả nhất là gì?",
            "options": [
              "Cấp thêm quyền kinh doanh, giữ nguyên quyền kế toán",
              "Xóa tài khoản và tạo mới thủ công mọi quyền",
              "Không thay đổi gì",
              "Đổi vai trò của họ để quyền tự cập nhật theo vai trò mới"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Phân quyền theo vai trò giúp cập nhật quyền nhất quán."
          },
          {
            "number": 7,
            "question": "Một người vừa lập vừa duyệt chi trả lớn. Nguyên tắc nào bị vi phạm?",
            "options": [
              "Quyền tối thiểu",
              "Nguồn chân lý duy nhất",
              "Quy tắc đặt tên",
              "Phân tách nhiệm vụ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Phân tách nhiệm vụ giúp ngăn gian lận và sai sót."
          },
          {
            "number": 8,
            "question": "Năm bước ứng phó sự cố lộ dữ liệu theo thứ tự là gì?",
            "options": [
              "Thông báo, bỏ qua, quên, lặp lại, kết thúc",
              "Khoanh vùng, đánh giá, thông báo, khắc phục, rà soát",
              "Rà soát, khắc phục, đánh giá, khoanh vùng, thông báo",
              "Chờ, xem, đợi, bỏ qua, xóa"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là quy trình năm bước cần được viết sẵn."
          },
          {
            "number": 9,
            "question": "Doanh nghiệp chia sẻ danh sách khách hàng cho một bên thứ ba để chạy chiến dịch. Cần có gì?",
            "options": [
              "Thỏa thuận bằng văn bản về mục đích, phạm vi và trách nhiệm bảo vệ dữ liệu",
              "Chỉ lời hứa miệng",
              "Không cần gì vì đó là đối tác",
              "Gửi qua email cá nhân của nhân viên"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bên thứ ba cần ràng buộc rõ ràng."
          },
          {
            "number": 10,
            "question": "Mục nào thường có trong sổ rủi ro thông tin?",
            "options": [
              "Chỉ tên nhân viên",
              "Chỉ ngày tạo",
              "Mô tả rủi ro, khả năng xảy ra, tác động, biện pháp và người phụ trách",
              "Chỉ màu ưu tiên"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Sổ rủi ro giúp theo dõi và xử lý có chủ đích."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Doanh nghiệp trong môi trường số công cộng",
        "competency_line": "Năng lực 2.3 · Mức 5–6",
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
          "Khi có quy định mới, cần đánh giá tác động: quy trình nào cần thay đổi, hệ thống nào cần cập nhật, nhân sự nào cần được đào tạo lại.",
          "Các bước. 1. Lập bản đồ nghĩa vụ số theo lĩnh vực hoạt động: nghĩa vụ gì, theo quy định nào, do ai phụ trách, hạn nào. 2. Theo dõi thay đổi quy định từ nguồn chính thức (cơ quan ban hành), không dựa vào tin truyền miệng. 3. Khi có quy định mới, đánh giá tác động: quy trình nào đổi, hệ thống nào cập nhật, nhân sự nào cần đào tạo lại. 4. Xây quy trình chuẩn cho giao dịch với cơ quan quản lý: ai chuẩn bị hồ sơ, ai phê duyệt trước khi nộp, lưu ở đâu. 5. Lưu trữ hồ sơ điện tử đủ để phục vụ thanh tra, kiểm tra."
        ],
        "examples": [
          "Ví dụ trong công việc. Một doanh nghiệp bán lẻ có nghĩa vụ về thuế, hóa đơn điện tử, bảo hiểm xã hội, bảo vệ dữ liệu cá nhân khách hàng. Khi có quy định mới, nếu không ai chịu trách nhiệm theo dõi, doanh nghiệp chỉ biết khi bị nhắc nhở hoặc xử phạt."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không có người theo dõi quy định; chỉ biết quy định qua mạng xã hội; không đánh giá tác động khi quy định đổi; hồ sơ nộp xong không biết lưu ở đâu."
        ],
        "practice": [
          "Lập bản đồ nghĩa vụ số của doanh nghiệp, xác định ba rủi ro tuân thủ lớn nhất và đề xuất biện pháp."
        ],
        "deliverable": "Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cần lập bản đồ đầy đủ các nghĩa vụ tuân thủ số?",
            "options": [
              "Không cần thiết",
              "Chỉ để báo cáo hình thức",
              "Giúp tránh bỏ sót nghĩa vụ nào đó theo lĩnh vực hoạt động",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bản đồ đầy đủ giúp đảm bảo doanh nghiệp không bỏ sót nghĩa vụ pháp lý nào."
          },
          {
            "number": 2,
            "question": "Nguồn cập nhật quy định nên dựa vào đâu?",
            "options": [
              "Cổng thông tin chính thức của cơ quan quản lý",
              "Tin đồn trên mạng xã hội",
              "Ý kiến cá nhân của đồng nghiệp",
              "Không cần cập nhật thường xuyên"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nguồn chính thức đảm bảo thông tin chính xác và kịp thời."
          },
          {
            "number": 3,
            "question": "Khi có quy định mới, bước quan trọng cần làm là gì?",
            "options": [
              "Bỏ qua cho đến khi bị kiểm tra",
              "Chỉ thông báo bằng miệng cho nhân viên",
              "Đợi cơ quan quản lý nhắc nhở",
              "Đánh giá tác động lên quy trình, hệ thống và đào tạo nhân sự"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đánh giá tác động sớm giúp doanh nghiệp tuân thủ kịp thời và tránh sai sót."
          },
          {
            "number": 4,
            "question": "Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý?",
            "options": [
              "Không cần thiết nếu doanh nghiệp nhỏ",
              "Chỉ để tạo thủ tục rườm rà",
              "Đảm bảo tính nhất quán, giảm rủi ro sai sót",
              "Không có lợi ích cụ thể"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy trình chuẩn giúp đảm bảo mọi giao dịch được xử lý đúng cách và nhất quán."
          },
          {
            "number": 5,
            "question": "Lưu trữ hồ sơ điện tử phục vụ mục đích gì?",
            "options": [
              "Phục vụ tra cứu và chứng minh tuân thủ khi có thanh kiểm tra",
              "Chỉ để tiết kiệm giấy",
              "Không có mục đích cụ thể",
              "Chỉ cần lưu trong một tháng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hồ sơ lưu trữ đầy đủ là bằng chứng quan trọng khi có yêu cầu thanh kiểm tra."
          },
          {
            "number": 6,
            "question": "Vì sao cần bản đồ nghĩa vụ số của doanh nghiệp?",
            "options": [
              "Để trang trí báo cáo",
              "Để biết đầy đủ nghĩa vụ, người phụ trách và hạn thực hiện, tránh bỏ sót",
              "Để tăng số lượng thủ tục",
              "Không có lợi ích"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bản đồ giúp quản lý tuân thủ có hệ thống."
          },
          {
            "number": 7,
            "question": "Nguồn cập nhật quy định nên là gì?",
            "options": [
              "Nguồn chính thức của cơ quan ban hành quy định",
              "Tin chia sẻ trên mạng xã hội",
              "Lời đồn trong nhóm chat",
              "Bài đăng không rõ nguồn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tuân thủ cần dựa vào nguồn chính thức."
          },
          {
            "number": 8,
            "question": "Có quy định mới liên quan đến hóa đơn. Bước tiếp theo hợp lý nhất là gì?",
            "options": [
              "Chờ bị nhắc nhở",
              "Bỏ qua cho đến khi bị phạt",
              "Chỉ thông báo cho kế toán trưởng",
              "Đánh giá tác động: quy trình, hệ thống và nhân sự nào cần thay đổi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đánh giá tác động giúp thích ứng chủ động."
          },
          {
            "number": 9,
            "question": "Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý?",
            "options": [
              "Để tăng số người tham gia",
              "Đảm bảo nhất quán: ai chuẩn bị, ai duyệt, lưu hồ sơ ở đâu",
              "Để kéo dài thời gian xử lý",
              "Không cần vì mỗi lần một khác"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quy trình chuẩn giảm sai sót và hỗ trợ thanh kiểm tra."
          },
          {
            "number": 10,
            "question": "Hồ sơ nộp cho cơ quan quản lý nên được lưu như thế nào?",
            "options": [
              "Để trên máy cá nhân của người nộp",
              "Lưu điện tử có tổ chức, dễ tìm khi thanh tra, kiểm tra",
              "Xóa sau khi nộp",
              "Chỉ nhớ nội dung"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hồ sơ cần sẵn sàng phục vụ thanh tra, kiểm tra."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Dẫn dắt cộng tác nhóm phân tán",
        "competency_line": "Năng lực 2.4 · Mức 5–6",
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
          "Xây dựng văn hóa nhóm khi làm việc từ xa đòi hỏi nỗ lực có chủ đích hơn so với làm việc tại văn phòng — vì thiếu sự kết nối tự nhiên như gặp mặt trực tiếp, cần chủ động tạo ra qua các hoạt động kết nối định kỳ. Hiệu quả cộng tác liên bộ phận có thể đo lường qua thời gian hoàn thành các điểm bàn giao và tỷ lệ công việc phải làm lại do hiểu sai — hai chỉ số này phản ánh trực tiếp chất lượng phối hợp giữa các bộ phận.",
          "Các bước. 1. Chọn công cụ để cùng xây dựng và đồng sáng tạo tài nguyên, kiến thức ở quy mô nhiều nhóm. 2. Cân bằng đồng bộ (họp định kỳ) và bất đồng bộ (phần lớn công việc hằng ngày). 3. Xác định điểm bàn giao giữa các bộ phận và thông tin tối thiểu phải đi kèm. 4. Khi thấy căng thẳng trên chat, chuyển sang gọi video để làm rõ. 5. Chủ động tạo hoạt động kết nối định kỳ cho nhóm từ xa; đo hiệu quả cộng tác bằng chỉ số cụ thể như thời gian xử lý bàn giao, số lần làm lại."
        ],
        "examples": [
          "Ví dụ trong công việc. Một dự án có thiết kế ở Hà Nội, vận hành ở Đà Nẵng, kinh doanh ở TP. Hồ Chí Minh. Mỗi lần công việc chuyển từ nhóm này sang nhóm khác, thông tin bị mất một phần. Ngoài ra, cả ngày chỉ làm việc qua chat khiến một câu ngắn bị hiểu thành thái độ khó chịu."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không xác định điểm bàn giao; tranh luận căng thẳng qua chat; chỉ họp hoặc chỉ bất đồng bộ; không đo hiệu quả cộng tác."
        ],
        "practice": [
          "Thiết kế lại một quy trình liên bộ phận đang có vấn đề, chỉ ra điểm mất thông tin và đề xuất cơ chế khắc phục."
        ],
        "deliverable": "Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Điểm bàn giao trong quy trình liên bộ phận thường là nơi gì?",
            "options": [
              "Nơi công việc luôn suôn sẻ",
              "Nơi thông tin dễ bị thất lạc hoặc hiểu sai nhất",
              "Không có ý nghĩa đặc biệt",
              "Chỉ liên quan đến IT"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Điểm chuyển giao giữa các bộ phận là nơi dễ xảy ra sai sót thông tin nhất."
          },
          {
            "number": 2,
            "question": "Xung đột trong nhóm làm việc từ xa thường xuất phát từ đâu?",
            "options": [
              "Thường từ hiểu lầm qua văn bản do thiếu ngữ điệu, cử chỉ",
              "Luôn từ bất đồng thực chất về công việc",
              "Không có nguyên nhân cụ thể",
              "Chỉ do lỗi kỹ thuật"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giao tiếp qua văn bản dễ dẫn đến hiểu lầm hơn giao tiếp trực tiếp."
          },
          {
            "number": 3,
            "question": "Khi phát hiện căng thẳng qua chat, nên làm gì?",
            "options": [
              "Tiếp tục trao đổi qua chat để có bằng chứng",
              "Chủ động chuyển sang gọi video để làm rõ",
              "Phớt lờ và chờ tự hết",
              "Báo cáo ngay cho cấp trên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chuyển kênh giao tiếp phong phú hơn giúp làm rõ và giảm hiểu lầm."
          },
          {
            "number": 4,
            "question": "Vì sao cần nỗ lực có chủ đích để xây dựng văn hóa nhóm khi làm việc từ xa?",
            "options": [
              "Không cần thiết vì tự nhiên sẽ hình thành",
              "Chỉ cần cho nhóm lớn",
              "Không có lợi ích rõ ràng",
              "Vì thiếu tương tác trực tiếp nên cần các hoạt động kết nối chủ động"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Kết nối tự nhiên như gặp mặt trực tiếp không có sẵn, cần chủ động tạo ra."
          },
          {
            "number": 5,
            "question": "Chỉ số nào có thể dùng để đo lường hiệu quả cộng tác liên bộ phận?",
            "options": [
              "Số lượng email gửi đi",
              "Số cuộc họp tổ chức",
              "Không thể đo lường được",
              "Thời gian hoàn thành các điểm bàn giao, tỷ lệ làm lại do hiểu sai"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các chỉ số phản ánh trực tiếp chất lượng cộng tác giữa các bộ phận."
          },
          {
            "number": 6,
            "question": "Công việc thường bị mất thông tin ở đâu trong quy trình liên bộ phận?",
            "options": [
              "Tại điểm bàn giao giữa các bộ phận",
              "Trong giờ nghỉ trưa",
              "Ở khâu đặt tên tệp",
              "Khi mở máy tính"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Điểm bàn giao cần thông tin tối thiểu rõ ràng."
          },
          {
            "number": 7,
            "question": "Hai thành viên tranh cãi qua chat về một câu trả lời cộc lốc. Bạn nên làm gì?",
            "options": [
              "Nhắn thêm nhiều tin để thắng tranh luận",
              "Chủ động chuyển sang gọi video để làm rõ",
              "Phớt lờ hoàn toàn",
              "Đưa lên nhóm chung cho mọi người đánh giá"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhiều xung đột đến từ hiểu lầm qua văn bản."
          },
          {
            "number": 8,
            "question": "Mô hình làm việc cho nhóm phân tán nên kết hợp thế nào?",
            "options": [
              "Đồng bộ định kỳ cho phần cần thảo luận, bất đồng bộ cho phần lớn công việc hằng ngày",
              "Họp liên tục cả ngày",
              "Chỉ làm việc bất đồng bộ không bao giờ họp",
              "Không có mô hình cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cân bằng giữa hai hình thức."
          },
          {
            "number": 9,
            "question": "Vì sao cần chủ động xây dựng văn hóa nhóm khi làm việc từ xa?",
            "options": [
              "Vì làm từ xa không cần văn hóa",
              "Vì văn hóa tự hình thành đủ",
              "Vì thiếu sự kết nối tự nhiên như khi gặp mặt, cần tạo ra chủ động",
              "Vì mọi người đều thích làm việc một mình"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Cần nỗ lực có chủ đích."
          },
          {
            "number": 10,
            "question": "Chỉ số nào phù hợp để đo hiệu quả cộng tác liên bộ phận?",
            "options": [
              "Số lượng tin nhắn mỗi ngày",
              "Số tệp trong thư mục",
              "Thời gian xử lý ở điểm bàn giao và số lần phải làm lại",
              "Số cuộc họp mỗi tuần"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chỉ số gắn với kết quả bàn giao phản ánh đúng hiệu quả."
          }
        ]
      },
      {
        "module_number": 5,
        "title": "Văn hóa ứng xử số và xử lý khủng hoảng",
        "competency_line": "Năng lực 2.5 · Mức 5–6",
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
          "Ở mức lãnh đạo, việc áp dụng khía cạnh đa dạng văn hóa và thế hệ không còn dừng ở việc “lưu ý” như mức cơ bản, mà cần chủ động điều chỉnh chính sách ứng xử cho phù hợp với đội ngũ đa dạng — ví dụ khi soạn quy tắc ứng xử số cho một công ty có cả nhân viên Việt Nam và chuyên gia nước ngoài, cần cân nhắc để quy tắc không áp đặt một chuẩn mực văn hóa duy nhất lên mọi người, đồng thời vẫn đảm bảo tính nhất quán. Khi xử lý khủng hoảng truyền thông với đối tượng công chúng đa dạng, thông điệp cũng cần được điều chỉnh cách truyền tải (không phải nội dung cốt lõi) cho phù hợp với từng nhóm văn hóa, thế hệ tiếp nhận.",
          "Các bước. 1. Chuyển nghi thức số thành văn hóa thực hành: lãnh đạo làm gương, lời nói nhất quán với hành động. 2. Xây kịch bản khủng hoảng: xác nhận sự việc, tránh phản ứng vội vàng, thông điệp nhất quán, phân vai, ngưỡng leo thang. 3. Nguyên tắc phản hồi: thừa nhận vấn đề nếu có, không đổ lỗi hoặc bao biện. 4. Thiết lập cơ chế khiếu nại nội bộ độc lập với người bị khiếu nại, bảo vệ người khiếu nại khỏi trả đũa. 5. Điều chỉnh chính sách ứng xử cho đội ngũ đa dạng về văn hóa và thế hệ."
        ],
        "examples": [
          "Ví dụ trong công việc. Một video phàn nàn về sản phẩm lan truyền trên mạng sáng thứ Hai. Nếu công ty im lặng hoặc đổ lỗi cho khách, tình hình sẽ tệ hơn. Kịch bản đã chuẩn bị giúp 24 giờ đầu xác nhận sự việc, thống nhất thông điệp, phân vai và thông báo đúng người."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Phản ứng khi chưa xác nhận sự việc; mỗi người phát ngôn một kiểu; cơ chế khiếu nại đi qua chính người bị khiếu nại; quy tắc ứng xử viết đẹp nhưng lãnh đạo không thực hiện."
        ],
        "practice": [
          "Diễn tập xử lý một khủng hoảng truyền thông: xây kịch bản phản ứng 24 giờ đầu, phân vai xử lý, soạn thông điệp cho từng nhóm đối tượng."
        ],
        "deliverable": "Kịch bản ứng phó khủng hoảng và bộ thông điệp.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Trong 24 giờ đầu của khủng hoảng truyền thông, điều quan trọng nhất là gì?",
            "options": [
              "Xác nhận sự việc, chuẩn bị thông điệp nhất quán, tránh phản ứng thiếu thông tin",
              "Phản ứng vội vàng để có mặt sớm nhất",
              "Im lặng hoàn toàn",
              "Xóa mọi bằng chứng liên quan"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phản ứng có kiểm soát dựa trên thông tin xác thực quan trọng hơn tốc độ."
          },
          {
            "number": 2,
            "question": "Điều gì KHÔNG nên làm khi xử lý khủng hoảng truyền thông?",
            "options": [
              "Thừa nhận vấn đề nếu có",
              "Chuẩn bị thông điệp nhất quán",
              "Xác nhận sự việc trước khi phản hồi",
              "Im lặng hoàn toàn hoặc xóa bằng chứng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Im lặng hoặc xóa bằng chứng thường làm tình hình xấu hơn khi bị phát hiện."
          },
          {
            "number": 3,
            "question": "Ngưỡng leo thang trong xử lý khủng hoảng dùng để làm gì?",
            "options": [
              "Xác định khi nào cần chuyển vấn đề lên cấp quản lý cao hơn",
              "Không có tác dụng thực tế",
              "Chỉ áp dụng cho vấn đề nhỏ",
              "Để trì hoãn xử lý"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phân loại mức độ nghiêm trọng giúp xác định cấp độ xử lý phù hợp."
          },
          {
            "number": 4,
            "question": "Cơ chế khiếu nại nội bộ cần đảm bảo điều gì?",
            "options": [
              "Chỉ quản lý mới được khiếu nại",
              "Không cần kênh độc lập",
              "Người khiếu nại được bảo vệ khỏi trả đũa",
              "Khiếu nại phải công khai danh tính ngay từ đầu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bảo vệ người khiếu nại là yếu tố then chốt để cơ chế hoạt động hiệu quả."
          },
          {
            "number": 5,
            "question": "Khi soạn quy tắc ứng xử số cho đội ngũ đa văn hóa, cần lưu ý điều gì?",
            "options": [
              "Áp đặt một chuẩn mực văn hóa duy nhất cho tất cả",
              "Không cần quy tắc chung, mỗi người tự do",
              "Điều chỉnh phù hợp với sự đa dạng nhưng vẫn đảm bảo tính nhất quán chung",
              "Chỉ áp dụng quy tắc cho nhân viên nước ngoài"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Cần cân bằng giữa tôn trọng đa dạng văn hóa/thế hệ và duy trì tính nhất quán của tổ chức."
          },
          {
            "number": 6,
            "question": "Trong 24 giờ đầu của khủng hoảng truyền thông, việc nên ưu tiên là gì?",
            "options": [
              "Phản bác ngay trên mọi kênh",
              "Xóa mọi bình luận",
              "Chờ vài tuần cho lắng xuống",
              "Xác nhận sự việc, tránh phản ứng vội vàng, chuẩn bị thông điệp nhất quán"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Phản ứng vội vàng thường làm tình hình xấu hơn."
          },
          {
            "number": 7,
            "question": "Điều nào nên tránh khi phản hồi khủng hoảng?",
            "options": [
              "Thừa nhận vấn đề nếu có",
              "Đổ lỗi hoặc bao biện",
              "Thông điệp nhất quán",
              "Cập nhật thông tin đều đặn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nguyên tắc: thừa nhận nếu có, không đổ lỗi hay bao biện."
          },
          {
            "number": 8,
            "question": "Ngưỡng leo thang trong kịch bản khủng hoảng dùng để làm gì?",
            "options": [
              "Xác định khi nào sự việc phải chuyển lên cấp quản lý cao hơn",
              "Quyết định màu sắc thông điệp",
              "Tính số lượng bình luận",
              "Chọn công cụ soạn thảo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ngưỡng leo thang giúp xử lý đúng cấp."
          },
          {
            "number": 9,
            "question": "Cơ chế khiếu nại nội bộ cần đảm bảo điều gì?",
            "options": [
              "Mọi khiếu nại đều được công khai tên",
              "Người khiếu nại được bảo vệ khỏi trả đũa và có kênh độc lập với người bị khiếu nại",
              "Khiếu nại chỉ được gửi cho người bị khiếu nại",
              "Không cần quy trình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Độc lập và bảo vệ người khiếu nại là điều cốt lõi."
          },
          {
            "number": 10,
            "question": "Quy tắc ứng xử số của công ty có nhân sự đa văn hóa và đa thế hệ cần lưu ý gì?",
            "options": [
              "Chỉ giữ chuẩn của nhóm đông nhất",
              "Chủ động điều chỉnh để phù hợp với sự đa dạng thay vì áp một chuẩn duy nhất",
              "Bỏ qua khác biệt vì phức tạp",
              "Chỉ áp dụng cho nhân viên mới"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ở mức lãnh đạo, cần chủ động điều chỉnh chính sách."
          }
        ]
      },
      {
        "module_number": 6,
        "title": "Danh tính số của tổ chức",
        "competency_line": "Năng lực 2.6 · Mức 5–6",
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
          "Theo dõi danh tiếng trực tuyến có thể qua việc giám sát các đề cập đến thương hiệu trên mạng và phân tích cảm xúc của các đánh giá.",
          "Các bước. 1. Kiểm kê hiện diện số: liệt kê kênh chính thức, xác định kênh đang hoạt động, kênh bỏ không, người quản lý từng kênh. 2. Chuẩn hóa thông tin liên hệ giữa các kênh. 3. Viết chính sách phát ngôn: ai được phát ngôn chính thức, ở kênh nào, về chủ đề gì. 4. Giám sát mạo danh; khi phát hiện, báo cáo tới nền tảng liên quan theo quy trình định sẵn. 5. Theo dõi danh tiếng: giám sát các đề cập thương hiệu và phân tích cảm xúc đánh giá."
        ],
        "examples": [
          "Ví dụ trong công việc. Một doanh nghiệp có website, trang mạng xã hội, sàn thương mại điện tử và một tài khoản cũ không ai quản lý. Số điện thoại trên website khác với trên trang mạng xã hội, và một tài khoản giả mạo thương hiệu đang nhắn tin cho khách hàng. Đây là những vấn đề của danh tính số cấp tổ chức."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tài khoản bỏ không không ai quản lý; thông tin liên hệ mỗi nơi một kiểu; ai cũng tự phát ngôn nhân danh công ty; phát hiện mạo danh nhưng không biết báo cáo ở đâu."
        ],
        "practice": [
          "Kiểm kê toàn bộ hiện diện số của doanh nghiệp, phát hiện điểm không nhất quán hoặc rủi ro, và soạn chính sách phát ngôn cho nhân viên."
        ],
        "deliverable": "Báo cáo kiểm kê hiện diện số và chính sách phát ngôn.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ?",
            "options": [
              "Không cần thiết",
              "Phát hiện kênh bị bỏ hoang có thể là điểm yếu bị lợi dụng",
              "Chỉ để trang trí báo cáo",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kênh bị bỏ hoang hoặc quên quản lý là rủi ro tiềm ẩn cho danh tính thương hiệu."
          },
          {
            "number": 2,
            "question": "Chính sách phát ngôn cho nhân viên nhằm mục đích gì?",
            "options": [
              "Cấm nhân viên nói về công ty",
              "Không có mục đích cụ thể",
              "Xác định rõ ai được phát ngôn chính thức, tránh thông tin mâu thuẫn",
              "Chỉ áp dụng cho quản lý cấp cao"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chính sách rõ ràng giúp tránh tình trạng thông tin không chính xác lan truyền."
          },
          {
            "number": 3,
            "question": "Khi phát hiện tài khoản mạo danh doanh nghiệp, nên làm gì?",
            "options": [
              "Báo cáo tới nền tảng liên quan và thông báo khách hàng nếu cần",
              "Không cần làm gì",
              "Chờ khách hàng tự phát hiện",
              "Chỉ theo dõi mà không hành động"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Xử lý chủ động giúp giảm thiểu thiệt hại từ hành vi mạo danh."
          },
          {
            "number": 4,
            "question": "Sự thiếu nhất quán thông tin liên hệ giữa các kênh gây ra vấn đề gì?",
            "options": [
              "Không có vấn đề gì",
              "Chỉ ảnh hưởng đến thẩm mỹ",
              "Không liên quan đến uy tín",
              "Có thể khiến khách hàng nghi ngờ tính xác thực"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thiếu nhất quán làm giảm độ tin cậy trong mắt khách hàng."
          },
          {
            "number": 5,
            "question": "Theo dõi uy tín số bao gồm hoạt động nào?",
            "options": [
              "Chỉ đếm số lượt theo dõi",
              "Giám sát đề cập thương hiệu, phân tích cảm xúc đánh giá, có kế hoạch phản ứng",
              "Không cần theo dõi gì",
              "Chỉ quan tâm khi có khủng hoảng xảy ra"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Theo dõi chủ động giúp phát hiện sớm vấn đề trước khi trở thành khủng hoảng lớn."
          },
          {
            "number": 6,
            "question": "Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ?",
            "options": [
              "Để có nhiều kênh hơn",
              "Để quảng cáo thêm",
              "Không cần định kỳ",
              "Để phát hiện kênh bỏ không, thông tin không nhất quán và rủi ro mạo danh"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Kiểm kê là bước đầu của quản lý danh tính số tổ chức."
          },
          {
            "number": 7,
            "question": "Chính sách phát ngôn của doanh nghiệp quy định điều gì?",
            "options": [
              "Nhân viên không được dùng mạng xã hội",
              "Mọi nhân viên tự do phát ngôn",
              "Ai được phát ngôn chính thức, ở kênh nào, về chủ đề gì",
              "Chỉ cho phép phát ngôn bằng tiếng Anh"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chính sách làm rõ phạm vi phát ngôn chính thức."
          },
          {
            "number": 8,
            "question": "Bạn phát hiện một tài khoản mạo danh thương hiệu. Bước hợp lý là gì?",
            "options": [
              "Thu thập bằng chứng và báo cáo tới nền tảng theo quy trình định sẵn",
              "Bỏ qua",
              "Tranh cãi công khai với tài khoản đó",
              "Tạo thêm nhiều tài khoản chính thức"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần quy trình báo cáo rõ ràng."
          },
          {
            "number": 9,
            "question": "Số điện thoại khác nhau giữa website và mạng xã hội gây hậu quả gì?",
            "options": [
              "Khách hàng sẽ thích hơn",
              "Khách hàng dễ nghi ngờ độ tin cậy của doanh nghiệp",
              "Không ảnh hưởng gì",
              "Tăng bảo mật"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhất quán thông tin liên hệ là một phần của hiện diện số đáng tin cậy."
          },
          {
            "number": 10,
            "question": "Hoạt động nào thuộc theo dõi danh tiếng trực tuyến?",
            "options": [
              "Giám sát đề cập đến thương hiệu và phân tích cảm xúc của đánh giá",
              "Chỉ đếm số bài đăng của công ty",
              "Chỉ kiểm tra tốc độ website",
              "Chỉ xóa bình luận tiêu cực"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là hai hoạt động chính."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M2-A — “Bộ khung giao tiếp và cộng tác số của doanh nghiệp” (Assignment)",
      "context": "Bạn là người được giao xây dựng bộ khung giao tiếp và cộng tác số cho một doanh nghiệp quy mô vừa (50–200 nhân viên, nhiều bộ phận, một phần làm việc từ xa). Bạn tự chọn ngành và ghi giả định về quy mô, bộ phận, công cụ hiện có.",
      "requirements": "1. Thiết kế kiến trúc kênh giao tiếp tổ chức và kế hoạch truyền thông cho một thay đổi lớn: trình tự thông báo, thông điệp riêng cho từng nhóm, chỉ số đo hiệu quả. 2. Viết chính sách chia sẻ thông tin: nguyên tắc, phạm vi, ngoại lệ; ma trận phân quyền tối thiểu 4 vai trò × 5 nhóm dữ liệu; sổ rủi ro 6 mục; quy trình ứng phó sự cố lộ dữ liệu 5 bước. 3. Lập bản đồ nghĩa vụ số của doanh nghiệp, ba rủi ro tuân thủ lớn nhất và biện pháp. 4. Thiết kế lại một quy trình liên bộ phận: chỉ ra điểm bàn giao, điểm mất thông tin và cơ chế khắc phục; đề xuất chỉ số đo hiệu quả. 5. Soạn quy tắc ứng xử số và kịch bản ứng phó khủng hoảng 24 giờ đầu (phân vai, thông điệp, ngưỡng leo thang), có cơ chế khiếu nại nội bộ. 6. Kiểm kê hiện diện số mẫu, phát hiện điểm không nhất quán và soạn chính sách phát ngôn cho nhân viên. 7. Viết 1 trang tóm tắt cho ban giám đốc: ưu tiên triển khai, nguồn lực, rủi ro.",
      "deliverables": "Bộ hồ sơ gồm các mục 1–7 theo thứ tự.\nHình thức nộp. Một bộ tài liệu Word/PDF, kèm bảng tính nếu có (ma trận phân quyền, sổ rủi ro).",
      "rubric": [
        "Gợi ý. Thông tin dùng cho bài là thông tin giả định. Mỗi chính sách cần có người chịu trách nhiệm và cách đo kết quả.",
        "Tiêu chí",
        "Điểm",
        "Kiến trúc kênh giao tiếp tổ chức",
        "15",
        "Chính sách chia sẻ và mô hình phân quyền",
        "20",
        "Quy trình liên bộ phận và điểm bàn giao",
        "20",
        "Quy tắc ứng xử và kịch bản khủng hoảng",
        "25",
        "Chính sách phát ngôn và quản lý danh tính tổ chức",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Vì sao cần có trình tự thông báo khi truyền đạt thay đổi lớn?",
        "options": [
          "Để tin lan nhanh nhất",
          "Để tránh phải thông báo cho nhân viên",
          "Để quản lý được chuẩn bị trước và nhân viên không nghe tin qua kênh không chính thức",
          "Không cần trình tự"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Trình tự giúp thông tin nhất quán và đúng nguồn."
      },
      {
        "number": 2,
        "question": "Đo lường hiệu quả giao tiếp nội bộ nên dựa vào đâu?",
        "options": [
          "Tỉ lệ mở đọc thông báo và khảo sát mức độ hiểu đúng thông điệp",
          "Số tin nhắn gửi đi",
          "Số người trong danh bạ",
          "Độ dài của thông báo"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cần đo kết quả thực chất."
      },
      {
        "number": 3,
        "question": "Kiến trúc kênh giao tiếp nhằm mục đích gì?",
        "options": [
          "Xác định kênh nào dùng cho loại thông điệp nào",
          "Làm đẹp giao diện",
          "Tăng số kênh",
          "Giảm số nhân viên"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Giúp tránh quá tải và nhầm lẫn."
      },
      {
        "number": 4,
        "question": "Khi cùng một thông điệp gửi cho nhiều nhóm đối tượng, nên làm gì?",
        "options": [
          "Giữ nguyên cho tất cả",
          "Điều chỉnh cách trình bày theo mối quan tâm từng nhóm",
          "Chỉ gửi nhóm lớn nhất",
          "Chỉ gửi qua email"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đối tượng khác nhau cần cách tiếp cận khác nhau."
      },
      {
        "number": 5,
        "question": "Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân?",
        "options": [
          "Tốn ít thời gian thiết lập ban đầu nhất",
          "Không cần rà soát",
          "Quản lý nhất quán, dễ cập nhật khi nhân sự thay đổi",
          "Cho phép mọi người có mọi quyền"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Phân quyền theo vai trò giúp quản lý gọn và kiểm soát được."
      },
      {
        "number": 6,
        "question": "Mục đích của phân tách nhiệm vụ là gì?",
        "options": [
          "Tăng số người làm việc",
          "Giảm lương",
          "Ngăn một người kiểm soát toàn bộ một quy trình nhạy cảm, giảm gian lận và sai sót",
          "Giảm dung lượng dữ liệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Một người không nên vừa lập vừa duyệt."
      },
      {
        "number": 7,
        "question": "Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì?",
        "options": [
          "Thông báo cho toàn thế giới",
          "Khoanh vùng sự cố",
          "Xóa nhật ký",
          "Chờ xem có ai phàn nàn không"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Phải xác định phạm vi trước khi hành động tiếp."
      },
      {
        "number": 8,
        "question": "Vì sao cần bản đồ nghĩa vụ tuân thủ số?",
        "options": [
          "Để tăng giấy tờ",
          "Để trang trí",
          "Không cần",
          "Để biết đầy đủ nghĩa vụ, người phụ trách và hạn, tránh bỏ sót"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bản đồ giúp tuân thủ có hệ thống."
      },
      {
        "number": 9,
        "question": "Nguồn cập nhật quy định nên là gì?",
        "options": [
          "Tin chia sẻ trên mạng xã hội",
          "Lời đồn",
          "Bài không rõ nguồn",
          "Nguồn chính thức của cơ quan ban hành"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Tuân thủ cần nguồn chính thức."
      },
      {
        "number": 10,
        "question": "Có quy định mới. Việc cần làm là gì?",
        "options": [
          "Chờ bị nhắc",
          "Đánh giá tác động lên quy trình, hệ thống và nhân sự",
          "Bỏ qua",
          "Chỉ báo cho một người"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đánh giá tác động giúp thích ứng chủ động."
      },
      {
        "number": 11,
        "question": "Điểm bàn giao trong quy trình liên bộ phận thường là nơi nào?",
        "options": [
          "Nơi an toàn tuyệt đối",
          "Nơi không cần quan tâm",
          "Nơi chỉ có một bộ phận",
          "Nơi dễ mất thông tin"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bàn giao cần thông tin tối thiểu đi kèm."
      },
      {
        "number": 12,
        "question": "Xung đột nhóm từ xa thường xuất phát từ đâu?",
        "options": [
          "Từ chất lượng mạng",
          "Từ màu giao diện",
          "Hiểu lầm qua văn bản nhiều hơn bất đồng thực chất",
          "Từ số lượng tệp"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tin nhắn ngắn dễ bị hiểu sai."
      },
      {
        "number": 13,
        "question": "Khi thấy dấu hiệu căng thẳng trên chat, nên làm gì?",
        "options": [
          "Chuyển sang gọi video để làm rõ",
          "Nhắn thêm để thắng tranh luận",
          "Phớt lờ",
          "Báo cáo ngay cho giám đốc"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Kênh phong phú hơn giúp giảm hiểu lầm."
      },
      {
        "number": 14,
        "question": "Điều quan trọng nhất trong 24 giờ đầu khủng hoảng truyền thông là gì?",
        "options": [
          "Phản bác mọi chỉ trích",
          "Xác nhận sự việc, tránh phản ứng vội vàng, chuẩn bị thông điệp nhất quán",
          "Xóa bình luận",
          "Không làm gì"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Phản ứng vội vàng thường làm tình hình xấu hơn."
      },
      {
        "number": 15,
        "question": "Điều nào KHÔNG nên làm khi phản hồi khủng hoảng?",
        "options": [
          "Thừa nhận vấn đề nếu có",
          "Giữ thông điệp nhất quán",
          "Cập nhật đều đặn",
          "Đổ lỗi hoặc bao biện"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Không đổ lỗi, không bao biện."
      },
      {
        "number": 16,
        "question": "Cơ chế khiếu nại nội bộ cần đảm bảo điều gì?",
        "options": [
          "Công khai danh tính người khiếu nại",
          "Bảo vệ người khiếu nại khỏi trả đũa và có kênh độc lập",
          "Chỉ gửi cho người bị khiếu nại",
          "Không cần quy trình"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Độc lập và bảo vệ là yếu tố cốt lõi."
      },
      {
        "number": 17,
        "question": "Khi quản lý cấp cao không thực hiện quy tắc ứng xử số mà chỉ yêu cầu nhân viên, điều gì xảy ra?",
        "options": [
          "Quy tắc vẫn hiệu quả hoàn toàn",
          "Nhân viên tuân thủ nhiều hơn",
          "Quy tắc mất hiệu lực thực tế vì thiếu nhất quán giữa lời nói và hành động",
          "Không có ảnh hưởng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Văn hóa thực hành cần sự làm gương của lãnh đạo."
      },
      {
        "number": 18,
        "question": "Vì sao cần kiểm kê hiện diện số định kỳ?",
        "options": [
          "Phát hiện kênh bỏ không, thông tin không nhất quán, rủi ro mạo danh",
          "Để có thêm kênh",
          "Để quảng cáo",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Kiểm kê là bước đầu của quản lý danh tính số tổ chức."
      },
      {
        "number": 19,
        "question": "Chính sách phát ngôn nhằm mục đích gì?",
        "options": [
          "Cấm nhân viên dùng mạng xã hội",
          "Cho mọi người nói tùy ý",
          "Giảm số kênh",
          "Quy định ai được phát ngôn chính thức, ở đâu, về chủ đề gì"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Làm rõ phạm vi phát ngôn chính thức."
      },
      {
        "number": 20,
        "question": "Phát hiện tài khoản mạo danh thương hiệu, nên làm gì?",
        "options": [
          "Thu thập bằng chứng và báo cáo nền tảng theo quy trình định sẵn",
          "Bỏ qua",
          "Tranh cãi công khai",
          "Tạo thêm tài khoản"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cần quy trình báo cáo rõ ràng."
      }
    ]
  },
  "M3-F": {
    "code": "M3-F",
    "title": "TẠO LẬP NỘI DUNG SỐ CƠ BẢN",
    "domain_number": 3,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Tạo tài liệu công việc cơ bản",
        "competency_line": "Năng lực 3.1 · Mức 1–2",
        "objectives": [
          "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản",
          "Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Định dạng văn bản: cách trình bày chữ (tiêu đề, đoạn, danh sách, in đậm) giúp người đọc dễ theo dõi nội dung",
          "Ô, hàng, cột: đơn vị cơ bản trong bảng tính — ô là giao điểm của một hàng và một cột"
        ],
        "body": [
          "Phát triển nội dung số nghĩa là tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau. Định dạng văn bản cơ bản gồm tiêu đề, đoạn, danh sách, in đậm. Bảng tính tổ chức dữ liệu theo ô, hàng và cột. Trình chiếu nên tuân theo nguyên tắc đơn giản: mỗi slide truyền tải một ý chính.",
          "Khi chọn định dạng, cần dựa vào mục đích sử dụng: báo cáo chi tiết dùng văn bản, số liệu cần tính toán dùng bảng tính, thuyết trình dùng trình chiếu. Khi cần gửi tài liệu để người khác không chỉnh sửa được, nên xuất ra định dạng PDF — đây chính là ví dụ cụ thể của khái niệm nội dung số: nội dung tồn tại dưới dạng dữ liệu được mã hóa, có thể tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính.",
          "Các bước chọn và tạo tài liệu. 1. Xác định mục đích: đọc kỹ, tính toán hay thuyết trình. 2. Chọn định dạng: văn bản, bảng tính hoặc trình chiếu. 3. Văn bản: dùng tiêu đề, đoạn, danh sách; in đậm chỉ cho ý then chốt. 4. Bảng tính: mỗi hàng là một bản ghi, mỗi cột là một thuộc tính; có tiêu đề cột. 5. Trình chiếu: mỗi slide một ý chính, chữ vừa đủ đọc. 6. Gửi cho người không cần sửa: xuất PDF."
        ],
        "examples": [
          "Ví dụ trong công việc. Cùng một nội dung “kết quả bán hàng tháng này” có thể thành ba sản phẩm: văn bản báo cáo chi tiết cho quản lý, bảng tính số liệu để đối chiếu và tính toán, bản trình chiếu để báo cáo trong cuộc họp. Chọn đúng định dạng giúp người nhận làm được việc ngay."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Dùng văn bản để tính toán; nhồi quá nhiều chữ vào slide; in đậm toàn bộ đoạn; gửi tệp sửa được khi chỉ cần người nhận đọc."
        ],
        "practice": [
          "Tạo ba tài liệu cho cùng một nội dung công việc: một văn bản, một bảng tính, một trình chiếu — và giải thích khi nào dùng loại nào."
        ],
        "deliverable": "3 tệp kèm giải thích lựa chọn định dạng.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khi cần trình bày số liệu để tính toán, nên dùng định dạng nào?",
            "options": [
              "Văn bản",
              "Bảng tính",
              "Trình chiếu",
              "Hình ảnh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bảng tính hỗ trợ tính toán và tổ chức dữ liệu theo ô, hàng, cột."
          },
          {
            "number": 2,
            "question": "Một slide trình chiếu hiệu quả nên có đặc điểm gì?",
            "options": [
              "Càng nhiều chữ càng tốt",
              "Dùng nhiều màu sắc sặc sỡ",
              "Không cần hình ảnh minh họa",
              "Mỗi slide truyền tải một ý chính, chữ đủ lớn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Slide đơn giản, tập trung một ý chính giúp người xem dễ tiếp thu."
          },
          {
            "number": 3,
            "question": "Vì sao nên xuất tài liệu ra PDF trước khi gửi cho người khác?",
            "options": [
              "Để người nhận không chỉnh sửa được nội dung",
              "Để giảm dung lượng",
              "Để tăng tốc độ tải",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "PDF cố định định dạng, tránh nội dung bị chỉnh sửa ngoài ý muốn."
          },
          {
            "number": 4,
            "question": "Trong bảng tính, mỗi hàng thường đại diện cho điều gì?",
            "options": [
              "Một thuộc tính",
              "Một công thức",
              "Không có ý nghĩa cụ thể",
              "Một bản ghi (ví dụ một khách hàng)"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Hàng thường thể hiện một bản ghi, cột thể hiện thuộc tính."
          },
          {
            "number": 5,
            "question": "In đậm trong văn bản nên dùng khi nào?",
            "options": [
              "Cho toàn bộ đoạn văn",
              "Để nhấn mạnh từ khóa quan trọng, không lạm dụng",
              "Không bao giờ nên dùng",
              "Chỉ dùng cho tiêu đề"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "In đậm hiệu quả nhất khi dùng có chọn lọc để nhấn mạnh."
          },
          {
            "number": 6,
            "question": "Bạn cần theo dõi chi phí hằng ngày và tính tổng theo tuần. Nên dùng định dạng nào?",
            "options": [
              "Văn bản",
              "Bảng tính",
              "Trình chiếu",
              "Ảnh chụp màn hình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Số liệu cần tính toán nên dùng bảng tính."
          },
          {
            "number": 7,
            "question": "Bạn cần báo cáo kết quả trong cuộc họp mười phút trước nhiều người. Định dạng phù hợp nhất là gì?",
            "options": [
              "Một văn bản dài mười trang",
              "Bảng tính nhiều sheet",
              "Trình chiếu với mỗi slide một ý chính",
              "Tệp âm thanh"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thuyết trình dùng trình chiếu."
          },
          {
            "number": 8,
            "question": "Trong bảng tính quản lý khách hàng, mỗi cột thường biểu diễn điều gì?",
            "options": [
              "Một thuộc tính của dữ liệu, ví dụ tên hoặc số điện thoại",
              "Một khách hàng riêng",
              "Một trang in",
              "Một màu nền"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hàng là bản ghi, cột là thuộc tính."
          },
          {
            "number": 9,
            "question": "Bạn cần gửi bản báo giá cuối cho khách xem mà không cho sửa. Nên làm gì?",
            "options": [
              "Gửi tệp văn bản gốc",
              "Gửi bản trình chiếu gốc",
              "Xuất ra PDF rồi gửi",
              "Chụp ảnh màn hình từng phần"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "PDF giữ bố cục và hạn chế chỉnh sửa."
          },
          {
            "number": 10,
            "question": "Dùng danh sách trong văn bản có lợi gì?",
            "options": [
              "Giúp người đọc nắm nhanh các ý ngang hàng",
              "Làm văn bản dài hơn",
              "Giảm chất lượng nội dung",
              "Thay thế tiêu đề"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Danh sách làm cấu trúc rõ ràng."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Chỉnh sửa và tái sử dụng nội dung",
        "competency_line": "Năng lực 3.2 · Mức 1–2",
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
          "Khi sao chép nội dung từ nguồn khác, có hai lựa chọn: dán giữ định dạng hoặc dán văn bản thuần — dán văn bản thuần thường an toàn hơn khi muốn giữ tài liệu nhất quán. Mẫu tài liệu của doanh nghiệp giúp tiết kiệm thời gian và đảm bảo tính nhất quán. Trước khi gửi bất kỳ tài liệu nào, nên đọc lại toàn bộ một lượt để phát hiện lỗi.",
          "Các bước. 1. Sao lưu bản gốc bằng “Lưu thành” trước khi sửa. 2. Áp dụng mẫu tài liệu của doanh nghiệp (tiêu đề, phông chữ, lề). 3. Khi dán nội dung từ nguồn khác, ưu tiên dán văn bản thuần rồi định dạng lại theo mẫu. 4. Chèn bảng số liệu và hình ảnh; kiểm tra kích thước và vị trí. 5. Kiểm tra lần cuối: chính tả, số liệu, định dạng; sau đó xuất PDF."
        ],
        "examples": [
          "Ví dụ trong công việc. Đồng nghiệp gửi bản nháp báo cáo gồm nhiều kiểu phông chữ, đoạn thụt lề lộn xộn vì dán từ nhiều nguồn. Việc của bạn là đưa về mẫu của doanh nghiệp, chèn bảng số liệu và một hình ảnh, rồi xuất PDF mà không làm hỏng nội dung có sẵn."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Sửa trực tiếp trên bản gốc; dán giữ định dạng khiến phông chữ lộn xộn; quên kiểm tra sau khi chèn bảng; gửi đi mà không đọc lại."
        ],
        "practice": [
          "Nhận một tài liệu thô, chỉnh sửa theo mẫu của doanh nghiệp, chèn một bảng số liệu và một hình ảnh, rồi xuất PDF."
        ],
        "deliverable": "Tài liệu hoàn chỉnh theo mẫu và bản PDF.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Dán văn bản thuần khác dán giữ định dạng như thế nào?",
            "options": [
              "Không có khác biệt",
              "Dán văn bản thuần bỏ định dạng gốc, dán giữ định dạng thì giữ nguyên",
              "Dán văn bản thuần nhanh hơn",
              "Dán giữ định dạng luôn tốt hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là điểm khác biệt cốt lõi giữa hai cách dán."
          },
          {
            "number": 2,
            "question": "Vì sao nên dùng mẫu tài liệu có sẵn của doanh nghiệp?",
            "options": [
              "Không có lý do gì đặc biệt",
              "Chỉ để tuân thủ quy định",
              "Mẫu luôn đẹp hơn tự thiết kế",
              "Tiết kiệm thời gian và đảm bảo tính nhất quán"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mẫu có sẵn giúp tiết kiệm công sức và giữ hình ảnh chuyên nghiệp thống nhất."
          },
          {
            "number": 3,
            "question": "Khi nào nên chọn dán văn bản thuần thay vì dán giữ định dạng?",
            "options": [
              "Không bao giờ",
              "Khi cần giữ nguyên màu sắc gốc",
              "Khi muốn giữ tài liệu đích nhất quán về định dạng",
              "Không có sự khác biệt về khi nào nên dùng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Dán văn bản thuần giúp tránh xung đột định dạng với tài liệu đích."
          },
          {
            "number": 4,
            "question": "Trước khi gửi tài liệu, bước cuối cùng nên làm là gì?",
            "options": [
              "Không cần kiểm tra lại",
              "Đọc lại toàn bộ để phát hiện lỗi chính tả và định dạng",
              "Gửi ngay để tiết kiệm thời gian",
              "Chỉ cần kiểm tra tiêu đề"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Rà soát lại giúp phát hiện lỗi trước khi tài liệu đến tay người nhận."
          },
          {
            "number": 5,
            "question": "Khi chèn bảng số liệu từ bảng tính vào văn bản, cần chú ý điều gì?",
            "options": [
              "Không cần chú ý gì đặc biệt",
              "Kiểm tra định dạng số và đơn vị hiển thị đúng",
              "Chỉ cần chèn càng nhanh càng tốt",
              "Luôn phải vẽ lại bảng thủ công"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Định dạng số có thể thay đổi khi chuyển giữa các ứng dụng, cần kiểm tra lại."
          },
          {
            "number": 6,
            "question": "Bạn dán một đoạn từ trang web vào báo cáo và thấy phông chữ khác hẳn. Lần sau nên làm gì?",
            "options": [
              "Giữ nguyên định dạng nguồn",
              "Xóa toàn bộ báo cáo",
              "Dán văn bản thuần rồi định dạng theo mẫu",
              "Chuyển sang bảng tính"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Dán văn bản thuần giúp giữ tài liệu nhất quán."
          },
          {
            "number": 7,
            "question": "Vì sao nên “Lưu thành” bản mới trước khi chỉnh sửa tài liệu của người khác?",
            "options": [
              "Để giữ bản gốc phòng khi cần quay lại",
              "Để tệp nhẹ hơn",
              "Để đổi định dạng",
              "Không có lý do"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bản gốc là cơ sở để so sánh và khôi phục."
          },
          {
            "number": 8,
            "question": "Lợi ích chính của mẫu tài liệu doanh nghiệp là gì?",
            "options": [
              "Tiết kiệm thời gian và đảm bảo các tài liệu nhất quán",
              "Làm tài liệu dài hơn",
              "Thay thế việc đọc lại",
              "Chỉ để trang trí"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Mẫu giúp trình bày đồng nhất."
          },
          {
            "number": 9,
            "question": "Bước nào nên làm ngay trước khi xuất PDF gửi đi?",
            "options": [
              "Xóa tiêu đề",
              "Đổi tên thành tên ngẫu nhiên",
              "Thêm nhiều hình ảnh",
              "Kiểm tra chính tả, số liệu và định dạng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Kiểm tra lần cuối tránh lỗi bị gửi đi."
          },
          {
            "number": 10,
            "question": "Khi chèn bảng từ bảng tính vào văn bản, cần chú ý điều gì?",
            "options": [
              "Bảng có vừa trang, dễ đọc và số liệu chính xác không",
              "Bảng càng nhỏ càng tốt",
              "Không cần kiểm tra số liệu",
              "Chỉ cần chèn đúng một ô"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bảng cần dễ đọc và đúng số liệu."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Nguyên tắc bản quyền cơ bản",
        "competency_line": "Năng lực 3.3 · Mức 1–2",
        "objectives": [
          "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Bản quyền: quyền pháp lý bảo vệ tác phẩm sáng tạo (hình ảnh, văn bản, âm nhạc) khỏi việc sử dụng trái phép",
          "Giấy phép sử dụng: điều kiện mà chủ sở hữu tác phẩm cho phép người khác sử dụng tác phẩm của mình"
        ],
        "body": [
          "Thực thi bản quyền và giấy phép nghĩa là hiểu được cách áp dụng bản quyền cho nội dung số. Bản quyền bảo vệ hầu hết các loại tác phẩm sáng tạo: hình ảnh, văn bản, âm nhạc, video. Một hiểu lầm phổ biến là nghĩ rằng bất cứ thứ gì tìm được trên mạng đều có thể tự do sử dụng.",
          "Nhiều nền tảng cung cấp hình ảnh, nhạc, phông chữ miễn phí nhưng đi kèm điều kiện sử dụng cụ thể. Khi sử dụng nội dung của người khác được phép, cần ghi nguồn đầy đủ theo yêu cầu của giấy phép.",
          "Các bước. 1. Giả định nội dung đang tìm thấy có chủ sở hữu và được bảo vệ bản quyền. 2. Tìm trên nguồn cung cấp nội dung miễn phí hoặc có giấy phép rõ ràng. 3. Đọc điều kiện sử dụng: có cho dùng thương mại không, có phải ghi nguồn không. 4. Ghi nguồn đầy đủ theo yêu cầu của giấy phép. 5. Lưu lại bảng nguồn và giấy phép của từng nội dung đã dùng."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên marketing cần ảnh minh họa cho bài giới thiệu sản phẩm. Tìm thấy ảnh đẹp trên mạng nhưng không rõ nguồn, nếu đưa vào bài đăng thương mại có thể vi phạm bản quyền. Cách làm an toàn là lấy ảnh từ nguồn cho phép sử dụng thương mại và ghi nguồn đúng yêu cầu."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Nghĩ rằng ảnh tìm được trên mạng là dùng tự do; thấy chữ “miễn phí” là dùng cho mọi mục đích; quên ghi nguồn; không lưu lại bằng chứng quyền sử dụng."
        ],
        "practice": [
          "Tìm năm hình ảnh phù hợp cho một tài liệu công việc từ nguồn được phép sử dụng thương mại, ghi rõ giấy phép của từng hình."
        ],
        "deliverable": "Bảng 5 hình ảnh kèm nguồn và loại giấy phép.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Tìm được một hình ảnh trên mạng có nghĩa là được tự do sử dụng không?",
            "options": [
              "Sai, cần kiểm tra điều kiện giấy phép trước khi sử dụng",
              "Đúng, tìm được là được dùng",
              "Chỉ đúng với hình ảnh cũ",
              "Chỉ đúng nếu không ghi tên tác giả"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tìm được không đồng nghĩa với việc được phép sử dụng, đặc biệt cho mục đích thương mại."
          },
          {
            "number": 2,
            "question": "Khi sử dụng nội dung có giấy phép yêu cầu ghi nguồn, cần làm gì?",
            "options": [
              "Không cần ghi gì cả",
              "Chỉ cần ghi tên trang tải về",
              "Ghi tên tác giả và đường dẫn tới nguồn gốc theo yêu cầu giấy phép",
              "Ghi nguồn là tùy chọn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ghi nguồn đúng yêu cầu giấy phép là điều kiện bắt buộc để sử dụng hợp pháp."
          },
          {
            "number": 3,
            "question": "Nội dung “miễn phí” trên mạng có luôn được dùng cho mục đích thương mại không?",
            "options": [
              "Luôn được phép",
              "Miễn phí nghĩa là không có điều kiện gì",
              "Chỉ áp dụng cho hình ảnh",
              "Không nhất thiết, cần đọc điều kiện giấy phép cụ thể"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "“Miễn phí” có thể đi kèm điều kiện hạn chế mục đích sử dụng."
          },
          {
            "number": 4,
            "question": "Bản quyền bảo vệ những loại tác phẩm nào?",
            "options": [
              "Chỉ văn bản",
              "Chỉ hình ảnh",
              "Hình ảnh, văn bản, âm nhạc, video, phông chữ thiết kế riêng",
              "Chỉ nội dung có đăng ký chính thức"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bản quyền bảo vệ đa dạng các loại tác phẩm sáng tạo."
          },
          {
            "number": 5,
            "question": "Vi phạm bản quyền vô ý có gây rủi ro không?",
            "options": [
              "Không, chỉ vi phạm cố ý mới có rủi ro",
              "Có, vi phạm dù vô ý vẫn tạo ra rủi ro pháp lý và uy tín",
              "Chỉ có rủi ro với doanh nghiệp lớn",
              "Không có rủi ro thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Rủi ro pháp lý tồn tại kể cả khi vi phạm không cố ý, do đó cần kiểm tra trước khi sử dụng."
          },
          {
            "number": 6,
            "question": "Bạn tải ảnh từ kết quả tìm kiếm để làm poster bán hàng. Điều gì đúng?",
            "options": [
              "Cần kiểm tra giấy phép vì tìm thấy ảnh không có nghĩa là được dùng tự do",
              "Được dùng tự do vì ai cũng xem được",
              "Chỉ cần xóa logo",
              "Được dùng nếu ảnh đẹp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bản quyền bảo vệ hầu hết tác phẩm sáng tạo."
          },
          {
            "number": 7,
            "question": "Nội dung ghi “miễn phí” có luôn dùng được cho mục đích thương mại không?",
            "options": [
              "Không, cần đọc điều kiện sử dụng cụ thể",
              "Luôn dùng được",
              "Chỉ dùng được cho giáo dục",
              "Không bao giờ dùng được"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Miễn phí không đồng nghĩa với mọi quyền sử dụng."
          },
          {
            "number": 8,
            "question": "Giấy phép yêu cầu ghi nguồn. Bạn cần làm gì?",
            "options": [
              "Bỏ qua",
              "Ghi nguồn đầy đủ theo yêu cầu của giấy phép",
              "Ghi tên mình là tác giả",
              "Chỉ ghi nếu được hỏi"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ghi nguồn là điều kiện sử dụng."
          },
          {
            "number": 9,
            "question": "Bản quyền bảo vệ những loại tác phẩm nào?",
            "options": [
              "Chỉ sách in",
              "Chỉ nhạc có lời",
              "Chỉ tác phẩm của người nổi tiếng",
              "Hình ảnh, văn bản, âm nhạc, video và nhiều loại tác phẩm sáng tạo khác"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Bản quyền bảo vệ hầu hết loại tác phẩm sáng tạo."
          },
          {
            "number": 10,
            "question": "Vì sao nên lưu bảng nguồn và giấy phép của từng nội dung đã dùng?",
            "options": [
              "Để tăng dung lượng thư mục",
              "Để chứng minh quyền sử dụng và dễ kiểm tra lại khi cần",
              "Để thay thế việc ghi nguồn",
              "Không có lý do"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hồ sơ nguồn giúp chứng minh việc sử dụng hợp pháp."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Làm quen tư duy tính toán",
        "competency_line": "Năng lực 3.4 · Mức 1–2",
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
          "Công thức bảng tính cơ bản như tính tổng, tính trung bình, đếm số lượng giúp xử lý số liệu nhanh hơn. Một nguyên tắc quan trọng: máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người.",
          "Các bước. 1. Viết công việc thành các bước tuần tự, mỗi bước một hành động cụ thể. 2. Đánh dấu bước có điều kiện nếu-thì (ví dụ: nếu đơn hàng trên 5 triệu thì giảm giá 5%). 3. Đánh dấu bước lặp đi lặp lại thủ công. 4. Dùng công thức cơ bản của bảng tính (tổng, trung bình, đếm) cho phần tính toán. 5. Đọc lại các bước như thể bạn là máy tính: có chỗ nào mơ hồ không?"
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên văn phòng mỗi sáng làm cùng một việc: tải bảng doanh thu, lọc đơn hàng trên 5 triệu, áp giảm giá 5% rồi gửi cho quản lý. Khi viết thành từng bước rõ ràng, bạn thấy bước nào có điều kiện, bước nào lặp lại, và bước nào có thể giao cho công thức bảng tính xử lý."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Viết bước quá chung chung (“xử lý số liệu”); quên trường hợp ngoại lệ; tính tay những việc bảng tính làm được; mong máy tính tự hiểu ý."
        ],
        "practice": [
          "Viết ra quy trình một công việc hàng ngày của mình thành các bước rõ ràng, chỉ ra bước nào có điều kiện và bước nào lặp lại."
        ],
        "deliverable": "Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cần diễn đạt công việc thành các bước cụ thể, không mơ hồ?",
            "options": [
              "Không quan trọng",
              "Chỉ để trình bày đẹp",
              "Không có lý do cụ thể",
              "Máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là nguyên tắc nền tảng của tư duy tính toán."
          },
          {
            "number": 2,
            "question": "“Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc gì?",
            "options": [
              "Bước tuần tự",
              "Công thức tổng",
              "Điều kiện nếu-thì",
              "Vòng lặp"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là cấu trúc logic điều kiện, hành động chỉ xảy ra khi điều kiện được thỏa mãn."
          },
          {
            "number": 3,
            "question": "Hàm điều kiện trong bảng tính có tác dụng gì?",
            "options": [
              "Tự động đưa ra kết quả khác nhau tùy giá trị đầu vào",
              "Chỉ để trang trí",
              "Không có tác dụng thực tế",
              "Chỉ dùng để đếm số"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hàm điều kiện thực hiện logic nếu-thì một cách tự động."
          },
          {
            "number": 4,
            "question": "Nhận biết công việc lặp đi lặp lại thủ công có ích gì?",
            "options": [
              "Là bước đầu để nghĩ đến khả năng tự động hóa",
              "Không có ích gì",
              "Chỉ để phàn nàn về khối lượng công việc",
              "Không liên quan đến tư duy tính toán"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là bước chuẩn bị quan trọng cho việc tự động hóa ở mức cao hơn."
          },
          {
            "number": 5,
            "question": "Điều gì KHÔNG đúng về máy tính khi thực hiện chỉ dẫn?",
            "options": [
              "Cần chỉ dẫn chính xác",
              "Thực hiện đúng theo logic được lập trình",
              "Không tự suy luận ngoài chỉ dẫn đã cho",
              "Có thể tự “hiểu ý” khi chỉ dẫn mơ hồ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Máy tính không thể tự suy luận ý định khi chỉ dẫn không rõ ràng, khác với con người."
          },
          {
            "number": 6,
            "question": "Vì sao câu “làm cho đẹp” không phải là một hướng dẫn tốt cho máy tính?",
            "options": [
              "Vì máy tính không hiểu tiếng Việt",
              "Vì máy tính cần chỉ dẫn chính xác, không thể hiểu ý như con người",
              "Vì câu quá dài",
              "Vì máy tính không làm việc nhóm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Máy tính cần chỉ dẫn chính xác tuyệt đối."
          },
          {
            "number": 7,
            "question": "“Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc nào?",
            "options": [
              "Điều kiện nếu-thì",
              "Vòng lặp",
              "Chuỗi tuần tự thuần túy",
              "Định dạng văn bản"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là điều kiện rẽ nhánh."
          },
          {
            "number": 8,
            "question": "Công thức nào của bảng tính phù hợp để tính tổng doanh thu cả tuần?",
            "options": [
              "Hàm đếm số ô trống",
              "Hàm tính tổng",
              "Hàm đổi màu",
              "Hàm đổi tên tệp"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Công thức cơ bản giúp xử lý số liệu nhanh hơn."
          },
          {
            "number": 9,
            "question": "Nhận biết công việc lặp đi lặp lại thủ công giúp ích gì?",
            "options": [
              "Làm công việc dài hơn",
              "Bỏ qua kiểm tra",
              "Phát hiện bước có thể tự động hóa để tiết kiệm thời gian",
              "Không có lợi ích"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là bước đầu của tư duy tự động hóa."
          },
          {
            "number": 10,
            "question": "Điều nào KHÔNG đúng về máy tính khi thực hiện chỉ dẫn?",
            "options": [
              "Máy tính làm đúng theo chỉ dẫn",
              "Máy tính tự hiểu ý người dùng khi chỉ dẫn mơ hồ",
              "Máy tính cần chỉ dẫn chính xác",
              "Máy tính lặp lại việc rất nhanh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Máy tính không thể hiểu ý như con người."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M3-F — “Bộ tài liệu công việc đầu tiên” (Assignment)",
      "context": "Quản lý giao bạn chuẩn bị bộ tài liệu tổng kết một hoạt động ngắn của bộ phận (ví dụ chương trình khuyến mãi, buổi tập huấn, đợt khảo sát khách hàng). Bạn tự chọn hoạt động, dùng số liệu giả định hợp lý.",
      "requirements": "1. Soạn báo cáo ngắn (1–2 trang) bằng văn bản: có tiêu đề, đoạn, ít nhất một danh sách, in đậm đúng chỗ. 2. Lập bảng tính số liệu (tối thiểu 10 dòng) có tiêu đề cột, dùng ít nhất hai công thức cơ bản (tổng, trung bình hoặc đếm) và một công thức điều kiện nếu-thì. 3. Làm bản trình chiếu 4–6 slide tóm tắt kết quả, mỗi slide một ý chính. 4. Dùng ít nhất 3 hình ảnh từ nguồn được phép sử dụng thương mại; lập bảng ghi nguồn, giấy phép và cách ghi nguồn. 5. Áp dụng mẫu trình bày thống nhất cho cả ba tài liệu; xuất báo cáo ra PDF. 6. Viết quy trình các bước bạn đã làm (tối thiểu 8 bước), đánh dấu bước có điều kiện và bước có thể tự động hóa.",
      "deliverables": "Văn bản và bản PDF; bảng tính; trình chiếu; bảng nguồn hình ảnh; quy trình các bước.\nHình thức nộp. Bộ tệp trong một thư mục, đặt tên theo quy tắc và nộp đúng thời hạn.",
      "rubric": [
        "Gợi ý. Chỉ dùng số liệu giả định; không dùng hình ảnh không rõ nguồn. Đọc lại quy trình như thể bạn là người khác muốn làm lại đúng như vậy.",
        "Tiêu chí",
        "Điểm",
        "Ba định dạng tài liệu đúng mục đích, trình bày rõ ràng",
        "30",
        "Hình ảnh sử dụng có nguồn và giấy phép hợp lệ",
        "25",
        "Quy trình các bước rõ ràng, cụ thể, có đánh dấu điều kiện và tự động hóa",
        "25",
        "Trình bày tổng thể chuyên nghiệp, nhất quán",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Khi nào nên chọn bảng tính thay vì văn bản?",
        "options": [
          "Khi viết thư mời",
          "Khi soạn bài phát biểu",
          "Khi chụp ảnh",
          "Khi dữ liệu cần sắp xếp, tính toán"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bảng tính tổ chức dữ liệu theo ô, hàng và cột."
      },
      {
        "number": 2,
        "question": "Slide hiệu quả nên có đặc điểm nào?",
        "options": [
          "Nhồi tất cả nội dung vào một slide",
          "Không có tiêu đề",
          "Mỗi slide một ý chính, chữ vừa đủ đọc",
          "Chỉ có hình, không có chữ nào"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Trình chiếu hỗ trợ lời nói, không thay thế văn bản chi tiết."
      },
      {
        "number": 3,
        "question": "Vì sao nên xuất PDF trước khi gửi cho khách xem?",
        "options": [
          "Làm tệp có thể sửa dễ hơn",
          "Làm tệp nặng hơn",
          "Giữ nguyên bố cục và hạn chế chỉnh sửa",
          "Không có lý do"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "PDF cố định bố cục."
      },
      {
        "number": 4,
        "question": "Trong bảng tính, mỗi hàng thường đại diện cho điều gì?",
        "options": [
          "Một thuộc tính",
          "Một màu",
          "Một trang",
          "Một bản ghi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Hàng là bản ghi, cột là thuộc tính."
      },
      {
        "number": 5,
        "question": "In đậm nên dùng khi nào?",
        "options": [
          "Cho toàn bộ văn bản",
          "Cho ý then chốt cần nhấn mạnh",
          "Cho mọi tiêu đề và đoạn",
          "Không bao giờ dùng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "In đậm quá nhiều làm mất tác dụng nhấn mạnh."
      },
      {
        "number": 6,
        "question": "Dán văn bản thuần khác dán giữ định dạng ở điểm nào?",
        "options": [
          "Văn bản thuần bỏ định dạng của nguồn, giúp tài liệu nhất quán",
          "Giữ nguyên toàn bộ định dạng nguồn",
          "Làm đậm văn bản",
          "Tự động thêm hình ảnh"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Dán thuần thường an toàn hơn khi muốn giữ định dạng nhất quán."
      },
      {
        "number": 7,
        "question": "Vì sao nên dùng mẫu tài liệu của doanh nghiệp?",
        "options": [
          "Làm tài liệu khó đọc hơn",
          "Không có lợi ích",
          "Tiết kiệm thời gian và đảm bảo nhất quán",
          "Chỉ để tăng số trang"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Mẫu giúp trình bày đồng nhất."
      },
      {
        "number": 8,
        "question": "Khi nhận tài liệu của người khác để sửa, việc nên làm trước tiên là gì?",
        "options": [
          "Sửa thẳng và lưu đè",
          "Xóa bản gốc",
          "Gửi lại không đọc",
          "Lưu thành bản mới để giữ bản gốc"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bản gốc cần được giữ."
      },
      {
        "number": 9,
        "question": "Bước cuối trước khi gửi tài liệu là gì?",
        "options": [
          "Đổi phông chữ ngẫu nhiên",
          "Thêm nhiều hình",
          "Kiểm tra lại nội dung, số liệu, định dạng",
          "Xóa tiêu đề"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Kiểm tra tránh lỗi bị gửi đi."
      },
      {
        "number": 10,
        "question": "Khi chèn bảng từ bảng tính vào văn bản, cần lưu ý gì?",
        "options": [
          "Càng nhỏ càng tốt",
          "Bảng dễ đọc, vừa trang và số liệu đúng",
          "Không cần kiểm tra",
          "Chỉ cần chèn một ô"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bảng cần dễ đọc và chính xác."
      },
      {
        "number": 11,
        "question": "Tìm thấy ảnh trên mạng có nghĩa là bạn được dùng tự do không?",
        "options": [
          "Có, vì công khai",
          "Không, cần xem giấy phép",
          "Có, nếu ảnh đẹp",
          "Có, nếu xóa logo"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bản quyền vẫn tồn tại với nội dung công khai."
      },
      {
        "number": 12,
        "question": "Giấy phép yêu cầu ghi nguồn. Bạn nên làm gì?",
        "options": [
          "Ghi nguồn đầy đủ",
          "Không cần ghi",
          "Ghi tên mình",
          "Chỉ ghi khi bị hỏi"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ghi nguồn là điều kiện sử dụng."
      },
      {
        "number": 13,
        "question": "Nội dung “miễn phí” có luôn dùng được cho mục đích thương mại không?",
        "options": [
          "Không, phải đọc điều kiện sử dụng",
          "Luôn được",
          "Chỉ dùng cho giáo dục",
          "Không bao giờ được"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Miễn phí không đồng nghĩa với mọi quyền."
      },
      {
        "number": 14,
        "question": "Bản quyền bảo vệ những loại tác phẩm nào?",
        "options": [
          "Chỉ sách",
          "Hình ảnh, văn bản, âm nhạc, video và nhiều tác phẩm sáng tạo khác",
          "Chỉ nhạc",
          "Chỉ tranh vẽ"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Phạm vi bảo vệ rộng."
      },
      {
        "number": 15,
        "question": "Vi phạm bản quyền vô ý có rủi ro không?",
        "options": [
          "Không, vì vô ý",
          "Chỉ khi cố tình",
          "Chỉ khi kiếm tiền",
          "Có, vì không biết không đồng nghĩa với được phép"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cần kiểm tra giấy phép trước khi dùng."
      },
      {
        "number": 16,
        "question": "Vì sao cần diễn đạt công việc thành các bước cụ thể?",
        "options": [
          "Vì máy tính thích đọc nhiều",
          "Để công việc dài hơn",
          "Để người khác không hiểu",
          "Vì máy tính cần chỉ dẫn chính xác, không thể hiểu ý"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Chỉ dẫn mơ hồ không thực hiện được."
      },
      {
        "number": 17,
        "question": "“Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là cấu trúc gì?",
        "options": [
          "Điều kiện nếu-thì",
          "Vòng lặp",
          "Trình tự thuần túy",
          "Định dạng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Rẽ nhánh theo điều kiện."
      },
      {
        "number": 18,
        "question": "Hàm điều kiện trong bảng tính làm được điều gì?",
        "options": [
          "Đổi màu ô",
          "Trả về kết quả khác nhau tùy theo điều kiện",
          "Đổi tên tệp",
          "In tài liệu"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Hàm điều kiện thể hiện nếu-thì."
      },
      {
        "number": 19,
        "question": "Nhận biết công việc lặp lại thủ công có ích gì?",
        "options": [
          "Phát hiện bước có thể tự động hóa",
          "Làm việc chậm lại",
          "Bỏ qua kiểm tra",
          "Không có ích"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Đây là bước đầu của tự động hóa."
      },
      {
        "number": 20,
        "question": "Điều nào KHÔNG đúng về máy tính?",
        "options": [
          "Máy tính làm theo chỉ dẫn",
          "Máy tính cần chỉ dẫn chính xác",
          "Máy tính tự hiểu ý khi chỉ dẫn mơ hồ",
          "Máy tính làm lặp rất nhanh"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Máy tính không hiểu ý như con người."
      }
    ]
  },
  "M3-I": {
    "code": "M3-I",
    "title": "TẠO LẬP NỘI DUNG CHUYÊN NGHIỆP",
    "domain_number": 3,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Sản xuất nội dung đa định dạng",
        "competency_line": "Năng lực 3.1 · Mức 3–4",
        "objectives": [
          "Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau",
          "Thể hiện được bản thân thông qua việc tạo ra các phương tiện số"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Bộ nhận diện (brand identity): tập hợp các yếu tố hình ảnh (màu sắc, phông chữ, logo) tạo nên sự nhất quán cho thương hiệu",
          "Phân cấp thông tin: cách sắp xếp nội dung theo mức độ quan trọng để người xem dễ nắm bắt ý chính trước"
        ],
        "body": [
          "Ở mức trung cấp, việc phát triển nội dung số cần đạt chuẩn chuyên nghiệp hơn — tạo tài liệu theo bộ nhận diện thống nhất (cùng bảng màu, phông chữ, bố trí logo) giúp mọi tài liệu doanh nghiệp phát hành đều dễ nhận diện.",
          "Nguyên tắc trình bày cơ bản gồm: sử dụng khoảng trắng hợp lý, phân cấp thông tin rõ ràng, tạo độ tương phản đủ để dễ đọc. Nội dung cần được điều chỉnh theo từng kênh: tài liệu in cần bố cục trang trọng, mạng xã hội cần ngắn gọn và bắt mắt.",
          "Các công cụ thiết kế trực tuyến hiện nay cho phép người không chuyên tạo ra nội dung hình ảnh chuyên nghiệp thông qua mẫu có sẵn.",
          "Các bước. 1. Xác định bộ nhận diện: bảng màu, phông chữ, bố trí logo. 2. Xác định kênh và điều chỉnh nội dung cho từng kênh: tài liệu in trang trọng, mạng xã hội ngắn và thu hút, email rõ ràng. 3. Áp dụng nguyên tắc trình bày: khoảng trắng hợp lý, phân cấp thông tin, độ tương phản đủ để dễ đọc. 4. Dùng công cụ thiết kế trực tuyến với mẫu có sẵn nhưng chỉnh theo bộ nhận diện. 5. Với video, bổ sung phụ đề để người xem không bật tiếng và người khiếm thính vẫn tiếp cận được."
        ],
        "examples": [
          "Ví dụ trong công việc. Phòng marketing cần thông báo cùng một chương trình khuyến mãi qua ba kênh: tờ rơi in, bài đăng mạng xã hội và email khách hàng. Nếu mỗi kênh dùng một bảng màu và phông chữ khác nhau, khách khó nhận ra đó là cùng một thương hiệu."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Mỗi kênh một phong cách; chữ nhỏ, tương phản kém; nhồi quá nhiều thông tin vào một thiết kế; quên phụ đề cho video."
        ],
        "practice": [
          "Chuyển một nội dung công việc thành ba định dạng cho ba kênh khác nhau, giữ nhất quán về nhận diện."
        ],
        "deliverable": "Bộ 3 sản phẩm nội dung cho 3 kênh.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bộ nhận diện thống nhất mang lại lợi ích gì?",
            "options": [
              "Giúp tài liệu dễ nhận diện, tạo cảm giác chuyên nghiệp",
              "Không có lợi ích cụ thể",
              "Chỉ để làm đẹp",
              "Tốn thời gian không cần thiết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nhận diện nhất quán xây dựng uy tín và sự chuyên nghiệp cho thương hiệu."
          },
          {
            "number": 2,
            "question": "Nội dung cho mạng xã hội nên có đặc điểm gì so với tài liệu in?",
            "options": [
              "Giống hệt nhau",
              "Ngắn gọn, bắt mắt ngay từ đầu",
              "Cần nhiều chữ hơn",
              "Không cần điều chỉnh gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mỗi kênh có đặc điểm tiêu thụ nội dung khác nhau, cần điều chỉnh phù hợp."
          },
          {
            "number": 3,
            "question": "Vì sao cần cung cấp phụ đề cho video?",
            "options": [
              "Giúp người xem trong môi trường ồn hoặc khiếm thính tiếp cận nội dung",
              "Không cần thiết",
              "Chỉ để trang trí",
              "Làm video chậm hơn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phụ đề mở rộng khả năng tiếp cận nội dung cho nhiều đối tượng người xem."
          },
          {
            "number": 4,
            "question": "Phân cấp thông tin trong thiết kế nghĩa là gì?",
            "options": [
              "Sắp xếp nội dung theo mức độ quan trọng để dễ nắm bắt",
              "Không có ý nghĩa cụ thể",
              "Chỉ dùng màu sắc khác nhau",
              "Chỉ áp dụng cho văn bản dài"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phân cấp giúp người xem nhanh chóng nhận ra ý chính trước các chi tiết phụ."
          },
          {
            "number": 5,
            "question": "Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì cho người không chuyên?",
            "options": [
              "Không có ích gì",
              "Chỉ dùng được cho chuyên gia",
              "Tốn nhiều thời gian hơn thiết kế thủ công",
              "Cho phép tạo nội dung hình ảnh chuyên nghiệp không cần kiến thức thiết kế sâu"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mẫu có sẵn giúp người không chuyên vẫn tạo ra sản phẩm đạt chuẩn thẩm mỹ cơ bản."
          },
          {
            "number": 6,
            "question": "Bạn làm tờ rơi với chữ xám nhạt trên nền trắng. Vấn đề chính là gì?",
            "options": [
              "Có quá nhiều khoảng trắng",
              "Phông chữ quá lớn",
              "Không có vấn đề gì",
              "Độ tương phản không đủ nên khó đọc"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Độ tương phản đủ là nguyên tắc trình bày cơ bản."
          },
          {
            "number": 7,
            "question": "Cùng một chương trình khuyến mãi, bài đăng mạng xã hội nên khác tờ in ở điểm nào?",
            "options": [
              "Dài và trang trọng như tài liệu in",
              "Không cần hình ảnh",
              "Ngắn gọn, thu hút nhanh, phù hợp màn hình nhỏ",
              "Chỉ có chữ nhỏ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nội dung cần điều chỉnh theo kênh."
          },
          {
            "number": 8,
            "question": "Phân cấp thông tin trong thiết kế nhằm mục đích gì?",
            "options": [
              "Làm mọi chữ có kích thước bằng nhau",
              "Giúp người đọc nhận ra ý chính trước, ý phụ sau",
              "Giấu thông tin quan trọng",
              "Làm thiết kế phức tạp hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Phân cấp dẫn mắt người đọc."
          },
          {
            "number": 9,
            "question": "Vì sao nên thêm phụ đề cho video?",
            "options": [
              "Để video nặng hơn",
              "Để tránh phải quay lại",
              "Để người xem không bật tiếng hoặc khiếm thính vẫn tiếp cận được nội dung",
              "Không có lý do"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Phụ đề giúp nội dung dễ tiếp cận."
          },
          {
            "number": 10,
            "question": "Dùng mẫu có sẵn của công cụ thiết kế trực tuyến, cách làm đúng là gì?",
            "options": [
              "Giữ nguyên toàn bộ mẫu",
              "Chỉnh màu, phông, logo theo bộ nhận diện của doanh nghiệp",
              "Đổi sang bộ nhận diện của đối thủ",
              "Xóa logo cho gọn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mẫu có sẵn cần được cá nhân hóa theo bộ nhận diện."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Tích hợp và chuyển đổi nội dung",
        "competency_line": "Năng lực 3.2 · Mức 3–4",
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
          "Xây dựng bộ mẫu tài liệu chuẩn giúp toàn bộ phận tiết kiệm thời gian khi nhiều người cùng tạo tài liệu. Liên kết dữ liệu giữa bảng tính và văn bản cho phép biểu đồ tự động cập nhật khi số liệu gốc thay đổi. Trộn thư là kỹ thuật hữu ích khi cần tạo nhiều tài liệu cá nhân hóa cùng lúc. Quản lý phiên bản nội dung là kỹ năng quan trọng khi nhiều người tham gia chỉnh sửa.",
          "Các bước. 1. Tổng hợp từ nhiều nguồn thành một sản phẩm có mạch nhất quán, tránh chắp vá. 2. Xây bộ mẫu tài liệu chuẩn cho bộ phận (ít nhất ba mẫu thường dùng). 3. Dùng trộn thư để tạo hàng loạt từ danh sách dữ liệu. 4. Liên kết dữ liệu giữa bảng tính và văn bản hoặc biểu đồ để tự cập nhật khi số liệu gốc đổi. 5. Sau khi chuyển đổi định dạng tệp, kiểm tra lại bố cục, phông, bảng. 6. Quản lý phiên bản: ghi ngày, người sửa, nội dung thay đổi."
        ],
        "examples": [
          "Ví dụ trong công việc. Bộ phận kinh doanh gửi báo giá cho 80 khách mỗi tháng, mỗi báo giá chỉ khác tên, giá và ngày. Nếu soạn tay từng bản, rất mất thời gian và dễ sai tên. Một mẫu chuẩn kết hợp trộn thư giúp tạo hàng loạt chính xác và đồng nhất."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Ghép nhiều nguồn không đồng nhất giọng văn; không kiểm tra sau chuyển đổi định dạng; trộn thư không kiểm tra thử vài bản; nhiều phiên bản không rõ bản nào mới nhất."
        ],
        "practice": [
          "Xây một bộ mẫu tài liệu cho bộ phận (tối thiểu 3 mẫu) và tạo tài liệu hàng loạt từ một danh sách dữ liệu."
        ],
        "deliverable": "Bộ mẫu tài liệu và sản phẩm tạo hàng loạt.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cần giữ mạch nhất quán khi tổng hợp nội dung từ nhiều nguồn?",
            "options": [
              "Không quan trọng",
              "Chỉ để tiết kiệm thời gian",
              "Không có lý do cụ thể",
              "Tránh cảm giác “chắp vá” khiến người đọc mất tin tưởng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sự thiếu nhất quán dễ bị người đọc nhận ra, ảnh hưởng đến tính chuyên nghiệp."
          },
          {
            "number": 2,
            "question": "Trộn thư (mail merge) hữu ích trong trường hợp nào?",
            "options": [
              "Tạo nhiều tài liệu cá nhân hóa cùng lúc từ mẫu chung và danh sách dữ liệu",
              "Chỉ dùng cho một người nhận",
              "Không có ứng dụng thực tế",
              "Chỉ dùng cho hình ảnh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là công dụng chính của kỹ thuật trộn thư."
          },
          {
            "number": 3,
            "question": "Liên kết dữ liệu giữa bảng tính và văn bản mang lại lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Chỉ làm tài liệu nặng hơn",
              "Không thể thực hiện được",
              "Báo cáo tự động cập nhật khi số liệu gốc thay đổi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Liên kết giúp tránh việc phải copy thủ công lại số liệu mỗi lần thay đổi."
          },
          {
            "number": 4,
            "question": "Khi chuyển đổi định dạng tệp, cần kiểm tra điều gì sau khi chuyển?",
            "options": [
              "Không cần kiểm tra gì",
              "Chỉ cần kiểm tra dung lượng",
              "Định dạng số, ký tự đặc biệt, cấu trúc bảng có bị mất không",
              "Chỉ cần kiểm tra tên tệp"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chuyển đổi định dạng có thể làm mất hoặc thay đổi một số yếu tố cần được xác nhận lại."
          },
          {
            "number": 5,
            "question": "Quản lý phiên bản nội dung quan trọng khi nào?",
            "options": [
              "Không bao giờ quan trọng",
              "Khi nội dung được chỉnh sửa qua nhiều vòng, nhiều người tham gia",
              "Chỉ quan trọng với tài liệu ngắn",
              "Chỉ áp dụng cho hình ảnh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhiều người cùng chỉnh sửa dễ gây nhầm lẫn về phiên bản nào là chính thức."
          },
          {
            "number": 6,
            "question": "Bạn tổng hợp ba bài viết của ba người thành một báo cáo. Điều cần chú ý nhất là gì?",
            "options": [
              "Giữ mạch nhất quán về giọng văn, thuật ngữ và cấu trúc",
              "Chép nguyên văn từng đoạn",
              "Giữ nguyên ba phong cách khác nhau",
              "Xóa tên nguồn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tránh tình trạng chắp vá giữa các phần."
          },
          {
            "number": 7,
            "question": "Tình huống nào phù hợp nhất để dùng trộn thư?",
            "options": [
              "Viết một bài phân tích mới",
              "Gửi báo giá gần giống nhau cho 80 khách, chỉ khác tên và giá",
              "Chỉnh sửa một ảnh",
              "Nhắn tin riêng cho một người"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Trộn thư tạo hàng loạt từ mẫu và danh sách dữ liệu."
          },
          {
            "number": 8,
            "question": "Biểu đồ trong báo cáo được liên kết với bảng tính gốc. Lợi ích chính là gì?",
            "options": [
              "Biểu đồ tự cập nhật khi số liệu gốc thay đổi",
              "Biểu đồ đẹp hơn",
              "Tệp luôn nhẹ hơn",
              "Không cần kiểm tra số liệu"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Liên kết dữ liệu giúp tránh sai lệch giữa số liệu và biểu đồ."
          },
          {
            "number": 9,
            "question": "Sau khi chuyển tệp từ Word sang PDF, cần làm gì?",
            "options": [
              "Gửi ngay không cần mở",
              "Mở kiểm tra bố cục, phông chữ và bảng",
              "Xóa bản Word",
              "Đổi tên thành ngẫu nhiên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chuyển đổi có thể làm thay đổi bố cục."
          },
          {
            "number": 10,
            "question": "Khi bộ phận có nhiều người sửa cùng một tài liệu, cần làm gì để quản lý phiên bản?",
            "options": [
              "Mỗi người lưu một bản riêng",
              "Đặt tên tệp “final” liên tục",
              "Ghi rõ ngày, người sửa và nội dung thay đổi, chỉ giữ một bản chính",
              "Không cần quản lý"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quản lý phiên bản tránh nhầm lẫn bản mới nhất."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Bản quyền, giấy phép và sử dụng hợp pháp",
        "competency_line": "Năng lực 3.3 · Mức 3–4",
        "objectives": [
          "Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số"
        ],
        "definitions": [
          "Miền công cộng (public domain): tác phẩm không còn hoặc chưa từng thuộc bản quyền của riêng ai, có thể tự do sử dụng",
          "Nội dung do AI tạo ra: nội dung được tạo bởi công cụ trí tuệ nhân tạo, có vấn đề pháp lý về quyền sở hữu chưa hoàn toàn rõ ràng ở nhiều nơi"
        ],
        "body": [
          "Ở mức trung cấp, việc áp dụng quy tắc bản quyền và giấy phép cần chi tiết hơn — phân biệt các loại giấy phép phổ biến khác nhau về mức độ tự do sử dụng, và xác định quyền sở hữu nội dung do nhân viên tạo ra trong quá trình làm việc (thường thuộc quyền sở hữu của công ty theo hợp đồng lao động).",
          "Khi sử dụng nội dung có yếu tố bên thứ ba — ví dụ hình ảnh có người thật xuất hiện — cần có sự đồng ý của người đó. Nội dung do công cụ AI tạo ra đang là vùng pháp lý chưa hoàn toàn rõ ràng, cần thận trọng khi dùng cho mục đích thương mại. Xây dựng quy trình kiểm tra bản quyền trước khi công bố giúp giảm rủi ro.",
          "Các bước. 1. Phân biệt các loại giấy phép phổ biến theo mức độ tự do sử dụng: được dùng thương mại không, được sửa không, có phải ghi nguồn không. 2. Xác định quyền sở hữu nội dung nhân viên tạo ra trong quá trình làm việc, dựa trên hợp đồng và chính sách của doanh nghiệp. 3. Với hình ảnh có người thật, xin sự đồng ý của người đó cho mục đích sử dụng. 4. Với nội dung do AI tạo ra: đây là vùng pháp lý chưa hoàn toàn rõ ràng, nên thận trọng khi dùng cho mục đích thương mại và đọc điều khoản của công cụ. 5. Lập danh mục kiểm tra bản quyền trước khi xuất bản và lưu hồ sơ quyền sử dụng.",
          "Lưu ý: đây là nội dung đào tạo chung, không phải tư vấn pháp lý; khi gặp tình huống cụ thể cần tham vấn người có chuyên môn pháp lý."
        ],
        "examples": [
          "Ví dụ trong công việc. Phòng marketing định dùng một đoạn nhạc nền cho video giới thiệu sản phẩm, hình ảnh khách hàng làm minh họa, và một ảnh do công cụ AI tạo ra. Mỗi thứ có điều kiện sử dụng khác nhau, và việc xác minh trước khi xuất bản rẻ hơn rất nhiều so với xử lý khiếu nại sau đó."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không phân biệt giấy phép; dùng ảnh người thật mà không xin phép; xuất bản rồi mới kiểm tra; không lưu hồ sơ nguồn."
        ],
        "practice": [
          "Xây danh mục kiểm tra bản quyền cho quy trình xuất bản nội dung của bộ phận, áp dụng thử lên ba sản phẩm nội dung đã có."
        ],
        "deliverable": "Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nội dung do nhân viên tạo ra trong giờ làm việc thường thuộc quyền sở hữu của ai?",
            "options": [
              "Luôn thuộc về nhân viên",
              "Không thuộc về ai",
              "Luôn cần thỏa thuận riêng mỗi lần",
              "Thường thuộc công ty theo hợp đồng lao động"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là nguyên tắc phổ biến, nên được nêu rõ trong hợp đồng để tránh tranh chấp."
          },
          {
            "number": 2,
            "question": "Khi hình ảnh có người thật xuất hiện được dùng cho mục đích thương mại, cần gì?",
            "options": [
              "Cần sự đồng ý của người đó",
              "Không cần gì đặc biệt",
              "Chỉ cần làm mờ mặt là đủ",
              "Chỉ cần ghi chú nguồn ảnh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Sử dụng hình ảnh cá nhân cho mục đích thương mại cần có sự đồng ý rõ ràng."
          },
          {
            "number": 3,
            "question": "Nội dung do AI tạo ra hiện nay có vấn đề pháp lý gì?",
            "options": [
              "Hoàn toàn rõ ràng về quyền sở hữu",
              "Chưa hoàn toàn rõ ràng về ai sở hữu bản quyền ở nhiều nơi",
              "Không có vấn đề gì",
              "Luôn thuộc về người dùng công cụ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là vùng pháp lý còn đang phát triển, cần thận trọng khi sử dụng cho mục đích quan trọng."
          },
          {
            "number": 4,
            "question": "Miền công cộng (public domain) nghĩa là gì?",
            "options": [
              "Nội dung phải trả phí để sử dụng",
              "Tác phẩm không thuộc bản quyền riêng của ai, có thể tự do sử dụng",
              "Chỉ dành cho cơ quan nhà nước",
              "Nội dung bị cấm sử dụng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là định nghĩa của miền công cộng."
          },
          {
            "number": 5,
            "question": "Quy trình kiểm tra bản quyền trước khi công bố nên bao gồm gì?",
            "options": [
              "Xác nhận nguồn gốc nội dung sử dụng và lưu hồ sơ chứng minh quyền sử dụng",
              "Không cần quy trình gì",
              "Chỉ cần hỏi miệng đồng nghiệp",
              "Chỉ áp dụng cho nội dung lớn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quy trình có hệ thống giúp giảm rủi ro vi phạm bản quyền một cách nhất quán."
          },
          {
            "number": 6,
            "question": "Video có hình khách hàng làm minh họa để quảng cáo. Điều cần có trước khi xuất bản là gì?",
            "options": [
              "Chỉ cần ghi tên công ty",
              "Không cần gì vì ảnh đã công khai",
              "Chỉ cần làm mờ nền",
              "Sự đồng ý của người xuất hiện trong hình cho mục đích sử dụng đó"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Hình ảnh có người thật cần sự đồng ý."
          },
          {
            "number": 7,
            "question": "Doanh nghiệp muốn dùng ảnh do công cụ AI tạo ra cho quảng cáo thương mại. Cách tiếp cận hợp lý là gì?",
            "options": [
              "Chắc chắn không có rủi ro",
              "Chắc chắn bị cấm",
              "Thận trọng, đọc điều khoản của công cụ và xin tư vấn khi cần vì vùng pháp lý chưa rõ ràng",
              "Không cần quan tâm"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là vùng pháp lý chưa hoàn toàn rõ ràng."
          },
          {
            "number": 8,
            "question": "Danh mục kiểm tra bản quyền trước khi xuất bản nên có mục nào?",
            "options": [
              "Chỉ màu sắc",
              "Nguồn, giấy phép, phạm vi sử dụng, sự đồng ý của người trong hình",
              "Chỉ kích thước tệp",
              "Chỉ tên người đăng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kiểm tra trước giúp tránh rủi ro pháp lý."
          },
          {
            "number": 9,
            "question": "Phân biệt các loại giấy phép dựa trên điều gì?",
            "options": [
              "Mức độ tự do sử dụng: thương mại, chỉnh sửa, phải ghi nguồn hay không",
              "Màu của tệp",
              "Độ dài tên tệp",
              "Tên người tải"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Điều kiện sử dụng khác nhau giữa các giấy phép."
          },
          {
            "number": 10,
            "question": "Vì sao nên lưu hồ sơ chứng minh quyền sử dụng nội dung?",
            "options": [
              "Để tệp nhẹ hơn",
              "Để quảng cáo",
              "Để chứng minh sử dụng hợp pháp khi có khiếu nại",
              "Không có lý do"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Hồ sơ nguồn giúp bảo vệ doanh nghiệp."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Tự động hóa công việc lặp lại",
        "competency_line": "Năng lực 3.4 · Mức 3–4",
        "objectives": [
          "Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể"
        ],
        "definitions": [
          "Hàm tra cứu (lookup function): công thức bảng tính tự động tìm và lấy giá trị tương ứng từ một bảng dữ liệu khác",
          "Công cụ nối ứng dụng (no-code automation): công cụ cho phép kết nối và tự động hóa quy trình giữa các ứng dụng mà không cần viết mã lập trình"
        ],
        "body": [
          "Ở mức trung cấp, việc liệt kê hướng dẫn cho hệ thống máy tính giải quyết vấn đề cụ thể mở rộng sang tự động hóa công việc lặp lại — phân rã quy trình để xác định điểm có thể tự động hóa, thường là những bước lặp lại có quy tắc cố định.",
          "Hàm điều kiện, hàm tra cứu, hàm xử lý văn bản trong bảng tính giúp xử lý khối lượng dữ liệu lớn nhanh hơn nhiều. Công cụ nối ứng dụng không cần lập trình cho phép kết nối các ứng dụng khác nhau. Không phải công việc lặp lại nào cũng đáng để tự động hóa — cần cân nhắc tần suất và mức độ ổn định của quy tắc.",
          "Các bước. 1. Vẽ quy trình thành các bước, ghi thời gian từng bước. 2. Chọn bước phù hợp tự động hóa: lặp lại nhiều, quy tắc rõ, ít ngoại lệ. 3. Dùng hàm điều kiện, hàm tra cứu, hàm xử lý văn bản trong bảng tính; hoặc công cụ nối ứng dụng không cần lập trình. 4. Chạy thử với dữ liệu mẫu, kiểm tra kết quả đối chiếu với cách làm tay. 5. Đo thời gian tiết kiệm được và ghi lại rủi ro khi tự động hóa sai."
        ],
        "examples": [
          "Ví dụ trong công việc. Mỗi tuần nhân viên hành chính mất hai giờ copy số liệu từ email vào bảng tính rồi gửi báo cáo cho quản lý. Phân rã quy trình cho thấy bước copy thủ công là bước lặp lại, quy tắc rõ, rất phù hợp để tự động hóa; bước xét duyệt ngoại lệ thì vẫn cần con người."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tự động hóa việc chỉ làm một lần; tự động hóa quy trình chưa rõ ràng; không kiểm tra kết quả; không có phương án khi tự động hóa lỗi."
        ],
        "practice": [
          "Chọn một công việc lặp lại trong bộ phận, phân rã thành các bước, tự động hóa ít nhất một bước và đo thời gian tiết kiệm được."
        ],
        "deliverable": "Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bước nào trong quy trình phù hợp nhất để tự động hóa?",
            "options": [
              "Bước lặp lại có quy tắc cố định",
              "Bước cần phán đoán chủ quan",
              "Bước chỉ làm một lần",
              "Bước không có quy tắc rõ ràng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Các bước lặp lại theo quy tắc cố định dễ tự động hóa và mang lại hiệu quả cao nhất."
          },
          {
            "number": 2,
            "question": "Hàm tra cứu trong bảng tính dùng để làm gì?",
            "options": [
              "Tính tổng số liệu",
              "Định dạng chữ",
              "Xóa dữ liệu trùng lặp",
              "Tự động tìm và lấy giá trị tương ứng từ bảng dữ liệu khác"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là chức năng chính của hàm tra cứu."
          },
          {
            "number": 3,
            "question": "Khi nào KHÔNG nên đầu tư công sức tự động hóa một công việc?",
            "options": [
              "Khi công việc lặp lại hàng ngày",
              "Khi tần suất thấp và quy tắc hay thay đổi",
              "Khi quy tắc rất ổn định",
              "Khi khối lượng công việc lớn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tần suất thấp và quy tắc không ổn định khiến chi phí duy trì tự động hóa không đáng công sức bỏ ra."
          },
          {
            "number": 4,
            "question": "Rủi ro của việc tự động hóa sai là gì?",
            "options": [
              "Không có rủi ro gì đặc biệt",
              "Lỗi có thể lan rộng nhanh hơn lỗi thủ công",
              "Chỉ ảnh hưởng đến một trường hợp",
              "Dễ phát hiện hơn lỗi thủ công"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hệ thống tự động xử lý số lượng lớn nên lỗi có thể nhân rộng nhanh chóng nếu không được kiểm soát."
          },
          {
            "number": 5,
            "question": "Công cụ nối ứng dụng không cần lập trình cho phép làm gì?",
            "options": [
              "Chỉ dùng được bởi lập trình viên",
              "Không có ứng dụng thực tế",
              "Kết nối và tự động hóa giữa các ứng dụng mà không cần viết mã",
              "Chỉ dùng cho một ứng dụng duy nhất"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là công dụng chính, giúp người không chuyên về lập trình vẫn có thể tự động hóa quy trình."
          },
          {
            "number": 6,
            "question": "Bước nào trong quy trình phù hợp nhất để tự động hóa?",
            "options": [
              "Bước cần phán đoán phức tạp mỗi lần",
              "Bước lặp lại nhiều, quy tắc rõ ràng và ít ngoại lệ",
              "Bước chỉ làm một lần trong năm",
              "Bước chưa ai biết cách làm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tự động hóa hiệu quả nhất với bước lặp lại có quy tắc rõ."
          },
          {
            "number": 7,
            "question": "Hàm tra cứu trong bảng tính dùng để làm gì?",
            "options": [
              "Tìm giá trị tương ứng từ một bảng khác dựa trên một khóa",
              "Đổi màu ô",
              "Xóa dữ liệu trùng",
              "Tạo biểu đồ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hàm tra cứu lấy dữ liệu liên quan từ bảng khác."
          },
          {
            "number": 8,
            "question": "Khi nào KHÔNG nên đầu tư công sức tự động hóa?",
            "options": [
              "Khi việc chỉ làm một lần hoặc thời gian xây dựng lớn hơn thời gian tiết kiệm",
              "Khi việc lặp lại hằng ngày",
              "Khi quy tắc rõ ràng",
              "Khi có nhiều người làm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần cân nhắc lợi ích so với công sức."
          },
          {
            "number": 9,
            "question": "Một tự động hóa gửi nhầm báo giá cho nhiều khách. Nguyên nhân phòng ngừa hợp lý nhất là gì?",
            "options": [
              "Cho chạy mà không kiểm tra",
              "Tăng số lượng khách",
              "Tắt mọi bước kiểm tra",
              "Chạy thử với dữ liệu mẫu và có bước kiểm tra trước khi gửi hàng loạt"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tự động hóa sai có thể nhân lỗi lên nhiều lần."
          },
          {
            "number": 10,
            "question": "Công cụ nối ứng dụng không cần lập trình cho phép điều gì?",
            "options": [
              "Thay thế mọi phần mềm",
              "Tự viết hợp đồng",
              "Kết nối các ứng dụng để dữ liệu tự chuyển giữa chúng",
              "Tự đổi mật khẩu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là cách tự động hóa không cần lập trình."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M3-I — “Chiến dịch nội dung nhỏ” (Assignment)",
      "context": "Bạn được giao sản xuất một chiến dịch nội dung nhỏ cho một sản phẩm hoặc sự kiện của bộ phận (giả định) và chuẩn bị quy trình hỗ trợ để lần sau làm nhanh hơn.",
      "requirements": "1. Xây bộ nhận diện tối giản (bảng màu, phông chữ, cách đặt logo) và bộ mẫu tài liệu tối thiểu 3 mẫu. 2. Sản xuất 3 sản phẩm nội dung cho 3 kênh khác nhau (ví dụ tờ in/PDF, bài mạng xã hội, email), giữ nhất quán nhận diện, có phụ đề nếu là video. 3. Dùng trộn thư hoặc phương pháp tương đương để tạo hàng loạt ít nhất 10 bản từ danh sách dữ liệu giả định. 4. Lập danh mục kiểm tra bản quyền và áp dụng lên cả 3 sản phẩm; có bảng nguồn và giấy phép. 5. Chọn một công việc lặp lại trong quy trình, phân rã thành các bước, tự động hóa ít nhất một bước, đo thời gian tiết kiệm được và nêu rủi ro. 6. Viết trang tổng kết: điều làm tốt, điều cần cải thiện, bước tiếp theo.",
      "deliverables": "Bộ mẫu; ba sản phẩm nội dung; sản phẩm tạo hàng loạt; danh mục kiểm tra bản quyền và bảng nguồn; sơ đồ quy trình và giải pháp tự động hóa kèm ước tính thời gian tiết kiệm; trang tổng kết.\nHình thức nộp. Một thư mục tệp đặt tên đúng quy ước và một tài liệu mô tả ngắn.",
      "rubric": [
        "Gợi ý. Chỉ dùng nội dung giả định hoặc có giấy phép rõ ràng. Đo thời gian trước và sau tự động hóa bằng số liệu cụ thể.",
        "Tiêu chí",
        "Điểm",
        "Bộ mẫu tài liệu nhất quán, chuyên nghiệp",
        "20",
        "Ba sản phẩm nội dung phù hợp từng kênh",
        "25",
        "Hồ sơ kiểm tra bản quyền đầy đủ",
        "25",
        "Giải pháp tự động hóa khả thi, có đo lường hiệu quả",
        "30"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Bộ nhận diện thống nhất mang lại lợi ích gì?",
        "options": [
          "Mọi tài liệu phát hành dễ nhận ra là của cùng một doanh nghiệp",
          "Làm tài liệu khó đọc hơn",
          "Không có lợi ích",
          "Chỉ để tiết kiệm mực in"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Nhận diện nhất quán tạo độ tin cậy."
      },
      {
        "number": 2,
        "question": "Nội dung mạng xã hội thường khác tài liệu in ở điểm nào?",
        "options": [
          "Dài và trang trọng",
          "Không có hình",
          "Không cần tiêu đề",
          "Ngắn gọn, bắt mắt, phù hợp màn hình nhỏ"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Mỗi kênh có yêu cầu riêng."
      },
      {
        "number": 3,
        "question": "Phân cấp thông tin nghĩa là gì?",
        "options": [
          "Làm mọi chữ bằng nhau",
          "Giấu ý chính",
          "Sắp xếp để ý chính nổi bật trước ý phụ",
          "Dùng thật nhiều màu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giúp người đọc nắm ý nhanh."
      },
      {
        "number": 4,
        "question": "Vì sao cần phụ đề cho video?",
        "options": [
          "Để video dài hơn",
          "Để tránh phải quay",
          "Không cần",
          "Để người xem tắt tiếng hoặc khiếm thính vẫn hiểu nội dung"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Phụ đề giúp tiếp cận rộng hơn."
      },
      {
        "number": 5,
        "question": "Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì?",
        "options": [
          "Người không chuyên tạo được sản phẩm chuyên nghiệp nhanh hơn",
          "Thay thế mọi nhà thiết kế",
          "Làm mất nhận diện",
          "Chỉ dùng được cho ảnh in"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Mẫu có sẵn tiết kiệm thời gian."
      },
      {
        "number": 6,
        "question": "Vì sao cần giữ mạch nhất quán khi tổng hợp nhiều nguồn?",
        "options": [
          "Để dài hơn",
          "Để giấu nguồn",
          "Không cần nhất quán",
          "Tránh sản phẩm chắp vá, khó hiểu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Tri thức cần được đưa vào nội dung mới một cách nhất quán."
      },
      {
        "number": 7,
        "question": "Trộn thư hữu ích khi nào?",
        "options": [
          "Tạo nhiều tài liệu giống cấu trúc, khác dữ liệu cá nhân",
          "Viết bài mới hoàn toàn",
          "Chỉnh ảnh",
          "Gọi điện cho từng khách"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Trộn thư tạo hàng loạt từ mẫu và danh sách."
      },
      {
        "number": 8,
        "question": "Liên kết dữ liệu giữa bảng tính và văn bản giúp gì?",
        "options": [
          "Tệp luôn nhỏ hơn",
          "Số liệu và biểu đồ tự cập nhật khi dữ liệu gốc đổi",
          "Không cần kiểm tra",
          "Bảo mật tuyệt đối"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giảm sai lệch do cập nhật thủ công."
      },
      {
        "number": 9,
        "question": "Sau khi chuyển đổi định dạng tệp, cần kiểm tra điều gì?",
        "options": [
          "Chỉ tên tệp",
          "Bố cục, phông chữ, bảng và hình ảnh",
          "Chỉ dung lượng",
          "Không cần kiểm tra"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Chuyển đổi có thể làm sai lệch bố cục."
      },
      {
        "number": 10,
        "question": "Quản lý phiên bản quan trọng khi nào?",
        "options": [
          "Khi chỉ một người xem",
          "Khi tệp trống",
          "Khi nhiều người cùng sửa và cần biết bản nào là bản mới nhất",
          "Không bao giờ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tránh nhầm lẫn giữa các bản."
      },
      {
        "number": 11,
        "question": "Hình ảnh có người thật dùng cho quảng cáo cần điều gì?",
        "options": [
          "Không cần gì",
          "Chỉ ghi tên công ty",
          "Sự đồng ý của người xuất hiện cho mục đích đó",
          "Làm mờ nền"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Quyền hình ảnh cá nhân cần được tôn trọng."
      },
      {
        "number": 12,
        "question": "Nội dung do AI tạo ra khi dùng cho mục đích thương mại, cách tiếp cận hợp lý là gì?",
        "options": [
          "Thận trọng vì vùng pháp lý chưa hoàn toàn rõ, đọc điều khoản công cụ",
          "Mặc định không có rủi ro",
          "Mặc định bị cấm",
          "Không cần quan tâm"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Pháp lý về nội dung AI còn chưa rõ."
      },
      {
        "number": 13,
        "question": "Phân biệt các loại giấy phép dựa vào đâu?",
        "options": [
          "Mức độ tự do: thương mại, chỉnh sửa, ghi nguồn",
          "Màu tệp",
          "Độ dài tên tệp",
          "Người tải lên"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Điều kiện mỗi loại khác nhau."
      },
      {
        "number": 14,
        "question": "Danh mục kiểm tra bản quyền nên có mục nào?",
        "options": [
          "Chỉ kích thước",
          "Nguồn, giấy phép, phạm vi, sự đồng ý của người trong hình",
          "Chỉ ngày tải",
          "Chỉ tên người tải"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Kiểm tra trước khi công bố."
      },
      {
        "number": 15,
        "question": "Vì sao lưu hồ sơ quyền sử dụng nội dung?",
        "options": [
          "Để tăng dung lượng",
          "Để quảng cáo",
          "Không cần",
          "Để chứng minh sử dụng hợp pháp khi có khiếu nại"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Hồ sơ bảo vệ doanh nghiệp."
      },
      {
        "number": 16,
        "question": "Bước nào phù hợp nhất để tự động hóa?",
        "options": [
          "Cần phán đoán phức tạp",
          "Lặp lại nhiều, quy tắc rõ, ít ngoại lệ",
          "Chỉ làm một lần",
          "Chưa ai biết cách làm"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Phù hợp tự động hóa nhất."
      },
      {
        "number": 17,
        "question": "Hàm tra cứu dùng để làm gì?",
        "options": [
          "Đổi màu",
          "Xóa trùng",
          "Tìm giá trị tương ứng từ bảng khác theo một khóa",
          "Vẽ biểu đồ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Lấy dữ liệu liên quan."
      },
      {
        "number": 18,
        "question": "Khi nào không nên tự động hóa?",
        "options": [
          "Việc lặp hằng ngày",
          "Việc chỉ làm một lần hoặc chi phí xây dựng lớn hơn lợi ích",
          "Việc quy tắc rõ",
          "Việc nhiều người làm"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cân nhắc lợi ích."
      },
      {
        "number": 19,
        "question": "Rủi ro của tự động hóa sai là gì?",
        "options": [
          "Không có rủi ro",
          "Luôn tiết kiệm thời gian",
          "Lỗi bị nhân lên nhiều lần mà khó phát hiện",
          "Chỉ làm chậm máy"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Cần chạy thử và kiểm tra."
      },
      {
        "number": 20,
        "question": "Công cụ nối ứng dụng không cần lập trình cho phép gì?",
        "options": [
          "Thay thế mọi phần mềm",
          "Tự viết hợp đồng",
          "Tự đổi mật khẩu",
          "Kết nối ứng dụng để dữ liệu tự chuyển giữa chúng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Tự động hóa không cần lập trình."
      }
    ]
  },
  "M3-A": {
    "code": "M3-A",
    "title": "CHIẾN LƯỢC NỘI DUNG VÀ GIẢI PHÁP SỐ",
    "domain_number": 3,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Chiến lược và hệ thống sản xuất nội dung",
        "competency_line": "Năng lực 3.1 · Mức 5–6",
        "objectives": [
          "Thay đổi được nội dung bằng các định dạng phù hợp nhất",
          "Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất"
        ],
        "definitions": [
          "Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số",
          "Chân dung đối tượng (persona): hồ sơ mô tả đặc điểm, nhu cầu của một nhóm khách hàng hoặc đối tượng mục tiêu điển hình",
          "Hành trình khách hàng: các giai đoạn một khách hàng trải qua từ khi biết đến sản phẩm đến khi mua và sử dụng"
        ],
        "body": [
          "Ở mức nâng cao, việc thể hiện bản thân qua các phương tiện số phù hợp nhất đòi hỏi một chiến lược sản xuất nội dung gắn với mục tiêu kinh doanh, không chỉ dừng ở từng sản phẩm đơn lẻ.",
          "Xây dựng chân dung đối tượng giúp định hướng nội dung phù hợp với nhu cầu thực tế. Bản đồ nội dung theo hành trình khách hàng giúp nội dung phát huy đúng vai trò ở đúng thời điểm. Quy trình sản xuất nội dung có thể mở rộng cần các bước rõ ràng: lên ý tưởng, duyệt đề cương, sản xuất, duyệt nội dung cuối, xuất bản, đánh giá hiệu quả.",
          "Khi khối lượng sản xuất nội dung tăng lên, một người không thể tự làm hết mà cần hướng dẫn người khác cùng tạo nội dung theo đúng chuẩn — vai trò này không phải là kiểm tra từng chi tiết mọi lúc (dễ sa vào vi quản lý), mà là thiết lập tiêu chuẩn chất lượng rõ ràng ngay từ đầu và chỉ duyệt kỹ ở các điểm kiểm soát quan trọng trong quy trình.",
          "Các bước. 1. Xác định mục tiêu kinh doanh và đối tượng, từ đó chọn loại nội dung ưu tiên. 2. Xây hệ thống sản xuất: quy trình, vai trò, lịch biên tập, tiêu chuẩn chất lượng. 3. Chuẩn hóa mẫu, bộ nhận diện và hướng dẫn giọng văn dùng chung. 4. Chọn chỉ số đo hiệu quả gắn với mục tiêu (không chỉ lượt xem). 5. Rà soát định kỳ và điều chỉnh dựa trên số liệu."
        ],
        "examples": [
          "Ví dụ trong công việc. Một doanh nghiệp phân phối có nhiều bộ phận cùng làm nội dung nhưng mỗi nơi một kiểu: ai cũng tự làm, trùng lặp, chất lượng không đều. Người ở bậc nâng cao đề xuất một chiến lược nội dung chung gắn với mục tiêu kinh doanh, kèm quy trình, vai trò và chỉ số đo lường."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Sản xuất nhiều nhưng không gắn mục tiêu; chỉ đo chỉ số hình thức; không phân vai rõ; không rà soát lại chiến lược."
        ],
        "practice": [
          "Xây chiến lược nội dung một quý cho doanh nghiệp: mục tiêu, đối tượng, chủ đề, kênh, lịch sản xuất, chỉ số đo lường."
        ],
        "deliverable": "Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Chiến lược nội dung nên bắt đầu từ đâu?",
            "options": [
              "Từ mục tiêu kinh doanh cụ thể",
              "Từ việc chọn kênh trước",
              "Từ xu hướng thịnh hành",
              "Từ ngân sách có sẵn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Mục tiêu kinh doanh định hướng toàn bộ chiến lược nội dung phía sau."
          },
          {
            "number": 2,
            "question": "Chân dung đối tượng dùng để làm gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Định hướng nội dung phù hợp với nhu cầu thực tế của khách hàng",
              "Chỉ để trang trí báo cáo",
              "Chỉ áp dụng cho quảng cáo"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hiểu rõ đối tượng giúp tạo nội dung đúng nhu cầu thay vì đoán mò."
          },
          {
            "number": 3,
            "question": "Vì sao lượt xem không phải lúc nào cũng là chỉ số quan trọng nhất?",
            "options": [
              "Lượt xem luôn là chỉ số quan trọng nhất",
              "Tỷ lệ chuyển đổi mới phản ánh hiệu quả kinh doanh thực sự",
              "Không nên đo lường lượt xem",
              "Lượt xem không có ý nghĩa gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Lượt xem chỉ cho biết tiếp cận, chuyển đổi mới cho biết hiệu quả thực chất."
          },
          {
            "number": 4,
            "question": "Quy trình sản xuất nội dung có thể mở rộng cần điều gì?",
            "options": [
              "Các bước rõ ràng với người chịu trách nhiệm cụ thể ở mỗi bước",
              "Không cần quy trình rõ ràng",
              "Chỉ cần một người làm tất cả",
              "Không cần duyệt nội dung"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quy trình rõ ràng đảm bảo chất lượng đồng đều khi khối lượng sản xuất tăng."
          },
          {
            "number": 5,
            "question": "Vai trò hướng dẫn người khác trong sản xuất nội dung bao gồm gì?",
            "options": [
              "Kiểm tra toàn bộ chi tiết mọi lúc",
              "Không can thiệp gì",
              "Tự làm hết thay vì hướng dẫn",
              "Thiết lập tiêu chuẩn rõ ràng và duyệt ở các điểm kiểm soát quan trọng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là cách quản lý chất lượng hiệu quả mà không sa vào vi quản lý."
          },
          {
            "number": 6,
            "question": "Điểm xuất phát của một chiến lược nội dung là gì?",
            "options": [
              "Công cụ đang thịnh hành",
              "Số lượng bài càng nhiều càng tốt",
              "Sở thích cá nhân của người viết",
              "Mục tiêu kinh doanh và đối tượng cần tiếp cận"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chiến lược cần gắn với mục tiêu."
          },
          {
            "number": 7,
            "question": "Vì sao cần quy trình và vai trò rõ trong sản xuất nội dung?",
            "options": [
              "Tránh trùng lặp, đảm bảo chất lượng và tiến độ",
              "Để thêm thủ tục",
              "Để giảm số người tham gia",
              "Không cần thiết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hệ thống giúp chất lượng ổn định."
          },
          {
            "number": 8,
            "question": "Chỉ số nào phản ánh hiệu quả nội dung tốt hơn?",
            "options": [
              "Chỉ lượt xem",
              "Chỉ số chữ",
              "Chỉ số gắn với mục tiêu như đăng ký, liên hệ, đơn hàng",
              "Chỉ số bài đăng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đo theo mục tiêu thay vì chỉ chỉ số hình thức."
          },
          {
            "number": 9,
            "question": "Hướng dẫn giọng văn dùng chung có lợi gì?",
            "options": [
              "Làm bài viết giống hệt nhau",
              "Nội dung từ nhiều người vẫn nhất quán",
              "Không có lợi",
              "Chỉ phục vụ marketing"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhất quán tạo độ tin cậy."
          },
          {
            "number": 10,
            "question": "Vì sao cần rà soát chiến lược định kỳ?",
            "options": [
              "Để thay đổi liên tục",
              "Để tăng chi phí",
              "Điều chỉnh theo số liệu và thay đổi của đối tượng",
              "Không cần"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chiến lược cần được cải tiến."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Quản trị và tái sử dụng tài sản nội dung",
        "competency_line": "Năng lực 3.2 · Mức 5–6",
        "objectives": [
          "Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo"
        ],
        "definitions": [
          "Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Tài sản nội dung: toàn bộ nội dung đã sản xuất (hình ảnh, văn bản, video) mà tổ chức sở hữu và có thể tái sử dụng",
          "Nội dung mô-đun: nội dung được thiết kế thành các khối nhỏ độc lập, có thể kết hợp lại theo nhiều cách khác nhau"
        ],
        "body": [
          "Ở mức nâng cao, việc đánh giá cách phù hợp nhất để tích hợp nội dung mới vào tri thức hiện có đòi hỏi xây dựng hệ thống quản trị tài sản nội dung cấp tổ chức.",
          "Một thư viện tài sản nội dung có tổ chức — phân loại theo chủ đề, loại nội dung, chiến dịch — giúp toàn bộ phận dễ tìm và tái sử dụng. Thiết kế nội dung theo hướng mô-đun (tách thành khối nhỏ độc lập) cho phép kết hợp linh hoạt cho nhiều mục đích khác nhau. Nội dung cần có chu kỳ rà soát định kỳ để phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ.",
          "Các bước. 1. Thiết kế cấu trúc thư mục và quy ước đặt tên thống nhất. 2. Gắn siêu dữ liệu: chủ đề, tác giả, ngày, giấy phép, thời hạn. 3. Phân quyền truy cập theo vai trò. 4. Thiết lập quy tắc lưu trữ, lưu bản gốc và xóa nội dung hết hạn. 5. Đo mức tái sử dụng để cải thiện kho."
        ],
        "examples": [
          "Ví dụ trong công việc. Công ty có hàng nghìn tệp ảnh, tài liệu, video nằm rải rác; mỗi lần cần lại phải làm mới từ đầu. Một kho tài sản nội dung có phân loại, siêu dữ liệu và quyền truy cập giúp tìm lại và tái sử dụng nhanh, đồng thời kiểm soát được phiên bản và thời hạn giấy phép."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Đặt tên tùy ý; không ghi giấy phép và thời hạn; phân quyền quá rộng; giữ mãi nội dung hết hiệu lực."
        ],
        "practice": [
          "Thiết kế thư viện tài sản nội dung cho doanh nghiệp, gồm cấu trúc phân loại, quy ước gắn thẻ và quy trình rà soát định kỳ."
        ],
        "deliverable": "Thiết kế thư viện nội dung và quy trình vận hành.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nội dung mô-đun là gì?",
            "options": [
              "Nội dung dài không thể chỉnh sửa",
              "Nội dung chỉ dùng một lần",
              "Nội dung được thiết kế thành khối nhỏ độc lập, có thể kết hợp linh hoạt",
              "Nội dung không cần phân loại"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là định nghĩa của thiết kế nội dung mô-đun."
          },
          {
            "number": 2,
            "question": "Vì sao cần chu kỳ rà soát nội dung định kỳ?",
            "options": [
              "Không cần thiết nếu nội dung đã xuất bản",
              "Chỉ để tăng số lượng nội dung",
              "Không có tác dụng thực tế",
              "Phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Nội dung lỗi thời còn tồn tại có thể gây hiểu lầm hoặc tổn hại uy tín."
          },
          {
            "number": 3,
            "question": "Bản địa hóa nội dung khi mở rộng thị trường bao gồm điều gì?",
            "options": [
              "Chỉ cần dịch ngôn ngữ",
              "Không cần điều chỉnh gì",
              "Chỉ áp dụng cho video",
              "Điều chỉnh cả ví dụ, hình ảnh cho phù hợp văn hóa địa phương"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Bản địa hóa toàn diện hơn việc dịch thuật đơn thuần."
          },
          {
            "number": 4,
            "question": "Hệ thống gắn thẻ trong thư viện nội dung có vai trò gì?",
            "options": [
              "Quyết định khả năng tìm kiếm hiệu quả của thư viện",
              "Không có vai trò cụ thể",
              "Chỉ để trang trí",
              "Làm chậm quá trình lưu trữ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Gắn thẻ nhất quán là yếu tố then chốt giúp tìm kiếm và tái sử dụng hiệu quả."
          },
          {
            "number": 5,
            "question": "Đo lường hiệu quả tái sử dụng nội dung có thể dựa trên chỉ số nào?",
            "options": [
              "Chỉ số lượt thích",
              "So sánh chi phí sản xuất mới với tái sử dụng, tỷ lệ nội dung được dùng lại",
              "Không thể đo lường được",
              "Chỉ dựa vào cảm nhận"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các chỉ số định lượng phản ánh hiệu quả của việc tái sử dụng."
          },
          {
            "number": 6,
            "question": "Kho tài sản nội dung cần gì để tìm lại nhanh?",
            "options": [
              "Nhiều thư mục lồng sâu",
              "Tên tệp tùy ý",
              "Quy ước đặt tên và siêu dữ liệu thống nhất",
              "Chỉ lưu trên máy cá nhân"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Phân loại giúp tìm kiếm."
          },
          {
            "number": 7,
            "question": "Vì sao nên ghi giấy phép và thời hạn vào siêu dữ liệu?",
            "options": [
              "Để tệp nặng hơn",
              "Để tránh dùng nội dung hết quyền sử dụng",
              "Để trang trí",
              "Không có lý do"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quản trị rủi ro bản quyền."
          },
          {
            "number": 8,
            "question": "Phân quyền truy cập theo vai trò nhằm mục đích gì?",
            "options": [
              "Chỉ đúng người được xem hoặc sửa tài sản phù hợp",
              "Cho mọi người sửa tất cả",
              "Khóa hết mọi người",
              "Không cần phân quyền"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nguyên tắc cấp quyền tối thiểu."
          },
          {
            "number": 9,
            "question": "Nội dung hết hạn giấy phép nên xử lý thế nào?",
            "options": [
              "Tiếp tục dùng",
              "Gỡ hoặc thay thế theo quy tắc lưu trữ",
              "Đổi tên rồi dùng lại",
              "Bỏ qua"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tránh vi phạm."
          },
          {
            "number": 10,
            "question": "Đo mức tái sử dụng tài sản nhằm gì?",
            "options": [
              "Biết tài sản nào hữu ích để cải thiện kho",
              "Để so sánh nhân viên",
              "Để tăng số tệp",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Số liệu giúp cải thiện."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Quản trị rủi ro pháp lý về nội dung",
        "competency_line": "Năng lực 3.3 · Mức 5–6",
        "objectives": [
          "Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số"
        ],
        "definitions": [
          "Sở hữu trí tuệ: quyền pháp lý đối với các sáng tạo trí tuệ như tác phẩm, thiết kế, nhãn hiệu",
          "Hồ sơ chứng minh quyền sử dụng: tài liệu lưu trữ chứng minh doanh nghiệp có quyền hợp pháp sử dụng một nội dung cụ thể"
        ],
        "body": [
          "Ở mức nâng cao, việc chọn quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép mở rộng thành quản trị rủi ro pháp lý cấp tổ chức — bản đồ rủi ro nội dung cần bao quát: hình ảnh không rõ nguồn gốc, nhạc nền chưa có bản quyền, phông chữ thương mại dùng trái phép, dữ liệu cá nhân trong nội dung marketing.",
          "Chính sách sở hữu trí tuệ nội bộ nên quy định rõ ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép khi cần sử dụng tài sản trí tuệ bên ngoài. Khi làm việc với đơn vị sản xuất bên ngoài, hợp đồng cần có điều khoản rõ ràng về việc chuyển giao bản quyền.",
          "Các bước. 1. Nhận diện các nhóm rủi ro: bản quyền, quyền hình ảnh, dữ liệu cá nhân, thông tin sai lệch, uy tín. 2. Xây chính sách sử dụng nội dung (gồm nội dung do AI hỗ trợ) và quy trình duyệt trước khi xuất bản. 3. Đào tạo nhân viên và lưu hồ sơ nguồn. 4. Có quy trình xử lý khiếu nại và gỡ nội dung. 5. Theo dõi thay đổi quy định và cập nhật chính sách.",
          "Lưu ý: đây là nội dung đào tạo chung, không phải tư vấn pháp lý. Các quy định về dữ liệu cá nhân và sở hữu trí tuệ có thể thay đổi; cần đối chiếu văn bản hiện hành và tham vấn chuyên môn pháp lý."
        ],
        "examples": [
          "Ví dụ trong công việc. Doanh nghiệp định dùng AI tạo hình ảnh quảng cáo trên quy mô lớn. Người ở bậc nâng cao lập bản đánh giá rủi ro: quyền sở hữu, dữ liệu huấn luyện của công cụ, thông tin nhạy cảm không được đưa vào, trách nhiệm kiểm duyệt trước khi đăng."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không có chính sách bằng văn bản; không phân biệt rủi ro theo mức độ; nhập dữ liệu khách hàng vào công cụ AI bên ngoài; không cập nhật chính sách."
        ],
        "practice": [
          "Rà soát rủi ro pháp lý cho toàn bộ kho nội dung đang sử dụng, soạn chính sách sở hữu trí tuệ nội bộ và điều khoản mẫu cho hợp đồng sản xuất."
        ],
        "deliverable": "Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khi thuê người làm tự do sản xuất nội dung mà không có điều khoản chuyển giao bản quyền, quyền sở hữu thuộc về ai?",
            "options": [
              "Luôn thuộc về bên thuê",
              "Không thuộc về ai",
              "Tự động thuộc về công chúng",
              "Có thể vẫn thuộc về người sáng tạo theo mặc định"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Không có điều khoản rõ ràng, quyền sở hữu mặc định có thể vẫn ở người tạo ra tác phẩm."
          },
          {
            "number": 2,
            "question": "Vì sao cần lưu hồ sơ chứng minh quyền sử dụng nội dung?",
            "options": [
              "Không cần thiết",
              "Là bằng chứng cần thiết khi có tranh chấp phát sinh",
              "Chỉ để lưu trữ hình thức",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hồ sơ đầy đủ bảo vệ doanh nghiệp khi bị khiếu nại hoặc tranh chấp bản quyền."
          },
          {
            "number": 3,
            "question": "Khi nhận được khiếu nại bản quyền, bước đầu tiên nên làm là gì?",
            "options": [
              "Phớt lờ khiếu nại",
              "Xác minh tính hợp lệ của khiếu nại trước khi phản hồi",
              "Ngay lập tức thừa nhận sai",
              "Xóa toàn bộ nội dung liên quan ngay lập tức"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Xác minh trước giúp có phản ứng phù hợp, tránh hành động vội vàng không cần thiết."
          },
          {
            "number": 4,
            "question": "Chính sách sở hữu trí tuệ nội bộ nên quy định điều gì?",
            "options": [
              "Ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép sử dụng tài sản bên ngoài",
              "Không cần quy định gì cụ thể",
              "Chỉ áp dụng cho quản lý cấp cao",
              "Chỉ liên quan đến IT"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các nội dung cốt lõi cần có trong chính sách sở hữu trí tuệ."
          },
          {
            "number": 5,
            "question": "Bản đồ rủi ro nội dung nên bao quát những nguồn rủi ro nào?",
            "options": [
              "Chỉ hình ảnh",
              "Chỉ văn bản",
              "Hình ảnh, nhạc, phông chữ, dữ liệu cá nhân, phát ngôn gây tranh cãi",
              "Chỉ liên quan đến video"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Rủi ro nội dung đến từ nhiều nguồn khác nhau, cần được rà soát toàn diện."
          },
          {
            "number": 6,
            "question": "Bước đầu tiên khi quản trị rủi ro pháp lý về nội dung là gì?",
            "options": [
              "Nhận diện và phân loại các nhóm rủi ro",
              "Cấm mọi nội dung",
              "Chờ có khiếu nại",
              "Giao hết cho một người"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần biết rủi ro trước khi xử lý."
          },
          {
            "number": 7,
            "question": "Có nên nhập dữ liệu cá nhân của khách hàng vào công cụ AI bên ngoài để tạo nội dung không?",
            "options": [
              "Có, vì tiện",
              "Có, nếu nhanh",
              "Không, trừ khi đã được phép và có biện pháp bảo vệ phù hợp",
              "Luôn được"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bảo vệ dữ liệu cá nhân."
          },
          {
            "number": 8,
            "question": "Chính sách nội dung nên có thành phần nào?",
            "options": [
              "Chỉ khẩu hiệu",
              "Quy tắc sử dụng, quy trình duyệt, trách nhiệm và hồ sơ nguồn",
              "Chỉ lời cảm ơn",
              "Chỉ hình ảnh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chính sách cần bằng văn bản và thực thi được."
          },
          {
            "number": 9,
            "question": "Vì sao cần quy trình xử lý khiếu nại?",
            "options": [
              "Để tránh trả lời",
              "Để xóa dấu vết",
              "Không cần",
              "Phản ứng nhanh, gỡ nội dung và giảm thiệt hại"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chuẩn bị trước giúp ứng phó tốt."
          },
          {
            "number": 10,
            "question": "Vì sao phải cập nhật chính sách định kỳ?",
            "options": [
              "Quy định và công nghệ thay đổi",
              "Để đổi giao diện",
              "Để tăng tài liệu",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Pháp lý và công cụ AI thay đổi nhanh."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Thiết kế giải pháp số cho nghiệp vụ",
        "competency_line": "Năng lực 3.4 · Mức 5–6",
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
          "Khi giải pháp nối nhiều bước tự động hóa với nhau (đầu ra của bước này là đầu vào của bước sau), cần lường trước rủi ro phụ thuộc: nếu một ứng dụng trong chuỗi ngừng hoạt động hoặc thay đổi cách vận hành, toàn bộ quy trình phía sau có thể bị gián đoạn theo — nên có phương án dự phòng hoặc cảnh báo sớm cho các bước quan trọng nhất trong chuỗi.",
          "Các bước. 1. Phân tích nghiệp vụ hiện tại: ai làm, dữ liệu đi đâu, điểm nghẽn ở đâu. 2. Xác định yêu cầu và tiêu chí thành công đo được. 3. Thiết kế giải pháp bằng công cụ sẵn có hoặc ít lập trình, ưu tiên đơn giản. 4. Chạy thử nhỏ, thu phản hồi, điều chỉnh trước khi mở rộng. 5. Đánh giá rủi ro (dữ liệu, phụ thuộc công cụ) và lập tài liệu hướng dẫn."
        ],
        "examples": [
          "Ví dụ trong công việc. Bộ phận chăm sóc khách hàng nhận yêu cầu bằng nhiều kênh, trả lời thủ công và chậm. Người ở bậc nâng cao thiết kế giải pháp số: gom yêu cầu vào một biểu mẫu, tự phân loại, giao việc và tạo báo cáo. Họ phân tích nghiệp vụ trước, chọn công cụ sau."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chọn công cụ trước khi hiểu nghiệp vụ; giải pháp quá phức tạp; không chạy thử; không có tài liệu bàn giao."
        ],
        "practice": [
          "Chọn một vấn đề nghiệp vụ thật, mô hình hóa dữ liệu và luồng xử lý, xây giải pháp tự động hóa và đánh giá hiệu quả."
        ],
        "deliverable": "Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Mô hình hóa dữ liệu bắt đầu từ việc gì?",
            "options": [
              "Xác định các thực thể, thuộc tính và mối quan hệ giữa chúng",
              "Viết mã lập trình ngay",
              "Chọn công cụ tự động hóa",
              "Tính chi phí thực hiện"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là bước nền tảng trước khi xây dựng bất kỳ giải pháp dữ liệu nào."
          },
          {
            "number": 2,
            "question": "Sơ đồ luồng xử lý cần chú ý điều gì ngoài luồng chính?",
            "options": [
              "Chỉ cần luồng chính là đủ",
              "Không cần quan tâm đến ngoại lệ",
              "Cần xử lý các trường hợp ngoại lệ như dữ liệu thiếu, lỗi hệ thống",
              "Ngoại lệ không quan trọng bằng tốc độ xử lý"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bỏ qua ngoại lệ khiến giải pháp dễ gặp lỗi khi vận hành thực tế."
          },
          {
            "number": 3,
            "question": "Rủi ro phụ thuộc trong tự động hóa nhiều bước là gì?",
            "options": [
              "Không có rủi ro gì",
              "Nếu một ứng dụng trong chuỗi ngừng hoạt động, toàn bộ quy trình có thể gián đoạn",
              "Chỉ ảnh hưởng đến tốc độ",
              "Không liên quan đến vận hành"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chuỗi tự động hóa phụ thuộc lẫn nhau, một điểm lỗi có thể ảnh hưởng toàn bộ."
          },
          {
            "number": 4,
            "question": "Khi nào nên chuyển từ công cụ không cần lập trình sang giải pháp lập trình chuyên nghiệp?",
            "options": [
              "Luôn nên dùng lập trình ngay từ đầu",
              "Khi vấn đề đòi hỏi logic phức tạp hoặc tích hợp sâu vượt khả năng công cụ hiện có",
              "Không bao giờ cần chuyển",
              "Khi chi phí thấp"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Công cụ không cần lập trình có giới hạn về độ phức tạp có thể xử lý."
          },
          {
            "number": 5,
            "question": "Khi mô tả yêu cầu cho đơn vị phát triển phần mềm, điều gì quan trọng hơn?",
            "options": [
              "Mô tả rõ vấn đề cần giải quyết, kết quả mong muốn, ràng buộc",
              "Chỉ định công nghệ cụ thể cần dùng",
              "Không cần mô tả chi tiết",
              "Chỉ cần đưa ngân sách"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Mô tả rõ vấn đề và kết quả mong muốn giúp đơn vị phát triển đề xuất giải pháp phù hợp nhất."
          },
          {
            "number": 6,
            "question": "Thiết kế giải pháp số nên bắt đầu từ đâu?",
            "options": [
              "Chọn công cụ mới nhất",
              "Mua phần mềm đắt nhất",
              "Sao chép đối thủ",
              "Phân tích nghiệp vụ và điểm nghẽn hiện tại"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Hiểu vấn đề trước."
          },
          {
            "number": 7,
            "question": "Tiêu chí thành công của giải pháp nên như thế nào?",
            "options": [
              "Mơ hồ",
              "Không cần",
              "Dựa cảm tính",
              "Cụ thể và đo được, ví dụ thời gian xử lý giảm"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đo được mới đánh giá được."
          },
          {
            "number": 8,
            "question": "Vì sao nên chạy thử quy mô nhỏ trước?",
            "options": [
              "Để chậm tiến độ",
              "Phát hiện vấn đề sớm với chi phí thấp",
              "Để tránh triển khai",
              "Không có lý do"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thử nghiệm giảm rủi ro."
          },
          {
            "number": 9,
            "question": "Nguyên tắc chọn công cụ cho giải pháp là gì?",
            "options": [
              "Phức tạp nhất",
              "Đắt nhất",
              "Đủ dùng, đơn giản, phù hợp năng lực đội ngũ",
              "Nhiều chức năng nhất"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ưu tiên đơn giản."
          },
          {
            "number": 10,
            "question": "Vì sao cần tài liệu bàn giao?",
            "options": [
              "Để người khác vận hành và bảo trì được giải pháp",
              "Để tăng số trang",
              "Để khoe công việc",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giải pháp phải bền vững."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M3-A — “Đề xuất hệ thống nội dung và giải pháp số cho bộ phận” (Assignment)",
      "context": "Bạn là người phụ trách nội dung số của một doanh nghiệp vừa và nhỏ (giả định). Ban lãnh đạo yêu cầu đề xuất một hệ thống sản xuất, quản trị nội dung an toàn pháp lý và một giải pháp số cho một nghiệp vụ cụ thể.",
      "requirements": "1. Viết chiến lược nội dung 1–2 trang: mục tiêu, đối tượng, loại nội dung ưu tiên, quy trình, vai trò, chỉ số. 2. Thiết kế kho tài sản nội dung: cấu trúc thư mục, quy ước đặt tên, siêu dữ liệu, phân quyền, quy tắc lưu trữ. 3. Lập bản đánh giá rủi ro pháp lý và chính sách nội dung (gồm nội dung do AI hỗ trợ), có quy trình duyệt và xử lý khiếu nại. 4. Chọn một nghiệp vụ, phân tích hiện trạng, thiết kế giải pháp số, nêu tiêu chí thành công và kế hoạch chạy thử. 5. Nêu hạn chế, rủi ro còn lại và lộ trình triển khai.",
      "deliverables": "Tài liệu chiến lược; sơ đồ kho tài sản; chính sách và bản đánh giá rủi ro; thiết kế giải pháp và kế hoạch thử; lộ trình.\nHình thức nộp. Một tài liệu tổng hợp kèm sơ đồ.",
      "rubric": [
        "Gợi ý. Dùng dữ liệu giả định. Các nhận định pháp lý cần ghi chú đối chiếu văn bản hiện hành, không khẳng định tuyệt đối.",
        "Tiêu chí",
        "Điểm",
        "Chiến lược nội dung gắn mục tiêu, có chỉ số đo",
        "25",
        "Kho tài sản và quy tắc quản trị hợp lý",
        "20",
        "Chính sách và đánh giá rủi ro pháp lý thận trọng, đầy đủ",
        "25",
        "Giải pháp số khả thi, có tiêu chí thành công và kế hoạch thử",
        "30"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Chiến lược nội dung cần gắn với điều gì?",
        "options": [
          "Sở thích cá nhân",
          "Công cụ mới nhất",
          "Số bài đăng",
          "Mục tiêu kinh doanh và đối tượng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Chiến lược phục vụ mục tiêu."
      },
      {
        "number": 2,
        "question": "Vì sao cần phân vai trong sản xuất nội dung?",
        "options": [
          "Tránh trùng lặp và đảm bảo trách nhiệm",
          "Để tăng người",
          "Để chậm tiến độ",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Vai trò rõ giúp vận hành."
      },
      {
        "number": 3,
        "question": "Chỉ số nào phù hợp nhất để đo hiệu quả?",
        "options": [
          "Chỉ lượt xem",
          "Chỉ số gắn với mục tiêu như liên hệ, đơn hàng",
          "Số chữ",
          "Số tệp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đo theo mục tiêu."
      },
      {
        "number": 4,
        "question": "Hướng dẫn giọng văn chung giúp gì?",
        "options": [
          "Làm bài giống hệt",
          "Không giúp gì",
          "Nội dung từ nhiều người vẫn nhất quán",
          "Chỉ để trang trí"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Nhất quán thương hiệu."
      },
      {
        "number": 5,
        "question": "Vì sao rà soát chiến lược định kỳ?",
        "options": [
          "Để thay đổi liên tục",
          "Tăng chi phí",
          "Không cần",
          "Điều chỉnh theo số liệu và thay đổi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cải tiến liên tục."
      },
      {
        "number": 6,
        "question": "Điều gì giúp tìm lại tài sản nội dung nhanh?",
        "options": [
          "Quy ước đặt tên và siêu dữ liệu",
          "Tên ngẫu nhiên",
          "Thư mục sâu",
          "Lưu cá nhân"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Phân loại tốt."
      },
      {
        "number": 7,
        "question": "Vì sao ghi giấy phép trong siêu dữ liệu?",
        "options": [
          "Để tệp nặng",
          "Tránh dùng nội dung hết quyền",
          "Để trang trí",
          "Không có lý do"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giảm rủi ro bản quyền."
      },
      {
        "number": 8,
        "question": "Phân quyền truy cập theo vai trò nhằm gì?",
        "options": [
          "Mở cho tất cả",
          "Khóa tất cả",
          "Không cần",
          "Chỉ đúng người xem hoặc sửa phần phù hợp"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cấp quyền tối thiểu."
      },
      {
        "number": 9,
        "question": "Nội dung hết hạn giấy phép cần làm gì?",
        "options": [
          "Gỡ hoặc thay thế theo quy tắc lưu trữ",
          "Dùng tiếp",
          "Đổi tên dùng lại",
          "Bỏ qua"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Tránh vi phạm."
      },
      {
        "number": 10,
        "question": "Đo mức tái sử dụng để làm gì?",
        "options": [
          "So sánh nhân viên",
          "Biết tài sản nào hữu ích để cải thiện kho",
          "Tăng số tệp",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Số liệu cải thiện kho."
      },
      {
        "number": 11,
        "question": "Bước đầu quản trị rủi ro pháp lý là gì?",
        "options": [
          "Cấm hết",
          "Chờ khiếu nại",
          "Nhận diện và phân loại rủi ro",
          "Giao một người"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Biết rủi ro trước."
      },
      {
        "number": 12,
        "question": "Dữ liệu cá nhân khách hàng có nên nhập vào công cụ AI bên ngoài?",
        "options": [
          "Có, vì tiện",
          "Có, nếu nhanh",
          "Không, trừ khi được phép và có biện pháp bảo vệ",
          "Luôn được"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Bảo vệ dữ liệu cá nhân."
      },
      {
        "number": 13,
        "question": "Chính sách nội dung nên có gì?",
        "options": [
          "Chỉ khẩu hiệu",
          "Quy tắc, quy trình duyệt, trách nhiệm, hồ sơ nguồn",
          "Chỉ hình ảnh",
          "Chỉ lời cảm ơn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cần thực thi được."
      },
      {
        "number": 14,
        "question": "Quy trình xử lý khiếu nại giúp gì?",
        "options": [
          "Phản ứng nhanh và giảm thiệt hại",
          "Tránh trả lời",
          "Xóa dấu vết",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Chuẩn bị trước."
      },
      {
        "number": 15,
        "question": "Vì sao cập nhật chính sách định kỳ?",
        "options": [
          "Đổi giao diện",
          "Tăng tài liệu",
          "Quy định và công nghệ thay đổi",
          "Không cần"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Pháp lý thay đổi."
      },
      {
        "number": 16,
        "question": "Thiết kế giải pháp số bắt đầu từ đâu?",
        "options": [
          "Chọn công cụ mới",
          "Mua đắt nhất",
          "Sao chép đối thủ",
          "Phân tích nghiệp vụ và điểm nghẽn"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Hiểu vấn đề."
      },
      {
        "number": 17,
        "question": "Tiêu chí thành công cần như thế nào?",
        "options": [
          "Cụ thể, đo được",
          "Mơ hồ",
          "Không cần",
          "Cảm tính"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Đo được mới đánh giá."
      },
      {
        "number": 18,
        "question": "Vì sao chạy thử quy mô nhỏ?",
        "options": [
          "Chậm tiến độ",
          "Tránh triển khai",
          "Không lý do",
          "Phát hiện vấn đề sớm, chi phí thấp"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Giảm rủi ro."
      },
      {
        "number": 19,
        "question": "Nguyên tắc chọn công cụ?",
        "options": [
          "Phức tạp nhất",
          "Đủ dùng, đơn giản, hợp năng lực đội ngũ",
          "Đắt nhất",
          "Nhiều chức năng nhất"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Ưu tiên đơn giản."
      },
      {
        "number": 20,
        "question": "Vì sao cần tài liệu bàn giao?",
        "options": [
          "Tăng số trang",
          "Khoe công việc",
          "Để người khác vận hành và bảo trì",
          "Không cần"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giải pháp bền vững."
      }
    ]
  },
  "M4-F": {
    "code": "M4-F",
    "title": "AN TOÀN SỐ CƠ BẢN",
    "domain_number": 4,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Bảo vệ thiết bị và tài khoản",
        "competency_line": "Năng lực 4.1 · Mức 1–2",
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
          "Xác thực hai lớp bổ sung một lớp bảo vệ: kể cả khi mật khẩu bị lộ, kẻ xấu vẫn cần thêm mã xác thực mới đăng nhập được. Cập nhật hệ điều hành và ứng dụng thường xuyên vá các lỗ hổng bảo mật đã biết. Dấu hiệu thiết bị bất thường bao gồm pin hết nhanh, thiết bị nóng hoặc chạy chậm không rõ nguyên nhân.",
          "Các bước. 1. Liệt kê các tài khoản công việc đang dùng. 2. Đặt mật khẩu dài, khác nhau cho từng tài khoản; dùng trình quản lý mật khẩu nếu được cho phép. 3. Bật xác thực hai lớp cho tài khoản quan trọng trước (email, hệ thống nội bộ). 4. Bật cập nhật tự động cho hệ điều hành và ứng dụng. 5. Khóa màn hình khi rời máy và không chia sẻ mật khẩu hay mã xác thực."
        ],
        "examples": [
          "Ví dụ trong công việc. Một nhân viên dùng chung một mật khẩu cho email công ty, mạng xã hội và ứng dụng mua sắm. Khi ứng dụng mua sắm bị lộ dữ liệu, kẻ xấu thử mật khẩu đó vào email công ty và vào được hộp thư chứa báo giá, hợp đồng. Mỗi tài khoản một mật khẩu riêng và bật xác thực hai lớp sẽ chặn được kịch bản này."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Dùng lại mật khẩu; ghi mật khẩu trên giấy dán gần máy; trì hoãn cập nhật; bỏ qua cảnh báo đăng nhập lạ."
        ],
        "practice": [
          "Rà soát các tài khoản công việc đang dùng (liệt kê tối thiểu 5 tài khoản: email, hệ thống nội bộ, mạng xã hội công ty…), bật xác thực hai lớp cho tối thiểu 3 tài khoản quan trọng nhất, và kiểm tra tình trạng cập nhật của thiết bị đang dùng."
        ],
        "deliverable": "Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiết bị.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao không nên dùng lại cùng một mật khẩu cho nhiều tài khoản?",
            "options": [
              "Vì mất nhiều thời gian gõ hơn",
              "Nếu một dịch vụ bị lộ dữ liệu, các tài khoản khác dùng chung mật khẩu cũng gặp rủi ro",
              "Vì hệ thống sẽ báo lỗi",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Lộ mật khẩu ở một nơi có thể kéo theo rủi ro cho toàn bộ tài khoản dùng chung mật khẩu đó."
          },
          {
            "number": 2,
            "question": "Xác thực hai lớp bổ sung điều gì so với chỉ dùng mật khẩu?",
            "options": [
              "Không có gì khác biệt",
              "Làm chậm quá trình đăng nhập không cần thiết",
              "Yêu cầu thêm một bước xác nhận, bảo vệ tài khoản kể cả khi mật khẩu bị lộ",
              "Chỉ dùng cho tài khoản ngân hàng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "2FA là lớp bảo vệ bổ sung, hữu ích ngay cả khi mật khẩu đã bị lộ."
          },
          {
            "number": 3,
            "question": "Vì sao nên cập nhật thiết bị và phần mềm thường xuyên?",
            "options": [
              "Các bản cập nhật thường vá lỗ hổng bảo mật đã biết",
              "Chỉ để có giao diện mới",
              "Không có lý do liên quan bảo mật",
              "Chỉ để tăng dung lượng lưu trữ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cập nhật là cách chính để đóng các lỗ hổng bảo mật đã được phát hiện."
          },
          {
            "number": 4,
            "question": "Dấu hiệu nào sau đây có thể cho thấy thiết bị bị xâm nhập?",
            "options": [
              "Thiết bị đang sạc pin bình thường",
              "Có bản cập nhật mới",
              "Pin hết nhanh bất thường, xuất hiện ứng dụng lạ",
              "Wifi kết nối chậm do mạng yếu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là các dấu hiệu bất thường cần lưu ý kiểm tra thêm."
          },
          {
            "number": 5,
            "question": "Trình quản lý mật khẩu giúp ích gì?",
            "options": [
              "Tạo và lưu mật khẩu riêng biệt, đủ mạnh cho từng tài khoản",
              "Không có tác dụng thực tế",
              "Chỉ dùng để ghi chú",
              "Làm chậm máy tính"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là công dụng chính, giúp người dùng không cần nhớ nhiều mật khẩu phức tạp."
          },
          {
            "number": 6,
            "question": "Email công ty và mạng xã hội cùng dùng một mật khẩu. Rủi ro chính là gì?",
            "options": [
              "Mật khẩu sẽ hết hạn nhanh hơn",
              "Một nơi bị lộ thì các tài khoản còn lại cũng bị đe dọa",
              "Máy tính chạy chậm hơn",
              "Không có rủi ro gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Dùng lại mật khẩu khiến một vụ lộ lan sang nhiều tài khoản."
          },
          {
            "number": 7,
            "question": "Mật khẩu nào mạnh hơn?",
            "options": [
              "Cụm dài, kết hợp nhiều loại ký tự, không chứa thông tin cá nhân",
              "Ngày sinh của bạn",
              "123456",
              "Tên công ty viết thường"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Độ dài và tính khó đoán quyết định độ mạnh."
          },
          {
            "number": 8,
            "question": "Bạn nhận được mã xác thực mà mình không yêu cầu. Nên làm gì?",
            "options": [
              "Gửi mã cho người đang liên hệ",
              "Không chia sẻ mã, đổi mật khẩu và báo bộ phận hỗ trợ",
              "Bỏ qua và xóa tin",
              "Đăng mã lên nhóm chat"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mã không yêu cầu có thể cho thấy người khác đang thử đăng nhập."
          },
          {
            "number": 9,
            "question": "Vì sao nên bật cập nhật tự động?",
            "options": [
              "Để đổi giao diện",
              "Để tiết kiệm dung lượng ngay lập tức",
              "Để tăng độ sáng màn hình",
              "Vá sớm các lỗ hổng bảo mật đã biết"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cập nhật vá lỗ hổng mà kẻ xấu có thể khai thác."
          },
          {
            "number": 10,
            "question": "Khi rời bàn làm việc vài phút, hành động đúng là gì?",
            "options": [
              "Để nguyên vì chỉ đi một lát",
              "Tắt đèn bàn",
              "Rút dây chuột",
              "Khóa màn hình"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Khóa màn hình ngăn người khác dùng máy của bạn."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Bảo vệ thông tin cá nhân",
        "competency_line": "Năng lực 4.2 · Mức 1–2",
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
          "Nguyên tắc an toàn cơ bản: không bấm vào liên kết lạ, không bao giờ cung cấp mã xác thực cho bất kỳ ai qua điện thoại. Trên điện thoại, nên rà soát định kỳ và thu hồi quyền truy cập ứng dụng không cần thiết. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân loại thành dữ liệu cơ bản và dữ liệu nhạy cảm, cần mức độ bảo vệ khác nhau.",
          "Các bước. 1. Nhận biết thông tin cá nhân của mình và của khách hàng (họ tên, số điện thoại, địa chỉ, hình ảnh, số căn cước). 2. Kiểm tra người gửi, đường dẫn và mức độ khẩn cấp bất thường trước khi phản hồi. 3. Không bao giờ cung cấp mã xác thực qua điện thoại hay tin nhắn. 4. Rà soát và thu hồi quyền ứng dụng không cần thiết trên điện thoại. 5. Đọc phần tóm tắt chính sách quyền riêng tư: dữ liệu nào được thu thập, dùng để làm gì, chia sẻ cho ai. 6. Nghi ngờ lộ thông tin: đổi mật khẩu liên quan, báo người phụ trách.",
          "Lưu ý: nội dung pháp lý trong khóa là kiến thức nền, không phải tư vấn pháp lý; quy định về dữ liệu cá nhân có thể thay đổi nên cần đối chiếu văn bản hiện hành."
        ],
        "examples": [
          "Ví dụ trong công việc. Kế toán nhận email tự xưng ngân hàng, yêu cầu “xác minh tài khoản trong 30 phút nếu không sẽ bị khóa”, kèm đường dẫn. Giọng điệu gấp gáp, địa chỉ gửi lạ và đường dẫn không khớp tên miền ngân hàng là ba dấu hiệu cần dừng lại. Cách xử lý đúng là không bấm, liên hệ ngân hàng qua kênh chính thức và báo cho bộ phận phụ trách."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Bấm đường dẫn vì sợ bị khóa tài khoản; cấp quyền ứng dụng mà không đọc; chia sẻ ảnh giấy tờ qua kênh không an toàn."
        ],
        "practice": [
          "Phân tích 5 email/tin nhắn mẫu (tự tìm hoặc dùng email lạ từng nhận được), xác định cái nào là lừa đảo và chỉ ra dấu hiệu; rà soát quyền ứng dụng trên điện thoại cá nhân."
        ],
        "deliverable": "Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Dấu hiệu điển hình của một email lừa đảo là gì?",
            "options": [
              "Tạo cảm giác khẩn cấp, yêu cầu cung cấp thông tin qua liên kết",
              "Địa chỉ gửi chính xác 100%",
              "Không có yêu cầu hành động gì",
              "Gửi từ đồng nghiệp quen biết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tạo áp lực thời gian và yêu cầu hành động ngay là chiến thuật phổ biến của lừa đảo."
          },
          {
            "number": 2,
            "question": "Khi nhận được yêu cầu cung cấp mã OTP qua điện thoại, nên làm gì?",
            "options": [
              "Cung cấp ngay nếu người gọi tự xưng là ngân hàng",
              "Cung cấp nếu họ biết tên mình",
              "Tùy vào giọng điệu người gọi",
              "Từ chối — không tổ chức hợp pháp nào yêu cầu mã OTP qua điện thoại"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mã OTP không bao giờ nên được chia sẻ qua điện thoại với bất kỳ ai."
          },
          {
            "number": 3,
            "question": "Một ứng dụng đèn pin xin quyền truy cập danh bạ. Đây có phải dấu hiệu đáng ngờ không?",
            "options": [
              "Có, ứng dụng đèn pin không có lý do chính đáng cần quyền này",
              "Không, đây là điều bình thường",
              "Chỉ đáng ngờ nếu ứng dụng miễn phí",
              "Không cần quan tâm đến quyền ứng dụng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quyền yêu cầu không liên quan đến chức năng ứng dụng là dấu hiệu cần cảnh giác."
          },
          {
            "number": 4,
            "question": "Khi nghi ngờ thông tin cá nhân bị lộ, bước đầu tiên nên làm là gì?",
            "options": [
              "Không làm gì, chờ xem có vấn đề gì xảy ra không",
              "Đổi mật khẩu tài khoản liên quan và bật xác thực hai lớp",
              "Xóa toàn bộ tài khoản",
              "Đổi số điện thoại ngay lập tức"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là hành động phòng ngừa nhanh và hiệu quả nhất khi nghi ngờ có sự cố."
          },
          {
            "number": 5,
            "question": "Thông tin nào sau đây được coi là thông tin cá nhân?",
            "options": [
              "Giá sản phẩm của công ty",
              "Tỷ giá ngoại tệ",
              "Thời tiết hôm nay",
              "Số điện thoại và địa chỉ nhà"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là thông tin gắn liền và giúp xác định một cá nhân cụ thể."
          },
          {
            "number": 6,
            "question": "Dấu hiệu nào cho thấy email có thể là lừa đảo?",
            "options": [
              "Có chữ ký công ty",
              "Được gửi vào giờ hành chính",
              "Giục gấp, địa chỉ gửi lạ, đường dẫn không khớp tên miền chính thức",
              "Có tiêu đề ngắn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Gấp gáp và đường dẫn lạ là dấu hiệu điển hình."
          },
          {
            "number": 7,
            "question": "Một người tự xưng nhân viên ngân hàng gọi hỏi mã OTP. Bạn nên làm gì?",
            "options": [
              "Đọc mã vì họ biết tên bạn",
              "Từ chối cung cấp và liên hệ ngân hàng qua kênh chính thức",
              "Gửi mã qua tin nhắn",
              "Đọc một nửa mã"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mã xác thực không được chia sẻ cho bất kỳ ai."
          },
          {
            "number": 8,
            "question": "Ứng dụng đèn pin xin quyền truy cập danh bạ. Bạn nên làm gì?",
            "options": [
              "Từ chối vì quyền đó không cần cho chức năng của ứng dụng",
              "Đồng ý cho nhanh",
              "Đồng ý rồi tắt sau",
              "Chia sẻ ứng dụng cho đồng nghiệp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quyền cần tương xứng với chức năng."
          },
          {
            "number": 9,
            "question": "Thông tin nào được xem là thông tin cá nhân?",
            "options": [
              "Tên một loại sản phẩm",
              "Giờ mở cửa của cửa hàng",
              "Họ tên, số điện thoại, địa chỉ, hình ảnh của một người",
              "Khẩu hiệu quảng cáo chung"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thông tin gắn với hoặc giúp xác định một người là thông tin cá nhân."
          },
          {
            "number": 10,
            "question": "Bạn nghi ngờ thông tin cá nhân của mình đã bị lộ. Việc đầu tiên nên làm là gì?",
            "options": [
              "Chờ xem có chuyện gì xảy ra",
              "Đổi mật khẩu các tài khoản liên quan và báo người phụ trách",
              "Đăng lên mạng xã hội",
              "Xóa toàn bộ ứng dụng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hành động sớm giảm thiệt hại."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Sức khỏe khi làm việc với thiết bị số",
        "competency_line": "Năng lực 4.3 · Mức 1–2",
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
          "Bên cạnh việc phòng tránh rủi ro, công nghệ số cũng có thể được dùng theo hướng tích cực để tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội — ví dụ các ứng dụng theo dõi giấc ngủ và vận động giúp duy trì thói quen lành mạnh, các nền tảng kết nối cộng đồng giúp người dùng tìm được nhóm hỗ trợ phù hợp, hoặc các công cụ thiền định/thư giãn trực tuyến giúp giảm căng thẳng. Nhận biết được những công nghệ này giúp người dùng chủ động sử dụng công nghệ số theo hướng có lợi cho sức khỏe tinh thần, không chỉ dừng ở việc phòng thủ trước rủi ro.",
          "Các bước. 1. Đặt mép trên màn hình ngang hoặc thấp hơn tầm mắt, cách mắt khoảng 50–70 cm. 2. Áp dụng quy tắc 20-20-20: cứ 20 phút nhìn xa 20 giây. 3. Ngồi tựa lưng, chân đặt phẳng; đứng dậy vận động định kỳ. 4. Tắt thông báo ngoài giờ làm việc; quản lý số lượng kênh nhận tin. 5. Gặp hành vi quấy rối hoặc bắt nạt trên mạng: lưu bằng chứng, không đáp trả, báo người phụ trách. 6. Khi căng thẳng kéo dài, trao đổi với quản lý hoặc người đáng tin cậy."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên văn phòng làm việc nhiều giờ liền, màn hình đặt thấp, thông báo công việc đến cả buổi tối. Sau vài tuần xuất hiện đau cổ, mỏi mắt và khó ngủ. Điều chỉnh vị trí màn hình, nghỉ ngắn đều đặn và tắt thông báo ngoài giờ là những thay đổi nhỏ có tác dụng rõ."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Ngồi cúi gập nhiều giờ; kiểm tra tin nhắn công việc liên tục; bỏ qua dấu hiệu mệt mỏi kéo dài."
        ],
        "practice": [
          "Chụp ảnh và đánh giá chỗ làm việc hiện tại theo danh mục kiểm tra dưới đây, thực hiện điều chỉnh và ghi lại.",
          "Danh mục kiểm tra chỗ làm việc:",
          "Tiêu chí",
          "Đạt (✓/✗)",
          "Mép trên màn hình ngang hoặc thấp hơn tầm mắt",
          "Khoảng cách mắt-màn hình 50–70cm",
          "Lưng được ghế hỗ trợ, không cúi gập",
          "Chân đặt phẳng trên sàn hoặc kệ",
          "Có đủ ánh sáng, không bị chói màn hình"
        ],
        "deliverable": "Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Quy tắc 20-20-20 nghĩa là gì?",
            "options": [
              "Làm việc 20 phút nghỉ 20 giờ",
              "Mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây",
              "Nghỉ 20 phút mỗi 20 giờ làm việc",
              "Không có quy tắc như vậy"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là nguyên tắc giúp giảm mỏi mắt khi làm việc lâu với màn hình."
          },
          {
            "number": 2,
            "question": "Vị trí màn hình đúng nên như thế nào?",
            "options": [
              "Cao hơn tầm mắt nhiều",
              "Không quan trọng vị trí",
              "Càng gần mắt càng tốt",
              "Mép trên ngang hoặc thấp hơn tầm mắt một chút"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Vị trí này giúp giảm căng thẳng cổ và mắt khi làm việc lâu."
          },
          {
            "number": 3,
            "question": "Dấu hiệu nào cho thấy quá tải thông tin?",
            "options": [
              "Cảm thấy thư giãn khi kiểm tra điện thoại",
              "Khó tập trung vì liên tục bị gián đoạn bởi thông báo",
              "Không có thông báo nào",
              "Làm việc hiệu quả hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là dấu hiệu điển hình của quá tải thông tin."
          },
          {
            "number": 4,
            "question": "Vì sao nên tắt thông báo công việc ngoài giờ?",
            "options": [
              "Giúp thiết lập ranh giới rõ ràng giữa làm việc và nghỉ ngơi",
              "Không cần thiết",
              "Sẽ bị đánh giá là thiếu trách nhiệm",
              "Không có lợi ích gì"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ranh giới rõ ràng giúp bảo vệ thời gian nghỉ ngơi cần thiết."
          },
          {
            "number": 5,
            "question": "Khi căng thẳng công việc kéo dài, nên làm gì?",
            "options": [
              "Tìm đến sự hỗ trợ chuyên môn khi cần thiết",
              "Tự chịu đựng một mình",
              "Bỏ qua vì đây là chuyện bình thường",
              "Không nên chia sẻ với ai"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tìm hỗ trợ chuyên môn khi cần là hành động phù hợp và nên được khuyến khích."
          },
          {
            "number": 6,
            "question": "Quy tắc 20-20-20 nghĩa là gì?",
            "options": [
              "Làm 20 phút, nghỉ 20 giờ",
              "Uống 20 ly nước mỗi ngày",
              "Cứ 20 phút nhìn xa khoảng 20 feet trong 20 giây",
              "Gõ 20 từ mỗi phút"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy tắc giúp giảm mỏi mắt."
          },
          {
            "number": 7,
            "question": "Vị trí màn hình phù hợp là gì?",
            "options": [
              "Cao hơn đầu",
              "Mép trên ngang hoặc thấp hơn tầm mắt, cách khoảng 50–70 cm",
              "Sát mặt",
              "Đặt nghiêng sang bên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tư thế đúng giảm đau cổ và mỏi mắt."
          },
          {
            "number": 8,
            "question": "Dấu hiệu nào cho thấy quá tải thông tin?",
            "options": [
              "Làm việc nhanh hơn bình thường",
              "Ngủ đủ giấc",
              "Khó tập trung, bỏ sót việc, cảm thấy ngợp trước số lượng tin nhắn",
              "Hứng thú hơn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quá tải làm giảm khả năng tập trung."
          },
          {
            "number": 9,
            "question": "Vì sao nên tắt thông báo công việc ngoài giờ?",
            "options": [
              "Để máy chạy nhanh",
              "Để tránh dùng điện thoại",
              "Để tiết kiệm pin hoàn toàn",
              "Để có thời gian nghỉ ngơi và giảm căng thẳng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Nghỉ ngơi đủ giúp duy trì sức khỏe."
          },
          {
            "number": 10,
            "question": "Bạn bị bắt nạt trên mạng trong nhóm làm việc. Việc nên làm là gì?",
            "options": [
              "Lưu bằng chứng và báo người phụ trách",
              "Đáp trả bằng lời lẽ tương tự",
              "Rời công ty ngay",
              "Xóa hết tin nhắn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Bằng chứng giúp xử lý đúng cách."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Sử dụng công nghệ có ý thức môi trường",
        "competency_line": "Năng lực 4.4 · Mức 1–2",
        "objectives": [
          "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường"
        ],
        "definitions": [
          "Vòng đời thiết bị: toàn bộ quá trình từ sản xuất, sử dụng đến thải bỏ một thiết bị điện tử",
          "Rác thải điện tử: thiết bị điện tử đã hỏng hoặc không còn sử dụng, cần được xử lý đúng cách để tránh ô nhiễm"
        ],
        "body": [
          "Bảo vệ môi trường nghĩa là nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Mỗi thiết bị điện tử đều có tác động môi trường trong suốt vòng đời: khai thác nguyên liệu, tiêu thụ năng lượng khi sử dụng, trở thành rác thải khi loại bỏ.",
          "Thói quen tiết kiệm năng lượng đơn giản gồm tắt máy tính khi không dùng, bật chế độ tiết kiệm năng lượng. Khi thiết bị cần thải bỏ, cần đưa đến điểm thu gom rác thải điện tử chuyên biệt và xóa sạch dữ liệu cá nhân trước khi thải bỏ.",
          "Các bước. 1. Nhận ra tác động môi trường của thiết bị trong cả vòng đời: sản xuất, sử dụng, thải bỏ. 2. Bật chế độ tiết kiệm năng lượng và tắt thiết bị khi không dùng. 3. Kéo dài tuổi thọ thiết bị bằng cách giữ gìn, sửa chữa khi có thể. 4. Xóa dữ liệu cá nhân trước khi thải bỏ; đưa đến điểm thu gom rác thải điện tử. 5. Dọn dẹp tệp và thư không cần thiết trên dịch vụ lưu trữ, vì lưu trữ đám mây cũng tiêu thụ năng lượng."
        ],
        "examples": [
          "Ví dụ trong công việc. Một văn phòng 20 máy tính, nhiều máy vẫn bật suốt đêm; thiết bị cũ bị bỏ vào thùng rác chung dù còn chứa dữ liệu. Tắt máy khi không dùng, bật chế độ tiết kiệm năng lượng, đưa thiết bị cũ đến điểm thu gom rác thải điện tử và xóa sạch dữ liệu trước khi bỏ là các việc đơn giản mà ai cũng làm được."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Bỏ thiết bị cũ vào rác sinh hoạt; để thiết bị bật liên tục; thay mới khi còn dùng tốt."
        ],
        "practice": [
          "Đánh giá thói quen sử dụng công nghệ của bản thân hoặc bộ phận trong một tuần, đề xuất 5 thay đổi khả thi và ước tính tác động."
        ],
        "deliverable": "Bảng đánh giá thói quen và 5 đề xuất cải thiện.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Dịch vụ lưu trữ đám mây có tác động môi trường không?",
            "options": [
              "Có, vì trung tâm dữ liệu tiêu thụ năng lượng thực tế",
              "Không, vì không dùng thiết bị vật lý",
              "Chỉ có tác động nếu dùng miễn phí",
              "Không có cách nào đo lường được"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Trung tâm dữ liệu vận hành đám mây vẫn tiêu thụ điện năng đáng kể trong thực tế."
          },
          {
            "number": 2,
            "question": "Vì sao nên xóa dữ liệu cá nhân trước khi thải bỏ thiết bị điện tử?",
            "options": [
              "Để tránh rủi ro rò rỉ thông tin cá nhân",
              "Không cần thiết",
              "Chỉ để tiết kiệm dung lượng",
              "Không có lý do liên quan bảo mật"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Thiết bị thải bỏ có thể vẫn chứa dữ liệu nhạy cảm nếu không được xóa đúng cách."
          },
          {
            "number": 3,
            "question": "Rác thải điện tử nên được xử lý như thế nào?",
            "options": [
              "Bỏ chung với rác sinh hoạt",
              "Đốt tại nhà",
              "Đưa đến điểm thu gom rác thải điện tử chuyên biệt",
              "Không cần xử lý đặc biệt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xử lý đúng cách giúp giảm ô nhiễm môi trường từ các chất độc hại trong thiết bị điện tử."
          },
          {
            "number": 4,
            "question": "Kéo dài tuổi thọ thiết bị bằng cách nào?",
            "options": [
              "Thay mới ngay khi có phiên bản mới",
              "Không bảo trì thiết bị",
              "Sử dụng liên tục không nghỉ",
              "Sửa chữa khi có thể thay vì thay mới ngay"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sửa chữa và bảo trì giúp kéo dài vòng đời thiết bị, giảm rác thải điện tử."
          },
          {
            "number": 5,
            "question": "Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì?",
            "options": [
              "Giảm phát thải gián tiếp từ việc đi lại",
              "Không có lợi ích gì",
              "Chỉ tiết kiệm thời gian",
              "Không liên quan đến môi trường"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giảm nhu cầu di chuyển góp phần giảm phát thải khí nhà kính gián tiếp."
          },
          {
            "number": 6,
            "question": "Dịch vụ lưu trữ đám mây có tác động môi trường không?",
            "options": [
              "Không, vì không có thiết bị vật lý",
              "Có, vì trung tâm dữ liệu tiêu thụ năng lượng",
              "Chỉ khi dùng điện thoại",
              "Chỉ khi lưu ảnh"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Dữ liệu vẫn nằm trên máy chủ cần điện và làm mát."
          },
          {
            "number": 7,
            "question": "Vì sao phải xóa dữ liệu trước khi thải bỏ thiết bị?",
            "options": [
              "Để thiết bị nhẹ hơn",
              "Để thông tin cá nhân và công việc không bị người khác lấy lại",
              "Để dễ bán hơn",
              "Không cần thiết"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Dữ liệu còn lại có thể bị khai thác."
          },
          {
            "number": 8,
            "question": "Rác thải điện tử nên xử lý thế nào?",
            "options": [
              "Bỏ vào rác sinh hoạt",
              "Đốt",
              "Đưa đến điểm thu gom chuyên biệt",
              "Chôn tại chỗ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thiết bị chứa chất cần xử lý riêng."
          },
          {
            "number": 9,
            "question": "Cách nào kéo dài tuổi thọ thiết bị?",
            "options": [
              "Thay mới mỗi năm",
              "Giữ gìn, bảo dưỡng và sửa chữa khi cần",
              "Để máy luôn bật",
              "Dùng sạc kém chất lượng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Dùng lâu hơn giảm rác thải."
          },
          {
            "number": 10,
            "question": "Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì?",
            "options": [
              "Không có lợi ích",
              "Tăng tiêu thụ giấy",
              "Tăng rác thải",
              "Giảm phát thải từ việc đi lại"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Giảm di chuyển giảm phát thải."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M4-F — “Bộ kiểm tra an toàn số cá nhân” (Assignment)",
      "context": "Bạn mới nhận máy tính và các tài khoản công việc. Trưởng nhóm yêu cầu bạn tự rà soát mức an toàn số của mình và lập kế hoạch cải thiện trong hai tuần.",
      "requirements": "1. Liệt kê ít nhất 5 tài khoản công việc, ghi rõ mật khẩu có riêng biệt không (không ghi mật khẩu thật), đã bật xác thực hai lớp chưa; bật thêm cho ít nhất 3 tài khoản quan trọng. 2. Kiểm tra tình trạng cập nhật và khóa màn hình trên thiết bị. 3. Phân tích 5 email hoặc tin nhắn mẫu, xác định tin nào đáng ngờ và chỉ ra dấu hiệu; rà soát quyền ứng dụng trên điện thoại. 4. Đánh giá chỗ làm việc trước và sau điều chỉnh theo danh mục kiểm tra (tư thế, ánh sáng, khoảng cách màn hình). 5. Đánh giá thói quen dùng công nghệ trong một tuần và đề xuất 5 thay đổi có ý thức môi trường. 6. Lập kế hoạch cải thiện 2 tuần với thứ tự ưu tiên.",
      "deliverables": "Bảng kiểm tài khoản; bảng phân tích 5 tin nhắn; ảnh đánh giá chỗ làm việc trước và sau; bảng thói quen và 5 đề xuất; kế hoạch 2 tuần.\nHình thức nộp. Một tài liệu tổng hợp kèm ảnh chụp (che thông tin nhạy cảm).",
      "rubric": [
        "Gợi ý. Tuyệt đối không đưa mật khẩu, mã xác thực hay số giấy tờ thật vào bài nộp.",
        "Tiêu chí",
        "Điểm",
        "Bảo mật tài khoản (mật khẩu, 2FA) được rà soát đầy đủ",
        "25",
        "Nhận diện đúng dấu hiệu lừa đảo trong bài tập",
        "25",
        "Đánh giá chỗ làm việc và đề xuất cải thiện hợp lý",
        "25",
        "Thói quen sử dụng công nghệ có ý thức môi trường",
        "25"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Vì sao không nên dùng chung một mật khẩu cho nhiều tài khoản?",
        "options": [
          "Mật khẩu sẽ dễ nhớ hơn",
          "Máy chạy chậm đi",
          "Không có lý do",
          "Một tài khoản bị lộ sẽ kéo theo các tài khoản khác"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Dùng lại mật khẩu làm rủi ro lan rộng."
      },
      {
        "number": 2,
        "question": "Xác thực hai lớp bổ sung điều gì?",
        "options": [
          "Mật khẩu dài hơn",
          "Thêm một bước xác minh ngoài mật khẩu",
          "Một tài khoản mới",
          "Xóa mật khẩu"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Mật khẩu lộ vẫn cần thêm mã mới đăng nhập được."
      },
      {
        "number": 3,
        "question": "Vì sao nên cập nhật phần mềm thường xuyên?",
        "options": [
          "Để đổi giao diện",
          "Để xóa dữ liệu",
          "Để tăng dung lượng",
          "Vá các lỗ hổng bảo mật đã biết"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cập nhật sửa lỗ hổng."
      },
      {
        "number": 4,
        "question": "Dấu hiệu nào có thể cho thấy thiết bị bị xâm nhập?",
        "options": [
          "Máy khởi động bình thường",
          "Pin sạc đầy",
          "Máy chậm bất thường, xuất hiện ứng dụng lạ, tự đăng nhập lạ",
          "Màn hình sáng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Hành vi bất thường là dấu hiệu cần kiểm tra."
      },
      {
        "number": 5,
        "question": "Trình quản lý mật khẩu giúp gì?",
        "options": [
          "Dùng lại một mật khẩu",
          "Chia sẻ mật khẩu cho đồng nghiệp",
          "Tạo và lưu mật khẩu riêng, mạnh cho từng tài khoản",
          "Xóa mật khẩu cũ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giúp dùng mật khẩu khác nhau mà không phải nhớ hết."
      },
      {
        "number": 6,
        "question": "Dấu hiệu điển hình của email lừa đảo là gì?",
        "options": [
          "Giục gấp, người gửi lạ, đường dẫn đáng ngờ",
          "Có chữ ký",
          "Có tiêu đề",
          "Gửi vào buổi sáng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Gấp gáp và đường dẫn lạ là dấu hiệu."
      },
      {
        "number": 7,
        "question": "Có người gọi hỏi mã OTP của bạn. Bạn nên làm gì?",
        "options": [
          "Đọc mã",
          "Từ chối và liên hệ qua kênh chính thức",
          "Gửi mã qua tin nhắn",
          "Hỏi tên rồi đọc mã"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Không chia sẻ mã xác thực."
      },
      {
        "number": 8,
        "question": "Ứng dụng đèn pin xin quyền danh bạ có đáng ngờ không?",
        "options": [
          "Không, bình thường",
          "Chỉ đáng ngờ khi miễn phí",
          "Chỉ đáng ngờ trên máy tính",
          "Có, vì quyền không tương xứng với chức năng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Quyền cần phù hợp chức năng."
      },
      {
        "number": 9,
        "question": "Khi nghi ngờ lộ thông tin cá nhân, việc đầu tiên là gì?",
        "options": [
          "Chờ xem",
          "Đăng lên mạng",
          "Đổi mật khẩu liên quan và báo người phụ trách",
          "Xóa ứng dụng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Phản ứng sớm giảm thiệt hại."
      },
      {
        "number": 10,
        "question": "Thông tin nào là thông tin cá nhân?",
        "options": [
          "Tên sản phẩm",
          "Họ tên, số điện thoại, địa chỉ, hình ảnh",
          "Giờ mở cửa",
          "Khẩu hiệu"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Gắn với một người cụ thể."
      },
      {
        "number": 11,
        "question": "Quy tắc 20-20-20 là gì?",
        "options": [
          "Cứ 20 phút nhìn xa 20 feet trong 20 giây",
          "Làm 20 phút nghỉ 20 giờ",
          "Uống 20 ly nước",
          "Gõ 20 từ"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Giảm mỏi mắt."
      },
      {
        "number": 12,
        "question": "Vị trí màn hình đúng là gì?",
        "options": [
          "Mép trên ngang hoặc thấp hơn tầm mắt, cách 50–70 cm",
          "Cao hơn đầu",
          "Sát mặt",
          "Nghiêng sang bên"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Giảm đau cổ."
      },
      {
        "number": 13,
        "question": "Dấu hiệu quá tải thông tin?",
        "options": [
          "Làm nhanh hơn",
          "Ngủ ngon hơn",
          "Hứng thú hơn",
          "Khó tập trung, bỏ sót việc, cảm thấy ngợp"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Quá tải giảm tập trung."
      },
      {
        "number": 14,
        "question": "Vì sao tắt thông báo công việc ngoài giờ?",
        "options": [
          "Để máy nhanh hơn",
          "Để tiết kiệm mạng",
          "Để nghỉ ngơi và giảm căng thẳng",
          "Không có lý do"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Nghỉ ngơi đủ."
      },
      {
        "number": 15,
        "question": "Căng thẳng công việc kéo dài, nên làm gì?",
        "options": [
          "Im lặng chịu đựng",
          "Làm thêm giờ",
          "Trao đổi với quản lý hoặc người đáng tin cậy và điều chỉnh nhịp làm việc",
          "Bỏ qua"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Chia sẻ sớm giúp tìm giải pháp."
      },
      {
        "number": 16,
        "question": "Lưu trữ đám mây có tác động môi trường không?",
        "options": [
          "Có, vì trung tâm dữ liệu tiêu thụ năng lượng",
          "Không",
          "Chỉ khi dùng điện thoại",
          "Chỉ khi lưu ảnh"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Máy chủ cần điện."
      },
      {
        "number": 17,
        "question": "Vì sao xóa dữ liệu trước khi thải bỏ thiết bị?",
        "options": [
          "Cho máy nhẹ",
          "Tránh lộ thông tin cá nhân và công việc",
          "Cho dễ bán",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bảo vệ dữ liệu."
      },
      {
        "number": 18,
        "question": "Rác thải điện tử nên được xử lý thế nào?",
        "options": [
          "Rác sinh hoạt",
          "Đưa đến điểm thu gom chuyên biệt",
          "Đốt",
          "Chôn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cần xử lý riêng."
      },
      {
        "number": 19,
        "question": "Cách nào kéo dài tuổi thọ thiết bị?",
        "options": [
          "Bảo dưỡng, giữ gìn, sửa chữa khi cần",
          "Thay mới mỗi năm",
          "Luôn bật",
          "Dùng sạc kém"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Dùng lâu giảm rác."
      },
      {
        "number": 20,
        "question": "Họp trực tuyến có lợi ích môi trường gì?",
        "options": [
          "Không lợi ích",
          "Tăng giấy",
          "Tăng rác",
          "Giảm phát thải do đi lại"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Ít di chuyển hơn."
      }
    ]
  },
  "M4-I": {
    "code": "M4-I",
    "title": "AN TOÀN THÔNG TIN TRONG CÔNG VIỆC",
    "domain_number": 4,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Bảo mật trong môi trường làm việc",
        "competency_line": "Năng lực 4.1 · Mức 3–4",
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
          "Khi làm việc ngoài văn phòng, cần tránh dùng wifi công cộng không có mật khẩu để truy cập hệ thống công ty. Sự khác biệt quan trọng giữa đồng bộ và sao lưu: đồng bộ sẽ lan truyền cả những thay đổi không mong muốn, trong khi sao lưu là một bản sao độc lập. Tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường vì được cá nhân hóa — cách phòng vệ tốt nhất là luôn xác minh qua kênh khác khi nhận yêu cầu bất thường.",
          "Các bước. 1. Phân biệt đồng bộ (phản chiếu thay đổi, kể cả xóa nhầm) với sao lưu (giữ bản sao độc lập theo thời điểm); thiết lập sao lưu cho dữ liệu quan trọng. 2. Nhận diện lừa đảo có chủ đích: kẻ tấn công nghiên cứu trước về nạn nhân nên nội dung khớp thực tế. 3. Áp dụng quy tắc xác minh bằng kênh thứ hai với mọi yêu cầu chuyển tiền hoặc đổi thông tin thanh toán. 4. Ở nơi công cộng: tránh việc nhạy cảm trên mạng không rõ nguồn gốc, ưu tiên mạng tin cậy hoặc kết nối bảo vệ do công ty cung cấp. 5. Khi có sự cố: ngắt kết nối thiết bị liên quan, không xóa dấu vết, báo ngay bộ phận phụ trách và ghi lại diễn biến."
        ],
        "examples": [
          "Ví dụ trong công việc. Kế toán nhận email từ địa chỉ rất giống giám đốc, yêu cầu chuyển tiền gấp cho một đối tác mới và dặn “đừng nói với ai”. Nội dung có đủ tên dự án và chữ ký nên trông rất thật. Quy trình đúng là xác minh qua kênh thứ hai đã biết (gọi điện số lưu sẵn), không chuyển khi chưa có phê duyệt theo quy định."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Nhầm đồng ý với sao lưu; tin vào nội dung vì “quá giống thật”; tự xử lý sự cố rồi báo muộn."
        ],
        "practice": [
          "Lập danh mục kiểm tra bảo mật cho công việc của bộ phận mình, tự đánh giá và xác định 3 điểm yếu lớn nhất."
        ],
        "deliverable": "Danh mục kiểm tra bảo mật và báo cáo tự đánh giá.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Sự khác biệt cốt lõi giữa đồng bộ và sao lưu là gì?",
            "options": [
              "Không có khác biệt",
              "Sao lưu nhanh hơn đồng bộ",
              "Đồng bộ an toàn hơn sao lưu",
              "Đồng bộ lan truyền cả thay đổi không mong muốn, sao lưu là bản sao độc lập"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là điểm khác biệt quan trọng cần hiểu để bảo vệ dữ liệu đúng cách."
          },
          {
            "number": 2,
            "question": "Khi nhận yêu cầu chuyển tiền gấp qua email từ “giám đốc”, dù nội dung rất thuyết phục, nên làm gì?",
            "options": [
              "Chuyển ngay để không trễ hạn",
              "Trả lời email hỏi thêm chi tiết",
              "Xác minh qua kênh khác (gọi điện trực tiếp) trước khi hành động",
              "Chuyển tiền một phần để giảm rủi ro"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xác minh qua kênh độc lập là biện pháp phòng vệ hiệu quả nhất với lừa đảo có chủ đích."
          },
          {
            "number": 3,
            "question": "Vì sao tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường?",
            "options": [
              "Không nguy hiểm hơn",
              "Chỉ nhắm vào doanh nghiệp lớn",
              "Dễ nhận biết hơn lừa đảo thông thường",
              "Được cá nhân hóa với thông tin chính xác, khiến nạn nhân dễ tin hơn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tính cá nhân hóa cao làm giảm khả năng nạn nhân nghi ngờ."
          },
          {
            "number": 4,
            "question": "Khi làm việc ở nơi công cộng với wifi không rõ nguồn gốc, nên làm gì?",
            "options": [
              "Tránh truy cập hệ thống công ty, hoặc dùng VPN nếu bắt buộc",
              "Kết nối bình thường để tiết kiệm dữ liệu di động",
              "Không có vấn đề gì cần lưu ý",
              "Chỉ cần tắt camera laptop"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Wifi công cộng không an toàn có thể bị lợi dụng để đánh cắp dữ liệu truyền qua đó."
          },
          {
            "number": 5,
            "question": "Khi phát hiện sự cố bảo mật, nên làm gì?",
            "options": [
              "Báo cáo ngay cho bộ phận phụ trách theo quy trình nội bộ",
              "Tự xử lý một mình để tránh phiền phức",
              "Im lặng vì sợ bị trách",
              "Chỉ kể cho đồng nghiệp thân thiết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Báo cáo kịp thời giúp hạn chế thiệt hại và xử lý đúng quy trình."
          },
          {
            "number": 6,
            "question": "Điểm khác nhau chính giữa đồng bộ và sao lưu là gì?",
            "options": [
              "Hai khái niệm hoàn toàn giống nhau",
              "Sao lưu luôn nhanh hơn",
              "Đồng bộ phản chiếu cả thay đổi và xóa nhầm, sao lưu giữ bản sao độc lập",
              "Đồng bộ luôn an toàn hơn"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tệp bị xóa nhầm có thể bị xóa luôn ở mọi nơi đồng bộ."
          },
          {
            "number": 7,
            "question": "Yêu cầu chuyển tiền gấp từ “giám đốc” qua email. Bước đúng là gì?",
            "options": [
              "Chuyển ngay vì là cấp trên",
              "Xác minh qua kênh thứ hai đã biết trước khi làm",
              "Trả lời email hỏi lại",
              "Chuyển một nửa"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Trả lời trên chính kênh đáng ngờ không phải xác minh độc lập."
          },
          {
            "number": 8,
            "question": "Vì sao lừa đảo có chủ đích khó nhận ra hơn?",
            "options": [
              "Nội dung được tùy chỉnh theo thông tin thật về nạn nhân",
              "Vì email dài hơn",
              "Vì gửi vào ban đêm",
              "Vì không có đường dẫn"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Kẻ tấn công nghiên cứu trước nên nội dung khớp thực tế."
          },
          {
            "number": 9,
            "question": "Khi dùng mạng không rõ nguồn gốc ở nơi công cộng, nên làm gì?",
            "options": [
              "Đăng nhập mọi tài khoản cho tiện",
              "Tránh thao tác nhạy cảm hoặc dùng kết nối bảo vệ do công ty cung cấp",
              "Tắt khóa màn hình",
              "Chia sẻ mật khẩu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mạng lạ tiềm ẩn rủi ro nghe lén."
          },
          {
            "number": 10,
            "question": "Phát hiện sự cố bảo mật, việc cần làm là gì?",
            "options": [
              "Tự xử lý và im lặng",
              "Báo ngay người phụ trách, ngắt kết nối thiết bị liên quan và ghi lại diễn biến",
              "Xóa hết dấu vết",
              "Chờ đến cuối tuần"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Báo sớm và giữ dấu vết giúp điều tra."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Xử lý dữ liệu cá nhân trong công việc",
        "competency_line": "Năng lực 4.2 · Mức 3–4",
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
          "Phân quyền truy cập theo mức nhạy cảm: dữ liệu cơ bản có thể được nhiều bộ phận truy cập theo nhu cầu, dữ liệu nhạy cảm cần giới hạn nghiêm ngặt hơn. Nên ẩn danh hoặc giả danh hóa khi phân tích để giảm rủi ro. Khách hàng có quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu cá nhân của họ — doanh nghiệp cần có quy trình xử lý các yêu cầu này.",
          "Các bước. 1. Phân loại dữ liệu theo Nghị định 13/2023/NĐ-CP: dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm; dữ liệu nhạy cảm cần mức bảo vệ cao hơn. 2. Áp dụng thu thập tối thiểu: chỉ thu thập thông tin cần cho mục đích đã nêu. 3. Chỉ dùng công cụ đã được phê duyệt để xử lý dữ liệu khách hàng. 4. Ghi nhận và đáp ứng quyền của chủ thể dữ liệu (được biết, đồng ý hoặc rút lại đồng ý, truy cập, chỉnh sửa, xóa trong phạm vi quy định). 5. Sự đồng ý cần tự nguyện, cụ thể, rõ ràng và có thể chứng minh được. 6. Khi có sự cố rò rỉ: báo ngay bộ phận phụ trách để thực hiện nghĩa vụ thông báo theo quy định.",
          "Lưu ý: đây là kiến thức nền, không phải tư vấn pháp lý; quy định có thể thay đổi nên cần đối chiếu văn bản hiện hành và hỏi bộ phận pháp lý khi áp dụng."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên kinh doanh dán bảng danh sách khách hàng (tên, số điện thoại, địa chỉ) vào một công cụ trực tuyến miễn phí để dịch nhanh. Công cụ này chưa được phê duyệt, doanh nghiệp không biết dữ liệu được lưu ở đâu hay dùng vào việc gì. Đây là ví dụ điển hình về xử lý dữ liệu cá nhân ngoài kiểm soát."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Thu thập thừa dữ liệu “phòng khi cần”; dùng công cụ chưa duyệt; không lưu bằng chứng đồng ý; gộp mọi dữ liệu thành một loại."
        ],
        "practice": [
          "Rà soát một tập dữ liệu công việc thật (hoặc dùng bảng mẫu ở trên làm điểm khởi đầu, bổ sung thêm 5–10 trường của dữ liệu thật bộ phận đang dùng), phân loại từng trường theo mức nhạy cảm, tạo bản trích xuất tối thiểu cho một mục đích phân tích cụ thể."
        ],
        "deliverable": "Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân thành mấy loại chính?",
            "options": [
              "Hai loại: cơ bản và nhạy cảm",
              "Một loại duy nhất",
              "Ba loại",
              "Không phân loại"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nghị định 13 phân dữ liệu cá nhân thành dữ liệu cơ bản và dữ liệu nhạy cảm."
          },
          {
            "number": 2,
            "question": "Nguyên tắc thu thập tối thiểu nghĩa là gì?",
            "options": [
              "Thu thập càng nhiều dữ liệu càng tốt",
              "Chỉ thu thập dữ liệu thực sự cần thiết cho mục đích cụ thể",
              "Không thu thập dữ liệu nào",
              "Chỉ áp dụng cho doanh nghiệp lớn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là nguyên tắc cốt lõi trong bảo vệ dữ liệu cá nhân."
          },
          {
            "number": 3,
            "question": "Dán danh sách khách hàng vào một công cụ trực tuyến miễn phí chưa được phê duyệt có vấn đề gì?",
            "options": [
              "Là hình thức chuyển giao dữ liệu ra ngoài kiểm soát, tiềm ẩn rủi ro vi phạm",
              "Không có vấn đề gì",
              "Chỉ có vấn đề nếu công cụ đó tính phí",
              "Luôn an toàn nếu công cụ có tên tuổi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Dữ liệu cá nhân được đưa ra ngoài hệ thống được kiểm soát là rủi ro tuân thủ nghiêm trọng."
          },
          {
            "number": 4,
            "question": "Khách hàng có quyền gì đối với dữ liệu cá nhân của họ?",
            "options": [
              "Không có quyền gì",
              "Chỉ có quyền xem, không được yêu cầu sửa",
              "Quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu",
              "Chỉ áp dụng cho khách hàng VIP"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là các quyền cơ bản của chủ thể dữ liệu."
          },
          {
            "number": 5,
            "question": "Sự đồng ý của chủ thể dữ liệu cần có đặc điểm gì?",
            "options": [
              "Có thể dùng một lần đồng ý chung cho mọi mục đích mãi mãi",
              "Rõ ràng, cụ thể cho từng mục đích sử dụng",
              "Không cần thiết nếu doanh nghiệp nhỏ",
              "Chỉ cần đồng ý bằng miệng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đồng ý chung chung không đáp ứng yêu cầu về tính cụ thể cho từng mục đích."
          },
          {
            "number": 6,
            "question": "Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân nhạy cảm khác dữ liệu cơ bản ở điểm nào?",
            "options": [
              "Không có khác biệt",
              "Chỉ là dữ liệu cũ",
              "Chỉ là dữ liệu của doanh nghiệp",
              "Gắn với quyền riêng tư và cần mức bảo vệ cao hơn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dữ liệu nhạy cảm cần biện pháp bảo vệ chặt hơn."
          },
          {
            "number": 7,
            "question": "Thu thập tối thiểu áp dụng như thế nào trong biểu mẫu đăng ký khách hàng?",
            "options": [
              "Hỏi mọi thứ phòng khi cần",
              "Hỏi cả thông tin gia đình",
              "Chỉ hỏi thông tin cần cho mục đích đã nêu",
              "Không ghi mục đích"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chỉ thu thập đúng và đủ cho mục đích."
          },
          {
            "number": 8,
            "question": "Dán danh sách khách hàng vào công cụ chưa được phê duyệt gây vấn đề gì?",
            "options": [
              "Làm chậm máy",
              "Làm đổi phông chữ",
              "Không có vấn đề",
              "Dữ liệu ra ngoài kiểm soát, không rõ nơi lưu trữ và mục đích sử dụng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Doanh nghiệp mất kiểm soát dữ liệu."
          },
          {
            "number": 9,
            "question": "Nhận định nào đúng về quyền của chủ thể dữ liệu?",
            "options": [
              "Họ có quyền như được biết, yêu cầu truy cập hoặc chỉnh sửa trong phạm vi quy định",
              "Họ không có quyền gì",
              "Chỉ có quyền khi mua hàng",
              "Chỉ có quyền khi là nhân viên"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Pháp luật quy định các quyền của chủ thể dữ liệu."
          },
          {
            "number": 10,
            "question": "Sự đồng ý hợp lệ cần có đặc điểm nào?",
            "options": [
              "Mặc định đã đồng ý",
              "Tự nguyện, cụ thể, rõ ràng và có thể chứng minh được",
              "Gộp chung nhiều mục đích khó hiểu",
              "Chỉ cần im lặng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đồng ý phải rõ ràng và chứng minh được."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Cân bằng số và sức khỏe nghề nghiệp",
        "competency_line": "Năng lực 4.3 · Mức 3–4",
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
          "Ở mức này, việc thảo luận về công nghệ số giúp tăng cường thịnh vượng xã hội cần gắn với bối cảnh công việc cụ thể hơn — ví dụ đánh giá xem công cụ theo dõi khối lượng công việc nhóm có giúp phát hiện sớm dấu hiệu quá tải của đồng nghiệp không, hoặc kênh giao tiếp nội bộ có tạo không gian để nhân viên chia sẻ khó khăn và nhận hỗ trợ kịp thời không. Việc chọn lựa công cụ số có chủ đích cho mục đích này khác với việc chỉ dùng công nghệ theo thói quen.",
          "Các bước. 1. Nhận ra chi phí chuyển đổi ngữ cảnh: mỗi lần ngắt quãng, cần thời gian để quay lại mạch suy nghĩ. 2. Làm việc theo khối thời gian: dành khung giờ liên tục cho việc quan trọng, gom việc nhỏ vào khung riêng. 3. Cùng nhóm xây quy ước thời gian phản hồi theo mức khẩn cấp và kênh. 4. Nhận biết dấu hiệu kiệt sức nghề nghiệp: mệt kéo dài, mất hứng thú, hiệu suất giảm, cáu gắt. 5. Hạn chế đa nhiệm liên tục; chủ động nghỉ và đề nghị hỗ trợ khi cần."
        ],
        "examples": [
          "Ví dụ trong công việc. Một nhóm có thói quen trả lời tin nhắn trong vài phút, kể cả tối muộn. Mọi người liên tục chuyển giữa tin nhắn, họp, bảng tính nên cuối ngày thấy bận mà ít hoàn thành việc quan trọng. Nhóm thống nhất khung giờ phản hồi và khung giờ tập trung, kết quả là cả hiệu quả lẫn tinh thần đều khá hơn."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Phản hồi tức thì mọi lúc; không phân biệt việc gấp và việc quan trọng; coi kiệt sức là chuyện cá nhân thay vì vấn đề cần điều chỉnh cách làm việc."
        ],
        "practice": [
          "Theo dõi thói quen số trong 3 ngày làm việc (ghi lại: số lần bị ngắt quãng bởi thông báo, thời gian phản hồi công việc ngoài giờ nếu có), phân tích và đề xuất quy ước cho nhóm."
        ],
        "deliverable": "Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Chi phí chuyển đổi ngữ cảnh là gì?",
            "options": [
              "Chi phí mua phần mềm mới",
              "Thời gian và năng lượng mất khi chuyển đổi qua lại giữa các công việc khác nhau",
              "Chi phí đào tạo nhân viên",
              "Không có khái niệm này"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là hiện tượng năng suất giảm mỗi khi phải chuyển đổi sự tập trung giữa các nhiệm vụ."
          },
          {
            "number": 2,
            "question": "Làm việc theo khối thời gian có lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Giảm chi phí chuyển đổi ngữ cảnh, tăng khả năng tập trung sâu",
              "Chỉ phù hợp với công việc đơn giản",
              "Làm chậm tiến độ công việc"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Dành thời gian liên tục cho một việc giúp tránh gián đoạn và tăng hiệu quả."
          },
          {
            "number": 3,
            "question": "Dấu hiệu nào có thể cho thấy một người đang kiệt sức nghề nghiệp?",
            "options": [
              "Năng suất làm việc tăng đều",
              "Luôn vui vẻ và năng động",
              "Không có dấu hiệu cụ thể nào",
              "Mệt mỏi kéo dài không hồi phục, mất hứng thú với công việc"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các dấu hiệu điển hình cần được chú ý và can thiệp sớm."
          },
          {
            "number": 4,
            "question": "Vì sao nên xây dựng quy ước nhóm về thời gian phản hồi?",
            "options": [
              "Không cần thiết",
              "Chỉ để có văn bản chính thức",
              "Giảm áp lực ngầm về kỳ vọng phản hồi tức thời ngoài giờ",
              "Làm chậm công việc nhóm"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy ước rõ ràng giúp mọi người không cảm thấy áp lực phải phản hồi ngay lập tức mọi lúc."
          },
          {
            "number": 5,
            "question": "Đa nhiệm liên tục (làm nhiều việc cùng lúc) thường dẫn đến điều gì?",
            "options": [
              "Giảm chất lượng và tốc độ hoàn thành so với làm tuần tự",
              "Tăng chất lượng công việc",
              "Không ảnh hưởng gì đến hiệu suất",
              "Luôn hiệu quả hơn làm từng việc"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nghiên cứu về năng suất cho thấy đa nhiệm liên tục thường làm giảm hiệu quả thực tế dù tạo cảm giác bận rộn."
          },
          {
            "number": 6,
            "question": "Chi phí chuyển đổi ngữ cảnh là gì?",
            "options": [
              "Tiền mua phần mềm",
              "Thời gian và công sức để lấy lại mạch tập trung sau mỗi lần chuyển việc",
              "Phí chuyển phòng ban",
              "Chi phí in ấn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ngắt quãng làm mất mạch suy nghĩ."
          },
          {
            "number": 7,
            "question": "Làm việc theo khối thời gian có lợi gì?",
            "options": [
              "Làm mọi việc cùng lúc",
              "Không cần lập kế hoạch",
              "Có khung giờ liên tục để tập trung vào việc quan trọng",
              "Tăng số cuộc họp"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Khối thời gian bảo vệ sự tập trung."
          },
          {
            "number": 8,
            "question": "Dấu hiệu nào có thể gợi ý kiệt sức nghề nghiệp?",
            "options": [
              "Tràn đầy năng lượng",
              "Ngủ đủ giấc",
              "Hoàn thành việc nhanh hơn",
              "Mệt kéo dài, mất hứng thú và hiệu suất giảm"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các biểu hiện thường gặp, cần chú ý và điều chỉnh."
          },
          {
            "number": 9,
            "question": "Vì sao nên có quy ước nhóm về thời gian phản hồi?",
            "options": [
              "Giảm áp lực phải trả lời ngay và rõ kỳ vọng của mọi người",
              "Để không ai phản hồi",
              "Để tăng số tin nhắn",
              "Để giám sát nhân viên"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Kỳ vọng rõ giúp giảm căng thẳng."
          },
          {
            "number": 10,
            "question": "Đa nhiệm liên tục thường dẫn đến điều gì?",
            "options": [
              "Giảm chất lượng công việc và dễ mệt",
              "Tăng chất lượng",
              "Tăng sự tập trung",
              "Không ảnh hưởng gì"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chuyển việc liên tục gây tốn sức."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Vận hành số bền vững",
        "competency_line": "Năng lực 4.4 · Mức 3–4",
        "objectives": [
          "Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số"
        ],
        "definitions": [
          "Kiểm kê tác động số: quá trình liệt kê và đánh giá mức độ tiêu thụ tài nguyên số (lưu trữ, thiết bị, in ấn) của một bộ phận hoặc tổ chức",
          "Dữ liệu quá hạn: dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ, gây lãng phí tài nguyên"
        ],
        "body": [
          "Ở mức trung cấp, việc bảo vệ môi trường khỏi tác động công nghệ số mở rộng sang vận hành số bền vững ở cấp bộ phận. Kiểm kê tác động số của bộ phận là bước đầu để tối ưu: xác định dung lượng lưu trữ, số lượng thiết bị, khối lượng in ấn.",
          "Tối ưu lưu trữ bao gồm loại bỏ dữ liệu trùng lặp, các bản sao không cần thiết, và dữ liệu quá hạn. Xây dựng quy trình ít giấy đòi hỏi ưu tiên ký số thay vì in ra ký tay. Khi mua sắm thiết bị mới, tiêu chí bền vững có thể bao gồm độ bền, khả năng nâng cấp, và chính sách thu hồi tái chế của nhà sản xuất.",
          "Các bước. 1. Thống kê tài nguyên số của bộ phận: thiết bị, dịch vụ, dung lượng lưu trữ. 2. Xác định dữ liệu quá hạn và thiết lập chính sách lưu trữ rồi xóa an toàn. 3. Đưa tiêu chí bền vững vào mua sắm: tuổi thọ, khả năng sửa chữa, tiết kiệm điện, thu hồi. 4. Ưu tiên quy trình điện tử như ký số khi pháp luật và quy trình nội bộ cho phép. 5. Truyền thông nội bộ về thực hành tốt và ghi nhận kết quả."
        ],
        "examples": [
          "Ví dụ trong công việc. Một phòng ban lưu hàng nghìn tệp trùng lặp và bản nháp cũ trên máy chủ chung, in hợp đồng ra giấy để ký rồi quét lại. Rà soát tài nguyên số, dọn dữ liệu quá hạn theo chính sách lưu trữ và chuyển sang ký số khi quy trình cho phép giúp giảm lãng phí giấy, năng lượng lưu trữ và thời gian xử lý."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Giữ dữ liệu vô thời hạn; chỉ so sánh giá mua ban đầu; coi bền vững là việc của riêng một người."
        ],
        "practice": [
          "Kiểm kê tài nguyên số của bộ phận (dung lượng lưu trữ, tài liệu trùng lặp, lượng in ấn trong một tháng), đề xuất kế hoạch tối ưu và ước tính tác động."
        ],
        "deliverable": "Báo cáo kiểm kê và kế hoạch tối ưu.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bước đầu tiên để tối ưu tài nguyên số của một bộ phận là gì?",
            "options": [
              "Mua thiết bị mới ngay",
              "Kiểm kê hiện trạng để có cơ sở đặt mục tiêu cụ thể",
              "Xóa toàn bộ dữ liệu cũ ngay lập tức",
              "Không cần bước chuẩn bị nào"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kiểm kê cho dữ liệu cụ thể để đặt mục tiêu cải thiện, thay vì hành động chung chung."
          },
          {
            "number": 2,
            "question": "Dữ liệu quá hạn là gì?",
            "options": [
              "Dữ liệu mới được tạo",
              "Dữ liệu đang được sử dụng tích cực",
              "Dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ",
              "Dữ liệu đã được sao lưu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là loại dữ liệu cần được rà soát và loại bỏ để tối ưu tài nguyên lưu trữ."
          },
          {
            "number": 3,
            "question": "Tiêu chí bền vững khi mua sắm thiết bị mới có thể bao gồm gì?",
            "options": [
              "Độ bền, khả năng nâng cấp, hiệu suất năng lượng, chính sách tái chế",
              "Chỉ quan tâm giá rẻ nhất",
              "Chỉ quan tâm thương hiệu nổi tiếng",
              "Không có tiêu chí đặc biệt nào"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các yếu tố giúp đánh giá tính bền vững của việc mua sắm thiết bị."
          },
          {
            "number": 4,
            "question": "Vì sao nên ưu tiên ký số thay vì in ra ký tay khi có thể?",
            "options": [
              "Không có lý do cụ thể",
              "Ký số luôn có giá trị pháp lý cao hơn",
              "Chỉ để tiết kiệm thời gian",
              "Giảm nhu cầu in ấn, góp phần vận hành ít giấy hơn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là một cách thực hành cụ thể để giảm sử dụng giấy trong công việc hàng ngày."
          },
          {
            "number": 5,
            "question": "Truyền thông nội bộ về thực hành bền vững có tác dụng gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Chỉ để báo cáo hình thức",
              "Duy trì động lực thay đổi thói quen lâu dài",
              "Làm chậm công việc của bộ phận"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chia sẻ kết quả và ghi nhận nỗ lực giúp duy trì sự thay đổi bền vững thay vì chỉ là hoạt động một lần."
          },
          {
            "number": 6,
            "question": "Bước đầu để tối ưu tài nguyên số của bộ phận là gì?",
            "options": [
              "Mua thêm thiết bị",
              "Xóa ngẫu nhiên",
              "Dừng dùng mọi dịch vụ",
              "Thống kê thiết bị, dịch vụ và dữ liệu đang dùng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cần biết hiện trạng trước khi tối ưu."
          },
          {
            "number": 7,
            "question": "Dữ liệu quá hạn là gì?",
            "options": [
              "Dữ liệu đã hết thời hạn lưu trữ theo chính sách và không còn cần thiết",
              "Dữ liệu mới tạo",
              "Dữ liệu quan trọng nhất",
              "Dữ liệu đang xử lý"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần xóa an toàn theo chính sách."
          },
          {
            "number": 8,
            "question": "Tiêu chí bền vững khi mua thiết bị có thể gồm gì?",
            "options": [
              "Chỉ giá thấp nhất",
              "Tuổi thọ, khả năng sửa chữa, tiết kiệm điện và thu hồi",
              "Chỉ màu sắc",
              "Chỉ thương hiệu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Xét chi phí vòng đời chứ không chỉ giá mua."
          },
          {
            "number": 9,
            "question": "Vì sao ưu tiên ký số thay in ký tay khi có thể?",
            "options": [
              "Giảm giấy, thời gian xử lý và lưu trữ thuận tiện hơn",
              "Vì ký số luôn rẻ nhất",
              "Vì không cần kiểm tra",
              "Vì không cần phê duyệt"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chỉ áp dụng khi pháp luật và quy trình nội bộ cho phép."
          },
          {
            "number": 10,
            "question": "Truyền thông nội bộ về thực hành bền vững có tác dụng gì?",
            "options": [
              "Giảm sự tham gia",
              "Tạo thói quen chung và ghi nhận kết quả",
              "Chỉ để báo cáo",
              "Không có tác dụng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thay đổi cần sự tham gia của mọi người."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M4-I — “Bộ thực hành an toàn và bền vững cho bộ phận” (Assignment)",
      "context": "Bạn là người đầu mối về an toàn số của một bộ phận 15 người (giả định). Trưởng bộ phận yêu cầu một bộ thực hành áp dụng ngay trong một tháng.",
      "requirements": "1. Lập danh mục kiểm tra bảo mật cho bộ phận: tài khoản, thiết bị, sao lưu, mạng, xử lý email đáng ngờ và quy trình báo sự cố. 2. Xây quy trình xử lý dữ liệu cá nhân cho một nghiệp vụ cụ thể: phân loại dữ liệu, mục đích, thời hạn lưu, công cụ được phép dùng, cách đáp ứng yêu cầu của chủ thể dữ liệu, cách báo khi có sự cố. 3. Viết quy ước làm việc cho nhóm: khung giờ phản hồi, khung giờ tập trung, quy tắc dùng kênh, cách nhận biết và hỗ trợ khi có dấu hiệu quá tải. 4. Lập kế hoạch tối ưu tài nguyên số: thống kê hiện trạng, dữ liệu cần dọn, tiêu chí mua sắm bền vững, đề xuất 3 hành động. 5. Chọn 3 chỉ số theo dõi sau một tháng.",
      "deliverables": "Danh mục kiểm tra; quy trình xử lý dữ liệu cá nhân; quy ước nhóm; kế hoạch tối ưu; bảng chỉ số.\nHình thức nộp. Một tài liệu tổng hợp.",
      "rubric": [
        "Gợi ý. Dùng dữ liệu giả định. Ghi chú các điểm pháp lý cần bộ phận pháp lý xác nhận.",
        "Tiêu chí",
        "Điểm",
        "Danh mục kiểm tra bảo mật đầy đủ, thực tế",
        "25",
        "Phân loại và xử lý dữ liệu cá nhân đúng nguyên tắc",
        "30",
        "Quy ước làm việc tôn trọng cân bằng số",
        "25",
        "Kế hoạch tối ưu tài nguyên khả thi",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Đồng bộ khác sao lưu ở điểm nào?",
        "options": [
          "Giống hệt nhau",
          "Sao lưu nhanh hơn",
          "Đồng bộ phản chiếu cả việc xóa nhầm, sao lưu giữ bản sao độc lập",
          "Đồng bộ an toàn hơn"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Xóa nhầm có thể lan ra mọi nơi đồng bộ."
      },
      {
        "number": 2,
        "question": "Email “giám đốc” yêu cầu chuyển tiền gấp, nên làm gì?",
        "options": [
          "Xác minh qua kênh thứ hai đã biết",
          "Chuyển ngay",
          "Trả lời email",
          "Chuyển một nửa"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Xác minh độc lập."
      },
      {
        "number": 3,
        "question": "Vì sao lừa đảo có chủ đích khó nhận ra?",
        "options": [
          "Email dài hơn",
          "Gửi ban đêm",
          "Nội dung khớp thông tin thật của nạn nhân",
          "Không có đường dẫn"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Được nghiên cứu trước."
      },
      {
        "number": 4,
        "question": "Dùng mạng công cộng không rõ nguồn gốc thì nên?",
        "options": [
          "Đăng nhập hết tài khoản",
          "Tắt khóa màn hình",
          "Chia sẻ mật khẩu",
          "Tránh thao tác nhạy cảm hoặc dùng kết nối bảo vệ của công ty"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Có rủi ro nghe lén."
      },
      {
        "number": 5,
        "question": "Phát hiện sự cố bảo mật, việc cần làm là gì?",
        "options": [
          "Tự xử lý im lặng",
          "Báo ngay, ngắt kết nối liên quan và ghi lại diễn biến",
          "Xóa dấu vết",
          "Chờ cuối tuần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Báo sớm và giữ dấu vết."
      },
      {
        "number": 6,
        "question": "Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được chia thành nhóm nào?",
        "options": [
          "Chỉ một nhóm",
          "Dữ liệu cơ bản và dữ liệu nhạy cảm",
          "Công khai và bí mật",
          "Cũ và mới"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Hai nhóm chính theo nghị định."
      },
      {
        "number": 7,
        "question": "Thu thập tối thiểu nghĩa là gì?",
        "options": [
          "Chỉ thu thập thông tin cần cho mục đích đã nêu",
          "Thu thập thật nhiều",
          "Thu thập khi rảnh",
          "Không cần mục đích"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Đúng và đủ."
      },
      {
        "number": 8,
        "question": "Dán danh sách khách hàng vào công cụ chưa duyệt gây vấn đề gì?",
        "options": [
          "Máy chậm",
          "Đổi phông",
          "Không vấn đề",
          "Mất kiểm soát dữ liệu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Không rõ nơi lưu và mục đích."
      },
      {
        "number": 9,
        "question": "Chủ thể dữ liệu có quyền gì?",
        "options": [
          "Như được biết, truy cập, chỉnh sửa trong phạm vi quy định",
          "Không có quyền",
          "Chỉ khi mua hàng",
          "Chỉ khi là nhân viên"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Quyền được pháp luật quy định."
      },
      {
        "number": 10,
        "question": "Sự đồng ý hợp lệ cần gì?",
        "options": [
          "Mặc định",
          "Gộp nhiều mục đích",
          "Tự nguyện, cụ thể, rõ ràng, chứng minh được",
          "Im lặng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Phải rõ ràng."
      },
      {
        "number": 11,
        "question": "Chi phí chuyển đổi ngữ cảnh là gì?",
        "options": [
          "Công sức lấy lại mạch tập trung sau mỗi lần chuyển việc",
          "Tiền phần mềm",
          "Phí chuyển phòng",
          "Chi phí in"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ngắt quãng gây mất mạch."
      },
      {
        "number": 12,
        "question": "Khối thời gian giúp gì?",
        "options": [
          "Làm cùng lúc mọi việc",
          "Có khung giờ liên tục để làm việc quan trọng",
          "Không cần kế hoạch",
          "Thêm họp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bảo vệ tập trung."
      },
      {
        "number": 13,
        "question": "Dấu hiệu kiệt sức nghề nghiệp?",
        "options": [
          "Nhiều năng lượng",
          "Mệt kéo dài, mất hứng thú, hiệu suất giảm",
          "Ngủ đủ",
          "Làm nhanh hơn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cần chú ý và điều chỉnh."
      },
      {
        "number": 14,
        "question": "Vì sao có quy ước phản hồi trong nhóm?",
        "options": [
          "Để không ai phản hồi",
          "Tăng tin nhắn",
          "Giám sát",
          "Rõ kỳ vọng và giảm áp lực trả lời ngay"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Kỳ vọng rõ."
      },
      {
        "number": 15,
        "question": "Đa nhiệm liên tục dẫn đến điều gì?",
        "options": [
          "Tăng chất lượng",
          "Giảm chất lượng và dễ mệt",
          "Tăng tập trung",
          "Không ảnh hưởng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Chuyển việc tốn sức."
      },
      {
        "number": 16,
        "question": "Bước đầu tối ưu tài nguyên số là gì?",
        "options": [
          "Mua thêm",
          "Xóa ngẫu nhiên",
          "Thống kê hiện trạng thiết bị, dịch vụ, dữ liệu",
          "Dừng dịch vụ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Biết hiện trạng."
      },
      {
        "number": 17,
        "question": "Dữ liệu quá hạn là gì?",
        "options": [
          "Dữ liệu mới",
          "Dữ liệu quan trọng nhất",
          "Dữ liệu hết thời hạn lưu theo chính sách và không còn cần",
          "Dữ liệu đang xử lý"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Xóa an toàn."
      },
      {
        "number": 18,
        "question": "Tiêu chí bền vững khi mua thiết bị?",
        "options": [
          "Giá thấp nhất",
          "Màu sắc",
          "Thương hiệu",
          "Tuổi thọ, sửa chữa, tiết kiệm điện, thu hồi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Xét vòng đời."
      },
      {
        "number": 19,
        "question": "Vì sao ưu tiên ký số khi có thể?",
        "options": [
          "Luôn rẻ nhất",
          "Không cần kiểm tra",
          "Không cần phê duyệt",
          "Giảm giấy, tiết kiệm thời gian, lưu trữ thuận tiện"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Khi quy định cho phép."
      },
      {
        "number": 20,
        "question": "Truyền thông nội bộ về bền vững có tác dụng gì?",
        "options": [
          "Tạo thói quen chung và ghi nhận kết quả",
          "Giảm tham gia",
          "Chỉ báo cáo",
          "Không tác dụng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cần sự tham gia."
      }
    ]
  },
  "M4-A": {
    "code": "M4-A",
    "title": "QUẢN TRỊ AN TOÀN VÀ TRÁCH NHIỆM SỐ",
    "domain_number": 4,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Quản trị an toàn thông tin doanh nghiệp",
        "competency_line": "Năng lực 4.1 · Mức 5–6",
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
          "Phần lớn sự cố bảo mật trong thực tế bắt nguồn từ lỗi con người — bấm nhầm liên kết lừa đảo, dùng mật khẩu yếu, cấu hình sai quyền truy cập — nhiều hơn là từ tấn công kỹ thuật tinh vi. Đây là lý do chương trình đào tạo nhận thức an toàn định kỳ cho toàn thể nhân viên là một biện pháp phòng ngừa quan trọng ngang với đầu tư công nghệ.",
          "Các bước. 1. Kiểm kê tài sản thông tin và đánh giá mức quan trọng. 2. Nhận diện mối đe dọa và điểm yếu; đánh giá rủi ro theo khả năng và ảnh hưởng. 3. Chọn phương án xử lý: giảm thiểu, chuyển giao, tránh hoặc chấp nhận có ghi nhận. 4. Phân quyền theo nguyên tắc tối thiểu và rà soát định kỳ. 5. Đánh giá rủi ro nhà cung cấp và bên thứ ba; đưa yêu cầu bảo mật vào hợp đồng. 6. Xây kế hoạch ứng phó sự cố, diễn tập và rút kinh nghiệm; đào tạo nhân viên vì yếu tố con người là nguồn sự cố lớn."
        ],
        "examples": [
          "Ví dụ trong công việc. Ban giám đốc yêu cầu báo cáo rủi ro an toàn thông tin. Người ở bậc nâng cao lập sổ đăng ký rủi ro: tài sản thông tin, mối đe dọa, khả năng xảy ra, mức ảnh hưởng, người chịu trách nhiệm và phương án xử lý đã chọn. Với nhà cung cấp phần mềm kế toán, họ yêu cầu bằng chứng về biện pháp bảo mật trước khi ký hợp đồng."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Đầu tư công cụ mà không đánh giá rủi ro; phân quyền quá rộng; bỏ qua bên thứ ba; “chấp nhận rủi ro” nhưng không ai ký nhận."
        ],
        "practice": [
          "Xây bộ hồ sơ quản trị an toàn cho doanh nghiệp: sổ rủi ro tối thiểu 8 mục có chấm điểm (dùng bảng mẫu dưới), ma trận phân quyền, quy trình ứng phó sự cố.",
          "Bảng mẫu sổ rủi ro (điền theo tình huống thật của doanh nghiệp):",
          "Rủi ro",
          "Khả năng (1-5)",
          "Tác động (1-5)",
          "Điểm",
          "Biện pháp",
          "Người phụ trách",
          "Ví dụ: Nhân viên nghỉ việc vẫn còn quyền truy cập hệ thống",
          "4",
          "4",
          "16",
          "Giảm — quy trình thu hồi quyền ngay ngày nghỉ việc",
          "Trưởng phòng Nhân sự"
        ],
        "deliverable": "Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bốn lựa chọn xử lý rủi ro trong quản trị an toàn thông tin là gì?",
            "options": [
              "Xóa, sửa, thêm, giữ nguyên",
              "Cao, trung bình, thấp, không có",
              "Nhanh, chậm, tức thời, định kỳ",
              "Tránh, giảm, chuyển, chấp nhận"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là bốn cách tiếp cận chuẩn để xử lý một rủi ro đã xác định."
          },
          {
            "number": 2,
            "question": "Điểm hở bảo mật phổ biến nhất trong thực tế thường liên quan đến điều gì?",
            "options": [
              "Lỗi phần cứng",
              "Quyền truy cập không được thu hồi khi nhân sự rời đi",
              "Lỗi mạng",
              "Thiết bị quá mới"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là một trong những nguyên nhân phổ biến nhất gây rò rỉ an toàn thông tin trong tổ chức."
          },
          {
            "number": 3,
            "question": "Vì sao cần đánh giá rủi ro từ nhà cung cấp và bên thứ ba?",
            "options": [
              "Không cần thiết",
              "Chỉ cần quan tâm hệ thống nội bộ",
              "An toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan",
              "Nhà cung cấp luôn an toàn tuyệt đối"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bên thứ ba có quyền truy cập hệ thống cũng là một nguồn rủi ro cần được quản lý."
          },
          {
            "number": 4,
            "question": "Phần lớn sự cố bảo mật bắt nguồn từ đâu?",
            "options": [
              "Lỗi con người, như bấm nhầm liên kết hoặc dùng mật khẩu yếu",
              "Chỉ từ lỗi kỹ thuật thuần túy",
              "Luôn từ tấn công có chủ đích tinh vi",
              "Không có nguyên nhân cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là lý do đào tạo nhận thức an toàn cho nhân viên là biện pháp phòng ngừa quan trọng."
          },
          {
            "number": 5,
            "question": "“Chấp nhận rủi ro” trong quản trị an toàn thông tin nghĩa là gì?",
            "options": [
              "Bỏ qua rủi ro mà không xem xét",
              "Quyết định có chủ đích không hành động khi chi phí phòng ngừa vượt lợi ích, được ghi nhận rõ ràng",
              "Luôn là lựa chọn sai",
              "Không áp dụng được trong thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chấp nhận là một lựa chọn hợp lý khi được cân nhắc và ghi nhận có chủ đích, khác với việc bỏ qua không xem xét."
          },
          {
            "number": 6,
            "question": "Bốn cách xử lý rủi ro thường gặp là gì?",
            "options": [
              "Bỏ qua, che giấu, đổ lỗi, chờ",
              "Mua, bán, thuê, cho",
              "Xóa, in, gửi, lưu",
              "Giảm thiểu, chuyển giao, tránh và chấp nhận"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các lựa chọn cơ bản trong quản trị rủi ro."
          },
          {
            "number": 7,
            "question": "Vì sao cần sổ đăng ký rủi ro?",
            "options": [
              "Để tăng số tài liệu",
              "Để theo dõi rủi ro, người chịu trách nhiệm và phương án xử lý một cách hệ thống",
              "Để thay thế mọi biện pháp kỹ thuật",
              "Chỉ để nộp cho cơ quan"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Sổ đăng ký giúp quản trị có hệ thống."
          },
          {
            "number": 8,
            "question": "Vì sao phải đánh giá nhà cung cấp và bên thứ ba?",
            "options": [
              "Dữ liệu và hoạt động của doanh nghiệp có thể bị ảnh hưởng qua họ",
              "Vì họ luôn kém an toàn",
              "Vì để đổi nhà cung cấp liên tục",
              "Không cần vì đã có hợp đồng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Rủi ro có thể đến từ chuỗi cung ứng."
          },
          {
            "number": 9,
            "question": "Phân quyền theo nguyên tắc tối thiểu nghĩa là gì?",
            "options": [
              "Cấp toàn quyền cho tiện",
              "Cấp quyền theo thâm niên",
              "Chỉ cấp quyền cần thiết cho công việc và rà soát định kỳ",
              "Không rà soát"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Giảm thiệt hại nếu tài khoản bị lạm dụng."
          },
          {
            "number": 10,
            "question": "“Chấp nhận rủi ro” hợp lý có nghĩa là gì?",
            "options": [
              "Quyết định có ý thức, có ghi nhận và có người chịu trách nhiệm",
              "Làm ngơ",
              "Giấu không báo",
              "Chờ xem"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chấp nhận phải là quyết định chính thức."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Tuân thủ bảo vệ dữ liệu cá nhân",
        "competency_line": "Năng lực 4.2 · Mức 5–6",
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
          "Đánh giá tác động xử lý dữ liệu cá nhân nên được thực hiện khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm. Quy trình tiếp nhận và xử lý yêu cầu của chủ thể dữ liệu cần có kênh tiếp nhận rõ ràng và thời hạn xử lý xác định, cùng nghĩa vụ thông báo sự cố trong 72 giờ theo quy định.",
          "Các bước. 1. Lập bản đồ luồng dữ liệu cá nhân: thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển cho bên nào. 2. Đối chiếu căn cứ pháp lý: Nghị định 13/2023/NĐ-CP (hiệu lực 1/7/2023) và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực 1/1/2026). 3. Thực hiện đánh giá tác động xử lý dữ liệu khi xử lý quy mô lớn hoặc dữ liệu nhạy cảm. 4. Ký hợp đồng hoặc thỏa thuận rõ ràng với bên xử lý dữ liệu; quy định trách nhiệm bảo mật, xử lý sự cố, xóa hoặc trả dữ liệu khi kết thúc. 5. Xây quy trình tiếp nhận yêu cầu của chủ thể dữ liệu, kênh rõ ràng, thời hạn xác định. 6. Chuẩn bị quy trình thông báo sự cố (nội dung khóa nêu thời hạn 72 giờ theo quy định) và diễn tập. 7. Với chuyển dữ liệu ra nước ngoài: xin ý kiến pháp lý, không tự diễn giải.",
          "Lưu ý: đây là nội dung đào tạo, không phải tư vấn pháp lý; lĩnh vực này thay đổi, cần đối chiếu văn bản hiện hành."
        ],
        "examples": [
          "Ví dụ trong công việc. Doanh nghiệp bán hàng trực tuyến muốn lưu dữ liệu khách hàng trên dịch vụ đám mây có máy chủ ở nước ngoài. Người ở bậc nâng cao lập bản đồ luồng dữ liệu, xem xét căn cứ pháp lý và hợp đồng với bên xử lý, rồi xin ý kiến bộ phận pháp lý trước khi triển khai, vì chuyển dữ liệu ra nước ngoài là vấn đề cần diễn giải chuyên sâu."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chỉ dựa vào một văn bản mà bỏ qua văn bản mới; không có hợp đồng với bên xử lý; không diễn tập thông báo sự cố; tự diễn giải các điểm phức tạp."
        ],
        "practice": [
          "Lập bản đồ luồng dữ liệu cá nhân cho một quy trình nghiệp vụ thật của doanh nghiệp (ví dụ: quy trình từ khách hàng đăng ký đến hoàn tất đơn hàng), xác định các điểm rủi ro tuân thủ và đề xuất biện pháp khắc phục."
        ],
        "deliverable": "Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nghị định 13/2023/NĐ-CP có hiệu lực từ khi nào?",
            "options": [
              "1/1/2023",
              "1/1/2024",
              "1/7/2023",
              "1/7/2024"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Nghị định 13/2023/NĐ-CP có hiệu lực thi hành từ ngày 1/7/2023."
          },
          {
            "number": 2,
            "question": "Bản đồ luồng dữ liệu cần thể hiện những thông tin gì?",
            "options": [
              "Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển giao cho ai",
              "Chỉ cần biết dữ liệu tồn tại",
              "Chỉ cần biết số lượng bản ghi",
              "Chỉ cần biết định dạng tệp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các thông tin cốt lõi cần có trong một bản đồ luồng dữ liệu đầy đủ."
          },
          {
            "number": 3,
            "question": "Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu cá nhân?",
            "options": [
              "Khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm",
              "Không bao giờ cần thiết",
              "Chỉ khi có sự cố xảy ra",
              "Chỉ áp dụng cho doanh nghiệp nước ngoài"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đánh giá trước khi triển khai giúp giảm thiểu rủi ro chủ động thay vì xử lý sau sự cố."
          },
          {
            "number": 4,
            "question": "Vì sao cần có hợp đồng rõ ràng với bên xử lý dữ liệu bên ngoài?",
            "options": [
              "Không cần thiết nếu tin tưởng đối tác",
              "Chỉ để tăng chi phí hợp đồng",
              "Chỉ cần thỏa thuận miệng",
              "Quy định rõ trách nhiệm bảo vệ dữ liệu, không chỉ dựa vào lòng tin"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Hợp đồng rõ ràng là căn cứ pháp lý và thực tiễn để đảm bảo bên xử lý tuân thủ đúng yêu cầu."
          },
          {
            "number": 5,
            "question": "Chuyển dữ liệu cá nhân ra nước ngoài (ví dụ lưu trên máy chủ đám mây quốc tế) cần lưu ý điều gì?",
            "options": [
              "Không cần lưu ý gì đặc biệt",
              "Có yêu cầu riêng theo quy định hiện hành tại Việt Nam, nên tham vấn pháp lý cụ thể",
              "Luôn bị cấm hoàn toàn",
              "Chỉ áp dụng cho dữ liệu công khai"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là điểm có yêu cầu riêng biệt cần được tư vấn pháp lý cụ thể trước khi triển khai."
          },
          {
            "number": 6,
            "question": "Nghị định 13/2023/NĐ-CP có hiệu lực từ ngày nào?",
            "options": [
              "Ngày 1/1/2026",
              "Ngày 1/1/2020",
              "Ngày 1/7/2025",
              "Ngày 1/7/2023"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là ngày có hiệu lực của nghị định theo nội dung khóa học."
          },
          {
            "number": 7,
            "question": "Bản đồ luồng dữ liệu cá nhân cần thể hiện gì?",
            "options": [
              "Chỉ tên phần mềm",
              "Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập và chuyển cho bên nào",
              "Chỉ số lượng nhân viên",
              "Chỉ màu sắc giao diện"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Là nền tảng để tuân thủ."
          },
          {
            "number": 8,
            "question": "Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu?",
            "options": [
              "Chỉ khi bị thanh tra",
              "Không bao giờ",
              "Khi xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm",
              "Chỉ khi đổi logo"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Giúp giảm rủi ro trước khi triển khai."
          },
          {
            "number": 9,
            "question": "Vì sao cần hợp đồng rõ ràng với bên xử lý dữ liệu?",
            "options": [
              "Để xác định trách nhiệm bảo mật, xử lý sự cố và xóa hoặc trả dữ liệu",
              "Để tăng chi phí",
              "Để chuyển hết trách nhiệm cho họ",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Doanh nghiệp vẫn cần bảo đảm tuân thủ."
          },
          {
            "number": 10,
            "question": "Với chuyển dữ liệu cá nhân ra nước ngoài, cách tiếp cận hợp lý là gì?",
            "options": [
              "Tự quyết định cho nhanh",
              "Xin ý kiến pháp lý và đối chiếu văn bản hiện hành trước khi triển khai",
              "Cho rằng luôn được phép",
              "Cho rằng luôn bị cấm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là điểm dễ thay đổi và cần diễn giải chuyên sâu."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Chính sách phúc lợi số của tổ chức",
        "competency_line": "Năng lực 4.3 · Mức 5–6",
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
          "Ở mức lãnh đạo, việc linh hoạt sử dụng công nghệ số để tăng cường thịnh vượng xã hội đòi hỏi chủ động tích hợp các công cụ hỗ trợ sức khỏe tinh thần vào chính sách nhân sự — ví dụ cung cấp quyền truy cập ứng dụng chăm sóc sức khỏe tinh thần cho nhân viên, xây kênh nội bộ ẩn danh để nhân viên chia sẻ khó khăn, hoặc tổ chức các hoạt động kết nối trực tuyến cho đội ngũ làm việc từ xa. Đây là phần bổ sung cho các chính sách phòng ngừa rủi ro đã nêu ở trên, thể hiện vai trò chủ động thay vì chỉ đối phó khi có vấn đề phát sinh.",
          "Các bước. 1. Tìm nguyên nhân gốc của quá tải: khối lượng, quy trình, kỳ vọng phản hồi. 2. Văn bản hóa các nguyên tắc như thời gian ngắt kết nối, kênh khẩn cấp, ngoại lệ có kiểm soát. 3. Đảm bảo khả năng tiếp cận của công cụ số (chữ dễ đọc, phụ đề, tương thích với công nghệ hỗ trợ). 4. Cấp quản lý làm gương: không nhắn việc ngoài giờ trừ khi thật cần. 5. Cân nhắc thay cuộc họp bằng email hoặc kênh khác khi chỉ cần thông báo một chiều. 6. Theo dõi kết quả và điều chỉnh chính sách."
        ],
        "examples": [
          "Ví dụ trong công việc. Một công ty thấy nhân viên liên tục làm thêm giờ vì dự án nào cũng gấp và khách hàng nhắn bất cứ lúc nào. Người ở bậc nâng cao nhìn ra nguyên nhân có tính hệ thống (phân bổ nguồn lực, quy trình, kỳ vọng) chứ không phải lỗi từng người, rồi đề xuất chính sách phúc lợi số có văn bản, có người chịu trách nhiệm."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chính sách chỉ nằm trên giấy; quản lý không làm gương; công cụ không dùng được cho mọi người."
        ],
        "practice": [
          "Khảo sát trải nghiệm làm việc số trong doanh nghiệp (thiết kế bộ câu hỏi ngắn 8–10 câu về quá tải thông tin, chất lượng họp, ranh giới thời gian), phân tích kết quả và soạn dự thảo chính sách phúc lợi số."
        ],
        "deliverable": "Kết quả khảo sát, phân tích, dự thảo chính sách.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nguyên nhân quá tải có tính hệ thống thường xuất phát từ đâu?",
            "options": [
              "Chỉ từ năng lực cá nhân của từng nhân viên",
              "Không có nguyên nhân hệ thống nào",
              "Chỉ do thiết bị lỗi thời",
              "Cách tổ chức vận hành: quá nhiều kênh, quá nhiều họp, kỳ vọng phản hồi tức thời"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Vấn đề quá tải thường mang tính hệ thống hơn là vấn đề cá nhân."
          },
          {
            "number": 2,
            "question": "Vì sao chính sách về quyền ngắt kết nối nên được văn bản hóa chính thức?",
            "options": [
              "Không cần thiết, thỏa thuận ngầm là đủ",
              "Chỉ để tuân thủ hình thức",
              "Không có tác dụng thực tế",
              "Giúp nhân viên có căn cứ rõ ràng để bảo vệ thời gian nghỉ ngơi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Văn bản chính thức tạo căn cứ vững chắc hơn thỏa thuận ngầm không rõ ràng."
          },
          {
            "number": 3,
            "question": "Khả năng tiếp cận (accessibility) trong công cụ số liên quan đến điều gì?",
            "options": [
              "Chỉ liên quan đến tốc độ tải trang",
              "Mức độ công cụ có thể được sử dụng bởi người có khả năng khác nhau, bao gồm người khuyết tật",
              "Chỉ liên quan đến giao diện đẹp",
              "Không quan trọng trong môi trường doanh nghiệp"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là yếu tố đảm bảo tính bình đẳng trong tiếp cận công cụ số."
          },
          {
            "number": 4,
            "question": "Vai trò làm gương của cấp quản lý ảnh hưởng thế nào đến chính sách phúc lợi số?",
            "options": [
              "Quyết định hiệu quả thực tế của chính sách — hành vi thực tế quan trọng hơn văn bản",
              "Không ảnh hưởng gì",
              "Chỉ ảnh hưởng đến nhân viên mới",
              "Không liên quan đến phúc lợi số"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nếu quản lý không tuân thủ chính sách, chính sách sẽ mất hiệu lực thực tế dù có trên giấy."
          },
          {
            "number": 5,
            "question": "Cuộc họp nào nên được cân nhắc thay bằng email hoặc kênh khác?",
            "options": [
              "Cuộc họp cần thảo luận, trao đổi ý kiến qua lại",
              "Cuộc họp ra quyết định quan trọng",
              "Cuộc họp chỉ nhằm thông báo một chiều không cần trao đổi",
              "Cuộc họp giải quyết xung đột"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thông báo một chiều có thể truyền đạt hiệu quả qua kênh không đồng bộ như email, tiết kiệm thời gian họp."
          },
          {
            "number": 6,
            "question": "Quá tải mang tính hệ thống thường bắt nguồn từ đâu?",
            "options": [
              "Phân bổ nguồn lực, quy trình và kỳ vọng phản hồi",
              "Chỉ do cá nhân lười",
              "Chỉ do thiết bị cũ",
              "Chỉ do thời tiết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần xử lý ở cấp hệ thống."
          },
          {
            "number": 7,
            "question": "Vì sao quyền ngắt kết nối nên được văn bản hóa?",
            "options": [
              "Để tăng giấy tờ",
              "Để nguyên tắc rõ ràng, áp dụng nhất quán và có thể theo dõi",
              "Để giám sát nhân viên",
              "Không cần thiết"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Văn bản hóa tạo cơ sở thực hiện."
          },
          {
            "number": 8,
            "question": "Khả năng tiếp cận trong công cụ số liên quan đến điều gì?",
            "options": [
              "Chỉ giá rẻ",
              "Chỉ tốc độ",
              "Để nhiều người, kể cả người có hạn chế, dùng được công cụ",
              "Chỉ màu sắc"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tiếp cận là phần của phúc lợi số."
          },
          {
            "number": 9,
            "question": "Vai trò làm gương của quản lý ảnh hưởng thế nào?",
            "options": [
              "Không ảnh hưởng",
              "Hành vi của quản lý quyết định chính sách có được tôn trọng thật hay không",
              "Chỉ ảnh hưởng ngân sách",
              "Chỉ ảnh hưởng phần mềm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Văn hóa theo hành vi của cấp trên."
          },
          {
            "number": 10,
            "question": "Cuộc họp nào nên cân nhắc thay bằng email?",
            "options": [
              "Cuộc họp chỉ để thông báo một chiều, không cần thảo luận",
              "Họp ra quyết định phức tạp",
              "Họp giải quyết xung đột",
              "Họp cần nhiều ý kiến"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giảm họp không cần thiết."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Chiến lược bền vững số",
        "competency_line": "Năng lực 4.4 · Mức 5–6",
        "objectives": [
          "Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ"
        ],
        "definitions": [
          "Chỉ tiêu bền vững: thước đo cụ thể, đo lường được, dùng để theo dõi tiến độ hướng tới mục tiêu bền vững đã đặt ra",
          "Vòng đời thiết bị (từ góc độ chính sách): chu trình mua, sử dụng, sửa chữa, và thanh lý thiết bị được quản lý có chủ đích ở cấp tổ chức"
        ],
        "body": [
          "Ở mức nâng cao, việc chọn giải pháp phù hợp nhất để bảo vệ môi trường mở rộng thành chiến lược bền vững số cấp toàn doanh nghiệp. Kiểm kê tác động số toàn doanh nghiệp bao gồm tổng dung lượng lưu trữ, tuổi thọ trung bình thiết bị, mức tiêu thụ năng lượng hạ tầng công nghệ thông tin.",
          "Chỉ tiêu bền vững cần cụ thể và đo lường được, ví dụ “giảm 20% khối lượng in ấn trong năm tới”. Tiêu chí bền vững trong mua sắm nên được đưa vào chính thức trong quy trình lựa chọn nhà cung cấp. Báo cáo kết quả bền vững cần dựa trên số liệu thực tế đã đo lường, tránh công bố phóng đại.",
          "Các bước. 1. Xác định nguồn tác động chính bằng số liệu hiện có. 2. Đặt chỉ tiêu cụ thể, đo được, có hạn: ví dụ kéo dài vòng đời thiết bị thêm một năm. 3. Chính sách vòng đời thiết bị: ưu tiên bảo trì, sửa chữa, tái sử dụng trước khi thay mới; thu hồi an toàn. 4. Đưa tiêu chí bền vững vào lựa chọn nhà cung cấp, kể cả dịch vụ đám mây. 5. Báo cáo kết quả trung thực, nêu cả hạn chế; tránh phóng đại."
        ],
        "examples": [
          "Ví dụ trong công việc. Ban lãnh đạo đặt mục tiêu “công ty xanh hơn” nhưng chưa có số đo. Người ở bậc nâng cao tìm điểm can thiệp có tác động lớn (ví dụ vòng đời thiết bị, dữ liệu lưu trữ không cần thiết, chọn nhà cung cấp đám mây), đặt chỉ tiêu cụ thể và báo cáo trung thực."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Mục tiêu mơ hồ; chỉ làm việc dễ thấy mà tác động nhỏ; công bố phóng đại gây mất uy tín."
        ],
        "practice": [
          "Xây chiến lược bền vững số cho doanh nghiệp: kiểm kê hiện trạng, ba mục tiêu có chỉ tiêu đo được, kế hoạch triển khai, và khung báo cáo."
        ],
        "deliverable": "Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Chỉ tiêu bền vững tốt cần có đặc điểm gì?",
            "options": [
              "Chung chung, dễ đạt được",
              "Không cần đo lường",
              "Cụ thể và đo lường được",
              "Chỉ cần có ý định tốt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chỉ tiêu cụ thể, đo lường được mới giúp theo dõi tiến độ hiệu quả."
          },
          {
            "number": 2,
            "question": "Xác định điểm can thiệp có tác động lớn nhất giúp ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Chỉ để báo cáo đẹp hơn",
              "Làm phức tạp thêm quy trình",
              "Tập trung nguồn lực vào nơi mang lại hiệu quả cao nhất"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tập trung vào điểm có tác động lớn giúp sử dụng nguồn lực hiệu quả hơn dàn trải."
          },
          {
            "number": 3,
            "question": "Vì sao không nên công bố kết quả bền vững phóng đại?",
            "options": [
              "Không có vấn đề gì nếu không ai phát hiện",
              "Không liên quan đến uy tín doanh nghiệp",
              "Là rủi ro uy tín nếu bị phát hiện không đúng thực tế, ngoài vấn đề đạo đức",
              "Luôn được chấp nhận trong marketing"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Công bố sai lệch có thể gây tổn hại nghiêm trọng đến uy tín khi bị phát hiện."
          },
          {
            "number": 4,
            "question": "Chính sách vòng đời thiết bị ở cấp tổ chức nên ưu tiên điều gì trước khi thay mới?",
            "options": [
              "Thay mới ngay khi có phiên bản mới hơn",
              "Ưu tiên sửa chữa trước khi thay mới",
              "Không cần chính sách cụ thể",
              "Thay mới toàn bộ đồng loạt mỗi năm"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ưu tiên sửa chữa giúp kéo dài vòng đời thiết bị và giảm rác thải điện tử."
          },
          {
            "number": 5,
            "question": "Tiêu chí bền vững khi chọn nhà cung cấp dịch vụ đám mây có thể bao gồm gì?",
            "options": [
              "Chỉ quan tâm giá rẻ nhất",
              "Không có tiêu chí liên quan đến bền vững",
              "Chỉ quan tâm tốc độ truy cập",
              "Cam kết năng lượng tái tạo và hiệu suất năng lượng của trung tâm dữ liệu"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các yếu tố phản ánh mức độ bền vững của nhà cung cấp dịch vụ đám mây."
          },
          {
            "number": 6,
            "question": "Chỉ tiêu bền vững tốt cần đặc điểm gì?",
            "options": [
              "Cụ thể, đo được và có thời hạn",
              "Chung chung",
              "Không có thời hạn",
              "Không cần đo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đo được mới quản lý được."
          },
          {
            "number": 7,
            "question": "Xác định điểm can thiệp tác động lớn nhất giúp gì?",
            "options": [
              "Làm mọi thứ như nhau",
              "Tập trung nguồn lực vào nơi mang lại hiệu quả nhất",
              "Tránh làm gì",
              "Chỉ làm việc dễ thấy"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ưu tiên theo tác động."
          },
          {
            "number": 8,
            "question": "Vì sao không nên công bố kết quả bền vững phóng đại?",
            "options": [
              "Gây mất uy tín và rủi ro khi bị kiểm chứng",
              "Để tăng doanh thu",
              "Để tránh báo cáo",
              "Không có hậu quả"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Báo cáo cần trung thực."
          },
          {
            "number": 9,
            "question": "Chính sách vòng đời thiết bị nên ưu tiên gì trước khi thay mới?",
            "options": [
              "Bảo trì, sửa chữa và tái sử dụng khi còn phù hợp",
              "Thay mới mọi lúc",
              "Bỏ ngay thiết bị cũ",
              "Bán rẻ không kiểm tra"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Kéo dài vòng đời giảm tác động."
          },
          {
            "number": 10,
            "question": "Tiêu chí bền vững khi chọn dịch vụ đám mây có thể gồm gì?",
            "options": [
              "Chỉ tên thương hiệu",
              "Hiệu quả năng lượng và cam kết bền vững của nhà cung cấp",
              "Chỉ màu giao diện",
              "Chỉ số nhân viên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhà cung cấp ảnh hưởng đến dấu chân số."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M4-A — “Bộ khung quản trị an toàn và trách nhiệm số” (Assignment)",
      "context": "Bạn là người phụ trách quản trị an toàn và trách nhiệm số của một doanh nghiệp vừa và nhỏ (giả định) bán hàng trực tuyến, có lưu dữ liệu khách hàng và dùng một số dịch vụ bên thứ ba.",
      "requirements": "1. Hồ sơ quản trị an toàn thông tin: kiểm kê tài sản, sổ đăng ký rủi ro (tối thiểu 8 rủi ro), phương án xử lý, ma trận phân quyền, đánh giá một nhà cung cấp, kế hoạch ứng phó sự cố. 2. Chương trình tuân thủ bảo vệ dữ liệu cá nhân: bản đồ luồng dữ liệu cho một quy trình, đối chiếu căn cứ pháp lý, các điểm cần đánh giá tác động, mẫu điều khoản với bên xử lý, quy trình tiếp nhận yêu cầu của chủ thể dữ liệu, quy trình thông báo sự cố; nêu rõ điểm cần pháp lý xác nhận. 3. Chính sách phúc lợi số: ngắt kết nối, kênh khẩn cấp, tiếp cận công cụ, nguyên tắc họp và vai trò làm gương của quản lý. 4. Chiến lược bền vững số: hiện trạng, tối thiểu 3 chỉ tiêu đo được, chính sách vòng đời thiết bị, tiêu chí chọn nhà cung cấp, cách báo cáo trung thực. 5. Lộ trình triển khai 6 tháng và các rủi ro còn lại.",
      "deliverables": "Bốn bộ tài liệu tương ứng và lộ trình.\nHình thức nộp. Một tài liệu tổng hợp có mục lục.",
      "rubric": [
        "Gợi ý. Dùng dữ liệu giả định. Không khẳng định tuyệt đối các điểm pháp lý phức tạp; ghi rõ cần xác nhận từ chuyên gia.",
        "Tiêu chí",
        "Điểm",
        "Hồ sơ quản trị an toàn thông tin (rủi ro, phân quyền, ứng phó sự cố)",
        "30",
        "Chương trình tuân thủ bảo vệ dữ liệu cá nhân, đúng căn cứ pháp lý",
        "30",
        "Chính sách phúc lợi số",
        "20",
        "Chiến lược bền vững số, có chỉ tiêu đo được",
        "20",
        "Lưu ý quan trọng gửi người triển khai: Toàn bộ nội dung liên quan đến Nghị định 13/2023/NĐ-CP và Luật Bảo vệ dữ liệu cá nhân trong khóa M4-I (Module 2) và M4-A (Module 2) đã được đối chiếu với thông tin tra cứu tại thời điểm biên soạn. Tuy nhiên, đây là lĩnh vực pháp lý có thể thay đổi (Luật Bảo vệ dữ liệu cá nhân dự kiến hiệu lực 1/1/2026), và nội dung này cần được bộ phận pháp lý hoặc chuyên gia tư vấn rà soát trước khi đưa vào giảng dạy chính thức, đặc biệt các nội dung liên quan đến chuyển dữ liệu ra nước ngoài, báo cáo đánh giá tác động, và các nghĩa vụ thông báo sự cố cụ thể — đây là những điểm dễ thay đổi hoặc cần diễn giải chuyên sâu hơn phạm vi một khóa đào tạo kỹ năng số phổ thông."
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Bốn cách xử lý rủi ro là gì?",
        "options": [
          "Giảm thiểu, chuyển giao, tránh, chấp nhận",
          "Bỏ qua, giấu, đổ lỗi, chờ",
          "Mua, bán, thuê, cho",
          "Xóa, in, gửi, lưu"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Các lựa chọn cơ bản."
      },
      {
        "number": 2,
        "question": "Sổ đăng ký rủi ro dùng để làm gì?",
        "options": [
          "Tăng số tài liệu",
          "Thay mọi biện pháp kỹ thuật",
          "Theo dõi rủi ro, người chịu trách nhiệm và phương án xử lý",
          "Chỉ nộp cơ quan"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Quản trị có hệ thống."
      },
      {
        "number": 3,
        "question": "Vì sao đánh giá nhà cung cấp?",
        "options": [
          "Họ luôn kém",
          "Để đổi liên tục",
          "Đã có hợp đồng là đủ",
          "Rủi ro có thể đến qua bên thứ ba"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Chuỗi cung ứng."
      },
      {
        "number": 4,
        "question": "Nguyên tắc phân quyền tối thiểu?",
        "options": [
          "Cấp toàn quyền",
          "Cấp theo thâm niên",
          "Chỉ cấp quyền cần cho công việc và rà soát định kỳ",
          "Không rà soát"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giảm thiệt hại."
      },
      {
        "number": 5,
        "question": "“Chấp nhận rủi ro” hợp lý là gì?",
        "options": [
          "Làm ngơ",
          "Giấu",
          "Quyết định có ý thức, ghi nhận và có người chịu trách nhiệm",
          "Chờ xem"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Quyết định chính thức."
      },
      {
        "number": 6,
        "question": "Hiệu lực của Nghị định 13/2023/NĐ-CP?",
        "options": [
          "1/7/2023",
          "1/1/2026",
          "1/1/2020",
          "1/7/2025"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Theo nội dung khóa học."
      },
      {
        "number": 7,
        "question": "Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 có hiệu lực từ ngày nào theo nội dung khóa?",
        "options": [
          "1/7/2023",
          "1/1/2024",
          "1/7/2027",
          "1/1/2026"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Theo nội dung khóa học, cần đối chiếu văn bản hiện hành."
      },
      {
        "number": 8,
        "question": "Bản đồ luồng dữ liệu thể hiện gì?",
        "options": [
          "Chỉ tên phần mềm",
          "Thu thập, lưu trữ, truy cập và chia sẻ dữ liệu",
          "Chỉ số nhân viên",
          "Chỉ màu giao diện"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nền tảng tuân thủ."
      },
      {
        "number": 9,
        "question": "Hợp đồng với bên xử lý dữ liệu cần làm rõ gì?",
        "options": [
          "Chỉ giá",
          "Chỉ thời gian",
          "Chỉ tên",
          "Trách nhiệm bảo mật, xử lý sự cố, xóa hoặc trả dữ liệu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Xác định trách nhiệm."
      },
      {
        "number": 10,
        "question": "Chuyển dữ liệu ra nước ngoài, nên làm gì?",
        "options": [
          "Tự quyết",
          "Xin ý kiến pháp lý, đối chiếu văn bản hiện hành",
          "Luôn được phép",
          "Luôn bị cấm"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Điểm dễ thay đổi."
      },
      {
        "number": 11,
        "question": "Quá tải hệ thống bắt nguồn từ đâu?",
        "options": [
          "Do cá nhân lười",
          "Do thiết bị cũ",
          "Do thời tiết",
          "Phân bổ nguồn lực, quy trình, kỳ vọng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nguyên nhân hệ thống."
      },
      {
        "number": 12,
        "question": "Vì sao văn bản hóa quyền ngắt kết nối?",
        "options": [
          "Rõ ràng, nhất quán, theo dõi được",
          "Tăng giấy tờ",
          "Giám sát nhân viên",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cơ sở thực hiện."
      },
      {
        "number": 13,
        "question": "Khả năng tiếp cận công cụ số là gì?",
        "options": [
          "Nhiều người, kể cả người có hạn chế, dùng được",
          "Chỉ giá rẻ",
          "Chỉ nhanh",
          "Chỉ đẹp"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Tiếp cận."
      },
      {
        "number": 14,
        "question": "Quản lý làm gương có vai trò gì?",
        "options": [
          "Không ảnh hưởng",
          "Chỉ ngân sách",
          "Quyết định chính sách có được tôn trọng thật",
          "Chỉ phần mềm"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Văn hóa theo cấp trên."
      },
      {
        "number": 15,
        "question": "Họp nào nên thay bằng email?",
        "options": [
          "Họp ra quyết định phức tạp",
          "Họp giải quyết xung đột",
          "Họp thông báo một chiều",
          "Họp cần nhiều ý kiến"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giảm họp."
      },
      {
        "number": 16,
        "question": "Chỉ tiêu bền vững tốt cần gì?",
        "options": [
          "Chung chung",
          "Cụ thể, đo được, có thời hạn",
          "Không thời hạn",
          "Không đo"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đo được."
      },
      {
        "number": 17,
        "question": "Điểm can thiệp tác động lớn giúp gì?",
        "options": [
          "Làm mọi thứ như nhau",
          "Tránh làm",
          "Chỉ việc dễ thấy",
          "Tập trung nguồn lực vào chỗ hiệu quả nhất"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Ưu tiên."
      },
      {
        "number": 18,
        "question": "Vì sao không công bố phóng đại?",
        "options": [
          "Tăng doanh thu",
          "Mất uy tín khi bị kiểm chứng",
          "Tránh báo cáo",
          "Không hậu quả"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Trung thực."
      },
      {
        "number": 19,
        "question": "Vòng đời thiết bị ưu tiên gì trước khi thay mới?",
        "options": [
          "Bảo trì, sửa chữa, tái sử dụng",
          "Thay mới",
          "Bỏ ngay",
          "Bán không kiểm tra"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Kéo dài vòng đời."
      },
      {
        "number": 20,
        "question": "Tiêu chí bền vững khi chọn đám mây?",
        "options": [
          "Tên thương hiệu",
          "Hiệu quả năng lượng và cam kết bền vững",
          "Màu giao diện",
          "Số nhân viên"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nhà cung cấp ảnh hưởng."
      }
    ]
  },
  "M5-F": {
    "code": "M5-F",
    "title": "XỬ LÝ SỰ CỐ VÀ TỰ HỌC CÔNG NGHỆ",
    "domain_number": 5,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Xử lý sự cố thường gặp",
        "competency_line": "Năng lực 5.1 · Mức 1–2",
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
          "Các bước xử lý cơ bản theo thứ tự nên thử: khởi động lại ứng dụng hoặc thiết bị, kiểm tra kết nối mạng, kiểm tra bản cập nhật. Khi đã thử các bước cơ bản mà không giải quyết được, nên dừng tự xử lý và báo bộ phận kỹ thuật, cung cấp đầy đủ mô tả sự cố và các bước đã thử.",
          "Các bước. 1. Mô tả sự cố bằng bốn thông tin: đang làm gì, chuyện gì xảy ra, thông báo lỗi nguyên văn, bắt đầu từ khi nào. 2. Thử các bước cơ bản: kiểm tra kết nối, lưu việc đang làm rồi khởi động lại ứng dụng hoặc thiết bị. 3. Tìm giải pháp bằng cách tìm nguyên văn thông báo lỗi trong tài liệu hướng dẫn hoặc nguồn chính thống. 4. Nếu chưa xử lý được, báo bộ phận kỹ thuật kèm ảnh chụp lỗi và những gì đã thử. 5. Ghi lại cách xử lý thành công để lần sau dùng lại."
        ],
        "examples": [
          "Ví dụ trong công việc. Máy in không in được. Nhân viên nhắn “máy in hỏng” cho bộ phận kỹ thuật, nên người hỗ trợ phải hỏi lại nhiều lần. Nếu mô tả đủ: máy in nào, đang in từ ứng dụng nào, thông báo lỗi nguyên văn, đã thử những gì, từ lúc nào thì việc xử lý nhanh hơn nhiều."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Mô tả mơ hồ; thử nhiều thứ cùng lúc nên không biết cái nào có tác dụng; làm theo hướng dẫn từ nguồn không đáng tin; không ghi lại cách đã xử lý."
        ],
        "practice": [
          "Với 5 tình huống sự cố mô phỏng dưới đây, viết mô tả sự cố đúng chuẩn và liệt kê các bước sẽ thử theo thứ tự.",
          "5 tình huống mẫu: 1. Máy in không in được, đèn báo nhấp nháy màu vàng 2. Không mở được một file PDF, hiện thông báo “file bị hỏng” 3. Không kết nối được wifi công ty dù các thiết bị khác vẫn kết nối bình thường 4. Trình duyệt web chạy rất chậm khi mở nhiều tab 5. Không đăng nhập được vào hệ thống email công ty, báo sai mật khẩu dù chắc chắn gõ đúng"
        ],
        "deliverable": "Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Một mô tả sự cố tốt cần trả lời những câu hỏi nào?",
            "options": [
              "Chỉ cần nói “bị lỗi” là đủ",
              "Đang làm gì, điều gì xảy ra khác mong đợi, có thông báo lỗi cụ thể không",
              "Chỉ cần biết tên thiết bị",
              "Không cần mô tả gì, chỉ cần gọi hỗ trợ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là ba yếu tố giúp mô tả sự cố đủ thông tin để xử lý hiệu quả."
          },
          {
            "number": 2,
            "question": "Bước xử lý cơ bản nào thường giải quyết được nhiều sự cố đơn giản nhất?",
            "options": [
              "Mua thiết bị mới",
              "Gọi ngay bộ phận kỹ thuật",
              "Khởi động lại ứng dụng hoặc thiết bị",
              "Không làm gì và chờ tự hết"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Khởi động lại giải quyết được rất nhiều sự cố phổ biến do lỗi tạm thời."
          },
          {
            "number": 3,
            "question": "Khi gặp thông báo lỗi cụ thể, cách hiệu quả để tìm giải pháp là gì?",
            "options": [
              "Bỏ qua thông báo lỗi",
              "Khởi động lại máy nhiều lần",
              "Không có cách nào hiệu quả",
              "Tra cứu nguyên văn thông báo lỗi đó"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thông báo lỗi cụ thể thường đã được nhiều người khác gặp và có hướng dẫn xử lý sẵn."
          },
          {
            "number": 4,
            "question": "Khi báo cáo sự cố cho bộ phận kỹ thuật, thông tin nào nên cung cấp?",
            "options": [
              "Chỉ cần nói “máy bị lỗi”",
              "Không cần cung cấp thông tin gì",
              "Mô tả sự cố, các bước đã thử, thông báo lỗi cụ thể nếu có",
              "Chỉ cần tên người dùng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thông tin đầy đủ giúp bộ phận hỗ trợ xử lý nhanh và chính xác hơn."
          },
          {
            "number": 5,
            "question": "Vì sao nên ghi lại cách đã xử lý thành công một sự cố?",
            "options": [
              "Để lần sau gặp lại có thể tự xử lý nhanh hơn",
              "Không cần thiết",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ghi chép giúp xây dựng kinh nghiệm cá nhân, tiết kiệm thời gian về sau."
          },
          {
            "number": 6,
            "question": "Mô tả sự cố “máy tính không dùng được” thiếu thông tin quan trọng nào?",
            "options": [
              "Màu của máy tính",
              "Giá mua máy",
              "Tên người sản xuất",
              "Đang làm gì, lỗi nguyên văn ra sao và đã thử những gì"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Mô tả cụ thể giúp người hỗ trợ xử lý nhanh."
          },
          {
            "number": 7,
            "question": "Trước khi báo sự cố, bước cơ bản nào hợp lý?",
            "options": [
              "Xóa mọi tệp",
              "Lưu công việc rồi khởi động lại ứng dụng hoặc thiết bị",
              "Cài lại hệ điều hành",
              "Đổi mật khẩu tất cả tài khoản"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nhiều sự cố đơn giản được giải quyết bằng khởi động lại."
          },
          {
            "number": 8,
            "question": "Thấy thông báo lỗi lạ, cách tìm giải pháp hiệu quả là gì?",
            "options": [
              "Tìm nguyên văn thông báo lỗi trong nguồn chính thống",
              "Đoán nguyên nhân",
              "Làm theo mọi video bất kỳ",
              "Bỏ qua"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nguyên văn lỗi giúp tìm đúng hướng dẫn."
          },
          {
            "number": 9,
            "question": "Khi báo bộ phận kỹ thuật, nên đính kèm gì?",
            "options": [
              "Chỉ lời than phiền",
              "Ảnh chụp lỗi và danh sách những gì đã thử",
              "Mật khẩu của bạn",
              "Không cần gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thông tin đầy đủ tiết kiệm thời gian."
          },
          {
            "number": 10,
            "question": "Vì sao ghi lại cách xử lý thành công?",
            "options": [
              "Để lần sau tự xử lý nhanh và chia sẻ cho đồng nghiệp",
              "Để tăng giấy tờ",
              "Để khoe",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tri thức được tái sử dụng."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Chọn công cụ phù hợp với công việc",
        "competency_line": "Năng lực 5.2 · Mức 1–2",
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
          "Nên ưu tiên dùng công cụ có sẵn của doanh nghiệp trước khi tìm công cụ mới. Dấu hiệu công cụ không còn phù hợp bao gồm phải thực hiện nhiều thao tác thủ công để bù đắp, hoặc thường xuyên xảy ra sai sót. Trước khi đưa dữ liệu công việc lên bất kỳ công cụ mới nào, nên hỏi ý kiến người phụ trách hoặc bộ phận IT.",
          "Các bước. 1. Xác định rõ công việc cần làm và kết quả mong muốn trước khi chọn công cụ. 2. Ưu tiên công cụ doanh nghiệp đã trang bị và phê duyệt. 3. Nhận biết dấu hiệu công cụ không còn phù hợp: chậm, lỗi nhiều, thiếu chức năng cần. 4. Muốn dùng công cụ mới: hỏi bộ phận phụ trách, không tự ý đưa dữ liệu công việc lên. 5. Chạy thử với dữ liệu giả hoặc không nhạy cảm."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhóm cần chia sẻ tệp lớn với khách hàng. Một nhân viên tự đăng ký dịch vụ chia sẻ tệp miễn phí trên mạng, trong khi công ty đã có dịch vụ lưu trữ được phê duyệt. Dùng công cụ ngoài có thể làm dữ liệu khách hàng nằm ngoài kiểm soát của doanh nghiệp."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chọn công cụ vì nghe nhiều người dùng; tự ý cài phần mềm; đưa dữ liệu khách hàng lên công cụ chưa duyệt."
        ],
        "practice": [
          "Liệt kê 5 công việc thường làm trong tuần, xác định công cụ đang dùng cho mỗi việc và đánh giá mức độ phù hợp.",
          "Bảng mẫu:",
          "Công việc",
          "Công cụ đang dùng",
          "Mức phù hợp (Tốt/Tạm/Không phù hợp)",
          "Lý do",
          "Ví dụ: Tổng hợp báo cáo doanh số hàng tuần",
          "Ghi tay rồi gõ lại vào Word",
          "Không phù hợp",
          "Mất thời gian, dễ sai sót khi chép tay"
        ],
        "deliverable": "Bảng công việc – công cụ – đánh giá phù hợp (5 dòng).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Bước đầu tiên trước khi chọn công cụ cho một công việc là gì?",
            "options": [
              "Xác định rõ nhu cầu: cần làm gì, kết quả dùng bởi ai",
              "Chọn công cụ phổ biến nhất",
              "Hỏi đồng nghiệp dùng gì",
              "Không cần bước chuẩn bị nào"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Hiểu rõ nhu cầu giúp chọn đúng công cụ, tránh phải làm lại."
          },
          {
            "number": 2,
            "question": "Vì sao nên ưu tiên công cụ có sẵn của doanh nghiệp?",
            "options": [
              "Không có lý do đặc biệt",
              "Đã được phê duyệt về bảo mật, dễ hợp tác với đồng nghiệp",
              "Luôn miễn phí",
              "Không cần lý do gì"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Công cụ có sẵn đảm bảo tính nhất quán và an toàn hơn công cụ tự tìm bên ngoài."
          },
          {
            "number": 3,
            "question": "Dấu hiệu nào cho thấy công cụ đang dùng không còn phù hợp?",
            "options": [
              "Công việc hoàn thành nhanh chóng, chính xác",
              "Không có vấn đề gì",
              "Đồng nghiệp cũng dùng công cụ đó",
              "Phải thực hiện nhiều thao tác thủ công lặp lại để bù đắp thiếu sót của công cụ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là dấu hiệu công cụ không đáp ứng đủ nhu cầu công việc thực tế."
          },
          {
            "number": 4,
            "question": "Trước khi đưa dữ liệu công việc lên một công cụ mới chưa được phê duyệt, nên làm gì?",
            "options": [
              "Cứ dùng thử trước, hỏi sau",
              "Không cần hỏi ai",
              "Hỏi ý kiến người phụ trách hoặc bộ phận IT trước",
              "Chỉ cần thông báo sau khi đã dùng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xin phê duyệt trước giúp tránh rủi ro bảo mật và vi phạm chính sách công ty."
          },
          {
            "number": 5,
            "question": "Rủi ro của việc tự ý cài công cụ ngoài không qua phê duyệt là gì?",
            "options": [
              "Không có rủi ro gì",
              "Chỉ tốn thêm dung lượng",
              "Có thể vi phạm chính sách bảo mật, đưa dữ liệu ra ngoài kiểm soát",
              "Chỉ ảnh hưởng đến tốc độ máy"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là các rủi ro thực tế cần cân nhắc trước khi tự ý dùng công cụ mới."
          },
          {
            "number": 6,
            "question": "Bước đầu tiên trước khi chọn công cụ là gì?",
            "options": [
              "Xác định rõ công việc và kết quả mong muốn",
              "Tìm công cụ đang nổi",
              "Mua công cụ đắt nhất",
              "Hỏi bạn bè cách chơi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Công cụ phục vụ công việc."
          },
          {
            "number": 7,
            "question": "Vì sao ưu tiên công cụ có sẵn của doanh nghiệp?",
            "options": [
              "Luôn tốt nhất về tính năng",
              "Vì miễn phí tuyệt đối",
              "Không có lý do",
              "Đã được phê duyệt, có hỗ trợ và an toàn hơn"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Giảm rủi ro dữ liệu và chi phí hỗ trợ."
          },
          {
            "number": 8,
            "question": "Dấu hiệu công cụ không còn phù hợp là gì?",
            "options": [
              "Có giao diện đẹp",
              "Thường xuyên chậm, lỗi hoặc thiếu chức năng cần thiết",
              "Có nhiều người dùng",
              "Mới cập nhật"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Công cụ cần đáp ứng nhu cầu thực tế."
          },
          {
            "number": 9,
            "question": "Trước khi đưa dữ liệu lên công cụ mới chưa duyệt, nên làm gì?",
            "options": [
              "Hỏi bộ phận phụ trách và chạy thử với dữ liệu không nhạy cảm",
              "Đưa luôn dữ liệu thật",
              "Đăng ký bằng tài khoản công ty không báo",
              "Chia sẻ cho cả nhóm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tránh lộ dữ liệu."
          },
          {
            "number": 10,
            "question": "Rủi ro của việc tự ý cài công cụ ngoài là gì?",
            "options": [
              "Máy nhẹ hơn",
              "Lộ dữ liệu, nhiễm mã độc, không được hỗ trợ",
              "Làm việc nhanh hơn chắc chắn",
              "Không có rủi ro"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Công cụ không kiểm soát có thể gây hại."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Cải tiến công việc bằng công cụ số",
        "competency_line": "Năng lực 5.3 · Mức 1–2",
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
          "Nhiều tính năng ít được để ý nhưng tiết kiệm đáng kể thời gian: phím tắt, mẫu tài liệu có sẵn, tìm kiếm nâng cao. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho nhiều tình huống. Khi đề xuất cải tiến với cấp trên, nên trình bày cụ thể với số liệu ước tính.",
          "Các bước. 1. Quan sát một tuần làm việc, ghi các việc lặp lại và tốn thời gian. 2. Dùng phím tắt và tính năng có sẵn (tìm kiếm, mẫu, danh sách). 3. Nguyên tắc làm một lần rồi dùng lại: tạo mẫu cho việc lặp. 4. Đề xuất cải tiến: nêu vấn đề, cách làm mới, thời gian dự kiến tiết kiệm. 5. Ghi lại cách làm hiệu quả và chia sẻ với đồng nghiệp."
        ],
        "examples": [
          "Ví dụ trong công việc. Mỗi tuần nhân viên hành chính nhập tay cùng một danh sách vào ba chỗ, mất khoảng một giờ. Chuyển thành một mẫu dùng chung và dùng tính năng tìm kiếm, sao chép có chọn lọc, phím tắt giúp giảm xuống còn mười phút. Khi đề xuất mẫu này, kèm số liệu thời gian tiết kiệm được sẽ thuyết phục hơn."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Đề xuất chung chung; không có số liệu; làm tắt mà bỏ bước kiểm tra."
        ],
        "practice": [
          "Chọn một công việc lặp lại hàng tuần, đo thời gian hiện tại đang mất, áp dụng một cải tiến (phím tắt, mẫu có sẵn, tính năng lọc/sắp xếp…) và đo lại thời gian sau khi cải tiến."
        ],
        "deliverable": "Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổng hợp báo cáo bằng cách chép tay từng dòng. Sau khi dùng tính năng lọc và công thức tổng trong Excel: 5 phút/tuần”).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Phím tắt Ctrl+F thường dùng để làm gì?",
            "options": [
              "Tìm kiếm nhanh trong tài liệu",
              "Lưu tài liệu",
              "In tài liệu",
              "Đóng tài liệu"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là phím tắt tìm kiếm phổ biến trong hầu hết ứng dụng văn phòng."
          },
          {
            "number": 2,
            "question": "Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho tình huống nào?",
            "options": [
              "Tạo mẫu tài liệu hoặc danh mục kiểm tra dùng lại cho công việc hay lặp lại",
              "Chỉ áp dụng cho công việc làm một lần duy nhất",
              "Không áp dụng được trong thực tế",
              "Chỉ áp dụng cho công việc phức tạp"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là nguyên tắc tiết kiệm thời gian cho các công việc có tính lặp lại."
          },
          {
            "number": 3,
            "question": "Khi đề xuất cải tiến với cấp trên, điều gì giúp đề xuất dễ được chấp thuận hơn?",
            "options": [
              "Trình bày chung chung không cần số liệu",
              "Không cần giải thích gì",
              "Có số liệu cụ thể về lợi ích ước tính (ví dụ thời gian tiết kiệm)",
              "Chỉ cần nói “cách này tốt hơn”"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Số liệu cụ thể giúp cấp trên đánh giá và ra quyết định dễ dàng hơn."
          },
          {
            "number": 4,
            "question": "Vì sao nên ghi lại cách làm hiệu quả đã tìm ra?",
            "options": [
              "Không cần thiết",
              "Chỉ để báo cáo hình thức",
              "Để bản thân dùng lại và có thể chia sẻ cho đồng nghiệp",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Ghi chép giúp lan tỏa cách làm hiệu quả trong nhóm, không chỉ dừng lại ở cá nhân."
          },
          {
            "number": 5,
            "question": "Điểm mất thời gian trong công việc thường được nhận diện qua đâu?",
            "options": [
              "Không thể nhận diện được",
              "Công việc lặp lại thường xuyên, tốn công khó chịu, hay gây sai sót",
              "Chỉ qua báo cáo của cấp trên",
              "Chỉ qua phần mềm đo lường chuyên dụng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các dấu hiệu thực tế giúp nhận diện điểm cần cải tiến trong công việc hàng ngày."
          },
          {
            "number": 6,
            "question": "Ctrl+F thường dùng để làm gì?",
            "options": [
              "Tìm một từ hoặc cụm từ trong tài liệu hoặc trang",
              "Lưu tệp",
              "In tài liệu",
              "Đóng ứng dụng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phím tắt tìm kiếm phổ biến."
          },
          {
            "number": 7,
            "question": "Nguyên tắc làm một lần rồi dùng lại phù hợp với tình huống nào?",
            "options": [
              "Việc chỉ làm một lần",
              "Việc luôn khác nhau",
              "Việc không ai làm",
              "Việc lặp lại như báo cáo hằng tuần có cấu trúc giống nhau"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tạo mẫu cho việc lặp."
          },
          {
            "number": 8,
            "question": "Điều gì giúp đề xuất cải tiến dễ được chấp thuận?",
            "options": [
              "Nói chung chung",
              "Nêu vấn đề rõ và kèm số liệu thời gian tiết kiệm",
              "Chỉ nêu ý kiến cá nhân",
              "Không giải thích"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Có căn cứ thì thuyết phục."
          },
          {
            "number": 9,
            "question": "Vì sao ghi lại cách làm hiệu quả?",
            "options": [
              "Để tốn thời gian",
              "Để lưu trữ cho đủ",
              "Không cần",
              "Để dùng lại và chia sẻ cho người khác"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Tri thức được lan tỏa."
          },
          {
            "number": 10,
            "question": "Điểm mất thời gian thường được nhận diện qua đâu?",
            "options": [
              "Đoán",
              "Quan sát và ghi lại việc lặp lại, chờ đợi, làm lại",
              "Nghe đồn",
              "Không cần quan sát"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Số liệu quan sát giúp xác định đúng."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Nhận biết và bù đắp khoảng trống năng lực",
        "competency_line": "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
        "objectives": [
          "Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu",
          "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số"
        ],
        "definitions": [
          "Khoảng trống năng lực: sự chênh lệch giữa năng lực hiện tại của một người và năng lực yêu cầu cho vị trí công việc",
          "Kế hoạch học tập cá nhân: lộ trình cụ thể xác định kỹ năng cần học, nguồn học, và thời gian hoàn thành"
        ],
        "body": [
          "Xác định các vấn đề cần cải thiện về năng lực số ở mức cơ bản nghĩa là nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu. Năng lực số là khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc giải quyết vấn đề trong thực tiễn.",
          "Tự đánh giá theo khung năng lực chính thức giúp có cái nhìn khách quan hơn cảm giác chủ quan. So sánh với yêu cầu của vị trí công việc cho ra khoảng trống năng lực cụ thể. Cách học hiệu quả với người đi làm: học ít nhưng đều, gắn với công việc thực tế.",
          "Các bước. 1. Đối chiếu yêu cầu công việc với khả năng hiện tại để xác định khoảng trống. 2. Chọn một kỹ năng ưu tiên, đặt mục tiêu nhỏ và hạn cụ thể. 3. Học theo đợt ngắn, gắn với việc đang làm; thực hành ngay. 4. Hỏi đồng nghiệp bằng câu hỏi cụ thể (“Làm sao để lọc các dòng có doanh số trên 10 triệu?”). 5. Theo dõi tiến bộ bằng nhật ký ngắn."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên mới được giao dùng bảng tính để làm báo cáo nhưng chưa quen các hàm cơ bản. Thay vì tránh việc, họ tự đánh giá mình ở từng kỹ năng, chọn một kỹ năng ưu tiên, học mỗi ngày mười lăm phút qua tài liệu nội bộ và nhờ đồng nghiệp chỉ cách làm cụ thể."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Học dàn trải; hỏi chung chung; không thực hành ngay; không theo dõi tiến bộ."
        ],
        "practice": [
          "Hoàn thành bản tự đánh giá năng lực số theo 6 miền (dùng bảng mẫu dưới), so với yêu cầu vị trí công việc của mình, lập kế hoạch học tập 3 tháng.",
          "Bảng tự đánh giá mẫu:",
          "Miền",
          "Mức hiện tại (tự đánh giá bậc 1-8)",
          "Mức yêu cầu vị trí",
          "Khoảng trống",
          "Ưu tiên học (Cao/TB/Thấp)",
          "I. Khai thác dữ liệu và thông tin",
          "II. Giao tiếp và hợp tác trong môi trường số",
          "III. Sáng tạo nội dung số",
          "IV. An toàn",
          "V. Giải quyết vấn đề",
          "VI. Ứng dụng trí tuệ nhân tạo"
        ],
        "deliverable": "Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Khoảng trống năng lực được xác định như thế nào?",
            "options": [
              "Không thể xác định được",
              "Chỉ dựa vào cảm giác chủ quan",
              "So sánh năng lực hiện tại với năng lực yêu cầu của vị trí công việc",
              "Không cần xác định cụ thể"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là cách xác định khoảng trống năng lực một cách có căn cứ."
          },
          {
            "number": 2,
            "question": "Cách học hiệu quả với người đi làm nên như thế nào?",
            "options": [
              "Dồn cả ngày cuối tuần để học",
              "Không cần lịch trình cụ thể",
              "Học ít nhưng đều đặn, gắn với công việc thực tế",
              "Chỉ học lý thuyết tách rời công việc"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Học đều đặn và áp dụng ngay giúp ghi nhớ tốt hơn và phù hợp với lịch trình người đi làm."
          },
          {
            "number": 3,
            "question": "Câu hỏi nào khi nhờ đồng nghiệp hướng dẫn sẽ hiệu quả hơn?",
            "options": [
              "“Chỉ em cách dùng Excel với”",
              "“Làm sao để lọc dữ liệu theo điều kiện cụ thể này trong Excel?”",
              "Không cần đặt câu hỏi cụ thể",
              "Hỏi càng chung chung càng tốt"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Câu hỏi cụ thể giúp người hướng dẫn trả lời trực tiếp và hiệu quả hơn."
          },
          {
            "number": 4,
            "question": "Vì sao nên theo dõi tiến bộ học tập của bản thân?",
            "options": [
              "Giúp duy trì động lực học tập lâu dài",
              "Không cần thiết",
              "Chỉ để báo cáo hình thức",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ghi nhận tiến bộ giúp nhận thấy kết quả, đặc biệt khi tiến bộ khó nhận thấy trong ngắn hạn."
          },
          {
            "number": 5,
            "question": "Nguồn học nào phù hợp cho người đi làm?",
            "options": [
              "Chỉ có khóa học chính quy dài hạn",
              "Không có nguồn học nào phù hợp",
              "Chỉ có thể tự học một mình",
              "Tài liệu nội bộ, khóa học trực tuyến, học hỏi từ đồng nghiệp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là các nguồn học đa dạng, linh hoạt phù hợp với lịch trình người đi làm."
          },
          {
            "number": 6,
            "question": "Khoảng trống năng lực được xác định thế nào?",
            "options": [
              "Hỏi người lạ",
              "So sánh yêu cầu công việc với khả năng hiện tại",
              "So sánh với mọi đồng nghiệp",
              "Đoán"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cần đối chiếu cụ thể."
          },
          {
            "number": 7,
            "question": "Cách học phù hợp với người đi làm?",
            "options": [
              "Học một lần thật dài",
              "Học theo đợt ngắn, gắn với việc đang làm và thực hành ngay",
              "Chỉ đọc lý thuyết",
              "Học không mục tiêu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Phù hợp quỹ thời gian."
          },
          {
            "number": 8,
            "question": "Câu hỏi nào khi nhờ đồng nghiệp hiệu quả hơn?",
            "options": [
              "Câu hỏi cụ thể nêu rõ việc đang làm và chỗ vướng",
              "Anh chỉ em với",
              "Cái này làm sao",
              "Sao khó vậy"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cụ thể giúp trả lời nhanh."
          },
          {
            "number": 9,
            "question": "Vì sao theo dõi tiến bộ học tập?",
            "options": [
              "Để thấy kết quả và điều chỉnh cách học",
              "Để báo cáo",
              "Để so sánh",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Duy trì động lực."
          },
          {
            "number": 10,
            "question": "Nguồn học nào phù hợp?",
            "options": [
              "Tin đồn",
              "Nguồn không rõ",
              "Chỉ video giải trí",
              "Tài liệu nội bộ, hướng dẫn chính thức, khóa học uy tín, đồng nghiệp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cần nguồn đáng tin."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M5-F — “Một ngày làm việc với tình huống số” (Assignment)",
      "context": "Bạn là nhân viên mới. Trong một ngày làm việc (giả định) bạn gặp bốn tình huống liên tiếp và cần xử lý bằng phương pháp đã học.",
      "requirements": "1. Sự cố: chọn một sự cố kỹ thuật (thật hoặc tình huống mẫu), viết bản mô tả sự cố đủ thông tin, nêu các bước đã thử theo thứ tự và kết quả, lập tin nhắn báo bộ phận kỹ thuật. 2. Công cụ: nhận một nhiệm vụ mới (ví dụ thu thập phản hồi khách hàng), so sánh ít nhất 2 công cụ theo 3 tiêu chí, chọn một công cụ và nêu lý do; nêu việc cần xin phép trước khi dùng. 3. Cải tiến: chọn một việc lặp lại, mô tả cách làm hiện tại, đề xuất cách làm mới, ước tính thời gian tiết kiệm bằng số liệu cụ thể. 4. Học tập: xác định một khoảng trống năng lực, lập kế hoạch học 2 tuần với mục tiêu, nguồn học, thời gian và cách đo tiến bộ. 5. Viết ghi chú ngắn về điều rút ra.",
      "deliverables": "Bản mô tả và tin nhắn báo sự cố; bảng so sánh công cụ; đề xuất cải tiến; kế hoạch học 2 tuần; ghi chú rút kinh nghiệm.\nHình thức nộp. Một tài liệu tổng hợp.",
      "rubric": [
        "Gợi ý. Nếu không có sự cố thật, dùng tình huống mẫu và ghi rõ đó là giả định; không đưa dữ liệu nhạy cảm vào bài.",
        "Tiêu chí",
        "Điểm",
        "Mô tả và xử lý sự cố kỹ thuật đúng phương pháp",
        "25",
        "Lựa chọn công cụ hợp lý, có căn cứ",
        "25",
        "Đề xuất cải tiến cụ thể, có số liệu",
        "25",
        "Kế hoạch học tập cá nhân rõ ràng, khả thi",
        "25"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Mô tả sự cố tốt cần có gì?",
        "options": [
          "Chỉ nói “bị hỏng”",
          "Chỉ tên máy",
          "Đang làm gì, lỗi nguyên văn, đã thử gì, bắt đầu khi nào",
          "Chỉ giờ làm việc"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Đầy đủ thông tin."
      },
      {
        "number": 2,
        "question": "Bước cơ bản thường hiệu quả với sự cố đơn giản?",
        "options": [
          "Xóa mọi tệp",
          "Lưu việc rồi khởi động lại ứng dụng hoặc thiết bị",
          "Cài lại hệ điều hành",
          "Đổi mọi mật khẩu"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nhanh và ít rủi ro."
      },
      {
        "number": 3,
        "question": "Gặp thông báo lỗi lạ nên làm gì?",
        "options": [
          "Đoán",
          "Làm theo video bất kỳ",
          "Tìm nguyên văn lỗi trong nguồn chính thống",
          "Bỏ qua"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tìm đúng hướng."
      },
      {
        "number": 4,
        "question": "Báo cáo sự cố cho kỹ thuật cần gì?",
        "options": [
          "Chỉ lời than",
          "Mật khẩu",
          "Ảnh chụp lỗi và những gì đã thử",
          "Không cần"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tiết kiệm thời gian."
      },
      {
        "number": 5,
        "question": "Vì sao ghi lại cách xử lý thành công?",
        "options": [
          "Tăng giấy tờ",
          "Để dùng lại và chia sẻ",
          "Để khoe",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Tái sử dụng tri thức."
      },
      {
        "number": 6,
        "question": "Bước đầu khi chọn công cụ?",
        "options": [
          "Tìm công cụ nổi",
          "Mua đắt nhất",
          "Hỏi bạn bè",
          "Xác định công việc và kết quả mong muốn"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Công cụ phục vụ công việc."
      },
      {
        "number": 7,
        "question": "Vì sao ưu tiên công cụ có sẵn của doanh nghiệp?",
        "options": [
          "Luôn tốt nhất",
          "Đã phê duyệt, có hỗ trợ, an toàn hơn",
          "Luôn miễn phí",
          "Không lý do"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giảm rủi ro."
      },
      {
        "number": 8,
        "question": "Dấu hiệu công cụ không còn phù hợp?",
        "options": [
          "Giao diện đẹp",
          "Thường chậm, lỗi, thiếu chức năng cần",
          "Nhiều người dùng",
          "Mới cập nhật"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Không đáp ứng nhu cầu."
      },
      {
        "number": 9,
        "question": "Trước khi đưa dữ liệu lên công cụ mới?",
        "options": [
          "Đưa dữ liệu thật",
          "Đăng ký không báo",
          "Hỏi bộ phận phụ trách, thử với dữ liệu không nhạy cảm",
          "Chia sẻ cả nhóm"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tránh lộ dữ liệu."
      },
      {
        "number": 10,
        "question": "Rủi ro khi tự ý cài công cụ ngoài?",
        "options": [
          "Máy nhẹ hơn",
          "Làm nhanh hơn",
          "Lộ dữ liệu, mã độc, không được hỗ trợ",
          "Không rủi ro"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Không kiểm soát."
      },
      {
        "number": 11,
        "question": "Ctrl+F dùng để làm gì?",
        "options": [
          "Lưu tệp",
          "In",
          "Đóng ứng dụng",
          "Tìm từ hoặc cụm từ"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Phím tắt tìm."
      },
      {
        "number": 12,
        "question": "Làm một lần rồi dùng lại áp dụng khi nào?",
        "options": [
          "Việc lặp lại có cấu trúc giống nhau",
          "Việc làm một lần",
          "Việc luôn khác",
          "Việc không ai làm"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Tạo mẫu."
      },
      {
        "number": 13,
        "question": "Đề xuất cải tiến dễ được chấp thuận khi nào?",
        "options": [
          "Nêu vấn đề rõ và có số liệu tiết kiệm",
          "Chung chung",
          "Ý kiến cá nhân",
          "Không giải thích"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Có căn cứ."
      },
      {
        "number": 14,
        "question": "Vì sao ghi lại cách làm hiệu quả?",
        "options": [
          "Tốn thời gian",
          "Dùng lại và chia sẻ",
          "Cho đủ",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Lan tỏa tri thức."
      },
      {
        "number": 15,
        "question": "Điểm mất thời gian được nhận diện qua?",
        "options": [
          "Đoán",
          "Nghe đồn",
          "Không cần",
          "Quan sát, ghi lại việc lặp, chờ, làm lại"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Số liệu quan sát."
      },
      {
        "number": 16,
        "question": "Xác định khoảng trống năng lực bằng cách?",
        "options": [
          "So yêu cầu công việc với khả năng hiện tại",
          "Hỏi người lạ",
          "So với mọi người",
          "Đoán"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Đối chiếu cụ thể."
      },
      {
        "number": 17,
        "question": "Cách học hiệu quả cho người đi làm?",
        "options": [
          "Đợt ngắn, gắn việc đang làm, thực hành ngay",
          "Một lần thật dài",
          "Chỉ đọc",
          "Không mục tiêu"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Phù hợp quỹ thời gian."
      },
      {
        "number": 18,
        "question": "Câu hỏi nhờ đồng nghiệp hiệu quả hơn?",
        "options": [
          "Anh chỉ em với",
          "Cái này làm sao",
          "Sao khó vậy",
          "Cụ thể, nêu việc đang làm và chỗ vướng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cụ thể."
      },
      {
        "number": 19,
        "question": "Vì sao theo dõi tiến bộ học tập?",
        "options": [
          "Báo cáo",
          "So sánh",
          "Không cần",
          "Thấy kết quả và điều chỉnh"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Duy trì động lực."
      },
      {
        "number": 20,
        "question": "Nguồn học phù hợp?",
        "options": [
          "Tài liệu nội bộ, hướng dẫn chính thức, khóa học uy tín",
          "Tin đồn",
          "Nguồn không rõ",
          "Video giải trí"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Nguồn đáng tin."
      }
    ]
  },
  "M5-I": {
    "code": "M5-I",
    "title": "GIẢI QUYẾT VẤN ĐỀ TRONG CÔNG VIỆC SỐ",
    "domain_number": 5,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Chẩn đoán và xử lý vấn đề kỹ thuật",
        "competency_line": "Năng lực 5.1 · Mức 3–4",
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
          "Phân biệt nguồn gốc vấn đề giúp xử lý đúng hướng: lỗi do thao tác, lỗi dữ liệu, lỗi phần mềm, lỗi kết nối, hoặc lỗi quyền truy cập. Phân biệt sự cố cục bộ (chỉ một người gặp) và sự cố hệ thống (nhiều người cùng gặp) là bước chẩn đoán quan trọng. Xây dựng tài liệu hướng dẫn xử lý sự cố thường gặp cho bộ phận giúp đồng nghiệp tự xử lý được các sự cố lặp lại.",
          "Các bước. 1. Tái hiện sự cố và ghi các điều kiện xảy ra. 2. Thu hẹp phạm vi: ai bị, thiết bị nào, từ khi nào, có gì thay đổi gần đây. 3. Kiểm tra từng giả thuyết một và ghi kết quả. 4. Ghi nhận các sự cố lặp lại để tìm nguyên nhân gốc. 5. Trao đổi với bộ phận kỹ thuật bằng thông tin có cấu trúc. 6. Viết tài liệu hướng dẫn xử lý sự cố thường gặp cho bộ phận."
        ],
        "examples": [
          "Ví dụ trong công việc. Tệp bảng tính chung mở rất chậm, nhưng chỉ một nhân viên than phiền. Chẩn đoán có hệ thống: tái hiện sự cố, thu hẹp phạm vi (máy khác có bị không, tệp khác có bị không), kiểm tra từng giả thuyết một. Nếu đồng nghiệp khác vẫn dùng bình thường, nguyên nhân nhiều khả năng nằm ở máy hoặc cấu hình của người đó chứ không phải tệp."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Thay nhiều thứ một lúc; không ghi lại các bước đã thử; xử lý triệu chứng mà bỏ qua nguyên nhân lặp lại."
        ],
        "practice": [
          "Chẩn đoán 3 tình huống sự cố phức tạp dưới đây, ghi lại quá trình loại trừ; xây tài liệu hướng dẫn xử lý cho 5 sự cố hay gặp nhất của bộ phận.",
          "3 tình huống mẫu để thực hành chẩn đoán: 1. Một nhân viên báo không mở được file chia sẻ chung, nhưng đồng nghiệp khác vẫn mở bình thường 2. Hệ thống quản lý công việc chạy rất chậm vào buổi sáng, nhưng bình thường vào buổi chiều 3. Một báo cáo tự động hàng tuần đột nhiên không còn gửi email như trước"
        ],
        "deliverable": "Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Ba bước của phương pháp chẩn đoán có hệ thống là gì?",
            "options": [
              "Tái hiện, thu hẹp phạm vi, loại trừ",
              "Đoán, thử, hy vọng",
              "Báo cáo, chờ đợi, kiểm tra",
              "Khởi động lại, chờ, thử lại"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là quy trình chẩn đoán có hệ thống giúp xác định nguyên nhân chính xác."
          },
          {
            "number": 2,
            "question": "Một sự cố chỉ xảy ra với một người trong khi đồng nghiệp khác vẫn dùng bình thường gợi ý điều gì?",
            "options": [
              "Đây chắc chắn là sự cố hệ thống",
              "Nguyên nhân thường liên quan đến máy hoặc tài khoản của riêng người đó",
              "Không thể suy luận được gì",
              "Cần báo động toàn công ty ngay"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Sự cố cục bộ (một người) thường có nguyên nhân riêng biệt khác với sự cố hệ thống."
          },
          {
            "number": 3,
            "question": "Vì sao nên ghi nhận và theo dõi các sự cố lặp lại?",
            "options": [
              "Không cần thiết",
              "Chỉ để có báo cáo đẹp",
              "Không có tác dụng thực tế",
              "Giúp tìm nguyên nhân gốc thay vì chỉ xử lý triệu chứng mỗi lần"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sự cố lặp lại nhiều lần là dấu hiệu cần tìm và giải quyết nguyên nhân gốc."
          },
          {
            "number": 4,
            "question": "Khi trao đổi với bộ phận kỹ thuật, điều gì giúp tiết kiệm thời gian?",
            "options": [
              "Chỉ nói “bị lỗi, sửa giúp em”",
              "Không cần cung cấp thông tin gì",
              "Chỉ cần gọi điện thoại nhiều lần",
              "Cung cấp thông tin đã chẩn đoán được và đã loại trừ những gì"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thông tin đầy đủ giúp bộ phận kỹ thuật không phải lặp lại các bước cơ bản đã thử."
          },
          {
            "number": 5,
            "question": "Tài liệu hướng dẫn xử lý sự cố cho bộ phận có tác dụng gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Giúp đồng nghiệp tự xử lý sự cố lặp lại mà không cần chờ hỗ trợ mỗi lần",
              "Chỉ để trang trí",
              "Làm phức tạp thêm quy trình"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tài liệu hướng dẫn giúp tăng khả năng tự xử lý của cả bộ phận, giảm phụ thuộc vào hỗ trợ bên ngoài."
          },
          {
            "number": 6,
            "question": "Ba bước chẩn đoán có hệ thống là gì?",
            "options": [
              "Đoán, thử, bỏ",
              "Tái hiện, thu hẹp phạm vi, kiểm tra từng giả thuyết",
              "Xóa, cài lại, quên",
              "Chờ, hỏi, chờ"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là trình tự hợp lý."
          },
          {
            "number": 7,
            "question": "Sự cố chỉ với một người, người khác vẫn dùng bình thường, gợi ý điều gì?",
            "options": [
              "Lỗi ở toàn hệ thống",
              "Lỗi ở nhà cung cấp mạng",
              "Nguyên nhân có thể nằm ở máy hoặc cấu hình của người đó",
              "Không thể xác định"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Phạm vi hẹp gợi ý nguyên nhân cục bộ."
          },
          {
            "number": 8,
            "question": "Vì sao theo dõi sự cố lặp lại?",
            "options": [
              "Tìm nguyên nhân gốc thay vì xử lý lại từng lần",
              "Để tăng báo cáo",
              "Để so sánh người dùng",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Sự cố lặp lại thường có nguyên nhân gốc."
          },
          {
            "number": 9,
            "question": "Điều gì giúp trao đổi với kỹ thuật tiết kiệm thời gian?",
            "options": [
              "Nói chung chung",
              "Chỉ nói “nhanh lên”",
              "Thông tin có cấu trúc: điều kiện, thời điểm, đã thử gì",
              "Không cung cấp gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thông tin rõ giúp xử lý nhanh."
          },
          {
            "number": 10,
            "question": "Tài liệu xử lý sự cố của bộ phận có tác dụng gì?",
            "options": [
              "Người khác tự xử lý được sự cố thường gặp",
              "Làm tốn thời gian",
              "Thay thế bộ phận kỹ thuật hoàn toàn",
              "Không có tác dụng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giảm phụ thuộc vào cá nhân."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Đánh giá và lựa chọn giải pháp công nghệ",
        "competency_line": "Năng lực 5.2 · Mức 3–4",
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
          "Bảng so sánh giải pháp theo tiêu chí có trọng số giúp so sánh khách quan. Chi phí toàn phần không chỉ là giá mua mà còn gồm chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen. Rủi ro phụ thuộc nhà cung cấp cần được cân nhắc — nên ưu tiên giải pháp cho phép xuất dữ liệu dễ dàng. Thử nghiệm quy mô nhỏ trước khi triển khai rộng giúp giảm rủi ro.",
          "Các bước. 1. Liệt kê nhu cầu và phân loại bắt buộc hoặc mong muốn. 2. Chọn tiêu chí đánh giá và gán trọng số theo mức quan trọng. 3. Tính chi phí toàn phần: mua hoặc thuê bao, triển khai, đào tạo, hỗ trợ, rời bỏ. 4. Đánh giá rủi ro phụ thuộc nhà cung cấp: khả năng xuất dữ liệu, tính mở, kế hoạch dự phòng. 5. Thử nghiệm quy mô nhỏ với một nhóm trước khi triển khai rộng. 6. Lập bảng so sánh có trọng số và ghi lý do chọn."
        ],
        "examples": [
          "Ví dụ trong công việc. Bộ phận cần một phần mềm quản lý công việc. Một công cụ rẻ nhưng không xuất được dữ liệu; một công cụ đắt hơn nhưng đủ chức năng và xuất dữ liệu dễ dàng. Nếu chỉ so sánh giá mua ban đầu sẽ chọn sai, vì chi phí toàn phần gồm cả đào tạo, hỗ trợ, thời gian chuyển dữ liệu và chi phí rời bỏ về sau."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chọn theo giá rẻ nhất; không thử nghiệm; quên chi phí đào tạo; không tính đến khả năng chuyển đi."
        ],
        "practice": [
          "Chọn một nhu cầu công nghệ thật của bộ phận, so sánh tối thiểu 3 giải pháp theo bảng tiêu chí có trọng số, viết đề xuất 1 trang.",
          "Bảng so sánh mẫu:",
          "Tiêu chí",
          "Trọng số",
          "Giải pháp A",
          "Giải pháp B",
          "Giải pháp C",
          "Chi phí",
          "30%",
          "Dễ sử dụng",
          "25%",
          "Tích hợp hệ thống hiện có",
          "25%",
          "Hỗ trợ kỹ thuật",
          "20%",
          "Tổng điểm có trọng số"
        ],
        "deliverable": "Bảng so sánh giải pháp và đề xuất công nghệ 1 trang.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Chi phí toàn phần của một giải pháp công nghệ bao gồm những gì?",
            "options": [
              "Chỉ giá mua hoặc phí đăng ký",
              "Giá mua, chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen",
              "Chỉ chi phí bảo trì",
              "Không thể tính được chi phí toàn phần"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chi phí toàn phần phản ánh đầy đủ hơn giá niêm yết ban đầu."
          },
          {
            "number": 2,
            "question": "Vì sao nên phân biệt nhu cầu bắt buộc và nhu cầu mong muốn khi chọn giải pháp công nghệ?",
            "options": [
              "Tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết",
              "Không cần phân biệt",
              "Chỉ để làm phức tạp thêm quyết định",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Phân biệt rõ giúp tập trung vào giải pháp thực sự giải quyết vấn đề."
          },
          {
            "number": 3,
            "question": "Rủi ro phụ thuộc nhà cung cấp là gì?",
            "options": [
              "Không có rủi ro gì đặc biệt",
              "Chỉ liên quan đến giá cả",
              "Khó chuyển sang giải pháp khác nếu dữ liệu bị “khóa” trong hệ thống hiện tại",
              "Không liên quan đến việc chọn công nghệ"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là rủi ro cần cân nhắc, đặc biệt về khả năng xuất dữ liệu khi cần chuyển đổi."
          },
          {
            "number": 4,
            "question": "Vì sao nên thử nghiệm quy mô nhỏ trước khi triển khai rộng?",
            "options": [
              "Không cần thiết, triển khai toàn bộ ngay là tốt nhất",
              "Chỉ làm chậm quá trình triển khai",
              "Giúp phát hiện vấn đề trước khi đầu tư toàn bộ, giảm rủi ro",
              "Không có lợi ích thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thử nghiệm nhỏ giúp giảm thiểu rủi ro nếu giải pháp không phù hợp như kỳ vọng."
          },
          {
            "number": 5,
            "question": "Bảng so sánh giải pháp theo tiêu chí có trọng số giúp ích gì?",
            "options": [
              "Cung cấp cơ sở so sánh khách quan hơn là chỉ dựa vào cảm tính",
              "Không có tác dụng thực tế",
              "Chỉ để trình bày đẹp mắt",
              "Làm chậm quá trình ra quyết định không cần thiết"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là công cụ giúp ra quyết định có căn cứ, khách quan hơn."
          },
          {
            "number": 6,
            "question": "Chi phí toàn phần của giải pháp công nghệ gồm gì?",
            "options": [
              "Chỉ giá mua",
              "Chỉ giá thuê",
              "Chỉ phí đào tạo",
              "Mua hoặc thuê bao, triển khai, đào tạo, hỗ trợ và chi phí rời bỏ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cần nhìn toàn bộ vòng đời."
          },
          {
            "number": 7,
            "question": "Vì sao phân biệt nhu cầu bắt buộc và mong muốn?",
            "options": [
              "Để loại hết giải pháp",
              "Để chọn đắt nhất",
              "Không cần",
              "Để không loại nhầm giải pháp đáp ứng được nhu cầu cốt lõi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Nhu cầu cốt lõi phải được đáp ứng."
          },
          {
            "number": 8,
            "question": "Rủi ro phụ thuộc nhà cung cấp là gì?",
            "options": [
              "Nhà cung cấp có nhiều khách",
              "Khó đổi sang giải pháp khác hoặc lấy dữ liệu ra khi cần",
              "Giá luôn giảm",
              "Công cụ chạy nhanh hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cần đánh giá khả năng chuyển đi."
          },
          {
            "number": 9,
            "question": "Vì sao thử nghiệm quy mô nhỏ trước?",
            "options": [
              "Phát hiện vấn đề với chi phí thấp",
              "Để chậm tiến độ",
              "Để tránh triển khai",
              "Không có lý do"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giảm rủi ro."
          },
          {
            "number": 10,
            "question": "Bảng so sánh có trọng số giúp gì?",
            "options": [
              "Làm mọi tiêu chí bằng nhau",
              "Phản ánh mức quan trọng khác nhau của các tiêu chí",
              "Chỉ để trang trí",
              "Giấu lý do"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Quyết định có căn cứ."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Cải tiến quy trình bằng công cụ số",
        "competency_line": "Năng lực 5.3 · Mức 3–4",
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
          "Nhận diện lãng phí theo các dạng phổ biến: chờ đợi, nhập liệu trùng lặp, phê duyệt thừa, thao tác thủ công lặp lại. Điểm bàn giao giữa người và giữa bộ phận thường là nơi dễ xảy ra chậm trễ nhất. Đo lường hiệu quả trước và sau cải tiến cần dựa trên số liệu cụ thể: thời gian hoàn thành, số lỗi phát sinh.",
          "Các bước. 1. Vẽ quy trình hiện tại, đánh dấu các điểm bàn giao và thời gian chờ. 2. Nhận diện lãng phí: nhập liệu trùng, chờ, sửa lỗi, tìm thông tin. 3. Thiết kế quy trình mới dùng công cụ số, giữ đơn giản. 4. Thử nghiệm ở quy mô nhỏ và so sánh trước, sau bằng số liệu (thời gian, số lỗi). 5. Trao đổi với đồng nghiệp: giải thích lợi ích cho từng người, hỗ trợ lúc đầu."
        ],
        "examples": [
          "Ví dụ trong công việc. Quy trình duyệt đơn đặt hàng: nhân viên kinh doanh nhập đơn, gửi email cho kế toán, kế toán nhập lại vào hệ thống. Điểm bàn giao này vừa chậm vừa dễ sai, và nhập liệu trùng lặp là một loại lãng phí. Dùng biểu mẫu chung nối thẳng vào bảng theo dõi có thể loại bỏ bước nhập lại."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Số hóa quy trình xấu thay vì cải tiến; không đo trước khi thay đổi; không giải thích lợi ích cho người dùng."
        ],
        "practice": [
          "Chọn một quy trình đang có vấn đề trong bộ phận, vẽ sơ đồ hiện trạng, xác định điểm nghẽn, thiết kế phương án cải tiến và đo thử."
        ],
        "deliverable": "Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Điểm bàn giao giữa người hoặc bộ phận trong quy trình thường có đặc điểm gì?",
            "options": [
              "Luôn diễn ra suôn sẻ",
              "Không quan trọng bằng các bước khác",
              "Dễ xảy ra chậm trễ hoặc mất thông tin nhất",
              "Không cần phân tích riêng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Điểm chuyển giao là nơi thường xảy ra vấn đề nhất trong một quy trình."
          },
          {
            "number": 2,
            "question": "“Nhập liệu trùng lặp” là loại lãng phí nào trong quy trình?",
            "options": [
              "Chờ đợi",
              "Cùng một thông tin phải nhập lại nhiều lần ở các bước khác nhau",
              "Phê duyệt thừa",
              "Không phải là lãng phí"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là dạng lãng phí phổ biến khi quy trình không được thiết kế liên kết dữ liệu hợp lý."
          },
          {
            "number": 3,
            "question": "Vì sao nên thử nghiệm thay đổi quy trình ở quy mô nhỏ trước?",
            "options": [
              "Không cần thiết",
              "Chỉ để làm chậm quá trình thay đổi",
              "Phát hiện vấn đề chưa lường trước trước khi áp dụng toàn bộ",
              "Không có lợi ích thực tế"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thử nghiệm nhỏ giúp giảm rủi ro khi triển khai thay đổi ở quy mô lớn."
          },
          {
            "number": 4,
            "question": "Đo lường hiệu quả cải tiến nên dựa trên điều gì?",
            "options": [
              "Cảm nhận chủ quan là đủ",
              "Số liệu cụ thể: thời gian hoàn thành, số lỗi, số bước thực hiện",
              "Không cần đo lường",
              "Chỉ cần ý kiến của một người"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Số liệu định lượng chứng minh giá trị cải tiến thuyết phục hơn cảm nhận chủ quan."
          },
          {
            "number": 5,
            "question": "Cách hiệu quả để thuyết phục đồng nghiệp chấp nhận thay đổi quy trình là gì?",
            "options": [
              "Áp đặt từ trên xuống không cần giải thích",
              "Không cần thuyết phục, chỉ cần ra lệnh",
              "Thay đổi âm thầm không thông báo",
              "Giải thích lợi ích cụ thể cho họ và cho họ tham gia thiết kế"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sự tham gia và hiểu rõ lợi ích giúp tăng khả năng chấp nhận thay đổi."
          },
          {
            "number": 6,
            "question": "Điểm bàn giao trong quy trình thường có đặc điểm gì?",
            "options": [
              "Dễ chậm trễ, dễ sai sót và mất thông tin",
              "Luôn nhanh",
              "Không bao giờ sai",
              "Không ảnh hưởng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Thường là nơi phát sinh lãng phí."
          },
          {
            "number": 7,
            "question": "Nhập liệu trùng lặp là loại lãng phí nào?",
            "options": [
              "Chờ đợi",
              "Di chuyển",
              "Tồn kho",
              "Làm lại cùng một việc ở nhiều bước"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cùng dữ liệu nhập nhiều lần."
          },
          {
            "number": 8,
            "question": "Vì sao thử nghiệm quy trình mới ở quy mô nhỏ?",
            "options": [
              "Để chậm lại",
              "Để điều chỉnh trước khi áp dụng rộng",
              "Để giấu lỗi",
              "Không cần"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giảm rủi ro."
          },
          {
            "number": 9,
            "question": "Đo hiệu quả cải tiến nên dựa trên gì?",
            "options": [
              "So sánh số liệu trước và sau như thời gian và số lỗi",
              "Cảm nhận",
              "Số người thích",
              "Giá phần mềm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần số liệu."
          },
          {
            "number": 10,
            "question": "Cách thuyết phục đồng nghiệp chấp nhận thay đổi?",
            "options": [
              "Giải thích lợi ích cụ thể và hỗ trợ lúc đầu",
              "Ép buộc",
              "Giữ bí mật",
              "Chỉ thông báo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Người dùng cần thấy lợi ích."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Phát triển năng lực số cho bản thân và nhóm",
        "competency_line": "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
        "objectives": [
          "Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật",
          "Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ",
          "Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số"
        ],
        "definitions": [
          "Bản đồ năng lực nhóm: tổng hợp mức năng lực số hiện tại của tất cả thành viên trong nhóm theo từng lĩnh vực",
          "Học qua việc: phương thức phát triển năng lực thông qua thực hành trực tiếp trong công việc, thay vì đào tạo tách rời"
        ],
        "body": [
          "Ở mức trung cấp, việc thảo luận về lĩnh vực năng lực số cần cải thiện và hỗ trợ người khác phát triển mở rộng sang phát triển năng lực cho cả nhóm. Đánh giá năng lực nhóm theo khung chuẩn cho phép nhìn thấy bức tranh chung: nhóm mạnh ở đâu, yếu ở đâu.",
          "Các phương thức phát triển năng lực khác nhau phù hợp với tình huống khác nhau: đào tạo chính thức, kèm cặp một-một, học qua việc, chia sẻ nội bộ. Kỹ năng hướng dẫn người khác hiệu quả gồm ba bước: chia nhỏ, làm mẫu, để người học tự làm có quan sát.",
          "Các bước. 1. Lập bản đồ năng lực của nhóm: kỹ năng cần, ai đã có, ai còn thiếu. 2. Chọn phương thức: kèm cặp cho kỹ năng sâu, học qua việc khi có thể thực hành ngay, tài liệu cho kiến thức nền. 3. Hướng dẫn người khác theo ba bước: làm mẫu, cho làm cùng, để tự làm có phản hồi. 4. Thiết lập cơ chế duy trì: người phụ trách, buổi chia sẻ, tài liệu cập nhật. 5. Theo dõi kết quả bằng chỉ số công việc, không chỉ sự hài lòng sau lớp."
        ],
        "examples": [
          "Ví dụ trong công việc. Bộ phận sắp chuyển sang quy trình mới. Một số người nắm nhanh, số khác cần hướng dẫn riêng. Người phụ trách lập bản đồ khoảng trống năng lực của nhóm, chọn phương thức phù hợp từng nhóm người (hướng dẫn kèm cặp, học qua việc, tài liệu), rồi đặt cơ chế duy trì kỹ năng sau đào tạo như buổi chia sẻ định kỳ."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Đào tạo một lần rồi bỏ; áp dụng một phương thức cho mọi người; không có người duy trì sau đào tạo."
        ],
        "practice": [
          "Đánh giá năng lực số của nhóm mình theo 6 miền, lập bản đồ khoảng trống và kế hoạch phát triển 6 tháng; thiết kế và thực hiện một buổi chia sẻ nội bộ 30 phút về một kỹ năng cụ thể."
        ],
        "deliverable": "Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Phương thức phát triển năng lực nào phù hợp khi cần hướng dẫn sâu một kỹ năng cụ thể cho một người?",
            "options": [
              "Đào tạo chính thức cho nhóm lớn",
              "Kèm cặp một-một",
              "Không cần phương thức đặc biệt",
              "Chỉ cần gửi tài liệu đọc"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Kèm cặp một-một phù hợp cho việc hướng dẫn sâu, cá nhân hóa theo nhu cầu cụ thể."
          },
          {
            "number": 2,
            "question": "Ba bước của kỹ năng hướng dẫn người khác hiệu quả là gì?",
            "options": [
              "Nói, viết, kiểm tra",
              "Chia nhỏ, làm mẫu, để người học tự làm có quan sát",
              "Ra lệnh, chờ đợi, đánh giá",
              "Không có quy trình cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là quy trình hướng dẫn hiệu quả giúp người học tiếp thu và thực hành đúng cách."
          },
          {
            "number": 3,
            "question": "Vì sao cần cơ chế duy trì kỹ năng sau đào tạo?",
            "options": [
              "Không cần thiết",
              "Chỉ để có thêm hoạt động",
              "Không có tác dụng thực tế",
              "Kỹ năng không được sử dụng thường xuyên dễ bị quên đi nhanh chóng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Thực hành lặp lại giúp củng cố và duy trì kỹ năng đã học được."
          },
          {
            "number": 4,
            "question": "Bản đồ khoảng trống năng lực nhóm giúp ích gì?",
            "options": [
              "Xác định ai thiếu kỹ năng gì và mức độ ưu tiên xử lý",
              "Không có tác dụng thực tế",
              "Chỉ để đánh giá cá nhân",
              "Không liên quan đến kế hoạch phát triển"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là cơ sở để lập kế hoạch phát triển năng lực có trọng tâm, ưu tiên đúng."
          },
          {
            "number": 5,
            "question": "“Học qua việc” phù hợp nhất khi nào?",
            "options": [
              "Khi cần kiến thức nền tảng cho nhiều người",
              "Khi kỹ năng cần được thực hành trực tiếp trong bối cảnh công việc thật",
              "Không bao giờ phù hợp",
              "Chỉ phù hợp với nhân viên mới"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Học qua việc hiệu quả khi kỹ năng gắn liền với bối cảnh thực tế của công việc."
          },
          {
            "number": 6,
            "question": "Cần hướng dẫn sâu một kỹ năng cụ thể cho một người, phương thức nào phù hợp?",
            "options": [
              "Kèm cặp trực tiếp",
              "Gửi tài liệu rồi để mặc",
              "Họp toàn công ty",
              "Chờ họ tự học"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Kèm cặp phù hợp kỹ năng sâu."
          },
          {
            "number": 7,
            "question": "Ba bước hướng dẫn hiệu quả là gì?",
            "options": [
              "Nói, bỏ đi, chờ",
              "Giao việc, im lặng, phạt",
              "Đọc, chép, nộp",
              "Làm mẫu, cùng làm, để tự làm có phản hồi"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Trình tự chuyển giao kỹ năng."
          },
          {
            "number": 8,
            "question": "Vì sao cần cơ chế duy trì kỹ năng sau đào tạo?",
            "options": [
              "Kỹ năng dễ mai một nếu không dùng và củng cố",
              "Để tăng số buổi họp",
              "Để kiểm tra nhân viên",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Duy trì kết quả đào tạo."
          },
          {
            "number": 9,
            "question": "Bản đồ khoảng trống năng lực nhóm giúp gì?",
            "options": [
              "Xếp hạng nhân viên",
              "Giảm nhân sự",
              "Xác định kỹ năng cần ưu tiên và nhóm cần hỗ trợ",
              "Không có ích"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đào tạo đúng chỗ."
          },
          {
            "number": 10,
            "question": "Học qua việc phù hợp nhất khi nào?",
            "options": [
              "Khi không có việc",
              "Khi chưa có mục tiêu",
              "Khi có thể thực hành ngay trên công việc thật",
              "Khi chỉ cần đọc"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Học gắn thực hành."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M5-I — “Cải tiến một vấn đề thật của bộ phận” (Assignment)",
      "context": "Bạn chọn một vấn đề thật hoặc tình huống mẫu của bộ phận (ví dụ quy trình duyệt đơn chậm, báo cáo tuần tốn thời gian) và dẫn dắt cải tiến từ chẩn đoán đến vận hành.",
      "requirements": "1. Chẩn đoán: mô tả vấn đề, thu thập dữ liệu, thu hẹp phạm vi, nêu nguyên nhân gốc kèm bằng chứng. 2. Giải pháp: nêu nhu cầu bắt buộc và mong muốn, so sánh ít nhất 3 phương án theo bảng tiêu chí có trọng số, tính chi phí toàn phần, nêu rủi ro phụ thuộc nhà cung cấp, chọn phương án và nêu kế hoạch thử nghiệm. 3. Quy trình cải tiến: vẽ quy trình trước và sau, chỉ ra lãng phí loại bỏ được, đặt chỉ số đo (thời gian, số lỗi) và ước tính hiệu quả. 4. Năng lực nhóm: lập bản đồ khoảng trống, chọn phương thức đào tạo, kế hoạch duy trì kỹ năng. 5. Kế hoạch truyền thông thay đổi cho đồng nghiệp.",
      "deliverables": "Bản chẩn đoán; bảng so sánh; sơ đồ quy trình trước và sau; kế hoạch năng lực nhóm; kế hoạch truyền thông.\nHình thức nộp. Một tài liệu tổng hợp kèm sơ đồ.",
      "rubric": [
        "Gợi ý. Nếu dùng tình huống mẫu hãy ghi rõ là giả định và đặt số liệu hợp lý; không đưa dữ liệu nhạy cảm của đơn vị thật.",
        "Tiêu chí",
        "Điểm",
        "Chẩn đoán vấn đề có phương pháp, rõ ràng",
        "25",
        "Đánh giá và lựa chọn giải pháp công nghệ có căn cứ",
        "25",
        "Thiết kế quy trình cải tiến, đo lường hiệu quả",
        "25",
        "Kế hoạch phát triển năng lực nhóm khả thi",
        "25"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Ba bước chẩn đoán có hệ thống?",
        "options": [
          "Đoán, thử, bỏ",
          "Xóa, cài lại, quên",
          "Tái hiện, thu hẹp phạm vi, kiểm tra từng giả thuyết",
          "Chờ, hỏi, chờ"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Trình tự hợp lý."
      },
      {
        "number": 2,
        "question": "Sự cố chỉ ở một người gợi ý gì?",
        "options": [
          "Nguyên nhân cục bộ ở máy hoặc cấu hình của họ",
          "Lỗi toàn hệ thống",
          "Lỗi nhà mạng",
          "Không xác định được"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Phạm vi hẹp."
      },
      {
        "number": 3,
        "question": "Vì sao theo dõi sự cố lặp lại?",
        "options": [
          "Tìm nguyên nhân gốc",
          "Tăng báo cáo",
          "So sánh người",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Nguyên nhân gốc."
      },
      {
        "number": 4,
        "question": "Trao đổi với kỹ thuật nên?",
        "options": [
          "Nói chung chung",
          "Nói nhanh lên",
          "Cung cấp thông tin có cấu trúc",
          "Không cung cấp"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Tiết kiệm thời gian."
      },
      {
        "number": 5,
        "question": "Tài liệu xử lý sự cố của bộ phận giúp gì?",
        "options": [
          "Tốn thời gian",
          "Thay thế hoàn toàn kỹ thuật",
          "Người khác tự xử lý sự cố thường gặp",
          "Không tác dụng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giảm phụ thuộc."
      },
      {
        "number": 6,
        "question": "Chi phí toàn phần gồm gì?",
        "options": [
          "Chỉ giá mua",
          "Chỉ giá thuê",
          "Chỉ đào tạo",
          "Mua hoặc thuê, triển khai, đào tạo, hỗ trợ, rời bỏ"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nhìn vòng đời."
      },
      {
        "number": 7,
        "question": "Vì sao phân biệt nhu cầu bắt buộc và mong muốn?",
        "options": [
          "Loại hết",
          "Chọn đắt nhất",
          "Không cần",
          "Không loại nhầm giải pháp đáp ứng nhu cầu cốt lõi"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nhu cầu cốt lõi."
      },
      {
        "number": 8,
        "question": "Rủi ro phụ thuộc nhà cung cấp?",
        "options": [
          "Nhà cung cấp đông khách",
          "Khó đổi giải pháp hoặc lấy dữ liệu ra",
          "Giá giảm",
          "Chạy nhanh hơn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Khả năng chuyển đi."
      },
      {
        "number": 9,
        "question": "Vì sao thử nghiệm quy mô nhỏ?",
        "options": [
          "Chậm tiến độ",
          "Phát hiện vấn đề, chi phí thấp",
          "Tránh triển khai",
          "Không lý do"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giảm rủi ro."
      },
      {
        "number": 10,
        "question": "Bảng so sánh có trọng số giúp gì?",
        "options": [
          "Phản ánh mức quan trọng của từng tiêu chí",
          "Mọi tiêu chí bằng nhau",
          "Trang trí",
          "Giấu lý do"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Quyết định có căn cứ."
      },
      {
        "number": 11,
        "question": "Điểm bàn giao thường có đặc điểm gì?",
        "options": [
          "Luôn nhanh",
          "Dễ chậm, dễ sai, dễ mất thông tin",
          "Không sai",
          "Không ảnh hưởng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Nơi phát sinh lãng phí."
      },
      {
        "number": 12,
        "question": "Nhập liệu trùng lặp là lãng phí nào?",
        "options": [
          "Làm lại cùng một việc ở nhiều bước",
          "Chờ đợi",
          "Di chuyển",
          "Tồn kho"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Nhập nhiều lần."
      },
      {
        "number": 13,
        "question": "Vì sao thử quy trình mới ở quy mô nhỏ?",
        "options": [
          "Chậm lại",
          "Giấu lỗi",
          "Không cần",
          "Điều chỉnh trước khi áp dụng rộng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Giảm rủi ro."
      },
      {
        "number": 14,
        "question": "Đo hiệu quả cải tiến dựa trên?",
        "options": [
          "Cảm nhận",
          "Số liệu trước và sau",
          "Số người thích",
          "Giá phần mềm"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cần số liệu."
      },
      {
        "number": 15,
        "question": "Thuyết phục đồng nghiệp chấp nhận thay đổi bằng cách?",
        "options": [
          "Giải thích lợi ích và hỗ trợ lúc đầu",
          "Ép buộc",
          "Giữ bí mật",
          "Chỉ thông báo"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Thấy lợi ích."
      },
      {
        "number": 16,
        "question": "Kỹ năng sâu cho một người, phương thức nào?",
        "options": [
          "Gửi tài liệu rồi mặc",
          "Kèm cặp trực tiếp",
          "Họp toàn công ty",
          "Chờ tự học"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Phù hợp kỹ năng sâu."
      },
      {
        "number": 17,
        "question": "Ba bước hướng dẫn hiệu quả?",
        "options": [
          "Nói, bỏ đi, chờ",
          "Giao, im lặng, phạt",
          "Làm mẫu, cùng làm, tự làm có phản hồi",
          "Đọc, chép, nộp"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Chuyển giao kỹ năng."
      },
      {
        "number": 18,
        "question": "Vì sao cần cơ chế duy trì sau đào tạo?",
        "options": [
          "Tăng họp",
          "Kiểm tra nhân viên",
          "Không cần",
          "Kỹ năng dễ mai một nếu không củng cố"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Duy trì kết quả."
      },
      {
        "number": 19,
        "question": "Bản đồ khoảng trống năng lực nhóm giúp gì?",
        "options": [
          "Xếp hạng nhân viên",
          "Giảm nhân sự",
          "Xác định kỹ năng ưu tiên và nhóm cần hỗ trợ",
          "Không ích"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Đào tạo đúng chỗ."
      },
      {
        "number": 20,
        "question": "Học qua việc phù hợp khi nào?",
        "options": [
          "Khi không có việc",
          "Khi chưa có mục tiêu",
          "Khi chỉ cần đọc",
          "Khi thực hành ngay trên việc thật"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Gắn thực hành."
      }
    ]
  },
  "M5-A": {
    "code": "M5-A",
    "title": "ĐỔI MỚI VÀ DẪN DẮT CHUYỂN ĐỔI SỐ",
    "domain_number": 5,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Xây dựng năng lực xử lý vấn đề của tổ chức",
        "competency_line": "Năng lực 5.1 · Mức 5–6",
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
          "Rủi ro phụ thuộc cá nhân xảy ra khi chỉ một người trong tổ chức nắm rõ cách vận hành một hệ thống quan trọng — khi người đó nghỉ phép hoặc rời đi, tổ chức gặp khó khăn nghiêm trọng; giảm rủi ro này đòi hỏi văn bản hóa quy trình và đào tạo dự phòng cho ít nhất một người khác. Khi làm việc với nhà cung cấp dịch vụ hỗ trợ bên ngoài, hợp đồng dịch vụ (SLA) nên quy định rõ thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố, làm cơ sở đánh giá chất lượng dịch vụ nhận được.",
          "Các bước. 1. Phân tích nguyên nhân gốc (ví dụ hỏi “tại sao” nhiều lần) thay vì xử lý triệu chứng. 2. Nhận diện rủi ro phụ thuộc cá nhân: việc chỉ một người biết làm. 3. Xây kho tri thức nội bộ: sự cố, cách xử lý, quy trình, người phụ trách. 4. Với hỗ trợ ngoài, thiết lập thỏa thuận mức dịch vụ (SLA): thời gian phản hồi, thời gian khắc phục, phạm vi, cách báo cáo, xử lý vi phạm. 5. Đo chỉ số vận hành như số sự cố lặp lại, thời gian xử lý trung bình."
        ],
        "examples": [
          "Ví dụ trong công việc. Lỗi nhập sai định dạng ngày xuất hiện lặp lại dù đã nhắc nhở nhiều lần. Xử lý triệu chứng là sửa từng bản ghi; phân tích nguyên nhân gốc cho thấy biểu mẫu không ràng buộc định dạng. Sửa biểu mẫu loại bỏ lỗi tận gốc. Ở cấp tổ chức, cần thêm kho tri thức nội bộ để sự cố đã xử lý không phải làm lại, và thỏa thuận mức dịch vụ rõ ràng với bên hỗ trợ ngoài."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chữa triệu chứng; kho tri thức không ai cập nhật; SLA mơ hồ; phụ thuộc một người."
        ],
        "practice": [
          "Phân tích dữ liệu sự cố của doanh nghiệp trong một giai đoạn (có thể dùng dữ liệu mẫu dưới đây làm điểm khởi đầu, bổ sung dữ liệu thật nếu có), tìm 3 nguyên nhân gốc lặp lại, đề xuất mô hình hỗ trợ và kho tri thức.",
          "Dữ liệu mẫu — Nhật ký sự cố 3 tháng (rút gọn):",
          "Tháng",
          "Loại sự cố",
          "Số lần",
          "Ghi chú",
          "Tháng 1",
          "Không đăng nhập được hệ thống CRM",
          "12",
          "Chủ yếu vào sáng thứ Hai",
          "Tháng 1",
          "Lỗi nhập sai định dạng ngày trong báo cáo",
          "8",
          "Nhiều nhân viên khác nhau mắc cùng lỗi",
          "Tháng 2",
          "Không đăng nhập được hệ thống CRM",
          "15",
          "Vẫn tập trung sáng thứ Hai",
          "Tháng 2",
          "Lỗi nhập sai định dạng ngày",
          "10",
          "Tiếp tục xảy ra",
          "Tháng 3",
          "Không đăng nhập được hệ thống CRM",
          "18",
          "Tăng dần theo tháng",
          "Tháng 3",
          "Lỗi nhập sai định dạng ngày",
          "9",
          "Không giảm dù đã nhắc nhở nhiều lần",
          "(Gợi ý phân tích: sự cố đăng nhập tập trung sáng thứ Hai có thể liên quan đến việc hệ thống bảo trì cuối tuần hoặc quá tải đăng nhập đồng loạt; lỗi định dạng ngày lặp lại dù đã nhắc nhở gợi ý nguyên nhân gốc nằm ở thiết kế biểu mẫu chứ không phải ý thức nhân viên.)"
        ],
        "deliverable": "Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Phân tích nguyên nhân gốc khác gì so với xử lý triệu chứng?",
            "options": [
              "Tìm nguyên nhân sâu xa thực sự, thay vì chỉ xử lý biểu hiện bề mặt",
              "Không có khác biệt",
              "Nguyên nhân gốc luôn khó tìm hơn",
              "Chỉ áp dụng cho vấn đề kỹ thuật"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giải quyết nguyên nhân gốc mang lại hiệu quả bền vững hơn xử lý triệu chứng lặp lại."
          },
          {
            "number": 2,
            "question": "Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc nhở nhiều lần gợi ý điều gì?",
            "options": [
              "Nhân viên không đủ năng lực",
              "Cần sa thải nhân viên vi phạm",
              "Không có nguyên nhân cụ thể",
              "Nguyên nhân gốc có thể nằm ở thiết kế biểu mẫu, không phải ý thức cá nhân"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Lỗi lặp lại ở nhiều người khác nhau thường gợi ý vấn đề hệ thống hơn là vấn đề cá nhân."
          },
          {
            "number": 3,
            "question": "Rủi ro phụ thuộc cá nhân trong vận hành là gì?",
            "options": [
              "Không có rủi ro gì",
              "Khi chỉ một người nắm rõ cách vận hành, tổ chức gặp khó khăn nếu người đó vắng mặt",
              "Chỉ liên quan đến lương thưởng",
              "Không thể giảm thiểu được"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là rủi ro thực tế cần được giảm thiểu bằng văn bản hóa và đào tạo dự phòng."
          },
          {
            "number": 4,
            "question": "Kho tri thức nội bộ mang lại lợi ích gì khi có nhân sự rời đi?",
            "options": [
              "Kiến thức không bị mất theo cá nhân, tổ chức không phải giải quyết lại từ đầu",
              "Không có lợi ích gì",
              "Chỉ giúp nhân sự mới làm quen nhanh hơn",
              "Không liên quan đến nhân sự rời đi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là lợi ích cốt lõi của việc xây dựng kho tri thức có hệ thống."
          },
          {
            "number": 5,
            "question": "Hợp đồng dịch vụ (SLA) với nhà cung cấp hỗ trợ bên ngoài nên quy định gì?",
            "options": [
              "Không cần quy định gì cụ thể",
              "Chỉ cần quy định giá dịch vụ",
              "Chỉ áp dụng cho hợp đồng lớn",
              "Thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là cơ sở để đánh giá chất lượng dịch vụ hỗ trợ nhận được từ nhà cung cấp."
          },
          {
            "number": 6,
            "question": "Phân tích nguyên nhân gốc khác xử lý triệu chứng ở điểm nào?",
            "options": [
              "Sửa từng lỗi khi xuất hiện",
              "Bỏ qua lỗi",
              "Tìm và loại bỏ nguyên nhân sinh ra lỗi chứ không chỉ sửa từng biểu hiện",
              "Đổ lỗi cho người dùng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Loại bỏ gốc giúp lỗi không lặp lại."
          },
          {
            "number": 7,
            "question": "Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc, gợi ý điều gì?",
            "options": [
              "Thiết kế biểu mẫu hoặc quy trình chưa ngăn được lỗi",
              "Nhân viên cố ý",
              "Máy tính hỏng",
              "Không có nguyên nhân"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần sửa hệ thống thay vì nhắc nhở."
          },
          {
            "number": 8,
            "question": "Rủi ro phụ thuộc cá nhân là gì?",
            "options": [
              "Nhân viên làm việc quá nhanh",
              "Hoạt động bị gián đoạn khi người nắm việc vắng mặt hoặc rời đi",
              "Có quá nhiều người biết việc",
              "Không có rủi ro"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cần tri thức được chia sẻ."
          },
          {
            "number": 9,
            "question": "Kho tri thức nội bộ có lợi gì khi nhân sự rời đi?",
            "options": [
              "Không có lợi ích",
              "Giữ lại cách xử lý và quy trình để người khác tiếp quản",
              "Tăng chi phí",
              "Làm lộ thông tin"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giữ tri thức tổ chức."
          },
          {
            "number": 10,
            "question": "SLA với nhà cung cấp hỗ trợ nên quy định gì?",
            "options": [
              "Chỉ giá",
              "Chỉ tên nhân sự",
              "Thời gian phản hồi, thời gian khắc phục, phạm vi và cách xử lý khi vi phạm",
              "Không cần quy định"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Cam kết rõ ràng."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Chiến lược công nghệ và triển khai thay đổi",
        "competency_line": "Năng lực 5.2 · Mức 5–6",
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
          "Mức độ sẵn sàng của tổ chức không chỉ là vấn đề kỹ thuật mà còn là vấn đề con người — nhân viên có sẵn sàng thay đổi thói quen làm việc không. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo.",
          "Các bước. 1. Bắt đầu từ mục tiêu kinh doanh và hiện trạng, không từ công cụ. 2. Đánh giá mức độ sẵn sàng: kỹ thuật, con người, quy trình, văn hóa, nguồn lực. 3. Xếp hạng sáng kiến bằng ma trận tác động và khả thi; ưu tiên thắng lợi nhanh trước. 4. Lập lộ trình theo giai đoạn, có người chịu trách nhiệm, ngân sách, mốc kiểm tra. 5. Quản lý thay đổi: truyền thông, đào tạo, hỗ trợ. 6. Đánh giá sau triển khai bằng chỉ số kinh doanh và vận hành đã đặt từ đầu."
        ],
        "examples": [
          "Ví dụ trong công việc. Một doanh nghiệp nhỏ mua phần mềm quản lý toàn diện nhưng sau sáu tháng nhân viên vẫn dùng bảng tính cũ. Nguyên nhân không nằm ở công cụ mà ở mức độ sẵn sàng của tổ chức: chưa có người dẫn dắt, chưa đào tạo, quy trình chưa đổi. Chiến lược công nghệ cần bắt đầu từ mục tiêu kinh doanh và năng lực thực tế, rồi mới đến lựa chọn công nghệ."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Mua công nghệ trước, tìm việc dùng sau; bỏ qua con người; triển khai ồ ạt; không đo kết quả."
        ],
        "practice": [
          "Xây lộ trình công nghệ 12 tháng cho doanh nghiệp: đánh giá hiện trạng, xác định ưu tiên, kế hoạch triển khai cho hạng mục ưu tiên nhất."
        ],
        "deliverable": "Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Lộ trình công nghệ nên bắt đầu từ đâu?",
            "options": [
              "Từ công nghệ đang thịnh hành",
              "Từ mục tiêu kinh doanh cụ thể",
              "Từ ngân sách có sẵn",
              "Từ sở thích cá nhân của lãnh đạo"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mục tiêu kinh doanh phải là căn cứ chính để lựa chọn đầu tư công nghệ, không phải xu hướng."
          },
          {
            "number": 2,
            "question": "Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là gì?",
            "options": [
              "Thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo",
              "Luôn do công nghệ kém chất lượng",
              "Không có nguyên nhân phổ biến nào",
              "Chỉ do thiếu ngân sách"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các nguyên nhân thường gặp hơn là vấn đề kỹ thuật thuần túy."
          },
          {
            "number": 3,
            "question": "Mức độ sẵn sàng của tổ chức bao gồm yếu tố nào ngoài kỹ thuật?",
            "options": [
              "Chỉ có yếu tố kỹ thuật là quan trọng",
              "Không có yếu tố nào khác",
              "Chỉ liên quan đến ngân sách",
              "Sự sẵn sàng thay đổi thói quen làm việc và rào cản văn hóa"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Yếu tố con người và văn hóa tổ chức quan trọng không kém yếu tố kỹ thuật."
          },
          {
            "number": 4,
            "question": "Ma trận tác động và khả thi dùng để làm gì?",
            "options": [
              "Không có tác dụng thực tế",
              "Chỉ để trình bày báo cáo",
              "Chỉ áp dụng cho dự án nhỏ",
              "Ưu tiên đầu tư vào hạng mục vừa có tác động lớn vừa khả thi thực hiện"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là công cụ giúp phân bổ nguồn lực đầu tư một cách hợp lý."
          },
          {
            "number": 5,
            "question": "Đánh giá hiệu quả sau triển khai nên dựa trên điều gì?",
            "options": [
              "Cảm nhận chủ quan sau khi triển khai",
              "Chỉ tiêu tự đặt ra sau khi biết kết quả",
              "Các chỉ số đã đặt ra từ đầu, so sánh với mục tiêu ban đầu",
              "Không cần đánh giá hiệu quả"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đánh giá dựa trên chỉ số đặt trước đảm bảo tính khách quan, tránh điều chỉnh tiêu chí sau khi biết kết quả."
          },
          {
            "number": 6,
            "question": "Lộ trình công nghệ nên bắt đầu từ đâu?",
            "options": [
              "Công cụ mới nhất",
              "Giá thấp nhất",
              "Mục tiêu kinh doanh và hiện trạng của tổ chức",
              "Đối thủ đang dùng gì"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Công nghệ phục vụ mục tiêu."
          },
          {
            "number": 7,
            "question": "Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ là gì?",
            "options": [
              "Thiếu sự dẫn dắt, đào tạo và thay đổi quy trình đi kèm",
              "Công nghệ quá hiện đại",
              "Nhân viên quá nhiều",
              "Mua đắt"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Yếu tố con người và quy trình thường quyết định."
          },
          {
            "number": 8,
            "question": "Mức độ sẵn sàng của tổ chức gồm yếu tố nào ngoài kỹ thuật?",
            "options": [
              "Chỉ màu thương hiệu",
              "Con người, quy trình, văn hóa và nguồn lực",
              "Chỉ số văn phòng",
              "Chỉ ngân sách marketing"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Không chỉ có hạ tầng."
          },
          {
            "number": 9,
            "question": "Ma trận tác động và khả thi dùng để làm gì?",
            "options": [
              "Tính lương",
              "Xếp hạng ưu tiên các sáng kiến",
              "Vẽ sơ đồ tổ chức",
              "Lập hóa đơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Ưu tiên nguồn lực."
          },
          {
            "number": 10,
            "question": "Đánh giá hiệu quả sau triển khai nên dựa trên gì?",
            "options": [
              "Chỉ số kinh doanh và vận hành đã đặt trước",
              "Cảm nhận chung",
              "Số tính năng",
              "Giá phần mềm"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Cần so sánh với mục tiêu ban đầu."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Đổi mới sáng tạo bằng công nghệ số",
        "competency_line": "Năng lực 5.3 · Mức 5–6",
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
          "Từ ý tưởng ban đầu, cần chuyển hóa thành giả thuyết kiểm chứng được với tiêu chí thành công xác định trước khi chạy thử nghiệm. Thiết kế thử nghiệm nhỏ, chi phí thấp giúp kiểm chứng giả thuyết mà không cần đầu tư lớn ngay từ đầu. Xây dựng văn hóa cho phép thử và sai có kiểm soát đòi hỏi lãnh đạo không trừng phạt thử nghiệm thất bại có phương pháp.",
          "Các bước. 1. Tìm cơ hội đổi mới từ ba nguồn: vấn đề của khách hàng, điểm nghẽn nội bộ, công nghệ mới. 2. Chuyển ý tưởng thành giả thuyết kiểm chứng được. 3. Đặt tiêu chí thành công và ngưỡng trước khi thử nghiệm. 4. Thiết kế thử nghiệm nhỏ: phạm vi, thời gian, dữ liệu cần thu, rủi ro. 5. Ra quyết định dựa trên kết quả: mở rộng, điều chỉnh hoặc dừng. 6. Khuyến khích thử nghiệm có phương pháp; thất bại có học hỏi không bị trừng phạt."
        ],
        "examples": [
          "Ví dụ trong công việc. Nhân viên chăm sóc khách hàng nhận thấy nhiều khách hỏi cùng một nhóm câu hỏi. Ý tưởng “làm trợ lý trả lời tự động” được chuyển thành giả thuyết kiểm chứng: nếu có trợ lý trả lời năm câu hỏi phổ biến thì tỷ lệ yêu cầu phải chuyển người giảm ít nhất 20% trong hai tuần. Tiêu chí thành công đặt trước khi thử."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chạy theo công nghệ thời thượng; đặt tiêu chí sau khi có kết quả; trừng phạt thất bại khiến không ai dám thử."
        ],
        "practice": [
          "Nhận diện một cơ hội đổi mới trong doanh nghiệp, thiết kế thử nghiệm với giả thuyết và tiêu chí thành công rõ ràng, trình bày phương án."
        ],
        "deliverable": "Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Ba nguồn phổ biến của cơ hội đổi mới là gì?",
            "options": [
              "Điểm đau khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng",
              "Chỉ có công nghệ mới",
              "Chỉ từ ý tưởng của lãnh đạo",
              "Không có nguồn cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là ba nguồn cơ hội đổi mới phổ biến trong thực tế doanh nghiệp."
          },
          {
            "number": 2,
            "question": "Vì sao cần chuyển ý tưởng thành giả thuyết kiểm chứng được?",
            "options": [
              "Không cần thiết",
              "Để có thể đo lường kết quả thử nghiệm một cách cụ thể",
              "Chỉ để làm phức tạp thêm ý tưởng",
              "Không có tác dụng thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Giả thuyết cụ thể mới cho phép đánh giá thử nghiệm thành công hay không một cách khách quan."
          },
          {
            "number": 3,
            "question": "Tiêu chí thành công của thử nghiệm nên được xác định khi nào?",
            "options": [
              "Sau khi có kết quả",
              "Không cần xác định",
              "Trước khi chạy thử nghiệm",
              "Tùy ý điều chỉnh trong quá trình"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Xác định trước tránh việc diễn giải kết quả theo hướng có lợi sau khi đã biết số liệu."
          },
          {
            "number": 4,
            "question": "Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp?",
            "options": [
              "Sợ thất bại khiến nhân viên ngại đề xuất ý tưởng mới",
              "Nên trừng phạt để răn đe",
              "Không liên quan đến văn hóa tổ chức",
              "Thất bại luôn nên được khen thưởng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Văn hóa trừng phạt thất bại làm giảm động lực đổi mới trong tổ chức."
          },
          {
            "number": 5,
            "question": "Cách phân biệt cơ hội công nghệ thật với sự cường điệu là gì?",
            "options": [
              "Chạy theo vì nhiều người đang nói về nó",
              "Không thể phân biệt được",
              "Luôn tin vào xu hướng truyền thông",
              "Đặt câu hỏi cụ thể công nghệ đó giải quyết vấn đề gì của tổ chức"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đánh giá dựa trên vấn đề cụ thể cần giải quyết giúp tránh chạy theo xu hướng không thực chất."
          },
          {
            "number": 6,
            "question": "Ba nguồn phổ biến của cơ hội đổi mới là gì?",
            "options": [
              "May mắn, vận may, tin đồn",
              "Vấn đề của khách hàng, điểm nghẽn nội bộ và công nghệ mới",
              "Quảng cáo, khuyến mãi, giảm giá",
              "Cấp trên, đối thủ, đối tác chỉ định"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cơ hội có nguồn gốc rõ ràng."
          },
          {
            "number": 7,
            "question": "Vì sao chuyển ý tưởng thành giả thuyết kiểm chứng được?",
            "options": [
              "Để có thể thử và đánh giá bằng dữ liệu",
              "Để ý tưởng nghe hay hơn",
              "Để tránh thử nghiệm",
              "Không cần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giả thuyết cho phép kiểm chứng."
          },
          {
            "number": 8,
            "question": "Khi nào xác định tiêu chí thành công của thử nghiệm?",
            "options": [
              "Sau khi có kết quả",
              "Khi kết thúc năm",
              "Trước khi bắt đầu thử nghiệm",
              "Không cần"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Tránh diễn giải theo ý muốn."
          },
          {
            "number": 9,
            "question": "Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp?",
            "options": [
              "Vì thất bại luôn tốt",
              "Vì nó mang lại học hỏi và khuyến khích dám thử",
              "Vì không ai chịu trách nhiệm",
              "Vì tiết kiệm chi phí"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Văn hóa thử nghiệm."
          },
          {
            "number": 10,
            "question": "Cách phân biệt cơ hội thật với cường điệu?",
            "options": [
              "Tin vào số lượng bài báo",
              "Làm theo đối thủ",
              "Nghe lời nhà cung cấp",
              "Kiểm chứng với vấn đề thật và số liệu thay vì lời quảng cáo"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dựa trên bằng chứng."
          }
        ]
      },
      {
        "module_number": 4,
        "title": "Phát triển năng lực số toàn tổ chức",
        "competency_line": "Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
        "objectives": [
          "Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình",
          "Đánh giá được sự phát triển năng lực số của người khác",
          "Lựa chọn được những cơ hội thích hợp nhất để phát triển bản thân và cập nhật những phát triển mới"
        ],
        "definitions": [
          "Đội ngũ nòng cốt: nhóm nhân sự được đào tạo chuyên sâu trước, đóng vai trò lan tỏa kiến thức và hỗ trợ đồng nghiệp trong tổ chức",
          "Lộ trình nghề nghiệp gắn với năng lực số: việc đưa yêu cầu và kết quả phát triển năng lực số vào quá trình đánh giá và thăng tiến của nhân viên"
        ],
        "body": [
          "Ở mức nâng cao, việc quyết định cách thích hợp nhất để cải thiện năng lực số và đánh giá sự phát triển của người khác mở rộng thành phát triển năng lực số toàn tổ chức. Khảo sát và lập bản đồ năng lực số toàn tổ chức cho phép nhìn thấy bức tranh tổng thể.",
          "Chiến lược phát triển năng lực số cấp tổ chức cần cân nhắc ba hướng: tuyển mới, đào tạo lại nhân sự hiện có, thuê ngoài. Xây dựng đội ngũ nòng cốt — đào tạo trước một nhóm nhỏ để lan tỏa kiến thức — là cách mở rộng đào tạo hiệu quả về chi phí. Đo lường hiệu quả đào tạo không nên chỉ dừng ở điểm số mà cần theo dõi thay đổi hành vi thực tế.",
          "Các bước. 1. Xác định năng lực số cần có theo chiến lược kinh doanh. 2. Chọn hướng: đào tạo nội bộ, tuyển dụng, thuê ngoài; thuê ngoài phù hợp khi kỹ năng hiếm, cần ngắn hạn hoặc nội bộ chưa đủ năng lực. 3. Xây đội ngũ nòng cốt để hỗ trợ đồng nghiệp tại chỗ. 4. Gắn năng lực số vào lộ trình thăng tiến để có động lực bền vững. 5. Đo hiệu quả bằng chỉ số công việc như thời gian xử lý, số lỗi, mức độ sử dụng công cụ. 6. Rà soát hằng năm."
        ],
        "examples": [
          "Ví dụ trong công việc. Ban lãnh đạo muốn nâng năng lực số cả công ty ba năm tới. Nếu chỉ tổ chức một khóa chung cho tất cả thì hiệu quả thấp. Chiến lược hợp lý kết hợp ba hướng: đào tạo nội bộ, tuyển dụng hoặc thuê ngoài cho kỹ năng khan hiếm, và xây đội ngũ nòng cốt để lan tỏa. Hiệu quả đo bằng thay đổi trong công việc, không chỉ điểm bài kiểm tra."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Một khóa cho tất cả; chỉ đo điểm bài kiểm tra; không gắn với thăng tiến; quá phụ thuộc thuê ngoài mà không chuyển giao tri thức."
        ],
        "practice": [
          "Xây chiến lược phát triển năng lực số cho doanh nghiệp: bản đồ hiện trạng theo vị trí, ma trận yêu cầu, phân tích khoảng trống, chương trình đào tạo ưu tiên và bộ chỉ số đo lường."
        ],
        "deliverable": "Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ chỉ số.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Ba hướng chiến lược phát triển năng lực số cấp tổ chức là gì?",
            "options": [
              "Tuyển mới, đào tạo lại, thuê ngoài",
              "Chỉ có đào tạo là lựa chọn duy nhất",
              "Chỉ có thuê ngoài",
              "Không có chiến lược cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là ba hướng tiếp cận phù hợp với các tình huống khác nhau về nhu cầu năng lực."
          },
          {
            "number": 2,
            "question": "Đội ngũ nòng cốt có vai trò gì trong phát triển năng lực số?",
            "options": [
              "Được đào tạo trước, sau đó lan tỏa kiến thức cho đồng nghiệp",
              "Không có vai trò cụ thể",
              "Chỉ để quản lý hành chính",
              "Chỉ dành cho cấp lãnh đạo"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là cách tiếp cận hiệu quả về chi phí để mở rộng phạm vi đào tạo trong tổ chức."
          },
          {
            "number": 3,
            "question": "Đo lường hiệu quả đào tạo nên dựa vào điều gì thay vì chỉ điểm số bài kiểm tra?",
            "options": [
              "Chỉ cần điểm số là đủ",
              "Thay đổi hành vi thực tế trong công việc sau đào tạo",
              "Không cần đo lường gì thêm",
              "Chỉ cần số lượng người tham gia"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thay đổi hành vi thực tế phản ánh đào tạo có thực sự tạo ra giá trị hay không."
          },
          {
            "number": 4,
            "question": "Vì sao nên gắn năng lực số vào lộ trình thăng tiến của nhân viên?",
            "options": [
              "Không có lý do cụ thể",
              "Chỉ để tăng thêm thủ tục hành chính",
              "Tạo động lực thực chất cho việc học tập, thay vì đào tạo mang tính hình thức",
              "Không liên quan đến hiệu quả đào tạo"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Gắn kết với sự nghiệp cá nhân tạo động lực học tập mạnh mẽ hơn đào tạo không có hệ quả thực tế."
          },
          {
            "number": 5,
            "question": "Khi nào nên chọn hướng “thuê ngoài” thay vì đào tạo nội bộ?",
            "options": [
              "Luôn nên thuê ngoài",
              "Không bao giờ nên thuê ngoài",
              "Khi nhu cầu không thường xuyên, không đáng đầu tư xây năng lực nội bộ",
              "Chỉ khi không có ngân sách"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thuê ngoài phù hợp khi đầu tư xây dựng năng lực nội bộ không hiệu quả về chi phí so với nhu cầu thực tế."
          },
          {
            "number": 6,
            "question": "Ba hướng phát triển năng lực số cấp tổ chức là gì?",
            "options": [
              "Đào tạo nội bộ, tuyển dụng và thuê ngoài",
              "In tài liệu, họp, nhắc nhở",
              "Mua máy, đổi mạng, đổi phần mềm",
              "Giảm lương, tăng việc, giảm nhân sự"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Ba hướng bổ sung cho nhau."
          },
          {
            "number": 7,
            "question": "Đội ngũ nòng cốt có vai trò gì?",
            "options": [
              "Thay thế bộ phận kỹ thuật",
              "Hỗ trợ đồng nghiệp tại chỗ và lan tỏa thực hành tốt",
              "Giám sát nhân viên",
              "Quyết định ngân sách"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mở rộng tác động đào tạo."
          },
          {
            "number": 8,
            "question": "Đo hiệu quả đào tạo nên dựa vào gì ngoài điểm bài kiểm tra?",
            "options": [
              "Số giờ ngồi lớp",
              "Thay đổi trong công việc như thời gian xử lý, số lỗi, mức sử dụng",
              "Số buổi tổ chức",
              "Số học viên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đo kết quả thực tế."
          },
          {
            "number": 9,
            "question": "Vì sao gắn năng lực số vào lộ trình thăng tiến?",
            "options": [
              "Để tăng áp lực",
              "Để loại bớt nhân viên",
              "Không có lý do",
              "Tạo động lực bền vững để phát triển kỹ năng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Động lực dài hạn."
          },
          {
            "number": 10,
            "question": "Khi nào nên chọn thuê ngoài thay vì đào tạo nội bộ?",
            "options": [
              "Luôn luôn",
              "Không bao giờ",
              "Khi muốn giảm kiểm soát",
              "Khi kỹ năng hiếm, cần ngắn hạn hoặc nội bộ chưa đủ năng lực"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Cần cân nhắc và chuyển giao tri thức."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M5-A — “Đề án chuyển đổi số cho doanh nghiệp” (Assignment)",
      "context": "Bạn được giao xây dựng đề án chuyển đổi số 12 tháng cho một doanh nghiệp vừa và nhỏ (giả định, khoảng 80 nhân viên) với mục tiêu rõ về tăng trưởng hoặc hiệu quả.",
      "requirements": "1. Đánh giá hiện trạng: các vấn đề vận hành lặp lại, phân tích nguyên nhân gốc cho ít nhất 3 vấn đề, rủi ro phụ thuộc cá nhân, đề xuất kho tri thức và yêu cầu SLA với bên hỗ trợ. 2. Lộ trình công nghệ: mục tiêu kinh doanh, mức độ sẵn sàng của tổ chức, ma trận ưu tiên các sáng kiến, lộ trình theo giai đoạn, ngân sách ước tính, kế hoạch quản lý thay đổi, chỉ số đánh giá. 3. Một đề xuất đổi mới: nguồn cơ hội, giả thuyết kiểm chứng được, tiêu chí thành công đặt trước, thiết kế thử nghiệm nhỏ, tiêu chí quyết định mở rộng hay dừng. 4. Chiến lược phát triển năng lực số toàn tổ chức: hướng đào tạo, tuyển dụng, thuê ngoài, đội ngũ nòng cốt, gắn lộ trình thăng tiến, cách đo hiệu quả. 5. Rủi ro chính của đề án và biện pháp giảm thiểu.",
      "deliverables": "Bốn phần tương ứng và bảng rủi ro.\nHình thức nộp. Một tài liệu đề án có mục lục (khoảng 8–12 trang) và bản trình bày tóm tắt.",
      "rubric": [
        "Gợi ý. Dùng số liệu giả định hợp lý và ghi rõ giả định; tránh đề án chỉ liệt kê công cụ.",
        "Tiêu chí",
        "Điểm",
        "Đánh giá hiện trạng và năng lực xử lý vấn đề tổ chức",
        "20",
        "Lộ trình công nghệ gắn với mục tiêu kinh doanh",
        "25",
        "Đề xuất đổi mới có thiết kế thử nghiệm rõ ràng",
        "25",
        "Chiến lược phát triển năng lực số toàn tổ chức",
        "30"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Phân tích nguyên nhân gốc là gì?",
        "options": [
          "Sửa từng biểu hiện",
          "Bỏ qua lỗi",
          "Tìm và loại bỏ nguyên nhân sinh ra lỗi",
          "Đổ lỗi người dùng"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Loại bỏ tận gốc."
      },
      {
        "number": 2,
        "question": "Lỗi lặp lại dù đã nhắc nhở gợi ý gì?",
        "options": [
          "Nhân viên cố ý",
          "Hệ thống hoặc quy trình chưa ngăn được lỗi",
          "Máy hỏng",
          "Không nguyên nhân"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Sửa hệ thống."
      },
      {
        "number": 3,
        "question": "Rủi ro phụ thuộc cá nhân?",
        "options": [
          "Làm việc quá nhanh",
          "Gián đoạn khi người nắm việc vắng hoặc rời đi",
          "Quá nhiều người biết",
          "Không rủi ro"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cần chia sẻ tri thức."
      },
      {
        "number": 4,
        "question": "Kho tri thức nội bộ giúp gì?",
        "options": [
          "Không lợi ích",
          "Tăng chi phí",
          "Lộ thông tin",
          "Giữ cách xử lý để người khác tiếp quản"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Giữ tri thức."
      },
      {
        "number": 5,
        "question": "SLA nên quy định gì?",
        "options": [
          "Chỉ giá",
          "Thời gian phản hồi, khắc phục, phạm vi, xử lý vi phạm",
          "Chỉ tên nhân sự",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Cam kết rõ."
      },
      {
        "number": 6,
        "question": "Lộ trình công nghệ bắt đầu từ đâu?",
        "options": [
          "Công cụ mới nhất",
          "Giá thấp nhất",
          "Mục tiêu kinh doanh và hiện trạng",
          "Đối thủ dùng gì"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Công nghệ phục vụ mục tiêu."
      },
      {
        "number": 7,
        "question": "Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ?",
        "options": [
          "Thiếu dẫn dắt, đào tạo, thay đổi quy trình",
          "Công nghệ quá hiện đại",
          "Quá nhiều nhân viên",
          "Mua đắt"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Con người và quy trình."
      },
      {
        "number": 8,
        "question": "Mức sẵn sàng của tổ chức gồm yếu tố nào ngoài kỹ thuật?",
        "options": [
          "Màu thương hiệu",
          "Số văn phòng",
          "Ngân sách marketing",
          "Con người, quy trình, văn hóa, nguồn lực"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Không chỉ hạ tầng."
      },
      {
        "number": 9,
        "question": "Ma trận tác động và khả thi dùng để?",
        "options": [
          "Xếp ưu tiên các sáng kiến",
          "Tính lương",
          "Sơ đồ tổ chức",
          "Hóa đơn"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ưu tiên nguồn lực."
      },
      {
        "number": 10,
        "question": "Đánh giá sau triển khai dựa trên?",
        "options": [
          "Chỉ số kinh doanh và vận hành đặt trước",
          "Cảm nhận",
          "Số tính năng",
          "Giá phần mềm"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "So với mục tiêu."
      },
      {
        "number": 11,
        "question": "Ba nguồn cơ hội đổi mới?",
        "options": [
          "May mắn",
          "Khuyến mãi",
          "Cấp trên chỉ định",
          "Vấn đề khách hàng, điểm nghẽn nội bộ, công nghệ mới"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nguồn rõ ràng."
      },
      {
        "number": 12,
        "question": "Vì sao cần giả thuyết kiểm chứng được?",
        "options": [
          "Nghe hay hơn",
          "Tránh thử",
          "Để thử và đánh giá bằng dữ liệu",
          "Không cần"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Cho phép kiểm chứng."
      },
      {
        "number": 13,
        "question": "Tiêu chí thành công thử nghiệm đặt khi nào?",
        "options": [
          "Sau khi có kết quả",
          "Trước khi bắt đầu thử",
          "Cuối năm",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Tránh diễn giải theo ý muốn."
      },
      {
        "number": 14,
        "question": "Vì sao không trừng phạt thất bại có phương pháp?",
        "options": [
          "Thất bại luôn tốt",
          "Không ai chịu trách nhiệm",
          "Mang lại học hỏi, khuyến khích dám thử",
          "Tiết kiệm chi phí"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Văn hóa thử nghiệm."
      },
      {
        "number": 15,
        "question": "Phân biệt cơ hội thật với cường điệu bằng?",
        "options": [
          "Số bài báo",
          "Làm theo đối thủ",
          "Kiểm chứng với vấn đề thật và số liệu",
          "Lời nhà cung cấp"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Bằng chứng."
      },
      {
        "number": 16,
        "question": "Ba hướng phát triển năng lực số cấp tổ chức?",
        "options": [
          "Đào tạo nội bộ, tuyển dụng, thuê ngoài",
          "In tài liệu, họp, nhắc",
          "Mua máy, đổi mạng, đổi phần mềm",
          "Giảm lương, tăng việc, giảm người"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bổ sung nhau."
      },
      {
        "number": 17,
        "question": "Vai trò đội ngũ nòng cốt?",
        "options": [
          "Thay kỹ thuật",
          "Giám sát",
          "Quyết định ngân sách",
          "Hỗ trợ đồng nghiệp tại chỗ, lan tỏa thực hành tốt"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Mở rộng tác động."
      },
      {
        "number": 18,
        "question": "Đo hiệu quả đào tạo ngoài điểm kiểm tra?",
        "options": [
          "Giờ ngồi lớp",
          "Số buổi",
          "Số học viên",
          "Thay đổi trong công việc: thời gian, số lỗi, mức dùng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đo kết quả thực tế."
      },
      {
        "number": 19,
        "question": "Vì sao gắn năng lực số với thăng tiến?",
        "options": [
          "Tăng áp lực",
          "Tạo động lực bền vững",
          "Loại nhân viên",
          "Không lý do"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Động lực dài hạn."
      },
      {
        "number": 20,
        "question": "Khi nào chọn thuê ngoài?",
        "options": [
          "Kỹ năng hiếm, cần ngắn hạn hoặc nội bộ chưa đủ năng lực",
          "Luôn luôn",
          "Không bao giờ",
          "Muốn giảm kiểm soát"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cân nhắc và chuyển giao."
      }
    ]
  },
  "M6-F": {
    "code": "M6-F",
    "title": "ỨNG DỤNG AI CƠ BẢN",
    "domain_number": 6,
    "level": 1,
    "modules": [
      {
        "module_number": 1,
        "title": "Hiểu biết cơ bản về AI",
        "competency_line": "Năng lực 6.1 · Bậc 1–2",
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
          "Nguyên tắc hoạt động cơ bản của AI có thể hình dung qua ba bước: (1) AI được “cho xem” một lượng lớn dữ liệu mẫu trong quá trình huấn luyện, (2) từ đó AI tự nhận diện các quy luật thống kê trong dữ liệu, (3) khi gặp dữ liệu mới, AI áp dụng quy luật đã học để đưa ra dự đoán hoặc tạo ra nội dung. Điều quan trọng cần hiểu: AI không “hiểu” theo nghĩa con người hiểu — nó dự đoán dựa trên xác suất và mẫu hình đã học, điều này giải thích vì sao đôi khi AI đưa ra câu trả lời nghe rất tự tin nhưng lại sai.",
          "Chị Mai làm ở bộ phận hành chính, mỗi ngày dùng tính năng gợi ý từ khi gõ tin nhắn trên điện thoại — đây là một dạng AI đơn giản. Cùng lúc đó, công ty chị dùng một hệ thống lọc email tự động phân loại email rác — cũng là AI, nhưng “huấn luyện” trên hàng triệu email đã được đánh dấu là rác/không rác trước đó. Cả hai ví dụ đều là AI, dù một cái chị dùng mỗi ngày mà không để ý, một cái công ty đầu tư triển khai riêng."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Nhân viên hỏi một công cụ AI về quy định của một loại hợp đồng và nhận được câu trả lời trôi chảy, có cả số điều khoản cụ thể. Khi kiểm tra lại, số điều khoản đó không tồn tại. AI không “biết” sự thật như con người; nó tạo ra câu trả lời có vẻ hợp lý dựa trên các mẫu đã học từ dữ liệu, nên giọng điệu tự tin không bảo đảm nội dung đúng."
        ],
        "steps": [
          "Các ý chính. 1. AI là các hệ thống máy móc thực hiện nhiệm vụ đòi hỏi trí tuệ như học tập, suy luận, giải quyết vấn đề (theo Thông tư 02/2025/TT-BGDĐT). 2. AI học từ dữ liệu: tìm quy luật trong lượng lớn ví dụ, chứ không được “lập trình từng câu trả lời”. 3. AI tạo sinh (Gen AI) tạo nội dung mới như văn bản, hình ảnh, âm thanh từ yêu cầu của người dùng. 4. AI có thể sai, thiên lệch hoặc thiếu dữ liệu mới; cần người kiểm tra trước khi dùng. 5. AI đã có trong đời sống: gợi ý tìm kiếm, gợi ý video, lọc thư rác, trợ lý ảo."
        ],
        "mistakes": [
          "Lỗi thường gặp. Coi AI như nguồn sự thật tuyệt đối; nghĩ AI hiểu như con người; bỏ qua việc kiểm tra."
        ],
        "practice": [
          "Liệt kê 5 công cụ hoặc ứng dụng có dùng AI mà bản thân từng gặp trong công việc hoặc đời sống hằng ngày (có thể là những thứ rất quen thuộc, không cần “cao siêu”), với mỗi công cụ, giải thích ngắn gọn AI đóng vai trò gì ở đó."
        ],
        "deliverable": "Bảng 5 ứng dụng AI đã gặp kèm giải thích.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Theo Thông tư 02/2025/TT-BGDĐT, AI được định nghĩa là gì?",
            "options": [
              "Một loại phần mềm diệt virus",
              "Một loại mạng xã hội",
              "Hệ thống máy móc có khả năng thực hiện nhiệm vụ đòi hỏi trí tuệ con người",
              "Thiết bị lưu trữ dữ liệu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là định nghĩa chính thức theo Thông tư."
          },
          {
            "number": 2,
            "question": "Gen AI (trí tuệ nhân tạo tạo sinh) tập trung vào việc gì?",
            "options": [
              "Lưu trữ dữ liệu",
              "Tạo ra dữ liệu mới như văn bản, hình ảnh, âm thanh dựa trên dữ liệu đã huấn luyện",
              "Sửa lỗi phần cứng",
              "Quản lý mạng máy tính"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là đặc trưng phân biệt Gen AI với các dạng AI khác."
          },
          {
            "number": 3,
            "question": "Vì sao AI đôi khi đưa ra câu trả lời sai dù nghe rất tự tin?",
            "options": [
              "AI luôn cố ý nói sai",
              "AI không có khả năng trả lời",
              "AI dự đoán dựa trên xác suất và mẫu hình đã học, không thực sự “hiểu” như con người",
              "Do lỗi kết nối mạng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là bản chất của cách AI hoạt động, khác với suy luận logic của con người."
          },
          {
            "number": 4,
            "question": "Đâu là ví dụ về AI trong đời sống hằng ngày?",
            "options": [
              "Gợi ý tự động hoàn thành khi gõ tin nhắn cũng là một dạng AI",
              "Chỉ có robot công nghiệp mới là AI",
              "AI chỉ tồn tại trong phim khoa học viễn tưởng",
              "AI chỉ dùng trong nghiên cứu khoa học"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "AI đã hiện diện trong nhiều công cụ quen thuộc hằng ngày."
          },
          {
            "number": 5,
            "question": "AI học từ dữ liệu theo cách nào?",
            "options": [
              "Được lập trình sẵn từng bước cụ thể như phần mềm truyền thống",
              "Không cần dữ liệu để hoạt động",
              "Chỉ hoạt động khi có kết nối Internet",
              "Nhận diện quy luật từ khối lượng lớn dữ liệu mẫu trong quá trình huấn luyện"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là điểm khác biệt cốt lõi giữa AI và phần mềm truyền thống."
          },
          {
            "number": 6,
            "question": "AI học từ dữ liệu theo nghĩa nào?",
            "options": [
              "Được lập trình sẵn từng câu trả lời",
              "Hỏi ý kiến từng người dùng",
              "Sao chép nguyên văn mọi thứ",
              "Tìm các quy luật từ lượng lớn ví dụ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "AI nhận ra mẫu từ dữ liệu."
          },
          {
            "number": 7,
            "question": "Gen AI khác các hệ thống gợi ý thông thường ở điểm nào?",
            "options": [
              "Chỉ xếp hạng nội dung có sẵn",
              "Tạo ra nội dung mới như văn bản, hình ảnh",
              "Chỉ xóa nội dung",
              "Chỉ lưu trữ nội dung"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tạo sinh nghĩa là sinh nội dung mới."
          },
          {
            "number": 8,
            "question": "Vì sao AI có thể trả lời sai nhưng nghe rất tự tin?",
            "options": [
              "Nó tạo ra câu trả lời có vẻ hợp lý theo mẫu đã học, không kiểm chứng sự thật",
              "Nó cố ý nói dối",
              "Nó luôn biết đáp án đúng",
              "Nó không dùng dữ liệu"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giọng điệu không phản ánh độ chính xác."
          },
          {
            "number": 9,
            "question": "Ví dụ nào là AI trong đời sống hằng ngày?",
            "options": [
              "Máy tính bỏ túi cơ bản",
              "Gợi ý video dựa trên lịch sử xem",
              "Công tắc đèn",
              "Bút bi"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Gợi ý nội dung dùng AI."
          },
          {
            "number": 10,
            "question": "Hiểu rằng AI có thể sai dẫn đến thói quen nào?",
            "options": [
              "Kiểm tra thông tin quan trọng trước khi dùng",
              "Tin tuyệt đối vào kết quả",
              "Không bao giờ dùng AI",
              "Dùng AI cho mọi việc"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Dùng AI có ý thức."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Sử dụng công cụ AI cơ bản",
        "competency_line": "Năng lực 6.2 · Bậc 1–2",
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
          "Nguyên tắc an toàn quan trọng nhất ở mức cơ bản: không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ AI công cộng chưa được doanh nghiệp phê duyệt. Dữ liệu nhập vào các công cụ AI miễn phí trên mạng có thể được lưu trữ trên máy chủ bên ngoài, thậm chí được dùng để huấn luyện lại mô hình — nghĩa là thông tin đó có thể “rò rỉ” ra ngoài phạm vi kiểm soát của doanh nghiệp theo cách không thể thu hồi lại.",
          "Anh Tuấn cần tóm tắt một bản báo cáo dài 10 trang cho cuộc họp chiều nay. Thay vì đọc và tóm tắt thủ công mất một giờ, anh dùng công cụ AI: dán nội dung báo cáo (đã loại bỏ tên khách hàng và số liệu tài chính nhạy cảm) và yêu cầu “tóm tắt thành 5 gạch đầu dòng, tập trung vào các con số quan trọng”. Anh nhận được bản tóm tắt trong 10 giây, đọc lại để kiểm tra có đúng ý báo cáo gốc không, rồi mới dùng cho cuộc họp. Anh đã làm đúng hai việc: đặt yêu cầu cụ thể, và ẩn thông tin nhạy cảm trước khi dán vào công cụ công cộng.",
          "Các bước. 1. Nêu rõ mục đích, đối tượng, độ dài, giọng văn và định dạng mong muốn trong yêu cầu. 2. Cung cấp ngữ cảnh cần thiết nhưng không đưa thông tin nhạy cảm (tên khách, số điện thoại, hợp đồng, dữ liệu nội bộ). 3. Nếu cần, thay thông tin thật bằng thông tin giả hoặc ký hiệu. 4. Đọc kỹ kết quả, chỉnh sửa và yêu cầu AI sửa theo hướng cụ thể. 5. Tuân thủ quy định của doanh nghiệp về công cụ được phép dùng."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Nhân viên nhập vào công cụ AI công cộng: “Viết email cho khách”. Kết quả chung chung. Sau đó họ đặt lại: “Viết email ngắn, lịch sự, khoảng 120 từ, thông báo lùi lịch giao hàng hai ngày vì thiếu hàng, xin lỗi và đề xuất hai ngày giao mới.” Kết quả dùng được. Trước khi dán, họ xóa tên khách và mã đơn hàng vì không nên đưa thông tin nhạy cảm vào công cụ công cộng."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Yêu cầu mơ hồ; dán nguyên văn tài liệu có thông tin khách hàng; dùng kết quả mà không đọc lại."
        ],
        "practice": [
          "Dùng một công cụ AI để hỗ trợ một việc công việc đơn giản (ví dụ: tóm tắt một văn bản, soạn nháp một email, dịch một đoạn văn bản ngắn). Ghi lại yêu cầu (prompt) đã đặt và đánh giá kết quả nhận được có đạt yêu cầu không, cần chỉnh sửa gì."
        ],
        "deliverable": "Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao cách đặt yêu cầu (prompt) ảnh hưởng đến chất lượng kết quả AI?",
            "options": [
              "Yêu cầu càng cụ thể, kết quả càng sát nhu cầu thực tế",
              "Không có ảnh hưởng gì",
              "AI luôn cho kết quả giống nhau bất kể yêu cầu gì",
              "Chỉ ảnh hưởng đến tốc độ trả lời"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Yêu cầu mơ hồ thường cho kết quả chung chung, không dùng được."
          },
          {
            "number": 2,
            "question": "Nguyên tắc an toàn quan trọng nhất khi dùng công cụ AI công cộng là gì?",
            "options": [
              "Luôn dùng công cụ miễn phí",
              "Chỉ dùng vào buổi sáng",
              "Luôn dùng tiếng Anh khi đặt yêu cầu",
              "Không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ chưa được phê duyệt"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dữ liệu nhập vào công cụ công cộng có thể bị lưu trữ hoặc dùng để huấn luyện ngoài kiểm soát."
          },
          {
            "number": 3,
            "question": "Vì sao dữ liệu nhập vào công cụ AI công cộng có thể là rủi ro?",
            "options": [
              "Không có rủi ro gì",
              "Có thể được lưu trữ hoặc dùng để huấn luyện lại mô hình ngoài kiểm soát của doanh nghiệp",
              "Chỉ tốn thêm thời gian",
              "Chỉ ảnh hưởng đến tốc độ xử lý"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là rủi ro thực tế cần lưu ý khi dùng công cụ AI chưa được phê duyệt."
          },
          {
            "number": 4,
            "question": "Yêu cầu (prompt) nào sau đây hiệu quả hơn?",
            "options": [
              "“Viết cho tôi cái gì đó”",
              "“Giúp tôi với”",
              "“Tóm tắt báo cáo này thành 5 gạch đầu dòng, tập trung vào số liệu quan trọng”",
              "“Làm việc gì đó hay ho”"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Yêu cầu cụ thể về định dạng, độ dài và trọng tâm cho kết quả sát nhu cầu hơn."
          },
          {
            "number": 5,
            "question": "Trước khi dán một văn bản công việc vào công cụ AI công cộng, nên làm gì?",
            "options": [
              "Loại bỏ thông tin nhạy cảm như tên khách hàng, số liệu tài chính",
              "Không cần làm gì cả",
              "Dịch sang tiếng Anh trước",
              "Chụp ảnh màn hình lại"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là bước bảo vệ dữ liệu cần thiết trước khi dùng công cụ công cộng."
          },
          {
            "number": 6,
            "question": "Vì sao cách đặt yêu cầu ảnh hưởng đến kết quả?",
            "options": [
              "AI chỉ đọc từ đầu tiên",
              "Yêu cầu rõ ràng giúp AI hiểu đúng mục đích, đối tượng và định dạng",
              "Độ dài không quan trọng",
              "Không ảnh hưởng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Yêu cầu cụ thể cho kết quả sát hơn."
          },
          {
            "number": 7,
            "question": "Nguyên tắc an toàn quan trọng khi dùng AI công cộng?",
            "options": [
              "Dùng tài khoản dùng chung",
              "Nhập mật khẩu để AI nhớ",
              "Dán toàn bộ hợp đồng",
              "Không đưa thông tin nhạy cảm của cá nhân hoặc doanh nghiệp"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Dữ liệu nhập vào có thể ra ngoài tầm kiểm soát."
          },
          {
            "number": 8,
            "question": "Vì sao dữ liệu nhập vào công cụ công cộng là rủi ro?",
            "options": [
              "Làm chậm máy",
              "Làm đổi phông",
              "Doanh nghiệp không kiểm soát nơi dữ liệu được lưu và sử dụng",
              "Không có rủi ro"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Mất kiểm soát dữ liệu."
          },
          {
            "number": 9,
            "question": "Yêu cầu nào hiệu quả hơn?",
            "options": [
              "“Viết email 120 từ, lịch sự, báo lùi giao hàng hai ngày và đề xuất ngày mới”",
              "“Viết email”",
              "“Làm giúp tôi”",
              "“Cái gì đó cho khách”"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Có mục đích, độ dài, giọng văn."
          },
          {
            "number": 10,
            "question": "Trước khi dán văn bản công việc vào công cụ AI công cộng nên làm gì?",
            "options": [
              "Dán nguyên văn cho nhanh",
              "Xóa hoặc thay thông tin nhạy cảm bằng thông tin giả",
              "Gửi cho đồng nghiệp trước",
              "Thêm mật khẩu"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Loại bỏ thông tin nhạy cảm."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Nhận biết cơ bản về đánh giá AI",
        "competency_line": "Năng lực 6.3 · Bậc 1–2",
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
          "Kiểm tra chéo là biện pháp phòng vệ cơ bản nhất: với bất kỳ thông tin quan trọng nào AI đưa ra — đặc biệt số liệu, tên riêng, sự kiện cụ thể — nên tìm một nguồn độc lập khác để xác nhận trước khi sử dụng, đặc biệt khi thông tin đó sẽ được dùng trong công việc hoặc chia sẻ cho người khác.",
          "Chị Hương hỏi một công cụ AI về quy định nghỉ phép năm theo luật lao động hiện hành. Công cụ trả lời rất chi tiết và tự tin, trích dẫn cả số điều luật cụ thể. Vì đây là thông tin quan trọng sẽ dùng để tư vấn cho đồng nghiệp, chị tra cứu lại trên cổng thông tin chính thức của cơ quan quản lý lao động — và phát hiện số điều luật AI trích dẫn không khớp với văn bản thật, dù nội dung tổng quát là gần đúng. Nếu chị dùng thẳng câu trả lời của AI mà không kiểm tra chéo, thông tin sai lệch đó có thể đã được truyền đi.",
          "Các bước. 1. Xác định thông tin quan trọng trong kết quả: số liệu, tên, ngày, điều khoản, kết luận. 2. Kiểm tra chéo với nguồn đáng tin cậy độc lập (tài liệu gốc, trang chính thức). 3. Hỏi lại AI về nguồn nhưng không coi câu trả lời là bằng chứng; vẫn phải tự kiểm tra. 4. Đánh dấu phần chưa kiểm chứng được và không dùng chính thức. 5. Ghi nhận phần AI hỗ trợ khi cần minh bạch."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. AI tóm tắt một báo cáo thị trường và nêu con số “thị trường tăng 38%”. Con số này không có trong tài liệu gốc. Đây là hiện tượng ảo giác của AI: nội dung sai nhưng trình bày trôi chảy, không có cảnh báo. Người dùng cần đối chiếu với nguồn gốc, nhất là các con số, tên riêng, ngày tháng, trích dẫn và khẳng định pháp lý."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Tin giọng văn tự tin; chỉ kiểm tra khi thấy nghi ngờ; coi việc AI “đưa nguồn” là đã đúng."
        ],
        "practice": [
          "Yêu cầu một công cụ AI trả lời một câu hỏi mà bản thân đã biết đáp án chính xác từ trước (ví dụ một sự kiện lịch sử công ty, một quy định nội bộ, hoặc một kiến thức chuyên môn quen thuộc). So sánh câu trả lời của AI với đáp án đã biết và nhận xét về độ chính xác."
        ],
        "deliverable": "Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "“Ảo giác AI” (AI hallucination) là hiện tượng gì?",
            "options": [
              "AI bị lỗi kỹ thuật không hoạt động được",
              "AI hiển thị hình ảnh sai định dạng",
              "AI phản hồi chậm hơn bình thường",
              "AI tạo ra thông tin nghe hợp lý, tự tin nhưng thực chất sai hoặc không có căn cứ"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là hiện tượng thông tin sai được trình bày một cách tự tin, không có dấu hiệu cảnh báo."
          },
          {
            "number": 2,
            "question": "Vì sao AI có thể tạo ra thông tin sai mà không có dấu hiệu báo trước?",
            "options": [
              "AI luôn cố tình lừa dối",
              "AI dự đoán từ tiếp theo có khả năng cao nhất, không tra cứu cơ sở dữ liệu đã xác minh",
              "AI không có khả năng ngôn ngữ",
              "AI chỉ hoạt động khi có lỗi"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là bản chất cách AI tạo sinh hoạt động, dựa trên dự đoán mẫu hình chứ không phải tra cứu sự thật."
          },
          {
            "number": 3,
            "question": "Kiểm tra chéo kết quả AI có ý nghĩa gì?",
            "options": [
              "Đối chiếu kết quả AI với nguồn độc lập khác trước khi sử dụng",
              "Không cần thiết nếu AI trả lời tự tin",
              "Chỉ cần hỏi lại AI một lần nữa",
              "Chỉ áp dụng cho câu hỏi đơn giản"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là biện pháp phòng vệ cơ bản với thông tin quan trọng từ AI."
          },
          {
            "number": 4,
            "question": "Khi nào đặc biệt cần kiểm tra chéo kết quả AI?",
            "options": [
              "Với thông tin quan trọng như số liệu, tên riêng, sự kiện cụ thể sẽ dùng trong công việc",
              "Không bao giờ cần thiết",
              "Chỉ khi AI trả lời chậm",
              "Chỉ khi dùng công cụ AI miễn phí"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Thông tin quan trọng có tác động lớn nếu sai nên cần được xác minh trước khi sử dụng."
          },
          {
            "number": 5,
            "question": "Vì sao không nên tin tưởng tuyệt đối vào giọng văn tự tin của AI?",
            "options": [
              "AI luôn nói giọng không chắc chắn",
              "Giọng văn tự tin không đồng nghĩa với thông tin chính xác",
              "AI không có khả năng viết tự tin",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là hiểu lầm phổ biến cần tránh; độ tự tin trong văn phong không phản ánh độ chính xác thực tế."
          },
          {
            "number": 6,
            "question": "Ảo giác AI là gì?",
            "options": [
              "AI tạo ra thông tin sai hoặc không có thật nhưng trình bày như đúng",
              "AI từ chối trả lời",
              "AI tắt bất ngờ",
              "AI hiển thị hình ảnh mờ"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nội dung sai nhưng trôi chảy."
          },
          {
            "number": 7,
            "question": "Vì sao AI tạo ra thông tin sai mà không báo trước?",
            "options": [
              "Nó cố ý lừa",
              "Nó luôn kiểm tra sự thật",
              "Nó tạo nội dung theo mẫu hợp lý, không có cơ chế tự biết điều gì sai",
              "Nó không dùng dữ liệu"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "AI không tự phân biệt đúng sai."
          },
          {
            "number": 8,
            "question": "Kiểm tra chéo kết quả AI nghĩa là gì?",
            "options": [
              "Hỏi lại AI cùng câu",
              "Đối chiếu thông tin quan trọng với nguồn đáng tin cậy độc lập",
              "Hỏi AI khác theo cùng cách",
              "Bỏ qua"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cần nguồn độc lập."
          },
          {
            "number": 9,
            "question": "Khi nào đặc biệt cần kiểm tra chéo?",
            "options": [
              "Chỉ khi kết quả quá ngắn",
              "Chỉ khi dùng máy mới",
              "Không bao giờ",
              "Khi kết quả có số liệu, trích dẫn, quy định hoặc dùng cho quyết định quan trọng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Rủi ro cao hơn khi dùng chính thức."
          },
          {
            "number": 10,
            "question": "Vì sao không nên tin tuyệt đối giọng văn tự tin của AI?",
            "options": [
              "Vì AI luôn sai",
              "Vì AI chỉ nói ngắn",
              "Giọng điệu không phản ánh độ chính xác của nội dung",
              "Vì AI chỉ biết tiếng Anh"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Văn phong và độ đúng là hai chuyện khác nhau."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M6-F — “Dùng AI hỗ trợ một việc thật, có kiểm tra” (Assignment)",
      "context": "Bạn được khuyến khích dùng AI để làm việc hiệu quả hơn, với điều kiện bảo vệ thông tin và kiểm tra kết quả trước khi dùng chính thức.",
      "requirements": "1. Xác định một công việc thật cần hỗ trợ (ví dụ tóm tắt tài liệu, soạn thư, gợi ý dàn ý) và nêu công cụ AI được phép dùng. 2. Viết yêu cầu (prompt) cụ thể về mục đích, đối tượng, độ dài, giọng văn; ghi lại ít nhất 2 phiên bản yêu cầu và so sánh kết quả. 3. Nêu thông tin nhạy cảm có trong công việc và cách ẩn hoặc loại bỏ trước khi đưa vào công cụ. 4. Kiểm tra chéo ít nhất 3 thông tin quan trọng trong kết quả bằng nguồn độc lập, ghi rõ nguồn. 5. Viết nhận xét: kết quả có dùng được không, phần nào cần sửa, có phát hiện sai lệch nào không, bài học rút ra.",
      "deliverables": "Các phiên bản yêu cầu và kết quả; bảng kiểm tra chéo; bản kết quả đã chỉnh sửa; nhận xét ngắn.\nHình thức nộp. Một tài liệu tổng hợp.",
      "rubric": [
        "Gợi ý. Nếu không có việc thật, dùng một tình huống mẫu có dữ liệu giả. Không đưa thông tin nhạy cảm thật vào bài nộp.",
        "Tiêu chí",
        "Điểm",
        "Yêu cầu (prompt) đặt ra cụ thể, rõ ràng",
        "25",
        "Có ý thức bảo vệ thông tin nhạy cảm trước khi dùng công cụ",
        "25",
        "Thực hiện kiểm tra chéo ít nhất một thông tin quan trọng",
        "30",
        "Nhận xét kết quả hợp lý, có căn cứ",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Theo Thông tư 02/2025/TT-BGDĐT, AI là gì?",
        "options": [
          "Phần mềm chỉ để chơi trò chơi",
          "Một loại thiết bị lưu trữ",
          "Hệ thống máy móc thực hiện nhiệm vụ đòi hỏi trí tuệ như học tập, suy luận, giải quyết vấn đề",
          "Chỉ là robot hình người"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Định nghĩa theo Thông tư."
      },
      {
        "number": 2,
        "question": "AI học từ dữ liệu bằng cách nào?",
        "options": [
          "Tìm quy luật từ nhiều ví dụ",
          "Được lập trình từng câu",
          "Hỏi từng người",
          "Sao chép mọi thứ"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Học mẫu từ dữ liệu."
      },
      {
        "number": 3,
        "question": "Gen AI tập trung vào việc gì?",
        "options": [
          "Tạo ra nội dung mới như văn bản, hình ảnh",
          "Chỉ xếp hạng",
          "Chỉ xóa",
          "Chỉ lưu"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Tạo sinh."
      },
      {
        "number": 4,
        "question": "Ví dụ AI trong đời sống?",
        "options": [
          "Công tắc đèn",
          "Bút bi",
          "Máy tính bỏ túi cơ bản",
          "Gợi ý video theo lịch sử xem"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "AI trong gợi ý."
      },
      {
        "number": 5,
        "question": "Vì sao AI có thể sai nhưng tự tin?",
        "options": [
          "Cố ý nói dối",
          "Luôn đúng",
          "Tạo câu trả lời hợp lý theo mẫu, không kiểm chứng sự thật",
          "Không dùng dữ liệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giọng điệu không phản ánh độ đúng."
      },
      {
        "number": 6,
        "question": "Thông tư 02/2025/TT-BGDĐT thuộc lĩnh vực nào?",
        "options": [
          "Thuế",
          "Giao thông",
          "Xây dựng",
          "Khung năng lực số cho người học"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Khung năng lực số."
      },
      {
        "number": 7,
        "question": "Điều gì đúng về AI?",
        "options": [
          "Luôn đúng",
          "Hiểu như con người",
          "Có thể sai hoặc thiên lệch nên cần kiểm tra",
          "Không cần dữ liệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Cần người kiểm tra."
      },
      {
        "number": 8,
        "question": "Vì sao yêu cầu rõ ràng quan trọng?",
        "options": [
          "AI chỉ đọc từ đầu",
          "Giúp AI hiểu mục đích, đối tượng, định dạng",
          "Độ dài vô nghĩa",
          "Không ảnh hưởng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Kết quả sát hơn."
      },
      {
        "number": 9,
        "question": "Nguyên tắc an toàn khi dùng AI công cộng?",
        "options": [
          "Không đưa thông tin nhạy cảm",
          "Dùng tài khoản chung",
          "Nhập mật khẩu",
          "Dán hợp đồng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bảo vệ dữ liệu."
      },
      {
        "number": 10,
        "question": "Vì sao dữ liệu nhập vào công cụ công cộng là rủi ro?",
        "options": [
          "Không kiểm soát nơi lưu và sử dụng",
          "Máy chậm",
          "Đổi phông",
          "Không rủi ro"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Mất kiểm soát."
      },
      {
        "number": 11,
        "question": "Yêu cầu nào hiệu quả hơn?",
        "options": [
          "“Viết email”",
          "“Làm giúp”",
          "“Cái gì đó”",
          "Có mục đích, độ dài, giọng văn cụ thể"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cụ thể."
      },
      {
        "number": 12,
        "question": "Trước khi dán văn bản công việc vào AI công cộng?",
        "options": [
          "Dán nguyên văn",
          "Gửi đồng nghiệp trước",
          "Xóa hoặc thay thông tin nhạy cảm",
          "Thêm mật khẩu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Loại bỏ nhạy cảm."
      },
      {
        "number": 13,
        "question": "Nếu cần dùng thông tin khách hàng làm ví dụ, nên làm gì?",
        "options": [
          "Thay bằng thông tin giả",
          "Dùng thật",
          "Dùng tên thật số giả",
          "Dùng số điện thoại thật"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Ẩn danh hóa."
      },
      {
        "number": 14,
        "question": "Doanh nghiệp có quy định công cụ AI được phép, bạn nên?",
        "options": [
          "Bỏ qua",
          "Tuân thủ quy định đó",
          "Dùng công cụ bất kỳ",
          "Giấu khi dùng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Tuân thủ chính sách."
      },
      {
        "number": 15,
        "question": "Ảo giác AI là gì?",
        "options": [
          "AI từ chối",
          "Thông tin sai hoặc không có thật nhưng trình bày như đúng",
          "AI tắt",
          "Hình mờ"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Sai nhưng trôi chảy."
      },
      {
        "number": 16,
        "question": "Vì sao AI sai không báo trước?",
        "options": [
          "Cố lừa",
          "Luôn kiểm tra",
          "Không có cơ chế tự biết điều gì sai",
          "Không dùng dữ liệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Không tự phân biệt."
      },
      {
        "number": 17,
        "question": "Kiểm tra chéo là gì?",
        "options": [
          "Hỏi lại AI",
          "Hỏi AI khác cùng cách",
          "Bỏ qua",
          "Đối chiếu với nguồn đáng tin cậy độc lập"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Nguồn độc lập."
      },
      {
        "number": 18,
        "question": "Khi nào đặc biệt cần kiểm tra chéo?",
        "options": [
          "Kết quả ngắn",
          "Dùng máy mới",
          "Không bao giờ",
          "Có số liệu, trích dẫn, quy định hoặc quyết định quan trọng"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Rủi ro cao."
      },
      {
        "number": 19,
        "question": "Vì sao không tin tuyệt đối giọng tự tin?",
        "options": [
          "AI luôn sai",
          "Giọng điệu không phản ánh độ chính xác",
          "AI nói ngắn",
          "AI chỉ biết tiếng Anh"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Văn phong khác độ đúng."
      },
      {
        "number": 20,
        "question": "AI nêu con số không có trong tài liệu gốc. Nên làm gì?",
        "options": [
          "Dùng ngay",
          "Không dùng cho tới khi kiểm chứng",
          "Làm tròn rồi dùng",
          "Gửi cho khách"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Kiểm chứng trước."
      }
    ]
  },
  "M6-I": {
    "code": "M6-I",
    "title": "ỨNG DỤNG AI TRUNG CẤP",
    "domain_number": 6,
    "level": 2,
    "modules": [
      {
        "module_number": 1,
        "title": "Hiểu biết AI ứng dụng vào công việc",
        "competency_line": "Năng lực 6.1 · Bậc 3–4",
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
          "Phân tích cách một công cụ AI hoạt động trong một ứng dụng cụ thể giúp hiểu rõ giới hạn của nó: ví dụ một công cụ tóm tắt văn bản có thể xử lý tốt văn bản dưới một độ dài nhất định, nhưng bắt đầu bỏ sót thông tin khi văn bản quá dài — hiểu được giới hạn này giúp dùng công cụ hiệu quả hơn thay vì kỳ vọng sai.",
          "Phòng kế toán cần hỗ trợ hai việc khác nhau: viết email nhắc nợ khách hàng (việc văn bản) và tìm quy luật bất thường trong một bảng 2.000 dòng giao dịch (việc phân tích dữ liệu). Dùng cùng một công cụ AI trò chuyện văn bản cho cả hai việc sẽ cho kết quả tốt ở việc đầu nhưng rất hạn chế ở việc sau — công cụ này không được tối ưu để xử lý bảng dữ liệu lớn. Chọn đúng công cụ phân tích dữ liệu chuyên biệt (có thể đọc file bảng tính trực tiếp) cho việc thứ hai sẽ hiệu quả hơn nhiều."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Một nhân viên dùng cùng một công cụ AI cho mọi việc: viết thư, phân tích bảng số liệu lớn, dịch tài liệu chuyên ngành. Với thư, kết quả tốt; với bảng số liệu lớn, công cụ bị giới hạn độ dài nên bỏ sót dữ liệu mà không báo. Hiểu giới hạn của từng công cụ và chọn loại công cụ phù hợp với việc giúp tránh sai sót như vậy."
        ],
        "steps": [
          "Các ý chính. 1. Công cụ AI đa năng xử lý nhiều loại việc ở mức khá; công cụ chuyên biệt tối ưu cho một loại việc (ví dụ phân tích bảng tính, chuyển lời nói thành văn bản). 2. Mỗi công cụ có giới hạn: độ dài văn bản, định dạng tệp, độ cập nhật dữ liệu, ngôn ngữ, quy định về dữ liệu. 3. Chọn công cụ theo việc: soạn thảo, phân tích dữ liệu, tóm tắt, dịch thuật, tạo hình ảnh. 4. So sánh nhiều công cụ trên cùng một việc mẫu trước khi chọn. 5. Ghi lại kết quả so sánh để dùng lại cho bộ phận."
        ],
        "mistakes": [
          "Lỗi thường gặp. Dùng một công cụ cho mọi việc; không kiểm tra giới hạn; chọn theo quảng cáo thay vì thử trên việc thật."
        ],
        "practice": [
          "So sánh 2-3 công cụ AI khác nhau cho cùng một tác vụ công việc cụ thể (ví dụ: tóm tắt văn bản, dịch thuật, hoặc tạo nội dung). Nhận xét công cụ nào phù hợp hơn và vì sao."
        ],
        "deliverable": "Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao không nên dùng cùng một công cụ AI cho mọi loại việc?",
            "options": [
              "Không có sự khác biệt giữa các công cụ AI",
              "Mỗi công cụ được tối ưu cho loại tác vụ khác nhau, không có công cụ nào tốt nhất tuyệt đối",
              "Chỉ nên dùng công cụ đắt tiền nhất",
              "Công cụ miễn phí luôn kém hơn công cụ trả phí"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Mỗi công cụ AI có điểm mạnh riêng phù hợp với loại tác vụ khác nhau."
          },
          {
            "number": 2,
            "question": "Hiểu giới hạn của một công cụ AI (ví dụ giới hạn độ dài văn bản xử lý) có ích gì?",
            "options": [
              "Không có ích gì thực tế",
              "Giúp dùng công cụ hiệu quả hơn, tránh kỳ vọng sai",
              "Chỉ để biết thông tin kỹ thuật",
              "Không liên quan đến công việc thực tế"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Hiểu giới hạn giúp sử dụng công cụ đúng cách và đạt kết quả tốt hơn."
          },
          {
            "number": 3,
            "question": "Công cụ AI chuyên biệt khác công cụ AI đa năng như thế nào?",
            "options": [
              "Không có khác biệt gì",
              "Công cụ chuyên biệt luôn đắt hơn",
              "Công cụ chuyên biệt được tối ưu cho một loại tác vụ cụ thể",
              "Công cụ đa năng luôn tốt hơn công cụ chuyên biệt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là điểm khác biệt giúp lựa chọn công cụ phù hợp với nhu cầu."
          },
          {
            "number": 4,
            "question": "Khi cần phân tích một bảng dữ liệu lớn, nên ưu tiên loại công cụ AI nào?",
            "options": [
              "Công cụ AI chuyên viết văn bản thông thường",
              "Bất kỳ công cụ nào cũng được",
              "Không nên dùng AI cho việc này",
              "Công cụ AI chuyên phân tích dữ liệu, có thể đọc trực tiếp file bảng tính"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Công cụ chuyên biệt cho phân tích dữ liệu sẽ xử lý hiệu quả hơn công cụ đa năng."
          },
          {
            "number": 5,
            "question": "So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì?",
            "options": [
              "Giúp nhận biết công cụ nào phù hợp hơn với nhu cầu cụ thể",
              "Không có lợi ích thực tế",
              "Chỉ để tốn thời gian",
              "Luôn cho kết quả giống nhau nên không cần so sánh"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "So sánh giúp đưa ra lựa chọn công cụ có căn cứ, phù hợp nhu cầu thực tế."
          },
          {
            "number": 6,
            "question": "Vì sao không nên dùng một công cụ AI cho mọi loại việc?",
            "options": [
              "Vì chỉ một công cụ được phép tồn tại",
              "Mỗi công cụ mạnh yếu khác nhau tùy loại việc",
              "Vì công cụ nào cũng giống nhau",
              "Vì dùng nhiều công cụ luôn rẻ hơn"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Cần chọn đúng công cụ cho đúng việc."
          },
          {
            "number": 7,
            "question": "Biết giới hạn của công cụ AI có ích gì?",
            "options": [
              "Tránh giao việc vượt khả năng dẫn tới sai sót hoặc bỏ sót",
              "Làm công cụ chạy nhanh hơn",
              "Giảm giá công cụ",
              "Không có ích"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giới hạn ảnh hưởng đến độ tin cậy."
          },
          {
            "number": 8,
            "question": "Công cụ AI chuyên biệt khác công cụ đa năng thế nào?",
            "options": [
              "Làm được mọi việc tốt như nhau",
              "Luôn rẻ hơn",
              "Không dùng được cho công việc",
              "Tối ưu cho một loại việc cụ thể"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Chuyên biệt thường tốt hơn cho việc đúng chuyên môn."
          },
          {
            "number": 9,
            "question": "Cần phân tích bảng dữ liệu lớn, nên ưu tiên loại công cụ nào?",
            "options": [
              "Công cụ chỉ tạo hình ảnh",
              "Công cụ chỉ chuyển giọng nói",
              "Công cụ có khả năng xử lý và phân tích bảng dữ liệu",
              "Bất kỳ công cụ nào"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Chọn theo loại việc."
          },
          {
            "number": 10,
            "question": "So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì?",
            "options": [
              "Thấy khác biệt thực tế để chọn công cụ phù hợp",
              "Làm mất thời gian",
              "Giảm chất lượng",
              "Không có lợi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quyết định dựa trên thử nghiệm."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Sử dụng AI có đạo đức và trách nhiệm trong công việc",
        "competency_line": "Năng lực 6.2 · Bậc 3–4",
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
          "Tối ưu hóa việc sử dụng công cụ AI bao gồm việc học các tính năng nâng cao của công cụ đang dùng (lưu lại các yêu cầu hay dùng, tạo mẫu yêu cầu chuẩn cho công việc lặp lại), giúp tiết kiệm thời gian đáng kể so với việc gõ lại yêu cầu từ đầu mỗi lần.",
          "Phòng marketing cần viết mười bài giới thiệu sản phẩm ngắn cho mười sản phẩm khác nhau. Thay vì đặt riêng lẻ mười yêu cầu khác nhau, nhân viên xây một mẫu yêu cầu chuẩn (nêu rõ cấu trúc: mở đầu gây chú ý, ba điểm nổi bật, lời kêu gọi hành động, giới hạn 100 từ) và chỉ thay tên/đặc điểm sản phẩm cho mỗi lần dùng. Kết quả đồng đều hơn, thời gian rút ngắn đáng kể. Tất cả các bài đều được ghi chú nội bộ “có hỗ trợ AI trong khâu viết nháp” trước khi chuyển cho người duyệt nội dung kiểm tra lại.",
          "Các bước. 1. Dùng kỹ thuật đặt yêu cầu nâng cao: cung cấp ngữ cảnh đầy đủ, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành nhiều bước. 2. Tạo mẫu yêu cầu chuẩn cho việc lặp lại và chia sẻ trong nhóm. 3. Không đưa vào công cụ công cộng: dữ liệu cá nhân, tài liệu mật, thông tin hợp đồng, bí mật kinh doanh. 4. Ghi nguồn hoặc ghi chú khi phần đáng kể tài liệu do AI hỗ trợ tạo ra. 5. Người chịu trách nhiệm cuối cùng vẫn là người dùng kết quả; kiểm tra trước khi gửi."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Nhóm dự án muốn dùng AI để soạn đề xuất cho khách. Họ xây mẫu yêu cầu chuẩn gồm vai trò, bối cảnh, định dạng và giọng văn, dùng lại cho các đề xuất sau. Họ không đưa vào công cụ công cộng các thông tin như giá riêng của khách, hợp đồng, dữ liệu cá nhân. Văn bản gửi khách ghi chú phần có AI hỗ trợ khi đáng kể và đã được người xem xét."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không ghi chú phần AI hỗ trợ; dùng lại kết quả của AI mà không kiểm tra; đưa dữ liệu nhạy cảm vào công cụ công cộng; mỗi người một cách đặt yêu cầu."
        ],
        "practice": [
          "Dùng AI hỗ trợ một dự án nhỏ của bộ phận (ví dụ: viết loạt nội dung, tổng hợp thông tin từ nhiều nguồn, soạn thảo tài liệu). Áp dụng quy tắc bảo vệ dữ liệu phù hợp trong quá trình thao tác, và ghi chú rõ phần nào có sự hỗ trợ của AI."
        ],
        "deliverable": "Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh dùng, phần nào AI hỗ trợ).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Kỹ thuật đặt yêu cầu nâng cao ở mức trung cấp khác gì so với mức cơ bản?",
            "options": [
              "Không có gì khác biệt",
              "Cung cấp ngữ cảnh, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành các bước",
              "Chỉ cần viết ngắn gọn hơn",
              "Không cần nêu rõ mục đích sử dụng"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các kỹ thuật giúp cải thiện chất lượng kết quả AI ở mức nâng cao hơn."
          },
          {
            "number": 2,
            "question": "Vì sao nên ghi nguồn khi một phần đáng kể tài liệu được AI hỗ trợ tạo ra?",
            "options": [
              "Không cần thiết",
              "Chỉ để tuân thủ hình thức",
              "Làm chậm quá trình làm việc",
              "Minh bạch và giúp người đọc biết cần kiểm tra kỹ hơn phần nào"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là thực hành có trách nhiệm, hỗ trợ việc kiểm tra chất lượng sau này."
          },
          {
            "number": 3,
            "question": "Tạo mẫu yêu cầu chuẩn cho công việc lặp lại mang lại lợi ích gì?",
            "options": [
              "Tiết kiệm thời gian và cho kết quả đồng đều hơn so với gõ lại từ đầu mỗi lần",
              "Không có lợi ích gì",
              "Chỉ làm phức tạp thêm quy trình",
              "Chỉ phù hợp với công việc một lần"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Mẫu chuẩn giúp tăng hiệu quả cho các công việc có tính lặp lại."
          },
          {
            "number": 4,
            "question": "Loại dữ liệu nào tuyệt đối không nên đưa vào công cụ AI công cộng khi làm dự án?",
            "options": [
              "Nội dung đã công khai trên website công ty",
              "Tiêu đề bài viết chung chung",
              "Cấu trúc một bài viết mẫu",
              "Thông tin định danh khách hàng, số liệu tài chính chưa công bố"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là dữ liệu nhạy cảm cần được bảo vệ nghiêm ngặt."
          },
          {
            "number": 5,
            "question": "Sử dụng AI có trách nhiệm bao gồm điều gì?",
            "options": [
              "Cân nhắc quyền riêng tư, tính chính xác, và ghi nhận rõ phần AI hỗ trợ tạo ra",
              "Chỉ cần dùng AI càng nhiều càng tốt",
              "Không cần quan tâm đến quyền riêng tư",
              "Chỉ áp dụng khi có yêu cầu từ cấp trên"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các yếu tố cốt lõi của việc sử dụng AI có trách nhiệm trong công việc."
          },
          {
            "number": 6,
            "question": "Kỹ thuật đặt yêu cầu ở mức trung cấp khác mức cơ bản thế nào?",
            "options": [
              "Dùng câu ngắn hơn",
              "Cung cấp ngữ cảnh đầy đủ, ví dụ mẫu và chia nhỏ yêu cầu phức tạp",
              "Không nêu mục đích",
              "Chỉ nhờ AI tự quyết"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Nâng cao nghĩa là có cấu trúc và ngữ cảnh."
          },
          {
            "number": 7,
            "question": "Vì sao nên ghi nguồn khi phần đáng kể tài liệu do AI hỗ trợ?",
            "options": [
              "Để khoe công cụ",
              "Để tránh phải kiểm tra",
              "Để minh bạch và để người đọc biết cần thẩm định thêm",
              "Không cần"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Minh bạch giúp tạo niềm tin."
          },
          {
            "number": 8,
            "question": "Mẫu yêu cầu chuẩn cho việc lặp lại giúp gì?",
            "options": [
              "Kết quả nhất quán và tiết kiệm thời gian cho cả nhóm",
              "Làm kết quả ngẫu nhiên",
              "Giảm chất lượng",
              "Không có lợi"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Chuẩn hóa cách làm."
          },
          {
            "number": 9,
            "question": "Loại dữ liệu nào không nên đưa vào AI công cộng khi làm dự án?",
            "options": [
              "Câu hỏi chung chung",
              "Dữ liệu cá nhân khách hàng, hợp đồng và thông tin mật",
              "Chủ đề công khai",
              "Dữ liệu giả"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bảo vệ dữ liệu nhạy cảm."
          },
          {
            "number": 10,
            "question": "Sử dụng AI có trách nhiệm bao gồm điều gì?",
            "options": [
              "Giao hết cho AI",
              "Giấu việc dùng AI",
              "Bảo vệ dữ liệu, kiểm tra kết quả, minh bạch và chịu trách nhiệm về sản phẩm",
              "Chỉ cần dùng nhanh"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Người dùng vẫn chịu trách nhiệm."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Đánh giá công cụ AI trong công việc",
        "competency_line": "Năng lực 6.3 · Bậc 3–4",
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
          "Đưa ra nhận xét có căn cứ về hiệu quả AI đòi hỏi ghi lại số liệu cụ thể (không chỉ ấn tượng chủ quan): ví dụ “công cụ A tiết kiệm khoảng 30% thời gian so với làm thủ công, nhưng cần chỉnh sửa lại khoảng 20% nội dung trước khi dùng” là nhận xét có căn cứ hơn nhiều so với “công cụ A dùng khá ổn”.",
          "Phòng nhân sự thử nghiệm dùng AI để sàng lọc sơ yếu lý lịch ứng viên. Sau một tháng thử nghiệm, họ ghi nhận: AI tiết kiệm được khoảng 40% thời gian đọc sơ bộ, nhưng có xu hướng đánh giá thấp hơn các ứng viên có cách trình bày sơ yếu lý lịch không theo mẫu chuẩn phổ biến — một dạng thiên lệch do dữ liệu huấn luyện. Nhận ra điều này, phòng nhân sự quyết định dùng AI như bước sàng lọc sơ bộ hỗ trợ, không phải công cụ quyết định cuối cùng, và vẫn có người xem lại toàn bộ hồ sơ bị AI đánh giá thấp trước khi loại.",
          "Các bước. 1. Đánh giá bằng tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần sửa, mức nhất quán, rủi ro. 2. Thử trên mẫu việc thật và đối chiếu với kết quả của người. 3. Kiểm tra thiên lệch: dữ liệu huấn luyện có thể không đại diện đầy đủ, nhất là với bối cảnh, ngôn ngữ, văn hóa Việt Nam. 4. Với việc ảnh hưởng đến con người (tuyển dụng, đánh giá), giữ vai trò quyết định của con người. 5. Ghi lại kết quả đánh giá và cập nhật định kỳ."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Phòng nhân sự thử dùng AI sàng lọc sơ yếu lý lịch. Kết quả cho thấy công cụ ưu tiên các hồ sơ theo mẫu quen thuộc, vô tình loại những ứng viên có cách trình bày khác hoặc đến từ trường ít phổ biến. Đây là thiên lệch. Cách xử lý phù hợp: không để AI quyết định cuối cùng, người xem xét lại, kiểm tra kết quả trên nhóm hồ sơ đa dạng, và đặt tiêu chí rõ."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Đánh giá theo cảm tính; thử trên một vài ví dụ đẹp; để AI quyết định việc ảnh hưởng con người."
        ],
        "practice": [
          "Đánh giá độ chính xác/tin cậy của một kết quả AI tạo ra cho một việc công việc cụ thể. Chỉ ra điểm cần kiểm tra lại hoặc chỉnh sửa trước khi dùng chính thức."
        ],
        "deliverable": "Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Đánh giá hiệu quả AI nên dựa trên điều gì?",
            "options": [
              "Chỉ cần cảm nhận chung chung",
              "Tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần chỉnh sửa, tính nhất quán",
              "Chỉ dựa vào độ nổi tiếng của công cụ",
              "Không cần đánh giá, cứ dùng là được"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đánh giá có căn cứ cần dựa trên các tiêu chí đo lường được."
          },
          {
            "number": 2,
            "question": "Thiên lệch (bias) trong AI xuất phát từ đâu?",
            "options": [
              "Không có nguyên nhân cụ thể",
              "Dữ liệu huấn luyện không đại diện đầy đủ cho các nhóm hoặc bối cảnh khác nhau",
              "Chỉ do lỗi kỹ thuật ngẫu nhiên",
              "Chỉ xảy ra với công cụ miễn phí"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Thiên lệch phản ánh sự thiếu đại diện trong dữ liệu dùng để huấn luyện hệ thống."
          },
          {
            "number": 3,
            "question": "Vì sao cần kiểm tra thiên lệch khi áp dụng AI cho bối cảnh Việt Nam?",
            "options": [
              "Không cần thiết",
              "Chỉ cần dùng công cụ tiếng Việt là đủ",
              "Thiên lệch không ảnh hưởng đến kết quả thực tế",
              "Nhiều hệ thống AI huấn luyện chủ yếu trên dữ liệu tiếng Anh, có thể kém phù hợp với bối cảnh trong nước"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sự thiếu đại diện trong dữ liệu huấn luyện có thể ảnh hưởng đến độ phù hợp khi áp dụng vào bối cảnh cụ thể."
          },
          {
            "number": 4,
            "question": "Nhận xét nào sau đây có căn cứ hơn khi đánh giá AI?",
            "options": [
              "“Công cụ tiết kiệm 30% thời gian nhưng cần chỉnh sửa lại 20% nội dung”",
              "“Công cụ này dùng khá ổn”",
              "“Công cụ này rất tốt”",
              "“Không có ý kiến gì đặc biệt”"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Nhận xét có số liệu cụ thể mang tính căn cứ, có thể so sánh và ra quyết định dựa trên đó."
          },
          {
            "number": 5,
            "question": "Trong ví dụ sàng lọc sơ yếu lý lịch bằng AI, cách xử lý thiên lệch phù hợp là gì?",
            "options": [
              "Dùng AI như bước sàng lọc sơ bộ hỗ trợ, vẫn có người xem lại các trường hợp bị đánh giá thấp",
              "Ngừng hoàn toàn việc dùng AI",
              "Tin tưởng hoàn toàn kết quả AI",
              "Không cần điều chỉnh gì"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là cách cân bằng giữa tận dụng hiệu quả của AI và kiểm soát rủi ro thiên lệch."
          },
          {
            "number": 6,
            "question": "Đánh giá hiệu quả AI nên dựa trên gì?",
            "options": [
              "Cảm giác chung",
              "Quảng cáo của nhà cung cấp",
              "Tiêu chí cụ thể và dữ liệu thử trên việc thật",
              "Số người nói tốt"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Cần tiêu chí đo được."
          },
          {
            "number": 7,
            "question": "Thiên lệch trong AI xuất phát từ đâu?",
            "options": [
              "Từ màu giao diện",
              "Từ tốc độ mạng",
              "Từ dữ liệu và cách thiết kế chưa phản ánh đầy đủ thực tế",
              "Từ kích thước màn hình"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Dữ liệu không đại diện gây thiên lệch."
          },
          {
            "number": 8,
            "question": "Vì sao cần kiểm tra thiên lệch khi áp dụng AI ở Việt Nam?",
            "options": [
              "Vì AI chỉ hoạt động ở nước ngoài",
              "Dữ liệu huấn luyện có thể ít phản ánh bối cảnh, ngôn ngữ, văn hóa Việt Nam",
              "Vì Việt Nam không có dữ liệu",
              "Không cần kiểm tra"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bối cảnh địa phương có thể bị thiếu."
          },
          {
            "number": 9,
            "question": "Nhận xét nào có căn cứ hơn khi đánh giá AI?",
            "options": [
              "“Tôi thấy nó khá ổn”",
              "“Mọi người nói tốt”",
              "“Nhà cung cấp nói chính xác”",
              "“Trên 50 hồ sơ mẫu, AI sai 6 hồ sơ so với người đánh giá”"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Có số liệu cụ thể."
          },
          {
            "number": 10,
            "question": "Ví dụ sàng lọc hồ sơ bằng AI, cách xử lý thiên lệch phù hợp là gì?",
            "options": [
              "Giữ người xem xét kết quả và kiểm tra trên nhóm hồ sơ đa dạng",
              "Tin hoàn toàn AI",
              "Bỏ qua kết quả",
              "Dừng tuyển dụng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Giữ vai trò quyết định của con người."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M6-I — “Dự án nhỏ có AI hỗ trợ” (Assignment)",
      "context": "Bộ phận của bạn muốn thử dùng AI cho một dự án nhỏ (ví dụ soạn bộ đề xuất mẫu, tóm tắt phản hồi khách hàng, phân tích số liệu bán hàng) với yêu cầu tuân thủ quy tắc bảo vệ dữ liệu và đánh giá được độ tin cậy.",
      "requirements": "1. Chọn một dự án nhỏ thật hoặc tình huống mẫu, nêu mục tiêu và tiêu chí hoàn thành. 2. So sánh tối thiểu 2 công cụ AI trên cùng một việc mẫu, bằng bảng tiêu chí; chọn công cụ và nêu lý do (áp dụng Module 1). 3. Xây mẫu yêu cầu chuẩn, xác định dữ liệu không được đưa vào công cụ, thực hiện dự án với AI hỗ trợ; ghi chú phần AI hỗ trợ trong sản phẩm (áp dụng Module 2). 4. Đánh giá kết quả: độ chính xác trên mẫu kiểm tra, mức cần sửa, kiểm tra thiên lệch nếu liên quan; chỉ ra điểm cần chỉnh sửa (áp dụng Module 3). 5. Viết khuyến nghị: có nên mở rộng không và điều kiện.",
      "deliverables": "Bảng so sánh công cụ; mẫu yêu cầu chuẩn và danh mục dữ liệu không được đưa vào; sản phẩm dự án; báo cáo đánh giá; khuyến nghị.\nHình thức nộp. Thư mục tệp và một tài liệu mô tả ngắn.",
      "rubric": [
        "Gợi ý. Dùng dữ liệu giả hoặc đã ẩn danh. Báo cáo đánh giá cần có số liệu cụ thể, không chỉ cảm nhận.",
        "Tiêu chí",
        "Điểm",
        "So sánh và lựa chọn công cụ có căn cứ",
        "25",
        "Tuân thủ quy tắc bảo vệ dữ liệu trong quá trình thực hiện",
        "30",
        "Đánh giá kết quả AI có tiêu chí cụ thể, không chỉ cảm tính",
        "25",
        "Sản phẩm dự án hoàn chỉnh, khả dụng",
        "20"
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Vì sao không dùng một công cụ AI cho mọi việc?",
        "options": [
          "Mỗi công cụ mạnh yếu khác nhau tùy loại việc",
          "Chỉ một công cụ được phép",
          "Công cụ nào cũng giống nhau",
          "Dùng nhiều luôn rẻ hơn"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Chọn đúng công cụ."
      },
      {
        "number": 2,
        "question": "Biết giới hạn công cụ AI giúp gì?",
        "options": [
          "Chạy nhanh hơn",
          "Giảm giá",
          "Tránh giao việc vượt khả năng",
          "Không ích"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giới hạn ảnh hưởng độ tin cậy."
      },
      {
        "number": 3,
        "question": "Công cụ chuyên biệt khác đa năng ở điểm nào?",
        "options": [
          "Làm mọi việc như nhau",
          "Luôn rẻ hơn",
          "Không dùng được",
          "Tối ưu cho một loại việc cụ thể"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Chuyên biệt."
      },
      {
        "number": 4,
        "question": "Phân tích bảng dữ liệu lớn nên ưu tiên?",
        "options": [
          "Công cụ tạo hình ảnh",
          "Công cụ chuyển giọng nói",
          "Bất kỳ công cụ",
          "Công cụ xử lý và phân tích bảng dữ liệu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Theo loại việc."
      },
      {
        "number": 5,
        "question": "So sánh nhiều công cụ trên cùng việc giúp gì?",
        "options": [
          "Thấy khác biệt thực tế để chọn",
          "Mất thời gian",
          "Giảm chất lượng",
          "Không lợi"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Dựa trên thử nghiệm."
      },
      {
        "number": 6,
        "question": "Công cụ AI nào phù hợp cho việc chuyển lời nói thành văn bản?",
        "options": [
          "Công cụ chỉ tạo hình",
          "Công cụ chuyên về nhận dạng giọng nói",
          "Máy tính bỏ túi",
          "Công cụ in ấn"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Chọn theo chức năng."
      },
      {
        "number": 7,
        "question": "Khi nào nên ghi lại kết quả so sánh công cụ?",
        "options": [
          "Không cần",
          "Chỉ khi bị yêu cầu",
          "Để bộ phận dùng lại và ra quyết định nhất quán",
          "Để giấu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Chia sẻ tri thức."
      },
      {
        "number": 8,
        "question": "Kỹ thuật yêu cầu trung cấp khác cơ bản?",
        "options": [
          "Câu ngắn hơn",
          "Không nêu mục đích",
          "Để AI tự quyết",
          "Có ngữ cảnh đầy đủ, ví dụ mẫu, chia nhỏ yêu cầu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Có cấu trúc."
      },
      {
        "number": 9,
        "question": "Vì sao ghi nguồn khi AI hỗ trợ đáng kể?",
        "options": [
          "Minh bạch, người đọc biết cần thẩm định",
          "Khoe công cụ",
          "Tránh kiểm tra",
          "Không cần"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Minh bạch."
      },
      {
        "number": 10,
        "question": "Mẫu yêu cầu chuẩn giúp gì?",
        "options": [
          "Ngẫu nhiên",
          "Giảm chất lượng",
          "Kết quả nhất quán, tiết kiệm thời gian",
          "Không lợi"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Chuẩn hóa."
      },
      {
        "number": 11,
        "question": "Dữ liệu nào không đưa vào AI công cộng?",
        "options": [
          "Dữ liệu cá nhân khách hàng, hợp đồng, thông tin mật",
          "Câu hỏi chung",
          "Chủ đề công khai",
          "Dữ liệu giả"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Bảo vệ dữ liệu."
      },
      {
        "number": 12,
        "question": "Sử dụng AI có trách nhiệm gồm gì?",
        "options": [
          "Giao hết cho AI",
          "Giấu việc dùng AI",
          "Bảo vệ dữ liệu, kiểm tra, minh bạch, chịu trách nhiệm",
          "Chỉ dùng nhanh"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Người dùng chịu trách nhiệm."
      },
      {
        "number": 13,
        "question": "Ai chịu trách nhiệm cuối cùng về sản phẩm có AI hỗ trợ?",
        "options": [
          "Công cụ AI",
          "Nhà cung cấp",
          "Người dùng và công bố sản phẩm",
          "Không ai"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Người dùng chịu trách nhiệm."
      },
      {
        "number": 14,
        "question": "Nếu mỗi người đặt yêu cầu một kiểu, điều gì xảy ra?",
        "options": [
          "Chất lượng tự đồng đều",
          "Không ảnh hưởng",
          "Tiết kiệm thời gian",
          "Kết quả thiếu nhất quán"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cần mẫu chuẩn."
      },
      {
        "number": 15,
        "question": "Đánh giá hiệu quả AI dựa trên gì?",
        "options": [
          "Cảm giác",
          "Tiêu chí cụ thể và dữ liệu thử thực tế",
          "Quảng cáo",
          "Số người khen"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Đo được."
      },
      {
        "number": 16,
        "question": "Thiên lệch AI xuất phát từ đâu?",
        "options": [
          "Màu giao diện",
          "Dữ liệu và thiết kế chưa phản ánh đầy đủ thực tế",
          "Tốc độ mạng",
          "Kích thước màn hình"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Dữ liệu không đại diện."
      },
      {
        "number": 17,
        "question": "Vì sao kiểm tra thiên lệch ở Việt Nam?",
        "options": [
          "AI chỉ chạy ở nước ngoài",
          "Không có dữ liệu",
          "Không cần",
          "Dữ liệu có thể ít phản ánh bối cảnh Việt Nam"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Bối cảnh địa phương."
      },
      {
        "number": 18,
        "question": "Nhận xét nào có căn cứ hơn?",
        "options": [
          "“Tôi thấy ổn”",
          "“Trên 50 mẫu, AI sai 6 mẫu so với người đánh giá”",
          "“Mọi người khen”",
          "“Nhà cung cấp nói chính xác”"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Có số liệu."
      },
      {
        "number": 19,
        "question": "Xử lý thiên lệch khi sàng lọc hồ sơ?",
        "options": [
          "Giữ người xem xét, kiểm tra trên nhóm đa dạng",
          "Tin hoàn toàn AI",
          "Bỏ qua kết quả",
          "Dừng tuyển dụng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Con người quyết định."
      },
      {
        "number": 20,
        "question": "Với việc ảnh hưởng đến con người, ai nên ra quyết định cuối cùng?",
        "options": [
          "AI",
          "Con người có thẩm quyền",
          "Nhà cung cấp",
          "Ngẫu nhiên"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Giữ trách nhiệm."
      }
    ]
  },
  "M6-A": {
    "code": "M6-A",
    "title": "ỨNG DỤNG AI NÂNG CAO",
    "domain_number": 6,
    "level": 3,
    "modules": [
      {
        "module_number": 1,
        "title": "Đánh giá và định hướng ứng dụng AI",
        "competency_line": "Năng lực 6.1 · Bậc 5–6",
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
          "Kiểm tra giới hạn và tiềm năng của AI trong một lĩnh vực cụ thể của doanh nghiệp cần dựa trên bằng chứng — thử nghiệm thực tế, không chỉ dựa vào lời quảng cáo của nhà cung cấp công nghệ. Một cách tiếp cận có kỷ luật là: xác định rõ vấn đề, thử nghiệm AI trên quy mô nhỏ, đo lường kết quả bằng số liệu cụ thể, rồi mới quyết định mở rộng.",
          "Ban giám đốc một công ty thương mại nghe nhiều về AI tạo hình ảnh và cân nhắc đầu tư lớn để tự động hóa toàn bộ khâu thiết kế hình ảnh sản phẩm. Trước khi quyết định, bộ phận phụ trách đánh giá thực tế: thử nghiệm AI tạo hình ảnh cho 20 sản phẩm trong một tháng, đo lường tỷ lệ hình ảnh dùng được ngay (45%), tỷ lệ cần chỉnh sửa nhiều (35%), tỷ lệ không dùng được (20%), và thời gian tiết kiệm thực tế so với thuê thiết kế ngoài. Kết quả cho thấy AI phù hợp làm bước tạo bản nháp ban đầu, không thể thay thế hoàn toàn công đoạn thiết kế — một kết luận thực tế hơn nhiều so với kỳ vọng ban đầu dựa trên cường điệu công nghệ."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Doanh nghiệp bán đồ gia dụng thử dùng AI tạo hình ảnh sản phẩm để giảm chi phí chụp ảnh. Sau thử nghiệm nhỏ, kết luận thực tế là hình tạo ra phù hợp cho hình nền và bối cảnh minh họa, nhưng chưa đủ chính xác về chi tiết sản phẩm nên vẫn cần ảnh chụp thật cho trang bán hàng. Một đánh giá có kỷ luật giúp tránh cả hai thái cực: cường điệu và bác bỏ."
        ],
        "steps": [
          "Các ý chính. 1. Câu hỏi cốt lõi: AI giải quyết vấn đề kinh doanh nào, tốt hơn cách hiện tại ở điểm nào và với chi phí, rủi ro nào. 2. Cường điệu công nghệ: kỳ vọng vượt quá khả năng thực tế dưới tác động của quảng cáo và xu hướng. 3. Cách tiếp cận có kỷ luật: xác định vấn đề, đặt chỉ số, thử nghiệm nhỏ, so sánh với cơ sở hiện tại, quyết định dựa trên số liệu. 4. Xu hướng ứng dụng AI khác nhau theo ngành vì dữ liệu, quy định, rủi ro và nhu cầu khác nhau. 5. Tách việc nên thử, việc cần thận trọng và việc chưa phù hợp."
        ],
        "mistakes": [
          "Lỗi thường gặp. Bắt đầu từ công nghệ thay vì vấn đề; không có cơ sở so sánh; bỏ qua chi phí rủi ro; sao chép ứng dụng của ngành khác."
        ],
        "practice": [
          "Đánh giá một cơ hội ứng dụng AI cụ thể cho một quy trình của doanh nghiệp. Xác định rõ vấn đề cần giải quyết, đánh giá điểm phù hợp ứng dụng, và đề xuất cách thử nghiệm quy mô nhỏ trước khi mở rộng."
        ],
        "deliverable": "Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Câu hỏi cốt lõi cần trả lời trước khi ứng dụng AI vào một quy trình là gì?",
            "options": [
              "“Mọi người đang dùng AI nên chúng ta cũng nên dùng”",
              "“AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp không”",
              "“Công cụ AI nào đắt tiền nhất”",
              "“Đối thủ cạnh tranh có dùng AI không”"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là câu hỏi cốt lõi giúp tránh đầu tư theo cường điệu công nghệ."
          },
          {
            "number": 2,
            "question": "Cường điệu công nghệ (hype) là gì?",
            "options": [
              "Một loại công nghệ AI mới",
              "Một phương pháp đánh giá hiệu quả",
              "Một loại dữ liệu huấn luyện",
              "Hiện tượng một công nghệ được thổi phồng vượt quá khả năng thực tế"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đây là hiện tượng cần nhận biết để tránh quyết định đầu tư sai lệch."
          },
          {
            "number": 3,
            "question": "Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI là gì?",
            "options": [
              "Đầu tư ngay lập tức vào quy mô lớn",
              "Xác định vấn đề, thử nghiệm quy mô nhỏ, đo lường bằng số liệu, rồi mới quyết định mở rộng",
              "Chỉ dựa vào lời quảng cáo của nhà cung cấp",
              "Không cần đánh giá, cứ triển khai"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là quy trình đánh giá có bằng chứng, giảm rủi ro đầu tư sai."
          },
          {
            "number": 4,
            "question": "Trong ví dụ về AI tạo hình ảnh sản phẩm, kết luận thực tế sau thử nghiệm là gì?",
            "options": [
              "AI hoàn toàn thay thế được thiết kế viên",
              "AI hoàn toàn không có giá trị",
              "AI phù hợp làm bước tạo bản nháp ban đầu, không thay thế hoàn toàn công đoạn thiết kế",
              "Không có kết luận rõ ràng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Đây là kết luận thực tế, cân bằng dựa trên số liệu thử nghiệm, khác với kỳ vọng ban đầu."
          },
          {
            "number": 5,
            "question": "Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành?",
            "options": [
              "Mức độ trưởng thành và dễ tiếp cận của điểm ứng dụng AI khác nhau theo ngành",
              "Không có sự khác biệt nào",
              "Chỉ do sở thích của lãnh đạo doanh nghiệp",
              "AI chỉ áp dụng được cho một ngành duy nhất"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Sự khác biệt về đặc thù ngành ảnh hưởng đến mức độ và cách ứng dụng AI phù hợp."
          },
          {
            "number": 6,
            "question": "Câu hỏi cốt lõi trước khi ứng dụng AI vào quy trình là gì?",
            "options": [
              "Công cụ nào đang nổi nhất",
              "Đối thủ có dùng không",
              "Có thể quảng cáo gì",
              "AI giải quyết vấn đề nào, tốt hơn hiện tại ở đâu, chi phí và rủi ro ra sao"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Bắt đầu từ vấn đề."
          },
          {
            "number": 7,
            "question": "Cường điệu công nghệ (hype) là gì?",
            "options": [
              "Kỳ vọng vượt quá khả năng thực tế của công nghệ",
              "Công nghệ lỗi thời",
              "Công nghệ rẻ",
              "Công nghệ độc quyền"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Do quảng cáo và xu hướng."
          },
          {
            "number": 8,
            "question": "Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI?",
            "options": [
              "Đặt chỉ số, thử nghiệm nhỏ, so sánh cơ sở hiện tại, quyết định theo số liệu",
              "Làm theo xu hướng",
              "Triển khai toàn công ty ngay",
              "Chờ đối thủ làm trước"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Dựa trên bằng chứng."
          },
          {
            "number": 9,
            "question": "Ví dụ AI tạo hình sản phẩm, kết luận thực tế sau thử nghiệm là gì?",
            "options": [
              "Thay thế hoàn toàn ảnh chụp",
              "Hoàn toàn vô dụng",
              "Phù hợp cho bối cảnh minh họa nhưng chưa đủ chính xác cho chi tiết sản phẩm",
              "Không thể đánh giá"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Kết luận có sắc thái."
          },
          {
            "number": 10,
            "question": "Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành?",
            "options": [
              "Ngành nào cũng giống nhau",
              "Dữ liệu, quy định, rủi ro và nhu cầu khác nhau",
              "Do màu thương hiệu",
              "Do số nhân viên"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bối cảnh khác nhau."
          }
        ]
      },
      {
        "module_number": 2,
        "title": "Lãnh đạo ứng dụng AI có trách nhiệm",
        "competency_line": "Năng lực 6.2 · Bậc 5–6",
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
          "Rủi ro pháp lý khi dùng nội dung AI tạo cho mục đích thương mại cần được đánh giá cẩn trọng: vấn đề quyền sở hữu nội dung do AI tạo ra hiện vẫn là vùng pháp lý chưa hoàn toàn rõ ràng ở nhiều nơi, và một số công cụ AI có thể tạo ra nội dung gần giống với tài liệu có bản quyền đã tồn tại mà không có cảnh báo. Doanh nghiệp nên thận trọng khi dùng nội dung AI tạo cho các mục đích thương mại quan trọng (logo, khẩu hiệu thương hiệu chính thức) và có bước rà soát trước khi công bố chính thức.",
          "Sau vài tháng nhân viên các phòng ban tự phát dùng nhiều công cụ AI khác nhau không kiểm soát, ban giám đốc một doanh nghiệp nhận thấy rủi ro: có trường hợp một nhân viên đã dán một phần hợp đồng khách hàng vào công cụ AI công cộng để “tóm tắt cho nhanh”. Doanh nghiệp ban hành quy tắc sử dụng AI nội bộ: chỉ định hai công cụ AI đã được phê duyệt và đánh giá an toàn dữ liệu, cấm tuyệt đối đưa hợp đồng/thông tin tài chính khách hàng vào bất kỳ công cụ AI nào chưa được phê duyệt, và yêu cầu mọi nội dung công khai ra bên ngoài (bài đăng, tài liệu marketing) có hỗ trợ AI phải qua một người kiểm duyệt trước khi công bố.",
          "Các bước. 1. Soạn quy tắc sử dụng AI nội bộ: công cụ được phép, loại dữ liệu cấm đưa vào, yêu cầu kiểm tra, ghi chú phần AI hỗ trợ, người chịu trách nhiệm và cách xử lý vi phạm. 2. Xác lập trách nhiệm giải trình: người sử dụng kết quả AI chịu trách nhiệm về sản phẩm của mình. 3. Với nội dung công khai: xem xét bởi người có thẩm quyền, kiểm tra sự thật và bản quyền trước khi công bố. 4. Thận trọng với nội dung AI tạo cho mục đích thương mại quan trọng vì pháp lý về bản quyền nội dung AI tạo ra chưa ổn định. 5. Đào tạo và rà soát quy tắc định kỳ.",
          "Lưu ý: nội dung pháp lý ở đây là kiến thức nền, không phải tư vấn pháp lý; cần chuyên gia pháp lý rà soát."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Một nhân viên dán toàn bộ hợp đồng khách hàng vào công cụ AI công cộng để nhờ tóm tắt. Bài học: hợp đồng chứa thông tin mật và dữ liệu cá nhân; doanh nghiệp không kiểm soát được nơi dữ liệu lưu và sử dụng. Người lãnh đạo cần quy tắc sử dụng AI nội bộ rõ ràng, công cụ được phép dùng và quy trình xem xét trước khi công bố."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Không có quy tắc bằng văn bản; cấm tuyệt đối nhưng không cung cấp lựa chọn thay thế nên nhân viên dùng lén; công bố mà không xem xét."
        ],
        "practice": [
          "Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho bộ phận hoặc doanh nghiệp, bao gồm: công cụ được phê duyệt, dữ liệu cấm đưa vào AI, quy trình phê duyệt công cụ mới, và trách nhiệm giải trình."
        ],
        "deliverable": "Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên).",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Nguyên tắc trách nhiệm giải trình trong sử dụng AI nghĩa là gì?",
            "options": [
              "AI chịu trách nhiệm hoàn toàn về quyết định",
              "Con người vẫn chịu trách nhiệm cuối cùng về quyết định, dù có sự hỗ trợ từ AI",
              "Không ai chịu trách nhiệm khi có sai sót",
              "Trách nhiệm thuộc về nhà cung cấp công cụ AI"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là nguyên tắc quan trọng, “AI gợi ý vậy” không phải lý do biện minh hợp lệ."
          },
          {
            "number": 2,
            "question": "Quy tắc sử dụng AI nội bộ cần nêu rõ những gì?",
            "options": [
              "Công cụ được phê duyệt, dữ liệu cấm đưa vào, quy trình phê duyệt, trách nhiệm khi sai sót",
              "Chỉ cần nêu tên công cụ AI",
              "Không cần văn bản chính thức",
              "Chỉ áp dụng cho cấp quản lý"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là các nội dung cốt lõi cần có trong quy tắc sử dụng AI nội bộ."
          },
          {
            "number": 3,
            "question": "Vì sao cần thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng?",
            "options": [
              "Vấn đề quyền sở hữu nội dung AI tạo ra còn chưa hoàn toàn rõ ràng về pháp lý",
              "Không cần thận trọng gì",
              "Nội dung AI tạo luôn có bản quyền rõ ràng",
              "Chỉ cần thận trọng với nội dung miễn phí"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Đây là vùng pháp lý còn đang phát triển, cần thận trọng để tránh rủi ro."
          },
          {
            "number": 4,
            "question": "Trong ví dụ về hợp đồng khách hàng bị dán vào công cụ AI công cộng, bài học rút ra là gì?",
            "options": [
              "Không nên dùng AI nữa",
              "Chỉ cần nhắc nhở nhân viên bằng miệng",
              "Không có bài học gì đặc biệt",
              "Cần có quy tắc rõ ràng về công cụ được phép dùng và dữ liệu cấm đưa vào"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Sự cố này cho thấy cần có quy tắc chính thức thay vì để nhân viên tự phát quyết định."
          },
          {
            "number": 5,
            "question": "Nội dung công khai ra bên ngoài có hỗ trợ AI nên được xử lý như thế nào trước khi công bố?",
            "options": [
              "Công bố ngay không cần kiểm tra",
              "Qua một người kiểm duyệt trước khi công bố chính thức",
              "Chỉ cần AI tự kiểm tra",
              "Không cần quy trình gì đặc biệt"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bước kiểm duyệt con người giúp giảm rủi ro về nội dung sai lệch hoặc vi phạm bản quyền."
          },
          {
            "number": 6,
            "question": "Trách nhiệm giải trình trong sử dụng AI nghĩa là gì?",
            "options": [
              "AI chịu trách nhiệm",
              "Nhà cung cấp chịu trách nhiệm",
              "Người dùng kết quả AI chịu trách nhiệm về sản phẩm cuối cùng",
              "Không ai chịu trách nhiệm"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Trách nhiệm thuộc về con người."
          },
          {
            "number": 7,
            "question": "Quy tắc sử dụng AI nội bộ cần nêu rõ gì?",
            "options": [
              "Chỉ khẩu hiệu",
              "Chỉ tên công cụ",
              "Công cụ được phép, dữ liệu cấm đưa vào, yêu cầu kiểm tra, trách nhiệm",
              "Chỉ giờ làm việc"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Quy tắc cần đầy đủ và khả thi."
          },
          {
            "number": 8,
            "question": "Vì sao thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng?",
            "options": [
              "Vì AI luôn vi phạm",
              "Vì nội dung AI luôn kém",
              "Vì không tốn chi phí",
              "Pháp lý về bản quyền nội dung AI tạo ra chưa ổn định"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Vùng pháp lý chưa ổn định."
          },
          {
            "number": 9,
            "question": "Ví dụ hợp đồng khách hàng dán vào AI công cộng, bài học là gì?",
            "options": [
              "Hợp đồng cần ngắn hơn",
              "Không đưa thông tin mật và dữ liệu cá nhân vào công cụ chưa được kiểm soát",
              "Cần dùng công cụ nhanh hơn",
              "Không có bài học"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Bảo vệ dữ liệu."
          },
          {
            "number": 10,
            "question": "Nội dung công khai có AI hỗ trợ nên xử lý thế nào trước khi công bố?",
            "options": [
              "Xem xét bởi người có thẩm quyền, kiểm tra sự thật và bản quyền",
              "Công bố ngay",
              "Giấu việc dùng AI",
              "Để AI tự duyệt"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Có bước xem xét của con người."
          }
        ]
      },
      {
        "module_number": 3,
        "title": "Xây dựng năng lực đánh giá AI cho tổ chức",
        "competency_line": "Năng lực 6.3 · Bậc 5–6",
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
          "Phát triển hướng dẫn đánh giá không chỉ dừng ở việc chọn công cụ ban đầu — cần có cơ chế đánh giá định kỳ sau khi đã triển khai, vì cả nhu cầu của tổ chức và bản thân công nghệ AI đều thay đổi nhanh, một công cụ phù hợp hôm nay có thể không còn là lựa chọn tốt nhất sau một năm.",
          "Một doanh nghiệp cân nhắc giữa ba công cụ AI hỗ trợ chăm sóc khách hàng qua chat. Thay vì chọn theo tên tuổi thương hiệu, bộ phận phụ trách xây bảng tiêu chí có trọng số: độ chính xác khi trả lời 50 câu hỏi thường gặp thực tế của khách hàng (30%), chính sách bảo mật dữ liệu hội thoại khách hàng (30%), chi phí theo số lượng hội thoại (20%), khả năng tích hợp với hệ thống quản lý khách hàng hiện có (20%). Sau khi chấm điểm khách quan theo bảng này, họ chọn công cụ xếp thứ hai về độ chính xác nhưng có chính sách bảo mật dữ liệu rõ ràng và minh bạch nhất — một quyết định có căn cứ, không chỉ dựa vào một tiêu chí duy nhất.",
          "Các bước. 1. Xây bộ tiêu chí có hệ thống: chất lượng kết quả, bảo mật và dữ liệu, tích hợp, chi phí toàn phần, hỗ trợ, tính minh bạch, rủi ro thiên lệch. 2. Gán trọng số theo ưu tiên của doanh nghiệp. 3. Thử nghiệm có kiểm soát (pilot) trên phạm vi nhỏ trước khi áp dụng rộng. 4. Đánh giá định kỳ sau triển khai vì công cụ, dữ liệu và nhu cầu đều thay đổi. 5. Lưu hồ sơ đánh giá để minh bạch và ra quyết định nhất quán."
        ],
        "examples": [
          "Ví dụ minh họa",
          "Ví dụ trong công việc. Doanh nghiệp chọn công cụ AI cho chăm sóc khách hàng. Công cụ A có độ chính xác cao nhất nhưng không cho kiểm soát nơi lưu dữ liệu và khó tích hợp; công cụ B kém hơn một chút nhưng đáp ứng yêu cầu bảo mật, tích hợp và chi phí. Doanh nghiệp chọn B vì độ chính xác chỉ là một tiêu chí trong bộ tiêu chí có trọng số."
        ],
        "steps": [],
        "mistakes": [
          "Lỗi thường gặp. Chọn theo cảm tính hoặc chỉ theo độ chính xác; đánh giá một lần rồi bỏ; thử nghiệm không có tiêu chí."
        ],
        "practice": [
          "Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI áp dụng cho một nhu cầu cụ thể của doanh nghiệp, và thiết kế kế hoạch thử nghiệm có kiểm soát trước khi mở rộng."
        ],
        "deliverable": "Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát.",
        "quiz_questions": [
          {
            "number": 1,
            "question": "Vì sao nên xây bộ tiêu chí đánh giá có hệ thống thay vì chọn công cụ AI theo cảm tính?",
            "options": [
              "Tránh quyết định theo quảng cáo, đảm bảo lựa chọn có căn cứ khách quan",
              "Không có sự khác biệt về kết quả",
              "Chỉ để tốn thêm thời gian",
              "Không cần thiết nếu công cụ nổi tiếng"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Tiêu chí có hệ thống giúp đưa ra quyết định khách quan, có thể giải trình được."
          },
          {
            "number": 2,
            "question": "Thử nghiệm có kiểm soát (pilot) trước khi áp dụng rộng có lợi ích gì?",
            "options": [
              "Không có lợi ích cụ thể",
              "Chỉ làm chậm quá trình triển khai",
              "Giảm rủi ro nếu công cụ không phù hợp, tạo bằng chứng cụ thể để quyết định mở rộng",
              "Không cần thiết nếu đã có tiêu chí đánh giá"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Thử nghiệm nhỏ cung cấp bằng chứng thực tế trước khi đầu tư quy mô lớn."
          },
          {
            "number": 3,
            "question": "Trong ví dụ chọn công cụ AI chăm sóc khách hàng, vì sao doanh nghiệp không chọn công cụ có độ chính xác cao nhất?",
            "options": [
              "Vì đánh giá tổng thể theo nhiều tiêu chí có trọng số, không chỉ dựa vào một tiêu chí duy nhất",
              "Do nhầm lẫn trong đánh giá",
              "Vì công cụ đó đắt hơn",
              "Không có lý do cụ thể"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Quyết định dựa trên đánh giá đa tiêu chí, cân bằng giữa độ chính xác và bảo mật dữ liệu."
          },
          {
            "number": 4,
            "question": "Vì sao cần đánh giá định kỳ công cụ AI sau khi đã triển khai, không chỉ đánh giá một lần ban đầu?",
            "options": [
              "Không cần thiết một khi đã chọn xong",
              "Chỉ để tăng thêm công việc",
              "Không có lý do liên quan đến hiệu quả",
              "Nhu cầu tổ chức và công nghệ AI đều thay đổi nhanh, công cụ phù hợp hôm nay có thể không còn tốt nhất sau này"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Đánh giá định kỳ đảm bảo công cụ đang dùng vẫn là lựa chọn phù hợp nhất theo thời gian."
          },
          {
            "number": 5,
            "question": "Tiêu chí nào sau đây nên có trong bộ đánh giá công cụ AI cho tổ chức?",
            "options": [
              "Chỉ cần xem giá cả",
              "Độ chính xác, bảo mật dữ liệu, chi phí, khả năng tích hợp, chất lượng hỗ trợ kỹ thuật",
              "Chỉ cần độ nổi tiếng của thương hiệu",
              "Chỉ cần ý kiến của một người quyết định"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Đây là các tiêu chí toàn diện giúp đánh giá công cụ AI một cách khách quan và đầy đủ."
          },
          {
            "number": 6,
            "question": "Vì sao nên có bộ tiêu chí đánh giá thay vì chọn theo cảm tính?",
            "options": [
              "Để tăng giấy tờ",
              "Quyết định nhất quán, minh bạch và có căn cứ",
              "Để chậm quyết định",
              "Không có lý do"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Tiêu chí hệ thống."
          },
          {
            "number": 7,
            "question": "Thử nghiệm có kiểm soát (pilot) có lợi ích gì?",
            "options": [
              "Làm chậm dự án vô ích",
              "Thay thế đánh giá",
              "Không có lợi",
              "Phát hiện vấn đề với chi phí và rủi ro thấp trước khi mở rộng"
            ],
            "answer_letter": "D",
            "correct_index": 3,
            "explanation": "Giảm rủi ro."
          },
          {
            "number": 8,
            "question": "Trong ví dụ công cụ chăm sóc khách hàng, vì sao không chọn công cụ chính xác nhất?",
            "options": [
              "Còn các tiêu chí như bảo mật dữ liệu, tích hợp và chi phí",
              "Vì độ chính xác không quan trọng",
              "Vì công cụ đó rẻ nhất",
              "Vì cấp trên không thích"
            ],
            "answer_letter": "A",
            "correct_index": 0,
            "explanation": "Độ chính xác chỉ là một tiêu chí."
          },
          {
            "number": 9,
            "question": "Vì sao cần đánh giá định kỳ công cụ AI sau triển khai?",
            "options": [
              "Để thay công cụ liên tục",
              "Công cụ, dữ liệu và nhu cầu thay đổi theo thời gian",
              "Vì quy định bắt buộc mọi nơi",
              "Không cần"
            ],
            "answer_letter": "B",
            "correct_index": 1,
            "explanation": "Chất lượng có thể thay đổi."
          },
          {
            "number": 10,
            "question": "Tiêu chí nào nên có trong bộ đánh giá công cụ AI?",
            "options": [
              "Chỉ màu giao diện",
              "Chỉ tên thương hiệu",
              "Chất lượng kết quả, bảo mật dữ liệu, tích hợp, chi phí, rủi ro thiên lệch",
              "Chỉ số người dùng"
            ],
            "answer_letter": "C",
            "correct_index": 2,
            "explanation": "Bao quát nhiều khía cạnh."
          }
        ]
      }
    ],
    "final_task": {
      "title": "BÀI TẬP LỚN CUỐI KHÓA M6-A — “Bộ quy tắc và tiêu chí ứng dụng AI có trách nhiệm” (Assignment)",
      "context": "Bạn là người phụ trách chuyển đổi số của một doanh nghiệp vừa và nhỏ (giả định). Ban lãnh đạo muốn khuyến khích dùng AI nhưng cần kiểm soát rủi ro và chọn công cụ có căn cứ.",
      "requirements": "1. Đánh giá một cơ hội ứng dụng AI cụ thể: vấn đề kinh doanh, cách làm hiện tại làm cơ sở so sánh, kỳ vọng và phần cường điệu cần tránh, chỉ số, thiết kế thử nghiệm quy mô nhỏ, tiêu chí quyết định mở rộng hay dừng (áp dụng Module 1). 2. Soạn dự thảo quy tắc sử dụng AI có trách nhiệm (1–2 trang): công cụ được phép, dữ liệu cấm đưa vào, yêu cầu kiểm tra, ghi chú phần AI hỗ trợ, xử lý nội dung công khai, trách nhiệm giải trình, xử lý vi phạm, các điểm cần pháp lý xác nhận (áp dụng Module 2). 3. Xây bộ tiêu chí đánh giá công cụ AI có trọng số, áp dụng thử lên 2–3 công cụ giả định, nêu kế hoạch đánh giá định kỳ (áp dụng Module 3). 4. Nêu rủi ro còn lại và lộ trình triển khai.",
      "deliverables": "Bản đánh giá cơ hội và thiết kế thử nghiệm; dự thảo quy tắc; bảng tiêu chí có trọng số kèm kết quả áp dụng thử; lộ trình.\nHình thức nộp. Một tài liệu tổng hợp.",
      "rubric": [
        "Gợi ý. Dùng số liệu giả định, ghi rõ giả định. Tránh dựa vào quảng cáo của nhà cung cấp; ghi chú các nhận định pháp lý cần chuyên gia rà soát.",
        "Tiêu chí",
        "Điểm",
        "Đánh giá cơ hội ứng dụng AI có căn cứ, tránh cường điệu công nghệ",
        "30",
        "Quy tắc sử dụng AI đầy đủ, khả thi áp dụng thực tế",
        "35",
        "Bộ tiêu chí đánh giá công cụ AI có hệ thống, có trọng số",
        "35",
        "Lưu ý gửi người triển khai: Toàn bộ nội dung Miền VI (Ứng dụng AI) là nội dung mới, chưa qua thẩm định chuyên môn. Đây là lĩnh vực công nghệ biến động nhanh — nội dung cần được rà soát và cập nhật định kỳ (đề xuất tối thiểu 6 tháng/lần), đặc biệt các ví dụ về công cụ cụ thể có thể nhanh chóng lỗi thời. Nội dung về rủi ro pháp lý liên quan bản quyền nội dung AI tạo ra (Module M6-A-2) nên được rà soát bởi chuyên gia pháp lý, vì đây là vùng pháp lý chưa ổn định tại nhiều quốc gia, bao gồm Việt Nam."
      ]
    },
    "final_exam_questions": [
      {
        "number": 1,
        "question": "Điểm xuất phát của ứng dụng AI vào quy trình là gì?",
        "options": [
          "Công cụ mới nhất",
          "Vấn đề kinh doanh cần giải quyết",
          "Sở thích của người đề xuất",
          "Quảng cáo nhà cung cấp"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bắt đầu từ vấn đề."
      },
      {
        "number": 2,
        "question": "Cường điệu công nghệ là gì?",
        "options": [
          "Công nghệ lỗi thời",
          "Công nghệ rẻ",
          "Kỳ vọng vượt khả năng thực tế",
          "Công nghệ độc quyền"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Do quảng cáo."
      },
      {
        "number": 3,
        "question": "Vì sao cần cơ sở so sánh khi thử AI?",
        "options": [
          "Để tăng báo cáo",
          "Không cần",
          "Để giấu kết quả",
          "Để biết AI có tốt hơn cách làm hiện tại không"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cần đo mức cải thiện."
      },
      {
        "number": 4,
        "question": "Cách tiếp cận có kỷ luật?",
        "options": [
          "Theo xu hướng",
          "Triển khai ngay toàn công ty",
          "Chờ đối thủ",
          "Đặt chỉ số, thử nhỏ, so sánh, quyết định theo số liệu"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Dựa trên bằng chứng."
      },
      {
        "number": 5,
        "question": "Ví dụ AI tạo hình sản phẩm, kết luận là gì?",
        "options": [
          "Hợp với bối cảnh minh họa, chưa đủ chính xác cho chi tiết sản phẩm",
          "Thay hoàn toàn ảnh chụp",
          "Hoàn toàn vô dụng",
          "Không đánh giá được"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Có sắc thái."
      },
      {
        "number": 6,
        "question": "Vì sao ngành khác nhau ứng dụng khác nhau?",
        "options": [
          "Ngành nào cũng giống",
          "Do màu thương hiệu",
          "Dữ liệu, quy định, rủi ro và nhu cầu khác nhau",
          "Do số nhân viên"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Bối cảnh khác."
      },
      {
        "number": 7,
        "question": "Khi nào nên dừng một thử nghiệm AI?",
        "options": [
          "Khi có người phản đối",
          "Khi kết quả không đạt tiêu chí đã đặt trước",
          "Khi trời mưa",
          "Không bao giờ dừng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Quyết định theo tiêu chí."
      },
      {
        "number": 8,
        "question": "Trách nhiệm giải trình trong dùng AI?",
        "options": [
          "AI chịu",
          "Nhà cung cấp chịu",
          "Người dùng kết quả chịu trách nhiệm sản phẩm cuối cùng",
          "Không ai chịu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Con người chịu trách nhiệm."
      },
      {
        "number": 9,
        "question": "Quy tắc sử dụng AI nội bộ cần gì?",
        "options": [
          "Khẩu hiệu",
          "Tên công cụ",
          "Giờ làm việc",
          "Công cụ được phép, dữ liệu cấm, yêu cầu kiểm tra, trách nhiệm"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Đầy đủ và khả thi."
      },
      {
        "number": 10,
        "question": "Vì sao thận trọng với nội dung AI tạo cho thương mại quan trọng?",
        "options": [
          "Pháp lý bản quyền chưa ổn định",
          "AI luôn vi phạm",
          "AI luôn kém",
          "Không tốn chi phí"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Vùng pháp lý chưa ổn định."
      },
      {
        "number": 11,
        "question": "Bài học từ việc dán hợp đồng vào AI công cộng?",
        "options": [
          "Hợp đồng cần ngắn",
          "Không đưa thông tin mật và dữ liệu cá nhân vào công cụ chưa kiểm soát",
          "Dùng công cụ nhanh hơn",
          "Không bài học"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bảo vệ dữ liệu."
      },
      {
        "number": 12,
        "question": "Nội dung công khai có AI hỗ trợ cần gì trước khi công bố?",
        "options": [
          "Xem xét bởi người có thẩm quyền, kiểm tra sự thật và bản quyền",
          "Công bố ngay",
          "Giấu việc dùng AI",
          "AI tự duyệt"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Có người xem xét."
      },
      {
        "number": 13,
        "question": "Cấm hoàn toàn AI mà không có lựa chọn thay thế dễ dẫn đến điều gì?",
        "options": [
          "Nhân viên dùng lén ngoài kiểm soát",
          "Mọi người tuân thủ tuyệt đối",
          "Tăng bảo mật",
          "Không ảnh hưởng"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Cần lựa chọn được phê duyệt."
      },
      {
        "number": 14,
        "question": "Ai nên rà soát các điểm pháp lý trong quy tắc?",
        "options": [
          "Nhà cung cấp công cụ",
          "Người mới vào",
          "Không ai",
          "Chuyên gia pháp lý"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Cần thẩm định."
      },
      {
        "number": 15,
        "question": "Vì sao có bộ tiêu chí thay vì chọn cảm tính?",
        "options": [
          "Nhất quán, minh bạch, có căn cứ",
          "Tăng giấy tờ",
          "Chậm quyết định",
          "Không lý do"
        ],
        "answer_letter": "A",
        "correct_index": 0,
        "explanation": "Tiêu chí hệ thống."
      },
      {
        "number": 16,
        "question": "Pilot có lợi gì?",
        "options": [
          "Làm chậm vô ích",
          "Thay đánh giá",
          "Phát hiện vấn đề với chi phí thấp trước khi mở rộng",
          "Không lợi"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Giảm rủi ro."
      },
      {
        "number": 17,
        "question": "Vì sao không chọn công cụ chính xác nhất?",
        "options": [
          "Chính xác không quan trọng",
          "Công cụ đó rẻ nhất",
          "Cấp trên không thích",
          "Còn bảo mật, tích hợp, chi phí"
        ],
        "answer_letter": "D",
        "correct_index": 3,
        "explanation": "Độ chính xác chỉ là một tiêu chí."
      },
      {
        "number": 18,
        "question": "Vì sao đánh giá định kỳ sau triển khai?",
        "options": [
          "Thay công cụ liên tục",
          "Công cụ, dữ liệu và nhu cầu thay đổi",
          "Quy định bắt buộc mọi nơi",
          "Không cần"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Chất lượng thay đổi."
      },
      {
        "number": 19,
        "question": "Tiêu chí nào nên có?",
        "options": [
          "Màu giao diện",
          "Chất lượng, bảo mật dữ liệu, tích hợp, chi phí, thiên lệch",
          "Tên thương hiệu",
          "Số người dùng"
        ],
        "answer_letter": "B",
        "correct_index": 1,
        "explanation": "Bao quát."
      },
      {
        "number": 20,
        "question": "Trọng số trong bộ tiêu chí phản ánh điều gì?",
        "options": [
          "Giá công cụ",
          "Số người dùng",
          "Mức ưu tiên của doanh nghiệp",
          "Màu thương hiệu"
        ],
        "answer_letter": "C",
        "correct_index": 2,
        "explanation": "Ưu tiên khác nhau."
      }
    ]
  }
}
;

// Normalize compatibility aliases
for (const course of Object.values(CURRICULUM_DATA)) {
  course.description = course.description || course.title;
  course.finalTask = course.finalTask || course.final_task || { title: course.title, brief: '', deliverable: '', rubric: [] };
  if (!course.final_task) course.final_task = course.finalTask;
  if (!course.finalTask.brief) course.finalTask.brief = (course.final_task as any).context || course.title;
  if (!course.finalTask.deliverable) course.finalTask.deliverable = (course.final_task as any).deliverables || '';

  for (const mod of course.modules) {
    mod.moduleIndex = mod.moduleIndex ?? mod.module_number ?? 1;
    mod.module_number = mod.module_number ?? mod.moduleIndex;
    const match = (mod.competency_line || '').match(/[0-9]+\.[0-9]+/);
    mod.competencyCode = mod.competencyCode ?? (match ? match[0] : '1.1');
    mod.questions = mod.questions ?? mod.quiz_questions ?? [];
    mod.quiz_questions = mod.quiz_questions ?? mod.questions;
    for (const q of mod.questions) {
      q.questionText = q.questionText || q.question || '';
      q.question = q.question || q.questionText;
      q.correctIndex = q.correctIndex ?? q.correct_index ?? 0;
      q.correct_index = q.correct_index ?? q.correctIndex;
      q.competencyCode = q.competencyCode || mod.competencyCode;
    }
  }
}

export function getCurriculumCourse(courseCode: string): CurriculumCourse | undefined {
  const normalized = courseCode.toUpperCase().replace(/^CRS-/, '');
  const alias = normalized.startsWith('A') ? 'M' + normalized.slice(1) : normalized.startsWith('M') ? 'A' + normalized.slice(1) : normalized;
  return CURRICULUM_DATA[normalized] || CURRICULUM_DATA[alias];
}
