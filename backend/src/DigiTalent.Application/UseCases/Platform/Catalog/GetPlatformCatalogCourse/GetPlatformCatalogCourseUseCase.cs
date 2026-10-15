using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>
/// The whole content of a course in a version — info, modules with their blocks and review questions, final
/// assessment. Editable only in the draft; published versions are read as they were published.
/// </summary>
public class GetPlatformCatalogCourseUseCase : IUseCase<GetPlatformCatalogCourseUseCaseInput, PlatformCatalogCourseDetail>
{
    private readonly PlatformCourseContentReader _reader;

    public GetPlatformCatalogCourseUseCase(PlatformCourseContentReader reader) => _reader = reader;

    public Task<PlatformCatalogCourseDetail> ExecuteAsync(GetPlatformCatalogCourseUseCaseInput input) =>
        _reader.ReadAsync(input.VersionNo, input.CourseId);
}
