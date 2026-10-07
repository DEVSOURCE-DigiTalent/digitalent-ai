using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.JobArchitecture.Grades;

/// <summary>
/// Grade scale G1..G3 of the caller's organization (OW-12 "Cấu hình cấp bậc", grade filters and labels).
/// </summary>
public class GetJobGradesUseCase : IUseCase<GetJobGradesUseCaseInput, GetJobGradesUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetJobGradesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetJobGradesUseCaseOutput> ExecuteAsync(GetJobGradesUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var output = new GetJobGradesUseCaseOutput();
        output.AddRange(await JobGradeReader.ReadAsync(_context, organizationId));
        return output;
    }
}
