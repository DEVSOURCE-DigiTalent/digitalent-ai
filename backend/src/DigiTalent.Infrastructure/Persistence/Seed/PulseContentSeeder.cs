using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu minh họa cho trang nhân viên Pulse — chỉ Development, chạy lại nhiều lần vẫn an toàn.
/// Chạy SAU CourseContentSeeder (cần khóa TT02 có mô đun và bài học).
/// Mỗi mô đun một bài ôn tập (QUIZ, module_id) với ngân hàng 6 câu theo bối cảnh của lĩnh vực, 2 câu cho mỗi trang;
/// mỗi lần làm rút 2 câu và phải đúng cả hai (pulse-course-studio.js, §9.2). Đây là học liệu minh họa, cần biên tập
/// trước khi dùng thật (§13). Bài kiểm tra đầu vào đã bỏ (v3.3): ngân hàng cũ trong DB được giữ nguyên, không seed mới.
/// </summary>
public static class PulseContentSeeder
{
    private const string ModuleQuizBankTitle = "Pulse · Câu hỏi ôn tập mô đun";

    private const string ModuleQuizBankDescription =
        "Câu hỏi ôn tập minh họa của từng mô đun: 6 câu, 2 câu cho mỗi trang nội dung; mỗi lần làm rút 2 câu, cần đúng cả hai — bản thiết kế Pulse.";

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

    /// <summary>
    /// Mỗi mô đun một bài ôn tập (QUIZ) với ngân hàng <see cref="PoolTemplates"/>: 2 câu cho mỗi trang (lý thuyết,
    /// tình huống, thực hành) theo sort_order, mỗi lần làm rút 2 câu (PulseQuizReader.Draw). Bài ôn tập có từ bản cũ
    /// (2 câu) được bổ sung đủ ngân hàng: câu trùng nội dung được giữ và xếp đúng trang, câu thiếu được thêm. Bài ôn tập
    /// có câu không thuộc ngân hàng minh họa (do người khác soạn) thì để nguyên.
    /// </summary>
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
        var quizByModule = (await db.Assessments
                .Where(a => a.ModuleId != null && moduleIds.Contains(a.ModuleId.Value) && a.AssessmentType == Statuses.AssessmentType.Quiz)
                .Select(a => new { a.Id, ModuleId = a.ModuleId!.Value, a.VersionNo })
                .ToListAsync())
            .GroupBy(a => a.ModuleId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(a => a.VersionNo).First().Id);
        var quizIds = quizByModule.Values.ToList();
        var links = await (
                from link in db.AssessmentQuestions
                join question in db.Questions on link.QuestionId equals question.Id
                where quizIds.Contains(link.AssessmentId)
                select new { Link = link, question.Content, question.BankId })
            .ToListAsync();

        var bank = await db.QuestionBanks.FirstOrDefaultAsync(b => b.OrganizationId == organizationId && b.Title == ModuleQuizBankTitle);
        if (bank == null)
        {
            bank = new QuestionBank
            {
                OrganizationId = organizationId,
                Title = ModuleQuizBankTitle,
                Description = ModuleQuizBankDescription,
                OwnerUserId = authorUserId,
                Status = Statuses.QuestionBank.Active,
            };
            db.QuestionBanks.Add(bank);
        }
        else if (bank.Description != ModuleQuizBankDescription)
        {
            bank.Description = ModuleQuizBankDescription;
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
                var pool = PoolTemplates(index, domain.Name, module.Title, context);
                if (!quizByModule.TryGetValue(module.Id, out var assessmentId))
                {
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
                    for (var p = 0; p < pool.Length; p++)
                    {
                        AddQuestion(db, bank.Id, domain.CompetencyId, authorUserId, assessment.Id, pool[p], p);
                    }
                }
                else
                {
                    var existing = links.Where(l => l.Link.AssessmentId == assessmentId).ToList();
                    if (existing.All(l => l.BankId == bank.Id))
                    {
                        for (var p = 0; p < pool.Length; p++)
                        {
                            var match = existing.FirstOrDefault(l => l.Content == pool[p].Question);
                            if (match == null)
                            {
                                AddQuestion(db, bank.Id, domain.CompetencyId, authorUserId, assessmentId, pool[p], p);
                            }
                            else if (match.Link.SortOrder != p + 1)
                            {
                                match.Link.SortOrder = p + 1;
                            }
                        }
                    }
                }

                index++;
            }
        }

        await db.SaveChangesAsync();
    }

    private static void AddQuestion(AppDbContext db, Guid bankId, Guid competencyId, Guid authorUserId, Guid assessmentId, QuizTemplate template, int position)
    {
        var question = new Question
        {
            BankId = bankId,
            CompetencyId = competencyId,
            QuestionType = Statuses.QuestionType.MultipleChoice,
            Difficulty = "MODULE",
            Content = template.Question,
            Explanation = template.Explanation,
            Status = Statuses.Question.Approved,
            CreatedByUserId = authorUserId,
        };
        db.Questions.Add(question);
        for (var o = 0; o < template.Options.Length; o++)
        {
            // Thứ tự phương án được trộn lại ở mỗi lần làm (PulseQuizReader.Draw).
            db.QuestionOptions.Add(new QuestionOption
            {
                QuestionId = question.Id,
                Content = template.Options[o],
                IsCorrect = o == template.Answer,
                SortOrder = o + 1,
            });
        }

        db.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = assessmentId, QuestionId = question.Id, Points = 1, SortOrder = position + 1 });
    }

    /// <summary>
    /// Ngân hàng 6 câu của mô đun thứ <paramref name="index"/>, 2 câu cho mỗi trang theo thứ tự: lý thuyết nền tảng →
    /// tình huống thực tế → thực hành và sản phẩm đầu ra. Trang thứ (index mod 3) giữ cặp câu của bản cũ (mỗi mô đun
    /// từng có đúng 2 câu đó), hai trang còn lại dùng câu gắn tên mô đun để các mô đun không lặp nhau.
    /// </summary>
    private static QuizTemplate[] PoolTemplates(int index, string domainName, string moduleTitle, DomainContext context)
    {
        var legacy = index % 3;
        return new[]
        {
            legacy == 0 ? FoundationLegacy(moduleTitle, context) : Foundation(moduleTitle),
            legacy == 1 ? ScenarioLegacy(context) : Scenario(moduleTitle),
            legacy == 2 ? PracticeLegacy(domainName, context) : Practice(moduleTitle),
        }.SelectMany(pair => pair).ToArray();
    }

    private static QuizTemplate[] FoundationLegacy(string moduleTitle, DomainContext context) => new[]
    {
        new QuizTemplate($"Với chủ đề \"{moduleTitle}\", bạn cần kiểm tra nguồn nào trước?",
            new[] { "Một phỏng đoán chưa có căn cứ", Capitalize(context.Source), "Chỉ kết luận cuối cùng" }, 1,
            "Bắt đầu từ nguồn hoặc bối cảnh mà người khác có thể kiểm tra."),
        new QuizTemplate("Điều gì giúp kỹ năng có ích trong công việc?",
            new[] { "Gắn nhiệm vụ thật với cách làm và kết quả", "Dùng công cụ khi chưa có mục đích", "Sao chép kết quả mà không kiểm tra" }, 0,
            "Kỹ năng cần có bối cảnh, cách làm và kết quả rõ ràng."),
    };

    private static QuizTemplate[] Foundation(string moduleTitle) => new[]
    {
        new QuizTemplate($"Phần lý thuyết của \"{moduleTitle}\" giúp bạn điều gì trước khi làm việc?",
            new[] { "Hiểu quy chuẩn để áp dụng đúng vào công việc", "Bỏ qua bước kiểm tra nguồn", "Chỉ ghi nhớ thuật ngữ" }, 0,
            "Lý thuyết đặt nền để áp dụng đúng quy chuẩn trong công việc."),
        new QuizTemplate($"Vì sao cần nắm quy chuẩn của \"{moduleTitle}\" trước khi bắt tay vào việc?",
            new[] { "Để người khác kiểm tra lại được cách làm", "Để làm nhanh mà không cần ghi chú", "Vì quy chuẩn thay cho kết quả" }, 0,
            "Làm theo quy chuẩn giúp cách làm kiểm tra được."),
    };

    private static QuizTemplate[] ScenarioLegacy(DomainContext context) => new[]
    {
        new QuizTemplate($"Bạn nên xử lý tình huống này thế nào? {context.Scenario}",
            new[] { "Duyệt kết quả đầu tiên mà không kiểm tra", Capitalize(context.Action), "Tránh đưa ra quyết định" }, 1,
            "Cách làm kiểm tra được phải giải quyết đúng tình huống và nguồn."),
        new QuizTemplate("Ghi chú nào giúp người chấm hiểu quyết định?",
            new[] { "Chỉ câu trả lời cuối", "Nguồn, cách làm và lý do", "Khẳng định chắc chắn nhưng không có minh chứng" }, 1,
            "Người chấm cần thấy nguồn, cách làm và lý do."),
    };

    private static QuizTemplate[] Scenario(string moduleTitle) => new[]
    {
        new QuizTemplate($"Gặp tình huống trong \"{moduleTitle}\", bước nào nên làm trước?",
            new[] { "Xác định vấn đề và nguồn liên quan", "Chọn ngay cách làm quen thuộc", "Chờ người khác quyết định" }, 0,
            "Hiểu đúng vấn đề và nguồn trước khi chọn cách làm."),
        new QuizTemplate($"Tình huống trong \"{moduleTitle}\" lặp lại. Bạn làm gì?",
            new[] { "Tìm nguyên nhân và cách phòng ngừa", "Xử lý như lần trước mà không xem xét", "Bỏ qua vì đã quen" }, 0,
            "Tình huống lặp lại cần được tìm nguyên nhân."),
    };

    private static QuizTemplate[] PracticeLegacy(string domainName, DomainContext context) => new[]
    {
        new QuizTemplate($"Sản phẩm nào phù hợp với lĩnh vực {domainName}?",
            new[] { "Kết quả không giải thích được", Capitalize(context.Deliverable), "Ghi chú không nêu nguồn" }, 1,
            "Sản phẩm cần cho phép truy vết công việc."),
        new QuizTemplate("Bài cuối khóa cần có gì?",
            new[] { "Nguồn, cách làm kiểm tra được và kết luận có căn cứ", "Chỉ ý kiến cá nhân", "Ảnh chụp màn hình không có giải thích" }, 0,
            "Quản lý chấm minh chứng có thể kiểm tra."),
    };

    private static QuizTemplate[] Practice(string moduleTitle) => new[]
    {
        new QuizTemplate($"Sản phẩm thực hành của \"{moduleTitle}\" cần cho người duyệt thấy gì?",
            new[] { "Nguồn, cách làm và kết quả kiểm tra được", "Chỉ hình thức trình bày", "Thời gian đã làm" }, 0,
            "Người duyệt cần kiểm tra lại được sản phẩm."),
        new QuizTemplate($"Trước khi nộp sản phẩm của \"{moduleTitle}\", bạn tự kiểm tra gì?",
            new[] { "Đối chiếu với yêu cầu và nguồn đã dùng", "Chỉ lỗi chính tả", "Không cần kiểm tra" }, 0,
            "Tự đối chiếu với yêu cầu và nguồn trước khi nộp."),
    };

    private static string Capitalize(string text) => text.Length == 0 ? text : char.ToUpperInvariant(text[0]) + text[1..];

    private static string Truncate(string text, int max) => text.Length <= max ? text : text[..max];
}
