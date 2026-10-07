using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Me;

/// <summary>
/// EM-09 — Danh sách bài đánh giá: bài PUBLISHED (bản mới nhất) của các khóa mình đang ghi danh,
/// kèm trạng thái có thể làm / đang làm / đã đạt / làm lại / khóa (chưa học xong) / hết lượt.
/// </summary>
public class GetMyAssessmentsUseCase : IUseCase<GetMyAssessmentsUseCaseInput, GetMyAssessmentsUseCaseOutput>
{
    private readonly MyEmployeeContext _me;
    private readonly MyAssessmentService _assessments;

    public GetMyAssessmentsUseCase(MyEmployeeContext me, MyAssessmentService assessments)
    {
        _me = me;
        _assessments = assessments;
    }

    public async Task<GetMyAssessmentsUseCaseOutput> ExecuteAsync(GetMyAssessmentsUseCaseInput input)
    {
        var employee = await _me.GetAsync();
        var visible = await _assessments.LoadVisibleAsync(employee);
        var items = (await _assessments.BuildStatesAsync(visible, DateTimeOffset.UtcNow))
            .Select(MyAssessmentCardDto.From)
            .ToList();

        return new GetMyAssessmentsUseCaseOutput
        {
            Items = items,
            Summary = new MyAssessmentSummaryDto
            {
                Total = items.Count,
                Available = items.Count(i => i.Status == MyAssessmentStatus.Available),
                InProgress = items.Count(i => i.Status == MyAssessmentStatus.InProgress),
                Passed = items.Count(i => i.Status == MyAssessmentStatus.Passed),
                Retake = items.Count(i => i.Status == MyAssessmentStatus.Retake),
                Locked = items.Count(i => i.Status is MyAssessmentStatus.Locked or MyAssessmentStatus.NoAttemptsLeft),
            },
        };
    }
}
