using FluentValidation;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>The content of a review question as the course builder sends it.</summary>
public class PlatformQuestionContentInput
{
    public string? Text { get; set; }
    public string? Explanation { get; set; }
    /// <summary>The block of the same module the learner reopens after a wrong answer.</summary>
    public Guid? BlockId { get; set; }
    /// <summary>2 to 5 options, exactly one correct; null on add = three empty options, the first correct.</summary>
    public List<PlatformOptionInput>? Options { get; set; }
}

public class PlatformOptionInput
{
    public string? Text { get; set; }
    public bool IsCorrect { get; set; }
}

public static class PlatformQuestionRules
{
    public static void Apply<T>(AbstractValidator<T> validator) where T : PlatformQuestionContentInput
    {
        validator.RuleFor(x => x.Text).MaximumLength(1000);
        validator.RuleFor(x => x.Explanation).MaximumLength(1000);
        validator.RuleFor(x => x.Options)
            .Must(o => o == null || o.Count is >= Domain.Constants.PlatformCatalog.MinOptionsPerQuestion and <= Domain.Constants.PlatformCatalog.MaxOptionsPerQuestion)
            .WithMessage("Mỗi câu hỏi có từ 2 đến 5 phương án.")
            .Must(o => o == null || o.Count(x => x.IsCorrect) == 1)
            .WithMessage("Chọn đúng một đáp án đúng.");
        validator.RuleForEach(x => x.Options).ChildRules(option => option.RuleFor(o => o.Text).MaximumLength(500));
    }
}
