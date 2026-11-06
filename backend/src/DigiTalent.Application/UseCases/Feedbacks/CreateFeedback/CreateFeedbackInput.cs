namespace DigiTalent.Application.UseCases.Feedbacks;

public class CreateFeedbackInput
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PageUrl { get; set; }
    public int? Rating { get; set; }
    public List<string>? Screenshots { get; set; }
}

public class CreateFeedbackOutput
{
    public Guid Id { get; set; }
}
