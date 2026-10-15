namespace DigiTalent.Application.UseCases.Platform.Courses;

public class PlatformCourseQuestionItem
{
    public Guid Id { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
