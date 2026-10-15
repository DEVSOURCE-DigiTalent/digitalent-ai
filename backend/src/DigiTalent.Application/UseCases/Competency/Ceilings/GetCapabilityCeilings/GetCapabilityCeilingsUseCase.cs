using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Competency.Ceilings;

/// <summary>
/// Ma trận trần nhà của tổ chức người gọi (OW-05): trần Digital AI, trần doanh nghiệp, trần từng phòng ban.
/// </summary>
public class GetCapabilityCeilingsUseCase : IUseCase<GetCapabilityCeilingsUseCaseInput, GetCapabilityCeilingsUseCaseOutput>
{
    private readonly ICurrentUser _currentUser;
    private readonly CapabilityCeilingReader _reader;

    public GetCapabilityCeilingsUseCase(ICurrentUser currentUser, CapabilityCeilingReader reader)
    {
        _currentUser = currentUser;
        _reader = reader;
    }

    public Task<GetCapabilityCeilingsUseCaseOutput> ExecuteAsync(GetCapabilityCeilingsUseCaseInput input) =>
        _reader.ReadAsync<GetCapabilityCeilingsUseCaseOutput>(_currentUser.GetRequiredOrganizationId());
}
