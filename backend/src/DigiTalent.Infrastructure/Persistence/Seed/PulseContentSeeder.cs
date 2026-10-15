using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu minh họa cho trang nhân viên Pulse — chỉ Development, chạy lại nhiều lần vẫn an toàn.
/// Chạy SAU CourseContentSeeder (cần khóa TT02 có mô đun và bài học).
///   1. Ngân hàng "Pulse · Bài kiểm tra đầu vào": mỗi lĩnh vực 3 câu tình huống L1..L3, 2 phương án
///      (docs/ui-redesign/14-pulse-product-site/pulse-path-entitlements.js).
///   2. Mỗi mô đun một bài ôn tập (QUIZ, module_id, cần đúng 2/2) với 2 câu theo bối cảnh của lĩnh vực
///      (pulse-course-studio.js). Đây là học liệu minh họa, cần biên tập trước khi dùng thật (§13).
/// </summary>
public static class PulseContentSeeder
{
    private const string ModuleQuizBankTitle = "Pulse · Câu hỏi ôn tập mô đun";

    /// <summary>Tình huống ngắn theo lĩnh vực, thứ tự Khai thác dữ liệu → Giao tiếp → Nội dung → An toàn → Giải quyết vấn đề → AI.</summary>
    private static readonly (string Prompt, string Right, string Wrong)[][] BaselineQuestions =
    {
        new[]
        {
            ("Trước khi dùng bảng dữ liệu, bạn kiểm tra điều gì?", "Nguồn và độ cập nhật của dữ liệu", "Chỉ màu của bảng"),
            ("Hai nguồn cho số liệu khác nhau. Bạn làm gì?", "Đối chiếu định nghĩa và kỳ đo", "Chọn số lớn hơn"),
            ("Khi chia sẻ dữ liệu nhạy cảm, bạn làm gì?", "Giới hạn quyền và ghi rõ nguồn", "Gửi cho tất cả"),
        },
        new[]
        {
            ("Một yêu cầu chưa rõ. Bạn làm gì trước?", "Xác nhận mục tiêu và người nhận", "Trả lời theo phỏng đoán"),
            ("Nhóm hiểu khác nhau về tiến độ. Bạn làm gì?", "Thống nhất đầu việc, hạn và người phụ trách", "Chờ cuộc họp kế tiếp"),
            ("Phản hồi có nhiều ý kiến trái chiều. Bạn làm gì?", "Tóm tắt bằng chứng và quyết định tiếp theo", "Chọn ý kiến nói to nhất"),
        },
        new[]
        {
            ("Trước khi đăng nội dung số, bạn kiểm tra gì?", "Mục tiêu, nguồn và quyền sử dụng", "Chỉ kích thước ảnh"),
            ("Bài đăng chưa đạt mục tiêu. Bạn làm gì?", "Xem chỉ số và thử điều chỉnh có kiểm soát", "Đăng lại y nguyên"),
            ("Nhiều kênh có kết quả khác nhau. Bạn làm gì?", "So sánh theo cùng mục tiêu và nhóm người xem", "Chọn kênh có nhiều lượt xem nhất"),
        },
        new[]
        {
            ("Nhận liên kết lạ yêu cầu mật khẩu. Bạn làm gì?", "Kiểm tra nguồn và không nhập thông tin", "Mở ngay để kịp hạn"),
            ("Tài liệu có dữ liệu cá nhân. Bạn làm gì?", "Chỉ cấp quyền cho người cần dùng", "Đặt liên kết công khai"),
            ("Phát hiện truy cập bất thường. Bạn làm gì?", "Báo cáo theo quy trình và bảo toàn dấu vết", "Tự xóa mọi nhật ký"),
        },
        new[]
        {
            ("Khi gặp một vấn đề mới, bước đầu là gì?", "Mô tả vấn đề và kết quả mong muốn", "Chọn giải pháp quen thuộc"),
            ("Giải pháp chưa hiệu quả. Bạn làm gì?", "Đo kết quả và xem lại giả định", "Bỏ qua số liệu"),
            ("Có nhiều phương án. Bạn chọn thế nào?", "So sánh tác động, rủi ro và bằng chứng", "Chọn phương án nhanh nhất"),
        },
        new[]
        {
            ("Kết quả AI trông hợp lý. Bạn làm gì?", "Kiểm chứng trước khi sử dụng", "Dùng ngay không cần kiểm tra"),
            ("Bạn đưa dữ liệu vào công cụ AI. Cần lưu ý gì?", "Quyền riêng tư và chính sách dữ liệu", "Chỉ tốc độ trả lời"),
            ("AI gợi ý quyết định có tác động lớn. Ai chịu trách nhiệm?", "Người có thẩm quyền kiểm tra và quyết định", "Công cụ AI"),
        },
    };

    private sealed record DomainContext(string Source, string Scenario, string Action, string Deliverable);

    private static readonly DomainContext[] Contexts =
    {
        new("báo cáo dữ liệu gốc", "Hai tổng số trong báo cáo tài chính không khớp nhau.",
            "đối chiếu từng tổng số với báo cáo gốc và trình bày phép tính", "báo cáo có chú thích nguồn, phép tính và kết luận có căn cứ"),
        new("yêu cầu của khách hàng và nhóm người nhận", "Bản cập nhật của đội khiến người phụ trách tiếp theo chưa biết cần làm gì.",
            "làm rõ người nhận, mục đích và bước tiếp theo cần thực hiện", "bản cập nhật ngắn nêu rõ người nhận, quyết định và hành động tiếp theo"),
        new("bản định hướng nội dung đã duyệt", "Bản nháp dùng mẫu cũ và khó đọc.",
            "kiểm tra định hướng, dùng mẫu hiện tại và cải thiện khả năng tiếp cận", "sản phẩm nội dung một trang dễ tiếp cận kèm lý do thiết kế ngắn gọn"),
        new("chính sách an toàn và tin nhắn gốc", "Một tin nhắn yêu cầu bạn mở gấp liên kết lạ.",
            "xác minh người gửi qua kênh tin cậy và báo cáo yêu cầu đáng ngờ", "ghi chú sự cố ngắn nêu dấu hiệu, hành động an toàn và bước báo cáo"),
        new("nhật ký quy trình và những người liên quan", "Việc bàn giao chậm lặp lại hằng tuần ở cùng một nhiệm vụ.",
            "tách biểu hiện khỏi nguyên nhân rồi thử một phương án thực tế", "bảng so sánh nguyên nhân, phương án thử và kết quả quan sát"),
        new("tài liệu nguồn của câu trả lời AI", "Bản tóm tắt AI có một thông tin không xuất hiện trong nguồn.",
            "đối chiếu thông tin với nguồn rồi sửa hoặc bỏ nội dung thiếu căn cứ", "ghi chú sử dụng AI có câu lệnh, bước kiểm chứng và quyết định cuối"),
    };

    private sealed record QuizTemplate(string Question, string[] Options, int Answer, string Explanation);

    public static Task SeedAsync(AppDbContext db, Guid organizationId, Guid authorUserId) =>
        db.ExecuteInTransactionAsync(async () =>
        {
            var domains = await LoadDomainsAsync(db, organizationId);
            if (domains.Count == 0)
            {
                return; // Chưa có khung TT02 demo
            }

            await SeedBaselineBankAsync(db, organizationId, authorUserId, domains);
            await SeedModuleQuizzesAsync(db, organizationId, authorUserId, domains);
        });

    /// <summary>Lĩnh vực có khóa PUBLISHED, theo thứ tự hiển thị; kèm năng lực đầu tiên để gắn câu hỏi.</summary>
    private static async Task<List<(Guid CategoryId, int Number, string Name, Guid CompetencyId)>> LoadDomainsAsync(AppDbContext db, Guid organizationId)
    {
        var categoryIds = await (
                from course in db.Courses
                join teaching in db.CourseCompetencies on course.Id equals teaching.CourseId
                join competency in db.Competencies on teaching.CompetencyId equals competency.Id
                where course.OrganizationId == organizationId && course.Status == Statuses.Course.Published
                select competency.CategoryId)
            .Distinct()
            .ToListAsync();
        var categories = await db.CompetencyCategories
            .Where(c => categoryIds.Contains(c.Id))
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new
            {
                c.Id,
                c.Name,
                FirstCompetencyId = db.Competencies.Where(x => x.CategoryId == c.Id).OrderBy(x => x.Code).Select(x => x.Id).FirstOrDefault(),
            })
            .ToListAsync();
        return categories
            .Where(c => c.FirstCompetencyId != Guid.Empty)
            .Select((c, index) => (c.Id, index + 1, c.Name, c.FirstCompetencyId))
            .ToList();
    }

    private static async Task SeedBaselineBankAsync(
        AppDbContext db, Guid organizationId, Guid authorUserId, List<(Guid CategoryId, int Number, string Name, Guid CompetencyId)> domains)
    {
        if (await db.QuestionBanks.AnyAsync(b => b.OrganizationId == organizationId && b.Title == PulseRules.BaselineBankTitle))
        {
            return;
        }

        var bank = new QuestionBank
        {
            OrganizationId = organizationId,
            Title = PulseRules.BaselineBankTitle,
            Description = "Câu hỏi tình huống minh họa theo lĩnh vực và mức L1–L3 cho bài kiểm tra đầu vào (bản thiết kế Pulse).",
            OwnerUserId = authorUserId,
            Status = Statuses.QuestionBank.Active,
        };
        db.QuestionBanks.Add(bank);

        foreach (var domain in domains.Where(d => d.Number <= BaselineQuestions.Length))
        {
            var questions = BaselineQuestions[domain.Number - 1];
            for (var level = 1; level <= questions.Length; level++)
            {
                var (prompt, right, wrong) = questions[level - 1];
                var question = new Question
                {
                    BankId = bank.Id,
                    CompetencyId = domain.CompetencyId,
                    QuestionType = Statuses.QuestionType.MultipleChoice,
                    Difficulty = PulseRules.DifficultyOf(level),
                    Content = prompt,
                    Explanation = $"Mức {PulseRules.LevelName(level)} của lĩnh vực {domain.Name}.",
                    Status = Statuses.Question.Approved,
                    CreatedByUserId = authorUserId,
                };
                db.Questions.Add(question);
                // Đảo vị trí phương án đúng theo mức để không luôn là phương án đầu.
                var rightFirst = (domain.Number + level) % 2 == 0;
                db.QuestionOptions.Add(new QuestionOption { QuestionId = question.Id, Content = right, IsCorrect = true, SortOrder = rightFirst ? 1 : 2 });
                db.QuestionOptions.Add(new QuestionOption { QuestionId = question.Id, Content = wrong, IsCorrect = false, SortOrder = rightFirst ? 2 : 1 });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedModuleQuizzesAsync(
        AppDbContext db, Guid organizationId, Guid authorUserId, List<(Guid CategoryId, int Number, string Name, Guid CompetencyId)> domains)
    {
        var courses = await (
                from course in db.Courses
                where course.OrganizationId == organizationId && course.Status == Statuses.Course.Published
                select new
                {
                    course.Id,
                    course.Code,
                    CategoryId = (from teaching in db.CourseCompetencies
                                  join competency in db.Competencies on teaching.CompetencyId equals competency.Id
                                  where teaching.CourseId == course.Id
                                  select competency.CategoryId).FirstOrDefault(),
                })
            .ToListAsync();
        var courseIds = courses.Select(c => c.Id).ToList();
        var modules = await db.CourseModules
            .Where(m => courseIds.Contains(m.CourseId) && m.Status == Statuses.CourseContent.Active)
            .OrderBy(m => m.SortOrder)
            .Select(m => new { m.Id, m.CourseId, m.Code, m.Title })
            .ToListAsync();
        var moduleIds = modules.Select(m => m.Id).ToList();
        var withQuiz = (await db.Assessments
                .Where(a => a.ModuleId != null && moduleIds.Contains(a.ModuleId.Value))
                .Select(a => a.ModuleId!.Value)
                .ToListAsync())
            .ToHashSet();
        if (modules.All(m => withQuiz.Contains(m.Id)))
        {
            return;
        }

        var bank = await db.QuestionBanks.FirstOrDefaultAsync(b => b.OrganizationId == organizationId && b.Title == ModuleQuizBankTitle);
        if (bank == null)
        {
            bank = new QuestionBank
            {
                OrganizationId = organizationId,
                Title = ModuleQuizBankTitle,
                Description = "Câu hỏi ôn tập minh họa của từng mô đun (2 câu, cần đúng cả hai) — bản thiết kế Pulse.",
                OwnerUserId = authorUserId,
                Status = Statuses.QuestionBank.Active,
            };
            db.QuestionBanks.Add(bank);
        }

        foreach (var courseModules in modules.GroupBy(m => m.CourseId))
        {
            var course = courses.First(c => c.Id == courseModules.Key);
            var domain = domains.FirstOrDefault(d => d.CategoryId == course.CategoryId);
            if (domain.CategoryId == Guid.Empty)
            {
                continue;
            }

            var context = Contexts[(domain.Number - 1) % Contexts.Length];
            var index = 0;
            foreach (var module in courseModules)
            {
                if (withQuiz.Contains(module.Id))
                {
                    index++;
                    continue;
                }

                var assessment = new Assessment
                {
                    CourseId = course.Id,
                    ModuleId = module.Id,
                    Code = Truncate($"{module.Code ?? $"{course.Code}-M{index + 1}"}-QZ", 50),
                    VersionNo = 1,
                    Title = Truncate($"Câu hỏi ôn tập · {module.Title}", 250),
                    AssessmentType = Statuses.AssessmentType.Quiz,
                    IsFinal = false,
                    PassingScore = 100m,
                    Status = Statuses.Assessment.Published,
                    CreatedByUserId = authorUserId,
                    RowVersion = 1,
                };
                db.Assessments.Add(assessment);

                var templates = Templates(index, domain.Name, module.Title, context);
                for (var q = 0; q < templates.Length; q++)
                {
                    var template = templates[q];
                    var question = new Question
                    {
                        BankId = bank.Id,
                        CompetencyId = domain.CompetencyId,
                        QuestionType = Statuses.QuestionType.MultipleChoice,
                        Difficulty = "MODULE",
                        Content = template.Question,
                        Explanation = template.Explanation,
                        Status = Statuses.Question.Approved,
                        CreatedByUserId = authorUserId,
                    };
                    db.Questions.Add(question);
                    var rotation = (index + q) % template.Options.Length;
                    for (var o = 0; o < template.Options.Length; o++)
                    {
                        db.QuestionOptions.Add(new QuestionOption
                        {
                            QuestionId = question.Id,
                            Content = template.Options[o],
                            IsCorrect = o == template.Answer,
                            SortOrder = (o + rotation) % template.Options.Length + 1,
                        });
                    }

                    db.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = assessment.Id, QuestionId = question.Id, Points = 1, SortOrder = q + 1 });
                }

                index++;
            }
        }

        await db.SaveChangesAsync();
    }

    /// <summary>Hai câu cho mô đun thứ <paramref name="index"/>: hiểu bối cảnh → quyết định có căn cứ → áp dụng (lặp lại theo chu kỳ 3).</summary>
    private static QuizTemplate[] Templates(int index, string domainName, string moduleTitle, DomainContext context) => (index % 3) switch
    {
        0 => new[]
        {
            new QuizTemplate($"Với chủ đề \"{moduleTitle}\", bạn cần kiểm tra nguồn nào trước?",
                new[] { "Một phỏng đoán chưa có căn cứ", Capitalize(context.Source), "Chỉ kết luận cuối cùng" }, 1,
                "Bắt đầu từ nguồn hoặc bối cảnh mà người khác có thể kiểm tra."),
            new QuizTemplate("Điều gì giúp kỹ năng có ích trong công việc?",
                new[] { "Gắn nhiệm vụ thật với cách làm và kết quả", "Dùng công cụ khi chưa có mục đích", "Sao chép kết quả mà không kiểm tra" }, 0,
                "Kỹ năng cần có bối cảnh, cách làm và kết quả rõ ràng."),
        },
        1 => new[]
        {
            new QuizTemplate($"Bạn nên xử lý tình huống này thế nào? {context.Scenario}",
                new[] { "Duyệt kết quả đầu tiên mà không kiểm tra", Capitalize(context.Action), "Tránh đưa ra quyết định" }, 1,
                "Cách làm kiểm tra được phải giải quyết đúng tình huống và nguồn."),
            new QuizTemplate("Ghi chú nào giúp người chấm hiểu quyết định?",
                new[] { "Chỉ câu trả lời cuối", "Nguồn, cách làm và lý do", "Khẳng định chắc chắn nhưng không có minh chứng" }, 1,
                "Người chấm cần thấy nguồn, cách làm và lý do."),
        },
        _ => new[]
        {
            new QuizTemplate($"Sản phẩm nào phù hợp với lĩnh vực {domainName}?",
                new[] { "Kết quả không giải thích được", Capitalize(context.Deliverable), "Ghi chú không nêu nguồn" }, 1,
                "Sản phẩm cần cho phép truy vết công việc."),
            new QuizTemplate("Bài cuối khóa cần có gì?",
                new[] { "Nguồn, cách làm kiểm tra được và kết luận có căn cứ", "Chỉ ý kiến cá nhân", "Ảnh chụp màn hình không có giải thích" }, 0,
                "Quản lý chấm minh chứng có thể kiểm tra."),
        },
    };

    private static string Capitalize(string text) => text.Length == 0 ? text : char.ToUpperInvariant(text[0]) + text[1..];

    private static string Truncate(string text, int max) => text.Length <= max ? text : text[..max];
}
