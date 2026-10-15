using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Courses;

public class GetPlatformCourseDetailUseCase : IUseCase<GetPlatformCourseDetailUseCaseInput, PlatformCourseDetailOutput>
{
    private readonly IApplicationDbContext _context;

    public GetPlatformCourseDetailUseCase(IApplicationDbContext context) => _context = context;

    public Task<PlatformCourseDetailOutput> ExecuteAsync(GetPlatformCourseDetailUseCaseInput input) =>
        PlatformCourseDetailOutput.ReadAsync(_context, input.Code);
}
