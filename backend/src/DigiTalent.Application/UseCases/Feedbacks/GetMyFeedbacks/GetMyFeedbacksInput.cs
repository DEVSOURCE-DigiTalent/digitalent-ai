namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetMyFeedbacksInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    /// <summary>BUG, FEEDBACK or SUGGESTION; empty = every type (the Góp ý and Báo lỗi pages each ask for one).</summary>
    public string? Type { get; set; }

    /// <summary>OPEN, IN_PROGRESS, RESOLVED or CLOSED; empty = every status.</summary>
    public string? Status { get; set; }
}
