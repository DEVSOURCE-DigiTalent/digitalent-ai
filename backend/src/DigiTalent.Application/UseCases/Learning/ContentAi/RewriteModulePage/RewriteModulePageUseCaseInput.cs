namespace DigiTalent.Application.UseCases.Learning.ContentAi;

public class RewriteModulePageUseCaseInput : ModuleContentAiInput
{
    /// <summary>1-based number of the page among <see cref="ModuleContentAiInput.Lessons"/>.</summary>
    public int PageNumber { get; set; }

    /// <summary>What to fix, usually the notes of the last check for this page.</summary>
    public List<string> Notes { get; set; } = new();
}
