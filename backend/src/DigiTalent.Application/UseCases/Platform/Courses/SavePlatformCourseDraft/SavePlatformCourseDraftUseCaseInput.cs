using DigiTalent.Domain.Constants;
using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class SavePlatformCourseDraftUseCaseInput
{
    [JsonIgnore]
    public string Code { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Outcome { get; set; } = string.Empty;
    public long PricePerSeat { get; set; }
    public string SalesStatus { get; set; } = Statuses.PlatformCourseSales.Open;
}
