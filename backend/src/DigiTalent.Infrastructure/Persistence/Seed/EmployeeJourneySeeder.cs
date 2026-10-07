using System.Text.Json;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu demo cho các trang cá nhân của nhân viên (EM-01..EM-18) — chỉ Development, chạy lại nhiều lần vẫn an toàn.
/// Chạy SAU SkillGapSeeder (cần 18 khóa TT02, vị trí, hồ sơ năng lực của employee@).
///
/// employee@ (Kế toán):
///   - A2-F đã hoàn thành: đạt bài cuối khóa + có chứng chỉ.
///   - A4-I đang học: 1/4 bài đã xong, có quiz luyện tập + bài cuối khóa (mở khi học đủ), hạn 10 ngày.
///   - A1-I mới được giao từ skill gap, chưa bắt đầu, hạn 20 ngày.
///   - 3 nhiệm vụ thực tế: chưa nộp / cần chỉnh sửa / đã đạt. Hồ sơ năng lực giữ nguyên (mức Cơ bản mọi năng lực).
/// manager@: tự ghi danh A4-F (để menu "Cá nhân" của Manager có dữ liệu).
/// </summary>
public static class EmployeeJourneySeeder
{
    private const string MarkerAssessmentCode = "A4-I-FINAL";
    private const string EmployeeEmail = "employee@digitalent.ai";
    private const string ManagerEmail = "manager@digitalent.ai";
    private const string SourceUrl = Tt02Catalog.FrameworkSourceUrl;

    /// <summary>Chạy trong 1 transaction: lỗi giữa chừng không để lại dữ liệu dở dang (lần sau seed lại từ đầu).</summary>
    public static Task SeedDemoAsync(AppDbContext db, Guid organizationId) =>
        db.ExecuteInTransactionAsync(() => SeedCoreAsync(db, organizationId));

    private static async Task SeedCoreAsync(AppDbContext db, Guid organizationId)
    {
        var courses = await db.Courses
            .Where(c => c.OrganizationId == organizationId && c.Status == Statuses.Course.Published)
            .ToDictionaryAsync(c => c.Code);
        if (!courses.TryGetValue("A4-I", out var securityCourse)
            || !courses.TryGetValue("A1-I", out var infoCourse)
            || !courses.TryGetValue("A2-F", out var communicationCourse)
            || !courses.TryGetValue("A4-F", out var securityBasicsCourse))
        {
            return; // Chưa có khung TT02 demo
        }

        if (await db.Assessments.AnyAsync(a => a.CourseId == securityCourse.Id && a.Code == MarkerAssessmentCode))
        {
            return;
        }

        var users = await db.Users.Where(u => u.OrganizationId == organizationId).ToDictionaryAsync(u => u.Email);
        var employee = await db.Employees.FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.WorkEmail == EmployeeEmail);
        var manager = await db.Employees.FirstOrDefaultAsync(e => e.OrganizationId == organizationId && e.WorkEmail == ManagerEmail);
        if (employee == null || manager == null
            || !users.TryGetValue("hr@digitalent.ai", out var hr)
            || !users.TryGetValue(ManagerEmail, out var managerUser))
        {
            return;
        }

        var trainer = users.GetValueOrDefault("trainer@digitalent.ai") ?? hr;
        var competencies = await db.Competencies
            .Where(c => db.CompetencyCategories.Any(cat => cat.Id == c.CategoryId && cat.OrganizationId == organizationId))
            .ToDictionaryAsync(c => c.Code);
        Competency Tt02(string sourceCode) => competencies[Tt02Catalog.CompetencyCode(sourceCode)];

        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);

        db.CertificateTemplates.Add(new CertificateTemplate
        {
            OrganizationId = organizationId,
            Name = "Chứng chỉ hoàn thành khóa học DigiTalent",
            VersionNo = 1,
            TemplateHtml = "<h1>{{holderName}}</h1><p>Hoàn thành khóa {{courseTitle}}</p><p>Mã: {{certificateCode}}</p>",
            Status = Statuses.CertificateTemplate.Active,
            CreatedByUserId = hr.Id,
        });

        var bank = new QuestionBank
        {
            OrganizationId = organizationId,
            Title = "Ngân hàng câu hỏi năng lực số (demo)",
            Description = "Câu hỏi trắc nghiệm theo Thông tư 02/2025 dùng cho các bài đánh giá demo.",
            OwnerUserId = trainer.Id,
            Status = Statuses.QuestionBank.Active,
        };
        db.QuestionBanks.Add(bank);

        // ── A4-I: An toàn thông tin trong công việc (đang học) ──────────────────────────────
        var securityLessons = AddContent(db, securityCourse, new[]
        {
            new ModuleSeed("Bảo mật trong môi trường làm việc", "Nhận diện rủi ro và bảo vệ thiết bị, tài khoản dùng cho công việc.", new[]
            {
                new LessonSeed("Nhận diện rủi ro an toàn thông tin nơi công sở", "TEXT", 15, Statuses.LessonCompletionRule.View, SecurityRisksContent),
                new LessonSeed("Mật khẩu mạnh và xác thực hai lớp", "CASE_STUDY", 20, Statuses.LessonCompletionRule.ManualComplete, PasswordContent),
            }),
            new ModuleSeed("Xử lý dữ liệu cá nhân trong công việc", "Thu thập, lưu trữ và chia sẻ dữ liệu cá nhân đúng quy định.", new[]
            {
                new LessonSeed("Nguyên tắc xử lý dữ liệu cá nhân", "TEXT", 20, Statuses.LessonCompletionRule.View, PersonalDataContent),
                new LessonSeed("Tình huống: chia sẻ bảng lương qua email", "WORKPLACE_SCENARIO", 15, Statuses.LessonCompletionRule.ManualComplete, PayrollScenarioContent),
                new LessonSeed("Kiểm tra nhanh cuối học phần", "QUIZ", 10, Statuses.LessonCompletionRule.PassCheck, "Làm bài kiểm tra nhanh của khóa để hoàn thành mục này."),
            }),
        });
        AddAssessment(db, securityCourse, bank, trainer.Id, "A4-I-QUIZ", "Kiểm tra nhanh: An toàn thông tin",
            Statuses.AssessmentType.Quiz, isFinal: false, timeLimit: null, maxAttempts: null, passing: 60m, new[]
            {
                Q(Tt02("4.1"), "Cách nào giúp bảo vệ tài khoản công việc tốt nhất?",
                    "Bật xác thực hai lớp sẽ chặn phần lớn tấn công dò mật khẩu.",
                    "Dùng chung một mật khẩu cho mọi tài khoản", "Bật xác thực hai lớp (2FA)*", "Ghi mật khẩu lên giấy dán màn hình", "Chia sẻ mật khẩu cho đồng nghiệp tin cậy"),
                Q(Tt02("4.2"), "Thông tin nào sau đây là dữ liệu cá nhân nhạy cảm?",
                    "Thông tin sức khỏe thuộc nhóm dữ liệu cá nhân nhạy cảm theo Nghị định 13/2023/NĐ-CP.",
                    "Tên phòng ban", "Thông tin sức khỏe của nhân viên*", "Tên công ty", "Số điện thoại tổng đài"),
                Q(Tt02("4.1"), "Nhận được email yêu cầu đăng nhập lại qua đường link lạ, bạn nên làm gì?",
                    "Đây là dấu hiệu lừa đảo (phishing): không bấm link, báo bộ phận IT.",
                    "Bấm link và đăng nhập ngay", "Chuyển tiếp cho cả phòng", "Không bấm link và báo bộ phận IT*", "Trả lời email để hỏi lại"),
                Q(Tt02("4.2"), "Khi gửi file chứa dữ liệu cá nhân ra ngoài công ty, cần làm gì trước tiên?",
                    "Chỉ chia sẻ khi có cơ sở pháp lý / sự đồng ý và áp dụng biện pháp bảo vệ (mã hóa, giới hạn người nhận).",
                    "Kiểm tra cơ sở cho phép chia sẻ và mã hóa file*", "Đổi tên file cho dễ tìm", "Nén file thật nhỏ", "Gửi bằng email cá nhân cho nhanh"),
            });
        AddAssessment(db, securityCourse, bank, trainer.Id, MarkerAssessmentCode, "Đánh giá cuối khóa A4-I: An toàn thông tin trong công việc",
            Statuses.AssessmentType.Final, isFinal: true, timeLimit: 15, maxAttempts: 3, passing: 70m, new[]
            {
                Q(Tt02("4.1"), "Phần mềm diệt virus trên máy tính công việc nên được cập nhật khi nào?",
                    "Cập nhật tự động thường xuyên để nhận mẫu nhận diện mã độc mới.",
                    "Mỗi năm một lần", "Khi máy chạy chậm", "Tự động và thường xuyên*", "Không cần cập nhật"),
                Q(Tt02("4.1"), "Rời khỏi bàn làm việc trong 10 phút, bạn nên làm gì với máy tính?",
                    "Khóa màn hình (Windows + L) ngăn người khác truy cập phiên làm việc.",
                    "Để nguyên màn hình", "Khóa màn hình*", "Tắt màn hình bằng nút nguồn", "Nhờ đồng nghiệp trông"),
                Q(Tt02("4.2"), "Nguyên tắc 'tối thiểu hóa dữ liệu' nghĩa là gì?",
                    "Chỉ thu thập và xử lý dữ liệu cá nhân thực sự cần cho mục đích đã xác định.",
                    "Lưu càng nhiều dữ liệu càng tốt", "Chỉ thu thập dữ liệu cần thiết cho mục đích*", "Nén dữ liệu cho nhẹ", "Xóa dữ liệu mỗi ngày"),
                Q(Tt02("4.2"), "Ai được xem bảng lương chi tiết của toàn công ty?",
                    "Chỉ những người có nhiệm vụ cần biết (need-to-know) theo phân quyền đã duyệt.",
                    "Mọi nhân viên", "Người có nhiệm vụ cần biết theo phân quyền*", "Trưởng mọi phòng ban", "Bất kỳ ai hỏi"),
                Q(Tt02("4.1"), "Kết nối Wi-Fi công cộng để xử lý chứng từ kế toán, cách an toàn nhất là?",
                    "Dùng VPN của công ty để mã hóa toàn bộ kết nối.",
                    "Kết nối trực tiếp", "Dùng VPN của công ty*", "Tắt tường lửa cho nhanh", "Dùng trình duyệt ẩn danh"),
                Q(Tt02("4.2"), "Phát hiện gửi nhầm file có dữ liệu cá nhân cho khách hàng, việc đầu tiên cần làm?",
                    "Báo ngay cho quản lý / bộ phận bảo vệ dữ liệu để xử lý sự cố đúng quy trình.",
                    "Im lặng chờ xem", "Báo ngay cho quản lý và bộ phận phụ trách dữ liệu*", "Xóa email trong hộp thư đã gửi", "Gửi thêm email xin lỗi là đủ"),
            });

        // ── A1-I: Chiến lược tìm kiếm và quản lý thông tin (mới được giao) ───────────────────
        AddContent(db, infoCourse, new[]
        {
            new ModuleSeed("Tìm kiếm thông tin chuyên nghiệp", "Chiến lược và toán tử tìm kiếm cho công việc.", new[]
            {
                new LessonSeed("Toán tử tìm kiếm nâng cao", "TEXT", 20, Statuses.LessonCompletionRule.View, SearchOperatorsContent),
                new LessonSeed("Đánh giá độ tin cậy của nguồn tin", "CASE_STUDY", 20, Statuses.LessonCompletionRule.ManualComplete, SourceEvaluationContent),
            }),
            new ModuleSeed("Quản lý tài liệu số", "Tổ chức thư mục, đặt tên và phân quyền tài liệu.", new[]
            {
                new LessonSeed("Quy ước đặt tên và cấu trúc thư mục", "GUIDED_PRACTICE", 25, Statuses.LessonCompletionRule.ManualComplete, FolderConventionContent),
            }),
        });
        AddAssessment(db, infoCourse, bank, trainer.Id, "A1-I-FINAL", "Đánh giá cuối khóa A1-I: Tìm kiếm và quản lý thông tin",
            Statuses.AssessmentType.Final, isFinal: true, timeLimit: 15, maxAttempts: 3, passing: 70m, new[]
            {
                Q(Tt02("1.1"), "Toán tử nào tìm chính xác cụm từ \"hóa đơn điện tử\"?",
                    "Dấu ngoặc kép yêu cầu khớp đúng cả cụm từ.",
                    "hóa đơn điện tử", "\"hóa đơn điện tử\"*", "hóa+đơn+điện+tử", "(hóa đơn) điện tử"),
                Q(Tt02("1.2"), "Nguồn nào đáng tin cậy nhất để tra cứu quy định thuế mới?",
                    "Cổng thông tin chính thức của cơ quan quản lý là nguồn gốc của văn bản.",
                    "Bài đăng trên mạng xã hội", "Cổng thông tin của Tổng cục Thuế*", "Diễn đàn hỏi đáp", "Tin nhắn chuyển tiếp"),
                Q(Tt02("1.3"), "Cách đặt tên file nào giúp sắp xếp theo thời gian tốt nhất?",
                    "Định dạng năm-tháng-ngày ở đầu tên file giúp sắp xếp đúng thứ tự thời gian.",
                    "BaoCao_cuoi.xlsx", "2026-10-05_BaoCaoCongNo_v2.xlsx*", "baocao(1).xlsx", "Copy of BaoCao.xlsx"),
                Q(Tt02("1.3"), "Tài liệu kế toán đã quyết toán nên lưu trữ thế nào?",
                    "Lưu ở thư mục lưu trữ chỉ đọc, có phân quyền và sao lưu định kỳ.",
                    "Trên máy cá nhân", "Thư mục lưu trữ chỉ đọc, có phân quyền và sao lưu*", "Trong email", "Trên USB cá nhân"),
            });

        // ── A2-F: Giao tiếp số cơ bản (đã hoàn thành + chứng chỉ) ─────────────────────────────
        var communicationLessons = AddContent(db, communicationCourse, new[]
        {
            new ModuleSeed("Giao tiếp số nơi công sở", "Email, nhắn tin và họp trực tuyến chuyên nghiệp.", new[]
            {
                new LessonSeed("Viết email công việc chuyên nghiệp", "TEXT", 15, Statuses.LessonCompletionRule.View, EmailContent),
                new LessonSeed("Họp trực tuyến hiệu quả", "TEXT", 15, Statuses.LessonCompletionRule.View, MeetingContent),
            }),
        });
        var communicationFinal = AddAssessment(db, communicationCourse, bank, trainer.Id, "A2-F-FINAL", "Đánh giá cuối khóa A2-F: Giao tiếp số cơ bản",
            Statuses.AssessmentType.Final, isFinal: true, timeLimit: 15, maxAttempts: 3, passing: 70m, new[]
            {
                Q(Tt02("2.1"), "Tiêu đề email công việc nên thế nào?",
                    "Tiêu đề ngắn, nêu rõ nội dung và hành động cần làm.",
                    "Để trống", "Ngắn gọn, nêu rõ nội dung*", "Viết hoa toàn bộ", "Chỉ ghi \"Gửi anh/chị\""),
                Q(Tt02("2.1"), "Khi họp trực tuyến mà không phát biểu, bạn nên?",
                    "Tắt micro tránh tiếng ồn làm gián đoạn cuộc họp.",
                    "Bật micro", "Tắt micro*", "Rời cuộc họp", "Bật nhạc nền"),
                Q(Tt02("2.2"), "Chia sẻ tài liệu nội bộ an toàn nhất là?",
                    "Chia sẻ đường dẫn có phân quyền thay vì gửi file đính kèm tràn lan.",
                    "Gửi file qua mạng xã hội", "Chia sẻ link có phân quyền trên kho tài liệu công ty*", "In ra và phát", "Gửi qua email cá nhân"),
                Q(Tt02("2.2"), "Trả lời \"Reply all\" khi nào là phù hợp?",
                    "Chỉ khi mọi người trong danh sách đều cần biết nội dung trả lời.",
                    "Luôn luôn", "Khi mọi người nhận đều cần thông tin*", "Khi muốn cảm ơn", "Không bao giờ"),
            });

        await db.SaveChangesAsync();

        // ── Ghi danh + tiến độ của employee@ ─────────────────────────────────────────────────
        var managerUserId = managerUser.Id;
        var completedAt = now.AddDays(-12);
        var communicationEnrollment = new Enrollment
        {
            EmployeeId = employee.Id,
            CourseId = communicationCourse.Id,
            Status = Statuses.Enrollment.Completed,
            ProgressPercent = 100,
            StartedAt = now.AddDays(-20),
            CompletedAt = completedAt,
        };
        db.Enrollments.Add(communicationEnrollment);
        foreach (var lesson in communicationLessons)
        {
            db.LessonProgresses.Add(Done(communicationEnrollment.Id, lesson.Id, now.AddDays(-14)));
        }

        var passedAttempt = new AssessmentAttempt
        {
            AssessmentId = communicationFinal.Assessment.Id,
            EnrollmentId = communicationEnrollment.Id,
            AttemptNo = 1,
            Status = Statuses.AssessmentAttempt.Scored,
            StartedAt = completedAt.AddMinutes(-11),
            SubmittedAt = completedAt,
            ScoredAt = completedAt,
            Score = 75m,
            Passed = true,
        };
        db.AssessmentAttempts.Add(passedAttempt);
        for (var i = 0; i < communicationFinal.Questions.Count; i++)
        {
            var (question, options) = communicationFinal.Questions[i];
            var correct = i != 3; // sai câu cuối → 3/4 = 75 điểm
            var selected = correct ? options.First(o => o.IsCorrect) : options.First(o => !o.IsCorrect);
            db.AssessmentAnswers.Add(new AssessmentAnswer
            {
                AttemptId = passedAttempt.Id,
                QuestionId = question.Id,
                SelectedOptionId = selected.Id,
                IsCorrect = correct,
                PointsAwarded = correct ? 1 : 0,
            });
        }

        var template = await db.CertificateTemplates.FirstAsync(t => t.OrganizationId == organizationId && t.Status == Statuses.CertificateTemplate.Active);
        db.Certificates.Add(new Certificate
        {
            EmployeeId = employee.Id,
            EnrollmentId = communicationEnrollment.Id,
            AssessmentAttemptId = passedAttempt.Id,
            CertificateTemplateId = template.Id,
            CertificateCode = $"DT-{completedAt:yyyy}-DEMOA2F1",
            HolderNameSnapshot = employee.FullName,
            CourseTitleSnapshot = communicationCourse.Title,
            PrimaryCompetencySnapshot = $"{Tt02("2.1").Code} {Tt02("2.1").Name} — Cơ bản",
            IssuedAt = completedAt,
            ExpiresAt = completedAt.AddDays(730),
            Status = Statuses.Certificate.Valid,
        });

        var securityAssignment = new CourseAssignment
        {
            CourseId = securityCourse.Id,
            EmployeeId = employee.Id,
            AssignmentSource = Statuses.CourseAssignmentSource.Manual,
            SourceDepartmentId = employee.DepartmentId,
            AssignedByUserId = managerUserId,
            AssignedAt = now.AddDays(-6),
            DueDate = today.AddDays(10),
            Status = Statuses.CourseAssignment.Active,
        };
        db.CourseAssignments.Add(securityAssignment);
        var securityEnrollment = new Enrollment
        {
            CourseAssignmentId = securityAssignment.Id,
            EmployeeId = employee.Id,
            CourseId = securityCourse.Id,
            Status = Statuses.Enrollment.InProgress,
            ProgressPercent = 25,
            StartedAt = now.AddDays(-5),
            DueDate = today.AddDays(10),
        };
        db.Enrollments.Add(securityEnrollment);
        db.LessonProgresses.Add(Done(securityEnrollment.Id, securityLessons[0].Id, now.AddDays(-5)));
        db.LessonProgresses.Add(new LessonProgress
        {
            EnrollmentId = securityEnrollment.Id,
            LessonId = securityLessons[1].Id,
            Status = Statuses.LessonProgress.InProgress,
            LastAccessedAt = now.AddDays(-1),
        });

        var infoAssignment = new CourseAssignment
        {
            CourseId = infoCourse.Id,
            EmployeeId = employee.Id,
            AssignmentSource = Statuses.CourseAssignmentSource.SkillGap,
            AssignedByUserId = hr.Id,
            AssignedAt = now.AddDays(-2),
            DueDate = today.AddDays(20),
            Status = Statuses.CourseAssignment.Active,
        };
        db.CourseAssignments.Add(infoAssignment);
        db.Enrollments.Add(new Enrollment
        {
            CourseAssignmentId = infoAssignment.Id,
            EmployeeId = employee.Id,
            CourseId = infoCourse.Id,
            Status = Statuses.Enrollment.NotStarted,
            ProgressPercent = 0,
            DueDate = today.AddDays(20),
        });

        // manager@ tự ghi danh 1 khóa (menu Cá nhân của Manager)
        db.Enrollments.Add(new Enrollment
        {
            EmployeeId = manager.Id,
            CourseId = securityBasicsCourse.Id,
            Status = Statuses.Enrollment.NotStarted,
            ProgressPercent = 0,
        });

        // ── Nhiệm vụ thực tế của employee@ ───────────────────────────────────────────────────
        var rubric = JsonSerializer.Serialize(new[]
        {
            new { id = "rc-1", label = "Đúng yêu cầu nghiệp vụ", description = "Sản phẩm giải quyết đúng tình huống được giao", maxPoints = 40 },
            new { id = "rc-2", label = "Áp dụng đúng kỹ năng số", description = "Dùng công cụ / thao tác an toàn, đúng chuẩn", maxPoints = 40 },
            new { id = "rc-3", label = "Trình bày minh chứng", description = "Mô tả rõ quy trình, có link / ảnh minh họa", maxPoints = 20 },
        });

        AddTask(db, organizationId, employee, managerUserId, securityCourse.Id, rubric,
            "Rà soát quyền truy cập thư mục chứng từ kế toán",
            "Kiểm tra danh sách người có quyền truy cập thư mục chứng từ trên kho tài liệu của phòng, đề xuất thu hồi quyền không cần thiết.",
            "Bảng rà soát quyền (người dùng, quyền hiện tại, đề xuất) và ảnh chụp cấu hình sau khi điều chỉnh.",
            Statuses.TaskAssignment.Assigned, now.AddDays(-3), now.AddDays(7),
            new[] { (Tt02("4.2"), (short)2), (Tt02("4.1"), (short)2) });

        var revisionTask = AddTask(db, organizationId, employee, managerUserId, infoCourse.Id, rubric,
            "Chuẩn hóa quy trình lưu trữ hóa đơn điện tử",
            "Đề xuất cấu trúc thư mục và quy ước đặt tên cho hóa đơn điện tử đầu vào theo tháng, áp dụng thử cho tháng gần nhất.",
            "Sơ đồ cấu trúc thư mục, quy ước đặt tên và đường dẫn tới thư mục đã áp dụng.",
            Statuses.TaskAssignment.NeedsRevision, now.AddDays(-9), now.AddDays(5),
            new[] { (Tt02("1.3"), (short)2) });
        var revisionSubmission = new TaskSubmission
        {
            TaskAssignmentId = revisionTask.Id,
            VersionNo = 1,
            SubmissionNote = "Em đề xuất chia thư mục theo năm/tháng/nhà cung cấp và đặt tên theo mẫu NCC_SoHD_Ngay. Đã áp dụng cho hóa đơn tháng 9.",
            SubmissionUrl = "https://example.com/drive/hoa-don-thang-9",
            SubmittedAt = now.AddDays(-4),
            Status = Statuses.TaskSubmission.UnderReview,
        };
        db.TaskSubmissions.Add(revisionSubmission);
        db.TaskEvaluations.Add(new TaskEvaluation
        {
            TaskSubmissionId = revisionSubmission.Id,
            ReviewerUserId = managerUserId,
            OverallScore = 55,
            Verdict = Statuses.TaskVerdict.NeedsRevision,
            CountsAsEvidence = false,
            Feedback = "Cấu trúc thư mục ổn nhưng quy ước đặt tên chưa có ngày theo định dạng năm-tháng-ngày nên khó sắp xếp. Bổ sung phân quyền chỉ đọc cho thư mục đã quyết toán rồi nộp lại.",
            EvaluatedAt = now.AddDays(-2),
            RowVersion = 1,
        });

        var passedTask = AddTask(db, organizationId, employee, managerUserId, null, rubric,
            "Lập báo cáo đối chiếu công nợ có kiểm tra dữ liệu",
            "Dùng bảng tính đối chiếu công nợ khách hàng quý III, đánh giá và đánh dấu các nguồn số liệu không khớp.",
            "File báo cáo đối chiếu kèm ghi chú nguồn dữ liệu và các điểm bất thường.",
            Statuses.TaskAssignment.Passed, now.AddDays(-25), now.AddDays(-12),
            new[] { (Tt02("1.2"), (short)2) });
        var passedSubmission = new TaskSubmission
        {
            TaskAssignmentId = passedTask.Id,
            VersionNo = 1,
            SubmissionNote = "Báo cáo đối chiếu 128 khách hàng, phát hiện 6 chênh lệch do hóa đơn ghi nhận sai kỳ; đã ghi chú nguồn từng số liệu.",
            SubmissionUrl = "https://example.com/drive/doi-chieu-cong-no-q3",
            SubmittedAt = now.AddDays(-15),
            Status = Statuses.TaskSubmission.UnderReview,
        };
        db.TaskSubmissions.Add(passedSubmission);
        // Đạt yêu cầu nhiệm vụ nhưng KHÔNG dùng làm minh chứng nâng cấp độ: giữ nguyên mốc demo
        // "employee@ đã xác nhận mức Cơ bản ở mọi năng lực" (SkillGapSeeder, kịch bản demo §8 bước 2).
        var passedEvaluation = new TaskEvaluation
        {
            TaskSubmissionId = passedSubmission.Id,
            ReviewerUserId = managerUserId,
            OverallScore = 88,
            Verdict = Statuses.TaskVerdict.Passed,
            CountsAsEvidence = false,
            Feedback = "Đối chiếu chính xác, ghi chú nguồn dữ liệu rõ ràng. Cần thêm 1 nhiệm vụ cùng năng lực để xác nhận mức Trung cấp.",
            EvaluatedAt = now.AddDays(-13),
            RowVersion = 1,
        };
        db.TaskEvaluations.Add(passedEvaluation);
        db.CompetencyEvaluationResults.Add(new CompetencyEvaluationResult
        {
            TaskEvaluationId = passedEvaluation.Id,
            CompetencyId = Tt02("1.2").Id,
            TargetLevel = 2,
            Score = 88,
            Verdict = Statuses.TaskVerdict.Passed,
            LevelConfirming = false,
            Feedback = "Đánh giá và đối chiếu nguồn dữ liệu độc lập.",
        });

        await db.SaveChangesAsync();
    }

    private sealed record ModuleSeed(string Title, string Description, LessonSeed[] Lessons);

    private sealed record LessonSeed(string Title, string Type, int Minutes, string CompletionRule, string Content);

    private sealed record QuestionSeed(Competency Competency, string Content, string Explanation, string[] Options);

    private sealed record SeededAssessment(Assessment Assessment, List<(Question Question, List<QuestionOption> Options)> Questions);

    /// <summary>Phương án đúng đánh dấu bằng dấu * ở cuối.</summary>
    private static QuestionSeed Q(Competency competency, string content, string explanation, params string[] options) =>
        new(competency, content, explanation, options);

    private static List<Lesson> AddContent(AppDbContext db, Course course, ModuleSeed[] modules)
    {
        var lessons = new List<Lesson>();
        for (var m = 0; m < modules.Length; m++)
        {
            var module = new CourseModule
            {
                CourseId = course.Id,
                Code = $"{course.Code}-M{m + 1}",
                Title = modules[m].Title,
                Description = modules[m].Description,
                EstimatedMinutes = modules[m].Lessons.Sum(l => l.Minutes),
                SortOrder = m + 1,
                IsRequired = true,
                Status = Statuses.CourseContent.Active,
            };
            db.CourseModules.Add(module);

            for (var l = 0; l < modules[m].Lessons.Length; l++)
            {
                var seed = modules[m].Lessons[l];
                var lesson = new Lesson
                {
                    ModuleId = module.Id,
                    Code = $"{module.Code}-L{l + 1}",
                    Title = seed.Title,
                    LessonType = seed.Type,
                    ContentBody = seed.Content,
                    EstimatedMinutes = seed.Minutes,
                    SortOrder = l + 1,
                    IsRequired = true,
                    CompletionRule = seed.CompletionRule,
                    Status = Statuses.CourseContent.Active,
                };
                db.Lessons.Add(lesson);
                lessons.Add(lesson);

                if (l == 0)
                {
                    db.LearningMaterials.Add(new LearningMaterial
                    {
                        LessonId = lesson.Id,
                        Title = "Thông tư 02/2025/TT-BGDĐT — Khung năng lực số (PDF)",
                        MaterialType = Statuses.LearningMaterialType.Link,
                        ExternalUrl = SourceUrl,
                        SortOrder = 1,
                        IsRequired = false,
                    });
                }
            }
        }

        return lessons;
    }

    private static SeededAssessment AddAssessment(
        AppDbContext db, Course course, QuestionBank bank, Guid authorId, string code, string title,
        string type, bool isFinal, int? timeLimit, int? maxAttempts, decimal passing, QuestionSeed[] questions)
    {
        var assessment = new Assessment
        {
            CourseId = course.Id,
            Code = code,
            VersionNo = 1,
            Title = title,
            AssessmentType = type,
            IsFinal = isFinal,
            TimeLimitMinutes = timeLimit,
            MaxAttempts = maxAttempts,
            PassingScore = passing,
            Status = Statuses.Assessment.Published,
            CreatedByUserId = authorId,
            RowVersion = 1,
        };
        db.Assessments.Add(assessment);

        var seeded = new SeededAssessment(assessment, new());
        for (var i = 0; i < questions.Length; i++)
        {
            var seed = questions[i];
            var question = new Question
            {
                BankId = bank.Id,
                CompetencyId = seed.Competency.Id,
                QuestionType = Statuses.QuestionType.MultipleChoice,
                Difficulty = isFinal ? "MEDIUM" : "EASY",
                Content = seed.Content,
                Explanation = seed.Explanation,
                Status = Statuses.Question.Approved,
                CreatedByUserId = authorId,
            };
            db.Questions.Add(question);

            var options = seed.Options.Select((text, index) => new QuestionOption
            {
                QuestionId = question.Id,
                Content = text.TrimEnd('*'),
                IsCorrect = text.EndsWith('*'),
                SortOrder = index + 1,
            }).ToList();
            db.QuestionOptions.AddRange(options);
            db.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = assessment.Id, QuestionId = question.Id, Points = 1, SortOrder = i + 1 });
            seeded.Questions.Add((question, options));
        }

        return seeded;
    }

    private static TaskAssignment AddTask(
        AppDbContext db, Guid organizationId, Employee employee, Guid managerUserId, Guid? courseId, string rubric,
        string title, string description, string expectedOutput, string status, DateTimeOffset assignedAt, DateTimeOffset dueAt,
        (Competency Competency, short Level)[] targets)
    {
        var template = new PracticalTaskTemplate
        {
            OrganizationId = organizationId,
            RelatedCourseId = courseId,
            Title = title,
            Description = description,
            ExpectedOutput = expectedOutput,
            GeneralMarkingCriteria = rubric,
            SourceType = "MANUAL",
            Status = Statuses.TaskTemplate.Active,
            CreatedByUserId = managerUserId,
        };
        db.PracticalTaskTemplates.Add(template);

        var assignment = new TaskAssignment
        {
            TaskTemplateId = template.Id,
            EmployeeId = employee.Id,
            PromptingCourseId = courseId,
            AssignedByUserId = managerUserId,
            ReviewerUserId = managerUserId,
            AssignedAt = assignedAt,
            DueAt = dueAt,
            Status = status,
            TitleSnapshot = title,
            DescriptionSnapshot = description,
            ExpectedOutputSnapshot = expectedOutput,
        };
        db.TaskAssignments.Add(assignment);

        for (var i = 0; i < targets.Length; i++)
        {
            db.PracticalTaskTargets.Add(new PracticalTaskTarget
            {
                TaskTemplateId = template.Id,
                CompetencyId = targets[i].Competency.Id,
                TargetLevel = targets[i].Level,
                SortOrder = i + 1,
            });
            db.AssignedTaskTargets.Add(new AssignedTaskTarget
            {
                TaskAssignmentId = assignment.Id,
                CompetencyId = targets[i].Competency.Id,
                TargetLevel = targets[i].Level,
                SortOrder = i + 1,
            });
        }

        return assignment;
    }

    private static LessonProgress Done(Guid enrollmentId, Guid lessonId, DateTimeOffset at) => new()
    {
        EnrollmentId = enrollmentId,
        LessonId = lessonId,
        Status = Statuses.LessonProgress.Completed,
        ProgressPercent = 100,
        LastAccessedAt = at,
        CompletedAt = at,
    };

    // ── Nội dung bài học (đoạn cách nhau bằng dòng trống; "## " = tiêu đề, "- " = gạch đầu dòng) ──

    private const string SecurityRisksContent = """
        Mỗi ngày nhân viên kế toán tiếp xúc với chứng từ, hóa đơn và dữ liệu khách hàng — đây là mục tiêu hấp dẫn của kẻ tấn công.

        ## Các rủi ro thường gặp
        - Email lừa đảo giả mạo nhà cung cấp yêu cầu đổi số tài khoản nhận tiền.
        - Mã độc lây qua file đính kèm hoặc USB không rõ nguồn gốc.
        - Rò rỉ dữ liệu do chia sẻ file sai người hoặc để quyền truy cập quá rộng.

        ## Nguyên tắc phòng tránh
        - Luôn xác minh yêu cầu thay đổi thông tin thanh toán qua kênh thứ hai (gọi điện số đã biết).
        - Không mở file đính kèm bất thường; báo ngay cho bộ phận IT.
        - Chỉ cấp quyền truy cập theo nguyên tắc "cần biết".
        """;

    private const string PasswordContent = """
        Tình huống: một kế toán viên dùng cùng một mật khẩu cho email công việc, phần mềm kế toán và tài khoản mạng xã hội. Khi tài khoản mạng xã hội bị lộ, kẻ xấu đăng nhập được vào email công việc.

        ## Bài học rút ra
        - Mỗi hệ thống dùng một mật khẩu riêng, dài tối thiểu 12 ký tự.
        - Dùng trình quản lý mật khẩu được công ty phê duyệt.
        - Bật xác thực hai lớp (2FA) cho email và phần mềm kế toán.

        Hãy kiểm tra ngay tài khoản của bạn đã bật 2FA chưa, sau đó đánh dấu hoàn thành bài học.
        """;

    private const string PersonalDataContent = """
        Nghị định 13/2023/NĐ-CP quy định việc bảo vệ dữ liệu cá nhân. Bộ phận kế toán xử lý nhiều dữ liệu cá nhân: số tài khoản, mã số thuế cá nhân, thông tin lương.

        ## Nguyên tắc xử lý
        - Hợp pháp, minh bạch: chỉ xử lý khi có cơ sở (hợp đồng lao động, nghĩa vụ thuế...).
        - Tối thiểu hóa: chỉ thu thập dữ liệu thực sự cần.
        - Bảo mật: lưu ở nơi có phân quyền, mã hóa khi gửi ra ngoài.
        - Lưu trữ có thời hạn: hủy đúng quy định khi hết thời hạn lưu trữ.
        """;

    private const string PayrollScenarioContent = """
        Tình huống: trưởng phòng nhờ bạn gửi gấp bảng lương tháng cho đối tác kiểm toán. File chứa lương của 80 nhân viên.

        ## Cách xử lý đúng
        - Xác nhận đối tác có hợp đồng và thỏa thuận bảo mật với công ty.
        - Chỉ gửi phần dữ liệu cần cho phạm vi kiểm toán.
        - Đặt mật khẩu cho file, gửi mật khẩu qua kênh khác (tin nhắn / điện thoại).
        - Ghi nhận việc chia sẻ để tra soát sau này.
        """;

    private const string SearchOperatorsContent = """
        Tìm kiếm hiệu quả giúp tra cứu văn bản pháp luật, biểu mẫu và thông tin nhà cung cấp nhanh và chính xác hơn.

        ## Toán tử hay dùng
        - Dấu ngoặc kép "..." để tìm đúng cụm từ.
        - site:gdt.gov.vn để giới hạn trong một trang web.
        - filetype:pdf để chỉ tìm tài liệu PDF.
        - Dấu trừ (-) để loại bỏ kết quả không liên quan.
        """;

    private const string SourceEvaluationContent = """
        Tình huống: bạn đọc được trên một diễn đàn rằng thuế suất GTGT của một mặt hàng vừa thay đổi. Trước khi áp dụng vào hóa đơn, cần kiểm chứng.

        ## Tiêu chí đánh giá nguồn
        - Nguồn gốc: văn bản gốc từ cơ quan ban hành.
        - Thời điểm: văn bản còn hiệu lực, không bị thay thế.
        - Đối chiếu: so sánh ít nhất hai nguồn chính thức.
        """;

    private const string FolderConventionContent = """
        Thực hành: thiết kế cấu trúc thư mục cho chứng từ của phòng kế toán.

        ## Gợi ý cấu trúc
        - Năm / Tháng / Loại chứng từ (Hóa đơn đầu vào, Hóa đơn đầu ra, Phiếu chi...).
        - Đặt tên file: YYYY-MM-DD_LoaiChungTu_DoiTac_SoHieu.
        - Thư mục đã quyết toán đặt chế độ chỉ đọc.

        Áp dụng cho một tháng chứng từ thật rồi đánh dấu hoàn thành.
        """;

    private const string EmailContent = """
        Email công việc chuyên nghiệp giúp người nhận hiểu nhanh và hành động đúng.

        ## Cấu trúc email tốt
        - Tiêu đề rõ nội dung và hạn xử lý.
        - Mở đầu nêu mục đích trong một câu.
        - Nội dung chính chia ý ngắn gọn, có đánh số.
        - Kết thúc bằng hành động mong muốn và thời hạn.
        """;

    private const string MeetingContent = """
        Họp trực tuyến hiệu quả cần chuẩn bị trước và tuân thủ quy tắc chung.

        ## Quy tắc cơ bản
        - Gửi chương trình họp trước ít nhất một ngày.
        - Tắt micro khi không phát biểu, bật camera khi được yêu cầu.
        - Ghi biên bản và gửi lại cho người tham dự sau cuộc họp.
        """;
}
