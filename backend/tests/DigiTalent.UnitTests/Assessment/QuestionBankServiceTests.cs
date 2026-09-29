using DigiTalent.Application.Assessment.DTOs;
using DigiTalent.Application.Assessment.Services;
using DigiTalent.Domain.Entities.Assessment;
using DigiTalent.Shared.Pagination;
using DigiTalent.UnitTests.TestSupport;

namespace DigiTalent.UnitTests.Assessment;

public class QuestionBankServiceTests
{
    private static QuestionBankService CreateService(out DigiTalent.Infrastructure.Persistence.AppDbContext context, out Guid organizationId)
    {
        context = TestDbContextFactory.CreateWithOrganization(out organizationId);
        return new QuestionBankService(context, new FakeCurrentUserService());
    }

    [Fact]
    public async Task CreateQuestionAsync_WithTagIds_AttachesTagsToQuestion()
    {
        var service = CreateService(out var context, out _);

        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        var tag = await service.CreateTagAsync(new CreateQuestionTagRequest { Name = "React", Category = "TOPIC" });

        var question = await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "SINGLE_CHOICE",
            Content = "What hook manages state in React?",
            TagIds = new List<Guid> { tag.Id },
            Options = new List<CreateQuestionOptionRequest>
            {
                new() { Content = "useState", IsCorrect = true, SortOrder = 1 },
                new() { Content = "useRouter", IsCorrect = false, SortOrder = 2 },
            },
        });

        Assert.Single(question.Tags);
        Assert.Equal("React", question.Tags[0].Name);
    }

    [Fact]
    public async Task CreateQuestionAsync_WithUnknownTagId_ThrowsInvalidOperationException()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "Explain dependency injection.",
            TagIds = new List<Guid> { Guid.NewGuid() },
        }));
    }

    [Fact]
    public async Task SearchQuestionsAsync_FilteredByTagId_OnlyReturnsMatchingQuestions()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        var reactTag = await service.CreateTagAsync(new CreateQuestionTagRequest { Name = "React", Category = "TOPIC" });
        var sqlTag = await service.CreateTagAsync(new CreateQuestionTagRequest { Name = "SQL", Category = "TOPIC" });

        await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "React question",
            TagIds = new List<Guid> { reactTag.Id },
        });
        await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "SQL question",
            TagIds = new List<Guid> { sqlTag.Id },
        });

        var result = await service.SearchQuestionsAsync(bank.Id, new PaginationRequest(), reactTag.Id);

        Assert.Single(result.Items);
        Assert.Equal("React question", result.Items[0].Content);
    }

    [Fact]
    public async Task CreateTagAsync_DuplicateNameInSameOrganization_ThrowsInvalidOperationException()
    {
        var service = CreateService(out var context, out _);
        await service.CreateTagAsync(new CreateQuestionTagRequest { Name = "React", Category = "TOPIC" });

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateTagAsync(new CreateQuestionTagRequest { Name = "react", Category = "TOPIC" }));
    }

    [Fact]
    public async Task DeleteQuestionAsync_DraftQuestionNotUsedInAssessment_Succeeds()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        var question = await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "Draft question",
        });

        await service.DeleteQuestionAsync(question.Id);

        Assert.Null(await context.Questions.FindAsync(question.Id));
    }

    [Fact]
    public async Task DeleteQuestionAsync_PublishedQuestion_ThrowsInvalidOperationException()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        var question = await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "Draft question",
        });
        await service.ApproveQuestionAsync(question.Id, new ApprovalRequest());

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteQuestionAsync(question.Id));
    }

    [Fact]
    public async Task DeleteQuestionAsync_QuestionUsedInAssessment_ThrowsInvalidOperationException()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        var question = await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "Draft question",
        });
        context.AssessmentQuestions.Add(new AssessmentQuestion
        {
            AssessmentId = Guid.NewGuid(),
            QuestionId = question.Id,
            ScoreWeight = 1,
            SortOrder = 1,
        });
        await context.SaveChangesAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteQuestionAsync(question.Id));
    }

    [Fact]
    public async Task DeleteBankAsync_BankWithQuestions_ThrowsInvalidOperationException()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "General Bank" });
        await service.CreateQuestionAsync(bank.Id, new CreateQuestionRequest
        {
            QuestionType = "ESSAY",
            Content = "Draft question",
        });

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.DeleteBankAsync(bank.Id));
    }

    [Fact]
    public async Task DeleteBankAsync_EmptyBank_Succeeds()
    {
        var service = CreateService(out var context, out _);
        var bank = await service.CreateBankAsync(new CreateQuestionBankRequest { Title = "Empty Bank" });

        await service.DeleteBankAsync(bank.Id);

        Assert.Null(await context.QuestionBanks.FindAsync(bank.Id));
    }
}
