namespace DigiTalent.Application.UseCases.Platform.Organizations;

public class PlatformOrganizationSeatItem
{
    public string CourseCode { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public int SeatsPurchased { get; set; }
    public int SeatsGranted { get; set; }
}
