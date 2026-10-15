using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.Platform.Catalog;

/// <summary>What blocks the draft from being published and what is advised, before the admin confirms.</summary>
public class GetPlatformCatalogPublishCheckUseCase : IUseCase<GetPlatformCatalogPublishCheckUseCaseInput, PlatformPublishCheck>
{
    private readonly PlatformCatalogEditor _editor;
    private readonly PlatformPublishChecker _checker;

    public GetPlatformCatalogPublishCheckUseCase(PlatformCatalogEditor editor, PlatformPublishChecker checker)
    {
        _editor = editor;
        _checker = checker;
    }

    public async Task<PlatformPublishCheck> ExecuteAsync(GetPlatformCatalogPublishCheckUseCaseInput input) =>
        await _checker.CheckAsync(await _editor.DraftAsync(input.VersionNo));
}
