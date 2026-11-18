using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Application.UseCases.TrialProgram;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Tests.Pulse;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Trial;

/// <summary>
/// Kiểm tra khảo sát doanh nghiệp, quyền tham gia và phạm vi đánh giá bài cuối khóa.
/// </summary>
public class TrialProgramFlowTests
{
    [Fact]
    public void Suggested_level_comes_from_the_share_of_right_answers_in_the_domain()
    {
        TrialProgramRules.SuggestedLevel(new[] { (1, 1), (1, 1), (1, 1) }).Should().Be(3);
        TrialProgramRules.SuggestedLevel(new[] { (1, 1), (0, 1), (1, 1) }).Should().Be(2);
        TrialProgramRules.SuggestedLevel(new[] { (0, 1), (0, 1), (1, 1) }).Should().Be(0);
        TrialProgramRules.SuggestedLevel(new[] { (2, 2), (2, 3), (0, 0) }).Should().Be(3);
    }

    [Fact]
    public async Task Owner_starts_survey_and_employee_submits_a_proctored_multiple_choice_assessment()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value,
            OwnerUserId = owner.Id,
            StartedAt = world.Clock.Now,
            EndsAt = world.Clock.Now.AddDays(14),
            PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        // Chủ doanh nghiệp đặt hạn làm bài.
        var asOwner = await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner);
        await FluentActions.Awaiting(() => asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput
        {
            TestDeadline = world.Clock.Now.AddMinutes(10),
        })).Should().ThrowAsync<BadRequestException>();
        var request = await asOwner.Request.ExecuteAsync(new SubmitTrialRequestUseCaseInput
        {
            TestDeadline = world.Clock.Now.AddDays(2),
        });
        // Starting the survey gives the organization a mentor right away (the only mentor of the test world).
        request.Stage.Should().Be(TrialProgramRules.StageAssigned);
        var mentorUser = await world.UserAsync("mentor@digitalent.ai");
        (await world.Context.TrialWorkspaces.AsNoTracking().SingleAsync()).MentorUserId.Should().Be(mentorUser.Id);
        (await world.Context.Notifications.CountAsync(n => n.RecipientUserId == mentorUser.Id && n.Type == TrialProgramRules.NotificationMentorAssigned))
            .Should().Be(1);
        var platform = await world.UserAsync("platform@digitalent.ai");
        (await world.Context.Notifications.CountAsync(n => n.RecipientUserId == platform.Id && n.Type == TrialProgramRules.NotificationRequested))
            .Should().Be(1);
        world.Context.ChangeTracker.Clear();

        // 2. Trước khi công bố, nhân viên chưa có lộ trình học.
        var employeeUc = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        (await employeeUc.Overview.ExecuteAsync(new GetPulseOverviewUseCaseInput())).Courses.Should().BeEmpty();

        // 3. Nhân viên làm bài tổng hợp ba cấp trong phòng thi có giám sát.
        var asEmployee = await TrialAsAsync(world, PulseTestWorld.EmployeeEmail, Roles.Employee);
        var mine = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        mine.CanStart.Should().BeTrue();
        mine.Domains.Should().HaveCount(6);
        var session = await asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput());
        session.Kind.Should().Be(Statuses.ProctoringKind.TrialAssessment);
        // Năm câu cho mỗi ô lĩnh vực × cấp có câu ôn tập (dữ liệu Development đầy đủ: 90 câu), xếp Cơ bản → Nâng cao.
        session.Questions.Should().NotBeEmpty().And.HaveCountLessThanOrEqualTo(90);
        session.Questions.Select(q => q.Tier).Should().BeInAscendingOrder();
        session.Questions.Select(q => q.Tier).Distinct().Should().BeEquivalentTo(new[] { 1, 2, 3 });
        world.Context.ChangeTracker.Clear();
        (await world.Context.ProctoringSessions.AsNoTracking().SingleAsync(s => s.Id == session.SessionId)).CourseId.Should().BeNull();

        var submission = new SubmitMyTrialAssessmentUseCaseInput
        {
            ProctoringSessionId = session.SessionId,
        };
        // Chưa có bản ghi màn hình và camera → không nộp được.
        submission.Answers = await AnswersAsync(world, session.Questions, correctTiers: 3);
        await FluentActions.Awaiting(() => asEmployee.Submit.ExecuteAsync(submission)).Should().ThrowAsync<BadRequestException>();
        world.Context.ChangeTracker.Clear();
        await RecordAsync(world, employeeUc, session.SessionId);

        // Đúng hết Cơ bản và Trung cấp, sai hết Nâng cao → mức gợi ý 2 ở mọi lĩnh vực.
        submission.Answers = await AnswersAsync(world, session.Questions, correctTiers: 2);
        var submitted = await asEmployee.Submit.ExecuteAsync(submission);
        world.Context.ChangeTracker.Clear();
        var domains = await world.Context.TrialAssessmentDomains.AsNoTracking().Where(d => d.TrialAssessmentId == submitted.AssessmentId).ToListAsync();
        domains.Should().HaveCount(6).And.OnlyContain(d => d.MentorLevel == null && d.AdvancedCorrect == 0 && d.BasicCorrect == d.BasicTotal);
        domains.Where(d => d.BasicTotal > 0 && d.IntermediateTotal > 0).Should().NotBeEmpty().And.OnlyContain(d => d.SuggestedLevel == 2);
        domains.Where(d => d.BasicTotal == 0).ToList().ForEach(d => d.SuggestedLevel.Should().Be(0));
        (await world.Context.ExamChoiceAnswers.CountAsync(a => a.TrialAssessmentId == submitted.AssessmentId)).Should().Be(session.Questions.Count);
        await FluentActions.Awaiting(() => asEmployee.Start.ExecuteAsync(new StartMyTrialAssessmentUseCaseInput()))
            .Should().ThrowAsync<BadRequestException>();

        var program = await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput());
        program.Report!.Assessed.Should().Be(1);
        var result = await asEmployee.Mine.ExecuteAsync(new GetMyTrialAssessmentUseCaseInput());
        result.Status.Should().Be(TrialProgramRules.ParticipantReviewed);
        result.Essays.Should().BeEmpty();
        result.Levels.Should().BeEquivalentTo(domains.Select(d => (int)d.SuggestedLevel));
    }

    [Fact]
    public async Task Owner_can_join_the_test_once_as_a_participant()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var ownerRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Owner);
        var organization = new DigiTalent.Domain.Entities.Organization { Code = "TRIAL-JOIN", Name = "Sao Mai" };
        var owner = new User { Email = "chu@saomai.test", DisplayName = "Chủ Sao Mai", PasswordHash = "x", OrganizationId = organization.Id };
        owner.UserRoles.Add(new UserRole { RoleId = ownerRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Organizations.Add(organization);
        world.Context.Users.Add(owner);
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = organization.Id, OwnerUserId = owner.Id, StartedAt = world.Clock.Now, EndsAt = world.Clock.Now.AddDays(14), PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var asOwner = await TrialAsAsync(world, "chu@saomai.test", Roles.Owner);
        (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Participants.Should().BeEmpty();
        await FluentActions.Awaiting(() => asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "", Position = "Giám đốc" }))
            .Should().ThrowAsync<BadRequestException>();
        var joined = await asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "Ban giám đốc", Position = "Giám đốc" });
        world.Context.ChangeTracker.Clear();

        var roles = await world.Context.UserRoles.Where(r => r.UserId == owner.Id).Select(r => r.Role.Code).ToListAsync();
        roles.Should().BeEquivalentTo(new[] { Roles.Owner, Roles.Employee });
        var me = (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Participants.Should().ContainSingle().Subject;
        me.IsOwner.Should().BeTrue();
        me.DepartmentName.Should().Be("Ban giám đốc");
        me.Status.Should().Be(TrialProgramRules.ParticipantActive);
        var repeated = await asOwner.Join.ExecuteAsync(new JoinTrialAsParticipantUseCaseInput { Department = "Ban giám đốc", Position = "Giám đốc" });
        repeated.EmployeeId.Should().Be(joined.EmployeeId);
        (await asOwner.Program.ExecuteAsync(new GetTrialProgramUseCaseInput())).Participants.Should().ContainSingle();
    }

    [Fact]
    public async Task In_a_trial_organization_only_the_assigned_mentor_reviews_course_work()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentor = await world.UserAsync("mentor@digitalent.ai");
        var employee = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);

        // Doanh nghiệp thường: chủ doanh nghiệp, quản lý và mentor đều thấy nhân viên để chấm.
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().Contain(mentor.Id);

        // Dùng thử, chưa phân công: không ai chấm, không ai nhận thông báo.
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value, OwnerUserId = owner.Id, StartedAt = world.Clock.Now, EndsAt = world.Clock.Now.AddDays(14), PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await (await TrialAsAsync(world, PulseTestWorld.ManagerEmail, Roles.Manager)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().BeEmpty();

        // Phân công mentor: chỉ mentor đó chấm và nhận thông báo bài nộp; mentor khác không thấy.
        var mentorRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Mentor);
        var otherMentor = new User { Email = "mentor2@digitalent.ai", DisplayName = "Mentor 2", PasswordHash = "x" };
        otherMentor.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.Add(otherMentor);

        var trial = await world.Context.TrialWorkspaces.SingleAsync();
        trial.MentorUserId = mentor.Id;
        trial.MentorAssignedAt = world.Clock.Now;
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employee.Id))
            .Should().BeTrue();
        (await (await TrialAsAsync(world, "mentor2@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await (await TrialAsAsync(world, PulseTestWorld.OwnerEmail, Roles.Owner)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();
        (await PulseReviewers.UserIdsAsync(world.Context, employee)).Should().Equal(mentor.Id);
    }

    [Fact]
    public async Task After_the_report_a_mentor_can_be_assigned_and_keeps_the_waiting_course_finals()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentor = await world.UserAsync("mentor@digitalent.ai");
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var employeeProfile = await world.EmployeeAsync(PulseTestWorld.EmployeeEmail);
        var m1f = await world.OpenForLearningAsync(employee, "M1-F");
        await world.PassAllModulesAsync(employee, m1f.CourseId);
        await world.SubmitFinalAsync(employee, m1f.CourseId);

        // The report was published automatically (multiple choice scored by the system) and nobody was assigned.
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value, OwnerUserId = owner.Id, PolicyJson = "{}",
            StartedAt = world.Clock.Now.AddDays(-3), EndsAt = world.Clock.Now.AddDays(11),
            RequestedAt = world.Clock.Now.AddDays(-2), ReportPublishedAt = world.Clock.Now.AddDays(-1),
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var platform = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.PlatformAdmin);
        var row = (await platform.PlatformTrials.ExecuteAsync(new GetPlatformTrialsUseCaseInput())).Items.Single();
        row.Stage.Should().Be(TrialProgramRules.StageReported);
        row.MentorUserId.Should().BeNull();
        row.WaitingFinals.Should().Be(1);
        row.Converted.Should().BeFalse();
        row.Learners.Should().Be(await world.Context.Enrollments
            .Where(e => world.Context.Employees.Any(x => x.Id == e.EmployeeId && x.OrganizationId == owner.OrganizationId))
            .Select(e => e.EmployeeId).Distinct().CountAsync()).And.BeGreaterThan(0);
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync()).Should().BeFalse();

        await platform.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = mentor.Id });
        world.Context.ChangeTracker.Clear();

        var assigned = (await new GetMentorsUseCase(world.Context, world.Clock).ExecuteAsync(new GetMentorsUseCaseInput())).Items.Single(m => m.UserId == mentor.Id);
        assigned.ActiveTrials.Should().Be(1);
        assigned.WaitingFinals.Should().Be(1);
        (await (await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor)).ReviewScope.ReviewableEmployees().AnyAsync(e => e.Id == employeeProfile.Id))
            .Should().BeTrue();

        // A mentor set after the report stays; a converted organization needs no mentor.
        var again = () => platform.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = mentor.Id });
        (await again.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("TRIAL_REPORTED");
        var trial = await world.Context.TrialWorkspaces.SingleAsync();
        trial.ConvertedAt = world.Clock.Now;
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        (await new GetMentorsUseCase(world.Context, world.Clock).ExecuteAsync(new GetMentorsUseCaseInput())).Items.Single(m => m.UserId == mentor.Id)
            .ActiveTrials.Should().Be(0);
        (await again.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("TRIAL_CONVERTED");
    }

    [Fact]
    public async Task Mentors_are_assigned_automatically_to_the_least_busy_one_and_the_rest_with_one_click()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var busy = await world.UserAsync("mentor@digitalent.ai");
        var mentorRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Mentor);
        var free = new User { Email = "mentor2@digitalent.ai", DisplayName = "Mentor Rảnh", PasswordHash = "x" };
        free.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        var locked = new User { Email = "mentor3@digitalent.ai", DisplayName = "Mentor Khóa", PasswordHash = "x", Status = Statuses.User.Locked };
        locked.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.AddRange(free, locked);

        // mentor@ already has two trial organizations; three more asked for a survey and have no mentor yet.
        TrialWorkspace Trial(string code, Guid? mentor, int requestedDaysAgo)
        {
            var org = new DigiTalent.Domain.Entities.Organization { Code = code, Name = $"Dùng thử {code}", Status = Statuses.Organization.Active };
            world.Context.Organizations.Add(org);
            var trial = new TrialWorkspace
            {
                OrganizationId = org.Id, OwnerUserId = owner.Id, PolicyJson = "{}", MentorUserId = mentor,
                MentorAssignedAt = mentor == null ? null : world.Clock.Now.AddDays(-5),
                StartedAt = world.Clock.Now.AddDays(-6), EndsAt = world.Clock.Now.AddDays(30), RequestedAt = world.Clock.Now.AddDays(-requestedDaysAgo),
            };
            world.Context.TrialWorkspaces.Add(trial);
            return trial;
        }
        Trial("TRIAL-B1", busy.Id, 5);
        Trial("TRIAL-B2", busy.Id, 5);
        var first = Trial("TRIAL-W1", null, 3);
        var second = Trial("TRIAL-W2", null, 2);
        var third = Trial("TRIAL-W3", null, 1);
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var platform = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.PlatformAdmin);
        var result = await platform.AutoAssign.ExecuteAsync(new AutoAssignTrialMentorsUseCaseInput());

        // Oldest request first: the free mentor takes it, then loads are 2 vs 1, then 2 vs 2 → the one assigned longest ago.
        result.Remaining.Should().Be(0);
        result.Assigned.Select(a => (a.OrganizationId, a.MentorUserId)).Should().Equal(
            (first.OrganizationId, free.Id), (second.OrganizationId, free.Id), (third.OrganizationId, busy.Id));
        result.Assigned.Should().NotContain(a => a.MentorUserId == locked.Id);
        (await world.Context.TrialWorkspaces.CountAsync(t => t.MentorUserId == null && t.RequestedAt != null)).Should().Be(0);

        // Nothing left to do on a second click.
        (await platform.AutoAssign.ExecuteAsync(new AutoAssignTrialMentorsUseCaseInput())).Assigned.Should().BeEmpty();
    }

    [Fact]
    public async Task An_expired_login_lockout_does_not_keep_a_mentor_out_of_assignments()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentorRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Mentor);
        // Five wrong passwords locked it for 15 minutes yesterday; nobody signed in since, so the status still says LOCKED.
        var expired = new User
        {
            Email = "mentor-expired@digitalent.ai", DisplayName = "Mentor Hết Khóa", PasswordHash = "x",
            Status = Statuses.User.Locked, LockedUntil = world.Clock.Now.AddDays(-1),
        };
        expired.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        // Locked by an admin (no end): stays out.
        var manual = new User { Email = "mentor-locked@digitalent.ai", DisplayName = "Mentor Bị Khóa", PasswordHash = "x", Status = Statuses.User.Locked };
        manual.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.AddRange(expired, manual);
        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value, OwnerUserId = owner.Id, PolicyJson = "{}",
            StartedAt = world.Clock.Now.AddDays(-2), EndsAt = world.Clock.Now.AddDays(30), RequestedAt = world.Clock.Now.AddDays(-1),
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var mentors = (await new GetMentorsUseCase(world.Context, world.Clock).ExecuteAsync(new GetMentorsUseCaseInput())).Items;
        mentors.Single(m => m.UserId == expired.Id).Status.Should().Be(Statuses.User.Active);
        mentors.Single(m => m.UserId == manual.Id).Status.Should().Be(Statuses.User.Locked);

        var platform = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.PlatformAdmin);
        var toManual = () => platform.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = manual.Id });
        (await toManual.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("MENTOR_INVALID");
        await platform.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = expired.Id });
        (await world.Context.TrialWorkspaces.AsNoTracking().SingleAsync()).MentorUserId.Should().Be(expired.Id);
    }

    [Fact]
    public async Task A_mentor_takes_at_most_five_trial_organizations()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentor = await world.UserAsync("mentor@digitalent.ai");

        // Five other trial organizations already with mentor@ (one converted, which no longer counts).
        for (var i = 1; i <= 6; i++)
        {
            var org = new DigiTalent.Domain.Entities.Organization { Code = $"TRIAL-L{i}", Name = $"Dùng thử {i}", Status = Statuses.Organization.Active };
            world.Context.Organizations.Add(org);
            world.Context.TrialWorkspaces.Add(new TrialWorkspace
            {
                OrganizationId = org.Id, OwnerUserId = owner.Id, PolicyJson = "{}", MentorUserId = mentor.Id,
                StartedAt = world.Clock.Now.AddDays(-3), EndsAt = world.Clock.Now.AddDays(11), RequestedAt = world.Clock.Now.AddDays(-2),
                ConvertedAt = i == 6 ? world.Clock.Now : null,
            });
        }

        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value, OwnerUserId = owner.Id, PolicyJson = "{}",
            StartedAt = world.Clock.Now.AddDays(-3), EndsAt = world.Clock.Now.AddDays(11), RequestedAt = world.Clock.Now.AddDays(-2),
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var platform = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.PlatformAdmin);
        var assign = () => platform.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput { OrganizationId = owner.OrganizationId!.Value, MentorUserId = mentor.Id });
        (await assign.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("MENTOR_FULL");

        // Freeing one organization makes room again.
        var one = await world.Context.TrialWorkspaces.FirstAsync(t => t.MentorUserId == mentor.Id && t.ConvertedAt == null);
        one.ConvertedAt = world.Clock.Now;
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();
        await assign.Should().NotThrowAsync();
    }

    [Fact]
    public async Task Mentor_sees_and_grades_regular_org_assignments_across_domains_and_levels()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var mentor = await world.AsAsync("mentor@digitalent.ai", Roles.Mentor);
        var mentorUser = await world.UserAsync("mentor@digitalent.ai");
        var baselineHistory = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { IncludeReviewed = true });

        // Nhân viên nộp bài cuối cấp M1-F (Cơ bản), bài cuối cấp M3-F (Cơ bản, miền khác), và làm bài kiểm tra đầu vào M5-F.
        var m1f = await world.OpenForLearningAsync(employee, "M1-F");
        await world.PassAllModulesAsync(employee, m1f.CourseId);
        var finalM1f = await world.SubmitFinalAsync(employee, m1f.CourseId);

        var m3f = await world.OpenForLearningAsync(employee, "M3-F");
        await world.PassAllModulesAsync(employee, m3f.CourseId);
        var finalM3f = await world.SubmitFinalAsync(employee, m3f.CourseId);

        await world.OpenForLearningAsync(employee, "M5-F");

        var opsManager = await world.AsAsync(PulseTestWorld.ManagerEmail, Roles.Manager);
        var managerQueue = await opsManager.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        managerQueue.Items.Should().NotContain(
            i => i.Kind == Statuses.ProctoringKind.PreAssessment,
            "bài kiểm tra đầu vào trắc nghiệm tự chấm, không vào hàng chờ của người chấm");

        (await world.Context.Notifications.AnyAsync(n =>
            n.RecipientUserId == mentorUser.Id && n.Type == SubmitPulseFinalUseCase.NotificationType))
            .Should().BeTrue("mentor nhận thông báo khi nhân viên doanh nghiệp chính thức nộp bài cuối cấp");

        var activeQueue = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        activeQueue.PendingCount.Should().Be(2);
        activeQueue.PreAssessmentCount.Should().Be(0);
        activeQueue.ReviewedCount.Should().Be(0);
        activeQueue.Items.Where(i => i.Kind == Statuses.ProctoringKind.Final).Select(i => i.CourseCode).Should().BeEquivalentTo(new[] { "M1-F", "M3-F" });
        activeQueue.Items.Should().OnlyContain(i =>
            i.OrganizationId != Guid.Empty
            && !string.IsNullOrEmpty(i.DomainName)
            && i.Tier == 1);

        var withHistory = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { IncludeReviewed = true });
        withHistory.ReviewedCount.Should().Be(baselineHistory.ReviewedCount, "bài kiểm tra đầu vào không có kết luận của người chấm");
        withHistory.PendingCount.Should().Be(2);
        withHistory.PreAssessmentCount.Should().Be(0);

        // Mentor chấm đạt M1-F (cuối cấp -> mở khóa M1-I) và đạt M3-F.
        await mentor.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = finalM1f.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Đạt đầy đủ ba tiêu chí theo chuẩn.",
        });
        await mentor.Decide.ExecuteAsync(new DecidePulseFinalUseCaseInput
        {
            SubmissionId = finalM3f.SubmissionId,
            Decision = Statuses.FinalSubmissionDecision.Passed,
            Reason = "Bài thực hành cuối cấp đạt yêu cầu.",
        });
        world.Context.ChangeTracker.Clear();

        // M1-I đã được cấp suất trong dữ liệu demo.
        var m1i = await world.OpenForLearningAsync(employee, "M1-I");
        await world.PassAllModulesAsync(employee, m1i.CourseId);
        var finalM1i = await world.SubmitFinalAsync(employee, m1i.CourseId);

        var afterUpgrade = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput());
        var itemM1i = afterUpgrade.Items.Should().ContainSingle(i => i.SubmissionId == finalM1i.SubmissionId).Subject;
        itemM1i.CourseCode.Should().Be("M1-I");
        itemM1i.Tier.Should().Be(2);
        itemM1i.Kind.Should().Be(Statuses.ProctoringKind.Final);

        var fullHistory = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { IncludeReviewed = true });
        fullHistory.PendingCount.Should().Be(1);
        fullHistory.PreAssessmentCount.Should().Be(0);
        fullHistory.ReviewedCount.Should().Be(baselineHistory.ReviewedCount + 2, "mentor đã chấm đạt M1-F và M3-F");
        fullHistory.Items.Should().Contain(i => i.SubmissionId == finalM1f.SubmissionId && i.Status == PulseFinalStatus.Approved);
        fullHistory.Items.Should().Contain(i => i.SubmissionId == finalM3f.SubmissionId && i.Status == PulseFinalStatus.Approved);
    }

    [Fact]
    public async Task Mentor_enterprises_endpoint_lists_scoped_enterprises_and_filters_final_reviews_by_organization()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var employee = await world.AsAsync(PulseTestWorld.EmployeeEmail);
        var mentor = await world.AsAsync("mentor@digitalent.ai", Roles.Mentor);
        var mentorUser = await world.UserAsync("mentor@digitalent.ai");
        var ownerUser = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var officialOrg = await world.Context.Organizations.AsNoTracking().SingleAsync(o => o.Id == ownerUser.OrganizationId!.Value);

        // Tạo 2 doanh nghiệp dùng thử khác: một doanh nghiệp giao cho mentor@, một doanh nghiệp giao cho mentor2@ (ngoài phạm vi).
        var mentorRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Mentor);
        var otherMentor = new User { Email = "mentor2@digitalent.ai", DisplayName = "Mentor 2", PasswordHash = "x" };
        otherMentor.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.Add(otherMentor);

        var assignedTrialOrg = new DigiTalent.Domain.Entities.Organization { Code = "TRIAL-A", Name = "Công ty Dùng thử A", Status = Statuses.Organization.Active };
        var foreignTrialOrg = new DigiTalent.Domain.Entities.Organization { Code = "TRIAL-B", Name = "Công ty Dùng thử B", Status = Statuses.Organization.Active };
        world.Context.Organizations.AddRange(assignedTrialOrg, foreignTrialOrg);

        var assignedOwner = new User
        {
            Email = "owner-trial-a@digitalent.ai",
            DisplayName = "Chủ DN A",
            PasswordHash = "x",
            OrganizationId = assignedTrialOrg.Id,
        };
        var ownerRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Owner);
        assignedOwner.UserRoles.Add(new UserRole { RoleId = ownerRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.Add(assignedOwner);

        world.Context.TrialWorkspaces.AddRange(
            new TrialWorkspace
            {
                OrganizationId = assignedTrialOrg.Id,
                OwnerUserId = assignedOwner.Id,
                MentorUserId = mentorUser.Id,
                MentorAssignedAt = world.Clock.Now.AddDays(-1),
                StartedAt = world.Clock.Now.AddDays(-2),
                EndsAt = world.Clock.Now.AddDays(12),
                PolicyJson = "{}",
            },
            new TrialWorkspace
            {
                OrganizationId = foreignTrialOrg.Id,
                OwnerUserId = assignedOwner.Id,
                MentorUserId = otherMentor.Id,
                MentorAssignedAt = world.Clock.Now.AddDays(-1),
                StartedAt = world.Clock.Now.AddDays(-2),
                EndsAt = world.Clock.Now.AddDays(12),
                PolicyJson = "{}",
            });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        // Nhân viên thuộc doanh nghiệp chính thức nộp 1 bài cuối cấp M1-F.
        var m1f = await world.OpenForLearningAsync(employee, "M1-F");
        await world.PassAllModulesAsync(employee, m1f.CourseId);
        var submitted = await world.SubmitFinalAsync(employee, m1f.CourseId);

        var mentorTrialUc = await TrialAsAsync(world, "mentor@digitalent.ai", Roles.Mentor);
        var enterprisesUc = new GetMentorEnterprisesUseCase(world.Context, mentorTrialUc.ReviewScope, world.Clock);
        var result = await enterprisesUc.ExecuteAsync(new GetMentorEnterprisesUseCaseInput());

        result.TotalEnterprises.Should().Be(2);
        result.PendingCount.Should().Be(1);
        result.ReviewedCount.Should().Be(0);
        result.Items.Select(i => i.OrganizationId).Should().BeEquivalentTo(new[] { officialOrg.Id, assignedTrialOrg.Id });
        result.Items.Should().NotContain(i => i.OrganizationId == foreignTrialOrg.Id);

        var officialItem = result.Items.Single(i => i.OrganizationId == officialOrg.Id);
        officialItem.Stage.Should().Be("OFFICIAL");
        officialItem.PendingCount.Should().Be(1);
        officialItem.TotalSubmissions.Should().Be(1);
        officialItem.EmployeeCount.Should().BeGreaterThan(0);
        officialItem.DepartmentCount.Should().BeGreaterThan(0);
        officialItem.OwnerEmail.Should().Be(PulseTestWorld.OwnerEmail);
        officialItem.LatestSubmittedAt.Should().NotBeNull();

        var assignedTrialItem = result.Items.Single(i => i.OrganizationId == assignedTrialOrg.Id);
        assignedTrialItem.Stage.Should().Be("TRIAL");
        assignedTrialItem.PendingCount.Should().Be(0);
        assignedTrialItem.TotalSubmissions.Should().Be(0);
        assignedTrialItem.OwnerEmail.Should().Be("owner-trial-a@digitalent.ai");

        // Lọc GET /pulse/final-reviews?organizationId=... trả đúng bài theo từng doanh nghiệp.
        var officialQueue = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { OrganizationId = officialOrg.Id });
        officialQueue.Items.Should().ContainSingle(i => i.SubmissionId == submitted.SubmissionId && i.OrganizationId == officialOrg.Id);

        var emptyTrialQueue = await mentor.Reviews.ExecuteAsync(new GetPulseFinalReviewsUseCaseInput { OrganizationId = assignedTrialOrg.Id });
        emptyTrialQueue.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task Platform_can_assign_unassigned_reported_trial_but_cannot_reassign_already_assigned_reported_trial()
    {
        using var world = await PulseTestWorld.CreateAsync();
        var owner = await world.UserAsync(PulseTestWorld.OwnerEmail);
        var mentor = await world.UserAsync("mentor@digitalent.ai");
        var mentorRole = await world.Context.Roles.SingleAsync(r => r.Code == Roles.Mentor);
        var otherMentor = new User { Email = "mentor2@digitalent.ai", DisplayName = "Mentor 2", PasswordHash = "x" };
        otherMentor.UserRoles.Add(new UserRole { RoleId = mentorRole.Id, AssignedAt = world.Clock.Now });
        world.Context.Users.Add(otherMentor);

        world.Context.TrialWorkspaces.Add(new TrialWorkspace
        {
            OrganizationId = owner.OrganizationId!.Value,
            OwnerUserId = owner.Id,
            StartedAt = world.Clock.Now.AddDays(-3),
            EndsAt = world.Clock.Now.AddDays(57),
            RequestedAt = world.Clock.Now.AddDays(-2),
            ReportPublishedAt = world.Clock.Now.AddDays(-1),
            PolicyJson = "{}",
        });
        await world.Context.SaveChangesAsync();
        world.Context.ChangeTracker.Clear();

        var asAdmin = await TrialAsAsync(world, "platform@digitalent.ai", Roles.PlatformAdmin);
        var assigned = await asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput
        {
            OrganizationId = owner.OrganizationId!.Value,
            MentorUserId = mentor.Id,
        });
        assigned.MentorUserId.Should().Be(mentor.Id);
        world.Context.ChangeTracker.Clear();

        await FluentActions.Awaiting(() => asAdmin.Assign.ExecuteAsync(new AssignTrialMentorUseCaseInput
            {
                OrganizationId = owner.OrganizationId!.Value,
                MentorUserId = otherMentor.Id,
            }))
            .Should().ThrowAsync<BadRequestException>()
            .Where(e => e.Errors.Any(err => err.Code == "TRIAL_REPORTED"));
    }

    private static async Task<List<PulseAnswerInput>> AnswersAsync(PulseTestWorld world, IReadOnlyList<TrialExamQuestionDto> questions, int correctTiers)
    {
        var answers = new List<PulseAnswerInput>();
        foreach (var question in questions)
        {
            var hasDbOption = await world.Context.QuestionOptions.AsNoTracking().AnyAsync(o => o.QuestionId == question.QuestionId);
            Guid optionId;
            if (hasDbOption)
            {
                optionId = question.Tier <= correctTiers
                    ? await world.CorrectOptionAsync(question.QuestionId)
                    : await world.WrongOptionAsync(question.QuestionId);
            }
            else
            {
                optionId = question.Tier <= correctTiers
                    ? question.Options.First().OptionId
                    : question.Options.Last().OptionId;
            }
            answers.Add(new PulseAnswerInput
            {
                QuestionId = question.QuestionId,
                OptionId = optionId,
            });
        }

        return answers;
    }

    /// <summary>Một mẩu ghi toàn bộ màn hình và một mẩu camera cho phiên.</summary>
    private static async Task RecordAsync(PulseTestWorld world, PulseTestWorld.UseCases uc, Guid sessionId)
    {
        foreach (var track in Statuses.ProctoringTrack.All)
        {
            var recording = await uc.StartRecording.ExecuteAsync(new StartPulseRecordingUseCaseInput
            {
                SessionId = sessionId,
                Track = track,
                StartOffsetMs = 0,
                ContentType = "video/webm;codecs=vp8,opus",
                DisplaySurface = track == Statuses.ProctoringTrack.Screen ? "monitor" : null,
            });
            world.Context.ChangeTracker.Clear();
            await uc.AppendChunk.ExecuteAsync(new AppendPulseRecordingChunkUseCaseInput
            {
                SessionId = sessionId,
                RecordingId = recording.RecordingId,
                Seq = 0,
                Content = new MemoryStream(new byte[] { 0x1A, 0x45, 0xDF, 0xA3, 0x01 }),
            });
            world.Context.ChangeTracker.Clear();
        }

        world.Clock.Advance(TimeSpan.FromMinutes(30));
    }

    private sealed record TrialUseCases(
        GetTrialProgramUseCase Program,
        SubmitTrialRequestUseCase Request,
        GetMyTrialAssessmentUseCase Mine,
        StartMyTrialAssessmentUseCase Start,
        SubmitMyTrialAssessmentUseCase Submit,
        GetPlatformTrialsUseCase PlatformTrials,
        AssignTrialMentorUseCase Assign,
        GetMentorTrialUseCase MentorTrial,
        ReviewTrialAssessmentUseCase Review,
        ReviewTrialEssaysWithAiUseCase AiReview,
        PublishTrialReportUseCase Publish,
        JoinTrialAsParticipantUseCase Join,
        PulseReviewScope ReviewScope,
        AutoAssignTrialMentorsUseCase AutoAssign);

    private static async Task<TrialUseCases> TrialAsAsync(PulseTestWorld world, string email, string role)
    {
        var context = world.Context;
        var user = await world.UserAsync(email);
        var employee = await context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.UserId == user.Id);
        var current = new Mock<ICurrentUser>();
        if (user.OrganizationId is { } organizationId)
        {
            current.Setup(c => c.GetRequiredOrganizationId()).Returns(organizationId);
        }

        current.Setup(c => c.OrganizationId).Returns(user.OrganizationId);
        current.Setup(c => c.UserId).Returns(user.Id);
        current.Setup(c => c.EmployeeId).Returns(employee?.Id);
        current.Setup(c => c.IsAuthenticated).Returns(true);
        current.Setup(c => c.Roles).Returns(new List<string> { role });
        current.Setup(c => c.IsAdmin).Returns(role == Roles.Owner);

        var me = new MyEmployeeContext(context, current.Object);
        var modules = new PulseModuleReader(context);
        var catalog = new PulseCatalogReader(context);
        var paper = new TrialAssessmentPaper(context, catalog, modules);
        var reader = new TrialProgramReader(context, current.Object, paper, world.Clock);
        var proctoring = new PulseProctoring(context, me, world.Clock);
        var examPaper = new PulseExamPaper(context, new PulseQuizReader(context));
        var ai = new StubGeminiService();
        var signer = new ProctoringRecordingUrlSigner(new JwtSettings { SigningKey = "trial-test-signing-key-0123456789abcdef" }, world.Clock);

        return new TrialUseCases(
            new GetTrialProgramUseCase(context, reader),
            new SubmitTrialRequestUseCase(context, reader),
            new GetMyTrialAssessmentUseCase(context, me, reader, ai, Microsoft.Extensions.Logging.Abstractions.NullLogger<GetMyTrialAssessmentUseCase>.Instance),
            new StartMyTrialAssessmentUseCase(context, me, reader, paper, proctoring),
            new SubmitMyTrialAssessmentUseCase(context, me, reader, paper, proctoring),
            new GetPlatformTrialsUseCase(context),
            new AssignTrialMentorUseCase(context, reader, Mock.Of<IAuditService>()),
            new GetMentorTrialUseCase(context, reader, examPaper, new PulseRecordingReader(context, signer), ai),
            new ReviewTrialAssessmentUseCase(context, reader),
            new ReviewTrialEssaysWithAiUseCase(context, reader, ai),
            new PublishTrialReportUseCase(context, reader),
            new JoinTrialAsParticipantUseCase(context, reader),
            new PulseReviewScope(context, new DigiTalent.Application.Common.Authorization.EmployeeScope(context, current.Object), current.Object),
            new AutoAssignTrialMentorsUseCase(context, reader, Mock.Of<IAuditService>()));
    }
}
