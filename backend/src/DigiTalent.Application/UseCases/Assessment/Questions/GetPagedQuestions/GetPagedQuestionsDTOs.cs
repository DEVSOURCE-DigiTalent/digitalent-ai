using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Assessment.Questions;

public class GetPagedQuestionsUseCaseInput : PaginationRequest
{
    public Guid BankId { get; set; }
    public Guid? TagId { get; set; }
}

public class QuestionListItemDto
{
    public Guid Id { get; set; }
    public Guid BankId { get; set; }
    public Guid? CompetencyId { get; set; }
    public string QuestionType { get; set; } = string.Empty;
    public string? Difficulty { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Explanation { get; set; }
    public bool AiGeneratedFlag { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
    public List<QuestionTagRefDto> Tags { get; set; } = new();
}

public class GetPagedQuestionsUseCaseOutput : PagedList<QuestionListItemDto>
{
}
