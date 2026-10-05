using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.Services.Intelligence.Recommendation;

namespace DigiTalent.Application.UseCases.Intelligence.Recommendation;

/// <summary>
/// Gợi ý khóa học từ snapshot skill gap mới nhất (spec §5) — tính trực tiếp, không lưu.
/// Khóa ứng viên: PUBLISHED, version mới nhất theo code, dạy năng lực đang thiếu; loại khóa đã COMPLETED.
/// Danh sách rỗng luôn kèm Reason để FE hiển thị đúng thông điệp.
/// </summary>
public class GetCourseRecommendationsUseCase : IUseCase<GetCourseRecommendationsUseCaseInput, GetCourseRecommendationsUseCaseOutput>
{
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly RecommendationWeightsProvider _weightsProvider;
    private readonly EmployeeRecommendationService _recommendationService;

    public GetCourseRecommendationsUseCase(
        ICurrentUser currentUser,
        EmployeeScope employeeScope,
        RecommendationWeightsProvider weightsProvider,
        EmployeeRecommendationService recommendationService)
    {
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _weightsProvider = weightsProvider;
        _recommendationService = recommendationService;
    }

    public async Task<GetCourseRecommendationsUseCaseOutput> ExecuteAsync(GetCourseRecommendationsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var weights = await _weightsProvider.GetAsync(organizationId);
        var output = new GetCourseRecommendationsUseCaseOutput { ScoringConfigVersion = weights.Version };

        var employeeId = input.EmployeeId ?? _currentUser.EmployeeId;
        if (employeeId == null)
        {
            return WithReason(output, RecommendationEmptyReasons.NoEmployeeProfile);
        }

        var employee = await _employeeScope.GetVisibleEmployeeAsync(employeeId.Value);
        output.EmployeeId = employee.Id;

        var result = await _recommendationService.RecommendAsync(organizationId, employee.Id, weights, input.Limit);
        output.SkillGapRunId = result.SkillGapRunId;
        output.GeneratedAt = result.GeneratedAt;
        if (result.EmptyReason != null)
        {
            return WithReason(output, result.EmptyReason);
        }

        output.Items = result.Items.Select(ToDto).ToList();
        return output;
    }

    private static GetCourseRecommendationsUseCaseOutput WithReason(GetCourseRecommendationsUseCaseOutput output, string reason)
    {
        output.Reason = reason;
        return output;
    }

    private static CourseRecommendationDto ToDto(RankedCourse ranked) => new()
    {
        CourseId = ranked.Course.CourseId,
        CourseCode = ranked.Course.Code,
        Title = ranked.Course.Title,
        EstimatedDurationMinutes = ranked.Course.EstimatedDurationMinutes,
        EntryLevel = ranked.Course.EntryLevel,
        EnrollmentStatus = ranked.Course.EnrollmentStatus,
        Score = ranked.Score,
        Breakdown = new RecommendationBreakdownDto
        {
            GapPriorityCoverage = ranked.Breakdown.GapPriorityCoverage,
            MandatoryCoverage = ranked.Breakdown.MandatoryCoverage,
            EntryLevelFit = ranked.Breakdown.EntryLevelFit,
        },
        Reasons = ranked.Reasons.Select(r => new RecommendationReasonDto
        {
            CompetencyId = r.CompetencyId,
            CompetencyName = r.CompetencyName,
            CurrentLevel = r.CurrentLevel,
            RequiredLevel = r.RequiredLevel,
            CourseTargetLevel = r.CourseTargetLevel,
            CoverageType = r.CoverageType,
            ClosesSteps = r.ClosesSteps,
            Mandatory = r.Mandatory,
            Severity = r.Severity,
        }).ToList(),
        Explanation = ranked.Explanation,
        Warnings = ranked.Warnings.ToList(),
    };
}
