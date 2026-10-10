namespace DigiTalent.Application.UseCases.Learning;

public class EnrollInCourseUseCaseInput
{
    public Guid CourseId { get; set; }
}

public class EnrollInCourseUseCaseOutput
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}
