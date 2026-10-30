using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>Một lĩnh vực của Khung TT02 trong doanh nghiệp (thứ tự hiển thị 1..6).</summary>
public sealed record TrialDomainInfo(Guid CategoryId, int Number, string Code, string Name);

/// <summary>Một câu của đề tổng hợp, kèm lĩnh vực và cấp của khóa đã cho câu hỏi.</summary>
public sealed record TrialPaperItem(Guid CategoryId, int Tier, PulseQuizQuestion Question);

public sealed record TrialPaper(IReadOnlyList<TrialDomainInfo> Domains, IReadOnlyList<TrialPaperItem> Items);

/// <summary>
/// Đề đánh giá tổng hợp dùng thử: với mỗi cấp (Cơ bản → Trung cấp → Nâng cao) và mỗi lĩnh vực, rút
/// <see cref="TrialProgramRules.ChoicePerCell"/> câu từ ngân hàng ôn tập của khóa chuẩn ở ô đó (<see cref="PulseCatalogReader"/>).
/// Thứ tự câu và phương án cố định cho mỗi nhân viên, nên lúc bắt đầu phiên và lúc nộp thấy đúng một đề.
/// </summary>
public class TrialAssessmentPaper
{
    private const int SeedSalt = 104729;

    private readonly IApplicationDbContext _context;
    private readonly PulseCatalogReader _catalog;
    private readonly PulseModuleReader _modules;

    public TrialAssessmentPaper(IApplicationDbContext context, PulseCatalogReader catalog, PulseModuleReader modules)
    {
        _context = context;
        _catalog = catalog;
        _modules = modules;
    }

    /// <summary>Các lĩnh vực có khóa chuẩn của doanh nghiệp, theo thứ tự của khung.</summary>
    public async Task<List<TrialDomainInfo>> LoadDomainsAsync(Guid organizationId)
    {
        var courses = await _catalog.LoadAsync(organizationId);
        return await DomainsOfAsync(courses, organizationId);
    }

    public async Task<TrialPaper> BuildAsync(Guid organizationId, Guid employeeId)
    {
        var courses = await _catalog.LoadAsync(organizationId);
        var domains = await DomainsOfAsync(courses, organizationId);
        var modules = await _modules.LoadModulesAsync(courses.Select(c => c.CourseId).ToList(), includeContent: false);
        var quizIds = modules.Values.SelectMany(m => m).Where(m => m.QuizAssessmentId.HasValue)
            .Select(m => m.QuizAssessmentId!.Value).Distinct().ToList();
        var pools = await LoadPoolsAsync(quizIds);

        var items = new List<TrialPaperItem>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var tier = 1; tier <= PulseRules.MaxLevel; tier++)
        {
            foreach (var domain in domains)
            {
                var course = courses.FirstOrDefault(c => c.CategoryId == domain.CategoryId && c.Tier == tier);
                List<PulseQuizQuestion> picked = new();

                if (course != null)
                {
                    var pool = (modules.GetValueOrDefault(course.CourseId) ?? new List<PulseModuleInfo>())
                        .Where(m => m.QuizAssessmentId.HasValue)
                        .SelectMany(m => pools.GetValueOrDefault(m.QuizAssessmentId!.Value) ?? new List<PulseQuizQuestion>())
                        .OrderBy(q => q.QuestionId)
                        .ToList();
                    var random = new Random(PulseQuizReader.Seed(employeeId, course.CourseId, SeedSalt));
                    picked = PulseQuizReader.Shuffle(pool, random)
                        .Where(q => q.Options.Count > 1 && seen.Add(q.Content.Trim()))
                        .Take(TrialProgramRules.ChoicePerCell)
                        .Select(q => q with { Options = PulseQuizReader.Shuffle(q.Options.ToList(), random) })
                        .ToList();
                }

                // Nếu khóa học chưa có câu hỏi hoặc chưa tạo, tự động bổ sung câu hỏi chuẩn theo lĩnh vực và cấp
                if (picked.Count == 0)
                {
                    var benchmark = GetBenchmarkQuestion(domain, tier);
                    if (seen.Add(benchmark.Content.Trim()))
                    {
                        picked.Add(benchmark);
                    }
                }

                items.AddRange(picked.Select(q => new TrialPaperItem(domain.CategoryId, tier, q)));
            }
        }

        return new TrialPaper(domains, items);
    }

    private async Task<List<TrialDomainInfo>> DomainsOfAsync(IReadOnlyCollection<PulseCourseRef> courses, Guid organizationId)
    {
        // 1. Tìm các lĩnh vực thuộc tổ chức hiện tại
        var categories = await _context.CompetencyCategories.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new { c.Id, c.Code, c.Name })
            .ToListAsync();

        // 2. Nếu tổ chức chưa có categories riêng thì lấy theo khóa học của tổ chức
        if (categories.Count == 0)
        {
            var categoryIds = courses.Select(c => c.CategoryId).Distinct().ToList();
            if (categoryIds.Count > 0)
            {
                categories = await _context.CompetencyCategories.AsNoTracking()
                    .Where(c => categoryIds.Contains(c.Id))
                    .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
                    .Select(c => new { c.Id, c.Code, c.Name })
                    .ToListAsync();
            }
        }

        // 3. Nếu vẫn trống (tổ chức hoàn toàn mới), lấy 6 danh mục chuẩn đầu tiên
        if (categories.Count == 0)
        {
            categories = await _context.CompetencyCategories.AsNoTracking()
                .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
                .Take(6)
                .Select(c => new { c.Id, c.Code, c.Name })
                .ToListAsync();
        }

        // Luôn đảm bảo chỉ lấy đúng 6 lĩnh vực chuẩn của Khung năng lực số (không trùng lặp, tối đa 6)
        return categories
            .GroupBy(c => PulseLearnerReader.DisplayName(c.Name))
            .Select(g => g.First())
            .Take(6)
            .Select((c, index) => new TrialDomainInfo(c.Id, index + 1, c.Code, PulseLearnerReader.DisplayName(c.Name)))
            .ToList();
    }

    private static PulseQuizQuestion GetBenchmarkQuestion(TrialDomainInfo domain, int tier)
    {
        var id = Guid.NewGuid();
        var (content, options) = (domain.Number, tier) switch
        {
            (1, 1) => ("Khi tìm kiếm tài liệu trên mạng, thao tác nào giúp lọc kết quả chính xác theo loại file PDF?",
                new[] { ("Thêm cú pháp 'filetype:pdf' vào ô tìm kiếm", true), ("Nhấp chuột phải chọn Save Page", false), ("Viết hoa toàn bộ từ khóa tìm kiếm", false), ("Chia sẻ liên kết lên mạng xã hội", false) }),
            (1, 2) => ("Công cụ hoặc tính năng nào trong bảng tính Excel/Google Sheets giúp tổng hợp và phân tích nhanh dữ liệu đa chiều?",
                new[] { ("Pivot Table (Bảng tổng hợp động)", true), ("Đổi màu chữ và nền ô tính", false), ("Tính năng Tìm và Thay thế (Find & Replace)", false), ("Chèn hình ảnh minh họa", false) }),
            (1, 3) => ("Phương pháp nào sau đây đảm bảo tính toàn vẹn và bảo mật của luồng dữ liệu (Data Pipeline) giữa các hệ thống?",
                new[] { ("Thiết lập quy trình ETL có cơ chế validation và mã hóa đường truyền", true), ("Lưu trữ dữ liệu vào USB hàng tuần", false), ("Gửi file đính kèm qua email cá nhân", false), ("Sao chép dữ liệu thủ công giữa các bảng", false) }),

            (2, 1) => ("Trong công việc hằng ngày, quy tắc nào cần tuân thủ khi gửi email chuyên nghiệp cho khách hàng hoặc đối tác?",
                new[] { ("Đặt tiêu đề rõ ràng, có lời chào và kiểm tra kỹ file đính kèm trước khi gửi", true), ("Viết toàn bộ nội dung bằng chữ in hoa để nhấn mạnh", false), ("Không cần ghi tiêu đề để người nhận tự mở thư xem", false), ("Sử dụng thật nhiều biểu tượng cảm xúc thân mật", false) }),
            (2, 2) => ("Khi điều phối dự án bằng công cụ quản lý công việc (Trello, Jira, Asana), bước nào là quan trọng nhất để các thành viên theo dõi tiến độ?",
                new[] { ("Phân công nhiệm vụ cụ thể, gán deadline và cập nhật trạng thái thẻ định kỳ", true), ("Chỉ nhắn tin trao đổi miệng ngoài hành lang", false), ("Tạo thẻ công việc nhưng không ghi người phụ trách", false), ("Để tất cả công việc ở cột Chưa hoàn thành", false) }),
            (2, 3) => ("Để xây dựng môi trường làm việc số cộng tác hiệu quả giữa nhiều phòng ban, giải pháp nào mang lại tác động bền vững nhất?",
                new[] { ("Chuẩn hóa hệ thống quản lý tri thức (Knowledge Base) và quy ước giao tiếp đa kênh", true), ("Cấm toàn bộ các cuộc họp trực tuyến", false), ("Sử dụng các ứng dụng chat riêng lẻ không đồng bộ", false), ("Chỉ cho phép giao việc bằng văn bản giấy", false) }),

            (3, 1) => ("Khi soạn thảo tài liệu văn bản chuẩn cho doanh nghiệp, thao tác nào giúp định dạng tiêu đề đồng nhất và tự động tạo mục lục?",
                new[] { ("Áp dụng các Heading Styles (Heading 1, 2, 3) có sẵn trong phần mềm", true), ("Bôi đen từng dòng và tăng cỡ chữ thủ công", false), ("Gõ dấu chấm kéo dài từ tiêu đề sang số trang", false), ("Đổi màu chữ tùy ý mỗi trang", false) }),
            (3, 2) => ("Khi thiết kế ấn phẩm truyền thông hoặc thuyết trình số, nguyên tắc nào giúp truyền tải thông điệp hiệu quả nhất?",
                new[] { ("Bố cục trực quan, phân cấp thông tin rõ ràng và chọn hình ảnh độ phân giải cao có bản quyền", true), ("Chèn thật nhiều chữ kín toàn bộ không gian trang", false), ("Dùng 10 kiểu font chữ khác nhau trên cùng một trang", false), ("Không cần chừa khoảng trắng để tiết kiệm diện tích", false) }),
            (3, 3) => ("Yếu tố nào quan trọng nhất khi xây dựng chiến lược nội dung số đa nền tảng cho tổ chức?",
                new[] { ("Đảm bảo tính nhất quán về thông điệp thương hiệu và đo lường tỷ lệ chuyển đổi qua công cụ Analytics", true), ("Đăng tải nội dung giống hệt nhau mà không tối ưu cho từng nền tảng", false), ("Không cần theo dõi phản hồi hay số liệu tương tác của người dùng", false), ("Chỉ tập trung vào số lượng bài viết mà không quan tâm chất lượng", false) }),

            (4, 1) => ("Biện pháp nào giúp bảo vệ tài khoản công việc cá nhân khỏi nguy cơ bị chiếm quyền truy cập?",
                new[] { ("Bật xác thực hai yếu tố (2FA) và dùng mật khẩu mạnh không trùng lặp", true), ("Dùng ngày tháng năm sinh làm mật khẩu cho dễ nhớ", false), ("Chia sẻ mật khẩu cho đồng nghiệp khi cần thiết", false), ("Không bao giờ đăng xuất tài khoản trên máy tính công cộng", false) }),
            (4, 2) => ("Khi nhận được email lạ yêu cầu nhấp vào liên kết để 'xác minh tài khoản ngân hàng công ty', bạn nên xử lý thế nào?",
                new[] { ("Không bấm vào liên kết, kiểm tra địa chỉ người gửi và báo cáo cho bộ phận CNTT / An toàn thông tin", true), ("Bấm ngay vào liên kết để tránh bị khóa tài khoản", false), ("Chuyển tiếp email cho toàn công ty cùng bấm thử", false), ("Điền ngay mật khẩu và mã OTP vào biểu mẫu hiện ra", false) }),
            (4, 3) => ("Chính sách nào sau đây là cốt lõi để bảo đảm an toàn dữ liệu khách hàng theo quy định bảo vệ dữ liệu cá nhân?",
                new[] { ("Phân quyền truy cập tối thiểu (Least Privilege), mã hóa dữ liệu nhạy cảm và kiểm toán nhật ký truy cập", true), ("Cho phép toàn bộ nhân viên tải toàn bộ cơ sở dữ liệu về máy tính cá nhân", false), ("Tắt tính năng sao lưu định kỳ để tiết kiệm dung lượng", false), ("Lưu trữ mật khẩu dưới dạng văn bản thuần không mã hóa", false) }),

            (5, 1) => ("Khi máy tính đột ngột không kết nối được Internet trong giờ làm việc, thao tác kiểm tra ban đầu nào là phù hợp nhất?",
                new[] { ("Kiểm tra kết nối dây cáp / Wi-Fi và khởi động lại card mạng hoặc thiết bị phát", true), ("Gọi bảo hành máy tính ngay lập tức", false), ("Cài đặt lại toàn bộ hệ điều hành", false), ("Rút toàn bộ nguồn điện máy tính", false) }),
            (5, 2) => ("Khi gặp lỗi trùng lặp dữ liệu trên tệp danh sách khách hàng lớn, phương án xử lý tối ưu là gì?",
                new[] { ("Sử dụng công cụ Highlight Duplicates hoặc Remove Duplicates trên phần mềm chuyên dụng", true), ("Dò từng dòng bằng mắt thường trên màn hình", false), ("Xóa toàn bộ file và nhập lại từ đầu", false), ("Bỏ qua và không cần chỉnh sửa dữ liệu", false) }),
            (5, 3) => ("Phương pháp nào hiệu quả nhất để xác định nguyên nhân gốc rễ (Root Cause) của sự cố nghẽn dữ liệu trong quy trình số của doanh nghiệp?",
                new[] { ("Phân tích 5 Whys, biểu đồ xương cá kết hợp phân tích log dữ liệu hệ thống", true), ("Suy đoán cảm tính mà không dựa trên dữ liệu", false), ("Đổ lỗi cho nhà cung cấp phần mềm mà không kiểm tra", false), ("Tăng gấp đôi nhân sự mà không tối ưu quy trình cốt lõi", false) }),

            (6, 1) => ("Khi sử dụng trợ lý AI (như ChatGPT, Gemini) để hỗ trợ công việc, cách viết prompt nào mang lại kết quả tốt nhất?",
                new[] { ("Cung cấp bối cảnh, vai trò cụ thể, yêu cầu rõ ràng và định dạng đầu ra mong muốn", true), ("Chỉ nhập một từ khóa chung chung", false), ("Viết tắt không dấu và thiếu ngữ cảnh", false), ("Yêu cầu AI đưa ra câu trả lời tuyệt đối mà không cần kiểm chứng", false) }),
            (6, 2) => ("Nguyên tắc bảo mật quan trọng nhất khi nhân viên sử dụng các công cụ AI tạo sinh công cộng là gì?",
                new[] { ("Không đưa dữ liệu nội bộ, thông tin cá nhân khách hàng hoặc mã nguồn bí mật của công ty vào prompt", true), ("Chia sẻ toàn bộ báo cáo tài chính nội bộ cho AI tóm tắt", false), ("Tắt các phần mềm diệt virus khi dùng AI", false), ("Lưu thông tin đăng nhập và mật khẩu vào prompt để AI ghi nhớ", false) }),
            _ => ("Ứng dụng nào sau đây thể hiện việc triển khai AI ở mức độ nâng cao trong tối ưu hóa vận hành doanh nghiệp?",
                new[] { ("Tích hợp mô hình ngôn ngữ lớn (RAG) với cơ sở tri thức nội bộ để tự động hóa hỗ trợ khách hàng và ra quyết định", true), ("Chỉ dùng AI để dịch một đoạn văn ngắn", false), ("Sao chép nguyên văn từ AI mà không kiểm chứng chuyên môn", false), ("Dùng AI tạo ảnh vui nhộn trong giờ làm việc", false) }),
        };

        var optionDtos = options.Select(o => new PulseQuizOption(Guid.NewGuid(), o.Item1, o.Item2)).ToList();
        return new PulseQuizQuestion(id, content, null, 1, optionDtos);
    }

    /// <summary>Ngân hàng câu hỏi của nhiều bài ôn tập trong hai truy vấn.</summary>
    private async Task<Dictionary<Guid, List<PulseQuizQuestion>>> LoadPoolsAsync(IReadOnlyCollection<Guid> quizIds)
    {
        if (quizIds.Count == 0)
        {
            return new Dictionary<Guid, List<PulseQuizQuestion>>();
        }

        var questions = await (
                from link in _context.AssessmentQuestions.AsNoTracking()
                join question in _context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                where quizIds.Contains(link.AssessmentId)
                select new { link.AssessmentId, question.Id, question.Content, question.Explanation, link.SortOrder })
            .ToListAsync();
        var ids = questions.Select(q => q.Id).Distinct().ToList();
        var options = (await _context.QuestionOptions.AsNoTracking()
                .Where(o => ids.Contains(o.QuestionId))
                .OrderBy(o => o.SortOrder)
                .Select(o => new { o.Id, o.QuestionId, o.Content, o.IsCorrect })
                .ToListAsync())
            .GroupBy(o => o.QuestionId)
            .ToDictionary(g => g.Key, g => g.Select(o => new PulseQuizOption(o.Id, o.Content, o.IsCorrect)).ToList());

        return questions
            .GroupBy(q => q.AssessmentId)
            .ToDictionary(g => g.Key, g => g
                .OrderBy(q => q.SortOrder)
                .Select(q => new PulseQuizQuestion(q.Id, q.Content, q.Explanation, q.SortOrder,
                    options.GetValueOrDefault(q.Id) ?? new List<PulseQuizOption>()))
                .ToList());
    }

    /// <summary>Đề phát cho nhân viên (không kèm đáp án), đánh số liên tục qua ba cấp.</summary>
    public static List<TrialExamQuestionDto> ToDto(TrialPaper paper) =>
        paper.Items.Select((item, index) => new TrialExamQuestionDto
        {
            QuestionId = item.Question.QuestionId,
            Number = index + 1,
            Tier = item.Tier,
            DomainNumber = paper.Domains.First(d => d.CategoryId == item.CategoryId).Number,
            DomainName = paper.Domains.First(d => d.CategoryId == item.CategoryId).Name,
            Content = item.Question.Content,
            Options = item.Question.Options.Select(o => new PulseOptionDto { OptionId = o.OptionId, Content = o.Content }).ToList(),
        }).ToList();
}

/// <summary>Một câu trắc nghiệm của đề tổng hợp.</summary>
public class TrialExamQuestionDto
{
    public Guid QuestionId { get; set; }
    public int Number { get; set; }
    /// <summary>Cấp của câu: 1 Cơ bản, 2 Trung cấp, 3 Nâng cao.</summary>
    public int Tier { get; set; }
    public int DomainNumber { get; set; }
    public string DomainName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<PulseOptionDto> Options { get; set; } = new();
}
