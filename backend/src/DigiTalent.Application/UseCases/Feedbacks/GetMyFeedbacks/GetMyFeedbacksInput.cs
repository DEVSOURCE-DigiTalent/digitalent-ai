namespace DigiTalent.Application.UseCases.Feedbacks;

public class GetMyFeedbacksInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
