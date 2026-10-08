namespace DigiTalent.Application.UseCases.Me;

public class GetMySkillGapUseCaseOutput
{
    public string? JobPositionName { get; set; }
    public int? RequirementSetVersionNo { get; set; }

    /// <summary>NO_JOB_POSITION | NO_ACTIVE_REQUIREMENT_SET | EMPLOYEE_NOT_ACTIVE — null khi tính được.</summary>
    public string? SkipReason { get; set; }

    public MyCompetencySummaryDto? Summary { get; set; }

    /// <summary>Thời điểm snapshot gần nhất mà HR/Manager đang xem (null = chưa có). Số liệu trang này luôn tính trực tiếp.</summary>
    public DateTimeOffset? LastSnapshotAt { get; set; }

    public DateTimeOffset CalculatedAt { get; set; }
    public List<MySkillGapLineDto> Items { get; set; } = new();
}

public class MySkillGapLineDto : MyCompetencyLineDto
{
    /// <summary>Khóa PUBLISHED dạy năng lực này lên cao hơn mức hiện tại (tối đa 3).</summary>
    public List<MySuggestedCourseDto> SuggestedCourses { get; set; } = new();
}

public class MySuggestedCourseDto
{
    public Guid CourseId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public short TargetLevel { get; set; }
    public int? EstimatedDurationMinutes { get; set; }

    /// <summary>Trạng thái ghi danh của mình (null = chưa ghi danh).</summary>
    public string? EnrollmentStatus { get; set; }
}
