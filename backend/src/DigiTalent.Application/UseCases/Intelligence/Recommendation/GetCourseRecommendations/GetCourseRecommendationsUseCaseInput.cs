namespace DigiTalent.Application.UseCases.Intelligence.Recommendation;

public class GetCourseRecommendationsUseCaseInput
{
    /// <summary>Mặc định: chính người gọi. Nhân viên khác phải nằm trong phạm vi (HR: tổ chức, DM: phòng ban).</summary>
    public Guid? EmployeeId { get; set; }

    public int Limit { get; set; } = 10;
}
