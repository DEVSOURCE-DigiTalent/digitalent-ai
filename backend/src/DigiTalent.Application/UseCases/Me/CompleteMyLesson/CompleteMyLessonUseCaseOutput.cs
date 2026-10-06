namespace DigiTalent.Application.UseCases.Me;

public class CompleteMyLessonUseCaseOutput
{
    public Guid LessonId { get; set; }
    public string LessonStatus { get; set; } = string.Empty;
    public decimal CourseProgressPercent { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;

    /// <summary>Bài kế tiếp theo thứ tự khóa (null = bài cuối).</summary>
    public Guid? NextLessonId { get; set; }

    /// <summary>Đã học đủ bài bắt buộc → mở bài đánh giá cuối khóa.</summary>
    public bool ReadyForAssessment { get; set; }

    /// <summary>Bài đánh giá cuối khóa đang PUBLISHED (nếu có) — FE chuyển tới sau khi học xong.</summary>
    public Guid? FinalAssessmentId { get; set; }
}
