namespace DigiTalent.Application.UseCases.Pulse;

public class GetPulseFinalReviewsUseCaseInput
{
    /// <summary>Bao gồm cả các bài đã hoàn tất thẩm định (APPROVED / NOT_YET) để mentor hoặc quản lý tra cứu lại.</summary>
    public bool IncludeReviewed { get; set; }
    /// <summary>Tùy chọn lọc hàng chờ theo một doanh nghiệp cụ thể.</summary>
    public Guid? OrganizationId { get; set; }
    public Guid? DepartmentId { get; set; }
    /// <summary>Bỏ qua cache AI để gọi phân tích mới từ Gemini.</summary>
    public bool RefreshAi { get; set; }
    /// <summary>Chỉ định 1 bài cụ thể khi RefreshAi = true (để trống = làm mới toàn bộ bài PENDING).</summary>
    public Guid? RefreshSubmissionId { get; set; }
    public string? EvidenceMetric { get; set; }
    /// <summary>Tùy chọn phân trang (1-based) để tránh tải toàn bộ hàng chờ lớn cùng lúc.</summary>
    public int? Page { get; set; }
    public int? PageSize { get; set; }
    /// <summary>Bỏ qua phần đánh giá AI (dùng cho màn hình danh sách doanh nghiệp chỉ cần tóm tắt hàng chờ).</summary>
    public bool SkipAi { get; set; }
}
