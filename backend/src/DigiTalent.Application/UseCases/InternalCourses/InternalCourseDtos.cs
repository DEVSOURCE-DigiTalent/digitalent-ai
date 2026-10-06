using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.InternalCourses;

public class GetInternalCoursesInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? Status { get; set; }
}

public class GetInternalCoursesOutput : PagedList<InternalCourseDto> { }

public class InternalCourseDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int ModulesCount { get; set; }
    public int DurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class GetInternalCourseByIdInput
{
    public Guid Id { get; set; }
}

public class CreateInternalCourseInput
{
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int ModulesCount { get; set; }
    public int DurationMinutes { get; set; }
    public string? Status { get; set; }
}

public class UpdateInternalCourseInput
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string? Status { get; set; }
}
