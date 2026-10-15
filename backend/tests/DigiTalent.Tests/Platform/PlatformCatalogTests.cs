using System.Text;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Application.UseCases.Platform.Framework;
using DigiTalent.Domain.Constants;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Content;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Platform Admin v2 (docs/specs/2026-10-15-platform-admin-v2.md): frameworks, catalog versions with an anchor, and
/// the course builder (modules, blocks, review questions, final, media).
/// </summary>
public class PlatformCatalogTests
{
    private static readonly Guid AdminId = Guid.NewGuid();

    private sealed class World : IAsyncDisposable
    {
        public required AppDbContext Context { get; init; }
        public HtmlContentSanitizer Sanitizer { get; } = new();
        public PlatformAssetUrlSigner Signer { get; } = new(new JwtSettings { SigningKey = "test-signing-key-for-platform-assets-0123456789" }, TimeProvider.System);
        public IAuditService Audit { get; } = Mock.Of<IAuditService>();

        public PlatformCatalogEditor Editor => new(Context, Sanitizer, Admin(), TimeProvider.System);
        public PlatformCourseContentReader Reader => new(Context, Signer);
        public PlatformPublishChecker Checker => new(Context, Sanitizer);

        public Task<PlatformCatalogVersionDetail> CreateDraftAsync() =>
            new CreatePlatformCatalogDraftUseCase(Context, Editor, Audit).ExecuteAsync(new CreatePlatformCatalogDraftUseCaseInput());

        public Task<PlatformCatalogCourseDetail> CourseAsync(int versionNo, Guid courseId) =>
            new GetPlatformCatalogCourseUseCase(Reader).ExecuteAsync(new GetPlatformCatalogCourseUseCaseInput { VersionNo = versionNo, CourseId = courseId });

        public Task<PlatformPublishCheck> CheckAsync(int versionNo) =>
            new GetPlatformCatalogPublishCheckUseCase(Editor, Checker).ExecuteAsync(new GetPlatformCatalogPublishCheckUseCaseInput { VersionNo = versionNo });

        public Task<PlatformCatalogVersionDetail> PublishAsync(int versionNo, string? note = null) =>
            new PublishPlatformCatalogVersionUseCase(Context, Editor, Checker, Audit)
                .ExecuteAsync(new PublishPlatformCatalogVersionUseCaseInput { VersionNo = versionNo, ReleaseNote = note });

        public async Task<Guid> CourseIdAsync(string code) => (await Context.PlatformCourses.AsNoTracking().SingleAsync(c => c.Code == code)).Id;

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private static async Task<World> CreateWorldAsync()
    {
        var context = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await PlatformCatalogSeeder.SeedAsync(context);
        context.ChangeTracker.Clear();
        return new World { Context = context };
    }

    private static ICurrentUser Admin()
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.UserId).Returns(AdminId);
        return currentUser.Object;
    }

    [Fact]
    public async Task Seeder_PublishesTheTt02Framework_AndVersionOneWithContentForEveryCourse()
    {
        await using var world = await CreateWorldAsync();
        await PlatformCatalogSeeder.SeedAsync(world.Context); // a second run adds nothing
        var db = world.Context;

        var framework = await db.PlatformFrameworks.SingleAsync();
        framework.Code.Should().Be(PlatformCatalog.Tt02FrameworkCode);
        framework.Status.Should().Be(Statuses.PlatformFramework.Published);
        (await db.PlatformFrameworkDomains.CountAsync(d => d.FrameworkId == framework.Id)).Should().Be(6);

        var version = await db.PlatformCatalogVersions.SingleAsync();
        version.VersionNo.Should().Be(1);
        version.Status.Should().Be(Statuses.PlatformCatalogVersion.Current);
        (await db.PlatformCatalogCourses.CountAsync(c => c.VersionId == version.Id)).Should().Be(18);

        var a1f = await world.CourseAsync(1, await world.CourseIdAsync("A1-F"));
        a1f.Editable.Should().BeFalse("phiên bản đã công bố chỉ để xem");
        a1f.Modules.Should().HaveCount(Tt02Catalog.Domains[0].Competencies.Length);
        a1f.Modules.Should().OnlyContain(m => m.Blocks.Count == 3 && m.Blocks.All(b => b.Type == PlatformCatalog.BlockType.Text && !string.IsNullOrEmpty(b.BodyHtml)));
        a1f.Modules.Should().OnlyContain(m => m.Questions.Count == 6 && m.Questions.All(q => q.Options.Count(o => o.IsCorrect) == 1 && q.BlockId != null));
        a1f.Final.PromptHtml.Should().NotBeNullOrWhiteSpace();
        a1f.Final.Criteria.Should().Equal(PlatformCatalog.DefaultFinalCriteria);
        (await db.PlatformCourseModules.CountAsync()).Should().Be(Tt02Catalog.Domains.Sum(d => d.Competencies.Length * 3));
    }

    [Fact]
    public async Task Draft_IsADeepCopyOfTheVersionInUse_AndOnlyTheDraftCanBeEdited()
    {
        await using var world = await CreateWorldAsync();
        var draft = await world.CreateDraftAsync();
        world.Context.ChangeTracker.Clear();

        draft.Version.VersionNo.Should().Be(2);
        draft.Version.Status.Should().Be(Statuses.PlatformCatalogVersion.Draft);
        draft.Version.BasedOnVersionNo.Should().Be(1);
        draft.Editable.Should().BeTrue();
        draft.Courses.Should().HaveCount(18).And.OnlyContain(c => c.ChangeKind == PlatformCatalog.ChangeKind.Unchanged);

        var courseId = await world.CourseIdAsync("M6-I");
        var inUse = await world.CourseAsync(1, courseId);
        var copy = await world.CourseAsync(2, courseId);
        copy.Modules.Select(m => m.Title).Should().Equal(inUse.Modules.Select(m => m.Title));
        copy.Modules.Select(m => m.ModuleId).Should().NotIntersectWith(inUse.Modules.Select(m => m.ModuleId), "bản nháp có bản sao riêng");
        copy.Modules[0].Questions[0].BlockId.Should().Be(copy.Modules[0].Blocks[0].BlockId, "câu hỏi gắn với khối trong bản sao");

        var again = () => world.CreateDraftAsync();
        await again.Should().ThrowAsync<ConflictException>();

        var editPublished = () => new UpdatePlatformCourseModuleUseCase(world.Context, world.Editor, world.Reader).ExecuteAsync(
            new UpdatePlatformCourseModuleUseCaseInput { VersionNo = 1, CourseId = courseId, ModuleId = inUse.Modules[0].ModuleId, Title = "Đổi tên" });
        await editPublished.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task Builder_AddsModulesBlocksAndQuestions_SanitizesText_AndMarksTheCourseEdited()
    {
        await using var world = await CreateWorldAsync();
        await world.CreateDraftAsync();
        var courseId = await world.CourseIdAsync("M6-I");
        var context = world.Context;

        var withModule = await new AddPlatformCourseModuleUseCase(context, world.Editor, world.Reader)
            .ExecuteAsync(new AddPlatformCourseModuleUseCaseInput { VersionNo = 2, CourseId = courseId, Title = "Kiểm chứng kết quả AI" });
        withModule.ChangeKind.Should().Be(PlatformCatalog.ChangeKind.Edited);
        var module = withModule.Modules.Last();
        module.Title.Should().Be("Kiểm chứng kết quả AI");
        module.Blocks.Should().BeEmpty();
        module.QuizTitle.Should().Be("Câu hỏi ôn tập · Kiểm chứng kết quả AI");

        var addBlock = new AddPlatformModuleBlockUseCase(context, world.Editor, world.Reader);
        var withText = await addBlock.ExecuteAsync(new AddPlatformModuleBlockUseCaseInput { VersionNo = 2, CourseId = courseId, ModuleId = module.ModuleId, Type = "text" });
        var textBlock = withText.Modules.Last().Blocks.Single();
        var withVideo = await addBlock.ExecuteAsync(new AddPlatformModuleBlockUseCaseInput { VersionNo = 2, CourseId = courseId, ModuleId = module.ModuleId, Type = "VIDEO", Position = 0 });
        withVideo.Modules.Last().Blocks.Select(b => b.Type).Should().Equal(PlatformCatalog.BlockType.Video, PlatformCatalog.BlockType.Text);

        var saved = await new UpdatePlatformModuleBlockUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformModuleBlockUseCaseInput
        {
            VersionNo = 2,
            CourseId = courseId,
            BlockId = textBlock.BlockId,
            BodyHtml = "<h3>Kiểm chứng</h3><p onclick=\"alert(1)\">Đối chiếu <b>nguồn</b><script>alert(1)</script></p><a href=\"javascript:alert(1)\">x</a>",
        });
        var html = saved.Modules.Last().Blocks.Single(b => b.BlockId == textBlock.BlockId).BodyHtml!;
        html.Should().Contain("<h3>Kiểm chứng</h3>").And.Contain("<b>nguồn</b>");
        html.Should().NotContain("script").And.NotContain("onclick").And.NotContain("javascript");

        var addQuestion = new AddPlatformModuleQuestionUseCase(context, world.Editor, world.Reader);
        var withQuestion = await addQuestion.ExecuteAsync(new AddPlatformModuleQuestionUseCaseInput { VersionNo = 2, CourseId = courseId, ModuleId = module.ModuleId });
        var question = withQuestion.Modules.Last().Questions.Single();
        question.Options.Should().HaveCount(3);
        question.Options.Count(o => o.IsCorrect).Should().Be(1);
        question.BlockId.Should().Be(withVideo.Modules.Last().Blocks[0].BlockId, "mặc định gắn với khối đầu tiên");

        var updated = await new UpdatePlatformModuleQuestionUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformModuleQuestionUseCaseInput
        {
            VersionNo = 2,
            CourseId = courseId,
            QuestionId = question.QuestionId,
            Text = "Bản tóm tắt AI có một số liệu không có trong nguồn. Bạn làm gì?",
            BlockId = textBlock.BlockId,
            Options = new()
            {
                new() { Text = "Dùng luôn vì AI thường đúng" },
                new() { Text = "Đối chiếu với nguồn rồi sửa hoặc bỏ", IsCorrect = true },
            },
        });
        var after = updated.Modules.Last().Questions.Single();
        after.Options.Select(o => o.Text).Should().Equal("Dùng luôn vì AI thường đúng", "Đối chiếu với nguồn rồi sửa hoặc bỏ");
        after.Options.Select(o => o.IsCorrect).Should().Equal(false, true);
        after.BlockId.Should().Be(textBlock.BlockId);

        var removed = await new RemovePlatformModuleBlockUseCase(context, world.Editor, world.Reader)
            .ExecuteAsync(new RemovePlatformModuleBlockUseCaseInput { VersionNo = 2, CourseId = courseId, BlockId = textBlock.BlockId });
        removed.Modules.Last().Blocks.Should().ContainSingle();
        removed.Modules.Last().Questions.Single().BlockId.Should().Be(removed.Modules.Last().Blocks[0].BlockId, "câu hỏi chuyển sang khối còn lại");
    }

    [Fact]
    public async Task Publish_IsBlockedUntilTheChangedCoursesAreComplete_ThenMovesTheAnchor()
    {
        await using var world = await CreateWorldAsync();
        var context = world.Context;
        var tt02 = await context.PlatformFrameworks.AsNoTracking().SingleAsync(f => f.Code == PlatformCatalog.Tt02FrameworkCode);
        var withDomain = await new AddPlatformFrameworkDomainUseCase(context, world.Audit).ExecuteAsync(new AddPlatformFrameworkDomainUseCaseInput
        {
            FrameworkId = tt02.Id, Name = "AI trong vận hành doanh nghiệp", Description = "Đặt vai trò, bối cảnh và tiêu chí kiểm tra.",
        });
        var aiDomain = withDomain.Domains.Single(d => d.Name == "AI trong vận hành doanh nghiệp");
        aiDomain.Code.Should().Be("TT02_2025_D7");
        withDomain.DomainCount.Should().Be(7);

        await world.CreateDraftAsync();
        var empty = await world.CheckAsync(2);
        empty.CanPublish.Should().BeFalse("bản nháp chưa có thay đổi");

        var created = await new CreatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader, world.Audit).ExecuteAsync(new CreatePlatformCatalogCourseUseCaseInput
        {
            VersionNo = 2, Code = "ai1-f", Title = "Viết câu lệnh AI cho công việc hằng ngày", DomainId = aiDomain.Id, Level = 1,
        });
        created.Code.Should().Be("AI1-F");
        created.ChangeKind.Should().Be(PlatformCatalog.ChangeKind.New);
        created.CodeEditable.Should().BeTrue();
        created.PricePerSeat.Should().Be(0);
        (await PlatformCatalogReader.ReadCoursesAsync(context)).Should().NotContain(c => c.Code == "AI1-F", "khóa mới chưa công bố");

        var blocked = await world.CheckAsync(2);
        blocked.CanPublish.Should().BeFalse();
        blocked.Items.Where(i => i.Level == PlatformPublishCheck.Block).Select(i => i.Message)
            .Should().Contain(m => m.Contains("kết quả học")).And.Contain(m => m.Contains("đề bài cuối khóa")).And.Contain(m => m.Contains("chưa có mô đun"));
        var refused = () => world.PublishAsync(2);
        (await refused.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("PUBLISH_BLOCKED");

        // Complete the new course: info, final, one module with a text block and two questions.
        var course = created.CourseId;
        await new UpdatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformCatalogCourseUseCaseInput
        {
            VersionNo = 2, CourseId = course, Title = created.Title, DomainId = created.DomainId, Level = 1, PricePerSeat = 150_000,
            SalesStatus = Statuses.PlatformCourseSales.Open, Outcome = "Viết được câu lệnh có vai trò, bối cảnh và tiêu chí kiểm tra cho việc thật.",
        });
        await new UpdatePlatformCourseFinalUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformCourseFinalUseCaseInput
        {
            VersionNo = 2, CourseId = course, Title = "Bài cuối khóa", PromptHtml = "<p>Nộp một câu lệnh bạn đã dùng cho việc thật và kết quả đã kiểm chứng.</p>",
            Criteria = PlatformCatalog.DefaultFinalCriteria.ToList(),
        });
        var withModule = await new AddPlatformCourseModuleUseCase(context, world.Editor, world.Reader)
            .ExecuteAsync(new AddPlatformCourseModuleUseCaseInput { VersionNo = 2, CourseId = course, Title = "Câu lệnh có cấu trúc" });
        var moduleId = withModule.Modules.Single().ModuleId;
        var withBlock = await new AddPlatformModuleBlockUseCase(context, world.Editor, world.Reader)
            .ExecuteAsync(new AddPlatformModuleBlockUseCaseInput { VersionNo = 2, CourseId = course, ModuleId = moduleId, Type = "TEXT" });
        await new UpdatePlatformModuleBlockUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformModuleBlockUseCaseInput
        {
            VersionNo = 2, CourseId = course, BlockId = withBlock.Modules.Single().Blocks.Single().BlockId, BodyHtml = "<p>Vai trò, bối cảnh, định dạng và tiêu chí.</p>",
        });
        foreach (var text in new[] { "Phần nào cho AI biết nó đóng vai ai?", "Tiêu chí kiểm tra đặt ở đâu trong câu lệnh?" })
        {
            await new AddPlatformModuleQuestionUseCase(context, world.Editor, world.Reader).ExecuteAsync(new AddPlatformModuleQuestionUseCaseInput
            {
                VersionNo = 2, CourseId = course, ModuleId = moduleId, Text = text,
                Options = new() { new() { Text = "Đúng", IsCorrect = true }, new() { Text = "Sai" } },
            });
        }

        // Edit a published course too: its new price reaches the mirror only when the draft is published.
        var a1i = await world.CourseIdAsync("A1-I");
        var a1iDraft = await world.CourseAsync(2, a1i);
        var renamePublished = () => new UpdatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformCatalogCourseUseCaseInput
        {
            VersionNo = 2, CourseId = a1i, Code = "A1-I-NEW", Title = a1iDraft.Title, Outcome = a1iDraft.Outcome, DomainId = a1iDraft.DomainId,
            Level = 2, PricePerSeat = 450_000, SalesStatus = Statuses.PlatformCourseSales.Open,
        });
        (await renamePublished.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("CODE_LOCKED", "mã khóa đã công bố không đổi được");
        context.ChangeTracker.Clear();
        await new UpdatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader).ExecuteAsync(new UpdatePlatformCatalogCourseUseCaseInput
        {
            VersionNo = 2, CourseId = a1i, Title = a1iDraft.Title, Outcome = a1iDraft.Outcome, DomainId = a1iDraft.DomainId,
            Level = 2, PricePerSeat = 450_000, SalesStatus = Statuses.PlatformCourseSales.Open,
        });
        (await context.PlatformCourses.AsNoTracking().SingleAsync(c => c.Id == a1i)).PricePerSeat.Should().Be(PlatformCatalog.DefaultIntermediatePrice);

        var ready = await world.CheckAsync(2);
        ready.CanPublish.Should().BeTrue(string.Join(" | ", ready.Items.Select(i => i.Message)));
        ready.ChangedCount.Should().Be(2);
        ready.Items.Should().Contain(i => i.Level == PlatformPublishCheck.Warn && i.Message.Contains("nên có 6 câu"));

        context.ChangeTracker.Clear();
        var published = await world.PublishAsync(2, "Thêm khóa câu lệnh AI, đổi giá A1-I.");
        published.Version.Status.Should().Be(Statuses.PlatformCatalogVersion.Current);
        published.Editable.Should().BeFalse();
        (await context.PlatformCatalogVersions.SingleAsync(v => v.VersionNo == 1)).Status.Should().Be(Statuses.PlatformCatalogVersion.Retired);

        var courses = await PlatformCatalogReader.ReadCoursesAsync(context);
        courses.Should().HaveCount(19);
        courses.Single(c => c.Code == "A1-I").PricePerSeat.Should().Be(450_000);
        courses.Single(c => c.Code == "AI1-F").Should().Match<PlatformCourseItem>(c => c.FrameworkName == tt02.Name && c.DomainName == "AI trong vận hành doanh nghiệp" && c.PricePerSeat == 0 && c.VersionNo == 2);

        var frameworks = await PlatformFrameworkReader.ReadListAsync(context);
        frameworks.CurrentCatalogVersionNo.Should().Be(2);
        frameworks.Items.Single().CoursesByLevel.Should().Equal(7, 6, 6);
    }

    [Fact]
    public async Task RemovingACourse_OnlyWorksForOneAddedInTheDraft()
    {
        await using var world = await CreateWorldAsync();
        await world.CreateDraftAsync();
        var context = world.Context;
        var domainId = (await context.PlatformFrameworkDomains.FirstAsync()).Id;
        var created = await new CreatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader, world.Audit).ExecuteAsync(
            new CreatePlatformCatalogCourseUseCaseInput { VersionNo = 2, Code = "X1-F", Title = "Khóa thử", DomainId = domainId, Level = 1 });
        await new AddPlatformCourseModuleUseCase(context, world.Editor, world.Reader)
            .ExecuteAsync(new AddPlatformCourseModuleUseCaseInput { VersionNo = 2, CourseId = created.CourseId, Title = "Mô đun thử" });

        var remove = new RemovePlatformCatalogCourseUseCase(context, world.Editor, world.Audit);
        var a1f = await world.CourseIdAsync("A1-F");
        var removePublished = () => remove.ExecuteAsync(new RemovePlatformCatalogCourseUseCaseInput { VersionNo = 2, CourseId = a1f });
        (await removePublished.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("COURSE_PUBLISHED");

        var after = await remove.ExecuteAsync(new RemovePlatformCatalogCourseUseCaseInput { VersionNo = 2, CourseId = created.CourseId });
        after.Courses.Should().HaveCount(18).And.NotContain(c => c.Code == "X1-F");
        (await context.PlatformCourses.AnyAsync(c => c.Code == "X1-F")).Should().BeFalse();
        (await context.PlatformCourseModules.AnyAsync(m => m.Title == "Mô đun thử")).Should().BeFalse();
    }

    [Fact]
    public async Task Domains_CanBeAddedRenamedAndDeleted_OnlyWithoutCourses()
    {
        await using var world = await CreateWorldAsync();
        var context = world.Context;
        var tt02 = await context.PlatformFrameworks.AsNoTracking().SingleAsync(f => f.Code == PlatformCatalog.Tt02FrameworkCode);
        var add = new AddPlatformFrameworkDomainUseCase(context, world.Audit);
        var update = new UpdatePlatformFrameworkDomainUseCase(context, world.Audit);
        var archive = new ArchivePlatformFrameworkDomainUseCase(context, world.Audit);

        // Thêm lĩnh vực: the name must be new in the framework
        var added = await add.ExecuteAsync(new AddPlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, Name = "Dữ liệu khách hàng" });
        var domain = added.Domains.Single(d => d.Name == "Dữ liệu khách hàng");
        added.DomainCount.Should().Be(7);
        var addTwice = () => add.ExecuteAsync(new AddPlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, Name = "dữ liệu khách hàng" });
        (await addTwice.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("DUPLICATE_DOMAIN_NAME");

        // Sửa lĩnh vực: the name changes at once, the description goes to the draft
        var renamed = await update.ExecuteAsync(new UpdatePlatformFrameworkDomainUseCaseInput
        {
            FrameworkId = tt02.Id, DomainId = domain.Id, Name = "Khai thác dữ liệu khách hàng", Description = "Đọc dữ liệu khách hàng để ra quyết định bán hàng.",
        });
        var after = renamed.Domains.Single(d => d.Id == domain.Id);
        after.Name.Should().Be("Khai thác dữ liệu khách hàng");
        after.DraftDescription.Should().Be("Đọc dữ liệu khách hàng để ra quyết định bán hàng.");
        after.PublishedDescription.Should().BeEmpty("mô tả mới chỉ công bố cùng khung");
        var d1 = renamed.Domains.Single(d => d.Code == "TT02_D1");
        var clash = () => update.ExecuteAsync(new UpdatePlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, DomainId = domain.Id, Name = d1.Name });
        (await clash.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("DUPLICATE_DOMAIN_NAME");

        // Xóa lĩnh vực: never while a version in use or the draft has courses in it
        var deleteD1 = () => archive.ExecuteAsync(new ArchivePlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, DomainId = d1.Id });
        (await deleteD1.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("DOMAIN_HAS_COURSES");

        await world.CreateDraftAsync();
        var course = await new CreatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader, world.Audit).ExecuteAsync(
            new CreatePlatformCatalogCourseUseCaseInput { VersionNo = 2, Code = "KH-F", Title = "Dữ liệu khách hàng cơ bản", DomainId = domain.Id, Level = 1 });
        var deleteNew = () => archive.ExecuteAsync(new ArchivePlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, DomainId = domain.Id });
        (await deleteNew.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("DOMAIN_HAS_COURSES");

        await new RemovePlatformCatalogCourseUseCase(context, world.Editor, world.Audit)
            .ExecuteAsync(new RemovePlatformCatalogCourseUseCaseInput { VersionNo = 2, CourseId = course.CourseId });
        var deleted = await deleteNew();
        deleted.DomainCount.Should().Be(6);
        deleted.Domains.Should().NotContain(d => d.Id == domain.Id);
        (await context.PlatformFrameworkDomains.AsNoTracking().SingleAsync(d => d.Id == domain.Id)).Status
            .Should().Be(Statuses.PlatformFrameworkDomain.Archived, "xóa lĩnh vực là lưu trữ");

        // A deleted domain takes no course and cannot be edited; its name can be used again
        var placeInDeleted = () => new CreatePlatformCatalogCourseUseCase(context, world.Editor, world.Reader, world.Audit).ExecuteAsync(
            new CreatePlatformCatalogCourseUseCaseInput { VersionNo = 2, Code = "KH-I", Title = "Dữ liệu khách hàng nâng cao", DomainId = domain.Id, Level = 2 });
        (await placeInDeleted.Should().ThrowAsync<BadRequestException>()).Which.Errors.Single().Code.Should().Be("DOMAIN_NOT_FOUND");
        var editDeleted = () => update.ExecuteAsync(new UpdatePlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, DomainId = domain.Id, Name = "Khác" });
        await editDeleted.Should().ThrowAsync<NotFoundException>();
        (await add.ExecuteAsync(new AddPlatformFrameworkDomainUseCaseInput { FrameworkId = tt02.Id, Name = "Khai thác dữ liệu khách hàng" }))
            .DomainCount.Should().Be(7);

        new UpdatePlatformFrameworkDomainUseCaseValidator().Validate(new UpdatePlatformFrameworkDomainUseCaseInput { Name = "A" }).IsValid.Should().BeFalse();
    }
}
