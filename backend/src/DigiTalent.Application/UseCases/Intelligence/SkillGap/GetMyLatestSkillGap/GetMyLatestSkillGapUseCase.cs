using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>
/// Snapshot skill gap mới nhất của chính người gọi (trang My Competency Profile).
/// null khi chưa có snapshot hoặc tài khoản không gắn hồ sơ nhân viên — FE hiện empty state, không phải lỗi.
/// </summary>
public class GetMyLatestSkillGapUseCase : IUseCase<GetMyLatestSkillGapUseCaseInput, SkillGapRunDetail?>
{
    private readonly ICurrentUser _currentUser;
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunReader _runReader;

    public GetMyLatestSkillGapUseCase(ICurrentUser currentUser, EmployeeScope employeeScope, SkillGapRunReader runReader)
    {
        _currentUser = currentUser;
        _employeeScope = employeeScope;
        _runReader = runReader;
    }

    public async Task<SkillGapRunDetail?> ExecuteAsync(GetMyLatestSkillGapUseCaseInput input)
    {
        var employeeId = _currentUser.EmployeeId;
        return employeeId.HasValue
            ? await _runReader.FindLatestDetailAsync(_employeeScope.VisibleEmployees(), employeeId.Value)
            : null;
    }
}
