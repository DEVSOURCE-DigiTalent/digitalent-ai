namespace DigiTalent.Application.UseCases.Learning;

public class ListCoursesUseCaseInput
{
}

public class ListCoursesUseCaseOutput
{
    public List<CourseCatalogDto> Courses { get; set; } = new();
}

public class CourseCatalogDto
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short? EntryLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool IsEnrolled { get; set; }
    public bool PrerequisitesMet { get; set; }
}
