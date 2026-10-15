using System.Text.Json.Serialization;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class AddPlatformCourseQuestionUseCaseInput
{
    [JsonIgnore]
    public string Code { get; set; } = string.Empty;

    public string QuestionText { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}
