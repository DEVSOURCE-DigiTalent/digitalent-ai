using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

public class GetPagedQuestionBanksUseCaseInput : PaginationRequest
{
}

public class QuestionBankListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class GetPagedQuestionBanksUseCaseOutput : PagedList<QuestionBankListItemDto>
{
}
