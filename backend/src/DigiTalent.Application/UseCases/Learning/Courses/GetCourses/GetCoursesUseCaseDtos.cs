namespace DigiTalent.Application.UseCases.Learning.Courses;

public class GetCoursesUseCaseInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public short? EntryLevel { get; set; }
    public short? Level { get; set; }
    public Guid? CategoryId { get; set; }
}

public class CourseListItem
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int Level { get; set; }
    public short? EntryLevel { get; set; }
    public int Modules { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public Guid? PrerequisiteCourseId { get; set; }
    public string? PrerequisiteTitle { get; set; }
    public string Status { get; set; } = string.Empty;
    public int AssignedCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    /// <summary>Price of the course for the whole organization (current catalog version); 0 for Basic.</summary>
    public long Price { get; set; }
    /// <summary>The organization bought this paid course (once, for every employee).</summary>
    public bool IsPurchased { get; set; }
    /// <summary>Every employee may learn it: a free Basic course or a paid course the organization bought.</summary>
    public bool HasLicense => IsPurchased || !DigiTalent.Application.Common.CourseOwnership.IsPaid(Code);
}

public class GetCoursesUseCaseOutput
{
    public List<CourseListItem> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalItems / PageSize) : 0;
}
