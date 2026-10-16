namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseOverviewUseCaseOutput
{
    public PulsePersonDto Person { get; set; } = new();
    /// <summary>Người đánh giá quá trình học (chấm bài đánh giá trước khi học và bài cuối khóa).</summary>
    public PulseReviewerDto? Reviewer { get; set; }
    public bool HasPosition { get; set; }
    /// <summary>Có ít nhất một lĩnh vực trong lộ trình (mục tiêu vị trí và trần phòng ban đều ≥ Cơ bản).</summary>
    public bool HasTargets { get; set; }
    public List<PulseDomainDto> Domains { get; set; } = new();
    public List<PulseCourseSummaryDto> Courses { get; set; } = new();
    /// <summary>Việc nên làm tiếp đầu tiên (= NextSteps[0]).</summary>
    public PulseCourseSummaryDto? NextCourse { get; set; }
    /// <summary>Tối đa ba việc nên làm tiếp: nộp bài cuối, học tiếp, làm bài đánh giá, bắt đầu học.</summary>
    public List<PulseCourseSummaryDto> NextSteps { get; set; } = new();
    /// <summary>Khóa được công nhận gần nhất (bài đánh giá trước khi học hoặc bài cuối khóa).</summary>
    public PulseLatestOutcomeDto? LatestOutcome { get; set; }
    public PulseOverviewStatsDto Stats { get; set; } = new();
}

public class PulseOverviewStatsDto
{
    /// <summary>Lĩnh vực có khoảng cách đã đo (mức đã xác nhận ≥ 1 và thấp hơn đỉnh lộ trình).</summary>
    public int GapCount { get; set; }
    /// <summary>Lĩnh vực trong lộ trình chưa có mức xác nhận.</summary>
    public int PendingCount { get; set; }
    public int TargetDomainCount { get; set; }
    public int MetCount { get; set; }
    /// <summary>Số năng lực thành phần vị trí yêu cầu (bộ ACTIVE).</summary>
    public int RequiredCompetencies { get; set; }
    /// <summary>Khóa trong lộ trình (Cơ bản → min(mục tiêu, trần)).</summary>
    public int PathCourses { get; set; }
    public int ApprovedPathCourses { get; set; }
    /// <summary>Khóa cao hơn mục tiêu vị trí nhưng trong trần phòng ban.</summary>
    public int OptionalCourses { get; set; }
    /// <summary>Khóa vị trí yêu cầu tới nhưng cao hơn trần phòng ban.</summary>
    public int AboveCeilingCourses { get; set; }
    public int LearningCourses { get; set; }
    /// <summary>Bài đánh giá trước khi học đang mở trong lộ trình.</summary>
    public int PreAssessmentsOpen { get; set; }
    /// <summary>Khóa có lượt học (được giao / đang học / đã xong).</summary>
    public int AssignedCourses { get; set; }
    public int ApprovedCourses { get; set; }
    /// <summary>Bài đang chờ chấm (bài đánh giá trước khi học + bài cuối khóa).</summary>
    public int InReview { get; set; }
}
