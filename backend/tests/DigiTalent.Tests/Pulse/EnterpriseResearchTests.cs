using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Organization.Research;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Content;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Pulse;

public class EnterpriseResearchTests
{
    private static readonly IHtmlContentSanitizer Sanitizer = new HtmlContentSanitizer();

    [Fact]
    public async Task OwnerControlsResearchAndOnlyAppliedContentReachesTheLearner()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var researcher = await world.UserAsync(PulseTestWorld.ManagerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var rndRole = await context.Roles.SingleAsync(role => role.Code == Roles.Research);
        context.UserRoles.Add(new UserRole { UserId = researcher.Id, RoleId = rndRole.Id });
        await context.SaveChangesAsync();

        var catalog = new PulseCatalogReader(context);
        var reader = Reader(context);
        var ownerApi = new EnterpriseResearch(context, Caller(owner, organizationId), catalog);
        var rndApi = new EnterpriseResearch(context, Caller(researcher, organizationId), catalog);

        (await rndApi.GetEnabledAsync()).Should().BeFalse();
        await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.ListAsync());
        await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.SetEnabledAsync(true));
        await Assert.ThrowsAsync<ForbiddenException>(() => new EnterpriseResearch(
            context, Caller(researcher, Guid.NewGuid()), catalog).ListAsync());
        await ownerApi.SetEnabledAsync(true);
        // Customising stays locked until the company buys a course, the free Basic courses alone do not open it.
        (await Assert.ThrowsAsync<ForbiddenException>(() => rndApi.ListAsync())).Message.Should().Be(EnterpriseResearch.PurchaseRequiredMessage);
        (await Assert.ThrowsAsync<ForbiddenException>(() => ownerApi.ListAsync())).Message.Should().Be(EnterpriseResearch.PurchaseRequiredMessage);
        var paid = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = paid.Id, Amount = 100 });
        await context.SaveChangesAsync();

        var all = await catalog.LoadAsync(organizationId);
        var basic = (await rndApi.ListAsync()).Where(course => course.Tier == 1).ToList();
        basic.Select(course => course.Code).Should().BeEquivalentTo(Enumerable.Range(1, 6).Select(index => $"M{index}-F"));
        var listed = await rndApi.ListAsync();
        // A company with R&D: R&D edits and applies, the owner only views.
        var ownerAccess = await ownerApi.GetAccessAsync();
        ownerAccess.InCharge.Should().Be("RND");
        ownerAccess.Researchers.Should().Be(1);
        ownerAccess.CanView.Should().BeTrue();
        ownerAccess.CanEdit.Should().BeFalse();
        (await ownerApi.ListAsync()).Should().NotBeEmpty();
        (await rndApi.GetAccessAsync()).CanEdit.Should().BeTrue();
        listed.Should().Contain(course => course.Code == "M1-I");
        var excluded = all.First(course => course.Tier > 1 && !listed.Any(item => item.CourseId == course.CourseId));

        var source = basic.Single(course => course.Code == "M2-F");
        var content = new ResearchCourseContent("Khóa học nội bộ", "Lập báo cáo theo mẫu công ty.", "Dùng dữ liệu đào tạo để thực hành.");
        (await Assert.ThrowsAsync<ForbiddenException>(() => ownerApi.SaveAsync(basic[0].CourseId, content)))
            .Message.Should().Be(EnterpriseResearch.ResearchInChargeMessage);
        await Assert.ThrowsAsync<NotFoundException>(() => rndApi.SaveAsync(excluded.CourseId, content));
        await Assert.ThrowsAsync<NotFoundException>(() => rndApi.PreviewAsync(excluded.CourseId, Mock.Of<IPlatformAssetUrlSigner>()));
        (await rndApi.PreviewAsync(source.CourseId, Mock.Of<IPlatformAssetUrlSigner>()))
            .Should().Contain(module => module.Lessons.Count > 0);

        // Nothing but the information is required: practice and objective may stay empty in a draft.
        await rndApi.SaveAsync(source.CourseId, new ResearchCourseContent("", "", ""));
        var learner = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        await rndApi.SaveAsync(source.CourseId, content);
        (await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = source.CourseId })).EnterpriseContent.Should().BeNull();

        var editor = await rndApi.GetAuthoringAsync(source.CourseId, reader, Sanitizer);
        await rndApi.ApplyCompanyVersionAsync(source.CourseId, new ResearchApplyInput(editor.Revision, content), reader, Sanitizer);
        context.ChangeTracker.Clear();
        var applied = (await rndApi.ListAsync()).Single(course => course.Code == "M2-F");
        await rndApi.SaveAsync(applied.CourseId, content with { Title = "Bản nháp mới" });
        var course = await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = applied.CourseId });
        course.EnterpriseContent.Should().Be(content);
        // employee@ passed M2-F before: the result, and the content it was passed on, are kept.
        course.Course.Title.Should().NotBe("Khóa học nội bộ");
        course.NextAction.Should().Be("DONE");
        (await rndApi.ListAsync()).Single(c => c.Code == "M2-F").Title.Should().Be("Khóa học nội bộ", "new learners start on it");

        // R&D switched off (the company no longer has R&D): the R&D accounts are locked out and the owner takes over.
        await ownerApi.SetEnabledAsync(false);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            rndApi.ApplyCompanyVersionAsync(applied.CourseId, new ResearchApplyInput(editor.Revision + 1, content), reader, Sanitizer));
        (await ownerApi.GetAccessAsync()).Should().Match<ResearchAccess>(a => a.InCharge == "OWNER" && a.CanEdit);
        await ownerApi.SaveAsync(applied.CourseId, content with { Title = "Owner tự sửa" });
        (await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = applied.CourseId })).EnterpriseContent.Should().Be(content);
    }

    [Fact]
    public async Task AppliedCompanyVersionIsTheCourseEmployeesLearnUntilRemovedOrReplacedByDigiTalent()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var reader = Reader(context);
        var research = new EnterpriseResearch(context, Caller(owner, organizationId), new PulseCatalogReader(context), world.Clock);
        // A small company: R&D stays off and the owner customises the courses.
        var bought = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = bought.Id, Amount = 100 });
        await context.SaveChangesAsync();
        var standard = (await research.ListAsync()).Single(course => course.Code == "M2-F");
        var completed = await context.Enrollments.AsNoTracking()
            .Where(e => e.CourseId == standard.CourseId && e.Status == Statuses.Enrollment.Completed).Select(e => e.Id).ToListAsync();
        completed.Should().NotBeEmpty("employee@ passed M2-F in the seed");
        var employeeUser = await world.UserAsync(PulseTestWorld.EmployeeEmail);
        var learningRow = await context.Enrollments.SingleAsync(e => completed.Contains(e.Id)
            && context.Employees.Any(emp => emp.Id == e.EmployeeId && emp.UserId == employeeUser.Id));
        learningRow.Status = Statuses.Enrollment.InProgress;
        learningRow.CompletedAt = null;
        // Half-way: the first page of module 1 read and its review quiz passed.
        var oldModule = await context.CourseModules.Where(m => m.CourseId == standard.CourseId).OrderBy(m => m.SortOrder).FirstAsync();
        var oldPage = await context.Lessons.Where(l => l.ModuleId == oldModule.Id).OrderBy(l => l.SortOrder).FirstAsync();
        var oldQuiz = await context.Assessments.Where(a => a.ModuleId == oldModule.Id && !a.IsFinal).Select(a => a.Id).FirstAsync();
        context.LessonProgresses.RemoveRange(await context.LessonProgresses.Where(p => p.EnrollmentId == learningRow.Id).ToListAsync());
        context.AssessmentAttempts.RemoveRange(await context.AssessmentAttempts.Where(a => a.EnrollmentId == learningRow.Id).ToListAsync());
        context.LessonProgresses.Add(new LessonProgress
        {
            EnrollmentId = learningRow.Id, LessonId = oldPage.Id, Status = Statuses.LessonProgress.Completed, ProgressPercent = 100,
            CompletedAt = world.Clock.GetUtcNow(),
        });
        context.AssessmentAttempts.Add(new AssessmentAttempt
        {
            AssessmentId = oldQuiz, EnrollmentId = learningRow.Id, AttemptNo = 1, Status = Statuses.AssessmentAttempt.Scored,
            StartedAt = world.Clock.GetUtcNow(), SubmittedAt = world.Clock.GetUtcNow(), ScoredAt = world.Clock.GetUtcNow(), Score = 90, Passed = true,
        });
        var colleague = await context.Employees.AsNoTracking()
            .FirstAsync(e => e.OrganizationId == organizationId && e.Id != learningRow.EmployeeId);
        var finished = new Enrollment
        {
            CourseId = standard.CourseId, EmployeeId = colleague.Id, Status = Statuses.Enrollment.Completed, ProgressPercent = 100,
            CompletedAt = world.Clock.GetUtcNow(),
        };
        context.Enrollments.Add(finished);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var editor = await research.GetAuthoringAsync(standard.CourseId, reader, Sanitizer);
        editor.Problems.Should().BeEmpty("the standard content can be applied as it is");
        var standardTitle = editor.Course.Modules[0].Title;

        // R&D writes its own first page and question; an empty module is not ready to apply.
        var modules = editor.Course.Modules;
        modules[0].Title = "Báo cáo theo mẫu công ty";
        modules[0].Blocks.Insert(0, new PlatformBlockDto
        {
            BlockId = Guid.NewGuid(), Type = PlatformCatalog.BlockType.Text,
            BodyHtml = "<h3>Mẫu báo cáo nội bộ</h3><p>Dùng mẫu BC-01 của công ty cho mọi báo cáo tháng.</p>",
        });
        // A page heading longer than the 250-character title column still applies.
        modules[0].Blocks.Insert(1, new PlatformBlockDto
        {
            BlockId = Guid.NewGuid(), Type = PlatformCatalog.BlockType.Text,
            BodyHtml = $"<h3>{new string('A', 300)}</h3><p>Trang có tiêu đề rất dài.</p>",
        });
        modules[0].Questions.Add(new PlatformQuestionDto
        {
            QuestionId = Guid.NewGuid(), Text = "Báo cáo tháng dùng mẫu nào?",
            Options = [new PlatformOptionDto { OptionId = Guid.NewGuid(), Text = "BC-01", IsCorrect = true },
                new PlatformOptionDto { OptionId = Guid.NewGuid(), Text = "BC-99" }],
        });
        modules.Add(new PlatformModuleDto { ModuleId = Guid.NewGuid(), Title = "Mô đun trống", QuizTitle = "Câu hỏi ôn tập" });
        var draft = await research.SaveAuthoringAsync(standard.CourseId, new ResearchAuthoringInput(editor.Revision, modules, editor.Course.Final), reader, Sanitizer);
        draft.HasDraft.Should().BeTrue();
        draft.Problems.Should().Contain(p => p.Contains($"Mô đun {modules.Count}: chưa có nội dung"))
            .And.Contain(p => p.Contains($"Mô đun {modules.Count}: cần ít nhất"));
        await Assert.ThrowsAsync<BadRequestException>(() =>
            research.ApplyCompanyVersionAsync(standard.CourseId, new ResearchApplyInput(draft.Revision, null), reader, Sanitizer));
        context.ChangeTracker.Clear();
        (await context.Courses.CountAsync(c => c.OrganizationId == organizationId && c.Code == "M2-F")).Should().Be(1, "a draft never reaches employees");

        modules.RemoveAt(modules.Count - 1);
        draft = await research.SaveAuthoringAsync(standard.CourseId, new ResearchAuthoringInput(draft.Revision, modules, editor.Course.Final), reader, Sanitizer);
        draft.Problems.Should().BeEmpty();
        var applied = await research.ApplyCompanyVersionAsync(standard.CourseId, new ResearchApplyInput(draft.Revision, null, GraceDays: 0), reader, Sanitizer);
        context.ChangeTracker.Clear();
        applied.HasApplied.Should().BeTrue();
        applied.HasDraft.Should().BeFalse();

        // A new revision of the course in the company, with R&D's pages and questions.
        var revision = await context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.Code == "M2-F").OrderByDescending(c => c.VersionNo).FirstAsync();
        revision.Id.Should().Be(applied.Course.CourseId);
        revision.SupersedesCourseId.Should().Be(standard.CourseId);
        (await research.ListAsync()).Single(c => c.Code == "M2-F").CourseId.Should().Be(revision.Id);
        var firstModule = await context.CourseModules.AsNoTracking().Where(m => m.CourseId == revision.Id).OrderBy(m => m.SortOrder).FirstAsync();
        firstModule.Title.Should().Be("Báo cáo theo mẫu công ty");
        (await context.Lessons.AsNoTracking().Where(l => l.ModuleId == firstModule.Id).OrderBy(l => l.SortOrder).FirstAsync())
            .Title.Should().Be("Mẫu báo cáo nội bộ");
        var quizQuestions = await (from assessment in context.Assessments.AsNoTracking()
                                   join link in context.AssessmentQuestions.AsNoTracking() on assessment.Id equals link.AssessmentId
                                   join question in context.Questions.AsNoTracking() on link.QuestionId equals question.Id
                                   where assessment.ModuleId == firstModule.Id
                                   select question.Content).ToListAsync();
        quizQuestions.Should().Contain("Báo cáo tháng dùng mẫu nào?");
        var titles = await (from lesson in context.Lessons.AsNoTracking()
                            join module in context.CourseModules.AsNoTracking() on lesson.ModuleId equals module.Id
                            where module.CourseId == revision.Id
                            select lesson.Title).ToListAsync();
        titles.Should().OnlyContain(title => title.Length > 0 && title.Length <= 250);
        titles.Should().Contain(title => title.StartsWith("AAAA") && title.EndsWith("…"));
        (await context.Assessments.AnyAsync(a => a.CourseId == revision.Id && a.IsFinal)).Should().BeTrue();

        // A minor change applied at once: whoever was learning goes on with the new content (progress kept); a finished course is kept.
        var moved = await context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == learningRow.Id);
        moved.Status.Should().Be(Statuses.Enrollment.InProgress);
        moved.CourseId.Should().Be(revision.Id);
        // The progress carried over by position onto R&D's module 1: page 1 read (R&D's new page), review quiz passed.
        var newModule = await context.CourseModules.AsNoTracking().Where(m => m.CourseId == revision.Id).OrderBy(m => m.SortOrder).FirstAsync();
        var newPage = await context.Lessons.AsNoTracking().Where(l => l.ModuleId == newModule.Id).OrderBy(l => l.SortOrder).FirstAsync();
        var newQuiz = await context.Assessments.AsNoTracking().Where(a => a.ModuleId == newModule.Id && !a.IsFinal).Select(a => a.Id).FirstAsync();
        (await context.LessonProgresses.AnyAsync(p => p.EnrollmentId == learningRow.Id && p.LessonId == newPage.Id
            && p.Status == Statuses.LessonProgress.Completed)).Should().BeTrue();
        (await context.AssessmentAttempts.AnyAsync(a => a.EnrollmentId == learningRow.Id && a.AssessmentId == newQuiz && a.Passed == true))
            .Should().BeTrue();
        (await context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == finished.Id)).Status.Should().Be(Statuses.Enrollment.Completed);
        var learner = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = revision.Id });
        course.Modules[0].Title.Should().Be("Báo cáo theo mẫu công ty");
        (await EnterpriseResearch.CompanyVersionCodesAsync(context, organizationId, ["M2-F"])).Should().Contain("M2-F");

        // Work sent from a page of the old content says the course moved on, progress kept (not "module not found").
        var stale = () => learner.SubmitQuiz.ExecuteAsync(new SubmitPulseModuleQuizUseCaseInput
        {
            CourseId = standard.CourseId, ModuleId = Guid.NewGuid(), Answers = [],
        });
        (await stale.Should().ThrowAsync<ConflictException>()).WithMessage(PulseCourseWorkspace.MovedMessage);

        // The competency survey keeps measuring with DigiTalent's standard revision, not R&D's.
        var catalog = new PulseCatalogReader(context);
        (await catalog.LoadAsync(organizationId)).Single(c => c.Code == "M2-F").CourseId.Should().Be(revision.Id);
        (await catalog.LoadAsync(organizationId, excludeCourseIds: await EnterpriseResearch.CompanyRevisionIdsAsync(context, organizationId)))
            .Single(c => c.Code == "M2-F").CourseId.Should().Be(standard.CourseId);

        // Removing it writes the standard content again; R&D keeps its version as a draft.
        var removed = await research.RemoveCompanyVersionAsync(revision.Id, applied.Revision, reader, Sanitizer);
        context.ChangeTracker.Clear();
        removed.HasApplied.Should().BeFalse();
        removed.HasDraft.Should().BeTrue();
        removed.Course.Modules[0].Title.Should().Be("Báo cáo theo mẫu công ty", "the editor shows R&D's draft");
        var back = await context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == organizationId && c.Code == "M2-F").OrderByDescending(c => c.VersionNo).FirstAsync();
        back.VersionNo.Should().Be(revision.VersionNo + 1);
        removed.Course.CourseId.Should().Be(back.Id);
        (await context.CourseModules.AsNoTracking().Where(m => m.CourseId == back.Id).OrderBy(m => m.SortOrder).FirstAsync())
            .Title.Should().Be(standardTitle);

        // DigiTalent content written for the course (an update the company applies) replaces the company version too.
        var again = await research.ApplyCompanyVersionAsync(back.Id, new ResearchApplyInput(removed.Revision, null), reader, Sanitizer);
        context.ChangeTracker.Clear();
        var version = await context.PlatformCatalogVersions.AsNoTracking().SingleAsync(v => v.Status == Statuses.PlatformCatalogVersion.Current);
        var platformCourse = await context.PlatformCourses.AsNoTracking().SingleAsync(c => c.Code == "M2-F");
        await new PlatformLearningPublisher(context).PublishAsync(version.Id, null, world.Clock.GetUtcNow(), organizationId,
            onlyCourseIds: [platformCourse.Id], reapply: true);
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
        (await EnterpriseResearch.CompanyVersionCodesAsync(context, organizationId, ["M2-F"])).Should().BeEmpty();
        var latest = (await research.ListAsync()).Single(c => c.Code == "M2-F");
        var state = await research.GetAuthoringAsync(latest.CourseId, reader, Sanitizer);
        state.HasApplied.Should().BeFalse();
        state.HasDraft.Should().BeTrue();
        state.Revision.Should().BeGreaterThan(again.Revision);
    }

    [Fact]
    public async Task A_learner_half_way_keeps_the_old_content_until_the_grace_ends()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var reader = Reader(context);
        var research = new EnterpriseResearch(context, Caller(owner, organizationId), new PulseCatalogReader(context), world.Clock);
        var bought = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = bought.Id, Amount = 100 });
        await context.SaveChangesAsync();
        var standard = (await research.ListAsync()).Single(course => course.Code == "M2-F");
        var employeeUser = await world.UserAsync(PulseTestWorld.EmployeeEmail);
        var row = await context.Enrollments.SingleAsync(e => e.CourseId == standard.CourseId
            && context.Employees.Any(emp => emp.Id == e.EmployeeId && emp.UserId == employeeUser.Id));
        row.Status = Statuses.Enrollment.InProgress;
        row.CompletedAt = null;
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        var editor = await research.GetAuthoringAsync(standard.CourseId, reader, Sanitizer);
        var modules = editor.Course.Modules;
        modules[0].Title = "Bản mới của công ty";
        var draft = await research.SaveAuthoringAsync(standard.CourseId, new ResearchAuthoringInput(editor.Revision, modules, editor.Course.Final), reader, Sanitizer);
        var wrong = () => research.ApplyCompanyVersionAsync(standard.CourseId, new ResearchApplyInput(draft.Revision, null, GraceDays: 3), reader, Sanitizer);
        await wrong.Should().ThrowAsync<BadRequestException>();
        await research.ApplyCompanyVersionAsync(standard.CourseId, new ResearchApplyInput(draft.Revision, null, GraceDays: 14), reader, Sanitizer);
        context.ChangeTracker.Clear();

        // Half-way: they go on with the content they started, and see the day it switches.
        var learner = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var course = await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = standard.CourseId });
        course.Course.CourseId.Should().Be(standard.CourseId);
        course.Modules[0].Title.Should().NotBe("Bản mới của công ty");
        course.Course.ContentSwitchAt.Should().BeCloseTo(world.Clock.GetUtcNow().AddDays(14), TimeSpan.FromMinutes(1));
        course.Course.ContentSwitchKeepsProgress.Should().BeTrue("a minor change keeps the progress on that day");
        (await context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == row.Id)).Status.Should().Be(Statuses.Enrollment.InProgress);

        // 14 days: the 7-day reminder comes a week later, not at once.
        await Application.UseCases.Learning.CourseUpdates.CourseRelearn.ProcessGraceAsync(context, world.Clock.GetUtcNow().AddHours(1));
        (await context.Notifications.AsNoTracking().CountAsync(n => n.RecipientUserId == employeeUser.Id
            && n.Type == Application.UseCases.Learning.CourseUpdates.CourseRelearn.ReminderNotificationType)).Should().Be(0);

        // The grace is over: they move to the new content.
        await Application.UseCases.Learning.CourseUpdates.CourseRelearn.ProcessGraceAsync(context, world.Clock.GetUtcNow().AddDays(15));
        context.ChangeTracker.Clear();
        var moved = await learner.GetCourse.ExecuteAsync(new GetPulseCourseUseCaseInput { CourseId = standard.CourseId });
        moved.Modules[0].Title.Should().Be("Bản mới của công ty");
        moved.Course.ContentSwitchAt.Should().BeNull();
    }

    [Fact]
    public async Task Several_edited_courses_are_applied_at_once_with_one_detailed_notification_per_employee()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var reader = Reader(context);
        var research = new EnterpriseResearch(context, Caller(owner, organizationId), new PulseCatalogReader(context), world.Clock);
        var bought = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = bought.Id, Amount = 100 });
        await context.SaveChangesAsync();
        var list = await research.ListAsync();
        var communication = list.Single(course => course.Code == "M2-F");
        var content = list.Single(course => course.Code == "M3-F");
        // employee@ passed M2-F in the seed (made half-way here) and has not started M3-F.
        var employeeUser = await world.UserAsync(PulseTestWorld.EmployeeEmail);
        var learning = await context.Enrollments.SingleAsync(e => e.CourseId == communication.CourseId
            && context.Employees.Any(emp => emp.Id == e.EmployeeId && emp.UserId == employeeUser.Id));
        learning.Status = Statuses.Enrollment.InProgress;
        learning.CompletedAt = null;
        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();

        // R&D edits two courses: module 1 of M2-F, module 2 of M3-F.
        async Task<int> EditAsync(Guid courseId, int module, string title)
        {
            var editor = await research.GetAuthoringAsync(courseId, reader, Sanitizer);
            editor.Course.Modules[module].Title = title;
            return (await research.SaveAuthoringAsync(courseId, new ResearchAuthoringInput(editor.Revision, editor.Course.Modules, editor.Course.Final),
                reader, Sanitizer)).Revision;
        }
        var communicationRevision = await EditAsync(communication.CourseId, 0, "Giao tiếp theo mẫu công ty");
        var contentRevision = await EditAsync(content.CourseId, 1, "Tạo nội dung theo mẫu công ty");
        var drafted = await research.ListAsync();
        drafted.Where(c => c.HasContentDraft).Select(c => c.Code).Should().BeEquivalentTo("M2-F", "M3-F");
        var listed = drafted.Single(c => c.Code == "M2-F");
        listed.LearnersInProgress.Should().Be(1);
        listed.EditorRevision.Should().Be(communicationRevision);

        var result = await research.ApplyCompanyVersionsAsync(new ResearchApplyManyInput(
            [new ResearchApplyCourse(communication.CourseId, communicationRevision), new ResearchApplyCourse(content.CourseId, contentRevision)],
            GraceDays: 14), reader, Sanitizer);
        context.ChangeTracker.Clear();
        result.Applied.Should().Equal("M2-F", "M3-F");
        (await research.ListAsync()).Where(c => c.HasContentDraft).Should().BeEmpty();

        // One notification for employee@, one line per course: what changed and what it means for them.
        var notice = await context.Notifications.AsNoTracking()
            .Where(n => n.RecipientUserId == employeeUser.Id && n.Type == Application.UseCases.Learning.CourseUpdates.CourseRelearn.UpdatedNotificationType)
            .SingleAsync();
        notice.Title.Should().Be("Cập nhật nhỏ 2 khóa học");
        notice.Message.Should().StartWith("Công ty vừa cập nhật nhỏ 2 khóa học (Giao tiếp số cơ bản nơi công sở, Tạo lập nội dung số cơ bản), áp dụng từ ngày ")
            .And.Contain("Ai đang học dở hãy học xong trước ngày")
            .And.NotContain("Bạn đang học dở", "thông báo chung, không nói riêng từng người");
        (await context.Enrollments.AsNoTracking().SingleAsync(e => e.Id == learning.Id)).Status.Should().Be(Statuses.Enrollment.InProgress);
    }

    [Fact]
    public async Task A_course_that_is_not_ready_stops_the_whole_apply_and_says_which()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var context = world.Context;
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var organizationId = owner.OrganizationId!.Value;
        var reader = Reader(context);
        var research = new EnterpriseResearch(context, Caller(owner, organizationId), new PulseCatalogReader(context), world.Clock);
        var bought = await context.PlatformCourses.FirstAsync(course => course.Code == "M1-I");
        context.CourseOrders.Add(new CourseOrder { OrganizationId = organizationId, CourseId = bought.Id, Amount = 100 });
        await context.SaveChangesAsync();
        var list = await research.ListAsync();
        var ready = list.Single(course => course.Code == "M2-F");
        var broken = list.Single(course => course.Code == "M3-F");
        var editor = await research.GetAuthoringAsync(broken.CourseId, reader, Sanitizer);
        editor.Course.Modules[0].Questions.Clear();
        var brokenRevision = (await research.SaveAuthoringAsync(broken.CourseId,
            new ResearchAuthoringInput(editor.Revision, editor.Course.Modules, editor.Course.Final), reader, Sanitizer)).Revision;
        var readyRevision = (await research.GetAuthoringAsync(ready.CourseId, reader, Sanitizer)).Revision;

        var apply = () => research.ApplyCompanyVersionsAsync(new ResearchApplyManyInput(
            [new ResearchApplyCourse(ready.CourseId, readyRevision), new ResearchApplyCourse(broken.CourseId, brokenRevision)]), reader, Sanitizer);
        (await apply.Should().ThrowAsync<BadRequestException>()).Which.Message.Should().Contain("M3-F").And.Contain("Mô đun 1");
        context.ChangeTracker.Clear();
        (await research.ListAsync()).Single(c => c.Code == "M2-F").CourseId.Should().Be(ready.CourseId, "nothing is applied");
    }

    private static PlatformCourseContentReader Reader(IApplicationDbContext context) =>
        new(context, Mock.Of<IPlatformAssetUrlSigner>());

    private static ICurrentUser Caller(User user, Guid organizationId)
    {
        var current = new Mock<ICurrentUser>();
        current.SetupGet(actor => actor.UserId).Returns(user.Id);
        current.Setup(actor => actor.GetRequiredOrganizationId()).Returns(organizationId);
        return current.Object;
    }
}
