namespace DigiTalent.Application.UseCases.Pulse;

public class RecordPulseProctoringEventsUseCaseOutput
{
    public int Recorded { get; set; }
    /// <summary>Tổng số sự kiện của phiên sau lần ghi này.</summary>
    public int Total { get; set; }
}
