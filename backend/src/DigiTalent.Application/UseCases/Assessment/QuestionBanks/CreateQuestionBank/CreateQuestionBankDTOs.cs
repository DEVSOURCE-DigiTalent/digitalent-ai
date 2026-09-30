namespace DigiTalent.Application.UseCases.Assessment.QuestionBanks;

public class CreateQuestionBankUseCaseInput
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? OwnerUserId { get; set; }
}

public class CreateQuestionBankUseCaseOutput
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
