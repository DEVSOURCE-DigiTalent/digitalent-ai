using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Assessment.QuestionBanks;
using DigiTalent.Application.UseCases.Assessment.QuestionTags;
using DigiTalent.Application.UseCases.Assessment.Questions;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Assessment;

public class QuestionBankTests
{
    private static DbContextOptions<AppDbContext> GetOptions(string dbName) =>
        new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

    private static Mock<ICurrentUser> MockCurrentUser(Guid orgId, Guid? userId = null)
    {
        var currentUser = new Mock<ICurrentUser>();
        currentUser.Setup(c => c.GetRequiredOrganizationId()).Returns(orgId);
        currentUser.Setup(c => c.UserId).Returns(userId ?? Guid.NewGuid());
        return currentUser;
    }

    [Fact]
    public async Task CreateQuestionBank_UsesCallerOrganization()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var useCase = new CreateQuestionBankUseCase(context, MockCurrentUser(orgId).Object);

        var result = await useCase.ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });

        var created = await context.QuestionBanks.FindAsync(result.Id);
        created.Should().NotBeNull();
        created!.OrganizationId.Should().Be(orgId);
        created.Status.Should().Be(Statuses.QuestionBank.Active);
    }

    [Fact]
    public async Task CreateQuestionTag_RejectsDuplicateNameInSameOrganization()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);
        var useCase = new CreateQuestionTagUseCase(context, currentUser.Object);

        await useCase.ExecuteAsync(new CreateQuestionTagUseCaseInput { Name = "React", Category = "TOPIC" });

        var action = async () => await useCase.ExecuteAsync(new CreateQuestionTagUseCaseInput { Name = "react", Category = "TOPIC" });
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*already exists*");
    }

    [Fact]
    public async Task CreateQuestion_WithTagIds_AttachesTagsToQuestion()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var tag = await new CreateQuestionTagUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionTagUseCaseInput { Name = "React", Category = "TOPIC" });

        var useCase = new CreateQuestionUseCase(context, currentUser.Object);
        var result = await useCase.ExecuteAsync(new CreateQuestionUseCaseInput
        {
            BankId = bank.Id,
            QuestionType = "SINGLE_CHOICE",
            Content = "What hook manages state in React?",
            TagIds = new List<Guid> { tag.Id },
            Options = new List<CreateQuestionOptionInput>
            {
                new() { Content = "useState", IsCorrect = true, SortOrder = 1 },
                new() { Content = "useRouter", IsCorrect = false, SortOrder = 2 },
            }
        });

        result.Tags.Should().ContainSingle(t => t.Name == "React");
        result.Options.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateQuestion_WithUnknownTagId_ThrowsBadRequestException()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });

        var useCase = new CreateQuestionUseCase(context, currentUser.Object);
        var action = async () => await useCase.ExecuteAsync(new CreateQuestionUseCaseInput
        {
            BankId = bank.Id,
            QuestionType = "ESSAY",
            Content = "Explain dependency injection.",
            TagIds = new List<Guid> { Guid.NewGuid() }
        });

        await action.Should().ThrowAsync<BadRequestException>();
    }

    [Fact]
    public async Task GetPagedQuestions_FilteredByTagId_OnlyReturnsMatchingQuestions()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var reactTag = await new CreateQuestionTagUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionTagUseCaseInput { Name = "React", Category = "TOPIC" });
        var sqlTag = await new CreateQuestionTagUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionTagUseCaseInput { Name = "SQL", Category = "TOPIC" });

        var createQuestion = new CreateQuestionUseCase(context, currentUser.Object);
        await createQuestion.ExecuteAsync(new CreateQuestionUseCaseInput
        {
            BankId = bank.Id, QuestionType = "ESSAY", Content = "React question", TagIds = new List<Guid> { reactTag.Id }
        });
        await createQuestion.ExecuteAsync(new CreateQuestionUseCaseInput
        {
            BankId = bank.Id, QuestionType = "ESSAY", Content = "SQL question", TagIds = new List<Guid> { sqlTag.Id }
        });

        var useCase = new GetPagedQuestionsUseCase(context);
        var result = await useCase.ExecuteAsync(new GetPagedQuestionsUseCaseInput
        {
            BankId = bank.Id, TagId = reactTag.Id, PageIndex = 1, PageSize = 10
        });

        result.Items.Should().ContainSingle();
        result.Items.First().Content.Should().Be("React question");
    }

    [Fact]
    public async Task DeleteQuestion_DraftQuestionNotUsedInAssessment_Succeeds()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var question = await new CreateQuestionUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionUseCaseInput { BankId = bank.Id, QuestionType = "ESSAY", Content = "Draft question" });

        await new DeleteQuestionUseCase(context).ExecuteAsync(new DeleteQuestionUseCaseInput { Id = question.Id });

        (await context.Questions.FindAsync(question.Id)).Should().BeNull();
    }

    [Fact]
    public async Task DeleteQuestion_PublishedQuestion_ThrowsConflictException()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var question = await new CreateQuestionUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionUseCaseInput { BankId = bank.Id, QuestionType = "ESSAY", Content = "Draft question" });
        await new ApproveQuestionUseCase(context).ExecuteAsync(new ApproveQuestionUseCaseInput { Id = question.Id });

        var action = async () => await new DeleteQuestionUseCase(context).ExecuteAsync(new DeleteQuestionUseCaseInput { Id = question.Id });
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*DRAFT*");
    }

    [Fact]
    public async Task DeleteQuestion_UsedInAssessment_ThrowsConflictException()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var question = await new CreateQuestionUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionUseCaseInput { BankId = bank.Id, QuestionType = "ESSAY", Content = "Draft question" });

        context.AssessmentQuestions.Add(new AssessmentQuestion { AssessmentId = Guid.NewGuid(), QuestionId = question.Id, Points = 1, SortOrder = 1 });
        await context.SaveChangesAsync();

        var action = async () => await new DeleteQuestionUseCase(context).ExecuteAsync(new DeleteQuestionUseCaseInput { Id = question.Id });
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*attached to an assessment*");
    }

    [Fact]
    public async Task DeleteQuestionBank_WithQuestions_ThrowsConflictException()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        await new CreateQuestionUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionUseCaseInput { BankId = bank.Id, QuestionType = "ESSAY", Content = "Draft question" });

        var action = async () => await new DeleteQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new DeleteQuestionBankUseCaseInput { Id = bank.Id });
        await action.Should().ThrowAsync<ConflictException>().WithMessage("*still contains questions*");
    }

    [Fact]
    public async Task ApproveQuestion_DraftToPublished_Succeeds()
    {
        using var context = new AppDbContext(GetOptions(Guid.NewGuid().ToString()));
        var orgId = Guid.NewGuid();
        var currentUser = MockCurrentUser(orgId);

        var bank = await new CreateQuestionBankUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionBankUseCaseInput { Title = "General Bank" });
        var question = await new CreateQuestionUseCase(context, currentUser.Object)
            .ExecuteAsync(new CreateQuestionUseCaseInput { BankId = bank.Id, QuestionType = "ESSAY", Content = "Draft question" });

        var result = await new ApproveQuestionUseCase(context).ExecuteAsync(new ApproveQuestionUseCaseInput { Id = question.Id });

        result.Status.Should().Be(Statuses.Question.Published);
    }
}
