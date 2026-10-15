namespace DigiTalent.Application.UseCases.Platform.Common;

public class PlatformCourseDraft
{
    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = string.Empty;
}
