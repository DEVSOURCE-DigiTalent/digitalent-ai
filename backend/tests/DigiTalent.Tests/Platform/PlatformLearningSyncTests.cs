using DigiTalent.Application.UseCases.Learning.Content;
using DigiTalent.Application.UseCases.Platform.Catalog;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Platform;

public class PlatformLearningSyncTests
{
    [Fact]
    public void ImageBlocks_AreEditableSeparately_ButShareTheTextPageInLearning()
    {
        var text = new PlatformModuleBlock { BlockType = "TEXT", SortOrder = 1 };
        var image = new PlatformModuleBlock { BlockType = "IMAGE", SortOrder = 2 };
        var next = new PlatformModuleBlock { BlockType = "TEXT", SortOrder = 3 };
        var video = new PlatformModuleBlock { BlockType = "VIDEO", SortOrder = 4 };
        var pages = PlatformLessonPages.Group([text, image, next, video]);
        pages.Should().HaveCount(3);
        pages[0].Should().Equal(text, image);
        pages[1].Should().Equal(next);
        pages[2].Should().Equal(video);
        PlatformLessonPages.Group([new PlatformModuleBlock { BlockType = "IMAGE", SortOrder = 0 }, text])[0]
            .Select(b => b.BlockType).Should().Equal("IMAGE", "TEXT");
    }

    [Fact]
    public async Task Publication_CopiesActualSlidesQuizAndFinal_WithoutChangingThePreviousEnrollment_AndIsIdempotent()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await PlatformCatalogSeeder.SeedAsync(db);
        var identity = await db.PlatformCourses.SingleAsync(c => c.Code == "A1-F");
        var catalog = await db.PlatformCatalogCourses.SingleAsync(c => c.CourseId == identity.Id);
        catalog.ChangeKind = PlatformCatalog.ChangeKind.Edited;
        catalog.Title = "Học liệu mới từ Admin";
        catalog.FinalTitle = "Đề cuối khóa mới";
        catalog.FinalPrompt = "<p>Đối chiếu ba nguồn và nêu kết luận.</p>";
        catalog.FinalCriteria = "[\"Truy nguồn\",\"Kiểm tra\"]";
        var module = await db.PlatformCourseModules.Where(m => m.CatalogCourseId == catalog.Id).OrderBy(m => m.SortOrder).FirstAsync();
        var sourceQuestion = await db.PlatformModuleQuestions.Where(q => q.ModuleId == module.Id).OrderBy(q => q.SortOrder).FirstAsync();
        sourceQuestion.QuestionText = "Câu hỏi đã sửa trong database?";
        var sourceBlock = await db.PlatformModuleBlocks.Where(b => b.ModuleId == module.Id).OrderBy(b => b.SortOrder).FirstAsync();
        sourceBlock.BlockType = "TEXT";
        sourceBlock.BodyHtml = "<h3>Bài mới</h3><p>Nội dung được công bố.</p>";
        sourceQuestion.BlockId = sourceBlock.Id;
        var illustration = new PlatformAsset { Kind = "IMAGE", StorageKey = "test/slide.png", FileName = "slide.png", ContentType = "image/png", SizeBytes = 50 };
        db.PlatformAssets.Add(illustration);
        // Open a gap in the source positions, then insert a real editable IMAGE after the TEXT.
        var sourceBlocks = await db.PlatformModuleBlocks.Where(b => b.ModuleId == module.Id).OrderBy(b => b.SortOrder).ToListAsync();
        foreach (var b in sourceBlocks) b.SortOrder *= 2;
        db.PlatformModuleBlocks.Add(new PlatformModuleBlock { ModuleId = module.Id, SortOrder = sourceBlock.SortOrder + 1, BlockType = "IMAGE", AssetId = illustration.Id, AltText = "Ảnh được Admin quản lý" });
        var org = Guid.NewGuid();
        var original = new Course { OrganizationId = org, Code = "A1-F", VersionNo = 2, Title = "Bản đã học", Status = Statuses.Course.Published, CreatedByUserId = Guid.NewGuid() };
        db.Courses.Add(original);
        var enrollment = new Enrollment { CourseId = original.Id, EmployeeId = Guid.NewGuid(), Status = Statuses.Enrollment.Completed, ProgressPercent = 100 };
        db.Enrollments.Add(enrollment);
        await db.SaveChangesAsync();

        var publisher = new PlatformLearningPublisher(db);
        await publisher.PublishAsync(catalog.VersionId, original.CreatedByUserId, DateTimeOffset.UtcNow);
        await db.SaveChangesAsync();
        var published = await db.Courses.SingleAsync(c => c.OrganizationId == org && c.VersionNo == 3);
        published.SupersedesCourseId.Should().Be(original.Id);
        published.Title.Should().Be(catalog.Title);
        enrollment.CourseId.Should().Be(original.Id);
        enrollment.ProgressPercent.Should().Be(100);
        var learning = await new PulseModuleReader(db).LoadModulesAsync(new[] { published.Id }, true);
        learning[published.Id][0].Slides[0].ContentBody.Should().Contain("Nội dung được công bố.");
        learning[published.Id][0].Slides.Should().HaveCount(sourceBlocks.Count, "an illustration is not an extra completion step");
        (await db.LearningMaterials.SingleAsync(m => m.LessonId == learning[published.Id][0].Slides[0].LessonId)).ExternalUrl
            .Should().Be($"platform-asset:{illustration.Id:D}");
        var pool = await new PulseQuizReader(db).LoadQuestionsAsync(learning[published.Id][0].QuizAssessmentId!.Value);
        pool.Select(q => q.Content).Should().Contain(sourceQuestion.QuestionText);
        pool.Should().HaveCount(await db.PlatformModuleQuestions.CountAsync(q => q.ModuleId == module.Id));
        pool.Should().OnlyContain(q => q.Options.Count(o => o.IsCorrect) == 1);
        var final = (await new LearningContentReader(db).FinalsAsync(new[] { published.Id }))[published.Id];
        final.Title.Should().Be(catalog.FinalTitle);
        final.PromptHtml.Should().Be(catalog.FinalPrompt);
        final.Criteria.Should().Equal("Truy nguồn", "Kiểm tra");

        await publisher.PublishAsync(catalog.VersionId, original.CreatedByUserId, DateTimeOffset.UtcNow);
        await db.SaveChangesAsync();
        (await db.Courses.CountAsync(c => c.OrganizationId == org)).Should().Be(2);
    }

    [Fact]
    public async Task LegacyM1Organization_KeepsItsCode_WhenPublishingTheA1Catalog()
    {
        await using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        await PlatformCatalogSeeder.SeedAsync(db);
        var identity = await db.PlatformCourses.SingleAsync(c => c.Code == "A1-I");
        var catalog = await db.PlatformCatalogCourses.SingleAsync(c => c.CourseId == identity.Id);
        catalog.ChangeKind = "EDITED";
        var original = new Course { OrganizationId = Guid.NewGuid(), Code = "M1-I", VersionNo = 2, Title = "Cũ", Status = "PUBLISHED", CreatedByUserId = Guid.NewGuid() };
        db.Courses.Add(original);
        await db.SaveChangesAsync();
        await new PlatformLearningPublisher(db).PublishAsync(catalog.VersionId, original.CreatedByUserId, DateTimeOffset.UtcNow);
        await db.SaveChangesAsync();
        (await db.Courses.Where(c => c.OrganizationId == original.OrganizationId).Select(c => c.Code).ToListAsync()).Should().OnlyContain(c => c == "M1-I");
        (await db.Courses.CountAsync(c => c.OrganizationId == original.OrganizationId)).Should().Be(2);
    }
}
