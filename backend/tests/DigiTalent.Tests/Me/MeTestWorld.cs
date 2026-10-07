using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Services.Intelligence.SkillGap;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Tests.Persistence;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace DigiTalent.Tests.Me;

/// <summary>
/// Dữ liệu test trang cá nhân (EM-*): 1 tổ chức riêng, nhân viên "Me" + đồng nghiệp "Peer" cùng ghi danh 1 khóa
/// (bài VIEW + bài PASS_CHECK, bài FINAL 3 câu: 15 phút, tối đa 2 lần, đạt 70), mẫu chứng chỉ ACTIVE,
/// và mỗi người 1 nhiệm vụ thực tế ASSIGNED do Reviewer chấm.
/// </summary>
internal sealed class MeTestWorld
{
    public required AppDbContext Context { get; init; }
    public required Domain.Entities.Organization Organization { get; init; }
    public required Employee Me { get; init; }
    public required Employee Peer { get; init; }
    public required User MeUser { get; init; }
    public required User PeerUser { get; init; }
    public required User Reviewer { get; init; }
    public required Course Course { get; init; }
    public required Lesson ViewLesson { get; init; }
    public required Lesson PassCheckLesson { get; init; }
    public required Assessment Final { get; init; }
    public required List<(Question Question, QuestionOption Correct, QuestionOption Wrong)> Questions { get; init; }
    public required Enrollment MyEnrollment { get; init; }
    public required TaskAssignment MyTask { get; init; }
    public required TaskAssignment PeerTask { get; init; }
    public required Domain.Entities.Competency Competency { get; init; }

    public static async Task<MeTestWorld> CreateAsync()
    {
        var context = PostgresTestDatabase.CreateContext();
        await PostgresTestDatabase.MigrateAsync(context);

        var suffix = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var organization = new Domain.Entities.Organization { Code = $"ME_{suffix}", Name = "Me Test Org", Status = Statuses.Simple.Active };
        User NewUser(string name) => new() { OrganizationId = organization.Id, Email = $"{name}_{suffix}@test.local".ToLowerInvariant(), PasswordHash = "x", DisplayName = name };
        var meUser = NewUser("Me");
        var peerUser = NewUser("Peer");
        var reviewer = NewUser("Reviewer");
        var department = new Department { OrganizationId = organization.Id, Code = $"D_{suffix}", Name = "Finance" };
        Employee NewEmployee(User user, string code) => new()
        {
            OrganizationId = organization.Id,
            UserId = user.Id,
            DepartmentId = department.Id,
            EmployeeCode = $"{code}_{suffix}",
            FullName = user.DisplayName,
            Status = Statuses.Employee.Active,
        };
        var me = NewEmployee(meUser, "ME");
        var peer = NewEmployee(peerUser, "PEER");

        var category = new CompetencyCategory { OrganizationId = organization.Id, Code = $"CAT_{suffix}", Name = "Safety" };
        var competency = new Domain.Entities.Competency { CategoryId = category.Id, Code = $"SEC_{suffix}", Name = "Data protection", Status = Statuses.Competency.Active };

        var course = new Course
        {
            OrganizationId = organization.Id,
            Code = $"C_{suffix}",
            VersionNo = 1,
            Title = "Information security at work",
            EstimatedDurationMinutes = 60,
            CertificateEnabled = true,
            CertificateValidityDays = 365,
            Status = Statuses.Course.Published,
            CreatedByUserId = reviewer.Id,
            RowVersion = 1,
        };
        var module = new CourseModule { CourseId = course.Id, Title = "Module 1", SortOrder = 1, IsRequired = true, Status = Statuses.CourseContent.Active };
        Lesson NewLesson(string title, int order, string rule) => new()
        {
            ModuleId = module.Id,
            Title = title,
            LessonType = rule == Statuses.LessonCompletionRule.PassCheck ? "QUIZ" : "TEXT",
            ContentBody = "Content",
            SortOrder = order,
            IsRequired = true,
            CompletionRule = rule,
            Status = Statuses.CourseContent.Active,
        };
        var viewLesson = NewLesson("Read me", 1, Statuses.LessonCompletionRule.View);
        var passCheckLesson = NewLesson("Quiz", 2, Statuses.LessonCompletionRule.PassCheck);

        var bank = new QuestionBank { OrganizationId = organization.Id, Title = "Bank", Status = Statuses.QuestionBank.Active };
        var final = new Assessment
        {
            CourseId = course.Id,
            Code = "FINAL",
            VersionNo = 1,
            Title = "Final exam",
            AssessmentType = Statuses.AssessmentType.Final,
            IsFinal = true,
            TimeLimitMinutes = 15,
            MaxAttempts = 2,
            PassingScore = 70,
            Status = Statuses.Assessment.Published,
            CreatedByUserId = reviewer.Id,
            RowVersion = 1,
        };

        var questions = new List<(Question, QuestionOption, QuestionOption)>();
        for (var i = 1; i <= 3; i++)
        {
            var question = new Question
            {
                BankId = bank.Id,
                CompetencyId = competency.Id,
                QuestionType = Statuses.QuestionType.MultipleChoice,
                Content = $"Question {i}",
                Explanation = $"Explanation {i}",
                Status = Statuses.Question.Approved,
                CreatedByUserId = reviewer.Id,
            };
            var wrong = new QuestionOption { QuestionId = question.Id, Content = "Wrong", IsCorrect = false, SortOrder = 1 };
            var correct = new QuestionOption { QuestionId = question.Id, Content = "Right", IsCorrect = true, SortOrder = 2 };
            context.Questions.Add(question);
            context.QuestionOptions.AddRange(wrong, correct);
            context.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = final.Id, QuestionId = question.Id, Points = 1, SortOrder = i });
            questions.Add((question, correct, wrong));
        }

        var myEnrollment = new Enrollment { EmployeeId = me.Id, CourseId = course.Id, Status = Statuses.Enrollment.NotStarted };
        var peerEnrollment = new Enrollment { EmployeeId = peer.Id, CourseId = course.Id, Status = Statuses.Enrollment.NotStarted };

        TaskAssignment NewTask(Employee employee) => new()
        {
            EmployeeId = employee.Id,
            AssignedByUserId = reviewer.Id,
            ReviewerUserId = reviewer.Id,
            AssignedAt = DateTimeOffset.UtcNow,
            DueAt = DateTimeOffset.UtcNow.AddDays(7),
            Status = Statuses.TaskAssignment.Assigned,
            TitleSnapshot = $"Task of {employee.FullName}",
            DescriptionSnapshot = "Review folder permissions",
            ExpectedOutputSnapshot = "A report",
        };
        var myTask = NewTask(me);
        var peerTask = NewTask(peer);

        context.Organizations.Add(organization);
        context.Users.AddRange(meUser, peerUser, reviewer);
        context.Departments.Add(department);
        context.Employees.AddRange(me, peer);
        context.CompetencyCategories.Add(category);
        context.Competencies.Add(competency);
        context.Courses.Add(course);
        context.CourseModules.Add(module);
        context.Lessons.AddRange(viewLesson, passCheckLesson);
        context.QuestionBanks.Add(bank);
        context.Assessments.Add(final);
        context.CertificateTemplates.Add(new CertificateTemplate
        {
            OrganizationId = organization.Id,
            Name = "Default",
            TemplateHtml = "<p>{{holderName}}</p>",
            Status = Statuses.CertificateTemplate.Active,
        });
        context.Enrollments.AddRange(myEnrollment, peerEnrollment);
        context.TaskAssignments.AddRange(myTask, peerTask);
        context.AssignedTaskTargets.Add(new AssignedTaskTarget { TaskAssignmentId = myTask.Id, CompetencyId = competency.Id, TargetLevel = 2, SortOrder = 1 });
        await context.SaveChangesAsync();

        return new MeTestWorld
        {
            Context = context,
            Organization = organization,
            Me = me,
            Peer = peer,
            MeUser = meUser,
            PeerUser = peerUser,
            Reviewer = reviewer,
            Course = course,
            ViewLesson = viewLesson,
            PassCheckLesson = passCheckLesson,
            Final = final,
            Questions = questions,
            MyEnrollment = myEnrollment,
            MyTask = myTask,
            PeerTask = peerTask,
            Competency = competency,
        };
    }

    public ICurrentUser UserOf(User user)
    {
        var mock = new Mock<ICurrentUser>();
        mock.Setup(c => c.GetRequiredOrganizationId()).Returns(Organization.Id);
        mock.Setup(c => c.OrganizationId).Returns(Organization.Id);
        mock.Setup(c => c.UserId).Returns(user.Id);
        mock.Setup(c => c.IsAuthenticated).Returns(true);
        return mock.Object;
    }

    /// <summary>Dịch vụ /me/* dựng thủ công như DI làm trong Application.DependencyInjection.</summary>
    public sealed record Services(
        MyEmployeeContext Me,
        MyLearningProgressService Progress,
        MyAssessmentService Assessments,
        MyAttemptPresenter Presenter,
        MyTaskReader Tasks,
        MyEnrollmentRules EnrollmentRules,
        MyCompetencySnapshotBuilder Snapshot,
        MyCourseReader Courses);

    public Services For(User user)
    {
        var current = UserOf(user);
        var progress = new MyLearningProgressService(Context);
        var issuer = new MyCertificateIssuer(Context, Mock.Of<IAuditService>());
        var assessments = new MyAssessmentService(Context, progress, issuer);
        return new Services(
            new MyEmployeeContext(Context, current),
            progress,
            assessments,
            new MyAttemptPresenter(Context, assessments),
            new MyTaskReader(Context),
            new MyEnrollmentRules(Context),
            new MyCompetencySnapshotBuilder(Context, new SkillGapSettingsProvider(Context, NullLogger<SkillGapSettingsProvider>.Instance)),
            new MyCourseReader(Context));
    }

    public Dictionary<Guid, Guid?> Answers(int correctCount) =>
        Questions.Select((q, index) => (q.Question.Id, Option: index < correctCount ? q.Correct.Id : q.Wrong.Id))
            .ToDictionary(x => x.Id, x => (Guid?)x.Option);
}
