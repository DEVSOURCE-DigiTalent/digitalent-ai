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
///   2. Mỗi mô đun một bài ôn tập (QUIZ, module_id) với ngân hàng 6 câu theo bối cảnh của lĩnh vực, 2 câu cho mỗi
///      trang; mỗi lần làm rút 2 câu và phải đúng cả hai (pulse-course-studio.js, §9.2). Đây là học liệu minh họa,
///      cần biên tập trước khi dùng thật (§13).
/// </summary>
public static class PulseContentSeeder
{
    private const string ModuleQuizBankTitle = "Pulse · Câu hỏi ôn tập mô đun";

    private const string ModuleQuizBankDescription =
        "Câu hỏi ôn tập minh họa của từng mô đun: 6 câu, 2 câu cho mỗi trang nội dung; mỗi lần làm rút 2 câu, cần đúng cả hai — bản thiết kế Pulse.";

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
