namespace DigiTalent.Application.UseCases.Me;

public class SaveMyAttemptAnswersUseCaseOutput
{
    public int SavedCount { get; set; }
    public DateTimeOffset? Deadline { get; set; }
    public DateTimeOffset ServerNow { get; set; }
}
