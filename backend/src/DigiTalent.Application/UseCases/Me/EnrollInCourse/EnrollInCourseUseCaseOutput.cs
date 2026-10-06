namespace DigiTalent.Application.UseCases.Me;

public class EnrollInCourseUseCaseOutput
{
    public Guid EnrollmentId { get; set; }
    public Guid CourseId { get; set; }
    public string Status { get; set; } = string.Empty;
}
