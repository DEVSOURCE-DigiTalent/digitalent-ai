using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Learning.CourseUpdates;

/// <summary>The caller's organization: the version it learns from, the newest one and what applying it changes.</summary>
public class GetCourseUpdatesUseCase : IUseCase<GetCourseUpdatesUseCaseInput, CourseUpdatesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCourseUpdatesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public Task<CourseUpdatesOutput> ExecuteAsync(GetCourseUpdatesUseCaseInput input) =>
        CourseUpdateReader.ReadAsync(_context, _currentUser.GetRequiredOrganizationId(), _currentUser.UserId);
}
