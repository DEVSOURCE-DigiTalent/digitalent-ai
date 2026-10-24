export interface LessonMediaSpec {
  slideCode: string;
  title: string;
  layout: 'process' | 'comparison' | 'checklist' | 'concept';
  visualPrompt: string;
  keyPoints: string[];
  videoScript: string;
}

/**
 * Bộ đặc tả thiết kế slide và kịch bản video cho toàn bộ 18 khóa học theo Thông tư 02/2025/TT-BGDĐT.
 */
export const COURSE_MEDIA_SPECS: Record<string, Record<string, LessonMediaSpec[]>> = {
  "A1-F": {
    "1.1": [
      {
        "slideCode": "A1-F/M01/S01",
        "title": "Tìm kiếm thông tin bằng từ khóa: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tìm kiếm thông tin bằng từ khóa: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được nhu cầu thông tin; Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được nhu cầu thông tin",
          "Môi trường số: không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông q",
          "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số nghĩa là xác định được nhu cầu thông tin và tìm kiếm được chúng"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.1 về Tìm kiếm thông tin bằng từ khóa. Mục tiêu chính là Xác định được nhu cầu thông tin và Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn.",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cấp trên nhắn bạn: “Tìm giúp anh mức lương tối thiểu vùng hiện tại, khu vực mình đang ở.” Hãy thực hiện: Viết từ khóa sẽ",
          "Sản phẩm nộp: Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn chính thức tìm được."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.2": [
      {
        "slideCode": "A1-F/M02/S01",
        "title": "Nhận biết nguồn tin đáng tin cậy: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Nhận biết nguồn tin đáng tin cậy: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số",
          "Thông tin: dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quy",
          "Đánh giá dữ liệu, thông tin và nội dung số nghĩa là phát hiện được độ tin cậy và độ chính xác của các nguồn chung. Thông"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.2 về Nhận biết nguồn tin đáng tin cậy. Mục tiêu chính là Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng xếp hạng 5 nguồn kèm lý do..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cho năm kết quả tìm kiếm về cùng một chủ đề (ví dụ quy mô thị trường bán lẻ Việt Nam), hãy xếp hạng theo độ tin cậy (1 l",
          "Sản phẩm nộp: Bảng xếp hạng 5 nguồn kèm lý do."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.3": [
      {
        "slideCode": "A1-F/M03/S01",
        "title": "Lưu trữ và sắp xếp tài liệu: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Lưu trữ và sắp xếp tài liệu: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số; Nhận biết được nơi để sắp xếp chúng một cách đơn giản trong môi trường có cấu trúc. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số",
          "Dữ liệu: những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hi",
          "Quản lý dữ liệu, thông tin và nội dung số nghĩa là xác định được cách tổ chức, lưu trữ và truy xuất chúng một cách đơn g"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.3 về Lưu trữ và sắp xếp tài liệu. Mục tiêu chính là Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số và Nhận biết được nơi để sắp xếp chúng một cách đơn giản trong môi trường có cấu trúc. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tìm và tải ba tài liệu (PDF hoặc Excel) về một chủ đề công việc tự chọn. Tạo một thư mục mới đặt tên rõ ràng, đổi tên cả",
          "Sản phẩm nộp: Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A1-I": {
    "1.1": [
      {
        "slideCode": "A1-I/M01/S01",
        "title": "Chiến lược tìm kiếm và toán tử: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chiến lược tìm kiếm và toán tử: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Minh họa được nhu cầu thông tin; Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Minh họa được nhu cầu thông tin",
          "Môi trường số: không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông q",
          "Ở mức trung cấp, việc tổ chức tìm kiếm dữ liệu và mô tả cách truy cập, điều hướng đòi hỏi trước tiên minh họa rõ nhu cầu"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.1 về Chiến lược tìm kiếm và toán tử. Mục tiêu chính là Minh họa được nhu cầu thông tin và Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tìm văn bản quy định chính thức về một chủ đề (ví dụ an toàn thực phẩm, bảo vệ dữ liệu cá nhân), dạng PDF, ban hành tron",
          "Sản phẩm nộp: Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.2": [
      {
        "slideCode": "A1-I/M02/S01",
        "title": "Đánh giá và so sánh nguồn tin: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đánh giá và so sánh nguồn tin: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số; Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số",
          "Thông tin: dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quy",
          "Ở mức trung cấp, việc thực hiện phân tích, so sánh và đánh giá độ tin cậy của nguồn dữ liệu đã được tổ chức rõ ràng đòi"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.2 về Đánh giá và so sánh nguồn tin. Mục tiêu chính là Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số và Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cấp trên cần một con số cho slide, ví dụ “số lượng doanh nghiệp vừa và nhỏ tại Việt Nam.” Tìm ba nguồn khác nhau, lập bả",
          "Sản phẩm nộp: Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.3": [
      {
        "slideCode": "A1-I/M03/S01",
        "title": "Tổ chức và quản lý khối lượng thông tin lớn: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tổ chức và quản lý khối lượng thông tin lớn: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất; Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất",
          "Dữ liệu: những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hi",
          "Ở mức trung cấp, việc sắp xếp thông tin để dễ lưu trữ và tổ chức trong môi trường có cấu trúc mở rộng sang quản lý khối"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.3 về Tổ chức và quản lý khối lượng thông tin lớn. Mục tiêu chính là Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất và Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cho một thư mục hỗn độn gồm nhiều loại tài liệu (hợp đồng, hóa đơn, ghi chú họp, báo cáo, hình ảnh). Thiết kế cấu trúc t",
          "Sản phẩm nộp: Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A1-A": {
    "1.1": [
      {
        "slideCode": "A1-A/M01/S01",
        "title": "Nghiên cứu phức hợp đa nguồn: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Nghiên cứu phức hợp đa nguồn: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá được nhu cầu thông tin; Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá được nhu cầu thông tin",
          "Môi trường số: không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông q",
          "Ở mức nâng cao, việc đánh giá nhu cầu thông tin và điều chỉnh chiến lược tìm kiếm phù hợp nhất trong bối cảnh phức tạp đ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.1 về Nghiên cứu phức hợp đa nguồn. Mục tiêu chính là Đánh giá được nhu cầu thông tin và Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Doanh nghiệp cân nhắc một quyết định kinh doanh quan trọng. Xây kế hoạch nghiên cứu theo khung bốn bước, thu thập bằng c",
          "Sản phẩm nộp: Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.2": [
      {
        "slideCode": "A1-A/M02/S01",
        "title": "Đánh giá chất lượng dữ liệu: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đánh giá chất lượng dữ liệu: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số; Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số",
          "Thông tin: dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quy",
          "Ở mức nâng cao, việc đánh giá có tính phê phán độ tin cậy và độ chính xác của nguồn dữ liệu mở rộng thành đánh giá chất"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.2 về Đánh giá chất lượng dữ liệu. Mục tiêu chính là Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số và Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cho một tập dữ liệu khách hàng thật của doanh nghiệp, hãy chấm điểm cả sáu chiều bằng số liệu cụ thể (ví dụ tính phần tr",
          "Sản phẩm nộp: Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "1.3": [
      {
        "slideCode": "A1-A/M03/S01",
        "title": "Quản trị dữ liệu và vòng đời thông tin: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản trị dữ liệu và vòng đời thông tin: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 1.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ; Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ",
          "Dữ liệu: những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hi",
          "Ở mức nâng cao, việc điều chỉnh quản lý thông tin và tổ chức môi trường có cấu trúc phù hợp nhất trong bối cảnh phức tạp"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 1.3 về Quản trị dữ liệu và vòng đời thông tin. Mục tiêu chính là Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ và Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A1-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (1.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịc.",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Hai bộ phận trong doanh nghiệp báo cáo số khách hàng khác nhau mỗi tháng, gây tranh cãi liên tục. Xây từ điển dữ liệu tố",
          "Sản phẩm nộp: Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịch lưu trữ."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 1.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A2-F": {
    "2.1": [
      {
        "slideCode": "A2-F/M01/S01",
        "title": "Công cụ giao tiếp cơ bản: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Công cụ giao tiếp cơ bản: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Lựa chọn được các công nghệ số đơn giản để tương tác; Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Lựa chọn được các công nghệ số đơn giản để tương tác",
          "Phương tiện giao tiếp số: các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công n",
          "Tương tác thông qua công nghệ số nghĩa là dùng các công cụ số (email, ứng dụng nhắn tin, họp trực tuyến) để trao đổi với"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.1 về Công cụ giao tiếp cơ bản. Mục tiêu chính là Lựa chọn được các công nghệ số đơn giản để tương tác và Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: 3 email mẫu và ghi chú cuộc họp..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Soạn ba email cho ba tình huống khác nhau: xin thông tin từ đồng nghiệp, báo cáo tiến độ công việc cho cấp trên, và xin",
          "Sản phẩm nộp: 3 email mẫu và ghi chú cuộc họp."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.2": [
      {
        "slideCode": "A2-F/M02/S01",
        "title": "Chia sẻ tài liệu và thông tin: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chia sẻ tài liệu và thông tin: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số; Nhận biết được tham chiếu và ghi chú nguồn cơ bản. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Quyền xem: chỉ đọc, không thể thay đổi nội dung"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.2 về Chia sẻ tài liệu và thông tin. Mục tiêu chính là Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số và Nhận biết được tham chiếu và ghi chú nguồn cơ bản. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Ảnh chụp cài đặt chia sẻ đúng nguyên tắc..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chia sẻ một thư mục với một đồng nghiệp ở mức chỉ xem, và chụp lại màn hình cài đặt chia sẻ.",
          "Sản phẩm nộp: Ảnh chụp cài đặt chia sẻ đúng nguyên tắc."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.3": [
      {
        "slideCode": "A2-F/M03/S01",
        "title": "Dịch vụ công trực tuyến: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Dịch vụ công trực tuyến: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội; Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội",
          "Dịch vụ số: các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Sử dụng công nghệ số để thực hiện trách nhiệm công dân nghĩa là tham gia vào xã hội thông qua các dịch vụ số công cộng v"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.3 về Dịch vụ công trực tuyến. Mục tiêu chính là Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội và Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng tóm tắt thủ tục kèm đường dẫn chính thức..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tra cứu một thủ tục hành chính liên quan đến doanh nghiệp trên cổng chính thức và ghi lại các bước cùng giấy tờ cần có.",
          "Sản phẩm nộp: Bảng tóm tắt thủ tục kèm đường dẫn chính thức."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.4": [
      {
        "slideCode": "A2-F/M04/S01",
        "title": "Làm việc nhóm trên công cụ số: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Làm việc nhóm trên công cụ số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác",
          "Tài liệu dùng chung: tài liệu trực tuyến nhiều người có thể xem hoặc chỉnh sửa đồng thời",
          "Hợp tác thông qua công nghệ số nghĩa là dùng các công cụ số cho quá trình làm việc chung ,  tài liệu dùng chung cho phép"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.4 về Làm việc nhóm trên công cụ số. Mục tiêu chính là Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Tài liệu nhóm có lịch sử chỉnh sửa và bình luận..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cùng một hoặc hai người khác hoàn thành một tài liệu dùng chung, mỗi người phụ trách một phần, sử dụng bình luận để trao",
          "Sản phẩm nộp: Tài liệu nhóm có lịch sử chỉnh sửa và bình luận."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.5": [
      {
        "slideCode": "A2-F/M05/S01",
        "title": "Ứng xử trên môi trường số: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Ứng xử trên môi trường số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.5. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số; Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số",
          "Nghi thức số: tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng I",
          "Nghi thức số là tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.5 về Ứng xử trên môi trường số. Mục tiêu chính là Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số và Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M05/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng 5 tin nhắn trước và sau kèm giải thích..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Cho năm tin nhắn công việc có vấn đề về văn phong, viết lại cho phù hợp và giải thích điều chỉnh.",
          "Sản phẩm nộp: Bảng 5 tin nhắn trước và sau kèm giải thích."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.5. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.6": [
      {
        "slideCode": "A2-F/M06/S01",
        "title": "Danh tính số cá nhân: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Danh tính số cá nhân: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.6. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được danh tính số; Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được danh tính số",
          "Danh tính số: tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác,",
          "Danh tính số là tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khá"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.6 về Danh tính số cá nhân. Mục tiêu chính là Xác định được danh tính số và Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-F/M06/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tự tra cứu tên mình trên công cụ tìm kiếm, liệt kê những gì công khai, rà soát và điều chỉnh cài đặt riêng tư của một tà",
          "Sản phẩm nộp: Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.6. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A2-I": {
    "2.1": [
      {
        "slideCode": "A2-I/M01/S01",
        "title": "Giao tiếp hiệu quả theo tình huống: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Giao tiếp hiệu quả theo tình huống: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Lựa chọn được nhiều công nghệ số để tương tác; Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Lựa chọn được nhiều công nghệ số để tương tác",
          "Phương tiện giao tiếp số: các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công n",
          "Ở mức trung cấp, việc chọn phương tiện giao tiếp số cần dựa trên ba yếu tố: độ khẩn (cần trả lời ngay hay có thể chờ), đ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.1 về Giao tiếp hiệu quả theo tình huống. Mục tiêu chính là Lựa chọn được nhiều công nghệ số để tương tác và Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: 3 email kèm giải trình chiến lược giao tiếp..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Viết ba email khó: từ chối yêu cầu của cấp trên, thúc tiến độ đối tác, và thông báo tin không tốt cho khách hàng. Với mỗ",
          "Sản phẩm nộp: 3 email kèm giải trình chiến lược giao tiếp."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.2": [
      {
        "slideCode": "A2-I/M02/S01",
        "title": "Chia sẻ thông tin có kiểm soát: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chia sẻ thông tin có kiểm soát: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số; Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Phân loại thông tin: việc gán một tài liệu vào một trong các mức nhạy cảm để xác định cách xử lý phù hợp"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.2 về Chia sẻ thông tin có kiểm soát. Mục tiêu chính là Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số và Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng phân loại tài liệu, bảng quyền, lịch rà soát..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Phân loại 10 loại tài liệu của doanh nghiệp theo bốn mức, thiết lập quyền tương ứng cho từng mức và lập lịch rà soát.",
          "Sản phẩm nộp: Bảng phân loại tài liệu, bảng quyền, lịch rà soát."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.3": [
      {
        "slideCode": "A2-I/M03/S01",
        "title": "Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Lựa chọn được các dịch vụ số để tham gia vào xã hội; Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Lựa chọn được các dịch vụ số để tham gia vào xã hội",
          "Dịch vụ số: các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Ở mức trung cấp, việc sử dụng dịch vụ số để tham gia xã hội mở rộng sang phạm vi công việc ,  thực hiện thủ tục hành chín"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.3 về Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp. Mục tiêu chính là Lựa chọn được các dịch vụ số để tham gia vào xã hội và Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Quy trình thủ tục dạng các bước và danh mục kiểm tra..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Lập quy trình chi tiết cho một thủ tục trực tuyến mà bộ phận thường xuyên thực hiện, kèm danh mục hồ sơ cần có và các đi",
          "Sản phẩm nộp: Quy trình thủ tục dạng các bước và danh mục kiểm tra."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.4": [
      {
        "slideCode": "A2-I/M04/S01",
        "title": "Điều phối công việc nhóm: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Điều phối công việc nhóm: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác",
          "Quy ước nhóm (team norms): các thỏa thuận chung về cách thức làm việc, kênh giao tiếp, thời gian phản hồi trong nhóm",
          "Ở mức trung cấp, việc hợp tác qua công nghệ số cần lựa chọn công cụ phù hợp một cách có chủ đích hơn cho từng quy trình"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.4 về Điều phối công việc nhóm. Mục tiêu chính là Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Không gian làm việc nhóm và bản quy ước nhóm..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Thiết lập không gian làm việc cho một dự án thật của bộ phận: bảng công việc, cấu trúc tài liệu, và quy ước nhóm bằng vă",
          "Sản phẩm nộp: Không gian làm việc nhóm và bản quy ước nhóm."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.5": [
      {
        "slideCode": "A2-I/M05/S01",
        "title": "Chuẩn mực ứng xử và xử lý tình huống khó: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chuẩn mực ứng xử và xử lý tình huống khó: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.5. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số; Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số",
          "Nghi thức số: tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng I",
          "Ở mức trung cấp, việc thực hiện nghi thức số cần mở rộng sang bối cảnh đa văn hóa và tình huống khó xử lý hơn. Khi giao"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.5 về Chuẩn mực ứng xử và xử lý tình huống khó. Mục tiêu chính là Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số và Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M05/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản phản hồi khách hàng và dự thảo quy tắc ứng xử..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Soạn phản hồi công khai cho một đánh giá tiêu cực của khách hàng, và soạn dự thảo quy tắc ứng xử số 1 trang cho bộ phận.",
          "Sản phẩm nộp: Bản phản hồi khách hàng và dự thảo quy tắc ứng xử."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.5. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.6": [
      {
        "slideCode": "A2-I/M06/S01",
        "title": "Quản lý danh tính nghề nghiệp: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản lý danh tính nghề nghiệp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.6. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Hiển thị được nhiều danh tính số cụ thể; Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Hiển thị được nhiều danh tính số cụ thể",
          "Danh tính số: tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác,",
          "Ở mức trung cấp, việc quản lý danh tính số mở rộng sang hình ảnh nghề nghiệp ,  xây dựng hồ sơ nghề nghiệp trực tuyến nhấ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.6 về Quản lý danh tính nghề nghiệp. Mục tiêu chính là Hiển thị được nhiều danh tính số cụ thể và Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-I/M06/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Rà soát toàn bộ hiện diện trực tuyến của bản thân, lập danh sách nội dung cần điều chỉnh, và cập nhật hồ sơ nghề nghiệp",
          "Sản phẩm nộp: Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.6. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A2-A": {
    "2.1": [
      {
        "slideCode": "A2-A/M01/S01",
        "title": "Chiến lược giao tiếp tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chiến lược giao tiếp tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất; Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất",
          "Phương tiện giao tiếp số: các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công n",
          "Ở mức nâng cao, việc thích nghi công nghệ số và phương tiện giao tiếp không còn chỉ ở phạm vi cá nhân mà mở rộng ra cấp"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.1 về Chiến lược giao tiếp tổ chức. Mục tiêu chính là Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất và Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Kế hoạch truyền thông thay đổi..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây kế hoạch truyền thông nội bộ cho một thay đổi lớn trong doanh nghiệp (đổi quy trình, sáp nhập bộ phận, hoặc triển kh",
          "Sản phẩm nộp: Kế hoạch truyền thông thay đổi."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.2": [
      {
        "slideCode": "A2-A/M02/S01",
        "title": "Quản trị luồng chia sẻ thông tin: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản trị luồng chia sẻ thông tin: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung; Thích ứng được vai trò trung gian của mình. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Phân quyền theo vai trò (role-based access): cấp quyền truy cập dựa trên chức năng công việc của một vai trò, thay vì cấ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.2 về Quản trị luồng chia sẻ thông tin. Mục tiêu chính là Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung và Thích ứng được vai trò trung gian của mình. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Ma trận phân quyền, sổ rủi ro, quy trình ứng phó..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây mô hình phân quyền theo vai trò cho doanh nghiệp (tối thiểu bốn vai trò × năm nhóm dữ liệu), một sổ rủi ro sáu mục,",
          "Sản phẩm nộp: Ma trận phân quyền, sổ rủi ro, quy trình ứng phó."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.3": [
      {
        "slideCode": "A2-A/M03/S01",
        "title": "Doanh nghiệp trong môi trường số công cộng: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Doanh nghiệp trong môi trường số công cộng: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội; Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội",
          "Dịch vụ số: các dịch vụ được cung cấp thông qua phương tiện giao tiếp số",
          "Ở mức nâng cao, việc tham gia xã hội qua công nghệ số mở rộng thành trách nhiệm của cả doanh nghiệp trong môi trường số"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.3 về Doanh nghiệp trong môi trường số công cộng. Mục tiêu chính là Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội và Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Lập bản đồ nghĩa vụ số của doanh nghiệp, xác định ba rủi ro tuân thủ lớn nhất và đề xuất biện pháp.",
          "Sản phẩm nộp: Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.4": [
      {
        "slideCode": "A2-A/M04/S01",
        "title": "Dẫn dắt cộng tác nhóm phân tán: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Dẫn dắt cộng tác nhóm phân tán: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác; Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác",
          "Nhóm phân tán: nhóm làm việc mà các thành viên không cùng một địa điểm, có thể khác múi giờ",
          "Ở mức nâng cao, việc hợp tác qua công nghệ số cần chọn công cụ thích hợp nhất để cùng xây dựng và đồng sáng tạo dữ liệu,"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.4 về Dẫn dắt cộng tác nhóm phân tán. Mục tiêu chính là Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác và Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Thiết kế lại một quy trình liên bộ phận đang có vấn đề, chỉ ra điểm mất thông tin và đề xuất cơ chế khắc phục.",
          "Sản phẩm nộp: Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.5": [
      {
        "slideCode": "A2-A/M05/S01",
        "title": "Văn hóa ứng xử số và xử lý khủng hoảng: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Văn hóa ứng xử số và xử lý khủng hoảng: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.5. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số; Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số",
          "Nghi thức số: tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng I",
          "Ở mức nâng cao, nghi thức số cần được điều chỉnh phù hợp nhất trong bối cảnh phức tạp ,  tức là trở thành văn hóa thực hà"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.5 về Văn hóa ứng xử số và xử lý khủng hoảng. Mục tiêu chính là Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số và Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M05/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.5). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Kịch bản ứng phó khủng hoảng và bộ thông điệp..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Diễn tập xử lý một khủng hoảng truyền thông: xây kịch bản phản ứng 24 giờ đầu, phân vai xử lý, soạn thông điệp cho từng",
          "Sản phẩm nộp: Kịch bản ứng phó khủng hoảng và bộ thông điệp."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.5. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "2.6": [
      {
        "slideCode": "A2-A/M06/S01",
        "title": "Danh tính số của tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Danh tính số của tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 2.6. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được nhiều danh tính số; Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được nhiều danh tính số",
          "Danh tính số: tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác,",
          "Ở mức nâng cao, việc quản lý danh tính số mở rộng thành quản lý danh tính số của cả tổ chức ,  kiểm kê hiện diện số của d"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 2.6 về Danh tính số của tổ chức. Mục tiêu chính là Phân biệt được nhiều danh tính số và Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A2-A/M06/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (2.6). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Báo cáo kiểm kê hiện diện số và chính sách phát ngôn..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Kiểm kê toàn bộ hiện diện số của doanh nghiệp, phát hiện điểm không nhất quán hoặc rủi ro, và soạn chính sách phát ngôn",
          "Sản phẩm nộp: Báo cáo kiểm kê hiện diện số và chính sách phát ngôn."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 2.6. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A3-F": {
    "3.1": [
      {
        "slideCode": "A3-F/M01/S01",
        "title": "Tạo tài liệu công việc cơ bản: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tạo tài liệu công việc cơ bản: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản; Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Định dạng văn bản: cách trình bày chữ (tiêu đề, đoạn, danh sách, in đậm) giúp người đọc dễ theo dõi nội dung"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.1 về Tạo tài liệu công việc cơ bản. Mục tiêu chính là Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản và Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: 3 tệp kèm giải thích lựa chọn định dạng..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tạo ba tài liệu cho cùng một nội dung công việc: một văn bản, một bảng tính, một trình chiếu ,  và giải thích khi nào dùn",
          "Sản phẩm nộp: 3 tệp kèm giải thích lựa chọn định dạng."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.2": [
      {
        "slideCode": "A3-F/M02/S01",
        "title": "Chỉnh sửa và tái sử dụng nội dung: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chỉnh sửa và tái sử dụng nội dung: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo",
          "Tri thức: sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Tích hợp và tạo lập lại nội dung số nghĩa là sửa đổi, tinh chỉnh nội dung có sẵn để tạo ra nội dung mới. Khi nhận một tà"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.2 về Chỉnh sửa và tái sử dụng nội dung. Mục tiêu chính là Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Tài liệu hoàn chỉnh theo mẫu và bản PDF..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Nhận một tài liệu thô, chỉnh sửa theo mẫu của doanh nghiệp, chèn một bảng số liệu và một hình ảnh, rồi xuất PDF.",
          "Sản phẩm nộp: Tài liệu hoàn chỉnh theo mẫu và bản PDF."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.3": [
      {
        "slideCode": "A3-F/M03/S01",
        "title": "Nguyên tắc bản quyền cơ bản: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Nguyên tắc bản quyền cơ bản: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số",
          "Bản quyền: quyền pháp lý bảo vệ tác phẩm sáng tạo (hình ảnh, văn bản, âm nhạc) khỏi việc sử dụng trái phép",
          "Thực thi bản quyền và giấy phép nghĩa là hiểu được cách áp dụng bản quyền cho nội dung số. Bản quyền bảo vệ hầu hết các"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.3 về Nguyên tắc bản quyền cơ bản. Mục tiêu chính là Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng 5 hình ảnh kèm nguồn và loại giấy phép..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Tìm năm hình ảnh phù hợp cho một tài liệu công việc từ nguồn được phép sử dụng thương mại, ghi rõ giấy phép của từng hìn",
          "Sản phẩm nộp: Bảng 5 hình ảnh kèm nguồn và loại giấy phép."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.4": [
      {
        "slideCode": "A3-F/M04/S01",
        "title": "Làm quen tư duy tính toán: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Làm quen tư duy tính toán: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản",
          "Bước tuần tự: các hành động được thực hiện theo thứ tự cố định để hoàn thành một công việc",
          "Lập trình ở mức cơ bản nghĩa là liệt kê được các hướng dẫn đơn giản cho hệ thống máy tính. Chia một công việc thành các"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.4 về Làm quen tư duy tính toán. Mục tiêu chính là Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-F/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Viết ra quy trình một công việc hàng ngày của mình thành các bước rõ ràng, chỉ ra bước nào có điều kiện và bước nào lặp",
          "Sản phẩm nộp: Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A3-I": {
    "3.1": [
      {
        "slideCode": "A3-I/M01/S01",
        "title": "Sản xuất nội dung đa định dạng: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Sản xuất nội dung đa định dạng: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau; Thể hiện được bản thân thông qua việc tạo ra các phương tiện số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Bộ nhận diện (brand identity): tập hợp các yếu tố hình ảnh (màu sắc, phông chữ, logo) tạo nên sự nhất quán cho thương hi"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.1 về Sản xuất nội dung đa định dạng. Mục tiêu chính là Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau và Thể hiện được bản thân thông qua việc tạo ra các phương tiện số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bộ 3 sản phẩm nội dung cho 3 kênh..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chuyển một nội dung công việc thành ba định dạng cho ba kênh khác nhau, giữ nhất quán về nhận diện.",
          "Sản phẩm nộp: Bộ 3 sản phẩm nội dung cho 3 kênh."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.2": [
      {
        "slideCode": "A3-I/M02/S01",
        "title": "Tích hợp và chuyển đổi nội dung: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tích hợp và chuyển đổi nội dung: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo",
          "Tri thức: sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Ở mức trung cấp, việc tích hợp và tạo lập lại nội dung cần tổng hợp từ nhiều nguồn thành sản phẩm mới, đưa tri thức (sự"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.2 về Tích hợp và chuyển đổi nội dung. Mục tiêu chính là Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bộ mẫu tài liệu và sản phẩm tạo hàng loạt..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây một bộ mẫu tài liệu cho bộ phận (tối thiểu 3 mẫu) và tạo tài liệu hàng loạt từ một danh sách dữ liệu.",
          "Sản phẩm nộp: Bộ mẫu tài liệu và sản phẩm tạo hàng loạt."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.3": [
      {
        "slideCode": "A3-I/M03/S01",
        "title": "Bản quyền, giấy phép và sử dụng hợp pháp: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Bản quyền, giấy phép và sử dụng hợp pháp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số",
          "Miền công cộng (public domain): tác phẩm không còn hoặc chưa từng thuộc bản quyền của riêng ai, có thể tự do sử dụng",
          "Ở mức trung cấp, việc áp dụng quy tắc bản quyền và giấy phép cần chi tiết hơn ,  phân biệt các loại giấy phép phổ biến kh"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.3 về Bản quyền, giấy phép và sử dụng hợp pháp. Mục tiêu chính là Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây danh mục kiểm tra bản quyền cho quy trình xuất bản nội dung của bộ phận, áp dụng thử lên ba sản phẩm nội dung đã có.",
          "Sản phẩm nộp: Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.4": [
      {
        "slideCode": "A3-I/M04/S01",
        "title": "Tự động hóa công việc lặp lại: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tự động hóa công việc lặp lại: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể",
          "Hàm tra cứu (lookup function): công thức bảng tính tự động tìm và lấy giá trị tương ứng từ một bảng dữ liệu khác",
          "Ở mức trung cấp, việc liệt kê hướng dẫn cho hệ thống máy tính giải quyết vấn đề cụ thể mở rộng sang tự động hóa công việ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.4 về Tự động hóa công việc lặp lại. Mục tiêu chính là Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-I/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chọn một công việc lặp lại trong bộ phận, phân rã thành các bước, tự động hóa ít nhất một bước và đo thời gian tiết kiệm",
          "Sản phẩm nộp: Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A3-A": {
    "3.1": [
      {
        "slideCode": "A3-A/M01/S01",
        "title": "Chiến lược và hệ thống sản xuất nội dung: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chiến lược và hệ thống sản xuất nội dung: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thay đổi được nội dung bằng các định dạng phù hợp nhất; Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thay đổi được nội dung bằng các định dạng phù hợp nhất",
          "Hiểu đúng thuật ngữ và yêu cầu nghiệp vụ theo quy chuẩn",
          "Chân dung đối tượng (persona): hồ sơ mô tả đặc điểm, nhu cầu của một nhóm khách hàng hoặc đối tượng mục tiêu điển hình"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.1 về Chiến lược và hệ thống sản xuất nội dung. Mục tiêu chính là Thay đổi được nội dung bằng các định dạng phù hợp nhất và Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây chiến lược nội dung một quý cho doanh nghiệp: mục tiêu, đối tượng, chủ đề, kênh, lịch sản xuất, chỉ số đo lường.",
          "Sản phẩm nộp: Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.2": [
      {
        "slideCode": "A3-A/M02/S01",
        "title": "Quản trị và tái sử dụng tài sản nội dung: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản trị và tái sử dụng tài sản nội dung: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo",
          "Tri thức: sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm",
          "Ở mức nâng cao, việc đánh giá cách phù hợp nhất để tích hợp nội dung mới vào tri thức hiện có đòi hỏi xây dựng hệ thống"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.2 về Quản trị và tái sử dụng tài sản nội dung. Mục tiêu chính là Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Thiết kế thư viện nội dung và quy trình vận hành..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Thiết kế thư viện tài sản nội dung cho doanh nghiệp, gồm cấu trúc phân loại, quy ước gắn thẻ và quy trình rà soát định k",
          "Sản phẩm nộp: Thiết kế thư viện nội dung và quy trình vận hành."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.3": [
      {
        "slideCode": "A3-A/M03/S01",
        "title": "Quản trị rủi ro pháp lý về nội dung: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản trị rủi ro pháp lý về nội dung: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số",
          "Sở hữu trí tuệ: quyền pháp lý đối với các sáng tạo trí tuệ như tác phẩm, thiết kế, nhãn hiệu",
          "Ở mức nâng cao, việc chọn quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép mở rộng thành quản trị rủi ro pháp lý c"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.3 về Quản trị rủi ro pháp lý về nội dung. Mục tiêu chính là Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Rà soát rủi ro pháp lý cho toàn bộ kho nội dung đang sử dụng, soạn chính sách sở hữu trí tuệ nội bộ và điều khoản mẫu ch",
          "Sản phẩm nộp: Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "3.4": [
      {
        "slideCode": "A3-A/M04/S01",
        "title": "Thiết kế giải pháp số cho nghiệp vụ: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Thiết kế giải pháp số cho nghiệp vụ: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 3.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể",
          "Mô hình hóa dữ liệu: việc xác định các thực thể, thuộc tính và mối quan hệ giữa chúng để tổ chức dữ liệu một cách logic",
          "Ở mức nâng cao, việc xác định hướng dẫn thích hợp nhất cho hệ thống máy tính mở rộng thành thiết kế giải pháp số cho ngh"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 3.4 về Thiết kế giải pháp số cho nghiệp vụ. Mục tiêu chính là Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A3-A/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (3.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chọn một vấn đề nghiệp vụ thật, mô hình hóa dữ liệu và luồng xử lý, xây giải pháp tự động hóa và đánh giá hiệu quả.",
          "Sản phẩm nộp: Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 3.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A4-F": {
    "4.1": [
      {
        "slideCode": "A4-F/M01/S01",
        "title": "Bảo vệ thiết bị và tài khoản: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Bảo vệ thiết bị và tài khoản: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản; Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản",
          "Thiết bị số: thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác đ",
          "Bảo vệ thiết bị nghĩa là bảo vệ các thiết bị số ,  thiết bị điện tử, máy tính, viễn thông và thiết bị tích hợp khác dùng"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.1 về Bảo vệ thiết bị và tài khoản. Mục tiêu chính là Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản và Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiế.",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Rà soát các tài khoản công việc đang dùng (liệt kê tối thiểu 5 tài khoản: email, hệ thống nội bộ, mạng xã hội công ty.),",
          "Sản phẩm nộp: Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiết bị."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.2": [
      {
        "slideCode": "A4-F/M02/S01",
        "title": "Bảo vệ thông tin cá nhân: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Bảo vệ thông tin cá nhân: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số; Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Thông tin cá nhân: thông tin gắn liền hoặc giúp xác định một người cụ thể ,  họ tên, ngày sinh, số điện thoại, địa chỉ, h",
          "Bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số bắt đầu từ việc nhận biết thông tin cá nhân ,  họ tên, ngày"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.2 về Bảo vệ thông tin cá nhân. Mục tiêu chính là Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số và Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Phân tích 5 email/tin nhắn mẫu (tự tìm hoặc dùng email lạ từng nhận được), xác định cái nào là lừa đảo và chỉ ra dấu hiệ",
          "Sản phẩm nộp: Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.3": [
      {
        "slideCode": "A4-F/M03/S01",
        "title": "Sức khỏe khi làm việc với thiết bị số: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Sức khỏe khi làm việc với thiết bị số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số; Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số",
          "An sinh số: trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc",
          "Bảo vệ sức khỏe và an sinh số nghĩa là tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ s"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.3 về Sức khỏe khi làm việc với thiết bị số. Mục tiêu chính là Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số và Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên)..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chụp ảnh và đánh giá chỗ làm việc hiện tại theo danh mục kiểm tra dưới đây, thực hiện điều chỉnh và ghi lại. Danh mục ki",
          "Sản phẩm nộp: Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.4": [
      {
        "slideCode": "A4-F/M04/S01",
        "title": "Sử dụng công nghệ có ý thức môi trường: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Sử dụng công nghệ có ý thức môi trường: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường",
          "Vòng đời thiết bị: toàn bộ quá trình từ sản xuất, sử dụng đến thải bỏ một thiết bị điện tử",
          "Bảo vệ môi trường nghĩa là nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Mỗi"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.4 về Sử dụng công nghệ có ý thức môi trường. Mục tiêu chính là Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-F/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng đánh giá thói quen và 5 đề xuất cải thiện..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Đánh giá thói quen sử dụng công nghệ của bản thân hoặc bộ phận trong một tuần, đề xuất 5 thay đổi khả thi và ước tính tá",
          "Sản phẩm nộp: Bảng đánh giá thói quen và 5 đề xuất cải thiện."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A4-I": {
    "4.1": [
      {
        "slideCode": "A4-I/M01/S01",
        "title": "Bảo mật trong môi trường làm việc: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Bảo mật trong môi trường làm việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thiết lập được những cách thức bảo vệ thiết bị và nội dung số; Phân biệt được rủi ro và mối đe dọa trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thiết lập được những cách thức bảo vệ thiết bị và nội dung số",
          "Thiết bị số: thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác đ",
          "Ở mức trung cấp, việc bảo vệ thiết bị và nội dung số mở rộng sang môi trường làm việc ,  áp dụng chính sách bảo mật doanh"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.1 về Bảo mật trong môi trường làm việc. Mục tiêu chính là Thiết lập được những cách thức bảo vệ thiết bị và nội dung số và Phân biệt được rủi ro và mối đe dọa trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Danh mục kiểm tra bảo mật và báo cáo tự đánh giá..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Lập danh mục kiểm tra bảo mật cho công việc của bộ phận mình, tự đánh giá và xác định 3 điểm yếu lớn nhất.",
          "Sản phẩm nộp: Danh mục kiểm tra bảo mật và báo cáo tự đánh giá."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.2": [
      {
        "slideCode": "A4-I/M02/S01",
        "title": "Xử lý dữ liệu cá nhân trong công việc: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Xử lý dữ liệu cá nhân trong công việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số; Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Dữ liệu cá nhân cơ bản: thông tin gắn liền hoặc giúp xác định một người, ví dụ họ tên, ngày sinh, giới tính, số điện tho",
          "Ở mức trung cấp, việc bảo vệ dữ liệu cá nhân mở rộng sang xử lý dữ liệu khách hàng trong công việc. Nguyên tắc thu thập"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.2 về Xử lý dữ liệu cá nhân trong công việc. Mục tiêu chính là Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số và Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Rà soát một tập dữ liệu công việc thật (hoặc dùng bảng mẫu ở trên làm điểm khởi đầu, bổ sung thêm 5-10 trường của dữ liệ",
          "Sản phẩm nộp: Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.3": [
      {
        "slideCode": "A4-I/M03/S01",
        "title": "Cân bằng số và sức khỏe nghề nghiệp: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Cân bằng số và sức khỏe nghề nghiệp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần; Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần",
          "An sinh số: trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc",
          "Ở mức trung cấp, việc bảo vệ sức khỏe và an sinh số mở rộng sang quản lý thói quen làm việc bền vững. Quản lý thông báo"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.3 về Cân bằng số và sức khỏe nghề nghiệp. Mục tiêu chính là Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần và Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Theo dõi thói quen số trong 3 ngày làm việc (ghi lại: số lần bị ngắt quãng bởi thông báo, thời gian phản hồi công việc n",
          "Sản phẩm nộp: Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.4": [
      {
        "slideCode": "A4-I/M04/S01",
        "title": "Vận hành số bền vững: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Vận hành số bền vững: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số",
          "Kiểm kê tác động số: quá trình liệt kê và đánh giá mức độ tiêu thụ tài nguyên số (lưu trữ, thiết bị, in ấn) của một bộ p",
          "Ở mức trung cấp, việc bảo vệ môi trường khỏi tác động công nghệ số mở rộng sang vận hành số bền vững ở cấp bộ phận. Kiểm"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.4 về Vận hành số bền vững. Mục tiêu chính là Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-I/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Báo cáo kiểm kê và kế hoạch tối ưu..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Kiểm kê tài nguyên số của bộ phận (dung lượng lưu trữ, tài liệu trùng lặp, lượng in ấn trong một tháng), đề xuất kế hoạc",
          "Sản phẩm nộp: Báo cáo kiểm kê và kế hoạch tối ưu."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A4-A": {
    "4.1": [
      {
        "slideCode": "A4-A/M01/S01",
        "title": "Quản trị an toàn thông tin doanh nghiệp: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quản trị an toàn thông tin doanh nghiệp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số; Phân biệt được rủi ro và mối đe dọa trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số",
          "Thiết bị số: thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác đ",
          "Ở mức nâng cao, việc chọn lựa cách bảo vệ phù hợp nhất cho thiết bị và nội dung số mở rộng thành quản trị an toàn thông"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.1 về Quản trị an toàn thông tin doanh nghiệp. Mục tiêu chính là Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số và Phân biệt được rủi ro và mối đe dọa trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây bộ hồ sơ quản trị an toàn cho doanh nghiệp: sổ rủi ro tối thiểu 8 mục có chấm điểm (dùng bảng mẫu dưới), ma trận phâ",
          "Sản phẩm nộp: Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.2": [
      {
        "slideCode": "A4-A/M02/S01",
        "title": "Tuân thủ bảo vệ dữ liệu cá nhân: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Tuân thủ bảo vệ dữ liệu cá nhân: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số; Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số",
          "Bản đồ luồng dữ liệu: tài liệu mô tả dữ liệu cá nhân được thu thập ở đâu, lưu trữ ở đâu, ai truy cập, và được chuyển gia",
          "Ở mức nâng cao, việc bảo vệ dữ liệu cá nhân mở rộng thành chương trình tuân thủ cấp tổ chức, căn cứ theo cả Nghị định 13"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.2 về Tuân thủ bảo vệ dữ liệu cá nhân. Mục tiêu chính là Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số và Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Lập bản đồ luồng dữ liệu cá nhân cho một quy trình nghiệp vụ thật của doanh nghiệp (ví dụ: quy trình từ khách hàng đăng",
          "Sản phẩm nộp: Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.3": [
      {
        "slideCode": "A4-A/M03/S01",
        "title": "Chính sách phúc lợi số của tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chính sách phúc lợi số của tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số; Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số",
          "An sinh số: trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc",
          "Ở mức nâng cao, việc bảo vệ sức khỏe và an sinh số mở rộng thành chính sách an sinh số cấp tổ chức. Khảo sát trải nghiệm"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.3 về Chính sách phúc lợi số của tổ chức. Mục tiêu chính là Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số và Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Kết quả khảo sát, phân tích, dự thảo chính sách..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Khảo sát trải nghiệm làm việc số trong doanh nghiệp (thiết kế bộ câu hỏi ngắn 8-10 câu về quá tải thông tin, chất lượng",
          "Sản phẩm nộp: Kết quả khảo sát, phân tích, dự thảo chính sách."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "4.4": [
      {
        "slideCode": "A4-A/M04/S01",
        "title": "Chiến lược bền vững số: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chiến lược bền vững số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 4.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ",
          "Chỉ tiêu bền vững: thước đo cụ thể, đo lường được, dùng để theo dõi tiến độ hướng tới mục tiêu bền vững đã đặt ra",
          "Ở mức nâng cao, việc chọn giải pháp phù hợp nhất để bảo vệ môi trường mở rộng thành chiến lược bền vững số cấp toàn doan"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 4.4 về Chiến lược bền vững số. Mục tiêu chính là Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A4-A/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (4.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây chiến lược bền vững số cho doanh nghiệp: kiểm kê hiện trạng, ba mục tiêu có chỉ tiêu đo được, kế hoạch triển khai, v",
          "Sản phẩm nộp: Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 4.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A5-F": {
    "5.1": [
      {
        "slideCode": "A5-F/M01/S01",
        "title": "Xử lý sự cố thường gặp: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Xử lý sự cố thường gặp: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số; Xác định được các giải pháp đơn giản để giải quyết chúng. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số",
          "Sự cố kỹ thuật: tình huống một thiết bị hoặc phần mềm không hoạt động như mong đợi",
          "Giải quyết các vấn đề kỹ thuật nghĩa là xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị số và sử dụng m"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.1 về Xử lý sự cố thường gặp. Mục tiêu chính là Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số và Xác định được các giải pháp đơn giản để giải quyết chúng. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Với 5 tình huống sự cố mô phỏng dưới đây, viết mô tả sự cố đúng chuẩn và liệt kê các bước sẽ thử theo thứ tự. 5 tình huố",
          "Sản phẩm nộp: Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.2": [
      {
        "slideCode": "A5-F/M02/S01",
        "title": "Chọn công cụ phù hợp với công việc: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chọn công cụ phù hợp với công việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được nhu cầu cá nhân; Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được nhu cầu cá nhân",
          "Giải pháp công nghệ: tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải q",
          "Xác định nhu cầu và giải pháp công nghệ ở mức cơ bản nghĩa là xác định được nhu cầu cá nhân và nhận ra các công cụ số đơ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.2 về Chọn công cụ phù hợp với công việc. Mục tiêu chính là Xác định được nhu cầu cá nhân và Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng công việc, công cụ, đánh giá phù hợp (5 dòng)..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Liệt kê 5 công việc thường làm trong tuần, xác định công cụ đang dùng cho mỗi việc và đánh giá mức độ phù hợp. Bảng mẫu:",
          "Sản phẩm nộp: Bảng công việc, công cụ, đánh giá phù hợp (5 dòng)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.3": [
      {
        "slideCode": "A5-F/M03/S01",
        "title": "Cải tiến công việc bằng công cụ số: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Cải tiến công việc bằng công cụ số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm; Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và tình huống có vấn đề trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm",
          "Điểm mất thời gian: công đoạn trong quy trình làm việc tốn nhiều thời gian hơn mức cần thiết so với cách làm khác hiệu q",
          "Sử dụng sáng tạo công nghệ số ở mức cơ bản nghĩa là xác định được các công cụ và công nghệ số đơn giản có thể dùng để tạ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.3 về Cải tiến công việc bằng công cụ số. Mục tiêu chính là Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm và Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và tình huống có vấn đề trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổ.",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chọn một công việc lặp lại hàng tuần, đo thời gian hiện tại đang mất, áp dụng một cải tiến (phím tắt, mẫu có sẵn, tính n",
          "Sản phẩm nộp: Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổng hợp báo cáo bằng cách chép"
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.4": [
      {
        "slideCode": "A5-F/M04/S01",
        "title": "Nhận biết và bù đắp khoảng trống năng lực: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Nhận biết và bù đắp khoảng trống năng lực: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu; Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu",
          "Năng lực số: khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Xác định các vấn đề cần cải thiện về năng lực số ở mức cơ bản nghĩa là nhận ra được năng lực số của bản thân cần được cả"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.4 về Nhận biết và bù đắp khoảng trống năng lực. Mục tiêu chính là Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu và Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-F/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Hoàn thành bản tự đánh giá năng lực số theo 6 miền (dùng bảng mẫu dưới), so với yêu cầu vị trí công việc của mình, lập k",
          "Sản phẩm nộp: Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A5-I": {
    "5.1": [
      {
        "slideCode": "A5-I/M01/S01",
        "title": "Chẩn đoán và xử lý vấn đề kỹ thuật: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chẩn đoán và xử lý vấn đề kỹ thuật: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số; Chọn được giải pháp cho chúng. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số",
          "Chẩn đoán có hệ thống: phương pháp xác định nguyên nhân sự cố bằng cách loại trừ dần các khả năng, thay vì đoán ngẫu nhi",
          "Ở mức trung cấp, việc phân biệt vấn đề kỹ thuật và chọn giải pháp cho chúng đòi hỏi phương pháp chẩn đoán có hệ thống gồ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.1 về Chẩn đoán và xử lý vấn đề kỹ thuật. Mục tiêu chính là Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số và Chọn được giải pháp cho chúng. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chẩn đoán 3 tình huống sự cố phức tạp dưới đây, ghi lại quá trình loại trừ; xây tài liệu hướng dẫn xử lý cho 5 sự cố hay",
          "Sản phẩm nộp: Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.2": [
      {
        "slideCode": "A5-I/M02/S01",
        "title": "Đánh giá và lựa chọn giải pháp công nghệ: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đánh giá và lựa chọn giải pháp công nghệ: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Giải thích nhu cầu cá nhân; Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Giải thích nhu cầu cá nhân",
          "Giải pháp công nghệ: tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải q",
          "Ở mức trung cấp, việc lựa chọn công cụ số và giải pháp công nghệ có thể có cho nhu cầu cụ thể cần phân tích sâu hơn ,  ph"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.2 về Đánh giá và lựa chọn giải pháp công nghệ. Mục tiêu chính là Giải thích nhu cầu cá nhân và Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng so sánh giải pháp và đề xuất công nghệ 1 trang..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chọn một nhu cầu công nghệ thật của bộ phận, so sánh tối thiểu 3 giải pháp theo bảng tiêu chí có trọng số, viết đề xuất",
          "Sản phẩm nộp: Bảng so sánh giải pháp và đề xuất công nghệ 1 trang."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.3": [
      {
        "slideCode": "A5-I/M03/S01",
        "title": "Cải tiến quy trình bằng công cụ số: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Cải tiến quy trình bằng công cụ số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm; Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm",
          "Sơ đồ quy trình: biểu diễn trực quan các bước, người thực hiện, đầu vào và đầu ra của một quy trình công việc",
          "Ở mức trung cấp, việc gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để giải quyết vấn đề mở rộng thành cải ti"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.3 về Cải tiến quy trình bằng công cụ số. Mục tiêu chính là Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm và Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Chọn một quy trình đang có vấn đề trong bộ phận, vẽ sơ đồ hiện trạng, xác định điểm nghẽn, thiết kế phương án cải tiến v",
          "Sản phẩm nộp: Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.4": [
      {
        "slideCode": "A5-I/M04/S01",
        "title": "Phát triển năng lực số cho bản thân và nhóm: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Phát triển năng lực số cho bản thân và nhóm: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật; Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật",
          "Năng lực số: khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Ở mức trung cấp, việc thảo luận về lĩnh vực năng lực số cần cải thiện và hỗ trợ người khác phát triển mở rộng sang phát"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.4 về Phát triển năng lực số cho bản thân và nhóm. Mục tiêu chính là Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật và Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-I/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Đánh giá năng lực số của nhóm mình theo 6 miền, lập bản đồ khoảng trống và kế hoạch phát triển 6 tháng; thiết kế và thực",
          "Sản phẩm nộp: Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "A5-A": {
    "5.1": [
      {
        "slideCode": "A5-A/M01/S01",
        "title": "Xây dựng năng lực xử lý vấn đề của tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Xây dựng năng lực xử lý vấn đề của tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số; Giải quyết chúng bằng những giải pháp phù hợp nhất. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số",
          "Phân tích nguyên nhân gốc: phương pháp tìm ra nguyên nhân sâu xa thực sự gây ra vấn đề, thay vì chỉ xử lý triệu chứng bề",
          "Ở mức nâng cao, việc thẩm định vấn đề kỹ thuật và giải quyết bằng giải pháp phù hợp nhất mở rộng thành xây dựng năng lực"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.1 về Xây dựng năng lực xử lý vấn đề của tổ chức. Mục tiêu chính là Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số và Giải quyết chúng bằng những giải pháp phù hợp nhất. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Phân tích dữ liệu sự cố của doanh nghiệp trong một giai đoạn (có thể dùng dữ liệu mẫu dưới đây làm điểm khởi đầu, bổ sun",
          "Sản phẩm nộp: Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.2": [
      {
        "slideCode": "A5-A/M02/S01",
        "title": "Chiến lược công nghệ và triển khai thay đổi: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Chiến lược công nghệ và triển khai thay đổi: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá được nhu cầu cá nhân; Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá được nhu cầu cá nhân",
          "Giải pháp công nghệ: tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải q",
          "Ở mức nâng cao, việc quyết định cách thích hợp nhất để điều chỉnh môi trường số theo nhu cầu mở rộng thành chiến lược cô"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.2 về Chiến lược công nghệ và triển khai thay đổi. Mục tiêu chính là Đánh giá được nhu cầu cá nhân và Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây lộ trình công nghệ 12 tháng cho doanh nghiệp: đánh giá hiện trạng, xác định ưu tiên, kế hoạch triển khai cho hạng mụ",
          "Sản phẩm nộp: Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.3": [
      {
        "slideCode": "A5-A/M03/S01",
        "title": "Đổi mới sáng tạo bằng công nghệ số: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đổi mới sáng tạo bằng công nghệ số: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm; Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm",
          "Giả thuyết kiểm chứng được: một dự đoán cụ thể có thể được xác nhận đúng hoặc sai thông qua thử nghiệm thực tế",
          "Ở mức nâng cao, việc điều chỉnh công cụ và công nghệ số phù hợp nhất để tạo kiến thức mở rộng thành đổi mới sáng tạo cấp"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.3 về Đổi mới sáng tạo bằng công nghệ số. Mục tiêu chính là Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm và Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá..",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Nhận diện một cơ hội đổi mới trong doanh nghiệp, thiết kế thử nghiệm với giả thuyết và tiêu chí thành công rõ ràng, trìn",
          "Sản phẩm nộp: Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "5.4": [
      {
        "slideCode": "A5-A/M04/S01",
        "title": "Phát triển năng lực số toàn tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Phát triển năng lực số toàn tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 5.4. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình; Đánh giá được sự phát triển năng lực số của người khác. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình",
          "Năng lực số: khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn",
          "Ở mức nâng cao, việc quyết định cách thích hợp nhất để cải thiện năng lực số và đánh giá sự phát triển của người khác mở"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 5.4 về Phát triển năng lực số toàn tổ chức. Mục tiêu chính là Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình và Đánh giá được sự phát triển năng lực số của người khác. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "A5-A/M04/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (5.4). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ.",
        "keyPoints": [
          "Nhận diện đúng tình huống phát sinh và rủi ro dữ liệu tại vị trí làm việc",
          "Xây chiến lược phát triển năng lực số cho doanh nghiệp: bản đồ hiện trạng theo vị trí, ma trận yêu cầu, phân tích khoảng",
          "Sản phẩm nộp: Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ chỉ số."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 5.4. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "M6-F": {
    "6.1": [
      {
        "slideCode": "M6-F/M01/S01",
        "title": "Hiểu biết cơ bản về AI: Lý thuyết và Quy chuẩn",
        "layout": "concept",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Hiểu biết cơ bản về AI: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Xác định được khái niệm cơ bản của AI; Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Xác định được khái niệm cơ bản của AI",
          "Trí tuệ nhân tạo (AI): theo Khung chuẩn năng lực số, là việc phát triển các hệ thống máy móc có khả năng thực hiện các n",
          "AI, nói một cách đơn giản, là các chương trình máy tính được “huấn luyện” từ một khối lượng dữ liệu khổng lồ để nhận diệ"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.1 về Hiểu biết cơ bản về AI. Mục tiêu chính là Xác định được khái niệm cơ bản của AI và Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-F/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng 5 ứng dụng AI đã gặp kèm giải thích..",
        "keyPoints": [
          "Chị Mai làm ở bộ phận hành chính, mỗi ngày dùng tính năng gợi ý từ khi gõ tin nhắn trên điện thoại ,  đây là một dạng AI",
          "Liệt kê 5 công cụ hoặc ứng dụng có dùng AI mà bản thân từng gặp trong công việc hoặc đời sống hằng ngày (có thể là những",
          "Sản phẩm nộp: Bảng 5 ứng dụng AI đã gặp kèm giải thích."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.2": [
      {
        "slideCode": "M6-F/M02/S01",
        "title": "Sử dụng công cụ AI cơ bản: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Sử dụng công cụ AI cơ bản: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận diện được các công cụ AI đơn giản; Thực hiện được các thao tác cơ bản với công cụ AI. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận diện được các công cụ AI đơn giản",
          "Yêu cầu (prompt): câu lệnh hoặc câu hỏi mà người dùng nhập vào công cụ AI để nhận được kết quả mong muốn",
          "Làm quen với một công cụ AI tạo sinh dạng trò chuyện (chatbot văn bản) là bước khởi đầu phổ biến nhất. Các công cụ này n"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.2 về Sử dụng công cụ AI cơ bản. Mục tiêu chính là Nhận diện được các công cụ AI đơn giản và Thực hiện được các thao tác cơ bản với công cụ AI. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-F/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét..",
        "keyPoints": [
          "Anh Tuấn cần tóm tắt một bản báo cáo dài 10 trang cho cuộc họp chiều nay. Thay vì đọc và tóm tắt thủ công mất một giờ, a",
          "Dùng một công cụ AI để hỗ trợ một việc công việc đơn giản (ví dụ: tóm tắt một văn bản, soạn nháp một email, dịch một đoạ",
          "Sản phẩm nộp: Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.3": [
      {
        "slideCode": "M6-F/M03/S01",
        "title": "Nhận biết cơ bản về đánh giá AI: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Nhận biết cơ bản về đánh giá AI: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá; Mô tả được các chức năng chính của hệ thống AI. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá",
          "Ảo giác AI (AI hallucination): hiện tượng công cụ AI tạo ra thông tin nghe có vẻ hợp lý, tự tin, nhưng thực chất sai hoặ",
          "Một trong những hiểu lầm phổ biến nhất về AI tạo sinh là tin rằng nó luôn đúng vì trả lời rất tự tin và trôi chảy. Thực"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.3 về Nhận biết cơ bản về đánh giá AI. Mục tiêu chính là Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá và Mô tả được các chức năng chính của hệ thống AI. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-F/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có..",
        "keyPoints": [
          "Chị Hương hỏi một công cụ AI về quy định nghỉ phép năm theo luật lao động hiện hành. Công cụ trả lời rất chi tiết và tự",
          "Yêu cầu một công cụ AI trả lời một câu hỏi mà bản thân đã biết đáp án chính xác từ trước (ví dụ một sự kiện lịch sử công",
          "Sản phẩm nộp: Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "M6-I": {
    "6.1": [
      {
        "slideCode": "M6-I/M01/S01",
        "title": "Hiểu biết AI ứng dụng vào công việc: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Hiểu biết AI ứng dụng vào công việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản; Thực hiện được thao tác cơ bản trên các công cụ AI. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản",
          "Công cụ AI chuyên biệt: công cụ AI được thiết kế tối ưu cho một loại tác vụ cụ thể (viết, thiết kế hình ảnh, phân tích d",
          "Công cụ AI hiện nay không còn là một loại duy nhất ,  có công cụ chuyên viết văn bản, công cụ chuyên tạo hình ảnh từ mô t"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.1 về Hiểu biết AI ứng dụng vào công việc. Mục tiêu chính là Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản và Thực hiện được thao tác cơ bản trên các công cụ AI. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-I/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét)..",
        "keyPoints": [
          "Phòng kế toán cần hỗ trợ hai việc khác nhau: viết email nhắc nợ khách hàng (việc văn bản) và tìm quy luật bất thường tro",
          "So sánh 2-3 công cụ AI khác nhau cho cùng một tác vụ công việc cụ thể (ví dụ: tóm tắt văn bản, dịch thuật, hoặc tạo nội",
          "Sản phẩm nộp: Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.2": [
      {
        "slideCode": "M6-I/M02/S01",
        "title": "Sử dụng AI có đạo đức và trách nhiệm trong công việc: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Sử dụng AI có đạo đức và trách nhiệm trong công việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Sử dụng được công cụ AI trong công việc hằng ngày; Thực hành được kỹ năng sử dụng AI qua bài tập, dự án nhỏ. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Sử dụng được công cụ AI trong công việc hằng ngày",
          "Sử dụng AI có trách nhiệm: việc áp dụng AI vào công việc có cân nhắc đến quyền riêng tư, tính chính xác, và ghi nhận rõ",
          "Ở mức trung cấp, việc đặt yêu cầu (prompt) cần tinh chỉnh hơn mức cơ bản: cung cấp ngữ cảnh đầy đủ (ai là đối tượng đọc,"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.2 về Sử dụng AI có đạo đức và trách nhiệm trong công việc. Mục tiêu chính là Sử dụng được công cụ AI trong công việc hằng ngày và Thực hành được kỹ năng sử dụng AI qua bài tập, dự án nhỏ. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-I/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh d.",
        "keyPoints": [
          "Phòng marketing cần viết mười bài giới thiệu sản phẩm ngắn cho mười sản phẩm khác nhau. Thay vì đặt riêng lẻ mười yêu cầ",
          "Dùng AI hỗ trợ một dự án nhỏ của bộ phận (ví dụ: viết loạt nội dung, tổng hợp thông tin từ nhiều nguồn, soạn thảo tài li",
          "Sản phẩm nộp: Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh dùng, phần nào AI hỗ trợ)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.3": [
      {
        "slideCode": "M6-I/M03/S01",
        "title": "Đánh giá công cụ AI trong công việc: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đánh giá công cụ AI trong công việc: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể; So sánh được hiệu suất của các hệ thống AI khác nhau. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể",
          "Độ chính xác (accuracy) của AI: mức độ kết quả AI đưa ra khớp với thực tế hoặc kỳ vọng đúng",
          "Đánh giá hiệu quả của một hệ thống AI trong công việc cần dựa trên tiêu chí cụ thể, không chỉ cảm nhận chung chung “thấy"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.3 về Đánh giá công cụ AI trong công việc. Mục tiêu chính là Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể và So sánh được hiệu suất của các hệ thống AI khác nhau. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-I/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa)..",
        "keyPoints": [
          "Phòng nhân sự thử nghiệm dùng AI để sàng lọc sơ yếu lý lịch ứng viên. Sau một tháng thử nghiệm, họ ghi nhận: AI tiết kiệ",
          "Đánh giá độ chính xác/tin cậy của một kết quả AI tạo ra cho một việc công việc cụ thể. Chỉ ra điểm cần kiểm tra lại hoặc",
          "Sản phẩm nộp: Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  },
  "M6-A": {
    "6.1": [
      {
        "slideCode": "M6-A/M01/S01",
        "title": "Đánh giá và định hướng ứng dụng AI: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Đánh giá và định hướng ứng dụng AI: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.1. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể; Kiểm tra được giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể",
          "Cường điệu công nghệ (hype): hiện tượng một công nghệ được truyền thông và thị trường thổi phồng vượt quá khả năng thực",
          "Đánh giá cơ hội ứng dụng AI ở cấp tổ chức đòi hỏi phân biệt rõ giữa cường điệu công nghệ và giá trị thực tế. Không phải"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.1 về Đánh giá và định hướng ứng dụng AI. Mục tiêu chính là Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể và Kiểm tra được giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-A/M01/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.1). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm)..",
        "keyPoints": [
          "Ban giám đốc một công ty thương mại nghe nhiều về AI tạo hình ảnh và cân nhắc đầu tư lớn để tự động hóa toàn bộ khâu thi",
          "Đánh giá một cơ hội ứng dụng AI cụ thể cho một quy trình của doanh nghiệp. Xác định rõ vấn đề cần giải quyết, đánh giá đ",
          "Sản phẩm nộp: Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.1. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.2": [
      {
        "slideCode": "M6-A/M02/S01",
        "title": "Lãnh đạo ứng dụng AI có trách nhiệm: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Lãnh đạo ứng dụng AI có trách nhiệm: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.2. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể; Điều chỉnh được hệ thống AI để phù hợp với nhu cầu cụ thể. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể",
          "Quy tắc sử dụng AI nội bộ: văn bản do doanh nghiệp ban hành quy định rõ ai được dùng AI cho việc gì, dữ liệu nào không đ",
          "Xây quy tắc sử dụng AI cho bộ phận hoặc toàn doanh nghiệp là bước cần thiết khi việc dùng AI trở nên phổ biến, không còn"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.2 về Lãnh đạo ứng dụng AI có trách nhiệm. Mục tiêu chính là Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể và Điều chỉnh được hệ thống AI để phù hợp với nhu cầu cụ thể. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-A/M02/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.2). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên)..",
        "keyPoints": [
          "Sau vài tháng nhân viên các phòng ban tự phát dùng nhiều công cụ AI khác nhau không kiểm soát, ban giám đốc một doanh ng",
          "Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho bộ phận hoặc doanh nghiệp, bao gồm: công cụ được phê duyệt, dữ liệu c",
          "Sản phẩm nộp: Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên)."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.2. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ],
    "6.3": [
      {
        "slideCode": "M6-A/M03/S01",
        "title": "Xây dựng năng lực đánh giá AI cho tổ chức: Lý thuyết và Quy chuẩn",
        "layout": "checklist",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Xây dựng năng lực đánh giá AI cho tổ chức: Lý thuyết và Quy chuẩn. Bên trái thể hiện sơ đồ phân tầng hoặc bảng định nghĩa cho năng lực 6.3. Bên phải liệt kê các quy chuẩn và mục tiêu cốt lõi: Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI; Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra. Tông màu xanh navy và trắng.",
        "keyPoints": [
          "Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI",
          "Tiêu chí đánh giá công cụ AI: bộ tiêu chuẩn có hệ thống dùng để so sánh và lựa chọn công cụ AI trước khi đưa vào sử dụng",
          "Xây bộ tiêu chí đánh giá có hệ thống để lựa chọn công cụ AI cho tổ chức giúp tránh quyết định theo cảm tính hoặc theo qu"
        ],
        "videoScript": "Chào bạn. Trong bài học này, chúng ta tìm hiểu năng lực 6.3 về Xây dựng năng lực đánh giá AI cho tổ chức. Mục tiêu chính là Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI và Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra. Bạn cần nắm chắc các định nghĩa chuyên môn trước khi áp dụng vào quy trình công việc tại cơ quan. Hãy ghi nhớ các nguyên tắc kiểm tra đối chiếu dữ liệu để bảo đảm sản phẩm đầu ra chính xác."
      },
      {
        "slideCode": "M6-A/M03/S02",
        "title": "Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3)",
        "layout": "process",
        "visualPrompt": "Thiết kế slide tỷ lệ 16:9. Tiêu đề: Quy trình tác nghiệp và hoàn thiện sản phẩm (6.3). Trình bày sơ đồ quy trình 3 bước xử lý tình huống nghiệp vụ: Tiếp nhận dữ liệu, Thực hiện thao tác đạt chuẩn, Bàn giao sản phẩm có kiểm tra. Dưới chân slide ghi chú yêu cầu nộp sản phẩm: Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát.",
        "keyPoints": [
          "Một doanh nghiệp cân nhắc giữa ba công cụ AI hỗ trợ chăm sóc khách hàng qua chat. Thay vì chọn theo tên tuổi thương hiệu",
          "Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI áp dụng cho một nhu cầu cụ thể của doanh nghiệp, và thiết kế",
          "Sản phẩm nộp: Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát."
        ],
        "videoScript": "Trong phần thực hành, chúng ta giải quyết tình huống công việc thực tế của năng lực 6.3. Khi tiếp nhận yêu cầu, bạn tiến hành phân loại thông tin và áp dụng các công cụ số theo đúng hướng dẫn. Sau khi hoàn thành thao tác, bạn đối chiếu sản phẩm với tiêu chí nghiệm thu và lưu trữ kết quả vào kho dữ liệu quy định."
      }
    ]
  }
};

export function getLessonMediaSpec(courseCode: string, competencyCode: string, lessonIndex: number): LessonMediaSpec | null {
  const norm = (courseCode || '').toUpperCase();
  const courseSpecs = COURSE_MEDIA_SPECS[norm] || COURSE_MEDIA_SPECS[norm.replace(/^M/, 'A')];
  if (!courseSpecs) return null;
  const compSpecs = courseSpecs[competencyCode] || Object.values(courseSpecs)[0];
  if (!compSpecs || compSpecs.length === 0) return null;
  return compSpecs[lessonIndex] || compSpecs[0];
}
