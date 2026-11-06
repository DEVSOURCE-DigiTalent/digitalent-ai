using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
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
        await EnsureBenchmarkQuestionsAsync(organizationId);

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

                // Nếu khóa học chưa có đủ câu hỏi hoặc chưa tạo, tự động bổ sung câu hỏi chuẩn theo lĩnh vực và cấp
                if (picked.Count < TrialProgramRules.ChoicePerCell)
                {
                    var benchmarks = GetBenchmarkQuestions(domain, tier);
                    foreach (var b in benchmarks)
                    {
                        if (picked.Count >= TrialProgramRules.ChoicePerCell) break;
                        if (seen.Add(b.Content.Trim()))
                        {
                            picked.Add(b);
                        }
                    }
                }

                items.AddRange(picked.Select(q => new TrialPaperItem(domain.CategoryId, tier, q)));
            }
        }

        return new TrialPaper(domains, items);
    }

    /// <summary>Đảm bảo 54 câu hỏi chuẩn (6 lĩnh vực × 3 cấp × 3 câu) và các đáp án tồn tại trong cơ sở dữ liệu.</summary>
    public async Task EnsureBenchmarkQuestionsAsync(Guid organizationId)
    {
        var bank = await _context.QuestionBanks.FirstOrDefaultAsync(b => b.OrganizationId == organizationId)
                   ?? await _context.QuestionBanks.FirstOrDefaultAsync();
        var user = await _context.Users.FirstOrDefaultAsync();
        if (user == null) return;

        var now = DateTimeOffset.UtcNow;
        if (bank == null)
        {
            bank = new QuestionBank
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                Title = "Ngân hàng chuẩn đánh giá",
                OwnerUserId = user.Id,
                Status = "ACTIVE",
                CreatedAt = now,
                UpdatedAt = now,
            };
            _context.QuestionBanks.Add(bank);
        }

        var anyAdded = false;
        for (var d = 1; d <= 6; d++)
        {
            for (var tier = 1; tier <= PulseRules.MaxLevel; tier++)
            {
                var bqs = GetBenchmarkQuestions(new TrialDomainInfo(Guid.Empty, d, $"D{d}", $"Lĩnh vực {d}"), tier);
                foreach (var bq in bqs)
                {
                    if (await _context.Questions.AnyAsync(q => q.Id == bq.QuestionId)) continue;

                    var qEntity = new Question
                    {
                        Id = bq.QuestionId,
                        BankId = bank.Id,
                        QuestionType = Statuses.QuestionType.MultipleChoice,
                        Difficulty = tier switch { 1 => "BASIC", 2 => "INTERMEDIATE", _ => "ADVANCED" },
                        Content = bq.Content,
                        Status = Statuses.Question.Approved,
                        CreatedByUserId = user.Id,
                        CreatedAt = now,
                        UpdatedAt = now,
                    };
                    _context.Questions.Add(qEntity);

                    for (var idx = 0; idx < bq.Options.Count; idx++)
                    {
                        var opt = bq.Options[idx];
                        _context.QuestionOptions.Add(new QuestionOption
                        {
                            Id = opt.OptionId,
                            QuestionId = bq.QuestionId,
                            Content = opt.Content,
                            IsCorrect = opt.IsCorrect,
                            SortOrder = idx + 1,
                            CreatedAt = now,
                            UpdatedAt = now,
                        });
                    }
                    anyAdded = true;
                }
            }
        }

        if (anyAdded)
        {
            await _context.SaveChangesAsync();
        }
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

    private static PulseQuizQuestion GetBenchmarkQuestion(TrialDomainInfo domain, int tier) =>
        GetBenchmarkQuestions(domain, tier)[0];

    private static IReadOnlyList<PulseQuizQuestion> GetBenchmarkQuestions(TrialDomainInfo domain, int tier)
    {
        var list = new List<PulseQuizQuestion>(3);
        var rawList = (domain.Number, tier) switch
        {
            (1, 1) => new (string, (string, bool)[])[]
            {
                (@"Khi tìm kiếm tài liệu trên mạng, thao tác nào giúp lọc kết quả chính xác theo loại file PDF?",
                    new[] {
                        (@"Thêm cú pháp 'filetype:pdf' vào ô tìm kiếm", true),
                        (@"Nhấp chuột phải chọn Save Page", false),
                        (@"Viết hoa toàn bộ từ khóa tìm kiếm", false),
                        (@"Chia sẻ liên kết lên mạng xã hội", false),
                    }),
                (@"Khi cần lưu trữ và đồng bộ hóa tài liệu làm việc lên đám mây (Google Drive, OneDrive), thao tác nào giúp tránh mất dữ liệu khi làm việc nhóm?",
                    new[] {
                        (@"Bật tính năng đồng bộ tự động và quản lý lịch sử phiên bản (Version History)", true),
                        (@"Chỉ lưu tệp trên màn hình Desktop cá nhân", false),
                        (@"Tắt tính năng chia sẻ tệp với mọi người", false),
                        (@"Đổi tên tệp mỗi khi có người mới mở xem tài liệu", false),
                    }),
                (@"Để đánh giá tính xác thực của một nguồn thông tin tìm thấy trên Internet trước khi sử dụng trong báo cáo, bước nào sau đây là cần thiết nhất?",
                    new[] {
                        (@"Đối chiếu với các nguồn uy tín chính thống, kiểm tra tác giả và ngày công bố", true),
                        (@"Chỉ cần xem trang web đó có nhiều lượt xem hay không", false),
                        (@"Tin tưởng hoàn toàn vào kết quả đầu tiên xuất hiện trên công cụ tìm kiếm", false),
                        (@"Chỉ sử dụng thông tin từ bài viết trên mạng xã hội cá nhân", false),
                    }),
            },
            (1, 2) => new (string, (string, bool)[])[]
            {
                (@"Công cụ hoặc tính năng nào trong bảng tính Excel/Google Sheets giúp tổng hợp và phân tích nhanh dữ liệu đa chiều?",
                    new[] {
                        (@"Pivot Table (Bảng tổng hợp động)", true),
                        (@"Đổi màu chữ và nền ô tính", false),
                        (@"Tính năng Tìm và Thay thế (Find & Replace)", false),
                        (@"Chèn hình ảnh minh họa", false),
                    }),
                (@"Trong Excel hoặc Google Sheets, hàm nào sau đây tối ưu nhất để tra cứu giá trị theo một tiêu chuẩn cho trước từ một bảng dữ liệu danh mục?",
                    new[] {
                        (@"XLOOKUP hoặc VLOOKUP kết hợp INDEX-MATCH", true),
                        (@"SUMIF", false),
                        (@"CONCATENATE", false),
                        (@"COUNTBLANK", false),
                    }),
                (@"Khi làm sạch dữ liệu (Data Cleaning) trước khi phân tích báo cáo doanh thu, thao tác nào giúp loại bỏ các giá trị dị biệt hoặc định dạng ngày tháng không nhất quán?",
                    new[] {
                        (@"Sử dụng Data Validation, chuẩn hóa Text to Columns hoặc công cụ Power Query", true),
                        (@"Xóa toàn bộ các dòng có chứa số lẻ", false),
                        (@"Chỉ sửa thủ công một vài dòng đầu tiên", false),
                        (@"Đổi màu chữ các dòng bị lỗi sang màu đỏ", false),
                    }),
            },
            (1, 3) => new (string, (string, bool)[])[]
            {
                (@"Phương pháp nào sau đây đảm bảo tính toàn vẹn và bảo mật của luồng dữ liệu (Data Pipeline) giữa các hệ thống?",
                    new[] {
                        (@"Thiết lập quy trình ETL có cơ chế validation và mã hóa đường truyền", true),
                        (@"Lưu trữ dữ liệu vào USB hàng tuần", false),
                        (@"Gửi file đính kèm qua email cá nhân", false),
                        (@"Sao chép dữ liệu thủ công giữa các bảng", false),
                    }),
                (@"Mô hình Data Warehouse (Kho dữ liệu) hiện đại phân biệt thế nào giữa dữ liệu có cấu trúc (Structured) và phi cấu trúc (Unstructured) trong khai thác Business Intelligence?",
                    new[] {
                        (@"Dữ liệu cấu trúc lưu trong bảng quan hệ phục vụ OLAP, dữ liệu phi cấu trúc lưu trữ trong Data Lake phục vụ xử lý phân tích nâng cao", true),
                        (@"Dữ liệu phi cấu trúc không thể lưu trữ hay phân tích", false),
                        (@"Chỉ có bảng tính Excel mới được coi là dữ liệu có cấu trúc", false),
                        (@"Mọi dữ liệu doanh nghiệp đều bắt buộc chuyển thành tệp CSV phẳng", false),
                    }),
                (@"Để đảm bảo tuân thủ nguyên tắc quản trị dữ liệu (Data Governance), doanh nghiệp cần thiết lập quy chế nào đối với vòng đời dữ liệu (Data Lifecycle)?",
                    new[] {
                        (@"Quy định rõ ràng về thu thập, lưu trữ, phân quyền truy cập, sao lưu và thời hạn tiêu hủy an toàn dữ liệu", true),
                        (@"Lưu trữ dữ liệu vô thời hạn trên tất cả máy tính cá nhân của nhân viên", false),
                        (@"Chỉ bảo vệ dữ liệu khi cơ quan quản lý nhà nước đến thanh tra", false),
                        (@"Cấm hoàn toàn việc chia sẻ dữ liệu giữa các bộ phận trong nội bộ", false),
                    }),
            },
            (2, 1) => new (string, (string, bool)[])[]
            {
                (@"Trong công việc hằng ngày, quy tắc nào cần tuân thủ khi gửi email chuyên nghiệp cho khách hàng hoặc đối tác?",
                    new[] {
                        (@"Đặt tiêu đề rõ ràng, có lời chào và kiểm tra kỹ file đính kèm trước khi gửi", true),
                        (@"Viết toàn bộ nội dung bằng chữ in hoa để nhấn mạnh", false),
                        (@"Không cần ghi tiêu đề để người nhận tự mở thư xem", false),
                        (@"Sử dụng thật nhiều biểu tượng cảm xúc thân mật", false),
                    }),
                (@"Khi chia sẻ một tài liệu trực tuyến (Google Docs/OneDrive) cho đồng nghiệp chỉ để xem xét và phản hồi, bạn nên phân quyền thế nào?",
                    new[] {
                        (@"Cấp quyền 'Người nhận xét' (Commenter) hoặc 'Người xem' (Viewer)", true),
                        (@"Cấp quyền 'Chủ sở hữu' (Owner) cho tất cả mọi người", false),
                        (@"Công khai liên kết cho bất kỳ ai trên Internet chỉnh sửa tự do", false),
                        (@"Tải file về gửi qua tin nhắn chat cá nhân mà không lưu trên đám mây", false),
                    }),
                (@"Quy tắc văn hóa ứng xử số (Netiquette) nào quan trọng khi tham gia trao đổi trong nhóm chat công việc của công ty?",
                    new[] {
                        (@"Giao tiếp lịch sự, đúng trọng tâm, tôn trọng giờ nghỉ và không phát tán thông tin chưa kiểm chứng", true),
                        (@"Spam liên tục các hình ảnh hài hước trong giờ họp khẩn", false),
                        (@"Sử dụng từ ngữ suồng sã, công kích cá nhân khi có bất đồng quan điểm", false),
                        (@"Tự ý mời người ngoài công ty vào nhóm nội bộ bí mật", false),
                    }),
            },
            (2, 2) => new (string, (string, bool)[])[]
            {
                (@"Khi điều phối dự án bằng công cụ quản lý công việc (Trello, Jira, Asana), bước nào là quan trọng nhất để các thành viên theo dõi tiến độ?",
                    new[] {
                        (@"Phân công nhiệm vụ cụ thể, gán deadline và cập nhật trạng thái thẻ định kỳ", true),
                        (@"Chỉ nhắn tin trao đổi miệng ngoài hành lang", false),
                        (@"Tạo thẻ công việc nhưng không ghi người phụ trách", false),
                        (@"Để tất cả công việc ở cột Chưa hoàn thành", false),
                    }),
                (@"Khi tổ chức một cuộc họp trực tuyến (Zoom, Microsoft Teams, Google Meet) có nhiều bên tham gia, hành động nào đảm bảo hiệu quả cuộc họp?",
                    new[] {
                        (@"Gửi trước chương trình họp (Agenda), phân công người ghi biên bản và kiểm tra thiết bị trước giờ họp", true),
                        (@"Mở cuộc họp mà không có mục tiêu rõ ràng và để tự do nói", false),
                        (@"Yêu cầu tất cả mọi người cùng bật micro nói cùng lúc", false),
                        (@"Không chia sẻ màn hình tài liệu để mọi người tự tìm", false),
                    }),
                (@"Khi nhiều thành viên cùng chỉnh sửa một tài liệu báo cáo quan trọng trên Google Docs/Microsoft 365, tính năng nào giúp theo dõi ai đã sửa những gì?",
                    new[] {
                        (@"Lịch sử phiên bản (Version History) và chế độ Đề xuất (Suggesting mode)", true),
                        (@"Tính năng phóng to màn hình (Zoom in)", false),
                        (@"Tính năng Tìm kiếm từ khóa (Ctrl + F)", false),
                        (@"Tính năng in tài liệu ra giấy", false),
                    }),
            },
            (2, 3) => new (string, (string, bool)[])[]
            {
                (@"Để xây dựng môi trường làm việc số cộng tác hiệu quả giữa nhiều phòng ban, giải pháp nào mang lại tác động bền vững nhất?",
                    new[] {
                        (@"Chuẩn hóa hệ thống quản lý tri thức (Knowledge Base) và quy ước giao tiếp đa kênh", true),
                        (@"Cấm toàn bộ các cuộc họp trực tuyến", false),
                        (@"Sử dụng các ứng dụng chat riêng lẻ không đồng bộ", false),
                        (@"Chỉ cho phép giao việc bằng văn bản giấy", false),
                    }),
                (@"Để tối ưu hóa năng suất làm việc nhóm trong mô hình Hybrid (kết hợp làm từ xa và tại văn phòng), nguyên tắc giao tiếp nào là trọng tâm?",
                    new[] {
                        (@"Ưu tiên giao tiếp bất đồng bộ (Asynchronous communication) qua văn bản chuẩn và hệ sinh thái tài liệu tập trung", true),
                        (@"Bắt buộc mọi người phải họp trực tuyến liên tục suốt 8 tiếng mỗi ngày", false),
                        (@"Chỉ liên lạc qua các cuộc gọi khẩn cấp bằng điện thoại cá nhân", false),
                        (@"Không quy định kênh liên lạc chính thức, ai thích dùng gì thì dùng", false),
                    }),
                (@"Khi thiết lập quy trình làm việc liên phòng ban trên nền tảng số, giải pháp nào giúp tự động hóa việc đồng bộ dữ liệu và thông báo?",
                    new[] {
                        (@"Sử dụng Webhook hoặc các công cụ tích hợp tự động (Zapier, Power Automate, Make) kết nối các hệ thống", true),
                        (@"Thuê nhân sự chuyên ngồi gõ lại dữ liệu từ phần mềm này sang phần mềm khác", false),
                        (@"Chụp ảnh màn hình rồi gửi email cho từng trưởng phòng", false),
                        (@"In phiếu giấy sang phòng ban khác ký nhận định kỳ mỗi giờ", false),
                    }),
            },
            (3, 1) => new (string, (string, bool)[])[]
            {
                (@"Khi soạn thảo tài liệu văn bản chuẩn cho doanh nghiệp, thao tác nào giúp định dạng tiêu đề đồng nhất và tự động tạo mục lục?",
                    new[] {
                        (@"Áp dụng các Heading Styles (Heading 1, 2, 3) có sẵn trong phần mềm", true),
                        (@"Bôi đen từng dòng và tăng cỡ chữ thủ công", false),
                        (@"Gõ dấu chấm kéo dài từ tiêu đề sang số trang", false),
                        (@"Đổi màu chữ tùy ý mỗi trang", false),
                    }),
                (@"Khi xuất một tài liệu báo cáo gửi đối tác để đảm bảo giữ nguyên định dạng trên mọi thiết bị và hạn chế bị sửa nội dung, định dạng nào phù hợp nhất?",
                    new[] {
                        (@"Định dạng PDF", true),
                        (@"Định dạng văn bản thô .txt", false),
                        (@"Định dạng bảng tính .csv", false),
                        (@"Định dạng trang web .html lưu cục bộ", false),
                    }),
                (@"Khi chuẩn bị bài trình chiếu (PowerPoint, Google Slides), nguyên tắc phân bổ nội dung trên một slide nào giúp người nghe dễ theo dõi?",
                    new[] {
                        (@"Áp dụng nguyên tắc '1 ý tưởng cốt lõi mỗi slide', dùng gạch đầu dòng ngắn gọn và hình ảnh trực quan", true),
                        (@"Chép nguyên một đoạn văn dài 20 dòng vào slide và đọc lại", false),
                        (@"Dùng thật nhiều hiệu ứng hoạt hình bay lượn gây chú ý", false),
                        (@"Dùng 5 cỡ chữ khác nhau và nhiều màu sặc sỡ trên từng chữ", false),
                    }),
            },
            (3, 2) => new (string, (string, bool)[])[]
            {
                (@"Khi thiết kế ấn phẩm truyền thông hoặc thuyết trình số, nguyên tắc nào giúp truyền tải thông điệp hiệu quả nhất?",
                    new[] {
                        (@"Bố cục trực quan, phân cấp thông tin rõ ràng và chọn hình ảnh độ phân giải cao có bản quyền", true),
                        (@"Chèn thật nhiều chữ kín toàn bộ không gian trang", false),
                        (@"Dùng 10 kiểu font chữ khác nhau trên cùng một trang", false),
                        (@"Không cần chừa khoảng trắng để tiết kiệm diện tích", false),
                    }),
                (@"Khi sử dụng hình ảnh từ Internet để thiết kế tài liệu nội bộ hoặc truyền thông doanh nghiệp, loại giấy phép nào cho phép sử dụng miễn phí hợp pháp?",
                    new[] {
                        (@"Giấy phép Creative Commons (CC) hoặc giấy phép phạm vi công cộng (Public Domain / CCO)", true),
                        (@"Bất kỳ hình ảnh nào tìm thấy trên Google Images đều dùng tự do", false),
                        (@"Chỉ cần xóa mờ chữ ký của tác giả là được phép dùng", false),
                        (@"Chụp lại màn hình tác phẩm của người khác là biến thành tác phẩm của mình", false),
                    }),
                (@"Để tạo một infographic trực quan tóm tắt dữ liệu khảo sát khách hàng của công ty, quy trình thiết kế chuẩn gồm những bước nào?",
                    new[] {
                        (@"Lọc dữ liệu trọng tâm, chọn loại biểu đồ phù hợp, phân cấp thông tin và áp dụng bảng màu nhận diện thương hiệu", true),
                        (@"Chèn tất cả số liệu vào một bảng lớn không cần tiêu đề", false),
                        (@"Vẽ biểu đồ hình tròn với hơn 30 múi phân mảnh nhỏ", false),
                        (@"Chỉ dùng chữ viết hoa toàn bộ mà không dùng bất kỳ hình ảnh nào", false),
                    }),
            },
            (3, 3) => new (string, (string, bool)[])[]
            {
                (@"Yếu tố nào quan trọng nhất khi xây dựng chiến lược nội dung số đa nền tảng cho tổ chức?",
                    new[] {
                        (@"Đảm bảo tính nhất quán về thông điệp thương hiệu và đo lường tỷ lệ chuyển đổi qua công cụ Analytics", true),
                        (@"Đăng tải nội dung giống hệt nhau mà không tối ưu cho từng nền tảng", false),
                        (@"Không cần theo dõi phản hồi hay số liệu tương tác của người dùng", false),
                        (@"Chỉ tập trung vào số lượng bài viết mà không quan tâm chất lượng", false),
                    }),
                (@"Trong chiến lược tiếp thị nội dung (Content Marketing) của doanh nghiệp, chỉ số nào đo lường mức độ tương tác thực chất của độc giả với bài viết?",
                    new[] {
                        (@"Thời gian đọc trung bình trên trang (Time on page), tỷ lệ cuộn trang (Scroll depth) và tỷ lệ chuyển đổi (Conversion Rate)", true),
                        (@"Tổng số lần nhấn nút F5 làm mới trang của nhân viên nội bộ", false),
                        (@"Chỉ dựa vào số lượng từ trong bài viết càng dài càng tốt", false),
                        (@"Số lượng thẻ tag từ khóa nhồi nhét dưới chân bài viết", false),
                    }),
                (@"Để bảo vệ quyền sở hữu trí tuệ đối với các sản phẩm nội dung số (tài liệu đào tạo, video, mã nguồn) do doanh nghiệp sản xuất, biện pháp nào hiệu quả?",
                    new[] {
                        (@"Đăng ký bản quyền tác giả, chèn dấu mờ nhận diện (Watermark) và ký thỏa thuận bảo mật tài sản trí tuệ với nhân sự", true),
                        (@"Không lưu trữ trên máy tính mà chỉ in ra giấy cất vào tủ", false),
                        (@"Đăng tải lên các diễn đàn công cộng ẩn danh", false),
                        (@"Không làm gì vì tài sản số không thể bảo hộ được", false),
                    }),
            },
            (4, 1) => new (string, (string, bool)[])[]
            {
                (@"Biện pháp nào giúp bảo vệ tài khoản công việc cá nhân khỏi nguy cơ bị chiếm quyền truy cập?",
                    new[] {
                        (@"Bật xác thực hai yếu tố (2FA) và dùng mật khẩu mạnh không trùng lặp", true),
                        (@"Dùng ngày tháng năm sinh làm mật khẩu cho dễ nhớ", false),
                        (@"Chia sẻ mật khẩu cho đồng nghiệp khi cần thiết", false),
                        (@"Không bao giờ đăng xuất tài khoản trên máy tính công cộng", false),
                    }),
                (@"Khi làm việc tại các địa điểm công cộng (quán cà phê, sân bay), hành vi nào tiềm ẩn nguy cơ cao bị đánh cắp tài khoản?",
                    new[] {
                        (@"Kết nối vào mạng Wi-Fi công cộng không có mật khẩu và đăng nhập vào hệ thống nội bộ không dùng VPN", true),
                        (@"Cắm tai nghe nghe nhạc trên máy tính", false),
                        (@"Tắt kết nối Bluetooth trên điện thoại khi không dùng", false),
                        (@"Đóng các ứng dụng khi không sử dụng", false),
                    }),
                (@"Dấu hiệu nào sau đây cho thấy máy tính của bạn có khả năng đã bị nhiễm phần mềm độc hại (Malware)?",
                    new[] {
                        (@"Máy chạy rất chậm bất thường, tự động bật các cửa sổ quảng cáo lạ và tệp tin bị đổi đuôi hoặc biến mất", true),
                        (@"Màn hình hiển thị đúng hình nền đã cài đặt", false),
                        (@"Ứng dụng văn phòng mở bình thường khi nhấp chuột", false),
                        (@"Thời gian hệ thống hiển thị đúng giờ Việt Nam", false),
                    }),
            },
            (4, 2) => new (string, (string, bool)[])[]
            {
                (@"Khi nhận được email lạ yêu cầu nhấp vào liên kết để 'xác minh tài khoản ngân hàng công ty', bạn nên xử lý thế nào?",
                    new[] {
                        (@"Không bấm vào liên kết, kiểm tra địa chỉ người gửi và báo cáo cho bộ phận CNTT / An toàn thông tin", true),
                        (@"Bấm ngay vào liên kết để tránh bị khóa tài khoản", false),
                        (@"Chuyển tiếp email cho toàn công ty cùng bấm thử", false),
                        (@"Điền ngay mật khẩu và mã OTP vào biểu mẫu hiện ra", false),
                    }),
                (@"Để đảm bảo dữ liệu quan trọng không bị mất mát do sự cố ổ cứng hoặc ransomware, chính sách sao lưu chuẩn 3-2-1 được hiểu như thế nào?",
                    new[] {
                        (@"Có ít nhất 3 bản sao, lưu trên 2 loại phương tiện khác nhau, và 1 bản lưu tại một vị trí ngoài thực tế (Off-site/Đám mây)", true),
                        (@"Sao lưu 3 lần trong ngày vào 2 thư mục trên 1 máy tính duy nhất", false),
                        (@"Chỉ cần lưu 1 bản duy nhất trên thẻ nhớ USB", false),
                        (@"Sao lưu dữ liệu sang máy tính của đồng nghiệp ngồi cạnh", false),
                    }),
                (@"Khi cài đặt phần mềm mới trên thiết bị làm việc, nguyên tắc an toàn thông tin nào nhân viên cần tuân thủ?",
                    new[] {
                        (@"Chỉ cài đặt phần mềm có bản quyền từ danh mục được bộ phận CNTT phê duyệt và kiểm tra nguồn gốc", true),
                        (@"Tải các bản bẻ khóa (Crack/Keygen) từ các diễn đàn chia sẻ trên mạng", false),
                        (@"Cho phép phần mềm tự động truy cập toàn quyền quản trị (Administrator) mà không kiểm tra", false),
                        (@"Tắt tính năng diệt virus khi hệ điều hành cảnh báo tệp nguy hiểm", false),
                    }),
            },
            (4, 3) => new (string, (string, bool)[])[]
            {
                (@"Chính sách nào sau đây là cốt lõi để bảo đảm an toàn dữ liệu khách hàng theo quy định bảo vệ dữ liệu cá nhân?",
                    new[] {
                        (@"Phân quyền truy cập tối thiểu (Least Privilege), mã hóa dữ liệu nhạy cảm và kiểm toán nhật ký truy cập", true),
                        (@"Cho phép toàn bộ nhân viên tải toàn bộ cơ sở dữ liệu về máy tính cá nhân", false),
                        (@"Tắt tính năng sao lưu định kỳ để tiết kiệm dung lượng", false),
                        (@"Lưu trữ mật khẩu dưới dạng văn bản thuần không mã hóa", false),
                    }),
                (@"Mô hình bảo mật Zero Trust (Không tin tưởng bất kỳ ai, luôn xác thực) trong kiến trúc an toàn thông tin doanh nghiệp yêu cầu điều gì?",
                    new[] {
                        (@"Liên tục xác thực danh tính, kiểm tra tính toàn vẹn thiết bị và giới hạn quyền truy cập ở mức tối thiểu cho mọi kết nối", true),
                        (@"Chỉ cần đăng nhập một lần từ mạng nội bộ công ty là được tin cậy mãi mãi", false),
                        (@"Cấm hoàn toàn nhân viên làm việc từ xa ngoài trụ sở công ty", false),
                        (@"Chia sẻ mật khẩu dùng chung giữa các nhân viên trong cùng một phòng ban", false),
                    }),
                (@"Khi phát hiện một sự cố rò rỉ dữ liệu khách hàng nghiêm trọng, quy trình phản ứng sự cố (Incident Response Plan) gồm các bước theo thứ tự nào?",
                    new[] {
                        (@"Phát hiện và nhận diện -> Cô lập phạm vi ảnh hưởng -> Triệt tiêu mối đe dọa -> Khôi phục hệ thống -> Đánh giá rút kinh nghiệm", true),
                        (@"Xóa toàn bộ log hệ thống để che giấu sự cố", false),
                        (@"Đổ lỗi công khai cho nhân viên trực ca mà không tìm giải pháp", false),
                        (@"Chờ đợi khách hàng phản ánh rồi mới bắt đầu kiểm tra", false),
                    }),
            },
            (5, 1) => new (string, (string, bool)[])[]
            {
                (@"Khi máy tính đột ngột không kết nối được Internet trong giờ làm việc, thao tác kiểm tra ban đầu nào là phù hợp nhất?",
                    new[] {
                        (@"Kiểm tra kết nối dây cáp / Wi-Fi và khởi động lại card mạng hoặc thiết bị phát", true),
                        (@"Gọi bảo hành máy tính ngay lập tức", false),
                        (@"Cài đặt lại toàn bộ hệ điều hành", false),
                        (@"Rút toàn bộ nguồn điện máy tính", false),
                    }),
                (@"Khi một ứng dụng trên máy tính bị treo (Not Responding) và không bấm được nút tắt, thao tác nào xử lý hiệu quả mà không cần tắt nguồn cưỡng bức?",
                    new[] {
                        (@"Mở Task Manager (Ctrl + Shift + Esc) và chọn End Task ứng dụng bị treo", true),
                        (@"Nhấn liên tục nút nguồn máy tính để sập nguồn ngay", false),
                        (@"Rút phích cắm điện của máy tính để bàn", false),
                        (@"Bấm liên tục chuột trái vào màn hình hàng chục lần", false),
                    }),
                (@"Khi trình duyệt web của bạn liên tục bị chuyển hướng đến các trang quảng cáo lạ, biện pháp khắc phục ban đầu nào là phù hợp?",
                    new[] {
                        (@"Kiểm tra và gỡ các tiện ích mở rộng (Extensions) đáng ngờ, xóa bộ nhớ cache và quét virus", true),
                        (@"Mua máy tính mới ngay lập tức", false),
                        (@"Tiếp tục bấm vào các liên kết quảng cáo đó", false),
                        (@"Đổi tên trình duyệt web trên màn hình Desktop", false),
                    }),
            },
            (5, 2) => new (string, (string, bool)[])[]
            {
                (@"Khi gặp lỗi trùng lặp dữ liệu trên tệp danh sách khách hàng lớn, phương án xử lý tối ưu là gì?",
                    new[] {
                        (@"Sử dụng công cụ Highlight Duplicates hoặc Remove Duplicates trên phần mềm chuyên dụng", true),
                        (@"Dò từng dòng bằng mắt thường trên màn hình", false),
                        (@"Xóa toàn bộ file và nhập lại từ đầu", false),
                        (@"Bỏ qua và không cần chỉnh sửa dữ liệu", false),
                    }),
                (@"Khi gặp một thông báo mã lỗi (Error Code) kỹ thuật lạ trong quá trình vận hành phần mềm công ty, cách tra cứu nào giúp xử lý nhanh nhất?",
                    new[] {
                        (@"Tìm kiếm nguyên văn mã lỗi kèm tên phần mềm trên tài liệu hỗ trợ chính thức (Documentation/Community)", true),
                        (@"Bỏ qua thông báo và tiếp tục làm việc bình thường", false),
                        (@"Chụp ảnh gửi lên mạng xã hội cá nhân nhờ cộng đồng đoán lỗi", false),
                        (@"Cài đặt lại toàn bộ hệ điều hành Windows", false),
                    }),
                (@"Kỹ thuật '5 Whys' (5 câu hỏi Tại sao) thường được ứng dụng trong môi trường số nhằm mục đích gì?",
                    new[] {
                        (@"Đào sâu tìm nguyên nhân gốc rễ (Root Cause) của sự cố thay vì chỉ giải quyết triệu chứng bề mặt", true),
                        (@"Hỏi 5 đồng nghiệp xem ai là người gây ra lỗi", false),
                        (@"Yêu cầu hệ thống giải thích 5 lần trước khi báo cáo sếp", false),
                        (@"Lặp lại câu hỏi để kéo dài thời gian hoàn thành công việc", false),
                    }),
            },
            (5, 3) => new (string, (string, bool)[])[]
            {
                (@"Phương pháp nào hiệu quả nhất để xác định nguyên nhân gốc rễ (Root Cause) của sự cố nghẽn dữ liệu trong quy trình số của doanh nghiệp?",
                    new[] {
                        (@"Phân tích 5 Whys, biểu đồ xương cá kết hợp phân tích log dữ liệu hệ thống", true),
                        (@"Suy đoán cảm tính mà không dựa trên dữ liệu", false),
                        (@"Đổ lỗi cho nhà cung cấp phần mềm mà không kiểm tra", false),
                        (@"Tăng gấp đôi nhân sự mà không tối ưu quy trình cốt lõi", false),
                    }),
                (@"Khi doanh nghiệp quyết định tự động hóa một quy trình nghiệp vụ thủ công (RPA - Robotic Process Automation), bước đánh giá tiên quyết là gì?",
                    new[] {
                        (@"Chuẩn hóa và tối ưu quy trình nghiệp vụ hiện tại, đảm bảo quy trình có tính lặp lại và quy tắc rõ ràng", true),
                        (@"Áp dụng ngay công nghệ tự động hóa trên quy trình đang bị phân mảnh và nhiều lỗi", false),
                        (@"Mua giấy phép phần mềm đắt nhất trên thị trường mà không cần phân tích quy trình", false),
                        (@"Yêu cầu sa thải toàn bộ nhân viên đang làm quy trình thủ công đó", false),
                    }),
                (@"Chỉ số nào quan trọng nhất khi đánh giá hiệu quả đầu tư (ROI) của một dự án chuyển đổi giải pháp công nghệ số trong doanh nghiệp?",
                    new[] {
                        (@"Mức độ tiết kiệm chi phí, tỷ lệ giảm thời gian xử lý chu trình và mức tăng trưởng năng suất lao động", true),
                        (@"Số lượng trang tài liệu hướng dẫn sử dụng phần mềm dày bao nhiêu trang", false),
                        (@"Giao diện phần mềm có nhiều hiệu ứng chuyển động bắt mắt hay không", false),
                        (@"Tốc độ cài đặt phần mềm mất bao nhiêu phút", false),
                    }),
            },
            (6, 1) => new (string, (string, bool)[])[]
            {
                (@"Khi sử dụng trợ lý AI (như ChatGPT, Gemini) để hỗ trợ công việc, cách viết prompt nào mang lại kết quả tốt nhất?",
                    new[] {
                        (@"Cung cấp bối cảnh, vai trò cụ thể, yêu cầu rõ ràng và định dạng đầu ra mong muốn", true),
                        (@"Chỉ nhập một từ khóa chung chung", false),
                        (@"Viết tắt không dấu và thiếu ngữ cảnh", false),
                        (@"Yêu cầu AI đưa ra câu trả lời tuyệt đối mà không cần kiểm chứng", false),
                    }),
                (@"Để yêu cầu AI tạo ra một bảng so sánh ưu nhược điểm của 2 giải pháp phần mềm, cách ra lệnh nào giúp AI trình bày chuẩn xác nhất?",
                    new[] {
                        (@"Chỉ định rõ tiêu chí so sánh và yêu cầu xuất kết quả dưới dạng bảng Markdown có các cột cụ thể", true),
                        (@"Chỉ gõ tên 2 phần mềm mà không nói thêm gì", false),
                        (@"Yêu cầu AI tự suy đoán ý người hỏi", false),
                        (@"Viết một câu cảm thán chung chung về công nghệ", false),
                    }),
                (@"Hiện tượng 'ảo giác' (Hallucination) của các mô hình AI tạo sinh (như ChatGPT, Gemini) được hiểu là gì?",
                    new[] {
                        (@"AI tự tin tạo ra thông tin sai lệch, số liệu giả mạo hoặc trích dẫn không có thực nhưng trình bày rất mạch lạc", true),
                        (@"Màn hình máy tính bị nhấp nháy khi mở trang web AI", false),
                        (@"AI từ chối trả lời mọi câu hỏi của người dùng", false),
                        (@"AI có khả năng tự nhận thức giống như con người", false),
                    }),
            },
            (6, 2) => new (string, (string, bool)[])[]
            {
                (@"Nguyên tắc bảo mật quan trọng nhất khi nhân viên sử dụng các công cụ AI tạo sinh công cộng là gì?",
                    new[] {
                        (@"Không đưa dữ liệu nội bộ, thông tin cá nhân khách hàng hoặc mã nguồn bí mật của công ty vào prompt", true),
                        (@"Chia sẻ toàn bộ báo cáo tài chính nội bộ cho AI tóm tắt", false),
                        (@"Tắt các phần mềm diệt virus khi dùng AI", false),
                        (@"Lưu thông tin đăng nhập và mật khẩu vào prompt để AI ghi nhớ", false),
                    }),
                (@"Kỹ thuật 'Few-shot Prompting' trong tương tác với mô hình ngôn ngữ lớn (LLM) là gì và mang lại lợi ích gì?",
                    new[] {
                        (@"Cung cấp một vài ví dụ mẫu (đầu vào và đầu ra mong muốn) trong prompt để hướng dẫn AI trả lời đúng định dạng và phong cách", true),
                        (@"Hỏi AI nhiều câu hỏi khác nhau cùng một lúc để tiết kiệm thời gian", false),
                        (@"Chụp ảnh màn hình gửi cho AI thay vì gõ văn bản", false),
                        (@"Chạy prompt lặp đi lặp lại 10 lần để lấy câu trả lời ngắn nhất", false),
                    }),
                (@"Khi sử dụng kết quả do AI tạo ra (văn bản, hình ảnh, mã nguồn) trong các sản phẩm thương mại của công ty, trách nhiệm thuộc về ai?",
                    new[] {
                        (@"Thuộc về cá nhân và tổ chức sử dụng kết quả đó, người dùng phải kiểm chứng tính chính xác và tuân thủ bản quyền", true),
                        (@"Hoàn toàn thuộc về công ty phát triển mô hình AI", false),
                        (@"Không ai phải chịu trách nhiệm vì đây là nội dung do máy tính tạo ra", false),
                        (@"Thuộc về người cung cấp kết nối mạng Internet", false),
                    }),
            },
            (6, 3) => new (string, (string, bool)[])[]
            {
                (@"Ứng dụng nào sau đây thể hiện việc triển khai AI ở mức độ nâng cao trong tối ưu hóa vận hành doanh nghiệp?",
                    new[] {
                        (@"Tích hợp mô hình ngôn ngữ lớn (RAG) với cơ sở tri thức nội bộ để tự động hóa hỗ trợ khách hàng và ra quyết định", true),
                        (@"Chỉ dùng AI để dịch một đoạn văn ngắn", false),
                        (@"Sao chép nguyên văn từ AI mà không kiểm chứng chuyên môn", false),
                        (@"Dùng AI tạo ảnh vui nhộn trong giờ làm việc", false),
                    }),
                (@"Phương pháp RAG (Retrieval-Augmented Generation) giải quyết hạn chế lớn nào của mô hình ngôn ngữ lớn trong doanh nghiệp?",
                    new[] {
                        (@"Khắc phục hiện tượng ảo giác và tri thức lỗi thời bằng cách tích hợp truy xuất thông tin chính xác từ kho tài liệu nội bộ", true),
                        (@"Giúp máy tính chạy nhanh hơn mà không cần kết nối mạng", false),
                        (@"Thay thế hoàn toàn nhu cầu về lập trình viên trong doanh nghiệp", false),
                        (@"Biến đổi ảnh đen trắng thành ảnh màu độ nét cao", false),
                    }),
                (@"Một chính sách quản trị AI (AI Governance) toàn diện cho tổ chức cần bao gồm các trụ cột chính nào?",
                    new[] {
                        (@"Đạo đức AI, bảo vệ quyền riêng tư dữ liệu, tính minh bạch giải trình, kiểm soát thiên vị và đánh giá rủi ro an ninh", true),
                        (@"Chỉ cần quy định danh mục các ứng dụng AI bị cấm cài đặt", false),
                        (@"Cho phép nhân viên tự do dùng AI mà không cần bất kỳ sự giám sát nào", false),
                        (@"Bắt buộc mọi quyết định nhân sự phải do AI tự động thực hiện hoàn toàn", false),
                    }),
            },
            _ => Array.Empty<(string, (string, bool)[])>(),
        };

        for (var qIdx = 0; qIdx < rawList.Length; qIdx++)
        {
            var (content, options) = rawList[qIdx];
            var id = new Guid(0x11111111 + domain.Number, (short)tier, (short)(0x4000 + qIdx), 0x80, 0, 0, 0, 0, 0, 0, 0);
            var optionDtos = options.Select((o, idx) =>
                new PulseQuizOption(new Guid(0x22222222 + domain.Number, (short)tier, (short)((qIdx << 8) | idx), 0x80, 0, 0, 0, 0, 0, 0, 0), o.Item1, o.Item2)).ToList();
            list.Add(new PulseQuizQuestion(id, content, null, qIdx + 1, optionDtos));
        }
        return list;
    }

    public static PulseQuizQuestion? FindBenchmarkQuestion(Guid questionId)
    {
        for (var d = 1; d <= 6; d++)
        {
            for (var t = 1; t <= PulseRules.MaxLevel; t++)
            {
                var qs = GetBenchmarkQuestions(new TrialDomainInfo(Guid.Empty, d, $"D{d}", $"Lĩnh vực {d}"), t);
                var match = qs.FirstOrDefault(q => q.QuestionId == questionId);
                if (match != null) return match;
            }
        }
        return null;
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
