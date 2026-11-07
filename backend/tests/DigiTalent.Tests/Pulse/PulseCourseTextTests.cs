using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Pulse;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.AI;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DigiTalent.Tests.Pulse;

/// <summary>The AI reviewer of course finals and pre-assessments also reads the lessons of the course version.</summary>
public class PulseCourseTextTests
{
    private static readonly string Active = Statuses.CourseContent.Active;

    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static CourseModule Module(Guid courseId, string title, int order, string? status = null) =>
        new() { CourseId = courseId, Code = title, Title = title, SortOrder = order, IsRequired = true, Status = status ?? Active };

    private static Lesson Lesson(Guid moduleId, string title, string? body, int order, string? status = null) =>
        new() { ModuleId = moduleId, Code = title, Title = title, LessonType = "TEXT", ContentBody = body, SortOrder = order, CompletionRule = "VIEW", Status = status ?? Active };

    [Fact]
    public async Task Text_FollowsModuleAndLessonOrder_StripsHtml_AndSkipsInactiveContent()
    {
        await using var context = NewContext();
        var course = Guid.NewGuid();
        var other = Guid.NewGuid();
        var second = Module(course, "Đánh giá nguồn", 2);
        var first = Module(course, "Tìm kiếm bằng từ khóa", 1);
        var archived = Module(course, "Mô đun cũ", 3, "ARCHIVED");
        context.CourseModules.AddRange(second, first, archived, Module(other, "Khóa khác", 1));
        context.Lessons.AddRange(
            Lesson(first.Id, "Rút gọn câu hỏi", "<h3>Từ khóa</h3><p>Dùng <strong>2–4 từ khóa</strong> &amp; tên riêng.</p>", 1),
            Lesson(second.Id, "Đuôi tên miền", "<p>.gov.vn là cơ quan nhà nước.</p>", 2),
            Lesson(second.Id, "Slide bài giảng", null, 1),
            Lesson(second.Id, "Bài đã gỡ", "<p>Không được gửi.</p>", 3, "ARCHIVED"),
            Lesson(archived.Id, "Trong mô đun cũ", "<p>Không được gửi.</p>", 1));
        await context.SaveChangesAsync();

        var text = (await PulseCourseText.LoadAsync(context, new[] { course }))[course];

        text.Should().Be(
            "Mô đun 1: Tìm kiếm bằng từ khóa\n"
            + "- Rút gọn câu hỏi: Từ khóa Dùng 2–4 từ khóa & tên riêng.\n"
            + "Mô đun 2: Đánh giá nguồn\n"
            + "- Slide bài giảng\n"
            + "- Đuôi tên miền: .gov.vn là cơ quan nhà nước.");
        text.Should().NotContain("Không được gửi").And.NotContain("Khóa khác").And.NotContain("<");
    }

    [Fact]
    public async Task LongCourse_IsCutToTheLimit_WithANote()
    {
        await using var context = NewContext();
        var course = Guid.NewGuid();
        var module = Module(course, "Mô đun dài", 1);
        context.CourseModules.Add(module);
        context.Lessons.Add(Lesson(module.Id, "Bài dài", new string('a', 500), 1));
        await context.SaveChangesAsync();

        var text = (await PulseCourseText.LoadAsync(context, new[] { course }, maxChars: 100))[course];

        text.Should().HaveLength(100 + PulseCourseText.TruncatedNote.Length).And.EndWith(PulseCourseText.TruncatedNote);
    }

    [Fact]
    public void Prompt_CarriesTheCourseText_OnlyWhenThereIsSome()
    {
        var criteria = new[] { "3 nguồn có đánh giá độ tin cậy" };

        var withCourse = GeminiService.EvidencePrompt("Bài làm", "<p>Đề bài</p>", criteria, null, "Mô đun 1: Đánh giá nguồn");
        withCourse.Should().Contain("NỘI DUNG KHÓA HỌC").And.Contain("Mô đun 1: Đánh giá nguồn").And.Contain("Đối chiếu bài nộp với NỘI DUNG KHÓA HỌC");
        withCourse.IndexOf("NỘI DUNG KHÓA HỌC", StringComparison.Ordinal).Should().BeLessThan(withCourse.IndexOf("BÀI NỘP CỦA NHÂN VIÊN", StringComparison.Ordinal));

        var without = GeminiService.EvidencePrompt("Bài làm", "<p>Đề bài</p>", criteria, null, null);
        without.Should().NotContain("NỘI DUNG KHÓA HỌC").And.Contain("ĐỀ BÀI:\nĐề bài").And.Contain("1. 3 nguồn có đánh giá độ tin cậy");
    }
}
