namespace DigiTalent.Application.UseCases.Platform.SignDictionary;

/// <summary>The same text and kind filters as the list, so the tab counts match what the list shows.</summary>
public class GetSignGlossSummaryUseCaseInput
{
    public string? Search { get; set; }
    /// <summary>WORD / LETTER / DIGIT / TONE; empty = every kind.</summary>
    public string? Kind { get; set; }
}
