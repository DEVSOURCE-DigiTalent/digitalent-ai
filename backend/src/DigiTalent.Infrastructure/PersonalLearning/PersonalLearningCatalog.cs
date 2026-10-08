namespace DigiTalent.Infrastructure.PersonalLearning;

public static class PersonalLearningCatalog
{
    public sealed record PositionDef(string Code, string Name, string Description, int[] Levels);

    public static readonly IReadOnlyList<PositionDef> Positions = new List<PositionDef>
    {
        new("CEO", "Giám đốc điều hành", "Định hướng chuyển đổi số và quản trị rủi ro dữ liệu.",
            new[] { 2, 3, 3, 3, 3, 2, 3, 3, 3, 2, 0, 2, 0, 3, 3, 2, 2, 0, 3, 3, 3, 3, 3, 3 }),
        new("HR", "Nhân sự", "Quản lý hồ sơ nhân sự, tuyển dụng và đào tạo bằng công cụ số.",
            new[] { 2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 1, 1, 0, 2, 3, 3, 1, 1, 2, 2, 3, 2, 2, 1 }),
        new("MARKETING", "Marketing", "Nội dung số, truyền thông đa kênh và phân tích dữ liệu.",
            new[] { 3, 3, 2, 3, 3, 0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1, 0, 1, 2, 3, 2, 3, 3, 3 }),
        new("SALES_CRM", "Kinh doanh (CRM)", "Chăm sóc khách hàng và theo dõi cơ hội bán hàng trên CRM.",
            new[] { 2, 2, 3, 3, 3, 0, 3, 3, 2, 2, 1, 0, 0, 2, 3, 1, 0, 1, 2, 2, 1, 2, 2, 1 }),
        new("ACCOUNTANT", "Kế toán", "Xử lý chứng từ, báo cáo và bảo mật dữ liệu tài chính.",
            new[] { 2, 3, 3, 2, 2, 3, 2, 1, 2, 1, 0, 0, 2, 2, 3, 1, 0, 1, 2, 2, 1, 1, 2, 2 }),
    };

    public sealed record DomainDef(int Number, string Name, int CompetencyCount, string CoursePrefix, string[] CompetencyCodes);

    public static readonly IReadOnlyList<DomainDef> Domains = new List<DomainDef>
    {
        new(1, "Khai thác dữ liệu và thông tin", 3, "A1", new[] { "1.1", "1.2", "1.3" }),
        new(2, "Giao tiếp và hợp tác trong môi trường số", 6, "A2", new[] { "2.1", "2.2", "2.3", "2.4", "2.5", "2.6" }),
        new(3, "Sáng tạo nội dung số", 4, "A3", new[] { "3.1", "3.2", "3.3", "3.4" }),
        new(4, "An toàn", 4, "A4", new[] { "4.1", "4.2", "4.3", "4.4" }),
        new(5, "Giải quyết vấn đề", 4, "A5", new[] { "5.1", "5.2", "5.3", "5.4" }),
        new(6, "Ứng dụng trí tuệ nhân tạo", 3, "M6", new[] { "6.1", "6.2", "6.3" }),
    };

    public static readonly IReadOnlyDictionary<string, string> CompetencyNames = new Dictionary<string, string>
    {
        ["1.1"] = "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số",
        ["1.2"] = "Đánh giá dữ liệu, thông tin và nội dung số",
        ["1.3"] = "Quản lý dữ liệu, thông tin và nội dung số",
        ["2.1"] = "Tương tác thông qua công nghệ số",
        ["2.2"] = "Chia sẻ thông tin và nội dung thông qua công nghệ số",
        ["2.3"] = "Sử dụng công nghệ số để thực hiện trách nhiệm công dân",
        ["2.4"] = "Hợp tác thông qua công nghệ số",
        ["2.5"] = "Thực hiện quy tắc ứng xử trên mạng",
        ["2.6"] = "Quản lý danh tính số",
        ["3.1"] = "Phát triển nội dung số",
        ["3.2"] = "Tích hợp và tạo lập lại nội dung số",
        ["3.3"] = "Thực thi bản quyền và giấy phép",
        ["3.4"] = "Lập trình",
        ["4.1"] = "Bảo vệ thiết bị",
        ["4.2"] = "Bảo vệ dữ liệu cá nhân và quyền riêng tư",
        ["4.3"] = "Bảo vệ sức khỏe và an sinh số",
        ["4.4"] = "Bảo vệ môi trường",
        ["5.1"] = "Giải quyết các vấn đề kỹ thuật",
        ["5.2"] = "Xác định nhu cầu và giải pháp công nghệ",
        ["5.3"] = "Sử dụng sáng tạo công nghệ số",
        ["5.4"] = "Xác định các vấn đề cần cải thiện về năng lực số",
        ["6.1"] = "Hiểu biết về AI (trong đó có Gen AI)",
        ["6.2"] = "Sử dụng AI có đạo đức và trách nhiệm",
        ["6.3"] = "Đánh giá các công cụ AI",
    };

    public static readonly string[] CompetencyCodesInOrder = CompetencyNames.Keys.ToArray();

    public sealed record CourseDef(
        string Id,
        string Code,
        string Title,
        int DomainNumber,
        string DomainName,
        int Level,
        int DurationMinutes,
        string Description,
        string[] Outcomes,
        string? PrerequisiteId,
        string? PrerequisiteTitle,
        string[] CompetencyCodes
    );

    public static readonly IReadOnlyList<CourseDef> Courses = BuildStandardCourses();

    private static IReadOnlyList<CourseDef> BuildStandardCourses()
    {
        var list = new List<CourseDef>();
        var levelSuffix = new[] { "F", "I", "A" };
        var levelTitles = new[] { "Cơ bản", "Trung cấp", "Nâng cao" };
        var durations = new[] { 120, 150, 180 };

        foreach (var domain in Domains)
        {
            for (var lvl = 1; lvl <= 3; lvl++)
            {
                var code = $"{domain.CoursePrefix}-{levelSuffix[lvl - 1]}";
                var id = $"crs-{code.ToLowerInvariant()}";
                var duration = domain.CompetencyCount * durations[lvl - 1];
                var title = $"{domain.Name} ({levelTitles[lvl - 1]})";
                var prereqId = lvl > 1 ? $"crs-{domain.CoursePrefix.ToLowerInvariant()}-{levelSuffix[lvl - 2].ToLowerInvariant()}" : null;
                var prereqTitle = lvl > 1 ? $"{domain.Name} ({levelTitles[lvl - 2]})" : null;

                list.Add(new CourseDef(
                    Id: id,
                    Code: code,
                    Title: title,
                    DomainNumber: domain.Number,
                    DomainName: domain.Name,
                    Level: lvl,
                    DurationMinutes: duration,
                    Description: $"Chương trình đào tạo kỹ năng số chuẩn Thông tư 02/2025 cho miền {domain.Name} ở mức {levelTitles[lvl - 1]}.",
                    Outcomes: domain.CompetencyCodes.Select(c => $"Nâng cao năng lực {c}: {CompetencyNames[c]} lên mức {levelTitles[lvl - 1]}").ToArray(),
                    PrerequisiteId: prereqId,
                    PrerequisiteTitle: prereqTitle,
                    CompetencyCodes: domain.CompetencyCodes
                ));
            }
        }

        return list;
    }

    public sealed record QuestionDef(
        string Id,
        int DomainNumber,
        string CompetencyCode,
        int Level,
        string Text,
        string[] Options,
        int CorrectIndex,
        string Explanation
    );

    public static readonly IReadOnlyList<QuestionDef> QuestionBank = new List<QuestionDef>
    {
        // Miền 1
        new("pq-1-1", 1, "1.1", 1,
            "Bạn cần tìm mẫu hợp đồng lao động mới nhất trên mạng. Cách tìm nào cho kết quả đáng tin cậy nhất?",
            new[] { "Gõ \"mẫu hợp đồng\" và mở kết quả đầu tiên", "Thêm từ khóa cụ thể (năm, \"Bộ luật Lao động 2019\") và ưu tiên trang có tên miền .gov.vn", "Hỏi trong nhóm mạng xã hội", "Dùng lại mẫu cũ trong máy" },
            1, "Từ khóa cụ thể và nguồn .gov.vn giúp đảm bảo tính pháp lý và tin cậy."),
        new("pq-1-2", 1, "1.2", 2,
            "Một bài báo dẫn số liệu \"70% khách hàng bỏ giỏ hàng\" để thuyết phục mua công cụ. Bạn kiểm tra độ tin cậy thế nào?",
            new[] { "Tin vì nhiều trang nhắc lại", "Tìm nghiên cứu gốc, xem ai thực hiện, năm nào và ai được lợi", "Bỏ qua mọi số liệu", "Chỉ tin nếu có biểu đồ" },
            1, "Đánh giá thông tin là truy về nguồn gốc, phương pháp, thời điểm và động cơ của tác giả."),
        new("pq-1-3", 1, "1.3", 3,
            "Bạn được giao tổ chức thư mục dùng chung cho nhóm 10 người. Cách làm nào giảm rủi ro lẫn lộn tệp?",
            new[] { "Để mọi người tự tạo thư mục", "Thống nhất quy ước đặt tên (YYYY-MM-DD_Tên) và cấu trúc theo dự án/năm", "Chỉ lưu trên máy cá nhân", "Đặt tên thật ngắn" },
            1, "Quy ước đặt tên và cấu trúc rõ ràng giúp đồng bộ tài liệu nhóm hiệu quả."),
        new("pq-1-4", 1, "1.3", 2,
            "Khi quản lý dữ liệu bảng tính lớn, thao tác nào giúp phát hiện sai lệch nhanh nhất?",
            new[] { "Cuộn chuột kiểm tra từng dòng", "Dùng bộ lọc (Filter) và định dạng có điều kiện (Conditional Formatting)", "In ra giấy đọc lại", "Xóa bớt dòng trống" },
            1, "Bộ lọc và định dạng có điều kiện làm nổi bật giá trị bất thường tự động."),

        // Miền 2
        new("pq-2-1", 2, "2.1", 1,
            "Bạn cần xin trưởng phòng duyệt tài liệu gấp trong 30 phút. Kênh liên lạc nào phù hợp nhất?",
            new[] { "Gửi email bình thường", "Gọi điện thoại hoặc nhắn tin qua kênh trực tiếp của cơ quan", "Đăng lên trang nội bộ", "Nhắn vào nhóm chung" },
            1, "Việc khẩn cấp cần kênh liên lạc trực tiếp, tức thì."),
        new("pq-2-2", 2, "2.4", 2,
            "Hai người cùng sửa một bản đề xuất trên Google Docs và ghi đè nội dung của nhau. Cách phòng ngừa là gì?",
            new[] { "Một người làm, người kia chỉ đọc", "Dùng chế độ Gợi ý (Suggesting) và phân công rõ từng phần", "Lưu ra 2 tệp riêng", "Chỉ sửa khi người kia đã đăng xuất" },
            1, "Chế độ Gợi ý và phân đoạn công việc giúp hợp tác cộng tác không xung đột."),
        new("pq-2-3", 2, "2.5", 3,
            "Một đồng nghiệp gửi email phản ứng gay gắt trong chuỗi thư có cả khách hàng. Cách ứng xử chuyên nghiệp là gì?",
            new[] { "Đáp trả ngay lập tức", "Không phản bác trong chuỗi chung; trao đổi riêng với đồng nghiệp để làm rõ", "Xóa chuỗi thư", "Chuyển tiếp cho toàn công ty" },
            1, "Xử lý xung đột riêng tư bảo vệ uy tín tổ chức và giải quyết tận gốc vấn đề."),
        new("pq-2-4", 2, "2.6", 2,
            "Khi dùng tài khoản mạng xã hội cá nhân cho công việc, nguyên tắc nào quan trọng nhất?",
            new[] { "Đăng mọi suy nghĩ cá nhân", "Phân định rõ phát ngôn cá nhân và đại diện tổ chức; bật xác thực 2 lớp", "Dùng chung mật khẩu", "Không kết bạn với đồng nghiệp" },
            1, "Bảo vệ danh tính số và thiết lập ranh giới phát ngôn chuyên nghiệp."),

        // Miền 3
        new("pq-3-1", 3, "3.1", 1,
            "Bạn cần chuẩn bị bài thuyết trình 10 phút trước ban giám đốc. Thiết kế slide nào hiệu quả nhất?",
            new[] { "Chép nguyên văn cả đoạn văn bản", "Mỗi slide 1 thông điệp chính, dùng biểu đồ và bullet point ngắn gọn", "Dùng nhiều hoạt ảnh chuyển động", "Ít nhất 40 slide" },
            1, "Slide thuyết trình cần cô đọng, trực quan và tập trung vào thông điệp chính."),
        new("pq-3-2", 3, "3.3", 2,
            "Bạn lấy ảnh trên Google Images chèn vào brochure quảng cáo của công ty. Điều này có an toàn pháp lý không?",
            new[] { "Có, vì Google cho tìm kiếm", "Không, nếu ảnh có bản quyền và công ty chưa có giấy phép sử dụng hợp lệ", "Chỉ cần ghi nguồn là đủ", "Chỉ cần cắt xén lại" },
            1, "Sử dụng thương mại cần có bản quyền hoặc thuộc giấy phép Creative Commons thương mại."),
        new("pq-3-3", 3, "3.4", 3,
            "Quy trình báo cáo hàng tuần mất 2 giờ copy paste từ Excel sang Word. Giải pháp tối ưu là gì?",
            new[] { "Thuê người làm hộ", "Tự động hóa bằng macro/script (VBA, Python hoặc Power Automate)", "Bỏ bớt báo cáo", "Làm ngoài giờ" },
            1, "Tự động hóa quy trình lặp đi lặp lại giúp giải phóng thời gian và tránh sai sót."),
        new("pq-3-4", 3, "3.2", 2,
            "Khi chuyển đổi bảng số liệu từ PDF sang Excel, cách nào kiểm tra tính toàn vẹn tốt nhất?",
            new[] { "Đối chiếu tổng (Sum) của các cột chính giữa bản gốc và bản chuyển", "Đếm số trang", "Không cần kiểm tra", "Nhìn lướt qua" },
            1, "Đối chiếu tổng số (control total) kiểm chứng nhanh tính nguyên vẹn dữ liệu."),

        // Miền 4
        new("pq-4-1", 4, "4.1", 1,
            "Bạn nhận được email từ IT nội bộ yêu cầu \"bấm vào link đổi mật khẩu gấp do sự cố\". Bạn nên làm gì?",
            new[] { "Bấm ngay kẻo khóa tài khoản", "Kiểm tra địa chỉ người gửi, liên hệ IT qua kênh độc lập trước khi thao tác", "Chuyển tiếp cho bạn bè", "Gửi mật khẩu vào phản hồi" },
            1, "Dấu hiệu điển hình của tấn công lừa đảo (Phishing); cần xác thực đa kênh."),
        new("pq-4-2", 4, "4.2", 2,
            "Khách hàng yêu cầu gửi danh sách thông tin liên lạc của các khách hàng khác cùng khóa học. Bạn xử lý thế nào?",
            new[] { "Gửi ngay để tiện giao lưu", "Từ chối vì vi phạm quy định bảo vệ dữ liệu cá nhân theo Nghị định 13/2023", "Gửi qua Facebook cá nhân", "Tính phí rồi gửi" },
            1, "Bảo vệ thông tin cá nhân của khách hàng là nghĩa vụ pháp lý bắt buộc."),
        new("pq-4-3", 4, "4.4", 3,
            "Doanh nghiệp muốn giảm dấu chân carbon từ hạ tầng CNTT. Biện pháp nào thiết thực nhất?",
            new[] { "Tắt máy tính 5 phút mỗi ngày", "Chuyển đổi lên đám mây, tối ưu lưu trữ và dọn dẹp dữ liệu rác định kỳ", "Không dùng máy in", "Mua máy tính mới liên tục" },
            1, "Tối ưu hóa tài nguyên số và điện toán đám mây giảm tiêu thụ năng lượng hiệu quả."),
        new("pq-4-4", 4, "4.3", 2,
            "Làm việc với màn hình máy tính 8 tiếng liên tục, thói quen nào bảo vệ mắt và cột sống tốt nhất?",
            new[] { "Ngồi yên không cử động", "Quy tắc 20-20-20 (mỗi 20 phút nhìn xa 20 feet trong 20 giây) và tư thế chuẩn", "Uống cà phê liên tục", "Chỉnh màn hình sáng tối đa" },
            1, "Quy tắc 20-20-20 và tư thế công thái học bảo vệ sức khỏe số lâu dài."),

        // Miền 5
        new("pq-5-1", 5, "5.1", 1,
            "Máy tính không vào được mạng nội bộ trong khi mọi người vẫn dùng bình thường. Bước đầu tiên bạn làm gì?",
            new[] { "Gọi giám đốc báo hỏng", "Kiểm tra dây cáp mạng/Wi-Fi, biểu tượng mạng và khởi động lại kết nối", "Cài lại Windows", "Nghỉ làm việc" },
            1, "Tự chẩn đoán sự cố cơ bản từ các nguyên nhân vật lý và kết nối thông thường."),
        new("pq-5-2", 5, "5.2", 2,
            "Nhóm của bạn cần công cụ theo dõi tiến độ công việc minh bạch. Tiêu chí chọn công cụ là gì?",
            new[] { "Phần mềm đắt tiền nhất", "Phù hợp quy mô nhóm, dễ dùng, có thể tích hợp và bảo mật dữ liệu", "Phần mềm nhiều tính năng nhất", "Dùng sổ tay giấy" },
            1, "Đánh giá nhu cầu thực tế và tính khả thi quan trọng hơn số lượng tính năng."),
        new("pq-5-3", 5, "5.3", 3,
            "Để cải tiến quy trình chăm sóc khách hàng, cách tiếp cận đổi mới sáng tạo số nào tối ưu?",
            new[] { "Giữ nguyên cách làm cũ", "Vẽ bản đồ hành trình khách hàng (Journey map) và ứng dụng tự động hóa thông minh", "Tăng thêm nhân sự trực", "Chỉ gửi email hàng loạt" },
            1, "Ứng dụng công nghệ trên hành trình trải nghiệm người dùng tạo giá trị đột phá."),
        new("pq-5-4", 5, "5.4", 2,
            "Làm sao nhận biết khoảng trống kỹ năng số của bản thân để lập kế hoạch phát triển?",
            new[] { "Đợi cấp trên nhắc nhở", "Tự đánh giá định kỳ theo khung năng lực chuẩn và đối chiếu yêu cầu công việc", "Không cần học thêm", "Hỏi bạn bè" },
            1, "Tự đánh giá theo khung năng lực chuẩn tạo lộ trình học tập chủ động."),

        // Miền 6
        new("pq-6-1", 6, "6.1", 1,
            "AI tạo sinh (Generative AI) hoạt động dựa trên nguyên lý cơ bản nào?",
            new[] { "Tự có ý thức và tư duy như con người", "Mô hình ngôn ngữ lớn dự đoán từ/nội dung tiếp theo dựa trên dữ liệu đào tạo", "Tra cứu từ điển và sao chép nguyên văn", "Là công cụ tìm kiếm Google" },
            1, "GenAI dự đoán xác suất mẫu thông tin tiếp theo từ tập dữ liệu quy mô lớn."),
        new("pq-6-2", 6, "6.2", 2,
            "Khi dùng ChatGPT để viết báo cáo tài chính, hành động nào tiềm ẩn rủi ro bảo mật nghiêm trọng?",
            new[] { "Nhập số liệu tài chính nhạy cảm chưa công bố của công ty vào prompt", "Yêu cầu định dạng bảng biểu", "Nhờ sửa lỗi chính tả", "Tóm tắt tài liệu công khai" },
            1, "Dữ liệu nhạy cảm đưa vào AI công cộng có thể bị lưu trữ và rò rỉ thông tin."),
        new("pq-6-3", 6, "6.3", 3,
            "Một mô hình AI đưa ra câu trả lời có vẻ thuyết phục nhưng sai sự thật (ảo giác - hallucination). Bạn kiểm soát thế nào?",
            new[] { "Tin tưởng hoàn toàn", "Luôn đối chiếu chéo (Cross-check) với nguồn dữ liệu gốc và chuyên gia xác nhận", "Xóa bỏ công cụ AI", "Chỉ dùng AI cho việc cá nhân" },
            1, "Hiện tượng ảo giác đòi hỏi tư duy phản biện và xác thực chéo nguồn tin cậy."),
        new("pq-6-4", 6, "6.1", 2,
            "Cách viết câu lệnh (Prompt) nào giúp AI đưa ra kết quả chính xác và chất lượng nhất?",
            new[] { "Viết càng ngắn càng tốt", "Cung cấp rõ vai trò (Role), bối cảnh (Context), nhiệm vụ (Task) và định dạng đầu ra (Format)", "Viết mơ hồ để AI tự sáng tạo", "Chỉ dùng một từ khóa" },
            1, "Cấu trúc Prompt chuẩn: Vai trò, Bối cảnh, Yêu cầu cụ thể và Định dạng kết quả."),
    };
}
