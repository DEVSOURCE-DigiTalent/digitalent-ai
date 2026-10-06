using DigiTalent.Application.Common.Models;

namespace DigiTalent.Application.UseCases.RecommendationReviews;

public class GetRecommendationReviewsInput
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Status { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? JobPositionId { get; set; }
}

public class GetRecommendationReviewsOutput : PagedList<RecommendationReviewRow> { }

public class RecommendationReviewRow
{
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? PositionName { get; set; }
    public Guid CourseId { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public int GapsClosed { get; set; }
    public int MandatoryClosed { get; set; }
    public int HighClosed { get; set; }
    public string Explanation { get; set; } = string.Empty;
    public List<string> Reasons { get; set; } = new();
    public string? EnrollmentStatus { get; set; }
    public string Status { get; set; } = "PENDING";
    public string? DecisionReason { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public string? DecidedByName { get; set; }
}

public class AcceptReviewInput
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public string? DueDate { get; set; }
}

public class DismissReviewInput
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class ReopenReviewInput
{
    public Guid EmployeeId { get; set; }
    public Guid CourseId { get; set; }
}

public class ReviewActionOutput
{
    public string Status { get; set; } = string.Empty;
}
