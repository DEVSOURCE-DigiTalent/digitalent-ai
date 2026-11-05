using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Feedbacks;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Feedback;

public class FeedbackTests
{
    private const string Jpeg = "data:image/jpeg;base64,AAAA";

    private static AppDbContext NewContext() =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static ICurrentUser UserOf(Guid userId, Guid? organizationId = null)
    {
        var user = new Mock<ICurrentUser>();
        user.Setup(c => c.UserId).Returns(userId);
        user.Setup(c => c.OrganizationId).Returns(organizationId);
        return user.Object;
    }

    private static CreateFeedbackInput Valid() => new() { Type = "BUG", Title = "Không mở được bài", Description = "Bấm vào bài học không có gì xảy ra." };

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("https://evil.example/track.png")]
    [InlineData("data:text/html;base64,PHNjcmlwdD4=")]
    [InlineData("data:image/svg+xml;base64,PHN2Zz4=")]
    public void Screenshots_RejectAnythingButInlineRasterImages(string screenshot)
    {
        var input = Valid();
        input.Screenshots = new() { screenshot };
        new CreateFeedbackValidator().TestValidate(input).ShouldHaveValidationErrorFor(x => x.Screenshots);
    }

    [Fact]
    public void Screenshots_AreLimitedInCountAndSize_AndInlineImagesPass()
    {
        var validator = new CreateFeedbackValidator();
        var ok = Valid();
        ok.Screenshots = new() { Jpeg, "data:image/png;base64,AAAA", "data:image/webp;base64,AAAA" };
        validator.TestValidate(ok).ShouldNotHaveAnyValidationErrors();

        var tooMany = Valid();
        tooMany.Screenshots = new() { Jpeg, Jpeg, Jpeg, Jpeg };
        validator.TestValidate(tooMany).ShouldHaveValidationErrorFor(x => x.Screenshots);

        var tooBig = Valid();
        tooBig.Screenshots = new() { Jpeg + new string('A', 3_000_000) };
        validator.TestValidate(tooBig).ShouldHaveValidationErrorFor(x => x.Screenshots);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public void Rating_MustBeOneToFive(int rating)
    {
        var input = Valid();
        input.Rating = rating;
        new CreateFeedbackValidator().TestValidate(input).ShouldHaveValidationErrorFor(x => x.Rating);
    }

    [Fact]
    public void Title_OfOnlySpaces_IsRejected()
    {
        var input = Valid();
        input.Title = "          ";
        new CreateFeedbackValidator().TestValidate(input).ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    public void Paging_IsBounded(int pageIndex, int pageSize)
    {
        new GetMyFeedbacksValidator().TestValidate(new GetMyFeedbacksInput { PageIndex = pageIndex, PageSize = pageSize }).IsValid.Should().BeFalse();
        new GetAllFeedbacksValidator().TestValidate(new GetAllFeedbacksInput { PageIndex = pageIndex, PageSize = pageSize }).IsValid.Should().BeFalse();
    }

    [Fact]
    public void AdminNote_LongerThanTheColumn_IsRejected()
    {
        new UpdateFeedbackStatusValidator().TestValidate(new UpdateFeedbackStatusInput { Status = "OPEN", AdminNote = new string('x', 2001) })
            .ShouldHaveValidationErrorFor(x => x.AdminNote);
    }

    [Fact]
    public async Task Create_StoresTheCallerAndTrimmedText_AndMineShowsOnlyTheirOwn()
    {
        await using var context = NewContext();
        var me = Guid.NewGuid();
        var other = Guid.NewGuid();
        var organization = Guid.NewGuid();

        var input = Valid();
        input.Title = "  Không mở được bài  ";
        var created = await new CreateFeedbackUseCase(context, UserOf(me, organization)).ExecuteAsync(input);
        await new CreateFeedbackUseCase(context, UserOf(other, organization)).ExecuteAsync(Valid());

        var stored = await context.UserFeedbacks.AsNoTracking().SingleAsync(f => f.Id == created.Id);
        stored.UserId.Should().Be(me);
        stored.OrganizationId.Should().Be(organization);
        stored.Title.Should().Be("Không mở được bài");
        stored.Status.Should().Be("OPEN");

        var mine = await new GetMyFeedbacksUseCase(context, UserOf(me)).ExecuteAsync(new GetMyFeedbacksInput());
        mine.Items.Should().ContainSingle().Which.Id.Should().Be(created.Id);
        mine.TotalItems.Should().Be(1);
    }

    [Fact]
    public async Task UpdateStatus_RecordsTheResolver_AndReopeningClearsIt()
    {
        await using var context = NewContext();
        var admin = Guid.NewGuid();
        var feedback = new UserFeedback { UserId = Guid.NewGuid(), Type = "BUG", Title = "Không mở được bài", Description = "Bấm vào bài học không có gì xảy ra." };
        context.UserFeedbacks.Add(feedback);
        await context.SaveChangesAsync();
        var update = new UpdateFeedbackStatusUseCase(context, UserOf(admin));

        await update.ExecuteAsync(new UpdateFeedbackStatusInput { Id = feedback.Id, Status = "RESOLVED", AdminNote = "Đã sửa." });
        feedback.ResolvedByUserId.Should().Be(admin);
        feedback.ResolvedAt.Should().NotBeNull();
        feedback.AdminNote.Should().Be("Đã sửa.");

        await update.ExecuteAsync(new UpdateFeedbackStatusInput { Id = feedback.Id, Status = "IN_PROGRESS", AdminNote = "Lỗi quay lại." });
        feedback.ResolvedByUserId.Should().BeNull();
        feedback.ResolvedAt.Should().BeNull();

        var invalid = () => update.ExecuteAsync(new UpdateFeedbackStatusInput { Id = feedback.Id, Status = "DONE" });
        await invalid.Should().ThrowAsync<BadRequestException>();
        var missing = () => update.ExecuteAsync(new UpdateFeedbackStatusInput { Id = Guid.NewGuid(), Status = "OPEN" });
        await missing.Should().ThrowAsync<NotFoundException>();
    }
}
