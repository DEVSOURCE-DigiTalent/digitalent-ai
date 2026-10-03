using DigiTalent.Application.Common.Authorization;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Application.UseCases.Intelligence.SkillGap.Common;

namespace DigiTalent.Application.UseCases.Intelligence.SkillGap;

/// <summary>Chi tiết 1 snapshot skill gap; nhân viên ngoài phạm vi người gọi → 404.</summary>
public class GetSkillGapRunByIdUseCase : IUseCase<GetSkillGapRunByIdUseCaseInput, SkillGapRunDetail>
{
    private readonly EmployeeScope _employeeScope;
    private readonly SkillGapRunReader _runReader;

    public GetSkillGapRunByIdUseCase(EmployeeScope employeeScope, SkillGapRunReader runReader)
    {
        _employeeScope = employeeScope;
        _runReader = runReader;
    }

    public async Task<SkillGapRunDetail> ExecuteAsync(GetSkillGapRunByIdUseCaseInput input)
    {
        return await _runReader.FindDetailAsync(_employeeScope.VisibleEmployees(), input.RunId)
            ?? throw new NotFoundException($"Skill gap run with ID '{input.RunId}' not found.");
    }
}
